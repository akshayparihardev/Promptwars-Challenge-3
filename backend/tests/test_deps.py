"""Tests for dependencies."""

from app.deps import get_repository
from app.repository.base import EntryRepository

from unittest.mock import patch

def test_get_repository():
    with patch("app.deps.get_settings") as mock_settings:
        mock_settings.return_value.use_firestore = False
        repo = get_repository()
        assert isinstance(repo, EntryRepository)
