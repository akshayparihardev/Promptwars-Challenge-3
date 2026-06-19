"""Firestore implementation of the EntryRepository.

Uses the official Google Cloud Firestore client. Imported lazily so the app
can run without GCP credentials when using the in-memory repository.
"""

from __future__ import annotations

import datetime
import uuid
from typing import Any

from app.models import CarbonInput, Entry, FootprintResult
from app.repository.base import EntryRepository


class FirestoreEntryRepository(EntryRepository):
    """Stores entries in a Google Cloud Firestore collection."""

    def __init__(self, project_id: str, collection_name: str = "footprint_entries"):
        # Import the Firestore submodule directly so static checkers don't rely on
        # package-level attribute resolution (google.cloud has dynamic exports).
        import google.cloud.firestore as firestore  # type: ignore[attr-defined]

        # We rely on Application Default Credentials here.
        self._db = firestore.Client(project=project_id)
        self._collection = self._db.collection(collection_name)

    def add(self, device_id: str, data: CarbonInput, result: FootprintResult) -> Entry:
        now = datetime.datetime.now(datetime.timezone.utc)
        doc_id = str(uuid.uuid4())
        
        # Pydantic's model_dump returns primitive dicts safe for Firestore
        entry_dict = {
            "id": doc_id,
            "created_at": now.isoformat(),
            "device_id": device_id,
            "input": data.model_dump(),
            "result": result.model_dump(),
        }
        
        self._collection.document(doc_id).set(entry_dict)
        
        return Entry.model_validate(entry_dict)

    def list_for_device(self, device_id: str, limit: int = 50) -> list[Entry]:
        # Use the public `.where` API instead of constructing FieldFilter objects
        # which rely on internal module exports and confuse static type checkers.
        query = (
            self._collection.where("device_id", "==", device_id)
            .order_by("created_at", direction="DESCENDING")
            .limit(limit)
        )
        
        results = []
        for doc in query.stream():
            data = doc.to_dict()
            if data:
                results.append(Entry.model_validate(data))
                
        return results
