"""
CA ERP Platform Backend - Main Application
Enterprise ERP for Chartered Accountants with AI.
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import logging
import os

from app.core.config import settings
from app.database.base import Base, engine, SessionLocal
import app.models.models  # noqa: F401 - ensure all models are imported for table creation

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

# Initialize Rate Limiter
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

# Lifespan context manager (replaces deprecated startup/shutdown events)
@asynccontextmanager
async def lifespan(application: FastAPI):
    """Initialize database and default data on startup."""
    logger.info("Starting CA ERP Platform API v2.0")
    
    # Environment Validation
    if not settings.DEBUG and settings.SECRET_KEY == "your-secret-key-change-in-production":
        logger.error("CRITICAL: SECRET_KEY is not set for production!")
        raise RuntimeError("CRITICAL: SECRET_KEY is not set for production!")
        
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized")
    except Exception as e:
        logger.error(f"Error creating database tables: {e}")

    # Seed default SaaS plans
    try:
        from app.services.saas_service import ensure_default_plans
        db = SessionLocal()
        try:
            ensure_default_plans(db)
        finally:
            db.close()
    except Exception as e:
        logger.warning(f"Failed to seed default plans: {e}")

    yield
    logger.info("Shutting down CA ERP Platform API")


# Create FastAPI app
app = FastAPI(
    title="CA ERP Platform API",
    description="Enterprise ERP for Chartered Accountants with AI, GST, TDS, Payroll, Audit, Inventory, WhatsApp, Voice",
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan,
)

# Apply Rate Limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# CORS — use explicit origins only; wildcard "*" defeats CORS protections.
# In debug mode, allow all origins for local development.
cors_origins = ["*"] if settings.DEBUG else settings.CORS_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Startup/shutdown logic moved to lifespan context manager above


# Health
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "CA ERP Platform API",
        "version": "2.0.0",
    }


@app.get("/")
async def root():
    return {
        "message": "CA ERP Platform API",
        "version": "2.0.0",
        "docs": "/api/docs",
        "redoc": "/api/redoc",
    }


# ============== Include All Routers ==============

from app.api.routes import (
    accounting, audit, auth, business_intelligence, ca_practice,
    companies, enterprise, gst, income_tax, invoicing, payroll,
    client_portal, documents, inventory
)

app.include_router(auth.router)
app.include_router(companies.router)
app.include_router(accounting.router)
app.include_router(invoicing.router)
app.include_router(gst.router)
app.include_router(payroll.router)
app.include_router(income_tax.router)
app.include_router(audit.router)
app.include_router(ca_practice.router)
app.include_router(business_intelligence.router)
app.include_router(enterprise.router)
app.include_router(client_portal.router)
app.include_router(documents.router)
app.include_router(inventory.router)


# ============== AI Routes ==============

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel
from datetime import date

from app.database.base import get_db
from app.core.security import get_current_user

ai_router = APIRouter(prefix="/api/ai", tags=["ai"])


class ChatRequest(BaseModel):
    message: str
    context_type: str = "General"
    conversation_id: Optional[int] = None


class VoucherSuggestRequest(BaseModel):
    description: str
    amount: float
    direction: str = "credit"


@ai_router.post("/chat")
def ai_chat(
    payload: ChatRequest,
    company_id: int,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.services.ai_service import chat
    return chat(db, company_id, user.id, payload.message, payload.context_type, payload.conversation_id)


@ai_router.get("/forecast/revenue/{company_id}")
def forecast_revenue(
    company_id: int,
    periods: int = 6,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.services.ai_service import forecast_revenue
    return forecast_revenue(db, company_id, periods)


@ai_router.get("/forecast/cash-flow/{company_id}")
def forecast_cf(
    company_id: int,
    periods: int = 3,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.services.ai_service import forecast_cash_flow
    return forecast_cash_flow(db, company_id, periods)


@ai_router.post("/suggest-voucher")
def suggest_voucher(
    payload: VoucherSuggestRequest,
    company_id: int,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.services.ai_service import suggest_voucher
    return suggest_voucher(db, company_id, payload.description, payload.amount, payload.direction)


@ai_router.get("/cfo-dashboard/{company_id}")
def cfo_dashboard(
    company_id: int,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.services.ai_service import cfo_dashboard
    return cfo_dashboard(db, company_id)


app.include_router(ai_router)


# ============== TDS Routes ==============

tds_router = APIRouter(prefix="/api/tds", tags=["tds"])


class TDSRequest(BaseModel):
    gross_amount: float
    section_code: str
    deductee_type: str = "Company"


@tds_router.post("/calculate")
def calc_tds(payload: TDSRequest, user=Depends(get_current_user)):
    from app.services.tds_service import calculate_tds
    return calculate_tds(payload.gross_amount, payload.section_code, payload.deductee_type)


@tds_router.get("/form-24q/{company_id}")
def form_24q(
    company_id: int, quarter: str, financial_year: str,
    user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.tds_service import get_form_24q_data
    return get_form_24q_data(db, company_id, quarter, financial_year)


@tds_router.get("/form-26q/{company_id}")
def form_26q(
    company_id: int, quarter: str, financial_year: str,
    user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.tds_service import get_form_26q_data
    return get_form_26q_data(db, company_id, quarter, financial_year)


@tds_router.get("/form-27q/{company_id}")
def form_27q(
    company_id: int, quarter: str, financial_year: str,
    user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.tds_service import get_form_27q_data
    return get_form_27q_data(db, company_id, quarter, financial_year)


@tds_router.get("/form-27eq/{company_id}")
def form_27eq(
    company_id: int, quarter: str, financial_year: str,
    user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.tds_service import get_form_27eq_data
    return get_form_27eq_data(db, company_id, quarter, financial_year)


@tds_router.get("/certificate/{deductee_id}")
def tds_cert(
    deductee_id: int, company_id: int, financial_year: str,
    user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.tds_service import get_tds_certificate
    return get_tds_certificate(db, company_id, deductee_id, financial_year)


@tds_router.get("/annual-summary/{company_id}")
def annual_summary(
    company_id: int, financial_year: str,
    user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.tds_service import get_annual_tds_summary
    return get_annual_tds_summary(db, company_id, financial_year)


@tds_router.get("/reconciliation/{company_id}")
def tds_recon(
    company_id: int, financial_year: str,
    user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.tds_service import tds_reconciliation
    return tds_reconciliation(db, company_id, financial_year)


app.include_router(tds_router)


# ============== GST Routes ==============

gst_extra = APIRouter(prefix="/api/gst", tags=["gst-extras"])


@gst_extra.get("/gstr1/{company_id}")
def gstr1(
    company_id: int, month: int, year: int,
    user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.gst_service import get_gstr1_data
    return get_gstr1_data(db, company_id, month, year)


@gst_extra.get("/gstr3b/{company_id}")
def gstr3b(
    company_id: int, month: int, year: int,
    user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.gst_service import get_gstr3b_data
    return get_gstr3b_data(db, company_id, month, year)


@gst_extra.get("/gstr9/{company_id}")
def gstr9(
    company_id: int, financial_year: str,
    user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.gst_service import get_gstr9_data
    return get_gstr9_data(db, company_id, financial_year)


@gst_extra.get("/reconciliation/{company_id}")
def gstr_recon(
    company_id: int, month: int, year: int,
    user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.gst_service import gst_reconciliation
    return gst_reconciliation(db, company_id, month, year)


@gst_extra.get("/dashboard/{company_id}")
def gstr_dash(
    company_id: int,
    user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.gst_service import gst_dashboard
    return gst_dashboard(db, company_id)


class GSTINValidateRequest(BaseModel):
    gstin: str


@gst_extra.post("/validate-gstin")
def validate(payload: GSTINValidateRequest, user=Depends(get_current_user)):
    from app.services.gst_service import validate_gstin
    return validate_gstin(payload.gstin)


app.include_router(gst_extra)


# ============== Payroll Routes ==============

payroll_extra = APIRouter(prefix="/api/payroll", tags=["payroll-extras"])


class EmployeeCreateReq(BaseModel):
    company_id: int
    employee_id: str
    first_name: str
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    pan: Optional[str] = None
    date_of_joining: Optional[date] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    salary_structure: Optional[dict] = None


@payroll_extra.post("/employees")
def create_employee(
    payload: EmployeeCreateReq, user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.models.models import Employee
    from app.core.deps import get_active_company_id
    get_active_company_id(user, db, payload.company_id)  # Verify access
    e = Employee(**payload.model_dump())
    db.add(e)
    db.commit()
    db.refresh(e)
    return {"id": e.id, "employee_id": e.employee_id, "name": e.first_name}


@payroll_extra.get("/employees/{company_id}")
def list_employees(
    company_id: int, user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.models.models import Employee
    rows = db.query(Employee).filter(Employee.company_id == company_id).all()
    return [{
        "id": r.id, "employee_id": r.employee_id,
        "name": f"{r.first_name} {r.last_name or ''}",
        "designation": r.designation, "department": r.department,
        "status": r.status,
    } for r in rows]


class ProcessPayrollReq(BaseModel):
    employee_id: int
    salary_month: date
    attendance_days: float = 26
    leaves_taken: float = 0
    regime: str = "new"


@payroll_extra.post("/process")
def process(
    payload: ProcessPayrollReq,
    company_id: int,
    user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.payroll_service import process_payroll, save_payroll_record
    data = process_payroll(db, company_id, payload.employee_id,
                          payload.salary_month, payload.attendance_days,
                          payload.leaves_taken, payload.regime)
    rec = save_payroll_record(db, company_id, payload.employee_id,
                              payload.salary_month, data)
    return {"payroll_id": rec.id, **data}


@payroll_extra.get("/payslip/{payroll_id}")
def payslip(
    payroll_id: int, user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.payroll_service import generate_payslip
    return generate_payslip(db, payroll_id)


@payroll_extra.get("/register/{company_id}")
def register(
    company_id: int, salary_month: date,
    user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.payroll_service import payroll_register
    return payroll_register(db, company_id, salary_month)


class AttendanceReq(BaseModel):
    employee_id: int
    attendance_date: date
    status: str = "Present"
    hours: float = 8
    remarks: str = ""


@payroll_extra.post("/attendance")
def attendance(
    payload: AttendanceReq,
    user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.payroll_service import mark_attendance
    a = mark_attendance(db, payload.employee_id, payload.attendance_date,
                        payload.status, payload.hours, payload.remarks)
    return {"id": a.id, "date": a.attendance_date.isoformat(), "status": a.status}


class LeaveReq(BaseModel):
    employee_id: int
    from_date: date
    to_date: date
    leave_type: str
    reason: str = ""


@payroll_extra.post("/leaves")
def apply_leave_route(
    payload: LeaveReq, user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.payroll_service import apply_leave
    l = apply_leave(db, payload.employee_id, payload.from_date, payload.to_date, payload.leave_type, payload.reason)
    return {"id": l.id, "days": l.days, "status": l.status}


class LeaveStatusReq(BaseModel):
    status: str


@payroll_extra.put("/leaves/{leave_id}/approve")
def approve_leave_route(
    leave_id: int, payload: LeaveStatusReq,
    user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.payroll_service import approve_leave
    l = approve_leave(db, leave_id, payload.status)
    return {"id": l.id, "status": l.status}


@payroll_extra.put("/process/{payroll_id}/pay")
def pay_payroll_route(
    payroll_id: int, user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.payroll_service import mark_payroll_paid
    rec = mark_payroll_paid(db, payroll_id)
    return {"id": rec.id, "status": rec.status}


app.include_router(payroll_extra)





# ============== WhatsApp & Voice Routes ==============

wa_voice = APIRouter(prefix="/api/comm", tags=["whatsapp-voice"])


class WhatsAppMessageReq(BaseModel):
    phone_number: str
    direction: str
    message_text: str = None
    message_type: str = "Text"
    attachment_url: str = None


@wa_voice.post("/whatsapp")
def whatsapp_route(
    payload: WhatsAppMessageReq,
    company_id: int,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.services.whatsapp_voice_service import WhatsAppHandler
    msg = WhatsAppHandler.record_message(
        db, company_id, payload.phone_number, payload.direction,
        payload.message_text, payload.message_type, payload.attachment_url,
    )
    return {
        "id": msg.id,
        "phone_number": msg.phone_number,
        "direction": msg.direction,
        "processing_status": msg.processing_status,
        "processing_log": msg.processing_log,
    }


class VoiceCommandReq(BaseModel):
    transcript: str


@wa_voice.post("/voice")
def voice_route(
    payload: VoiceCommandReq,
    company_id: int,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from app.services.whatsapp_voice_service import VoiceCommandHandler
    cmd = VoiceCommandHandler.process_voice(db, company_id, user.id, payload.transcript)
    return {
        "id": cmd.id,
        "transcript": cmd.transcript,
        "command_type": cmd.command_type,
        "parsed_payload": cmd.parsed_payload,
        "action_status": cmd.action_status,
    }


app.include_router(wa_voice)


# ============== Audit Routes ==============

audit_extra = APIRouter(prefix="/api/audit", tags=["audit-extras"])


@audit_extra.post("/detect-duplicates/{company_id}")
def detect_dups(
    company_id: int, user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.audit_service import detect_duplicate_invoices
    return detect_duplicate_invoices(db, company_id)


@audit_extra.post("/detect-circular/{company_id}")
def detect_circ(
    company_id: int, user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.audit_service import detect_circular_transactions
    return detect_circular_transactions(db, company_id)


@audit_extra.post("/detect-round-numbers/{company_id}")
def detect_round(
    company_id: int, user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.audit_service import detect_round_number_vouchers
    return detect_round_number_vouchers(db, company_id)


@audit_extra.get("/risk-assessment/{company_id}")
def risk(
    company_id: int, user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.audit_service import risk_assessment
    return risk_assessment(db, company_id)


app.include_router(audit_extra)


# ============== Government Routes ==============

gov_extra = APIRouter(prefix="/api/gov", tags=["government"])


class IntegrationCreate(BaseModel):
    company_id: int
    integration_type: str  # GST_Portal, Income_Tax_Portal, MCA, EPFO, ESIC
    username: str = None
    password: str = None
    api_key: str = None


@gov_extra.post("/integrations")
def create_integration(
    payload: IntegrationCreate, user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.models.models import GovernmentIntegration
    from app.core.security import hash_password
    i = GovernmentIntegration(
        company_id=payload.company_id, integration_type=payload.integration_type,
        username=payload.username,
        encrypted_password=hash_password(payload.password) if payload.password else None,
        api_key=payload.api_key, is_active=True,
    )
    db.add(i)
    db.commit()
    db.refresh(i)
    return {"id": i.id, "type": i.integration_type, "is_active": i.is_active}


@gov_extra.get("/integrations/{company_id}")
def list_integrations(
    company_id: int, user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.models.models import GovernmentIntegration
    rows = db.query(GovernmentIntegration).filter(
        GovernmentIntegration.company_id == company_id
    ).all()
    return [{
        "id": r.id, "type": r.integration_type, "username": r.username,
        "is_active": r.is_active, "last_sync": r.last_sync, "sync_status": r.sync_status,
    } for r in rows]


@gov_extra.post("/test/{integration_id}")
def test_integration(
    integration_id: int, user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.models.models import GovernmentIntegration
    from app.services.government_service import get_adapter
    i = db.query(GovernmentIntegration).filter(GovernmentIntegration.id == integration_id).first()
    if not i:
        raise HTTPException(status_code=404, detail="Integration not found")
    adapter = get_adapter(i)
    return adapter.test_connection()


app.include_router(gov_extra)


# ============== SaaS Admin Routes ==============

saas_extra = APIRouter(prefix="/api/saas", tags=["saas"])


@saas_extra.get("/plans")
def plans(db: Session = Depends(get_db)):
    from app.services.saas_service import list_plans
    return list_plans(db)


@saas_extra.get("/health")
def health(db: Session = Depends(get_db)):
    from app.services.saas_service import get_system_health
    return get_system_health(db)


@saas_extra.get("/usage/{company_id}")
def usage(
    company_id: int, period: str = None,
    user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.saas_service import get_usage
    return get_usage(db, company_id, period)


@saas_extra.get("/bill/{company_id}")
def bill(
    company_id: int, user=Depends(get_current_user), db: Session = Depends(get_db),
):
    from app.services.saas_service import calculate_bill
    return calculate_bill(db, company_id)


app.include_router(saas_extra)


# Static files (uploads)
upload_dir = os.environ.get("UPLOAD_DIR", "./uploads")
os.makedirs(upload_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_dir), name="uploads")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.SERVER_HOST,
        port=settings.SERVER_PORT,
        reload=settings.DEBUG,
    )
   