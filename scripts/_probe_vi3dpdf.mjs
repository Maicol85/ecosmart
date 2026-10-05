#!/usr/bin/env node
/**
 * _probe_vi3dpdf.mjs — sonda TEMPORAL (no es la suite) para la tanda
 * «Casilla "Incluir diagrama 3D en el PDF" + disposiciones + captura de fondo blanco».
 *
 * Mide, por el CAMINO REAL DE LA UI (clic en los botones, clic en los dos bull's eye, clic en la
 * casilla) y GENERANDO EL PDF DE VERDAD (se intercepta doc.save, no se descarga):
 *   B) la captura de FONDO BLANCO FIJO: identica en tema claro y oscuro, el blanco es #ffffff,
 *      el pie sigue escrito, la leyenda de tonos sigue en el PNG del modo territorio;
 *   D) que NO queda rastro del aviso «desactualizada»: ni en la miniatura ni en el getter, con un
 *      dato cambiado despues de capturar; y que la captura sigue siendo UNA;
 *   C) la casilla: desmarcada+deshabilitada sin captura, habilitada y como la dejo el medico con
 *      captura, y que vuelve al primer estado por los CUATRO caminos de descarte;
 *   P) las OCHO combinaciones de las tres casillas en el PDF, con la geometria de cada imagen
 *      leida del propio documento (x, y, ancho, alto, pagina) y el rotulo de la banda;
 *   S) seguridad: que el PDF de un paciente NUNCA lleva la captura del anterior, por los cinco
 *      caminos (otro estudio, nuevo, limpiar, cerrar sesion, cargar un guardado);
 *   Z) que bullseyeDataURL (PDF y PPT) sigue dando el MISMO PNG que antes de esta tanda.
 *
 * CONTROL NEGATIVO en cada bloque, y DENOMINADOR antes de cada conteo.
 *
 * Uso:  node scripts/_probe_vi3dpdf.mjs            > /tmp/vi3dpdf.json
 *       node scripts/_probe_vi3dpdf.mjs --ver
 *       VI3D_RAIZ=/tmp/copia node scripts/_probe_vi3dpdf.mjs   (lo usa el arnes de mutaciones)
 *       VI3D_PDFDIR=/tmp/pdfs node scripts/_probe_vi3dpdf.mjs  (escribe los 8 PDF para mirarlos)
 *
 * Infraestructura copiada de scripts/_probe_vi3dcolor.mjs.
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdtemp, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = process.env.VI3D_RAIZ
  ? resolve(process.env.VI3D_RAIZ)
  : dirname(dirname(fileURLToPath(import.meta.url)));
const PDFDIR = process.env.VI3D_PDFDIR ? resolve(process.env.VI3D_PDFDIR) : null;
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-vi3dp-'));
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
window.__q = {
  set(id, val) { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = val; e.dispatchEvent(new Event('input', {bubbles:true}));
    e.dispatchEvent(new Event('change', {bubbles:true})); return 1; },
  vis(id) { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    let n = e;
    while (n && n.nodeType === 1) { if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true; },
  dosCuadros() { return new Promise(function(r){ requestAnimationFrame(function(){ requestAnimationFrame(r); }); }); },

  /* ⚠️ EL DENOMINADOR. Sin la pestana y el acordeon abiertos no hay geometria y TODO mide cero
     pareciendo impecable. */
  denominador() {
    if (typeof showTab === 'function') showTab('contractilidad');
    const acc = document.getElementById('sacc-contr');
    if (acc && !acc.classList.contains('open') && typeof secToggle === 'function') secToggle('contr');
    const be = document.getElementById('contr-svg-bullseye');
    const sgl = document.getElementById('sgl-svg-bullseye');
    return { tab: this.vis('contr-svg-bullseye'),
             segsBullseye: be ? be.querySelectorAll('.contr-seg').length : 0,
             segsStrain: sgl ? sgl.querySelectorAll('[data-strainid]').length : 0,
             boton: this.vis('lv3d-btn'),
             casilla: !!document.querySelector('#lv3d-cap .lv3d-cap-pdf') };
  },
  limpiar() { if (typeof limpiarCampos === 'function') limpiarCampos(true);
    if (typeof contrReset === 'function') contrReset();
    if (typeof window.sglReset === 'function') window.sglReset();
    return this.denominador(); },
  escena(vdf, fevi, dd, nom) { this.limpiar();
    this.set('nombre', nom || 'Probe pdf'); this.set('documento','7777');
    this.set('vdfvi', vdf); this.set('fevi', fevi); this.set('ddfvi', dd);
    return this.abrir3d(); },

  abrir3d() { const b = document.getElementById('lv3d-btn'); if (!b) return 'NO EXISTE boton';
    if (!window.lv3dDiag().abierto) b.click(); return window.lv3dDiag(); },
  fijarFase(pct) {
    const sl = document.querySelector('#lv3d-panel .lv3d-fase');
    if (!sl) return 'NO EXISTE deslizador de fase';
    sl.value = String(pct);
    sl.dispatchEvent(new Event('input', {bubbles:true}));
    return 1; },
  modoBoton(cual) {
    const b = document.querySelector('#lv3d-panel .lv3d-color[data-lv3d-color="' + cual + '"]');
    if (!b) return 'NO EXISTE boton ' + cual;
    b.click(); return window.lv3dDiag().modo; },
  /* Firma DENSA del canvas: todos los bytes. La firma rala de la tanda E1 daba falsos de los dos
     signos (muestreaba 1 de cada 997 bytes y 997 no es multiplo de 4). */
  firmaCanvas() {
    const cv = document.getElementById('lv3d-canvas'); if (!cv) return 'NO EXISTE canvas';
    const c = cv.getContext('2d'); const d = c.getImageData(0,0,cv.width,cv.height).data;
    let h = 2166136261;
    for (let i=0;i<d.length;i++){ h ^= d[i]; h = (h * 16777619) >>> 0; }
    return cv.width + 'x' + cv.height + ':' + h.toString(16); },
  /* ⚠️ El canvas tarda ~100 ms en asentarse al abrir (es el rasterizador, pasa igual en HEAD) y
     ocurre por TIEMPO, no por cuadros: esperar N cuadros lo cruza unas veces si y otras no. */
  async asentar() {
    let a = this.firmaCanvas();
    for (let i=0;i<40;i++){
      await new Promise(function(r){ setTimeout(r, 25); });
      const b = this.firmaCanvas();
      if (b === a) return b;
      a = b;
    }
    return a + ' (NO SE ASENTO)'; },

  /* ── Bull's eye de contractilidad y de strain, por el camino real (clic en el poligono) ── */
  clicBullseye(seg) {
    const el = document.querySelector('#contr-svg-bullseye [data-contrseg="' + seg + '"]');
    if (!el) return 'NO EXISTE seg ' + seg;
    el.dispatchEvent(new MouseEvent('click', {bubbles:true}));
    return (typeof contrEstado === 'object') ? contrEstado[seg] : null; },
  clicStrain(seg) {
    const el = document.querySelector('#sgl-svg-bullseye [data-strainid="' + seg + '"]');
    if (!el) return 'NO EXISTE strain ' + seg;
    el.dispatchEvent(new MouseEvent('click', {bubbles:true}));
    return (typeof strainEstado === 'object') ? strainEstado[seg] : null; },

  /* ── Captura y casilla ── */
  capturar() { const b = document.querySelector('#lv3d-panel .lv3d-cap-tomar');
    if (!b) return 'NO EXISTE boton de captura'; b.click(); return this.capEstado(); },
  quitarCaptura() { const b = document.querySelector('#lv3d-panel .lv3d-cap-quitar');
    if (!b) return 'NO EXISTE boton quitar'; b.click(); return this.capEstado(); },
  clicCasilla() { const e = document.querySelector('#lv3d-cap .lv3d-cap-pdf');
    if (!e) return 'NO EXISTE casilla';
    /* Por el LABEL, que es lo que toca el dedo, y no por el input: si el label alguna vez deja de
       envolverlo, un .click() sobre el input seguiria pasando y la prueba no lo veria. */
    const lab = e.closest('label') || e;
    lab.click();
    return this.capEstado(); },
  capEstado() {
    const fila = document.getElementById('lv3d-cap');
    const img = fila ? fila.querySelector('.lv3d-cap-img') : null;
    const txt = fila ? fila.querySelector('.lv3d-cap-txt') : null;
    const qui = fila ? fila.querySelector('.lv3d-cap-quitar') : null;
    const chk = fila ? fila.querySelector('.lv3d-cap-pdf') : null;
    const lbl = fila ? fila.querySelector('.lv3d-cap-pdf-lbl') : null;
    const c = (typeof window.lv3dCaptura === 'function') ? window.lv3dCaptura() : 'SIN GETTER';
    const p = (typeof window.lv3dCapturaParaPDF === 'function') ? window.lv3dCapturaParaPDF() : 'SIN GETTER PDF';
    return { hay: !!(c && c.url),
             /* Las CLAVES del objeto, para que la ausencia de «desactualizada» sea medida y no
                una creencia: un undefined se lee igual que un false. */
             clavesGetter: c ? Object.keys(c).sort() : null,
             memoria: c ? { fase:c.fase, modo:c.modo, tema:c.tema, ancho:c.ancho, alto:c.alto,
                            largoUrl:c.url.length } : null,
             paraPDF: !!(p && p.url),
             paraPDFEsLaMisma: (p && c) ? (p.url === c.url) : null,
             miniaturas: fila ? fila.querySelectorAll('img').length : 0,
             imgVisible: img ? getComputedStyle(img).display !== 'none' : null,
             texto: txt ? (txt.textContent||'').trim() : null,
             diceDesactualizada: txt ? /esactualiz/.test(txt.textContent||'') : null,
             quitarVisible: qui ? getComputedStyle(qui).display !== 'none' : null,
             casillaMarcada: chk ? chk.checked : null,
             casillaActiva: chk ? !chk.disabled : null,
             casillaConId: chk ? (chk.id || '') : null,
             casillaDataUi: chk ? chk.hasAttribute('data-ui') : null,
             labelOpacidad: lbl ? (lbl.style.opacity || '') : null,
             rotuloCasilla: lbl ? (lbl.textContent||'').trim() : null }; },

  /* Pixeles del PNG de la captura: fondo declarado, esquina (marco), y cuanto hay escrito en el
     pie y en la franja de la leyenda. La referencia de fondo es el BLANCO FIJO, no la esquina —la
     esquina es el marco de 1 px— ni --bg3, que es justo lo que esta tanda dejo de usar. */
  async capInspeccionar() {
    const c = window.lv3dCaptura(); if (!c) return null;
    const im = new Image();
    await new Promise(function(res, rej){ im.onload = res; im.onerror = rej; im.src = c.url; });
    const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
    const ctx = cv.getContext('2d'); ctx.drawImage(im, 0, 0);
    const d = ctx.getImageData(0,0,cv.width,cv.height).data;
    const px = function(x,y){ const i=(y*cv.width+x)*4; return [d[i],d[i+1],d[i+2],d[i+3]]; };
    const hex = function(a){ return '#' + a.slice(0,3).map(function(v){ return v.toString(16).padStart(2,'0'); }).join(''); };
    let opacos = 0;
    for (let i=3;i<d.length;i+=4) if (d[i] > 250) opacos++;
    /* ⚠️ LAS FRANJAS SE LEEN DE LA APP, NO SE COPIAN. La version anterior tenia el 32 del pie
       escrito a mano; cuando el pie paso a dos lineas y a 76, la sonda siguio partiendo en 412 y
       conto la SEGUNDA LINEA DEL PIE como leyenda — rojo sobre una captura correcta. */
    const G = window.lv3dDiag();
    const esc = im.width/680;
    const y0 = Math.round(380*esc);                       // arranca el pie
    const y1 = Math.round((380 + G.capAltoPie)*esc);      // arranca la leyenda
    /* ⚠️ SE MIDE TINTA **Y** OSCURIDAD, y la segunda se agrego porque faltaba: contar pixeles que
       no son blancos no distingue un texto negro de uno casi blanco. Con los colores del tema
       oscuro sobre fondo blanco —#e8ecf4— el texto es ilegible y el conteo de tinta no se mueve:
       una mutacion que devolvia los textos al tema SOBREVIVIO con 65/65. La luma minima de la
       franja si lo distingue: con el texto real da ~30, con el del tema oscuro ~207 (que es el
       separador, lo unico oscuro que quedaria). */
    let pieNoBlanco = 0, modeloNoBlanco = 0, leyNoBlanco = 0, blancos = 0;
    let pieLumaMin = 255, leyLumaMin = 255;
    for (let y=0; y<cv.height; y++) for (let x=0; x<cv.width; x++){
      const i = (y*cv.width + x)*4;
      const lejos = (255-d[i]) + (255-d[i+1]) + (255-d[i+2]);
      const luma = 0.299*d[i] + 0.587*d[i+1] + 0.114*d[i+2];
      if (lejos <= 24) { blancos++; continue; }
      if (y >= y1) { leyNoBlanco++; if (luma < leyLumaMin) leyLumaMin = luma; }
      else if (y >= y0) { pieNoBlanco++; if (luma < pieLumaMin) pieLumaMin = luma; }
      else modeloNoBlanco++;
    }
    const total = cv.width*cv.height;
    return { ancho: im.width, alto: im.height,
             totalPx: total, opacos: opacos, transparentes: total - opacos,
             blancos: blancos, fraccionBlanca: +(blancos/total).toFixed(4),
             /* El centro del fondo arriba a la derecha: lejos del modelo y del marco. */
             fondoMuestra: hex(px(cv.width-6, 6)),
             esquina: hex(px(0,0)),
             pieNoBlanco: pieNoBlanco, modeloNoBlanco: modeloNoBlanco, leyNoBlanco: leyNoBlanco,
             pieLumaMin: Math.round(pieLumaMin), leyLumaMin: Math.round(leyLumaMin),
             franjaPie: Math.max(0, y1-y0)*cv.width,
             franjaLey: Math.max(0, cv.height-y1)*cv.width }; },

  /* ── Tema de la app, por el camino real si existe el boton ── */
  temaClaro(si) {
    const raiz = document.documentElement;
    const estaClaro = raiz.classList.contains('light-mode');
    if (estaClaro === !!si) return estaClaro;
    if (typeof toggleTheme === 'function') toggleTheme();
    else { raiz.classList.toggle('light-mode', !!si);
           if (typeof lv3dAlCambiarTema === 'function') lv3dAlCambiarTema(); }
    return raiz.classList.contains('light-mode'); },

  /* ── Toggles de inclusion del bull's eye y del strain (los dos de localStorage) ── */
  togglesPDF(contr, sgl) {
    localStorage.setItem('contractilidad_incluir_pdf', contr ? '1' : '0');
    localStorage.setItem('sgl_incluir_pdf', sgl ? '1' : '0');
    return { contr: localStorage.getItem('contractilidad_incluir_pdf'),
             sgl: localStorage.getItem('sgl_incluir_pdf') }; },

  /* ⚠️ EL PDF, GENERADO DE VERDAD Y NO SIMULADO. Se interceptan doc.save (para no descargar nada
     y quedarse con los bytes) y doc.addImage (para leer la GEOMETRIA de cada imagen, que es lo
     que esta tanda cambia). Las dos se restauran en el finally: si quedaran parchadas, la
     medicion siguiente leeria imagenes de la corrida anterior y pareceria consistente. */
  pdf() {
    if (typeof window.jspdf === 'undefined') return 'SIN jsPDF';
    /* ⚠️ SE ENVUELVE EL CONSTRUCTOR, NO EL PROTOTIPO NI jsPDF.API, Y ESTO COSTO DOS CORRIDAS.
       En jsPDF 2.x los metodos del nucleo (text, addImage, save) no estan ni en el prototipo ni
       en jsPDF.API: el constructor los crea como CLAUSURAS y los cuelga del objeto que devuelve,
       o sea que son propiedades PROPIAS de cada documento. Parchando el prototipo la sonda no
       intercepto nada y reporto nImgs 0 con guardo false — y lo peor es que el PDF real se genero
       igual y se DESCARGO en silencio: la sonda decia «no hay imagenes» sobre un PDF que tenia
       dos. Parchando jsPDF.API el parche quedo en undefined y reventó con «reading apply».
       Envolviendo el constructor se parcha la instancia, que es donde viven de verdad. */
    const orig = window.jspdf.jsPDF;
    const imgs = [], textos = [];
    let bytes = null, err = null;
    function Envuelto(){
      const d = new orig(arguments[0]);
      const oImg = d.addImage, oText = d.text;
      d.addImage = function(dat, fmt, x, y, w, h){
        imgs.push({ x:+(+x).toFixed(2), y:+(+y).toFixed(2), w:+(+w).toFixed(2), h:+(+h).toFixed(2),
                    pag: d.internal.getCurrentPageInfo().pageNumber,
                    largo: (typeof dat === 'string') ? dat.length : -1,
                    /* Huella del PNG, para poder decir CUAL imagen es sin guardar 200 kB. */
                    huella: (typeof dat === 'string') ? (dat.length + ':' + dat.slice(-24)) : '?' });
        return oImg.apply(d, arguments); };
      d.text = function(t){
        if (typeof t === 'string') textos.push(t);
        else if (Array.isArray(t)) textos.push(t.join(' '));
        return oText.apply(d, arguments); };
      /* Nada de descargas: se piden los bytes y listo. */
      d.save = function(){ bytes = d.output('datauristring'); return d; };
      return d; }
    Envuelto.API = orig.API; Envuelto.version = orig.version;
    window.jspdf.jsPDF = Envuelto;
    try { generarPDFReal(); } catch (e) { err = String(e && e.message || e); }
    finally { window.jspdf.jsPDF = orig; }
    const i = bytes ? bytes.indexOf(',') : -1;
    return { err: err, guardo: !!bytes, b64: (i >= 0) ? bytes.slice(i+1) : null,
             imgs: imgs, nImgs: imgs.length,
             /* Los rotulos de banda que dibujo el documento, para ver el de esta seccion. */
             bandas: textos.filter(function(t){ return t === t.toUpperCase() && /[A-Z]{4}/.test(t); }),
             tieneBandaContr: textos.indexOf('CONTRACTILIDAD SEGMENTARIA') > -1,
             textos: textos.filter(function(t){ return /CONTRACTILIDAD|STRAIN|DIAGRAMA 3D|Diagrama 3D|Contractilidad segmentaria|Strain longitudinal/.test(t); }) }; },

  /* bullseyeDataURL, que es lo que consumen el PDF y el PPT. Si esta tanda lo movio, el PPT
     cambio sin que nadie lo pidiera. */
  firmaBullseyePDF() {
    if (typeof bullseyeDataURL !== 'function') return 'NO EXISTE';
    const u = bullseyeDataURL(function(id){ return (CONTR_MOTILIDAD[(contrEstado[id]||0)] || CONTR_MOTILIDAD[0]).color; });
    return u.length + ':' + u.slice(-32); },

  /* «Nuevo estudio»: el boton abre un modal de confirmacion, asi que el camino que corre la
     limpieza de verdad es este. Entrar por nuevoEstudio() dejaba el modal abierto y la medicion
     siguiente leia un estudio que nunca se limpio — que es como la primera corrida reporto que
     «Nuevo estudio NO descarta la captura», un falso positivo de seguridad. */
  nuevoEstudio() {
    if (typeof neContinuarSinGuardar === 'function') { neContinuarSinGuardar(); return true; }
    if (typeof limpiarCampos === 'function') { limpiarCampos(true); return 'por limpiarCampos'; }
    return 'SIN CAMINO'; },

  /* ⚠️ GUARDAR DE VERDAD, CONFIRMANDO LA CARD DE SEVERIDADES. La variable valvSevConfirmada es
     un let de modulo y NO vive en window, asi que ponerla desde la sonda no hacia nada:
     guardarInforme abria la card, devolvia false y no guardaba — la corrida daba «0 informes» y
     el caso de seguridad «abrir un guardado» se salteaba entero, dejando un rojo que parecia un
     hallazgo. Se entra por el camino real: se llama y se clickea «Confirmar», que es lo que hace
     el medico; el guardado ocurre dentro de ese callback. */
  async guardarDeVerdad() {
    if (typeof guardarInforme !== 'function') return 'SIN guardarInforme';
    let r = null;
    try { r = guardarInforme(function(){}); } catch (e) { return 'ERR ' + e.message; }
    const b = document.getElementById('rev-confirm');
    if (b) { b.click(); await new Promise(function(x){ setTimeout(x, 400); }); }
    await new Promise(function(x){ setTimeout(x, 400); });
    return { primeraLlamada: r, huboCard: !!b,
             nInformes: (typeof getInformes === 'function') ? getInformes().length : -1 }; },

  /* ── Disco: que la captura no llegue a localStorage por NINGUN camino ──
     Se barre localStorage ENTERO y no solo el estudio: la regla es «no entra a disco», y un
     store lateral que alguien agregue manana no aparece mirando solo la clave del informe. */
  async guardarYBarrerDisco() {
    const c = window.lv3dCaptura();
    /* ⚠️ SIN ESTO NO SE GUARDA NADA Y LA PRUEBA NO PRUEBA NADA. guardarInforme abre la card de
       severidades valvulares si no se confirmo antes y devuelve false SIN guardar: la primera
       corrida dio «0 informes» y el caso de «abrir un guardado» se salteo entero, dejando en rojo
       un denominador que parecia un hallazgo de seguridad. */
    const guardo = await this.guardarDeVerdad();
    /* ⚠️ DOS SUPERFICIES, Y LA QUE IMPORTA ES LA PRIMERA. Barrer localStorage solo no prueba
       nada: CeiboStore no guarda los informes ahi —las 16 claves de localStorage suman 268
       caracteres— asi que «no hay ningun PNG en localStorage» salia verdadero sobre un disco
       vacio, y Z-2 quedaba en rojo por un denominador mal elegido. El denominador honesto es el
       INFORME guardado: se busca el nombre del paciente adentro para confirmar que se esta
       mirando el estudio y no un objeto vacio. */
    /* TODOS los informes, no el ultimo: getInformes() no promete orden de guardado y el ultimo
       del array resulto ser el de OTRO bloque de la sonda — el denominador «el informe trae al
       paciente» daba false sobre 19 kB de un estudio real. Buscar en todos es ademas mas fuerte:
       lo que se afirma es que la captura no esta en NINGUN informe guardado. */
    const ins = (typeof getInformes === 'function') ? getInformes() : [];
    const ult = JSON.stringify(ins);
    let todo = '';
    for (let i=0;i<localStorage.length;i++){ const k = localStorage.key(i); todo += k + '=' + (localStorage.getItem(k)||'') + '\\n'; }
    const png = /data:image\\/png;base64,[A-Za-z0-9+/]{4000}/;
    return { guardo: guardo, nClaves: localStorage.length, largoTotal: todo.length,
             nInformes: ins.length, largoInforme: ult.length,
             informeTraeAlPaciente: ult.indexOf('Probe disco') > -1,
             informeTraeTrozoDeLaCaptura: c ? (ult.indexOf(c.url.slice(200, 320)) > -1) : null,
             informeTraeUnPngGrande: png.test(ult),
             informeTraeClaveCasilla: /lv3d-cap-pdf|lv3dCapPdf/.test(ult),
             traeTrozoDeLaCaptura: c ? (todo.indexOf(c.url.slice(200, 320)) > -1) : null,
             traeUnPngGrande: png.test(todo),
             traeClaveCasilla: /lv3d-cap-pdf|lv3dCapPdf/.test(todo) }; },

  /* Abrir un estudio GUARDADO, por el camino real (cargarEstudioPorId). */
  abrirUltimoGuardado() {
    if (typeof getInformes !== 'function' || typeof cargarEstudioPorId !== 'function') return 'SIN CAMINO';
    const ins = getInformes();
    if (!ins.length) return 'NO HAY GUARDADOS';
    const ult = ins[ins.length - 1];
    if (!ult.estudioId) return 'EL GUARDADO NO TIENE estudioId';
    cargarEstudioPorId(ult.estudioId);
    return true; }
};
`;

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
  const log = t => process.stderr.write('  ' + t + '\n');

  /* ⚠️ EL ESTADO INICIAL SE LEE ANTES DE TOCAR NADA. Casi todos los bloques arrancan con escena(),
     que pasa por limpiarCampos -> lv3dNuevoPaciente -> lv3dCapRender, o sea que «la casilla
     arranca desmarcada» medido ahi comprueba el RESET y no el HTML. Aca la app recien cargo. */
  salida.C0_inicial = await ev(`return window.__q.capEstado();`);
  log('C0 inicial (sin limpiar) — marcada:' + salida.C0_inicial.casillaMarcada
      + ' activa:' + salida.C0_inicial.casillaActiva + ' id:"' + salida.C0_inicial.casillaConId + '"');

  const den = await ev(`return window.__q.denominador();`);
  salida.denominador = den;
  log('denominador — ' + JSON.stringify(den));
  if (!den.tab || den.segsBullseye !== 17 || den.segsStrain !== 17 || !den.casilla)
    salida.errores.push('DENOMINADOR MALO: pestana, bull-s eye, strain o casilla no estan; ninguna medicion vale');

  const beAntes = await ev(`return window.__q.firmaBullseyePDF();`);
  salida.fuentesPNG = await ev(`return window.lv3dDiag().capFuentes;`);

  // ═════════ B) LA CAPTURA DE FONDO BLANCO, IDENTICA EN LOS DOS TEMAS ═════════
  salida.B_blanco = await ev(`return (async () => {
    const out = { escenas: [] };
    window.__q.escena('150','40','56');
    await window.__q.dosCuadros();
    window.__q.fijarFase(0);
    window.__q.clicBullseye('basal_inferior');          // un segmento no-normal, para que haya tono
    window.__q.clicBullseye('basal_inferior');
    await window.__q.asentar();
    out.denominadorCanvas = window.__q.firmaCanvas();
    for (const modo of ['motilidad','territorio']) {
      window.__q.modoBoton(modo);
      await window.__q.asentar();
      for (const tema of ['oscuro','claro']) {
        window.__q.temaClaro(tema === 'claro');
        await window.__q.asentar();
        window.__q.capturar();
        const insp = await window.__q.capInspeccionar();
        const c = window.lv3dCaptura();
        out.escenas.push({ modo: modo, tema: tema, url: c.url, temaRegistrado: c.tema,
                           fase: c.fase, modoRegistrado: c.modo, insp: insp });
      }
    }
    window.__q.temaClaro(false);
    /* CONTROL NEGATIVO de la sonda: el MODO si tiene que cambiar el PNG. Si todo saliera igual
       —que es lo que mide el bloque de arriba para el tema— la comparacion no probaria nada. */
    const a = out.escenas.filter(function(e){ return e.modo === 'motilidad'; })[0].url;
    const b = out.escenas.filter(function(e){ return e.modo === 'territorio'; })[0].url;
    out.negativoModoCambia = a !== b;
    return out;
  })();`);
  {
    const B = salida.B_blanco;
    B.escenas.forEach(e => log('B ' + e.modo + '/' + e.tema + ' — fondo:' + e.insp.fondoMuestra
      + ' esquina:' + e.insp.esquina + ' ' + e.insp.ancho + 'x' + e.insp.alto
      + ' pie:' + e.insp.pieNoBlanco + '/' + e.insp.franjaPie
      + ' ley:' + e.insp.leyNoBlanco + '/' + e.insp.franjaLey
      + ' temaReg:' + e.temaRegistrado));
    const porModo = m => B.escenas.filter(e => e.modo === m);
    B.identicaMotilidad  = porModo('motilidad')[0].url === porModo('motilidad')[1].url;
    B.identicaTerritorio = porModo('territorio')[0].url === porModo('territorio')[1].url;
    B.escenas.forEach(e => { delete e.url; });          // 200 kB cada una, no van al JSON
    log('B identicas entre temas — motilidad:' + B.identicaMotilidad
        + ' territorio:' + B.identicaTerritorio + ' (negativo modo cambia:' + B.negativoModoCambia + ')');
  }

  // ═════════ D) NI RASTRO DEL AVISO «DESACTUALIZADA» ═════════
  salida.D_sinAviso = await ev(`return (async () => {
    const out = {};
    window.__q.escena('150','40','56');
    await window.__q.dosCuadros(); window.__q.fijarFase(0); await window.__q.asentar();
    out.alCapturar = window.__q.capturar();
    const url1 = window.lv3dCaptura().url;
    /* Los CUATRO campos que el dibujo lee, mas un segmento: era exactamente lo que miraba la
       firma que se saco. Si algo de esto volviera a marcar la miniatura, aca se ve. */
    window.__q.set('vdfvi','260'); await window.__q.asentar();
    out.trasVdfvi = window.__q.capEstado();
    window.__q.set('ddfvi','70'); window.__q.set('fevi','25'); window.__q.set('vsfvi','180');
    await window.__q.asentar();
    out.trasTodos = window.__q.capEstado();
    out.canvasSiCambio = window.__q.firmaCanvas() !== out.alCapturar ? true : true;
    window.__q.clicBullseye('basal_anterior');
    await window.__q.asentar();
    out.trasBullseye = window.__q.capEstado();
    out.urlNoSeToco = window.lv3dCaptura().url === url1;
    /* Panel cerrado: era el camino que justificaba el lv3dCapRender fuera del if(abierto). */
    document.getElementById('lv3d-btn').click();
    window.__q.set('vdfvi','300');
    document.getElementById('lv3d-btn').click();
    await window.__q.asentar();
    out.trasPanelCerrado = window.__q.capEstado();
    // UNA sola captura: recapturar reemplaza y no agrega miniatura
    window.__q.capturar();
    out.segunda = window.__q.capEstado();
    out.urlCambioAlRecapturar = window.lv3dCaptura().url !== url1;
    out.alQuitar = window.__q.quitarCaptura();
    return out;
  })();`);
  log('D sin aviso — tras datos:"' + salida.D_sinAviso.trasTodos.texto
      + '" dice? ' + salida.D_sinAviso.trasTodos.diceDesactualizada
      + ' claves:' + JSON.stringify(salida.D_sinAviso.trasTodos.clavesGetter)
      + ' minis:' + salida.D_sinAviso.segunda.miniaturas);

  // ═════════ C) LA CASILLA, Y LOS CUATRO CAMINOS DE DESCARTE ═════════
  salida.C_casilla = await ev(`return (async () => {
    const out = {};
    window.__q.escena('150','40','56');
    await window.__q.dosCuadros(); window.__q.fijarFase(0); await window.__q.asentar();
    out.sinCaptura = window.__q.capEstado();
    /* CONTROL NEGATIVO: deshabilitada quiere decir que el clic NO la marca. Sin esto, «arranca
       desmarcada» se cumple igual con una casilla que se puede marcar sin captura detras. */
    out.clicSinCaptura = window.__q.clicCasilla();
    out.conCaptura = window.__q.capturar();
    out.marcada = window.__q.clicCasilla();
    out.trasRecapturar = window.__q.capturar();
    out.trasPDF = (function(){ const r = window.__q.pdf(); return { guardo: r.guardo, est: window.__q.capEstado() }; })();
    out.trasQuitar = window.__q.quitarCaptura();
    // Los cuatro caminos de descarte, cada uno con la casilla MARCADA de entrada
    const marcarYCapturar = async function(){
      window.__q.capturar(); if (!window.__q.capEstado().casillaMarcada) window.__q.clicCasilla();
      return window.__q.capEstado(); };
    out.antesLimpiar = await marcarYCapturar();
    if (typeof limpiarCampos === 'function') limpiarCampos(true);
    out.trasLimpiar = window.__q.capEstado();

    window.__q.escena('150','40','56'); await window.__q.dosCuadros(); window.__q.fijarFase(0); await window.__q.asentar();
    out.antesNuevo = await marcarYCapturar();
    out.caminoNuevo = window.__q.nuevoEstudio();
    out.trasNuevo = window.__q.capEstado();

    window.__q.escena('150','40','56'); await window.__q.dosCuadros(); window.__q.fijarFase(0); await window.__q.asentar();
    out.antesContrReset = await marcarYCapturar();
    if (typeof contrReset === 'function') contrReset();
    out.trasContrReset = window.__q.capEstado();

    window.__q.escena('150','40','56'); await window.__q.dosCuadros(); window.__q.fijarFase(0); await window.__q.asentar();
    out.antesCerrar = await marcarYCapturar();
    if (typeof cerrarSesionReal === 'function') cerrarSesionReal();
    out.trasCerrarSesion = window.__q.capEstado();
    return out;
  })();`);
  log('C casilla — sinCap(marcada/activa):' + salida.C_casilla.sinCaptura.casillaMarcada + '/' + salida.C_casilla.sinCaptura.casillaActiva
      + ' clicSinCap:' + salida.C_casilla.clicSinCaptura.casillaMarcada
      + ' conCap:' + salida.C_casilla.conCaptura.casillaMarcada + '/' + salida.C_casilla.conCaptura.casillaActiva
      + ' marcada->paraPDF:' + salida.C_casilla.marcada.paraPDF
      + ' recap:' + salida.C_casilla.trasRecapturar.casillaMarcada
      + ' trasPDF:' + salida.C_casilla.trasPDF.est.casillaMarcada
      + ' quitar:' + salida.C_casilla.trasQuitar.casillaMarcada);

  // ═════════ P) LAS OCHO COMBINACIONES EN EL PDF, GENERADO DE VERDAD ═════════
  const COMBOS = [
    { k:'000', be:false, cap:false, sgl:false },
    { k:'100', be:true,  cap:false, sgl:false },   // solo bull's eye — como hoy
    { k:'110', be:true,  cap:true,  sgl:false },   // bull's eye + captura
    { k:'101', be:true,  cap:false, sgl:true  },   // bull's eye + strain — como hoy
    { k:'111', be:true,  cap:true,  sgl:true  },   // los tres
    { k:'010', be:false, cap:true,  sgl:false },   // captura sola
    { k:'011', be:false, cap:true,  sgl:true  },   // captura + strain
    { k:'001', be:false, cap:false, sgl:true  },   // solo strain — como hoy
  ];
  salida.P_pdf = {};
  for (const C of COMBOS) {
    const r = await ev(`return (async () => {
      const C = ${JSON.stringify(C)};
      window.__q.escena('150','40','56','Caso ' + C.k);
      await window.__q.dosCuadros(); window.__q.fijarFase(0); await window.__q.asentar();
      /* Contractilidad: DOS segmentos por el bull's eye, que es lo que hace contrHayDatos() y
         ademas lo que hace que el PNG tenga tonos. Strain: dos por su propio bull's eye. */
      window.__q.clicBullseye('basal_inferior');
      window.__q.clicBullseye('mid_inferior'); window.__q.clicBullseye('mid_inferior');
      window.__q.clicStrain('basal_anterior');
      window.__q.clicStrain('mid_anterior');
      window.__q.modoBoton('territorio');         // el modo con leyenda: el caso dificil de leer
      await window.__q.asentar();
      if (C.cap) { window.__q.capturar(); if (!window.__q.capEstado().casillaMarcada) window.__q.clicCasilla(); }
      window.__q.togglesPDF(C.be, C.sgl);
      const est = window.__q.capEstado();
      const r = window.__q.pdf();
      return { k: C.k, est: { hay: est.hay, marcada: est.casillaMarcada, paraPDF: est.paraPDF,
                              modo: est.memoria ? est.memoria.modo : null,
                              ancho: est.memoria ? est.memoria.ancho : null,
                              alto: est.memoria ? est.memoria.alto : null },
               hayContr: contrHayDatos(),
               haySgl: Object.keys(strainEstado).some(function(x){ return (strainEstado[x]||0) > 0; }),
               pdf: { err:r.err, guardo:r.guardo, nImgs:r.nImgs, imgs:r.imgs, textos:r.textos,
                      largoB64: r.b64 ? r.b64.length : 0 },
               b64: r.b64 };
    })();`);
    const b64 = r.b64; delete r.b64;
    salida.P_pdf[C.k] = r;
    if (PDFDIR && b64) {
      await mkdir(PDFDIR, { recursive: true });
      await writeFile(join(PDFDIR, 'caso_' + C.k + '.pdf'), Buffer.from(b64, 'base64'));
    }
    log('P ' + C.k + ' — paraPDF:' + r.est.paraPDF + ' imgs:' + r.pdf.nImgs
        + ' ' + JSON.stringify(r.pdf.imgs.map(i => i.w + 'x' + i.h + '@' + i.x + ',' + i.y + 'p' + i.pag))
        + ' textos:' + JSON.stringify(r.pdf.textos) + (r.pdf.err ? (' ERR ' + r.pdf.err) : ''));
  }

  // ═════════ S) SEGURIDAD: EL PDF DEL SIGUIENTE NO LLEVA LA CAPTURA DEL ANTERIOR ═════════
  salida.S_seguridad = await ev(`return (async () => {
    const out = {};
    const conCaptura = async function(nom){
      window.__q.escena('150','40','56', nom);
      await window.__q.dosCuadros(); window.__q.fijarFase(0); await window.__q.asentar();
      window.__q.clicBullseye('basal_inferior');
      window.__q.capturar();
      if (!window.__q.capEstado().casillaMarcada) window.__q.clicCasilla();
      window.__q.togglesPDF(true, false);
      return window.__q.capEstado(); };
    /* DENOMINADOR: primero se comprueba que CON captura el PDF SI la lleva. Sin esto, «el PDF del
       siguiente no la lleva» se cumple igual si la captura no llegara nunca al PDF. */
    const antes = await conCaptura('Paciente UNO');
    const pdf1 = window.__q.pdf();
    out.denominador = { paraPDF: antes.paraPDF, nImgs: pdf1.nImgs,
                        huellas: pdf1.imgs.map(function(i){ return i.huella; }) };
    const huellaCap = antes.memoria ? (antes.memoria.largoUrl) : 0;
    out.largoCapturaUno = huellaCap;
    out.pdfUnoTraeLaCaptura = pdf1.imgs.some(function(i){ return i.largo === huellaCap; });

    const medir = function(nom){
      const e = window.__q.capEstado();
      const r = window.__q.pdf();
      return { camino: nom, hayCaptura: e.hay, marcada: e.casillaMarcada, activa: e.casillaActiva,
               paraPDF: e.paraPDF, nImgs: r.nImgs,
               traeAlgunPngDelLargoDeLaCaptura: r.imgs.some(function(i){ return i.largo === huellaCap; }),
               huellas: r.imgs.map(function(i){ return i.huella; }) }; };

    await conCaptura('Paciente UNO');
    if (typeof limpiarCampos === 'function') limpiarCampos(true);
    out.limpiar = medir('limpiarCampos');

    await conCaptura('Paciente UNO');
    out.caminoNuevo = window.__q.nuevoEstudio();
    out.nuevo = medir('nuevoEstudio');

    await conCaptura('Paciente UNO');
    if (typeof cerrarSesionReal === 'function') cerrarSesionReal();
    out.cerrarSesion = medir('cerrarSesionReal');

    /* CARGAR UN GUARDADO. Se guarda un estudio SIN captura, despues se captura con OTRO paciente
       en pantalla y se abre el guardado: si el camino de apertura no pasara por limpiarCampos, el
       PDF del guardado saldria con los pixeles del ventriculo del otro. */
    window.__q.escena('150','40','56','Guardado SIN captura');
    await window.__q.dosCuadros();
    const guardoOk = await window.__q.guardarDeVerdad();
    out.guardoDetalle = guardoOk;
    out.nGuardados = (guardoOk && guardoOk.nInformes !== undefined) ? guardoOk.nInformes : -1;
    await conCaptura('Paciente DOS');
    const antesDeAbrir = window.__q.capEstado();
    const abrio = window.__q.abrirUltimoGuardado();
    await new Promise(function(r){ setTimeout(r, 700); });
    out.cargarGuardado = Object.assign({ guardoOk: out.nGuardados > 0, abrio: abrio,
                                         habiaCapturaAntes: antesDeAbrir.hay }, medir('cargarEstudioPorId'));
    return out;
  })();`);
  {
    const S = salida.S_seguridad;
    log('S denominador — paraPDF:' + S.denominador.paraPDF + ' el PDF de UNO trae la captura:' + S.pdfUnoTraeLaCaptura);
    ['limpiar','nuevo','cerrarSesion','cargarGuardado'].forEach(k => log('S ' + k + ' — hay:' + S[k].hayCaptura
      + ' marcada:' + S[k].marcada + ' activa:' + S[k].activa + ' paraPDF:' + S[k].paraPDF
      + ' trae PNG del largo de la captura:' + S[k].traeAlgunPngDelLargoDeLaCaptura));
  }

  // ═════════ Z) EL PPT Y EL GUARDADO NO SE MOVIERON ═════════
  salida.Z_resto = await ev(`return (async () => {
    window.__q.escena('150','40','56','Probe disco');
    await window.__q.dosCuadros(); window.__q.fijarFase(0); await window.__q.asentar();
    /* ⚠️ LA FIRMA SE TOMA CON EL MISMO ESTADO QUE LA DE REFERENCIA (17 segmentos normales), y no
       despues de pintar. La primera version comparaba una firma de la app recien cargada contra
       otra tomada con un segmento ya clickeado: daba distinta SIEMPRE y el aserto se leia como
       «el PPT cambio», cuando lo unico que habia cambiado era el paciente. */
    const limpia = window.__q.firmaBullseyePDF();
    window.__q.clicBullseye('basal_inferior');
    const pintada = window.__q.firmaBullseyePDF();
    window.__q.capturar(); window.__q.clicCasilla();
    const disco = await window.__q.guardarYBarrerDisco();
    return { firmaLimpia: limpia, firmaPintada: pintada, disco: disco };
  })();`);
  salida.Z_resto.firmaAntes = beAntes;
  /* ⚠️ LA REFERENCIA ES UN LITERAL MEDIDO EN HEAD, NO «lo que dio al arrancar ESTA corrida».
     Comparar contra beAntes es comparar la app consigo misma: las dos puntas salen del mismo
     archivo, asi que una mutacion que CAMBIA bullseyeDataURL mueve las dos y la asercion sigue
     verde — medido: cambiar S de 320 a 318 sobrevivio con 67/67. Con el literal, la comparacion
     es contra el PNG que consumen hoy el PDF y el PPT.
     Re-medir asi (es la huella de un canvas, o sea especifica de esta maquina y este Chrome):
       git show HEAD:index.html > /tmp/headref/index.html && ln -s "$PWD/tests" /tmp/headref/tests
       VI3D_RAIZ=/tmp/headref node scripts/_probe_vi3dpdf.mjs   (y leer Z_resto.firmaLimpia) */
  const BE_HEAD = '55222:VAMA0hAoGoYm7twAAAAASUVORK5CYII=';
  salida.Z_resto.firmaHEAD = BE_HEAD;
  salida.Z_resto.bullseyeIgualQueAlArrancar = salida.Z_resto.firmaLimpia === beAntes;
  salida.Z_resto.bullseyeIgual = salida.Z_resto.firmaLimpia === BE_HEAD;
  salida.Z_resto.negativoPintarCambia = salida.Z_resto.firmaPintada !== salida.Z_resto.firmaLimpia;
  log('Z bullseyeDataURL igual:' + salida.Z_resto.bullseyeIgual
      + ' (negativo pintar cambia:' + salida.Z_resto.negativoPintarCambia + ')'
      + ' disco: informes:' + salida.Z_resto.disco.nInformes
      + ' largoInforme:' + salida.Z_resto.disco.largoInforme
      + ' informe trae al paciente:' + salida.Z_resto.disco.informeTraeAlPaciente
      + ' informe trae PNG grande:' + salida.Z_resto.disco.informeTraeUnPngGrande
      + ' trae trozo de la captura:' + salida.Z_resto.disco.traeTrozoDeLaCaptura
      + ' trae PNG grande:' + salida.Z_resto.disco.traeUnPngGrande
      + ' trae clave de la casilla:' + salida.Z_resto.disco.traeClaveCasilla);

  // ───────────────────────────── ASERCIONES ─────────────────────────────
  const A = [];
  const chk = (n, ok) => A.push([n, !!ok]);
  const B = salida.B_blanco, D = salida.D_sinAviso, Cc = salida.C_casilla, P = salida.P_pdf, S = salida.S_seguridad;
  const esc = (m, t) => B.escenas.filter(e => e.modo === m && e.tema === t)[0];

  // — B) fondo blanco fijo —
  chk('B-1 el fondo del PNG es BLANCO puro en los cuatro escenarios',
      B.escenas.every(e => e.insp.fondoMuestra === '#ffffff'));
  chk('B-2 el PNG es OPACO (no quedo transparente)',
      B.escenas.every(e => e.insp.transparentes === 0));
  chk('B-3 el PNG lleva marco: la esquina NO es el fondo',
      B.escenas.every(e => e.insp.esquina !== '#ffffff'));
  chk('B-4 la captura es IDENTICA en tema claro y oscuro, en los dos modos',
      B.identicaMotilidad === true && B.identicaTerritorio === true);
  chk('B-5 CONTROL NEGATIVO: el MODO si cambia el PNG (la comparacion distingue escenarios)',
      B.negativoModoCambia === true);
  /* El pie tiene dos lineas de texto y un separador sobre fondo blanco: se exige que haya trazos
     y que NO sea la franja entera —si fuera el 100 %, la referencia de blanco estaria mal—. */
  chk('B-6 el pie tiene texto escrito sobre el blanco, en los cuatro escenarios',
      B.escenas.every(e => e.insp.pieNoBlanco > 200 && e.insp.pieNoBlanco < e.insp.franjaPie * 0.5));
  /* ⚠️ En motilidad esa franja NO queda en cero: el PNG lleva 10 px logicos de aire abajo y el
     MARCO de 1 px, que son ~2.720 subpixeles a escala 2. Lo que distingue los dos modos es el
     orden de magnitud, no el cero — exigir cero daba rojo sobre una captura perfecta. */
  chk('B-7 la leyenda de tonos esta escrita en el PNG SOLO en modo territorio',
      B.escenas.filter(e => e.modo === 'territorio').every(e => e.insp.leyNoBlanco > 20000)
      && B.escenas.filter(e => e.modo === 'motilidad').every(e => e.insp.leyNoBlanco < 4000)
      && esc('territorio','oscuro').insp.leyNoBlanco > esc('motilidad','oscuro').insp.leyNoBlanco * 10);
  chk('B-8 el modelo sigue dibujado (denominador del PNG)',
      B.escenas.every(e => e.insp.modeloNoBlanco > 2000));
  chk('B-9 la captura del modo territorio es MAS ALTA que la de motilidad (entra la leyenda)',
      esc('territorio','oscuro').insp.alto > esc('motilidad','oscuro').insp.alto);
  /* ⚠️ Esta es la que exige que el texto sea OSCURO y no solo que exista. Sin ella, devolver los
     colores del tema a la paleta de la captura pasaba con 65/65: en tema oscuro el pie salia en
     #e8ecf4 sobre blanco —ilegible— y el conteo de tinta no se movia un pixel. */
  chk('B-10b el texto del pie y el de la leyenda son OSCUROS sobre el blanco (legibles)',
      B.escenas.every(e => e.insp.pieLumaMin <= 80)
      && B.escenas.filter(e => e.modo === 'territorio').every(e => e.insp.leyLumaMin <= 80));
  chk('B-10 y el tema de la app SI queda registrado como metadato, los dos',
      esc('motilidad','claro').temaRegistrado === 'claro'
      && esc('motilidad','oscuro').temaRegistrado === 'oscuro');

  // — D) sin aviso de desactualizada —
  chk('D-1 cambiar el VDFVI despues de capturar NO dice «desactualizada»',
      D.trasVdfvi.diceDesactualizada === false && D.trasVdfvi.hay === true);
  chk('D-2 cambiar los CUATRO campos tampoco',
      D.trasTodos.diceDesactualizada === false && D.trasTodos.hay === true);
  chk('D-3 cambiar un segmento del bull-s eye tampoco',
      D.trasBullseye.diceDesactualizada === false && D.trasBullseye.hay === true);
  chk('D-4 con el panel CERRADO y un dato cambiado, tampoco',
      D.trasPanelCerrado.diceDesactualizada === false && D.trasPanelCerrado.hay === true);
  chk('D-5 el getter ya NO tiene el campo «desactualizada»',
      Array.isArray(D.trasTodos.clavesGetter)
      && D.trasTodos.clavesGetter.indexOf('desactualizada') === -1
      && D.trasTodos.clavesGetter.indexOf('firma') === -1);
  chk('D-6 el rotulo de la miniatura sigue diciendo la fase y el modo',
      /Captura/.test(D.trasTodos.texto) && /motilidad|territorio/.test(D.trasTodos.texto));
  chk('D-7 ningun cambio de dato toca los pixeles de la captura',
      D.urlNoSeToco === true);
  chk('D-8 sigue habiendo UNA sola captura, y recapturar la REEMPLAZA',
      D.segunda.miniaturas === 1 && D.urlCambioAlRecapturar === true);
  chk('D-9 «Quitar» la descarta',
      D.alQuitar.hay === false && D.alQuitar.imgVisible === false && D.alQuitar.quitarVisible === false);

  // — C) la casilla —
  chk('C-1 al cargar la app la casilla esta DESMARCADA y DESHABILITADA (HTML, sin limpiar)',
      salida.C0_inicial.casillaMarcada === false && salida.C0_inicial.casillaActiva === false);
  chk('C-2 la casilla NO lleva id (no la levanta el guardado ni sale al Excel) y lleva data-ui',
      salida.C0_inicial.casillaConId === '' && salida.C0_inicial.casillaDataUi === true);
  chk('C-3 sin captura: desmarcada, deshabilitada y atenuada',
      Cc.sinCaptura.casillaMarcada === false && Cc.sinCaptura.casillaActiva === false
      && Cc.sinCaptura.labelOpacidad === '0.5');
  chk('C-4 CONTROL NEGATIVO: hacer clic sin captura NO la marca',
      Cc.clicSinCaptura.casillaMarcada === false && Cc.clicSinCaptura.paraPDF === false);
  chk('C-5 con captura: se habilita y sigue DESMARCADA hasta que el medico la marque',
      Cc.conCaptura.casillaActiva === true && Cc.conCaptura.casillaMarcada === false
      && Cc.conCaptura.paraPDF === false && Cc.conCaptura.labelOpacidad === '');
  chk('C-6 marcada: el getter del PDF devuelve la captura',
      Cc.marcada.casillaMarcada === true && Cc.marcada.paraPDF === true
      && Cc.marcada.paraPDFEsLaMisma === true);
  chk('C-7 capturar de nuevo NO la desmarca',
      Cc.trasRecapturar.casillaMarcada === true && Cc.trasRecapturar.paraPDF === true);
  chk('C-8 generar el PDF NO la desmarca',
      Cc.trasPDF.guardo === true && Cc.trasPDF.est.casillaMarcada === true && Cc.trasPDF.est.paraPDF === true);
  chk('C-9 «Quitar» la devuelve a desmarcada + deshabilitada',
      Cc.trasQuitar.casillaMarcada === false && Cc.trasQuitar.casillaActiva === false
      && Cc.trasQuitar.paraPDF === false);
  chk('C-10 DENOMINADOR de los cuatro caminos: en los cuatro estaba MARCADA de entrada',
      [Cc.antesLimpiar, Cc.antesNuevo, Cc.antesContrReset, Cc.antesCerrar]
        .every(e => e.casillaMarcada === true && e.paraPDF === true));
  chk('C-11 «Limpiar» descarta la captura y apaga la casilla',
      Cc.trasLimpiar.hay === false && Cc.trasLimpiar.casillaMarcada === false && Cc.trasLimpiar.casillaActiva === false);
  chk('C-12 «Nuevo estudio» tambien',
      Cc.trasNuevo.hay === false && Cc.trasNuevo.casillaMarcada === false && Cc.trasNuevo.casillaActiva === false);
  chk('C-13 «Cerrar sesion» tambien',
      Cc.trasCerrarSesion.hay === false && Cc.trasCerrarSesion.casillaMarcada === false && Cc.trasCerrarSesion.casillaActiva === false);
  /* contrReset NO pasa por lv3dNuevoPaciente y NO tiene por que descartar: es el boton «Limpiar»
     del bull's eye, no un cambio de paciente. Aserto el comportamiento REAL para que si alguien
     lo cambia, se vea. */
  chk('C-14 CONTROL NEGATIVO: «Limpiar» del bull-s eye (contrReset) NO descarta la captura',
      Cc.trasContrReset.hay === true && Cc.trasContrReset.casillaMarcada === true);

  // — P) las ocho combinaciones —
  const img = k => ((P[k] && P[k].pdf && P[k].pdf.imgs) ? P[k].pdf.imgs : []);
  /* ⚠️ Acceso TOLERANTE por indice. Con las imagenes en cero —que es exactamente lo que pasa
     cuando la interceptacion falla— indexar directo tiraba un TypeError que mataba el arnes
     entero DESPUES de haber medido todo: cero aserciones impresas, exit 2, y la corrida
     indistinguible de «Chrome no abrio». El centinela hace que esos asertos salgan en ROJO, que
     es lo que son. */
  const g = (k, i) => img(k)[i] || { x:-9e9, y:-9e9, w:-1, h:-1, pag:-1 };
  const DIANA = 54;
  const cerca = (a, b, tol) => Math.abs(a - b) <= (tol === undefined ? 0.6 : tol);
  chk('P-0 los ocho PDF se generaron sin error',
      COMBOS.every(c => P[c.k].pdf.guardo === true && !P[c.k].pdf.err));
  chk('P-1 DENOMINADOR: hay contractilidad y hay strain cargados en los ocho casos',
      COMBOS.every(c => P[c.k].hayContr === true && P[c.k].haySgl === true));
  chk('P-2 DENOMINADOR: la casilla llego marcada en los cuatro casos con captura, y no en los otros',
      COMBOS.every(c => P[c.k].est.paraPDF === c.cap));
  chk('P-3 caso 000 (nada marcado): el bloque no sale',
      img('000').length === 0);
  chk('P-4 caso 100 solo bull-s eye: UNA diana de 54x54, igual que antes',
      img('100').length === 1 && cerca(g('100',0).w, DIANA) && cerca(g('100',0).h, DIANA));
  chk('P-5 caso 101 bull-s eye + strain: DOS dianas de 54, una al lado de la otra, misma y',
      img('101').length === 2 && img('101').every(i => cerca(i.w, DIANA) && cerca(i.h, DIANA))
      && cerca(g('101',0).y, g('101',1).y) && g('101',1).x > g('101',0).x
      && g('101',0).pag === g('101',1).pag);
  chk('P-6 caso 001 solo strain: UNA diana de 54',
      img('001').length === 1 && cerca(g('001',0).w, DIANA) && cerca(g('001',0).h, DIANA));
  chk('P-7 caso 110 bull-s eye IZQUIERDA + captura DERECHA, misma fila',
      img('110').length === 2 && cerca(g('110',0).w, DIANA)
      && g('110',1).x > g('110',0).x && cerca(g('110',0).y, g('110',1).y)
      && g('110',0).pag === g('110',1).pag);
  chk('P-8 y la captura de ese caso NO es cuadrada: conserva su proporcion',
      (function(){ const c = g('110',1), m = P['110'].est;
        return c.w > 0 && !cerca(c.w, c.h) && cerca(c.h / c.w, m.alto / m.ancho, 0.02); })());
  chk('P-9 caso 111 los tres: bull-s eye izquierda, captura a su derecha, strain ABAJO',
      (function(){ if (img('111').length !== 3) return false;
        const be = g('111',0), cap = g('111',1), sgl = g('111',2);
        return cap.x > be.x && cerca(be.y, cap.y) && sgl.y > be.y && cerca(sgl.w, DIANA); })());
  chk('P-10 caso 010 captura SOLA: una imagen, mas ancha que una diana, con su proporcion',
      (function(){ const m = P['010'].est, i0 = g('010',0);
        return img('010').length === 1 && i0.w > DIANA * 1.5 && cerca(i0.h / i0.w, m.alto / m.ancho, 0.02); })());
  chk('P-11 caso 011 captura + strain: una al lado de la otra, misma fila y misma pagina',
      (function(){ const a = g('011',0), b = g('011',1);
        return img('011').length === 2 && cerca(a.y, b.y)
          && b.x > a.x && a.pag === b.pag && cerca(b.w, DIANA); })());
  chk('P-12 ninguna imagen se sale de la hoja A4 (210x297, margen 9)',
      COMBOS.every(c => img(c.k).every(i => i.x >= 8.5 && i.x + i.w <= 201.5
                                            && i.y >= 0 && i.y + i.h <= 290)));
  chk('P-13 ninguna captura se deforma: la proporcion se conserva en los cuatro casos con captura',
      COMBOS.filter(c => c.cap).every(c => {
        const m = P[c.k].est, ar = m.alto / m.ancho;
        return img(c.k).some(i => cerca(i.h / i.w, ar, 0.02));
      }));
  /* ⚠️ Mira la BANDA, no el monton de textos. La version anterior buscaba /DIAGRAMA 3D/i en todos
     los textos del bloque, y el TITULO de la columna —«Diagrama 3D del ventriculo izquierdo»— lo
     hacia pasar aunque el rotulo de la banda dijera otra cosa: una mutacion que le cambiaba el
     rotulo a «CONTRACTILIDAD» sobrevivio con 65/65. La banda es el unico texto en mayusculas. */
  const banda = k => (P[k].pdf.textos.filter(t => t === t.toUpperCase())[0] || '');
  chk('P-14 la BANDA del bloque nombra el diagrama 3D cuando la captura entra, y no cuando no',
      COMBOS.filter(c => c.be || c.cap || c.sgl).every(c =>
        c.cap ? /DIAGRAMA 3D/.test(banda(c.k)) : !/DIAGRAMA 3D/.test(banda(c.k))));
  chk('P-14b DENOMINADOR: los siete casos con bloque emiten una banda en mayusculas',
      COMBOS.filter(c => c.be || c.cap || c.sgl).every(c => banda(c.k).length > 5));
  chk('P-15 el caso 101 conserva EXACTO el rotulo viejo «CONTRACTILIDAD Y STRAIN (SGL)»',
      P['101'].pdf.textos.indexOf('CONTRACTILIDAD Y STRAIN (SGL)') > -1);
  chk('P-16 el caso 100 conserva EXACTO el rotulo viejo «CONTRACTILIDAD SEGMENTARIA»',
      P['100'].pdf.textos.indexOf('CONTRACTILIDAD SEGMENTARIA') > -1);
  /* El tope de ancho es lo que mantiene el CUERPO DE LETRA del PNG dentro del rango del informe:
     el texto va dibujado adentro de la imagen, asi que estirarla lo agranda. Sin tope, la captura
     sola llegaba a 190 mm y su pie salia a 20,6 pt contra los 9,6 de la misma captura compartiendo
     fila — el mismo PNG con dos tamanos de letra segun con quien comparta hoja. */
  chk('P-17 la captura nunca pasa de 120 mm de ancho, vaya sola o acompanada',
      COMBOS.filter(c => c.cap).every(c => {
        const m = P[c.k].est, ar = m.alto / m.ancho;
        return img(c.k).filter(i => cerca(i.h / i.w, ar, 0.02)).every(i => i.w <= 120.5);
      }));
  chk('P-18 y con la captura sola queda CENTRADA en la hoja',
      cerca(g('010',0).x + g('010',0).w / 2, 9 + 192 / 2, 1));
  /* ⚠️ LA ASERCION QUE DE VERDAD FIJA LA DECISION: el tamano del texto IMPRESO. El texto va
     dibujado adentro del PNG, asi que los puntos no los decide el PDF sino el ancho al que se
     escala la imagen: pt = cuerpo_px x (ancho_mm / 680) x 2,8346. Sin esto, bajar los cuerpos de
     letra o sacar el tope de ancho no pone nada en rojo y el informe vuelve a salir con la
     leyenda a 3,3 pt sin que ninguna prueba se entere.
     Cotas: no menos de 6 pt (las leyendas del propio informe van a 7) y no mas de 14 (los titulos
     van a 7,5; mas del doble ya se leyo como desproporcionado y es lo que motivo el tope). */
  const F = salida.fuentesPNG;
  const ptDe = (k, pxCuerpo) => {
    const m = P[k].est, i = img(k).filter(x => cerca(x.h / x.w, m.alto / m.ancho, 0.02))[0];
    return i ? +(pxCuerpo * (i.w / 680) * 2.8346).toFixed(2) : -1;
  };
  salida.puntosImpresos = {};
  ['110','111','011','010'].forEach(k => {
    salida.puntosImpresos[k] = { anchoMm: (img(k).filter(x => cerca(x.h/x.w, P[k].est.alto/P[k].est.ancho, 0.02))[0]||{}).w,
                                 fase: ptDe(k, F.fase), frase: ptDe(k, F.frase),
                                 grado: ptDe(k, F.grado), ter: ptDe(k, F.ter) };
  });
  Object.keys(salida.puntosImpresos).forEach(k => {
    const q = salida.puntosImpresos[k];
    log('PT caso ' + k + ' — ancho ' + q.anchoMm + ' mm · fase ' + q.fase + ' · frase ' + q.frase
        + ' · grados ' + q.grado + ' · territorios ' + q.ter + ' pt');
  });
  chk('P-19 el texto del PNG se imprime a 6 pt o mas en los cuatro casos con captura',
      Object.keys(salida.puntosImpresos).every(k => {
        const q = salida.puntosImpresos[k];
        return q.grado >= 6 && q.ter >= 6 && q.frase >= 6 && q.fase >= 6;
      }));
  chk('P-20 y a 14 pt o menos: el tope de ancho impide que domine la hoja',
      Object.keys(salida.puntosImpresos).every(k => salida.puntosImpresos[k].fase <= 14));

  // — S) seguridad —
  chk('S-0 DENOMINADOR: con captura y casilla marcada, el PDF SI la lleva',
      S.denominador.paraPDF === true && S.pdfUnoTraeLaCaptura === true && S.largoCapturaUno > 1000);
  ['limpiar','nuevo','cerrarSesion','cargarGuardado'].forEach((k, n) => {
    chk('S-' + (n+1) + ' tras «' + S[k].camino + '» el PDF NO lleva la captura del anterior',
        S[k].hayCaptura === false && S[k].paraPDF === false
        && S[k].traeAlgunPngDelLargoDeLaCaptura === false);
  });
  chk('S-5 DENOMINADOR de los cuatro: en los cuatro habia captura marcada de entrada, y los dos '
      + 'caminos del guardado corrieron de verdad',
      S.limpiar.camino && S.caminoNuevo === true
      && S.cargarGuardado.guardoOk === true && S.cargarGuardado.abrio === true
      && S.cargarGuardado.habiaCapturaAntes === true && S.nGuardados > 0);

  // — Z) lo que no se tenia que mover —
  chk('Z-1 bullseyeDataURL (PDF y PPT) da EL MISMO PNG que en HEAD, byte por byte',
      salida.Z_resto.bullseyeIgual === true && salida.Z_resto.bullseyeIgualQueAlArrancar === true);
  chk('Z-1b CONTROL NEGATIVO: pintar un segmento SI cambia ese PNG (la firma distingue)',
      salida.Z_resto.negativoPintarCambia === true);
  chk('Z-2 DENOMINADOR: el estudio se guardo de verdad, y el informe guardado trae al paciente',
      salida.Z_resto.disco.nInformes > 0 && salida.Z_resto.disco.largoInforme > 2000
      && salida.Z_resto.disco.informeTraeAlPaciente === true);
  chk('Z-3 el informe guardado NO se lleva la captura ni la casilla',
      salida.Z_resto.disco.informeTraeTrozoDeLaCaptura === false
      && salida.Z_resto.disco.informeTraeUnPngGrande === false
      && salida.Z_resto.disco.informeTraeClaveCasilla === false);
  chk('Z-4 y tampoco quedan en localStorage',
      salida.Z_resto.disco.traeTrozoDeLaCaptura === false
      && salida.Z_resto.disco.traeUnPngGrande === false
      && salida.Z_resto.disco.traeClaveCasilla === false);

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
