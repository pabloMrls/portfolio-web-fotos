import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

//rutas
import reservasRouter from "./routes/reservas.js";
import fotosRouter from "./routes/fotos.js"

const app = express();

//Middlewares globales
app.use(cors());
app.use(express.json());


// resolver paths correctamente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//Archivos estáticos
app.use(express.static("public"));


// Rutas API
app.use("/api/reservas", reservasRouter);
app.use("/api/fotos", fotosRouter);

// arrancar servidor
app.listen(3000, () => {
  console.log("🚀 Backend corriendo en http://localhost:3000");
});
