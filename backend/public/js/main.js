console.log("MAIN TEST ACTIVO");

import { renderBreadcrumb } from "./breadcrumb.js";
import { cargarFotos, enviarReserva } from "./api.js";
import {
  seleccionadas,
  toggleSeleccion,
  quitarSeleccion,
  limpiarSeleccion,
  vista,
  categoriaActiva,
  irAFotos,
  irAAlbums,
  confirmarEliminado,
  deshacerEliminado,
  sliderIndex,
  isLoading,
  setAppLoaded,
  irAEvento,
  irAEventos,
  eventoActivo,
  salirDeEVento,
  restaurarEstado
} from "./state.js";

// import {
//   mostrarToast,
//   renderAlbums,
//   renderFotosDeCategoria,
// } from "./render.js";
import { mostrarUndoToast, mostrarConfirmacion } from "js/ui/toast.js";

import {
  renderAlbums,
  renderFotosDeCategoria,
  renderSlider,
} from "./render.js";


let isSubmitting = false;

// refactorización
function getStateSnapshot() {
  return {
    vista,
    categoriaActiva,
    seleccionadas: [...seleccionadas],
    sliderIndex,
  };
}
function dispatch(accion) {
  console.log("ANTES", getStateSnapshot());
  const scrollY = window.scrollY;
  accion(); // cambia de estado
  history.pushState(
    { vista, categoriaActiva, eventoActivo},
    "",
    ""
  );
  console.log("DESPUÉS", getStateSnapshot());
  render(); // actualiza UI

  requestAnimationFrame(() => {
    window.scrollTo(0, scroll);
  });

}

// dispatch(() => irAFotos(categoria));
// const app = document.getElementById("app");

let fotosCategorias = [];
let fotosEventoActual = [];

const btnLimpiarCarrito = document.getElementById("btn-limpiar");
const carrito = document.getElementById("carrito");
const btnCarrito = document.getElementById("btn-carrito");
const btnCerrar = document.getElementById("cerrar-carrito");

//modal de reservas
const btnReservar = document.querySelector(".btn-primario"); //Botón del carrito
const modal = document.getElementById("modal-reserva");
const cerrarModalBtn = document.getElementById("cerrar-modal");
const cancelarBtn = document.getElementById("cancelar-reserva");
const backdrop = modal.querySelector(".modal-backdrop");
const cantidadSpan = document.getElementById("reserva-cantidad");

// Menú hamburguesa
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");
const navOverlay = document.getElementById("nav-overlay");

function openMenu() {
  navLinks.classList.add("active");
  navOverlay.classList.add("active");
  document.body.classList.add("no-scroll");
  navToggle.textContent = "✕";
}

function closeMenu() {
  navLinks.classList.remove("active");
  navOverlay.classList.remove("active");
  document.body.classList.remove("no-scroll");
  navToggle.textContent = "☰";
}

navToggle.addEventListener("click", () => {
  if (navLinks.classList.contains("active")) {
    closeMenu();
  } else {
    openMenu();
  }
});

navOverlay.addEventListener("click", closeMenu);

const navItems = navLinks.querySelectorAll("a");
navItems.forEach((item) => {
  item.addEventListener("click", () => {
    navLinks.classList.remove("active");
    navOverlay.classList.remove("active");
    document.body.classList.remove("no-scroll");
    navToggle.textContent = "☰";
  });
});

//Preview imagenes
let currentIndex = 0;
let fotosActuales = [];

const modalPreview = document.getElementById("modal-preview");
const previewImg = document.getElementById("preview-img");
const previewClose = document.getElementById("preview-close");
const previewPrev = document.getElementById("preview-prev");
const previewNext = document.getElementById("preview-next");

export function openPreview(index, fotos) {
  console.log("OPEN PREVIEW EJECUTADO");
  if (modalPreview.parentNode !== document.body) {
    document.body.appendChild(modalPreview);
  }
  fotosActuales = fotos;
  currentIndex = index;
  updatePreview();

  requestAnimationFrame(() => {
    modalPreview.classList.remove("hidden");
    modalPreview.setAttribute("aria-hidden", "false");
  });

  document.body.classList.add("no-scroll");
}

function closePreview() {
  modalPreview.classList.add("hidden");
  modalPreview.setAttribute("aria-hidden", "true");

  document.body.classList.remove("no-scroll");
}
// function updatePreview() {
//   console.log("FOTO ACTUAL:", fotosActuales[currentIndex]);
//   previewImg.src = fotosActuales[currentIndex].src;
// }

function updatePreview() {
  console.log("ARRAY:", fotosActuales);
  console.log("INDEX:", currentIndex);
  console.log("OBJ:", fotosActuales[currentIndex]);

  previewImg.src = fotosActuales[currentIndex]?.src;
}

previewClose.addEventListener("click", closePreview);

previewPrev.addEventListener("click", () => {
  currentIndex =
    (currentIndex - 1 + fotosActuales.length) % fotosActuales.length;
  updatePreview();
});

previewNext.addEventListener("click", () => {
  currentIndex = (currentIndex + 1) % fotosActuales.length;
  updatePreview();
});

modalPreview.addEventListener("click", (e) => {
  if (e.target.classList.contains("preview-backdrop")) {
    closePreview();
  }
});

document.addEventListener("keydown", (e) => {
  if (modalPreview.classList.contains("hidden")) return;

  if (e.key === "Escape") closePreview();
  if (e.key === "ArrowRight") previewNext.click();
  if (e.key === "ArrowLeft") previewPrev.click();
});

// Capturar el submit del formulario
const formReserva = document.getElementById("form-reserva");
const inputNombre = document.getElementById("reserva-nombre");
const inputEmail = document.getElementById("reserva-email");
const inputMensaje = document.getElementById("reserva-mensaje");

//Abrir y cerrar el carrito
btnCarrito.addEventListener("click", () => {
  carrito.classList.add("abierto");
});

btnCerrar.addEventListener("click", () => {
  carrito.classList.remove("abierto");
});


//Abrir modal de reserva
function abrirModalReserva() {
  const total = calcularTotal();
  const resumen = document.getElementById("resumen-reserva");

  resumen.innerHTML = `
  <div class="modal-resumen">
    <strong>${seleccionadas.length} fotos</strong>
    <div class="total">
      $${total.toLocaleString("es-AR")}
    </div>
  </div>
`;
  modal.classList.remove("hidden");
}
//cerrar modal de reserva
function cerrarModalReserva() {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
}

cerrarModalBtn.addEventListener("click", cerrarModalReserva);
cancelarBtn.addEventListener("click", cerrarModalReserva);
backdrop.addEventListener("click", cerrarModalReserva);

btnReservar.addEventListener("click", () => {
  if (seleccionadas.length === 0) return;
  abrirModalReserva();
});

// Tecla de escape para el formulario de reserva
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    cerrarModalReserva();
  }
});

// Escuchar el submmit
formReserva.addEventListener("submit", async (e) => {
  e.preventDefault();


  if (isSubmitting) return;

  const nombre = inputNombre.value.trim();
  const email = inputEmail.value.trim();
  const mensaje = inputMensaje.value.trim();

  if (nombre === "" || email === "") {
    mostrarError("Por favor completa nombre e email");
    return;
  }

  isSubmitting = true;

  const btn = formReserva.querySelector("button[type='submit']");
  const textoOriginal = btn.textContent;

  btn.disabled = true;
  btn.textContent = "Enviando...";

  const reserva = {
    nombre,
    email,
    mensaje,
    fotos: [...seleccionadas],
    total: calcularTotal(),
  };

  try {
    
    await new Promise((resolve) => setTimeout(resolve, 4000));
    await enviarReserva(reserva);

    // mostrarConfirmacion("Gracias, te contactaremos a la brevedad");

    // cerrarModalReserva();
    mostrarEstadoExito();

    dispatch(() => limpiarSeleccion());

    console.log("MOSTRAR EXITO");
  } catch (err) {
    // console.error("ERROR REAL:", err);
    // mostrarError("No se pudo enviar la reserva, porque ya realizaste la reserva anteriormente");
    console.error("ERROR COMPLETO:", err);

    if (err.response) {
      console.error("STATUS:", err.response.status);
      console.error("DATA:", err.response.data);
    }

    mostrarError("Error real: " + (err.response?.data?.error || err.message));
  } finally {
    isSubmitting = false;
    btn.disabled = false;
    btn.textContent = textoOriginal;
  }
});

function mostrarEstadoExito() {
  const form = modal.querySelector("#form-reserva");
  const exito = modal.querySelector("#estado-exito");
  const btnCerrarExito = modal.querySelector("#cerrar-exito");
  const subtitle = document.getElementById("modal-subtitle");

  if (!form || !exito) {
    console.error("No se encontró form o estado-exito");
    return;
  }

  form.classList.add("hidden");
  exito.classList.remove("hidden");
  if (subtitle) {
    subtitle.textContent = "Resumen de tu reserva";
  }
  if (!btnCerrarExito) {
    console.error("No se encontró cerrar-exito");
    return;
  }

  btnCerrarExito.addEventListener("click", () => {
    cerrarModalReserva();
    resetearModalVisual();
  });
}

function resetearModalVisual() {
  const form = document.getElementById("form-reserva");
  const exito = document.getElementById("estado-exito");
  const subtitle = document.getElementById("modal-subtitle");
  form.classList.remove("hidden");
  exito.classList.add("hidden");

  if (subtitle) {
    subtitle.textContent = "Resumen";
  }

  form.reset();
}
function mostrarError(texto) {
  alert(texto);
}

btnLimpiarCarrito.addEventListener("click", () => {
  if (seleccionadas.length === 0) return;

  const seguro = confirm("¿Vaciar el carrito?");
  if (!seguro) return;
  dispatch(() => limpiarSeleccion());
});

async function cargarEventosDestacados() {
  const res = await fetch("/api/eventos?destacados=true");
  if (!res.ok) return [];
  return res.json();
}

console.log("vista:", vista, "categoria:", categoriaActiva);

// Control del layout
const layoutMap = {
  albums: () => {
    renderBreadcrumb([{ label: "Galería" }]);
    renderSlider(
      fotosCategorias.filter((f) => f.destacada),
      render,
    );
  },

  fotos: () => {
    renderBreadcrumb([
      {
        label: "Galería",
        onClick: () => dispatch(() => irAAlbums()),
      },
      { label: categoriaActiva },
    ]);
  },
};

function renderLayout() {
   const breadcrumb = document.getElementById("breadcrumb");

  if (breadcrumb) {
    breadcrumb.innerHTML = "";
  }
  layoutMap[vista]?.();
}


const viewMap = {
  albums: () => {
    renderAlbums(fotosCategorias, (categoria) => {
      dispatch(() => irAFotos(categoria));
    });
  },

  fotos: () => {
    renderFotosDeCategoria(
      fotosCategorias,
      categoriaActiva,
      seleccionadas,
      (id) => dispatch(() => toggleSeleccion(id)),
      openPreview,
      render
    );
  },
  evento: renderEventoView,
  eventos: renderEventosView
};

function renderMainView() {
  // console.log("Render main view:", vista);
  // console.log("Vista actual:", vista);
  // console.log("Categoria activa:", categoriaActiva);
  viewMap[vista]?.();
}

// RENDER PRINCIPAL
function render() {
  console.log("RENDER EJECUTADO");
  if (isLoading) {
    renderAppSkeleton();
    return;
  }

  // document.body.classList.toggle("is-evento", vista === "evento");

  document.body.classList.remove(
  "view-albums",
  "view-fotos",
  "view-eventos",
  "view-evento"
);

document.body.classList.add(`view-${vista}`);

  renderLayout();
  renderMainView();
  renderCarrito();
}

function renderAppSkeleton() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <h2 class="section-title">Explora por categoría</h2>

    <section class="albums-grid">
      ${Array(4)
      .fill(
        `
        <article class="album skeleton-card">
          <div class="album-preview skeleton-img"></div>
          <div class="album-overlay">
            <div class="skeleton-text short"></div>
            <div class="skeleton-text tiny"></div>
          </div>
        </article>
      `,
      )
      .join("")}
    </section>
  `;
}

function renderEventosHome(eventos) {
  const container = document.getElementById("eventos-slider");
  if (!container) return;

  container.innerHTML = "";

  eventos.forEach((evento) => {
    const card = document.createElement("a");
    card.className = "evento-card";
    // card.href = `/evento/${evento.id}`;
    
    card.innerHTML = `
      <img src="${evento.portada}" alt="${evento.nombre}">
      <div class="evento-info">
        <h3>${evento.nombre}</h3>
        <p>${new Date(evento.fecha).toLocaleDateString("es-ES")}</p>
      </div>
    `;
    card.addEventListener("click", () => {
      dispatch(() => irAEvento(evento.id));
       history.pushState({}, "", `/evento/${evento.id}`);

    });
    container.appendChild(card);
  });
}

async function renderEventosView() {

  const app = document.getElementById("app");

  app.innerHTML = `
    <section class="eventos-page">
      <h2 class="section-title">Eventos</h2>
      <div id="eventos-grid" class="eventos-grid"></div>
    </section>
  `;

  const grid = document.getElementById("eventos-grid");

  const eventos = await cargarEventosDestacados();

  eventos.forEach(evento => {

    const card = document.createElement("div");
    card.className = "evento-card";

    card.innerHTML = `
      <img src="${evento.portada}">
      <div class="evento-info">
        <h3>${evento.nombre}</h3>
        <p>${new Date(evento.fecha).toLocaleDateString("es-ES")}</p>
      </div>
    `;

    card.addEventListener("click", () => {
      dispatch(() => irAEvento(evento.id));
    });

    grid.appendChild(card);

  });

}
//
function actualizarHeaderCarrito() {
  const contador = document.getElementById("contador");
  const title = document.getElementById("carrito-titulo");

  title.textContent = `Fotos seleccionadas (${seleccionadas.length})`;
  contador.textContent = seleccionadas.length;
  contador.dataset.vacio = seleccionadas.length === 0;
}

function renderEstadoVacio(lista, carrito) {
  lista.innerHTML = `
    <div class="estado-vacio">
      <span class="estado-icon">
        <span class="material-symbols-outlined">image</span>
      </span>
      <p>Aún no has seleccionado fotos</p>
      <small>Explora los álbumes y elige tus favoritas</small>
    </div>
  `;

  carrito.classList.remove("abierto");
}

function renderItemsCarrito(lista) {
  const fotosPorId = new Map(
    [...fotosCategorias, ...fotosEventoActual].map((f) => [f.id, f]),
  );

  seleccionadas.forEach((id) => {
    const foto = fotosPorId.get(id);
    if (!foto) return;

    const item = document.createElement("div");
    item.className = "carrito-item";

    item.innerHTML = `
      <img src="${foto.src}" alt="${foto.titulo}">
      <div>
        <strong>${foto.titulo}</strong>
      </div>
      <button>
        Quitar
        <span class="material-symbols-outlined">delete</span>
      </button>
    `;

    item.querySelector("button").addEventListener("click", () => {
      dispatch(() => quitarSeleccion(id));

      mostrarUndoToast(
        () => dispatch(() => deshacerEliminado()),
        () => dispatch(() => confirmarEliminado()),
      );
    });

    lista.appendChild(item);
  });
}
function renderCarrito() {
  const carrito = document.getElementById("carrito");
  const lista = document.getElementById("lista-seleccionadas");

  actualizarHeaderCarrito();

  lista.innerHTML = "";

  if (seleccionadas.length === 0) {
    renderEstadoVacio(lista, carrito);
    return;
  }

  renderItemsCarrito(lista);
  const total = calcularTotal();

  const totalDiv = document.createElement("div");
  totalDiv.className = "carrito-total";
  totalDiv.innerHTML = `
  <strong>Total estimado:</strong>
  $${total.toLocaleString("es-AR")}
`;

  lista.appendChild(totalDiv);
}
//CALCULAR PRECIO DEL CARRITO
function calcularTotal() {
  return seleccionadas.reduce((acc, id) => {
    const foto =
      fotosCategorias.find((f) => f.id === id) ||
      fotosEventoActual.find((f) => f.id === id);

    const precio = Number(foto?.precio) || 0;

    console.log("ID:", id, "Precio:", precio);

    return acc + precio;
  }, 0);
}
// MANSORY
function ajustarMasonry() {
  const grid = document.querySelector(".fotos-grid");
  if (!grid) return;

  const rowHeight = parseInt(
    window.getComputedStyle(grid).getPropertyValue("grid-auto-rows"),
  );

  const rowGap = parseInt(
    window.getComputedStyle(grid).getPropertyValue("gap"),
  );

  grid.querySelectorAll(".evento-item").forEach((item) => {
    const img = item.querySelector("img");

    if (!img.complete) {
      img.onload = ajustarMasonry;
      return;
    }

    const itemHeight = img.getBoundingClientRect().height;
    const rowSpan = Math.ceil((itemHeight + rowGap) / (rowHeight + rowGap));

    item.style.gridRowEnd = `span ${rowSpan}`;
  });
}
window.addEventListener("resize", ajustarMasonry);

//Función utilitaria

function toggleGrupoFotos(listaFotos) {

  const todasSeleccionadas = listaFotos.every(f =>
    seleccionadas.includes(f.id)
  );

  if (todasSeleccionadas) {

    // quitar todas
    listaFotos.forEach(f => {
      if (seleccionadas.includes(f.id)) {
        dispatch(() => toggleSeleccion(f.id));
      }
    });

  } else {

    // seleccionar todas
    listaFotos.forEach(f => {
      if (!seleccionadas.includes(f.id)) {
        dispatch(() => toggleSeleccion(f.id));
      }
    });

  }

}
// RENDER DE EVENTO
async function renderEventoView() {
  console.log("RENDER EVENTO EJECUTADO");

  const app = document.getElementById("app");
  app.innerHTML = "<p>Cargando evento...</p>";

  try {
    const res = await fetch(`/api/eventos/${eventoActivo}`);
    if (!res.ok) throw new Error("Evento no encontrado");

    const data = await res.json();

    const { evento, fotos: fotosEvento } = data;

    fotosEventoActual = fotosEvento;

    app.innerHTML = `
      <section class="evento-hero">
        <img src="${evento.portada}" />

        <div class="evento-hero-overlay">
          <button id="volver-evento">← Volver</button>
          <h1>${evento.nombre}</h1>
          <p>${new Date(evento.fecha).toLocaleDateString("es-ES")}</p>
          <p>${evento.descripcion || ""}</p>
        </div>
      </section>

      <section class="evento-galeria">

        <div class="evento-toolbar">
             <button id="seleccionar-evento" class="btn-select-all">
                <span class="material-symbols-outlined">checklist</span>
                  Seleccionar todas
              </button>
        </div>

        <div class="fotos-grid">

          ${fotosEventoActual
        .map(
          (foto) => `
            <div class="evento-item ${seleccionadas.includes(foto.id) ? "selected" : ""}" data-id="${foto.id}">

              <img src="${foto.src}" alt="${foto.titulo || ""}">
               
               <span class="tilde ${seleccionadas.includes(foto.id) ? "visible" : ""}">
                  <span class="material-symbols-outlined">done</span>
               </span>

              <div class="evento-overlay">
                <span class="evento-precio">
                  $${Number(foto.precio || 0).toLocaleString("es-AR")}
                </span>
              </div>

      <button
  type="button"
  class="evento-add ${seleccionadas.includes(foto.id) ? "remove" : ""}"
  data-id="${foto.id}">
  ${seleccionadas.includes(foto.id) ? "−" : "+"}
</button>

            </div>
          `,
        )
        .join("")}

        </div>
      </section>
    `;

    document
      .getElementById("volver-evento")
      .addEventListener("click", () => dispatch(() => salirDeEVento()));

    document.querySelectorAll(".evento-item").forEach((item) => {
      const id = Number(item.dataset.id);

      item.querySelector("img").addEventListener("click", () => {
        const indexReal = fotosEventoActual.findIndex((f) => f.id === id);

        openPreview(indexReal, fotosEventoActual);
      });

      item.querySelector(".evento-add").addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        dispatch(() => toggleSeleccion(id));
      });
    });

    const todasSeleccionadas = fotosEventoActual.every(f =>
      seleccionadas.includes(f.id)
    );
    const btnSeleccionarEvento = document.getElementById("seleccionar-evento");

    btnSeleccionarEvento.textContent = todasSeleccionadas
      ? "Deseleccionar todas"
      : `Seleccionar ${fotosEventoActual.length} fotos`;

    btnSeleccionarEvento.addEventListener("click", () => {
      toggleGrupoFotos(fotosEventoActual);
    });
    ajustarMasonry();
  } catch (err) {
    app.innerHTML = "<p>Error cargando evento</p>";
  }
}
async function init() {
  render(); // muestra skeleton
  // detectar ruta
  const path = window.location.pathname;

  if (path.startsWith("/evento/")) {
    const id = Number(path.split("/")[2]);
    if (!isNaN(id)) {
      irAEvento(id);
    }
  }

  fotosCategorias = await cargarFotos();
  const eventos = await cargarEventosDestacados();

  renderEventosHome(eventos);

  dispatch(() => setAppLoaded());
}

init();

//Recordar el estado de la navegación

history.replaceState(
  { vista, categoriaActiva, eventoActivo},
  "",
  ""
);

window.addEventListener("popstate", () => {

  const path = window.location.pathname;

  if (path.startsWith("/evento/")) {
    const id = Number(path.split("/")[2]);
    dispatch(() => irAEvento(id));
  } else {
    dispatch(() => salirDeEVento());
  }

});
const btnVerTodos = document.getElementById("ver-todos-eventos");

if (btnVerTodos) {
  btnVerTodos.addEventListener("click", (e) => {
    e.preventDefault();
    dispatch(() => irAEventos());
  });
}