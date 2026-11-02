#!/usr/bin/env node
/**
 * _probe_valppt_demo.mjs - la comparacion OBLIGATORIA con la demo v9 de los TRES SIMBOLOS
 * NUEVOS (VAL-PPT, commit 4): plastia, TEER y TAVI.
 *
 * Calcado de `_probe_popc_demo.mjs`, que ya hizo esto con la mecanica y la biologica.
 * NO compara pixeles: dos motores dan pixeles distintos con el mismo SVG. Corre `valveGeo` de
 * la DEMO y las piezas de la APP con los MISMOS datos y compara NUMERO por numero.
 *
 * La demo es docs/3d/demo_posoperatorio_v9_concepto.html, un dibujo del medico que la orden
 * autoriza expresamente a copiar para estos tres simbolos. Su `valveGeo` y su `openFrac` se
 * EXTRAEN por marcas literales -exigiendo que cada una aparezca UNA sola vez, asi que si la
 * demo cambia la extraccion falla ruidosamente- y se evaluan en una pagina EN BLANCO.
 *
 * Lo que se compara, por tipo:
 *   plastia -> la ruta del semicirculo del anillo y los dos velos nativos
 *   TEER    -> el radio del circulo, los DOS orificios (cy, ry y opacidad por fase), el clip
 *              y los dos velos cortos que van al clip
 *   TAVI    -> el rectangulo del stent, la ruta de la malla y los dos velos del tejido
 *
 *   node scripts/_probe_valppt_demo.mjs [--file <html>] [--demo <html>]
 */
import fs from 'fs';
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const FILE = arg('--file') || RAIZ + '/index.html';
const DEMO = arg('--demo') || RAIZ + '/docs/3d/demo_posoperatorio_v9_concepto.html';
const TOL = 5e-3;   /* la app redondea a dos decimales y la demo deja el crudo: medio ulp */

const src = fs.readFileSync(DEMO, 'utf8');
function saca(nombre) {
  const marca = 'function ' + nombre + '(';
  const n = src.split(marca).length - 1;
  if (n !== 1) { console.log('ABORTA: "' + marca + '" aparece ' + n + ' veces en la demo (se esperaba 1)'); process.exit(1) }
  const i = src.indexOf(marca);
  let j = src.indexOf('{', i), d = 0, k = j;
  for (; k < src.length; k++) { if (src[k] === '{') d++; else if (src[k] === '}') { d--; if (d === 0) break } }
  return src.slice(i, k + 1);
}
const DEMO_VALVEGEO = saca('valveGeo');
const DEMO_OPENFRAC = saca('openFrac');

const TIPOS = [['pla', 'plastia'], ['teer', 'TEER'], ['tavi', 'TAVI']];
const FASES = [0, 0.1, 0.17, 0.25, 0.34, 0.35, 0.4, 0.5, 0.67, 0.94, 0.95];
const VALV = [['ao', 'Ao'], ['pu', 'Pu'], ['mi', 'Mi'], ['tr', 'Tr']];

(async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome', headless: true });
  /* 1 - la demo, en una pagina EN BLANCO */
  const pd = await b.newPage();
  await pd.goto('about:blank');
  await pd.addScriptTag({ content: DEMO_VALVEGEO + '\n' + DEMO_OPENFRAC
    + '\nwindow.__vg=valveGeo;window.__of=openFrac;' });
  const demo = await pd.evaluate(({ TIPOS, FASES, VALV }) => {
    const out = {};
    for (const [t] of TIPOS) for (const [, dk] of VALV) for (const ph of FASES) {
      const a = window.__of(dk, ph);
      out[t + '|' + dk + '|' + ph] = { a: a, html: window.__vg(t, a) };
    }
    return out;
  }, { TIPOS, FASES, VALV });
  await pd.close();

  /* 2 - la app: sus piezas con los mismos datos */
  const pa = await b.newPage();
  const errs = [];
  pa.on('pageerror', e => errs.push('PAGE ' + e.message));
  await pa.goto('file://' + FILE);
  await pa.waitForTimeout(2500);
  const app = await pa.evaluate(({ TIPOS, FASES, VALV }) => {
    const out = { falta: [] };
    if (typeof _popValvVelos !== 'function') out.falta.push('_popValvVelos');
    if (typeof _popValvApertura !== 'function') out.falta.push('_popValvApertura');
    if (typeof _popValvOrificios !== 'function') out.falta.push('_popValvOrificios');
    if (out.falta.length) return out;
    for (const [t] of TIPOS) for (const [ak, dk] of VALV) for (const ph of FASES) {
      const a = _popValvApertura(ak, ph);
      out[t + '|' + dk + '|' + ph] = { a: a,
        /* El segundo argumento es el MODO, no un booleano: con \ llegaba            y caia en la rama de la biologica, asi que la sonda comparaba la curva equivocada
           contra la recta de la demo. Bug de la sonda, no de la app. */
        velos: _popValvVelos(a, t === 'teer' ? 'teer' : t === 'tavi' ? 'tavi' : false),
        ori: (t === 'teer') ? _popValvOrificios(a) : null };
    }
    /* Las piezas ESTATICAS, leidas del DOM REAL que el montaje construye: no de un literal
       repetido en la sonda. Se busca el grupo de una valvula cualquiera. */
    const G = document.querySelector('[data-pop-esq="valv-mi"]');
    out.piezas = G ? {
      aro:    (G.querySelector('path[d^="M-10 0A10"]') || {}).getAttribute
              ? G.querySelector('path[d^="M-10 0A10"]').getAttribute('d') : null,
      stent:  (function(){ const r = G.querySelector('rect[width="18"]');
                return r ? [r.getAttribute('x'), r.getAttribute('y'), r.getAttribute('width'),
                            r.getAttribute('height'), r.getAttribute('rx')].join(' ') : null })(),
      malla:  (function(){ const m = Array.prototype.filter.call(G.querySelectorAll('path'),
                 x => /^M-9 -11L9 11/.test(x.getAttribute('d') || ''))[0];
                return m ? m.getAttribute('d') : null })(),
      clip:   (function(){ const r = G.querySelector('rect[width="3.2"]');
                return r ? [r.getAttribute('x'), r.getAttribute('y'), r.getAttribute('width'),
                            r.getAttribute('height'), r.getAttribute('rx')].join(' ') : null })(),
      oriCx:  Array.prototype.map.call(G.querySelectorAll('ellipse'), e => e.getAttribute('cx')).join(','),
      oriRx:  Array.prototype.map.call(G.querySelectorAll('ellipse'), e => e.getAttribute('rx')).join(','),
      anilloR: (function(){ const c = G.querySelector('circle[r="10"]'); return c ? c.getAttribute('r') : null })()
    } : 'SIN GRUPO';
    out.col = { rep: (typeof POP_ESQ_VALV_REP !== 'undefined') ? POP_ESQ_VALV_REP : null,
                stent: (typeof POP_ESQ_VALV_STENT !== 'undefined') ? POP_ESQ_VALV_STENT : null,
                bio: (typeof POP_ESQ_VALV_BIO !== 'undefined') ? POP_ESQ_VALV_BIO : null };
    return out;
  }, { TIPOS, FASES, VALV });
  await pa.close();
  await b.close();

  console.log('===== COMPARACION CON LA DEMO v9 - LOS TRES SIMBOLOS NUEVOS (VAL-PPT-4) =====');
  console.log('app :', FILE);
  console.log('demo:', DEMO);
  console.log('metodo: se corre valveGeo/openFrac de la demo y las piezas de la app con los');
  console.log('        MISMOS datos y se comparan los NUMEROS. Tolerancia ' + TOL + ' por numero,');
  console.log('        porque la app redondea a dos decimales y la demo deja el crudo.');
  if (app.falta && app.falta.length) {
    console.log('NO EXISTEN en este arbol: ' + app.falta.join(', ') + '  (es el arbol de HEAD)');
    process.exit(0);
  }
  console.log('colores de la app: reparacion=' + app.col.rep + ' stent=' + app.col.stent
    + ' tejido=' + app.col.bio);
  console.log('');

  const nums = s => (String(s).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
  const cerca = (x, y) => Math.abs(x - y) <= TOL;
  let ok = 0, mal = 0; const detalle = [];

  /* 3a - las piezas ESTATICAS contra los literales de la demo */
  const estatica = (nom, dela, dela2) => {
    const en = nums(dela), an = nums(dela2);
    const igual = en.length === an.length && en.every((v, i) => cerca(v, an[i]));
    if (igual) ok++; else { mal++; detalle.push('PIEZA ' + nom + ' demo=' + dela + ' app=' + dela2) }
  };
  /* El literal de la demo se SACA de su propio codigo, no se transcribe. */
  const deDemo = (rx) => { const m = src.match(rx); return m ? m[0] : '(no esta en la demo)' };
  estatica('semicirculo de la plastia', deDemo(/M-10 0A10 10 0 1 1 10 0/), app.piezas.aro);
  estatica('rect del stent',   deDemo(/x="-9" y="-11" width="18" height="22" rx="3"/), app.piezas.stent);
  estatica('malla del stent',  deDemo(/M-9 -11L9 11M9 -11L-9 11M-9 0L0 -11L9 0L0 11Z/), app.piezas.malla);
  estatica('clip del TEER',    deDemo(/x="-1.6" y="-5" width="3.2" height="10" rx="1.2"/), app.piezas.clip);
  estatica('cx de los orificios', '-4.7 4.7', app.piezas.oriCx);
  estatica('rx de los orificios', '2.8 2.8', app.piezas.oriRx);
  estatica('radio del circulo', '10', app.piezas.anilloR);

  /* 3b - lo que se MUEVE, fase por fase */
  for (const [t, tn] of TIPOS) for (const [ak, dk] of VALV) for (const ph of FASES) {
    const k = t + '|' + dk + '|' + ph;
    const D = demo[k], A = app[k];
    const esc = tn.padEnd(8) + ' ' + dk + ' ph=' + String(ph).padEnd(5);
    if (Math.abs(D.a - A.a) > 1e-9) { mal++; detalle.push(esc + ' APERTURA demo=' + D.a + ' app=' + A.a); continue }
    /* los VELOS: de la cadena de la demo se saca el `path` de los velos */
    const dv = (D.html.match(/<path d="(M-[78] 0[^"]*)"/) || [])[1];
    if (!dv) { mal++; detalle.push(esc + ' la demo no trae path de velos'); continue }
    const dn = nums(dv), an = nums(A.velos.join(''));
    if (dn.length !== an.length || !dn.every((v, i) => cerca(v, an[i]))) {
      mal++; detalle.push(esc + ' VELOS demo=' + dv + ' app=' + A.velos.join('')); continue;
    }
    /* los ORIFICIOS del TEER */
    if (t === 'teer') {
      const de = D.html.match(/<ellipse cx="-4.7" cy="([^"]*)" rx="2.8" ry="([^"]*)" fill="#1d9e75" fill-opacity="([^"]*)"/);
      if (!de) { mal++; detalle.push(esc + ' la demo no trae la elipse'); continue }
      const par = [[Number(de[1]), Number(A.ori.cy), 'cy'], [Number(de[2]), Number(A.ori.ry), 'ry'],
                   [Number(de[3]), Number(A.ori.op), 'opacidad']];
      const malo = par.filter(x => !cerca(x[0], x[1]));
      if (malo.length) { mal++; detalle.push(esc + ' ORIFICIO ' + malo.map(x => x[2] + ' demo=' + x[0] + ' app=' + x[1]).join(' ')); continue }
    }
    ok++;
  }
  console.log('RESULTADO  iguales=' + ok + '  distintos=' + mal
    + '   (7 piezas estaticas + ' + (TIPOS.length * VALV.length * FASES.length) + ' cruces tipo x valvula x fase)');
  if (detalle.length) { console.log('\nDIFERENCIAS:'); detalle.slice(0, 25).forEach(d => console.log('  ' + d)) }
  console.log('errores de pagina: ' + (errs.length ? errs.join(' | ') : 'ninguno'));
})();
