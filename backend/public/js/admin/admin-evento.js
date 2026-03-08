import { mostrarToast } from "../ui/toast.js";
console.log("Toast importado:", mostrarToast);
//Obtener id desde la url
const params = new URLSearchParams(window.location.search);
const eventoId = params.get("id");

async function cargarEvento () {
    const res = await fetch(`/api/eventos/${eventoId}`);
    const data = await res.json();

    const evento = data.evento;
    const fotos = data.fotos;

    document.getElementById("evento-nombre").textContent = evento.nombre;
    renderFotos(fotos);
}

const form = document.getElementById("form-subir-foto");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    
    const res = await fetch (`/api/eventos/${eventoId}/fotos`, {
        method: "POST",
        body: formData
    });

    if(!res.ok) {
        alert("Error subiendo foto");
        return;
    }

    form.reset();
    
    cargarEvento();
});

function renderFotos(fotos) {

  const grid = document.getElementById("evento-fotos-grid");

 grid.innerHTML = fotos.map(f => `
  
    <div class="admin-foto">

      <img src="${f.src}" class="admin-img">

      <div class="admin-overlay">

        <input 
          type="number"
          class="precio-input"
          data-id="${f.id}"
          value="${f.precio || 0}"
        >

        <button 
          class="btn-eliminar-foto"
          data-id="${f.id}">
          🗑
        </button>

      </div>

    </div>

  `).join("");

  activarAccionesFotos();

}
function activarAccionesFotos() {

  document.querySelectorAll(".precio-input")
.forEach(input => {

  async function guardarPrecio(){

    input.classList.add("guardando");
    console.log("GUARDANDO PRECIO");

    const id = input.dataset.id;
    const precio = Number(input.value);

    const res = await fetch(`/api/fotos/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ precio })
    });

    if (!res.ok) {
      alert("Error actualizando precio");
      return;
    }

    input.classList.remove("guardando");

    mostrarToast("Precio actualizado");

  }

  // guardar al salir del input
  input.addEventListener("blur", guardarPrecio);

  // guardar al presionar enter
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      guardarPrecio();
      input.blur();
    }
  });

});

  document.querySelectorAll(".btn-eliminar-foto")
  .forEach(btn => {

    btn.addEventListener("click", async () => {

      const id = btn.dataset.id;

      const seguro = confirm("¿Mover foto a papelera?");
      if (!seguro) return;

      await fetch(`/api/fotos/${id}`, {
        method: "DELETE"
      });

      cargarEvento();

    });

  });

}
cargarEvento();