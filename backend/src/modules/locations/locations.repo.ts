import db from '../../shared/db'
import type { Location } from '../../shared/types'
import type { CreateLocationDto, UpdateLocationDto } from './locations.types'

export class LocationRepository {
  findAll(): Promise<Location[]> {
    return db('locations').orderBy('id')
  }

  findById(id: number): Promise<Location | undefined> {
    return db('locations').where({ id }).first()
  }

  create(dto: CreateLocationDto): Promise<Location> {
    return db('locations').insert(dto).returning('*').then(([row]) => row)
  }

  update(id: number, dto: UpdateLocationDto): Promise<Location | undefined> {
    return db('locations')
      .where({ id })
      .update({ ...dto, updated_at: db.fn.now() })
      .returning('*')
      .then(([row]) => row)
  }

  softDelete(id: number): Promise<number> {
    return db('locations').where({ id }).update({ is_active: false })
  }
}

export const locationRepo = new LocationRepository()
