#!/usr/bin/env node
/**
 * _probe_imcols.mjs — sonda A/B de SOLO LECTURA para el rediseno D1 de Valvulas (2026-10-14):
 *   D1a · INSUFICIENCIA MITRAL, CAMPOS: tres columnas de SEIS, con los seis automaticos de la
 *         columna 3 (tres por PISA y tres por continuidad) y la relacion jet/AI en la columna 2.
 *   D1b · INSUFICIENCIA MITRAL, REFERENCIAS en TRES BLOQUES, con el bloque 2 en dos columnas.
 *   D1c · el mecanismo de los globos «i» de toda la pestana: toque, tarjeta corta, sin hover.
 *   D1d · ESTENOSIS MITRAL, columna 2 con el volumen eyectado del TSVI.
 *
 * Infraestructura calcada de scripts/_probe_labdisf.mjs (teclas y clics reales, cierre del arbol
 * de Chrome por grupo, despeje del aviso legal, md5 al principio y al final). NO muta index.html.
 *
 *   node scripts/_probe_imcols.mjs --file /tmp/index.HEAD.html > /tmp/im.HEAD.json
 *   node scripts/_probe_imcols.mjs                             > /tmp/im.NEW.json
 *
 * Grupos (--solo campos|autos|refs|globos|em|superficies|controles|ancho):
 *   campos      — el orden del DOM de los 18 campos de la IM y de la columna 2 de la EM, que es
 *                 el orden del Tab porque no hay un solo tabindex en el bloque, mas el foco REAL
 *                 campo por campo con teclas Tab de verdad.
 *   autos       — cada casilla automatica nueva contra la fila de referencias que la publica:
 *                 con insumos cargados, con uno borrado y con el formulario vacio.
 *   refs        — los tres bloques del cuadro, las dos columnas del bloque 2 y el grado de cada
 *                 celda.
 *   globos      — el mecanismo: toque abre, toque cierra, fuera cierra, Esc cierra, sin title en
 *                 el globo, sin enlace al manual, y la tarjeta no se corta en pantalla angosta.
 *   em          — la columna 2 de la estenosis mitral y el volumen eyectado del TSVI.
 *   superficies — informe en tres estilos, EN SUMA, Excel con su cuenta de columnas, PPT,
 *                 Laboratorio y el hash de los campos guardados.
 *   controles   — CONTROL NEGATIVO: grados, pastillas, aviso de la funcion diastolica, HFA-PEFF
 *                 y las otras lesiones, IDENTICOS a HEAD.
 *   ancho       — la maqueta a 1200, 390 y 360 px en los DOS temas.
 *
 * ⚠️ EL VALOR DE CADA CASILLA SE COMPARA CONTRA SU FILA, NO CONTRA UNA CUENTA DE LA SONDA. Una
 * sonda que recalculara la EROA mediria su propia copia de la formula y no la de la app.
 *
 * ⚠️ DENOMINADOR. Los campos de la IM viven detras de DOS puertas (la pestana Valvulas y el
 * cajon «Datos» de la lesion), asi que `tipear` ABORTA si el valor no queda: sin eso la sonda
 * informa «la casilla no se llena» sobre un tecleo que nunca ocurrio.
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
   ⚠️ CUERPO DE TEMPLATE LITERAL: NI UN ACENTO GRAVE adentro, tampoco en los comentarios, y la
   barra-ese de un regex va DOBLE —dentro de un template literal se cocina a la letra ese—. */
const SONDA = `
window.__P = {
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  ph(id)  { var e = document.getElementById(id); return e ? (e.placeholder || '') : null },
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

  /* ⚠️ DENOMINADOR DE ENTRADA. Los campos de las dos lesiones mitrales viven detras de DOS
     puertas: la pestana Valvulas y el cajon «Datos» de cada lesion. Sin abrir las dos, TODO
     tecleo se lo come el documento y cada escena sale «sin cambios», que es indistinguible de
     «no hay cambios». Se abre con el gesto del medico (valvDatosTog) y se COMPRUEBA aca. */
  abrirTodo() {
    /* ⚠️ showTab('valvulas') CIERRA LO QUE EL CLIC ACABA DE ABRIR —corre valvCerrarTarjetas—, asi
       que se llama SOLO si la pestana no esta activa. Es la trampa que CLAUDE.md documenta. */
    var tv = document.getElementById('tab-valvulas');
    if (!tv || !tv.classList.contains('active')) { try { showTab('valvulas') } catch(e) {} }
    /* ⚠️ Y HAY UNA PUERTA MAS ARRIBA: la seccion plegable de la valvula mitral, que nace con
       display:none y la abre toggleEteSeccion('valv-mitral', this) —con la coma y el this, asi que
       el buscador generico de revelar() no la encuentra por el literal—. */
    var sec = document.getElementById('ete-seccion-valv-mitral');
    if (sec && getComputedStyle(sec).display === 'none') {
      try { toggleEteSeccion('valv-mitral', document.querySelector('[onclick*="valv-mitral"]')) } catch(e) {}
      if (getComputedStyle(sec).display === 'none') sec.style.display = 'block';
    }
    ['caja-insuf-mitral','caja-esten-mitral'].forEach(function(id){
      var c = document.getElementById(id);
      if (c && !c.classList.contains('valv-datos-abierto')) { try { valvDatosTog(id) } catch(x){} }
    });
    ['bloque-insuf-mitral','bloque-em-detalle'].forEach(function(id){
      var b = document.getElementById(id);
      if (b && getComputedStyle(b).display === 'none') b.style.display = 'block';
    });
    var d = { im_vc: window.__P.vis('im_vc'), pisa_r: window.__P.vis('pisa_r'),
              im_itv: window.__P.vis('im_itv'), diam_mit: window.__P.vis('diam_mit'),
              em_dtsvi: window.__P.vis('em_dtsvi'), em_vtitsvi: window.__P.vis('em_vtitsvi'),
              em_vtimit: window.__P.vis('em_vtimit'),
              autos: ['vauto-jet-ai','vauto-eroa-pisa','vauto-volr-pisa','vauto-fr-pisa',
                      'vauto-vsv-tsvi'].filter(function(x){ return window.__P.existe(x) }) };
    d.ok = d.im_vc === true && d.pisa_r === true && d.em_dtsvi === true;
    return d },

  limpiar() { try { limpiarCampos(true) } catch(e) {} return 1 },

  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value } },

  /* ══ EL ORDEN DEL DOM DE LOS CAMPOS DE UNA LESION ══
     Es el orden del Tab: no hay un solo tabindex en los dos bloques, asi que el navegador recorre
     el orden del documento. La COLUMNA de cada campo se deriva del indice de su contenedor dentro
     de la rejilla, no de una lista cableada que se desactualiza. */
  mapaCampos(idBloque, idRejilla) {
    var b = document.getElementById(idBloque); if (!b) return { err: 'NO EXISTE ' + idBloque };
    var g = idRejilla ? document.getElementById(idRejilla)
                      : b.querySelector('.valv-cols-3');
    if (!g) return { err: 'sin rejilla en ' + idBloque };
    var cols = Array.from(g.children);
    var out = [];
    cols.forEach(function(col, ci){
      Array.from(col.querySelectorAll('input[id], select[id]')).forEach(function(e, fi){
        var st = getComputedStyle(e);
        out.push({ id: e.id, col: ci + 1, fila: fi + 1,
                   oculto: (st.display === 'none'),
                   auto: (e.hasAttribute('readonly')),
                   rot: window.__P.norm((e.closest('.fg') || {}).querySelector
                        ? (e.closest('.fg').querySelector('label') || {}).textContent || '' : '') });
      });
    });
    return { campos: out, columnas: cols.length } },

  /* Orden del DOM crudo del bloque: lo que el Tab va a recorrer, sin mirar columnas. */
  ordenDom(idBloque) {
    var b = document.getElementById(idBloque); if (!b) return null;
    return Array.from(b.querySelectorAll('input[id], select[id]'))
      .filter(function(e){ return getComputedStyle(e).display !== 'none' && e.type !== 'hidden' })
      .map(function(e){ return e.id }) },

  foco() { var a = document.activeElement; return a ? (a.id || a.tagName.toLowerCase()) : null },

  /* ══ LAS CASILLAS AUTOMATICAS CONTRA SU FILA DE REFERENCIAS ══
     Devuelve, para cada par, lo que dice la casilla y lo que dice la fila. La comparacion la hace
     el lector: aca no se decide nada. */
  autos() {
    var pares = [['vauto-eroa-pisa','eroa-val'], ['vauto-volr-pisa','volr-val'],
                 ['vauto-fr-pisa','freg-val'], ['vauto-jet-ai','im-jet-ratio'],
                 ['vauto-vsv-tsvi','vsvtsvi-val']];
    var o = {};
    pares.forEach(function(p){
      o[p[0]] = { campo: window.__P.val(p[0]), ph: window.__P.ph(p[0]),
                  fila: window.__P.txt(p[1]), existe: window.__P.existe(p[0]) };
    });
    o.cont = { eroa: window.__P.val('im_eroa_cont'), volr: window.__P.val('vr_cont'),
               fr: window.__P.val('im_fr_cont'), vmlat: window.__P.val('vm_lat') };
    return o },

  /* ══ EL CUADRO DE REFERENCIAS ══ los bloques, sus filas y el grado de cada una. */
  refs() {
    var box = document.querySelector('#bloque-insuf-mitral .calc-box');
    if (!box) return { err: 'sin calc-box' };
    var bloques = Array.from(box.querySelectorAll('[data-im-bloque]')).map(function(b){
      return { n: b.getAttribute('data-im-bloque'),
               filas: b.querySelectorAll('.calc-row').length } });
    function celda(id) { var e = document.getElementById(id);
      var g = document.querySelector('[data-grado-de="' + id + '"]');
      return { v: e ? window.__P.norm(e.textContent) : 'NO EXISTE',
               grado: g ? window.__P.norm(g.textContent) : null } }
    return { bloques: bloques,
             nBloques: bloques.length,
             ondaE: window.__P.txt('im-ondae-interp'),
             vtiRatio: window.__P.txt('im-vti-ratio'),
             vc: celda('im-vc-ref'), jet: celda('im-jet-ratio'),
             ondaS: window.__P.txt('im-onda-s-interp'),
             pisa: { eroa: celda('eroa-val'), volr: celda('volr-val'), fr: celda('freg-val') },
             cont: { eroa: celda('im-eroa-cont-ref'), volr: celda('im-volr-cont-ref'),
                     fr: celda('im-fr-cont-ref') },
             vmlat: window.__P.txt('im-vmlat-ref'),
             vsv: window.__P.txt('vsvtsvi-val'),
             sev: window.__P.txt('im-sev'),
             disc: window.__P.txt('im-discordancia'),
             contSev: window.__P.norm((document.getElementById('im-cont-severidad') || {}).textContent || ''),
             formulas: (function(){ var t = window.__P.norm(box.parentNode ? box.parentNode.textContent : '');
               return t.indexOf('EROA = Vol-R') > -1 })() } },

  /* ══ LOS GLOBOS «i» DE LA PESTANA ══ censo y mecanismo. */
  globos() {
    var t = document.getElementById('tab-valvulas'); if (!t) return { err: 'sin pestana' };
    var g = Array.from(t.querySelectorAll('[data-vinfo]'));
    var viejos = Array.from(t.querySelectorAll('[onclick]')).filter(function(e){
      return (e.getAttribute('onclick')||'').indexOf('abrirAyudaEco') > -1 });
    return { n: g.length,
             claves: g.map(function(e){ return e.getAttribute('data-vinfo') }),
             conTitle: g.filter(function(e){ return !!e.getAttribute('title') }).length,
             tags: g.map(function(e){ return e.tagName.toLowerCase() }).filter(function(v,i,a){ return a.indexOf(v)===i }),
             alManual: viejos.length,
             /* ⚠️ EL TAMANO DEL GLOBO VIEJO, para poder afirmar que el control NO cambio de medida:
                el span con onclick de HEAD entraba en la MISMA regla global de 44 px por su
                atributo onclick que el button de hoy. Sin esta medicion, «44 x 44» en el
                arbol nuevo no dice si subio, bajo o quedo igual. */
             geoViejo: (function(){ var v = viejos.filter(function(e){
                 if ((e.textContent||'').indexOf('\u24d8') < 0) return false;
                 var r = e.getBoundingClientRect(); return r.width > 0 })[0];
               if (!v) return null; var r = v.getBoundingClientRect();
               return Math.round(r.width) + 'x' + Math.round(r.height) })(),
             tarjeta: window.__P.existe('vinfo-card') } },

  tarjeta() {
    var c = document.getElementById('vinfo-card');
    if (!c) return { existe: false };
    var st = getComputedStyle(c);
    var r = c.getBoundingClientRect();
    return { existe: true, abierta: st.display !== 'none',
             texto: window.__P.norm(c.textContent),
             largo: window.__P.norm(c.textContent).length,
             bloques: c.querySelectorAll('[data-vinfo-b]').length,
             x: Math.round(r.left), y: Math.round(r.top),
             w: Math.round(r.width), h: Math.round(r.height),
             vw: window.innerWidth, vh: window.innerHeight,
             dentro: (r.left >= -1 && r.right <= window.innerWidth + 1),
             alManual: /abrirAyudaEco|manual/i.test(c.innerHTML),
             zIndex: st.zIndex } },

  globoSel(clave) {
    var e = document.querySelector('[data-vinfo="' + clave + '"]');
    if (!e) return { err: 'NO EXISTE globo ' + clave };
    if (!e.id) e.id = '__gl_' + clave.replace(/[^a-z0-9]/gi, '');
    var r = e.getBoundingClientRect();
    return { sel: e.id, title: e.getAttribute('title'), tag: e.tagName.toLowerCase(),
             tabindex: e.getAttribute('tabindex'), rol: e.getAttribute('aria-label'),
             /* ⚠️ DENOMINADOR: un globo dentro de un bloque oculto existe y mide 0 x 0. Sin esto,
                «no abre» se lee igual que «el mecanismo no funciona». */
             geo: Math.round(r.width) + 'x' + Math.round(r.height),
             vis: window.__P.vis(e.id) } },

  /* Un hover REAL no se puede fingir desde el DOM; lo que si se puede afirmar es que el globo no
     tiene un manejador de hover ni un title, que son los DOS caminos por los que algo aparece al
     pasar el mouse en esta app. */
  sinHover(clave) {
    var e = document.querySelector('[data-vinfo="' + clave + '"]');
    if (!e) return { err: 'NO EXISTE' };
    return { title: e.getAttribute('title'), onmouseover: e.getAttribute('onmouseover'),
             onmouseenter: e.getAttribute('onmouseenter') } },

  /* ══ LA MAQUETA ══ posicion y tamano de cada campo, para ver desbordes y solapamientos.
     Se mide la caja REAL de cada .fg, no la clase: una rejilla que colapsa a una columna lo
     dice en las coordenadas y no en el marcado. */
  maqueta(idBloque) {
    var b = document.getElementById(idBloque); if (!b) return { err: 'NO EXISTE ' + idBloque };
    var g = b.querySelector('.valv-cols-3'); if (!g) return { err: 'sin rejilla' };
    var rg = g.getBoundingClientRect();
    var filas = [];
    Array.from(g.children).forEach(function(col, ci){
      Array.from(col.querySelectorAll('.fg')).forEach(function(f){
        var e = f.querySelector('input[id], select[id]'); if (!e) return;
        if (getComputedStyle(e).display === 'none') return;
        var r = f.getBoundingClientRect();
        filas.push({ id: e.id, col: ci + 1, x: Math.round(r.left), y: Math.round(r.top),
                     w: Math.round(r.width), h: Math.round(r.height) });
      });
    });
    /* Solapamientos: dos cajas que se pisan de verdad (no las que solo comparten borde). */
    var choques = [];
    for (var i = 0; i < filas.length; i++) for (var j = i + 1; j < filas.length; j++) {
      var a = filas[i], c = filas[j];
      if (a.x < c.x + c.w - 1 && c.x < a.x + a.w - 1 &&
          a.y < c.y + c.h - 1 && c.y < a.y + a.h - 1) choques.push(a.id + '/' + c.id);
    }
    var desborda = filas.filter(function(f){ return f.x + f.w > rg.right + 1 || f.x < rg.left - 1 })
                        .map(function(f){ return f.id });
    /* Columnas VISUALES: cuantas coordenadas x distintas hay. A 360 px la rejilla colapsa a una. */
    var xs = filas.map(function(f){ return f.x }).filter(function(v,i,a){ return a.indexOf(v)===i });
    return { n: filas.length, colsVisuales: xs.length, choques: choques, desborda: desborda,
             scrollH: document.documentElement.scrollWidth > window.innerWidth + 1,
             rejilla: Math.round(rg.width), filas: filas } },

  tema(claro) {
    var r = document.documentElement;
    if (claro) r.classList.add('light-mode'); else r.classList.remove('light-mode');
    return r.classList.contains('light-mode') },

  /* Color REAL resuelto, para que una variable que no existe en esta zona se vea. */
  color(sel, prop) {
    var e = document.querySelector(sel); if (!e) return 'NO EXISTE';
    return getComputedStyle(e)[prop || 'color'] },

  informe(estilo) {
    try { if (typeof setEstiloInforme === 'function') setEstiloInforme(estilo) } catch(e) {}
    try { generarInforme() } catch(e) { return { err: String(e && e.message) } }
    return { inf: window.__P.val('informe_texto'), suma: window.__P.val('en_suma') } },

  /* ══ LAS OTRAS SUPERFICIES ══ */
  grados() {
    return { im: window.__P.val('im_grado'), ia: window.__P.val('ia_grado'),
             it: window.__P.val('it_grado'), em: window.__P.val('em_grado'),
             ea: window.__P.val('ea_grado'), et: window.__P.val('et_grado'),
             ep: window.__P.val('ep_grado'), ip: window.__P.val('ip_grado'),
             imSev: window.__P.txt('im-sev'), emSev: window.__P.txt('em-sev-integrada'),
             avmThp: window.__P.val('em_avm_thp_display'), avmCont: window.__P.val('avm_cont'),
             avmIdx: window.__P.val('avm_idx'), gmax: window.__P.val('em_gmax'),
             diast: window.__P.txt('dd-interp'),
             exclusiones: window.__P.norm((document.getElementById('diast-excl-aviso') || {}).textContent || ''),
             hfapeff: window.__P.txt('hfapeff-eco-val') } },

  pastillas() {
    var o = {};
    Array.from(document.querySelectorAll('[id^="pill-"]')).forEach(function(p){
      o[p.id] = window.__P.norm(p.textContent) });
    return o },

  excel() {
    try {
      if (typeof construirFilaLab !== 'function' && typeof _labFilaExcel !== 'function') {
        var f = window.labFilaDeInforme || window._labFila;
        if (typeof f !== 'function') return { err: 'SIN EXPORTADOR' };
      }
    } catch(e) {}
    try {
      var fila = (typeof window.__labFilaProbe === 'function') ? window.__labFilaProbe() : null;
      if (!fila) return { err: 'SIN FILA' };
      var ks = Object.keys(fila);
      return { n: ks.length, hash: window.__P.hash(JSON.stringify(fila)) };
    } catch(e) { return { err: String(e && e.message) } } },

  /* ══ LO QUE DE VERDAD VIAJA CON EL ESTUDIO ══
     Replica EXACTAMENTE el barrido de guardarInforme: el mismo selector y la misma exclusion por
     prefijo (_noEsDelEstudio). Es la unica medicion que contesta «estas casillas nuevas se
     guardan?»; contar los input con id del documento cuenta tambien las que NO viajan. */
  camposDelEstudio() {
    var o = {};
    Array.from(document.querySelectorAll('input[id], select[id], textarea[id]')).forEach(function(e){
      if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
      if (e.id === 'informe_texto' || e.id === 'en_suma') return;
      o[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '0') : e.value });
    /* ⚠️ LAS CLAVES SE ORDENAN ANTES DE HASHEAR, Y NO ES COSMETICO. El objeto se arma en ORDEN
       DEL DOM, asi que MOVER un campo de columna —que es la mitad de esta tanda— cambia el string
       de JSON sin cambiar un solo valor: la primera corrida informo «893 campos iguales, hash
       distinto» y el hash era el unico que hablaba. Ordenadas, el hash dice lo que promete. */
    var ks = Object.keys(o).sort();
    var plano = ks.map(function(k){ return k + '=' + o[k] }).join('|');
    return { n: ks.length, hash: window.__P.hash(plano),
             vauto: ks.filter(function(k){ return k.indexOf('vauto-') === 0 }),
             claves: window.__P.hash(ks.join(',')) } },

  camposSinTextos() {
    var o = {};
    Array.from(document.querySelectorAll('input[id], select[id], textarea[id]')).forEach(function(e){
      if (e.id === 'informe_texto' || e.id === 'en_suma') return;
      o[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '0') : e.value });
    return { n: Object.keys(o).length, hash: window.__P.hash(JSON.stringify(o)) } },

  /* Lo que el Laboratorio deriva del TEXTO del resumen. */
  lab(inf, suma) {
    var o = {};
    try { o.diast = (typeof _labDiastGrado === 'function') ? _labDiastGrado(inf + ' ' + suma) : 'SIN FN' } catch(e) { o.diast = 'EXC' }
    try { o.em = (typeof _labEstenSev === 'function') ? _labEstenSev({ informe_texto: inf, en_suma: suma }, 'em_grado') : 'SIN FN' } catch(e) { o.em = 'EXC' }
    return o }
};
1`;


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
  /* ⚠️ `ev()` ENVUELVE EN `return (...)`, ASI QUE NO SIRVE PARA UN CUERPO DE VARIAS SENTENCIAS:
     la inyeccion de la sonda y el recargado con la sesion puesta son bloques, no expresiones, y
     con el envoltorio dan «Unexpected token 'try'». Van por aca, sin envolver. */
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
  /* CLIC REAL, con la comprobacion de QUIEN esta en el punto. Si el blanco esta tapado no se
     clickea a ciegas: se declara quien lo tapa y se cae al foco por DOM + Enter. */
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
    /* ⚠️ ABORTA SI EL CAMPO NO EXISTE. Contra el arbol de HEAD los campos de una tanda nueva no
       estan; sin este corte el foco queda en el campo ANTERIOR y los caracteres se le CONCATENAN,
       y la sonda informa un paciente INVENTADO como una diferencia del commit. Medido en la tanda
       del strain: tipear «15» en un campo ausente dejo el E/e-prima en 1848,5 en vez de 18,5. */
    const hay = await ev(`window.__P.existe(${JSON.stringify(id)})`);
    if (!hay) throw new Error('tipear() ABORTA: el campo #' + id + ' no existe en este arbol');
    const via = await clicEn(id);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(!e) return 0; e.focus(); try{ e.select() }catch(x){} return 1 })()`);
    for (const ch of String(valor)) await tecla(ch, ch);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
    await pausa(60);
    const quedo = await ev(`window.__P.val(${JSON.stringify(id)})`);
    /* ⚠️ ABORTA SI EL VALOR NO QUEDO. Un campo que existe pero no tiene geometria se come el
       tecleo en silencio —`clicEn` devuelve «NO SE PUDO», el foco no llega y las teclas se las
       traga el documento— y la escena informa «no avisa» sobre un dato que nunca se cargo. Medido
       en esta misma tanda con `im_vc`, que vive detras de DOS puertas en Valvulas. */
    if (String(quedo) !== String(valor)) {
      throw new Error('tipear() ABORTA: #' + id + ' pedido «' + valor + '» quedo «' + quedo
                      + '» (via ' + via.via + ')');
    }
    return { via: via.via, pedido: String(valor), quedo: String(quedo), ok: String(quedo) === String(valor) };
  }

  await evCrudo(`try{sessionStorage.setItem('ett_auth','1')}catch(e){}; location.reload(); 1`);
  await pausa(2600);
  await evCrudo(SONDA);

  /* ⚠️ EL AVISO LEGAL TAPA LA PAGINA ENTERA Y VUELVE A MITAD DE CORRIDA. */
  async function despejar() {
    return ev(`(function(){
      var o = {};
      ['modalAvisoEco','login-overlay'].forEach(function(id){
        var m = document.getElementById(id);
        if (!m) { o[id] = 'NO EXISTE'; return }
        if (getComputedStyle(m).display !== 'none') { m.style.display = 'none'; o[id] = 'cerrado' }
        else o[id] = 'ya estaba'; });
      return o })()`);
  }
  await despejar();
  const denom = await ev(`window.__P.abrirTodo()`);

  /* ══ LA ESCENA BASE ══ un paciente con los DOS metodos cargados, para que las seis casillas de
     la columna 3 tengan numero y las filas de los dos metodos tengan grado. Los valores salen de
     las escenas de las tandas anteriores de valvulas (TC-335 y TC-463). */
  const BASE = { im_vc: '7', im_jet_area: '12', pisa_r: '10', pisa_val: '40', im_vmax: '5',
                 im_itv: '130', im_ai_area: '26', diam_mit: '30', vtim: '13',
                 em_dtsvi: '20', em_vtitsvi: '20', em_vtimit: '15' };
  async function escena(extra, quitar) {
    await despejar();
    await ev(`window.__P.limpiar()`);
    await pausa(130);
    await ev(`window.__P.abrirTodo()`);
    const campos = Object.assign({}, BASE, extra || {});
    (quitar || []).forEach((k) => { delete campos[k]; });
    const tecleos = {};
    for (const id of Object.keys(campos)) tecleos[id] = await tipear(id, campos[id]);
    await pausa(160);
    return { ok: Object.keys(tecleos).every((k) => tecleos[k].ok), n: Object.keys(tecleos).length };
  }
  async function textos() {
    const r = {};
    for (const est of ['conciso', 'estandar', 'narrativo']) {
      const x = await ev(`window.__P.informe(${JSON.stringify(est)})`);
      r[est] = { inf: x.inf, suma: x.suma };
    }
    return r;
  }

  const out = { md5Ini, archivo: FILE, denom, soloGrupo: SOLO || 'TODOS' };
  const hacer = (g) => !SOLO || SOLO.split(',').indexOf(g) > -1;

  if (hacer('campos')) {
    await escena();
    out.campos = {
      im: await ev(`window.__P.mapaCampos('bloque-insuf-mitral')`),
      imDom: await ev(`window.__P.ordenDom('bloque-insuf-mitral')`),
      em: await ev(`window.__P.mapaCampos('bloque-em-detalle')`),
      emDom: await ev(`window.__P.ordenDom('bloque-em-detalle')`)
    };
    /* ══ EL TAB, CON TECLAS REALES ══ se enfoca el primer campo de la IM y se tabula. */
    await clicEn('im_vc');
    const focos = [await ev(`window.__P.foco()`)];
    for (let i = 0; i < 17; i++) { await tecla('Tab', null); await pausa(45);
      focos.push(await ev(`window.__P.foco()`)); }
    out.campos.tab = focos;
  }

  if (hacer('autos')) {
    out.autos = {};
    await escena();
    out.autos.cargado = await ev(`window.__P.autos()`);
    await escena({}, ['im_itv']);
    out.autos.sinJet = await ev(`window.__P.autos()`);
    await escena({}, ['pisa_r']);
    out.autos.sinRadio = await ev(`window.__P.autos()`);
    await escena({}, ['em_dtsvi', 'em_vtitsvi']);
    out.autos.sinTsvi = await ev(`window.__P.autos()`);
    await escena({}, ['im_jet_area']);
    out.autos.sinJetArea = await ev(`window.__P.autos()`);
    await despejar(); await ev(`window.__P.limpiar()`); await pausa(140);
    await ev(`window.__P.abrirTodo()`);
    out.autos.vacio = await ev(`window.__P.autos()`);
  }

  if (hacer('refs')) {
    await escena();
    out.refs = { cargado: await ev(`window.__P.refs()`) };
    await despejar(); await ev(`window.__P.limpiar()`); await pausa(140);
    await ev(`window.__P.abrirTodo()`);
    out.refs.vacio = await ev(`window.__P.refs()`);
  }

  if (hacer('globos')) {
    await escena();
    out.globos = { censo: await ev(`window.__P.globos()`), escenas: [] };
    /* ⚠️ LOS TRES GLOBOS DE LA PROTESIS NO SON ALCANZABLES EN UNA ESCENA NATIVA, Y ESO NO ES UN
       DEFECTO: su bloque esta oculto hasta que la morfologia mitral es protesica, asi que el
       boton existe y mide 0 x 0. Se corre una escena PROTESICA aparte para probar que el
       mecanismo tambien vale ahi; sin ella, «no abre» se leeria como «el mecanismo no funciona».
       El selector de morfologia va por `set` porque es un <select> de escenario. */
    const claves = out.globos.censo.claves || [];
    for (const k of claves) {
      const sel = await ev(`window.__P.globoSel(${JSON.stringify(k)})`);
      if (sel.err) { out.globos.escenas.push({ k, err: sel.err }); continue; }
      const cerrada0 = await ev(`window.__P.tarjeta()`);
      const abrir = await clicEn(sel.sel);
      const abierta = await ev(`window.__P.tarjeta()`);
      /* ⚠️ EL MISMO BOTON CIERRA: segundo toque. */
      await clicEn(sel.sel);
      const trasSegundo = await ev(`window.__P.tarjeta()`);
      /* Y se vuelve a abrir para probar los otros dos cierres. */
      await clicEn(sel.sel);
      await tecla('Escape', null); await pausa(120);
      const trasEsc = await ev(`window.__P.tarjeta()`);
      await clicEn(sel.sel);
      await clicEn('im_vc');            /* un clic AFUERA, en un campo cualquiera */
      const trasFuera = await ev(`window.__P.tarjeta()`);
      out.globos.escenas.push({ k, sel: sel.sel, tag: sel.tag, title: sel.title,
        rotulo: sel.rol, viaAbrir: abrir.via, vis: sel.vis, geoBtn: sel.geo,
        antes: cerrada0.abierta, abierta: abierta.abierta,
        texto: abierta.texto, largo: abierta.largo, bloques: abierta.bloques,
        alManual: abierta.alManual, dentro: abierta.dentro,
        geo: { x: abierta.x, y: abierta.y, w: abierta.w, h: abierta.h, vw: abierta.vw, vh: abierta.vh },
        trasSegundo: trasSegundo.abierta, trasEsc: trasEsc.abierta, trasFuera: trasFuera.abierta,
        sinHover: await ev(`window.__P.sinHover(${JSON.stringify(k)})`) });
    }
  }

  if (hacer('globos')) {
    await ev(`window.__P.set('vm_morf', 'Pr\u00f3tesis mec\u00e1nica')`);
    await pausa(200);
    await ev(`window.__P.abrirTodo()`);
    out.globosProt = [];
    for (const k of ['prot-eoa', 'prot-dvi', 'prot-ppm']) {
      const sel = await ev(`window.__P.globoSel(${JSON.stringify(k)})`);
      if (sel.err) { out.globosProt.push({ k, err: sel.err }); continue; }
      await clicEn(sel.sel);
      const ab = await ev(`window.__P.tarjeta()`);
      await clicEn(sel.sel);
      const ce = await ev(`window.__P.tarjeta()`);
      out.globosProt.push({ k, geoBtn: sel.geo, vis: sel.vis, abierta: ab.abierta,
                            largo: ab.largo, dentro: ab.dentro, trasSegundo: ce.abierta });
    }
  }

  if (hacer('em')) {
    await escena();
    out.em = { cargado: await ev(`window.__P.autos()`),
               grados: await ev(`window.__P.grados()`) };
    await escena({}, ['em_vtitsvi']);
    out.em.sinVti = await ev(`window.__P.autos()`);
  }

  if (hacer('superficies')) {
    await escena();
    const T = await textos();
    out.superficies = {
      inf: T, hash: {
        conciso: await ev(`window.__P.hash(${JSON.stringify(T.conciso.inf)})`),
        estandar: await ev(`window.__P.hash(${JSON.stringify(T.estandar.inf)})`),
        narrativo: await ev(`window.__P.hash(${JSON.stringify(T.narrativo.inf)})`),
        sumaN: await ev(`window.__P.hash(${JSON.stringify(T.narrativo.suma)})`)
      },
      campos: await ev(`window.__P.camposSinTextos()`),
      estudio: await ev(`window.__P.camposDelEstudio()`),
      lab: await ev(`window.__P.lab(${JSON.stringify(T.narrativo.inf)}, ${JSON.stringify(T.narrativo.suma)})`)
    };
  }

  if (hacer('controles')) {
    await escena();
    out.controles = { grados: await ev(`window.__P.grados()`),
                      pastillas: await ev(`window.__P.pastillas()`),
                      colorAviso: await ev(`window.__P.color('#im-pdf-metodo-aviso','color')`) };
    /* ⚠️ EL COLOR REAL DE LA TARJETA EN LOS DOS TEMAS. La tanda anterior encontro un aviso
       «ambar» que se veia GRIS porque `--amber` solo existe dentro de `.amilo-root`: lo que se
       mide aca es el valor COMPUTADO, no la variable escrita. */
    const _sel = await ev(`window.__P.globoSel('eroa-pisa')`);
    if (!_sel.err) { await clicEn(_sel.sel); }
    out.controles.colorOjoOscuro = await ev(`window.__P.color('#vinfo-card [data-vinfo-b=\"ojo\"]','color')`);
    out.controles.colorTitOscuro = await ev(`window.__P.color('#vinfo-card h4','color')`);
    out.controles.fondoOscuro = await ev(`window.__P.color('#vinfo-card','backgroundColor')`);
    await ev(`window.__P.tema(true)`);
    out.controles.colorOjoClaro = await ev(`window.__P.color('#vinfo-card [data-vinfo-b=\"ojo\"]','color')`);
    out.controles.colorTitClaro = await ev(`window.__P.color('#vinfo-card h4','color')`);
    out.controles.fondoClaro = await ev(`window.__P.color('#vinfo-card','backgroundColor')`);
    out.controles.colorAvisoClaro = await ev(`window.__P.color('#im-pdf-metodo-aviso','color')`);
    out.controles.temaClaro = await ev(`window.__P.tema(true)`);
    await ev(`window.__P.tema(false)`);
  }

  if (hacer('ancho')) {
    /* ⚠️ EL ANCHO SE EMULA POR CDP Y NO REDIMENSIONANDO LA VENTANA: `setDeviceMetricsOverride` es
       lo que mueve de verdad el media feature `width` en headless. Y se vuelve a 1400 al final:
       un override que queda puesto contamina el grupo siguiente. */
    async function ancho(px) {
      await cdp.send('Emulation.setDeviceMetricsOverride',
        { width: px, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
      await pausa(260);
    }
    await escena();
    out.ancho = [];
    for (const px of [1200, 390, 360]) {
      for (const claro of [false, true]) {
        await ancho(px);
        /* ⚠️ EL TEMA SE PONE POR LA CLASE `light-mode` DEL ELEMENTO RAIZ, que es el mecanismo de
           esta app; escribir `data-theme` fue el falso que la tanda del cartel de pepticos pago,
           con las dos capturas saliendo identicas byte por byte. Se COMPRUEBA que quedo puesta. */
        const t = await ev(`window.__P.tema(${claro})`);
        await pausa(140);
        /* ⚠️ Y LA TARJETA EN ESE ANCHO: el pedido dice que no se corte a 390 ni a 360 px. Se abre
           una de las nuevas con un clic real y se mide si su caja entra en el viewport. */
        const _s = await ev(`window.__P.globoSel('eroa-pisa')`);
        let tar = null;
        if (!_s.err) { await clicEn(_s.sel); tar = await ev(`window.__P.tarjeta()`);
                       await clicEn(_s.sel); }
        out.ancho.push({ px, claro, claseOk: (t === claro),
          im: await ev(`window.__P.maqueta('bloque-insuf-mitral')`),
          em: await ev(`window.__P.maqueta('bloque-em-detalle')`),
          tarjeta: tar ? { abierta: tar.abierta, dentro: tar.dentro, w: tar.w, h: tar.h,
                           x: tar.x, y: tar.y, vw: tar.vw, vh: tar.vh,
                           entraAlto: (tar.y >= 0 && tar.y + tar.h <= tar.vh) } : null });
      }
    }
    await ev(`window.__P.tema(false)`);
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
  }

  if (hacer('captura')) {
    /* ⚠️ EL `clip` DE Page.captureScreenshot VA EN COORDENADAS DE PAGINA y getBoundingClientRect da
       las del VIEWPORT: con la pagina scrolleada el PNG sale en negro. La tarjeta es
       `position:fixed`, asi que se le suma el scroll para pasar de una a la otra.
       ⚠️ Y SE COMPRUEBA QUE LA CLASE `light-mode` QUEDO PUESTA: escribir `data-theme` fue el falso
       que dejo dos capturas identicas byte por byte en la tanda del cartel de pepticos. */
    const DEST = arg('--dest') || '/tmp';
    async function ancho2(px) {
      await cdp.send('Emulation.setDeviceMetricsOverride',
        { width: px, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
      await pausa(260);
    }
    await escena();
    out.captura = [];
    for (const px of [1200, 360]) {
      for (const claro of [false, true]) {
        await ancho2(px);
        const t = await ev(`window.__P.tema(${claro})`);
        await pausa(160);
        for (const k of ['eroa-pisa', 'eroa-cont', 'vsv-tsvi', 'avm-thp', 'avm-cont']) {
          const sel = await ev(`window.__P.globoSel(${JSON.stringify(k)})`);
          if (sel.err) { out.captura.push({ k, px, claro, err: sel.err }); continue; }
          await clicEn(sel.sel);
          const g = await ev(`(function(){ var c=document.getElementById('vinfo-card');
            if(!c || getComputedStyle(c).display==='none') return null;
            var r=c.getBoundingClientRect();
            return { x:Math.round(r.left+scrollX), y:Math.round(r.top+scrollY),
                     w:Math.round(r.width), h:Math.round(r.height) } })()`);
          if (!g) { out.captura.push({ k, px, claro, err: 'no abrio' }); continue; }
          const shot = await cdp.send('Page.captureScreenshot',
            { format: 'png', clip: { x: g.x, y: g.y, width: g.w, height: g.h, scale: 2 },
              captureBeyondViewport: true }, sessionId);
          const nom = `${DEST}/vinfo_${k}_${px}_${claro ? 'claro' : 'oscuro'}.png`;
          await writeFile(nom, Buffer.from(shot.data, 'base64'));
          out.captura.push({ k, px, claro, claseOk: (t === claro), png: nom,
                             bytes: Buffer.from(shot.data, 'base64').length, geo: g });
          await clicEn(sel.sel);
        }
      }
    }
    await ev(`window.__P.tema(false)`);
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: 1400, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
  }

  out.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  out.md5Igual = out.md5Ini === out.md5Fin;
  cdp.close();
  await new Promise((r) => srv.close(r));
  console.log(JSON.stringify(out, null, 2));
  process.exit(0);
}
main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
