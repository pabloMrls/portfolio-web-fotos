import express from "express";
// import { dbPromise } from "../db/database.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

function validarSolicitud(data) {
  const { nombre, email, telefono, tipo_evento, fecha_evento, mensaje } = data;

  if (typeof nombre !== "string" || nombre.trim().length < 2) {
    const error = new Error("Nombre inválido");
    error.status = 400;
    throw error;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== "string" || !emailRegex.test(email)) {
    const error = new Error("Email inválido");
    error.status = 400;
    throw error;
  }

  if (typeof tipo_evento !== "string" || tipo_evento.trim().length < 3) {
    const error = new Error("Tipo de evento inválido");
    error.status = 400;
    throw error;
  }

  if (mensaje && mensaje.length > 1000) {
    const error = new Error("Mensaje demasiado largo");
    error.status = 400;
    throw error;
  }
}

// Post /api/solicitudes

router.post("/", asyncHandler(async (req, res) => {
   
  validarSolicitud(req.body);

  const { nombre, email, telefono, tipo_evento, fecha_evento, mensaje } = req.body;

  const db = await dbPromise;
 const schema = await db.all("PRAGMA table_info(solicitudes);");
console.log(schema);
  const creada_en = new Date().toISOString();

  // Prevención duplicado 5 minutos
  const solicitudExistente = await db.get(`
    SELECT id
    FROM solicitudes
    WHERE email = ?
    AND tipo_evento = ?
    AND creada_en >= datetime('now', '-5 minutes')
  `, [email.trim(), tipo_evento.trim()]);

  if (solicitudExistente) {
    const error = new Error("Solicitud ya enviada recientemente");
    error.status = 409;
    throw error;
  }

  const result = await db.run(`
    INSERT INTO solicitudes
    (nombre, email, telefono, tipo_evento, fecha_evento, mensaje, creada_en)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    nombre.trim(),
    email.trim(),
    telefono || null,
    tipo_evento.trim(),
    fecha_evento || null,
    mensaje || null,
    creada_en
  ]);

  res.status(201).json({
    id: result.lastID,
    nombre,
    email,
    telefono,
    tipo_evento,
    fecha_evento,
    mensaje,
    estado: "pendiente",
    creada_en
  });
}));

router.get("/", requireAdmin, asyncHandler(async (req, res)=> {

    const db = await dbPromise;

    const solicitudes = await db.all(`
    SELECT *
    FROM solicitudes
    ORDER BY creada_en DESC
  `);
    res.json(solicitudes);
}))

export default router;