import { seleccionadas, sliderIndex, nextSlide, prevSlide, toggleSeleccion, } from "./state.js";
import { fotos } from "./data.js";



export function renderFotos(onToggle) {
  const app = document.getElementById("app");
  app.innerHTML = "";

  fotos.forEach((foto) => {
    const div = document.createElement("div");
    div.className = "foto";

    if (seleccionadas.includes(foto.id)) {
      div.classList.add("selected");
    }

    div.innerHTML = `
      ${foto.titulo}
      <span class="tilde">✓</span>
    `;

    div.addEventListener("click", () => onToggle(foto.id));
    app.appendChild(div);
  });
}

export function renderPanel(rerender) {
  const carrito = document.getElementById("carrito");
  const lista = document.getElementById("lista-seleccionadas");
  const contador = document.getElementById("contador");

  contador.textContent = seleccionadas.length;
  lista.innerHTML = "";

  if (seleccionadas.length === 0) {
    lista.innerHTML = "<p>No hay fotos seleccionadas</p>";

    // 🔥 cerrar carrito automáticamente
    carrito.classList.remove("abierto");

    return;
  }

  seleccionadas.forEach((id) => {
    const foto = fotos.find((f) => f.id === id);

    const item = document.createElement("div");
    item.className = "item-seleccionada";

    item.innerHTML = `
      <img src="${foto.src}" alt="${foto.titulo}">
      <div>
        <strong>${foto.titulo}</strong>
      </div>
      <button>Quitar</button>
    `;

    item.querySelector("button").addEventListener("click", () => {
      toggleSeleccion(id);
      rerender();
    });

    lista.appendChild(item);
  });
}

// export function renderAlbums(fotos, onSelectCategoria, rerender) {
//   const app = document.getElementById("app");
//   app.innerHTML = "";

//   const grid = document.createElement("section");
//   grid.className = "albums-grid";

//   const grupos = {};

//   fotos.forEach((foto) => {
//     if (!grupos[foto.categoria]) {
//       grupos[foto.categoria] = [];
//     }
//     grupos[foto.categoria].push(foto);
//   });

//   Object.entries(grupos).forEach(([categoria, fotosCategoria]) => {
//     const article = document.createElement("article");
//     article.className = "album";
//     article.tabIndex = 0;

//     const figure = document.createElement("figure");

//     const img = document.createElement("img");
//     img.src = fotosCategoria[0].src;
//     img.alt = `Álbum de ${categoria}`;

//     const figcaption = document.createElement("figcaption");
//     const title = document.createElement("h2");
//     title.textContent = categoria;

//     figcaption.appendChild(title);
//     figure.appendChild(img);
//     figure.appendChild(figcaption);
//     article.appendChild(figure);

//     article.addEventListener("click", () => {
//       onSelectCategoria(categoria);
//       rerender();
//     });

//     grid.appendChild(article);
//   });

//   app.appendChild(grid);
// }

export function renderAlbums(fotos, onSelectCategoria, rerender) {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const grid = document.createElement("section");
  grid.className = "albums-grid";

  const grupos = {};

  fotos.forEach(foto => {
    if (!grupos[foto.categoria]) {
      grupos[foto.categoria] = [];
    }
    grupos[foto.categoria].push(foto);
  });

  Object.entries(grupos).forEach(([categoria, fotosCategoria]) => {
    const article = document.createElement("article");
    article.className = "album";
    article.tabIndex = 0;

    article.innerHTML = `
      <img
        src="${fotosCategoria[0].src}"
        alt="Álbum ${categoria}"
      />

      <div class="album-overlay">
        <h2>${categoria}</h2>
        <span>${fotosCategoria.length} fotos</span>
      </div>
    `;

    article.addEventListener("click", () => {
      onSelectCategoria(categoria);
      rerender();
    });

    article.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        onSelectCategoria(categoria);
        rerender();
      }
    });

    grid.appendChild(article);
  });

  app.appendChild(grid);
}



export function renderFotosDeCategoria(fotos, categoria, rerender) {
  const app = document.getElementById("app");
  app.innerHTML = "";

  //  botón volver
  // const btnVolver = document.createElement("button");
  // btnVolver.textContent = "← Volver a álbumes";

  // btnVolver.addEventListener("click", () => {
  //   onVolver();
  //   rerender();
  // });

  // app.appendChild(btnVolver);

  //  título de categoría
  const titulo = document.createElement("h2");
  titulo.textContent = categoria.toUpperCase();
  app.appendChild(titulo);

  //  grid de fotos
  const grid = document.createElement("div");
  grid.className = "fotos-grid";

  const fotosFiltradas = fotos.filter((f) => f.categoria === categoria);

  fotosFiltradas.forEach((foto) => {
    const card = document.createElement("div");
    card.className = "foto-card";
    card.dataset.id = foto.id;

    //estado -> vista

    if (seleccionadas.includes(foto.id)) {
      card.classList.add("selected");
    }
    //destacada
    if (foto.destacada) {
      card.classList.add("featured");
    }

    card.innerHTML = `
      <img src="${foto.src}" alt="${foto.titulo}">
      <span class="tilde">✓</span>
      <p>${foto.titulo}</p>
    `;

    // 👉 click = cambiar estado
    card.addEventListener("click", () => {
      toggleSeleccion(foto.id);
      rerender();
    });
    // card.appendChild(img);
    // card.appendChild(titulo);
    grid.appendChild(card);
  });

  app.appendChild(grid);
}

// export  function renderSlider(fotos, rerender) {
//   const app = document.getElementById("app");

//   const section = document.createElement("section");
//   section.className = "slider-destacadas";

//   const title = document.createElement("h2");
//   title.textContent = "Imágenes destacadas";
  
//   section.appendChild(title);

//   //acá va el slider (img + botones)
//   app.appendChild(section);
// }

// renderSlider.js
export function renderSlider(fotos, rerender) {
  const app = document.getElementById("app");

  // Si no hay fotos destacadas, no renderiza nada
  if (!fotos || fotos.length === 0) return;

  // Contenedor del slider
  const section = document.createElement("section");
  section.className = "slider-destacadas";

  const frame = document.createElement("div");
  frame.className = "slider-frame";

  const fotoActual = fotos[sliderIndex];
  
  const title = document.createElement("h2");
  title.className = "slider-title";
  title.textContent = "Fotos destacadas";

  frame.innerHTML = `
    <img src="${fotoActual.src}" alt="${fotoActual.titulo}">
    
    <div class="slider-overlay">
      <h3>${fotoActual.titulo}</h3>
    </div>

    <button class="slider-btn prev" aria-label="Anterior">‹</button>
    <button class="slider-btn next" aria-label="Siguiente">›</button>
  `;

  // Eventos
  frame.querySelector(".prev").addEventListener("click", e => {
    e.stopPropagation();
    prevSlide(fotos.length);
    rerender();
  });

  frame.querySelector(".next").addEventListener("click", e => {
    e.stopPropagation();
    nextSlide(fotos.length);
    rerender();
  });
  section.appendChild(title);
  section.appendChild(frame);
  app.appendChild(section);
}
