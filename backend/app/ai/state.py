from typing import TypedDict, List, Dict, Any, Optional

class RCAWorkflowState(TypedDict):
    """
    Comprehensive state passed through the LangGraph AI Root Cause Analysis workflow.
    """
    investigation_id: Optional[str]
    raw_content: str
    source_type: str  # upload_pdf, pasted_text, email_intake, docx
    file_name: Optional[str]
    
    # Node 2: Extracted Information
    extracted_data: Dict[str, Any]
    
    # Node 3: Validation & Missing Info
    validation_results: Dict[str, Any]
    missing_information: List[str]
    
    # Node 4: Structured Evidence
    evidence_items: List[Dict[str, Any]]
    
    # Node 5: Methodology
    recommended_methodology: str
    selected_methodology: str
    
    # Node 6: Root Cause Analysis
    five_whys: List[Dict[str, Any]]
    fishbone_causes: List[Dict[str, Any]]
    
    # Node 7: CAPA Recommendations
    capa_recommendations: List[Dict[str, Any]]
    
    # Node 8: Summary
    investigation_summary: Dict[str, Any]
    
    # Node 9 & 10: Human Review & Persistence Status
    is_saved: bool
    review_notes: Optional[str]
    
    # Traceability & System metadata
    execution_log: List[str]
    is_synthetic_mode: bool
    llm_model_used: str
    error: Optional[str]
