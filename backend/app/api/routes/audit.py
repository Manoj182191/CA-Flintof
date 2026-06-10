"""
Audit automation API routes.
Only references functions that exist in app.services.audit_service.
"""
from typing import Optional, List
import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.base import get_db
from app.models.models import AuditPlan, AuditProcedure, FraudDetection
from app.services.audit_service import (
    detect_duplicate_invoices, detect_circular_transactions,
    detect_round_number_vouchers, risk_assessment, create_audit_plan,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/audit", tags=["audit"])


# ============== Schemas ==============

class AuditPlanCreate(BaseModel):
    company_id: int
    audit_period: str
    auditor_name: str
    audit_scope: str = ""
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    procedures: Optional[List[dict]] = None


class AuditFindingUpdate(BaseModel):
    status: str  # Open, Reviewed, Resolved
    reviewed_by: Optional[str] = None


# ============== Audit Plan Management ==============

@router.post("/plans")
def create_audit_plan_route(payload: AuditPlanCreate, db: Session = Depends(get_db)):
    return create_audit_plan(
        db, payload.company_id, payload.audit_period, payload.auditor_name,
        payload.audit_scope, payload.start_date, payload.end_date, payload.procedures,
    )


@router.get("/plans/{company_id}")
def list_audit_plans(company_id: int, db: Session = Depends(get_db)):
    return db.query(AuditPlan).filter(AuditPlan.company_id == company_id).order_by(AuditPlan.created_at.desc()).all()


@router.get("/plans/{plan_id}/procedures")
def list_procedures(plan_id: int, db: Session = Depends(get_db)):
    return db.query(AuditProcedure).filter(AuditProcedure.plan_id == plan_id).all()


# ============== Fraud Detection ==============

@router.post("/detect/duplicates/{company_id}")
def detect_dups(company_id: int, db: Session = Depends(get_db)):
    return detect_duplicate_invoices(db, company_id)


@router.post("/detect/circular/{company_id}")
def detect_circ(company_id: int, db: Session = Depends(get_db)):
    return detect_circular_transactions(db, company_id)


@router.post("/detect/round-numbers/{company_id}")
def detect_round(company_id: int, db: Session = Depends(get_db)):
    return detect_round_number_vouchers(db, company_id)


@router.get("/findings/{company_id}")
def list_findings(company_id: int, status: Optional[str] = Query(None),
                 detection_type: Optional[str] = Query(None),
                 db: Session = Depends(get_db)):
    q = db.query(FraudDetection).filter(FraudDetection.company_id == company_id)
    if status:
        q = q.filter(FraudDetection.status == status)
    if detection_type:
        q = q.filter(FraudDetection.detection_type == detection_type)
    return q.order_by(FraudDetection.created_at.desc()).all()


@router.patch("/findings/{finding_id}/status")
def update_finding(finding_id: int, payload: AuditFindingUpdate,
                  db: Session = Depends(get_db)):
    f = db.query(FraudDetection).filter(FraudDetection.id == finding_id).first()
    if not f:
        raise HTTPException(status_code=404, detail="Finding not found")
    f.status = payload.status
    if payload.reviewed_by:
        f.reviewed_by = payload.reviewed_by
    if payload.status == "Reviewed":
        from datetime import date as _date
        f.reviewed_on = _date.today()
    db.commit()
    db.refresh(f)
    return f


# ============== Risk Assessment ==============

@router.get("/risk-assessment/{company_id}")
def risk(company_id: int, db: Session = Depends(get_db)):
    return risk_assessment(db, company_id)
