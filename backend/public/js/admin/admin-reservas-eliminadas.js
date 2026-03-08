async function cargarReservas() {
  const res = await fetch("/api/reservas");
  if (!res.ok) return [];
  return await res.json();
}

function renderReservas(reservas) {
  const contenedor = document.getElementById("reservas-eliminadas");
  contenedor.innerHTML = "";

  if (reservas.length === 0) {
    contenedor.textContent = "No hay reservas eliminadas.";
    return;
  }

  reservas.forEach((r) => {
    const article = document.createElement("article");
    article.className = "reserva";

    article.innerHTML = `
      <strong>${r.nombre}</strong> – ${r.email}<br>
      <p>${r.mensaje || "Sin mensaje"}</p>
      <p class="reserva-total">
  Total estimado: $${Number(r.total).toLocaleString("es-AR")}
</p>
      <small>Estado: <b>${r.estado}</b></small><br><br>

      <button data-id="${r.id}" data-accion="restaurar">
        Restaurar
      </button>

      <hr>
    `;

    contenedor.appendChild(article);
  });
}

async function cambiarEstado(id, estado) {
  await fetch(`/api/reservas/${id}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado }),
  });

  iniciarAdmin();
}

document.addEventListener("click", (e) => {
  if (e.target.tagName !== "BUTTON") return;

  const id = e.target.dataset.id;
  const accion = e.target.dataset.accion;

  if (accion === "restaurar") {
    cambiarEstado(id, "pendiente");
  }
});

async function iniciarAdmin() {
  const reservas = await cargarReservas();
  const eliminadas = reservas.filter(r => r.estado === "eliminado");
  renderReservas(eliminadas);
}

iniciarAdmin();
