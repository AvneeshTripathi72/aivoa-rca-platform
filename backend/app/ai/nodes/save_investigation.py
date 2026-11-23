from backend.app.ai.state import RCAWorkflowState

def save_investigation_node(state: RCAWorkflowState) -> RCAWorkflowState:
    """
    Node 10: Finalizes graph state and flags ready for database persistence.
    """
    new_state = dict(state)
    execution_log = list(state.get("execution_log", []))
    
    execution_log.append("Node 10 [Save Investigation]: Investigation workflow completed successfully. Graph ready for persistence.")
    new_state["execution_log"] = execution_log
    new_state["is_saved"] = True
    return new_state
