import { Router } from 'express'
import { body, param } from 'express-validator'
import { asyncHandler, validate } from '../../shared/middleware'
import { InventoryController }    from './inventory.controller'

const router = Router()


// GET /inventory/:machineId
router.get('/:machineId',
  param('machineId').isInt(),
  validate,
  asyncHandler(InventoryController.getByMachine),
)

export default router
