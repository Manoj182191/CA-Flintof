"""
CA practice management API routes.
"""

from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.base import get_db
from app.models.models import CAClient, CANotice, CATask, ComplianceDeadline
from app.services.ca_practice_service import CAPracticeManagementService

router = APIRouter(prefix="/api/ca-practice", tags=["ca-practice"])


class CAClientCreate(BaseModel):
    company_id: int
    client_name: str
    client_type: str
    pan: str
    email: str
    phone: str
    service_types: List[str]


class NoticeCreate(BaseModel):
    client_id: int
    notice_type: str
    notice_number: str
    notice_date: date
    due_date: date
    subject: str
    description: str


class TaskCreate(BaseModel):
    client_id: int
    company_id: int
    task_title: str
    task_type: str
    assigned_to: str
    due_date: date
    priority: str
    description: Optional[str] = None


@router.post("/clients")
def create_client(payload: CAClientCreate, db: Session = Depends(get_db)):
    return CAPracticeManagementService.create_ca_client(
        payload.company_id,
        payload.client_name,
        payload.client_type,
        payload.pan,
        payload.email,
        payload.phone,
        payload.service_types,
        db,
    )


@router.get("/clients/{company_id}")
def list_clients(company_id: int, status: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(CAClient).filter(CAClient.company_id == company_id)
    if status:
        query = query.filter(CAClient.status == status)
    return query.order_by(CAClient.client_name).all()


@router.get("/clients/detail/{client_id}")
def get_client_dashboard(client_id: int, db: Session = Depends(get_db)):
    try:
        return CAPracticeManagementService.get_client_dashboard(client_id, db)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.post("/notices")
def record_notice(payload: NoticeCreate, db: Session = Depends(get_db)):
    return CAPracticeManagementService.record_notice(
        payload.client_id,
        payload.notice_type,
        payload.notice_number,
        payload.notice_date,
        payload.due_date,
        payload.subject,
        payload.description,
        db,
    )


@router.get("/notices/{client_id}")
def list_notices(client_id: int, db: Session = Depends(get_db)):
    return db.query(CANotice).filter(CANotice.client_id == client_id).order_by(CANotice.due_date).all()


@router.patch("/notices/{notice_id}/resolve")
def resolve_notice(notice_id: int, resolution_notes: str = Query(...), db: Session = Depends(get_db)):
    try:
        return CAPracticeManagementService.resolve_notice(notice_id, resolution_notes, db)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.post("/tasks")
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    return CAPracticeManagementService.create_task(
        payload.client_id,
        payload.company_id,
        payload.task_title,
        payload.task_type,
        payload.assigned_to,
        payload.due_date,
        payload.priority,
        payload.description,
        db,
    )


@router.get("/tasks/{company_id}")
def list_tasks(company_id: int, status: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(CATask).filter(CATask.company_id == company_id)
    if status:
        query = query.filter(CATask.status == status)
    return query.order_by(CATask.due_date).all()


@router.get("/deadlines/pending/{company_id}")
def get_pending_deadlines(company_id: int, days_ahead: int = Query(30), db: Session = Depends(get_db)):
    return CAPracticeManagementService.get_pending_deadlines(company_id, db, days_ahead)


@router.get("/deadlines/overdue/{company_id}")
def get_overdue_deadlines(company_id: int, db: Session = Depends(get_db)):
    return CAPracticeManagementService.get_overdue_deadlines(company_id, db)


@router.patch("/deadlines/{deadline_id}/status")
def update_deadline_status(deadline_id: int, status: str = Query(...), db: Session = Depends(get_db)):
    try:
        return CAPracticeManagementService.update_deadline_status(deadline_id, status, db)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))


@router.get("/deadlines/{company_id}")
def list_deadlines(company_id: int, db: Session = Depends(get_db)):
    return db.query(ComplianceDeadline).filter(ComplianceDeadline.company_id == company_id).order_by(ComplianceDeadline.due_date).all()


@router.get("/summary/{company_id}")
def get_practice_summary(company_id: int, db: Session = Depends(get_db)):
    return CAPracticeManagementService.get_ca_practice_summary(company_id, db)
