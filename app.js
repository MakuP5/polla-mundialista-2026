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

const btnGuardarTodo = document.getElementById("btnGuardarTodo");
const estadoGuardadoGlobal = document.getElementById("estadoGuardadoGlobal");
const btnRecalcularBracket = document.getElementById("btnRecalcularBracket");

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

btnRecalcularBracket.addEventListener("click", () => {
  const pronosticosTemporales = recolectarPronosticosPartidos();

  const partidosCalculados = calcularPartidosConPronosticos(
    partidosGlobales,
    {
      ...prediccionesUsuario,
      ...pronosticosTemporales
    }
  );

  const partidosEliminacion = partidosCalculados.filter((partido) => !esFaseDeGrupos(partido));

  renderizarBracketEliminacion(partidosEliminacion);

  alert("Las llaves se recalcularon con los pronósticos ingresados.");
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

btnGuardarTodo.addEventListener("click", guardarTodosLosPronosticos);

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

    const partidosCalculados = calcularPartidosConPronosticos(partidos, prediccionesUsuario);

    const partidosGrupos = partidos.filter(esFaseDeGrupos);
    const partidosEliminacion = partidosCalculados.filter((partido) => !esFaseDeGrupos(partido));

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
    const docRef = doc(db, "prediccionesUsuarios", usuarioActual.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      prediccionesUsuario = data.partidos || {};

      estadoGuardadoGlobal.textContent = "Tus pronósticos guardados se cargaron correctamente.";
    } else {
      estadoGuardadoGlobal.textContent = "Todavía no has guardado tu polla.";
    }

  } catch (error) {
    console.error("Error cargando predicciones del usuario:", error);
    estadoGuardadoGlobal.textContent = "No se pudieron cargar tus pronósticos guardados.";
  }
}

function obtenerNombreEquipoDesdeTarjeta(partidoId, tipo) {
  const elemento = document.querySelector(`[data-equipo-${tipo}="${partidoId}"]`);
  return elemento ? elemento.textContent.trim() : null;
}

function recolectarPronosticosPartidos() {
  const pronosticos = {};

  partidosGlobales.forEach((partido) => {
    const inputLocal = document.getElementById(`local-${partido.id}`);
    const inputVisitante = document.getElementById(`visitante-${partido.id}`);
    const selectAvanza = document.getElementById(`avanza-${partido.id}`);
    const nombreLocalMostrado = obtenerNombreEquipoDesdeInput(partido.id, "local") || partido.equipoLocal;
    const nombreVisitanteMostrado = obtenerNombreEquipoDesdeInput(partido.id, "visitante") || partido.equipoVisitante;


    if (!inputLocal || !inputVisitante) {
      return;
    }

    const golesLocal = inputLocal.value;
    const golesVisitante = inputVisitante.value;

    if (golesLocal === "" && golesVisitante === "") {
      return;
    }

    pronosticos[partido.id] = {
      partidoId: partido.id,
      numero: partido.numero,
      fase: partido.fase,
      equipoLocal: equipoLocalMostrado,
      equipoVisitante: equipoVisitanteMostrado,
      grupo: partido.grupo || null,
      golesLocal: golesLocal === "" ? null : Number(golesLocal),
      golesVisitante: golesVisitante === "" ? null : Number(golesVisitante),
      equipoAvanza: selectAvanza ? selectAvanza.value || null : null,
      puntos: 0,
      estadoPuntuacion: "pendiente"
    };
  });

  return pronosticos;
}



async function guardarTodosLosPronosticos() {
  if (!usuarioActual) {
    alert("Primero debes iniciar sesión.");
    return;
  }

  await usuarioActual.reload();
  usuarioActual = auth.currentUser;

  if (!usuarioActual.emailVerified) {
    alert("Debes verificar tu correo antes de guardar tus pronósticos.");
    actualizarPanelUsuario(usuarioActual);
    return;
  }

  const pronosticosPartidos = recolectarPronosticosPartidos();

  if (Object.keys(pronosticosPartidos).length === 0) {
    alert("Todavía no has ingresado ningún pronóstico.");
    return;
  }

  try {
    const docRef = doc(db, "prediccionesUsuarios", usuarioActual.uid);

    await setDoc(docRef, {
      userId: usuarioActual.uid,
      userName: usuarioActual.displayName || usuarioActual.email,
      userEmail: usuarioActual.email,
      emailVerificado: usuarioActual.emailVerified,
      partidos: pronosticosPartidos,
      puntosTotales: 0,
      aciertosExactos: 0,
      aciertosResultado: 0,
      aciertosClasificados: 0,
      acertoCampeon: false,
      acertoSubcampeon: false,
      acertoGoleador: false,
      fechaActualizacion: serverTimestamp()
    }, { merge: true });

    prediccionesUsuario = pronosticosPartidos;

    estadoGuardadoGlobal.textContent = "Pronósticos guardados correctamente.";
    alert("Todos tus pronósticos fueron guardados correctamente.");

    await cargarPartidos();

  } catch (error) {
    console.error("Error guardando todos los pronósticos:", error);
    alert("No se pudieron guardar tus pronósticos.");
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
  const esEliminacion = !esFaseDeGrupos(partido);
const equipoAvanzaGuardado = prediccionGuardada ? prediccionGuardada.equipoAvanza : "";

const selectorAvanza = esEliminacion
  ? `
    <div class="selector-avanza">
      <label for="avanza-${partido.id}">Equipo que avanza</label>
      <select id="avanza-${partido.id}">
        <option value="">Selecciona</option>
        <option value="${partido.equipoLocal}" ${equipoAvanzaGuardado === partido.equipoLocal ? "selected" : ""}>
          ${local.nombre}
        </option>
        <option value="${partido.equipoVisitante}" ${equipoAvanzaGuardado === partido.equipoVisitante ? "selected" : ""}>
          ${visitante.nombre}
        </option>
      </select>
    </div>
  `
  : "";

return `
  <div class="partido ${modoBracket ? "partido-bracket" : ""} ${claseFinal}">
      <div class="partido-header">
        <span class="numero-partido">Partido ${partido.numero}</span>
        <span class="fase-partido">${traducirFase(partido.fase)}</span>
      </div>

      <div class="equipos ${modoBracket ? "equipos-bracket" : ""}">
        <div class="equipo">
          ${crearBandera(local)}
          <span class="nombre-equipo" data-equipo-local="${partido.id}">${local.nombre}</span>
        </div>

        <div class="versus">VS</div>

        <div class="equipo">
          ${crearBandera(visitante)}
          <span class="nombre-equipo" data-equipo-visitante="${partido.id}">${visitante.nombre}</span>
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

       
        ${estadoGuardado}
        ${selectorAvanza}
      </div>
    </div>
  `;
}

function calcularTablasDeGrupos(partidos, predicciones) {
  const tablas = {};

  const partidosGrupo = partidos.filter(esFaseDeGrupos);

  partidosGrupo.forEach((partido) => {
    const prediccion = predicciones[partido.id];

    if (!prediccion) return;
    if (prediccion.golesLocal === null || prediccion.golesVisitante === null) return;
    if (prediccion.golesLocal === undefined || prediccion.golesVisitante === undefined) return;

    const grupo = partido.grupo;
    if (!grupo) return;

    if (!tablas[grupo]) {
      tablas[grupo] = {};
    }

    inicializarEquipoEnTabla(tablas[grupo], partido.equipoLocal);
    inicializarEquipoEnTabla(tablas[grupo], partido.equipoVisitante);

    const golesLocal = Number(prediccion.golesLocal);
    const golesVisitante = Number(prediccion.golesVisitante);

    tablas[grupo][partido.equipoLocal].gf += golesLocal;
    tablas[grupo][partido.equipoLocal].gc += golesVisitante;

    tablas[grupo][partido.equipoVisitante].gf += golesVisitante;
    tablas[grupo][partido.equipoVisitante].gc += golesLocal;

    if (golesLocal > golesVisitante) {
      tablas[grupo][partido.equipoLocal].pts += 3;
      tablas[grupo][partido.equipoLocal].pg += 1;
      tablas[grupo][partido.equipoVisitante].pp += 1;
    } else if (golesLocal < golesVisitante) {
      tablas[grupo][partido.equipoVisitante].pts += 3;
      tablas[grupo][partido.equipoVisitante].pg += 1;
      tablas[grupo][partido.equipoLocal].pp += 1;
    } else {
      tablas[grupo][partido.equipoLocal].pts += 1;
      tablas[grupo][partido.equipoVisitante].pts += 1;
      tablas[grupo][partido.equipoLocal].pe += 1;
      tablas[grupo][partido.equipoVisitante].pe += 1;
    }
  });

  const posiciones = {};

  Object.keys(tablas).forEach((grupo) => {
    posiciones[grupo] = Object.values(tablas[grupo])
      .map((equipo) => ({
        ...equipo,
        dg: equipo.gf - equipo.gc
      }))
      .sort((a, b) => {
        if (b.pts !== a.pts) return b.pts - a.pts;
        if (b.dg !== a.dg) return b.dg - a.dg;
        if (b.gf !== a.gf) return b.gf - a.gf;
        return a.nombre.localeCompare(b.nombre);
      });
  });

  return posiciones;
}

function inicializarEquipoEnTabla(tablaGrupo, nombreEquipo) {
  if (!tablaGrupo[nombreEquipo]) {
    tablaGrupo[nombreEquipo] = {
      nombre: nombreEquipo,
      pts: 0,
      pg: 0,
      pe: 0,
      pp: 0,
      gf: 0,
      gc: 0
    };
  }
}

function obtenerMejoresTerceros(posiciones) {
  const terceros = [];

  Object.keys(posiciones).forEach((grupo) => {
    const tabla = posiciones[grupo];

    if (tabla && tabla[2]) {
      terceros.push({
        ...tabla[2],
        grupo
      });
    }
  });

  return terceros.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.nombre.localeCompare(b.nombre);
  });
}

function resolverEquipoDesdePronostico(textoOriginal, posiciones, mejoresTerceros, ganadoresPartidos) {
  if (!textoOriginal) return "Por definir";

  // Ganador de grupo: Group A Winners
  const ganadorGrupo = textoOriginal.match(/Group ([A-L]) Winners/);
  if (ganadorGrupo) {
    const grupo = ganadorGrupo[1];
    return posiciones[grupo]?.[0]?.nombre || traducirPlaceholder(textoOriginal);
  }

  // Segundo de grupo: Group A Runners Up
  const segundoGrupo = textoOriginal.match(/Group ([A-L]) Runners Up/);
  if (segundoGrupo) {
    const grupo = segundoGrupo[1];
    return posiciones[grupo]?.[1]?.nombre || traducirPlaceholder(textoOriginal);
  }

  // Mejor tercero entre grupos: Group A/B/C/D/E 3rd Place
  const terceroGrupo = textoOriginal.match(/Group ([A-L](?:\/[A-L])+) 3rd Place/);
  if (terceroGrupo) {
    const gruposPermitidos = terceroGrupo[1].split("/");

    const candidato = mejoresTerceros.find((equipo) =>
      gruposPermitidos.includes(equipo.grupo)
    );

    return candidato?.nombre || traducirPlaceholder(textoOriginal);
  }

  // Ganador de partido: Match 73 Winner
  const ganadorPartido = textoOriginal.match(/Match ([0-9]+) Winner/);
  if (ganadorPartido) {
    const numeroPartido = Number(ganadorPartido[1]);
    return ganadoresPartidos[numeroPartido] || traducirPlaceholder(textoOriginal);
  }

  // Perdedor de partido: Match 101 Loser
  const perdedorPartido = textoOriginal.match(/Match ([0-9]+) Loser/);
  if (perdedorPartido) {
    const numeroPartido = Number(perdedorPartido[1]);
    return ganadoresPartidos[`perdedor-${numeroPartido}`] || traducirPlaceholder(textoOriginal);
  }

  return textoOriginal;
}

function obtenerGanadorPronosticado(partido, prediccion) {
  if (!prediccion) return null;

  if (prediccion.equipoAvanza) {
    return prediccion.equipoAvanza;
  }

  if (prediccion.golesLocal === null || prediccion.golesVisitante === null) return null;
  if (prediccion.golesLocal === undefined || prediccion.golesVisitante === undefined) return null;

  const golesLocal = Number(prediccion.golesLocal);
  const golesVisitante = Number(prediccion.golesVisitante);

  if (golesLocal > golesVisitante) return partido.equipoLocal;
  if (golesVisitante > golesLocal) return partido.equipoVisitante;

  return null;
}

function obtenerPerdedorPronosticado(partido, ganador) {
  if (!ganador) return null;

  if (ganador === partido.equipoLocal) {
    return partido.equipoVisitante;
  }

  if (ganador === partido.equipoVisitante) {
    return partido.equipoLocal;
  }

  return null;
}


function calcularPartidosConPronosticos(partidos, predicciones) {
  const posiciones = calcularTablasDeGrupos(partidos, predicciones);
  const mejoresTerceros = obtenerMejoresTerceros(posiciones);

  const partidosCalculados = partidos
    .sort((a, b) => a.numero - b.numero)
    .map((partido) => ({ ...partido }));

  const ganadoresPartidos = {};

  partidosCalculados.forEach((partido) => {
    if (!esFaseDeGrupos(partido)) {
      partido.equipoLocal = resolverEquipoDesdePronostico(
        partido.equipoLocal,
        posiciones,
        mejoresTerceros,
        ganadoresPartidos
      );

      partido.equipoVisitante = resolverEquipoDesdePronostico(
        partido.equipoVisitante,
        posiciones,
        mejoresTerceros,
        ganadoresPartidos
      );
    }

    const prediccion = predicciones[partido.id];

    if (!esFaseDeGrupos(partido)) {
      const ganador = obtenerGanadorPronosticado(partido, prediccion);
      const perdedor = obtenerPerdedorPronosticado(partido, ganador);

      if (ganador) {
        ganadoresPartidos[partido.numero] = ganador;
      }

      if (perdedor) {
        ganadoresPartidos[`perdedor-${partido.numero}`] = perdedor;
      }
    }
  });

  return partidosCalculados;
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