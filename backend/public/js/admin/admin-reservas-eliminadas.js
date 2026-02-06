const contenedor = document.getElementById("reservas");

async function cargarEliminadas() {
  const res = await fetch("/api/reservas/eliminadas");
  if (!res.ok) throw new Error("Error cargando eliminadas");
  return await res.json();
}

function renderReservas(reservas) {
  contenedor.innerHTML = "";

  if (reservas.length === 0) {
    contenedor.textContent = "No hay reservas eliminadas.";
    return;
  }

  reservas.forEach(r => {
    const div = document.createElement("article");
    div.className = "reserva eliminada";

    div.innerHTML = `
      <strong>${r.nombre}</strong>
      <small>${new Date(r.fecha).toLocaleString()}</small>
      <p>${r.email}</p>

      <button class="btn-restaurar">Restaurar</button>
    `;

    div.querySelector(".btn-restaurar").addEventListener("click", async () => {
      const ok = confirm("¿Restaurar esta reserva?");
      if (!ok) return;

      try {
        const res = await fetch(`/api/reservas/${r.id}/restaurar`, {
          method: "PATCH"
        });

        if (!res.ok) throw new Error("Error restaurando");

        // refrescar lista
        const nuevas = await cargarEliminadas();
        renderReservas(nuevas);

      } catch {
        alert("No se pudo restaurar");
      }
    });

    contenedor.appendChild(div);
  });
}

async function init() {
  const reservas = await cargarEliminadas();
  renderReservas(reservas);
}

init();
