import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import reservasRouter from "./routes/reservas.js";

const app = express();

app.use(cors());
app.use(express.json());

// resolver paths correctamente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 👉 SERVIR IMÁGENES (esto es lo importante)
app.use(
  "/img",
  express.static(path.resolve(__dirname, "../img"))
);

// API
app.use("/api/reservas", reservasRouter);

// arrancar servidor
app.listen(3000, () => {
  console.log("🚀 Backend corriendo en http://localhost:3000");
});
