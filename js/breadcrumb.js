//breadcrumb

import { vista, categoriaActiva, irAAlbums } from "./state.js";

export function renderBreadcrumb (render) {
    const nav = document.getElementById("breadcrumb");
    breadcrumb.innerHTML = `Galeria`;


    if(vista === "albumbs") {
         nav.innerHTML = `
         <ol class="breadcrumb">
          <li aria-current="page">Álbumes</li>
        </ol>
    `;
    return;
    }

    if(vista === "fotos") {
         nav.innerHTML = `
      <ol class="breadcrumb">
        <li>
          <a href="#" id="bc-albums">Álbumes</a>
        </li>
        <li aria-current="page">${categoriaActiva}</li>
      </ol>
    `;

    document
      .getElementById("bc-albums")
      .addEventListener("click", e => {
        e.preventDefault();
        irAAlbums();
        render();
      });
        
    }
}