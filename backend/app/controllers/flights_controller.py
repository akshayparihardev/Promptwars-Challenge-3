"""
Google Travel Impact Model (TIM) controller.

Why a separate controller for flights: aviation emissions have a fundamentally
different calculation methodology (great-circle distance, radiative forcing
indices, cabin class multipliers) that the Routes API doesn't cover. The TIM
API encapsulates Google's proprietary model for this.
"""

from __future__ import annotations

import httpx
from fastapi import APIRouter, HTTPException

from app.config import settings
from app.schemas import (
    FlightEmissionsRequest,
    FlightEmissionsResponse,
    FlightEmissionResult,
)

router = APIRouter(prefix="/api/flights", tags=["Google TIM"])

_TIM_URL = "https://travelimpactmodel.googleapis.com/v1/flights:computeFlightEmissions"


@router.post("/emissions", response_model=FlightEmissionsResponse)
async def compute_flight_emissions(
    payload: FlightEmissionsRequest,
) -> FlightEmissionsResponse:
    """
    Proxy to Google TIM computeFlightEmissions for aviation impact.

    Transforms our simplified schema into the TIM API format, calls the
    upstream service, and normalizes the response into a consistent shape
    that the Gemini insight engine can consume alongside Routes/Climatiq data.

    Args:
        payload: Validated flight legs with IATA codes and cabin class.

    Returns:
        FlightEmissionsResponse with per-leg kgCO2e estimates.

    Raises:
        HTTPException: On upstream TIM API failure.
    """
    tim_flights = []
    for leg in payload.flights:
        tim_flights.append({
            "origin": leg.origin_airport,
            "destination": leg.destination_airport,
            "operatingCarrierCode": "",  # TIM uses this for fleet-specific data
            "departureDate": {"year": 2026, "month": 1, "day": 1},
            "flightNumber": 0,
        })

    body = {"flights": tim_flights}
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": settings.google_tim_api_key,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(_TIM_URL, json=body, headers=headers)

    if resp.status_code != 200:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"TIM API error: {resp.text}",
        )

    data = resp.json()
    results: list[FlightEmissionResult] = []

    for i, emission_data in enumerate(data.get("flightEmissions", [])):
        # Why we default to typicalEmissionsGramsPerPax: this represents the
        # median passenger emission for the route, which is the most broadly
        # applicable metric when exact aircraft type is unknown.
        emission_info = emission_data.get("emissionsGramsPerPax", {})

        # TIM returns emissions in different cabin tiers
        cabin = payload.flights[i].cabin_class.value
        grams = emission_info.get("economy", 0)

        # Map cabin class to the appropriate field
        cabin_field_map = {
            "ECONOMY": "economy",
            "PREMIUM_ECONOMY": "premiumEconomy",
            "BUSINESS": "business",
            "FIRST": "first",
        }
        field_name = cabin_field_map.get(cabin, "economy")
        grams = emission_info.get(field_name, emission_info.get("economy", 0))

        results.append(
            FlightEmissionResult(
                origin=payload.flights[i].origin_airport,
                destination=payload.flights[i].destination_airport,
                emissions_kg_co2e=round(grams / 1000, 2),
                cabin_class=cabin,
            )
        )

    return FlightEmissionsResponse(flight_emissions=results)
