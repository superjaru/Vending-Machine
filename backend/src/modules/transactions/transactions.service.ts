import { AppError } from "../../shared/middleware";
import { calculateChange } from "../../shared/utils/changeCalculator";
import db from "../../shared/db";
import { productRepo } from "../products/products.repo";
import { inventoryRepo } from "../inventory/inventory.repo";
import { denominationRepo, cashFloatRepo } from "../cashFloat/cashFloat.repo";
import { transactionRepo } from "./transactions.repo";
import type { PaymentItem } from "../../shared/types";
import type {
  CreateTransactionDto,
  TransactionFilters,
  TransactionDetail,
} from "./transactions.types";

export class TransactionService {
  getAll(filters: TransactionFilters) {
    return transactionRepo.findAll(filters);
  }

  async getById(id: number): Promise<TransactionDetail> {
    const tx = await transactionRepo.findById(id);
    if (!tx) throw new AppError("Transaction not found", 404);

    const [payments, change] = await Promise.all([
      transactionRepo.findPayments(id),
      transactionRepo.findChange(id),
    ]);

    return { ...tx, payments, change };
  }

  async purchase(dto: CreateTransactionDto) {
    const { machine_id, product_id, payments } = dto;

    return db.transaction(async (trx) => {
      // 1. Product must exist and be active
      const product = await productRepo.findActiveById(product_id, trx);
      if (!product) throw new AppError("Product not found or inactive", 404);

      // 2. Must have stock available
      const inv = await inventoryRepo.findOne(machine_id, product_id, trx);
      if (!inv || inv.stock < 1) throw new AppError("Product out of stock", 409);

      // 3. Validate all inserted denominations and sum total
      const denomIds = [...new Set(payments.map((p: PaymentItem) => p.denomination_id))];
      const denoms = await denominationRepo.findByIds(denomIds, trx);
      const denomMap = new Map(denoms.map((d) => [d.id, d]));

      const productPrice = Math.round(Number(product.price));
      const insertedCash = payments.reduce((sum: number, p: PaymentItem) => {
        const d = denomMap.get(p.denomination_id);
        if (!d) throw new AppError(`Invalid denomination id: ${p.denomination_id}`, 422);
        return sum + d.value * p.quantity;
      }, 0);

      if (insertedCash < productPrice) throw new AppError("Insufficient payment", 422);

      const changeCash = insertedCash - productPrice;

      // 4. Credit inserted coins to machine float before calculating change
      for (const p of payments) {
        await cashFloatRepo.increment(machine_id, p.denomination_id, p.quantity, trx);
      }

      // 5. Run greedy change algorithm against updated float
      const float = await cashFloatRepo.findFloatForChange(machine_id, trx);
      const changeBreakdown = calculateChange(changeCash, float);

      // 6. Persist transaction record
      // const tx = await transactionRepo.create(
      //   {
      //     machine_id,
      //     product_id,
      //     product_price_thb: product.price,
      //     amount_inserted_thb: (insertedCash / 100).toFixed(2),
      //     change_given_thb: (changeCash / 100).toFixed(2),
      //   },
      //   trx,
      // );

      // // 7. Persist payment + change breakdown rows
      // await transactionRepo.insertPayments(tx.id, payments, trx);
      // await transactionRepo.insertChange(tx.id, changeBreakdown, trx);

      // 8. Deduct change from float and decrement product stock
      for (const c of changeBreakdown) {
        await cashFloatRepo.decrement(machine_id, c.denomination_id, c.quantity, trx);
      }
      await inventoryRepo.decrementStock(machine_id, product_id, trx);

      return { change: changeBreakdown };
    });
  }

}

export const transactionService = new TransactionService();
