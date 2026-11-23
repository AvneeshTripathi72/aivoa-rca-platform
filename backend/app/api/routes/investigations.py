from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from backend.app.core.database import get_db
from backend.app.schemas.schemas import (
    InvestigationCreate,
    InvestigationUpdate,
    InvestigationDetailResponse,
    InvestigationListItem
)
from backend.app.services.investigation_service import InvestigationService
from backend.app.models.models import Investigation, InvestigationActivity

router = APIRouter()

@router.get("", response_model=dict)
def list_investigations(
    search: Optional[str] = None,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    items, total = InvestigationService.get_investigations(db, search, status, severity, skip, limit)
    
    # Calculate child counts
    results = []
    for inv in items:
        item_dict = {
            "id": inv.id,
            "investigation_number": inv.investigation_number,
            "title": inv.title,
            "product_name": inv.product_name,
            "batch_number": inv.batch_number,
            "manufacturing_stage": inv.manufacturing_stage,
            "incident_date": inv.incident_date,
            "severity": inv.severity,
            "investigation_status": inv.investigation_status,
            "investigator": inv.investigator,
            "created_at": inv.created_at,
            "updated_at": inv.updated_at,
            "capa_count": len(inv.capa_actions),
            "evidence_count": len(inv.evidence_items),
            "root_cause_count": len(inv.root_causes),
        }
        results.append(item_dict)

    return {
        "items": results,
        "total": total,
        "skip": skip,
        "limit": limit
    }

@router.post("", response_model=InvestigationDetailResponse)
def create_investigation(
    data: InvestigationCreate,
    db: Session = Depends(get_db)
):
    inv = InvestigationService.create_investigation(db, data)
    return inv

@router.get("/{investigation_id}", response_model=InvestigationDetailResponse)
def get_investigation(
    investigation_id: str,
    db: Session = Depends(get_db)
):
    inv = InvestigationService.get_investigation_by_id(db, investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return inv

@router.put("/{investigation_id}", response_model=InvestigationDetailResponse)
def update_investigation(
    investigation_id: str,
    data: InvestigationUpdate,
    db: Session = Depends(get_db)
):
    inv = InvestigationService.update_investigation(db, investigation_id, data)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return inv

@router.delete("/{investigation_id}")
def delete_investigation(
    investigation_id: str,
    db: Session = Depends(get_db)
):
    success = InvestigationService.delete_investigation(db, investigation_id)
    if not success:
        raise HTTPException(status_code=404, detail="Investigation not found")
    return {"message": "Investigation successfully deleted"}

@router.post("/{investigation_id}/status")
def update_investigation_status(
    investigation_id: str,
    payload: dict,
    db: Session = Depends(get_db)
):
    new_status = payload.get("status")
    notes = payload.get("notes", "")
    investigator = payload.get("investigator", "Quality Lead Investigator")

    valid_statuses = [
        "Draft",
        "Information Extraction",
        "Under Investigation",
        "Root Cause Review",
        "CAPA Review",
        "Pending Approval",
        "Closed"
    ]
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Allowed: {valid_statuses}")

    inv = InvestigationService.get_investigation_by_id(db, investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    old_status = inv.investigation_status
    inv.investigation_status = new_status
    inv.updated_at = datetime.utcnow()

    # Log audit activity
    act = InvestigationActivity(
        investigation_id=inv.id,
        activity_type="status_changed",
        description=f"Status advanced from '{old_status}' to '{new_status}'. Notes: {notes}",
        performed_by=investigator
    )
    db.add(act)
    db.commit()
    db.refresh(inv)

    return {"message": f"Status updated to {new_status}", "investigation": inv}

@router.post("/{investigation_id}/approve")
def approve_investigation(
    investigation_id: str,
    payload: dict,
    db: Session = Depends(get_db)
):
    approver = payload.get("approver", "Dr. Eleanor Vance, Senior QA Specialist")
    comments = payload.get("comments", "All root causes substantiated by empirical evidence. Approved under GMP authority.")

    inv = InvestigationService.get_investigation_by_id(db, investigation_id)
    if not inv:
        raise HTTPException(status_code=404, detail="Investigation not found")

    inv.investigation_status = "Closed"
    inv.updated_at = datetime.utcnow()

    act = InvestigationActivity(
        investigation_id=inv.id,
        activity_type="approved",
        description=f"Investigation formally approved and closed by {approver}. Comments: {comments}",
        performed_by=approver
    )
    db.add(act)
    db.commit()
    db.refresh(inv)

    return {"message": "Investigation successfully approved and closed.", "investigation": inv}
