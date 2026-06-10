"""
Complete Inventory Service
Implements: Item valuation (FIFO/LIFO/Weighted Average), stock movements,
purchase orders, goods receipt notes, sales orders, stock reconciliation,
inventory reports.
"""
from datetime import date, datetime
from typing import Dict, List, Optional, Tuple
from collections import deque
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from app.models.models import (
    StockItem, StockMovement, StockCategory, Warehouse,
    PurchaseOrder, PurchaseOrderItem, GoodsReceiptNote, GoodsReceiptNoteItem,
    SalesOrder, SalesOrderItem, Vendor, Customer, Company, Voucher,
)


# ============ Stock Valuation Methods ============

class FIFOValuator:
    """First-In-First-Out valuation. Oldest batches sold first."""

    def __init__(self):
        self.batches: deque = deque()  # (qty_remaining, unit_price)

    def add(self, qty: float, price: float) -> None:
        self.batches.append((float(qty), float(price)))

    def consume(self, qty: float) -> Tuple[float, float]:
        """Consume qty using FIFO. Returns (consumed_qty, consumed_value)."""
        remaining = float(qty)
        consumed_value = 0.0
        while remaining > 0 and self.batches:
            bat_qty, bat_price = self.batches[0]
            take = min(remaining, bat_qty)
            consumed_value += take * bat_price
            remaining -= take
            if take >= bat_qty:
                self.batches.popleft()
            else:
                self.batches[0] = (bat_qty - take, bat_price)
        if remaining > 0:
            # Not enough inventory: assume last price
            consumed_value += remaining * (self.batches[-1][1] if self.batches else 0)
        return float(qty) - remaining, round(consumed_value, 2)

    def value_on_hand(self) -> Tuple[float, float]:
        qty = sum(b[0] for b in self.batches)
        value = sum(b[0] * b[1] for b in self.batches)
        return round(qty, 2), round(value, 2)


class LIFOValuator:
    """Last-In-First-Out valuation. Newest batches sold first."""

    def __init__(self):
        self.batches: deque = deque()  # (qty_remaining, unit_price)

    def add(self, qty: float, price: float) -> None:
        self.batches.append((float(qty), float(price)))

    def consume(self, qty: float) -> Tuple[float, float]:
        remaining = float(qty)
        consumed_value = 0.0
        while remaining > 0 and self.batches:
            bat_qty, bat_price = self.batches[-1]
            take = min(remaining, bat_qty)
            consumed_value += take * bat_price
            remaining -= take
            if take >= bat_qty:
                self.batches.pop()
            else:
                self.batches[-1] = (bat_qty - take, bat_price)
        if remaining > 0:
            consumed_value += remaining * (self.batches[0][1] if self.batches else 0)
        return float(qty) - remaining, round(consumed_value, 2)

    def value_on_hand(self) -> Tuple[float, float]:
        qty = sum(b[0] for b in self.batches)
        value = sum(b[0] * b[1] for b in self.batches)
        return round(qty, 2), round(value, 2)


class WeightedAverageValuator:
    """Weighted Average cost. Recomputes average on every purchase."""

    def __init__(self):
        self.total_qty: float = 0.0
        self.total_value: float = 0.0

    def add(self, qty: float, price: float) -> None:
        self.total_qty += float(qty)
        self.total_value += float(qty) * float(price)

    def consume(self, qty: float) -> Tuple[float, float]:
        if self.total_qty <= 0:
            return 0, 0
        avg_price = self.total_value / self.total_qty
        take = min(float(qty), self.total_qty)
        consumed_value = round(take * avg_price, 2)
        self.total_qty -= take
        self.total_value -= consumed_value
        return take, consumed_value

    def value_on_hand(self) -> Tuple[float, float]:
        return round(self.total_qty, 2), round(self.total_value, 2)


# ============ Stock Movement ===============

def record_movement(
    db: Session, company_id: int, stock_item_id: int,
    movement_type: str, quantity: float, unit_price: float = 0,
    warehouse_id: Optional[int] = None, reference_type: str = None,
    reference_id: Optional[int] = None, movement_date: Optional[date] = None,
    remarks: str = "",
) -> StockMovement:
    """Record a stock movement (IN/OUT/TRANSFER/ADJUST) and update item quantity."""
    item = db.query(StockItem).filter(
        StockItem.id == stock_item_id, StockItem.company_id == company_id
    ).first()
    if not item:
        raise ValueError("Stock item not found")
    qty = float(quantity)
    if qty <= 0:
        raise ValueError("Quantity must be positive")
    if movement_type == "IN":
        item.quantity_on_hand = (item.quantity_on_hand or 0) + qty
    elif movement_type in ("OUT", "TRANSFER"):
        if (item.quantity_on_hand or 0) < qty:
            raise ValueError(f"Insufficient stock: have {item.quantity_on_hand}, need {qty}")
        item.quantity_on_hand -= qty
    elif movement_type == "ADJUST":
        # adjustment: qty is the new on-hand value (or delta based on a sign)
        item.quantity_on_hand = qty
    else:
        raise ValueError(f"Unknown movement_type: {movement_type}")
    mvt = StockMovement(
        company_id=company_id, stock_item_id=stock_item_id,
        warehouse_id=warehouse_id, movement_type=movement_type,
        reference_type=reference_type, reference_id=reference_id,
        quantity=qty, unit_price=unit_price,
        total_value=round(qty * unit_price, 2),
        movement_date=movement_date or date.today(),
        remarks=remarks,
    )
    db.add(mvt)
    db.commit()
    db.refresh(mvt)
    return mvt


# ============ Purchase Order ===============

def create_purchase_order(
    db: Session, company_id: int, vendor_id: int, po_date: date,
    items: List[Dict], expected_delivery: Optional[date] = None,
    warehouse_id: Optional[int] = None, notes: str = "",
) -> PurchaseOrder:
    """
    items: [{"stock_item_id": int, "quantity": float, "unit_price": float, "gst_rate": float}, ...]
    """
    vendor = db.query(Vendor).filter(
        Vendor.id == vendor_id, Vendor.company_id == company_id
    ).first()
    if not vendor:
        raise ValueError("Vendor not found")
    if not items:
        raise ValueError("At least one item is required")

    # Generate PO number
    last = db.query(PurchaseOrder).filter(
        PurchaseOrder.company_id == company_id
    ).order_by(PurchaseOrder.id.desc()).first()
    next_num = (last.id + 1) if last else 1
    po_number = f"PO-{next_num:06d}"

    subtotal = 0
    tax_total = 0
    po = PurchaseOrder(
        company_id=company_id, vendor_id=vendor_id, po_number=po_number,
        po_date=po_date, expected_delivery=expected_delivery,
        warehouse_id=warehouse_id, status="Draft", notes=notes,
    )
    db.add(po)
    db.flush()
    for it in items:
        qty = float(it["quantity"])
        price = float(it["unit_price"])
        gst = float(it.get("gst_rate", 0))
        line_total = round(qty * price, 2)
        gst_amount = round(line_total * gst / 100, 2)
        poi = PurchaseOrderItem(
            purchase_order_id=po.id,
            stock_item_id=it["stock_item_id"],
            quantity=qty, unit_price=price, gst_rate=gst,
            gst_amount=gst_amount, line_total=line_total + gst_amount,
        )
        db.add(poi)
        subtotal += line_total
        tax_total += gst_amount
    po.subtotal = round(subtotal, 2)
    po.tax_amount = round(tax_total, 2)
    po.total_amount = round(subtotal + tax_total, 2)
    db.commit()
    db.refresh(po)
    return po


def approve_purchase_order(db: Session, po_id: int) -> PurchaseOrder:
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise ValueError("Purchase order not found")
    if po.status not in ("Draft", "Sent"):
        raise ValueError(f"Cannot approve PO in status {po.status}")
    po.status = "Approved"
    db.commit()
    return po


# ============ Goods Receipt Note ===============

def create_grn(
    db: Session, company_id: int, vendor_id: int, grn_date: date,
    items: List[Dict], purchase_order_id: Optional[int] = None,
    warehouse_id: Optional[int] = None, invoice_number: str = None,
    invoice_date: Optional[date] = None, notes: str = "",
) -> GoodsReceiptNote:
    """
    Create a GRN. This records the receipt of goods and updates stock.
    items: [{"stock_item_id": int, "quantity": float, "unit_price": float, "gst_rate": float, "batch_number": str, "expiry_date": date}, ...]
    """
    if not items:
        raise ValueError("At least one item is required")

    last = db.query(GoodsReceiptNote).filter(
        GoodsReceiptNote.company_id == company_id
    ).order_by(GoodsReceiptNote.id.desc()).first()
    next_num = (last.id + 1) if last else 1
    grn_number = f"GRN-{next_num:06d}"

    grn = GoodsReceiptNote(
        company_id=company_id, grn_number=grn_number,
        purchase_order_id=purchase_order_id, vendor_id=vendor_id,
        warehouse_id=warehouse_id, grn_date=grn_date,
        invoice_number=invoice_number, invoice_date=invoice_date,
        status="Received", notes=notes,
    )
    db.add(grn)
    db.flush()
    total = 0
    for it in items:
        qty = float(it["quantity"])
        price = float(it["unit_price"])
        gst = float(it.get("gst_rate", 0))
        line_total = round(qty * price, 2)
        gst_amount = round(line_total * gst / 100, 2)
        grni = GoodsReceiptNoteItem(
            grn_id=grn.id, stock_item_id=it["stock_item_id"],
            quantity=qty, unit_price=price, gst_rate=gst,
            gst_amount=gst_amount, line_total=line_total + gst_amount,
            batch_number=it.get("batch_number"),
            expiry_date=it.get("expiry_date"),
        )
        db.add(grni)
        total += line_total + gst_amount
        # Update stock on hand
        record_movement(
            db, company_id, it["stock_item_id"], "IN", qty, price,
            warehouse_id=warehouse_id,
            reference_type="GRN", reference_id=grn.id,
            movement_date=grn_date, remarks=f"GRN {grn_number}",
        )
        # Update PO received_quantity
        if purchase_order_id:
            from app.models.models import PurchaseOrderItem
            poi = db.query(PurchaseOrderItem).filter(
                PurchaseOrderItem.purchase_order_id == purchase_order_id,
                PurchaseOrderItem.stock_item_id == it["stock_item_id"],
            ).first()
            if poi:
                poi.received_quantity = (poi.received_quantity or 0) + qty
    grn.total_amount = round(total, 2)
    # Mark PO as Received if fully received
    if purchase_order_id:
        po = db.query(PurchaseOrder).filter(PurchaseOrder.id == purchase_order_id).first()
        if po:
            all_received = all(
                (poi.received_quantity or 0) >= (poi.quantity or 0)
                for poi in po.items
            )
            if all_received:
                po.status = "Received"
    db.commit()
    db.refresh(grn)
    return grn


# ============ Sales Order ===============

def create_sales_order(
    db: Session, company_id: int, customer_id: int, so_date: date,
    items: List[Dict], expected_delivery: Optional[date] = None,
    warehouse_id: Optional[int] = None, notes: str = "",
) -> SalesOrder:
    customer = db.query(Customer).filter(
        Customer.id == customer_id, Customer.company_id == company_id
    ).first()
    if not customer:
        raise ValueError("Customer not found")
    last = db.query(SalesOrder).filter(
        SalesOrder.company_id == company_id
    ).order_by(SalesOrder.id.desc()).first()
    next_num = (last.id + 1) if last else 1
    so_number = f"SO-{next_num:06d}"
    so = SalesOrder(
        company_id=company_id, customer_id=customer_id, so_number=so_number,
        so_date=so_date, expected_delivery=expected_delivery,
        warehouse_id=warehouse_id, status="Draft", notes=notes,
    )
    db.add(so)
    db.flush()
    subtotal = 0
    tax_total = 0
    for it in items:
        qty = float(it["quantity"])
        price = float(it["unit_price"])
        gst = float(it.get("gst_rate", 0))
        line_total = round(qty * price, 2)
        gst_amount = round(line_total * gst / 100, 2)
        soi = SalesOrderItem(
            sales_order_id=so.id, stock_item_id=it["stock_item_id"],
            quantity=qty, unit_price=price, gst_rate=gst,
            gst_amount=gst_amount, line_total=line_total + gst_amount,
        )
        db.add(soi)
        subtotal += line_total
        tax_total += gst_amount
    so.subtotal = round(subtotal, 2)
    so.tax_amount = round(tax_total, 2)
    so.total_amount = round(subtotal + tax_total, 2)
    db.commit()
    db.refresh(so)
    return so


# ============ Inventory Reports ===============

def stock_summary(db: Session, company_id: int) -> Dict:
    """Total stock value, item count, low-stock alerts."""
    items = db.query(StockItem).filter(StockItem.company_id == company_id).all()
    total_value = 0
    low_stock = []
    for it in items:
        qty = it.quantity_on_hand or 0
        price = it.purchase_price or 0
        total_value += qty * price
        if it.reorder_level and qty <= it.reorder_level:
            low_stock.append({
                "id": it.id, "item_code": it.item_code, "name": it.item_name,
                "on_hand": qty, "reorder_level": it.reorder_level,
            })
    return {
        "company_id": company_id,
        "total_items": len(items),
        "total_value": round(total_value, 2),
        "low_stock_count": len(low_stock),
        "low_stock_items": low_stock,
    }


def stock_movement_report(db: Session, company_id: int, from_date: date, to_date: date,
                          stock_item_id: Optional[int] = None) -> Dict:
    """Detailed stock movement report for a date range."""
    q = db.query(StockMovement).filter(
        StockMovement.company_id == company_id,
        StockMovement.movement_date >= from_date,
        StockMovement.movement_date <= to_date,
    )
    if stock_item_id:
        q = q.filter(StockMovement.stock_item_id == stock_item_id)
    movements = q.order_by(StockMovement.movement_date, StockMovement.id).all()
    in_qty = sum(m.quantity for m in movements if m.movement_type == "IN")
    out_qty = sum(m.quantity for m in movements if m.movement_type in ("OUT", "TRANSFER"))
    in_value = sum(m.total_value or 0 for m in movements if m.movement_type == "IN")
    out_value = sum(m.total_value or 0 for m in movements if m.movement_type in ("OUT", "TRANSFER"))
    return {
        "company_id": company_id,
        "from_date": from_date.isoformat(),
        "to_date": to_date.isoformat(),
        "total_movements": len(movements),
        "in_qty": round(in_qty, 2),
        "out_qty": round(out_qty, 2),
        "in_value": round(in_value, 2),
        "out_value": round(out_value, 2),
        "movements": [{
            "id": m.id, "date": m.movement_date.isoformat(),
            "item_id": m.stock_item_id, "type": m.movement_type,
            "quantity": m.quantity, "unit_price": m.unit_price,
            "total_value": m.total_value, "reference": m.reference_type,
            "remarks": m.remarks,
        } for m in movements],
    }
