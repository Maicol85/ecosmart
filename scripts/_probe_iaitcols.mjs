#!/usr/bin/env node
/**
 * _probe_iaitcols.mjs — sonda A/B de SOLO LECTURA para el rediseno D2 de Valvulas (2026-10-14):
 *   D2a · INSUFICIENCIA AORTICA: tres columnas de CUATRO, con los tres automaticos de PISA en la
 *         columna 3 (EROA, Vol-R y FR), que COPIAN su fila del cuadro de referencias.
 *   D2b · INSUFICIENCIA TRICUSPIDEA: tres columnas, con los dos automaticos de PISA en la
 *         columna 3 (EROA y Vol-R). La FR de la IT NO EXISTE en la app y no se inventa.
 *   D2c · las tarjetas «i» nuevas y las SIETE reescritas.
 *   D2d · el rotulo PHT -> THP en las superficies que se leen.
 *   D2e · el color REAL de los avisos que usaban --amber fuera de .amilo-root.
 *
 * Infraestructura calcada de scripts/_probe_imcols.mjs (teclas y clics reales, cierre del arbol
 * de Chrome por grupo, despeje del aviso legal, md5 al principio y al final). NO muta index.html.
 *
 *   node scripts/_probe_iaitcols.mjs --file /tmp/index.HEAD.html > /tmp/d2.HEAD.json
 *   node scripts/_probe_iaitcols.mjs                             > /tmp/d2.NEW.json
 *
 * Grupos (--solo campos|autos|globos|thp|color|superficies|controles|ancho):
 *   campos      — el orden del DOM de los campos de la IAo y de la IT, que es el orden del Tab
 *                 porque no hay un solo tabindex en los dos bloques, mas el foco REAL con Tab.
 *   autos       — cada casilla automatica contra la fila de referencias que la publica: con
 *                 insumos cargados, con uno borrado y con el formulario vacio.
 *   globos      — el censo del registro, el mecanismo (toque abre, toque cierra, fuera cierra,
 *                 Esc cierra), el texto de cada tarjeta y que ninguna lleva al manual.
 *   thp         — el censo del rotulo en las superficies que se leen, y que el Excel sigue
 *                 exportando sus encabezados con el nombre que el importador lee.
 *   color       — el color computado de los avisos en los DOS temas.
 *   superficies — informe en tres estilos, EN SUMA, Excel con su cuenta de columnas, PPT,
 *                 Laboratorio y el hash de los campos guardados.
 *   controles   — CONTROL NEGATIVO: grados, pastillas, lesiones mitrales, funcion diastolica y
 *                 HFA-PEFF IDENTICOS a HEAD.
 *   ancho       — la maqueta a 1200, 390 y 360 px en los DOS temas.
 *
 * ⚠️ EL VALOR DE CADA CASILLA SE COMPARA CONTRA SU FILA, NO CONTRA UNA CUENTA DE LA SONDA. Una
 * sonda que recalculara la EROA mediria su propia copia de la formula y no la de la app.
 *
 * ⚠️ DENOMINADOR. Los campos de las dos lesiones viven detras de DOS puertas (la seccion
 * plegable de la valvula y el cajon «Datos»), asi que `tipear` ABORTA si el valor no queda.
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

  /* ⚠️ DENOMINADOR DE ENTRADA. Los campos de las cuatro lesiones viven detras de DOS puertas: la
     seccion plegable de la valvula y el cajon «Datos» de la lesion. Sin abrir las dos, TODO
     tecleo se lo come el documento y cada escena sale «sin cambios», que es indistinguible de
     «no hay cambios».
     ⚠️ showTab('valvulas') CIERRA LO QUE EL CLIC ACABA DE ABRIR —corre valvCerrarTarjetas—, asi
     que se llama SOLO si la pestana no esta activa. Es la trampa que CLAUDE.md documenta. */
  abrirTodo() {
    var tv = document.getElementById('tab-valvulas');
    if (!tv || !tv.classList.contains('active')) { try { showTab('valvulas') } catch(e) {} }
    ['valv-aortica','valv-tricuspide','valv-mitral'].forEach(function(k){
      var sec = document.getElementById('ete-seccion-' + k);
      if (sec && getComputedStyle(sec).display === 'none') {
        try { toggleEteSeccion(k, document.querySelector('[onclick*="' + k + '"]')) } catch(e) {}
        if (getComputedStyle(sec).display === 'none') sec.style.display = 'block';
      }
    });
    ['caja-insuf-aortica','caja-esten-aortica','caja-insuf-tricuspide','caja-esten-tricuspide',
     'caja-insuf-mitral','caja-esten-mitral'].forEach(function(id){
      var c = document.getElementById(id);
      if (c && !c.classList.contains('valv-datos-abierto')) { try { valvDatosTog(id) } catch(x){} }
    });
    ['bloque-insuf-aortica','bloque-ea-detalle','bloque-insuf-mitral','bloque-em-detalle'].forEach(function(id){
      var b = document.getElementById(id);
      if (b && getComputedStyle(b).display === 'none') b.style.display = 'block';
    });
    var d = { ia_vc: window.__P.vis('ia_vc'), ia_pisa_r: window.__P.vis('ia_pisa_r'),
              ia_vti: window.__P.vis('ia_vti'), ia_vti_desc: window.__P.vis('ia_vti_desc'),
              it_vc: window.__P.vis('it_vc'), it_pisa_r: window.__P.vis('it_pisa_r'),
              it_vti: window.__P.vis('it_vti'), it_densidad: window.__P.vis('it_densidad'),
              ea_dtsvi: window.__P.vis('ea_dtsvi'), ea_vtitsvi: window.__P.vis('ea_vtitsvi'),
              autos: ['vauto-ia-eroa','vauto-ia-volr','vauto-ia-fr',
                      'vauto-it-eroa','vauto-it-volr'].filter(function(x){ return window.__P.existe(x) }) };
    d.ok = d.ia_vc === true && d.ia_pisa_r === true && d.it_vc === true && d.ea_dtsvi === true;
    return d },

  limpiar() { try { limpiarCampos(true) } catch(e) {} return 1 },

  /* ══ EL ORDEN DEL DOM DE LOS CAMPOS DE UNA LESION ══
     Es el orden del Tab: no hay un solo tabindex en los bloques de estas dos lesiones, asi que el
     navegador recorre el orden del documento. La COLUMNA de cada campo se deriva del indice de su
     contenedor dentro de la rejilla, no de una lista cableada que se desactualiza. */
  mapaCampos(idBloque, selRejilla) {
    var b = document.getElementById(idBloque); if (!b) return { err: 'NO EXISTE ' + idBloque };
    var g = b.querySelector(selRejilla || '.valv-cols-3');
    if (!g) return { err: 'sin rejilla en ' + idBloque };
    var cols = Array.from(g.children);
    var out = [];
    cols.forEach(function(col, ci){
      Array.from(col.querySelectorAll('input[id], select[id]')).forEach(function(e, fi){
        var st = getComputedStyle(e);
        var fg = e.closest('.fg');
        out.push({ id: e.id, col: ci + 1, fila: fi + 1,
                   oculto: (st.display === 'none'),
                   auto: e.hasAttribute('readonly'),
                   rot: window.__P.norm(fg && fg.querySelector('label') ? fg.querySelector('label').textContent : '') });
      });
    });
    return { campos: out, columnas: cols.length } },

  ordenDom(idBloque) {
    var b = document.getElementById(idBloque); if (!b) return null;
    return Array.from(b.querySelectorAll('input[id], select[id]'))
      .filter(function(e){ return getComputedStyle(e).display !== 'none' && e.type !== 'hidden' })
      .map(function(e){ return e.id }) },

  foco() { var a = document.activeElement; return a ? (a.id || a.tagName.toLowerCase()) : null },

  /* ══ LAS CASILLAS AUTOMATICAS CONTRA SU FILA DE REFERENCIAS ══
     Devuelve, para cada par, lo que dice la casilla y lo que dice la fila. La comparacion la hace
     el lector: aca no se decide nada.
     ⚠️ LA FILA DE LA IT TRAE SU LEYENDA DE GRADO pegada con un punto medio entre espacios, y
     la de la IAo no trae ninguna, asi que el valor esperado de la casilla se deriva del PREFIJO
     de la fila hasta su separador. El lector compara contra ESO y no contra una cuenta propia. */
  autos() {
    var pares = [['vauto-ia-eroa','ia-eroa','  '], ['vauto-ia-volr','ia-volr','  '],
                 ['vauto-ia-fr','ia-freg','  '],
                 ['vauto-it-eroa','it-eroa',' \\u00b7 '], ['vauto-it-volr','it-volr',' \\u00b7 ']];
    var o = {};
    pares.forEach(function(p){
      var fila = window.__P.txt(p[1]);
      var corte = fila == null ? null : (fila.indexOf(p[2]) > -1 ? fila.slice(0, fila.indexOf(p[2])).trim() : fila);
      if (corte === '\\u2014') corte = '';
      o[p[0]] = { campo: window.__P.val(p[0]), ph: window.__P.ph(p[0]),
                  fila: fila, esperado: corte, existe: window.__P.existe(p[0]),
                  coincide: window.__P.val(p[0]) === corte };
    });
    return o },

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
             registro: (typeof VINFO === 'object' && VINFO) ? Object.keys(VINFO) : null,
             tarjeta: window.__P.existe('vinfo-card') } },

  tarjeta() {
    var c = document.getElementById('vinfo-card');
    if (!c) return { existe: false };
    var st = getComputedStyle(c);
    var r = c.getBoundingClientRect();
    var tx = window.__P.norm(c.textContent);
    return { existe: true, abierta: st.display !== 'none',
             texto: tx, largo: tx.length,
             bloques: c.querySelectorAll('[data-vinfo-b]').length,
             rots: Array.from(c.querySelectorAll('[data-vinfo-b]')).map(function(b){ return b.getAttribute('data-vinfo-b') }),
             /* Acentos: la tanda D1 escribio cinco tarjetas SIN acentos y lo vio la captura, no la
                lectura. Aca se cuenta el glifo, que es lo que una lectura si puede afirmar. */
             acentos: (tx.match(/[\\u00e1\\u00e9\\u00ed\\u00f3\\u00fa\\u00f1\\u00c1\\u00c9\\u00cd\\u00d3\\u00da\\u00d1]/g) || []).length,
             x: Math.round(r.left), y: Math.round(r.top),
             w: Math.round(r.width), h: Math.round(r.height),
             vw: window.innerWidth, vh: window.innerHeight,
             dentro: (r.left >= -1 && r.right <= window.innerWidth + 1 && r.top >= -1 && r.bottom <= window.innerHeight + 1),
             alManual: /abrirAyudaEco|manual/i.test(c.innerHTML),
             zIndex: st.zIndex } },

  globoSel(clave) {
    var e = document.querySelector('[data-vinfo="' + clave + '"]');
    if (!e) return { err: 'NO EXISTE globo ' + clave };
    if (!e.id) e.id = '__gl_' + clave.replace(/[^a-z0-9]/gi, '');
    var r = e.getBoundingClientRect();
    return { sel: e.id, title: e.getAttribute('title'), tag: e.tagName.toLowerCase(),
             onmouseover: e.getAttribute('onmouseover'), onmouseenter: e.getAttribute('onmouseenter'),
             /* ⚠️ DENOMINADOR: un globo dentro de un bloque oculto existe y mide 0 x 0. Sin esto,
                «no abre» se lee igual que «el mecanismo no funciona». */
             geo: Math.round(r.width) + 'x' + Math.round(r.height),
             vis: window.__P.vis(e.id) } },

  /* ══ LA MAQUETA ══ posicion y tamano de cada campo, para ver desbordes y solapamientos. */
  maqueta(idBloque, selRejilla) {
    var b = document.getElementById(idBloque); if (!b) return { err: 'NO EXISTE ' + idBloque };
    var g = b.querySelector(selRejilla || '.valv-cols-3'); if (!g) return { err: 'sin rejilla' };
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
    var choques = [];
    for (var i = 0; i < filas.length; i++) for (var j = i + 1; j < filas.length; j++) {
      var a = filas[i], c = filas[j];
      if (a.x < c.x + c.w - 1 && c.x < a.x + a.w - 1 &&
          a.y < c.y + c.h - 1 && c.y < a.y + a.h - 1) choques.push(a.id + '/' + c.id);
    }
    var desborda = filas.filter(function(f){ return f.x + f.w > rg.right + 1 || f.x < rg.left - 1 })
                        .map(function(f){ return f.id });
    var xs = filas.map(function(f){ return f.x }).filter(function(v,i,a){ return a.indexOf(v)===i });
    return { n: filas.length, colsVisuales: xs.length, choques: choques, desborda: desborda,
             scrollH: document.documentElement.scrollWidth > window.innerWidth + 1,
             rejilla: Math.round(rg.width), filas: filas } },

  /* ⚠️ EL TEMA CLARO ES LA CLASE light-mode SOBRE EL ELEMENTO RAIZ, no un data-theme: la tanda
     del cartel de peptidos saco dos capturas identicas byte por byte porque escribia el atributo
     equivocado. Devuelve lo que QUEDO, y el lector aborta si no coincide. */
  tema(claro) {
    var r = document.documentElement;
    if (claro) r.classList.add('light-mode'); else r.classList.remove('light-mode');
    return r.classList.contains('light-mode') },

  /* Color REAL resuelto, para que una variable que no existe en esta zona se vea. Se fuerza el
     display del aviso: un nodo en display:none igual devuelve color computado, pero sin forzarlo
     no se puede afirmar que lo que se midio es lo que el medico ve. */
  colorAviso(id) {
    var e = document.getElementById(id); if (!e) return 'NO EXISTE';
    var prev = e.style.display;
    if (getComputedStyle(e).display === 'none') e.style.display = 'block';
    if (!window.__P.norm(e.textContent)) e.textContent = 'x';
    var c = getComputedStyle(e).color;
    e.style.display = prev;
    return c },

  /* La variable en bruto, resuelta en el contexto del propio nodo: una que no existe en esa zona
     devuelve cadena vacia, que es por lo que el color caia al heredado. */
  varDe(id, nombre) {
    var e = document.getElementById(id); if (!e) return 'NO EXISTE';
    return getComputedStyle(e).getPropertyValue(nombre).trim() },

  informe(estilo) {
    try { if (typeof setEstiloInforme === 'function') setEstiloInforme(estilo) } catch(e) {}
    try { generarInforme() } catch(e) { return { err: String(e && e.message) } }
    return { inf: window.__P.val('informe_texto'), suma: window.__P.val('en_suma') } },

  grados() {
    return { im: window.__P.val('im_grado'), ia: window.__P.val('ia_grado'),
             it: window.__P.val('it_grado'), em: window.__P.val('em_grado'),
             ea: window.__P.val('ea_grado'), et: window.__P.val('et_grado'),
             ep: window.__P.val('ep_grado'), ip: window.__P.val('ip_grado'),
             iaSev: window.__P.txt('ia-sev'), itSev: window.__P.txt('it-sev'),
             imSev: window.__P.txt('im-sev'), eaSev: window.__P.txt('ea-det-sev'),
             etSev: window.__P.txt('et-sev'), emSev: window.__P.txt('em-sev-integrada'),
             iaDisc: window.__P.txt('ia-discordancia'), itDisc: window.__P.txt('it-discordancia'),
             diast: window.__P.txt('dd-interp'),
             hfapeff: window.__P.txt('hfapeff-eco-val') } },

  /* Las filas del cuadro de referencias de las dos lesiones: lo que esta tanda NO mueve. */
  refs() {
    return { ia: { jet: window.__P.txt('ia-jet-ratio'), eroa: window.__P.txt('ia-eroa'),
                   volr: window.__P.txt('ia-volr'), freg: window.__P.txt('ia-freg'),
                   pht: window.__P.txt('ia-pht-interp'), vtd: window.__P.txt('ia-vtd-interp'),
                   vtiDesc: window.__P.txt('ia-vti-desc-interp') },
             it: { vc: window.__P.txt('it-ref-vc'), eroa: window.__P.txt('it-eroa'),
                   volr: window.__P.txt('it-volr'), dens: window.__P.txt('it-densidad-interp'),
                   fuente: window.__P.txt('it-ref-fuente') },
             et: { gmedio: window.__P.txt('et-ref-gmedio'), vti: window.__P.txt('et-ref-vti'),
                   thp: window.__P.txt('et-ref-thp'), avt: window.__P.txt('et-ref-avt') },
             ea: { ava: window.__P.val('ea_ava_display'), dvi: window.__P.val('ea_dvi_display') } } },

  pastillas() {
    var o = {};
    Array.from(document.querySelectorAll('[id^="pill-"]')).forEach(function(p){
      o[p.id] = window.__P.norm(p.textContent) });
    return o },

  /* La fila del Excel se arma con el DUENO (_labExcelRow) y un registro sintetico, igual que las
     sondas de las tandas anteriores: contar columnas de otra forma seria una segunda copia del
     exportador. Los campos se recogen con la MISMA exclusion por prefijo que guardarInforme. */
  excel() {
    if (typeof _labExcelRow !== 'function') return { err: 'SIN _labExcelRow' };
    var campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return } catch(e){}
      campos[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      campos[el.id + '__chk'] = el.checked ? '1' : '0' });
    try {
      var fila = _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-14', campos: campos });
      var ks = Object.keys(fila);
      return { n: ks.length, hash: window.__P.hash(JSON.stringify(fila)),
               pht: ks.filter(function(k){ return k.indexOf('PHT') > -1 || k.indexOf('THP') > -1 }) };
    } catch(e) { return { err: 'EXC: ' + e.message } } },

  /* ══ LO QUE DE VERDAD VIAJA CON EL ESTUDIO ══
     ⚠️ LAS CLAVES SE ORDENAN ANTES DE HASHEAR: el objeto se arma en ORDEN DEL DOM, asi que MOVER
     un campo de columna cambia el string de JSON sin cambiar un solo valor. */
  camposDelEstudio() {
    var o = {};
    Array.from(document.querySelectorAll('input[id], select[id], textarea[id]')).forEach(function(e){
      if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
      if (e.id === 'informe_texto' || e.id === 'en_suma') return;
      o[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '0') : e.value });
    var ks = Object.keys(o).sort();
    var plano = ks.map(function(k){ return k + '=' + o[k] }).join('|');
    return { n: ks.length, hash: window.__P.hash(plano),
             vauto: ks.filter(function(k){ return k.indexOf('vauto-') === 0 }),
             claves: window.__P.hash(ks.join(',')) } },

  /* ══ EL CENSO DEL ROTULO EN LAS SUPERFICIES QUE SE LEEN ══
     Se mide el TEXTO VISIBLE de la pestana, no el fuente: un rotulo que quedo en el marcado pero
     dentro de un bloque oculto no es una superficie que alguien lea. */
  rotuloEn(idRaiz) {
    var e = document.getElementById(idRaiz); if (!e) return 'NO EXISTE';
    var t = e.innerText || e.textContent || '';
    return { pht: (t.match(/PHT/g) || []).length, thp: (t.match(/THP/g) || []).length } },

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

  /* BORRADO con teclas REALES, que es el gesto del medico. Aborta si el campo no quedo vacio:
     un Backspace que el documento se come deja la escena midiendo «la casilla no se vacia» sobre
     un borrado que nunca ocurrio. NUNCA sobre un campo de solo lectura. */
  async function borrar(id) {
    const ro = await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      return e ? (e.hasAttribute('readonly') ? 1 : 0) : -1 })()`);
    if (ro === -1) throw new Error('borrar() ABORTA: #' + id + ' no existe');
    if (ro === 1) throw new Error('borrar() ABORTA: #' + id + ' es de SOLO LECTURA');
    const via = await clicEn(id);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(!e) return 0; e.focus(); try{ e.select() }catch(x){} return 1 })()`);
    for (let i = 0; i < 12; i++) await tecla('Backspace', null);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('input',{bubbles:true}));
             e.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
    await pausa(80);
    const quedo = await ev(`window.__P.val(${JSON.stringify(id)})`);
    if (String(quedo || '') !== '') {
      throw new Error('borrar() ABORTA: #' + id + ' quedo «' + quedo + '» (via ' + via.via + ')');
    }
    return { via: via.via, quedo: String(quedo || '') };
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

  /* ══ LAS DOS ESCENAS BASE ══
     IAo: los tres insumos del PISA, el VTI del chorro y los dos del TSVI, para que las tres
     casillas tengan numero; mas la VC, el jet y el PHT, para que el cuadro tenga sus otras filas.
     IT: los tres del PISA, el VTI de la IT y la densidad.
     Los dos del TSVI van por `ea_dtsvi` / `ea_vtitsvi`, que son las PUERTAS VISIBLES de
     `diam_tsvi` / `itv_tsvi` en esta pestana: los del cajon Doppler no tienen geometria aca. */
  const BASE = { ia_vc: '7', ia_jet_diam: '15', ia_pht: '180',
                 ia_pisa_r: '8', ia_pisa_val: '40', ia_vmax_cw: '4.5', ia_vti: '120',
                 ia_vmax_td: '25', ia_vti_desc: '30',
                 ea_dtsvi: '22', ea_vtitsvi: '25',
                 it_vc: '8', it_pisa_r: '9', it_pisa_val: '38', it_vmax_cw: '3', it_vti: '90' };
  async function escena(extra, quitar) {
    await despejar();
    await ev(`window.__P.limpiar()`);
    await pausa(130);
    await ev(`window.__P.abrirTodo()`);
    const campos = Object.assign({}, BASE, extra || {});
    (quitar || []).forEach((k) => { delete campos[k]; });
    const tecleos = {};
    for (const id of Object.keys(campos)) tecleos[id] = await tipear(id, campos[id]);
    /* La densidad del jet es un `select` y no se tipea: va por su propio camino. */
    await ev(`(function(){ var e=document.getElementById('it_densidad');
      if(e){ e.value='denso'; e.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
    await pausa(180);
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

  if (hacer('campos')) {
    await escena();
    out.campos = {
      ia: await ev(`window.__P.mapaCampos('bloque-insuf-aortica')`),
      iaDom: await ev(`window.__P.ordenDom('bloque-insuf-aortica')`),
      it: await ev(`window.__P.mapaCampos('campos-insuf-tricuspide')`),
      itDom: await ev(`window.__P.ordenDom('campos-insuf-tricuspide')`)
    };
    /* ══ EL TAB, CON TECLAS REALES ══ se enfoca el primer campo y se tabula por la lesion. */
    await clicEn('ia_vc');
    const fIA = [await ev(`window.__P.foco()`)];
    for (let i = 0; i < 11; i++) { await tecla('Tab', null); await pausa(45);
      fIA.push(await ev(`window.__P.foco()`)); }
    out.campos.tabIA = fIA;
    await clicEn('it_vc');
    const fIT = [await ev(`window.__P.foco()`)];
    for (let i = 0; i < 7; i++) { await tecla('Tab', null); await pausa(45);
      fIT.push(await ev(`window.__P.foco()`)); }
    out.campos.tabIT = fIT;
  }

  if (hacer('autos')) {
    out.autos = {};
    await escena();
    out.autos.cargado = await ev(`window.__P.autos()`);
    out.autos.cargadoRefs = await ev(`window.__P.refs()`);
    await escena({}, ['ia_pisa_r']);
    out.autos.iaSinRadio = await ev(`window.__P.autos()`);
    await escena({}, ['ia_vti']);
    out.autos.iaSinVti = await ev(`window.__P.autos()`);
    await escena({}, ['ea_dtsvi', 'ea_vtitsvi']);
    out.autos.iaSinTsvi = await ev(`window.__P.autos()`);
    await escena({}, ['it_pisa_val']);
    out.autos.itSinVal = await ev(`window.__P.autos()`);
    await escena({}, ['it_vti']);
    out.autos.itSinVti = await ev(`window.__P.autos()`);
    /* CONTROL NEGATIVO del vaciado: con el formulario limpio las cinco casillas quedan vacias y
       su placeholder nombra lo que falta. */
    await despejar(); await ev(`window.__P.limpiar()`); await pausa(160);
    await ev(`window.__P.abrirTodo()`);
    out.autos.vacio = await ev(`window.__P.autos()`);
    /* Y el BORRADO con teclas reales de un insumo ya cargado, que es el gesto del medico. */
    await escena();
    out.autos.antesBorrar = await ev(`window.__P.autos()`);
    await borrar('ia_pisa_r');
    await borrar('it_pisa_r');
    await pausa(160);
    out.autos.trasBorrar = await ev(`window.__P.autos()`);
  }

  if (hacer('globos')) {
    await escena();
    out.globos = { censo: await ev(`window.__P.globos()`), tarjetas: {} };
    /* ⚠️ UN GLOBO SIN GEOMETRIA NO ANCLA NADA, Y ESO ES LO CORRECTO. Los tres de la protesis
       miden 0x0 mientras la morfologia mitral no sea protesica, asi que se miden en una ESCENA
       PROTESICA aparte: sin ella, «no abre» se lee como «el mecanismo no funciona». Es la misma
       leccion que el D1 dejo escrita. */
    const CLAVES = ['ia-eroa-pisa', 'it-eroa-pisa', 'ea-ava-cont', 'et-avt-cont',
                    'im-onda-e', 'im-vti-ratio', 'im-vc', 'im-jet-ai'];
    const PROT = ['prot-eoa', 'prot-dvi', 'prot-ppm'];
    async function medirGlobo(k) {
      const sel = await ev(`window.__P.globoSel(${JSON.stringify(k)})`);
      const r = { sel };
      if (sel && !sel.err && sel.geo !== '0x0') {
        await clicEn(sel.sel); await pausa(120);
        r.abierta = await ev(`window.__P.tarjeta()`);
        await clicEn(sel.sel); await pausa(120);
        r.trasSegundoToque = await ev(`window.__P.tarjeta()`);
        /* Esc: se abre de nuevo y se cierra con la tecla. */
        await clicEn(sel.sel); await pausa(120);
        await tecla('Escape', null); await pausa(120);
        r.trasEsc = await ev(`window.__P.tarjeta()`);
        /* Clic AFUERA: se abre y se clickea el titulo de la pestana. */
        await clicEn(sel.sel); await pausa(120);
        await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: 5, y: 5, button: 'left', clickCount: 1 }, sessionId);
        await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: 5, y: 5, button: 'left', clickCount: 1 }, sessionId);
        await pausa(140);
        r.trasFuera = await ev(`window.__P.tarjeta()`);
      }
      return r;
    }
    for (const k of CLAVES) out.globos.tarjetas[k] = await medirGlobo(k);
    /* ESCENA PROTESICA: la morfologia mitral decide si el bloque de protesis existe en pantalla. */
    await ev(`(function(){ var e=document.getElementById('vm_morf');
      if(e){ e.value='Pr\u00f3tesis mec\u00e1nica'; e.dispatchEvent(new Event('change',{bubbles:true})) }
      return e ? e.value : null })()`);
    await pausa(260);
    await ev(`window.__P.abrirTodo()`);
    out.globos.morfProtesica = await ev(`window.__P.val('vm_morf')`);
    for (const k of PROT) out.globos.tarjetas[k] = await medirGlobo(k);
  }

  if (hacer('thp')) {
    await escena();
    const t = await textos();
    out.thp = {
      valvulas: await ev(`window.__P.rotuloEn('tab-valvulas')`),
      doppler: await ev(`window.__P.rotuloEn('tab-doppler')`),
      ete: await ev(`window.__P.rotuloEn('tab-ete')`),
      excel: await ev(`window.__P.excel()`),
      informe: { pht: (t.narrativo.inf.match(/PHT/g) || []).length,
                 thp: (t.narrativo.inf.match(/THP/g) || []).length },
      /* El mapa del importador y el vocabulario del ecografo se leen del propio objeto: si un
         encabezado cambia, el importador deja de encontrar su columna y esto lo dice. */
      mapa: await ev(`(function(){
        if (typeof LAB_XLS_MAP === 'undefined') return 'SIN MAPA';
        var f = LAB_XLS_MAP.filter(function(r){ return /PHT|THP/.test(r[0]) });
        return f.map(function(r){ return r[0] + ' -> ' + r[1] }) })()`)
    };
  }

  /* ══ EL INFORME FIRMADO DEL TAVI ══ es la UNICA superficie del informe narrativo que imprime
     este rotulo, y la escena base no la alcanza: su bloque entero cuelga de que conste la
     protesis implantada (`hayProtesis`). Sin esta escena, «0 PHT en el informe» se lee como «el
     rotulo no estaba ahi» cuando lo que pasa es que el bloque no se emitio. */
  if (hacer('tavi')) {
    await despejar();
    await ev(`window.__P.limpiar()`);
    await pausa(140);
    /* TRES puertas, y las tres con el gesto de la app: la pestana ETE, la seccion plegable del
       TAVI y su solapa «post». `tipear` aborta si el valor no queda, asi que si alguna no se
       abriera la escena lo diria en vez de informar «no cambia» sobre un tecleo que no ocurrio. */
    out.taviPuertas = await ev(`(function(){
      try { showTab('ete') } catch(e) {}
      var sec = document.getElementById('ete-seccion-tavi');
      if (sec && getComputedStyle(sec).display === 'none') {
        try { toggleEteSeccion('tavi', document.querySelector('[onclick*="tavi"]')); eteTaviSync() } catch(e) {}
      }
      try { eteTaviTab('post') } catch(e) {}
      return { sec: sec ? getComputedStyle(sec).display : 'NO EXISTE',
               pane: (document.getElementById('ete-tavi-pane-post')||{}).style
                     ? getComputedStyle(document.getElementById('ete-tavi-pane-post')).display : 'NO EXISTE' } })()`);
    await pausa(200);
    /* Y una CUARTA: el bloque entero cuelga de su propia casilla «incluir en el informe».
       ⚠️ ENTER NO ACTIVA UN CHECKBOX; LA TECLA ES ESPACIO, y el respaldo por tecla de `clicEn`
       manda Enter: la primera version de esta escena informo «el informe no cambia» con la
       casilla en false, o sea sobre un gesto que nunca ocurrio. Es la trampa que CLAUDE.md ya
       documenta. Se intenta el raton y, si no prospera, Espacio sobre el nodo enfocado; y se
       ABORTA si no quedo tildada. */
    /* ⚠️ Y EL CHECKBOX NO ES EL CONTROL: esta en display:none con tabindex -1, y el control real
       es el boton «Integrar al informe» que lo gobierna por `eteInclToggle`. Clickear el input
       oculto no es un gesto posible, y por eso la primera version de esta escena informo
       «el informe no cambia» con la casilla en false. Se clickea el BOTON. */
    const _btnIncl = await ev(`(function(){
      var b = document.querySelector('[data-ete-chk="ete_tavi_incluir_chk"]');
      if (!b) return null; if (!b.id) b.id = '__incl_tavi'; return b.id })()`);
    if (!_btnIncl) throw new Error('no esta el boton «Integrar al informe» del TAVI');
    await clicEn(_btnIncl);
    await pausa(150);
    let _chk = await ev(`(function(){ var c=document.getElementById('ete_tavi_incluir_chk');
      return c ? c.checked : 'NO EXISTE' })()`);
    if (_chk !== true) throw new Error('la casilla ete_tavi_incluir_chk NO quedo tildada: ' + _chk);
    out.taviChk = _chk;
    await pausa(160);
    await tipear('ete_tavi_pro_tam', '26');
    await tipear('ete_tavi_pht', '180');
    await pausa(160);
    out.tavi = { tam: await ev(`window.__P.val('ete_tavi_pro_tam')`),
                 pht: await ev(`window.__P.val('ete_tavi_pht')`),
                 textos: await textos() };
  }

  if (hacer('color')) {
    out.color = {};
    const AVISOS = ['im-pdf-metodo-aviso', 'diast-algo-aviso', 'diast-fc-aviso',
                    'diast-bse-eprima-aviso', 'diast-bse-gris-aviso',
                    'diast-excl-aviso', 'vd-tei-aviso'];
    for (const claro of [false, true]) {
      const puesto = await ev(`window.__P.tema(${claro})`);
      if (puesto !== claro) throw new Error('el tema NO quedo puesto: pedido claro=' + claro + ' quedo=' + puesto);
      await pausa(120);
      const o = { temaPuesto: puesto };
      for (const id of AVISOS) {
        o[id] = { color: await ev(`window.__P.colorAviso(${JSON.stringify(id)})`),
                  amber: await ev(`window.__P.varDe(${JSON.stringify(id)}, '--amber')`),
                  orange: await ev(`window.__P.varDe(${JSON.stringify(id)}, '--orange')`) };
      }
      out.color[claro ? 'claro' : 'oscuro'] = o;
    }
    await ev(`window.__P.tema(false)`);
  }

  if (hacer('superficies')) {
    await escena();
    const t = await textos();
    out.superficies = { textos: t, excel: await ev(`window.__P.excel()`),
                        campos: await ev(`window.__P.camposDelEstudio()`),
                        lab: await ev(`window.__P.lab(${JSON.stringify(t.narrativo.inf)}, ${JSON.stringify(t.narrativo.suma)})`) };
  }

  if (hacer('controles')) {
    await escena();
    out.controles = { grados: await ev(`window.__P.grados()`),
                      pastillas: await ev(`window.__P.pastillas()`),
                      refs: await ev(`window.__P.refs()`) };
    await despejar(); await ev(`window.__P.limpiar()`); await pausa(160);
    await ev(`window.__P.abrirTodo()`);
    out.controles.vacio = { grados: await ev(`window.__P.grados()`),
                            excel: await ev(`window.__P.excel()`),
                            campos: await ev(`window.__P.camposDelEstudio()`) };
  }

  if (hacer('ancho')) {
    out.ancho = {};
    for (const w of [1200, 390, 360]) {
      await cdp.send('Emulation.setDeviceMetricsOverride',
        { width: w, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
      await pausa(260);
      for (const claro of [false, true]) {
        const puesto = await ev(`window.__P.tema(${claro})`);
        if (puesto !== claro) throw new Error('el tema NO quedo puesto a ' + w + 'px');
        await despejar();
        await ev(`window.__P.abrirTodo()`);
        await pausa(180);
        const celda = {
          ia: await ev(`window.__P.maqueta('bloque-insuf-aortica')`),
          it: await ev(`window.__P.maqueta('campos-insuf-tricuspide', '.valv-cols-3')`),
          tarjetas: {}
        };
        /* ⚠️ LA TARJETA SE MIDE A CADA ANCHO, no solo a 1200: la del D1 mas larga TAPABA su propio
           globo porque se colocaba arriba de todo cuando no entraba, y el SEGUNDO toque no llegaba
           al boton. Se mide que entra entera en el viewport y que el globo sigue siendo el nodo
           del punto despues de abrirla. */
        for (const k of ['ia-eroa-pisa', 'it-eroa-pisa', 'ea-ava-cont', 'et-avt-cont', 'im-jet-ai']) {
          const sel = await ev(`window.__P.globoSel(${JSON.stringify(k)})`);
          if (!sel || sel.err || sel.geo === '0x0') { celda.tarjetas[k] = { sel }; continue; }
          await clicEn(sel.sel); await pausa(140);
          const t = await ev(`window.__P.tarjeta()`);
          const tapa = await ev(`window.__P.quienEsta(${JSON.stringify(sel.sel)},
            ${JSON.stringify(0)}, ${JSON.stringify(0)})`);
          const c = await ev(`window.__P.centro(${JSON.stringify(sel.sel)})`);
          const quien = (c && !c.err) ? await ev(`window.__P.quienEsta(${JSON.stringify(sel.sel)}, ${c.x}, ${c.y})`) : null;
          celda.tarjetas[k] = { geo: sel.geo, abierta: t.abierta, dentro: t.dentro,
                                w: t.w, h: t.h, vw: t.vw, vh: t.vh,
                                globoAlcanzable: quien ? quien.esElBlanco : null,
                                loTapa: quien ? quien.enPunto : null };
          await tecla('Escape', null); await pausa(100);
        }
        out.ancho[w + (claro ? '_claro' : '_oscuro')] = celda;
      }
      await ev(`window.__P.tema(false)`);
    }
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
  }

  /* ⚠️ LA CAPTURA NO ES DECORATIVA: el D1 escribio cinco tarjetas SIN ACENTOS y lo vio el PNG, no
     la lectura. El `clip` de Page.captureScreenshot va en coordenadas de PAGINA y
     getBoundingClientRect da las del VIEWPORT, asi que se suma el scroll; y el aviso legal
     oscurece el PNG entero, por eso se despeja JUSTO antes. */
  if (hacer('captura')) {
    const dest = arg('--dest') || '/tmp';
    out.captura = {};
    for (const claro of [false, true]) {
      const puesto = await ev(`window.__P.tema(${claro})`);
      if (puesto !== claro) throw new Error('el tema NO quedo puesto para la captura');
      for (const k of ['ia-eroa-pisa', 'it-eroa-pisa', 'ea-ava-cont', 'et-avt-cont', 'im-jet-ai', 'im-vc']) {
        await despejar();
        const sel = await ev(`window.__P.globoSel(${JSON.stringify(k)})`);
        if (!sel || sel.err || sel.geo === '0x0') { out.captura[k] = 'sin geometria'; continue; }
        await clicEn(sel.sel); await pausa(160);
        await despejar();
        const g = await ev(`(function(){ var c=document.getElementById('vinfo-card');
          if(!c) return null; var r=c.getBoundingClientRect();
          return { x: Math.round(r.left + scrollX), y: Math.round(r.top + scrollY),
                   w: Math.round(r.width), h: Math.round(r.height) } })()`);
        if (!g) { out.captura[k] = 'sin tarjeta'; continue; }
        const shot = await cdp.send('Page.captureScreenshot',
          { format: 'png', clip: { x: g.x, y: g.y, width: g.w, height: g.h, scale: 2 } }, sessionId);
        const f = join(dest, 'vinfo_' + k + (claro ? '_claro' : '_oscuro') + '.png');
        await writeFile(f, Buffer.from(shot.data, 'base64'));
        out.captura[k + (claro ? '_claro' : '_oscuro')] = { archivo: f, bytes: shot.data.length };
        await tecla('Escape', null); await pausa(110);
      }
    }
    await ev(`window.__P.tema(false)`);
  }

  out.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  if (out.md5Fin !== md5Ini) out.AVISO = 'EL ARCHIVO CAMBIO DURANTE LA CORRIDA';
  console.log(JSON.stringify(out, null, 1));
  try { cdp.close() } catch (e) {}
  try { srv.close() } catch (e) {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e && e.message); process.exit(1); });
