import type { PaymentItem, ChangeItem, TransactionStatus } from "../../shared/types";

export interface CreateTransactionDto {
  machine_id: number;
  product_id: number;
  payments: PaymentItem[];
}

export interface TransactionFilters {
  machine_id?: number;
  status?: TransactionStatus;
  from?: string;
  to?: string;
}

export interface TransactionRow {
  id: number;
  machine_id: number;
  product_id: number;
  status: TransactionStatus;
  product_price_thb: string;
  amount_inserted_thb: string;
  change_given_thb: string;
  created_at: Date;
  completed_at: Date | null;
  machine_name: string;
  product_name: string;
}

export interface TransactionDetail extends TransactionRow {
  payments: PaymentBreakdown[];
  change: ChangeBreakdown[];
}

export interface PaymentBreakdown {
  label: string;
  value_satang: number;
  quantity: number;
}

export interface ChangeBreakdown {
  label: string;
  value_satang: number;
  quantity: number;
}

export interface PurchaseResult {
  transaction: TransactionRow;
  change: ChangeItem[];
}

export interface DailySalesRow {
  machine_id: number;
  machine_name: string;
  location_name: string;
  sale_date: string;
  total_transactions: number;
  total_revenue_thb: string;
}
