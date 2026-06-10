"""
GST Module API Routes
Complete GST compliance and filing endpoints.
Only references functions that exist in app.services.gst_service.
"""
from typing import Optional
from datetime import date
import logging

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.base import get_db
from app.models.models import GSTReturn, Company
from app.services.gst_service import (
    validate_gstin, calculate_gst, get_gstr1_data, get_gstr3b_data,
    get_gstr9_data, gst_reconciliation, gst_dashboard,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/gst", tags=["gst"])


# ============== Schemas ==============

class GSTReturnCreate(BaseModel):
    company_id: int
    return_type: str  # GSTR-1, GSTR-3B, GSTR-9
    month: int
    year: int
    total_supply: float = 0
    total_tax: float = 0


# ============== GSTR-1 (Outward Supplies) ==============

@router.get("/gstr1/{company_id}")
def get_gstr1(
    company_id: int,
    month: int = Query(...),
    year: int = Query(...),
    db: Session = Depends(get_db),
):
    """GSTR-1: B2B, B2C, HSN summary."""
    return get_gstr1_data(db, company_id, month, year)


# ============== GSTR-3B (Monthly Return) ==============

@router.get("/gstr3b/{company_id}")
def get_gstr3b(
    company_id: int,
    month: int = Query(...),
    year: int = Query(...),
    db: Session = Depends(get_db),
):
    """GSTR-3B summary."""
    return get_gstr3b_data(db, company_id, month, year)


# ============== GSTR-9 (Annual) ==============

@router.get("/gstr9/{company_id}")
def get_gstr9(
    company_id: int,
    financial_year: str = Query(..., description="e.g. 2023-24"),
    db: Session = Depends(get_db),
):
    """GSTR-9 annual return."""
    return get_gstr9_data(db, company_id, financial_year)


# ============== GST Reconciliation ==============

@router.get("/reconciliation/{company_id}")
def get_gst_reconciliation(
    company_id: int,
    month: int = Query(...),
    year: int = Query(...),
    db: Session = Depends(get_db),
):
    """Books ITC vs GSTR-2A reconciliation."""
    return gst_reconciliation(db, company_id, month, year)


# ============== GST Returns Management ==============

@router.post("/returns/")
def create_gst_return(payload: GSTReturnCreate, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == payload.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    existing = db.query(GSTReturn).filter(
        GSTReturn.company_id == payload.company_id,
        GSTReturn.return_type == payload.return_type,
        GSTReturn.month == payload.month,
        GSTReturn.year == payload.year,
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Return already exists for this period")
    ret = GSTReturn(
        company_id=payload.company_id,
        return_type=payload.return_type,
        month=payload.month,
        year=payload.year,
        total_supply=payload.total_supply,
        total_tax=payload.total_tax,
        status="Draft",
    )
    db.add(ret)
    db.commit()
    db.refresh(ret)
    return ret


@router.get("/returns/{company_id}")
def list_gst_returns(
    company_id: int,
    year: Optional[int] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(GSTReturn).filter(GSTReturn.company_id == company_id)
    if year:
        query = query.filter(GSTReturn.year == year)
    return query.order_by(GSTReturn.year.desc(), GSTReturn.month.desc()).all()


@router.post("/returns/{return_id}/file")
def file_gst_return(return_id: int, db: Session = Depends(get_db)):
    ret = db.query(GSTReturn).filter(GSTReturn.id == return_id).first()
    if not ret:
        raise HTTPException(status_code=404, detail="Return not found")
    if ret.status == "Filed":
        raise HTTPException(status_code=400, detail="Return already filed")
    ret.status = "Filed"
    ret.filing_date = date.today()
    db.commit()
    db.refresh(ret)
    return ret


# ============== GST Summary & Analytics ==============

@router.get("/dashboard/{company_id}")
def get_gst_dashboard(company_id: int, db: Session = Depends(get_db)):
    return gst_dashboard(db, company_id)


# ============== GSTIN Validation ==============

@router.post("/validate-gstin")
def validate_gstin_endpoint(gstin: str = Query(...)):
    return validate_gstin(gstin)


# ============== GST Calculation ==============

class GSTCalcRequest(BaseModel):
    taxable_value: float
    gst_rate: float
    is_interstate: bool = False
    cess: float = 0


@router.post("/calculate")
def calculate_gst_endpoint(payload: GSTCalcRequest):
    return calculate_gst(
        payload.taxable_value,
        payload.gst_rate,
        payload.is_interstate,
        payload.cess,
    )
