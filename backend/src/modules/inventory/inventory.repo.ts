import { Knex } from 'knex'
import db from '../../shared/db'
import type { MachineInventory } from '../../shared/types'
import type { SetInventoryDto, InventoryRow, LowStockRow } from './inventory.types'

export class InventoryRepository {
  findByMachine(machineId: number): Promise<InventoryRow[]> {
    return db('machine_inventory as mi')
      .join('products as p', 'p.id', 'mi.product_id')
      .select(
        'p.id as product_id',
        'p.name',
        'p.category',
        'p.price_thb',
        'p.image_url',
        'mi.stock',
        'mi.max_capacity',
        'mi.low_stock_threshold',
        'mi.updated_at',
      )
      .where('mi.machine_id', machineId)
      .orderBy('p.category')
  }

  findOne(
    machineId: number,
    productId: number,
    trx?: Knex.Transaction,
  ): Promise<MachineInventory | undefined> {
    return (trx ?? db)('machine_inventory')
      .where({ machine_id: machineId, product_id: productId })
      .first()
  }

  // upsert(
  //   machineId: number,
  //   productId: number,
  //   dto: SetInventoryDto,
  // ): Promise<MachineInventory> {
  //   return db('machine_inventory')
  //     .insert({ machine_id: machineId, product_id: productId, ...dto })
  //     .onConflict(['machine_id', 'product_id'])
  //     .merge({ ...dto, updated_at: db.fn.now() })
  //     .returning('*')
  //     .then(([row]) => row)
  // }

  async decrementStock(
    machineId: number,
    productId: number,
    trx: Knex.Transaction,
  ): Promise<void> {
    await trx('machine_inventory')
      .where({ machine_id: machineId, product_id: productId })
      .decrement('stock', 1)
      .update({ updated_at: trx.fn.now() })
  }

  // getLowStock(): Promise<LowStockRow[]> {
  //   return db('v_low_stock').orderBy('location_name').orderBy('machine_name')
  // }
}

export const inventoryRepo = new InventoryRepository()
