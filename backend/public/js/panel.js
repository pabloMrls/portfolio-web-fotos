// =====================
// ESTADO GLOBAL
// =====================
let reservas = [];
let filtroActual = "todas";

// =====================
// HELPERS
// =====================
function formatearFecha(fechaISO) {
  const fecha = new Date(fechaISO);
  return fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

// =====================
// MINIATURAS
// =====================
function renderMiniaturas(fotos) {
  const preview = fotos.slice(0, 3);
  const extra = fotos.length - preview.length;
  console.log("Fotos que llegan al panel:", fotos);
  return `
    <div class="reservation-photos">
      ${preview.map(foto => `
        <img
          src="${foto}"
          alt="Foto reservada"
          style="width:48px;height:48px;object-fit:cover;border-radius:6px;"
        >
      `).join("")}

      ${extra > 0 ? `
        <div class="photo-more"
             style="width:48px;height:48px;border-radius:6px;
                    background:#e5e7eb;color:#374151;
                    display:flex;align-items:center;justify-content:center;
                    font-size:0.85rem;">
          +${extra}
        </div>
      ` : ""}
    </div>
  `;
}

// =====================
// RENDER DE UNA RESERVA
// =====================
function renderReserva(reserva) {
  return `
    <article class="reservation-card">
      <div class="reservation-header">
        <div>
          <h2 class="reservation-name">${reserva.nombre}</h2>
          <p class="reservation-email">${reserva.email}</p>
        </div>

        <span class="reservation-status ${reserva.estado}">
          ${reserva.estado}
        </span>
      </div>

      <div class="reservation-meta">
        <span>${formatearFecha(reserva.fecha)}</span>
        <span>${reserva.fotos.length} fotos</span>
      </div>

      ${renderMiniaturas(reserva.fotos)}

      <div class="reservation-actions">
        <button class="btn-secondary" data-id="${reserva.id}">
          Ver detalle
        </button>
      </div>
    </article>
  `;
}

// =====================
// FILTROS
// =====================
function obtenerReservasFiltradas() {
  if (filtroActual === "todas") {
    return reservas;
  }
  return reservas.filter(r => r.estado === filtroActual);
}

// =====================
// RENDER LISTADO
// =====================
function renderReservas(lista) {
  const container = document.getElementById("reservationsList");

  if (!lista || lista.length === 0) {
    container.innerHTML = "<p>No hay reservas para este estado</p>";
    return;
  }

  container.innerHTML = lista.map(renderReserva).join("");
}

function renderTodo() {
  const lista = obtenerReservasFiltradas();
  renderReservas(lista);
}

// =====================
// INIT
// =====================
document.addEventListener("DOMContentLoaded", () => {

  // Filtros
  document.querySelector(".filters").addEventListener("click", e => {
    if (!e.target.matches(".filter-btn")) return;

    filtroActual = e.target.dataset.filter;

    document
      .querySelectorAll(".filter-btn")
      .forEach(btn => btn.classList.remove("active"));

    e.target.classList.add("active");

    renderTodo();
  });

  // Auto refresh cada 5s
  setInterval(async () => {
    try {
      const res = await fetch("http://localhost:3000/api/reservas");
      reservas = await res.json();
      renderTodo();
    } catch (error) {
      console.error("Error cargando reservas", error);
    }
  }, 5000);
});
