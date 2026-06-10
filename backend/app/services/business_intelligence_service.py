"""
Business Intelligence & Analytics Service
Handles dashboards, financial metrics, KPI calculations, predictions
"""

from datetime import datetime, date, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models.models import (
    Dashboard, FinancialMetric, Ledger, Transaction, Voucher, 
    Invoice, PayrollRecord, Company
)
from typing import Dict, List, Optional
import json


class BusinessIntelligenceService:
    """Service for business intelligence and analytics"""
    
    @classmethod
    def calculate_revenue(
        cls,
        company_id: int,
        from_date: date,
        to_date: date,
        db: Session
    ) -> float:
        """Calculate total revenue"""
        
        # Get sales/income ledgers
        sales_ledgers = db.query(Ledger).filter(
            and_(
                Ledger.company_id == company_id,
                Ledger.name.ilike('%income%') | Ledger.name.ilike('%sales%')
            )
        ).all()
        
        total_revenue = 0
        for ledger in sales_ledgers:
            transactions = db.query(Transaction).filter(
                and_(
                    Transaction.ledger_id == ledger.id,
                    Transaction.voucher.has(Voucher.company_id == company_id),
                    Transaction.voucher.has(Voucher.voucher_date >= from_date),
                    Transaction.voucher.has(Voucher.voucher_date <= to_date)
                )
            ).all()
            
            total_revenue += sum(t.credit_amount for t in transactions)
        
        return round(total_revenue, 2)
    
    @classmethod
    def calculate_expenses(
        cls,
        company_id: int,
        from_date: date,
        to_date: date,
        db: Session
    ) -> float:
        """Calculate total expenses"""
        
        expense_ledgers = db.query(Ledger).filter(
            and_(
                Ledger.company_id == company_id,
                Ledger.name.ilike('%expense%') | Ledger.name.ilike('%cost%')
            )
        ).all()
        
        total_expenses = 0
        for ledger in expense_ledgers:
            transactions = db.query(Transaction).filter(
                and_(
                    Transaction.ledger_id == ledger.id,
                    Transaction.voucher.has(Voucher.company_id == company_id),
                    Transaction.voucher.has(Voucher.voucher_date >= from_date),
                    Transaction.voucher.has(Voucher.voucher_date <= to_date)
                )
            ).all()
            
            total_expenses += sum(t.debit_amount for t in transactions)
        
        return round(total_expenses, 2)
    
    @classmethod
    def calculate_profit(
        cls,
        company_id: int,
        from_date: date,
        to_date: date,
        db: Session
    ) -> float:
        """Calculate profit"""
        
        revenue = cls.calculate_revenue(company_id, from_date, to_date, db)
        expenses = cls.calculate_expenses(company_id, from_date, to_date, db)
        
        return round(revenue - expenses, 2)
    
    @classmethod
    def calculate_receivables(
        cls,
        company_id: int,
        as_of_date: date,
        db: Session
    ) -> float:
        """Calculate outstanding receivables"""
        
        invoices = db.query(Invoice).filter(
            and_(
                Invoice.company_id == company_id,
                Invoice.invoice_date <= as_of_date,
                Invoice.status != "Paid"
            )
        ).all()
        
        outstanding = sum(
            invoice.total_amount - (invoice.paid_amount or 0)
            for invoice in invoices
        )
        
        return round(outstanding, 2)
    
    @classmethod
    def calculate_payables(
        cls,
        company_id: int,
        as_of_date: date,
        db: Session
    ) -> float:
        """Calculate outstanding payables"""
        
        # Get expense vouchers that haven't been fully paid
        vouchers = db.query(Voucher).filter(
            and_(
                Voucher.company_id == company_id,
                Voucher.voucher_date <= as_of_date,
                Voucher.is_posted == True
            )
        ).all()
        
        # Simplified: assume all vouchers are payables
        payables = sum(v.total_debit for v in vouchers)
        
        return round(payables, 2)
    
    @classmethod
    def calculate_working_capital(
        cls,
        company_id: int,
        as_of_date: date,
        db: Session
    ) -> float:
        """Calculate working capital (Current Assets - Current Liabilities)"""
        
        receivables = cls.calculate_receivables(company_id, as_of_date, db)
        inventory = cls.calculate_inventory_value(company_id, as_of_date, db)
        cash = cls.calculate_cash_balance(company_id, as_of_date, db)
        
        current_assets = receivables + inventory + cash
        
        payables = cls.calculate_payables(company_id, as_of_date, db)
        
        working_capital = current_assets - payables
        
        return round(working_capital, 2)
    
    @classmethod
    def calculate_inventory_value(
        cls,
        company_id: int,
        as_of_date: date,
        db: Session
    ) -> float:
        """Calculate inventory valuation"""
        
        # Simplified: sum of all stock items value
        from app.models.models import StockItem
        
        stock_items = db.query(StockItem).filter(
            StockItem.company_id == company_id
        ).all()
        
        total_value = sum(
            (item.quantity_on_hand or 0) * (item.purchase_price or 0)
            for item in stock_items
        )
        
        return round(total_value, 2)
    
    @classmethod
    def calculate_cash_balance(
        cls,
        company_id: int,
        as_of_date: date,
        db: Session
    ) -> float:
        """Calculate cash and bank balance"""
        
        # Get bank and cash ledgers
        cash_ledgers = db.query(Ledger).filter(
            and_(
                Ledger.company_id == company_id,
                (Ledger.name.ilike('%bank%') | Ledger.name.ilike('%cash%'))
            )
        ).all()
        
        total_balance = 0
        for ledger in cash_ledgers:
            opening = ledger.opening_balance or 0
            
            transactions = db.query(Transaction).filter(
                and_(
                    Transaction.ledger_id == ledger.id,
                    Transaction.voucher.has(Voucher.voucher_date <= as_of_date)
                )
            ).all()
            
            debits = sum(t.debit_amount for t in transactions)
            credits = sum(t.credit_amount for t in transactions)
            
            balance = opening + debits - credits
            total_balance += balance
        
        return round(total_balance, 2)
    
    @classmethod
    def record_metric(
        cls,
        company_id: int,
        metric_date: date,
        db: Session
    ) -> FinancialMetric:
        """Record financial metric for a date"""
        
        from_date = metric_date.replace(day=1)  # Start of month
        to_date = metric_date  # End date
        
        metric = FinancialMetric(
            company_id=company_id,
            metric_date=metric_date,
            revenue=cls.calculate_revenue(company_id, from_date, to_date, db),
            expenses=cls.calculate_expenses(company_id, from_date, to_date, db),
            profit=cls.calculate_profit(company_id, from_date, to_date, db),
            cash_flow=cls.calculate_cash_balance(company_id, to_date, db),
            working_capital=cls.calculate_working_capital(company_id, to_date, db),
            receivables=cls.calculate_receivables(company_id, to_date, db),
            payables=cls.calculate_payables(company_id, to_date, db),
            inventory=cls.calculate_inventory_value(company_id, to_date, db)
        )
        
        db.add(metric)
        db.commit()
        
        return metric
    
    @classmethod
    def get_kpi_dashboard(
        cls,
        company_id: int,
        db: Session
    ) -> Dict:
        """Get KPI dashboard for current month"""
        
        today = date.today()
        from_date = today.replace(day=1)
        
        revenue = cls.calculate_revenue(company_id, from_date, today, db)
        expenses = cls.calculate_expenses(company_id, from_date, today, db)
        profit = cls.calculate_profit(company_id, from_date, today, db)
        
        cash_balance = cls.calculate_cash_balance(company_id, today, db)
        receivables = cls.calculate_receivables(company_id, today, db)
        payables = cls.calculate_payables(company_id, today, db)
        working_capital = cls.calculate_working_capital(company_id, today, db)
        
        # Calculate margins
        profit_margin = (profit / revenue * 100) if revenue > 0 else 0
        expense_ratio = (expenses / revenue * 100) if revenue > 0 else 0
        
        # Days sales outstanding (DSO)
        daily_revenue = revenue / max(today.day, 1)
        dso = (receivables / daily_revenue) if daily_revenue > 0 else 0
        
        return {
            "revenue": revenue,
            "expenses": expenses,
            "profit": profit,
            "profit_margin": round(profit_margin, 2),
            "expense_ratio": round(expense_ratio, 2),
            "cash_balance": cash_balance,
            "receivables": receivables,
            "payables": payables,
            "working_capital": working_capital,
            "dso": round(dso, 2),
            "current_month": today.strftime("%B %Y")
        }
    
    @classmethod
    def get_revenue_trend(
        cls,
        company_id: int,
        months: int = 12,
        db: Session = None
    ) -> List[Dict]:
        """Get revenue trend for last N months"""
        
        metrics = db.query(FinancialMetric).filter(
            FinancialMetric.company_id == company_id,
            FinancialMetric.metric_date >= date.today() - timedelta(days=30*months)
        ).order_by(FinancialMetric.metric_date).all()
        
        trend = []
        for metric in metrics:
            trend.append({
                "date": metric.metric_date.isoformat(),
                "month": metric.metric_date.strftime("%B %Y"),
                "revenue": float(metric.revenue),
                "expenses": float(metric.expenses),
                "profit": float(metric.profit)
            })
        
        return trend
    
    @classmethod
    def get_customer_analysis(
        cls,
        company_id: int,
        db: Session
    ) -> Dict:
        """Analyze customer revenue distribution"""
        
        from app.models.models import Customer
        
        customers = db.query(Customer).filter(Customer.company_id == company_id).all()
        
        customer_revenue = []
        
        for customer in customers:
            invoices = db.query(Invoice).filter(Invoice.customer_id == customer.id).all()
            total_revenue = sum(inv.total_amount for inv in invoices)
            
            if total_revenue > 0:
                customer_revenue.append({
                    "customer_name": customer.name,
                    "revenue": round(total_revenue, 2),
                    "invoice_count": len(invoices),
                    "average_invoice": round(total_revenue / len(invoices), 2) if invoices else 0
                })
        
        # Sort by revenue
        customer_revenue.sort(key=lambda x: x['revenue'], reverse=True)
        
        return {
            "total_customers": len(customers),
            "top_customers": customer_revenue[:10],
            "total_revenue": sum(c['revenue'] for c in customer_revenue)
        }
    
    @classmethod
    def get_expense_analysis(
        cls,
        company_id: int,
        from_date: date,
        to_date: date,
        db: Session
    ) -> Dict:
        """Analyze expense distribution"""
        
        expense_ledgers = db.query(Ledger).filter(
            and_(
                Ledger.company_id == company_id,
                Ledger.name.ilike('%expense%')
            )
        ).all()
        
        expense_breakdown = []
        total_expenses = 0
        
        for ledger in expense_ledgers:
            transactions = db.query(Transaction).filter(
                and_(
                    Transaction.ledger_id == ledger.id,
                    Transaction.voucher.has(Voucher.company_id == company_id),
                    Transaction.voucher.has(Voucher.voucher_date >= from_date),
                    Transaction.voucher.has(Voucher.voucher_date <= to_date)
                )
            ).all()
            
            amount = sum(t.debit_amount for t in transactions)
            
            if amount > 0:
                expense_breakdown.append({
                    "category": ledger.name,
                    "amount": round(amount, 2),
                    "percentage": 0  # Will calculate later
                })
                total_expenses += amount
        
        # Calculate percentages
        for expense in expense_breakdown:
            expense['percentage'] = round(
                (expense['amount'] / total_expenses * 100) if total_expenses > 0 else 0,
                2
            )
        
        # Sort by amount
        expense_breakdown.sort(key=lambda x: x['amount'], reverse=True)
        
        return {
            "total_expenses": round(total_expenses, 2),
            "expense_breakdown": expense_breakdown,
            "period": f"{from_date} to {to_date}"
        }
    
    @classmethod
    def predict_cash_flow(
        cls,
        company_id: int,
        months_ahead: int = 3,
        db: Session = None
    ) -> List[Dict]:
        """Predict cash flow for next N months (simplified)"""
        
        # Get historical metrics
        metrics = db.query(FinancialMetric).filter(
            FinancialMetric.company_id == company_id,
            FinancialMetric.metric_date >= date.today() - timedelta(days=180)
        ).order_by(FinancialMetric.metric_date).all()
        
        if not metrics:
            return []
        
        # Calculate average monthly values
        avg_revenue = sum(m.revenue for m in metrics) / len(metrics) if metrics else 0
        avg_expenses = sum(m.expenses for m in metrics) / len(metrics) if metrics else 0
        avg_cash = sum(m.cash_flow for m in metrics) / len(metrics) if metrics else 0
        
        # Simple trend: last month / average
        last_metric = metrics[-1]
        revenue_trend = last_metric.revenue / avg_revenue if avg_revenue > 0 else 1
        expense_trend = last_metric.expenses / avg_expenses if avg_expenses > 0 else 1
        
        # Predict
        predictions = []
        current_cash = last_metric.cash_flow
        
        for i in range(1, months_ahead + 1):
            pred_date = date.today() + timedelta(days=30*i)
            pred_revenue = avg_revenue * revenue_trend
            pred_expenses = avg_expenses * expense_trend
            pred_cash = current_cash + (pred_revenue - pred_expenses)
            
            predictions.append({
                "date": pred_date.isoformat(),
                "month": pred_date.strftime("%B %Y"),
                "predicted_revenue": round(pred_revenue, 2),
                "predicted_expenses": round(pred_expenses, 2),
                "predicted_cash_flow": round(pred_cash, 2),
                "confidence": "Medium"  # Placeholder
            })
            
            current_cash = pred_cash
        
        return predictions
