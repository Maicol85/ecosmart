/* Sonda de MAQUETA en DOS MOTORES para la tanda D (2026-10-27). Calcada de _probe_ewk.mjs.
 *
 *   node scripts/_probe_ewk.mjs [--file /ruta/index.html] [--dest /dir/capturas]
 *
 * Mide, a 1440 px y 390 px y en los DOS temas, lo que esta tanda movio:
 *   - CERO barra horizontal de la PAGINA.
 *   - La linea de Fallot del EN SUMA y el resumen descriptivo.
 *   - La caja del ateroma: que filas se ven.
 *   - La oracion del VD con el strain votando, y el cuadro de Referencias con su banda.
 *   - El tipo de IM y el Carpentier con protesis, y el rotulo de la morfologia sin recortarse.
 *   - El aviso de la VCI de VExUS en sus tres bordes.
 *   - Los dos globos de 44x44.
 *   - El corte de HTP en sus dos superficies.
 *   - La geometria de TODA la app: cuantas pestanas tienen caja. Un <div> sin cerrar no lanza
 *     -el parser re-anida lo que viene despues- y ningun A/B de texto lo ve; lo unico que lo
 *     delata es que pestanas AJENAS informen 0x0, que es lo que la tanda I pago.
 *
 * ⚠️ Playwright se resuelve POR RUTA. Si no esta, la sonda lo DICE y sale con codigo 2.
 * ⚠️ WebKit de Playwright NO es Safari, y se declara.
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
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CANDIDATAS }, null, 1)); process.exit(2); }
const { chromium, webkit } = _pw;

const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const ARCH = arg('--file'), DEST = arg('--dest');

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
if (DEST) { try { await mkdir(DEST, { recursive: true }) } catch (e) {} }

const out = { arbol: ARCH || 'VIVO', md5: null, grupos: {}, abortos: [] };
out.md5 = createHash('md5').update(await readFile(ARCH || join(RAIZ, 'index.html'))).digest('hex');

const SONDA = `window.__M = {
  /* ══ ESCENA DEL D-10 · el dueno del dato en los DOS sentidos, en los dos motores ══════════
     1. estudio nuevo y 14/12/45 en el VI, ESPERANDO el debounce real;
     2. el septo a 18 y a 20, que es lo que antes quedaba congelado;
     3. el DDVI borrado, que antes no se iba del calculador;
     4. el tecleo digito por digito, que antes dejaba el estudio en el primer digito;
     5. el cartel de HVI cayendo a la pared posterior. */
  escD10() {
    var esperar = function(ms){ return new Promise(function(r){ setTimeout(r, ms) }) };
    var V = function(id){ var e = document.getElementById(id); return e ? String(e.value) : 'NO EXISTE' };
    var teclear = function(id, dig){ var e = document.getElementById(id); if (!e) return 'NO EXISTE';
      e.value = ''; var acc = '';
      dig.split('').forEach(function(d){ acc += d; e.value = acc;
        e.dispatchEvent(new Event('input', { bubbles: true })) });
      return e.value };
    return (async function(){
      var r = {};
      window.__M.limpiar();
      window.__M.pon({ peso:'70', talla:'170', siv:'14', ppvi:'12', ddfvi:'45' });
      await esperar(900);
      r.lleno = V('rwt-septo') + '/' + V('rwt-pp') + '/' + V('rwt-ddvi') + '/' + V('rwt-result');
      window.__M.set('siv', '18'); await esperar(700);
      r.sigue18 = V('rwt-septo') + '/' + V('rwt-result');
      window.__M.set('siv', '20'); await esperar(700);
      r.sigue20 = V('rwt-septo') + '/' + V('rwt-result');
      window.__M.set('ddfvi', ''); await esperar(700);
      r.ddviBorrado = JSON.stringify(V('rwt-ddvi')) + ' result=' + JSON.stringify(V('rwt-result'));
      r.hviDos = window.__M.txt('ett-hvi-badge');
      window.__M.limpiar(); window.__M.pon({ siv:'14', ppvi:'12' }); await esperar(700);
      window.__M.set('siv', ''); await esperar(700);
      r.hviSinSepto = window.__M.txt('ett-hvi-badge');
      window.__M.set('ppvi', ''); await esperar(700);
      r.hviSinNada = window.__M.txt('ett-hvi-badge');
      window.__M.limpiar(); await esperar(400);
      teclear('ett-septo', '1'); r.trasEl1 = V('siv');
      teclear('ett-septo', '15'); await esperar(700);
      r.trasEl5 = V('siv');
      window.__M.limpiar(); window.__M.set('tapse', '16'); await esperar(700);
      teclear('tapse-val', '21'); await esperar(700);
      /* ⚠️ ESTA ESCENA CAMBIO DE SIGNIFICADO EN EL D-11, y el nombre se corrige con ella: antes
         medi­a que el modulo NO pisaba un valor cargado a mano en el estudio, y desde que gana la
         ultima edicion lo que mide es que SI lo pisa. Dejarle el nombre viejo seria publicar una
         medicion que afirma lo contrario de lo que comprueba. */
      r.ultimaEdicionGana = 'estudio=' + V('tapse') + ' modulo=' + V('tapse-val');
      return r;
    })() },

  despejar() { var n = 0;
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (m && getComputedStyle(m).display !== 'none') { m.style.display = 'none'; n++ } });
    return n },
  tema(claro) { document.documentElement.classList.toggle('light-mode', !!claro);
    return document.documentElement.classList.contains('light-mode') === !!claro },
  set(id, v) { var e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    if (e.tagName === 'SELECT') {
      var hay = Array.prototype.some.call(e.options, function(o){ return o.value === v });
      if (!hay) return 'NO HAY OPCION ' + v;
    }
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true})); return e.value },
  pon(o) { var r = {}; Object.keys(o).forEach(function(k){ r[k] = window.__M.set(k, o[k]) }); return r },
  limpiar() { try { limpiarCampos(true) } catch (e) {} return 1 },
  txt(id) { var e = document.getElementById(id);
    return e ? (e.textContent || '').replace(/\\s+/g, ' ').trim() : 'NO EXISTE ' + id },
  abrir(id) { var e = document.getElementById(id); if (!e) return false;
    var sec = e.closest ? e.closest('.tab-section') : null;
    if (sec) { try { showTab(String(sec.id || '').replace(/^tab-/, '')) } catch (x) {} }
    var n = e.parentNode;
    while (n && n.nodeType === 1 && n !== document.body) {
      if (getComputedStyle(n).display === 'none') n.style.display = 'block';
      n = n.parentNode; }
    return e.getBoundingClientRect().width > 0 },

  scrollH() { var d = document.documentElement;
    return { hay: d.scrollWidth > d.clientWidth, sw: d.scrollWidth, cw: d.clientWidth } },

  /* El centinela del div sin cerrar: pestanas AJENAS en 0x0. */
  pestanas() {
    var bs = Array.prototype.slice.call(document.querySelectorAll('.tab-btn[onclick]'));
    var o = { n: 0, conCaja: 0, cero: [] };
    bs.forEach(function(b){
      var m = /showTab\\('([^']+)'/.exec(b.getAttribute('onclick') || ''); if (!m) return;
      o.n++;
      try { showTab(m[1]) } catch (e) {}
      var p = document.getElementById('tab-' + m[1]);
      var r = p ? p.getBoundingClientRect() : { width:0, height:0 };
      if (r.width > 0 && r.height > 0) o.conCaja++; else o.cero.push(m[1]);
    });
    return o },

  /* TEXTO RECORTADO: cualquier nodo cuyo contenido no entra en su caja. */
  recortes(sel) {
    var out = [];
    Array.prototype.forEach.call(document.querySelectorAll(sel), function(e){
      var r = e.getBoundingClientRect();
      if (!r.width) return;
      if (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1)
        out.push((e.id || e.className || e.tagName) + ' ' + e.scrollWidth + '/' + e.clientWidth);
    });
    return out },

  /* ── ESCENAS DE LA TANDA E ──────────────────────────────────────────────────────────────
     Las cuatro zonas que la tanda toca, en los DOS motores: el Carpentier con el ETE como dueno,
     el aviso de la tricuspide con el GESTO REAL, el strain por debajo de 15 y las dos tablas de
     la orejuela. ADVERTENCIA: sin acentos graves adentro. */
  /* ── La clasificacion de riesgo CV con la Tabla 4, en sus tres bandas ─────────────────── */
  escRiesgo() {
    window.__M.limpiar();
    var m = document.getElementById('hfaicos_manual'); if (m) m.value = '';
    var o = {};
    var fija = function (farm, ids) {
      ['hfaicos_cv_ic','hfaicos_cv_coron','hfaicos_cv_arrit','hfaicos_hta','hfaicos_troponina']
        .forEach(function (id) { var e = document.getElementById(id); if (e) e.checked = false; });
      var sel = document.getElementById('co_farmaco');
      if (sel) { sel.value = farm; sel.dispatchEvent(new Event('change', { bubbles: true })); }
      (ids || []).forEach(function (id) { var e = document.getElementById(id);
        if (e) { e.checked = true; try { hfaicosToggle(id) } catch (x) {} } });
      try { calcHFAICOS() } catch (x) {}
      var r = {};
      try { var st = hfaicosEstado();
        r.clave = st.clave; r.col = st.col; r.pts = st.pts; r.seg = st.seguimiento;
      } catch (e) { r.err = 'EXC ' + e.message }
      r.cap = window.__M.txt('hfaicos-resultado');
      r.bas = window.__M.txt('co-riesgo-resultado');
      r.eco = window.__M.txt('co_farmaco_eco');
      return r };
    o.her2Limpio = fija('trastuzumab', []);
    o.her2FA     = fija('trastuzumab', ['hfaicos_cv_arrit']);
    o.antracFA   = fija('antracicline', ['hfaicos_cv_arrit']);
    o.antracIC   = fija('antracicline', ['hfaicos_cv_ic']);
    o.ici        = fija('inmunoterapia', ['hfaicos_hta']);
    o.selectores = document.querySelectorAll('select#co_farmaco, select#hfaicos_farmaco').length;
    return o },

  /* ── El score de amiloidosis marcandose solo desde otras pestanias ────────────────────── */
  escAmilo() {
    window.__M.limpiar();
    window.__M.pon({ siv:'16', ppvi:'14', ddfvi:'42', tapse:'16', onda_e:'90',
                     e_sep:'4', e_lat:'6', sgl:'-12' });
    try { if (typeof _espejosBarrerTodos === 'function') _espejosBarrerTodos() } catch (x) {}
    return new Promise(function (res) { setTimeout(function () {
      try { if (typeof _espejosBarrerTodos === 'function') _espejosBarrerTodos() } catch (x) {}
      var o = {};
      o.num  = window.__M.txt('ett-score-num');
      o.cat  = window.__M.txt('ett-score-cat');
      o.hvi  = window.__M.txt('ett-hvi-badge');
      o.nota = window.__M.txt('ett-auto-nota');
      o.alg  = (document.getElementById('alg-ett-score') || {}).value || '';
      o.botonPasar = Array.prototype.filter.call(
        document.querySelectorAll('#tab-amiloidosis button'),
        function (b) { return /Pasar score al Algoritmo/i.test(b.textContent || '') }).length;
      res(o);
    }, 400) }) },

  /* ── Los DOS globos nuevos: que abran y que su contenido ENTRE ────────────────────────── */
  escGlobos() {
    var o = {};
    ['co-riesgo-basal', 'amilo-score'].forEach(function (clave) {
      var b = document.querySelector('[data-vinfo="' + clave + '"]');
      if (!b) { o[clave] = 'NO HAY BOTON'; return }
      var r = b.getBoundingClientRect();
      if (!r.width || !r.height) {
        var sec = b.closest ? b.closest('.tab-section') : null;
        if (sec) { try { showTab(String(sec.id || '').replace(/^tab-/, '')) } catch (x) {} }
        document.querySelectorAll('.card-head').forEach(function (h) {
          if (sec && sec.contains(h)) { try { h.click() } catch (x) {} } });
        b = document.querySelector('[data-vinfo="' + clave + '"]');
        r = b.getBoundingClientRect();
      }
      if (!r.width || !r.height) { o[clave] = { err: 'BOTON 0x0' }; return }
      try { if (typeof vInfoCerrar === 'function') vInfoCerrar(true) } catch (x) {}
      b.click();
      var c = document.getElementById('vinfo-card');
      if (!c || c.style.display === 'none') { o[clave] = { err: 'NO ABRIO' }; return }
      o[clave] = { w: Math.round(c.getBoundingClientRect().width),
                   vis: Math.round(c.clientHeight), cont: Math.round(c.scrollHeight),
                   corta: c.scrollHeight > c.clientHeight + 2,
                   btn: Math.round(r.width) + 'x' + Math.round(r.height),
                   chars: (c.textContent || '').replace(/\s+/g, ' ').length };
      try { if (typeof vInfoCerrar === 'function') vInfoCerrar(true) } catch (x) {}
    });
    return o },

  /* ── Los cuatro botones del centellograma: cuantos RENGLONES ocupan ───────────────────── */
  escGrilla() {
    var g = document.getElementById('gamma-grado-grid');
    if (!g) return { err: 'NO EXISTE gamma-grado-grid' };
    if (!g.getBoundingClientRect().width) window.__M.abrir('gamma-grado-grid');
    var filas = {};
    g.querySelectorAll('.grado-item').forEach(function (it) {
      filas[Math.round(it.getBoundingClientRect().y)] = 1 });
    return { renglones: Object.keys(filas).length,
             cols: getComputedStyle(g).gridTemplateColumns,
             ancho: Math.round(g.getBoundingClientRect().width) } },

  escTeclas() {
    window.__M.limpiar();
    window.__M.abrir('vd_strain_pl');
    var e = document.getElementById('vd_strain_pl');
    if (!e) return Promise.resolve({ err: 'NO EXISTE vd_strain_pl' });
    var ms = [];
    for (var i = 0; i < 12; i++) {
      var t0 = performance.now();
      e.value = String(-(10 + i));
      e.dispatchEvent(new Event('input', { bubbles: true }));
      ms.push(Math.round((performance.now() - t0) * 100) / 100);
    }
    return new Promise(function (res) { setTimeout(function () {
      ms.sort(function (a, b) { return a - b });
      res({ min: ms[0], max: ms[ms.length - 1],
            media: Math.round(ms.reduce(function (a, b) { return a + b }, 0) / ms.length * 100) / 100 });
    }, 500) }) },
};
1`;
/* ⚠️ ESTE ARNES SE COLGO UNA HORA Y CUARTO SIN ESCRIBIR UN BYTE, Y LAS DOS COSAS VAN JUNTAS.
   `page.evaluate` de Playwright NO tiene timeout: una escena que devuelve una Promise que nunca
   se resuelve —porque algo tiro adentro de su `setTimeout` antes del `res(...)`— deja al proceso
   dormido para siempre, a 0 % de CPU. Y como el arnes heredado imprime UNA sola vez al final, no
   habia forma de saber en que paso estaba: stdout y stderr en cero bytes.
   Dos piezas, ninguna decorativa:
     · `paso()` envuelve cada `evaluate` con un reloj que RECHAZA nombrando la escena, el motor y
       el ancho, asi que el cuelgue se vuelve un error con direccion;
     · cada escena escribe en stderr antes y despues, asi que la corrida se puede seguir en vivo. */
function conReloj(p, ms, etiqueta) {
  return Promise.race([p, new Promise((_, no) =>
    setTimeout(() => no(new Error('TIMEOUT ' + ms + ' ms en ' + etiqueta)), ms))]);
}

async function correrMotor(nombre, lanzar) {
  const nav = await lanzar();
  const g = { celdas: {}, errs: [] };
  for (const W of [1440, 390]) {
    const ctx = await nav.newContext({ viewport: { width: W, height: 900 } });
    const pag = await ctx.newPage();
    pag.on('pageerror', (e) => g.errs.push(nombre + '@' + W + ': ' + String(e.message).slice(0, 160)));
    pag.on('console', (m) => { if (m.type() === 'error') g.errs.push(nombre + '@' + W + ' console: ' + m.text().slice(0, 160)) });
    await pag.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'load' });
    await pag.evaluate(() => { try { sessionStorage.setItem('ett_auth', '1') } catch (e) {} });
    await pag.reload({ waitUntil: 'load' });
    await pag.waitForTimeout(2500);
    await pag.evaluate(SONDA);
    for (const claro of [false, true]) {
      const k = W + (claro ? '_claro' : '_oscuro');
      const c = {};
      c.despejo = await pag.evaluate(() => window.__M.despejar());
      c.tema = await pag.evaluate(cl => window.__M.tema(cl), claro);
      c.pestanas = await pag.evaluate(() => window.__M.pestanas());
      const paso = async (et, fn, ms) => {
        process.stderr.write('[' + nombre + '@' + k + '] ' + et + ' …');
        const t0 = Date.now();
        try { const r = await conReloj(pag.evaluate(fn), ms || 90000, nombre + '@' + k + '/' + et);
              process.stderr.write(' ok ' + (Date.now() - t0) + ' ms\n'); return r; }
        catch (e) { process.stderr.write(' FALLO: ' + e.message + '\n');
                    g.errs.push(nombre + '@' + k + ' ' + et + ': ' + e.message.slice(0, 120));
                    return { err: e.message.slice(0, 160) }; }
      };
      c.riesgo = await paso('riesgo', () => window.__M.escRiesgo(), 90000);
      c.amilo  = await paso('amilo',  () => window.__M.escAmilo(), 90000);
      c.globos = await paso('globos', () => window.__M.escGlobos(), 90000);
      c.grilla = await paso('grilla', () => window.__M.escGrilla(), 60000);
      c.d10    = await paso('d10',    () => window.__M.escD10(), 120000);
      if (nombre === 'chrome') c.teclas = await paso('teclas', () => window.__M.escTeclas(), 120000);
      c.recortes = await pag.evaluate(() => window.__M.recortes('.calc-row, .calc-lbl, .ev-ref td, select'));
      c.scroll = await pag.evaluate(() => window.__M.scrollH());
      if (DEST) { try { await pag.screenshot({ path: join(DEST, `e_${nombre}_${k}.png`) }) } catch (e) {} }
      g.celdas[k] = c;
    }
    await ctx.close();
  }
  await nav.close();
  return g;
}

try { out.grupos.chrome = await correrMotor('chrome', () => chromium.launch({ channel: 'chrome' })); }
catch (e) { out.abortos.push('chrome: ' + e.message); }
try { out.grupos.webkit = await correrMotor('webkit', () => webkit.launch()); }
catch (e) { out.abortos.push('webkit: ' + e.message); }

console.log(JSON.stringify(out, null, 1));
try { srv.close() } catch (e) {}
process.exit(0);
