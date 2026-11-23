import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional

from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.document_processing.extractor import DocumentExtractor
from backend.app.services.investigation_service import InvestigationService
from backend.app.ai.groq_client import groq_service
from backend.app.schemas.schemas import TextIntakeRequest, AIAnalyzeRequest

router = APIRouter()

@router.get("/status")
def get_ai_status():
    """
    Returns the live status of the AI engine and Groq LLM integration.
    Surfaces clear status to frontend.
    """
    is_conf = groq_service.is_configured
    return {
        "is_configured": is_conf,
        "active_model": settings.GROQ_MODEL,
        "fallback_model": settings.GROQ_FALLBACK_MODEL,
        "mode": "Live Groq LLM Inference" if is_conf else "Pharmaceutical Domain Synthetic Engine (Demo Mode)",
        "message": (
            "Connected to Groq Cloud LLM API."
            if is_conf else
            "Groq API key not set in backend .env. Operating in high-fidelity Pharmaceutical Quality Demo Mode. All generated hypotheses are clearly labelled."
        )
    }

@router.post("/upload-document")
async def upload_document(
    file: UploadFile = File(...),
    investigation_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Handles PDF, DOCX, or text file upload.
    Validates file size/type, extracts text, runs LangGraph 10-node RCA workflow,
    auto-populates investigation form, and saves to database.
    """
    # 1. Read file bytes and validate
    content = await file.read()
    file_size = len(content)
    file_name = file.filename or "uploaded_document"
    
    try:
        DocumentExtractor.validate_file(file_name, file_size)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 2. Save file temporarily
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    temp_file_path = os.path.join(settings.UPLOAD_DIR, f"{file.filename}")
    with open(temp_file_path, "wb") as f:
        f.write(content)

    # 3. Extract text
    try:
        extracted_text = DocumentExtractor.extract_text(temp_file_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text extraction failed: {str(e)}")

    if not extracted_text.strip():
        raise HTTPException(status_code=400, detail="Document appears to be empty or contains non-extractable text.")

    # 4. Execute LangGraph Workflow and persist
    source_type = f"upload_{os.path.splitext(file_name)[1].lstrip('.').lower()}"
    result = InvestigationService.process_ai_workflow(
        db=db,
        raw_text=extracted_text,
        source_type=source_type,
        file_name=file_name,
        investigation_id=investigation_id
    )

    return {
        "message": "Document processed and investigation auto-populated successfully.",
        "investigation_id": result["investigation"].id,
        "investigation_number": result["investigation"].investigation_number,
        "investigation": result["investigation"],
        "execution_log": result["execution_log"],
        "is_synthetic_mode": result["is_synthetic_mode"],
        "model_used": result["model_used"]
    }

@router.post("/text-intake")
def text_intake(
    payload: TextIntakeRequest,
    db: Session = Depends(get_db)
):
    """
    Intake raw manufacturing notes or deviation description text.
    Runs LangGraph workflow and auto-populates the investigation.
    """
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Incident text cannot be empty.")

    result = InvestigationService.process_ai_workflow(
        db=db,
        raw_text=payload.text.strip(),
        source_type="pasted_text",
        file_name=payload.title or "Pasted Incident Notes",
        investigation_id=payload.investigation_id
    )

    return {
        "message": "Incident notes processed and investigation auto-populated successfully.",
        "investigation_id": result["investigation"].id,
        "investigation_number": result["investigation"].investigation_number,
        "investigation": result["investigation"],
        "execution_log": result["execution_log"],
        "is_synthetic_mode": result["is_synthetic_mode"],
        "model_used": result["model_used"]
    }

@router.post("/email-intake")
def email_intake(
    payload: TextIntakeRequest,
    db: Session = Depends(get_db)
):
    """
    Intake email containing incident notice.
    Parses headers, runs LangGraph workflow, auto-populates investigation form.
    """
    if not payload.text or not payload.text.strip():
        raise HTTPException(status_code=400, detail="Email body cannot be empty.")

    parsed_email = DocumentExtractor.extract_from_email(payload.text)
    
    result = InvestigationService.process_ai_workflow(
        db=db,
        raw_text=parsed_email["text"],
        source_type="email_intake",
        file_name=f"Email: {parsed_email.get('subject', 'Quality Incident')}",
        investigation_id=payload.investigation_id
    )

    return {
        "message": "Email notification parsed and investigation auto-populated.",
        "investigation_id": result["investigation"].id,
        "investigation_number": result["investigation"].investigation_number,
        "investigation": result["investigation"],
        "email_metadata": {
            "subject": parsed_email.get("subject"),
            "sender": parsed_email.get("sender"),
            "date": parsed_email.get("date")
        },
        "execution_log": result["execution_log"],
        "is_synthetic_mode": result["is_synthetic_mode"],
        "model_used": result["model_used"]
    }

@router.post("/analyze-incident")
def reanalyze_incident(
    payload: AIAnalyzeRequest,
    db: Session = Depends(get_db)
):
    """
    Re-runs RCA and CAPA analysis on an existing investigation.
    Useful when investigator changes methodology or updates underlying observations.
    """
    inv = InvestigationService.get_investigation_by_id(db, payload.investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    # Combine observations and existing text
    source_text = f"Incident: {inv.title}\nDescription: {inv.incident_description}\nProduct: {inv.product_name}\nBatch: {inv.batch_number}\nStage: {inv.manufacturing_stage}\nEquipment: {inv.equipment_id}"
    
    result = InvestigationService.process_ai_workflow(
        db=db,
        raw_text=source_text,
        source_type="reanalysis",
        file_name=f"Re-analysis of {inv.investigation_number}",
        investigation_id=inv.id
    )

    return {
        "message": "Investigation re-analyzed successfully.",
        "investigation": result["investigation"],
        "execution_log": result["execution_log"],
        "is_synthetic_mode": result["is_synthetic_mode"]
    }
