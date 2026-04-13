import { Knex } from "knex";
import db from "../../shared/db";
import type { Transaction, PaymentItem, ChangeItem } from "../../shared/types";
import type {
  TransactionFilters,
  TransactionRow,
  PaymentBreakdown,
  ChangeBreakdown,
  DailySalesRow,
} from "./transactions.types";

export class TransactionRepository {
  findAll(filters: TransactionFilters = {}): Promise<TransactionRow[]> {
    const q = db("transactions as t")
      .join("machines as m", "m.id", "t.machine_id")
      .join("products as p", "p.id", "t.product_id")
      .select("t.*", "m.name as machine_name", "p.name as product_name")
      .orderBy("t.created_at", "desc")
      .limit(100);
    if (filters.machine_id) q.where("t.machine_id", filters.machine_id);
    if (filters.status) q.where("t.status", filters.status);
    if (filters.from) q.where("t.created_at", ">=", filters.from);
    if (filters.to) q.where("t.created_at", "<=", filters.to);
    return q;
  }

  findById(id: number): Promise<TransactionRow | undefined> {
    return db("transactions as t")
      .join("machines as m", "m.id", "t.machine_id")
      .join("products as p", "p.id", "t.product_id")
      .select("t.*", "m.name as machine_name", "p.name as product_name")
      .where("t.id", id)
      .first();
  }

  findPayments(transactionId: number): Promise<PaymentBreakdown[]> {
    return db("transaction_payments as tp")
      .join("denominations as d", "d.id", "tp.denomination_id")
      .select("d.label", "d.value_satang", "tp.quantity")
      .where("tp.transaction_id", transactionId);
  }

  findChange(transactionId: number): Promise<ChangeBreakdown[]> {
    return db("transaction_change as tc")
      .join("denominations as d", "d.id", "tc.denomination_id")
      .select("d.label", "d.value_satang", "tc.quantity")
      .where("tc.transaction_id", transactionId);
  }

  create(
    data: {
      machine_id: number;
      product_id: number;
      product_price_thb: string;
      amount_inserted_thb: string;
      change_given_thb: string;
    },
    trx: Knex.Transaction,
  ): Promise<Transaction> {
    return trx("transactions")
      .insert({ ...data, status: "completed", completed_at: trx.fn.now() })
      .returning("*")
      .then(([row]) => row);
  }

  insertPayments(
    transactionId: number,
    payments: PaymentItem[],
    trx: Knex.Transaction,
  ): Promise<void> {
    return trx("transaction_payments").insert(
      payments.map((p) => ({
        transaction_id: transactionId,
        denomination_id: p.denomination_id,
        quantity: p.quantity,
      })),
    );
  }

  insertChange(transactionId: number, change: ChangeItem[], trx: Knex.Transaction): Promise<void> {
    if (!change.length) return Promise.resolve();
    return trx("transaction_change").insert(
      change.map((c) => ({
        transaction_id: transactionId,
        denomination_id: c.denomination_id,
        quantity: c.quantity,
      })),
    );
  }

  getDailySales(machineId?: number): Promise<DailySalesRow[]> {
    const q = db("v_daily_sales").orderBy("sale_date", "desc");
    if (machineId) q.where({ machine_id: machineId });
    return q;
  }
}

export const transactionRepo = new TransactionRepository();
