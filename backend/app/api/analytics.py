from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.database import get_db
from app.models.models import MissingPerson, UnidentifiedPerson, PotentialMatch, AuditLog, MatchStatus
from app.schemas.schemas import AnalyticsOverview, AuditLogResponse
from app.agents.tools import tool_get_area_statistics

router = APIRouter(prefix="/analytics", tags=["Analytics & Intelligence"])

@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(db: Session = Depends(get_db)):
    active_missing = db.query(MissingPerson).filter(MissingPerson.status == "ACTIVE").count()
    unidentified_count = db.query(UnidentifiedPerson).count()
    pending_matches = db.query(PotentialMatch).filter(PotentialMatch.status == MatchStatus.PENDING_VERIFICATION).count()
    resolved_count = db.query(MissingPerson).filter(MissingPerson.status == "RESOLVED").count()
    
    # Age groups
    children = db.query(MissingPerson).filter(MissingPerson.age < 18, MissingPerson.status == "ACTIVE").count()
    adults = db.query(MissingPerson).filter(MissingPerson.age >= 18, MissingPerson.age < 60, MissingPerson.status == "ACTIVE").count()
    elderly = db.query(MissingPerson).filter(MissingPerson.age >= 60, MissingPerson.status == "ACTIVE").count()
    
    area_stats = tool_get_area_statistics(db)
    
    # High risk red zones
    high_risk_zones = [a for a in area_stats if a["risk_level"] == "RED"]
    
    # Simple temporal trend
    recent_trend = [
        {"date": "Day 1", "cases": 8},
        {"date": "Day 2", "cases": 12},
        {"date": "Day 3", "cases": 15},
        {"date": "Day 4", "cases": 18},
        {"date": "Day 5", "cases": 24},
        {"date": "Day 6", "cases": 32},
        {"date": "Day 7", "cases": active_missing}
    ]
    
    return AnalyticsOverview(
        active_missing_count=active_missing,
        unidentified_count=unidentified_count,
        potential_matches_count=pending_matches,
        resolved_count=resolved_count,
        cases_by_age_group={"children": children, "adults": adults, "elderly": elderly},
        cases_by_area=area_stats,
        recent_trend=recent_trend,
        high_risk_zones=high_risk_zones
    )

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(db: Session = Depends(get_db)):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(50).all()
