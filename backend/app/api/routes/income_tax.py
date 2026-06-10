"""
Income tax API routes.
"""

from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.base import get_db
from app.models.models import AISReconciliation, IncomeTaxReturn
from app.services.income_tax_service import IncomeTaxService

router = APIRouter(prefix="/api/income-tax", tags=["income-tax"])


class ITRCreateRequest(BaseModel):
    company_id: int
    financial_year: str
    return_type: str
    entity_type: str = "Individual"


class AISReconciliationRequest(BaseModel):
    company_id: int
    financial_year: str
    ais_data: Dict


@router.get("/income/{company_id}")
def calculate_income(company_id: int, financial_year: str = Query(...), db: Session = Depends(get_db)):
    return IncomeTaxService.calculate_income_from_ledgers(company_id, financial_year, db)


@router.get("/expenses/{company_id}")
def calculate_expenses(company_id: int, financial_year: str = Query(...), db: Session = Depends(get_db)):
    return IncomeTaxService.calculate_expenses_from_ledgers(company_id, financial_year, db)


@router.get("/tax")
def calculate_tax(taxable_income: float = Query(...), entity_type: str = Query("Individual")):
    tax, surcharge, cess, total_tax = IncomeTaxService.calculate_income_tax(taxable_income, entity_type)
    return {"income_tax": tax, "surcharge": surcharge, "cess": cess, "total_tax": total_tax}


@router.post("/returns")
def create_itr_return(payload: ITRCreateRequest, db: Session = Depends(get_db)):
    try:
        return IncomeTaxService.create_itr_return(
            payload.company_id,
            payload.financial_year,
            payload.return_type,
            payload.entity_type,
            db,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))


@router.get("/returns/{company_id}")
def list_itr_returns(company_id: int, financial_year: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(IncomeTaxReturn).filter(IncomeTaxReturn.company_id == company_id)
    if financial_year:
        query = query.filter(IncomeTaxReturn.financial_year == financial_year)
    return query.order_by(IncomeTaxReturn.created_at.desc()).all()


@router.get("/summary/{company_id}")
def get_itr_summary(company_id: int, financial_year: str = Query(...), db: Session = Depends(get_db)):
    return IncomeTaxService.get_itr_summary(company_id, financial_year, db)


@router.post("/ais-reconciliation")
def create_ais_reconciliation(payload: AISReconciliationRequest, db: Session = Depends(get_db)):
    return IncomeTaxService.create_ais_reconciliation(
        payload.company_id,
        payload.financial_year,
        payload.ais_data,
        db,
    )


@router.get("/ais-reconciliation/{company_id}")
def list_ais_reconciliations(company_id: int, financial_year: str = Query(None), db: Session = Depends(get_db)):
    query = db.query(AISReconciliation).filter(AISReconciliation.company_id == company_id)
    if financial_year:
        query = query.filter(AISReconciliation.financial_year == financial_year)
    return query.order_by(AISReconciliation.created_at.desc()).all()
