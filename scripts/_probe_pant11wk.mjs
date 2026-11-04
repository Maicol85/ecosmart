/* _probe_pant11wk.mjs - los DIECISEIS cruces de la tanda PANT-11 (2026-11-04).
   Dos motores x 1440 / 1000 / 768 / 390 px x dos temas.
   Nombre propio: verificado con ls, no existia.

   ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI, y se declara. Chrome va por el del sistema con
      channel 'chrome': sin eso los cruces salen VACIOS, que en un volcado se lee igual que
      «no hubo diferencias».
   ⚠️ EL AREA TACTIL DE LOS CIRCULITOS NO ES SU RECT: la extiende un ::after absoluto que
      getBoundingClientRect NO ve. Se mide con elementFromPoint en los cinco puntos.
   ⚠️ LOS ACORDEONES NACEN PLEGADOS CON UNA TRANSICION DE 0,3 s: hay que abrirlos por su
      encabezado real y apagarles la animacion antes de medir, o los cinco puntos devuelven el
      encabezado -la trampa que AJ9 y la TANDA NOCTURNA documentan-.

   uso: node scripts/_probe_pant11wk.mjs [--file <index.html>] [--out <json>]
*/
import pkg from '/Users/maicoldossantos/.pwtmp/node_modules/playwright/index.js';
const { chromium, webkit } = pkg;
const fs = await import('fs');
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const OUTF = arg('--out') || '/tmp/wk_pant11.json';

const MEDIR = `(async () => {
  const EL = (id) => document.getElementById(id);
  const NN = (s) => String(s || '').split(String.fromCharCode(10)).join(' ').trim();
  const set = (id, v) => { const e = EL(id); if (!e) return 'NO ' + id; e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return 1; };
  const chk = (id, on) => { const e = EL(id); if (!e) return 'NO ' + id; e.checked = on !== false;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return 1; };
  const abrirAcc = (id) => { const a = EL(id); if (!a) return false;
    const h = a.querySelector('.sacc-hdr');
    if (h && !a.classList.contains('open')) { try { h.click(); } catch (e) {} }
    const b = a.querySelector('.sacc-body');
    if (b) { b.style.transition = 'none'; b.style.maxHeight = 'none'; }
    return true; };
  const abrirSec = (tok) => { const h = [].slice.call(document.querySelectorAll('h2.card-head'))
      .filter(x => String(x.getAttribute('onclick') || '').indexOf("'" + tok + "'") > -1)[0];
    if (h) { try { h.click(); } catch (e) {} } return !!h; };
  const caja = (sel) => { const e = (typeof sel === 'string') ? document.querySelector(sel) : sel;
    if (!e) return null; const g = e.getBoundingClientRect();
    return { w: Math.round(g.width), h: Math.round(g.height), x: Math.round(g.left), y: Math.round(g.top) }; };
  /* Area tactil REAL: el rect mas lo que el ::after extiende, y los cinco puntos. */
  const tactil = (e) => { if (!e) return null;
    try { e.scrollIntoView({ block: 'center' }); } catch (x) {}
    const g = e.getBoundingClientRect();
    const cs = getComputedStyle(e, '::after');
    const num = (v) => { const n = parseFloat(String(v || '0')); return isFinite(n) ? n : 0; };
    const w = g.width + Math.abs(num(cs.left)) + Math.abs(num(cs.right));
    const h = g.height + Math.abs(num(cs.top)) + Math.abs(num(cs.bottom));
    const cx = g.left + g.width / 2, cy = g.top + g.height / 2;
    const pts = [[cx, cy], [cx - w / 2 + 2, cy - h / 2 + 2], [cx + w / 2 - 2, cy - h / 2 + 2],
                 [cx - w / 2 + 2, cy + h / 2 - 2], [cx + w / 2 - 2, cy + h / 2 - 2]];
    const propios = pts.filter(p => { const t = document.elementFromPoint(p[0], p[1]);
      return !!t && (t === e || e.contains(t)); }).length;
    return { w: Math.round(w), h: Math.round(h), propios: propios }; };

  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  const R = {};

  /* ══ 1 · LA CASILLA DE LA VCI ══ */
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true); } catch (e) {}
  set('nombre', 'WK PANT11'); set('ci', '1');
  try { showTab('vd'); } catch (e) {}
  abrirAcc('sacc-ad');
  set('vci_diam', '23'); set('vci_col', '<50');
  R.vciBtn = caja('#vci-no-vis-mk');
  R.vciTac = tactil(EL('vci-no-vis-mk'));
  R.vciLbl = (function () { const l = document.querySelector('.vci-nv-lbl'); return l ? NN(l.textContent) : 'NO'; })();
  R.vciPre = String(EL('vci-no-vis-mk') ? EL('vci-no-vis-mk').getAttribute('aria-pressed') : 'NO');
  try { vciNoVisGesto(); } catch (e) {}
  R.vciOn = String(EL('vci_no_vis') ? EL('vci_no_vis').value : 'NO')
    + '/' + String(EL('vci-no-vis-mk') ? EL('vci-no-vis-mk').getAttribute('aria-pressed') : 'NO');
  R.vciVac = String(EL('vci_diam') ? EL('vci_diam').value : 'NO') + '|' + String(EL('vci_col') ? EL('vci_col').value : 'NO');
  R.vciDis = (function () { const a = EL('vci_diam'), b = EL('vci_col');
    return (a && a.disabled && b && b.disabled) ? 'si' : 'no'; })();
  try { if (typeof generarInforme === 'function') generarInforme(); } catch (e) {}
  R.vciFrase = (function () { const t = NN((EL('informe_texto') || {}).value || '');
    let n = 0, i = 0; while (true) { const k = t.indexOf('No se visualiza la VCI.', i); if (k < 0) break; n++; i = k + 1; }
    return n; })();

  /* ══ 2 · EL TDE Y EL TRIV ══ */
  const celda = (c, r) => document.querySelector('.dm-grid > .dm-c' + c + '.dm-r' + r);
  const campoDe = (e) => { if (!e) return 'NO'; const x = e.querySelector('input[id],select[id],textarea[id]'); return x ? x.id : 'SIN CAMPO'; };
  R.dmCol2 = [1, 2, 3, 4].map(r => campoDe(celda(2, r))).join(',');
  R.dmTab = (function () { const todos = [].slice.call(document.querySelectorAll('.dm-grid input[id],.dm-grid select[id],.dm-grid textarea[id]')).map(e => e.id);
    return (todos.indexOf('triv') >= 0 && todos.indexOf('tde') >= 0 && todos.indexOf('triv') < todos.indexOf('tde')) ? 'triv antes' : 'tde antes'; })();

  /* ══ 3 · LA PROFUNDIDAD DE COAPTACION ══ */
  try { showTab('ete'); } catch (e) {}
  abrirSec('morfo'); abrirSec('teer');
  set('ete_prof_coapt', '12');
  R.coapt = String(EL('teer_prof_flail') ? EL('teer_prof_flail').value : 'NO');

  /* ══ 4 · EL ECO PULMONAR Y SU DIBUJO ══ */
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true); } catch (e) {}
  set('nombre', 'WK PANT11 B'); set('ci', '2');
  try { showTab('pericardio'); } catch (e) {}
  abrirSec('pulmon-avanzado'); abrirSec('pulmon');
  set('pua_derrame', 'si'); set('pua_derrame_der', 'severo'); set('pua_derrame_izq', 'leve');
  set('pua_consol', 'si'); set('pua_consol_lado', 'der');
  R.pulLeg = String(EL('pua_derrame_lado') ? EL('pua_derrame_lado').value : 'NO')
    + '/' + String(EL('pul_derrame_tam') ? EL('pul_derrame_tam').value : 'NO');
  R.pulDib = caja('#pul-dib-svg');
  R.pulFila = (function () { const f = EL('pul-fila'), i = EL('pul-izq'), d = EL('pul-dib-caja');
    if (!f || !i || !d) return 'NO EXISTE';
    const gi = i.getBoundingClientRect(), gd = d.getBoundingClientRect();
    return (gd.left >= gi.right - 2) ? 'al lado' : 'apilado'; })();
  R.pulDesc = (function () { try { return NN(pulDibDescripcion(pulDibEstado())).slice(0, 90); } catch (e) { return 'EXC'; } })();
  R.pulNodos = (function () { const s = EL('pul-dib-svg'); return s ? s.querySelectorAll('*').length : 0; })();

  /* ══ 5 · LAS MASAS EN OTROS ══ */
  try { showTab('otros'); } catch (e) {}
  R.otrPan = ['otr-sub-burbuja', 'otr-sub-variantes', 'otr-sub-masas']
    .map(id => { const e = EL(id); return e && e.parentElement ? e.parentElement.id : 'NO'; }).join(',');
  R.otrHeads = ['otr-sub-burbuja', 'otr-sub-variantes', 'otr-sub-masas']
    .map(id => { const e = EL(id); return e ? e.querySelectorAll('h2.card-head').length : 'NO'; }).join(',');
  (function () { const h = [].slice.call(document.querySelectorAll('#otr-sub-masas h2.card-head'))
      .filter(x => String(x.getAttribute('onclick') || '').indexOf("'masas'") > -1)[0];
    if (h) { try { h.click(); } catch (e) {} }
    const s = EL('ete-seccion-masas'); if (s) s.style.display = 'block'; })();
  set('masa_presente', 'Masa / imagen intracard\\u00edaca presente');
  try { if (typeof showMasaPanel === 'function') showMasaPanel(); } catch (e) {}
  R.masaCampos = ['masa_presente','masa_cavidad','masa_loc','masa_tam_mm','masa_morf','masa_movil','masa_eco','masa_dx','masa_notas']
    .filter(id => { const e = EL(id); if (!e) return true; const p = e.closest('.tab-section');
      return !(p && p.id === 'tab-otros' && e.getBoundingClientRect().width > 0); }).join(',') || 'los nueve';
  R.masaTabla = (function () { const t = document.querySelector('.masa-ref-tabla');
    return t ? (t.querySelectorAll('tbody tr').length + ' filas x ' + t.querySelectorAll('thead th').length + ' col') : 'NO EXISTE'; })();
  R.masaWrap = (function () { const w = document.querySelector('.masa-ref-wrap');
    return w ? getComputedStyle(w).overflowX : 'NO EXISTE'; })();
  R.masaGlobos = ['masa-ref', 'masa-ref-ei'].map(k => {
    const e = document.querySelector('[data-vinfo="' + k + '"]');
    const t = tactil(e); return k + ':' + (t ? (t.w + 'x' + t.h + ':' + t.propios) : 'NO'); }).join(' ');
  R.periTit = (function () { const s = EL('ete-seccion-pericardio-masas');
    const c = s && s.previousElementSibling; const h = c ? c.querySelector('h2.card-head') : null;
    return h ? NN(h.textContent).split(String.fromCharCode(9654))[0].trim() : 'NO'; })();

  /* ══ 6 · LAS DOS FICHAS DE REFERENCIAS ══ */
  try { showTab('refs'); } catch (e) {}
  R.refs = ['ref-tumores', 'ref-embolig'].map(id => { const e = EL(id);
    if (!e) return id + ':NO';
    return id + ':' + (e.closest('#ref-sub-otros') ? 'en otros' : 'FUERA') + ':' + e.querySelectorAll('tr').length + ' tr'; }).join(' | ');
  R.refIndice = (function () { try { const ix = window._refIndiceArmar(true).map(x => String(x.id));
    return ix.length + ' entradas, tumores=' + (ix.indexOf('tumores') >= 0) + ' embolig=' + (ix.indexOf('embolig') >= 0); } catch (e) { return 'EXC'; } })();

  /* ══ 7 · LO GENERAL ══ */
  R.scrollH = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  R.recortados = (function () { const mal = [];
    document.querySelectorAll('div,span,label,td,th,button,h1,h2,h3,p').forEach(e => {
      if (e.id === 'tga-circ-sr') return;
      const g = e.getBoundingClientRect();
      if (g.width < 2 || g.height < 2) return;
      if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflowX === 'hidden') mal.push(e.id || e.className);
    });
    return mal.length; })();
  return R;
})()`;

const cruces = [];
for (const [nom, motor, extra] of [['chrome', chromium, { channel: 'chrome' }], ['webkit', webkit, {}]]) {
  let br;
  try { br = await motor.launch(extra); } catch (e) { cruces.push({ motor: nom, err: 'NO ARRANCA: ' + String(e).slice(0, 90) }); continue; }
  for (const w of [1440, 1000, 768, 390]) {
    for (const tema of ['oscuro', 'claro']) {
      const pg = await br.newPage({ viewport: { width: w, height: 900 } });
      const errsC = [], errsP = [];
      pg.on('console', m => { if (m.type() === 'error') errsC.push(m.text().slice(0, 110)); });
      pg.on('pageerror', e => errsP.push(String(e).slice(0, 110)));
      await pg.goto('file://' + FILE);
      await pg.evaluate(() => { try { sessionStorage.setItem('ett_auth', '1'); } catch (e) {} });
      await pg.reload();
      await pg.waitForTimeout(1600);
      if (tema === 'claro') { await pg.evaluate(() => { document.documentElement.classList.add('light-mode'); }); await pg.waitForTimeout(250); }
      let r;
      try { r = await pg.evaluate(MEDIR); } catch (e) { r = { err: String(e).slice(0, 200) }; }
      r._errC = errsC.length; r._errP = errsP.length;
      r._errCtxt = errsC.slice(0, 2).join(' | '); r._errPtxt = errsP.slice(0, 2).join(' | ');
      cruces.push({ motor: nom, ancho: w, tema: tema, r: r });
      console.log('-- ' + nom + ' ' + w + 'px ' + tema + ' -> scrollH=' + r.scrollH + ' recortados=' + r.recortados + ' errP=' + r._errP);
      await pg.close();
    }
  }
  await br.close();
}
fs.writeFileSync(OUTF, JSON.stringify(cruces, null, 1));
console.log('escrito: ' + OUTF + ' (' + cruces.length + ' cruces)');
process.exit(0);
