//breadcrumb

import { vista, categoriaActiva, irAAlbums } from "./state.js";

export function renderBreadcrumb(items = []) {
  const breadcrumb = document.getElementById("breadcrumb");
  breadcrumb.innerHTML = "";

  if (items.length === 0) return;

  const ul = document.createElement("ul");
  ul.className = "breadcrumb";

  items.forEach(item => {
    const li = document.createElement("li");
    li.textContent = item;
    ul.appendChild(li);
  });

  breadcrumb.appendChild(ul);
}
