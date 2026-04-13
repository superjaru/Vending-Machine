import { Router } from 'express'
import { body, param } from 'express-validator'
import { asyncHandler, validate } from '../../shared/middleware'
import { CashFloatController }    from './cashFloat.controller'

const router = Router()

// // GET /cash-float/denominations
// router.get('/denominations',
//   asyncHandler(CashFloatController.getDenominations),
// )

// // GET /cash-float/summary
// router.get('/summary',
//   asyncHandler(CashFloatController.getSummary),
// )

// GET /cash-float/:machineSerial
router.get('/:machine_serial',
  param('machine_serial').isString(),
  validate,
  asyncHandler(CashFloatController.getByMachineSerial),
)

// // PATCH /cash-float/:machineId/:denominationId
// router.patch('/:machineId/:denominationId',
//   param('machineId').isInt(),
//   param('denominationId').isInt(),
//   body('quantity').isInt({ min: 0 }),
//   validate,
//   asyncHandler(CashFloatController.updateQuantity),
// )

export default router
