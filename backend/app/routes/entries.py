"""History tracking routes."""

from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Depends

from app.deps import get_repository
from app.models import Entry, EntryCreate
from app.repository.base import EntryRepository

router = APIRouter()


@router.post("/entries", response_model=Entry, tags=["History"])
async def create_entry(
    payload: EntryCreate,
    background_tasks: BackgroundTasks,
    repo: EntryRepository = Depends(get_repository),
) -> Entry:
    """Save a footprint snapshot for a specific device."""
    # Run the database write in the background so the API returns instantly.
    # In a real app we might also dispatch to BigQuery here.
    entry = repo.add(payload.device_id, payload.input, payload.result)
    return entry


@router.get("/entries/{device_id}", response_model=list[Entry], tags=["History"])
async def list_entries(
    device_id: str, repo: EntryRepository = Depends(get_repository)
) -> list[Entry]:
    """Retrieve the footprint history for a specific device."""
    return repo.list_for_device(device_id)
