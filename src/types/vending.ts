export interface Product {
  id: string
  name: string
  nameEn: string
  price: number
  stock: number
  emoji: string
  category: 'drink' | 'food' | 'snack'
}

export interface MoneyDenomination {
  value: number
  type: 'coin' | 'banknote'
  stock: number
  label: string
}

export interface ChangeItem {
  value: number
  count: number
  type: 'coin' | 'banknote'
}

export interface PurchaseRequest {
  productId: string
  insertedAmount: number
  insertedBreakdown: ChangeItem[]
}

export interface PurchaseResponse {
  success: boolean
  message: string
  changeTotal: number
  changeBreakdown: ChangeItem[]
  updatedProduct?: Product
}

export type MachinePhase =
  | 'idle'
  | 'selected'
  | 'ready_to_buy'
  | 'dispensing'
  | 'change_returned'
  | 'cancelled'
  | 'error'
