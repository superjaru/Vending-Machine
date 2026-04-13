import { Request, Response } from 'express'
import { locationService }   from './locations.service'

export const LocationController = {
  getAll: async (_req: Request, res: Response) => {
    res.json({ success: true, data: await locationService.getAll() })
  },

  getById: async (req: Request, res: Response) => {
    res.json({ success: true, data: await locationService.getById(Number(req.params.id)) })
  },

  create: async (req: Request, res: Response) => {
    res.status(201).json({ success: true, data: await locationService.create(req.body) })
  },

  update: async (req: Request, res: Response) => {
    res.json({ success: true, data: await locationService.update(Number(req.params.id), req.body) })
  },

  deactivate: async (req: Request, res: Response) => {
    await locationService.deactivate(Number(req.params.id))
    res.json({ success: true, message: 'Location deactivated' })
  },
}
