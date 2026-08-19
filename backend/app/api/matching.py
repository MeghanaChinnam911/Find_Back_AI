from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from app.database import get_db
from app.models.models import PotentialMatch, MatchStatus, MissingPerson, UnidentifiedPerson, User, AuditLog, ImageEmbedding
from app.schemas.schemas import PotentialMatchResponse, MatchVerificationRequest
from app.services.auth_service import get_current_user
from app.matching.feature_extractor import extract_image_embedding, compute_cosine_similarity

router = APIRouter(prefix="/matching", tags=["Matching Engine"])

class SearchPhotoRequest(BaseModel):
    photo_url: str
    top_k: int = 5

@router.get("/matches", response_model=List[PotentialMatchResponse])
def get_potential_matches(
    status: Optional[MatchStatus] = None,
    db: Session = Depends(get_db)
):
    q = db.query(PotentialMatch)
    if status:
        q = q.filter(PotentialMatch.status == status)
    return q.order_by(PotentialMatch.overall_score.desc()).all()

@router.post("/verify/{match_id}", response_model=PotentialMatchResponse)
def verify_match(
    match_id: int,
    request: MatchVerificationRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    match_rec = db.query(PotentialMatch).filter(PotentialMatch.id == match_id).first()
    if not match_rec:
        raise HTTPException(status_code=404, detail="Match record not found")
        
    match_rec.status = request.status
    match_rec.verified_by = current_user.id if current_user else None
    match_rec.verified_at = datetime.utcnow()
    match_rec.notes = request.notes
    
    if request.status == MatchStatus.VERIFIED_MATCH:
        # Mark missing person as RESOLVED
        missing = db.query(MissingPerson).filter(MissingPerson.id == match_rec.missing_person_id).first()
        if missing:
            missing.status = "RESOLVED"
            
        unidentified = db.query(UnidentifiedPerson).filter(UnidentifiedPerson.id == match_rec.unidentified_person_id).first()
        if unidentified:
            unidentified.status = "RESOLVED"

    db.add(AuditLog(
        user_id=current_user.id if current_user else None,
        user_email=current_user.email if current_user else "police_officer",
        action=f"MATCH_VERIFICATION_{request.status.value}",
        entity_type="PotentialMatch",
        entity_id=match_rec.id,
        details=f"Match verified as {request.status.value}"
    ))
    
    db.commit()
    db.refresh(match_rec)
    return match_rec

@router.post("/search-photo")
def search_photo_matches(
    req: SearchPhotoRequest,
    db: Session = Depends(get_db)
):
    """Police upload photo search against active missing cases database."""
    input_vec = extract_image_embedding(req.photo_url)
    
    missing_persons = db.query(MissingPerson).filter(MissingPerson.status == "ACTIVE").all()
    results = []
    
    for missing in missing_persons:
        m_emb_record = db.query(ImageEmbedding).filter(
            ImageEmbedding.person_type == "missing",
            ImageEmbedding.person_id == missing.id
        ).first()
        
        if m_emb_record:
            import json
            m_vec = json.loads(m_emb_record.embedding_json)
            sim = compute_cosine_similarity(input_vec, m_vec)
            results.append({
                "missing_person": missing,
                "similarity_score": round(sim, 4),
                "confidence_label": "High Similarity" if sim > 0.8 else ("Moderate Similarity" if sim > 0.5 else "Low Similarity")
            })
            
    results.sort(key=lambda x: x["similarity_score"], reverse=True)
    return results[:req.top_k]
