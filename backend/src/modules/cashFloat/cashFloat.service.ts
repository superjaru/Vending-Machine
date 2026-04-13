import { AppError }                       from '../../shared/middleware'
import { cashFloatRepo, denominationRepo } from './cashFloat.repo'
import { machineRepo }                     from '../machines/machines.repo'

export class CashFloatService {
  getAllDenominations() {
    return denominationRepo.findAll()
  }

  async getStockByMachineSerial(machineSerial: string) {
    const machine = await machineRepo.findByMachineSerial(machineSerial)
    if (!machine) throw new AppError('Machine not found', 404)
    return cashFloatRepo.findByMachine(machine.id)
  }

  async updateQuantity(machineId: number, denominationId: number, quantity: number) {
    const row = await cashFloatRepo.updateQuantity(machineId, denominationId, quantity)
    if (!row) throw new AppError('Cash float record not found', 404)
    return row
  }

  getSummary() {
    return cashFloatRepo.getSummary()
  }
}

export const cashFloatService = new CashFloatService()
