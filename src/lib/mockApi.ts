import type {
  Product,
  MoneyDenomination,
  PurchaseRequest,
  PurchaseResponse,
} from '@/types/vending'
import { makeChange } from './changeCalculator'

// ─── In-memory "database" ────────────────────────────────────────────────────

let products: Product[] = [
  { id: 'p1', name: 'น้ำเปล่า', nameEn: 'Water', price: 10, stock: 8, emoji: '💧', category: 'drink' },
  { id: 'p2', name: 'โค้ก', nameEn: 'Coke', price: 20, stock: 5, emoji: '🥤', category: 'drink' },
  { id: 'p3', name: 'ชาเขียว', nameEn: 'Green Tea', price: 20, stock: 6, emoji: '🍵', category: 'drink' },
  { id: 'p4', name: 'กาแฟ', nameEn: 'Coffee', price: 25, stock: 4, emoji: '☕', category: 'drink' },
  { id: 'p5', name: 'เอนเนอร์จี้', nameEn: 'Energy Drink', price: 35, stock: 3, emoji: '⚡', category: 'drink' },
  { id: 'p6', name: 'มันฝรั่ง', nameEn: 'Chips', price: 15, stock: 7, emoji: '🍟', category: 'snack' },
  { id: 'p7', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  { id: 'p8', name: 'แซนด์วิช', nameEn: 'Sandwich', price: 45, stock: 2, emoji: '🥪', category: 'food' },
  { id: 'p9', name: 'คุกกี้', nameEn: 'Cookie', price: 25, stock: 0, emoji: '🍪', category: 'snack' },
]

let cashStock: MoneyDenomination[] = [
  { value: 1,    type: 'coin',     stock: 20, label: '1' },
  { value: 5,    type: 'coin',     stock: 15, label: '5' },
  { value: 10,   type: 'coin',     stock: 10, label: '10' },
  { value: 20,   type: 'banknote', stock: 8,  label: '20' },
  { value: 50,   type: 'banknote', stock: 5,  label: '50' },
  { value: 100,  type: 'banknote', stock: 4,  label: '100' },
  { value: 500,  type: 'banknote', stock: 2,  label: '500' },
  { value: 1000, type: 'banknote', stock: 1,  label: '1000' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  await delay(300)
  return JSON.parse(JSON.stringify(products))
}

export async function getCashStock(): Promise<MoneyDenomination[]> {
  await delay(200)
  return JSON.parse(JSON.stringify(cashStock))
}

export async function processPurchase(
  req: PurchaseRequest
): Promise<PurchaseResponse> {
  await delay(800) // simulate processing

  const product = products.find((p) => p.id === req.productId)
  if (!product) {
    return { success: false, message: 'Product not found.', changeTotal: 0, changeBreakdown: [] }
  }
  if (product.stock <= 0) {
    return { success: false, message: 'Product is out of stock.', changeTotal: 0, changeBreakdown: [] }
  }
  if (req.insertedAmount < product.price) {
    return {
      success: false,
      message: `Insufficient funds. Need ${product.price - req.insertedAmount} THB more.`,
      changeTotal: 0,
      changeBreakdown: [],
    }
  }

  const changeNeeded = req.insertedAmount - product.price

  // Add inserted money to machine stock first
  const tempStock: MoneyDenomination[] = JSON.parse(JSON.stringify(cashStock))
  for (const item of req.insertedBreakdown) {
    const denom = tempStock.find((d) => d.value === item.value)
    if (denom) denom.stock += item.count
  }

  // Try to make change from updated stock
  const changeBreakdown = makeChange(changeNeeded, tempStock)

  if (changeBreakdown === null) {
    return {
      success: false,
      message: 'Cannot make exact change. Please use exact amount or different bills.',
      changeTotal: 0,
      changeBreakdown: [],
    }
  }

  // Commit: update product stock
  const productIndex = products.findIndex((p) => p.id === req.productId)
  products[productIndex].stock -= 1

  // Commit: update cash stock (inserted + remove change)
  cashStock = tempStock
  for (const item of changeBreakdown) {
    const denom = cashStock.find((d) => d.value === item.value)
    if (denom) denom.stock -= item.count
  }

  return {
    success: true,
    message: 'Purchase successful!',
    changeTotal: changeNeeded,
    changeBreakdown,
    updatedProduct: JSON.parse(JSON.stringify(products[productIndex])),
  }
}

// ─── Admin API ────────────────────────────────────────────────────────────────

export async function updateProductStock(
  productId: string,
  newStock: number
): Promise<Product> {
  await delay(200)
  const product = products.find((p) => p.id === productId)
  if (!product) throw new Error('Product not found')
  product.stock = Math.max(0, newStock)
  return JSON.parse(JSON.stringify(product))
}

export async function updateCashStock(
  value: number,
  newStock: number
): Promise<MoneyDenomination> {
  await delay(200)
  const denom = cashStock.find((d) => d.value === value)
  if (!denom) throw new Error('Denomination not found')
  denom.stock = Math.max(0, newStock)
  return JSON.parse(JSON.stringify(denom))
}
