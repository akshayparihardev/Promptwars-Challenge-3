"""Tests for the Gemini service."""

import pytest

from app.config import Settings
from app.insights.gemini import generate_insights
from app.carbon.engine import calculate_footprint
from app.models import CarbonInput


import json
from unittest.mock import patch

def test_gemini_fallback_when_disabled():
    settings = Settings(use_gemini=False, project_id="test")
    data = CarbonInput()
    result = calculate_footprint(data)
    
    insights = generate_insights(data, result, settings)
    assert insights.source == "rules"

def test_build_prompt_logic():
    from app.insights.gemini import _build_prompt
    data = CarbonInput(location="India")
    result = calculate_footprint(data)
    prompt = _build_prompt(data, result)
    assert "Location: India" in prompt
    assert "Region: india" in prompt

@patch("google.genai.Client")
def test_gemini_success_mocked(mock_client):
    settings = Settings(use_gemini=True, project_id="test")
    data = CarbonInput()
    result = calculate_footprint(data)
    
    # Mock the JSON response
    mock_response = mock_client.return_value.models.generate_content.return_value
    mock_response.text = json.dumps({
        "summary": "You are doing well.",
        "comparison": "Better than average.",
        "recommendations": [
            {
                "category": "diet",
                "action": "Eat less meat",
                "saving_kg_co2": 500,
                "difficulty": "easy"
            }
        ]
    })
    
    insights = generate_insights(data, result, settings)
    assert insights.source == "gemini"
    assert len(insights.recommendations) == 1
    assert insights.recommendations[0].estimated_annual_savings_kg == 500

@patch("google.genai.Client")
def test_gemini_fallback_on_error(mock_client):
    settings = Settings(use_gemini=True, project_id="test")
    data = CarbonInput()
    result = calculate_footprint(data)
    
    # Simulate API failure
    mock_client.return_value.models.generate_content.side_effect = Exception("API Error")
    
    insights = generate_insights(data, result, settings)
    assert insights.source == "rules"  # Gracefully falls back
