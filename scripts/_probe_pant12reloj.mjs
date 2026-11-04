#!/usr/bin/env node
/**
 * _probe_pant12reloj.mjs — el defecto del reloj del motor 3D (PANT-12, commit 2).
 * FUERZA un reloj anterior al inicial sobre requestAnimationFrame y cuenta cuantas veces el
 * parametro de la curva sale del intervalo de cero a uno y cuantos errores de pagina hay.
 * Se corre sobre el arbol a medir y sobre una COPIA MUTADA sin las guardas, que es el control
 * positivo: HEAD ya las tiene, asi que sin mutacion no hay nada que reproducir.
 *   node scripts/_probe_pant12reloj.mjs [--file <html>] [--donde tga|cm]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const DONDE = arg('--donde') || 'tga';
const br = await _pw.chromium.launch({ channel: 'chrome' });
const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 160)));
pg.on('console', c => { if (c.type() === 'error') errs.push('CONS ' + c.text().slice(0, 160)) });
/* El reloj forzado y el contador se instalan ANTES de que la pagina corra una linea. */
await pg.addInitScript(`(function(){
  window.__P12 = { fuera: 0, nanN: 0, llamadas: 0, parcheado: 0, forzados: 0, peor: 0 };
  var raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = function(cb){
    return raf(function(ts){
      if (!window.__P12.parcheado && window.THREE && window.THREE.CatmullRomCurve3) {
        var pr = window.THREE.CatmullRomCurve3.prototype;
        var or = pr.getPointAt;
        pr.getPointAt = function(u){
          window.__P12.llamadas++;
          if (!(u >= 0 && u <= 1)) {
            window.__P12.fuera++;
            if (typeof u !== 'number' || u !== u) window.__P12.nanN++;
            if (Math.abs(u) > Math.abs(window.__P12.peor)) window.__P12.peor = u;
          }
          return or.apply(this, arguments);
        };
        window.__P12.parcheado = 1;
      }
      /* Las diez primeras entregas llevan un reloj CINCO SEGUNDOS anterior al real: es
         exactamente la condicion que el defecto necesita. */
      if (window.__P12.forzados < 10) { window.__P12.forzados++; return cb(ts - 5000); }
      return cb(ts);
    });
  };
})()`);
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
await pg.waitForTimeout(1500);
const r = await pg.evaluate(`(async () => {
  const R = {}; const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  try { limpiarCampos(true) } catch (e) {}
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const Q = String.fromCharCode(39);
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
  await esperar(360);
  const DONDE = '__DONDE__';
  if (DONDE === 'tga') {
    try { const b2 = bq('ccSubTab(' + Q + 'congenitas2'); if (b2) b2.click() } catch (e) {}
    await esperar(320);
    const acc = EL('sacc-cc-tga');
    if (acc && !acc.classList.contains('open')) { const h = document.querySelector('#sacc-cc-tga .sacc-hdr'); if (h) h.click() }
    await esperar(2600);
    R.acc = acc ? (acc.classList.contains('open') ? 'abierto' : 'NO') : 'NO EXISTE';
    R.lienzo = !!document.querySelector('#tga-3d-cv canvas');
  } else {
    const bot = EL('cm3d-abrir') || EL('cc3d-abrir');
    if (bot) bot.click();
    await esperar(2800);
    R.lienzo = !!document.querySelector('#cm3d-cv canvas') || !!document.querySelector('#tga-3d-cv canvas');
  }
  /* Con un tipo cargado hay mas corrientes: el denominador sube. */
  const s = EL('tga_tipo'); if (s) { s.value = 'dtga';
    s.dispatchEvent(new Event('input', { bubbles: true })); s.dispatchEvent(new Event('change', { bubbles: true })); }
  await esperar(1800);
  R.three = (typeof window.THREE === 'undefined') ? 'no' : (window.THREE.REVISION || 'si');
  R.p12 = JSON.parse(JSON.stringify(window.__P12 || {}));
  return R;
})()`.replace('__DONDE__', DONDE)).catch(e => ({ ERR: String(e).slice(0, 220) }));
await pg.close(); await br.close();
console.log(JSON.stringify({ archivo: FILE, donde: DONDE, r, errores: errs.slice(0, 8) }, null, 1));
