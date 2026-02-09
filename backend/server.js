import express from "express";
import reservasRouter from "./routes/reservas.js";
import fotosRouter from "./routes/fotos.js";


const app = express();

app.use(express.json());
app.use(express.static("public"));

app.use("/api/fotos", fotosRouter);


app.get("/ping", (req, res) => {
  res.json({ ok: true });
});

//conectar con reservas
app.use("/api/reservas", reservasRouter);

app.listen(3000, () => {
  console.log("SERVER OK");
});