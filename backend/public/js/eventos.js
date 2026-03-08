// const params = new URLSearchParams(window.location.search);
// const eventoId = params.get("id");
// async function cargarEventos() {

//   const res = await fetch("/api/eventos");
//   const eventos = await res.json();

//   renderEventos(eventos);

// }

// function renderEventos(eventos){

//   const grid = document.getElementById("eventos-grid");

//   grid.innerHTML = eventos.map(e => `

//     <article class="evento-card">

//       <img src="${e.portada}" alt="${e.nombre}">

//       <div class="evento-info">

//         <h3>${e.nombre}</h3>

//         <p>${new Date(e.fecha).toLocaleDateString()}</p>

//         <a href="/evento.html?id=${e.id}">
//           Ver evento
//         </a>

//       </div>

//     </article>

//   `).join("");

// }

// cargarEventos();