// state.js 
// Selección
export let seleccionadas = [];
export let ultimoEliminado = null;

// navegación
export let vista = "albums";        // "albums" | "fotos"
export let categoriaActiva = null;  // "bodas" | "runner" | "deporte"

export function toggleSeleccion(id) {
  if (seleccionadas.includes(id)) {
    seleccionadas = seleccionadas.filter(x => x !== id);
  } else {
    seleccionadas.push(id);
  }
}

export function limpiarSeleccion() {
  seleccionadas = [];
}

export function irAAlbums () {
    vista = "albums";
    categoriaActiva = null;
}

export function irAFotos (categoria) {
    vista = "fotos";
    categoriaActiva = categoria;
}
 
//Deshacer eleimiado

export function quitarSeleccion(id) {
  ultimoEliminado = id;
  seleccionadas = seleccionadas.filter(x => x !== id);
}

export function deshacerEliminado() {
  if (ultimoEliminado !== null) {
    seleccionadas.push(ultimoEliminado);
    ultimoEliminado = null;
  }
}

export function confirmarEliminado() {
  ultimoEliminado = null;
}

//no hay DOM
//no hay render
// Solo estados + funciones que lo modifican

//slider 
export let sliderIndex = 0;
//funcion para ir hacia adelante
export function nextSlide(total) {
  sliderIndex = (sliderIndex + 1) % total;
}
// hacia atrás
export function prevSlide(total) {
  sliderIndex = (sliderIndex - 1 + total) % total;
}