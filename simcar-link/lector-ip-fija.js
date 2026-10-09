"use strict";

const http = require("http");
const dgram = require("dgram");

// ======================================================
// CONFIGURACIÓN
// ======================================================

// Telemetría local entregada por War Thunder.
const URL_WAR_THUNDER = "http://127.0.0.1:8111/indicators";

// Frecuencia de lectura: 5 veces por segundo.
const INTERVALO_MS = 200;

// IP Wi-Fi del computador de Francisco.
// Verificar con ipconfig si esta IP cambia.
const IP_RECEPTOR = "192.168.190.88";

// Debe ser el mismo puerto utilizado en receptor.js.
const PUERTO_RECEPTOR = 41234;

// ======================================================
// ESTADO
// ======================================================

const emisor = dgram.createSocket("udp4");

let consultaEnCurso = false;
let paquetesEnviados = 0;
let ultimoErrorEnvio = "";
let cerrando = false;

// ======================================================
// ENVÍO DE TELEMETRÍA
// ======================================================

function enviarTelemetria(velocidad, rpm) {
  const paquete = {
    velocidad: Number(velocidad) || 0,
    rpm: Number(rpm) || 0,
    momento: Date.now()
  };

  const mensaje = Buffer.from(
    JSON.stringify(paquete),
    "utf8"
  );

  emisor.send(
    mensaje,
    PUERTO_RECEPTOR,
    IP_RECEPTOR,
    (error) => {
      if (error) {
        ultimoErrorEnvio = error.message;
        return;
      }

      paquetesEnviados += 1;
      ultimoErrorEnvio = "";
    }
  );
}

// ======================================================
// PRESENTACIÓN EN CONSOLA
// ======================================================

function mostrarEncabezado() {
  console.clear();
  console.log("========================================");
  console.log("              SIMCAR LINK");
  console.log("========================================");
  console.log("");
}

function mostrarSinWarThunder() {
  mostrarEncabezado();

  console.log("Estado War Thunder : NO DETECTADO");
  console.log("Estado de envío    : EN ESPERA");
  console.log("");
  console.log("Abra War Thunder e ingrese a una");
  console.log("prueba de conducción o partida.");
  console.log("");
  console.log(
    `Destino: ${IP_RECEPTOR}:${PUERTO_RECEPTOR}`
  );
}

function mostrarSinTelemetria() {
  mostrarEncabezado();

  console.log("Estado War Thunder : CONECTADO");
  console.log("Telemetría         : SIN DATOS VÁLIDOS");
  console.log("");
  console.log("Ingrese a una prueba de conducción");
  console.log("y controle un vehículo.");
  console.log("");
  console.log(
    `Destino: ${IP_RECEPTOR}:${PUERTO_RECEPTOR}`
  );
}

function mostrarTelemetria({
  vehiculo,
  velocidad,
  rpm,
  marcha
}) {
  mostrarEncabezado();

  console.log("Estado War Thunder : CONECTADO");
  console.log("Estado de envío    : ACTIVO");
  console.log("");
  console.log(`Vehículo           : ${vehiculo}`);
  console.log(
    `Velocidad          : ${velocidad.toFixed(1)} km/h`
  );
  console.log(
    `RPM                : ${rpm.toFixed(0)}`
  );
  console.log(`Marcha             : ${marcha}`);
  console.log("");
  console.log(
    `Enviando a         : ${IP_RECEPTOR}:${PUERTO_RECEPTOR}`
  );
  console.log(
    `Paquetes enviados  : ${paquetesEnviados}`
  );

  if (ultimoErrorEnvio) {
    console.log("");
    console.log(
      `Error de envío     : ${ultimoErrorEnvio}`
    );
  }

  console.log("");
  console.log("Actualizando automáticamente...");
  console.log("Ctrl + C para cerrar SIMCAR LINK.");
}

// ======================================================
// LECTURA DE WAR THUNDER
// ======================================================

function leerTelemetria() {
  if (consultaEnCurso || cerrando) {
    return;
  }

  consultaEnCurso = true;

  const solicitud = http.get(
    URL_WAR_THUNDER,
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
            // Envía 0 para evitar que el receptor
            // mantenga valores antiguos.
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

          const marcha =
            telemetria.gear ?? "-";

          const vehiculo =
            telemetria.type ?? "No identificado";

          enviarTelemetria(velocidad, rpm);

          mostrarTelemetria({
            vehiculo,
            velocidad,
            rpm,
            marcha
          });
        } catch (error) {
          mostrarEncabezado();

          console.log(
            "War Thunder respondió, pero los datos"
          );
          console.log(
            "no pudieron interpretarse."
          );
          console.log("");
          console.log(`Detalle: ${error.message}`);
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
    mostrarSinWarThunder();
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

  emisor.close(() => {
    process.exit(0);
  });

  // Salida de respaldo si el socket no cierra.
  setTimeout(() => {
    process.exit(0);
  }, 1000);
}

process.on("SIGINT", cerrarAplicacion);
process.on("SIGTERM", cerrarAplicacion);

// ======================================================
// INICIO
// ======================================================

leerTelemetria();

setInterval(
  leerTelemetria,
  INTERVALO_MS
);