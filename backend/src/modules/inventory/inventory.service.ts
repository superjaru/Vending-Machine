import { AppError }      from '../../shared/middleware'
import { inventoryRepo }  from './inventory.repo'
import { machineRepo }    from '../machines/machines.repo'
import type { SetInventoryDto } from './inventory.types'

export class InventoryService {
  async getByMachine(machineId: number) {
    const machine = await machineRepo.findById(machineId)
    if (!machine) throw new AppError('Machine not found', 404)
    return inventoryRepo.findByMachine(machineId)
  }
}

export const inventoryService = new InventoryService()
