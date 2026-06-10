"""
Accounting Service - Core business logic for accounting operations
Handles all accounting-related operations including voucher posting, 
balance calculations, and financial statement generation
"""

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_
from app.models.models import (
    Voucher, Transaction, Ledger, LedgerGroup, 
    Company, CostCenter, ProfitCenter
)
from app.schemas.schemas import VoucherCreate, TransactionCreate
from datetime import date, datetime
from decimal import Decimal
from typing import List, Dict, Tuple, Optional
import logging

logger = logging.getLogger(__name__)

class AccountingService:
    """Service for accounting operations"""
    
    @staticmethod
    def validate_voucher_balance(transactions: List[TransactionCreate]) -> Tuple[bool, str, float, float]:
        """
        Validate if voucher is balanced (debits = credits)
        Returns: (is_balanced, message, total_debit, total_credit)
        """
        total_debit = sum(t.debit_amount for t in transactions)
        total_credit = sum(t.credit_amount for t in transactions)
        
        # Allow for floating point errors (within 0.01)
        is_balanced = abs(total_debit - total_credit) < 0.01
        
        message = f"Debit: {total_debit}, Credit: {total_credit}"
        if not is_balanced:
            message += f" - NOT BALANCED by {abs(total_debit - total_credit)}"
        
        return is_balanced, message, total_debit, total_credit
    
    @staticmethod
    def create_voucher(
        db: Session,
        company_id: int,
        voucher_type: str,
        voucher_date: date,
        transactions: List[TransactionCreate],
        description: str = None,
        narration: str = None
    ) -> Voucher:
        """
        Create a new voucher with transactions
        Validates balance and creates double-entry transactions
        """
        
        # Verify company exists
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise ValueError(f"Company {company_id} not found")
        
        # Validate voucher balance
        is_balanced, message, total_debit, total_credit = AccountingService.validate_voucher_balance(transactions)
        if not is_balanced:
            raise ValueError(f"Voucher not balanced: {message}")
        
        # Verify all ledgers exist
        ledger_ids = {t.ledger_id for t in transactions}
        existing_ledgers = db.query(Ledger).filter(Ledger.id.in_(ledger_ids)).count()
        if existing_ledgers != len(ledger_ids):
            raise ValueError("One or more ledgers not found")
        
        # Generate voucher number
        last_voucher = db.query(Voucher).filter(
            (Voucher.company_id == company_id) & 
            (Voucher.voucher_type == voucher_type)
        ).order_by(Voucher.id.desc()).first()
        
        voucher_num = last_voucher.voucher_number if last_voucher else "0"
        next_num = int(voucher_num.split("-")[-1]) + 1 if "-" in str(voucher_num) else 1
        voucher_number = f"{voucher_type[:3].upper()}-{next_num:06d}"
        
        # Create voucher
        voucher = Voucher(
            company_id=company_id,
            voucher_type=voucher_type,
            voucher_number=voucher_number,
            voucher_date=voucher_date,
            description=description,
            narration=narration,
            total_debit=total_debit,
            total_credit=total_credit,
            is_posted=False
        )
        
        db.add(voucher)
        db.flush()
        
        # Create transactions
        for trans_data in transactions:
            transaction = Transaction(
                voucher_id=voucher.id,
                ledger_id=trans_data.ledger_id,
                debit_amount=trans_data.debit_amount,
                credit_amount=trans_data.credit_amount,
                narration=trans_data.narration,
                cost_center_id=getattr(trans_data, 'cost_center_id', None),
                profit_center_id=getattr(trans_data, 'profit_center_id', None)
            )
            db.add(transaction)
        
        db.commit()
        db.refresh(voucher)
        
        logger.info(f"Voucher {voucher_number} created for company {company_id}")
        
        return voucher
    
    @staticmethod
    def post_voucher(db: Session, voucher_id: int) -> Voucher:
        """
        Post a voucher (finalize it - cannot be modified after posting)
        """
        voucher = db.query(Voucher).filter(Voucher.id == voucher_id).first()
        if not voucher:
            raise ValueError(f"Voucher {voucher_id} not found")
        
        if voucher.is_posted:
            raise ValueError(f"Voucher {voucher.voucher_number} already posted")
        
        # Validate balance one more time
        total_debit = sum(t.debit_amount for t in voucher.transactions)
        total_credit = sum(t.credit_amount for t in voucher.transactions)
        
        if abs(total_debit - total_credit) >= 0.01:
            raise ValueError("Cannot post unbalanced voucher")
        
        voucher.is_posted = True
        db.commit()
        db.refresh(voucher)
        
        logger.info(f"Voucher {voucher.voucher_number} posted")
        
        return voucher
    
    @staticmethod
    def get_ledger_balance(db: Session, ledger_id: int) -> float:
        """
        Calculate current balance of a ledger
        Returns: Opening Balance + Debits - Credits
        """
        ledger = db.query(Ledger).filter(Ledger.id == ledger_id).first()
        if not ledger:
            raise ValueError(f"Ledger {ledger_id} not found")
        
        # Get all posted transactions for this ledger
        transactions = db.query(Transaction).join(Voucher).filter(
            (Transaction.ledger_id == ledger_id) &
            (Voucher.is_posted == True)
        ).all()
        
        total_debit = sum(t.debit_amount for t in transactions)
        total_credit = sum(t.credit_amount for t in transactions)
        
        # Opening balance + Debits - Credits
        balance = ledger.opening_balance + total_debit - total_credit
        
        return balance
    
    @staticmethod
    def get_trial_balance(db: Session, company_id: int, as_of_date: Optional[date] = None) -> Dict:
        """
        Generate Trial Balance for a company
        Shows all ledgers with their debit/credit balances
        """
        company = db.query(Company).filter(Company.id == company_id).first()
        if not company:
            raise ValueError(f"Company {company_id} not found")
        
        # Optimize Trial Balance: Single aggregated query instead of N+1 queries
        voucher_conditions = [Voucher.id == Transaction.voucher_id, Voucher.is_posted == True]
        if as_of_date:
            voucher_conditions.append(Voucher.voucher_date <= as_of_date)
            
        results = db.query(
            Ledger.id,
            Ledger.name,
            Ledger.opening_balance,
            LedgerGroup.name.label('group_name'),
            func.coalesce(func.sum(case((and_(*voucher_conditions), Transaction.debit_amount), else_=0)), 0).label('debits'),
            func.coalesce(func.sum(case((and_(*voucher_conditions), Transaction.credit_amount), else_=0)), 0).label('credits')
        ).join(LedgerGroup, Ledger.group_id == LedgerGroup.id) \
         .outerjoin(Transaction, Transaction.ledger_id == Ledger.id) \
         .outerjoin(Voucher, Voucher.id == Transaction.voucher_id) \
         .filter(Ledger.company_id == company_id) \
         .group_by(Ledger.id, Ledger.name, Ledger.opening_balance, LedgerGroup.name).all()

        trial_balance = []
        total_debit = 0
        total_credit = 0
        
        for r in results:
            balance = r.opening_balance + float(r.debits) - float(r.credits)
            
            if abs(balance) >= 0.01:  # Only include non-zero balances
                if balance > 0:
                    trial_balance.append({
                        "ledger_id": r.id,
                        "ledger_name": r.name,
                        "ledger_group": r.group_name,
                        "debit": balance,
                        "credit": 0
                    })
                    total_debit += balance
                else:
                    trial_balance.append({
                        "ledger_id": r.id,
                        "ledger_name": r.name,
                        "ledger_group": r.group_name,
                        "debit": 0,
                        "credit": abs(balance)
                    })
                    total_credit += abs(balance)
        
        is_balanced = abs(total_debit - total_credit) < 0.01
        
        return {
            "company_id": company_id,
            "company_name": company.name,
            "as_of_date": as_of_date or date.today(),
            "trial_balance": trial_balance,
            "total_debit": round(total_debit, 2),
            "total_credit": round(total_credit, 2),
            "is_balanced": is_balanced,
            "balance_difference": round(total_debit - total_credit, 2)
        }
    
    @staticmethod
    def get_general_ledger(
        db: Session,
        ledger_id: int,
        from_date: Optional[date] = None,
        to_date: Optional[date] = None
    ) -> Dict:
        """
        Get General Ledger for a specific account
        Shows all transactions with running balance
        """
        ledger = db.query(Ledger).filter(Ledger.id == ledger_id).first()
        if not ledger:
            raise ValueError(f"Ledger {ledger_id} not found")
        
        query = db.query(Transaction).join(Voucher).filter(
            (Transaction.ledger_id == ledger_id) &
            (Voucher.is_posted == True)
        )
        
        if from_date:
            query = query.filter(Voucher.voucher_date >= from_date)
        if to_date:
            query = query.filter(Voucher.voucher_date <= to_date)
        
        transactions = query.order_by(Voucher.voucher_date).all()
        
        entries = []
        running_balance = ledger.opening_balance
        
        for trans in transactions:
            running_balance += trans.debit_amount - trans.credit_amount
            entries.append({
                "date": trans.voucher.voucher_date,
                "voucher_number": trans.voucher.voucher_number,
                "description": trans.voucher.description,
                "narration": trans.narration,
                "debit": round(trans.debit_amount, 2),
                "credit": round(trans.credit_amount, 2),
                "balance": round(running_balance, 2)
            })
        
        return {
            "ledger_id": ledger_id,
            "ledger_name": ledger.name,
            "ledger_group": ledger.group.name,
            "opening_balance": ledger.opening_balance,
            "from_date": from_date or (transactions[0].voucher.voucher_date if transactions else date.today()),
            "to_date": to_date or date.today(),
            "entries": entries,
            "closing_balance": running_balance if entries else ledger.opening_balance
        }
    
    @staticmethod
    def get_balance_sheet(db: Session, company_id: int, as_of_date: Optional[date] = None) -> Dict:
        """
        Generate Balance Sheet
        Assets = Liabilities + Equity
        """
        trial_balance_data = AccountingService.get_trial_balance(db, company_id, as_of_date)
        
        assets = {}
        liabilities = {}
        equity = {}
        
        for item in trial_balance_data["trial_balance"]:
            group = item["ledger_group"]
            balance = item["debit"] if item["debit"] > 0 else item["credit"]
            
            if group.lower() in ["assets", "asset"]:
                if "assets" not in assets:
                    assets["assets"] = 0
                assets["assets"] += balance
            elif group.lower() in ["liabilities", "liability"]:
                if "liabilities" not in liabilities:
                    liabilities["liabilities"] = 0
                liabilities["liabilities"] += balance
            elif group.lower() in ["equity", "capital", "reserves"]:
                if "equity" not in equity:
                    equity["equity"] = 0
                equity["equity"] += balance
        
        total_assets = sum(assets.values())
        total_liabilities = sum(liabilities.values())
        total_equity = sum(equity.values())
        
        return {
            "company_id": company_id,
            "as_of_date": as_of_date or date.today(),
            "assets": assets,
            "total_assets": round(total_assets, 2),
            "liabilities": liabilities,
            "total_liabilities": round(total_liabilities, 2),
            "equity": equity,
            "total_equity": round(total_equity, 2),
            "total_liabilities_and_equity": round(total_liabilities + total_equity, 2),
            "is_balanced": abs(total_assets - (total_liabilities + total_equity)) < 0.01
        }
    
    @staticmethod
    def get_profit_loss(
        db: Session,
        company_id: int,
        from_date: date,
        to_date: date
    ) -> Dict:
        """
        Generate Profit & Loss Statement
        """
        # Calculate P&L for the specific date range
        results = db.query(
            LedgerGroup.name.label('group_name'),
            func.coalesce(func.sum(Transaction.debit_amount), 0).label('total_debits'),
            func.coalesce(func.sum(Transaction.credit_amount), 0).label('total_credits')
        ).select_from(Transaction) \
         .join(Voucher, Transaction.voucher_id == Voucher.id) \
         .join(Ledger, Transaction.ledger_id == Ledger.id) \
         .join(LedgerGroup, Ledger.group_id == LedgerGroup.id) \
         .filter(
             Voucher.company_id == company_id,
             Voucher.is_posted == True,
             Voucher.voucher_date >= from_date,
             Voucher.voucher_date <= to_date
         ).group_by(LedgerGroup.name).all()
        
        income = {}
        expenses = {}
        
        for r in results:
            group = r.group_name
            # Net balance for P&L items
            balance = float(r.total_debits) - float(r.total_credits)
            
            if group.lower() in ["income", "revenue", "sales"]:
                # Income usually has credit balance, so we want credit - debit
                balance_val = float(r.total_credits) - float(r.total_debits)
                if "income" not in income:
                    income["income"] = 0
                income["income"] += balance_val
            elif group.lower() in ["expenses", "expense", "cost"]:
                # Expenses usually have debit balance
                if "expenses" not in expenses:
                    expenses["expenses"] = 0
                expenses["expenses"] += balance
        
        total_income = sum(income.values())
        total_expenses = sum(expenses.values())
        profit = total_income - total_expenses
        
        return {
            "company_id": company_id,
            "from_date": from_date,
            "to_date": to_date,
            "income": income,
            "total_income": round(total_income, 2),
            "expenses": expenses,
            "total_expenses": round(total_expenses, 2),
            "profit_loss": round(profit, 2),
            "is_profit": profit >= 0
        }
    
    @staticmethod
    def get_cash_flow_summary(
        db: Session,
        company_id: int,
        from_date: date,
        to_date: date
    ) -> Dict:
        """
        Get Cash Flow summary based on transactions
        """
        query = db.query(Transaction).join(Voucher).options(
            joinedload(Transaction.ledger).joinedload(Ledger.group)
        ).filter(
            (Voucher.company_id == company_id) &
            (Voucher.voucher_date >= from_date) &
            (Voucher.voucher_date <= to_date) &
            (Voucher.is_posted == True)
        )
        
        transactions = query.all()
        
        operating = 0
        investing = 0
        financing = 0
        
        # Simplified cash flow categorization
        for trans in transactions:
            ledger_group = trans.ledger.group.name.lower()
            amount = trans.debit_amount - trans.credit_amount
            
            if ledger_group in ["expenses", "income"]:
                operating += amount
            elif ledger_group in ["assets"]:
                investing += amount
            elif ledger_group in ["liabilities", "equity"]:
                financing += amount
        
        total_cash_flow = operating + investing + financing
        
        return {
            "company_id": company_id,
            "from_date": from_date,
            "to_date": to_date,
            "operating_cash_flow": round(operating, 2),
            "investing_cash_flow": round(investing, 2),
            "financing_cash_flow": round(financing, 2),
            "total_cash_flow": round(total_cash_flow, 2)
        }

accounting_service = AccountingService()
