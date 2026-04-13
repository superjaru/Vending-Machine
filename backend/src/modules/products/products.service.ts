import { AppError }   from '../../shared/middleware'
import { productRepo } from './products.repo'
import type { CreateProductDto, UpdateProductDto, ProductFilters } from './products.types'

export class ProductService {
  getAll(machineSerial: string, filters: ProductFilters) {
    return productRepo.findAll(machineSerial, filters)
  }

  // async getById(id: number) {
  //   const row = await productRepo.findById(id)
  //   if (!row) throw new AppError('Product not found', 404)
  //   return row
  // }

  // create(dto: CreateProductDto) {
  //   return productRepo.create(dto)
  // }

  async update(id: number, dto: UpdateProductDto) {
    const row = await productRepo.update(id, dto)
    if (!row) throw new AppError('Product not found', 404)
    return row
  }
}

export const productService = new ProductService()
