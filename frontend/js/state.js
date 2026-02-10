// state.js 
// Selección
export let seleccionadas = [];
export let ultimaEliminada = null;

// navegación
export let vista = "albums";        // "albums" | "fotos"
export let categoriaActiva = null;  // "bodas" | "runner" | "deporte"

// reservas
export const reservas = [];
export let filtroActual = "todas";

export function agregarReserva(reserva){
  reservas.push(reserva);
}

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
  const index = seleccionadas.indexOf(id);
  if (index !== -1) {
    ultimaEliminada = id;
    seleccionadas.splice(index, 1);
  }
}
export function deshacerEliminado() {
  if (ultimaEliminada !== null) {
    seleccionadas.push(ultimaEliminada);
    ultimaEliminada = null;
  }
}

export function confirmarEliminado() {
  ultimaEliminada = null;
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