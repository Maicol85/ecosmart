#!/usr/bin/env node
/**
 * _probe_pant29ref.mjs - verificacion de los commits 2 y 3 de PANT-29 (2026-11-10).
 * Corre sobre UN arbol (`--file`) y se usa en SERIE sobre los dos: la copia de HEAD
 * (`_p29head.html`, dentro del proyecto porque las fuentes se cargan por ruta relativa) y el
 * arbol vivo. Mide, con el GESTO REAL:
 *   - los cinco resumenes de `ref-miocard` que ya existian, caracter por caracter;
 *   - los dos resumenes NUEVOS, con su extension y sus vinietas;
 *   - `ref-coronarias` y el globo `otr-rac` ABIERTO con su boton real (acordeon «variantes»
 *     abierto primero, o el boton mide 0x0 y la tarjeta no abre);
 *   - que las fichas grandes NO existen, ni en pantalla, ni en el reparto, ni en el buscador;
 *   - los tres conteos (encabezados, REF_SUBTAB, indice) y las palabras prohibidas.
 * SOLO LECTURA sobre el estudio: no escribe un campo.
 * Nombre propio: verificado con ls, no existia.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              process.env.HOME + '/.pwtmp/node_modules/playwright-core/index.js', 'playwright'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.error('sin playwright'); process.exit(2) }
const { chromium } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
/* ⚠️ «pendiente» suelto NO esta en la lista: es palabra legitima de un dato clinico. Se vigilan
   las formas que la regla del 08/11 prohibe. */
const PROH = ['pendiente de revis', 'sin fuente', 'proximamente', 'próximamente',
              'no se encontro', 'no se encontró', 'ninguna fuente publica', 'sin validar',
              'a confirmar', 'sin dato suficiente', 'no coinciden', 'discrepan',
              'se contradicen', 'difieren'];
const errs = [];
const navegador = await chromium.launch({ channel: 'chrome' });
const ctx = await navegador.newContext({ viewport: { width: 1440, height: 980 } });
const pg = await ctx.newPage();
pg.on('console', m => { if (m.type() === 'error') errs.push('consola: ' + m.text().slice(0, 140)) });
pg.on('pageerror', e => errs.push('pagina: ' + String(e).slice(0, 140)));
await pg.goto('file://' + FILE);
await pg.waitForTimeout(2600);
await pg.addStyleTag({ content: '*{transition:none !important;animation:none !important}' });

const R = await pg.evaluate(({ PROH }) => {
  const o = { pasos: [] };
  const norm = s => String(s || '').replace(/\s+/g, ' ').trim();
  const clic = el => { if (!el) return false; el.click(); return true };
  const bot = Array.prototype.slice.call(document.querySelectorAll('button,[onclick]'));
  const porOnclick = t => bot.filter(b => ((b.getAttribute('onclick') || '').indexOf(t) > -1))[0] || null;
  const cabDe = id => {
    const hs = document.querySelectorAll('h2.card-head');
    for (let i = 0; i < hs.length; i++)
      if ((hs[i].getAttribute('onclick') || '').indexOf("toggleRef('" + id + "'") >= 0) return hs[i];
    return null;
  };
  /* ── 1 · la pestania y la solapa, por el gesto real ─────────────────── */
  const bRefs = porOnclick("'refs'");
  o.pasos.push('boton Referencias: ' + (bRefs ? 'si' : 'NO'));
  if (bRefs) clic(bRefs); else if (window.showTab) showTab('refs');

  /* ── 2 · conteos ─────────────────────────────────────────────────────── */
  o.cabezas = (typeof REF_SUB_ORDEN !== 'undefined' ? REF_SUB_ORDEN : []).reduce(function (n, sub) {
    const pan = document.getElementById('ref-sub-' + sub);
    return n + (pan ? pan.querySelectorAll('h2.card-head[onclick*="toggleRef("]').length : 0);
  }, 0);
  o.reparto = (typeof REF_SUBTAB !== 'undefined')
    ? Object.keys(REF_SUBTAB).reduce((a, k) => a + REF_SUBTAB[k].length, 0) : null;
  o.enReparto = (typeof REF_SUBTAB !== 'undefined')
    ? Object.keys(REF_SUBTAB).reduce((a, k) => a.concat(REF_SUBTAB[k]), []) : [];
  o.idx = null;
  try { o.idx = window._refIndiceArmar(true).length } catch (e) { o.idx = 'EXC' }
  o.idxIds = (typeof _refIndice !== 'undefined' && _refIndice) ? _refIndice.map(e => e.id) : [];

  /* ── 3 · las fichas grandes: existen o no ────────────────────────────── */
  o.grandes = {};
  ['atleta', 'chagas', 'racong'].forEach(id => {
    o.grandes[id] = {
      cuerpo: !!document.getElementById('ref-' + id),
      cabeza: !!cabDe(id),
      enReparto: o.enReparto.indexOf(id) > -1,
      enIndice: o.idxIds.indexOf(id) > -1
    };
  });

  /* ── 4 · ref-miocard, hijo por hijo ──────────────────────────────────── */
  const sbO = document.getElementById('ref-subtab-otros'); if (sbO) clic(sbO);
  const mio = document.getElementById('ref-miocard');
  const cabM = cabDe('miocard');
  o.miocardNaceCerrada = mio ? getComputedStyle(mio).display === 'none' : null;
  if (cabM) clic(cabM);
  o.miocardAbierta = mio ? getComputedStyle(mio).display !== 'none' : null;
  o.miocardChars = mio ? norm(mio.textContent).length : null;
  o.miocardHijos = mio ? Array.prototype.slice.call(mio.children).map(ch => ({
    tag: ch.tagName, estilo: ch.getAttribute('style') || '',
    chars: norm(ch.textContent).length, vin: (ch.textContent || '').split('•').length - 1,
    txt: norm(ch.textContent)
  })) : [];
  /* Los dos resumenes nuevos, por su titulo */
  o.resumenes = {};
  ['Coraz', 'chag'].forEach(function (pat) { });
  (function () {
    const h = o.miocardHijos;
    for (let i = 0; i < h.length; i++) {
      if (h[i].txt.indexOf('Coraz') === 0 && h[i].txt.indexOf('atleta') > -1)
        o.resumenes.atleta = { tit: h[i].txt, chars: h[i].chars + (h[i + 1] ? h[i + 1].chars : 0),
                               vin: h[i + 1] ? h[i + 1].vin : 0, cuerpo: h[i + 1] ? h[i + 1].txt : null };
      if (h[i].txt.indexOf('Miocardiopat') === 0 && h[i].txt.indexOf('chag') > -1 && h[i].chars < 40)
        o.resumenes.chagas = { tit: h[i].txt, chars: h[i].chars + (h[i + 1] ? h[i + 1].chars : 0),
                               vin: h[i + 1] ? h[i + 1].vin : 0, cuerpo: h[i + 1] ? h[i + 1].txt : null };
    }
  })();
  if (cabM) clic(cabM);

  /* ── 5 · ref-coronarias ──────────────────────────────────────────────── */
  const sbC = document.getElementById('ref-subtab-congenitas'); if (sbC) clic(sbC);
  const cor = document.getElementById('ref-coronarias'), cabC = cabDe('coronarias');
  if (cabC) clic(cabC);
  o.coronarias = cor ? { chars: norm(cor.textContent).length, hijos: cor.children.length,
                         txt: norm(cor.textContent),
                         det: Array.prototype.slice.call(cor.children).map(c => ({
                           chars: norm(c.textContent).length, marca: c.getAttribute('data-ref-solo'),
                           ini: norm(c.textContent).slice(0, 50) })) } : null;
  if (cabC) clic(cabC);

  /* ── 6 · el globo otr-rac, con el acordeon abierto ───────────────────── */
  const bOtros = porOnclick("'otros'");
  if (bOtros) clic(bOtros); else if (window.showTab) showTab('otros');
  const cabVar = Array.prototype.slice.call(document.querySelectorAll('h2.card-head'))
    .filter(h => (h.getAttribute('onclick') || '').indexOf("'variantes'") > -1)[0];
  o.pasos.push('acordeon variantes: ' + (cabVar ? 'si' : 'NO'));
  if (cabVar) clic(cabVar);
  const bg = document.querySelector('[data-vinfo="otr-rac"]');
  o.globo = { existe: !!bg };
  if (bg) {
    const rb = bg.getBoundingClientRect();
    o.globo.caja = Math.round(rb.width) + 'x' + Math.round(rb.height);
    bg.scrollIntoView({ block: 'center' });
    bg.click();
    const c = document.getElementById('vinfo-card');
    o.globo.pantalla = c ? norm(c.textContent).length : null;
    o.globo.txt = c ? norm(c.textContent) : null;
    bg.click();
  }
  o.globo.clon = window._otrRefClon
    ? norm(window._otrRefClon('ref-coronarias').textContent).length : null;

  /* ── 7 · palabras prohibidas en lo nuevo ─────────────────────────────── */
  const zona = [o.resumenes.atleta, o.resumenes.chagas].filter(Boolean)
    .map(r => (r.tit + ' ' + (r.cuerpo || '')).toLowerCase()).join(' ')
    + ' ' + String(o.coronarias ? o.coronarias.txt : '').toLowerCase();
  o.prohibidas = PROH.filter(p => zona.indexOf(p) > -1);
  return o;
}, { PROH });

/* ── 8 · el buscador, con el gesto real ─────────────────────────────────── */
async function buscar(q) {
  return await pg.evaluate((q) => {
    const inp = document.getElementById('ref-busca');
    if (!inp) return { err: 'sin campo' };
    inp.value = q;
    inp.dispatchEvent(new Event('input', { bubbles: true }));
    const cont = document.getElementById('ref-busca-res') || document.getElementById('ref-resultados');
    const txt = cont ? (cont.textContent || '').replace(/\s+/g, ' ').trim() : '';
    let n = 0;
    try { n = window._refIndiceArmar().filter(function (e) {
      const nn = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      return nn(e.txt).indexOf(nn(q)) > -1; }).length } catch (e) { n = -1 }
    return { n: n, txt: txt.slice(0, 200) };
  }, q);
}
const BUS = {};
for (const q of ['desentrenamiento', 'Rassi', 'benznidazol', 'Takeuchi', 'intraconal',
                 'interarterial', 'zzqqxx']) BUS[q] = await buscar(q);

console.log(JSON.stringify({ file: FILE, R, BUS, errs }, null, 1));
await navegador.close();
process.exit(0);
