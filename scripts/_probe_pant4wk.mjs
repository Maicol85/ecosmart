/*
 * _probe_pant4wk.mjs - Chrome y WebKit sobre las zonas de la tanda PANT-4 (2026-11-03).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * Dos motores x 1440, 1000, 768 y 390 px x dos temas = DIECISEIS cruces por motor.
 * ⚠️ WebKit de Playwright NO es Safari, y se declara. Chrome va por el del sistema con
 *    channel chrome: sin eso la sonda devuelve los cruces vacios.
 *
 *   node scripts/_probe_pant4wk.mjs --file <index.html> --out /tmp/p4wk.json
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p4wk.json';
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['oscuro', 'claro'];

const MEDIR = (tema) => `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  if (${JSON.stringify(tema)} === 'claro') { try { document.documentElement.setAttribute('data-theme','light') } catch (e) {} }
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  const o = {};
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return; e.value = v;
    e.dispatchEvent(new Event('input', { bubbles:true })); e.dispatchEvent(new Event('change', { bubbles:true })) };
  try { showTab('congenitas') } catch (e) {}
  /* LAS DOS ESTENOSIS: se abren por su boton real. */
  ['sacc-cc-esub','sacc-cc-easv'].forEach(id => { const s = document.getElementById(id);
    if (s && !s.classList.contains('open')) { const h = s.querySelector('.sacc-hdr'); if (h) h.click() }
    const b = s && s.querySelector('.sacc-body'); if (b) b.style.transition = 'none' });
  S('esub_tipo','membrana'); S('esub_gradiente_medio','45'); S('esub_ia_asociada','moderada');
  S('esub_valsalva','sin_cambios');
  S('easv_tipo','reloj'); S('easv_gradiente_medio','45'); S('easv_coronarias','comprometidos');
  try { esubSync(); easvSync() } catch (e) {}
  /* 1 - LA ALINEACION: por fila, el ancho y la linea de base de los tres controles. */
  const filas = [];
  document.querySelectorAll('#esub-campos .esa-grid, #easv-campos .esa-grid').forEach(g => {
    const cs = Array.prototype.slice.call(g.querySelectorAll('.fg')).map(f => {
      const c = f.querySelector('input, select'); return c ? c.getBoundingClientRect() : null;
    }).filter(r => r && r.width > 0);
    if (!cs.length) return;
    const w = cs.map(r => Math.round(r.width * 10) / 10), y = cs.map(r => Math.round(r.top * 10) / 10);
    filas.push({ n: cs.length,
      wDif: Math.round((Math.max.apply(null, w) - Math.min.apply(null, w)) * 10) / 10,
      yDif: Math.round((Math.max.apply(null, y) - Math.min.apply(null, y)) * 10) / 10 });
  });
  o.filas = filas;
  o.wDifMax = filas.length ? Math.max.apply(null, filas.map(f => f.wDif)) : -1;
  /* ADVERTENCIA: la diferencia de linea de base solo SIGNIFICA algo por encima del colapso. Por
     debajo de 768 px la grilla cae a UNA columna y los seis campos estan apilados POR DISENIO,
     asi que agruparlos por grilla da una diferencia grande que no es un defecto. Costo una
     lectura. Por debajo del corte se publica el centinela -1. */
  o.colapsada = (window.innerWidth <= 768);
  o.yDifMax = o.colapsada ? -1
    : (filas.length ? Math.max.apply(null, filas.map(f => f.yDif)) : -1);
  /* 2 - ALTO Y DISPOSICION de las dos secciones. */
  ['esub','easv'].forEach(k => {
    const s = document.getElementById('sacc-cc-' + k);
    const cam = document.getElementById(k + '-campos'), col = document.getElementById(k + '-concl-col');
    o[k + 'H'] = s ? Math.round(s.getBoundingClientRect().height) : -1;
    if (cam && col) { const a = cam.getBoundingClientRect(), b = col.getBoundingClientRect();
      o[k + 'Lado'] = (b.left >= a.right - 2) }
  });
  /* 3 - LA CONCLUSION DE PANTALLA: sin conducta. */
  const cs = (document.getElementById('esub-resultado') || {}).textContent || '';
  o.conclSinSeg = cs.indexOf('Seguimiento') < 0;
  o.conclSinQx = cs.indexOf('indicación quirúrgica') < 0 && cs.indexOf('decisión quirúrgica') < 0;
  o.conclConGuia = cs.indexOf('severa (ESC 2020)') >= 0;
  /* 4 - EL PAPEL. */
  try { if (typeof eteInclToggle === 'function') { eteInclToggle('esub_incluir_chk'); eteInclToggle('easv_incluir_chk') } } catch (e) {}
  try { if (typeof setEstiloInforme === 'function') setEstiloInforme('estandar') } catch (e) {}
  try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
  const inf = String((document.getElementById('informe_texto') || {}).value || '');
  const suma = String((document.getElementById('en_suma') || {}).value || '');
  o.infLargo = inf.length;
  o.papelSinGuia = inf.indexOf('ESC 2020') < 0;
  o.papelSinSeg = inf.indexOf('Seguimiento ecocardiográfico') < 0 && inf.indexOf('Derivación a cirugía') < 0;
  o.sumaUnaLinea = suma.split('\\n').filter(l => l.indexOf('Estenosis subaórtica') >= 0).length;
  /* 5 - EL PANEL DE EVIDENCIA, maximizado. */
  try { if (typeof indicAbrir === 'function') indicAbrir() } catch (e) {}
  const mx = document.getElementById('indic-max'); if (mx) mx.click();
  const cu = document.getElementById('indic-cuerpo');
  o.panelW = cu ? Math.round(cu.getBoundingClientRect().width) : -1;
  let nSec = 0, nBtn = 0, btnTam = {}, nCols = 0;
  if (cu) { cu.querySelectorAll('details').forEach(d => {
      const su = d.querySelector('summary'); if (!su) return;
      const t = su.textContent.trim();
      if (t.indexOf('Estenosis subaórtica') < 0 && t.indexOf('Estenosis supravalvular') < 0) return;
      nSec++; d.open = true;
      Array.prototype.slice.call(d.querySelectorAll('button')).forEach(b => {
        const x = b.textContent.trim();
        if (x !== 'Sí' && x !== 'No' && x !== '?') return;
        nBtn++; const q = b.getBoundingClientRect();
        btnTam[Math.round(q.width) + 'x' + Math.round(q.height)] = 1;
      });
      const gr = d.querySelector('[data-ind-pregcols="1"]');
      if (gr) { const f = {}; gr.querySelectorAll('tr').forEach(c => { const q = c.getBoundingClientRect();
        if (q.width <= 0) return; const kk = Math.round(q.top); f[kk] = (f[kk] || 0) + 1 });
        const v = Object.values(f); nCols = Math.max(nCols, v.length ? Math.max.apply(null, v) : 0) }
    }); }
  o.evidSecs = nSec; o.evidBtn = nBtn; o.evidTam = Object.keys(btnTam).sort(); o.evidCols = nCols;
  try { if (typeof indicCerrar === 'function') indicCerrar() } catch (e) {}
  /* 6 - HIGIENE. */
  o.scrollX = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  let rec = 0;
  document.querySelectorAll('#sacc-cc-esub label, #sacc-cc-esub span, #sacc-cc-easv label, #sacc-cc-easv span').forEach(e => {
    if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0) rec++ });
  o.recortados = rec;
  return o;
})()`;

const out = { file: FILE, cruces: [] };
for (const motor of ['chromium', 'webkit']) {
  let br = null;
  try { br = await (motor === 'chromium' ? _pw.chromium.launch({ channel: 'chrome' }) : _pw.webkit.launch()) }
  catch (e) { out.cruces.push({ motor, err: String(e).slice(0, 160) }); continue }
  for (const w of ANCHOS) for (const tema of TEMAS) {
    const ctx = await br.newContext({ viewport: { width: w, height: 900 } });
    const pg = await ctx.newPage();
    const errC = [], errP = [];
    pg.on('console', m => { if (m.type() === 'error') errC.push(m.text().slice(0, 120)) });
    pg.on('pageerror', e => errP.push(String(e).slice(0, 120)));
    let r = null;
    try { await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
      await pg.waitForTimeout(900);
      r = await pg.evaluate(MEDIR(tema));
    } catch (e) { r = { err: String(e).slice(0, 160) } }
    out.cruces.push({ motor, ancho: w, tema, ...r, errConsola: errC.length, errPagina: errP.length,
                      errDet: errP.slice(0, 2) });
    await ctx.close();
  }
  await br.close();
}
fs.writeFileSync(OUTF, JSON.stringify(out, null, 1));
console.log('escrito ' + OUTF + ' (' + out.cruces.length + ' cruces)');
