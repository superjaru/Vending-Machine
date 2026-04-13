import { InventoryService } from '../../src/modules/inventory/inventory.service'
import { AppError }          from '../../src/shared/middleware'

jest.mock('../../src/modules/inventory/inventory.repo', () => ({
  inventoryRepo: {
    findByMachine: jest.fn(),
    findOne:       jest.fn(),
    upsert:        jest.fn(),
    getLowStock:   jest.fn(),
  },
}))

jest.mock('../../src/modules/machines/machines.repo', () => ({
  machineRepo: {
    findById: jest.fn(),
  },
}))

import { inventoryRepo } from '../../src/modules/inventory/inventory.repo'
import { machineRepo }   from '../../src/modules/machines/machines.repo'

const mockMachine = { id: 1, name: 'CW-001', location_id: 1, status: 'active' }

const mockInventoryRows = [
  { product_id: 1, name: 'Pepsi', category: 'drink', price_thb: '20.00', image_url: null, stock: 8, max_capacity: 10, low_stock_threshold: 2, updated_at: new Date() },
  { product_id: 2, name: 'Lays', category: 'snack', price_thb: '25.00', image_url: null, stock: 1, max_capacity: 10, low_stock_threshold: 2, updated_at: new Date() },
]

const mockLowStock = [
  { machine_id: 1, machine_name: 'CW-001', location_name: 'Central World', product_id: 2, product_name: 'Lays', stock: 1, low_stock_threshold: 2 },
]

describe('InventoryService', () => {
  let service: InventoryService

  beforeEach(() => { service = new InventoryService() })

  describe('getByMachine', () => {
    it('returns inventory rows for a valid machine', async () => {
      ;(machineRepo.findById      as jest.Mock).mockResolvedValue(mockMachine)
      ;(inventoryRepo.findByMachine as jest.Mock).mockResolvedValue(mockInventoryRows)

      const result = await service.getByMachine(1)
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Pepsi')
    })

    it('throws 404 when machine does not exist', async () => {
      ;(machineRepo.findById as jest.Mock).mockResolvedValue(undefined)
      await expect(service.getByMachine(999))
        .rejects.toThrow(new AppError('Machine not found', 404))
    })
  })

  describe('setStock', () => {
    it('upserts and returns the inventory row', async () => {
      const row = { machine_id: 1, product_id: 1, stock: 5, max_capacity: 10, low_stock_threshold: 2, updated_at: new Date() }
      ;(inventoryRepo.upsert as jest.Mock).mockResolvedValue(row)

      const result = await service.setStock(1, 1, { stock: 5 })
      expect(inventoryRepo.upsert).toHaveBeenCalledWith(1, 1, { stock: 5 })
      expect(result.stock).toBe(5)
    })
  })

  describe('getLowStock', () => {
    it('returns low stock rows from the view', async () => {
      ;(inventoryRepo.getLowStock as jest.Mock).mockResolvedValue(mockLowStock)

      const result = await service.getLowStock()
      expect(result).toHaveLength(1)
      expect(result[0].product_name).toBe('Lays')
      expect(result[0].stock).toBeLessThanOrEqual(result[0].low_stock_threshold)
    })
  })
})
