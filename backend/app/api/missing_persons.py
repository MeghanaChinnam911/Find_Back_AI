from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import MissingPerson, User, AuditLog
from app.schemas.schemas import MissingPersonCreate, MissingPersonResponse
from app.services.auth_service import get_current_user
from app.matching.hybrid_matcher import run_automatic_matching_for_missing

router = APIRouter(prefix="/missing-persons", tags=["Missing Persons"])

@router.get("", response_model=List[MissingPersonResponse])
def list_missing_persons(
    status: Optional[str] = "ACTIVE",
    location: Optional[str] = None,
    age_min: Optional[int] = None,
    age_max: Optional[int] = None,
    query: Optional[str] = None,
    db: Session = Depends(get_db)
):
    q = db.query(MissingPerson)
    if status and status != "ALL":
        q = q.filter(MissingPerson.status == status)
    if location:
        q = q.filter(MissingPerson.missing_location.ilike(f"%{location}%"))
    if age_min is not None:
        q = q.filter(MissingPerson.age >= age_min)
    if age_max is not None:
        q = q.filter(MissingPerson.age <= age_max)
    if query:
        q = q.filter(
            (MissingPerson.name.ilike(f"%{query}%")) |
            (MissingPerson.missing_location.ilike(f"%{query}%"))
        )
    return q.order_by(MissingPerson.created_at.desc()).all()

@router.post("", response_model=MissingPersonResponse)
def create_missing_person(
    case_in: MissingPersonCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    missing_person = MissingPerson(
        photo_url=case_in.photo_url,
        name=case_in.name,
        age=case_in.age,
        date_of_birth=case_in.date_of_birth,
        missing_date=case_in.missing_date,
        missing_location=case_in.missing_location,
        latitude=case_in.latitude,
        longitude=case_in.longitude,
        guardian_name=case_in.guardian_name,
        guardian_phone=case_in.guardian_phone,
        created_by=current_user.id if current_user else None
    )
    db.add(missing_person)
    db.commit()
    db.refresh(missing_person)
    
    # Audit log
    db.add(AuditLog(
        user_id=current_user.id if current_user else None,
        user_email=current_user.email if current_user else "anonymous",
        action="CREATE_MISSING_CASE",
        entity_type="MissingPerson",
        entity_id=missing_person.id,
        details=f"Registered missing case for {missing_person.name}"
    ))
    db.commit()

    # Trigger automatic visual and metadata matching
    run_automatic_matching_for_missing(db, missing_person.id)
    
    return missing_person

@router.get("/{id}", response_model=MissingPersonResponse)
def get_missing_person(id: int, db: Session = Depends(get_db)):
    case = db.query(MissingPerson).filter(MissingPerson.id == id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Missing person case not found")
    return case
