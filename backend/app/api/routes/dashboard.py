from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.services.investigation_service import InvestigationService
from backend.app.schemas.schemas import DashboardMetrics

router = APIRouter()

@router.get("/metrics", response_model=DashboardMetrics)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """
    Returns real, live enterprise metrics computed directly from database tables.
    """
    metrics = InvestigationService.get_dashboard_metrics(db)
    return metrics
