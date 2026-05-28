const partidosContainer = document.getElementById("partidosContainer");

async function cargarPartidos() {
  try {
    const rutaJSON = "./data/partidos.json";
    const respuesta = await fetch(rutaJSON);

    if (!respuesta.ok) {
      throw new Error(`No se pudo cargar ${rutaJSON}. Estado HTTP: ${respuesta.status}`);
    }

    const partidos = await respuesta.json();

    partidosContainer.innerHTML = "";

    partidos.forEach((partido) => {
      const div = document.createElement("div");
      div.className = "partido";

      const grupoTexto = partido.grupo
        ? `<p><strong>Grupo:</strong> ${partido.grupo}</p>`
        : "";

      const banderaLocal = obtenerBandera(partido.equipoLocal);
      const banderaVisitante = obtenerBandera(partido.equipoVisitante);

      div.innerHTML = `
        <h3>Partido ${partido.numero}</h3>

        <div class="equipos">
          <div class="equipo">
            <span class="bandera">${banderaLocal}</span>
            <span class="nombre-equipo">${partido.equipoLocal}</span>
          </div>

          <div class="versus">VS</div>

          <div class="equipo">
            <span class="bandera">${banderaVisitante}</span>
            <span class="nombre-equipo">${partido.equipoVisitante}</span>
          </div>
        </div>

        <p><strong>Fase:</strong> ${partido.fase}</p>
        ${grupoTexto}
        <p><strong>Fecha:</strong> ${formatearFecha(partido.fecha)}</p>
        <p><strong>Hora local:</strong> ${partido.horaLocal}</p>
        <p><strong>Hora ET:</strong> ${partido.horaET}</p>
        <p><strong>Sede:</strong> ${partido.sede}</p>
        <p><strong>Ciudad:</strong> ${partido.ciudad}</p>

        <div class="prediccion">
          <input 
            type="number" 
            min="0" 
            id="local-${partido.id}" 
            placeholder="0"
          >

          <span>-</span>

          <input 
            type="number" 
            min="0" 
            id="visitante-${partido.id}" 
            placeholder="0"
          >

          <button onclick="guardarPrediccionTemporal('${partido.id}')">
            Guardar
          </button>
        </div>
      `;

      partidosContainer.appendChild(div);
    });

  } catch (error) {
    console.error("Error cargando partidos:", error);
    partidosContainer.innerHTML = `
      <p>No se pudieron cargar los partidos.</p>
      <p><small>Revisa que el archivo exista en <code>data/partidos.json</code>.</small></p>
    `;
  }
}

function formatearFecha(fechaTexto) {
  const partes = fechaTexto.split("-");
  const anio = Number(partes[0]);
  const mes = Number(partes[1]) - 1;
  const dia = Number(partes[2]);

  const fecha = new Date(anio, mes, dia);

  return fecha.toLocaleDateString("es-EC", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

function guardarPrediccionTemporal(partidoId) {
  const golesLocal = document.getElementById(`local-${partidoId}`).value;
  const golesVisitante = document.getElementById(`visitante-${partidoId}`).value;

  if (golesLocal === "" || golesVisitante === "") {
    alert("Ingresa ambos marcadores antes de guardar.");
    return;
  }

  console.log("Predicción temporal:", {
    partidoId,
    golesLocal: Number(golesLocal),
    golesVisitante: Number(golesVisitante)
  });

  alert("Predicción registrada temporalmente. Luego la guardaremos en Firebase.");
}

function obtenerBandera(pais) {
  const banderas = {
    "Mexico": "🇲🇽",
    "South Africa": "🇿🇦",
    "Argentina": "🇦🇷",
    "Brazil": "🇧🇷",
    "Ecuador": "🇪🇨",
    "United States": "🇺🇸",
    "Canada": "🇨🇦",
    "Costa Rica": "🇨🇷",
    "Japan": "🇯🇵",
    "Korea Republic": "🇰🇷",
    "South Korea": "🇰🇷",
    "Australia": "🇦🇺",
    "Iran": "🇮🇷",
    "Saudi Arabia": "🇸🇦",
    "Qatar": "🇶🇦",
    "Morocco": "🇲🇦",
    "Tunisia": "🇹🇳",
    "Egypt": "🇪🇬",
    "Senegal": "🇸🇳",
    "Ghana": "🇬🇭",
    "Nigeria": "🇳🇬",
    "Cameroon": "🇨🇲",
    "Algeria": "🇩🇿",
    "Ivory Coast": "🇨🇮",
    "Côte d'Ivoire": "🇨🇮",
    "Germany": "🇩🇪",
    "France": "🇫🇷",
    "Spain": "🇪🇸",
    "England": "🏴",
    "Portugal": "🇵🇹",
    "Netherlands": "🇳🇱",
    "Belgium": "🇧🇪",
    "Croatia": "🇭🇷",
    "Switzerland": "🇨🇭",
    "Denmark": "🇩🇰",
    "Poland": "🇵🇱",
    "Serbia": "🇷🇸",
    "Ukraine": "🇺🇦",
    "Austria": "🇦🇹",
    "Sweden": "🇸🇪",
    "Norway": "🇳🇴",
    "Italy": "🇮🇹",
    "Turkey": "🇹🇷",
    "Wales": "🏴",
    "Scotland": "🏴",
    "Uruguay": "🇺🇾",
    "Colombia": "🇨🇴",
    "Chile": "🇨🇱",
    "Peru": "🇵🇪",
    "Paraguay": "🇵🇾",
    "Venezuela": "🇻🇪",
    "Bolivia": "🇧🇴",
    "New Zealand": "🇳🇿",
    "Jamaica": "🇯🇲",
    "Panama": "🇵🇦",
    "Honduras": "🇭🇳",
    "El Salvador": "🇸🇻",
    "Guatemala": "🇬🇹",
    "China": "🇨🇳",
    "Iraq": "🇮🇶",
    "United Arab Emirates": "🇦🇪",
    "Russia": "🇷🇺"
  };

  return banderas[pais] || "🏳️";
}

cargarPartidos();