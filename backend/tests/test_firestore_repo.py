"""Tests for Firestore repository — mocking google.cloud.firestore."""

from unittest.mock import MagicMock, patch


def test_firestore_repo_init():
    """Verify we can instantiate the repo without real GCP credentials."""
    mock_firestore = MagicMock()
    with patch.dict("sys.modules", {"google.cloud": MagicMock(firestore=mock_firestore)}):
        from app.repository.firestore_repo import FirestoreEntryRepository
        repo = FirestoreEntryRepository.__new__(FirestoreEntryRepository)
        # Manually call __init__ so the lazy import uses our patched module
        repo.__init__("test-project", "test-col")

    assert repo._collection is not None


def test_firestore_repo_add():
    """Verify add() writes to Firestore and returns a valid Entry."""
    from app.models import CarbonInput, FootprintResult

    mock_firestore = MagicMock()
    mock_client = mock_firestore.Client.return_value
    mock_collection = mock_client.collection.return_value

    with patch.dict("sys.modules", {"google.cloud": MagicMock(firestore=mock_firestore)}):
        from app.repository.firestore_repo import FirestoreEntryRepository
        repo = FirestoreEntryRepository.__new__(FirestoreEntryRepository)
        repo.__init__("test-project")

    dummy_input = CarbonInput(location="us")
    dummy_result = FootprintResult(
        total_annual_kg=1000.0,
        total_annual_tonnes=1.0,
        breakdown_kg={"transport": 400, "home": 300, "diet": 200, "consumption": 100},
        comparison={
            "global_average_annual_kg": 4800,
            "sustainable_target_annual_kg": 2000,
            "ratio_to_global_average": 0.21,
            "ratio_to_sustainable_target": 0.5,
        },
        insight_tag="Exceptional",
        largest_category="transport",
        location_context={
            "region": "us",
            "grid_factor": 0.42,
            "annual_km": 8000,
            "benchmark_t": 15.0,
            "benchmark_label": "US average",
            "local_transport_tip": "Use public transit",
            "currency_symbol": "$",
        },
        equivalencies={
            "trees_needed": 46,
            "flights_delhi_mumbai": 5,
            "km_petrol_car": 4100,
            "km_indian_rail": 24000,
        },
    )

    entry = repo.add("device-123", dummy_input, dummy_result)
    assert entry.device_id == "device-123"
    assert entry.result.total_annual_kg == 1000.0
    mock_collection.document.return_value.set.assert_called_once()


def test_firestore_repo_list_empty():
    """Verify list_for_device() returns empty list when no docs found."""
    mock_firestore = MagicMock()
    mock_client = mock_firestore.Client.return_value
    mock_collection = mock_client.collection.return_value

    # Chain query builder
    mock_query = MagicMock()
    mock_collection.where.return_value = mock_query
    mock_query.order_by.return_value = mock_query
    mock_query.limit.return_value = mock_query
    mock_query.stream.return_value = []

    with patch.dict("sys.modules", {"google.cloud": MagicMock(firestore=mock_firestore)}):
        from app.repository.firestore_repo import FirestoreEntryRepository
        repo = FirestoreEntryRepository.__new__(FirestoreEntryRepository)
        repo.__init__("test-project")

    results = repo.list_for_device("device-xyz", limit=5)
    assert results == []
    mock_collection.where.assert_called_once_with("device_id", "==", "device-xyz")
