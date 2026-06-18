"""
Gemini-powered cognitive insight engine.

Why Gemini 2.5 Flash: it provides the best latency-to-quality ratio for
structured analytical tasks. The system prompt constrains it to act as an
environmental consultant, ensuring outputs are actionable rather than generic.
"""

from __future__ import annotations

import json

from fastapi import APIRouter, HTTPException
from google import genai
from google.genai import types

from app.config import settings
from app.schemas import InsightRequest, InsightResponse

router = APIRouter(prefix="/api/insights", tags=["Gemini Engine"])

# Why we initialize the client at module level: the GenAI SDK maintains
# connection pooling internally; re-creating it per request wastes resources.
_client = genai.Client(api_key=settings.google_genai_api_key)

_SYSTEM_PROMPT = """You are an objective environmental consultant and carbon footprint analyst.

Your role:
1. Ingest raw numerical data from Google Routes API, Climatiq API, and Google Travel Impact Model.
2. Compare multimodal transit options mathematically (e.g., ICE car in traffic vs electrified Metro).
3. Generate personalized, actionable insights that organically nudge the user toward sustainable alternatives.
4. Quantify potential annual CO2 savings based on commute frequency assumptions (5 days/week, 48 weeks/year).

Output rules:
- Be data-driven. Every claim must reference a specific number from the input data.
- Format your response as valid JSON with these exact keys:
  {
    "summary": "A 2-3 sentence executive summary of the carbon comparison",
    "comparison": "A detailed multimodal comparison paragraph with specific numbers",
    "recommendations": ["actionable recommendation 1", "recommendation 2", "recommendation 3"],
    "estimated_annual_savings_kg_co2": <number or null>
  }
- Do NOT wrap the JSON in markdown code fences. Return ONLY raw JSON.
- Use metric units (kg CO2e, km, liters).
- Be concise but specific."""


@router.post("/generate", response_model=InsightResponse)
async def generate_insight(payload: InsightRequest) -> InsightResponse:
    """
    Generate an AI-powered environmental insight from API data.

    Feeds raw numerical outputs from Routes, Climatiq, and TIM APIs into
    Gemini 2.5 Flash with a constrained system prompt, producing structured
    comparative analysis and actionable recommendations.

    Args:
        payload: Raw API response data and optional user context.

    Returns:
        InsightResponse with summary, comparison, recommendations, and savings estimate.

    Raises:
        HTTPException: On Gemini API failure or malformed response.
    """
    # Build the data context for the LLM
    context_parts: list[str] = []

    if payload.route_data:
        context_parts.append(
            f"## Road Transit Data (Google Routes API)\n{json.dumps(payload.route_data, indent=2)}"
        )

    if payload.climatiq_data:
        context_parts.append(
            f"## Public Transit Emissions (Climatiq API)\n{json.dumps(payload.climatiq_data, indent=2)}"
        )

    if payload.flight_data:
        context_parts.append(
            f"## Aviation Emissions (Google TIM API)\n{json.dumps(payload.flight_data, indent=2)}"
        )

    if payload.user_context:
        context_parts.append(f"## User Context\n{payload.user_context}")

    if not context_parts:
        raise HTTPException(
            status_code=400,
            detail="At least one data source (route_data, climatiq_data, or flight_data) is required.",
        )

    user_message = (
        "Analyze the following carbon footprint data and provide a comprehensive "
        "environmental impact comparison:\n\n" + "\n\n".join(context_parts)
    )

    try:
        response = _client.models.generate_content(
            model="gemini-2.5-flash",
            contents=user_message,
            config=types.GenerateContentConfig(
                system_instruction=_SYSTEM_PROMPT,
                temperature=0.3,
                max_output_tokens=1024,
            ),
        )

        raw_text = response.text.strip()

        # Why we strip markdown fences: despite system prompt instructions,
        # LLMs occasionally wrap JSON in ```json blocks. Defensive parsing
        # ensures we handle this gracefully.
        if raw_text.startswith("```"):
            lines = raw_text.split("\n")
            raw_text = "\n".join(lines[1:-1])

        parsed = json.loads(raw_text)

        return InsightResponse(
            summary=parsed.get("summary", "Analysis complete."),
            comparison=parsed.get("comparison", ""),
            recommendations=parsed.get("recommendations", []),
            estimated_annual_savings_kg_co2=parsed.get("estimated_annual_savings_kg_co2"),
        )

    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini returned non-JSON response: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini API error: {str(e)}",
        )
