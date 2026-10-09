const { app, BrowserWindow } = require('electron');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'mockup-test-'));
app.setPath('userData', profile);
const errors = [];
app.on('web-contents-created', (_, contents) => {
  contents.on('console-message', (event) => {
    if (event.level === 'error') errors.push(event.message);
  });
  contents.on('render-process-gone', (_, details) => errors.push(details.reason));
});
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(read, check, label, timeout = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const value = await read();
    if (check(value)) return value;
    await pause(100);
  }
  throw new Error(`Tiempo agotado: ${label}`);
}
require(process.argv[2] ? path.resolve(process.argv[2]) : '../main.js');

app.whenReady().then(async () => {
  try {
    const main = await until(
      () => BrowserWindow.getAllWindows().find(w => w.webContents.getURL().endsWith('/index.html') && !w.webContents.isLoading()),
      Boolean, 'ventana principal');
    const run = code => main.webContents.executeJavaScript(code, true);
    const waitMenu = () => until(() => run('!!document.getElementById("vehicleGrid")'), Boolean, 'menú de vehículos');
    await waitMenu();
    assert.equal(await run('document.querySelectorAll(".vehicle-card").length'), 4);
    for (const id of ['m113', 'leopard-2a4', 'm109']) {
      await run(`document.querySelector('[data-vehicle="${id}"]').click()`);
      assert.equal(await run('document.getElementById("startTraining").disabled'), true);
      assert.match(await run('document.getElementById("detailStatus").textContent'), /PREPARACIÓN/);
    }
    await run('document.querySelector("[data-vehicle=marder-1a3]").click()');
    if (process.env.MOCKUP_SCREENSHOT) {
      await pause(3000);
      fs.writeFileSync(process.env.MOCKUP_SCREENSHOT, (await main.webContents.capturePage()).toPNG());
    }
    await run('document.getElementById("startTraining").click()');
    await until(() => run('!!document.getElementById("stateText")'), Boolean, 'módulo Marder');
    const state = () => run('document.getElementById("stateText").textContent');
    assert.match(await state(), /APAGADO/);
    await run('document.getElementById("master1Btn").click()');
    assert.match(await state(), /MASTER.?1/);
    await run('document.getElementById("master2Btn").click()');
    assert.match(await state(), /MASTER.?2/);
    await run('document.dispatchEvent(new KeyboardEvent("keydown", {code: "Digit3"}))');
    await pause(300);
    await run('document.dispatchEvent(new KeyboardEvent("keyup", {code: "Digit3"}))');
    assert.match(await state(), /MASTER.?2/);
    // Let the splash disappear before testing a held start (focus loss releases it).
    await pause(2800);
    await run('document.dispatchEvent(new KeyboardEvent("keydown", {code: "Digit3"}))');
    await pause(5300);
    await run('document.dispatchEvent(new KeyboardEvent("keyup", {code: "Digit3"}))');
    await until(state, value => /MOTOR EN MARCHA/.test(value), 'arranque completo');
    await run('document.getElementById("openDriverBtn").click()');
    const driver = await until(
      () => BrowserWindow.getAllWindows().find(w => w.webContents.getURL().includes('?view=driver') && !w.webContents.isLoading()),
      Boolean, 'puesto del conductor');
    await until(() => driver.webContents.executeJavaScript('document.getElementById("stateText").textContent'),
      value => /MOTOR EN MARCHA/.test(value), 'sincronización del conductor');
    await run('document.querySelector("[data-fault=coolant110]").click()');
    assert.match(await state(), /MASTER.?2/);
    await until(() => driver.webContents.executeJavaScript('document.getElementById("stateText").textContent'),
      value => /MASTER.?2/.test(value), 'sincronización de corte por falla');
    await run('document.getElementById("backToMenu").click()');
    assert.equal(await run('document.getElementById("leaveTraining").open'), true);
    await run('document.getElementById("cancelLeave").click()');
    assert.equal(driver.isDestroyed(), false);
    await run('document.getElementById("backToMenu").click(); document.getElementById("confirmLeave").click()');
    await waitMenu();
    await until(() => driver.isDestroyed(), Boolean, 'cierre del conductor');
    await run('document.getElementById("startTraining").click()');
    await until(() => run('!!document.getElementById("stateText")'), Boolean, 'reentrada Marder');
    assert.match(await state(), /APAGADO/);
    assert.deepEqual(errors, []);
    console.log('OK: menú, módulos pendientes, regreso y nueva sesión; carga, MASTER 1/2, arranque anticipado/correcto, audio, conductor y corte por falla.');
    app.exit(0);
  } catch (error) {
    console.error(error);
    console.error('Errores del renderer:', errors);
    app.exit(1);
  }
});
setTimeout(() => { console.error('Smoke test: timeout global'); app.exit(1); }, 45000);
