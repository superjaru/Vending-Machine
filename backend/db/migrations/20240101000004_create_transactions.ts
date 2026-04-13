import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('transactions', (t) => {
    t.bigIncrements('id').primary()
    t.bigInteger('machine_id').notNullable()
      .references('id').inTable('machines').onDelete('RESTRICT')
    t.bigInteger('product_id').notNullable()
      .references('id').inTable('products').onDelete('RESTRICT')
    t.specificType('status', 'transaction_status').notNullable().defaultTo('pending')
    t.decimal('product_price_thb', 10, 2).notNullable()
    t.decimal('amount_inserted_thb', 10, 2).notNullable().defaultTo(0)
    t.decimal('change_given_thb', 10, 2).notNullable().defaultTo(0)
    t.timestamp('created_at',   { useTz: true }).notNullable().defaultTo(knex.fn.now())
    t.timestamp('completed_at', { useTz: true })
  })

  await knex.raw(`
    ALTER TABLE transactions
      ADD CONSTRAINT chk_price_positive     CHECK (product_price_thb   >= 0),
      ADD CONSTRAINT chk_inserted_positive  CHECK (amount_inserted_thb >= 0),
      ADD CONSTRAINT chk_change_positive    CHECK (change_given_thb    >= 0),
      ADD CONSTRAINT chk_change_lte_inserted CHECK (change_given_thb <= amount_inserted_thb)
  `)
  await knex.raw('CREATE INDEX idx_tx_machine      ON transactions(machine_id)')
  await knex.raw('CREATE INDEX idx_tx_product      ON transactions(product_id)')
  await knex.raw('CREATE INDEX idx_tx_status       ON transactions(status)')
  await knex.raw('CREATE INDEX idx_tx_created_at   ON transactions(created_at DESC)')
  await knex.raw('CREATE INDEX idx_tx_machine_date ON transactions(machine_id, created_at DESC)')

  await knex.schema.createTable('transaction_payments', (t) => {
    t.bigIncrements('id').primary()
    t.bigInteger('transaction_id').notNullable()
      .references('id').inTable('transactions').onDelete('CASCADE')
    t.integer('denomination_id').notNullable()
      .references('id').inTable('denominations').onDelete('RESTRICT')
    t.integer('quantity').notNullable()
  })
  await knex.raw('ALTER TABLE transaction_payments ADD CONSTRAINT chk_payment_qty_positive CHECK (quantity > 0)')
  await knex.raw('CREATE INDEX idx_payments_tx ON transaction_payments(transaction_id)')

  await knex.schema.createTable('transaction_change', (t) => {
    t.bigIncrements('id').primary()
    t.bigInteger('transaction_id').notNullable()
      .references('id').inTable('transactions').onDelete('CASCADE')
    t.integer('denomination_id').notNullable()
      .references('id').inTable('denominations').onDelete('RESTRICT')
    t.integer('quantity').notNullable()
  })
  await knex.raw('ALTER TABLE transaction_change ADD CONSTRAINT chk_change_qty_positive CHECK (quantity > 0)')
  await knex.raw('CREATE INDEX idx_change_tx ON transaction_change(transaction_id)')

  // ── Views ────────────────────────────────────────────────────
  // await knex.raw(`
  //   CREATE VIEW v_low_stock AS
  //   SELECT m.id AS machine_id, m.name AS machine_name, l.name AS location_name,
  //          p.id AS product_id, p.name AS product_name,
  //          mi.stock, mi.low_stock_threshold
  //   FROM machine_inventory mi
  //   JOIN machines  m ON m.id = mi.machine_id
  //   JOIN locations l ON l.id = m.location_id
  //   JOIN products  p ON p.id = mi.product_id
  //   WHERE mi.stock <= mi.low_stock_threshold AND m.status = 'active'
  // `)

  // await knex.raw(`
  //   CREATE VIEW v_daily_sales AS
  //   SELECT t.machine_id, m.name AS machine_name, l.name AS location_name,
  //          DATE(t.created_at AT TIME ZONE 'Asia/Bangkok') AS sale_date,
  //          COUNT(*)                AS total_transactions,
  //          SUM(t.product_price_thb) AS total_revenue_thb
  //   FROM transactions t
  //   JOIN machines  m ON m.id = t.machine_id
  //   JOIN locations l ON l.id = m.location_id
  //   WHERE t.status = 'completed'
  //   GROUP BY t.machine_id, m.name, l.name,
  //            DATE(t.created_at AT TIME ZONE 'Asia/Bangkok')
  // `)

  // await knex.raw(`
  //   CREATE VIEW v_cash_float_summary AS
  //   SELECT mcf.machine_id, m.name AS machine_name,
  //          SUM(mcf.quantity * d.value) AS total_cash_thb
  //   FROM machine_cash_float mcf
  //   JOIN machines      m ON m.id = mcf.machine_id
  //   JOIN denominations d ON d.id = mcf.denomination_id
  //   GROUP BY mcf.machine_id, m.name
  // `)
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP VIEW IF EXISTS v_cash_float_summary')
  await knex.raw('DROP VIEW IF EXISTS v_daily_sales')
  await knex.raw('DROP VIEW IF EXISTS v_low_stock')
  await knex.schema.dropTableIfExists('transaction_change')
  await knex.schema.dropTableIfExists('transaction_payments')
  await knex.schema.dropTableIfExists('transactions')
}
