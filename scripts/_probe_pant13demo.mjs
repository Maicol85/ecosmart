#!/usr/bin/env node
/**
 * _probe_pant13demo.mjs - el esquema de circulacion contra la demo v13 (PANT-13, commit 2).
 * NO compara pixeles: carga la demo aprobada y la app, pone el MISMO estado en las dos y
 * compara el SVG emitido nodo por nodo, normalizando lo que difiere A PROPOSITO -los ids de
 * los marcadores, que la app prefija, y las variables de color de cada tema-.
 *   node scripts/_probe_pant13demo.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const FILE = arg('--file') || (RAIZ + '/index.html');
const DEMO = RAIZ + '/docs/3d/demo_corazon_maestro_v13_aprobado.html';
/* las escenas: una por base, una por lesion que se suma, las seis combinaciones y Eisenmenger */
const ESC = [
  ['norm', 'norm', null, {}, {}],
  ['fal_sin', 'fal', 'sin', {}, {}],
  ['fal_op', 'fal', 'op', {}, { ip: true, rciv: true, rest: true, rvd: true }],
  ['dsav_par', 'dsav', 'par', {}, { iav: true }],
  ['dsav_tra', 'dsav', 'tra', {}, {}],
  ['dsav_com', 'dsav', 'com', {}, { iav: true }],
  ['ebs', 'ebs', 'std', {}, { eit: true }],
  ['fon_ext', 'fon', 'ext', {}, { fen: true }],
  ['fon_tun', 'fon', 'tun', {}, { fen: true }],
  ['fon_atr', 'fon', 'atr', {}, {}],
  ['cia_sec', 'norm', null, { cia: 'sec' }, {}],
  ['cia_pri', 'norm', null, { cia: 'pri' }, {}],
  ['cia_sv', 'norm', null, { cia: 'sv' }, {}],
  ['civ_pm', 'norm', null, { civ: 'pm' }, {}],
  ['civ_mus', 'norm', null, { civ: 'mus' }, {}],
  ['civ_sal', 'norm', null, { civ: 'sal' }, {}],
  ['civ_ent', 'norm', null, { civ: 'ent' }, {}],
  ['dap', 'norm', null, { dap: 'std' }, {}],
  ['vap_prox', 'norm', null, { vap: 'prox' }, {}],
  ['vap_dis', 'norm', null, { vap: 'dis' }, {}],
  ['cvpa', 'norm', null, { cvpa: 'cs' }, { svs: true }],
  ['coa_nat', 'norm', null, { coa: 'nat' }, { col: true }],
  ['coa_rep', 'norm', null, { coa: 'rep' }, { rec: true, ane: true }],
  ['ep_valv', 'norm', null, { ep: 'valv' }, {}],
  ['ep_sub', 'norm', null, { ep: 'sub' }, {}],
  ['ep_sup', 'norm', null, { ep: 'sup' }, {}],
  ['ea_sub', 'norm', null, { ea: 'sub' }, { iao: true }],
  ['ea_sup', 'norm', null, { ea: 'sup' }, { iao: true }],
  ['vcs', 'norm', null, { vcs: 'std' }, {}],
  ['eis', 'norm', null, { civ: 'pm', eis: 'std' }, {}],
  /* las seis combinaciones frecuentes */
  ['cmb1', 'norm', null, { cia: 'sec', civ: 'pm', dap: 'std' }, {}],
  ['cmb2', 'norm', null, { cia: 'sv', cvpa: 'cs', vcs: 'std' }, { svs: true }],
  ['cmb3', 'norm', null, { cia: 'sec', ep: 'valv' }, {}],
  ['cmb4', 'norm', null, { coa: 'nat', ea: 'sub' }, {}],
  ['cmb5', 'ebs', 'std', { cia: 'sec' }, { eit: true }],
  ['cmb6', 'norm', null, { civ: 'pm', dap: 'std', eis: 'std' }, {}],
];
/* normaliza lo que difiere a proposito: los ids de marcador y los nombres de variable CSS.
   ⚠️ PANT-14, commit 1: LA APP YA NO ESCRIBE `var()` EN UN ATRIBUTO. Los colores del esquema
   se resuelven al dibujar -porque `--card` no existe en esta aplicacion y un `var()` sin valor
   dejaba las seis cajas y las dos valvulas NEGRAS, medido en los dos motores-, asi que donde la
   demo pone `var(--card)` la app pone ya el hexadecimal del tema. Se normalizan los CUATRO
   valores del tema oscuro -que es en el que esta sonda corre- a los mismos tokens, y la clase
   propia de la letra de la valvula dorada a la de la demo. Sin esto las 36 escenas salian
   distintas por el color y no por su contenido, que es justo lo que esta sonda no mide. */
const norm = t => String(t || '')
  .replace(/url\(#cmm([bro])\)/g, 'url(#m$1)')
  .replace(/id="cmm([bro])"/g, 'id="m$1"')
  .replace(/class="cm3d-tp-f"/g, 'class="cm3d-tp"')
  .replace(/class="cm3d-(tp|ts|fl)"/g, 'class="$1"')
  .replace(/#181c27/gi, 'VSURF').replace(/#2a3050/gi, 'VBORD')
  .replace(/#9aa3bc/gi, 'VTS').replace(/#e8ecf4/gi, 'VTP').replace(/#1a2233/gi, 'VTP')
  .replace(/var\(--card\)/g, 'VSURF').replace(/var\(--surface-1\)/g, 'VSURF')
  .replace(/var\(--border\)/g, 'VBORD').replace(/var\(--border-strong\)/g, 'VBORD')
  .replace(/var\(--text2\)/g, 'VTS').replace(/var\(--ts\)/g, 'VTS')
  .replace(/var\(--text\)/g, 'VTP').replace(/var\(--text-primary\)/g, 'VTP')
  .replace(/\s+/g, ' ').trim();

const br = await _pw.chromium.launch({ channel: 'chrome' });
const OUT = { demo: DEMO, app: FILE };

/* ── (A) la demo: su renderSch vive dentro de una IIFE, asi que se EXTRAE por marcas
   literales -cada una exigida UNA sola vez, asi que si la demo cambia la extraccion falla
   ruidosamente- y se evalua en una pagina EN BLANCO con un DOM minimo. Es el metodo que
   PANT-12 uso para el scenario() de la misma demo. ── */
import fs from 'fs';
const SRC = fs.readFileSync(DEMO, 'utf8');
const trozo = (a, b) => {
  const na = SRC.split(a).length - 1, nb = SRC.split(b).length - 1;
  if (na !== 1 || nb !== 1) throw new Error('marca ambigua: ' + a.slice(0, 30) + ' n=' + na + '/' + nb);
  const i = SRC.indexOf(a), j = SRC.indexOf(b, i + a.length);
  return SRC.slice(i, j);
};
const PIEZAS = [
  trozo('var MODS=[', '\nvar MCK='),
  trozo('var SHORT={', '\nfunction chip('),
  trozo('var SIG={', "\nfunction viewFor("),
  trozo('function renderSch(){', '\nfunction setSch('),
].join('\n');
const pd = await br.newPage({ viewport: { width: 900, height: 700 } });
await pd.goto('about:blank');
await pd.addScriptTag({ content: 'window.__PZ = ' + JSON.stringify(PIEZAS) + '; window.__ESC = ' + JSON.stringify(ESC) + ';' });
const demo = await pd.evaluate(`(() => {
  const piezas = window.__PZ, lista = window.__ESC;
  const R = {};
  /* el DOM minimo que renderSch necesita: el svg, el panel y el parrafo de la circulacion */
  /* ⚠️ EL SVG DE LA DEMO ES UN SVG REAL DEL DOM, y hace falta: asignandole la cadena a un
     objeto plano se compara la cadena CRUDA de la demo contra el innerHTML SERIALIZADO por el
     navegador del lado de la app -donde un path autocerrado sale como par de etiquetas-, y las
     36 escenas salian distintas por eso y no por su contenido. */
  const svgReal = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  document.body.appendChild(svgReal);
  const bolsa = { schsvg: svgReal,
                  sch: { hidden: false },
                  schcap: { textContent: '' },
                  circ: { textContent: '' } };
  let S, renderSch;
  try {
    const f = new Function('bolsa', 'ret', piezas +
      String.fromCharCode(10) + 'var $ = function(i){ return bolsa[i] };' +
      String.fromCharCode(10) + 'var S = {base:"norm",bv:{fal:"sin",dsav:"par",ebs:"std",fon:"ext",tga:"d"},mods:{},ck:{},src:""};' +
      String.fromCharCode(10) + 'ret.S = S; ret.renderSch = renderSch;');
    const ret = {}; f(bolsa, ret); S = ret.S; renderSch = ret.renderSch;
  } catch (ex) { return { ERR: 'montaje: ' + String(ex).slice(0, 220) } }
  if (typeof renderSch !== 'function') return { ERR: 'renderSch no se extrajo' };
  lista.forEach(e => {
    const nom = e[0], base = e[1], bv = e[2], mods = e[3], ck = e[4];
    try {
      S.base = base; if (bv) S.bv[base] = bv;
      S.mods = {}; Object.keys(mods).forEach(k => { S.mods[k] = mods[k] });
      S.ck = {}; Object.keys(ck).forEach(k => { S.ck[k] = ck[k] });
      bolsa.schsvg.innerHTML = '';
      renderSch();
      R[nom] = bolsa.schsvg.innerHTML;
    } catch (ex) { R[nom] = 'EXC ' + String(ex).slice(0, 110) }
  });
  R._abierto = true;
  return R;
})()`).catch(e => ({ ERR: String(e).slice(0, 220) }));
await pd.close();

/* ── (B) la app ── */
const pa = await br.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pa.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 120)));
await pa.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
await pa.waitForTimeout(1400);
await pa.addScriptTag({ content: 'window.__ESC = ' + JSON.stringify(ESC) + ';' });
const app = await pa.evaluate(`(async () => {
  const lista = window.__ESC;
  const R = {}; const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  const Q = String.fromCharCode(39);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
  await esperar(400);
  const bot = EL('cc3d-abrir'); if (bot) bot.click();
  await esperar(3000);
  const bExp = Array.prototype.filter.call(document.querySelectorAll('.cm3d-md'), b => b.getAttribute('data-m') === 'explorar')[0];
  if (bExp) bExp.click();
  await esperar(500);
  const esb = EL('cm3d-esb'); if (esb) esb.click();
  await esperar(500);
  const sv = EL('cm3d-schsvg');
  if (!sv) return { ERR: 'no hay cm3d-schsvg' };
  R._abierto = !EL('cm3d-sch').hidden;
  const st = window._cm3dEstado ? window._cm3dEstado() : null;
  if (!st) return { ERR: 'no hay _cm3dEstado' };
  lista.forEach(e => {
    const nom = e[0], base = e[1], bv = e[2], mods = e[3], ck = e[4];
    try {
      st.S.base = base; if (bv) st.S.bv[base] = bv;
      st.S.mods = {}; Object.keys(mods).forEach(k => { st.S.mods[k] = mods[k] });
      st.S.ck = {}; Object.keys(ck).forEach(k => { st.S.ck[k] = ck[k] });
      window.cmSchRender();
      R[nom] = sv.innerHTML;
    } catch (ex) { R[nom] = 'EXC ' + String(ex).slice(0, 110) }
  });
  return R;
})()`, ESC).catch(e => ({ ERR: String(e).slice(0, 200) }));
await pa.close();
await br.close();

if (!demo || !app || demo.ERR || app.ERR) { console.log(JSON.stringify({ demoERR: demo ? demo.ERR : 'demo undefined', appERR: app ? app.ERR : 'app undefined', errs }, null, 1)); process.exit(1) }
let ig = 0, dif = 0, vac = 0;
const detalle = [];
for (const e of ESC) {
  const k = e[0], a = norm(demo[k]), b = norm(app[k]);
  if (!a || !b || a.length < 200) { vac++; detalle.push([k, 'DENOMINADOR VACIO', (a || '').length, (b || '').length]); continue }
  if (a === b) { ig++ } else {
    dif++;
    let i = 0; while (i < a.length && i < b.length && a[i] === b[i]) i++;
    detalle.push([k, 'DISTINTO en ' + i, a.slice(Math.max(0, i - 50), i + 70), b.slice(Math.max(0, i - 50), i + 70)]);
  }
}
console.log(JSON.stringify({ abierto: { demo: demo._abierto, app: app._abierto },
  escenas: ESC.length, iguales: ig, distintas: dif, denomVacio: vac,
  detalle: detalle.slice(0, 8), errs: errs.slice(0, 4) }, null, 1));
