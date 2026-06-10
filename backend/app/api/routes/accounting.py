"""
Chart of Accounts and Voucher routes
Complete accounting module with proper business logic
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.database.base import get_db
from app.models.models import Ledger, LedgerGroup, Voucher, Transaction, Company, CostCenter, ProfitCenter
from app.schemas.schemas import LedgerCreate, LedgerResponse, VoucherCreate, VoucherResponse
from app.services.accounting_service import accounting_service
from typing import List, Optional
from datetime import date
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/accounting", tags=["accounting"])

# ============== LEDGER GROUP ROUTES ==============

@router.post("/ledger-groups/", response_model=dict)
def create_ledger_group(
    company_id: int,
    name: str,
    group_type: str,
    db: Session = Depends(get_db)
):
    """Create ledger group (Assets, Liabilities, Income, Expenses, Equity)"""
    
    # Verify company exists
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    group = LedgerGroup(
        company_id=company_id,
        name=name,
        group_type=group_type
    )
    
    db.add(group)
    db.commit()
    db.refresh(group)
    
    return {"id": group.id, "name": group.name, "group_type": group.group_type}

@router.get("/ledger-groups/{company_id}")
def list_ledger_groups(
    company_id: int,
    db: Session = Depends(get_db)
):
    """List all ledger groups for a company"""
    groups = db.query(LedgerGroup).filter(LedgerGroup.company_id == company_id).all()
    return [{"id": g.id, "name": g.name, "group_type": g.group_type} for g in groups]

# ============== LEDGER ROUTES ==============

@router.post("/ledgers/", response_model=LedgerResponse)
def create_ledger(
    ledger_data: LedgerCreate,
    db: Session = Depends(get_db)
):
    """Create a new ledger account"""
    
    # Verify group exists
    group = db.query(LedgerGroup).filter(LedgerGroup.id == ledger_data.group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Ledger group not found")
    
    ledger = Ledger(
        company_id=ledger_data.company_id,
        group_id=ledger_data.group_id,
        name=ledger_data.name,
        alias=ledger_data.alias,
        opening_balance=ledger_data.opening_balance,
    )
    
    db.add(ledger)
    db.commit()
    db.refresh(ledger)
    
    return ledger

@router.get("/ledgers/{company_id}", response_model=List[LedgerResponse])
def list_ledgers(
    company_id: int,
    group_id: int = Query(None),
    db: Session = Depends(get_db)
):
    """List ledgers for a company"""
    query = db.query(Ledger).filter(Ledger.company_id == company_id)
    
    if group_id:
        query = query.filter(Ledger.group_id == group_id)
    
    return query.all()

@router.get("/ledgers/{ledger_id}/detail", response_model=LedgerResponse)
def get_ledger(
    ledger_id: int,
    db: Session = Depends(get_db)
):
    """Get ledger details"""
    ledger = db.query(Ledger).filter(Ledger.id == ledger_id).first()
    
    if not ledger:
        raise HTTPException(status_code=404, detail="Ledger not found")
    
    return ledger

# ============== VOUCHER ROUTES ==============

# ============== VOUCHER ROUTES ==============

@router.post("/vouchers/", response_model=VoucherResponse)
def create_voucher(
    voucher_data: VoucherCreate,
    db: Session = Depends(get_db)
):
    """Create a new voucher with transactions"""
    try:
        voucher = accounting_service.create_voucher(
            db=db,
            company_id=voucher_data.company_id,
            voucher_type=voucher_data.voucher_type,
            voucher_date=voucher_data.voucher_date,
            transactions=voucher_data.transactions,
            description=voucher_data.description,
            narration=voucher_data.narration
        )
        return voucher
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating voucher: {e}")
        raise HTTPException(status_code=500, detail="Error creating voucher")

@router.get("/vouchers/{company_id}", response_model=List[VoucherResponse])
def list_vouchers(
    company_id: int,
    voucher_type: str = Query(None),
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    is_posted: Optional[bool] = Query(None),
    db: Session = Depends(get_db)
):
    """List vouchers for a company with optional filters"""
    query = db.query(Voucher).options(joinedload(Voucher.transactions)).filter(Voucher.company_id == company_id)
    
    if voucher_type:
        query = query.filter(Voucher.voucher_type == voucher_type)
    if from_date:
        query = query.filter(Voucher.voucher_date >= from_date)
    if to_date:
        query = query.filter(Voucher.voucher_date <= to_date)
    if is_posted is not None:
        query = query.filter(Voucher.is_posted == is_posted)
    
    return query.order_by(Voucher.voucher_date.desc()).all()

@router.get("/vouchers/detail/{voucher_id}", response_model=VoucherResponse)
def get_voucher(
    voucher_id: int,
    db: Session = Depends(get_db)
):
    """Get voucher details"""
    voucher = db.query(Voucher).filter(Voucher.id == voucher_id).first()
    
    if not voucher:
        raise HTTPException(status_code=404, detail="Voucher not found")
    
    return voucher

@router.post("/vouchers/{voucher_id}/post")
def post_voucher(
    voucher_id: int,
    db: Session = Depends(get_db)
):
    """Post a voucher (finalize it)"""
    try:
        voucher = accounting_service.post_voucher(db, voucher_id)
        return {"message": "Voucher posted successfully", "voucher_number": voucher.voucher_number}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error posting voucher: {e}")
        raise HTTPException(status_code=500, detail="Error posting voucher")

@router.delete("/vouchers/{voucher_id}")
def delete_voucher(
    voucher_id: int,
    db: Session = Depends(get_db)
):
    """Delete a draft voucher"""
    voucher = db.query(Voucher).filter(Voucher.id == voucher_id).first()
    
    if not voucher:
        raise HTTPException(status_code=404, detail="Voucher not found")
    
    if voucher.is_posted:
        raise HTTPException(status_code=400, detail="Cannot delete posted voucher")
    
    db.delete(voucher)
    db.commit()
    
    return {"message": "Voucher deleted successfully"}

# ============== REPORTING ROUTES ==============

@router.get("/trial-balance/{company_id}")
def get_trial_balance(
    company_id: int,
    as_of_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """Generate Trial Balance report"""
    try:
        return accounting_service.get_trial_balance(db, company_id, as_of_date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating trial balance: {e}")
        raise HTTPException(status_code=500, detail="Error generating trial balance")

@router.get("/general-ledger/{ledger_id}")
def get_general_ledger(
    ledger_id: int,
    from_date: Optional[date] = Query(None),
    to_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """Get General Ledger for a specific account"""
    try:
        return accounting_service.get_general_ledger(db, ledger_id, from_date, to_date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating GL: {e}")
        raise HTTPException(status_code=500, detail="Error generating general ledger")

@router.get("/balance-sheet/{company_id}")
def get_balance_sheet(
    company_id: int,
    as_of_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """Generate Balance Sheet"""
    try:
        return accounting_service.get_balance_sheet(db, company_id, as_of_date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating balance sheet: {e}")
        raise HTTPException(status_code=500, detail="Error generating balance sheet")

@router.get("/profit-loss/{company_id}")
def get_profit_loss(
    company_id: int,
    from_date: date = Query(...),
    to_date: date = Query(...),
    db: Session = Depends(get_db)
):
    """Generate Profit & Loss Statement"""
    try:
        return accounting_service.get_profit_loss(db, company_id, from_date, to_date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating P&L: {e}")
        raise HTTPException(status_code=500, detail="Error generating P&L statement")

@router.get("/cash-flow/{company_id}")
def get_cash_flow(
    company_id: int,
    from_date: date = Query(...),
    to_date: date = Query(...),
    db: Session = Depends(get_db)
):
    """Generate Cash Flow Statement"""
    try:
        return accounting_service.get_cash_flow_summary(db, company_id, from_date, to_date)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error generating cash flow: {e}")
        raise HTTPException(status_code=500, detail="Error generating cash flow")


# ============== EXTENDED REPORTS ==============

from app.services.accounting_reports import (
    get_day_book, get_bank_book, get_cash_book, get_fund_flow,
    reconcile_ledger, get_cost_center_report, list_cost_center_summary,
    generate_due_recurring_vouchers, bank_reconciliation_statement,
)


@router.get("/day-book/{company_id}")
def day_book(
    company_id: int,
    from_date: date = Query(...),
    to_date: date = Query(...),
    db: Session = Depends(get_db),
):
    """Day Book: all posted vouchers chronologically."""
    return get_day_book(db, company_id, from_date, to_date)


@router.get("/bank-book/{company_id}/{bank_account_id}")
def bank_book(
    company_id: int,
    bank_account_id: int,
    from_date: date = Query(...),
    to_date: date = Query(...),
    db: Session = Depends(get_db),
):
    """Bank Book for a specific bank account."""
    return get_bank_book(db, company_id, bank_account_id, from_date, to_date)


@router.get("/cash-book/{company_id}")
def cash_book(
    company_id: int,
    from_date: date = Query(...),
    to_date: date = Query(...),
    cash_ledger_id: int = Query(None),
    db: Session = Depends(get_db),
):
    """Cash Book."""
    return get_cash_book(db, company_id, from_date, to_date, cash_ledger_id)


@router.get("/fund-flow/{company_id}")
def fund_flow(
    company_id: int,
    from_date: date = Query(...),
    to_date: date = Query(...),
    db: Session = Depends(get_db),
):
    """Fund Flow Statement."""
    return get_fund_flow(db, company_id, from_date, to_date)


@router.get("/reconcile-ledger/{ledger_id}")
def reconcile(
    ledger_id: int,
    statement_balance: float = Query(...),
    statement_date: date = Query(...),
    notes: str = Query(""),
    db: Session = Depends(get_db),
):
    """Reconcile a ledger against an external statement balance."""
    return reconcile_ledger(db, ledger_id, statement_balance, statement_date, notes)


@router.get("/bank-reconciliation/{bank_account_id}")
def bank_reconciliation(
    bank_account_id: int,
    statement_balance: float = Query(...),
    as_of_date: date = Query(...),
    db: Session = Depends(get_db),
):
    """Bank Reconciliation Statement."""
    return bank_reconciliation_statement(db, bank_account_id, as_of_date, statement_balance)


@router.get("/cost-center-report/{company_id}/{cost_center_id}")
def cost_center_report(
    company_id: int,
    cost_center_id: int,
    from_date: date = Query(...),
    to_date: date = Query(...),
    db: Session = Depends(get_db),
):
    return get_cost_center_report(db, company_id, cost_center_id, from_date, to_date)


@router.get("/cost-center-summary/{company_id}")
def cost_center_summary(
    company_id: int,
    from_date: date = Query(...),
    to_date: date = Query(...),
    db: Session = Depends(get_db),
):
    return list_cost_center_summary(db, company_id, from_date, to_date)


@router.post("/recurring-vouchers/generate-due")
def generate_recurring_vouchers(db: Session = Depends(get_db)):
    """Generate all due recurring vouchers."""
    ids = generate_due_recurring_vouchers(db)
    return {"generated_count": len(ids), "voucher_ids": ids}
