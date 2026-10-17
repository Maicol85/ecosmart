#!/usr/bin/env node
/**
 * _probe_val.mjs — sonda A/B de SOLO LECTURA para la tanda VAL (valvulas nativas, 2026-10-17).
 *
 * Mide las ocho escenas del prompt (gradiente 8 / THP 200 / area 0,8 / ningun criterio / las dos
 * discrepancias / apagado manual / sin datos) mas los controles negativos de las otras cuatro
 * lesiones, el round-trip de un estudio legado y la maquetacion en celular.
 * No muta index.html: comprueba su md5 al principio y al final.
 *
 *   node scripts/_probe_etbin.mjs --file /tmp/index.HEAD.html > /tmp/et.HEAD.json
 *   node scripts/_probe_etbin.mjs                             > /tmp/et.NEW.json
 *
 * Infraestructura (servidor + Chrome + CDP + SONDA) calcada de scripts/_probe_tricusp.mjs.
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
const SOLO = (arg('--solo') || '').split(',').map(x=>x.trim()).filter(Boolean);
const quiero = (g) => !SOLO.length || SOLO.indexOf(g) > -1;
/* Un `--file` absoluto (la copia de HEAD en /tmp) se sirve por un alias y el resto de los
   recursos sigue saliendo del repo: así la copia vieja ve los mismos scripts que la viva y la
   única variable del A/B es el HTML. */
const EXTERNO = isAbsolute(FARG);
const FILE = EXTERNO ? '__ab__' + basename(FARG) : FARG;

const CHROMES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
];
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css',
               '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml' };

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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-val-'));
  let bin = null;
  for (const c of CHROMES) { try { await readFile(c); bin = c; break; } catch {} }
  if (!bin) throw new Error('No encontre Chrome/Chromium/Edge.');
  const args = ['--remote-debugging-port=0', `--user-data-dir=${perfil}`, '--no-first-run',
                '--no-default-browser-check', '--disable-extensions',
                '--window-size=1280,1000', url];
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
    let id = 0; const pend = new Map();
    ws.addEventListener('open', () => res({
      send: (method, params = {}, sessionId) => new Promise((ok, no) => {
        const msg = { id: ++id, method, params };
        if (sessionId) msg.sessionId = sessionId;
        pend.set(msg.id, { ok, no });
        ws.send(JSON.stringify(msg));
      }),
      close: () => ws.close(),
    }));
    ws.addEventListener('error', rej);
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pend.has(m.id)) {
        const { ok, no } = pend.get(m.id); pend.delete(m.id);
        m.error ? no(new Error(m.error.message)) : ok(m.result);
      }
    });
  });
}

/* ══ Sonda inyectada ══════════════════════════════════════════════════════════════════════════
   ⚠️ CUERPO DE TEMPLATE LITERAL: ni un acento grave adentro, tampoco en los comentarios. */
const SONDA = `
window.__P = {
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  tag(id) { var e = document.getElementById(id); return e ? e.tagName : null },
  opts(id) { var e = document.getElementById(id);
    if (!e || !e.options) return null;
    return Array.prototype.map.call(e.options, function(o){ return o.value + '|' + o.textContent.trim() }) },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  pill(valv, tipo) { try { return (typeof pillOn === 'function') ? pillOn(valv, tipo) : 'SIN pillOn' }
    catch(e) { return 'EXC' } },

  /* UNIDAD DECLARADA POR EL PROPIO CAMPO de la Vmax del jet de IT. Permite que una escena describa
     un PACIENTE (3,0 m/s) y no un tecleo: el campo estuvo en cm/s hasta el 2026-10-05 y pasó a m/s,
     y un numero fijo habria hecho que el A/B comparara dos pacientes distintos. */
  unidadCW() { var e = document.getElementById('it_vmax_cw');
    return e ? String(e.placeholder || '').trim() : null },
  cwIT(ms) { return window.__P.unidadCW() === 'cm/s' ? ms * 100 : ms },

  /* Denominador: pestania Valvulas + los cuatro acordeones. Lo que esta en display:none no tiene
     geometria, asi que una sonda sobre la app cerrada da cero y parece impecable. */
  denominador() {
    try { showTab('valvulas'); } catch(e) {}
    var toks = ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'];
    toks.forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && s.style.display === 'none') { try { toggleEteSeccion(tok); } catch(e) {} }
    });
    var vis = function(id){ var e = document.getElementById(id);
      return !!e && getComputedStyle(e).display !== 'none' };
    var acord = {};
    toks.forEach(function(tok){ acord[tok.replace('valv-','')] = vis('ete-seccion-' + tok); });
    var ab = Object.keys(acord).filter(function(k){ return acord[k] }).length;
    var tab = vis('tab-valvulas');
    return { tab: tab, secciones: ab, acordeones: acord, ok: tab && ab === 4 } },

  limpiar() {
    try { limpiarCampos(true); } catch(e) {}
    window.esqSevManual = {}; window._sevCalcAlFijar = {};
    window._itGradoCalc = null; window._imGradoCalc = null; window._iaGradoCalc = null;
    ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){
        try { localStorage.removeItem('valv-pill-' + t + '-' + v); } catch(e){}
        try { if (window.__P.pill(v,t) === true) toggleValvPill(v,t); } catch(e){}
      });
    });
    return 1 },

  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value, ok: String(e.value) === String(valor) } },

  /* Los campos que se PERSISTEN, por el mismo barrido que usa guardarInforme. Es la lista que el
     prompt pide comparar: si aparece o desaparece una clave, el diff lo dice por su nombre. */
  campos() {
    var c = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      c[el.id] = el.value; });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      c[el.id + '__chk'] = el.checked ? '1' : '0'; });
    return c },

  /* La fila del Excel del Laboratorio por el emisor REAL (_labExcelRow). No genera el .xlsx:
     «Excel y reimportacion solo con orden expresa». Se comparan las columnas que produce. */
  excel() {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    var campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return; } catch(e){}
      campos[el.id] = el.value; });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      campos[el.id + '__chk'] = el.checked ? '1' : '0'; });
    try { return _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-03', campos: campos }); }
    catch(e) { return 'EXC: ' + e.message; } },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  /* Solo las oraciones de la TRICUSPIDE. Se parte por oracion y se filtra por la familia de
     palabras de la valvula: nombre largo y las siglas del EN SUMA (IT, ET, VT).
     ⚠️ LA TILDE VA EN LA CLASE: el informe escribe «tricuspide» CON acento y la primera version de
     este patron decia 'tricusp' pelado, asi que devolvia CERO frases en las seis escenas y el
     reporte parecia un informe vacio. El veredicto del A/B no dependia de esto —compara el
     informe COMPLETO— pero el denominador a la vista decia lo contrario de lo que pasaba. */
  frasesVT(texto) {
    var t = String(texto || '');
    var ors = t.split(/(?<=\\.)\\s+/);
    var re = /tric[\\u00fau]sp|\\bIT\\b|\\bET\\b|\\bVT\\b|VD-AD/i;
    return ors.map(function(s){ return s.trim() }).filter(function(s){ return s && re.test(s) }) },

  /* Foto de la tricuspide: las dos pastillas, los dos grados, el aviso rojo, el cajon y la nota. */
  foto() {
    return {
      pillInsuf: window.__P.pill('tricuspide','insuf'),
      pillEsten: window.__P.pill('tricuspide','esten'),
      it_grado:  window.__P.val('it_grado'),
      et_grado:  window.__P.val('et_grado'),
      it_tag:    window.__P.tag('it_grado'),
      it_opts:   window.__P.opts('it_grado'),
      et_opts:   window.__P.opts('et_grado'),
      sevbtnInsuf: window.__P.txt('sevbtn-insuf-tricuspide'),
      sevbtnEsten: window.__P.txt('sevbtn-esten-tricuspide'),
      aviso:     window.__P.txt('it-manual-aviso'),
      avisoVis:  window.__P.vis('it-manual-aviso'),
      fundVis:   window.__P.vis('it-fund'),
      nota:      window.__P.val('it_fund_nota'),
      bloqInsuf: window.__P.vis('bloque-insuf-tricuspide'),
      bloqEsten: window.__P.vis('bloque-esten-tricuspide'),
      itSev:     window.__P.txt('it-sev'),
      itEroa:    window.__P.txt('it-eroa'),
      itVolr:    window.__P.txt('it-volr'),
      itDisc:    window.__P.txt('it-discordancia'),
      etSev:     window.__P.txt('et-sev'),
      etAvt:     window.__P.val('et_avt'),
      etBadge:   window.__P.txt('et-gmedio-badge'),
      /* Los nodos NUEVOS de la ET. Antes de esta tanda no existian: txt y vis devuelven null, que
         es como el A/B contra HEAD muestra que aparecieron, y no un false silencioso. */
      etAviso:    window.__P.txt('et-manual-aviso'),
      etAvisoVis: window.__P.vis('et-manual-aviso'),
      etFundVis:  window.__P.vis('et-fund'),
      etNota:     window.__P.val('et_fund_nota'),
      /* El grado CALCULADO y el veredicto de discrepancia, por sus duenios unicos. Se le preguntan
         a la app y no se re-derivan aca: dos derivaciones del mismo hecho se desincronizan. */
      etCalc:     (function(){ try { return (typeof etGradoCalculado === 'function')
                    ? etGradoCalculado() : 'SIN etGradoCalculado' } catch(e) { return 'EXC' } })(),
      etPublic:   (function(){ try { return (typeof sevCalcPublicable === 'function')
                    ? sevCalcPublicable('et') : 'SIN sevCalcPublicable' } catch(e) { return 'EXC' } })(),
      etDiscrepa: (function(){ try { return (typeof sevDiscrepa === 'function')
                    ? sevDiscrepa('et') : 'SIN sevDiscrepa' } catch(e) { return 'EXC' } })(),
      etSug:      (function(){ var e = document.getElementById('et_grado');
                    return e ? (e.dataset.sugerido || null) : null })(),
      lsEsten:    (function(){ try { return localStorage.getItem('valv-pill-esten-tricuspide') }
                    catch(e) { return 'EXC' } })(),
      manual:    JSON.stringify(window.esqSevManual || {})
    } },

  /* Maquetacion: geometria de los campos de la tricuspide. Mide el ancho de cada control y si el
     ROTULO se corta (scrollWidth > clientWidth), que es lo que el prompt pide vigilar. */
  layout() {
    var ids = ['it_grado','it_vc','it_pisa_r','it_pisa_val','it_vmax_cw','it_vti','it_densidad',
               'et_grado','et_gmedio','et_thp','et_vti_diast','et_avt'];
    var out = { campos: {}, cols: {}, desborde: [], rotuloCortado: [], toqueChico: [] };
    var les = document.getElementById('vt-lesiones');
    var bi = document.getElementById('bloque-insuf-tricuspide');
    var be = document.getElementById('bloque-esten-tricuspide');
    if (les) out.cols.lesiones = Math.round(les.getBoundingClientRect().width);
    if (bi)  { var r = bi.getBoundingClientRect();
      out.cols.insuf = { w: Math.round(r.width), x: Math.round(r.left), y: Math.round(r.top) }; }
    if (be)  { var r2 = be.getBoundingClientRect();
      out.cols.esten = { w: Math.round(r2.width), x: Math.round(r2.left), y: Math.round(r2.top) }; }
    ids.forEach(function(id){
      var e = document.getElementById(id);
      if (!e) { out.campos[id] = 'NO EXISTE'; return; }
      var r = e.getBoundingClientRect();
      var lbl = e.parentNode ? e.parentNode.querySelector('label') : null;
      var lr = lbl ? lbl.getBoundingClientRect() : null;
      var cortado = !!(lbl && lbl.scrollWidth > lbl.clientWidth + 1);
      out.campos[id] = { w: Math.round(r.width), h: Math.round(r.height),
                         x: Math.round(r.left), y: Math.round(r.top),
                         lblW: lr ? Math.round(lr.width) : null,
                         lblScroll: lbl ? lbl.scrollWidth : null,
                         lblClient: lbl ? lbl.clientWidth : null,
                         lblH: lr ? Math.round(lr.height) : null,
                         cortado: cortado };
      if (cortado) out.rotuloCortado.push(id);
      if (r.height > 0 && r.height < 44) out.toqueChico.push(id + ':' + Math.round(r.height));
      if (r.right > document.documentElement.clientWidth + 1) out.desborde.push(id);
    });
    /* Desborde horizontal de la pagina entera, que es lo que se ve como barra en el celular. */
    out.scrollW = document.documentElement.scrollWidth;
    out.clientW = document.documentElement.clientWidth;
    out.hayBarra = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    return out },

  /* Geometria de las OTRAS TRES valvulas: el control negativo de maquetacion. Si un numero de
     aca se mueve, el cambio se fue de la tricuspide. */
  otras() {
    var ids = ['im_sev_final','em_grado','ia_sev_final','ea_grado','ip_grado','ep_grado',
               'vm_morf','va_morf','vp_morf','vt_morf'];
    var out = {};
    ids.forEach(function(id){
      var e = document.getElementById(id);
      if (!e) { out[id] = 'NO EXISTE'; return; }
      var r = e.getBoundingClientRect();
      out[id] = { w: Math.round(r.width), h: Math.round(r.height),
                  x: Math.round(r.left), y: Math.round(r.top), tag: e.tagName,
                  opts: e.options ? Array.prototype.map.call(e.options, function(o){
                    return o.value + '|' + o.textContent.trim() }) : null };
    });
    ['gf-insuf-mitral','bloque-esten-mitral','gf-insuf-aortica','bloque-esten-aortica',
     'vp-lesiones','bloque-insuf-pulmonar','bloque-esten-pulmonar'].forEach(function(id){
      var e = document.getElementById(id);
      if (!e) { out[id] = 'NO EXISTE'; return; }
      var r = e.getBoundingClientRect();
      out[id] = { w: Math.round(r.width), x: Math.round(r.left), y: Math.round(r.top),
                  vis: window.__P.vis(id) };
    });
    return out },

  /* ESTUDIO GUARDADO: ida y vuelta por los emisores REALES. Se arma el blob como lo escribe
     guardarInforme, se limpia el formulario y se repone por el MISMO bucle de editarInforme
     (el_value = val, sin eventos). Devuelve que quedo en it_grado y en el informe.
     El parametro gradoViejo permite probar un estudio LEGADO con cualquier codigo, incluido el
     3 que esta tanda dejo inalcanzable: es el borde declarado.
     ⚠️ NI UN ACENTO GRAVE EN ESTE CUERPO, tampoco en los comentarios: cierra el template literal y
     el archivo deja de parsear con un SyntaxError que apunta a otra linea. Me lo comi aca. */
  roundTrip(gradoViejo, extra) {
    window.__P.limpiar(); window.__P.denominador();
    var campos = {};
    Object.keys(extra || {}).forEach(function(k){ campos[k] = String(extra[k]); });
    campos['it_grado'] = String(gradoViejo);
    campos['nombre'] = 'Legado';
    /* Reposicion IDENTICA a la de editarInforme: asignacion directa, sin eventos. */
    Object.keys(campos).forEach(function(k){
      var el = document.getElementById(k); if (el) el.value = campos[k]; });
    if (window.__P.pill('tricuspide','insuf') !== true) toggleValvPill('tricuspide','insuf');
    var r = window.__P.informe('estandar');
    return { pedido: String(gradoViejo),
             leido: window.__P.val('it_grado'),
             selIdx: (function(){ var e = document.getElementById('it_grado');
               return e && e.selectedIndex !== undefined ? e.selectedIndex : null })(),
             vt: window.__P.frasesVT(r.inf), suma: r.suma,
             pastilla: window.__P.txt('sevbtn-insuf-tricuspide') } },


  /* ══ HELPERS DE LA TANDA VAL (2026-10-17) ═══════════════════════════════════════════════════
     ⚠️ NI UN ACENTO GRAVE ACA ADENTRO, tampoco en los comentarios: cierra el template literal. */

  /* Enfoca un campo y ABORTA si no existe, no tiene geometria o es de SOLO LECTURA. Un tecleo
     sobre un campo sin caja no ocurre y la escena mide el paciente ANTERIOR. */
  enfocar(id) {
    var e = document.getElementById(id);
    if (!e) return { ok:false, por:'NO EXISTE ' + id };
    var r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return { ok:false, por:'SIN GEOMETRIA ' + id };
    if (e.readOnly) return { ok:false, por:'SOLO LECTURA ' + id };
    e.focus();
    return { ok: document.activeElement === e, id:id, w:Math.round(r.width), h:Math.round(r.height) } },

  /* La PRIMERA de una lista de ids que tenga geometria. Varios campos de esta app tienen un
     espejo visible y el dueno escondido (diam_tsvi / diam_tsvi_ao): tipear en el escondido no
     ocurre, y con el espejo el dato llega igual porque los dos estan sincronizados. */
  puerta(ids) {
    for (var i = 0; i < ids.length; i++) {
      var e = document.getElementById(ids[i]);
      if (!e) continue;
      /* Se ABRE la pestania del candidato antes de medirlo: un campo detras de una puerta no
         tiene geometria y la lista entera devolveria null sobre campos que existen. */
      try { window.__P.abrirDe(ids[i]); } catch(x) {}
      var r = e.getBoundingClientRect();
      if (r.width >= 1 && r.height >= 1 && !e.readOnly) return ids[i];
    }
    return null },

  /* Abre la pestania Valvulas y los cuatro acordeones + los cajones de datos de cada lesion.
     valvDatosTog recibe el ID DEL CONTENEDOR, no el nombre de la valvula. */
  abrirTodo() {
    try { if (!window.__P.vis('tab-valvulas')) showTab('valvulas'); } catch(e) {}
    ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'].forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && getComputedStyle(s).display === 'none') { try { toggleEteSeccion(tok); } catch(e) {} }
    });
    ['caja-insuf-mitral','caja-esten-mitral','caja-insuf-aortica','caja-esten-aortica',
     'caja-insuf-tricuspide','caja-esten-tricuspide'].forEach(function(cid){
      var c = document.getElementById(cid);
      if (!c) return;
      var abierta = c.className.indexOf('valv-datos-abierto') > -1;
      if (!abierta) { try { valvDatosTog(cid); } catch(e) {} }
    });
    return 1 },

  /* Abre la PESTANIA que contiene un campo, subiendo por el DOM hasta la .tab-section. Es el
     abridor generico del G1: una lista de pestanias cableada se desactualiza. */
  abrirDe(id) {
    var e = document.getElementById(id);
    if (!e) return { ok:false, por:'NO EXISTE ' + id };
    var n = e;
    while (n && n.nodeType === 1 && !(n.classList && n.classList.contains('tab-section'))) n = n.parentNode;
    if (!n || !n.id) return { ok:false, por:'SIN tab-section para ' + id };
    var tab = n.id.replace(/^tab-/, '');
    if (getComputedStyle(n).display === 'none') { try { showTab(tab); } catch(x) {} }
    /* Acordeones y cajones del camino, de abajo hacia arriba. */
    var m = e.parentNode;
    while (m && m.nodeType === 1) {
      if (m.id && getComputedStyle(m).display === 'none') {
        if (/^ete-seccion-/.test(m.id)) { try { toggleEteSeccion(m.id.replace('ete-seccion-','')); } catch(x) {} }
        else if (/^sacc-/.test(m.id))   { try { secToggle(m.id.replace('sacc-','')); } catch(x) {} }
        else { m.style.display = ''; }
      }
      if (m.id && /^caja-/.test(m.id) && m.className.indexOf('valv-datos-abierto') < 0) {
        try { valvDatosTog(m.id); } catch(x) {}
      }
      m = m.parentNode;
    }
    var r = e.getBoundingClientRect();
    return { ok: r.width >= 1 && r.height >= 1, tab: tab, w: Math.round(r.width) } },

  /* Foto de TODO lo que esta tanda puede mover, en un solo objeto. */
  fotoVal() {
    var g = function(id){ return window.__P.txt(id) };
    var et = (function(){ try { return (typeof etEstado === 'function') ? etEstado() : null }
                          catch(e) { return 'EXC' } })();
    return {
      /* --- estenosis tricuspidea --- */
      et_sev: g('et-sev'), et_ref_gm: g('et-ref-gmedio'), et_ref_vti: g('et-ref-vti'),
      et_ref_thp: g('et-ref-thp'), et_ref_avt: g('et-ref-avt'), et_ref_fuente: g('et-ref-fuente'),
      et_it_aviso: g('et-it-aviso'),
      et_grado: window.__P.val('et_grado'), et_avt: window.__P.val('et_avt'),
      et_pill: window.__P.pill('tricuspide','esten'),
      et_signif: (et && typeof et === 'object') ? et.signif : et,
      et_criterio: (et && typeof et === 'object') ? (et.criterio || null) : null,
      et_calc: (function(){ try { return etGradoCalculado() } catch(e) { return 'EXC' } })(),
      /* --- estenosis aortica --- */
      ea_grado: window.__P.val('ea_grado'), ea_sev: g('ea-det-sev'), ea_det_ava: g('ea-det-ava'),
      ea_pill: window.__P.pill('aortica','esten'),
      ea_calc: (function(){ try { var r = eaGradoCalculado();
                  return r ? (r.grado + '|' + (r.criterio||'')) : null } catch(e) { return 'EXC' } })(),
      /* --- insuficiencia aortica --- */
      ia_grado: window.__P.val('ia_grado'), ia_sev: g('ia-sev'), ia_freg: g('ia-freg'),
      ia_disc: g('ia-discordancia'), ia_pill: window.__P.pill('aortica','insuf'),
      /* --- insuficiencia mitral --- */
      im_grado: window.__P.val('im_grado'), im_sev: g('im-sev'),
      im_ondae: g('im-ondae-interp'), im_vti_ratio: g('im-vti-ratio'),
      im_jet: g('im-jet-ratio'), im_pill: window.__P.pill('mitral','insuf'),
      /* --- controles de las otras zonas --- */
      em_grado: window.__P.val('em_grado'), it_grado: window.__P.val('it_grado'),
      ip_grado: window.__P.val('ip_grado'), ep_grado: window.__P.val('ep_grado'),
      dd: g('dd-interp'), hfapeff: g('hfapeff-eco')
    } },

  /* La tarjeta de la vista 2D de una lesion, por su lector REAL. */
  v2d(clave) {
    try {
      if (typeof _v2dPorQue !== 'function') return 'SIN _v2dPorQue';
      var r = _v2dPorQue(clave);
      if (!r) return null;
      return { decide: r.decide || '', aviso: r.aviso || '', manual: !!r.manual,
               filas: (r.filas || []).map(function(f){
                 return [f.nom, f.val, f.grado, f.decide, f.retiro].join('|') }) };
    } catch(e) { return 'EXC: ' + e.message } },

  /* Lectura binaria del Laboratorio para la ET, por su dueno. */
  labEt(tok) {
    try {
      if (typeof _labValvBin !== 'function') return 'SIN _labValvBin';
      var infs = [{ campos: { et_grado: String(tok) } }];
      var b = _labValvBin(infs);
      var i = (typeof LAB_VALV_BIN === 'object' && LAB_VALV_BIN.et) ? LAB_VALV_BIN.et.i : 5;
      var f = b[i];
      return f ? JSON.stringify(f.cuentas) + ' base=' + f.base : 'SIN FILA ' + i;
    } catch(e) { return 'EXC: ' + e.message } },

  /* Texto de la seccion de valvulas nativas de la pestania REFERENCIAS. */
  refsNativas() {
    var e = document.getElementById('ref-nativas');
    if (!e) return 'NO EXISTE ref-nativas';
    var t = (e.textContent || '').replace(/\s+/g, ' ').trim();
    var n = document.getElementById('ref-integracion');
    var col = null, visible = null;
    if (n) {
      try { col = getComputedStyle(n).color; } catch(x) { col = 'EXC'; }
      visible = window.__P.vis('ref-integracion');
    }
    return { largo: t.length, integra: n ? (n.textContent||'').replace(/\s+/g,' ').trim() : null,
             color: col, vis: visible,
             dentro: !!(n && e.contains(n)),
             jetCita: (function(){
               try { var c = (window.VINFO && window.VINFO['im-jet-ai']) ? window.VINFO['im-jet-ai'].fuente : null;
                     return c || null } catch(x) { return 'EXC' } })() } },

  listo() {
    var faltan = ['generarInforme','pillOn','toggleEteSeccion','showTab','limpiarCampos',
                  'calcIT_ESC','calcET','sevSincronizar','setEstiloInforme']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (faltan.length) return { listo:false, faltan:faltan };
    if (!document.getElementById('informe_texto')) return { listo:false, por:'sin informe_texto' };
    if (!document.getElementById('it_grado')) return { listo:false, por:'sin it_grado' };
    if (!document.getElementById('et_grado')) return { listo:false, por:'sin et_grado' };
    if (!window.valvSev || typeof window.valvSev.aplicar !== 'function')
      return { listo:false, por:'sin valvSev.aplicar' };
    return { listo:true } }
};
'OK';
`;

const md5 = async (p) => createHash('md5').update(await readFile(p)).digest('hex');

/* ══ TECLAS REALES ════════════════════════════════════════════════════════════════════════════
   Todo lo que esta sonda carga o borra pasa por CDP, no por `.value`: un `KeyboardEvent` armado a
   mano no es de confianza y la app usa `oninput` en los campos. Antes de cada tecla se comprueba
   el FOCO y la geometria; si el tecleo no queda, la escena ABORTA con el nombre del campo.
   ⚠️ NUNCA Backspace sobre un campo de SOLO LECTURA: `enfocar` lo rechaza antes. */
function hacerTeclado(cdp, sessionId, ev) {
  const key = async (p) => { await cdp.send('Input.dispatchKeyEvent', p, sessionId); };
  const backspace = async (n) => {
    for (let i = 0; i < n; i++) {
      await key({ type: 'rawKeyDown', windowsVirtualKeyCode: 8, nativeVirtualKeyCode: 8, key: 'Backspace' });
      await key({ type: 'keyUp', windowsVirtualKeyCode: 8, nativeVirtualKeyCode: 8, key: 'Backspace' });
    }
  };
  const escribir = async (txt) => {
    for (const ch of String(txt)) {
      await key({ type: 'keyDown', text: ch, unmodifiedText: ch, key: ch });
      await key({ type: 'keyUp', key: ch });
    }
  };
  return {
    async tipear(id, valor) {
      await ev(`JSON.stringify(window.__P.abrirDe(${JSON.stringify(id)}))`);
      const f = JSON.parse(await ev(`JSON.stringify(window.__P.enfocar(${JSON.stringify(id)}))`));
      if (!f.ok) throw new Error('TECLEO ABORTADO: ' + (f.por || ('foco no llego a ' + id)));
      await backspace(16);
      if (valor !== '' && valor !== null && valor !== undefined) await escribir(valor);
      const leido = await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)}); return e?e.value:null })()`);
      const esp = (valor === '' || valor === null || valor === undefined) ? '' : String(valor);
      if (String(leido) !== esp) throw new Error('TECLEO NO QUEDO en ' + id + ': "' + leido + '" != "' + esp + '"');
      return leido;
    },
    async borrar(id) { return this.tipear(id, ''); },
    /* Un `<select>` NO se tipea: se elige su opcion y se despacha el `change` por el camino real
       de la app (`valvSev.aplicar` para los grados, `.value` + change para los demas). */
    async elegir(id, valor) {
      const r = JSON.parse(await ev(`(function(){
        var e = document.getElementById(${JSON.stringify(id)});
        if (!e) return JSON.stringify({ ok:false, por:'NO EXISTE' });
        var tiene = Array.prototype.some.call(e.options||[], function(o){ return o.value === ${JSON.stringify(valor)} });
        if (!tiene) return JSON.stringify({ ok:false, por:'NO HAY OPCION ' + ${JSON.stringify(valor)} });
        e.value = ${JSON.stringify(valor)};
        e.dispatchEvent(new Event('change', { bubbles: true }));
        return JSON.stringify({ ok: e.value === ${JSON.stringify(valor)}, leido: e.value });
      })()`));
      if (!r.ok) throw new Error('SELECT ' + id + ': ' + (r.por || 'no quedo'));
      return r.leido;
    },
  };
}

async function main() {
  const antes = await md5(join(RAIZ, 'index.html'));
  const { srv, port } = await servir();
  const { proc, perfil, wsUrl } = await abrirChrome(`http://127.0.0.1:${port}/${FILE}`);
  const cdp = await conectar(wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const t = targetInfos.find((x) => x.type === 'page' && x.url.includes('127.0.0.1'));
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);

  const ev = async (expr) => {
    const r = await cdp.send('Runtime.evaluate',
      { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'exc');
    return r.result.value;
  };

  for (let i = 0; i < 60; i++) {
    try { await ev(SONDA); const l = await ev('JSON.stringify(window.__P.listo())');
      if (JSON.parse(l).listo) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  const listo = JSON.parse(await ev('JSON.stringify(window.__P.listo())'));
  const K = hacerTeclado(cdp, sessionId, ev);

  const OUT = { archivo: FARG, listo };
  const parcial = (g, v) => { OUT[g] = v; console.error('[grupo ' + g + '] listo'); };

  /* Despeja el aviso legal, que vuelve a mitad de corrida y envenena `elementFromPoint`. */
  const despejar = async () => { await ev(`(function(){
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var e = document.getElementById(id); if (e) e.style.display='none'; });
    return 1 })()`); };

  const reset = async () => {
    await despejar();
    await ev(`(function(){ window.__P.limpiar(); window.__P.abrirTodo(); return 1 })()`);
  };

  const foto = async () => JSON.parse(await ev(`JSON.stringify((function(){
    var est = window.__P.informe('estandar');
    var con = window.__P.informe('conciso');
    var nar = window.__P.informe('narrativo');
    window.__P.informe('estandar');
    return { f: window.__P.fotoVal(),
             estandar: { inf: est.inf, suma: est.suma },
             conciso:  { inf: con.inf, suma: con.suma },
             narrativo:{ inf: nar.inf, suma: nar.suma } };
  })())`));

  /* ── (1) ESTENOSIS TRICUSPIDEA: la tabla area x gradiente x VTI x THP ─────────────────────── */
  if (quiero('et')) {
    const filas = [];
    const AREAS = [
      { k: 'area<=1',  d: '25' },
      { k: 'area>1',   d: '25' },
      { k: 'sin area', d: '' },
    ];
    /* vtiTsvd elegido para que el area caiga donde dice la etiqueta, con d = 25 mm
       (area TSVD = PI*(25/20)^2 = 4,9087 cm2) y el VTI de entrada como denominador. */
    const VTIS = [{ k: 'vti>=60', v: '65', a1: '10.6', a2: '26' },
                  { k: 'vti<60',  v: '50', a1: '8.1',  a2: '20' }];
    const GMS  = [{ k: 'gm 5.0', v: '5' }, { k: 'gm 5.1', v: '5.1' }, { k: 'sin gm', v: '' }];
    const THPS = [{ k: 'thp 190', v: '190' }, { k: 'thp 150', v: '150' }];
    for (const A of AREAS) for (const V of VTIS) for (const G of GMS) for (const T of THPS) {
      const nombre = [A.k, V.k, G.k, T.k].join(' · ');
      try {
        await reset();
        await K.tipear('et_vti_diast', V.v);
        if (A.d) {
          await K.tipear('tsvd_diametro', A.d);
          await K.tipear('vti_tsvd', A.k === 'area<=1' ? V.a1 : V.a2);
        }
        await ev(`(function(){ window.__P.abrirTodo(); try{calcET()}catch(e){}; return 1 })()`);
        if (G.v) await K.tipear('et_gmedio', G.v);
        await K.tipear('et_thp', T.v);
        const r = await foto();
        filas.push({ nombre, ...r });
      } catch (e) { filas.push({ nombre, abortada: e.message }); }
    }
    parcial('et', filas);
  }

  /* ── (2) ET: el aviso de la insuficiencia tricuspidea + el Laboratorio + la vista 2D ──────── */
  if (quiero('etaviso')) {
    const out = [];
    for (const g of ['', '1', '2', '4']) {
      try {
        await reset();
        await K.tipear('et_vti_diast', '50');
        await K.tipear('tsvd_diametro', '25');
        await K.tipear('vti_tsvd', '8.1');
        await K.tipear('et_gmedio', '8');
        if (g) await ev(`(function(){ try{ valvSev.aplicar('insuf','tricuspide','${g}') }catch(e){}; return 1 })()`);
        const r = JSON.parse(await ev(`JSON.stringify({
          it_grado: window.__P.val('it_grado'),
          aviso: window.__P.txt('et-it-aviso'),
          color: (function(){ var e=document.getElementById('et-it-aviso');
                   return e ? getComputedStyle(e).color : null })(),
          sev: window.__P.txt('et-sev'),
          v2d: window.__P.v2d('esten:tricuspide')
        })`));
        out.push({ it: g || 'sin', ...r });
      } catch (e) { out.push({ it: g || 'sin', abortada: e.message }); }
    }
    /* Control negativo: SIN area, con IT severa -> el aviso NO sale. */
    try {
      await reset();
      await K.tipear('et_gmedio', '8');
      await ev(`(function(){ try{ valvSev.aplicar('insuf','tricuspide','4') }catch(e){}; return 1 })()`);
      out.push({ it: 'severa SIN area (control)', aviso: await ev(`window.__P.txt('et-it-aviso')`) });
    } catch (e) { out.push({ it: 'severa SIN area (control)', abortada: e.message }); }
    const lab = JSON.parse(await ev(`JSON.stringify({
      significativa: window.__P.labEt('Significativa'),
      nosignif:      window.__P.labEt('No significativa'),
      sin:           window.__P.labEt('sin'),
      legadoSevera:  window.__P.labEt('Severa') })`));
    parcial('etaviso', { escenas: out, lab });
  }

  /* ── (3) AVA AORTICO: los bordes 0,99 / 1,00 / 1,01 / 1,49 / 1,50 / 1,51 ─────────────────── */
  if (quiero('ava')) {
    const out = [];
    /* El AVA por continuidad es PI*(d/20)^2 * VTI_TSVI / VTI_Ao, y el VTI aortico se despeja para
       cada borde.
       ⚠️ EL DIAMETRO DEL TSVI ES 19 mm Y NO 20, Y NO ES UN DETALLE: el DVI es AVA / area del
       TSVI, asi que con d = 20 (area 3,1416) un AVA de 1,5 da un DVI de 0,477 y el criterio del
       DVI vota MODERADA por su cuenta — la escena del borde de 1,5 medía el DVI y no el AVA, y
       los dos lados daban «moderada» sobre un corte que SI se movio. Con d = 19 (area 2,8353) el
       DVI queda en 0,53 (> 0,50) en los tres valores de esa punta y se ABSTIENE, asi que lo unico
       que decide ahi es el AVA. En la punta de 1,0 el DVI si vota moderada, pero el AVA vota
       severa y manda el peor: el borde separa igual. */
    const AVA = [0.99, 1.00, 1.01, 1.49, 1.50, 1.51];
    const DTSVI = 19, VTITSVI = 20;
    const ATSVI = Math.PI * Math.pow(DTSVI / 20, 2);
    const puerta = JSON.parse(await ev(`JSON.stringify({
      d: window.__P.puerta(['ea_dtsvi','diam_tsvi_ao','diam_tsvi']),
      i: window.__P.puerta(['itv_tsvi','ea_itvtsvi']) })`));
    for (const a of AVA) {
      const vtiAo = (ATSVI * VTITSVI / a).toFixed(2);
      try {
        await reset();
        await K.tipear(puerta.d, String(DTSVI));
        await K.tipear(puerta.i, String(VTITSVI));
        await K.tipear('itv_ao', vtiAo);
        const r = await foto();
        const ava = await ev(`window.__P.val('ava_cont')`);
        const dvi = await ev(`window.__P.txt('ea-det-dvi')`);
        out.push({ ava_objetivo: a, vtiAo, ava_leido: ava, dvi, ...r });
      } catch (e) { out.push({ ava_objetivo: a, abortada: e.message }); }
    }
    parcial('ava', out);
  }

  /* ── (4) FRACCION REGURGITANTE AORTICA: 49 / 50 / 51 % ───────────────────────────────────── */
  if (quiero('fra')) {
    const out = [];
    /* FR = VolR / VSV * 100, con VolR = EROA(cm2) * VTI del jet y VSV = PI*(d/20)^2 * VTI TSVI.
       Las UNIDADES de los campos son las que declara su propia banda y su rotulo: radio PISA en
       mm [1,30], Valiasing en cm/s [5,150], Vmax CW en m/s y VTI del jet en cm [20,500]. Con
       r = 5 mm, Va = 40 cm/s y Vmax = 4 m/s la EROA sale 15,7 mm2; con d TSVI = 19 mm y VTI TSVI
       = 20 cm el VSV es 56,71 ml. Se despeja el VTI del jet para cada FR objetivo.
       ⚠️ LA PRIMERA VERSION DE ESTA ESCENA USABA r = 0,5 y Vmax = 400: los dos FUERA de banda,
       asi que la fila publicaba «revisar la unidad de los insumos del PISA», la FR no se
       calculaba y los tres bordes salian IDENTICOS en los dos arboles — un denominador vacio con
       pinta de «el corte no se movio». */
    const DTSVI = 19, VTITSVI = 20;
    const VSV = Math.PI * Math.pow(DTSVI / 20, 2) * VTITSVI;
    const EROA_MM2 = 2 * Math.PI * Math.pow(5 / 10, 2) * 40 / (4 * 100) * 100;
    const puerta = JSON.parse(await ev(`JSON.stringify({
      d: window.__P.puerta(['ea_dtsvi','diam_tsvi_ao','diam_tsvi']),
      i: window.__P.puerta(['itv_tsvi','ea_itvtsvi']) })`));
    for (const fr of [49, 50, 51]) {
      try {
        await reset();
        await K.tipear(puerta.d, String(DTSVI));
        await K.tipear(puerta.i, String(VTITSVI));
        await K.tipear('ia_pisa_r', '5');
        await K.tipear('ia_pisa_val', '40');
        await K.tipear('ia_vmax_cw', '4');
        const vti = (fr * VSV / EROA_MM2).toFixed(1);
        await K.tipear('ia_vti', vti);
        const r = await foto();
        out.push({ fr_objetivo: fr, vti_jet: vti, ...r });
      } catch (e) { out.push({ fr_objetivo: fr, abortada: e.message }); }
    }
    parcial('fra', out);
  }

  /* ── (5) ONDA E MITRAL: 119 / 120 / 121 cm/s ─────────────────────────────────────────────── */
  if (quiero('onda')) {
    const out = [];
    for (const e of ['119', '120', '121']) {
      try {
        await reset();
        await K.tipear('onda_e', e);
        await K.tipear('onda_a', '60');
        await ev(`(function(){ window.__P.abrirTodo(); try{calcIM_ESC()}catch(x){}; return 1 })()`);
        const r = JSON.parse(await ev(`JSON.stringify({
          ondae: window.__P.txt('im-ondae-interp'), im: window.__P.val('im_grado') })`));
        out.push({ onda_e: e, ...r });
      } catch (x) { out.push({ onda_e: e, abortada: x.message }); }
    }
    parcial('onda', out);
  }

  /* ── (6) COCIENTE VTI MITRAL / TSVI contra el grado de IAo ───────────────────────────────── */
  if (quiero('vti')) {
    const out = [];
    const puerta = JSON.parse(await ev(`JSON.stringify({
      i: window.__P.puerta(['itv_tsvi','ea_itvtsvi']),
      m: window.__P.puerta(['em_vtitsvi','vtim']) })`));
    for (const g of ['0', '1', '2', '3', '4']) {
      try {
        await reset();
        await K.tipear(puerta.i, '20');
        await K.tipear('vtim', '32');
        await ev(`(function(){ try{ valvSev.aplicar('insuf','aortica','${g}') }catch(e){}; return 1 })()`);
        await ev(`(function(){ window.__P.abrirTodo(); try{calcIM_ESC()}catch(x){}; return 1 })()`);
        const r = JSON.parse(await ev(`JSON.stringify({
          ratio: window.__P.txt('im-vti-ratio'), ia: window.__P.val('ia_grado'),
          puerta: ${JSON.stringify(puerta)} })`));
        out.push({ iao: g, ...r });
      } catch (x) { out.push({ iao: g, abortada: x.message }); }
    }
    parcial('vti', out);
  }

  /* ── (7) REFERENCIAS: el texto de integracion y la cita del jet ──────────────────────────── */
  if (quiero('refs')) {
    const out = {};
    for (const tema of ['oscuro', 'claro']) {
      await ev(`(function(){
        document.documentElement.classList.${tema === 'claro' ? 'add' : 'remove'}('light-mode');
        return getComputedStyle(document.documentElement).getPropertyValue('--orange') })()`);
      await ev(`(function(){ try{ showTab('referencias') }catch(e){}
        try{ showTab('refs') }catch(e){}
        var n = document.getElementById('ref-nativas');
        if (n && n.style.display === 'none') { try{ toggleRef('nativas') }catch(e){} }
        return 1 })()`);
      out[tema] = JSON.parse(await ev(`JSON.stringify({
        claseLight: document.documentElement.className,
        refs: window.__P.refsNativas(),
        tabVis: window.__P.vis('tab-refs') })`));
    }
    await ev(`document.documentElement.classList.remove('light-mode')`);
    /* Que el texto NO este en el informe, el PDF ni el bloque de integracion de Valvulas. */
    await reset();
    out.fuera = JSON.parse(await ev(`JSON.stringify((function(){
      var r = window.__P.informe('estandar');
      var frase = 'regla simple y declarada';
      return { enInforme: r.inf.indexOf(frase) > -1, enSuma: r.suma.indexOf(frase) > -1,
               enValvulas: (function(){ var v = document.getElementById('tab-valvulas');
                 return v ? (v.textContent||'').indexOf(frase) > -1 : 'NO EXISTE' })() };
    })())`));
    parcial('refs', out);
  }

  /* ── (8) CONTROLES: Excel, campos y las zonas que esta tanda no toca ─────────────────────── */
  if (quiero('ctrl')) {
    const out = {};
    await reset();
    out.vacio = JSON.parse(await ev(`JSON.stringify({
      excel: window.__P.excel(), campos: window.__P.campos(), foto: window.__P.fotoVal(),
      informe: window.__P.informe('estandar') })`));
    /* Escenario CARGADO en zonas ajenas: diastolica, HFA-PEFF, AI/VI, VD, aorta y prótesis. */
    await reset();
    const CARGA = { peso:'80', talla:'180', edad:'62', fevi:'55', ddfvi:'52', ppvi:'11', siv:'11',
                    ai_vol:'70', onda_e:'90', onda_a:'70', e_sep:'6', e_lat:'8', tde:'180',
                    vmax_it:'2.9', vci_diam:'18', vd_basal:'38', vd_pared:'4',
                    ao_sin:'38', ao_asc:'36', lars:'25' };
    for (const [id, val] of Object.entries(CARGA)) {
      try { await K.tipear(id, val); } catch (e) { out['abort_' + id] = e.message; }
    }
    await ev(`(function(){ ['calcVI','calcDiastol','calcVD','calcAo','calcIP','calcET','calcIM_ESC','calcIA_ESC','calcEM','hfapeffRender']
      .forEach(function(f){ try{ if(typeof window[f]==='function') window[f]() }catch(e){} }); return 1 })()`);
    out.cargado = JSON.parse(await ev(`JSON.stringify({
      excel: window.__P.excel(), campos: window.__P.campos(), foto: window.__P.fotoVal(),
      informe: window.__P.informe('estandar'),
      conciso: window.__P.informe('conciso'),
      narrativo: window.__P.informe('narrativo') })`));
    await ev(`window.__P.informe('estandar')`);
    parcial('ctrl', out);
  }

  const despues = await md5(join(RAIZ, 'index.html'));
  OUT.md5_index_antes = antes; OUT.md5_index_despues = despues;
  OUT.index_intacto = antes === despues;
  console.log(JSON.stringify(OUT, null, 2));
  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
