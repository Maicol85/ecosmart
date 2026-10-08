#!/usr/bin/env node
/**
 * _probe_etbin.mjs — sonda A/B de SOLO LECTURA para la ESTENOSIS TRICUSPIDEA BINARIA.
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-etbin-'));
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

  // Calentamiento explícito: la app define funciones tarde y una sonda apurada mide una app a medio armar.
  for (let i = 0; i < 60; i++) {
    try { await ev(SONDA); const l = await ev('JSON.stringify(window.__P.listo())');
      if (JSON.parse(l).listo) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  const listo = JSON.parse(await ev('JSON.stringify(window.__P.listo())'));
  /* Los errores de consola se juntan aparte: un `SyntaxError` en el bloque <script> deja la app a
     medio armar y la sonda mediría ceros plausibles. */
  const consola = await ev(`(function(){ return (window.__errs || []).slice(0,20) })()`);

  const escenas = [];
  const escena = async (nombre, pasos) => {
    const r = JSON.parse(await ev(`(function(){
      window.__P.limpiar();
      var den = window.__P.denominador();
      var sets = [];
      ${pasos}
      var f = window.__P.foto();
      var est = window.__P.informe('estandar');
      var con = window.__P.informe('conciso');
      var nar = window.__P.informe('narrativo');
      window.__P.informe('estandar');
      var xls = window.__P.excel();
      return JSON.stringify({ den: den, sets: sets, foto: f, campos: window.__P.campos(),
        estandar: { vt: window.__P.frasesVT(est.inf), suma: est.suma, inf: est.inf },
        conciso:  { vt: window.__P.frasesVT(con.inf), suma: con.suma, inf: con.inf },
        narrativo:{ vt: window.__P.frasesVT(nar.inf), suma: nar.suma, inf: nar.inf },
        xls: xls });
    })()`));
    escenas.push({ nombre, ...r });
    return r;
  };

  /* == LAS OCHO ESCENAS DE LA ESTENOSIS TRICUSPIDEA (prompt del 2026-10-05) ===================
     Los numeros son los mismos en los dos lados del A/B: la variable es el HTML, no el caso.
     El DENOMINADOR lo repone `escena()` llamando a `denominador()` DESPUES de limpiar. */

  // (a) gradiente medio 8 mmHg -> criterio cumplido por gradiente
  await escena('a-gmedio-8', `
    sets.push(window.__P.set('et_gmedio', 8));`);

  // (b) THP 200 ms -> criterio cumplido por THP (>= 190)
  await escena('b-thp-200', `
    sets.push(window.__P.set('et_thp', 200));`);

  /* (c) area 0,8 cm2 -> criterio cumplido por AREA, y los dos insumos del numerador viven en la
     pestania VD. Es la escena que prueba el cableado nuevo de `calcET` en esos dos oninput.
     PI*(26/20)^2 = 5,31 cm2 de TSVD, por VTI-TSVD 14 cm, sobre VTI diastolico 90 cm = 0,83 cm2.
     ⚠️ LOS TRES INSUMOS DENTRO DE BANDA, Y LA PRIMERA VERSION DE ESTA ESCENA NO LO ESTABA: tenia
     VTI diastolico 120 cm, que cae fuera de la banda 5-100, asi que el area no se calculaba, el
     criterio no votaba y la escena medía «no se prende» creyendo medir «se prende por area». Un
     insumo fuera de banda convierte un caso positivo en un negativo que parece pasar. */
  await escena('c-area-08', `
    sets.push(window.__P.set('et_vti_diast', 90));
    sets.push(window.__P.set('tsvd_diametro', 26));
    sets.push(window.__P.set('vti_tsvd', 14));
    sets.push({ avt: window.__P.val('et_avt') });`);

  /* (d) NINGUN criterio: gradiente 3, THP 150, area 1,5. Es el CONTROL NEGATIVO del auto-prendido:
     hay datos, el calculo da «No significativa» y el boton tiene que quedar APAGADO con el campo en
     el centinela. Area: PI*(26/20)^2 * 18 / 64 = 1,49 cm2. */
  await escena('d-sin-criterio', `
    sets.push(window.__P.set('et_gmedio', 3));
    sets.push(window.__P.set('et_thp', 150));
    sets.push(window.__P.set('et_vti_diast', 64));
    sets.push(window.__P.set('tsvd_diametro', 26));
    sets.push(window.__P.set('vti_tsvd', 18));
    sets.push({ avt: window.__P.val('et_avt') });`);

  /* (e) DISCREPANCIA HACIA ARRIBA: la escena (d) y el medico elige «Significativa» a mano, por el
     MISMO camino que corre el menu (triangulo): `valvSev.aplicar`. Aviso y cajon tienen que
     aparecer, y el motivo se escribe para que el A/B muestre que el cajon lo conserva. */
  await escena('e-discrepa-arriba', `
    sets.push(window.__P.set('et_gmedio', 3));
    sets.push(window.__P.set('et_thp', 150));
    sets.push(window.__P.set('et_vti_diast', 64));
    sets.push(window.__P.set('tsvd_diametro', 26));
    sets.push(window.__P.set('vti_tsvd', 18));
    sets.push({ calcAntes: window.__P.foto().etCalc });
    valvSev.aplicar('esten','tricuspide','Significativa');
    sets.push(window.__P.set('et_fund_nota', 'valvula rigida por carcinoide'));`);

  /* (f) DISCREPANCIA HACIA ABAJO: la escena (a) y el medico elige «No significativa» a mano. */
  await escena('f-discrepa-abajo', `
    sets.push(window.__P.set('et_gmedio', 8));
    sets.push({ calcAntes: window.__P.foto().etCalc });
    valvSev.aplicar('esten','tricuspide','No significativa');
    sets.push(window.__P.set('et_fund_nota', 'gradiente sobreestimado por taquicardia'));`);

  /* (g) APAGADO MANUAL con el criterio cumplido. El gesto es un clic real en el boton, que es lo
     que `toggleValvPill` recibe: deja la clave de localStorage en '0' y saca la valvula de
     `VALV_ESTEN_AUTO`, asi que la app no puede volver a prenderla. Se vuelve a tocar el gradiente
     DESPUES de apagar, para probar que un recalculo posterior respeta el apagado. */
  await escena('g-apagado-manual', `
    sets.push(window.__P.set('et_gmedio', 8));
    sets.push({ tras_auto: window.__P.pill('tricuspide','esten'),
                ls: window.__P.foto().lsEsten });
    try { toggleValvPill('tricuspide','esten'); } catch(e) { sets.push({ err: e.message }); }
    sets.push({ tras_clic: window.__P.pill('tricuspide','esten'),
                ls2: window.__P.foto().lsEsten });
    sets.push(window.__P.set('et_gmedio', 9));
    sets.push({ tras_recalculo: window.__P.pill('tricuspide','esten') });`);

  // (h) sin datos: el formulario en blanco.
  await escena('h-sin-datos', ``);

  /* == LA SECUENCIA QUE OBLIGA AL ORDEN DE `calcET` ============================================
     Es el caso que justifica que `_etAutoGrado` corra DESPUES de `sevSincronizar`: el medico fija
     «Significativa» con el criterio cumplido (sin discrepancia, foto = Significativa) y despues
     corrige el gradiente a un valor normal. R6 suelta la marca y escribe el calculado —que ahora es
     «No significativa»— y el retiro automatico tiene que devolverlo al centinela y apagar el boton.
     Si esto sale 'No significativa', el sistema escribio un grado que solo el medico puede firmar. */
  await escena('R6-vuelve-a-automatico', `
    sets.push(window.__P.set('et_gmedio', 8));
    valvSev.aplicar('esten','tricuspide','Significativa');
    sets.push({ antes: window.__P.val('et_grado'), pill: window.__P.pill('tricuspide','esten'),
                manualAntes: JSON.stringify(window.esqSevManual || {}) });
    sets.push(window.__P.set('et_gmedio', 3));
    sets.push({ despues: window.__P.val('et_grado'), pill2: window.__P.pill('tricuspide','esten'),
                manualDespues: JSON.stringify(window.esqSevManual || {}) });`);

  /* == EL AUTO-PRENDIDO NO SE GASTA EN UN USO ==================================================
     Gradiente 8 -> prende · 3 -> apaga · 8 otra vez -> tiene que VOLVER a prender. Es lo que
     `_etApagarAuto` arregla borrando la clave de localStorage en vez de dejarla en '0'. */
  await escena('vaiven-auto', `
    sets.push(window.__P.set('et_gmedio', 8));
    sets.push({ p1: window.__P.pill('tricuspide','esten'), g1: window.__P.val('et_grado') });
    sets.push(window.__P.set('et_gmedio', 3));
    sets.push({ p2: window.__P.pill('tricuspide','esten'), g2: window.__P.val('et_grado'),
                ls2: window.__P.foto().lsEsten });
    sets.push(window.__P.set('et_gmedio', 8));
    sets.push({ p3: window.__P.pill('tricuspide','esten'), g3: window.__P.val('et_grado') });`);

  /* == «Nuevo estudio» no deja rastro del aviso ni del cajon ===================================
     El control que la tanda de la Vmax IT aprendio a hacer: el aviso rojo del paciente anterior
     sobreviviendo a limpiarCampos sobre un formulario vacio. */
  const nuevoEstudio = JSON.parse(await ev(`(function(){
    window.__P.limpiar(); window.__P.denominador();
    window.__P.set('et_gmedio', 8);
    valvSev.aplicar('esten','tricuspide','No significativa');
    window.__P.set('et_fund_nota', 'motivo del paciente anterior');
    var antes = window.__P.foto();
    try { limpiarCampos(true); } catch(e) {}
    window.__P.denominador();
    var despues = window.__P.foto();
    return JSON.stringify({ antes: antes, despues: despues });
  })()`));

  /* == PROTESIS: el grado no se sugiere ni se escribe, y el aviso queda VACIO ================== */
  const protesis = JSON.parse(await ev(`(function(){
    window.__P.limpiar(); window.__P.denominador();
    window.__P.set('et_gmedio', 8);
    var nativa = window.__P.foto();
    window.__P.set('vt_morf', 'Protesis mecanica');
    window.__P.set('vt_morf', 'Prótesis mecánica');
    window.__P.set('et_gmedio', 8);
    return JSON.stringify({ nativa: nativa, protesis: window.__P.foto() });
  })()`));

  /* == FUERA DE BANDA: un THP de 4000 ms no puede sostener un grado calculado ==================
     El proveedor tiene que devolver null —no «No significativa»— cuando no queda un insumo legible,
     y SI tiene que devolver «Significativa» cuando el gradiente en banda lo sostiene. */
  const fueraBanda = JSON.parse(await ev(`(function(){
    window.__P.limpiar(); window.__P.denominador();
    window.__P.set('et_thp', 4000);
    var solo = window.__P.foto();
    window.__P.set('et_gmedio', 8);
    return JSON.stringify({ solo_fuera: solo, mas_gmedio_en_banda: window.__P.foto() });
  })()`));

  /* == CONTROL NEGATIVO: las otras cuatro lesiones no se tocaron =============================== */
  await escena('NEG-otras-lesiones', `
    sets.push(window.__P.set('it_vc', 8));
    sets.push(window.__P.set('it_densidad', 'denso'));
    sets.push(window.__P.set('im_vc', 8));
    sets.push(window.__P.set('ia_vc', 7));
    sets.push(window.__P.set('vp_vmax', 4.5));
    sets.push({ im: window.__P.val('im_grado'), ia: window.__P.val('ia_grado'),
                em: window.__P.val('em_grado'), ea: window.__P.val('ea_grado'),
                ep: window.__P.val('ep_grado'), ip: window.__P.val('ip_grado'),
                it: window.__P.val('it_grado') });`);

  /* == La insuficiencia tricuspidea con su propia discrepancia: no la toco esta tanda ========== */
  await escena('NEG-IT-discrepa', `
    sets.push(window.__P.set('it_vc', 8));
    sets.push(window.__P.set('it_densidad', 'denso'));
    valvSev.aplicar('insuf','tricuspide','2');
    sets.push(window.__P.set('it_fund_nota', 'jet excentrico'));`);

  /* == Maquetacion: celular (360/390) y ancho, con el bloque de la ET ABIERTO y con el cajon
     VISIBLE —que es el estado nuevo que hay que medir: el aviso rojo y el cajon lado a lado—. */
  const anchos = [1440, 1280, 1024, 768, 390, 360];
  const layout = {};
  for (const w of anchos) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: w, height: 900, deviceScaleFactor: 1, mobile: w <= 430 }, sessionId);
    await new Promise((r) => setTimeout(r, 260));
    layout[w] = JSON.parse(await ev(`(function(){
      window.__P.limpiar(); window.__P.denominador();
      if (window.__P.pill('tricuspide','insuf') !== true) toggleValvPill('tricuspide','insuf');
      window.__P.set('et_gmedio', 8);
      valvSev.aplicar('esten','tricuspide','No significativa');
      window.__P.set('et_fund_nota', 'gradiente sobreestimado por taquicardia');
      var L = window.__P.layout();
      var caj = document.getElementById('et-fund');
      var sel = document.getElementById('et_grado');
      var av  = document.getElementById('et-manual-aviso');
      var g = function(e){ if (!e) return null; var r = e.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height),
                 x: Math.round(r.left), y: Math.round(r.top) } };
      L.etFund = { caja: g(caj), sel: g(sel), aviso: g(av),
                   vis: window.__P.vis('et-fund'),
                   apilado: (function(){ var a = g(sel), b = g(caj);
                     return (a && b) ? (b.y >= a.y + a.h - 2) : null })(),
                   avisoTxt: window.__P.txt('et-manual-aviso') };
      return JSON.stringify(L);
    })()`));
  }
  await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);

  /* == Un estudio guardado ANTIGUO sin estenosis tricuspidea reabre identico ===================
     El valor de FABRICA de et_grado era 'Sin estenosis', asi que lo traen TODOS los estudios
     viejos: es el caso que el prompt pide proteger. Se reponen por el MISMO camino que
     editarInforme (asignacion directa, sin eventos) y pasando por _migrarCamposLegacy. */
  const legado = {};
  for (const g of ['Sin estenosis', 'Leve', 'Severa', 'sin']) {
    legado[g] = JSON.parse(await ev(`(function(){
      window.__P.limpiar(); window.__P.denominador();
      var campos = { et_grado: ${JSON.stringify(g)}, nombre: 'Legado' };
      try { if (typeof _migrarCamposLegacy === 'function') campos = _migrarCamposLegacy(campos); }
      catch(e) {}
      Object.keys(campos).forEach(function(k){
        var el = document.getElementById(k); if (el) el.value = campos[k]; });
      try { if (typeof sevFundRestaurar === 'function') sevFundRestaurar(campos); } catch(e) {}
      var r = window.__P.informe('estandar');
      var sel = document.getElementById('et_grado');
      return JSON.stringify({ pedido: ${JSON.stringify(g)},
        migrado: campos.et_grado,
        leido: window.__P.val('et_grado'),
        selIdx: sel ? sel.selectedIndex : null,
        pastilla: window.__P.txt('sevbtn-esten-tricuspide'),
        aviso: window.__P.txt('et-manual-aviso'),
        bloqEsten: window.__P.vis('bloque-esten-tricuspide'),
        vt: window.__P.frasesVT(r.inf), suma: r.suma, pdfFila: (function(){
          try { return (typeof sv === 'function') ? sv('et_grado') : null } catch(e) { return 'EXC' } })() });
    })()`));
  }

  /* == EL LABORATORIO CON LOS GRADOS NUEVOS (condicion 2 de la decision del 2026-10-05) =======
     `_labEstenSev` quedo INTACTO por decision expresa, asi que devuelve null para los dos grados
     nuevos y esos estudios salen del denominador de la fila ET. Lo que hay que probar es que eso
     NO rompe nada: ni NaN, ni division por cero, ni una fila con un 0 sobre base 0 —que se lee
     como «lo medimos y dio cero»—. Se corren los DOS consumidores: el conteo que alimenta la
     tabla y el grafico de pantalla, y el armador de filas del PDF de auditoria, con la MISMA
     derivacion de «Sin» que ese PDF usa (base - L - Mo - Se, con rayas si la base es 0). */
  const laboratorio = JSON.parse(await ev(`(function(){
    if (typeof _labValvCounts !== 'function') return JSON.stringify({ err: 'SIN _labValvCounts' });
    var mk = function(et){ return { campos: { im_grado:'2', em_grado:'leve', ia_grado:'1',
      ea_grado:'severa', it_grado:'1', ip_grado:'Leve', ep_grado:'Moderada', et_grado: et } }; };
    var iET = _LAB_VALV_LABELS.indexOf('Esten. Tricusp.');
    var corrida = function(nombre, infs){
      var out = { escena: nombre, N: infs.length };
      try {
        var vc = _labValvCounts(infs);
        out.baseET = vc.bases[iET];
        out.ET = { Leve: vc.counts.Leve[iET], Moderada: vc.counts.Moderada[iET],
                   Severa: vc.counts.Severa[iET] };
        /* La fila tal como la arma el PDF de auditoria, con su derivacion de «Sin». */
        var b = vc.bases[iET] || 0;
        var L = vc.counts.Leve[iET] || 0, M = vc.counts.Moderada[iET] || 0, S = vc.counts.Severa[iET] || 0;
        out.filaPDF = b > 0
          ? [_LAB_VALV_LABELS[iET] + '  (n = ' + b + ')', String(b - L - M - S), String(L), String(M), String(S)]
          : [_LAB_VALV_LABELS[iET] + '  (sin datos)', '—', '—', '—', '—'];
        /* Porcentaje sobre la base, que es la cuenta que podria dividir por cero. */
        out.pct = b > 0 ? Math.round((L + M + S) * 100 / b) : null;
        /* Las OTRAS SIETE filas: el control negativo del Laboratorio. */
        out.otras = _LAB_VALV_LABELS.map(function(lb, i){
          if (i === iET) return null;
          return lb + ' n=' + vc.bases[i] + ' L' + vc.counts.Leve[i] +
                 ' M' + vc.counts.Moderada[i] + ' S' + vc.counts.Severa[i]; }).filter(Boolean);
        /* Nada de esto puede ser NaN ni undefined. */
        var nums = [out.baseET, out.ET.Leve, out.ET.Moderada, out.ET.Severa].concat(vc.bases);
        out.hayNaN = nums.some(function(n){ return typeof n !== 'number' || isNaN(n); });
        out.filaTieneNaN = out.filaPDF.some(function(c){ return /NaN|undefined|Infinity/.test(String(c)); });
      } catch(e) { out.err = e.message; }
      return out; };
    return JSON.stringify({
      significativa:    corrida('todos Significativa',    [mk('Significativa'), mk('Significativa')]),
      noSignificativa:  corrida('todos No significativa', [mk('No significativa'), mk('No significativa')]),
      mezcla:           corrida('mezcla con legados',     [mk('Significativa'), mk('No significativa'),
                                                           mk('sin'), mk('Sin estenosis'), mk('Severa')]),
      soloLegado:       corrida('solo legados (control)', [mk('Sin estenosis'), mk('Severa'), mk('Leve')])
    });
  })()`));

  /* == PPT y PANEL DE EVIDENCIA, por cada estado del grado (P6) ===============================
     El PPT lee el TEXTO de la opcion (`_pptSel` devuelve options[selectedIndex].text cuando el
     indice es > 0, y el VALUE cuando es 0), asi que hay que mirar los dos caminos.
     El panel: se cuentan secciones y filas con la ET cargada y con la ET vacia. Si los dos numeros
     coinciden, el panel NO ve la estenosis tricuspidea —que es lo que hay que confirmar: no pierde
     ni inventa una fila—. Se mide, no se deduce de un grep. */
  const superficies = JSON.parse(await ev(`(function(){
    var estados = [['centinela','sin'], ['significativa','Significativa'],
                   ['noSignificativa','No significativa']];
    var panelFoto = function(){
      if (typeof IND_SECS === 'undefined') return 'SIN IND_SECS';
      var secs = 0, filas = 0, titulos = [];
      IND_SECS.forEach(function(sec){
        var r = null;
        try { r = sec.fn(); } catch(e) { r = { err: e.message }; }
        if (!r) return;
        var fs = r.filas || r.rows || [];
        if (r.err) { titulos.push(sec.titulo + ':ERR'); return; }
        if (fs.length || r.txt || r.nota) { secs++; filas += fs.length; titulos.push(sec.titulo); }
      });
      return { secciones: secs, filas: filas, titulos: titulos }; };
    var out = {};
    estados.forEach(function(e){
      window.__P.limpiar(); window.__P.denominador();
      window.__P.set('et_gmedio', 8);
      if (e[1] !== 'sin') valvSev.aplicar('esten','tricuspide', e[1]);
      out[e[0]] = {
        grado: window.__P.val('et_grado'),
        pptSel: (typeof _pptSel === 'function') ? _pptSel('et_grado') : 'SIN _pptSel',
        panel: panelFoto() };
    });
    /* Control: la ET COMPLETAMENTE vacia. Si el panel da lo mismo que arriba, no la mira. */
    window.__P.limpiar(); window.__P.denominador();
    out.etVacia = { grado: window.__P.val('et_grado'),
                    pptSel: (typeof _pptSel === 'function') ? _pptSel('et_grado') : 'SIN _pptSel',
                    panel: panelFoto() };
    return JSON.stringify(out);
  })()`));

  /* == LOS TRES HALLAZGOS DE /sharp-edges SOBRE ESTE DIFF, MEDIDOS ============================ */
  const sharp = JSON.parse(await ev(`(function(){
    var out = {};
    /* (1) El medico elige el CENTINELA a mano con el criterio cumplido. */
    window.__P.limpiar(); window.__P.denominador();
    window.__P.set('et_gmedio', 8);
    out.h1_tras_auto = window.__P.foto();
    valvSev.aplicar('esten','tricuspide','sin');
    out.h1_tras_centinela = window.__P.foto();
    window.__P.set('et_gmedio', 12);
    out.h1_tras_subir = window.__P.foto();
    out.h1_informe = window.__P.informe('estandar');

    /* (5) Un estudio IMPORTADO con el negativo documentado («Sin estenosis») y gradiente 6. */
    window.__P.limpiar(); window.__P.denominador();
    var campos = { et_grado: 'Sin estenosis', et_gmedio: '6', nombre: 'Importado' };
    try { if (typeof _migrarCamposLegacy === 'function') campos = _migrarCamposLegacy(campos); } catch(e){}
    out.h5_migrado = campos.et_grado;
    try { if (typeof _sevManualDesdeCampos === 'function')
      out.h5_marcas = JSON.stringify(_sevManualDesdeCampos(campos)); } catch(e){ out.h5_marcas = 'EXC'; }
    Object.keys(campos).forEach(function(k){
      var el = document.getElementById(k); if (el) el.value = campos[k]; });
    try { if (typeof _sevManualDesdeCampos === 'function') {
      window.esqSevManual = _sevManualDesdeCampos(campos); _sevManualSync(); } } catch(e){}
    try { calcET(); } catch(e) { out.h5_err = e.message; }
    out.h5_foto = window.__P.foto();
    out.h5_informe = window.__P.informe('estandar');

    /* (6) Un legado con «Leve» Y gradiente 1,5: el comentario afirma «nunca a una negacion». */
    window.__P.limpiar(); window.__P.denominador();
    var c2 = { et_grado: 'Leve', et_gmedio: '1.5', nombre: 'Legado' };
    try { if (typeof _migrarCamposLegacy === 'function') c2 = _migrarCamposLegacy(c2); } catch(e){}
    Object.keys(c2).forEach(function(k){
      var el = document.getElementById(k); if (el) el.value = c2[k]; });
    if (window.__P.pill('tricuspide','esten') !== true) toggleValvPill('tricuspide','esten');
    out.h6_antes = { grado: window.__P.val('et_grado'),
      idx: (function(){ var e=document.getElementById('et_grado'); return e?e.selectedIndex:null })() };
    out.h6_informe_sin_recalc = window.__P.informe('estandar');
    try { calcET(); } catch(e) {}
    out.h6_tras_recalc = { grado: window.__P.val('et_grado') };
    out.h6_informe = window.__P.informe('estandar');
    return JSON.stringify(out);
  })()`));

  /* == Geometria de las otras valvulas: el control negativo de maquetacion ===================== */
  const otras = JSON.parse(await ev(`(function(){
    window.__P.limpiar(); window.__P.denominador();
    ['mitral','aortica','pulmonar','tricuspide'].forEach(function(v){
      ['insuf','esten'].forEach(function(t){
        if (window.__P.pill(v,t) !== true) { try { toggleValvPill(v,t) } catch(e){} } }); });
    return JSON.stringify(window.__P.otras());
  })()`));

  const despues = await md5(join(RAIZ, 'index.html'));

  console.log(JSON.stringify({
    archivo: FARG, md5_index_antes: antes, md5_index_despues: despues,
    index_intacto: antes === despues,
    listo, consola, escenas, nuevoEstudio, protesis, fueraBanda, layout, legado, laboratorio, superficies, sharp, otras,
  }, null, 2));

  /* ⚠️ Cerrar el servidor Y salir a mano: `cdp.close()` + `proc.kill()` no alcanzan —el servidor
     HTTP sigue escuchando y el event loop vivo—, se juntan zombies reteniendo su Chrome y un A/B
     encadenado nunca llega al segundo lado. Parece lentitud, es un cuelgue. */
  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
