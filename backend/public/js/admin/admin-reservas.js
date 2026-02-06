let vista = "activas";

const contenedor = document.getElementById("reservas");

async function cargarReservas() {
  const url =
    vista === "activas" ? "/api/reservas" : "/api/reservas/eliminadas";

  const res = await fetch(url);
  if (!res.ok) throw new Error("Error cargando reservas");
  return await res.json();
}

function renderReservas(reservas) {
  contenedor.innerHTML = "";

  if (reservas.length === 0) {
    contenedor.textContent =
      vista === "activas"
        ? "No hay reservas activas."
        : "No hay reservas eliminadas.";
    return;
  }

  reservas.forEach((r) => {
    const div = document.createElement("article");
    div.className = "reserva";

    div.innerHTML = `
  <header class="reserva-header">
    <div>
      <strong class="reserva-nombre">
        ${r.nombre}
        ${esReciente(r.fecha) ? `<span class="badge-nueva">Nueva</span>` : ""}
    </strong>

     <span class="reserva-fecha">
       ${formatearTiempo(r.fecha)}
    </span>

    </div>
    <span class="reserva-email">${r.email}</span>
  </header>

  <p class="reserva-mensaje">
    ${r.mensaje || "Sin mensaje"}
  </p>

  <div class="fotos">
    ${r.fotos.map((src) => `<img src="${src}" alt="">`).join("")}
  </div>

  <footer class="reserva-actions">
    <a
  href="${generarGmailLink(r)}"
  class="btn-responder"
  target="_blank"
  rel="noopener noreferrer"
>
  Responder
</a>


    ${vista === "activas"
        ? `<button class="btn-eliminar">Eliminar</button>`
        : `<button class="btn-restaurar">Restaurar</button>`
      }
  </footer>
`;


    // acciones según tab
    if (vista === "activas") {
      div.querySelector(".btn-eliminar").onclick = () => eliminarReserva(r.id);
    } else {
      div.querySelector(".btn-restaurar").onclick = () =>
        restaurarReserva(r.id);
    }

    contenedor.appendChild(div);
  });
}

async function eliminarReserva(id) {
  if (!confirm("¿Eliminar esta reserva?")) return;

  await fetch(`/api/reservas/${id}`, { method: "DELETE" });
  await actualizarContadores();
  refrescar();
}

async function restaurarReserva(id) {
  if (!confirm("¿Restaurar esta reserva?")) return;

  await fetch(`/api/reservas/${id}/restaurar`, {
    method: "PATCH",
  });
  await actualizarContadores();
  refrescar();
}

async function refrescar() {
  const reservas = await cargarReservas();
  renderReservas(reservas);
}

document.getElementById("tab-activas").onclick = () => {
  vista = "activas";
  setTabActiva();
  refrescar();
};

document.getElementById("tab-eliminadas").onclick = () => {
  vista = "eliminadas";
  setTabActiva();
  refrescar();
};

function setTabActiva() {
  document
    .querySelectorAll(".tab")
    .forEach((btn) => btn.classList.remove("active"));

  document.getElementById(`tab-${vista}`).classList.add("active");
}

function esReciente(fechaIso) {
  const ahora = Date.now();
  const fecha = new Date(fechaIso).getTime();

  const horas24 = 24 * 60 * 60 * 1000;
  return ahora - fecha < horas24;
}

async function actualizarContadores() {
  const [activas, eliminadas] = await Promise.all([
    fetch("/api/reservas").then((r) => r.json()),
    fetch("/api/reservas/eliminadas").then((r) => r.json()),
  ]);

  document.getElementById("count-activas").textContent = activas.length;
  document.getElementById("count-eliminadas").textContent = eliminadas.length;
}
//Helpers
function formatearTiempo(fechaISO) {
  const fecha = new Date(fechaISO);
  const ahora = new Date();

  const diffMs = ahora - fecha;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHoras = Math.floor(diffMin / 60);

  // Menos de 1 minuto
  if (diffMin < 1) {
    return "Hace un momento";
  }

  // Menos de 1 hora
  if (diffMin < 60) {
    return `Hace ${diffMin} minuto${diffMin === 1 ? "" : "s"}`;
  }

  // Hoy
  if (diffHoras < 24 && ahora.getDate() === fecha.getDate()) {
    return `Hoy · ${fecha.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // Ayer
  const ayer = new Date();
  ayer.setDate(ahora.getDate() - 1);
  if (fecha.toDateString() === ayer.toDateString()) {
    return `Ayer · ${fecha.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // Más viejo
  return fecha.toLocaleDateString();
}

function generarGmailLink(reserva) {
  const to = encodeURIComponent(reserva.email);
  const subject = encodeURIComponent("Sobre tu consulta de fotografías");
  const body = encodeURIComponent(
`Hola ${reserva.nombre},

Gracias por tu mensaje. Te escribo por las fotos que seleccionaste.

Quedo atento/a a tu respuesta.
Saludos.`
  );

  return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
}



async function init() {
  setTabActiva();
  await actualizarContadores();
  refrescar();
}

init();
