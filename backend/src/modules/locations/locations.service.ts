import { AppError }    from '../../shared/middleware'
import { locationRepo } from './locations.repo'
import type { CreateLocationDto, UpdateLocationDto } from './locations.types'

export class LocationService {
  getAll() {
    return locationRepo.findAll()
  }

  async getById(id: number) {
    const row = await locationRepo.findById(id)
    if (!row) throw new AppError('Location not found', 404)
    return row
  }

  create(dto: CreateLocationDto) {
    return locationRepo.create(dto)
  }

  async update(id: number, dto: UpdateLocationDto) {
    const row = await locationRepo.update(id, dto)
    if (!row) throw new AppError('Location not found', 404)
    return row
  }

  async deactivate(id: number) {
    const count = await locationRepo.softDelete(id)
    if (!count) throw new AppError('Location not found', 404)
  }
}

export const locationService = new LocationService()
