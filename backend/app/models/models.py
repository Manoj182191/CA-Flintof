"""
Database models for CA ERP Platform
Core accounting and business models
"""

from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey, Text, Enum, Date, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base
from datetime import datetime, date
import enum

# ============== USER & COMPANY MODELS ==============

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(255), unique=True, nullable=False)
    full_name = Column(String(255))
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    companies = relationship("Company", back_populates="created_by_user")
    user_roles = relationship("UserRole", back_populates="user")

class Company(Base):
    __tablename__ = "companies"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    legal_name = Column(String(255))
    pan = Column(String(10), unique=True)
    gstin = Column(String(15), unique=True)
    tan = Column(String(10))
    cid = Column(String(21), unique=True)  # Company Identification Number
    business_type = Column(String(50))  # Sole Proprietor, Partnership, LLP, Private Ltd, etc.
    financial_year_start = Column(Integer, default=4)  # Month when FY starts (Indian FY = April)
    currency = Column(String(3), default="INR")
    country = Column(String(2), default="IN")
    address = Column(Text)
    phone = Column(String(20))
    email = Column(String(255))
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    created_by_user = relationship("User", back_populates="companies")
    ledgers = relationship("Ledger", back_populates="company", cascade="all, delete-orphan")
    vouchers = relationship("Voucher", back_populates="company", cascade="all, delete-orphan")
    invoices = relationship("Invoice", back_populates="company", cascade="all, delete-orphan")
    customers = relationship("Customer", back_populates="company", cascade="all, delete-orphan")
    vendors = relationship("Vendor", back_populates="company", cascade="all, delete-orphan")
    staff = relationship("Staff", back_populates="company", cascade="all, delete-orphan")
    warehouses = relationship("Warehouse", back_populates="company", cascade="all, delete-orphan")
    settings = relationship("CompanySetting", uselist=False, back_populates="company", cascade="all, delete-orphan")

    @property
    def base_currency(self) -> str:
        return self.settings.base_currency if self.settings else "INR"

    @property
    def decimal_places(self) -> int:
        return self.settings.decimal_places if self.settings else 2

    @property
    def date_format(self) -> str:
        return self.settings.date_format if self.settings else "DD/MM/YYYY"


class Role(Base):
    __tablename__ = "roles"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text)
    
    user_roles = relationship("UserRole", back_populates="role")

class UserRole(Base):
    __tablename__ = "user_roles"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    role_id = Column(Integer, ForeignKey("roles.id"))
    company_id = Column(Integer, ForeignKey("companies.id"))
    
    user = relationship("User", back_populates="user_roles")
    role = relationship("Role", back_populates="user_roles")

# ============== CHART OF ACCOUNTS MODELS ==============

class LedgerGroup(Base):
    __tablename__ = "ledger_groups"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String(100), nullable=False)
    group_type = Column(String(50))  # Assets, Liabilities, Income, Expenses, Equity
    parent_id = Column(Integer, ForeignKey("ledger_groups.id"))
    is_reserved = Column(Boolean, default=False)  # System reserved groups
    
    company = relationship("Company")
    ledgers = relationship("Ledger", back_populates="group")
    parent = relationship("LedgerGroup", remote_side=[id])

class Ledger(Base):
    __tablename__ = "ledgers"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    group_id = Column(Integer, ForeignKey("ledger_groups.id"), nullable=False)
    name = Column(String(255), nullable=False)
    alias = Column(String(255))
    opening_balance = Column(Float, default=0)
    opening_date = Column(Date)
    is_active = Column(Boolean, default=True)
    
    company = relationship("Company", back_populates="ledgers")
    group = relationship("LedgerGroup", back_populates="ledgers")
    transactions = relationship("Transaction", back_populates="ledger")

class CostCenter(Base):
    __tablename__ = "cost_centers"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String(100), nullable=False)
    code = Column(String(50), nullable=False)
    description = Column(Text)

class ProfitCenter(Base):
    __tablename__ = "profit_centers"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String(100), nullable=False)
    code = Column(String(50), nullable=False)
    description = Column(Text)

# ============== TRANSACTION & VOUCHER MODELS ==============

class VoucherType(str, enum.Enum):
    PAYMENT = "Payment"
    RECEIPT = "Receipt"
    CONTRA = "Contra"
    JOURNAL = "Journal"
    DEBIT_NOTE = "Debit Note"
    CREDIT_NOTE = "Credit Note"
    PURCHASE = "Purchase"
    SALES = "Sales"

class Voucher(Base):
    __tablename__ = "vouchers"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    voucher_type = Column(String(50), nullable=False)
    voucher_number = Column(String(100), nullable=False)
    voucher_date = Column(Date, nullable=False)
    reference_number = Column(String(100))
    description = Column(Text)
    total_debit = Column(Float, default=0)
    total_credit = Column(Float, default=0)
    narration = Column(Text)
    is_posted = Column(Boolean, default=False)
    created_by = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    company = relationship("Company", back_populates="vouchers")
    transactions = relationship("Transaction", back_populates="voucher", cascade="all, delete-orphan")

class Transaction(Base):
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True)
    voucher_id = Column(Integer, ForeignKey("vouchers.id"), nullable=False)
    ledger_id = Column(Integer, ForeignKey("ledgers.id"), nullable=False)
    debit_amount = Column(Float, default=0)
    credit_amount = Column(Float, default=0)
    narration = Column(Text)
    cost_center_id = Column(Integer, ForeignKey("cost_centers.id"))
    profit_center_id = Column(Integer, ForeignKey("profit_centers.id"))
    
    voucher = relationship("Voucher", back_populates="transactions")
    ledger = relationship("Ledger", back_populates="transactions")

# ============== CUSTOMER & VENDOR MODELS ==============

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255))
    phone = Column(String(20))
    gstin = Column(String(15))
    pan = Column(String(10))
    billing_address = Column(Text)
    shipping_address = Column(Text)
    credit_limit = Column(Float, default=0)
    payment_terms = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company", back_populates="customers")
    invoices = relationship("Invoice", back_populates="customer")

class Vendor(Base):
    __tablename__ = "vendors"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String(255), nullable=False)
    email = Column(String(255))
    phone = Column(String(20))
    gstin = Column(String(15))
    pan = Column(String(10))
    address = Column(Text)
    payment_terms = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company", back_populates="vendors")

class Staff(Base):
    __tablename__ = "staff"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(255), nullable=False)
    email = Column(String(255))
    phone = Column(String(20))
    designation = Column(String(100))
    department = Column(String(100))
    joining_date = Column(Date)
    salary = Column(Float)
    
    company = relationship("Company", back_populates="staff")

# ============== INVOICING MODELS ==============

class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=True)
    invoice_number = Column(String(100), unique=True, nullable=False)
    invoice_date = Column(Date, nullable=False)
    due_date = Column(Date)
    invoice_type = Column(String(20))  # Sales, Purchase
    subtotal = Column(Float, default=0)
    tax_amount = Column(Float, default=0)
    total_amount = Column(Float, default=0)
    paid_amount = Column(Float, default=0)
    status = Column(String(20), default="Draft")  # Draft, Sent, Paid, Overdue, Cancelled
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    company = relationship("Company", back_populates="invoices")
    customer = relationship("Customer", back_populates="invoices")
    vendor = relationship("Vendor", backref="invoices")
    line_items = relationship("InvoiceLineItem", back_populates="invoice", cascade="all, delete-orphan")

class InvoiceLineItem(Base):
    __tablename__ = "invoice_line_items"
    
    id = Column(Integer, primary_key=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id"), nullable=False)
    description = Column(String(255), nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    gst_rate = Column(Float, default=0)
    gst_amount = Column(Float, default=0)
    line_total = Column(Float, default=0)
    
    invoice = relationship("Invoice", back_populates="line_items")

# ============== INVENTORY MODELS ==============

class Warehouse(Base):
    __tablename__ = "warehouses"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String(100), nullable=False)
    code = Column(String(50), unique=True)
    location = Column(String(255))
    manager_id = Column(Integer, ForeignKey("staff.id"))
    
    company = relationship("Company", back_populates="warehouses")




class StockItem(Base):
    __tablename__ = "stock_items"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("stock_categories.id"), nullable=True)
    item_code = Column(String(50), unique=True, nullable=False)
    item_name = Column(String(255), nullable=False)
    description = Column(Text)
    unit = Column(String(20))
    quantity_on_hand = Column(Float, default=0)
    reorder_level = Column(Float, default=0)
    purchase_price = Column(Float)
    selling_price = Column(Float)
    hsn_code = Column(String(20))
    gst_rate = Column(Float, default=0)
    
    company = relationship("Company")
    category = relationship("StockCategory")

class BankAccount(Base):
    __tablename__ = "bank_accounts"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    bank_name = Column(String(100), nullable=False)
    account_number = Column(String(50), unique=True, nullable=False)
    ifsc_code = Column(String(11))
    account_holder = Column(String(255))
    opening_balance = Column(Float, default=0)
    current_balance = Column(Float, default=0)
    
    company = relationship("Company")

class BankTransaction(Base):
    __tablename__ = "bank_transactions"
    
    id = Column(Integer, primary_key=True)
    bank_account_id = Column(Integer, ForeignKey("bank_accounts.id"), nullable=False)
    transaction_date = Column(Date, nullable=False)
    reference_number = Column(String(100))
    description = Column(Text)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String(20))  # Credit, Debit
    is_reconciled = Column(Boolean, default=False)
    
    bank_account = relationship("BankAccount")

# ============== GST MODELS ==============

class GSTReturn(Base):
    __tablename__ = "gst_returns"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    return_type = Column(String(20), nullable=False)  # GSTR-1, GSTR-3B, etc.
    month = Column(Integer, nullable=False)
    year = Column(Integer, nullable=False)
    filing_date = Column(Date)
    status = Column(String(20), default="Draft")
    total_supply = Column(Float, default=0)
    total_tax = Column(Float, default=0)
    
    company = relationship("Company")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    entity_type = Column(String(100))
    entity_id = Column(Integer)
    action = Column(String(50))  # CREATE, UPDATE, DELETE
    old_values = Column(JSON)
    new_values = Column(JSON)
    ip_address = Column(String(50))
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company")
    user = relationship("User")


# ============== PAYROLL MODELS (PHASE 2) ==============

class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    employee_id = Column(String(50), nullable=False)  # Unique employee ID
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255))
    email = Column(String(255))
    phone = Column(String(20))
    pan = Column(String(10))
    aadhaar = Column(String(12))
    date_of_joining = Column(Date)
    date_of_leaving = Column(Date)
    designation = Column(String(100))
    department = Column(String(100))
    salary_structure = Column(JSON)  # Base, DA, HRA, allowances
    bank_account = Column(String(20))
    ifsc_code = Column(String(11))
    pf_account = Column(String(20))
    esic_account = Column(String(17))
    status = Column(String(20), default="Active")  # Active, Left, Suspended
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    company = relationship("Company")
    payroll_records = relationship("PayrollRecord", back_populates="employee")
    attendance = relationship("Attendance", back_populates="employee")
    leaves = relationship("Leave", back_populates="employee")


class Attendance(Base):
    __tablename__ = "attendance"
    
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    attendance_date = Column(Date, nullable=False)
    status = Column(String(20))  # Present, Absent, Leave, Halfday
    working_hours = Column(Float, default=8)
    remarks = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    employee = relationship("Employee", back_populates="attendance")


class Leave(Base):
    __tablename__ = "leaves"
    
    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    leave_type = Column(String(50))  # Casual, Sick, Earned, Unpaid
    from_date = Column(Date, nullable=False)
    to_date = Column(Date, nullable=False)
    days = Column(Float)
    reason = Column(Text)
    status = Column(String(20), default="Pending")  # Pending, Approved, Rejected
    created_at = Column(DateTime, default=datetime.utcnow)
    
    employee = relationship("Employee", back_populates="leaves")


class PayrollRecord(Base):
    __tablename__ = "payroll_records"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    salary_month = Column(Date, nullable=False)  # Month of salary
    basic_salary = Column(Float)
    dearness_allowance = Column(Float, default=0)
    house_rent_allowance = Column(Float, default=0)
    other_allowances = Column(Float, default=0)
    gross_salary = Column(Float)
    
    # Deductions
    professional_tax = Column(Float, default=0)
    employee_pf = Column(Float, default=0)
    employee_esic = Column(Float, default=0)
    income_tax = Column(Float, default=0)
    other_deductions = Column(Float, default=0)
    total_deductions = Column(Float)
    
    net_salary = Column(Float)
    status = Column(String(20), default="Draft")  # Draft, Processed, Paid
    paid_on = Column(Date)
    voucher_id = Column(Integer, ForeignKey("vouchers.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company")
    employee = relationship("Employee", back_populates="payroll_records")


# ============== INCOME TAX MODELS (PHASE 2) ==============

class IncomeTaxReturn(Base):
    __tablename__ = "income_tax_returns"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    financial_year = Column(String(9))  # e.g., 2023-24
    return_type = Column(String(20))  # ITR-1, ITR-2, ITR-3, ITR-4
    entity_type = Column(String(20))  # Individual, Partnership, LLP, Company
    
    # Income Details
    total_income = Column(Float, default=0)
    business_income = Column(Float, default=0)
    salary_income = Column(Float, default=0)
    capital_gains = Column(Float, default=0)
    other_income = Column(Float, default=0)
    
    # Deductions
    standard_deduction = Column(Float, default=0)
    section_80_deductions = Column(Float, default=0)
    interest_on_loan = Column(Float, default=0)
    depreciation = Column(Float, default=0)
    other_deductions = Column(Float, default=0)
    
    # Tax Calculation
    taxable_income = Column(Float)
    income_tax = Column(Float)
    surcharge = Column(Float, default=0)
    cess = Column(Float, default=0)
    total_tax = Column(Float)
    tds_credit = Column(Float, default=0)
    advance_tax = Column(Float, default=0)
    tax_payable = Column(Float)
    
    status = Column(String(20), default="Draft")  # Draft, Filed, Processed
    filed_on = Column(Date)
    acknowledgment_number = Column(String(50))
    remarks = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company")
    attachments = relationship("TaxReturnAttachment", back_populates="return_record")


class TaxReturnAttachment(Base):
    __tablename__ = "tax_return_attachments"
    
    id = Column(Integer, primary_key=True)
    return_id = Column(Integer, ForeignKey("income_tax_returns.id"), nullable=False)
    attachment_type = Column(String(50))  # Balance Sheet, P&L, Schedule, etc.
    file_path = Column(String(255))
    file_name = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    return_record = relationship("IncomeTaxReturn", back_populates="attachments")


class AISReconciliation(Base):
    __tablename__ = "ais_reconciliation"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    financial_year = Column(String(9))
    
    # AIS Data (from Income Tax Portal)
    ais_total_income = Column(Float)
    ais_tds_credit = Column(Float)
    ais_advance_tax = Column(Float)
    
    # Reconciliation
    our_total_income = Column(Float)
    our_tds_credit = Column(Float)
    our_advance_tax = Column(Float)
    
    variance_income = Column(Float)
    variance_tds = Column(Float)
    variance_advance_tax = Column(Float)
    
    status = Column(String(20), default="Pending")  # Pending, Verified, Variance
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company")


# ============== AUDIT MODELS (PHASE 2) ==============

class AuditPlan(Base):
    __tablename__ = "audit_plans"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    audit_period = Column(String(9))  # 2023-24
    auditor_name = Column(String(255))
    audit_scope = Column(Text)
    start_date = Column(Date)
    end_date = Column(Date)
    status = Column(String(20), default="Planned")  # Planned, In Progress, Completed
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company")
    procedures = relationship("AuditProcedure", back_populates="plan")


class AuditProcedure(Base):
    __tablename__ = "audit_procedures"
    
    id = Column(Integer, primary_key=True)
    plan_id = Column(Integer, ForeignKey("audit_plans.id"), nullable=False)
    procedure_name = Column(String(255), nullable=False)
    description = Column(Text)
    estimated_hours = Column(Float)
    actual_hours = Column(Float)
    completion_percentage = Column(Float, default=0)
    status = Column(String(20), default="Not Started")  # Not Started, In Progress, Completed
    findings = Column(JSON)  # Array of findings
    created_at = Column(DateTime, default=datetime.utcnow)
    
    plan = relationship("AuditPlan", back_populates="procedures")


class FraudDetection(Base):
    __tablename__ = "fraud_detection"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    detection_type = Column(String(50))  # DuplicateInvoice, FakeGST, CircularTransaction, etc.
    entity_type = Column(String(50))  # Voucher, Invoice, Payment, etc.
    entity_id = Column(Integer)
    risk_score = Column(Float)  # 0-100
    risk_level = Column(String(20))  # Low, Medium, High, Critical
    
    # Details
    description = Column(Text)
    matched_records = Column(JSON)  # Related records
    recommendation = Column(Text)
    status = Column(String(20), default="Open")  # Open, Reviewed, Resolved
    
    reviewed_on = Column(Date)
    reviewed_by = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company")


# ============== COMPLIANCE MODELS (PHASE 3) ==============

class ComplianceDeadline(Base):
    __tablename__ = "compliance_deadlines"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    deadline_type = Column(String(50))  # GSTR-1, GSTR-3B, ITR, TDS, ROC, etc.
    due_date = Column(Date, nullable=False)
    financial_year = Column(String(9))
    month = Column(Integer)  # For monthly deadlines
    
    description = Column(Text)
    status = Column(String(20), default="Pending")  # Pending, Completed, Overdue, Waived
    completion_date = Column(Date)
    
    alert_days_before = Column(Integer, default=7)
    alert_sent = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company")


class RocFiling(Base):
    __tablename__ = "roc_filings"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    filing_type = Column(String(50))  # Annual Filing, Director KYC, etc.
    financial_year = Column(String(9))
    
    filing_date = Column(Date)
    due_date = Column(Date)
    status = Column(String(20), default="Not Filed")  # Not Filed, Filed, Approved, Rejected
    
    documents = Column(JSON)  # List of documents
    remarks = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company")


class DirectorKYC(Base):
    __tablename__ = "director_kyc"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    director_name = Column(String(255), nullable=False)
    din = Column(String(8), unique=True)
    pan = Column(String(10))
    aadhaar = Column(String(12))
    email = Column(String(255))
    phone = Column(String(20))
    address = Column(Text)
    
    kyc_status = Column(String(20), default="Pending")  # Pending, Verified, Rejected
    verified_on = Column(Date)
    documents = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company")


# ============== DOCUMENT MANAGEMENT MODELS (PHASE 3) ==============

class Document(Base):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    folder_id = Column(Integer, ForeignKey("document_folders.id"), nullable=True)
    document_type = Column(String(50))  # GST Certificate, PAN, TAN, MOA, AOA, etc.
    
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(255), nullable=False)
    file_size = Column(Integer)  # in bytes
    mime_type = Column(String(50))
    
    # OCR & Processing
    ocr_status = Column(String(20), default="Pending")  # Pending, Extracted, Verified
    extracted_data = Column(JSON)  # OCR extracted information
    
    document_number = Column(String(100))
    issue_date = Column(Date)
    expiry_date = Column(Date)
    
    tags = Column(JSON)  # Search tags
    is_archived = Column(Boolean, default=False)
    
    uploaded_by = Column(String(255))
    uploaded_on = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company")


class DocumentFolder(Base):
    __tablename__ = "document_folders"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    parent_id = Column(Integer, ForeignKey("document_folders.id"))
    folder_name = Column(String(255), nullable=False)
    description = Column(Text)
    created_by = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")
    parent = relationship("DocumentFolder", remote_side=[id])


class DocumentVersion(Base):
    __tablename__ = "document_versions"

    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(255), nullable=False)
    file_size = Column(Integer)
    mime_type = Column(String(50))
    change_notes = Column(Text)
    uploaded_by = Column(String(255))
    uploaded_on = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document")


class DocumentTag(Base):
    __tablename__ = "document_tags"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    tag_name = Column(String(100), nullable=False)
    tag_color = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")


class ExtractionAuditLog(Base):
    __tablename__ = "extraction_audit_logs"

    id = Column(Integer, primary_key=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    extraction_type = Column(String(50), nullable=False)
    provider = Column(String(50), default="local")
    status = Column(String(20), default="Pending")
    extracted_data = Column(JSON)
    confidence_score = Column(Float)
    error_message = Column(Text)
    processed_at = Column(DateTime, default=datetime.utcnow)

    document = relationship("Document")


# ============== WORKFLOW AUTOMATION MODELS (PHASE 3) ==============

class ApprovalWorkflow(Base):
    __tablename__ = "approval_workflows"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    workflow_name = Column(String(255), nullable=False)
    workflow_type = Column(String(50))  # PurchaseApproval, ExpenseApproval, VoucherApproval
    
    # Workflow Steps
    steps = Column(JSON)  # Array of approval steps
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company")


class ApprovalRequest(Base):
    __tablename__ = "approval_requests"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    workflow_id = Column(Integer, ForeignKey("approval_workflows.id"))
    
    entity_type = Column(String(50))  # Voucher, Invoice, Payment
    entity_id = Column(Integer)
    
    current_step = Column(Integer, default=0)
    approver = Column(String(255))
    
    status = Column(String(20), default="Pending")  # Pending, Approved, Rejected
    approval_date = Column(Date)
    comments = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company")


class WorkflowStage(Base):
    __tablename__ = "workflow_stages"

    id = Column(Integer, primary_key=True)
    workflow_id = Column(Integer, ForeignKey("approval_workflows.id"), nullable=False)
    stage_order = Column(Integer, nullable=False)
    stage_name = Column(String(255), nullable=False)
    approver_role = Column(String(100))
    approver_user_id = Column(Integer, ForeignKey("users.id"))
    conditions = Column(JSON)
    escalation_rules = Column(JSON)
    is_final_stage = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    workflow = relationship("ApprovalWorkflow")
    approver_user = relationship("User")


class WorkflowInstance(Base):
    __tablename__ = "workflow_instances"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    workflow_id = Column(Integer, ForeignKey("approval_workflows.id"), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(Integer, nullable=False)
    current_stage_id = Column(Integer, ForeignKey("workflow_stages.id"))
    status = Column(String(20), default="Pending")
    context_data = Column(JSON)
    initiated_by = Column(Integer, ForeignKey("users.id"))
    initiated_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

    company = relationship("Company")
    workflow = relationship("ApprovalWorkflow")
    current_stage = relationship("WorkflowStage")
    initiator = relationship("User")


class WorkflowHistory(Base):
    __tablename__ = "workflow_history"

    id = Column(Integer, primary_key=True)
    instance_id = Column(Integer, ForeignKey("workflow_instances.id"), nullable=False)
    stage_id = Column(Integer, ForeignKey("workflow_stages.id"))
    action = Column(String(30), nullable=False)
    actor_user_id = Column(Integer, ForeignKey("users.id"))
    comments = Column(Text)
    action_data = Column(JSON)
    acted_at = Column(DateTime, default=datetime.utcnow)

    instance = relationship("WorkflowInstance")
    stage = relationship("WorkflowStage")
    actor = relationship("User")


class WorkflowNotification(Base):
    __tablename__ = "workflow_notifications"

    id = Column(Integer, primary_key=True)
    instance_id = Column(Integer, ForeignKey("workflow_instances.id"), nullable=False)
    recipient_user_id = Column(Integer, ForeignKey("users.id"))
    channel = Column(String(30), default="InApp")
    subject = Column(String(255))
    message = Column(Text)
    status = Column(String(20), default="Pending")
    sent_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    instance = relationship("WorkflowInstance")
    recipient = relationship("User")


# ============== CA PRACTICE MANAGEMENT MODELS (PHASE 4) ==============

class CAClient(Base):
    __tablename__ = "ca_clients"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)  # CA's company
    
    client_name = Column(String(255), nullable=False)
    client_type = Column(String(50))  # Individual, Partnership, LLP, Company
    pan = Column(String(10), unique=True)
    gstin = Column(String(15))
    email = Column(String(255))
    phone = Column(String(20))
    address = Column(Text)
    
    # Engagement Details
    service_type = Column(JSON)  # Array of services: Accounting, GST, ITR, etc.
    engagement_date = Column(Date)
    status = Column(String(20), default="Active")  # Active, Inactive
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company")
    notices = relationship("CANotice", back_populates="client")
    tasks = relationship("CATask", back_populates="client")


class CANotice(Base):
    __tablename__ = "ca_notices"
    
    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("ca_clients.id"), nullable=False)
    
    notice_type = Column(String(50))  # GST Notice, IT Notice, ROC Notice
    notice_number = Column(String(50), unique=True)
    notice_date = Column(Date)
    received_date = Column(Date)
    due_date = Column(Date)
    
    subject = Column(Text)
    description = Column(Text)
    
    status = Column(String(20), default="Received")  # Received, In Progress, Resolved, Pending
    resolution_notes = Column(Text)
    resolved_on = Column(Date)
    
    attachments = Column(JSON)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    client = relationship("CAClient", back_populates="notices")


class CATask(Base):
    __tablename__ = "ca_tasks"
    
    id = Column(Integer, primary_key=True)
    client_id = Column(Integer, ForeignKey("ca_clients.id"), nullable=False)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    task_title = Column(String(255), nullable=False)
    description = Column(Text)
    task_type = Column(String(50))  # GSTR Filing, ITR Filing, Audit, etc.
    
    assigned_to = Column(String(255))
    due_date = Column(Date)
    priority = Column(String(20))  # Low, Medium, High, Urgent
    
    status = Column(String(20), default="Pending")  # Pending, In Progress, Completed, Overdue
    completion_date = Column(Date)
    notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company")
    client = relationship("CAClient", back_populates="tasks")


# ============== CLIENT PORTAL MODELS (PHASE 4) ==============

class ClientPortalUser(Base):
    __tablename__ = "client_portal_users"
    
    id = Column(Integer, primary_key=True)
    ca_client_id = Column(Integer, ForeignKey("ca_clients.id"), nullable=False)
    
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    phone = Column(String(20))
    
    access_level = Column(String(20), default="View")  # View, Upload, Submit
    is_active = Column(Boolean, default=True)
    
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


class ClientPortalDocument(Base):
    __tablename__ = "client_portal_documents"
    
    id = Column(Integer, primary_key=True)
    ca_client_id = Column(Integer, ForeignKey("ca_clients.id"), nullable=False)
    
    document_type = Column(String(50))
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(255), nullable=False)
    file_size = Column(Integer)
    
    uploaded_on = Column(DateTime, default=datetime.utcnow)
    uploaded_by = Column(String(255))
    
    status = Column(String(20), default="Pending Review")  # Pending Review, Received, Verified


class ClientPortalMessage(Base):
    __tablename__ = "client_portal_messages"

    id = Column(Integer, primary_key=True)
    ca_client_id = Column(Integer, ForeignKey("ca_clients.id"), nullable=False)
    sender_type = Column(String(20), nullable=False)  # Client, CA, System
    sender_name = Column(String(255))
    message = Column(Text, nullable=False)
    attachments = Column(JSON)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ClientPortalNotification(Base):
    __tablename__ = "client_portal_notifications"

    id = Column(Integer, primary_key=True)
    ca_client_id = Column(Integer, ForeignKey("ca_clients.id"), nullable=False)
    notification_type = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text)
    action_url = Column(String(255))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class ComplianceTracker(Base):
    __tablename__ = "compliance_tracker"
    
    id = Column(Integer, primary_key=True)
    ca_client_id = Column(Integer, ForeignKey("ca_clients.id"), nullable=False)
    
    task_name = Column(String(255), nullable=False)
    task_type = Column(String(50))  # GSTR, ITR, TDS, etc.
    financial_year = Column(String(9))
    
    due_date = Column(Date)
    completion_date = Column(Date)
    status = Column(String(20), default="Pending")  # Pending, Completed, Overdue
    
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)


class ComplianceTask(Base):
    __tablename__ = "compliance_tasks"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    task_name = Column(String(255), nullable=False)
    compliance_type = Column(String(50), nullable=False)
    entity_type = Column(String(50))
    entity_id = Column(Integer)
    financial_year = Column(String(9))
    period = Column(String(20))
    due_date = Column(Date)
    priority = Column(String(20), default="Medium")
    risk_level = Column(String(20), default="Low")
    status = Column(String(20), default="Pending")
    assigned_to = Column(String(255))
    completion_date = Column(Date)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")


class ComplianceNotice(Base):
    __tablename__ = "compliance_notices"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    notice_source = Column(String(50), nullable=False)
    notice_type = Column(String(50), nullable=False)
    notice_number = Column(String(100), unique=True)
    notice_date = Column(Date)
    due_date = Column(Date)
    subject = Column(Text)
    description = Column(Text)
    risk_level = Column(String(20), default="Medium")
    status = Column(String(20), default="Open")
    response_summary = Column(Text)
    resolved_on = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")


# ============== BUSINESS INTELLIGENCE MODELS (PHASE 4) ==============

class Dashboard(Base):
    __tablename__ = "dashboards"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    dashboard_name = Column(String(255), nullable=False)
    dashboard_type = Column(String(50))  # Executive, Accounting, GST, etc.
    
    widgets = Column(JSON)  # Array of widget configurations
    is_default = Column(Boolean, default=False)
    
    created_by = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company")


class FinancialMetric(Base):
    __tablename__ = "financial_metrics"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    metric_date = Column(Date, nullable=False)
    
    revenue = Column(Float)
    expenses = Column(Float)
    profit = Column(Float)
    cash_flow = Column(Float)
    working_capital = Column(Float)
    
    receivables = Column(Float)
    payables = Column(Float)
    inventory = Column(Float)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company")


# ============== GOVERNMENT INTEGRATION MODELS (PHASE 5) ==============

class GovernmentIntegration(Base):
    __tablename__ = "government_integrations"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    integration_type = Column(String(50))  # GST Portal, IT Portal, MCA, EPFO, ESIC
    username = Column(String(255))
    encrypted_password = Column(String(255))
    
    api_key = Column(String(255))
    is_active = Column(Boolean, default=False)
    
    last_sync = Column(DateTime)
    sync_status = Column(String(20), default="Not Connected")  # Connected, Error, Not Connected
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company")


class IntegrationSyncLog(Base):
    __tablename__ = "integration_sync_logs"

    id = Column(Integer, primary_key=True)
    integration_id = Column(Integer, ForeignKey("government_integrations.id"), nullable=False)
    sync_type = Column(String(50), nullable=False)
    direction = Column(String(20), default="Pull")
    status = Column(String(20), default="Pending")
    request_payload = Column(JSON)
    response_payload = Column(JSON)
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

    integration = relationship("GovernmentIntegration")


class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    provider = Column(String(50), nullable=False)
    event_type = Column(String(100), nullable=False)
    payload = Column(JSON)
    status = Column(String(20), default="Received")
    processed_at = Column(DateTime)
    error_message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")


# ============== AI MODELS (PHASE 5) ==============

class AIConversation(Base):
    __tablename__ = "ai_conversations"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    conversation_title = Column(String(255))
    context_type = Column(String(50))  # Accounting, GST, Tax, General
    
    messages = Column(JSON)  # Array of conversation messages
    
    started_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    company = relationship("Company")
    user = relationship("User")


class AIPrediction(Base):
    __tablename__ = "ai_predictions"
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    
    prediction_type = Column(String(50))  # CashFlow, Revenue, Expenses, TaxAmount
    period = Column(String(20))  # 3 months, 6 months, 12 months
    
    predicted_values = Column(JSON)  # Month-wise predictions
    actual_values = Column(JSON)  # Actual values when available
    accuracy_score = Column(Float)  # 0-100
    
    model_version = Column(String(20))
    generated_on = Column(DateTime, default=datetime.utcnow)
    
    company = relationship("Company")


class PromptTemplate(Base):
    __tablename__ = "prompt_templates"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    template_name = Column(String(255), nullable=False)
    provider = Column(String(50), default="OpenAI")
    model_name = Column(String(100))
    context_type = Column(String(50))
    prompt_text = Column(Text, nullable=False)
    variables = Column(JSON)
    version = Column(Integer, default=1)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")


class KnowledgeBase(Base):
    __tablename__ = "knowledge_base"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    title = Column(String(255), nullable=False)
    source_type = Column(String(50))
    source_id = Column(Integer)
    content = Column(Text)
    metadata_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")


class EmbeddingRecord(Base):
    __tablename__ = "embedding_records"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    knowledge_base_id = Column(Integer, ForeignKey("knowledge_base.id"))
    provider = Column(String(50), default="OpenAI")
    vector_store = Column(String(50), default="local")
    embedding_ref = Column(String(255))
    chunk_text = Column(Text)
    metadata_json = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")
    knowledge_item = relationship("KnowledgeBase")


class AIUsageLog(Base):
    __tablename__ = "ai_usage_logs"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    provider = Column(String(50), nullable=False)
    model_name = Column(String(100))
    feature_name = Column(String(100))
    prompt_tokens = Column(Integer, default=0)
    completion_tokens = Column(Integer, default=0)
    total_tokens = Column(Integer, default=0)
    estimated_cost = Column(Float, default=0)
    status = Column(String(20), default="Success")
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")
    user = relationship("User")


class AISuggestion(Base):
    __tablename__ = "ai_suggestions"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    suggestion_type = Column(String(50), nullable=False)
    entity_type = Column(String(50))
    entity_id = Column(Integer)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    recommendation = Column(Text)
    risk_score = Column(Float)
    status = Column(String(20), default="Open")
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")


class WhatsAppMessage(Base):
    __tablename__ = "whatsapp_messages"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    phone_number = Column(String(20), nullable=False)
    direction = Column(String(20), nullable=False)
    message_type = Column(String(30), default="Text")
    message_text = Column(Text)
    attachment_url = Column(String(255))
    processing_status = Column(String(20), default="Pending")
    processing_log = Column(JSON)
    received_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")


class VoiceCommand(Base):
    __tablename__ = "voice_commands"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    transcript = Column(Text, nullable=False)
    command_type = Column(String(50))
    parsed_payload = Column(JSON)
    action_status = Column(String(20), default="Parsed")
    result_payload = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")
    user = relationship("User")


class SecurityLog(Base):
    __tablename__ = "security_logs"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    event_type = Column(String(100), nullable=False)
    ip_address = Column(String(45))
    device_id = Column(String(100))
    user_agent = Column(Text)
    risk_level = Column(String(20), default="Low")
    details = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")
    user = relationship("User")


class DeviceRegistration(Base):
    __tablename__ = "device_registrations"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_id = Column(String(100), nullable=False)
    device_name = Column(String(255))
    device_type = Column(String(50))
    ip_address = Column(String(45))
    last_seen = Column(DateTime)
    is_trusted = Column(Boolean, default=False)
    is_blocked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class PermissionMatrix(Base):
    __tablename__ = "permission_matrix"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    role_name = Column(String(100), nullable=False)
    module_name = Column(String(100), nullable=False)
    permissions = Column(JSON)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    device_id = Column(String(100))
    ip_address = Column(String(45))
    user_agent = Column(Text)
    is_active = Column(Boolean, default=True)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime)

    user = relationship("User")


class TenantSubscription(Base):
    __tablename__ = "tenant_subscriptions"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    plan_name = Column(String(100), nullable=False)
    status = Column(String(20), default="Active")
    billing_cycle = Column(String(20), default="Monthly")
    seats = Column(Integer, default=1)
    starts_on = Column(Date, default=date.today)
    ends_on = Column(Date)
    feature_flags = Column(JSON)
    usage_limits = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")


class SaaSPlan(Base):
    __tablename__ = "saas_plans"

    id = Column(Integer, primary_key=True)
    plan_name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    monthly_price = Column(Float, default=0)
    annual_price = Column(Float, default=0)
    features = Column(JSON)
    limits = Column(JSON)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class FeatureFlag(Base):
    __tablename__ = "feature_flags"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    flag_key = Column(String(100), nullable=False)
    flag_value = Column(Boolean, default=False)
    rollout_rules = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")


class SystemHealthMetric(Base):
    __tablename__ = "system_health_metrics"

    id = Column(Integer, primary_key=True)
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, default=0)
    status = Column(String(20), default="Healthy")
    metadata_json = Column(JSON)
    recorded_at = Column(DateTime, default=datetime.utcnow)


class UsageMetric(Base):
    __tablename__ = "usage_metrics"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, default=0)
    period = Column(String(20))
    metadata_json = Column(JSON)
    recorded_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")


# ============== EXTENDED COMPANY MODELS ==============

class FinancialYear(Base):
    __tablename__ = "financial_years"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    label = Column(String(50))
    is_active = Column(Boolean, default=False)
    is_locked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")


class Branch(Base):
    __tablename__ = "branches"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String(255), nullable=False)
    code = Column(String(50))
    address = Column(Text)
    city = Column(String(100))
    state = Column(String(100))
    pincode = Column(String(10))
    phone = Column(String(20))
    email = Column(String(255))
    gstin = Column(String(15))
    is_head_office = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")


class CompanySetting(Base):
    __tablename__ = "company_settings"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False, unique=True)
    enable_multi_currency = Column(Boolean, default=False)
    enable_cost_centers = Column(Boolean, default=True)
    enable_profit_centers = Column(Boolean, default=True)
    enable_gst = Column(Boolean, default=True)
    enable_tds = Column(Boolean, default=True)
    enable_payroll = Column(Boolean, default=True)
    enable_inventory = Column(Boolean, default=True)
    enable_audit = Column(Boolean, default=True)
    default_gst_rate = Column(Float, default=18.0)
    invoice_prefix = Column(String(20), default="INV")
    voucher_prefix = Column(String(20), default="VCH")
    auto_voucher_numbering = Column(Boolean, default=True)
    rounding_method = Column(String(20), default="Nearest")  # Nearest, Up, Down
    email_notifications = Column(Boolean, default=True)
    sms_notifications = Column(Boolean, default=False)
    decimal_places = Column(Integer, default=2)
    base_currency = Column(String(3), default="INR")
    date_format = Column(String(20), default="DD/MM/YYYY")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company = relationship("Company", back_populates="settings")


class TwoFactorAuth(Base):
    __tablename__ = "two_factor_auth"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    totp_secret = Column(String(64), nullable=False)
    is_enabled = Column(Boolean, default=False)
    backup_codes = Column(JSON)
    enabled_at = Column(DateTime)
    last_used_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token_hash = Column(String(255), nullable=False, unique=True)
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime)
    ip_address = Column(String(45))
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class LoginAttempt(Base):
    __tablename__ = "login_attempts"

    id = Column(Integer, primary_key=True)
    email = Column(String(255), nullable=False, index=True)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    success = Column(Boolean, default=False)
    failure_reason = Column(String(100))
    attempted_at = Column(DateTime, default=datetime.utcnow, index=True)


# ============== EXTENDED INVENTORY MODELS ==============

class StockCategory(Base):
    __tablename__ = "stock_categories"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String(100), nullable=False)
    parent_id = Column(Integer, ForeignKey("stock_categories.id"))
    description = Column(Text)
    is_active = Column(Boolean, default=True)

    company = relationship("Company")
    parent = relationship("StockCategory", remote_side=[id])


class StockMovement(Base):
    __tablename__ = "stock_movements"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    stock_item_id = Column(Integer, ForeignKey("stock_items.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    movement_type = Column(String(20), nullable=False)  # IN, OUT, TRANSFER, ADJUST
    reference_type = Column(String(50))  # PurchaseOrder, SalesOrder, GRN, Adjustment
    reference_id = Column(Integer)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, default=0)
    total_value = Column(Float, default=0)
    movement_date = Column(Date, nullable=False)
    remarks = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")
    item = relationship("StockItem")
    warehouse = relationship("Warehouse")


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    po_number = Column(String(50), unique=True, nullable=False)
    po_date = Column(Date, nullable=False)
    expected_delivery = Column(Date)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    subtotal = Column(Float, default=0)
    tax_amount = Column(Float, default=0)
    total_amount = Column(Float, default=0)
    status = Column(String(20), default="Draft")  # Draft, Sent, Approved, Received, Cancelled
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company = relationship("Company")
    vendor = relationship("Vendor")
    warehouse = relationship("Warehouse")
    items = relationship("PurchaseOrderItem", back_populates="purchase_order", cascade="all, delete-orphan")


class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"

    id = Column(Integer, primary_key=True)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"), nullable=False)
    stock_item_id = Column(Integer, ForeignKey("stock_items.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    gst_rate = Column(Float, default=0)
    gst_amount = Column(Float, default=0)
    line_total = Column(Float, default=0)
    received_quantity = Column(Float, default=0)

    purchase_order = relationship("PurchaseOrder", back_populates="items")
    item = relationship("StockItem")


class GoodsReceiptNote(Base):
    __tablename__ = "goods_receipt_notes"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    grn_number = Column(String(50), unique=True, nullable=False)
    purchase_order_id = Column(Integer, ForeignKey("purchase_orders.id"))
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    grn_date = Column(Date, nullable=False)
    invoice_number = Column(String(100))
    invoice_date = Column(Date)
    total_amount = Column(Float, default=0)
    status = Column(String(20), default="Received")  # Received, Inspected, Accepted, Rejected
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")
    purchase_order = relationship("PurchaseOrder")
    vendor = relationship("Vendor")
    warehouse = relationship("Warehouse")
    items = relationship("GoodsReceiptNoteItem", back_populates="grn", cascade="all, delete-orphan")


class GoodsReceiptNoteItem(Base):
    __tablename__ = "goods_receipt_note_items"

    id = Column(Integer, primary_key=True)
    grn_id = Column(Integer, ForeignKey("goods_receipt_notes.id"), nullable=False)
    stock_item_id = Column(Integer, ForeignKey("stock_items.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    gst_rate = Column(Float, default=0)
    gst_amount = Column(Float, default=0)
    line_total = Column(Float, default=0)
    batch_number = Column(String(50))
    expiry_date = Column(Date)

    grn = relationship("GoodsReceiptNote", back_populates="items")
    item = relationship("StockItem")


class SalesOrder(Base):
    __tablename__ = "sales_orders"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id"), nullable=False)
    so_number = Column(String(50), unique=True, nullable=False)
    so_date = Column(Date, nullable=False)
    expected_delivery = Column(Date)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"))
    subtotal = Column(Float, default=0)
    tax_amount = Column(Float, default=0)
    total_amount = Column(Float, default=0)
    status = Column(String(20), default="Draft")
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    company = relationship("Company")
    customer = relationship("Customer")
    warehouse = relationship("Warehouse")
    items = relationship("SalesOrderItem", back_populates="sales_order", cascade="all, delete-orphan")


class SalesOrderItem(Base):
    __tablename__ = "sales_order_items"

    id = Column(Integer, primary_key=True)
    sales_order_id = Column(Integer, ForeignKey("sales_orders.id"), nullable=False)
    stock_item_id = Column(Integer, ForeignKey("stock_items.id"), nullable=False)
    quantity = Column(Float, nullable=False)
    unit_price = Column(Float, nullable=False)
    gst_rate = Column(Float, default=0)
    gst_amount = Column(Float, default=0)
    line_total = Column(Float, default=0)
    delivered_quantity = Column(Float, default=0)

    sales_order = relationship("SalesOrder", back_populates="items")
    item = relationship("StockItem")


# ============== EXTENDED PAYROLL MODELS ==============

class SalaryStructure(Base):
    __tablename__ = "salary_structures"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    basic_percent = Column(Float, default=40.0)
    hra_percent = Column(Float, default=50.0)  # of basic
    da_percent = Column(Float, default=0.0)  # of basic
    special_allowance_percent = Column(Float, default=10.0)
    pf_percent = Column(Float, default=12.0)  # of basic
    esi_percent = Column(Float, default=0.75)  # of gross
    professional_tax = Column(Float, default=200.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")


class PayrollComponent(Base):
    __tablename__ = "payroll_components"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String(100), nullable=False)
    component_type = Column(String(20), nullable=False)  # EARNING, DEDUCTION
    calculation_type = Column(String(20), default="FIXED")  # FIXED, PERCENTAGE, FORMULA
    value = Column(Float, default=0)
    is_taxable = Column(Boolean, default=True)
    is_statutory = Column(Boolean, default=False)  # PF, ESI, PT
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")


class LeaveType(Base):
    __tablename__ = "leave_types"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String(50), nullable=False)
    code = Column(String(10), nullable=False)
    days_per_year = Column(Float, default=0)
    is_paid = Column(Boolean, default=True)
    is_carry_forward = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    company = relationship("Company")


class LeaveBalance(Base):
    __tablename__ = "leave_balances"

    id = Column(Integer, primary_key=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    leave_type_id = Column(Integer, ForeignKey("leave_types.id"), nullable=False)
    year = Column(Integer, nullable=False)
    opening_balance = Column(Float, default=0)
    accrued = Column(Float, default=0)
    used = Column(Float, default=0)
    closing_balance = Column(Float, default=0)

    employee = relationship("Employee")
    leave_type = relationship("LeaveType")


class Holiday(Base):
    __tablename__ = "holidays"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String(100), nullable=False)
    holiday_date = Column(Date, nullable=False)
    is_optional = Column(Boolean, default=False)
    year = Column(Integer, nullable=False)

    company = relationship("Company")


# ============== TDS EXTENDED MODELS ==============

class TDSDeductee(Base):
    __tablename__ = "tds_deductees"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id"))
    deductee_name = Column(String(255), nullable=False)
    pan = Column(String(10), nullable=False)
    tan = Column(String(10))
    section_code = Column(String(10), nullable=False)  # 194J, 194C, etc.
    deductee_type = Column(String(20), default="Company")  # Individual, HUF, Company, NRI
    is_resident = Column(Boolean, default=True)
    address = Column(Text)
    email = Column(String(255))
    phone = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")
    vendor = relationship("Vendor")


class TDSChallan(Base):
    __tablename__ = "tds_challans"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    challan_number = Column(String(50), unique=True, nullable=False)
    bsr_code = Column(String(10))
    quarter = Column(String(5), nullable=False)  # Q1, Q2, Q3, Q4
    financial_year = Column(String(9), nullable=False)
    section_code = Column(String(10), nullable=False)
    amount_deposited = Column(Float, nullable=False)
    tax = Column(Float, default=0)
    surcharge = Column(Float, default=0)
    cess = Column(Float, default=0)
    interest = Column(Float, default=0)
    penalty = Column(Float, default=0)
    deposit_date = Column(Date, nullable=False)
    bank_name = Column(String(100))
    bank_branch = Column(String(100))
    status = Column(String(20), default="Deposited")
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")


class TDSDeduction(Base):
    __tablename__ = "tds_deductions"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    deductee_id = Column(Integer, ForeignKey("tds_deductees.id"), nullable=False)
    voucher_id = Column(Integer, ForeignKey("vouchers.id"))
    invoice_id = Column(Integer)
    section_code = Column(String(10), nullable=False)
    transaction_date = Column(Date, nullable=False)
    gross_amount = Column(Float, nullable=False)
    tds_rate = Column(Float, nullable=False)
    tds_amount = Column(Float, nullable=False)
    surcharge = Column(Float, default=0)
    cess = Column(Float, default=0)
    total_tds = Column(Float, nullable=False)
    pan_of_deductee = Column(String(10))
    deposited = Column(Boolean, default=False)
    challan_id = Column(Integer, ForeignKey("tds_challans.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")
    deductee = relationship("TDSDeductee")
    challan = relationship("TDSChallan")


class RecurringVoucher(Base):
    __tablename__ = "recurring_vouchers"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    template_name = Column(String(255), nullable=False)
    voucher_type = Column(String(50), nullable=False)
    frequency = Column(String(20), nullable=False)  # DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
    day_of_month = Column(Integer)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date)
    last_generated = Column(Date)
    next_due = Column(Date)
    template_data = Column(JSON)  # Voucher template with transactions
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")


class ExchangeRate(Base):
    __tablename__ = "exchange_rates"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    from_currency = Column(String(3), nullable=False)
    to_currency = Column(String(3), nullable=False)
    rate = Column(Float, nullable=False)
    effective_date = Column(Date, nullable=False)
    source = Column(String(50), default="manual")

    company = relationship("Company")


# ============== GST EXTENDED MODELS ==============

class GSTRate(Base):
    __tablename__ = "gst_rates"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    hsn_sac_code = Column(String(20), nullable=False)
    description = Column(Text)
    cgst_rate = Column(Float, default=0)
    sgst_rate = Column(Float, default=0)
    igst_rate = Column(Float, default=0)
    cess_rate = Column(Float, default=0)
    effective_from = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True)

    company = relationship("Company")


class GSTTransaction(Base):
    __tablename__ = "gst_transactions"

    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    invoice_id = Column(Integer, ForeignKey("invoices.id"))
    transaction_type = Column(String(20), nullable=False)  # OUTPUT, INPUT, INPUT_REVERSE
    party_gstin = Column(String(15))
    party_name = Column(String(255))
    invoice_number = Column(String(100))
    invoice_date = Column(Date, nullable=False)
    taxable_value = Column(Float, default=0)
    cgst_amount = Column(Float, default=0)
    sgst_amount = Column(Float, default=0)
    igst_amount = Column(Float, default=0)
    cess_amount = Column(Float, default=0)
    is_taxable = Column(Boolean, default=True)
    is_statutory = Column(Boolean, default=False)  # PF, ESI, PT
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    company = relationship("Company")



# ============== AUTH & SECURITY EXTENDED MODELS ==============

class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    token_hash = Column(String(255), nullable=False, unique=True)
    expires_at = Column(DateTime, nullable=False)
    verified_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")
