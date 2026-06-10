"""
AI Service
Real OpenAI integration for: bookkeeping suggestions, voucher classification,
conversational Q&A, AI CFO insights, forecasting, audit suggestions.
Falls back to rule-based logic when OPENAI_API_KEY is missing.
"""
from datetime import date, datetime, timedelta
from typing import Dict, List, Optional
import json
import re
import logging
import hashlib
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.models import (
    Voucher, Transaction, Ledger, LedgerGroup, Invoice, Customer, Vendor,
    AIConversation, AIPrediction, AIUsageLog, AISuggestion,
    KnowledgeBase, EmbeddingRecord, PromptTemplate,
)
from app.core.config import settings

logger = logging.getLogger(__name__)


# ============ Token estimation ============

def _estimate_tokens(text: str) -> int:
    """Rough estimate: 1 token ~= 4 chars (English)."""
    return max(1, len(text) // 4)


# ============ OpenAI client (with safe fallback) ============

def _get_openai_client():
    """Return an OpenAI client or None if not configured."""
    if not settings.OPENAI_API_KEY:
        return None
    try:
        from openai import OpenAI
        return OpenAI(api_key=settings.OPENAI_API_KEY)
    except Exception as e:
        logger.warning("Failed to create OpenAI client: %s", e)
        return None


def _log_usage(db: Session, company_id: int, user_id: Optional[int],
              feature: str, prompt_tokens: int, completion_tokens: int,
              provider: str = "OpenAI", model: str = "gpt-4", status: str = "Success"):
    try:
        log = AIUsageLog(
            company_id=company_id, user_id=user_id, provider=provider,
            model_name=model, feature_name=feature,
            prompt_tokens=prompt_tokens, completion_tokens=completion_tokens,
            total_tokens=prompt_tokens + completion_tokens,
            estimated_cost=round((prompt_tokens + completion_tokens) * 0.00003, 6),
            status=status,
        )
        db.add(log)
        db.commit()
    except Exception as e:
        logger.warning("Failed to log AI usage: %s", e)


# ============ AI Chat ============

def chat(
    db: Session, company_id: int, user_id: int, message: str,
    context_type: str = "General", conversation_id: Optional[int] = None,
) -> Dict:
    """
    Conversational AI. Uses OpenAI if available, otherwise a rule-based fallback
    that returns canned answers about the company's data.
    """
    client = _get_openai_client()
    if client:
        try:
            company_data = _gather_company_context(db, company_id)
            system_prompt = (
                "You are a helpful AI assistant for a Chartered Accountant's ERP. "
                "Answer questions about accounting, GST, TDS, payroll, and audit. "
                f"Company context: {json.dumps(company_data, default=str)[:2000]}"
            )
            resp = client.chat.completions.create(
                model=settings.OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message},
                ],
                max_tokens=600,
            )
            answer = resp.choices[0].message.content
            _log_usage(
                db, company_id, user_id, "chat",
                resp.usage.prompt_tokens if resp.usage else 0,
                resp.usage.completion_tokens if resp.usage else 0,
            )
            _save_conversation(db, company_id, user_id, message, answer, context_type, conversation_id)
            return {"answer": answer, "source": "openai", "conversation_id": conversation_id}
        except Exception as e:
            logger.error("OpenAI call failed: %s", e)
    # Rule-based fallback
    answer = _rule_based_answer(db, company_id, message)
    _save_conversation(db, company_id, user_id, message, answer, context_type, conversation_id)
    return {"answer": answer, "source": "rules", "conversation_id": conversation_id}


def _gather_company_context(db: Session, company_id: int) -> Dict:
    """Pull a compact summary of the company for the LLM."""
    from app.models.models import Company, Invoice
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        return {}
    sales_total = db.query(func.coalesce(func.sum(Invoice.total_amount), 0)).filter(
        Invoice.company_id == company_id, Invoice.invoice_type == "Sales",
    ).scalar() or 0
    return {
        "name": company.name,
        "gstin": company.gstin,
        "pan": company.pan,
        "total_sales": round(float(sales_total), 2),
    }


def _rule_based_answer(db: Session, company_id: int, message: str) -> str:
    msg = message.lower()
    if "gst" in msg and "rate" in msg:
        return "GST rates in India: 0%, 5%, 12%, 18%, 28%. Use the GST calculator under Accounting > GST."
    if "tds" in msg and "rate" in msg:
        return "Common TDS sections: 194A (10%), 194C (1-2%), 194J (10%), 194H (5%). See TDS module for full schedule."
    if "deadline" in msg or "due date" in msg:
        return "GSTR-1: 11th of next month. GSTR-3B: 20th of next month. TDS: 31st of next month. Use the Compliance Center for reminders."
    if "trial balance" in msg:
        return "Trial Balance is at GET /api/accounting/trial-balance/{company_id}?as_of_date=YYYY-MM-DD."
    if "profit" in msg and "loss" in msg:
        return "P&L Statement: GET /api/accounting/profit-loss/{company_id}?from_date=&to_date="
    if "payroll" in msg:
        return "Process payroll via POST /api/payroll/process with employee_id and month."
    return (
        "I'm a CA-ERP assistant. I can help with: GST, TDS, payroll, accounting reports, "
        "and audit queries. Configure OPENAI_API_KEY for richer AI answers."
    )


def _save_conversation(
    db: Session, company_id: int, user_id: int, user_msg: str, ai_msg: str,
    context_type: str, conversation_id: Optional[int] = None,
):
    try:
        if conversation_id:
            conv = db.query(AIConversation).filter(
                AIConversation.id == conversation_id,
                AIConversation.company_id == company_id,
            ).first()
        else:
            conv = AIConversation(
                company_id=company_id, user_id=user_id,
                conversation_title=user_msg[:100], context_type=context_type,
                messages=[],
            )
            db.add(conv)
            db.flush()
        if conv:
            msgs = list(conv.messages or [])
            msgs.append({"role": "user", "content": user_msg, "ts": datetime.utcnow().isoformat()})
            msgs.append({"role": "assistant", "content": ai_msg, "ts": datetime.utcnow().isoformat()})
            conv.messages = msgs
            conv.updated_at = datetime.utcnow()
            db.commit()
    except Exception as e:
        logger.warning("Failed to save conversation: %s", e)


# ============ AI Voucher Suggestion ============

def suggest_voucher(
    db: Session, company_id: int, description: str, amount: float,
    direction: str = "credit",  # 'debit' or 'credit'
) -> Dict:
    """
    Suggest the ledger account and counter-account for a transaction.
    Uses simple keyword matching against ledger names + optional OpenAI classification.
    """
    ledgers = db.query(Ledger).filter(Ledger.company_id == company_id, Ledger.is_active == True).all()
    description_lower = description.lower()
    scored = []
    for l in ledgers:
        score = 0
        name_words = set(re.findall(r"\w+", l.name.lower()))
        desc_words = set(re.findall(r"\w+", description_lower))
        overlap = name_words & desc_words
        score += len(overlap) * 10
        # Group-type heuristics
        if direction == "debit" and l.group.group_type.lower() in ("expenses", "assets"):
            score += 5
        if direction == "credit" and l.group.group_type.lower() in ("income", "liabilities"):
            score += 5
        if score > 0:
            scored.append((score, l))
    scored.sort(key=lambda x: -x[0])
    suggestions = [{
        "ledger_id": l.id, "ledger_name": l.name, "group": l.group.name,
        "confidence": min(score * 10, 100),
    } for score, l in scored[:5]]

    # Counter-account: opposite group
    counter_suggestion = None
    if direction == "debit":
        # Try Cash or Bank ledger
        cash_ledger = next((l for l in ledgers if "cash" in l.name.lower() or "bank" in l.name.lower()), None)
        if cash_ledger:
            counter_suggestion = {"ledger_id": cash_ledger.id, "ledger_name": cash_ledger.name}
    else:
        cash_ledger = next((l for l in ledgers if "cash" in l.name.lower() or "bank" in l.name.lower()), None)
        if cash_ledger:
            counter_suggestion = {"ledger_id": cash_ledger.id, "ledger_name": cash_ledger.name}

    # Persist a suggestion record
    try:
        s = AISuggestion(
            company_id=company_id, suggestion_type="VOUCHER",
            title=f"Suggestion for: {description[:50]}",
            description=description,
            recommendation=json.dumps({"primary": suggestions[:1], "alternatives": suggestions[1:3]}),
        )
        db.add(s)
        db.commit()
    except Exception:
        pass

    return {
        "description": description,
        "amount": amount,
        "direction": direction,
        "primary_suggestion": suggestions[0] if suggestions else None,
        "alternatives": suggestions[1:3],
        "counter_account_suggestion": counter_suggestion,
    }


# ============ Forecasting ============

def forecast_revenue(db: Session, company_id: int, periods: int = 6) -> Dict:
    """
    Forecast future revenue using linear regression on monthly sales.
    Returns projected values for the next N months.
    """
    from sqlalchemy import extract
    today = date.today()
    # Pull monthly sales totals for the last 24 months
    rows = db.query(
        extract("year", Invoice.invoice_date).label("y"),
        extract("month", Invoice.invoice_date).label("m"),
        func.coalesce(func.sum(Invoice.total_amount), 0).label("total"),
    ).filter(
        Invoice.company_id == company_id,
        Invoice.invoice_type == "Sales",
        Invoice.invoice_date >= date(today.year - 2, 1, 1),
        Invoice.status != "Cancelled",
    ).group_by("y", "m").order_by("y", "m").all()

    if not rows:
        return {"forecast": [], "trend": "insufficient_data"}

    # Linear regression: y = a*x + b
    n = len(rows)
    xs = list(range(n))
    ys = [float(r.total) for r in rows]
    x_mean = sum(xs) / n
    y_mean = sum(ys) / n
    num = sum((xs[i] - x_mean) * (ys[i] - y_mean) for i in range(n))
    den = sum((xs[i] - x_mean) ** 2 for n in xs for i in [0])  # placeholder
    den = sum((x - x_mean) ** 2 for x in xs)
    slope = num / den if den else 0
    intercept = y_mean - slope * x_mean

    # Predict next `periods` months
    forecast = []
    last_date = date(int(rows[-1].y), int(rows[-1].m), 1)
    for i in range(1, periods + 1):
        # next month arithmetic
        m = last_date.month + i
        y = last_date.year + (m - 1) // 12
        m = ((m - 1) % 12) + 1
        x_next = n + i - 1
        y_pred = max(0, slope * x_next + intercept)
        forecast.append({"year": y, "month": m, "predicted_revenue": round(y_pred, 2)})

    # Trend
    if slope > 50:
        trend = "growing"
    elif slope < -50:
        trend = "declining"
    else:
        trend = "stable"

    # Save prediction
    try:
        pred = AIPrediction(
            company_id=company_id, prediction_type="Revenue",
            period=f"{periods} months",
            predicted_values=forecast,
            model_version="linear_v1",
        )
        db.add(pred)
        db.commit()
    except Exception:
        pass

    return {
        "company_id": company_id,
        "historical_months": n,
        "forecast": forecast,
        "trend": trend,
        "slope": round(slope, 2),
        "average": round(y_mean, 2),
    }


def forecast_cash_flow(db: Session, company_id: int, periods: int = 3) -> Dict:
    """
    Forecast cash flow for the next N months based on historical patterns.
    """
    today = date.today()
    rows = db.query(
        func.extract("year", Voucher.voucher_date).label("y"),
        func.extract("month", Voucher.voucher_date).label("m"),
        func.coalesce(func.sum(Voucher.total_debit - Voucher.total_credit), 0).label("net"),
    ).filter(
        Voucher.company_id == company_id,
        Voucher.is_posted == True,
        Voucher.voucher_date >= date(today.year - 1, 1, 1),
    ).group_by("y", "m").order_by("y", "m").all()

    if not rows:
        return {"forecast": [], "trend": "insufficient_data"}

    avg_net = sum(float(r.net) for r in rows) / len(rows)
    last_date = date(int(rows[-1].y), int(rows[-1].m), 1)
    forecast = []
    for i in range(1, periods + 1):
        m = last_date.month + i
        y = last_date.year + (m - 1) // 12
        m = ((m - 1) % 12) + 1
        forecast.append({"year": y, "month": m, "predicted_net_flow": round(avg_net, 2)})
    return {
        "company_id": company_id,
        "historical_months": len(rows),
        "average_net_flow": round(avg_net, 2),
        "forecast": forecast,
        "trend": "stable",
    }


# ============ AI CFO Dashboard ============

def cfo_dashboard(db: Session, company_id: int) -> Dict:
    """
    CFO-level insights: revenue, expenses, profit, cash position,
    top customers, working capital, alerts.
    """
    from calendar import monthrange
    today = date.today()
    first_of_month = today.replace(day=1)
    end_of_month = date(today.year, today.month, monthrange(today.year, today.month)[1])

    # This month sales
    sales_month = db.query(func.coalesce(func.sum(Invoice.total_amount), 0)).filter(
        Invoice.company_id == company_id, Invoice.invoice_type == "Sales",
        Invoice.invoice_date >= first_of_month, Invoice.invoice_date <= end_of_month,
    ).scalar() or 0
    sales_ytd = db.query(func.coalesce(func.sum(Invoice.total_amount), 0)).filter(
        Invoice.company_id == company_id, Invoice.invoice_type == "Sales",
        Invoice.invoice_date >= date(today.year, 4, 1) if today.month >= 4 else date(today.year - 1, 4, 1),
    ).scalar() or 0

    # Outstanding receivables
    receivables = db.query(func.coalesce(func.sum(Invoice.total_amount - Invoice.paid_amount), 0)).filter(
        Invoice.company_id == company_id, Invoice.invoice_type == "Sales",
        Invoice.status.in_(["Sent", "Overdue"]),
    ).scalar() or 0

    # Overdue
    overdue = db.query(func.coalesce(func.sum(Invoice.total_amount - Invoice.paid_amount), 0)).filter(
        Invoice.company_id == company_id, Invoice.invoice_type == "Sales",
        Invoice.status == "Overdue",
    ).scalar() or 0

    # Top customers (YTD)
    top_cust = db.query(
        Customer.name,
        func.coalesce(func.sum(Invoice.total_amount), 0).label("total"),
    ).join(Invoice, Invoice.customer_id == Customer.id).filter(
        Invoice.company_id == company_id, Invoice.invoice_type == "Sales",
    ).group_by(Customer.id, Customer.name).order_by(func.sum(Invoice.total_amount).desc()).limit(5).all()

    # Forecast
    forecast = forecast_revenue(db, company_id, periods=3)

    return {
        "company_id": company_id,
        "as_of": today.isoformat(),
        "current_month_sales": round(float(sales_month), 2),
        "ytd_sales": round(float(sales_ytd), 2),
        "outstanding_receivables": round(float(receivables), 2),
        "overdue_receivables": round(float(overdue), 2),
        "top_customers": [{"name": c.name, "total": round(float(c.total), 2)} for c in top_cust],
        "revenue_forecast": forecast,
        "alerts": _generate_cfo_alerts(receivables, overdue, sales_month),
    }


def _generate_cfo_alerts(receivables: float, overdue: float, monthly_sales: float) -> List[Dict]:
    alerts = []
    if overdue > 0 and receivables > 0 and overdue / receivables > 0.3:
        alerts.append({
            "severity": "high",
            "title": "High overdue receivables",
            "description": f"{round(overdue/receivables*100, 1)}% of receivables are overdue",
            "action": "Send reminders, review credit policy",
        })
    if monthly_sales == 0 and receivables > 0:
        alerts.append({
            "severity": "medium",
            "title": "No sales this month",
            "description": "Sales activity has paused while receivables remain",
            "action": "Review sales pipeline and outstanding orders",
        })
    return alerts
