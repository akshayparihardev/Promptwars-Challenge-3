"""Tests for Firestore repository."""

from app.repository.firestore_repo import FirestoreEntryRepository


def test_firestore_repo_init():
    # Just testing we can instantiate it without crashing
    repo = FirestoreEntryRepository("test-project", "test-col")
    assert repo._collection is not None
