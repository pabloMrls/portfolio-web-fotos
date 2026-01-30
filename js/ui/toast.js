let undoTimeout = null;

export function mostrarUndoToast(onUndo, onConfirmar) {
  const toast = document.getElementById("toast");

  toast.innerHTML = `
    <span>Foto eliminada</span>
    <button id="btnUndo">Deshacer</button>
  `;

  toast.classList.add("visible");

  document.getElementById("btnUndo").onclick = () => {
    clearTimeout(undoTimeout);
    toast.classList.remove("visible");
    onUndo();
  };

  undoTimeout = setTimeout(() => {
    toast.classList.remove("visible");
    onConfirmar();
  }, 4000);
}
