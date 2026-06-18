"""
Pydantic schemas for request/response validation.

Why: Strict typing at the API boundary catches malformed payloads before they
reach external services, reducing wasted API calls and improving error messages.
Zod mirrors these on the frontend for full-stack type safety.
"""

from __future__ import annotations

from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, field_validator


# ---------------------------------------------------------------------------
# Shared enums
# ---------------------------------------------------------------------------

class EmissionType(str, Enum):
    """Vehicle powertrain types supported by Google Routes API."""
    GASOLINE = "GASOLINE"
    DIESEL = "DIESEL"
    ELECTRIC = "ELECTRIC"
    HYBRID = "HYBRID"


class TransitMode(str, Enum):
    """Public transit modes for Climatiq Scope 3 calculations."""
    BUS = "bus"
    METRO = "metro"
    RAIL = "rail"
    FERRY = "ferry"


class CabinClass(str, Enum):
    """Flight cabin classes for TIM API."""
    ECONOMY = "ECONOMY"
    PREMIUM_ECONOMY = "PREMIUM_ECONOMY"
    BUSINESS = "BUSINESS"
    FIRST = "FIRST"


# ---------------------------------------------------------------------------
# Google Maps Routes API
# ---------------------------------------------------------------------------

class Waypoint(BaseModel):
    """A geographic coordinate for route origin/destination."""
    latitude: float = Field(..., ge=-90, le=90, description="Latitude in decimal degrees")
    longitude: float = Field(..., ge=-180, le=180, description="Longitude in decimal degrees")


class RouteRequest(BaseModel):
    """
    Payload for the Routes API proxy endpoint.

    Why we enforce emission_type here: it allows the backend to dynamically set
    vehicleInfo.emissionType on the upstream request, preventing the frontend
    from needing to know the Google Routes payload schema.
    """
    origin: Waypoint
    destination: Waypoint
    emission_type: EmissionType = EmissionType.GASOLINE

    @field_validator("origin", "destination", mode="before")
    @classmethod
    def parse_waypoint(cls, v: dict | Waypoint) -> Waypoint:
        """Accept raw dicts for convenience."""
        if isinstance(v, dict):
            return Waypoint(**v)
        return v


class RouteResult(BaseModel):
    """Distilled route response — only the fields we actually need."""
    distance_meters: int
    duration: str
    fuel_consumption_microliters: Optional[int] = None
    route_label: Optional[str] = None


class RouteResponse(BaseModel):
    """Top-level response wrapping one or more route alternatives."""
    routes: list[RouteResult]


# ---------------------------------------------------------------------------
# Climatiq API
# ---------------------------------------------------------------------------

class ClimatiqEstimateRequest(BaseModel):
    """
    Request to estimate transit emissions via Climatiq.

    Why activity_id is optional: when absent, the backend searches for the
    best-matching factor using the /search endpoint (with LRU caching) before
    calling /estimate, making the system self-healing for regional grids.
    """
    transit_mode: TransitMode
    distance_km: float = Field(..., gt=0, description="Distance in kilometers")
    region: str = Field(default="IN", min_length=2, max_length=5, description="ISO region code")
    activity_id: Optional[str] = Field(default=None, description="Explicit Climatiq activity_id override")
    passengers: int = Field(default=1, ge=1, le=500, description="Number of passengers")


class ClimatiqEstimateResult(BaseModel):
    """Parsed Climatiq estimate response."""
    co2e_kg: float
    activity_id: str
    emission_factor_name: str
    region: str


# ---------------------------------------------------------------------------
# Google Travel Impact Model (TIM)
# ---------------------------------------------------------------------------

class FlightLeg(BaseModel):
    """Single leg of a flight journey."""
    origin_airport: str = Field(..., min_length=3, max_length=4, description="IATA airport code")
    destination_airport: str = Field(..., min_length=3, max_length=4, description="IATA airport code")
    cabin_class: CabinClass = CabinClass.ECONOMY

    @field_validator("origin_airport", "destination_airport")
    @classmethod
    def uppercase_iata(cls, v: str) -> str:
        """Normalize IATA codes to uppercase for API consistency."""
        return v.upper()


class FlightEmissionsRequest(BaseModel):
    """Payload for the TIM computeFlightEmissions proxy."""
    flights: list[FlightLeg] = Field(..., min_length=1, max_length=10)


class FlightEmissionResult(BaseModel):
    """Parsed TIM emission result for a single flight."""
    origin: str
    destination: str
    emissions_kg_co2e: float
    cabin_class: str


class FlightEmissionsResponse(BaseModel):
    """Top-level flight emissions response."""
    flight_emissions: list[FlightEmissionResult]


# ---------------------------------------------------------------------------
# Gemini Insight Engine
# ---------------------------------------------------------------------------

class InsightRequest(BaseModel):
    """
    Payload for the Gemini cognitive engine.

    Why we accept raw JSON payloads: the LLM needs the full numerical context
    from Routes + Climatiq to produce meaningful comparative analysis. Passing
    structured dicts avoids lossy serialization.
    """
    route_data: Optional[dict] = Field(default=None, description="Raw Routes API response")
    climatiq_data: Optional[dict] = Field(default=None, description="Raw Climatiq estimate response")
    flight_data: Optional[dict] = Field(default=None, description="Raw TIM flight emissions response")
    user_context: Optional[str] = Field(default=None, description="Free-text user context")


class InsightResponse(BaseModel):
    """Gemini-generated environmental insight."""
    summary: str
    comparison: str
    recommendations: list[str]
    estimated_annual_savings_kg_co2: Optional[float] = None


# ---------------------------------------------------------------------------
# Global Footprint Engine
# ---------------------------------------------------------------------------

class OnboardingRequest(BaseModel):
    location: str
    transport: list[str]
    diet: str
    energy: str

class CarbonDataResult(BaseModel):
    transport: float
    food: float
    housing: float
    total: float
