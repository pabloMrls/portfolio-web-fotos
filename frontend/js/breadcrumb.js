//breadcrumb

import { vista, categoriaActiva, irAAlbums } from "./state.js";

export function renderBreadcrumb(items = []) {
  const breadcrumb = document.getElementById("breadcrumb");
  breadcrumb.innerHTML = "";

  if (items.length === 0) return;

  const ul = document.createElement("ul");
  ul.className = "breadcrumb";
  console.log("BREADCRUMB ITEMS:", items);

  items.forEach((item, index) => {
  const li = document.createElement("li");
    console.log("ITEM:", item, "index:", index, "len:", items.length);

  // Si el item tiene acción y NO es el último
  if (item.onClick && index < items.length - 1) {
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = item.label;

    a.addEventListener("click", e => {
      e.preventDefault();
      item.onClick();
    });

    li.appendChild(a);
  } else {
    // Último item (activo) o sin acción
    li.textContent = item.label || item;
  }

  ul.appendChild(li);
});


  breadcrumb.appendChild(ul);
}
