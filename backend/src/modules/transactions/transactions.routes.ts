import { Router } from 'express'
import { body, param, query } from 'express-validator'
import { asyncHandler, validate } from '../../shared/middleware'
import { TransactionController }  from './transactions.controller'

const router = Router()

router.get('/',
  query('machine_id').optional().isInt(),
  query('status').optional().isIn(['pending', 'completed', 'cancelled', 'refunded']),
  query('from').optional().isISO8601(),
  query('to').optional().isISO8601(),
  validate,
  asyncHandler(TransactionController.getAll),
)


router.get('/:id',
  param('id').isInt(),
  validate,
  asyncHandler(TransactionController.getById),
)

router.post('/',
  body('machine_serial').isString(),
  body('product_id').isInt(),
  body('payments').isArray({ min: 1 }),
  body('payments.*.denomination_id').isInt(),
  body('payments.*.quantity').isInt({ min: 1 }),
  validate,
  asyncHandler(TransactionController.purchase),
)

export default router
