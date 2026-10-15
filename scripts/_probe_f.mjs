#!/usr/bin/env node
/**
 * _probe_f.mjs — sonda A/B de SOLO LECTURA para la tanda «F» (2026-10-15), que tiene DOS bloques
 * independientes:
 *   F1 — el VSFVI AUTOMATICO y el VOLUMEN LATIDO AUTOMATICO del ventriculo izquierdo (pestaña
 *        AI/VI), los dos de solo lectura, sin sigla «QS» en sus rotulos, y el GASTO CARDIACO del
 *        PDF publicado SOLO con frecuencia cardiaca cargada y con la FC que realmente se uso.
 *   F2 — la fila «AVA indexada» del cuadro de referencias de la estenosis aortica de la pestaña
 *        Valvulas publica SU GRADO, y la linea integrada dice CUAL criterio decide.
 *
 * Grupos (--solo vol|gc|avai|controles):
 *   vol       — la tabla «campo automatico -> valor -> esperado» por sus once escenas, con los
 *               tres insumos tipeados y borrados con TECLAS REALES, mas el censo de «QS».
 *   gc        — el PDF GENERADO de verdad (interceptando jsPDF) con FC, sin FC y con una FC
 *               fuera de banda.
 *   avai      — los tres tramos del AVA indexada con el AVA por continuidad en rango moderado,
 *               sus tres controles negativos, el color del grado en los DOS temas y la captura.
 *   controles — informe (tres estilos), EN SUMA, Excel, PPT, Laboratorio, grados y pastillas de
 *               las ocho lesiones, diastolica y HFA-PEFF, con un escenario CARGADO y vacio.
 *
 * No muta index.html: comprueba su md5 al principio y al final.
 *
 *   node scripts/_probe_f.mjs --file /tmp/index.HEAD.html > /tmp/f.HEAD.json
 *   node scripts/_probe_f.mjs                             > /tmp/f.NEW.json
 *   node scripts/_probe_f.mjs --solo avai --dest /tmp/capt
 *
 * Infraestructura calcada de scripts/_probe_w2b.mjs y scripts/_probe_labem.mjs (teclas y clics
 * reales, cierre del arbol de Chrome por PID PROPIO, reloj sobre ev(), aviso legal despejado con
 * su denominador, md5 al principio y al final, jsPDF interceptado).
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
/* --dest <dir>: si esta, el grupo `avai` guarda el PNG del cuadro de referencias en los dos temas. */
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
    return { w: Math.round(r.width), h: Math.round(r.height), ok: r.width > 0 && r.height > 0 } },
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

  /* ⚠️ DENOMINADOR. La tarjeta del VI es un ACORDEON que nace CERRADO (aria-expanded="false"):
     sin abrirlo, los tres campos que esta sonda tipea no tienen caja, focus() falla EN SILENCIO
     y la escena mide un tecleo que nunca ocurrio. Lo que abre el acordeon es secToggle('vi'),
     que necesita el id del card SIN el prefijo sacc-. */
  abrirTodo() {
    try { showTab('ai-vi') } catch(e) {}
    var acc = document.getElementById('sacc-vi');
    if (acc && !acc.classList.contains('open')) { try { secToggle('vi') } catch(e) {} }
    return { tab: window.__P.vis('tab-ai-vi'),
             vdfvi: window.__P.geo('vdfvi'), vsfvi: window.__P.geo('vsfvi'),
             fevi: window.__P.geo('fevi'), vol_lat: window.__P.geo('vol_lat'),
             auto1: window.__P.geo('vauto-vsfvi'), auto2: window.__P.geo('vauto-vol-lat'),
             ok: window.__P.geo('vdfvi').ok && window.__P.geo('vsfvi').ok && window.__P.geo('fevi').ok } },

  /* Abre Valvulas y el cajon de la estenosis aortica, para el grupo F2. */
  abrirValv() {
    try { showTab('valvulas') } catch(e) {}
    ['valv-aortica'].forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && getComputedStyle(s).display === 'none') { try { toggleEteSeccion(tok) } catch(e) {} }
    });
    ['caja-esten-aortica'].forEach(function(cid){
      try { var c = document.getElementById(cid);
        if (c && !c.classList.contains('valv-datos-abierto')) valvDatosTog(cid);
      } catch(e) {}
    });
    var d = document.getElementById('bloque-ea-detalle');
    if (d && getComputedStyle(d).display === 'none') d.style.display = 'block';
    return { tab: window.__P.vis('tab-valvulas'), avai: window.__P.geo('ea-det-avai'),
             sev: window.__P.geo('ea-det-sev'),
             ok: window.__P.geo('ea-det-avai').ok && window.__P.geo('ea-det-sev').ok } },

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

  /* ══ F1: LA FOTO DE LOS DOS AUTOMATICOS ══════════════════════════════════════════════════
     Se leen el VALUE y el PLACEHOLDER juntos: un campo vacio con el placeholder vacio es un
     campo mudo —el defecto D2-4— y leer solo el value no lo distingue de uno que si dice que
     le falta. El renglon de origen va al lado, que es lo que «el campo dice cual uso» publica. */
  fotoVol() {
    return {
      vdfvi:  window.__P.val('vdfvi'),
      vsfvi:  window.__P.val('vsfvi'),
      fevi:   window.__P.val('fevi'),
      vol_lat:window.__P.val('vol_lat'),
      autoVsf:   window.__P.val('vauto-vsfvi'),
      autoVsfPh: window.__P.ph('vauto-vsfvi'),
      autoVl:    window.__P.val('vauto-vol-lat'),
      autoVlPh:  window.__P.ph('vauto-vol-lat'),
      fuente:    window.__P.txt('vauto-vol-lat-fuente'),
      roVsf:  window.__P.ro('vauto-vsfvi'),
      roVl:   window.__P.ro('vauto-vol-lat'),
      vsfIdx: window.__P.txt('vsfvi-idx-interp'),
      vdfIdx: window.__P.txt('vdfvi-idx-interp'),
      feviInterp: window.__P.txt('fevi-interp')
    } },

  /* ⚠️ NINGUNO DE LOS DOS VIAJA. Se mide por el recolector REAL (_noEsDelEstudio), no por una
     lista escrita a mano: lo que se afirma es que el juego de claves guardadas no gana ninguna. */
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
    var k = Object.keys(c).sort(), s = '';
    for (var i=0;i<k.length;i++) s += k[i] + '=' + String(c[k[i]]) + '|';
    var h = 0; for (var j=0;j<s.length;j++) { h = ((h<<5)-h) + s.charCodeAt(j); h |= 0 }
    return { n: k.length, hash: String(h),
             vauto: k.filter(function(x){ return x.indexOf('vauto-') === 0 }) } },

  excel() {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    try { var r = _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-15',
            campos: window.__P.campos() });
      var k = Object.keys(r).sort(), s = '';
      for (var i=0;i<k.length;i++) s += k[i] + '=' + String(r[k[i]]) + '|';
      var h = 0; for (var j=0;j<s.length;j++) { h = ((h<<5)-h) + s.charCodeAt(j); h |= 0 }
      return { cols: k.length, hash: String(h) };
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
      pills: (function(){ var o = {};
        ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
          ['esten','insuf'].forEach(function(t){ o[t + '-' + v] = window.__P.pill(v,t) }) });
        return o })()
    } },
  /* La franja de hallazgos del PPT sale de _pptSel, que es un const de MODULO y no vive en
     window: no se puede llamar desde aca. Lo que _pptSel devuelve para un <select> es el TEXTO
     de la opcion seleccionada, asi que se mide ESO —que es su insumo exacto— para los ocho
     grados. Un cambio de la franja del PPT sin cambio en esta foto no es alcanzable. */
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
    return o },
  lab() { try { return (typeof _labEstenSev === 'function')
      ? _labEstenSev({ campos: window.__P.campos(), informe_texto:
          (document.getElementById('informe_texto')||{}).value || '' }, 'ea_grado') : 'SIN FN' }
    catch(e) { return 'EXC' } },

  /* ══ F2: LA FILA DEL AVA INDEXADA, SU GRADO Y LA LINEA INTEGRADA ══════════════════════════
     El grado va en un <span> HERMANO sin id —el patron de las nueve filas de la IM del 13/10—,
     asi que el textContent de ea-det-avai NO cambia: por eso se leen los dos por separado. */
  fotoEA() {
    var gr = document.querySelector('[data-grado-de="ea-det-avai"]');
    var R = null; try { R = eaGradoCalculado() } catch(e) { R = { err: e.message } }
    return {
      ava_cont: window.__P.val('ava_cont'),
      detAva:   window.__P.txt('ea-det-ava'),
      detAvai:  window.__P.txt('ea-det-avai'),
      gradoAvai: gr ? (gr.textContent || '').trim() : 'NO EXISTE SPAN',
      detDvi:   window.__P.txt('ea-det-dvi'),
      detSev:   window.__P.txt('ea-det-sev'),
      badge:    window.__P.txt('ea-ava-badge'),
      refAvai:  window.__P.txt('ao-ref-avai'),
      avaIdxOculto: window.__P.txt('ava-idx'),
      ea_grado: window.__P.val('ea_grado'),
      bsa: (function(){ try { return getBSA() } catch(e) { return 'EXC' } })(),
      R: (R && !R.err) ? { grado:R.grado, criterio:R.criterio, gAva:R.gAva, gAvai:R.gAvai,
                           gDvi:R.gDvi, gVel:R.gVel, gGrad:R.gGrad, avai:R.avai } : R
    } },

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
  recorte(sel) {
    var e = (sel.charAt(0) === '#') ? document.getElementById(sel.slice(1))
                                    : document.querySelector(sel);
    if (!e) return { err: 'NO EXISTE ' + sel };
    e.scrollIntoView({ block: 'center', inline: 'center' });
    var caja = e.closest('.calc-box') || e;
    var r = caja.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return { err: 'sin geometria' };
    return { x: Math.max(0, Math.round(r.left + window.scrollX) - 6),
             y: Math.max(0, Math.round(r.top + window.scrollY) - 6),
             width: Math.round(r.width) + 12, height: Math.round(r.height) + 12 } },

  /* ══ F1 (6): EL PDF GENERADO DE VERDAD ═══════════════════════════════════════════════════
     Se intercepta el constructor de jsPDF y se registra cada doc.text: lo que se mide es lo que
     el papel IMPRIME. ⚠️ jsPDF llega por CDN y a veces no llega: se informa «sin jsPDF» en vez
     de medir un PDF vacio, porque un A/B contra una corrida sin libreria compara una tabla que
     no se dibujo contra una que si. */
  esperarJspdf(ms) {
    var t0 = Date.now();
    return new Promise(function(res){
      (function tic(){
        if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) return res(true);
        if (Date.now() - t0 > (ms || 12000)) return res(false);
        setTimeout(tic, 250);
      })();
    }) },
  armarPdf() {
    if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) return Promise.resolve({ err: 'sin jsPDF' });
    if (typeof generarPDFReal !== 'function') return Promise.resolve({ err: 'sin generarPDFReal' });
    var reg = [];
    var Orig = window.jspdf.jsPDF;
    function Espia() {
      var d = new Orig(arguments[0], arguments[1], arguments[2]);
      var t = d.text.bind(d);
      d.text = function(txt) { try { reg.push(String(txt)) } catch (e) {} return t.apply(d, arguments) };
      d.save = function(){ try { window.__P._uri = d.output('datauristring') } catch (e) {} return d };
      return d;
    }
    Espia.prototype = Orig.prototype;
    window.jspdf.jsPDF = Espia;
    return Promise.resolve().then(function(){ return generarPDFReal() })
      .then(function(){ return { ok: true, lineas: reg } })
      .catch(function(e){ return { err: 'EXC: ' + e.message, lineas: reg } })
      .then(function(r){ window.jspdf.jsPDF = Orig;
        r.uri = window.__P._uri || null; window.__P._uri = null;
        /* Las filas de la tabla compacta se estampan como «rotulo (ref): valor», asi que el
           renglon del GC se busca por su prefijo y se devuelve COMPLETO. */
        r.gc = (r.lineas || []).filter(function(s){ return /(^|[^A-Za-z])GC\\b/.test(s) });
        r.ic = (r.lineas || []).filter(function(s){ return /(^|[^A-Za-z])IC\\b/.test(s) });
        r.vs = (r.lineas || []).filter(function(s){ return s.indexOf('Vol. sist') === 0 });
        r.n  = (r.lineas || []).length;
        return r });
  },

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
  const paso = (n) => { _paso = n; if (VER || process.env.F_TRAZA) console.error('  . ' + n); };
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
  /* ⚠️ DENOMINADOR DE ARRANQUE: la tarjeta del VI es un acordeon cerrado, asi que sin abrirlo
     ningun tecleo de esta sonda ocurre. Se ABORTA nombrando lo que falto. */
  const listo = await J('window.__P.abrirTodo()');
  if (!listo.ok) throw new Error('ABORTA: el acordeon del VI no quedo abierto: ' + JSON.stringify(listo));

  const out = { file: FARG, md5Ini, avisoIni, listo, grupos: {} };
  const SOLOG = (arg('--solo') || '').split(',').map((s) => s.trim()).filter(Boolean);
  const corre = (g) => !SOLOG.length || SOLOG.indexOf(g) >= 0;

  /* ── vol ── LOS DOS AUTOMATICOS DEL VI, con TECLAS REALES por sus tres insumos ─────────── */
  if (corre('vol')) {
    paso('vol');
    const g = { escenas: {} };
    /* Montaje: peso, talla y sexo NO son el gesto medido —no entran en ninguna de las dos
       cuentas— asi que van por set(). Los TRES insumos van con teclas reales. */
    const escVol = async (nom, o, extra) => {
      await J('window.__P.limpiar()');
      const listo = await J('window.__P.abrirTodo()');
      if (!listo.ok) throw new Error('ABORTA: el acordeon del VI no quedo abierto: ' + JSON.stringify(listo));
      await J('window.__P.set("peso", 80)');
      await J('window.__P.set("talla", 180)');
      await J('window.__P.set("sexo", "M")');
      const tecleos = [];
      for (const id of ['vdfvi', 'fevi', 'vsfvi']) {
        if (o[id] === undefined) continue;
        tecleos.push(await tipear(id, o[id]));
      }
      if (extra) await extra();
      await pausa(120);
      g.escenas[nom] = { tecleos, foto: await J('window.__P.fotoVol()') };
      return g.escenas[nom].foto;
    };
    await escVol('completo',      { vdfvi: '140', fevi: '60' });
    await escVol('conManual',     { vdfvi: '140', fevi: '60', vsfvi: '60' });
    await escVol('sinFevi',       { vdfvi: '140' });
    await escVol('sinVdfvi',      { fevi: '60' });
    await escVol('vacio',         {});
    await escVol('soloManual',    { vdfvi: '140', vsfvi: '60' });
    /* La FEVI fuera de su banda [5,90] no produce un automatico: vPlaus().val es null. */
    await escVol('feviFuera',     { vdfvi: '140', fevi: '95' });
    /* Y el VSFVI manual en LITROS tampoco vota en la resta: cae al automatico. */
    await escVol('manualFuera',   { vdfvi: '140', fevi: '60', vsfvi: '0.06' });
    /* VSFVI manual MAYOR que el VDFVI: volumen eyectado negativo, no se publica. */
    await escVol('manualMayor',   { vdfvi: '140', vsfvi: '200' });
    /* Borrado con teclas reales de cada insumo, desde la escena completa. */
    await escVol('borraVdfvi',    { vdfvi: '140', fevi: '60', vsfvi: '60' },
      async () => { g.borrVdfvi = await borrar('vdfvi'); });
    await escVol('borraFevi',     { vdfvi: '140', fevi: '60' },
      async () => { g.borrFevi = await borrar('fevi'); });
    await escVol('borraManual',   { vdfvi: '140', fevi: '60', vsfvi: '60' },
      async () => { g.borrManual = await borrar('vsfvi'); });
    /* ⚠️ NUNCA Backspace sobre un campo de SOLO LECTURA: se declara que los dos lo son y que la
       sonda se niega a borrarlos. */
    g.noSeBorran = { vsf: await borrar('vauto-vsfvi'), vl: await borrar('vauto-vol-lat') };
    /* El censo de «QS» en los rotulos VISIBLES del arbol vivo, que es el punto (3) de F1. */
    g.censoQS = await J('(function(){ var o=[];'
      + ' document.querySelectorAll("label").forEach(function(l){'
      + '   var t=(l.textContent||"").trim(); if (/QS/.test(t)) o.push(t.slice(0,80)) });'
      + ' return { n:o.length, rotulos:o } })()');
    out.grupos.vol = g;
  }

  /* ── gc ── EL GASTO CARDIACO DEL PDF, con y sin frecuencia cardiaca ───────────────────── */
  if (corre('gc')) {
    paso('gc');
    const g = {};
    g.jspdf = await ev('window.__P.esperarJspdf(12000)');
    const escGC = async (nom, fc) => {
      await J('window.__P.limpiar()');
      /* Montaje del gasto: el GC del PDF lee `diam_tsvi` y `itv_tsvi` directo. O TSVI 20 mm da
         area 3,1416 cm2 y con VTI 20 cm el volumen sistolico es 62,83 ml. */
      await J('window.__P.set("peso", 80)');
      await J('window.__P.set("talla", 180)');
      await J('window.__P.set("nombre", "F-GC")');
      await J('window.__P.set("diam_tsvi", 20)');
      await J('window.__P.set("itv_tsvi", 20)');
      if (fc !== null) { g['tecleo_' + nom] = await tipear('hemo_fc', String(fc)); }
      await pausa(150);
      const pdf = await J('window.__P.armarPdf()');
      delete pdf.lineas; delete pdf.uri;
      g[nom] = { fcCampo: await ev('window.__P.val("hemo_fc")'),
                 vs: await ev('window.__P.val("vs_calc")'),
                 pdf };
      return g[nom];
    };
    await escGC('sinFC', null);
    await escGC('conFC', 72);
    await escGC('otraFC', 110);
    /* FC fuera de la banda [20,250]: el predicado `hemoFCUsable` la rechaza, asi que es el
       MISMO estado que «sin FC» — control negativo de que no vuelve a suponer 70. */
    await escGC('fcFuera', 300);
    out.grupos.gc = g;
  }

  /* ── avai ── LA FILA DEL AVA INDEXADA CON SU GRADO Y LA LINEA INTEGRADA ────────────────── */
  if (corre('avai')) {
    paso('avai');
    const g = { escenas: {} };
    /* ⚠️ ARITMETICA CERRADA. O TSVI 20 mm -> area pi = 3,1416 cm2. AVA = 3,1416 x VTI TSVI /
       VTI Ao. Peso 80 y talla 180 dan BSA 2,00 EXACTA, asi que el indexado es el AVA sobre dos.
       Las cuatro escenas dejan el AVA por CONTINUIDAD en rango MODERADO (>1,0 y <1,5) —el rango
       menos grave que pidio la orden— y mueven solo el indexado. */
    const escEA = async (nom, o) => {
      await J('window.__P.limpiar()');
      await ev('(function(){ try { if (!pillOn("aortica","esten")) toggleValvPill("aortica","esten") } catch(e){} return 1 })()');
      await J('window.__P.set("nombre", "F-EA")');
      await J('window.__P.set("peso", ' + o.peso + ')');
      await J('window.__P.set("talla", ' + o.talla + ')');
      await J('window.__P.set("diam_tsvi", 20)');
      await J('window.__P.set("itv_tsvi", 21)');
      await J('window.__P.set("itv_ao", ' + o.itvao + ')');
      if (o.vmax !== undefined) await J('window.__P.set("vmax_ao", ' + o.vmax + ')');
      if (o.morf) await J('window.__P.set("va_morf", ' + JSON.stringify(o.morf) + ')');
      const listo = await J('window.__P.abrirValv()');
      await pausa(180);
      g.escenas[nom] = { listo, foto: await J('window.__P.fotoEA()') };
      return g.escenas[nom].foto;
    };
    /* AVA 1,10 -> AVAi 0,55: ABAJO del corte severo (<=0,6). */
    await escEA('abajo',   { peso: 80, talla: 180, itvao: 60, vmax: 3.5 });
    /* AVA 1,20 -> AVAi 0,60 EXACTO: el borde, que la ESC/EACTS 2025 incluye en severa. */
    await escEA('enCorte', { peso: 80, talla: 180, itvao: 55, vmax: 3.5 });
    /* AVA 1,22 -> AVAi 0,61: un centesimo ARRIBA, pasa a moderada. */
    await escEA('arriba',  { peso: 80, talla: 180, itvao: 54, vmax: 3.5 });
    /* CONTROL NEGATIVO: mismo AVA 1,20 con BSA 1,29 -> AVAi 0,93, por encima de 0,85: el
       criterio SE ABSTIENE y la fila no puede publicar ningun grado. */
    await escEA('noGradua',{ peso: 40, talla: 150, itvao: 55, vmax: 3.5 });
    /* CONTROL NEGATIVO 2: con PROTESIS la fila NO publica un grado nativo (W1-4). */
    await escEA('protesis',{ peso: 80, talla: 180, itvao: 55, vmax: 3.5, morf: 'Prótesis biológica' });
    /* CONTROL NEGATIVO 3: sin AVA no hay fila ni grado. */
    await escEA('sinAva',  { peso: 80, talla: 180, itvao: '', vmax: 3.5 });

    /* El COLOR del grado nuevo en los DOS temas, con su control: la fila de al lado. */
    await escEA('enCorte', { peso: 80, talla: 180, itvao: 55, vmax: 3.5 });
    g.color = {};
    for (const claro of [false, true]) {
      const t = await J('window.__P.tema(' + (claro ? 'true' : 'false') + ')');
      if (t.claro !== t.tieneClase) throw new Error('ABORTA: la clase light-mode no quedo puesta');
      await pausa(120);
      g.color[claro ? 'claro' : 'oscuro'] = {
        tema: t,
        grado: await J('window.__P.color("[data-grado-de=\\"ea-det-avai\\"]")'),
        control: await J('window.__P.color("#ea-det-avai")'),
      };
      if (DEST) {
        const rec = await J('window.__P.recorte("#ea-det-avai")');
        if (!rec.err) {
          const shot = await cdp.send('Page.captureScreenshot', { format: 'png', clip:
            { x: rec.x, y: rec.y, width: rec.width, height: rec.height, scale: 2 } }, sessionId);
          const ruta = join(DEST, 'f_avai_' + (claro ? 'claro' : 'oscuro') + '.png');
          await writeFile(ruta, Buffer.from(shot.data, 'base64'));
          g.color[claro ? 'claro' : 'oscuro'].png = ruta;
        } else { g.color[claro ? 'claro' : 'oscuro'].png = rec.err; }
      }
    }
    await J('window.__P.tema(false)');
    out.grupos.avai = g;
  }

  /* ── controles ── NADA AJENO SE MUEVE, con un escenario CARGADO para que haya denominador ─ */
  if (corre('controles')) {
    paso('controles');
    const g = {};
    const escenaCompleta = async () => {
      await J('window.__P.limpiar()');
      await J('window.__P.set("nombre", "F-CTRL")');
      for (const [id, v] of [['peso', 80], ['talla', 180], ['sexo', 'M'], ['edad', 68],
        ['ddfvi', 52], ['dsfvi', 36], ['siv', 11], ['ppvi', 11],
        ['fevi', 60], ['vdfvi', 140], ['vsfvi', 60], ['vol_lat', 75], ['sgl', 18],
        ['ai_vol', 70], ['ai_diam', 40], ['ai_area', 22],
        ['diam_tsvi', 20], ['itv_tsvi', 21], ['itv_ao', 55], ['vmax_ao', 3.5], ['gmedio_ao', 30],
        ['hemo_fc', 72], ['onda_e', 90], ['onda_a', 60], ['e_sep', 6], ['e_lat', 8],
        ['tde', 180], ['triv', 90], ['lars', 20],
        ['im_vc', 5], ['avm_cont', 1.8], ['em_gmedio', 3],
        ['vmax_it', 3.0], ['tapse', 20], ['s_prime', 12],
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
      vol:    await J('window.__P.fotoVol()'),
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
                vol: await J('window.__P.fotoVol()'),
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

main().catch((e) => { console.error('[_probe_f] ' + (e && e.stack || e)); process.exit(1); });
