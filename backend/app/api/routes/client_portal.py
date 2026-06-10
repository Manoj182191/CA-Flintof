from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session

from app.database.base import get_db
from app.core.security import hash_password, verify_password
from app.models.models import (
    CAClient,
    CANotice,
    CATask,
    ClientPortalDocument,
    ClientPortalMessage,
    ClientPortalNotification,
    ClientPortalUser,
    ComplianceTracker,
)

router = APIRouter(prefix="/api/client-portal", tags=["client-portal"])

class ClientPortalUserCreate(BaseModel):
    ca_client_id: int
    email: str
    password: str
    full_name: Optional[str] = None
    phone: Optional[str] = None
    access_level: str = "View"

class ClientPortalLogin(BaseModel):
    email: str
    password: str

class ClientPortalMessageCreate(BaseModel):
    ca_client_id: int
    sender_type: str
    sender_name: Optional[str] = None
    message: str
    attachments: List[Dict[str, Any]] = []

class ClientPortalNotificationCreate(BaseModel):
    ca_client_id: int
    notification_type: str
    title: str
    message: Optional[str] = None
    action_url: Optional[str] = None

@router.post("/users")
def create_client_portal_user(payload: ClientPortalUserCreate, db: Session = Depends(get_db)):
    existing = db.query(ClientPortalUser).filter(ClientPortalUser.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Client portal user already exists")
    user = ClientPortalUser(
        ca_client_id=payload.ca_client_id,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        phone=payload.phone,
        access_level=payload.access_level,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "email": user.email, "ca_client_id": user.ca_client_id}

@router.post("/login")
def client_portal_login(payload: ClientPortalLogin, db: Session = Depends(get_db)):
    user = db.query(ClientPortalUser).filter(ClientPortalUser.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid client portal credentials")
    user.last_login = datetime.utcnow()
    db.commit()
    # In a full implementation this should return a JWT token, keeping it simple to match existing for now
    return {"status": "success", "client_user_id": user.id, "ca_client_id": user.ca_client_id, "access_level": user.access_level}

@router.get("/dashboard/{ca_client_id}")
def client_portal_dashboard(ca_client_id: int, db: Session = Depends(get_db)):
    client = db.query(CAClient).get(ca_client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    documents = db.query(ClientPortalDocument).filter(ClientPortalDocument.ca_client_id == ca_client_id).count()
    notices = db.query(CANotice).filter(CANotice.client_id == ca_client_id).all()
    tasks = db.query(CATask).filter(CATask.client_id == ca_client_id).all()
    compliance = db.query(ComplianceTracker).filter(ComplianceTracker.ca_client_id == ca_client_id).all()
    return {
        "client_name": client.client_name,
        "services": client.service_type,
        "document_count": documents,
        "open_notices": len([notice for notice in notices if notice.status != "Resolved"]),
        "pending_tasks": len([task for task in tasks if task.status == "Pending"]),
        "compliance_status": {
            "total": len(compliance),
            "pending": len([item for item in compliance if item.status == "Pending"]),
            "completed": len([item for item in compliance if item.status == "Completed"]),
        },
    }

@router.get("/documents/{ca_client_id}")
def list_client_documents(ca_client_id: int, db: Session = Depends(get_db)):
    return db.query(ClientPortalDocument).filter(ClientPortalDocument.ca_client_id == ca_client_id).order_by(ClientPortalDocument.uploaded_on.desc()).all()

@router.post("/messages")
def create_client_message(payload: ClientPortalMessageCreate, db: Session = Depends(get_db)):
    message = ClientPortalMessage(**payload.model_dump())
    db.add(message)
    db.commit()
    db.refresh(message)
    return message

@router.get("/messages/{ca_client_id}")
def list_client_messages(ca_client_id: int, db: Session = Depends(get_db)):
    return db.query(ClientPortalMessage).filter(ClientPortalMessage.ca_client_id == ca_client_id).order_by(ClientPortalMessage.created_at.desc()).all()

@router.post("/notifications")
def create_client_notification(payload: ClientPortalNotificationCreate, db: Session = Depends(get_db)):
    notification = ClientPortalNotification(**payload.model_dump())
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

@router.get("/notifications/{ca_client_id}")
def list_client_notifications(ca_client_id: int, db: Session = Depends(get_db)):
    return db.query(ClientPortalNotification).filter(ClientPortalNotification.ca_client_id == ca_client_id).order_by(ClientPortalNotification.created_at.desc()).all()
