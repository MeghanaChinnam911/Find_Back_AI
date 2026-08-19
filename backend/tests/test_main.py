import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.services.seed_service import seed_database

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_seed_db():
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "FIND-BACK AI" in data["service"]

def test_demo_login():
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "police@findback.demo", "password": "Demo@123"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "POLICE"

def test_list_missing_persons():
    response = client.get("/api/v1/missing-persons")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1

def test_agent_query():
    response = client.post(
        "/api/v1/agent/query",
        json={"query": "Show missing children between 8 and 15 in Vijayawada"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "tool_calls" in data
    assert "answer" in data
    assert "filtered_missing_cases" in data

def test_unidentified_upload_matching_trigger():
    svg_photo = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI0MCIgZmlsbD0iIzAwZmZmZiIvPjwvc3ZnPg=="
    response = client.post(
        "/api/v1/unidentified-persons",
        json={
            "photo_url": svg_photo,
            "location": "Vijayawada Railway Station",
            "latitude": 16.5170,
            "longitude": 80.6272,
            "uploader_phone": "+91 99999 88888",
            "approximate_age": 10,
            "additional_details": "Test NGO upload for automated matching"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["location"] == "Vijayawada Railway Station"
