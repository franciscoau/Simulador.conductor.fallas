# SIMCAR · MOCK UP VIRTUAL

Aplicación educativa de entrenamiento con paneles de vehículos. Esta copia contiene las fuentes de la versión **1.1.0**, preparadas para compartir y revisar en CECOMBAC.

## Estado actual

| Vehículo | Estado |
| --- | --- |
| Marder 1A3 | Disponible: tablero, puesta en marcha, audio, 15 fallas y puesto del conductor |
| M113 | En preparación; variante y referencias pendientes |
| Leopard 2A4 | En preparación; referencias pendientes |
| M109 | En preparación; variante y referencias pendientes |

El menú permite seleccionar las cuatro plataformas. El entrenamiento está habilitado para el Marder. Regresar al menú finaliza la sesión y cierra el puesto del conductor.

## Ejecutar desde el código

Requiere Node.js 24 LTS y npm. Desde la raíz del proyecto:

```sh
npm ci
npm start
```

Instala las dependencias en cada computador. Electron descarga el binario adecuado al sistema operativo; no copies `node_modules` entre Windows y macOS.

## Compilar ejecutables

```sh
npm run make:mac:arm64  # Desde macOS: Apple Silicon
npm run make:mac:intel  # Desde macOS: Intel
npm run make:win        # Desde Windows: instalador y ZIP x64
```

Las aplicaciones y paquetes se generan en `out/`, excluida de Git. Para usuarios sin Node.js, los ejecutables se pueden adjuntar a una publicación en **Releases**. Esta copia no incluye ejecutables ya compilados.

En Mac, descomprime el paquete apropiado y mueve **MOCK UP VIRTUAL.app** a Aplicaciones. Los paquetes actuales no tienen firma Developer ID ni notarización; macOS puede bloquear paquetes distribuidos a otros equipos.

## Controles del Marder

- `1`: MASTER 1; `2`: MASTER 2; `0`: apagado.
- Mantener `3` durante al menos cinco segundos y soltar: arranque.
- `Q`–`P` y `A`–`G`: activar/desactivar fallas.
- Espacio: restablecer fallas.
- **Abrir puesto del conductor**: segunda ventana sincronizada en el mismo computador.

## Comprobar el funcionamiento

```sh
npm test
```

La prueba abre ventanas de Electron y verifica selección de vehículos, bloqueo de módulos pendientes, arranque del Marder, fallas, sincronización del conductor, regreso al menú y nueva sesión. Requiere una sesión gráfica. La versión 1.1 fue probada en macOS Apple Silicon; la compilación Intel requiere comprobación en ese hardware. No se realizó una nueva prueba de Windows.

## Estructura

```text
index.html                 Menú de vehículos
main.js                    Ventanas y ciclo de vida de Electron
splash.html                Pantalla de inicio
shared/                    Catálogo, diseño y navegación del menú
vehicles/marder-1a3/        Tablero y lógica del Marder
sonidos/                   Los seis audios del simulador
simcar-link/               Emisores auxiliares de telemetría
forge.config.js            Empaquetado Windows/macOS
tests/                     Prueba funcional
docs/                      Guías de publicación y módulos
```

## SIMCAR LINK y funciones pendientes

`npm run simcar` inicia el emisor de velocidad/RPM desde War Thunder con descubrimiento automático del instructor. `npm run simcar:ip-fija` ejecuta la variante anterior; configura `IP_RECEPTOR` en `simcar-link/lector-ip-fija.js` según la red utilizada.

El receptor UDP del instructor no está incluido y el tablero actual no consume estos paquetes. No hay evaluación automática, registro de sesiones ni informes implementados.

## Compartir el proyecto

Consulta [la guía para subirlo a GitHub y dar acceso a CECOMBAC](docs/SUBIR_A_GITHUB.md). Para incorporar nuevos paneles, consulta [la guía de módulos](docs/VEHICULOS.md).

Autores originales: TTE. Francisco Yáñez Unzueta y TTE. Juan Poblete Melgarejo. Se conserva la condición original **UNLICENSED**; esta copia no concede una licencia de código abierto.
