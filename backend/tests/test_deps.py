"""Tests for dependencies."""

from app.deps import get_repository
from app.repository.base import EntryRepository

def test_get_repository():
    repo = get_repository()
    assert isinstance(repo, EntryRepository)
