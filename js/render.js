import { seleccionadas, sliderIndex, nextSlide, prevSlide, toggleSeleccion, quitarSeleccion, deshacerEliminado, confirmarEliminado} from "./state.js";
import { fotos } from "./data.js";
import { mostrarUndoToast } from "./ui/toast.js";


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
  const tit = document.getElementById("carrito-titulo");

  tit.textContent = `Fotos seleccionadas (${seleccionadas.length})`;
  contador.textContent = seleccionadas.length;
  contador.dataset.vacio = seleccionadas.length === 0;

  lista.innerHTML = "";

  if (seleccionadas.length === 0) {
    // lista.innerHTML = "<p>No hay fotos seleccionadas</p>";
    lista.innerHTML = `
    <div class="estado-vacio">
      <span class="estado-icon">🖼️</span>
      <p>Aún no has seleccionado fotos</p>
      <small>Explora los álbumes y elige tus favoritas</small>
    </div>
  `;

    //  cerrar carrito automáticamente
    carrito.classList.remove("abierto");

    return;
  }

  seleccionadas.forEach((id) => {
    const foto = fotos.find((f) => f.id === id);
    
    const item = document.createElement("div");
    // item.className = "item-seleccionada";
    item.className = "carrito-item", "item-seleccionada", "entrando";

    item.innerHTML = `
      <img src="${foto.src}" alt="${foto.titulo}">
      <div>
        <strong>${foto.titulo}</strong>
      </div>
      <button>Quitar</button>
    `;
 
  item.querySelector("button").addEventListener("click", () => {
  item.classList.add("saliendo");

  item.addEventListener("transitionend", () => {
    quitarSeleccion(id);
    rerender();

    mostrarUndoToast(
      () => {
        deshacerEliminado();
        rerender();
      },
      () => {
        confirmarEliminado();
      }
    );
  }, { once: true });
});
     
    lista.appendChild(item);
    
    requestAnimationFrame(() => {
   item.classList.remove("entrando");
   });

  });
    
}
//Toast
export function mostrarToast(mensaje) {
  const toast = document.getElementById("toast");

  toast.textContent = mensaje;
  toast.classList.add("visible");

  setTimeout(() => {
    toast.classList.remove("visible");
  }, 2000);
}

export function renderAlbums(fotos, onSelectCategoria, rerender) {
  const app = document.getElementById("app");
  app.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent ="Explora por categoría";
  title.className = "section-title";

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

    const previews = fotosCategoria
      .slice(0, 3)
      .map(f => `<img src="${f.src}" alt="">`)
      .join("");

    article.innerHTML = `
      <div class="album-preview">
        ${previews}
      </div>

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
    app.appendChild(title);
  });

  app.appendChild(grid);
 
}

export function renderFotosDeCategoria(fotos, categoria, rerender) {
  const app = document.getElementById("app");
  app.innerHTML = "";

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
      <p class="titulo-card">${foto.titulo}</p>
    `;

    //  click = cambiar estado
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
  
  title.textContent = "Fotos destacadas";
  title.className = "section-title section-title--secondary";


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
