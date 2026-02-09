// api.js
// api.js
// export async function enviarReserva(reserva) {
//   console.log("📦 Enviando al backend:", reserva);
//   console.log("🚀 intentando fetch a backend");

//   const response = await fetch("http://localhost:3000/api/reservas", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json"
//     },
//     body: JSON.stringify(reserva)
//   });

//   if (!response.ok) {
//     throw new Error("Error al enviar reserva");
//   }

//   return response.json();
// }
// fronted/js/api.js
export async function cargarFotos() {
  const res = await fetch("/data/fotos.json");
  if (!res.ok) throw new Error("Error cargando fotos");
  return res.json();
}


