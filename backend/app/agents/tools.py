from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List, Dict, Any
from app.models.models import MissingPerson, UnidentifiedPerson, PotentialMatch, MatchStatus
from app.matching.hybrid_matcher import calculate_haversine_distance

def tool_search_missing_cases(
    db: Session,
    age_min: Optional[int] = None,
    age_max: Optional[int] = None,
    location: Optional[str] = None,
    query_text: Optional[str] = None,
    status: str = "ACTIVE"
) -> List[MissingPerson]:
    """Queries the database for missing persons matching criteria."""
    q = db.query(MissingPerson)
    
    if status and status != "ALL":
        q = q.filter(MissingPerson.status == status)
        
    if age_min is not None:
        q = q.filter(MissingPerson.age >= age_min)
        
    if age_max is not None:
        q = q.filter(MissingPerson.age <= age_max)
        
    if location:
        loc_str = f"%{location}%"
        q = q.filter(
            (MissingPerson.missing_location.ilike(loc_str)) | 
            (MissingPerson.name.ilike(loc_str))
        )
        
    if query_text:
        text_str = f"%{query_text}%"
        q = q.filter(
            (MissingPerson.name.ilike(text_str)) |
            (MissingPerson.missing_location.ilike(text_str)) |
            (MissingPerson.guardian_name.ilike(text_str))
        )
        
    return q.all()

def tool_get_case_statistics(db: Session) -> Dict[str, Any]:
    """Generates summary statistics for dashboard display."""
    total_missing = db.query(MissingPerson).count()
    active_missing = db.query(MissingPerson).filter(MissingPerson.status == "ACTIVE").count()
    resolved = db.query(MissingPerson).filter(MissingPerson.status == "RESOLVED").count()
    unidentified_count = db.query(UnidentifiedPerson).count()
    potential_matches_count = db.query(PotentialMatch).filter(PotentialMatch.status == MatchStatus.PENDING_VERIFICATION).count()
    
    # Age breakdown
    children = db.query(MissingPerson).filter(MissingPerson.age < 18, MissingPerson.status == "ACTIVE").count()
    adults = db.query(MissingPerson).filter(MissingPerson.age >= 18, MissingPerson.age < 60, MissingPerson.status == "ACTIVE").count()
    elderly = db.query(MissingPerson).filter(MissingPerson.age >= 60, MissingPerson.status == "ACTIVE").count()
    
    return {
        "total_missing": total_missing,
        "active_missing": active_missing,
        "resolved": resolved,
        "unidentified_records": unidentified_count,
        "pending_matches": potential_matches_count,
        "age_distribution": {
            "children": children,
            "adults": adults,
            "elderly": elderly
        }
    }

def tool_get_area_statistics(db: Session) -> List[Dict[str, Any]]:
    """Analyzes geographic distribution of active cases."""
    results = db.query(
        MissingPerson.missing_location,
        func.count(MissingPerson.id).label("count")
    ).filter(MissingPerson.status == "ACTIVE").group_by(MissingPerson.missing_location).all()
    
    area_stats = []
    for loc, count in results:
        # Determine risk zone indicator
        risk_level = "RED" if count >= 8 else ("ORANGE" if count >= 4 else "GREEN")
        area_stats.append({
            "location": loc,
            "count": count,
            "risk_level": risk_level
        })
        
    area_stats.sort(key=lambda x: x["count"], reverse=True)
    return area_stats

def tool_get_potential_matches(db: Session, status: Optional[str] = "PENDING_VERIFICATION") -> List[PotentialMatch]:
    """Retrieves high confidence matches requiring human verification."""
    q = db.query(PotentialMatch)
    if status and status != "ALL":
        q = q.filter(PotentialMatch.status == status)
    return q.order_by(PotentialMatch.overall_score.desc()).all()
