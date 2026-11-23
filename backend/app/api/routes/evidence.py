from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.app.core.database import get_db
from backend.app.models.models import Evidence, InvestigationActivity
from backend.app.schemas.schemas import EvidenceCreate, EvidenceUpdate, EvidenceResponse

router = APIRouter()

@router.get("/investigations/{investigation_id}/evidence", response_model=List[EvidenceResponse])
def get_investigation_evidence(
    investigation_id: str,
    db: Session = Depends(get_db)
):
    items = db.query(Evidence).filter(Evidence.investigation_id == investigation_id).all()
    return items

@router.post("/investigations/{investigation_id}/evidence", response_model=EvidenceResponse)
def add_evidence(
    investigation_id: str,
    data: EvidenceCreate,
    db: Session = Depends(get_db)
):
    ev = Evidence(
        investigation_id=investigation_id,
        evidence_type=data.evidence_type,
        title=data.title,
        description=data.description,
        source_reference=data.source_reference,
        observation=data.observation,
        linked_root_cause=data.linked_root_cause,
        review_status=data.review_status
    )
    db.add(ev)
    
    act = InvestigationActivity(
        investigation_id=investigation_id,
        activity_type="evidence_added",
        description=f"Evidence '{ev.title}' ({ev.evidence_type}) added to investigation.",
        performed_by="Quality Lead Investigator"
    )
    db.add(act)
    db.commit()
    db.refresh(ev)
    return ev

@router.put("/evidence/{evidence_id}", response_model=EvidenceResponse)
def update_evidence(
    evidence_id: str,
    data: EvidenceUpdate,
    db: Session = Depends(get_db)
):
    ev = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence item not found")

    for k, v in data.dict(exclude_unset=True).items():
        setattr(ev, k, v)

    db.commit()
    db.refresh(ev)
    return ev

@router.delete("/evidence/{evidence_id}")
def delete_evidence(
    evidence_id: str,
    db: Session = Depends(get_db)
):
    ev = db.query(Evidence).filter(Evidence.id == evidence_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Evidence item not found")

    db.delete(ev)
    db.commit()
    return {"message": "Evidence item deleted"}
