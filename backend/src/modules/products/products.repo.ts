import { Knex } from "knex";
import db from "../../shared/db";
import type { Product } from "../../shared/types";
import type { CreateProductDto, UpdateProductDto, ProductFilters } from "./products.types";

export class ProductRepository {
  async findAll(serialNumber: string, filters: ProductFilters = {}): Promise<Product[]> {
    const q = db("machine_inventory as mi")
      .join("products as p", "p.id", "mi.product_id")
      .join("machines as m", "m.id", "mi.machine_id")
      .select(
        "p.id",
        "p.name",
        "p.nameEn",
        "p.emoji",
        "p.category",
        "p.price",
        "p.image_url",
        "p.is_active",
        "p.created_at",
        "p.updated_at",
        "mi.stock",
        "mi.max_capacity",
        "mi.low_stock_threshold",
      )
      .where("m.serial_number", serialNumber)
      .orderBy("p.category")
      .orderBy("p.name");

    if (filters.category !== undefined) q.where("p.category", filters.category);
    if (filters.active !== undefined) q.where("p.is_active", filters.active);

    return q;
  }
  async findActiveById(id: number, trx?: Knex.Transaction): Promise<Product | undefined> {
    return (trx ?? db)("products").where({ id, is_active: true }).first();
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product | undefined> {
    return db("products")
      .where({ id })
      .update({ ...dto, updated_at: db.fn.now() })
      .returning("*")
      .then(([row]) => row);
  }
}

export const productRepo = new ProductRepository();
