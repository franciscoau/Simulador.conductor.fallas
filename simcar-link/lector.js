"use strict";

const http = require("http");
const dgram = require("dgram");

// ======================================================
// CONFIGURACIÓN SIMCAR
// ======================================================

const PROTOCOL_NAME = "MOCK_UP_VIRTUAL_SIMCAR";
const PROTOCOL_VERSION = 1;

const DISCOVERY_PORT = 41235;
const DEFAULT_TELEMETRY_PORT = 41234;

const WAR_THUNDER_URL =
  "http://127.0.0.1:8111/indicators";

const INTERVALO_LECTURA_MS = 200;
const TIEMPO_SIN_INSTRUCTOR_MS = 3500;

// ======================================================
// ESTADO
// ======================================================

const discoverySocket = dgram.createSocket({
  type: "udp4",
  reuseAddr: true
});

const telemetrySocket = dgram.createSocket("udp4");

let instructorIp = "";
let telemetryPort = DEFAULT_TELEMETRY_PORT;
let ultimoAnuncioInstructor = 0;

let consultaEnCurso = false;
let paquetesEnviados = 0;
let cerrando = false;

// ======================================================
// DESCUBRIMIENTO AUTOMÁTICO
// ======================================================

function iniciarDescubrimiento() {
  discoverySocket.on(
    "message",
    (mensaje, informacionRemota) => {
      try {
        const anuncio = JSON.parse(
          mensaje.toString("utf8")
        );

        const anuncioValido =
          anuncio.protocol === PROTOCOL_NAME &&
          anuncio.version === PROTOCOL_VERSION &&
          anuncio.role === "instructor";

        if (!anuncioValido) {
          return;
        }

        instructorIp = informacionRemota.address;

        telemetryPort = Number(
          anuncio.telemetryPort ??
          DEFAULT_TELEMETRY_PORT
        );

        ultimoAnuncioInstructor = Date.now();
      } catch {
        // Ignora mensajes ajenos a SIMCAR.
      }
    }
  );

  discoverySocket.on("error", (error) => {
    console.error(
      "[SIMCAR] Error de descubrimiento:",
      error.message
    );
  });

  discoverySocket.bind(
    DISCOVERY_PORT,
    "0.0.0.0",
    () => {
      console.log(
        `[SIMCAR] Buscando instructor en UDP ${DISCOVERY_PORT}...`
      );
    }
  );
}

function instructorDisponible() {
  if (!instructorIp || !ultimoAnuncioInstructor) {
    return false;
  }

  return (
    Date.now() - ultimoAnuncioInstructor <
    TIEMPO_SIN_INSTRUCTOR_MS
  );
}

// ======================================================
// ENVÍO DE VELOCIDAD Y RPM
// ======================================================

function enviarTelemetria(velocidad, rpm) {
  if (!instructorDisponible()) {
    return;
  }

  const paquete = {
    protocol: PROTOCOL_NAME,
    version: PROTOCOL_VERSION,
    role: "student",

    speed: Number(velocidad) || 0,
    rpm: Number(rpm) || 0,

    timestamp: Date.now()
  };

  const mensaje = Buffer.from(
    JSON.stringify(paquete),
    "utf8"
  );

  telemetrySocket.send(
    mensaje,
    telemetryPort,
    instructorIp,
    (error) => {
      if (error) {
        return;
      }

      paquetesEnviados += 1;
    }
  );
}

// ======================================================
// INTERFAZ DE CONSOLA
// ======================================================

function mostrarEncabezado() {
  console.clear();
  console.log("========================================");
  console.log("              SIMCAR LINK");
  console.log("========================================");
  console.log("");
}

function mostrarBuscandoInstructor() {
  mostrarEncabezado();

  console.log("War Thunder        : EN ESPERA");
  console.log("Instructor         : BUSCANDO");
  console.log("");
  console.log(
    "Ambos computadores deben estar"
  );
  console.log(
    "conectados a la misma red Wi-Fi."
  );
  console.log("");
  console.log(
    `Escuchando anuncios en UDP ${DISCOVERY_PORT}`
  );
}

function mostrarWarThunderNoDetectado() {
  mostrarEncabezado();

  console.log("Instructor         : CONECTADO");
  console.log(`IP instructor      : ${instructorIp}`);
  console.log("War Thunder        : NO DETECTADO");
  console.log("");
  console.log(
    "Abra War Thunder e ingrese a una"
  );
  console.log(
    "prueba de conducción o partida."
  );
}

function mostrarSinTelemetria() {
  mostrarEncabezado();

  console.log("Instructor         : CONECTADO");
  console.log(`IP instructor      : ${instructorIp}`);
  console.log("War Thunder        : CONECTADO");
  console.log("Telemetría         : SIN DATOS VÁLIDOS");
  console.log("");
  console.log(
    "Ingrese a una prueba de conducción"
  );
  console.log(
    "y controle un vehículo."
  );
}

function mostrarTelemetria({
  vehiculo,
  velocidad,
  rpm
}) {
  mostrarEncabezado();

  console.log("Instructor         : CONECTADO");
  console.log(`IP instructor      : ${instructorIp}`);
  console.log(`Puerto             : ${telemetryPort}`);
  console.log("");
  console.log("War Thunder        : CONECTADO");
  console.log(`Vehículo           : ${vehiculo}`);
  console.log("");
  console.log(
    `Velocidad          : ${velocidad.toFixed(1)} km/h`
  );
  console.log(
    `RPM                : ${rpm.toFixed(0)}`
  );
  console.log("");
  console.log(
    `Paquetes enviados  : ${paquetesEnviados}`
  );
  console.log("");
  console.log("Actualizando automáticamente...");
  console.log("Ctrl + C para cerrar SIMCAR LINK.");
}

// ======================================================
// LECTURA DE WAR THUNDER
// ======================================================

function leerTelemetria() {
  if (cerrando) {
    return;
  }

  if (!instructorDisponible()) {
    instructorIp = "";
    mostrarBuscandoInstructor();
    return;
  }

  if (consultaEnCurso) {
    return;
  }

  consultaEnCurso = true;

  const solicitud = http.get(
    WAR_THUNDER_URL,
    (respuesta) => {
      let contenido = "";

      respuesta.setEncoding("utf8");

      respuesta.on("data", (fragmento) => {
        contenido += fragmento;
      });

      respuesta.on("end", () => {
        consultaEnCurso = false;

        try {
          const telemetria = JSON.parse(contenido);

          if (!telemetria.valid) {
            enviarTelemetria(0, 0);
            mostrarSinTelemetria();
            return;
          }

          const velocidad = Number(
            telemetria.speed ?? 0
          );

          const rpm = Number(
            telemetria.rpm ?? 0
          );

          const vehiculo =
            telemetria.type ??
            "No identificado";

          enviarTelemetria(
            velocidad,
            rpm
          );

          mostrarTelemetria({
            vehiculo,
            velocidad,
            rpm
          });
        } catch (error) {
          mostrarEncabezado();

          console.log(
            "War Thunder respondió, pero sus"
          );
          console.log(
            "datos no pudieron interpretarse."
          );
          console.log("");
          console.log(error.message);
        }
      });
    }
  );

  solicitud.setTimeout(1500, () => {
    solicitud.destroy(
      new Error("Tiempo de espera agotado")
    );
  });

  solicitud.on("error", () => {
    consultaEnCurso = false;

    enviarTelemetria(0, 0);
    mostrarWarThunderNoDetectado();
  });
}

// ======================================================
// CIERRE ORDENADO
// ======================================================

function cerrarAplicacion() {
  if (cerrando) {
    return;
  }

  cerrando = true;

  console.log("");
  console.log("Cerrando SIMCAR LINK...");

  try {
    discoverySocket.close();
  } catch {}

  try {
    telemetrySocket.close();
  } catch {}

  setTimeout(() => {
    process.exit(0);
  }, 300);
}

process.on("SIGINT", cerrarAplicacion);
process.on("SIGTERM", cerrarAplicacion);

// ======================================================
// INICIO
// ======================================================

iniciarDescubrimiento();

leerTelemetria();

setInterval(
  leerTelemetria,
  INTERVALO_LECTURA_MS
);