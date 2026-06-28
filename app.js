import { auth, db } from "./firebase-config.js";

import {
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
const rankingContainer = document.getElementById("rankingContainer");

const btnLogout = document.getElementById("btnLogout");
const userInfo = document.getElementById("userInfo");

const botonesTabs = document.querySelectorAll(".tab-btn");
const contenidosTabs = document.querySelectorAll(".tab-content");

const authLoggedOut = document.getElementById("authLoggedOut");
const authLoggedIn = document.getElementById("authLoggedIn");

const nombreRegistro = document.getElementById("nombreRegistro");

const emailLogin = document.getElementById("emailLogin");
const passwordLogin = document.getElementById("passwordLogin");

const emailRegistro = document.getElementById("emailRegistro");
const passwordRegistro = document.getElementById("passwordRegistro");
const confirmarPasswordRegistro = document.getElementById(
  "confirmarPasswordRegistro"
);

const tabLoginAuth = document.getElementById("tabLoginAuth");
const tabRegistroAuth = document.getElementById("tabRegistroAuth");

const panelLoginAuth = document.getElementById("panelLoginAuth");
const panelRegistroAuth = document.getElementById("panelRegistroAuth");

const irRegistroAuth = document.getElementById("irRegistroAuth");
const irLoginAuth = document.getElementById("irLoginAuth");

const btnReenviarVerificacion = document.getElementById("btnReenviarVerificacion");
const btnVerificarEstado = document.getElementById("btnVerificarEstado");

const emailVerificationPanel = document.getElementById("emailVerificationPanel");

const btnRegistroEmail = document.getElementById("btnRegistroEmail");
const btnLoginEmail = document.getElementById("btnLoginEmail");
const btnRecuperarPassword = document.getElementById("btnRecuperarPassword");

const btnGuardarTodo = document.getElementById("btnGuardarTodo");
const estadoGuardadoGlobal = document.getElementById("estadoGuardadoGlobal");
const btnRecalcularBracket = document.getElementById("btnRecalcularBracket");

const especialCampeon = document.getElementById("especialCampeon");
const especialSubcampeon = document.getElementById("especialSubcampeon");

const especialGoleador = document.getElementById("especialGoleador");
const especialMejorJugador = document.getElementById("especialMejorJugador");
const estadoEspeciales = document.getElementById("estadoEspeciales");
const btnRecalcularPuntajes = document.getElementById("btnRecalcularPuntajes");

const btnTabAdmin = document.getElementById("btnTabAdmin");
const adminContainer = document.getElementById("adminContainer");
const btnActualizarAdmin = document.getElementById("btnActualizarAdmin");

function mostrarErrorFirebase(error, mensajeFallback = "No se pudo completar la operación.") {
  const esPermiso = error?.code === "permission-denied" || error?.message?.includes("permission") || error?.message?.includes("PERMISSION_DENIED");

  if (esPermiso) {
    console.warn("Firestore bloqueó la operación por permisos. Se continuará con el modo de solo vista.", error);

    if (estadoGuardadoGlobal) {
      estadoGuardadoGlobal.textContent = "La base de datos está bloqueada por reglas de Firestore. Puedes seguir navegando, pero los datos no se sincronizarán hasta publicar las reglas correctas.";
    }

    return true;
  }

  console.error(mensajeFallback, error);
  return false;
}



// =====================================================
// RESULTADOS OFICIALES Y PUNTUACIÓN
// =====================================================

const PUNTOS_RESULTADO_GRUPOS = 1;
const PUNTOS_MARCADOR_EXACTO = 2;

const PUNTOS_CLASIFICADO = 1;
const PUNTOS_POSICION_CLASIFICADO = 1;

const PUNTOS_DIECISEISAVOS = 2;
const PUNTOS_OCTAVOS = 3;
const PUNTOS_CUARTOS = 4;
const PUNTOS_SEMIFINALES = 5;

const PUNTOS_CAMPEON = 5;
const PUNTOS_SUBCAMPEON = 4;

const PUNTOS_GOLEADOR = 5;
const PUNTOS_MEJOR_JUGADOR = 5;


// =====================================================
// RESULTADOS OFICIALES Y PUNTUACIÓN
// =====================================================
// =====================================================
// RESULTADOS OFICIALES Y PUNTUACIÓN
// =====================================================
// =====================================================
// RESULTADOS OFICIALES Y PUNTUACIÓN
// =====================================================

const resultadosOficiales = {
 
  "partido-001": {
    golesLocal: 2,
    golesVisitante: 0
  },

  "partido-002": {
    golesLocal: 2,
    golesVisitante: 1
  },

  "partido-003": {
    golesLocal: 1,
    golesVisitante: 1
  },

  "partido-004": {
    golesLocal: 4,
    golesVisitante: 1
  },

  "partido-005": {
    golesLocal: 0,
    golesVisitante: 1
  },

  "partido-006": {
    golesLocal: 2,
    golesVisitante: 0
  },

  "partido-007": {
    golesLocal: 1,
    golesVisitante: 1
  },

  "partido-008": {
    golesLocal: 1,
    golesVisitante: 1
  },

  "partido-009": {
    golesLocal: 1,
    golesVisitante: 0
  },

  "partido-010": {
    golesLocal: 7,
    golesVisitante: 1
  },

  "partido-011": {
    golesLocal: 2,
    golesVisitante: 2
  },

  "partido-012": {
    golesLocal: 5,
    golesVisitante: 1
  },

  "partido-013": {
    golesLocal: 1,
    golesVisitante: 1
  },

  "partido-014": {
    golesLocal: 0,
    golesVisitante: 0
  },

  "partido-015": {
    golesLocal: 2,
    golesVisitante: 2
  },

  "partido-016": {
    golesLocal: 1,
    golesVisitante: 1
  },

  "partido-017": {
    golesLocal: 3,
    golesVisitante: 1
  },

  "partido-018": {
    golesLocal: 1,
    golesVisitante: 4
  },

  "partido-019": {
    golesLocal: 3,
    golesVisitante: 0
  },

  "partido-020": {
    golesLocal: 3,
    golesVisitante: 1
  },

  "partido-021": {
    golesLocal: 1,
    golesVisitante: 0
  },

  "partido-022": {
    golesLocal: 4,
    golesVisitante: 2
  },

  "partido-023": {
    golesLocal: 1,
    golesVisitante: 1
  },

  "partido-024": {
    golesLocal: 1,
    golesVisitante: 3
  },

  "partido-025": {
    golesLocal: 1,
    golesVisitante: 1
  },

  "partido-026": {
    golesLocal: 4,
    golesVisitante: 1
  },

  "partido-027": {
    golesLocal: 6,
    golesVisitante: 0
  },

  "partido-028": {
    golesLocal: 1,
    golesVisitante: 0
  },

  "partido-029": {
    golesLocal: 3,
    golesVisitante: 0
  },

  "partido-030": {
    golesLocal: 0,
    golesVisitante: 1
  },

  "partido-031": {
    golesLocal: 0,
    golesVisitante: 1
  },

  "partido-032": {
    golesLocal: 2,
    golesVisitante: 0
  },

  "partido-033": {
    golesLocal: 2,
    golesVisitante: 1
  },

  "partido-034": {
    golesLocal: 0,
    golesVisitante: 0
  },

  "partido-035": {
    golesLocal: 5,
    golesVisitante: 1
  },

  "partido-036": {
    golesLocal: 0,
    golesVisitante: 4
  },

  "partido-037": {
    golesLocal: 2,
    golesVisitante: 2
  },

  "partido-038": {
    golesLocal: 4,
    golesVisitante: 0
  },

  "partido-039": {
    golesLocal: 0,
    golesVisitante: 0
  },

  "partido-040": {
    golesLocal: 1,
    golesVisitante: 3
  },

  "partido-041": {
    golesLocal: 3,
    golesVisitante: 2
  },

  "partido-042": {
    golesLocal: 3,
    golesVisitante: 0
  },

  "partido-043": {
    golesLocal: 2,
    golesVisitante: 0
  },

  "partido-044": {
    golesLocal: 1,
    golesVisitante: 2
  },

  "partido-045": {
    golesLocal: 0,
    golesVisitante: 0
  },

  "partido-046": {
    golesLocal: 0,
    golesVisitante: 1
  },

  "partido-047": {
    golesLocal: 5,
    golesVisitante: 0
  },

  "partido-048": {
    golesLocal: 1,
    golesVisitante: 0
  },

  "partido-049": {
    golesLocal: 0,
    golesVisitante: 3
  },

  "partido-050": {
    golesLocal: 4,
    golesVisitante: 2
  },

  "partido-051": {
    golesLocal: 2,
    golesVisitante: 1
  },

  "partido-052": {
    golesLocal: 3,
    golesVisitante: 1
  },

  "partido-053": {
    golesLocal: 0,
    golesVisitante: 3
  },

  "partido-054": {
    golesLocal: 1,
    golesVisitante: 0
  },

  "partido-055": {
    golesLocal: 0,
    golesVisitante: 2
  },

  "partido-056": {
    golesLocal: 2,
    golesVisitante: 1
  },

  "partido-057": {
    golesLocal: 1,
    golesVisitante: 1
  },

  "partido-058": {
    golesLocal: 1,
    golesVisitante: 3
  },

  "partido-059": {
    golesLocal: 3,
    golesVisitante: 2
  },

  "partido-060": {
    golesLocal: 0,
    golesVisitante: 0
  },

  "partido-061": {
    golesLocal: 1,
    golesVisitante: 4
  },

  "partido-062": {
    golesLocal: 5,
    golesVisitante: 0
  },

  "partido-063": {
    golesLocal: 1,
    golesVisitante: 1
  },

  "partido-064": {
    golesLocal: 1,
    golesVisitante: 5
  },

  "partido-065": {
    golesLocal: 0,
    golesVisitante: 0
  },

  "partido-066": {
    golesLocal: 0,
    golesVisitante: 1
  },

  "partido-067": {
    golesLocal: 0,
    golesVisitante: 2
  },

  "partido-068": {
    golesLocal: 2,
    golesVisitante: 1
  },

    "partido-069": {
    golesLocal: 3,
    golesVisitante: 3
  },

  "partido-070": {
    golesLocal: 1,
    golesVisitante: 3
  },

  "partido-071": {
    golesLocal: 0,
    golesVisitante: 0
  },

  "partido-072": {
    golesLocal: 3,
    golesVisitante: 1
  }

  
  // Agregar nuevos resultados reales aquí.
};

const RESULTADOS_OFICIALES_ULTIMA_ACTUALIZACION =
  "24 de junio de 2026, 11:04 (UTC-5)";

function formatearFechaHoraActualizacion(fecha = new Date()) {
  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Guayaquil"
  }).format(fecha);
}

function obtenerFechaRankingParticipante(data) {
  if (data.fechaRankingActualizacionTexto) {
    return data.fechaRankingActualizacionTexto;
  }

  const fecha =
    data.fechaRankingActualizacion ||
    data.fechaPuntuacion ||
    data.fechaActualizacion;

  if (fecha?.toDate) {
    return formatearFechaHoraActualizacion(fecha.toDate());
  }

  if (fecha instanceof Date) {
    return formatearFechaHoraActualizacion(fecha);
  }

  return "";
}

function obtenerMillisFechaRankingParticipante(data) {
  const fecha =
    data.fechaRankingActualizacion ||
    data.fechaPuntuacion ||
    data.fechaActualizacion;

  if (fecha?.toDate) {
    return fecha.toDate().getTime();
  }

  if (fecha instanceof Date) {
    return fecha.getTime();
  }

  return 0;
}
// =====================================================
// RESULTADOS OFICIALES Y PUNTUACIÓN
// =====================================================
// =====================================================
// RESULTADOS OFICIALES Y PUNTUACIÓN
// =====================================================
// =====================================================
// RESULTADOS OFICIALES Y PUNTUACIÓN
// =====================================================

async function cargarListaParticipantes() {
  if (!rankingContainer) {
    return;
  }

  rankingContainer.innerHTML = `
    <p class="ranking-cargando">Cargando participantes...</p>
  `;

  try {
    const usuariosRef = collection(db, COLECCION_PREDICCIONES_GRUPOS);
    const usuariosSnap = await getDocs(usuariosRef);

    if (usuariosSnap.empty) {
      rankingContainer.innerHTML = `
        <div class="ranking-vacio">
          <h3>No hay participantes todavía</h3>
          <p>Aún no existen registros de pronósticos guardados.</p>
        </div>
      `;
      return;
    }

    const participantes = [];

    /*
      Correos que no se mostrarán en la lista pública.
      Esto permite seguir usando tu cuenta para pruebas sin borrarla de Firebase.
    */
    const correosOcultos = [
      "acalleb@ups.edu.ec"
    ];

    usuariosSnap.forEach((docSnap) => {
      const data = docSnap.data();

      const email = (data.userEmail || "").toLowerCase();

      if (correosOcultos.includes(email)) {
        return;
      }

      participantes.push({
        nombre: data.userName || "Participante sin nombre",
        email: data.userEmail || ""
      });
    });

    participantes.sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );

    if (participantes.length === 0) {
      rankingContainer.innerHTML = `
        <div class="ranking-vacio">
          <h3>No hay participantes visibles todavía</h3>
          <p>
            Existen registros, pero por ahora solo corresponden a usuarios de prueba.
          </p>
        </div>
      `;
      return;
    }

    rankingContainer.innerHTML = `
      <div class="ranking-resumen">
        <h3>Total de participantes: ${participantes.length}</h3>
        <p>
          Esta lista muestra los usuarios que ya guardaron sus pronósticos.
        </p>
      </div>

      <div class="ranking-tabla-wrapper">
        <table class="ranking-tabla">
          <thead>
            <tr>
              <th>#</th>
              <th>Participante</th>
              <th>Correo</th>
            </tr>
          </thead>

          <tbody>
            ${participantes
              .map((participante, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td class="ranking-nombre">${participante.nombre}</td>
                  <td>${participante.email}</td>
                </tr>
              `)
              .join("")}
          </tbody>
        </table>
      </div>
    `;

  } catch (error) {
    console.error("Error cargando participantes:", error);

    rankingContainer.innerHTML = `
      <div class="ranking-vacio">
        <h3>No se pudo cargar la lista</h3>
        <p>Intenta nuevamente en unos minutos.</p>
      </div>
    `;
  }
}

function obtenerTipoResultado(golesLocal, golesVisitante) {
  if (golesLocal > golesVisitante) {
    return "local";
  }

  if (golesVisitante > golesLocal) {
    return "visitante";
  }

  return "empate";
}

function normalizarTextoPuntuacion(texto) {
  if (!texto) {
    return "";
  }

  return texto
    .toString()
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function obtenerPuntosPorFaseEliminacion(fase) {
  const faseTraducida = traducirFase(fase);

  if (faseTraducida === "Dieciseisavos de final") {
    return PUNTOS_DIECISEISAVOS;
  }

  if (faseTraducida === "Octavos de final") {
    return PUNTOS_OCTAVOS;
  }

  if (faseTraducida === "Cuartos de final") {
    return PUNTOS_CUARTOS;
  }

  if (faseTraducida === "Semifinales") {
    return PUNTOS_SEMIFINALES;
  }

  return 0;
}

function calcularPuntosFaseGrupos(prediccion, resultadoReal) {
  if (!prediccion || !resultadoReal) {
    return {
      puntos: 0,
      aciertoExacto: false,
      aciertoResultado: false,
      estadoPuntuacion: "pendiente"
    };
  }

  const predLocal = Number(prediccion.golesLocal);
  const predVisitante = Number(prediccion.golesVisitante);

  const realLocal = Number(resultadoReal.golesLocal);
  const realVisitante = Number(resultadoReal.golesVisitante);

  const marcadorExacto =
    predLocal === realLocal &&
    predVisitante === realVisitante;

  if (marcadorExacto) {
    return {
      puntos: PUNTOS_MARCADOR_EXACTO,
      aciertoExacto: true,
      aciertoResultado: true,
      estadoPuntuacion: "puntuado"
    };
  }

  const resultadoPronosticado = obtenerTipoResultado(
    predLocal,
    predVisitante
  );

  const resultadoOficial = obtenerTipoResultado(
    realLocal,
    realVisitante
  );

  if (resultadoPronosticado === resultadoOficial) {
    return {
      puntos: PUNTOS_RESULTADO_GRUPOS,
      aciertoExacto: false,
      aciertoResultado: true,
      estadoPuntuacion: "puntuado"
    };
  }

  return {
    puntos: 0,
    aciertoExacto: false,
    aciertoResultado: false,
    estadoPuntuacion: "puntuado"
  };
}

function construirPrediccionesDesdeResultadosOficiales() {
  const prediccionesOficiales = {};
  
    Object.entries(resultadosOficiales).forEach(
      ([partidoId, resultado]) => {
        prediccionesOficiales[partidoId] = {
          golesLocal: resultado.golesLocal,
          golesVisitante: resultado.golesVisitante,
          equipoAvanza: resultado.equipoAvanza || null
        };
      }
    );
  
  return prediccionesOficiales;
}

function obtenerPrediccionesParaLlavesReales() {
  return construirPrediccionesDesdeResultadosOficiales();
}

function calcularPuntosClasificacionGrupos(prediccionesUsuarioActual) {
  if (!estanTodosResultadosGruposCargados()) {
    return {
      puntosClasificacion: 0,
      aciertosClasificados: 0
    };
  }

  const prediccionesOficiales =
    construirPrediccionesDesdeResultadosOficiales();
  
  const posicionesUsuario = calcularTablasDeGrupos(
    partidosGlobales,
    prediccionesUsuarioActual
  );

  const posicionesOficiales = calcularTablasDeGrupos(
    partidosGlobales,
    prediccionesOficiales
  );

  let puntosClasificacion = 0;
  let aciertosClasificados = 0;

  Object.keys(posicionesOficiales).forEach((grupo) => {
    const tablaOficial = posicionesOficiales[grupo];
    const tablaUsuario = posicionesUsuario[grupo];

    if (!tablaOficial || !tablaUsuario) {
      return;
    }

    const clasificadosOficiales = tablaOficial.slice(0, 2);
    const clasificadosUsuario = tablaUsuario.slice(0, 2);

    clasificadosUsuario.forEach((equipoUsuario, indiceUsuario) => {
      const indiceOficial = clasificadosOficiales.findIndex(
        (equipoOficial) =>
          normalizarTextoPuntuacion(equipoOficial.nombre) ===
          normalizarTextoPuntuacion(equipoUsuario.nombre)
      );

      if (indiceOficial === -1) {
        return;
      }

      // 1 punto por clasificado correcto.
      puntosClasificacion += PUNTOS_CLASIFICADO;
      aciertosClasificados += 1;

      // +1 si además acertó si era primero o segundo.
      if (indiceOficial === indiceUsuario) {
        puntosClasificacion += PUNTOS_POSICION_CLASIFICADO;
      }
    });
  });

  return {
    puntosClasificacion,
    aciertosClasificados
  };
}

function estanTodosResultadosGruposCargados() {
  return partidosGlobales
    .filter(esFaseDeGrupos)
    .every((partido) => {
      const resultado = resultadosOficiales[partido.id];

      return (
        resultado &&
        resultado.golesLocal !== undefined &&
        resultado.golesVisitante !== undefined
      );
    });
}

function calcularPuntosEliminacion(prediccion, resultadoReal, partido) {
    if (!prediccion || !resultadoReal || !partido) {
      return {
        puntos: 0,
        estadoPuntuacion: "pendiente"
      };
    }
  
    const equipoAvanzaUsuario = normalizarTextoPuntuacion(
      prediccion.equipoAvanza
    );
  
    const equipoAvanzaOficial = normalizarTextoPuntuacion(
      resultadoReal.equipoAvanza
    );
  
    if (!equipoAvanzaUsuario || !equipoAvanzaOficial) {
      return {
        puntos: 0,
        estadoPuntuacion: "pendiente"
      };
    }
  
    if (equipoAvanzaUsuario === equipoAvanzaOficial) {
      return {
        puntos: obtenerPuntosPorFaseEliminacion(partido.fase),
        estadoPuntuacion: "puntuado"
      };
    }
  
    return {
      puntos: 0,
      estadoPuntuacion: "puntuado"
    };
  }

function calcularPuntosFinal(prediccionFinal, resultadoFinal) {
    let puntos = 0;
    let acertoCampeon = false;
    let acertoSubcampeon = false;
  
    if (!prediccionFinal || !resultadoFinal) {
      return {
        puntos,
        acertoCampeon,
        acertoSubcampeon
      };
    }
  
    const campeonUsuario = normalizarTextoPuntuacion(
      prediccionFinal.equipoAvanza
    );
  
    const campeonOficial = normalizarTextoPuntuacion(
      resultadoFinal.campeon
    );
  
    const subcampeonOficial = normalizarTextoPuntuacion(
      resultadoFinal.subcampeon
    );
  
    let subcampeonUsuario = "";
  
    if (
      prediccionFinal.equipoLocal &&
      prediccionFinal.equipoVisitante &&
      prediccionFinal.equipoAvanza
    ) {
      const local = normalizarTextoPuntuacion(
        prediccionFinal.equipoLocal
      );
  
      const visitante = normalizarTextoPuntuacion(
        prediccionFinal.equipoVisitante
      );
  
      if (campeonUsuario === local) {
        subcampeonUsuario = visitante;
      } else if (campeonUsuario === visitante) {
        subcampeonUsuario = local;
      }
    }
  
    if (campeonUsuario && campeonUsuario === campeonOficial) {
      puntos += PUNTOS_CAMPEON;
      acertoCampeon = true;
    }
  
    if (
      subcampeonUsuario &&
      subcampeonUsuario === subcampeonOficial
    ) {
      puntos += PUNTOS_SUBCAMPEON;
      acertoSubcampeon = true;
    }
  
    return {
      puntos,
      acertoCampeon,
      acertoSubcampeon
    };
  }

//___________________________________________________________
//___________________________________________________________
//___________________________________________________________
//___________________________________________________________
//_________________RESULTADOS ESPECIALES_____________________
//___________________________________________________________
//___________________________________________________________
//___________________________________________________________

const resultadosEspeciales = {
    goleador: "",
    mejorJugador: ""
};

  //___________________________________________________________
//___________________________________________________________
//___________________________________________________________
//___________________________________________________________
//_________________RESULTADOS ESPECIALES_____________________
//___________________________________________________________
//___________________________________________________________
//___________________________________________________________

function calcularPuntosEspeciales(especialesUsuarioActual) {
  let puntos = 0;
  let acertoGoleador = false;
  let acertoMejorJugador = false;

  if (
    resultadosEspeciales.goleador &&
    normalizarTextoPuntuacion(especialesUsuarioActual.goleador) ===
      normalizarTextoPuntuacion(resultadosEspeciales.goleador)
  ) {
    puntos += PUNTOS_GOLEADOR;
    acertoGoleador = true;
  }

  if (
    resultadosEspeciales.mejorJugador &&
    normalizarTextoPuntuacion(especialesUsuarioActual.mejorJugador) ===
      normalizarTextoPuntuacion(resultadosEspeciales.mejorJugador)
  ) {
    puntos += PUNTOS_MEJOR_JUGADOR;
    acertoMejorJugador = true;
  }

  return {
    puntos,
    acertoGoleador,
    acertoMejorJugador
  };
}

async function recalcularPuntajesUsuarios() {
  try {
    const usuariosRef = collection(db, COLECCION_PREDICCIONES_GRUPOS);
    const usuariosSnap = await getDocs(usuariosRef);

    if (usuariosSnap.empty) {
      alert("No hay predicciones de usuarios para puntuar.");
      return;
    }

    let usuariosProcesados = 0;
    const fechaRankingActualizacionTexto =
      formatearFechaHoraActualizacion(new Date());

    for (const usuarioDoc of usuariosSnap.docs) {
      const data = usuarioDoc.data();

      let datosBracket = {};

      try {
        const bracketSnap = await getDoc(
          doc(db, COLECCION_PREDICCIONES_BRACKETS, usuarioDoc.id)
        );

        if (bracketSnap.exists()) {
          datosBracket = bracketSnap.data();
        }
      } catch (error) {
        console.warn(
          "No se pudieron cargar brackets para recalcular puntajes:",
          usuarioDoc.id,
          error
        );
      }

      const partidosGruposUsuario = data.partidos || {};
      const partidosBracketUsuario = datosBracket.partidos || {};
      const partidosUsuario = {
        ...partidosGruposUsuario,
        ...partidosBracketUsuario
      };
      const especialesDelUsuario =
        datosBracket.especiales || data.especiales || {};

      let puntosTotales = 0;
      let aciertosExactos = 0;
      let aciertosResultado = 0;
      let aciertosClasificados = 0;

      let acertoCampeon = false;
      let acertoSubcampeon = false;
      let acertoGoleador = false;

      const partidosActualizados = {};

      Object.entries(partidosUsuario).forEach(
        ([partidoId, prediccion]) => {
          const partido = partidosGlobales.find(
            (p) => p.id === partidoId
          );

          const resultadoReal = resultadosOficiales[partidoId];

          if (!partido || !resultadoReal) {
            partidosActualizados[partidoId] = {
              ...prediccion,
              estadoPuntuacion:
                prediccion.estadoPuntuacion || "pendiente"
            };

            return;
          }

          if (esFaseDeGrupos(partido)) {
            const puntuacion = calcularPuntosFaseGrupos(
              prediccion,
              resultadoReal
            );

            puntosTotales += puntuacion.puntos;

            if (puntuacion.aciertoExacto) {
              aciertosExactos += 1;
            }

            if (
              puntuacion.aciertoResultado &&
              !puntuacion.aciertoExacto
            ) {
              aciertosResultado += 1;
            }

            partidosActualizados[partidoId] = {
              ...prediccion,
              resultadoRealLocal: resultadoReal.golesLocal,
              resultadoRealVisitante: resultadoReal.golesVisitante,
              puntos: puntuacion.puntos,
              estadoPuntuacion: puntuacion.estadoPuntuacion
            };

            return;
          }

          const faseTraducida = traducirFase(partido.fase);

          if (faseTraducida === "Final") {
            const puntuacionFinal = calcularPuntosFinal(
              prediccion,
              resultadoReal
            );

            puntosTotales += puntuacionFinal.puntos;

            if (puntuacionFinal.acertoCampeon) {
              acertoCampeon = true;
            }

            if (puntuacionFinal.acertoSubcampeon) {
              acertoSubcampeon = true;
            }

            partidosActualizados[partidoId] = {
              ...prediccion,
              puntos: puntuacionFinal.puntos,
              estadoPuntuacion: "puntuado"
            };

            return;
          }

          const puntuacionEliminacion = calcularPuntosEliminacion(
            prediccion,
            resultadoReal,
            partido
          );

          puntosTotales += puntuacionEliminacion.puntos;

          partidosActualizados[partidoId] = {
            ...prediccion,
            resultadoRealLocal: resultadoReal.golesLocal,
            resultadoRealVisitante: resultadoReal.golesVisitante,
            equipoAvanzaOficial: resultadoReal.equipoAvanza || null,
            puntos: puntuacionEliminacion.puntos,
            estadoPuntuacion:
              puntuacionEliminacion.estadoPuntuacion
          };
        }
      );

      /*
        Clasificación a dieciseisavos:
        Se recomienda ejecutar esta parte cuando termine
        toda la fase de grupos.
      */
      const clasificacion = calcularPuntosClasificacionGrupos(
        partidosUsuario
      );

      puntosTotales += clasificacion.puntosClasificacion;
      aciertosClasificados =
        clasificacion.aciertosClasificados;

      const puntosEspeciales = calcularPuntosEspeciales(
        especialesDelUsuario
      );

      puntosTotales += puntosEspeciales.puntos;

      if (puntosEspeciales.acertoGoleador) {
        acertoGoleador = true;
      }

      await setDoc(
        doc(db, COLECCION_PREDICCIONES_GRUPOS, usuarioDoc.id),
        {
          puntosTotales,
          aciertosExactos,
          aciertosResultado,
          aciertosClasificados,

          acertoCampeon,
          acertoSubcampeon,
          acertoGoleador,

          fechaPuntuacion: serverTimestamp(),
          fechaRankingActualizacion: serverTimestamp(),
          fechaRankingActualizacionTexto
        },
        {
          merge: true
        }
      );

      usuariosProcesados += 1;
    }

    alert(
      `Puntuación actualizada para ${usuariosProcesados} usuarios.`
    );
    await cargarRanking();

  } catch (error) {
    console.error("Error recalculando puntajes:", error);

    if (
      error?.code === "permission-denied" ||
      error?.message?.includes("permission") ||
      error?.message?.includes("PERMISSION_DENIED")
    ) {
      alert(
        "No se pudo recalcular la puntuación porque Firestore bloqueó la escritura. Publica las reglas actualizadas y vuelve a intentarlo."
      );
      return;
    }

    alert("No se pudo recalcular la puntuación.");
  }
}

botonesTabs.forEach((boton) => {
  boton.addEventListener("click", () => {
    const tabId = boton.dataset.tab;
    const tabDestino = document.getElementById(tabId);

    if (!tabDestino) {
      console.warn(`No existe la pestaña con id: ${tabId}`);
      return;
    }

    botonesTabs.forEach((btn) => btn.classList.remove("active"));
    contenidosTabs.forEach((contenido) => contenido.classList.remove("active"));

    boton.classList.add("active");
    tabDestino.classList.add("active");
    actualizarVisibilidadGuardadoEliminacion(tabId);
  });
});

actualizarVisibilidadGuardadoEliminacion(
  document.querySelector(".tab-btn.active")?.dataset.tab || ""
);


let usuarioActual = null;
let partidosGlobales = [];
let prediccionesUsuario = {};
let prediccionesGruposUsuario = {};
let prediccionesBracketUsuario = {};
let especialesUsuario = {};

const COLECCION_PREDICCIONES_GRUPOS = "prediccionesUsuarios";
const COLECCION_PREDICCIONES_BRACKETS = "usuariosPrediccionesBrackets";

function sincronizarPrediccionesUsuario() {
  prediccionesUsuario = {
    ...prediccionesGruposUsuario,
    ...prediccionesBracketUsuario
  };
}

function tieneMarcadorGuardado(prediccion) {
  return (
    prediccion &&
    prediccion.golesLocal !== null &&
    prediccion.golesVisitante !== null &&
    prediccion.golesLocal !== undefined &&
    prediccion.golesVisitante !== undefined
  );
}

// =====================================================
// ADMINISTRACIÓN
// =====================================================

const ADMIN_EMAILS = [
  "acalleb@ups.edu.ec",
  "dalvarezp@ups.edu.ec"
];

function esUsuarioAdministrador(user) {
  if (!user || !user.email) {
    return false;
  }

  return ADMIN_EMAILS.includes(user.email.toLowerCase());
}

// =====================================================
// BLOQUEO TEMPORAL DEL BOTÓN DE GUARDADO
// =====================================================
// =====================================================
// BLOQUEO TEMPORAL DEL BOTÓN DE GUARDADO
// =====================================================
// =====================================================
// BLOQUEO TEMPORAL DEL BOTÓN DE GUARDADO
// =====================================================
// =====================================================
// BLOQUEO TEMPORAL DEL BOTÓN DE GUARDADO
// =====================================================
// =====================================================
// BLOQUEO TEMPORAL DEL BOTÓN DE GUARDADO
// =====================================================

const GUARDADO_TEMPORALMENTE_CERRADO = false;

// =====================================================
// BLOQUEO TEMPORAL DEL BOTÓN DE GUARDADO
// =====================================================
// =====================================================
// BLOQUEO TEMPORAL DEL BOTÓN DE GUARDADO
// =====================================================
// =====================================================
// BLOQUEO TEMPORAL DEL BOTÓN DE GUARDADO
// =====================================================
// =====================================================
// BLOQUEO TEMPORAL DEL BOTÓN DE GUARDADO
// =====================================================
// =====================================================
// BLOQUEO TEMPORAL DEL BOTÓN DE GUARDADO
// =====================================================

function deshabilitarBotonGuardadoTemporalmente() {
  if (!btnGuardarTodo || !estadoGuardadoGlobal) {
    return;
  }

  if (GUARDADO_TEMPORALMENTE_CERRADO) {
    btnGuardarTodo.disabled = true;
    btnGuardarTodo.classList.add("btn-guardar-bloqueado");
    btnGuardarTodo.textContent = "🔒 Pronósticos cerrados temporalmente";

    estadoGuardadoGlobal.textContent =
      "Los pronósticos de fase de grupos se cerraron porque los partidos ya iniciaron. El botón se habilitará nuevamente cuando termine la fase de grupos para completar los pronósticos de eliminación directa.";
  }
}

function actualizarVisibilidadGuardadoEliminacion(tabActivaId = "") {
  const panelGuardado = btnGuardarTodo?.closest(".guardar-global-panel");

  if (!panelGuardado) {
    return;
  }

  panelGuardado.classList.toggle(
    "hidden",
    tabActivaId !== "tab-eliminacion"
  );
}


function mostrarPanelLogin() {
  tabLoginAuth.classList.add("active");
  tabRegistroAuth.classList.remove("active");

  panelLoginAuth.classList.add("active");
  panelRegistroAuth.classList.remove("active");

  panelLoginAuth.hidden = false;
  panelRegistroAuth.hidden = true;
}

function mostrarPanelRegistro() {
  tabRegistroAuth.classList.add("active");
  tabLoginAuth.classList.remove("active");

  panelRegistroAuth.classList.add("active");
  panelLoginAuth.classList.remove("active");

  panelRegistroAuth.hidden = false;
  panelLoginAuth.hidden = true;
}

tabLoginAuth.addEventListener("click", mostrarPanelLogin);
tabRegistroAuth.addEventListener("click", mostrarPanelRegistro);

irRegistroAuth.addEventListener("click", mostrarPanelRegistro);
irLoginAuth.addEventListener("click", mostrarPanelLogin);

btnRecuperarPassword.addEventListener("click", async () => {
  const email = emailLogin.value.trim().toLowerCase();

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

/*
btnRecalcularBracket.addEventListener("click", async () => {
  if (!usuarioActual) {
    alert("Primero debes iniciar sesión.");
    return;
  }

  await usuarioActual.reload();
  usuarioActual = auth.currentUser;

  if (!usuarioActual.emailVerified) {
    alert(
      "Debes verificar tu correo antes de guardar y recalcular tus pronósticos."
    );

    actualizarPanelUsuario(usuarioActual);
    return;
  }

  
    //Recolectamos todo lo que actualmente está escrito:

    //- fase de grupos;
    //- eliminación directa;
    //- equipo que avanza;
    //- marcadores actuales.
  
  const pronosticosActuales = recolectarPronosticosPartidos();

  if (!pronosticosActuales) {
    return;
  }

  
   // Verificamos que existan resultados de fase de grupos.
  
  const pronosticosGrupos = {};

  Object.entries(pronosticosActuales).forEach(
    ([partidoId, pronostico]) => {
      if (esFaseDeGrupos(pronostico)) {
        pronosticosGrupos[partidoId] = pronostico;
      }
    }
  );

  if (Object.keys(pronosticosGrupos).length === 0) {
    alert(
      "Primero debes completar los marcadores de la fase de grupos."
    );
    return;
  }

  const especialesActuales = recolectarPronosticosEspeciales();

  if (!validarPronosticosEspeciales(especialesActuales)) {
    return;
  }

  try {
    
      //Mezclamos lo que estaba previamente guardado con lo que
      //actualmente está escrito en pantalla.

      //Los datos actuales tienen prioridad.
    
    const partidosActualizados = {
      ...prediccionesUsuario,
      ...pronosticosActuales
    };

    
      //Actualizamos primero la variable local para que el cálculo
      //utilice los datos más recientes.
    
    prediccionesUsuario = partidosActualizados;
    especialesUsuario = especialesActuales;

    
      Recalculamos toda la estructura del Mundial.

      //La función calcularPartidosConPronosticos ya contiene
      //tercerosAsignados, por lo que un mejor tercero no puede
      //utilizarse en más de un partido.
    
    const partidosCalculados = calcularPartidosConPronosticos(
      partidosGlobales,
      prediccionesUsuario
    );

    const partidosEliminacion = partidosCalculados.filter(
      (partido) => !esFaseDeGrupos(partido)
    );

    
      //Guardamos en Firebase lo que el usuario tenía escrito
      //antes de volver a dibujar las llaves.
    
    const docRef = doc(
      db,
      "prediccionesUsuarios",
      usuarioActual.uid
    );

    await setDoc(
      docRef,
      {
        userId: usuarioActual.uid,
        userName:
          usuarioActual.displayName || usuarioActual.email,
        userEmail: usuarioActual.email,
        emailVerificado: usuarioActual.emailVerified,

        partidos: partidosActualizados,
        especiales: especialesActuales,

        puntosTotales: 0,
        aciertosExactos: 0,
        aciertosResultado: 0,
        aciertosClasificados: 0,
        acertoCampeon: false,
        acertoSubcampeon: false,
        acertoGoleador: false,

        fechaActualizacion: serverTimestamp()
      },
      {
        merge: true
      }
    );

    
     // Finalmente volvemos a mostrar las llaves actualizadas.
    
    renderizarBracketEliminacion(partidosEliminacion);
    renderizarPronosticosEspeciales();

    estadoGuardadoGlobal.textContent =
      "Tus pronósticos fueron guardados y las llaves se recalcularon correctamente.";

    alert(
      "Listo. Se guardaron tus marcadores actuales y se recalcularon las llaves."
    );

  } catch (error) {
    console.error(
      "Error guardando y recalculando las llaves:",
      error
    );

    alert(
      "No se pudieron guardar los pronósticos ni recalcular las llaves."
    );
  }
});

*/
if (false && btnRecalcularBracket) {
  btnRecalcularBracket.addEventListener("click", () => {
    const pronosticosGrupos = obtenerPronosticosGruposGuardados();

    if (Object.keys(pronosticosGrupos).length < 72) {
      alert(
        "Para recalcular las llaves necesitas tener guardados los 72 pronósticos de fase de grupos."
      );
      return;
    }

    const pronosticosEliminacion = recolectarPronosticosPartidos();

    if (!pronosticosEliminacion) {
      return;
    }

    const partidosActualizados = {
      ...prediccionesUsuario,
      ...pronosticosGrupos,
      ...pronosticosEliminacion
    };

    prediccionesUsuario = partidosActualizados;

    const partidosCalculados = calcularPartidosConPronosticos(
      partidosGlobales,
      prediccionesUsuario
    );

    const partidosEliminacion = partidosCalculados.filter(
      (partido) => !esFaseDeGrupos(partido)
    );

    renderizarBracketEliminacion(partidosEliminacion);
    renderizarPronosticosEspeciales();

    estadoGuardadoGlobal.textContent =
      "Llaves recalculadas con tus pronósticos actuales. Revisa las fases siguientes y guarda eliminación directa.";
  });
}

if (btnRecalcularBracket) {
  btnRecalcularBracket.addEventListener("click", () => {
    const pronosticosEliminacion = recolectarPronosticosPartidos();

    if (!pronosticosEliminacion) {
      return;
    }

    prediccionesBracketUsuario = {
      ...prediccionesBracketUsuario,
      ...pronosticosEliminacion
    };

    sincronizarPrediccionesUsuario();

    const partidosCalculados = calcularPartidosConPronosticos(
      partidosGlobales,
      {
        ...prediccionesBracketUsuario,
        ...obtenerPrediccionesParaLlavesReales()
      }
    );

    const partidosEliminacion = partidosCalculados.filter(
      (partido) => !esFaseDeGrupos(partido)
    );

    renderizarBracketEliminacion(partidosEliminacion);
    renderizarPronosticosEspeciales();

    estadoGuardadoGlobal.textContent =
      "Llaves recalculadas con resultados oficiales y tus pronosticos actuales de eliminacion. Revisa las fases siguientes y guarda eliminacion directa.";
  });
}

btnRegistroEmail.addEventListener("click", async () => {
  const nombre = nombreRegistro.value.trim();
  const email = emailRegistro.value.trim().toLowerCase();
  const password = passwordRegistro.value;
  const confirmarPassword = confirmarPasswordRegistro.value;

  if (!nombre || !email || !password || !confirmarPassword) {
    alert("Completa nombre, correo, contraseña y confirmación.");
    return;
  }

  if (!esCorreoInstitucional(email)) {
    alert("Debes registrarte con tu correo institucional UPS.");
    return;
  }

  if (password.length < 6) {
    alert("La contraseña debe tener al menos 6 caracteres.");
    return;
  }

  if (password !== confirmarPassword) {
    alert("Las contraseñas no coinciden.");
    return;
  }

  try {
    const credencial = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await updateProfile(credencial.user, {
      displayName: nombre
    });

    await sendEmailVerification(credencial.user);

    await registrarUsuario({
      ...credencial.user,
      displayName: nombre
    });

    alert(
      "Registro creado. Te enviamos un correo de verificación. Revisa tu bandeja de entrada o spam."
    );

    emailLogin.value = email;
    passwordLogin.value = "";

    nombreRegistro.value = "";
    emailRegistro.value = "";
    passwordRegistro.value = "";
    confirmarPasswordRegistro.value = "";

    mostrarPanelLogin();

  } catch (error) {
    console.error("Error registrando usuario:", error);

    if (error.code === "auth/email-already-in-use") {
      alert("Ese correo ya está registrado. Intenta iniciar sesión.");
      emailLogin.value = email;
      mostrarPanelLogin();

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
  const email = emailLogin.value.trim().toLowerCase();
  const password = passwordLogin.value;

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

    passwordLogin.value = "";

  } catch (error) {
    console.error("Error ingresando con correo:", error);

    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found"
    ) {
      alert("Correo o contraseña incorrectos.");

    } else if (error.code === "auth/invalid-email") {
      alert("El correo no es válido.");

    } else if (error.code === "auth/too-many-requests") {
      alert(
        "Se realizaron demasiados intentos. Espera unos minutos e inténtalo nuevamente."
      );

    } else {
      alert("No se pudo iniciar sesión.");
    }
  }
});

passwordLogin.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    btnLoginEmail.click();
  }
});

confirmarPasswordRegistro.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    btnRegistroEmail.click();
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
if (btnActualizarAdmin) {
  btnActualizarAdmin.addEventListener("click", cargarPanelAdministracion);
}
deshabilitarBotonGuardadoTemporalmente();

if (btnRecalcularPuntajes) {
  btnRecalcularPuntajes.addEventListener("click", recalcularPuntajesUsuarios);
}

onAuthStateChanged(auth, async (user) => {
  try {
    if (user) {
      await user.reload();

      usuarioActual = auth.currentUser;

      actualizarPanelUsuario(usuarioActual);

      if (usuarioActual.emailVerified) {
        try {
          await registrarUsuario(usuarioActual);
        } catch (error) {
          mostrarErrorFirebase(error, "No se pudo registrar el usuario en Firestore.");
        }
      }

      try {
        await cargarPartidos();
      } catch (error) {
        mostrarErrorFirebase(error, "No se pudo cargar la información de partidos.");
      }

    } else {
      usuarioActual = null;
      prediccionesUsuario = {};

      actualizarPanelUsuario(null);

      try {
        await cargarPartidos();
      } catch (error) {
        mostrarErrorFirebase(error, "No se pudo cargar la información de partidos.");
      }
    }
  } catch (error) {
    mostrarErrorFirebase(error, "Error al inicializar la sesión de Firebase.");
  }
});

async function cargarPanelAdministracion() {
  if (!adminContainer) {
    return;
  }

  if (!esUsuarioAdministrador(usuarioActual)) {
    adminContainer.innerHTML = `
      <div class="admin-alerta">
        <h3>Acceso restringido</h3>
        <p>Este panel solo está disponible para el usuario administrador.</p>
      </div>
    `;
    return;
  }

  adminContainer.innerHTML = `
    <p class="ranking-cargando">Cargando pronósticos de participantes...</p>
  `;

  try {
    const usuariosRef = collection(db, COLECCION_PREDICCIONES_GRUPOS);
    const usuariosSnap = await getDocs(usuariosRef);

    if (usuariosSnap.empty) {
      adminContainer.innerHTML = `
        <div class="ranking-vacio">
          <h3>No hay pronósticos guardados</h3>
          <p>Todavía ningún participante ha guardado sus datos.</p>
        </div>
      `;
      return;
    }

    const participantes = [];

    usuariosSnap.forEach((docSnap) => {
      const data = docSnap.data();

      const partidos = data.partidos || {};
      const especiales = data.especiales || {};

      participantes.push({
        id: docSnap.id,
        nombre: data.userName || "Participante sin nombre",
        email: data.userEmail || "",
        totalPartidos: Object.keys(partidos).length,
        totalResultadosOficiales:
          contarPartidosConResultadoOficial(partidos),
        puntosTotales: Number(data.puntosTotales) || 0,
        goleador: especiales.goleador || "",
        mejorJugador: especiales.mejorJugador || "",
        fechaActualizacion: data.fechaActualizacion || null,
        partidos,
        especiales
      });
    });

    participantes.sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );

    adminContainer.innerHTML = `
      <div class="admin-resumen">
        <h3>Pronósticos registrados: ${participantes.length}</h3>
        <p>
          Esta tabla muestra los datos guardados por cada participante en Firebase.
        </p>
        <p>
          <strong>Resultados oficiales actualizados:</strong>
          ${RESULTADOS_OFICIALES_ULTIMA_ACTUALIZACION}
        </p>
      </div>

      <div class="admin-tabla-wrapper">
        <table class="admin-tabla">
          <thead>
            <tr>
              <th>#</th>
              <th>Participante</th>
              <th>Correo</th>
              <th>Partidos llenados</th>
              <th>Resultados oficiales</th>
              <th>Goleador</th>
              <th>Mejor jugador</th>
              <th>Puntos actuales</th>
              <th>Detalle</th>
            </tr>
          </thead>

          <tbody>
            ${participantes
              .map((participante, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td class="admin-nombre">${participante.nombre}</td>
                  <td>${participante.email}</td>
                  <td>${participante.totalPartidos}</td>
                  <td>
                    ${participante.totalResultadosOficiales}
                    /
                    ${participante.totalPartidos}
                  </td>
                  <td>${participante.goleador || "—"}</td>
                  <td>${participante.mejorJugador || "—"}</td>
                  <td>${participante.puntosTotales}</td>
                  <td>
                    <button 
                      class="admin-btn-detalle" 
                      type="button"
                      data-admin-participante="${participante.id}"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              `)
              .join("")}
          </tbody>
        </table>
      </div>

      <div id="adminDetalleContainer" class="admin-detalle-container">
        <p>Selecciona un participante para ver sus pronósticos.</p>
      </div>
    `;

    document.querySelectorAll("[data-admin-participante]").forEach((boton) => {
      boton.addEventListener("click", () => {
        const participanteId = boton.dataset.adminParticipante;

        const participante = participantes.find(
          (item) => item.id === participanteId
        );

        mostrarDetalleParticipanteAdmin(participante);
      });
    });

  } catch (error) {
    console.error("Error cargando panel de administración:", error);

    adminContainer.innerHTML = `
      <div class="ranking-vacio">
        <h3>No se pudo cargar el panel</h3>
        <p>Revisa la conexión o los permisos de Firebase.</p>
      </div>
    `;
  }
}

function mostrarDetalleParticipanteAdmin(participante) {
  const detalleContainer = document.getElementById("adminDetalleContainer");

  if (!detalleContainer || !participante) {
    return;
  }

  const partidos = Object.values(participante.partidos || {})
    .sort((a, b) => Number(a.numero) - Number(b.numero));

  if (partidos.length === 0) {
    detalleContainer.innerHTML = `
      <div class="admin-detalle">
        <h3>${participante.nombre}</h3>
        <p>Este participante todavía no tiene partidos guardados.</p>
      </div>
    `;
    return;
  }

  detalleContainer.innerHTML = `
    <div class="admin-detalle">
      <h3>${participante.nombre}</h3>

      <p>
        <strong>Correo:</strong> ${participante.email}
      </p>

      <p>
        <strong>Goleador:</strong> ${participante.goleador || "—"} ·
        <strong>Mejor jugador:</strong> ${participante.mejorJugador || "—"}
      </p>

      <div class="admin-tabla-wrapper">
        <table class="admin-tabla admin-tabla-detalle">
          <thead>
            <tr>
              <th>Partido</th>
              <th>Fase</th>
              <th>Local</th>
              <th>Marcador</th>
              <th>Visitante</th>
              <th>Resultado oficial</th>
              <th>Avanza</th>
              <th>Puntos</th>
            </tr>
          </thead>

          <tbody>
            ${partidos
              .map((partido) => `
                <tr>
                  <td>${partido.numero || "—"}</td>
                  <td>${traducirFase(partido.fase || "")}</td>
                  <td>${partido.equipoLocalMostrado || partido.equipoLocal || "—"}</td>
                  <td>
                    ${partido.golesLocal ?? "—"}
                    -
                    ${partido.golesVisitante ?? "—"}
                  </td>
                  <td>${partido.equipoVisitanteMostrado || partido.equipoVisitante || "—"}</td>
                  <td>${formatearResultadoOficialAdmin(partido)}</td>
                  <td>${partido.equipoAvanza || "—"}</td>
                  <td>${partido.puntos ?? 0}</td>
                </tr>
              `)
              .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function contarPartidosConResultadoOficial(partidos) {
  return Object.entries(partidos || {}).filter(
    ([partidoId, partido]) => obtenerResultadoOficialAdmin(partidoId, partido)
  ).length;
}

function obtenerResultadoOficialAdmin(partidoId, partido) {
  const id = partido?.partidoId || partidoId;

  if (id && resultadosOficiales[id]) {
    return resultadosOficiales[id];
  }

  if (
    partido?.resultadoRealLocal !== undefined &&
    partido?.resultadoRealVisitante !== undefined
  ) {
    return {
      golesLocal: partido.resultadoRealLocal,
      golesVisitante: partido.resultadoRealVisitante,
      equipoAvanza: partido.equipoAvanzaOficial || null
    };
  }

  return null;
}

function formatearResultadoOficialAdmin(partido) {
  const resultado = obtenerResultadoOficialAdmin(
    partido?.partidoId,
    partido
  );

  if (!resultado) {
    return "Pendiente";
  }

  const marcador = `
    ${resultado.golesLocal ?? "—"}
    -
    ${resultado.golesVisitante ?? "—"}
  `;

  if (resultado.equipoAvanza) {
    return `${marcador}<br><small>Avanza: ${resultado.equipoAvanza}</small>`;
  }

  return marcador;
}

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

    const prediccionesParaLlaves = {
      ...prediccionesBracketUsuario,
      ...obtenerPrediccionesParaLlavesReales()
    };

    const partidosCalculados = calcularPartidosConPronosticos(
      partidos,
      prediccionesParaLlaves
    );

    const partidosGrupos = partidos.filter(esFaseDeGrupos);
    const partidosEliminacion = partidosCalculados.filter((partido) => !esFaseDeGrupos(partido));

    renderizarFaseGrupos(partidosGrupos);
    renderizarBracketEliminacion(partidosEliminacion);
    renderizarPronosticosEspeciales();
    await cargarRanking();
    if (esUsuarioAdministrador(usuarioActual)) {
      await cargarPanelAdministracion();
    }

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

    if (btnTabAdmin) {
      if (esUsuarioAdministrador(user)) {
        btnTabAdmin.classList.remove("hidden");
      } else {
        btnTabAdmin.classList.add("hidden");
      }
    }

  } else {
    authLoggedOut.classList.remove("hidden");
    authLoggedIn.classList.add("hidden");
    emailVerificationPanel.classList.add("hidden");
    userInfo.textContent = "No has iniciado sesión.";

    if (btnTabAdmin) {
      btnTabAdmin.classList.add("hidden");
    }
  }
}

function obtenerSeleccion(nombreOriginal) {
  const selecciones = {
    // América
    "Argentina": { nombre: "Argentina", codigo: "ar" },
    "Brazil": { nombre: "Brasil", codigo: "br" },
    "Brasil": { nombre: "Brasil", codigo: "br" },
    "Canada": { nombre: "Canadá", codigo: "ca" },
    "Canadá": { nombre: "Canadá", codigo: "ca" },
    "Chile": { nombre: "Chile", codigo: "cl" },
    "Colombia": { nombre: "Colombia", codigo: "co" },
    "Costa Rica": { nombre: "Costa Rica", codigo: "cr" },
    "Ecuador": { nombre: "Ecuador", codigo: "ec" },
    "Mexico": { nombre: "México", codigo: "mx" },
    "México": { nombre: "México", codigo: "mx" },
    "Panama": { nombre: "Panamá", codigo: "pa" },
    "Panamá": { nombre: "Panamá", codigo: "pa" },
    "Paraguay": { nombre: "Paraguay", codigo: "py" },
    "Peru": { nombre: "Perú", codigo: "pe" },
    "Perú": { nombre: "Perú", codigo: "pe" },
    "Uruguay": { nombre: "Uruguay", codigo: "uy" },
    "USA": { nombre: "Estados Unidos", codigo: "us" },
    "United States": { nombre: "Estados Unidos", codigo: "us" },
    "Estados Unidos": { nombre: "Estados Unidos", codigo: "us" },

    // Europa
    "Austria": { nombre: "Austria", codigo: "at" },
    "Belgium": { nombre: "Bélgica", codigo: "be" },
    "Bélgica": { nombre: "Bélgica", codigo: "be" },
    "Bosnia and Herzegovina": { nombre: "Bosnia y Herzegovina", codigo: "ba" },
    "Bosnia y Herzegovina": { nombre: "Bosnia y Herzegovina", codigo: "ba" },
    "Croatia": { nombre: "Croacia", codigo: "hr" },
    "Croacia": { nombre: "Croacia", codigo: "hr" },
    "Czechia": { nombre: "Chequia", codigo: "cz" },
    "Chequia": { nombre: "Chequia", codigo: "cz" },
    "Denmark": { nombre: "Dinamarca", codigo: "dk" },
    "Dinamarca": { nombre: "Dinamarca", codigo: "dk" },
    "England": { nombre: "Inglaterra", codigo: "gb-eng" },
    "Inglaterra": { nombre: "Inglaterra", codigo: "gb-eng" },
    "France": { nombre: "Francia", codigo: "fr" },
    "Francia": { nombre: "Francia", codigo: "fr" },
    "Germany": { nombre: "Alemania", codigo: "de" },
    "Alemania": { nombre: "Alemania", codigo: "de" },
    "Italy": { nombre: "Italia", codigo: "it" },
    "Italia": { nombre: "Italia", codigo: "it" },
    "Netherlands": { nombre: "Países Bajos", codigo: "nl" },
    "Países Bajos": { nombre: "Países Bajos", codigo: "nl" },
    "Norway": { nombre: "Noruega", codigo: "no" },
    "Noruega": { nombre: "Noruega", codigo: "no" },
    "Portugal": { nombre: "Portugal", codigo: "pt" },
    "Scotland": { nombre: "Escocia", codigo: "gb-sct" },
    "Escocia": { nombre: "Escocia", codigo: "gb-sct" },
    "Serbia": { nombre: "Serbia", codigo: "rs" },
    "Spain": { nombre: "España", codigo: "es" },
    "España": { nombre: "España", codigo: "es" },
    "Sweden": { nombre: "Suecia", codigo: "se" },
    "Suecia": { nombre: "Suecia", codigo: "se" },
    "Switzerland": { nombre: "Suiza", codigo: "ch" },
    "Suiza": { nombre: "Suiza", codigo: "ch" },
    "Türkiye": { nombre: "Turquía", codigo: "tr" },
    "Turkey": { nombre: "Turquía", codigo: "tr" },
    "Turquía": { nombre: "Turquía", codigo: "tr" },
    "Ukraine": { nombre: "Ucrania", codigo: "ua" },
    "Ucrania": { nombre: "Ucrania", codigo: "ua" },
    "Wales": { nombre: "Gales", codigo: "gb-wls" },
    "Gales": { nombre: "Gales", codigo: "gb-wls" },

    // África
    "Algeria": { nombre: "Argelia", codigo: "dz" },
    "Argelia": { nombre: "Argelia", codigo: "dz" },
    "Cameroon": { nombre: "Camerún", codigo: "cm" },
    "Camerún": { nombre: "Camerún", codigo: "cm" },
    "Cape Verde": { nombre: "Cabo Verde", codigo: "cv" },
    "Cabo Verde": { nombre: "Cabo Verde", codigo: "cv" },
    "Congo DR": { nombre: "República Democrática del Congo", codigo: "cd" },
    "República Democrática del Congo": { nombre: "República Democrática del Congo", codigo: "cd" },
    "Egypt": { nombre: "Egipto", codigo: "eg" },
    "Egipto": { nombre: "Egipto", codigo: "eg" },
    "Ghana": { nombre: "Ghana", codigo: "gh" },
    "Ivory Coast": { nombre: "Costa de Marfil", codigo: "ci" },
    "Costa de Marfil": { nombre: "Costa de Marfil", codigo: "ci" },
    "Morocco": { nombre: "Marruecos", codigo: "ma" },
    "Marruecos": { nombre: "Marruecos", codigo: "ma" },
    "Nigeria": { nombre: "Nigeria", codigo: "ng" },
    "Senegal": { nombre: "Senegal", codigo: "sn" },
    "South Africa": { nombre: "Sudáfrica", codigo: "za" },
    "Sudáfrica": { nombre: "Sudáfrica", codigo: "za" },
    "Tunisia": { nombre: "Túnez", codigo: "tn" },
    "Túnez": { nombre: "Túnez", codigo: "tn" },

    // Asia / Oceanía
    "Australia": { nombre: "Australia", codigo: "au" },
    "China": { nombre: "China", codigo: "cn" },
    "Iran": { nombre: "Irán", codigo: "ir" },
    "Irán": { nombre: "Irán", codigo: "ir" },
    "Iraq": { nombre: "Irak", codigo: "iq" },
    "Irak": { nombre: "Irak", codigo: "iq" },
    "Japan": { nombre: "Japón", codigo: "jp" },
    "Japón": { nombre: "Japón", codigo: "jp" },
    "Jordan": { nombre: "Jordania", codigo: "jo" },
    "Jordania": { nombre: "Jordania", codigo: "jo" },
    "New Zealand": { nombre: "Nueva Zelanda", codigo: "nz" },
    "Nueva Zelanda": { nombre: "Nueva Zelanda", codigo: "nz" },
    "Qatar": { nombre: "Catar", codigo: "qa" },
    "Catar": { nombre: "Catar", codigo: "qa" },
    "Saudi Arabia": { nombre: "Arabia Saudita", codigo: "sa" },
    "Arabia Saudita": { nombre: "Arabia Saudita", codigo: "sa" },
    "South Korea": { nombre: "Corea del Sur", codigo: "kr" },
    "Korea Republic": { nombre: "Corea del Sur", codigo: "kr" },
    "Corea del Sur": { nombre: "Corea del Sur", codigo: "kr" },
    "United Arab Emirates": { nombre: "Emiratos Árabes Unidos", codigo: "ae" },
    "Emiratos Árabes Unidos": { nombre: "Emiratos Árabes Unidos", codigo: "ae" },
    "Uzbekistan": { nombre: "Uzbekistán", codigo: "uz" },
    "Uzbekistán": { nombre: "Uzbekistán", codigo: "uz" },

    // Concacaf / Caribe
    "Curaçao": { nombre: "Curazao", codigo: "cw" },
    "Curazao": { nombre: "Curazao", codigo: "cw" },
    "Haiti": { nombre: "Haití", codigo: "ht" },
    "Haití": { nombre: "Haití", codigo: "ht" },
    "Honduras": { nombre: "Honduras", codigo: "hn" },
    "Jamaica": { nombre: "Jamaica", codigo: "jm" }
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
      onerror="this.outerHTML='<span class=&quot;bandera-placeholder&quot;>⚽</span>'"
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
    "Third Place": "Partido por el tercer lugar",
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

async function cargarPrediccionesUsuarioLegacy() {
  prediccionesUsuario = {};
  especialesUsuario = {};

  if (!usuarioActual) {
    return;
  }

  try {
    const docRef = doc(db, "prediccionesUsuarios", usuarioActual.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();

      prediccionesUsuario = data.partidos || {};
      especialesUsuario = data.especiales || {};

      estadoGuardadoGlobal.textContent = "Tus pronósticos guardados se cargaron correctamente.";
    } else {
      estadoGuardadoGlobal.textContent = "Todavía no has guardado tu polla.";
    }

  } catch (error) {
    console.error("Error cargando predicciones del usuario:", error);
    estadoGuardadoGlobal.textContent = "No se pudieron cargar tus pronósticos guardados.";
  }
}

async function cargarPrediccionesUsuario() {
  prediccionesUsuario = {};
  prediccionesGruposUsuario = {};
  prediccionesBracketUsuario = {};
  especialesUsuario = {};

  if (!usuarioActual) {
    return;
  }

  let cargoGrupos = false;
  let cargoBrackets = false;

  try {
    const gruposSnap = await getDoc(
      doc(db, COLECCION_PREDICCIONES_GRUPOS, usuarioActual.uid)
    );

    if (gruposSnap.exists()) {
      const data = gruposSnap.data();

      prediccionesGruposUsuario = data.partidos || {};
      especialesUsuario = data.especiales || {};
      cargoGrupos = true;
    }
  } catch (error) {
    console.error("Error cargando predicciones de fase de grupos:", error);
  }

  try {
    const prediccionesLegacySnap = await getDocs(
      query(
        collection(db, "predicciones"),
        where("userId", "==", usuarioActual.uid)
      )
    );

    prediccionesLegacySnap.forEach((docSnap) => {
      const prediccion = docSnap.data();
      const partidoId = prediccion.partidoId;
      const partido = partidosGlobales.find((p) => p.id === partidoId);

      if (
        partidoId &&
        partido &&
        esFaseDeGrupos(partido) &&
        !tieneMarcadorGuardado(prediccionesGruposUsuario[partidoId])
      ) {
        prediccionesGruposUsuario[partidoId] = prediccion;
        cargoGrupos = true;
      }
    });
  } catch (error) {
    console.warn(
      "No se pudieron cargar predicciones legacy por partido:",
      error
    );
  }

  try {
    const bracketsSnap = await getDoc(
      doc(db, COLECCION_PREDICCIONES_BRACKETS, usuarioActual.uid)
    );

    if (bracketsSnap.exists()) {
      const dataBracket = bracketsSnap.data();

      prediccionesBracketUsuario = dataBracket.partidos || {};
      especialesUsuario = dataBracket.especiales || especialesUsuario;
      cargoBrackets = true;
    }
  } catch (error) {
    console.warn(
      "No se pudieron cargar predicciones de eliminacion:",
      error
    );
  }

  sincronizarPrediccionesUsuario();

  if (cargoGrupos || cargoBrackets) {
    estadoGuardadoGlobal.textContent =
      "Tus pronosticos guardados se cargaron correctamente.";
  } else {
    estadoGuardadoGlobal.textContent = "Todavia no has guardado tu polla.";
  }
}

async function cargarRanking() {
  if (!rankingContainer) {
    return;
  }

  if (!usuarioActual) {
    rankingContainer.innerHTML = `
      <div class="ranking-vacio">
        <h3>Ranking disponible al iniciar sesión</h3>
        <p>
          Ingresa con tu correo institucional UPS para consultar la tabla de posiciones.
        </p>
      </div>
    `;
    return;
  }

  rankingContainer.innerHTML = `
    <p class="ranking-cargando">Cargando ranking...</p>
  `;

  try {
    const rankingRef = collection(db, COLECCION_PREDICCIONES_GRUPOS);
    const rankingSnap = await getDocs(rankingRef);

    if (rankingSnap.empty) {
      rankingContainer.innerHTML = `
        <div class="ranking-vacio">
          <h3>Ranking todavía no disponible</h3>
          <p>
            Aún no existen pronósticos puntuados.
          </p>
        </div>
      `;

      return;
    }

    const participantes = [];
    let fechaRankingActualizacion = "";
    let fechaRankingActualizacionMs = 0;

    rankingSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const fechaParticipante = obtenerFechaRankingParticipante(data);
      const fechaParticipanteMs = obtenerMillisFechaRankingParticipante(data);

      if (
        fechaParticipante &&
        fechaParticipanteMs >= fechaRankingActualizacionMs
      ) {
        fechaRankingActualizacion = fechaParticipante;
        fechaRankingActualizacionMs = fechaParticipanteMs;
      }

      participantes.push({
        id: docSnap.id,
        nombre: data.userName || data.userEmail || "Participante",
        email: data.userEmail || "",
        puntosTotales: Number(data.puntosTotales) || 0,
        aciertosExactos: data.aciertosExactos || 0,
        aciertosResultado: data.aciertosResultado || 0,
        aciertosClasificados: data.aciertosClasificados || 0,
        acertoCampeon: data.acertoCampeon || false,
        acertoSubcampeon: data.acertoSubcampeon || false,
        acertoGoleador: data.acertoGoleador || false,
        fechaRankingActualizacion: fechaParticipante
      });
    });

    participantes.sort((a, b) => {
      if (b.puntosTotales !== a.puntosTotales) {
        return b.puntosTotales - a.puntosTotales;
      }

      if (b.aciertosExactos !== a.aciertosExactos) {
        return b.aciertosExactos - a.aciertosExactos;
      }

      if (b.aciertosClasificados !== a.aciertosClasificados) {
        return b.aciertosClasificados - a.aciertosClasificados;
      }

      if (Number(b.acertoCampeon) !== Number(a.acertoCampeon)) {
        return Number(b.acertoCampeon) - Number(a.acertoCampeon);
      }

      if (Number(b.acertoSubcampeon) !== Number(a.acertoSubcampeon)) {
        return Number(b.acertoSubcampeon) - Number(a.acertoSubcampeon);
      }

      if (Number(b.acertoGoleador) !== Number(a.acertoGoleador)) {
        return Number(b.acertoGoleador) - Number(a.acertoGoleador);
      }

      return a.nombre.localeCompare(b.nombre);
    });

    rankingContainer.innerHTML = `
      <div class="ranking-resumen">
        <h3>Tabla de posiciones</h3>
        <p>
          El ranking se ordena por puntaje total y aplica los criterios de desempate del reglamento.
        </p>
        <p>
          <strong>Datos actualizados hasta:</strong>
          ${fechaRankingActualizacion || RESULTADOS_OFICIALES_ULTIMA_ACTUALIZACION}
        </p>
      </div>

      <div class="ranking-tabla-wrapper">
        <table class="ranking-tabla">
          <thead>
            <tr>
              <th>Pos.</th>
              <th>Participante</th>
              <th>Puntos</th>
              <th>Exactos</th>
              <th>Clasificados</th>
              <th>Campeón</th>
              <th>Subcampeón</th>
              <th>Goleador</th>
            </tr>
          </thead>

          <tbody>
            ${participantes
              .map((participante, index) => {
                const posicion = index + 1;

                return `
                  <tr class="${posicion <= 3 ? "ranking-top" : ""}">
                    <td class="ranking-posicion">
                      ${obtenerMedallaRanking(posicion)}
                    </td>

                    <td class="ranking-nombre">
                      ${participante.nombre}
                    </td>

                    <td class="ranking-puntos">
                      ${participante.puntosTotales}
                    </td>

                    <td>
                      ${participante.aciertosExactos}
                    </td>

                    <td>
                      ${participante.aciertosClasificados}
                    </td>

                    <td>
                      ${participante.acertoCampeon ? "✅" : "—"}
                    </td>

                    <td>
                      ${participante.acertoSubcampeon ? "✅" : "—"}
                    </td>

                    <td>
                      ${participante.acertoGoleador ? "✅" : "—"}
                    </td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `;

  } catch (error) {
    console.error("Error cargando ranking:", error);

    rankingContainer.innerHTML = `
      <div class="ranking-vacio">
        <h3>No se pudo cargar el ranking</h3>
        <p>
          Intenta nuevamente en unos minutos.
        </p>
      </div>
    `;
  }
}

function obtenerMedallaRanking(posicion) {
  if (posicion === 1) {
    return "🥇";
  }

  if (posicion === 2) {
    return "🥈";
  }

  if (posicion === 3) {
    return "🥉";
  }

  return posicion;
}

function obtenerNombreEquipoDesdeTarjeta(partidoId, tipo) {
  const elemento = document.querySelector(`[data-equipo-${tipo}="${partidoId}"]`);
  return elemento ? elemento.textContent.trim() : null;
}


function recolectarPronosticosPartidos() {
  const pronosticos = {};
  const errores = [];

  partidosGlobales.forEach((partido) => {
    if (esFaseDeGrupos(partido)) {
      return;
    }

    const inputLocal = document.getElementById(`local-${partido.id}`);
    const inputVisitante = document.getElementById(`visitante-${partido.id}`);
    const selectAvanza = document.getElementById(`avanza-${partido.id}`);

    if (!inputLocal || !inputVisitante) {
      return;
    }

    const golesLocalTexto = inputLocal.value.trim();
    const golesVisitanteTexto = inputVisitante.value.trim();

    // Si el partido está totalmente vacío, no se guarda.
    if (golesLocalTexto === "" && golesVisitanteTexto === "") {
      return;
    }

    // Si solo llenó un lado, marcamos error.
    if (golesLocalTexto === "" || golesVisitanteTexto === "") {
      errores.push(`Partido ${partido.numero}: completa ambos marcadores.`);
      return;
    }

    const golesLocal = Number(golesLocalTexto);
    const golesVisitante = Number(golesVisitanteTexto);

    if (
      Number.isNaN(golesLocal) ||
      Number.isNaN(golesVisitante) ||
      golesLocal < 0 ||
      golesVisitante < 0
    ) {
      errores.push(`Partido ${partido.numero}: el marcador debe ser un número válido.`);
      return;
    }

    const esEliminacion = !esFaseDeGrupos(partido);

    const equipoLocalMostrado =
      obtenerNombreEquipoDesdeInput(partido.id, "local") || partido.equipoLocal;

    const equipoVisitanteMostrado =
      obtenerNombreEquipoDesdeInput(partido.id, "visitante") || partido.equipoVisitante;

    const equipoAvanza = selectAvanza ? selectAvanza.value : "";

    // Si es eliminación directa y el marcador está empatado, debe elegir quién avanza.
    if (esEliminacion && golesLocal === golesVisitante && !equipoAvanza) {
      errores.push(
        `Partido ${partido.numero}: hay empate, selecciona el equipo que avanza.`
      );
      return;
    }

    // Si es eliminación directa y hay ganador por marcador, podemos inferir quién avanza.
    let equipoAvanzaFinal = null;

    if (esEliminacion) {
      if (equipoAvanza) {
        equipoAvanzaFinal = equipoAvanza;
      } else if (golesLocal > golesVisitante) {
        equipoAvanzaFinal = equipoLocalMostrado;
      } else if (golesVisitante > golesLocal) {
        equipoAvanzaFinal = equipoVisitanteMostrado;
      }
    }

    // No guardar partidos de eliminación si todavía tienen equipos genéricos.
    if (
      esEliminacion &&
      (
        equipoLocalMostrado.includes("Ganador") ||
        equipoVisitanteMostrado.includes("Ganador") ||
        equipoLocalMostrado.includes("Segundo") ||
        equipoVisitanteMostrado.includes("Segundo") ||
        equipoLocalMostrado.includes("Mejor tercero") ||
        equipoVisitanteMostrado.includes("Mejor tercero") ||
        equipoLocalMostrado.includes("Por definir") ||
        equipoVisitanteMostrado.includes("Por definir")
      )
    ) {
      errores.push(
        `Partido ${partido.numero}: primero recalcula las llaves para definir los equipos.`
      );
      return;
    }

    pronosticos[partido.id] = {
      partidoId: partido.id,
      numero: partido.numero,
      fase: partido.fase,
      grupo: partido.grupo || null,

      equipoLocal: equipoLocalMostrado,
      equipoVisitante: equipoVisitanteMostrado,
      equipoLocalMostrado: equipoLocalMostrado,
      equipoVisitanteMostrado: equipoVisitanteMostrado,

      golesLocal: golesLocal,
      golesVisitante: golesVisitante,

      equipoAvanza: equipoAvanzaFinal,

      puntos: 0,
      estadoPuntuacion: "pendiente"
    };
  });

  if (errores.length > 0) {
    alert("Revisa estos detalles:\n\n" + errores.join("\n"));
    return null;
  }

  return pronosticos;
}



async function guardarTodosLosPronosticosLegacy() {
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

  const pronosticosPantalla = recolectarPronosticosPartidos();
  if (!pronosticosPantalla) {
    return;
  }

  const pronosticosPartidos = {
    ...prediccionesUsuario,
    ...pronosticosPantalla
  };

  const especiales = recolectarPronosticosEspeciales();

  if (!validarPronosticosEspeciales(especiales)) {
    return;
  }

  if (Object.keys(pronosticosPantalla).length === 0) {
    alert("Todavía no has ingresado ningún pronóstico de eliminación directa.");
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
      especiales,
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
    especialesUsuario = especiales;
    

    estadoGuardadoGlobal.textContent = "Pronósticos guardados correctamente.";
    renderizarPronosticosEspeciales();

    alert("Todos tus pronósticos fueron guardados correctamente.");

    await cargarPartidos();

  } catch (error) {
    console.error("Error guardando todos los pronósticos:", error);
    alert("No se pudieron guardar tus pronósticos.");
  }
}

async function guardarTodosLosPronosticos() {
  if (!usuarioActual) {
    alert("Primero debes iniciar sesion.");
    return;
  }

  await usuarioActual.reload();
  usuarioActual = auth.currentUser;

  if (!usuarioActual.emailVerified) {
    alert("Debes verificar tu correo antes de guardar tus pronosticos.");
    actualizarPanelUsuario(usuarioActual);
    return;
  }

  const pronosticosPantalla = recolectarPronosticosPartidos();
  if (!pronosticosPantalla) {
    return;
  }

  if (Object.keys(pronosticosPantalla).length === 0) {
    alert("Todavia no has ingresado ningun pronostico de eliminacion directa.");
    return;
  }

  const pronosticosBracket = {
    ...prediccionesBracketUsuario,
    ...pronosticosPantalla
  };

  const especiales = recolectarPronosticosEspeciales();

  if (!validarPronosticosEspeciales(especiales)) {
    return;
  }

  try {
    const docRef = doc(
      db,
      COLECCION_PREDICCIONES_BRACKETS,
      usuarioActual.uid
    );

    await setDoc(
      docRef,
      {
        userId: usuarioActual.uid,
        userName: usuarioActual.displayName || usuarioActual.email,
        userEmail: usuarioActual.email,
        emailVerificado: usuarioActual.emailVerified,
        partidos: pronosticosBracket,
        especiales,
        fechaActualizacion: serverTimestamp()
      },
      { merge: true }
    );

    prediccionesBracketUsuario = pronosticosBracket;
    especialesUsuario = especiales;
    sincronizarPrediccionesUsuario();

    estadoGuardadoGlobal.textContent =
      "Pronosticos de eliminacion guardados correctamente.";
    renderizarPronosticosEspeciales();

    alert("Tus pronosticos de eliminacion fueron guardados correctamente.");

    await cargarPartidos();
  } catch (error) {
    console.error("Error guardando pronosticos de eliminacion:", error);
    alert("No se pudieron guardar tus pronosticos de eliminacion.");
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
  const esEliminacion = !esFaseDeGrupos(partido);
  const prediccionCoincideConEquipos =
    !prediccionGuardada ||
    !esEliminacion ||
    (
      prediccionGuardada.equipoLocal === partido.equipoLocal &&
      prediccionGuardada.equipoVisitante === partido.equipoVisitante
    );
  const mostrarPrediccionGuardada =
    tieneMarcadorGuardado(prediccionGuardada) &&
    prediccionCoincideConEquipos;

  const valorLocal =
    mostrarPrediccionGuardada
      ? prediccionGuardada.golesLocal
      : "";
  const valorVisitante =
    mostrarPrediccionGuardada
      ? prediccionGuardada.golesVisitante
      : "";

  const estadoGuardado = mostrarPrediccionGuardada
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
  const camposBloqueados = !esEliminacion;
  const atributoBloqueado = camposBloqueados ? "disabled" : "";
const equipoAvanzaGuardado =
  prediccionGuardada && prediccionCoincideConEquipos
    ? prediccionGuardada.equipoAvanza
    : "";
const faseTraducidaTarjeta = traducirFase(partido.fase);
const etiquetaSelectorGanador =
  faseTraducidaTarjeta === "Final" ||
  faseTraducidaTarjeta === "Partido por el tercer lugar"
    ? "Ganador del partido"
    : "Equipo que avanza";

const selectorAvanza = esEliminacion
  ? `
    <div class="selector-avanza">
      <label for="avanza-${partido.id}">${etiquetaSelectorGanador}</label>
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
          ${atributoBloqueado}
        >

        <span>-</span>

        <input 
          type="number" 
          min="0" 
          id="visitante-${partido.id}" 
          placeholder="0"
          value="${valorVisitante}"
          ${atributoBloqueado}
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
    posiciones[grupo] = ordenarTablaGrupo(
      Object.values(tablas[grupo]).map((equipo) => ({
        ...equipo,
        dg: equipo.gf - equipo.gc
      })),
      grupo,
      partidosGrupo,
      predicciones
    );
  });

  return posiciones;
}

function ordenarTablaGrupo(tablaGrupo, grupo, partidosGrupo, predicciones) {
  const ordenada = tablaGrupo
    .slice()
    .sort((a, b) => compararClasificacionGeneral(a, b));

  const resultado = [];
  let indice = 0;

  while (indice < ordenada.length) {
    const bloque = [ordenada[indice]];
    indice += 1;

    while (
      indice < ordenada.length &&
      tienenMismosCriteriosGenerales(bloque[0], ordenada[indice])
    ) {
      bloque.push(ordenada[indice]);
      indice += 1;
    }

    if (bloque.length === 1) {
      resultado.push(bloque[0]);
      continue;
    }

    resultado.push(
      ...ordenarEmpatePorEnfrentamientosDirectos(
        bloque,
        grupo,
        partidosGrupo,
        predicciones
      )
    );
  }

  return resultado;
}

function compararClasificacionGeneral(a, b) {
  if (b.pts !== a.pts) return b.pts - a.pts;
  if (b.dg !== a.dg) return b.dg - a.dg;
  if (b.gf !== a.gf) return b.gf - a.gf;

  return a.nombre.localeCompare(b.nombre);
}

function tienenMismosCriteriosGenerales(a, b) {
  return a.pts === b.pts && a.dg === b.dg && a.gf === b.gf;
}

function ordenarEmpatePorEnfrentamientosDirectos(
  equiposEmpatados,
  grupo,
  partidosGrupo,
  predicciones
) {
  const nombresEmpatados = new Set(
    equiposEmpatados.map((equipo) => equipo.nombre)
  );

  const metricas = {};

  equiposEmpatados.forEach((equipo) => {
    metricas[equipo.nombre] = {
      pts: 0,
      gf: 0,
      gc: 0,
      dg: 0
    };
  });

  partidosGrupo
    .filter((partido) => partido.grupo === grupo)
    .forEach((partido) => {
      if (
        !nombresEmpatados.has(partido.equipoLocal) ||
        !nombresEmpatados.has(partido.equipoVisitante)
      ) {
        return;
      }

      const prediccion = predicciones[partido.id];

      if (!prediccion) return;
      if (prediccion.golesLocal === null || prediccion.golesVisitante === null) return;
      if (prediccion.golesLocal === undefined || prediccion.golesVisitante === undefined) return;

      const golesLocal = Number(prediccion.golesLocal);
      const golesVisitante = Number(prediccion.golesVisitante);

      metricas[partido.equipoLocal].gf += golesLocal;
      metricas[partido.equipoLocal].gc += golesVisitante;
      metricas[partido.equipoVisitante].gf += golesVisitante;
      metricas[partido.equipoVisitante].gc += golesLocal;

      if (golesLocal > golesVisitante) {
        metricas[partido.equipoLocal].pts += 3;
      } else if (golesLocal < golesVisitante) {
        metricas[partido.equipoVisitante].pts += 3;
      } else {
        metricas[partido.equipoLocal].pts += 1;
        metricas[partido.equipoVisitante].pts += 1;
      }
    });

  Object.values(metricas).forEach((metrica) => {
    metrica.dg = metrica.gf - metrica.gc;
  });

  return equiposEmpatados
    .slice()
    .sort((a, b) => {
      const metricaA = metricas[a.nombre];
      const metricaB = metricas[b.nombre];

      if (metricaB.pts !== metricaA.pts) {
        return metricaB.pts - metricaA.pts;
      }

      if (metricaB.dg !== metricaA.dg) {
        return metricaB.dg - metricaA.dg;
      }

      if (metricaB.gf !== metricaA.gf) {
        return metricaB.gf - metricaA.gf;
      }

      return a.nombre.localeCompare(b.nombre);
    });
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

  return terceros
    .sort((a, b) => {
      if (b.pts !== a.pts) {
        return b.pts - a.pts;
      }

      if (b.dg !== a.dg) {
        return b.dg - a.dg;
      }

      if (b.gf !== a.gf) {
        return b.gf - a.gf;
      }

      return a.nombre.localeCompare(b.nombre);
    })
    .slice(0, 8);
}

function resolverEquipoDesdePronostico(
  textoOriginal,
  posiciones,
  ganadoresPartidos,
  asignacionTerceros,
  claveTercero
) {
  if (!textoOriginal) {
    return "Por definir";
  }

  // Ganador de grupo
  const ganadorGrupo = textoOriginal.match(
    /Group ([A-L]) Winners/
  );

  if (ganadorGrupo) {
    const grupo = ganadorGrupo[1];

    return (
      posiciones[grupo]?.[0]?.nombre ||
      traducirPlaceholder(textoOriginal)
    );
  }

  // Segundo de grupo
  const segundoGrupo = textoOriginal.match(
    /Group ([A-L]) Runners Up/
  );

  if (segundoGrupo) {
    const grupo = segundoGrupo[1];

    return (
      posiciones[grupo]?.[1]?.nombre ||
      traducirPlaceholder(textoOriginal)
    );
  }

  // Mejor tercero previamente distribuido
  const terceroGrupo = textoOriginal.match(
    /Group ([A-L](?:\/[A-L])+) 3rd Place/
  );

  if (terceroGrupo) {
    return (
      asignacionTerceros[claveTercero] ||
      traducirPlaceholder(textoOriginal)
    );
  }

  // Ganador de partido anterior
  const ganadorPartido = textoOriginal.match(
    /Match ([0-9]+) Winner/
  );

  if (ganadorPartido) {
    const numeroPartido = Number(ganadorPartido[1]);

    return (
      ganadoresPartidos[numeroPartido] ||
      traducirPlaceholder(textoOriginal)
    );
  }

  // Perdedor de partido anterior
  const perdedorPartido = textoOriginal.match(
    /Match ([0-9]+) Loser/
  );

  if (perdedorPartido) {
    const numeroPartido = Number(perdedorPartido[1]);

    return (
      ganadoresPartidos[`perdedor-${numeroPartido}`] ||
      traducirPlaceholder(textoOriginal)
    );
  }

  return textoOriginal;
}

function obtenerGanadorPronosticado(partido, prediccion) {
  if (!prediccion) return null;

  if (
    prediccion.equipoAvanza &&
    (
      prediccion.equipoAvanza === partido.equipoLocal ||
      prediccion.equipoAvanza === partido.equipoVisitante
    )
  ) {
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

const TERCEROS_FIFA_2026_POSIBLES = {
  BDEFIJKL: { "1A": "E", "1B": "J", "1D": "B", "1E": "D", "1G": "I", "1I": "F", "1K": "L", "1L": "K" },
  BDEFGIKL: { "1A": "E", "1B": "G", "1D": "B", "1E": "D", "1G": "I", "1I": "F", "1K": "L", "1L": "K" },
  BDEFGIJL: { "1A": "E", "1B": "G", "1D": "B", "1E": "D", "1G": "J", "1I": "F", "1K": "L", "1L": "I" },
  BDEFGIJK: { "1A": "E", "1B": "G", "1D": "B", "1E": "D", "1G": "J", "1I": "F", "1K": "I", "1L": "K" },
  ABDEFGIL: { "1A": "E", "1B": "G", "1D": "B", "1E": "D", "1G": "A", "1I": "F", "1K": "L", "1L": "I" },
  ABDEFGIK: { "1A": "E", "1B": "G", "1D": "B", "1E": "D", "1G": "A", "1I": "F", "1K": "I", "1L": "K" },
  ABDEFGIJ: { "1A": "E", "1B": "G", "1D": "B", "1E": "D", "1G": "A", "1I": "F", "1K": "I", "1L": "J" },
  ABCDEFGI: { "1A": "C", "1B": "G", "1D": "B", "1E": "D", "1G": "A", "1I": "F", "1K": "E", "1L": "I" }
};

const ANCLAS_TERCEROS_DIECISISEISAVOS = {
  "partido-074": "1E",
  "partido-077": "1I",
  "partido-079": "1A",
  "partido-080": "1L",
  "partido-081": "1D",
  "partido-082": "1G",
  "partido-085": "1B",
  "partido-087": "1K"
};

function calcularAsignacionTercerosFifa2026(espaciosTerceros, mejoresTerceros) {
  const equiposPorGrupo = {};
  const combinacion = mejoresTerceros
    .map((equipo) => equipo.grupo)
    .filter(Boolean)
    .sort()
    .join("");
  const matriz = TERCEROS_FIFA_2026_POSIBLES[combinacion];

  if (!matriz) {
    return null;
  }

  mejoresTerceros.forEach((equipo) => {
    equiposPorGrupo[equipo.grupo] = equipo.nombre;
  });

  const asignaciones = {};

  espaciosTerceros.forEach((espacio) => {
    const ancla = ANCLAS_TERCEROS_DIECISISEISAVOS[espacio.partidoId];
    const grupoAsignado = matriz[ancla];
    const equipoAsignado = equiposPorGrupo[grupoAsignado];

    if (
      grupoAsignado &&
      equipoAsignado &&
      espacio.gruposPermitidos.includes(grupoAsignado)
    ) {
      asignaciones[espacio.clave] = equipoAsignado;
    }
  });

  if (Object.keys(asignaciones).length !== espaciosTerceros.length) {
    return null;
  }

  return asignaciones;
}

function calcularAsignacionTerceros(partidos, mejoresTerceros) {
  const espaciosTerceros = [];

  /*
    Reunimos todos los lugares de dieciseisavos que necesitan
    un mejor tercero.
  */
  partidos
    .filter((partido) => traducirFase(partido.fase) === "Dieciseisavos de final")
    .forEach((partido) => {
      const lados = [
        {
          lado: "local",
          texto: partido.equipoLocal
        },
        {
          lado: "visitante",
          texto: partido.equipoVisitante
        }
      ];

      lados.forEach(({ lado, texto }) => {
        const coincidencia = texto?.match(
          /Group ([A-L](?:\/[A-L])+) 3rd Place/
        );

        if (!coincidencia) {
          return;
        }

        espaciosTerceros.push({
          clave: `${partido.id}-${lado}`,
          partidoId: partido.id,
          lado,
          gruposPermitidos: coincidencia[1].split("/")
        });
      });
    });

  if (
    !Array.isArray(mejoresTerceros) ||
    mejoresTerceros.length !== 8 ||
    espaciosTerceros.length === 0
  ) {
    return {};
  }

  const asignacionFifa = calcularAsignacionTercerosFifa2026(
    espaciosTerceros,
    mejoresTerceros
  );

  if (asignacionFifa) {
    return asignacionFifa;
  }

  console.warn(
    "La combinacion de mejores terceros no esta en la matriz FIFA 2026 cargada; se usara una asignacion compatible como respaldo."
  );

  /*
    Primero resolvemos los espacios más restrictivos:
    aquellos que admiten menos grupos.
  */
  espaciosTerceros.sort(
    (a, b) =>
      a.gruposPermitidos.length -
      b.gruposPermitidos.length
  );

  const asignaciones = {};
  const equiposUtilizados = new Set();
  const gruposUtilizados = new Set();

  function intentarAsignar(indice) {
    if (indice >= espaciosTerceros.length) {
      return true;
    }

    const espacio = espaciosTerceros[indice];

    const candidatos = mejoresTerceros.filter((equipo) => {
      return (
        espacio.gruposPermitidos.includes(equipo.grupo) &&
        !equiposUtilizados.has(equipo.nombre) &&
        !gruposUtilizados.has(equipo.grupo)
      );
    });

    for (const candidato of candidatos) {
      asignaciones[espacio.clave] = candidato.nombre;
      equiposUtilizados.add(candidato.nombre);
      gruposUtilizados.add(candidato.grupo);

      if (intentarAsignar(indice + 1)) {
        return true;
      }

      delete asignaciones[espacio.clave];
      equiposUtilizados.delete(candidato.nombre);
      gruposUtilizados.delete(candidato.grupo);
    }

    return false;
  }

  const asignacionCompleta = intentarAsignar(0);

  if (!asignacionCompleta) {
    const disponibles = mejoresTerceros.filter((equipo) => {
      return (
        !equiposUtilizados.has(equipo.nombre) &&
        !gruposUtilizados.has(equipo.grupo)
      );
    });

    espaciosTerceros.forEach((espacio) => {
      if (asignaciones[espacio.clave]) {
        return;
      }

      const candidato = disponibles.find((equipo) => {
        return espacio.gruposPermitidos.includes(equipo.grupo);
      });

      if (candidato) {
        asignaciones[espacio.clave] = candidato.nombre;
        equiposUtilizados.add(candidato.nombre);
        gruposUtilizados.add(candidato.grupo);
        disponibles.splice(disponibles.indexOf(candidato), 1);
      }
    });

    if (Object.keys(asignaciones).length < espaciosTerceros.length) {
      console.warn("No fue posible asignar todos los mejores terceros automáticamente; se dejarán los cruces sin resolver hasta completar los datos.");
    }
  }

  return asignaciones;
}

function calcularPartidosConPronosticos(partidos, predicciones) {
  const posiciones = calcularTablasDeGrupos(
    partidos,
    predicciones
  );

  const mejoresTerceros = obtenerMejoresTerceros(posiciones);

  /*
    Distribuimos los ocho terceros antes de comenzar
    a resolver los partidos.
  */
  const asignacionTerceros = calcularAsignacionTerceros(
    partidos,
    mejoresTerceros
  );

  const partidosCalculados = partidos
    .slice()
    .sort((a, b) => a.numero - b.numero)
    .map((partido) => ({ ...partido }));

  const ganadoresPartidos = {};

  partidosCalculados.forEach((partido) => {
    if (!esFaseDeGrupos(partido) && partido.estado !== "por confirmar") {
      partido.equipoLocal = resolverEquipoDesdePronostico(
        partido.equipoLocal,
        posiciones,
        ganadoresPartidos,
        asignacionTerceros,
        `${partido.id}-local`
      );

      partido.equipoVisitante = resolverEquipoDesdePronostico(
        partido.equipoVisitante,
        posiciones,
        ganadoresPartidos,
        asignacionTerceros,
        `${partido.id}-visitante`
      );
    }

    const prediccion = predicciones[partido.id];

    if (!esFaseDeGrupos(partido)) {
      const ganador = obtenerGanadorPronosticado(
        partido,
        prediccion
      );

      const perdedor = obtenerPerdedorPronosticado(
        partido,
        ganador
      );

      if (ganador) {
        ganadoresPartidos[partido.numero] = ganador;
      }

      if (perdedor) {
        ganadoresPartidos[`perdedor-${partido.numero}`] =
          perdedor;
      }
    }
  });

  return partidosCalculados;
}

function obtenerTodosLosEquipos(partidos) {
  const equipos = new Set();

  partidos
    .filter(esFaseDeGrupos)
    .forEach((partido) => {
      equipos.add(partido.equipoLocal);
      equipos.add(partido.equipoVisitante);
    });

  return Array.from(equipos).sort();
}

function crearOptionEquipo(equipo, seleccionado = "") {
  const seleccion = obtenerSeleccion(equipo);
  const selected = equipo === seleccionado ? "selected" : "";

  return `
    <option value="${equipo}" ${selected}>
      ${seleccion.nombre}
    </option>
  `;
}

function renderizarPronosticosEspeciales() {
  if (!especialGoleador || !especialMejorJugador) {
    return;
  }

  const goleadorGuardado = especialesUsuario.goleador || "";
  const mejorJugadorGuardado = especialesUsuario.mejorJugador || "";

  especialGoleador.value = goleadorGuardado;
  especialMejorJugador.value = mejorJugadorGuardado;

  if (estadoEspeciales) {
    if (goleadorGuardado || mejorJugadorGuardado) {
      estadoEspeciales.textContent = "Guardado";
      estadoEspeciales.classList.remove("estado-pendiente");
      estadoEspeciales.classList.add("estado-guardado");
    } else {
      estadoEspeciales.textContent = "Sin guardar";
      estadoEspeciales.classList.remove("estado-guardado");
      estadoEspeciales.classList.add("estado-pendiente");
    }
  }
}

function recolectarPronosticosEspeciales() {
  return {

    goleador: especialGoleador ? especialGoleador.value.trim() : "",
    mejorJugador: especialMejorJugador ? especialMejorJugador.value.trim() : ""
  };
}

function obtenerNombreEquipoDesdeInput(partidoId, tipo) {
  const selector = `[data-equipo-${tipo}="${partidoId}"]`;
  const elemento = document.querySelector(selector);

  return elemento ? elemento.textContent.trim() : null;
}

function obtenerPronosticosGruposGuardados() {
  const pronosticosGrupos = {};

  partidosGlobales
    .filter(esFaseDeGrupos)
    .forEach((partido) => {
      const prediccion = prediccionesUsuario[partido.id];

      if (!prediccion) {
        return;
      }

      if (prediccion.golesLocal === null || prediccion.golesVisitante === null) {
        return;
      }

      if (
        prediccion.golesLocal === undefined ||
        prediccion.golesVisitante === undefined
      ) {
        return;
      }

      pronosticosGrupos[partido.id] = prediccion;
    });

  return pronosticosGrupos;
}


function recolectarPronosticosFaseGrupos() {
  const pronosticos = {};
  const errores = [];

  partidosGlobales
    .filter(esFaseDeGrupos)
    .forEach((partido) => {
      const inputLocal = document.getElementById(`local-${partido.id}`);
      const inputVisitante = document.getElementById(`visitante-${partido.id}`);

      if (!inputLocal || !inputVisitante) {
        return;
      }

      const golesLocalTexto = inputLocal.value.trim();
      const golesVisitanteTexto = inputVisitante.value.trim();

      if (golesLocalTexto === "" && golesVisitanteTexto === "") {
        return;
      }

      if (golesLocalTexto === "" || golesVisitanteTexto === "") {
        errores.push(`Partido ${partido.numero}: completa ambos marcadores.`);
        return;
      }

      const golesLocal = Number(golesLocalTexto);
      const golesVisitante = Number(golesVisitanteTexto);

      if (
        Number.isNaN(golesLocal) ||
        Number.isNaN(golesVisitante) ||
        golesLocal < 0 ||
        golesVisitante < 0
      ) {
        errores.push(`Partido ${partido.numero}: marcador inválido.`);
        return;
      }

      pronosticos[partido.id] = {
        partidoId: partido.id,
        numero: partido.numero,
        fase: partido.fase,
        grupo: partido.grupo || null,
        equipoLocal: partido.equipoLocal,
        equipoVisitante: partido.equipoVisitante,
        golesLocal,
        golesVisitante,
        equipoAvanza: null,
        puntos: 0,
        estadoPuntuacion: "pendiente"
      };
    });

  if (errores.length > 0) {
    alert("Revisa estos detalles:\n\n" + errores.join("\n"));
    return null;
  }

  return pronosticos;
}

function validarPronosticosEspeciales(especiales) {
  if (!especiales) {
    return true;
  }

  if (especiales.goleador && especiales.goleador.length < 2) {
    alert("El nombre del goleador debe tener al menos 2 caracteres.");
    return false;
  }

  if (especiales.mejorJugador && especiales.mejorJugador.length < 2) {
    alert("El nombre del mejor jugador debe tener al menos 2 caracteres.");
    return false;
  }

  return true;
}
//cargarPartidos();
