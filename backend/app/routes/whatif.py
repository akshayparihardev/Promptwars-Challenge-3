"""What-If interactive simulation route."""

from __future__ import annotations

from fastapi import APIRouter

from app.carbon.engine import calculate_whatif
from app.models import WhatIfRequest, WhatIfResult

router = APIRouter()


@router.post("/whatif", response_model=WhatIfResult, tags=["Calculator"])
async def simulate_whatif(payload: WhatIfRequest) -> WhatIfResult:
    """Run a what-if simulation by applying overrides to a baseline footprint."""
    return calculate_whatif(payload)
