import os
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.document_processing.extractor import DocumentExtractor
from backend.app.services.copilot_service import CopilotService
from backend.app.services.investigation_service import InvestigationService
from backend.app.models.models import Investigation, InvestigationActivity

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    current_form: Optional[Dict[str, Any]] = None
    current_form_data: Optional[Dict[str, Any]] = None
    attachment_filename: Optional[str] = None

class CommitRequest(BaseModel):
    form_data: Optional[Dict[str, Any]] = None

    class Config:
        extra = "allow"

@router.post("/chat")
def copilot_chat(payload: ChatRequest):
    """
    Conversational Copilot tool processing:
    - Log Complaint / Incident Tool (from prompt)
    - Edit Complaint Tool (from natural language corrections)
    """
    active_form = payload.current_form if payload.current_form is not None else (payload.current_form_data or {})
    res = CopilotService.process_chat_message(
        message=payload.message,
        current_form=active_form,
        attachment_filename=payload.attachment_filename
    )
    return res

@router.post("/upload")
async def copilot_upload(
    file: UploadFile = File(...),
    current_form_json: Optional[str] = Form("{}")
):
    """
    Document Extraction Tool:
    Accepts PDF / DOCX, extracts text with PyMuPDF, and auto-populates the form & risk assessment.
    """
    import json
    try:
        current_form = json.loads(current_form_json)
    except Exception:
        current_form = {}

    content = await file.read()
    file_name = file.filename or "uploaded_document.pdf"
    
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    temp_path = os.path.join(settings.UPLOAD_DIR, file_name)
    with open(temp_path, "wb") as f:
        f.write(content)

    try:
        extracted_text = DocumentExtractor.extract_text(temp_path)
    except Exception as e:
        extracted_text = f"Content of {file_name}"

    res = CopilotService.process_chat_message(
        message=f"Please analyze attached document {file_name}",
        current_form=current_form,
        attachment_filename=file_name,
        extracted_doc_text=extracted_text
    )
    res["file_name"] = file_name
    return res

@router.post("/commit")
def commit_to_qms(payload: CommitRequest, db: Session = Depends(get_db)):
    """
    Commits the populated form to the QMS ledger and triggers full RCA.
    """
    data = payload.form_data if payload.form_data is not None else payload.dict()
    inv_num = InvestigationService.generate_investigation_number(db)
    
    risk_val = data.get("initial_risk_assessment")
    if isinstance(risk_val, dict):
        risk_str = json.dumps(risk_val)
    else:
        risk_str = str(risk_val) if risk_val is not None else None

    inv = Investigation(
        investigation_number=inv_num,
        title=data.get("title") or f"Quality Incident - {data.get('product_name', 'API')}",
        incident_description=data.get("incident_description") or (risk_str or "Incident details logged via AIVOA Copilot."),
        product_name=data.get("product_name"),
        batch_number=data.get("batch_number"),
        manufacturing_stage=data.get("originating_site_block") or "Manufacturing",
        equipment_id=data.get("impacted_npm") or "CR-402",
        incident_date=data.get("manufacturing_date") or "2026-10-14",
        detection_date="2026-10-15",
        severity=data.get("severity") or "Major",
        investigation_status="Under Investigation",
        investigator="Quality Lead Investigator",
        
        # Copilot layout fields
        complaint_source=data.get("complaint_source"),
        customer_name=data.get("customer_name"),
        product_strength=data.get("product_strength"),
        affected_quantity=data.get("affected_quantity"),
        manufacturing_date=data.get("manufacturing_date"),
        expiry_date=data.get("expiry_date"),
        originating_site_block=data.get("originating_site_block"),
        impacted_npm=data.get("impacted_npm"),
        defect_category=data.get("defect_category"),
        suggested_next_action=data.get("suggested_next_action"),
        initial_risk_assessment=risk_str,
        
        selected_methodology="both"
    )
    db.add(inv)
    db.flush()

    # Log audit trail
    act = InvestigationActivity(
        investigation_id=inv.id,
        activity_type="created",
        description=f"Investigation committed to QMS Ledger from AIVOA Copilot. Batch: {inv.batch_number}.",
        performed_by="AIVOA Copilot"
    )
    db.add(act)

    # Initialize standard 5 Whys and Fishbone for the committed batch
    source_text = f"Batch {inv.batch_number} of {inv.product_name}. Excursion: {inv.incident_description}. Risk: {inv.initial_risk_assessment}"
    InvestigationService.process_ai_workflow(
        db=db,
        raw_text=source_text,
        source_type="copilot_intake",
        file_name="AIVOA Copilot Intake",
        investigation_id=inv.id
    )

    db.commit()
    db.refresh(inv)

    return {
        "message": "Successfully committed to QMS Ledger.",
        "investigation_id": inv.id,
        "investigation_number": inv.investigation_number
    }
