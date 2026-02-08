//conexión a la base de datos
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export const dbPromise = open({
  filename: "./db/reservas.db",
  driver: sqlite3.Database,
}).then(async (db) => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS reservas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT,
      email TEXT,
      mensaje TEXT,
      fotos TEXT,
      estado TEXT DEFAULT 'pendiente',
      fecha TEXT
    )
  `);

  return db;
});

//Abre (o crea) database.db
//Devuelve una promesa reutilizable