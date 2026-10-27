/* Sonda de MAQUETA en DOS MOTORES para la tanda E (2026-10-27). Calcada de _probe_bwk.mjs.
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
  escCarp() {
    window.__M.limpiar();
    window.__M.abrir('vm_carp');
    window.__M.pon({ vm_morf: 'Prolapso / EVMS', ete_carpentier: 'IIIb',
                     vm_tipo_im: 'secundaria', im_vc: '7', im_grado: '2' });
    var b = document.getElementById('pill-insuf-mitral');
    if (b && !b.classList.contains('btn-primary')) b.click();
    return new Promise(function (res) { setTimeout(function () {
      window.__M.set('im_grado', '2');
      try { if (typeof vmCarpOrigenSync === 'function') vmCarpOrigenSync() } catch (e) {}
      try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
      var vm = document.getElementById('vm_carp');
      var en = document.getElementById('vm-carp-origen');
      var inf = String((document.getElementById('informe_texto') || {}).value || '');
      var r = en ? en.getBoundingClientRect() : null;
      res({ efectivo: (typeof vmCarpEfectivo === 'function') ? vmCarpEfectivo() : 'SIN FN',
            dis: vm ? !!vm.disabled : 'NO EXISTE',
            op: vm ? getComputedStyle(vm).opacity : null,
            enlace: en ? (en.textContent || '').trim() : 'NO EXISTE',
            enlaceGeo: r ? { w: Math.round(r.width), h: Math.round(r.height) } : null,
            avisoViejo: !!document.getElementById('vm-carp-aviso'),
            nCarp: (inf.match(/Carpentier/g) || []).length,
            lineaVM: (inf.split('\\n').filter(function (l) { return /mitral/i.test(l) })[0] || '') });
    }, 600) }) },

  escTric() {
    window.__M.limpiar();
    window.__M.abrir('et_gmedio');
    var b = document.getElementById('pill-esten-tricuspide');
    if (b && !b.classList.contains('btn-primary')) b.click();
    /* EL GESTO REAL: un change sobre el select, sin llamar al pintor. */
    var g = document.getElementById('et_grado');
    if (g) { g.value = 'Significativa'; g.dispatchEvent(new Event('change', { bubbles: true })); }
    return new Promise(function (res) { setTimeout(function () {
      var e = document.getElementById('et-evid-aviso');
      e && e.getBoundingClientRect();
      var r = e ? e.getBoundingClientRect() : null;
      var abre;
      try { abre = (typeof _indVT === 'function') ? (_indVT() !== null) : 'SIN FN' } catch (x) { abre = 'EXC' }
      res({ txt: e ? (e.textContent || '').replace(/\\s+/g, ' ').trim() : 'NO EXISTE',
            geo: r ? { w: Math.round(r.width), h: Math.round(r.height) } : null,
            abre: abre, grado: g ? g.value : null,
            pastilla: b ? b.classList.contains('btn-primary') : 'NO EXISTE' });
    }, 500) }) },

  escStrain() {
    window.__M.limpiar();
    window.__M.abrir('vd_strain_pl');
    window.__M.pon({ tapse: '22', s_prime: '13', vd_strain_pl: '-12' });
    return new Promise(function (res) { setTimeout(function () {
      try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
      var inf = String((document.getElementById('informe_texto') || {}).value || '');
      var sum = String((document.getElementById('en_suma') || {}).value || '');
      res({ linea: inf.split('\\n').filter(function (l) { return /entr.culo derecho|VD /i.test(l) })[0] || '',
            suma: sum.split('\\n').filter(function (l) { return /VD/.test(l) })[0] || '',
            grado: window.__M.txt('vd_strain_pl-grado') });
    }, 500) }) },

  escOrej() {
    window.__M.limpiar();
    window.__M.abrir('oai_ostium_diam');
    window.__M.pon({ oai_ostium_diam: '24', oai_profundidad: '28' });
    return new Promise(function (res) { setTimeout(function () {
      try { if (typeof calcOAI === 'function') calcOAI() } catch (e) {}
      try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
      var inf = String((document.getElementById('informe_texto') || {}).value || '');
      var sec = document.getElementById('ete-seccion-oai');
      var st = sec ? (sec.textContent || '').replace(/\\s+/g, ' ').trim() : 'NO EXISTE';
      var t = document.body.innerText || '';
      res({ notas: window.__M.txt('oai-notas').slice(0, 220),
            badge: window.__M.txt('oai-elegibilidad'),
            tablaAmulet: st.indexOf('Distancia desde el orificio') > -1,
            tablaWatch: st.indexOf('Ancho máximo del ostium') > -1,
            profEnPalabras: st.indexOf('mitad del diámetro del dispositivo') > -1,
            sinFecha: !/consultad[oa] el/i.test(st),
            viejos: [/ostium\s*17/i, /17\s*a\s*31/, /17-31/, /(≤|<=)\s*32\s*mm/, /11-32/]
                      .filter(function (re) { return re.test(t) }).length,
            linea: inf.split('\\n').filter(function (l) { return /ostium/i.test(l) })[0] || '' });
    }, 600) }) },

  /* Tiempos de ESCRITURA: doce teclas reales sobre un campo del VD. Solo en Chrome. */
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
      c.carp = await paso('carp', () => window.__M.escCarp(), 90000);
      c.tric = await paso('tric', () => window.__M.escTric(), 90000);
      c.strain = await paso('strain', () => window.__M.escStrain(), 90000);
      c.orej = await paso('orej', () => window.__M.escOrej(), 90000);
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
