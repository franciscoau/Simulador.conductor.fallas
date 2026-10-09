# Cargar SIMCAR desde el navegador

Repositorio: [franciscoau/Simulador.conductor.fallas](https://github.com/franciscoau/Simulador.conductor.fallas).

## Cargar los archivos

1. Abre el repositorio e inicia sesión en GitHub desde el navegador.
2. Pulsa **Add file → Upload files**. En un repositorio vacío, puedes utilizar el enlace para cargar archivos existentes.
3. Abre la carpeta `SIMCAR-CECOMBAC-GITHUB` del Escritorio en Finder.
4. Selecciona **todo el contenido visible** con **Command + A** y arrástralo al área de carga de GitHub. Selecciona los archivos y subcarpetas interiores; no arrastres la carpeta exterior.
5. Espera a que terminen las cargas. Comprueba que aparecen `package.json`, `README.md`, `index.html` y las subcarpetas `vehicles`, `shared` y `sonidos` directamente en la raíz del repositorio.
6. Escribe `Versión inicial SIMCAR 1.1 para CECOMBAC` como mensaje y pulsa **Commit changes**.

Esta vía utiliza tu sesión del navegador y no necesita ingresar un token en Terminal.

## Qué contiene esta carpeta

Código, recursos, pruebas y documentación. Todos los elementos visibles están preparados para subir. El historial Git y su configuración se conservaron aparte, en `SIMCAR-RESPALDO-LOCAL`, que no se debe cargar.

Los ejecutables, dependencias y respaldos históricos permanecen en el proyecto original. Las compilaciones se pueden compartir como archivos adjuntos de una Release.

## Dar acceso a CECOMBAC

Comparte el enlace del repositorio. Si es privado, invita previamente a las cuentas correspondientes desde la configuración de colaboradores, o asigna acceso al equipo si pertenece a una organización.

## Configuración opcional para desarrollo con Git

En la carpeta `SIMCAR-RESPALDO-LOCAL` se conservaron `.gitignore` y `.gitattributes`. Son útiles al continuar el desarrollo con Git y pueden añadirse al repositorio posteriormente. La carpeta de carga no incluye `.git` ni estos archivos ocultos para permitir seleccionar directamente su contenido visible.

## Documentación oficial

- [Cargar archivos desde el navegador](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository)
- [Invitar colaboradores](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/repository-access-and-collaboration/inviting-collaborators-to-a-personal-repository)
- [Crear y administrar Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository)
