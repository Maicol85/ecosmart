#!/usr/bin/env node
/**
 * _probe_tricusp.mjs — sonda A/B de SOLO LECTURA para la válvula TRICÚSPIDE.
 *
 * Mide las cinco escenas pedidas (IT sola, ET sola, ambas, grado manual que discrepa, sin datos)
 * más la maquetación en siete anchos. No muta index.html: comprueba su md5 al principio y al final.
 *
 * Se corre DOS veces —contra la copia de HEAD y contra el archivo vivo— y se diffean los JSON:
 *   node scripts/_probe_tricusp.mjs --file /tmp/index.HEAD.html > /tmp/tri.HEAD.json
 *   node scripts/_probe_tricusp.mjs                             > /tmp/tri.NEW.json
 *
 * Infraestructura (servidor + Chrome + CDP) calcada de scripts/_probe_pulmo.mjs.
 *
 * ⚠️ El `--file` se sirve desde /tmp si es absoluto: la copia de HEAD no vive en el repo.
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-tri-'));
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

  /* ── Las cinco escenas del prompt ──────────────────────────────────────────────────────────
     Los números son los mismos en los dos lados del A/B: la variable es el HTML, no el caso. */

  /* 1) IT sola. Vena contracta 8 mm vota severa por el corte `> 7` de calcIT_ESC.
     ⚠️ LA Vmax DEL JET SE TECLEA EN LA UNIDAD QUE DECLARA EL CAMPO, y no con el 300 fijo que
     tenía esta escena (2026-10-05). `it_vmax_cw` pasó de cm/s a m/s, así que un 300 literal dejó de
     significar el mismo PACIENTE en los dos lados del A/B: en el build nuevo son 300 m/s, el espejo
     los lleva a `vmax_it` y el informe sale con «Gradiente VD-AD de 360000 mmHg».
     Eso NO es una regresión y se midió por separado: teclear 300 en el campo del Doppler —que ya
     era m/s en HEAD— produce exactamente la misma frase en HEAD. Es el agujero preexistente de que
     el NARRATIVO no hereda la banda de plausibilidad del gradiente (el PDF sí: `vPlaus` +
     MARCA_REVISAR). Queda declarado y sin corregir: tocar la frase del informe no es de esta tanda.
     `unidadCW()` lee el placeholder del propio campo, así que la escena describe un paciente y no
     un tecleo, y sigue valiendo si la unidad vuelve a cambiar. */
  await escena('IT-sola', `
    sets.push(window.__P.set('it_vc', 8));
    sets.push(window.__P.set('it_pisa_r', 9));
    sets.push(window.__P.set('it_pisa_val', 40));
    sets.push(window.__P.set('it_vmax_cw', window.__P.cwIT(3.0)));
    sets.push(window.__P.set('it_vti', 90));
    sets.push(window.__P.set('it_densidad', 'denso'));`);

  /* 1b) LA Vmax DEL JET CARGADA SOLO DESDE «Valvulas» — ESCENA DOCUMENTADA (2026-10-05).
     ⚠️ ES LA UNICA ESCENA DONDE EL INFORME CAMBIA CONTRA HEAD, Y CAMBIA A PROPOSITO. Autorizado
     por Maicol tras medirlo. Por que cambia:
       · ANTES los dos campos de Vmax IT eran datos SEPARADOS. Cargarla en «Valvulas» dejaba
         `vmax_it` VACIO, asi que el informe firmado decia «Sin registro de velocidad de
         regurgitacion que permita estimar PSAP» MIENTRAS el dato estaba cargado dos pestanias mas
         alla. Esa frase era falsa y es el defecto que P3 vino a cerrar.
       · AHORA son el mismo dato: el espejo llena `vmax_it` y el informe dice «Gradiente VD-AD de
         36 mmHg. PSAP no calculable sin medicion de VCI.». El Excel gana el numero en la columna
         «Grad VD-AD (mmHg)», que antes salia vacia.
     NO se cambio ni una letra de ninguna frase del informe: lo que cambio es que el dato llega a
     la otra mitad de la app. Las otras dos formas de cargarlo —solo por Doppler, o los dos campos
     como queda un estudio COMPLETO en HEAD— dan un informe IDENTICO a HEAD, y estan medidas.
     El EN SUMA no cambia en ninguna de las tres. */
  await escena('IT-solo-desde-valvulas', `
    sets.push(window.__P.set('it_pisa_r', 9));
    sets.push(window.__P.set('it_pisa_val', 40));
    sets.push(window.__P.set('it_vmax_cw', window.__P.cwIT(3.0)));
    sets.push(window.__P.set('it_vti', 90));
    sets.push(window.__P.set('it_densidad', 'denso'));
    sets.push({ espejo: window.__P.val('vmax_it'), grad: window.__P.val('grad_vdad_display') });`);

  // 2) ET sola. Gradiente medio 6 mmHg pasa el corte de ET significativa (>= 5).
  await escena('ET-sola', `
    sets.push(window.__P.set('et_gmedio', 6));
    sets.push(window.__P.set('et_thp', 200));
    sets.push(window.__P.set('et_vti_diast', 60));`);

  // 3) Las dos lesiones juntas.
  await escena('ambas', `
    sets.push(window.__P.set('it_vc', 8));
    sets.push(window.__P.set('it_densidad', 'denso'));
    sets.push(window.__P.set('et_gmedio', 6));
    sets.push(window.__P.set('et_thp', 200));
    sets.push(window.__P.set('et_vti_diast', 60));`);

  /* 4) Grado manual que DISCREPA del cálculo. El cálculo gradúa severa (VC 8) y el médico baja a
        «Moderada» por el MISMO camino en los dos lados del A/B: `valvSev.aplicar`, que es lo que
        corre el menú ▼. Es la escena que enciende el aviso rojo y el cajón del fundamento. */
  await escena('IT-manual-discrepa', `
    sets.push(window.__P.set('it_vc', 8));
    sets.push(window.__P.set('it_densidad', 'denso'));
    sets.push({ calcAntes: window._itGradoCalc, gradoAntes: window.__P.val('it_grado') });
    valvSev.aplicar('insuf','tricuspide','2');
    sets.push({ gradoDespues: window.__P.val('it_grado'),
                manual: JSON.stringify(window.esqSevManual || {}) });
    sets.push(window.__P.set('it_fund_nota', 'jet excentrico'));`);

  // 5) Sin datos. El formulario en blanco: it_grado nace en '0' y et_grado en 'Sin estenosis'.
  await escena('sin-datos', ``);

  /* ── Controles NEGATIVOS: las otras tres válvulas no se tocaron ───────────────────────────── */
  await escena('NEG-mitral-aortica-pulmonar', `
    sets.push(window.__P.set('im_vc', 8));
    sets.push(window.__P.set('ia_vc', 7));
    sets.push(window.__P.set('vp_vmax', 4.5));
    sets.push({ im: window.__P.val('im_grado'), ia: window.__P.val('ia_grado'),
                ep: window.__P.val('ep_grado'), ip: window.__P.val('ip_grado'),
                em: window.__P.val('em_grado'), ea: window.__P.val('ea_grado'),
                revOpts: 'ver tarjeta' });`);

  /* ── La tarjeta de revisión previa al PDF: qué opciones ofrece cada insuficiencia ──────────
     Es el punto 3 del prompt. Se abre la tarjeta y se leen las <option> de los tres selects, para
     que el A/B muestre que la IT perdió el 3 y que la IM y la IAo lo CONSERVAN. */
  const tarjeta = JSON.parse(await ev(`(function(){
    window.__P.limpiar(); window.__P.denominador();
    window.__P.set('it_vc', 8); window.__P.set('im_vc', 8); window.__P.set('ia_vc', 7);
    var out = { abrio:false };
    try { mostrarCardSeveridadValvular(function(){}); } catch(e) { out.err = e.message; }
    var lee = function(id){ var e = document.getElementById(id);
      if (!e || !e.options) return null;
      return Array.prototype.map.call(e.options, function(o){ return o.value + '|' + o.textContent.trim() }) };
    out.abrio = !!document.getElementById('pdf-review-overlay');
    out['rev-im'] = lee('rev-im'); out['rev-ia'] = lee('rev-ia'); out['rev-it'] = lee('rev-it');
    var ov = document.getElementById('pdf-review-overlay'); if (ov) ov.remove();
    return JSON.stringify(out);
  })()`));

  /* ── Maquetación en siete anchos ──────────────────────────────────────────────────────────
     Se mide con las dos pastillas PRENDIDAS: con los bloques en display:none no hay geometría y
     todo daría cero. Los anchos cubren la banda que el prompt pide vigilar (768-1200) y el móvil. */
  const anchos = [1440, 1280, 1200, 1024, 900, 768, 390, 360];
  const layout = {};
  for (const w of anchos) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: w, height: 900, deviceScaleFactor: 1, mobile: w <= 430 }, sessionId);
    await new Promise((r) => setTimeout(r, 260));
    layout[w] = JSON.parse(await ev(`(function(){
      window.__P.limpiar(); window.__P.denominador();
      if (window.__P.pill('tricuspide','insuf') !== true) toggleValvPill('tricuspide','insuf');
      if (window.__P.pill('tricuspide','esten') !== true) toggleValvPill('tricuspide','esten');
      return JSON.stringify(window.__P.layout());
    })()`));
  }
  await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);

  /* ── Punto 4: un estudio guardado ANTIGUO reabre igual ───────────────────────────────────
     Los cuatro grados alcanzables más el 3, que esta tanda dejó inalcanzable y que Maicol declaró
     que no existe en ningún estudio guardado: se mide igual para que el borde quede documentado
     con un número y no con una suposición. */
  const roundTrip = {};
  for (const g of ['0', '1', '2', '3', '4']) {
    roundTrip[g] = JSON.parse(await ev(
      `JSON.stringify(window.__P.roundTrip('${g}', { it_vc:'', it_densidad:'' }))`));
  }
  /* Un legado con los parámetros CARGADOS: acá `calcIT_ESC` sí tiene con qué votar, así que mide
     el otro camino —el que recalcula— y no sólo el de reponer un grado huérfano. */
  roundTrip['4+params'] = JSON.parse(await ev(
    `JSON.stringify(window.__P.roundTrip('4', { it_vc:'8', it_densidad:'denso' }))`));

  /* ── Punto 5: mitral, aórtica y pulmonar ────────────────────────────────────────────────── */
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
    listo, consola, escenas, tarjeta, layout, roundTrip, otras,
  }, null, 2));

  /* ⚠️ Cerrar el servidor Y salir a mano: `cdp.close()` + `proc.kill()` no alcanzan —el servidor
     HTTP sigue escuchando y el event loop vivo—, se juntan zombies reteniendo su Chrome y un A/B
     encadenado nunca llega al segundo lado. Parece lentitud, es un cuelgue. */
  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
