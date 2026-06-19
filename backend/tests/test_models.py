"""Tests for models."""

import pytest
from pydantic import ValidationError
from app.models import CarbonInput


def test_carbon_input_validation():
    with pytest.raises(ValidationError):
        # Transport miles too high
        CarbonInput(transport={"car_km_per_week": 10000000})
