"""Gamification API route for eco-challenges and achievements."""

from fastapi import APIRouter, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.carbon.gamification import generate_gamification
from app.models import CarbonInput, ChallengesResponse, FootprintResult
from pydantic import BaseModel

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)

class GamificationPayload(BaseModel):
    input: CarbonInput
    result: FootprintResult


@router.post("/gamification", response_model=ChallengesResponse, tags=["Gamification"])
@limiter.limit("30/minute")
async def get_gamification(request: Request, payload: GamificationPayload) -> ChallengesResponse:
    """Generate personalized eco-challenges and achievements."""
    return generate_gamification(payload.input, payload.result)
