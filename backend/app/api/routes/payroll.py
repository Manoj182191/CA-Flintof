"""
Payroll API routes.
Only references functions that exist in app.services.payroll_service.
"""
from datetime import date
from typing import Any, Dict, List, Optional
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database.base import get_db
from app.models.models import Attendance, Company, Employee, Leave, PayrollRecord
from app.services.payroll_service import (
    process_payroll, save_payroll_record, generate_payslip,
    payroll_register, mark_attendance, apply_leave,
    calculate_pf, calculate_esi, calculate_pt, calculate_tds_on_salary,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/payroll", tags=["payroll"])


# ============== Schemas ==============

class EmployeeCreate(BaseModel):
    company_id: Optional[int] = None
    employee_id: Optional[str] = None
    employee_code: Optional[str] = None
    first_name: str
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    pan: Optional[str] = None
    aadhaar: Optional[str] = None
    date_of_joining: Optional[date] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    salary_structure: Optional[Dict[str, Any]] = None
    bank_account: Optional[str] = None
    ifsc_code: Optional[str] = None
    pf_account: Optional[str] = None
    esic_account: Optional[str] = None


class AttendanceCreate(BaseModel):
    employee_id: int
    attendance_date: date
    status: str = "Present"
    working_hours: float = 8
    remarks: Optional[str] = None


class LeaveCreate(BaseModel):
    employee_id: int
    leave_type: str
    from_date: date
    to_date: date
    reason: Optional[str] = None


class ProcessPayrollReq(BaseModel):
    employee_id: int
    salary_month: date
    attendance_days: float = 26
    leaves_taken: float = 0
    regime: str = "new"


# ============== Employees ==============

@router.post("/employees")
def create_employee(
    payload: EmployeeCreate, 
    x_company_id: Optional[int] = Header(None, alias="X-Company-ID"),
    db: Session = Depends(get_db)
):
    comp_id = payload.company_id or x_company_id
    if not comp_id:
        raise HTTPException(status_code=400, detail="Company ID missing")
    emp_id = payload.employee_id or payload.employee_code
    
    company = db.query(Company).filter(Company.id == comp_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    existing = db.query(Employee).filter(
        Employee.company_id == comp_id,
        Employee.employee_id == emp_id,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee ID already exists")
        
    data = payload.model_dump(exclude_unset=True, exclude_none=True)
    data["company_id"] = comp_id
    data["employee_id"] = emp_id
    data.pop("employee_code", None)
    
    employee = Employee(**data)
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


@router.get("/employees/{company_id}")
def list_employees(company_id: int, status: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Employee).filter(Employee.company_id == company_id)
    if status:
        query = query.filter(Employee.status == status)
    return query.order_by(Employee.first_name).all()


@router.get("/employees/by-id/{employee_id}")
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    e = db.query(Employee).filter(Employee.id == employee_id).first()
    if not e:
        raise HTTPException(status_code=404, detail="Employee not found")
    return e


# ============== Attendance ==============

@router.post("/attendance")
def record_attendance(payload: AttendanceCreate, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == payload.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return mark_attendance(
        db, payload.employee_id, payload.attendance_date,
        payload.status, payload.working_hours, payload.remarks or "",
    )


@router.get("/attendance/{employee_id}")
def list_attendance(employee_id: int, from_date: Optional[date] = Query(None),
                    to_date: Optional[date] = Query(None),
                    db: Session = Depends(get_db)):
    q = db.query(Attendance).filter(Attendance.employee_id == employee_id)
    if from_date:
        q = q.filter(Attendance.attendance_date >= from_date)
    if to_date:
        q = q.filter(Attendance.attendance_date <= to_date)
    return q.order_by(Attendance.attendance_date.desc()).all()


# ============== Leaves ==============

@router.post("/leaves")
def apply_leave_route(payload: LeaveCreate, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == payload.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return apply_leave(
        db, payload.employee_id, payload.from_date, payload.to_date,
        payload.leave_type, payload.reason or "",
    )


@router.get("/leaves/{employee_id}")
def list_leaves(employee_id: int, db: Session = Depends(get_db)):
    return db.query(Leave).filter(Leave.employee_id == employee_id).order_by(Leave.from_date.desc()).all()


@router.patch("/leaves/{leave_id}/status")
def update_leave_status(leave_id: int, status: str = Query(...), db: Session = Depends(get_db)):
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    leave.status = status
    db.commit()
    db.refresh(leave)
    return leave


# ============== Payroll Processing ==============

@router.post("/process")
def process_payroll_route(payload: ProcessPayrollReq, company_id: int = Query(...),
                          db: Session = Depends(get_db)):
    data = process_payroll(
        db, company_id, payload.employee_id, payload.salary_month,
        payload.attendance_days, payload.leaves_taken, payload.regime,
    )
    rec = save_payroll_record(db, company_id, payload.employee_id, payload.salary_month, data)
    return {"payroll_id": rec.id, **data}


@router.get("/payslip/{payroll_id}")
def payslip(payroll_id: int, db: Session = Depends(get_db)):
    return generate_payslip(db, payroll_id)


@router.get("/register/{company_id}")
def register_route(company_id: int, salary_month: date, db: Session = Depends(get_db)):
    return payroll_register(db, company_id, salary_month)


@router.get("/records/{company_id}")
def list_payroll_records(company_id: int, salary_month: Optional[date] = Query(None),
                          db: Session = Depends(get_db)):
    q = db.query(PayrollRecord).filter(PayrollRecord.company_id == company_id)
    if salary_month:
        q = q.filter(PayrollRecord.salary_month == salary_month)
    return q.order_by(PayrollRecord.salary_month.desc()).all()


# ============== Statutory Calculators (utility endpoints) ==============

class PFRequest(BaseModel):
    basic_salary: float


class ESIRequest(BaseModel):
    gross_salary: float


class PTRequest(BaseModel):
    gross_salary: float
    month: int


class TDSSalaryRequest(BaseModel):
    annual_salary: float
    regime: str = "new"


@router.post("/calculate/pf")
def calc_pf_route(payload: PFRequest):
    return calculate_pf(payload.basic_salary)


@router.post("/calculate/esi")
def calc_esi_route(payload: ESIRequest):
    return calculate_esi(payload.gross_salary)


@router.post("/calculate/pt")
def calc_pt_route(payload: PTRequest):
    return calculate_pt(payload.gross_salary, payload.month)


@router.post("/calculate/tds")
def calc_tds_salary_route(payload: TDSSalaryRequest):
    return calculate_tds_on_salary(payload.annual_salary, payload.regime)
