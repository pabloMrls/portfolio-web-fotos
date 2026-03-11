// let undoTimeout = null;

// export function mostrarUndoToast(onUndo, onConfirmar) {
//   const toast = document.getElementById("toast");

//   toast.innerHTML = `
//     <span>Foto eliminada</span>
//     <button id="btnUndo">Deshacer</button>
//   `;

//   toast.classList.add("visible");

//   document.getElementById("btnUndo").onclick = () => {
//     clearTimeout(undoTimeout);
//     toast.classList.remove("visible");
//     onUndo();
//   };

//   undoTimeout = setTimeout(() => {
//     toast.classList.remove("visible");
//     onConfirmar();
//   }, 4000);
// }
export function mostrarToastUndo(mensaje, onUndo) {
  const toast = document.getElementById("toast");
  if (!toast) return;

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
export function mostrarConfirmacion(texto = "Reserva enviada correctamente") {
  const toast = document.getElementById("toast");

  toast.innerHTML = `
  <span>${texto}</span>
  `;

  toast.classList.add("visible");

  setTimeout(() => {
    toast.classList.remove("visible");
  }, 3000);
}

// ui/toast.js

export function mostrarToast(mensaje, tipo = "success") {

  const toast = document.getElementById("toast");

  if (!toast) return;

  toast.textContent = mensaje;

  toast.classList.remove("success","error");
  toast.classList.add("visible", tipo);

  setTimeout(() => {
    toast.classList.remove("visible");
  }, 3000);

}