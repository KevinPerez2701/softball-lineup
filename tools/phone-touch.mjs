// QA: mide la app como teléfono táctil (pointer: coarse) en Chrome sin ventana, vía CDP. Sin npm (Node 22).
// Uso: node tools/phone-touch.mjs <carpeta-salida> [url] [ancho] [alto] < /dev/null
//   url por defecto http://localhost:8001/ (servidor de QA de CLAUDE.md). Con ver.html#p=… usa el enlace real.
// La app arranca con una nube de mentira y un equipo de prueba en un perfil temporal: nada llega a Firestore.
import { spawn } from "node:child_process";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";

const OUT = process.argv[2] || ".";
const URL_ = process.argv[3] || "http://localhost:8001/";
const W = +(process.argv[4] || 360), H = +(process.argv[5] || 740);
const CHROME = process.platform === "win32"
  ? "C:/Program Files/Google/Chrome/Application/chrome.exe"
  : "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const prof = mkdtempSync(join(OUT, "prof-"));
const chrome = spawn(CHROME, ["--headless=new", "--remote-debugging-port=9333", "--user-data-dir=" + prof,
  "--no-first-run", "about:blank"], { stdio: "ignore" });
const sleep = ms => new Promise(r => setTimeout(r, ms));

let list = [];
for (let i = 0; i < 40 && !list.length; i++) {
  try { list = (await (await fetch("http://127.0.0.1:9333/json/list")).json()).filter(t => t.type === "page"); } catch {}
  if (!list.length) await sleep(250);
}
const ws = new WebSocket(list[0].webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener("open", r, { once: true }));
let id = 0; const pend = new Map(), errs = [];
ws.addEventListener("message", e => {
  const m = JSON.parse(e.data);
  if (m.method === "Runtime.exceptionThrown") errs.push(String(m.params.exceptionDetails.text).slice(0, 200));
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
});
const send = (method, params = {}) => new Promise(r => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async expr => {
  const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.text);
  return r.result.result.value;
};
const shot = async name => {
  const r = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(join(OUT, name), Buffer.from(r.result.data, "base64"));
};

await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 3, mobile: true });
await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
await send("Page.enable"); await send("Runtime.enable");
await send("Page.navigate", { url: URL_ });
await sleep(4000);

const res = { coarse: await ev("matchMedia('(pointer:coarse)').matches"), width: await ev("innerWidth") };
try {
  if (URL_.includes("ver.html")) {
    res.buttons = await ev(`Array.from(document.querySelectorAll("button")).map(b => b.textContent.trim() + ": " + Math.round(b.getBoundingClientRect().height) + " px")`);
    await shot("ver.png");
  } else {
    // nube de mentira + equipo de prueba de 12 (con y sin número)
    await ev(`(function(){
      var T = []; ["Ana","Bea","Cris","Dani","Eli","Fer","Gabo","Hugo","Ivan","Juan","Kike","Luis"].forEach(function(n, i){ T.push({id: "p" + i, num: i % 3 ? String(i + 1) : "", name: n}); });
      var ok = function(){ return Promise.resolve(); };
      window.D10.start({uid: "qa", email: "", watch: function(n, cb){ setTimeout(function(){ cb(n === "team" ? JSON.stringify(T) : null, {fromCache: false, pending: false}); }, 50); return function(){}; },
        put: ok, putMerged: function(n, j){ return Promise.resolve(j); }, putPublic: ok, deletePublic: ok, listPublic: function(){ return Promise.resolve([]); }});
      document.body.classList.remove("locked"); document.getElementById("gate").dataset.state = "off"; return true; })()`);
    await sleep(800);
    // Orden: marcar dos y medir la barra de asistencia
    await ev(`document.querySelector('.tab[data-tab="orden"]').click(); var c = document.querySelectorAll("#absent .row input[type=checkbox]"); c[0] && c[0].click(); c[1] && c[1].click(); true`);
    await sleep(400);
    res.checkBar = await ev(`(function(){ var b = document.getElementById("checkBar").getBoundingClientRect(), t = document.querySelector(".tabbar").getBoundingClientRect(), k = document.getElementById("btnAddSel").getBoundingClientRect();
      return {hidden: document.getElementById("checkBar").hidden, barBottom: b.bottom, tabbarTop: t.top, button: [k.width, k.height]}; })()`);
    await shot("orden.png");
    // Campo: alto real de toque de cada casilla (elementFromPoint de arriba a abajo)
    await ev(`document.querySelector('.tab[data-tab="campo"]').click(); document.getElementById("stage").scrollIntoView(); true`);
    await sleep(600);
    res.slots = await ev(`Array.from(document.querySelectorAll(".slot")).filter(function(s){ return s.getClientRects().length; }).map(function(s){
      var r = s.getBoundingClientRect(), x = r.left + r.width / 2, top = null, bot = null;
      for (var y = Math.floor(r.top) - 30; y <= Math.ceil(r.bottom) + 30; y += 0.5){ var e = document.elementFromPoint(x, y); if (e && e.closest(".slot") === s){ if (top === null) top = y; bot = y; } }
      var nm = s.querySelector(".slot-name");
      return s.dataset.pos + ": dibujo " + r.height.toFixed(1) + " px, toque " + (bot - top + 0.5).toFixed(1) + " px, \\"" + nm.textContent + "\\"" + (nm.scrollWidth > nm.clientWidth ? " CORTADO" : "");
    })`);
    await shot("campo.png");
  }
} catch (e) { res.error = String(e); }
res.errors = errs;
ws.close(); chrome.kill(); await sleep(500);
rmSync(prof, { recursive: true, force: true });
writeFileSync(join(OUT, "phone-touch.json"), JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
process.exit(0);
