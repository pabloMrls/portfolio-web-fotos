import express from "express"
import {dbPromise} from "../db/database.js";

const router = express.Router();

// Crear una reserva 
router.post("/", async (req, res) => {
  const {nombre, email, mensaje, fotos, fecha} = req.body;

  if(!nombre || !email) {
    return res.status(400).json({error: "Nombres e email requeridos"});
  }

  const db = await dbPromise;

  const result = await db.run (
     `
    INSERT INTO reservas (nombre, email, mensaje, fotos, fecha)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      nombre,
      email,
      mensaje ?? "",
      JSON.stringify(fotos),
      fecha
    ]

  );

    res.json({ id: result.lastID });
});

//Get todas las reservas
router.get("/", async (req, res)=> {
  const db = await dbPromise;

    const reservas = await db.all(`
    SELECT *
    FROM reservas
    WHERE eliminada = 0
    ORDER BY fecha DESC
  `);
  // Parsear fotos (vuelven como string)
   const reservasParseadas = reservas.map(r => ({
    ...r,
    fotos: JSON.parse(r.fotos)
  }));

  res.json(reservasParseadas);
});

//DELETE eliminar reserva
router.delete("/:id", async (req, res) => {
  const {id} = req.params;

  const db = await dbPromise;

  const result = await db.run(
    `
    UPDATE reservas
    SET eliminada = 1
    WHERE id = ?
    `,
    id
  );

  if (result.changes === 0) {
    return res.status(404).json({ error: "Reserva no encontrada" });
  }

  res.json({ ok: true });
})
//result.changes -> se borró algo
// si no existe -> 404 corecto
// endpoint REST

/* --------------*/
router.get("/eliminadas", async (req, res) => {
  const db = await dbPromise;

  const reservas = await db.all(`
    SELECT *
    FROM reservas
    WHERE eliminada = 1
    ORDER BY fecha DESC
  `);

  const parseadas = reservas.map(r => ({
    ...r,
    fotos: JSON.parse(r.fotos)
  }));

  res.json(parseadas);
});
//RESTAURAR reserva (undo soft delete)
router.patch("/:id/restaurar", async (req, res) => {
  const {id} = req.params;
  const db = await dbPromise;

  const result = await db.run (
     `
    UPDATE reservas
    SET eliminada = 0
    WHERE id = ?
    `,
    id
  );
  if(result.changes === 0) {
    return res.status(404).json({error: "Reserva no encontrada"})
  }
  res.json({ok: true});
});
/*Patch no toca fotos, fecha, ni da
Reversible
*/
export default router;

















// // routes/reservas.js
// import express from "express";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const router = express.Router();

// // path al JSON
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const reservasPath = path.join(__dirname, "../data/reservas.json");

// // helpers
// function leerReservas() {
//   if (!fs.existsSync(reservasPath)) {
//     fs.mkdirSync(path.dirname(reservasPath), { recursive: true });
//     fs.writeFileSync(reservasPath, "[]", "utf-8");
//   }
//   return JSON.parse(fs.readFileSync(reservasPath, "utf-8"));
// }

// function guardarReservas(reservas) {
//   fs.writeFileSync(reservasPath, JSON.stringify(reservas, null, 2), "utf-8");
// }

// // POST /api/reservas
// router.post("/", (req, res) => {
//   const { nombre, email, mensaje, fotos } = req.body;

//   if (!email) {
//     return res.status(400).json({ ok: false });
//   }

//   const nuevaReserva = {
//     id: `rsv_${Date.now()}`,
//     nombre,
//     email,
//     mensaje,
//     fotos,
//     estado: "pendiente",
//     fecha: new Date().toISOString()
//   };

//   const reservas = leerReservas();
//   reservas.push(nuevaReserva);
//   guardarReservas(reservas);

//   console.log("💾 Reserva guardada:", nuevaReserva);

//   res.json({ ok: true, reserva: nuevaReserva });
// });

// // GET /api/reservas
// router.get("/", (req, res) => {
//   const reservas = leerReservas();
//   res.json(reservas);
// });

// export default router;
