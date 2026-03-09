import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction
    ? { rejectUnauthorized: false }
    : false
});

pool.on("connect", async () => {
  console.log("PostgreSQL conectado");
  await pool.query("SET search_path TO public");
});

pool.on("error", (err) => {
  console.error("Error inesperado en PostgreSQL", err);
});


// export const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: {
//     rejectUnauthorized: false
//   }
// });

// pool.on("connect", () => {
//   console.log("PostgreSQL conectado");
// });

// pool.on("error", (err) => {
//   console.error("Error inesperado en PostgreSQL", err);
// });

// export const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,

//   ssl: process.env.NODE_ENV === "production"
//    d ? { rejectUnauthorized: false }
//     : false
// });


// pool.on("connect", () => {
//   console.log("PostgreSQL conectado");
// });

// pool.on("error", (err) => {
//   console.error("Error inesperado en PostgreSQL", err);
// });
