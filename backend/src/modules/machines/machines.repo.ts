
import db from '../../shared/db';
import type { Machine } from '../../shared/types'
import type { CreateMachineDto, UpdateMachineDto, MachineFilters } from './machines.types'

type MachineWithLocation = Machine & { location_name: string; city: string | null }

export class MachineRepository {
  findAll(filters: MachineFilters = {}): Promise<MachineWithLocation[]> {
    const q = db('machines as m')
      .join('locations as l', 'l.id', 'm.location_id')
      .select('m.*', 'l.name as location_name', 'l.city')
      .orderBy('m.id')
    if (filters.location_id) q.where('m.location_id', filters.location_id)
    if (filters.status)      q.where('m.status', filters.status)
    return q
  }

  findById(id: number): Promise<MachineWithLocation | undefined> {
    return db('machines as m')
      .join('locations as l', 'l.id', 'm.location_id')
      .select('m.*', 'l.name as location_name', 'l.city')
      .where('m.id', id)
      .first()
  }

  findByMachineSerial(machineSerial: string): Promise<MachineWithLocation | undefined> {
    return db('machines')
      .select('*')
      .where('serial_number', machineSerial)
      .first()
  }

}

export const machineRepo = new MachineRepository()
