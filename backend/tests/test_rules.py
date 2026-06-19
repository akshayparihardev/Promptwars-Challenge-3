"""Tests for the rule-based insight engine."""

from app.carbon import factors
from app.carbon.engine import calculate_footprint
from app.insights.rules import generate_rule_based_insights
from app.models import CarbonInput, DietType


def test_rule_based_insights():
    data = CarbonInput(location="India")
    data.transport.car_km_per_week = 500
    data.diet = DietType.HEAVY_MEAT
    
    result = calculate_footprint(data)
    insights = generate_rule_based_insights(data, result)
    
    assert insights.source == "rules"
    assert len(insights.recommendations) > 0
    
    # Verify dynamic strings
    summary = insights.summary
    assert str(result.total_annual_tonnes) in summary
    assert "India average" in insights.comparison

def test_rule_flights_and_electric_cars():
    # Covers flight reductions and electric cars
    data = CarbonInput(location="UK")
    data.transport.short_haul_flights_per_year = 10
    data.transport.car_km_per_week = 100
    data.transport.car_fuel = factors.CarFuel.ELECTRIC
    data.diet = DietType.VEGAN
    
    result = calculate_footprint(data)
    insights = generate_rule_based_insights(data, result)
    assert len(insights.recommendations) > 0
    # Summary should hit the "above sustainable target" branch if emissions are high
    
def test_rule_home_and_consumption():
    data = CarbonInput(location="Global")
    data.home.electricity_kwh_per_month = 2000
    data.consumption.goods_spend_usd_per_month = 200
    result = calculate_footprint(data)
    insights = generate_rule_based_insights(data, result)
    assert any(r.category == "home" for r in insights.recommendations)
    assert any(r.category == "consumption" for r in insights.recommendations)
    # Total should be > target
    assert "above the sustainable target" in insights.summary
