import { fotos } from "./data.js";
import { limpiarSeleccion, seleccionadas} from "./state.js";
import { renderPanel } from "./render.js";
import { vista, categoriaActiva, irAFotos, irAAlbums } from "./state.js";
import { renderAlbums, renderFotosDeCategoria } from "./render.js";
import { renderBreadcrumb } from "./breadcrumb.js";
import { renderSlider } from "./render.js";

const btnLimpiarCarrito = document.getElementById("btn-limpiar");
const carrito = document.getElementById("carrito");
const btnCarrito = document.getElementById("btn-carrito");
const btnCerrar = document.getElementById("cerrar-carrito");

function render() {
 
  renderBreadcrumb(render);

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

//Abrir y cerrar el carrito 
btnCarrito.addEventListener("click", () => {
  carrito.classList.add("abierto");
});

btnCerrar.addEventListener("click", () => {
  carrito.classList.remove("abierto");
});


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



render();
