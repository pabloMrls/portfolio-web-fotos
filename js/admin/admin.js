import { fotos } from "../data.js";

document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("lista-reservas");

  let reservasOriginales = [];
  let filtroActivo = "todas";

  const ordenEstados = {
  pendiente: 1,
  contactado: 2, // 👈 ACA
  confirmado: 3
};

  // =========================
  // FILTROS (una sola vez)
  // =========================
  document.querySelectorAll(".filtros button").forEach((btn) => {
    btn.addEventListener("click", () => {
      filtroActivo = btn.dataset.estado;

      document
        .querySelectorAll(".filtros button")
        .forEach((b) => b.classList.remove("activo"));

      btn.classList.add("activo");

      renderReservas();
    });
  });

  // =========================
  // CARGAR DATOS
  // =========================
  async function cargarReservas() {
    const response = await fetch("http://localhost:3000/api/reservas");
    const data = await response.json();

    reservasOriginales = data;

    // ordenar UNA VEZ
    reservasOriginales.sort(
      (a, b) => ordenEstados[a.estado] - ordenEstados[b.estado],
    );

    actualizarContadores();

    renderReservas();
  }

  function actualizarContadores() {
    const total = reservasOriginales.length;

    const pendientes = reservasOriginales.filter(r => r.estado === "pendiente").length;
    const contactados = reservasOriginales.filter(r => r.estado === "contactado").length;
    const confirmados = reservasOriginales.filter(r => r.estado === "confirmado").length;

    document.querySelector('[data-estado="todas"]').textContent = `Todas (${total})`;
    document.querySelector('[data-estado="pendiente"]').textContent = `Pendiente (${pendientes})`;
    document.querySelector('[data-estado="contactado"]').textContent = `Contactado (${contactados})`;
    document.querySelector('[data-estado="confirmado"]').textContent = `Confirmado (${confirmados})`;


  }
//     document.querySelectorAll(".filtros button")
//   .forEach(b => b.classList.remove("activo"));

// btn.classList.add("activo");


function obtenerSrcPorId(id) {
  const foto = fotos.find(f => f.id === id);
  return foto ? foto.src : "";
}

  // =========================
  // RENDER
  // =========================
  function renderReservas() {
    contenedor.innerHTML = "";

    let reservasFiltradas = reservasOriginales;

    if (filtroActivo !== "todas") {
      reservasFiltradas = reservasOriginales.filter(
        (r) => r.estado.toLowerCase().trim() === filtroActivo,
      );
    }

    if (reservasFiltradas.length === 0) {
      contenedor.textContent = "No hay reservas para este estado";
      return;
    }

    reservasFiltradas.forEach((reserva) => {
      const div = document.createElement("div");
      div.className = "reserva";

      const mailto = `
mailto:${reserva.email}
?subject=Sobre tu solicitud de fotos
&body=Hola,%0D%0A%0D%0A
Gracias por tu mensaje. Quería escribirte para coordinar los detalles de tu solicitud.%0D%0A%0D%0A
Saludos,%0D%0A
[Tu nombre]
`;

      div.innerHTML = `
        <h3>${reserva.email}</h3>
        <p>${reserva.mensaje || "Sin mensaje"}</p>
          <div class="miniaturas">
  ${
    reserva.fotos.map(id => {
      const src = obtenerSrcPorId(id);
      return src
        ? `<img src="${src}" alt="Foto ${id}">`
        : "";
    }).join("")
  }
</div>

  
        <p>
          <strong>Estado:</strong>
          <span class="estado estado--${reserva.estado}">
            ${reserva.estado}
          </span>
        </p>

        <div class="acciones">
          <a href="${mailto}">📩 Enviar mail</a>

          ${reserva.estado === "pendiente"
          ? `<button class="btn-contactar">Marcar como contactado</button>`
          : reserva.estado === "contactado"
            ? `<button class="btn-confirmar">Marcar como confirmado</button>`
            : ""
        }
        </div>
      `;

      const btn = div.querySelector(".btn-contactar");
      if (btn) {
        btn.addEventListener("click", async () => {
          await fetch(`http://localhost:3000/api/reservas/${reserva.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado: "contactado" }),
          });

          cargarReservas();
        });
      }

      const btnConfirmar = div.querySelector(".btn-confirmar");
      if(btnConfirmar) {
         btnConfirmar.addEventListener("click", async () => {
          await fetch(`http://localhost:3000/api/reservas/${reserva.id}`, {
            method: "PATCH",
            headers: {"Content-Type": "application/json"},
             body: JSON.stringify({ estado: "confirmado" })
          });

          cargarReservas();
         });
      }

      contenedor.appendChild(div);
    });
  }

  // =========================
  // INICIO
  // =========================
 
  cargarReservas();
});
