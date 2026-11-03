/*
 * _probe_pant4alin.mjs - la ALINEACION de los campos de las dos estenosis aorticas (PANT-4, commit 1).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * Mide, por seccion y por ancho de ventana:
 *   · el ancho REAL de cada control (input o select) y de su contenedor .fg;
 *   · las filas: se agrupan los .fg por la coordenada y de su CONTROL, y por fila se publica
 *     el ancho minimo, el maximo y la diferencia -lo que la orden pide en tolerancia 1 px-;
 *   · la linea de base: la coordenada y del control de cada campo de la fila;
 *   · el alto y el ancho de la seccion;
 *   · si hay desplazamiento horizontal del cuerpo y si algun texto queda recortado.
 *
 *   node scripts/_probe_pant4alin.mjs --file <index.html> --out /tmp/p4a.json
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p4a.json';
const ANCHOS = (arg('--anchos') || '1440,1000,768,390').split(',').map(Number);
const SECS = ['sacc-cc-esub', 'sacc-cc-easv'];

const ABRIR = (sec) => `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  try { showTab('congenitas') } catch (e) {}
  try { ccSubTab('congenitas') } catch (e) {}
  const s = document.getElementById(${JSON.stringify(sec)});
  if (!s) return { err: 'NO EXISTE' };
  if (!s.classList.contains('open')) { const h = s.querySelector('.sacc-hdr'); if (h) h.click() }
  const b = s.querySelector('.sacc-body'); if (b) b.style.transition = 'none';
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  return { abierto: s.classList.contains('open') };
})()`;

const MEDIR = (sec) => `(() => {
  const s = document.getElementById(${JSON.stringify(sec)});
  if (!s) return { err: 'NO EXISTE' };
  const o = {};
  const r = s.getBoundingClientRect();
  o.w = Math.round(r.width); o.h = Math.round(r.height);
  /* Cada campo: su control, su ancho y su y. El .fg es el contenedor. */
  const campos = [];
  s.querySelectorAll('.fg').forEach(fg => {
    const c = fg.querySelector('input, select, textarea');
    if (!c) return;
    const qf = fg.getBoundingClientRect(), qc = c.getBoundingClientRect();
    if (qc.width <= 0) return;
    const lb = fg.querySelector('label');
    campos.push({ id: c.id || '', fgW: Math.round(qf.width * 10) / 10,
      cW: Math.round(qc.width * 10) / 10, cY: Math.round(qc.top * 10) / 10,
      fgY: Math.round(qf.top * 10) / 10,
      lblH: lb ? Math.round(lb.getBoundingClientRect().height * 10) / 10 : 0,
      lbl: lb ? lb.textContent.replace(/\\u24d8/g, '').trim() : '' });
  });
  o.campos = campos;
  /* Las filas por la y del CONTENEDOR .fg: es lo que la grilla alinea. */
  const filas = {};
  campos.forEach(c => { const k = Math.round(c.fgY); (filas[k] = filas[k] || []).push(c) });
  o.filas = Object.keys(filas).sort((a, b) => a - b).map(k => {
    const g = filas[k];
    const ws = g.map(x => x.cW), ys = g.map(x => x.cY);
    return { y: Number(k), n: g.length, ids: g.map(x => x.id),
      wMin: Math.min.apply(null, ws), wMax: Math.max.apply(null, ws),
      wDif: Math.round((Math.max.apply(null, ws) - Math.min.apply(null, ws)) * 10) / 10,
      yMin: Math.min.apply(null, ys), yMax: Math.max.apply(null, ys),
      yDif: Math.round((Math.max.apply(null, ys) - Math.min.apply(null, ys)) * 10) / 10 };
  });
  /* La conclusion: donde esta respecto de los campos. */
  const pref = ${JSON.stringify(sec)}.replace('sacc-cc-', '');
  const fila = document.getElementById(pref + '-fila');
  const cam = document.getElementById(pref + '-campos');
  const col = document.getElementById(pref + '-concl-col');
  if (fila && cam && col) {
    const a = cam.getBoundingClientRect(), b = col.getBoundingClientRect();
    o.ladoALado = (b.left >= a.right - 2);
    o.conclW = Math.round(b.width); o.camposW = Math.round(a.width);
  }
  /* Texto recortado dentro de la seccion. */
  let rec = 0;
  s.querySelectorAll('label, span, option, td, th, button').forEach(e => {
    if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0) rec++;
  });
  o.recortados = rec;
  o.scrollX = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  return o;
})()`;

const url = 'file://' + FILE;
const out = { file: FILE, cruces: [] };
const br = await chromium.launch({ channel: 'chrome' });
try {
  for (const w of ANCHOS) {
    const ctx = await br.newContext({ viewport: { width: w, height: 900 } });
    const pg = await ctx.newPage();
    await pg.goto(url, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(700);
    for (const sec of SECS) {
      let ab = null, me = null;
      try { ab = await pg.evaluate(ABRIR(sec)) } catch (e) { ab = { err: String(e).slice(0, 120) } }
      await pg.waitForTimeout(450);
      try { me = await pg.evaluate(MEDIR(sec)) } catch (e) { me = { err: String(e).slice(0, 120) } }
      out.cruces.push({ ancho: w, sec, abrir: ab, ...me });
    }
    await ctx.close();
  }
} finally { await br.close() }
fs.writeFileSync(OUTF, JSON.stringify(out, null, 1));
console.log('escrito ' + OUTF);
