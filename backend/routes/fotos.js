
import express from "express";
import fs from "fs";
import path from "path";
import multer from "multer";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👇 subir un nivel desde /routes
const fotosPath = path.join(__dirname, "..", "data", "fotos.json");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img" )
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer ({storage});

router.get("/", (req, res) => {
  const fotos = JSON.parse(fs.readFileSync(fotosPath, "utf-8"));
  res.json(fotos);
});

//Delete foto desde el admin
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  const data = JSON.parse(
    fs.readFileSync(fotosPath, "utf-8")
  );

  const nuevasFotos = data.filter(
    foto => Number(foto.id) !== id
  );

  if (nuevasFotos.length === data.length) {
    return res.status(404).json({ error: "Foto no encontrada" });
  }

  fs.writeFileSync(
    fotosPath,
    JSON.stringify(nuevasFotos, null, 2)
  );

  res.json({ ok: true });
});

router.post("/", upload.single("imagen"), (req, res) => {
  const { titulo, categoria, destacada } = req.body;

  if (!req.file || !titulo || !categoria) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const data = JSON.parse(
    fs.readFileSync(fotosPath, "utf-8")
  );

  const nuevaFoto = {
    id: Date.now(),
    titulo,
    categoria,
    src: `/img/${req.file.filename}`,
    destacada: Boolean(destacada)
  };

  data.push(nuevaFoto);

  fs.writeFileSync(
    fotosPath,
    JSON.stringify(data, null, 2)
  );

  res.status(201).json(nuevaFoto);
});


export default router;
