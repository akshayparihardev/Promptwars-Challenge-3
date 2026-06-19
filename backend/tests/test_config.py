"""Tests for config."""

from app.config import get_settings


def test_get_settings():
    settings = get_settings()
    assert settings.project_id is not None
