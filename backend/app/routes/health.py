"""Health check endpoint."""

from __future__ import annotations

from fastapi import APIRouter

router = APIRouter()


@router.get("/health", tags=["System"])
async def health_check() -> dict[str, str]:
    """Basic health check for container orchestration and load balancers.

    Guaranteed to return quickly without touching any database or external APIs.
    """
    return {"status": "ok"}
