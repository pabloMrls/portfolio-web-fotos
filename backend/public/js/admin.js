
const contenedor = document.getElementById("fotos-grid");
const form = document.getElementById("form-foto");

// Cargar la fotos
async function cargarFotos() {
  const res = await fetch("http://localhost:3000/api/fotos");
  if(!res.ok) throw new Error ("Error cargando fotos");
  return await res.json();                                                         
}
// Mostrar las fotos en el administrador
function renderFotos(fotos){
contenedor.innerHTML = "";

fotos
.slice()
.reverse()
.forEach(foto => {
  const article = document.createElement("article");
  article.className = "admin-foto";

  article.innerHTML = `
   <img src="${foto.src}" alt="${foto.titulo}" class="miniaturas">
      <div class="admin-info">
        <strong>${foto.titulo}</strong>
        <small>${foto.categoria}</small>
      </div>
       <button class="btn-eliminar">Eliminar</button>
  `;

  article
      .querySelector(".btn-eliminar")
      .addEventListener("click", () => eliminarFoto(foto.id));

  contenedor.appendChild(article);
});
}

async function eliminarFoto(id) {
  const ok = confirm("¿Eliminar esta foto definitivamente?");
  if (!ok) return;
  try {
    const res = await fetch(`/api/fotos/${id}`, {
      method: "DELETE"
    });

    console.log("STATUS:", res.status);

    const text = await res.text();
    console.log("RESPUESTA:", text);

    if (!res.ok) throw new Error("Error eliminando");

    const fotos = await cargarFotos();
    renderFotos(fotos);

  } catch (err) {
    console.error("ERROR DELETE:", err);
    alert("No se pudo eliminar la foto");
  }
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  const formData = new FormData(form);

  try {
    const res = await fetch("/api/fotos", {
      method: "POST",
      body: formData
    });

    if (!res.ok) throw new Error("Error subiendo imagen");

    form.reset();

    const fotos = await cargarFotos();
    renderFotos(fotos);

    alert("Foto agregada correctamente");

  } catch (err) {
    console.error(err);
    alert("No se pudo agregar la foto");
  }
});



// función inicializadora
async function init() {
  try {
    const fotos = await cargarFotos();
    console.log("📸 Admin fotos:", fotos);
    renderFotos(fotos);
  } catch (err) {
    console.log(err);
    contenedor.textContent = "Error cargando fotos"
  }
}

init();