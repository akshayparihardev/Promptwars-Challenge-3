"""Tests for SPA fallback logic."""

import httpx
import pytest

@pytest.mark.asyncio
async def test_api_404_not_spa(client: httpx.AsyncClient):
    response = await client.get("/api/not-a-real-route")
    assert response.status_code == 404
    assert response.headers["content-type"] == "application/json"
