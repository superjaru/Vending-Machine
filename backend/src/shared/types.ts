// ── Enums ─────────────────────────────────────────────────────
export type MachineStatus = "active" | "maintenance" | "offline";
export type TransactionStatus = "pending" | "completed" | "cancelled" | "refunded";
export type DenominationType = "coin" | "note";

// ── DB row shapes ──────────────────────────────────────────────
export interface Location {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Machine {
  id: number;
  location_id: number;
  serial_number: string;
  name: string | null;
  status: MachineStatus;
  last_restocked_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: number;
  name: string;
  nameEn: string;
  category: string | null;
  price: string;
  emoji: string;
  image_url: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface MachineInventory {
  machine_id: number;
  product_id: number;
  stock: number;
  max_capacity: number;
  low_stock_threshold: number;
  updated_at: Date;
}

export interface Denomination {
  id: number;
  value: number;
  label: string;
  type: DenominationType;
}

export interface MachineCashFloat {
  machine_id: number;
  denomination_id: number;
  stock: number;
  updated_at: Date;
}

export interface Transaction {
  id: number;
  machine_id: number;
  product_id: number;
  status: TransactionStatus;
  product_price_thb: string;
  amount_inserted_thb: string;
  change_given_thb: string;
  created_at: Date;
  completed_at: Date | null;
}

// ── Shared payment types (used by cashFloat + transactions) ───
export interface PaymentItem {
  denomination_id: number;
  quantity: number;
}

export interface ChangeItem {
  denomination_id: number;
  quantity: number;
}
