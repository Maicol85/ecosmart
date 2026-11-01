#!/usr/bin/env node
/**
 * _probe_marfan1fig.mjs — la figura contra la demo, escena por escena (MARFAN-1, commit 6b).
 *
 * METODO: se cargan la demo y la app en la MISMA corrida, se ponen los MISMOS rasgos en las
 * dos y se comparan (1) el SVG de marcas, nodo por nodo y atributo por atributo, y (2) los
 * ocho factores de forma una vez que el tween converge, mas los `transform` y las rutas que
 * esos factores producen.
 * TOLERANCIA: el SVG de marcas se compara TEXTUAL tras normalizar espacios; los factores de
 * forma, con 1e-6. No se comparan pixeles: dos motores de render dan pixeles distintos con el
 * mismo SVG, asi que compararlos mediria el motor y no el dibujo.
 * ⚠️ El tween converge en varios cuadros; se espera a que `raf` quede en null en los dos.
 *
 *   node scripts/_probe_marfan1fig.mjs [--file <html>]
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const DEMO = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/docs/3d/demo_marfan_figura_v1_concepto.html';

/* Las escenas: vacio, UN rasgo a la vez, y todos juntos. Cada una en el vocabulario de la app;
   la traduccion al de la demo va al lado, que es lo que permite montar la misma escena en las
   dos sin que una lista dependa de la otra. */
const ESCENAS = [
  ['vacio',        {}, {}],
  ['muneca ambos', { mfs_muneca_pulgar: 'ambos' }, { mun: 3 }],
  ['muneca uno',   { mfs_muneca_pulgar: 'uno' },   { mun: 1 }],
  ['pectus carin', { mfs_pectus: 'carinatum' },    { pecho: 'car' }],
  ['pectus exc',   { mfs_pectus: 'excavatum' },    { pecho: 'exc' }],
  ['pie retropie', { mfs_pie: 'retropie' },        { pie: 'ret' }],
  ['pie plano',    { mfs_pie: 'plano' },           { pie: 'pla' }],
  ['neumotorax',   { mfs_neumotorax: 1 },          { neumo: 1 }],
  ['ectasia',      { mfs_ectasia: 1 },             { dural: 1 }],
  ['protrusion',   { mfs_protrusion: 1 },          { protr: 1 }],
  ['proporciones', { mfs_proporciones: 1 },        { prop: 1 }],
  ['escoliosis',   { mfs_escoliosis: 1 },          { escol: 1 }],
  ['codo',         { mfs_codo: 1 },                { codo: 1 }],
  ['facies',       { mfs_facies: 1 },              { cara: 1 }],
  ['estrias',      { mfs_estrias: 1 },             { estr: 1 }],
  ['miopia',       { mfs_miopia: 1 },              { miop: 1 }],
  ['prolapso',     { mfs_prolapso: 1 },            { mvp: 1 }],
  ['ectopia',      { mfs_ectopia_lentis: 'si' },   { ect: 1 }],
  ['raiz',         { mfs_diseccion_raiz: 'si' },   { raiz: 1 }],
  ['TODOS', { mfs_muneca_pulgar: 'ambos', mfs_pectus: 'carinatum', mfs_pie: 'retropie',
    mfs_neumotorax: 1, mfs_ectasia: 1, mfs_protrusion: 1, mfs_proporciones: 1, mfs_escoliosis: 1,
    mfs_codo: 1, mfs_facies: 1, mfs_estrias: 1, mfs_miopia: 1, mfs_prolapso: 1,
    mfs_ectopia_lentis: 'si', mfs_diseccion_raiz: 'si' },
   { mun: 3, pecho: 'car', pie: 'ret', neumo: 1, dural: 1, protr: 1, prop: 1, escol: 1,
     codo: 1, cara: 1, estr: 1, miop: 1, mvp: 1, ect: 1, raiz: 1 }]
];

const APP = (esc) => `(async () => {
  const EL = id => document.getElementById(id);
  const S = (id, v) => { const e = EL(id); if (!e) return 'NO ' + id;
    if (e.type === 'checkbox') e.checked = (v === 1 || v === true); else e.value = v;
    e.dispatchEvent(new Event('change', { bubbles: true })); return 1 };
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  if (!EL('mfs-fig-svg')) { try { critAbrir('marfan') } catch (e) {} await new Promise(r => setTimeout(r, 250)) }
  /* se limpia TODO antes de montar: un rasgo de la escena anterior falsea la comparacion */
  MFS_SCORE.forEach(r => { if (r.t === 'sel') S(r.c, ''); else S(r.c, 0) });
  MFS_APARTE.forEach(r => S(r.c, ''));
  const E = ${JSON.stringify(esc)};
  Object.keys(E).forEach(k => S(k, E[k]));
  if (typeof mfsCalc === 'function') mfsCalc();
  /* esperar a que el tween converja: el factor se mueve 18 % por cuadro */
  for (let i = 0; i < 200 && _mfsFigRaf !== null; i++) await new Promise(r => setTimeout(r, 16));
  await new Promise(r => setTimeout(r, 60));
  const mk = EL('mfs-fig-marcas');
  const svg = EL('mfs-fig-svg');
  const tr = sel => Array.prototype.map.call(svg.querySelectorAll(sel), e => e.getAttribute('transform') || '').join(';');
  return {
    marcas: mk ? String(mk.innerHTML).replace(/class="mfs-fig-pulso"/g, 'class="pulse"').replace(/\\s+/g, ' ').trim() : 'NO',
    nMarcas: mk ? mk.children.length : -1,
    cur: JSON.parse(JSON.stringify(_mfsFigCur)),
    trArm: tr('.mfsf-arm'), trFore: tr('.mfsf-fore'), trFing: tr('.mfsf-fing'),
    trThumb: tr('.mfsf-thumb'), trLeg: tr('.mfsf-leg'), trFoot: tr('.mfsf-foot'),
    dFootp: Array.prototype.map.call(svg.querySelectorAll('.mfsf-footp'), e => e.getAttribute('d')).join(';'),
    dTFill: (EL('mfs-fig-tfill') || {}).getAttribute ? EL('mfs-fig-tfill').getAttribute('d') : 'NO',
    dTL: (EL('mfs-fig-tl') || {}).getAttribute ? EL('mfs-fig-tl').getAttribute('d') : 'NO',
    dTR: (EL('mfs-fig-tr') || {}).getAttribute ? EL('mfs-fig-tr').getAttribute('d') : 'NO',
    alt: String((EL('mfs-fig-alt') || {}).textContent || '')
  };
})()`;

const DEM = (esc) => `(async () => {
  const d = window._dbg;
  Object.keys(d.S).forEach(k => { if (k !== 'neumoLado') d.S[k] = 0 });
  const E = ${JSON.stringify(esc)};
  Object.keys(E).forEach(k => { d.S[k] = E[k] });
  d.build(); d.update();
  for (let i = 0; i < 200; i++) { await new Promise(r => setTimeout(r, 16));
    const t = d.target(); let fin = true;
    Object.keys(t).forEach(k => { if (Math.abs(t[k] - d.cur[k]) > 1e-6) fin = false });
    if (fin) break; }
  await new Promise(r => setTimeout(r, 60));
  const EL = i => document.getElementById(i);
  const svg = EL('svg');
  const tr = sel => Array.prototype.map.call(svg.querySelectorAll(sel), e => e.getAttribute('transform') || '').join(';');
  return {
    marcas: String(EL('mk').innerHTML).replace(/\\s+/g, ' ').trim(),
    nMarcas: EL('mk').children.length,
    cur: JSON.parse(JSON.stringify(d.cur)),
    trArm: tr('.arm'), trFore: tr('.fore'), trFing: tr('.fing'),
    trThumb: tr('.thumb'), trLeg: tr('.leg'), trFoot: tr('.foot'),
    dFootp: Array.prototype.map.call(svg.querySelectorAll('.footp'), e => e.getAttribute('d')).join(';'),
    dTFill: EL('tFill').getAttribute('d'), dTL: EL('tL').getAttribute('d'), dTR: EL('tR').getAttribute('d')
  };
})()`;

(async () => {
  const br = await _pw.chromium.launch({ channel: 'chrome' });
  const ctx = await br.newContext({ viewport: { width: 1440, height: 950 }, colorScheme: 'dark' });
  const pa = await ctx.newPage(), pd = await ctx.newPage();
  const errs = [];
  pa.on('pageerror', e => errs.push('APP ' + e.message));
  pd.on('pageerror', e => errs.push('DEMO ' + e.message));
  await pa.goto('file://' + FILE); await pa.waitForTimeout(1500);
  await pd.goto('file://' + DEMO); await pd.waitForTimeout(700);

  const CLAVES = ['marcas','nMarcas','trArm','trFore','trFing','trThumb','trLeg','trFoot','dFootp','dTFill','dTL','dTR'];
  const out = [];
  for (const [nom, escApp, escDemo] of ESCENAS) {
    let A, D;
    try { A = await pa.evaluate(APP(escApp)) } catch (e) { A = { err: e.message } }
    try { D = await pd.evaluate(DEM(escDemo)) } catch (e) { D = { err: e.message } }
    const difs = [];
    if (A.err || D.err) difs.push('ERR app=' + A.err + ' demo=' + D.err);
    else {
      for (const k of CLAVES) if (String(A[k]) !== String(D[k]))
        difs.push(k + ': app=' + String(A[k]).slice(0, 90) + ' || demo=' + String(D[k]).slice(0, 90));
      for (const k of Object.keys(D.cur || {}))
        if (Math.abs((A.cur || {})[k] - D.cur[k]) > 1e-6) difs.push('cur.' + k + ': ' + A.cur[k] + ' vs ' + D.cur[k]);
    }
    out.push({ escena: nom, igual: difs.length === 0, nMarcasApp: A.nMarcas, nMarcasDemo: D.nMarcas,
      alt: A.alt, difs: difs.slice(0, 4) });
  }
  await br.close();
  const ig = out.filter(x => x.igual).length;
  console.log(JSON.stringify({ escenas: out.length, iguales: ig, distintas: out.length - ig,
    detalle: out, errs }, null, 1));
  process.exit(0);
})();
