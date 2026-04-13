import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('products', (t) => {
    t.bigIncrements('id').primary()
    t.string('name', 120).notNullable()
    t.string('nameEn', 120).notNullable()
    t.string('category', 60)
    t.decimal('price', 10, 2).notNullable()
    t.text('image_url')
    t.string('emoji', 60).notNullable().defaultTo('❓')
    t.boolean('is_active').notNullable().defaultTo(true)
    t.timestamps(true, true)
  })

  await knex.raw('ALTER TABLE products ADD CONSTRAINT chk_price_positive CHECK (price >= 0)')
  await knex.raw('CREATE INDEX idx_products_category  ON products(category)')
  await knex.raw('CREATE INDEX idx_products_is_active ON products(is_active)')

  await knex.schema.createTable('machine_inventory', (t) => {
    t.bigInteger('machine_id').notNullable()
      .references('id').inTable('machines').onDelete('CASCADE')
    t.bigInteger('product_id').notNullable()
      .references('id').inTable('products').onDelete('CASCADE')
    t.integer('stock').notNullable().defaultTo(0)
    t.integer('max_capacity').notNullable().defaultTo(10)
    t.integer('low_stock_threshold').notNullable().defaultTo(2)
    t.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now())
    t.primary(['machine_id', 'product_id'])
  })

  // await knex.raw(`
  //   ALTER TABLE machine_inventory
  //     ADD CONSTRAINT chk_stock_gte_zero     CHECK (stock >= 0),
  //     ADD CONSTRAINT chk_capacity_positive  CHECK (max_capacity > 0),
  //     ADD CONSTRAINT chk_stock_lte_capacity CHECK (stock <= max_capacity)
  // `)
  await knex.raw('CREATE INDEX idx_inventory_machine ON machine_inventory(machine_id)')
  await knex.raw('CREATE INDEX idx_inventory_product ON machine_inventory(product_id)')
  await knex.raw(`
    CREATE INDEX idx_inventory_low ON machine_inventory(machine_id)
    WHERE stock <= low_stock_threshold
  `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('machine_inventory')
  await knex.schema.dropTableIfExists('products')
}
