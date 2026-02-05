// routes/reservas.js
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

// path al JSON
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reservasPath = path.join(__dirname, "../data/reservas.json");

// helpers
function leerReservas() {
  if (!fs.existsSync(reservasPath)) {
    fs.mkdirSync(path.dirname(reservasPath), { recursive: true });
    fs.writeFileSync(reservasPath, "[]", "utf-8");
  }
  return JSON.parse(fs.readFileSync(reservasPath, "utf-8"));
}

function guardarReservas(reservas) {
  fs.writeFileSync(reservasPath, JSON.stringify(reservas, null, 2), "utf-8");
}

// POST /api/reservas
router.post("/", (req, res) => {
  const { nombre, email, mensaje, fotos } = req.body;

  if (!email) {
    return res.status(400).json({ ok: false });
  }

  const nuevaReserva = {
    id: `rsv_${Date.now()}`,
    nombre,
    email,
    mensaje,
    fotos,
    estado: "pendiente",
    fecha: new Date().toISOString()
  };

  const reservas = leerReservas();
  reservas.push(nuevaReserva);
  guardarReservas(reservas);

  console.log("💾 Reserva guardada:", nuevaReserva);

  res.json({ ok: true, reserva: nuevaReserva });
});

// GET /api/reservas
router.get("/", (req, res) => {
  const reservas = leerReservas();
  res.json(reservas);
});

export default router;
