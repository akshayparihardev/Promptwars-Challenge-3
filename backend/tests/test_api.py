"""Tests for the API routes."""

import httpx
import pytest

from app.carbon import factors


@pytest.mark.asyncio
async def test_calculate_endpoint(client: httpx.AsyncClient):
    payload = {
        "location": "Global",
        "transport": {
            "car_km_per_week": 100,
            "car_fuel": "petrol",
            "public_transit_km_per_week": 0,
            "short_haul_flights_per_year": 0,
            "long_haul_flights_per_year": 0
        },
        "home": {
            "electricity_kwh_per_month": 0,
            "natural_gas_kwh_per_month": 0,
            "household_size": 1
        },
        "diet": "vegan",
        "consumption": {
            "goods_spend_usd_per_month": 0,
            "waste_kg_per_week": 0
        }
    }
    
    response = await client.post("/api/calculate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["total_annual_kg"] > 0
    assert data["breakdown_kg"]["diet"] == factors.DIET_ANNUAL_KG[factors.DietType.VEGAN]
