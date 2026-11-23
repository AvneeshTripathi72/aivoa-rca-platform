import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, func

from backend.app.models.models import (
    Investigation,
    SourceDocument,
    ExtractedInformation,
    Evidence,
    RootCause,
    FiveWhys,
    CapaAction,
    InvestigationActivity
)
from backend.app.schemas.schemas import InvestigationCreate, InvestigationUpdate
from backend.app.ai.graph import rca_graph
from backend.app.ai.state import RCAWorkflowState

class InvestigationService:

    @staticmethod
    def generate_investigation_number(db: Session) -> str:
        count = db.query(func.count(Investigation.id)).scalar() or 0
        year = datetime.utcnow().year
        return f"RCA-{year}-{count + 1:03d}"

    @staticmethod
    def get_investigations(
        db: Session,
        search: Optional[str] = None,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ):
        query = db.query(Investigation)
        
        if search:
            search_fmt = f"%{search}%"
            query = query.filter(
                (Investigation.investigation_number.ilike(search_fmt)) |
                (Investigation.title.ilike(search_fmt)) |
                (Investigation.batch_number.ilike(search_fmt)) |
                (Investigation.product_name.ilike(search_fmt))
            )
            
        if status and status != "All":
            query = query.filter(Investigation.investigation_status == status)
            
        if severity and severity != "All":
            query = query.filter(Investigation.severity == severity)
            
        total = query.count()
        items = query.order_by(desc(Investigation.created_at)).offset(skip).limit(limit).all()
        return items, total

    @staticmethod
    def get_investigation_by_id(db: Session, investigation_id: str) -> Optional[Investigation]:
        return db.query(Investigation).filter(Investigation.id == investigation_id).first()

    @staticmethod
    def create_investigation(db: Session, data: InvestigationCreate) -> Investigation:
        inv_number = data.investigation_number or InvestigationService.generate_investigation_number(db)
        inv = Investigation(
            investigation_number=inv_number,
            title=data.title,
            incident_description=data.incident_description,
            product_name=data.product_name,
            batch_number=data.batch_number,
            manufacturing_stage=data.manufacturing_stage,
            equipment_id=data.equipment_id,
            incident_date=data.incident_date,
            detection_date=data.detection_date,
            severity=data.severity,
            investigator=data.investigator,
            immediate_actions_taken=data.immediate_actions_taken,
            potential_product_impact=data.potential_product_impact,
            potential_patient_impact=data.potential_patient_impact,
            selected_methodology=data.selected_methodology,
            investigation_status="Draft"
        )
        db.add(inv)
        db.flush()

        # Audit activity
        activity = InvestigationActivity(
            investigation_id=inv.id,
            activity_type="created",
            description=f"Investigation {inv.investigation_number} opened by {inv.investigator}.",
            performed_by=inv.investigator
        )
        db.add(activity)
        db.commit()
        db.refresh(inv)
        return inv

    @staticmethod
    def update_investigation(db: Session, investigation_id: str, data: InvestigationUpdate) -> Optional[Investigation]:
        inv = InvestigationService.get_investigation_by_id(db, investigation_id)
        if not inv:
            return None

        update_dict = data.dict(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(inv, key, value)

        inv.updated_at = datetime.utcnow()
        
        # Log activity
        activity = InvestigationActivity(
            investigation_id=inv.id,
            activity_type="field_edited",
            description=f"Investigation details updated ({', '.join(update_dict.keys())}).",
            performed_by=inv.investigator or "Quality Lead Investigator"
        )
        db.add(activity)
        db.commit()
        db.refresh(inv)
        return inv

    @staticmethod
    def delete_investigation(db: Session, investigation_id: str) -> bool:
        inv = InvestigationService.get_investigation_by_id(db, investigation_id)
        if not inv:
            return False
        db.delete(inv)
        db.commit()
        return True

    @staticmethod
    def process_ai_workflow(
        db: Session,
        raw_text: str,
        source_type: str = "pasted_text",
        file_name: str = "Raw Text Input",
        investigation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes the LangGraph 10-node AI workflow and persists the results to DB.
        """
        # 1. Initialize LangGraph state
        initial_state: RCAWorkflowState = {
            "investigation_id": investigation_id,
            "raw_content": raw_text,
            "source_type": source_type,
            "file_name": file_name,
            "extracted_data": {},
            "validation_results": {},
            "missing_information": [],
            "evidence_items": [],
            "recommended_methodology": "both",
            "selected_methodology": "both",
            "five_whys": [],
            "fishbone_causes": [],
            "capa_recommendations": [],
            "investigation_summary": {},
            "is_saved": False,
            "review_notes": None,
            "execution_log": [],
            "is_synthetic_mode": False,
            "llm_model_used": "groq",
            "error": None
        }

        # 2. Run LangGraph workflow
        final_state: RCAWorkflowState = rca_graph.invoke(initial_state)

        extracted = final_state.get("extracted_data", {})
        missing = final_state.get("missing_information", [])
        evidence_list = final_state.get("evidence_items", [])
        five_whys_list = final_state.get("five_whys", [])
        fishbone_list = final_state.get("fishbone_causes", [])
        capa_list = final_state.get("capa_recommendations", [])
        summary = final_state.get("investigation_summary", {})

        # 3. Create or fetch Investigation in database
        if investigation_id:
            inv = InvestigationService.get_investigation_by_id(db, investigation_id)
        else:
            inv = None

        if not inv:
            inv_number = InvestigationService.generate_investigation_number(db)
            inv = Investigation(
                investigation_number=inv_number,
                title=extracted.get("incident_title") or f"API Investigation - {extracted.get('batch_number', 'Unassigned')}",
                incident_description=extracted.get("incident_description"),
                product_name=extracted.get("product_name"),
                batch_number=extracted.get("batch_number"),
                manufacturing_stage=extracted.get("manufacturing_stage"),
                equipment_id=extracted.get("equipment_id"),
                incident_date=extracted.get("incident_date"),
                detection_date=extracted.get("detection_date"),
                severity=extracted.get("severity") or "Major",
                investigator="Quality Lead Investigator",
                immediate_actions_taken=extracted.get("immediate_actions_taken"),
                potential_product_impact=extracted.get("potential_product_impact"),
                potential_patient_impact=extracted.get("potential_patient_impact"),
                missing_information=missing,
                selected_methodology=final_state.get("selected_methodology", "both"),
                investigation_summary=summary,
                investigation_status="Information Extraction"
            )
            db.add(inv)
            db.flush()
        else:
            # Preserve existing user-confirmed or copilot-committed values; only fill empty fields
            inv.title = inv.title or extracted.get("incident_title")
            inv.incident_description = inv.incident_description or extracted.get("incident_description")
            inv.product_name = inv.product_name or extracted.get("product_name")
            inv.batch_number = inv.batch_number or extracted.get("batch_number")
            inv.manufacturing_stage = inv.manufacturing_stage or extracted.get("manufacturing_stage")
            inv.equipment_id = inv.equipment_id or extracted.get("equipment_id")
            inv.incident_date = inv.incident_date or extracted.get("incident_date")
            inv.detection_date = inv.detection_date or extracted.get("detection_date")
            inv.severity = inv.severity or extracted.get("severity") or "Major"
            inv.immediate_actions_taken = inv.immediate_actions_taken or extracted.get("immediate_actions_taken")
            inv.potential_product_impact = inv.potential_product_impact or extracted.get("potential_product_impact")
            inv.potential_patient_impact = inv.potential_patient_impact or extracted.get("potential_patient_impact")
            inv.missing_information = missing or inv.missing_information
            inv.investigation_summary = summary or inv.investigation_summary

        # 4. Save Source Document record
        doc = SourceDocument(
            investigation_id=inv.id,
            file_name=file_name,
            file_type=source_type.split("_")[-1],
            source_type=source_type,
            file_size=len(raw_text.encode("utf-8")),
            extracted_text=raw_text[:5000] # store preview / text
        )
        db.add(doc)

        # 5. Save Extracted Fields with confidence and status
        for field_name in ["product_name", "batch_number", "manufacturing_stage", "equipment_id", "incident_date", "severity"]:
            val = extracted.get(field_name)
            if val:
                ef = ExtractedInformation(
                    investigation_id=inv.id,
                    field_name=field_name,
                    extracted_value=str(val),
                    source_reference=f"Extracted from {file_name}",
                    confidence=0.95 if not final_state.get("is_synthetic_mode") else 0.90,
                    review_status="suggested"
                )
                db.add(ef)

        # 6. Save Evidence Items
        for ev in evidence_list:
            evidence_rec = Evidence(
                investigation_id=inv.id,
                evidence_type=ev.get("evidence_type", "Other"),
                title=ev.get("title", "Evidence Record"),
                description=ev.get("description"),
                source_reference=ev.get("source_reference"),
                observation=ev.get("observation"),
                review_status=ev.get("review_status", "Verified")
            )
            db.add(evidence_rec)

        # 7. Save 5 Whys steps
        for step in five_whys_list:
            fw = FiveWhys(
                investigation_id=inv.id,
                sequence_number=step.get("sequence_number", 1),
                question=step.get("question", ""),
                answer=step.get("answer", ""),
                evidence_reference=step.get("evidence_reference"),
                is_root_cause=step.get("is_root_cause", False),
                status=step.get("status", "AI-Suggested")
            )
            db.add(fw)

        # 8. Save Fishbone Root Causes
        for c in fishbone_list:
            rc = RootCause(
                investigation_id=inv.id,
                methodology="fishbone",
                cause_category=c.get("cause_category", "Method"),
                cause_description=c.get("cause_description", ""),
                supporting_evidence=c.get("supporting_evidence", []),
                contradictory_evidence=c.get("contradictory_evidence", []),
                evidence_strength=c.get("evidence_strength", "Moderate"),
                verification_status=c.get("verification_status", "Hypothesis"),
                is_primary_root_cause=c.get("is_primary_root_cause", False)
            )
            db.add(rc)

        # 9. Save CAPA Recommendations
        for capa in capa_list:
            capa_rec = CapaAction(
                investigation_id=inv.id,
                action_number=capa.get("action_number") or f"CAPA-{uuid.uuid4().hex[:6].upper()}",
                action_type=capa.get("action_type", "Corrective"),
                description=capa.get("description", ""),
                associated_root_cause=capa.get("associated_root_cause"),
                reason_for_recommendation=capa.get("reason_for_recommendation"),
                priority=capa.get("priority", "High"),
                owner=capa.get("owner", "Quality Assurance"),
                due_date=capa.get("due_date", "30 Days"),
                status="Proposed",
                verification_criteria=capa.get("verification_criteria"),
                effectiveness_result=capa.get("effectiveness_result"),
                is_ai_generated=True
            )
            db.add(capa_rec)

        # 10. Audit Activity
        mode_note = "(via Groq LLM)" if not final_state.get("is_synthetic_mode") else "(via Pharmaceutical Domain Engine)"
        activity = InvestigationActivity(
            investigation_id=inv.id,
            activity_type="ai_extraction",
            description=f"LangGraph 10-node AI investigation executed {mode_note}. Form auto-populated.",
            performed_by="AIVOA AI Assistant"
        )
        db.add(activity)

        db.commit()
        db.refresh(inv)

        return {
            "investigation": inv,
            "workflow_state": final_state,
            "execution_log": final_state.get("execution_log", []),
            "is_synthetic_mode": final_state.get("is_synthetic_mode", False),
            "model_used": final_state.get("llm_model_used", "groq")
        }

    @staticmethod
    def get_dashboard_metrics(db: Session) -> Dict[str, Any]:
        total_inv = db.query(func.count(Investigation.id)).scalar() or 0
        open_inv = db.query(func.count(Investigation.id)).filter(
            Investigation.investigation_status.in_(["Draft", "Information Extraction", "Under Investigation"])
        ).scalar() or 0
        under_review = db.query(func.count(Investigation.id)).filter(
            Investigation.investigation_status.in_(["Root Cause Review", "CAPA Review", "Pending Approval"])
        ).scalar() or 0
        completed = db.query(func.count(Investigation.id)).filter(
            Investigation.investigation_status == "Closed"
        ).scalar() or 0
        high_risk = db.query(func.count(Investigation.id)).filter(
            Investigation.severity == "Critical"
        ).scalar() or 0

        # CAPA counts
        pending_capa = db.query(func.count(CapaAction.id)).filter(
            CapaAction.status.in_(["Proposed", "Under Review", "Approved", "In Progress"])
        ).scalar() or 0
        overdue_capa = db.query(func.count(CapaAction.id)).filter(
            CapaAction.status == "Ineffective"
        ).scalar() or 0

        # Status distribution
        status_counts = db.query(Investigation.investigation_status, func.count(Investigation.id)).group_by(
            Investigation.investigation_status
        ).all()
        status_dist = {s: c for s, c in status_counts}

        # Severity / Risk distribution
        sev_counts = db.query(Investigation.severity, func.count(Investigation.id)).group_by(
            Investigation.severity
        ).all()
        sev_dist = {s: c for s, c in sev_counts}

        # Recent activities
        activities = db.query(InvestigationActivity).order_by(
            desc(InvestigationActivity.created_at)
        ).limit(10).all()

        recent_acts = [
            {
                "id": a.id,
                "investigation_id": a.investigation_id,
                "activity_type": a.activity_type,
                "description": a.description,
                "performed_by": a.performed_by,
                "created_at": a.created_at.isoformat()
            }
            for a in activities
        ]

        return {
            "total_investigations": total_inv,
            "open_investigations": open_inv,
            "under_review_investigations": under_review,
            "completed_investigations": completed,
            "high_risk_investigations": high_risk,
            "pending_capa_actions": pending_capa,
            "overdue_capa_actions": overdue_capa,
            "status_distribution": status_dist,
            "risk_distribution": sev_dist,
            "severity_distribution": sev_dist,
            "recent_activities": recent_acts
        }
