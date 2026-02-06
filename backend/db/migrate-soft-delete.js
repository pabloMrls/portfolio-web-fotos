import { dbPromise } from "./database.js";

async function migrate() {
    const db = await dbPromise;

    await db.exec(`
    ALTER TABLE reservas
    ADD COLUMN eliminada INTEGER DEFAULT 0
  `);

  console.log("✅ Columna eliminada agregada");
}

migrate();