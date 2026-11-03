/*
 * _probe_pant4alto.mjs - el ALTO de las pantallas de MCA y de Fallot (PANT-4, commit 4).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * Mide el alto y el ancho de las dos secciones a 1440, 1000, 768 y 390 px, con la sub-pestania
 * y el acordeon abiertos por su BOTON REAL y las transiciones apagadas antes de medir. Publica
 * ademas el denominador -que la sub-pestania este visible y el acordeon abierto-, porque un
 * alto de cero sobre una seccion escondida se lee igual que «la pantalla no existe».
 *
 *   node scripts/_probe_pant4alto.mjs --file <index.html> --out /tmp/p4h.json
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p4h.json';
const ANCHOS = (arg('--anchos') || '1440,1000,768,390').split(',').map(Number);
const SECS = ['sacc-cc-mca', 'sacc-cc-tdf'];

const ABRIR = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  const o = {};
  /* La pestania de congenitas y despues la SUB-pestania «CC complejas», que es donde viven las
     dos. Por su boton real: el tablist tiene su propio sincronizador. */
  /* ADVERTENCIA: NO se da por sentada la sub-pestania. Se busca el panel que CONTIENE cada
     seccion y se abre ese: medido, MCA y Fallot viven en «CC frecuentes» (tab-congenitas) y no
     en «CC complejas», y abrir la que no es deja la seccion con un rect de 0x0, que se lee
     igual que «la pantalla no existe». Costo una corrida. */
  const dueno = (id) => { let e = document.getElementById(id);
    while (e) { if (e.id && e.id.indexOf('tab-congenitas') === 0) return e.id; e = e.parentElement } return null };
  o.duenos = {};
  ${JSON.stringify(SECS)}.forEach(id => { o.duenos[id] = dueno(id) });
  try { showTab('congenitas') } catch (e) { o.e1 = String(e).slice(0, 80) }
  const sub = o.duenos[${JSON.stringify(SECS)}[0]];
  if (sub && sub !== 'tab-congenitas') {
    const bt = document.querySelector('.cc-subbar [data-cc-sub="' + sub.slice(4) + '"], .cc-subbar button[onclick*="' + sub.slice(4) + '"]');
    if (bt) { bt.click(); o.porBoton = true } else { try { ccSubTab(sub.slice(4)); o.porBoton = false } catch (e) { o.e2 = String(e).slice(0, 80) } }
  } else { o.porBoton = 'no hace falta' }
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  const pan = document.getElementById(o.duenos[${JSON.stringify(SECS)}[0]] || 'tab-congenitas');
  o.subDisplay = pan ? getComputedStyle(pan).display : 'NO EXISTE';
  ${JSON.stringify(SECS)}.forEach(id => {
    const s = document.getElementById(id); if (!s) { o[id] = 'NO EXISTE'; return }
    if (!s.classList.contains('open')) { const h = s.querySelector('.sacc-hdr'); if (h) h.click() }
    const b = s.querySelector('.sacc-body'); if (b) b.style.transition = 'none';
    o[id] = s.classList.contains('open');
  });
  return o;
})()`;

const MEDIR = `(() => {
  const o = {};
  ${JSON.stringify(SECS)}.forEach(id => {
    const s = document.getElementById(id);
    if (!s) { o[id] = 'NO EXISTE'; return }
    const r = s.getBoundingClientRect();
    o[id] = { h: Math.round(r.height), w: Math.round(r.width), abierto: s.classList.contains('open') };
  });
  /* La zona NO ecocardiografica de MCA, que es lo que el commit 4a mueve. */
  const nc = document.getElementById('mca-nocols');
  if (nc) { const q = nc.getBoundingClientRect(); o.mcaNoCols = { h: Math.round(q.height), w: Math.round(q.width) } }
  const fl = document.getElementById('mca-fila'), cp = document.getElementById('mca-campos'), cc = document.getElementById('mca-concl-col');
  if (fl && cp && cc) { const a = cp.getBoundingClientRect(), b = cc.getBoundingClientRect();
    o.mcaLado = (b.left >= a.right - 2); o.mcaCamposW = Math.round(a.width); o.mcaConclW = Math.round(b.width); }
  const tf = document.getElementById('tdf-fila'), tc = document.getElementById('tdf-campos'), tk = document.getElementById('tdf-concl-col');
  if (tf && tc && tk) { const a = tc.getBoundingClientRect(), b = tk.getBoundingClientRect();
    o.tdfLado = (b.left >= a.right - 2); o.tdfCamposW = Math.round(a.width); o.tdfConclW = Math.round(b.width); }
  /* Las filas REALES de campos de cada seccion: agrupadas por la y del contenedor. */
  ['sacc-cc-mca','sacc-cc-tdf'].forEach(id => {
    const s = document.getElementById(id); if (!s) return;
    const f = {};
    s.querySelectorAll('.fg').forEach(e => { const q = e.getBoundingClientRect();
      if (q.width <= 0) return; const k = Math.round(q.top); f[k] = (f[k] || 0) + 1 });
    const v = Object.values(f);
    o[id + '_cols'] = v.length ? Math.max.apply(null, v) : 0;
    o[id + '_filas'] = v.length;
  });
  o.scrollX = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  let rec = 0;
  document.querySelectorAll('#sacc-cc-mca label, #sacc-cc-mca td, #sacc-cc-tdf label, #sacc-cc-tdf td').forEach(e => {
    if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0) rec++ });
  o.recortados = rec;
  /* DIAGNOSTICO: si el alto da cero, cual es el primer ancestro escondido. Un cero sobre una
     seccion tapada se lee igual que «la pantalla no existe», y eso ya costo corridas. */
  const s0 = document.getElementById('sacc-cc-mca');
  if (s0 && s0.getBoundingClientRect().height === 0) {
    const cad = []; let e = s0;
    while (e && e !== document.documentElement) {
      const cs = getComputedStyle(e);
      cad.push((e.id || e.tagName) + ':' + cs.display + (cs.visibility === 'hidden' ? '/oculto' : ''));
      e = e.parentElement;
    }
    o.cadena = cad.slice(0, 10);
  }
  return o;
})()`;

const out = { file: FILE, cruces: [] };
const br = await _pw.chromium.launch({ channel: 'chrome' });
try {
  for (const w of ANCHOS) {
    const ctx = await br.newContext({ viewport: { width: w, height: 900 } });
    const pg = await ctx.newPage();
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(900);
    let ab = null, me = null;
    try { ab = await pg.evaluate(ABRIR) } catch (e) { ab = { err: String(e).slice(0, 150) } }
    await pg.waitForTimeout(600);
    try { me = await pg.evaluate(MEDIR) } catch (e) { me = { err: String(e).slice(0, 150) } }
    out.cruces.push({ ancho: w, abrir: ab, ...me });
    await ctx.close();
  }
} finally { await br.close() }
fs.writeFileSync(OUTF, JSON.stringify(out, null, 1));
console.log('escrito ' + OUTF);
