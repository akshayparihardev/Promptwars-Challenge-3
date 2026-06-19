"""Tests for models."""

import pytest
from pydantic import ValidationError
from app.models import CarbonInput


def test_carbon_input_validation():
    with pytest.raises(ValidationError):
        # Negative numbers are blocked
        CarbonInput(transport={"car_km_per_week": -100})
