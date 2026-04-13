import type {
  Product,
  MoneyDenomination,
  PurchaseRequest,
  PurchaseResponse,
} from "@/types/vending";
import { makeChange } from "./changeCalculator";
import axios from "axios";
// ─── In-memory "database" ────────────────────────────────────────────────────

let mockDataEnabled = false;

let realProducts: Product[] = [];
let realCashStock: MoneyDenomination[] = [];
let products: Product[] = [
  {
    id: "p1",
    name: "น้ำเปล่า",
    nameEn: "Water",
    price: 10,
    stock: 8,
    emoji: "💧",
    category: "drink",
  },
  { id: "p2", name: "โค้ก", nameEn: "Coke", price: 20, stock: 5, emoji: "🥤", category: "drink" },
  {
    id: "p3",
    name: "ชาเขียว",
    nameEn: "Green Tea",
    price: 20,
    stock: 6,
    emoji: "🍵",
    category: "drink",
  },
  { id: "p4", name: "กาแฟ", nameEn: "Coffee", price: 25, stock: 4, emoji: "☕", category: "drink" },
  {
    id: "p5",
    name: "เอนเนอร์จี้",
    nameEn: "Energy Drink",
    price: 35,
    stock: 3,
    emoji: "⚡",
    category: "drink",
  },
  {
    id: "p6",
    name: "มันฝรั่ง",
    nameEn: "Chips",
    price: 15,
    stock: 7,
    emoji: "🍟",
    category: "snack",
  },
  {
    id: "p7",
    name: "ช็อกโกแลต",
    nameEn: "Chocolate",
    price: 30,
    stock: 5,
    emoji: "🍫",
    category: "snack",
  },
  {
    id: "p8",
    name: "แซนด์วิช",
    nameEn: "Sandwich",
    price: 45,
    stock: 2,
    emoji: "🥪",
    category: "food",
  },
  {
    id: "p9",
    name: "คุกกี้",
    nameEn: "Cookie",
    price: 25,
    stock: 0,
    emoji: "🍪",
    category: "snack",
  },
  // { id: 'p41', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p42', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p10', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p11', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p12', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p13', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p14', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p15', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p16', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p17', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p18', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p19', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p20', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p21', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p22', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p23', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p24', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p25', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p26', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p27', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p28', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p29', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p30', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p31', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p32', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p33', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p34', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p35', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p36', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p37', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p38', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p39', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
  // { id: 'p40', name: 'ช็อกโกแลต', nameEn: 'Chocolate', price: 30, stock: 5, emoji: '🍫', category: 'snack' },
];

let cashStock: MoneyDenomination[] = [
  { value: 1, type: "coin", stock: 10, label: "1" },
  { value: 5, type: "coin", stock: 10, label: "5" },
  { value: 10, type: "coin", stock: 10, label: "10" },
  { value: 20, type: "banknote", stock: 8, label: "20" },
  { value: 50, type: "banknote", stock: 5, label: "50" },
  { value: 100, type: "banknote", stock: 4, label: "100" },
  { value: 500, type: "banknote", stock: 2, label: "500" },
  { value: 1000, type: "banknote", stock: 0, label: "1000" },
];

// ── Axios instance ────────────────────────────────────────────
const api = axios.create({
  baseURL: process.env.VENDING_API_URL ?? "http://localhost:8080/api/v1",
  headers: { "Content-Type": "application/json" },
});
// ─── Helpers ─────────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// ─── API Functions ────────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await api.get("/products", {
      params: { machine_serial: process.env.NEXT_PUBLIC_MACHINE_SERIAL },
    });
    realProducts = res.data.data as Product[];
    console.log("res all products from backend", res.data);
    return realProducts;
  } catch (error) {
    console.error("error fetching products from Backend, falling back to mock data", error);
    mockDataEnabled = true;
    return JSON.parse(JSON.stringify(products));
  }
}

export async function getCashStock(): Promise<MoneyDenomination[]> {
  try {
    const machine_serial = process.env.NEXT_PUBLIC_MACHINE_SERIAL;
    const res = await api.get(`/cash-float/${machine_serial}`);
    console.log("res all cash stock from backend", res.data);
    realCashStock = res.data.data as MoneyDenomination[];
    return realCashStock;
  } catch (error) {
    console.error("error fetching cashStock from Backend, falling back to mock data", error);
    mockDataEnabled = true;
    return JSON.parse(JSON.stringify(cashStock));
  }
}

export async function processPurchase(req: PurchaseRequest): Promise<PurchaseResponse> {
  console.log("Process purchaase request", mockDataEnabled, realCashStock, realProducts);
  await delay(800); // simulate processing

  const product = mockDataEnabled
    ? products.find((p) => p.id === req.productId)
    : realProducts.find((p) => p.id === req.productId);
  if (!product) {
    return { success: false, message: "Product not found.", changeTotal: 0, changeBreakdown: [] };
  }
  if (product.stock <= 0) {
    return {
      success: false,
      message: "Product is out of stock.",
      changeTotal: 0,
      changeBreakdown: [],
    };
  }
  if (req.insertedAmount < product.price) {
    return {
      success: false,
      message: `Insufficient funds. Need ${product.price - req.insertedAmount} THB more.`,
      changeTotal: 0,
      changeBreakdown: [],
    };
  }

  const changeNeeded = req.insertedAmount - product.price;

  // Add inserted money to machine stock first
  const tempStock: MoneyDenomination[] = mockDataEnabled
    ? JSON.parse(JSON.stringify(cashStock))
    : JSON.parse(JSON.stringify(realCashStock));
  for (const item of req.insertedBreakdown) {
    const denom = tempStock.find((d) => d.value === item.value);
    if (denom) denom.stock += item.count;
  }

  // Try to make change from updated stock
  const changeBreakdown = makeChange(changeNeeded, tempStock);

  if (changeBreakdown === null) {
    return {
      success: false,
      message: "Cannot make exact change. Please use exact amount or different bills.",
      changeTotal: 0,
      changeBreakdown: [],
    };
  }

  // Commit: update product stock
  if (mockDataEnabled) {
    const productIndex = products.findIndex((p) => p.id === req.productId);
    products[productIndex].stock -= 1;

    // Commit: update cash stock (inserted + remove change)
    cashStock = tempStock;
    for (const item of changeBreakdown) {
      const denom = cashStock.find((d) => d.value === item.value);
      if (denom) denom.stock -= item.count;
    }
    console.log("Updated mock products and mock cash stock after purchase", products, cashStock);
  } else {
    // can be better practice using outbox pattern
    await Promise.all([
      api.post(`/transactions`, {
        machine_serial: process.env.NEXT_PUBLIC_MACHINE_SERIAL,
        product_id: product.id,
        payments: req.insertedBreakdown.map((item) => ({
          denomination_id: realCashStock.find((d) => d.value === item.value)?.denomination_id,
          quantity: item.count
        }))
      
      }),
      // ...changeBreakdown.map((item) =>
      //   api.post(`/cash-float/${process.env.NEXT_PUBLIC_MACHINE_SERIAL}/denominations/${item.value}`, {
      //     stock: tempStock.find((d) => d.value === item.value)?.stock ?? 0,
      //   })
      // ),
    ]);
  }
  return {
    success: true,
    message: "Purchase successful!",
    changeTotal: changeNeeded,
    changeBreakdown,
    updatedProduct: true,
  };
}

// ─── Admin API ────────────────────────────────────────────────────────────────

export async function updateProductStock(productId: string, newStock: number): Promise<Product> {
  await delay(200);
  const product = products.find((p) => p.id === productId);
  if (!product) throw new Error("Product not found");
  product.stock = Math.max(0, newStock);
  return JSON.parse(JSON.stringify(product));
}

export async function updateCashStock(value: number, newStock: number): Promise<MoneyDenomination> {
  await delay(200);
  const denom = cashStock.find((d) => d.value === value);
  if (!denom) throw new Error("Denomination not found");
  denom.stock = Math.max(0, newStock);
  return JSON.parse(JSON.stringify(denom));
}
