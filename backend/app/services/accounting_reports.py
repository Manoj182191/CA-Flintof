"""
Extended accounting service: Day Book, Bank Book, Cash Book, Fund Flow,
Ledger Reconciliation, Recurring Vouchers, Cost/Profit Center reports,
Trial Balance (advanced), Bank Reconciliation matching, GST-adjusted reports.
"""
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, case
from app.models.models import (
    Voucher, Transaction, Ledger, LedgerGroup, Company, CostCenter, ProfitCenter,
    BankAccount, BankTransaction, RecurringVoucher, ExchangeRate,
    VoucherType,
)
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import List, Dict, Optional, Tuple
import calendar
import logging

logger = logging.getLogger(__name__)


# ============ Day Book ============

def get_day_book(db: Session, company_id: int, from_date: date, to_date: date) -> Dict:
    """Day Book: all vouchers in date order with running totals."""
    rows = db.query(Voucher).options(joinedload(Voucher.transactions)).filter(
        Voucher.company_id == company_id,
        Voucher.is_posted == True,
        Voucher.voucher_date >= from_date,
        Voucher.voucher_date <= to_date,
    ).order_by(Voucher.voucher_date, Voucher.voucher_number).all()

    entries = []
    for v in rows:
        entries.append({
            "date": v.voucher_date,
            "voucher_number": v.voucher_number,
            "voucher_type": v.voucher_type,
            "reference_number": v.reference_number,
            "narration": v.narration,
            "description": v.description,
            "total_debit": round(v.total_debit, 2),
            "total_credit": round(v.total_credit, 2),
            "transaction_count": len(v.transactions),
        })

    return {
        "company_id": company_id,
        "from_date": from_date,
        "to_date": to_date,
        "entries": entries,
        "total_entries": len(entries),
        "total_debit": round(sum(e["total_debit"] for e in entries), 2),
        "total_credit": round(sum(e["total_credit"] for e in entries), 2),
    }


# ============ Bank Book ============

def get_bank_book(db: Session, company_id: int, bank_account_id: int,
                  from_date: date, to_date: date) -> Dict:
    """Bank Book: all transactions affecting a bank ledger, chronological."""
    ba = db.query(BankAccount).filter(
        BankAccount.id == bank_account_id, BankAccount.company_id == company_id
    ).first()
    if not ba:
        raise ValueError(f"Bank account {bank_account_id} not found")

    # Find a ledger matching this bank account (by name heuristic)
    bank_ledger = db.query(Ledger).join(LedgerGroup).filter(
        Ledger.company_id == company_id,
        LedgerGroup.group_type.in_(["Assets", "Current Assets", "Bank Accounts"]),
        or_(
            func.lower(Ledger.name) == func.lower(ba.bank_name),
            func.lower(Ledger.name).like(f"%{ba.bank_name.lower()}%"),
        ),
    ).first()
    if not bank_ledger:
        # Fall back to first bank-type ledger
        bank_ledger = db.query(Ledger).join(LedgerGroup).filter(
            Ledger.company_id == company_id,
            LedgerGroup.group_type.in_(["Assets", "Current Assets", "Bank Accounts"]),
        ).first()

    entries = []
    balance = ba.opening_balance

    if bank_ledger:
        rows = db.query(Transaction).join(Voucher).filter(
            Transaction.ledger_id == bank_ledger.id,
            Voucher.company_id == company_id,
            Voucher.is_posted == True,
            Voucher.voucher_date >= from_date,
            Voucher.voucher_date <= to_date,
        ).order_by(Voucher.voucher_date, Voucher.id).all()

        for t in rows:
            balance += (t.debit_amount or 0) - (t.credit_amount or 0)
            entries.append({
                "date": t.voucher.voucher_date,
                "voucher_number": t.voucher.voucher_number,
                "voucher_type": t.voucher.voucher_type,
                "particulars": t.ledger.name if False else (t.narration or t.voucher.description or ""),
                "withdrawal": round(t.credit_amount, 2),
                "deposit": round(t.debit_amount, 2),
                "balance": round(balance, 2),
            })

    return {
        "company_id": company_id,
        "bank_account_id": bank_account_id,
        "bank_name": ba.bank_name,
        "account_number": ba.account_number,
        "from_date": from_date,
        "to_date": to_date,
        "opening_balance": round(ba.opening_balance, 2),
        "entries": entries,
        "closing_balance": round(balance, 2),
    }


# ============ Cash Book ============

def get_cash_book(db: Session, company_id: int, from_date: date, to_date: date,
                  cash_ledger_id: Optional[int] = None) -> Dict:
    """Cash Book: all transactions affecting Cash ledger(s)."""
    if cash_ledger_id:
        ledgers = db.query(Ledger).filter(
            Ledger.id == cash_ledger_id, Ledger.company_id == company_id
        ).all()
    else:
        ledgers = db.query(Ledger).join(LedgerGroup).filter(
            Ledger.company_id == company_id,
            or_(
                func.lower(LedgerGroup.name).like("%cash%"),
                func.lower(LedgerGroup.group_type) == "cash",
            ),
        ).all()

    entries = []
    opening = 0.0
    for l in ledgers:
        opening += l.opening_balance or 0

    balance = opening
    for l in ledgers:
        rows = db.query(Transaction).join(Voucher).filter(
            Transaction.ledger_id == l.id,
            Voucher.company_id == company_id,
            Voucher.is_posted == True,
            Voucher.voucher_date >= from_date,
            Voucher.voucher_date <= to_date,
        ).order_by(Voucher.voucher_date, Voucher.id).all()
        for t in rows:
            balance += (t.debit_amount or 0) - (t.credit_amount or 0)
            entries.append({
                "date": t.voucher.voucher_date,
                "voucher_number": t.voucher.voucher_number,
                "voucher_type": t.voucher.voucher_type,
                "ledger": l.name,
                "particulars": t.narration or t.voucher.description or "",
                "receipts": round(t.debit_amount, 2),
                "payments": round(t.credit_amount, 2),
                "balance": round(balance, 2),
            })

    entries.sort(key=lambda e: e["date"])

    return {
        "company_id": company_id,
        "from_date": from_date,
        "to_date": to_date,
        "opening_balance": round(opening, 2),
        "entries": entries,
        "closing_balance": round(balance, 2),
        "total_receipts": round(sum(e["receipts"] for e in entries), 2),
        "total_payments": round(sum(e["payments"] for e in entries), 2),
    }


# ============ Fund Flow Statement ============

def get_fund_flow(db: Session, company_id: int, from_date: date, to_date: date) -> Dict:
    """Fund Flow Statement: shows sources and uses of funds.
    Sources: decrease in current assets other than cash, increase in current liabilities,
             increase in share capital, profits, sale of fixed assets, depreciation.
    Uses: increase in fixed assets, decrease in share capital, losses, dividend paid.
    """
    # Net Profit (from P&L)
    pl_query = db.query(Transaction).join(Voucher).join(Ledger).join(LedgerGroup).filter(
        Voucher.company_id == company_id,
        Voucher.is_posted == True,
        Voucher.voucher_date >= from_date,
        Voucher.voucher_date <= to_date,
    )
    income = db.query(func.coalesce(func.sum(Transaction.credit_amount - Transaction.debit_amount), 0)).join(Voucher).join(Ledger).join(LedgerGroup).filter(
        Voucher.company_id == company_id,
        Voucher.is_posted == True,
        Voucher.voucher_date >= from_date,
        Voucher.voucher_date <= to_date,
        func.lower(LedgerGroup.group_type).in_(["income", "revenue"]),
    ).scalar() or 0
    expenses = db.query(func.coalesce(func.sum(Transaction.debit_amount - Transaction.credit_amount), 0)).join(Voucher).join(Ledger).join(LedgerGroup).filter(
        Voucher.company_id == company_id,
        Voucher.is_posted == True,
        Voucher.voucher_date >= from_date,
        Voucher.voucher_date <= to_date,
        func.lower(LedgerGroup.group_type).in_(["expenses", "expense"]),
    ).scalar() or 0
    net_profit = income - expenses

    # Working capital changes
    def _sum_by_group_type(group_types: List[str], side: str) -> float:
        # side: 'debit' (asset normal), 'credit' (liability normal)
        amount_col = Transaction.debit_amount if side == "debit" else Transaction.credit_amount
        opp_col = Transaction.credit_amount if side == "debit" else Transaction.debit_amount
        result = db.query(func.coalesce(func.sum(amount_col - opp_col), 0)).join(Voucher).join(Ledger).join(LedgerGroup).filter(
            Voucher.company_id == company_id,
            Voucher.is_posted == True,
            Voucher.voucher_date >= from_date,
            Voucher.voucher_date <= to_date,
            func.lower(LedgerGroup.group_type).in_([g.lower() for g in group_types]),
        ).scalar() or 0
        return float(result or 0)

    current_asset_change = _sum_by_group_type(["Current Assets"], "debit")
    current_liability_change = _sum_by_group_type(["Current Liabilities"], "credit")
    fixed_asset_change = _sum_by_group_type(["Fixed Assets", "Assets"], "debit")

    sources = {
        "Net Profit": round(net_profit, 2),
        "Increase in Current Liabilities": round(max(current_liability_change, 0), 2),
        "Depreciation (assumed = 0)": 0.0,
    }
    uses = {
        "Increase in Fixed Assets": round(max(fixed_asset_change, 0), 2),
        "Increase in Current Assets (excl cash)": round(max(current_asset_change, 0), 2),
        "Dividend Paid (assumed = 0)": 0.0,
    }

    total_sources = sum(sources.values())
    total_uses = sum(uses.values())
    net_change_in_funds = total_sources - total_uses

    return {
        "company_id": company_id,
        "from_date": from_date,
        "to_date": to_date,
        "sources": sources,
        "total_sources": round(total_sources, 2),
        "uses": uses,
        "total_uses": round(total_uses, 2),
        "net_change_in_funds": round(net_change_in_funds, 2),
    }


# ============ Ledger Reconciliation ============

def reconcile_ledger(db: Session, ledger_id: int,
                     our_balance: float, statement_date: date,
                     notes: str = "") -> Dict:
    """Compare ledger balance against a known balance (e.g., bank statement) and report variance.
    Returns a reconciliation record with variance and any unmatched items."""
    ledger = db.query(Ledger).filter(Ledger.id == ledger_id).first()
    if not ledger:
        raise ValueError(f"Ledger {ledger_id} not found")
    from app.services.accounting_service import AccountingService
    book_balance = AccountingService.get_ledger_balance(db, ledger_id)
    variance = round(our_balance - book_balance, 2)

    # Get uncleared transactions (e.g., cheques issued but not presented)
    uncleared = db.query(Transaction).join(Voucher).filter(
        Transaction.ledger_id == ledger_id,
        Voucher.is_posted == True,
        Voucher.voucher_date <= statement_date,
    ).all()

    return {
        "ledger_id": ledger_id,
        "ledger_name": ledger.name,
        "statement_date": statement_date,
        "book_balance": round(book_balance, 2),
        "statement_balance": round(our_balance, 2),
        "variance": variance,
        "is_reconciled": abs(variance) < 0.01,
        "transaction_count": len(uncleared),
        "notes": notes,
    }


# ============ Cost Center Reports ============

def get_cost_center_report(db: Session, company_id: int, cost_center_id: int,
                           from_date: date, to_date: date) -> Dict:
    """Detailed cost center P&L: revenues and expenses for a cost center."""
    cc = db.query(CostCenter).filter(
        CostCenter.id == cost_center_id, CostCenter.company_id == company_id
    ).first()
    if not cc:
        raise ValueError(f"Cost center {cost_center_id} not found")

    expenses = db.query(
        Ledger.name,
        func.coalesce(func.sum(Transaction.debit_amount - Transaction.credit_amount), 0).label("amount"),
    ).join(Transaction, Transaction.ledger_id == Ledger.id
    ).join(Voucher, Voucher.id == Transaction.voucher_id
    ).join(LedgerGroup, LedgerGroup.id == Ledger.group_id
    ).filter(
        Transaction.cost_center_id == cost_center_id,
        Voucher.company_id == company_id,
        Voucher.is_posted == True,
        Voucher.voucher_date >= from_date,
        Voucher.voucher_date <= to_date,
        func.lower(LedgerGroup.group_type).in_(["expenses", "expense"]),
    ).group_by(Ledger.name).all()

    income = db.query(
        Ledger.name,
        func.coalesce(func.sum(Transaction.credit_amount - Transaction.debit_amount), 0).label("amount"),
    ).join(Transaction, Transaction.ledger_id == Ledger.id
    ).join(Voucher, Voucher.id == Transaction.voucher_id
    ).join(LedgerGroup, LedgerGroup.id == Ledger.group_id
    ).filter(
        Transaction.cost_center_id == cost_center_id,
        Voucher.company_id == company_id,
        Voucher.is_posted == True,
        Voucher.voucher_date >= from_date,
        Voucher.voucher_date <= to_date,
        func.lower(LedgerGroup.group_type).in_(["income", "revenue"]),
    ).group_by(Ledger.name).all()

    total_expenses = sum(float(e.amount or 0) for e in expenses)
    total_income = sum(float(i.amount or 0) for i in income)

    return {
        "company_id": company_id,
        "cost_center": {"id": cc.id, "name": cc.name, "code": cc.code},
        "from_date": from_date,
        "to_date": to_date,
        "income": [{"ledger": i.name, "amount": round(float(i.amount), 2)} for i in income],
        "expenses": [{"ledger": e.name, "amount": round(float(e.amount), 2)} for e in expenses],
        "total_income": round(total_income, 2),
        "total_expenses": round(total_expenses, 2),
        "net": round(total_income - total_expenses, 2),
    }


def list_cost_center_summary(db: Session, company_id: int,
                             from_date: date, to_date: date) -> List[Dict]:
    """Summary across all cost centers."""
    rows = db.query(
        CostCenter.id, CostCenter.name, CostCenter.code,
        func.coalesce(func.sum(Transaction.debit_amount), 0).label("debits"),
        func.coalesce(func.sum(Transaction.credit_amount), 0).label("credits"),
    ).outerjoin(Transaction, Transaction.cost_center_id == CostCenter.id
    ).outerjoin(Voucher, and_(Voucher.id == Transaction.voucher_id,
                                Voucher.is_posted == True,
                                Voucher.voucher_date >= from_date,
                                Voucher.voucher_date <= to_date)
    ).filter(CostCenter.company_id == company_id
    ).group_by(CostCenter.id, CostCenter.name, CostCenter.code).all()
    return [{
        "id": r.id, "name": r.name, "code": r.code,
        "debits": round(float(r.debits or 0), 2),
        "credits": round(float(r.credits or 0), 2),
        "net": round(float(r.debits or 0) - float(r.credits or 0), 2),
    } for r in rows]


# ============ Recurring Voucher Generation ============

def generate_due_recurring_vouchers(db: Session, today: Optional[date] = None) -> List[int]:
    """Auto-generate vouchers from active recurring templates whose next_due <= today.
    Returns the list of generated voucher IDs."""
    today = today or date.today()
    templates = db.query(RecurringVoucher).filter(
        RecurringVoucher.is_active == True,
        RecurringVoucher.next_due <= today,
        or_(RecurringVoucher.end_date.is_(None), RecurringVoucher.end_date >= today),
    ).all()
    generated_ids = []
    for tmpl in templates:
        data = tmpl.template_data or {}
        transactions = data.get("transactions", [])
        if not transactions:
            continue
        last = db.query(Voucher).filter(
            Voucher.company_id == tmpl.company_id,
            Voucher.voucher_type == tmpl.voucher_type,
        ).order_by(Voucher.id.desc()).first()
        next_num = 1
        if last and last.voucher_number:
            try:
                next_num = int(last.voucher_number.split("-")[-1]) + 1
            except (ValueError, IndexError):
                next_num = last.id + 1
        voucher_number = f"{tmpl.voucher_type[:3].upper()}-{next_num:06d}"
        total_debit = sum(float(t.get("debit_amount", 0)) for t in transactions)
        total_credit = sum(float(t.get("credit_amount", 0)) for t in transactions)
        if abs(total_debit - total_credit) >= 0.01:
            logger.warning("Skipping recurring voucher %s: not balanced", tmpl.template_name)
            continue
        v = Voucher(
            company_id=tmpl.company_id,
            voucher_type=tmpl.voucher_type,
            voucher_number=voucher_number,
            voucher_date=today,
            description=f"Auto-generated from '{tmpl.template_name}'",
            narration=tmpl.template_name,
            total_debit=total_debit,
            total_credit=total_credit,
            is_posted=True,
        )
        db.add(v)
        db.flush()
        for t in transactions:
            db.add(Transaction(
                voucher_id=v.id,
                ledger_id=int(t["ledger_id"]),
                debit_amount=float(t.get("debit_amount", 0)),
                credit_amount=float(t.get("credit_amount", 0)),
                narration=t.get("narration"),
            ))
        # Update next_due
        tmpl.last_generated = today
        if tmpl.frequency == "DAILY":
            next_due = today + timedelta(days=1)
        elif tmpl.frequency == "WEEKLY":
            next_due = today + timedelta(weeks=1)
        elif tmpl.frequency == "MONTHLY":
            next_due = _add_months(today, 1)
        elif tmpl.frequency == "QUARTERLY":
            next_due = _add_months(today, 3)
        elif tmpl.frequency == "YEARLY":
            next_due = _add_months(today, 12)
        else:
            next_due = today + timedelta(days=30)
        tmpl.next_due = next_due
        generated_ids.append(v.id)
    db.commit()
    return generated_ids


def _add_months(d: date, months: int) -> date:
    month = d.month - 1 + months
    year = d.year + month // 12
    month = month % 12 + 1
    day = min(d.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


# ============ Bank Reconciliation Statement ============

def bank_reconciliation_statement(
    db: Session, bank_account_id: int, as_of_date: date, statement_balance: float
) -> Dict:
    """Build a Bank Reconciliation Statement.
    Bank balance as per books is reconciled against the bank statement balance.
    Differences typically include: outstanding cheques, deposits in transit, bank charges not recorded.
    """
    ba = db.query(BankAccount).filter(BankAccount.id == bank_account_id).first()
    if not ba:
        raise ValueError("Bank account not found")

    # Find a bank ledger
    bank_ledger = db.query(Ledger).join(LedgerGroup).filter(
        Ledger.company_id == ba.company_id,
        LedgerGroup.group_type.in_(["Assets", "Current Assets", "Bank Accounts"]),
    ).first()

    book_balance = ba.opening_balance
    uncleared_cheques = []
    deposits_in_transit = []
    if bank_ledger:
        rows = db.query(Transaction).join(Voucher).filter(
            Transaction.ledger_id == bank_ledger.id,
            Voucher.is_posted == True,
            Voucher.voucher_date <= as_of_date,
        ).all()
        for t in rows:
            book_balance += (t.debit_amount or 0) - (t.credit_amount or 0)
        # Heuristic: reference_number starting with "CHQ-" => outstanding cheque (credit, not yet presented)
        # Reference containing "TR-" => deposit in transit (debit not yet credited)
        for t in rows:
            ref = (t.voucher.reference_number or "")
            desc = (t.voucher.description or "")
            if "CHQ" in ref.upper() and t.credit_amount and t.credit_amount > 0:
                uncleared_cheques.append({
                    "date": t.voucher.voucher_date,
                    "voucher_number": t.voucher.voucher_number,
                    "ref": ref, "amount": round(t.credit_amount, 2),
                })
            if "TR" in ref.upper() and t.debit_amount and t.debit_amount > 0:
                deposits_in_transit.append({
                    "date": t.voucher.voucher_date,
                    "voucher_number": t.voucher.voucher_number,
                    "ref": ref, "amount": round(t.debit_amount, 2),
                })

    total_uncleared = sum(c["amount"] for c in uncleared_cheques)
    total_in_transit = sum(d["amount"] for d in deposits_in_transit)
    adjusted_book = book_balance - total_uncleared + total_in_transit
    variance = round(adjusted_book - statement_balance, 2)

    return {
        "bank_account_id": bank_account_id,
        "as_of_date": as_of_date,
        "book_balance": round(book_balance, 2),
        "add_deposits_in_transit": round(total_in_transit, 2),
        "less_uncleared_cheques": round(-total_uncleared, 2),
        "adjusted_book_balance": round(adjusted_book, 2),
        "statement_balance": round(statement_balance, 2),
        "variance": variance,
        "is_reconciled": abs(variance) < 0.01,
        "uncleared_cheques": uncleared_cheques,
        "deposits_in_transit": deposits_in_transit,
    }
