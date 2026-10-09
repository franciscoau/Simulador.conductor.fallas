# Módulos de vehículos · versión 1.1

La entrada de Electron sigue siendo `main.js`. Tras la pantalla inicial carga `index.html`, el selector. El catálogo `shared/vehicles.js` declara identidad, estado, página de entrada, descripción y funciones de cada plataforma.

El módulo disponible es `vehicles/marder-1a3/index.html`. Contiene el simulador original; sus audios se resuelven desde `../../sonidos/`. Las ventanas instructor/conductor siguen usando la misma página con `?view=driver`. Al abandonar el módulo se cierra la ventana del conductor y se detiene la sesión. Electron también cierra ventanas secundarias al navegar o cerrar la ventana principal.

Para añadir un vehículo:

1. Confirmar la variante y reunir referencias de su tablero y procedimientos.
2. Crear su carpeta en `vehicles/` con una página de entrada y sus recursos propios.
3. Implementar y validar instrumentos, controles, arranque y fallas específicos.
4. Añadir pruebas funcionales y comprobar el puesto del conductor.
5. Cambiar su registro del catálogo a `status: 'ready'` y definir `entry`.

Los módulos M113, Leopard 2A4 y M109 están declarados como `planned`, sin página de entrenamiento. El menú permite consultarlos, pero mantiene deshabilitado el inicio. Las funciones listadas para ellos son previstas, no implementadas.

Las pruebas abarcan selección de las cuatro plataformas, bloqueo de módulos pendientes, acceso al Marder, secuencia de arranque, fallas, sincronización, cancelación de regreso, cierre del conductor y reinicio de sesión.

Los respaldos históricos se conservan en el proyecto original y no forman parte de esta copia para GitHub.
