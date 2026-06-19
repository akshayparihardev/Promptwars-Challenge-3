"""Footprint calculation route."""

from __future__ import annotations

from fastapi import APIRouter

from app.carbon.engine import calculate_footprint
from app.models import CarbonInput, FootprintResult

router = APIRouter()


@router.post("/calculate", response_model=FootprintResult, tags=["Calculator"])
async def compute_footprint(payload: CarbonInput) -> FootprintResult:
    """Calculate the annual carbon footprint from lifestyle inputs."""
    return calculate_footprint(payload)
