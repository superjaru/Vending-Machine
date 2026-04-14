import { Knex } from "knex";
import db from "../../shared/db";
import type { Denomination, MachineCashFloat } from "../../shared/types";
import type { CashFloatRow, CashFloatSummaryRow } from "./cashFloat.types";

export interface DenomStock {
  id: number;
  value: number;
  stock: number;
}

export class DenominationRepository {
  findAll(): Promise<Denomination[]> {
    return db("denominations").orderBy("value");
  }

  findByIds(ids: number[], trx?: Knex.Transaction): Promise<Denomination[]> {
    return (trx ?? db)("denominations").whereIn("id", ids);
  }
}

export class CashFloatRepository {
  findByMachine(machineId: number): Promise<CashFloatRow[]> {
    return db("machine_cash_float as mcf")
      .join("denominations as d", "d.id", "mcf.denomination_id")
      .select("d.id as denomination_id", "d.label", "d.type", "d.value", "mcf.stock")
      .where("mcf.machine_id", machineId)
      .orderBy("d.value");
  }

  findFloatForChange(machineId: number, trx: Knex.Transaction): Promise<DenomStock[]> {
    return trx("machine_cash_float as mcf")
      .join("denominations as d", "d.id", "mcf.denomination_id")
      .select("d.id", "d.value", "mcf.stock")
      .where("mcf.machine_id", machineId)
      .orderBy("d.value", "desc");
  }

  updateQuantity(
    machineId: number,
    denominationId: number,
    quantity: number,
  ): Promise<MachineCashFloat | undefined> {
    return db("machine_cash_float")
      .where({ machine_id: machineId, denomination_id: denominationId })
      .update({ quantity, updated_at: db.fn.now() })
      .returning("*")
      .then(([row]) => row);
  }

  async increment(
    machineId: number,
    denominationId: number,
    qty: number,
    trx: Knex.Transaction,
  ): Promise<void> {
    await trx("machine_cash_float")
      .where({ machine_id: machineId, denomination_id: denominationId })
      .increment("stock", qty);
  }

  async decrement(
    machineId: number,
    denominationId: number,
    qty: number,
    trx: Knex.Transaction,
  ): Promise<void> {
    await trx("machine_cash_float")
      .where({ machine_id: machineId, denomination_id: denominationId })
      .decrement("stock", qty);
  }

}

export const denominationRepo = new DenominationRepository();
export const cashFloatRepo = new CashFloatRepository();
