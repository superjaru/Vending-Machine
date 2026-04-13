import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("denominations").del();
  await knex("denominations").insert([
    { value: 1, label: "1", type: "coin" },
    { value: 5, label: "5", type: "coin" },
    { value: 10, label: "10", type: "coin" },
    { value: 20, label: "20", type: "banknote" },
    { value: 50, label: "50", type: "banknote" },
    { value: 100, label: "100", type: "banknote" },
    { value: 500, label: "500", type: "banknote" },
    { value: 1000, label: "1000", type: "banknote" },
  ]);
  console.log("✓  Seeded denominations (8 rows)");
}