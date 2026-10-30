#!/usr/bin/env node
/**
 * _probe_cordemo.mjs - la COMPARACION OBLIGATORIA del commit 6 (6b, 2026-10-30).
 *
 * Abre la demo aprobada y la app con los MISMOS datos en seis escenas y compara, POR
 * GEOMETRIA, los elementos homologos. Los dos dibujos usan el MISMO viewBox -0 0 340 350-, asi
 * que las coordenadas de usuario son directamente comparables y no hace falta escalar: eso se
 * VERIFICA al abrir y se aborta si no coinciden.
 *
 * ⚠️ NO SE COMPARAN PIXELES DE IMAGEN. Los dos documentos tienen tipografias y temas distintos,
 * asi que una diferencia de antialiasing se leeria como una diferencia de dibujo. Lo que se
 * compara es el getBBox de cada elemento homologo, que es geometria pura.
 *
 * ⚠️ EL getBBox DE UN ELEMENTO EN UN <defs> O CON display:none DA 0x0, asi que cada medicion
 * declara si el elemento EXISTE: sin eso, «0 de diferencia» entre dos ausencias se lee igual
 * que una coincidencia.
 *
 * Guarda capturas lado a lado en el directorio que se le pase con --shots.
 *
 *   node scripts/_probe_cordemo.mjs --file <app> --demo <demo> --out <json> --shots <dir>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const APP  = arg('--file') || (RAIZ + '/index.html');
const DEMO = arg('--demo') || (RAIZ + '/docs/3d/demo_orejuela_esquema_aprobado.html');
const OUTF = arg('--out') || '/tmp/cor/demo.json';
const SHOT = arg('--shots') || '/tmp/cor/shots';
fs.mkdirSync(SHOT, { recursive: true });

/* Las seis escenas que la orden pide: las cuatro formas, contraste severo con trombo, y la
   insuficiencia mitral severa. La clave de forma de la app y la de la demo NO son la misma
   cadena -la app guarda `veleta` y la demo usa `viento`-, asi que cada escena las declara. */
const ESC = [
  { k: 'forma_viento',  app: 'veleta',   demo: 'viento',  sec: '',       thr: '',  im: '' },
  { k: 'forma_ala',     app: 'ala',      demo: 'ala',     sec: '',       thr: '',  im: '' },
  { k: 'forma_coli',    app: 'coliflor', demo: 'brocoli', sec: '',       thr: '',  im: '' },
  { k: 'forma_cactus',  app: 'cactus',   demo: 'cactus',  sec: '',       thr: '',  im: '' },
  { k: 'sec_trombo',    app: 'cactus',   demo: 'cactus',  sec: 'severo', thr: 'si', im: '' },
  { k: 'im_severa',     app: 'veleta',   demo: 'viento',  sec: '',       thr: '',  im: 'severa' }
];

/* ── LA DEMO ─────────────────────────────────────────────────────────────────────────────── */
const MD = `(async (e) => {
  const $ = (i) => document.getElementById(i);
  /* ⚠️ EL BOTON DE FORMA SE DEJO DE APRETAR, Y ESO ERA UN ARTEFACTO DE ESTA SONDA. Clickear el
     que YA estaba apretado devolvia la demo a su forma de fabrica: en la escena «sec_trombo»,
     que viene despues de «forma_cactus», la demo medida era «manga de viento» -dos paths de
     silueta en vez de seis- y la diferencia de 13 px que eso producia se leia como una
     diferencia del dibujo de la app. Se pone el SELECT, que es idempotente. */
  const ms = $('msel');
  if (ms) { ms.value = e.demo; ms.dispatchEvent(new Event('change', { bubbles: true })); }
  const S = (id, v) => { const el = $(id); if (!el) return 'NO ' + id;
    el.value = v; el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('input', { bubbles: true })); return el.value };
  S('secsel', e.sec === 'severo' ? '3' : '');
  S('thrsel', e.thr === 'si' ? '2' : '');
  S('imsel', e.im === 'severa' ? '3' : '');
  S('f_o', '26'); S('f_d', '37'); S('f_v', '18');
  await new Promise(r => setTimeout(r, 700));
  const svg = $('ms');
  const bb = (el) => { if (!el) return null;
    try { const b = el.getBBox(); return [Math.round(b.x*10)/10, Math.round(b.y*10)/10,
                                          Math.round(b.width*10)/10, Math.round(b.height*10)/10] }
    catch (x) { return 'EXC' } };
  const porD = (pref) => { const ps = [].slice.call(svg.querySelectorAll('path'));
    const m = ps.filter(p => (p.getAttribute('d') || '').indexOf(pref) === 0)[0];
    return bb(m) };
  const union = (els) => { let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9,n=0;
    els.forEach(el => { const b = bb(el); if (!b || b === 'EXC' || (!b[2] && !b[3])) return;
      n++; x0=Math.min(x0,b[0]); y0=Math.min(y0,b[1]); x1=Math.max(x1,b[0]+b[2]); y1=Math.max(y1,b[1]+b[3]) });
    return n ? [Math.round(x0*10)/10, Math.round(y0*10)/10, Math.round((x1-x0)*10)/10, Math.round((y1-y0)*10)/10, n] : null };
  return {
    viewBox: svg.getAttribute('viewBox'),
    ai:   porD('M16 70'),
    vpsi: bb(svg.querySelector('ellipse.vs')),
    orejuela: union([].slice.call($('laa').querySelectorAll('path'))),
    ostium:   bb($('o_line')),
    prof:     bb($('d_line')),
    trombo:   union([].slice.call($('thr').querySelectorAll('path'))),
    sec:      union([].slice.call($('sec').querySelectorAll('circle'))),
    /* ⚠️ EL CHORRO NO SE COMPARA POR SU CAJA. Las dos paginas animan por su cuenta, asi que la
       caja depende del INSTANTE: la escala vertical es la fraccion sistolica de ese cuadro. Lo
       que se compara es la FORMA -el atributo d, que no depende de la fase- y el angulo. */
    chorroD:  ($('mr') || {}).getAttribute ? $('mr').getAttribute('d') : null,
    chorroTr: ($('mr') || {}).getAttribute ? String($('mr').getAttribute('transform') || '').replace(/scale\([^)]*\)/, 'scale(FASE)') : null,
    doppler:  bb(svg.querySelector('rect.bx')),
    vi:       null
  };
})(ESCENA)`;

/* ── LA APP ──────────────────────────────────────────────────────────────────────────────── */
const MA = `(async (e) => {
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = document.getElementById(i); if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (x) {}
  const S = (id, v) => { const el = document.getElementById(id); if (!el) return 'NO ' + id;
    el.value = v; el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true })); return el.value };
  /* ⚠️ HAY QUE ABRIR LA PESTAÑA Y EL ACORDEON, y no alcanza con uno: con la seccion cerrada el
     contenedor no tiene caja, el screenshot falla y getBBox devuelve 0x0 sobre un dibujo que
     SI existe. Es la trampa que este repositorio documenta para showTab y las tarjetas. */
  try { if (typeof showTab === 'function') showTab('ete') } catch (x) {}
  try { const c = document.getElementById('ete-seccion-oai'); if (c) c.style.display = '' } catch (x) {}
  S('oai_morfologia', e.app); S('oai_sec', e.sec); S('oai_trombo', e.thr);
  S('oai_ostium_diam', '26'); S('oai_profundidad', '37'); S('oai_vel_vac', '18');
  if (e.im) { S('im_grado', e.im); try { if (typeof calcIM === 'function') calcIM() } catch (x) {} }
  try { if (typeof oaiEsqPausar === 'function') oaiEsqPausar() } catch (x) {}
  try { if (typeof calcOAI === 'function') calcOAI() } catch (x) {}
  await new Promise(r => setTimeout(r, 700));
  const cont = document.getElementById('oai-esq');
  const svg = cont ? cont.querySelector('svg') : null;
  if (!svg) return { err: 'SIN SVG', cont: !!cont };
  const bb = (el) => { if (!el) return null;
    try { const b = el.getBBox(); return [Math.round(b.x*10)/10, Math.round(b.y*10)/10,
                                          Math.round(b.width*10)/10, Math.round(b.height*10)/10] }
    catch (x) { return 'EXC' } };
  const porD = (pref) => { const ps = [].slice.call(svg.querySelectorAll('path'));
    const m = ps.filter(p => (p.getAttribute('d') || '').indexOf(pref) === 0)[0];
    return bb(m) };
  const union = (els) => { let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9,n=0;
    els.forEach(el => { const b = bb(el); if (!b || b === 'EXC' || (!b[2] && !b[3])) return;
      n++; x0=Math.min(x0,b[0]); y0=Math.min(y0,b[1]); x1=Math.max(x1,b[0]+b[2]); y1=Math.max(y1,b[1]+b[3]) });
    return n ? [Math.round(x0*10)/10, Math.round(y0*10)/10, Math.round((x1-x0)*10)/10, Math.round((y1-y0)*10)/10, n] : null };
  /* Las siluetas se identifican por su «d»: se le pregunta al dueño cuales son, que es lo unico
     que no depende de un orden de dibujo. */
  let sils = [];
  try { sils = _oaiSiluetas(e.app) || [] } catch (x) {}
  const ps = [].slice.call(svg.querySelectorAll('path'));
  const silEls = ps.filter(p => sils.indexOf(p.getAttribute('d')) > -1);
  /* El trombo es el path dentro del grupo con clip-path. */
  const tg = svg.querySelector('g[clip-path]');
  const lineas = [].slice.call(svg.querySelectorAll('line'));
  const ost = lineas.filter(l => l.getAttribute('x1') === '186' && l.getAttribute('y1') === '92')[0];
  const prf = lineas.filter(l => l.getAttribute('stroke-dasharray'))[0];
  return {
    viewBox: svg.getAttribute('viewBox'),
    ai:   porD('M16 70'),
    vpsi: bb(svg.querySelector('ellipse')),
    orejuela: union(silEls),
    ostium:   bb(ost),
    prof:     bb(prf),
    trombo:   tg ? union([].slice.call(tg.querySelectorAll('path'))) : null,
    sec:      union([].slice.call(svg.querySelectorAll('#oai-sec circle'))),
    chorroD:  (document.getElementById('oai-mr') || {}).getAttribute
                ? document.getElementById('oai-mr').getAttribute('d') : null,
    chorroTr: (document.getElementById('oai-mr') || {}).getAttribute
                ? String(document.getElementById('oai-mr').getAttribute('transform') || '').replace(/scale\([^)]*\)/, 'scale(FASE)') : null,
    doppler:  bb(svg.querySelector('rect[x="10"]')),
    /* ⚠️ EL DETECTOR DEL TRIANGULO DEL VI EXCLUYE LAS VALVAS, y la primera version no lo hacia:
       la valva posterior tambien arranca en «M48 164» -las dos se insertan en ese punto del
       anillo-, asi que el triangulo salia «PRESENTE» sobre un dibujo que ya no lo tiene. Se ve
       en que su ancho cambiaba con el grado de la insuficiencia, cosa que un trazo estatico no
       hace. El triangulo real era «M48 164 C60 200 80 226 99 232». */
    vi:       (function () { const ps = [].slice.call(svg.querySelectorAll('path'));
                const m = ps.filter(q => (q.getAttribute('d') || '').indexOf('M48 164 C60 200') === 0)[0];
                return m ? bb(m) : null })()
  };
})(ESCENA)`;

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { app: APP, demo: DEMO, shots: SHOT, escenas: {} };
try {
  const pd = await b.newPage({ viewport: { width: 1200, height: 900 } });
  const pa = await b.newPage({ viewport: { width: 1400, height: 900 } });
  await pd.goto('file://' + DEMO, { waitUntil: 'load', timeout: 120000 });
  await pa.goto('file://' + APP,  { waitUntil: 'load', timeout: 180000 });
  await pa.waitForTimeout(1500);
  for (const e of ESC) {
    /* ⚠️ CADA `evaluate` VA CON RELOJ. `page.evaluate` de Playwright NO tiene timeout: una
       excepcion dentro de un `setTimeout` deja la promesa sin resolver y el proceso queda
       dormido a 0 % de CPU para siempre. Es el cuelgue de una hora y cuarto que la tanda B
       pago, y esta sonda lo repitio en su primera corrida. */
    const reloj = (pr, q) => Promise.race([pr,
      new Promise(r => setTimeout(() => r({ err: 'RELOJ 60 s en ' + q }), 60000))]);
    const D = await reloj(pd.evaluate(MD.replace('ESCENA', JSON.stringify(e))), 'demo ' + e.k);
    const A = await reloj(pa.evaluate(MA.replace('ESCENA', JSON.stringify(e))), 'app ' + e.k);
    const dif = {};
    for (const k of ['chorroD','chorroTr']) {
      dif[k] = (String(D[k]) === String(A[k])) ? 'IGUAL' : 'DISTINTO\n      demo: ' + D[k] + '\n      app : ' + A[k];
    }
    for (const k of ['ai','vpsi','orejuela','ostium','prof','trombo','sec','doppler']) {
      const x = D[k], y = A[k];
      if (!x && !y) { dif[k] = 'AUSENTE EN LOS DOS'; continue }
      if (!x || !y) { dif[k] = 'SOLO EN ' + (x ? 'LA DEMO' : 'LA APP') + ': ' + JSON.stringify(x || y); continue }
      dif[k] = [0,1,2,3].map(i => Math.round((y[i] - x[i]) * 10) / 10);
    }
    dif.vi_triangulo_app = A.vi ? 'PRESENTE ' + JSON.stringify(A.vi) : 'ausente (correcto)';
    dif.viewBox = (D.viewBox === A.viewBox) ? 'igual: ' + D.viewBox : 'DISTINTO ' + D.viewBox + ' vs ' + A.viewBox;
    OUT.escenas[e.k] = { demo: D, app: A, dif };
    try {
      await (await pd.$('#ms')).screenshot({ path: SHOT + '/' + e.k + '_DEMO.png' });
      const c = await pa.$('#oai-esq');
      if (c) await c.screenshot({ path: SHOT + '/' + e.k + '_APP.png' });
    } catch (x) { OUT.escenas[e.k].shotErr = String(x).slice(0, 110) }
    console.log('-- ' + e.k + ' -- ' + JSON.stringify(dif));
  }
  await pd.close(); await pa.close();
} catch (e) { OUT._err = String(e).slice(0, 250) }
try { await b.close() } catch (e) {}
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF + ' | capturas en ' + SHOT);
