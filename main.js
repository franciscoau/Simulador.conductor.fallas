const { app, BrowserWindow } = require("electron");
const path = require("path");

let splashWindow;
let mainWindow;

/**
 * Bloquea combinaciones utilizadas para inspeccionar
 * o recargar el contenido de la aplicación.
 */
function protectWindow(window) {
  window.webContents.on("before-input-event", (event, input) => {
    const key = String(input.key || "").toLowerCase();

    const isF12 = input.key === "F12";

    const isDevTools =
      (input.control || input.meta) &&
      input.shift &&
      (key === "i" || key === "j" || key === "c");

    const isViewSource =
      (input.control || input.meta) &&
      key === "u";

    const isReload =
      ((input.control || input.meta) && key === "r") ||
      input.key === "F5";

    if (isF12 || isDevTools || isViewSource || isReload) {
      event.preventDefault();
    }
  });

  // Protección adicional: si alguna acción intenta abrir DevTools,
  // se cierran inmediatamente.
  window.webContents.on("devtools-opened", () => {
    window.webContents.closeDevTools();
  });
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 760,
    height: 480,
    frame: false,
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    center: true,
    show: false,
    backgroundColor: "#0d100c",

    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: false
    }
  });

  protectWindow(splashWindow);

  splashWindow.loadFile(
    path.join(__dirname, "splash.html")
  );

  splashWindow.once("ready-to-show", () => {
    splashWindow.show();
  });

  splashWindow.on("closed", () => {
    splashWindow = null;
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1600,
    height: 950,
    minWidth: 1200,
    minHeight: 700,
    title: "MOCK UP VIRTUAL",
    autoHideMenuBar: true,
    backgroundColor: "#111111",
    show: false,

    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: false
    }
  });

  protectWindow(mainWindow);

  // A driver window belongs to the current training session.
  const trainingWindows = new Set();
  const closeTrainingWindows = () => {
    for (const child of trainingWindows) {
      if (!child.isDestroyed()) child.close();
    }
    trainingWindows.clear();
  };
  mainWindow.webContents.on("did-create-window", child => {
    trainingWindows.add(child);
    protectWindow(child);
    child.on("closed", () => trainingWindows.delete(child));
  });
  mainWindow.webContents.on("will-navigate", closeTrainingWindows);
  mainWindow.on("closed", closeTrainingWindows);

  mainWindow.loadFile(
    path.join(__dirname, "index.html")
  );

  mainWindow.setMenuBarVisibility(false);

  mainWindow.once("ready-to-show", () => {
    setTimeout(() => {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.close();
      }

      if (!mainWindow || mainWindow.isDestroyed()) return;
      mainWindow.maximize();
      mainWindow.show();
      mainWindow.focus();
    }, 2500);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createSplashWindow();
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createSplashWindow();
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});