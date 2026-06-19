"""Pydantic v2 schemas — the validated contract for the API.

These models double as input validation (rejecting nonsensical values before any
computation) and as the OpenAPI documentation surface. Keeping every field
bounded is a deliberate security measure: clients cannot submit unbounded or
negative quantities.
"""

from __future__ import annotations

from pydantic import BaseModel, Field

from app.carbon.factors import CarFuel, DietType

class TransportInput(BaseModel):
    """Weekly travel habits plus yearly flight counts."""

    car_km_per_week: float = Field(0, ge=0)
    car_fuel: CarFuel = CarFuel.PETROL
    public_transit_km_per_week: float = Field(0, ge=0)
    short_haul_flights_per_year: int = Field(0, ge=0)
    long_haul_flights_per_year: int = Field(0, ge=0)


class HomeInput(BaseModel):
    """Monthly household energy use, shared across the household size."""

    electricity_kwh_per_month: float = Field(0, ge=0)
    natural_gas_kwh_per_month: float = Field(0, ge=0)
    household_size: int = Field(1, ge=1)


class ConsumptionInput(BaseModel):
    """Consumer goods spending and landfill waste."""

    goods_spend_usd_per_month: float = Field(0, ge=0)
    waste_kg_per_week: float = Field(0, ge=0)


class CarbonInput(BaseModel):
    """Full set of lifestyle inputs for a footprint estimate.

    The `location` field is the critical differentiator from the competitor:
    it drives grid factor, annual distance, regional benchmark, and Gemini prompt.
    """

    location: str = Field("Global", max_length=150)
    transport: TransportInput = Field(default_factory=TransportInput)
    home: HomeInput = Field(default_factory=HomeInput)
    diet: DietType = DietType.MEDIUM_MEAT
    consumption: ConsumptionInput = Field(default_factory=ConsumptionInput)


class LocationContext(BaseModel):
    """Hyper-local context computed from the user's location string.

    This drives grid factor, annual distance, regional benchmark, and
    all location-specific strings in both the rules engine and Gemini prompt.
    """

    region: str               # "india_urban"|"india_rural"|"developed"|"developing"
    grid_factor: float        # kgCO₂/kWh from GRID_FACTORS dict
    annual_km: float          # from ANNUAL_KM dict
    benchmark_t: float        # regional per-capita average (tonnes)
    benchmark_label: str      # "India average" | "US average" | "global average"
    local_transport_tip: str  # "Indian Railways or metro" | "public transit"
    currency_symbol: str      # "₹" | "$" | "€"


class Comparison(BaseModel):
    """The user's total in context: global average and sustainable target."""

    global_average_annual_kg: float
    sustainable_target_annual_kg: float
    ratio_to_global_average: float
    ratio_to_sustainable_target: float


class Equivalencies(BaseModel):
    """CO₂ equivalencies for the user's annual footprint."""

    trees_needed: int
    flights_delhi_mumbai: float
    km_petrol_car: int
    km_indian_rail: int


class FootprintResult(BaseModel):
    """Per-category annual breakdown (kg CO₂e) plus totals and context."""

    breakdown_kg: dict[str, float]
    total_annual_kg: float
    total_annual_tonnes: float
    comparison: Comparison
    insight_tag: str           # computed, never hardcoded
    largest_category: str      # computed from sorted breakdown
    location_context: LocationContext
    equivalencies: Equivalencies


# ── Insights ──────────────────────────────────────────────────────────


class Recommendation(BaseModel):
    """One concrete reduction action with a quantified annual saving."""

    category: str
    action: str
    estimated_annual_savings_kg: float
    difficulty: str = "medium"  # "easy" | "medium" | "hard"


class InsightsResponse(BaseModel):
    """Personalized advice: a summary plus ranked recommendations."""

    summary: str
    comparison: str = ""
    recommendations: list[Recommendation]
    source: str  # "gemini" | "rules"


# ── Entries (tracking history) ────────────────────────────────────────


class EntryCreate(BaseModel):
    """Request payload to save a footprint snapshot for an anonymous device."""

    device_id: str = Field(min_length=8, max_length=128, pattern=r"^[A-Za-z0-9_-]+$")
    input: CarbonInput
    result: FootprintResult


class Entry(EntryCreate):
    """A stored footprint snapshot, as returned by the API."""

    id: str
    created_at: str  # ISO-8601 UTC


# ── What-If ───────────────────────────────────────────────────────────


class WhatIfOverride(BaseModel):
    """Partial override of CarbonInput fields for what-if simulation."""

    location: str | None = None
    transport: TransportInput | None = None
    home: HomeInput | None = None
    diet: DietType | None = None
    consumption: ConsumptionInput | None = None


class WhatIfRequest(BaseModel):
    """What-if simulation request: base input + partial override."""

    base_input: CarbonInput
    override: WhatIfOverride


class WhatIfResult(BaseModel):
    """What-if simulation result with delta from baseline."""

    result: FootprintResult
    delta_kg: float
    delta_pct: float
    saves: bool
