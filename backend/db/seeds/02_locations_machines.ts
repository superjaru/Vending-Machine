import type { Knex } from 'knex'

export async function seed(knex: Knex): Promise<void> {
  await knex('machines').del()
  await knex('locations').del()

  const [loc1, loc2] = await knex('locations')
    .insert([
      { name: 'Central World', address: '4 Ratchadamri Rd', city: 'Bangkok' },
      { name: 'Siam Paragon',  address: '991 Rama I Rd',    city: 'Bangkok' },
    ])
    .returning('id')

  await knex('machines').insert([
    { location_id: loc1.id, serial_number: 'TEST-CW-001', name: 'Central World — Ground Floor', status: 'active' },
    { location_id: loc1.id, serial_number: 'VM-CW-002', name: 'Central World — Food Court',   status: 'active' },
    { location_id: loc2.id, serial_number: 'VM-SP-001', name: 'Siam Paragon — B1',            status: 'active' },
  ])

  console.log('✓  Seeded 2 locations, 3 machines')
}
