"""
Climatiq API controller for Scope 3 transit emissions.

Why we need a dedicated controller: Climatiq requires an authorization bearer
token that must stay server-side. Additionally, the /search endpoint is
rate-limited, so we apply an in-memory LRU cache to avoid redundant lookups
for the same region + transit mode combination.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Optional

import httpx
from cachetools import TTLCache
from fastapi import APIRouter, HTTPException

from app.config import settings
from app.schemas import (
    ClimatiqEstimateRequest,
    ClimatiqEstimateResult,
    TransitMode,
)

router = APIRouter(prefix="/api/climatiq", tags=["Climatiq"])

_BASE_URL = "https://api.climatiq.io/data/v1"

# Why TTLCache over functools.lru_cache: TTLCache evicts stale entries after
# a configurable TTL, ensuring we eventually pick up updated emission factors
# without a server restart. Max size prevents unbounded memory growth.
_search_cache: TTLCache = TTLCache(
    maxsize=settings.climatiq_cache_maxsize,
    ttl=settings.climatiq_cache_ttl,
)

# Mapping of our transit modes to Climatiq search keywords.
# Why this mapping: Climatiq's taxonomy uses specific category names that
# differ from user-facing labels. This decouples UI vocabulary from API internals.
_MODE_SEARCH_TERMS: dict[TransitMode, str] = {
    TransitMode.BUS: "passenger bus",
    TransitMode.METRO: "passenger rail metro",
    TransitMode.RAIL: "passenger rail national",
    TransitMode.FERRY: "passenger ferry",
}


def _auth_headers() -> dict[str, str]:
    """Build Climatiq authorization headers."""
    return {
        "Authorization": f"Bearer {settings.climatiq_api_key}",
        "Content-Type": "application/json",
    }


async def _search_activity_id(mode: TransitMode, region: str) -> Optional[str]:
    """
    Search Climatiq for the best-matching emission factor activity_id.

    Why we cache this: the /search endpoint is rate-limited and the mapping
    between (mode, region) → activity_id changes infrequently. Caching
    prevents quota exhaustion during high-traffic periods.

    Args:
        mode: Transit mode to search for.
        region: ISO region code (e.g., "IN", "US", "GB").

    Returns:
        The best-matching activity_id, or None if no results found.
    """
    cache_key = f"{mode.value}:{region}"
    if cache_key in _search_cache:
        return _search_cache[cache_key]

    search_term = _MODE_SEARCH_TERMS.get(mode, mode.value)
    params = {
        "query": search_term,
        "region": region,
        "data_version": "^6",
        "results_per_page": 1,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            f"{_BASE_URL}/search",
            params=params,
            headers=_auth_headers(),
        )

    if resp.status_code != 200:
        return None

    results = resp.json().get("results", [])
    if not results:
        return None

    activity_id = results[0].get("activity_id")
    _search_cache[cache_key] = activity_id
    return activity_id


@router.post("/estimate", response_model=ClimatiqEstimateResult)
async def estimate_emissions(payload: ClimatiqEstimateRequest) -> ClimatiqEstimateResult:
    """
    Estimate Scope 3 transit emissions via Climatiq.

    If no explicit activity_id is provided, dynamically searches for the
    best regional emission factor using the cached /search endpoint.

    Args:
        payload: Validated estimate request with mode, distance, and region.

    Returns:
        ClimatiqEstimateResult with kgCO2e and factor metadata.

    Raises:
        HTTPException: On missing emission factor or upstream API failure.
    """
    activity_id = payload.activity_id
    if not activity_id:
        activity_id = await _search_activity_id(payload.transit_mode, payload.region)
        if not activity_id:
            raise HTTPException(
                status_code=404,
                detail=(
                    f"No Climatiq emission factor found for mode={payload.transit_mode.value} "
                    f"in region={payload.region}. Try a different region or provide an explicit activity_id."
                ),
            )

    estimate_body = {
        "emission_factor": {
            "activity_id": activity_id,
            "data_version": "^6",
        },
        "parameters": {
            "distance": payload.distance_km,
            "distance_unit": "km",
            "passengers": payload.passengers,
        },
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(
            f"{_BASE_URL}/estimate",
            json=estimate_body,
            headers=_auth_headers(),
        )

    if resp.status_code != 200:
        raise HTTPException(
            status_code=resp.status_code,
            detail=f"Climatiq estimate error: {resp.text}",
        )

    data = resp.json()
    return ClimatiqEstimateResult(
        co2e_kg=data.get("co2e", 0.0),
        activity_id=activity_id,
        emission_factor_name=data.get("emission_factor", {}).get("name", "Unknown"),
        region=payload.region,
    )
