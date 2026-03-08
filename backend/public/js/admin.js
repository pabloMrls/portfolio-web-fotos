import { mostrarToast } from "./ui/toast.js";
document.addEventListener("DOMContentLoaded", () => {
  console.log("ADMIN JS CARGADO");
  let paginaActual = 1;
  let totalPaginas = 1;
  let cargando = false;
  let vistaActual = "activas"; // "activas" | "papelera"
  let vistaEventos = "activos"; // o "papelera"

  const contenedor = document.getElementById("fotos-grid");
  const form = document.getElementById("form-foto");
  const formEvento = document.getElementById("form-evento");
  const eventosGrid = document.getElementById("eventos-admin-grid");

  const selectEvento = document.querySelector('select[name="evento_id"]');

  //Paginación de fotos
  async function cargarFotosPaginadas(reset = false) {
    if (cargando) return;
    cargando = true;

    if (reset) {
      paginaActual = 1;
      contenedor.innerHTML = "";
    }

    const res = await fetch(
      `/api/fotos?page=${paginaActual}&estado=${vistaActual}`,
    );
    const data = await res.json();

    totalPaginas = data.totalPages || 1;

    // 🔒 SOLO mostrar vacío si es primera carga
    if (reset && data.data.length === 0) {
      mostrarEstadoVacio();
      btnCargarMas.style.display = "none";
      cargando = false;
      return;
    }
    renderFotosIncremental(data.data);

    paginaActual++;
    cargando = false;

    actualizarBotonCargarMas(data.data.length);
  }
  // Render incremental
  function renderFotosIncremental(fotos) {
    fotos.forEach((foto) => {
      const article = document.createElement("article");
      article.className = "admin-foto";

      article.innerHTML = `
  <img src="${foto.src}" class="miniaturas">
  <div class="admin-info">
    <strong class="foto-titulo">${foto.titulo}</strong>
    <small class="foto-categoria">${foto.categoria || ""}</small>
  </div>
  <div class="admin-actions">
     ${
       vistaActual === "activas"
         ? `
        <button class="btn-editar-foto">Editar</button>
        <button class="btn-eliminar">Mover a papelera</button>
      `
         : `
        <button class="btn-restaurar">Restaurar</button>
        <button class="btn-eliminar-def">Eliminar definitivo</button>
      `
     }
  </div>
`;
      if (vistaActual === "activas") {
        article
          .querySelector(".btn-eliminar")
          .addEventListener("click", () => eliminarFoto(foto.id));

        article
          .querySelector(".btn-editar-foto")
          .addEventListener("click", () => {
            activarModoEdicion(article, foto);
          });
      } else {
        article
          .querySelector(".btn-restaurar")
          .addEventListener("click", async () => {
            await fetch(`/api/fotos/${foto.id}/restore`, { method: "PUT" });
            await cargarFotosPaginadas(true);
          });

        article
          .querySelector(".btn-eliminar-def")
          .addEventListener("click", async () => {
            await fetch(`/api/fotos/${foto.id}/permanent`, {
              method: "DELETE",
            });
            await cargarFotosPaginadas(true);
          });
      }

      contenedor.appendChild(article);
    });
  }

  //Botón de ver más
  const btnCargarMas = document.getElementById("btn-cargar-mas");

  btnCargarMas.addEventListener("click", () => {
    cargarFotosPaginadas();
  });

  function actualizarBotonCargarMas(dataLength) {
    if (dataLength === 0 && paginaActual === 1) {
      btnCargarMas.style.display = "none";
      return;
    }

    btnCargarMas.style.display = "block";

    if (paginaActual > totalPaginas) {
      btnCargarMas.disabled = true;
      btnCargarMas.textContent = "No hay más fotos";
    } else {
      btnCargarMas.disabled = false;
      btnCargarMas.textContent = "Cargar más";
    }
  }
  //Activas | papelera
  // const btnActivas = document.getElementById("btn-activas");
  // const btnPapelera = document.getElementById("btn-papelera");

  const btnFotosActivas = document.getElementById("btn-fotos-activas");
  const btnFotosPapelera = document.getElementById("btn-fotos-papelera");

  btnFotosActivas.addEventListener("click", () => {
    vistaActual = "activas";
    paginaActual = 1;
    totalPaginas = 1;

    actualizarTabsFotos();
    actualizarTituloPrincipal();
    actualizarVistaFotos();
    cargarFotosPaginadas(true);
  });

  btnFotosPapelera.addEventListener("click", () => {
    vistaActual = "papelera";
    paginaActual = 1;
    totalPaginas = 1;
    actualizarTabsFotos();
    actualizarTituloPrincipal();
    actualizarVistaFotos();
    cargarFotosPaginadas(true);
  });

  document.querySelectorAll("[data-vista-eventos]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      vistaEventos = btn.dataset.vistaEventos;

      actualizarTabsEventos();
      actualizarTituloEventos();
      actualizarVistaEventos();
      const eventos = await cargarEventosAdmin();
      renderEventosAdmin(eventos);
    });
  });

  // Funciones UI
  function actualizarVistaFotos() {
    const bloqueFoto = document.getElementById("bloque-crear-foto");
    const btnCargarMas = document.getElementById("btn-cargar-mas");

    if (vistaActual === "papelera") {
      bloqueFoto.style.display = "none";
      btnCargarMas.style.display = "none";
    } else {
      bloqueFoto.style.display = "block";
      btnCargarMas.style.display = "block";
    }
  }
  function actualizarVistaEventos() {
    const bloqueEvento = document.getElementById("bloque-crear-evento");

    if (vistaEventos === "papelera") {
      bloqueEvento.style.display = "none";
    } else {
      bloqueEvento.style.display = "block";
    }
  }
  function actualizarTabsFotos() {
    btnFotosActivas.classList.toggle("active", vistaActual === "activas");
    btnFotosPapelera.classList.toggle("active", vistaActual === "papelera");
  }
  function actualizarTituloEventos() {
    const titulo = document.getElementById("titulo-eventos");

    if (vistaEventos === "papelera") {
      titulo.textContent = "Eventos en papelera";
    } else {
      titulo.textContent = "Eventos existentes";
    }
  }

  function actualizarTituloPrincipal() {
    const titulo = document.getElementById("titulo-principal");

    if (vistaActual === "papelera") {
      titulo.textContent = "Papelera de fotos";
    } else {
      titulo.textContent = "Administrador de fotos";
    }
  }
  function mostrarEstadoVacio() {
    const contenedor = document.getElementById("fotos-grid");

    const mensajes = {
      activas: "No hay fotos activas",
      papelera: "No hay elementos en la papelera",
    };

    contenedor.innerHTML = `
    <div class="estado-vacio">
      <p>${mensajes[vistaActual]}</p>
    </div>
  `;
  }
  function actualizarTabsEventos() {
    document.querySelectorAll("[data-vista-eventos]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.vistaEventos === vistaEventos);
    });
  }
  function mostrarToastUndo(mensaje, onUndo) {
    const toast = document.getElementById("admin-toast");

    if (!toast) {
      console.error("admin-toast no existe en el DOM");
      return;
    }

    toast.innerHTML = `
    <span>${mensaje}</span>
    <button id="undo-btn">Deshacer</button>
  `;

    toast.classList.add("visible");

    const timeout = setTimeout(() => {
      toast.classList.remove("visible");
    }, 5000);

    document.getElementById("undo-btn").addEventListener("click", () => {
      clearTimeout(timeout);
      toast.classList.remove("visible");
      onUndo();
    });
  }

  // function mostrarToast(mensaje, tipo = "success") {
  //   const toast = document.getElementById("admin-toast");

  //   toast.innerHTML = `<span>${mensaje}</span>`;

  //   toast.classList.remove("success", "error");
  //   toast.classList.add("visible", tipo);

  //   setTimeout(() => {
  //     toast.classList.remove("visible", tipo);
  //   }, 3000);
  // }

  //Función para editar fotos
  function activarModoEdicion(article, foto) {
    const info = article.querySelector(".admin-info");

    info.innerHTML = `
    <input class="edit-titulo" value="${foto.titulo}">
    <select class="edit-categoria">
      ${["Bodas", "Runner", "Paisaje", "Cultura", "Danza", "Deporte"]
        .map(
          (cat) => `
          <option value="${cat}" ${cat === foto.categoria ? "selected" : ""}>
            ${cat}
          </option>
        `,
        )
        .join("")}
    </select>
    `;

    const acciones = article.querySelector(".admin-actions");

    acciones.innerHTML = `
     <button class="btn-guardar">Guardar</button>
     <button class="btn-cancelar">Cancelar</button>
    `;

    acciones
      .querySelector(".btn-guardar")
      .addEventListener("click", async () => {
        await guardarCambios(article, foto.id);
      });

    acciones.querySelector(".btn-cancelar").addEventListener("click", () => {
      cargarFotosPaginadas(true);
    });
  }

  //Guardar cambios
  async function guardarCambios(article, id) {
    const nuevoTitulo = article.querySelector(".edit-titulo").value;
    const nuevaCategoria = article.querySelector(".edit-categoria").value;

    if (!nuevoTitulo) {
      mostrarToast("El título no puede estar vacío", "error");
      return;
    }

    const res = await fetch(`/api/fotos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        titulo: nuevoTitulo,
        categoria: nuevaCategoria,
      }),
    });

    if (!res.ok) {
      mostrarToast("Error actualizando foto", "error");
      return;
    }

    mostrarToast("Foto actualizada correctamente", "success");

    await cargarFotosPaginadas(true);
  }
  // Desactivar cuando termine de cargar

  //Cargar eventos en select
  async function cargarEventosEnSelect() {
    const eventos = await cargarEventosAdmin();

    selectEvento.innerHTML = `
    <option value="">Sin evento (portfolio)</option>
  `;

    eventos.forEach((evento) => {
      const option = document.createElement("option");
      option.value = evento.id;
      option.textContent = evento.nombre;
      selectEvento.appendChild(option);
    });
  }
  //Eliminar foto
  async function eliminarFoto(id) {
    console.log("Eliminando foto:", id);
    const res = await fetch(`/api/fotos/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      mostrarToast("Error moviendo a papelera", "error");
      return;
    }

    await cargarFotosPaginadas(true);

    mostrarToastUndo("Foto movida a papelera", async () => {
      await fetch(`/api/fotos/${id}/restore`, {
        method: "PUT",
      });

      await cargarFotosPaginadas(true);
    });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);

    const eventoId = formData.get("evento_id");
    console.log("Evento seleccionado:", eventoId);

    try {
      let url = "/api/fotos";

      if (eventoId && eventoId !== "") {
        url = `/api/eventos/${eventoId}/fotos`;
      }

      console.log("URL final:", url);
      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error subiendo imagen");

      form.reset();

      await cargarFotosPaginadas(true);

      alert("Foto agregada correctamente");
    } catch (err) {
      console.error(err);
      alert("No se pudo agregar la foto");
    }
  });
  // Cargar eventos en el admin
  async function cargarEventosAdmin() {
    const res = await fetch(`/api/eventos?estado=${vistaEventos}`);
    return res.json();
  }
  /* RENDER DE EVENTOS ADMIN
 ===========================================
 */
  function renderEventosAdmin(eventos) {
    eventosGrid.innerHTML = "";

    eventos.forEach((evento) => {
      const div = document.createElement("div");
      div.className = "admin-evento";

      div.innerHTML = `
      <img src="${evento.portada}" width="120">
      <strong class="evento-nombre">${evento.nombre}</strong>
      <p>${new Date(evento.fecha).toLocaleDateString("es-ES")}</p>

      ${
        vistaEventos === "activos"
          ? `
            <button class="btn-editar">Editar</button>
            <button class="btn-gestionar">Gestionar fotos</button>
            <button class="btn-eliminar">Mover a papelera</button>
          `
          : `
            <button class="btn-ver-fotos">Ver fotos</button>
            <button class="btn-restaurar">Restaurar</button>
            <button class="btn-eliminar-def">Eliminar definitivo</button>
          `
      }
    `;

      // ===============================
      // 🔹 VISTA ACTIVOS
      // ===============================
      if (vistaEventos === "activos") {
        // Editar
        div.querySelector(".btn-editar")?.addEventListener("click", () => {
          activarModoEdicionEvento(div, evento);
        });

        // Gestionar fotos
        div
  .querySelector(".btn-gestionar")
  ?.addEventListener("click", () => {

    window.location.href = `/admin-evento.html?id=${evento.id}`;

  });
        // div
        //   .querySelector(".btn-gestionar")
        //   ?.addEventListener("click", async () => {
        //     const res = await fetch(`/api/eventos/${evento.id}`);
        //     const data = await res.json();

        //     const panel = document.createElement("div");
        //     panel.className = "evento-panel";

        //     panel.innerHTML = `
        //     <h4>Fotos del evento</h4>

        //     <form class="form-subir-foto">
        //       <input type="text" name="titulo" placeholder="Título opcional" />
        //       <input type="number" name="precio" placeholder="Precio" required />
        //       <input type="file" name="imagen" required />
        //       <button type="submit">Subir foto</button>
        //     </form>

        //     <div class="evento-fotos-admin">
        //       ${data.fotos
        //         .map(
        //           (f) => `
        //         <img src="${f.src}"
        //              style="width:80px;height:80px;object-fit:cover;margin:4px;">
        //       `,
        //         )
        //         .join("")}
        //     </div>
        //   `;

        //     div.appendChild(panel);

        //     const form = panel.querySelector(".form-subir-foto");

        //     form.addEventListener("submit", async (e) => {
        //       e.preventDefault();

        //       const formData = new FormData(form);
        //       formData.append("evento_id", evento.id);

        //       await fetch("/api/fotos", {
        //         method: "POST",
        //         body: formData,
        //       });

        //       const actualizados = await cargarEventosAdmin();
        //       renderEventosAdmin(actualizados);
        //     });
        //   });

        // Mover a papelera
        div
          .querySelector(".btn-eliminar")
          ?.addEventListener("click", async () => {
            const seguro = confirm("¿Mover evento a la papelera?");
            if (!seguro) return;

            await fetch(`/api/eventos/${evento.id}`, {
              method: "DELETE",
            });

            const actualizados = await cargarEventosAdmin();
            renderEventosAdmin(actualizados);
          });
      }

      // ===============================
      // 🔹 VISTA PAPELERA
      // ===============================
      if (vistaEventos === "papelera") {
        // Ver fotos
        div
          .querySelector(".btn-ver-fotos")
          ?.addEventListener("click", async () => {
            const res = await fetch(`/api/eventos/${evento.id}`);
            const data = await res.json();

            const fotosContainer = document.createElement("div");
            fotosContainer.className = "evento-fotos-admin";

            fotosContainer.innerHTML = data.fotos
              .map(
                (f) =>
                  `
            <img src="${f.src}"
                 style="width:80px;height:80px;object-fit:cover;margin:4px;">
            `,
              )
              .join("");

            div.appendChild(fotosContainer);
          });

        // Restaurar
        div
          .querySelector(".btn-restaurar")
          ?.addEventListener("click", async () => {
            await fetch(`/api/eventos/${evento.id}/restore`, {
              method: "PUT",
            });

            const actualizados = await cargarEventosAdmin();
            renderEventosAdmin(actualizados);
          });

        // Eliminar definitivo
        div
          .querySelector(".btn-eliminar-def")
          ?.addEventListener("click", async () => {
            const seguro = confirm("¿Eliminar definitivamente el evento?");
            if (!seguro) return;

            await fetch(`/api/eventos/${evento.id}/permanent`, {
              method: "DELETE",
            });

            const actualizados = await cargarEventosAdmin();
            renderEventosAdmin(actualizados);
          });
      }

      eventosGrid.appendChild(div);
    });
  }
  /* ACTIVAR MODO DE EDICIÓN EVENTOS
=========================================
*/

  function activarModoEdicionEvento(div, evento) {
    div.innerHTML = `
  <img src="${evento.portada}" width="120">
    <input class="edit-nombre" value="${evento.nombre}">
    <input type="date" class="edit-fecha" value="${evento.fecha.split("T")[0]}">
    <label>
      <input type="checkbox" class="edit-destacado" ${evento.destacado ? "checked" : ""}>
      Destacado
    </label>
    <button class="btn-guardar-evento">Guardar</button>
    <button class="btn-cancelar-evento">Cancelar</button>
  `;

    div
      .querySelector(".btn-guardar-evento")
      .addEventListener("click", async () => {
        await guardarEvento(div, evento.id);
      });

    div
      .querySelector(".btn-cancelar-evento")
      .addEventListener("click", async () => {
        const eventos = await cargarEventosAdmin();
        renderEventosAdmin(eventos);
      });
  }

  // GUARDAR EVENTO
  async function guardarEvento(div, id) {
    const nombre = div.querySelector(".edit-nombre").value.trim();
    const fecha = div.querySelector(".edit-fecha").value;
    const destacado = div.querySelector(".edit-destacado").checked;

    if (!nombre) {
      mostrarToast("El nombre no puede estar vacío", "error");
      return;
    }

    const res = await fetch(`/api/eventos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nombre, fecha, destacado }),
    });

    if (!res.ok) {
      mostrarToast("Error actualizando evento", "error");
      return;
    }

    mostrarToast("Evento actualizado correctamente", "success");

    const eventos = await cargarEventosAdmin();
    renderEventosAdmin(eventos);
  }

  formEvento.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(formEvento);

    await fetch("/api/eventos", {
      method: "POST",
      body: formData,
    });

    formEvento.reset();

    const eventos = await cargarEventosAdmin();
    renderEventosAdmin(eventos);
  });

  async function initEventosAdmin() {
    const eventos = await cargarEventosAdmin();
    renderEventosAdmin(eventos);
  }

  initEventosAdmin();
  cargarEventosEnSelect();
  cargarFotosPaginadas(true);
});
