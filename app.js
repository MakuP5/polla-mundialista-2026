const partidosContainer = document.getElementById("partidosContainer");

async function cargarPartidos() {
  try {
    const respuesta = await fetch("data/partidos.json");
    const partidos = await respuesta.json();

    partidosContainer.innerHTML = "";

    partidos.forEach((partido) => {
      const div = document.createElement("div");
      div.className = "partido";

      div.innerHTML = `
        <h3>${partido.equipoLocal} vs ${partido.equipoVisitante}</h3>
        <p><strong>Fase:</strong> ${partido.fase}</p>
        <p><strong>Grupo:</strong> ${partido.grupo}</p>
        <p><strong>Fecha:</strong> ${new Date(partido.fecha).toLocaleString()}</p>

        <div class="prediccion">
          <input type="number" min="0" placeholder="0">
          <span>-</span>
          <input type="number" min="0" placeholder="0">
          <button>Guardar</button>
        </div>
      `;

      partidosContainer.appendChild(div);
    });

  } catch (error) {
    console.error("Error cargando partidos:", error);
    partidosContainer.innerHTML = "<p>No se pudieron cargar los partidos.</p>";
  }
}

cargarPartidos();