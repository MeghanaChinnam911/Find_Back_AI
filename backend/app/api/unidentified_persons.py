from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import UnidentifiedPerson, User, AuditLog
from app.schemas.schemas import UnidentifiedPersonCreate, UnidentifiedPersonResponse
from app.services.auth_service import get_current_user
from app.matching.hybrid_matcher import run_automatic_matching_for_unidentified

router = APIRouter(prefix="/unidentified-persons", tags=["Unidentified Persons"])

@router.get("", response_model=List[UnidentifiedPersonResponse])
def list_unidentified_persons(db: Session = Depends(get_db)):
    return db.query(UnidentifiedPerson).order_by(UnidentifiedPerson.created_at.desc()).all()

@router.post("", response_model=UnidentifiedPersonResponse)
def create_unidentified_person(
    record_in: UnidentifiedPersonCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    unidentified = UnidentifiedPerson(
        photo_url=record_in.photo_url,
        location=record_in.location,
        latitude=record_in.latitude,
        longitude=record_in.longitude,
        uploader_phone=record_in.uploader_phone,
        name=record_in.name,
        approximate_age=record_in.approximate_age,
        native_location=record_in.native_location,
        additional_details=record_in.additional_details,
        created_by=current_user.id if current_user else None
    )
    db.add(unidentified)
    db.commit()
    db.refresh(unidentified)
    
    # Audit log
    db.add(AuditLog(
        user_id=current_user.id if current_user else None,
        user_email=current_user.email if current_user else "anonymous_ngo",
        action="CREATE_UNIDENTIFIED_RECORD",
        entity_type="UnidentifiedPerson",
        entity_id=unidentified.id,
        details=f"Uploaded unidentified person record at {unidentified.location}"
    ))
    db.commit()

    # Trigger automatic visual and metadata matching
    run_automatic_matching_for_unidentified(db, unidentified.id)
    
    return unidentified

@router.get("/{id}", response_model=UnidentifiedPersonResponse)
def get_unidentified_person(id: int, db: Session = Depends(get_db)):
    record = db.query(UnidentifiedPerson).filter(UnidentifiedPerson.id == id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Unidentified person record not found")
    return record
