"""In-memory implementation of the EntryRepository for testing and local dev.

This ensures the test suite runs instantly without requiring a GCP emulator
or touching a real database.
"""

from __future__ import annotations

import datetime
import uuid

from app.models import CarbonInput, Entry, FootprintResult
from app.repository.base import EntryRepository


class InMemoryEntryRepository(EntryRepository):
    """Stores entries in a simple Python dict."""

    def __init__(self) -> None:
        self._store: dict[str, list[Entry]] = {}

    def add(self, device_id: str, data: CarbonInput, result: FootprintResult) -> Entry:
        now = datetime.datetime.now(datetime.timezone.utc)
        entry = Entry(
            id=str(uuid.uuid4()),
            created_at=now.isoformat(),
            device_id=device_id,
            input=data,
            result=result,
        )

        if device_id not in self._store:
            self._store[device_id] = []
        
        self._store[device_id].append(entry)
        # Sort so newest is always first
        self._store[device_id].sort(key=lambda e: e.created_at, reverse=True)
        return entry

    def list_for_device(self, device_id: str, limit: int = 50) -> list[Entry]:
        return self._store.get(device_id, [])[:limit]
