import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("machine_cash_float").del();

  const machines = await knex("machines").select("id");
  const denominations = await knex("denominations").select("id", "type");

  const rows = machines.flatMap((m: { id: number }) =>
    denominations.map((d: { id: number; type: string }) => ({
      machine_id: m.id,
      denomination_id: d.id,
      stock: d.type === "coin" ? 10 : 10,
    })),
  );

  await knex("machine_cash_float").insert(rows);
  console.log(`✓  Seeded cash float: ${rows.length} rows`);
}
