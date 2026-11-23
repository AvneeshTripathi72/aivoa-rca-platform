from typing import List, Dict, Any
from backend.app.ai.state import RCAWorkflowState

def validation_node(state: RCAWorkflowState) -> RCAWorkflowState:
    """
    Node 3: Validates extracted pharmaceutical information against GMP requirements.
    Detects missing batch numbers, equipment details, inconsistent dates, and unclear descriptions.
    """
    extracted = state.get("extracted_data", {})
    missing: List[str] = list(extracted.get("unknown_information", []))
    validation_flags: Dict[str, Any] = {
        "is_complete": True,
        "warnings": [],
        "field_status": {}
    }
    
    # 1. Required core GMP fields check
    core_fields = {
        "batch_number": "Manufacturing Batch Number (ICH Q7 Material Traceability)",
        "product_name": "Product / API Identifier",
        "manufacturing_stage": "Manufacturing Unit Operation / Stage",
        "equipment_id": "Equipment ID / Vessel Identifier",
        "incident_date": "Incident Occurrence Date",
        "detection_date": "Incident Detection Date"
    }

    for field, label in core_fields.items():
        val = extracted.get(field)
        if not val or str(val).strip().lower() in ["unknown", "null", "none", ""]:
            missing_item = f"Missing {label}"
            if missing_item not in missing:
                missing.append(missing_item)
            validation_flags["is_complete"] = False
            validation_flags["field_status"][field] = "MISSING"
        else:
            validation_flags["field_status"][field] = "PRESENT"

    # 2. Date consistency check
    inc_date = extracted.get("incident_date")
    det_date = extracted.get("detection_date")
    if inc_date and det_date:
        if str(det_date) < str(inc_date):
            warn = f"Chronological inconsistency: Detection date ({det_date}) precedes incident date ({inc_date})."
            validation_flags["warnings"].append(warn)
            missing.append(warn)

    # 3. Observations and Containment check
    obs = extracted.get("reported_observations", [])
    if not obs or len(obs) == 0:
        warn = "No specific manufacturing observations recorded; physical evidence required."
        validation_flags["warnings"].append(warn)
        missing.append(warn)

    new_state = dict(state)
    new_state["missing_information"] = missing
    new_state["validation_results"] = validation_flags
    
    log_entry = (
        f"Node 3 [Validation]: Evaluated GMP integrity. Status: "
        f"{'Compliant' if validation_flags['is_complete'] else 'Gaps Identified'} "
        f"({len(missing)} missing/gap items flagged)."
    )
    new_state.setdefault("execution_log", []).append(log_entry)
    return new_state
