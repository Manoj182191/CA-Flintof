from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.api.dependencies import get_current_user
from app.models.models import User, Warehouse, StockCategory, StockItem, StockMovement, PurchaseOrder, SalesOrder, GoodsReceiptNote
from app.schemas import schemas
from app.services import inventory_service

router = APIRouter(prefix="/inventory", tags=["inventory"])

def get_company_id(x_company_id: int = Header(...)) -> int:
    return x_company_id

# ============ Warehouses ============

@router.post("/warehouses", response_model=schemas.WarehouseResponse)
def create_warehouse(
    warehouse: schemas.WarehouseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company_id: int = Depends(get_company_id)
):
    db_warehouse = Warehouse(**warehouse.model_dump(), company_id=company_id)
    db.add(db_warehouse)
    db.commit()
    db.refresh(db_warehouse)
    return db_warehouse

@router.get("/warehouses", response_model=List[schemas.WarehouseResponse])
def get_warehouses(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company_id: int = Depends(get_company_id)
):
    return db.query(Warehouse).filter(Warehouse.company_id == company_id).offset(skip).limit(limit).all()

@router.delete("/warehouses/{warehouse_id}")
def delete_warehouse(
    warehouse_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company_id: int = Depends(get_company_id)
):
    warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id, Warehouse.company_id == company_id).first()
    if not warehouse:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    db.delete(warehouse)
    db.commit()
    return {"ok": True}

# ============ Stock Categories ============

@router.post("/categories", response_model=schemas.StockCategoryResponse)
def create_category(
    category: schemas.StockCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company_id: int = Depends(get_company_id)
):
    db_category = StockCategory(**category.model_dump(), company_id=company_id)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.get("/categories", response_model=List[schemas.StockCategoryResponse])
def get_categories(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company_id: int = Depends(get_company_id)
):
    return db.query(StockCategory).filter(StockCategory.company_id == company_id).offset(skip).limit(limit).all()

# ============ Stock Items ============

@router.post("/items", response_model=schemas.StockItemResponse)
def create_stock_item(
    item: schemas.StockItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company_id: int = Depends(get_company_id)
):
    db_item = StockItem(**item.model_dump(), company_id=company_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/items", response_model=List[schemas.StockItemResponse])
def get_stock_items(
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company_id: int = Depends(get_company_id)
):
    query = db.query(StockItem).filter(StockItem.company_id == company_id)
    if search:
        query = query.filter(StockItem.item_name.ilike(f"%{search}%") | StockItem.item_code.ilike(f"%{search}%"))
    if category_id:
        query = query.filter(StockItem.category_id == category_id)
    return query.offset(skip).limit(limit).all()

@router.get("/items/{item_id}", response_model=schemas.StockItemResponse)
def get_stock_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company_id: int = Depends(get_company_id)
):
    item = db.query(StockItem).filter(StockItem.id == item_id, StockItem.company_id == company_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.delete("/items/{item_id}")
def delete_stock_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company_id: int = Depends(get_company_id)
):
    item = db.query(StockItem).filter(StockItem.id == item_id, StockItem.company_id == company_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()
    return {"ok": True}

# ============ Stock Movements ============

@router.post("/movements", response_model=schemas.StockMovementResponse)
def record_stock_movement(
    movement: schemas.StockMovementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company_id: int = Depends(get_company_id)
):
    try:
        mvt = inventory_service.record_movement(
            db=db,
            company_id=company_id,
            stock_item_id=movement.stock_item_id,
            movement_type=movement.movement_type,
            quantity=movement.quantity,
            unit_price=movement.unit_price,
            warehouse_id=movement.warehouse_id,
            reference_type=movement.reference_type,
            reference_id=movement.reference_id,
            movement_date=movement.movement_date,
            remarks=movement.remarks or ""
        )
        return mvt
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/movements", response_model=List[schemas.StockMovementResponse])
def get_stock_movements(
    stock_item_id: Optional[int] = None,
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company_id: int = Depends(get_company_id)
):
    query = db.query(StockMovement).filter(StockMovement.company_id == company_id)
    if stock_item_id:
        query = query.filter(StockMovement.stock_item_id == stock_item_id)
    return query.order_by(StockMovement.movement_date.desc()).offset(skip).limit(limit).all()

# ============ Purchase Orders & GRN ============

@router.post("/purchase-orders", response_model=schemas.PurchaseOrderResponse)
def create_po(
    po: schemas.PurchaseOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company_id: int = Depends(get_company_id)
):
    try:
        items_dict = [it.model_dump() for it in po.items]
        new_po = inventory_service.create_purchase_order(
            db=db, company_id=company_id, vendor_id=po.vendor_id,
            po_date=po.po_date, items=items_dict,
            expected_delivery=po.expected_delivery,
            warehouse_id=po.warehouse_id, notes=po.notes or ""
        )
        return new_po
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/purchase-orders", response_model=List[schemas.PurchaseOrderResponse])
def list_pos(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company_id: int = Depends(get_company_id)
):
    return db.query(PurchaseOrder).filter(PurchaseOrder.company_id == company_id).offset(skip).limit(limit).all()

@router.post("/grn", response_model=schemas.GRNResponse)
def create_grn(
    grn: schemas.GRNCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company_id: int = Depends(get_company_id)
):
    try:
        items_dict = [it.model_dump() for it in grn.items]
        new_grn = inventory_service.create_grn(
            db=db, company_id=company_id, vendor_id=grn.vendor_id,
            grn_date=grn.grn_date, items=items_dict,
            purchase_order_id=grn.purchase_order_id,
            warehouse_id=grn.warehouse_id,
            invoice_number=grn.invoice_number,
            invoice_date=grn.invoice_date,
            notes=grn.notes or ""
        )
        return new_grn
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/grn", response_model=List[schemas.GRNResponse])
def list_grns(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company_id: int = Depends(get_company_id)
):
    return db.query(GoodsReceiptNote).filter(GoodsReceiptNote.company_id == company_id).offset(skip).limit(limit).all()

# ============ Sales Orders ============

@router.post("/sales-orders", response_model=schemas.SalesOrderResponse)
def create_so(
    so: schemas.SalesOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company_id: int = Depends(get_company_id)
):
    try:
        items_dict = [it.model_dump() for it in so.items]
        new_so = inventory_service.create_sales_order(
            db=db, company_id=company_id, customer_id=so.customer_id,
            so_date=so.so_date, items=items_dict,
            expected_delivery=so.expected_delivery,
            warehouse_id=so.warehouse_id, notes=so.notes or ""
        )
        return new_so
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/sales-orders", response_model=List[schemas.SalesOrderResponse])
def list_sos(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company_id: int = Depends(get_company_id)
):
    return db.query(SalesOrder).filter(SalesOrder.company_id == company_id).offset(skip).limit(limit).all()

# ============ Dashboard & Reports ============

@router.get("/dashboard/summary")
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company_id: int = Depends(get_company_id)
):
    summary = inventory_service.stock_summary(db, company_id)
    return summary

@router.get("/reports/movements")
def get_movement_report(
    from_date: date, to_date: date,
    stock_item_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    company_id: int = Depends(get_company_id)
):
    report = inventory_service.stock_movement_report(
        db, company_id, from_date, to_date, stock_item_id
    )
    return report
