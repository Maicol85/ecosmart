/*
 * _probe_pant5cvr.mjs - constriccion vs restriccion: los cuatro campos de a dos (PANT-5, c8).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *   node scripts/_probe_pant5cvr.mjs --file <index.html>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const FILE = arg('--file') || (RAIZ + '/index.html');
const ANCHOS = [1440, 1000, 768, 700, 699, 390];

const JS = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  const o = {};
  try { showTab('hemodinamica') } catch (e) {}
  const sec = document.getElementById('ete-seccion-constr-restr');
  if (sec && getComputedStyle(sec).display === 'none') {
    const h = document.querySelector('[onclick*="constr-restr"]'); if (h) h.click();
  }
  if (!sec) { o.error = 'NO HAY SECCION'; return o }
  o.abierta = getComputedStyle(sec).display !== 'none';
  sec.scrollIntoView({ block:'center' });
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10, y: Math.round(r.y*10)/10 } };
  o.sec = R(sec);
  /* las DOS columnas del grid-2 de la seccion */
  const g2 = sec.querySelector('.grid-2');
  o.cols = g2 ? Array.prototype.slice.call(g2.children).map(c => R(c)) : null;
  if (o.cols && o.cols.length === 2) {
    o.altoIzq = o.cols[0].h; o.altoDer = o.cols[1].h;
    o.hueco = Math.round((o.cols[0].h - o.cols[1].h) * 10) / 10;
  }
  const gr = document.getElementById('cvr-campos-grid');
  o.grid = R(gr);
  if (gr) {
    o.gtc = getComputedStyle(gr).gridTemplateColumns;
    o.nCols = o.gtc.split(' ').filter(x => x).length;
    const hij = Array.prototype.slice.call(gr.children).map(c => R(c));
    const ys = {}; hij.forEach(x => { const k = String(x.y); ys[k] = (ys[k] || 0) + 1 });
    o.porFila = Object.keys(ys).sort((a,b)=>a-b).map(k => ys[k]);
    o.minAncho = Math.min.apply(null, hij.map(x => x.w));
  }
  /* los cuatro campos y lo que cada uno lleva */
  const IDS = ['cvr_rebote','cvr_hepatico','cvr_hep_coc','cvr_pericardio_tc'];
  o.faltan = IDS.filter(id => !document.getElementById(id));
  o.enGrid = IDS.filter(id => { const e = document.getElementById(id); return e && gr && gr.contains(e) }).length;
  o.lectura = !!document.getElementById('cvr-coc-eval');
  o.globo = document.querySelectorAll('#cvr-campos-grid .vinfo-btn').length;
  o.tabla = R(document.getElementById('cvr-tabla'));
  o.conteo = (document.getElementById('cvr-conteo') || {}).textContent || '';
  o.scrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  o.recortados = [];
  if (gr) Array.prototype.slice.call(gr.querySelectorAll('label')).forEach(e => {
    if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) o.recortados.push((e.textContent||'').trim().slice(0,26)) });
  return o;
})()`;

const nav = await _pw.chromium.launch({ channel: 'chrome' });
for (const w of ANCHOS) {
  const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e).slice(0, 110)));
  try {
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(1000);
    const a = await Promise.race([pg.evaluate(JS),
      new Promise((_, rj) => setTimeout(() => rj(new Error('timeout')), 60000))]);
    if (a.error) { console.log(w + ' ' + a.error); }
    else console.log(String(w).padStart(4) + ' px | sec ' + (a.sec ? a.sec.w + 'x' + a.sec.h : '-') +
      ' | izq ' + a.altoIzq + ' der ' + a.altoDer + ' hueco=' + a.hueco +
      ' | grid cols=' + a.nCols + ' porFila=' + JSON.stringify(a.porFila) + ' minAncho=' + a.minAncho +
      ' | campos ' + a.enGrid + '/4 faltan=' + JSON.stringify(a.faltan) +
      ' lectura=' + a.lectura + ' globo=' + a.globo +
      ' | tabla ' + (a.tabla ? a.tabla.w + 'x' + a.tabla.h : '-') + ' conteo="' + String(a.conteo).trim() + '"' +
      ' | recort=' + a.recortados.length + (a.recortados.length ? JSON.stringify(a.recortados) : '') +
      ' | scrollX=' + a.scrollX + ' | err ' + errs.length + ' ' + (errs[0] || ''));
  } catch (e) { console.log(w + ' ERROR ' + String(e).slice(0, 130)) }
  await ctx.close();
}
await nav.close();
