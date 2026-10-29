/* Sonda de MAQUETA en DOS MOTORES para la tanda C2 (2026-10-28).
 *
 *   node scripts/_probe_c2wk.mjs [--file /ruta/index.html]
 *
 * Mide, en Chrome y en WebKit, a 1440 px y 390 px y en los DOS temas:
 *   - CERO barra horizontal de la PAGINA y CERO errores de consola y de pagina.
 *   - La geometria de TODA la app: cuantas pestanas informan caja. Un <div> sin cerrar no lanza
 *     -el parser re-anida lo que viene despues- y ningun A/B de texto lo ve; lo unico que lo
 *     delata es que pestanas AJENAS informen 0x0, que es lo que la tanda I pago.
 *   - El rotulo nuevo del campo del derrame, entero y sin recortarse.
 *   - Las DOS lineas cortas de constriccion y sus DOS globos de 44x44, con los cinco puntos
 *     dando el propio boton: una caja de 44x44 encajada con margenes negativos taparia el
 *     campo de abajo, que es lo que la tanda AJ7 midio.
 *   - La capsula del Forrester y el patron global del pulmon.
 *   - Que NO quede ningun boton «Traer del formulario» ni ninguno de integrar pulmonar.
 *   - Textos recortados (scrollWidth > clientWidth) en las zonas que la tanda toca.
 *
 * ⚠️ Playwright se resuelve POR RUTA. Si no esta, la sonda lo DICE y sale con codigo 2.
 * ⚠️ WebKit de Playwright NO es Safari, y se declara.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { createHash } from 'node:crypto';

const CANDIDATAS = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
                    '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CANDIDATAS) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CANDIDATAS }, null, 1)); process.exit(2); }
const { chromium, webkit } = _pw;

const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const ARCH = arg('--file');

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const srv = createServer(async (req, rq) => {
  try {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const p = (rel === 'index.html' && ARCH) ? ARCH : join(RAIZ, rel);
    rq.writeHead(200, { 'Content-Type': MIME[extname(rel)] || 'application/octet-stream' }).end(await readFile(p));
  } catch { rq.writeHead(404).end('no'); }
});
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const PORT = srv.address().port;

const out = { arbol: ARCH || 'VIVO', md5: null, cruces: {} };
out.md5 = createHash('md5').update(await readFile(ARCH || join(RAIZ, 'index.html'))).digest('hex');

/* La sonda. Sin acentos graves adentro: vive en un template. */
const MEDIR = `(() => {
  const N = s => String(s == null ? '' : s).replace(/\\s+/g, ' ').trim();
  const EL = id => document.getElementById(id);
  const r = {};
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = EL(id); if (m) m.style.display = 'none' });

  /* 1 · Scroll horizontal de la PAGINA. */
  r.scrollH = document.documentElement.scrollWidth - document.documentElement.clientWidth;

  /* 2 · Las pestanas: cuantas informan caja. */
  const secs = [].slice.call(document.querySelectorAll('.tab-section'));
  let conCaja = 0;
  secs.forEach(s => {
    const vis = s.style.display;
    s.style.display = 'block';
    const b = s.getBoundingClientRect();
    if (b.width > 0 && b.height > 0) conCaja++;
    s.style.display = vis;
  });
  r.pestanas = secs.length + ' con caja ' + conCaja;

  /* 3 · El rotulo del campo del derrame, y si se recorta. */
  const cd = EL('pua_balik');
  const lb = cd && cd.parentElement ? cd.parentElement.querySelector('label') : null;
  if (lb) {
    const vis = []; let n = lb.parentElement;
    while (n && n !== document.body) { if (getComputedStyle(n).display === 'none') vis.push(n); n = n.parentElement; }
    const previo = vis.map(e => e.style.display);
    vis.forEach(e => { e.style.display = 'block' });
    r.lblDerrame = N(lb.textContent);
    r.lblDerrameCaja = Math.round(lb.getBoundingClientRect().width) + 'x' + Math.round(lb.getBoundingClientRect().height);
    r.lblDerrameRecorta = lb.scrollWidth > lb.clientWidth + 1;
    vis.forEach((e, i) => { e.style.display = previo[i] });
  } else r.lblDerrame = 'NO EXISTE';

  /* 4 · Los dos globos nuevos: 44x44 y los cinco puntos. */
  r.globos = ['cvr-coc', 'cvr-ecosmart', 'pul-balik'].map(k => {
    const b = document.querySelector('[data-vinfo="' + k + '"]');
    if (!b) return k + '=NO EXISTE';
    const vis = []; let n = b.parentElement;
    while (n && n !== document.body) { if (getComputedStyle(n).display === 'none') vis.push(n); n = n.parentElement; }
    const previo = vis.map(e => e.style.display);
    vis.forEach(e => { e.style.display = 'block' });
    /* ⚠️ elementFromPoint TRABAJA EN COORDENADAS DE VIEWPORT, no de documento: sin llevar el
       boton a la vista, los cinco puntos caen fuera de la ventana y devuelven null, o sea
       propios=0 para TODOS los globos — indistinguible de «la caja tapa a un vecino». La
       primera version de esta sonda lo midio asi y dio 0 en los seis cruces. */
    try { b.scrollIntoView({ block: 'center' }) } catch (e) {}
    const c = b.getBoundingClientRect();
    const pts = [[c.left + 2, c.top + 2], [c.right - 2, c.top + 2], [c.left + 2, c.bottom - 2],
                 [c.right - 2, c.bottom - 2], [c.left + c.width / 2, c.top + c.height / 2]];
    const propios = pts.filter(p => { const e = document.elementFromPoint(p[0], p[1]); return e === b || (e && b.contains(e)) }).length;
    vis.forEach((e, i) => { e.style.display = previo[i] });
    return k + '=' + Math.round(c.width) + 'x' + Math.round(c.height) + ' propios=' + propios;
  }).join(' | ');

  /* 5 · Que NO queden los botones retirados. */
  r.botonesRetirados = 'traer=' + [].slice.call(document.querySelectorAll('button'))
      .filter(b => N(b.textContent).indexOf('Traer del formulario') > -1).length
    + ' integrarPulm=' + document.querySelectorAll('[data-am-k=pulm]').length
    + ' critCalc=' + document.querySelectorAll('.crit-calc-btn').length;

  /* 6 · Las dos lineas cortas de constriccion, y su largo. */
  r.notaCoc = (function () { const i = EL('cvr_hep_coc'), w = i ? i.parentElement : null;
    if (!w) return 'NO EXISTE';
    const d = [].slice.call(w.querySelectorAll('div')).filter(x => !x.className || x.className.indexOf('calc-row') < 0);
    return d.length ? N(d[d.length - 1].textContent) : 'SIN NOTA'; })();
  r.bloqEco = (function () { const b = EL('cvr-concl'), c = b ? b.parentElement : null;
    if (!c) return 'NO EXISTE';
    const t = N(c.textContent), i = t.indexOf('CRITERIO DE ECOSMART');
    return i > -1 ? t.slice(i) : 'SIN BLOQUE'; })();

  /* 7 · El Forrester y el patron global, con una escena montada. */
  const S = (id, v) => { const e = EL(id); if (!e) return; e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
  try { limpiarCampos(true) } catch (e) {}
  S('peso', '80'); S('talla', '180'); S('hemo_fc', '60'); S('diam_tsvi', '18'); S('itv_tsvi', '16');
  S('onda_e', '130'); S('e_sep', '10.2'); S('e_lat', '11.15');
  S('pua_desliz', 'presente'); S('pua_derrame', 'si'); S('pua_derrame_lado', 'bilateral');
  S('pul_derrame_tam', 'moderado'); S('pua_balik', '25');
  try { calcHemo() } catch (e) {}
  try { pulAvUI() } catch (e) {}
  try { generarInforme() } catch (e) {}
  r.forrester = N((EL('hemo-forrester') || {}).textContent);
  r.pcp = N((EL('hemo-pcp') || {}).textContent);
  r.patron = N((EL('pua-patron') || {}).textContent);
  r.informePul = N(String((EL('informe_texto') || {}).value || '').split(String.fromCharCode(10))
    .filter(x => x.indexOf('pleural') > -1).join(' || '));
  r.sumaPul = N(String((EL('en_suma') || {}).value || '').split(String.fromCharCode(10))
    .filter(x => x.indexOf('pleural') > -1 || x.indexOf('Consolidaci') > -1).join(' || '));

  /* 8 · Textos recortados en TODA la app. */
  r.recortados = [].slice.call(document.querySelectorAll('label, .calc-lbl, button, option, span'))
    .filter(e => { const b = e.getBoundingClientRect();
      return b.width > 0 && b.height > 0 && e.scrollWidth > e.clientWidth + 2 && N(e.textContent).length > 3; })
    .length;
  return r;
})()`;

async function cruce(motor, nombre, ancho, tema) {
  /* ⚠️ CHROME VA POR EL DEL SISTEMA. El binario de chromium de Playwright instalado en esta
     maquina es el 1234 y la version del paquete pide el 1248: `motor.launch()` pelado sale con
     «Executable doesn't exist» y la sonda devuelve los cuatro cruces VACIOS, que en un volcado
     se lee igual que «no hubo diferencias». Es el mismo arreglo que el A/B ya usa, y la misma
     salvedad que este repositorio declara desde la tanda A.
     ⚠️ WebKit de Playwright NO es Safari, y se declara. */
  const b = await motor.launch(nombre === 'chrome' ? { channel: 'chrome' } : {});
  const errs = [];
  const pg = await b.newPage({ viewport: { width: ancho, height: 900 },
                               colorScheme: tema });
  pg.on('pageerror', e => errs.push('PAGE: ' + e.message.slice(0, 110)));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLA: ' + m.text().slice(0, 110)) });
  await pg.goto('http://127.0.0.1:' + PORT + '/index.html', { waitUntil: 'load', timeout: 180000 });
  await pg.waitForTimeout(1800);
  let r;
  try { r = await pg.evaluate(MEDIR); } catch (e) { r = { EXC: String(e).slice(0, 200) }; }
  r.errores = errs.length ? errs : 'CERO';
  await pg.close(); await b.close();
  return r;
}

for (const [motor, nombre] of [[chromium, 'chrome'], [webkit, 'webkit']]) {
  for (const ancho of [1440, 390]) {
    for (const tema of ['light', 'dark']) {
      const k = nombre + '/' + ancho + '/' + tema;
      try { out.cruces[k] = await cruce(motor, nombre, ancho, tema); }
      catch (e) { out.cruces[k] = { EXC: String(e).slice(0, 200) }; }
      console.error('medido ' + k);
    }
  }
}
srv.close();
console.log(JSON.stringify(out, null, 1));
process.exit(0);
