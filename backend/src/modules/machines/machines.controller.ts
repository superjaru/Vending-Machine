import { Request, Response } from 'express'
import { machineService }    from './machines.service'
import type { MachineFilters } from './machines.types'
import type { MachineStatus }  from '../../shared/types'

export const MachineController = {
  getAll: async (req: Request, res: Response) => {
    const filters: MachineFilters = {
      location_id: req.query.location_id ? Number(req.query.location_id) : undefined,
      status:      req.query.status as MachineStatus | undefined,
    }
    res.json({ success: true, data: await machineService.getAll(filters) })
  },

  getById: async (req: Request, res: Response) => {
    res.json({ success: true, data: await machineService.getById(Number(req.params.id)) })
  },

  create: async (req: Request, res: Response) => {
    res.status(201).json({ success: true, data: await machineService.create(req.body) })
  },

  update: async (req: Request, res: Response) => {
    res.json({ success: true, data: await machineService.update(Number(req.params.id), req.body) })
  },
}
