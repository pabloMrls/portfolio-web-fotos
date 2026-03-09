import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { pool } from "../db/postgres.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración multer (se mantiene igual)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../public/img"));
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });
pool.query("SELECT current_database()")
  .then(r => console.log("DB actual:", r.rows[0]))

// GET fotos
router.get("/", asyncHandler(async (req, res) => {

  const { estado = "activas", page = 1 } = req.query;
  const limit = 12;
  const offset = (page - 1) * limit;

  let where = "";

  if (estado === "papelera") {
    where = `
      deleted_at IS NOT NULL
      AND evento_id IS NULL
    `;
  } else {
    where = `
      deleted_at IS NULL
      AND evento_id IS NULL
    `;
  }

  const { rows } = await pool.query(
    `
    SELECT *
    FROM fotos
    WHERE ${where}
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  res.json({ data: rows });
}));

// POST foto
router.post(
  "/",
  upload.array("imagenes", 100),
  asyncHandler(async (req, res) => {

    const {  categoria, precio, destacada, evento_id } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "Imágenes requeridas" });
    }

    const precioFinal = precio ? Number(precio) : 0;
  
    const inserted = [];

    for (const file of req.files) {

      const src = `/img/${file.filename}`;
      const titulo = path.parse(file.originalname).name;
      const { rows } = await pool.query(
        `
        INSERT INTO fotos (titulo, categoria, src, precio, evento_id)
        VALUES ($1,$2,$3,$4,$5)
        RETURNING *
        `,
        [
          titulo,
          categoria ?? null,
          src,
          precioFinal,
          evento_id ? Number(evento_id) : null
        ]
      );

      inserted.push(rows[0]);
    }

    res.status(201).json(inserted);
  })
);
// router.post(
//   "/",
//   upload.single("imagen"),
//   asyncHandler(async (req, res) => {

//     const { titulo, categoria, destacada, precio, evento_id } = req.body;

//     if (!req.file) {
//       return res.status(400).json({ error: "Imagen requerida" });
//     }

//     const src = `/img/${req.file.filename}`;

//     const eventoIdFinal = evento_id
//       ? Number(evento_id)
//       : null;

//     const precioFinal = precio
//       ? Number(precio)
//       : 0;

//     const { rows } = await pool.query(
//       `
//       INSERT INTO fotos (titulo, categoria, src, destacada, precio, evento_id)
//       VALUES ($1, $2, $3, $4, $5, $6)
//       RETURNING *
//       `,
//       [
//         titulo ?? null,
//         categoria ?? null,
//         src,
//         destacada === "true",
//         precioFinal,
//         eventoIdFinal
//       ]
//     );

//     res.status(201).json(rows[0]);
//   })
// );
// Actualizar 
router.put(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { titulo, categoria, precio} = req.body;

    const { rowCount } = await pool.query(
      `
      UPDATE fotos
      SET
        titulo = COALESCE($1, titulo),
        categoria = COALESCE($2, categoria),
        precio = COALESCE($3, precio)
      WHERE id = $4
      `,
      [
        titulo?.trim() || null,
        categoria ?? null,
        precio ?? null,
        id
      ]
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: "Foto no encontrada" });
    }

    res.json({ ok: true });
  })
);

// Papelera de fotos
router.get("/trash", asyncHandler(async (req, res) => {

  const page = parseInt(req.query.page) || 1;
  const limit = 12;
  const offset = (page - 1) * limit;

  const { rows: data } = await pool.query(
    `
    SELECT *
    FROM fotos
    WHERE deleted_at IS NOT NULL
    ORDER BY deleted_at DESC
    LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  const { rows: countRows } = await pool.query(
    `
    SELECT COUNT(*)
    FROM fotos
    WHERE deleted_at IS NOT NULL
    `
  );

  const total = parseInt(countRows[0].count);
  const totalPages = Math.ceil(total / limit);

  res.json({
    data,
    total,
    page,
    totalPages
  });

}));

// RESTAURAR fotos eliminadas
router.put("/:id/restore", asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = await pool.query(
    `
    UPDATE fotos
    SET deleted_at = NULL
    WHERE id = $1
    AND deleted_at IS NOT NULL
    RETURNING *
    `,
    [id]
  );

  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Foto no encontrada en papelera" });
  }

  res.json({ ok: true });
}));
// DELETE foto
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const result = await pool.query(
     `
     UPDATE fotos
     SET deleted_at = NOW()
     WHERE id = $1
     AND deleted_at IS NULL
     RETURNING *
     `,
     [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Foto no encontrada o ya eliminada" });
    }

    res.json({ message: "Foto eliminada" });
  })
);
router.delete("/:id/permanent", asyncHandler(async (req, res) => {
  const { id } = req.params;

  await pool.query(`
    DELETE FROM fotos
    WHERE id = $1
  `, [id]);

  res.json({ ok: true });
}));

export default router;