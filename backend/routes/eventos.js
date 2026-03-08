import express from "express";
import { pool } from "../db/postgres.js";
import multer from "multer";
import path from "path";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/eventos");
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({storage});

const router = express.Router();

/*
Comentarios
TODO:Luego poner el adminRequired
*/
router.get("/", asyncHandler(async (req, res) => {

  const { destacados, estado } = req.query;

  const condiciones = [];

  // 🔒 Si piden papelera → mostrar eliminados
  if (estado === "papelera") {
    condiciones.push("deleted_at IS NOT NULL");
  } else {
    // 🔒 Por defecto → solo activos
    condiciones.push("deleted_at IS NULL");
  }

  // 🔒 Destacados opcional
  if (destacados === "true") {
    condiciones.push("destacado = true");
  }

  const whereClause = "WHERE " + condiciones.join(" AND ");

  const { rows } = await pool.query(`
    SELECT *
    FROM eventos
    ${whereClause}
    ORDER BY fecha DESC
  `);

  res.json(rows);
}));

router.post(
  "/:id/fotos",
  upload.single("imagen"),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: "No se subió imagen" });
    }

    const ruta = `/img/eventos/${req.file.filename}`;

    await pool.query(
      `
      INSERT INTO fotos (titulo, categoria, evento_id, src, destacada)
      VALUES ($1, $2, $3, $4, $5)
      `,
      [
        req.file.originalname,
        null,
        id,
        ruta,
        false
      ]
    );

    res.json({ ok: true });
  })
);

// Upload múltiple
router.post(
  "/",
  upload.fields([
    { name: "portada", maxCount: 1 },
    { name: "imagenes", maxCount: 100 }
  ]),
  asyncHandler(async (req, res) => {

    const { nombre, descripcion, fecha, precio } = req.body;
    const destacado = req.body.destacado === "on";

    if (!req.files?.portada) {
      return res.status(400).json({ error: "Falta portada" });
    }

    const portadaPath = `/img/eventos/${req.files.portada[0].filename}`;

    const { rows } = await pool.query(
      `
      INSERT INTO eventos (nombre, descripcion, fecha, portada, destacado, precio)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
      `,
      [
        nombre, 
        descripcion || null, 
        fecha,
        portadaPath,
        destacado,
        precio ? Number(precio) : 0
        ]
    );

    const eventoId = rows[0].id;

    // Insertar imágenes del evento
   if (req.files.imagenes) {

  const values = [];
  const placeholders = [];

  req.files.imagenes.forEach((file, index) => {

    const titulo = path.parse(file.originalname).name;
    const ruta = `/img/eventos/${file.filename}`;

    const base = index * 6;

    placeholders.push(
      `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6} )`
    );

    values.push(
      titulo,
      null,
      eventoId,
      ruta,
      false,
      Number(precio) || 0
    );

  });

  await pool.query(
    `
    INSERT INTO fotos (titulo, categoria, evento_id, src, destacada, precio)
    VALUES ${placeholders.join(",")}
    `,
    values
  );

}

    res.json({ ok: true });
  })
);

router.put("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { nombre, fecha, destacado } = req.body;
  
  if (!nombre || nombre.trim() === "") {
    return res.status(400).json({ error: "Nombre requerido" });
  }

  const { rowCount } = await pool.query(
    `
    UPDATE eventos
    SET nombre = $1,
        fecha = $2,
        destacado = $3
    WHERE id = $4
    `,
    [nombre.trim(),fecha, destacado, id]
  );

  if (rowCount === 0) {
    return res.status(404).json({ error: "Evento no encontrado" });
  }

  res.json({ ok: true });
}));

// router.get("/:id", asyncHandler(async (req, res) => {

//   const { id } = req.params;

//   const { rows: eventoRows } = await pool.query(
//     `
//     SELECT *
//     FROM eventos
//     WHERE id = $1
//     AND deleted_at IS NULL
//     `,
//     [id]
//   );

//   if (eventoRows.length === 0) {
//     return res.status(404).json({ error: "Evento no encontrado" });
//   }

//   const { rows: fotosRows } = await pool.query(
//     `
//     SELECT *
//     FROM fotos
//     WHERE evento_id = $1
//     AND deleted_at IS NULL
//     ORDER BY created_at DESC
//     `,
//     [id]
//   );

//   res.json({
//     evento: eventoRows[0],
//     fotos: fotosRows
//   });
// }));
router.get("/:id", asyncHandler(async (req, res) => {

  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  const { rows: eventoRows } = await pool.query(
    `
    SELECT *
    FROM eventos
    WHERE id = $1
    AND deleted_at IS NULL
    `,
    [id]
  );

  if (eventoRows.length === 0) {
    return res.status(404).json({ error: "Evento no encontrado" });
  }

  const { rows: fotosRows } = await pool.query(
    `
    SELECT *
    FROM fotos
    WHERE evento_id = $1
    AND deleted_at IS NULL
    ORDER BY created_at DESC
    `,
    [id]
  );

  res.json({
    evento: eventoRows[0],
    fotos: fotosRows
  });

}));
//ELininar un evento
router.put("/:id/restore", asyncHandler(async (req, res) => {

  const { id } = req.params;

  const result = await pool.query(
    `
    UPDATE eventos
    SET deleted_at = NULL
    WHERE id = $1
    `,
    [id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Evento no encontrado" });
  }

  res.json({ ok: true });

}));
router.delete("/:id", asyncHandler(async (req, res) => {

  const { id } = req.params;

  const result = await pool.query(
    `
    UPDATE eventos
    SET deleted_at = NOW()
    WHERE id = $1
      AND deleted_at IS NULL
    `,
    [id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Evento no encontrado o ya eliminado" });
  }

  res.json({ ok: true });

}));

router.delete("/:id/permanent", asyncHandler(async (req, res) => {

  const { id } = req.params;

  const result = await pool.query(
    "DELETE FROM eventos WHERE id = $1",
    [id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Evento no encontrado" });
  }

  res.json({ ok: true });
}));
export default router;

