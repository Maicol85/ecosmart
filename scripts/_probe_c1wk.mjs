/* Sonda de MAQUETA en DOS MOTORES para la tanda C1 (2026-10-28). Calcada de _probe_bwk.mjs.
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

/* ⚠️ LA RUTA DE `~/.pwtmp` VA PRIMERA, Y NO ESTABA EN LA LISTA HEREDADA. El reinicio que el
   D-11 documenta se llevo /tmp, y desde entonces Playwright vive ahi. Sin esta entrada la
   sonda salia con «SIN PLAYWRIGHT» teniendo el paquete instalado. */
const CANDIDATAS = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
                    '/tmp/pw/node_modules/playwright/index.js',
                    '/tmp/node_modules/playwright/index.js',
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

  /* ── ESCENAS DE LA TANDA C1 ────────────────────────────────────────────────────────────── */

  /* (1) VExUS: los cuatro rotulos y el globo nuevo de 44x44. */
  escVexus() {
    window.__M.limpiar();
    window.__M.abrir('vexus_sh');
    var r = {};
    [['g0', '15', '2', '2', '2'], ['g1', '24', '1', '1', '0'],
     ['g2', '24', '2', '1', '0'], ['g3', '24', '2', '2', '0']].forEach(function (e) {
      window.__M.set('vci_diam', e[1]); window.__M.set('vexus_sh', e[2]);
      window.__M.set('vexus_pv', e[3]); window.__M.set('vexus_ir', e[4]);
      r[e[0]] = window.__M.txt('vexus-interp');
    });
    var b = document.querySelector('[data-vinfo="vexus-lim"]');
    if (b) {
      /* ⚠️ scrollIntoView ANTES DE MEDIR, Y NO ES COSMETICO. elementFromPoint trabaja en
         coordenadas del VIEWPORT: con el boton por debajo del pliegue devuelve null o el nodo
         que este en esa posicion, y los cinco puntos dan 0 «propios» sobre un boton que no tapa
         nada. La primera version de esta sonda no lo hacia y daba 5 a 1440 px -donde entra en
         pantalla- y 0 a 390 -donde no-, que se lee como un defecto de celular y no lo es. El
         arnes de TC-535 ya lo hace por el mismo motivo. */
      try { b.scrollIntoView({ block: 'center' }) } catch (e) {}
      var bb = b.getBoundingClientRect();
      r.globo = { w: Math.round(bb.width), h: Math.round(bb.height),
                  enVista: bb.top >= 0 && bb.bottom <= window.innerHeight };
      var p = [[bb.left+1,bb.top+1],[bb.right-1,bb.top+1],[bb.left+1,bb.bottom-1],
               [bb.right-1,bb.bottom-1],[(bb.left+bb.right)/2,(bb.top+bb.bottom)/2]];
      var hs = p.map(function(q){ var e2 = document.elementFromPoint(q[0],q[1]);
        return e2 === b ? 'propio' : (e2 ? (e2.tagName + (e2.id ? '#' + e2.id : '')) : 'nada') });
      r.globo.propios = hs.filter(function(x){ return x === 'propio' }).length;
      r.globo.hits = hs;
    } else r.globo = 'NO EXISTE';
    return r },

  /* (2) HTP: las celdas de estado de la tabla de signos. */
  escHtp() {
    window.__M.limpiar();
    window.__M.abrir('htp2022_a3');
    window.__M.pon({ vmax_it:'3.2', tvia:'120', ip_ap_diam:'28', ao_sin:'30',
                     ad_area:'16', vci_diam:'24', vci_col:'>50', tapse:'18' });
    try { calcHTP2022() } catch (e) {}
    var r = {};
    ['a1','a2','a3','b1','b2','b3','b4','b5','c1','c2','c3'].forEach(function(k){
      r[k] = window.__M.txt('htp2022-est-' + k) });
    r.prob = window.__M.txt('htp2022-prob');
    return r },

  /* (3) El Forrester, la RVS y el GRAFICO, que es lo que esta tanda agrega a la pantalla. */
  escForr() {
    window.__M.limpiar();
    window.__M.abrir('hemo_fc');
    window.__M.pon({ peso:'80', talla:'180', hemo_fc:'80', diam_tsvi:'20', itv_tsvi:'20',
                     onda_e:'160', e_sep:'10', e_lat:'10', vci_diam:'18', vci_col:'>50',
                     hemo_pam:'90' });
    try { calcHemo() } catch (e) {}
    /* ⚠️ EL BARRIDO ES EL QUE PINTA EL DIAGRAMA. calcHemo solo registra los numeros; quien
       dibuja es hemoForrGrafSync, en el barrido de espejos. Sin esta linea el nodo sale vacio
       y el volcado diria «cero puntos» sobre un grafico que funciona. */
    try { _espejosBarrerTodos() } catch (e) {}
    var g = document.getElementById('hemo-forr-graf');
    var svg = g ? g.querySelector('svg') : null;
    var rr = svg ? svg.getBoundingClientRect() : { width:0, height:0 };
    var cua = svg ? Array.prototype.slice.call(svg.querySelectorAll('rect'))
                      .slice(1).map(function(x){ return { fill:x.getAttribute('fill'),
                        op:x.getAttribute('opacity') } }) : [];
    var rot = svg ? Array.prototype.map.call(svg.querySelectorAll('text'),
                      function(t){ return (t.textContent||'').trim() }).filter(Boolean) : [];
    return {
      capsula: window.__M.txt('hemo-forrester'),
      rvs:     window.__M.txt('hemo-rvs'),
      grafW:   Math.round(rr.width), grafH: Math.round(rr.height),
      puntos:  svg ? svg.querySelectorAll('circle').length : -1,
      /* ⚠️ LA BARRA VA DOBLE: esto vive dentro de un template de JavaScript, que consume una.
         Escrita simple llega al navegador como /s+/ —o sea borra todas las ESES del texto—,
         que es la trampa que _probe_bab.mjs ya documenta. */
      desc:    g ? (((g.querySelector('[data-forr-desc]')||{}).textContent)||'').replace(/\\s+/g,' ').trim() : 'NO EXISTE',
      /* Los cuatro cuadrantes con su rotulo de TEXTO: el estado no puede depender solo del color. */
      rotulos: rot.filter(function(t){ return /seco|húmedo|caliente|frío|^I{1,3}V?$|^IV$/.test(t) }),
      cuadrantes: cua,
      aria:    g ? (g.getAttribute('aria-label')||'').slice(0,120) : 'NO EXISTE'
    } },

  /* (4) El POCUS del posoperatorio con el VD/VI de la pestana VD/AD. */
  escPocus() {
    window.__M.limpiar();
    window.__M.abrir('pop_cx_tipo');
    window.__M.pon({ pop_cx_tipo:'cabg', pop_cx_horas:'12', tapse:'16', vd_vi:'1.30' });
    try { popPocusSync() } catch (e) {}
    return { vd: window.__M.txt('pop-pocus-vd').slice(0, 260) } }
/* ⚠️ ESTE CIERRE ES EL DE window.__M, Y EL EMPALME DE ESTA SONDA SE LO COMIO.
   Se copio el arnes de la tanda B cortando por lineas, y el corte dejo afuera justo esa
   linea: el template quedo con 61 llaves abiertas y 60 cerradas, y los DOS motores salieron
   con «SyntaxError: Unexpected end of input» en el primer page.evaluate. Como el arnes
   atrapa el fallo por motor y lo guarda en abortos, la corrida termino en 7 segundos con
   codigo 0: un volcado vacio que, sin mirar ese campo, se lee igual que «no hay nada que
   reportar». */
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
      c.vexus = await paso('vexus', () => window.__M.escVexus(), 90000);
      c.htp   = await paso('htp',   () => window.__M.escHtp(),   90000);
      c.forr  = await paso('forr',  () => window.__M.escForr(),  90000);
      c.pocus = await paso('pocus', () => window.__M.escPocus(), 90000);
      c.recortes = await pag.evaluate(() => window.__M.recortes('.calc-row, .calc-lbl, .ev-ref td, select'));
      c.scroll = await pag.evaluate(() => window.__M.scrollH());
      if (DEST) { try { await pag.screenshot({ path: join(DEST, `c1_${nombre}_${k}.png`) }) } catch (e) {} }
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
