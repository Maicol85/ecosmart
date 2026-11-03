/*
 * _probe_pant2wk.mjs - CHROME y WEBKIT sobre lo que la tanda PANT-2 toca (2026-11-02).
 * Nombre propio: verificado con ls que no existia.
 *
 * DIECISEIS CRUCES: dos motores x 1440, 1000, 768 y 390 px x dos temas. Por cruce:
 *   cero errores de consola y de pagina · cero desplazamiento horizontal del cuerpo ·
 *   cero textos recortados · el reparto en dos columnas por ancho de panel ·
 *   el alto de la fila de pregunta · el boton de respuesta en 32 px visibles y 44 de area ·
 *   el ⓘ que se cierra al tocar fuera · las frases de la transposicion.
 *
 * ⚠️ WebKit de Playwright NO es Safari, y se declara. Chrome va por el del sistema con
 * channel:'chrome', porque el binario de chromium de Playwright no esta en esta maquina: sin
 * eso la sonda devuelve los cruces VACIOS, que en un volcado se lee como «no hubo diferencias».
 * ⚠️ El tema de la app es la clase light-mode en <html>: el colorScheme de Playwright NO lo mueve.
 *
 *   node scripts/_probe_pant2wk.mjs --out /tmp/pant2wk.json
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CAND })); process.exit(2) }
const { chromium, webkit } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/pant2wk.json';
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['claro', 'oscuro'];

const MIDE = `(() => {
  const o = {};
  const card = document.getElementById('indic-card');
  o.panelW = card ? Math.round(card.getBoundingClientRect().width) : 0;
  const g = card ? card.querySelector('[data-ind-grid][data-ind-preg="1"]') : null;
  o.cols = g ? (g.getAttribute('data-ind-cols') || '-') : 'sin grilla';
  const pc = g ? g.querySelector('[data-ind-pregcols="1"]') : null;
  o.subs = pc ? pc.querySelectorAll('[data-ind-sub="1"]').length : 0;
  o.ecoSubs = g ? g.querySelectorAll('[data-ind-col="eco"] [data-ind-sub="1"]').length : 0;
  let fm = 0, np = 0;
  if (g) Array.prototype.forEach.call(g.querySelectorAll('tr'), function (tr) {
    if (!tr.querySelector('[data-ind-clin]')) return; np++;
    fm = Math.max(fm, Math.round(tr.getBoundingClientRect().height)) });
  o.nPreg = np; o.filaMax = fm;
  const b = card ? card.querySelector('[data-ind-preg="1"] .ind-ctrl-btn') : null;
  o.btnVis = b ? Math.round(b.getBoundingClientRect().height) : 0;
  o.btnArea = b ? String(getComputedStyle(b, '::after').height) : 'sin boton';
  const fuera = card ? Array.prototype.slice.call(card.querySelectorAll('[data-ind-clin]'))
    .filter(function (x) { return !x.closest('[data-ind-preg="1"]') })[0] : null;
  o.btnFuera = fuera ? String(getComputedStyle(fuera).minHeight) : 'sin boton fuera';
  o.citas = card ? card.querySelectorAll('[data-ind-ref]').length : 0;
  /* El ⓘ: una sola abierta. */
  const notas = function () { return Array.prototype.slice.call(
    document.querySelectorAll('details[data-ind-info]')) };
  const vis = notas().filter(function (d) {
    const pa = d.parentElement ? d.parentElement.closest('details:not([open])') : null;
    return !pa && (typeof d.checkVisibility === 'function' ? d.checkVisibility() : !!d.offsetParent) });
  o.nInfoVis = vis.length;
  if (vis.length >= 2) {
    vis[0].querySelector('summary').click();
    vis[1].querySelector('summary').click();
    o.abiertasTrasDos = document.querySelectorAll('details[data-ind-info][open]').length;
    const t = document.getElementById('indic-titulo'); if (t) t.click();
    o.abiertasTrasFuera = document.querySelectorAll('details[data-ind-info][open]').length;
  } else { o.abiertasTrasDos = 'sin par'; o.abiertasTrasFuera = 'sin par' }
  /* Las frases de la transposicion. */
  try { const c = (typeof tgaConclusion === 'function') ? tgaConclusion() : null;
    o.fraseDisf = c ? (String(c.txt).indexOf('Disfunción del ventrículo derecho sistémico moderada') >= 0) : 'sin fn';
    o.fraseVieja = c ? (String(c.txt).indexOf('Función del ventrículo derecho sistémico con disfunción') >= 0) : 'sin fn';
  } catch (e) { o.fraseDisf = 'ERR' }
  /* El resolvedor de estilos del esquema. */
  const cont = document.getElementById('tga-esq-svg');
  const svg = cont && cont.firstChild;
  let tx = ''; try { tx = svg ? new XMLSerializer().serializeToString(svg) : '' } catch (e) {}
  o.esqVarRas = (tx && typeof esqSvgParaRaster === 'function')
    ? (esqSvgParaRaster(tx).split('var(--').length - 1) : 'sin esquema';
  /* Lo global: desplazamiento horizontal y texto recortado. */
  o.scrollX = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  let rec = 0;
  Array.prototype.forEach.call(document.querySelectorAll('button, label, .fg label, td, th'), function (e) {
    if (!e.offsetParent) return;
    if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'auto') rec++ });
  o.recortados = rec;
  return o;
})()`;

const OUT = { archivo: FILE, nota: 'WebKit de Playwright NO es Safari. Chrome va por el del sistema.' };
for (const [nom, motor, opts] of [['chrome', chromium, { channel: 'chrome' }], ['webkit', webkit, {}]]) {
  let b = null;
  try { b = await motor.launch(opts) } catch (e) { OUT['_err_' + nom] = String(e).slice(0, 120); continue }
  for (const W of ANCHOS) for (const tema of TEMAS) {
    const k = nom + '/' + W + '/' + tema;
    try {
      const pg = await b.newPage({ viewport: { width: W, height: 900 } });
      const errs = [];
      pg.on('pageerror', e => errs.push('page: ' + e.message.slice(0, 90)));
      pg.on('console', m => { if (m.type() === 'error') errs.push('consola: ' + m.text().slice(0, 90)) });
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
      await pg.waitForTimeout(1300);
      await pg.evaluate("(() => { const h = document.documentElement;"
        + " if (" + JSON.stringify(tema) + " === 'claro') h.classList.add('light-mode'); else h.classList.remove('light-mode');"
        + " try { if (typeof lv3dAlCambiarTema === 'function') lv3dAlCambiarTema() } catch (e) {} return 1 })()");
      await pg.evaluate(`(() => {
        ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
        const S = (id, v) => { const e = document.getElementById(id); if (!e) return; e.value = v;
          e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) };
        S('nombre','PANT2 wk'); S('ci','624'); S('peso','70'); S('talla','170');
        S('tga_tipo','dtga'); S('tga_cirugia','auricular'); S('tga_func_vd','moderada');
        S('ete_cia_tipo','secundum'); S('ete_cia_tam_max','18');
        S('siv','18'); S('ppvi','12'); S('fevi','55'); S('mch_grad_reposo','45'); S('vmax_ao','3.2');
        Object.keys(window).forEach(x => { if (/^calc[A-Z]/.test(x) && typeof window[x] === 'function') {
          try { window[x]() } catch (e) {} } });
        if (typeof tgaSync === 'function') { try { tgaSync() } catch (e) {} }
        const b = document.getElementById('indic-btn'); if (b) b.click();
        if (typeof indicMaxPoner === 'function') indicMaxPoner(true);
        if (typeof _indColsSync === 'function') _indColsSync();
        return 1; })()`);
      await pg.waitForTimeout(900);
      const r = await pg.evaluate(MIDE);
      r.errores = errs.length; r.erroresTxt = errs.slice(0, 2);
      OUT[k] = r;
      console.log('-- ' + k.padEnd(22) + ' panel=' + String(r.panelW).padStart(4)
        + ' cols=' + r.cols + ' subs=' + r.subs + '/' + r.ecoSubs
        + ' preg=' + r.nPreg + ' fMax=' + String(r.filaMax).padStart(3)
        + ' btn=' + r.btnVis + '/' + r.btnArea + ' fuera=' + r.btnFuera
        + ' citas=' + r.citas + ' ⓘ=' + r.nInfoVis + ' dos=' + r.abiertasTrasDos
        + ' fuera=' + r.abiertasTrasFuera + ' esqVar=' + r.esqVarRas
        + ' disf=' + r.fraseDisf + '/' + r.fraseVieja
        + ' scrollX=' + r.scrollX + ' recort=' + r.recortados + ' err=' + r.errores);
      await pg.close();
    } catch (e) { OUT[k] = { err: String(e).slice(0, 110) }; console.log('-- ' + k + ' ERR ' + String(e).slice(0, 70)) }
  }
  await b.close();
}
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF);
process.exit(0);
