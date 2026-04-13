import { Request, Response } from 'express'
import { productService }    from './products.service'
import type { ProductFilters } from './products.types'

export const ProductController = {
  getAll: async (req: Request, res: Response) => {
    const machineSerial = req.query.machine_serial as string;
    const filters: ProductFilters = {
      category: req.query.category as string | undefined,
      active:   req.query.active !== undefined ? req.query.active === 'true' : undefined,
    }
    res.json({ success: true, data: await productService.getAll(machineSerial, filters) })
  },

  // getById: async (req: Request, res: Response) => {
  //   res.json({ success: true, data: await productService.getById(Number(req.params.id)) })
  // },

  // create: async (req: Request, res: Response) => {
  //   res.status(201).json({ success: true, data: await productService.create(req.body) })
  // },

  update: async (req: Request, res: Response) => {
    res.json({ success: true, data: await productService.update(Number(req.params.id), req.body) })
  },
}
