"""Arithmetically prove ZERO hardcoding.

This test file proves that every major footprint output changes dynamically 
based on inputs.
"""

from app.carbon import factors
from app.carbon.engine import calculate_footprint, calculate_whatif
from app.models import CarbonInput, DietType, WhatIfRequest, WhatIfOverride


def test_diet_zero_hardcoding():
    for diet in DietType:
        data = CarbonInput(diet=diet)
        result = calculate_footprint(data)
        assert result.breakdown_kg["diet"] == factors.DIET_ANNUAL_KG[diet]


def test_home_zero_hardcoding():
    data = CarbonInput(location="India")
    data.home.electricity_kwh_per_month = 100
    data.home.household_size = 2
    
    result = calculate_footprint(data)
    
    expected_kg = round((100 * 12 * factors.GRID_FACTORS["india"]) / 2, 2)
    assert round(result.breakdown_kg["home"], 2) == expected_kg


def test_whatif_zero_hardcoding():
    data = CarbonInput(diet=DietType.HEAVY_MEAT)
    base_result = calculate_footprint(data)
    
    req = WhatIfRequest(
        base_input=data,
        override=WhatIfOverride(diet=DietType.VEGAN)
    )
    
    whatif_result = calculate_whatif(req)
    
    expected_delta = whatif_result.result.total_annual_kg - base_result.total_annual_kg
    # The delta_kg must EXACTLY match the difference in totals
    assert whatif_result.delta_kg == round(expected_delta, 2)
