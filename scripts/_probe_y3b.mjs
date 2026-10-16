#!/usr/bin/env node
/**
 * _probe_y3b.mjs - sonda A/B de SOLO LECTURA para la tanda «Y3b + Wilkins + I» (2026-10-16).
 *
 * Mide: (1) el GIRO MANUAL del 3D de la mitral de ETE; (2) el CUADRO mas alto y la TABLA en la
 * columna derecha; (3) el WILKINS unificado; (4) y (5) la pestana Otros.
 *
 * ⚠️ USA PLAYWRIGHT Y NO LA INFRA DE CDP DEL REPO, igual que la sonda del Y1c: hay que medir en
 * DOS motores —Chrome y WebKit, el de Safari, que es el navegador del medico— y cdp.mjs solo
 * habla con Chrome. Playwright manda entrada CONFIABLE (clics, teclas y arrastre reales).
 * ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI: es el motor, con otra capa de integracion.
 * ⚠️ UNA SOLA INSTANCIA DE CADA MOTOR A LA VEZ, cerrada con `browser.close()`. Nada por nombre.
 *
 *   node scripts/_probe_y3b.mjs --file /tmp/index.Y3bHEAD.html > /tmp/y3b.HEAD.json
 *   node scripts/_probe_y3b.mjs                                > /tmp/y3b.NEW.json
 *   node scripts/_probe_y3b.mjs --solo giro --dest /tmp/capy3b
 *
 * Grupos (--solo a,b,c):
 *   giro      - arrastre con mouse y con dedo, flechas, sin zoom, botones sin marcar, 20 ciclos
 *               y los oyentes del panel cerrado.
 *   marco     - el tamano del cuadro y la CAJA DE PIXELES PINTADOS por vista x angulo x grado.
 *   tabla     - la tabla: donde esta, su formato y sus lineas, y la maqueta a cuatro anchos.
 *   wilk      - el Wilkins: la tabla de combinaciones en las DOS pantallas.
 *   otros     - pericardio, masas, pulmon, derrame pleural y lineas B en las tres superficies.
 *   controles - A/B: informe, EN SUMA, grados, pastillas, diastolica, HFA-PEFF y el Excel.
 *   captura   - PNG del panel por motor, tema, ancho y escena.
 *
 * ⚠️ Sin acentos graves dentro del template de la sonda, tampoco en sus comentarios.
 */
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { createHash } from 'node:crypto';

const CANDIDATAS = ['/tmp/node_modules/playwright/index.js',
                    '/usr/local/lib/node_modules/playwright/index.js',
                    process.env.HOME + '/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CANDIDATAS) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) {
  console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CANDIDATAS }, null, 1));
  process.exit(2);
}
const { chromium, webkit } = _pw;

const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const ARCH = arg('--file');
const DEST = arg('--dest');
const SOLO = (arg('--solo') || '').split(',').map(s => s.trim()).filter(Boolean);
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
   CENTINELA EN CADA LECTURA: contra HEAD varias piezas no existen y un `.length` sobre
   undefined mata la corrida entera, lo que prueba que el arbol es distinto y no que la sonda
   sabe medir. Es la leccion que TC-455 y las once que la siguen ya tienen escrita. */
const SONDA = `window.__P = {
  despejar() { var n = 0;
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (m && getComputedStyle(m).display !== 'none') { m.style.display = 'none'; n++; }
    });
    return n },
  el(id) { return document.getElementById(id) },
  fn(n) { return typeof window[n] === 'function' },
  rect(sel) { var e = document.querySelector(sel); if (!e) return null;
    var r = e.getBoundingClientRect();
    return { w:+r.width.toFixed(2), h:+r.height.toFixed(2), x:+r.left.toFixed(2), y:+r.top.toFixed(2) } },
  txt(sel) { var e = document.querySelector(sel); return e ? String(e.textContent||'').replace(/[ ]+/g,' ').trim() : 'NO EXISTE' },
  val(id) { var e = document.getElementById(id); return e ? String(e.value == null ? '' : e.value) : 'NO EXISTE' },
  atr(id, a) { var e = document.getElementById(id); return e ? String(e.getAttribute(a)) : 'NO EXISTE' },
  css(sel, p) { var e = document.querySelector(sel); if (!e) return 'NO EXISTE';
    return getComputedStyle(e).getPropertyValue(p) },
  tema(claro) { document.documentElement.classList.toggle('light-mode', !!claro);
    return document.documentElement.classList.contains('light-mode') === !!claro },

  /* ══ ETE: la pestana y las dos secciones plegadas. Sin esto el panel y el boton MIDEN 0x0 y
     una sonda informa «no abre» sobre un mecanismo perfecto (trampa 2 del mapa del 3D). ══ */
  ete() {
    try { if (this.fn('showTab')) showTab('ete') } catch (e) {}
    var abiertas = [];
    ['mitral','mediciones-mitral','wilkins'].forEach(function(k){
      try { var s = document.getElementById('ete-seccion-' + k);
        if (s && getComputedStyle(s).display === 'none' && typeof toggleEteSeccion === 'function')
          toggleEteSeccion(k, null);
        s = document.getElementById('ete-seccion-' + k);
        if (s && getComputedStyle(s).display !== 'none') abiertas.push(k);
      } catch (e) {} });
    return abiertas },
  /* La tarjeta del Wilkins de Calculadoras es un toggleCard que nace plegado, dentro de la
     pestana tab-calculadoras: sin abrir las dos, sus cuatro selects miden 0x0 y un gesto real
     no tiene donde aterrizar —la primera corrida informo «el gesto no pone la marca» sobre un
     select que nunca se enfoco—. */
  calc() {
    try { if (this.fn('showTab')) showTab('calculadoras') } catch (e) {}
    try { var c = document.getElementById('cx-wilkins');
      if (c && getComputedStyle(c).display === 'none' && typeof toggleCard === 'function')
        toggleCard('cx-wilkins', null) } catch (e) {}
    var c2 = document.getElementById('cx_wilk_eng');
    var r = c2 ? c2.getBoundingClientRect() : null;
    return r ? { w: +r.width.toFixed(1), h: +r.height.toFixed(1) } : 'NO EXISTE' },
  abrir3d() { var b = document.getElementById('m3d-btn'); if (!b) return 'SIN BOTON';
    if (!this.visible3d()) b.click();
    return this.visible3d() },
  cerrar3d() { try { if (this.fn('m3dCerrar')) m3dCerrar() } catch (e) {} return this.visible3d() },
  visible3d() { try { return this.fn('m3dVisible') ? m3dVisible() : 'SIN FN' } catch (e) { return 'EXC' } },
  camara() { try { return this.fn('m3dEstadoCamara') ? m3dEstadoCamara() : 'SIN FN' } catch (e) { return 'EXC' } },
  cableado() { try { return this.fn('m3dGiroCableado') ? m3dGiroCableado() : 'SIN FN' } catch (e) { return 'EXC' } },
  /* Pausa el latido y fija la fase: sin eso el lienzo cambia en cada cuadro y dos hashes
     seguidos del mismo estado no coinciden nunca. */
  congelar(fase) {
    try { var c = this.camara();
      if (c && c.play === true && this.fn('m3dPlay')) m3dPlay();
      if (this.fn('m3dFaseFijar')) m3dFaseFijar(fase == null ? 0.5 : fase);
    } catch (e) { return 'EXC' }
    var c2 = this.camara();
    return c2 && c2.play === false },
  marcados() {
    var ids = ['m3d-v-cirujano','m3d-v-ventriculo','m3d-v-lateral',
               'm3d-a-0','m3d-a-45','m3d-a-60','m3d-a-90','m3d-a-120'];
    return ids.filter(function(i){ var e = document.getElementById(i);
      return e && e.getAttribute('aria-pressed') === 'true' }) },

  /* ══ EL LIENZO: hash de TODOS los bytes y caja de pixeles pintados. ══
     ⚠️ EL HASH VA SOBRE TODOS LOS BYTES Y NO SOBRE UNA MUESTRA RALA: la sonda del VI 3D hashea
     1 de cada 997 bytes y eso dio falsos de los dos signos (ver CLAUDE.md). */
  pix() { var cv = document.getElementById('m3d-cv');
    if (!cv || !cv.getContext) return null;
    var ctx = null; try { ctx = cv.getContext('2d') } catch (e) { return null }
    if (!ctx) return null;
    var d = null; try { d = ctx.getImageData(0, 0, cv.width, cv.height) } catch (e) { return null }
    var a = d.data, n = a.length, h = 2166136261, i, pint = 0;
    var x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, px, py;
    for (i = 0; i < n; i++) { h ^= a[i]; h = (h * 16777619) >>> 0; }
    for (i = 3; i < n; i += 4) {
      if (a[i] > 8) { pint++; px = ((i - 3) / 4) % cv.width; py = Math.floor(((i - 3) / 4) / cv.width);
        if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; } }
    return { w: cv.width, h: cv.height, hash: h, pintados: pint,
             caja: pint ? { x0: x0, y0: y0, x1: x1, y1: y1,
                            margenIzq: x0, margenDer: cv.width - 1 - x1,
                            margenArr: y0, margenAba: cv.height - 1 - y1 } : null } },

  /* La tabla de datos: titulo, encabezados de grupo y una entrada por linea. */
  tabla3d() { var h = document.getElementById('m3d-tabla');
    if (!h) return { hay:false };
    var tit = h.querySelector('.m3d-nota');
    var filas = Array.prototype.slice.call(h.querySelectorAll('tr')).map(function(r){
      var th = r.querySelectorAll('th'), td = r.querySelectorAll('td');
      if (th.length) return { g: String(th[0].textContent || '').trim() };
      return { k: String(td[0] ? td[0].textContent : '').replace(/[ ]+/g,' ').trim(),
               v: String(td[1] ? td[1].textContent : '').replace(/[ ]+/g,' ').trim() } });
    return { hay: !!h.querySelector('table'), tit: tit ? String(tit.textContent||'').trim() : '',
             filas: filas, rect: this.rect('#m3d-tabla'),
             texto: String(h.textContent || '').replace(/[ ]+/g,' ').trim() } },
  tarjetas3d() { var h = document.getElementById('m3d-grados');
    if (!h) return [];
    return Array.prototype.slice.call(h.children).map(function(d){
      return String(d.textContent || '').replace(/[ ]+/g,' ').trim() }) },

  /* ══ WILKINS ══ Los dos calculos, leidos de la PANTALLA y del dueno si existe. ══ */
  wilkEte(v) {
    var ids = ['wilkins_movilidad','wilkins_engrosamiento','wilkins_calcificacion','wilkins_subvalvular'];
    var i, e;
    for (i = 0; i < 4; i++) { e = document.getElementById(ids[i]); if (!e) return 'SIN CAMPO ' + ids[i];
      e.value = v[i]; e.dispatchEvent(new Event('change', { bubbles: true })); }
    try { if (this.fn('calcWilkins')) calcWilkins() } catch (x) {}
    return { total: this.txt('#wilkins-total'), interp: this.txt('#wilkins-interp'),
             banda: this.atr('wilkins-interp', 'data-banda'),
             score: (function(){ try { return typeof wilkinsScore === 'function' ? wilkinsScore() : 'SIN FN' }
                                 catch (x) { return 'EXC' } })() } },
  wilkCx(v) {
    var ids = ['cx_wilk_mov','cx_wilk_eng','cx_wilk_cal','cx_wilk_sub'];
    var i, e;
    for (i = 0; i < 4; i++) { e = document.getElementById(ids[i]); if (!e) return 'SIN CAMPO ' + ids[i];
      e.value = v[i]; e.dispatchEvent(new Event('change', { bubbles: true })); }
    try { if (this.fn('cxWilkins')) cxWilkins() } catch (x) {}
    return { total: this.txt('#cx-wilkins-total') } },
  wilkMarca() { return { ete: this.val('wilkins_delib'), cx: this.val('cx_wilk_delib') } },
  /* Donde se CONSUME el Wilkins: el informe narrativo, la hoja del PDF de ETE, la columna del
     Excel y el recuento del Laboratorio. Los cuatro sobre el MISMO estado de pantalla. */
  wilkConsumo() {
    var o = {};
    try { if (this.fn('setEstiloInforme')) setEstiloInforme('estandar') } catch (e) {}
    try { if (this.fn('generarInforme')) generarInforme() } catch (e) {}
    var inf = String((document.getElementById('informe_texto') || {}).value || '');
    var li = inf.split(String.fromCharCode(10)).filter(function(x){ return x.indexOf('Wilkins') > -1 });
    o.informe = li.join(' || ') || 'SIN LINEA DE WILKINS';
    o.pdfEte = this.fn('amiloTextoWilkins') ? amiloTextoWilkins() : 'SIN FN';
    var f = this.excel();
    o.excel = (f && typeof f === 'object') ? f['Score Wilkins total'] : f;
    return o },

  /* ══ SUPERFICIES ══ */
  informe(estilo) { try { if (this.fn('setEstiloInforme')) setEstiloInforme(estilo) } catch (e) {}
    try { if (this.fn('generarInforme')) generarInforme() } catch (e) {}
    return { inf: String((document.getElementById('informe_texto') || {}).value || ''),
             suma: String((document.getElementById('en_suma') || {}).value || '') } },
  grados() { var o = {};
    ['im','ia','it','ip','em','ea','et','ep'].forEach(function(k){
      var e = document.getElementById(k + '_grado'); o[k] = e ? String(e.value) : 'NO EXISTE' });
    ['ea-sev','em-sev-integrada','ip-sev','ep-sev','dd-interp','hfapeff-eco'].forEach(function(id){
      var e = document.getElementById(id); o[id] = e ? String(e.textContent||'').replace(/[ ]+/g,' ').trim() : 'NO EXISTE' });
    return o },
  pastillas() { var o = {};
    Array.prototype.slice.call(document.querySelectorAll('.valv-pill')).forEach(function(b){
      o[b.id] = b.classList.contains('valv-pill-on') || b.getAttribute('aria-pressed') === 'true'
        ? 'on' : (b.className.indexOf('btn-primary') > -1 ? 'on' : 'off') });
    return o },
  /* ⚠️ _labExcelRow TRABAJA SOBRE UN ESTUDIO ARCHIVADO y no sobre el formulario: se le pasa un
     registro armado con los campos CRUDOS de la pantalla. Pasarle null devuelve una excepcion
     que se lee igual que «el Excel no existe». */
  camposCrudos() { var c = {};
    Array.prototype.slice.call(document.querySelectorAll('input[id],select[id],textarea[id]'))
      .forEach(function(e){
        if (e.type === 'checkbox' || e.type === 'radio') c[e.id + '__chk'] = e.checked ? '1' : '0';
        else c[e.id] = e.value });
    return c },
  excel() { try {
      if (typeof _labExcelRow !== 'function') return 'SIN FN';
      return _labExcelRow({ id: 'p1', fecha: '2026-10-16', nombre: 'X', campos: this.camposCrudos(),
                            informe_texto: '', en_suma: '' });
    } catch (e) { return 'EXC ' + String(e && e.message).slice(0, 80) } },
  campos() { var o = {};
    Array.prototype.slice.call(document.querySelectorAll('input[id], select[id], textarea[id]'))
      .forEach(function(e){ if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
        if (e.id === 'informe_texto' || e.id === 'en_suma') return;
        o[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value == null ? '' : e.value) });
    return o },
  scrollY() { return window.scrollY },
  docH() { return document.documentElement.scrollHeight }
};`;

const BSA = { peso: '80', talla: '180' };
const ESC = {
  vacio: { campos: {} },
  /* IM SEVERA con vena contracta medida, AI dilatada y datos de ETE: es la escena donde la
     auricula y el chorro son mas grandes, o sea la que puede quedar recortada arriba. */
  imSevera: { campos: Object.assign({}, BSA, { im_vc: '8', ai_vol: '120', ai_area: '28',
    ete_diam_anular: '38', ete_lva: '26', ete_lvp: '14', ete_area_mitral: '1.4',
    ete_altura_tenting: '12', ete_area_tenting: '3.1', ete_angulo_vp: '45',
    ete_prof_coapt: '11', teer_ancho_flail: '12', teer_flail_gap: '6', teer_gap: '3',
    teer_prof_flail: '9', em_gmedio: '8', avm_plan: '1.4' }),
    sev: [['insuf', 'mitral', '4']] },
  imModerada: { campos: Object.assign({}, BSA, { im_vc: '5', ai_vol: '95' }),
    sev: [['insuf', 'mitral', '2']] },
  imLeve: { campos: Object.assign({}, BSA, { im_vc: '2', ai_vol: '70' }),
    sev: [['insuf', 'mitral', '1']] },
  rico: { campos: Object.assign({}, BSA, { ddfvi: '66', dsfvi: '52', siv: '13', ppvi: '13',
    fevi: '30', ai_vol: '105', ai_area: '26', vd_bas: '47', tapse: '14', s_prime: '8',
    im_vc: '7', vmax_it: '3.2', onda_e: '95', onda_a: '45', tde: '150', e_sept: '5',
    e_lat: '7', lars: '12', ea_vmax: '4.5', gmedio_ao: '45', itv_ao: '120',
    ea_dtsvi: '20', itv_tsvi: '20', hf_ntprobnp: '450' }),
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
    ['calcVI','calcVD','calcAI','calcAorta','calcIM_ESC','calcIA_ESC','calcIT_ESC','calcEM','calcAo',
     'calcET','calcETE','calcTEER','calcDiastol','calcWilkins','cxWilkins']
      .forEach(f => { try { window[f]() } catch (x) {} });
    (e.sev || []).forEach(([t, v, g]) => { try { valvSev.aplicar(t, v, g) } catch (x) {} });
  }, e);
  await pg.evaluate(() => window.__P.ete());
}

async function nuevaPagina(b, W, H, touch) {
  const ctx = await b.newContext({ viewport: { width: W, height: H },
                                   hasTouch: !!touch, isMobile: false });
  const pg = await ctx.newPage();
  await pg.goto(`http://127.0.0.1:${PORT}/index.html`);
  await pg.evaluate(() => { try { sessionStorage.setItem('ett_auth', '1') } catch (e) {} });
  await pg.reload();
  await pg.waitForTimeout(2600);
  await pg.evaluate(SONDA);
  await pg.evaluate(() => window.__P.despejar());
  return pg;
}

/* ⚠️ `block:'center'` Y NO `scrollIntoViewIfNeeded`: el segundo deja el nodo PEGADO al borde de
   abajo, con lo que su centro puede caer fuera del viewport y el gesto se manda al vacio. */
async function centrar(pg, sel) {
  try { await pg.evaluate((s) => { const e = document.querySelector(s);
    if (e && e.scrollIntoView) e.scrollIntoView({ block: 'center', inline: 'center' }) }, sel);
    await pg.waitForTimeout(140) } catch (e) {}
}

async function tocar(pg, sel) {
  try { await pg.locator(sel).click({ timeout: 4000 }); return true }
  catch (e) { out.abortos.push('clic ' + sel + ': ' + String(e && e.message).slice(0, 90)); return false }
}

/* ⚠️ EL ARRASTRE VA CON EL MOUSE DEL PROTOCOLO: `mouse.move/down/move/up` produce pointerdown y
   pointermove de CONFIANZA. Un `dispatchEvent` desde la pagina no serviria: `isTrusted` en false
   y, para el caso del gesto del Wilkins, la marca no se pondria. */
async function arrastrar(pg, sel, pasos) {
  /* ⚠️ `mouse.move` NO DESPLAZA EL NODO A LA VISTA, a diferencia de `locator.click()`. El panel
     vive al fondo de la pestana ETE, asi que sin esto el puntero aterriza en un punto donde el
     lienzo no esta: la primera corrida informo «el arrastre no cambia el dibujo» sobre un
     mecanismo que funciona. Es la trampa del centro fuera del viewport que la tanda Z pago con
     el globo del cociente TAPSE/PSAP. */
  await centrar(pg, sel);
  const r = await pg.evaluate((s) => window.__P.rect(s), sel);
  if (!r || r.w < 2) { out.abortos.push('arrastre ' + sel + ': sin geometria'); return false }
  const vh = (pg.viewportSize() || { height: 1e9 }).height;
  if (r.y + r.h / 2 < 0 || r.y + r.h / 2 > vh) {
    out.abortos.push('arrastre ' + sel + ': centro fuera del viewport y=' + r.y); return false }
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
  await pg.mouse.move(cx, cy);
  await pg.mouse.down();
  for (const [dx, dy] of pasos) { await pg.mouse.move(cx + dx, cy + dy); await pg.waitForTimeout(16) }
  await pg.mouse.up();
  await pg.waitForTimeout(80);
  return true
}

/* El arrastre con el DEDO solo se puede mandar con eventos de confianza por CDP, que es de
   Chromium. En WebKit se declara y se mide en su lugar el `touch-action` resuelto. */
async function arrastrarDedo(pg, sel) {
  let cdp = null;
  try { cdp = await pg.context().newCDPSession(pg) } catch (e) { return 'SIN CDP' }
  await centrar(pg, sel);
  const r = await pg.evaluate((s) => window.__P.rect(s), sel);
  if (!r || r.w < 2) return 'SIN GEOMETRIA';
  const vh2 = (pg.viewportSize() || { height: 1e9 }).height;
  if (r.y + r.h / 2 < 0 || r.y + r.h / 2 > vh2) return 'CENTRO FUERA DEL VIEWPORT';
  const cx = Math.round(r.x + r.w / 2), cy = Math.round(r.y + r.h / 2);
  const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts });
  await T('touchStart', [{ x: cx, y: cy }]);
  for (let k = 1; k <= 6; k++) { await T('touchMove', [{ x: cx + k * 10, y: cy + k * 6 }]); await pg.waitForTimeout(16) }
  await T('touchEnd', []);
  await pg.waitForTimeout(80);
  try { await cdp.detach() } catch (e) {}
  return 'OK'
}

const UNM = arg('--motor');
const MOTORES = [['chrome', chromium, { channel: 'chrome' }], ['webkit', webkit, {}]]
  .filter(([n]) => !UNM || n === UNM);
if (DEST) await mkdir(DEST, { recursive: true });

for (const [motor, tipo, op] of MOTORES) {
  let b = null;
  try { b = await tipo.launch(op) } catch (e) {
    out.grupos[motor] = { error: 'NO LANZA: ' + String(e && e.message).slice(0, 120) };
    continue }
  const G = out.grupos[motor] = {};
  G.version = b.version();

  /* ── giro ──────────────────────────────────────────────────────────────────────────────── */
  if (corre('giro')) {
    const g = {};
    const pg = await nuevaPagina(b, 1200, 700, true);
    await montarEscena(pg, ESC.imSevera);
    g.secciones = await pg.evaluate(() => window.__P.ete());
    g.touchAction = { cv: await pg.evaluate(() => window.__P.css('#m3d-cv', 'touch-action')),
                      panel: await pg.evaluate(() => window.__P.css('#m3d-panel', 'touch-action')),
                      body: await pg.evaluate(() => window.__P.css('body', 'touch-action')) };
    g.cableadoCerrado = await pg.evaluate(() => window.__P.cableado());
    g.abre = await pg.evaluate(() => window.__P.abrir3d());
    g.cableadoAbierto = await pg.evaluate(() => window.__P.cableado());
    g.congela = await pg.evaluate(() => window.__P.congelar(0.5));
    g.antes = await pg.evaluate(() => window.__P.pix());
    g.marcadosAntes = await pg.evaluate(() => window.__P.marcados());
    g.camaraAntes = await pg.evaluate(() => window.__P.camara());
    /* ARRASTRE CON MOUSE REAL */
    g.arrastreMouse = await arrastrar(pg, '#m3d-cv', [[20, 0], [40, 10], [60, 20], [80, 24]]);
    g.despues = await pg.evaluate(() => window.__P.pix());
    g.marcadosDespues = await pg.evaluate(() => window.__P.marcados());
    g.camaraDespues = await pg.evaluate(() => window.__P.camara());
    g.cambioMouse = !!(g.antes && g.despues && g.antes.hash !== g.despues.hash);
    /* TOCAR UN BOTON VUELVE A SU POSICION */
    await tocar(pg, '#m3d-v-cirujano');
    await pg.waitForTimeout(900);
    g.trasBoton = { marcados: await pg.evaluate(() => window.__P.marcados()),
                    pix: await pg.evaluate(() => window.__P.pix()),
                    camara: await pg.evaluate(() => window.__P.camara()) };
    /* ⚠️ EL HASH NO SIRVE PARA «VOLVIO AL ORIGEN», y lo midio la diferencia entre motores: el
       boton no repone la matriz identidad, interpola hasta ella con cuaterniones, asi que
       `_m3dR` queda reconstruido desde un cuaternion y no es identico bit a bit a la identidad.
       En WebKit el hash coincidia y en Chrome no, sobre la MISMA camara. Lo que se compara es la
       CAJA de pixeles pintados y su cantidad, con tolerancia de un pixel. */
    const cerca = (a, b) => !!(a && b && a.caja && b.caja
      && Math.abs(a.pintados - b.pintados) <= Math.max(40, a.pintados * 0.01)
      && Math.abs(a.caja.x0 - b.caja.x0) <= 1 && Math.abs(a.caja.x1 - b.caja.x1) <= 1
      && Math.abs(a.caja.y0 - b.caja.y0) <= 1 && Math.abs(a.caja.y1 - b.caja.y1) <= 1);
    g.vuelveAlOrigen = cerca(g.antes, g.trasBoton.pix);
    g.hashVuelta = !!(g.antes && g.trasBoton.pix && g.antes.hash === g.trasBoton.pix.hash);
    g.girosDistintos = !cerca(g.antes, g.despues);
    /* FLECHAS DEL TECLADO */
    /* ⚠️ EL LIENZO SE LLEVA A LA VISTA Y SE MIDE EL DESPLAZAMIENTO CON LA PAGINA YA DESPLAZADA:
       con scrollY en 0 y la flecha abajo, «no se desplazo» se cumple por no tener a donde ir. */
    await centrar(pg, '#m3d-cv');
    await pg.locator('#m3d-cv').focus();
    g.focoLienzo = await pg.evaluate(() => document.activeElement ? document.activeElement.id : null);
    const base = await pg.evaluate(() => window.__P.pix());
    g.scrollAntesTecla = await pg.evaluate(() => window.__P.scrollY());
    await pg.keyboard.press('ArrowRight');
    await pg.waitForTimeout(120);
    g.flechaDer = await pg.evaluate(() => window.__P.pix());
    g.scrollTrasTecla = await pg.evaluate(() => window.__P.scrollY());
    await pg.keyboard.press('ArrowUp');
    await pg.waitForTimeout(120);
    g.flechaArr = await pg.evaluate(() => window.__P.pix());
    g.teclaGira = !!(base && g.flechaDer && base.hash !== g.flechaDer.hash);
    g.teclaGira2 = !!(g.flechaDer && g.flechaArr && g.flechaDer.hash !== g.flechaArr.hash);
    g.teclaNoDesplaza = g.scrollAntesTecla === g.scrollTrasTecla;
    g.marcadosTrasTecla = await pg.evaluate(() => window.__P.marcados());
    /* SIN ZOOM: la rueda no cambia el dibujo ni el zoom de la camara */
    const cz = await pg.evaluate(() => window.__P.camara());
    const pz = await pg.evaluate(() => window.__P.pix());
    const rr = await pg.evaluate(() => window.__P.rect('#m3d-cv'));
    await pg.mouse.move(rr.x + rr.w / 2, rr.y + rr.h / 2);
    await pg.mouse.wheel(0, -300);
    await pg.waitForTimeout(150);
    /* ⚠️ `m3dEstadoCamara` NO PUBLICA EL ZOOM, asi que lo que prueba que no hay zoom es que el
       lienzo salga IDENTICO byte por byte tras la rueda, y que la hoja no declare ningun oyente
       de `wheel` ni de gestos de pellizco sobre el lienzo. */
    g.rueda = { camaraAntes: cz, camaraDespues: await pg.evaluate(() => window.__P.camara()),
                hashIgual: (await pg.evaluate(() => window.__P.pix())).hash === (pz && pz.hash),
                sinWheel: await pg.evaluate(() => {
                  const f = String(document.documentElement.innerHTML || '');
                  return { wheel: (f.match(/m3d[^;]{0,40}wheel/g) || []).length,
                           gesture: (f.match(/m3d[^;]{0,40}gesture/gi) || []).length } }) };
    /* ARRASTRE CON EL DEDO: cambia el dibujo y NO desplaza la pagina */
    /* ⚠️ EL DESPLAZAMIENTO SE LEE DESPUES DE LLEVAR EL LIENZO A LA VISTA: la primera corrida lo
       leia antes, asi que el `scrollIntoViewIfNeeded` de adentro contaba como «la pagina bajo
       con el dedo» y la sonda informo un defecto que no existe. */
    await centrar(pg, '#m3d-cv');
    const antesDedo = await pg.evaluate(() => window.__P.pix());
    const sy0 = await pg.evaluate(() => window.__P.scrollY());
    g.scrollDedoAntes = sy0;
    g.dedo = await arrastrarDedo(pg, '#m3d-cv');
    g.dedoCambia = g.dedo === 'OK'
      ? (await pg.evaluate(() => window.__P.pix())).hash !== (antesDedo && antesDedo.hash) : g.dedo;
    g.dedoNoDesplaza = g.dedo === 'OK'
      ? (await pg.evaluate(() => window.__P.scrollY())) === sy0 : g.dedo;
    /* CERRAR: sin oyentes y sin cuadros */
    await pg.evaluate(() => window.__P.cerrar3d());
    g.trasCerrar = { visible: await pg.evaluate(() => window.__P.visible3d()),
                     cableado: await pg.evaluate(() => window.__P.cableado()),
                     camara: await pg.evaluate(() => window.__P.camara()),
                     marcados: await pg.evaluate(() => window.__P.marcados()) };
    /* CUADROS REALES, espiando `requestAnimationFrame` y no una bandera que el codigo escribe. */
    g.cuadros = await pg.evaluate(async () => {
      const esperar = (ms) => new Promise(r => setTimeout(r, ms));
      const raf = window.requestAnimationFrame;
      let n = 0;
      window.requestAnimationFrame = function(f){ n++; return raf.call(window, f) };
      const med = async (ms) => { n = 0; await esperar(ms); return n };
      const cerrado = await med(900);
      try { m3dAbrir(); m3dPlay && (window.__P.camara().play === false) && m3dPlay() } catch (e) {}
      const abierto = await med(900);
      try { m3dCerrar() } catch (e) {}
      const tras = await med(900);
      window.requestAnimationFrame = raf;
      return { cerrado, abierto, tras };
    });
    /* 20 CICLOS: nodos, oyentes y estado final */
    g.ciclos = await pg.evaluate(() => {
      const n0 = document.getElementsByTagName('*').length;
      let add = 0, rem = 0;
      const cv = document.getElementById('m3d-cv');
      const oa = cv.addEventListener.bind(cv), orr = cv.removeEventListener.bind(cv);
      cv.addEventListener = function(t, f, o){ add++; return oa(t, f, o) };
      cv.removeEventListener = function(t, f, o){ rem++; return orr(t, f, o) };
      for (let k = 0; k < 20; k++) { try { m3dAbrir(); m3dCerrar() } catch (e) {} }
      cv.addEventListener = oa; cv.removeEventListener = orr;
      return { nodos0: n0, nodos1: document.getElementsByTagName('*').length,
               add: add, rem: rem, cerrado: !m3dVisible(),
               cableado: typeof m3dGiroCableado === 'function' ? m3dGiroCableado() : 'SIN FN' };
    });
    await pg.close();
    G.giro = g;
  }

  /* ── marco ── El tamano del cuadro y la caja de pixeles pintados. ──────────────────────── */
  if (corre('marco')) {
    const g = { medidas: null, escenas: {} };
    const pg = await nuevaPagina(b, 1200, 700);
    await montarEscena(pg, ESC.imSevera);
    await pg.evaluate(() => window.__P.abrir3d());
    /* ⚠️ EL PANEL ANIMA SU ANCHO .24s: medido sin esperar, su rect daba 0 y la vista quirurgica
       seguia en 500 px, o sea la maqueta de un estado intermedio. */
    await pg.waitForTimeout(500);
    g.medidas = { lienzo: await pg.evaluate(() => window.__P.rect('#m3d-lienzo')),
                  cv: await pg.evaluate(() => window.__P.rect('#m3d-cv')),
                  panel: await pg.evaluate(() => window.__P.rect('#m3d-panel')),
                  qx: await pg.evaluate(() => window.__P.rect('#m3d-qx')),
                  grados: await pg.evaluate(() => window.__P.rect('#m3d-grados')),
                  tabla: await pg.evaluate(() => window.__P.rect('#m3d-tabla')),
                  ciclo: await pg.evaluate(() => window.__P.rect('#m3d-ciclo')),
                  desc: await pg.evaluate(() => window.__P.rect('#m3d-desc')),
                  fila: await pg.evaluate(() => window.__P.rect('#m3d-fila')) };
    for (const [nom, esc] of [['severa', ESC.imSevera], ['moderada', ESC.imModerada], ['leve', ESC.imLeve]]) {
      await montarEscena(pg, esc);
      await pg.evaluate(() => window.__P.abrir3d());
      await pg.evaluate(() => window.__P.congelar(0.5));
      const e = {};
      for (const v of ['cirujano', 'ventriculo', 'lateral']) {
        await pg.evaluate((k) => { try { m3dVista(k) } catch (x) {} }, v);
        await pg.waitForTimeout(760);
        e['v:' + v] = await pg.evaluate(() => window.__P.pix());
      }
      for (const a of [0, 45, 60, 90, 120]) {
        await pg.evaluate((k) => { try { m3dAngulo(k) } catch (x) {} }, a);
        await pg.waitForTimeout(760);
        e['a:' + a] = await pg.evaluate(() => window.__P.pix());
      }
      g.escenas[nom] = e;
      await pg.evaluate(() => window.__P.cerrar3d());
    }
    await pg.close();
    G.marco = g;
  }

  /* ── tabla ── Donde esta, su formato, y la maqueta a cuatro anchos. ────────────────────── */
  if (corre('tabla')) {
    const g = { conDatos: null, vacio: null, soloEte: null, anchos: {} };
    {
      const pg = await nuevaPagina(b, 1200, 700);
      await montarEscena(pg, ESC.imSevera);
      await pg.evaluate(() => window.__P.abrir3d());
      await pg.waitForTimeout(500);
      g.conDatos = { tabla: await pg.evaluate(() => window.__P.tabla3d()),
                     tarjetas: await pg.evaluate(() => window.__P.tarjetas3d()),
                     rects: { cv: await pg.evaluate(() => window.__P.rect('#m3d-cv')),
                              grados: await pg.evaluate(() => window.__P.rect('#m3d-grados')),
                              tabla: await pg.evaluate(() => window.__P.rect('#m3d-tabla')),
                              ciclo: await pg.evaluate(() => window.__P.rect('#m3d-ciclo')),
                              desc: await pg.evaluate(() => window.__P.rect('#m3d-desc')) } };
      await montarEscena(pg, ESC.vacio);
      await pg.evaluate(() => window.__P.abrir3d());
      g.vacio = { tabla: await pg.evaluate(() => window.__P.tabla3d()),
                  tarjetas: await pg.evaluate(() => window.__P.tarjetas3d()) };
      await pg.close();
    }
    for (const W of [1440, 1200, 768, 390, 360]) {
      const pg = await nuevaPagina(b, W, 900);
      await montarEscena(pg, ESC.imSevera);
      await pg.evaluate(() => window.__P.abrir3d());
      await pg.waitForTimeout(500);
      g.anchos[W] = { cv: await pg.evaluate(() => window.__P.rect('#m3d-cv')),
                      lienzo: await pg.evaluate(() => window.__P.rect('#m3d-lienzo')),
                      panel: await pg.evaluate(() => window.__P.rect('#m3d-panel')),
                      qx: await pg.evaluate(() => window.__P.rect('#m3d-qx')),
                      grados: await pg.evaluate(() => window.__P.rect('#m3d-grados')),
                      tabla: await pg.evaluate(() => window.__P.rect('#m3d-tabla')),
                      ciclo: await pg.evaluate(() => window.__P.rect('#m3d-ciclo')),
                      desc: await pg.evaluate(() => window.__P.rect('#m3d-desc')),
                      scrollH: await pg.evaluate(() => document.documentElement.scrollWidth),
                      vw: await pg.evaluate(() => window.innerWidth) };
      await pg.close();
    }
    G.tabla = g;
  }

  /* ── wilk ── La tabla de combinaciones en las dos pantallas. ───────────────────────────── */
  if (corre('wilk')) {
    const COMB = [['','','',''], ['1','1','1','1'], ['2','2','2','2'], ['3','2','2','2'],
                  ['3','3','3','2'], ['3','3','3','3'], ['4','4','4','4'], ['3','2','2','']];
    const g = { sinMarca: {}, conMarca: {}, gesto: null, marcaTrasCargar: null };
    const pg = await nuevaPagina(b, 1280, 860);
    await montarEscena(pg, ESC.vacio);
    for (const c of COMB) {
      const ete = c.map(x => x === '' ? '0' : x);
      g.sinMarca[c.join('/') || 'vacio'] = {
        ete: await pg.evaluate((v) => window.__P.wilkEte(v), ete),
        cx: await pg.evaluate((v) => window.__P.wilkCx(v), c),
        marca: await pg.evaluate(() => window.__P.wilkMarca()) };
    }
    /* EL GESTO REAL: se enfoca un select del Wilkins y se cambia con el TECLADO. */
    await montarEscena(pg, ESC.vacio);
    await pg.evaluate(() => window.__P.ete());
    g.gesto = { marcaAntes: await pg.evaluate(() => window.__P.wilkMarca()) };
    /* ⚠️ LA FLECHA NO CAMBIA UN <select> CERRADO EN NINGUNO DE LOS DOS MOTORES —medido: el valor
       no se movio y no hubo ni un `change`—. Lo que SI es un gesto real es la BUSQUEDA POR LETRA:
       tipear el primer caracter de una opcion la elige y despacha un `change` con `isTrusted` en
       true. Y `selectOption` de Playwright lo despacha con `isTrusted` en FALSE, que es lo que
       prueba que la guarda de la marca distingue el gesto del codigo —tambien medido—. */
    g.gesto.cajaCalc = await pg.evaluate(() => window.__P.calc());
    for (const [src, id, tecla] of [['ete', 'wilkins_movilidad', '3'], ['cx', 'cx_wilk_eng', '2']]) {
      try {
        if (src === 'ete') await pg.evaluate(() => window.__P.ete());
        else await pg.evaluate(() => window.__P.calc());
        await centrar(pg, '#' + id);
        await pg.locator('#' + id).focus();
        await pg.keyboard.press(tecla);
        await pg.waitForTimeout(160);
        g.gesto[src] = { valor: await pg.evaluate((i) => window.__P.val(i), id),
                         marca: await pg.evaluate(() => window.__P.wilkMarca()) };
      } catch (e) { g.gesto[src] = { err: String(e && e.message).slice(0, 90) } }
    }
    /* CONTROL NEGATIVO DEL GESTO: el mismo cambio por CODIGO no pone la marca. */
    await pg.evaluate(() => { try { limpiarCampos(true) } catch (e) {} });
    await pg.evaluate(() => window.__P.ete());
    await pg.evaluate(() => { const n = document.getElementById('wilkins_movilidad');
      n.value = '3'; n.dispatchEvent(new Event('change', { bubbles: true })) });
    await pg.evaluate(() => window.__P.calc());
    g.gesto.porCodigo = { valor: await pg.evaluate(() => window.__P.val('wilkins_movilidad')),
                          marca: await pg.evaluate(() => window.__P.wilkMarca()) };
    try { await pg.selectOption('#cx_wilk_cal', '3'); await pg.waitForTimeout(120) } catch (e) {}
    g.gesto.porSelectOption = { valor: await pg.evaluate(() => window.__P.val('cx_wilk_cal')),
                                marca: await pg.evaluate(() => window.__P.wilkMarca()) };
    /* Con la marca puesta, el 1/1/1/1 es un 4/16 valido en las dos pantallas. */
    await pg.evaluate(() => { ['wilkins_delib','cx_wilk_delib'].forEach(function(i){
      var e = document.getElementById(i); if (e) e.value = '1' }) });
    for (const c of [['1','1','1','1'], ['2','2','2','2']]) {
      const ete = c.map(x => x === '' ? '0' : x);
      g.conMarca[c.join('/')] = { ete: await pg.evaluate((v) => window.__P.wilkEte(v), ete),
                                  cx: await pg.evaluate((v) => window.__P.wilkCx(v), c) };
    }
    /* DONDE SE CONSUME: informe, PDF de ETE y Excel, con y sin la marca, sobre el 1/1/1/1 que es
       el estado de TODO estudio legado de Calculadoras y el de fabrica de ETE. */
    g.consumo = {};
    for (const [nom, v, marca] of [['1/1/1/1 sin marca', ['1','1','1','1'], false],
                                   ['1/1/1/1 con marca', ['1','1','1','1'], true],
                                   ['3/2/2/2', ['3','2','2','2'], false],
                                   ['3/3/3/3', ['3','3','3','3'], false],
                                   ['sin puntuar', ['0','0','0','0'], false]]) {
      await pg.evaluate(() => { try { limpiarCampos(true) } catch (e) {} });
      await pg.evaluate(() => window.__P.ete());
      await pg.evaluate((m) => { const e = document.getElementById('wilkins_delib'); if (e) e.value = m ? '1' : '' }, marca);
      await pg.evaluate((x) => window.__P.wilkEte(x), v);
      g.consumo[nom] = await pg.evaluate(() => window.__P.wilkConsumo());
    }
    /* La marca se borra al limpiar. */
    await pg.evaluate(() => { try { limpiarCampos(true) } catch (e) {} });
    g.marcaTrasLimpiar = await pg.evaluate(() => window.__P.wilkMarca());
    await pg.close();
    G.wilk = g;
  }

  /* ── otros ── Pericardio, masas, pulmon, derrame y lineas B en las tres superficies. ───── */
  if (corre('otros')) {
    const g = {};
    const pg = await nuevaPagina(b, 1280, 860);
    const ESCO = {
      nada: {},
      peri: { pericardio: 'Derrame moderado (10-20mm)' },
      periHemoSi: { pericardio: 'Derrame moderado (10-20mm)', pericardio_hemo: 'si' },
      periHemoNo: { pericardio: 'Derrame moderado (10-20mm)', pericardio_hemo: 'no' },
      masa: { masa_presente: 'Masa / imagen intracardíaca presente', masa_tam_mm: '12' },
      periMasa: { pericardio: 'Derrame leve (5-10mm)', pericardio_hemo: 'no',
                  masa_presente: 'Masa / imagen intracardíaca presente', masa_tam_mm: '14' },
      pulm: { pul_derrame: 'si', pul_derrame_tam: 'moderado', pul_balik: '25',
              pul_derrame_lado: 'bilateral', pul_lineasb: 'si', pul_lineasb_pat: 'difuso',
              pul_consolidacion: 'si', pul_consol_nota: 'con broncograma aereo en base derecha' },
      pulmSinLado: { pul_derrame: 'si', pul_derrame_tam: 'mínimo', pul_balik: '12',
                     pul_lineasb: 'si', pul_consolidacion: 'no' },
      todo: { pericardio: 'Derrame severo (>20mm)', pericardio_hemo: 'si',
              masa_presente: 'Masa / imagen intracardíaca presente', masa_tam_mm: '20',
              pul_derrame: 'si', pul_derrame_tam: 'severo', pul_balik: '40',
              pul_derrame_lado: 'derecho', pul_lineasb: 'si', pul_lineasb_pat: 'focal',
              pul_consolidacion: 'si', pul_consol_nota: 'segmento posterobasal' }
    };
    for (const [nom, campos] of Object.entries(ESCO)) {
      await pg.evaluate((c) => {
        window.__P.despejar();
        try { limpiarCampos(true) } catch (e) {}
        window.__P.despejar();
        const puesto = {};
        Object.keys(c).forEach(id => { const n = document.getElementById(id);
          if (!n) { puesto[id] = 'NO EXISTE'; return }
          const o = Array.prototype.slice.call(n.options || []).filter(o => o.value === c[id] || o.text === c[id])[0];
          if (n.tagName === 'SELECT') { if (!o) { puesto[id] = 'SIN OPCION'; return } n.value = o.value }
          else n.value = c[id];
          n.dispatchEvent(new Event('input', { bubbles: true }));
          n.dispatchEvent(new Event('change', { bubbles: true }));
          puesto[id] = n.value });
        window.__pPuesto = puesto;
      }, campos);
      const e = { puesto: await pg.evaluate(() => window.__pPuesto) };
      for (const est of ['estandar', 'conciso', 'narrativo'])
        e[est] = await pg.evaluate((s) => window.__P.informe(s), est);
      g[nom] = e;
    }
    await pg.close();
    G.otros = g;
  }

  /* ── controles ── A/B de las superficies que NO deben moverse. ─────────────────────────── */
  if (corre('controles')) {
    const g = {};
    const pg = await nuevaPagina(b, 1280, 860);
    for (const [nom, esc] of [['vacio', ESC.vacio], ['rico', ESC.rico]]) {
      await montarEscena(pg, esc);
      const e = {};
      for (const est of ['estandar', 'conciso', 'narrativo'])
        e[est] = await pg.evaluate((s) => window.__P.informe(s), est);
      e.grados = await pg.evaluate(() => window.__P.grados());
      e.pastillas = await pg.evaluate(() => window.__P.pastillas());
      e.excel = await pg.evaluate(() => window.__P.excel());
      e.nCols = e.excel && typeof e.excel === 'object' ? Object.keys(e.excel).length : e.excel;
      e.campos = await pg.evaluate(() => window.__P.campos());
      e.nCampos = e.campos && typeof e.campos === 'object' ? Object.keys(e.campos).length : e.campos;
      g[nom] = e;
    }
    await pg.close();
    G.controles = g;
  }

  /* ── captura ── PNG del panel por tema, ancho y escena. ────────────────────────────────── */
  if (corre('captura') && DEST) {
    const g = {};
    for (const W of [1440, 1200, 768, 390]) {
      for (const [tn, claro] of [['oscuro', false], ['claro', true]]) {
        const pg = await nuevaPagina(b, W, 900);
        await montarEscena(pg, ESC.imSevera);
        await pg.evaluate((c) => window.__P.tema(c), claro);
        await pg.evaluate(() => window.__P.abrir3d());
        await pg.evaluate(() => window.__P.congelar(0.5));
        await pg.waitForTimeout(500);
        const nom = `${motor}-${W}-${tn}.png`;
        try { await pg.locator('#m3d-panel').screenshot({ path: join(DEST, nom) }); g[nom] = 'ok' }
        catch (e) { g[nom] = String(e && e.message).slice(0, 80) }
        await pg.close();
      }
    }
    G.captura = g;
  }

  await b.close();
}

await new Promise(r => srv.close(r));
console.log(JSON.stringify(out, null, 1));
process.exit(0);
