"""
Business intelligence and analytics API routes.
"""

from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database.base import get_db
from app.services.business_intelligence_service import BusinessIntelligenceService

router = APIRouter(prefix="/api/bi", tags=["business-intelligence"])


@router.get("/dashboard/{company_id}")
def get_kpi_dashboard(company_id: int, db: Session = Depends(get_db)):
    return BusinessIntelligenceService.get_kpi_dashboard(company_id, db)


@router.post("/metrics/{company_id}")
def record_metric(company_id: int, metric_date: date = Query(...), db: Session = Depends(get_db)):
    return BusinessIntelligenceService.record_metric(company_id, metric_date, db)


@router.get("/revenue/{company_id}")
def calculate_revenue(
    company_id: int,
    from_date: date = Query(...),
    to_date: date = Query(...),
    db: Session = Depends(get_db),
):
    return {"revenue": BusinessIntelligenceService.calculate_revenue(company_id, from_date, to_date, db)}


@router.get("/expenses/{company_id}")
def calculate_expenses(
    company_id: int,
    from_date: date = Query(...),
    to_date: date = Query(...),
    db: Session = Depends(get_db),
):
    return {"expenses": BusinessIntelligenceService.calculate_expenses(company_id, from_date, to_date, db)}


@router.get("/profit/{company_id}")
def calculate_profit(
    company_id: int,
    from_date: date = Query(...),
    to_date: date = Query(...),
    db: Session = Depends(get_db),
):
    return {"profit": BusinessIntelligenceService.calculate_profit(company_id, from_date, to_date, db)}


@router.get("/working-capital/{company_id}")
def calculate_working_capital(company_id: int, as_of_date: date = Query(...), db: Session = Depends(get_db)):
    return {"working_capital": BusinessIntelligenceService.calculate_working_capital(company_id, as_of_date, db)}


@router.get("/revenue-trend/{company_id}")
def get_revenue_trend(company_id: int, months: int = Query(12), db: Session = Depends(get_db)):
    return BusinessIntelligenceService.get_revenue_trend(company_id, months, db)


@router.get("/customer-analysis/{company_id}")
def get_customer_analysis(company_id: int, db: Session = Depends(get_db)):
    return BusinessIntelligenceService.get_customer_analysis(company_id, db)


@router.get("/expense-analysis/{company_id}")
def get_expense_analysis(
    company_id: int,
    from_date: date = Query(...),
    to_date: date = Query(...),
    db: Session = Depends(get_db),
):
    return BusinessIntelligenceService.get_expense_analysis(company_id, from_date, to_date, db)


@router.get("/cash-flow-forecast/{company_id}")
def predict_cash_flow(company_id: int, months_ahead: int = Query(3), db: Session = Depends(get_db)):
    return BusinessIntelligenceService.predict_cash_flow(company_id, months_ahead, db)
