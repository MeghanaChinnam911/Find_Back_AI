from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from datetime import datetime
from app.models.models import UserRole, CaseStatus, MatchStatus

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: "UserResponse"

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[UserRole] = None

# User Schemas
class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: UserRole = UserRole.CITIZEN
    phone: Optional[str] = None
    organization: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    phone: Optional[str] = None
    organization: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Missing Person Schemas
class MissingPersonCreate(BaseModel):
    photo_url: str
    name: str
    age: int
    date_of_birth: Optional[str] = None
    missing_date: str
    missing_location: str
    latitude: float
    longitude: float
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None

class MissingPersonResponse(BaseModel):
    id: int
    photo_url: str
    name: str
    age: int
    date_of_birth: Optional[str] = None
    missing_date: str
    missing_location: str
    latitude: float
    longitude: float
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    status: CaseStatus
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Unidentified Person Schemas
class UnidentifiedPersonCreate(BaseModel):
    photo_url: str
    location: str
    latitude: float
    longitude: float
    uploader_phone: str
    name: Optional[str] = None
    approximate_age: Optional[int] = None
    native_location: Optional[str] = None
    additional_details: Optional[str] = None

class UnidentifiedPersonResponse(BaseModel):
    id: int
    photo_url: str
    location: str
    latitude: float
    longitude: float
    uploader_phone: str
    name: Optional[str] = None
    approximate_age: Optional[int] = None
    native_location: Optional[str] = None
    additional_details: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Match Schemas
class PotentialMatchResponse(BaseModel):
    id: int
    missing_person_id: int
    unidentified_person_id: int
    visual_score: float
    metadata_score: float
    overall_score: float
    status: MatchStatus
    verified_by: Optional[int] = None
    verified_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime
    missing_person: MissingPersonResponse
    unidentified_person: UnidentifiedPersonResponse

    model_config = ConfigDict(from_attributes=True)

class MatchVerificationRequest(BaseModel):
    status: MatchStatus # VERIFIED_MATCH or REJECTED
    notes: Optional[str] = None

# Notification Schema
class NotificationResponse(BaseModel):
    id: int
    user_role: str
    title: str
    message: str
    type: str
    target_id: Optional[int] = None
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# Agent & Analytics Schemas
class AgentQueryRequest(BaseModel):
    query: str

class AgentQueryResponse(BaseModel):
    answer: str
    tool_calls: List[dict] = []
    extracted_params: dict = {}
    filtered_missing_cases: List[MissingPersonResponse] = []
    filtered_unidentified: List[UnidentifiedPersonResponse] = []
    statistics: dict = {}
    map_action: Optional[dict] = None

class AnalyticsOverview(BaseModel):
    active_missing_count: int
    unidentified_count: int
    potential_matches_count: int
    resolved_count: int
    cases_by_age_group: dict
    cases_by_area: List[dict]
    recent_trend: List[dict]
    high_risk_zones: List[dict]

class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int] = None
    user_email: Optional[str] = None
    action: str
    entity_type: str
    entity_id: Optional[int] = None
    details: Optional[str] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
