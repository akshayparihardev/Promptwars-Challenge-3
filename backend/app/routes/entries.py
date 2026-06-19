"""History tracking routes."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, BackgroundTasks, Depends, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.deps import get_repository
from app.models import Entry, EntryCreate
from app.repository.base import EntryRepository

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.post("/entries", response_model=Entry, tags=["History"])
@limiter.limit("10/minute")
async def create_entry(
    request: Request,
    payload: EntryCreate,
    background_tasks: BackgroundTasks,
    repo: EntryRepository = Depends(get_repository),
) -> Entry:
    """Save a footprint snapshot for a specific device.

    The database write is dispatched to the background so the API returns
    instantly — the user sees the saved entry without waiting for Firestore.
    """
    entry = Entry(
        id=str(uuid.uuid4()),
        created_at=datetime.now(timezone.utc).isoformat(),
        device_id=payload.device_id,
        input=payload.input,
        result=payload.result,
    )
    background_tasks.add_task(repo.add, payload.device_id, payload.input, payload.result)
    return entry


@router.get("/entries/{device_id}", response_model=list[Entry], tags=["History"])
@limiter.limit("30/minute")
async def list_entries(
    request: Request,
    device_id: str, repo: EntryRepository = Depends(get_repository)
) -> list[Entry]:
    """Retrieve the footprint history for a specific device."""
    return repo.list_for_device(device_id)
