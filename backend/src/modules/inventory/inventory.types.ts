export interface SetInventoryDto {
  stock: number;
  max_capacity?: number;
  low_stock_threshold?: number;
}

export interface InventoryRow {
  product_id: number;
  name: string;
  category: string | null;
  price_thb: string;
  image_url: string | null;
  stock: number;
  max_capacity: number;
  low_stock_threshold: number;
  updated_at: Date;
}

export interface LowStockRow {
  machine_id: number;
  machine_name: string;
  location_name: string;
  product_id: number;
  product_name: string;
  stock: number;
  low_stock_threshold: number;
}
