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

router.get('/:id',
  param('id').isInt(),
  validate,
  asyncHandler(ProductController.getById),
)

router.post('/',
  body('name').notEmpty().trim(),
  body('price_thb').isFloat({ min: 0 }),
  body('category').optional().trim(),
  body('image_url').optional().isURL(),
  validate,
  asyncHandler(ProductController.create),
)

router.patch('/:id',
  param('id').isInt(),
  body('price_thb').optional().isFloat({ min: 0 }),
  body('is_active').optional().isBoolean(),
  validate,
  asyncHandler(ProductController.update),
)

export default router
