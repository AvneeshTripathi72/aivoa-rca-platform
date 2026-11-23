import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    investigation_number = Column(String(50), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    incident_description = Column(Text, nullable=True)
    product_name = Column(String(255), nullable=True)
    batch_number = Column(String(100), index=True, nullable=True)
    manufacturing_stage = Column(String(100), nullable=True)
    equipment_id = Column(String(100), nullable=True)
    incident_date = Column(String(50), nullable=True)
    detection_date = Column(String(50), nullable=True)
    severity = Column(String(50), default="Major", nullable=False)  # Minor, Major, Critical
    investigation_status = Column(String(50), default="Draft", index=True, nullable=False)
    # Statuses: Draft, Information Extraction, Under Investigation, Root Cause Review, CAPA Review, Pending Approval, Closed
    investigator = Column(String(150), default="Quality Lead Investigator", nullable=False)
    
    immediate_actions_taken = Column(Text, nullable=True)
    potential_product_impact = Column(Text, nullable=True)
    potential_patient_impact = Column(Text, nullable=True)

    # Form fields matching AIVOA Copilot QMS Layout
    complaint_source = Column(String(100), nullable=True)
    customer_name = Column(String(255), nullable=True)
    product_strength = Column(String(100), nullable=True)
    affected_quantity = Column(String(100), nullable=True)
    manufacturing_date = Column(String(50), nullable=True)
    expiry_date = Column(String(50), nullable=True)
    originating_site_block = Column(String(100), nullable=True)
    impacted_npm = Column(String(255), nullable=True)
    defect_category = Column(String(150), nullable=True)
    suggested_next_action = Column(Text, nullable=True)
    initial_risk_assessment = Column(Text, nullable=True)

    missing_information = Column(JSON, default=list)
    selected_methodology = Column(String(50), default="both")  # 5_whys, fishbone, both
    investigation_summary = Column(JSON, default=dict)
    
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    documents = relationship("SourceDocument", back_populates="investigation", cascade="all, delete-orphan")
    extracted_fields = relationship("ExtractedInformation", back_populates="investigation", cascade="all, delete-orphan")
    evidence_items = relationship("Evidence", back_populates="investigation", cascade="all, delete-orphan")
    root_causes = relationship("RootCause", back_populates="investigation", cascade="all, delete-orphan")
    five_whys_steps = relationship("FiveWhys", back_populates="investigation", cascade="all, delete-orphan", order_by="FiveWhys.sequence_number")
    capa_actions = relationship("CapaAction", back_populates="investigation", cascade="all, delete-orphan")
    activities = relationship("InvestigationActivity", back_populates="investigation", cascade="all, delete-orphan", order_by="InvestigationActivity.created_at.desc()")


class SourceDocument(Base):
    __tablename__ = "source_documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, docx, txt, email
    source_type = Column(String(50), nullable=False)  # upload_pdf, pasted_text, email_intake
    file_size = Column(Integer, default=0)
    extracted_text = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    investigation = relationship("Investigation", back_populates="documents")


class ExtractedInformation(Base):
    __tablename__ = "extracted_information"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    field_name = Column(String(100), nullable=False)
    extracted_value = Column(Text, nullable=True)
    source_reference = Column(String(255), nullable=True)
    confidence = Column(Float, default=1.0)
    review_status = Column(String(50), default="suggested")  # suggested, accepted, rejected, edited

    investigation = relationship("Investigation", back_populates="extracted_fields")


class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    evidence_type = Column(String(100), nullable=False)  # Batch Manufacturing Record, Equipment Maintenance, Calibration, Analytical Lab Result, Environmental Monitoring, SOP, Training Record, Process Log, Personnel Statement, Other
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    source_reference = Column(String(255), nullable=True)
    observation = Column(Text, nullable=True)
    linked_root_cause = Column(String(255), nullable=True)
    review_status = Column(String(50), default="Verified")  # Verified, Pending Verification, Contradictory, Inconclusive
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    investigation = relationship("Investigation", back_populates="evidence_items")


class RootCause(Base):
    __tablename__ = "root_causes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    methodology = Column(String(50), default="fishbone")  # fishbone, 5_whys
    cause_category = Column(String(100), nullable=False)  # Man, Machine, Method, Material, Measurement, Environment
    cause_description = Column(Text, nullable=False)
    supporting_evidence = Column(JSON, default=list)
    contradictory_evidence = Column(JSON, default=list)
    evidence_strength = Column(String(50), default="Moderate")  # High, Moderate, Low, None
    verification_status = Column(String(50), default="Hypothesis")  # Hypothesis, Evidence-Supported, Human-Confirmed, Rejected
    is_primary_root_cause = Column(Boolean, default=False)
    investigator_decision_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    investigation = relationship("Investigation", back_populates="root_causes")


class FiveWhys(Base):
    __tablename__ = "five_whys"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    sequence_number = Column(Integer, nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    evidence_reference = Column(String(255), nullable=True)
    is_root_cause = Column(Boolean, default=False)
    status = Column(String(50), default="AI-Suggested")  # AI-Suggested, Human-Validated, Rejected

    investigation = relationship("Investigation", back_populates="five_whys_steps")


class CapaAction(Base):
    __tablename__ = "capa_actions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    action_number = Column(String(50), nullable=False)
    action_type = Column(String(50), nullable=False)  # Corrective, Preventive
    description = Column(Text, nullable=False)
    associated_root_cause = Column(Text, nullable=True)
    reason_for_recommendation = Column(Text, nullable=True)
    priority = Column(String(50), default="High")  # Critical, High, Medium, Low
    owner = Column(String(150), nullable=False)  # Department or Role
    due_date = Column(String(50), nullable=True)
    status = Column(String(50), default="Proposed")
    # Proposed, Under Review, Approved, In Progress, Completed, Effectiveness Pending, Effective, Ineffective
    verification_criteria = Column(Text, nullable=True)
    effectiveness_result = Column(Text, nullable=True)
    is_ai_generated = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    investigation = relationship("Investigation", back_populates="capa_actions")


class InvestigationActivity(Base):
    __tablename__ = "investigation_activity"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    investigation_id = Column(String(36), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    performed_by = Column(String(150), default="Quality Lead Investigator", nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    investigation = relationship("Investigation", back_populates="activities")
