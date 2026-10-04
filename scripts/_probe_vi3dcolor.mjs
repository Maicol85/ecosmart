#!/usr/bin/env node
/**
 * _probe_vi3dcolor.mjs — sonda TEMPORAL (no es la suite) para la tanda
 * «Color por territorio coronario + captura de imagen del 3D del VI».
 *
 * Mide, por el CAMINO REAL DE LA UI (clic en los botones, clic en el canvas, clic en el bull's eye):
 *   T) el selector de modo: default motilidad, y que el canvas cambia de paleta al cambiarlo;
 *   U) que en modo territorio los pixeles salen de CONTR_TERRITORIO con el TONO del estado;
 *   V) que tocar un segmento en modo territorio NO cambia nada (y que en motilidad SI);
 *   W) la leyenda: que esta, que ocupa poco, que no desborda a 360/390 px y sin numeros;
 *   X) los bordes neutros de segmento: presentes en territorio, ausentes en motilidad;
 *   Y) la captura: contenido, UNA sola, Quitar, sobrevive al cambio de pestaña, se descarta en
 *      los cuatro casos del pedido, miniatura «desactualizada», y que no sale al guardado;
 *   Z) que bullseyeDataURL (PDF y PPT) sigue dando el MISMO PNG, y que el bucle sigue apagando.
 *
 * CONTROL NEGATIVO en cada bloque: una escena donde el cambio NO debe actuar, para probar que la
 * sonda distingue escenarios y no dice que si a todo. Y DENOMINADOR antes de cada conteo.
 *
 * Uso:  node scripts/_probe_vi3dcolor.mjs            > /tmp/vi3dcolor.json
 *       node scripts/_probe_vi3dcolor.mjs --ver
 *       VI3D_RAIZ=/tmp/copia node scripts/_probe_vi3dcolor.mjs     (lo usa el arnes de mutaciones)
 *
 * Infraestructura copiada de scripts/_probe_vi3d.mjs.
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-vi3dc-'));
  let bin = null;
  for (const c of CHROMES) { try { await readFile(c); bin = c; break; } catch {} }
  if (!bin) throw new Error('No encontre Chrome/Chromium/Edge.');
  const args = ['--remote-debugging-port=0', `--user-data-dir=${perfil}`, '--no-first-run',
                '--no-default-browser-check', '--disable-extensions', url];
  if (!VER) args.unshift('--headless=new');
  const proc = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
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
  vis(id) { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    let n = e;
    while (n && n.nodeType === 1) { if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true; },
  caja(id) { const e = document.getElementById(id); if (!e) return null;
    const r = e.getBoundingClientRect();
    return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }; },
  dosCuadros() { return new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); }); },

  /* ⚠️ EL DENOMINADOR. Sin la pestaña y el acordeon abiertos no hay geometria y TODO mide cero
     pareciendo impecable. Devuelve cuantos poligonos pinto el bull's eye y si el boton existe. */
  denominador() {
    if (typeof showTab === 'function') showTab('contractilidad');
    const acc = document.getElementById('sacc-contr');
    if (acc && !acc.classList.contains('open') && typeof secToggle === 'function') secToggle('contr');
    const be = document.getElementById('contr-svg-bullseye');
    return { tab: this.vis('contr-svg-bullseye'),
             segsBullseye: be ? be.querySelectorAll('.contr-seg').length : 0,
             boton: this.vis('lv3d-btn'),
             botonesColor: document.querySelectorAll('#lv3d-panel .lv3d-color').length };
  },
  limpiar() { if (typeof limpiarCampos === 'function') limpiarCampos(true);
    if (typeof contrReset === 'function') contrReset();
    return this.denominador(); },
  escena(vdf, fevi, dd) { this.limpiar();
    this.set('nombre','Probe color'); this.set('documento','8888');
    this.set('vdfvi', vdf); this.set('fevi', fevi); this.set('ddfvi', dd);
    return this.abrir3d(); },

  abrir3d() { const b = document.getElementById('lv3d-btn'); if (!b) return 'NO EXISTE boton';
    if (!window.lv3dDiag().abierto) b.click(); return window.lv3dDiag(); },
  cerrar3d() { const b = document.getElementById('lv3d-btn'); if (!b) return 'NO EXISTE boton';
    if (window.lv3dDiag().abierto) b.click(); return window.lv3dDiag(); },
  pausar() { const b = document.getElementById('lv3d-play'); if (b && window.lv3dDiag().raf !== null) b.click(); },
  /* ⚠️ PAUSAR NO ALCANZA PARA CONGELAR LA FASE, Y ESTO ES LO QUE LA FIJA.
     El primer armado de esta sonda usaba pausar() y dio firmas de canvas DISTINTAS entre dos
     mediciones que tenian que ser identicas, mas un rotulo de captura que decia «6 % hacia
     sistole» donde se esperaba «Fin de diastole». La causa no era la app: _lv3d.fase no se
     reinicia al cerrar ni al abrir el panel ni al limpiar —es estado de vista, no del paciente— y
     pausar() congela DONDE ESTE, asi que la fase se iba acumulando a lo largo de la corrida.
     Fijandola por el deslizador se entra por el camino real (su handler pone corriendo=false y la
     fase exacta) y la medicion vuelve a ser comparable entre bloques. */
  fijarFase(pct) {
    const sl = document.querySelector('#lv3d-panel .lv3d-fase');
    if (!sl) return 'NO EXISTE deslizador de fase';
    sl.value = String(pct);
    sl.dispatchEvent(new Event('input', {bubbles:true}));
    return this.txt('lv3d-fase-txt');
  },
  /* Apaga fantasma y aparato: para medir el COLOR y los BORDES de la pared hacen falta solo los
     pixeles de la pared. La malla fantasma es gris y los papilares tambien, asi que dejarlos
     prendidos mete gris propio en una medicion que cuenta gris. */
  soloPared() {
    const p = document.getElementById('lv3d-panel'); if (!p) return 'SIN PANEL';
    p.querySelectorAll('.lv3d-fantasma, .lv3d-aparato').forEach(function(c){ if (c.checked) c.click(); });
    return { fantasma: p.querySelector('.lv3d-fantasma').checked,
             aparato:  p.querySelector('.lv3d-aparato').checked };
  },

  modoBoton(cual) {
    const b = document.querySelector('#lv3d-panel .lv3d-color[data-lv3d-color="' + cual + '"]');
    if (!b) return 'NO EXISTE boton ' + cual;
    b.click(); return window.lv3dDiag().modo;
  },
  modoUI() {
    const o = {};
    document.querySelectorAll('#lv3d-panel .lv3d-color').forEach(function(b){
      o[b.getAttribute('data-lv3d-color')] = { primary: b.classList.contains('btn-primary'),
                                               ghost: b.classList.contains('btn-ghost'),
                                               pressed: b.getAttribute('aria-pressed'),
                                               rotulo: (b.textContent||'').trim() }; });
    return { botones: o, modo: window.lv3dDiag().modo,
             leyendaVisible: this.vis('lv3d-leyenda'), leido: this.txt('lv3d-leido') };
  },

  fills() { const o = {};
    document.querySelectorAll('#contr-svg-bullseye [data-contrseg]').forEach(function(el){
      o[el.getAttribute('data-contrseg')] = el.getAttribute('fill'); });
    return o; },
  nFills(color) { const f = this.fills(); let n = 0;
    for (const k in f) if (f[k] === color) n++; return n; },

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
  clicBullseye(seg) {
    const el = document.querySelector('#contr-svg-bullseye [data-contrseg="' + seg + '"]');
    if (!el) return 'NO EXISTE ' + seg;
    el.dispatchEvent(new MouseEvent('click', {bubbles:true}));
    return (typeof contrEstado !== 'undefined') ? contrEstado[seg] : null;
  },
  /* Pone los 17 segmentos en el mismo grado por la VIA UNICA, no escribiendo contrEstado. */
  todos(idx) {
    const ids = Object.keys(this.fills());
    ids.forEach(function(id){ window.contrSetSegmento(id, idx); });
    return { n: ids.length, uno: contrEstado[ids[0]] };
  },

  /* ⚠️ LA FIRMA VA SOBRE TODOS LOS BYTES, Y ESTO ES UN DEFECTO HEREDADO DE _probe_vi3d.mjs.
     Esa sonda hashea 1 de cada 997 bytes: ~1.037 muestras de 1.033.600, y encima 997 no es
     multiplo de 4, asi que va rotando de canal. MEDIDO en este repo, con la fase congelada y sin
     tocar nada: cinco firmas ralas consecutivas dieron 9da6a743, 9da6a743, 7f59c216, 7f59c216,
     7f59c216 —cambio sola— mientras cinco firmas densas daban el MISMO valor las cinco veces. Y
     peor: despues de un clic REAL en el bull's eye que SI cambio el dibujo, la firma densa cambio
     y la RALA se quedo igual. O sea que la rala da falsos de los dos signos, y la asercion
     «bull's eye -> 3D cambio el canvas» de la tanda anterior pasaba por suerte.
     Un millon de bytes por llamada y quince llamadas por corrida: no se nota. */
  firmaCanvas() {
    const cv = document.getElementById('lv3d-canvas'); if (!cv) return null;
    const c = cv.getContext('2d'); const d = c.getImageData(0,0,cv.width,cv.height).data;
    let h = 2166136261;
    for (let i=0;i<d.length;i++){ h ^= d[i]; h = Math.imul(h, 16777619); }
    return (h>>>0).toString(16);
  },
  /* ⚠️ SE ESPERA A QUE EL CANVAS SE ESTABILICE, Y NO UN NUMERO FIJO DE CUADROS.
     MEDIDO, y medido TAMBIEN CONTRA HEAD (27b5d0f) para saber de quien es: unos 100 ms despues de
     abrir el panel hay UN repintado que mueve 12.213 pixeles de los ~17.100 pintados —un
     corrimiento chico de casi todo el dibujo, no un cambio de contenido: G, fase, dpr, ancho del
     canvas y estado de las fuentes son identicos a los dos lados del salto— y despues queda
     estable para siempre. El salto es EL MISMO, con el mismo numero de pixeles y en el mismo
     cuadro, en HEAD y con los cambios de esta tanda: es asentamiento del rasterizador, no una
     regresion. Pero es por TIEMPO y no por cuadros, asi que «esperar cuatro cuadros» lo cruzaba
     unas veces si y otras no, y ahi nacieron los dos falsos «el dibujo cambio solo» de la primera
     corrida de esta sonda. Se espera hasta que dos firmas DENSAS consecutivas coincidan. */
  async asentar(maxMs) {
    const tope = maxMs || 2500;
    let prev = null, t = 0;
    while (t < tope){
      await new Promise(function(r){ setTimeout(r, 120); });
      await this.dosCuadros();
      t += 120;
      const f = this.firmaCanvas();
      if (prev !== null && f === prev) return f;
      prev = f;
    }
    return { NO_SE_ESTABILIZO: prev, ms: t };
  },
  pixelesPintados() {
    const cv = document.getElementById('lv3d-canvas'); if (!cv) return null;
    const c = cv.getContext('2d'); const d = c.getImageData(0,0,cv.width,cv.height).data;
    let n = 0;
    for (let i=3;i<d.length;i+=4) if (d[i] > 10) n++;
    return n;
  },
  _datos() {
    const cv = document.getElementById('lv3d-canvas'); if (!cv) return null;
    return cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;
  },
  _rgb(hex) {
    const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(hex).trim());
    return m ? [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)] : null;
  },
  /* Cuantos pixeles vienen de un color de origen. El sombreado multiplica los TRES canales por el
     mismo factor, asi que la DIRECCION del vector RGB se conserva y el modulo no: se pregunta por
     la direccion. Sirve para los tonos CLAROS, que mezclan hacia blanco y por eso cambian la
     direccion respecto de la base. */
  pixelesDeColor(hex) {
    const e = this._rgb(hex); if (!e) return null;
    const d = this._datos(); if (!d) return null;
    const ne = Math.sqrt(e[0]*e[0] + e[1]*e[1] + e[2]*e[2]) || 1;
    let n = 0;
    for (let i=0;i<d.length;i+=4){
      if (d[i+3] < 10) continue;
      const r = d[i], g = d[i+1], b = d[i+2];
      if (Math.max(r,g,b) < 30) continue;
      const nv = Math.sqrt(r*r + g*g + b*b) || 1;
      if ((r*e[0] + g*e[1] + b*e[2])/(nv*ne) > 0.9995) n++;
    }
    return n;
  },
  /* ⚠️ LOS TONOS OSCUROS NO SE PUEDEN MEDIR CON pixelesDeColor, Y ESTO ES LO QUE LOS MIDE.
     Mezclar hacia NEGRO es multiplicar los tres canales por (1+f), que es exactamente lo que hace
     el sombreado: la direccion no se mueve un grado, asi que un Aneurisma de la DA y un Normal de
     la DA en penumbra son indistinguibles por direccion. Lo que SI los separa es el techo: el
     pixel MAS BRILLANTE de esa direccion vale (1+f) veces la base. Con todo Normal da ~1,00; con
     todo Discinesia ~0,53; con todo Aneurisma ~0,37. O sea: esto mide los factores negativos de
     LV3D_TONO leyendolos del canvas. */
  maxBrilloDeColor(hex) {
    const e = this._rgb(hex); if (!e) return null;
    const d = this._datos(); if (!d) return null;
    const ne = Math.sqrt(e[0]*e[0] + e[1]*e[1] + e[2]*e[2]) || 1;
    let mx = 0, n = 0;
    for (let i=0;i<d.length;i+=4){
      if (d[i+3] < 10) continue;
      const r = d[i], g = d[i+1], b = d[i+2];
      if (Math.max(r,g,b) < 12) continue;
      const nv = Math.sqrt(r*r + g*g + b*b) || 1;
      if ((r*e[0] + g*e[1] + b*e[2])/(nv*ne) <= 0.9995) continue;
      n++; if (nv/ne > mx) mx = nv/ne;
    }
    return { max: Math.round(mx*100)/100, n: n };
  },
  /* ── Pixeles DESATURADOS, que es como se mide un borde de 1 px en un canvas ──
     Los tonos de la pared son los TRES colores de territorio, todos saturados; los bordes son dos
     grises. Pero una linea de 1 px en canvas sale ANTIALIASADA: casi ningun pixel del borde queda
     gris puro, la mayoria es una mezcla del gris con el relleno de abajo. Pedirle neutralidad
     estricta (saturacion < 0,12) cuenta solo la cresta de la linea y subestima por un factor de
     veinte — el primer armado de esta sonda dio 180 vs 353 y el umbral que puse sobre eso fallo
     sin que el borde estuviera mal.
     Se mide por FRANJAS de saturacion: umbral 0,12 (gris casi puro) y 0,45 (mezcla), y lo que se
     lee es el DELTA entre los dos modos con la pared sola, no el numero absoluto — la brujula y
     los rotulos tambien son grises y estan en los dos modos. */
  pixelesDesaturados(umbral) {
    const d = this._datos(); if (!d) return null;
    let n = 0;
    for (let i=0;i<d.length;i+=4){
      if (d[i+3] < 10) continue;
      const r = d[i], g = d[i+1], b = d[i+2];
      const mx = Math.max(r,g,b), mn = Math.min(r,g,b);
      if (mx < 30) continue;
      if ((mx - mn)/mx < umbral) n++;
    }
    return n;
  },
  pixelesNeutros() { return this.pixelesDesaturados(0.12); },
  /* Pixeles que caen cerca de uno de los DOS grises de borde, con tolerancia euclidea generosa
     para alcanzar los antialiasados. Es la medicion directa de que el borde que se dibujo es el
     que el codigo dice, y no cualquier gris. */
  pixelesDeBorde(tol) {
    const d = this._datos(); if (!d) return null;
    const A = [206,211,222], B = [47,52,63];   // #ced3de y #2f343f
    const t = (tol || 36)*(tol || 36);
    let nA = 0, nB = 0;
    for (let i=0;i<d.length;i+=4){
      if (d[i+3] < 10) continue;
      const r = d[i], g = d[i+1], b = d[i+2];
      let s = (r-A[0])*(r-A[0]) + (g-A[1])*(g-A[1]) + (b-A[2])*(b-A[2]);
      if (s < t){ nA++; continue; }
      s = (r-B[0])*(r-B[0]) + (g-B[1])*(g-B[1]) + (b-B[2])*(b-B[2]);
      if (s < t) nB++;
    }
    return { claro: nA, oscuro: nB, total: nA + nB };
  },

  /* ── Leyenda: los 15 tonos LEIDOS DEL DOM, no del codigo ──
     Es la forma de pegar los valores en el reporte sin transcribirlos: salen del
     getComputedStyle de cada casilla que ve el medico. */
  leyenda() {
    const box = document.getElementById('lv3d-leyenda'); if (!box) return null;
    const r = box.getBoundingClientRect();
    /* ⚠️ VISIBILIDAD Y DESBORDE DE TEXTO, que la primera version NO medía y por eso dos
       mutaciones sobrevivieron. Leer las filas del DOM funciona igual con la leyenda en
       display:none —la mutacion que la escondia pasaba invisible— y el desborde del TEXTO dentro
       de una celda no mueve el recuadro de la leyenda, asi que desborda() tampoco lo veia:
       poniendo white-space:nowrap el rotulo se sale de su columna y todo seguia en verde. */
    const visible = window.__p.vis('lv3d-leyenda');
    const celdasQueDesbordan = [];
    box.querySelectorAll('[data-lv3d-grado]').forEach(function(c){
      if (c.scrollWidth > Math.ceil(c.clientWidth) + 1)
        celdasQueDesbordan.push((c.textContent||'').trim() + ' ' + c.scrollWidth + '>' + c.clientWidth);
    });
    const filas = [];
    box.querySelectorAll('[data-lv3d-ter]').forEach(function(f){
      const tonos = [];
      f.querySelectorAll('[data-lv3d-tono]').forEach(function(c){
        tonos.push(getComputedStyle(c).backgroundColor); });
      filas.push({ ter: f.getAttribute('data-lv3d-ter'), tonos: tonos,
                   titulo: f.getAttribute('title') || '' });
    });
    const cab = [];
    box.querySelectorAll('[data-lv3d-grado]').forEach(function(c){ cab.push((c.textContent||'').trim()); });
    return { alto: Math.round(r.height), ancho: Math.round(r.width),
             visible: visible, celdasQueDesbordan: celdasQueDesbordan,
             cabecera: cab, filas: filas,
             tieneNumeros: /[0-9]/.test((box.textContent||'')),
             texto: (box.textContent||'').replace(/\\s+/g,' ').trim() };
  },

  /* ── Captura ── */
  capturar() { const b = document.querySelector('#lv3d-panel .lv3d-cap-tomar');
    if (!b) return 'NO EXISTE boton de captura'; b.click(); return this.capEstado(); },
  quitarCaptura() { const b = document.querySelector('#lv3d-panel .lv3d-cap-quitar');
    if (!b) return 'NO EXISTE boton quitar'; b.click(); return this.capEstado(); },
  capEstado() {
    const fila = document.getElementById('lv3d-cap');
    const img = fila ? fila.querySelector('.lv3d-cap-img') : null;
    const txt = fila ? fila.querySelector('.lv3d-cap-txt') : null;
    const qui = fila ? fila.querySelector('.lv3d-cap-quitar') : null;
    const c = (typeof window.lv3dCaptura === 'function') ? window.lv3dCaptura() : 'SIN GETTER';
    return { hay: !!(c && c.url),
             memoria: c ? { fase:c.fase, modo:c.modo, tema:c.tema, ancho:c.ancho, alto:c.alto,
                            desactualizada:c.desactualizada, largoUrl:c.url.length,
                            prefijo:c.url.slice(0,22) } : null,
             miniaturas: fila ? fila.querySelectorAll('img').length : 0,
             imgVisible: img ? getComputedStyle(img).display !== 'none' : null,
             imgSrcEsLaCaptura: (img && c) ? (img.getAttribute('src') === c.url) : null,
             imgSrcCrudo: img ? (img.getAttribute('src') ? img.getAttribute('src').slice(0,22) : null) : null,
             texto: txt ? (txt.textContent||'').trim() : null,
             quitarVisible: qui ? getComputedStyle(qui).display !== 'none' : null };
  },
  /* Que hay ESCRITO adentro del PNG. Se vuelve a dibujar el dataURL en un canvas y se cuentan
     los pixeles de texto por franja: sin esto, «la frase esta en la imagen» es una creencia.
     Devuelve tambien el alto, que es lo que cambia cuando entra la leyenda. */
  async capInspeccionar() {
    const c = window.lv3dCaptura(); if (!c) return null;
    const im = new Image();
    await new Promise(function(res, rej){ im.onload = res; im.onerror = rej; im.src = c.url; });
    const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
    const ctx = cv.getContext('2d'); ctx.drawImage(im, 0, 0);
    const d = ctx.getImageData(0,0,cv.width,cv.height).data;
    let opacos = 0, transparentes = 0;
    for (let i=3;i<d.length;i+=4){ if (d[i] > 250) opacos++; else transparentes++; }
    /* ⚠️ LA REFERENCIA DE FONDO SE LEE DEL TEMA, NO DE LA ESQUINA DE LA IMAGEN.
       El primer armado tomaba el pixel (0,0) como «el fondo» y ese pixel es el MARCO de 1 px
       (--border), no --bg3: con esa referencia el 93 % del pie contaba como «escrito» en los dos
       modos, asi que la medicion decia lo mismo que el alto de la imagen y no probaba que hubiera
       texto. Con --bg3 de verdad, lo que queda son los trazos. */
    const cs = getComputedStyle(document.documentElement);
    const bg = ((cs.getPropertyValue('--bg3') || '').trim()) || '#1e2333';
    const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(bg);
    const f0 = m ? [parseInt(m[1],16), parseInt(m[2],16), parseInt(m[3],16)] : [30,35,51];
    const esc = im.width/680;
    const y0 = Math.round(380*esc);
    let pieNoFondo = 0, modeloNoFondo = 0;
    for (let y=0; y<cv.height; y++) for (let x=0; x<cv.width; x++){
      const i = (y*cv.width + x)*4;
      if (Math.abs(d[i]-f0[0]) + Math.abs(d[i+1]-f0[1]) + Math.abs(d[i+2]-f0[2]) <= 24) continue;
      if (y >= y0) pieNoFondo++; else modeloNoFondo++;
    }
    /* ⚠️ EL PIE SE MIDE EN DOS MITADES, y no entero. «Fase: ...» va a la izquierda y la frase a
       la derecha: con un solo numero, cortar una de las dos dejaba la otra sosteniendo el total y
       la mutacion sobrevivia. */
    /* ⚠️ Y LA FRANJA EMPIEZA DEBAJO DEL SEPARADOR, que es donde la primera version se equivoco.
       La linea separadora cruza el ancho ENTERO a la altura logica 386: con la franja arrancando
       en 380 aportaba ~1.300 pixeles a CADA mitad por si sola, mas que cualquier umbral razonable,
       asi que cortar la fase o cortar la frase dejaba las dos mitades en verde. Las dos
       mutaciones sobrevivieron por eso. La linea de texto tiene su base en 404, asi que 390..412
       la toma entera y deja el separador afuera. */
    const mitad = Math.round(cv.width/2);
    let pieIzq = 0, pieDer = 0;
    const yTxt0 = Math.round(390*esc), yFin = Math.min(cv.height, Math.round(412*esc));
    for (let y=yTxt0; y<yFin; y++) for (let x=0; x<cv.width; x++){
      const i = (y*cv.width + x)*4;
      if (Math.abs(d[i]-f0[0]) + Math.abs(d[i+1]-f0[1]) + Math.abs(d[i+2]-f0[2]) <= 24) continue;
      if (x < mitad) pieIzq++; else pieDer++;
    }
    /* ⚠️ Y LOS COLORES DEL MODELO DENTRO DEL PNG. Sin esto, reemplazar el dibujante de la captura
       por un rectangulo gris no rompia nada: el conteo de «pixeles que no son fondo» subia igual.
       Se pregunta por la DIRECCION del vector RGB, como en el canvas. */
    const dir = function(hex, y1, y2){
      const mm = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
      const e = [parseInt(mm[1],16), parseInt(mm[2],16), parseInt(mm[3],16)];
      const ne = Math.sqrt(e[0]*e[0]+e[1]*e[1]+e[2]*e[2]) || 1;
      let n = 0;
      for (let y=y1; y<y2; y++) for (let x=0; x<cv.width; x++){
        const i = (y*cv.width + x)*4;
        if (d[i+3] < 10) continue;
        const r = d[i], g = d[i+1], b = d[i+2];
        if (Math.max(r,g,b) < 30) continue;
        const nv = Math.sqrt(r*r+g*g+b*b) || 1;
        if ((r*e[0] + g*e[1] + b*e[2])/(nv*ne) > 0.9995) n++;
      }
      return n;
    };
    return { w: im.width, h: im.height, escala: esc,
             opacos: opacos, transparentes: transparentes,
             fondoDeclarado: bg,
             esquina: 'rgb(' + d[0] + ',' + d[1] + ',' + d[2] + ')',
             pixelesEnElPie: pieNoFondo, pixelesEnElModelo: modeloNoFondo,
             pieIzquierda: pieIzq, pieDerecha: pieDer, franjaTexto: [yTxt0, yFin],
             areaDelPie: cv.width*(cv.height - y0),
             modelo: { verdeMotilidad: dir('#22C55E', 0, y0), azulDA: dir('#3ea8ff', 0, y0),
                       verdeCD: dir('#3ecf8e', 0, y0), rosaCX: dir('#ff7ab8', 0, y0) } };
  },

  fugaControles() {
    const p = document.getElementById('lv3d-panel'); if (!p) return null;
    return { conId: p.querySelectorAll('input[id], select[id], textarea[id]').length,
             chkConId: p.querySelectorAll('input[type=checkbox][id]').length,
             totalControles: p.querySelectorAll('input, select, textarea').length,
             imgsConId: p.querySelectorAll('img[id], img[name]').length };
  },
  /* Lo que el estudio guarda de verdad, por el MISMO barrido que usa la app. Si la captura
     apareciera ahi, saldria al Excel y al JSON del estudio. */
  huellaGuardado() {
    const o = { campos: 0, conDataUrl: [] };
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      o.campos++;
      if (String(el.value||'').indexOf('data:image') === 0) o.conDataUrl.push(el.id); });
    let ls = 0, lsCap = [];
    for (let i=0;i<localStorage.length;i++){
      const k = localStorage.key(i); ls++;
      const v = localStorage.getItem(k) || '';
      if (v.indexOf('data:image/png') >= 0 && /lv3d|3d/i.test(k)) lsCap.push(k);
      if (/lv3d/i.test(k)) lsCap.push(k);
    }
    return { campos: o.campos, camposConDataUrl: o.conDataUrl, clavesLS: ls, clavesLSdel3D: lsCap };
  },
  firmaBullseyePDF() {
    if (typeof bullseyeDataURL !== 'function') return 'SIN bullseyeDataURL';
    const u = bullseyeDataURL(function(id){
      return (CONTR_MOTILIDAD[(contrEstado[id]||0)] || CONTR_MOTILIDAD[0]).color; });
    let h = 2166136261;
    for (let i=0;i<u.length;i++){ h ^= u.charCodeAt(i); h = Math.imul(h, 16777619); }
    return { largo: u.length, hash: (h>>>0).toString(16), prefijo: u.slice(0,22) };
  },
  /* ⚠️ EL BULL'S EYE MEDIDO EN ABSOLUTO, no solo antes/despues.
     La firma antes/despues prueba que el 3D no lo movio DURANTE la corrida, que es su trabajo;
     pero no ve un cambio que ya estaba al arrancar. Mutar CONTR_TERRITORIO sobrevivia a esa
     asercion porque movia las dos mediciones por igual. Esto lee el stroke real de los 17
     poligonos y lo agrupa: tiene que dar DA 7, CD 5, CX 5 con los colores del recuadro. */
  territorioBullseye() {
    const o = {};
    document.querySelectorAll('#contr-svg-bullseye [data-contrseg]').forEach(function(el){
      const c = el.getAttribute('stroke') || '?';
      o[c] = (o[c] || 0) + 1; });
    return o;
  },
  /* El bull's eye del DOM, entero: sirve para probar que el modo territorio del 3D no lo movio. */
  firmaBullseyeDOM() {
    const be = document.getElementById('contr-svg-bullseye');
    const s = be ? be.innerHTML : '';
    let h = 2166136261;
    for (let i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return { largo: s.length, hash: (h>>>0).toString(16) };
  },
  tactil() {
    const p = document.getElementById('lv3d-panel'); if (!p) return null;
    const malos = [];
    p.querySelectorAll('button, input').forEach(function(el){
      const blanco = el.closest('label') || el;
      const r = blanco.getBoundingClientRect();
      if (!r.width && !r.height) return;
      if (r.width < 44 || r.height < 44)
        malos.push({ q: el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ').join('.') : ''),
                     w: Math.round(r.width), h: Math.round(r.height) });
    });
    return malos;
  },
  desborda() {
    const out = [];
    ['lv3d-panel','lv3d-canvas','lv3d-leyenda','lv3d-cap'].forEach(function(id){
      const e = document.getElementById(id); if (!e) return;
      if (!window.__p.vis(id)) return;
      const r = e.getBoundingClientRect();
      if (r.left < -1 || r.right > window.innerWidth + 1) out.push(id + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
    });
    return out;
  },
  async cuadros(ms) {
    const a = window.lv3dDiag().cuadros;
    await new Promise(function(r){ setTimeout(r, ms || 400); });
    const b = window.lv3dDiag().cuadros;
    return { delta: b - a, raf: window.lv3dDiag().raf, abierto: window.lv3dDiag().abierto,
             hidden: document.hidden };
  }
};
`;

/* ⚠️ GUARDA DEL ACENTO GRAVE. El cuerpo de SONDA es un template literal: UN acento grave adentro
   —aunque sea en un comentario— cierra la cadena y el archivo deja de parsear con un SyntaxError
   que apunta decenas de lineas ANTES del culpable. Me paso DOS veces escribiendo esta sonda.
   Esto lo convierte en un mensaje que dice que pasó y donde. */
if (SONDA.indexOf(String.fromCharCode(96)) >= 0) {
  const i = SONDA.indexOf(String.fromCharCode(96));
  console.error('HARNESS: hay un acento grave dentro de SONDA, cerca de: '
    + JSON.stringify(SONDA.slice(Math.max(0, i - 70), i + 30)));
  process.exit(2);
}

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
  const consola = [];
  cdp.sesionEventos = true;
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
  /* ⚠️ EL DEFAULT SE LEE ANTES DE TOCAR NADA, y esto nace de una mutacion que sobrevivio.
     Todos los bloques arrancan con escena(), que llama a limpiarCampos, que llama a
     lv3dNuevoPaciente, que pone el modo en motilidad. O sea que «el modo por defecto es
     motilidad» medido ahi comprueba el RESET, no el valor declarado: cambiar el default de _lv3d
     a 'territorio' pasaba con 91/91. Aca la app recien cargo y nadie limpio todavia. */
  salida.T0_default = await ev(`return { modo: window.lv3dDiag().modo,
                                         hayCaptura: window.lv3dDiag().hayCaptura,
                                         abierto: window.lv3dDiag().abierto };`);
  process.stderr.write('  T0 default (sin limpiar) — ' + JSON.stringify(salida.T0_default) + '\n');

  const den = await ev(`return window.__p.denominador();`);
  salida.denominador = den;
  process.stderr.write('  denominador — ' + JSON.stringify(den) + '\n');
  if (!den.tab || den.segsBullseye !== 17 || den.botonesColor !== 2)
    salida.errores.push('DENOMINADOR MALO: pestaña, bull-s eye o botones de color no estan; ninguna medicion vale');

  const pdfAntes = await ev(`return window.__p.firmaBullseyePDF();`);
  const beAntes  = await ev(`return window.__p.firmaBullseyeDOM();`);
  salida.T0_territorioBullseye = await ev(`return window.__p.territorioBullseye();`);
  process.stderr.write('  T0 bull-s eye por territorio — '
    + JSON.stringify(salida.T0_territorioBullseye) + '\n');

  // ───────── T) El selector: default motilidad, y que el cambio llega al canvas ─────────
  salida.T_modo = await ev(`return (async () => {
    const out = {};
    window.__p.escena('150','40','56');
    await window.__p.dosCuadros();
    window.__p.fijarFase(0);
    await window.__p.dosCuadros();
    out.px = window.__p.pixelesPintados();                 // DENOMINADOR del dibujo
    out.inicial = window.__p.modoUI();
    const f0 = await window.__p.asentar();
    // CONTROL NEGATIVO: apretar el boton del modo que YA esta activo no debe cambiar nada
    window.__p.modoBoton('motilidad');
    const fn = await window.__p.asentar();
    out.negativo = { modo: window.lv3dDiag().modo, firmaIgual: f0 === fn,
                     leyenda: window.__p.vis('lv3d-leyenda') };
    window.__p.modoBoton('territorio');
    const f1 = await window.__p.asentar();
    out.territorio = window.__p.modoUI();
    out.firmaCambio = f0 !== f1;
    window.__p.modoBoton('motilidad');
    const f2 = await window.__p.asentar();
    out.vuelta = window.__p.modoUI();
    out.vuelveAlMismoDibujo = f0 === f2;
    out.firmas = { base: f0, noOp: fn, territorio: f1, vuelta: f2 };
    out.territorioEraDistinto = f1 !== f0;
    return out;
  })();`);
  process.stderr.write('  T modo — px:' + salida.T_modo.px + ' inicial:' + salida.T_modo.inicial.modo
    + ' firmaCambio:' + salida.T_modo.firmaCambio + '\n');

  // ───────── U) La PALETA por modo, y los cinco tonos LEIDOS DEL CANVAS ─────────
  salida.U_paleta = await ev(`return (async () => {
    const out = {};
    window.__p.escena('150','40','56');
    await window.__p.dosCuadros();
    window.__p.fijarFase(0); window.__p.soloPared();
    await window.__p.dosCuadros();
    out.denominador = window.__p.pixelesPintados();

    // --- MOTILIDAD: verde de CONTR_MOTILIDAD si, colores de territorio no ---
    out.motilidad = { verdeApp: window.__p.pixelesDeColor('#22C55E'),
                      azulDA: window.__p.pixelesDeColor('#3ea8ff'),
                      verdeCD: window.__p.pixelesDeColor('#3ecf8e'),
                      rosaCX: window.__p.pixelesDeColor('#ff7ab8'),
                      tonoClaroDA: window.__p.pixelesDeColor('#bfe2ff') };

    // --- TERRITORIO, todo Normal: los tres colores base ---
    window.__p.modoBoton('territorio');
    await window.__p.dosCuadros();
    out.territorioNormal = { verdeApp: window.__p.pixelesDeColor('#22C55E'),
                             azulDA: window.__p.pixelesDeColor('#3ea8ff'),
                             verdeCD: window.__p.pixelesDeColor('#3ecf8e'),
                             rosaCX: window.__p.pixelesDeColor('#ff7ab8'),
                             techoDA: window.__p.maxBrilloDeColor('#3ea8ff'),
                             techoCD: window.__p.maxBrilloDeColor('#3ecf8e'),
                             techoCX: window.__p.maxBrilloDeColor('#ff7ab8') };

    // --- TONOS CLAROS: un segmento de la DA en Aquinesia cambia de DIRECCION ---
    window.contrSetSegmento('basal_anterior', 2);
    window.contrSetSegmento('mid_anterior', 2);
    await window.__p.dosCuadros();
    out.aquinesiaDA = { tonoClaro: window.__p.pixelesDeColor('#bfe2ff'),
                        naranjaMotilidad: window.__p.pixelesDeColor('#e08a30') };

    // --- TONOS OSCUROS: el TECHO de brillo de cada direccion mide (1+f) ---
    window.__p.todos(0); await window.__p.dosCuadros();
    out.techoTodoNormal = { DA: window.__p.maxBrilloDeColor('#3ea8ff'),
                            CD: window.__p.maxBrilloDeColor('#3ecf8e'),
                            CX: window.__p.maxBrilloDeColor('#ff7ab8') };
    window.__p.todos(3); await window.__p.dosCuadros();
    out.techoTodoDiscinesia = { DA: window.__p.maxBrilloDeColor('#3ea8ff'),
                                CD: window.__p.maxBrilloDeColor('#3ecf8e'),
                                CX: window.__p.maxBrilloDeColor('#ff7ab8') };
    window.__p.todos(4); await window.__p.dosCuadros();
    out.techoTodoAneurisma = { DA: window.__p.maxBrilloDeColor('#3ea8ff'),
                               CD: window.__p.maxBrilloDeColor('#3ecf8e'),
                               CX: window.__p.maxBrilloDeColor('#ff7ab8') };
    window.__p.todos(0); await window.__p.dosCuadros();
    return out;
  })();`);
  process.stderr.write('  U paleta — motilidad verde:' + salida.U_paleta.motilidad.verdeApp
    + ' territorio DA+CD+CX:' + (salida.U_paleta.territorioNormal.azulDA
      + salida.U_paleta.territorioNormal.verdeCD + salida.U_paleta.territorioNormal.rosaCX)
    + ' techos N/D/A: ' + salida.U_paleta.techoTodoNormal.DA.max + '/'
    + salida.U_paleta.techoTodoDiscinesia.DA.max + '/' + salida.U_paleta.techoTodoAneurisma.DA.max + '\n');

  // ───────── X) Bordes neutros: presentes en territorio, ausentes en motilidad ─────────
  salida.X_bordes = await ev(`return (async () => {
    const out = {};
    window.__p.escena('150','40','56');
    await window.__p.dosCuadros();
    window.__p.fijarFase(0); out.ctl = window.__p.soloPared();
    /* ⚠️ ESCENA MIXTA, Y NO TODO NORMAL. La eleccion del gris es POR PIXEL segun la luma del
       color ya sombreado: con los 17 segmentos en Normal, todas las lumas quedan por encima del
       umbral y sale SIEMPRE el gris oscuro. La primera corrida de esta sonda pidio «los dos
       grises» sobre una escena de ese tipo y fallo sin que el codigo estuviera mal. Con tres
       segmentos en Aneurisma —tono oscuro, luma baja— aparecen los dos. */
    window.contrSetSegmento('basal_inferior', 4);
    window.contrSetSegmento('mid_inferior', 4);
    window.contrSetSegmento('basal_inferolateral', 4);
    await window.__p.asentar();
    out.px = window.__p.pixelesPintados();
    out.motilidad = { neutros: window.__p.pixelesDesaturados(0.12),
                      mezcla:  window.__p.pixelesDesaturados(0.45),
                      grisesDeBorde: window.__p.pixelesDeBorde(36) };
    window.__p.modoBoton('territorio');
    await window.__p.dosCuadros();
    await window.__p.dosCuadros();
    out.territorio = { neutros: window.__p.pixelesDesaturados(0.12),
                       mezcla:  window.__p.pixelesDesaturados(0.45),
                       grisesDeBorde: window.__p.pixelesDeBorde(36) };
    out.pxTerritorio = window.__p.pixelesPintados();
    // CONTROL NEGATIVO: volver a motilidad devuelve EXACTAMENTE los conteos de antes
    window.__p.modoBoton('motilidad');
    await window.__p.dosCuadros();
    out.vuelta = { neutros: window.__p.pixelesDesaturados(0.12),
                   mezcla:  window.__p.pixelesDesaturados(0.45),
                   grisesDeBorde: window.__p.pixelesDeBorde(36) };
    return out;
  })();`);
  process.stderr.write('  X bordes — mezcla mot/terr/vuelta: ' + salida.X_bordes.motilidad.mezcla
    + '/' + salida.X_bordes.territorio.mezcla + '/' + salida.X_bordes.vuelta.mezcla
    + ' | grises de borde: ' + salida.X_bordes.motilidad.grisesDeBorde.total + '/'
    + salida.X_bordes.territorio.grisesDeBorde.total + '\n');

  // ───────── V) El toque: en territorio NO cambia nada; en motilidad SI ─────────
  salida.V_toque = await ev(`return (async () => {
    const out = {};
    window.__p.escena('150','40','56');
    await window.__p.dosCuadros();
    window.__p.fijarFase(0);
    await window.__p.dosCuadros();
    out.px = window.__p.pixelesPintados();

    // --- TERRITORIO: tocar el centro del ventriculo no debe mover NI estado NI bull's eye ---
    window.__p.modoBoton('territorio');
    await window.__p.dosCuadros();
    const estAntes = JSON.stringify(contrEstado);
    const beAntes = window.__p.firmaBullseyeDOM();
    const halAntes = window.__p.txt('contr-texto-informe');
    const leidoT = window.__p.clicCanvas(0.5, 0.5);
    await window.__p.dosCuadros();
    out.territorio = { leido: leidoT,
                       estadoIgual: estAntes === JSON.stringify(contrEstado),
                       bullseyeIgual: beAntes.hash === window.__p.firmaBullseyeDOM().hash,
                       hallazgosIgual: halAntes === window.__p.txt('contr-texto-informe') };

    // --- MOTILIDAD: el MISMO toque en el MISMO punto si debe cambiar (control positivo) ---
    window.__p.modoBoton('motilidad');
    await window.__p.dosCuadros();
    const leidoM = window.__p.clicCanvas(0.5, 0.5);
    await window.__p.dosCuadros();
    out.motilidad = { leido: leidoM,
                      estadoCambio: estAntes !== JSON.stringify(contrEstado),
                      bullseyeCambio: beAntes.hash !== window.__p.firmaBullseyeDOM().hash,
                      hallazgos: window.__p.txt('contr-texto-informe') };

    // --- Y la vuelta: bull's eye -> 3D sigue funcionando en modo motilidad ---
    const f0 = await window.__p.asentar();
    window.__p.clicBullseye('basal_inferior');
    out.bullseyeHacia3D = { estado: contrEstado['basal_inferior'],
                            firmaCambio: f0 !== await window.__p.asentar() };

    // --- y en TERRITORIO el bull's eye tambien tiene que llegar al 3D (solo el color cambia) ---
    window.__p.modoBoton('territorio');
    await window.__p.dosCuadros();
    const f1 = await window.__p.asentar();
    window.__p.clicBullseye('basal_inferolateral');
    out.bullseyeHacia3Dterritorio = { estado: contrEstado['basal_inferolateral'],
                                      firmaCambio: f1 !== await window.__p.asentar() };
    window.__p.modoBoton('motilidad');
    return out;
  })();`);
  process.stderr.write('  V toque — territorio estadoIgual:' + salida.V_toque.territorio.estadoIgual
    + ' | motilidad estadoCambio:' + salida.V_toque.motilidad.estadoCambio + '\n');

  // ───────── W) La leyenda: los 15 tonos, el espacio y los anchos ─────────
  salida.W_leyenda = await ev(`return (async () => {
    window.__p.escena('150','40','56');
    await window.__p.dosCuadros();
    const sinLey = window.__p.vis('lv3d-leyenda');
    window.__p.modoBoton('territorio');
    await window.__p.dosCuadros();
    return { visibleEnMotilidad: sinLey, leyenda: window.__p.leyenda(),
             cajaCanvas: window.__p.caja('lv3d-canvas') };
  })();`);
  process.stderr.write('  W leyenda — alto ' + salida.W_leyenda.leyenda.alto + ' px, '
    + salida.W_leyenda.leyenda.filas.length + ' filas, numeros: ' + salida.W_leyenda.leyenda.tieneNumeros + '\n');

  // ───────── G) Maquetacion y tactil en cinco anchos, con el modo territorio activo ─────────
  salida.G_layout = [];
  for (const ancho of [1200, 768, 390, 360]) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 768 }, sessionId);
    const r = await ev(`return (async () => {
      window.__p.denominador();
      window.__p.abrir3d();
      if (window.lv3dDiag().modo !== 'territorio') window.__p.modoBoton('territorio');
      if (typeof lv3dMaquetar === 'function') lv3dMaquetar();
      await window.__p.dosCuadros();
      return { cols: getComputedStyle(document.getElementById('lv3d-fila')).gridTemplateColumns,
               desborda: window.__p.desborda(),
               tactilMalos: window.__p.tactil(),
               leyenda: window.__p.leyenda(),
               pixeles: window.__p.pixelesPintados() };
    })();`);
    r.ancho = ancho;
    salida.G_layout.push(r);
    process.stderr.write('  G ' + ancho + ' px — leyenda ' + r.leyenda.alto + 'x' + r.leyenda.ancho
      + ' | desborda: ' + JSON.stringify(r.desborda) + ' | tactil malos: ' + r.tactilMalos.length + '\n');
  }
  await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);

  // ───────── Y) La captura ─────────
  salida.Y_captura = await ev(`return (async () => {
    const out = {};
    window.__p.escena('150','40','56');
    await window.__p.dosCuadros();
    window.__p.fijarFase(0);
    await window.__p.dosCuadros();
    out.antes = window.__p.capEstado();

    // --- CONTROL NEGATIVO: sin DDVI ni VDFVI la captura NO se toma ---
    window.__p.limpiar(); window.__p.abrir3d();
    await window.__p.dosCuadros();
    out.sinDatos = { hayTamano: window.lv3dDiag().hayTamano, tras: window.__p.capturar() };

    // --- captura en modo MOTILIDAD ---
    window.__p.escena('150','40','56');
    await window.__p.dosCuadros();
    window.__p.fijarFase(0);
    await window.__p.dosCuadros();
    out.motilidad = window.__p.capturar();
    out.motilidadImg = await window.__p.capInspeccionar();

    // --- UNA sola: capturar de nuevo REEMPLAZA ---
    const url1 = window.lv3dCaptura().url;
    document.querySelector('#lv3d-panel .lv3d-fase').value = '100';
    document.querySelector('#lv3d-panel .lv3d-fase').dispatchEvent(new Event('input', {bubbles:true}));
    await window.__p.dosCuadros();
    out.segunda = window.__p.capturar();
    out.unaSola = { miniaturas: out.segunda.miniaturas, urlCambio: url1 !== window.lv3dCaptura().url,
                    faseNueva: window.lv3dCaptura().fase };

    // --- captura en modo TERRITORIO: la imagen crece porque entra la leyenda ---
    window.__p.modoBoton('territorio');
    await window.__p.dosCuadros();
    out.territorio = window.__p.capturar();
    out.territorioImg = await window.__p.capInspeccionar();

    // --- DESACTUALIZADA: cambiar un dato y cambiar el bull's eye ---
    window.__p.set('fevi','35');
    await window.__p.dosCuadros();
    out.trasCambiarDato = window.__p.capEstado();
    window.__p.set('fevi','40');     // deshacer: vuelve a estar al dia
    await window.__p.dosCuadros();
    out.trasDeshacer = window.__p.capEstado();
    window.__p.clicBullseye('apex');
    await window.__p.dosCuadros();
    out.trasCambiarBullseye = window.__p.capEstado();

    // --- CONTROL NEGATIVO de la marca: girar, cambiar de fase y de modo NO desactualizan ---
    window.__p.clicBullseye('apex'); window.__p.clicBullseye('apex');
    window.__p.clicBullseye('apex'); window.__p.clicBullseye('apex');
    await window.__p.dosCuadros();
    const alDia = window.__p.capEstado();
    document.querySelector('#lv3d-panel .lv3d-fase').value = '50';
    document.querySelector('#lv3d-panel .lv3d-fase').dispatchEvent(new Event('input', {bubbles:true}));
    window.__p.modoBoton('motilidad');
    await window.__p.dosCuadros();
    out.negativoMarca = { antes: alDia.memoria && alDia.memoria.desactualizada,
                          despues: window.__p.capEstado().memoria.desactualizada };

    // --- sobrevive al cambio de PESTAÑA y al cierre del panel ---
    if (typeof showTab === 'function') showTab('ai-vi');
    await window.__p.dosCuadros();
    const enOtraPestana = !!(window.lv3dCaptura());
    window.__p.denominador();
    window.__p.cerrar3d();
    await window.__p.dosCuadros();
    const trasCerrarPanel = !!(window.lv3dCaptura());
    window.__p.abrir3d();
    await window.__p.dosCuadros();
    out.sobrevive = { otraPestana: enOtraPestana, cierrePanel: trasCerrarPanel,
                      tras: window.__p.capEstado() };

    // --- no sale al guardado ni a localStorage ---
    out.huella = window.__p.huellaGuardado();
    out.fugaControles = window.__p.fugaControles();

    // --- QUITAR ---
    out.quitar = window.__p.quitarCaptura();
    return out;
  })();`);
  process.stderr.write('  Y captura — motilidad ' + salida.Y_captura.motilidadImg.w + 'x'
    + salida.Y_captura.motilidadImg.h + ' | territorio ' + salida.Y_captura.territorioImg.w + 'x'
    + salida.Y_captura.territorioImg.h + ' | sin datos: ' + salida.Y_captura.sinDatos.tras.hay + '\n');

  // ───────── Y2) Los CUATRO descartes del pedido, uno por uno ─────────
  salida.Y2_descarte = await ev(`return (async () => {
    const out = {};
    /* ⚠️ SE PONE EL MODO EN TERRITORIO ANTES DE CADA DESCARTE, y es el DENOMINADOR de P4d-2.
       Sin esto el modo ya venia en motilidad de los bloques anteriores, asi que «vuelve a
       motilidad» daba verde sin que nadie lo hubiera devuelto: una mutacion que sacaba ese
       reset sobrevivia. */
    const tomar = async function(){
      window.__p.escena('150','40','56');
      await window.__p.dosCuadros();
      window.__p.modoBoton('territorio');
      window.__p.capturar();
      return { hay: !!window.lv3dCaptura(), modo: window.lv3dDiag().modo };
    };
    // 1) Limpiar / Nuevo estudio
    out.antes1 = await tomar();
    if (typeof limpiarCampos === 'function') limpiarCampos(true);
    out.trasLimpiar = { hay: !!window.lv3dCaptura(), modo: window.lv3dDiag().modo };
    // 2) contrReset (el boton Limpiar de contractilidad) NO descarta: no cambia de paciente
    out.antes2 = await tomar();
    if (typeof contrReset === 'function') contrReset();
    out.trasContrReset = { hay: !!window.lv3dCaptura() };
    // 3) cargar OTRO estudio: pasa por limpiarCampos(true), que es el camino medido arriba.
    //    Se mide la MISMA puerta llamandola como la llama cargarEstudioPorId.
    out.antes3 = await tomar();
    try { limpiarCampos(true); } catch(e) { out.err3 = String(e); }
    out.trasCargarOtro = { hay: !!window.lv3dCaptura() };
    // 4) cerrar sesion
    out.antes4 = await tomar();
    if (typeof cerrarSesionReal === 'function') cerrarSesionReal();
    out.trasCerrarSesion = { hay: !!window.lv3dCaptura(), modo: window.lv3dDiag().modo,
                             overlay: getComputedStyle(document.getElementById('login-overlay')).display };
    try{sessionStorage.setItem('ett_auth','1');}catch(e){}
    document.getElementById('login-overlay').style.display='none';
    return out;
  })();`);
  process.stderr.write('  Y2 descarte — limpiar:' + salida.Y2_descarte.trasLimpiar.hay
    + ' contrReset:' + salida.Y2_descarte.trasContrReset.hay
    + ' cargarOtro:' + salida.Y2_descarte.trasCargarOtro.hay
    + ' cerrarSesion:' + salida.Y2_descarte.trasCerrarSesion.hay + '\n');

  // ───────── Z) Apagado del bucle, bull's eye y PDF ─────────
  salida.Z_apagado = await ev(`return (async () => {
    const out = {};
    window.__p.escena('150','40','56');
    await window.__p.dosCuadros();
    if (window.lv3dDiag().modo !== 'territorio') window.__p.modoBoton('territorio');
    out.vivo = await window.__p.cuadros(400);               // DENOMINADOR: tiene que haber bucle
    window.__p.cerrar3d();
    out.cerrado = await window.__p.cuadros(400);
    window.__p.abrir3d();
    await window.__p.dosCuadros();
    if (typeof showTab === 'function') showTab('ai-vi');
    out.otraPestana = await window.__p.cuadros(400);
    window.__p.denominador(); window.__p.abrir3d();
    await window.__p.dosCuadros();
    window.__p.limpiar();
    out.limpio = await window.__p.cuadros(400);
    return out;
  })();`);
  const pdfDespues = await ev(`return window.__p.firmaBullseyePDF();`);
  const beDespues  = await ev(`return window.__p.firmaBullseyeDOM();`);
  salida.Z_pdf = { antes: pdfAntes, despues: pdfDespues,
                   igual: pdfAntes.hash === pdfDespues.hash && pdfAntes.largo === pdfDespues.largo };
  salida.Z_bullseyeDOM = { antes: beAntes, despues: beDespues,
                           igual: beAntes.hash === beDespues.hash && beAntes.largo === beDespues.largo };
  process.stderr.write('  Z apagado — cuadros cerrado:' + salida.Z_apagado.cerrado.delta
    + ' otraPestaña:' + salida.Z_apagado.otraPestana.delta + ' limpio:' + salida.Z_apagado.limpio.delta
    + ' | PDF igual: ' + salida.Z_pdf.igual + ' | bull-s eye DOM igual: ' + salida.Z_bullseyeDOM.igual + '\n');

  // ───────── Aserciones ─────────
  const A = [];
  const chk = (n, ok) => A.push([n, !!ok]);
  const T = salida.T_modo, U = salida.U_paleta, V = salida.V_toque,
        W = salida.W_leyenda, X = salida.X_bordes, Y = salida.Y_captura, Y2 = salida.Y2_descarte,
        Z = salida.Z_apagado;

  chk('DEN-1 el dibujo tenia pixeles antes de contar nada', T.px > 2000);
  // P1
  chk('P1-1 el modo por defecto es motilidad, LEIDO ANTES de que limpiarCampos lo resetee',
      salida.T0_default.modo === 'motilidad' && T.inicial.modo === 'motilidad');
  chk('P1-1b y la app arranca sin captura y con el panel cerrado',
      salida.T0_default.hayCaptura === false && salida.T0_default.abierto === false);
  chk('P1-2 y el boton de motilidad arranca con la pastilla puesta',
      T.inicial.botones.motilidad.primary === true && T.inicial.botones.territorio.primary === false);
  chk('P1-3 los dos rotulos son los del pedido',
      /Color por motilidad/.test(T.inicial.botones.motilidad.rotulo)
      && /Color por territorio coronario/.test(T.inicial.botones.territorio.rotulo));
  chk('P1-4 la leyenda arranca oculta', T.inicial.leyendaVisible === false);
  chk('P1-5 CONTROL NEGATIVO: re-apretar el modo activo no cambia el dibujo',
      T.negativo.firmaIgual === true && T.negativo.leyenda === false);
  chk('P1-6 pasar a territorio cambia el dibujo', T.firmaCambio === true);
  chk('P1-7 y mueve la pastilla y el aria-pressed',
      T.territorio.botones.territorio.primary === true
      && T.territorio.botones.territorio.pressed === 'true'
      && T.territorio.botones.motilidad.pressed === 'false');
  chk('P1-8 volver a motilidad devuelve EXACTAMENTE el dibujo de antes', T.vuelveAlMismoDibujo === true);
  // P2 a/c
  chk('P2a-1 en motilidad el canvas usa el verde de CONTR_MOTILIDAD', U.motilidad.verdeApp > 500);
  chk('P2a-2 y NO usa los colores de territorio',
      U.motilidad.azulDA === 0 && U.motilidad.verdeCD === 0 && U.motilidad.rosaCX === 0);
  chk('P2a-3 en territorio el canvas usa los TRES colores de CONTR_TERRITORIO',
      U.territorioNormal.azulDA > 200 && U.territorioNormal.verdeCD > 200 && U.territorioNormal.rosaCX > 200);
  chk('P2a-4 y ya NO usa el verde de motilidad', U.territorioNormal.verdeApp === 0);
  /* ⚠️ EL TECHO SE LEE EN RAZON, NO EN ABSOLUTO, Y ESTO ERA UN FALSO HALLAZGO DE LA SONDA.
     El techo absoluto de cada territorio NO es 1,00 aunque Normal sea el color base: depende de
     cuanto se acerca la normal de SU parte de la malla a la direccion de la luz, y la DA, la CD y
     la CX ocupan zonas distintas del ventriculo —medido: 0,97 / 0,84 / 0,78 con todo Normal—.
     La magnitud que SI es propia del tono es la razon contra el techo de Normal del MISMO
     territorio: ahi tiene que salir 1+f, o sea 0,53 y 0,37. Asi se leen los factores de LV3D_TONO
     desde los pixeles, sin que la geometria se meta. */
  const razon = (a, b) => ['DA','CD','CX'].map(t => a[t].max / b[t].max);
  const cerca = (xs, v, tol) => xs.every(x => Math.abs(x - v) <= tol);
  salida.U_razones = { discinesia: razon(U.techoTodoDiscinesia, U.techoTodoNormal),
                       aneurisma:  razon(U.techoTodoAneurisma,  U.techoTodoNormal) };
  chk('P2c-1 Normal es el color BASE: es el techo contra el que se miden los demas',
      U.techoTodoNormal.DA.n > 2000 && U.techoTodoNormal.CD.n > 500 && U.techoTodoNormal.CX.n > 500);
  chk('P2c-2 Aquinesia es un tono CLARO: aparece una direccion de color que motilidad no tiene',
      U.aquinesiaDA.tonoClaro > 100 && U.motilidad.tonoClaroDA < 50
      && U.aquinesiaDA.tonoClaro > U.motilidad.tonoClaroDA*20 && U.aquinesiaDA.naranjaMotilidad === 0);
  chk('P2c-3 Discinesia es algo mas OSCURA: razon 0,53 en los TRES territorios',
      cerca(salida.U_razones.discinesia, 0.53, 0.03));
  chk('P2c-4 Aneurisma es mucho mas oscura: razon 0,37 en los TRES territorios',
      cerca(salida.U_razones.aneurisma, 0.37, 0.03));
  chk('P2c-5 y los dos tonos oscuros se separan bien entre si',
      salida.U_razones.discinesia.every((d, i) => (d - salida.U_razones.aneurisma[i]) > 0.12));
  // P2 b
  chk('P2b-1 en territorio el toque NO cambia el estado', V.territorio.estadoIgual === true);
  chk('P2b-2 ni el bull-s eye', V.territorio.bullseyeIgual === true);
  chk('P2b-3 ni el texto de hallazgos', V.territorio.hallazgosIgual === true);
  chk('P2b-4 pero contesta que segmento es y que es solo lectura',
      /Segmento \d+/.test(V.territorio.leido) && /[Ss]olo lectura/.test(V.territorio.leido)
      && /territorio (DA|CD|CX)/.test(V.territorio.leido));
  chk('P2b-5 CONTROL POSITIVO: el MISMO toque en motilidad SI cambia el estado',
      V.motilidad.estadoCambio === true && V.motilidad.bullseyeCambio === true);
  chk('P2b-6 la frase del panel avisa el modo solo lectura',
      /NO lo cambia/.test(T.territorio.leido) && /Color por motilidad/.test(T.territorio.leido));
  chk('P2b-7 y en motilidad la frase vuelve a la de siempre',
      /cambiar su motilidad/.test(T.vuelta.leido) && /va al informe/.test(T.vuelta.leido));
  chk('P2b-8 bull-s eye -> 3D sigue funcionando en motilidad', V.bullseyeHacia3D.firmaCambio === true);
  chk('P2b-9 y tambien en territorio (el estado llega, solo cambia el tono)',
      V.bullseyeHacia3Dterritorio.firmaCambio === true && V.bullseyeHacia3Dterritorio.estado === 1);
  // P2 d
  chk('P2d-1 en territorio aparecen los grises de borde, y en motilidad NO',
      X.territorio.grisesDeBorde.total > 150 && X.motilidad.grisesDeBorde.total < 40);
  chk('P2d-1b y se usan LOS DOS grises, no uno solo (la eleccion es por pixel)',
      X.territorio.grisesDeBorde.claro > 20 && X.territorio.grisesDeBorde.oscuro > 20);
  chk('P2d-1c y el conteo de pixeles desaturados sube de verdad',
      X.territorio.mezcla > X.motilidad.mezcla + 600);
  chk('P2d-2 CONTROL NEGATIVO: volver a motilidad devuelve EXACTAMENTE los conteos de antes',
      X.vuelta.mezcla === X.motilidad.mezcla && X.vuelta.neutros === X.motilidad.neutros
      && X.vuelta.grisesDeBorde.total === X.motilidad.grisesDeBorde.total);
  chk('P2d-3 y el denominador del dibujo no cambio entre los dos modos',
      Math.abs(X.pxTerritorio - X.px) < X.px*0.02);
  chk('P2d-4 la malla fantasma y el aparato estaban APAGADOS al contar neutros',
      X.ctl.fantasma === false && X.ctl.aparato === false);
  // P2 e
  chk('P2e-1 el bull-s eye del DOM es identico antes y despues de todo', salida.Z_bullseyeDOM.igual === true);
  /* La de arriba prueba que el 3D no lo movio DURANTE la corrida; esta prueba que el reparto por
     arteria es el de siempre, que es lo que la de arriba no puede ver porque mueve las dos
     mediciones por igual. DA 7 segmentos, CD 5 y CX 5, con los colores del recuadro. */
  chk('P2e-2 y el bull-s eye sigue repartido DA 7 / CD 5 / CX 5 con los colores de siempre',
      JSON.stringify(salida.T0_territorioBullseye) ===
        JSON.stringify({ '#3ea8ff': 7, '#3ecf8e': 5, '#ff7ab8': 5 }));
  // P3
  chk('P3-0 la leyenda se VE en modo territorio (no solo existe en el DOM)',
      W.leyenda.visible === true && W.visibleEnMotilidad === false);
  chk('P3-1 la leyenda tiene UNA fila por territorio', W.leyenda.filas.length === 3);
  chk('P3-2 y son DA, CD y CX en ese orden',
      W.leyenda.filas.map(f => f.ter).join(',') === 'DA,CD,CX');
  chk('P3-3 cada fila trae los CINCO tonos', W.leyenda.filas.every(f => f.tonos.length === 5));
  chk('P3-4 los cinco tonos de una fila son todos distintos',
      W.leyenda.filas.every(f => new Set(f.tonos).size === 5));
  chk('P3-5 la cabecera nombra los cinco grados de CONTR_MOTILIDAD',
      W.leyenda.cabecera.join('|') === 'Normal|Hipoquinesia|Aquinesia|Discinesia|Aneurisma');
  chk('P3-6 SIN numeros a la vista', W.leyenda.tieneNumeros === false);
  chk('P3-7 los numeros de segmento estan en el title, que no ocupa espacio',
      W.leyenda.filas.every(f => /^Segmentos [0-9, ]+$/.test(f.titulo)));
  chk('P3-8 ocupa poco: menos de 90 px de alto', W.leyenda.alto > 0 && W.leyenda.alto <= 90);
  const gl = a => salida.G_layout.find(x => x.ancho === a);
  chk('P3-9 a 390 px la leyenda no desborda y sigue entera',
      gl(390).desborda.length === 0 && gl(390).leyenda.filas.length === 3);
  chk('P3-10 a 360 px tampoco',
      gl(360).desborda.length === 0 && gl(360).leyenda.filas.length === 3);
  chk('P3-11 y a 360 px sigue ocupando poco', gl(360).leyenda.alto <= 110);
  /* ⚠️ El desborde del TEXTO dentro de su columna no mueve el recuadro de la leyenda, asi que
     desborda() no lo ve: hay que preguntarle a cada celda si su contenido le entra. */
  chk('P3-12 ningun rotulo de la cabecera se sale de su columna, en ningun ancho',
      salida.G_layout.every(x => x.leyenda.celdasQueDesbordan.length === 0)
      && W.leyenda.celdasQueDesbordan.length === 0);
  chk('LAY-1 ningun ancho desborda', salida.G_layout.every(x => x.desborda.length === 0));
  chk('LAY-2 ningun control tactil queda por debajo de 44 px',
      salida.G_layout.every(x => x.tactilMalos.length === 0));
  chk('LAY-3 el canvas dibuja en los cuatro anchos', salida.G_layout.every(x => x.pixeles > 2000));
  // P4
  chk('P4-1 arranca SIN captura', Y.antes.hay === false && /Sin captura/.test(Y.antes.texto));
  chk('P4-2 y el boton Quitar arranca oculto', Y.antes.quitarVisible === false);
  chk('P4-3 CONTROL NEGATIVO: sin DDVI ni VDFVI no se captura',
      Y.sinDatos.hayTamano === false && Y.sinDatos.tras.hay === false);
  chk('P4-4 capturar deja UNA captura en memoria', Y.motilidad.hay === true);
  chk('P4-5 y es un PNG de verdad', /^data:image\/png;base64/.test(Y.motilidad.memoria.prefijo));
  chk('P4-6 la miniatura se muestra y es ESA captura',
      Y.motilidad.imgVisible === true && Y.motilidad.imgSrcEsLaCaptura === true);
  chk('P4-7 el rotulo de la miniatura dice la fase', /Captura · Fin de diástole/.test(Y.motilidad.texto));
  chk('P4-8 y aparece el boton Quitar', Y.motilidad.quitarVisible === true);
  chk('P4-9 UNA sola: capturar de nuevo reemplaza, no agrega',
      Y.unaSola.miniaturas === 1 && Y.unaSola.urlCambio === true);
  chk('P4-10 y la nueva registra la fase nueva', /Fin de sístole/.test(Y.unaSola.faseNueva));
  chk('P4-11 el PNG de motilidad es OPACO entero', Y.motilidadImg.transparentes === 0);
  chk('P4-12 el PNG lleva marco: la esquina es el borde, no el fondo',
      Y.motilidadImg.esquina !== 'rgb(' + [30,35,51].join(',') + ')'
      && Y.motilidadImg.fondoDeclarado === '#1e2333');
  /* El pie de motilidad tiene DOS lineas de texto y un separador; medido contra el fondo real del
     tema, eso es ~4 % del area del pie. Se exige que haya trazos y que NO sea el area entera: si
     diera casi el 100 %, la referencia de fondo estaria mal otra vez. */
  chk('P4-13 el PNG tiene un PIE escrito debajo del diagrama, y es texto y no area',
      Y.motilidadImg.pixelesEnElPie > 1500
      && Y.motilidadImg.pixelesEnElPie < Y.motilidadImg.areaDelPie*0.35);
  chk('P4-13b y el modelo esta dibujado arriba', Y.motilidadImg.pixelesEnElModelo > 20000);
  /* Umbrales MEDIDOS, no redondos: la franja de texto da 3.315 px a la izquierda (la fase) y
     4.200 a la derecha (la frase). Cortar cualquiera de las dos deja su mitad en ~0, asi que
     1.500 separa holgado sin ser un numero inventado. */
  chk('P4-13c la FASE esta escrita, en la mitad izquierda del pie', Y.motilidadImg.pieIzquierda > 1500);
  chk('P4-13d y la FRASE en la derecha', Y.motilidadImg.pieDerecha > 1500);
  /* ⚠️ Y EL MODELO DEL PNG TIENE QUE SER EL MODELO, no cualquier mancha. Sin esto, cambiar el
     dibujante de la captura por un rectangulo gris no rompia nada: «pixeles que no son fondo»
     subia igual. Se pregunta por la paleta, que es lo que distingue un ventriculo de una mancha. */
  chk('P4-30 el PNG de motilidad trae el modelo con la paleta de CONTR_MOTILIDAD',
      Y.motilidadImg.modelo.verdeMotilidad > 20000 && Y.motilidadImg.modelo.azulDA === 0);
  chk('P4-30b y el de territorio, con los TRES colores de CONTR_TERRITORIO',
      Y.territorioImg.modelo.azulDA > 800 && Y.territorioImg.modelo.verdeCD > 100
      && Y.territorioImg.modelo.rosaCX > 100 && Y.territorioImg.modelo.verdeMotilidad === 0);
  chk('P4-14 sale al doble de escala, para el papel', Math.abs(Y.motilidadImg.escala - 2) < 0.01);
  chk('P4-15 en territorio el PNG es MAS ALTO: entro la leyenda',
      Y.territorioImg.h > Y.motilidadImg.h + 80);
  chk('P4-16 y su pie tiene mucho mas escrito: entraron las tres barras de la leyenda',
      Y.territorioImg.pixelesEnElPie > Y.motilidadImg.pixelesEnElPie * 3);
  chk('P4-17 la captura registra el modo en que se tomo',
      Y.motilidad.memoria.modo === 'motilidad' && Y.territorio.memoria.modo === 'territorio');
  chk('P4-18 y el tema, sin decidir por el PDF', Y.territorio.memoria.tema === 'oscuro');
  chk('P4-19 cambiar un dato cargado la marca DESACTUALIZADA',
      Y.trasCambiarDato.memoria.desactualizada === true
      && /Desactualizada/.test(Y.trasCambiarDato.texto));
  chk('P4-20 y NO la borra', Y.trasCambiarDato.hay === true);
  chk('P4-21 deshacer el cambio la devuelve a al dia',
      Y.trasDeshacer.memoria.desactualizada === false);
  chk('P4-22 cambiar el bull-s eye tambien la marca',
      Y.trasCambiarBullseye.memoria.desactualizada === true && Y.trasCambiarBullseye.hay === true);
  chk('P4-23 CONTROL NEGATIVO: cambiar de fase y de modo NO la desactualiza',
      Y.negativoMarca.antes === false && Y.negativoMarca.despues === false);
  chk('P4-24 sobrevive al cambio de pestaña', Y.sobrevive.otraPestana === true);
  chk('P4-25 y al cierre del panel', Y.sobrevive.cierrePanel === true);
  chk('P4-26 ningun campo del estudio guarda una dataURL', Y.huella.camposConDataUrl.length === 0);
  chk('P4-27 y localStorage no tiene ninguna clave del 3D', Y.huella.clavesLSdel3D.length === 0);
  chk('P4-28 el panel sigue sin un solo control con id',
      Y.fugaControles.conId === 0 && Y.fugaControles.chkConId === 0 && Y.fugaControles.imgsConId === 0);
  chk('P4-29 Quitar la borra y vuelve el estado inicial',
      Y.quitar.hay === false && Y.quitar.quitarVisible === false && /Sin captura/.test(Y.quitar.texto));
  // P4-d: los cuatro descartes
  chk('P4d-0 habia captura antes de cada descarte (DENOMINADOR)',
      [Y2.antes1, Y2.antes2, Y2.antes3, Y2.antes4].every(x => x && x.hay === true));
  chk('P4d-0b y el modo estaba en TERRITORIO antes de cada uno (DENOMINADOR de P4d-2)',
      [Y2.antes1, Y2.antes2, Y2.antes3, Y2.antes4].every(x => x && x.modo === 'territorio'));
  chk('P4d-1 Limpiar / Nuevo estudio la descarta', Y2.trasLimpiar.hay === false);
  chk('P4d-2 y devuelve el modo a motilidad', Y2.trasLimpiar.modo === 'motilidad');
  chk('P4d-3 abrir otro estudio la descarta (misma puerta)', Y2.trasCargarOtro.hay === false);
  chk('P4d-4 cerrar sesion la descarta', Y2.trasCerrarSesion.hay === false);
  chk('P4d-4b y tambien devuelve el modo a motilidad', Y2.trasCerrarSesion.modo === 'motilidad');
  chk('P4d-5 CONTROL NEGATIVO: el Limpiar de contractilidad NO la descarta (no cambia de paciente)',
      Y2.trasContrReset.hay === true);
  // Apagado y PDF
  chk('OFF-0 habia bucle antes de medir el apagado (DENOMINADOR)',
      Z.vivo.delta > 3 && Z.vivo.hidden === false);
  chk('OFF-1 con el panel cerrado, 0 cuadros', Z.cerrado.delta === 0 && Z.cerrado.raf === null);
  chk('OFF-2 en otra pestaña, 0 cuadros', Z.otraPestana.delta === 0 && Z.otraPestana.raf === null);
  chk('OFF-3 con el estudio limpio, 0 cuadros', Z.limpio.delta === 0);
  chk('PDF-1 bullseyeDataURL sigue dando el MISMO PNG', salida.Z_pdf.igual === true);
  chk('PDF-2 y sigue siendo un PNG no vacio', salida.Z_pdf.despues.largo > 1000);

  // ───────── IMG) Los cuatro PNG a /tmp, para mirarlos ─────────
  const imgs = await ev(`return (async () => {
    const out = [];
    const claro = function(on){
      document.documentElement.classList.toggle('light-mode', on);
      if (typeof lv3dAlCambiarTema === 'function') lv3dAlCambiarTema();
    };
    for (const tema of ['oscuro','claro']){
      claro(tema === 'claro');
      for (const modo of ['motilidad','territorio']){
        window.__p.escena('150','40','56');
        await window.__p.dosCuadros();
        window.__p.fijarFase(0);
        window.contrSetSegmento('basal_anterior', 1);
        window.contrSetSegmento('mid_anterior', 2);
        window.contrSetSegmento('basal_inferior', 3);
        window.contrSetSegmento('mid_inferior', 4);
        window.contrSetSegmento('basal_inferolateral', 2);
        window.contrSetSegmento('apex', 4);
        if (window.lv3dDiag().modo !== modo) window.__p.modoBoton(modo);
        await window.__p.asentar();
        window.__p.capturar();
        const c = window.lv3dCaptura();
        out.push({ tema: tema, modo: modo, url: c.url, fase: c.fase, temaRegistrado: c.tema,
                   ancho: c.ancho, alto: c.alto });
      }
    }
    claro(false);
    window.__p.quitarCaptura();
    return out;
  })();`);
  const { writeFile } = await import('node:fs/promises');
  salida.IMG = [];
  for (const im of imgs){
    const nom = '/tmp/vi3d_' + im.modo + '_' + im.tema + '.png';
    await writeFile(nom, Buffer.from(im.url.split(',')[1], 'base64'));
    salida.IMG.push({ archivo: nom, modo: im.modo, tema: im.tema, temaRegistrado: im.temaRegistrado,
                      fase: im.fase, px: im.ancho + 'x' + im.alto });
    process.stderr.write('  IMG — ' + nom + '  ' + im.ancho + 'x' + im.alto
      + '  tema registrado: ' + im.temaRegistrado + '\n');
  }
  chk('IMG-1 la captura registra el tema vigente, los dos',
      salida.IMG.filter(x => x.tema === 'claro').every(x => x.temaRegistrado === 'claro')
      && salida.IMG.filter(x => x.tema === 'oscuro').every(x => x.temaRegistrado === 'oscuro'));

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
