import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('denominations', (t) => {
    t.increments('id').primary()
    t.integer('value').notNullable().unique()

    t.string('label', 20).notNullable()
    t.specificType('type', 'denomination_type').notNullable()
  })

  await knex.schema.createTable('machine_cash_float', (t) => {
    t.bigInteger('machine_id').notNullable()
      .references('id').inTable('machines').onDelete('CASCADE')
    t.integer('denomination_id').notNullable()
      .references('id').inTable('denominations').onDelete('RESTRICT')
    t.integer('stock').notNullable().defaultTo(0)
    t.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now())
    t.primary(['machine_id', 'denomination_id'])
  })
  await knex.raw('CREATE INDEX idx_cash_float_machine ON machine_cash_float(machine_id)')
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('machine_cash_float')
  await knex.schema.dropTableIfExists('denominations')
}
