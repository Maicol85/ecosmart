#!/usr/bin/env node
/**
 * _probe_img1.mjs — COMMIT 1 de la tanda IMAGENES (2026-10-29). SOLO LECTURA sobre index.html.
 *
 * Dos partes, las dos del punto 1 de la orden:
 *
 *   --censo   (1a) DONDE y COMO se guardan hoy las imagenes de un estudio, que mide exactamente
 *                  la barra de memoria de Guardados, cuantas imagenes y videos tiene un estudio
 *                  tipico, si hay imagenes SIN estudio, que hace la tira de miniaturas al abrir
 *                  un estudio y cuales son los filtros actuales de Guardados.
 *   --perf    (1b) SONDA DE RENDIMIENTO REUTILIZABLE: siembra un conjunto sintetico de estudios
 *                  con imagenes y mide el tiempo de abrir una pantalla que las lista TODAS y la
 *                  memoria usada, para fijar el presupuesto del commit 2. Se vuelve a correr
 *                  sobre el arbol final en el commit 6.
 *
 *   node scripts/_probe_img1.mjs --censo
 *   node scripts/_probe_img1.mjs --perf --estudios 110 --imgs 15
 *   node scripts/_probe_img1.mjs                       (las dos)
 *
 * ENTORNO DE PRUEBA, NUNCA EL ALMACENAMIENTO DEL MEDICO: Chrome arranca con un
 * `--user-data-dir` temporal propio, asi que su IndexedDB nace vacia y se borra al salir. La
 * siembra escribe SOLO ahi. Comprueba el md5 de index.html al principio y al final.
 *
 * ⚠️ T1: cada paso va con reloj explicito y try/catch que devuelve el error, no una promesa
 * dormida — la trampa del `page.evaluate` sin timeout que la tanda B pago con una hora y cuarto.
 *
 * Infraestructura (servidor + Chrome + CDP + barrido de procesos por PID propio) calcada de
 * scripts/_probe_guardados.mjs.
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-img1-'));
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
window.__I1 = {
  listo() {
    var faltan = ['getInformes','imgStorageRender','igPintar','igFiltrar','aplicarFiltros',
                  '_imgComprimir','imgRender','cineStripRender','imgRecolectarHuerfanas']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (faltan.length) return { listo:false, faltan:faltan };
    if (typeof CeiboImg === 'undefined') return { listo:false, por:'sin CeiboImg' };
    if (!document.getElementById('ig-lista')) return { listo:false, por:'sin ig-lista' };
    return { listo:true } },

  /* ── 1a-1 · LAS BASES, MEDIDAS Y NO LEIDAS DEL CODIGO ──────────────────────────────────────
     Se preguntan al navegador con indexedDB.databases() y se abre cada una en readonly para
     leer el keyPath y los indices de cada store. Leerlo del fuente diria lo que el fuente
     declara; esto dice lo que hay. */
  bases() {
    if (!indexedDB.databases) return Promise.resolve('SIN indexedDB.databases()');
    return indexedDB.databases().then(function(ds){
      return Promise.all(ds.map(function(d){
        return new Promise(function(res){
          var t = setTimeout(function(){ res({ nombre:d.name, ver:d.version, err:'timeout 5s' }) }, 5000);
          var rq;
          try { rq = indexedDB.open(d.name) } catch(e) { clearTimeout(t); return res({ nombre:d.name, err:'EXC '+e.message }) }
          rq.onerror = function(){ clearTimeout(t); res({ nombre:d.name, ver:d.version, err:'no abrio' }) };
          rq.onsuccess = function(){
            clearTimeout(t);
            var db = rq.result, stores = [];
            try {
              var nombres = Array.prototype.slice.call(db.objectStoreNames);
              var tx = nombres.length ? db.transaction(nombres, 'readonly') : null;
              var pend = nombres.map(function(n){
                return new Promise(function(ok){
                  var os = tx.objectStore(n);
                  var info = { store:n, keyPath:os.keyPath,
                               indices: Array.prototype.slice.call(os.indexNames) };
                  var q = os.count();
                  q.onsuccess = function(){ info.registros = q.result; ok(info) };
                  q.onerror   = function(){ info.registros = 'err'; ok(info) };
                });
              });
              Promise.all(pend).then(function(ss){
                db.close(); res({ nombre:d.name, ver:db.version, stores:ss });
              });
              return;
            } catch(e) { db.close(); return res({ nombre:d.name, ver:d.version, err:'EXC '+e.message }) }
          };
        });
      }));
    });
  },

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
    var src = window.__I1._fuente(1);
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
        for (var j = 0; j < nImg; j++) fuentes.push(window.__I1._fuente(k * 1000 + j));
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

  /* ── 1a-3 · QUE MIDE LA BARRA DE MEMORIA, exactamente ───────────────────────────────────────
     Se prende el toggle —con el guardado apagado la barra se vacia a proposito— y se lee el
     texto que queda en pantalla, junto con los tres numeros que la alimentan. El punto es poder
     decir de DONDE sale el 5,2 MB que el medico ve. */
  barra() {
    try { localStorage.setItem('cfg-guardar-imagenes', '1') } catch(e) {}
    return Promise.all([CeiboImg.uso(), CeiboImg.cuota(),
                        (typeof CeiboCine !== 'undefined' && CeiboCine.uso) ? CeiboCine.uso() : Promise.resolve(null),
                        (typeof CeiboVideo !== 'undefined' && CeiboVideo.uso) ? CeiboVideo.uso() : Promise.resolve(null)])
      .then(function(rs){
        imgStorageRender();
        return new Promise(function(res){ setTimeout(function(){
          var c = document.getElementById('ig-img-storage');
          var det = document.getElementById('ig-stor-det');
          res({ usoImg: rs[0], cuotaOrigen: rs[1], usoCine: rs[2], usoVideo: rs[3],
                textoBarra: c ? (c.textContent || '').trim() : 'SIN #ig-img-storage',
                textoDetalle: det ? (det.textContent || '').trim() : 'SIN #ig-stor-det',
                /* Lo que la barra llama «usados» es la cuota del ORIGEN entero
                   (navigator.storage.estimate), no los bytes de las imagenes. */
                mbQueLaBarraDice: rs[1] ? Math.round((rs[1].usado||0)/1048576*10)/10 : null,
                mbSoloImagenes: Math.round((rs[0].bytes||0)/1048576*10)/10 });
        }, 350) });
      });
  },

  /* ── 1a-4 · IMAGENES SIN ESTUDIO, en las tres bases ────────────────────────────────────────
     Un registro cuyo uuid no esta en getInformes() es huerfano. Se CUENTA, no se borra. */
  huerfanas() {
    var vivos = {};
    try { getInformes().forEach(function(i){ if (i && i.uuid) vivos[i.uuid] = 1 }) } catch(e) {}
    var leer = function(base, store, campoUuid) {
      return new Promise(function(res){
        var t = setTimeout(function(){ res({ base:base, err:'timeout' }) }, 5000);
        var rq;
        try { rq = indexedDB.open(base) } catch(e) { clearTimeout(t); return res({ base:base, err:'EXC' }) }
        rq.onerror = function(){ clearTimeout(t); res({ base:base, err:'no abrio' }) };
        rq.onsuccess = function(){
          clearTimeout(t);
          var db = rq.result;
          if (!db.objectStoreNames.contains(store)) { db.close(); return res({ base:base, err:'sin store' }) }
          var q = db.transaction([store],'readonly').objectStore(store).getAll();
          q.onsuccess = function(){
            var rs = q.result || [], h = [];
            rs.forEach(function(r){ var u = campoUuid ? r[campoUuid] : r.uuid;
              if (!vivos[u]) h.push(u) });
            db.close();
            res({ base:base, store:store, registros:rs.length,
                  huerfanos:h.length, uuidsHuerfanos:h.slice(0,8) });
          };
          q.onerror = function(){ db.close(); res({ base:base, err:'no leyo' }) };
        };
      });
    };
    return Promise.all([leer('ceibomed_img','imagenes',null),
                        leer('ceibomed_video','videos','uuid'),
                        leer('ceibomed_cine','cineloops','uuid')]).then(function(rs){
      return { estudiosVivos: Object.keys(vivos).length, bases: rs,
               /* Quien recolecta y quien NO: lo unico que importa para la pregunta 2e. */
               recolectores: { img: typeof imgRecolectarHuerfanas === 'function',
                               cine: typeof cineRecolectarHuerfanos === 'function',
                               video: (typeof CeiboVideo !== 'undefined' &&
                                       typeof CeiboVideo.recolectar === 'function') } };
    });
  },

  /* ── 1a-5 · LA TIRA DE MINIATURAS al abrir un estudio ──────────────────────────────────────
     cineStripRender lee DOS fuentes —los slots en pantalla y los registros de disco— y
     deduplica por id. Se mide con un estudio sembrado puesto como actual. */
  tira(uuid) {
    try { _imgUuidActual = uuid || null } catch(e) {}
    var strip = document.getElementById('cine-strip');
    return Promise.resolve(cineStripRender()).then(function(){
      return new Promise(function(res){ setTimeout(function(){
        res({ existe: !!strip,
              hijos: strip ? strip.children.length : null,
              texto: strip ? (strip.textContent || '').trim().slice(0, 220) : null,
              uuidActual: (function(){ try { return _imgUuidActual } catch(e){ return 'EXC' } })(),
              slotsEnPantalla: (function(){ try {
                return (imgSlots || []).filter(function(s){ return !!s }).length } catch(e){ return 'EXC' } })() });
      }, 600) });
    });
  },


  /* ── 1a-5b · LA TIRA POR EL CAMINO REAL: imgRestaurar ─────────────────────────────────────
     La medicion de arriba la pone a mano; esta entra por el embudo que usa la app al abrir un
     estudio guardado, que es el que ademas repuebla los slots y encadena videoRestaurar y
     medFijasRestaurar. Es la diferencia entre medir la funcion y medir el flujo. */
  tiraReal(uuid) {
    try { _imgUuidActual = uuid } catch(e) {}
    return Promise.resolve(imgRestaurar(uuid)).then(function(){
      return new Promise(function(res){ setTimeout(function(){
        var strip = document.getElementById('cine-strip');
        var grid  = document.getElementById('img-grid');
        res({ slotsLlenos: (function(){ try { return (imgSlots||[]).filter(function(s){ return !!s }).length } catch(e){ return 'EXC' } })(),
              slotsTotal:  (function(){ try { return (imgSlots||[]).length } catch(e){ return 'EXC' } })(),
              gridHijos: grid ? grid.children.length : null,
              tiraHijos: strip ? strip.children.length : null,
              tiraTexto: strip ? (strip.textContent||'').trim().slice(0,200) : null });
      }, 900) });
    });
  },

  /* ── 1a-4b · HUERFANOS DE VIDEO, MEDIDOS Y NO DEDUCIDOS ───────────────────────────────────
     Se siembra un video, se borra su estudio y se corren LOS DOS recolectores que la app tiene.
     Lo que quede es lo que un borrado de estudio deja en disco para siempre. No se borra nada:
     se cuenta. */
  videoHuerfano() {
    if (typeof CeiboVideo === 'undefined') return Promise.resolve({ err:'sin CeiboVideo' });
    var u = 'sem-video-01';
    var blob = new Blob([new Uint8Array(32768)], { type:'video/mp4' });
    var ests = [{ id: 990001, uuid: u, nombre:'Siembra video (prueba)', ci:'5999999',
                  fecha_estudio:'2026-10-01', fecha_guardado:'2026-10-29T10:00:00.000Z', campos:{} }];
    return CeiboStore.setLocal(ests)
      .then(function(){ return CeiboVideo.guardar(u, [{ id:'v1', nombre:'v.mp4', tipo:'video/mp4',
                                                        bytes: 32768, blob: blob }]) })
      .then(function(ok){
        return CeiboVideo.uso().then(function(antes){
          return CeiboStore.setLocal([]).then(function(){
            return Promise.resolve(imgRecolectarHuerfanas()).then(function(nImg){
              return Promise.resolve(cineRecolectarHuerfanos()).then(function(nCine){
                return CeiboVideo.uso().then(function(desp){
                  return { guardado: ok, usoAntes: antes, recolectadosImg: nImg,
                           recolectadosCine: nCine, usoDespues: desp,
                           sobrevive: (desp && desp.n > 0) };
                });
              });
            });
          });
        });
      });
  },
  /* ── 1a-6 · LOS FILTROS DE HOY, uno por uno y por su id ────────────────────────────────────
     Se separan los que relee igFiltrar de los que aplica aplicarFiltros, porque son DOS cadenas
     distintas y el commit 2 tiene que enganchar la pantalla nueva a la LARGA. */
  filtros() {
    var g = function(id){ var e = document.getElementById(id);
      return e ? { id:id, tag:e.tagName.toLowerCase(), tipo:e.type || '',
                   opciones: (e.tagName === 'SELECT')
                     ? Array.prototype.map.call(e.options, function(o){ return o.value }) : undefined }
                : { id:id, falta:true } };
    return {
      cortaIgFiltrar: ['ig-buscar','ig-fecha-desde','ig-fecha-hasta','ig-filtro-antec'].map(g),
      largaClinicos:  ['filtro-fevi','filtro-geom','filtro-diast','filtro-valv','filtro-interes'].map(g),
      largaNumericos: ['adv-fevi-lt-on','adv-fevi-lt','adv-fevi-bt-on','adv-fevi-bt1','adv-fevi-bt2',
                       'adv-fevi-gt-on','adv-fevi-gt','adv-psap-gt-on','adv-psap-gt',
                       'adv-tapse-lt-on','adv-tapse-lt','adv-valv-txt'].map(g),
      acciones: ['ig-titulo-count','ig-img-storage','ig-contador','ig-lista','ig-vacio',
                 'igio-btn-exp','igio-btn-imp'].map(g)
    };
  },

  /* ── 1a-7 · UN ESTUDIO TIPICO: cuantas imagenes y cuantos videos ───────────────────────────
     Sobre lo sembrado no dice nada nuevo, asi que lo que se reporta es el TECHO que la app
     permite y el valor por omision de la grilla, que es lo que fija el orden de magnitud. */
  tipico() {
    return { slotsPorOmision: (function(){ try { return imgSlotCount } catch(e){ return 'EXC' } })(),
             botonesDeCantidad: (function(){
               var c = document.getElementById('img-count-btns');
               return c ? Array.prototype.map.call(c.querySelectorAll('button'),
                 function(b){ return (b.textContent||'').trim() }) : null })(),
             guardadoActivo: (function(){ try { return imgGuardadoActivo() } catch(e){ return 'EXC' } })(),
             avisoMB: (typeof CINE_AVISO_MB !== 'undefined') ? CINE_AVISO_MB : null };
  },

  /* ── 1b · LA PANTALLA QUE LAS LISTA TODAS ──────────────────────────────────────────────────
     El commit 1 NO cambia index.html, asi que la pantalla todavia no existe: se monta la MISMA
     estructura que la demo aprobada —meses plegables con una grilla de miniaturas numeradas—
     sobre los datos REALES ya sembrados, en un contenedor aparte, y se mide. Dos modos:
       'todas' — las mil y pico de una vez, que es el techo del costo;
       'lazy'  — con IntersectionObserver y rootMargin, que es lo que la orden pide implementar.
     Devuelve tiempos partidos: leer la base, armar el DOM y que el navegador termine de pintar
     (dos cuadros), mas la memoria del renderer si el navegador la informa. */
  medirPantalla(modo) {
    var t0 = performance.now();
    var host = document.getElementById('__i1_host');
    if (host) host.remove();
    host = document.createElement('div');
    host.id = '__i1_host';
    host.style.cssText = 'position:absolute;left:0;top:0;width:900px;height:700px;overflow:auto;z-index:-1;opacity:0.01;';
    document.body.appendChild(host);
    return new Promise(function(res){
      var rq = indexedDB.open('ceibomed_img');
      rq.onerror = function(){ res({ err:'no abrio ceibomed_img' }) };
      rq.onsuccess = function(){
        var db = rq.result;
        var q = db.transaction(['imagenes'],'readonly').objectStore('imagenes').getAll();
        q.onerror = function(){ db.close(); res({ err:'no leyo' }) };
        q.onsuccess = function(){
          var regs = q.result || []; db.close();
          var tLeido = performance.now();
          var vivos = {};
          try { getInformes().forEach(function(i){ if (i && i.uuid) vivos[i.uuid] = i }) } catch(e) {}
          /* Agrupado por mes del ESTUDIO, igual que igMesLbl, para que el conteo de grupos sea
             el de la pantalla de verdad. */
          var grupos = new Map(), total = 0, n = 0;
          regs.forEach(function(r){
            var inf = vivos[r.uuid]; if (!inf) return;
            var k = (typeof igMesLbl === 'function') ? igMesLbl(inf.fecha_estudio) : 'Sin fecha';
            if (!grupos.has(k)) grupos.set(k, []);
            (r.imgs || []).forEach(function(s){ grupos.get(k).push({ s:s, inf:inf }); total++ });
          });
          var io = null, pintadas = 0;
          if (modo === 'lazy' && 'IntersectionObserver' in window) {
            io = new IntersectionObserver(function(es){
              es.forEach(function(e){ if (!e.isIntersecting) return;
                var d = e.target, src = d.getAttribute('data-src');
                if (src) { var im = new Image(); im.src = src; im.style.cssText='width:100%;height:100%;object-fit:cover';
                           d.appendChild(im); d.removeAttribute('data-src'); pintadas++ }
                io.unobserve(d) });
            }, { root: host, rootMargin: '120px' });
          }
          var frag = document.createDocumentFragment();
          grupos.forEach(function(items, k){
            var h = document.createElement('button'); h.type='button';
            h.textContent = k + ' (' + items.length + ')';
            frag.appendChild(h);
            var g = document.createElement('div');
            g.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:6px';
            items.forEach(function(it){
              n++;
              var d = document.createElement('div');
              d.style.cssText = 'position:relative;aspect-ratio:4/3;background:#000;overflow:hidden;border-radius:6px';
              var num = document.createElement('span'); num.textContent = n; d.appendChild(num);
              if (io) { d.setAttribute('data-src', it.s.dataURL); io.observe(d) }
              else { var im = new Image(); im.src = it.s.dataURL;
                     im.style.cssText='width:100%;height:100%;object-fit:cover'; d.appendChild(im); pintadas++ }
              g.appendChild(d);
            });
            frag.appendChild(g);
          });
          host.appendChild(frag);
          var tDom = performance.now();
          requestAnimationFrame(function(){ requestAnimationFrame(function(){
            var mem = null;
            try { if (performance.memory) mem = {
              usadoMB: Math.round(performance.memory.usedJSHeapSize/1048576*10)/10,
              totalMB: Math.round(performance.memory.totalJSHeapSize/1048576*10)/10,
              limiteMB: Math.round(performance.memory.jsHeapSizeLimit/1048576) } } catch(e) {}
            if (io) io.disconnect();
            res({ modo: modo, registros: regs.length, grupos: grupos.size,
                  miniaturas: total, nodos: n, imgCreadas: pintadas,
                  msLeerBase: Math.round(tLeido - t0),
                  msArmarDom: Math.round(tDom - tLeido),
                  msHastaPintar: Math.round(performance.now() - t0),
                  memoria: mem,
                  nodosEnDom: host.querySelectorAll('div[style]').length });
          }) });
        };
      };
    });
  },

  limpiarHost() { var h = document.getElementById('__i1_host'); if (h) h.remove(); return true }
};
`;

/* Reloj explicito por paso (T1): un `Runtime.evaluate` con `awaitPromise` sobre una promesa que
   nunca resuelve queda dormido para siempre, que es lo que la tanda B pago con una hora y
   cuarto a 0 % de CPU. Cada paso dice su nombre en el error. */
function conReloj(p, nombre, ms) {
  return Promise.race([
    p,
    new Promise((_, no) => setTimeout(() => no(new Error('TIMEOUT ' + (ms/1000) + 's en ' + nombre)), ms)),
  ]);
}

async function main() {
  const antes = await md5(join(RAIZ, 'index.html'));
  const CENSO = process.argv.includes('--censo') || (!process.argv.includes('--perf'));
  const PERF  = process.argv.includes('--perf')  || (!process.argv.includes('--censo'));
  const nEst  = parseInt(arg('--estudios') || '110', 10);
  const nImg  = parseInt(arg('--imgs') || '15', 10);

  const { srv, port } = await servir();
  const { proc, perfil, wsUrl } = await abrirChrome(`http://127.0.0.1:${port}/${FILE}`);
  const cdp = await conectar(wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const t = targetInfos.find((x) => x.type === 'page' && x.url.includes('127.0.0.1'));
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);

  const ev = async (expr, nombre = 'evaluate', ms = 60000) => {
    const r = await conReloj(cdp.send('Runtime.evaluate',
      { expression: expr, returnByValue: true, awaitPromise: true }, sessionId), nombre, ms);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'exc');
    return r.result.value;
  };
  /* Devuelve el error como DATO en vez de tirar: una parte que falla no puede llevarse el
     reporte de las otras seis. */
  const paso = async (nombre, expr, ms = 60000) => {
    const t0 = Date.now();
    try {
      const v = JSON.parse(await ev(expr, nombre, ms));
      return { ok: true, ms: Date.now() - t0, ...(v && typeof v === 'object' && !Array.isArray(v) ? { dato: v } : { dato: v }) };
    } catch (e) { return { ok: false, ms: Date.now() - t0, error: e.message }; }
  };

  for (let i = 0; i < 60; i++) {
    try { await ev(SONDA, 'inyectar sonda', 20000);
      const l = await ev('JSON.stringify(window.__I1.listo())', 'listo', 20000);
      if (JSON.parse(l).listo) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  const listo = JSON.parse(await ev('JSON.stringify(window.__I1.listo())', 'listo'));

  const out = { archivo: FARG, md5_index_antes: antes, listo,
                parametros: { censo: CENSO, perf: PERF, estudios: nEst, imgs: nImg } };

  if (CENSO) {
    out.censo = {};
    out.censo.basesVacias = await paso('bases al abrir',
      'window.__I1.bases().then(function(b){ return JSON.stringify(b) })', 30000);
    out.censo.pesoImagen = await paso('peso de una imagen',
      'window.__I1.pesoImagen().then(function(r){ return JSON.stringify(r) })', 60000);
    out.censo.filtros = await paso('filtros de Guardados',
      'JSON.stringify(window.__I1.filtros())', 20000);
    out.censo.tipico = await paso('estudio tipico',
      'JSON.stringify(window.__I1.tipico())', 20000);
    /* Una siembra CHICA para el censo: lo que se quiere saber es que escribe cada base y como
       la lee la barra, no cuanto tarda. La grande es la del perf. */
    out.censo.siembraChica = await paso('siembra 3x4',
      'window.__I1.sembrar(3, 4).then(function(r){ return JSON.stringify(r) })', 120000);
    out.censo.basesSembradas = await paso('bases con datos',
      'window.__I1.bases().then(function(b){ return JSON.stringify(b) })', 30000);
    out.censo.barra = await paso('barra de memoria',
      'window.__I1.barra().then(function(r){ return JSON.stringify(r) })', 30000);
    out.censo.tira = await paso('tira de miniaturas',
      'window.__I1.tira("sem-10000").then(function(r){ return JSON.stringify(r) })', 30000);
    out.censo.huerfanasConEstudios = await paso('huerfanas con estudios vivos',
      'window.__I1.huerfanas().then(function(r){ return JSON.stringify(r) })', 30000);
    out.censo.tiraReal = await paso('tira por imgRestaurar',
      'window.__I1.tiraReal("sem-10001").then(function(r){ return JSON.stringify(r) })', 60000);
    /* Y AHORA EL ESCENARIO QUE IMPORTA para el punto 2e: se borran los estudios y se mira que
       queda. Es el entorno de prueba, no el del medico. */
    out.censo.huerfanasSinEstudios = await paso('huerfanas tras vaciar la lista',
      `(function(){ return CeiboStore.setLocal([]).then(function(){
         return window.__I1.huerfanas() }).then(function(r){ return JSON.stringify(r) }) })()`, 30000);
    out.censo.videoHuerfano = await paso('video huerfano tras borrar el estudio',
      'window.__I1.videoHuerfano().then(function(r){ return JSON.stringify(r) })', 60000);
    out.censo.trasRecolectar = await paso('tras imgRecolectarHuerfanas',
      `(function(){ return Promise.resolve(imgRecolectarHuerfanas()).then(function(n){
         return window.__I1.huerfanas().then(function(r){ r.recolectados = n; return JSON.stringify(r) }) }) })()`, 30000);
  }

  if (PERF) {
    out.perf = {};
    out.perf.siembra = await paso(`siembra ${nEst}x${nImg}`,
      `window.__I1.sembrar(${nEst}, ${nImg}).then(function(r){ return JSON.stringify(r) })`, 600000);
    out.perf.todas = await paso('pantalla con todas',
      'window.__I1.medirPantalla("todas").then(function(r){ return JSON.stringify(r) })', 180000);
    await ev('window.__I1.limpiarHost()', 'limpiar host', 20000);
    out.perf.lazy = await paso('pantalla lazy',
      'window.__I1.medirPantalla("lazy").then(function(r){ return JSON.stringify(r) })', 180000);
    await ev('window.__I1.limpiarHost()', 'limpiar host', 20000);
    out.perf.uso = await paso('uso final',
      'CeiboImg.uso().then(function(u){ return JSON.stringify(u) })', 30000);
  }

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
