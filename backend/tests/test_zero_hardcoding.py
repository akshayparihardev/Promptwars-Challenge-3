import pytest
from app.carbon import factors
from app.carbon.engine import calculate_footprint, calculate_whatif
from app.insights.rules import generate_rule_based_insights
from app.models import CarbonInput, DietType, HomeInput, TransportInput, WhatIfOverride, WhatIfRequest

def test_food_kg_equals_diet_factor_for_all_diets():
    for diet in DietType:
        result = calculate_footprint(
            CarbonInput(diet=diet, location="Global")
        )
        assert result.breakdown_kg["diet"] == pytest.approx(
            factors.DIET_ANNUAL_KG[diet]
        ), f"food_kg hardcoded for diet={diet}"

def test_insight_tag_changes_with_input():
    low = calculate_footprint(CarbonInput(
        diet=DietType.VEGAN, location="Global",
        home=HomeInput(electricity_kwh_per_month=0, natural_gas_kwh_per_month=0, household_size=1)
    ))
    high = calculate_footprint(CarbonInput(
        diet=DietType.HEAVY_MEAT, location="Global",
        home=HomeInput(electricity_kwh_per_month=1000, natural_gas_kwh_per_month=0, household_size=1),
        transport=TransportInput(car_km_per_week=500, car_fuel=factors.CarFuel.PETROL, public_transit_km_per_week=0, short_haul_flights_per_year=0, long_haul_flights_per_year=0)
    ))
    assert low.insight_tag != high.insight_tag, \
        "insight_tag is hardcoded — it must change with inputs"

def test_india_gets_india_grid_factor():
    result = calculate_footprint(CarbonInput(location="Mumbai"))
    assert result.location_context.grid_factor == pytest.approx(
        factors.GRID_FACTORS["india"]
    )

def test_uk_gets_uk_grid_factor():
    result = calculate_footprint(CarbonInput(location="London, UK"))
    assert result.location_context.grid_factor == pytest.approx(
        factors.GRID_FACTORS["uk"]
    )

def test_whatif_delta_is_exact_arithmetic():
    base = calculate_footprint(CarbonInput(
        diet=DietType.HEAVY_MEAT, location="Global"
    ))
    override_input = CarbonInput(
        diet=DietType.VEGAN, location="Global"
    )
    new = calculate_footprint(override_input)
    expected_delta = new.total_annual_kg - base.total_annual_kg
    request = WhatIfRequest(
        base_input=CarbonInput(
            diet=DietType.HEAVY_MEAT, location="Global"
        ),
        override=WhatIfOverride(diet=DietType.VEGAN)
    )
    result = calculate_whatif(request)
    assert result.delta_kg == pytest.approx(expected_delta), \
        "whatif delta is not computed from arithmetic"

def test_rules_saving_computed_not_hardcoded():
    low_transport = CarbonInput(
        transport=TransportInput(car_km_per_week=50, car_fuel=factors.CarFuel.PETROL, public_transit_km_per_week=0, short_haul_flights_per_year=0, long_haul_flights_per_year=0),
        diet=DietType.VEGAN, location="Global"
    )
    high_transport = CarbonInput(
        transport=TransportInput(car_km_per_week=500, car_fuel=factors.CarFuel.PETROL, public_transit_km_per_week=0, short_haul_flights_per_year=0, long_haul_flights_per_year=0),
        diet=DietType.VEGAN, location="Global"
    )
    low_result = calculate_footprint(low_transport)
    high_result = calculate_footprint(high_transport)
    low_insights = generate_rule_based_insights(
        low_transport, low_result
    )
    high_insights = generate_rule_based_insights(
        high_transport, high_result
    )
    low_saving = next(
        r.estimated_annual_savings_kg
        for r in low_insights.recommendations
        if r.category == "transport"
    )
    high_saving = next(
        r.estimated_annual_savings_kg
        for r in high_insights.recommendations
        if r.category == "transport"
    )
    assert low_saving != high_saving, \
        "transport saving is hardcoded — must change with car_km_per_week"
