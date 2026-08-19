import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Enum as SQLEnum, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.database import Base

class UserRole(str, enum.Enum):
    POLICE = "POLICE"
    NGO = "NGO"
    CITIZEN = "CITIZEN"
    ADMIN = "ADMIN"

class CaseStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    RESOLVED = "RESOLVED"
    UNDER_REVIEW = "UNDER_REVIEW"

class MatchStatus(str, enum.Enum):
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    VERIFIED_MATCH = "VERIFIED_MATCH"
    REJECTED = "REJECTED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.CITIZEN, nullable=False)
    organization = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class MissingPerson(Base):
    __tablename__ = "missing_persons"

    id = Column(Integer, primary_key=True, index=True)
    photo_url = Column(Text, nullable=False)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    date_of_birth = Column(String, nullable=True)
    missing_date = Column(String, nullable=False)
    missing_location = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    guardian_name = Column(String, nullable=True)
    guardian_phone = Column(String, nullable=True)
    status = Column(SQLEnum(CaseStatus), default=CaseStatus.ACTIVE)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class UnidentifiedPerson(Base):
    __tablename__ = "unidentified_persons"

    id = Column(Integer, primary_key=True, index=True)
    photo_url = Column(Text, nullable=False)
    location = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    uploader_phone = Column(String, nullable=False)
    name = Column(String, nullable=True)
    approximate_age = Column(Integer, nullable=True)
    native_location = Column(String, nullable=True)
    additional_details = Column(Text, nullable=True)
    status = Column(String, default="UNIDENTIFIED")
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ImageEmbedding(Base):
    __tablename__ = "image_embeddings"

    id = Column(Integer, primary_key=True, index=True)
    person_type = Column(String, nullable=False)  # 'missing' or 'unidentified'
    person_id = Column(Integer, nullable=False)
    embedding_json = Column(Text, nullable=False) # JSON list of floats
    model_name = Column(String, default="resnet_hist_v1")
    created_at = Column(DateTime, default=datetime.utcnow)

class PotentialMatch(Base):
    __tablename__ = "potential_matches"

    id = Column(Integer, primary_key=True, index=True)
    missing_person_id = Column(Integer, ForeignKey("missing_persons.id"), nullable=False)
    unidentified_person_id = Column(Integer, ForeignKey("unidentified_persons.id"), nullable=False)
    visual_score = Column(Float, nullable=False)
    metadata_score = Column(Float, nullable=False)
    overall_score = Column(Float, nullable=False)
    status = Column(SQLEnum(MatchStatus), default=MatchStatus.PENDING_VERIFICATION)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    verified_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    missing_person = relationship("MissingPerson", foreign_keys=[missing_person_id])
    unidentified_person = relationship("UnidentifiedPerson", foreign_keys=[unidentified_person_id])

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_role = Column(String, default="ALL") # 'POLICE', 'NGO', 'ALL'
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="MATCH_ALERT")
    target_id = Column(Integer, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    user_email = Column(String, nullable=True)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
