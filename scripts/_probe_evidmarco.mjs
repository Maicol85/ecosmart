#!/usr/bin/env node
/**
 * _probe_evidmarco.mjs — sonda A/B de SOLO LECTURA para el MARCO del panel «Evidencia segun
 * guias»: el modal, el boton de maximizar, las dos columnas, las preguntas y el texto plegado.
 *
 * Infraestructura calcada de scripts/_probe_emevid.mjs (teclas reales, cierre del arbol de Chrome
 * por GRUPO, reloj sobre ev(), cierre del aviso legal con su denominador, md5 al principio y al
 * final). NO muta index.html.
 *
 *   node scripts/_probe_evidmarco.mjs --file /tmp/index.HEAD.html > /tmp/marco.HEAD.json
 *   node scripts/_probe_evidmarco.mjs                             > /tmp/marco.NEW.json
 *
 * Grupos (--solo texto|clics|teclado|maqueta):
 *   texto    — el textContent de CADA seccion, normalizado y con su hash y su conteo de palabras,
 *              mas el censo de <details> por marca y el de botones clinicos. Es la pieza que
 *              responde «el texto es IDENTICO a HEAD salvo las etiquetas nuevas».
 *   clics    — un clic REAL por cada pregunta de cada seccion, con el texto de la TARJETA DE
 *              RESULTADO antes y despues. El denominador se informa: cuantos botones habia.
 *   teclado  — Tab hasta el boton de maximizar, Enter, Esc, Esc. Mide donde queda el foco.
 *   maqueta  — 1200 / 390 / 360 px, tema oscuro y claro, normal y maximizado; ancho real de la
 *              tarjeta, barra horizontal y PEOR DESBORDE en px.
 *
 * ⚠️ DENOMINADOR. Una medicion de desborde sobre una tarjeta de ancho 0 da «no desborda», y un
 * conteo de inyecciones sobre un panel que no abrio da cero y parece impecable. Todas las escenas
 * informan cuantas secciones y cuantos botones vieron; un cero ahi invalida la escena, no la
 * aprueba.
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, extname, isAbsolute, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

/* ⚠️ EL ARBOL DE CHROME NO SE CIERRA CON `proc.kill()` — ver el comentario largo de
   _probe_emevid.mjs. Tres piezas: `detached:true`, matar el GRUPO (`-pid`), y colgar el barrido de
   `exit` ademas de las senales (el `process.exit` del camino de fallo no dispara SIGTERM).
   ⚠️ SOLO PIDs PROPIOS, NUNCA POR NOMBRE: un `pkill` se lleva el Chrome del usuario. */
const _ARNES_VIVOS = new Set();
let _arnesLimpiezaArmada = false;
function _arnesCerrarAlSalir(proc, perfil) {
  if (!proc || !proc.pid) return;
  _ARNES_VIVOS.add({ pid: proc.pid, perfil: perfil });
  if (_arnesLimpiezaArmada) return;
  _arnesLimpiezaArmada = true;
  const barrer = () => {
    for (const v of _ARNES_VIVOS) {
      try { process.kill(-v.pid, 'SIGKILL'); }
      catch (e) { try { process.kill(v.pid, 'SIGKILL'); } catch (e2) {} }
      if (v.perfil) { try { rmSync(v.perfil, { recursive: true, force: true }); } catch (e) {} }
    }
    _ARNES_VIVOS.clear();
  };
  process.on('exit', barrer);
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(sig, () => { barrer(); process.exit(130); });
  }
}

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const VER  = process.argv.includes('--ver');
const arg  = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const FARG = arg('--file') || 'index.html';
const EXTERNO = isAbsolute(FARG);
const FILE = EXTERNO ? '__ab__' + basename(FARG) : FARG;
const SOLO = arg('--solo');
const hacer = (g) => !SOLO || SOLO.split(',').indexOf(g) > -1;

const CHROMES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
];
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css',
               '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml',
               '.woff2':'font/woff2' };

function servir() {
  return new Promise((res) => {
    const srv = createServer(async (req, rq) => {
      try {
        const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || FILE;
        const p = (EXTERNO && rel === FILE) ? FARG : join(RAIZ, rel);
        if (!EXTERNO && !p.startsWith(RAIZ)) { rq.writeHead(403).end(); return; }
        const buf = await readFile(p);
        rq.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }).end(buf);
      } catch { rq.writeHead(404).end('no'); }
    });
    srv.listen(0, '127.0.0.1', () => res({ srv, port: srv.address().port }));
  });
}
async function abrirChrome(url) {
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-mar-'));
  let bin = null;
  for (const c of CHROMES) { try { await readFile(c); bin = c; break; } catch {} }
  if (!bin) throw new Error('No encontre Chrome/Chromium.');
  const args = ['--remote-debugging-port=0', `--user-data-dir=${perfil}`, '--no-first-run',
                '--no-default-browser-check', '--disable-extensions',
                '--window-size=1400,1000', url];
  if (!VER) args.unshift('--headless=new');
  const proc = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'], detached: true });
  _arnesCerrarAlSalir(proc, perfil);
  const wsUrl = await new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('Chrome no respondio en 20 s')), 20000);
    let acc = '';
    proc.stderr.on('data', (d) => {
      acc += d.toString();
      const m = acc.match(/ws:\/\/[^\s]+/);
      if (m) { clearTimeout(t); res(m[0]); }
    });
  });
  return { proc, perfil, wsUrl };
}
function conectar(wsUrl) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(wsUrl);
    let id = 0; const pend = new Map(); let api = null;
    ws.addEventListener('open', () => { api = {
      send: (method, params = {}, sessionId) => new Promise((ok, no) => {
        const msg = { id: ++id, method, params };
        if (sessionId) msg.sessionId = sessionId;
        pend.set(msg.id, { ok, no });
        ws.send(JSON.stringify(msg));
      }),
      close: () => ws.close(),
    }; res(api); });
    ws.addEventListener('error', rej);
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.method === 'Page.javascriptDialogOpening' && api && api.alDialogo) {
        try { api.alDialogo({ tipo: m.params?.type, mensaje: m.params?.message }); } catch (x) {}
      }
      if (m.id && pend.has(m.id)) {
        const { ok, no } = pend.get(m.id); pend.delete(m.id);
        m.error ? no(new Error(m.error.message)) : ok(m.result);
      }
    });
  });
}
async function md5(p) { return createHash('md5').update(await readFile(p)).digest('hex'); }

/* ══ Sonda inyectada ══════════════════════════════════════════════════════════════════════════
   ⚠️ CUERPO DE TEMPLATE LITERAL: NI UN ACENTO GRAVE adentro, tampoco en los comentarios.
   (scripts/check_backticks.py da la linea exacta cuando se cuela uno.) */
const SONDA = `
window.__M = {
  /* Normaliza el texto como lo lee un humano: colapsa blancos y saca los acentos, para que el
     hash no se mueva por un salto de linea que el maquetado cambio de lugar. */
  norm(s) { return String(s || '').replace(/\\s+/g, ' ').trim() },
  hash(s) { var h = 5381, t = window.__M.norm(s);
    for (var i = 0; i < t.length; i++) { h = ((h * 33) ^ t.charCodeAt(i)) >>> 0 }
    return h.toString(16) },
  palabras(s) { var t = window.__M.norm(s); return t ? t.split(' ').length : 0 },

  cuerpo() { return document.getElementById('indic-cuerpo') },
  card()   { return document.getElementById('indic-card') },

  /* Las secciones son los <details> HIJOS DIRECTOS del cuerpo. La bibliografia del pie no es una
     seccion, pero desde la bibliografia POR SECCION vive DENTRO de cada una, asi que aca no hay
     que excluir nada; se verifica igual contando las que llevan la marca. */
  secs() {
    var c = window.__M.cuerpo(); if (!c) return [];
    return Array.prototype.slice.call(c.querySelectorAll(':scope > details'))
      .filter(function(d){ return !d.hasAttribute('data-ind-biblio') }) },

  tituloDe(d) { var s = d.querySelector('summary'); return s ? window.__M.norm(s.textContent) : '?' },

  /* ⚠️ EL TEXTO DE UNA SECCION SE MIDE CON TODOS LOS <details> ABIERTOS, y es lo unico que lo
     hace comparable: textContent devuelve lo que hay en el DOM aunque este colapsado, pero un
     texto que se MOVIO de un <td> a un <details> sigue estando en el DOM. Lo que cambia entre
     HEAD y la version nueva es el ORDEN y las etiquetas nuevas, no el contenido, asi que se
     informan las dos cosas: el hash del texto COMPLETO y el del texto VISIBLE con todo cerrado. */
  textoSecs(abrirTodo) {
    var out = {};
    window.__M.secs().forEach(function(d){
      var c = d.cloneNode(true);
      if (!abrirTodo) {
        Array.prototype.slice.call(c.querySelectorAll('details')).forEach(function(n){
          if (!n.open) { var su = n.querySelector('summary');
            var keep = su ? su.textContent : ''; n.textContent = keep } });
      }
      var t = window.__M.norm(c.textContent);
      /* ⚠️ EL HASH **SIN LAS ETIQUETAS NUEVAS** ES EL QUE RESPONDE «identico a HEAD». El pliegue
         agrega un glifo ⓘ por pregunta plegada; el hash crudo difiere por eso y no dice nada. Se
         saca el ⓘ y se re-normaliza: si ESE hash coincide con el de HEAD, no se movio una letra.
         Se declaran los dos y cuantos ⓘ se quitaron, que es el denominador del descuento. */
      var sinEt = window.__M.norm(t.replace(/\u24d8/g, ' '));
      out[window.__M.tituloDe(d)] = { hash: window.__M.hash(t), pal: window.__M.palabras(t),
        len: t.length, hashSinEtiquetas: window.__M.hash(sinEt), lenSinEtiquetas: sinEt.length,
        infos: (t.match(/\u24d8/g) || []).length };
    });
    return out },

  /* Censo de <details> por marca. Es el denominador que TC-293 usa y el que un ⓘ nuevo mueve. */
  censoDetalles() {
    var c = window.__M.cuerpo(); if (!c) return null;
    var tod = Array.prototype.slice.call(c.querySelectorAll('details'));
    var cnt = function(sel){ return c.querySelectorAll(sel).length };
    return { total: tod.length, abiertos: tod.filter(function(d){ return d.open }).length,
      biblio: cnt('details[data-ind-biblio]'), detalle: cnt('details[data-ind-detalle]'),
      bloque: cnt('details[data-ind-bloque]'), info: cnt('details[data-ind-info]'),
      secciones: window.__M.secs().length,
      sinMarca: tod.filter(function(d){
        return !d.hasAttribute('data-ind-biblio') && !d.hasAttribute('data-ind-detalle') &&
               !d.hasAttribute('data-ind-bloque') && !d.hasAttribute('data-ind-info') &&
               d.parentElement !== c }).length } },

  /* Todos los botones de respuesta clinica, con su seccion. El par clave+valor es el gesto. */
  preguntas() {
    var c = window.__M.cuerpo(); if (!c) return [];
    var secDe = function(n){ var x = n; while (x && x !== c) {
        if (x.parentNode === c && x.tagName === 'DETAILS') return window.__M.tituloDe(x);
        x = x.parentNode } return '(fuera de seccion)' };
    return Array.prototype.slice.call(c.querySelectorAll('[data-ind-clin]')).map(function(b){
      return { sec: secDe(b), k: b.getAttribute('data-ind-clin'), v: b.getAttribute('data-ind-val'),
               t: window.__M.norm(b.textContent), on: b.getAttribute('aria-pressed') === 'true' } }) },

  /* LA TARJETA DE RESULTADO de cada seccion. Es el <div> del bloque de recomendacion: se lo
     identifica por su borde izquierdo de 3 px, que es la unica firma estable que tiene
     (_indRecomHTML lo arma con border-left:3px solid <color>). Si no hay, se informa null, que
     es distinto de la cadena vacia. */
  tarjetas() {
    var out = {};
    window.__M.secs().forEach(function(d){
      var cand = Array.prototype.slice.call(d.querySelectorAll('div')).filter(function(n){
        return /border-left:3px solid/.test(n.getAttribute('style') || '') });
      out[window.__M.tituloDe(d)] = cand.length
        ? cand.map(function(n){ return window.__M.norm(n.textContent) }).join(' || ') : null });
    return out },

  /* Geometria: ancho de la tarjeta del panel y PEOR DESBORDE horizontal dentro de cada seccion.
     El denominador va al lado: sin ancho de tarjeta la medicion de desborde no significa nada. */
  geo() {
    var card = window.__M.card(), c = window.__M.cuerpo();
    if (!card || !c) return { err: 'sin tarjeta o sin cuerpo' };
    var cr = card.getBoundingClientRect(), doc = document.documentElement;
    if (cr.width < 2) return { err: 'tarjeta de ancho 0 — la medicion no vale', cardW: cr.width };
    var peor = null;
    var lim = c.getBoundingClientRect();
    Array.prototype.slice.call(c.querySelectorAll('tr,td,div,table,button,details')).forEach(function(n){
      var r = n.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return;
      var ex = Math.round(r.right - lim.right);
      if (peor === null || ex > peor.ex) peor = { ex: ex, w: Math.round(r.width),
        tag: n.tagName.toLowerCase(),
        t: window.__M.norm(n.textContent).slice(0, 44) };
    });
    return { cardW: Math.round(cr.width), cardH: Math.round(cr.height),
      cuerpoScrollW: c.scrollWidth, cuerpoClientW: c.clientWidth,
      barraEnCuerpo: c.scrollWidth > c.clientWidth + 1,
      docScrollW: doc.scrollWidth, docClientW: doc.clientWidth,
      barraEnDoc: doc.scrollWidth > doc.clientWidth + 1,
      peorDesborde: peor, nodosMedidos: c.querySelectorAll('tr,td,div,table,button,details').length } },

  /* Las dos columnas: cuantas secciones pintan la grilla de dos, y si las columnas se solapan en
     vertical (que es como se ve que la grilla NO actuo aunque la clase este puesta). */
  columnas() {
    var out = [];
    window.__M.secs().forEach(function(d){
      var g = d.querySelector('[data-ind-grid]');
      if (!g) { out.push({ sec: window.__M.tituloDe(d), grid: false }); return }
      var cs = getComputedStyle(g);
      var hijos = Array.prototype.slice.call(g.children).map(function(n){
        var r = n.getBoundingClientRect();
        return { col: n.getAttribute('data-ind-col'), x: Math.round(r.left), w: Math.round(r.width) } });
      out.push({ sec: window.__M.tituloDe(d), grid: true, cols: cs.gridTemplateColumns,
                 dos: hijos.length === 2 && hijos[0].x + 4 < hijos[1].x, hijos: hijos });
    });
    return out },

  maximizado() {
    var card = window.__M.card();
    var b = document.getElementById('indic-max');
    return { attr: card ? card.getAttribute('data-ind-max') : null,
             boton: b ? { existe: true, label: b.getAttribute('aria-label'),
               pressed: b.getAttribute('aria-pressed'), txt: window.__M.norm(b.textContent),
               visible: b.offsetWidth > 0 && b.offsetHeight > 0 } : { existe: false } } },

  focoAhora() {
    var a = document.activeElement; if (!a) return null;
    var c = window.__M.cuerpo(), card = window.__M.card();
    /* La COLUMNA del nodo con foco: es lo que hace observable el orden de tabulacion en la
       grilla. Sin esto, «el orden es logico» se afirma mirando el DOM, que es justo lo que una
       grilla puede desmentir. */
    var col = a.closest ? a.closest('[data-ind-col]') : null;
    var sec = null;
    if (c && c.contains(a)) { var x = a; while (x && x !== c) {
      if (x.parentNode === c && x.tagName === 'DETAILS') { var su = x.querySelector('summary');
        sec = su ? window.__M.norm(su.textContent) : '?'; break } x = x.parentNode } }
    return { tag: a.tagName.toLowerCase(), id: a.id || null,
      label: a.getAttribute ? (a.getAttribute('aria-label') || null) : null,
      clin: a.getAttribute ? a.getAttribute('data-ind-clin') : null,
      val: a.getAttribute ? a.getAttribute('data-ind-val') : null,
      col: col ? col.getAttribute('data-ind-col') : null, sec: sec,
      txt: window.__M.norm(a.textContent).slice(0, 36),
      dentroDelPanel: !!(card && card.contains(a)),
      dentroDelCuerpo: !!(c && c.contains(a)) } },

  overlayVisible() {
    var ov = document.getElementById('indic-overlay');
    return ov ? getComputedStyle(ov).display : 'NO EXISTE' },

  tema(claro) {
    document.documentElement.classList.toggle('light-mode', !!claro);
    return document.documentElement.className },

  /* ⚠️ CONTRASTE MEDIDO, NO ELEGIDO A OJO. Los botones de respuesta cambian de color al marcarse
     y el pedido exige contraste suficiente en los DOS temas. Se lee el color COMPUTADO del nodo
     y de su fondo efectivo (subiendo hasta el primer ancestro con fondo opaco) y se calcula el
     cociente WCAG. */
  contrasteBotones() {
    var c = window.__M.cuerpo(); if (!c) return [];
    var lum = function(rgb){
      var p = rgb.map(function(v){ v = v / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) });
      return 0.2126 * p[0] + 0.7152 * p[1] + 0.0722 * p[2] };
    var par = function(s){ var m = String(s).match(/[\\d.]+/g); return m ? m.slice(0,3).map(Number) : null };
    var fondoDe = function(n){ var x = n;
      while (x && x.nodeType === 1) { var b = getComputedStyle(x).backgroundColor;
        var a = String(b).match(/rgba?\\(([^)]+)\\)/);
        if (a) { var v = a[1].split(',').map(function(s){ return parseFloat(s) });
          if (v.length < 4 || v[3] > 0.5) return v.slice(0,3) }
        x = x.parentNode }
      return [0,0,0] };
    var vistos = {};
    Array.prototype.slice.call(c.querySelectorAll('[data-ind-clin]')).forEach(function(b){
      var on = b.getAttribute('aria-pressed') === 'true';
      var key = on ? 'marcado' : 'sin marcar';
      if (vistos[key]) return;
      var fg = par(getComputedStyle(b).color), bg = fondoDe(b);
      if (!fg) return;
      var l1 = lum(fg), l2 = lum(bg);
      vistos[key] = { fg: fg, bg: bg,
        ratio: Math.round(((Math.max(l1,l2) + 0.05) / (Math.min(l1,l2) + 0.05)) * 100) / 100,
        alto: Math.round(b.getBoundingClientRect().height),
        ancho: Math.round(b.getBoundingClientRect().width) };
    });
    return vistos },

  /* FRASES LARGAS QUE QUEDAN VISIBLES (reporte del commit C). Se recorre el texto del cuerpo de
     cada seccion CON LOS <details> COLAPSADOS QUITADOS, que es lo que el medico ve de entrada. */
  frasesLargas(minPal) {
    var out = [];
    window.__M.secs().forEach(function(d){
      var tit = window.__M.tituloDe(d);
      var c = d.cloneNode(true);
      Array.prototype.slice.call(c.querySelectorAll('details')).forEach(function(n){
        if (!n.open) n.remove() });
      /* Por NODO DE TEXTO y no por oracion: una celda es una unidad de lectura. */
      var w = document.createTreeWalker(c, NodeFilter.SHOW_ELEMENT, null);
      var n, vistos = {};
      while ((n = w.nextNode())) {
        if (n.children.length) continue;
        var t = window.__M.norm(n.textContent);
        var p = window.__M.palabras(t);
        if (p < minPal || vistos[t]) continue;
        vistos[t] = 1;
        out.push({ sec: tit, pal: p, nodo: n.tagName.toLowerCase(),
          id: n.id || null, diez: t.split(' ').slice(0, 10).join(' ') });
      }
    });
    return out },

  /* CENSO DE NOTAS por tipo de fila y por marca. Es lo que dimensiona el pliegue del ⓘ: cuantas
     notas son de PREGUNTA (fila con ctrl) y cuantas de fila de dato, y cuantas palabras tiene
     cada una. Se lee del OBJETO que devuelve cada seccion, no del HTML: una nota que el
     renderizador no pinta —una fila sin nota no pinta sus refs— no se cuenta de mas. */
  censoNotas() {
    if (typeof IND_SECS === 'undefined') return { err: 'sin IND_SECS' };
    var out = { porSeccion: {}, totales: { ctrl: 0, dato: 0, ctrlLargas: 0, datoLargas: 0 } };
    IND_SECS.forEach(function(s){
      var r = null; try { r = s.fn() } catch (e) { return }
      if (!r) return;
      var filas = (r.filas || []).concat(r.clinica || []);
      (r.bloques || []).forEach(function(b){ (b.grupos || []).forEach(function(g){
        filas = filas.concat(g.filas || []) }) });
      var det = [];
      filas.forEach(function(f){
        var p = window.__M.palabras(f.nota || '');
        if (!p) return;
        var tipo = f.ctrl ? 'ctrl' : 'dato';
        out.totales[tipo]++;
        if (p > 25) out.totales[tipo + 'Largas']++;
        det.push({ lbl: f.lbl, tipo: tipo, marca: f.marca, pal: p,
          diez: window.__M.norm(f.nota).split(' ').slice(0, 10).join(' ') });
      });
      out.porSeccion[s.tit] = det;
    });
    return out },

  /* ══ LAS SEIS SUPERFICIES, ENUMERADAS UNA POR UNA ═══════════════════════════════════════════
     El protocolo de este repo prohibe decir «el informe y el Excel» en bloque: cada una tiene su
     propio emisor y se rompen por separado. Esta tanda NO debe mover ninguna —toca el panel, que
     ningun emisor lee—, asi que lo que se busca es CERO diferencia, con el denominador al lado
     (largo de cada texto y cantidad de columnas del Excel: un informe vacio da «identico»). */
  superficies() {
    var o = {};
    ['tecnico', 'narrativo', 'conciso'].forEach(function(est){
      try { if (typeof setEstiloInforme === 'function') setEstiloInforme(est) } catch (e) {}
      try { generarInforme() } catch (e) { o['informe_' + est] = 'EXC: ' + e.message; return }
      var inf = (document.getElementById('informe_texto') || {}).value || '';
      var suma = (document.getElementById('en_suma') || {}).value || '';
      o['informe_' + est] = { hash: window.__M.hash(inf), len: inf.length };
      o['suma_' + est]    = { hash: window.__M.hash(suma), len: suma.length };
    });
    /* EXCEL: la fila completa, con su CANTIDAD DE COLUMNAS al lado — 434 era la linea base al escribir esta sonda; 435 desde el 2026-10-12. */
    o.excel = (function(){
      if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
      var campos = {};
      document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
        try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return } catch(e){}
        campos[el.id] = el.value });
      document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
        campos[el.id + '__chk'] = el.checked ? '1' : '0' });
      try { var fila = _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-11', campos: campos });
        var ks = Object.keys(fila);
        return { columnas: ks.length, hash: window.__M.hash(JSON.stringify(fila)) };
      } catch(e){ return 'EXC: ' + e.message } })();
    /* PPT: la franja de hallazgos sale de _pptSel, que devuelve el TEXTO de la opcion cuando el
       nodo es un <select>. Se leen los grados valvulares, que es lo que esa franja imprime. */
    o.ppt = (function(){
      if (typeof _pptSel !== 'function') return 'SIN _pptSel';
      var out = {};
      ['ea_grado','em_grado','et_grado','ep_grado','im_grado','ia_grado','it_grado','vp_grado',
       'sexo','va_morf','vm_morf'].forEach(function(k){
        try { out[k] = _pptSel(k) } catch(e){ out[k] = 'EXC' } });
      return out })();
    /* LABORATORIO: la clasificacion de estenosis por valvula, que es lo que alimenta sus filas. */
    o.laboratorio = (function(){
      if (typeof _labEstenSev !== 'function') return 'SIN _labEstenSev';
      var campos = {};
      document.querySelectorAll('select[id], input[id]').forEach(function(el){ campos[el.id] = el.value });
      var out = {};
      ['ea_grado','em_grado','et_grado','ep_grado'].forEach(function(k){
        try { out[k] = _labEstenSev({ campos: campos }, k) } catch(e){ out[k] = 'EXC' } });
      return out })();
    /* PDF: no se dispara jsPDF (depende del CDN y de una descarga). Lo que se compara es el ARMADO
       de los campos guardados, que es de donde el PDF toma TODO lo que imprime: si ninguno se
       movio, el PDF no puede haberse movido. Se dice que es eso y no una generacion real. */
    o.camposGuardados = (function(){
      var c = {};
      document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){ c[el.id] = el.value });
      document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
        c[el.id + '__chk'] = el.checked ? '1' : '0' });
      return { n: Object.keys(c).length, hash: window.__M.hash(JSON.stringify(c)) } })();
    return o },

  /* ══ CENSO DEL PLIEGUE ══════════════════════════════════════════════════════════════════════
     Cuantas notas de PREGUNTA quedaron detras del ⓘ y cuantas visibles, y por que marca. Es el
     par que hace falsificable «se plegaron las preguntas y no las advertencias»: sin el reparto
     por marca, «todas plegadas» y «ninguna plegada» se informan igual de bien. */
  censoPliegue() {
    if (typeof IND_SECS === 'undefined') return { err: 'sin IND_SECS' };
    var c = window.__M.cuerpo();
    var out = { pregConNota: 0, pregPlegadas: 0, pregVisibles: 0, porMarca: {},
                datoConNota: 0, datoPlegadas: 0, infosEnDOM: c ? c.querySelectorAll('details[data-ind-info]').length : -1,
                detalle: [] };
    IND_SECS.forEach(function(s){
      var r = null; try { r = s.fn() } catch (e) { return }
      if (!r) return;
      var filas = (r.filas || []).concat(r.clinica || []);
      (r.bloques || []).forEach(function(b){ (b.grupos || []).forEach(function(g){
        filas = filas.concat(g.filas || []) }) });
      filas.forEach(function(f){
        if (!f.nota) return;
        var plegada = !!f.ctrl && f.marca !== 'alarm' && f.marca !== 'warn';
        if (f.ctrl) {
          out.pregConNota++;
          if (plegada) out.pregPlegadas++; else out.pregVisibles++;
          out.porMarca[f.marca] = out.porMarca[f.marca] || { plegadas: 0, visibles: 0 };
          out.porMarca[f.marca][plegada ? 'plegadas' : 'visibles']++;
          if (!plegada) out.detalle.push({ sec: s.tit, lbl: f.lbl, marca: f.marca,
            pal: window.__M.palabras(f.nota) });
        } else {
          out.datoConNota++;
          if (plegada) out.datoPlegadas++;
        }
      });
    });
    return out },

  /* ⚠️ NINGUN ⓘ NACE ABIERTO, y es la condicion central del pliegue: agregar el <details> y
     dejarlo con open se ve casi igual en el diff y no cambia nada para el medico. */
  infosAbiertos() {
    var c = window.__M.cuerpo(); if (!c) return null;
    var xs = Array.prototype.slice.call(c.querySelectorAll('details[data-ind-info]'));
    return { total: xs.length, abiertos: xs.filter(function(d){ return d.open }).length,
      conEtiqueta: xs.filter(function(d){ var su = d.querySelector('summary');
        return su && (su.getAttribute('aria-label') || '').length > 6 }).length,
      sinEtiqueta: xs.filter(function(d){ var su = d.querySelector('summary');
        return !su || !(su.getAttribute('aria-label') || '').length }).map(function(d){
          return window.__M.norm(d.textContent).slice(0, 30) }) } },

  /* Geometria de la botonera: alto real, redondeo, y si la botonera esta alineada al borde
     DERECHO de su celda. El alto es lo que responde «40 px en tactil, chico en escritorio». */
  geoBotones() {
    var c = window.__M.cuerpo(); if (!c) return null;
    var bs = Array.prototype.slice.call(c.querySelectorAll('[data-ind-clin]'))
      .filter(function(b){ var r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 });
    if (!bs.length) return { err: 'cero botones con geometria — la medicion no vale' };
    var alt = bs.map(function(b){ return Math.round(b.getBoundingClientRect().height) });
    var anc = bs.map(function(b){ return Math.round(b.getBoundingClientRect().width) });
    /* DESBORDE DE LA BOTONERA dentro de su celda: lo que responde «envuelven sin desbordar». */
    var peor = 0, quien = null;
    Array.prototype.slice.call(c.querySelectorAll('td.ind-ctrl')).forEach(function(td){
      var tr = td.getBoundingClientRect(); if (tr.width === 0) return;
      Array.prototype.slice.call(td.querySelectorAll('[data-ind-clin]')).forEach(function(b){
        var r = b.getBoundingClientRect(); if (r.width === 0) return;
        var ex = Math.round(r.right - tr.right);
        if (ex > peor) { peor = ex; quien = window.__M.norm(b.textContent) }
      });
    });
    /* ALINEACION: el ultimo boton de la botonera contra el borde derecho de la celda. */
    var alineados = [];
    Array.prototype.slice.call(c.querySelectorAll('td.ind-ctrl > div')).forEach(function(dv){
      var td = dv.parentElement.getBoundingClientRect();
      var bb = Array.prototype.slice.call(dv.querySelectorAll('[data-ind-clin]'));
      if (!bb.length) return;
      var ult = bb[bb.length - 1].getBoundingClientRect();
      if (td.width === 0 || ult.width === 0) return;
      alineados.push(Math.round(td.right - ult.right));
    });
    return { n: bs.length, altoMin: Math.min.apply(null, alt), altoMax: Math.max.apply(null, alt),
      anchoMin: Math.min.apply(null, anc), anchoMax: Math.max.apply(null, anc),
      radio: getComputedStyle(bs[0]).borderRadius,
      justify: (function(){ var dv = c.querySelector('td.ind-ctrl > div');
        return dv ? getComputedStyle(dv).justifyContent : null })(),
      punteroFino: matchMedia('(pointer:fine)').matches,
      punteroGrueso: matchMedia('(pointer:coarse)').matches,
      peorDesbordeEnCelda: peor, quienDesborda: quien,
      holguraDerechaMin: alineados.length ? Math.min.apply(null, alineados) : null,
      holguraDerechaMax: alineados.length ? Math.max.apply(null, alineados) : null } },

  /* ⚠️ CONTROL NEGATIVO DEL PLIEGUE: UNA PREGUNTA CON MARCA 🔴 NO SE PLIEGA. Sin esto, «se
     plegaron las preguntas y no las advertencias» se cumple por vacuidad — con el formulario
     sembrado TODAS las preguntas estan en ask, asi que la compuerta por marca no se ejerce y un
     mutante que pliegue tambien las alarmas sobrevive. Se le pregunta por la clave: donde esta su
     nota en el DOM, dentro o fuera de un [data-ind-info]. */
  notaDe(clave) {
    var c = window.__M.cuerpo(); if (!c) return { err: 'sin cuerpo' };
    var b = c.querySelector('[data-ind-clin="' + clave + '"]');
    if (!b) return { err: 'no existe la pregunta ' + clave };
    var tr = b.closest('tr'); if (!tr) return { err: 'la pregunta no esta en una fila' };
    var tds = tr.querySelectorAll('td');
    if (tds.length < 3) return { err: 'la fila no tiene tres celdas' };
    var celda = tds[2];
    var info = celda.querySelector('details[data-ind-info]');
    var txt = window.__M.norm(celda.textContent);
    return { rotulo: window.__M.norm(tds[0].textContent),
      plegada: !!info, abierta: info ? info.open : null,
      /* El texto que se ve SIN abrir nada: si la nota esta plegada queda el icono y el ⓘ. */
      visible: window.__M.norm((function(){ var cl = celda.cloneNode(true);
        Array.prototype.slice.call(cl.querySelectorAll('details')).forEach(function(d){
          if (!d.open) d.remove() });
        return cl.textContent })()),
      completo: txt,
      /* El estado que la fila declara, leido del OBJETO y no del icono: es lo que gobierna la
         compuerta, asi que es lo que hay que informar al lado del veredicto. */
      marcaEnDOM: (function(){
        var m = { '\u2705':'ok', '\uD83D\uDD34':'alarm', '\u26A0':'warn', '\u2753':'ask', '\u2014':'none' };
        for (var k in m) if (txt.indexOf(k) === 0) return m[k];
        return '?' + txt.slice(0, 3) })() } },

  /* Estado de partida. Sin esto cada escena arrastra las respuestas de la anterior. */
  limpiar() { try { limpiarCampos(true) } catch(e) {} return 1 },
  set(id, valor) {
    var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return 1 },
  recalc() {
    ['calcAo','calcEADetalle','calcVI','calcAI','calcVD','calcIT_ESC','calcIM_ESC','calcIA_ESC',
     'calcEM','calcET','calcVP','calcBSA','calcPSAP','mchSync','vabSync'].forEach(function(f){
       try { window[f] && window[f]() } catch (e) {} });
    return 1 },

  /* ⚠️ EL CENTRO DE UN NODO DEL PANEL, Y QUIEN ESTA AHI. Un clic despachado no es un clic
     recibido: si otro nodo tapa el punto, los eventos llegan y nada se mueve. */
  /* ⚠️ LA GEOMETRIA SE MIDE **ANTES** DE SCROLLEAR, Y ESA LINEA ES TODO EL HALLAZGO. Un boton
     dentro de un <details> CERRADO devuelve un rect de ceros; pero si se llama a scrollIntoView
     primero, Chrome fuerza un layout y DEVUELVE UNA POSICION PLAUSIBLE (medido: top 0 antes,
     2235 despues, con el contenedor sin scrollear y scrollTop inmovil en 0). Con la medicion
     despues del scroll la sonda informaba coordenadas validas de un nodo que nadie puede tocar,
     el clic caia fuera del viewport, el respaldo por TECLA mandaba Enter al documento y la corrida
     se COLGO 75 s. O sea: el denominador roto no daba cero, daba un numero creible. */
  centroSel(sel) {
    var e = document.querySelector(sel); if (!e) return { err: 'no existe ' + sel };
    var r0 = e.getBoundingClientRect();
    if (r0.width === 0 || r0.height === 0)
      return { err: 'nodo sin geometria — probablemente dentro de un <details> cerrado' };
    e.scrollIntoView({ block: 'center', inline: 'nearest' });
    var r = e.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return { err: 'nodo sin geometria tras scrollear' };
    if (r.top < 0 || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth)
      return { err: 'nodo fuera del viewport tras scrollear',
               rect: [Math.round(r.top), Math.round(r.left), Math.round(r.height)],
               win: [innerWidth, innerHeight] };
    var x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2);
    var q = document.elementFromPoint(x, y);
    return { x: x, y: y, esElBlanco: q === e || (e.contains && e.contains(q)),
      quien: q ? (q.tagName.toLowerCase() + (q.id ? '#' + q.id : '')) : null } },

  /* Abre TODAS las secciones devolviendo el selector de cada summary que hay que clickear: el
     gesto es del medico (un clic en el rotulo), no un .open = true por codigo. Devuelve solo
     las CERRADAS, para no cerrar las que ya estaban abiertas. */
  seccionesCerradas() {
    var c = window.__M.cuerpo(); if (!c) return [];
    var out = [];
    window.__M.secs().forEach(function(d, i){
      if (!d.open) { if (!d.id) d.id = '__secCerrada' + i; out.push('#' + d.id + ' > summary') }
    });
    return out },

  focoEn(sel) { var e = document.querySelector(sel); if (!e) return 0; e.focus(); return 1 }
};
1;
`;

async function main() {
  const antes = await md5(join(RAIZ, 'index.html'));
  const { srv, port } = await servir();
  const { proc, perfil, wsUrl } = await abrirChrome(`http://127.0.0.1:${port}/${FILE}`);
  const cdp = await conectar(wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const t = targetInfos.find((x) => x.type === 'page');
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);
  const dialogos = [];
  cdp.alDialogo = (d) => { dialogos.push(d);
    cdp.send('Page.handleJavaScriptDialog', { accept: true }, sessionId).catch(() => {}); };
  const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
  await pausa(2200);

  const RELOJ = 75000;
  let _paso = '(arranque)';
  const paso = (n) => { _paso = n; if (VER || process.env.MARCO_TRAZA) console.error('  · ' + n); };
  async function ev(expr) {
    const r = await Promise.race([
      cdp.send('Runtime.evaluate',
        { expression: expr, returnByValue: true, awaitPromise: true }, sessionId),
      new Promise((_, no) => setTimeout(() => no(new Error(
        'CDP sin respuesta en ' + (RELOJ / 1000) + ' s — paso ' + JSON.stringify(_paso))), RELOJ)),
    ]);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' :: ' + (r.exceptionDetails.exception || {}).description);
    return r.result.value;
  }
  const J = async (expr) => JSON.parse(await ev('JSON.stringify(' + expr + ')'));
  /* ⚠️ `cdp.send` SIN RELOJ CUELGA IGUAL QUE `ev`, Y ESTA SONDA LO HIZO: un
     `Input.dispatchMouseEvent` que no resuelve deja el proceso vivo y el archivo vacio, y el
     mensaje de fallo apunta al `ev` siguiente —o sea a la linea equivocada—. Todo lo que va por
     CDP pasa por acá. */
  async function cdpEnv(metodo, params) {
    return Promise.race([
      cdp.send(metodo, params, sessionId),
      new Promise((_, no) => setTimeout(() => no(new Error(
        metodo + ' sin respuesta en 20 s — paso ' + JSON.stringify(_paso))), 20000)),
    ]);
  }

  /* ⚠️ CLIC REAL, Y SE COMPRUEBA QUIEN ESTA EN EL PUNTO. Si el blanco esta tapado se cae a la
     TECLA, que en un <button> es activacion nativa. Enter sirve para un <button>; para un
     checkbox la tecla es ESPACIO, y este panel no tiene checkboxes. */
  const VK = { Backspace: 8, Delete: 46, Tab: 9, Enter: 13, Escape: 27, End: 35, Home: 36, Space: 32 };
  async function tecla(k, text, mods) {
    if (text) {
      await cdpEnv('Input.dispatchKeyEvent', { type: 'keyDown', key: k });
      await cdpEnv('Input.dispatchKeyEvent', { type: 'char', text, unmodifiedText: text, key: k });
      await cdpEnv('Input.dispatchKeyEvent', { type: 'keyUp', key: k });
      return;
    }
    const vk = VK[k] || 0;
    const p = { key: k, code: k, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk };
    if (mods) p.modifiers = mods;
    /* ⚠️ ENTER Y ESPACIO NECESITAN `text`, Y SIN ESO NO ACTIVAN UN <button>: medido, un
       Enter mandado como `rawKeyDown` pelado sobre #indic-max dejaba el panel sin maximizar y la
       sonda informaba «no maximiza» sobre un gesto que nunca ocurrio — el defecto correcto por la
       razon equivocada, que es indistinguible de un hallazgo falso. Blink activa el boton desde el
       KEYPRESS, y un `rawKeyDown` sin caracter detras no lo genera; con `type:'keyDown'` + `text`
       si. Las teclas de EDICION (Backspace, Tab, Escape) son al revés: van por el keycode y con
       `rawKeyDown`, que es la trampa que las otras sondas de este repo ya documentan. */
    const activadoras = { Enter: '\r', Space: ' ' };
    if (activadoras[k] !== undefined) {
      await cdpEnv('Input.dispatchKeyEvent', Object.assign({ type: 'keyDown',
        text: activadoras[k], unmodifiedText: activadoras[k] }, p));
      await cdpEnv('Input.dispatchKeyEvent', Object.assign({ type: 'keyUp' }, p));
      return;
    }
    await cdpEnv('Input.dispatchKeyEvent', Object.assign({ type: 'rawKeyDown' }, p));
    await cdpEnv('Input.dispatchKeyEvent', Object.assign({ type: 'keyUp' }, p));
  }
  async function clicSel(sel) {
    const c = await J(`window.__M.centroSel(${JSON.stringify(sel)})`);
    if (!c || c.err) return { via: 'NO SE PUDO', por: c ? c.err : 'no existe' };
    if (c.esElBlanco) {
      await cdpEnv('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 });
      await cdpEnv('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 });
      await pausa(150);
      return { via: 'mouse', punto: { x: c.x, y: c.y } };
    }
    /* ⚠️ EL RESPALDO POR TECLA EXIGE QUE EL FOCO HAYA LLEGADO AL BLANCO, y antes no lo exigia:
       un `.focus()` sobre un nodo no enfocable no hace nada y el Enter se iba al documento, que
       en esta app arranca otra cosa —la corrida se colgo 75 s—. Si el foco no quedo en el nodo,
       se informa y NO se manda ninguna tecla. */
    await ev(`window.__M.focoEn(${JSON.stringify(sel)})`);
    const foco = await J('window.__M.focoAhora()');
    const llego = await ev(`(function(){ var e=document.querySelector(${JSON.stringify(sel)});
      return !!(e && document.activeElement === e) })()`);
    if (!llego) return { via: 'NO SE PUDO', por: 'el foco no llego al blanco; no se manda tecla al documento',
                         tapadoPor: c.quien, foco };
    await tecla('Enter', null);
    await pausa(150);
    return { via: 'tecla Enter', tapadoPor: c.quien, foco };
  }

  /* ⚠️ CON LA EMULACION TACTIL PUESTA, `Input.dispatchMouseEvent` NO RESUELVE NUNCA. Medido: con
     `Emulation.setEmitTouchEventsForMouse` habilitado, el despacho del mousePressed se queda sin
     respuesta y la sonda se cuelga — lo cazo el reloj de `cdpEnv`, que nombro la llamada exacta;
     sin ese reloj el fallo habria aparecido en el `ev()` siguiente, o sea en la linea equivocada.
     En esas escenas se activa por TECLA, que en un <button> es una activacion nativa y es ademas
     el gesto que hay que poder garantizar. Se EXIGE que el foco haya llegado al blanco: un
     `.focus()` sobre un nodo no enfocable no hace nada y el Enter se iria al documento. */
  async function activarPorTecla(sel) {
    const ok = await ev(`(function(){ var e = document.querySelector(${JSON.stringify(sel)});
      if (!e) return 'no existe'; e.scrollIntoView({ block:'center' }); e.focus();
      return document.activeElement === e ? 'foco ok' : 'el foco no llego' })()`);
    if (ok !== 'foco ok') return { via: 'NO SE PUDO', por: ok };
    await tecla('Enter', null);
    await pausa(150);
    return { via: 'tecla Enter' };
  }

  await ev(`try{sessionStorage.setItem('ett_auth','1')}catch(e){}; location.reload(); 1`);
  await pausa(2600);
  await ev(SONDA);

  /* ⚠️ EL AVISO LEGAL TAPA LA PAGINA ENTERA Y SE COME TODOS LOS CLICS. Se cierra con su propio
     boton y se COMPRUEBA que se fue antes de medir nada: con el overlay puesto, ninguna escena de
     clic significa nada. */
  paso('cerrar el aviso legal');
  const avisoSel = await ev(`(function(){
    var m = document.getElementById('modalAvisoEco');
    if (!m) return 'NO EXISTE';
    if (getComputedStyle(m).display === 'none') return 'ya cerrado';
    var b = Array.from(m.querySelectorAll('button')).find(function(x){
      return /cerrarAvisoEco/.test(x.getAttribute('onclick') || '') });
    if (!b) return 'SIN BOTON';
    if (!b.id) b.id = '__avisoOk';
    return '#' + b.id })()`);
  const avisoClic = (avisoSel && avisoSel[0] === '#') ? await clicSel(avisoSel) : avisoSel;
  await pausa(300);
  const avisoCerrado = await ev(`(function(){ var m = document.getElementById('modalAvisoEco');
    return m ? getComputedStyle(m).display : 'NO EXISTE' })()`);

  /* ══ EL PACIENTE SEMBRADO ═══════════════════════════════════════════════════════════════════
     Mismo conjunto que TC-293: enciende VARIAS secciones a la vez. Con una sola, «todas las
     secciones comparten el patron» se cumple por vacuidad. `vm_morf` se fija por escena. */
  const SEMILLA = { peso:'80', talla:'180', edad:'62', sexo:'M',
    vmax_ao:'4.5', gmedio_ao:'45', diam_tsvi:'20', itv_tsvi:'18', itv_ao:'40',
    fevi:'55', dsfvi:'52', ao_sin:'48', ao_tub:'52', va_morf:'Bicúspide',
    im_grado:'4', ia_grado:'4', it_grado:'4', vmax_it:'3.2', vci_diam:'22',
    em_gmedio:'8', avm_cont:'1.2', et_gmedio:'7', vp_gmax:'70',
    mch_espesor:'18', mch_grad_reposo:'60', tapse:'14', s_prime:'8',
    ete_cia_tipo:'secundum', ete_cia_tam_max:'22', vd_bas:'46' };

  async function sembrar(morf) {
    await ev('window.__M.limpiar()');
    for (const [k, v] of Object.entries(SEMILLA)) await ev(`window.__M.set(${JSON.stringify(k)}, ${JSON.stringify(v)})`);
    if (morf) await ev(`window.__M.set('vm_morf', ${JSON.stringify(morf)})`);
    await ev('window.__M.recalc()');
    await pausa(220);
  }
  async function abrir() {
    await ev(`(function(){ try{ indicAbrir() }catch(e){ return 'EXC: ' + e.message } return 1 })()`);
    await pausa(320);
    return ev('window.__M.overlayVisible()');
  }
  async function cerrar() { await ev(`(function(){ try{ indicCerrar() }catch(e){} return 1 })()`); await pausa(120); }

  /* ⚠️ ABRIR LAS SECCIONES CERRADAS ANTES DE MEDIR, Y ES LA TRAMPA QUE ESTE REPO YA DOCUMENTA
     PARA LA PASADA DE CELULAR. Una seccion nace colapsada cuando ninguna de sus filas trae `ok`
     ni `alarm` y su recomendacion no es `ind` ni `alarma`: sus botones existen en el DOM, no
     tienen geometria, y una sonda que los cuenta mide 78 preguntas y puede tocar 52. El gesto es
     un CLIC REAL en el rotulo, que es como las abre el medico. */
  /* Bandera de escena: con la emulacion tactil puesta no se despachan eventos de mouse (ver el
     comentario de `activarPorTecla`). La ponen y la quitan las escenas que emulan el dedo. */
  let TACTIL = false;
  async function abrirSecciones() {
    const abiertos = [];
    for (let i = 0; i < 12; i++) {
      const cerradas = await J('window.__M.seccionesCerradas()');
      if (!cerradas.length) break;
      const r = TACTIL ? await activarPorTecla(cerradas[0]) : await clicSel(cerradas[0]);
      abiertos.push({ sel: cerradas[0], via: r.via, por: r.por || null });
      await pausa(120);
      /* Si el clic no movio nada se corta: sin esto el bucle reintenta la misma seccion doce
         veces y el informe dice «doce aperturas» sobre cero. */
      const quedan = await J('window.__M.seccionesCerradas()');
      if (quedan.length && quedan[0] === cerradas[0]) { abiertos.push({ sel: cerradas[0], via: 'NO ABRIO' }); break; }
    }
    return { aperturas: abiertos, cerradasQueQuedan: await J('window.__M.seccionesCerradas()') };
  }

  const out = { archivo: FARG, grupos: SOLO || 'todos',
    aviso: { selector: avisoSel, clic: avisoClic, display: avisoCerrado } };

  /* ══ 1 — TEXTO POR SECCION ════════════════════════════════════════════════════════════════ */
  if (hacer('texto')) {
    paso('texto por seccion');
    const T = {};
    for (const morf of ['Reumática', 'Normal', 'Calcificada']) {
      await sembrar(morf);
      const vis = await abrir();
      T[morf] = { overlay: vis,
        completo: await J('window.__M.textoSecs(true)'),
        visible:  await J('window.__M.textoSecs(false)'),
        censo:    await J('window.__M.censoDetalles()'),
        preguntas: await J('window.__M.preguntas()'),
        tarjetas: await J('window.__M.tarjetas()'),
        columnas: await J('window.__M.columnas()'),
        pliegue:  await J('window.__M.censoPliegue()'),
        infos:    await J('window.__M.infosAbiertos()'),
        max:      await J('window.__M.maximizado()') };
      await cerrar();
    }
    out.TEXTO = T;
  }

  /* ══ 2 — UN CLIC REAL POR PREGUNTA, Y LA TARJETA ANTES Y DESPUES ══════════════════════════ */
  if (hacer('clics')) {
    paso('clics reales sobre cada pregunta');
    await sembrar('Reumática');
    await abrir();
    const ap = await abrirSecciones();
    const lista = await J('window.__M.preguntas()');
    /* DENOMINADOR: cuantas preguntas hay y cuantas tienen geometria. Sin este par, «todas dieron
       la misma tarjeta» se cumple tambien cuando ninguna se pudo tocar. */
    const conGeo = await ev(`Array.prototype.slice.call(
      document.querySelectorAll('#indic-cuerpo [data-ind-clin]')).filter(function(b){
        var r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 }).length`);
    const res = { denominador: lista.length, conGeometria: conGeo, aperturas: ap, escenas: [] };
    for (const q of lista) {
      paso('clic ' + q.k + '=' + q.v + ' (' + q.sec + ')');
      const sel = `#indic-cuerpo [data-ind-clin="${q.k}"][data-ind-val="${q.v}"]`;
      const antesT = await J('window.__M.tarjetas()');
      const antesOn = await ev(`(function(){ var b=document.querySelector(${JSON.stringify(sel)});
        return b ? b.getAttribute('aria-pressed') : 'NO EXISTE' })()`);
      const cl = await clicSel(sel);
      await pausa(180);
      const despuesT = await J('window.__M.tarjetas()');
      const despuesOn = await ev(`(function(){ var b=document.querySelector(${JSON.stringify(sel)});
        return b ? b.getAttribute('aria-pressed') : 'NO EXISTE' })()`);
      res.escenas.push({ sec: q.sec, k: q.k, v: q.v, clic: cl.via,
        por: cl.por || null, tapadoPor: cl.tapadoPor || null,
        pressedAntes: antesOn, pressedDespues: despuesOn,
        gestoOcurrio: antesOn !== despuesOn,
        tarjetaAntes: antesT[q.sec] === undefined ? '(sin seccion)' : antesT[q.sec],
        tarjetaDespues: despuesT[q.sec] === undefined ? '(sin seccion)' : despuesT[q.sec] });
      /* ⚠️ EL CONTRASTE DEL ESTADO MARCADO SE MIDE **CON LA OPCION MARCADA**, y no al final: al
         final todas quedaron desmarcadas y el censo informaba un solo estado de los dos. */
      if (despuesOn === 'true' && !res.contrasteMarcado)
        res.contrasteMarcado = await J('window.__M.contrasteBotones()');
      /* Se devuelve la respuesta al estado anterior: un segundo toque sobre la opcion activa la
         desmarca, que es la semantica que `_indClinCablear` ya tiene. Asi cada escena parte del
         mismo estado y las escenas no se contaminan. */
      if (antesOn !== despuesOn) await clicSel(sel);
      await pausa(120);
    }
    res.contraste = await J('window.__M.contrasteBotones()');

    /* ══ CONTROL NEGATIVO: LA ADVERTENCIA NO SE PLIEGA ═══════════════════════════════════════
       `em.calcsev` es una de las cuatro contraindicaciones de la Tabla 8: contestada «Presente»
       su marca pasa a 🔴 y su nota es «contraindicacion de la comisurotomia percutanea». Se mide
       ANTES (sin contestar, 🔴 ausente → plegada) y DESPUES (🔴 → VISIBLE). Las dos mitades hacen
       falta: sola la segunda no distingue «no se pliega nunca» de «no se pliega cuando alarma». */
    const NEG = {};
    NEG.antesDeContestar = await J(`window.__M.notaDe('em.calcsev')`);
    const rNeg = await clicSel('#indic-cuerpo [data-ind-clin="em.calcsev"][data-ind-val="si"]');
    await pausa(200);
    NEG.via = rNeg.via;
    NEG.trasContestarPresente = await J(`window.__M.notaDe('em.calcsev')`);
    /* Y la tercera lectura: contestada «Ausente» la marca cae a — y la nota vuelve a plegarse.
       Es lo que prueba que la compuerta sigue la MARCA y no «la pregunta ya fue contestada». */
    await clicSel('#indic-cuerpo [data-ind-clin="em.calcsev"][data-ind-val="no"]');
    await pausa(200);
    NEG.trasContestarAusente = await J(`window.__M.notaDe('em.calcsev')`);
    res.controlNegativoAlarma = NEG;

    await cerrar();
    out.CLICS = res;
  }

  /* ══ 2b — LA BOTONERA: tamanio, redondeo, alineacion y CONTRASTE ══════════════════════════
     Los dos temas y los dos punteros, porque el pedido pide las cuatro cosas a la vez: chico en
     escritorio, >= 40 px con el dedo, y contraste suficiente marcado y sin marcar en claro y en
     oscuro. El puntero grueso se emula con `mobile:true` en las metricas del dispositivo. */
  if (hacer('botones')) {
    paso('botonera');
    const Bt = {};
    for (const claro of [false, true]) {
      for (const [etqP, ancho, movil] of [['puntero fino', 1200, false], ['puntero grueso', 1200, true]]) {
        const etq = (claro ? 'claro' : 'oscuro') + ' / ' + etqP;
        await cerrar();
        await cdpEnv('Emulation.setDeviceMetricsOverride',
          { width: ancho, height: 900, deviceScaleFactor: 1, mobile: movil });
        TACTIL = movil;
        /* ⚠️ DOS LEVERS NO SIRVEN Y EL TERCERO SI, Y LOS DOS PRIMEROS DIERON UN FALSO QUE PARECIA
           UN PASE. Medido uno por uno sobre un Chrome limpio:
             · `Emulation.setDeviceMetricsOverride` con `mobile:true` → pointer:coarse FALSE;
             · `Emulation.setEmulatedMedia` con el feature `pointer` → aceptado y FALSE (esa lista
               sólo soporta los `prefers-*`, `color-gamut` y `forced-colors`);
             · `Emulation.setTouchEmulationEnabled` con `maxTouchPoints` → pointer:coarse TRUE,
               any-pointer:coarse TRUE, pointer:fine FALSE, maxTouchPoints 5.
           Con los dos primeros la escena del dedo medía 26 px de alto e informaba
           `punteroGrueso:false` al lado: un «cumple en táctil» sobre una escena que seguía siendo
           de mouse. Por eso `punteroGrueso` se informa en CADA escena — es el denominador de la
           medición del piso táctil, y sin él el falso pasa. */
        if (movil) {
          await cdpEnv('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
          await cdpEnv('Emulation.setEmitTouchEventsForMouse', { enabled: true, configuration: 'mobile' });
        } else {
          await cdpEnv('Emulation.setTouchEmulationEnabled', { enabled: false });
          await cdpEnv('Emulation.setEmitTouchEventsForMouse', { enabled: false });
        }
        await ev(`window.__M.tema(${claro})`);
        await sembrar('Reumática');
        await abrir();
        await abrirSecciones();
        const sinMarcar = await J('window.__M.contrasteBotones()');
        const geo = await J('window.__M.geoBotones()');
        /* Con UNA opcion marcada: el estado marcado cambia de fondo y de color, asi que su
           contraste es OTRO numero y hay que medirlo con la opcion puesta. */
        const lista = await J('window.__M.preguntas()');
        let marcado = null;
        let viaMarca = null;
        if (lista.length) {
          const q = lista[0];
          const sel = `#indic-cuerpo [data-ind-clin="${q.k}"][data-ind-val="${q.v}"]`;
          const r = movil ? await activarPorTecla(sel) : await clicSel(sel);
          viaMarca = r.via + (r.por ? ' (' + r.por + ')' : '');
          await pausa(160);
          /* DENOMINADOR DEL CONTRASTE MARCADO: si el gesto no ocurrio, lo que se mide es el
             estado sin marcar otra vez y el numero parece bueno por el motivo equivocado. */
          const quedo = await ev(`(function(){ var b=document.querySelector(${JSON.stringify(sel)});
            return b ? b.getAttribute('aria-pressed') : 'NO EXISTE' })()`);
          marcado = { via: viaMarca, pressed: quedo, medida: await J('window.__M.contrasteBotones()') };
        }
        Bt[etq] = { geo, contrasteSinMarcar: sinMarcar, contrasteConUnaMarcada: marcado,
          infos: await J('window.__M.infosAbiertos()') };
        await cerrar();
      }
    }
    TACTIL = false;
    await ev('window.__M.tema(false)');
    await cdpEnv('Emulation.setTouchEmulationEnabled', { enabled: false });
    await cdpEnv('Emulation.setEmitTouchEventsForMouse', { enabled: false });
    await cdpEnv('Emulation.clearDeviceMetricsOverride', {});
    out.BOTONES = Bt;
  }

  /* ══ 3 — TECLADO: Tab hasta maximizar, Enter, Esc, Esc ════════════════════════════════════ */
  if (hacer('teclado')) {
    paso('teclado');
    await sembrar('Reumática');
    const K = { pasos: [] };
    K.overlayAlAbrir = await abrir();
    K.focoAlAbrir = await J('window.__M.focoAhora()');
    /* Tab desde el principio del panel. Se enfoca el titulo del panel con un clic real sobre el
       encabezado y se tabula; el tope es 14 para que un boton que no exista no cuelgue la sonda. */
    await ev(`window.__M.focoEn('#indic-card')`);
    let hallado = null;
    for (let i = 0; i < 14 && !hallado; i++) {
      await tecla('Tab', null);
      await pausa(90);
      const f = await J('window.__M.focoAhora()');
      K.pasos.push({ tab: i + 1, foco: f });
      if (f && (f.id === 'indic-max' || /maximi|restaur/i.test(f.label || ''))) hallado = i + 1;
    }
    K.tabsHastaMaximizar = hallado;
    K.estadoAntes = await J('window.__M.maximizado()');
    if (hallado) {
      await tecla('Enter', null); await pausa(260);
      K.trasEnter = { max: await J('window.__M.maximizado()'), geo: await J('window.__M.geo()'),
        foco: await J('window.__M.focoAhora()'), columnas: await J('window.__M.columnas()') };
      await tecla('Escape', null); await pausa(260);
      K.trasEsc1 = { max: await J('window.__M.maximizado()'), overlay: await ev('window.__M.overlayVisible()'),
        foco: await J('window.__M.focoAhora()') };
      await tecla('Escape', null); await pausa(260);
      K.trasEsc2 = { overlay: await ev('window.__M.overlayVisible()'),
        foco: await J('window.__M.focoAhora()') };
    }
    /* ══ ORDEN DE TABULACION CON DOS COLUMNAS ═══════════════════════════════════════════════
       Se maximiza, se abren las secciones cerradas y se tabula 40 veces registrando, de cada
       parada, la seccion y la COLUMNA. Lo que tiene que salir es eco antes que preguntas DENTRO
       de cada seccion, y las secciones en su orden de pantalla. La trampa de Tab del bloque de
       accesibilidad cicla dentro del dialogo, asi que el recorrido se cierra sobre si mismo: eso
       se informa y no se trata como un final inesperado. */
    await abrir();
    const rMax = await clicSel('#indic-max');
    await abrirSecciones();
    await pausa(250);
    const orden = [];
    await ev(`window.__M.focoEn('#indic-card')`);
    for (let i = 0; i < 40; i++) {
      await tecla('Tab', null);
      await pausa(40);
      const f = await J('window.__M.focoAhora()');
      orden.push(f ? { id: f.id, clin: f.clin, val: f.val, col: f.col, sec: f.sec,
                       dentro: f.dentroDelPanel } : null);
    }
    K.ordenTab = { clicMax: rMax.via, maximizado: await J('window.__M.maximizado()'),
      dosColumnas: (await J('window.__M.columnas()')).filter(c => c.dos).length,
      paradas: orden };
    await cerrar();

    /* CONTROL NEGATIVO: con el panel NORMAL, un Esc cierra — eso es lo de hoy y no tiene que
       cambiar. Se mide en una apertura limpia. */
    await abrir();
    const n0 = await ev('window.__M.overlayVisible()');
    await ev(`window.__M.focoEn('#indic-card')`);
    await tecla('Escape', null); await pausa(260);
    K.controlNegativo = { antes: n0, despues: await ev('window.__M.overlayVisible()') };
    await cerrar();
    out.TECLADO = K;
  }

  /* ══ 4 — MAQUETA: anchos × tema × normal/maximizado ═══════════════════════════════════════
     ⚠️ EL ANCHO SE EMULA Y LUEGO SE ABRE EL PANEL, en ese orden. Y el denominador es el ancho de
     la tarjeta: un desborde medido sobre una tarjeta de ancho 0 da «no desborda». */
  if (hacer('maqueta')) {
    paso('maqueta');
    const M = {};
    for (const claro of [false, true]) {
      for (const ancho of [1200, 390, 360]) {
        for (const maxim of [false, true]) {
          if (maxim && ancho !== 1200) continue;
          const etq = (claro ? 'claro' : 'oscuro') + ' @ ' + ancho + (maxim ? ' MAXIMIZADO' : '');
          await cerrar();
          await cdp.send('Emulation.setDeviceMetricsOverride',
            { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 700 }, sessionId);
          await ev(`window.__M.tema(${claro})`);
          const escenas = {};
          for (const morf of ['Reumática', 'Normal', 'Calcificada']) {
            paso('maqueta ' + etq + ' / ' + morf + ' / sembrar');
            await sembrar(morf);
            paso('maqueta ' + etq + ' / ' + morf + ' / abrir');
            await abrir();
            if (maxim) { paso('maqueta ' + etq + ' / ' + morf + ' / clic maximizar');
              const r = await clicSel('#indic-max'); escenas['_clicMax_' + morf] = r.via; await pausa(280); }
            paso('maqueta ' + etq + ' / ' + morf + ' / medir');
            escenas[morf] = { geo: await J('window.__M.geo()'),
              max: await J('window.__M.maximizado()'),
              columnas: await J('window.__M.columnas()'),
              secciones: await ev('window.__M.secs().length') };
            await cerrar();
          }
          M[etq] = escenas;
        }
      }
    }
    await ev('window.__M.tema(false)');
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    out.MAQUETA = M;
  }

  /* ══ 5 — FRASES LARGAS VISIBLES (reporte del commit C, SIN CAMBIOS) ═══════════════════════
     ⚠️ EL DENOMINADOR DE ESTE REPORTE SON LAS QUINCE SECCIONES, Y CON UN SOLO PACIENTE NO SE
     ENCIENDEN. La semilla de las escenas de arriba prende NUEVE; la prótesis mitral APAGA las tres
     mitrales nativas (`vmEsProtesis`) y la IM secundaria apaga la primaria, así que hacen falta
     tres pacientes y hay que decir cuál aportó cada sección. Un reporte armado sobre nueve y
     presentado como «todas» es la forma en que una frase larga queda sin listar.
     Los datos mínimos de cada sección son los de `EVID_DATOS` de la suite, que ya están medidos
     uno por uno en el navegador. */
  if (hacer('frases')) {
    paso('frases largas visibles');
    const MINIMOS = {
      EA:   { ava_cont:'0.9', gmedio_ao:'46', vmax_ao:'4.3', fevi:'58', ea_grado:'severa' },
      IM:   { im_grado:'4', dsfvi:'42', ai_vol:'70', peso:'80', talla:'175' },
      EM:   { avm_plan:'1.2', em_grado:'severa' },
      IA:   { ia_grado:'4', dsfvi:'52' },
      VT:   { it_grado:'4', it_vc:'9' },
      EP:   { vp_gmax:'81', vp_vmax:'4.5', ep_grado:'Severa', ep_nivel:'Valvular' },
      CIA:  { ete_cia_tipo:'secundum', ete_cia_tam_max:'22', vd_bas:'46' },
      CIV:  { ete_civ_tipo:'perimembranosa', ete_civ_tam:'8' },
      DAP:  { dap_tipo:'no_restrictivo', dap_diam:'5', dap_vmax:'4.2' },
      CoAo: { coa_istmo:'6', coa_vmax:'3.2', coa_gmedio:'22', coa_hta:'si' },
      FOP:  { fop_shunt_valsalva:'si', fop_acv:'si', edad:'45', fop_burbujas:'abundante' },
      MCH:  { mch_grad_reposo:'62', mch_grad_valsalva:'80', mch_sam:'si', mch_cf:'iii_iv' },
      VAB:  { ao_tub:'48', ao_sin:'42', va_morf:'Bicúspide' },
    };
    const TODOS = Object.assign({}, ...Object.values(MINIMOS));
    /* Tres pacientes, y el motivo de cada uno escrito al lado. */
    const ESCENAS = [
      ['todas las nativas + congénitas (mitral REUMÁTICA)',
        Object.assign({}, TODOS, { vm_morf:'Reumática' })],
      ['IM SECUNDARIA (apaga la primaria)',
        Object.assign({}, TODOS, { vm_morf:'Reumática', teer_tipo_im:'secundaria' })],
      ['PRÓTESIS mitral (apaga las tres mitrales nativas)',
        Object.assign({}, TODOS, { vm_morf:'Prótesis mecánica' })],
    ];
    const F = {};
    for (const [etq, campos] of ESCENAS) {
      paso('frases / ' + etq);
      await ev('window.__M.limpiar()');
      for (const [k, v] of Object.entries(campos)) await ev(`window.__M.set(${JSON.stringify(k)}, ${JSON.stringify(v)})`);
      await ev('window.__M.recalc()');
      await pausa(260);
      await abrir();
      /* ⚠️ SE ABREN LAS SECCIONES COLAPSADAS, Y SIN ESO EL REPORTE SE COME LAS DE LAS SECCIONES
         CERRADAS: `frasesLargas` quita del clon los <details> CERRADOS, y una sección entera que
         nace colapsada desaparece completa. Con las nueve de la semilla anterior había UNA cerrada
         y el reporte habría salido sin una sola frase de la estenosis mitral. */
      const ap = await abrirSecciones();
      F[etq] = { secciones: await J('window.__M.secs().map(window.__M.tituloDe)'),
                 aperturas: ap,
                 largas: await J('window.__M.frasesLargas(26)') };
      await cerrar();
    }
    out.FRASES = F;
  }

  /* ══ 7 — LAS SEIS SUPERFICIES FIRMADAS ════════════════════════════════════════════════════ */
  if (hacer('superficies')) {
    paso('superficies');
    const S = {};
    for (const morf of ['Reumática', 'Normal', 'Calcificada']) {
      await sembrar(morf);
      /* SIN abrir el panel: es el estado del medico que nunca lo abrio, y es donde una fuga del
         panel hacia el papel se veria. */
      S[morf + ' / panel cerrado'] = await J('window.__M.superficies()');
      /* Y CON el panel abierto y contestado: el escenario donde el panel tiene estado propio. Si
         una respuesta clinica se filtrara al informe, aparece acá y no arriba. */
      await abrir();
      await abrirSecciones();
      const lista = await J('window.__M.preguntas()');
      for (const q of lista.slice(0, 12)) {
        await clicSel(`#indic-cuerpo [data-ind-clin="${q.k}"][data-ind-val="${q.v}"]`);
      }
      S[morf + ' / panel abierto y contestado'] = { preguntasTocadas: Math.min(12, lista.length),
        denominador: lista.length, sup: await J('window.__M.superficies()') };
      await cerrar();
    }
    out.SUPERFICIES = S;
  }

  /* ══ 6 — CENSO DE NOTAS (dimensiona el pliegue del ⓘ) ═════════════════════════════════════ */
  if (hacer('notas')) {
    paso('censo de notas');
    const N = {};
    for (const morf of ['Reumática', 'Normal', 'Calcificada']) {
      await sembrar(morf);
      await abrir();
      N[morf] = await J('window.__M.censoNotas()');
      await cerrar();
    }
    out.NOTAS = N;
  }

  const despues = await md5(join(RAIZ, 'index.html'));
  out.md5_antes = antes; out.md5_despues = despues; out.index_intacto = antes === despues;
  out.dialogos = dialogos;
  console.log(JSON.stringify(out, null, 2));
  /* ⚠️ CERRAR EL SERVIDOR Y SALIR A PROPOSITO: con el server escuchando el event loop sigue vivo y
     el proceso no sale — los zombies que CLAUDE.md documenta. */
  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
