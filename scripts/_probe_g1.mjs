#!/usr/bin/env node
/**
 * _probe_g1.mjs — sonda A/B de SOLO LECTURA para la tanda «G1» (2026-10-15): el VENTRICULO
 * DERECHO en tres columnas, el cociente TAPSE/PSAP en el Doppler tricuspideo y el diametro de
 * la arteria pulmonar en la insuficiencia pulmonar.
 *
 * Grupos (--solo campos|refs|vdvi|tpsp|globo|pulmo|color|controles):
 *   campos    — las tres columnas con su posicion explicita, el orden del Tab con TECLAS REALES
 *               y la maqueta a 1200, 390 y 360 px en los DOS temas (solapamientos y desbordes
 *               MEDIDOS, no mirados).
 *   refs      — el cuadro de referencias: su orden, las filas de FEVD y FAC que solo se ven con
 *               dato, el volumen sistolico pulmonar (Qp) y lo que deja «Nuevo estudio».
 *   vdvi      — la fila de la relacion VD/VI por los dos lados de su corte y la pared graduada
 *               por los TRES bordes de la Tabla 1 de la ASE 2025.
 *   tpsp      — el cociente TAPSE/PSAP en sus tres tramos, en los bordes, sin TAPSE y sin PSAP,
 *               y el MISMO numero leido en las tres superficies que lo publican.
 *   globo     — la tarjeta del globo, sus cuatro caminos de cierre y la maqueta en seis celdas.
 *   pulmo     — el campo del diametro de la arteria pulmonar: tecleo, banda, que NO vota, que no
 *               viaja al Excel y que SI viaja con el estudio.
 *   color     — el aviso del indice de Tei en los dos temas, con su control negativo.
 *   controles — informe (tres estilos), EN SUMA, Excel, PPT, Laboratorio, grados y pastillas de
 *               las ocho lesiones, diastolica y HFA-PEFF, con un escenario CARGADO y vacio.
 *
 * No muta index.html: comprueba su md5 al principio y al final.
 *
 *   node scripts/_probe_g1.mjs --file /tmp/index.HEAD.html > /tmp/g1.HEAD.json
 *   node scripts/_probe_g1.mjs                             > /tmp/g1.NEW.json
 *   node scripts/_probe_g1.mjs --solo globo --dest /tmp/capt
 *
 * Infraestructura calcada de scripts/_probe_f.mjs y scripts/_probe_w2b.mjs (teclas y clics
 * reales, cierre del arbol de Chrome por PID PROPIO, reloj sobre ev(), aviso legal despejado con
 * su denominador, md5 al principio y al final, emulacion de viewport y captura).
 *
 * ⚠️ Sin acentos graves dentro del template de la sonda, tampoco en sus comentarios.
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, extname, isAbsolute, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

/* ⚠️ EL ARBOL DE CHROME NO SE CIERRA CON `proc.kill()`, Y ASI SE JUNTARON 70 PROCESOS (2026-10-08).
   `proc.kill()` manda SIGTERM al proceso que lanzamos; Chrome arranca media docena de hijos
   (zygote, gpu, renderers) que NO son hijos nuestros, asi que sobreviven al padre y quedan
   HUERFANOS (ppid = 1) reteniendo su perfil. El camino de FALLO era peor: el
   `main().catch(... process.exit(1))` de las sondas no mataba nada, y el timeout de 20 s de
   `abrirChrome` tampoco. Medido antes de este arreglo: 10 Chrome huerfanos con 60 hijos y 1075
   perfiles temporales sin borrar, 2,9 GB en $TMPDIR.
   Tres piezas, ninguna decorativa:
     1. `detached: true` en el spawn, que hace a Chrome LIDER DE SU PROPIO GRUPO de procesos. Sin
        eso, matar un grupo se llevaria al script mismo;
     2. un barrido que mata el GRUPO (`process.kill(-pid)`) y no solo al padre, asi que alcanza a
        los hijos que Chrome creo por su cuenta;
     3. el barrido colgado de `exit` ADEMAS de las senales, porque el `process.exit(1)` del camino
        de fallo y el `process.exit(0)` del camino feliz NO disparan SIGINT ni SIGTERM — pero si
        disparan `exit`. De ahi que el borrado del perfil use `rmSync`: en `exit` ya no corre nada
        asincrono, y un `await rm(...)` ahi se descarta en silencio.
   ⚠️ SOLO PIDs PROPIOS, NUNCA POR NOMBRE. El registro guarda unicamente lo que lanzo ESTE
   proceso. Un `pkill`/`killall` por patron se lleva el Chrome del usuario y la corrida del de al
   lado — en este repo ya hay una leccion escrita sobre un `pkill` que mato la corrida en curso. */
const _ARNES_VIVOS = new Set();
let _arnesLimpiezaArmada = false;
function _arnesCerrarAlSalir(proc, perfil) {
  if (!proc || !proc.pid) return;
  _ARNES_VIVOS.add({ pid: proc.pid, perfil: perfil });
  if (_arnesLimpiezaArmada) return;
  _arnesLimpiezaArmada = true;
  const barrer = () => {
    for (const v of _ARNES_VIVOS) {
      /* El grupo primero. Si ya no existe, `kill` tira ESRCH y se ignora — el barrido es
         idempotente a proposito, porque los cierres del camino feliz ya llamaron a `proc.kill()`
         antes de llegar aca. El fallback al pid pelado cubre que `detached` no haya podido crear
         el grupo. */
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
/* --dest <dir>: si esta, los grupos `campos`, `globo` y `color` guardan PNG en los dos temas. */
const DEST = arg('--dest');

const CHROMES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome', '/usr/bin/chromium',
];
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css',
               '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml' };

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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-f-'));
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
   ⚠️ CUERPO DE TEMPLATE LITERAL: NI UN ACENTO GRAVE adentro, tampoco en los comentarios. */
const SONDA = `
window.__P = {
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  ph(id)  { var e = document.getElementById(id); return e ? (e.placeholder || '') : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  existe(id) { return !!document.getElementById(id) },
  ro(id) { var e = document.getElementById(id); return e ? (!!e.readOnly || !!e.disabled) : null },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  geo(id) { var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    var r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height),
             x: Math.round(r.left), y: Math.round(r.top),
             ok: r.width > 0 && r.height > 0 } },
  pill(v, t) { try { return (typeof pillOn === 'function') ? pillOn(v, t) : 'SIN pillOn' }
    catch(e) { return 'EXC' } },

  revelar(id) {
    var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    var abrio = [];
    for (var pase = 0; pase < 6; pase++) {
      var oculto = null, n = e;
      while (n && n.nodeType === 1) {
        if (getComputedStyle(n).display === 'none') { oculto = n; }
        n = n.parentNode;
      }
      if (!oculto) break;
      var oid = oculto.id || '';
      if (oid.indexOf('tab-') === 0) {
        try { showTab(oid.slice(4)); abrio.push(oid) } catch(x) { return { err: 'showTab ' + oid, abrio: abrio } }
      } else if (oid.indexOf('sacc-') === 0) {
        try { secToggle(oid.slice(5)); abrio.push(oid) } catch(x) { return { err: 'secToggle ' + oid, abrio: abrio } }
      } else if (oid.indexOf('ete-seccion-') === 0) {
        try { toggleEteSeccion(oid.replace('ete-seccion-','')); abrio.push(oid) } catch(x) { return { err: 'toggleEteSeccion ' + oid, abrio: abrio } }
      } else {
        var ctrl = null;
        if (oid) {
          var cand = Array.from(document.querySelectorAll('[onclick]')).find(function(b){
            return (b.getAttribute('onclick')||'').indexOf("'" + oid + "'") >= 0 });
          if (cand) { if (!cand.id) cand.id = '__prv_' + oid; ctrl = cand.id }
        }
        if (!ctrl) return { err: 'oculto por ' + (oid ? ('#' + oid) : ('.' + String(oculto.className||'?'))), abrio: abrio };
        return { necesitaClic: ctrl, abrio: abrio };
      }
    }
    return { abrio: abrio, ok: window.__P.vis(id) === true } },

  centro(id) { var e = document.getElementById(id); if (!e) return null;
    e.scrollIntoView({ block:'center', inline:'center' });
    var r = e.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return { err: 'nodo sin geometria' };
    return { x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) } },

  quienEsta(id, x, y) {
    var t = document.getElementById(id);
    var e = document.elementFromPoint(x, y);
    if (!e) return { enPunto: null, esElBlanco: false };
    return { enPunto: (e.id || ('<' + e.tagName.toLowerCase() + ' ' + String(e.className || '') + '>')),
             esElBlanco: !!(t && (e === t || t.contains(e) || e.contains(t))) } },

  /* ⚠️ DENOMINADOR. El bloque «Ventriculo derecho» es un ACORDEON que nace CERRADO: sin abrirlo
     sus quince campos no tienen caja, focus() falla EN SILENCIO y la escena mide un tecleo que
     nunca ocurrio. La pestania se llama 'vd' y NO 'vd-ad' —showTab('vd-ad') tira excepcion—, y
     el acordeon lo abre secToggle('vd'), con el id del card SIN el prefijo sacc-. */
  abrirTodo() {
    try { showTab('vd') } catch(e) {}
    var acc = document.getElementById('sacc-vd');
    if (acc && !acc.classList.contains('open')) { try { secToggle('vd') } catch(e) {} }
    var g = {};
    ['tvia','tapse','s_prime','vd_tei','fevd','vd_bas','vd_mid','vd_long','vd_vi','vd_pared',
     'tsvd_diametro','vti_tsvd','vd_area_d','vd_area_s'].forEach(function(id){
       g[id] = window.__P.geo(id).ok });
    var faltan = Object.keys(g).filter(function(k){ return !g[k] });
    return { tab: window.__P.vis('tab-vd'), faltan: faltan, ok: faltan.length === 0 } },

  /* El Doppler tricuspideo, donde vive la fila del TAPSE/PSAP. */
  abrirDoppler() {
    try { showTab('doppler') } catch(e) {}
    /* ⚠️ NO ES UN sacc- NI UN secToggle: el Doppler tricuspideo es una .card con
       toggleCard('dop-tricusp'), y su cuerpo nace en display:none. Sin abrirlo la fila y su
       globo EXISTEN y miden 0x0, asi que la tarjeta no se ancla y «no abre» se lee como «el
       mecanismo no funciona» — que es exactamente lo que informo la primera corrida. */
    var c = document.getElementById('dop-tricusp');
    if (c && getComputedStyle(c).display === 'none') { try { toggleCard('dop-tricusp', null) } catch(e) {} }
    return { tab: window.__P.vis('tab-doppler'),
             psap: window.__P.geo('psap_calc'),
             fila: window.__P.vis('row-tapse-psap'),
             globo: (function(){ var b = document.querySelector('[data-vinfo=\"tapse-psap\"]');
               if (!b) return 'NO EXISTE'; var r = b.getBoundingClientRect();
               return { w: Math.round(r.width), h: Math.round(r.height) } })(),
             ok: window.__P.vis('tab-doppler') === true && window.__P.geo('psap_calc').ok } },

  /* La seccion de INSUFICIENCIA de la valvula pulmonar: dos puertas, la seccion plegable y el
     cajon «Datos». valvDatosTog recibe el ID DEL CONTENEDOR, no el nombre de la valvula. */
  abrirPulmo() {
    try { showTab('valvulas') } catch(e) {}
    var s = document.getElementById('ete-seccion-valv-pulmonar');
    if (s && getComputedStyle(s).display === 'none') { try { toggleEteSeccion('valv-pulmonar') } catch(e) {} }
    var b = document.getElementById('bloque-insuf-pulmonar');
    if (b && getComputedStyle(b).display === 'none') b.style.display = 'block';
    try { var c = document.getElementById('caja-insuf-pulmonar');
      if (c && !c.classList.contains('valv-datos-abierto')) valvDatosTog('caja-insuf-pulmonar');
    } catch(e) {}
    return { tab: window.__P.vis('tab-valvulas'),
             ap: window.__P.geo('ip_ap_diam'), jet: window.__P.geo('ip_ancho'),
             ok: window.__P.geo('ip_ap_diam').ok } },

  limpiar() {
    try { limpiarCampos(true) } catch(e) {}
    window.esqSevManual = {}; window._sevCalcAlFijar = {};
    ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){
        try { localStorage.removeItem('valv-pill-' + t + '-' + v) } catch(e){}
        try { if (window.__P.pill(v,t) === true) toggleValvPill(v,t) } catch(e){}
      });
    });
    try { if (window.VALV_ESTEN_AUTO) window.VALV_ESTEN_AUTO.clear() } catch(e) {}
    try { if (window.VALV_INSUF_AUTO) window.VALV_INSUF_AUTO.clear() } catch(e) {}
    return 1 },

  /* Montaje de escena, NO el gesto medido. */
  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value } },

  /* ══ LAS QUINCE CASILLAS: columna, fila y geometria ═══════════════════════════════════════
     El ORDEN DEL DOCUMENTO es lo que recorre el Tab, asi que se devuelve en ese orden; las dos
     clases dicen en que celda deberia caer y el rect dice donde cayo de verdad. */
  mapaVD() {
    var cont = document.querySelector('.vd-grid');
    if (!cont) return { err: 'NO EXISTE .vd-grid' };
    var out = [];
    cont.querySelectorAll('.fg').forEach(function(fg, i){
      var inp = fg.querySelector('input,select,textarea');
      var cs = getComputedStyle(fg), r = fg.getBoundingClientRect();
      var cl = String(fg.className || '');
      var col = (cl.match(/vd-c(\\d)/) || [])[1] || null;
      var fil = (cl.match(/vd-r(\\d)/) || [])[1] || null;
      out.push({ i: i, id: inp ? inp.id : null, col: col, fila: fil,
                 display: cs.display,
                 x: Math.round(r.left), y: Math.round(r.top),
                 w: Math.round(r.width), h: Math.round(r.height),
                 rot: (function(){ var l = fg.querySelector('label');
                   return l ? (l.textContent || '').trim().slice(0, 34) : '' })() });
    });
    return { n: out.length, campos: out,
             tabindex: Array.from(cont.querySelectorAll('[tabindex]')).map(function(e){
               return (e.id || e.tagName) + '=' + e.getAttribute('tabindex') }),
             /* desborde horizontal de la pagina entera */
             scrollW: document.documentElement.scrollWidth, vw: innerWidth } },

  /* El orden del DOCUMENTO de los quince campos — que es lo que el Tab recorre sin tabindex. */
  ordenDoc() {
    var cont = document.querySelector('.vd-grid');
    if (!cont) return { err: 'NO EXISTE .vd-grid' };
    return Array.from(cont.querySelectorAll('input[id]')).map(function(e){ return e.id }) },

  foco() { return document.activeElement ? (document.activeElement.id || '<' + document.activeElement.tagName + '>') : null },

  /* ══ LAS FILAS DEL CUADRO DE REFERENCIAS DEL VD ═══════════════════════════════════════════
     Se devuelve el orden REAL de las filas, su visibilidad computada y su texto. El conteo es lo
     unico que caza una fila que se duplico o que se fue. */
  cuadroVD() {
    var e = document.getElementById('vd-tam');
    var c = e ? e.closest('.calc-box') : null;
    if (!c) return { err: 'NO EXISTE el cuadro del VD' };
    var filas = [];
    c.querySelectorAll('.calc-row').forEach(function(r){
      var lbl = r.querySelector('.calc-lbl');
      var val = r.querySelector('span[id]:not(.calc-lbl)');
      filas.push({ rowId: r.id || '', lbl: lbl ? (lbl.textContent||'').trim() : '',
                   id: val ? val.id : null,
                   vis: getComputedStyle(r).display !== 'none',
                   txt: val ? (val.textContent||'').trim() : '' });
    });
    return { n: filas.length, filas: filas,
             aviso: { txt: window.__P.txt('vd-tei-aviso'),
                      vis: window.__P.vis('vd-tei-aviso') },
             facCasilla: { vis: window.__P.vis('fg-vd-fac'), val: window.__P.val('vd_fac') } } },

  /* La fila del TAPSE/PSAP del Doppler tricuspideo, su valor y su comentario. */
  fotoTPSP() {
    var row = document.getElementById('row-tapse-psap');
    var val = (function(){ try { return (typeof vdTapsePsap === 'function') ? vdTapsePsap() : 'SIN FN' }
                           catch(e) { return 'EXC' } })();
    return { tapse: window.__P.val('tapse'), psap: window.__P.val('psap_calc'),
             dueno: val,
             filaVis: row ? getComputedStyle(row).display !== 'none' : 'NO EXISTE FILA',
             txt: window.__P.txt('tapse-psap-interp'),
             /* las otras dos superficies que ya lo calculaban, para comprobar que el numero es
                el mismo en las tres */
             tep: window.__P.txt('tep-tapse-psap'),
             tepAcopl: window.__P.txt('tep-acoplamiento'),
             htpC: window.__P.txt('htp2022-catC'),
             htpProb: window.__P.txt('htp2022-prob'),
             /* La TERCERA superficie que ya lo calculaba: cxTP, del modulo de
                constriccion/restriccion, con sus propios cortes y sus campos de sobreescritura. */
             cx: window.__P.txt('cx-tp-res') } },

  /* El campo nuevo del diametro de la arteria pulmonar y su marca. */
  fotoIP() {
    return { ap: window.__P.val('ip_ap_diam'),
             marca: window.__P.txt('ip_ap_diam-marca'),
             dueno: (function(){ try { return (typeof ipApDiamVal === 'function') ? ipApDiamVal() : 'SIN FN' }
                                 catch(e) { return 'EXC' } })(),
             banda: (function(){ try { return JSON.stringify(IP_AP_BANDA) } catch(e) { return 'SIN BANDA' } })(),
             ipGrado: window.__P.val('ip_grado'),
             ipSev: window.__P.txt('ip-sev'),
             refPht: window.__P.txt('ip-ref-pht'), refAncho: window.__P.txt('ip-ref-ancho'),
             refSenal: window.__P.txt('ip-ref-senal'), refRev: window.__P.txt('ip-ref-rev'),
             disc: window.__P.txt('ip-discordancia'),
             pill: window.__P.pill('pulmonar','insuf') } },

  campos() {
    var c = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return } catch(e){}
      c[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      c[el.id + '__chk'] = el.checked ? '1' : '0' });
    return c },
  camposHash() {
    var c = window.__P.campos();
    delete c['informe_texto']; delete c['en_suma'];
    /* ⚠️ EL CAMPO NUEVO SE DESCUENTA: contra HEAD no existe, asi que sin esto el hash sale
       distinto en TODA escena por el solo hecho de que el campo exista, y el A/B deja de
       distinguir «se agrego algo» de «cambio otra cosa». Se informa aparte si esta. */
    var hayAp = Object.prototype.hasOwnProperty.call(c, 'ip_ap_diam');
    delete c['ip_ap_diam'];
    var k = Object.keys(c).sort(), s = '';
    for (var i=0;i<k.length;i++) s += k[i] + '=' + String(c[k[i]]) + '|';
    var h = 0; for (var j=0;j<s.length;j++) { h = ((h<<5)-h) + s.charCodeAt(j); h |= 0 }
    return { n: k.length, hash: String(h), hayAp: hayAp } },

  excel() {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    try { var r = _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-15',
            campos: window.__P.campos() });
      var k = Object.keys(r).sort(), s = '';
      for (var i=0;i<k.length;i++) s += k[i] + '=' + String(r[k[i]]) + '|';
      var h = 0; for (var j=0;j<s.length;j++) { h = ((h<<5)-h) + s.charCodeAt(j); h |= 0 }
      return { cols: k.length, hash: String(h),
               /* el censo explicito: ninguna columna puede nombrar el campo nuevo */
               ap: k.filter(function(x){ return x.toLowerCase().indexOf('arteria pulmonar') >= 0 }) };
    } catch(e) { return 'EXC: ' + e.message } },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  ajenos() {
    return {
      imGrado:   window.__P.val('im_grado'),
      iaGrado:   window.__P.val('ia_grado'),
      itGrado:   window.__P.val('it_grado'),
      etGrado:   window.__P.val('et_grado'),
      epGrado:   window.__P.val('ep_grado'),
      ipGrado:   window.__P.val('ip_grado'),
      emGrado:   window.__P.val('em_grado'),
      eaGrado:   window.__P.val('ea_grado'),
      ddInterp:  window.__P.txt('dd-interp'),
      hfLinea:   window.__P.txt('hfapeff-eco-lbl'),
      vdTam:     window.__P.txt('vd-tam'),
      pills: (function(){ var o = {};
        ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
          ['esten','insuf'].forEach(function(t){ o[t + '-' + v] = window.__P.pill(v,t) }) });
        return o })()
    } },
  ppt() {
    var o = {};
    ['im_grado','ia_grado','it_grado','et_grado','ep_grado','ip_grado','em_grado','ea_grado']
      .forEach(function(id){
        var e = document.getElementById(id);
        if (!e) { o[id] = 'NO EXISTE'; return }
        o[id] = (e.tagName === 'SELECT' && e.selectedIndex >= 0)
          ? (e.options[e.selectedIndex].textContent || '').trim()
          : ('[' + String(e.value) + ']');
      });
    o.vdvi = window.__P.val('vd_vi');
    o.fevd = window.__P.val('fevd');
    o.fac  = window.__P.val('vd_fac');
    return o },
  lab() { try { return (typeof _labTapse === 'function')
      ? { tapse: _labTapse({ campos: window.__P.campos() }),
          ea: (typeof _labEstenSev === 'function')
              ? _labEstenSev({ campos: window.__P.campos(), informe_texto:
                  (document.getElementById('informe_texto')||{}).value || '' }, 'ea_grado') : 'SIN FN' }
      : 'SIN FN' }
    catch(e) { return 'EXC: ' + e.message } },

  /* ══ LA TARJETA DEL GLOBO ⓘ ═══════════════════════════════════════════════════════════════ */
  tarjeta() {
    var c = document.getElementById('vinfo-card');
    if (!c) return { err: 'NO EXISTE vinfo-card' };
    var cs = getComputedStyle(c), r = c.getBoundingClientRect();
    var bloques = {};
    c.querySelectorAll('[data-vinfo-b]').forEach(function(d){
      bloques[d.getAttribute('data-vinfo-b')] = (d.textContent||'').trim() });
    return { abierta: cs.display !== 'none',
             tit: (c.querySelector('#vinfo-tit')||{}).textContent || '',
             bloques: bloques, nBloques: Object.keys(bloques).length,
             rect: { x:Math.round(r.left), y:Math.round(r.top),
                     w:Math.round(r.width), h:Math.round(r.height) },
             dentro: r.width > 0 && r.left >= 0 && r.top >= 0 &&
                     r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1,
             texto: (c.textContent||'').trim() } },
  botonGlobo(clave) {
    var b = document.querySelector('[data-vinfo="' + clave + '"]');
    if (!b) return { err: 'NO EXISTE globo ' + clave };
    if (!b.id) b.id = '__g_' + clave;
    var r = b.getBoundingClientRect();
    return { id: b.id, tag: b.tagName.toLowerCase(), w: Math.round(r.width), h: Math.round(r.height),
             exp: b.getAttribute('aria-expanded'), title: b.getAttribute('title'),
             onclick: b.getAttribute('onclick') || '' } },

  /* ⚠️ EL COLOR SE LEE COMPUTADO *Y* SE PREGUNTA POR LA VARIABLE, porque la tanda D2 encontro
     avisos «ambar» que se veian grises: --amber solo existe dentro de .amilo-root. */
  color(sel) {
    var e = (sel.charAt(0) === '#') ? document.getElementById(sel.slice(1))
                                    : document.querySelector(sel);
    if (!e) return { err: 'NO EXISTE ' + sel };
    var cs = getComputedStyle(e);
    return { color: cs.color, display: cs.display, fontSize: cs.fontSize,
             varText2: cs.getPropertyValue('--text2').trim(),
             varOrange: cs.getPropertyValue('--orange').trim(),
             varAmber:  cs.getPropertyValue('--amber').trim() } },
  tema(claro) {
    var r = document.documentElement;
    if (claro) r.classList.add('light-mode'); else r.classList.remove('light-mode');
    return { claro: !!claro, tieneClase: r.classList.contains('light-mode') } },

  /* La regla de CSS que produce las tres columnas, leida del FUENTE: un caso de la suite corre
     a 756 px y no puede ver la grilla renderizada. */
  reglasGrilla() {
    var src = document.documentElement.innerHTML;
    var decl = ['.vd-grid > .vd-c1 { grid-column: 1; }','.vd-grid > .vd-c2 { grid-column: 2; }',
                '.vd-grid > .vd-c3 { grid-column: 3; }','.vd-grid > .vd-r1 { grid-row: 1; }',
                '.vd-grid > .vd-r2 { grid-row: 2; }','.vd-grid > .vd-r3 { grid-row: 3; }',
                '.vd-grid > .vd-r4 { grid-row: 4; }','.vd-grid > .vd-r5 { grid-row: 5; }'];
    return { faltan: decl.filter(function(d){ return src.indexOf(d) < 0 }),
             colapso: src.indexOf('.grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }') > -1 } },

  despejar() {
    var o = {};
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (!m) { o[id] = 'NO EXISTE'; return; }
      o[id] = getComputedStyle(m).display;
      if (o[id] !== 'none') { m.style.display = 'none'; o[id] += ' -> none'; }
    });
    return o }
};
1`;

async function main() {
  const rutaViva = EXTERNO ? FARG : join(RAIZ, FILE);
  const md5Ini = await md5(rutaViva);
  const { srv, port } = await servir();
  const { wsUrl } = await abrirChrome(`http://127.0.0.1:${port}/${FILE}`);
  const cdp = await conectar(wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const page = targetInfos.find((t) => t.type === 'page');
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: page.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);
  const dialogos = [];
  cdp.alDialogo = (d) => { dialogos.push(d);
    cdp.send('Page.handleJavaScriptDialog', { accept: true }, sessionId).catch(() => {}); };
  const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
  await pausa(2200);

  /* ⚠️ RELOJ SOBRE ev(): un despacho que NO RESUELVE deja el fallo apareciendo en la llamada
     SIGUIENTE, o sea en la linea equivocada. Con el reloj el error nombra su propio paso. */
  const RELOJ = 75000;
  let _paso = '(arranque)';
  const paso = (n) => { _paso = n; if (VER || process.env.G1_TRAZA) console.error('  . ' + n); };
  async function ev(expr) {
    const r = await Promise.race([
      cdp.send('Runtime.evaluate',
        { expression: expr, returnByValue: true, awaitPromise: true }, sessionId),
      new Promise((_, no) => setTimeout(() => no(new Error(
        'CDP sin respuesta en ' + (RELOJ / 1000) + ' s - paso ' + _paso)), RELOJ)),
    ]);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' :: ' + (r.exceptionDetails.exception || {}).description);
    return r.result.value;
  }
  const J = async (expr) => JSON.parse(await ev('JSON.stringify(' + expr + ')'));
  /* ⚠️ `J` STRINGIFICA ANTES DE AWAITEAR, asi que sobre una PROMESA devuelve «{}» — y eso se lee
     igual que «el PDF salio vacio». La primera corrida del grupo `gc` informo las cuatro escenas
     con el objeto vacio sobre un jsPDF que SI habia cargado. `JP` resuelve la promesa DENTRO de
     la pagina y stringifica el resultado. */
  const JP = async (expr) => JSON.parse(await ev(
    'Promise.resolve(' + expr + ').then(function(r){ return JSON.stringify(r) })'));

  const VK = { Backspace: 8, Delete: 46, Tab: 9, Enter: 13, End: 35, Home: 36, Space: 32 };
  async function tecla(k, text) {
    if (text) {
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: k }, sessionId);
      await cdp.send('Input.dispatchKeyEvent', { type: 'char', text, unmodifiedText: text, key: k }, sessionId);
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k }, sessionId);
      return;
    }
    const vk = VK[k] || 0;
    await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: k, code: k,
      windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk }, sessionId);
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k,
      windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk }, sessionId);
  }
  async function clicEn(id) {
    const c = await J('window.__P.centro(' + JSON.stringify(id) + ')');
    if (!c || c.err) return { via: 'NO SE PUDO', por: c ? c.err : 'no existe' };
    const quien = await J('window.__P.quienEsta(' + JSON.stringify(id) + ', ' + c.x + ', ' + c.y + ')');
    if (quien.esElBlanco) {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await pausa(140);
      return { via: 'mouse', quien };
    }
    await ev('(function(){ var e=document.getElementById(' + JSON.stringify(id) + '); if(e) e.focus(); return 1 })()');
    await tecla('Enter', null);
    await pausa(140);
    return { via: 'tecla Enter', quien };
  }
  async function enfocar(id) {
    let rev = await J('window.__P.revelar(' + JSON.stringify(id) + ')');
    for (let i = 0; i < 4 && rev && rev.necesitaClic; i++) {
      await clicEn(rev.necesitaClic);
      rev = await J('window.__P.revelar(' + JSON.stringify(id) + ')');
    }
    const c = await J('window.__P.centro(' + JSON.stringify(id) + ')');
    if (c && !c.err) {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
    }
    await ev('(function(){ var e=document.getElementById(' + JSON.stringify(id) + '); if(e) e.focus(); return 1 })()');
    return c && c.err ? ('foco-dom (' + c.err + ')') : 'clic';
  }
  /* ⚠️ TIPEAR EN UN CAMPO SIN GEOMETRIA NO ES UNA MEDICION: se ABORTA nombrando el campo. */
  async function tipear(id, valor) {
    const hay = await ev('window.__P.existe(' + JSON.stringify(id) + ')');
    if (!hay) throw new Error('ABORTA: el campo ' + id + ' no existe en este arbol');
    let via = await enfocar(id);
    let geo = await J('window.__P.geo(' + JSON.stringify(id) + ')');
    if (!geo.ok) { await J('window.__P.abrirTodo()'); via = await enfocar(id);
                   geo = await J('window.__P.geo(' + JSON.stringify(id) + ')'); }
    if (!geo.ok) throw new Error('ABORTA: ' + id + ' sin geometria (' + JSON.stringify(geo) + ')');
    await ev('(function(){ var e=document.getElementById(' + JSON.stringify(id) + ');'
           + ' if(!e) return 0; e.focus(); try{ e.select() }catch(x){} return 1 })()');
    for (const ch of String(valor)) await tecla(ch, ch);
    await ev('(function(){ var e=document.getElementById(' + JSON.stringify(id) + ');'
           + ' if(e){ e.dispatchEvent(new Event("change",{bubbles:true})) } return 1 })()');
    await pausa(90);
    const quedo = await ev('window.__P.val(' + JSON.stringify(id) + ')');
    if (String(quedo) !== String(valor))
      throw new Error('ABORTA: el tecleo de ' + id + ' no quedo: pedido ' + valor + ', quedo ' + quedo);
    return { id, via, quedo: String(quedo) };
  }
  /* NUNCA Backspace sobre un campo de SOLO LECTURA: se comprueba antes y se declara. */
  async function borrar(id) {
    const ro = await ev('(function(){ var e=document.getElementById(' + JSON.stringify(id) + ');'
      + ' return e ? (!!e.readOnly || !!e.disabled) : "NO EXISTE" })()');
    if (ro !== false) return { id, via: 'NO SE BORRA', por: String(ro) };
    let via = await enfocar(id);
    let geo = await J('window.__P.geo(' + JSON.stringify(id) + ')');
    if (!geo.ok) { await J('window.__P.abrirTodo()'); via = await enfocar(id);
                   geo = await J('window.__P.geo(' + JSON.stringify(id) + ')'); }
    if (!geo.ok) throw new Error('ABORTA: no se puede borrar ' + id + ' sin geometria');
    await ev('(function(){ var e=document.getElementById(' + JSON.stringify(id) + '); if(e) e.focus(); return 1 })()');
    const foco = await ev('(function(){ return document.activeElement ? (document.activeElement.id || "") : "" })()');
    if (String(foco) !== String(id))
      throw new Error('ABORTA: el foco no llego a ' + id + ' (esta en ' + JSON.stringify(foco) + ')');
    await tecla('End', null);
    for (let i = 0; i < 12; i++) await tecla('Backspace', null);
    await ev('(function(){ var e=document.getElementById(' + JSON.stringify(id) + ');'
           + ' if(e){ e.dispatchEvent(new Event("change",{bubbles:true})); e.blur() } return 1 })()');
    await pausa(120);
    const quedo = await ev('window.__P.val(' + JSON.stringify(id) + ')');
    if (String(quedo) !== '')
      throw new Error('ABORTA: el borrado de ' + id + ' no quedo: sigue en ' + JSON.stringify(quedo));
    return { id, via: 'Backspace x12', quedo: '' };
  }

  /* ⚠️ HAY DOS GESTOS DE BORRADO Y DAN RESULTADOS DISTINTOS, Y ESO NO ES UN DETALLE DE LA SONDA.
     Borrando DIGITO POR DIGITO desde el final, el paso intermedio («1» de «160») vuelve a correr
     la cadena con un THP fuera de banda, asi que el grado se recalcula ahi y lo que queda rancio
     es el AVm INDEXADO del paso anterior. Seleccionando todo y borrando de UNA, la cadena no
     corre ningun paso intermedio: el THP pasa de «160» a vacio, `calcTHP` sale temprano y queda
     rancio TODO, el grado incluido. Es la escena del censo W1 y la que llega al papel firmado.
     El SELECT ALL va como COMANDO DE EDICION del propio evento de tecla (Meta+A con
     `commands:['selectAll']`), que es el mismo mecanismo por el que este repo manda Backspace por
     keycode: la tecla es real y Blink ejecuta el comando. */
  async function borrarSeleccion(id) {
    const ro = await ev('(function(){ var e=document.getElementById(' + JSON.stringify(id) + ');'
      + ' return e ? (!!e.readOnly || !!e.disabled) : "NO EXISTE" })()');
    if (ro !== false) return { id, via: 'NO SE BORRA', por: String(ro) };
    let via = await enfocar(id);
    let geo = await J('window.__P.geo(' + JSON.stringify(id) + ')');
    if (!geo.ok) { await J('window.__P.abrirTodo()'); via = await enfocar(id);
                   geo = await J('window.__P.geo(' + JSON.stringify(id) + ')'); }
    if (!geo.ok) throw new Error('ABORTA: no se puede borrar ' + id + ' sin geometria');
    await ev('(function(){ var e=document.getElementById(' + JSON.stringify(id) + '); if(e) e.focus(); return 1 })()');
    const foco = await ev('(function(){ return document.activeElement ? (document.activeElement.id || "") : "" })()');
    if (String(foco) !== String(id))
      throw new Error('ABORTA: el foco no llego a ' + id + ' (esta en ' + JSON.stringify(foco) + ')');
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'a', code: 'KeyA', modifiers: 4,
      commands: ['selectAll'], windowsVirtualKeyCode: 65, nativeVirtualKeyCode: 65 }, sessionId);
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'a', code: 'KeyA', modifiers: 4,
      windowsVirtualKeyCode: 65, nativeVirtualKeyCode: 65 }, sessionId);
    await pausa(60);
    await tecla('Backspace', null);
    await ev('(function(){ var e=document.getElementById(' + JSON.stringify(id) + ');'
           + ' if(e){ e.dispatchEvent(new Event("change",{bubbles:true})); e.blur() } return 1 })()');
    await pausa(140);
    const quedo = await ev('window.__P.val(' + JSON.stringify(id) + ')');
    if (String(quedo) !== '')
      throw new Error('ABORTA: el borrado de UNA VEZ de ' + id + ' no quedo: sigue en ' + JSON.stringify(quedo));
    return { id, via: 'selectAll + 1 Backspace', quedo: '' };
  }

  await ev('try{sessionStorage.setItem("ett_auth","1")}catch(e){}; location.reload(); 1');
  await pausa(2600);
  await ev(SONDA);
  const avisoIni = await J('window.__P.despejar()');
  /* ⚠️ DENOMINADOR DE ARRANQUE: el bloque «Ventriculo derecho» es un acordeon cerrado, asi que
     sin abrirlo ningun tecleo de esta sonda ocurre. Se ABORTA nombrando los campos que faltaron. */
  const listo = await J('window.__P.abrirTodo()');
  if (!listo.ok) throw new Error('ABORTA: el acordeon del VD no quedo abierto: ' + JSON.stringify(listo));

  const out = { file: FARG, md5Ini, avisoIni, listo, grupos: {} };
  const SOLOG = (arg('--solo') || '').split(',').map((s) => s.trim()).filter(Boolean);
  const corre = (g) => !SOLOG.length || SOLOG.indexOf(g) >= 0;

  /* ── campos ── LAS TRES COLUMNAS, EL ORDEN DEL TAB Y LA MAQUETA ───────────────────────── */
  if (corre('campos')) {
    paso('campos');
    const g = { reglas: await J('window.__P.reglasGrilla()'), anchos: {} };
    /* El orden del DOCUMENTO es lo que recorre el Tab sin tabindex. Se mide primero. */
    g.ordenDoc = await J('window.__P.ordenDoc()');
    /* Y el Tab REAL, con teclas de verdad: se enfoca el primero y se manda Tab catorce veces. */
    await J('window.__P.limpiar()');
    await J('window.__P.abrirTodo()');
    await J('window.__P.despejar()');
    await enfocar('tvia');
    const tabReal = [await ev('window.__P.foco()')];
    for (let i = 0; i < 14; i++) { await tecla('Tab', null); await pausa(40);
      tabReal.push(await ev('window.__P.foco()')); }
    g.tabReal = tabReal;
    /* ⚠️ LA CASILLA DE LA FAC NO TIENE GEOMETRIA SIN DATO, asi que el Tab NO la alcanza: se mide
       el recorrido otra vez con las dos areas cargadas, que es cuando la casilla existe. */
    await J('window.__P.set("vd_area_d", 20)');
    await J('window.__P.set("vd_area_s", 12)');
    await pausa(150);
    await enfocar('tvia');
    const tabConFac = [await ev('window.__P.foco()')];
    for (let i = 0; i < 14; i++) { await tecla('Tab', null); await pausa(40);
      tabConFac.push(await ev('window.__P.foco()')); }
    g.tabConFac = tabConFac;
    /* MAQUETA: 1200, 390 y 360 px en los DOS temas. */
    for (const anc of [1200, 390, 360]) {
      for (const claro of [false, true]) {
        await cdp.send('Emulation.setDeviceMetricsOverride',
          { width: anc, height: 950, deviceScaleFactor: 1, mobile: anc < 500 }, sessionId);
        const tema = await J('window.__P.tema(' + (claro ? 'true' : 'false') + ')');
        if (tema.tieneClase !== !!claro) throw new Error('ABORTA: la clase light-mode no quedo puesta');
        await J('window.__P.despejar()');
        await J('window.__P.abrirTodo()');
        await pausa(220);
        const m = await J('window.__P.mapaVD()');
        /* Solapamientos y desbordes, medidos y no mirados. */
        const vis = (m.campos || []).filter((c) => c.w > 0 && c.h > 0);
        const choques = [];
        for (let i = 0; i < vis.length; i++) for (let j = i + 1; j < vis.length; j++) {
          const a = vis[i], b = vis[j];
          if (a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h)
            choques.push(a.id + ' x ' + b.id);
        }
        g.anchos[anc + (claro ? '-claro' : '-oscuro')] = {
          n: m.n, conGeo: vis.length, tabindex: m.tabindex,
          choques, scrollW: m.scrollW, vw: m.vw,
          desborde: m.scrollW > m.vw + 1,
          /* columnas visuales = cuantas x distintas hay */
          colsVisuales: Array.from(new Set(vis.map((c) => c.x))).length,
          ordenVisual: vis.slice().sort((a, b) => (a.x - b.x) || (a.y - b.y)).map((c) => c.id),
          campos: m.campos
        };
        if (DEST && claro === false && anc === 1200) {
          const png = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
          await writeFile(join(DEST, 'g1-vd-1200-oscuro.png'), Buffer.from(png.data, 'base64'));
        }
        if (DEST && claro === true && anc === 1200) {
          const png = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
          await writeFile(join(DEST, 'g1-vd-1200-claro.png'), Buffer.from(png.data, 'base64'));
        }
      }
    }
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    await J('window.__P.tema(false)');
    out.grupos.campos = g;
  }

  /* ── refs ── EL CUADRO: ORDEN, FEVD, FAC Y EL Qp, CON TECLAS REALES ──────────────────── */
  if (corre('refs')) {
    paso('refs');
    const g = { escenas: {} };
    const esc = async (nom, pares, extra) => {
      await J('window.__P.limpiar()');
      const l = await J('window.__P.abrirTodo()');
      if (!l.ok) throw new Error('ABORTA: el acordeon del VD no quedo abierto: ' + JSON.stringify(l));
      await J('window.__P.despejar()');
      const tecleos = [];
      for (const [id, val] of pares) tecleos.push(await tipear(id, val));
      if (extra) await extra();
      await pausa(140);
      g.escenas[nom] = { tecleos, cuadro: await J('window.__P.cuadroVD()') };
      return g.escenas[nom].cuadro;
    };
    await esc('vacio', []);
    /* FEVD por sus DOS lados: la tabla de la ASE 2025 da normal > 45, asi que 45,0 es anormal. */
    await esc('fevd44', [['fevd', '44']]);
    await esc('fevd45', [['fevd', '45']]);
    await esc('fevd46', [['fevd', '46']]);
    /* La FAC: su casilla y su fila aparecen con el par de areas, y se van al borrar una. */
    await esc('facCon', [['vd_area_d', '20'], ['vd_area_s', '12']]);
    await esc('facBorrada', [['vd_area_d', '20'], ['vd_area_s', '12']],
      async () => { g.borrArea = await borrar('vd_area_s'); });
    /* El Qp: con los dos insumos, con uno solo y con ninguno. Aritmetica cerrada —
       d = 20 mm -> area = PI*(20/20)^2 = 3,1416 cm2; x VTI 20 cm = 62,8 ml. */
    await esc('qpCompleto', [['tsvd_diametro', '20'], ['vti_tsvd', '20']]);
    await esc('qpSoloDiam', [['tsvd_diametro', '20']]);
    await esc('qpSoloVti',  [['vti_tsvd', '20']]);
    await esc('qpBorrado',  [['tsvd_diametro', '20'], ['vti_tsvd', '20']],
      async () => { g.borrVti = await borrar('vti_tsvd'); });
    /* «Nuevo estudio» tiene que dejar las dos filas condicionales ESCONDIDAS otra vez. */
    await esc('antesDeLimpiar', [['fevd', '55'], ['vd_area_d', '20'], ['vd_area_s', '12']]);
    await J('window.__P.limpiar()');
    await J('window.__P.abrirTodo()');
    await pausa(160);
    g.trasLimpiar = await J('window.__P.cuadroVD()');
    out.grupos.refs = g;
  }

  /* ── vdvi ── LA RELACION VD/VI Y LA PARED GRADUADA ──────────────────────────────────── */
  if (corre('vdvi')) {
    paso('vdvi');
    const g = { escenas: {} };
    const esc = async (nom, pares) => {
      await J('window.__P.limpiar()');
      const l = await J('window.__P.abrirTodo()');
      if (!l.ok) throw new Error('ABORTA: el acordeon del VD no quedo abierto: ' + JSON.stringify(l));
      await J('window.__P.despejar()');
      const tecleos = [];
      for (const [id, val] of pares) tecleos.push(await tipear(id, val));
      await pausa(140);
      g.escenas[nom] = { tecleos, cuadro: await J('window.__P.cuadroVD()'),
                         inf: await J('window.__P.informe("estandar")'),
                         htpProb: await ev('window.__P.txt("htp2022-prob")'),
                         htpA: await ev('window.__P.txt("htp2022-catA")') };
      return g.escenas[nom];
    };
    /* El borde del VD/VI por sus dos lados: la ESC/ERS 2022 y la ASE 2025 escriben `> 1,0`. */
    await esc('vdvi099', [['vd_vi', '0.99']]);
    await esc('vdvi100', [['vd_vi', '1']]);
    await esc('vdvi101', [['vd_vi', '1.01']]);
    await esc('vdvi120', [['vd_vi', '1.2']]);
    /* La pared, por los TRES bordes de la Tabla 1 (folio 145): 5 / 7 / 9 mm. */
    for (const mm of ['4.9', '5', '7', '7.1', '9', '9.1', '12']) {
      await esc('pared' + String(mm).replace('.', '_'), [['vd_pared', mm]]);
    }
    out.grupos.vdvi = g;
  }

  /* ── tpsp ── EL COCIENTE TAPSE/PSAP EN SUS TRES TRAMOS ──────────────────────────────── */
  if (corre('tpsp')) {
    paso('tpsp');
    const g = { escenas: {} };
    /* PmAD: con la VCI <= 21 mm y colapso > 50 % la PmAD es 3 mmHg, que es el valor mas chico y
       el mas facil de despejar. PSAP = 4*VRT^2 + PmAD, redondeada a entero por `calcPSAP`.
       Para que el cociente caiga donde queremos se elige la VRT y despues el TAPSE. */
    const esc = async (nom, vrt, tapse, sinTapse, sinVrt) => {
      await J('window.__P.limpiar()');
      await J('window.__P.abrirTodo()');
      await J('window.__P.despejar()');
      await J('window.__P.set("vci_diam", 18)');
      await J('window.__P.set("vci_col", ">50")');
      const tecleos = [];
      if (!sinVrt)   tecleos.push(await tipear('vmax_it', String(vrt)));
      if (!sinTapse) tecleos.push(await tipear('tapse', String(tapse)));
      await J('window.__P.abrirDoppler()');
      await pausa(180);
      g.escenas[nom] = { tecleos, foto: await J('window.__P.fotoTPSP()') };
      return g.escenas[nom].foto;
    };
    /* PSAP con VRT 3,0 y PmAD 3 -> 4*9+3 = 39 mmHg.
       TAPSE 14 -> 0,359 (<0,36)  ·  TAPSE 15 -> 0,3846  ·  TAPSE 22 -> 0,564 (>=0,55)
       Los bordes EXACTOS se buscan con la PSAP en 100: TAPSE 36 -> 0,36 y TAPSE 55 -> 0,55.
       Para PSAP 100: 4*VRT^2 + 3 = 100 -> VRT = 4.9244... No da entero, asi que el borde exacto
       se arma con PmAD 3 y VRT 4,0 -> PSAP 67; TAPSE 24,12 no es tipeable con un decimal.
       Se usa entonces PSAP 39 y TAPSE con dos decimales, que el campo acepta. */
    await esc('tramoBajo',  3.0, 14);      // 14/39 = 0,3590
    await esc('tramoMedio', 3.0, 16);      // 16/39 = 0,4103
    await esc('tramoAlto',  3.0, 22);      // 22/39 = 0,5641
    await esc('borde036',   3.0, 14.04);   // 14,04/39 = 0,36000
    await esc('borde036ab', 3.0, 14.03);   // 14,03/39 = 0,35974 -> redondea a 0,36
    await esc('borde055',   3.0, 21.45);   // 21,45/39 = 0,55000
    await esc('borde055ab', 3.0, 21.3);    // 21,3/39  = 0,54615
    await esc('sinTapse',   3.0, null, true,  false);
    await esc('sinPsap',    3.0, 20,   false, true);
    out.grupos.tpsp = g;
  }

  /* ── globo ── LA TARJETA ⓘ DEL TAPSE/PSAP ───────────────────────────────────────────── */
  if (corre('globo')) {
    paso('globo');
    const g = { anchos: {} };
    const montar = async () => {
      await J('window.__P.limpiar()');
      await J('window.__P.abrirTodo()');
      await J('window.__P.despejar()');
      await J('window.__P.set("vci_diam", 18)');
      await J('window.__P.set("vci_col", ">50")');
      await J('window.__P.set("vmax_it", 3.0)');
      await J('window.__P.set("tapse", 16)');
      await J('window.__P.abrirDoppler()');
      await pausa(200);
    };
    await montar();
    g.boton = await J('window.__P.botonGlobo("tapse-psap")');
    /* DENOMINADOR: un globo sin geometria no ancla nada, y medir sus cierres sobre un boton de
       0x0 informa «no abre» sobre un mecanismo que funciona. */
    if (g.boton.err || !g.boton.w) throw new Error('ABORTA: el globo del TAPSE/PSAP no tiene geometria: ' + JSON.stringify(g.boton));
    /* Los CUATRO caminos de cierre, uno por uno. */
    await clicEn(g.boton.id); await pausa(170);
    g.abre = await J('window.__P.tarjeta()');
    await clicEn(g.boton.id); await pausa(170);
    g.segundoToque = (await J('window.__P.tarjeta()')).abierta;
    await clicEn(g.boton.id); await pausa(170);
    await tecla('Escape', null); await pausa(170);
    g.escape = (await J('window.__P.tarjeta()')).abierta;
    await clicEn(g.boton.id); await pausa(170);
    await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 5, y: 5, button: 'left', clickCount: 1 }, sessionId);
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 5, y: 5, button: 'left', clickCount: 1 }, sessionId);
    await pausa(170);
    g.afuera = (await J('window.__P.tarjeta()')).abierta;
    /* Sin hover y sin enlace al manual: se lee el propio boton. */
    g.sinLegado = { tag: g.boton.tag, title: g.boton.title,
                    ayuda: String(g.boton.onclick || '').indexOf('abrirAyudaEco') >= 0 };
    for (const anc of [1200, 390, 360]) {
      for (const claro of [false, true]) {
        await cdp.send('Emulation.setDeviceMetricsOverride',
          { width: anc, height: 950, deviceScaleFactor: 1, mobile: anc < 500 }, sessionId);
        const tema = await J('window.__P.tema(' + (claro ? 'true' : 'false') + ')');
        if (tema.tieneClase !== !!claro) throw new Error('ABORTA: la clase light-mode no quedo puesta');
        await montar();
        const b = await J('window.__P.botonGlobo("tapse-psap")');
        if (b.err || !b.w) { g.anchos[anc + (claro ? '-claro' : '-oscuro')] = { boton: b }; continue; }
        await clicEn(b.id); await pausa(200);
        const t = await J('window.__P.tarjeta()');
        const sigue = await J('window.__P.botonGlobo("tapse-psap")');
        g.anchos[anc + (claro ? '-claro' : '-oscuro')] = {
          abierta: t.abierta, dentro: t.dentro, rect: t.rect, nBloques: t.nBloques,
          chars: t.texto.length,
          acentos: (t.texto.match(/[áéíóúñÁÉÍÓÚÑ]/g) || []).length,
          globoAlcanzable: !!(sigue && sigue.w > 0 && sigue.h > 0),
          bloques: t.bloques };
        if (DEST && (anc === 1200 || anc === 360)) {
          const png = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
          const nom = 'g1-tarjeta-' + anc + (claro ? '-claro' : '-oscuro') + '.png';
          await writeFile(join(DEST, nom), Buffer.from(png.data, 'base64'));
          g.anchos[anc + (claro ? '-claro' : '-oscuro')].png = nom;
          g.anchos[anc + (claro ? '-claro' : '-oscuro')].pngMd5 =
            createHash('md5').update(Buffer.from(png.data, 'base64')).digest('hex');
        }
        await tecla('Escape', null); await pausa(140);
      }
    }
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    await J('window.__P.tema(false)');
    out.grupos.globo = g;
  }

  /* ── pulmo ── EL DIAMETRO DE LA ARTERIA PULMONAR ────────────────────────────────────── */
  if (corre('pulmo')) {
    paso('pulmo');
    const g = { escenas: {} };
    const esc = async (nom, mm, extra) => {
      await J('window.__P.limpiar()');
      const l = await J('window.__P.abrirPulmo()');
      if (!l.ok) throw new Error('ABORTA: el campo del diametro de la AP no quedo visible: ' + JSON.stringify(l));
      await J('window.__P.despejar()');
      const tecleos = [];
      if (mm !== null) tecleos.push(await tipear('ip_ap_diam', String(mm)));
      if (extra) await extra();
      await pausa(140);
      g.escenas[nom] = { tecleos, foto: await J('window.__P.fotoIP()'),
                         inf: await J('window.__P.informe("estandar")'),
                         excel: await J('window.__P.excel()') };
      return g.escenas[nom];
    };
    await esc('vacio', null);
    await esc('normal', '22');
    await esc('dilatada', '30');
    /* La banda [5,80]: el diametro tipeado en CENTIMETROS y un valor imposible. */
    await esc('enCm', '2.5');
    await esc('enorme', '120');
    await esc('borde5', '5');
    await esc('borde80', '80');
    /* CONTROL NEGATIVO: con los cuatro signos de la IP cargados, el diametro NO mueve el grado. */
    const conSignos = async () => {
      await J('window.__P.set("ip_pht", 90)');
      await J('window.__P.set("ip_ancho", "ancho")');
      await J('window.__P.set("ip_senal", "densa_emp")');
    };
    await esc('signosSinAp', null, conSignos);
    await esc('signosConAp', '30', conSignos);
    /* «Nuevo estudio» lo vacia; y el estudio GUARDADO lo conserva. */
    await J('window.__P.limpiar()');
    await J('window.__P.abrirPulmo()');
    await pausa(140);
    g.trasLimpiar = await J('window.__P.fotoIP()');
    g.guardado = await J('(function(){ var c = window.__P.campos();'
      + ' return { tiene: Object.prototype.hasOwnProperty.call(c, "ip_ap_diam"),'
      + ' valor: c["ip_ap_diam"] } })()');
    out.grupos.pulmo = g;
  }

  /* ── color ── EL AVISO DEL TEI EN LOS DOS TEMAS ─────────────────────────────────────── */
  if (corre('color')) {
    paso('color');
    const g = {};
    for (const claro of [false, true]) {
      const tema = await J('window.__P.tema(' + (claro ? 'true' : 'false') + ')');
      if (tema.tieneClase !== !!claro) throw new Error('ABORTA: la clase light-mode no quedo puesta');
      await J('window.__P.limpiar()');
      await J('window.__P.abrirTodo()');
      await J('window.__P.despejar()');
      await J('window.__P.set("vd_tei", 0.62)');
      await J('window.__P.set("it_grado", "4")');
      await pausa(200);
      g[claro ? 'claro' : 'oscuro'] = {
        aviso: await J('window.__P.color("#vd-tei-aviso")'),
        txt: await ev('window.__P.txt("vd-tei-aviso")'),
        /* CONTROL: el aviso de exclusiones de la diastolica, que YA estaba en --orange */
        control: await J('window.__P.color("#diast-excl-aviso")') };
      if (DEST) {
        await cdp.send('Emulation.setDeviceMetricsOverride',
          { width: 1200, height: 950, deviceScaleFactor: 1, mobile: false }, sessionId);
        await J('window.__P.despejar()');
        await pausa(160);
        const png = await cdp.send('Page.captureScreenshot', { format: 'png' }, sessionId);
        const nom = 'g1-tei-aviso-' + (claro ? 'claro' : 'oscuro') + '.png';
        await writeFile(join(DEST, nom), Buffer.from(png.data, 'base64'));
        g[claro ? 'claro' : 'oscuro'].png = nom;
        g[claro ? 'claro' : 'oscuro'].pngMd5 =
          createHash('md5').update(Buffer.from(png.data, 'base64')).digest('hex');
        await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
      }
    }
    await J('window.__P.tema(false)');
    out.grupos.color = g;
  }

  /* ── controles ── NADA AJENO SE MUEVE, con un escenario CARGADO para que haya denominador ─ */
  if (corre('controles')) {
    paso('controles');
    const g = {};
    const escenaCompleta = async () => {
      await J('window.__P.limpiar()');
      await J('window.__P.set("nombre", "G1-CTRL")');
      for (const [id, v] of [['peso', 80], ['talla', 180], ['sexo', 'M'], ['edad', 68],
        ['ddfvi', 52], ['dsfvi', 36], ['siv', 11], ['ppvi', 11],
        ['fevi', 60], ['vdfvi', 140], ['vsfvi', 60], ['vol_lat', 75], ['sgl', 18],
        ['ai_vol', 70], ['ai_diam', 40], ['ai_area', 22],
        ['diam_tsvi', 20], ['itv_tsvi', 21], ['itv_ao', 55], ['vmax_ao', 3.5], ['gmedio_ao', 30],
        ['hemo_fc', 72], ['onda_e', 90], ['onda_a', 60], ['e_sep', 6], ['e_lat', 8],
        ['tde', 180], ['triv', 90], ['lars', 20],
        ['im_vc', 5], ['avm_cont', 1.8], ['em_gmedio', 3],
        ['vmax_it', 3.0], ['tapse', 20], ['s_prime', 12],
        ['vd_bas', 38], ['vd_mid', 30], ['vd_long', 70], ['vd_vi', 0.8],
        ['vd_pared', 4], ['vd_tei', 0.45], ['vd_area_d', 20], ['vd_area_s', 12],
        ['fevd', 55], ['tsvd_diametro', 22], ['vti_tsvd', 18],
        ['hf_ntprobnp', 450], ['ip_vmax', 2.5], ['pmad', 8]]) {
        await J('window.__P.set(' + JSON.stringify(id) + ', ' + JSON.stringify(v) + ')');
      }
      await J('window.__P.abrirTodo()');
      await pausa(300);
      return 1;
    };
    await escenaCompleta();
    g.cargado = {
      ajenos: await J('window.__P.ajenos()'),
      excel:  await J('window.__P.excel()'),
      campos: await J('window.__P.camposHash()'),
      ppt:    await J('window.__P.ppt()'),
      lab:    await J('window.__P.lab()'),
      cuadro: await J('window.__P.cuadroVD()'),
      inf: {}
    };
    for (const est of ['estandar', 'narrativo', 'conciso']) {
      g.cargado.inf[est] = await J('window.__P.informe(' + JSON.stringify(est) + ')');
    }
    /* La otra punta: el formulario VACIO, donde el Excel tiene que seguir en 436 columnas. */
    await J('window.__P.limpiar()');
    await pausa(200);
    g.vacio = { excel: await J('window.__P.excel()'),
                campos: await J('window.__P.camposHash()'),
                cuadro: await J('window.__P.cuadroVD()'),
                inf: await J('window.__P.informe("estandar")') };
    out.grupos.controles = g;
  }

  out.dialogos = dialogos;
  out.avisoFin = await J('window.__P.despejar()');
  out.md5Fin = await md5(rutaViva);
  console.log(JSON.stringify(out, null, 1));
  try { cdp.close(); } catch (e) {}
  try { srv.close(); } catch (e) {}
  process.exit(0);
}

main().catch((e) => { console.error('[_probe_g1] ' + (e && e.stack || e)); process.exit(1); });
