#!/usr/bin/env node
/**
 * _probe_pant29motores.mjs - tanda PANT-27. SOLO LECTURA.
 * Nombre propio: verificado con ls, no existia.
 * Mide las TRES superficies que esta tanda toca en los DIECISEIS cruces: dos motores
 * -Chrome del sistema y WebKit de Playwright- por 1440, 1000, 768 y 390 px, por tema dia y
 * noche. Por cruce registra:
 *   · las SIETE frases de la estenosis mitral presentes en el detalle plegado,
 *   · la fila de Fontan con la frase nueva y SIN el rotulo huerfano,
 *   · el globo tavi-calc abierto por su boton, con la caja del boton y el largo de la tarjeta,
 *   · el bloque del reverso de la ficha ref-ia con sus cuatro frases,
 *   · desplazamiento horizontal del cuerpo, textos recortados y errores de consola y de pagina.
 * DENOMINADOR: cada cruce declara si cada pieza se encontro; una pieza ausente se DICE.
 * ⚠️ WebKit de Playwright NO es Safari, y se declara.
 * No escribe nada en el proyecto.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium, webkit } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/claude-501/mot_pant29.json';

const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['dia', 'noche'];
const SIETE = ['DA', 'D', 'Cx', 'MO', 'CD', 'DP', 'PL'];

/* ⚠️ DENOMINADOR EN CADA CRUCE: sin DDVI ni VDFVI el pintor del 3D escribe el mensaje y devuelve
   CERO poligonos, asi que todo daria «igual» sobre un canvas en blanco. Se siembran los cuatro
   campos y se confirma que `lv3dDiag().abierto` y que hay trazos antes de medir. */
const CUERPO = (pg, datos) => pg.evaluate(({ SIETE }) => {
  const O = { pasos: [] };
  const norm = s => String(s || '').replace(/\s+/g, ' ').trim();
  const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
                       return { w: Math.round(r.width), h: Math.round(r.height) } };
  const bot = Array.prototype.slice.call(document.querySelectorAll('button,[onclick]'));
  const porOnclick = t => bot.filter(b => ((b.getAttribute('onclick') || '').indexOf(t) > -1))[0] || null;
  const recortados = (sel) => Array.prototype.slice.call(document.querySelectorAll(sel + ' *'))
    .filter(e => !e.children.length && e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1).length;

  /* ── 1 · REFERENCIAS: los dos resumenes y la ficha ampliada ──────────── */
  const bRefs = porOnclick("'refs'");
  if (bRefs) bRefs.click(); else if (window.showTab) showTab('refs');
  const cabDe = id => { const hs = document.querySelectorAll('h2.card-head');
    for (let i = 0; i < hs.length; i++)
      if ((hs[i].getAttribute('onclick') || '').indexOf("toggleRef('" + id + "'") >= 0) return hs[i];
    return null };
  const sbO = document.getElementById('ref-subtab-otros'); if (sbO) sbO.click();
  const mio = document.getElementById('ref-miocard'), cabM = cabDe('miocard');
  if (cabM) cabM.click();
  O.miocardHijos = mio ? mio.children.length : null;
  O.miocardVisibles = mio ? Array.prototype.slice.call(mio.children)
    .filter(e => getComputedStyle(e).display !== 'none').length : null;
  O.miocardChars = mio ? norm(mio.textContent).length : null;
  O.refRecortados = recortados('#ref-miocard');
  if (cabM) cabM.click();
  const sbC = document.getElementById('ref-subtab-congenitas'); if (sbC) sbC.click();
  const cor = document.getElementById('ref-coronarias'), cabC = cabDe('coronarias');
  if (cabC) cabC.click();
  O.corHijos = cor ? cor.children.length : null;
  O.corChars = cor ? norm(cor.textContent).length : null;
  O.corRecortados = recortados('#ref-coronarias');
  if (cabC) cabC.click();
  O.grandes = ['atleta', 'chagas', 'racong'].filter(k => !!document.getElementById('ref-' + k));
  O.cabezas = (typeof REF_SUB_ORDEN !== 'undefined' ? REF_SUB_ORDEN : []).reduce(function (n, sub) {
    const pan = document.getElementById('ref-sub-' + sub);
    return n + (pan ? pan.querySelectorAll('h2.card-head[onclick*="toggleRef("]').length : 0) }, 0);

  /* ── 2 · CONTRACTILIDAD: las dos tarjetas y el bloque ────────────────── */
  const bC = porOnclick("'contractilidad'");
  if (bC) bC.click(); else if (window.showTab) showTab('contractilidad');
  const sem = (id, v) => { const e = document.getElementById(id); if (!e) return false;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return true };
  O.sembrado = ['ddfvi', 'vdfvi', 'vsfvi', 'fevi'].map((k, i) => sem(k, ['58','140','56','60'][i])).join(',');
  try { if (typeof calcVI === 'function') calcVI() } catch (e) {}
  if (typeof contrSetSegmento === 'function' && typeof LV3D_SEG_ID !== 'undefined') {
    for (let s = 1; s <= 17; s++) contrSetSegmento(LV3D_SEG_ID[s], 0);
    [1, 7, 13].forEach(s => contrSetSegmento(LV3D_SEG_ID[s], 1));
  }
  O.cerrado = { hall: caja(document.getElementById('lv3d-bloque-hallazgos')),
                bot: caja(document.getElementById('lv3d-bloque-botones')),
                cols: (function () { const f = document.getElementById('lv3d-fila');
                  return f ? getComputedStyle(f).gridTemplateColumns : null })(),
                pad: (function () { const e = document.getElementById('lv3d-bloque-hallazgos');
                  return e ? getComputedStyle(e).padding : null })() };
  const li = document.getElementById('contr-arterias-li');
  O.bloque = li ? Array.prototype.slice.call(li.children).map(d => norm(d.textContent)) : null;
  O.bloqueVisible = li ? (getComputedStyle(li).display !== 'none' && !!li.offsetParent) : null;
  O.hallazgos = norm((document.getElementById('contr-texto-informe') || {}).textContent).length;

  /* ── 3 · EL 3D Y EL PANEL DE CORONARIAS ─────────────────────────────── */
  const b3d = document.getElementById('lv3d-btn');
  if (b3d) b3d.click();
  O.diag = window.lv3dDiag ? window.lv3dDiag() : null;
  O.abierto = { hall: caja(document.getElementById('lv3d-bloque-hallazgos')),
                bot: caja(document.getElementById('lv3d-bloque-botones')),
                lienzo: caja(document.getElementById('lv3d-lienzo')),
                colDer: caja(document.getElementById('lv3d-col-der')),
                cols: (function () { const f = document.getElementById('lv3d-fila');
                  return f ? getComputedStyle(f).gridTemplateColumns : null })() };
  O.nVista = document.querySelectorAll('#lv3d-panel .lv3d-vista').length;
  const cb = document.querySelector('#lv3d-panel .lv3d-coro-btn');
  O.coroApagado = window.lv3dCoroDiag ? window.lv3dCoroDiag() : null;
  O.panelOculto = (function () { const e = document.getElementById('lv3d-coro-panel');
    return e ? getComputedStyle(e).display === 'none' : null })();
  if (cb) cb.click();
  O.coroPrendido = window.lv3dCoroDiag ? window.lv3dCoroDiag() : null;
  O.panel = caja(document.getElementById('lv3d-coro-panel'));
  O.colDerOn = caja(document.getElementById('lv3d-col-der'));
  O.lienzoOn = caja(document.getElementById('lv3d-lienzo'));
  O.pieVisible = (function () { const e = document.getElementById('lv3d-coro-pie');
    return e ? getComputedStyle(e).display !== 'none' : null })();
  O.letras = (window.lv3dCoroSonda ? window.lv3dCoroSonda(0).letras : null);
  O.letrasOk = O.letras ? (O.letras.join(',') === SIETE.join(',')) : null;
  O.trazos = (window.lv3dCoroSonda ? window.lv3dCoroSonda(0).segs : null);
  O.altos = Array.prototype.slice.call(document.querySelectorAll(
    '#lv3d-panel .lv3d-coro-btn, #lv3d-coro-panel .lv3d-coro-vista-btn, #lv3d-coro-panel .lv3d-coro-dom, #lv3d-coro-panel .lv3d-coro-transp, #lv3d-coro-panel .lv3d-coro-letras'))
    .map(b => Math.round(b.getBoundingClientRect().height));
  O.altos44 = O.altos.length > 0 && O.altos.every(h => h >= 44);
  /* la lista desplegable abierta: tiene que caber y no desbordar la pagina */
  const vb = document.querySelector('.lv3d-coro-vista-btn'); if (vb) vb.click();
  O.lista = caja(document.getElementById('lv3d-coro-lista'));
  O.listaDentro = (function () { const e = document.getElementById('lv3d-coro-lista');
    if (!e) return null; const r = e.getBoundingClientRect();
    return r.left >= -1 && r.right <= window.innerWidth + 1 })();
  if (vb) vb.click();
  O.recortados3d = recortados('#lv3d-fila');
  O.scrollH = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  if (cb) cb.click();
  if (b3d) b3d.click();
  return O;
}, datos);

const R = { cruces: {}, nota: 'WebKit de Playwright NO es Safari, y se declara.' };
for (const motor of ['chrome', 'webkit']) {
  const br = (motor === 'chrome')
    ? await chromium.launch({ channel: 'chrome', headless: true })
    : await webkit.launch({ headless: true });
  for (const w of ANCHOS) {
    for (const tema of TEMAS) {
      const clave = motor + '-' + w + '-' + tema;
      const pg = await br.newPage({ viewport: { width: w, height: 900 },
                                    colorScheme: (tema === 'noche') ? 'dark' : 'light' });
      const errs = [];
      pg.on('pageerror', e => errs.push('page: ' + String(e).slice(0, 110)));
      pg.on('console', m => { if (m.type() === 'error') errs.push('con: ' + m.text().slice(0, 110)) });
      try {
        await pg.goto('file://' + FILE);
        await pg.waitForTimeout(1100);
        await pg.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
        const o = await CUERPO(pg, { SIETE });
        o.errores = errs;
        R.cruces[clave] = o;
      } catch (e) { R.cruces[clave] = { err: String(e.message).slice(0, 140), errores: errs } }
      await pg.close();
    }
  }
  await br.close();
}
fs.writeFileSync(OUTF, JSON.stringify(R, null, 1));
console.log('escrito ' + OUTF);
process.exit(0);
