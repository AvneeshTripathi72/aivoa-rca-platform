from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- Evidence Schemas ---
class EvidenceBase(BaseModel):
    evidence_type: str
    title: str
    description: Optional[str] = None
    source_reference: Optional[str] = None
    observation: Optional[str] = None
    linked_root_cause: Optional[str] = None
    review_status: str = "Verified"

class EvidenceCreate(EvidenceBase):
    pass

class EvidenceUpdate(BaseModel):
    evidence_type: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    source_reference: Optional[str] = None
    observation: Optional[str] = None
    linked_root_cause: Optional[str] = None
    review_status: Optional[str] = None

class EvidenceResponse(EvidenceBase):
    id: str
    investigation_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Extracted Information Schemas ---
class ExtractedField(BaseModel):
    id: Optional[str] = None
    field_name: str
    extracted_value: Optional[str] = None
    source_reference: Optional[str] = None
    confidence: float = 1.0
    review_status: str = "suggested"

class ExtractedFieldResponse(BaseModel):
    id: str
    investigation_id: str
    field_name: str
    extracted_value: Optional[str] = None
    source_reference: Optional[str] = None
    confidence: float = 1.0
    review_status: str = "suggested"

    class Config:
        from_attributes = True

class ExtractedFieldUpdate(BaseModel):
    extracted_value: Optional[str] = None
    review_status: Optional[str] = None


# --- 5 Whys Schemas ---
class FiveWhysItem(BaseModel):
    id: Optional[str] = None
    sequence_number: int
    question: str
    answer: str
    evidence_reference: Optional[str] = None
    is_root_cause: bool = False
    status: str = "AI-Suggested"  # AI-Suggested, Human-Validated, Rejected

class FiveWhysUpdate(BaseModel):
    question: Optional[str] = None
    answer: Optional[str] = None
    evidence_reference: Optional[str] = None
    is_root_cause: Optional[bool] = None
    status: Optional[str] = None


# --- Root Cause Schemas ---
class RootCauseBase(BaseModel):
    methodology: str = "fishbone"
    cause_category: str
    cause_description: str
    supporting_evidence: List[str] = []
    contradictory_evidence: List[str] = []
    evidence_strength: str = "Moderate"
    verification_status: str = "Hypothesis"  # Hypothesis, Evidence-Supported, Human-Confirmed, Rejected
    is_primary_root_cause: bool = False
    investigator_decision_notes: Optional[str] = None

class RootCauseCreate(RootCauseBase):
    pass

class RootCauseUpdate(BaseModel):
    cause_category: Optional[str] = None
    cause_description: Optional[str] = None
    supporting_evidence: Optional[List[str]] = None
    contradictory_evidence: Optional[List[str]] = None
    evidence_strength: Optional[str] = None
    verification_status: Optional[str] = None
    is_primary_root_cause: Optional[bool] = None
    investigator_decision_notes: Optional[str] = None

class RootCauseResponse(RootCauseBase):
    id: str
    investigation_id: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- CAPA Schemas ---
class CapaActionBase(BaseModel):
    action_number: Optional[str] = None
    action_type: str  # Corrective, Preventive
    description: str
    associated_root_cause: Optional[str] = None
    reason_for_recommendation: Optional[str] = None
    priority: str = "High"  # Critical, High, Medium, Low
    owner: str
    due_date: Optional[str] = None
    status: str = "Proposed"  # Proposed, Under Review, Approved, In Progress, Completed, Effectiveness Pending, Effective, Ineffective
    verification_criteria: Optional[str] = None
    effectiveness_result: Optional[str] = None
    is_ai_generated: bool = True

class CapaActionCreate(CapaActionBase):
    pass

class CapaActionUpdate(BaseModel):
    action_type: Optional[str] = None
    description: Optional[str] = None
    associated_root_cause: Optional[str] = None
    reason_for_recommendation: Optional[str] = None
    priority: Optional[str] = None
    owner: Optional[str] = None
    due_date: Optional[str] = None
    status: Optional[str] = None
    verification_criteria: Optional[str] = None
    effectiveness_result: Optional[str] = None

class CapaActionResponse(CapaActionBase):
    id: str
    investigation_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Document Schemas ---
class SourceDocumentResponse(BaseModel):
    id: str
    investigation_id: str
    file_name: str
    file_type: str
    source_type: str
    file_size: int
    extracted_text: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True


# --- Activity Schemas ---
class ActivityResponse(BaseModel):
    id: str
    investigation_id: str
    activity_type: str
    description: str
    performed_by: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Investigation Schemas ---
class InvestigationBase(BaseModel):
    title: str
    incident_description: Optional[str] = None
    product_name: Optional[str] = None
    batch_number: Optional[str] = None
    manufacturing_stage: Optional[str] = None
    equipment_id: Optional[str] = None
    incident_date: Optional[str] = None
    detection_date: Optional[str] = None
    severity: str = "Major"
    investigator: str = "Quality Lead Investigator"
    immediate_actions_taken: Optional[str] = None
    potential_product_impact: Optional[str] = None
    potential_patient_impact: Optional[str] = None
    selected_methodology: str = "both"

    # AIVOA Copilot QMS Layout fields
    complaint_source: Optional[str] = None
    customer_name: Optional[str] = None
    product_strength: Optional[str] = None
    affected_quantity: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    originating_site_block: Optional[str] = None
    impacted_npm: Optional[str] = None
    defect_category: Optional[str] = None
    suggested_next_action: Optional[str] = None
    initial_risk_assessment: Optional[str] = None

class InvestigationCreate(InvestigationBase):
    investigation_number: Optional[str] = None

class InvestigationUpdate(BaseModel):
    title: Optional[str] = None
    incident_description: Optional[str] = None
    product_name: Optional[str] = None
    batch_number: Optional[str] = None
    manufacturing_stage: Optional[str] = None
    equipment_id: Optional[str] = None
    incident_date: Optional[str] = None
    detection_date: Optional[str] = None
    severity: Optional[str] = None
    investigation_status: Optional[str] = None
    investigator: Optional[str] = None
    immediate_actions_taken: Optional[str] = None
    potential_product_impact: Optional[str] = None
    potential_patient_impact: Optional[str] = None
    missing_information: Optional[List[str]] = None
    selected_methodology: Optional[str] = None
    investigation_summary: Optional[Dict[str, Any]] = None

    complaint_source: Optional[str] = None
    customer_name: Optional[str] = None
    product_strength: Optional[str] = None
    affected_quantity: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None
    originating_site_block: Optional[str] = None
    impacted_npm: Optional[str] = None
    defect_category: Optional[str] = None
    suggested_next_action: Optional[str] = None
    initial_risk_assessment: Optional[str] = None

class InvestigationDetailResponse(InvestigationBase):
    id: str
    investigation_number: str
    investigation_status: str
    missing_information: List[str] = []
    investigation_summary: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime

    documents: List[SourceDocumentResponse] = []
    extracted_fields: List[ExtractedFieldResponse] = []
    evidence_items: List[EvidenceResponse] = []
    root_causes: List[RootCauseResponse] = []
    five_whys_steps: List[FiveWhysItem] = []
    capa_actions: List[CapaActionResponse] = []
    activities: List[ActivityResponse] = []

    class Config:
        from_attributes = True

class InvestigationListItem(BaseModel):
    id: str
    investigation_number: str
    title: str
    product_name: Optional[str] = None
    batch_number: Optional[str] = None
    manufacturing_stage: Optional[str] = None
    incident_date: Optional[str] = None
    severity: str
    investigation_status: str
    investigator: str
    created_at: datetime
    updated_at: datetime
    capa_count: int = 0
    evidence_count: int = 0
    root_cause_count: int = 0

    class Config:
        from_attributes = True


# --- AI Intake & Analysis Requests ---
class TextIntakeRequest(BaseModel):
    text: str
    source_type: str = "pasted_text"  # pasted_text, email_intake
    title: Optional[str] = None
    investigation_id: Optional[str] = None

class AIAnalyzeRequest(BaseModel):
    investigation_id: str
    methodology: str = "both"  # 5_whys, fishbone, both


# --- Dashboard Metrics ---
class DashboardMetrics(BaseModel):
    total_investigations: int
    open_investigations: int
    under_review_investigations: int
    completed_investigations: int
    high_risk_investigations: int
    pending_capa_actions: int
    overdue_capa_actions: int
    status_distribution: Dict[str, int]
    risk_distribution: Dict[str, int]
    severity_distribution: Dict[str, int]
    recent_activities: List[Dict[str, Any]]
