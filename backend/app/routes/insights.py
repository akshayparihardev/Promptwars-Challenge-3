"""Personalized insights route."""

from collections import defaultdict
from fastapi import APIRouter, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.config import Settings, get_settings
from app.insights.gemini import generate_insights
from app.models import CarbonInput, FootprintResult, InsightsResponse


class InsightsPayload(CarbonInput):
    """Payload combining the original inputs and the computed result."""

    result: FootprintResult


router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

# Track Gemini usage per IP to fallback to rules after 2 generations
ai_usage_tracker: dict[str, int] = defaultdict(int)

@router.post("/insights", response_model=InsightsResponse, tags=["Insights"])
@limiter.limit("20/minute")
async def get_insights(
    request: Request, payload: InsightsPayload, settings: Settings = Depends(get_settings)
) -> InsightsResponse:
    """Generate personalized reduction advice based on a footprint result."""
    ip = request.client.host if request.client else "unknown"
    
    use_ai = True
    if ai_usage_tracker[ip] >= 2:
        use_ai = False
    else:
        ai_usage_tracker[ip] += 1
        
    return generate_insights(payload, payload.result, settings, use_ai=use_ai)
