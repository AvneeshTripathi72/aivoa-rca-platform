import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.app.core.database import get_db
from backend.app.models.models import (
    CapaAction,
    RootCause,
    FiveWhys,
    InvestigationActivity
)
from backend.app.schemas.schemas import (
    CapaActionCreate,
    CapaActionUpdate,
    CapaActionResponse,
    RootCauseUpdate,
    RootCauseResponse,
    FiveWhysItem,
    FiveWhysUpdate
)

router = APIRouter()

# --- CAPA Endpoints ---
@router.get("/investigations/{investigation_id}/capa", response_model=List[CapaActionResponse])
def get_investigation_capas(
    investigation_id: str,
    db: Session = Depends(get_db)
):
    items = db.query(CapaAction).filter(CapaAction.investigation_id == investigation_id).all()
    return items

@router.post("/investigations/{investigation_id}/capa", response_model=CapaActionResponse)
def create_capa(
    investigation_id: str,
    data: CapaActionCreate,
    db: Session = Depends(get_db)
):
    action_num = data.action_number or f"CAPA-{datetime.utcnow().year}-{uuid.uuid4().hex[:4].upper()}"
    capa = CapaAction(
        investigation_id=investigation_id,
        action_number=action_num,
        action_type=data.action_type,
        description=data.description,
        associated_root_cause=data.associated_root_cause,
        reason_for_recommendation=data.reason_for_recommendation,
        priority=data.priority,
        owner=data.owner,
        due_date=data.due_date,
        status=data.status or "Proposed",
        verification_criteria=data.verification_criteria,
        effectiveness_result=data.effectiveness_result,
        is_ai_generated=data.is_ai_generated
    )
    db.add(capa)
    
    act = InvestigationActivity(
        investigation_id=investigation_id,
        activity_type="capa_generated",
        description=f"CAPA '{action_num}' ({capa.action_type}) created for {capa.owner}.",
        performed_by="Quality Lead Investigator"
    )
    db.add(act)
    db.commit()
    db.refresh(capa)
    return capa

@router.put("/capa/{capa_id}", response_model=CapaActionResponse)
def update_capa(
    capa_id: str,
    data: CapaActionUpdate,
    db: Session = Depends(get_db)
):
    capa = db.query(CapaAction).filter(CapaAction.id == capa_id).first()
    if not capa:
        raise HTTPException(status_code=404, detail="CAPA action not found")

    old_status = capa.status
    for k, v in data.dict(exclude_unset=True).items():
        setattr(capa, k, v)
        
    capa.updated_at = datetime.utcnow()

    if data.status and data.status != old_status:
        act = InvestigationActivity(
            investigation_id=capa.investigation_id,
            activity_type="status_changed",
            description=f"CAPA {capa.action_number} status changed from '{old_status}' to '{data.status}'.",
            performed_by="Quality Lead Investigator"
        )
        db.add(act)

    db.commit()
    db.refresh(capa)
    return capa

@router.delete("/capa/{capa_id}")
def delete_capa(
    capa_id: str,
    db: Session = Depends(get_db)
):
    capa = db.query(CapaAction).filter(CapaAction.id == capa_id).first()
    if not capa:
        raise HTTPException(status_code=404, detail="CAPA action not found")

    db.delete(capa)
    db.commit()
    return {"message": "CAPA action deleted"}


# --- Root Cause & Fishbone Endpoints ---
@router.put("/root-causes/{root_cause_id}", response_model=RootCauseResponse)
def update_root_cause(
    root_cause_id: str,
    data: RootCauseUpdate,
    db: Session = Depends(get_db)
):
    rc = db.query(RootCause).filter(RootCause.id == root_cause_id).first()
    if not rc:
        raise HTTPException(status_code=404, detail="Root cause not found")

    for k, v in data.dict(exclude_unset=True).items():
        setattr(rc, k, v)

    # Note: Only humans can set status to Human-Confirmed
    if data.verification_status == "Human-Confirmed":
        act = InvestigationActivity(
            investigation_id=rc.investigation_id,
            activity_type="root_cause_analyzed",
            description=f"Root cause in category '{rc.cause_category}' was officially validated as Human-Confirmed.",
            performed_by="Quality Lead Investigator"
        )
        db.add(act)

    db.commit()
    db.refresh(rc)
    return rc


# --- 5 Whys Endpoints ---
@router.post("/investigations/{investigation_id}/five-whys")
def add_five_whys_step(
    investigation_id: str,
    step: FiveWhysItem,
    db: Session = Depends(get_db)
):
    fw = FiveWhys(
        investigation_id=investigation_id,
        sequence_number=step.sequence_number,
        question=step.question,
        answer=step.answer,
        evidence_reference=step.evidence_reference,
        is_root_cause=step.is_root_cause,
        status=step.status
    )
    db.add(fw)
    db.commit()
    db.refresh(fw)
    return fw

@router.put("/five-whys/{five_whys_id}")
def update_five_whys_step(
    five_whys_id: str,
    data: FiveWhysUpdate,
    db: Session = Depends(get_db)
):
    fw = db.query(FiveWhys).filter(FiveWhys.id == five_whys_id).first()
    if not fw:
        raise HTTPException(status_code=404, detail="5 Whys step not found")

    for k, v in data.dict(exclude_unset=True).items():
        setattr(fw, k, v)

    db.commit()
    db.refresh(fw)
    return fw

@router.delete("/five-whys/{five_whys_id}")
def delete_five_whys_step(
    five_whys_id: str,
    db: Session = Depends(get_db)
):
    fw = db.query(FiveWhys).filter(FiveWhys.id == five_whys_id).first()
    if not fw:
        raise HTTPException(status_code=404, detail="5 Whys step not found")

    db.delete(fw)
    db.commit()
    return {"message": "5 Whys step deleted"}
