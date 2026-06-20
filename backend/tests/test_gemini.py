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

class MockResponse:
    def __init__(self, json_data, status_code=200):
        self.json_data = json_data
        self.status_code = status_code

    def json(self):
        return self.json_data

    def raise_for_status(self):
        if self.status_code >= 400:
            raise Exception("HTTP Error")

@patch("httpx.post")
def test_gemini_success_mocked(mock_post):
    settings = Settings(use_gemini=True, project_id="test", gemini_api_key="test_key")
    data = CarbonInput()
    result = calculate_footprint(data)
    
    # Mock the REST API JSON response structure
    payload = {
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
    }
    mock_post.return_value = MockResponse({
        "candidates": [{"content": {"parts": [{"text": json.dumps(payload)}]}}]
    })
    
    insights = generate_insights(data, result, settings)
    assert insights.source == "gemini"
    assert len(insights.recommendations) == 1
    assert insights.recommendations[0].estimated_annual_savings_kg == 500

@patch("httpx.post")
def test_gemini_fallback_on_error(mock_post):
    settings = Settings(use_gemini=True, project_id="test", gemini_api_key="test_key")
    data = CarbonInput()
    result = calculate_footprint(data)
    
    # Simulate API failure
    mock_post.side_effect = Exception("HTTP Timeout")
    
    insights = generate_insights(data, result, settings)
    assert insights.source == "rules"  # Gracefully falls back

@patch("httpx.post")
def test_gemini_fallback_on_empty_recommendations(mock_post):
    settings = Settings(use_gemini=True, project_id="test", gemini_api_key="test_key")
    data = CarbonInput()
    result = calculate_footprint(data)
    
    payload = {"summary": "Hi", "comparison": "Hi", "recommendations": []}
    mock_post.return_value = MockResponse({
        "candidates": [{"content": {"parts": [{"text": json.dumps(payload)}]}}]
    })
    
    insights = generate_insights(data, result, settings)
    assert insights.source == "rules"

def test_gemini_use_ai_flag():
    settings = Settings(use_gemini=True, project_id="test", gemini_api_key="test_key")
    data = CarbonInput()
    result = calculate_footprint(data)
    
    insights = generate_insights(data, result, settings, use_ai=False)
    assert insights.source == "rules"

