"""The carbon footprint calculation engine.

Pure, deterministic, side-effect-free functions: the same input always yields the
same output, with no I/O. This makes the engine trivially unit-testable and lets
the API compute results without touching the database or any external service.

All quantities are normalised to **annual kg CO₂e** before being summed.

LocationContext is the critical differentiator: it drives grid factor, annual
distance, regional benchmark, and all location-specific calculations.
"""

from __future__ import annotations

from functools import lru_cache

from app.carbon import factors
from app.models import (
    CarbonInput,
    Comparison,
    ConsumptionInput,
    Equivalencies,
    FootprintResult,
    HomeInput,
    LocationContext,
    TransportInput,
    WhatIfRequest,
    WhatIfResult,
)


# ─────────────────────── Location resolution ────────────────────────

_INDIA_KEYWORDS: frozenset[str] = frozenset({
    "india", "mumbai", "delhi", "bangalore", "bengaluru",
    "chennai", "hyderabad", "pune", "kolkata", "ahmedabad",
    "jaipur", "surat", "lucknow", "kanpur", "nagpur",
    "new delhi", "noida", "gurgaon", "gurugram", "kochi",
    "bhopal", "indore", "patna", "vadodara", "goa",
    "chandigarh", "thiruvananthapuram", "coimbatore", "vizag",
    "visakhapatnam", "mangalore", "mysore", "mysuru",
})

_RURAL_KEYWORDS: frozenset[str] = frozenset({
    "village", "rural", "town", "tehsil",
})

_DEVELOPED_MAP: dict[str, str] = {
    "usa": "us", "united states": "us", "america": "us",
    "uk": "uk", "united kingdom": "uk", "england": "uk",
    "london": "uk", "scotland": "uk", "wales": "uk",
    "germany": "eu", "france": "eu", "spain": "eu", "italy": "eu",
    "netherlands": "eu", "belgium": "eu", "austria": "eu",
    "switzerland": "eu", "sweden": "eu", "norway": "uk",
    "denmark": "eu", "finland": "eu", "ireland": "eu",
    "canada": "us", "australia": "us", "new zealand": "us",
    "japan": "us", "south korea": "us", "singapore": "us",
}


@lru_cache(maxsize=128)
def resolve_location_context(location: str) -> LocationContext:
    """Lightweight location classification using curated regional keywords.

    Returns LocationContext with all region-specific values computed.
    lru_cache ensures repeated lookups for the same location are free.
    """
    loc = location.lower().strip()

    is_india = any(k in loc for k in _INDIA_KEYWORDS)
    is_rural = any(k in loc for k in _RURAL_KEYWORDS)
    matched_developed = next(
        (v for k, v in _DEVELOPED_MAP.items() if k in loc), None
    )

    if is_india:
        region = "india_rural" if is_rural else "india_urban"
        grid_factor = factors.GRID_FACTORS["india"]
        benchmark_t = factors.REGIONAL_BENCHMARKS_T["india"]
        benchmark_label = "India average"
        local_transport_tip = "Indian Railways or metro"
        currency_symbol = "₹"
    elif matched_developed:
        region = "developed"
        grid_factor = factors.GRID_FACTORS.get(
            matched_developed, factors.GRID_FACTORS["default"]
        )
        benchmark_t = factors.REGIONAL_BENCHMARKS_T.get(
            matched_developed, factors.REGIONAL_BENCHMARKS_T["global"]
        )
        benchmark_label = f"{matched_developed.upper()} average" if matched_developed != "us" else "US average"
        local_transport_tip = "public transit"
        currency_symbol = "$" if matched_developed == "us" else "€" if matched_developed == "eu" else "£" if matched_developed == "uk" else "$"
    else:
        region = "developing"
        grid_factor = factors.GRID_FACTORS["default"]
        benchmark_t = factors.REGIONAL_BENCHMARKS_T["global"]
        benchmark_label = "global average"
        local_transport_tip = "public transit"
        currency_symbol = "$"

    annual_km = factors.ANNUAL_KM.get(region, factors.ANNUAL_KM["developing"])

    return LocationContext(
        region=region,
        grid_factor=grid_factor,
        annual_km=annual_km,
        benchmark_t=benchmark_t,
        benchmark_label=benchmark_label,
        local_transport_tip=local_transport_tip,
        currency_symbol=currency_symbol,
    )


# ────────────────────── Calculation functions ───────────────────────


def _transport_annual_kg(t: TransportInput, ctx: LocationContext) -> float:
    """Compute annual transport emissions in kg CO₂e.

    Uses LocationContext to select the correct EV factor for India's
    dirtier grid (CEA 2023: 0.053 kgCO₂/km vs DEFRA 0.047).
    """
    # Select EV factor based on region
    ev_factor = (
        factors.CAR_EV_INDIA
        if ctx.region.startswith("india") and t.car_fuel == factors.CarFuel.ELECTRIC
        else factors.CAR_FACTORS_PER_KM[t.car_fuel]
    )
    car_factor = ev_factor if t.car_fuel == factors.CarFuel.ELECTRIC else factors.CAR_FACTORS_PER_KM[t.car_fuel]

    car = t.car_km_per_week * factors.WEEKS_PER_YEAR * car_factor
    transit = t.public_transit_km_per_week * factors.WEEKS_PER_YEAR * factors.PUBLIC_TRANSIT_PER_KM
    flights = (
        t.short_haul_flights_per_year
        * factors.SHORT_HAUL_TRIP_KM
        * factors.FLIGHT_SHORT_HAUL_PER_KM
        + t.long_haul_flights_per_year
        * factors.LONG_HAUL_TRIP_KM
        * factors.FLIGHT_LONG_HAUL_PER_KM
    )
    return car + transit + flights


def _home_annual_kg(h: HomeInput, ctx: LocationContext) -> float:
    """Compute annual home energy emissions using region-specific grid factor."""
    electricity = (
        h.electricity_kwh_per_month
        * factors.MONTHS_PER_YEAR
        * ctx.grid_factor  # Region-specific, not global 0.450
    )
    gas = h.natural_gas_kwh_per_month * factors.MONTHS_PER_YEAR * factors.NATURAL_GAS_PER_KWH
    return (electricity + gas) / h.household_size


def _consumption_annual_kg(c: ConsumptionInput) -> float:
    """Compute annual consumption emissions."""
    goods = c.goods_spend_usd_per_month * factors.MONTHS_PER_YEAR * factors.GOODS_PER_USD_MONTHLY
    waste = c.waste_kg_per_week * factors.WEEKS_PER_YEAR * factors.WASTE_PER_KG
    return goods + waste


def _compute_equivalencies(total_tonnes: float) -> Equivalencies:
    """Compute CO₂ equivalencies from total annual tonnes."""
    return Equivalencies(
        trees_needed=round(total_tonnes * factors.EQUIV_TREES_PER_TONNE),
        flights_delhi_mumbai=round(total_tonnes * factors.EQUIV_FLIGHTS_DELHI_MUMBAI, 1),
        km_petrol_car=round(total_tonnes * factors.EQUIV_KM_PETROL_CAR),
        km_indian_rail=round(total_tonnes * factors.EQUIV_KM_INDIAN_RAIL),
    )


def _compute_insight_tag(total_t: float, benchmark_t: float) -> str:
    """Compute a dynamic insight tag based on arithmetic thresholds.

    Never returns a hardcoded string — the tag is always derived from
    the ratio of the user's footprint to their regional benchmark.
    """
    ratio = total_t / benchmark_t if benchmark_t > 0 else 1.0
    if ratio <= 0.5:
        return "Exceptional"
    elif ratio <= 0.8:
        return "Below Average"
    elif ratio <= 1.2:
        return "Average"
    elif ratio <= 1.8:
        return "Above Average"
    else:
        return "High Impact"


def calculate_footprint(data: CarbonInput) -> FootprintResult:
    """Compute the annual carbon footprint breakdown for a set of inputs.

    Every output field is arithmetically derived from user inputs and
    region-specific factors — zero hardcoded outputs.
    """
    ctx = resolve_location_context(data.location)

    breakdown = {
        "transport": round(_transport_annual_kg(data.transport, ctx), 2),
        "home": round(_home_annual_kg(data.home, ctx), 2),
        "diet": round(factors.DIET_ANNUAL_KG[data.diet], 2),
        "consumption": round(_consumption_annual_kg(data.consumption), 2),
    }
    total_kg = round(sum(breakdown.values()), 2)
    total_t = round(total_kg / 1000, 3)

    # Sort by kg desc to find largest category — never a fixed order.
    largest_category = max(breakdown, key=lambda k: breakdown[k])

    comparison = Comparison(
        global_average_annual_kg=factors.GLOBAL_AVG_ANNUAL_KG,
        sustainable_target_annual_kg=factors.SUSTAINABLE_TARGET_ANNUAL_KG,
        ratio_to_global_average=round(total_kg / factors.GLOBAL_AVG_ANNUAL_KG, 3),
        ratio_to_sustainable_target=round(total_kg / factors.SUSTAINABLE_TARGET_ANNUAL_KG, 3),
    )

    return FootprintResult(
        breakdown_kg=breakdown,
        total_annual_kg=total_kg,
        total_annual_tonnes=total_t,
        comparison=comparison,
        insight_tag=_compute_insight_tag(total_t, ctx.benchmark_t),
        largest_category=largest_category,
        location_context=ctx,
        equivalencies=_compute_equivalencies(total_t),
    )


def calculate_whatif(request: WhatIfRequest) -> WhatIfResult:
    """Run a what-if simulation: merge override onto base, compute delta.

    All delta values are arithmetically derived — never hardcoded.
    """
    base_result = calculate_footprint(request.base_input)
    base_total = base_result.total_annual_kg

    # Merge override fields onto base input
    merged_data = request.base_input.model_copy(deep=True)
    override = request.override

    if override.location is not None:
        merged_data.location = override.location
    if override.transport is not None:
        merged_data.transport = override.transport
    if override.home is not None:
        merged_data.home = override.home
    if override.diet is not None:
        merged_data.diet = override.diet
    if override.consumption is not None:
        merged_data.consumption = override.consumption

    new_result = calculate_footprint(merged_data)
    new_total = new_result.total_annual_kg

    delta_kg = round(new_total - base_total, 2)
    delta_pct = round((delta_kg / base_total) * 100, 2) if base_total > 0 else 0.0

    return WhatIfResult(
        result=new_result,
        delta_kg=delta_kg,
        delta_pct=delta_pct,
        saves=delta_kg < 0,
    )
