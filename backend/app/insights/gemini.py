"""Personalized insights via Google Gemini on Vertex AI.

Design principle: **graceful degradation**. The public entry point,
``generate_insights``, attempts a Gemini call when enabled and *always* falls
back to the deterministic rule-based engine on any error (disabled flag, missing
credentials, network/quota failure, malformed response). The platform therefore
never fails to give the user advice, and every code path is testable without GCP
by toggling settings or patching ``_call_gemini``.

Authentication uses Application Default Credentials (the Cloud Run service
account in production) — there is no API key in the codebase.
"""

from __future__ import annotations

import json
import logging

from app.carbon.engine import resolve_location_context
from app.config import Settings
from app.insights.rules import generate_rule_based_insights
from app.models import (
    CarbonInput,
    FootprintResult,
    InsightsResponse,
    Recommendation,
)

logger = logging.getLogger(__name__)

_SYSTEM_INSTRUCTION = (
    "You are an expert carbon footprint analyst for South Asian and global contexts.\n"
    "Generate hyper-personalized reduction advice. Rules:\n"
    "- Address the user's LARGEST emission category first\n"
    "- For India users: reference Indian Railways, metro, local diet "
    "(dal, rajma, paneer alternatives), PM-KUSUM solar scheme\n"
    "- DO NOT compute any carbon numbers yourself. You will be provided with "
    "pre-computed, exact mathematical recommendations. You MUST select 3 of these "
    "recommendations and rewrite their 'action' text to be highly motivational and "
    "personalized, but you MUST keep the exact 'category', 'saving_kg_co2', and "
    "'difficulty' numbers provided to you.\n"
    "- Tone: data-driven, specific, encouraging\n"
    "- Return ONLY this exact JSON, no markdown:\n"
    '{"summary": "<2 sentences mentioning total_kg and largest_category>",'
    '"comparison": "<1 sentence vs regional benchmark AND global 4.8t>",'
    '"recommendations": [{"action": "<specific, references user actual numbers>",'
    '"category": "<transport|diet|home|consumption>",'
    '"saving_kg_co2": <integer>,'
    '"difficulty": "<easy|medium|hard>"}]}\n'
    "Exactly 3 recommendations, ordered by saving_kg_co2 descending."
)




def _build_prompt(data: CarbonInput, result: FootprintResult) -> str:
    """Build the user message with full LocationContext injected."""
    ctx = result.location_context
    total_t = result.total_annual_tonnes

    vs_benchmark_pct = round(
        ((total_t - ctx.benchmark_t) / ctx.benchmark_t) * 100, 1
    ) if ctx.benchmark_t > 0 else 0.0
    vs_global_pct = round(
        ((total_t - 4.8) / 4.8) * 100, 1
    )

    breakdown_lines = []
    for cat, kg in result.breakdown_kg.items():
        marker = " ← LARGEST" if cat == result.largest_category else ""
        breakdown_lines.append(f"  {cat}: {kg:,.0f} kg{marker}")

    return (
        f"Location: {data.location}\n"
        f"Region: {ctx.region} | {ctx.benchmark_label}: {ctx.benchmark_t}t/year\n"
        f"Grid factor: {ctx.grid_factor} kgCO₂/kWh\n"
        f"Local transport: {ctx.local_transport_tip}\n\n"
        f"Annual footprint: {result.total_annual_kg:,.0f} kg ({total_t}t)\n"
        f"  vs {ctx.benchmark_label} ({ctx.benchmark_t}t): {vs_benchmark_pct:+.1f}%\n"
        f"  vs global average (4.8t): {vs_global_pct:+.1f}%\n\n"
        f"Breakdown:\n"
        + "\n".join(breakdown_lines)
        + f"\n\nTransport: {data.transport.car_km_per_week} km/wk by "
        f"{data.transport.car_fuel.value}, "
        f"{data.transport.short_haul_flights_per_year} short + "
        f"{data.transport.long_haul_flights_per_year} long flights\n"
        f"Diet: {data.diet.value}\n"
        f"Energy: {data.home.electricity_kwh_per_month} kWh/month electricity, "
        f"{data.home.natural_gas_kwh_per_month} kWh/month gas\n"
        f"Household: {data.home.household_size} people\n\n"
        f"PRE-COMPUTED RECOMMENDATIONS (You MUST use these exact categories and saving_kg_co2 values, but rewrite the action text to be more personal):\n"
        + "\n".join(
            f"- Category: {r.category}, Saving: {int(r.estimated_annual_savings_kg)} kg, Difficulty: {r.difficulty}, Base Action: {r.action}"
            for r in generate_rule_based_insights(data, result).recommendations
        )
    )


def _call_gemini(
    data: CarbonInput, result: FootprintResult, settings: Settings
) -> InsightsResponse:
    """Invoke Gemini on Vertex AI and parse a structured response.

    Imported lazily so the SDK/credentials are only required when actually used —
    keeps unit tests and the rule-based path dependency-free.
    """
    from google import genai
    from google.genai import types

    # Initialize with API key instead of Vertex AI (no ADC required)
    client = genai.Client(api_key=settings.gemini_api_key)
    
    response = client.models.generate_content(
        model=settings.gemini_model,
        contents=_build_prompt(data, result),
        config=types.GenerateContentConfig(
            system_instruction=_SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            temperature=0.4,
            max_output_tokens=4096,
        ),
    )
    payload = json.loads(response.text)
    recommendations = [
        Recommendation(
            category=str(r["category"]),
            action=str(r["action"]),
            estimated_annual_savings_kg=float(r.get("saving_kg_co2", 0)),
            difficulty=str(r.get("difficulty", "medium")),
        )
        for r in payload.get("recommendations", [])
    ]
    if not recommendations:
        raise ValueError("Gemini returned no recommendations")
    return InsightsResponse(
        summary=str(payload["summary"]),
        comparison=str(payload.get("comparison", "")),
        recommendations=recommendations[:4],
        source="gemini",
    )


def generate_insights(
    data: CarbonInput, result: FootprintResult, settings: Settings, use_ai: bool = True
) -> InsightsResponse:
    """Return personalized insights, preferring Gemini and falling back to rules."""
    if not use_ai or not settings.use_gemini or not settings.gemini_api_key:
        return generate_rule_based_insights(data, result)
    try:
        return _call_gemini(data, result, settings)
    except Exception as exc:
        logger.warning(
            "Gemini insight generation failed, using rule-based fallback: %s", exc
        )
        fallback = generate_rule_based_insights(data, result)
        fallback.summary = f"[DEBUG] {str(exc)[:200]} | " + fallback.summary
        return fallback
