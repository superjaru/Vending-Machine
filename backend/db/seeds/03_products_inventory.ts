import type { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
  await knex("machine_inventory").del();
  await knex("products").del();

  const products = await knex("products")
    .insert([
      { name: "เป๊บซี่",nameEn: "Pepsi (330ml)", category: "drink", emoji: "🥤", price: 20.0 },
      { name: "โคล่า",nameEn: "Coca-Cola (330ml)", category: "drink",emoji: "🥤", price: 20.0 },
      { name: "น้ำช้าง",nameEn: "Chang Water (600ml)", category: "water", emoji: "💧", price: 10.0 },
      { name: "เลย์ ออริจินอล",nameEn: "Lays Original (48g)", category: "snack", emoji: "🍿", price: 25.0 },
      { name: "โอริโอ",nameEn: "Oreo Chocolate (86g)", category: "snack", emoji: "🍪", price: 30.0 },
      { name: "กระทิงแดง",nameEn: "Red Bull (150ml)", category: "drink", price: 35.0 },
      { name: "ชาเขียว",nameEn: "Green Tea (350ml)", category: "drink", emoji: "🍵", price: 15.0 },
      { name: "ป๊อกกี้",nameEn: "Pocky Chocolate (40g)", category: "snack",emoji: "🍫", price: 25.0 },
      { name: "สไปรต์",nameEn: "Sprite (330ml)", category: "drink", price: 20.0 },
    ])
    .returning("id");

  const machines = await knex("machines").select("id").orderBy("id");

  const rows = machines.flatMap((m: { id: number }) =>
    products.map((p: { id: number }) => ({
      machine_id: m.id,
      product_id: p.id,
      stock: Math.floor(Math.random() * 8) + 2,
      max_capacity: 10,
      low_stock_threshold: 2,
    })),
  );

  await knex("machine_inventory").insert(rows);
  console.log(`Seeded ${products.length} products, ${rows.length} inventory rows`);
}
