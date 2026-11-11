#!/usr/bin/env node
/**
 * _probe_p37c.mjs - sonda de la PARTE C de PANT-37 (2026-11-11): el area que se abre con el
 * flujo. Mide el selector y su valor por omision, el deslizador de apertura con su nota, la
 * fila «AVA a 250 mL/s», las dos formas de la linea de lectura, la tercera grafica y la vuelta
 * a «Fija». Y prueba la FORMULA sola con el par de la guia europea de eco de estres.
 * Control negativo: en modo «Fija» el area, el gradiente y la Vmax son los de la Parte B.
 *
 * ⚠️ Sin acentos graves dentro del template, tampoco en sus comentarios.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
const CAND = [process.env.PW, process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'].filter(Boolean);
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default || (await import(c)); break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const raiz = dirname(FILE), nom = FILE.slice(raiz.length + 1);
const { srv, port } = await new Promise(res => {
  const s = createServer(async (req, rq) => {
    try {
      const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || nom;
      const p = join(raiz, rel);
      if (!p.startsWith(raiz)) { rq.writeHead(403).end(); return; }
      rq.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }).end(await readFile(p));
    } catch { rq.writeHead(404).end('no'); }
  });
  s.listen(0, '127.0.0.1', () => res({ srv: s, port: s.address().port }));
});
const URL0 = 'http://127.0.0.1:' + port + '/' + nom;

const MEDIR = `(async () => {
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const o = {}; const EL = id => document.getElementById(id);
  const N = s => String(s == null ? '' : s).replace(/[\\s\\u00a0]+/g, ' ').trim();
  try { localStorage.setItem('ett_theme', 'dark'); if (typeof loadTheme === 'function') loadTheme(); } catch (e) {}
  try { sessionStorage.setItem('ett_auth', '1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  const lo = EL('login-overlay'); if (lo) lo.style.display = 'none';
  const poner = (id, val) => { const e = EL(id); if (!e) return false; e.value = String(val);
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return true; };

  /* ── LA FORMULA SOLA, con el par de la guia europea de eco de estres ──
     area 0,79 -> 1,22 cm2 con flujo 183 -> 370 mL/s. La pendiente que ese par implica es
     (1,22 - 0,79) / (370 - 183) x 100 y el area proyectada a 250 mL/s tiene que dar 0,94. */
  const mESC = (1.22 - 0.79) / (370 - 183) * 100;
  o.formulaESC = {
    m: Math.round(mESC * 10000) / 10000,
    a250: Math.round(wiAreaEn(0.79, mESC, 183, 250) * 10000) / 10000,
    a250red: wiAreaEn(0.79, mESC, 183, 250).toFixed(2),
    /* el par de origen se reproduce: en 183 da el area medida y en 370 la del flujo alto */
    en183: wiAreaEn(0.79, mESC, 183, 183).toFixed(2),
    en370: wiAreaEn(0.79, mESC, 183, 370).toFixed(2),
    /* los dos topes de la ley */
    topeBajo: wiAreaEn(0.79, -9, 183, 400), topeAlto: wiAreaEn(0.79, 9, 183, 400)
  };

  try { showTab('paciente'); } catch (e) {}
  poner('peso', 70); poner('talla', 170); poner('edad', 72);
  { const e = EL('sexo'); e.value = 'M'; e.dispatchEvent(new Event('change', { bubbles: true })); }
  try { showTab('valvulas'); } catch (e) {}
  await esp(300);
  try { if (typeof pillOn === 'function' && pillOn('aortica', 'esten') !== true) toggleValvPill('aortica', 'esten'); } catch (e) {}
  const DISC = { diam_tsvi: 20, itv_tsvi: 20, itv_ao: 78.5, vmax_ao: 3.2, gmedio_ao: 25,
                 vdfvi: 120, fevi: 45, ao_fc: 65, tango_te: 300 };
  for (const id in DISC) poner(id, DISC[id]);
  await esp(450);
  try { if (!v2dVisible()) v2dAbrir(); } catch (e) {}
  await esp(350);
  EL('wi-btn').click(); await esp(420);

  const lea = () => ({
    estado: (typeof wiSimEstado === 'function') ? wiSimEstado() : null,
    fija: EL('wi-area-fija').classList.contains('btn-primary'),
    abre: EL('wi-area-abre').classList.contains('btn-primary'),
    slVis: !EL('wi-fila-m').classList.contains('wi-oculto'),
    notaVis: !EL('wi-m-nota').classList.contains('wi-oculto'),
    nota: N(EL('wi-m-nota').textContent),
    o3: N(EL('wi-o3').textContent), r3: EL('wi-r3').value,
    g3Vis: !EL('wi-g3').classList.contains('wi-oculto'),
    gt1: N(EL('wi-gt1').textContent), gt2: N(EL('wi-gt2').textContent), gt3: N(EL('wi-gt3').textContent),
    punteadas: ['wi-ch1','wi-ch2','wi-ch3'].map(id => EL(id).querySelectorAll('polyline[stroke-dasharray]').length).join('/'),
    filas: Array.prototype.slice.call(EL('wi-tb').children).map(tr =>
      Array.prototype.slice.call(tr.children).map(td => N(td.textContent)).join(' = ')),
    lee: N(EL('wi-lee').textContent),
    C: (function(){ try { const c = wiCuenta(); return { a0: c.a0, a1: Math.round(c.a1*1000)/1000,
      a250: Math.round(c.a250*1000)/1000, g1: Math.round(c.g1*100)/100,
      v1: Math.round(c.v1*1000)/1000, q1: Math.round(c.q1) } } catch (e) { return 'ERR' } })()
  });
  o.porOmision = lea();

  /* al modo «Se abre» */
  EL('wi-area-abre').click(); await esp(280);
  o.abre = lea();
  /* con el flujo duplicado, para ver el area moverse */
  EL('wi-mv-vs').click(); await esp(160);
  EL('wi-r1').value = '108'; EL('wi-r1').dispatchEvent(new Event('input', { bubbles: true }));
  await esp(260);
  o.abreDoble = lea();
  /* apertura chica: el area proyectada queda por debajo del corte y la frase se da vuelta */
  EL('wi-r3').value = '0.05'; EL('wi-r3').dispatchEvent(new Event('input', { bubbles: true }));
  await esp(240);
  o.abreChica = { o3: N(EL('wi-o3').textContent), lee: N(EL('wi-lee').textContent),
                  a250: Math.round(wiCuenta().a250*1000)/1000 };
  EL('wi-r3').value = '0.8'; EL('wi-r3').dispatchEvent(new Event('input', { bubbles: true }));
  await esp(240);
  o.abreGrande = { o3: N(EL('wi-o3').textContent), lee: N(EL('wi-lee').textContent),
                   a250: Math.round(wiCuenta().a250*1000)/1000 };

  /* vuelta a «Fija»: las formulas de B4 otra vez (C5) */
  EL('wi-area-fija').click(); await esp(280);
  o.vuelta = lea();
  o.vueltaOk = {
    areaIgualALaMedida: o.vuelta.C.a1 === o.vuelta.C.a0,
    gradienteCuadrado: Math.round(o.vuelta.C.g1 / 25 * 1000) / 1000,
    vmaxDoble: Math.round(o.vuelta.C.v1 / 3.2 * 1000) / 1000,
    sinFila250: o.vuelta.filas.filter(f => f.indexOf('250') > -1).length === 0,
    graficaApagada: !o.vuelta.g3Vis, deslizadorApagado: !o.vuelta.slVis
  };
  /* «Volver a lo medido» devuelve el modo Fija y la apertura inicial (C1) */
  EL('wi-area-abre').click(); EL('wi-r3').value = '0.7';
  EL('wi-r3').dispatchEvent(new Event('input', { bubbles: true })); await esp(200);
  EL('wi-reset').click(); await esp(260);
  o.trasReset = { estado: wiSimEstado(), fija: EL('wi-area-fija').classList.contains('btn-primary'),
                  r3: EL('wi-r3').value };
  return o;
})()`;

const nav = await _pw.chromium.launch({ channel: 'chrome' });
const ctx = await nav.newContext({ viewport: { width: 1440, height: 1100 } });
const pg = await ctx.newPage();
const errs = [];
pg.on('console', x => { if (x.type() === 'error') errs.push('consola: ' + x.text().slice(0, 140)) });
pg.on('pageerror', e => errs.push('pagina: ' + String(e.message).slice(0, 140)));
let out;
try {
  await pg.goto(URL0, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(2600);
  out = await pg.evaluate(MEDIR);
} catch (e) { out = { error: String(e).slice(0, 400) }; }
out.errores = errs;
console.log(JSON.stringify(out, null, 1));
await ctx.close(); await nav.close(); srv.close();
