#!/usr/bin/env node
/**
 * _probe_eacortes.mjs — sonda A/B de SOLO LECTURA para los CORTES de la ESTENOSIS AORTICA.
 * No muta index.html: comprueba su md5 al principio y al final.
 *
 * Mide, con TECLAS REALES del navegador (Input.dispatchKeyEvent), que grado da cada VARIABLE
 * en cada BANDA, y que da la combinacion de dos variables bajo la regla vigente (el peor).
 *
 *   V — VMAX: los bordes de las cuatro bandas de la Tabla 3 de la EAE/ASE 2009 (p. 10).
 *   G — GRADIENTE MEDIO: leve, moderada y severa, con el borde de cada corte.
 *   D — DVI (indice adimensional, VTI TSVI / VTI Ao): severa, moderada y la banda que no vota.
 *   P — AVA POR PLANIMETRIA: el 0,9 del reporte del medico, y los tres bordes.
 *   X — AVA INDEXADA: derivada de AVA/ASC, con peso y talla cargados y sin ellos.
 *   C — COMBINACIONES de dos variables que dan grados distintos (la regla del peor).
 *   M — LOS TRES CASOS DEL MEDICO: gradiente medio, DVI 0,48 con AVA 1,5, planimetria 0,9.
 *   B — BORRADO con teclas reales de cada variable: la fila vuelve a «—», el grado se retira
 *       y la pastilla se apaga si la prendio la app.
 *   T — ESTENOSIS TRICUSPIDEA: los tres casos del area por continuidad, medidos en el arbol.
 *   N — CONTROL NEGATIVO: insuficiencias, estenosis mitral, pulmonar, funcion diastolica y
 *       el Excel con sus columnas, con escenario cargado para que el control tenga DENOMINADOR.
 *
 *   node scripts/_probe_eacortes.mjs --file /tmp/index.HEAD.html > /tmp/eac.HEAD.json
 *   node scripts/_probe_eacortes.mjs                             > /tmp/eac.NEW.json
 *   node scripts/_probe_eacortes.mjs --solo V --ver
 *
 * Infraestructura (servidor + Chrome + CDP + cierre del arbol de procesos + teclas reales)
 * calcada de scripts/_probe_eaapaga.mjs, que es la sonda del auto-apagado de esta misma valvula.
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-eacor-'));
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
             ava_plan: window.__P.vis('ava_plan'),
             pill: window.__P.vis('pill-esten-aortica'),
             pillInsuf: window.__P.vis('pill-insuf-aortica'),
             ok: window.__P.vis('ea_vmax') === true && window.__P.vis('ea_gmedio') === true &&
                 window.__P.vis('ea_vtitsvi') === true && window.__P.vis('ea_vtiao') === true &&
                 window.__P.vis('ava_plan') === true } },

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
      /* LOS CUATRO VOTANTES QUE ESTA TANDA TOCA, con su dato crudo al lado del grado, para que
         el veredicto no se lea sin el numero que lo produjo. */
      ava_plan: window.__P.val('ava_plan'), ava_plan_dop: window.__P.val('ava_plan_dop'),
      itv_tsvi: window.__P.val('itv_tsvi'), itv_ao: window.__P.val('itv_ao'),
      ava_idx: window.__P.txt('ava-idx'), ea_det_avai: window.__P.txt('ea-det-avai'),
      ea_det_dvi: window.__P.txt('ea-det-dvi'), ea_det_ava: window.__P.txt('ea-det-ava'),
      ea_det_sev: window.__P.txt('ea-det-sev'),
      /* EL CUADRO DE REFERENCIAS DE LA PESTANA DOPPLER — es lo que el medico llama
         «las referencias», y es donde los tres sintomas del reporte se ven. */
      ref: { vmax: window.__P.txt('ao-ref-vmax'), gmed: window.__P.txt('ao-ref-gmed'),
             ava: window.__P.txt('ao-ref-ava'), dvi: window.__P.txt('ao-ref-dvi'),
             plan: window.__P.txt('ao-ref-plan'), avai: window.__P.txt('ao-ref-avai'),
             sev: window.__P.txt('ea-sev') },
      /* EL DESGLOSE DEL DUENO UNICO: que voto cada criterio por separado. Sin esto, un grado
         que no cambia se lee como un corte que no esta cableado. */
      R: (function(){ try { var r = eaGradoCalculado();
             return { grado:r.grado, criterio:r.criterio, gVel:r.gVel, gGrad:r.gGrad,
                      gAva:r.gAva, gDvi:(r.gDvi === undefined ? 'SIN CAMPO' : r.gDvi),
                      gPlan:(r.gPlan === undefined ? 'SIN CAMPO' : r.gPlan),
                      gAvai:(r.gAvai === undefined ? 'SIN CAMPO' : r.gAvai),
                      dvi:(r.dvi === undefined ? 'SIN CAMPO' : r.dvi),
                      plan:(r.plan === undefined ? 'SIN CAMPO' : r.plan),
                      avai:(r.avai === undefined ? 'SIN CAMPO' : r.avai) } }
           catch(e) { return 'EXC ' + e.message } })(),
      eaAviso: window.__P.txt('ea-manual-aviso'),
      eaFundVis: window.__P.vis('ea-fund'),
      gradoVis: window.__P.vis('ea_grado'),
      sevManualEspejo: window.__P.val('sev_manual')
    } },

  /* LA FOTO DE LA ESTENOSIS TRICUSPIDEA: los tres insumos del area, el area, el grado y lo que
     el dueno unico (etEstado) dice de cada criterio. El area se lee del campo Y del estado:
     si los dos no coinciden, el pintor y la cuenta se separaron. */
  fotoET() {
    return {
      tsvd_diametro: window.__P.val('tsvd_diametro'), et_tsvd_diam: window.__P.val('et_tsvd_diam'),
      vti_tsvd: window.__P.val('vti_tsvd'), et_vti_tsvd: window.__P.val('et_vti_tsvd'),
      et_vti_diast: window.__P.val('et_vti_diast'),
      et_gmedio: window.__P.val('et_gmedio'), et_thp: window.__P.val('et_thp'),
      et_avt: window.__P.val('et_avt'), et_grado: window.__P.val('et_grado'),
      etSev: window.__P.txt('et-sev'),
      pill: window.__P.pill('tricuspide','esten'),
      E: (function(){ try { var e = etEstado();
             return { avt:e.avt, gm:e.gm, thp:e.thp, vtiD:e.vtiD, dTsvd:e.dTsvd, vtiTsvd:e.vtiTsvd,
                      cGm:e.cGm, cThp:e.cThp, cAvt:e.cAvt, signif:e.signif, hayDatos:e.hayDatos,
                      fuera:e.fuera, dOk:e.dOk, vtOk:e.vtOk, vtiOk:e.vtiOk } }
           catch(x) { return 'EXC ' + x.message } })(),
      /* EL RECALCULO A MANO, EN LA MISMA PAGINA: area del TSVD por PI*(D/20)^2, volumen
         sistolico por el VTI del TSVD, y el area tricuspidea por el VTI de ENTRADA. Si este
         numero y el del campo difieren, la formula de la app no es la que esta escrita aca. */
      aMano: (function(){
        var d = parseFloat(window.__P.val('tsvd_diametro'));
        var vt = parseFloat(window.__P.val('vti_tsvd'));
        var vd = parseFloat(window.__P.val('et_vti_diast'));
        if (!isFinite(d) || !isFinite(vt) || !isFinite(vd) || vd <= 0) return null;
        var area = Math.PI * Math.pow(d/20, 2);
        var sv = area * vt;
        return { areaTSVD: Math.round(area*10000)/10000, sv: Math.round(sv*100)/100,
                 avt: Math.round((sv/vd)*100)/100 } })()
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
  const paso = (n) => { _paso = n; if (VER || process.env.EACOR_TRAZA) console.error('  · ' + n); };
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
     que el gesto «prender la pastilla tipeando un dato» solo existe del lado del Doppler. */  /* ══ HELPERS PROPIOS DE ESTA TANDA ════════════════════════════════════════════════════════ */
  const fotoET = async () => JSON.parse(await ev(`JSON.stringify(window.__P.fotoET())`));
  /* Carga una escena con TECLAS REALES y ABORTA si un tecleo no quedo. Un tecleo que no ocurrio
     no es una medicion — esta sonda lo informa y no lo promedia con los que si ocurrieron. */
  const cargar = async (pares) => {
    const r = {};
    for (const [id, val] of pares) {
      const t = await tipear(id, val);
      r[id] = t;
      if (!t.ok) throw new Error('TECLEO NO QUEDO en ' + id + ': pedido ' + t.pedido + ', quedo ' + t.quedo);
    }
    await pausa(160);
    return r;
  };
  /* Una escena: limpia, carga, y devuelve la foto entera con el denominador al lado. */
  const escena = async (pares, opts) => {
    const e = {};
    e.denominador = await base();
    e.tecleo = await cargar(pares);
    if (opts && opts.recalc) await ev(`(function(){ try { calcAo() } catch(x){} try { calcEADetalle() } catch(x){} return 1 })()`);
    await pausa(140);
    e.foto = await foto();
    if (opts && opts.textos) e.textos = await textos();
    if (opts && opts.et) e.et = await fotoET();
    return e;
  };

  /* ══ V — VMAX: los bordes de las cuatro bandas ════════════════════════════════════════════
     Tabla 3 de la EAE/ASE 2009, p. 10 (folio verificado en el pie impreso), con el corte severo
     de la ESC/EACTS 2025, folio 4663 («Vmax >= 4.0 m/s»). Cada borde por sus DOS lados. */
  if (hacer('V')) {
    const V = {};
    for (const val of ['1.4', '2.0', '2.4', '2.5', '2.6', '2.9', '3.0', '3.9', '4.0', '4.5']) {
      const k = 'vmax ' + val;
      try { V[k] = await escena([['vmax_ao', val]]); }
      catch (x) { V[k] = { FALLO: String(x.message || x) }; }
    }
    out.V = V;
  }

  /* ══ G — GRADIENTE MEDIO: leve, moderada y severa ═════════════════════════════════════════
     Tabla 3, fila «Mean gradient (mmHg)», columna SIN superindice (AHA/ACC): <20 / 20-40 / >40.
     El corte severo se toma de la ESC/EACTS 2025, folio 4663: «mean gradient >= 40 mmHg». */
  if (hacer('G')) {
    const G = {};
    for (const val of ['8', '15', '19', '20', '25', '39', '40', '45', '60']) {
      const k = 'gmedio ' + val;
      try { G[k] = await escena([['gmedio_ao', val]], { textos: true }); }
      catch (x) { G[k] = { FALLO: String(x.message || x) }; }
    }
    out.G = G;
  }

  /* ══ D — DVI: el indice adimensional ══════════════════════════════════════════════════════
     Tabla 3, fila «Velocity ratio»: >0.50 / 0.25-0.50 / <0.25. La ESC/EACTS 2025 (folio 4663)
     publica solo el corte severo: «<0.25 suggests that severe AS is highly likely».
     El DVI no es un campo: es `itv_tsvi / itv_ao`, asi que cada escena carga los DOS VTI. El
     VTI TSVI se fija en 20 cm y lo que se mueve es el VTI aortico. */
  if (hacer('D')) {
    const D = {};
    /* dvi = 20/itvAo. 20/100=0.20 · 20/83=0.2410 · 20/80=0.25 · 20/50=0.40 · 20/40=0.50 ·
       20/39=0.5128 · 20/25=0.80 */
    for (const [itvAo, dvi] of [['100','0.20'], ['83','0.241'], ['80','0.25'], ['50','0.40'],
                                ['40','0.50'], ['39','0.513'], ['25','0.80']]) {
      const k = 'dvi ' + dvi + ' (VTI Ao ' + itvAo + ')';
      try { D[k] = await escena([['itv_tsvi', '20'], ['itv_ao', itvAo]], { textos: true }); }
      catch (x) { D[k] = { FALLO: String(x.message || x) }; }
    }
    out.D = D;
  }

  /* ══ P — AVA POR PLANIMETRIA ══════════════════════════════════════════════════════════════
     El 0,9 es el valor exacto del reporte del medico. Los otros son los bordes de la banda de
     AVA de la Tabla 3 y de la ESC/EACTS 2025 («AVA <= 1 cm2»), mas un valor FUERA de la banda
     de plausibilidad de la app (`ava_plan [0.2, 8]`) como control. */
  if (hacer('P')) {
    const P = {};
    for (const val of ['0.5', '0.9', '1.0', '1.01', '1.2', '1.49', '1.5', '2.0', '3.5', '12']) {
      const k = 'plan ' + val;
      try { P[k] = await escena([['ava_plan', val]], { textos: true }); }
      catch (x) { P[k] = { FALLO: String(x.message || x) }; }
    }
    out.P = P;
  }

  /* ⚠️ EL Ø TSVI SE TIPEA EN `diam_tsvi_ao` Y NO EN `diam_tsvi`, Y ESO ES UN DENOMINADOR.
     `diam_tsvi` vive en un `.fg` con `style="display:none"` desde que el campo se mudo a AI/VI:
     NO tiene geometria, asi que no es un campo que se pueda tipear. La primera corrida de esta
     sonda ABORTO en las dos escenas que lo usaban —que es lo que tiene que hacer— en vez de
     informar «sin cambios» sobre un AVA que nunca se calculo. Es la misma leccion que CLAUDE.md
     ya tiene escrita para `im_dtsvi` y `im_itv_tsvi`. */

  /* ══ X — AVA INDEXADA ═════════════════════════════════════════════════════════════════════
     Es un DERIVADO de `ava_cont / ASC`, asi que la escena carga los tres insumos del AVA y el
     peso y la talla. El control negativo es la misma escena SIN peso ni talla: sin ASC no hay
     AVA indexada y el criterio no puede votar.
     AVA = PI*(d/20)^2 * VTI_TSVI / VTI_Ao. Con d 20 y VTI TSVI 18 el numerador es 56,55. */
  if (hacer('X')) {
    const X = {};
    /* ASC (DuBois) con 70 kg / 170 cm = 1,81 m2; con 50 kg / 150 cm = 1,43 m2.
       VTI Ao 36 -> AVA 1,57 ; 45 -> 1,26 ; 55 -> 1,03 ; 71 -> 0,80 */
    const casos = [
      ['AVA 1.57 · ASC 1.81 · AVAi 0.87', [['peso','70'],['talla','170'],['diam_tsvi_ao','20'],['itv_tsvi','18'],['itv_ao','36']]],
      ['AVA 1.26 · ASC 1.81 · AVAi 0.70', [['peso','70'],['talla','170'],['diam_tsvi_ao','20'],['itv_tsvi','18'],['itv_ao','45']]],
      ['AVA 1.26 · ASC 1.43 · AVAi 0.88', [['peso','50'],['talla','150'],['diam_tsvi_ao','20'],['itv_tsvi','18'],['itv_ao','45']]],
      ['AVA 1.03 · ASC 1.81 · AVAi 0.57', [['peso','70'],['talla','170'],['diam_tsvi_ao','20'],['itv_tsvi','18'],['itv_ao','55']]],
      ['CONTROL sin peso ni talla (AVA 1.26)', [['diam_tsvi_ao','20'],['itv_tsvi','18'],['itv_ao','45']]],
    ];
    for (const [k, pares] of casos) {
      try { X[k] = await escena(pares, { textos: true }); }
      catch (x) { X[k] = { FALLO: String(x.message || x) }; }
    }
    out.X = X;
  }

  /* ══ C — COMBINACIONES: dos variables que dan grados DISTINTOS ════════════════════════════
     Es lo que prueba que la regla vigente —el PEOR— sigue siendo la que decide, y que una
     variable nueva puede AGRAVAR el grado sin poder suavizarlo. */
  if (hacer('C')) {
    const C = {};
    const casos = [
      ['Vmax 2.8 leve + G.medio 45 severa',       [['vmax_ao','2.8'], ['gmedio_ao','45']]],
      ['Vmax 4.5 severa + G.medio 25 moderada',   [['vmax_ao','4.5'], ['gmedio_ao','25']]],
      ['Vmax 2.8 leve + G.medio 25 moderada',     [['vmax_ao','2.8'], ['gmedio_ao','25']]],
      ['Vmax 2.8 leve + planimetria 0.9 severa',  [['vmax_ao','2.8'], ['ava_plan','0.9']]],
      ['Vmax 4.5 severa + planimetria 2.0',       [['vmax_ao','4.5'], ['ava_plan','2.0']]],
      ['G.medio 25 moderada + DVI 0.20 severa',   [['gmedio_ao','25'], ['itv_tsvi','20'], ['itv_ao','100']]],
      ['G.medio 45 severa + DVI 0.80',            [['gmedio_ao','45'], ['itv_tsvi','20'], ['itv_ao','25']]],
      ['planimetria 1.2 moderada + DVI 0.20 severa', [['ava_plan','1.2'], ['itv_tsvi','20'], ['itv_ao','100']]],
      /* ⚠️ CONTROL DE QUE LA FRASE DE DISCORDANCIA YA EXISTIA EN HEAD. `eaEscenario().esperado`
         es una SEGUNDA lectura del veredicto —mira el AVA y la pareja Vmax/gradiente y nada
         mas— asi que puede diferir del grado que el dueno unico escribe, y entonces el EN SUMA
         publica «el grado consignado no coincide con las mediciones» sobre un grado que la
         propia app acaba de calcular. Esta escena lo produce SIN NINGUNA variable de esta
         tanda: AVA 1,60 (que para `esperado` es «leve») con Vmax 3,5 (que para el dueno unico
         es «moderada»). Si sale igual en HEAD y en el arbol nuevo, la frase es PREEXISTENTE.
         AVA = PI*(20/20)^2*18/35.34 = 1.60 */
      ['CONTROL discordancia PREEXISTENTE: Vmax 3.5 + AVA 1.60',
       [['vmax_ao','3.5'], ['diam_tsvi_ao','20'], ['itv_tsvi','18'], ['itv_ao','35.34']]],
    ];
    for (const [k, pares] of casos) {
      try { C[k] = await escena(pares, { textos: true }); }
      catch (x) { C[k] = { FALLO: String(x.message || x) }; }
    }
    out.C = C;
  }

  /* ══ M — LOS TRES CASOS DEL MEDICO, textuales ═════════════════════════════════════════════ */
  if (hacer('M')) {
    const M = {};
    const casos = [
      /* (a) el gradiente medio en sus tres bandas */
      ['a1 · G.medio 15 (leve segun la tabla)',    [['gmedio_ao','15']]],
      ['a2 · G.medio 30 (moderada)',               [['gmedio_ao','30']]],
      ['a3 · G.medio 40 (borde severo)',           [['gmedio_ao','40']]],
      ['a4 · G.medio 45 (severa)',                 [['gmedio_ao','45']]],
      /* (b) DVI 0,48 con AVA por continuidad 1,5. AVA = PI*(20/20)^2*18/itvAo = 56.549/itvAo.
             Para AVA 1,50 hace falta itvAo = 37,7; y DVI = 18/37,7 = 0,4775. Para que el DVI de
             0,48 EXACTO con un AVA de 1,50 hay que mover el diametro, no el VTI: con VTI TSVI 18
             y VTI Ao 37,5 el DVI es 0,48 y el AVA PI*(d/20)^2*18/37,5 = 1,50 pide d = 19,93 mm.
             Se carga con los numeros que el medico tiene delante: el DVI y el AVA. */
      ['b · DVI 0.48 con AVA 1.50', [['peso','70'],['talla','170'],['diam_tsvi_ao','19.93'],['itv_tsvi','18'],['itv_ao','37.5']]],
      /* (c) planimetria 0,9 sola */
      ['c · planimetria 0.9',                      [['ava_plan','0.9']]],
      /* (d) el que el medico dice que YA funciona: AVA por continuidad por debajo de 1,5 */
      ['d · AVA continuidad 1.20 (control: ya funcionaba)', [['diam_tsvi_ao','20'],['itv_tsvi','18'],['itv_ao','47']]],
    ];
    for (const [k, pares] of casos) {
      try { M[k] = await escena(pares, { textos: true }); }
      catch (x) { M[k] = { FALLO: String(x.message || x) }; }
    }
    out.M = M;
  }

  /* ══ B — BORRADO CON TECLAS REALES, variable por variable ═════════════════════════════════
     La regla de la tanda anterior: al borrar un dato la fila vuelve a «—», el grado se retira y
     la pastilla se apaga SOLO si la prendio la app. Se mide con Backspace de verdad. */
  if (hacer('B')) {
    const B = {};
    const casos = [
      ['gmedio_ao 45 -> borrado',  [['gmedio_ao','45']],  'gmedio_ao'],
      ['ava_plan 0.9 -> borrado',  [['ava_plan','0.9']],  'ava_plan'],
      ['itv_ao 100 (DVI 0.20) -> borrado', [['itv_tsvi','20'],['itv_ao','100']], 'itv_ao'],
      ['vmax_ao 4.5 -> borrado',   [['vmax_ao','4.5']],   'vmax_ao'],
    ];
    for (const [k, pares, campo] of casos) {
      const e = {};
      try {
        e.denominador = await base();
        e.tecleo = await cargar(pares);
        e.conDato = await foto();
        e.textosConDato = await textos();
        e.borrado = await borrarConBackspace(campo, 'fotoEA');
        await pausa(200);
        e.trasBorrar = await foto();
        e.textosTrasBorrar = await textos();
      } catch (x) { e.FALLO = String(x.message || x); }
      B[k] = e;
    }
    out.B = B;
  }

  /* ══ T — ESTENOSIS TRICUSPIDEA: los tres casos del area por continuidad ═══════════════════
     Formula de la app: PI*(D/20)^2 * VTI_TSVD / VTI_entrada. Corte: area <= 1 cm2 (EAE/ASE 2009,
     Tabla 10, p. 19 — folio verificado en el pie impreso).
     ⚠️ `tsvd_diametro` y `vti_tsvd` viven en la pestana VD, no en Valvulas. */
  if (hacer('T')) {
    const T = {};
    const casos = [
      ['1 normal · D 25 · VTI TSVD 18 · VTI entrada 15',
       [['tsvd_diametro','25'],['vti_tsvd','18'],['et_vti_diast','15']]],
      ['2 ET significativa con el VTI de entrada de la guia (>60) · D 25 · VTI TSVD 14 · entrada 70',
       [['tsvd_diametro','25'],['vti_tsvd','14'],['et_vti_diast','70']]],
      ['3 el caso del medico · D 25 · VTI TSVD 3 · VTI entrada 15',
       [['tsvd_diametro','25'],['vti_tsvd','3'],['et_vti_diast','15']]],
      ['4 control · gradiente medio 6 solo (criterio independiente)',
       [['et_gmedio','6']]],
      ['5 control · THP 200 solo (criterio independiente)',
       [['et_thp','200']]],
    ];
    for (const [k, pares] of casos) {
      const e = {};
      try {
        e.denominador = await base();
        e.tecleo = await cargar(pares);
        await ev(`(function(){ try { calcET() } catch(x){} return 1 })()`);
        await pausa(160);
        e.et = await fotoET();
        e.textos = await textos();
      } catch (x) { e.FALLO = String(x.message || x); }
      T[k] = e;
    }
    out.T = T;
  }

  /* ══ N — CONTROL NEGATIVO: todo lo que esta tanda NO toca ═════════════════════════════════
     Con escenario CARGADO, porque sin datos las otras lesiones salen en su centinela por el
     estado de fabrica y el control diria «identicas» sobre conjuntos vacios. */
  if (hacer('N')) {
    const N = {};
    try {
      paso('N base cargada');
      N.denominador = await base();
      N.siembra = JSON.parse(await ev(`(function(){
        var r = {};
        [['avm_plan','1.2'],['em_gmedio','12'],['ia_vc','8'],['vmax_it','3.0'],
         ['it_vc','8'],['vp_vmax','4.0'],['ip_vmax','2.0'],['im_vc','5'],
         ['onda_e','90'],['onda_a','60'],['e_sept','6'],['e_lat','8'],['ai_vol','40'],
         ['peso','70'],['talla','170'],['fevi','60']].forEach(function(p){
          r[p[0]] = window.__P.set(p[0], p[1]) });
        return JSON.stringify(r) })()`));
      await pausa(400);
      N.otras  = await otras();
      N.textos = await textos();
      N.diastolica = await ev(`(function(){ var e = document.getElementById('dd-interp');
        return e ? (e.textContent||'').trim() : 'NO EXISTE' })()`);
      N.excelCols = await ev(`(function(){ var f = window.__P.excel();
        return (f && typeof f === 'object') ? Object.keys(f).length : f })()`);
      N.excelHash = await ev(`(function(){ var f = window.__P.excel();
        if (!f || typeof f !== 'object') return f;
        return Object.keys(f).sort().map(function(k){ return k + '=' + f[k] }).join('|') })()`);
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
