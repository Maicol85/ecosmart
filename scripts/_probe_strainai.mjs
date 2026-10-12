#!/usr/bin/env node
/**
 * _probe_strainai.mjs — sonda A/B de SOLO LECTURA para los CAMPOS DE STRAIN DE LA AURICULA
 * IZQUIERDA y la ONDA L: su sincronia en los dos sentidos, su marca «(revisar)», y el uso que
 * les dan la BSE 2024 (Figuras 17 y 18) y la ASE 2025 (parametros suplementarios, folio 555).
 *
 * Infraestructura calcada de scripts/_probe_bse2024.mjs (teclas y clics reales, cierre del
 * arbol de Chrome por GRUPO y por PID PROPIO, cierre del aviso legal con su denominador, md5 al
 * principio y al final). NO muta index.html.
 *
 *   node scripts/_probe_strainai.mjs --file /tmp/index.HEAD.html > /tmp/st.HEAD.json
 *   node scripts/_probe_strainai.mjs                             > /tmp/st.NEW.json
 *
 * Grupos (--solo sinc|marca|vacio|bse17|bse18|ase|bordes|signo|excel|ancho|guardado):
 *   sinc    — escribir y BORRAR el LARS y el strain de contraccion desde cada pestaña, con lo que
 *             queda en los dos campos antes y despues. Incluye el control negativo: el strain de
 *             conducto y la onda L viven en UN solo lugar y no se espejan con nada.
 *   marca   — la marca «(revisar)» de los seis avisos, dentro y fuera de banda, y que NO cambia
 *             ningun veredicto (el badge se informa al lado).
 *   vacio   — CONTROL NEGATIVO MAYOR: con los campos nuevos VACIOS, las seis superficies de las
 *             tres guias en ritmo sinusal y en FA. Es lo que se compara contra HEAD.
 *   bse17   — la sustitucion por strain de la Figura 17 (pag. 36) con el LAPs y la onda L.
 *   bse18   — la Figura 18 (pag. 38): sus dos cortes de strain y sus cuatro suplementarios.
 *   ase     — la onda L >= 50 cm/s como suplementario de la ASE 2025 (folio 555).
 *   bordes  — tripletes por corte: apenas abajo, JUSTO en el corte, apenas arriba.
 *   signo   — el valor absoluto: -12 y +12 de contraccion tienen que dar lo MISMO.
 *   excel   — el numero de columnas, el encabezado nuevo y su posicion.
 *   ancho   — la maqueta de los campos nuevos a 1200, 390 y 360 px, en los dos temas.
 *
 * ⚠️ DENOMINADOR. Un conteo sobre una pestaña que no abrio da cero y parece acuerdo perfecto.
 * Cada escena informa que tipeo, que quedo en el campo y cuantas filas vio la ventana.
 *
 * ⚠️ LOS GRUPOS SE CORREN DE A UNO. Varios en una sola sesion de pagina se cuelgan sobre el
 * arbol de HEAD (medido en las dos tandas anteriores).
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
   ⚠️ CUERPO DE TEMPLATE LITERAL: NI UN ACENTO GRAVE adentro, tampoco en los comentarios, y
   la barra-ese del regex va DOBLE —dentro de un template literal se cocina a la letra ese y el
   regex termina borrando todas las eses del texto, que es un falso con pinta de medicion buena
   (scripts/check_backticks.py da la linea exacta cuando se cuela un acento grave). */
const SONDA = `
window.__P = {
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  norm(s) { return String(s == null ? '' : s).replace(/\\s+/g, ' ').trim() },
  hash(s) { var h = 5381, t = window.__P.norm(s);
    for (var i = 0; i < t.length; i++) { h = ((h * 33) ^ t.charCodeAt(i)) >>> 0 }
    return h.toString(16) },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  existe(id) { return !!document.getElementById(id) },

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

  /* ⚠️ DENOMINADOR DE ENTRADA, Y AHORA SON DOS PESTAÑAS. Los campos nuevos viven en AI/VI y en
     Doppler mitral: si una de las dos no abre, la sonda tipea en la nada y TODAS las escenas de
     sincronia salen «sin cambios», que es indistinguible de «la sincronia no funciona». Se
     confirma ANTES de medir y se informa al lado del veredicto. */
  abrirTodo() {
    var o = {};
    try { showTab('ai-vi') } catch(e) {}
    try { var s = document.getElementById('sacc-ai');
      if (s) { var b = s.querySelector('.sacc-hdr');
        var cu = s.querySelector('.sacc-body');
        if (cu && getComputedStyle(cu).display === 'none' && b) b.click() } } catch(e) {}
    o.lars = window.__P.vis('lars');
    o.ai_strain_cd = window.__P.vis('ai_strain_cd');
    o.ai_strain_ct = window.__P.vis('ai_strain_ct');
    try { showTab('doppler') } catch(e) {}
    var c = document.getElementById('dop-mitral');
    if (c && getComputedStyle(c).display === 'none') c.style.display = 'block';
    o.onda_e = window.__P.vis('onda_e');
    o.lars_dop = window.__P.vis('lars_dop');
    o.ai_strain_ct_dop = window.__P.vis('ai_strain_ct_dop');
    o.onda_l = window.__P.vis('onda_l');
    o.dueno = (typeof window.diastBSE2024Evaluar === 'function');
    o.sinc = (typeof window.larsSync === 'function') && (typeof window.laContrSync === 'function');
    o.ok = (o.lars === true && o.onda_e === true);
    return o },

  /* Deja la pestaña pedida al frente. Las teclas reales necesitan geometria, y AI/VI y Doppler
     son pestañas DISTINTAS: tipear sin esto manda las teclas al documento. */
  pestana(t) { try { showTab(t) } catch(e) { return 'EXC ' + e.message }
    if (t === 'doppler') { var c = document.getElementById('dop-mitral');
      if (c && getComputedStyle(c).display === 'none') c.style.display = 'block' }
    if (t === 'ai-vi') { var s = document.getElementById('sacc-ai');
      if (s) { var cu = s.querySelector('.sacc-body'), b = s.querySelector('.sacc-hdr');
        if (cu && getComputedStyle(cu).display === 'none' && b) b.click() } }
    return t },

  limpiar() { try { limpiarCampos(true) } catch(e) {} return 1 },

  /* NO ES UN GESTO MEDIDO: solo para los <select> de escenario (ritmo, algoritmo, sexo, S/D). */
  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value } },

  /* Los CUATRO campos de esta tanda, de un saque, con su marca al lado. */
  cuatro() {
    var ids = ['lars','lars_dop','ai_strain_ct','ai_strain_ct_dop','ai_strain_cd','onda_l'];
    var o = {};
    ids.forEach(function(id){
      o[id] = { v: window.__P.val(id),
                marca: window.__P.txt(id + '-marca'),
                existe: window.__P.existe(id) } });
    return o },

  /* La banda que la app dice estar usando, preguntada a su propio dueño. */
  bandas() {
    if (typeof diastStrainBanda !== 'function') return 'SIN diastStrainBanda';
    var o = {};
    ['lars','ai_strain_ct','ai_strain_cd','onda_l'].forEach(function(id){
      try { o[id] = diastStrainBanda(id) } catch(e) { o[id] = 'EXC' } });
    return o },

  cuadro() {
    var r = window._diastResult || {};
    return { badge: window.__P.txt('dd-interp'),
             algoritmo: r.algoritmo === undefined ? null : r.algoritmo,
             texto: r.texto === undefined ? null : r.texto,
             suma: r.textoSuma === undefined ? null : r.textoSuma,
             ea: window.__P.txt('ea-val'), eprom: window.__P.txt('eprom-val'),
             ee: window.__P.txt('ee-val'), psap: window.__P.val('psap_calc') } },

  btnAlgo() {
    var b = Array.from(document.querySelectorAll('button[onclick]')).find(function(x){
      return (x.getAttribute('onclick') || '').indexOf('diastAlgoAbrir') > -1 });
    if (!b) return { err: 'NO ENCONTRE el boton del algoritmo' };
    if (!b.id) b.id = '__btnAlgo';
    return { sel: b.id, texto: window.__P.norm(b.textContent) } },
  btnCerrarAlgo() {
    var b = Array.from(document.querySelectorAll('button[onclick]')).find(function(x){
      return (x.getAttribute('onclick') || '').indexOf('diastAlgoCerrar') > -1 });
    if (!b) return { err: 'NO ENCONTRE el cierre' };
    if (!b.id) b.id = '__btnCerrarAlgo';
    return { sel: b.id } },

  ventana() {
    var ov = document.getElementById('diast-algo-overlay');
    var cu = document.getElementById('diast-algo-cuerpo');
    if (!ov || !cu) return { err: 'NO EXISTE la ventana' };
    var abierta = getComputedStyle(ov).display !== 'none';
    var filas = Array.from(cu.querySelectorAll('.da-row')).map(function(f){
      var cl = f.className || '';
      return { crit: window.__P.norm((f.querySelector('.da-crit') || {}).textContent),
               val: window.__P.norm((f.querySelector('.da-val') || {}).textContent),
               estado: cl.indexOf('da-bad') > -1 ? 'POSITIVO'
                     : cl.indexOf('da-ok') > -1 ? 'negativo' : 'sin dato' } });
    return { abierta: abierta,
             titulo: window.__P.txt('diast-algo-titulo'),
             pasos: Array.from(cu.querySelectorAll('.da-paso')).map(function(p){ return window.__P.norm(p.textContent) }),
             filas: filas, nFilas: filas.length,
             res: window.__P.norm((cu.querySelector('.da-res') || {}).textContent),
             notas: Array.from(cu.querySelectorAll('.da-nota')).map(function(p){ return window.__P.norm(p.textContent) }) } },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  lineaDiast(texto) {
    return String(texto || '').split('\\n').filter(function(l){
      return /diast[oó]lic|presi[oó]n de llenado|relajaci[oó]n/i.test(l) }).map(window.__P.norm) },

  /* ⚠️ EL HASH DE CAMPOS EXCLUYE informe_texto Y en_suma A PROPOSITO. Son <textarea> con id:
     cambian en toda escena cuya frase cambia y no dicen NADA sobre los campos del estudio. La
     tanda de la BSE informo 29 de 30 «diferencias» que eran exactamente eso. */
  /* ⚠️ Y EXCLUYE TAMBIEN LOS SEIS CAMPOS NUEVOS, porque si no el hash dice «distinto» en
     TODAS las escenas por el solo hecho de que existen: contra el arbol de HEAD son seis claves
     que alla no estan. Lo que el control negativo pregunta es si los campos QUE YA ESTABAN
     cambiaron, asi que se comparan esos. El conteo va al lado para que la exclusion se vea. */
  campos() {
    var fuera = ['informe_texto','en_suma','lars','lars_dop','ai_strain_ct','ai_strain_ct_dop',
                 'ai_strain_cd','onda_l'];
    var c = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      if (fuera.indexOf(el.id) > -1) return;
      c[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      c[el.id + '__chk'] = el.checked ? '1' : '0' });
    return c },
  camposN() { return Object.keys(window.__P.campos()).length },

  excel() {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    var campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return } catch(e){}
      campos[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      campos[el.id + '__chk'] = el.checked ? '1' : '0' });
    try { return _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-12', campos: campos }) }
    catch(e) { return 'EXC: ' + e.message } },

  labGrado(inf, suma) {
    if (typeof _labDiastGrado !== 'function') return 'SIN _labDiastGrado';
    try { return _labDiastGrado({ campos: { en_suma: suma, informe_texto: inf } }) }
    catch(e) { return 'EXC: ' + e.message } },

  pptDiast() {
    try { return (typeof _pptSpan === 'function') ? _pptSpan('dd-interp') : window.__P.txt('dd-interp') }
    catch(e) { return 'EXC: ' + e.message } },

  /* Columnas del Excel: el NUMERO fija la verificacion, las claves dan el detalle, y el ORDEN
     dice donde quedo la columna nueva (la regla de trabajo pide verificar la posicion). */
  excelCols() {
    var r = window.__P.excel();
    if (typeof r === 'string') return r;
    var ks = Object.keys(r);
    var orden = (typeof _labOrdenarCols === 'function') ? _labOrdenarCols(ks) : ks;
    var iL = orden.indexOf('LARS (%)');
    var iC = orden.indexOf('Strain contracción AI (%)');
    return { n: ks.length, nOrden: orden.length,
             lars: r['LARS (%)'], contr: r['Strain contracción AI (%)'],
             iLars: iL, iContr: iC, pegadas: (iL >= 0 && iC === iL + 1),
             bloqueContr: (typeof _labXlsBloqueDe === 'function' && iC >= 0) ? _labXlsBloqueDe('Strain contracción AI (%)') : null,
             /* ⚠️ DOS HASHES, Y EL SEGUNDO ES EL QUE SIRVE PARA EL A/B. El primero cambia en TODA
                escena por el solo hecho de que la fila gano una columna, asi que no distingue
                «se agrego una columna» de «cambio el valor de otra» —que es exactamente lo que el
                control negativo tiene que separar—. El segundo saca la columna nueva y vuelve a
                hashear: si da igual que en HEAD, ninguna columna preexistente se movio. */
             hash: window.__P.hash(JSON.stringify(r)),
             hashSinNueva: (function(){ var q = {};
               Object.keys(r).forEach(function(k){ if (k !== 'Strain contracción AI (%)') q[k] = r[k] });
               return window.__P.hash(JSON.stringify(q)) })(),
             nSinNueva: ks.filter(function(k){ return k !== 'Strain contracción AI (%)' }).length } },

  /* La maqueta de un campo: ancho, alto y si desborda su grilla. */
  caja(id) {
    var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    var r = e.getBoundingClientRect();
    var p = e.parentElement ? e.parentElement.getBoundingClientRect() : null;
    return { w: Math.round(r.width), h: Math.round(r.height),
             x: Math.round(r.left), y: Math.round(r.top),
             desborda: !!(p && (r.right > p.right + 1 || r.left < p.left - 1)),
             docW: document.documentElement.scrollWidth,
             scrollH: document.documentElement.scrollWidth > window.innerWidth + 1 } }
};
1
`;

/* ══ ESCENAS ═════════════════════════════════════════════════════════════════════════════════
   Cada escena es un PACIENTE, no un tecleo. Los numericos se tipean con TECLAS REALES; los
   <select> de escenario (ritmo, algoritmo, sexo, S/D) van por `set`, que NO es un gesto medido.

   `peso 70` y `talla 170` van en TODA escena: sin ellos no hay ASC y el LAVi no se puede
   calcular — un denominador roto que se leeria como «el criterio no se cumple». Con esa ASC
   (1,81 m2) un Vol AI de 70 ml da LAVi 38,7 (POSITIVO, > 34) y uno de 50 da 27,6 (negativo).

   ⚠️ EL PACIENTE DE LA RAMA DEL STRAIN ES SIEMPRE EL MISMO: dos criterios disponibles, uno
   positivo (E/e' 18,5) y uno negativo (LAVi 27,6), SIN velocidad de IT — que la BSE declara
   ausente en el 40-60 % de los pacientes (pag. 36). Es la UNICA puerta a la sustitucion por
   strain, asi que cualquier escena que no la cumpla mide otra cosa. */
const BASE = { peso: '70', talla: '170' };
const DOS_1Y1 = { edad: '50', onda_e: '120', onda_a: '60', e_sep: '6', e_lat: '7', ai_vol: '50' };
const DOS_1Y1_FR = Object.assign({}, DOS_1Y1, { fevi: '40' });

/* ── CONTROL NEGATIVO MAYOR: los campos nuevos VACIOS. Son las escenas de las tres tandas
   anteriores, para comparar las seis superficies contra HEAD. ── */
const VACIO = [
  { id: 'V00-vacio',  g: 'bse2024', r: 'sinusal', que: 'formulario vacio', c: {} },
  { id: 'V01-bse-3neg', g: 'bse2024', r: 'sinusal', que: 'BSE 3 de 3 negativas',
    c: { edad: '50', onda_e: '70', onda_a: '60', e_sep: '10', e_lat: '12', vmax_it: '2.0', ai_vol: '50' }, sel: { sexo: 'M' } },
  { id: 'V02-bse-3pos', g: 'bse2024', r: 'sinusal', que: 'BSE 3 de 3 positivas',
    c: { edad: '50', onda_e: '120', onda_a: '60', e_sep: '6', e_lat: '7', vmax_it: '3.2', ai_vol: '70' }, sel: { sexo: 'M' } },
  { id: 'V03-bse-1y1-sinStrain', g: 'bse2024', r: 'sinusal', que: 'BSE discordancia 1 y 1 SIN strain de la AI',
    c: DOS_1Y1, sel: { sexo: 'M' } },
  { id: 'V04-bse-1y1-LARS', g: 'bse2024', r: 'sinusal', que: 'BSE discordancia con LARS 32 (solo el de siempre)',
    c: Object.assign({}, DOS_1Y1, { lars: '32' }), sel: { sexo: 'M' } },
  { id: 'V05-bse-fr-1y1', g: 'bse2024', r: 'sinusal', que: 'BSE FEVI reducida, discordancia SIN strain',
    c: DOS_1Y1_FR, sel: { sexo: 'M' } },
  { id: 'V06-ase-3pos', g: 'ase2025', r: 'sinusal', que: 'ASE 2025 las tres principales positivas',
    c: { edad: '50', onda_e: '120', onda_a: '60', e_sep: '6', e_lat: '7', vmax_it: '3.2', ai_vol: '70' }, sel: { sexo: 'M' } },
  { id: 'V07-ase-seg2-vacio', g: 'ase2025', r: 'sinusal', que: 'ASE 2025 con el SEGUNDO PASO sin ningun parametro',
    c: { edad: '50', onda_e: '120', onda_a: '60', e_sep: '6', e_lat: '7' }, sel: { sexo: 'M' } },
  { id: 'V08-ase-seg2-neg', g: 'ase2025', r: 'sinusal', que: 'ASE 2025 con el segundo paso NEGATIVO (Vol AI 27,6)',
    c: { edad: '50', onda_e: '120', onda_a: '60', e_sep: '6', e_lat: '7', ai_vol: '50' }, sel: { sexo: 'M' } },
  { id: 'V09-2016', g: 'ase2016', r: 'sinusal', que: 'ASE/EACVI 2016 en ritmo sinusal',
    c: { edad: '50', onda_e: '120', onda_a: '60', e_sep: '6', e_lat: '7', vmax_it: '3.2', ai_vol: '70' }, sel: { sexo: 'M' } },
  { id: 'V10-fa-ase', g: 'ase2025', r: 'fa', que: 'FA con la Figura 8 de la ASE 2025',
    c: { edad: '50', onda_e: '120', e_sep: '6', e_lat: '7', vmax_it: '3.2', tde: '150', lars: '15' }, sel: { sexo: 'M' } },
  { id: 'V11-fa-bse', g: 'bse2024', r: 'fa', que: 'FA con la Figura 19 de la BSE 2024',
    c: { edad: '50', onda_e: '120', e_sep: '6', e_lat: '7', vmax_it: '3.2', tde: '150', lars: '15' }, sel: { sexo: 'M' } },
  { id: 'V12-fa-2016', g: 'ase2016', r: 'fa', que: 'FA con la ASE/EACVI 2016 (que no tiene regla de conteo)',
    c: { edad: '50', onda_e: '120', e_sep: '6', e_lat: '7', vmax_it: '3.2', tde: '150', lars: '15' }, sel: { sexo: 'M' } },
  /* ⚠️ Y EL LARS CARGADO POR LA OTRA PESTAÑA: la orden lo pide explicito. Mismo paciente que
     V11 pero el LARS entra por `lars_dop`. El veredicto de FA tiene que ser el MISMO. */
  { id: 'V13-fa-bse-larsDop', g: 'bse2024', r: 'fa', que: 'FA con el LARS cargado desde el DOPPLER (lars_dop)',
    c: { edad: '50', onda_e: '120', e_sep: '6', e_lat: '7', vmax_it: '3.2', tde: '150', lars_dop: '15' }, sel: { sexo: 'M' } },
  { id: 'V14-fa-ase-larsDop', g: 'ase2025', r: 'fa', que: 'FA ASE 2025 con el LARS desde el DOPPLER',
    c: { edad: '50', onda_e: '120', e_sep: '6', e_lat: '7', vmax_it: '3.2', tde: '150', lars_dop: '15' }, sel: { sexo: 'M' } }
];

/* ── FIGURA 17 (pag. 36): la sustitucion por strain con el LAPs y la onda L ── */
const BSE17 = [
  { id: 'A01-sin-nada', que: 'discordancia 1 y 1, SIN ningun strain y sin suplementarios', c: DOS_1Y1 },
  { id: 'A02-laps-alto', que: 'SOLO contraccion 16 % (>= 14): presion NORMAL por la primera caja',
    c: Object.assign({}, DOS_1Y1, { ai_strain_ct: '16' }) },
  { id: 'A03-laps-alto-neg', que: 'SOLO contraccion 10 % (< 14): la primera caja NO se cumple',
    c: Object.assign({}, DOS_1Y1, { ai_strain_ct: '10' }) },
  { id: 'A04-laps-negativo', que: 'contraccion -16 % (el signo del ecografo): tiene que dar como +16',
    c: Object.assign({}, DOS_1Y1, { ai_strain_ct: '-16' }) },
  { id: 'A05-lars-alto', que: 'SOLO LARS 32 % (>= 30): presion normal por la MISMA caja',
    c: Object.assign({}, DOS_1Y1, { lars: '32' }) },
  { id: 'A06-los-dos-OR', que: 'LARS 25 (no cumple) y contraccion 16 (SI): la caja es un OR',
    c: Object.assign({}, DOS_1Y1, { lars: '25', ai_strain_ct: '16' }) },
  { id: 'A07-lars-bajo', que: 'LARS 15 % (< 18): presion ELEVADA, y la contraccion no la salva',
    c: Object.assign({}, DOS_1Y1, { lars: '15' }) },
  { id: 'A08-gris-sin-supl', que: 'LARS 25 % (zona gris) con contraccion 10 y SIN suplementarios',
    c: Object.assign({}, DOS_1Y1, { lars: '25', ai_strain_ct: '10' }) },
  { id: 'A09-gris-ondaL-pos', que: 'LARS 25 % (gris) con ONDA L 25 cm/s (> 20: POSITIVO) -> elevada',
    c: Object.assign({}, DOS_1Y1, { lars: '25', onda_l: '25' }) },
  { id: 'A10-gris-ondaL-neg', que: 'LARS 25 % (gris) con onda L 15 cm/s (negativo) -> normal',
    c: Object.assign({}, DOS_1Y1, { lars: '25', onda_l: '15' }) },
  { id: 'A11-gris-ondaL-y-ArA', que: 'LARS 25 % (gris), onda L 15 (neg) y Ar-A 40 ms (POSITIVO) -> elevada',
    c: Object.assign({}, DOS_1Y1, { lars: '25', onda_l: '15', venp_dur_ar: '160', venp_dur_a: '120' }) },
  { id: 'A12-solo-laps-sin-lars', que: 'SIN LARS y con contraccion 10 %: la rama ya no cae a indeterminada',
    c: Object.assign({}, DOS_1Y1, { ai_strain_ct: '10' }) },
  { id: 'A13-conducto-no-vota', que: 'CONTROL NEGATIVO: strain de CONDUCTO 25 % y nada mas',
    c: Object.assign({}, DOS_1Y1, { ai_strain_cd: '25' }) }
];

/* ── FIGURA 18 (pag. 38): FEVI reducida. Cortes propios y CUATRO suplementarios ── */
const BSE18 = [
  { id: 'C01-sin-nada', que: 'FEVI 40, discordancia 1 y 1 sin strain ni suplementarios', c: DOS_1Y1_FR },
  { id: 'C02-laps-bajo', que: 'contraccion 6 % (< 8): presion ELEVADA por la primera caja',
    c: Object.assign({}, DOS_1Y1_FR, { ai_strain_ct: '6' }) },
  { id: 'C03-laps-bajo-neg', que: 'contraccion -6 % (signo del ecografo): tiene que dar como +6',
    c: Object.assign({}, DOS_1Y1_FR, { ai_strain_ct: '-6' }) },
  { id: 'C04-laps-alto', que: 'contraccion 16 % (>= 14): presion NORMAL por la segunda caja',
    c: Object.assign({}, DOS_1Y1_FR, { ai_strain_ct: '16' }) },
  { id: 'C05-laps-medio', que: 'contraccion 10 % (entre 8 y 14): ninguna de las dos cajas',
    c: Object.assign({}, DOS_1Y1_FR, { ai_strain_ct: '10' }) },
  { id: 'C06-OR-con-lars', que: 'LARS 20 (gris) y contraccion 6 (< 8): el OR del lado ELEVADO',
    c: Object.assign({}, DOS_1Y1_FR, { lars: '20', ai_strain_ct: '6' }) },
  { id: 'C07-OR-normal', que: 'LARS 20 (gris) y contraccion 16 (>= 14): el OR del lado NORMAL',
    c: Object.assign({}, DOS_1Y1_FR, { lars: '20', ai_strain_ct: '16' }) },
  { id: 'C08-supl-ondaL', que: 'LARS 20 y contraccion 10 (los dos grises) con ONDA L 25 (POSITIVO)',
    c: Object.assign({}, DOS_1Y1_FR, { lars: '20', ai_strain_ct: '10', onda_l: '25' }) },
  { id: 'C09-supl-ondaL-neg', que: 'la misma con onda L 15 (negativo): presion normal',
    c: Object.assign({}, DOS_1Y1_FR, { lars: '20', ai_strain_ct: '10', onda_l: '15' }) },
  { id: 'C10-supl-cuatro', que: 'la misma con los CUATRO suplementarios cargados y negativos',
    c: Object.assign({}, DOS_1Y1_FR, { lars: '20', ai_strain_ct: '10', onda_l: '15', tde: '200',
                                       venp_dur_ar: '130', venp_dur_a: '120' }), sel: { venp_sd: 'mayor1' } },
  { id: 'C11-conducto-no-vota', que: 'CONTROL NEGATIVO: conducto 25 % en la via reducida',
    c: Object.assign({}, DOS_1Y1_FR, { ai_strain_cd: '25' }) }
];

/* ── ASE 2025: la onda L >= 50 cm/s como SUPLEMENTARIO (folio 555) ──
   La puerta exacta del original es «If none available or reliable use Supplemental methods»,
   escrito en la caja del SEGUNDO PASO de la Figura 3: o sea, segundo paso SIN NINGUN parametro.
   Cualquier escena con Vol AI, LARS o TRIV cargados mide OTRA cosa. */
const DOS_ASE_SEG2_VACIO = { edad: '50', onda_e: '120', onda_a: '60', e_sep: '6', e_lat: '7' };
const ASE = [
  { id: 'D01-seg2-vacio-sin-ondaL', que: 'segundo paso VACIO y sin onda L: el estado de HEAD',
    c: DOS_ASE_SEG2_VACIO },
  { id: 'D02-seg2-vacio-ondaL-pos', que: 'segundo paso VACIO con ONDA L 55 cm/s (>= 50): PAI elevada',
    c: Object.assign({}, DOS_ASE_SEG2_VACIO, { onda_l: '55' }) },
  { id: 'D03-seg2-vacio-ondaL-neg', que: 'segundo paso VACIO con onda L 45 cm/s (< 50): negativo',
    c: Object.assign({}, DOS_ASE_SEG2_VACIO, { onda_l: '45' }) },
  { id: 'D04-seg2-CON-datos-ondaL', que: 'CONTROL NEGATIVO: con Vol AI cargado el suplementario NO se consulta',
    c: Object.assign({}, DOS_ASE_SEG2_VACIO, { ai_vol: '50', onda_l: '55' }) },
  { id: 'D05-seg2-CON-lars-ondaL', que: 'CONTROL NEGATIVO: con LARS cargado tampoco se consulta',
    c: Object.assign({}, DOS_ASE_SEG2_VACIO, { lars: '25', onda_l: '55' }) },
  { id: 'D06-tres-pos-ondaL', que: 'CONTROL NEGATIVO: las tres principales positivas no pasan por el segundo paso',
    c: { edad: '50', onda_e: '120', onda_a: '60', e_sep: '6', e_lat: '7', vmax_it: '3.2', ai_vol: '70', onda_l: '55' } },
  { id: 'D07-contraccion-no-vota', que: 'CONTROL NEGATIVO: la ASE 2025 NO usa el strain de contraccion',
    c: Object.assign({}, DOS_ASE_SEG2_VACIO, { ai_strain_ct: '6' }) },
  { id: 'D08-conducto-no-vota', que: 'CONTROL NEGATIVO: ni el de conducto',
    c: Object.assign({}, DOS_ASE_SEG2_VACIO, { ai_strain_cd: '6' }) }
];

/* ── BORDES: apenas abajo, JUSTO en el corte, apenas arriba. El de abajo es el control negativo
   implicito de cada triplete. Los operadores salen de la figura de cada guia. ── */
const BORDES = [
  { id: 'B1-laps17-normal', g: 'bse2024', que: 'contraccion >= 14 % -> presion normal (Figura 17)',
    campo: 'ai_strain_ct', fijo: DOS_1Y1, vals: ['13.9', '14', '14.1'],
    nota: 'el 14,0 exacto SI cumple (>=)' },
  { id: 'B2-lars17-normal', g: 'bse2024', que: 'LARS >= 30 % -> presion normal (Figura 17)',
    campo: 'lars', fijo: DOS_1Y1, vals: ['29.9', '30', '30.1'],
    nota: 'el 30,0 exacto SI cumple (>=)' },
  { id: 'B3-lars17-elev', g: 'bse2024', que: 'LARS < 18 % -> presion elevada (Figura 17)',
    campo: 'lars', fijo: DOS_1Y1, vals: ['17.9', '18', '18.1'],
    nota: 'el 18,0 exacto NO cumple (<): cae en la zona gris' },
  { id: 'B4-ondaL17', g: 'bse2024', que: 'onda L > 20 cm/s, suplementario (Figura 17)',
    campo: 'onda_l', fijo: Object.assign({}, DOS_1Y1, { lars: '25' }), vals: ['19.9', '20', '20.1'],
    nota: 'el 20,0 exacto es NEGATIVO (>)' },
  { id: 'B5-laps18-elev', g: 'bse2024', que: 'contraccion < 8 % -> elevada (Figura 18)',
    campo: 'ai_strain_ct', fijo: DOS_1Y1_FR, vals: ['7.9', '8', '8.1'],
    nota: 'el 8,0 exacto NO cumple (<)' },
  { id: 'B6-laps18-normal', g: 'bse2024', que: 'contraccion >= 14 % -> normal (Figura 18)',
    campo: 'ai_strain_ct', fijo: DOS_1Y1_FR, vals: ['13.9', '14', '14.1'],
    nota: 'el 14,0 exacto SI cumple (>=)' },
  { id: 'B7-lars18-elev', g: 'bse2024', que: 'LARS < 18 % -> elevada (Figura 18)',
    campo: 'lars', fijo: DOS_1Y1_FR, vals: ['17.9', '18', '18.1'], nota: 'el 18,0 exacto NO cumple (<)' },
  { id: 'B8-lars18-normal', g: 'bse2024', que: 'LARS >= 24 % -> normal (Figura 18)',
    campo: 'lars', fijo: DOS_1Y1_FR, vals: ['23.9', '24', '24.1'], nota: 'el 24,0 exacto SI cumple (>=)' },
  { id: 'B9-ondaL18', g: 'bse2024', que: 'onda L > 20 cm/s, suplementario (Figura 18)',
    campo: 'onda_l', fijo: Object.assign({}, DOS_1Y1_FR, { lars: '20', ai_strain_ct: '10' }),
    vals: ['19.9', '20', '20.1'], nota: 'el 20,0 exacto es NEGATIVO (>)' },
  { id: 'B10-ondaL-ase', g: 'ase2025', que: 'onda L >= 50 cm/s, suplementario de la ASE 2025 (folio 555)',
    campo: 'onda_l', fijo: DOS_ASE_SEG2_VACIO, vals: ['49.9', '50', '50.1'],
    nota: 'el 50,0 exacto SI cumple (>=): el original escribe «L-wave velocity >= 50 cm/s»' }
];

/* ── EL SIGNO: el mismo paciente con el strain tipeado en los dos signos. Tiene que dar IGUAL. ── */
const SIGNO = [
  { id: 'G1-17-pos', g: 'bse2024', que: 'Figura 17 con contraccion +16', c: Object.assign({}, DOS_1Y1, { ai_strain_ct: '16' }) },
  { id: 'G2-17-neg', g: 'bse2024', que: 'Figura 17 con contraccion -16', c: Object.assign({}, DOS_1Y1, { ai_strain_ct: '-16' }) },
  { id: 'G3-18-pos', g: 'bse2024', que: 'Figura 18 con contraccion +6',  c: Object.assign({}, DOS_1Y1_FR, { ai_strain_ct: '6' }) },
  { id: 'G4-18-neg', g: 'bse2024', que: 'Figura 18 con contraccion -6',  c: Object.assign({}, DOS_1Y1_FR, { ai_strain_ct: '-6' }) },
  { id: 'G5-17-12pos', g: 'bse2024', que: 'Figura 17 con contraccion +12 (zona gris de la 18)', c: Object.assign({}, DOS_1Y1, { lars: '25', ai_strain_ct: '12' }) },
  { id: 'G6-17-12neg', g: 'bse2024', que: 'Figura 17 con contraccion -12', c: Object.assign({}, DOS_1Y1, { lars: '25', ai_strain_ct: '-12' }) }
];

/* ── LA MARCA «(revisar)»: dentro de banda, fuera por arriba y fuera por abajo. El badge va al
   lado para probar que la marca NO mueve ningun veredicto. ── */
const MARCAS = [
  { id: 'M1-lars-dentro', que: 'LARS 32 (dentro de [0,60])', c: Object.assign({}, DOS_1Y1, { lars: '32' }) },
  { id: 'M2-lars-negativo', que: 'LARS -32: NEGATIVO, se marca y NO se corrige', c: Object.assign({}, DOS_1Y1, { lars: '-32' }) },
  { id: 'M3-lars-alto', que: 'LARS 320 (dedazo de un orden de magnitud)', c: Object.assign({}, DOS_1Y1, { lars: '320' }) },
  { id: 'M4-ct-negativo', que: 'contraccion -16: DENTRO de la banda simetrica, NO se marca', c: Object.assign({}, DOS_1Y1, { ai_strain_ct: '-16' }) },
  { id: 'M5-ct-fuera', que: 'contraccion -160: fuera de [-60,60]', c: Object.assign({}, DOS_1Y1, { ai_strain_ct: '-160' }) },
  { id: 'M6-cd-fuera', que: 'conducto 160: fuera de [-60,60]', c: Object.assign({}, DOS_1Y1, { ai_strain_cd: '160' }) },
  { id: 'M7-ondaL-dentro', que: 'onda L 55 (dentro de [0,200])', c: Object.assign({}, DOS_1Y1, { onda_l: '55' }) },
  { id: 'M8-ondaL-negativa', que: 'onda L -55: una velocidad negativa no existe', c: Object.assign({}, DOS_1Y1, { onda_l: '-55' }) },
  { id: 'M9-ondaL-alta', que: 'onda L 550 (dedazo)', c: Object.assign({}, DOS_1Y1, { onda_l: '550' }) }
];

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
  /* TECLAS REALES, una por caracter, con el `text` SOLO en el `char`. Tipea DESDE VACIO. */
  async function tipear(id, valor) {
    /* ⚠️ SI EL CAMPO NO EXISTE NO SE TIPEA, Y ESTO LO DESTAPO LA PRIMERA CORRIDA A/B. Contra el
       arbol de HEAD los campos de esta tanda no existen: `clicEn` devolvia 'NO SE PUDO', el foco
       quedaba en el campo ANTERIOR y los caracteres se le concatenaban. Medido: tipear '15' en
       `lars_dop` sobre HEAD dejo el E/e' en 1848,5 en vez de 18,5 —un paciente inventado que la
       sonda informaba como una diferencia del commit—. Una tecla sin blanco no es una medicion. */
    const hay = await ev(`window.__P.existe(${JSON.stringify(id)})`);
    if (!hay) return { via: 'NO EXISTE EL CAMPO', pedido: String(valor), quedo: null, ok: null, noExiste: true };
    const via = await clicEn(id);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(!e) return 0; e.focus(); try{ e.select() }catch(x){} return 1 })()`);
    for (const ch of String(valor)) await tecla(ch, ch);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
    await pausa(60);
    const quedo = await ev(`window.__P.val(${JSON.stringify(id)})`);
    return { via: via.via, pedido: String(valor), quedo: String(quedo), ok: String(quedo) === String(valor) };
  }
  /* BORRAR CON TECLAS REALES. Select-all por DOM y Backspace: es el gesto del medico y el unico
     que dispara el `oninput` del campo. ⚠️ NUNCA sobre un campo de solo lectura. */
  async function borrar(id) {
    const soloLectura = await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      return e ? (!!e.readOnly || !!e.disabled) : 'NO EXISTE' })()`);
    if (soloLectura !== false) return { id, via: 'NO SE BORRA', por: String(soloLectura) };
    await clicEn(id);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(!e) return 0; e.focus(); try{ e.select() }catch(x){} return 1 })()`);
    for (let i = 0; i < 12; i++) await tecla('Backspace', null);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
    await pausa(60);
    return { id, via: 'Backspace x12', quedo: await ev(`window.__P.val(${JSON.stringify(id)})`) };
  }

  await evCrudo(`try{sessionStorage.setItem('ett_auth','1')}catch(e){}; location.reload(); 1`);
  await pausa(2600);
  await evCrudo(SONDA);

  /* ⚠️ EL AVISO LEGAL TAPA LA PAGINA ENTERA Y VUELVE A MITAD DE CORRIDA. Con `#modalAvisoEco`
     puesto, elementFromPoint devuelve ESE nodo y todos los clics caen en el overlay: cada escena
     informaria «sin cambios» sobre un tecleo que nunca ocurrio. Se cierra por su propio boton y
     se COMPRUEBA antes de medir. */
  const cerrarAviso = async () => {
    const b = await ev(`(function(){
      var m = document.getElementById('modalAvisoEco');
      if (!m) return 'NO EXISTE';
      if (getComputedStyle(m).display === 'none') return 'CERRADO';
      var x = m.querySelector('button'); if (x) { if (!x.id) x.id='__avisoBtn'; return x.id }
      return 'SIN BOTON' })()`);
    if (b && b.indexOf('NO ') !== 0 && b !== 'SIN BOTON' && b !== 'CERRADO') await clicEn(b);
    return ev(`(function(){ var o={};
      ['modalAvisoEco','login-overlay'].forEach(function(id){
        var m=document.getElementById(id); o[id]= m ? getComputedStyle(m).display : 'NO EXISTE' });
      return o })()`);
  };
  const avisoEstado = await cerrarAviso();
  const denom = await ev(`window.__P.abrirTodo()`);
  const btn = await ev(`window.__P.btnAlgo()`);
  const btnX = await ev(`window.__P.btnCerrarAlgo()`);

  /* ⚠️ EL ORDEN DE TIPEO NO ES COSMETICO. `calcDiastol()` NO esta cableado a todos los campos que
     lee; se tipea lo NO cableado primero y lo cableado al final, que es un gesto real y deja el
     cuadro al dia sin forzar ninguna llamada. Los cuatro campos de ESTA tanda entran por puertas
     que SI llaman a `calcDiastol`, asi que van al final de la lista. */
  const ORDEN = ['edad', 'peso', 'talla', 'fevi', 'sgl', 'vci_diam', 'triv', 'tde',
                 'venp_dur_ar', 'venp_dur_a', 'ai_vol', 'vmax_it', 'ao_fc',
                 'e_sep', 'e_lat', 'onda_e', 'onda_a',
                 'ai_strain_cd', 'onda_l', 'ai_strain_ct', 'ai_strain_ct_dop', 'lars', 'lars_dop'];
  function enOrden(mapa) {
    const ks = Object.keys(mapa);
    const dentro = ORDEN.filter((k) => ks.indexOf(k) > -1);
    const fuera = ks.filter((k) => ORDEN.indexOf(k) < 0);
    return dentro.concat(fuera);
  }
  async function cargar(c, sel, extraSel) {
    await ev(`window.__P.limpiar()`);
    await pausa(120);
    /* ⚠️ LOS <select> VAN PRIMERO, Y ESTO SE MIDIO EN LA TANDA ANTERIOR. */
    const sels = {};
    const todosSel = Object.assign({}, extraSel || {}, sel || {});
    for (const id of Object.keys(todosSel)) sels[id] = await ev(`window.__P.set(${JSON.stringify(id)}, ${JSON.stringify(todosSel[id])})`);
    const tecleos = {};
    const todo = Object.assign({}, (Object.keys(c).length ? BASE : {}), c);
    for (const id of enOrden(todo)) tecleos[id] = await tipear(id, todo[id]);
    await pausa(120);
    return { tecleos, sels, todosOk: Object.keys(tecleos).every((k) => tecleos[k].ok) };
  }
  async function verVentana() {
    if (btn.err) return { err: btn.err };
    const abrir = await clicEn(btn.sel);
    const v = await ev(`window.__P.ventana()`);
    const cerrar = btnX.err ? { via: 'SIN BOTON' } : await clicEn(btnX.sel);
    const tras = await ev(`(function(){ var o=document.getElementById('diast-algo-overlay');
      return o ? getComputedStyle(o).display : 'NO EXISTE' })()`);
    return Object.assign({ viaAbrir: abrir.via, viaCerrar: cerrar.via, trasCerrar: tras }, v);
  }
  const esc = (algo, ritmo, extra) => Object.assign({ diast_algoritmo: algo || 'bse2024',
    diast_ritmo: ritmo || 'sinusal' }, extra || {});

  const OUT = { archivo: FARG, md5Ini, grupo: SOLO || 'TODOS', avisoEstado, denominador: denom,
                boton: btn, cerrar: btnX };

  /* ══ sinc ══ la sincronia en los dos sentidos, con su control negativo. */
  if (hacer('sinc')) {
    const pares = [
      { dato: 'LARS', a: 'lars', b: 'lars_dop', val: '27' },
      { dato: 'strain de contraccion', a: 'ai_strain_ct', b: 'ai_strain_ct_dop', val: '-13.5' }
    ];
    const solos = [
      { dato: 'strain de conducto', id: 'ai_strain_cd', val: '21', otros: ['lars','lars_dop','ai_strain_ct','ai_strain_ct_dop','onda_l'] },
      { dato: 'onda L', id: 'onda_l', val: '34', otros: ['lars','lars_dop','ai_strain_ct','ai_strain_ct_dop','ai_strain_cd'] }
    ];
    const filas = [];
    for (const p of pares) {
      for (const dir of [[p.a, p.b], [p.b, p.a]]) {
        await ev(`window.__P.limpiar()`); await pausa(100);
        const antes = await ev(`window.__P.cuatro()`);
        const t = await tipear(dir[0], p.val);
        const trasEscribir = await ev(`window.__P.cuatro()`);
        const bo = await borrar(dir[0]);
        const trasBorrar = await ev(`window.__P.cuatro()`);
        filas.push({ dato: p.dato, gesto: 'escribir y borrar en ' + dir[0], espejo: dir[1],
          valor: p.val, tecleo: t, borrado: bo,
          antes: { a: antes[dir[0]].v, b: antes[dir[1]].v },
          trasEscribir: { a: trasEscribir[dir[0]].v, b: trasEscribir[dir[1]].v },
          trasBorrar: { a: trasBorrar[dir[0]].v, b: trasBorrar[dir[1]].v },
          copio: trasEscribir[dir[1]].v === p.val,
          borroElEspejo: String(trasBorrar[dir[1]].v || '') === '' });
      }
    }
    for (const s of solos) {
      await ev(`window.__P.limpiar()`); await pausa(100);
      const t = await tipear(s.id, s.val);
      const tras = await ev(`window.__P.cuatro()`);
      filas.push({ dato: s.dato, gesto: 'CONTROL NEGATIVO: escribir en ' + s.id + ' (vive en un solo lugar)',
        valor: s.val, tecleo: t, propio: tras[s.id].v,
        otrosVacios: s.otros.every((o) => String(tras[o].v || '') === ''),
        otros: s.otros.map((o) => o + '=' + String(tras[o].v || '')) });
    }
    /* ── y lo mismo a 390 px, que es donde la grilla se apila ── */
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 0, mobile: false }, sessionId);
    await pausa(200);
    await cerrarAviso();
    const en390 = [];
    for (const p of pares) {
      await ev(`window.__P.limpiar()`); await pausa(100);
      const t = await tipear(p.a, p.val);
      const tras = await ev(`window.__P.cuatro()`);
      const bo = await borrar(p.b);
      const trasB = await ev(`window.__P.cuatro()`);
      en390.push({ dato: p.dato, ancho: 390, tecleo: t, borrado: bo,
        trasEscribir: { a: tras[p.a].v, b: tras[p.b].v },
        trasBorrarEnElEspejo: { a: trasB[p.a].v, b: trasB[p.b].v },
        copio: tras[p.b].v === p.val, borroElOtro: String(trasB[p.a].v || '') === '' });
    }
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    await pausa(200);
    await cerrarAviso();
    OUT.sinc = { a1200: filas, a390: en390 };
  }

  /* ══ marca ══ */
  if (hacer('marca')) {
    const r = [];
    OUT.bandas = await ev(`window.__P.bandas()`);
    for (const m of MARCAS) {
      const car = await cargar(m.c, m.sel, esc('bse2024', 'sinusal', { sexo: 'M' }));
      r.push({ id: m.id, que: m.que, todosOk: car.todosOk,
               campos: await ev(`window.__P.cuatro()`), cuadro: await ev(`window.__P.cuadro()`) });
    }
    OUT.marca = r;
  }

  /* ══ vacio ══ el control negativo mayor: las seis superficies contra HEAD. */
  if (hacer('vacio')) {
    const r = [];
    for (const e of VACIO) {
      const car = await cargar(e.c, e.sel, esc(e.g, e.r, { sexo: 'M' }));
      const cuadro = await ev(`window.__P.cuadro()`);
      const sup = {};
      for (const est of ['narrativo', 'telegrafico', 'academico']) {
        const inf = await ev(`window.__P.informe(${JSON.stringify(est)})`);
        sup[est] = { diast: await ev(`window.__P.lineaDiast(${JSON.stringify(inf.inf)})`),
                     suma: await ev(`window.__P.norm(${JSON.stringify(inf.suma)})`),
                     hashInf: await ev(`window.__P.hash(${JSON.stringify(inf.inf)})`) };
        if (est === 'narrativo') sup.lab = await ev(`window.__P.labGrado(${JSON.stringify(inf.inf)}, ${JSON.stringify(inf.suma)})`);
      }
      r.push({ id: e.id, que: e.que, guia: e.g, ritmo: e.r, todosOk: car.todosOk,
               cuadro, superficies: sup, ppt: await ev(`window.__P.pptDiast()`),
               excel: await ev(`window.__P.excelCols()`),
               campos: await ev(`window.__P.hash(JSON.stringify(window.__P.campos()))`),
               camposN: await ev(`window.__P.camposN()`) });
    }
    OUT.vacio = r;
  }

  /* ══ bse17 / bse18 / ase / signo ══ mismo molde: cuadro + ventana + frase. */
  const correrEscenas = async (lista, guia) => {
    const r = [];
    for (const e of lista) {
      const car = await cargar(e.c, e.sel, esc(e.g || guia, 'sinusal', { sexo: 'M' }));
      const cuadro = await ev(`window.__P.cuadro()`);
      const vent = await verVentana();
      const inf = await ev(`window.__P.informe('narrativo')`);
      r.push({ id: e.id, que: e.que, todosOk: car.todosOk,
               badge: cuadro.badge, texto: cuadro.texto, suma: cuadro.suma,
               ventanaRes: vent.res, nFilas: vent.nFilas,
               /* Las filas de strain y suplementarios con su ESTADO: sin el estado de la FILA,
                  un badge que no cambia se lee como un corte que no funciona. */
               filasStrain: (vent.filas || []).filter((f) => /strain|LARS|LAPs|contracci|Onda L|Ar.A|S\/D|TDE|suplement/i.test(f.crit)),
               acuerdan: (vent.res || '').indexOf((cuadro.badge || '').replace(/ —.*$/, '')) > -1 || null,
               diastInf: await ev(`window.__P.lineaDiast(${JSON.stringify(inf.inf)})`),
               campos: await ev(`window.__P.cuatro()`) });
    }
    return r;
  };
  if (hacer('bse17')) OUT.bse17 = await correrEscenas(BSE17, 'bse2024');
  if (hacer('bse18')) OUT.bse18 = await correrEscenas(BSE18, 'bse2024');
  if (hacer('ase'))   OUT.ase   = await correrEscenas(ASE, 'ase2025');
  if (hacer('signo')) OUT.signo = await correrEscenas(SIGNO, 'bse2024');

  /* ══ bordes ══ tripletes con teclas reales. */
  if (hacer('bordes')) {
    const r = [];
    for (const b of BORDES) {
      const tri = [];
      for (const val of b.vals) {
        const c = Object.assign({}, b.fijo); c[b.campo] = val;
        const car = await cargar(c, b.sel, esc(b.g, 'sinusal', { sexo: 'M' }));
        const cu = await ev(`window.__P.cuadro()`);
        const vn = await verVentana();
        tri.push({ val, todosOk: car.todosOk, badge: cu.badge,
                   filasStrain: (vn.filas || []).filter((f) => /strain|LARS|LAPs|contracci|Onda L|suplement/i.test(f.crit)),
                   nFilas: vn.nFilas });
      }
      r.push({ id: b.id, que: b.que, campo: b.campo, nota: b.nota, triplete: tri,
               /* El corte SEPARA si los dos extremos difieren: sin esto, un triplete entero
                  igual se lee como «el corte no existe» y como «el corte anda», indistinguible. */
               separa: tri.length === 3 && tri[0].badge !== tri[2].badge });
    }
    OUT.bordes = r;
  }

  /* ══ excel ══ el numero de columnas, el encabezado y su posicion. */
  if (hacer('excel')) {
    const r = [];
    for (const e of [{ id: 'X1-vacio', c: {} },
                     { id: 'X2-con-strain', c: Object.assign({}, DOS_1Y1, { lars: '27', ai_strain_ct: '-13.5', ai_strain_cd: '21', onda_l: '34' }) }]) {
      const car = await cargar(e.c, null, esc('bse2024', 'sinusal', { sexo: 'M' }));
      r.push({ id: e.id, todosOk: car.todosOk, cols: await ev(`window.__P.excelCols()`) });
    }
    OUT.excel = r;
  }

  /* ══ ancho ══ la maqueta de los campos nuevos en los tres anchos y en los dos temas. */
  if (hacer('ancho')) {
    const r = [];
    await cargar({ lars: '27', ai_strain_ct: '-13.5', ai_strain_cd: '21', onda_l: '34' }, null, esc('bse2024', 'sinusal', { sexo: 'M' }));
    for (const w of [1200, 390, 360]) {
      await cdp.send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 0, mobile: false }, sessionId);
      await pausa(260);
      await cerrarAviso();
      for (const tema of ['oscuro', 'claro']) {
        await ev(`(function(){ try { document.documentElement.setAttribute('data-theme', ${JSON.stringify(tema === 'claro' ? 'light' : 'dark')}) } catch(e){} return 1 })()`);
        await pausa(120);
        const cajas = {};
        await ev(`window.__P.pestana('ai-vi')`);
        for (const id of ['lars', 'ai_strain_cd', 'ai_strain_ct']) cajas[id] = await ev(`window.__P.caja(${JSON.stringify(id)})`);
        await ev(`window.__P.pestana('doppler')`);
        for (const id of ['onda_l', 'lars_dop', 'ai_strain_ct_dop']) cajas[id] = await ev(`window.__P.caja(${JSON.stringify(id)})`);
        r.push({ ancho: w, tema, cajas,
                 /* Los tres de cada fila tienen que medir lo mismo: un campo nuevo mas angosto
                    que sus vecinos es el sintoma de que cayo fuera de la grilla. */
                 aiMismoAncho: cajas.lars.w === cajas.ai_strain_cd.w && cajas.lars.w === cajas.ai_strain_ct.w,
                 dopMismoAncho: cajas.onda_l.w === cajas.lars_dop.w && cajas.onda_l.w === cajas.ai_strain_ct_dop.w,
                 ningunoDesborda: Object.keys(cajas).every((k) => cajas[k].desborda === false) });
      }
    }
    await ev(`(function(){ try { document.documentElement.removeAttribute('data-theme') } catch(e){} return 1 })()`);
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    OUT.ancho = r;
  }

  /* ══ guardado ══ que los seis campos viajan con el estudio, vuelven al reabrirlo, se limpian con
     «Nuevo estudio», y que un estudio guardado SIN ellos los deja VACIOS (no se migra nada).
     ⚠️ EL GUARDADO ES ASINCRONO Y TIENE DOS COMPUERTAS, y la primera version de esta sonda se
     colgo 10 minutos por ignorarlas: `guardarInforme` exige nombre o documento, y la PRIMERA vez
     saca la card de severidades valvulares y devuelve false —el guardado real cuelga del clic en
     `#rev-confirm`—. Se replica lo que hace el harness de la suite, con `confirm` neutralizado:
     un dialogo nativo abierto deja a CDP esperando para siempre. */
  if (hacer('guardado')) {
    const r = {};
    const leer = () => ev(`window.__P.cuatro()`);
    await evCrudo(`window.__confirmReal = window.confirm; window.confirm = function(){ return true };
                   window.__alertReal = window.alert; window.alert = function(){ return undefined }; 1`);
    const guardar = () => ev(`(function(){
      window._ettEditandoId = null;
      var antes = new Set(getInformes().map(function(i){ return i.estudioId }));
      return new Promise(function(resolve){
        var fin = function(ok){
          var nuevo = getInformes().find(function(i){ return !antes.has(i.estudioId) });
          resolve({ ok: ok === true, estudioId: nuevo ? nuevo.estudioId : null }) };
        try { guardarInforme(fin) } catch(e) { resolve({ ok:false, error:String(e) }); return }
        var cf = document.getElementById('rev-confirm'); if (cf) cf.click();
      }) })()`, 25000);

    /* (1) un estudio CON los seis cargados: guardar, limpiar, reabrir. */
    await cargar({ lars: '27', ai_strain_ct: '-13.5', ai_strain_cd: '21', onda_l: '34' }, null,
                 esc('bse2024', 'sinusal', { sexo: 'M' }));
    await tipear('nombre', 'StrainAI');
    r.antesDeGuardar = await leer();
    r.guardado = await guardar();
    const gid = r.guardado && r.guardado.estudioId;
    /* ⚠️ DENOMINADOR: sin id guardado todo lo de abajo mide el formulario en pantalla y no un
       estudio reabierto —y saldria «todo bien»—. Se declara. */
    r.hayId = !!gid;
    /* Las SEIS claves, leidas del registro en disco: es la unica forma de ver que viajaron. */
    r.enElRegistro = gid ? await ev(`(function(){
      var i = getInformes().find(function(x){ return x.estudioId === ${JSON.stringify(gid)} });
      if (!i) return 'NO ESTA';
      var c = i.campos || {};
      var o = {};
      ['lars','lars_dop','ai_strain_ct','ai_strain_ct_dop','ai_strain_cd','onda_l'].forEach(function(k){
        o[k] = (k in c) ? c[k] : '<<AUSENTE>>' });
      return o })()`) : 'SIN ID';

    await ev(`window.__P.limpiar()`); await pausa(250);
    r.trasLimpiar = await leer();
    r.camposLimpios = Object.keys(r.trasLimpiar).every((k) => String(r.trasLimpiar[k].v || '') === '');
    r.marcaLimpia = Object.keys(r.trasLimpiar).every((k) => !r.trasLimpiar[k].marca);

    r.reabrio = gid ? await ev(`(function(){ try { cargarEstudioPorId(${JSON.stringify(gid)}); return 'ok' }
      catch(e) { return 'EXC ' + e.message } })()`) : 'SIN ID';
    await pausa(600);
    r.trasReabrir = await leer();
    r.volvieronLosSeis = ['lars','lars_dop','ai_strain_ct','ai_strain_ct_dop','ai_strain_cd','onda_l']
      .every((k) => String(r.trasReabrir[k].v || '') !== '');

    /* (2) EL ESTUDIO VIEJO. Se le quitan al registro las seis claves —que es exactamente lo que
       trae un estudio guardado antes de esta tanda— y se reabre: los seis tienen que quedar
       VACIOS, incluido el `lars_dop`, aunque `lars` venga poblado. Nada se migra. */
    r.viejoPreparado = gid ? await ev(`(function(){
      var ls = getInformes();
      var i = ls.find(function(x){ return x.estudioId === ${JSON.stringify(gid)} });
      if (!i) return 'NO ESTA';
      ['lars_dop','ai_strain_ct','ai_strain_ct_dop','ai_strain_cd','onda_l'].forEach(function(k){
        delete i.campos[k] });
      i.campos.lars = '27';
      return CeiboStore.setLocal(ls).then(function(){ return 'ok' }) })()`, 20000) : 'SIN ID';
    await ev(`window.__P.limpiar()`); await pausa(250);
    r.reabrioViejo = gid ? await ev(`(function(){ try { cargarEstudioPorId(${JSON.stringify(gid)}); return 'ok' }
      catch(e) { return 'EXC ' + e.message } })()`) : 'SIN ID';
    await pausa(600);
    r.trasReabrirViejo = await leer();
    r.viejoLarsVuelve = String(r.trasReabrirViejo.lars.v || '') === '27';
    r.viejoLosNuevosVacios = ['lars_dop','ai_strain_ct','ai_strain_ct_dop','ai_strain_cd','onda_l']
      .every((k) => String(r.trasReabrirViejo[k].v || '') === '');

    /* (3) «Nuevo estudio» con la marca PUESTA: el renglon no puede sobrevivir. */
    await cargar({ lars: '-32' }, null, esc('bse2024', 'sinusal', { sexo: 'M' }));
    r.conMarca = await leer();
    r.marcaEstaba = !!(r.conMarca.lars.marca && r.conMarca.lars_dop.marca);
    await ev(`window.__P.limpiar()`); await pausa(250);
    r.trasNuevoEstudio = await leer();
    r.marcaSeFue = Object.keys(r.trasNuevoEstudio).every((k) => !r.trasNuevoEstudio[k].marca);

    if (gid) await ev(`(function(){ return CeiboStore.setLocal(getInformes().filter(function(i){
      return i.estudioId !== ${JSON.stringify(gid)} })).then(function(){ return 'borrado' }) })()`, 20000);
    await evCrudo(`if (window.__confirmReal) window.confirm = window.__confirmReal;
                   if (window.__alertReal) window.alert = window.__alertReal; 1`);
    OUT.guardado = r;
  }

  OUT.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  OUT.md5Igual = OUT.md5Fin === md5Ini;
  console.log(JSON.stringify(OUT, null, 1));

  try { cdp.close() } catch (e) {}
  try { srv.close() } catch (e) {}
  process.exit(0);
}
main().catch((e) => { console.error('FALLO: ' + e.message + '\n' + (e.stack || '')); process.exit(1); });
