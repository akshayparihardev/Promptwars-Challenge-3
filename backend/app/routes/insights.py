"""Personalized insights route."""

from __future__ import annotations

from fastapi import APIRouter, Depends

from app.config import Settings, get_settings
from app.insights.gemini import generate_insights
from app.models import CarbonInput, FootprintResult, InsightsResponse


class InsightsPayload(CarbonInput):
    """Payload combining the original inputs and the computed result."""

    result: FootprintResult


router = APIRouter()


@router.post("/insights", response_model=InsightsResponse, tags=["Insights"])
async def get_insights(
    payload: InsightsPayload, settings: Settings = Depends(get_settings)
) -> InsightsResponse:
    """Generate personalized reduction advice based on a footprint result."""
    # We pass the unpacked payload to the insight engine.
    return generate_insights(payload, payload.result, settings)
