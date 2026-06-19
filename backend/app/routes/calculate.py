"""Footprint calculation route."""

from __future__ import annotations

from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.carbon.engine import calculate_footprint
from app.models import CarbonInput, FootprintResult

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/calculate", response_model=FootprintResult, tags=["Calculator"])
@limiter.limit("30/minute")
async def compute_footprint(request: Request, payload: CarbonInput) -> FootprintResult:
    """Calculate the annual carbon footprint from lifestyle inputs."""
    return calculate_footprint(payload)
