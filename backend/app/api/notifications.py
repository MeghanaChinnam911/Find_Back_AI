from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.models import Notification
from app.schemas.schemas import NotificationResponse

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[NotificationResponse])
def get_notifications(role: str = "POLICE", db: Session = Depends(get_db)):
    return db.query(Notification).filter(
        (Notification.user_role == role) | (Notification.user_role == "ALL")
    ).order_by(Notification.created_at.desc()).limit(20).all()

@router.post("/read/{notification_id}")
def mark_notification_as_read(notification_id: int, db: Session = Depends(get_db)):
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"status": "success"}
