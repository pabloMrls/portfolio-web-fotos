// api.js
// api.js
export async function enviarReserva(reserva) {
  console.log("📦 Enviando al backend:", reserva);
  console.log("🚀 intentando fetch a backend");

  const response = await fetch("/api/reservas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(reserva)
  });

  if (!response.ok) {
     const error = await response.json();
  console.error("ERROR BACKEND:", error);
  throw new Error(error.error || "Error al enviar reserva");
  }

  return response.json();
}

export async function cargarFotos() {
  const res = await fetch("/api/fotos");

  if (!res.ok) {
    throw new Error("Error cargando fotos");
  }

  const json = await res.json();

  return json.data ?? []; // 🔥 esto es lo que falta
}