#!/usr/bin/env node
/**
 * _probe_valvborra.mjs — sonda A/B de SOLO LECTURA para la tanda del BORRADO en Valvulas
 * (2026-10-13): insuficiencia MITRAL, insuficiencia AORTICA, estenosis AORTICA e insuficiencia
 * TRICUSPIDEA.
 *
 * Mide, con TECLAS REALES, por cada campo votante de las cuatro lesiones: el estado inicial, el
 * estado con un valor de cada grado, y el estado DESPUES de borrarlo con Backspace. Lo que compara
 * es la terna completa que el medico ve: fila de referencia, badge integrado, campo de grado,
 * pastilla, informe narrativo y EN SUMA.
 *
 * Infraestructura calcada de scripts/_probe_dopmitral.mjs (teclas y clics reales, cierre del arbol
 * de Chrome por GRUPO, cierre del aviso legal con su denominador, md5 al principio y al final).
 * NO muta index.html.
 *
 *   node scripts/_probe_valvborra.mjs --file /tmp/index.HEAD.html > /tmp/vb.HEAD.json
 *   node scripts/_probe_valvborra.mjs                             > /tmp/vb.NEW.json
 *
 * Grupos (--solo repro|borrado|dos|metodo|tric|pastillas|controles|pdf):
 *   repro     — los sintomas del medico, uno por uno, con los valores que el reporto.
 *   borrado   — la tabla completa: cada campo votante x cada grado, cargar y borrar.
 *   dos       — dos datos cargados y uno borrado: el grado vuelve al que da el que queda.
 *   metodo    — la regla de metodo de la IM (solo PISA, solo continuidad, los dos, ninguno).
 *   tric      — la tricuspide: densidad severa + continuidad de otro grado.
 *   pastillas — prendida por la app (se apaga) y marcada a mano (no se apaga).
 *   controles — estenosis mitral, estenosis tricuspidea, pulmonar, diastolica, Excel.
 *   pdf       — las filas de EROA, Vol-R y FR que publica la tabla del PDF.
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
const GRUPOS = ['repro','borrado','dos','metodo','tric','pastillas','controles','pdf'];

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

  /* ══ GRUPO repro — los sintomas del medico, uno por uno ══════════════════════════════════════ */
  if (corre('repro')) {
    const g = {};
    for (const les of LES) {
      g[les] = [];
      for (const e of (ESC[les] || [])) {
        for (const grado of Object.keys(e.val)) {
          const limpio = await escenaCero();
          const p = await pre(e.pre);
          /* ⚠️ SE VUELVE A ENTRAR A LA PESTANIA ANTES DE LA FOTO INICIAL, para que la REGLA J
             —`valvAutoAbrirCajones`, que corre en cada showTab de valvulas y prende la pastilla
             cuando el grado es graduable— haya tenido las MISMAS oportunidades de actuar que
             despues del borrado. Sin esto, cuatro escenas salian «no volvio» por la pastilla: el
             prerrequisito ya habia dejado un grado graduable y la regla J la prendia recien en el
             abrirTodo que hace el borrado. La diferencia no era del borrado, era del denominador. */
          await ev(`window.__P.abrirTodo()`);
          const f0 = await fotoDe(les);
          const t = await tipear(e.id, e.val[grado]);
          const f1 = await fotoDe(les);
          const i1 = await ev(`window.__P.informe('completo')`);
          const b = await borrar(e.id);
          const f2 = await fotoDe(les);
          const i2 = await ev(`window.__P.informe('completo')`);
          const fr1 = await ev(`window.__P.frases(${JSON.stringify(i1.inf)}, ${JSON.stringify(les === 'im' ? 'mitral' : (les === 'it' ? 'tricuspide' : 'aortica'))})`);
          const fr2 = await ev(`window.__P.frases(${JSON.stringify(i2.inf)}, ${JSON.stringify(les === 'im' ? 'mitral' : (les === 'it' ? 'tricuspide' : 'aortica'))})`);
          g[les].push({ campo: e.id, grado, pedido: e.val[grado], limpio, pre: p, tecleo: t, borrado: b,
            ini: { grado: f0.grado, sev: f0.sev, pill: f0.pill, fila: f0[e.fila] },
            con: { grado: f1.grado, sev: f1.sev, pill: f1.pill, fila: f1[e.fila], sug: f1.sug, calc: f1.calc },
            tras:{ grado: f2.grado, sev: f2.sev, pill: f2.pill, fila: f2[e.fila], sug: f2.sug, calc: f2.calc },
            frasesCon: fr1, frasesTras: fr2,
            sumaCon: i1.suma, sumaTras: i2.suma,
            volvioGrado: String(f2.grado) === String(f0.grado),
            volvioSev:   String(f2.sev)   === String(f0.sev),
            volvioPill:  String(f2.pill)  === String(f0.pill),
            volvioFila:  String(f2[e.fila]) === String(f0[e.fila]) });
        }
      }
      for (const e of (ESC_SEL[les] || [])) {
        for (const grado of Object.keys(e.val)) {
          const limpio = await escenaCero();
          const f0 = await fotoDe(les);
          const s1 = await ev(`window.__P.set(${JSON.stringify(e.id)}, ${JSON.stringify(e.val[grado])})`);
          const f1 = await fotoDe(les);
          const i1 = await ev(`window.__P.informe('completo')`);
          const s2 = await ev(`window.__P.set(${JSON.stringify(e.id)}, "")`);
          const f2 = await fotoDe(les);
          const i2 = await ev(`window.__P.informe('completo')`);
          g[les].push({ campo: e.id, grado, pedido: e.val[grado], limpio, select: true, puesto: s1, vuelto: s2,
            ini: { grado: f0.grado, sev: f0.sev, pill: f0.pill },
            con: { grado: f1.grado, sev: f1.sev, pill: f1.pill, dens: f1.dens, ondaS: f1.ondaS },
            tras:{ grado: f2.grado, sev: f2.sev, pill: f2.pill, dens: f2.dens, ondaS: f2.ondaS },
            sumaCon: i1.suma, sumaTras: i2.suma,
            volvioGrado: String(f2.grado) === String(f0.grado),
            volvioSev:   String(f2.sev)   === String(f0.sev),
            volvioPill:  String(f2.pill)  === String(f0.pill) });
        }
      }
    }
    out.grupos.repro = g;
  }

  /* ══ GRUPO dos — dos datos cargados y uno borrado ════════════════════════════════════════════ */
  if (corre('dos')) {
    const casos = [
      { les:'im', a:{ id:'im_vc', v:'7' },      b:{ id:'im_jet_area', v:'3' }, pre:{ im_ai_area:'20' } },
      { les:'ia', a:{ id:'ia_pht', v:'150' },   b:{ id:'ia_vc', v:'2' },       pre:{} },
      { les:'ea', a:{ id:'gmedio_ao', v:'45' }, b:{ id:'vmax_ao', v:'2' },     pre:{} },
      { les:'it', a:{ id:'it_vc', v:'8' },      b:{ id:'it_pisa_r', v:'6' },   pre:{ it_pisa_val:'40', it_vmax_cw:'5' } }
    ];
    const g = [];
    for (const c of casos) {
      const limpio = await escenaCero();
      const p = await pre(c.pre);
      const ta = await tipear(c.a.id, c.a.v);
      const fA = await fotoDe(c.les);
      const tb = await tipear(c.b.id, c.b.v);
      const fAB = await fotoDe(c.les);
      const bo = await borrar(c.a.id);
      const fB = await fotoDe(c.les);
      /* Control: el grado que da el dato que QUEDA, medido en su propia escena limpia. */
      await escenaCero();
      await pre(c.pre);
      await tipear(c.b.id, c.b.v);
      const fSolo = await fotoDe(c.les);
      g.push({ les:c.les, limpio, pre:p, a:c.a, b:c.b, tecleoA:ta, tecleoB:tb, borrado:bo,
        soloA: { grado:fA.grado, sev:fA.sev },
        ambos: { grado:fAB.grado, sev:fAB.sev, disc:fAB.disc },
        trasBorrarA: { grado:fB.grado, sev:fB.sev },
        controlSoloB: { grado:fSolo.grado, sev:fSolo.sev },
        coincide: String(fB.grado) === String(fSolo.grado) && String(fB.sev) === String(fSolo.sev) });
    }
    out.grupos.dos = g;
  }

  /* ══ GRUPO metodo — la regla de metodo de la IM ══════════════════════════════════════════════
     PISA se calibra para dar SEVERA (EROA 50,3 mm²) y la continuidad para dar LEVE (Vol-R ~20 ml,
     FR ~24 %), asi que los dos metodos dan grados DISTINTOS y la regla se puede ver.
     ⚠️ Cada escena declara el estado de las DOS casillas y el valor de las SEIS filas al lado del
     veredicto: sin eso, un grado que no cambia se lee como una regla que no funciona cuando lo
     que paso es que el metodo no llego a tener numero. */
  if (corre('metodo')) {
    const PISA = { pisa_r:'10', pisa_val:'40', im_vmax:'5', im_itv:'40' };
    const CONT = { diam_mit:'30', vtim:'12', ea_dtsvi:'20', itv_tsvi:'22' };
    const escenas = [
      { n:'solo-PISA',  pre:PISA, cont:false },
      { n:'solo-CONT',  pre:CONT, cont:true  },
      { n:'ambos-marcados',   pre:Object.assign({}, PISA, CONT), cont:true  },
      { n:'ambos-sin-marcar', pre:Object.assign({}, PISA, CONT), cont:false },
      { n:'ninguno',    pre:{ im_vc:'2' }, cont:false }
    ];
    const g = [];
    for (const e of escenas) {
      const limpio = await escenaCero();
      const p = await pre(e.pre);
      const tCont = e.cont ? await tildar('im_pdf_cont', true) : null;
      const f = await fotoDe('im');
      const i = await ev(`window.__P.informe('completo')`);
      const pdf = await ev(`window.__P.pdfIM()`);
      const fr = await ev(`window.__P.frases(${JSON.stringify(i.inf)}, "mitral")`);
      g.push({ escena:e.n, limpio, pre:p, pidioCont:e.cont, tildado:tCont,
        chk:{ pisa:f.chkPisa, cont:f.chkCont },
        filas:{ eroa:f.eroa, volr:f.volr, fr:f.fr, contEroa:f.contEroa, contVolr:f.contVolr, contFr:f.contFr },
        contSev:f.contSev, grado:f.grado, sev:f.sev, pill:f.pill, disc:f.disc,
        frases:fr, suma:i.suma, pdf });
    }
    out.grupos.metodo = g;
  }

  /* ══ GRUPO tric — densidad severa + continuidad de otro grado ════════════════════════════════ */
  if (corre('tric')) {
    const g = [];
    /* EROA leve: r 6 / aliasing 40 / Vmax 5 → 18,1 mm² (< 20). La densidad en denso vota severa. */
    const limpio = await escenaCero();
    const p = await pre({ it_pisa_val:'40', it_vmax_cw:'5', it_pisa_r:'6' });
    const s = await ev(`window.__P.set('it_densidad','denso')`);
    const f1 = await fotoDe('it');
    const i1 = await ev(`window.__P.informe('completo')`);
    const fr1 = await ev(`window.__P.frases(${JSON.stringify(i1.inf)}, "tricuspide")`);
    const bo = await borrar('it_pisa_r');
    const f2 = await fotoDe('it');
    const i2 = await ev(`window.__P.informe('completo')`);
    const fr2 = await ev(`window.__P.frases(${JSON.stringify(i2.inf)}, "tricuspide")`);
    g.push({ escena:'densidad-severa + EROA-leve', limpio, pre:p, dens:s,
      con:{ grado:f1.grado, sev:f1.sev, vc:f1.vc, eroa:f1.eroa, volr:f1.volr, densFila:f1.dens, disc:f1.disc },
      frasesCon:fr1, sumaCon:i1.suma, borrado:bo,
      trasBorrarCont:{ grado:f2.grado, sev:f2.sev, eroa:f2.eroa, densFila:f2.dens },
      frasesTras:fr2, sumaTras:i2.suma });
    out.grupos.tric = g;
  }

  /* ══ GRUPO pastillas — prendida por la app y marcada a mano ══════════════════════════════════ */
  if (corre('pastillas')) {
    const casos = [
      { les:'im', valv:'mitral',     tipo:'insuf', pre:{}, campo:'im_vc',    v:'7'  },
      { les:'ia', valv:'aortica',    tipo:'insuf', pre:{}, campo:'ia_pht',   v:'150'},
      { les:'it', valv:'tricuspide', tipo:'insuf', pre:{}, campo:'it_vc',    v:'8'  },
      { les:'ea', valv:'aortica',    tipo:'esten', pre:{}, campo:'vmax_ao',  v:'2'  },
      { les:'ea', valv:'aortica',    tipo:'esten', pre:{}, campo:'vmax_ao',  v:'3'  },
      { les:'ea', valv:'aortica',    tipo:'esten', pre:{}, campo:'vmax_ao',  v:'4'  }
    ];
    const g = [];
    for (const c of casos) {
      /* (a) la prende la APP: se carga el dato y se borra. */
      const limpio = await escenaCero();
      await pre(c.pre);
      const t = await tipear(c.campo, c.v);
      const f1 = await fotoDe(c.les);
      const bo = await borrar(c.campo);
      const f2 = await fotoDe(c.les);
      /* (b) la marca el MEDICO: clic en la pastilla ANTES de cargar, y despues se borra. */
      await escenaCero();
      await pre(c.pre);
      const clic = await prender(c.valv, c.tipo, true);
      const f3 = await fotoDe(c.les);
      const t2 = await tipear(c.campo, c.v);
      const f4 = await fotoDe(c.les);
      const bo2 = await borrar(c.campo);
      const f5 = await fotoDe(c.les);
      g.push({ les:c.les, valv:c.valv, tipo:c.tipo, campo:c.campo, valor:c.v, limpio,
        app: { tecleo:t, conDato:{ pill:f1.pill, ls:f1.ls, auto:f1.auto, grado:f1.grado },
               borrado:bo, tras:{ pill:f2.pill, ls:f2.ls, auto:f2.auto, grado:f2.grado } },
        mano:{ clic, trasClic:{ pill:f3.pill, ls:f3.ls, auto:f3.auto },
               tecleo:t2, conDato:{ pill:f4.pill, auto:f4.auto, grado:f4.grado },
               borrado:bo2, tras:{ pill:f5.pill, ls:f5.ls, auto:f5.auto, grado:f5.grado } } });
    }
    out.grupos.pastillas = g;
  }

  /* ══ GRUPO controles — lo que esta tanda NO toca ═════════════════════════════════════════════
     Las cinco lesiones ajenas (EM, ET, EP, IP y la diastolica) mas el Excel, en tres escenas:
     formulario vacio, un paciente con las cuatro lesiones de la tanda cargadas, y el mismo
     paciente con todo borrado. */
  if (corre('controles')) {
    const g = [];
    const PAC = { im_vc:'7', ia_pht:'150', it_vc:'8', vmax_ao:'4',
                  em_gmedio:'12', avm_plan:'1.2', et_gmedio:'8',
                  ep_vmax:'4', ip_vmax:'2', tde:'180', onda_e:'90', onda_a:'60',
                  e_sep:'6', e_lat:'8' };
    for (const fase of ['vacio','cargado','borrado']) {
      const limpio = await escenaCero();
      const tec = {};
      if (fase !== 'vacio') for (const id of Object.keys(PAC)) tec[id] = await tipear(id, PAC[id]);
      if (fase === 'borrado') for (const id of Object.keys(PAC)) tec['b_' + id] = await borrar(id);
      const otras = await ev(`window.__P.fotoOtras()`);
      const xls = await ev(`window.__P.excel()`);
      const i = await ev(`window.__P.informe('completo')`);
      g.push({ fase, limpio, tecleos: Object.keys(tec).filter(k => tec[k] && tec[k].ok === false),
               otras, excel: xls, inf: i.inf, suma: i.suma });
    }
    out.grupos.controles = g;
  }

  /* ══ GRUPO pdf — las tres filas del PDF de la IM ═════════════════════════════════════════════ */
  if (corre('pdf')) {
    const PISA = { pisa_r:'10', pisa_val:'40', im_vmax:'5', im_itv:'80', ea_dtsvi:'20', itv_tsvi:'20' };
    const CONT = { diam_mit:'30', vtim:'12' };
    const escenas = [
      { n:'solo-PISA', pre:PISA, cont:false },
      { n:'PISA+CONT-marcada', pre:Object.assign({}, PISA, CONT), cont:true }
    ];
    const g = [];
    for (const e of escenas) {
      const limpio = await escenaCero();
      const p = await pre(e.pre);
      const tCont = e.cont ? await tildar('im_pdf_cont', true) : null;
      const f = await fotoDe('im');
      const pdf = await ev(`window.__P.pdfIM()`);
      g.push({ escena:e.n, limpio, pre:p, tildado:tCont, chk:{ pisa:f.chkPisa, cont:f.chkCont },
        filas:{ eroa:f.eroa, volr:f.volr, fr:f.fr, contEroa:f.contEroa, contVolr:f.contVolr, contFr:f.contFr },
        pdf });
    }
    out.grupos.pdf = g;
  }

  /* ══ GRUPO borrado — la tabla por campo y por grado, con el denominador declarado ════════════
     Es el mismo recorrido que `repro` pero SIN informe, para que la tabla quepa y se pueda contar.
     El veredicto por fila es «volvio al estado inicial en las cuatro columnas». */
  if (corre('borrado')) {
    const g = { filas: [], denominadores: {} };
    let nCampos = 0, nEscenas = 0;
    for (const les of LES) {
      const lista = (ESC[les] || []);
      nCampos += lista.length + (ESC_SEL[les] || []).length;
      for (const e of lista) {
        for (const grado of Object.keys(e.val)) {
          nEscenas++;
          await escenaCero();
          const p = await pre(e.pre);
          /* ⚠️ SE VUELVE A ENTRAR A LA PESTANIA ANTES DE LA FOTO INICIAL, para que la REGLA J
             —`valvAutoAbrirCajones`, que corre en cada showTab de valvulas y prende la pastilla
             cuando el grado es graduable— haya tenido las MISMAS oportunidades de actuar que
             despues del borrado. Sin esto, cuatro escenas salian «no volvio» por la pastilla: el
             prerrequisito ya habia dejado un grado graduable y la regla J la prendia recien en el
             abrirTodo que hace el borrado. La diferencia no era del borrado, era del denominador. */
          await ev(`window.__P.abrirTodo()`);
          const f0 = await fotoDe(les);
          const t = await tipear(e.id, e.val[grado]);
          const f1 = await fotoDe(les);
          const b = await borrar(e.id);
          const f2 = await fotoDe(les);
          g.filas.push({ les, campo:e.id, grado, preOk:p.ok, tecleoOk:t.ok, quedoTrasBorrar:b.quedo,
            gradoIni:f0.grado, gradoCon:f1.grado, gradoTras:f2.grado,
            sevIni:f0.sev, sevCon:f1.sev, sevTras:f2.sev,
            pillIni:f0.pill, pillCon:f1.pill, pillTras:f2.pill,
            filaIni:f0[e.fila], filaCon:f1[e.fila], filaTras:f2[e.fila],
            ok: String(f2.grado) === String(f0.grado) && String(f2.sev) === String(f0.sev) &&
                String(f2.pill) === String(f0.pill) && String(f2[e.fila]) === String(f0[e.fila]) });
        }
      }
    }
    g.denominadores = { campos: nCampos, escenas: nEscenas,
      ok: g.filas.filter(f => f.ok).length, mal: g.filas.filter(f => !f.ok).length };
    out.grupos.borrado = g;
  }

  out.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  out.md5Igual = out.md5Ini === out.md5Fin;
  process.stdout.write(JSON.stringify(out, null, 1));
  cdp.close(); srv.close();
  process.exit(0);
}
main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
