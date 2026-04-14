import { Router } from 'express'
import { body, param, query } from 'express-validator'
import { asyncHandler, validate } from '../../shared/middleware'
import { MachineController }      from './machines.controller'

const router = Router()

router.get('/',
  query('location_id').optional().isInt(),
  query('status').optional().isIn(['active', 'maintenance', 'offline']),
  validate,
  asyncHandler(MachineController.getAll),
)

router.get('/:id',
  param('id').isInt(),
  validate,
  asyncHandler(MachineController.getById),
)

export default router
