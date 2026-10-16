#!/usr/bin/env node
/**
 * _probe_y1c.mjs - sonda A/B de SOLO LECTURA para la tanda «Y1c» (2026-10-16): la vista 2D de
 * las valvulas pasa de ventana FLOTANTE a panel EN LINEA, y se corrigen los dos defectos que
 * Maicol reporto (el colapso en Safari y el movimiento de los carteles en Chrome).
 *
 * ⚠️ ESTA SONDA USA PLAYWRIGHT Y NO LA INFRA DE CDP DEL REPO, y es deliberado: la tanda tiene
 * que medir en DOS motores —Chrome y WebKit, el de Safari, que es el navegador del medico— y la
 * infra de cdp.mjs solo habla con Chrome. Playwright manda entrada CONFIABLE (teclas y clics
 * reales por el protocolo), asi que no se pierde nada de eso.
 * ⚠️ UNA SOLA INSTANCIA DE CADA MOTOR A LA VEZ, y se cierra con `browser.close()`, que se lleva
 * el arbol entero: Playwright es dueno del proceso que lanzo. NUNCA se mata nada por nombre.
 *
 *   node scripts/_probe_y1c.mjs --file /tmp/index.Y1cHEAD.html > /tmp/y1c.HEAD.json
 *   node scripts/_probe_y1c.mjs                                > /tmp/y1c.NEW.json
 *   node scripts/_probe_y1c.mjs --solo estab,altura --dest /tmp/capy1c
 *
 * Grupos (--solo a,b,c):
 *   boton    - el boton: texto, clases, aria, color REAL en los dos temas, clic/Enter/Espacio.
 *   panel    - apagado 0x0 y fuera del orden de tabulacion; prendido debajo del boton, no
 *              flotante, sin fondo tenue, sin boton de cerrar, sin Esc ni clic afuera; la
 *              maqueta a cinco anchos por dos temas.
 *   estab    - el recorrido de CADA elemento a lo largo de 120 fases: minimo, maximo y delta.
 *   altura   - el alto del dibujo y del panel, por motor y por ancho.
 *   apagado  - showTab, limpiarCampos, la pestana oculta, 20 ciclos y los cuadros reales.
 *   sync     - la sincronia en vivo con el panel prendido.
 *   tarjetas - el texto de las tarjetas, la tabla y la nota en las escenas de TC-482.
 *   captura  - PNG de la vista en los dos motores, dos temas y cinco anchos.
 *
 * ⚠️ Sin acentos graves dentro del template de la sonda, tampoco en los comentarios de adentro.
 */
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { createHash } from 'node:crypto';

/* ⚠️ PLAYWRIGHT SE RESUELVE POR RUTA Y NO POR `import 'playwright'`: no esta instalado en el
   proyecto —y no se quiere agregar una dependencia a un repo sin build—, asi que se busca donde
   la tanda anterior lo dejo. Si no esta, la sonda lo DICE en vez de reventar con un stack. */
const CANDIDATAS = ['/tmp/node_modules/playwright/index.js',
                    '/usr/local/lib/node_modules/playwright/index.js',
                    process.env.HOME + '/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CANDIDATAS) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) {
  console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CANDIDATAS,
    comoInstalar: 'mkdir -p /tmp/pw && cd /tmp/pw && npm i playwright && npx playwright install webkit' }, null, 1));
  process.exit(2);
}
const { chromium, webkit } = _pw;

const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const ARCH  = arg('--file');
const DEST  = arg('--dest');
const SOLO  = (arg('--solo') || '').split(',').map(s => s.trim()).filter(Boolean);
const corre = (g) => !SOLO.length || SOLO.indexOf(g) > -1;

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const srv = createServer(async (req, rq) => {
  try {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const p = (rel === 'index.html' && ARCH) ? ARCH : join(RAIZ, rel);
    rq.writeHead(200, { 'Content-Type': MIME[extname(rel)] || 'application/octet-stream' }).end(await readFile(p));
  } catch { rq.writeHead(404).end('no'); }
});
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const PORT = srv.address().port;

const out = { arbol: ARCH || 'VIVO', md5: null, grupos: {}, abortos: [] };
out.md5 = createHash('md5').update(await readFile(ARCH || join(RAIZ, 'index.html'))).digest('hex');

/* ══ LA SONDA QUE VIVE EN LA PAGINA ══════════════════════════════════════════════════════════
   Todo lo que lee el arbol va aca, con CENTINELA en cada lectura: contra HEAD varias piezas no
   existen, y un `.length` sobre undefined mata la corrida entera —eso prueba que el arbol es
   distinto, no que la sonda sabe medir—. Es la leccion que TC-455, TC-462, TC-465, TC-471,
   TC-473, TC-474, TC-477, TC-480, TC-481 y TC-485 ya tienen escrita. */
const SONDA = `window.__P = {
  SELS: ['#v2d-ov','#v2d-card','#v2d-head','#v2d-cuerpo','#v2d-grid','#v2d-dibujo','#v2d-svg',
         '#v2d-ciclo','#v2d-fase','#v2d-col-insuf','#v2d-col-esten','#v2d-cav','#v2d-cav table',
         '.v2d-nota','#v2d-abrir'],

  /* El aviso legal VUELVE a mitad de corrida y envenena cualquier medicion de oclusion y
     cualquier clic: se despeja ANTES de cada escena y su estado se informa al lado. */
  despejar() {
    var n = 0;
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (m && getComputedStyle(m).display !== 'none') { m.style.display = 'none'; n++; }
    });
    return n },

  el(id) { return document.getElementById(id) },
  rect(sel) { var e = document.querySelector(sel); if (!e) return null;
    var r = e.getBoundingClientRect();
    return { w:+r.width.toFixed(2), h:+r.height.toFixed(2), x:+r.left.toFixed(2), y:+r.top.toFixed(2) } },
  txt(sel) { var e = document.querySelector(sel); return e ? String(e.textContent||'').trim() : 'NO EXISTE' },

  /* bg, color, borde, tipografia y piso tactil, los cinco RESUELTOS. */
  pinta(sel) { var e = document.querySelector(sel); if (!e) return 'NO EXISTE';
    var c = getComputedStyle(e);
    return 'bg=' + c.backgroundColor + ' | col=' + c.color + ' | bd=' + c.borderTopColor },
  tipo(sel) { var e = document.querySelector(sel); if (!e) return 'NO EXISTE';
    var c = getComputedStyle(e);
    return c.fontSize + '/' + c.fontWeight + ' pad=' + c.padding + ' minH=' + c.minHeight },

  tema(claro) { document.documentElement.classList.toggle('light-mode', !!claro);
    return document.documentElement.classList.contains('light-mode') === !!claro },

  /* ⚠️ EL ESTADO SE LE PREGUNTA AL DUENO Y NO AL "display" COMPUTADO: con la pestana de
     Valvulas apagada el panel esta dentro de un "display:none", asi que el computado diria
     «apagado» con el panel prendido. Si "v2dVisible" no existe (HEAD) se cae al computado,
     que alla era la unica verdad. */
  prendido() {
    if (typeof v2dVisible === 'function') { try { return v2dVisible() } catch (e) { return 'EXC' } }
    var o = document.getElementById('v2d-ov');
    return !!(o && getComputedStyle(o).display !== 'none') },

  corriendo() { try { return (typeof v2dCorriendo === 'function') ? v2dCorriendo() : 'SIN FN' }
    catch (e) { return 'EXC' } },

  tabulables() { var ov = document.getElementById('v2d-ov'); if (!ov) return 'NO EXISTE';
    return Array.prototype.slice.call(ov.querySelectorAll('a[href],button,input,select,textarea,[tabindex]'))
      .filter(function(e){ return e.offsetParent !== null && e.getAttribute('tabindex') !== '-1' }).length },

  /* El estado del boton: texto SIEMPRE el mismo, clase y aria. */
  boton() { var b = document.getElementById('v2d-abrir'); if (!b) return { hay:false };
    var r = b.getBoundingClientRect();
    return { hay:true, txt:String(b.textContent||'').trim(), clase:String(b.className||''),
             pressed:b.getAttribute('aria-pressed'), controls:b.getAttribute('aria-controls'),
             expanded:b.getAttribute('aria-expanded'), haspopup:b.getAttribute('aria-haspopup'),
             w:+r.width.toFixed(1), h:+r.height.toFixed(1),
             pinta:window.__P.pinta('#v2d-abrir'), tipo:window.__P.tipo('#v2d-abrir') } },

  /* La pestana de valvula de referencia, en reposo y PRENDIDA (el control negativo). */
  pestana(prender) {
    var antes = null;
    try { antes = (typeof pillOn === 'function') ? pillOn('mitral','insuf') : null } catch (e) {}
    if (prender && antes !== true) { try { toggleValvPill('mitral','insuf') } catch (e) {} }
    if (!prender && antes === true) { try { toggleValvPill('mitral','insuf') } catch (e) {} }
    var r = { pinta: window.__P.pinta('#pill-insuf-mitral'),
              clase: String((document.getElementById('pill-insuf-mitral')||{}).className||''),
              on: (function(){ try { return pillOn('mitral','insuf') } catch (e) { return 'EXC' } })() };
    return r },

  /* Toda la maqueta de un golpe. */
  maqueta() {
    var o = { rects:{}, scrollH:null, scrollIntCuerpo:null, filasCav:null, viewBox:null,
              posCard:null, fondoOv:null, hayCerrar:null, role:null, ariaModal:null, debajo:null };
    window.__P.SELS.forEach(function(s){ o.rects[s] = window.__P.rect(s) });
    o.scrollH = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    var c = document.getElementById('v2d-cuerpo');
    o.scrollIntCuerpo = c ? (c.scrollHeight > c.clientHeight + 1) : 'NO EXISTE';
    var ca = document.getElementById('v2d-card');
    o.scrollIntCard = ca ? (ca.scrollHeight > ca.clientHeight + 1) : 'NO EXISTE';
    o.filasCav = document.querySelectorAll('#v2d-cav tbody tr').length;
    var sv = document.getElementById('v2d-svg');
    o.viewBox = sv ? sv.getAttribute('viewBox') : 'NO EXISTE';
    o.posCard = ca ? getComputedStyle(ca).position : 'NO EXISTE';
    var ov = document.getElementById('v2d-ov');
    o.fondoOv = ov ? getComputedStyle(ov).backgroundColor : 'NO EXISTE';
    o.posOv = ov ? getComputedStyle(ov).position : 'NO EXISTE';
    o.hayCerrar = !!document.getElementById('v2d-cerrar');
    o.role = ca ? ca.getAttribute('role') : 'NO EXISTE';
    o.ariaModal = ca ? ca.getAttribute('aria-modal') : null;
    o.ariaLabelledby = ca ? ca.getAttribute('aria-labelledby') : null;
    o.tit = window.__P.txt('#v2d-tit');
    var b = document.getElementById('v2d-abrir');
    if (b && ov && ov.getBoundingClientRect().height > 0) {
      var rb = b.getBoundingClientRect(), ro = ov.getBoundingClientRect();
      o.debajo = ro.top >= rb.bottom - 1;
      o.centrado = ca ? Math.abs((ca.getBoundingClientRect().left + ca.getBoundingClientRect().right) / 2
                   - (ov.getBoundingClientRect().left + ov.getBoundingClientRect().right) / 2) <= 2 : null;
    }
    o.cols = (function(){ var g = document.getElementById('v2d-grid');
      return g ? getComputedStyle(g).gridTemplateColumns : 'NO EXISTE' })();
    o.unaColumna = (function(){ var g = document.getElementById('v2d-grid');
      if (!g) return 'NO EXISTE';
      return String(getComputedStyle(g).gridTemplateColumns||'').trim().split(/\\s+/).length === 1 })();
    return o },

  /* ⚠️ EL RECORRIDO SE MIDE POR FASE Y NO POR TIEMPO: "v2dFase(p)" deja el latido en una fase
     FIJA y dibuja ese cuadro, asi que se recorren TODAS las fases de un ciclo sin depender del
     reloj. 120 muestras cubren los dos ciclos que la orden pide, porque el ciclo es periodico. */
  estabilidad(n) {
    var N = n || 120, acc = {}, textos = {}, k, s;
    window.__P.SELS.forEach(function(s){ acc[s] = [] });
    for (k = 0; k < N; k++) {
      try { v2dFase(k / N) } catch (e) {}
      window.__P.SELS.forEach(function(s){
        var e = document.querySelector(s);
        acc[s].push(e ? (function(){ var r = e.getBoundingClientRect();
          return [r.width, r.height, r.left, r.top] })() : null) });
      var f1 = document.getElementById('v2d-fase1'), f2 = document.getElementById('v2d-fase2');
      var t = (f1 ? f1.textContent : '') + ' / ' + (f2 ? f2.textContent : '');
      if (!textos[t]) textos[t] = { p:+(k/N).toFixed(3),
        anchoFase: (function(){ var e = document.getElementById('v2d-fase');
          return e ? +e.getBoundingClientRect().width.toFixed(2) : null })(),
        /* El ancho que el texto PEDIRIA si nada lo acotara: es lo que dimensionaba la columna
           "auto" y lo que hacia mover todo. */
        maxFase: (function(){ var e = document.getElementById('v2d-fase');
          if (!e) return null; var p = e.style.width; e.style.width = 'max-content';
          var w = +e.getBoundingClientRect().width.toFixed(2); e.style.width = p; return w })(),
        recortado: (function(){ var e = document.getElementById('v2d-fase2');
          return e ? (e.scrollWidth > e.clientWidth + 1) : null })(),
        titulo: (function(){ var e = document.getElementById('v2d-fase2');
          return e ? e.getAttribute('title') : null })() };
    }
    var o = { rango:{}, textos:textos, n:N, peor:0 };
    window.__P.SELS.forEach(function(s){
      var a = acc[s].filter(Boolean);
      if (!a.length) { o.rango[s] = 'NO EXISTE'; return }
      var mm = function(j){ var v = a.map(function(x){ return x[j] });
        return [Math.min.apply(null, v), Math.max.apply(null, v)] };
      var w = mm(0), h = mm(1), x = mm(2), y = mm(3);
      var d = { dw:+(w[1]-w[0]).toFixed(2), dh:+(h[1]-h[0]).toFixed(2),
                dx:+(x[1]-x[0]).toFixed(2), dy:+(y[1]-y[0]).toFixed(2),
                w:[+w[0].toFixed(2),+w[1].toFixed(2)], h:[+h[0].toFixed(2),+h[1].toFixed(2)],
                x:[+x[0].toFixed(2),+x[1].toFixed(2)], y:[+y[0].toFixed(2),+y[1].toFixed(2)] };
      d.peor = Math.max(Math.abs(d.dw), Math.abs(d.dh), Math.abs(d.dx), Math.abs(d.dy));
      o.peor = Math.max(o.peor, d.peor);
      o.rango[s] = d });
    return o },

  /* El texto de las tarjetas, la tabla y la nota: lo que esta tanda NO puede mover. */
  contenido() {
    var lista = function(id){ var ul = document.getElementById(id); if (!ul) return 'NO EXISTE';
      return Array.prototype.slice.call(ul.children).map(function(li){
        var ch = li.querySelector('.v2d-chip');
        return { txt:String(li.textContent||'').trim(),
                 chip: ch ? String(ch.textContent||'').trim() : null,
                 cls: ch ? String(ch.className||'') : '',
                 bg: ch ? getComputedStyle(ch).backgroundColor : null,
                 decide: (function(){ var d = li.querySelector('.v2d-pq-decide');
                   return d ? String(d.textContent||'').trim() : null })(),
                 manual: (function(){ var d = li.querySelector('.v2d-pq-manual');
                   return d ? String(d.textContent||'').trim() : null })(),
                 fund: (function(){ var d = li.querySelector('.v2d-pq-fund');
                   return d ? String(d.textContent||'').trim() : null })(),
                 ver: (function(){ var b = li.querySelector('.v2d-vercrit');
                   return b ? String(b.textContent||'').trim() : null })(),
                 pq: (function(){ var x = li.querySelector('.v2d-pq');
                   return x ? String(x.textContent||'').trim() : null })() } }) };
    return { insuf: lista('v2d-insuf'), esten: lista('v2d-esten'),
             cav: window.__P.txt('#v2d-cav-tabla'), nota: window.__P.txt('.v2d-nota'),
             tit: window.__P.txt('#v2d-tit') } },

  /* Abre las listas «Ver criterios» de las dos columnas y devuelve cuantas quedaron abiertas. */
  abrirCriterios() {
    var n = 0;
    ['v2d-insuf','v2d-esten'].forEach(function(id){
      var ul = document.getElementById(id); if (!ul) return;
      Array.prototype.slice.call(ul.querySelectorAll('.v2d-vercrit')).forEach(function(b){
        if (b.getAttribute('aria-expanded') !== 'true') { b.click(); }
        if (b.getAttribute('aria-expanded') === 'true') n++ }) });
    return n },
  criteriosAbiertos() {
    var n = 0;
    ['v2d-insuf','v2d-esten'].forEach(function(id){
      var ul = document.getElementById(id); if (!ul) return;
      Array.prototype.slice.call(ul.querySelectorAll('.v2d-vercrit')).forEach(function(b){
        if (b.getAttribute('aria-expanded') === 'true') n++ }) });
    return n },

  /* ⚠️ EL CUADRO SE MIDE ESPIANDO "requestAnimationFrame", no preguntandole a una bandera. */
  espiarRaf() { if (window.__rafOrig) { window.__raf = 0; return true }
    window.__rafOrig = window.requestAnimationFrame; window.__raf = 0;
    window.requestAnimationFrame = function(cb){ window.__raf++; return window.__rafOrig.call(window, cb) };
    return true },
  leerRaf() { return window.__raf },
  cerorRaf() { window.__raf = 0; return true },

  nodos() { return document.querySelectorAll('*').length },

  /* El informe y el EN SUMA, que esta tanda no puede mover. */
  informe(est) {
    try { if (typeof setEstiloInforme === 'function') setEstiloInforme(est) } catch (e) {}
    try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
    var v = function(id){ var e = document.getElementById(id); return e ? e.value : 'NO EXISTE' };
    return { inf: v('informe_texto'), suma: v('en_suma') } },

  /* Las 440 columnas, clave por clave. */
  excel() {
    try {
      var regs = [window.__P.camposCrudos()];
      if (typeof _labExcelRow !== 'function') return { err:'SIN _labExcelRow' };
      var f = _labExcelRow({ id:'p1', fecha:'2026-10-16', nombre:'X', campos: regs[0],
                             informe_texto:'', en_suma:'' });
      return { n: Object.keys(f).length, fila: f };
    } catch (e) { return { err: String(e && e.message) } } },

  camposCrudos() { var c = {};
    document.querySelectorAll('input[id],select[id],textarea[id]').forEach(function(e){
      if (e.type === 'checkbox' || e.type === 'radio') c[e.id + '__chk'] = e.checked ? '1' : '0';
      else c[e.id] = e.value });
    return c },

  grados() { var o = {};
    ['im_grado','ia_grado','it_grado','ip_grado','ea_grado','em_grado','et_grado','ep_grado']
      .forEach(function(id){ var e = document.getElementById(id); o[id] = e ? e.value : 'NO EXISTE' });
    ['mitral','aortica','tricuspide','pulmonar'].forEach(function(v){
      ['insuf','esten'].forEach(function(t){
        var b = document.getElementById('sevbtn-' + t + '-' + v);
        o['pill-' + t + '-' + v] = b ? String(b.textContent||'').trim() : 'NO EXISTE' }) });
    o.diast = window.__P.txt('#dd-interp');
    o.hfapeff = window.__P.txt('#hfapeff-eco');
    return o }
};`;

/* ══ ESCENAS ═════════════════════════════════════════════════════════════════════════════════
   Las cinco de TC-482 que la orden nombra, mas la vacia. Los `<select>` se fijan ANTES de los
   campos, que es la regla de la casa. */
const BSA = { peso: '80', talla: '170' };
const ESC = {
  vacio: { campos: {} },
  protMecIM: { selects: [['vm_morf', 'Prótesis mecánica']],
    campos: Object.assign({}, BSA, { em_dtsvi: '20', em_vtitsvi: '20', vm_gmedio: '12', thp: '250' }),
    sev: [['insuf', 'mitral', '4']] },
  emSinGrado: { selects: [['vm_morf', 'Reumática']],
    campos: Object.assign({}, BSA, { avm_plan: '1.2' }) },
  iaoSevera: { campos: Object.assign({}, BSA, { ea_dtsvi: '20', itv_tsvi: '20' }),
    sev: [['insuf', 'aortica', '4']] },
  itLeve: { campos: Object.assign({}, BSA, { vmax_it: '2.4' }), sev: [['insuf', 'tricuspide', '1']] },
  manual: { campos: Object.assign({}, BSA, { im_vc: '3' }), sev: [['insuf', 'mitral', '4']],
    manual: ['insuf', 'mitral', '4'] },
  /* ⚠️ ESCENA CON LISTA «Ver criterios» DE VERDAD, y existe porque el denominador importa: la
     lista solo nace cuando la PANTALLA publico filas de criterio, asi que un grado forzado con
     `valvSev.aplicar` sobre un formulario sin datos no la produce y medir sobre ella no mide
     nada. Aca la IM se gradua con sus propios parametros. */
  criterios: { campos: Object.assign({}, BSA, { im_vc: '7', im_pisa_r: '1.0', im_pisa_va: '38',
    im_pisa_vmax: '500', ea_dtsvi: '20', itv_tsvi: '20', im_ai_jet: '45',
    ea_vmax: '4.5', gmedio_ao: '45', itv_ao: '120' }) },
  rico: { campos: Object.assign({}, BSA, { ddfvi: '66', dsfvi: '52', siv: '13', ppvi: '13',
    fevi: '30', ai_vol: '105', ai_area: '26', vd_bas: '47', vd_med: '40', vd_long: '90',
    tapse: '14', s_prime: '8', vd_tei: '0.62', ad_area: '24', im_vc: '7', vmax_it: '3.2' }),
    sev: [['insuf', 'mitral', '4'], ['insuf', 'aortica', '2'], ['insuf', 'tricuspide', '1'],
          ['esten', 'aortica', 'severa']] }
};

async function montarEscena(pg, e) {
  await pg.evaluate((e) => {
    window.__P.despejar();
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (x) {}
    window.__P.despejar();
    (e.selects || []).forEach(([id, v]) => { const n = document.getElementById(id); if (!n) return;
      const o = Array.prototype.slice.call(n.options || []).filter(o => o.value === v || o.text === v)[0];
      if (o) { n.value = o.value; n.dispatchEvent(new Event('change', { bubbles: true })); } });
    Object.keys(e.campos || {}).forEach(id => { const n = document.getElementById(id); if (!n) return;
      n.value = e.campos[id];
      n.dispatchEvent(new Event('input', { bubbles: true }));
      n.dispatchEvent(new Event('change', { bubbles: true })); });
    ['calcVI','calcVD','calcAI','calcAorta','calcIM_ESC','calcIA_ESC','calcIT_ESC','calcEM','calcAo','calcET']
      .forEach(f => { try { window[f]() } catch (x) {} });
    (e.sev || []).forEach(([t, v, g]) => { try { valvSev.aplicar(t, v, g) } catch (x) {} });
    if (e.manual) { try { valvSev.aplicar(e.manual[0], e.manual[1], e.manual[2], { manual: true }) } catch (x) {} }
    try { if (typeof showTab === 'function') showTab('valvulas') } catch (x) {}
  }, e);
}

async function nuevaPagina(b, W, H) {
  const pg = await b.newPage({ viewport: { width: W, height: H } });
  await pg.goto(`http://127.0.0.1:${PORT}/index.html`);
  await pg.evaluate(() => { try { sessionStorage.setItem('ett_auth', '1') } catch (e) {} });
  await pg.reload();
  await pg.waitForTimeout(2600);
  await pg.evaluate(SONDA);
  await pg.evaluate(() => window.__P.despejar());
  return pg;
}

/* ⚠️ EL BOTON SE TOCA CON UN CLIC REAL DEL PROTOCOLO. `locator.click()` de Playwright desplaza,
   comprueba que el nodo este visible y manda un clic de confianza; si el nodo no existe o no
   tiene geometria, FALLA en vez de medir un gesto que no ocurrio. */
async function tocar(pg, sel) {
  try { await pg.locator(sel).click({ timeout: 4000 }); return true }
  catch (e) { out.abortos.push('clic ' + sel + ': ' + String(e && e.message).slice(0, 90)); return false }
}

/* ⚠️ EL CIERRE VA POR EL CONTROL QUE CADA ARBOL TIENE, Y NO ES UN LUJO: en HEAD el boton del pie
   SOLO abre (es `v2dAbrir`), asi que el overlay quedaba puesto, tapaba la pagina entera y los
   veintinueve clics siguientes se quedaban sin blanco. La primera corrida del A/B informo 30
   abortos contra HEAD y «diferencias» en seis escenas que en realidad eran el lado de HEAD
   VACIO: un denominador roto que se lee igual que un hallazgo. */
async function apagar(pg) {
  const hayCerrar = await pg.evaluate(() => !!document.getElementById('v2d-cerrar'));
  const ok = await tocar(pg, hayCerrar ? '#v2d-cerrar' : '#v2d-abrir');
  const sigue = await pg.evaluate(() => window.__P.prendido());
  if (sigue === true) out.abortos.push('el panel sigue prendido tras apagar (hayCerrar=' + hayCerrar + ')');
  return ok;
}

const MOTORES = [['chrome', chromium, { channel: 'chrome' }], ['webkit', webkit, {}]];
if (DEST) await mkdir(DEST, { recursive: true });

for (const [motor, tipo, op] of MOTORES) {
  const b = await tipo.launch(op);
  const G = out.grupos[motor] = {};
  G.version = b.version();

  /* ── boton ── El texto, las clases, el aria y el color REAL en los dos temas. ──────────── */
  if (corre('boton')) {
    const pg = await nuevaPagina(b, 1200, 700);
    await montarEscena(pg, ESC.rico);
    const g = { temas: {} };
    for (const [nom, claro] of [['oscuro', false], ['claro', true]]) {
      await pg.evaluate((c) => window.__P.tema(c), claro);
      const t = { apagado: await pg.evaluate(() => window.__P.boton()),
                  pestanaReposo: await pg.evaluate(() => window.__P.pestana(false)) };
      await tocar(pg, '#v2d-abrir');
      t.prendido = await pg.evaluate(() => window.__P.boton());
      t.pestanaActiva = await pg.evaluate(() => window.__P.pestana(true));
      await pg.evaluate(() => window.__P.pestana(false));
      await tocar(pg, '#v2d-abrir');
      t.vuelta = await pg.evaluate(() => window.__P.boton());
      g.temas[nom] = t;
    }
    await pg.evaluate(() => window.__P.tema(false));
    /* ENTER Y ESPACIO, con teclas reales, y el foco que se queda en el boton. */
    await pg.locator('#v2d-abrir').focus();
    g.teclas = {};
    for (const k of ['Enter', ' ']) {
      await pg.keyboard.press(k === ' ' ? 'Space' : k);
      await pg.waitForTimeout(120);
      g.teclas[k === ' ' ? 'Espacio' : k] = {
        prendido: await pg.evaluate(() => window.__P.prendido()),
        foco: await pg.evaluate(() => document.activeElement ? document.activeElement.id : null) };
      await pg.keyboard.press(k === ' ' ? 'Space' : k);
      await pg.waitForTimeout(120);
    }
    /* SIN HOVER: ninguna regla de la hoja declara :hover para este boton ni para el panel. */
    g.sinHover = await pg.evaluate(() => {
      const f = String(document.documentElement.innerHTML || '');
      const i = f.indexOf('#v2d-ov{'), j = f.indexOf('@media print{#v2d-ov');
      const zona = (i > -1 && j > i) ? f.slice(i, j) : '';
      return { zona: zona.length, hover: (zona.match(/v2d[^{};]*:hover/g) || []).length,
               abrirHover: (f.match(/#v2d-abrir[^{};]*:hover/g) || []).length };
    });
    await pg.close();
    G.boton = g;
  }

  /* ── panel ── Apagado, prendido y la maqueta a cinco anchos por dos temas. ─────────────── */
  if (corre('panel')) {
    const g = { apagado: null, anchos: {} };
    {
      const pg = await nuevaPagina(b, 1200, 700);
      await montarEscena(pg, ESC.rico);
      g.apagado = { maqueta: await pg.evaluate(() => window.__P.maqueta()),
                    tabulables: await pg.evaluate(() => window.__P.tabulables()),
                    corriendo: await pg.evaluate(() => window.__P.corriendo()),
                    disp: await pg.evaluate(() => { const o = document.getElementById('v2d-ov');
                      return o ? getComputedStyle(o).display : 'NO EXISTE' }) };
      /* ESCAPE Y CLIC AFUERA NO LO CIERRAN: ya no es un dialogo. */
      await tocar(pg, '#v2d-abrir');
      await pg.keyboard.press('Escape');
      await pg.waitForTimeout(150);
      g.sigueTrasEscape = await pg.evaluate(() => window.__P.prendido());
      /* ⚠️ EL CLIC «AFUERA» VA SOBRE LA PROPIA CAJA DE `#v2d-ov`, AL COSTADO DE LA TARJETA
         CENTRADA, que es EXACTAMENTE el gesto que la ventana flotante interpretaba como cerrar.
         Un clic en un punto cualquiera de la pagina no sirve de denominador: la primera corrida
         clickeo en (20,400), eso cayo sobre un boton del rail, `showTab` corrio y el panel se
         apago —asi que la sonda informo «el clic afuera cierra» sobre un gesto que en realidad
         era un cambio de pestana—. Y encima dejaba la pagina en otra pestana, con lo que los dos
         clics siguientes abortaban. */
      g.clicAfuera = await pg.evaluate(() => {
        const ov = document.getElementById('v2d-ov'), ca = document.getElementById('v2d-card');
        if (!ov || !ca) return { err: 'NO EXISTE' };
        const ro = ov.getBoundingClientRect(), rc = ca.getBoundingClientRect();
        const x = Math.round(ro.left + Math.max(4, (rc.left - ro.left) / 2));
        const y = Math.round(rc.top + rc.height / 2);
        const blanco = document.elementFromPoint(x, y);
        return { x: x, y: y, hueco: Math.round(rc.left - ro.left),
                 blancoId: blanco ? (blanco.id || blanco.tagName) : null,
                 esElOv: blanco === ov,
                 onclickOv: ov.getAttribute('onclick') };
      });
      if (g.clicAfuera && g.clicAfuera.esElOv) {
        await pg.mouse.click(g.clicAfuera.x, g.clicAfuera.y);
        await pg.waitForTimeout(150);
        g.sigueTrasClicAfuera = await pg.evaluate(() => window.__P.prendido());
      } else {
        g.sigueTrasClicAfuera = 'SIN DENOMINADOR: el punto no cae sobre #v2d-ov';
      }
      /* EL DESPLAZAMIENTO DE LA PAGINA: con el panel apagado y la pagina ARRIBA, el pie de
         Valvulas queda muy por debajo del borde; al prender, la pagina baja sola y el panel entra
         en la ventana. */
      await apagar(pg);
      await pg.evaluate(() => window.scrollTo(0, 0));
      await pg.waitForTimeout(150);
      g.antesDeAbrir = await pg.evaluate(() => {
        const b = document.getElementById('v2d-abrir'); if (!b) return 'NO EXISTE';
        const r = b.getBoundingClientRect();
        return { scrollY: Math.round(window.scrollY), botonTop: Math.round(r.top),
                 vh: window.innerHeight, botonFueraDeLaVentana: r.top >= window.innerHeight };
      });
      await pg.evaluate(() => { const b = document.getElementById('v2d-abrir'); if (b) b.click() });
      await pg.waitForTimeout(1100);
      g.desplazo = await pg.evaluate(() => {
        const o = document.getElementById('v2d-ov'); if (!o) return 'NO EXISTE';
        const r = o.getBoundingClientRect();
        return { prendido: window.__P.prendido(), scrollY: Math.round(window.scrollY),
                 top: Math.round(r.top), bottom: Math.round(r.bottom), h: Math.round(r.height),
                 vh: window.innerHeight,
                 dentro: r.top >= -1 && r.top < window.innerHeight };
      });
      await pg.close();
    }
    for (const [W, H] of [[1440, 800], [1200, 700], [768, 1024], [390, 844], [360, 740]]) {
      const pg = await nuevaPagina(b, W, H);
      await montarEscena(pg, ESC.rico);
      const a = {};
      for (const [nom, claro] of [['oscuro', false], ['claro', true]]) {
        await pg.evaluate((c) => window.__P.tema(c), claro);
        await tocar(pg, '#v2d-abrir');
        await pg.waitForTimeout(200);
        a[nom] = await pg.evaluate(() => window.__P.maqueta());
        if (DEST && nom) await pg.screenshot({ path: join(DEST,
          (ARCH ? 'HEAD' : 'NEW') + '_' + motor + '_' + nom + '_' + W + 'x' + H + '.png') });
        await apagar(pg);
      }
      await pg.evaluate(() => window.__P.tema(false));
      g.anchos[W + 'x' + H] = a;
      await pg.close();
    }
    G.panel = g;
  }

  /* ── estab ── El recorrido de cada elemento a lo largo de 120 fases. ──────────────────── */
  if (corre('estab')) {
    const g = {};
    for (const [W, H] of [[1200, 700], [390, 844]]) {
      const pg = await nuevaPagina(b, W, H);
      await montarEscena(pg, ESC.rico);
      await tocar(pg, '#v2d-abrir');
      await pg.waitForTimeout(300);
      g[W + 'x' + H] = await pg.evaluate(() => window.__P.estabilidad(120));
      await pg.close();
    }
    G.estab = g;
  }

  /* ── altura ── El alto del dibujo y del panel, por ancho. ─────────────────────────────── */
  if (corre('altura')) {
    const g = {};
    for (const [W, H] of [[1920, 1080], [1440, 800], [1200, 700], [1024, 768], [768, 1024], [390, 844], [360, 740]]) {
      const pg = await nuevaPagina(b, W, H);
      await montarEscena(pg, ESC.rico);
      await tocar(pg, '#v2d-abrir');
      await pg.waitForTimeout(200);
      const m = await pg.evaluate(() => window.__P.maqueta());
      g[W + 'x' + H] = { svg: m.rects['#v2d-svg'], card: m.rects['#v2d-card'],
                         cuerpo: m.rects['#v2d-cuerpo'], cav: m.rects['#v2d-cav table'],
                         nota: m.rects['.v2d-nota'], cols: m.cols, una: m.unaColumna,
                         scrollInt: m.scrollIntCuerpo, scrollCard: m.scrollIntCard,
                         scrollH: m.scrollH, filas: m.filasCav, vb: m.viewBox };
      await pg.close();
    }
    G.altura = g;
  }

  /* ── apagado ── showTab, limpiarCampos, la pestana oculta, 20 ciclos y los cuadros. ───── */
  if (corre('apagado')) {
    const pg = await nuevaPagina(b, 1200, 700);
    await montarEscena(pg, ESC.rico);
    await pg.evaluate(() => window.__P.espiarRaf());
    const g = {};
    /* cuadros con el panel APAGADO */
    await pg.evaluate(() => window.__P.cerorRaf());
    await pg.waitForTimeout(900);
    g.rafApagado = await pg.evaluate(() => window.__P.leerRaf());
    /* cuadros con el panel PRENDIDO */
    await tocar(pg, '#v2d-abrir');
    await pg.evaluate(() => window.__P.cerorRaf());
    await pg.waitForTimeout(900);
    g.rafPrendido = await pg.evaluate(() => window.__P.leerRaf());
    /* con la pestana del navegador OCULTA */
    await pg.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' });
      document.dispatchEvent(new Event('visibilitychange'));
      window.__P.cerorRaf();
    });
    await pg.waitForTimeout(800);
    g.oculta = { raf: await pg.evaluate(() => window.__P.leerRaf()),
                 corriendo: await pg.evaluate(() => window.__P.corriendo()),
                 prendido: await pg.evaluate(() => window.__P.prendido()) };
    /* y al VOLVER a la vista */
    await pg.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => false });
      Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' });
      document.dispatchEvent(new Event('visibilitychange'));
      window.__P.cerorRaf();
    });
    await pg.waitForTimeout(700);
    g.vuelta = { raf: await pg.evaluate(() => window.__P.leerRaf()),
                 corriendo: await pg.evaluate(() => window.__P.corriendo()) };
    /* showTab */
    g.showTab = await pg.evaluate(() => {
      const a = window.__P.prendido();
      try { showTab('datos') } catch (e) {}
      const b2 = window.__P.prendido();
      try { showTab('valvulas') } catch (e) {}
      return { antes: a, trasShowTab: b2, alVolver: window.__P.prendido(),
               corriendo: window.__P.corriendo() };
    });
    /* limpiarCampos */
    await tocar(pg, '#v2d-abrir');
    g.limpiar = await pg.evaluate(() => {
      const a = window.__P.prendido();
      try { limpiarCampos(true) } catch (e) {}
      return { antes: a, despues: window.__P.prendido(), corriendo: window.__P.corriendo(),
               boton: window.__P.boton().pressed };
    });
    /* la carta de restauracion: el embudo de las cinco rutas */
    await pg.evaluate(() => { try { showTab('valvulas') } catch (e) {} });
    await tocar(pg, '#v2d-abrir');
    g.recalc = await pg.evaluate(() => {
      const a = window.__P.prendido();
      let enEmbudo = 'SIN FN';
      try { enEmbudo = (typeof RECALC_MODULOS === 'function') &&
            RECALC_MODULOS().indexOf('v2dCerrar') > -1 } catch (e) { enEmbudo = 'EXC' }
      try { if (typeof _recalcModulos === 'function') _recalcModulos() } catch (e) {}
      return { antes: a, despues: window.__P.prendido(), enEmbudo: enEmbudo };
    });
    /* 20 aperturas y cierres: oyentes y nodos */
    await pg.evaluate(() => { try { showTab('valvulas') } catch (e) {} });
    g.ciclos = await pg.evaluate(() => {
      const n0 = window.__P.nodos();
      for (let k = 0; k < 20; k++) { const b2 = document.getElementById('v2d-abrir');
        if (b2) { b2.click(); b2.click() } }
      return { nodos: [n0, window.__P.nodos()], prendido: window.__P.prendido(),
               corriendo: window.__P.corriendo(), boton: window.__P.boton().pressed };
    });
    /* NADA se escribe en el estudio ni en el navegador */
    g.nadaEscrito = await pg.evaluate(() => {
      try { showTab('valvulas') } catch (e) {}
      const antes = JSON.stringify(window.__P.camposCrudos());
      const ls0 = [], ss0 = [];
      for (let i = 0; i < localStorage.length; i++) ls0.push(localStorage.key(i));
      for (let i = 0; i < sessionStorage.length; i++) ss0.push(sessionStorage.key(i));
      const b2 = document.getElementById('v2d-abrir'); if (b2) { b2.click(); b2.click() }
      const ls1 = [], ss1 = [];
      for (let i = 0; i < localStorage.length; i++) ls1.push(localStorage.key(i));
      for (let i = 0; i < sessionStorage.length; i++) ss1.push(sessionStorage.key(i));
      return { campos: antes === JSON.stringify(window.__P.camposCrudos()),
               ls: ls0.sort().join(',') === ls1.sort().join(','),
               ss: ss0.sort().join(',') === ss1.sort().join(','),
               v2dEnLs: ls1.filter(k => /v2d/i.test(k)),
               v2dEnSs: ss1.filter(k => /v2d/i.test(k)) };
    });
    await pg.close();
    G.apagado = g;
  }

  /* ── sync ── La sincronia en vivo con el panel PRENDIDO. ──────────────────────────────── */
  if (corre('sync')) {
    const pg = await nuevaPagina(b, 1200, 700);
    await montarEscena(pg, ESC.criterios);
    await tocar(pg, '#v2d-abrir');
    await pg.waitForTimeout(250);
    const g = {};
    g.antes = await pg.evaluate(() => window.__P.contenido());
    /* Se cambia el grado de la IM con el gesto REAL de la app y se mira el panel SIN reabrirlo. */
    g.tras = await pg.evaluate(() => {
      try { valvSev.aplicar('insuf', 'mitral', '1') } catch (e) {}
      return window.__P.contenido();
    });
    /* Y con una lista «Ver criterios» ABIERTA: se repone al repintar. */
    g.criterios = await pg.evaluate(() => {
      const n0 = window.__P.abrirCriterios();
      try { valvSev.aplicar('insuf', 'mitral', '4') } catch (e) {}
      return { abiertasAntes: n0, abiertasDespues: window.__P.criteriosAbiertos() };
    });
    /* CONTROL NEGATIVO: tipear en un campo que esta vista NO mira no repinta nada. */
    g.controlNeg = await pg.evaluate(() => {
      const a = window.__P.contenido();
      const n = document.getElementById('nombre');
      if (n) { n.value = 'Zz'; n.dispatchEvent(new Event('input', { bubbles: true })); }
      const d = window.__P.contenido();
      return { igual: JSON.stringify(a) === JSON.stringify(d), hayCampo: !!n };
    });
    await pg.close();
    G.sync = g;
  }

  /* ── tarjetas ── El contenido en las escenas de TC-482 y TC-484. ──────────────────────── */
  if (corre('tarjetas')) {
    const g = {};
    const pg = await nuevaPagina(b, 1200, 700);
    for (const nom of ['vacio', 'protMecIM', 'emSinGrado', 'iaoSevera', 'itLeve', 'manual', 'rico', 'criterios']) {
      await montarEscena(pg, ESC[nom]);
      const inf = await pg.evaluate(() => window.__P.informe('estandar'));
      /* ⚠️ `generarInforme` SALTA A LA PESTANA INFORME, y sin volver el boton del pie de Valvulas
         no tiene geometria: la primera corrida aborto 28 clics y las siete escenas informaron las
         dos columnas VACIAS. Es la trampa que este repo ya tiene escrita. */
      await pg.evaluate(() => { try { showTab('valvulas') } catch (e) {} });
      await tocar(pg, '#v2d-abrir');
      await pg.waitForTimeout(200);
      const c = await pg.evaluate(() => window.__P.contenido());
      const crit = await pg.evaluate(() => { const n = window.__P.abrirCriterios();
        return { n: n, cont: window.__P.contenido() } });
      await apagar(pg);
      g[nom] = { inf: inf, cont: c, crit: crit, grados: await pg.evaluate(() => window.__P.grados()) };
    }
    await pg.close();
    G.tarjetas = g;
  }

  /* ── captura ── PNG con una lista de criterios abierta. ───────────────────────────────── */
  if (corre('captura') && DEST) {
    const g = {};
    for (const [W, H] of [[1200, 700], [390, 844]]) {
      const pg = await nuevaPagina(b, W, H);
      await montarEscena(pg, ESC.criterios);
      for (const [nom, claro] of [['oscuro', false], ['claro', true]]) {
        await pg.evaluate((c) => window.__P.tema(c), claro);
        await tocar(pg, '#v2d-abrir');
        await pg.evaluate(() => window.__P.abrirCriterios());
        await pg.waitForTimeout(250);
        const f = join(DEST, (ARCH ? 'HEAD' : 'NEW') + '_crit_' + motor + '_' + nom + '_' + W + 'x' + H + '.png');
        try { await pg.locator('#v2d-ov').screenshot({ path: f }); g[nom + W] = f }
        catch (e) { await pg.screenshot({ path: f }); g[nom + W] = f + ' (pagina)' }
        await apagar(pg);
      }
      await pg.close();
    }
    G.captura = g;
  }

  await b.close();
}

srv.close();
console.log(JSON.stringify(out, null, 1));
process.exit(0);
