#!/usr/bin/env node
/**
 * _probe_valwk.mjs - sonda A/B de SOLO LECTURA de la tanda «VAL» (2026-10-17) en los DOS MOTORES.
 *
 * Mide lo que esta tanda AGREGA A LA PANTALLA —el badge de la estenosis tricuspidea con el
 * criterio que decide, su aviso de insuficiencia tricuspidea, el texto de integracion de la
 * pestania Referencias y la tarjeta de la vista 2D— en Chrome y en WebKit (el motor de Safari),
 * en SEIS viewports por DOS temas, y saca las capturas.
 *
 * ⚠️ USA PLAYWRIGHT Y NO LA INFRA DE CDP DEL REPO, por la misma razon que _probe_y1c.mjs: hay que
 * medir en dos motores y cdp.mjs solo habla con Chrome. Se resuelve POR RUTA; si no esta, la
 * sonda lo DICE y sale con codigo 2 en vez de reventar.
 * ⚠️ WebKit de Playwright NO es Safari, y se declara.
 * ⚠️ UNA SOLA INSTANCIA DE CADA MOTOR A LA VEZ, cerrada con browser.close(). Nada por nombre.
 *
 *   node scripts/_probe_valwk.mjs --dest /tmp/capval > /tmp/valwk.NEW.json
 *   node scripts/_probe_valwk.mjs --file /tmp/index.VALHEAD.html > /tmp/valwk.HEAD.json
 *
 * ⚠️ Sin acentos graves dentro del template de la sonda, tampoco en los comentarios de adentro.
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

const out = { arbol: ARCH || 'VIVO', md5: null, motores: {}, abortos: [] };
out.md5 = createHash('md5').update(await readFile(ARCH || join(RAIZ, 'index.html'))).digest('hex');

/* ══ LA SONDA QUE VIVE EN LA PAGINA ══════════════════════════════════════════════════════════
   Cada lectura con CENTINELA: contra el arbol de HEAD varias piezas NO existen, y un .length
   sobre undefined mata la corrida entera —eso prueba que el arbol es distinto, no que la sonda
   sabe medir—. */
const SONDA = `window.__P = {
  despejar() { var n = 0;
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (m && getComputedStyle(m).display !== 'none') { m.style.display = 'none'; n++; } });
    return n },
  tema(claro) { document.documentElement.classList.toggle('light-mode', !!claro);
    return document.documentElement.classList.contains('light-mode') === !!claro },
  txt(sel) { var e = document.querySelector(sel); return e ? String(e.textContent||'').replace(/[ ]+/g,' ').trim() : 'NO EXISTE' },
  col(sel) { var e = document.querySelector(sel); if (!e) return 'NO EXISTE';
    try { return getComputedStyle(e).color } catch (x) { return 'EXC' } },
  rect(sel) { var e = document.querySelector(sel); if (!e) return null;
    var r = e.getBoundingClientRect();
    return { w:+r.width.toFixed(1), h:+r.height.toFixed(1), x:+r.left.toFixed(1), y:+r.top.toFixed(1) } },
  /* Visible = tiene caja Y entra entero en el viewport por el eje horizontal. */
  dentro(sel) { var r = window.__P.rect(sel); if (!r) return null;
    return r.w > 0 && r.h > 0 && r.x >= -1 && (r.x + r.w) <= document.documentElement.clientWidth + 1 },
  barra() { return document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 },

  set(id, v) { var e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = String(v);
    e.dispatchEvent(new Event('input', { bubbles:true }));
    e.dispatchEvent(new Event('change', { bubbles:true })); return 1 },

  abrirValvulas() {
    try { showTab('valvulas'); } catch (e) {}
    ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'].forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && getComputedStyle(s).display === 'none') { try { toggleEteSeccion(tok); } catch (e) {} } });
    ['caja-esten-tricuspide','caja-insuf-tricuspide'].forEach(function(cid){
      var c = document.getElementById(cid);
      if (c && c.className.indexOf('valv-datos-abierto') < 0) { try { valvDatosTog(cid); } catch (e) {} } });
    return !!document.getElementById('et-sev') },

  /* ESCENA: estenosis tricuspidea significativa por area, con el gradiente tambien cumplido y
     el THP como signo de apoyo; la IT se fija por su gesto real para que salga el aviso. */
  escenaET(conIT) {
    try { limpiarCampos(true); } catch (e) {}
    window.__P.abrirValvulas();
    ['tsvd_diametro','25','vti_tsvd','8.1','et_vti_diast','50','et_gmedio','8','et_thp','200']
      .reduce(function(a, v, i, arr){ if (i % 2 === 0) window.__P.set(v, arr[i+1]); return a }, 0);
    try { calcET(); } catch (e) {}
    if (conIT) { try { valvSev.aplicar('insuf','tricuspide','4'); } catch (e) {} }
    try { calcET(); } catch (e) {}
    return { sev: window.__P.txt('#et-sev'), aviso: window.__P.txt('#et-it-aviso') } },

  refs() {
    try { showTab('refs'); } catch (e) {}
    var n = document.getElementById('ref-nativas');
    if (n && n.style.display === 'none') { try { toggleRef('nativas'); } catch (e) {} }
    return { vis: window.__P.dentro('#ref-integracion'),
             txt: window.__P.txt('#ref-integracion'),
             col: window.__P.col('#ref-integracion') } },

  v2d() {
    try { showTab('valvulas'); } catch (e) {}
    var b = document.getElementById('v2d-abrir');
    if (b) { try { b.click(); } catch (e) {} }
    var pq = null;
    try { pq = (typeof _v2dPorQue === 'function') ? _v2dPorQue('esten:tricuspide') : 'SIN FN'; }
    catch (e) { pq = 'EXC'; }
    return { abierto: !!document.getElementById('v2d-ov') &&
               getComputedStyle(document.getElementById('v2d-ov')).display !== 'none',
             decide: (pq && typeof pq === 'object') ? (pq.decide || '') : String(pq),
             aviso: (pq && typeof pq === 'object') ? (pq.aviso || '') : '',
             filas: (pq && typeof pq === 'object' && pq.filas) ? pq.filas.length : null } },

  listo() { return typeof showTab === 'function' && typeof calcET === 'function'
    && !!document.getElementById('et_gmedio') }
};
'OK';`;

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

const VIEWPORTS = [[1200,700],[1440,800],[1920,1080],[768,1024],[390,844],[360,740]];
const MOTORES = [['chrome', chromium, { channel: 'chrome' }], ['webkit', webkit, {}]];
if (DEST) await mkdir(DEST, { recursive: true });

for (const [motor, tipo, op] of MOTORES) {
  let b = null;
  try { b = await tipo.launch(op); }
  catch (e) { out.abortos.push('no arranco ' + motor + ': ' + String(e && e.message).slice(0, 90)); continue; }
  const M = out.motores[motor] = { version: b.version(), celdas: {} };
  for (const [W, H] of VIEWPORTS) {
    const pg = await nuevaPagina(b, W, H);
    if (!(await pg.evaluate(() => window.__P.listo()))) {
      out.abortos.push(motor + ' ' + W + 'x' + H + ': la app no termino de cargar');
      await pg.close(); continue;
    }
    for (const [nom, claro] of [['oscuro', false], ['claro', true]]) {
      const okTema = await pg.evaluate((c) => window.__P.tema(c), claro);
      if (!okTema) { out.abortos.push(motor + ' ' + W + 'x' + H + ' ' + nom + ': la clase light-mode no quedo'); continue; }
      const c = {};
      await pg.evaluate(() => window.__P.despejar());
      /* ET sin IT: el badge nombra el criterio y el aviso NO sale (control negativo). */
      c.etSinIT = await pg.evaluate(() => window.__P.escenaET(false));
      c.etSinIT.dentro = await pg.evaluate(() => window.__P.dentro('#et-sev'));
      /* ET con IT severa: el aviso sale, con su color REAL. */
      c.etConIT = await pg.evaluate(() => window.__P.escenaET(true));
      c.etConIT.col = await pg.evaluate(() => window.__P.col('#et-it-aviso'));
      c.etConIT.dentro = await pg.evaluate(() => window.__P.dentro('#et-it-aviso'));
      c.v2d = await pg.evaluate(() => window.__P.v2d());
      c.barraValv = await pg.evaluate(() => window.__P.barra());
      c.refs = await pg.evaluate(() => window.__P.refs());
      c.barraRefs = await pg.evaluate(() => window.__P.barra());
      M.celdas[W + 'x' + H + '_' + nom] = c;

      if (DEST && W === 1200) {
        const pre = (ARCH ? 'HEAD' : 'NEW') + '_' + motor + '_' + nom + '_';
        /* ⚠️ EL RECORTE SE CALCULA DESPUES DE DESPLAZAR, Y SOBRE EL `.calc-box` QUE CONTIENE AL
           BADGE. La primera version apuntaba a #bloque-esten-tricuspide y el PNG salio con la
           botonera de la app: un recorte plausible sobre el nodo equivocado. */
        try {
          const clip = await pg.evaluate(() => {
            window.__P.escenaET(true);
            const e = document.getElementById('et-sev');
            if (!e) return null;
            let n = e; while (n && !(n.classList && n.classList.contains('calc-box'))) n = n.parentElement;
            if (!n) return null;
            n.scrollIntoView({ block: 'center' });
            const r = n.getBoundingClientRect();
            return { x: Math.max(0, r.left - 4), y: Math.max(0, r.top - 4),
                     width: Math.min(r.width + 8, document.documentElement.clientWidth),
                     height: r.height + 8 };
          });
          await pg.waitForTimeout(200);
          if (clip && clip.width > 10 && clip.height > 10) {
            await pg.screenshot({ path: join(DEST, pre + 'et.png'), clip });
          } else { out.abortos.push('captura et ' + motor + ' ' + nom + ': sin caja medible'); }
        } catch (e) { out.abortos.push('captura et ' + motor + ' ' + nom + ': ' + String(e && e.message).slice(0, 70)); }
        try { await pg.evaluate(() => window.__P.refs());
          await pg.waitForTimeout(150);
          await pg.locator('#ref-integracion').screenshot({ path: join(DEST, pre + 'integracion.png') });
        } catch (e) { out.abortos.push('captura refs ' + motor + ' ' + nom + ': ' + String(e && e.message).slice(0, 70)); }
        try { await pg.evaluate(() => { window.__P.escenaET(true); window.__P.v2d(); });
          await pg.waitForTimeout(300);
          await pg.locator('#v2d-col-esten').screenshot({ path: join(DEST, pre + 'v2d.png') });
        } catch (e) { out.abortos.push('captura v2d ' + motor + ' ' + nom + ': ' + String(e && e.message).slice(0, 70)); }
      }
    }
    await pg.close();
  }
  await b.close();
}

srv.close();
console.log(JSON.stringify(out, null, 1));
process.exit(0);
