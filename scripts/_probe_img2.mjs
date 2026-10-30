#!/usr/bin/env node
/**
 * _probe_img2.mjs — sonda de la PANTALLA «IMAGENES GUARDADAS» (tanda IMAGENES, 2026-10-29).
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
 *   node scripts/_probe_img2.mjs --file /tmp/index.HEAD.html > /tmp/i2.HEAD.json
 *   node scripts/_probe_img2.mjs                             > /tmp/i2.NEW.json
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-img2-'));
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

/* ══ Sonda inyectada ══════════════════════════════════════════════════════════════════════════
   ⚠️ CUERPO DE TEMPLATE LITERAL: ni un acento grave adentro, tampoco en los comentarios. */
const SONDA = `
window.__I2 = {
  listo() {
    var faltan = ['getInformes','igPintar','aplicarFiltros','renderInformesGuardados','showTab']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (faltan.length) return { listo:false, faltan:faltan };
    if (typeof CeiboImg === 'undefined') return { listo:false, por:'sin CeiboImg' };
    if (!document.getElementById('ig-lista')) return { listo:false, por:'sin ig-lista' };
    return { listo:true } },

  /* ── Una imagen sintetica con pinta de ecografia, para medir FORMATO y PESO reales ──────────
     Pasa por _imgComprimir, que es la puerta unica de compresion de la app, asi que lo que se
     mide es el dataURL que termina en IndexedDB y no una estimacion. El indice entra DIBUJADO
     en la imagen: sin eso, mil copias del mismo dataURL le permiten al navegador cachear el
     bitmap decodificado una sola vez, y el tiempo de pintar mil miniaturas sale optimista. */
  _fuente(i) {
    var cv = document.createElement('canvas'); cv.width = 1024; cv.height = 768;
    var x = cv.getContext('2d'), k, s = (i * 9301 + 49297) % 233280, r = function(){
      s = (s * 9301 + 49297) % 233280; return s / 233280 };
    x.fillStyle = '#04070b'; x.fillRect(0, 0, 1024, 768);
    x.beginPath(); x.moveTo(512, 60); x.arc(512, 60, 640, Math.PI/2 - 0.68, Math.PI/2 + 0.68);
    x.closePath();
    var g = x.createLinearGradient(0, 60, 0, 700);
    g.addColorStop(0, '#1b4f9c'); g.addColorStop(1, '#08234a'); x.fillStyle = g; x.fill();
    for (k = 0; k < 9000; k++) { x.fillStyle = 'rgba(190,215,250,' + (0.05 + r()*0.25) + ')';
      x.fillRect(r()*1024, r()*768, 2.5, 2.5) }
    x.strokeStyle = 'rgba(180,215,255,.9)'; x.lineWidth = 7;
    x.beginPath(); x.moveTo(330, 350); x.quadraticCurveTo(512, 270, 720, 380); x.stroke();
    x.fillStyle = '#fff'; x.font = '28px sans-serif';
    x.fillText('IM ' + i + ' PRUEBA', 40, 60);
    return cv.toDataURL('image/png');
  },

  /* ── 1a-2 · FORMATO Y PESO de una imagen guardada, en las tres calidades ────────────────── */
  pesoImagen() {
    var src = window.__I2._fuente(1);
    var cals = ['mini','media','orig'];
    return Promise.all(cals.map(function(c){ return _imgComprimir(src, c) })).then(function(rs){
      var out = { fuentePng: { chars: src.length, bytes: Math.round(src.length * 0.75) } };
      cals.forEach(function(c, i){
        var d = rs[i];
        out[c] = { prefijo: String(d).slice(0, 23),
                   chars: d.length,
                   bytesAprox: Math.round((d.length - (String(d).indexOf(',') + 1)) * 0.75),
                   cal: (typeof IMG_CAL !== 'undefined' ? IMG_CAL[c] : null) };
      });
      out.porOmision = (typeof IMG_CAL_DEF !== 'undefined') ? IMG_CAL_DEF : '?';
      return out;
    });
  },

  /* ── SIEMBRA · entorno de prueba ────────────────────────────────────────────────────────────
     Escribe nEst estudios con nImg imagenes cada uno. Los estudios van por CeiboStore, que es
     el mismo camino del guardado real, y las imagenes por CeiboImg.guardar, que es la puerta
     unica: asi lo que se mide despues es el formato de verdad y no un atajo. Devuelve el
     tiempo de cada etapa — generar los JPEG es parte del costo y conviene verlo separado. */
  sembrar(nEst, nImg, calidad) {
    var t0 = performance.now();
    var cal = calidad || 'media';
    var ests = [], uuids = [];
    for (var i = 0; i < nEst; i++) {
      var mes = 1 + (i % 12), dia = 1 + (i % 27);
      var u = 'sem-' + String(10000 + i);
      uuids.push(u);
      ests.push({ id: 900000 + i, uuid: u,
                  nombre: 'Siembra ' + i + ' (prueba)', ci: String(5000000 + i),
                  doc_tipo: 'CI',
                  fecha_estudio: '2026-' + String(mes).padStart(2,'0') + '-' + String(dia).padStart(2,'0'),
                  fecha_guardado: '2026-10-29T10:' + String(i % 60).padStart(2,'0') + ':00.000Z',
                  campos: { nombre:'Siembra ' + i + ' (prueba)', fevi: String(30 + (i % 40)),
                            caso_interes: (i % 9 === 0 ? '1' : ''),
                            informe_texto: 'Texto de siembra ' + i } });
    }
    return CeiboStore.setLocal(ests).then(function(){
      var tEst = performance.now();
      /* Las fuentes se generan UNA vez por imagen y se comprimen en serie: en paralelo, mil
         Image() a la vez revientan la memoria del renderer antes de medir nada. */
      var hechos = 0, bytes = 0;
      function unEstudio(k) {
        if (k >= nEst) return Promise.resolve();
        var fuentes = [];
        for (var j = 0; j < nImg; j++) fuentes.push(window.__I2._fuente(k * 1000 + j));
        return fuentes.reduce(function(p, src){
          return p.then(function(acc){
            return _imgComprimir(src, cal).then(function(d){ acc.push(d); return acc });
          });
        }, Promise.resolve([])).then(function(ds){
          var imgs = ds.map(function(d, j){
            return { dataURL: d, ampliada: false, calidad: cal,
                     origen: (j % 5 === 0 ? 'visor' : 'estudio') };
          });
          ds.forEach(function(d){ bytes += d.length });
          hechos += ds.length;
          return CeiboImg.guardar(uuids[k], imgs);
        }).then(function(){ return unEstudio(k + 1) });
      }
      return unEstudio(0).then(function(){
        return { estudios: nEst, imgsPorEstudio: nImg, imagenes: hechos,
                 calidad: cal, charsTotales: bytes,
                 msEstudios: Math.round(tEst - t0),
                 msImagenes: Math.round(performance.now() - tEst),
                 msTotal: Math.round(performance.now() - t0) };
      });
    });
  },


  /* ── Entrar a Guardados por la puerta real ──────────────────────────────────────────────── */
  entrar() {
    try { showTab('guardados') } catch(e) {
      try {
        document.querySelectorAll('.tab-section').forEach(function(s){ s.classList.remove('active') });
        var t = document.getElementById('tab-guardados'); if (t) t.classList.add('active');
        if (typeof igMesesReset === 'function') igMesesReset();
        if (typeof igImgCablear === 'function') igImgCablear();
      } catch(e2) {}
    }
    try { localStorage.setItem('cfg-guardar-imagenes','1') } catch(e) {}
    try { renderInformesGuardados() } catch(e) {}
    return { tab: (function(){ var t = document.getElementById('tab-guardados');
                               return !!t && t.classList.contains('active') })() } },

  /* ── Los DOS botones, su estado y lo que cada vista esconde ─────────────────────────────── */
  botones() {
    var g = function(id){ var e = document.getElementById(id);
      if (!e) return 'NO EXISTE';
      var r = e.getBoundingClientRect();
      return { txt: (e.textContent||'').trim(), pressed: e.getAttribute('aria-pressed'),
               w: Math.round(r.width), h: Math.round(r.height),
               vis: r.width > 0 && r.height > 0 } };
    var disp = function(id){ var e = document.getElementById(id);
      if (!e) return 'NO EXISTE';
      return getComputedStyle(e).display };
    return { inf: g('ig-vista-inf'), img: g('ig-vista-img'),
             vistaActual: (typeof igVista !== 'undefined') ? igVista : 'NO EXISTE',
             display: { lista: disp('ig-lista'), imgView: disp('ig-img-view'),
                        borrarTodos: disp('ig-btn-borrar-todos'), io: disp('ig-io-acciones'),
                        side: disp('ig-img-side') },
             barraEnLaMismaFila: (function(){
               var a = document.getElementById('ig-vista-img'), b = document.getElementById('ig-img-storage');
               if (!a || !b) return 'NO EXISTE';
               var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
               return Math.abs(ra.top - rb.top) < 26 })() } },

  cambiar(v) {
    var b = document.getElementById(v === 'img' ? 'ig-vista-img' : 'ig-vista-inf');
    if (!b) return 'NO EXISTE';
    b.click();
    return { vista: (typeof igVista !== 'undefined') ? igVista : '?' } },

  /* ── La pagina: meses, numeracion, miniaturas y el pie ──────────────────────────────────── */
  pagina() {
    var cont = document.getElementById('ig-img-lista');
    if (!cont) return 'NO EXISTE';
    var grupos = Array.prototype.map.call(cont.querySelectorAll('.ig-mes-grupo'), function(g){
      var h = g.querySelector('.ig-mes');
      return { mes: g.dataset.mes, cerrado: g.classList.contains('cerrado'),
               aria: h ? h.getAttribute('aria-expanded') : null,
               rotulo: h ? (h.textContent||'').trim() : null,
               miniaturas: g.querySelectorAll('.ig-img-th').length,
               lleno: g.dataset.igLleno || '' } });
    var ths = Array.prototype.slice.call(cont.querySelectorAll('.ig-img-th'));
    return { grupos: grupos, totalMiniaturas: ths.length,
             pie: (function(){ var p = document.getElementById('ig-img-contador');
                               return p ? (p.textContent||'').trim() : null })(),
             vacio: (function(){ var v = cont.querySelector('.ig-img-vac');
                                 return v ? (v.textContent||'').trim() : null })(),
             numeros: ths.slice(0, 20).map(function(t){ return t.dataset.igN }),
             conImagen: ths.filter(function(t){ return !!t.querySelector('img') }).length,
             titulos: ths.slice(0, 3).map(function(t){ return t.title }),
             aria: ths.slice(0, 3).map(function(t){ return t.getAttribute('aria-label') }),
             videos: cont.querySelectorAll('.ig-img-vb').length,
             esquemas: cont.querySelectorAll('.ig-img-eq').length,
             estrellas: cont.querySelectorAll('.ig-img-st').length,
             notas: cont.querySelectorAll('.ig-img-nb').length } },

  /* Abre un mes por su boton REAL y mide lo que tarda en tener miniaturas. */
  abrirMes(i) {
    var cont = document.getElementById('ig-img-lista');
    if (!cont) return 'NO EXISTE';
    var gs = cont.querySelectorAll('.ig-mes-grupo');
    var g = gs[i || 0];
    if (!g) return { err: 'sin grupo ' + i };
    var t0 = performance.now();
    var h = g.querySelector('.ig-mes');
    h.click();
    var tClic = performance.now();
    /* ⚠️ SE ESPERA 500 ms, Y NO DOS CUADROS. El IntersectionObserver entrega sus observaciones
       DESPUES de los callbacks de requestAnimationFrame, y recien ahi la miniatura le pide su
       dataURL a IndexedDB: medir a los dos cuadros da conImagen CERO sobre una grilla que si
       carga, que es indistinguible de un lazy que no funciona. */
    return new Promise(function(res){
      setTimeout(function(){
        var mem = null;
        try { if (performance.memory) mem = {
          usadoMB: Math.round(performance.memory.usedJSHeapSize/1048576*10)/10 } } catch(e){}
        res({ mes: g.dataset.mes, cerrado: g.classList.contains('cerrado'),
              aria: h.getAttribute('aria-expanded'),
              miniaturas: g.querySelectorAll('.ig-img-th').length,
              conImagen: g.querySelectorAll('.ig-img-th img').length,
              msClic: Math.round(tClic - t0),
              msHastaPintar: Math.round(performance.now() - t0),
              memoria: mem });
      }, 500);
    }) },

  /* ── LOS FILTROS, APLICADOS POR EL ESTUDIO ──────────────────────────────────────────────────
     Se mueve un filtro de arriba y se mira el pie de la pagina de imagenes. El numerico es el
     que importa: entra por la cadena LARGA, que es la que la pantalla nueva tenia que heredar. */
  filtro(cual, valor) {
    var e = document.getElementById(cual);
    if (!e) return 'NO EXISTE ' + cual;
    if (e.type === 'checkbox') { e.checked = !!valor; e.dispatchEvent(new Event('change', {bubbles:true})) }
    else { e.value = String(valor);
           e.dispatchEvent(new Event('input', {bubbles:true}));
           e.dispatchEvent(new Event('change', {bubbles:true})) }
    if (typeof aplicarFiltros === 'function') { try { aplicarFiltros() } catch(err){} }
    var p = document.getElementById('ig-img-contador');
    var c = document.getElementById('ig-contador');
    return { filtro: cual, valor: String(valor),
             pieImagenes: p ? (p.textContent||'').trim() : null,
             contadorEstudios: c ? (c.textContent||'').trim() : null,
             grupos: (function(){ var k = document.getElementById('ig-img-lista');
                                  return k ? k.querySelectorAll('.ig-mes-grupo').length : null })(),
             vacio: (function(){ var k = document.getElementById('ig-img-lista');
                                 var v = k ? k.querySelector('.ig-img-vac') : null;
                                 return v ? (v.textContent||'').trim() : null })() } },

  limpiar() {
    try { limpiarFiltros() } catch(e) {}
    try { limpiarFiltroFechas() } catch(e) {}
    return true },

  /* ── El visor de una imagen ─────────────────────────────────────────────────────────────── */
  abrirVisor(i) {
    var ths = document.querySelectorAll('#ig-img-lista .ig-img-th');
    var t = ths[i || 0];
    if (!t) return { err: 'sin miniatura ' + i };
    t.click();
    return new Promise(function(res){ setTimeout(function(){
      var ov = document.getElementById('ig-imgv-ov');
      var im = document.getElementById('ig-imgv-img');
      res({ abierto: !!ov && ov.classList.contains('open'),
            titulo: (function(){ var e = document.getElementById('ig-imgv-tit');
                                 return e ? (e.textContent||'').trim() : null })(),
            info: (function(){ var e = document.getElementById('ig-imgv-info');
                               return e ? (e.textContent||'').trim() : null })(),
            pie: (function(){ var e = document.getElementById('ig-imgv-pie');
                              return e ? (e.textContent||'').trim() : null })(),
            tieneSrc: !!(im && im.getAttribute('src')),
            srcPrefijo: im && im.getAttribute('src') ? im.getAttribute('src').slice(0,23) : null,
            botonIr: (function(){ var e = document.getElementById('ig-imgv-ir');
                                  return e ? (e.textContent||'').trim() : 'NO EXISTE' })(),
            botones44: Array.prototype.map.call(
              document.querySelectorAll('#ig-imgv-ov button'), function(b){
                var r = b.getBoundingClientRect();
                return (b.textContent||'').trim().slice(0,12) + ':' +
                       Math.round(r.width) + 'x' + Math.round(r.height) }) });
    }, 500) }) },

  cerrarVisor() {
    var b = document.getElementById('ig-imgv-cerrar');
    if (b) b.click();
    var ov = document.getElementById('ig-imgv-ov');
    var im = document.getElementById('ig-imgv-img');
    return { abierto: !!ov && ov.classList.contains('open'),
             srcSoltado: !(im && im.getAttribute('src')) } },

  /* ── Lo que la pagina cuesta: pintar con los meses CERRADOS ─────────────────────────────── */
  costo() {
    var t0 = performance.now();
    try { renderInformesGuardados() } catch(e) { return { err: e.message } }
    var tSync = performance.now();
    return new Promise(function(res){
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        var mem = null;
        try { if (performance.memory) mem = {
          usadoMB: Math.round(performance.memory.usedJSHeapSize/1048576*10)/10,
          totalMB: Math.round(performance.memory.totalJSHeapSize/1048576*10)/10 } } catch(e){}
        var cont = document.getElementById('ig-img-lista');
        res({ msSincrono: Math.round(tSync - t0),
              msHastaPintar: Math.round(performance.now() - t0),
              grupos: cont ? cont.querySelectorAll('.ig-mes-grupo').length : null,
              miniaturas: cont ? cont.querySelectorAll('.ig-img-th').length : null,
              imgCreadas: cont ? cont.querySelectorAll('.ig-img-th img').length : null,
              memoria: mem,
              cacheEstudios: (typeof _igImgBlobs !== 'undefined') ? _igImgBlobs.size : 'NO EXISTE',
              topeCache: (typeof IG_IMG_CACHE_MAX !== 'undefined') ? IG_IMG_CACHE_MAX : 'NO EXISTE',
              indice: (typeof _igImgIndice !== 'undefined' && _igImgIndice) ? _igImgIndice.length : 'NO EXISTE' });
      }) });
    }) },

  /* ── CeiboImg.indice(): el costo de leer el indice SIN los dataURL ──────────────────────── */
  indice() {
    if (typeof CeiboImg === 'undefined' || !CeiboImg.indice) return Promise.resolve('NO EXISTE');
    var t0 = performance.now();
    return CeiboImg.indice().then(function(r){
      var ms = Math.round(performance.now() - t0);
      var chars = JSON.stringify(r).length;
      return { registros: r.length, ms: ms, charsMetadata: chars,
               slots: r.reduce(function(n,x){ return n + x.slots.length }, 0),
               traeDataURL: JSON.stringify(r).indexOf('data:image') >= 0,
               primerSlot: r.length ? r[0].slots[0] : null };
    }) },

  /* ── LA ESTRELLA DE IMAGEN y su nota ─────────────────────────────────────────────────────
     Se clickea la estrella REAL de la miniatura, no se llama al escritor: el punto es que el
     gesto llegue a disco y vuelva a la pantalla. Y se mide que NO es la misma marca que «Casos
     de interes» del estudio -color distinto y clave distinta-. */
  estrella(i) {
    var ths = document.querySelectorAll('#ig-img-lista .ig-img-th');
    var t = ths[i || 0];
    if (!t) return Promise.resolve({ err:'sin miniatura ' + i });
    var st = t.querySelector('.ig-img-st');
    if (!st) return Promise.resolve('NO EXISTE .ig-img-st');
    var uuid = t.dataset.igUuid, idx = parseInt(t.dataset.igIdx, 10);
    var antes = { clase: st.className, txt: (st.textContent||'').trim(),
                  pressed: st.getAttribute('aria-pressed'),
                  color: getComputedStyle(st).color,
                  w: Math.round(st.getBoundingClientRect().width),
                  h: Math.round(st.getBoundingClientRect().height) };
    st.click();
    return new Promise(function(res){ setTimeout(function(){
      /* La grilla se repinta entera, asi que la miniatura es OTRO nodo: se la busca de nuevo. */
      var t2 = document.querySelector('#ig-img-lista .ig-img-th[data-ig-uuid="' + uuid + '"][data-ig-idx="' + idx + '"]');
      var st2 = t2 ? t2.querySelector('.ig-img-st') : null;
      CeiboImg.leer(uuid).then(function(imgs){
        var sl = (imgs && imgs[idx]) ? imgs[idx] : null;
        res({ antes: antes,
              despues: st2 ? { clase: st2.className, txt: (st2.textContent||'').trim(),
                               pressed: st2.getAttribute('aria-pressed'),
                               color: getComputedStyle(st2).color } : 'sin nodo',
              enDisco: sl ? { star: !!sl.star, nota: String(sl.nota||''),
                              esquema: !!sl.esquema, tieneDataURL: !!sl.dataURL } : 'sin slot',
              /* El color de la estrella del ESTUDIO, para la comparacion del punto 3a. */
              colorCasoInteres: '#f5c842',
              metaEnIndice: (typeof igImgMeta === 'function') ? igImgMeta(uuid, idx) : 'NO EXISTE' });
      });
    }, 600) }) },

  /* La nota: se abre el visor de una imagen YA marcada, se escribe y se cierra. */
  nota(i, texto) {
    var ths = document.querySelectorAll('#ig-img-lista .ig-img-th');
    var t = ths[i || 0];
    if (!t) return Promise.resolve({ err:'sin miniatura' });
    var uuid = t.dataset.igUuid, idx = parseInt(t.dataset.igIdx, 10);
    t.click();
    return new Promise(function(res){ setTimeout(function(){
      var bs = document.getElementById('ig-imgv-star');
      var box = document.getElementById('ig-imgv-nota-box');
      var ta = document.getElementById('ig-imgv-nota');
      var est0 = { starTxt: bs ? (bs.textContent||'').trim() : 'NO EXISTE',
                   notaVisible: box ? getComputedStyle(box).display !== 'none' : 'NO EXISTE',
                   maxlength: ta ? ta.getAttribute('maxlength') : 'NO EXISTE' };
      if (!ta) return res({ est0: est0, err:'sin textarea' });
      ta.value = texto;
      ta.dispatchEvent(new Event('input', { bubbles:true }));
      ta.dispatchEvent(new Event('blur', { bubbles:true }));
      setTimeout(function(){
        var cerrar = document.getElementById('ig-imgv-cerrar');
        if (cerrar) cerrar.click();
        setTimeout(function(){
          CeiboImg.leer(uuid).then(function(imgs){
            var sl = (imgs && imgs[idx]) ? imgs[idx] : null;
            var t2 = document.querySelector('#ig-img-lista .ig-img-th[data-ig-uuid="' + uuid + '"][data-ig-idx="' + idx + '"]');
            var nb = t2 ? t2.querySelector('.ig-img-nb') : null;
            res({ est0: est0,
                  enDisco: sl ? { star: !!sl.star, nota: String(sl.nota||'') } : 'sin slot',
                  badge: nb ? { txt: (nb.textContent||'').trim(), title: nb.title } : 'sin badge' });
          });
        }, 500);
      }, 300);
    }, 600) }) },

  /* Desmarcar BORRA la nota: una nota sin estrella no existe. */
  desmarcar(i) {
    var ths = document.querySelectorAll('#ig-img-lista .ig-img-th');
    var t = ths[i || 0];
    if (!t) return Promise.resolve({ err:'sin miniatura' });
    var uuid = t.dataset.igUuid, idx = parseInt(t.dataset.igIdx, 10);
    var st = t.querySelector('.ig-img-st');
    if (!st) return Promise.resolve('NO EXISTE');
    st.click();
    return new Promise(function(res){ setTimeout(function(){
      CeiboImg.leer(uuid).then(function(imgs){
        var sl = (imgs && imgs[idx]) ? imgs[idx] : null;
        res({ enDisco: sl ? { star: !!sl.star, nota: String(sl.nota||'') } : 'sin slot' });
      });
    }, 600) }) },

  /* El filtro de la columna derecha, que es el que usa ESTA estrella. */
  filtroCol(cual) {
    var b = document.querySelector('[data-ig-imgf="' + cual + '"]');
    if (!b) return 'NO EXISTE';
    b.click();
    var p = document.getElementById('ig-img-contador');
    var cont = document.getElementById('ig-img-lista');
    return { filtro: cual, pie: p ? (p.textContent||'').trim() : null,
             vacio: (function(){ var v = cont ? cont.querySelector('.ig-img-vac') : null;
                                 return v ? (v.textContent||'').trim() : null })(),
             grupos: cont ? cont.querySelectorAll('.ig-mes-grupo').length : null,
             pressed: Array.prototype.map.call(document.querySelectorAll('[data-ig-imgf]'),
               function(x){ return x.dataset.igImgf + '=' + x.getAttribute('aria-pressed') }) } },

  /* Que la estrella de imagen SOBREVIVE a un guardado del estudio por el formulario, que es la
     via por la que imgPersistir reescribe el juego entero desde imgSlots. */
  sobreviveAlGuardado(uuid, idx) {
    if (typeof imgRestaurar !== 'function' || typeof imgPersistir !== 'function')
      return Promise.resolve('NO EXISTE');
    return imgRestaurar(uuid).then(function(n){
      var enSlot = (typeof imgSlots !== 'undefined' && imgSlots[idx])
        ? { star: !!imgSlots[idx].star, nota: String(imgSlots[idx].nota||''),
            esquema: !!imgSlots[idx].esquema } : 'sin slot';
      return Promise.resolve(imgPersistir(uuid)).then(function(ok){
        return CeiboImg.leer(uuid).then(function(imgs){
          var sl = (imgs && imgs[idx]) ? imgs[idx] : null;
          return { restauradas: n, enSlotTrasRestaurar: enSlot, persistio: ok,
                   enDiscoTrasGuardar: sl ? { star: !!sl.star, nota: String(sl.nota||''),
                                              esquema: !!sl.esquema } : 'sin slot' };
        });
      });
    }) },

  /* ── EL ARMADO DEL PPT (commit 4) ─────────────────────────────────────────────────────────
     Se prende la casilla REAL, se eligen miniaturas con clics REALES y se mide el orden, el
     limite y el aviso. El archivo se genera de verdad y se verifica desde node. */
  pptPrender() {
    var chk = document.getElementById('ig-ppt-on');
    if (!chk) return 'NO EXISTE ig-ppt-on';
    chk.checked = true;
    chk.dispatchEvent(new Event('change', { bubbles:true }));
    return new Promise(function(res){ setTimeout(function(){
      res({ on: (typeof _igImgPpt !== 'undefined') ? _igImgPpt : 'NO EXISTE',
            tope: (typeof IG_IMG_PPT_MAX !== 'undefined') ? IG_IMG_PPT_MAX : 'NO EXISTE',
            por: (typeof IG_IMG_PPT_POR !== 'undefined') ? IG_IMG_PPT_POR : 'NO EXISTE',
            botonesPor: Array.prototype.map.call(
              document.querySelectorAll('#ig-img-side-ppt .ig-vista-btn'),
              function(b){ return (b.textContent||'').trim() + '=' + b.getAttribute('aria-pressed') }),
            exportar: (function(){ var e = document.getElementById('ig-ppt-exportar');
              if (!e) return 'NO EXISTE';
              var r = e.getBoundingClientRect();
              return (e.textContent||'').trim() + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) })(),
            texto: (function(){ var c = document.getElementById('ig-img-side-ppt');
              return c ? (c.textContent||'').replace(/[ \\t\\n]+/g,' ').trim().slice(0,220) : null })() });
    }, 400) }) },

  /* Elige n miniaturas EN ORDEN y mide el numero de orden que queda en cada una. */
  pptElegir(n) {
    /* TODOS los meses abiertos: con uno solo no hay 24 miniaturas y el tope no se puede probar.
       Se abren por su boton real, que es lo que las construye. */
    Array.prototype.forEach.call(
      document.querySelectorAll('#ig-img-lista .ig-mes-grupo.cerrado .ig-mes'),
      function(h){ h.click() });
    var ths = document.querySelectorAll('#ig-img-lista .ig-img-th');
    var tope = Math.min(n, ths.length);
    var pedidos = [];
    for (var i = 0; i < tope; i++) pedidos.push(ths[i].dataset.igN);
    /* Se clickean de atras para adelante a proposito: asi el ORDEN DE ELECCION no coincide con
       el orden de la grilla y la lista puede equivocarse de forma visible. */
    var orden = [];
    for (var k = tope - 1; k >= 0; k--) {
      var t = document.querySelector('#ig-img-lista .ig-img-th[data-ig-n="' + pedidos[k] + '"]');
      if (t) { t.click(); orden.push(pedidos[k]); }
    }
    return new Promise(function(res){ setTimeout(function(){
      var sel = (typeof _igImgSel !== 'undefined') ? _igImgSel.map(function(x){ return x.n }) : 'NO EXISTE';
      var ords = Array.prototype.map.call(document.querySelectorAll('#ig-img-lista .ig-img-ord'),
        function(o){ return o.closest('.ig-img-th').dataset.igN + ':' + (o.textContent||'').trim() });
      res({ pedidos: pedidos, ordenDeClic: orden, seleccion: sel,
            insigniasEnGrilla: ords.sort(),
            seleccionadas: document.querySelectorAll('#ig-img-lista .ig-img-th.sel').length,
            filas: document.querySelectorAll('#ig-img-side-ppt .ig-img-it').length,
            cabecera: (function(){ var c = document.getElementById('ig-img-side-ppt');
              var ps = c ? c.querySelectorAll('p') : [];
              return ps.length ? (ps[0].textContent||'').trim() : null })(),
            res: (function(){ var e = document.getElementById('ig-ppt-res');
              return e ? (e.textContent||'').trim() : 'NO EXISTE' })() });
    }, 500) }) },

  /* El LIMITE: se intenta sumar una mas por encima del tope. */
  pptLimite() {
    var ths = document.querySelectorAll('#ig-img-lista .ig-img-th');
    var antes = (typeof _igImgSel !== 'undefined') ? _igImgSel.length : -1;
    var libre = null;
    for (var i = 0; i < ths.length; i++) {
      if (!ths[i].classList.contains('sel')) { libre = ths[i]; break }
    }
    if (!libre) return Promise.resolve({ err:'no hay miniatura libre' });
    var nLibre = libre.dataset.igN;
    libre.click();
    return new Promise(function(res){ setTimeout(function(){
      res({ antes: antes,
            despues: (typeof _igImgSel !== 'undefined') ? _igImgSel.length : -1,
            intentada: nLibre,
            entro: (typeof _igImgSel !== 'undefined') &&
                   _igImgSel.some(function(x){ return String(x.n) === String(nLibre) }),
            res: (function(){ var e = document.getElementById('ig-ppt-res');
              return e ? (e.textContent||'').trim() : 'NO EXISTE' })() });
    }, 400) }) },

  /* Reordenar con las flechas y sacar con la cruz. */
  pptReordenar() {
    var filas = document.querySelectorAll('#ig-img-side-ppt .ig-img-it');
    if (filas.length < 2) return Promise.resolve({ err:'menos de dos filas' });
    var antes = _igImgSel.map(function(x){ return x.n });
    var bajar = filas[0].querySelectorAll('button');
    var bt = null;
    Array.prototype.forEach.call(bajar, function(b){ if ((b.textContent||'').trim() === '\u2193') bt = b });
    if (!bt) return Promise.resolve({ err:'sin flecha' });
    bt.click();
    return new Promise(function(res){ setTimeout(function(){
      var medio = _igImgSel.map(function(x){ return x.n });
      var f2 = document.querySelectorAll('#ig-img-side-ppt .ig-img-it');
      var cruz = null;
      Array.prototype.forEach.call(f2[0].querySelectorAll('button'), function(b){
        if ((b.textContent||'').trim() === '\u2715') cruz = b });
      if (cruz) cruz.click();
      setTimeout(function(){
        res({ antes: antes, trasBajar: medio,
              trasSacar: _igImgSel.map(function(x){ return x.n }) });
      }, 400);
    }, 400) }) },

  /* La TAPA: se abre el visor en modo tapa desde la columna, se mueve el cuadrado y se cierra. */
  pptTapar() {
    var filas = document.querySelectorAll('#ig-img-side-ppt .ig-img-it');
    if (!filas.length) return Promise.resolve({ err:'sin filas' });
    var bt = null;
    Array.prototype.forEach.call(filas[0].querySelectorAll('button'), function(b){
      if ((b.textContent||'').trim().indexOf('Tapar') === 0) bt = b });
    if (!bt) return Promise.resolve({ err:'sin boton de tapar' });
    bt.click();
    return new Promise(function(res){ setTimeout(function(){
      var m = document.getElementById('ig-imgv-msk');
      var info = document.getElementById('ig-imgv-info');
      var pie = document.getElementById('ig-imgv-pie');
      var est = { mascaraVisible: m ? getComputedStyle(m).display !== 'none' : 'NO EXISTE',
                  info: info ? (info.textContent||'').trim() : null,
                  pie: pie ? (pie.textContent||'').trim() : null,
                  medirOculto: (function(){ var e = document.getElementById('ig-imgv-medir');
                    return e ? getComputedStyle(e).display === 'none' : 'NO EXISTE' })(),
                  irOculto: (function(){ var e = document.getElementById('ig-imgv-ir');
                    return e ? getComputedStyle(e).display === 'none' : 'NO EXISTE' })(),
                  estrellaOculta: (function(){ var e = document.getElementById('ig-imgv-star');
                    return e ? getComputedStyle(e).display === 'none' : 'NO EXISTE' })(),
                  tapaGuardada: (typeof _igImgTapas !== 'undefined') ? _igImgTapas.size : 'NO EXISTE',
                  rect: (typeof _igImgTapas !== 'undefined' && _igImgTapas.size)
                    ? JSON.parse(JSON.stringify(_igImgTapas.values().next().value)) : null };
      var cerrar = document.getElementById('ig-imgv-cerrar');
      if (cerrar) cerrar.click();
      setTimeout(function(){
        var f2 = document.querySelectorAll('#ig-img-side-ppt .ig-img-it');
        est.botonesTrasTapar = f2.length
          ? Array.prototype.map.call(f2[0].querySelectorAll('button'),
              function(b){ return (b.textContent||'').trim() }) : null;
        res(est);
      }, 500);
    }, 700) }) },

  /* El AVISO PREVIO: tiene que aparecer ANTES de generar nada. */
  pptAviso() {
    var e = document.getElementById('ig-ppt-exportar');
    if (!e) return Promise.resolve('NO EXISTE');
    e.click();
    return new Promise(function(res){ setTimeout(function(){
      var ov = document.getElementById('ig-ppt-aviso-ov');
      var tx = document.getElementById('ig-ppt-aviso-txt');
      res({ abierto: !!ov && ov.classList.contains('open'),
            texto: tx ? (tx.textContent||'').trim() : null,
            nombraElNombre: tx ? (tx.textContent||'').indexOf('nombre') > -1 : null,
            botones: Array.prototype.map.call(
              document.querySelectorAll('#ig-ppt-aviso-ov button'),
              function(b){ var r = b.getBoundingClientRect();
                return (b.textContent||'').trim() + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) }) });
    }, 400) }) },

  /* «Volver y tapar» NO genera nada. */
  pptVolver() {
    var b = document.getElementById('ig-ppt-volver');
    if (!b) return 'NO EXISTE';
    b.click();
    var ov = document.getElementById('ig-ppt-aviso-ov');
    return { abierto: !!ov && ov.classList.contains('open'),
             res: (function(){ var e = document.getElementById('ig-ppt-res');
               return e ? (e.textContent||'').trim() : 'NO EXISTE' })() } },

  /* «Exportar igual» SI genera. Devuelve el texto del resultado. */
  pptExportar() {
    var e = document.getElementById('ig-ppt-exportar');
    if (!e) return Promise.resolve('NO EXISTE');
    e.click();
    return new Promise(function(res){ setTimeout(function(){
      var sg = document.getElementById('ig-ppt-seguir');
      if (sg) sg.click();
      /* El armado lee 24 dataURL de IndexedDB, quema las tapas en canvas y comprime el zip. */
      var t0 = Date.now();
      var mirar = function(){
        var r = document.getElementById('ig-ppt-res');
        var txt = r ? (r.textContent||'').trim() : '';
        if (txt.indexOf('PPT generado') === 0 || txt.indexOf('No se pudo') === 0 ||
            txt.indexOf('Ninguna') === 0 || Date.now() - t0 > 45000) {
          res({ res: txt, ms: Date.now() - t0,
                avisoCerrado: (function(){ var o = document.getElementById('ig-ppt-aviso-ov');
                  return !(o && o.classList.contains('open')) })() });
          return;
        }
        setTimeout(mirar, 400);
      };
      mirar();
    }, 400) }) },
  /* ── EL ESQUEMA DE LA OREJUELA y la funcion comun (commit 5) ──────────────────────────────
     Se abre la pestania ETE por su boton real, se cargan los cuatro campos con gestos de verdad
     y se mide: que el dibujo salga, que NO juzgue, que se guarde SOLO, que haya UNA sola copia y
     que se actualice al cambiar un dato. Y los dos controles: que un estudio reabierto NO reciba
     un esquema que nadie pidio, y que los slots del estudio no se toquen. */
  esqAbrir() {
    try { showTab('ete') } catch(e) {
      try { document.querySelectorAll('.tab-section').forEach(function(x){ x.classList.remove('active') });
            var t = document.getElementById('tab-ete'); if (t) t.classList.add('active') } catch(e2){}
    }
    /* La seccion de la orejuela es un acordeon: sin abrirla, su contenido no tiene caja y la
       geometria da 0x0 sobre un dibujo que si se pinta. */
    try { if (typeof toggleEteSeccion === 'function') toggleEteSeccion('oai') } catch(e) {}
    var sec = document.getElementById('ete-seccion-oai');
    if (sec && getComputedStyle(sec).display === 'none') sec.style.display = 'block';
    return { seccion: !!sec && getComputedStyle(sec).display !== 'none',
             caja: (function(){ var c = document.getElementById('oai-esq-caja');
               return c ? getComputedStyle(c).display : 'NO EXISTE' })(),
             medidor: !!document.getElementById('oai-esq-tmp') } },

  esqPoner(campos) {
    var out = {};
    Object.keys(campos).forEach(function(k){
      var e = document.getElementById(k);
      if (!e) { out[k] = 'NO EXISTE'; return }
      e.value = String(campos[k]);
      e.dispatchEvent(new Event('input', { bubbles:true }));
      e.dispatchEvent(new Event('change', { bubbles:true }));
      out[k] = e.value;
    });
    return out },

  esqMirar() {
    var caja = document.getElementById('oai-esq-caja');
    var cont = document.getElementById('oai-esq');
    var svg = cont ? cont.querySelector('svg') : null;
    var txt = svg ? (svg.textContent || '') : '';
    return { cajaVisible: caja ? getComputedStyle(caja).display !== 'none' : 'NO EXISTE',
             haySvg: !!svg,
             siluetas: svg ? svg.querySelectorAll('path[stroke-linejoin]').length : 0,
             textos: txt.replace(/\u00a0/g,' ').trim(),
             juzga: /apta|no apta|elegib|Watchman|Amulet|contraindic/i.test(txt),
             ancho: (function(){ var r = cont ? cont.getBoundingClientRect() : null;
               return r ? Math.round(r.width) : null })(),
             alto: (function(){ var r = cont ? cont.getBoundingClientRect() : null;
               return r ? Math.round(r.height) : null })(),
             estado: (function(){ var e = document.getElementById('oai-esq-estado');
               return e ? (e.textContent||'').trim() : 'NO EXISTE' })() } },

  esqEsperarGuardado(uuid) {
    return new Promise(function(res){ setTimeout(function(){
      if (typeof CeiboImg === 'undefined' || !CeiboImg.esquemas) return res('NO EXISTE');
      Promise.all([CeiboImg.esquemas(uuid), CeiboImg.leer(uuid), CeiboImg.uso()])
        .then(function(rs){
          var es = rs[0] || [];
          res({ esquemas: es.length,
                claves: es.map(function(e){ return e.clave }),
                nombres: es.map(function(e){ return e.nombre }),
                prefijo: es.length ? String(es[0].dataURL).slice(0,23) : null,
                chars: es.length ? String(es[0].dataURL).length : 0,
                marcado: es.length ? !!es[0].esquema : null,
                slots: (rs[1] || []).length,
                uso: rs[2],
                estado: (function(){ var e = document.getElementById('oai-esq-estado');
                  return e ? (e.textContent||'').trim() : 'NO EXISTE' })() });
        });
    }, 1600) }) },

  esqUnaSolaCopia(uuid) {
    var set = function(id, v){ var e = document.getElementById(id); if (!e) return;
      e.value = String(v); e.dispatchEvent(new Event('input', { bubbles:true })) };
    set('oai_profundidad', '30');
    return new Promise(function(res){ setTimeout(function(){
      set('oai_profundidad', '31');
      setTimeout(function(){
        CeiboImg.esquemas(uuid).then(function(es){
          var cont = document.getElementById('oai-esq');
          var svg = cont ? cont.querySelector('svg') : null;
          res({ esquemas: es.length, claves: es.map(function(e){ return e.clave }),
                enPantalla: svg ? (svg.textContent||'').trim() : null,
                chars: es.length ? String(es[0].dataURL).length : 0 });
        });
      }, 1800);
    }, 1800) }) },

  esqAlReabrir(uuid) {
    if (typeof imgRestaurar !== 'function') return Promise.resolve('NO EXISTE');
    var antes = null, ts0 = null;
    return CeiboImg.esquemas(uuid).then(function(es){
      antes = es.length; ts0 = es.length ? es[0].ts : null;
      try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch(e) {}
      var set = function(id, v){ var e = document.getElementById(id); if (e) e.value = String(v) };
      set('oai_morfologia','cactus'); set('oai_ostium_diam','22'); set('oai_profundidad','28');
      try { if (typeof calcOAI === 'function') calcOAI() } catch(e) {}
      try { if (typeof _recalcModulos === 'function') _recalcModulos() } catch(e) {}
      return new Promise(function(res){ setTimeout(function(){
        CeiboImg.esquemas(uuid).then(function(es2){
          var cont = document.getElementById('oai-esq');
          var svg = cont ? cont.querySelector('svg') : null;
          res({ antes: antes, despues: es2.length,
                tsAntes: ts0, tsDespues: es2.length ? es2[0].ts : null,
                escribio: es2.length !== antes || (es2.length && ts0 && es2[0].ts !== ts0),
                pintoEnPantalla: !!svg,
                textoEnPantalla: svg ? (svg.textContent||'').trim().slice(0,80) : null });
        });
      }, 1600) });
    }) },
  /* ── LAS CUATRO SUPERFICIES FIRMADAS CON LA OREJUELA CARGADA ──────────────────────────────
     ⚠️ ES EL DENOMINADOR DEL COMMIT 5, Y SIN EL EL A/B GENERAL NO PRUEBA NADA: ninguna de las
     132 escenas de _probe_yab.mjs carga la orejuela, asi que su «cero diferencias» sobre el
     esquema es un control NEGATIVO. Aca se carga la orejuela, se deja que el esquema se guarde,
     y se miden el informe en sus tres estilos, el EN SUMA, las columnas del Excel y los campos.
     Contra HEAD tienen que salir IDENTICOS: el esquema no es un slot y no llega al papel. */
  esqSuperficies() {
    var inf = function(est){
      try { if (typeof setEstiloInforme === 'function') setEstiloInforme(est) } catch(e){}
      try { if (typeof generarInforme === 'function') generarInforme() } catch(e){ return 'EXC' }
      return (document.getElementById('informe_texto') || {}).value || '' };
    var campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(e){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return } catch(x){}
      campos[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || '') });
    /* ⚠️ EL FILTRO VA TAMBIEN EN EL BUCLE DE LAS CASILLAS, y la primera version de esta sonda
       no lo tenia: guardarInforme lo aplica a los DOS barridos, asi que sin el la sonda
       contaba ig-ppt-on__chk -la casilla «Armar PPT», que _noEsDelEstudio excluye por su
       prefijo ig-- y reportaba un campo guardado nuevo que la app no guarda. Un falso
       positivo de censo, que es justo lo que esta medicion esta para evitar. */
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(e){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return } catch(x){}
      campos[e.id + '__chk'] = e.checked ? '1' : '0' });
    var fila = 'SIN _labExcelRow';
    try { if (typeof _labExcelRow === 'function')
      fila = _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-29', campos: campos }) } catch(e) { fila = 'EXC' }
    var est = inf('estandar'), con = inf('conciso'), nar = inf('narrativo');
    inf('estandar');
    return { estandar: est, conciso: con, narrativo: nar,
             suma: (document.getElementById('en_suma') || {}).value || '',
             excelN: (fila && typeof fila === 'object') ? Object.keys(fila).length : fila,
             excelFila: fila,
             camposN: Object.keys(campos).length,
             /* El denominador del denominador: que la orejuela ESTE cargada. Sin esto, comparar
                dos informes de normalidad no distingue nada. */
             denom: { morf: (document.getElementById('oai_morfologia')||{}).value || '',
                      ostium: (document.getElementById('oai_ostium_diam')||{}).value || '',
                      prof: (document.getElementById('oai_profundidad')||{}).value || '',
                      vel: (document.getElementById('oai_vel_vac')||{}).value || '',
                      nombraOrejuela: /orejuela/i.test(est) } } },
  /* ── Que borrar un estudio se lleva sus imagenes (punto 2e) ─────────────────────────────── */
  borrarEstudio() {
    var ests;
    try { ests = getInformes() } catch(e) { return Promise.resolve({ err:'sin lista' }) }
    if (!ests.length) return Promise.resolve({ err:'sin estudios' });
    var victima = ests[0], u = victima.uuid;
    return CeiboImg.leer(u).then(function(antes){
      var resto = ests.filter(function(i){ return i.id !== victima.id });
      return CeiboStore.setLocal(resto).then(function(){
        return Promise.resolve(imgRecolectarHuerfanas()).then(function(n){
          return CeiboImg.leer(u).then(function(desp){
            return { uuid: u, imagenesAntes: antes ? antes.length : null,
                     recolectados: n, imagenesDespues: desp ? desp.length : null,
                     registroBorrado: desp === null };
          });
        });
      });
    }) }
};
`;

function conReloj(p, nombre, ms) {
  return Promise.race([p,
    new Promise((_, no) => setTimeout(() => no(new Error('TIMEOUT ' + (ms/1000) + 's en ' + nombre)), ms))]);
}

async function main() {
  const antes = await md5(join(RAIZ, 'index.html'));
  const nEst = parseInt(arg('--estudios') || '110', 10);
  const nImg = parseInt(arg('--imgs') || '15', 10);

  const { srv, port } = await servir();
  const { proc, perfil, wsUrl } = await abrirChrome(`http://127.0.0.1:${port}/${FILE}`);
  const cdp = await conectar(wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const t = targetInfos.find((x) => x.type === 'page' && x.url.includes('127.0.0.1'));
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  /* LAS DESCARGAS VAN A UN DIRECTORIO PROPIO, para poder abrir el .pptx y mirar adentro: un PPT
     que se genera y no se verifica es una salida nueva de la que sabemos que no tiro una
     excepcion, nada mas. */
  const DESC = await mkdtemp(join(tmpdir(), 'ecosmart-img2-desc-'));
  try { await cdp.send('Browser.setDownloadBehavior',
    { behavior: 'allow', downloadPath: DESC, eventsEnabled: true }); }
  catch (e) { try { await cdp.send('Page.setDownloadBehavior',
    { behavior: 'allow', downloadPath: DESC }, sessionId); } catch (e2) {} }
  const errores = [];
  await cdp.send('Log.enable', {}, sessionId).catch(() => {});

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
      const l = await ev('JSON.stringify(window.__I2.listo())', 'listo', 20000);
      if (JSON.parse(l).listo) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  const out = { archivo: FARG, md5_index_antes: antes,
                listo: JSON.parse(await ev('JSON.stringify(window.__I2.listo())', 'listo')),
                parametros: { estudios: nEst, imgs: nImg } };

  out.siembra = await paso('siembra', J(`window.__I2.sembrar(${nEst}, ${nImg})`), 600000);
  out.entrar  = await paso('entrar a Guardados', J('window.__I2.entrar()'), 60000);
  out.botonesEnInformes = await paso('botones en la vista informes', J('window.__I2.botones()'), 30000);
  out.aImagenes = await paso('cambiar a imagenes', J('window.__I2.cambiar("img")'), 30000);
  out.botonesEnImagenes = await paso('botones en la vista imagenes', J('window.__I2.botones()'), 30000);
  out.indice  = await paso('CeiboImg.indice', J('window.__I2.indice()'), 60000);
  out.costo   = await paso('costo del pintado', J('window.__I2.costo()'), 60000);
  out.pagina  = await paso('la pagina', J('window.__I2.pagina()'), 30000);
  out.abrirMes = await paso('abrir el primer mes', J('window.__I2.abrirMes(0)'), 60000);
  out.paginaConMes = await paso('la pagina con un mes abierto', J('window.__I2.pagina()'), 30000);
  out.visor = await paso('abrir el visor', J('window.__I2.abrirVisor(0)'), 60000);
  out.cerrarVisor = await paso('cerrar el visor', J('window.__I2.cerrarVisor()'), 30000);

  out.filtros = {};
  out.filtros.buscador = await paso('buscador', J('window.__I2.filtro("ig-buscar","Siembra 7 ")'), 30000);
  out.filtros.limpiar1 = await paso('limpiar', J('window.__I2.limpiar()'), 30000);
  out.filtros.fecha    = await paso('fecha desde', J('window.__I2.filtro("ig-fecha-desde","2026-06-01")'), 30000);
  out.filtros.limpiar2 = await paso('limpiar', J('window.__I2.limpiar()'), 30000);
  out.filtros.interes  = await paso('casos de interes', J('window.__I2.filtro("filtro-interes","si")'), 30000);
  out.filtros.limpiar3 = await paso('limpiar', J('window.__I2.limpiar()'), 30000);
  out.filtros.feviSel  = await paso('filtro clinico FEVI', J('window.__I2.filtro("filtro-fevi","lt40")'), 30000);
  out.filtros.limpiar4 = await paso('limpiar', J('window.__I2.limpiar()'), 30000);
  /* EL NUMERICO: la casilla y el valor, que es la cadena LARGA. */
  out.filtros.numOn    = await paso('numerico on', J('window.__I2.filtro("adv-fevi-lt-on",true)'), 30000);
  out.filtros.numVal   = await paso('numerico valor', J('window.__I2.filtro("adv-fevi-lt","40")'), 30000);
  out.filtros.limpiar5 = await paso('limpiar', J('window.__I2.limpiar()'), 30000);
  out.filtros.tras     = await paso('la pagina tras limpiar', J('window.__I2.filtro("ig-buscar","")'), 30000);

  /* ── El esquema de la orejuela (commit 5) ──────────────────────────────────────────────────
     Va antes de la estrella y del PPT: usa el estudio sembrado 0 como estudio abierto. */
  out.esqAbrir = await paso('abrir la seccion de la orejuela', J('window.__I2.esqAbrir()'), 30000);
  out.esqVacio = await paso('el esquema sin datos', J('window.__I2.esqMirar()'), 20000);
  out.esqPonerUuid = await paso('poner el estudio sembrado como actual',
    J('(function(){ _imgUuidActual = "sem-10000"; try{ localStorage.setItem("cfg-guardar-imagenes","1") }catch(e){} return { uuid: _imgUuidActual, activo: imgGuardadoActivo() } })()'), 20000);
  out.esqPoner = await paso('cargar los cuatro campos',
    J('window.__I2.esqPoner({ oai_morfologia:"ala", oai_ostium_diam:"21", oai_profundidad:"26", oai_vel_vac:"48" })'), 30000);
  out.esqMirar = await paso('mirar el dibujo', J('window.__I2.esqMirar()'), 20000);
  out.esqGuardado = await paso('el esquema en disco', J('window.__I2.esqEsperarGuardado("sem-10000")'), 60000);
  out.esqMorfologias = await paso('las cuatro morfologias', `(function(){
    var out = {};
    ['ala','coliflor','cactus','veleta'].forEach(function(m){
      var e = document.getElementById('oai_morfologia');
      e.value = m; e.dispatchEvent(new Event('change', { bubbles:true }));
      var r = window.__I2.esqMirar();
      out[m] = { siluetas: r.siluetas, juzga: r.juzga, textos: r.textos.slice(0,70) };
    });
    return JSON.stringify(out);
  })()`, 30000);
  out.esqSuperficies = await paso('las cuatro superficies con la orejuela cargada',
    J('window.__I2.esqSuperficies()'), 90000);
  out.esqUnaCopia = await paso('una sola copia', J('window.__I2.esqUnaSolaCopia("sem-10000")'), 60000);
  out.esqAlReabrir = await paso('CONTROL: reabrir no escribe', J('window.__I2.esqAlReabrir("sem-10000")'), 60000);

  /* ── La estrella de imagen (commit 3) ───────────────────────────────────────────────────── */
  out.estrella = await paso('marcar la primera imagen', J('window.__I2.estrella(0)'), 60000);
  out.nota = await paso('escribir la nota', J('window.__I2.nota(0, "Chorro excentrico de prueba")'), 60000);
  out.filtroStar = await paso('filtro de la columna derecha', J('window.__I2.filtroCol("star")'), 30000);
  out.filtroTodas = await paso('volver a todas', J('window.__I2.filtroCol("all")'), 30000);
  out.sobrevive = await paso('la marca sobrevive a guardar el estudio',
    J('window.__I2.sobreviveAlGuardado(document.querySelector("#ig-img-lista .ig-img-th").dataset.igUuid, parseInt(document.querySelector("#ig-img-lista .ig-img-th").dataset.igIdx,10))'), 60000);
  out.desmarcar = await paso('desmarcar borra la nota', J('window.__I2.desmarcar(0)'), 60000);

  /* ── El armado del PPT (commit 4) ───────────────────────────────────────────────────────── */
  out.pptPrender = await paso('prender el armado', J('window.__I2.pptPrender()'), 30000);
  out.pptElegir = await paso('elegir 5 en orden inverso', J('window.__I2.pptElegir(5)'), 60000);
  out.pptReordenar = await paso('reordenar y sacar', J('window.__I2.pptReordenar()'), 30000);
  out.pptTapar = await paso('tapar datos', J('window.__I2.pptTapar()'), 60000);
  out.pptAviso = await paso('el aviso previo', J('window.__I2.pptAviso()'), 30000);
  out.pptVolver = await paso('volver y tapar', J('window.__I2.pptVolver()'), 30000);
  /* El LIMITE: se eligen hasta el tope y se intenta una mas. */
  /* La seleccion se SUELTA antes de medir el tope: los pasos anteriores dejaron elegidas y
     «2 de 24» no prueba un limite de 24. */
  out.pptSoltar = await paso('soltar la seleccion',
    J('(function(){ var c=document.getElementById("ig-ppt-on"); c.checked=false; c.dispatchEvent(new Event("change",{bubbles:true})); return window.__I2.pptPrender() })()'), 30000);
  out.pptHastaElTope = await paso('elegir hasta el tope', J('window.__I2.pptElegir(26)'), 120000);
  out.pptLimite = await paso('una mas por encima del tope', J('window.__I2.pptLimite()'), 30000);
  out.pptExportar = await paso('exportar de verdad', J('window.__I2.pptExportar()'), 120000);

  out.borrarEstudio = await paso('borrar un estudio', J('window.__I2.borrarEstudio()'), 60000);
  out.aInformes = await paso('volver a informes', J('window.__I2.cambiar("inf")'), 30000);
  out.botonesAlVolver = await paso('botones al volver', J('window.__I2.botones()'), 30000);

  /* ── EL ARCHIVO, ABIERTO DE VERDAD ────────────────────────────────────────────────────────
     Se lista el zip y se lee el XML de la primera diapositiva: se cuenta cuantas diapositivas
     tiene, cuantas imagenes embebio y -lo que importa- que NINGUN nombre de paciente aparezca
     en ningun XML del archivo. */
  out.archivoPpt = (() => {
    try {
      const nombres = readdirSync(DESC).filter(f => f.endsWith('.pptx'));
      if (!nombres.length) return { err: 'no se descargo ningun .pptx', dir: DESC,
                                    hay: readdirSync(DESC) };
      const f = join(DESC, nombres[0]);
      const bytes = statSync(f).size;
      const lista = execFileSync('unzip', ['-Z1', f], { encoding: 'utf8' }).trim().split('\n');
      const slides = lista.filter(x => /^ppt\/slides\/slide\d+\.xml$/.test(x));
      const medios = lista.filter(x => x.startsWith('ppt/media/'));
      let textos = [];
      for (const sl of slides) {
        const xml = execFileSync('unzip', ['-p', f, sl], { encoding: 'utf8' });
        const m = xml.match(/<a:t>([^<]*)<\/a:t>/g) || [];
        textos = textos.concat(m.map(x => x.replace(/<\/?a:t>/g, '')));
      }
      /* El censo de fuga: los nombres que la siembra uso. Si alguno aparece en cualquier XML del
         archivo, el PPT esta publicando el paciente. */
      let fuga = [];
      /* `[Content_Types].xml` se SALTA: `unzip -p` trata los corchetes como patron glob y falla
         con «filename not matched», que tiraba el bloque entero. No lleva texto de contenido. */
      for (const parte of lista.filter(x => x.endsWith('.xml') && x.indexOf('[') < 0)) {
        const xml = execFileSync('unzip', ['-p', f, parte], { encoding: 'utf8' });
        if (/Siembra \d+/.test(xml)) fuga.push(parte);
      }
      return { nombre: nombres[0], bytes, nombraPaciente: /Siembra/.test(nombres[0]),
               diapositivas: slides.length, medios: medios.length,
               textos: [...new Set(textos)].slice(0, 40),
               xmlConNombreDePaciente: fuga };
    } catch (e) { return { err: e.message }; }
  })();

  const despues = await md5(join(RAIZ, 'index.html'));
  out.md5_index_despues = despues;
  out.index_intacto = antes === despues;
  console.log(JSON.stringify(out, null, 2));
  console.log('__CIERRE_OK__');
  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  try { await rm(DESC, { recursive: true, force: true }); } catch {}
  process.exit(0);
}
main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
