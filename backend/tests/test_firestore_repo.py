"""Tests for Firestore repository."""

from app.repository.firestore_repo import FirestoreEntryRepository

from unittest.mock import patch

@patch("google.cloud.firestore.Client")
def test_firestore_repo_init(mock_client):
    # Just testing we can instantiate it without crashing
    repo = FirestoreEntryRepository("test-project", "test-col")
    assert repo._collection is not None
