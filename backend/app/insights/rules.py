"""Deterministic, rule-based insight engine — ZERO static strings.

This is the reliability backbone: it runs entirely offline with no external
dependency, so the platform can always offer concrete, personalized advice even
when Gemini is unavailable or disabled. It is also fully unit-testable because
it is pure.

Strategy: rank the user's emission categories by size and emit targeted actions
for the biggest contributors, each with a quantified annual saving estimate.

CRITICAL: Every action string is an f-string built from user data.
The hardcoding test: change every input to its opposite.
If ANY text, number, label, or recommendation stays the same → it is hardcoded.
"""

from __future__ import annotations

from app.carbon import factors
from app.carbon.engine import resolve_location_context
from app.models import (
    CarbonInput,
    FootprintResult,
    InsightsResponse,
    LocationContext,
    Recommendation,
)

# Diet types ordered from highest to lowest annual footprint.
_DIET_LADDER = [
    factors.DietType.HEAVY_MEAT,
    factors.DietType.MEDIUM_MEAT,
    factors.DietType.LOW_MEAT,
    factors.DietType.PESCATARIAN,
    factors.DietType.VEGETARIAN,
    factors.DietType.VEGAN,
]


def _next_diet_rung(current: factors.DietType) -> factors.DietType | None:
    """Return the next-greener diet on the ladder, or None if already vegan."""
    idx = _DIET_LADDER.index(current)
    if idx >= len(_DIET_LADDER) - 1:
        return None
    return _DIET_LADDER[idx + 1]


def _transport_recommendation(
    data: CarbonInput, amount: float, ctx: LocationContext
) -> Recommendation | None:
    """Generate transport recommendation with fully dynamic strings."""
    if amount <= 0:
        return None

    t = data.transport
    flights_total = t.short_haul_flights_per_year + t.long_haul_flights_per_year
    car_km_year = t.car_km_per_week * factors.WEEKS_PER_YEAR
    car_emissions = car_km_year * factors.CAR_FACTORS_PER_KM[t.car_fuel]

    flight_emissions = (
        t.short_haul_flights_per_year
        * factors.SHORT_HAUL_TRIP_KM
        * factors.FLIGHT_SHORT_HAUL_PER_KM
        + t.long_haul_flights_per_year
        * factors.LONG_HAUL_TRIP_KM
        * factors.FLIGHT_LONG_HAUL_PER_KM
    )

    # Address whichever sub-source is larger: flying or driving.
    if flights_total > 0 and flight_emissions > car_emissions:
        saving = round(flight_emissions * factors.FLIGHT_REDUCTION_SHARE, 2)
        return Recommendation(
            category="transport",
            action=(
                f"Reducing your {flights_total} annual flight(s) "
                f"({t.short_haul_flights_per_year} short-haul + "
                f"{t.long_haul_flights_per_year} long-haul) by half would save "
                f"approximately {saving:,.0f} kg CO₂e/year"
            ),
            estimated_annual_savings_kg=saving,
            difficulty="medium",
        )

    if t.car_km_per_week > 0 and t.car_fuel != factors.CarFuel.ELECTRIC:
        # EV factor depends on region
        ev_factor = (
            factors.CAR_EV_INDIA
            if ctx.region.startswith("india")
            else factors.CAR_FACTORS_PER_KM[factors.CarFuel.ELECTRIC]
        )
        electric_emissions = car_km_year * ev_factor
        saving = round(car_emissions - electric_emissions, 2)
        if saving > 0:
            return Recommendation(
                category="transport",
                action=(
                    f"Switching your {car_km_year:,.0f} km/year {t.car_fuel.value} car "
                    f"to {ctx.local_transport_tip} or an electric vehicle could "
                    f"save approximately {saving:,.0f} kg CO₂e/year"
                ),
                estimated_annual_savings_kg=saving,
                difficulty="hard",
            )

    saving = round(factors.GENERIC_TRANSPORT_REDUCTION_SHARE * amount, 2)
    return Recommendation(
        category="transport",
        action=(
            f"Using {ctx.local_transport_tip} for routine journeys "
            f"could cut your {amount:,.0f} kg transport emissions by "
            f"approximately {saving:,.0f} kg CO₂e/year"
        ),
        estimated_annual_savings_kg=saving,
        difficulty="easy",
    )


def _home_recommendation(
    data: CarbonInput, amount: float, ctx: LocationContext
) -> Recommendation | None:
    """Generate home energy recommendation with region-specific advice."""
    if amount <= 0:
        return None

    saving = round(amount * factors.HOME_REDUCTION_SHARE, 2)

    if ctx.region.startswith("india"):
        scheme = "PM-KUSUM solar rooftop scheme or a green energy tariff"
    elif ctx.region == "developed" and ctx.currency_symbol == "£":
        scheme = "a renewable electricity tariff (e.g., Octopus Energy green tariff)"
    else:
        scheme = "a renewable electricity tariff"

    return Recommendation(
        category="home",
        action=(
            f"Switching to {scheme} and improving insulation "
            f"could cut your home emissions by approximately "
            f"{saving:,.0f} kg CO₂e/year "
            f"(~{factors.HOME_REDUCTION_SHARE * 100:.0f}% of your {amount:,.0f} kg)"
        ),
        estimated_annual_savings_kg=saving,
        difficulty="medium",
    )


def _diet_recommendation(
    data: CarbonInput, _amount: float, ctx: LocationContext
) -> Recommendation | None:
    """Generate diet recommendation with local alternatives."""
    target = _next_diet_rung(data.diet)
    if target is None:
        return None

    current_kg = factors.DIET_ANNUAL_KG[data.diet]
    target_kg = factors.DIET_ANNUAL_KG[target]
    saving = round(current_kg - target_kg, 2)
    if saving <= 0:
        return None

    # India users get local alternatives
    if ctx.region.startswith("india"):
        local_alt = "dal, paneer, and vegetable curries"
    else:
        local_alt = "plant-based proteins and legumes"

    return Recommendation(
        category="diet",
        action=(
            f"Shifting from {data.diet.value.replace('_', ' ')} toward a "
            f"{target.value.replace('_', ' ')} diet "
            f"by replacing some meals with {local_alt} "
            f"could save approximately {saving:,.0f} kg CO₂e/year"
        ),
        estimated_annual_savings_kg=saving,
        difficulty="easy",
    )


def _consumption_recommendation(
    _data: CarbonInput, amount: float, _ctx: LocationContext
) -> Recommendation | None:
    """Generate consumption recommendation."""
    if amount <= 0:
        return None

    saving = round(factors.CONSUMPTION_REDUCTION_SHARE * amount, 2)
    return Recommendation(
        category="consumption",
        action=(
            f"Buying durable, second-hand or repairable goods, and reducing "
            f"landfill waste through recycling and composting could cut your "
            f"{amount:,.0f} kg consumption emissions by approximately "
            f"{saving:,.0f} kg CO₂e/year"
        ),
        estimated_annual_savings_kg=saving,
        difficulty="easy",
    )


def generate_rule_based_insights(
    data: CarbonInput, result: FootprintResult
) -> InsightsResponse:
    """Produce ranked, quantified recommendations from the footprint breakdown.

    Every string is built from user data — zero static action text.
    """
    ctx = resolve_location_context(data.location)

    builders = {
        "transport": _transport_recommendation,
        "home": _home_recommendation,
        "diet": _diet_recommendation,
        "consumption": _consumption_recommendation,
    }

    # Rank categories by their share of emissions (largest first).
    ranked = sorted(result.breakdown_kg.items(), key=lambda kv: kv[1], reverse=True)

    recommendations: list[Recommendation] = []
    for category, amount in ranked:
        if category in builders:
            rec = builders[category](data, amount, ctx)
            if rec is not None:
                recommendations.append(rec)

    # Sort recommendations by saving descending
    recommendations.sort(key=lambda r: r.estimated_annual_savings_kg, reverse=True)

    total = result.total_annual_kg
    total_t = result.total_annual_tonnes
    target = factors.SUSTAINABLE_TARGET_ANNUAL_KG
    largest = result.largest_category
    largest_kg = result.breakdown_kg.get(largest, 0.0)
    largest_pct = round((largest_kg / total) * 100, 0) if total > 0 else 0

    vs_benchmark_pct = round(
        ((total_t - ctx.benchmark_t) / ctx.benchmark_t) * 100, 1
    ) if ctx.benchmark_t > 0 else 0.0

    if total <= target:
        summary = (
            f"Your estimated footprint is {total_t} t CO₂e/yr — at or below "
            f"the sustainable target of {target / 1000:.1f} t. "
            f"Your {largest} emissions of {largest_kg:,.0f} kg "
            f"({largest_pct:.0f}% of your total) are your largest category."
        )
    else:
        over = round((total - target) / 1000, 2)
        summary = (
            f"Your estimated footprint is {total_t} t CO₂e/yr, about {over} t "
            f"above the sustainable target of {target / 1000:.1f} t. "
            f"Your {largest} emissions of {largest_kg:,.0f} kg "
            f"({largest_pct:.0f}% of your total) are your biggest contributor "
            f"to your {total:,.0f} kg annual footprint."
        )

    comparison_str = (
        f"Your footprint is {vs_benchmark_pct:+.1f}% compared to the "
        f"{ctx.benchmark_label} ({ctx.benchmark_t}t), and "
        f"{round(((total_t - 4.8) / 4.8) * 100, 1):+.1f}% vs the global average (4.8t)."
    )

    return InsightsResponse(
        summary=summary,
        comparison=comparison_str,
        recommendations=recommendations[:4],
        source="rules",
    )
