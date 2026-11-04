/*
 * _probe_pant8ref.mjs - PANT-8, commit 5: el cuadro de Referencias del VD con el tronco y las
 * ramas de la arteria pulmonar y los tres diametros del tracto de salida.
 * Nombre propio: verificado con ls, no existia.
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda.
 *   node scripts/_probe_pant8ref.mjs --file <index.html> --out <json>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p8ref.json';

const MEDIR = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m=document.getElementById(id); if(m) m.style.display='none' });
  const o = {};
  /* el registro: cuantas fichas y cuales son nuevas */
  try { o.nRefs = (typeof EV_REFS !== 'undefined') ? EV_REFS.length : 'sin EV_REFS';
        o.ids = (typeof EV_REFS !== 'undefined')
          ? EV_REFS.filter(r => r.id.indexOf('DIM-VD-') === 0).map(r => r.id).join(',') : '' } catch(e) { o.err1 = String(e).slice(0,70) }
  /* abrir Referencias y pintar la ficha del VD por su camino real */
  try { showTab('referencias') } catch(e) { o.err2 = String(e).slice(0,70) }
  try { if (typeof refSubShow === 'function') refSubShow('dim') } catch(e) {}
  try { if (typeof toggleRef === 'function') toggleRef('vd2') } catch(e) { o.err3 = String(e).slice(0,70) }
  try { if (typeof evRefPintar === 'function') evRefPintar('vd2') } catch(e) { o.err4 = String(e).slice(0,70) }
  const host = document.getElementById('ref-vd2-cuerpo');
  o.hostExiste = !!host;
  if (host) {
    const t = (host.textContent || '').replace(/\\s+/g,' ').trim();
    o.chars = t.length;
    o.filas = host.querySelectorAll('tr').length;
    /* DENOMINADOR: sin filas, un cero de contenido no prueba nada */
    const cuenta = (pat) => (t.match(new RegExp(pat,'g'))||[]).length;
    o.tronco   = cuenta('Tronco de la AP');
    o.ramas    = cuenta('Ramas derecha e izquierda');
    o.tsvd     = cuenta('TSVD');
    o.sinValor = cuenta('sin valor normal publicado');
    o.folio145 = cuenta('145');
    o.folio149 = cuenta('149');
    o.folio150 = cuenta('150');
    o.folio27  = cuenta('folio 27');
    o.entradasBiblio = host.querySelectorAll('li').length;
    /* conducta y revision pendiente: tienen que dar CERO */
    o.conducta = cuenta('se recomienda|recomendad|indicad|debe considerarse');
    o.revision = cuenta('pendiente de revisi|sin validar|a confirmar por');
  }
  /* el buscador de Referencias tiene que seguir indexando lo mismo */
  try { o.idx = (typeof REF_IDX !== 'undefined') ? REF_IDX.length : 'sin REF_IDX' } catch(e) { o.idx = 'sin REF_IDX' }
  return o;
})()`;

const res = { file: FILE };
const nav = await _pw.chromium.launch({ channel: 'chrome' });
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const pg = await ctx.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(String(e).slice(0, 150)));
try {
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
  await pg.waitForTimeout(1200);
  res.r = await pg.evaluate(MEDIR);
} catch (e) { res.error = String(e).slice(0, 200) }
res.errores = errs.length; res.err1 = errs[0] || '';
await ctx.close(); await nav.close();
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log('escrito ' + OUTF);
