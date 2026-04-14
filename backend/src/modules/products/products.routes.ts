import { Router } from 'express'
import { body, param, query } from 'express-validator'
import { asyncHandler, validate } from '../../shared/middleware'
import { ProductController }      from './products.controller'

const router = Router()

router.get('/',
  query('active').optional().isBoolean(),
  validate,
  asyncHandler(ProductController.getAll),
)



router.patch('/:id',
  param('id').isInt(),
  body('price_thb').optional().isFloat({ min: 0 }),
  body('is_active').optional().isBoolean(),
  validate,
  asyncHandler(ProductController.update),
)

export default router
