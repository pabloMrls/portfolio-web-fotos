import {dbPromise} from "./database.js";

async function init() {
    const db = await dbPromise;

    await db.exec(`
    CREATE TABLE IF NOT EXISTS reservas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT NOT NULL,
      mensaje TEXT,
      fotos TEXT,
      fecha TEXT
    )
  `);
    
    console.log("✅ DB inicializada")
}

init();