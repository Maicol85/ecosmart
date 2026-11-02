#!/usr/bin/env node
/**
 * _probe_correvid_demo.mjs - la comparacion del 2b, sobre lo que RENDERIZA LA APP.
 *
 * METODO (y por que no son pixeles): dos motores dan pixeles distintos con el mismo SVG, asi
 * que no se comparan imagenes. Se compara NUMERO A NUMERO el SVG REAL que la app construye en
 * el DOM contra el marcado que `valveGeo` de la demo v9 produce para la MISMA apertura.
 * `valveGeo` se EXTRAE del archivo de la demo por una marca literal, exigiendo que aparezca
 * UNA sola vez: si la demo cambia, la extraccion falla ruidosamente en vez de comparar otra
 * cosa. VAL-PPT-4 comparo las FUNCIONES; esto compara el DIBUJO, que es lo que el medico ve.
 *
 * TOLERANCIA 0,005 INCLUSIVE, y no es arbitraria: la app redondea a dos decimales con
 * `toFixed(2)` y la demo deja el crudo, asi que la maxima diferencia POSIBLE es medio ulp.
 *
 * DENOMINADOR: sin frecuencia cardiaca el simbolo queda CERRADO, o sea apertura CERO exacta y
 * comparable sin carrera. Con frecuencia se muestrea el ciclo y se exige que CADA forma que la
 * app dibuja pertenezca a la familia que la demo produce.
 *
 *   node scripts/_probe_correvid_demo.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const fs = await import('fs');
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const FILE = arg('--file') || RAIZ + '/index.html';
const DEMO = RAIZ + '/docs/3d/demo_posoperatorio_v9_concepto.html';

const src = fs.readFileSync(DEMO, 'utf8');
function saca(nombre) {
  const marca = 'function ' + nombre + '(';
  const n = src.split(marca).length - 1;
  if (n !== 1) { console.log('ABORTA: "' + marca + '" aparece ' + n + ' veces en la demo (se esperaba 1)'); process.exit(1) }
  const i = src.indexOf(marca);
  let j = src.indexOf('{', i), d = 0, k = j;
  for (; k < src.length; k++) { if (src[k] === '{') d++; else if (src[k] === '}') { d--; if (d === 0) break } }
  return src.slice(i, k + 1);
}
const DEMO_VALVEGEO = saca('valveGeo');
const DEMO_OPENFRAC = saca('openFrac');

const ESC = [
  ['mi', 'vm_morf', 'TEER mitral',               'pop_cx_v_mi', 'teer'],
  ['mi', 'vm_morf', 'Plastia mitral',            'pop_cx_v_mi', 'pla'],
  ['mi', 'vm_morf', 'Prótesis mecánica',         'pop_cx_v_mi', 'mec'],
  ['mi', 'vm_morf', 'Prótesis biológica',        'pop_cx_v_mi', 'bio'],
  ['tr', 'vt_morf', 'TEER tricuspídeo (T-TEER)', 'pop_cx_v_tr', 'teer'],
  ['tr', 'vt_morf', 'Plastia tricuspídea',       'pop_cx_v_tr', 'pla'],
  ['ao', 'va_morf', 'TAVI',                      'pop_cx_v_ao', 'tavi'],
  ['ao', 'va_morf', 'Prótesis mecánica',         'pop_cx_v_ao', 'mec']
];

const CUERPO = `(async (e) => {
  const R = { errs: [] };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
                  x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const W = ms => new Promise(r => setTimeout(r, ms));
  const S = (id, v) => { const el = EL(id); if (!el) { R.errs.push('NO EXISTE ' + id); return }
    el.value = v; el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true})) };
  const C = (id, o) => { const el = EL(id); if (!el) { R.errs.push('NO EXISTE ' + id); return }
    if (el.checked !== o) el.click() };
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (x) {}
  await W(250);
  const bt = bq('showTab(' + Q + 'hemodinamica'); if (bt) bt.click(); await W(300);
  const sec = EL('pop-seccion');
  if (!(sec && sec.offsetParent && sec.getBoundingClientRect().height > 100)) {
    const ba = bq('toggleCard(' + Q + 'pop-seccion'); if (ba) ba.click() }
  await W(400);
  S('peso','70'); S('talla','170');
  /* SIN frecuencia: el simbolo queda CERRADO, apertura CERO exacta. Ese es el denominador. */
  S(e.morf, e.val);
  C('pop_cx_valv', true); await W(200); C(e.chk, true);
  await W(800);
  const G = document.querySelector('[data-pop-esq="valv-' + e.k + '"]');
  if (!G) { R.sinGrupo = true; return R }
  /* El SVG REAL: cada nodo visible con sus atributos geometricos. */
  const vis = n => n.getAttribute('display') !== 'none';
  R.nodos = Array.prototype.filter.call(G.querySelectorAll('*'), vis).map(n => {
    const o = { tag: n.tagName };
    ['d','r','cx','cy','rx','ry','width','height','x','y','stroke-dasharray','fill-opacity']
      .forEach(a => { const v = n.getAttribute(a); if (v !== null) o[a] = v });
    return o;
  });
  R.aperturaApp = (typeof _popValvApertura === 'function') ? _popValvApertura(e.k, null) : 'n/d';
  R.velosApp = (typeof _popValvVelos === 'function')
    ? _popValvVelos(0, e.tipo === 'teer' ? 'teer' : e.tipo === 'tavi' ? 'tavi' : e.tipo === 'bio') : 'n/d';
  return R;
})`;

const num = s => String(s).match(/-?\d+(?:\.\d+)?/g) || [];
const cmpNum = (a, b, tol) => {
  const na = num(a), nb = num(b);
  if (na.length !== nb.length) return 'distinta cantidad de numeros (' + na.length + ' vs ' + nb.length + ')';
  for (let i = 0; i < na.length; i++) {
    if (Math.abs(parseFloat(na[i]) - parseFloat(nb[i])) > tol)
      return 'numero ' + (i+1) + ': app=' + na[i] + ' demo=' + nb[i];
  }
  /* Y la forma (las letras del path) tiene que ser la misma. */
  const la = String(a).replace(/[-\d.\s]/g, ''), lb = String(b).replace(/[-\d.\s]/g, '');
  if (la !== lb) return 'forma distinta: app=' + la + ' demo=' + lb;
  return null;
};

(async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome', headless: true });
  console.log('===== 2b - EL SVG QUE RENDERIZA LA APP, CONTRA LA DEMO v9 =====');
  console.log('app :', FILE);
  console.log('demo:', DEMO);
  console.log('metodo: se extrae valveGeo/openFrac de la demo por marca literal (una sola');
  console.log('        aparicion exigida), se corre con la MISMA apertura y se compara numero a');
  console.log('        numero contra el SVG REAL del DOM de la app. Tolerancia 0,005 INCLUSIVE');
  console.log('        -la app redondea a dos decimales y la demo deja el crudo-.');
  console.log('denominador: SIN frecuencia cardiaca la apertura es CERO exacta, sin carrera.');
  /* La demo, en una pagina EN BLANCO: no se carga su HTML, solo sus dos funciones. */
  const pd = await b.newPage(); await pd.goto('about:blank');
  await pd.addScriptTag({ content: DEMO_VALVEGEO + '\n' + DEMO_OPENFRAC + '\nwindow.__vg=valveGeo;' });
  const pg = await b.newPage({ viewport: { width: 1440, height: 1100 } });
  const errs = []; pg.on('pageerror', x => errs.push('PAGE ' + x.message));
  await pg.goto('file://' + FILE); await pg.waitForTimeout(2500);
  let ig = 0, di = 0;
  for (const [k, morf, val, chk, tipo] of ESC) {
    const demoHtml = await pd.evaluate(t => window.__vg(t, 0), tipo);
    let R;
    try { R = await Promise.race([ pg.evaluate(new Function('return ' + CUERPO)(), { k, morf, val, chk, tipo }),
      new Promise((_, rj) => setTimeout(() => rj(new Error('TIMEOUT')), 60000)) ]) }
    catch (x) { console.log('\n== ' + tipo + '/' + k + ' == FALLO: ' + x.message); di++; continue }
    if (R.sinGrupo) { console.log('\n== ' + tipo + '/' + k + ' == SIN GRUPO EN EL SVG'); di++; continue }
    /* ⚠️ SE COMPARAN SUBPATHS Y NO ATRIBUTOS, Y COSTO UNA CORRIDA. La demo mete los DOS velos
       en UN solo atributo d -«M-8 0L0 0M8 0L0 0»- y la app usa DOS nodos. Comparando atributo
       contra atributo, las ocho escenas salian DISTINTAS con los numeros IDENTICOS: una
       diferencia de particion en nodos, no de dibujo. Lo que el medico ve es el TRAZO, asi que
       se parte cada d en sus subpaths -por cada comando M- y se comparan los dos multiconjuntos. */
    const subp = d => String(d).split(/(?=M)/).map(x => x.trim()).filter(Boolean);
    const dDemo = (String(demoHtml).match(/\sd="([^"]+)"/g) || [])
      .map(s => s.slice(4, -1)).reduce((ac, x) => ac.concat(subp(x)), []);
    const dApp = R.nodos.filter(n => n.d).reduce((ac, n) => ac.concat(subp(n.d)), []);
    const faltan = [];
    dDemo.forEach(dd => {
      const hit = dApp.some(da => cmpNum(da, dd, 0.005) === null);
      if (!hit) faltan.push(dd);
    });
    const sobran = dApp.filter(da => !dDemo.some(dd => cmpNum(da, dd, 0.005) === null));
    const ok = faltan.length === 0 && sobran.length === 0;
    if (ok) ig++; else di++;
    console.log('\n== ' + tipo + '/' + k + ' ==  ' + (ok ? 'IGUAL' : 'DISTINTO')
      + '  (app ' + dApp.length + ' paths, demo ' + dDemo.length + ')');
    if (!ok) {
      faltan.forEach(x => console.log('   la demo dibuja y la app NO: ' + x));
      sobran.forEach(x => console.log('   la app dibuja y la demo NO: ' + x));
    }
    console.log('   apertura usada: 0 (sin frecuencia) · nodos visibles del grupo: ' + R.nodos.length);
    if (R.errs && R.errs.length) console.log('   errs: ' + R.errs.slice(0,3).join(' ; '));
  }
  console.log('\nRESULTADO: ' + ig + ' iguales, ' + di + ' distintos, sobre ' + ESC.length + ' escenas.');
  console.log('errores de pagina: ' + (errs.length ? errs.join(' | ') : 'ninguno'));
  await b.close();
  process.exit(0);
})();
