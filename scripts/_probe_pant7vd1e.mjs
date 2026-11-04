/*
 * _probe_pant7vd1e.mjs - PANT-7 commit 1, verificacion 1e: el dibujo del VD sigue de SOLO
 * LECTURA y sin controles, MUDO sin datos, de UN solo color y QUIETO con
 * prefers-reduced-motion; y el esquema valvular 2D no se movio.
 * Nombre propio: verificado con ls, no existia.
 *   node scripts/_probe_pant7vd1e.mjs --file <index.html> --out <json>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p7vd1e.json';

const ABRIR = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display='none' });
  try { showTab('hemodinamica') } catch(e){}
  const sec = document.getElementById('tep-seccion');
  if (sec && getComputedStyle(sec).display === 'none') { const h=document.querySelector('[onclick*="tep-seccion"]'); if (h) h.click() }
  return sec ? getComputedStyle(sec).display !== 'none' : null;
})()`;

/* MUDO: con el formulario vacio, cuantos textos VISIBLES tiene el dibujo. El DENOMINADOR es
   que el contorno este dibujado: sin eso, cero textos no prueba nada. */
const MUDO = `(() => {
  const o = {};
  const s = document.getElementById('vdsc-svg');
  if (!s) return { err: 'SIN DIBUJO' };
  const out = document.getElementById('vdsc-out');
  o.denomContorno = out ? (out.getAttribute('d')||'').length : 0;
  const vis = Array.prototype.slice.call(s.querySelectorAll('text')).filter(t => {
    const cs = getComputedStyle(t);
    if (cs.display==='none'||cs.visibility==='hidden') return false;
    if (parseFloat(cs.opacity) < 0.05) return false;
    const pg = t.closest('g');
    if (pg && parseFloat(getComputedStyle(pg).opacity) < 0.05) return false;
    return (t.textContent||'').trim().length > 0;
  });
  o.textosVisibles = vis.length;
  o.textos = vis.map(t => (t.textContent||'').trim().slice(0,22));
  /* UN SOLO COLOR: cuantos nodos tienen un fill o stroke que NO sea escala de grises ni el
     celeste de la paleta del dibujo. */
  const gris = (c) => { const m = /rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/.exec(c);
    if (!m) return true;
    const r=+m[1],g=+m[2],b=+m[3];
    if (Math.abs(r-g)<=6 && Math.abs(g-b)<=6 && Math.abs(r-b)<=6) return true;
    return false };
  const cel = (c) => { const m = /rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/.exec(c);
    if (!m) return false; const r=+m[1],g=+m[2],b=+m[3];
    return (b > r + 20 && b >= g) };
  const fuera = [];
  Array.prototype.slice.call(s.querySelectorAll('*')).forEach(e => {
    const cs = getComputedStyle(e);
    /* SOLO fill y stroke: la propiedad color es heredada y en un SVG no pinta nada. Con color
       en la lista la sonda contaba los once textos del dibujo como nodos fuera de la escala de
       grises, porque heredan el --text AZULADO de la app -la misma trampa que PANT-5 documento-
       mientras su fill real es --vdsc-ink, un gris puro. */
    ['fill','stroke'].forEach(pr => {
      const c = cs[pr];
      if (!c || c === 'none' || /^rgba\\(0, 0, 0, 0\\)$/.test(c)) return;
      if (/^url\\(/.test(c)) return;
      if (gris(c) || cel(c)) return;
      fuera.push((e.id||e.tagName) + ' ' + pr + '=' + c);
    });
  });
  o.coloresFuera = fuera;
  o.nodos = s.querySelectorAll('*').length;
  return o;
})()`;

/* SOLO LECTURA: foto de los campos del estudio, seis pasadas de fase y de sincronizacion, y
   la misma foto despues. El DENOMINADOR es cuantos campos se fotografiaron. */
const SOLOLEC = `(() => {
  const foto = () => { const o={};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
      if (e.type === 'checkbox' || e.type === 'radio') o[e.id] = e.checked ? '1':'0';
      else o[e.id] = e.value; });
    return o };
  const a = foto();
  for (let i=0;i<6;i++) {
    try { if (typeof vdscFase === 'function') vdscFase(i/6) } catch(e){}
    try { if (typeof vdscSync === 'function') vdscSync() } catch(e){}
  }
  const b = foto();
  const dif = [];
  Object.keys(a).forEach(k => { if (a[k] !== b[k]) dif.push(k + ': ' + a[k] + ' -> ' + b[k]) });
  return { campos: Object.keys(a).length, movidos: dif };
})()`;

/* CONTROLES: cuantos controles de dato hay DENTRO de la caja del dibujo. Solo el boton de pausa. */
const CTRL = `(() => {
  const c = document.getElementById('vdsc-caja');
  if (!c) return { err:'SIN CAJA' };
  const ctr = Array.prototype.slice.call(c.querySelectorAll('input,select,textarea,button'));
  return { n: ctr.length, lista: ctr.map(e => e.tagName + '#' + (e.id||'') ),
           playAlto: (function(){ const b=document.getElementById('vdsc-play'); return b?Math.round(b.getBoundingClientRect().height):null })() };
})()`;

/* QUIETO: con prefers-reduced-motion, el contorno no cambia entre dos lecturas separadas. */
const QUIETO = `(async () => {
  const d1 = (document.getElementById('vdsc-out')||{}).getAttribute ? document.getElementById('vdsc-out').getAttribute('d') : null;
  await new Promise(r => setTimeout(r, 900));
  const d2 = (document.getElementById('vdsc-out')||{}).getAttribute ? document.getElementById('vdsc-out').getAttribute('d') : null;
  return { largo: (d1||'').length, igual: d1 === d2 };
})()`;

const V2D = `(() => {
  try { showTab('valvulas') } catch(e){}
  try { const b = document.getElementById('v2d-abrir'); if (b) b.click() } catch(e){}
  const s = document.getElementById('v2d-svg');
  if (!s) return { err:'SIN V2D' };
  const r = s.getBoundingClientRect();
  const firma = Array.prototype.slice.call(s.querySelectorAll('*')).map(e =>
    e.tagName + '|' + (e.getAttribute('d')||'') + '|' + (e.getAttribute('class')||'')).join('~');
  const o = { w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10, nodos: s.querySelectorAll('*').length,
              firmaLargo: firma.length, firmaHash: 0 };
  let hh = 0; for (let i=0;i<firma.length;i++) { hh = (hh*31 + firma.charCodeAt(i)) | 0 }
  o.firmaHash = hh;
  try { if (typeof v2dCerrar === 'function') v2dCerrar() } catch(e){}
  return o;
})()`;

const res = { file: FILE };
const nav = await _pw.chromium.launch({ channel: 'chrome' });
/* 1) normal, formulario VACIO */
let ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
let pg = await ctx.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(String(e).slice(0,160)));
try {
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
  await pg.waitForTimeout(1200);
  res.abierta = await pg.evaluate(ABRIR);
  await pg.waitForTimeout(400);
  res.mudo = await pg.evaluate(MUDO);
  res.ctrl = await pg.evaluate(CTRL);
  res.soloLectura = await pg.evaluate(SOLOLEC);
  res.v2d = await pg.evaluate(V2D);
} catch (e) { res.err = String(e).slice(0,200) }
res.errores = errs.length;
await ctx.close();
/* 2) con prefers-reduced-motion */
ctx = await nav.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
pg = await ctx.newPage();
try {
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
  await pg.waitForTimeout(1500);
  await pg.evaluate(ABRIR);
  await pg.waitForTimeout(400);
  res.quieto = await pg.evaluate(QUIETO);
} catch (e) { res.quietoErr = String(e).slice(0,200) }
await ctx.close();
await nav.close();
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
