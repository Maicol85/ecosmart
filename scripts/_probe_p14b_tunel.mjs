#!/usr/bin/env node
/**
 * _probe_p14b_tunel.mjs - el tunel del switch auricular en violeta (PANT-14b, commit 6).
 * Mide los COLORES de la escena del 3D -las paredes del tunel y las particulas-, el contraste
 * del violeta contra el azul y el rojo, los rotulos, la leyenda condicional y el esquema plano,
 * con el control de que las demas variantes NO cambian.
 *   node scripts/_probe_p14b_tunel.mjs [--file <html>] [--tema claro]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const CUERPO = `(async () => {
  const R = {}; const EL = i => document.getElementById(i);
  const esp = ms => new Promise(z => setTimeout(z, ms));
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  try { if (typeof showTab === 'function') showTab('congenitas') } catch (e) {}
  await esp(420);
  const ab = EL('cc3d-abrir'); if (ab) ab.click(); await esp(3400);
  try { cmSetModo('explorar') } catch (e) {}
  await esp(450);
  try { cmSchSet(true) } catch (e) {}
  await esp(500);
  /* el contraste de dos colores de 24 bits, por luminancia relativa */
  const lum = n => { const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(function (v) {
      const x = v / 255; return (x <= 0.03928) ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4) });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2] };
  const cont = (a, b) => { const l1 = lum(a), l2 = lum(b);
    return Math.round(((Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)) * 100) / 100 };
  const VAR = ['d','jat','mus','ras','cc'];
  for (const v of VAR) {
    _cm3d.S.base = 'tga'; _cm3d.S.bv.tga = v; _cm3d.S.mods = {}; _cm3d.S.ck = {};
    let sc = null; try { sc = cmEscena(_cm3d.S) } catch (e) {}
    const o = {};
    if (!sc) { o.ERR = 'sin escena' } else {
      const tubos = (sc.ex || []).filter(function (x) { return x.t === 'tube' });
      o.nTubos = tubos.length;
      o.coloresTubos = tubos.map(function (x) { return '0x' + Number(x.c).toString(16) }).sort().join(' ');
      const VIO = (typeof TGA3D_C !== 'undefined' && TGA3D_C.violet) ? TGA3D_C.violet : -1;
      o.violetas = tubos.filter(function (x) { return x.c === VIO }).length;
      /* las particulas conservan su color */
      o.coloresFlujo = (sc.fl || []).map(function (x) { return '0x' + Number(x.c).toString(16) }).sort().join(' ');
      o.rotulos = (sc.lb || []).map(function (l) { return l[0] }).sort().join(',');
      o.nRot = (sc.lb || []).length;
    }
    /* la leyenda, pintada por su dueno */
    try { cmTunelLeySync() } catch (e) {}
    o.leg3d = EL('cm3d-leg-tun') ? !EL('cm3d-leg-tun').hidden : 'NO EXISTE';
    o.legEsq = EL('cm3d-leg2-tun') ? !EL('cm3d-leg2-tun').hidden : 'NO EXISTE';
    /* el esquema: nodos en violeta y su firma */
    try { cmSchRender(true) } catch (e) {}
    await esp(70);
    const svg = EL('cm3d-schsvg');
    const vio = (typeof TGA_ESQ_VIOLETA !== 'undefined') ? String(TGA_ESQ_VIOLETA).toLowerCase() : '#nada';
    let nVio = 0, nVioTrazo = 0;
    if (svg) svg.querySelectorAll('rect,path,circle,text').forEach(function (e) {
      const st = String(e.getAttribute('stroke') || '').toLowerCase();
      if (st === vio) { nVio++; if (e.tagName === 'path') nVioTrazo++ } });
    o.esqVioleta = nVio; o.esqVioTrazo = nVioTrazo;
    o.esqNodos = svg ? svg.querySelectorAll('rect,path,circle,text').length : 0;
    o.firmaEsq = svg ? Array.prototype.map.call(svg.querySelectorAll('rect,path,circle,text'),
      function (e) { return e.tagName + (e.getAttribute('d') || e.getAttribute('x') || '') +
        ':' + (e.getAttribute('stroke') || '') + ':' + String(e.textContent || '').trim() }).sort().join('|') : '';
    R[v] = o;
  }
  const VI = (typeof TGA3D_C !== 'undefined' && TGA3D_C.violet) ? TGA3D_C.violet : null;
  R.violeta = VI ? ('0x' + VI.toString(16)) : 'NO EXISTE';
  R.esqVioleta = (typeof TGA_ESQ_VIOLETA !== 'undefined') ? TGA_ESQ_VIOLETA : 'NO EXISTE';
  if (VI) {
    R.contrasteVsAzul = cont(VI, TGA3D_C.blue);
    R.contrasteVsRojo = cont(VI, TGA3D_C.red);
    R.contrasteVsGris = cont(VI, TGA3D_C.grey);
    /* ⚠️ EL CONTRASTE DE LUMINANCIA NO ES LO QUE DISTINGUE TRES COLORES DE RELLENO: los tres son
       de tono medio a proposito -el azul, el rojo y el violeta tienen luminancia parecida-, asi
       que lo que hay que medir es la separacion de TONO y la distancia euclidea en RGB. */
    const hue = n => { const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
      if (d === 0) return 0;
      let h = (mx === r) ? ((g - b) / d % 6) : (mx === g) ? ((b - r) / d + 2) : ((r - g) / d + 4);
      h = h * 60; if (h < 0) h += 360; return Math.round(h) };
    const dist = (a, b) => { const f = n => [(n >> 16) & 255, (n >> 8) & 255, n & 255];
      const x = f(a), y = f(b);
      return Math.round(Math.sqrt(Math.pow(x[0]-y[0],2) + Math.pow(x[1]-y[1],2) + Math.pow(x[2]-y[2],2))) };
    const dh = (a, b) => { const d = Math.abs(hue(a) - hue(b)); return Math.min(d, 360 - d) };
    R.tonos = { violeta: hue(VI), azul: hue(TGA3D_C.blue), rojo: hue(TGA3D_C.red), gris: hue(TGA3D_C.grey) };
    R.tonoVsAzul = dh(VI, TGA3D_C.blue); R.tonoVsRojo = dh(VI, TGA3D_C.red);
    R.distVsAzul = dist(VI, TGA3D_C.blue); R.distVsRojo = dist(VI, TGA3D_C.red);
    R.distVsGris = dist(VI, TGA3D_C.grey);
  }
  /* el control: una base SIN tunel no prende la leyenda */
  _cm3d.S.base = 'fal'; _cm3d.S.bv.fal = 'op'; _cm3d.S.mods = {}; _cm3d.S.ck = {};
  try { cmTunelLeySync() } catch (e) {}
  R.controlFallot = { leg3d: EL('cm3d-leg-tun') ? !EL('cm3d-leg-tun').hidden : '?',
                      legEsq: EL('cm3d-leg2-tun') ? !EL('cm3d-leg2-tun').hidden : '?' };
  return R;
})()`;

const br = await _pw.chromium.launch({ channel: 'chrome' });
const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 120)));
let out;
try {
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(1900);
  out = await pg.evaluate(CUERPO);
  out.errs = errs.filter(e => !/ERR_FILE_NOT_FOUND|favicon/.test(e));
} catch (e) { out = { fatal: String(e).slice(0, 240), errs } }
await pg.close(); await br.close();
console.log(JSON.stringify(out, null, 1));
