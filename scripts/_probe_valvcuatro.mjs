#!/usr/bin/env node
/**
 * _probe_valvcuatro.mjs — sonda A/B de SOLO LECTURA para la tanda de las CUATRO PARTES CHICAS de
 * Valvulas (2026-10-14):
 *   (1) el VTI de entrada de la estenosis TRICUSPIDEA pasa de «>60 cm» a «>=60 cm» (ASE 2023,
 *       Pandian, folio 16);
 *   (2) la casilla de PISA de «Incluir en el informe» de la insuficiencia MITRAL se puede
 *       DESTILDAR, y la ultima casilla tildada no;
 *   (3) los grados calculados de la IM y de la IT y el renglon «im-cont-severidad» dejan de
 *       sobrevivir a «Nuevo estudio»;
 *   (4) tres afirmaciones viejas de la ayuda «Referencia clinica» de la estenosis mitral.
 *
 * Infraestructura calcada de scripts/_probe_valvborra.mjs (teclas y clics reales, cierre del arbol
 * de Chrome por GRUPO y por PID PROPIO, cierre del aviso legal con su denominador, md5 al
 * principio y al final). NO muta index.html.
 *
 *   node scripts/_probe_valvcuatro.mjs --file /tmp/index.HEAD.html > /tmp/vc.HEAD.json
 *   node scripts/_probe_valvcuatro.mjs                             > /tmp/vc.NEW.json
 *
 * Grupos (--solo vti|area|pisa|nuevo|ayuda|controles):
 *   vti       — el borde 59,9 / 60,0 / 60,1 del VTI de entrada, su rotulo y su borrado.
 *   area      — el area tricuspidea por continuidad con los mismos datos: no se puede mover.
 *   pisa      — las tres combinaciones de casillas, la ultima que no se destilda, y el PDF.
 *   nuevo     — «Nuevo estudio» con clics REALES: que queda vivo de la IM y de la IT.
 *   ayuda     — las tres afirmaciones viejas de la ayuda de la estenosis mitral.
 *   controles — IAo, IT, EAo, EP, IP, diastolica, HFA-PEFF, Laboratorio y Excel.
 *
 * ⚠️ Sin acentos graves dentro del template de la sonda, tampoco en los comentarios de adentro.
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
const hacer = (g) => !SOLO || SOLO.split(',').indexOf(g) > -1;

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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-vb-'));
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
   ⚠️ CUERPO DE TEMPLATE LITERAL: ni un acento grave adentro, tampoco en los comentarios. */
const SONDA = `
window.__P = {
  existe(id) { return !!document.getElementById(id) },
  /* ⚠️ GEOMETRIA Y FOCO, QUE ES EL DENOMINADOR DE CADA TECLEO. Un nodo en display:none no tiene
     caja y focus() sobre el falla EN SILENCIO: las teclas se van al documento y el campo
     conserva su valor. La sonda ABORTA en vez de informar el resultado de un gesto que no paso. */
  geo(id) { var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    var r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height),
             foco: document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : null,
             ok: r.width > 0 && r.height > 0 } },
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  tag(id) { var e = document.getElementById(id); return e ? e.tagName : null },
  sug(id) { var e = document.getElementById(id); return e ? (e.dataset.sugerido || null) : null },
  /* El «(leve)/(moderada)/(severa)» de una fila de referencia: span hermano, SIN id, seleccionado
     por su atributo. Devuelve 'NO EXISTE' si el nodo no esta —es como el A/B contra HEAD muestra
     que aparecio, y no un null silencioso—. */
  grd(spanId) { var e = document.querySelector('[data-grado-de="' + spanId + '"]');
    return e ? (e.textContent || '') : 'NO EXISTE' },
  chk(id) { var e = document.getElementById(id); return e ? !!e.checked : null },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  pill(valv, tipo) { try { return (typeof pillOn === 'function') ? pillOn(valv, tipo) : 'SIN pillOn' }
    catch(e) { return 'EXC' } },
  ls(k) { try { return localStorage.getItem(k) } catch(e) { return 'EXC' } },

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

  /* ⚠️ DENOMINADOR. Pestania Valvulas con sus cuatro acordeones ABIERTOS y los cajones de datos
     desplegados: lo que esta en display:none no tiene geometria, asi que una sonda sobre la app
     cerrada no puede clickear ni tipear y devuelve cero, que es indistinguible de «esta bien». */
  abrirTodo() {
    try { showTab('valvulas'); } catch(e) {}
    var toks = ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'];
    toks.forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && getComputedStyle(s).display === 'none') { try { toggleEteSeccion(tok); } catch(e) {} }
    });
    var vis = function(id){ var e = document.getElementById(id);
      return !!e && getComputedStyle(e).display !== 'none' };
    var acord = {};
    toks.forEach(function(tok){ acord[tok.replace('valv-','')] = vis('ete-seccion-' + tok); });
    var ab = Object.keys(acord).filter(function(k){ return acord[k] }).length;
    /* ⚠️ Y LAS TARJETAS PLEGABLES DEL DOPPLER, porque tres campos de estas escenas viven ahi:
       diam_tsvi e itv_tsvi (insumos de la FR de la IM y del jet/TSVI de la IAo) y los dos del
       Doppler aortico. Nacen plegadas, asi que sin esto sus campos no tienen caja y el tecleo no
       es un gesto. Se fuerza el display y no se clickea el encabezado: toggleCard escribe inline
       y un clic de mas lo volveria a cerrar. */
    ['dop-aortico','dop-mitral','dop-tricusp','dop-pulmonar','cx-pisa','cx-cont'].forEach(function(cid){
      var c = document.getElementById(cid);
      if (c && getComputedStyle(c).display === 'none') c.style.display = 'block'; });
    return { tab: vis('tab-valvulas'), secciones: ab, acordeones: acord,
             dop: ['dop-aortico','dop-mitral','dop-tricusp','dop-pulmonar'].filter(vis),
             ok: vis('tab-valvulas') && ab === 4 } },

  /* ⚠️ LAS PASTILLAS SE APAGAN A MANO Y LAS CLAVES SE BORRAN. El limpiarCampos de la app borra las
     claves pero el estado VIVO de la pastilla sobrevive entre escenas de una misma pagina, asi que
     un display inline del paciente anterior se lee como un resultado de esta escena. */
  limpiar() {
    try { limpiarCampos(true); } catch(e) {}
    window.esqSevManual = {}; window._sevCalcAlFijar = {};
    window._imGradoCalc = null; window._iaGradoCalc = null; window._itGradoCalc = null;
    ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){
        try { if (window.__P.pill(v,t) === true) toggleValvPill(v,t); } catch(e){}
        try { localStorage.removeItem('valv-pill-' + t + '-' + v); } catch(e){}
      });
    });
    try { if (window.VALV_ESTEN_AUTO) window.VALV_ESTEN_AUTO.clear(); } catch(e){}
    try { if (window.VALV_INSUF_AUTO) window.VALV_INSUF_AUTO.clear(); } catch(e){}
    ['im_grado','ia_grado','it_grado','ea_grado'].forEach(function(id){
      var e = document.getElementById(id); if (e) delete e.dataset.sugerido; });
    try { if (typeof _sevManualSync === 'function') _sevManualSync(); } catch(e){}
    var pills = ['insuf-mitral','esten-mitral','insuf-aortica','esten-aortica',
                 'insuf-tricuspide','esten-tricuspide','insuf-pulmonar','esten-pulmonar'];
    var quedan = pills.filter(function(p){
      var v = p.split('-')[1], t = p.split('-')[0];
      return window.__P.pill(v,t) === true });
    return { pillsEncendidas: quedan, ok: quedan.length === 0 } },

  /* Corre los cuatro calculadores sobre lo que haya en pantalla. NO es un gesto: fija el
     denominador del «volvio al estado inicial». */
  pintarVacio() {
    var r = {};
    ['calcAo','calcIM_ESC','calcIA_ESC','calcIT_ESC','calcContIM'].forEach(function(f){
      try { if (typeof window[f] === 'function') { window[f](); r[f] = 1 } else r[f] = 'NO EXISTE' }
      catch(e) { r[f] = 'EXC: ' + e.message }
    });
    return r },

  /* NO ES UN GESTO MEDIDO: solo para los <select> de escenario. Los numericos van con teclas. */
  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value, ok: String(e.value) === String(valor) } },

  /* ══ LAS CUATRO FOTOS. Cada una lleva: el campo de GRADO que firma las cuatro superficies, el
     badge INTEGRADO del cuadro, la PASTILLA con su clave y su sub-boton, las FILAS de referencia
     de esa lesion, el grado CALCULADO (la foto de proceso) y la marca de SUGERIDO. */
  fotoIM() { return {
    grado: window.__P.val('im_grado'), sug: window.__P.sug('im_grado'),
    calc: (window._imGradoCalc === undefined ? 'UNDEF' : window._imGradoCalc),
    sev: window.__P.txt('im-sev'),
    pill: window.__P.pill('mitral','insuf'), ls: window.__P.ls('valv-pill-insuf-mitral'),
    sevbtn: window.__P.txt('sevbtn-insuf-mitral'),
    auto: (function(){ try { return !!(window.VALV_INSUF_AUTO && window.VALV_INSUF_AUTO.has('mitral')) } catch(e){ return 'EXC' } })(),
    manual: !!(window.esqSevManual && window.esqSevManual.im),
    vc: window.__P.txt('im-vc-ref'), jet: window.__P.txt('im-jet-ratio'),
    eroa: window.__P.txt('eroa-val'), volr: window.__P.txt('volr-val'),
    vsv: window.__P.txt('vsvtsvi-val'), fr: window.__P.txt('freg-val'),
    ondaS: window.__P.txt('im-onda-s-interp'), disc: window.__P.txt('im-discordancia'),
    g: { vc: window.__P.grd('im-vc-ref'), jet: window.__P.grd('im-jet-ratio'),
         eroa: window.__P.grd('eroa-val'), volr: window.__P.grd('volr-val'),
         fr: window.__P.grd('freg-val') },
    ratio: window.__P.txt('im-vti-ratio'),
    contSev: window.__P.txt('im-cont-severidad'),
    contEroa: window.__P.val('im_eroa_cont'), contVolr: window.__P.val('vr_cont'),
    contFr: window.__P.val('im_fr_cont'),
    chkPisa: window.__P.chk('im_pdf_pisa'), chkCont: window.__P.chk('im_pdf_cont'),
    bloque: window.__P.vis('bloque-insuf-mitral') } },

  fotoIA() { return {
    grado: window.__P.val('ia_grado'), sug: window.__P.sug('ia_grado'),
    calc: (window._iaGradoCalc === undefined ? 'UNDEF' : window._iaGradoCalc),
    sev: window.__P.txt('ia-sev'),
    pill: window.__P.pill('aortica','insuf'), ls: window.__P.ls('valv-pill-insuf-aortica'),
    sevbtn: window.__P.txt('sevbtn-insuf-aortica'),
    auto: (function(){ try { return !!(window.VALV_INSUF_AUTO && window.VALV_INSUF_AUTO.has('aortica')) } catch(e){ return 'EXC' } })(),
    manual: !!(window.esqSevManual && window.esqSevManual.ia),
    jet: window.__P.txt('ia-jet-ratio'), pht: window.__P.txt('ia-pht-interp'),
    vtd: window.__P.txt('ia-vtd-interp'), vtiDesc: window.__P.txt('ia-vti-desc-interp'),
    eroa: window.__P.txt('ia-eroa'), volr: window.__P.txt('ia-volr'), fr: window.__P.txt('ia-freg'),
    g: { jet: window.__P.grd('ia-jet-ratio'), eroa: window.__P.grd('ia-eroa'),
         volr: window.__P.grd('ia-volr'), fr: window.__P.grd('ia-freg') },
    disc: window.__P.txt('ia-discordancia'),
    bloque: window.__P.vis('bloque-insuf-aortica') } },

  fotoEA() { return {
    grado: window.__P.val('ea_grado'), sug: window.__P.sug('ea_grado'),
    badge: window.__P.txt('ea-ava-badge'), sev: window.__P.txt('ea-sev'),
    pill: window.__P.pill('aortica','esten'), ls: window.__P.ls('valv-pill-esten-aortica'),
    sevbtn: window.__P.txt('sevbtn-esten-aortica'),
    auto: (function(){ try { return !!(window.VALV_ESTEN_AUTO && window.VALV_ESTEN_AUTO.has('aortica')) } catch(e){ return 'EXC' } })(),
    manual: !!(window.esqSevManual && window.esqSevManual.ea),
    ava: window.__P.val('ava_cont'),
    calc: (function(){ try { return (typeof eaGradoCalculado === 'function') ? eaGradoCalculado().grado : 'SIN' } catch(e){ return 'EXC' } })(),
    bloque: window.__P.vis('bloque-esten-aortica') } },

  fotoIT() { return {
    grado: window.__P.val('it_grado'), sug: window.__P.sug('it_grado'),
    calc: (window._itGradoCalc === undefined ? 'UNDEF' : window._itGradoCalc),
    sev: window.__P.txt('it-sev'),
    pill: window.__P.pill('tricuspide','insuf'), ls: window.__P.ls('valv-pill-insuf-tricuspide'),
    sevbtn: window.__P.txt('sevbtn-insuf-tricuspide'),
    auto: (function(){ try { return !!(window.VALV_INSUF_AUTO && window.VALV_INSUF_AUTO.has('tricuspide')) } catch(e){ return 'EXC' } })(),
    manual: !!(window.esqSevManual && window.esqSevManual.it),
    vc: window.__P.txt('it-ref-vc'), eroa: window.__P.txt('it-eroa'),
    volr: window.__P.txt('it-volr'), dens: window.__P.txt('it-densidad-interp'),
    disc: window.__P.txt('it-discordancia'),
    bloque: window.__P.vis('bloque-insuf-tricuspide') } },

  /* Las OTRAS lesiones, para el control negativo: tienen que quedar identicas a HEAD. */
  fotoOtras() { return {
    em_grado: window.__P.val('em_grado'), emSev: window.__P.txt('em-sev'),
    emCat: (function(){ try { return (typeof emCategoria === 'function') ? JSON.stringify(emCategoria()) : 'SIN' } catch(e){ return 'EXC' } })(),
    et_grado: window.__P.val('et_grado'), etSev: window.__P.txt('et-sev'),
    ep_grado: window.__P.val('ep_grado'), ip_grado: window.__P.val('ip_grado'),
    diastInterp: window.__P.txt('dd-interp'),
    diastAlgo: window.__P.val('diast_algoritmo'), diastRitmo: window.__P.val('diast_ritmo'),
    pillEM: window.__P.pill('mitral','esten'), pillET: window.__P.pill('tricuspide','esten'),
    pillEP: window.__P.pill('pulmonar','esten'), pillIP: window.__P.pill('pulmonar','insuf') } },

  foto() { return { im: window.__P.fotoIM(), ia: window.__P.fotoIA(),
                    ea: window.__P.fotoEA(), it: window.__P.fotoIT() } },

  /* ⚠️ SILENCIOSO Y NO PELADO. generarInforme() pelado SALTA a la pestania Informe, y de ahi la
     primera version de esta sonda midio un borrado QUE NO OCURRIO: al volver, showTab de valvulas
     corre valvCerrarTarjetas, los campos de la valvula quedan sin geometria, focus() sobre un nodo
     oculto no hace nada y los doce Backspace se los come el documento. El campo seguia con su
     valor y la sonda informaba «el grado no vuelve». */
  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme({ silencioso: true }) } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  /* Las frases de UNA valvula. Se parte por oracion y se filtra por su familia de palabras: el
     nombre largo y las siglas del EN SUMA. La tilde va en la clase de caracteres porque el informe
     escribe «tricuspidea» CON acento. */
  frases(texto, cual) {
    var RE = { mitral: /mitral|\\bIM\\b|\\bEM\\b|\\bVM\\b/i,
               aortica: /a[\\u00f3o]rtic|\\bIAo\\b|\\bEAo\\b|\\bVA\\b/i,
               tricuspide: /tric[\\u00fau]sp|\\bIT\\b|\\bET\\b|\\bVT\\b|VD-AD/i };
    var re = RE[cual]; if (!re) return ['SIN RE ' + cual];
    var ors = String(texto || '').split(/(?<=\\.)\\s+/);
    return ors.map(function(s){ return s.trim() }).filter(function(s){ return s && re.test(s) }) },

  /* Las filas de EROA / Vol-R / FR que publica la tabla del PDF, por sus duenios REALES. Si el
     emisor de la FR no existe el valor viene como 'NO EXISTE', que es como el A/B muestra que
     aparecio y no un null silencioso. */
  pdfIM() {
    var f = function(n){ try { return (typeof window[n] === 'function') ? window[n]() : 'NO EXISTE' }
                         catch(e) { return 'EXC: ' + e.message } };
    return { eroa: f('imEroaPdfVal'), volr: f('imVolrPdfVal'), fr: f('imFrPdfVal') } },

  /* ⚠️ EL PDF, GENERADO DE VERDAD, interceptando el CONSTRUCTOR de jsPDF —no el prototipo: en
     jsPDF 2.x los metodos del nucleo son propiedades PROPIAS de cada documento—. No descarga nada.
     Se devuelven las llamadas a text() con su pagina y su posicion, que es LO QUE LLEGA AL
     PAPEL: medir el valor que devuelve imFrPdfVal() dice que el emisor existe, no que la fila se
     imprima. Calcado de scripts/_probe_pdfvcit.mjs. */
  pdfReal() {
    if (typeof window.jspdf === 'undefined') return 'SIN jsPDF';
    var orig = window.jspdf.jsPDF;
    var textos = [], bytes = null, err = null;
    function Envuelto(){
      var d = new orig(arguments[0]);
      var oText = d.text;
      d.text = function(t, x, y){
        var str = (typeof t === 'string') ? t : (Array.isArray(t) ? t.join('\u0001') : String(t));
        var pg = 0;
        try { pg = d.internal.getCurrentPageInfo().pageNumber } catch(e) {}
        textos.push(pg + '|' + (+x).toFixed(1) + '|' + (+y).toFixed(1) + '|' + str);
        return oText.apply(d, arguments) };
      d.save = function(){ try { bytes = d.output('datauristring') } catch(e) {} return d };
      return d; }
    Envuelto.API = orig.API; Envuelto.version = orig.version;
    window.jspdf.jsPDF = Envuelto;
    try { generarPDFReal() } catch(e) { err = String(e && e.message || e) }
    finally { window.jspdf.jsPDF = orig }
    /* Las filas de la tabla compacta que interesan: cualquier texto que lleve un rotulo de las
       tres o un valor prefijado por su metodo. El filtro es ancho a proposito —se imprime lo que
       encuentre— porque la forma exacta con que drawTablaCompacta compone la celda no se adivina:
       se mira en la salida. */
    var filas = textos.filter(function(t){
      return /EROA|Vol\\.R|\\bFR\\b|PISA:|Cont:/.test(t); });
    return { err: err, guardo: !!bytes, nTextos: textos.length, filas: filas } },

  /* ⚠️ LA VENTANA DE REIMPRESION, DE VERDAD. La fase de CARGA corre calcIM_ESC, calcIA_ESC y
     calcIT_ESC con los datos del estudio REIMPRESO, asi que desde que esos tres prenden pastilla
     hay que medir si la del paciente EN PANTALLA queda contaminada. Es exactamente el defecto que
     la decision de Maicol del 2026-10-08 cerro para la IP, y se cerro llamando a calcIP tambien en
     el CIERRE. Devuelve el estado del paciente en pantalla ANTES y DESPUES de la ventana. */
  async reimp(campos) {
    var F = function(){ return {
      pillIM: window.__P.pill('mitral','insuf'), pillIA: window.__P.pill('aortica','insuf'),
      pillIT: window.__P.pill('tricuspide','insuf'), pillEA: window.__P.pill('aortica','esten'),
      im: window.__P.val('im_grado'), ia: window.__P.val('ia_grado'),
      it: window.__P.val('it_grado'), ea: window.__P.val('ea_grado'),
      suma: (document.getElementById('en_suma')||{}).value || '' } };
    window.__P.limpiar();
    Object.keys(campos).forEach(function(k){ window.__P.set(k, campos[k]) });
    window._ettEditandoId = null;
    var antes = new Set(getInformes().map(function(i){ return i.estudioId }));
    var g = await new Promise(function(res){
      try { guardarInforme(function(ok){
        var n = getInformes().find(function(i){ return !antes.has(i.estudioId) });
        res({ ok: ok === true, id: n ? n.estudioId : null }) }) }
      catch(e) { res({ ok:false, err:String(e) }); return }
      var cf = document.getElementById('rev-confirm'); if (cf) cf.click();
    });
    if (!g.id) return { err: 'no se guardo', g: g };
    window.__P.limpiar();
    var pre = F();
    await new Promise(function(res){
      try { pdfDeInformeGuardado(g.id, function(){ setTimeout(res, 1200) }, 'PPT') }
      catch(e) { setTimeout(res, 100) }
    });
    await new Promise(function(res){ setTimeout(res, 1500) });
    var post = F();
    try { CeiboStore.setLocal(getInformes().filter(function(i){ return i.estudioId !== g.id })) } catch(e) {}
    return { id: g.id, pre: pre, post: post,
             igual: JSON.stringify(pre) === JSON.stringify(post) } },

  campos() {
    var c = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      c[el.id] = el.value; });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      c[el.id + '__chk'] = el.checked ? '1' : '0'; });
    return c },

  excel() {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    var campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return; } catch(e){}
      campos[el.id] = el.value; });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      campos[el.id + '__chk'] = el.checked ? '1' : '0'; });
    try { var r = _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-13', campos: campos });
          return { n: Object.keys(r).length, hash: JSON.stringify(r).length }; }
    catch(e) { return 'EXC: ' + e.message; } },

  /* ══ EL CUADRO DE REFERENCIAS DE LA ESTENOSIS TRICUSPIDEA, fila por fila, con el grado, la
     pastilla y el area derivada. El ROTULO de la fila del VTI lleva el OPERADOR impreso, asi que
     esta foto caza el caso en que la comparacion y el simbolo se desincronizan. */
  etFoto() { return {
    gmedio: window.__P.txt('et-ref-gmedio'), thp: window.__P.txt('et-ref-thp'),
    vti: window.__P.txt('et-ref-vti'), avt: window.__P.txt('et-ref-avt'),
    fuente: window.__P.txt('et-ref-fuente'),
    sev: window.__P.txt('et-sev'), grado: window.__P.val('et_grado'),
    sug: window.__P.sug('et_grado'), avtCampo: window.__P.val('et_avt'),
    pill: window.__P.pill('tricuspide','esten'), ls: window.__P.ls('valv-pill-esten-tricuspide'),
    sevbtn: window.__P.txt('sevbtn-esten-tricuspide'),
    est: (function(){ try { return etEstado() } catch(e) { return { err: e.message } } })(),
    op: (function(){ try { return ((window.ET_CRIT||{}).vtiEnt||{}).op } catch(e) { return 'EXC' } })() } },

  /* ══ LAS TRES PIEZAS DE PROCESO QUE NO SON DOM Y QUE NINGUN BARRIDO ALCANZA. Son el objeto del
     punto (3): sobreviviendo a «Nuevo estudio», el aviso rojo del paciente B nombra el calculo
     automatico del paciente A. Los valores UNDEF y null se distinguen a proposito. */
  procesos() { return {
    imCalc: (window._imGradoCalc === undefined ? 'UNDEF' : window._imGradoCalc),
    itCalc: (window._itGradoCalc === undefined ? 'UNDEF' : window._itGradoCalc),
    iaCalc: (window._iaGradoCalc === undefined ? 'UNDEF' : window._iaGradoCalc),
    contSevTxt: window.__P.txt('im-cont-severidad'),
    contSevGV: (function(){ var e = document.getElementById('im-cont-severidad');
      return e ? (e.dataset.gradoVolum || null) : 'NO EXISTE' })(),
    discTxt: window.__P.txt('im-discordancia'),
    manual: (function(){ try { return Object.keys(window.esqSevManual || {}) } catch(e){ return 'EXC' } })(),
    fotoFijar: (function(){ try { return Object.keys(window._sevCalcAlFijar || {}) } catch(e){ return 'EXC' } })(),
    calcPub: (function(){ var o = {};
      ['im','it','ia'].forEach(function(k){
        try { o[k] = (typeof sevCalcPublicable === 'function') ? sevCalcPublicable(k) : 'SIN FN' }
        catch(e) { o[k] = 'EXC' } });
      return o })() } },

  /* El panel «Incluir en el informe» tal como lo ve el medico: las dos casillas con su estado,
     sus banderas de decision y los dos span de valor. */
  imPanel() {
    var f = function(id){ var e = document.getElementById(id);
      if (!e) return { err: 'NO EXISTE ' + id };
      return { chk: !!e.checked, dis: !!e.disabled,
               toc: e.dataset.tocado || null, des: e.dataset.desdeEstudio || null } };
    return { pisa: f('im_pdf_pisa'), cont: f('im_pdf_cont'),
             spPisa: window.__P.txt('im-pdf-pisa-val'), spCont: window.__P.txt('im-pdf-cont-val'),
             aviso: window.__P.txt('im-pdf-metodo-aviso') } },

  /* Las TRES afirmaciones viejas de la ayuda «Referencia clinica» de la estenosis mitral, por su
     literal. Se busca en textContent y no en innerHTML: el texto renderizado ya decodifico las
     entidades, asi que el literal que se busca es el que el medico lee. */
  ayudaEM() {
    var t = document.body.textContent || '';
    var tiene = function(f){ return t.indexOf(f) >= 0 };
    return {
      A_grad4: tiene('gradiente medio > 4 mmHg'),
      B_probable: tiene('probablemente severa por'),
      C_noCriterio: tiene('no se usa como criterio de severidad'),
      /* Lo que la regla vigente SI dice, para que el A/B tenga los dos lados. */
      D_banda510: tiene('5 a menos de 10 mmHg'),
      E_signif10: tiene('10 mmHg'),
      F_nomenclatura: tiene('no significativa'),
      /* El renglon del aviso de la ET, que nombra el operador del VTI. */
      etAviso60: { mayor: tiene('VTI de entrada > 60 cm'),
                   mayorIgual: tiene('VTI de entrada ≥ 60 cm') },
      largo: t.length } },

  /* Devuelve el id de un boton cuyo onclick contiene el fragmento, poniendoselo si no lo tiene.
     Es lo que permite CLICKEAR de verdad el boton del modal de «Nuevo estudio», que no tiene id. */
  idDeBoton(frag) {
    var b = Array.prototype.find.call(document.querySelectorAll('button[onclick]'), function(x){
      return (x.getAttribute('onclick') || '').indexOf(frag) >= 0 });
    if (!b) return { err: 'no hay boton con ' + frag };
    if (!b.id) b.id = '__btn_' + String(frag).replace(/[^a-zA-Z]/g, '');
    return { id: b.id, txt: (b.textContent || '').trim() } },

  /* ══ GUARDAR Y REABRIR, por las rutas REALES de la app. Es el denominador de «un estudio
     guardado se abre como se guardo»: lo que se compara es el blob persistido y lo que el
     formulario muestra al volver. El estudio se borra del store al final. */
  async guardarYReabrir(leer) {
    window._ettEditandoId = null;
    var antes = new Set(getInformes().map(function(i){ return i.estudioId }));
    var g = await new Promise(function(res){
      try { guardarInforme(function(ok){
        var n = getInformes().find(function(i){ return !antes.has(i.estudioId) });
        res({ ok: ok === true, id: n ? n.estudioId : null }) }) }
      catch(e) { res({ ok:false, err:String(e) }); return }
      var cf = document.getElementById('rev-confirm'); if (cf) cf.click();
    });
    if (!g.id) return { err: 'no se guardo', g: g };
    var inf = getInformes().find(function(i){ return i.estudioId === g.id });
    var guardado = { pisaChk: inf ? inf.campos['im_pdf_pisa__chk'] : '(no guardo)',
                     contChk: inf ? inf.campos['im_pdf_cont__chk'] : '(no guardo)',
                     imGrado: inf ? inf.campos['im_grado'] : '(no guardo)',
                     etGrado: inf ? inf.campos['et_grado'] : '(no guardo)',
                     etVti:   inf ? inf.campos['et_vti_diast'] : '(no guardo)' };
    try { limpiarCampos(true) } catch(e) {}
    try { cargarEstudioPorId(g.id) } catch(e) { return { err: 'no reabrio: ' + e.message, id: g.id } };
    await new Promise(function(r){ setTimeout(r, 700) });
    var reabierto = { panel: window.__P.imPanel(), im: window.__P.fotoIM(), et: window.__P.etFoto() };
    try { CeiboStore.setLocal(getInformes().filter(function(i){ return i.estudioId !== g.id })) } catch(e) {}
    return { id: g.id, guardado: guardado, reabierto: reabierto, leer: leer || null } },

  modalNuevo() { var m = document.getElementById('modal-nuevo-estudio');
    return m ? getComputedStyle(m).display : 'NO EXISTE' },

  /* Los controles que esta tanda NO puede mover, con el token del Laboratorio al lado. */
  ajenos() { return {
    diast: window.__P.txt('dd-interp'),
    hfapeff: window.__P.txt('hfapeff-eco'),
    eaSev: window.__P.txt('ea-sev'), eaGrado: window.__P.val('ea_grado'),
    iaSev: window.__P.txt('ia-sev'), iaGrado: window.__P.val('ia_grado'),
    itSev: window.__P.txt('it-sev'), itGrado: window.__P.val('it_grado'),
    emBadge: window.__P.txt('em-sev-integrada'), emGrado: window.__P.val('em_grado'),
    vpBadge: window.__P.txt('vp-sev-badge'), epGrado: window.__P.val('ep_grado'),
    ipPht: window.__P.txt('ip-ref-pht'), ipGrado: window.__P.val('ip_grado'),
    labEM: (function(){ try { return (typeof _labEstenSev === 'function')
      ? _labEstenSev({ campos: { em_grado: (document.getElementById('em_grado')||{}).value } }, 'em_grado')
      : 'SIN FN' } catch(e) { return 'EXC' } })(),
    labEA: (function(){ try { return (typeof _labEstenSev === 'function')
      ? _labEstenSev({ campos: { ea_grado: (document.getElementById('ea_grado')||{}).value } }, 'ea_grado')
      : 'SIN FN' } catch(e) { return 'EXC' } })() } },

  /* El aviso legal vuelve a mitad de corrida y tapa la pagina entera con z-index 9999: con el
     puesto, elementFromPoint devuelve ESE nodo y todos los clics caen en el overlay. */
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

/* ══ LAS ESCENAS ══════════════════════════════════════════════════════════════════════════════
   Cada entrada es UN campo votante con UN valor por grado y sus prerrequisitos. Los valores
   estan elegidos para que el campo cruce su propio corte, y los prerrequisitos para que la fila
   que lo consume LLEGUE a calcularse: una escena que no alcanza la compuerta devuelve «el corte
   no funciona» sobre un corte que funciona. */
const ESC = {
  im: [
    { id:'im_vc',        fila:'vc',   pre:{}, val:{ leve:'2', moderada:'4', severa:'7' } },
    { id:'im_jet_area',  fila:'jet',  pre:{ im_ai_area:'20' }, val:{ leve:'3', moderada:'6', severa:'12' } },
    { id:'pisa_r',       fila:'eroa', pre:{ pisa_val:'40', im_vmax:'5' }, val:{ leve:'6', moderada:'7', severa:'10' } },
    { id:'pisa_val',     fila:'eroa', pre:{ pisa_r:'10', im_vmax:'5' },   val:{ leve:'14', moderada:'20', severa:'40' } },
    { id:'im_vmax',      fila:'eroa', pre:{ pisa_r:'10', pisa_val:'40' }, val:{ severa:'5' } },
    { id:'im_itv',       fila:'volr', pre:{ pisa_r:'10', pisa_val:'40', im_vmax:'5' }, val:{ leve:'40', moderada:'80', severa:'140' } },
    /* ⚠️ `diam_tsvi` e `itv_tsvi` Y NO `im_dtsvi`/`im_itv_tsvi`. Los dos del bloque de la mitral
       estan en `display:none` desde el 2026-10-10 —son puertas del mismo dato, no campos— asi que
       un tecleo ahi no es un gesto del medico y la sonda ABORTA. Y `diam_tsvi` del Doppler TAMBIEN
       esta oculto —su `.fg` lleva `display:none`—: la puerta VISIBLE del diametro del TSVI es
       `ea_dtsvi`, en la Estenosis aortica, que es por donde el medico lo carga. El VTI del TSVI si
       se tipea en el Doppler, dentro de la tarjeta plegable `dop-aortico`. */
    { id:'itv_tsvi',     fila:'fr',   pre:{ pisa_r:'10', pisa_val:'40', im_vmax:'5', im_itv:'80', ea_dtsvi:'20' }, val:{ moderada:'20' } },
    { id:'ea_dtsvi',     fila:'fr',   pre:{ pisa_r:'10', pisa_val:'40', im_vmax:'5', im_itv:'80', itv_tsvi:'20' }, val:{ moderada:'20' } }
  ],
  ia: [
    { id:'ia_vc',        fila:'—',       pre:{}, val:{ leve:'2', moderada:'5', severa:'8' } },
    { id:'ia_jet_diam',  fila:'jet',     pre:{ ea_dtsvi:'20' }, val:{ leve:'4', moderada:'10', severa:'15' } },
    { id:'ia_pht',       fila:'pht',     pre:{}, val:{ leve:'550', moderada:'300', severa:'150' } },
    { id:'ia_vmax_td',   fila:'vtd',     pre:{}, val:{ severa:'25' } },
    { id:'ia_vti_desc',  fila:'vtiDesc', pre:{}, val:{ leve:'10', moderada:'20', severa:'30' } },
    { id:'ia_pisa_r',    fila:'eroa',    pre:{ ia_pisa_val:'40', ia_vmax_cw:'5' }, val:{ leve:'4', moderada:'6', severa:'9' } },
    { id:'ia_vti',       fila:'volr',    pre:{ ia_pisa_r:'9', ia_pisa_val:'40', ia_vmax_cw:'5', ea_dtsvi:'20', itv_tsvi:'20' }, val:{ leve:'60', moderada:'140', severa:'200' } }
  ],
  ea: [
    { id:'vmax_ao',      fila:'—', pre:{}, val:{ leve:'2', moderada:'3', severa:'4' } },
    { id:'gmedio_ao',    fila:'—', pre:{}, val:{ severa:'45' } }
  ],
  it: [
    { id:'it_vc',        fila:'vc',   pre:{}, val:{ leve:'2', moderada:'5', severa:'8' } },
    { id:'it_pisa_r',    fila:'eroa', pre:{ it_pisa_val:'40', it_vmax_cw:'5' }, val:{ leve:'6', moderada:'7', severa:'10' } },
    { id:'it_vti',       fila:'volr', pre:{ it_pisa_r:'10', it_pisa_val:'40', it_vmax_cw:'5' }, val:{ leve:'40', moderada:'80', severa:'140' } }
  ]
};
/* Los <select> van aparte: se fijan con `set` (no es un tecleo) y se «borran» volviendo al
   centinela, que es el gesto del medico —devolver el desplegable a «—»—. */
const ESC_SEL = {
  im: [{ id:'im_onda_s', val:{ leve:'positiva', moderada:'embotada', severa:'invertida' } }],
  it: [{ id:'it_densidad', val:{ leve:'debil', moderada:'moderado', severa:'denso' } }]
};
const LES = ['im','ia','ea','it'];
const GRUPOS = ['vti','area','pisa','nuevo','ayuda','controles'];

async function main() {
  const md5Ini = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  const { srv, port } = await servir();
  const { wsUrl } = await abrirChrome(`http://127.0.0.1:${port}/${FILE}`);
  const cdp = await conectar(wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const page = targetInfos.find((t) => t.type === 'page');
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: page.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);
  const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
  /* ⚠️ RELOJ SOBRE ev(): un despacho que NO RESUELVE deja el fallo apareciendo en la llamada
     SIGUIENTE, o sea en la linea equivocada. Con el reloj el error nombra su propia expresion. */
  async function ev(expr, ms) {
    const r = await Promise.race([
      cdp.send('Runtime.evaluate', { expression: `(function(){ ${expr.indexOf('return') === 0 ? expr : 'return (' + expr + ')'} })()`,
                                     returnByValue: true, awaitPromise: true }, sessionId),
      pausa(ms || 15000).then(() => ({ __reloj: true }))
    ]);
    if (r.__reloj) throw new Error('ev() no resolvio en ' + (ms || 15000) + ' ms: ' + expr.slice(0, 90));
    if (r.exceptionDetails) throw new Error('EXC en ev(): ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text) + ' | ' + expr.slice(0, 90));
    return r.result.value;
  }
  async function evCrudo(expr) {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error('EXC en evCrudo(): ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
    return r.result.value;
  }
  const VK = { Backspace: 8, Delete: 46, Tab: 9, Enter: 13, End: 35, Home: 36, Space: 32 };
  /* ⚠️ LAS TECLAS DE EDICION (Backspace, Tab, Escape) VAN POR KEYCODE Y CON rawKeyDown; Enter y
     Espacio al reves, con type keyDown y su `text`, porque Blink activa un <button> desde el
     KEYPRESS y un rawKeyDown pelado no lo genera. Las dos cosas son ciertas a la vez. */
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
    let rev = await ev(`window.__P.revelar(${JSON.stringify(id)})`);
    for (let i = 0; i < 4 && rev && rev.necesitaClic; i++) {
      await clicEn(rev.necesitaClic);
      rev = await ev(`window.__P.revelar(${JSON.stringify(id)})`);
    }
    const c = await ev(`window.__P.centro(${JSON.stringify(id)})`);
    if (!c || c.err) return { via: 'NO SE PUDO', por: c ? c.err : 'no existe' };
    const quien = await ev(`window.__P.quienEsta(${JSON.stringify(id)}, ${c.x}, ${c.y})`);
    if (quien.esElBlanco) {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await pausa(130);
      return { via: 'mouse', quien };
    }
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)}); if(e) e.focus(); return 1 })()`);
    await tecla('Enter', null);
    await pausa(130);
    return { via: 'tecla Enter', quien };
  }
  /* ⚠️ TIPEAR EN UN CAMPO QUE NO EXISTE NO ES UNA MEDICION, Y UNA SONDA DE ESTE REPO YA LO HIZO:
     el foco quedaba en el campo anterior y los caracteres se le concatenaban (un E/e-prima de
     1848,5 informado como diferencia del commit). Aca se ABORTA. */
  async function tipear(id, valor) {
    const hay = await ev(`window.__P.existe(${JSON.stringify(id)})`);
    if (!hay) throw new Error('ABORTA: el campo ' + id + ' no existe en este arbol');
    let via = await clicEn(id);
    /* Si el nodo no tiene caja, se reabre la pestania y sus acordeones UNA vez y se reintenta. */
    let geo = await ev(`window.__P.geo(${JSON.stringify(id)})`);
    if (!geo.ok) { await ev(`window.__P.abrirTodo()`); via = await clicEn(id);
                   geo = await ev(`window.__P.geo(${JSON.stringify(id)})`); }
    if (!geo.ok) throw new Error('ABORTA: ' + id + ' sin geometria (' + JSON.stringify(geo) + ')');
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(!e) return 0; e.focus(); try{ e.select() }catch(x){} return 1 })()`);
    for (const ch of String(valor)) await tecla(ch, ch);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
    await pausa(60);
    const quedo = await ev(`window.__P.val(${JSON.stringify(id)})`);
    if (String(quedo) !== String(valor))
      throw new Error('ABORTA: el tecleo de ' + id + ' no quedo: pedido ' + valor + ', quedo ' + quedo +
                      ' (' + JSON.stringify(geo) + ', clic ' + via.via + ')');
    return { via: via.via, pedido: String(valor), quedo: String(quedo), ok: true };
  }
  /* ⚠️ UN CLIC SOBRE UN NODO SIN GEOMETRIA NO ES UN GESTO, Y LA PRIMERA CORRIDA DE ESTA SONDA
     INFORMO «ambos metodos marcados» CON LA CASILLA EN false. `showTab('valvulas')` corre
     `valvCerrarTarjetas`, asi que al volver de otra pestania la casilla de continuidad —y las ocho
     pastillas— quedan sin caja y el clic cae en el vacio. Se reabre, se clickea y se EXIGE el
     estado pedido; si no queda, se aborta nombrando el control. */
  async function tildar(id, deseado) {
    await ev(`window.__P.abrirTodo()`);
    let geo = await ev(`window.__P.geo(${JSON.stringify(id)})`);
    if (!geo.ok) throw new Error('ABORTA: ' + id + ' sin geometria para clickear (' + JSON.stringify(geo) + ')');
    const antes = await ev(`window.__P.chk(${JSON.stringify(id)})`);
    if (antes === deseado) return { id, yaEstaba: true, chk: antes };
    const via = await clicEn(id);
    const chk = await ev(`window.__P.chk(${JSON.stringify(id)})`);
    if (chk !== deseado)
      throw new Error('ABORTA: el clic en ' + id + ' no dejo chk=' + deseado + ' (quedo ' + chk +
                      ', via ' + via.via + ', ' + JSON.stringify(geo) + ')');
    return { id, via: via.via, chk };
  }
  /* El mismo cuidado para una PASTILLA: se exige el estado que la escena pide. */
  async function prender(valv, tipo, deseado) {
    await ev(`window.__P.abrirTodo()`);
    const id = 'pill-' + tipo + '-' + valv;
    let geo = await ev(`window.__P.geo(${JSON.stringify(id)})`);
    if (!geo.ok) throw new Error('ABORTA: ' + id + ' sin geometria (' + JSON.stringify(geo) + ')');
    const antes = await ev(`window.__P.pill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)})`);
    if (antes === deseado) return { id, yaEstaba: true, pill: antes };
    const via = await clicEn(id);
    const pill = await ev(`window.__P.pill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)})`);
    if (pill !== deseado)
      throw new Error('ABORTA: el clic en ' + id + ' no dejo la pastilla en ' + deseado +
                      ' (quedo ' + pill + ', via ' + via.via + ')');
    return { id, via: via.via, pill };
  }
  /* NUNCA Backspace sobre un campo de SOLO LECTURA: se comprueba antes y se declara. */
  async function borrar(id) {
    const soloLectura = await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      return e ? (!!e.readOnly || !!e.disabled) : 'NO EXISTE' })()`);
    if (soloLectura !== false) return { id, via: 'NO SE BORRA', por: String(soloLectura) };
    let via = await clicEn(id);
    let geo = await ev(`window.__P.geo(${JSON.stringify(id)})`);
    if (!geo.ok) { await ev(`window.__P.abrirTodo()`); via = await clicEn(id);
                   geo = await ev(`window.__P.geo(${JSON.stringify(id)})`); }
    if (!geo.ok) throw new Error('ABORTA: no se puede borrar ' + id + ' sin geometria (' + JSON.stringify(geo) + ')');
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(!e) return 0; e.focus(); try{ e.select() }catch(x){} return 1 })()`);
    const foco = await ev(`(function(){ return document.activeElement ? (document.activeElement.id || '') : '' })()`);
    if (String(foco) !== String(id))
      throw new Error('ABORTA: el foco no llego a ' + id + ' (esta en ' + JSON.stringify(foco) + ')');
    for (let i = 0; i < 12; i++) await tecla('Backspace', null);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
    await pausa(60);
    const quedo = await ev(`window.__P.val(${JSON.stringify(id)})`);
    if (String(quedo) !== '')
      throw new Error('ABORTA: el borrado de ' + id + ' no quedo: sigue en ' + JSON.stringify(quedo) +
                      ' (' + JSON.stringify(geo) + ', clic ' + via.via + ')');
    return { id, via: 'Backspace x12', quedo: String(quedo), geo, clic: via.via };
  }


  await evCrudo(`try{sessionStorage.setItem('ett_auth','1')}catch(e){}; location.reload(); 1`);
  await pausa(2600);
  await evCrudo(SONDA);

  /* El aviso legal se despeja DENTRO del medidor y no una vez al arranque: vuelve a mitad de
     corrida y con el puesto todos los clics caen en el overlay. Su estado va al lado del
     veredicto, que es el denominador de las mediciones de clic. */
  const avisoIni = await ev(`window.__P.despejar()`);
  const denom = await ev(`window.__P.abrirTodo()`);

  const out = { file: FARG, md5Ini, avisoIni, denominador: denom, grupos: {} };
  const SOLO = (arg('--solo') || '').split(',').map(s => s.trim()).filter(Boolean);
  const corre = (g) => !SOLO.length || SOLO.indexOf(g) >= 0;

  /* ⚠️ SE DESPEJA Y SE LIMPIA ANTES DE CADA ESCENA, y se COMPRUEBA que la limpieza dejo las ocho
     pastillas apagadas: el estado vivo de una pastilla sobrevive al limpiarCampos de la app, asi
     que sin esto una escena mide el display inline del paciente anterior. */
  /* ⚠️ EL ESTADO INICIAL SE MIDE CON LOS CUATRO CALCULADORES YA CORRIDOS SOBRE EL FORMULARIO
     VACIO, y no recien salido de `limpiarCampos`. Sin eso, `ea-sev` arrancaba en el «—» con que
     nace el marcado y terminaba en el «— — sin Vmax ni gradiente medio cargados» que escribe su
     pintor, asi que las cuatro escenas de la EAo salian «no volvio» con el grado, la pastilla y el
     informe perfectos: la sonda comparaba un nodo SIN PINTAR contra el mismo nodo pintado.
     Correr los calculadores no es un gesto medido —los gestos van con teclas— es fijar el
     denominador: la pregunta es si la app termina donde terminaria con el formulario vacio. */
  async function escenaCero() {
    await ev(`window.__P.despejar()`);
    const l = await ev(`window.__P.limpiar()`);
    await ev(`window.__P.abrirTodo()`);
    await ev(`window.__P.pintarVacio()`);
    return l;
  }
  async function pre(mapa) {
    const r = {};
    for (const id of Object.keys(mapa || {})) r[id] = await tipear(id, mapa[id]);
    const malos = Object.keys(r).filter(k => !r[k].ok);
    return { r, ok: malos.length === 0, malos };
  }
  const fotoDe = async (les) => ev(`window.__P.foto${les.toUpperCase()}()`);


  /* ⚠️ CLIC SOBRE UNA CASILLA SIN EXIGIR EL RESULTADO. `tildar` aborta cuando el estado no queda
     en lo pedido, y eso es justo lo que la regla «la ultima no se destilda» tiene que producir:
     aca el clic es el GESTO y el estado que queda es la MEDICION. */
  async function clicChk(id) {
    await ev(`window.__P.abrirTodo()`);
    const geo = await ev(`window.__P.geo(${JSON.stringify(id)})`);
    if (!geo.ok) throw new Error('ABORTA: ' + id + ' sin geometria para clickear (' + JSON.stringify(geo) + ')');
    const antes = await ev(`window.__P.chk(${JSON.stringify(id)})`);
    const via = await clicEn(id);
    if (via.via === 'NO SE PUDO') throw new Error('ABORTA: no se pudo clickear ' + id + ': ' + via.por);
    await pausa(150);
    const despues = await ev(`window.__P.chk(${JSON.stringify(id)})`);
    return { id, antes, despues, via: via.via, cambio: antes !== despues };
  }

  /* ⚠️ «NUEVO ESTUDIO» CON CLICS REALES, por los DOS botones: el de la barra y el del modal. El
     modal solo se abre si hay algo que perder, asi que su ausencia se informa en vez de asumirse.
     Se usa el camino del medico y no `limpiarCampos` a mano: lo que se mide es lo que queda vivo
     DESPUES del gesto, y `limpiarCampos` no es el unico paso de ese gesto. */
  async function nuevoEstudioReal() {
    await ev(`window.__P.despejar()`);
    const b = await ev(`window.__P.idDeBoton('nuevoEstudio()')`);
    if (b.err) throw new Error('ABORTA: ' + b.err);
    const c1 = await clicEn(b.id);
    await pausa(350);
    const modal = await ev(`window.__P.modalNuevo()`);
    let c2 = null;
    if (modal !== 'none' && modal !== 'NO EXISTE') {
      const b2 = await ev(`window.__P.idDeBoton('neContinuarSinGuardar()')`);
      if (b2.err) throw new Error('ABORTA: ' + b2.err);
      c2 = await clicEn(b2.id);
      await pausa(500);
    }
    const modalFin = await ev(`window.__P.modalNuevo()`);
    if (modalFin !== 'none' && modalFin !== 'NO EXISTE')
      throw new Error('ABORTA: el modal de Nuevo estudio quedo abierto (' + modalFin + ')');
    await ev(`window.__P.despejar()`);
    await ev(`window.__P.abrirTodo()`);
    return { boton: b, clic1: c1.via, modalTrasClic: modal, clic2: c2 ? c2.via : null, modalFin };
  }

  /* ══ GRUPO vti — EL BORDE DEL VTI DE ENTRADA TRICUSPIDEO ═════════════════════════════════════
     Seis valores por el campo SOLO, sin ningun otro criterio cargado, para que lo que decida sea
     ese corte y nada mas. 99 y 101 fijan la banda, que no se toca. Y el ROTULO se lee al lado del
     veredicto: el simbolo impreso y la comparacion tienen que moverse juntos. */
  if (corre('vti')) {
    const g = { solo: {}, controles: {} };
    for (const val of ['45','59.9','60','60.1','99','101']) {
      await escenaCero();
      const t = await tipear('et_vti_diast', val);
      const f = await ev(`window.__P.etFoto()`);
      const i = await ev(`window.__P.informe('estandar')`);
      const fr = await ev(`window.__P.frases(${JSON.stringify('')}, "tricuspide")`);
      g.solo[val] = { tecleo: t, foto: f,
        frases: await ev(`window.__P.frases(${JSON.stringify(i.inf)}, "tricuspide")`),
        suma: i.suma, _fr: fr.length };
    }
    /* CONTROL NEGATIVO 1: con el gradiente ya significativo, el VTI no puede cambiar el veredicto
       —el criterio es un OR— asi que 30 y 60 tienen que dar lo mismo. */
    g.controles.gradienteManda = {};
    for (const val of ['30','60']) {
      await escenaCero();
      await tipear('et_gmedio', '8');
      await tipear('et_vti_diast', val);
      g.controles.gradienteManda[val] = await ev(`window.__P.etFoto()`);
    }
    /* CONTROL NEGATIVO 2: el BORRADO devuelve el cuadro, el grado y la pastilla al estado cero. */
    await escenaCero();
    const cero = await ev(`window.__P.etFoto()`);
    await tipear('et_vti_diast', '75');
    const con = await ev(`window.__P.etFoto()`);
    const bo = await borrar('et_vti_diast');
    const tras = await ev(`window.__P.etFoto()`);
    g.controles.borrado = { cero, con, borrado: bo, tras,
      volvio: JSON.stringify(cero) === JSON.stringify(tras) };
    out.grupos.vti = g;
  }

  /* ══ GRUPO area — EL AREA POR CONTINUIDAD NO SE PUEDE MOVER ══════════════════════════════════
     El campo del VTI es el DENOMINADOR de la ecuacion de continuidad. Tres juegos de insumos, con
     el area leida del campo Y de `etEstado()`, que es de donde sale el cuarto criterio. */
  if (corre('area')) {
    const g = [];
    for (const c of [{ n:'25/14/70', d:'25', v:'14', vti:'70' },
                     { n:'25/12/60', d:'25', v:'12', vti:'60' },
                     { n:'25/18/15', d:'25', v:'18', vti:'15' },
                     { n:'25/14/59.9', d:'25', v:'14', vti:'59.9' }]) {
      await escenaCero();
      await tipear('tsvd_diametro', c.d);
      await tipear('vti_tsvd', c.v);
      await tipear('et_vti_diast', c.vti);
      const f = await ev(`window.__P.etFoto()`);
      g.push({ escena: c.n, avtCampo: f.avtCampo, avtEstado: f.est.avt,
               filaAvt: f.avt, filaVti: f.vti, grado: f.grado, sev: f.sev, pill: f.pill,
               cAvt: f.est.cAvt, cVti: f.est.cVti, signif: f.est.signif });
    }
    out.grupos.area = g;
  }

  /* ══ GRUPO pisa — LAS TRES COMBINACIONES Y LA ULTIMA QUE NO SE DESTILDA ══════════════════════
     PISA se calibra para dar SEVERA (EROA 50,3 mm²) y la continuidad para dar LEVE, asi que los
     dos metodos dan grados DISTINTOS y la regla se puede ver. Es la misma pareja que el grupo
     `metodo` de `_probe_valvborra.mjs`, a proposito: lo que cambia es que ahora PISA se destilda.
     ⚠️ Cada escena declara el estado de las DOS casillas y el valor de las SEIS filas al lado del
     veredicto: sin eso, un grado que no cambia se lee como una regla que no funciona cuando lo
     que paso es que el metodo no llego a tener numero. */
  if (corre('pisa')) {
    const PISA = { pisa_r:'10', pisa_val:'40', im_vmax:'5', im_itv:'40' };
    const CONT = { diam_mit:'30', vtim:'12', ea_dtsvi:'20', itv_tsvi:'22' };
    const AMBOS = Object.assign({}, PISA, CONT);
    const escenas = [
      { n:'ambos-datos-ambas-tildadas',  pre:AMBOS, cont:true,  destildarPisa:false },
      { n:'ambos-datos-solo-PISA',       pre:AMBOS, cont:false, destildarPisa:false },
      { n:'ambos-datos-solo-CONTINUIDAD',pre:AMBOS, cont:true,  destildarPisa:true  },
      { n:'solo-datos-PISA',             pre:PISA,  cont:false, destildarPisa:false }
    ];
    const g = { escenas: [], ultima: {} };
    for (const e of escenas) {
      const limpio = await escenaCero();
      const p = await pre(e.pre);
      const tc = e.cont ? await tildar('im_pdf_cont', true) : null;
      const tp = e.destildarPisa ? await clicChk('im_pdf_pisa') : null;
      await pausa(200);
      const f = await fotoDe('im');
      const panel = await ev(`window.__P.imPanel()`);
      const i = await ev(`window.__P.informe('estandar')`);
      const pdf = await ev(`window.__P.pdfIM()`);
      const fr = await ev(`window.__P.frases(${JSON.stringify(i.inf)}, "mitral")`);
      g.escenas.push({ escena:e.n, limpio, pre:p, tildoCont:tc, destildoPisa:tp,
        chk:{ pisa:f.chkPisa, cont:f.chkCont }, panel,
        filas:{ eroa:f.eroa, volr:f.volr, fr:f.fr,
                contEroa:f.contEroa, contVolr:f.contVolr, contFr:f.contFr },
        contSev:f.contSev, grado:f.grado, sev:f.sev, pill:f.pill, disc:f.disc,
        frases:fr, suma:i.suma, pdf });
    }
    /* LA ULTIMA CASILLA TILDADA NO SE DESTILDA, por los DOS lados: con solo PISA tildada el clic
       sobre PISA no la baja; con solo continuidad tildada el clic sobre continuidad tampoco. */
    { await escenaCero(); await pre(AMBOS);
      const p0 = await ev(`window.__P.imPanel()`);
      const c1 = await clicChk('im_pdf_pisa');          // quedan: cont NO, pisa NO -> bloqueado
      const p1 = await ev(`window.__P.imPanel()`);
      g.ultima.soloPisa = { antes:p0, clic:c1, despues:p1 }; }
    { await escenaCero(); await pre(AMBOS);
      await tildar('im_pdf_cont', true);
      const d1 = await clicChk('im_pdf_pisa');          // ahora la unica tildada es continuidad
      const p1 = await ev(`window.__P.imPanel()`);
      const d2 = await clicChk('im_pdf_cont');          // bloqueado
      const p2 = await ev(`window.__P.imPanel()`);
      g.ultima.soloCont = { destildoPisa:d1, trasPisa:p1, clicCont:d2, despues:p2 }; }
    /* Un estudio guardado con PISA DESTILDADA vuelve destildada; y uno guardado con las dos
       tildadas vuelve con las dos. Es la regla «abren como se guardaron». */
    { await escenaCero(); await pre(AMBOS);
      await tildar('im_pdf_cont', true);
      await clicChk('im_pdf_pisa');
      await tipear('nombre', 'PISA OFF');
      g.guardado = await ev(`window.__P.guardarYReabrir('pisa destildada')`, 60000); }
    out.grupos.pisa = g;
  }

  /* ══ GRUPO nuevo — QUE QUEDA VIVO DESPUES DE «NUEVO ESTUDIO» ═════════════════════════════════
     El gesto va con CLICS REALES por los dos botones. Lo que se mira son las tres piezas que no
     son DOM —los dos grados calculados y el renglon de la continuidad— y, despues, el PRIMER dato
     del paciente nuevo: si el calculo anterior sobrevive, el aviso rojo lo nombra. */
  if (corre('nuevo')) {
    const g = {};
    /* (a) INSUFICIENCIA MITRAL: PISA severa -> Nuevo estudio -> un dato LEVE. */
    { await escenaCero();
      await pre({ pisa_r:'10', pisa_val:'40', im_vmax:'5', im_itv:'40' });
      const conDato = { proc: await ev(`window.__P.procesos()`), im: await fotoDe('im') };
      const gesto = await nuevoEstudioReal();
      const trasNuevo = { proc: await ev(`window.__P.procesos()`), im: await fotoDe('im'),
                          panel: await ev(`window.__P.imPanel()`) };
      const t = await tipear('im_vc', '2');
      await pausa(200);
      const datoNuevo = { proc: await ev(`window.__P.procesos()`), im: await fotoDe('im') };
      g.im = { conDato, gesto, trasNuevo, tecleo: t, datoNuevo };
    }
    /* (b) INSUFICIENCIA TRICUSPIDEA: vena contracta severa -> Nuevo estudio -> un dato LEVE. */
    { await escenaCero();
      await pre({ it_vc:'8' });
      const conDato = { proc: await ev(`window.__P.procesos()`), it: await fotoDe('it') };
      const gesto = await nuevoEstudioReal();
      const trasNuevo = { proc: await ev(`window.__P.procesos()`), it: await fotoDe('it') };
      const t = await tipear('it_vc', '2');
      await pausa(200);
      const datoNuevo = { proc: await ev(`window.__P.procesos()`), it: await fotoDe('it') };
      g.it = { conDato, gesto, trasNuevo, tecleo: t, datoNuevo };
    }
    /* (c) EL RENGLON «Severidad (continuidad)»: se carga el metodo volumetrico, se mira que el
       renglon diga algo, y despues de «Nuevo estudio» tiene que estar vacio. */
    { await escenaCero();
      await pre({ diam_mit:'40', vtim:'12', ea_dtsvi:'20', itv_tsvi:'20', im_itv:'40' });
      const conDato = await ev(`window.__P.procesos()`);
      const gesto = await nuevoEstudioReal();
      const trasNuevo = await ev(`window.__P.procesos()`);
      g.contSev = { conDato, gesto, trasNuevo };
    }
    /* (d) CONTROL NEGATIVO: la IAo, que YA se limpiaba, tiene que seguir limpiandose igual. */
    { await escenaCero();
      await pre({ ia_vc:'8' });
      const conDato = await ev(`window.__P.procesos()`);
      const gesto = await nuevoEstudioReal();
      const trasNuevo = await ev(`window.__P.procesos()`);
      g.iaControl = { conDato, gesto, trasNuevo };
    }
    /* (e) UN ESTUDIO GUARDADO SE ABRE COMO SE GUARDO: la limpieza no puede alcanzar a la ruta de
       reapertura, que es la que repone el estudio. */
    { await escenaCero();
      await pre({ pisa_r:'10', pisa_val:'40', im_vmax:'5', im_itv:'40',
                  et_gmedio:'8', et_vti_diast:'70' });
      await tipear('nombre', 'GUARDADO 1');
      g.guardado = await ev(`window.__P.guardarYReabrir('im + et')`, 60000);
    }
    out.grupos.nuevo = g;
  }

  /* ══ GRUPO ayuda — LAS TRES AFIRMACIONES VIEJAS DE LA AYUDA DE LA ESTENOSIS MITRAL ═══════════ */
  if (corre('ayuda')) {
    await escenaCero();
    out.grupos.ayuda = await ev(`window.__P.ayudaEM()`);
  }

  /* ══ GRUPO controles — LO QUE ESTA TANDA NO PUEDE MOVER ══════════════════════════════════════
     Un escenario CARGADO, para que el control tenga denominador: un formulario vacio sale
     identico por construccion y no prueba nada. */
  if (corre('controles')) {
    const g = {};
    try {
      await escenaCero();
      const sembrado = {
        im_vc:'6', ia_vc:'5', it_vc:'6', ea_dtsvi:'20', itv_tsvi:'22',
        vmax_ao:'4.2', gmedio_ao:'45', em_gmedio:'12',
        et_gmedio:'8', et_thp:'200', vp_vmax:'3.5', ip_pht:'80',
        onda_e:'90', onda_a:'60', tde:'180', e_sep:'6', e_lat:'8',
        vmax_it:'2.9', ai_vol:'40', peso:'70', talla:'170', edad:'60', fevi:'60',
        hf_ntprobnp:'450'
      };
      g.sembrado = await pre(sembrado);
      await pausa(300);
      await ev(`window.__P.pintarVacio()`);
      await pausa(200);
      g.ajenos = await ev(`window.__P.ajenos()`);
      g.excel  = await ev(`window.__P.excel()`);
      g.informe = {};
      for (const est of ['estandar', 'detallado', 'conciso']) {
        g.informe[est] = await ev(`window.__P.informe(${JSON.stringify(est)})`);
      }
      g.fotos = { im: await fotoDe('im'), ia: await fotoDe('ia'),
                  ea: await fotoDe('ea'), it: await fotoDe('it'),
                  otras: await ev(`window.__P.fotoOtras()`) };
      g.campos = await ev(`(function(){ var c = window.__P.campos();
        return { n: Object.keys(c).length, hash: JSON.stringify(c).length } })()`);
    } catch (e) { g.err = String(e.message || e); }
    out.grupos.controles = g;
  }

  out.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  out.md5Igual = out.md5Ini === out.md5Fin;
  out.avisoFin = await ev(`window.__P.despejar()`);
  console.log(JSON.stringify(out, null, 1));
  try { cdp.close(); } catch (e) {}
  try { srv.close(); } catch (e) {}
  process.exit(0);
}

main().catch((e) => { console.error('[_probe_valvcuatro] ' + (e && e.stack || e)); process.exit(1); });
