"""
Income Tax Management Service
Handles ITR filing, AIS reconciliation, tax calculations
"""

from datetime import datetime, date
from sqlalchemy.orm import Session
from app.models.models import (
    IncomeTaxReturn, AISReconciliation, Ledger, Transaction, Voucher, Invoice, PayrollRecord, Company
)
from typing import Dict, Optional, List, Tuple


class IncomeTaxService:
    """Service for managing income tax operations"""
    
    # Tax slabs for FY 2023-24 (can be updated annually)
    TAX_SLABS_INDIVIDUAL = [
        (0, 250000, 0),
        (250000, 500000, 0.05),
        (500000, 1000000, 0.20),
        (1000000, float('inf'), 0.30)
    ]
    
    TAX_SLABS_BUSINESS = [
        (0, 250000, 0),
        (250000, 500000, 0.05),
        (500000, 1000000, 0.20),
        (1000000, float('inf'), 0.30)
    ]
    
    SURCHARGE_RATE = 0.25  # 25% surcharge on tax if income > 1 crore
    CESS_RATE = 0.04  # 4% cess on total tax
    
    # Section 80C Deductions
    SECTION_80C_LIMIT = 150000  # Life insurance, GPF, NSC, etc.
    SECTION_80D_LIMIT = 100000  # Health insurance
    SECTION_80E_LIMIT = 50000  # Interest on education loan
    SECTION_80G_LIMIT = None  # Charitable donations (50% or 100% of AGI)
    
    @classmethod
    def calculate_income_from_ledgers(
        cls,
        company_id: int,
        financial_year: str,
        db: Session
    ) -> Dict:
        """Calculate income from ledgers"""
        
        # Parse financial year
        start_year, end_year = map(int, financial_year.split('-'))
        start_date = date(start_year, 4, 1)  # April 1st
        end_date = date(end_year, 3, 31)  # March 31st
        
        # Get income ledgers (Sales, Services, Interest, etc.)
        income_ledgers = db.query(Ledger).filter(
            Ledger.company_id == company_id,
            Ledger.group_id.in_(
                db.query(Ledger).filter(Ledger.name.ilike("%income%")).with_entities(Ledger.group_id)
            )
        ).all()
        
        income_data = {
            'business_income': 0,
            'salary_income': 0,
            'capital_gains': 0,
            'other_income': 0,
            'total_income': 0
        }
        
        for ledger in income_ledgers:
            # Get credit balance (income)
            balance = db.query(Transaction).filter(
                Transaction.ledger_id == ledger.id,
                Transaction.voucher.has(Voucher.voucher_date >= start_date),
                Transaction.voucher.has(Voucher.voucher_date <= end_date)
            )
            
            credit_sum = sum(t.credit_amount for t in balance.all())
            
            if 'salary' in ledger.name.lower():
                income_data['salary_income'] += credit_sum
            elif 'capital' in ledger.name.lower():
                income_data['capital_gains'] += credit_sum
            else:
                income_data['business_income'] += credit_sum
        
        income_data['total_income'] = sum([
            income_data['salary_income'],
            income_data['business_income'],
            income_data['capital_gains'],
            income_data['other_income']
        ])
        
        return income_data
    
    @classmethod
    def calculate_expenses_from_ledgers(
        cls,
        company_id: int,
        financial_year: str,
        db: Session
    ) -> Dict:
        """Calculate deductible expenses from ledgers"""
        
        start_year, end_year = map(int, financial_year.split('-'))
        start_date = date(start_year, 4, 1)
        end_date = date(end_year, 3, 31)
        
        expense_data = {
            'salary_expense': 0,
            'rent_expense': 0,
            'utilities_expense': 0,
            'depreciation': 0,
            'interest_expense': 0,
            'other_expenses': 0,
            'total_expenses': 0
        }
        
        # Get expense ledgers
        expense_ledgers = db.query(Ledger).filter(
            Ledger.company_id == company_id,
            Ledger.group_id.in_(
                db.query(Ledger).filter(Ledger.name.ilike("%expense%")).with_entities(Ledger.group_id)
            )
        ).all()
        
        for ledger in expense_ledgers:
            balance = db.query(Transaction).filter(
                Transaction.ledger_id == ledger.id,
                Transaction.voucher.has(Voucher.voucher_date >= start_date),
                Transaction.voucher.has(Voucher.voucher_date <= end_date)
            )
            
            debit_sum = sum(t.debit_amount for t in balance.all())
            
            if 'salary' in ledger.name.lower():
                expense_data['salary_expense'] += debit_sum
            elif 'rent' in ledger.name.lower():
                expense_data['rent_expense'] += debit_sum
            elif 'depreciation' in ledger.name.lower():
                expense_data['depreciation'] += debit_sum
            elif 'interest' in ledger.name.lower():
                expense_data['interest_expense'] += debit_sum
            else:
                expense_data['other_expenses'] += debit_sum
        
        expense_data['total_expenses'] = sum([
            expense_data['salary_expense'],
            expense_data['rent_expense'],
            expense_data['utilities_expense'],
            expense_data['depreciation'],
            expense_data['interest_expense'],
            expense_data['other_expenses']
        ])
        
        return expense_data
    
    @classmethod
    def calculate_taxable_income(
        cls,
        gross_income: float,
        deductions: float,
        depreciation: float = 0
    ) -> float:
        """Calculate taxable income after deductions"""
        
        taxable_income = gross_income - deductions - depreciation
        return max(0, taxable_income)
    
    @classmethod
    def calculate_income_tax(cls, taxable_income: float, entity_type: str = "Individual") -> Tuple[float, float, float, float]:
        """Calculate income tax, surcharge, cess, and total tax"""
        
        if entity_type == "Individual":
            slabs = cls.TAX_SLABS_INDIVIDUAL
        else:
            slabs = cls.TAX_SLABS_BUSINESS
        
        tax = 0
        for lower, upper, rate in slabs:
            if taxable_income > lower:
                income_in_slab = min(taxable_income, upper) - lower
                tax += income_in_slab * rate
        
        # Surcharge (25% if income > 1 crore)
        surcharge = 0
        if taxable_income > 10000000:
            surcharge = tax * cls.SURCHARGE_RATE
        
        # Cess (4% on total tax + surcharge)
        cess = (tax + surcharge) * cls.CESS_RATE
        
        total_tax = tax + surcharge + cess
        
        return round(tax, 2), round(surcharge, 2), round(cess, 2), round(total_tax, 2)
    
    @classmethod
    def create_itr_return(
        cls,
        company_id: int,
        financial_year: str,
        return_type: str,
        entity_type: str,
        db: Session
    ) -> IncomeTaxReturn:
        """Create ITR return by calculating from ledgers"""
        
        # Get company
        company = db.query(Company).get(company_id)
        if not company:
            raise ValueError("Company not found")
        
        # Calculate income and expenses
        income_data = cls.calculate_income_from_ledgers(company_id, financial_year, db)
        expense_data = cls.calculate_expenses_from_ledgers(company_id, financial_year, db)
        
        total_income = income_data['total_income']
        total_expenses = expense_data['total_expenses']
        depreciation = expense_data.get('depreciation', 0)
        
        # Business income calculation
        business_income = max(0, total_income - total_expenses - depreciation)
        
        # Standard deduction (for individuals with business income)
        standard_deduction = min(50000, business_income) if entity_type == "Individual" else 0
        
        # Section 80 deductions (example)
        section_80_deductions = min(100000, business_income - standard_deduction)
        
        # Taxable income
        taxable_income = max(
            0,
            business_income - standard_deduction - section_80_deductions - depreciation
        )
        
        # Calculate tax
        income_tax, surcharge, cess, total_tax = cls.calculate_income_tax(taxable_income, entity_type)
        
        # Create ITR return record
        itr_return = IncomeTaxReturn(
            company_id=company_id,
            financial_year=financial_year,
            return_type=return_type,
            entity_type=entity_type,
            total_income=round(total_income, 2),
            business_income=round(business_income, 2),
            salary_income=round(income_data.get('salary_income', 0), 2),
            capital_gains=round(income_data.get('capital_gains', 0), 2),
            other_income=round(income_data.get('other_income', 0), 2),
            standard_deduction=round(standard_deduction, 2),
            section_80_deductions=round(section_80_deductions, 2),
            depreciation=round(depreciation, 2),
            taxable_income=round(taxable_income, 2),
            income_tax=income_tax,
            surcharge=surcharge,
            cess=cess,
            total_tax=total_tax,
            status="Draft"
        )
        
        db.add(itr_return)
        db.commit()
        
        return itr_return
    
    @classmethod
    def calculate_tds_credit(
        cls,
        company_id: int,
        financial_year: str,
        db: Session
    ) -> float:
        """Calculate total TDS credit for the financial year"""
        
        start_year, end_year = map(int, financial_year.split('-'))
        start_date = date(start_year, 4, 1)
        end_date = date(end_year, 3, 31)
        
        # Get TDS from vouchers and transactions marked as TDS
        tds_total = db.query(Transaction).filter(
            Transaction.voucher.has(Voucher.company_id == company_id),
            Transaction.voucher.has(Voucher.voucher_date >= start_date),
            Transaction.voucher.has(Voucher.voucher_date <= end_date),
            Transaction.voucher.has(Voucher.description.ilike("%TDS%"))
        ).with_entities(Transaction.debit_amount).all()
        
        return sum(amount[0] for amount in tds_total)
    
    @classmethod
    def create_ais_reconciliation(
        cls,
        company_id: int,
        financial_year: str,
        ais_data: Dict,
        db: Session
    ) -> AISReconciliation:
        """Create AIS reconciliation"""
        
        # Calculate our figures
        income_data = cls.calculate_income_from_ledgers(company_id, financial_year, db)
        tds_credit = cls.calculate_tds_credit(company_id, financial_year, db)
        
        our_total_income = income_data['total_income']
        our_tds_credit = tds_credit
        
        # Variances
        variance_income = abs(our_total_income - ais_data.get('total_income', 0))
        variance_tds = abs(our_tds_credit - ais_data.get('tds_credit', 0))
        
        reconciliation = AISReconciliation(
            company_id=company_id,
            financial_year=financial_year,
            ais_total_income=ais_data.get('total_income', 0),
            ais_tds_credit=ais_data.get('tds_credit', 0),
            ais_advance_tax=ais_data.get('advance_tax', 0),
            our_total_income=round(our_total_income, 2),
            our_tds_credit=round(our_tds_credit, 2),
            our_advance_tax=0,
            variance_income=round(variance_income, 2),
            variance_tds=round(variance_tds, 2),
            variance_advance_tax=0,
            status="Verified" if variance_income < 1000 and variance_tds < 1000 else "Variance"
        )
        
        db.add(reconciliation)
        db.commit()
        
        return reconciliation
    
    @classmethod
    def get_itr_summary(cls, company_id: int, financial_year: str, db: Session) -> Dict:
        """Get ITR summary for a financial year"""
        
        returns = db.query(IncomeTaxReturn).filter(
            IncomeTaxReturn.company_id == company_id,
            IncomeTaxReturn.financial_year == financial_year
        ).all()
        
        if not returns:
            return {}
        
        return_obj = returns[0]  # Typically one ITR per FY
        
        return {
            "financial_year": financial_year,
            "return_type": return_obj.return_type,
            "entity_type": return_obj.entity_type,
            "total_income": float(return_obj.total_income),
            "business_income": float(return_obj.business_income),
            "salary_income": float(return_obj.salary_income),
            "capital_gains": float(return_obj.capital_gains),
            "standard_deduction": float(return_obj.standard_deduction),
            "section_80_deductions": float(return_obj.section_80_deductions),
            "depreciation": float(return_obj.depreciation),
            "taxable_income": float(return_obj.taxable_income),
            "income_tax": float(return_obj.income_tax),
            "surcharge": float(return_obj.surcharge),
            "cess": float(return_obj.cess),
            "total_tax": float(return_obj.total_tax),
            "tds_credit": float(return_obj.tds_credit),
            "tax_payable": float(return_obj.tax_payable),
            "status": return_obj.status
        }
