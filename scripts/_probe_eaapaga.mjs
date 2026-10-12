#!/usr/bin/env node
/**
 * _probe_eaapaga.mjs — sonda A/B de SOLO LECTURA para los dos arreglos de la VALVULA AORTICA.
 * No muta index.html: comprueba su md5 al principio y al final.
 *
 *   A — el AUTO-APAGADO de la pastilla de estenosis aortica, con TECLAS REALES del navegador
 *       (Input.dispatchKeyEvent), no asignando `value` por script. La tabla pastilla x dato:
 *       sin dato, con dato, apagada a mano con dato, prendida a mano sin dato, dato corregido
 *       a normal, dato vaciado — mas el vaiven del auto-prendido (se gasta en un solo uso?) y
 *       el grado elegido en la pastilla. De cada escena: boton, DUENO (VALV_ESTEN_AUTO), clave
 *       de localStorage, grado, marca manual con su foto, informe en tres estilos y EN SUMA.
 *   I — la pastilla de INSUFICIENCIA aortica: quien la prende, si queda dueno registrado y si
 *       su grado puede volver al centinela. Mide el estado, no afirma un arreglo.
 *   B — BORRAR QUEDA BORRADO: los cuatro campos hermanos (Vmax, G. medio, VTI TSVI, VTI Ao) y
 *       el Diam. TSVI, borrados desde CADA lugar de origen, con el bloque aortico ABIERTO y
 *       CERRADO; y los calculados (G. max en sus dos casillas, AVA, AVA indexada, DVI).
 *   N — CONTROL NEGATIVO: la mitral, la tricuspide y la pulmonar, con escenario cargado para
 *       que el control tenga DENOMINADOR.
 *
 *   node scripts/_probe_eaapaga.mjs --file /tmp/index.HEAD.html > /tmp/ea.HEAD.json
 *   node scripts/_probe_eaapaga.mjs                            > /tmp/ea.NEW.json
 *   node scripts/_probe_eaapaga.mjs --solo A --ver
 *
 * Infraestructura (servidor + Chrome + CDP + cierre del arbol de procesos + teclas reales)
 * calcada de scripts/_probe_emauto.mjs, que es la sonda de la mitral.
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-eaap-'));
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
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  pill(v, t) { try { return (typeof pillOn === 'function') ? pillOn(v, t) : 'SIN pillOn' }
    catch(e) { return 'EXC' } },
  existe(id) { return !!document.getElementById(id) },

  /* Abre lo que haga falta para que el campo tenga geometria. Calcado de _probe_emauto.mjs. */
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

  /* DENOMINADOR. Abre Valvulas, las cuatro tarjetas y el cajon de detalle de la AORTICA, y
     CONFIRMA que los campos que esta tanda tipea tienen geometria. Una sonda sobre un arbol
     cerrado tipea en la nada, el campo queda vacio y todo sale «sin cambios».
     ⚠️ EL BLOQUE DE LA AORTICA SE ABRE A MANO (display inline) PORQUE LO GOBIERNA LA PASTILLA:
     con la pastilla de estenosis apagada, bloque-ea-detalle esta en display:none y ninguno de
     los cinco campos del bloque tiene geometria. Es la misma apertura que hace _probe_emauto
     con bloque-em-detalle, y se declara porque cambia lo que la escena puede tipear. */
  abrirTodo() {
    try { showTab('valvulas') } catch(e) {}
    ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'].forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && s.style.display === 'none') { try { toggleEteSeccion(tok) } catch(e) {} }
    });
    var det = document.getElementById('bloque-ea-detalle');
    if (det) det.style.display = 'block';
    return { tab: window.__P.vis('tab-valvulas'), ea_vmax: window.__P.vis('ea_vmax'),
             ea_gmedio: window.__P.vis('ea_gmedio'), ea_vtitsvi: window.__P.vis('ea_vtitsvi'),
             ea_vtiao: window.__P.vis('ea_vtiao'), ea_dtsvi: window.__P.vis('ea_dtsvi'),
             pill: window.__P.vis('pill-esten-aortica'),
             pillInsuf: window.__P.vis('pill-insuf-aortica'),
             ok: window.__P.vis('ea_vmax') === true && window.__P.vis('ea_gmedio') === true &&
                 window.__P.vis('ea_vtitsvi') === true && window.__P.vis('ea_vtiao') === true } },

  /* Estado de partida limpio y SIN DUENO: borra las ocho claves, apaga lo prendido, vacia las
     marcas y los dos Set. Sin vaciar el Set, la escena siguiente arranca con la aortica ya
     «de la app». */
  limpiar() {
    try { limpiarCampos(true) } catch(e) {}
    window.esqSevManual = {}; window._sevCalcAlFijar = {}; window._iaGradoCalc = null;
    ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){
        try { localStorage.removeItem('valv-pill-' + t + '-' + v) } catch(e){}
        try { if (window.__P.pill(v,t) === true) toggleValvPill(v,t) } catch(e){}
      });
    });
    try { if (window.VALV_ESTEN_AUTO) window.VALV_ESTEN_AUTO.clear() } catch(e) {}
    try { if (window.VALV_INSUF_AUTO) window.VALV_INSUF_AUTO.clear() } catch(e) {}
    return 1 },

  /* Solo para el escenario BASE del control negativo: no es un gesto medido. */
  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value } },

  campos() {
    var c = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      c[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      c[el.id + '__chk'] = el.checked ? '1' : '0' });
    return c },

  excel() {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    var campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return } catch(e){}
      campos[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      campos[el.id + '__chk'] = el.checked ? '1' : '0' });
    try { return _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-11', campos: campos }) }
    catch(e) { return 'EXC: ' + e.message } },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  /* POR LINEA Y NO POR ORACION: el informe se arma con inf.push(...) y se une por salto de
     linea, asi que UNA linea es el parrafo entero de una valvula. */
  frasesAO(texto) {
    var re = /a[\\u00f3o]rtic|\\bVAo\\b|\\bEAo\\b|\\bIAo\\b|\\bAVA\\b|TSVI/i;
    return String(texto || '').split(/\\n/).map(function(s){ return s.trim() })
      .filter(function(s){ return s && re.test(s) }) },
  /* CONTROL NEGATIVO: las lineas de las OTRAS TRES valvulas. Si una de estas se mueve, el
     cambio se fue de la aortica. */
  frasesOtras(texto) {
    var re = /mitral|tric[\\u00fau]sp|pulmonar|\\bEM\\b|\\bIM\\b|\\bIT\\b|\\bIP\\b/i;
    return String(texto || '').split(/\\n/).map(function(s){ return s.trim() })
      .filter(function(s){ return s && re.test(s) }) },
  sumaAO(suma) {
    return String(suma || '').split(/\\n+/).map(function(s){ return s.trim() })
      .filter(function(s){ return s && /\\bEAo\\b|\\bIAo\\b|\\bVAo\\b|a[\\u00f3o]rtic/i.test(s) }) },
  sumaOtras(suma) {
    return String(suma || '').split(/\\n+/).map(function(s){ return s.trim() })
      .filter(function(s){ return s && /\\bEM\\b|\\bIM\\b|\\bIT\\b|\\bIP\\b|mitral|tric[\\u00fau]sp|pulmonar/i.test(s) }) },

  /* LA FOTO DE LA ESTENOSIS AORTICA: boton, DUENO, clave de localStorage, grado, la marca de
     «lo sugirio el autocalculo», la marca manual y su foto, y los cuatro derivados. */
  fotoEA() {
    var sel = document.getElementById('ea_grado');
    return {
      pill:   window.__P.pill('aortica','esten'),
      dueno:  (function(){ try { var s = window.VALV_ESTEN_AUTO;
                 return s ? s.has('aortica') : 'SIN SET' } catch(e) { return 'EXC' } })(),
      clave:  (function(){ try { return localStorage.getItem('valv-pill-esten-aortica') }
                 catch(e) { return 'EXC' } })(),
      ea_grado: window.__P.val('ea_grado'),
      sugerido: sel ? (sel.dataset.sugerido === undefined ? null : sel.dataset.sugerido) : null,
      manual: !!(window.esqSevManual && window.esqSevManual.ea),
      fotoCalc: (function(){ try { return window._sevCalcAlFijar
                   ? (window._sevCalcAlFijar.ea === undefined ? null : window._sevCalcAlFijar.ea)
                   : null } catch(e) { return 'EXC' } })(),
      calculado: (function(){ try { return eaGradoCalculado().grado } catch(e) { return 'EXC' } })(),
      vmax_ao: window.__P.val('vmax_ao'), ea_vmax: window.__P.val('ea_vmax'),
      gmedio_ao: window.__P.val('gmedio_ao'), ea_gmedio: window.__P.val('ea_gmedio'),
      gmax_calc: window.__P.val('gmax_calc'), ea_gmax_display: window.__P.val('ea_gmax_display'),
      ea_det_gmax: window.__P.txt('ea-det-gmax'),
      ava_cont: window.__P.val('ava_cont'), ea_ava_display: window.__P.val('ea_ava_display'),
      dvi: window.__P.txt('dvi-val'),
      badge: window.__P.txt('ea-ava-badge'),
      eaAviso: window.__P.txt('ea-manual-aviso'),
      eaFundVis: window.__P.vis('ea-fund'),
      gradoVis: window.__P.vis('ea_grado'),
      sevManualEspejo: window.__P.val('sev_manual')
    } },

  /* LA FOTO DE LA INSUFICIENCIA AORTICA. No hay Set de dueno para la insuficiencia aortica
     —VALV_INSUF_AUTO lo llena solo _ipAutoPrender, que es la pulmonar—, asi que se informa lo
     que ese Set dice de 'aortica' para dejar constancia de que esta vacio. */
  fotoIA() {
    var hid = document.getElementById('ia_grado');
    return {
      pill:   window.__P.pill('aortica','insuf'),
      duenoInsuf: (function(){ try { var s = window.VALV_INSUF_AUTO;
                     return s ? s.has('aortica') : 'SIN SET' } catch(e) { return 'EXC' } })(),
      clave:  (function(){ try { return localStorage.getItem('valv-pill-insuf-aortica') }
                 catch(e) { return 'EXC' } })(),
      ia_grado: window.__P.val('ia_grado'),
      sugerido: hid ? (hid.dataset.sugerido === undefined ? null : hid.dataset.sugerido) : null,
      manual: !!(window.esqSevManual && window.esqSevManual.ia),
      calculado: (function(){ try { return window._iaGradoCalc === undefined ? null : window._iaGradoCalc } catch(e) { return 'EXC' } })(),
      ia_vc: window.__P.val('ia_vc'),
      iaSev: window.__P.txt('ia-sev'),
      iaAviso: window.__P.txt('ia-manual-aviso')
    } },

  /* QUIEN RECIBE EL CLIC EN ESE PUNTO. Sin esto, un clic dispachado sobre coordenadas tapadas
     por otro nodo se informa como «clic ok» y la escena mide un gesto que no ocurrio. */
  quienEsta(id, x, y) {
    var t = document.getElementById(id);
    var e = document.elementFromPoint(x, y);
    if (!e) return { enPunto: null, esElBlanco: false };
    return { enPunto: (e.id || ('<' + e.tagName.toLowerCase() + ' ' + String(e.className || '') + '>')),
             esElBlanco: !!(t && (e === t || t.contains(e) || e.contains(t))) } },

  /* Las opciones del menu ▼ de una pastilla, ya pintadas, con su id para el clic real. */
  menuOpts(menuId) {
    var m = document.getElementById(menuId); if (!m) return null;
    return Array.from(m.querySelectorAll('button')).map(function(b, i){
      if (!b.id) b.id = '__opt_' + menuId + '_' + i;
      return { id: b.id, txt: (b.textContent || '').trim() } }) },

  /* LOS CINCO CAMPOS HERMANOS Y LOS DERIVADOS, de una sola lectura: es la tabla de B. */
  fotoCampos() {
    return {
      vmax:   { vmax_ao: window.__P.val('vmax_ao'),       ea_vmax: window.__P.val('ea_vmax') },
      gmedio: { gmedio_ao: window.__P.val('gmedio_ao'),   ea_gmedio: window.__P.val('ea_gmedio') },
      vtitsvi:{ itv_tsvi: window.__P.val('itv_tsvi'),     ea_vtitsvi: window.__P.val('ea_vtitsvi'),
                em_vtitsvi: window.__P.val('em_vtitsvi'), im_itv_tsvi: window.__P.val('im_itv_tsvi') },
      vtiao:  { itv_ao: window.__P.val('itv_ao'),         ea_vtiao: window.__P.val('ea_vtiao') },
      dtsvi:  { diam_tsvi: window.__P.val('diam_tsvi'),   diam_tsvi_ao: window.__P.val('diam_tsvi_ao'),
                ea_dtsvi: window.__P.val('ea_dtsvi'),     em_dtsvi: window.__P.val('em_dtsvi'),
                im_dtsvi: window.__P.val('im_dtsvi') },
      derivados: { gmax_calc: window.__P.val('gmax_calc'),
                   ea_gmax_display: window.__P.val('ea_gmax_display'),
                   ea_det_gmax: window.__P.txt('ea-det-gmax'),
                   ava_cont: window.__P.val('ava_cont'),
                   ea_ava_display: window.__P.val('ea_ava_display'),
                   ava_idx: window.__P.txt('ava-idx'),
                   ea_det_avai: window.__P.txt('ea-det-avai'),
                   dvi: window.__P.txt('dvi-val'),
                   ea_dvi_display: window.__P.val('ea_dvi_display'),
                   ete_tavi_avai: window.__P.val('ete_tavi_avai'),
                   vs_calc: window.__P.val('vs_calc') },
      grado: { ea_grado: window.__P.val('ea_grado'), pill: window.__P.pill('aortica','esten') }
    } },

  /* La foto de las OTRAS TRES valvulas: control negativo de los dos commits. */
  fotoOtras() {
    return {
      mitral: { esten: window.__P.pill('mitral','esten'), insuf: window.__P.pill('mitral','insuf'),
                em_grado: window.__P.val('em_grado'), im_grado: window.__P.val('im_grado'),
                avm_plan: window.__P.val('avm_plan'), em_gmedio: window.__P.val('em_gmedio'),
                duenoEsten: (function(){ try { return window.VALV_ESTEN_AUTO.has('mitral') } catch(e){ return 'EXC' } })() },
      tricuspide: { esten: window.__P.pill('tricuspide','esten'), insuf: window.__P.pill('tricuspide','insuf'),
                et_grado: window.__P.val('et_grado'), it_grado: window.__P.val('it_grado'),
                duenoEsten: (function(){ try { return window.VALV_ESTEN_AUTO.has('tricuspide') } catch(e){ return 'EXC' } })() },
      pulmonar: { esten: window.__P.pill('pulmonar','esten'), insuf: window.__P.pill('pulmonar','insuf'),
                ep_grado: window.__P.val('ep_grado'), ip_grado: window.__P.val('ip_grado'),
                duenoEsten: (function(){ try { return window.VALV_ESTEN_AUTO.has('pulmonar') } catch(e){ return 'EXC' } })(),
                duenoInsuf: (function(){ try { return window.VALV_INSUF_AUTO.has('pulmonar') } catch(e){ return 'EXC' } })() }
    } },

  /* ⚠️ GUARDAR DE VERDAD, CONFIRMANDO LA CARD DE SEVERIDADES. valvSevConfirmada es un let
     de modulo y NO vive en window, asi que ponerla desde la sonda no hace nada:
     guardarInforme abre la card, devuelve false y NO guarda — la primera corrida de este
     bloque dio «no quedo ningun estudio guardado» y la escena se salteo entera, con un
     denominador roto que parecia un hallazgo. Se entra por el camino real: se llama y se
     clickea «Confirmar», que es lo que hace el medico. Calcado de _probe_vi3dpdf.mjs. */
  async guardarDeVerdad() {
    if (typeof guardarInforme !== 'function') return 'SIN guardarInforme';
    var r = null;
    try { r = guardarInforme(function(){}) } catch (e) { return 'ERR ' + e.message }
    var b = document.getElementById('rev-confirm');
    if (b) { b.click(); await new Promise(function(x){ setTimeout(x, 400) }) }
    await new Promise(function(x){ setTimeout(x, 400) });
    return { primeraLlamada: r, huboCard: !!b,
             nInformes: (typeof getInformes === 'function') ? getInformes().length : -1 } },

  guardados() { try { return getInformes().map(function(i){
      return { id: i.id, nombre: i.nombre } }) } catch(e) { return 'EXC: ' + e.message } },

  listo() {
    var faltan = ['generarInforme','pillOn','toggleValvPill','showTab','limpiarCampos','calcAo',
                  'eaGradoCalculado','clasificarEA_Vmax','setEstiloInforme','valvAutoPrenderEsten',
                  'nuevoEstudio','guardarInforme','editarInforme','getInformes','_labExcelRow',
                  'eaParSync','eaParEditado','tsviDiamSync','tsviDiamEditado','calcIA_ESC']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (faltan.length) return { listo:false, faltan:faltan };
    if (!document.getElementById('informe_texto')) return { listo:false, por:'sin informe_texto' };
    if (!document.getElementById('vmax_ao')) return { listo:false, por:'sin vmax_ao' };
    return { listo:true,
             tieneEaApagarAuto: typeof window._eaApagarAuto === 'function',
             tieneIaApagarAuto: typeof window._iaApagarAuto === 'function',
             tieneEmApagarAuto: typeof window._emApagarAuto === 'function',
             pares: (function(){ try { return Object.keys(window._EA_PARES).length } catch(e){ return 'EXC' } })() } }
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
  /* ⚠️ UN `alert`/`confirm` NATIVO BLOQUEA `Runtime.evaluate` Y LA SONDA PARECE COLGADA. Con el
     dominio Page habilitado, CDP avisa del dialogo y hay que CONTESTARLO; sin habilitarlo, Chrome
     lo muestra y el renderer se detiene. Se descartan y se CUENTAN, porque un dialogo inesperado
     en medio de una escena es un hallazgo, no ruido. */
  await cdp.send('Page.enable', {}, sessionId);
  const dialogos = [];
  cdp.alDialogo = (d) => { dialogos.push(d);
    cdp.send('Page.handleJavaScriptDialog', { accept: true }, sessionId).catch(() => {}); };
  const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
  await pausa(2200);

  /* ⚠️ `ev()` SIN RELOJ CUELGA PARA SIEMPRE, Y ESTA SONDA LO HIZO DOS VECES (2026-10-08). Si la
     pagina navega, el target muere o Chrome se va, la promesa de `cdp.send` no se resuelve NUNCA:
     ni error ni salida, el proceso vivo y el archivo de salida vacio a los diez minutos. Es la
     trampa de los `cdp.mjs` que no salen que CLAUDE.md documenta, con otra cara. Con reloj, un
     cuelgue se convierte en un fallo que DICE en que paso ocurrio. */
  const RELOJ = 75000;
  let _paso = '(arranque)';
  const paso = (n) => { _paso = n; if (VER || process.env.EAAP_TRAZA) console.error('  · ' + n); };
  async function ev(expr) {
    const r = await Promise.race([
      cdp.send('Runtime.evaluate',
        { expression: expr, returnByValue: true, awaitPromise: true }, sessionId),
      new Promise((_, no) => setTimeout(() => no(new Error(
        'CDP sin respuesta en ' + (RELOJ / 1000) + ' s — paso «' + _paso + '»')), RELOJ)),
    ]);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' :: ' + (r.exceptionDetails.exception || {}).description);
    return r.result.value;
  }
  /* ⚠️ UN CLIC DISPACHADO NO ES UN CLIC RECIBIDO, Y LA PRIMERA CORRIDA LO INFORMO COMO OK. Las
     coordenadas del centro de la pastilla caian sobre OTRO nodo —el `.valv-lesion` que la envuelve
     y la tapa— asi que los eventos llegaban, el boton no se movia, y las escenas 4, 5 y 8 median
     «no se apaga» sobre un gesto que nunca ocurrio: el defecto correcto por la razon equivocada,
     indistinguible de un hallazgo falso. Por eso se pregunta `elementFromPoint` ANTES y, si el
     punto esta tapado, se activa con TECLA REAL (foco + Enter), que en un <button> es una
     activacion nativa y no un `.click()` sintetico. */
  /* ⚠️ SIN `revelar` RECURSIVO ACA, Y ES POR MEDICION: la version con el bucle de `revelar` se
     llamaba a si misma sobre el control que hay que abrir, y ese control podia volver a pedir otro
     —o volver a cerrar el mismo, porque es un TOGGLE— asi que la recursion no tenia tope real y la
     corrida se colgo (dos procesos a los 10 minutos, sin una sola escena escrita). Los nodos que
     esta sonda clickea ya estan a la vista: `abrirTodo` lo confirma y ABORTA si no. Si uno no tiene
     geometria, se informa y no se inventa un camino. */
  async function clicEn(id) {
    const c = await ev(`window.__P.centro(${JSON.stringify(id)})`);
    if (!c || c.err) return { via: 'NO SE PUDO', por: c ? c.err : 'no existe' };
    const q = await ev(`JSON.stringify(window.__P.quienEsta(${JSON.stringify(id)}, ${c.x}, ${c.y}))`);
    const quien = JSON.parse(q);
    if (quien.esElBlanco) {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await pausa(140);
      return { via: 'mouse', punto: c, quien };
    }
    await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)}); if (e) e.focus(); return 1 })()`);
    const foco = await ev(`(document.activeElement && document.activeElement.id) || '<' + (document.activeElement ? document.activeElement.tagName.toLowerCase() : '?') + '>'`);
    await tecla('Enter', null);
    await pausa(140);
    return { via: 'tecla Enter', punto: c, quien, foco };
  }
  /* ══ TECLAS REALES ══ una por caracter, con el `text` SOLO en el `char`. */
  async function enfocar(id) {
    let rev = await ev(`window.__P.revelar(${JSON.stringify(id)})`);
    for (let i = 0; i < 4 && rev && rev.necesitaClic; i++) {
      await clicEn(rev.necesitaClic);
      rev = await ev(`window.__P.revelar(${JSON.stringify(id)})`);
    }
    const c = await ev(`window.__P.centro(${JSON.stringify(id)})`);
    if (c && !c.err) {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
    }
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)}); if(e) e.focus(); return 1 })()`);
    return c && c.err ? ('foco-dom (' + c.err + ')') : 'clic';
  }
  /* ⚠️ UNA TECLA DE EDICION NO ES UN CARACTER, Y SIN `windowsVirtualKeyCode` NO BORRA NADA.
     La primera corrida mando `{type:'keyDown', key:'Backspace'}` pelado: los eventos llegaban, el
     campo NO cambiaba, y la sonda informo «borrar la Vmax deja el G. max en 64» sobre un campo que
     seguia diciendo 4 — o sea el defecto correcto por la razon equivocada, que es indistinguible de
     un hallazgo falso. Blink ejecuta el comando de edicion por el keycode, no por `key`, y hace
     falta `rawKeyDown` (un `keyDown` sin `char` detras no dispara el comando). */
  const VK = { Backspace: 8, Delete: 46, Tab: 9, Enter: 13, End: 35, Home: 36 };
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
  /* Tipea DESDE VACIO (select() para que la primera tecla pise lo que hubiera). */
  async function tipear(id, valor) {
    const via = await enfocar(id);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(!e) return 0; e.focus(); try{ e.select() }catch(x){} return 1 })()`);
    /* ⚠️ `End` ANTES DE CADA CARACTER MENOS EL PRIMERO, Y LAS DOS MITADES ESTAN MEDIDAS.
       (a) Hace falta: en `ea_vmax`, tipear «4.5» dejaba «54». El `oninput` de esa casilla corre
           `eaParEditado` → `calcAo` → `sincronizarEADesdeGlobal`, que le reasigna `.value` al
           campo ENFOCADO, y asignar `.value` a un `input[type=number]` con foco MANDA EL CARET
           AL PRINCIPIO: el «.» caia en posicion 0 —invalido, descartado— y el «5» quedaba
           delante del «4».
       (b) Y NO VA EN EL PRIMERO: `End` DESELECCIONA lo que `select()` acaba de seleccionar y
           deja el caret al final, asi que el tecleo APENDA en vez de reemplazar. Puesto en los
           tres caracteres, re-tipear «1.4» sobre «4.5» dejo **«4.514»**, y con esa Vmax el
           grado calculado seguia siendo «severa»: el A/B informo «el grado no vuelve al
           centinela» y «la pastilla no se apaga» sobre una escena que nunca ocurrio. Era un
           defecto de la SONDA leido como una conducta de la app, y encima en el sentido que
           hacia parecer inutil el arreglo que esta tanda agrega. */
    let _prim = true;
    for (const ch of String(valor)) {
      if (!_prim) await tecla('End', null);
      await tecla(ch, ch);
      _prim = false;
    }
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
    await pausa(90);
    const quedo = await ev(`window.__P.val(${JSON.stringify(id)})`);
    return { via, pedido: String(valor), quedo: String(quedo),
             ok: String(quedo) === String(valor) };
  }
  /* BORRA CON BACKSPACE, digito por digito, leyendo despues de cada tecla. */
  async function borrarConBackspace(id, foto) {
    const via = await enfocar(id);
    /* ⚠️ `setSelectionRange` LANZA en un `input[type=number]` —no soporta seleccion— y el `try`
       la tragaba, asi que el caret quedaba donde estuviera. Al enfocar por clic el caret cae donde
       se clickeo; para que el Backspace muerda desde el final se enfoca y se manda `End`. */
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)}); if(e) e.focus(); return 1 })()`);
    await tecla('End', null);
    const pasos = [];
    for (let i = 0; i < 12; i++) {
      const v0 = await ev(`window.__P.val(${JSON.stringify(id)})`);
      if (v0 === '' || v0 === null) break;
      /* ⚠️ EL FOCO SE VERIFICA ANTES DE CADA TECLA, Y ESTO ESTA MEDIDO. En el bloque G —borrar
         sobre un estudio REABIERTO— la corrida de HEAD gasto las doce iteraciones con el campo
         clavado en «4» mientras la de NEW lo vacio en tres: parecia que la restauracion reponia
         el valor en cada Backspace, o sea un hallazgo gordo sobre el informe firmado. No era
         eso: `editarInforme` le roba el foco al campo, asi que de la tercera tecla en adelante
         el Backspace se iba a otro nodo y el valor quedaba quieto. Un campo que no cambia con el
         foco perdido es indistinguible de un campo que alguien repone. Se reenfoca si hace
         falta y el nodo enfocado va EN el paso, al lado del valor. */
      let foc = await ev(`(document.activeElement && document.activeElement.id) || '<' + (document.activeElement ? document.activeElement.tagName.toLowerCase() : '?') + '>'`);
      let reenfoco = null;
      if (foc !== id) {
        reenfoco = await enfocar(id);
        await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)}); if(e) e.focus(); return 1 })()`);
        await tecla('End', null);
        foc = await ev(`(document.activeElement && document.activeElement.id) || '<?>'`);
      }
      await tecla('Backspace', null);
      await pausa(70);
      pasos.push({ tras: i + 1, foco: foc, reenfoco: reenfoco,
                   campo: await ev(`window.__P.val(${JSON.stringify(id)})`),
                   ...(foto ? JSON.parse(await ev(`JSON.stringify(window.__P.${foto}())`)) : {}) });
    }
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('change',{bubbles:true})); e.blur() } return 1 })()`);
    await pausa(120);
    return { via, pasos };
  }

  await ev(`try{sessionStorage.setItem('ett_auth','1')}catch(e){}; location.reload(); 1`);
  await pausa(2600);
  await ev(SONDA);
  const listo = await ev(`JSON.stringify(window.__P.abrirTodo())`);


  /* ⚠️ EL AVISO LEGAL TAPA LA PAGINA ENTERA Y SE COME TODOS LOS CLICS, Y ASI TODA ESCENA DE CLIC QUEDA
     SIN VALOR (medido en la mitral). `#modalAvisoEco` es un `position:fixed;inset:0` con
     `z-index:9999`: `elementFromPoint` sobre el centro de la pastilla devolvia `modalAvisoEco` y no
     la pastilla, asi que el clic de mouse llegaba al overlay —y el respaldo por tecla tampoco
     cambiaba el boton—. La sonda informaba «clic ok» y las escenas decian «NO se apaga» sobre un
     gesto que nunca ocurrio: el defecto correcto por la razon equivocada. Se cierra con su propio
     boton, como lo cierra el medico, y se COMPRUEBA que se fue antes de medir nada. */
  const avisoBtn = await ev(`(function(){
    var m = document.getElementById('modalAvisoEco');
    if (!m) return 'NO EXISTE';
    if (getComputedStyle(m).display === 'none') return 'ya cerrado';
    var b = Array.from(m.querySelectorAll('button')).find(function(x){
      return /cerrarAvisoEco/.test(x.getAttribute('onclick') || '') });
    if (!b) return 'SIN BOTON';
    if (!b.id) b.id = '__avisoOk';
    return b.id })()`);
  const avisoClic = (avisoBtn && avisoBtn.indexOf('__aviso') === 0) ? await clicEn(avisoBtn) : avisoBtn;
  await pausa(300);
  const avisoCerrado = await ev(`(function(){ var m = document.getElementById('modalAvisoEco');
    return m ? getComputedStyle(m).display : 'NO EXISTE' })()`);
  /* DENOMINADOR DURO: con el overlay puesto, ninguna escena de clic significa nada. */
  const tapa = JSON.parse(await ev(`JSON.stringify(window.__P.quienEsta('pill-esten-aortica',
    (window.__P.centro('pill-esten-aortica')||{x:0}).x, (window.__P.centro('pill-esten-aortica')||{y:0}).y))`));
  /* ⚠️ EL AVISO APARECE TARDE Y LA ASERCION DE ARRANQUE SE DISPARABA ANTES DE QUE NADIE PUDIERA
     DESPEJARLO. Medido: la corrida de A lo encontro 'ya cerrado' y la de B, 'flex' — el mismo
     arbol, el mismo archivo, dos corridas seguidas. Es la trampa que CLAUDE.md documenta para
     TC-395. No se aborta sin intentar: se despeja por estilo (lo que cada escena hace igual en
     su `base()`) y SOLO se aborta si sobrevive a eso, porque ahi si ningun clic llegaria. */
  let avisoFinal = avisoCerrado;
  let avisoDespejado = null;
  if (avisoCerrado !== 'none' && avisoCerrado !== 'NO EXISTE') {
    avisoDespejado = JSON.parse(await ev(`(function(){
      var r = {};
      ['modalAvisoEco','login-overlay'].forEach(function(id){
        var m = document.getElementById(id);
        if (!m) { r[id] = 'NO EXISTE'; return }
        var d = getComputedStyle(m).display;
        if (d !== 'none') { m.style.display = 'none'; r[id] = 'estaba ' + d + ' → despejado' }
        else { r[id] = 'none' }
      });
      return JSON.stringify(r) })()`));
    await pausa(200);
    avisoFinal = await ev(`(function(){ var m = document.getElementById('modalAvisoEco');
      return m ? getComputedStyle(m).display : 'NO EXISTE' })()`);
    if (avisoFinal !== 'none' && avisoFinal !== 'NO EXISTE') {
      throw new Error('EL AVISO LEGAL SIGUE PUESTO (' + avisoFinal + ') — ningun clic llegaria al arbol');
    }
  }

  const out = { archivo: FARG, listo: JSON.parse(listo), aviso: { boton: avisoBtn, clic: avisoClic,
    display: avisoCerrado, despejadoPorEstilo: avisoDespejado, displayFinal: avisoFinal,
    quienTapaLaPastilla: tapa } };
  const hacer = (k) => !SOLO || SOLO === k;

  /* ══ HELPERS DE ESCENA ════════════════════════════════════════════════════════════════════ */
  const foto   = async () => JSON.parse(await ev(`JSON.stringify(window.__P.fotoEA())`));
  const fotoIA = async () => JSON.parse(await ev(`JSON.stringify(window.__P.fotoIA())`));
  const campos = async () => JSON.parse(await ev(`JSON.stringify(window.__P.fotoCampos())`));
  const otras  = async () => JSON.parse(await ev(`JSON.stringify(window.__P.fotoOtras())`));
  /* ⚠️ LOS DOS OVERLAYS SE DESPEJAN DENTRO DEL MEDIDOR Y NO UNA VEZ AL ARRANQUE. CLAUDE.md lo
     documenta medido dos veces: `#modalAvisoEco` (z-index 9999) y `#login-overlay`
     (2147483000) VUELVEN a mitad de corrida, y con cualquiera de los dos puesto
     `elementFromPoint` devuelve ESE nodo, asi que un clic se informa dado sin haber ocurrido.
     Se devuelve el estado de los dos para que vaya al lado del veredicto. */
  const despejar = async () => JSON.parse(await ev(`(function(){
    var r = {};
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (!m) { r[id] = 'NO EXISTE'; return }
      var d = getComputedStyle(m).display;
      if (d !== 'none') { m.style.display = 'none'; r[id] = 'estaba ' + d + ' → despejado' }
      else { r[id] = 'none' }
    });
    return JSON.stringify(r) })()`));
  const base = async () => {
    await ev(`(function(){ window.__P.limpiar(); return 1 })()`);
    const ov = await despejar();
    const d = JSON.parse(await ev(`JSON.stringify(window.__P.abrirTodo())`));
    if (!d.ok) throw new Error('DENOMINADOR: los campos de la aortica no tienen geometria: ' + JSON.stringify(d));
    return { ...d, overlays: ov };
  };
  /* ⚠️ TIPEAR EN `vmax_ao` SE LLEVA LA PESTANA, Y ASI TRES ESCENAS DE LA PRIMERA CORRIDA NO
     MIDIERON NADA. `vmax_ao` vive en el DOPPLER, asi que `enfocar` → `revelar` llama a
     `showTab('doppler')`; desde ahi la pastilla de Valvulas esta en un `#tab-valvulas` con
     `display:none` y `centro()` devuelve «nodo sin geometria». El clic salia
     `via: NO SE PUDO` y las escenas 6, 7 y 8 informaban «no se apaga» / «no se reprende»
     sobre un gesto que nunca ocurrio — el veredicto correcto por la razon equivocada, que es
     indistinguible de un hallazgo falso. Se vuelve a Valvulas ANTES de cada clic y se
     VERIFICA la geometria del blanco, informandola al lado del clic. */
  const aValvulas = async (id) => {
    const r = JSON.parse(await ev(`JSON.stringify(window.__P.abrirTodo())`));
    const ov = await despejar();
    const c = await ev(`JSON.stringify(window.__P.centro(${JSON.stringify(id)}))`);
    return { abrirTodo: r, overlays: ov, geometria: JSON.parse(c) };
  };
  /* El informe en los TRES estilos mas el EN SUMA, acotado a la aortica, con el control
     negativo de las otras tres valvulas al lado. */
  const textos = async () => {
    const o = {};
    for (const est of ['conciso', 'estandar', 'narrativo']) {
      const r = JSON.parse(await ev(`JSON.stringify(window.__P.informe(${JSON.stringify(est)}))`));
      o[est] = {
        ao:    JSON.parse(await ev(`JSON.stringify(window.__P.frasesAO(${JSON.stringify(r.inf)}))`)),
        otras: JSON.parse(await ev(`JSON.stringify(window.__P.frasesOtras(${JSON.stringify(r.inf)}))`)),
      };
      if (est === 'estandar') {
        o.suma       = JSON.parse(await ev(`JSON.stringify(window.__P.sumaAO(${JSON.stringify(r.suma)}))`));
        o.sumaOtras  = JSON.parse(await ev(`JSON.stringify(window.__P.sumaOtras(${JSON.stringify(r.suma)}))`));
        o.sumaEntero = r.suma;
      }
    }
    return o;
  };

  /* ══ A — LA TABLA PASTILLA x DATO DE LA ESTENOSIS AORTICA, CON TECLAS REALES ═══════════════
     Los cortes salen de `EA_BANDAS.vmax`, no de memoria: 4,5 m/s cae en la banda de Infinity
     ⇒ 'severa', y 1,4 m/s cae por debajo de 2,0 ⇒ 'sin', que es el centinela del `<select>`.
     Se tipea en `vmax_ao` (Doppler) y no en `ea_vmax` (Valvulas) porque con la pastilla
     APAGADA el bloque de Valvulas esta en display:none y su casilla no tiene geometria — o sea
     que el gesto «prender la pastilla tipeando un dato» solo existe del lado del Doppler. */
  if (hacer('A')) {
    const A = {};

    /* 1-2-3 — LA CADENA COMPLETA: sin dato → con dato → corregido a normal. Van juntas porque
       el estado de cada paso es el resultado del anterior; separarlas mediria tres estudios. */
    {
      const e = {};
      try {
        paso('A1 base sin dato');     e.denominador = await base();
        e.p1_sinDato = await foto();
        e.p1_textos  = await textos();
        paso('A2 tipeo vmax 4,5');    e.tipeo45 = await tipear('vmax_ao', '4.5');
        e.p2_conDato = await foto();
        e.p2_textos  = await textos();
        paso('A3 retipeo vmax 1,4');  e.retipeo14 = await tipear('vmax_ao', '1.4');
        e.p3_corregido = await foto();
        e.p3_textos    = await textos();
      } catch (x) { e.FALLO = String(x.message || x); }
      A['1-2-3 sin dato · Vmax 4,5 prende · corregido a 1,4 → ?'] = e;
    }
    /* 4 — DATO VACIADO con Backspace. Es un caso DISTINTO del de arriba y hay que medirlo
       aparte: sin Vmax, `eaGradoCalculado` devuelve `grado: null` y `clasificarEA_Vmax` sale
       por su `if (R.grado)`, asi que el grado NO vuelve al centinela: se queda en 'severa'.
       Es la regla 12 de la casa («borrar un dato no retira una afirmacion»). */
    {
      const e = {};
      try {
        paso('A4 base vaciado');      e.denominador = await base();
        e.tipeo45 = await tipear('vmax_ao', '4.5');
        e.conDato = await foto();
        paso('A4 backspace vmax_ao'); e.borrado = await borrarConBackspace('vmax_ao', 'fotoEA');
        e.p4_vacio  = await foto();
        e.p4_textos = await textos();
      } catch (x) { e.FALLO = String(x.message || x); }
      A['4 Vmax vaciada con Backspace → ?'] = e;
    }
    /* 5 — PRENDIDA A MANO SIN DATO: el Set no la tiene, asi que nada la puede apagar. */
    {
      const e = {};
      try {
        paso('A5 base prendida a m'); e.denominador = await base();
        e.antesDelClic = await foto();
        paso('A5 clic pastilla');     e.vuelta = await aValvulas('pill-esten-aortica');
        e.clic = await clicEn('pill-esten-aortica');
        e.trasClic  = await foto();
        e.p5_textos = await textos();
      } catch (x) { e.FALLO = String(x.message || x); }
      A['5 prendida A MANO sin dato → NO se apaga'] = e;
    }
    /* 6 — PRENDIDA A MANO CON DATO que no gradua, y despues se borra el dato. */
    {
      const e = {};
      try {
        paso('A6 base a mano c/dat'); e.denominador = await base();
        e.tipeo14 = await tipear('vmax_ao', '1.4');
        e.antesDelClic = await foto();
        paso('A6 clic pastilla');     e.vuelta = await aValvulas('pill-esten-aortica');
        e.clic = await clicEn('pill-esten-aortica');
        e.trasClic = await foto();
        paso('A6 backspace');         e.borrado = await borrarConBackspace('vmax_ao', 'fotoEA');
        e.p6_final  = await foto();
        e.p6_textos = await textos();
      } catch (x) { e.FALLO = String(x.message || x); }
      A['6 prendida A MANO con Vmax 1,4 · se borra el dato → NO se apaga'] = e;
    }
    /* 7 — APAGADA A MANO con la Vmax severa cargada: no se reprende, ni al retipear. */
    {
      const e = {};
      try {
        paso('A7 base apagada a ma'); e.denominador = await base();
        e.tipeo45 = await tipear('vmax_ao', '4.5');
        e.appPrendio = await foto();
        paso('A7 clic apaga');        e.vuelta = await aValvulas('pill-esten-aortica');
        e.clicApaga = await clicEn('pill-esten-aortica');
        e.trasApagar = await foto();
        /* ⚠️ APAGAR LA PASTILLA ESCONDE EL BLOQUE de Valvulas; el retipeo va al campo del
           DOPPLER, que no depende de la pastilla, asi que el gesto ocurre igual. Se declara
           el estado del bloque al lado. */
        e.retipeo50 = await tipear('vmax_ao', '5.0');
        e.p7_final  = await foto();
        e.p7_textos = await textos();
      } catch (x) { e.FALLO = String(x.message || x); }
      A['7 apagada A MANO con Vmax 4,5 → NO se reprende'] = e;
    }
    /* 8 — GRADO ELEGIDO EN LA PASTILLA (clic real en el ▼ y en la opcion) y despues el dato
       se corrige a normal: el grado del medico sobrevive y el boton no se apaga. */
    {
      const e = {};
      try {
        paso('A8 base grado ▼');      e.denominador = await base();
        e.tipeo45 = await tipear('vmax_ao', '4.5');
        e.appPrendio = await foto();
        paso('A8 clic menu');         e.vuelta = await aValvulas('sevbtn-esten-aortica');
        e.clicMenu = await clicEn('sevbtn-esten-aortica');
        e.opciones = JSON.parse(await ev(`JSON.stringify(window.__P.menuOpts('sevmenu-esten-aortica'))`));
        const mod = (e.opciones || []).find((o) => /moderada/i.test(o.txt));
        e.opcionElegida = mod || null;
        if (mod) e.clicOpcion = await clicEn(mod.id);
        e.trasElegir = await foto();
        e.retipeo14  = await tipear('vmax_ao', '1.4');
        e.p8_final   = await foto();
        e.p8_textos  = await textos();
      } catch (x) { e.FALLO = String(x.message || x); }
      A['8 grado elegido en la pastilla ▼ · dato corregido → NO se apaga'] = e;
    }
    /* 9 — EL VAIVEN: 4,5 prende · 1,4 · 4,5 otra vez. Es la pregunta de «el auto-prendido se
       gasta en un solo uso», que es el defecto que `_etApagarAuto` y `_epApagarAuto` ya
       pagaron en sus valvulas: la clave de localStorage queda en '0' y para
       `valvAutoPrenderEsten` eso significa «el medico lo cerro a mano». */
    {
      const e = {};
      try {
        paso('A9 base vaiven');       e.denominador = await base();
        e.tipeo45  = await tipear('vmax_ao', '4.5');
        e.v1_45    = await foto();
        e.retipeo14 = await tipear('vmax_ao', '1.4');
        e.v2_14    = await foto();
        e.retipeo45 = await tipear('vmax_ao', '4.5');
        e.v3_45    = await foto();
        e.v3_textos = await textos();
      } catch (x) { e.FALLO = String(x.message || x); }
      A['9 vaiven 4,5 → 1,4 → 4,5 · vuelve a prenderse?'] = e;
    }
    /* 10 — CONTROL NEGATIVO DEL AUTO-APAGADO: el gradiente medio de 45 mmHg mantiene el grado
       'severa' (EA_BANDAS.gmedSevMin = 40) aunque la Vmax se corrija a 1,4. La pastilla NO
       debe apagarse, porque el grado NO volvio al centinela. Sin esta escena, «se apaga
       cuando desaparece la causa» no se distingue de «se apaga siempre». */
    {
      const e = {};
      try {
        paso('A10 base ctrl negat');  e.denominador = await base();
        e.tipeo45   = await tipear('vmax_ao', '4.5');
        e.tipeoGmed = await tipear('gmedio_ao', '45');
        e.conLosDos = await foto();
        e.retipeo14 = await tipear('vmax_ao', '1.4');
        e.p10_final = await foto();
        e.p10_textos = await textos();
      } catch (x) { e.FALLO = String(x.message || x); }
      A['10 CONTROL NEGATIVO: G. medio 45 sostiene el grado · Vmax a 1,4 → NO se apaga'] = e;
    }
    /* 11 — «Nuevo estudio» con la pastilla prendida por la app. */
    {
      const e = {};
      try {
        paso('A11 nuevo estudio');    e.denominador = await base();
        e.tipeo45 = await tipear('vmax_ao', '4.5');
        e.appPrendio = await foto();
        e.nuevo = await ev(`(function(){ try { nuevoEstudio() } catch(x) { return 'EXC: ' + x.message }
          return 'llamado' })()`);
        await pausa(260);
        e.modalVisible = await ev(`(function(){ var m = document.getElementById('modal-nuevo-estudio');
          return m ? getComputedStyle(m).display : 'NO EXISTE' })()`);
        e.botonesModal = JSON.parse(await ev(`(function(){
          var m = document.getElementById('modal-nuevo-estudio'); if (!m) return JSON.stringify([]);
          return JSON.stringify(Array.from(m.querySelectorAll('button')).map(function(b,i){
            if (!b.id) b.id = '__nm_' + i;
            return { id: b.id, onclick: b.getAttribute('onclick') || '', txt: (b.textContent||'').trim() } })) })()`));
        const desc = (e.botonesModal || []).find((b) => /neContinuarSinGuardar/.test(b.onclick));
        if (desc) { e.clicDescartar = await clicEn(desc.id); await pausa(600); }
        else { e.clicDescartar = 'NO HAY BOTON neContinuarSinGuardar — el modal no se abrio'; }
        e.p11_final = await foto();
      } catch (x) { e.FALLO = String(x.message || x); }
      A['11 «Nuevo estudio» con la pastilla prendida por la app'] = e;
    }
    out.A = A;
  }

  /* ══ I — LA PASTILLA DE INSUFICIENCIA AORTICA: quien la prende y si hay dueno ══════════════
     Mide el ESTADO, no afirma un arreglo. Tres preguntas: (1) el calculo de la IAo prende la
     pastilla por su cuenta?; (2) si la prende `valvAutoAbrirCajones` al entrar a la pestana,
     queda registrado un dueno en algun Set?; (3) el grado de la IAo puede volver al centinela
     '0' cuando se borran sus datos? */
  if (hacer('I')) {
    const I = {};
    {
      const e = {};
      try {
        paso('I1 vc severa');         e.denominador = await base();
        e.antes = await fotoIA();
        /* Vena contracta de 8 mm: un solo voto SEVERO, que con `scores.severa >= 1` da '4'. */
        e.tipeoVc = await tipear('ia_vc', '8');
        e.conDato = await fotoIA();
        e.fotoEA  = await foto();
        paso('I1 borrado vc');        e.borrado = await borrarConBackspace('ia_vc', 'fotoIA');
        e.sinDato = await fotoIA();
        e.textos  = await textos();
      } catch (x) { e.FALLO = String(x.message || x); }
      I['1 VC 8 mm → grado 4 · borrada → el grado vuelve al centinela?'] = e;
    }
    {
      const e = {};
      try {
        paso('I2 abrir cajones');     e.denominador = await base();
        e.tipeoVc = await tipear('ia_vc', '8');
        e.trasDato = await fotoIA();
        /* El camino de apertura automatica al ENTRAR a la pestana: se sale a otra y se vuelve,
           que es el gesto del medico. Despues se mira si quedo dueno registrado. */
        e.saleYVuelve = await ev(`(function(){ try { showTab('doppler'); showTab('valvulas') }
          catch(x) { return 'EXC: ' + x.message } return 'ok' })()`);
        await pausa(260);
        e.trasVolver = await fotoIA();
        e.eaTrasVolver = await foto();
      } catch (x) { e.FALLO = String(x.message || x); }
      I['2 apertura automatica al entrar a Valvulas · queda dueno?'] = e;
    }
    out.I = I;
  }

  /* ══ B — BORRAR QUEDA BORRADO: los cinco campos hermanos por CADA lugar de origen ══════════
     Cada fila: se tipea desde un lugar, se confirma que llego a los otros, se BORRA con
     Backspace desde ese mismo lugar y se mira si volvio solo; al lado, los calculados.

     ⚠️ EL ESTADO «BLOQUE CERRADO» NO EXISTE EN LA PC, Y LA PRIMERA VERSION DE ESTE BLOQUE LO
     INVENTO. Poner `bloque-ea-detalle.style.display = 'none'` NO lo cierra: a mas de 768 px el
     CSS lo fuerza con `#bloque-ea-detalle { display: block !important }`, asi que las quince
     filas «CERRADO» describian el arbol ABIERTO y el veredicto se apoyaba en un denominador
     falso. Lo delato el propio informe del campo `cerrado`, que decia «block».
     Los dos estados reales son:
       · PC (1200 px) — el bloque esta SIEMPRE abierto por CSS; no hay nada que plegar, y la
         flecha «Datos ▾» esta en `display:none !important`.
       · CELULAR (390 px) — el bloque arranca CERRADO (`display:none !important`) y lo unico que
         lo abre es la clase `valv-datos-abierto`, que pone `valvDatosTog`, que es el gesto del
         medico. Por eso se abre con `valvDatosTog` y no escribiendo el `display`.
     Con el bloque cerrado las casillas del lado Valvulas NO TIENEN GEOMETRIA y no se pueden
     tipear —es un hecho de la app, no un hueco de la sonda—: esas filas se declaran saltadas y
     lo que la escena mide ahi es la pregunta que si importa, «borrar desde el Doppler llega a
     las casillas de Valvulas con el bloque plegado?». */
  if (hacer('B')) {
    const B = {};
    const FILAS = [
      { dato: 'Vmax',      puertas: ['vmax_ao', 'ea_vmax'],       valor: '4.5' },
      { dato: 'G. medio',  puertas: ['gmedio_ao', 'ea_gmedio'],   valor: '45' },
      { dato: 'VTI TSVI',  puertas: ['itv_tsvi', 'ea_vtitsvi'],   valor: '20' },
      { dato: 'VTI Ao',    puertas: ['itv_ao', 'ea_vtiao'],       valor: '60' },
      { dato: 'Diam TSVI', puertas: ['diam_tsvi_ao', 'ea_dtsvi'], valor: '22' },
    ];
    const ESCENARIOS = [
      { tag: 'PC 1200px (abierto por CSS)',  w: 1200, abrir: false },
      { tag: 'CEL 390px bloque ABIERTO',     w: 390,  abrir: true  },
      { tag: 'CEL 390px bloque CERRADO',     w: 390,  abrir: false },
    ];
    for (const esc of ESCENARIOS) {
      await cdp.send('Emulation.setDeviceMetricsOverride',
        { width: esc.w, height: 900, deviceScaleFactor: 1, mobile: esc.w <= 430 }, sessionId);
      await pausa(320);
      for (const fila of FILAS) {
        for (const puerta of fila.puertas) {
          const k = `${fila.dato} · origen ${puerta} · ${esc.tag}`;
          const e = {};
          try {
            paso(`B ${k}`);
            /* `base()` exige geometria de los cinco campos del bloque, y a 390 px con el bloque
               cerrado eso no se cumple: se limpia y se despeja sin esa asercion, y el
               denominador que se informa es el del propio escenario. */
            await ev(`(function(){ window.__P.limpiar(); return 1 })()`);
            e.overlays = await despejar();
            e.abrirTodo = JSON.parse(await ev(`JSON.stringify(window.__P.abrirTodo())`));
            if (esc.abrir) {
              e.datosTog = await ev(`(function(){
                var c = document.getElementById('caja-esten-aortica');
                if (!c) return 'NO EXISTE caja-esten-aortica';
                if (!c.classList.contains('valv-datos-abierto')) { try { valvDatosTog('caja-esten-aortica') } catch(x) { return 'EXC: ' + x.message } }
                return c.classList.contains('valv-datos-abierto') ? 'abierto' : 'NO ABRIO' })()`);
            } else {
              e.datosTog = await ev(`(function(){
                var c = document.getElementById('caja-esten-aortica');
                if (!c) return 'NO EXISTE caja-esten-aortica';
                if (c.classList.contains('valv-datos-abierto')) { try { valvDatosTog('caja-esten-aortica') } catch(x) { return 'EXC: ' + x.message } }
                return c.classList.contains('valv-datos-abierto') ? 'NO CERRO' : 'cerrado' })()`);
            }
            /* ⚠️ LA VISIBILIDAD SE PREGUNTA DESPUES DE `revelar`, NO ANTES, y la primera version
               lo hizo al revés: las cinco puertas del DOPPLER salieron «saltadas» en los dos
               estados porque se las miraba estando en la pestana de Valvulas, donde
               `#tab-doppler` esta en `display:none`. `revelar` es lo que hace el `showTab`, que
               es lo que hace el medico al ir a cargar el dato. */
            /* `revelar` SOLO no alcanza: las cuatro casillas del Doppler aortico viven dentro
               del acordeon `#dop-aortico`, asi que devuelve `necesitaClic` y la primera version
               las declaro «saltadas» en los tres escenarios — cuatro de las cinco filas sin
               medir, con el informe diciendo «sin geometria» sobre campos perfectamente
               alcanzables. `enfocar` es el que corre el bucle de `revelar` + clic, que es lo que
               hace el medico: entrar a la pestana y abrir el cajon. */
            e.revelar  = JSON.parse(await ev(`JSON.stringify(window.__P.revelar(${JSON.stringify(puerta)}))`));
            e.preparar = await enfocar(puerta);
            const visible = await ev(`window.__P.vis(${JSON.stringify(puerta)})`);
            e.puertaVisible = visible;
            e.bloqueDisplay = await ev(`(function(){ var d = document.getElementById('bloque-ea-detalle');
              return d ? getComputedStyle(d).display : 'NO EXISTE' })()`);
            if (visible !== true) { e.saltada = 'la puerta no tiene geometria en este estado'; B[k] = e; continue; }
            e.tipeo      = await tipear(puerta, fila.valor);
            e.trasTipear = await campos();
            e.borrado    = await borrarConBackspace(puerta, 'fotoCampos');
            e.trasBorrar = await campos();
            e.otras      = await otras();
          } catch (x) { e.FALLO = String(x.message || x); }
          B[k] = e;
        }
      }
    }
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    out.B = B;
  }

  /* ══ S — LAS SUPERFICIES EN LA ESCENA DEL ARREGLO, UNA POR UNA ═══════════════════════════
     El A/B del bloque A ya compara informe y EN SUMA. Esto cierra lo que queda del punto 3 de
     la verificacion con el estado EXACTO en que la pastilla se auto-apaga (Vmax 4,5 y despues
     1,4), que es la unica escena donde los dos arboles difieren:
       · los 1087 campos guardados, VALOR POR VALOR y no por recuento —un recuento igual con
         dos valores cambiados dice «identico» y no prueba nada—;
       · la fila del Excel con sus 434 columnas, tambien valor por valor;
       · la franja del PPT;
       · la fila del Laboratorio de la estenosis aortica.
     ⚠️ POR QUE NO SE CAPTURA EL PDF: lo arma jsPDF por CDN y en esta red no se alcanza —es lo
     que pone en rojo el denominador de TC-358—. El argumento que lo cubre es estructural y se
     midio leyendo el codigo: de los 39 lectores de pillOn, NINGUNO es un emisor de PDF, PPT,
     Excel o Laboratorio; el unico que lee la pastilla es generarInforme. Y ea_grado, que si
     leen esas cuatro superficies, vale sin en los DOS arboles en esta escena. */
  if (hacer('S')) {
    const S = {};
    try {
      paso('S base + Vmax 4,5 → 1,4'); S.denominador = await base();
      S.tipeo45   = await tipear('vmax_ao', '4.5');
      S.retipeo14 = await tipear('vmax_ao', '1.4');
      S.foto      = await foto();
      /* ⚠️ LOS 14 `cc-txt-*` SE DECLARAN APARTE: los crea `ccHojaBuild` en `DOMContentLoaded`,
         asi que estar o no en el barrido es una CARRERA del ciclo de vida de la pagina y no una
         diferencia del arbol. La primera corrida de este bloque dio 1087 contra 1073 y las 14
         diferencias eran exactamente esas claves, vacias en los dos lados. Se informan por
         separado para que el total que se compara no las incluya. */
      S.ccPresentes = await ev(`(function(){ return !!document.getElementById('cc-txt-wrap') })()`);
      S.campos    = JSON.parse(await ev(`JSON.stringify(window.__P.campos())`));
      S.excel     = JSON.parse(await ev(`JSON.stringify(window.__P.excel())`));
      /* ⚠️ EL PPT SE MIDE POR `_pptSel` Y NO LLAMANDO AL GENERADOR, y es la medicion correcta
         y no un atajo. El generador es `_pptDesdeFormulario`, que necesita PptxGenJS por CDN
         —inalcanzable en esta red— y arma la presentacion entera. Lo que de la AORTICA entra a
         la franja de hallazgos es `_pptSel('ea_grado')`: esa funcion devuelve el TEXTO de la
         opcion cuando el nodo es un `<select>`, que es el «empate fragil» que este repo ya
         documenta para la IT. Se miden las tres claves aorticas que el PPT lee. */
      S.ppt       = await ev(`(function(){
        try {
          if (typeof _pptSel !== 'function') return 'SIN _pptSel';
          return JSON.stringify({ ea_grado: _pptSel('ea_grado'), ia_grado: _pptSel('ia_grado'),
                                  va_morf: _pptSel('va_morf') });
        } catch(e) { return 'EXC: ' + e.message } })()`);
      S.lab       = await ev(`(function(){
        try { if (typeof _labEstenSev !== 'function') return 'SIN _labEstenSev';
          return JSON.stringify({ ea: _labEstenSev('ea_grado'), em: _labEstenSev('em_grado') });
        } catch(e) { return 'EXC: ' + e.message } })()`);
    } catch (x) { S.FALLO = String(x.message || x); }
    out.S = S;
  }

  /* ══ G — ESTUDIO GUARDADO: la restauracion repone un valor que el medico borro? ══════════
     Es la pregunta 3c de la orden. `aoEspejosRestaurar` ESTA en `RECALC_MODULOS` —el embudo de
     las rutas de restauracion— asi que un espejo repuesto podria devolver un campo borrado.
     Se mide con el gesto completo: cargar, guardar, borrar un hermano, guardar otra vez,
     reabrir; y la variante que importa, guardar CON el dato y borrarlo DESPUES de reabrir.
     Esta seccion NO cambia como abre un estudio: solo lo mira. */
  if (hacer('G')) {
    const G = {};
    /* G1 — se guarda con los cinco datos, se reabre, se borra la Vmax y se vuelve a reabrir. */
    {
      const e = {};
      try {
        paso('G1 guardar completo'); e.denominador = await base();
        e.nombre = await tipear('nombre', 'Prueba EA G1');
        e.vmax   = await tipear('vmax_ao', '4.5');
        e.gmed   = await tipear('gmedio_ao', '45');
        e.itsvi  = await tipear('itv_tsvi', '20');
        e.itvao  = await tipear('itv_ao', '60');
        e.dtsvi  = await tipear('diam_tsvi_ao', '22');
        e.alGuardar = await campos();
        e.guardo = JSON.parse(await ev(`(async function(){ return JSON.stringify(await window.__P.guardarDeVerdad()) })()`));
        await pausa(700);
        e.lista = JSON.parse(await ev(`JSON.stringify(window.__P.guardados())`));
        const id = (e.lista || []).length ? e.lista[e.lista.length - 1].id : null;
        e.idUsado = id;
        if (id === null) { e.saltada = 'no quedo ningun estudio guardado'; G['1 guardar · borrar · reabrir'] = e; }
        else {
          paso('G1 reabrir');
          e.reabrio1 = await ev(`(function(){ try { editarInforme(${JSON.stringify(String(id))}) }
            catch(x) { return 'EXC: ' + x.message } return 'llamado' })()`);
          await pausa(900);
          await despejar();
          e.trasReabrir1 = await campos();
          paso('G1 borrar la Vmax');
          e.borrado = await borrarConBackspace('vmax_ao', 'fotoCampos');
          e.trasBorrar = await campos();
          /* Y se vuelve a guardar y a reabrir: si la restauracion repone, aca se ve. */
          e.guardo2 = JSON.parse(await ev(`(async function(){ return JSON.stringify(await window.__P.guardarDeVerdad()) })()`));
          await pausa(700);
          e.lista2 = JSON.parse(await ev(`JSON.stringify(window.__P.guardados())`));
          const id2 = (e.lista2 || []).length ? e.lista2[e.lista2.length - 1].id : null;
          e.idUsado2 = id2;
          e.reabrio2 = await ev(`(function(){ try { editarInforme(${JSON.stringify(String(id2))}) }
            catch(x) { return 'EXC: ' + x.message } return 'llamado' })()`);
          await pausa(900);
          await despejar();
          e.trasReabrir2 = await campos();
          e.fotoEA = await foto();
          G['1 guardar · borrar · reabrir'] = e;
        }
      } catch (x) { e.FALLO = String(x.message || x); G['1 guardar · borrar · reabrir'] = e; }
    }
    out.G = G;
  }

  /* ══ N — CONTROL NEGATIVO: las otras tres valvulas con escenario CARGADO ═══════════════════
     Sin datos, las tres salen apagadas y en su centinela por el estado de fabrica, asi que el
     control no tendria DENOMINADOR: diria «identicas» sobre tres conjuntos vacios. */
  if (hacer('N')) {
    const N = {};
    try {
      paso('N base cargada');
      N.denominador = await base();
      N.siembra = JSON.parse(await ev(`(function(){
        var r = {};
        [['avm_plan','1.2'],['em_gmedio','12'],['ia_vc','8'],['vmax_it','3.0'],
         ['it_vc','8'],['vp_vmax','4.0'],['ip_vmax','2.0']].forEach(function(p){
          r[p[0]] = window.__P.set(p[0], p[1]) });
        return JSON.stringify(r) })()`));
      await pausa(300);
      N.otras  = await otras();
      N.textos = await textos();
      N.excel  = await ev(`(function(){ var f = window.__P.excel();
        return (f && typeof f === 'object') ? Object.keys(f).length : f })()`);
      N.campos = await ev(`(function(){ return Object.keys(window.__P.campos()).length })()`);
    } catch (x) { N.FALLO = String(x.message || x); }
    out.N = N;
  }

  out.consola = cdp.errores ? cdp.errores.slice(0, 20) : 'sin listener';
  out.dialogos = dialogos;

  const despues = await md5(join(RAIZ, 'index.html'));
  out.md5_antes = antes; out.md5_despues = despues; out.index_intacto = antes === despues;
  console.log(JSON.stringify(out, null, 2));
  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
