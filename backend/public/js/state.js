// state.js 
// Selección
export let seleccionadas = [];
export let ultimoEliminado = null;

// navegación
export let vista = "albums";        // "albums" | "fotos"
export let categoriaActiva = null;  // "bodas" | "runner" | "deporte"

// reservas
export const reservas = [];
export let filtroActual = "todas";

//isLoading
export let isLoading = true;

export function setAppLoaded () {
  isLoading = false;
}

//extender el state del carrito
export let eventoActivo = null;

export function irAEvento(id) {
  vista = "evento";
  eventoActivo = id;
}
export function irAEventos() {
  vista = "eventos";
}

export function salirDeEVento() {
  vista = "albums";
  eventoActivo = null;
}

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
// Recordar la navegación
 export function restaurarEstado(state) {
  vista = state.vista;
  categoriaActiva = state.categoriaActiva;
  eventoActivo = state.eventoActivo;
}
//Deshacer eliminado

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