"""Tests for the Gemini service."""

import pytest

from app.config import Settings
from app.insights.gemini import generate_insights
from app.carbon.engine import calculate_footprint
from app.models import CarbonInput


def test_gemini_fallback_when_disabled():
    settings = Settings(use_gemini=False, project_id="test")
    data = CarbonInput()
    result = calculate_footprint(data)
    
    insights = generate_insights(data, result, settings)
    assert insights.source == "rules"
