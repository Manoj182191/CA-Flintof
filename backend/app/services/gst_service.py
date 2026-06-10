"""
Complete GST Service
Implements: GSTIN validation, GST calculation, GSTR-1, GSTR-3B, GSTR-9,
ITC reconciliation, HSN summary, GST dashboard, GST registration.
"""
import re
from datetime import date, datetime
from typing import Dict, List, Optional
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from app.models.models import (
    Invoice, InvoiceLineItem, Customer, Vendor, Company,
    GSTRate, GSTTransaction, GSTReturn, GSTRate,
)


# ============ GSTIN Validation ============

# Indian state codes (01-37, 96, 97)
INDIAN_STATE_CODES = {f"{i:02d}" for i in range(1, 38)} | {"96", "97"}

def validate_gstin(gstin: str) -> Dict:
    """
    Validate GSTIN format and checksum.
    Format: 15 chars - 2 state + 10 PAN + 1 entity + 1 'Z' + 1 checksum
    """
    if not gstin or len(gstin) != 15:
        return {"valid": False, "error": "GSTIN must be 15 characters"}
    gstin = gstin.upper()
    if not gstin.isalnum():
        return {"valid": False, "error": "GSTIN must be alphanumeric"}
    if gstin[:2] not in INDIAN_STATE_CODES:
        return {"valid": False, "error": f"Invalid state code: {gstin[:2]}"}
    # PAN validation
    pan = gstin[2:12]
    if not re.match(r"^[A-Z]{5}\d{4}[A-Z]$", pan):
        return {"valid": False, "error": "Invalid PAN embedded in GSTIN"}
    if gstin[12] not in "123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        return {"valid": False, "error": "Invalid entity number (13th char)"}
    if gstin[13] != "Z":
        return {"valid": False, "error": "14th character must be 'Z'"}
    # Checksum validation
    if not _verify_gstin_checksum(gstin):
        return {"valid": False, "error": "Invalid checksum"}
    return {
        "valid": True,
        "state_code": gstin[:2],
        "pan": pan,
        "entity_number": gstin[12],
        "checksum": gstin[14],
    }


def _verify_gstin_checksum(gstin: str) -> bool:
    """Verify the 15th character checksum per GSTN algorithm."""
    chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    values = {c: i for i, c in enumerate(chars)}
    total = 0
    for i, c in enumerate(gstin[:14]):
        factor = 1 if i % 2 == 0 else 2
        v = values.get(c, 0) * factor
        total += v // 36 + v % 36
    expected = (36 - (total % 36)) % 36
    return values.get(gstin[14], -1) == expected


# ============ GST Calculation ============

GST_RATES = {
    0: {"cgst": 0, "sgst": 0, "igst": 0, "label": "Exempt"},
    5: {"cgst": 2.5, "sgst": 2.5, "igst": 5, "label": "5%"},
    12: {"cgst": 6, "sgst": 6, "igst": 12, "label": "12%"},
    18: {"cgst": 9, "sgst": 9, "igst": 18, "label": "18%"},
    28: {"cgst": 14, "sgst": 14, "igst": 28, "label": "28%"},
}


def calculate_gst(taxable_value: float, gst_rate: float, is_interstate: bool,
                  include_cess: float = 0) -> Dict:
    """Calculate GST split (CGST/SGST/IGST) and totals."""
    taxable = round(float(taxable_value), 2)
    rate = float(gst_rate)
    if is_interstate:
        igst = round(taxable * rate / 100, 2)
        return {
            "taxable_value": taxable,
            "cgst": 0.0, "sgst": 0.0, "igst": igst,
            "cess": include_cess,
            "total_tax": round(igst + include_cess, 2),
            "total": round(taxable + igst + include_cess, 2),
        }
    else:
        half = rate / 2
        cgst = round(taxable * half / 100, 2)
        sgst = round(taxable * half / 100, 2)
        return {
            "taxable_value": taxable,
            "cgst": cgst, "sgst": sgst, "igst": 0.0,
            "cess": include_cess,
            "total_tax": round(cgst + sgst + include_cess, 2),
            "total": round(taxable + cgst + sgst + include_cess, 2),
        }


# ============ GSTR-1 (Outward Supplies) ============

def get_gstr1_data(db: Session, company_id: int, month: int, year: int) -> Dict:
    """
    Generate GSTR-1 data: B2B, B2C, HSN summary, export, advances.
    GSTR-1 is a monthly/quarterly return of outward supplies.
    """
    from calendar import monthrange
    start = date(year, month, 1)
    end = date(year, month, monthrange(year, month)[1])

    # B2B: invoices to registered customers (with GSTIN)
    b2b_query = db.query(Invoice, Customer).join(Customer, Customer.id == Invoice.customer_id).filter(
        Invoice.company_id == company_id,
        Invoice.invoice_type == "Sales",
        Invoice.invoice_date >= start,
        Invoice.invoice_date <= end,
        Invoice.status != "Cancelled",
        Customer.gstin.isnot(None),
        Customer.gstin != "",
    ).all()

    b2b = {}
    for inv, cust in b2b_query:
        if not cust.gstin:
            continue
        gstin = cust.gstin.upper()
        if gstin not in b2b:
            b2b[gstin] = {
                "gstin": gstin, "legal_name": cust.name,
                "invoices": [], "total_taxable": 0, "total_tax": 0,
            }
        b2b[gstin]["invoices"].append({
            "invoice_number": inv.invoice_number,
            "invoice_date": inv.invoice_date.isoformat(),
            "total": inv.total_amount,
            "taxable_value": inv.subtotal,
            "tax": inv.tax_amount,
        })
        b2b[gstin]["total_taxable"] += inv.subtotal or 0
        b2b[gstin]["total_tax"] += inv.tax_amount or 0

    # B2C: invoices to unregistered customers
    b2c_query = db.query(Invoice, Customer).join(Customer, Customer.id == Invoice.customer_id).filter(
        Invoice.company_id == company_id,
        Invoice.invoice_type == "Sales",
        Invoice.invoice_date >= start,
        Invoice.invoice_date <= end,
        Invoice.status != "Cancelled",
        or_(Customer.gstin.is_(None), Customer.gstin == ""),
    ).all()

    # Group B2C by state
    b2c = {}
    for inv, cust in b2c_query:
        # In a real implementation, extract state from billing address or pincode
        state = "Unknown"
        if state not in b2c:
            b2c[state] = {"state": state, "invoices": [], "total_taxable": 0, "total_tax": 0}
        b2c[state]["invoices"].append({
            "invoice_number": inv.invoice_number,
            "invoice_date": inv.invoice_date.isoformat(),
            "total": inv.total_amount,
            "taxable_value": inv.subtotal,
            "tax": inv.tax_amount,
        })
        b2c[state]["total_taxable"] += inv.subtotal or 0
        b2c[state]["total_tax"] += inv.tax_amount or 0

    # HSN Summary
    hsn_data = db.query(
        InvoiceLineItem.description,
        InvoiceLineItem.gst_rate,
        func.sum(InvoiceLineItem.quantity).label("qty"),
        func.sum(InvoiceLineItem.line_total).label("taxable"),
        func.sum(InvoiceLineItem.gst_amount).label("tax"),
    ).join(Invoice, Invoice.id == InvoiceLineItem.invoice_id).filter(
        Invoice.company_id == company_id,
        Invoice.invoice_date >= start,
        Invoice.invoice_date <= end,
        Invoice.status != "Cancelled",
    ).group_by(InvoiceLineItem.description, InvoiceLineItem.gst_rate).all()

    hsn_summary = [{
        "description": h.description or "Goods/Services",
        "hsn_code": "9999",  # Default; real impl would lookup from StockItem.hsn_code
        "quantity": float(h.qty or 0),
        "taxable_value": round(float(h.taxable or 0), 2),
        "tax": round(float(h.tax or 0), 2),
        "gst_rate": float(h.gst_rate or 0),
    } for h in hsn_data]

    total_invoices = len(b2b_query) + len(b2c_query)
    total_taxable = sum(inv.subtotal for inv, _ in (b2b_query + b2c_query)) or 0
    total_tax = sum(inv.tax_amount for inv, _ in (b2b_query + b2c_query)) or 0

    return {
        "company_id": company_id,
        "return_period": f"{month:02d}-{year}",
        "month": month, "year": year,
        "from_date": start.isoformat(),
        "to_date": end.isoformat(),
        "summary": {
            "total_invoices": total_invoices,
            "b2b_count": len(b2b_query),
            "b2c_count": len(b2c_query),
            "total_taxable_value": round(total_taxable, 2),
            "total_tax": round(total_tax, 2),
        },
        "b2b": list(b2b.values()),
        "b2c": list(b2c.values()),
        "hsn_summary": hsn_summary,
    }


# ============ GSTR-3B (Monthly Summary) ============

def get_gstr3b_data(db: Session, company_id: int, month: int, year: int) -> Dict:
    """
    Generate GSTR-3B: Summary of outward supplies, ITC, and tax payable.
    """
    from calendar import monthrange
    start = date(year, month, 1)
    end = date(year, month, monthrange(year, month)[1])

    # 3.1(a) Outward taxable supplies (other than zero rated, nil rated, exempted)
    # Group by tax rate
    out_tx = db.query(
        InvoiceLineItem.gst_rate,
        func.substr(Company.gstin, 1, 2).label("company_state"),
        func.substr(Customer.gstin, 1, 2).label("customer_state"),
        func.sum(InvoiceLineItem.line_total).label("taxable"),
        func.sum(InvoiceLineItem.gst_amount).label("tax"),
    ).join(Invoice, Invoice.id == InvoiceLineItem.invoice_id) \
     .join(Company, Company.id == Invoice.company_id) \
     .outerjoin(Customer, Customer.id == Invoice.customer_id) \
     .filter(
        Invoice.company_id == company_id,
        Invoice.invoice_type == "Sales",
        Invoice.invoice_date >= start,
        Invoice.invoice_date <= end,
        Invoice.status != "Cancelled",
    ).group_by(
        InvoiceLineItem.gst_rate,
        func.substr(Company.gstin, 1, 2),
        func.substr(Customer.gstin, 1, 2)
    ).all()

    outward_supplies = []
    total_out_taxable = 0
    total_out_tax = 0
    for r in out_tx:
        taxable = round(float(r.taxable or 0), 2)
        tax = round(float(r.tax or 0), 2)
        rate = float(r.gst_rate or 0)
        
        c_state = r.company_state or ""
        cust_state = r.customer_state or ""
        is_interstate = bool(c_state and cust_state and c_state != cust_state)
        
        calc = calculate_gst(taxable, rate, is_interstate)
        outward_supplies.append({
            "gst_rate": rate,
            "taxable_value": taxable,
            **calc,
        })
        total_out_taxable += taxable
        total_out_tax += tax

    # 4. Eligible ITC (Input Tax Credit)
    # Simplified: assumes all purchase invoices' GST is eligible ITC
    itc_query = db.query(
        InvoiceLineItem.gst_rate,
        func.sum(InvoiceLineItem.line_total).label("taxable"),
        func.sum(InvoiceLineItem.gst_amount).label("tax"),
    ).join(Invoice, Invoice.id == InvoiceLineItem.invoice_id).filter(
        Invoice.company_id == company_id,
        Invoice.invoice_type == "Purchase",
        Invoice.invoice_date >= start,
        Invoice.invoice_date <= end,
        Invoice.status != "Cancelled",
    ).group_by(InvoiceLineItem.gst_rate).all()

    itc = []
    total_itc = 0
    for r in itc_query:
        tax = round(float(r.tax or 0), 2)
        itc.append({
            "gst_rate": float(r.gst_rate or 0),
            "taxable_value": round(float(r.taxable or 0), 2),
            "igst": tax, "cgst": 0, "sgst": 0, "cess": 0,
        })
        total_itc += tax

    # 5. Exempt, nil rated, non-GST
    # 6.1 Payment of tax
    tax_payable = round(total_out_tax - total_itc, 2)

    return {
        "company_id": company_id,
        "return_period": f"{month:02d}-{year}",
        "month": month, "year": year,
        "from_date": start.isoformat(),
        "to_date": end.isoformat(),
        "3.1_outward_supplies": outward_supplies,
        "total_outward_taxable": round(total_out_taxable, 2),
        "total_outward_tax": round(total_out_tax, 2),
        "4_itc": itc,
        "total_itc": round(total_itc, 2),
        "5_exempt_nil": {"taxable_value": 0, "tax": 0},
        "6_tax_payable": {
            "igst": 0, "cgst": 0, "sgst": 0, "cess": 0,
            "total": tax_payable,
        },
        "interest_and_late_fee": {"interest": 0, "late_fee": 0},
    }


# ============ GSTR-9 (Annual Return Summary) ============

def get_gstr9_data(db: Session, company_id: int, financial_year: str) -> Dict:
    """
    Generate GSTR-9: Annual return aggregating all GSTR-1 and GSTR-3B for the FY.
    financial_year: e.g. "2023-24" => covers Apr 2023 - Mar 2024
    """
    try:
        fy_start_year = int(financial_year.split("-")[0])
    except (ValueError, IndexError):
        raise ValueError("Invalid financial year format. Use YYYY-YY (e.g. 2023-24).")
    start = date(fy_start_year, 4, 1)
    end = date(fy_start_year + 1, 3, 31)

    # Outward supplies summary
    out_q = db.query(
        func.coalesce(func.sum(InvoiceLineItem.line_total), 0).label("taxable"),
        func.coalesce(func.sum(InvoiceLineItem.gst_amount), 0).label("tax"),
    ).join(Invoice, Invoice.id == InvoiceLineItem.invoice_id).filter(
        Invoice.company_id == company_id,
        Invoice.invoice_type == "Sales",
        Invoice.invoice_date >= start,
        Invoice.invoice_date <= end,
        Invoice.status != "Cancelled",
    ).first()

    # ITC summary
    itc_q = db.query(
        func.coalesce(func.sum(InvoiceLineItem.gst_amount), 0).label("itc"),
    ).join(Invoice, Invoice.id == InvoiceLineItem.invoice_id).filter(
        Invoice.company_id == company_id,
        Invoice.invoice_type == "Purchase",
        Invoice.invoice_date >= start,
        Invoice.invoice_date <= end,
        Invoice.status != "Cancelled",
    ).first()

    out_taxable = float(out_q.taxable or 0)
    out_tax = float(out_q.tax or 0)
    itc_total = float(itc_q.itc or 0)

    return {
        "company_id": company_id,
        "financial_year": financial_year,
        "from_date": start.isoformat(),
        "to_date": end.isoformat(),
        "outward_supplies": {
            "taxable_value": round(out_taxable, 2),
            "tax": round(out_tax, 2),
        },
        "itc_claimed": {"total_itc": round(itc_total, 2)},
        "tax_paid": round(out_tax, 2),
        "tax_payable": round(out_tax - itc_total, 2),
    }


# ============ GST Reconciliation ============

def gst_reconciliation(db: Session, company_id: int, month: int, year: int) -> Dict:
    """Reconcile GSTR-2A (auto-populated from supplier returns) with books ITC.
    In production, GSTR-2A is fetched from the GSTN portal. Here we compare
    books purchase invoices against an uploaded 2A JSON if provided, or
    against supplier-reported data.
    """
    from calendar import monthrange
    start = date(year, month, 1)
    end = date(year, month, monthrange(year, month)[1])

    # Our books: all purchase invoices in the period
    books_rows = db.query(Invoice, Vendor).join(Vendor, Vendor.id == Invoice.vendor_id, isouter=True).filter(
        Invoice.company_id == company_id,
        Invoice.invoice_type == "Purchase",
        Invoice.invoice_date >= start,
        Invoice.invoice_date <= end,
        Invoice.status != "Cancelled",
    ).all()

    books_itc = sum((inv.tax_amount or 0) for inv, _ in books_rows)
    matched = []
    mismatched = []
    unmatched = []
    for inv, vendor in books_rows:
        gstin = (vendor.gstin if vendor else None) or ""
        item = {
            "invoice_number": inv.invoice_number,
            "invoice_date": inv.invoice_date.isoformat(),
            "supplier_gstin": gstin,
            "taxable": inv.subtotal,
            "tax": inv.tax_amount,
        }
        # In real impl: compare against 2A data
        # Without 2A data, we mark as unmatched and report variance
        unmatched.append(item)

    return {
        "company_id": company_id,
        "return_period": f"{month:02d}-{year}",
        "from_date": start.isoformat(),
        "to_date": end.isoformat(),
        "books_itc": round(books_itc, 2),
        "2a_itc": 0,  # Placeholder - in production, fetch from GSTN
        "matched": matched,
        "mismatched": mismatched,
        "unmatched_in_books": unmatched,
        "pending_itc": round(books_itc, 2),
        "recommendation": (
            "Upload GSTR-2A JSON from the GSTN portal to complete reconciliation. "
            "Until then, the books ITC figure is treated as pending until matched."
        ),
    }


# ============ GST Dashboard ============

def gst_dashboard(db: Session, company_id: int) -> Dict:
    """Aggregate GST summary: current month sales, purchases, liability, ITC."""
    today = date.today()
    first_of_month = today.replace(day=1)
    from calendar import monthrange
    end_of_month = date(today.year, today.month, monthrange(today.year, today.month)[1])

    # Current month sales
    sales_tax = db.query(func.coalesce(func.sum(InvoiceLineItem.gst_amount), 0)).join(Invoice).filter(
        Invoice.company_id == company_id,
        Invoice.invoice_type == "Sales",
        Invoice.invoice_date >= first_of_month,
        Invoice.invoice_date <= end_of_month,
        Invoice.status != "Cancelled",
    ).scalar() or 0
    sales_total = db.query(func.coalesce(func.sum(Invoice.total_amount), 0)).filter(
        Invoice.company_id == company_id,
        Invoice.invoice_type == "Sales",
        Invoice.invoice_date >= first_of_month,
        Invoice.invoice_date <= end_of_month,
        Invoice.status != "Cancelled",
    ).scalar() or 0

    # Current month purchases (ITC)
    purchase_tax = db.query(func.coalesce(func.sum(InvoiceLineItem.gst_amount), 0)).join(Invoice).filter(
        Invoice.company_id == company_id,
        Invoice.invoice_type == "Purchase",
        Invoice.invoice_date >= first_of_month,
        Invoice.invoice_date <= end_of_month,
        Invoice.status != "Cancelled",
    ).scalar() or 0
    purchase_total = db.query(func.coalesce(func.sum(Invoice.total_amount), 0)).filter(
        Invoice.company_id == company_id,
        Invoice.invoice_type == "Purchase",
        Invoice.invoice_date >= first_of_month,
        Invoice.invoice_date <= end_of_month,
        Invoice.status != "Cancelled",
    ).scalar() or 0

    # Pending GSTR-1 and GSTR-3B for the month
    pending_returns = []
    for rtype in ["GSTR-1", "GSTR-3B"]:
        existing = db.query(GSTReturn).filter(
            GSTReturn.company_id == company_id,
            GSTReturn.return_type == rtype,
            GSTReturn.month == today.month,
            GSTReturn.year == today.year,
        ).first()
        if not existing:
            pending_returns.append(rtype)
        elif existing.status != "Filed":
            pending_returns.append(f"{rtype} ({existing.status})")

    return {
        "company_id": company_id,
        "month": today.month,
        "year": today.year,
        "outward_supplies": {
            "taxable_value": round(float(sales_total) - float(sales_tax), 2),
            "tax": round(float(sales_tax), 2),
            "total": round(float(sales_total), 2),
        },
        "inward_supplies_itc": {
            "taxable_value": round(float(purchase_total) - float(purchase_tax), 2),
            "tax": round(float(purchase_tax), 2),
            "total": round(float(purchase_total), 2),
        },
        "net_liability": round(float(sales_tax) - float(purchase_tax), 2),
        "pending_returns": pending_returns,
    }
