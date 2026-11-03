/*
 * _probe_pant4evid.mjs - las dos secciones NUEVAS del panel de Evidencia (PANT-4, commit 1e).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * Mide, con el panel ABIERTO por su boton real y en los cuatro anchos:
 *   · que las dos secciones existen y que SIN datos devuelven null (control negativo);
 *   · el conteo de preguntas, de botones de respuesta y su tamanio tactil;
 *   · que la grilla de preguntas sale en DOS columnas por encima del corte y en UNA por debajo;
 *   · el conteo de CITAS visibles de la seccion y el de etiquetas de guia;
 *   · que ninguna de las dos llega al papel -lo mide el A/B, aca se declara el denominador-.
 *
 *   node scripts/_probe_pant4evid.mjs --file <index.html> --out /tmp/p4e.json
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p4e.json';
const ANCHOS = (arg('--anchos') || '1440,1000,768,390').split(',').map(Number);

const MONTAR = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles:true }));
    e.dispatchEvent(new Event('change', { bubbles:true })); return 'ok' };
  const o = {};
  o.nSecs = (typeof IND_SECS !== 'undefined') ? IND_SECS.length : -1;
  o.nullEsub = (typeof _indESUB === 'function') ? (_indESUB() === null) : 'NO EXISTE';
  o.nullEasv = (typeof _indEASV === 'function') ? (_indEASV() === null) : 'NO EXISTE';
  S('esub_tipo','membrana'); S('esub_gradiente_medio','45'); S('esub_gradiente_mmhg','80');
  S('esub_ia_asociada','severa'); S('fevi','45'); S('dsfvi','52');
  S('easv_tipo','reloj'); S('easv_gradiente_medio','45'); S('easv_coronarias','comprometidos');
  S('easv_williams','si'); S('easv_estenosis_pulmonar','moderada');
  try { if (typeof indicAbrir === 'function') indicAbrir() } catch (e) { o.errAbrir = String(e).slice(0,160) }
  /* MAXIMIZAR POR SU BOTON REAL: el corte de las dos columnas es el ancho del PANEL (900 px),
     y sin maximizar mide 818 px tanto a 1440 como a 1000. Sin este gesto, «una columna» no
     distingue una regla que no anda de un panel que no llega al corte. */
  const mx = document.getElementById('indic-max');
  if (mx) { mx.click(); o.max = true } else { o.max = 'NO HAY BOTON' }
  return o;
})()`;

const MEDIR = `(() => {
  const o = {};
  const cu = document.getElementById('indic-cuerpo');
  if (!cu) return { err: 'NO HAY CUERPO' };
  const r = cu.getBoundingClientRect();
  o.panelW = Math.round(r.width); o.panelH = Math.round(r.height);
  /* Las dos secciones, por el texto de su <summary>. */
  const secs = {};
  cu.querySelectorAll('details').forEach(d => {
    const su = d.querySelector('summary'); if (!su) return;
    const t = su.textContent.trim();
    if (t.indexOf('Estenosis subaórtica') > -1) secs.esub = d;
    if (t.indexOf('Estenosis supravalvular aórtica') > -1) secs.easv = d;
    /* La CIA es el CONTROL: usa el MISMO molde desde TGA-2, asi que lo que midamos de las dos
       nuevas tiene que coincidir con lo suyo. Sin ella, un 35x32 se lee como un defecto. */
    if (t.indexOf('Comunicación interauricular') > -1) secs.cia = d;
  });
  ['esub','easv','cia'].forEach(k => {
    const d = secs[k];
    if (!d) { o[k] = { existe:false }; return }
    d.open = true;
    const txt = d.textContent;
    const btns = Array.prototype.slice.call(d.querySelectorAll('button')).filter(b => {
      const t = b.textContent.trim(); return t === 'Sí' || t === 'No' || t === '?';
    });
    const tam = btns.map(b => { const q = b.getBoundingClientRect(); return Math.round(q.width) + 'x' + Math.round(q.height) });
    /* Las columnas REALES de la grilla de preguntas: se agrupan las filas por su y. */
    /* ADVERTENCIA: la grilla de las PREGUNTAS es data-ind-pregcols, no data-ind-compacta: la
       segunda es el contenedor de TODA la seccion, y medirle los hijos da siempre una columna.
       Costo una corrida. Se mide por la posicion REAL de las filas y se contrasta con el
       atributo data-ind-cols que escribe el sincronizador de columnas.
       (Sin acentos graves: este comentario vive DENTRO del template de MEDIR.) */
    const gr = d.querySelector('[data-ind-pregcols="1"]');
    const grid = d.querySelector('[data-ind-grid][data-ind-preg="1"]');
    const attrCols = grid ? grid.getAttribute('data-ind-cols') : null;
    let cols = 0;
    if (gr) { const f = {};
      gr.querySelectorAll('tr').forEach(c => { const q = c.getBoundingClientRect();
        if (q.width <= 0) return; const kk = Math.round(q.top); f[kk] = (f[kk]||0)+1 });
      const v = Object.values(f); cols = v.length ? Math.max.apply(null, v) : 0; }
    o[k] = { existe:true, compacta: !!gr,
      nBtn: btns.length, tamUnicos: Array.from(new Set(tam)).sort(), cols: cols, attrCols: attrCols,
      citas: (txt.match(/\\[\\d+\\]/g) || []).length,
      clases: (txt.match(/Clase\\s+(?:III|II[ab]?|I|[0-9][ab]?)\\b/g) || []).length,
      folios: (txt.match(/folio\\s+[\\w.e]+/g) || []).length,
      diceESC: txt.indexOf('ESC 2020') > -1, diceACC: txt.indexOf('ACC/AHA 2025') > -1,
      sinDatoNoEsNo: txt.indexOf('no cuenta como «no»') > -1,
      alto: Math.round(d.getBoundingClientRect().height) };
  });
  o.scrollX = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  return o;
})()`;

const out = { file: FILE, cruces: [] };
const br = await _pw.chromium.launch({ channel: 'chrome' });
try {
  for (const w of ANCHOS) {
    const ctx = await br.newContext({ viewport: { width: w, height: 900 } });
    const pg = await ctx.newPage();
    const errs = []; pg.on('pageerror', e => errs.push(String(e).slice(0, 140)));
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(700);
    let mo = null, me = null;
    try { mo = await pg.evaluate(MONTAR) } catch (e) { mo = { err: String(e).slice(0, 160) } }
    await pg.waitForTimeout(500);
    try { me = await pg.evaluate(MEDIR) } catch (e) { me = { err: String(e).slice(0, 160) } }
    out.cruces.push({ ancho: w, montar: mo, ...me, errPagina: errs });
    await ctx.close();
  }
} finally { await br.close() }
fs.writeFileSync(OUTF, JSON.stringify(out, null, 1));
console.log('escrito ' + OUTF);
