"""Tests for Memory repository."""

from app.models import CarbonInput
from app.carbon.engine import calculate_footprint
from app.repository.memory_repo import InMemoryEntryRepository


def test_memory_repo_add_list():
    repo = InMemoryEntryRepository()
    data = CarbonInput()
    result = calculate_footprint(data)
    
    entry = repo.add("device-1", data, result)
    assert entry.id is not None
    
    entries = repo.list_for_device("device-1")
    assert len(entries) == 1
    assert entries[0].id == entry.id
