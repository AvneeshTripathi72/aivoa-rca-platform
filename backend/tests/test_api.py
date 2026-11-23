import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.database import Base, engine, SessionLocal
from backend.app.services.seed_service import seed_database_if_empty

@pytest.fixture(scope="session", autouse=True)
def setup_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database_if_empty(db)
    db.close()

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_dashboard_metrics():
    response = client.get("/api/dashboard/metrics")
    assert response.status_code == 200
    metrics = response.json()
    assert "total_investigations" in metrics
    assert metrics["total_investigations"] >= 1
    assert "status_distribution" in metrics
    assert "pending_capa_actions" in metrics

def test_investigations_list_and_filter():
    response = client.get("/api/investigations")
    assert response.status_code == 200
    res = response.json()
    assert "items" in res
    assert res["total"] >= 1

    # Search filter
    search_resp = client.get("/api/investigations?search=API-BT-2026-014")
    assert search_resp.status_code == 200
    items = search_resp.json()["items"]
    assert len(items) >= 1
    assert "API-BT-2026-014" in items[0]["batch_number"]

def test_text_intake_workflow():
    sample_text = (
        "Batch API-BT-2026-014 of Atorvastatin Calcium Trihydrate suffered an impurity excursion "
        "on 2026-10-14 during crystallization in vessel CR-402. Related Substance B reached 0.38% w/w."
    )
    payload = {
        "text": sample_text,
        "source_type": "pasted_text",
        "title": "Automated Test Excursion"
    }
    response = client.post("/api/ai/text-intake", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "investigation_id" in data
    assert "execution_log" in data
    assert len(data["execution_log"]) >= 5

    # Verify created investigation details
    inv_id = data["investigation_id"]
    detail_resp = client.get(f"/api/investigations/{inv_id}")
    assert detail_resp.status_code == 200
    inv = detail_resp.json()
    assert inv["batch_number"] == "API-BT-2026-014"
    assert len(inv["five_whys_steps"]) >= 4
    assert len(inv["capa_actions"]) >= 2
    assert len(inv["root_causes"]) >= 2

def test_capa_status_update():
    # Fetch first investigation
    invs = client.get("/api/investigations").json()["items"]
    first_id = invs[0]["id"]
    inv_detail = client.get(f"/api/investigations/{first_id}").json()
    
    if inv_detail["capa_actions"]:
        capa_id = inv_detail["capa_actions"][0]["id"]
        update_resp = client.put(f"/api/capa/{capa_id}", json={"status": "Approved"})
        assert update_resp.status_code == 200
        assert update_resp.json()["status"] == "Approved"
