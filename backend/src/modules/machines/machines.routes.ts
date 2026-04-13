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

router.post('/',
  body('location_id').isInt(),
  body('serial_number').notEmpty().trim(),
  body('name').optional().trim(),
  validate,
  asyncHandler(MachineController.create),
)

router.patch('/:id',
  param('id').isInt(),
  body('status').optional().isIn(['active', 'maintenance', 'offline']),
  body('name').optional().trim(),
  validate,
  asyncHandler(MachineController.update),
)

export default router
