import pytest
from backend.app.ai.graph import rca_graph
from backend.app.ai.state import RCAWorkflowState

def test_langgraph_10_node_workflow():
    sample_text = (
        "Batch API-BT-2026-014 of Atorvastatin Calcium Trihydrate suffered an impurity excursion "
        "on 2026-10-14 during crystallization in vessel CR-402. Related Substance B reached 0.38% w/w "
        "(alert limit 0.25% w/w). SCADA shows valve CV-402 sticking for 84 minutes at 42.5°C."
    )
    initial_state: RCAWorkflowState = {
        "investigation_id": None,
        "raw_content": sample_text,
        "source_type": "pasted_text",
        "file_name": "Test Incident Memo",
        "extracted_data": {},
        "validation_results": {},
        "missing_information": [],
        "evidence_items": [],
        "recommended_methodology": "both",
        "selected_methodology": "both",
        "five_whys": [],
        "fishbone_causes": [],
        "capa_recommendations": [],
        "investigation_summary": {},
        "is_saved": False,
        "review_notes": None,
        "execution_log": [],
        "is_synthetic_mode": False,
        "llm_model_used": "",
        "error": None
    }

    final_state = rca_graph.invoke(initial_state)

    # Verify extracted data
    assert "extracted_data" in final_state
    assert final_state["extracted_data"].get("batch_number") == "API-BT-2026-014"
    assert final_state["extracted_data"].get("equipment_id") == "CR-402"

    # Verify 5 Whys
    assert len(final_state["five_whys"]) >= 4

    # Verify Fishbone causes
    categories = [c["cause_category"] for c in final_state["fishbone_causes"]]
    assert "Machine" in categories
    assert "Method" in categories

    # Verify CAPA recommendations
    assert len(final_state["capa_recommendations"]) >= 2
    types = [capa["action_type"] for capa in final_state["capa_recommendations"]]
    assert "Corrective" in types
    assert "Preventive" in types

    # Verify Human Confirmation rule: No AI root cause should be Human-Confirmed
    for cause in final_state["fishbone_causes"]:
        assert cause["verification_status"] != "Human-Confirmed"

    # Verify execution log
    assert len(final_state["execution_log"]) >= 8
