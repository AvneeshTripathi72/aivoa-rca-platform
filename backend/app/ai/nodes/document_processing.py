from backend.app.ai.state import RCAWorkflowState

def document_processing_node(state: RCAWorkflowState) -> RCAWorkflowState:
    """
    Node 1: Receives source document or text, normalizes text, parses structure,
    and records document processing metrics in the execution log.
    """
    raw_text = state.get("raw_content", "")
    source_type = state.get("source_type", "pasted_text")
    file_name = state.get("file_name", "Raw Text Input")
    
    # Text normalization
    normalized_text = raw_text.strip()
    char_count = len(normalized_text)
    line_count = len(normalized_text.splitlines())
    
    log_entry = f"Node 1 [Document Processing]: Processed {source_type} '{file_name}' ({char_count} chars, {line_count} lines)."
    
    new_state = dict(state)
    new_state["raw_content"] = normalized_text
    new_state.setdefault("execution_log", []).append(log_entry)
    return new_state
