import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.core.database import get_db, Base, engine
from backend.app.document_processing.synthetic_pdf_generator import generate_sample_incident_pdf
from backend.app.services.seed_service import seed_database_if_empty

router = APIRouter()

@router.get("/download-sample-pdf")
def download_sample_pdf():
    """
    Downloads an authentic GMP Quality Incident PDF report for demonstration and testing.
    Scenario: Atorvastatin Calcium Trihydrate - Impurity B Alert Excursion.
    """
    sample_pdf_path = os.path.join(settings.UPLOAD_DIR, "sample_incident_DEV-2026-0891.pdf")
    if not os.path.exists(sample_pdf_path):
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        generate_sample_incident_pdf(sample_pdf_path)

    return FileResponse(
        path=sample_pdf_path,
        filename="AURA_GMP_Deviation_DEV-2026-0891.pdf",
        media_type="application/pdf"
    )

@router.get("/sample-scenario")
def get_sample_scenario():
    """
    Returns synthetic incident text and email formats for one-click testing.
    """
    pasted_text = (
        "QUALITY INCIDENT MEMORANDUM — AURA PHARMA API DIVISION\n"
        "Incident ID: DEV-2026-0891\n"
        "Date of Incident: 2026-10-14 | Date Detected: 2026-10-15\n"
        "Product / API: Atorvastatin Calcium Trihydrate (Synthetic API)\n"
        "Batch Number: API-BT-2026-014\n"
        "Manufacturing Stage: Stage 4: Crystallization & Cooling\n"
        "Equipment Involved: CR-402 (10,000L Jacketed Crystallizer)\n"
        "Severity: Major (Critical In-Process Alert)\n\n"
        "Incident Description:\n"
        "During routine in-process HPLC purity testing for commercial batch API-BT-2026-014, "
        "Quality Control observed an unexpected peak elevation corresponding to Related Substance B (0.38% w/w), "
        "which exceeds the internal Quality Alert Limit of 0.25% w/w (Specification Limit: NMT 0.50% w/w).\n\n"
        "Process & Engineering Observations:\n"
        "- SCADA Historian indicates that at 14:22 UTC during cooling ramp (Step 4.4), jacket valve CV-402 experienced oscillation.\n"
        "- The batch solution plateaued at 42.5°C for 84 minutes instead of the validated max hold of 15 minutes.\n"
        "- Related Substance B is a known thermal isomer degradation product when solution temperature >38°C for prolonged holding.\n"
        "- Metrology confirmed primary RTD sensor TT-402A calibrated on 2026-09-01, but valve actuator CV-402 had dried silicone in positioner diaphragm.\n"
        "- Raw material precursor RM-CAT-8812 conformed with specification (<0.05% initial impurity).\n\n"
        "Immediate Containment Actions:\n"
        "- Batch API-BT-2026-014 placed on QA Quarantine Hold in isolation Bay 4.\n"
        "- Crystallizer CR-402 tagged Out-of-Service pending valve positioner overhaul.\n"
        "- Subsequent batch API-BT-2026-015 paused."
    )

    email_text = (
        "From: quality.assurance@aurapharma-demo.com\n"
        "To: rca-investigations@aurapharma-demo.com\n"
        "Date: Wed, 15 Oct 2026 09:14:22 +0000\n"
        "Subject: URGENT: Alert Excursion in Stage 4 Crystallization - Batch API-BT-2026-014\n\n"
        "Dear Investigation Team,\n\n"
        "Please initiate an immediate Root Cause Analysis for commercial batch API-BT-2026-014 of Atorvastatin Calcium Trihydrate.\n\n"
        "In-process HPLC assay result came in this morning at 0.38% w/w for Related Substance B, exceeding our internal alert limit of 0.25% w/w (final release spec is NMT 0.50% w/w).\n\n"
        "The shift lead noted that crystallizer vessel CR-402 experienced a temperature hold issue yesterday (2026-10-14) during cooling step 4.4: temperature remained stuck at 42.5°C for 84 minutes due to valve CV-402 stick-slip.\n\n"
        "Batch is quarantined in Bay 4. Please run complete 5 Whys and Fishbone to establish corrective and preventive actions before QA committee review on Friday.\n\n"
        "Regards,\n"
        "Dr. Eleanor Vance\n"
        "Senior Quality Specialist"
    )

    return {
        "title": "Unexpected Increase in Related Substance B Impurity During Crystallization",
        "batch_number": "API-BT-2026-014",
        "product_name": "Atorvastatin Calcium Trihydrate (Synthetic API)",
        "pasted_text": pasted_text,
        "email_text": email_text
    }

@router.post("/reset-demo")
def reset_demo(db: Session = Depends(get_db)):
    """Resets database and re-seeds primary synthetic demo investigations."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    seed_database_if_empty(db)
    return {"message": "Database reset and re-seeded with demo pharmaceutical investigations."}
