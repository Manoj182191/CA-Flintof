"""
Complete Payroll Service
Implements: PF, ESI, Professional Tax, TDS on salary, payslip generation,
salary structure, attendance, leave management, payroll processing.
"""
from datetime import date, datetime
from typing import Dict, List, Optional
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from app.models.models import (
    Employee, Attendance, Leave, PayrollRecord, SalaryStructure,
    PayrollComponent, LeaveType, LeaveBalance, Holiday, Company,
)


# ============ Statutory Rates (India FY 2023-24 onwards) ============

# PF: 12% of basic, employer matches 12% (split: 8.33% EPS + 3.67% EPF)
# Wage ceiling for PF: Rs 15,000/month basic for EPF; full basic for EPS
PF_RATE_EMPLOYEE = 12.0
PF_RATE_EMPLOYER = 12.0
PF_BASIC_CEILING = 15000  # For contribution; full basic is pensionable

# ESI: 0.75% employee, 3.25% employer on gross
# Applicable if gross salary <= Rs 21,000/month
ESI_THRESHOLD = 21000
ESI_RATE_EMPLOYEE = 0.75
ESI_RATE_EMPLOYER = 3.25

# Professional Tax (Maharashtra as default; varies by state)
PT_SLABS = [
    (0, 5000, 0),       # <= 5000: Nil
    (5001, 10000, 175),  # 5001-10000: Rs 175
    (10001, None, 200),  # > 10000 (Feb: 300): Rs 200 (simplified)
]
PT_FEB_AMOUNT = 300  # February surcharge in many states

# TDS on salary (New Regime FY 2024-25)
NEW_REGIME_SLABS = [
    (0, 300000, 0),
    (300001, 700000, 5),
    (700001, 1000000, 10),
    (1000001, 1200000, 15),
    (1200001, 1500000, 20),
    (1500001, None, 30),
]
STANDARD_DEDUCTION = 75000  # New regime
REBATE_87A_LIMIT = 700000   # Full rebate up to this income (new regime)
REBATE_87A_MAX = 25000


def calculate_pf(basic_salary: float) -> Dict:
    """PF: 12% of (basic or 15000, whichever is less for employee)."""
    pf_base = min(basic_salary, PF_BASIC_CEILING)
    employee_pf = round(pf_base * PF_RATE_EMPLOYEE / 100, 2)
    employer_pf = round(pf_base * PF_RATE_EMPLOYER / 100, 2)
    return {
        "pf_base": round(pf_base, 2),
        "employee_pf": employee_pf,
        "employer_pf": employer_pf,
        "total_pf": round(employee_pf + employer_pf, 2),
    }


def calculate_esi(gross_salary: float) -> Dict:
    """ESI: 0.75% employee + 3.25% employer on full gross (no ceiling)."""
    if gross_salary > ESI_THRESHOLD:
        return {"applicable": False, "employee_esi": 0, "employer_esi": 0}
    employee_esi = round(gross_salary * ESI_RATE_EMPLOYEE / 100, 2)
    employer_esi = round(gross_salary * ESI_RATE_EMPLOYER / 100, 2)
    return {
        "applicable": True,
        "employee_esi": employee_esi,
        "employer_esi": employer_esi,
        "total_esi": round(employee_esi + employer_esi, 2),
    }


def calculate_pt(gross_salary: float, month: int) -> Dict:
    """Professional Tax: state-specific (Maharashtra default)."""
    amount = 0
    for low, high, tax in PT_SLABS:
        if gross_salary >= low and (high is None or gross_salary <= high):
            amount = tax
            break
    # Feb surcharge
    if month == 2 and amount > 0:
        amount += PT_FEB_AMOUNT
    return {"pt": round(amount, 2)}


def calculate_tds_on_salary(annual_salary: float, regime: str = "new") -> Dict:
    """Annualize monthly gross and compute TDS for the FY."""
    if regime == "new":
        slabs = NEW_REGIME_SLABS
        std_ded = STANDARD_DEDUCTION
        rebate_limit = REBATE_87A_LIMIT
        rebate_max = REBATE_87A_MAX
    else:
        # Old regime (simplified)
        slabs = [(0, 250000, 0), (250001, 500000, 5), (500001, 1000000, 20), (1000001, None, 30)]
        std_ded = 50000
        rebate_limit = 500000
        rebate_max = 12500

    taxable = max(annual_salary - std_ded, 0)
    tax = 0
    for low, high, rate in slabs:
        if taxable > low:
            slab_max = high if high is not None else taxable
            slab_amount = min(taxable, slab_max) - (low - 1)
            if slab_amount > 0:
                tax += slab_amount * rate / 100

    # Rebate 87A
    rebate = 0
    if annual_salary <= rebate_limit and tax > 0:
        rebate = min(tax, rebate_max)
        tax -= rebate

    # 4% cess
    cess = round(tax * 0.04, 2)
    total = round(tax + cess, 2)
    monthly = round(total / 12, 2)

    return {
        "annual_salary": round(annual_salary, 2),
        "standard_deduction": std_ded,
        "taxable_income": round(taxable, 2),
        "tax_before_rebate": round(tax + rebate, 2),
        "rebate_87a": round(rebate, 2),
        "tax_after_rebate": round(tax, 2),
        "cess": cess,
        "annual_tds": total,
        "monthly_tds": monthly,
    }


# ============ Salary Structure Application ============

def apply_salary_structure(basic_salary: float, structure: SalaryStructure) -> Dict:
    """Break down a CTC into components using a structure template."""
    basic = round(basic_salary, 2)
    hra = round(basic * structure.hra_percent / 100, 2)
    da = round(basic * structure.da_percent / 100, 2)
    gross = round(basic + hra + da, 2)
    # Special allowance = remaining CTC after basic, HRA, DA
    special = max(round(gross - basic - hra - da, 2), 0)
    return {
        "basic": basic,
        "da": da,
        "hra": hra,
        "special_allowance": special,
        "gross": gross,
    }


# ============ Payroll Processing ============

def process_payroll(
    db: Session, company_id: int, employee_id: int, salary_month: date,
    attendance_days: float = 26, leaves_taken: float = 0,
    regime: str = "new",
) -> Dict:
    """
    Process payroll for one employee for a given month.
    attendance_days: number of days worked (default 26)
    leaves_taken: number of unpaid leave days
    """
    employee = db.query(Employee).filter(
        Employee.id == employee_id, Employee.company_id == company_id
    ).first()
    if not employee:
        raise ValueError("Employee not found")
    if employee.status != "Active":
        raise ValueError("Employee is not active")

    # Use salary_structure JSON if present
    struct = employee.salary_structure or {}
    annual_ctc = float(struct.get("annual_ctc", 0) or struct.get("ctc", 0))
    if annual_ctc <= 0:
        # Fallback: derive from monthly_gross or monthly_basic
        monthly_gross_val = float(struct.get("monthly_gross", 0) or 0)
        if monthly_gross_val > 0:
            annual_ctc = monthly_gross_val * 12
        else:
            monthly_basic_val = float(struct.get("monthly_basic", 0) or 0)
            if monthly_basic_val > 0:
                annual_ctc = monthly_basic_val * 12 / 0.40  # Assume basic = 40% of gross
    if annual_ctc <= 0:
        raise ValueError(
            f"Employee {employee_id} has no salary configured. "
            f"Set 'annual_ctc' or 'monthly_gross' in salary_structure."
        )
    monthly_gross = annual_ctc / 12

    # Pro-rate based on attendance
    standard_days = 26
    earned_gross = round(monthly_gross * attendance_days / standard_days, 2) if standard_days else monthly_gross

    # Approximate: basic = 40% of gross (per typical structure)
    basic_salary = round(earned_gross * 0.40, 2)
    hra = round(basic_salary * 0.50, 2)
    other_allowances = round(earned_gross - basic_salary - hra, 2)

    gross_salary = earned_gross

    # Deductions
    pf = calculate_pf(basic_salary)
    esi = calculate_esi(gross_salary)
    pt = calculate_pt(gross_salary, salary_month.month)

    employee_pf = pf["employee_pf"]
    employee_esi = esi["employee_esi"]
    professional_tax = pt["pt"]

    # TDS (annualized)
    annual_salary_estimate = monthly_gross * 12
    tds_calc = calculate_tds_on_salary(annual_salary_estimate, regime=regime)
    income_tax = tds_calc["monthly_tds"]

    total_deductions = round(employee_pf + employee_esi + professional_tax + income_tax, 2)
    net_salary = round(gross_salary - total_deductions, 2)

    return {
        "employee_id": employee_id,
        "employee_name": f"{employee.first_name} {employee.last_name or ''}",
        "salary_month": salary_month.isoformat(),
        "attendance_days": attendance_days,
        "leaves_taken": leaves_taken,
        "earnings": {
            "basic": basic_salary,
            "hra": hra,
            "da": 0,
            "other_allowances": other_allowances,
            "gross": gross_salary,
        },
        "deductions": {
            "employee_pf": employee_pf,
            "employee_esi": employee_esi,
            "professional_tax": professional_tax,
            "income_tax": income_tax,
            "total": total_deductions,
        },
        "employer_contributions": {
            "pf": pf["employer_pf"],
            "esi": esi["employer_esi"],
            "total": round(pf["employer_pf"] + esi["employer_esi"], 2),
        },
        "net_salary": net_salary,
    }


def save_payroll_record(db: Session, company_id: int, employee_id: int,
                        salary_month: date, payroll_data: Dict,
                        user_id: int = None) -> PayrollRecord:
    """Persist a calculated payroll to the database."""
    earnings = payroll_data["earnings"]
    deductions = payroll_data["deductions"]
    rec = PayrollRecord(
        company_id=company_id,
        employee_id=employee_id,
        salary_month=salary_month,
        basic_salary=earnings["basic"],
        dearness_allowance=earnings["da"],
        house_rent_allowance=earnings["hra"],
        other_allowances=earnings["other_allowances"],
        gross_salary=earnings["gross"],
        professional_tax=deductions["professional_tax"],
        employee_pf=deductions["employee_pf"],
        employee_esi=deductions["employee_esi"],
        income_tax=deductions["income_tax"],
        other_deductions=0,
        total_deductions=deductions["total"],
        net_salary=payroll_data["net_salary"],
        status="Draft",
    )
    db.add(rec)
    db.commit()
    db.refresh(rec)
    return rec


# ============ Payslip ===============

def generate_payslip(db: Session, payroll_record_id: int) -> Dict:
    """Generate a formatted payslip for a payroll record."""
    rec = db.query(PayrollRecord).filter(PayrollRecord.id == payroll_record_id).first()
    if not rec:
        raise ValueError("Payroll record not found")
    employee = db.query(Employee).filter(Employee.id == rec.employee_id).first()
    company = db.query(Company).filter(Company.id == rec.company_id).first()
    return {
        "company": {"id": company.id, "name": company.name, "pan": company.pan} if company else {},
        "employee": {
            "id": employee.id, "name": f"{employee.first_name} {employee.last_name or ''}",
            "employee_id": employee.employee_id, "designation": employee.designation,
            "department": employee.department, "pan": employee.pan,
            "date_of_joining": employee.date_of_joining.isoformat() if employee.date_of_joining else None,
        } if employee else {},
        "pay_period": rec.salary_month.isoformat() if rec.salary_month else None,
        "earnings": {
            "basic": rec.basic_salary, "da": rec.dearness_allowance,
            "hra": rec.house_rent_allowance, "other_allowances": rec.other_allowances,
            "gross": rec.gross_salary,
        },
        "deductions": {
            "pf": rec.employee_pf, "esi": rec.employee_esi,
            "pt": rec.professional_tax, "income_tax": rec.income_tax,
            "total": rec.total_deductions,
        },
        "net_salary": rec.net_salary,
        "status": rec.status,
    }


# ============ Payroll Register ============

def payroll_register(db: Session, company_id: int, salary_month: date) -> Dict:
    """Generate a payroll register for a month: all employees, total cost."""
    records = db.query(PayrollRecord).filter(
        PayrollRecord.company_id == company_id,
        PayrollRecord.salary_month == salary_month,
    ).all()
    totals = {
        "gross": sum(r.gross_salary or 0 for r in records),
        "pf": sum(r.employee_pf or 0 for r in records),
        "esi": sum(r.employee_esi or 0 for r in records),
        "pt": sum(r.professional_tax or 0 for r in records),
        "income_tax": sum(r.income_tax or 0 for r in records),
        "deductions": sum(r.total_deductions or 0 for r in records),
        "net": sum(r.net_salary or 0 for r in records),
    }
    return {
        "company_id": company_id,
        "salary_month": salary_month.isoformat(),
        "employee_count": len(records),
        "totals": {k: round(v, 2) for k, v in totals.items()},
        "records": [{
            "id": r.id, "employee_id": r.employee_id,
            "gross": r.gross_salary, "deductions": r.total_deductions,
            "net": r.net_salary, "status": r.status,
        } for r in records],
    }


# ============ Attendance / Leave ============

def mark_attendance(db: Session, employee_id: int, attendance_date: date,
                    status: str = "Present", hours: float = 8.0,
                    remarks: str = "") -> Attendance:
    """Mark or update an employee's attendance for a date."""
    existing = db.query(Attendance).filter(
        Attendance.employee_id == employee_id,
        Attendance.attendance_date == attendance_date,
    ).first()
    if existing:
        existing.status = status
        existing.working_hours = hours
        existing.remarks = remarks
        db.commit()
        return existing
    a = Attendance(
        employee_id=employee_id, attendance_date=attendance_date,
        status=status, working_hours=hours, remarks=remarks,
    )
    db.add(a)
    db.commit()
    db.refresh(a)
    return a


def apply_leave(db: Session, employee_id: int, from_date: date, to_date: date,
                leave_type: str, reason: str = "") -> Leave:
    """Apply for leave."""
    days = (to_date - from_date).days + 1
    leave = Leave(
        employee_id=employee_id, from_date=from_date, to_date=to_date,
        leave_type=leave_type, days=days, reason=reason, status="Pending",
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return leave


def approve_leave(db: Session, leave_id: int, status: str) -> Leave:
    """Approve or reject a leave application."""
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise ValueError("Leave not found")
    if status not in ["Approved", "Rejected"]:
        raise ValueError("Status must be 'Approved' or 'Rejected'")
    leave.status = status
    db.commit()
    db.refresh(leave)
    return leave


def mark_payroll_paid(db: Session, payroll_record_id: int) -> PayrollRecord:
    """Mark a payroll record as Paid."""
    rec = db.query(PayrollRecord).filter(PayrollRecord.id == payroll_record_id).first()
    if not rec:
        raise ValueError("Payroll record not found")
    rec.status = "Paid"
    db.commit()
    db.refresh(rec)
    return rec
