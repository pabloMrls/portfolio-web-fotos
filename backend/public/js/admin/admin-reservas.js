let fotosGlobales = [];
let fotosMap = new Map();
let vista = "activas";


// ===============================
// API
// ===============================
async function cargarFotos() {
  const res = await fetch("/api/fotos");

  if (!res.ok) {
    console.error("Error cargando fotos");
    return [];
  }

  const json = await res.json();

  return json.data ?? []; // 🔥 ahora sí devuelve array
}
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
  
    const estadoLabel = {
     pendiente: "Pendiente",
    respondida: "Respondida",
    eliminado: "Eliminada"
  }


  if (reservas.length === 0) {
    contenedor.textContent =
      vista === "activas"
        ? "No hay reservas activas."
        : "No hay reservas eliminadas.";
    return;
  }

  reservas.forEach((r) => {
    const article = document.createElement("article");
    article.className = `reserva ${esNueva(r.fecha) ? "nueva" : ""}`;

    article.innerHTML = `
  <header class="reserva-header">
  <div>
    <strong class="reserva-nombre">${r.nombre}</strong>
    ${esNueva(r.fecha) ? `<span class="badge-nueva">Nuevo</span>` : ""}
  </div>

 <span class="badge-estado ${r.estado}">
  ${estadoLabel[r.estado] || "Pendiente"}
</span>
</header>

  <small class="reserva-tiempo">
    ${tiempoRelativo(r.fecha)}
  </small>

  <p class="reserva-mensaje">
  ${r.mensaje || "Sin mensaje"}
  </p>
    <p class="reserva-total">
  Total estimado: $${Number(r.total).toLocaleString("es-AR")}
</p>
${
  r.fotos && r.fotos.length > 0
    ? `
      <div class="reserva-fotos">
        <span class="reserva-fotos-count">
          ${r.fotos.length} foto${r.fotos.length > 1 ? "s" : ""}
        </span>

        ${(() => {
    const maxVisible = 6;
    const fotosData = typeof r.fotos === "string"
  ? JSON.parse(r.fotos)
  : r.fotos || [];

          const visibles = fotosData.slice(0, maxVisible);
          const restantes = fotosData.length - maxVisible;
    
    const miniaturas = visibles.map(f => {
      const src = f.src;
      if (!src) return "";
      return `
        <img
          src="${src}"
          alt="Foto seleccionada"
          class="reserva-miniatura"
        />
      `;
    }).join("");

    const extra = restantes > 0
      ? `<div class="reserva-extra">+${restantes}</div>`
      : "";

    return miniaturas + extra;
  })()}
      </div>
    `
    : ""
}

  <div class="reserva-actions">

  ${
    r.estado === "pendiente"
      ? `
        <a href="mailto:${r.email}?subject=Sobre tu reserva&body=Hola ${r.nombre}," 
           class="btn-responder">
           Responder
        </a>

        <button data-id="${r.id}" 
                data-accion="marcar-respondida"
                class="btn-responder">
          Marcar como contactado
        </button>

        <button data-id="${r.id}" 
                data-accion="eliminar"
                class="btn-eliminar">
          Eliminar
        </button>
      `
      : ""
  }

  ${
    r.estado === "respondida"
      ? `
        <button data-id="${r.id}" 
                data-accion="eliminar"
                class="btn-eliminar">
          Eliminar
        </button>
      `
      : ""
  }

  ${
    r.estado === "eliminado"
      ? `
        <button data-id="${r.id}" 
                data-accion="restaurar"
                class="btn-restaurar">
          Restaurar
        </button>
      `
      : ""
  }

</div>

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
  if (accion === "marcar-respondida") {
  cambiarEstado(id, "respondida");
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

document.addEventListener("click", (e) => {
  if (!e.target.classList.contains("reserva-miniatura")) return;

  window.open(e.target.src, "_blank");
});

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

  fotosGlobales = await cargarFotos();
console.log("FOTOS RAW:", fotosGlobales);
  fotosMap = new Map(
    fotosGlobales.map(f => [f.id, f.src])
  );

  const reservas = await cargarReservas();
  actualizarContadores(reservas);
  renderReservas(filtrarPorVista(reservas));
}

iniciarAdmin();
