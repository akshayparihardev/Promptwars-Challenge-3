"""
FastAPI application entrypoint.

Why a single main.py: keeps the ASGI entrypoint discoverable and ensures
all routers are registered in one place, making the dependency graph explicit.
CORS is configured to allow the Next.js dev server during development.
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.controllers import (
    climatiq_controller,
    flights_controller,
    insight_controller,
    routes_controller,
    footprint_controller,
)

app = FastAPI(
    title="EcoAgent API",
    description=(
        "Enterprise-grade carbon footprint tracking API. "
        "Proxies Google Routes, Climatiq, and TIM APIs with "
        "Gemini-powered environmental insights."
    ),
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# Why we allow all origins in dev: the Next.js dev server runs on a different
# port. In production, nginx serves both frontend and API from the same origin,
# making CORS irrelevant.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all API controllers
app.include_router(routes_controller.router)
app.include_router(climatiq_controller.router)
app.include_router(flights_controller.router)
app.include_router(insight_controller.router)
app.include_router(footprint_controller.router)


@app.get("/api/health")
async def health_check() -> dict[str, str]:
    """
    Health check endpoint for container orchestration.

    Why this exists: Docker HEALTHCHECK and load balancers need a lightweight
    endpoint to verify the service is responsive without hitting external APIs.
    """
    return {"status": "healthy", "service": "ecoagent-api"}
