#!/usr/bin/env node
/**
 * _probe_emauto.mjs — sonda A/B de SOLO LECTURA para las CINCO correcciones de la MITRAL
 * (2026-10-08). No muta index.html: comprueba su md5 al principio y al final.
 *
 * Mide cinco bloques, cada uno seleccionable con --solo:
 *   A — las OCHO escenas del auto-apagado de la estenosis mitral, CON TECLAS REALES del navegador
 *       (Input.dispatchKeyEvent), no asignando `value` por script: boton, DUENO (VALV_ESTEN_AUTO),
 *       clave de localStorage, grado, marca manual, informe en tres estilos y EN SUMA.
 *   B — la tabla de las NUEVE opciones de vm_morf x tres estilos x EN SUMA.
 *   C — «Sin estenosis» a mano sobre valores medidos, con su control (categoria ya «nada») y un
 *       control negativo (sin un solo dato mitral).
 *   D — el title del DVI protesico y el A/B del DVI 3,61 sin IM y con im_grado = 4.
 *   E — la fila del Excel (recuento de columnas) y el control negativo de las OTRAS valvulas y del
 *       Doppler mitral, con escenario base cargado para que el control tenga DENOMINADOR.
 *   MOV — 1200, 390 y 360 px: desborde y barra horizontal.
 *
 *   node scripts/_probe_emauto.mjs --file /tmp/index.HEAD.html > /tmp/em.HEAD.json
 *   node scripts/_probe_emauto.mjs                            > /tmp/em.NEW.json
 *   node scripts/_probe_emauto.mjs --solo B --ver
 *
 * Infraestructura (servidor + Chrome + CDP + cierre del arbol de procesos + teclas reales)
 * calcada de scripts/_probe_aopulmo.mjs.
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-ap-'));
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

  /* Abre lo que haga falta para que el campo tenga geometria. Calcado de auditoria_botones.mjs. */
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

  /* DENOMINADOR. Abre la pestana de Valvulas, las cuatro tarjetas y el cajon de estenosis de la
     mitral, y CONFIRMA que los campos que esta tanda tipea tienen geometria. Una sonda sobre un
     arbol cerrado tipea en la nada, el campo queda vacio y todo sale «sin cambios». */
  abrirTodo() {
    try { showTab('valvulas') } catch(e) {}
    ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'].forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && s.style.display === 'none') { try { toggleEteSeccion(tok) } catch(e) {} }
    });
    var det = document.getElementById('bloque-em-detalle');
    if (det) det.style.display = 'block';
    return { tab: window.__P.vis('tab-valvulas'), avm_plan: window.__P.vis('avm_plan'),
             em_gmedio: window.__P.vis('em_gmedio'), em_grado: window.__P.vis('em_grado'),
             pill: window.__P.vis('pill-esten-mitral'),
             ok: window.__P.vis('avm_plan') === true && window.__P.vis('em_gmedio') === true } },

  /* Estado de partida limpio y SIN DUENO: borra las seis claves, apaga lo prendido, vacia las dos
     marcas y el Set. Sin vaciar el Set, la escena siguiente arranca con la mitral ya «de la app». */
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

  /* Solo para el escenario BASE de las otras valvulas (control negativo): no es un gesto medido. */
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
    try { return _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-08', campos: campos }) }
    catch(e) { return 'EXC: ' + e.message } },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  /* POR LINEA Y NO POR ORACION: el informe se arma con inf.push(...) y se une por salto de linea,
     asi que UNA linea es el parrafo entero de una valvula. Partido por oracion se pierden las que
     no nombran la valvula. */
  frasesVM(texto) {
    var re = /mitral|\\bVM\\b|\\bEM\\b|\\bIM\\b|AVm/i;
    return String(texto || '').split(/\\n/).map(function(s){ return s.trim() })
      .filter(function(s){ return s && re.test(s) }) },
  /* CONTROL NEGATIVO: las lineas de las OTRAS TRES valvulas y del Doppler mitral. Si una de estas
     se mueve, el cambio se fue de la mitral. */
  frasesOtras(texto) {
    var re = /a[\\u00f3o]rtic|tric[\\u00fau]sp|pulmonar|llenado|diast[\\u00f3o]lic|\\bE\\/A\\b/i;
    return String(texto || '').split(/\\n/).map(function(s){ return s.trim() })
      .filter(function(s){ return s && re.test(s) }) },
  sumaVM(suma) {
    return String(suma || '').split(/\\n+/).map(function(s){ return s.trim() })
      .filter(function(s){ return s && /\\bEM\\b|\\bIM\\b|\\bVM\\b|mitral/i.test(s) }) },

  /* LA FOTO DE LA ESTENOSIS MITRAL: boton, DUENO, clave de localStorage, grado, marca y foto. */
  fotoEM() {
    return {
      pill:   window.__P.pill('mitral','esten'),
      dueno:  (function(){ try { var s = window.VALV_ESTEN_AUTO;
                 return s ? s.has('mitral') : 'SIN SET' } catch(e) { return 'EXC' } })(),
      clave:  (function(){ try { return localStorage.getItem('valv-pill-esten-mitral') }
                 catch(e) { return 'EXC' } })(),
      em_grado: window.__P.val('em_grado'),
      manual: !!(window.esqSevManual && window.esqSevManual.em),
      fotoCalc: (function(){ try { return window._sevCalcAlFijar
                   ? (window._sevCalcAlFijar.em === undefined ? null : window._sevCalcAlFijar.em)
                   : null } catch(e) { return 'EXC' } })(),
      avm_plan: window.__P.val('avm_plan'),
      em_gmedio: window.__P.val('em_gmedio'),
      vm_morf: window.__P.val('vm_morf'),
      catClave: (function(){ try { return emCategoria().clave } catch(e) { return 'EXC' } })(),
      sevIntegrada: window.__P.txt('em-sev-integrada'),
      badge: window.__P.txt('em-thp-badge'),
      emAviso: window.__P.txt('em-manual-aviso'),
      emFundVis: window.__P.vis('em-fund'),
      sevManualEspejo: window.__P.val('sev_manual')
    } },

  /* QUIEN RECIBE EL CLIC EN ESE PUNTO. Sin esto, un clic dispachado sobre coordenadas tapadas por
     otro nodo se informa como «clic ok» y la escena mide un gesto que no ocurrio — que es
     exactamente lo que paso en la primera corrida con la pastilla de la mitral. */
  quienEsta(id, x, y) {
    var t = document.getElementById(id);
    var e = document.elementFromPoint(x, y);
    if (!e) return { enPunto: null, esElBlanco: false };
    return { enPunto: (e.id || ('<' + e.tagName.toLowerCase() + ' ' + String(e.className || '') + '>')),
             esElBlanco: !!(t && (e === t || t.contains(e) || e.contains(t))) } },

  /* Las opciones del menu ▼ de la estenosis mitral, ya pintadas, con su id para el clic real. */
  menuOpts() {
    var m = document.getElementById('sevmenu-esten-mitral'); if (!m) return null;
    return Array.from(m.querySelectorAll('button')).map(function(b, i){
      if (!b.id) b.id = '__opt_em_' + i;
      return { id: b.id, txt: (b.textContent || '').trim() } }) },

  guardados() { try { return getInformes().map(function(i){
      return { id: i.id, nombre: i.nombre } }) } catch(e) { return 'EXC: ' + e.message } },

  desborde() {
    var d = document.documentElement;
    return { scrollW: d.scrollWidth, clientW: d.clientWidth, hayBarra: d.scrollWidth > d.clientWidth + 1 } },
  desbordeDe(id) {
    var e = document.getElementById(id); if (!e) return null;
    var r = e.getBoundingClientRect(), d = document.documentElement;
    return { der: Math.round(r.right), clientW: d.clientWidth, desborda: r.right > d.clientWidth + 1,
             w: Math.round(r.width) } },

  listo() {
    var faltan = ['generarInforme','pillOn','toggleValvPill','showTab','limpiarCampos','calcEM',
                  'emCategoria','emGradoAuto','setEstiloInforme','valvMorfDe','valvAutoPrenderEsten',
                  'nuevoEstudio','guardarInforme','editarInforme','getInformes','_labExcelRow']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (faltan.length) return { listo:false, faltan:faltan };
    if (!document.getElementById('informe_texto')) return { listo:false, por:'sin informe_texto' };
    if (!document.getElementById('avm_plan')) return { listo:false, por:'sin avm_plan' };
    return { listo:true, tieneApagarAuto: typeof window._emApagarAuto === 'function' } }
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
  const paso = (n) => { _paso = n; if (VER || process.env.EMAUTO_TRAZA) console.error('  · ' + n); };
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
    for (const ch of String(valor)) await tecla(ch, ch);
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
      await tecla('Backspace', null);
      await pausa(70);
      pasos.push({ tras: i + 1, campo: await ev(`window.__P.val(${JSON.stringify(id)})`),
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

  /* ⚠️ EL AVISO LEGAL TAPA LA PAGINA ENTERA Y SE COME TODOS LOS CLICS, Y ASI LAS ESCENAS 4, 5 Y 8
     DE LA PRIMERA CORRIDA NO PROBARON NADA. `#modalAvisoEco` es un `position:fixed;inset:0` con
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
  const tapa = JSON.parse(await ev(`JSON.stringify(window.__P.quienEsta('pill-esten-mitral',
    (window.__P.centro('pill-esten-mitral')||{x:0}).x, (window.__P.centro('pill-esten-mitral')||{y:0}).y))`));
  if (avisoCerrado !== 'none' && avisoCerrado !== 'NO EXISTE') {
    throw new Error('EL AVISO LEGAL SIGUE PUESTO (' + avisoCerrado + ') — ningun clic llegaria al arbol');
  }

  const out = { archivo: FARG, listo: JSON.parse(listo), aviso: { boton: avisoBtn, clic: avisoClic,
    display: avisoCerrado, quienTapaLaPastilla: tapa } };
  const hacer = (k) => !SOLO || SOLO === k;

  /* ══ HELPERS DE ESCENA ════════════════════════════════════════════════════════════════════ */
  const foto = async () => JSON.parse(await ev(`JSON.stringify(window.__P.fotoEM())`));
  const base = async () => {
    await ev(`(function(){ window.__P.limpiar(); return 1 })()`);
    const d = JSON.parse(await ev(`JSON.stringify(window.__P.abrirTodo())`));
    if (!d.ok) throw new Error('DENOMINADOR: los campos de la mitral no tienen geometria: ' + JSON.stringify(d));
    return d;
  };
  /* El informe en los TRES estilos mas el EN SUMA, acotado a la mitral, con el control negativo
     de las otras tres valvulas y del Doppler mitral al lado. */
  const textos = async () => {
    const o = {};
    for (const est of ['conciso', 'estandar', 'narrativo']) {
      const r = JSON.parse(await ev(`JSON.stringify(window.__P.informe(${JSON.stringify(est)}))`));
      o[est] = {
        vm:    JSON.parse(await ev(`JSON.stringify(window.__P.frasesVM(${JSON.stringify(r.inf)}))`)),
        otras: JSON.parse(await ev(`JSON.stringify(window.__P.frasesOtras(${JSON.stringify(r.inf)}))`)),
      };
      if (est === 'estandar') o.suma = JSON.parse(await ev(`JSON.stringify(window.__P.sumaVM(${JSON.stringify(r.suma)}))`));
      if (est === 'estandar') o.sumaEntero = r.suma;
    }
    return o;
  };

  /* ══ A — LAS OCHO ESCENAS DEL AUTO-APAGADO, CON TECLAS REALES ═════════════════════════════ */
  if (hacer('A')) {
    const A = {};

    /* 1 y 2 y 3 son la MISMA cadena de gestos: prende, se corrige, se vacia. Van juntas porque
       el estado de la 2 es el resultado de la 1 — separarlas mediria tres estudios distintos. */
    {
      /* AISLADO: un gesto que cuelga o lanza no se lleva las otras siete escenas; el error
         queda EN la escena, que es lo que distingue «no se midio» de «se midio y no cambio». */
      const e = {};
      try {
        paso('base 1-2 AVm 1,2 → '); e.denominador = await base();
      e.tipeo12 = await tipear('avm_plan', '1.2');
      e.p1_avm12 = await foto();
      e.p1_textos = await textos();
      e.retipeo30 = await tipear('avm_plan', '3.0');
      e.p2_avm30 = await foto();
      e.p2_textos = await textos();
      } catch (x) { e.FALLO = String(x.message || x); }
      A['1-2 AVm 1,2 → prende · corregido a 3,0 → ?'] = e;
    }
    {
      /* AISLADO: un gesto que cuelga o lanza no se lleva las otras siete escenas; el error
         queda EN la escena, que es lo que distingue «no se midio» de «se midio y no cambio». */
      const e = {};
      try {
        paso('base 3 AVm vaciado '); e.denominador = await base();
      e.tipeo12 = await tipear('avm_plan', '1.2');
      e.conAvm = await foto();
      paso('backspace avm_plan'); e.borrado = await borrarConBackspace('avm_plan', 'fotoEM');
      e.p3_vacio = await foto();
      e.p3_textos = await textos();
      } catch (x) { e.FALLO = String(x.message || x); }
      A['3 AVm vaciado con Backspace → ?'] = e;
    }
    /* 4 — EL BOTON LO PRENDE EL MEDICO con datos que NO dan grado, y despues se borran los datos.
       No se apaga: el Set no lo tiene. */
    {
      /* AISLADO: un gesto que cuelga o lanza no se lleva las otras siete escenas; el error
         queda EN la escena, que es lo que distingue «no se midio» de «se midio y no cambio». */
      const e = {};
      try {
        paso('base 4 boton prendi'); e.denominador = await base();
      e.tipeo30 = await tipear('avm_plan', '3.0');
      e.antesDelClic = await foto();
      paso('4 clic pastilla'); e.clic = await clicEn('pill-esten-mitral');
      e.trasClic = await foto();
      paso('backspace avm_plan'); e.borrado = await borrarConBackspace('avm_plan', 'fotoEM');
      e.p4_final = await foto();
      e.p4_textos = await textos();
      } catch (x) { e.FALLO = String(x.message || x); }
      A['4 boton prendido A MANO con datos · se borran los datos → NO se apaga'] = e;
    }
    /* 5 — APAGADO A MANO con el AVm cargado: no se reprende, ni al retipear un AVm mas severo. */
    {
      /* AISLADO: un gesto que cuelga o lanza no se lleva las otras siete escenas; el error
         queda EN la escena, que es lo que distingue «no se midio» de «se midio y no cambio». */
      const e = {};
      try {
        paso('base 5 apagado A MA'); e.denominador = await base();
      e.tipeo12 = await tipear('avm_plan', '1.2');
      e.appPrendio = await foto();
      e.clicApaga = await clicEn('pill-esten-mitral');
      e.trasApagar = await foto();
      /* ⚠️ APAGAR LA PASTILLA ESCONDE EL CAMPO, y la primera corrida lo informo como un retipeo
         hecho: `via: foco-dom (nodo sin geometria)` y el AVm seguia en 1,2, o sea que el paso que
         prueba «no se reprende» NO HABIA OCURRIDO. El cajon lo reabre el arnes (`display:block`,
         lo mismo que hace `abrirTodo`) y se declara: el BOTON sigue apagado, que es la condicion
         que la escena mide. */
      e.reabreCajon = JSON.parse(await ev(`JSON.stringify(window.__P.abrirTodo())`));
      e.trasReabrir = await foto();
      e.retipeo10 = await tipear('avm_plan', '1.0');
      e.p5_final = await foto();
      e.p5_textos = await textos();
      } catch (x) { e.FALLO = String(x.message || x); }
      A['5 apagado A MANO con AVm 1,2 → NO se reprende'] = e;
    }
    /* 6 — GRADO ELEGIDO EN LA PASTILLA (clic real en el ▼ y en la opcion) y despues los datos
       cambian: el grado del medico sobrevive y el boton no se apaga. */
    {
      /* AISLADO: un gesto que cuelga o lanza no se lleva las otras siete escenas; el error
         queda EN la escena, que es lo que distingue «no se midio» de «se midio y no cambio». */
      const e = {};
      try {
        paso('base 6 grado elegid'); e.denominador = await base();
      e.tipeo12 = await tipear('avm_plan', '1.2');
      e.appPrendio = await foto();
      paso('6 clic menu'); e.clicMenu = await clicEn('sevbtn-esten-mitral');
      e.opciones = JSON.parse(await ev(`JSON.stringify(window.__P.menuOpts())`));
      const mod = (e.opciones || []).find((o) => /moderada/i.test(o.txt));
      e.opcionElegida = mod || null;
      if (mod) e.clicOpcion = await clicEn(mod.id);
      e.trasElegir = await foto();
      e.retipeo30 = await tipear('avm_plan', '3.0');
      e.p6_final = await foto();
      e.p6_textos = await textos();
      } catch (x) { e.FALLO = String(x.message || x); }
      A['6 grado elegido en la pastilla ▼ · datos que cambian → NO se apaga'] = e;
    }
    /* 7 — «Nuevo estudio» desde la pastilla prendida por la APP. */
    {
      /* AISLADO: un gesto que cuelga o lanza no se lleva las otras siete escenas; el error
         queda EN la escena, que es lo que distingue «no se midio» de «se midio y no cambio». */
      const e = {};
      try {
        paso('base 7 «Nuevo estud'); e.denominador = await base();
      e.tipeo12 = await tipear('avm_plan', '1.2');
      e.appPrendio = await foto();
      paso('7 nuevoEstudio'); e.nuevo = await ev(`(function(){ try { nuevoEstudio() } catch(x) { return 'EXC: ' + x.message }
        return 'llamado' })()`);
      await pausa(260);
      /* El modal de «Nuevo estudio» pregunta; se contesta con el clic real que descarta. */
      /* ⚠️ LOS BOTONES DEL MODAL SE BUSCAN POR SU `onclick` Y DENTRO DEL MODAL, no por su texto en
         todo el documento: la primera corrida barrio `document.querySelectorAll('button')` y se
         trajo «🧬 Amiloidosis» y las cuatro pastillas de estenosis, asi que el clic de «descartar»
         cayo en otra parte y «Nuevo estudio» nunca corrio. */
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
      e.p7_final = await foto();
      e.p7_textos = await textos();
      } catch (x) { e.FALLO = String(x.message || x); }
      A['7 «Nuevo estudio» con la pastilla prendida por la app'] = e;
    }
    /* 8 — REABRIR UN GUARDADO cuya pastilla la habia prendido el MEDICO. Las claves `valv-pill-*`
       NO viajan con el estudio (lo declara el narrativo de la mitral), asi que esto mide lo que
       pasa cuando el estado de interfaz se perdio y el dato sigue. */
    {
      /* AISLADO: un gesto que cuelga o lanza no se lleva las otras siete escenas; el error
         queda EN la escena, que es lo que distingue «no se midio» de «se midio y no cambio». */
      const e = {};
      try {
        paso('base 8 reabrir un g'); e.denominador = await base();
      e.nombre = await tipear('nombre', 'Prueba EM');
      e.tipeo12 = await tipear('avm_plan', '1.2');
      paso('8 clic apaga'); e.clicApaga = await clicEn('pill-esten-mitral');   // la app la habia prendido: queda del medico
      paso('8 clic prende'); e.clicPrende = await clicEn('pill-esten-mitral');  // y el medico la prende: clave '1', Set vacio
      e.antesDeGuardar = await foto();
      /* ⚠️ `guardarInforme()` DEVUELVE `false` LA PRIMERA VEZ, Y NO ES UN FALLO: con
         `valvSevConfirmada` en falso muestra la card de severidades valvulares y el guardado REAL
         ocurre al confirmarla. La primera corrida leyo ese `false` como «no guardo», la lista de
         guardados salio vacia y la escena 8 no probo nada. */
      paso('8 guardarInforme'); e.guardado = await ev(`(function(){ try { return String(guardarInforme()) } catch(x) { return 'EXC: ' + x.message } })()`);
      await pausa(350);
      e.cardSev = await ev(`(function(){ return document.getElementById('rev-confirm') ? 'visible' : 'no hay card' })()`);
      if (e.cardSev === 'visible') { e.clicConfirmar = await clicEn('rev-confirm'); await pausa(700); }
      await pausa(500);
      e.listaGuardados = JSON.parse(await ev(`JSON.stringify(window.__P.guardados())`));
      await ev(`(function(){ window.__P.limpiar(); return 1 })()`);
      const ids = e.listaGuardados;
      if (Array.isArray(ids) && ids.length) {
        e.reabrir = await ev(`(function(){ try { editarInforme(${JSON.stringify(ids[ids.length-1].id)}) }
          catch(x) { return 'EXC: ' + x.message } return 'modal' })()`);
        await pausa(300);
        e.clicOk = await clicEn('edit-ok');
        await pausa(700);
      }
      await ev(`(function(){ window.__P.abrirTodo(); return 1 })()`);
      e.p8_final = await foto();
      e.p8_textos = await textos();
      } catch (x) { e.FALLO = String(x.message || x); }
      A['8 reabrir un guardado con la pastilla prendida por el medico'] = e;
    }
    out.A = A;
  }

  /* ══ B — LOS NUEVE TEXTOS DE vm_morf × TRES ESTILOS × EN SUMA ═════════════════════════════ */
  if (hacer('B')) {
    const B = {};
    const MORFS = JSON.parse(await ev(`(function(){ var e = document.getElementById('vm_morf');
      return JSON.stringify(Array.from(e.options).map(function(o){ return o.value })) })()`));
    B.__opciones = MORFS;
    for (const m of MORFS) {
      await base();
      /* La morfologia se elige por el desplegable y no se tipea: es un <select>. */
      const r = await ev(`(function(){ var e = document.getElementById('vm_morf');
        e.value = ${JSON.stringify(m)};
        e.dispatchEvent(new Event('change', { bubbles: true }));
        return e.value })()`);
      const t = {};
      for (const est of ['conciso', 'estandar', 'narrativo']) {
        const g = JSON.parse(await ev(`JSON.stringify(window.__P.informe(${JSON.stringify(est)}))`));
        t[est] = JSON.parse(await ev(`JSON.stringify(window.__P.frasesVM(${JSON.stringify(g.inf)}))`));
        if (est === 'estandar') t.EN_SUMA = g.suma;
      }
      B[m] = { leido: r, textos: t, foto: await foto() };
    }
    out.B = B;
  }

  /* ══ C — «SIN ESTENOSIS» A MANO SOBRE VALORES MEDIDOS ═════════════════════════════════════ */
  if (hacer('C')) {
    const C = {};
    /* El caso del pedido: AVm 1,20 por planimetria + gradiente medio 9, y «Sin» elegido a mano. */
    {
      const e = { denominador: (paso('base'), await base()) };
      try {
      e.tipeoAvm = await tipear('avm_plan', '1.20');
      e.tipeoGm  = await tipear('em_gmedio', '9');
      e.antes = await foto();
      e.antesTextos = await textos();
      /* ══ LOS DOS GESTOS DEL PEDIDO, MEDIDOS APARTE ══════════════════════════════════════
         (1) EL CLIC REAL en el boton «Estenosis»: `toggleValvPill` → `valvApagarGrado` →
             `valvSev.aplicar(…, centinela)` escribe «sin» Y pone `esqSevManual.em`, o sea produce
             el `emSinExplicito` del pedido con un gesto de verdad.
         (2) el desplegable nativo `em_grado` en «Sin estenosis». El ▼ de la pastilla ya NO ofrece
             «Sin» en ninguna valvula (regla 2 del 2026-10-03), asi que esta es la otra puerta; se
             escribe por script y se DECLARA, porque un <select> no se tipea. */
      /* ⚠️ `generarInforme` DEJA LA PESTANA DEL INFORME AL FRENTE, y la pastilla oculta no tiene
         geometria: la primera corrida informo `NO SE PUDO — nodo sin geometria` para este clic
         justo despues de `antesTextos`. Se vuelve a Valvulas antes del gesto. */
      e.reabreAntesDelClic = JSON.parse(await ev(`JSON.stringify(window.__P.abrirTodo())`));
      e.clicApagaBoton = await clicEn('pill-esten-mitral');
      await pausa(250);
      e.conSinPorBoton = await foto();
      e.conSinPorBotonTextos = await textos();
      e.reabreCajon = JSON.parse(await ev(`JSON.stringify(window.__P.abrirTodo())`));
      e.eligeSin = await ev(`(function(){ var s = document.getElementById('em_grado');
        s.value = 'sin'; s.dispatchEvent(new Event('change', { bubbles: true })); return s.value })()`);
      await pausa(200);
      e.conSin = await foto();
      e.conSinTextos = await textos();
      } catch (x) { e.FALLO = String(x.message || x); }
      C['AVm 1,20 + gradiente 9 · «Sin» a mano'] = e;
    }
    /* CONTROL: la categoria YA es «nada» (AVm 2,0 + gradiente 3). Tiene que quedar identico a HEAD. */
    {
      const e = { denominador: (paso('base'), await base()) };
      try {
      e.tipeoAvm = await tipear('avm_plan', '2.0');
      e.tipeoGm  = await tipear('em_gmedio', '3');
      e.sinElegir = await foto();
      e.sinElegirTextos = await textos();
      e.eligeSin = await ev(`(function(){ var s = document.getElementById('em_grado');
        s.value = 'sin'; s.dispatchEvent(new Event('change', { bubbles: true })); return s.value })()`);
      await pausa(200);
      e.conSin = await foto();
      e.conSinTextos = await textos();
      } catch (x) { e.FALLO = String(x.message || x); }
      C['CONTROL AVm 2,0 + gradiente 3'] = e;
    }
    /* CONTROL NEGATIVO 2: sin ningun dato mitral, el informe tiene que seguir negando. */
    {
      const e = { denominador: (paso('base'), await base()) };
      try {
      e.vacio = await foto();
      e.vacioTextos = await textos();
      } catch (x) { e.FALLO = String(x.message || x); }
      C['CONTROL NEGATIVO sin un solo dato mitral'] = e;
    }
    out.C = C;
  }

  /* ══ D — EL TITLE DEL DVI PROTESICO Y EL A/B DEL DVI 3,61 ═════════════════════════════════ */
  if (hacer('D')) {
    const D = {};
    D.title = await ev(`(function(){
      var fila = document.getElementById('vm-prot-dvi');
      var n = fila; while (n && n.nodeType === 1 && !(n.className||'').match(/calc-row/)) n = n.parentNode;
      var lbl = n && n.querySelector ? n.querySelector('.calc-lbl') : null;
      return lbl ? lbl.getAttribute('title') : 'SIN calc-lbl' })()`);
    /* DVI 3,61 = VTI mitral 65 / VTI TSVI 18. Sin IM y con im_grado = 4. */
    for (const imG of ['0', '4']) {
      await base();
      await ev(`(function(){ var e = document.getElementById('vm_morf');
        e.value = 'Protesis mecanica'; return 1 })()`);
      /* El token exacto sale del propio <select>, sin acentos a mano. */
      const tok = await ev(`(function(){ var e = document.getElementById('vm_morf');
        var o = Array.from(e.options).find(function(x){ return /mec[\\u00e1a]nica/i.test(x.value) });
        if (!o) return 'NO HAY OPCION'; e.value = o.value;
        e.dispatchEvent(new Event('change', { bubbles: true })); return e.value })()`);
      const t1 = await tipear('em_vtimit', '65');
      const t2 = await tipear('em_vtitsvi', '18');
      await ev(`(function(){ var s = document.getElementById('im_grado');
        s.value = ${JSON.stringify(imG)}; s.dispatchEvent(new Event('change', { bubbles: true }));
        if (typeof sincronizarGradoIM === 'function') try { sincronizarGradoIM() } catch(x){}
        return s.value })()`);
      await pausa(250);
      D['im_grado=' + imG] = {
        morf: tok, tipeos: [t1, t2],
        eoa: await ev(`window.__P.txt('vm-prot-eoa')`),
        dviPantalla: await ev(`window.__P.txt('vm-prot-dvi')`),
        R: JSON.parse(await ev(`(function(){ try { var r = vmProtEOA();
          return JSON.stringify({ dvi:r.dvi, dviFuente:r.dviFuente, motivo:r.motivo,
            porDvi:r.porDvi, porEoa:r.porEoa, obstr:r.obstr, valido:r.valido, eoa:r.eoa }) }
          catch(x) { return JSON.stringify({ err: x.message }) } })()`)),
        textos: await textos(),
      };
    }
    out.D = D;
  }

  /* ══ E — EXCEL, Y EL CONTROL NEGATIVO DE LAS OTRAS VALVULAS CON ESCENARIO BASE ════════════ */
  if (hacer('E')) {
    const E = {};
    await base();
    /* ESCENARIO BASE COMPARTIDO: las otras tres valvulas y el Doppler mitral cargados, para que el
       control negativo tenga DENOMINADOR. Sin esto sus frases salen vacias en los dos lados del
       A/B y «identicas» no significa nada. */
    E.baseOtras = JSON.parse(await ev(`(function(){
      window.__P.set('va_morf', 'Trivalva normal'); window.__P.set('vmax_ao', '4.2');
      window.__P.set('it_grado', '2'); window.__P.set('vmax_it', '3.0');
      window.__P.set('vp_vmax', '3.5');
      window.__P.set('onda_e', '80'); window.__P.set('onda_a', '60'); window.__P.set('e_prima_sep', '6');
      return JSON.stringify({ vmax_ao: window.__P.val('vmax_ao'), it_grado: window.__P.val('it_grado'),
        vp_vmax: window.__P.val('vp_vmax'), onda_e: window.__P.val('onda_e') }) })()`));
    E.tipeoAvm = await tipear('avm_plan', '1.2');
    E.foto = await foto();
    E.textos = await textos();
    /* ⚠️ `_labExcelRow` DEVUELVE UN OBJETO, NO UN ARREGLO, y la primera corrida informo «NO ES
       ARRAY» en vez de un recuento. El 434 que vigila TC de la suite se cuenta igual que ahi:
       `Object.keys(_labExcelRow({id:0,campos:{}}))` pasado por `_labOrdenarCols`. */
    E.excelColumnas = await ev(`(function(){ try {
      var k = Object.keys(_labExcelRow({ id:0, campos:{} }));
      return (typeof _labOrdenarCols === 'function' ? _labOrdenarCols(k) : k).length }
      catch(e) { return 'EXC: ' + e.message } })()`);
    E.excelEM = JSON.parse(await ev(`(function(){ try { var f = window.__P.excel();
      var o = {}; Object.keys(f).forEach(function(k){
        if (/\bEM\b|AVm|DVI mitral|mitral|\bIM\b/i.test(k)) o[k] = f[k] });
      return JSON.stringify(o) } catch(e) { return JSON.stringify({ err: e.message }) } })()`));
    E.campos = JSON.parse(await ev(`(function(){ var c = window.__P.campos(); var o = {};
      Object.keys(c).forEach(function(k){ if (/^em_|^avm_|^vm_|^im_|^sev_manual$/.test(k)) o[k] = c[k] });
      return JSON.stringify(o) })()`));
    out.E = E;
  }

  /* ══ MOV — 360, 390 y 1200 px: sin desborde ni barra horizontal ═══════════════════════════ */
  if (hacer('MOV')) {
    const mov = {};
    for (const w of [1200, 390, 360]) {
      await cdp.send('Emulation.setDeviceMetricsOverride',
        { width: w, height: 900, deviceScaleFactor: 1, mobile: w <= 430 }, sessionId);
      await pausa(320);
      mov[w] = JSON.parse(await ev(`(function(){
        window.__P.limpiar(); window.__P.abrirTodo();
        window.__P.set('avm_plan', '1.2'); window.__P.set('em_gmedio', '9');
        try { showTab('valvulas') } catch(e) {}
        var _sec = document.getElementById('ete-seccion-valv-mitral');
        if (_sec && _sec.style.display === 'none') { try { toggleEteSeccion('valv-mitral') } catch(e) {} }
        return JSON.stringify({ global: window.__P.desborde(),
          tarjeta: window.__P.desbordeDe('ete-seccion-valv-mitral'),
          lesiones: window.__P.desbordeDe('vm-lesiones'),
          detalle: window.__P.desbordeDe('bloque-em-detalle'),
          grado: window.__P.desbordeDe('bloque-esten-mitral'),
          pill: window.__P.vis('pill-esten-mitral'),
          gradoVis: window.__P.vis('em_grado') }) })()`));
    }
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    out.MOV = mov;
  }

  out.consola = cdp.errores ? cdp.errores.slice(0, 20) : 'sin listener';

  const despues = await md5(join(RAIZ, 'index.html'));
  out.md5_antes = antes; out.md5_despues = despues; out.index_intacto = antes === despues;
  console.log(JSON.stringify(out, null, 2));
  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });

