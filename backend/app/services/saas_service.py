"""
SaaS Admin Service
Implements: tenant management, subscription plans, billing, usage tracking,
feature flags, system health metrics.
"""
from datetime import date, datetime, timedelta
from typing import Dict, List, Optional
import json
import secrets
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.models import (
    Company, TenantSubscription, SaaSPlan, FeatureFlag,
    SystemHealthMetric, UsageMetric, User,
)


# ============ Plans ============

DEFAULT_PLANS = [
    {
        "plan_name": "Starter",
        "description": "For solo practitioners",
        "monthly_price": 999,
        "annual_price": 9999,
        "features": ["Accounting", "GST", "TDS", "1 user", "Email support"],
        "limits": {"users": 1, "companies": 2, "vouchers_per_month": 500},
    },
    {
        "plan_name": "Professional",
        "description": "For small CA firms",
        "monthly_price": 2999,
        "annual_price": 29999,
        "features": ["Everything in Starter", "Payroll", "Inventory", "Audit", "5 users", "Priority support"],
        "limits": {"users": 5, "companies": 10, "vouchers_per_month": 5000},
    },
    {
        "plan_name": "Enterprise",
        "description": "For large firms with AI",
        "monthly_price": 9999,
        "annual_price": 99999,
        "features": ["Everything in Professional", "AI", "WhatsApp/Voice", "Custom integrations", "Unlimited users", "Dedicated support"],
        "limits": {"users": 9999, "companies": 9999, "vouchers_per_month": 999999},
    },
]


def ensure_default_plans(db: Session) -> None:
    """Create default plans if they don't exist."""
    for p in DEFAULT_PLANS:
        existing = db.query(SaaSPlan).filter(SaaSPlan.plan_name == p["plan_name"]).first()
        if not existing:
            db.add(SaaSPlan(**p))
    db.commit()


def list_plans(db: Session) -> List[Dict]:
    return [{
        "id": p.id, "plan_name": p.plan_name, "description": p.description,
        "monthly_price": p.monthly_price, "annual_price": p.annual_price,
        "features": p.features, "limits": p.limits, "is_active": p.is_active,
    } for p in db.query(SaaSPlan).filter(SaaSPlan.is_active == True).all()]


# ============ Subscriptions ============

def create_subscription(
    db: Session, company_id: int, plan_name: str, billing_cycle: str = "Monthly",
    seats: int = 1,
) -> TenantSubscription:
    sub = TenantSubscription(
        company_id=company_id, plan_name=plan_name, status="Active",
        billing_cycle=billing_cycle, seats=seats,
        starts_on=date.today(),
        ends_on=date.today() + (timedelta(days=365) if billing_cycle == "Annual" else timedelta(days=30)),
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


def cancel_subscription(db: Session, subscription_id: int) -> TenantSubscription:
    sub = db.query(TenantSubscription).filter(TenantSubscription.id == subscription_id).first()
    if not sub:
        raise ValueError("Subscription not found")
    sub.status = "Cancelled"
    db.commit()
    return sub


# ============ Usage Tracking ============

def record_usage(
    db: Session, company_id: int, metric_name: str, value: float = 1,
    period: str = None, metadata: Dict = None,
) -> UsageMetric:
    m = UsageMetric(
        company_id=company_id, metric_name=metric_name, metric_value=value,
        period=period or date.today().strftime("%Y-%m"),
        metadata_json=metadata,
    )
    db.add(m)
    db.commit()
    return m


def get_usage(db: Session, company_id: int, period: str = None) -> Dict:
    """Aggregate usage for a company for the given period (default: current month)."""
    period = period or date.today().strftime("%Y-%m")
    rows = db.query(
        UsageMetric.metric_name, func.coalesce(func.sum(UsageMetric.metric_value), 0),
    ).filter(
        UsageMetric.company_id == company_id, UsageMetric.period == period,
    ).group_by(UsageMetric.metric_name).all()
    return {name: float(val) for name, val in rows}


# ============ Feature Flags ============

def set_feature_flag(
    db: Session, company_id: int, flag_key: str, value: bool = True,
    rollout_rules: Dict = None,
) -> FeatureFlag:
    flag = db.query(FeatureFlag).filter(
        FeatureFlag.company_id == company_id, FeatureFlag.flag_key == flag_key
    ).first()
    if not flag:
        flag = FeatureFlag(company_id=company_id, flag_key=flag_key, flag_value=value, rollout_rules=rollout_rules)
        db.add(flag)
    else:
        flag.flag_value = value
        if rollout_rules:
            flag.rollout_rules = rollout_rules
    db.commit()
    return flag


def is_feature_enabled(db: Session, company_id: int, flag_key: str) -> bool:
    flag = db.query(FeatureFlag).filter(
        FeatureFlag.company_id == company_id, FeatureFlag.flag_key == flag_key
    ).first()
    if not flag:
        return False
    return bool(flag.flag_value)


# ============ Billing ============

def calculate_bill(db: Session, company_id: int) -> Dict:
    """Generate a bill for the current month for a company."""
    sub = db.query(TenantSubscription).filter(
        TenantSubscription.company_id == company_id, TenantSubscription.status == "Active"
    ).first()
    if not sub:
        return {"error": "No active subscription"}
    plan = db.query(SaaSPlan).filter(SaaSPlan.plan_name == sub.plan_name).first()
    if not plan:
        return {"error": "Plan not found"}
    base = plan.monthly_price if sub.billing_cycle == "Monthly" else plan.annual_price
    extra_seat_charge = max(0, sub.seats - 5) * 200
    overage_charges = 0
    usage = get_usage(db, company_id)
    vouchers = usage.get("vouchers_created", 0)
    limit = (plan.limits or {}).get("vouchers_per_month", 0)
    if limit and vouchers > limit:
        overage_charges = (vouchers - limit) * 2
    total = base + extra_seat_charge + overage_charges
    return {
        "company_id": company_id,
        "plan": plan.plan_name,
        "billing_cycle": sub.billing_cycle,
        "base_amount": base,
        "extra_seats": max(0, sub.seats - 5),
        "extra_seat_charge": extra_seat_charge,
        "overage_charges": overage_charges,
        "total_due": round(total, 2),
        "due_date": (date.today() + timedelta(days=15)).isoformat(),
    }


# ============ System Health ============

def record_system_metric(db: Session, metric_name: str, value: float,
                        status: str = "Healthy", metadata: Dict = None) -> SystemHealthMetric:
    m = SystemHealthMetric(
        metric_name=metric_name, metric_value=value, status=status,
        metadata_json=metadata,
    )
    db.add(m)
    db.commit()
    return m


def get_system_health(db: Session) -> Dict:
    """Aggregate system health: latest metrics + counts."""
    cutoff = datetime.utcnow() - timedelta(hours=24)
    metrics = db.query(SystemHealthMetric).filter(
        SystemHealthMetric.recorded_at >= cutoff
    ).order_by(SystemHealthMetric.recorded_at.desc()).limit(50).all()
    latest = {}
    for m in metrics:
        if m.metric_name not in latest:
            latest[m.metric_name] = {"value": m.metric_value, "status": m.status, "ts": m.recorded_at}
    active_companies = db.query(func.count(Company.id)).scalar() or 0
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
    return {
        "latest_metrics": latest,
        "active_companies": active_companies,
        "active_users": active_users,
        "as_of": datetime.utcnow().isoformat(),
    }
