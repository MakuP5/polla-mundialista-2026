import { auth, provider, db } from "./firebase-config.js";

import {
   signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";



const gruposContainer = document.getElementById("gruposContainer");
const bracketContainer = document.getElementById("bracketContainer");
const misPrediccionesContainer = document.getElementById("misPrediccionesContainer");
const rankingContainer = document.getElementById("rankingContainer");

const btnLogin = document.getElementById("btnLogin");
const btnLogout = document.getElementById("btnLogout");
const userInfo = document.getElementById("userInfo");

const botonesTabs = document.querySelectorAll(".tab-btn");
const contenidosTabs = document.querySelectorAll(".tab-content");

const authLoggedOut = document.getElementById("authLoggedOut");
const authLoggedIn = document.getElementById("authLoggedIn");

const nombreRegistro = document.getElementById("nombreRegistro");
const emailAuth = document.getElementById("emailAuth");
const passwordAuth = document.getElementById("passwordAuth");

const btnReenviarVerificacion = document.getElementById("btnReenviarVerificacion");
const btnVerificarEstado = document.getElementById("btnVerificarEstado");

const emailVerificationPanel = document.getElementById("emailVerificationPanel");

const btnRegistroEmail = document.getElementById("btnRegistroEmail");
const btnLoginEmail = document.getElementById("btnLoginEmail");
const btnRecuperarPassword = document.getElementById("btnRecuperarPassword");


botonesTabs.forEach((boton) => {
  boton.addEventListener("click", () => {
    const tabId = boton.dataset.tab;

    botonesTabs.forEach((btn) => btn.classList.remove("active"));
    contenidosTabs.forEach((contenido) => contenido.classList.remove("active"));

    boton.classList.add("active");
    document.getElementById(tabId).classList.add("active");
  });
});  


let usuarioActual = null;
let partidosGlobales = [];
let prediccionesUsuario = {};

btnLogin.addEventListener("click", async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    alert("No se pudo iniciar sesión con Google.");
  }
});

btnRecuperarPassword.addEventListener("click", async () => {
  const email = emailAuth.value.trim().toLowerCase();

  if (!email) {
    alert("Ingresa tu correo electrónico para enviarte el enlace de recuperación.");
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);

    alert("Te enviamos un correo para restablecer tu contraseña. Revisa tu bandeja de entrada o spam.");
  } catch (error) {
    console.error("Error enviando recuperación de contraseña:", error);

    if (error.code === "auth/invalid-email") {
      alert("El correo ingresado no es válido.");
    } else if (error.code === "auth/user-not-found") {
      alert("No existe una cuenta registrada con ese correo.");
    } else {
      alert("No se pudo enviar el correo de recuperación.");
    }
  }
});

btnRegistroEmail.addEventListener("click", async () => {
  const nombre = nombreRegistro.value.trim();
  const email = emailAuth.value.trim().toLowerCase();
  const password = passwordAuth.value;

  if (!esCorreoInstitucional(email)) {
  alert("Debes registrarte con tu correo institucional UPS.");
  return;
}

  if (!nombre || !email || !password) {
    alert("Completa nombre, correo y contraseña.");
    return;
  }

  if (password.length < 6) {
    alert("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  try {
    const credencial = await createUserWithEmailAndPassword(auth, email, password);

    await updateProfile(credencial.user, {
      displayName: nombre
    });

    await sendEmailVerification(credencial.user);

    await registrarUsuario({
      ...credencial.user,
      displayName: nombre
    });

    alert("Registro creado. Te enviamos un correo de verificación. Revisa tu bandeja de entrada o spam.");

  } catch (error) {
    console.error("Error registrando usuario:", error);

    if (error.code === "auth/email-already-in-use") {
      alert("Ese correo ya está registrado. Intenta ingresar.");
    } else if (error.code === "auth/invalid-email") {
      alert("El correo no es válido.");
    } else if (error.code === "auth/weak-password") {
      alert("La contraseña es muy débil.");
    } else {
      alert("No se pudo crear el registro.");
    }
  }
});

btnLoginEmail.addEventListener("click", async () => {
  const email = emailAuth.value.trim().toLowerCase();
  const password = passwordAuth.value;

  if (!email || !password) {
    alert("Ingresa correo y contraseña.");
    return;
  }

  if (!esCorreoInstitucional(email)) {
  alert("Debes ingresar con tu correo institucional UPS.");
  return;
}

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Error ingresando con correo:", error);

    if (error.code === "auth/invalid-credential") {
      alert("Correo o contraseña incorrectos.");
    } else if (error.code === "auth/invalid-email") {
      alert("El correo no es válido.");
    } else {
      alert("No se pudo iniciar sesión.");
    }
  }
});

btnLogout.addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
});

btnReenviarVerificacion.addEventListener("click", async () => {
  if (!auth.currentUser) {
    alert("Primero inicia sesión.");
    return;
  }

  try {
    await sendEmailVerification(auth.currentUser);
    alert("Correo de verificación reenviado. Revisa tu bandeja de entrada o spam.");
  } catch (error) {
    console.error("Error reenviando verificación:", error);
    alert("No se pudo reenviar el correo de verificación.");
  }
});

btnVerificarEstado.addEventListener("click", async () => {
  if (!auth.currentUser) {
    alert("Primero inicia sesión.");
    return;
  }

  await auth.currentUser.reload();

  if (auth.currentUser.emailVerified) {
    alert("Correo verificado correctamente.");
    await cargarPartidos();
    actualizarPanelUsuario(auth.currentUser);
  } else {
    alert("Tu correo todavía no aparece como verificado. Revisa el enlace enviado a tu correo.");
  }
});

onAuthStateChanged(auth, async (user) => {
  if (user) {
    await user.reload();

    usuarioActual = auth.currentUser;

    actualizarPanelUsuario(usuarioActual);

    if (usuarioActual.emailVerified) {
      await registrarUsuario(usuarioActual);
    }

    await cargarPartidos();

  } else {
    usuarioActual = null;
    prediccionesUsuario = {};

    actualizarPanelUsuario(null);

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

    await cargarPrediccionesUsuario();

    const partidosGrupos = partidos.filter(esFaseDeGrupos);
    const partidosEliminacion = partidos.filter((partido) => !esFaseDeGrupos(partido));

    renderizarFaseGrupos(partidosGrupos);
    renderizarBracketEliminacion(partidosEliminacion);
    renderizarMisPredicciones();

  } catch (error) {
    console.error("Error cargando partidos:", error);

    gruposContainer.innerHTML = `
      <p>No se pudieron cargar los partidos de grupos.</p>
      <p><small>Revisa que exista <code>data/partidos.json</code>.</small></p>
    `;

    bracketContainer.innerHTML = `
      <p>No se pudieron cargar los partidos de eliminación directa.</p>
    `;
  }
}

function actualizarPanelUsuario(user) {
  if (user) {
    authLoggedOut.classList.add("hidden");
    authLoggedIn.classList.remove("hidden");

    const nombre = user.displayName || user.email;
    const verificado = user.emailVerified ? "Correo verificado" : "Correo no verificado";

    userInfo.textContent = `Sesión iniciada como: ${nombre} · ${verificado}`;

    if (user.emailVerified) {
      emailVerificationPanel.classList.add("hidden");
    } else {
      emailVerificationPanel.classList.remove("hidden");
    }

  } else {
    authLoggedOut.classList.remove("hidden");
    authLoggedIn.classList.add("hidden");
    emailVerificationPanel.classList.add("hidden");
    userInfo.textContent = "No has iniciado sesión.";
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
  alert("Primero debes iniciar sesión.");
  return;
}

await usuarioActual.reload();
usuarioActual = auth.currentUser;

if (!usuarioActual.emailVerified) {
  alert("Debes verificar tu correo antes de guardar predicciones.");
  actualizarPanelUsuario(usuarioActual);
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

    prediccionesUsuario[partidoId] = {
    golesLocal: Number(golesLocal),
    golesVisitante: Number(golesVisitante),
    puntos: 0,
    estadoPuntuacion: "pendiente"
    };

    alert("Predicción guardada correctamente en Firebase.");

    await cargarPartidos();

  } catch (error) {
    console.error("Error guardando predicción:", error);
    alert("No se pudo guardar la predicción.");
  }
};

async function registrarUsuario(user) {
  const userRef = doc(db, "usuarios", user.uid);
  const userSnap = await getDoc(userRef);

  const datosUsuario = {
    nombre: user.displayName || user.email,
    email: user.email,
    emailVerificado: user.emailVerified,
    rol: "participante",
    ultimaConexion: serverTimestamp()
  };

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      ...datosUsuario,
      puntosTotales: 0,
      aciertosExactos: 0,
      aciertosResultado: 0,
      fechaRegistro: serverTimestamp()
    });
  } else {
    await setDoc(userRef, datosUsuario, { merge: true });
  }
}

async function cargarPrediccionesUsuario() {
  prediccionesUsuario = {};

  if (!usuarioActual) {
    return;
  }

  try {
    const prediccionesRef = collection(db, "predicciones");

    const q = query(
      prediccionesRef,
      where("userId", "==", usuarioActual.uid)
    );

    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((documento) => {
      const prediccion = documento.data();

      prediccionesUsuario[prediccion.partidoId] = {
        golesLocal: prediccion.golesLocal,
        golesVisitante: prediccion.golesVisitante,
        puntos: prediccion.puntos,
        estadoPuntuacion: prediccion.estadoPuntuacion
      };
    });

    console.log("Predicciones cargadas:", prediccionesUsuario);

  } catch (error) {
    console.error("Error cargando predicciones del usuario:", error);
  }
}







function esFaseDeGrupos(partido) {
  const faseTraducida = traducirFase(partido.fase);
  return faseTraducida === "Fase de grupos";
}

function renderizarFaseGrupos(partidos) {
  gruposContainer.innerHTML = "";

  if (partidos.length === 0) {
    gruposContainer.innerHTML = "<p>No hay partidos de fase de grupos.</p>";
    return;
  }

  partidos
    .sort((a, b) => a.numero - b.numero)
    .forEach((partido) => {
      gruposContainer.innerHTML += crearTarjetaPartido(partido, false);
    });
}

function esCorreoInstitucional(email) {
  return email && email.toLowerCase().endsWith("@ups.edu.ec");
}

function renderizarBracketEliminacion(partidos) {
  if (partidos.length === 0) {
    bracketContainer.innerHTML = "<p>No hay partidos de eliminación directa.</p>";
    return;
  }

  const ordenFases = [
    "Dieciseisavos de final",
    "Octavos de final",
    "Cuartos de final",
    "Semifinales",
    "Partido por el tercer lugar",
    "Final"
  ];

  const partidosPorFase = {};

  ordenFases.forEach((fase) => {
    partidosPorFase[fase] = [];
  });

  partidos
    .sort((a, b) => a.numero - b.numero)
    .forEach((partido) => {
      const faseTraducida = traducirFase(partido.fase);

      if (!partidosPorFase[faseTraducida]) {
        partidosPorFase[faseTraducida] = [];
      }

      partidosPorFase[faseTraducida].push(partido);
    });

  bracketContainer.innerHTML = `
    <div class="bracket">
      ${ordenFases
        .filter((fase) => partidosPorFase[fase] && partidosPorFase[fase].length > 0)
        .map((fase) => `
          <div class="bracket-columna">
            <h3 class="bracket-titulo">${fase}</h3>
            <div class="bracket-partidos ${obtenerClaseBracket(fase)}">
              ${partidosPorFase[fase]
                .map((partido) => crearTarjetaPartido(partido, true))
                .join("")}
            </div>
          </div>
        `)
        .join("")}
    </div>
  `;
}

function obtenerClaseBracket(fase) {
  const clases = {
    "Dieciseisavos de final": "nivel-32",
    "Octavos de final": "nivel-16",
    "Cuartos de final": "nivel-8",
    "Semifinales": "nivel-4",
    "Partido por el tercer lugar": "nivel-3",
    "Final": "nivel-final"
  };

  return clases[fase] || "";
}

function crearTarjetaPartido(partido, modoBracket = false) {
  const local = obtenerSeleccion(partido.equipoLocal);
  const visitante = obtenerSeleccion(partido.equipoVisitante);

  const prediccionGuardada = prediccionesUsuario[partido.id];

  const valorLocal = prediccionGuardada ? prediccionGuardada.golesLocal : "";
  const valorVisitante = prediccionGuardada ? prediccionGuardada.golesVisitante : "";

  const estadoGuardado = prediccionGuardada
    ? `<span class="estado-guardado">Guardado</span>`
    : `<span class="estado-pendiente">Sin guardar</span>`;

  const grupoTexto = partido.grupo
    ? `<p><strong>Grupo:</strong> ${partido.grupo}</p>`
    : "";

  const datosPartido = modoBracket
    ? `
      <div class="datos-partido datos-partido-bracket">
        <p><strong>Fecha:</strong> ${formatearFecha(partido.fecha)}</p>
        <p><strong>Hora:</strong> ${partido.horaLocal}</p>
        <p><strong>Ciudad:</strong> ${traducirCiudad(partido.ciudad)}</p>
      </div>
    `
    : `
      <div class="datos-partido">
        ${grupoTexto}
        <p><strong>Fecha:</strong> ${formatearFecha(partido.fecha)}</p>
        <p><strong>Hora local:</strong> ${partido.horaLocal}</p>
        <p><strong>Hora ET:</strong> ${partido.horaET}</p>
        <p><strong>Sede:</strong> ${partido.sede}</p>
        <p><strong>Ciudad:</strong> ${traducirCiudad(partido.ciudad)}</p>
      </div>
    `;

  const claseFinal = partido.numero === 104 ? "partido-final" : "";

return `
  <div class="partido ${modoBracket ? "partido-bracket" : ""} ${claseFinal}">
      <div class="partido-header">
        <span class="numero-partido">Partido ${partido.numero}</span>
        <span class="fase-partido">${traducirFase(partido.fase)}</span>
      </div>

      <div class="equipos ${modoBracket ? "equipos-bracket" : ""}">
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

      ${datosPartido}

      <div class="prediccion ${modoBracket ? "prediccion-bracket" : ""}">
        <input 
          type="number" 
          min="0" 
          id="local-${partido.id}" 
          placeholder="0"
          value="${valorLocal}"
        >

        <span>-</span>

        <input 
          type="number" 
          min="0" 
          id="visitante-${partido.id}" 
          placeholder="0"
          value="${valorVisitante}"
        >

        <button onclick="guardarPrediccion('${partido.id}')">
          Guardar
        </button>

        ${estadoGuardado}
      </div>
    </div>
  `;
}

function renderizarMisPredicciones() {
  if (!usuarioActual) {
    misPrediccionesContainer.innerHTML = `
      <p>Inicia sesión para ver tus predicciones guardadas.</p>
    `;
    return;
  }

  const idsPredichos = Object.keys(prediccionesUsuario);

  if (idsPredichos.length === 0) {
    misPrediccionesContainer.innerHTML = `
      <p>Aún no has guardado predicciones.</p>
    `;
    return;
  }

  const partidosConPrediccion = partidosGlobales.filter((partido) =>
    idsPredichos.includes(partido.id)
  );

  misPrediccionesContainer.innerHTML = "";

  partidosConPrediccion
    .sort((a, b) => a.numero - b.numero)
    .forEach((partido) => {
      misPrediccionesContainer.innerHTML += crearTarjetaPartido(partido, false);
    });
}




//cargarPartidos();