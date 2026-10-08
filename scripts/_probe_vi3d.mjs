#!/usr/bin/env node
/**
 * _probe_vi3d.mjs — sonda TEMPORAL (no es la suite) para la tanda
 * «Motor y panel del diagrama 3D del ventriculo izquierdo».
 *
 * Mide, por el CAMINO REAL DE LA UI (clic en el boton, clic en el canvas, clic en el bull's eye):
 *   A) la tarjeta «Hallazgos de motilidad» con el 3D CERRADO, para el A/B contra HEAD;
 *   B) sincronia en los DOS sentidos: canvas -> bull's eye + hallazgos + EN SUMA, y al revés;
 *   C) el panel de datos en los cinco casos de carga de P5;
 *   D) los cuatro casos de amplitud que pidio Maicol;
 *   E) apagado real del bucle (contador de cuadros) al cerrar, al cambiar de pestaña y al limpiar;
 *   F) repintado al cambiar de tema;
 *   G) maquetacion a 1200 / 768 / 390 / 360 px y tamaño tactil de los controles;
 *   H) que bullseyeDataURL (PDF y PPT) sigue dando el mismo PNG.
 *
 * CONTROL NEGATIVO incluido en cada bloque de sincronia: una escena donde el cambio NO debe
 * actuar, para probar que la sonda distingue escenarios y no dice que si a todo.
 *
 * Uso:  node scripts/_probe_vi3d.mjs            > /tmp/vi3d.json
 *       node scripts/_probe_vi3d.mjs --ver
 *
 * Infraestructura copiada de scripts/_probe_sinapaga.mjs (que la copio de test_clinico.mjs).
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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


/* La raiz se puede mover con VI3D_RAIZ, que es lo que usa el arnes de mutaciones para apuntar a
   una COPIA mutada. Sin esto habria que mutar el archivo vivo, que es una maquina de deshacer
   ediciones en silencio. */
const RAIZ = process.env.VI3D_RAIZ
  ? resolve(process.env.VI3D_RAIZ)
  : dirname(dirname(fileURLToPath(import.meta.url)));
const VER  = process.argv.includes('--ver');
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
        const p = join(RAIZ, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
        if (!p.startsWith(RAIZ)) { rq.writeHead(403).end(); return; }
        const buf = await readFile(p);
        rq.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }).end(buf);
      } catch { rq.writeHead(404).end('no'); }
    });
    srv.listen(0, '127.0.0.1', () => res({ srv, port: srv.address().port }));
  });
}
async function abrirChrome(url) {
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-vi3d-'));
  let bin = null;
  for (const c of CHROMES) { try { await readFile(c); bin = c; break; } catch {} }
  if (!bin) throw new Error('No encontre Chrome/Chromium/Edge.');
  const args = ['--remote-debugging-port=0', `--user-data-dir=${perfil}`, '--no-first-run',
                '--no-default-browser-check', '--disable-extensions', url];
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

/* ── Sonda inyectada ─────────────────────────────────────────────────────────────────────────
   OJO: el cuerpo es un template literal. Sin acentos graves adentro, ni en los comentarios. */
const SONDA = `
window.__p = {
  set(id, val) { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = val; e.dispatchEvent(new Event('input', {bubbles:true}));
    e.dispatchEvent(new Event('change', {bubbles:true})); return 1; },
  txt(id) { const e = document.getElementById(id); return e ? (e.textContent || '').replace(/\\s+/g,' ').trim() : null },
  val(id) { const e = document.getElementById(id); return e ? e.value : null },
  /* Visible de VERDAD: se sube por los ancestros. Un hijo con display normal dentro de un padre
     en display:none no tiene geometria, y mirar solo su propio style miente. */
  vis(id) { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    let n = e;
    while (n && n.nodeType === 1) { if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true; },
  caja(id) { const e = document.getElementById(id); if (!e) return null;
    const r = e.getBoundingClientRect();
    return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; },

  /* ⚠️ EL DENOMINADOR. La pestaña Contractilidad y su acordeon tienen que estar ABIERTOS o no
     hay geometria y todo mide cero pareciendo impecable. Devuelve cuantos poligonos pinto el
     bull's eye: sin filas no hay nada que contar. */
  denominador() {
    if (typeof showTab === 'function') showTab('contractilidad');
    const acc = document.getElementById('sacc-contr');
    if (acc && !acc.classList.contains('open') && typeof secToggle === 'function') secToggle('contr');
    const be = document.getElementById('contr-svg-bullseye');
    return { tab: this.vis('contr-svg-bullseye'),
             segsBullseye: be ? be.querySelectorAll('.contr-seg').length : 0,
             boton: this.vis('lv3d-btn') };
  },
  limpiar() { if (typeof limpiarCampos === 'function') limpiarCampos(true);
    if (typeof contrReset === 'function') contrReset();
    return this.denominador(); },

  /* Estado del bull's eye leido del DOM: el fill real de cada poligono, no el objeto interno.
     Es la unica forma de probar que el 3D movio la pantalla y no solo una variable. */
  fills() { const o = {};
    document.querySelectorAll('#contr-svg-bullseye [data-contrseg]').forEach(function(el){
      o[el.getAttribute('data-contrseg')] = el.getAttribute('fill'); });
    return o; },
  nFills(color) { const f = this.fills(); let n = 0;
    for (const k in f) if (f[k] === color) n++; return n; },

  abrir3d() { const b = document.getElementById('lv3d-btn'); if (!b) return 'NO EXISTE boton';
    if (!window.lv3dDiag().abierto) b.click(); return window.lv3dDiag(); },
  cerrar3d() { const b = document.getElementById('lv3d-btn'); if (!b) return 'NO EXISTE boton';
    if (window.lv3dDiag().abierto) b.click(); return window.lv3dDiag(); },

  /* Clic REAL sobre el canvas, en coordenadas de pantalla, con pointerdown + pointerup para que
     pase por el mismo camino que el dedo del medico (incluido el umbral de arrastre). */
  clicCanvas(fx, fy) {
    const cv = document.getElementById('lv3d-canvas'); if (!cv) return 'NO EXISTE canvas';
    const r = cv.getBoundingClientRect();
    if (!r.width || !r.height) return 'CANVAS SIN GEOMETRIA';
    const x = r.left + r.width*fx, y = r.top + r.height*fy;
    const o = { bubbles:true, clientX:x, clientY:y, pointerId:1, pointerType:'mouse', isPrimary:true };
    cv.dispatchEvent(new PointerEvent('pointerdown', o));
    cv.dispatchEvent(new PointerEvent('pointerup', o));
    return this.txt('lv3d-leido');
  },
  /* Clic REAL sobre un segmento del bull's eye. */
  clicBullseye(seg) {
    const el = document.querySelector('#contr-svg-bullseye [data-contrseg="' + seg + '"]');
    if (!el) return 'NO EXISTE ' + seg;
    el.dispatchEvent(new MouseEvent('click', {bubbles:true}));
    return (typeof contrEstado !== 'undefined') ? contrEstado[seg] : null;
  },

  /* Panel de datos de P5, leido como lo ve el medico. */
  panel() {
    const box = document.getElementById('lv3d-datos'); if (!box) return null;
    const celdas = [];
    box.querySelectorAll(':scope > div:first-child > div').forEach(function(c){
      const l = c.children;
      celdas.push({ campo: (l[0].textContent||'').trim(),
                    valor: (l[1].textContent||'').replace(/\\s+/g,' ').trim(),
                    org:   (l[2].textContent||'').trim() });
    });
    const notas = [];
    box.querySelectorAll(':scope > div:not(:first-child)').forEach(function(n){
      notas.push((n.textContent||'').replace(/\\s+/g,' ').trim()); });
    return { celdas: celdas, notas: notas, diag: window.lv3dDiag() };
  },

  /* ── Apagado: se cuentan CUADROS, no se cree al booleano. ──
     ⚠️ requestAnimationFrame NO dispara con document.hidden, asi que si la pestaña del navegador
     estuviera en segundo plano el contador quedaria quieto y un bucle VIVO pareceria apagado.
     Por eso se devuelve document.hidden junto al delta: sin eso la medicion no se puede leer. */
  async cuadros(ms) {
    const a = window.lv3dDiag().cuadros;
    await new Promise(function(r){ setTimeout(r, ms || 400); });
    const b = window.lv3dDiag().cuadros;
    return { delta: b - a, raf: window.lv3dDiag().raf, abierto: window.lv3dDiag().abierto,
             hidden: document.hidden };
  },

  /* Firma del dibujo: hash barato del canvas. Sirve para probar que el repintado por tema
     CAMBIO algo, y que un cambio de estado tambien. */
  firmaCanvas() {
    const cv = document.getElementById('lv3d-canvas'); if (!cv) return null;
    const c = cv.getContext('2d'); const d = c.getImageData(0,0,cv.width,cv.height).data;
    let h = 2166136261;
    for (let i=0;i<d.length;i+=997){ h ^= d[i]; h = Math.imul(h, 16777619); }
    return (h>>>0).toString(16);
  },
  /* Cuantos pixeles del canvas tienen el color de un grado de motilidad. El DENOMINADOR del
     dibujo: si da 0 en todo, el canvas esta vacio y cualquier conclusion es falsa. */
  pixelesPintados() {
    const cv = document.getElementById('lv3d-canvas'); if (!cv) return null;
    const c = cv.getContext('2d'); const d = c.getImageData(0,0,cv.width,cv.height).data;
    let n = 0;
    for (let i=3;i<d.length;i+=4) if (d[i] > 10) n++;
    return n;
  },
  /* ── ¿De que PALETA salieron los pixeles del canvas? ──
     El sombreado multiplica los tres canales por el MISMO factor (sh <= 1, sin recorte), asi que
     la RAZON r:g:b se conserva aunque el brillo cambie. Entonces se puede preguntar por el color
     de origen comparando la direccion del vector RGB, no su modulo.
     Esto es lo que distingue el verde de la app (#22C55E -> g/r 5.8) del verde de la demo
     (#58BD69 -> g/r 2.1): sin esta medicion, cambiar la paleta por la de la demo no rompe nada y
     la regla «los colores salen de CONTR_MOTILIDAD» no esta probada. */
  pixelesDeColor(hex) {
    const cv = document.getElementById('lv3d-canvas'); if (!cv) return null;
    const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex).trim());
    if (!m) return null;
    const e = [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)];
    const ne = Math.sqrt(e[0]*e[0] + e[1]*e[1] + e[2]*e[2]) || 1;
    const c = cv.getContext('2d'); const d = c.getImageData(0,0,cv.width,cv.height).data;
    let n = 0;
    for (let i=0;i<d.length;i+=4){
      if (d[i+3] < 10) continue;
      const r = d[i], g = d[i+1], b = d[i+2];
      /* Se exige brillo minimo: con canales muy chicos el redondeo mueve la razon y la medicion
         empieza a contar ruido como coincidencia. */
      if (Math.max(r,g,b) < 30) continue;
      const nv = Math.sqrt(r*r + g*g + b*b) || 1;
      if ((r*e[0] + g*e[1] + b*e[2])/(nv*ne) > 0.9995) n++;
    }
    return n;
  },
  firmaBullseyePDF() {
    if (typeof bullseyeDataURL !== 'function') return 'SIN bullseyeDataURL';
    const u = bullseyeDataURL(function(id){
      return (CONTR_MOTILIDAD[(contrEstado[id]||0)] || CONTR_MOTILIDAD[0]).color; });
    let h = 2166136261;
    for (let i=0;i<u.length;i++){ h ^= u.charCodeAt(i); h = Math.imul(h, 16777619); }
    return { largo: u.length, hash: (h>>>0).toString(16), prefijo: u.slice(0,22) };
  },
  /* Tamaño tactil de TODOS los controles del panel 3D.
     ⚠️ EL BLANCO DE UNA CASILLA ES SU LABEL, NO EL CUADRADITO. Un input dentro de un label se
     conmuta tocando el label entero, asi que medir el input da 20x20 y reporta un problema que
     el dedo no tiene. Se mide el ancestro label cuando existe; si no, el propio control. */
  tactil() {
    const p = document.getElementById('lv3d-panel'); if (!p) return null;
    const malos = [];
    p.querySelectorAll('button, input').forEach(function(el){
      const blanco = el.closest('label') || el;
      const r = blanco.getBoundingClientRect();
      if (!r.width && !r.height) return;
      if (r.width < 44 || r.height < 44)
        malos.push({ q: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ').join('.') : ''),
                     blanco: blanco.tagName.toLowerCase(),
                     w: Math.round(r.width), h: Math.round(r.height) });
    });
    const b = document.getElementById('lv3d-btn'); const rb = b ? b.getBoundingClientRect() : null;
    if (rb && (rb.width < 44 || rb.height < 44)) malos.push({ q:'#lv3d-btn', w:Math.round(rb.width), h:Math.round(rb.height) });
    return malos;
  },
  /* ¿Algun control del panel entraria al estudio o al Excel? Reproduce los DOS selectores que
     usan los seis barridos genericos. Si da 0, ninguno de los seis lo puede levantar. */
  fugaControles() {
    const p = document.getElementById('lv3d-panel'); if (!p) return null;
    return { conId: p.querySelectorAll('input[id], select[id], textarea[id]').length,
             chkConId: p.querySelectorAll('input[type=checkbox][id]').length,
             totalControles: p.querySelectorAll('input, select, textarea').length };
  },
  desborda() {
    const p = document.getElementById('lv3d-panel');
    const cv = document.getElementById('lv3d-canvas');
    const out = [];
    [['panel',p],['canvas',cv]].forEach(function(t){
      if (!t[1]) return; const r = t[1].getBoundingClientRect();
      if (r.left < -1 || r.right > window.innerWidth + 1) out.push(t[0] + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
    });
    return out;
  }
};
`;

let servidor, chrome;
try {
  const s = await servir(); servidor = s.srv;
  chrome = await abrirChrome(`http://127.0.0.1:${s.port}/index.html`);
  const cdp = await conectar(chrome.wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const page = targetInfos.find(t => t.type === 'page');
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: page.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);
  const ev = async (expr) => {
    const r = await cdp.send('Runtime.evaluate', {
      expression: `(function(){ ${expr} })()`, returnByValue: true, awaitPromise: true,
    }, sessionId);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'error en la pagina');
    return r.result.value;
  };
  await ev(`try{sessionStorage.setItem('ett_auth','1');}catch(e){} location.reload(); return 1;`);
  for (let i = 0; i < 80; i++) {
    await new Promise(r => setTimeout(r, 250));
    const listo = await ev(`return (typeof generarInforme === 'function') && !!document.getElementById('informe_texto');`).catch(() => false);
    if (listo) break;
  }
  if (!await ev(`return typeof generarInforme === 'function';`)) throw new Error('la app no cargo');
  await ev(SONDA + ' return 1;');
  await ev(`try{ if (typeof cerrarAvisoEco==='function') cerrarAvisoEco(); }catch(e){} return 1;`);

  const salida = { errores: [] };

  // Errores de consola, por si algo revienta sin que la medicion lo note.
  await cdp.send('Runtime.addBinding', { name: '__err' }, sessionId).catch(()=>{});

  const den = await ev(`return window.__p.denominador();`);
  process.stderr.write('  denominador — ' + JSON.stringify(den) + '\n');
  salida.denominador = den;
  if (!den.tab || den.segsBullseye !== 17) {
    salida.errores.push('DENOMINADOR MALO: la pestaña o el bull-s eye no abrieron; ninguna medicion de esta corrida vale');
  }

  // ───────── A) La tarjeta con el 3D CERRADO (para el A/B contra HEAD) ─────────
  salida.A_cerrado = await ev(`
    window.__p.limpiar();
    return { panelVisible: window.__p.vis('lv3d-panel'),
             displayFila: getComputedStyle(document.getElementById('lv3d-fila')).display,
             cajaTexto: window.__p.caja('contr-texto-informe'),
             textoHallazgos: window.__p.txt('contr-texto-informe'),
             textoBoton: window.__p.txt('lv3d-btn'),
             diag: window.lv3dDiag() };`);
  process.stderr.write('  A cerrado — panel visible: ' + salida.A_cerrado.panelVisible
    + ' | display fila: ' + salida.A_cerrado.displayFila + '\n');

  // ───────── H) bullseyeDataURL antes de abrir el 3D ─────────
  const pdfAntes = await ev(`return window.__p.firmaBullseyePDF();`);

  // ───────── B) Sincronia en los dos sentidos ─────────
  salida.B_sync = await ev(`return (async () => {
    const out = {};
    window.__p.limpiar();
    window.__p.set('nombre','Probe VI3D'); window.__p.set('documento','9999');
    window.__p.set('vdfvi','150'); window.__p.set('fevi','40'); window.__p.set('ddfvi','56');
    window.__p.abrir3d();
    await new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); });

    out.pixelesPintados = window.__p.pixelesPintados();   // DENOMINADOR del dibujo
    out.fillsAntes = window.__p.nFills('#22C55E');
    out.hallazgosAntes = window.__p.txt('contr-texto-informe');

    // --- CONTROL NEGATIVO: un clic FUERA del ventriculo no debe cambiar nada ---
    const leidoFuera = window.__p.clicCanvas(0.03, 0.06);
    out.negativo = { leido: leidoFuera,
                     fills: window.__p.nFills('#22C55E'),
                     hallazgos: window.__p.txt('contr-texto-informe') };

    // --- 3D -> bull's eye + hallazgos ---
    const leido = window.__p.clicCanvas(0.5, 0.5);
    out.canvas_leido = leido;
    out.fillsDespues = window.__p.nFills('#22C55E');
    out.hallazgosDespues = window.__p.txt('contr-texto-informe');
    out.estadoTrasCanvas = JSON.parse(JSON.stringify(contrEstado));

    // --- 3D -> EN SUMA (se genera el informe, que es cuando el EN SUMA se emite) ---
    if (typeof generarInforme === 'function') generarInforme();
    out.enSuma = window.__p.val('en_suma');
    out.informeTexto = (window.__p.val('informe_texto')||'').slice(0,600);

    // --- bull's eye -> 3D ---
    const gAntes = window.lv3dDiag().G;
    const firmaAntes = window.__p.firmaCanvas();
    window.__p.clicBullseye('basal_anterior');
    window.__p.clicBullseye('basal_anterior');   // hasta aquinesia
    await new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); });
    out.bullseyeHacia3D = { estado: contrEstado['basal_anterior'],
                            gAntes: gAntes, gDespues: window.lv3dDiag().G,
                            firmaCambio: firmaAntes !== window.__p.firmaCanvas() };

    // --- Limpiar limpia tambien el 3D ---
    if (typeof contrReset === 'function') contrReset();
    await new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); });
    out.trasLimpiar = { estado: JSON.parse(JSON.stringify(contrEstado)),
                        hallazgos: window.__p.txt('contr-texto-informe'),
                        fillsVerde: window.__p.nFills('#22C55E'),
                        abierto: window.lv3dDiag().abierto };
    out.fugaControles = window.__p.fugaControles();
    return out;
  })();`);
  process.stderr.write('  B sync — px pintados: ' + salida.B_sync.pixelesPintados
    + ' | verdes antes/despues: ' + salida.B_sync.fillsAntes + '/' + salida.B_sync.fillsDespues
    + ' | negativo: ' + JSON.stringify(salida.B_sync.negativo.leido) + '\n');

  /* ───────── B2) bull's eye -> 3D, MEDIDO LIMPIO ─────────
     La primera corrida dio firmaCambio=false y el culpable NO era la sincronia: entre las dos
     firmas corria generarInforme(), y el canvas quedaba sin repintar. Acá se mide con el bucle
     VIVO (se devuelve raf como denominador: con raf=null la medicion no vale) y con la animacion
     EN PAUSA, para que la unica causa posible de un cambio de firma sea el cambio de estado y no
     el latido. Lleva su propio control negativo: una pausa sin tocar nada no debe cambiar nada. */
  salida.B2_bullseye_a_3d = await ev(`return (async () => {
    const dosCuadros = function(){ return new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); }); };
    window.__p.limpiar();
    window.__p.set('vdfvi','150'); window.__p.set('fevi','40'); window.__p.set('ddfvi','56');
    window.__p.abrir3d();
    await dosCuadros();
    document.getElementById('lv3d-play').click();          // PAUSA: congela la fase
    await dosCuadros();
    const out = { rafVivo: window.lv3dDiag().raf !== null, px: window.__p.pixelesPintados() };

    // CONTROL NEGATIVO: dos cuadros sin tocar nada -> la firma NO debe cambiar
    const f0 = window.__p.firmaCanvas();
    await dosCuadros();
    out.negativoSinTocar = { firmaIgual: f0 === window.__p.firmaCanvas() };

    // El gesto real: clic en el bull's eye
    const f1 = window.__p.firmaCanvas();
    const gAntes = window.lv3dDiag().G;
    window.__p.clicBullseye('basal_anterior');
    window.__p.clicBullseye('basal_anterior');             // hasta aquinesia
    await dosCuadros();
    out.estado = contrEstado['basal_anterior'];
    out.gAntes = gAntes; out.gDespues = window.lv3dDiag().G;
    out.firmaCambio = f1 !== window.__p.firmaCanvas();
    out.fillBullseye = window.__p.fills()['basal_anterior'];
    window.__p.cerrar3d();
    return out;
  })();`);
  process.stderr.write('  B2 bullseye->3D — rafVivo:' + salida.B2_bullseye_a_3d.rafVivo
    + ' px:' + salida.B2_bullseye_a_3d.px
    + ' | negativo firmaIgual:' + salida.B2_bullseye_a_3d.negativoSinTocar.firmaIgual
    + ' | firmaCambio:' + salida.B2_bullseye_a_3d.firmaCambio
    + ' G ' + salida.B2_bullseye_a_3d.gAntes.toFixed(3) + '->' + salida.B2_bullseye_a_3d.gDespues.toFixed(3) + '\n');

  /* ───────── B3) De que paleta sale el dibujo, y que «Limpiar» lo repinta ─────────
     Cierra los dos huecos que destaparon las mutaciones M17 y M02, que SOBREVIVIERON a la
     primera tanda: nada estaba probando que los colores fueran los de CONTR_MOTILIDAD —cambiarlos
     por los de la demo no rompia ninguna asercion— ni que contrReset repintara el canvas.
     Se mide con la animacion EN PAUSA para que el latido no sea una explicacion alternativa. */
  salida.B3_paleta = await ev(`return (async () => {
    const dosCuadros = function(){ return new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); }); };
    window.__p.limpiar();
    window.__p.set('vdfvi','150'); window.__p.set('fevi','40'); window.__p.set('ddfvi','56');
    window.__p.abrir3d();
    await dosCuadros();
    document.getElementById('lv3d-play').click();      // PAUSA
    await dosCuadros();
    const APP_NORMAL = CONTR_MOTILIDAD[0].color;       // #22C55E
    const APP_ANEUR  = CONTR_MOTILIDAD[4].color;       // #8a5fd4
    const DEMO_VERDE = '#58BD69';                      // el verde de la demo: NO debe aparecer
    const out = { appNormal: APP_NORMAL, appAneurisma: APP_ANEUR };

    out.todoNormal = { app: window.__p.pixelesDeColor(APP_NORMAL),
                       demo: window.__p.pixelesDeColor(DEMO_VERDE),
                       aneurisma: window.__p.pixelesDeColor(APP_ANEUR) };

    // Se pintan varios segmentos como ANEURISMA por la via unica
    ['basal_anterior','basal_anteroseptal','mid_anterior','mid_anteroseptal','apical_anterior']
      .forEach(function(k){ contrSetSegmento(k, 4); });
    await dosCuadros();
    const firmaConAneurisma = window.__p.firmaCanvas();
    out.conAneurisma = { app: window.__p.pixelesDeColor(APP_NORMAL),
                         demo: window.__p.pixelesDeColor(DEMO_VERDE),
                         aneurisma: window.__p.pixelesDeColor(APP_ANEUR) };

    // «Limpiar» de la tarjeta: tiene que repintar el canvas y borrar el violeta
    contrReset();
    await dosCuadros();
    out.trasReset = { app: window.__p.pixelesDeColor(APP_NORMAL),
                      aneurisma: window.__p.pixelesDeColor(APP_ANEUR),
                      firmaCambio: firmaConAneurisma !== window.__p.firmaCanvas() };
    /* ⚠️ Y LO QUE EL BUCLE NO ARREGLA SOLO.
       Los colores se releen por cuadro, asi que el canvas se autocorrige aunque nadie avise: con
       eso solo, cortar el aviso masivo no rompe nada y la via unica no queda probada. Lo que SI
       depende del aviso es la GANANCIA y el TEXTO del panel, que se resuelven una vez por cambio
       de estado y no por cuadro. Se mide ahi: 17 aquineticos con FEVI 60 dejan el panel en
       «inalcanzable», y «Limpiar» tiene que devolverlo a un estado resuelto. Sin el aviso, el
       panel sigue afirmando que la motilidad no alcanza la FEVI sobre un ventriculo que quedo
       todo normal. */
    window.__p.set('fevi','60');
    Object.keys(window.__p.fills()).forEach(function(k){ contrSetSegmento(k, 2); });
    await dosCuadros();
    const notas = function(){ const b = document.getElementById('lv3d-datos');
      return b ? (b.textContent||'').replace(/\\s+/g,' ').trim() : ''; };
    out.aquineticos = { aviso: window.lv3dDiag().aviso, notas: notas() };
    contrReset();
    await dosCuadros();
    out.trasResetAmplitud = { aviso: window.lv3dDiag().aviso, G: window.lv3dDiag().G, notas: notas() };

    window.__p.cerrar3d();
    return out;
  })();`);
  process.stderr.write('  B3 amplitud tras reset — aviso: ' + JSON.stringify(salida.B3_paleta.aquineticos.aviso)
    + ' -> ' + JSON.stringify(salida.B3_paleta.trasResetAmplitud.aviso) + '\n');
  process.stderr.write('  B3 paleta — normal(app/demo): ' + salida.B3_paleta.todoNormal.app + '/' + salida.B3_paleta.todoNormal.demo
    + ' | con aneurisma: ' + salida.B3_paleta.conAneurisma.aneurisma
    + ' | tras reset: aneurisma=' + salida.B3_paleta.trasReset.aneurisma
    + ' firmaCambio=' + salida.B3_paleta.trasReset.firmaCambio + '\n');

  // ───────── C) Los cinco casos de carga de P5 ─────────
  const CASOS = [
    { k:'a_VDF_VSF',      campos:[['vdfvi','150'],['vsfvi','90']] },
    { k:'b_VDF_FEVI',     campos:[['vdfvi','150'],['fevi','40']] },
    { k:'c_FEVI_DD',      campos:[['fevi','45'],['ddfvi','58']] },
    { k:'d_solo_FEVI',    campos:[['fevi','35']] },
    { k:'e_nada',         campos:[] },
    /* Los tres estados de la compuerta de tamaño (regla de Maicol, 2026-10-04). */
    { k:'g1_sin_tamano',  campos:[['fevi','40']] },                              // ni DDVI ni VDFVI
    { k:'g2_tamano_sin_fevi', campos:[['ddfvi','54']] },                         // tamaño, sin FEVI
    { k:'g3_tamano_y_fevi',   campos:[['ddfvi','54'],['fevi','40']] },           // completo
    { k:'g2b_solo_VDFVI', campos:[['vdfvi','150']] },                            // tamaño por VDFVI
    { k:'g1b_dd_fuera_banda', campos:[['ddfvi','700'],['fevi','40']] },          // cargado e ilegible
  ];
  salida.C_panel = {};
  for (const c of CASOS) {
    salida.C_panel[c.k] = await ev(`return (async () => {
      window.__p.limpiar();
      window.__p.set('nombre','Probe VI3D'); window.__p.set('documento','9999');
      ${JSON.stringify(c.campos)}.forEach(function(p){ window.__p.set(p[0], p[1]); });
      window.__p.abrir3d();
      await new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); });
      const p = window.__p.panel();
      p.pixelesPintados = window.__p.pixelesPintados();
      /* ⚠️ MEDICION SEMANTICA, no por cantidad de tinta: cuantos pixeles tienen la razon r:g:b
         del verde de CONTR_MOTILIDAD. El mensaje de la compuerta se pinta con --text2, que es un
         gris (razon ~1:1:1), asi que no puede confundirse con el ventriculo. Contar pixeles
         totales daba 4431 contra 15936 —28 %—, un umbral arbitrario que habria que recalibrar
         con cada cambio de tipografia; esto contesta «se dibujo el ventriculo o no», que es la
         pregunta real. */
      p.pxMotilidad = window.__p.pixelesDeColor(CONTR_MOTILIDAD[0].color);
      window.__p.cerrar3d();
      return p;
    })();`);
    const p = salida.C_panel[c.k];
    process.stderr.write('  C ' + c.k + ' — ' + p.celdas.map(x=>x.campo+'='+x.valor+'['+x.org+']').join(' ') + '\n');
  }

  /* ───────── C2) La compuerta de tamaño EN TRANSICION, en los dos sentidos ─────────
     Es la secuencia real: el medico tiene el panel abierto y animandose, borra el DDVI, y lo
     vuelve a cargar. Los dos cruces tienen que mover el bucle, y es lo UNICO que cubre el termino
     `!hayTamano` del rearme: en el camino de APERTURA `raf` ya es null, asi que ahi la condicion
     no se distingue. Sin esta escena, borrar el DDVI dejaba el bucle vivo repintando un texto
     estatico a 60 cuadros por segundo. */
  salida.C2_transicion = await ev(`return (async () => {
    const dosCuadros = function(){ return new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); }); };
    const foto = async function(){
      await dosCuadros();
      const a = window.lv3dDiag().cuadros;
      await new Promise(function(r){ setTimeout(r, 350); });
      const d = window.lv3dDiag();
      return { hayTamano:d.hayTamano, raf:d.raf, delta:d.cuadros - a,
               pxMotilidad: window.__p.pixelesDeColor(CONTR_MOTILIDAD[0].color),
               pxTotal: window.__p.pixelesPintados() };
    };
    window.__p.limpiar();
    window.__p.set('ddfvi','54'); window.__p.set('fevi','40');
    window.__p.abrir3d();
    const conDD = await foto();
    window.__p.set('ddfvi','');            // el medico borra el DDVI con el panel ABIERTO
    const sinDD = await foto();
    window.__p.set('ddfvi','54');          // y lo vuelve a cargar
    const reDD = await foto();
    window.__p.cerrar3d();
    return { conDD: conDD, sinDD: sinDD, reDD: reDD, hidden: document.hidden };
  })();`);
  process.stderr.write('  C2 transicion — conDD: ' + JSON.stringify(salida.C2_transicion.conDD)
    + '\n                  sinDD: ' + JSON.stringify(salida.C2_transicion.sinDD)
    + '\n                  reDD:  ' + JSON.stringify(salida.C2_transicion.reDD) + '\n');

  // ───────── D) Los cuatro casos de amplitud ─────────
  const AMPL = [
    { k:'fevi30_todo_normal', fevi:'30', segs:[] },
    { k:'fevi60_17_aquinesia', fevi:'60', segs:'TODOS_AQUI' },
    { k:'mixto_fevi_coherente', fevi:'45', segs:[['basal_anterior',2],['mid_anterior',2]] },
    { k:'sin_fevi', fevi:'', segs:[['basal_inferior',1]] },
  ];
  salida.D_amplitud = {};
  for (const a of AMPL) {
    salida.D_amplitud[a.k] = await ev(`return (async () => {
      window.__p.limpiar();
      window.__p.set('nombre','Probe VI3D'); window.__p.set('documento','9999');
      window.__p.set('vdfvi','140'); window.__p.set('ddfvi','52');
      if (${JSON.stringify(a.fevi)}) window.__p.set('fevi', ${JSON.stringify(a.fevi)});
      const sg = ${JSON.stringify(a.segs)};
      if (sg === 'TODOS_AQUI') {
        Object.keys(window.__p.fills()).forEach(function(k){ contrSetSegmento(k, 2); });
      } else {
        sg.forEach(function(p){ contrSetSegmento(p[0], p[1]); });
      }
      window.__p.abrir3d();
      await new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); });
      const p = window.__p.panel();
      p.pixelesPintados = window.__p.pixelesPintados();
      p.hallazgos = window.__p.txt('contr-texto-informe');
      window.__p.cerrar3d();
      return p;
    })();`);
    const d = salida.D_amplitud[a.k];
    process.stderr.write('  D ' + a.k + ' — G=' + (d.diag.G||0).toFixed(3) + ' aviso=' + JSON.stringify(d.diag.aviso)
      + '\n       ' + d.notas.join(' // ') + '\n');
  }

  /* ───────── D2) Lo que destapo /sharp-edges sobre este mismo diff ─────────
     Tres hallazgos corregidos que antes no tenian ninguna asercion, o sea que estaban
     «arreglados» sin nada que impida que se deshagan. */
  salida.D2_sharp = await ev(`return (async () => {
    const dosCuadros = function(){ return new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); }); };
    const out = {};

    /* (1) El acordeon de Contractilidad NO se abre solo con un estudio vacio. Los tres controles
       del panel 3D tienen valor por defecto y secAutoOpen —que mira value/checked, no id— los
       leia como «esta seccion tiene datos del paciente». */
    limpiarCampos(true);
    showTab('datos');
    const acc = document.getElementById('sacc-contr');
    acc.classList.remove('open');
    showTab('contractilidad');
    out.autoOpen = { abierto: acc.classList.contains('open'),
                     panelExiste: !!document.getElementById('lv3d-panel'),
                     controles: document.querySelectorAll('#lv3d-panel input').length,
                     conDataUi: document.querySelectorAll('#lv3d-panel input[data-ui]').length };

    /* (2) EF(G) tiene MAXIMO INTERIOR con segmentos discineticos, asi que probar un solo extremo
       daba falsos «inalcanzable». Se busca el maximo real y se resuelve una FEVI que cae entre
       el valor de GMAX y el del maximo: antes del arreglo esa franja era inalcanzable. */
    window.__p.limpiar();
    window.__p.denominador();
    document.getElementById('lv3d-btn').click();
    ['basal_anterior','basal_anteroseptal','mid_anterior','mid_anteroseptal',
     'apical_anterior','apical_septal','basal_inferoseptal','mid_inferoseptal']
      .forEach(function(k){ contrSetSegmento(k, 3); });
    await dosCuadros();
    let gTope = 0, efTope = -Infinity;
    for (let i=0;i<=40;i++){ const G = i*2.6/40, ef = lv3dEFModelo(G); if (ef > efTope){ efTope = ef; gTope = G; } }
    const efExtremo = lv3dEFModelo(2.6);
    const feviEnLaJoroba = (efExtremo + efTope)/2;    // cae ENTRE los dos: solo el maximo la alcanza
    window.__p.set('fevi', String(Math.round(feviEnLaJoroba*100)/100));
    await dosCuadros();
    out.monotonia = { efTope: +efTope.toFixed(3), gTope: +gTope.toFixed(3),
                      efExtremo: +efExtremo.toFixed(3), maximoInterior: gTope < 2.6 - 1e-9,
                      feviProbada: +feviEnLaJoroba.toFixed(2),
                      aviso: window.lv3dDiag().aviso, G: window.lv3dDiag().G };
    document.getElementById('lv3d-btn').click();

    /* (3) Un insumo FUERA DE BANDA no deriva nada y se marca. El caso real: VSFVI tipeado en
       litros (0,06) hacia que el panel publicara «FEVI 100 % · CALCULADO». */
    const panelDe = async function(campos){
      window.__p.limpiar();
      campos.forEach(function(p){ window.__p.set(p[0], p[1]); });
      document.getElementById('lv3d-btn').click();
      await dosCuadros();
      const p = window.__p.panel();
      document.getElementById('lv3d-btn').click();
      return p;
    };
    out.vsfEnLitros = await panelDe([['vdfvi','120'],['vsfvi','0.06']]);
    out.feviImposible = await panelDe([['vdfvi','100'],['fevi','120']]);
    out.feviAbsurda = await panelDe([['fevi','700'],['ddfvi','52']]);
    return out;
  })();`);
  {
    const S = salida.D2_sharp;
    process.stderr.write('  D2 autoOpen — abierto:' + S.autoOpen.abierto
      + ' (panel existe:' + S.autoOpen.panelExiste + ', ' + S.autoOpen.conDataUi + '/' + S.autoOpen.controles + ' con data-ui)\n');
    process.stderr.write('  D2 monotonia — maximo en G=' + S.monotonia.gTope + ' EF=' + S.monotonia.efTope
      + ' vs extremo EF=' + S.monotonia.efExtremo + ' | FEVI ' + S.monotonia.feviProbada
      + ' -> aviso=' + JSON.stringify(S.monotonia.aviso) + '\n');
    const cel = (o, c) => (o.celdas.find(x => x.campo === c) || {});
    process.stderr.write('  D2 VSF en litros — VSFVI=' + JSON.stringify(cel(S.vsfEnLitros,'VSFVI'))
      + ' FEVI=' + JSON.stringify(cel(S.vsfEnLitros,'FEVI')) + '\n');
    process.stderr.write('  D2 FEVI 120 — VSFVI=' + JSON.stringify(cel(S.feviImposible,'VSFVI')) + '\n');
    process.stderr.write('  D2 FEVI 700 — FEVI=' + JSON.stringify(cel(S.feviAbsurda,'FEVI'))
      + '\n       notas: ' + S.feviAbsurda.notas.join(' // ') + '\n');
  }

  // ───────── E) Apagado real del bucle ─────────
  salida.E_apagado = await ev(`return (async () => {
    const out = {};
    window.__p.limpiar();
    window.__p.set('vdfvi','150'); window.__p.set('fevi','40');
    window.__p.abrir3d();
    out.abierto = await window.__p.cuadros(500);
    window.__p.cerrar3d();
    out.cerrado = await window.__p.cuadros(500);
    // reabrir y cambiar de pestaña
    window.__p.abrir3d();
    out.reabierto = await window.__p.cuadros(400);
    showTab('valvulas');
    out.otraPestana = await window.__p.cuadros(500);
    showTab('contractilidad');
    out.deVuelta = await window.__p.cuadros(400);
    // cerrar el acordeon
    secToggle('contr');
    out.acordeonCerrado = await window.__p.cuadros(500);
    secToggle('contr');
    out.acordeonAbierto = await window.__p.cuadros(400);
    // limpiar el estudio
    limpiarCampos(true);
    out.estudioLimpiado = await window.__p.cuadros(500);
    out.diagFinal = window.lv3dDiag();
    return out;
  })();`);
  process.stderr.write('  E apagado — abierto:' + salida.E_apagado.abierto.delta
    + ' cerrado:' + salida.E_apagado.cerrado.delta
    + ' otraPestana:' + salida.E_apagado.otraPestana.delta
    + ' deVuelta:' + salida.E_apagado.deVuelta.delta
    + ' acordeonCerrado:' + salida.E_apagado.acordeonCerrado.delta
    + ' limpiado:' + salida.E_apagado.estudioLimpiado.delta
    + ' | hidden=' + salida.E_apagado.abierto.hidden + '\n');

  // ───────── F) Cambio de tema con el 3D abierto ─────────
  salida.F_tema = await ev(`return (async () => {
    window.__p.limpiar();
    window.__p.set('vdfvi','150'); window.__p.set('fevi','40');
    window.__p.abrir3d();
    await new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); });
    const claroAntes = document.documentElement.classList.contains('light-mode');
    const f1 = window.__p.firmaCanvas(), px1 = window.__p.pixelesPintados();
    // Se PAUSA la animacion: si no, la firma cambia por el latido y no por el tema.
    document.getElementById('lv3d-play').click();
    await new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); });
    const f2 = window.__p.firmaCanvas();
    toggleTheme();
    await new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); });
    const f3 = window.__p.firmaCanvas();
    const claroDespues = document.documentElement.classList.contains('light-mode');
    toggleTheme();
    return { claroAntes: claroAntes, claroDespues: claroDespues, px: px1,
             firmaCorriendo: f1, firmaPausado: f2, firmaOtroTema: f3,
             repinto: f2 !== f3 };
  })();`);
  process.stderr.write('  F tema — repinto: ' + salida.F_tema.repinto
    + ' (' + salida.F_tema.firmaPausado + ' -> ' + salida.F_tema.firmaOtroTema + ')\n');

  // ───────── H) bullseyeDataURL despues de todo ─────────
  const pdfDespues = await ev(`
    window.__p.limpiar();
    return window.__p.firmaBullseyePDF();`);
  salida.H_pdf = { antes: pdfAntes, despues: pdfDespues,
                   igual: JSON.stringify(pdfAntes) === JSON.stringify(pdfDespues) };
  process.stderr.write('  H bullseyeDataURL — igual: ' + salida.H_pdf.igual + ' ' + JSON.stringify(pdfDespues) + '\n');

  // ───────── G) Maquetacion y tactil ─────────
  salida.G_layout = [];
  for (const w of [1200, 768, 767, 390, 360]) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 768 }, sessionId);
    const med = await ev(`return (async () => {
      window.__p.denominador();
      window.__p.set('vdfvi','150'); window.__p.set('fevi','40'); window.__p.set('ddfvi','56');
      window.__p.abrir3d();
      if (typeof lv3dMaquetar === 'function') lv3dMaquetar();
      await new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); });
      const fila = document.getElementById('lv3d-fila');
      const cs = getComputedStyle(fila);
      const out = { cols: cs.gridTemplateColumns, display: cs.display,
                    texto: window.__p.caja('contr-texto-informe'),
                    panel: window.__p.caja('lv3d-panel'),
                    canvas: window.__p.caja('lv3d-canvas'),
                    boton: window.__p.caja('lv3d-btn'),
                    datos: window.__p.caja('lv3d-datos'),
                    tactilMalos: window.__p.tactil(),
                    desborda: window.__p.desborda(),
                    pixeles: window.__p.pixelesPintados() };
      window.__p.cerrar3d();
      out.cerradoCols = getComputedStyle(fila).display;
      out.cerradoTexto = window.__p.caja('contr-texto-informe');
      return out;
    })();`);
    med.ancho = w;
    salida.G_layout.push(med);
    process.stderr.write('  G ' + w + 'px — ' + med.display + ' [' + med.cols + ']'
      + ' texto ' + med.texto.w + 'x' + med.texto.h
      + ' canvas ' + med.canvas.w + 'x' + med.canvas.h
      + ' | tactil malos: ' + med.tactilMalos.length
      + ' | desborda: ' + (med.desborda.length ? med.desborda.join(',') : 'no') + '\n');
  }
  await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);

  /* ────────────────────────────────────────────────────────────────────────────────────────
     ASERCIONES. Sin esto la sonda es un volcado de datos y no puede ponerse en rojo, asi que
     ninguna mutacion prueba nada.
     ⚠️ SE IMPRIME «RESULTADO» SIEMPRE: el scorer de mutaciones EXIGE esa linea antes de puntuar.
     Si la sonda no arranca, stdout queda vacio, no hay ningun ✗ y todas las mutaciones saldrian
     «sobrevivio» — indistinguible de «no hay cobertura». Ese defecto ya reporto 7 falsos en este
     repo; por eso el veredicto sin RESULTADO es NO CORRIO. */
  const A = [];
  const chk = (nom, cond) => A.push([nom, !!cond]);
  const B = salida.B_sync, B2 = salida.B2_bullseye_a_3d, C = salida.C_panel, D = salida.D_amplitud,
        E = salida.E_apagado, F = salida.F_tema, G = salida.G_layout;
  const notas = o => (o.notas || []).join(' ');

  // Denominadores primero: sin ellos nada de lo de abajo significa algo.
  chk('DEN-1 el bull-s eye pinto sus 17 segmentos', salida.denominador.segsBullseye === 17);
  chk('DEN-2 el canvas dibujo pixeles', B.pixelesPintados > 5000);
  chk('DEN-3 el bucle estaba vivo al medir B2', B2.rafVivo === true);
  chk('DEN-4 la medicion de cuadros no se hizo con la pestaña oculta', E.abierto.hidden === false);

  // Controles negativos: la sonda distingue escenarios.
  chk('NEG-1 un clic fuera del ventriculo no cambia el bull-s eye', B.negativo.fills === 17);
  chk('NEG-2 un clic fuera no cambia los hallazgos', /Sin trastornos/.test(B.negativo.hallazgos));
  chk('NEG-3 dos cuadros sin tocar nada no cambian el dibujo', B2.negativoSinTocar.firmaIgual === true);

  // P3 — la tarjeta con el 3D cerrado
  chk('P3-1 con el 3D cerrado el panel no se ve', salida.A_cerrado.panelVisible === false);
  chk('P3-2 con el 3D cerrado la fila es un bloque plano', salida.A_cerrado.displayFila === 'block');
  chk('P3-3 el boton dice «Ver en 3D»', /Ver en 3D/.test(salida.A_cerrado.textoBoton));

  // P2 — sincronia en los DOS sentidos
  chk('P2-1 tocar el canvas cambia el bull-s eye', B.fillsDespues === B.fillsAntes - 1);
  chk('P2-2 tocar el canvas cambia el texto de hallazgos', /Hipoquinesia/.test(B.hallazgosDespues));
  chk('P2-3 tocar el canvas llega al EN SUMA', /Trastornos sectoriales/.test(B.enSuma));
  chk('P2-4 tocar el bull-s eye repinta el 3D', B2.firmaCambio === true);
  chk('P2-5 tocar el bull-s eye re-resuelve la ganancia', B2.gDespues !== B2.gAntes);
  chk('P2-6 Limpiar limpia tambien el 3D', Object.keys(B.trasLimpiar.estado).every(k => !B.trasLimpiar.estado[k])
      && B.trasLimpiar.fillsVerde === 17);

  // P4 — la paleta es la de la app, no la de la demo (mata M17)
  const P = salida.B3_paleta;
  chk('PAL-1 con todo normal el canvas esta pintado con el verde de CONTR_MOTILIDAD', P.todoNormal.app > 2000);
  chk('PAL-2 y NO con el verde de la demo (control negativo de paleta)', P.todoNormal.demo === 0);
  chk('PAL-3 con todo normal no hay violeta de aneurisma', P.todoNormal.aneurisma === 0);
  chk('PAL-4 pintar aneurisma mete el violeta de CONTR_MOTILIDAD en el canvas', P.conAneurisma.aneurisma > 200);
  chk('PAL-5 y sigue sin aparecer la paleta de la demo', P.conAneurisma.demo === 0);
  // P2 — «Limpiar» repinta el canvas de verdad (mata M02)
  chk('P2-7 Limpiar repinta el canvas', P.trasReset.firmaCambio === true);
  chk('P2-8 Limpiar borra el violeta del canvas', P.trasReset.aneurisma === 0 && P.trasReset.app > 2000);
  /* Estas dos son las que cubren el aviso MASIVO: los colores se autocorrigen por cuadro, la
     ganancia y el texto del panel no. */
  chk('P2-9 DENOMINADOR: 17 aquineticos con FEVI 60 dejan el panel en «inalcanzable»',
      P.aquineticos.aviso === 'inalcanzable' && /no puede alcanzar una FEVI/.test(P.aquineticos.notas));
  chk('P2-10 Limpiar re-resuelve la amplitud y retira el aviso de inalcanzable',
      P.trasResetAmplitud.aviso === '' && !/no puede alcanzar una FEVI/.test(P.trasResetAmplitud.notas));

  // P5 — la tabla en los cinco casos
  const celda = (caso, campo) => (C[caso].celdas.find(x => x.campo === campo) || {});
  chk('P5-a VDF+VSF: FEVI calculada', celda('a_VDF_VSF','FEVI').valor === '40 %' && celda('a_VDF_VSF','FEVI').org === 'calculado');
  chk('P5-a VDF+VSF: los dos volumenes medidos', celda('a_VDF_VSF','VDFVI').org === 'medido' && celda('a_VDF_VSF','VSFVI').org === 'medido');
  chk('P5-b VDF+FEVI: VSF calculado', celda('b_VDF_FEVI','VSFVI').valor === '90 ml' && celda('b_VDF_FEVI','VSFVI').org === 'calculado');
  chk('P5-c FEVI+DD sin volumen: VDF no cargado', celda('c_FEVI_DD','VDFVI').org === 'no cargado');
  chk('P5-c FEVI+DD: dice que el DDVI escala y que no hay volumen',
      /ajustado por el DDVI; volumen no calculado/.test(notas(C.c_FEVI_DD)));
  chk('P5-c NO publica ningun volumen derivado del diametro',
      celda('c_FEVI_DD','VSFVI').org === 'no cargado' && celda('c_FEVI_DD','Volumen sistólico').org === 'no cargado');
  chk('P5-c no nombra Teichholz en ninguna parte', !/[Tt]eich/.test(notas(C.c_FEVI_DD)));
  chk('P5-d solo FEVI: avisa que falta el DDVI', /falta cargar/.test(notas(C.d_solo_FEVI)) && /DDVI/.test(notas(C.d_solo_FEVI)));
  chk('P5-e nada cargado: las cinco celdas en «no cargado»',
      C.e_nada.celdas.length === 5 && C.e_nada.celdas.every(x => x.org === 'no cargado'));

  /* ⚠️ LOS UMBRALES DE `pxMotilidad` SON CATEGORICOS (0 contra no-cero), Y NO UN NUMERO GRANDE.
     El area proyectada del ventriculo cambia con la FASE del latido, asi que el conteo varia:
     medido 4654 en una fase y 1585 en otra, sobre el MISMO dibujo completo. Un umbral de 2000
     daba una prueba intermitente que fallaba segun el cuadro que tocara. Lo que la compuerta
     tiene que distinguir es «se dibujo el ventriculo» de «no se dibujo», y eso es 0 contra
     cualquier cosa: el mensaje se pinta con un gris de razon 1:1:1 y no aporta ni un pixel a
     este conteo. */
  /* ── COMPUERTA DE TAMAÑO: los tres estados de la regla del 2026-10-04 ──
     El denominador de este bloque es `g3`: si el caso completo NO dibujara, los ceros de g1
     no significarian «la compuerta funciona» sino «nada dibuja nunca». */
  chk('GATE-0 DENOMINADOR: el caso completo SI dibuja el ventriculo, con la paleta de motilidad',
      C.g3_tamano_y_fevi.pxMotilidad > 300 && C.g3_tamano_y_fevi.diag.hayTamano === true);
  chk('GATE-1 sin DDVI ni VDFVI la compuerta se cierra', C.g1_sin_tamano.diag.hayTamano === false);
  chk('GATE-1b y NO se dibuja el ventriculo: CERO pixeles de la paleta de motilidad',
      C.g1_sin_tamano.pxMotilidad === 0);
  chk('GATE-1b2 pero el recuadro NO queda vacio: el mensaje esta pintado',
      C.g1_sin_tamano.pixelesPintados > 500);
  chk('GATE-1c y no queda ningun cuadro corriendo', C.g1_sin_tamano.diag.raf === null);
  chk('GATE-1d el mensaje es el literal de Maicol',
      C.g1_sin_tamano.diag.msgSinDatos === 'No hay datos cargados para representar el ventrículo en 3D. Cargá el DDVI o el VDFVI en AI/VI.');
  /* ⚠️ LA REGEX DE ESTA ASERCION ERA DEMASIADO ESTRECHA Y DEJO SOBREVIVIR UNA MUTACION (M27).
     Nombraba «amplitud», «ilustrativa» y «contrae hasta», y la nota que se colaba con la compuerta
     cerrada era otra: «Contraccion global reducida y uniforme: ... el dibujo no muestra colores de
     trastorno», que no contiene ninguna de las tres. Ahora se pregunta por el CAMPO SEMANTICO
     completo: cualquier nota que hable de como contrae, o de que colores muestra, un dibujo que no
     existe. */
  chk('GATE-1e el panel de datos NO habla del dibujo cuando no dibuja',
      /No se dibuja el ventrículo/.test(notas(C.g1_sin_tamano))
      && !/[Cc]ontracción|[Cc]ontrae|amplitud|ilustrativa|colores de trastorno|patrón segmentario/
            .test(notas(C.g1_sin_tamano)));
  chk('GATE-1f pero la tabla sigue mostrando qué se cargó y qué no', C.g1_sin_tamano.celdas.length === 5);
  chk('GATE-2 con tamaño y sin FEVI SI dibuja',
      C.g2_tamano_sin_fevi.diag.hayTamano === true && C.g2_tamano_sin_fevi.pxMotilidad > 300);
  chk('GATE-2b y se marca ilustrativa', C.g2_tamano_sin_fevi.diag.aviso === 'sinFevi'
      && /ilustrativa, no una FEVI medida/.test(notas(C.g2_tamano_sin_fevi)));
  chk('GATE-2c el VDFVI solo tambien abre la compuerta', C.g2b_solo_VDFVI.diag.hayTamano === true
      && C.g2b_solo_VDFVI.pxMotilidad > 300);
  chk('GATE-2d y declara que el VDFVI no dimensiona el modelo',
      /El VDFVI no dimensiona el modelo/.test(notas(C.g2b_solo_VDFVI)));
  chk('GATE-3 con tamaño y FEVI el acortamiento sale de la FEVI',
      C.g3_tamano_y_fevi.diag.aviso === '' && C.g3_tamano_y_fevi.diag.G > 0 && C.g3_tamano_y_fevi.diag.G < 1
      && /ajustado por el DDVI/.test(notas(C.g3_tamano_y_fevi)));
  // La compuerta en TRANSICION: los dos cruces, con el panel abierto.
  const T = salida.C2_transicion;
  chk('GATE-T0 DENOMINADOR: la medicion no se hizo con la pestaña oculta', T.hidden === false);
  chk('GATE-T1 con DDVI el bucle corre y se dibuja el ventriculo',
      T.conDD.hayTamano === true && T.conDD.raf !== null && T.conDD.delta > 5 && T.conDD.pxMotilidad > 300);
  chk('GATE-T2 borrar el DDVI con el panel abierto APAGA el bucle',
      T.sinDD.hayTamano === false && T.sinDD.raf === null && T.sinDD.delta === 0);
  chk('GATE-T3 y deja de dibujar el ventriculo, pero el mensaje queda pintado',
      T.sinDD.pxMotilidad === 0 && T.sinDD.pxTotal > 500);
  chk('GATE-T4 volver a cargar el DDVI rearma el bucle y el ventriculo',
      T.reDD.hayTamano === true && T.reDD.raf !== null && T.reDD.delta > 5 && T.reDD.pxMotilidad > 300);
  chk('GATE-4 un DDVI fuera de banda cierra la compuerta con el OTRO mensaje',
      C.g1b_dd_fuera_banda.diag.hayTamano === false
      && /fuera de lo medible/.test(String(C.g1b_dd_fuera_banda.diag.msgSinDatos))
      && !/Cargá el DDVI/.test(String(C.g1b_dd_fuera_banda.diag.msgSinDatos)));

  // Amplitud — las cuatro condiciones de la decision del 2026-10-04
  chk('AMP-1 FEVI 30 con todo normal: ganancia reducida', D.fevi30_todo_normal.diag.G < 0.6 && D.fevi30_todo_normal.diag.aviso === '');
  chk('AMP-1b y lo explica sin colores de trastorno', /Contracción global reducida/.test(notas(D.fevi30_todo_normal)));
  chk('AMP-2 FEVI 60 con 17 aquineticos: se declara inalcanzable', D.fevi60_17_aquinesia.diag.aviso === 'inalcanzable');
  chk('AMP-2b y el panel dice que la amplitud NO representa la FEVI',
      /no puede alcanzar una FEVI/.test(notas(D.fevi60_17_aquinesia)) && /NO representa la FEVI/.test(notas(D.fevi60_17_aquinesia)));
  chk('AMP-3 patron mixto coherente: resuelve sin aviso', D.mixto_fevi_coherente.diag.aviso === '' && D.mixto_fevi_coherente.diag.G > 0.5);
  chk('AMP-4 sin FEVI: amplitud por segmentos y lo declara ilustrativo',
      D.sin_fevi.diag.aviso === 'sinFevi' && /ilustrativa, no una FEVI medida/.test(notas(D.sin_fevi)));
  chk('AMP-5 ninguna escena publica una segunda «FEVI del modelo»',
      Object.keys(D).every(k => !/FEVI del modelo/.test(notas(D[k]))));

  /* Los tres que destapo /sharp-edges sobre este diff. Sin estas aserciones los arreglos estaban
     hechos pero no probados, que es como un arreglo se deshace sin que nadie se entere. */
  const S = salida.D2_sharp;
  const celD2 = (o, c) => (o.celdas.find(x => x.campo === c) || {});
  chk('SHARP-1 DENOMINADOR: el panel existe y sus 3 controles llevan data-ui',
      S.autoOpen.panelExiste === true && S.autoOpen.controles === 3 && S.autoOpen.conDataUi === 3);
  chk('SHARP-2 con un estudio vacio el acordeon de Contractilidad NO se abre solo',
      S.autoOpen.abierto === false);
  chk('SHARP-3 DENOMINADOR: EF(G) tiene maximo INTERIOR con discineticos',
      S.monotonia.maximoInterior === true && S.monotonia.efTope > S.monotonia.efExtremo);
  chk('SHARP-4 una FEVI entre el extremo y el maximo SE RESUELVE, no se declara inalcanzable',
      S.monotonia.aviso === '' && S.monotonia.G > 0);
  chk('SHARP-5 un VSFVI en litros no fabrica una FEVI calculada',
      celD2(S.vsfEnLitros,'FEVI').valor === '—' && celD2(S.vsfEnLitros,'VSFVI').org === '⚠️ revisar la unidad');
  chk('SHARP-6 y tampoco un volumen sistolico',
      celD2(S.vsfEnLitros,'Volumen sistólico').valor === '—');
  chk('SHARP-7 una FEVI de 120 no fabrica un VSFVI negativo',
      celD2(S.feviImposible,'VSFVI').valor === '—');
  chk('SHARP-8 una FEVI de 700 se marca y NO culpa a la motilidad del paciente',
      celD2(S.feviAbsurda,'FEVI').org === '⚠️ revisar la unidad'
      && /fuera de lo medible/.test(S.feviAbsurda.notas.join(' '))
      && !/La motilidad cargada no puede alcanzar/.test(S.feviAbsurda.notas.join(' ')));
  chk('SHARP-9 y no la lista como «falta cargar» a un campo que SI se cargo',
      !/falta cargar: .*FEVI/.test(S.feviAbsurda.notas.join(' ')));

  // P6 — apagado real
  chk('P6-1 con el panel abierto se dibuja', E.abierto.delta > 5);
  chk('P6-2 con el panel CERRADO no queda ningun cuadro', E.cerrado.delta === 0 && E.cerrado.raf === null);
  chk('P6-3 al cambiar de pestaña se apaga', E.otraPestana.delta === 0 && E.otraPestana.raf === null);
  chk('P6-4 al volver a la pestaña arranca de nuevo', E.deVuelta.delta > 5);
  chk('P6-5 al cerrar el acordeon se apaga', E.acordeonCerrado.delta === 0);
  chk('P6-6 al reabrir el acordeon arranca', E.acordeonAbierto.delta > 5);
  chk('P6-7 al limpiar el estudio se apaga y se cierra',
      E.estudioLimpiado.delta === 0 && E.diagFinal.abierto === false && E.diagFinal.raf === null);

  // P7 — nada del 3D se guarda
  chk('P7-1 el panel tiene controles', B.fugaControles.totalControles >= 3);
  chk('P7-2 y NINGUNO lleva id, asi que los seis barridos no lo ven',
      B.fugaControles.conId === 0 && B.fugaControles.chkConId === 0);

  // Tema, PDF y maquetacion
  chk('TEMA-1 cambiar de tema repinta el canvas', F.repinto === true);
  chk('TEMA-2 el tema cambio de verdad', F.claroAntes !== F.claroDespues);
  chk('PDF-1 bullseyeDataURL sigue dando el mismo PNG', salida.H_pdf.igual === true);
  chk('PDF-2 y sigue siendo un PNG no vacio', salida.H_pdf.despues.largo > 1000);
  const g = a => G.find(x => x.ancho === a);
  chk('LAY-1 a 1200 px hay dos columnas', /px .*px/.test(g(1200).cols));
  chk('LAY-2 a 768 px todavia hay dos columnas', /px .*px/.test(g(768).cols));
  chk('LAY-3 por debajo de 768 px se apila en una', !/px .*px/.test(g(767).cols));
  chk('LAY-4 a 390 px se apila', !/px .*px/.test(g(390).cols));
  chk('LAY-5 a 360 px se apila', !/px .*px/.test(g(360).cols));
  chk('LAY-6 ningun ancho desborda', G.every(x => x.desborda.length === 0));
  chk('LAY-7 ningun control tactil queda por debajo de 44 px', G.every(x => x.tactilMalos.length === 0));
  chk('LAY-8 el canvas dibuja en los cinco anchos', G.every(x => x.pixeles > 2000));

  salida.aserciones = A.map(([n, ok]) => ({ nombre: n, ok }));
  const malas = A.filter(x => !x[1]);
  console.error('');
  malas.forEach(([n]) => console.error('  ✗ ' + n));
  console.error('  RESULTADO: ' + (A.length - malas.length) + '/' + A.length
    + (malas.length ? ('  —  ' + malas.length + ' CON FALLAS') : '  ✓ sin fallas'));
  salida.resultado = { ok: A.length - malas.length, total: A.length, fallas: malas.map(x => x[0]) };

  console.log(JSON.stringify(salida, null, 1));
  cdp.close();
  if (malas.length) process.exitCode = 1;
} catch (e) {
  console.error('HARNESS: ' + e.message);
  process.exitCode = 2;
} finally {
  if (servidor) servidor.close();
  if (chrome) { try { chrome.proc.kill(); } catch {} try { await rm(chrome.perfil, { recursive:true, force:true }); } catch {} }
  process.exit(process.exitCode || 0);
}
