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

@pytest.mark.asyncio
async def test_insights_endpoint(client: httpx.AsyncClient):
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
        },
        "result": {
            "total_annual_kg": 5000,
            "total_annual_tonnes": 5.0,
            "breakdown_kg": {"transport": 2000, "home": 1500, "diet": 1000, "consumption": 500},
            "comparison": {
                "global_average_annual_kg": 4800,
                "sustainable_target_annual_kg": 2000,
                "ratio_to_global_average": 1.04,
                "ratio_to_sustainable_target": 2.5
            },
            "equivalencies": {
                "trees_needed": 200,
                "flights_delhi_mumbai": 50,
                "km_petrol_car": 20000,
                "km_indian_rail": 120000
            },
            "location_context": {
                "grid_factor_kg_per_kwh": 0.82,
                "annual_km_benchmark": 8000,
                "benchmark_label": "India average",
                "benchmark_t": 1.9,
                "region": "asia-south1",
                "local_transport_tip": "Use metro"
            },
            "largest_category": "transport"
        }
    }
    
    response = await client.post("/api/insights", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data

@pytest.mark.asyncio
async def test_entries_endpoint(client: httpx.AsyncClient):
    payload = {
        "device_id": "test_device",
        "input": {
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
        },
        "result": {
            "total_annual_kg": 5000,
            "total_annual_tonnes": 5.0,
            "breakdown_kg": {"transport": 2000, "home": 1500, "diet": 1000, "consumption": 500},
            "comparison": {
                "global_average_annual_kg": 4800,
                "sustainable_target_annual_kg": 2000,
                "ratio_to_global_average": 1.04,
                "ratio_to_sustainable_target": 2.5
            },
            "equivalencies": {
                "trees_needed": 200,
                "flights_delhi_mumbai": 50,
                "km_petrol_car": 20000,
                "km_indian_rail": 120000
            },
            "location_context": {
                "grid_factor_kg_per_kwh": 0.82,
                "annual_km_benchmark": 8000,
                "benchmark_label": "India average",
                "benchmark_t": 1.9,
                "region": "asia-south1",
                "local_transport_tip": "Use metro"
            },
            "largest_category": "transport"
        }
    }
    
    # Test POST
    response = await client.post("/api/entries", json=payload)
    assert response.status_code == 200
    assert response.json()["device_id"] == "test_device"
    
    # Test GET
    response = await client.get("/api/entries/test_device")
    assert response.status_code == 200
    assert len(response.json()) > 0
    assert response.json()[0]["device_id"] == "test_device"
