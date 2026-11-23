from backend.app.ai.state import RCAWorkflowState

def method_selection_node(state: RCAWorkflowState) -> RCAWorkflowState:
    """
    Node 5: Assesses incident characteristics and recommends RCA methodology
    (5 Whys, Fishbone / Ishikawa, or Both). Investigator retains final control.
    """
    severity = state.get("extracted_data", {}).get("severity", "Major")
    observations = state.get("extracted_data", {}).get("reported_observations", [])
    
    # Complex multi-factorial API excursions (thermal, mechanical, chemical) benefit from Both
    if severity in ["Major", "Critical"] or len(observations) >= 3:
        recommended = "both"
        rationale = "Multi-factorial API process excursion involving physical equipment, cooling kinetics, and chemical degradation. Combined Fishbone (6M broad factor screening) and 5 Whys (deep causal drilling) recommended."
    else:
        recommended = "5_whys"
        rationale = "Isolated excursion; focused 5 Whys root cause sequence recommended."
        
    new_state = dict(state)
    new_state["recommended_methodology"] = recommended
    
    # If user has not explicitly set selected_methodology, default to recommendation
    if not new_state.get("selected_methodology"):
        new_state["selected_methodology"] = recommended
        
    log_entry = f"Node 5 [Method Selection]: Recommended '{recommended}' methodology. Rationale: {rationale}"
    new_state.setdefault("execution_log", []).append(log_entry)
    return new_state
