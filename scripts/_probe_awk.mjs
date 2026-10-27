/* Sonda de MAQUETA en DOS MOTORES para la TANDA A (2026-10-27).
 *
 *   node scripts/_probe_awk.mjs [--file /ruta/index.html]
 *
 * Mide, en Chrome y en WebKit, a 1440 px y 390 px y en los DOS temas, lo que esta tanda movio:
 *   - CERO errores de consola y de pagina.
 *   - CERO barra horizontal de la PAGINA.
 *   - Las DIECISIETE pestanas con caja. Un <div> sin cerrar no lanza -el parser re-anida lo que
 *     viene despues- y ningun A/B de texto lo ve; lo unico que lo delata es que pestanas AJENAS
 *     informen 0x0, que es lo que la tanda I pago.
 *   - Las OCHO secciones compactas: cuantas despiertan, y que la grilla sea lo PRIMERO del cuerpo.
 *   - Los globos ⓘ: cuantos, y que nazcan CERRADOS.
 *   - La ficha del posoperatorio: sus dieciseis filas, sus dieciseis globos y sus cuatro chips.
 *   - Texto RECORTADO en las zonas que la tanda toca (scrollWidth > clientWidth por elemento).
 *
 * ⚠️ Playwright se resuelve POR RUTA. Si no esta, la sonda lo DICE y sale con codigo 2.
 * ⚠️ WebKit de Playwright NO es Safari, y se declara.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { createHash } from 'node:crypto';

const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CAND }, null, 1)); process.exit(2); }
const { chromium, webkit } = _pw;

const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const ARCH = arg('--file');
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

const out = { arbol: ARCH || 'VIVO', md5: null,
              nota: 'WebKit de Playwright NO es Safari, y se declara.', grupos: {} };
out.md5 = createHash('md5').update(await readFile(ARCH || join(RAIZ, 'index.html'))).digest('hex');

/* La escena: los OCHO modulos compactos cargados, mas bicuspide y aorta. */
const ESCENA = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  try { limpiarCampos(true) } catch (e) {}
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO ' + id;
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true})); return 1 };
  const F = {peso:'80', talla:'180', edad:'56', hemo_fc:'70', hemo_pam:'90', diam_tsvi:'20',
    itv_tsvi:'20', e_sep:'7', e_lat:'12', onda_e:'95', vci_diam:'24', ao_sin:'46', ao_tub:'47',
    tdf_grad_tsvd:'30', tdf_vtsvdi:'90', tdf_vtdvdi:'170', fevd:'40', fevi:'45', ip_vmax:'2.6',
    co_fevi_basal:'60', co_fevi_actual:'45', co_dosis_antrac:'300', pop_cx_horas:'12',
    sexo:'M', va_morf:'Bicúspide', vab_fenotipo:'rl', pericardio:'Derrame moderado (10-20mm)',
    vexus_sh:'2', vexus_pv:'1', vexus_ir:'2', it_grado:'2', tdf_civ_residual:'no',
    tdf_sintomas:'no', tdf_func_vd:'moderada', ip_grado:'Severa', tdf_vol_fuente:'rmc',
    tdf_ejercicio:'si', co_farmaco:'inmunoterapia', co_troponi:'si', 'ett-septo':'16',
    'ett-pp':'14', 'ett-rwt':'1', 'ett-ee':'1', 'ett-cual-1':'1', 'ett-cual-2':'1',
    pop_cx_tipo:'cabg', pop_asist_tipo:'ecmo_va', pop_pleura_der:'moderado'};
  const mal = Object.keys(F).filter(k => S(k, F[k]) !== 1);
  Object.keys(window).forEach(k => { if (/^calc[A-Z]/.test(k) && typeof window[k] === 'function') {
    try { window[k]() } catch (e) {} } });
  try { if (typeof indicAbrir === 'function') indicAbrir() } catch (e) {}
  return mal;
})()`;

const MEDIR = `(() => {
  const o = {};
  const d = document.documentElement;
  o.scrollH = { hay: d.scrollWidth > d.clientWidth, sw: d.scrollWidth, cw: d.clientWidth };
  /* Las pestanas, una por una. */
  const bs = [].slice.call(document.querySelectorAll('.tab-btn[onclick]'));
  o.pest = { n: 0, conCaja: 0, cero: [] };
  const antes = (function(){ const a = document.querySelector('.tab-section:not([style*="none"])');
    return a ? a.id : null })();
  bs.forEach(b => { const m = /showTab\\('([^']+)'/.exec(b.getAttribute('onclick') || ''); if (!m) return;
    o.pest.n++;
    try { showTab(m[1]) } catch (e) {}
    const p = document.getElementById('tab-' + m[1]);
    const r = p ? p.getBoundingClientRect() : { width:0, height:0 };
    if (r.width > 0 && r.height > 0) o.pest.conCaja++; else o.pest.cero.push(m[1]);
  });
  /* El panel de Evidencia. */
  try { if (typeof indicAbrir === 'function') indicAbrir() } catch (e) {}
  const cu = document.getElementById('indic-cuerpo');
  o.panel = { hay: !!cu, secs: 0, compactas: 0, gridPrimero: 0, malOrden: [],
              infos: 0, infosAbiertos: 0 };
  if (cu) {
    const secs = [].slice.call(cu.children).filter(x => x.tagName === 'DETAILS');
    o.panel.secs = secs.length;
    secs.filter(s => s.querySelector('[data-ind-compacta]')).forEach(s => {
      o.panel.compactas++;
      const cuerpo = s.querySelector('summary').nextElementSibling;
      const hijos = cuerpo ? [].slice.call(cuerpo.children) : [];
      const iG = hijos.indexOf(cuerpo ? cuerpo.querySelector('[data-ind-grid]') : null);
      if (iG === 0) o.panel.gridPrimero++;
      else o.panel.malOrden.push(((s.querySelector('summary')||{}).textContent||'').trim().slice(0,24) + ':' + iG);
    });
    const inf = [].slice.call(cu.querySelectorAll('[data-ind-info]'));
    o.panel.infos = inf.length;
    o.panel.infosAbiertos = inf.filter(x => x.open).length;
    /* Texto RECORTADO en el panel: un elemento cuyo contenido no entra en su caja. */
    o.recortados = [].slice.call(cu.querySelectorAll('td, summary, div'))
      .filter(x => x.scrollWidth > x.clientWidth + 1 && x.clientWidth > 0)
      .map(x => (x.textContent || '').replace(/\\s+/g,' ').trim().slice(0, 42)).slice(0, 8);
  }
  /* La ficha del posoperatorio. */
  try { showTab('referencias') } catch (e) {}
  const fp = document.getElementById('ref-pop');
  if (fp) { fp.style.display = 'block';
    const t = fp.querySelector('table');
    o.ficha = { filas: t ? t.rows.length - 1 : -1,
      globos: t ? [].slice.call(t.rows).slice(1).filter(r => r.cells[2] && r.cells[2].querySelector('details')).length : -1,
      chips: ((fp.textContent || '').match(/CRITERIO DE ECOSMART/g) || []).length,
      globosAbiertos: [].slice.call(fp.querySelectorAll('details')).filter(x => x.open).length };
  } else o.ficha = { filas: 'SIN FICHA' };
  return o;
})()`;

/* ⚠️ CHROMIUM VA POR EL CHROME DEL SISTEMA (`channel: 'chrome'`) y WebKit por el binario de
   Playwright. El binario de chromium de Playwright NO esta instalado en esta maquina —la
   primera corrida dio «Executable doesn't exist» en los cuatro cruces— y las otras sondas de
   este repo ya usan el canal del sistema por el mismo motivo. */
for (const [nombre, motor, opts] of [['chromium', chromium, { channel: 'chrome' }],
                                     ['webkit', webkit, {}]]) {
  for (const w of [1440, 390]) {
    for (const claro of [false, true]) {
      const clave = nombre + '_' + w + '_' + (claro ? 'claro' : 'oscuro');
      let b = null;
      try {
        b = await motor.launch(opts);
        const pg = await b.newPage({ viewport: { width: w, height: 900 } });
        const errs = [];
        pg.on('pageerror', e => errs.push('PAGINA: ' + e.message.slice(0, 120)));
        pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLA: ' + m.text().slice(0, 120)) });
        await pg.goto('http://127.0.0.1:' + PORT + '/index.html', { waitUntil: 'load', timeout: 180000 });
        await pg.waitForTimeout(1500);
        await pg.evaluate('document.documentElement.classList.toggle("light-mode", ' + !!claro + ')');
        const mal = await pg.evaluate(ESCENA);
        await pg.waitForTimeout(400);
        const m = await pg.evaluate(MEDIR);
        out.grupos[clave] = Object.assign({ camposQueNoEntraron: mal, errores: errs }, m);
        console.log('-- ' + clave + ': pestanas ' + m.pest.conCaja + '/' + m.pest.n
          + ' | compactas ' + m.panel.compactas + ' (grid primero ' + m.panel.gridPrimero + ')'
          + ' | globos ' + m.panel.infos + ' (abiertos ' + m.panel.infosAbiertos + ')'
          + ' | ficha ' + m.ficha.filas + '/' + m.ficha.globos + '/' + m.ficha.chips
          + ' | scrollH ' + m.scrollH.hay + ' | errores ' + errs.length);
        await pg.close();
      } catch (e) { out.grupos[clave] = { err: String(e).slice(0, 200) };
        console.log('-- ' + clave + ': ERROR ' + String(e).slice(0, 120)); }
      try { if (b) await b.close() } catch (e) {}
    }
  }
}
srv.close();
console.log(JSON.stringify(out, null, 1).slice(0, 200) + ' …');
import { writeFile } from 'node:fs/promises';
const dest = arg('--out') || '/tmp/awk.json';
await writeFile(dest, JSON.stringify(out, null, 1));
console.log('escrito: ' + dest);
process.exit(0);
