/**
 * _probe_pant17wk.mjs — los DOS MOTORES de la tanda PANT-17 (2026-11-06).
 * Chrome del sistema (channel 'chrome') y WebKit de Playwright, a 1440, 1000, 768 y 390 px y en
 * los dos temas: dieciseis cruces por motor.
 * ⚠️ WebKit de Playwright NO es Safari, y se declara.
 * Nombre propio: verificado con ls, no existia.
 *
 *   node scripts/_probe_pant17wk.mjs --file <index.html> --out <json>
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
let _pw; try { _pw = require(process.env.HOME + '/.pwtmp/node_modules/playwright') }
catch (e) { console.log('SIN PLAYWRIGHT'); process.exit(0) }
const RAIZ = process.cwd();
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p17wk.json';
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['dark', 'light'];

const CAMPOS = { vap_tipo:'i', vap_diam:'8', dap_tipo:'no_restrictivo', dap_diam:'4', dap_dir:'id' };
const PROHIB = ['no coincid', 'difieren', 'discrepan', 'se contradicen', 'no se encontr',
  'ninguna fuente', 'ninguna gu', 'sin resolver', 'pendiente de revisi', 'sin validar'];

const MEDIR = (tema) => '(() => {\n'
  + '  var C = ' + JSON.stringify(CAMPOS) + ', PROH = ' + JSON.stringify(PROHIB) + ';\n'
  + '  try { document.documentElement.setAttribute("data-theme", ' + JSON.stringify(tema) + ') } catch (e) {}\n'
  + '  ["modalAvisoEco","login-overlay"].forEach(function (id) { var m = document.getElementById(id); if (m) m.style.display = "none" });\n'
  + '  try { if (typeof limpiarCampos === "function") limpiarCampos(true) } catch (e) {}\n'
  + '  Object.keys(C).forEach(function (k) { var e = document.getElementById(k); if (!e) return;\n'
  + '    e.value = C[k]; e.dispatchEvent(new Event("input", { bubbles: true }));\n'
  + '    e.dispatchEvent(new Event("change", { bubbles: true })) });\n'
  + '  Object.keys(window).forEach(function (k) { if (/^calc[A-Z]/.test(k) && typeof window[k] === "function") {\n'
  + '    try { window[k]() } catch (e) {} } });\n'
  + '  try { if (typeof indicCerrar === "function") indicCerrar() } catch (e) {}\n'
  + '  try { indicAbrir() } catch (e) { return { error: String(e).slice(0, 110) } }\n'
  + '  document.querySelectorAll("*").forEach(function (e) { e.style.transition = "none"; e.style.animation = "none" });\n'
  + '  var cuerpo = document.getElementById("indic-cuerpo");\n'
  + '  if (!cuerpo) return { error: "sin panel" };\n'
  + '  var out = { secs: {} };\n'
  + '  Array.prototype.slice.call(cuerpo.querySelectorAll("details")).filter(function (d) {\n'
  + '    return !d.parentElement.closest("details") }).forEach(function (d) {\n'
  + '    d.open = true;\n'
  + '    var sum = d.querySelector("summary"), tit = sum ? (sum.textContent || "").trim().slice(0, 40) : "?";\n'
  + '    var tall = d.textContent || "";\n'
  + '    var bots = Array.prototype.slice.call(d.querySelectorAll("button, [role=button], .ind-ctrl-b"));\n'
  + '    var padres = [];\n'
  + '    bots.forEach(function (b) { var t = (b.textContent || "").trim();\n'
  + '      if (!/^(S\\u00ed|No|\\?)$/.test(t)) return;\n'
  + '      var p = b.parentElement; if (p && padres.indexOf(p) < 0) padres.push(p) });\n'
  + '    var bad = []; PROH.forEach(function (p) { if (tall.toLowerCase().indexOf(p) > -1) bad.push(p) });\n'
  + '    out.secs[tit] = { preg: padres.length, clases: (tall.match(/Clase [0-9IV]/g) || []).length,\n'
  + '      citas: (tall.match(/\\[[0-9]+\\]/g) || []).length, prohib: bad };\n'
  + '  });\n'
  + '  var card = document.getElementById("indic-card"), rc = card ? card.getBoundingClientRect() : null;\n'
  + '  out.panel = rc ? { w: Math.round(rc.width), h: Math.round(rc.height) } : null;\n'
  + '  out.scrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;\n'
  + '  /* TEXTOS RECORTADOS: los del panel, que es lo que esta tanda toca. */\n'
  + '  var rec = 0;\n'
  + '  cuerpo.querySelectorAll("*").forEach(function (e) {\n'
  + '    if (e.children.length) return;\n'
  + '    if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflowX === "hidden") rec++ });\n'
  + '  out.recortados = rec;\n'
  + '  return out;\n'
  + '})()';

const res = { file: FILE, cruces: {}, errs: [] };
for (const motor of ['chrome', 'webkit']) {
  let br;
  try {
    br = (motor === 'chrome')
      ? await _pw.chromium.launch({ channel: 'chrome' })
      : await _pw.webkit.launch();
  } catch (e) { res.errs.push(motor + ': ' + String(e).slice(0, 100)); continue }
  for (const W of ANCHOS) for (const tema of TEMAS) {
    const k = motor + ':' + W + ':' + tema;
    try {
      const pg = await br.newPage({ viewport: { width: W, height: 900 } });
      const pe = [];
      pg.on('pageerror', e => pe.push(String(e.message || e).slice(0, 110)));
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
      await pg.waitForTimeout(1300);
      const m = await pg.evaluate(MEDIR(tema));
      m.pageErr = pe.filter(x => !/ERR_FILE_NOT_FOUND|favicon/.test(x));
      res.cruces[k] = m;
      await pg.close();
    } catch (e) { res.cruces[k] = { fatal: String(e).slice(0, 140) } }
  }
  try { await br.close() } catch (e) {}
}
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log('OK ' + OUTF);
