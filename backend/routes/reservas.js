import express from "express";
import {dbPromise} from "../db/database.js"


const router = express.Router();


// router.get("/", async (req, res) => {
//   res.json({ ok: true, test: "GET sin DB" });
// });
router.get("/", async (req, res) => {
  const db = await dbPromise;

  const reservas = await db.all(`
    SELECT *
    FROM reservas
    ORDER BY fecha DESC
  `);

  const parseadas = reservas.map(r => ({
    ...r,
    fotos: r.fotos ? JSON.parse(r.fotos) : []
  }));

  res.json(parseadas);
});


router.post("/", async (req, res) => {
  const {nombre, email, mensaje, fotos} = req.body

  //validacion 
  if(!nombre || !email) {
    return res.status(400).json({
      error: "Nombre e email son obligatorios"
    });
  }
  const db  = await dbPromise;
  
  const fecha = new Date().toDateString()

  const result = await db.run(
     `
    INSERT INTO reservas (nombre, email, mensaje, fotos, fecha)
    VALUES (?, ?, ?, ?, ?)
    `,
    [
      nombre,
      email,
      mensaje ?? "",
      JSON.stringify(fotos ?? []),
      fecha
    ]
  );

  res.status(201).json({
    ok: true,
    id:result.lastID
  });
});

//Patch cambiar de estado 
router.patch("/:id/estado", async (req, res) => {
  const {id} = req.params;
  const {estado} = req.body;

  //validación mínima
  if(!estado || !["pendiente", "eliminado"].includes(estado)){
    return res.status(400).json({
      error: "Estado inválido",
    });
  }
  const db = await dbPromise;

  const result = await db.run(
    `
    UPDATE reservas
    SET estado = ?
    WHERE id = ?
    `,
    [estado, id]
  );

  if (result.changes === 0) {
    return res.status(404).json({
      error: "Reserva no encontrada",
    });
  }

  res.json({ ok: true });
});
export default router;