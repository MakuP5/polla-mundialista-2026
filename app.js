import { auth, provider, db } from "./firebase-config.js";

import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

const partidosContainer = document.getElementById("partidosContainer");
const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const userInfo = document.getElementById("userInfo");

let usuarioActual = null;
let partidosGlobales = [];

btnLogin.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("No se pudo iniciar sesión con Google.");
  }
});

btnLogout.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    usuarioActual = user;

    btnLogin.classList.add("hidden");
    btnLogout.classList.remove("hidden");
    userInfo.textContent = `Sesión iniciada como: ${user.displayName}`;

    await registrarUsuario(user);
    await cargarPartidos();

  } else {
    usuarioActual = null;

    btnLogin.classList.remove("hidden");
    btnLogout.classList.add("hidden");
    userInfo.textContent = "No has iniciado sesión.";

    await cargarPartidos();
  }
});

async function cargarPartidos() {
  try {
    const rutaJSON = "./data/partidos.json";
    const respuesta = await fetch(rutaJSON);

    if (!respuesta.ok) {
      throw new Error(`No se pudo cargar ${rutaJSON}. Estado HTTP: ${respuesta.status}`);
    }

    const partidos = await respuesta.json();

    partidosGlobales = partidos;

    partidosContainer.innerHTML = "";

    partidos.forEach((partido) => {
      const div = document.createElement("div");
      div.className = "partido";

      const local = obtenerSeleccion(partido.equipoLocal);
      const visitante = obtenerSeleccion(partido.equipoVisitante);

      const grupoTexto = partido.grupo
        ? `<p><strong>Grupo:</strong> ${partido.grupo}</p>`
        : "";

      div.innerHTML = `
        <div class="partido-header">
          <span class="numero-partido">Partido ${partido.numero}</span>
          <span class="fase-partido">${traducirFase(partido.fase)}</span>
        </div>

        <div class="equipos">
          <div class="equipo">
            ${crearBandera(local)}
            <span class="nombre-equipo">${local.nombre}</span>
          </div>

          <div class="versus">VS</div>

          <div class="equipo">
            ${crearBandera(visitante)}
            <span class="nombre-equipo">${visitante.nombre}</span>
          </div>
        </div>

        <div class="datos-partido">
          ${grupoTexto}
          <p><strong>Fecha:</strong> ${formatearFecha(partido.fecha)}</p>
          <p><strong>Hora local:</strong> ${partido.horaLocal}</p>
          <p><strong>Hora ET:</strong> ${partido.horaET}</p>
          <p><strong>Sede:</strong> ${partido.sede}</p>
          <p><strong>Ciudad:</strong> ${traducirCiudad(partido.ciudad)}</p>
        </div>

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

            <button onclick="guardarPrediccion('${partido.id}')">
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

function obtenerSeleccion(nombreOriginal) {
  const selecciones = {
    "Algeria": { nombre: "Argelia", codigo: "dz" },
    "Argentina": { nombre: "Argentina", codigo: "ar" },
    "Australia": { nombre: "Australia", codigo: "au" },
    "Austria": { nombre: "Austria", codigo: "at" },
    "Belgium": { nombre: "Bélgica", codigo: "be" },
    "Bosnia and Herzegovina": { nombre: "Bosnia y Herzegovina", codigo: "ba" },
    "Brazil": { nombre: "Brasil", codigo: "br" },
    "Canada": { nombre: "Canadá", codigo: "ca" },
    "Cape Verde": { nombre: "Cabo Verde", codigo: "cv" },
    "Colombia": { nombre: "Colombia", codigo: "co" },
    "Congo DR": { nombre: "República Democrática del Congo", codigo: "cd" },
    "Croatia": { nombre: "Croacia", codigo: "hr" },
    "Curaçao": { nombre: "Curazao", codigo: "cw" },
    "Czechia": { nombre: "Chequia", codigo: "cz" },
    "Ecuador": { nombre: "Ecuador", codigo: "ec" },
    "Egypt": { nombre: "Egipto", codigo: "eg" },
    "England": { nombre: "Inglaterra", codigo: "gb-eng" },
    "France": { nombre: "Francia", codigo: "fr" },
    "Germany": { nombre: "Alemania", codigo: "de" },
    "Ghana": { nombre: "Ghana", codigo: "gh" },
    "Haiti": { nombre: "Haití", codigo: "ht" },
    "Iran": { nombre: "Irán", codigo: "ir" },
    "Iraq": { nombre: "Irak", codigo: "iq" },
    "Ivory Coast": { nombre: "Costa de Marfil", codigo: "ci" },
    "Japan": { nombre: "Japón", codigo: "jp" },
    "Jordan": { nombre: "Jordania", codigo: "jo" },
    "Mexico": { nombre: "México", codigo: "mx" },
    "Morocco": { nombre: "Marruecos", codigo: "ma" },
    "Netherlands": { nombre: "Países Bajos", codigo: "nl" },
    "New Zealand": { nombre: "Nueva Zelanda", codigo: "nz" },
    "Norway": { nombre: "Noruega", codigo: "no" },
    "Panama": { nombre: "Panamá", codigo: "pa" },
    "Paraguay": { nombre: "Paraguay", codigo: "py" },
    "Portugal": { nombre: "Portugal", codigo: "pt" },
    "Qatar": { nombre: "Catar", codigo: "qa" },
    "Saudi Arabia": { nombre: "Arabia Saudita", codigo: "sa" },
    "Scotland": { nombre: "Escocia", codigo: "gb-sct" },
    "Senegal": { nombre: "Senegal", codigo: "sn" },
    "South Africa": { nombre: "Sudáfrica", codigo: "za" },
    "South Korea": { nombre: "Corea del Sur", codigo: "kr" },
    "Spain": { nombre: "España", codigo: "es" },
    "Sweden": { nombre: "Suecia", codigo: "se" },
    "Switzerland": { nombre: "Suiza", codigo: "ch" },
    "Tunisia": { nombre: "Túnez", codigo: "tn" },
    "Türkiye": { nombre: "Turquía", codigo: "tr" },
    "USA": { nombre: "Estados Unidos", codigo: "us" },
    "United States": { nombre: "Estados Unidos", codigo: "us" },
    "Uruguay": { nombre: "Uruguay", codigo: "uy" },
    "Uzbekistan": { nombre: "Uzbekistán", codigo: "uz" }
  };

  if (selecciones[nombreOriginal]) {
    return selecciones[nombreOriginal];
  }

  return {
    nombre: traducirPlaceholder(nombreOriginal),
    codigo: null
  };
}

function crearBandera(seleccion) {
  if (!seleccion.codigo) {
    return `<span class="bandera-placeholder">⚽</span>`;
  }

  return `
    <img 
      class="bandera-img" 
      src="https://flagcdn.com/${seleccion.codigo}.svg" 
      alt="Bandera de ${seleccion.nombre}"
      loading="lazy"
    >
  `;
}

function traducirPlaceholder(texto) {
  if (!texto) return "Por definir";

  let traducido = texto;

  traducido = traducido.replace(/Group ([A-L]) Winners/g, "Ganador Grupo $1");
  traducido = traducido.replace(/Group ([A-L]) Runners Up/g, "Segundo Grupo $1");
  traducido = traducido.replace(/Group ([A-L])\/([A-L])\/([A-L])\/([A-L])\/([A-L]) 3rd Place/g, "Mejor tercero Grupos $1/$2/$3/$4/$5");
  traducido = traducido.replace(/Group ([A-L])\/([A-L])\/([A-L])\/([A-L]) 3rd Place/g, "Mejor tercero Grupos $1/$2/$3/$4");
  traducido = traducido.replace(/Match ([0-9]+) Winner/g, "Ganador partido $1");
  traducido = traducido.replace(/Match ([0-9]+) Loser/g, "Perdedor partido $1");

  return traducido;
}

function traducirFase(fase) {
  const fases = {
    "Fase de grupos": "Fase de grupos",
    "Group Stage": "Fase de grupos",
    "Round of 32": "Dieciseisavos de final",
    "Round of 16": "Octavos de final",
    "Quarter-finals": "Cuartos de final",
    "Quarterfinals": "Cuartos de final",
    "Semi-finals": "Semifinales",
    "Semifinals": "Semifinales",
    "Third-place match": "Partido por el tercer lugar",
    "Final": "Final"
  };

  return fases[fase] || fase;
}

function traducirCiudad(ciudad) {
  const ciudades = {
    "Mexico City": "Ciudad de México",
    "Guadalajara": "Guadalajara",
    "Monterrey": "Monterrey",
    "Toronto": "Toronto",
    "Vancouver": "Vancouver",
    "Los Angeles": "Los Ángeles",
    "San Francisco Bay Area": "Área de la Bahía de San Francisco",
    "Seattle": "Seattle",
    "Dallas": "Dallas",
    "Houston": "Houston",
    "Kansas City": "Kansas City",
    "Atlanta": "Atlanta",
    "Miami": "Miami",
    "Boston": "Boston",
    "New York/New Jersey": "Nueva York / Nueva Jersey",
    "Philadelphia": "Filadelfia"
  };

  return ciudades[ciudad] || ciudad;
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

window.guardarPrediccion = async function(partidoId) {
  if (!usuarioActual) {
    alert("Primero debes iniciar sesión con Google.");
    return;
  }

  const golesLocal = document.getElementById(`local-${partidoId}`).value;
  const golesVisitante = document.getElementById(`visitante-${partidoId}`).value;

  if (golesLocal === "" || golesVisitante === "") {
    alert("Ingresa ambos marcadores antes de guardar.");
    return;
  }

  const partido = partidosGlobales.find((p) => p.id === partidoId);

  if (!partido) {
    alert("No se encontró el partido.");
    return;
  }

  const prediccionId = `${usuarioActual.uid}_${partidoId}`;

  try {
    await setDoc(doc(db, "predicciones", prediccionId), {
      userId: usuarioActual.uid,
      userName: usuarioActual.displayName,
      userEmail: usuarioActual.email,
      partidoId: partido.id,
      numero: partido.numero,
      fase: partido.fase,
      grupo: partido.grupo || null,
      equipoLocal: partido.equipoLocal,
      equipoVisitante: partido.equipoVisitante,
      golesLocal: Number(golesLocal),
      golesVisitante: Number(golesVisitante),
      puntos: 0,
      estadoPuntuacion: "pendiente",
      fechaRegistro: serverTimestamp(),
      fechaActualizacion: serverTimestamp()
    });

    alert("Predicción guardada correctamente en Firebase.");

  } catch (error) {
    console.error("Error guardando predicción:", error);
    alert("No se pudo guardar la predicción.");
  }
};

async function registrarUsuario(user) {
  const userRef = doc(db, "usuarios", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      nombre: user.displayName,
      email: user.email,
      rol: "participante",
      puntosTotales: 0,
      aciertosExactos: 0,
      aciertosResultado: 0,
      fechaRegistro: serverTimestamp()
    });
  }
}

//cargarPartidos();