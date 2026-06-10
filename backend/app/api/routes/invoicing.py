"""
Invoicing and Sales routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.base import get_db
from app.models.models import Invoice, InvoiceLineItem, Customer, Company
from app.schemas.schemas import InvoiceCreate, InvoiceResponse
from typing import List
from datetime import datetime

router = APIRouter(prefix="/api/invoices", tags=["invoicing"])

@router.post("/", response_model=InvoiceResponse)
def create_invoice(
    invoice_data: InvoiceCreate,
    db: Session = Depends(get_db)
):
    """Create a new invoice"""
    
    # Verify company and customer exist
    company = db.query(Company).filter(Company.id == invoice_data.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    customer = db.query(Customer).filter(Customer.id == invoice_data.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Generate invoice number
    last_invoice = db.query(Invoice).filter(
        Invoice.company_id == invoice_data.company_id
    ).order_by(Invoice.id.desc()).first()
    
    invoice_num = (last_invoice.invoice_number if last_invoice else "INV-0")
    next_num = int(invoice_num.split("-")[-1]) + 1 if "-" in invoice_num else 1
    invoice_number = f"INV-{next_num}"
    
    # Calculate totals
    subtotal = 0
    tax_amount = 0
    
    invoice = Invoice(
        company_id=invoice_data.company_id,
        customer_id=invoice_data.customer_id,
        invoice_number=invoice_number,
        invoice_date=invoice_data.invoice_date,
        due_date=invoice_data.due_date,
        notes=invoice_data.notes,
        status="Draft"
    )
    
    db.add(invoice)
    db.flush()
    
    # Add line items and calculate totals
    for item_data in invoice_data.line_items:
        line_total = item_data.quantity * item_data.unit_price
        gst_amount = (line_total * item_data.gst_rate) / 100
        
        line_item = InvoiceLineItem(
            invoice_id=invoice.id,
            description=item_data.description,
            quantity=item_data.quantity,
            unit_price=item_data.unit_price,
            gst_rate=item_data.gst_rate,
            gst_amount=gst_amount,
            line_total=line_total + gst_amount
        )
        
        db.add(line_item)
        subtotal += line_total
        tax_amount += gst_amount
    
    invoice.subtotal = subtotal
    invoice.tax_amount = tax_amount
    invoice.total_amount = subtotal + tax_amount
    
    db.commit()
    db.refresh(invoice)
    
    return invoice

@router.get("/", response_model=List[InvoiceResponse])
def list_invoices(
    company_id: int,
    status: str = None,
    db: Session = Depends(get_db)
):
    """List invoices for a company"""
    query = db.query(Invoice).filter(Invoice.company_id == company_id)
    
    if status:
        query = query.filter(Invoice.status == status)
    
    return query.all()

@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db)
):
    """Get invoice by ID"""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    return invoice

@router.post("/{invoice_id}/send")
def send_invoice(
    invoice_id: int,
    db: Session = Depends(get_db)
):
    """Send invoice (mark as sent)"""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice.status = "Sent"
    db.commit()
    
    return {"message": "Invoice sent successfully"}

@router.post("/{invoice_id}/pay")
def pay_invoice(
    invoice_id: int,
    amount: float,
    db: Session = Depends(get_db)
):
    """Record payment for invoice"""
    invoice = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    
    invoice.paid_amount += amount
    
    if invoice.paid_amount >= invoice.total_amount:
        invoice.status = "Paid"
    
    db.commit()
    
    return {"message": "Payment recorded", "remaining": invoice.total_amount - invoice.paid_amount}

@router.get("/{company_id}/aging-report")
def get_aging_report(
    company_id: int,
    db: Session = Depends(get_db)
):
    """Get aging report for invoices"""
    invoices = db.query(Invoice).filter(
        Invoice.company_id == company_id,
        Invoice.status != "Paid"
    ).all()
    
    aging = {
        "current": [],
        "30_days": [],
        "60_days": [],
        "90_days": [],
        "over_90_days": []
    }
    
    today = datetime.now().date()
    
    for invoice in invoices:
        days_overdue = (today - invoice.invoice_date).days
        pending = invoice.total_amount - invoice.paid_amount
        
        inv_data = {
            "invoice_number": invoice.invoice_number,
            "customer": invoice.customer.name,
            "amount": pending,
            "days": days_overdue
        }
        
        if days_overdue <= 30:
            aging["current"].append(inv_data)
        elif days_overdue <= 60:
            aging["30_days"].append(inv_data)
        elif days_overdue <= 90:
            aging["60_days"].append(inv_data)
        elif days_overdue <= 120:
            aging["90_days"].append(inv_data)
        else:
            aging["over_90_days"].append(inv_data)
    
    return aging
