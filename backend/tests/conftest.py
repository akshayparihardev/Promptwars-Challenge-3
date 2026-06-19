"""Shared test fixtures."""

from typing import AsyncGenerator

import httpx
import pytest
import pytest_asyncio
from fastapi import FastAPI

from app.config import Settings, get_settings
from app.deps import get_repository
from app.main import app
from app.repository.memory_repo import InMemoryEntryRepository


@pytest.fixture
def test_settings() -> Settings:
    """Override settings for testing (in-memory db, no Gemini by default)."""
    return Settings(
        project_id="test-project",
        use_gemini=False,
        use_firestore=False,
        gemini_model="gemini-2.5-flash",
    )


@pytest.fixture
def test_repo() -> InMemoryEntryRepository:
    """Provide a fresh in-memory repository for each test."""
    return InMemoryEntryRepository()


@pytest.fixture
def test_app(
    test_settings: Settings, test_repo: InMemoryEntryRepository
) -> FastAPI:
    """Provide a FastAPI instance with dependencies overridden."""
    app.dependency_overrides[get_settings] = lambda: test_settings
    app.dependency_overrides[get_repository] = lambda: test_repo
    return app


@pytest_asyncio.fixture
async def client(test_app: FastAPI) -> AsyncGenerator[httpx.AsyncClient, None]:
    """Provide an async test client connected to the FastAPI app."""
    async with httpx.AsyncClient(
        transport=httpx.ASGITransport(app=test_app), base_url="http://test"
    ) as ac:
        yield ac
