import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    DO $$ BEGIN
      CREATE TYPE machine_status     AS ENUM ('active', 'maintenance', 'offline');
      CREATE TYPE denomination_type  AS ENUM ('coin', 'banknote');
      CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'cancelled', 'refunded');
    EXCEPTION WHEN duplicate_object THEN NULL;
    END $$;
  `)

  await knex.schema.createTable('locations', (t) => {
    t.bigIncrements('id').primary()
    t.string('name', 120).notNullable()
    t.text('address')
    t.string('city', 80)
    t.boolean('is_active').notNullable().defaultTo(true)
    t.timestamps(true, true)
  })

  await knex.schema.createTable('machines', (t) => {
    t.bigIncrements('id').primary()
    t.bigInteger('location_id').notNullable()
      .references('id').inTable('locations').onDelete('RESTRICT')
    t.string('serial_number', 60).notNullable().unique()
    t.string('name', 120)
    t.specificType('status', 'machine_status').notNullable().defaultTo('active')
    t.timestamp('last_restocked_at', { useTz: true })
    t.timestamps(true, true)
  })

  await knex.raw('CREATE INDEX idx_machines_location ON machines(location_id)')
  await knex.raw('CREATE INDEX idx_serial_number ON machines(serial_number)')
  await knex.raw('CREATE INDEX idx_machines_status   ON machines(status)')
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('machines')
  await knex.schema.dropTableIfExists('locations')
  await knex.raw(`
    DROP TYPE IF EXISTS machine_status;
    DROP TYPE IF EXISTS denomination_type;
    DROP TYPE IF EXISTS transaction_status;
  `)
}
