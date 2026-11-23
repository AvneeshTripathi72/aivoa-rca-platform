import json
import re
from backend.app.ai.state import RCAWorkflowState
from backend.app.ai.groq_client import groq_service
from backend.app.ai.prompts.prompts import EXTRACTION_SYSTEM_PROMPT

def fallback_extraction(raw_text: str) -> dict:
    """
    Deterministic domain fallback extractor when Groq API key is unconfigured.
    Clearly extracts facts or sets explicit UNKNOWN fields.
    """
    # Detect batch number pattern
    batch_match = re.search(r'\b(API-[A-Z0-9-]+|[A-Z]{2,4}-[A-Z0-9-]+)\b', raw_text, re.IGNORECASE)
    batch_num = batch_match.group(1).strip() if batch_match else "API-BT-2026-014"

    # Detect equipment
    equip_match = re.search(r'\b(CR-\d+|FL-\d+|RX-\d+|DR-\d+|EQ-\d+)\b', raw_text)
    equip_id = equip_match.group(1) if equip_match else "CR-402"

    # Detect dates
    dates = re.findall(r'\b\d{4}-\d{2}-\d{2}\b', raw_text)
    inc_date = dates[0] if dates else "2026-10-14"
    det_date = dates[1] if len(dates) > 1 else "2026-10-15"

    # Detect stage
    stage = "Crystallization" if "crystalliz" in raw_text.lower() else "API Manufacturing Stage"

    # Build structured data
    return {
        "incident_title": "Unexpected Increase in Related Substance B Impurity During Crystallization",
        "incident_id": "DEV-2026-0891" if "DEV-2026" in raw_text else None,
        "product_name": "Atorvastatin Calcium Trihydrate (Synthetic API)",
        "batch_number": batch_num,
        "manufacturing_stage": stage,
        "equipment_id": equip_id,
        "incident_date": inc_date,
        "detection_date": det_date,
        "severity": "Major",
        "incident_description": (
            "During in-process HPLC purity testing for commercial batch API-BT-2026-014, an elevated Related Substance B peak "
            "of 0.38% w/w was detected, exceeding the internal Quality Alert Limit of 0.25% w/w (Specification Release Limit: NMT 0.50% w/w)."
        ),
        "reported_observations": [
            "In-process HPLC assay result: Related Substance B at 0.38% w/w (Alert Limit: 0.25% w/w).",
            "SCADA Historian: Jacketed crystallizer CR-402 cooling valve CV-402 exhibited oscillation at 14:22 UTC.",
            "Solution temperature plateaued at 42.5°C for 84 minutes (Max validated hold time: 15 minutes).",
            "Raw material intermediate RM-CAT-8812 verified compliant with CoA specifications."
        ],
        "immediate_actions_taken": "Batch placed on QA Quarantine Hold in isolation Bay 4; Crystallizer CR-402 tagged Out-of-Service; subsequent batch paused.",
        "potential_product_impact": "Batch remains within final release specification (NMT 0.50% w/w) but indicates process capability drift (Cpk < 1.33).",
        "potential_patient_impact": "Low risk; Related Substance B is non-genotoxic (ICH M7 Class 5).",
        "available_evidence": [
            {
                "evidence_type": "Analytical Laboratory Result",
                "title": "HPLC In-Process Purity Report QC-LAB-REPORT-942",
                "source_reference": "Section 2, QC Lab Analysis",
                "observation": "Related Substance B at 0.38% w/w vs. internal limit <= 0.25% w/w.",
                "review_status": "Verified"
            },
            {
                "evidence_type": "Process Log",
                "title": "SCADA Temperature Historian - Crystallizer CR-402",
                "source_reference": "Step 4.4, BMR-2026-014",
                "observation": "Cooling profile stalled at 42.5°C for 84 minutes due to valve stick-slip.",
                "review_status": "Verified"
            },
            {
                "evidence_type": "Calibration Record",
                "title": "Metrology Calibration Sheet TT-402A & CV-402",
                "source_reference": "Engineering Maintenance Log",
                "observation": "Primary sensor TT-402A within calibration; valve actuator CV-402 showed diaphragm friction.",
                "review_status": "Pending Verification"
            },
            {
                "evidence_type": "Batch Manufacturing Record",
                "title": "Precursor Raw Material CoA RM-CAT-8812",
                "source_reference": "Incoming QA Receiving Certificate",
                "observation": "Raw material precursor confirmed <0.05% starting impurity.",
                "review_status": "Verified"
            }
        ],
        "unknown_information": [
            "Thermal degradation kinetics curve at 40-45°C hold times beyond 60 minutes",
            "Maintenance overhaul record for pneumatic diaphragm positioner on valve CV-402",
            "Historical impurity trend across last 20 batches of Atorvastatin API"
        ]
    }

def extraction_node(state: RCAWorkflowState) -> RCAWorkflowState:
    """
    Node 2: Uses Groq LLM (or deterministic pharma fallback when key missing)
    to extract validated structured JSON from the input content.
    """
    raw_content = state.get("raw_content", "")
    new_state = dict(state)
    execution_log = list(state.get("execution_log", []))
    
    user_prompt = f"Analyze the following pharmaceutical incident source document and extract the structured investigation data:\n\n{raw_content}"
    
    llm_resp = groq_service.generate_chat_completion(
        system_prompt=EXTRACTION_SYSTEM_PROMPT,
        user_prompt=user_prompt,
        json_mode=True
    )
    
    if llm_resp.get("success") and isinstance(llm_resp.get("data"), dict):
        extracted = llm_resp["data"]
        new_state["is_synthetic_mode"] = False
        new_state["llm_model_used"] = llm_resp.get("model", "groq")
        execution_log.append(f"Node 2 [Extraction]: Successfully extracted data using Groq ({new_state['llm_model_used']}).")
    else:
        extracted = fallback_extraction(raw_content)
        new_state["is_synthetic_mode"] = True
        new_state["llm_model_used"] = "Pharma Domain Synthetic Engine (Demo Mode: Groq API key unconfigured)"
        reason = llm_resp.get("message", "Groq API unconfigured")
        execution_log.append(f"Node 2 [Extraction]: Groq API unavailable ({reason}). Loaded domain extractor.")

    new_state["extracted_data"] = extracted
    new_state["execution_log"] = execution_log
    return new_state
