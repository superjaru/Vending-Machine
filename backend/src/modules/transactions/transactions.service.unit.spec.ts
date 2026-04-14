import { TransactionService } from "./transactions.service";
import { AppError } from "../../shared/middleware";
import { productRepo } from "../products/products.repo";
import { inventoryRepo } from "../inventory/inventory.repo";
import { denominationRepo, cashFloatRepo } from "../cashFloat/cashFloat.repo";
import { transactionRepo } from "./transactions.repo";

jest.mock("../products/products.repo", () => ({
  productRepo: { findActiveById: jest.fn() },
}));
jest.mock("../inventory/inventory.repo", () => ({
  inventoryRepo: { findOne: jest.fn(), decrementStock: jest.fn() },
}));
jest.mock("../cashFloat/cashFloat.repo", () => ({
  denominationRepo: { findByIds: jest.fn() },
  cashFloatRepo: {
    increment: jest.fn(),
    findFloatForChange: jest.fn(),
    decrement: jest.fn(),
  },
}));
jest.mock("./transactions.repo", () => ({
  transactionRepo: {
    create: jest.fn(),
    insertPayments: jest.fn(),
    insertChange: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findPayments: jest.fn(),
    findChange: jest.fn(),
    getDailySales: jest.fn(),
  },
}));
jest.mock("../../shared/db", () => ({
  __esModule: true,
  default: {
    transaction: (cb: (trx: unknown) => Promise<unknown>) => cb({ fn: { now: () => new Date() } }),
  },
}));



// ── Fixtures ──────────────────────────────────────────────────
const product = { id: 1, name: "Pepsi", price_thb: "20.00", is_active: true };
const inv = { machine_id: 1, product_id: 1, stock: 5, max_capacity: 10, low_stock_threshold: 2 };
const denoms = [
  { id: 3, value_satang: 1000, label: "฿10", type: "coin" },
  { id: 6, value_satang: 10000, label: "฿100", type: "note" },
];
const float = [
  { id: 3, value_satang: 1000, quantity: 10 },
  { id: 2, value_satang: 500, quantity: 10 },
  { id: 1, value_satang: 100, quantity: 20 },
];
const createdTx = {
  id: 99,
  machine_id: 1,
  product_id: 1,
  status: "completed",
  product_price_thb: "20.00",
  amount_inserted_thb: "100.00",
  change_given_thb: "80.00",
};
const validDto = {
  machine_id: 1,
  product_id: 1,
  payments: [{ denomination_id: 6, quantity: 1 }], // insert ฿100
};

describe("TransactionService.purchase", () => {
  let service: TransactionService;

  beforeEach(() => {
    service = new TransactionService();
    (productRepo.findActiveById as jest.Mock).mockResolvedValue(product);
    (inventoryRepo.findOne as jest.Mock).mockResolvedValue(inv);
    (denominationRepo.findByIds as jest.Mock).mockResolvedValue(denoms);
    (cashFloatRepo.increment as jest.Mock).mockResolvedValue(undefined);
    (cashFloatRepo.findFloatForChange as jest.Mock).mockResolvedValue(float);
    (cashFloatRepo.decrement as jest.Mock).mockResolvedValue(undefined);
    (transactionRepo.create as jest.Mock).mockResolvedValue(createdTx);
    (transactionRepo.insertPayments as jest.Mock).mockResolvedValue(undefined);
    (transactionRepo.insertChange as jest.Mock).mockResolvedValue(undefined);
    (inventoryRepo.decrementStock as jest.Mock).mockResolvedValue(undefined);
  });

  it("completes purchase and returns tx with change breakdown", async () => {
    const result = await service.purchase(validDto);
    expect(result.change).toBeDefined();
    expect(Array.isArray(result.change)).toBe(true);
  });

  it("credits inserted coins to float before calculating change", async () => {
    await service.purchase(validDto);
    expect(cashFloatRepo.increment).toHaveBeenCalledWith(1, 6, 1, expect.anything());
  });

  it("inserts payment rows with correct transaction id", async () => {
    await service.purchase(validDto);
    expect(transactionRepo.insertPayments).toHaveBeenCalledWith(
      99,
      validDto.payments,
      expect.anything(),
    );
  });

  it("decrements stock after successful purchase", async () => {
    await service.purchase(validDto);
    expect(inventoryRepo.decrementStock).toHaveBeenCalledWith(1, 1, expect.anything());
  });

  it("throws 404 when product is inactive or not found", async () => {
    (productRepo.findActiveById as jest.Mock).mockResolvedValue(undefined);
    await expect(service.purchase(validDto)).rejects.toThrow(
      new AppError("Product not found or inactive", 404),
    );
  });

  it("throws 409 when product is out of stock", async () => {
    (inventoryRepo.findOne as jest.Mock).mockResolvedValue({ ...inv, stock: 0 });
    await expect(service.purchase(validDto)).rejects.toThrow(
      new AppError("Product out of stock", 409),
    );
  });

  it("throws 422 when payment is insufficient", async () => {
    // insert ฿10 for a ฿20 product
    const cheapDto = { ...validDto, payments: [{ denomination_id: 3, quantity: 1 }] };
    await expect(service.purchase(cheapDto)).rejects.toThrow(
      new AppError("Insufficient payment", 422),
    );
  });

  it("throws 422 for an unknown denomination id", async () => {
    (denominationRepo.findByIds as jest.Mock).mockResolvedValue([]);
    await expect(service.purchase(validDto)).rejects.toThrow(AppError);
  });
});

describe("TransactionService.getById", () => {
  let service: TransactionService;

  beforeEach(() => {
    service = new TransactionService();
  });

  it("returns transaction with payments and change", async () => {
    (transactionRepo.findById as jest.Mock).mockResolvedValue(createdTx);
    (transactionRepo.findPayments as jest.Mock).mockResolvedValue([{ label: "฿100", quantity: 1 }]);
    (transactionRepo.findChange as jest.Mock).mockResolvedValue([{ label: "฿50", quantity: 1 }]);

    const result = await service.getById(99);
    expect(result.id).toBe(99);
    expect(result.payments).toHaveLength(1);
    expect(result.change).toHaveLength(1);
  });

  it("throws 404 when transaction not found", async () => {
    (transactionRepo.findById as jest.Mock).mockResolvedValue(undefined);
    await expect(service.getById(999)).rejects.toThrow(new AppError("Transaction not found", 404));
  });
});
