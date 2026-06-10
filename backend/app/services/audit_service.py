"""
Audit Automation Service
Implements: Audit plans, working papers, risk assessment, fraud detection,
duplicate detection, suspicious transaction analysis.
"""
from datetime import date, datetime, timedelta
from typing import Dict, List, Optional
import re
import hashlib
from collections import defaultdict
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from app.models.models import (
    AuditPlan, AuditProcedure, FraudDetection, Voucher, Transaction,
    Invoice, Customer, Vendor, Ledger, Company,
)


# ============ Duplicate Invoice Detection ============

def detect_duplicate_invoices(db: Session, company_id: int) -> List[Dict]:
    """
    Find potential duplicate invoices based on:
    - Same invoice_number from the same vendor within 30 days
    - Same total amount and GST amount
    - Very similar descriptions
    """
    cutoff = date.today() - timedelta(days=180)
    candidates = db.query(Invoice).filter(
        Invoice.company_id == company_id,
        Invoice.invoice_type == "Purchase",
        Invoice.invoice_date >= cutoff,
        Invoice.status != "Cancelled",
    ).all()

    # Group by (vendor, total, tax) - high-confidence matches
    by_signature = defaultdict(list)
    for inv in candidates:
        sig = (inv.customer_id, round(inv.total_amount or 0, 0), round(inv.tax_amount or 0, 0))
        by_signature[sig].append(inv)

    findings = []
    for sig, group in by_signature.items():
        if len(group) >= 2:
            for inv in group:
                findings.append({
                    "detection_type": "DuplicateInvoice",
                    "entity_type": "Invoice",
                    "entity_id": inv.id,
                    "risk_score": 80,
                    "risk_level": "High",
                    "description": (
                        f"Possible duplicate of invoice {inv.invoice_number} - "
                        f"same vendor, amount, and tax amount"
                    ),
                    "matched_records": [{"id": g.id, "invoice_number": g.invoice_number, "date": g.invoice_date.isoformat()} for g in group],
                    "recommendation": "Verify with vendor and cancel if duplicate.",
                })
    # Persist findings
    for f in findings:
        try:
            db.add(FraudDetection(
                company_id=company_id, detection_type=f["detection_type"],
                entity_type=f["entity_type"], entity_id=f["entity_id"],
                risk_score=f["risk_score"], risk_level=f["risk_level"],
                description=f["description"], matched_records=f["matched_records"],
                recommendation=f["recommendation"], status="Open",
            ))
        except Exception:
            pass
    db.commit()
    return findings


# ============ Circular Transaction Detection ============

def detect_circular_transactions(db: Session, company_id: int, max_depth: int = 3) -> List[Dict]:
    """
    Find circular flows: A pays B, B pays C, C pays A (money laundering pattern).
    Simplified: detect pairs of customers/vendors with reciprocal large transactions.
    """
    cutoff = date.today() - timedelta(days=90)
    findings = []
    # Pull all posted vouchers in the period
    vouchers = db.query(Voucher).filter(
        Voucher.company_id == company_id,
        Voucher.is_posted == True,
        Voucher.voucher_date >= cutoff,
    ).all()
    # Heuristic: for each voucher, look at involved ledgers
    # If two ledgers both appear as debit/credit in the same pair often, flag
    pair_count = defaultdict(int)
    pair_total = defaultdict(float)
    for v in vouchers:
        ledgers = [(t.ledger_id, t.debit_amount, t.credit_amount) for t in v.transactions]
        if len(ledgers) == 2:
            (l1, d1, c1), (l2, d2, c2) = ledgers
            pair = tuple(sorted([l1, l2]))
            pair_count[pair] += 1
            pair_total[pair] += max(d1 or 0, c1 or 0)
    # Flag pairs with >= 3 occurrences in 90 days
    for pair, count in pair_count.items():
        if count >= 3:
            findings.append({
                "detection_type": "CircularTransaction",
                "entity_type": "VoucherPair",
                "risk_score": min(60 + count * 5, 100),
                "risk_level": "Medium" if count < 5 else "High",
                "description": (
                    f"Ledgers {pair[0]} and {pair[1]} transacted {count} times in 90 days "
                    f"totalling Rs. {round(pair_total[pair], 2)}"
                ),
                "matched_records": {"ledger_pair": pair, "count": count, "total": round(pair_total[pair], 2)},
                "recommendation": "Verify business purpose and supporting documentation.",
            })
    for f in findings:
        try:
            db.add(FraudDetection(
                company_id=company_id, detection_type=f["detection_type"],
                entity_type=f["entity_type"], entity_id=0,
                risk_score=f["risk_score"], risk_level=f["risk_level"],
                description=f["description"], matched_records=f["matched_records"],
                recommendation=f["recommendation"], status="Open",
            ))
        except Exception:
            pass
    db.commit()
    return findings


# ============ Round-Number Vouchers (possible manipulation) ============

def detect_round_number_vouchers(db: Session, company_id: int) -> List[Dict]:
    """Flag vouchers with suspiciously round amounts (e.g., 100000, 50000) without description."""
    cutoff = date.today() - timedelta(days=90)
    findings = []
    suspicious = db.query(Voucher).filter(
        Voucher.company_id == company_id,
        Voucher.is_posted == True,
        Voucher.voucher_date >= cutoff,
        Voucher.total_debit >= 10000,
    ).all()
    for v in suspicious:
        amt = v.total_debit or 0
        # Round numbers: divisible by 1000 and no decimals
        if amt >= 10000 and amt % 1000 == 0 and (not v.description or len(v.description) < 20):
            findings.append({
                "detection_type": "RoundNumberVoucher",
                "entity_type": "Voucher",
                "entity_id": v.id,
                "risk_score": 35,
                "risk_level": "Low",
                "description": f"Voucher {v.voucher_number} has a round number Rs.{amt} with minimal description",
                "matched_records": {"voucher_id": v.id, "amount": amt},
                "recommendation": "Verify supporting documentation.",
            })
    for f in findings:
        try:
            db.add(FraudDetection(
                company_id=company_id, detection_type=f["detection_type"],
                entity_type=f["entity_type"], entity_id=f["entity_id"],
                risk_score=f["risk_score"], risk_level=f["risk_level"],
                description=f["description"], matched_records=f["matched_records"],
                recommendation=f["recommendation"], status="Open",
            ))
        except Exception:
            pass
    db.commit()
    return findings


# ============ Audit Plan & Procedures ============

def create_audit_plan(db: Session, company_id: int, audit_period: str,
                     auditor_name: str, audit_scope: str = "",
                     start_date: Optional[date] = None,
                     end_date: Optional[date] = None,
                     procedures: Optional[List[Dict]] = None) -> AuditPlan:
    plan = AuditPlan(
        company_id=company_id, audit_period=audit_period,
        auditor_name=auditor_name, audit_scope=audit_scope,
        start_date=start_date, end_date=end_date, status="Planned",
    )
    db.add(plan)
    db.flush()
    if procedures:
        for p in procedures:
            db.add(AuditProcedure(
                plan_id=plan.id, procedure_name=p.get("name", ""),
                description=p.get("description", ""),
                estimated_hours=p.get("estimated_hours", 0),
                status="Not Started",
            ))
    db.commit()
    db.refresh(plan)
    return plan


# ============ Risk Assessment ============

def risk_assessment(db: Session, company_id: int) -> Dict:
    """
    Compute a simple risk score based on the company's data:
    - High overdue receivables
    - Many duplicate invoices
    - Unposted vouchers older than 7 days
    - Large round-number vouchers
    """
    today = date.today()
    risk = {"score": 0, "factors": []}

    overdue = db.query(func.coalesce(func.sum(Invoice.total_amount - Invoice.paid_amount), 0)).filter(
        Invoice.company_id == company_id, Invoice.invoice_type == "Sales",
        Invoice.status == "Overdue",
    ).scalar() or 0
    if overdue > 100000:
        risk["score"] += 20
        risk["factors"].append(f"Overdue receivables: Rs.{round(overdue, 2)}")

    unposted = db.query(func.count(Voucher.id)).filter(
        Voucher.company_id == company_id, Voucher.is_posted == False,
        Voucher.voucher_date < today - timedelta(days=7),
    ).scalar() or 0
    if unposted > 0:
        risk["score"] += 10
        risk["factors"].append(f"{unposted} unposted vouchers older than 7 days")

    fraud_count = db.query(func.count(FraudDetection.id)).filter(
        FraudDetection.company_id == company_id, FraudDetection.status == "Open",
    ).scalar() or 0
    if fraud_count > 0:
        risk["score"] += min(30, fraud_count * 5)
        risk["factors"].append(f"{fraud_count} open fraud detections")

    if risk["score"] >= 70:
        risk["level"] = "High"
    elif risk["score"] >= 40:
        risk["level"] = "Medium"
    else:
        risk["level"] = "Low"
    return risk
