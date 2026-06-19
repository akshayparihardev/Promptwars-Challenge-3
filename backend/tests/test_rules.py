"""Tests for the rule-based insight engine."""

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
