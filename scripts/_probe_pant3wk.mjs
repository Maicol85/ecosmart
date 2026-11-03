/*
 * _probe_pant3wk.mjs - Chrome y WebKit, dos temas y cuatro anchos (tanda PANT-3).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI, y se declara. Chrome va por el del sistema con
 * channel chrome: sin eso la sonda devuelve los cruces VACIOS, que en un volcado se lee igual
 * que «no hubo diferencias».
 *
 * En cada cruce abre la pestania y el acordeon POR SU BOTON REAL -con la pestania cerrada todo
 * getBoundingClientRect da 0x0 y la sonda informa «todo bien» sobre cajas de cero-.
 *
 *   node scripts/_probe_pant3wk.mjs --file <index.html> --out /tmp/p3wk.json
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium, webkit } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p3wk.json';
const ANCHOS = [1440, 1000, 768, 390];

const MEDIR = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  const o = {};
  const vis = (id) => { const e = document.getElementById(id);
    return e ? (getComputedStyle(e).display === 'none' ? 'oculto' : 'visible') : 'NO EXISTE' };
  const caja = (id) => { const e = document.getElementById(id); if (!e) return null;
    const r = e.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)] };
  const abrirSec = (tab, sec) => {
    try { showTab(tab) } catch (e) {}
    try { if (tab.indexOf('congenitas') === 0) ccSubTab(tab) } catch (e) {}
    const s = document.getElementById(sec);
    /* ⚠️ LA TRANSICION SE APAGA ANTES DEL CLIC, Y HAY QUE FORZAR max-height. .sacc-body abre
       con max-height y una transicion de 0,3 s: apagandola DESPUES del clic, la caja ya se
       leyo a mitad de la animacion y la seccion informa 46 o 70 px en vez de su alto real -o
       cero, si se mide el cuerpo-. Medido el 03/11/2026: mchAlto daba 0 y mchColsReales
       tambien, o sea un denominador de cero que se lee igual que «la pantalla no existe». Es la
       trampa que la tanda AJ9 documento para .sacc-body. */
    const b0 = s && s.querySelector('.sacc-body');
    if (b0) { b0.style.transition = 'none'; }
    if (s && !s.classList.contains('open')) { const h = s.querySelector('.sacc-hdr'); if (h) h.click() }
    const b = s && s.querySelector('.sacc-body');
    if (b) { b.style.transition = 'none'; b.style.maxHeight = 'none'; }
    return !!s && s.getBoundingClientRect().height > 0;
  };
  /* ── 1 · los dos botones de CIA / CIV ── */
  o.secShunt = abrirSec('congenitas2', 'sacc-cc-shunt');
  o.botCia = caja('ete-shunt-tab-cia');
  o.botCiv = caja('ete-shunt-tab-civ');
  const bc = document.getElementById('ete-shunt-tab-cia');
  const bv = document.getElementById('ete-shunt-tab-civ');
  /* ⚠️ .tab-btn LLEVA transition: all 0.15s, ASI QUE LEER EL FONDO JUSTO DESPUES DEL CLIC
     DEVUELVE EL VALOR DE PARTIDA. Medido el 03/11/2026: el boton marcado informaba
     «sin relleno» -rgba(0,0,0,0)- en los dos motores y en los cuatro anchos, que se lee como un
     defecto de la app, y con 400 ms de espera el mismo boton da rgb(62, 207, 142), que es
     var(--green). La animacion se apaga ANTES de tocar, que es lo que hace la medicion
     sincronica y comparable entre motores. Es la trampa que la AJ9 documento con .sacc-body y
     la que la POP-B documento con el color que no resolvia. */
  if (bc) bc.style.transition = 'none';
  if (bv) bv.style.transition = 'none';
  const relleno = (e) => e ? (/rgba?\\(0, 0, 0, 0\\)|transparent/.test(getComputedStyle(e).backgroundColor)
    ? 'sin relleno' : 'con relleno') : 'NO EXISTE';
  o.ciaRelleno = relleno(bc);
  if (bc) { bc.click(); }
  o.ciaRellenoTrasClic = relleno(bc);
  /* CONTROL NEGATIVO: el otro boton NO se pinta, asi que la metrica distingue estados. */
  o.civRellenoTrasClic = relleno(bv);
  if (bc) { bc.click(); }
  o.ciaRellenoTrasDesmarcar = relleno(bc);
  /* ── 2 · el esquema de la TGA: sus rotulos ── */
  abrirSec('congenitas2', 'sacc-cc-tga');
  const sv = document.getElementById('tga-esq-svg');
  const tx = sv ? sv.querySelectorAll('text') : [];
  o.esqTextos = tx.length;
  o.esqHalo = Array.prototype.filter.call(tx, (t) => t.getAttribute('stroke')).length;
  /* ── 3 · el pie del corazon maestro ── */
  o.pieEnCC = vis('cc3d-wrap');
  o.pieBoton = caja('cc3d-abrir');
  try { showTab('valvulas') } catch (e) {}
  o.pieEnValvulas = vis('cc3d-wrap');
  /* ── 4 · la pantalla de MCH ── */
  o.secMch = abrirSec('congenitas', 'sacc-cc-mch');
  const mc = document.getElementById('sacc-cc-mch');
  o.mchAlto = mc ? Math.round(mc.getBoundingClientRect().height) : 0;
  o.mchCols = document.querySelectorAll('#mch-cols > .mch-col').length;
  o.mchCajas = document.querySelectorAll('#mch-cajas > .mch-caja').length;
  o.mchGlobos = mc ? mc.querySelectorAll('[data-vinfo]').length : 0;
  /* columnas REALES: el maximo de campos que comparten una fila */
  const filas = {};
  if (mc) mc.querySelectorAll('.fg').forEach((e) => { const r = e.getBoundingClientRect();
    if (r.width > 0) { const k = Math.round(r.top); filas[k] = (filas[k] || 0) + 1 } });
  const vv = Object.values(filas);
  o.mchColsReales = vv.length ? Math.max.apply(null, vv) : 0;
  /* ── 5 · lo global ── */
  o.scrollX = document.documentElement.scrollWidth > document.documentElement.clientWidth ? 1 : 0;
  let rec = 0;
  document.querySelectorAll('label, .calc-lbl, .mch-h, .tab-btn').forEach((e) => {
    if (e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 1) rec++; });
  o.recortados = rec;
  o.pestaniasConCaja = Array.prototype.filter.call(document.querySelectorAll('.tab-btn'),
    (b) => b.getBoundingClientRect().width > 0).length;
  return o;
})()`;

const OUT = { archivo: FILE, cruces: {} };
for (const [nom, motor] of [['chrome', chromium], ['webkit', webkit]]) {
  let b = null;
  try { b = await motor.launch(nom === 'chrome' ? { channel: 'chrome' } : {}) }
  catch (e) { OUT['err_' + nom] = String(e).slice(0, 160); continue }
  for (const tema of ['light', 'dark']) {
    for (const w of ANCHOS) {
      const k = nom + '/' + tema + '/' + w;
      try {
        const pg = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: tema });
        const errs = [];
        pg.on('pageerror', (e) => errs.push(e.message.slice(0, 110)));
        pg.on('console', (m) => { if (m.type() === 'error') errs.push('consola: ' + m.text().slice(0, 110)) });
        await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
        await pg.waitForTimeout(1500);
        const r = await pg.evaluate(MEDIR);
        r.errores = errs.length; r.errDetalle = errs.slice(0, 3);
        OUT.cruces[k] = r;
        await pg.close();
      } catch (e) { OUT.cruces[k] = { err: String(e).slice(0, 160) } }
    }
  }
  try { await b.close() } catch (e) {}
}
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
const ks = Object.keys(OUT.cruces);
console.log('cruces medidos: ' + ks.length + (OUT.err_chrome ? '  ⚠️ chrome: ' + OUT.err_chrome : '') +
            (OUT.err_webkit ? '  ⚠️ webkit: ' + OUT.err_webkit : ''));
ks.forEach((k) => { const o = OUT.cruces[k];
  console.log('  ' + k.padEnd(22) + ' botCIA=' + JSON.stringify(o.botCia) + ' relleno=' + o.ciaRellenoTrasClic +
    ' esq=' + o.esqTextos + '/' + o.esqHalo + ' pie=' + o.pieEnCC + '/' + o.pieEnValvulas +
    ' mch=' + o.mchAlto + 'px cols=' + o.mchCols + '/' + o.mchColsReales + ' globos=' + o.mchGlobos +
    ' scrollX=' + o.scrollX + ' recort=' + o.recortados + ' err=' + o.errores); });
console.log('escrito: ' + OUTF);
