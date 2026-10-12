#!/usr/bin/env node
/**
 * _probe_evidterm.mjs — sonda A/B de SOLO LECTURA para los DOS «ⓘ» DE TERMINO del panel de
 * Evidencia (Cormier y score ecocardiografico) y su tarjeta.
 *
 * Infraestructura calcada de scripts/_probe_evidmarco.mjs (teclas y clics reales, cierre del
 * arbol de Chrome por GRUPO, reloj sobre ev() y sobre cdp.send(), cierre del aviso legal con su
 * denominador, md5 al principio y al final). NO muta index.html.
 *
 *   node scripts/_probe_evidterm.mjs --file /tmp/index.HEAD.html > /tmp/term.HEAD.json
 *   node scripts/_probe_evidterm.mjs                             > /tmp/term.NEW.json
 *
 * Grupos (--solo texto|tarjetas|teclado|aislamiento|convive):
 *   texto       — el textContent de CADA seccion con su hash, y el MISMO hash con los glifos ⓘ
 *                 quitados. Es la pieza que responde «el texto es IDENTICO a HEAD salvo los dos
 *                 ⓘ nuevos»: el hash sin glifos tiene que coincidir con HEAD y el conteo de ⓘ
 *                 tiene que subir exactamente 2, y solo en la estenosis mitral.
 *   tarjetas    — las dos tarjetas abiertas a 1200 (normal y maximizado), 390 y 360 px, en tema
 *                 claro y oscuro. Mide: rect de la tarjeta, del panel y del viewport; si se sale
 *                 de alguno; si la pagina gana barra horizontal; si algun pixel esta TAPADO
 *                 (elementFromPoint en las cuatro esquinas y el centro, que es lo unico que
 *                 distingue «no recortada» de «no medi el recorte»); la forma de la tabla; y la
 *                 distancia al boton que la ancla.
 *   teclado     — Tab hasta cada ⓘ, Enter, Esc, Esc, Esc. Mide donde queda el foco en cada paso
 *                 y si la tarjeta, el maximizado y el panel se van en el orden pedido.
 *   aislamiento — abrir una no abre ni cierra la otra, ni toca los ⓘ de nota de pregunta.
 *   convive     — como se ven las dos clases de ⓘ cuando caen en la misma fila.
 *
 * ⚠️ DENOMINADOR. Una medicion de desborde sobre una tarjeta de ancho 0 da «no desborda», y un
 * conteo de ⓘ sobre un panel que no abrio da cero. Todas las escenas informan el rect y cuantos
 * nodos vieron; un cero ahi invalida la escena, no la aprueba.
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-term-'));
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

/* ══ Sonda inyectada ══════════════════════════════════════════════════════════════════════════
   ⚠️ CUERPO DE TEMPLATE LITERAL: NI UN ACENTO GRAVE adentro, tampoco en los comentarios.
   (scripts/check_backticks.py da la linea exacta cuando se cuela uno.) */
const SONDA = `
window.__T = {
  norm(s) { return String(s || '').replace(/\\s+/g, ' ').trim() },
  hash(s) { var h = 5381, t = window.__T.norm(s);
    for (var i = 0; i < t.length; i++) { h = ((h * 33) ^ t.charCodeAt(i)) >>> 0 }
    return h.toString(16) },

  cuerpo() { return document.getElementById('indic-cuerpo') },
  card()   { return document.getElementById('indic-card') },
  term()   { return document.getElementById('indic-term') },

  secs() {
    var c = window.__T.cuerpo(); if (!c) return [];
    return Array.prototype.slice.call(c.querySelectorAll(':scope > details'))
      .filter(function(d){ return !d.hasAttribute('data-ind-biblio') }) },
  tituloDe(d) { var s = d.querySelector('summary'); return s ? window.__T.norm(s.textContent) : '?' },

  /* ⚠️ EL TEXTO SE MIDE CON TODOS LOS <details> ABIERTOS Y CON LOS GLIFOS ⓘ QUITADOS, y es el
     descuento lo que lo hace comparable: textContent devuelve lo que hay en el DOM aunque este
     colapsado, asi que lo unico que esta tanda agrega al texto de una seccion son DOS glifos.
     Se declaran los dos hashes y el conteo de ⓘ, que es el denominador del descuento: si el
     hash SIN glifos coincide con HEAD y el conteo sube exactamente 2 en la mitral y 0 en las
     otras catorce, no se movio una letra. */
  textoSecs() {
    var out = {};
    window.__T.secs().forEach(function(d){
      var t = window.__T.norm(d.textContent);
      var sin = window.__T.norm(t.replace(/\\u24d8/g, ' '));
      /* ⚠️ EL HASH QUE RESPONDE «IDENTICO A HEAD» ES EL DE LAS LETRAS, Y LA PRIMERA VERSION DE
         ESTA ESCENA NO LO TENIA. Quitar solo el glifo deja el ESPACIO que lo precede —el boton
         se concatena como ' <button...>'— asi que la mitral daba hash distinto por 2 caracteres
         de blanco y el veredicto salia del lado del falso: «el texto cambio» sobre un texto que
         no cambio ni una letra. Medido: +4 crudo (2 glifos + 2 espacios) y +2 tras quitar solo
         los glifos. Se quita el glifo Y TODO el blanco, en los dos lados del A/B, que es lo que
         vuelve la comparacion inmune al maquetado sin volverse ciega a una letra. */
      /* ⚠️ DOBLE BARRA EN LA BARRA-ESE, Y ESTE FUE EL SEGUNDO FALSO DE ESTA SONDA. El cuerpo
         viaja dentro de un TEMPLATE LITERAL, que COCINA las secuencias de escape antes de que el
         navegador vea el codigo: barra-ese se vuelve la LETRA ese, asi que la primera version de
         esta linea construia el regex /s+/g y borraba TODAS LAS ESES del texto. Y seguia
         pareciendo una medicion buena —informaba una diferencia de 2 caracteres— solo que esos 2
         eran el blanco REAL que queda al lado del glifo, porque los blancos nunca se habian
         tocado. Se vio al IMPRIMIR el texto: decia «caracteritica» y «defavorable». El escape
         del glifo sobrevivio de pura suerte: barra-u-24d8 es un escape VALIDO, se cocina al
         caracter ⓘ y el regex sigue siendo el correcto. El norm() de arriba y las otras sondas
         de este repo ya escriben la barra doble por esto mismo. */
      var letras = t.replace(/\u24d8/g, '').replace(/\\s+/g, '');
      out[window.__T.tituloDe(d)] = { hash: window.__T.hash(t), len: t.length,
        hashSinGlifos: window.__T.hash(sin), lenSinGlifos: sin.length,
        hashLetras: window.__T.hash(letras), lenLetras: letras.length,
        glifos: (t.match(/\\u24d8/g) || []).length,
        /* Los nodos de cada clase de ⓘ, por ATRIBUTO. Es lo que separa los tres mecanismos. */
        info: d.querySelectorAll('details[data-ind-info]').length,
        detalle: d.querySelectorAll('details[data-ind-detalle]').length,
        termino: d.querySelectorAll('[data-ind-term]').length };
    });
    return out },

  /* Los ⓘ de termino, con su etiqueta y la fila en que caen. */
  terminos() {
    var c = window.__T.cuerpo(); if (!c) return [];
    return Array.prototype.slice.call(c.querySelectorAll('[data-ind-term]')).map(function(b, i){
      if (!b.id) b.id = '__term' + i;
      var tr = b.closest ? b.closest('tr') : null;
      var td = b.closest ? b.closest('td') : null;
      var r = b.getBoundingClientRect();
      return { sel: '#' + b.id, id: b.getAttribute('data-ind-term'),
        etiqueta: b.getAttribute('aria-label'), expandido: b.getAttribute('aria-expanded'),
        tag: b.tagName.toLowerCase(), haspopup: b.getAttribute('aria-haspopup'),
        /* El ROTULO de la fila SIN el glifo: es lo que prueba que no se toco una palabra. */
        rotulo: td ? window.__T.norm(td.textContent.replace(/\\u24d8/g, '')) : null,
        filaCompleta: tr ? window.__T.norm(tr.textContent).slice(0, 90) : null,
        w: Math.round(r.width), h: Math.round(r.height),
        /* La fila trae ADEMAS un ⓘ de nota de pregunta? Es la pregunta de la convivencia. */
        infoEnLaMisma: tr ? tr.querySelectorAll('details[data-ind-info]').length : 0 } }) },

  /* ⚠️ EL ESTADO DE LA TARJETA, CON LA PRUEBA DE QUE NO ESTA TAPADA. Un rect dentro del
     viewport no dice que se VEA: si el scroll de #indic-cuerpo la recortara, el rect seguiria
     siendo el mismo. Lo unico que lo distingue es preguntarle al navegador QUIEN esta en cada
     punto: se miran las cuatro esquinas (metidas 3 px para no caer en el borde) y el centro, y
     se exige que en los cinco el nodo devuelto sea la tarjeta o un descendiente. */
  /* ⚠️ LOS DOS OVERLAYS DE PANTALLA COMPLETA SE DESPEJAN JUSTO ANTES DE MEDIR, Y NO UNA VEZ AL
     ARRANQUE. El aviso legal VUELVE —lo repone el arranque de sesion que corre tras
     limpiarCampos— y el de login tapa con z-index 2147483000: con cualquiera de los dos puesto,
     elementFromPoint devuelve ESE nodo en todos los puntos y la escena informa «cinco de cinco
     tapados» sobre una tarjeta perfecta. Medido las DOS veces: en el caso de la suite y aca, en
     las seis escenas de 390 y 360 px, porque las de 1200 corren antes de que el aviso reaparezca.
     Es la misma trampa que TC-395 ya documenta palabra por palabra. Se informa el estado de los
     dos al lado del veredicto: si alguno sigue visible, la escena no vale. */
  despejar() {
    var o = {};
    ['modalAvisoEco', 'login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (m) { m.style.display = 'none'; o[id] = getComputedStyle(m).display }
      else o[id] = 'NO EXISTE' });
    return o },

  tarjeta() {
    var despejados = window.__T.despejar();
    var c = window.__T.term(); if (!c) return { existe: false, despejados: despejados };
    var cs = getComputedStyle(c);
    if (cs.display === 'none') return { existe: true, visible: false, despejados: despejados };
    var r = c.getBoundingClientRect();
    var P = 3;
    var pts = [[r.left + P, r.top + P], [r.right - P, r.top + P],
               [r.left + P, r.bottom - P], [r.right - P, r.bottom - P],
               [r.left + r.width / 2, r.top + r.height / 2]];
    var quien = pts.map(function(q){
      var e = document.elementFromPoint(Math.round(q[0]), Math.round(q[1]));
      return { suyo: !!(e && (e === c || c.contains(e))),
               nodo: e ? (e.tagName.toLowerCase() + (e.id ? '#' + e.id : '')) : null } });
    var pr = window.__T.card().getBoundingClientRect();
    var tol = 1;
    return { existe: true, visible: true, despejados: despejados,
      rect: { t: Math.round(r.top), l: Math.round(r.left),
              w: Math.round(r.width), h: Math.round(r.height),
              b: Math.round(r.bottom), r: Math.round(r.right) },
      panel: { t: Math.round(pr.top), l: Math.round(pr.left),
               w: Math.round(pr.width), h: Math.round(pr.height),
               b: Math.round(pr.bottom), r: Math.round(pr.right) },
      win: { w: innerWidth, h: innerHeight },
      dentroDelViewport: r.top >= -tol && r.left >= -tol &&
        r.bottom <= innerHeight + tol && r.right <= innerWidth + tol,
      dentroDelPanel: r.top >= pr.top - tol && r.left >= pr.left - tol &&
        r.bottom <= pr.bottom + tol && r.right <= pr.right + tol,
      /* La pagina NO gana barra horizontal. Se mide en el documento, no en la tarjeta. */
      scrollPagina: document.documentElement.scrollWidth - innerWidth,
      /* Scroll INTERNO: es lo que tiene que pasar si el contenido no entra. */
      scrollInterno: { alto: c.scrollHeight, visible: Math.round(r.height),
                       scrollea: c.scrollHeight > c.clientHeight + 1 },
      tapada: quien.filter(function(q){ return !q.suyo }),
      puntos: quien.length,
      /* La FORMA de la tabla: una <table> es la version ancha; cero es la apilada. */
      tablas: c.querySelectorAll('table').length,
      filasTabla: c.querySelectorAll('table tbody tr').length,
      celdasTabla: c.querySelectorAll('table tbody td').length,
      bloquesApilados: c.querySelectorAll('table').length === 0
        ? Array.prototype.slice.call(c.querySelectorAll('div > div')).filter(function(d){
            return /font-weight:700/.test(d.getAttribute('style') || '') &&
                   /var\\(--accent2\\)/.test(d.getAttribute('style') || '') }).length : 0,
      titulo: window.__T.norm((c.querySelector('#indic-term-tit') || {}).textContent || ''),
      texto: window.__T.norm(c.textContent),
      largoTexto: window.__T.norm(c.textContent).length,
      role: c.getAttribute('role'), ariaModal: c.getAttribute('aria-modal'),
      labelledby: c.getAttribute('aria-labelledby') } },

  /* La distancia del centro de la tarjeta al centro del boton que la ancla. Un globo anclado a
     300 px de su boton no esta anclado, y el rect solo no lo dice. */
  anclaje(sel) {
    var b = document.querySelector(sel), c = window.__T.term();
    if (!b || !c || getComputedStyle(c).display === 'none') return null;
    var rb = b.getBoundingClientRect(), rc = c.getBoundingClientRect();
    return { dxCentros: Math.round(Math.abs((rb.left + rb.width / 2) - (rc.left + rc.width / 2))),
             dyBordeSuperior: Math.round(rc.top - rb.bottom),
             dyBordeInferior: Math.round(rb.top - rc.bottom) } },

  /* El estado de los OTROS mecanismos, para el aislamiento. */
  censo() {
    var c = window.__T.cuerpo(); if (!c) return null;
    var infos = Array.prototype.slice.call(c.querySelectorAll('details[data-ind-info]'));
    return { info: infos.length, infoAbiertos: infos.filter(function(d){ return d.open }).length,
      detalle: c.querySelectorAll('details[data-ind-detalle]').length,
      detalleAbiertos: c.querySelectorAll('details[data-ind-detalle][open]').length,
      termino: c.querySelectorAll('[data-ind-term]').length,
      terminoExpandido: c.querySelectorAll('[data-ind-term][aria-expanded="true"]').length,
      abierto: (typeof window._indTermAbierto === 'function') ? window._indTermAbierto() : 'SIN FUNCION' } },

  maxEstado() { var c = window.__T.card();
    return c ? c.getAttribute('data-ind-max') : null },
  overlay() { var ov = document.getElementById('indic-overlay');
    return ov ? getComputedStyle(ov).display : 'NO EXISTE' },
  tema(claro) { document.documentElement.classList.toggle('light-mode', !!claro);
    return document.documentElement.className },

  focoAhora() { var a = document.activeElement; if (!a) return null;
    var c = window.__T.card(), t = window.__T.term();
    return { tag: a.tagName.toLowerCase(), id: a.id || null,
      label: a.getAttribute ? a.getAttribute('aria-label') : null,
      term: a.getAttribute ? a.getAttribute('data-ind-term') : null,
      enLaTarjeta: !!(t && (t === a || t.contains(a))),
      enElPanel: !!(c && c.contains(a)),
      txt: window.__T.norm(a.textContent).slice(0, 34) } },

  irAlInforme() {
    try { if (typeof showTab === 'function') showTab('informe') } catch (e) { return 'EXC' }
    var t = document.getElementById('tab-informe');
    return t ? getComputedStyle(t).display : 'NO EXISTE' },

  limpiar() { try { limpiarCampos(true) } catch (e) {} return 1 },
  set(id, valor) {
    var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return 1 },
  recalc() {
    ['calcAo','calcEADetalle','calcVI','calcAI','calcVD','calcIT_ESC','calcIM_ESC','calcIA_ESC',
     'calcEM','calcET','calcVP','calcBSA','calcPSAP','calcWilkins','mchSync','vabSync']
      .forEach(function(f){ try { window[f] && window[f]() } catch (e) {} });
    return 1 },

  /* ⚠️ LA GEOMETRIA SE MIDE **ANTES** DE SCROLLEAR. Un nodo dentro de un <details> cerrado
     devuelve ceros, pero tras un scrollIntoView Chrome devuelve una posicion PLAUSIBLE de algo
     que nadie puede tocar: el clic cae fuera del viewport y el respaldo por tecla manda Enter al
     documento. Es la trampa que _probe_evidmarco.mjs ya documenta y costo una corrida colgada. */
  centroSel(sel) {
    var e = document.querySelector(sel); if (!e) return { err: 'no existe ' + sel };
    var r0 = e.getBoundingClientRect();
    if (r0.width === 0 || r0.height === 0) return { err: 'nodo sin geometria' };
    e.scrollIntoView({ block: 'center', inline: 'nearest' });
    var r = e.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return { err: 'sin geometria tras scrollear' };
    if (r.top < 0 || r.bottom > innerHeight || r.left < 0 || r.right > innerWidth)
      return { err: 'fuera del viewport tras scrollear',
               rect: [Math.round(r.top), Math.round(r.left)], win: [innerWidth, innerHeight] };
    var x = Math.round(r.left + r.width / 2), y = Math.round(r.top + r.height / 2);
    var q = document.elementFromPoint(x, y);
    return { x: x, y: y, esElBlanco: q === e || (e.contains && e.contains(q)),
      quien: q ? (q.tagName.toLowerCase() + (q.id ? '#' + q.id : '')) : null } },

  /* Las secciones CERRADAS, para abrirlas con un clic real en el rotulo antes de medir: una
     seccion colapsada tiene sus botones en el DOM y sin geometria. */
  seccionesCerradas() {
    var c = window.__T.cuerpo(); if (!c) return [];
    var out = [];
    window.__T.secs().forEach(function(d, i){
      if (!d.open) { if (!d.id) d.id = '__secCerrada' + i; out.push('#' + d.id + ' > summary') } });
    return out },

  focoEn(sel) { var e = document.querySelector(sel); if (!e) return 0; e.focus();
    return document.activeElement === e ? 1 : 0 }
};
1;
`;

/* ⚠️ EL PACIENTE ENCIENDE VARIAS SECCIONES, NO SOLO LA MITRAL, Y ESO ES EL DENOMINADOR DE LA
   ESCENA DE TEXTO. Con una sola seccion pintada, «el texto de CADA seccion es identico a HEAD»
   se cumpliria sobre un conjunto de uno — que es el falso que este repo ya pago con el control
   negativo de r.bloques, donde «identicas» se afirmo sobre una sola seccion ajena. La base es la
   misma SEMILLA de _probe_evidmarco.mjs (y de TC-293), mas lo que la estenosis mitral necesita:
   area, gradiente, etiologia reumatica y los CUATRO componentes del score de Wilkins puntuados,
   que es lo que hace que la fila del score tenga valor y no un centinela. */
const PAC = { peso:'80', talla:'180', edad:'62', sexo:'M',
  vmax_ao:'4.5', gmedio_ao:'45', diam_tsvi:'20', itv_tsvi:'18', itv_ao:'40',
  fevi:'55', dsfvi:'52', ao_sin:'48', ao_tub:'52', va_morf:'Bicúspide',
  im_grado:'4', ia_grado:'4', it_grado:'4', vmax_it:'3.2', vci_diam:'22',
  et_gmedio:'7', vp_gmax:'70',
  mch_espesor:'18', mch_grad_reposo:'60', tapse:'14', s_prime:'8',
  ete_cia_tipo:'secundum', ete_cia_tam_max:'22', vd_bas:'46',
  avm_plan:'1.2', em_grado:'severa', em_gmedio:'12', vm_morf:'Reumática',
  wilkins_movilidad:'2', wilkins_engrosamiento:'2',
  wilkins_calcificacion:'1', wilkins_subvalvular:'2' };

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
  const paso = (n) => { _paso = n; if (VER || process.env.TERM_TRAZA) console.error('  · ' + n); };
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
  async function cdpEnv(metodo, params) {
    return Promise.race([
      cdp.send(metodo, params, sessionId),
      new Promise((_, no) => setTimeout(() => no(new Error(
        metodo + ' sin respuesta en 20 s — paso ' + JSON.stringify(_paso))), 20000)),
    ]);
  }
  const VK = { Tab: 9, Enter: 13, Escape: 27, Space: 32 };
  async function tecla(k, mods) {
    const vk = VK[k] || 0;
    const p = { key: k, code: k, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk };
    if (mods) p.modifiers = mods;
    /* ENTER y ESPACIO van con `text`: sin el caracter detras Blink no genera el KEYPRESS y un
       <button> NO se activa. Las de EDICION (Tab, Escape) al reves, por keycode y rawKeyDown. */
    const act = { Enter: '\r', Space: ' ' };
    if (act[k] !== undefined) {
      await cdpEnv('Input.dispatchKeyEvent', Object.assign({ type: 'keyDown',
        text: act[k], unmodifiedText: act[k] }, p));
      await cdpEnv('Input.dispatchKeyEvent', Object.assign({ type: 'keyUp' }, p));
      return;
    }
    await cdpEnv('Input.dispatchKeyEvent', Object.assign({ type: 'rawKeyDown' }, p));
    await cdpEnv('Input.dispatchKeyEvent', Object.assign({ type: 'keyUp' }, p));
  }
  async function clicSel(sel) {
    const c = await J(`window.__T.centroSel(${JSON.stringify(sel)})`);
    if (!c || c.err) return { via: 'NO SE PUDO', por: c ? c.err : 'no existe' };
    if (c.esElBlanco) {
      await cdpEnv('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 });
      await cdpEnv('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 });
      await pausa(180);
      return { via: 'mouse', punto: { x: c.x, y: c.y } };
    }
    /* RESPALDO POR TECLA, y se EXIGE que el foco haya llegado: un .focus() sobre un nodo no
       enfocable no hace nada y el Enter se iria al documento, que en esta app arranca otra cosa
       y colgo una corrida 75 s. */
    const llego = await ev(`window.__T.focoEn(${JSON.stringify(sel)})`);
    if (!llego) return { via: 'NO SE PUDO', por: 'el foco no llego al blanco', tapadoPor: c.quien };
    await tecla('Enter');
    await pausa(180);
    return { via: 'tecla Enter', tapadoPor: c.quien };
  }
  /* Clic en un punto cualquiera del cuerpo del panel: es el gesto «tocar afuera». */
  async function clicEnPunto(x, y) {
    await cdpEnv('Input.dispatchMouseEvent', { type: 'mousePressed', x: x, y: y, button: 'left', clickCount: 1 });
    await cdpEnv('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x, y: y, button: 'left', clickCount: 1 });
    await pausa(180);
  }

  await ev(`try{sessionStorage.setItem('ett_auth','1')}catch(e){}; location.reload(); 1`);
  await pausa(2600);
  await ev(SONDA);

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

  async function sembrar() {
    await ev('window.__T.limpiar()');
    for (const [k, v] of Object.entries(PAC)) await ev(`window.__T.set(${JSON.stringify(k)}, ${JSON.stringify(v)})`);
    await ev('window.__T.recalc()');
    await pausa(260);
  }
  async function abrir() {
    await ev(`(function(){ try{ indicAbrir() }catch(e){ return 'EXC: ' + e.message } return 1 })()`);
    await pausa(340);
    return ev('window.__T.overlay()');
  }
  async function cerrar() { await ev(`(function(){ try{ indicCerrar() }catch(e){} return 1 })()`); await pausa(140); }

  /* ⚠️ ABRIR LAS SECCIONES CERRADAS ANTES DE MEDIR. Una seccion nace colapsada cuando ninguna
     de sus filas trae ok ni alarm y su recomendacion no es ind ni alarma: sus botones existen en
     el DOM, no tienen geometria, y la tarjeta no se puede anclar a un rect de ceros — que es
     justo la rama que _indTermColocar devuelve null. El gesto es un CLIC REAL en el rotulo. */
  async function abrirSecciones() {
    const abiertos = [];
    for (let i = 0; i < 16; i++) {
      const cerradas = await J('window.__T.seccionesCerradas()');
      if (!cerradas.length) break;
      const r = await clicSel(cerradas[0]);
      abiertos.push({ sel: cerradas[0], via: r.via, por: r.por || null });
      await pausa(110);
      const quedan = await J('window.__T.seccionesCerradas()');
      if (quedan.length && quedan[0] === cerradas[0]) { abiertos.push({ sel: cerradas[0], via: 'NO ABRIO' }); break; }
    }
    return { aperturas: abiertos, cerradasQueQuedan: await J('window.__T.seccionesCerradas()') };
  }

  const out = { archivo: FARG, grupos: SOLO || 'todos',
    aviso: { selector: avisoSel, clic: avisoClic, display: avisoCerrado } };

  /* ══ texto ════════════════════════════════════════════════════════════════════════════════ */
  if (hacer('texto')) {
    paso('texto');
    await sembrar();
    out.texto = { overlay: await abrir(), aperturas: await abrirSecciones() };
    out.texto.secciones = await J('window.__T.textoSecs()');
    out.texto.terminos  = await J('window.__T.terminos()');
    out.texto.censo     = await J('window.__T.censo()');
    await cerrar();
  }

  /* ══ tarjetas ═════════════════════════════════════════════════════════════════════════════ */
  if (hacer('tarjetas')) {
    paso('tarjetas');
    out.tarjetas = [];
    /* 1200 px va DOS veces: normal y maximizado. En 390 y 360 el boton de maximizar esta oculto
       por la regla de <=560 px, asi que ahi la variante no existe. */
    const escenas = [[1200, false], [1200, true], [390, false], [360, false]];
    for (const [w, max] of escenas) {
      await cdpEnv('Emulation.setDeviceMetricsOverride',
        { width: w, height: 900, deviceScaleFactor: 1, mobile: false });
      await pausa(240);
      for (const claro of [false, true]) {
        await ev(`window.__T.tema(${claro})`);
        await sembrar();
        const ov = await abrir();
        const ap = await abrirSecciones();
        if (max) { await ev(`(function(){ try{ indicMaxPoner(true) }catch(e){} return 1 })()`); await pausa(240); }
        const terms = await J('window.__T.terminos()');
        for (const tm of terms) {
          const clic = await clicSel(tm.sel);
          const tj = await J('window.__T.tarjeta()');
          const an = await J(`window.__T.anclaje(${JSON.stringify(tm.sel)})`);
          out.tarjetas.push({ ancho: w, maximizado: max, tema: claro ? 'claro' : 'oscuro',
            term: tm.id, botonW: tm.w, botonH: tm.h, clic: clic.via,
            maxEstado: await ev('window.__T.maxEstado()'),
            overlay: ov, seccionesSinAbrir: ap.cerradasQueQuedan.length,
            denominadorTerminos: terms.length, anclaje: an, tarjeta: tj });
          /* Se cierra con el MISMO boton, que es una de las tres formas de cierre. */
          await clicSel(tm.sel);
          out.tarjetas[out.tarjetas.length - 1].trasElMismoBoton = await J('window.__T.tarjeta()');
        }
        await cerrar();
      }
    }
    await ev('window.__T.tema(false)');
    await cdpEnv('Emulation.clearDeviceMetricsOverride', {});
    await pausa(200);
  }

  /* ══ teclado ══════════════════════════════════════════════════════════════════════════════ */
  if (hacer('teclado')) {
    paso('teclado');
    await cdpEnv('Emulation.setDeviceMetricsOverride',
      { width: 1200, height: 900, deviceScaleFactor: 1, mobile: false });
    await pausa(220);
    await sembrar();
    out.teclado = { overlay: await abrir() };
    out.teclado.aperturas = await abrirSecciones();
    /* Maximizado, para poder medir la secuencia completa de tres Escapes. */
    await ev(`(function(){ try{ indicMaxPoner(true) }catch(e){} return 1 })()`);
    await pausa(240);
    const terms = await J('window.__T.terminos()');
    out.teclado.denominador = terms.length;
    out.teclado.pasos = [];
    const anotar = async (n) => {
      out.teclado.pasos.push({ paso: n, foco: await J('window.__T.focoAhora()'),
        tarjeta: await J('window.__T.tarjeta()'), max: await ev('window.__T.maxEstado()'),
        overlay: await ev('window.__T.overlay()'),
        censo: await J('window.__T.censo()') });
    };
    /* ⚠️ TAB DE VERDAD HASTA EL ⓘ, no un .focus(): lo que se quiere saber es si el boton esta
       ALCANZABLE con el teclado. Se tabula desde la tarjeta del panel y se informa en cuantos
       Tabs se llego — si no se llega en 80, se dice y la escena no afirma nada. */
    await ev(`(function(){ var c = document.getElementById('indic-card');
      if (c) c.focus(); return 1 })()`);
    const blanco = terms[0];
    let tabs = 0, llego = false;
    for (; tabs < 80; tabs++) {
      await tecla('Tab');
      const f = await J('window.__T.focoAhora()');
      if (f && f.term === blanco.id) { llego = true; break; }
    }
    out.teclado.tabsHastaElPrimerTermino = { term: blanco.id, tabs: tabs + 1, llego: llego };
    await anotar('foco en el ⓘ tras ' + (tabs + 1) + ' Tabs');
    await tecla('Enter');  await pausa(260); await anotar('Enter — abre la tarjeta');
    await tecla('Escape'); await pausa(240); await anotar('Escape 1 — cierra SOLO la tarjeta');
    await tecla('Escape'); await pausa(240); await anotar('Escape 2 — restaura el maximizado');
    await tecla('Escape'); await pausa(240); await anotar('Escape 3 — cierra el panel');
    /* ── Tab DENTRO de la tarjeta: cierra y devuelve el foco al boton (precio declarado). ── */
    await abrir(); await abrirSecciones();
    const t2 = await J('window.__T.terminos()');
    if (t2.length) {
      await clicSel(t2[0].sel);
      out.teclado.tabDentro = { antes: await J('window.__T.tarjeta()'), foco: await J('window.__T.focoAhora()') };
      await tecla('Tab'); await pausa(220);
      out.teclado.tabDentro.despues = await J('window.__T.tarjeta()');
      out.teclado.tabDentro.focoDespues = await J('window.__T.focoAhora()');
    }
    await cerrar();
    await cdpEnv('Emulation.clearDeviceMetricsOverride', {});
  }

  /* ══ aislamiento ══════════════════════════════════════════════════════════════════════════ */
  if (hacer('aislamiento')) {
    paso('aislamiento');
    await cdpEnv('Emulation.setDeviceMetricsOverride',
      { width: 1200, height: 900, deviceScaleFactor: 1, mobile: false });
    await pausa(220);
    await sembrar();
    out.aislamiento = { overlay: await abrir() };
    out.aislamiento.aperturas = await abrirSecciones();
    const terms = await J('window.__T.terminos()');
    out.aislamiento.denominador = terms.length;
    /* ── DENOMINADOR DEL AISLAMIENTO: se abren DOS ⓘ de nota de pregunta con un clic real, para
       que haya algo que PODER romper. Sin esto, «no se cerraron» se cumple sobre cero. ── */
    const infos = await J(`(function(){
      var c = document.getElementById('indic-cuerpo');
      return Array.prototype.slice.call(c.querySelectorAll('details[data-ind-info]'))
        .slice(0, 2).map(function(d, i){ var su = d.querySelector('summary');
          if (!su.id) su.id = '__inf' + i; return '#' + su.id }) })()`);
    for (const sel of infos) await clicSel(sel);
    out.aislamiento.infosAbiertasAdrede = infos.length;
    out.aislamiento.censoInicial = await J('window.__T.censo()');
    out.aislamiento.secuencia = [];
    for (const tm of terms) {
      await clicSel(tm.sel);
      out.aislamiento.secuencia.push({ abri: tm.id,
        censo: await J('window.__T.censo()'),
        tituloVisible: (await J('window.__T.tarjeta()')).titulo,
        expandidos: await J(`(function(){ var c = document.getElementById('indic-cuerpo');
          return Array.prototype.slice.call(c.querySelectorAll('[data-ind-term]')).map(function(b){
            return b.getAttribute('data-ind-term') + '=' + b.getAttribute('aria-expanded') }) })()`) });
    }
    /* ── TOCAR AFUERA: un clic en el encabezado del panel, que no es la tarjeta ni un ⓘ. ── */
    const hdr = await J(`(function(){ var t = document.getElementById('indic-titulo');
      var r = t.getBoundingClientRect();
      return { x: Math.round(r.left + 5), y: Math.round(r.top + r.height / 2) } })()`);
    await clicEnPunto(hdr.x, hdr.y);
    out.aislamiento.trasTocarAfuera = { tarjeta: await J('window.__T.tarjeta()'),
      censo: await J('window.__T.censo()'), overlay: await ev('window.__T.overlay()') };
    /* ── EL REPINTADO: se contesta un control clinico con la tarjeta ABIERTA. La tarjeta tiene
       que RE-ANCLARSE al boton nuevo, no quedarse pegada al que indicRender destruyo. ── */
    await clicSel(terms[0].sel);
    const antesRe = await J('window.__T.tarjeta()');
    const anclaAntes = await J(`window.__T.anclaje(${JSON.stringify(terms[0].sel)})`);
    const ctrl = await ev(`(function(){ var c = document.getElementById('indic-cuerpo');
      var b = c.querySelector('[data-ind-clin]'); if (!b) return null;
      if (!b.id) b.id = '__ctrl0'; return '#' + b.id })()`);
    const clicCtrl = ctrl ? await clicSel(ctrl) : { via: 'SIN CONTROL' };
    await pausa(260);
    const terms2 = await J('window.__T.terminos()');
    out.aislamiento.trasRepintado = { clicCtrl: clicCtrl.via,
      antes: antesRe, anclaAntes: anclaAntes,
      despues: await J('window.__T.tarjeta()'),
      anclaDespues: terms2.length ? await J(`window.__T.anclaje(${JSON.stringify(terms2[0].sel)})`) : null,
      /* ⚠️ EL NODO DEL BOTON ES OTRO: se confirma que indicRender lo reemplazo de verdad, que es
         el denominador del re-anclaje. Sin esto, «se re-ancla» podria ser «no se repinto». */
      censo: await J('window.__T.censo()') };

    /* ⚠️ LAS DOS RUTAS DE REPINTADO SE MIDEN POR SEPARADO, Y LA PRIMERA VERSION DE ESTA ESCENA
       MEDIA SOLO UNA Y CONCLUIA MAL. Contestar un control clinico dispara DOS oyentes: el
       delegado de #indic-cuerpo —que repinta y re-ancla— y el del documento, que ve un clic
       FUERA de la tarjeta y la cierra. El del documento corre despues (el delegado esta en un
       nodo de adentro), asi que el efecto neto de un CLIC es que la tarjeta se va: eso es lo que
       el pedido llama «tocando afuera», y un control clinico esta afuera.
       El RE-ANCLAJE se ejerce llamando a _indRepintarConservando DIRECTO, que es la ruta que no
       pasa por ningun clic (la usa el sync del boton cuando el panel esta abierto). Sin esta
       segunda mitad, «el re-anclaje no sirve» y «el re-anclaje esta tapado por el cierre» se ven
       exactamente igual. */
    await clicSel(terms[0].sel);
    const anteRe2 = await J('window.__T.tarjeta()');
    /* El NODO del boton ANTES, para confirmar que indicRender lo reemplaza de verdad: es el
       denominador del re-anclaje. Sin esto, «se re-ancla» podria ser «no se repinto nada». */
    const nodoAntes = await ev(`(function(){ var b = document.querySelector('[data-ind-term]');
      window.__nodoViejo = b; return b ? b.outerHTML.length : -1 })()`);
    await ev(`(function(){ try { _indRepintarConservando(null, null) }
      catch(e){ return 'EXC: ' + e.message } return 1 })()`);
    await pausa(240);
    const terms3 = await J('window.__T.terminos()');
    out.aislamiento.repintadoSinClic = {
      nodoReemplazado: await ev(`(function(){ var b = document.querySelector('[data-ind-term]');
        return !!(b && window.__nodoViejo && b !== window.__nodoViejo) })()`),
      largoNodoAntes: nodoAntes,
      antes: anteRe2,
      despues: await J('window.__T.tarjeta()'),
      anclaDespues: terms3.length ? await J(`window.__T.anclaje(${JSON.stringify(terms3[0].sel)})`) : null,
      censo: await J('window.__T.censo()') };
    await cerrar();
    await cdpEnv('Emulation.clearDeviceMetricsOverride', {});
  }

  /* ══ convive ══════════════════════════════════════════════════════════════════════════════ */
  if (hacer('convive')) {
    paso('convive');
    await cdpEnv('Emulation.setDeviceMetricsOverride',
      { width: 1200, height: 900, deviceScaleFactor: 1, mobile: false });
    await pausa(220);
    await sembrar(); await abrir(); await abrirSecciones();
    out.convive = await J(`(function(){
      var c = document.getElementById('indic-cuerpo');
      var N = function(s){ return String(s||'').replace(/\\s+/g,' ').trim() };
      return Array.prototype.slice.call(c.querySelectorAll('tr'))
        .filter(function(tr){ return tr.querySelector('[data-ind-term]') })
        .map(function(tr){
          var tds = tr.querySelectorAll('td');
          var bt = tr.querySelector('[data-ind-term]');
          var inf = tr.querySelector('details[data-ind-info] > summary');
          var rb = bt.getBoundingClientRect(), ri = inf ? inf.getBoundingClientRect() : null;
          return { term: bt.getAttribute('data-ind-term'),
            celdaRotulo: N(tds[0] ? tds[0].textContent : ''),
            celdaNota: N(tds[2] ? tds[2].textContent : '').slice(0, 70),
            terminoEn: 'celda del rotulo', notaPlegada: !!inf,
            /* Las dos clases de ⓘ en la MISMA fila: en que celda cae cada uno y a que distancia
               horizontal. Si cayeran pegados, el medico no sabria cual abre que. */
            dxEntreLosDos: ri ? Math.round(Math.abs(ri.left - rb.left)) : null,
            mismaCelda: !!(inf && bt.closest('td') === inf.closest('td')),
            etiquetaTermino: bt.getAttribute('aria-label'),
            etiquetaNota: inf ? inf.getAttribute('aria-label') : null } }) })()`);
    await cerrar();
    await cdpEnv('Emulation.clearDeviceMetricsOverride', {});
  }

  out.dialogos = dialogos;
  out.md5 = { antes: antes, despues: await md5(join(RAIZ, 'index.html')) };
  if (out.md5.antes !== out.md5.despues)
    out.ABORTA = 'index.html CAMBIO durante la corrida — la medicion no vale';

  console.log(JSON.stringify(out, null, 1));
  try { cdp.close() } catch (e) {}
  srv.close();
  try { process.kill(-proc.pid, 'SIGKILL') } catch (e) { try { proc.kill('SIGKILL') } catch (e2) {} }
  try { await rm(perfil, { recursive: true, force: true }) } catch (e) {}
  /* `srv.close()` + `process.exit(0)`: sin los dos, el servidor sigue escuchando, el event loop
     queda vivo y se juntan zombies reteniendo su Chrome — un A/B encadenado nunca llega al
     segundo lado y parece lentitud. */
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
