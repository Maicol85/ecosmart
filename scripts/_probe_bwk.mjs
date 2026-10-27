/* Sonda de MAQUETA en DOS MOTORES para la tanda AJ7 (2026-10-24).
 *
 *   node scripts/_probe_aj7wk.mjs [--file /ruta/index.html] [--dest /dir/capturas]
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

  /* ── ESCENAS DE LA TANDA B ─────────────────────────────────────────────────────────────
     Las mismas tres preguntas que la sonda de Chrome, en los dos motores: que el barrido de
     espejos exista y mueva lo que tiene que mover, que la PAM tenga un solo dueno, y cuanto
     cuesta escribir. */
  escEspejos() {
    window.__M.limpiar();
    window.__M.abrir('peso');
    window.__M.pon({ nombre:'B', ci:'1', peso:'80', talla:'175', ddfvi:'54', fevi:'52',
                     siv:'11', ppvi:'10', ai_diam:'40', vd_bas:'42', tsvd_diametro:'26',
                     diam_tsvi:'21', itv_tsvi:'18', hemo_fc:'75' });
    return new Promise(function(res){ setTimeout(function(){
     try {
      var E = function(id){ var e = document.getElementById(id); if (!e) return null;
        return String((('value' in e && e.tagName !== 'DIV') ? e.value : e.textContent) || '').replace(/\s+/g,' ').trim() };
      var antes = { asc: E('ete_shunt_asc_ro'), mch: E('mch_siv_ro'), eco: E('pop-eco-src') };
      window.__M.pon({ peso:'95', siv:'17', hemo_fc:'112' });
      setTimeout(function(){
        res({ registro: (typeof ESPEJOS_VIVOS === 'function') ? ESPEJOS_VIVOS().length : 'NO EXISTE',
              antes: antes,
              despues: { asc: E('ete_shunt_asc_ro'), mch: E('mch_siv_ro'), eco: E('pop-eco-src') } });
      }, 500);
     } catch (e) { res({ exc: String(e && e.message || e) }) }
    }, 500) }) },

  escPam() {
    var o = {};
    var combos = [['I','58',null,null], ['T',null,'95',null], ['C',null,null,'120/70'],
                  ['IT','58','95',null], ['TC',null,'95','120/70']];
    var paso = function(i){
      if (i >= combos.length) return Promise.resolve(o);
      var c = combos[i];
      window.__M.limpiar();
      window.__M.pon({ nombre:'B', peso:'80', talla:'175' });
      if (c[1]) { window.__M.pon({ pop_monitor:'swan' }); window.__M.pon({ pop_sw_pam:c[1] }); }
      if (c[3]) { var p = c[3].split('/'); window.__M.pon({ ao_pas:p[0], ao_pad:p[1] }); }
      if (c[2]) window.__M.pon({ hemo_pam:c[2] });
      return new Promise(function(res){ setTimeout(function(){
       try {
        var r = null; try { r = pamEfectiva() } catch (e) { r = 'EXC' }
        o[c[0]] = { clave: r && r.clave, val: r && r.val, dif: r ? r.difieren.length : -1,
                    fila: window.__M.txt('ao-ref-pam'), aviso: window.__M.txt('hemo-pam-auto') };
        res(paso(i + 1));
       } catch (e) { o[c[0]] = { exc: String(e && e.message || e) }; res(o) }
      }, 500) }) };
    return paso(0) },

  /* Doce teclas de verdad, con el reloj del lado de la pagina. Se mide con los DIECISIETE
     bloques integrados, que es el escenario caro. */
  escTeclas() {
    window.__M.limpiar();
    window.__M.abrir('ddfvi');
    window.__M.pon({ nombre:'B', ci:'9', peso:'80', talla:'175', ddfvi:'543210', fevi:'52',
                     tapse:'16', onda_e:'80', e_sep:'6', e_lat:'8' });
    var n = 0; try { amiloSecs().forEach(function(s){ try { amiloIntegrar(s.k); n++ } catch(e){} }) } catch(e){}
    return new Promise(function(res){ setTimeout(function(){
     try {
      var e = document.getElementById('ddfvi');
      var t = [], prev = performance.now();
      for (var i = 0; i < 12; i++) {
        e.value = String(e.value).slice(0, -1);
        e.dispatchEvent(new Event('input', { bubbles: true }));
        var now = performance.now(); t.push(Math.round((now - prev) * 100) / 100); prev = now;
      }
      setTimeout(function(){
        var t0 = performance.now();
        try { _espejosBarrerTodos() } catch (x) {}
        var msEsp = Math.round((performance.now() - t0) * 1000) / 1000;
        res({ integrados: n, teclas: t,
              med: Math.round(t.reduce(function(a,b){return a+b},0) / t.length * 100) / 100,
              max: Math.max.apply(null, t), min: Math.min.apply(null, t), msEspejos: msEsp });
      }, 600);
     } catch (e) { res({ exc: String(e && e.message || e) }) }
    }, 1200) }) }
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
      c.espejos = await paso('espejos', () => window.__M.escEspejos(), 90000);
      c.pam = await paso('pam', () => window.__M.escPam(), 180000);
      c.teclas = await paso('teclas', () => window.__M.escTeclas(), 240000);
      c.recortes = await pag.evaluate(() => window.__M.recortes('.calc-row, .calc-lbl, .ev-ref td, select'));
      c.scroll = await pag.evaluate(() => window.__M.scrollH());
      if (DEST) { try { await pag.screenshot({ path: join(DEST, `b_${nombre}_${k}.png`) }) } catch (e) {} }
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
