import express from "express";
// import {dbPromise} from "../db/database.js"; /* *todo: eliminarlo luego*/
import { pool } from "../db/postgres.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import {
  validarReserva,
  validarFotosExistentes,
  verificarReservaDuplicada,
} from "../services/reservasService.js";

import { requireAdmin } from "../middlewares/auth.js";

const router = express.Router();

// GET reservas
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      "SELECT * FROM reservas ORDER BY fecha DESC",
    );

    res.json(rows);
  }),
);

// POST reserva
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const { nombre, email, mensaje, fotos, total } = req.body;
    
    if (!nombre || !email) {
      return res.status(400).json({
        error: "Nombre e email son obligatorios",
      });
    }
    console.log("POSTGRES RESERVA EJECUTANDO");
    validarReserva(req.body);
    validarFotosExistentes(req.body.fotos);

    const fotosNormalizadas = [...(fotos ?? [])]
      .map(Number)
      .sort((a, b) => a - b);

    const { rows: fotosDB } = await pool.query(
      `
      SELECT id, src, titulo, precio
      FROM fotos
      WHERE id = ANY($1)
    `,
      [fotosNormalizadas],
    );
    // Verificación de duplicado
    const duplicada = await verificarReservaDuplicada(
      pool,
      email,
      fotosNormalizadas,
    );

    if (duplicada) {
      return res.status(400).json({
        error: "Ya enviaste esta reserva. Te contactaremos pronto.",
      });
    }
    if (fotosDB.length === 0) {
  return res.status(400).json({
    error: "Las fotos seleccionadas no existen"
  });
}
    console.log("FOTOS QUE SE GUARDAN:", fotosDB);
    // Insert si no es duplicado
    const { rows } = await pool.query(
      `
      INSERT INTO reservas (nombre, email, mensaje, fotos, total)
      VALUES ($1, $2, $3, $4::jsonb, $5)
      RETURNING *
      `,
      [
        nombre,
        email,
        mensaje ?? "",
        JSON.stringify(fotosDB), 
        total ?? 0
      ],
    );

    res.status(201).json(rows[0]);
  }),
);

// PATCH estado
router.patch(
  "/:id/estado",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado || !["pendiente", "respondida", "eliminado"].includes(estado)) {
      return res.status(400).json({
        error: "Estado inválido",
      });
    }

    const result = await pool.query(
      `
      UPDATE reservas
      SET estado = $1
      WHERE id = $2
      RETURNING *
      `,
      [estado, id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "Reserva no encontrada",
      });
    }

    res.json(result.rows[0]);
  }),
);

export default router;
