import { fotos } from "./data.js";
import { limpiarSeleccion, seleccionadas } from "./state.js";
import { renderPanel } from "./render.js";
import { vista, categoriaActiva, irAFotos, irAAlbums } from "./state.js";
import { renderAlbums, renderFotosDeCategoria } from "./render.js";
import { renderBreadcrumb } from "./breadcrumb.js";
import { renderSlider } from "./render.js";

const btnLimpiarCarrito = document.getElementById("btn-limpiar");
const carrito = document.getElementById("carrito");
const btnCarrito = document.getElementById("btn-carrito");
const btnCerrar = document.getElementById("cerrar-carrito");

btnCarrito.addEventListener("click", () => {
  carrito.classList.add("abierto");
});

btnCerrar.addEventListener("click", () => {
  carrito.classList.remove("abierto");
});


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
  btnLimpiar.disabled = seleccionadas.length === 0;
}


btnLimpiarCarrito.addEventListener("click", () => {
  if (seleccionadas.length === 0) return;

  const seguro = confirm("¿Vaciar el carrito?");
  if (!seguro) return;

  limpiarSeleccion();
  render();
});

render();
