import os

from fastapi.testclient import TestClient

os.environ["SCHEDULER_ENABLED"] = "false"

from app.main import app  # noqa: E402


client = TestClient(app)


def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "healthy"


def test_root():
    response = client.get("/")
    assert response.status_code == 200
    payload = response.json()
    assert "message" in payload
