
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import compression from "compression";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { pool } from "./db/postgres.js";

//Temporarl
pool
  .query("SELECT 1")
  .then(() => console.log("Test query OK"))
  .catch((err) => console.error("Test query error:", err));

pool
  .query("SELECT current_database()")
  .then((r) => console.log("DB actual:", r.rows[0].current_database))
  .catch((err) => console.error(err));
pool
  .query("SHOW search_path")
  .then((r) => console.log("search_path:", r.rows[0].search_path));

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { errorHandler } from "./middlewares/errorHandler.js";

import reservasRouter from "./routes/reservas.js";
import fotosRouter from "./routes/fotos.js";
import solicitudesRouter from "./routes/solicitudes.js";
import eventosRouter from "./routes/eventos.js";

const PORT = process.env.PORT || 3000;

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

app.use(compression());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10000, // máximo 100 requests por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Demasiadas solicitudes, intenta más tarde",
  },
});

app.use(limiter);


app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use((req, res, next) => {
  next();
});
app.use(express.json({ limit: "10kb" }));
// app.use(express.static("public"));
app.use(
  express.static(path.join(__dirname, "public"), {
    maxAge: "7d"
  })
);
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://portfolio-web-fotos.onrender.com"
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("No permitido por CORS"));
      }
    },
  }),
);

app.use("/api/fotos", fotosRouter);
//conectar con reservas
app.use("/api/reservas", reservasRouter);
app.use("/api/solicitudes", solicitudesRouter);
app.use("/api/eventos", eventosRouter);

app.get("/ping", (req, res) => {
  res.json({ ok: true });
});
// SPA fallback
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});
//Middleware globarl de errores (siempre al final )
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`SERVER OK en puerto ${PORT}`);
  console.log("NODE_ENV actual:", process.env.NODE_ENV);
});

app.listen(3000, () => {
  console.log("SERVER OK");
});
