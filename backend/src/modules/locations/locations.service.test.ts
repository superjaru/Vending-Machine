import { LocationService } from '../../src/modules/locations/locations.service'
import { AppError }         from '../../src/shared/middleware'

jest.mock('../../src/modules/locations/locations.repo', () => ({
  locationRepo: {
    findAll:    jest.fn(),
    findById:   jest.fn(),
    create:     jest.fn(),
    update:     jest.fn(),
    softDelete: jest.fn(),
  },
}))

import { locationRepo } from '../../src/modules/locations/locations.repo'

const mockLocation = {
  id: 1, name: 'Central World', address: '4 Ratchadamri Rd',
  city: 'Bangkok', is_active: true,
  created_at: new Date(), updated_at: new Date(),
}

describe('LocationService', () => {
  let service: LocationService

  beforeEach(() => { service = new LocationService() })

  describe('getAll', () => {
    it('returns all locations', async () => {
      ;(locationRepo.findAll as jest.Mock).mockResolvedValue([mockLocation])
      const result = await service.getAll()
      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Central World')
    })
  })

  describe('getById', () => {
    it('returns the location when found', async () => {
      ;(locationRepo.findById as jest.Mock).mockResolvedValue(mockLocation)
      expect((await service.getById(1)).id).toBe(1)
    })

    it('throws 404 when not found', async () => {
      ;(locationRepo.findById as jest.Mock).mockResolvedValue(undefined)
      await expect(service.getById(999)).rejects.toThrow(new AppError('Location not found', 404))
    })
  })

  describe('create', () => {
    it('creates and returns the location', async () => {
      ;(locationRepo.create as jest.Mock).mockResolvedValue(mockLocation)
      const result = await service.create({ name: 'Central World', city: 'Bangkok' })
      expect(locationRepo.create).toHaveBeenCalledWith({ name: 'Central World', city: 'Bangkok' })
      expect(result.name).toBe('Central World')
    })
  })

  describe('update', () => {
    it('updates and returns the location', async () => {
      const updated = { ...mockLocation, name: 'CW Renamed' }
      ;(locationRepo.update as jest.Mock).mockResolvedValue(updated)
      expect((await service.update(1, { name: 'CW Renamed' })).name).toBe('CW Renamed')
    })

    it('throws 404 when location does not exist', async () => {
      ;(locationRepo.update as jest.Mock).mockResolvedValue(undefined)
      await expect(service.update(999, { name: 'Ghost' }))
        .rejects.toThrow(new AppError('Location not found', 404))
    })
  })

  describe('deactivate', () => {
    it('soft-deletes successfully', async () => {
      ;(locationRepo.softDelete as jest.Mock).mockResolvedValue(1)
      await expect(service.deactivate(1)).resolves.toBeUndefined()
    })

    it('throws 404 when location does not exist', async () => {
      ;(locationRepo.softDelete as jest.Mock).mockResolvedValue(0)
      await expect(service.deactivate(999))
        .rejects.toThrow(new AppError('Location not found', 404))
    })
  })
})
