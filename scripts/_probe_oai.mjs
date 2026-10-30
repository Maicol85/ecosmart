#!/usr/bin/env node
/**
 * _probe_oai.mjs — sonda de la PANTALLA «IMAGENES GUARDADAS» (tanda IMAGENES, 2026-10-29).
 *
 * Mide lo que la pantalla nueva afirma, sobre un conjunto SEMBRADO en el entorno de prueba:
 * los dos botones y cual esta activo por omision, los meses plegados y su numeracion, el enlace
 * al estudio, que los filtros se aplican por el ESTUDIO —incluidos los numericos—, el
 * rendimiento con los meses cerrados y al abrir uno, la estrella de imagen y su nota, el armado
 * del PPT con su limite y su aviso, y la funcion comun del esquema.
 *
 * Contra HEAD devuelve «NO EXISTE» en todo lo nuevo, que es lo que hace que el A/B muestre que
 * aparecio, en vez de un false silencioso.
 *
 *   node scripts/_probe_oai.mjs --file /tmp/index.HEAD.html > /tmp/i2.HEAD.json
 *   node scripts/_probe_oai.mjs                             > /tmp/i2.NEW.json
 *
 * ENTORNO DE PRUEBA: perfil de Chrome temporal propio, IndexedDB vacia al arrancar.
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-oai-'));
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

const md5 = async (p) => createHash('md5').update(await readFile(p)).digest('hex');

function conReloj(p, nombre, ms) {
  return Promise.race([p,
    new Promise((_, no) => setTimeout(() => no(new Error('TIMEOUT ' + (ms/1000) + 's en ' + nombre)), ms))]);
}

/* ══ Sonda inyectada ══════════════════════════════════════════════════════════════════════════
   ⚠️ CUERPO DE TEMPLATE LITERAL: ni un acento grave adentro, tampoco en los comentarios, y
   ninguna barra invertida simple — una barra sola no sobrevive al template y la regex mide otra
   cosa en silencio (leccion de la tanda IMAGENES). */
const SONDA = `
window.__OAI = {
  listo() {
    var faltan = ['calcOAI','oaiEsqSVG','oaiEsqSync','showTab','toggleEteSeccion']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (faltan.length) return { listo:false, faltan:faltan };
    if (!document.getElementById('oai_morfologia')) return { listo:false, por:'sin oai_morfologia' };
    return { listo:true } },

  /* ── Abre la pestana ETE y la seccion de la orejuela ────────────────────────────────────────
     ⚠️ SIN ABRIR EL ACORDEON la geometria da 0x0 sobre un dibujo que si se pinta: es la trampa
     que este repo ya documenta para showTab y las tarjetas. */
  abrir() {
    try { showTab('ete') } catch(e) {
      try { document.querySelectorAll('.tab-section').forEach(function(x){ x.classList.remove('active') });
            var t = document.getElementById('tab-ete'); if (t) t.classList.add('active') } catch(e2){} }
    try { toggleEteSeccion('oai') } catch(e) {}
    var sec = document.getElementById('ete-seccion-oai');
    if (sec && getComputedStyle(sec).display === 'none') sec.style.display = 'block';
    return { seccion: !!sec && getComputedStyle(sec).display !== 'none',
             anchoVentana: window.innerWidth } },

  poner(campos) {
    var out = {};
    Object.keys(campos).forEach(function(k){
      var e = document.getElementById(k);
      if (!e) { out[k] = 'NO EXISTE'; return }
      e.value = String(campos[k]);
      e.dispatchEvent(new Event('input', { bubbles:true }));
      e.dispatchEvent(new Event('change', { bubbles:true }));
      out[k] = e.value });
    return out },

  /* ── 1b · EL LUGAR. Donde esta el dibujo respecto de los campos ─────────────────────────────
     El DENOMINADOR va primero: si la grilla de campos o la caja del dibujo no tienen caja, los
     dos rect dan cero y "apilado" no se distingue de "no se dibuja nada". */
  lugar() {
    var sec = document.getElementById('ete-seccion-oai');
    var caja = document.getElementById('oai-esq-caja');
    var cont = document.getElementById('oai-esq');
    if (!sec) return { err:'sin seccion' };
    var grilla = sec.querySelector('.grid-3');
    var fila = document.getElementById('oai-fila');
    var R = function(e){ if (!e) return null; var r = e.getBoundingClientRect();
      return { x:Math.round(r.left), y:Math.round(r.top), w:Math.round(r.width), h:Math.round(r.height),
               der:Math.round(r.right), aba:Math.round(r.bottom) } };
    var rg = R(grilla), rc = R(caja), ri = R(cont);
    var out = { ancho: window.innerWidth,
                filaNueva: fila ? 'SI' : 'NO EXISTE',
                grilla: rg, cajaDibujo: rc, dibujo: ri,
                denominador: { grillaConCaja: !!(rg && rg.w > 0 && rg.h > 0),
                               cajaConCaja: !!(rc && rc.w > 0 && rc.h > 0),
                               dibujoConCaja: !!(ri && ri.w > 0 && ri.h > 0) } };
    if (rg && rc && rg.w > 0 && rc.w > 0) {
      /* Lado a lado = sus franjas verticales se solapan Y la caja del dibujo arranca a la
         DERECHA del borde derecho de la grilla. Apilado = la caja empieza por debajo. */
      var solapanY = rc.y < rg.aba && rg.y < rc.aba;
      out.disposicion = (solapanY && rc.x >= rg.der - 4) ? 'LADO A LADO (dibujo a la derecha)'
                      : (solapanY && rc.der <= rg.x + 4) ? 'LADO A LADO (dibujo a la izquierda)'
                      : (rc.y >= rg.aba - 4) ? 'APILADO (dibujo debajo)'
                      : (rc.aba <= rg.y + 4) ? 'APILADO (dibujo arriba)' : 'MEZCLADO';
      out.dibujoAncho = ri ? ri.w : null;
    }
    return out },

  /* ── 1c · LOS ROTULOS. Cuantos pares se pisan, y cuantos rotulos cruza una linea ────────────
     Se mide con getBBox en unidades del SVG, que es el sistema en el que el dibujo se arma: un
     getBoundingClientRect mezcla la escala de la caja y hace incomparables dos anchos.
     TEXTO vs TEXTO: solape de las dos cajas. TEXTO vs LINEA: interseccion del segmento con la
     caja, que es lo que el medico vio con "Cx" y la linea punteada. */
  _cajas(svg) {
    var ts = [], i, e, b, n = svg.querySelectorAll('text');
    for (i = 0; i < n.length; i++) {
      e = n[i];
      try { b = e.getBBox() } catch (x) { continue }
      if (!b || !b.width) continue;
      ts.push({ t: (e.textContent||'').trim(),
                x1: b.x, y1: b.y, x2: b.x + b.width, y2: b.y + b.height }) }
    return ts },
  _lineas(svg) {
    var ls = [], i, e, n = svg.querySelectorAll('line');
    for (i = 0; i < n.length; i++) {
      e = n[i];
      ls.push({ id: e.getAttribute('id') || ('linea' + i),
                ax: parseFloat(e.getAttribute('x1')), ay: parseFloat(e.getAttribute('y1')),
                bx: parseFloat(e.getAttribute('x2')), by: parseFloat(e.getAttribute('y2')) }) }
    return ls },
  _cruza(L, C) {
    /* Un segmento cruza una caja si alguno de sus extremos cae dentro, o si corta un lado.
       Clipping de Liang-Barsky, que es exacto y no muestrea. */
    var t0 = 0, t1 = 1, dx = L.bx - L.ax, dy = L.by - L.ay, p, q, i, r;
    var ps = [-dx, dx, -dy, dy];
    var qs = [L.ax - C.x1, C.x2 - L.ax, L.ay - C.y1, C.y2 - L.ay];
    for (i = 0; i < 4; i++) {
      p = ps[i]; q = qs[i];
      if (p === 0) { if (q < 0) return false }
      else { r = q / p;
        if (p < 0) { if (r > t1) return false; if (r > t0) t0 = r }
        else { if (r < t0) return false; if (r < t1) t1 = r } } }
    return t0 <= t1 },

  /* Una pasada: pone los cuatro datos, repinta y cuenta. */
  _unaPasada(morf, o, d, v) {
    window.__OAI.poner({ oai_morfologia: morf, oai_ostium_diam: o,
                         oai_profundidad: d, oai_vel_vac: v });
    if (typeof oaiEsqSync === 'function') oaiEsqSync();
    var cont = document.getElementById('oai-esq');
    var svg = cont ? cont.querySelector('svg') : null;
    if (!svg) return { err:'sin svg' };
    var ts = window.__OAI._cajas(svg), ls = window.__OAI._lineas(svg);
    var pares = [], cruces = [], i, j;
    for (i = 0; i < ts.length; i++) for (j = i + 1; j < ts.length; j++) {
      if (ts[i].x1 < ts[j].x2 && ts[j].x1 < ts[i].x2 &&
          ts[i].y1 < ts[j].y2 && ts[j].y1 < ts[i].y2) pares.push(ts[i].t + ' / ' + ts[j].t) }
    for (i = 0; i < ls.length; i++) for (j = 0; j < ts.length; j++) {
      if (window.__OAI._cruza(ls[i], ts[j])) cruces.push(ls[i].id + ' / ' + ts[j].t) }
    return { textos: ts.length, lineas: ls.length, pares: pares, cruces: cruces } },

  /* La GRILLA completa. Devuelve el recuento y la lista de pares distintos, que es lo que se
     compara antes y despues. */
  grilla() {
    var MORF = ['ala','coliflor','cactus','veleta'];
    var OS = [10,20,30,40], PR = [10,20,30,40,50], VE = [10,20,30,40,50,60,70,80];
    var combos = 0, conPar = 0, conCruce = 0, pares = {}, cruces = {}, ejemplos = [];
    MORF.forEach(function(m){ OS.forEach(function(o){ PR.forEach(function(d){ VE.forEach(function(v){
      var r = window.__OAI._unaPasada(m, o, d, v);
      combos++;
      if (r.err) { pares['ERR ' + r.err] = (pares['ERR ' + r.err]||0) + 1; return }
      if (r.pares.length) { conPar++;
        r.pares.forEach(function(p){ pares[p] = (pares[p]||0) + 1 });
        if (ejemplos.length < 6) ejemplos.push({ morf:m, o:o, d:d, v:v, pares:r.pares, cruces:r.cruces }) }
      if (r.cruces.length) { conCruce++; r.cruces.forEach(function(p){ cruces[p] = (cruces[p]||0) + 1 }) }
    }) }) }) });
    return { combos: combos, combosConParQueSePisa: conPar, combosConLineaSobreRotulo: conCruce,
             paresDistintos: pares, crucesDistintos: cruces, ejemplos: ejemplos } },

  /* ══ A2 · EL MOVIMIENTO ═══════════════════════════════════════════════════════════════════
     ⚠️ EL DENOMINADOR VA PRIMERO: si los nodos animados no existen, dos fotos iguales se leen
     como «no se mueve» cuando lo que pasa es que no hay nada que mover. */
  _foto() {
    var g = function(i){ var e = document.getElementById(i); return e ? e.getAttribute('d') : null };
    var mr = document.getElementById('oai-mr');
    var sec = document.getElementById('oai-sec');
    return { lf1: g('oai-lf1'), lf2: g('oai-lf2'),
             mrD: mr ? mr.getAttribute('d') : null,
             mrTr: mr ? mr.getAttribute('transform') : null,
             secN: sec ? sec.children.length : 0,
             sec0: sec && sec.children[0]
                   ? sec.children[0].getAttribute('cx') + ',' + sec.children[0].getAttribute('cy') : null } },

  /* Dos fotos separadas por ms de reloj real. Devuelve QUE cambio, no un booleano. */
  mover(ms) {
    var a = window.__OAI._foto();
    return new Promise(function(res){ setTimeout(res, ms || 420) }).then(function(){
      var b = window.__OAI._foto();
      return { denominador: { hayValvas: !!(a.lf1 && a.lf2), hayChorro: a.mrD !== null,
                              particulas: a.secN },
               valvasSeMueven: !!(a.lf1 && b.lf1 && a.lf1 !== b.lf1),
               chorroSeMueve: a.mrTr !== b.mrTr || a.mrD !== b.mrD,
               secSeMueve: !!(a.sec0 && b.sec0 && a.sec0 !== b.sec0),
               antes: a, despues: b } }) },

  /* La frecuencia con que se anima, y el control de que ese 70 no se publica. */
  fc() {
    var f = (typeof _oaiFcAnim === 'function') ? _oaiFcAnim() : 'NO EXISTE';
    var campos = {};
    ['ao_fc','hemo_fc'].forEach(function(i){ var e = document.getElementById(i);
      campos[i] = e ? e.value : 'NO EXISTE' });
    return { anim: f, campos: campos } },

  pausar() { if (typeof oaiEsqPausar !== 'function') return { err:'NO EXISTE oaiEsqPausar' };
             oaiEsqPausar(); return window.__OAI._ctrl() },
  seguir() { if (typeof oaiEsqSeguir !== 'function') return { err:'NO EXISTE oaiEsqSeguir' };
             oaiEsqSeguir(); return window.__OAI._ctrl() },
  _ctrl() {
    var v = function(i){ var e = document.getElementById(i);
      return e ? (getComputedStyle(e).display === 'none' ? 'oculto' : 'visible') : 'NO EXISTE' };
    var r = function(i){ var e = document.getElementById(i); if (!e) return null;
      var q = e.getBoundingClientRect(); return { w: Math.round(q.width), h: Math.round(q.height) } };
    return { pausar: v('oai-esq-pausar'), seguir: v('oai-esq-seguir'), pdf: v('oai-esq-pdf'),
             cajas: { pausar: r('oai-esq-pausar'), seguir: r('oai-esq-seguir'), pdf: r('oai-esq-pdf') } } },

  /* «Incluir en el PDF»: guarda el cuadro y despues se cuenta cuantas imagenes de esquema hay. */
  incluir() {
    if (typeof oaiEsqIncluirPDF !== 'function') return Promise.resolve({ err:'NO EXISTE' });
    return oaiEsqIncluirPDF().then(function(r){
      return { resultado: r,
               estado: (document.getElementById('oai-esq-estado')||{}).textContent } }) },
  esquemas(uuid) {
    if (typeof CeiboImg === 'undefined' || !CeiboImg.esquemas)
      return Promise.resolve({ err:'sin CeiboImg.esquemas' });
    return CeiboImg.esquemas(uuid).then(function(es){
      return { n: (es||[]).length,
               claves: (es||[]).map(function(e){ return e.clave }),
               ts: (es||[]).map(function(e){ return e.ts }) } }) },

  /* El estudio de prueba para el guardado: hace falta un uuid, si no el guardado sale por su
     guarda «el estudio todavia no esta guardado» y el caso no prueba nada. */
  montarEstudio(uuid) {
    /* ⚠️ _imgUuidActual ES UN let DEL BLOQUE, NO UNA PROPIEDAD DE window: asignarle a
       window.* no lo mueve, y la primera version de esta sonda media «el estudio todavia no
       esta guardado» creyendo que medía el guardado. La puerta real es imgPersistir(uuid),
       que es la que la app usa, y antes hay que PRENDER el guardado de imagenes. */
    try { if (typeof cfgToggleGuardarImagenes === 'function') cfgToggleGuardarImagenes(true) } catch(e){}
    var pr = (typeof imgPersistir === 'function') ? imgPersistir(uuid) : Promise.resolve(false);
    return Promise.resolve(pr).then(function(){
      return { uuid: (typeof _imgUuidActual !== 'undefined') ? _imgUuidActual : null,
               guardadoActivo: (typeof imgGuardadoActivo === 'function') ? imgGuardadoActivo() : null,
               uuidValido: (typeof _uuidValido === 'function') ? _uuidValido(uuid) : null } }) },

  /* Microbanco: cuanto cuesta CADA pieza del repintado, por separado. */
  banco() {
    var N = 60, i, t0, out = {};
    var cron = function(f){ var a = performance.now(); for (var k = 0; k < N; k++) f();
      return Math.round((performance.now() - a) / N * 1000) / 1000 };
    out.calcOAI = (typeof calcOAI === 'function') ? cron(function(){ calcOAI() }) : 'NO EXISTE';
    out.oaiEsqSVG = (typeof oaiEsqSVG === 'function') ? cron(function(){ oaiEsqSVG(0.3, 1.5) }) : 'NO EXISTE';
    out.oaiEsqSync = (typeof oaiEsqSync === 'function') ? cron(function(){ oaiEsqSync() }) : 'NO EXISTE';
    out.largoSVG = (typeof oaiEsqSVG === 'function') ? oaiEsqSVG(0.3, 1.5).length : 0;
    out.particulas = document.querySelectorAll('#oai-sec circle').length;
    return out },

  /* ══ 2c · EL TIEMPO DE ESCRITURA (no puede empeorar) ══════════════════════════════════════
     Trece teclas REALES sobre el campo del ostium, con la seccion de la orejuela ABIERTA, que
     es el escenario caro: ahi la animacion esta corriendo. */
  teclas() {
    var e = document.getElementById('oai_ostium_diam');
    if (!e) return { err:'sin campo' };
    e.focus();
    var ms = [], i, t0, txt = '12345678901234';
    for (i = 0; i < 13; i++) {
      t0 = performance.now();
      e.value = txt.slice(0, (i % 2) + 1);
      e.dispatchEvent(new Event('input', { bubbles:true }));
      ms.push(performance.now() - t0);
    }
    var suma = ms.reduce(function(a,b){ return a+b }, 0);
    return new Promise(function(res){
      var t1 = performance.now();
      setTimeout(function(){
        var t2 = performance.now();
        res({ teclas: ms.length,
              media: Math.round(suma / ms.length * 100) / 100,
              maximo: Math.round(Math.max.apply(null, ms) * 100) / 100,
              minimo: Math.round(Math.min.apply(null, ms) * 100) / 100,
              esperaHastaElBarrido: Math.round((t2 - t1) * 10) / 10,
              animCorriendo: (typeof _oaiAnimRAF !== 'undefined') ? (_oaiAnimRAF !== null) : 'NO VISIBLE' });
      }, 400);
    }) },

  /* ── El globo general y el ambar, para el commit 3 y su control ────────────────────────────── */
  globo(clave) {
    var b = document.querySelector('[data-vinfo="' + clave + '"]');
    if (!b) return { err:'NO EXISTE el boton ' + clave };
    var abierto = b.getAttribute('aria-expanded') === 'true';
    if (!abierto) { try { vInfoClic(b) } catch(e) { return { err:e.message } } }
    var caja = document.getElementById('vinfo-card');
    var t = caja ? (caja.textContent||'').replace(/\\s+/g,' ').trim() : '';
    var r = caja ? caja.getBoundingClientRect() : null;
    return { hay: !!caja, chars: t.length, texto: t,
             caja: r ? { w:Math.round(r.width), h:Math.round(r.height) } : null,
             recortado: caja ? (caja.scrollHeight > caja.clientHeight + 2 ||
                                caja.scrollWidth > caja.clientWidth + 2) : null } },

  /* ── 4a · LOS VIDEOS AL BORRAR. Siembra un estudio con video y cineloop y lo borra ────────── */
  tiendas() {
    return { CeiboImg: typeof CeiboImg, CeiboVideo: typeof CeiboVideo, CeiboCine: typeof CeiboCine } },

  /* Cuenta lo que hay en cada tienda, por uuid. */
  censo(uuid) {
    var out = { uuid: uuid };
    var ps = [];
    ps.push((typeof CeiboImg !== 'undefined' && CeiboImg.leer)
      ? CeiboImg.leer(uuid).then(function(r){ out.img = r ? (r.imgs||[]).length + '+' + (r.esqs||[]).length : 'sin registro' })
          .catch(function(e){ out.img = 'ERR ' + e.message })
      : Promise.resolve(out.img = 'sin CeiboImg'));
    ps.push((typeof CeiboVideo !== 'undefined' && CeiboVideo.leer)
      ? CeiboVideo.leer(uuid).then(function(r){ out.video = r ? r.length : 'sin registro' })
          .catch(function(e){ out.video = 'ERR ' + e.message })
      : Promise.resolve(out.video = 'sin CeiboVideo'));
    ps.push((typeof CeiboCine !== 'undefined' && CeiboCine.listar)
      ? CeiboCine.listar(uuid).then(function(r){ out.cine = r ? r.length : 'sin registro' })
          .catch(function(e){ out.cine = 'ERR ' + e.message })
      : Promise.resolve(out.cine = 'sin CeiboCine'));
    return Promise.all(ps).then(function(){ return out }) },

  /* Siembra DOS estudios: uno que se borra y otro que NO, para que el control negativo exista.
     Mas un tercer uuid huerfano, que nadie tiene que tocar. */
  sembrarVideo() {
    var hoy = new Date().toISOString();
    var mk = function(u, n){ return { id: 970000 + n, uuid: u, nombre: 'Video ' + n + ' (prueba)',
      ci: String(7700000 + n), doc_tipo: 'CI', fecha_estudio: '2026-10-29',
      fecha_guardado: hoy, campos: { nombre: 'Video ' + n + ' (prueba)' } } };
    var A = 'vid-aaa-0001', B = 'vid-bbb-0002', H = 'vid-huerfano-9999';
    var vid = function(t){ return { nombre: t + '.mp4', mime: 'video/mp4', bytes: 32768,
      dataURL: 'data:video/mp4;base64,' + 'A'.repeat(200) } };
    var cin = function(t){ return { uuid: '', nombre: t, tipo: 'cine', fotos: ['x'],
      dataURL: 'data:image/png;base64,iVBORw0KGgo=' } };
    var ps = [];
    [[A,1],[B,2]].forEach(function(p){
      ps.push(CeiboStore.guardar(mk(p[0], p[1])).catch(function(e){ return 'ERR ' + e.message })) });
    return Promise.all(ps).then(function(){
      var qs = [];
      [A, B, H].forEach(function(u){
        if (typeof CeiboVideo !== 'undefined' && CeiboVideo.guardar)
          qs.push(CeiboVideo.guardar(u, [vid('v-' + u)]).catch(function(e){ return 'ERR' }));
        if (typeof CeiboCine !== 'undefined' && CeiboCine.guardar) {
          var rec = cin('c-' + u); rec.uuid = u;
          qs.push(CeiboCine.guardar(rec).catch(function(e){ return 'ERR' })) } });
      return Promise.all(qs) }).then(function(){
      return Promise.all([window.__OAI.censo(A), window.__OAI.censo(B), window.__OAI.censo(H)]) })
      .then(function(c){ return { A:c[0], B:c[1], huerfano:c[2] } }) },

  /* Borra el estudio A por el camino REAL de la app y vuelve a censar los tres. */
  borrar() {
    var A = 'vid-aaa-0001', B = 'vid-bbb-0002', H = 'vid-huerfano-9999';
    var ps = getInformes ? getInformes() : [];
    var reg = (ps||[]).filter(function(x){ return x.uuid === A })[0];
    if (!reg) return Promise.resolve({ err:'no encontre el estudio sembrado' });
    var fn = (typeof borrarInforme === 'function') ? borrarInforme
           : (typeof eliminarInforme === 'function') ? eliminarInforme : null;
    if (!fn) return Promise.resolve({ err:'no hay funcion de borrado' });
    window.confirm = function(){ return true };
    var r;
    try { r = fn(reg.id !== undefined ? reg.id : A) } catch (e) { return Promise.resolve({ err:e.message }) }
    return Promise.resolve(r).then(function(){
      return new Promise(function(res){ setTimeout(res, 1200) }) }).then(function(){
      return Promise.all([window.__OAI.censo(A), window.__OAI.censo(B), window.__OAI.censo(H)]) })
      .then(function(c){ return { borrado:c[0], control:c[1], huerfano:c[2] } }) },

  /* La LEYENDA del guardado apagado y donde esta el interruptor. */
  leyenda() {
    var est = document.getElementById('oai-esq-estado');
    var txt = est ? (est.textContent||'').trim() : 'NO EXISTE';
    var sw = ['img_guardar','ig-guardar','cfg_img_on','img-guardado-on']
      .map(function(i){ var e = document.getElementById(i);
        return { id:i, hay: !!e, tipo: e ? e.type : null, valor: e ? (e.checked !== undefined ? e.checked : e.value) : null } });
    return { leyenda: txt, candidatos: sw,
             motivos: (typeof ESQ_MOTIVOS !== 'undefined') ? ESQ_MOTIVOS : 'sin constante' } }
};
`;

async function main() {
  const antes = await md5(join(RAIZ, 'index.html'));
  const { srv, port } = await servir();
  const { proc, perfil, wsUrl } = await abrirChrome(`http://127.0.0.1:${port}/${FILE}`);
  const cdp = await conectar(wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const t = targetInfos.find((x) => x.type === 'page' && x.url.includes('127.0.0.1'));
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  const errores = [];
  await cdp.send('Log.enable', {}, sessionId).catch(() => {});
  cdp.send('Runtime.consoleAPICalled', {}, sessionId).catch(() => {});

  const ev = async (expr, nombre = 'evaluate', ms = 60000) => {
    const r = await conReloj(cdp.send('Runtime.evaluate',
      { expression: expr, returnByValue: true, awaitPromise: true }, sessionId), nombre, ms);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'exc');
    return r.result.value;
  };
  const paso = async (nombre, expr, ms = 60000) => {
    const t0 = Date.now();
    try { return { ok: true, ms: Date.now() - t0, dato: JSON.parse(await ev(expr, nombre, ms)) }; }
    catch (e) { return { ok: false, ms: Date.now() - t0, error: e.message }; }
  };
  const J = (x) => `(function(){ return Promise.resolve(${x}).then(function(r){ return JSON.stringify(r) }) })()`;

  for (let i = 0; i < 60; i++) {
    try { await ev(SONDA, 'inyectar', 20000);
      const l = await ev('JSON.stringify(window.__OAI.listo())', 'listo', 20000);
      if (JSON.parse(l).listo) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  const out = { archivo: FARG, md5_index_antes: antes,
                listo: JSON.parse(await ev('JSON.stringify(window.__OAI.listo())', 'listo')) };

  out.abrir = await paso('abrir ETE + orejuela', J('window.__OAI.abrir()'), 30000);
  out.tiendas = await paso('tiendas', J('window.__OAI.tiendas()'), 30000);

  /* ── 1b · EL LUGAR en los cuatro anchos ───────────────────────────────────────────────────── */
  out.poner = await paso('poner los cuatro datos',
    J('window.__OAI.poner({oai_morfologia:"veleta",oai_ostium_diam:22,oai_profundidad:37,oai_vel_vac:24})'), 30000);
  out.lugar = {};
  for (const w of [1440, 1000, 768, 390]) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: w, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
    await new Promise((r) => setTimeout(r, 260));
    out.lugar['w' + w] = await paso('lugar a ' + w, J('window.__OAI.lugar()'), 30000);
  }
  await cdp.send('Emulation.setDeviceMetricsOverride',
    { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false }, sessionId);
  await new Promise((r) => setTimeout(r, 260));

  /* ── 1c · LOS ROTULOS sobre la grilla ──────────────────────────────────────────────────────── */
  out.grillaRotulos = await paso('grilla de rotulos', J('window.__OAI.grilla()'), 300000);

  /* ── El globo general y el ambar (commit 3 y su control) ───────────────────────────────────── */
  out.globoGeneral = await paso('globo oai-ref', J('window.__OAI.globo("oai-ref")'), 30000);
  await ev('(function(){ try{ vInfoCerrar(true) }catch(e){} return 1 })()', 'cerrar', 20000).catch(()=>{});
  out.globoAmbar = await paso('globo ambar de medidas',
    J('window.__OAI.globo("oai-medidas")'), 30000);
  await ev('(function(){ try{ vInfoCerrar(true) }catch(e){} return 1 })()', 'cerrar', 20000).catch(()=>{});

  /* ══ A2 · EL MOVIMIENTO, LOS CONTROLES Y LA IMAGEN ══════════════════════════════════════ */
  out.a2 = {};
  out.a2.fcSinCargar = await paso('fc sin cargar', J('window.__OAI.fc()'), 20000);
  out.a2.ponerIM = await paso('IM severa y SEC severo',
    J('window.__OAI.poner({im_grado:"4", oai_sec:"severo", oai_trombo:"si"})'), 20000);
  out.a2.repintar = await paso('repintar', J('(function(){ oaiEsqSync(); return {ok:1} })()'), 20000);
  out.a2.moverAntes = await paso('se mueve', J('window.__OAI.mover(450)'), 30000);
  out.a2.ctrl0 = await paso('controles', J('window.__OAI._ctrl()'), 20000);
  out.a2.pausar = await paso('pausar', J('window.__OAI.pausar()'), 20000);
  out.a2.moverPausado = await paso('pausado NO se mueve', J('window.__OAI.mover(450)'), 30000);
  out.a2.montar = await paso('montar estudio de prueba', J('window.__OAI.montarEstudio("a2-prueba-0001")'), 20000);
  out.a2.incluir = await paso('incluir en el PDF', J('window.__OAI.incluir()'), 60000);
  out.a2.esquemas1 = await paso('esquemas tras incluir', J('window.__OAI.esquemas("a2-prueba-0001")'), 30000);
  out.a2.seguir = await paso('seguir', J('window.__OAI.seguir()'), 20000);
  out.a2.moverDespues = await paso('vuelve a moverse', J('window.__OAI.mover(450)'), 30000);
  /* El automatico NO pisa el cuadro elegido: se teclea otro ostium y se espera mas que el
     retardo de 700 ms del guardado diferido. */
  out.a2.tecleo = await paso('tecleo despues de incluir',
    J('(function(){ var e=document.getElementById("oai_ostium_diam"); e.value="27"; e.dispatchEvent(new Event("input",{bubbles:true})); return {ok:1} })()'), 20000);
  out.a2.esperar = await paso('esperar el diferido',
    J('new Promise(function(r){ setTimeout(function(){ r({ok:1}) }, 1500) })'), 30000);
  out.a2.esquemas2 = await paso('esquemas tras el tecleo', J('window.__OAI.esquemas("a2-prueba-0001")'), 30000);
  /* CONTROL NEGATIVO: con la seccion plegada no se mueve nada. */
  out.a2.plegar = await paso('plegar la seccion',
    J('(function(){ var s=document.getElementById("ete-seccion-oai"); s.style.display="none"; return {display:s.style.display} })()'), 20000);
  out.a2.moverPlegado = await paso('plegado NO se mueve', J('window.__OAI.mover(450)'), 30000);
  out.a2.desplegar = await paso('desplegar',
    J('(function(){ var s=document.getElementById("ete-seccion-oai"); s.style.display="block"; oaiEsqSync(); return {display:s.style.display} })()'), 20000);

  out.banco = await paso('microbanco', J('window.__OAI.banco()'), 60000);
  out.teclasPausado = await paso('tiempo de escritura con la animacion PAUSADA',
    J('(function(){ if (typeof oaiEsqPausar === "function") oaiEsqPausar(); return window.__OAI.teclas() })()'), 60000);
  out.teclasSinSec = await paso('tiempo de escritura SIN contraste espontaneo',
    J('(function(){ if (typeof oaiEsqSeguir === "function") oaiEsqSeguir(); window.__OAI.poner({oai_sec:""}); if (typeof oaiEsqSync === "function") oaiEsqSync(); return window.__OAI.teclas() })()'), 60000);
  out.restaurarSec = await paso('reponer el contraste',
    J('(function(){ window.__OAI.poner({oai_sec:"severo"}); if (typeof oaiEsqSync === "function") oaiEsqSync(); return {ok:1} })()'), 30000);
  out.teclas = await paso('tiempo de escritura', J('window.__OAI.teclas()'), 60000);
  out.leyenda = await paso('la leyenda del guardado', J('window.__OAI.leyenda()'), 30000);

  /* ── 4a · LOS VIDEOS AL BORRAR ─────────────────────────────────────────────────────────────── */
  out.sembrarVideo = await paso('sembrar videos', J('window.__OAI.sembrarVideo()'), 120000);
  out.borrar = await paso('borrar el estudio A', J('window.__OAI.borrar()'), 120000);

  const despues = await md5(join(RAIZ, 'index.html'));
  out.md5_index_despues = despues;
  out.index_intacto = antes === despues;
  console.log(JSON.stringify(out, null, 2));
  console.log('__CIERRE_OK__');
  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}
main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
