"""
Company management API routes
Complete: CRUD, financial years, branches, multi-company switching, settings
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional
from datetime import date, datetime
from pydantic import BaseModel, Field

from app.database.base import get_db
from app.core.security import get_current_user, require_admin
from app.core.deps import get_user_companies, get_active_company_id
from app.models.models import (
    Company, FinancialYear, Branch, CompanySetting,
    UserRole, Role, AuditLog
)
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/companies", tags=["companies"])


# ============== Pydantic Schemas ==============

class CompanyCreate(BaseModel):
    name: str
    legal_name: Optional[str] = None
    pan: Optional[str] = None
    gstin: Optional[str] = None
    tan: Optional[str] = None
    business_type: Optional[str] = None
    financial_year_start: int = 4
    currency: str = "INR"
    country: str = "IN"
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    base_currency: str = "INR"
    decimal_places: int = 2
    date_format: str = "DD/MM/YYYY"


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    legal_name: Optional[str] = None
    pan: Optional[str] = None
    gstin: Optional[str] = None
    tan: Optional[str] = None
    business_type: Optional[str] = None
    financial_year_start: Optional[int] = None
    currency: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class CompanyResponse(BaseModel):
    id: int
    name: str
    legal_name: Optional[str]
    pan: Optional[str]
    gstin: Optional[str]
    tan: Optional[str]
    business_type: Optional[str]
    financial_year_start: int
    currency: str
    country: str
    address: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    base_currency: str
    decimal_places: int
    date_format: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class FinancialYearCreate(BaseModel):
    company_id: int
    start_date: date
    end_date: date
    label: Optional[str] = None


class FinancialYearResponse(BaseModel):
    id: int
    company_id: int
    start_date: date
    end_date: date
    label: Optional[str]
    is_active: bool
    is_locked: bool

    class Config:
        from_attributes = True


class BranchCreate(BaseModel):
    company_id: int
    name: str
    code: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    gstin: Optional[str] = None
    is_head_office: bool = False


class BranchResponse(BaseModel):
    id: int
    company_id: int
    name: str
    code: Optional[str]
    address: Optional[str]
    city: Optional[str]
    state: Optional[str]
    pincode: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    gstin: Optional[str]
    is_head_office: bool
    is_active: bool

    class Config:
        from_attributes = True


class CompanySettingResponse(BaseModel):
    id: int
    company_id: int
    enable_multi_currency: bool
    enable_cost_centers: bool
    enable_profit_centers: bool
    enable_gst: bool
    enable_tds: bool
    enable_payroll: bool
    enable_inventory: bool
    enable_audit: bool
    default_gst_rate: float
    invoice_prefix: Optional[str]
    voucher_prefix: Optional[str]
    auto_voucher_numbering: bool
    rounding_method: str
    email_notifications: bool
    sms_notifications: bool
    decimal_places: int

    class Config:
        from_attributes = True


class CompanySettingUpdate(BaseModel):
    enable_multi_currency: Optional[bool] = None
    enable_cost_centers: Optional[bool] = None
    enable_profit_centers: Optional[bool] = None
    enable_gst: Optional[bool] = None
    enable_tds: Optional[bool] = None
    enable_payroll: Optional[bool] = None
    enable_inventory: Optional[bool] = None
    enable_audit: Optional[bool] = None
    default_gst_rate: Optional[float] = None
    invoice_prefix: Optional[str] = None
    voucher_prefix: Optional[str] = None
    auto_voucher_numbering: Optional[bool] = None
    rounding_method: Optional[str] = None
    email_notifications: Optional[bool] = None
    sms_notifications: Optional[bool] = None
    decimal_places: Optional[int] = None


class AssignRolePayload(BaseModel):
    user_id: int
    company_id: int
    role_name: str


# ============== Helpers ==============

def _ensure_company_access(user, db: Session, company_id: int):
    """Verify user has access to this company. Raises 403 if not."""
    accessible = get_user_companies(user, db)
    if company_id not in accessible and not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this company",
        )


def _log_audit(db: Session, company_id: int, user_id: int, entity_type: str,
               entity_id: int, action: str, old=None, new=None):
    """Persist an audit log entry."""
    try:
        log = AuditLog(
            company_id=company_id,
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            action=action,
            old_values=old,
            new_values=new,
        )
        db.add(log)
    except Exception as e:
        logger.warning("Failed to write audit log: %s", e)


# ============== Company CRUD ==============

@router.post("/", response_model=CompanyResponse, status_code=201)
def create_company(
    payload: CompanyCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Create a new company and assign the creator as Admin."""
    # Validate GSTIN/PAN format if provided
    if payload.gstin and (len(payload.gstin) != 15 or not payload.gstin.isalnum()):
        raise HTTPException(status_code=400, detail="Invalid GSTIN format (must be 15 alphanumeric chars)")
    if payload.pan and (len(payload.pan) != 10 or not payload.pan.isalnum()):
        raise HTTPException(status_code=400, detail="Invalid PAN format (must be 10 alphanumeric chars)")

    # Uniqueness checks
    if payload.gstin:
        existing = db.query(Company).filter(Company.gstin == payload.gstin).first()
        if existing:
            raise HTTPException(status_code=409, detail="Company with this GSTIN already exists")
    if payload.pan:
        existing = db.query(Company).filter(Company.pan == payload.pan).first()
        if existing:
            raise HTTPException(status_code=409, detail="Company with this PAN already exists")

    company = Company(
        name=payload.name,
        legal_name=payload.legal_name,
        pan=payload.pan,
        gstin=payload.gstin,
        tan=payload.tan,
        business_type=payload.business_type,
        financial_year_start=payload.financial_year_start,
        currency=payload.currency,
        country=payload.country,
        address=payload.address,
        phone=payload.phone,
        email=payload.email,
        created_by=user.id,
    )
    db.add(company)
    db.flush()

    # Create default settings
    settings = CompanySetting(
        company_id=company.id,
        base_currency=payload.base_currency,
        decimal_places=payload.decimal_places,
        date_format=payload.date_format,
    )
    db.add(settings)

    # Auto-create default Financial Year (April 1 - March 31)
    today = date.today()
    if today.month >= 4:
        fy_start = date(today.year, 4, 1)
        fy_end = date(today.year + 1, 3, 31)
    else:
        fy_start = date(today.year - 1, 4, 1)
        fy_end = date(today.year, 3, 31)
    fy = FinancialYear(
        company_id=company.id,
        start_date=fy_start,
        end_date=fy_end,
        label=f"FY{fy_start.year}-{str(fy_end.year)[-2:]}",
        is_active=True,
    )
    db.add(fy)

    # Assign creator as Admin
    admin_role = db.query(Role).filter(Role.name == "Admin").first()
    if not admin_role:
        admin_role = Role(name="Admin", description="Company administrator with full access")
        db.add(admin_role)
        db.flush()
    user_role = UserRole(user_id=user.id, role_id=admin_role.id, company_id=company.id)
    db.add(user_role)

    # Create head office branch
    head_office = Branch(
        company_id=company.id,
        name="Head Office",
        code="HO",
        is_head_office=True,
        address=payload.address,
        city=None,
        state=None,
        pincode=None,
        phone=payload.phone,
        email=payload.email,
        gstin=payload.gstin,
    )
    db.add(head_office)

    db.commit()
    db.refresh(company)
    _log_audit(db, company.id, user.id, "Company", company.id, "CREATE",
               new={"name": company.name, "gstin": company.gstin})
    db.commit()
    return company


@router.get("/", response_model=List[CompanyResponse])
def list_companies(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """List all companies the current user can access."""
    if user.is_admin:
        return db.query(Company).order_by(Company.name).all()
    company_ids = get_user_companies(user, db)
    if not company_ids:
        return []
    return db.query(Company).filter(Company.id.in_(company_ids)).order_by(Company.name).all()


@router.get("/active")
def get_active_company(
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Get the user's currently active company (defaults to first accessible)."""
    company_ids = get_user_companies(user, db)
    if not company_ids and not user.is_admin:
        raise HTTPException(status_code=404, detail="No accessible companies")
    if user.is_admin and not company_ids:
        first = db.query(Company).first()
        if not first:
            raise HTTPException(status_code=404, detail="No companies exist")
        return _company_to_dict(first)
    company = db.query(Company).filter(Company.id == company_ids[0]).first()
    return _company_to_dict(company)


def _company_to_dict(c: Company) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "legal_name": c.legal_name,
        "pan": c.pan,
        "gstin": c.gstin,
        "tan": c.tan,
        "business_type": c.business_type,
        "financial_year_start": c.financial_year_start,
        "currency": c.currency,
        "country": c.country,
        "address": c.address,
        "phone": c.phone,
        "email": c.email,
        "created_at": c.created_at,
        "updated_at": c.updated_at,
    }


@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(
    company_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    _ensure_company_access(user, db, company_id)
    return company


@router.put("/{company_id}", response_model=CompanyResponse)
def update_company(
    company_id: int,
    payload: CompanyUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    _ensure_company_access(user, db, company_id)

    old_values = {k: getattr(company, k) for k in payload.dict(exclude_unset=True).keys()}
    for k, v in payload.dict(exclude_unset=True).items():
        if v is not None:
            setattr(company, k, v)
    db.commit()
    db.refresh(company)
    _log_audit(db, company_id, user.id, "Company", company_id, "UPDATE",
               old=old_values, new=payload.dict(exclude_unset=True))
    db.commit()
    return company


@router.delete("/{company_id}", status_code=204)
def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_admin),
):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    _log_audit(db, company_id, user.id, "Company", company_id, "DELETE",
               old={"name": company.name})
    db.delete(company)
    db.commit()
    return None


@router.post("/{company_id}/switch")
def switch_company(
    company_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    """Validate and return a fresh access token scoped to the given company."""
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    _ensure_company_access(user, db, company_id)
    from app.core.security import create_access_token
    from datetime import timedelta
    token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "active_company_id": company_id},
        expires_delta=timedelta(hours=8),
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "active_company": _company_to_dict(company),
    }


# ============== Financial Years ==============

@router.post("/financial-years/", response_model=FinancialYearResponse, status_code=201)
def create_financial_year(
    payload: FinancialYearCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    _ensure_company_access(user, db, payload.company_id)
    if payload.end_date <= payload.start_date:
        raise HTTPException(status_code=400, detail="end_date must be after start_date")

    # Check for overlap
    overlap = db.query(FinancialYear).filter(
        FinancialYear.company_id == payload.company_id,
        FinancialYear.end_date >= payload.start_date,
        FinancialYear.start_date <= payload.end_date,
    ).first()
    if overlap:
        raise HTTPException(status_code=400, detail="Financial year overlaps an existing one")

    fy = FinancialYear(
        company_id=payload.company_id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        label=payload.label or f"FY{payload.start_date.year}-{str(payload.end_date.year)[-2:]}",
    )
    db.add(fy)
    db.commit()
    db.refresh(fy)
    return fy


@router.get("/{company_id}/financial-years", response_model=List[FinancialYearResponse])
def list_financial_years(
    company_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    _ensure_company_access(user, db, company_id)
    return db.query(FinancialYear).filter(
        FinancialYear.company_id == company_id
    ).order_by(FinancialYear.start_date.desc()).all()


@router.post("/financial-years/{fy_id}/activate", response_model=FinancialYearResponse)
def activate_financial_year(
    fy_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    fy = db.query(FinancialYear).filter(FinancialYear.id == fy_id).first()
    if not fy:
        raise HTTPException(status_code=404, detail="Financial year not found")
    _ensure_company_access(user, db, fy.company_id)
    if fy.is_locked:
        raise HTTPException(status_code=400, detail="Financial year is locked")
    # Deactivate others
    db.query(FinancialYear).filter(
        FinancialYear.company_id == fy.company_id,
        FinancialYear.id != fy_id,
    ).update({"is_active": False})
    fy.is_active = True
    db.commit()
    db.refresh(fy)
    return fy


@router.post("/financial-years/{fy_id}/lock")
def lock_financial_year(
    fy_id: int,
    db: Session = Depends(get_db),
    user=Depends(require_admin),
):
    fy = db.query(FinancialYear).filter(FinancialYear.id == fy_id).first()
    if not fy:
        raise HTTPException(status_code=404, detail="Financial year not found")
    fy.is_locked = True
    fy.is_active = False
    db.commit()
    return {"message": "Financial year locked", "id": fy_id}


# ============== Branches ==============

@router.post("/branches/", response_model=BranchResponse, status_code=201)
def create_branch(
    payload: BranchCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    _ensure_company_access(user, db, payload.company_id)
    if payload.is_head_office:
        # Demote previous head office
        db.query(Branch).filter(
            Branch.company_id == payload.company_id,
            Branch.is_head_office == True,
        ).update({"is_head_office": False})
    branch = Branch(**payload.dict())
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch


@router.get("/{company_id}/branches", response_model=List[BranchResponse])
def list_branches(
    company_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    _ensure_company_access(user, db, company_id)
    return db.query(Branch).filter(
        Branch.company_id == company_id,
        Branch.is_active == True,
    ).order_by(Branch.is_head_office.desc(), Branch.name).all()


@router.put("/branches/{branch_id}", response_model=BranchResponse)
def update_branch(
    branch_id: int,
    payload: BranchCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    _ensure_company_access(user, db, branch.company_id)
    for k, v in payload.dict(exclude_unset=True).items():
        if v is not None:
            setattr(branch, k, v)
    db.commit()
    db.refresh(branch)
    return branch


@router.delete("/branches/{branch_id}", status_code=204)
def delete_branch(
    branch_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    branch = db.query(Branch).filter(Branch.id == branch_id).first()
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    _ensure_company_access(user, db, branch.company_id)
    if branch.is_head_office:
        raise HTTPException(status_code=400, detail="Cannot delete head office branch")
    branch.is_active = False
    db.commit()
    return None


# ============== Company Settings ==============

def _get_or_create_settings(db: Session, company_id: int) -> CompanySetting:
    s = db.query(CompanySetting).filter(CompanySetting.company_id == company_id).first()
    if not s:
        s = CompanySetting(company_id=company_id)
        db.add(s)
        db.commit()
        db.refresh(s)
    return s


@router.get("/{company_id}/settings", response_model=CompanySettingResponse)
def get_company_settings(
    company_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    _ensure_company_access(user, db, company_id)
    return _get_or_create_settings(db, company_id)


@router.put("/{company_id}/settings", response_model=CompanySettingResponse)
def update_company_settings(
    company_id: int,
    payload: CompanySettingUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    _ensure_company_access(user, db, company_id)
    s = _get_or_create_settings(db, company_id)
    for k, v in payload.dict(exclude_unset=True).items():
        if v is not None:
            setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return s


# ============== User Role Management ==============

@router.get("/{company_id}/users")
def list_company_users(
    company_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user),
):
    _ensure_company_access(user, db, company_id)
    from app.models.models import User
    rows = db.query(User, Role.name).join(
        UserRole, UserRole.user_id == User.id
    ).join(Role, Role.id == UserRole.role_id).filter(
        UserRole.company_id == company_id
    ).all()
    return [
        {"user_id": u.id, "email": u.email, "full_name": u.full_name,
         "is_active": u.is_active, "role": r, "company_id": company_id}
        for u, r in rows
    ]


@router.post("/assign-role")
def assign_role(
    payload: AssignRolePayload,
    db: Session = Depends(get_db),
    user=Depends(require_admin),
):
    _ensure_company_access(user, db, payload.company_id)
    role = db.query(Role).filter(Role.name == payload.role_name).first()
    if not role:
        role = Role(name=payload.role_name, description=f"{payload.role_name} role")
        db.add(role)
        db.flush()
    existing = db.query(UserRole).filter(
        UserRole.user_id == payload.user_id,
        UserRole.role_id == role.id,
        UserRole.company_id == payload.company_id,
    ).first()
    if existing:
        return {"message": "Role already assigned"}
    ur = UserRole(user_id=payload.user_id, role_id=role.id, company_id=payload.company_id)
    db.add(ur)
    db.commit()
    return {"message": "Role assigned", "user_id": payload.user_id, "role": role.name}


@router.delete("/users/{user_id}/companies/{company_id}/roles/{role_name}")
def remove_role(
    user_id: int,
    company_id: int,
    role_name: str,
    db: Session = Depends(get_db),
    user=Depends(require_admin),
):
    _ensure_company_access(user, db, company_id)
    role = db.query(Role).filter(Role.name == role_name).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    ur = db.query(UserRole).filter(
        UserRole.user_id == user_id,
        UserRole.role_id == role.id,
        UserRole.company_id == company_id,
    ).first()
    if not ur:
        raise HTTPException(status_code=404, detail="Role assignment not found")
    db.delete(ur)
    db.commit()
    return {"message": "Role removed"}
