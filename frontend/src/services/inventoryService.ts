import { apiClient } from './apiClient';

export interface Warehouse {
  id?: number;
  name: string;
  code?: string;
  location?: string;
  manager_id?: number;
}

export interface StockCategory {
  id?: number;
  name: string;
  parent_id?: number;
  description?: string;
  is_active?: boolean;
}

export interface StockItem {
  id?: number;
  item_code: string;
  item_name: string;
  category_id?: number;
  description?: string;
  unit?: string;
  purchase_price?: number;
  selling_price?: number;
  hsn_code?: string;
  gst_rate?: number;
  reorder_level?: number;
  quantity_on_hand?: number;
}

export interface StockMovement {
  id?: number;
  stock_item_id: number;
  warehouse_id?: number;
  movement_type: 'IN' | 'OUT' | 'TRANSFER' | 'ADJUST';
  quantity: number;
  unit_price?: number;
  total_value?: number;
  reference_type?: string;
  reference_id?: number;
  movement_date: string;
  remarks?: string;
}

export interface OrderItem {
  stock_item_id: number;
  quantity: number;
  unit_price: number;
  gst_rate?: number;
}

export interface PurchaseOrder {
  id?: number;
  vendor_id: number;
  po_number?: string;
  po_date: string;
  expected_delivery?: string;
  warehouse_id?: number;
  notes?: string;
  status?: string;
  subtotal?: number;
  tax_amount?: number;
  total_amount?: number;
  items: OrderItem[];
}

export interface GRNItem {
  stock_item_id: number;
  quantity: number;
  unit_price: number;
  gst_rate?: number;
  batch_number?: string;
  expiry_date?: string;
}

export interface GoodsReceiptNote {
  id?: number;
  vendor_id: number;
  grn_number?: string;
  grn_date: string;
  purchase_order_id?: number;
  warehouse_id?: number;
  invoice_number?: string;
  invoice_date?: string;
  notes?: string;
  status?: string;
  total_amount?: number;
  items: GRNItem[];
}

export interface SalesOrder {
  id?: number;
  customer_id: number;
  so_number?: string;
  so_date: string;
  expected_delivery?: string;
  warehouse_id?: number;
  notes?: string;
  status?: string;
  subtotal?: number;
  tax_amount?: number;
  total_amount?: number;
  items: OrderItem[];
}

export interface InventorySummary {
  company_id: number;
  total_items: number;
  total_value: number;
  low_stock_count: number;
  low_stock_items: any[];
}

class InventoryService {
  // Warehouses
  async getWarehouses() {
    const response = await apiClient.get<Warehouse[]>('/inventory/warehouses');
    return response.data;
  }

  async createWarehouse(data: Warehouse) {
    const response = await apiClient.post<Warehouse>('/inventory/warehouses', data);
    return response.data;
  }

  async deleteWarehouse(id: number) {
    const response = await apiClient.delete(`/inventory/warehouses/${id}`);
    return response.data;
  }

  // Categories
  async getCategories() {
    const response = await apiClient.get<StockCategory[]>('/inventory/categories');
    return response.data;
  }

  async createCategory(data: StockCategory) {
    const response = await apiClient.post<StockCategory>('/inventory/categories', data);
    return response.data;
  }

  // Stock Items
  async getStockItems(search?: string, category_id?: number) {
    const params: any = {};
    if (search) params.search = search;
    if (category_id) params.category_id = category_id;
    const response = await apiClient.get<StockItem[]>('/inventory/items', { params });
    return response.data;
  }

  async getStockItem(id: number) {
    const response = await apiClient.get<StockItem>(`/inventory/items/${id}`);
    return response.data;
  }

  async createStockItem(data: StockItem) {
    const response = await apiClient.post<StockItem>('/inventory/items', data);
    return response.data;
  }

  async deleteStockItem(id: number) {
    const response = await apiClient.delete(`/inventory/items/${id}`);
    return response.data;
  }

  // Stock Movements
  async recordMovement(data: StockMovement) {
    const response = await apiClient.post<StockMovement>('/inventory/movements', data);
    return response.data;
  }

  async getMovements(stock_item_id?: number) {
    const params: any = {};
    if (stock_item_id) params.stock_item_id = stock_item_id;
    const response = await apiClient.get<StockMovement[]>('/inventory/movements', { params });
    return response.data;
  }

  // Purchase Orders & GRN
  async createPurchaseOrder(data: PurchaseOrder) {
    const response = await apiClient.post<PurchaseOrder>('/inventory/purchase-orders', data);
    return response.data;
  }

  async getPurchaseOrders() {
    const response = await apiClient.get<PurchaseOrder[]>('/inventory/purchase-orders');
    return response.data;
  }

  async createGRN(data: GoodsReceiptNote) {
    const response = await apiClient.post<GoodsReceiptNote>('/inventory/grn', data);
    return response.data;
  }

  async getGRNs() {
    const response = await apiClient.get<GoodsReceiptNote[]>('/inventory/grn');
    return response.data;
  }

  // Sales Orders
  async createSalesOrder(data: SalesOrder) {
    const response = await apiClient.post<SalesOrder>('/inventory/sales-orders', data);
    return response.data;
  }

  async getSalesOrders() {
    const response = await apiClient.get<SalesOrder[]>('/inventory/sales-orders');
    return response.data;
  }

  // Dashboard & Reports
  async getSummary() {
    const response = await apiClient.get<InventorySummary>('/inventory/dashboard/summary');
    return response.data;
  }

  async getMovementReport(fromDate: string, toDate: string, stockItemId?: number) {
    const params: any = { from_date: fromDate, to_date: toDate };
    if (stockItemId) params.stock_item_id = stockItemId;
    const response = await apiClient.get('/inventory/reports/movements', { params });
    return response.data;
  }
}

export default new InventoryService();
