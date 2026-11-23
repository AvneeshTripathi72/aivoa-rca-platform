import pytest
import os
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_copilot_log_complaint_tool():
    """Test Tool 1: Parsing unstructured prompt into structured triage fields and risk."""
    payload = {
        "message": "Log a customer complaint from Apollo Pharmacy regarding Atorvastatin Calcium 20mg, batch number ATC-2026-088. Customer reports tablet discoloration and specking in blister packs. 120 blister packs affected.",
        "current_form": {}
    }
    response = client.post("/api/copilot/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["tool_used"] == "log_complaint"
    assert data["extracted_data"]["batch_number"] == "ATC-2026-088"
    assert "Apollo Pharmacy" in data["extracted_data"]["customer_name"]
    assert data["risk_assessment"] is not None

def test_copilot_edit_complaint_tool():
    """Test Tool 2: Conversational edit updating batch and quantity while preserving other data."""
    initial_form = {
        "product_name": "Atorvastatin Calcium",
        "batch_number": "ATC-2026-088",
        "customer_name": "Apollo Pharmacy",
        "affected_quantity": "120 blister packs"
    }
    edit_payload = {
        "message": "ah sorry the batch number is BMX240602 and affected quantity is 48 capsules",
        "current_form": initial_form
    }
    response = client.post("/api/copilot/chat", json=edit_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["tool_used"] == "edit_complaint"
    assert data["extracted_data"]["batch_number"] == "BMX240602"
    assert "48" in data["extracted_data"]["affected_quantity"]
    assert data["extracted_data"]["product_name"] == "Atorvastatin Calcium"

def test_copilot_upload_document_tool():
    """Test Tool 3: PDF document ingestion and metadata extraction."""
    pdf_path = os.path.abspath("uploads/sample_incident_DEV-2026-0891.pdf")
    if os.path.exists(pdf_path):
        with open(pdf_path, "rb") as f:
            response = client.post(
                "/api/copilot/upload",
                files={"file": ("sample_incident.pdf", f, "application/pdf")},
                data={"current_form_json": "{}"}
            )
        assert response.status_code == 200
        data = response.json()
        assert data["tool_used"] == "document_extraction"
        assert data["extracted_data"] is not None

def test_copilot_commit_to_qms():
    """Test committing triage form into official QMS ledger and triggering RCA."""
    commit_payload = {
        "form_data": {
            "title": "Crystallizer Excursion",
            "incident_description": "Thermal spike in CR-402",
            "product_name": "Atorvastatin Calcium Trihydrate",
            "batch_number": "API-BT-2026-014",
            "severity": "Major",
            "originating_site_block": "Crystallization",
            "affected_quantity": "10,000 L",
            "initial_risk_assessment": {"severity": "Major", "justification": "Thermal excursion"}
        }
    }
    response = client.post("/api/copilot/commit", json=commit_payload)
    assert response.status_code == 200
    data = response.json()
    assert "investigation_id" in data
    assert "investigation_number" in data
