#!/usr/bin/env node
/**
 * _probe_ec2dos.mjs - el cruce de DOS MOTORES de la tanda ECO-CONECTOR-2.
 * Chrome (el del sistema, por channel) y WebKit, en 1440 / 1280 / 1000 / 768 / 390 px y en los
 * dos temas: 10 cruces por motor.
 *
 * QUE MIDE: el alto de la tarjeta de CeiboLink en los TRES estados que la decision 12f pide
 * -sin vincular, vinculado con todo cerrado, y vinculado con dos equipos y una seccion
 * abierta-; el hueco de la columna de al lado; que los tres plegables nazcan CERRADOS; que
 * «Equipos» se abra SOLA con un equipo esperando decision; que abran y cierren con TECLADO; que
 * el repintado NO borre ninguna parte estatica; que los textos del conector entren como TEXTO;
 * los 44 px del renglon que se toca; el desplazamiento horizontal, el texto recortado y los
 * errores de consola y de pagina.
 *
 * ⚠️ LEVANTA EL CONECTOR FALSO en loopback y apunta el modulo con `window.__clnkBaseTest`, que
 * es la unica forma de redirigirlo: no hay ningun campo editable. Sin el conector, el panel no
 * tiene datos y las mediciones serian sobre cero -que se lee igual que «todo bien»-.
 * ⚠️ EL TEMA SE PONE POR `ett_theme` + `loadTheme()` Y NO POR `colorScheme`: el tema de esta app
 * es la clase `light-mode` del <html>. La sonda DEVUELVE que tema quedo puesto, para que un cero
 * no pueda ser un cero sobre el mismo tema medido dos veces (la leccion de PANT-34).
 * ⚠️ HAY QUE PONER MODO AVANZADO Y ACTIVAR EL MODULO: son sus DOS compuertas, y sin las dos la
 * tarjeta mide 0 por otra razon.
 * ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI, y se declara. Chrome va por el del sistema.
 * ⚠️ Sin acentos graves dentro del template, tampoco en sus comentarios.
 *
 *     node scripts/_probe_ec2dos.mjs [--file=/ruta/index.html]
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
import { servirConectorFalso } from './_conector_falso.mjs';

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
const F = await servirConectorFalso({ origenes: 'http://127.0.0.1:' + port });
const BASE = 'http://127.0.0.1:' + F.port;

const MEDIR = (tema) => `(async () => {
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const o = { w: innerWidth, temaPedido: '${tema}' };
  const N = s => String(s == null ? '' : s).replace(/[\\s\\u00a0]+/g, ' ').trim();
  const EL = id => document.getElementById(id);
  try { localStorage.setItem('ett_theme', '${tema}' === 'dia' ? 'light' : 'dark'); } catch (e) {}
  try { if (typeof loadTheme === 'function') loadTheme(); } catch (e) {}
  o.temaPuesto = document.documentElement.classList.contains('light-mode') ? 'dia' : 'noche';
  try { sessionStorage.setItem('ett_auth', '1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  const lo = EL('login-overlay'); if (lo) lo.style.display = 'none';
  window.__clnkBaseTest = '${BASE}';
  window.toast = function () {};
  /* ** EL ESCENARIO DE LA MEDICION DEL ALTO LLEVA UN SOLO EQUIPO, Y AUTORIZADO. Con uno
     PENDIENTE la seccion «Equipos» se abre SOLA -- que es la funcion que la decision 12d pide--
     y el alto «con todo cerrado» mediria 272 px de mas: medido, 712 contra 440. El estado con
     un pendiente se mide aparte, mas abajo. */
  try { await fetch('${BASE}/_control', { method: 'POST',
    headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reset: true, equipos: 1 }) }); } catch (e) {}

  /* DENOMINADOR: que este arbol tenga el panel COMPACTO de esta tanda. No corta la medicion
     del ALTO -- que es justo lo que hay que medir ANTES y DESPUES, en el mismo arnes-- sino las
     condiciones que hablan de los plegables, que en el arbol viejo no existen. El panel viejo
     tiene las mismas funciones de base -- el interruptor, vincular y la lectura de estado-- asi
     que su alto se mide igual. */
  o.hayPanelViejo = typeof window.clnkToggle === 'function' && typeof window.clnkVincular === 'function';
  o.hayCompacto = typeof window.clnkSondeoSync === 'function' && typeof window.clnkEspacio === 'function';
  if (!o.hayPanelViejo) return o;

  const card = () => EL('cfg-card-clnk');
  const alto = el => el ? Math.round(el.getBoundingClientRect().height) : -1;
  const abrirConfig = () => { try { showTab('config'); } catch (e) {} try { if (window.cfgOnShow) cfgOnShow(); } catch (e) {} };

  /* LAS DOS COMPUERTAS: Modo Avanzado y el interruptor. */
  try { localStorage.setItem('ett_view_mode', 'avanzado'); if (typeof applyViewMode === 'function') applyViewMode(); } catch (e) {}
  try { localStorage.removeItem('ett_ceibolink_token'); } catch (e) {}
  try { clnkToggle(true); } catch (e) {}
  abrirConfig();
  await esp(700);

  /* ── ESTADO 1 · SIN VINCULAR ─────────────────────────────────────────────────────────── */
  o.e1 = { alto: alto(card()) };
  const bv = EL('cfg-clnk-bloque-vincular');
  o.e1.codigoVisible = !!bv && bv.getBoundingClientRect().height > 0;
  o.e1.dets = ['cfg-clnk-det-conexion','cfg-clnk-det-equipos','cfg-clnk-det-ajustes']
    .map(id => { const e = EL(id); return !e ? 'NO' : (e.getBoundingClientRect().height > 0 ? 'VE' : 'oc'); }).join(',');
  /* El codigo tiene que estar ARRIBA de los plegables en el orden de lectura. */
  o.e1.codigoAntesDeLosPlegables = (function () {
    const a = EL('cfg-clnk-bloque-vincular'), b = EL('cfg-clnk-det-conexion');
    if (!a || !b) return 'NO';
    return (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) ? true : false;
  })();
  o.e1.nums = N(EL('cfg-clnk-nums') ? EL('cfg-clnk-nums').textContent : '');
  o.e1.luz = N(EL('cfg-clnk-luz') ? EL('cfg-clnk-luz').textContent : '');

  /* ── ESTADO 2 · VINCULADO, TODO CERRADO ──────────────────────────────────────────────── */
  const cod = EL('cfg-clnk-codigo');
  if (cod) { cod.value = '${F.codigo}'; cod.dispatchEvent(new Event('input', { bubbles: true })); }
  try { await clnkVincular(); } catch (e) { o.errVincular = String(e && e.message).slice(0, 90); }
  await esp(1100);
  o.vinculado = (function () { try { return clnkVinculado() } catch (e) { return 'ERR' } })();
  o.e2 = { alto: alto(card()) };
  o.e2.dets = ['cfg-clnk-det-conexion','cfg-clnk-det-equipos','cfg-clnk-det-ajustes']
    .map(id => { const e = EL(id); return !e ? 'NO' : (e.open ? 'ABIERTO' : 'cerrado'); }).join(',');
  o.e2.detsVisibles = ['cfg-clnk-det-conexion','cfg-clnk-det-equipos','cfg-clnk-det-ajustes']
    .map(id => { const e = EL(id); return !e ? 'NO' : (e.getBoundingClientRect().height > 0 ? 'VE' : 'oc'); }).join(',');
  o.e2.nums = N(EL('cfg-clnk-nums') ? EL('cfg-clnk-nums').textContent : '');
  o.e2.luz = N(EL('cfg-clnk-luz') ? EL('cfg-clnk-luz').textContent : '');
  o.e2.cnt = N(EL('cfg-clnk-eq-cnt') ? EL('cfg-clnk-eq-cnt').textContent : '');
  o.e2.codigoVisible = !!EL('cfg-clnk-bloque-vincular') && EL('cfg-clnk-bloque-vincular').getBoundingClientRect().height > 0;
  /* EL HUECO DE LA COLUMNA DE AL LADO (decision 12f). En una grilla, la fila se alinea a la
     tarjeta mas alta: si CeiboLink mide 1800 y su vecina 300, debajo de la vecina quedan 1500
     de blanco. Se mide la DIFERENCIA de alto con la tarjeta anterior del DOM, que es la que le
     toca al lado en una grilla de dos columnas. */
  o.hueco = (function () {
    const cs = Array.prototype.slice.call(document.querySelectorAll('#tab-config .cfg-card'))
      .filter(e => e.getBoundingClientRect().height > 0);
    const i = cs.indexOf(card());
    if (i < 1) return { i: i, nota: 'no tiene vecina anterior visible' };
    const prev = cs[i - 1];
    const rc = card().getBoundingClientRect(), rp = prev.getBoundingClientRect();
    /* Misma fila = los dos arrancan a la misma altura. A una columna -768 px y menos- no hay
       vecina al lado y el hueco no existe. */
    const mismaFila = Math.abs(rc.top - rp.top) < 4;
    return { i: i, mismaFila: mismaFila, altoCard: Math.round(rc.height),
             altoVecina: Math.round(rp.height),
             hueco: mismaFila ? Math.max(0, Math.round(rc.height - rp.height)) : 0,
             vecina: N((prev.querySelector('.cfg-sec-title') || {}).textContent).slice(0, 26) };
  })();

  if (!o.hayCompacto) { o.nota = 'panel viejo: solo se midio el alto'; return o; }
  /* Los 44 px del renglon que se toca, y el ancho real. */
  o.e2.summarys = Array.prototype.slice.call(card().querySelectorAll('.clnk-det > summary'))
    .map(e => Math.round(e.getBoundingClientRect().height)).join('/');
  o.e2.bajo44 = Array.prototype.slice.call(card().querySelectorAll('.clnk-det > summary'))
    .filter(e => e.getBoundingClientRect().height < 43.5).length;

  /* ── ESTADO 3 · DOS EQUIPOS Y UNA SECCION ABIERTA ──────────────────────────────────────
     Es el tercero que la decision 12f pide. Con DOS equipos y uno esperando decision la seccion
     se abre sola, asi que este estado sale de poner el escenario y releer. */
  const det = EL('cfg-clnk-det-equipos');
  await fetch('${BASE}/_control', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reset: true, equipos: 2 }) });
  try { await clnkLeerEstado(); } catch (e) {}
  await esp(1100);
  o.e3 = { alto: alto(card()), abiertaSola: det ? det.open : 'NO',
           equipos: EL('cfg-clnk-equipos') ? EL('cfg-clnk-equipos').querySelectorAll('[data-clnk-acc]').length : -1,
           filas: EL('cfg-clnk-equipos') ? EL('cfg-clnk-equipos').querySelectorAll('bdi').length : -1 };

  /* ── EQUIPOS SE ABRE SOLA CON UN EQUIPO ESPERANDO DECISION ───────────────────────────── */
  if (det) det.open = false;
  await fetch('${BASE}/_control', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reset: true, equipos: 2 }) });
  try { await clnkLeerEstado(); } catch (e) {}
  await esp(900);
  o.abreSola = det ? det.open : 'NO';
  o.abreSolaCnt = N(EL('cfg-clnk-eq-cnt') ? EL('cfg-clnk-eq-cnt').textContent : '');
  /* Y el control NEGATIVO: sin ninguno esperando, NO se abre sola. */
  if (det) det.open = false;
  await fetch('${BASE}/_control', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reset: true, equipos: 1 }) });
  try { await clnkLeerEstado(); } catch (e) {}
  await esp(900);
  o.noAbreSola = det ? det.open : 'NO';

  /* ── EL REPINTADO NO BORRA NINGUNA PARTE ESTATICA (la leccion de ECO-CONECTOR-1) ─────── */
  const EST = ['cfg-clnk-on','cfg-clnk-cuerpo','cfg-clnk-estado','cfg-clnk-nums','cfg-clnk-luz',
               'cfg-clnk-codigo','cfg-clnk-vincular-btn','cfg-clnk-vmsg','cfg-clnk-donde',
               'cfg-clnk-bloque-vincular','cfg-clnk-bloque-desvincular','cfg-clnk-conexion',
               'cfg-clnk-equipos','cfg-clnk-ajustes','cfg-clnk-horas','cfg-clnk-aet',
               'cfg-clnk-amsg','cfg-clnk-ayuda','cfg-clnk-ayuda-btn','cfg-clnk-ayuda-cuerpo',
               'cfg-clnk-descargar','cfg-clnk-det-conexion','cfg-clnk-det-equipos',
               'cfg-clnk-det-ajustes','cfg-clnk-eq-cnt'];
  const faltanAntes = EST.filter(id => !EL(id));
  /* Se repinta de las CUATRO formas que esconden o rearman partes del panel. */
  try { clnkToggle(false); } catch (e) {}
  try { clnkToggle(true); } catch (e) {}
  try { await clnkLeerEstado(); } catch (e) {}
  await esp(800);
  try { if (typeof _clnkEsconderDependientes === 'function') _clnkEsconderDependientes(); } catch (e) {}
  try { clnkRender(); } catch (e) {}
  try { await clnkLeerEstado(); } catch (e) {}
  await esp(900);
  o.estatico = { antes: faltanAntes.join(','), despues: EST.filter(id => !EL(id)).join(','),
                 n: EST.length };
  /* Y los dos campos de Ajustes siguen SIENDO CAMPOS y con su valor repuesto. */
  o.ajustesVivos = (function () {
    const h = EL('cfg-clnk-horas'), a = EL('cfg-clnk-aet');
    return (h && a) ? (h.tagName + ':' + h.value + ' ' + a.tagName + ':' + a.value) : 'FALTAN';
  })();

  /* ── EL TECLADO ──────────────────────────────────────────────────────────────────────── */
  o.teclado = (function () {
    const d = EL('cfg-clnk-det-ajustes');
    if (!d) return 'NO';
    const sm = d.querySelector('summary');
    if (!sm) return 'SIN SUMMARY';
    const antes = !!d.open;
    sm.focus();
    const enfocado = document.activeElement === sm;
    /* El desplegable NATIVO: el navegador lo abre con Enter sobre el summary. En Playwright se
       dispara con el teclado de verdad desde afuera; aca se mide que sea ENFOCABLE y que el
       elemento sea el nativo, que es lo que le da el teclado. */
    return 'nativo:' + (d.tagName === 'DETAILS') + ' enfocable:' + enfocado + ' abierto:' + antes;
  })();

  /* ── LOS TEXTOS DEL CONECTOR ENTRAN COMO TEXTO ──────────────────────────────────────── */
  await fetch('${BASE}/_control', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reset: true, equipos: 2 }) });
  await fetch('${BASE}/v1/equipos/eq_3f8a1c', { method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ${F.token}' },
    body: JSON.stringify({ apodo: '<img src=x onerror=window.__XSS=1>' }) });
  try { await clnkLeerEstado(); } catch (e) {}
  await esp(1000);
  if (det) det.open = true;
  await esp(250);
  const cEq = EL('cfg-clnk-equipos');
  o.xss = { ejecuto: !!window.__XSS,
            imgs: cEq ? cEq.querySelectorAll('img').length : -1,
            conEvento: cEq ? Array.prototype.slice.call(cEq.querySelectorAll('*'))
              .filter(e => Array.prototype.slice.call(e.attributes || [])
                .some(a => /^on/i.test(a.name))).length : -1,
            literal: cEq ? (N(cEq.textContent).indexOf('<img src=x') > -1) : 'NO',
            enBdi: cEq ? Array.prototype.slice.call(cEq.querySelectorAll('bdi'))
              .some(b => (b.textContent || '').indexOf('<img') > -1) : 'NO' };

  /* ── EL ESPACIO ─────────────────────────────────────────────────────────────────────── */
  o.espacio = (function () {
    if (typeof clnkEspacio !== 'function') return 'NO EXISTE';
    const T = 2147483648;
    const r = [[0.5, null], [0.86, 'ambar'], [0.96, 'rojo']]
      .map(p => { const e = clnkEspacio(Math.round(T * p[0]), T); return (e ? e.nivel : 'null') + (e && e.nivel === p[1] || (!e && p[1] === null) ? '' : '!MAL'); });
    const piso = clnkEspacio(T - 10 * 1024 * 1024, T);
    return r.join(',') + ' piso:' + (piso ? piso.nivel : 'null');
  })();

  /* ── TEXTO RECORTADO Y DESPLAZAMIENTO ───────────────────────────────────────────────── */
  const rec = [];
  card().querySelectorAll('p,td,span,label,button,summary,code,div').forEach(e => {
    const t = (e.textContent || '').trim(); if (!t) return;
    if (getComputedStyle(e).overflowX === 'auto') return;
    if (e.children.length) return;
    if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible') rec.push(t.slice(0, 22));
  });
  o.recortados = rec;
  o.scrollPagina = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  /* Nada de CeiboLink fuera de la tarjeta, salvo los dos avisos y la bandeja, que tienen su
     propio prefijo a proposito. */
  o.fuera = Array.prototype.slice.call(document.querySelectorAll('[id^="cfg-clnk-"], [id^="clnk-"]'))
    .filter(e => !card().contains(e)).map(e => e.id).join(',');
  return o;
})()`;

const OUT = {};
for (const motor of ['chrome', 'webkit']) {
  const lanzador = motor === 'chrome' ? _pw.chromium : _pw.webkit;
  let nav = null;
  try { nav = await lanzador.launch(motor === 'chrome' ? { channel: 'chrome' } : {}); }
  catch (e) { OUT[motor] = { error: String(e).slice(0, 180) }; continue; }
  for (const tema of ['dia', 'noche']) {
    for (const w of [1440, 1280, 1000, 768, 390]) {
      const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
      const pg = await ctx.newPage();
      const errs = [];
      pg.on('console', x => { if (x.type() === 'error') errs.push('consola: ' + x.text().slice(0, 120)) });
      pg.on('pageerror', e => errs.push('pagina: ' + String(e.message).slice(0, 120)));
      try {
        await pg.goto(URL0, { waitUntil: 'load', timeout: 120000 });
        await pg.waitForTimeout(2600);
        const r = await pg.evaluate(MEDIR(tema));
        r.errores = errs;
        OUT[motor + '/' + tema + '/' + w] = r;
      } catch (e) { OUT[motor + '/' + tema + '/' + w] = { error: String(e).slice(0, 180), errores: errs }; }
      await ctx.close();
    }
  }
  await nav.close();
}
console.log(JSON.stringify(OUT, null, 1));
srv.close();
F.srv.close();
