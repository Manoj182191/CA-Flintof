"""
Pydantic schemas for request/response validation
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime, date

# ============== USER SCHEMAS ==============

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ============== COMPANY SCHEMAS ==============

class CompanyBase(BaseModel):
    name: str
    legal_name: Optional[str] = None
    pan: Optional[str] = None
    gstin: Optional[str] = None
    business_type: Optional[str] = None
    currency: str = "INR"
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyResponse(CompanyBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# ============== LEDGER SCHEMAS ==============

class LedgerGroupBase(BaseModel):
    name: str
    group_type: str

class LedgerGroupCreate(LedgerGroupBase):
    company_id: int

class LedgerGroupResponse(LedgerGroupBase):
    id: int
    company_id: int
    
    class Config:
        from_attributes = True

class LedgerBase(BaseModel):
    name: str = Field(..., min_length=1)
    alias: Optional[str] = None
    opening_balance: float = Field(default=0, ge=0)

class LedgerCreate(LedgerBase):
    company_id: int
    group_id: int

class LedgerResponse(LedgerBase):
    id: int
    company_id: int
    group_id: int
    is_active: bool
    
    class Config:
        from_attributes = True

# ============== VOUCHER SCHEMAS ==============

class TransactionBase(BaseModel):
    ledger_id: int
    debit_amount: float = Field(default=0, ge=0)
    credit_amount: float = Field(default=0, ge=0)
    narration: Optional[str] = None

class TransactionCreate(TransactionBase):
    pass

class TransactionResponse(TransactionBase):
    id: int
    voucher_id: int
    
    class Config:
        from_attributes = True

class VoucherBase(BaseModel):
    voucher_type: str
    voucher_date: date
    description: Optional[str] = None
    narration: Optional[str] = None

class VoucherCreate(VoucherBase):
    company_id: int
    transactions: List[TransactionCreate]

class VoucherResponse(VoucherBase):
    id: int
    voucher_number: str
    company_id: int
    total_debit: float
    total_credit: float
    is_posted: bool
    created_at: datetime
    transactions: List[TransactionResponse] = []
    
    class Config:
        from_attributes = True

# ============== CUSTOMER SCHEMAS ==============

class CustomerBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    gstin: Optional[str] = None
    billing_address: Optional[str] = None

class CustomerCreate(CustomerBase):
    company_id: int

class CustomerResponse(CustomerBase):
    id: int
    company_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============== INVOICE SCHEMAS ==============

class InvoiceLineItemBase(BaseModel):
    description: str = Field(..., min_length=1)
    quantity: float = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)
    gst_rate: float = Field(default=0, ge=0)

class InvoiceLineItemCreate(InvoiceLineItemBase):
    pass

class InvoiceLineItemResponse(InvoiceLineItemBase):
    id: int
    gst_amount: float
    line_total: float
    
    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    customer_id: int
    invoice_date: date
    due_date: Optional[date] = None
    notes: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    company_id: int
    line_items: List[InvoiceLineItemCreate]

class InvoiceResponse(InvoiceBase):
    id: int
    company_id: int
    invoice_number: str
    subtotal: float
    tax_amount: float
    total_amount: float
    paid_amount: float
    status: str
    created_at: datetime
    line_items: List[InvoiceLineItemResponse] = []
    
    class Config:
        from_attributes = True

# ============== INVENTORY SCHEMAS ==============

class WarehouseBase(BaseModel):
    name: str = Field(..., min_length=1)
    code: Optional[str] = None
    location: Optional[str] = None
    manager_id: Optional[int] = None

class WarehouseCreate(WarehouseBase):
    pass

class WarehouseResponse(WarehouseBase):
    id: int
    company_id: int
    
    class Config:
        from_attributes = True

class StockCategoryBase(BaseModel):
    name: str = Field(..., min_length=1)
    parent_id: Optional[int] = None
    description: Optional[str] = None
    is_active: bool = True

class StockCategoryCreate(StockCategoryBase):
    pass

class StockCategoryResponse(StockCategoryBase):
    id: int
    company_id: int
    
    class Config:
        from_attributes = True

class StockItemBase(BaseModel):
    item_code: str = Field(..., min_length=1)
    item_name: str = Field(..., min_length=1)
    description: Optional[str] = None
    unit: Optional[str] = None
    purchase_price: Optional[float] = Field(None, ge=0)
    selling_price: Optional[float] = Field(None, ge=0)
    hsn_code: Optional[str] = None
    gst_rate: float = Field(default=0, ge=0)
    reorder_level: float = Field(default=0, ge=0)

class StockItemCreate(StockItemBase):
    category_id: Optional[int] = None

class StockItemResponse(StockItemBase):
    id: int
    company_id: int
    category_id: Optional[int] = None
    quantity_on_hand: float
    
    class Config:
        from_attributes = True

class StockMovementBase(BaseModel):
    stock_item_id: int
    warehouse_id: Optional[int] = None
    movement_type: str
    quantity: float
    unit_price: float = 0
    reference_type: Optional[str] = None
    reference_id: Optional[int] = None
    movement_date: date
    remarks: Optional[str] = None

class StockMovementCreate(StockMovementBase):
    pass

class StockMovementResponse(StockMovementBase):
    id: int
    company_id: int
    total_value: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrderItemBase(BaseModel):
    stock_item_id: int
    quantity: float = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)
    gst_rate: float = Field(default=0, ge=0)

class PurchaseOrderCreate(BaseModel):
    vendor_id: int
    po_number: str
    po_date: date
    expected_delivery: Optional[date] = None
    warehouse_id: Optional[int] = None
    notes: Optional[str] = None
    items: List[OrderItemBase]

class PurchaseOrderResponse(BaseModel):
    id: int
    company_id: int
    vendor_id: int
    po_number: str
    po_date: date
    status: str
    subtotal: float
    tax_amount: float
    total_amount: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class SalesOrderCreate(BaseModel):
    customer_id: int
    so_number: str
    so_date: date
    expected_delivery: Optional[date] = None
    warehouse_id: Optional[int] = None
    notes: Optional[str] = None
    items: List[OrderItemBase]

class SalesOrderResponse(BaseModel):
    id: int
    company_id: int
    customer_id: int
    so_number: str
    so_date: date
    status: str
    subtotal: float
    tax_amount: float
    total_amount: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class GRNItemBase(BaseModel):
    stock_item_id: int
    quantity: float = Field(..., gt=0)
    unit_price: float = Field(..., ge=0)
    gst_rate: float = Field(default=0, ge=0)
    batch_number: Optional[str] = None
    expiry_date: Optional[date] = None

class GRNCreate(BaseModel):
    grn_number: str
    vendor_id: int
    purchase_order_id: Optional[int] = None
    warehouse_id: Optional[int] = None
    grn_date: date
    invoice_number: Optional[str] = None
    invoice_date: Optional[date] = None
    notes: Optional[str] = None
    items: List[GRNItemBase]

class GRNResponse(BaseModel):
    id: int
    company_id: int
    grn_number: str
    status: str
    total_amount: float
    created_at: datetime
    
    class Config:
        from_attributes = True

# ============== BANK SCHEMAS ==============

class BankAccountBase(BaseModel):
    bank_name: str
    account_number: str
    ifsc_code: Optional[str] = None
    account_holder: Optional[str] = None

class BankAccountCreate(BankAccountBase):
    company_id: int
    opening_balance: float = Field(default=0, ge=0)

class BankAccountResponse(BankAccountBase):
    id: int
    company_id: int
    current_balance: float
    
    class Config:
        from_attributes = True

class BankTransactionBase(BaseModel):
    transaction_date: date
    description: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0)
    transaction_type: str

class BankTransactionCreate(BankTransactionBase):
    bank_account_id: int

class BankTransactionResponse(BankTransactionBase):
    id: int
    bank_account_id: int
    is_reconciled: bool
    
    class Config:
        from_attributes = True

# ============== GST SCHEMAS ==============

class GSTReturnBase(BaseModel):
    return_type: str
    month: int
    year: int

class GSTReturnCreate(GSTReturnBase):
    company_id: int

class GSTReturnResponse(GSTReturnBase):
    id: int
    company_id: int
    filing_date: Optional[date] = None
    status: str
    
    class Config:
        from_attributes = True
