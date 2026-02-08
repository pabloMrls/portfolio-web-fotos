let vista = "activas";

// ===============================
// API
// ===============================
async function cargarReservas() {
  const res = await fetch("/api/reservas");
  if (!res.ok) return [];
  return await res.json();
}

async function cambiarEstado(id, estado) {
  await fetch(`/api/reservas/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });

  iniciarAdmin();
}

// ===============================
// Render
// ===============================
function renderReservas(reservas) {
  const contenedor = document.getElementById("reservas");
  contenedor.innerHTML = "";
  

  if (reservas.length === 0) {
    contenedor.textContent =
      vista === "activas"
        ? "No hay reservas activas."
        : "No hay reservas eliminadas.";
    return;
  }

  reservas.forEach((r) => {
    const article = document.createElement("article");
    article.className = "reserva";

    article.innerHTML = `
  <header class="reserva-header">
    <strong>${r.nombre}</strong>
    ${
      esNueva(r.fecha)
        ? `<span class="badge-nueva">Nuevo</span>`
        : ""
    }
  </header>

  <small class="reserva-tiempo">
    ${tiempoRelativo(r.fecha)}
  </small>

  <p>${r.mensaje || "Sin mensaje"}</p>

  ${
    r.estado === "eliminado"
      ? `<button data-id="${r.id}" data-accion="restaurar" class="btn-restaurar">Restaurar</button>`
      : `<button data-id="${r.id}" data-accion="eliminar" class="btn-eliminar">Eliminar</button>
       <br>
        <small class="hint">Se puede restaurar más tarde</small>
      `
      
  }

`;


    contenedor.appendChild(article);
  });
}

// ===============================
// Estado de vista
// ===============================
function filtrarPorVista(reservas) {
  return vista === "activas"
    ? reservas.filter((r) => r.estado !== "eliminado")
    : reservas.filter((r) => r.estado === "eliminado");
}

function actualizarContadores(reservas) {
  const activas = reservas.filter((r) => r.estado !== "eliminado").length;
  const eliminadas = reservas.filter((r) => r.estado === "eliminado").length;

  document.getElementById("count-activas").textContent = activas;
  document.getElementById("count-eliminadas").textContent = eliminadas;
}

function setTabActiva() {
  document.querySelectorAll(".tab").forEach((btn) =>
    btn.classList.remove("active")
  );

  document
    .getElementById(vista === "activas" ? "tab-activas" : "tab-eliminadas")
    .classList.add("active");
}

// ===============================
// Eventos
// ===============================
document.addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;

  const id = e.target.dataset.id;
  const accion = e.target.dataset.accion;

  if (accion === "eliminar") {
    const confirmar = confirm(
      "¿Mover esta reserva a Eliminadas?\n\n" +
      "No se borrará definitivamente.\n" +
      "Podrás restaurarla más tarde."
    );

    if (!confirmar) return;

    cambiarEstado(id, "eliminado");
  }

  if (accion === "restaurar") {
    const confirmar = confirm(
      "¿Restaurar esta reserva a Activas?"
    );

    if (!confirmar) return;

    cambiarEstado(id, "pendiente");
  }
});


document.getElementById("tab-activas").onclick = () => {
  vista = "activas";
  setTabActiva();
  iniciarAdmin();
};

document.getElementById("tab-eliminadas").onclick = () => {
  vista = "eliminadas";
  setTabActiva();
  iniciarAdmin();
};
//Helper de tiempo 
function tiempoRelativo(fechaISO){
  const ahora = Date.now();
  const fecha = new Date(fechaISO).getTime();

  const diffMs = ahora - fecha;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMin / 60);

  if (diffMin < 1) return "Hace un momento";
  if (diffMin < 60) return `Hace ${diffMin} min`;
  if (diffHoras < 24) return `Hace ${diffHoras} h`;

  return new Date(fechaISO).toLocaleDateString();
}

function esNueva(fechaISO) {
  const ahora = Date.now();
  const fecha = new Date(fechaISO).getTime();
  return ahora - fecha < 24 * 60 * 60 * 1000;
}
// ===============================
// Init
// ===============================
async function iniciarAdmin() {
  const reservas = await cargarReservas();
  actualizarContadores(reservas);
  renderReservas(filtrarPorVista(reservas));
}

iniciarAdmin();
