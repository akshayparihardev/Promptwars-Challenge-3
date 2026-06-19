"""Tests for the pure calculator engine."""

from app.carbon import factors
from app.carbon.engine import calculate_footprint
from app.models import CarbonInput, DietType


def test_calculate_footprint_all_zeros():
    data = CarbonInput()
    # Diet will default to MEDIUM_MEAT (2500 kg), everything else 0.
    result = calculate_footprint(data)
    
    assert result.total_annual_kg == 2500.0
    assert result.breakdown_kg["diet"] == 2500.0
    assert result.breakdown_kg["transport"] == 0.0
    assert result.breakdown_kg["home"] == 0.0
    assert result.breakdown_kg["consumption"] == 0.0
    assert result.comparison.ratio_to_global_average > 0


def test_calculate_footprint_with_data():
    data = CarbonInput(
        location="India",
    )
    data.transport.car_km_per_week = 100
    data.transport.car_fuel = factors.CarFuel.PETROL
    data.home.electricity_kwh_per_month = 200
    data.home.household_size = 2
    data.diet = DietType.VEGAN
    
    result = calculate_footprint(data)
    
    # 100 km * 52 * 0.170 = 884 kg
    assert result.breakdown_kg["transport"] == 884.0
    
    # India grid factor: 0.820
    # (200 kWh * 12 * 0.82) / 2 = 984 kg
    assert result.breakdown_kg["home"] == 984.0
    
    # Vegan diet: 1050 kg
    assert result.breakdown_kg["diet"] == 1050.0
    
    assert result.total_annual_kg == 884.0 + 984.0 + 1050.0
    assert result.largest_category == "diet"
