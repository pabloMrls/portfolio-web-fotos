
import {
  limpiarSeleccion,
  seleccionadas,
  vista,
  categoriaActiva,
  irAFotos,
  irAAlbums
} from "./state.js";


import { renderPanel } from "./render.js";
import { renderAlbums, renderFotosDeCategoria } from "./render.js";
import { renderBreadcrumb } from "./breadcrumb.js";
import { renderSlider } from "./render.js";
import { mostrarConfirmacion } from "./ui/toast.js";
import { enviarReserva } from "./api.js";


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


// Capturar el submit del formulario
const formReserva = document.getElementById("form-reserva");
const inputNombre = document.getElementById("reserva-nombre");
const inputEmail = document.getElementById("reserva-email");
const inputMensaje = document.getElementById("reserva-mensaje");

async function cargarFotos () {
  const res = await fetch("http://localhost:3000/api/fotos");
   if (!res.ok) throw new Error("Error cargando fotos");
  return await res.json();
}

let fotos = [];

 function render() {

 renderBreadcrumb([
  { label: "Galería", onClick: volverAGaleria },
  { label: categoriaActiva }
]);

  if (vista === "albums") {
    renderAlbums(fotos, irAFotos, render);

    const destacadas = fotos.filter(f => f.destacada);
    renderSlider(destacadas, render);
  }

  if (vista === "fotos") {
    renderFotosDeCategoria(
      fotos,
      categoriaActiva,
      // irAAlbums,
      render,
    );
  }

  renderPanel(render);
  btnLimpiarCarrito.disabled = seleccionadas.length === 0;
}

function volverAGaleria () {
  irAAlbums() //cambia el estado
  render();
}


//Abrir y cerrar el carrito 
btnCarrito.addEventListener("click", () => {
  carrito.classList.add("abierto");
});

btnCerrar.addEventListener("click", () => {
  carrito.classList.remove("abierto");
});

//Abrir modal de reserva
function abrirModalReserva() {
  cantidadSpan.textContent = seleccionadas.length;
  modal.classList.remove("hidden");

}
//cerrar modal de reserva
function cerrarModalReserva () {
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");

}

cerrarModalBtn.addEventListener("click", cerrarModalReserva);
cancelarBtn.addEventListener("click", cerrarModalReserva)
backdrop.addEventListener("click", cerrarModalReserva)

btnReservar.addEventListener("click", () => {
  if (seleccionadas.length === 0) return;
  abrirModalReserva();
});

// Tecla de escape para el formulario de reserva
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    cerrarModalReserva();
  }
});

// Escuchar el submmit
formReserva.addEventListener("submit", async e => {
  e.preventDefault(); 

  const nombre = inputNombre.value.trim();
  const email = inputEmail.value.trim();
  const mensaje = inputMensaje.value.trim();

  if (nombre === "" || email === "") {
    mostrarError("Por favor completa nombre e email");
    return;
  }

  const reserva = {
    nombre,
    email,
    mensaje,
     fotos: ["/img/bodas/bodas.jpeg"],
    // fotos: seleccionadas.map(id => `/img/fotos/${id}.jpg`),
    fecha: new Date().toISOString()
  };

  try {
    console.log("📤 Enviando reserva:", reserva);

    const result = await enviarReserva(reserva);

    console.log("✅ Guardada en backend:", result);

    mostrarConfirmacion("Gracias, te contactaremos a la brevedad");
    // UX (esto sí está bien hacerlo acá)
    limpiarSeleccion();
    formReserva.reset();
    cerrarModalReserva();
    render();

  } catch (err) {
    
    mostrarError("No se pudo enviar la reserva");
  }
});


function mostrarError(texto) {
  alert(texto);
}


function animarContador() {
  const contador = document.getElementById("contador");

  contador.classList.remove("animar");
  //  fuerza reflow (resetea la animación)
  // void contador.offsetWidth;

  contador.classList.add("animar");
}

animarContador();

//Limpiar carrito
btnLimpiarCarrito.addEventListener("click", () => {
  if (seleccionadas.length === 0) return;

  const seguro = confirm("¿Vaciar el carrito?");
  if (!seguro) return;
  limpiarSeleccion();
  
  render();
  
});


async function init() {
  fotos = await cargarFotos();
  console.log("📸 Fotos cargadas:", fotos);
  render();
}
// render();
init()