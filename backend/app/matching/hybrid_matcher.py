import json
import math
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import (
    MissingPerson, UnidentifiedPerson, ImageEmbedding, 
    PotentialMatch, MatchStatus, Notification
)
from app.matching.feature_extractor import extract_image_embedding, compute_cosine_similarity
from app.config import settings

def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Returns distance in km between two lat/lon points."""
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def calculate_geo_score(dist_km: float) -> float:
    """Converts distance into a 0.0-1.0 proximity score."""
    if dist_km <= 5.0:
        return 1.0
    elif dist_km <= 25.0:
        return 0.85
    elif dist_km <= 100.0:
        return 0.60
    elif dist_km <= 300.0:
        return 0.35
    else:
        return 0.10

def calculate_age_score(age1: int, age2: int) -> float:
    """Calculates age compatibility score."""
    diff = abs(age1 - age2)
    if diff == 0:
        return 1.0
    elif diff <= 2:
        return 0.85
    elif diff <= 5:
        return 0.60
    elif diff <= 10:
        return 0.30
    else:
        return 0.05

def compute_hybrid_match_score(
    visual_sim: float,
    missing_person: MissingPerson,
    unidentified_person: UnidentifiedPerson
) -> tuple[float, float, float]:
    """
    Computes overall score combining visual, age, geo, and time signals.
    Returns (visual_score, metadata_score, overall_score).
    """
    w_visual = settings.WEIGHT_VISUAL
    w_age = settings.WEIGHT_AGE
    w_geo = settings.WEIGHT_GEO
    w_time = settings.WEIGHT_TIME
    
    # Calculate age score if available
    age_score = None
    if missing_person.age is not None and unidentified_person.approximate_age is not None:
        age_score = calculate_age_score(missing_person.age, unidentified_person.approximate_age)
        
    # Calculate geo score if coordinates available
    geo_score = None
    if (missing_person.latitude and missing_person.longitude and 
        unidentified_person.latitude and unidentified_person.longitude):
        dist = calculate_haversine_distance(
            missing_person.latitude, missing_person.longitude,
            unidentified_person.latitude, unidentified_person.longitude
        )
        geo_score = calculate_geo_score(dist)
        
    # Time score (always 0.75 default for baseline demo)
    time_score = 0.75

    # Build active metadata weights dynamically if optional fields missing
    active_weights = [w_visual]
    active_scores = [visual_sim]
    
    meta_sum = 0.0
    meta_weights = 0.0
    
    if age_score is not None:
        active_weights.append(w_age)
        active_scores.append(age_score)
        meta_sum += age_score * w_age
        meta_weights += w_age
        
    if geo_score is not None:
        active_weights.append(w_geo)
        active_scores.append(geo_score)
        meta_sum += geo_score * w_geo
        meta_weights += w_geo
        
    active_weights.append(w_time)
    active_scores.append(time_score)
    meta_sum += time_score * w_time
    meta_weights += w_time
    
    total_weight = sum(active_weights)
    overall_score = sum(s * w for s, w in zip(active_scores, active_weights)) / total_weight
    
    metadata_score = (meta_sum / meta_weights) if meta_weights > 0 else 0.5
    
    return round(visual_sim, 4), round(metadata_score, 4), round(overall_score, 4)

def run_automatic_matching_for_unidentified(db: Session, unidentified_id: int, threshold: float = 0.50) -> list[PotentialMatch]:
    """
    Called when a new Unidentified Person record is uploaded.
    Searches all Missing Person records, generates embeddings, ranks candidate matches,
    creates PotentialMatch records, and sends notifications.
    """
    unidentified = db.query(UnidentifiedPerson).filter(UnidentifiedPerson.id == unidentified_id).first()
    if not unidentified:
        return []
        
    # Get or generate embedding for unidentified person
    u_emb_record = db.query(ImageEmbedding).filter(
        ImageEmbedding.person_type == "unidentified",
        ImageEmbedding.person_id == unidentified_id
    ).first()
    
    if not u_emb_record:
        emb_list = extract_image_embedding(unidentified.photo_url)
        u_emb_record = ImageEmbedding(
            person_type="unidentified",
            person_id=unidentified_id,
            embedding_json=json.dumps(emb_list)
        )
        db.add(u_emb_record)
        db.commit()
        db.refresh(u_emb_record)
        
    u_vector = json.loads(u_emb_record.embedding_json)
    
    # Query active missing persons
    missing_persons = db.query(MissingPerson).filter(MissingPerson.status == "ACTIVE").all()
    created_matches = []
    
    for missing in missing_persons:
        m_emb_record = db.query(ImageEmbedding).filter(
            ImageEmbedding.person_type == "missing",
            ImageEmbedding.person_id == missing.id
        ).first()
        
        if not m_emb_record:
            m_emb_list = extract_image_embedding(missing.photo_url)
            m_emb_record = ImageEmbedding(
                person_type="missing",
                person_id=missing.id,
                embedding_json=json.dumps(m_emb_list)
            )
            db.add(m_emb_record)
            db.commit()
            db.refresh(m_emb_record)
            
        m_vector = json.loads(m_emb_record.embedding_json)
        
        visual_sim = compute_cosine_similarity(u_vector, m_vector)
        v_score, m_score, o_score = compute_hybrid_match_score(visual_sim, missing, unidentified)
        
        if o_score >= threshold:
            # Check if match already exists
            existing = db.query(PotentialMatch).filter(
                PotentialMatch.missing_person_id == missing.id,
                PotentialMatch.unidentified_person_id == unidentified.id
            ).first()
            
            if not existing:
                match_record = PotentialMatch(
                    missing_person_id=missing.id,
                    unidentified_person_id=unidentified.id,
                    visual_score=v_score,
                    metadata_score=m_score,
                    overall_score=o_score,
                    status=MatchStatus.PENDING_VERIFICATION
                )
                db.add(match_record)
                db.commit()
                db.refresh(match_record)
                created_matches.append(match_record)
                
                # Send real-time notification to Police portal
                notif = Notification(
                    user_role="POLICE",
                    title="Potential Match Identified",
                    message=f"Possible match detected ({int(o_score*100)}% similarity) for missing person '{missing.name}' from location {unidentified.location}.",
                    type="MATCH_ALERT",
                    target_id=match_record.id
                )
                db.add(notif)
                db.commit()
                
    return created_matches

def run_automatic_matching_for_missing(db: Session, missing_id: int, threshold: float = 0.50) -> list[PotentialMatch]:
    """
    Called when a new Missing Person case is registered by Police.
    Searches all Unidentified records in DB.
    """
    missing = db.query(MissingPerson).filter(MissingPerson.id == missing_id).first()
    if not missing:
        return []
        
    m_emb_record = db.query(ImageEmbedding).filter(
        ImageEmbedding.person_type == "missing",
        ImageEmbedding.person_id == missing_id
    ).first()
    
    if not m_emb_record:
        emb_list = extract_image_embedding(missing.photo_url)
        m_emb_record = ImageEmbedding(
            person_type="missing",
            person_id=missing_id,
            embedding_json=json.dumps(emb_list)
        )
        db.add(m_emb_record)
        db.commit()
        db.refresh(m_emb_record)
        
    m_vector = json.loads(m_emb_record.embedding_json)
    
    unidentified_list = db.query(UnidentifiedPerson).all()
    created_matches = []
    
    for unidentified in unidentified_list:
        u_emb_record = db.query(ImageEmbedding).filter(
            ImageEmbedding.person_type == "unidentified",
            ImageEmbedding.person_id == unidentified.id
        ).first()
        
        if not u_emb_record:
            u_emb_list = extract_image_embedding(unidentified.photo_url)
            u_emb_record = ImageEmbedding(
                person_type="unidentified",
                person_id=unidentified.id,
                embedding_json=json.dumps(u_emb_list)
            )
            db.add(u_emb_record)
            db.commit()
            db.refresh(u_emb_record)
            
        u_vector = json.loads(u_emb_record.embedding_json)
        
        visual_sim = compute_cosine_similarity(m_vector, u_vector)
        v_score, m_score, o_score = compute_hybrid_match_score(visual_sim, missing, unidentified)
        
        if o_score >= threshold:
            existing = db.query(PotentialMatch).filter(
                PotentialMatch.missing_person_id == missing.id,
                PotentialMatch.unidentified_person_id == unidentified.id
            ).first()
            
            if not existing:
                match_record = PotentialMatch(
                    missing_person_id=missing.id,
                    unidentified_person_id=unidentified.id,
                    visual_score=v_score,
                    metadata_score=m_score,
                    overall_score=o_score,
                    status=MatchStatus.PENDING_VERIFICATION
                )
                db.add(match_record)
                db.commit()
                db.refresh(match_record)
                created_matches.append(match_record)
                
                notif = Notification(
                    user_role="POLICE",
                    title="Potential Match Identified for New Case",
                    message=f"Possible match detected ({int(o_score*100)}% similarity) for missing person '{missing.name}'.",
                    type="MATCH_ALERT",
                    target_id=match_record.id
                )
                db.add(notif)
                db.commit()
                
    return created_matches
