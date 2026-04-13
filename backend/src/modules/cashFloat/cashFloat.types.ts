export interface CashFloatRow {
  denomination_id: number;
  label: string;
  type: string;
  value: number;
  stock: number;
}

export interface CashFloatSummaryRow {
  machine_id: number;
  machine_name: string;
  total_cash_thb: string;
}

export interface UpdateFloatDto {
  quantity: number;
}
