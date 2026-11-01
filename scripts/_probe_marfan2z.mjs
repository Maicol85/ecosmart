#!/usr/bin/env node
/**
 * _probe_marfan2z.mjs — el Z de la raiz aortica (MARFAN-2, commit 4).
 *
 * Mide: que el campo exista y sea del estudio; el ROUND-TRIP completo -guardar, reabrir y el
 * blob del recolector-; que NO tenga columna de Excel; que las reglas 1, 2, 3 y 7 lo lean,
 * incluso sobre un estudio ARCHIVADO; los dos cortes de edad de la regla 7; y que el globo
 * declare que el Z calculado no esta disponible.
 *
 * DENOMINADOR: cada bloque imprime lo que conto ANTES de afirmar nada. Un campo que no existe
 * y un campo vacio dan los dos «sin dato», y sin denominador no se distinguen.
 *
 *   node scripts/_probe_marfan2z.mjs [--file <html>]
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const MEDIR = `(async () => {
  const R = { errs: [] };
  const EL = id => document.getElementById(id);
  const S = (id, v) => { const e = EL(id); if (!e) return false;
    if (e.type === 'checkbox') e.checked = (v === 1 || v === true); else e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return true };
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}

  /* ── DENOMINADOR: el campo existe y es del estudio ───────────────────────── */
  const z = EL('mfs_z_raiz');
  R.campo = z ? { tag: z.tagName, type: z.type, step: z.step, id: z.id,
                  enGuarderia: !!(z.closest && z.closest('#mfs-campos')) } : 'NO EXISTE';
  R.esDelEstudio = (typeof _noEsDelEstudio === 'function') ? (_noEsDelEstudio('mfs_z_raiz') ? 'NO' : 'si') : '?';
  /* decimales de verdad */
  S('mfs_z_raiz', '2.4');
  R.aceptaDecimal = z ? String(z.value) : 'NO';

  /* ── EL RECOLECTOR: el blob que se guarda ────────────────────────────────── */
  R.blob = (function () {
    const b = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
      if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
      if (e.type === 'checkbox') b[e.id + '__chk'] = e.checked ? '1' : '0'; else b[e.id] = e.value });
    return { n: Object.keys(b).length, z: b.mfs_z_raiz === undefined ? 'AUSENTE' : b.mfs_z_raiz };
  })();

  /* ── SIN COLUMNA DE EXCEL ────────────────────────────────────────────────── */
  R.excel = (function () { try {
    const b = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
      if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
      if (e.type === 'checkbox') b[e.id + '__chk'] = e.checked ? '1' : '0'; else b[e.id] = e.value });
    const f = _labExcelRow({ campos: b });
    const ks = Object.keys(f);
    return { n: ks.length, conZ: ks.filter(k => /\\bZ\\b|z de la ra/i.test(k)),
             conMfs: ks.filter(k => /mfs/i.test(k)) };
  } catch (e) { return { err: e.message } } })();

  /* ── ROUND-TRIP: guardar y reabrir ───────────────────────────────────────── */
  S('nombre', 'Prueba Z MARFAN2'); S('ci', '59100'); S('peso', '70'); S('talla', '170');
  S('sexo', 'M'); S('edad', '34');
  S('mfs_z_raiz', '2.4'); S('mfs_ectopia_lentis', 'si'); S('mfs_sin_otros', 'si');
  R.rt = { guardado: 'NO', leido: 'NO', reabierto: 'NO' };
  /* ATENCION, y esto costo una corrida: guardarInforme EXIGE nombre o documento -sin eso hace
     toast y devuelve false-, la PRIMERA vez muestra la card de severidades valvulares y el
     guardado real cuelga de confirmarla con el boton rev-confirm, y con _ettEditandoId puesto
     sale OTRO modal. Es el mismo helper que usa la suite. Y quien reabre es
     cargarEstudioPorId, no editarInforme. */
  try {
    window._ettEditandoId = null;
    const antes = new Set(((typeof getInformes === 'function') ? getInformes() : []).map(i => i.estudioId));
    const res = await new Promise(function (ok) {
      const rel = setTimeout(function () { ok({ ok: false, porReloj: true }) }, 10000);
      const fin2 = function (v) { clearTimeout(rel);
        const inf = (typeof getInformes === 'function') ? getInformes() : [];
        const nue = inf.filter(i => !antes.has(i.estudioId))[0];
        ok({ ok: v === true, estudioId: nue ? nue.estudioId : null }) };
      try { guardarInforme(fin2) } catch (e) { clearTimeout(rel); ok({ ok: false, err: e.message }) }
      const cf = document.getElementById('rev-confirm'); if (cf) cf.click();
    });
    await new Promise(r => setTimeout(r, 700));
    R.rt.guardado = res.ok ? 'si' : ('NO ' + JSON.stringify(res));
    R.rt.estudioId = res.estudioId;
    const inf = (typeof getInformes === 'function') ? getInformes() : [];
    const ult = inf.filter(i => i.estudioId === res.estudioId)[0] || inf[inf.length - 1];
    R.rt.nInformes = inf.length;
    R.rt.leido = ult && ult.campos ? String(ult.campos.mfs_z_raiz) : 'NO HAY CAMPOS';
    R.rt.otrosRasgos = ult && ult.campos
      ? { ectopia: String(ult.campos.mfs_ectopia_lentis), sinOtros: String(ult.campos.mfs_sin_otros) } : 'NO';
    /* las reglas leidas SOBRE EL REGISTRO, que es lo que MARFAN-1 no podia */
    R.rt.reglasSobreRegistro = (ult && typeof mfsReglas === 'function')
      ? mfsReglas(ult.campos).reglas.map(x => x.n + ':' + x.estado).join(' ') : 'NO';
    R.rt.zSobreRegistro = (ult && typeof mfsZ === 'function') ? mfsZ(ult.campos) : 'NO';
    /* reabrir en el formulario, por la funcion real */
    if (typeof limpiarCampos === 'function') limpiarCampos(true);
    await new Promise(r => setTimeout(r, 350));
    R.rt.trasLimpiar = (EL('mfs_z_raiz') || {}).value;
    if (ult && typeof cargarEstudioPorId === 'function') {
      cargarEstudioPorId(ult.estudioId); await new Promise(r => setTimeout(r, 1000));
    }
    R.rt.reabierto = (EL('mfs_z_raiz') || {}).value;
    /* y se BORRA lo que se guardo: un estudio que sobrevive cambia el denominador de
       cualquier medicion posterior */
    try { if (typeof CeiboStore !== 'undefined')
      await CeiboStore.setLocal(getInformes().filter(i => i.estudioId !== res.estudioId)) } catch (e) {}
  } catch (e) { R.errs.push('rt: ' + e.message) }

  /* ── LAS REGLAS LEEN EL Z (4d) ───────────────────────────────────────────── */
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  await new Promise(r => setTimeout(r, 250));
  R.reglas = {};
  const esc = [
    ['z vacio',            { }],
    ['Z 2.4 + EL + sinOtros', { mfs_z_raiz: '2.4', mfs_ectopia_lentis: 'si', mfs_sin_otros: 'si' }],
    ['Z 1.5 + EL + sinOtros', { mfs_z_raiz: '1.5', mfs_ectopia_lentis: 'si', mfs_sin_otros: 'si', mfs_diseccion_raiz: 'no' }],
    ['Z 2.4 + FBN1 causal',   { mfs_z_raiz: '2.4', mfs_fbn1_causal: 'si' }],
    ['Z 2.4 + score 7',       { mfs_z_raiz: '2.4', mfs_sin_otros: 'si', mfs_muneca_pulgar: 'ambos',
                                mfs_pectus: 'carinatum', mfs_neumotorax: 1 }],
    ['R7 edad 25 Z 2.4 + FH', { mfs_z_raiz: '2.4', mfs_historia_familiar: 'si', mfs_sin_otros: 'si', edad: '25' }],
    ['R7 edad 15 Z 2.4 + FH', { mfs_z_raiz: '2.4', mfs_historia_familiar: 'si', mfs_sin_otros: 'si', edad: '15' }],
    ['R7 edad 15 Z 3.1 + FH', { mfs_z_raiz: '3.1', mfs_historia_familiar: 'si', mfs_sin_otros: 'si', edad: '15' }],
    ['R7 edad 19 Z 2.0 + FH', { mfs_z_raiz: '2.0', mfs_historia_familiar: 'si', mfs_sin_otros: 'si', edad: '19' }],
    ['R7 edad 20 Z 2.0 + FH', { mfs_z_raiz: '2.0', mfs_historia_familiar: 'si', mfs_sin_otros: 'si', edad: '20' }],
    ['diseccion sin Z + FH',  { mfs_diseccion_raiz: 'si', mfs_historia_familiar: 'si', mfs_sin_otros: 'si', edad: '15' }]
  ];
  for (const e of esc) {
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (x) {}
    S('peso', '70'); S('talla', '170'); S('sexo', 'M');
    Object.keys(e[1]).forEach(k => S(k, e[1][k]));
    await new Promise(r => setTimeout(r, 90));
    const rr = mfsReglas();
    R.reglas[e[0]] = { z: mfsZ(), estados: rr.reglas.map(x => x.n + ':' + x.estado).join(' ') };
  }

  /* ── EL GLOBO DICE QUE EL CALCULADO NO ESTA ──────────────────────────────── */
  R.globoZ = (function () {
    try { const e = VINFO['mfs-aparte'];
      const t = String(e.intro || '');
      return { tiene: t.indexOf('Z calculado: no disponible') >= 0 ? 'si' : 'NO',
               mencionaRef13: t.indexOf('referencia 13') >= 0 ? 'si' : 'NO', n: t.length };
    } catch (x) { return { err: x.message } } })();
  /* y que NINGUNA funcion calcule un Z */
  R.sinCalculo = Object.keys(window).filter(k => /^mfsZCalc|^_mfsZCalc|zCalculado/i.test(k));
  return R;
})()`;

const b = await _pw.chromium.launch({ channel: 'chrome' });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
const pg = await ctx.newPage();
const errs = [];
pg.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)) });
pg.on('pageerror', e => errs.push('PAGE: ' + e.message.slice(0, 140)));
pg.on('dialog', d => d.accept());
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
await pg.waitForTimeout(1300);
let r;
try { r = await Promise.race([pg.evaluate(MEDIR),
  new Promise((_, rj) => setTimeout(() => rj(new Error('reloj')), 120000))]); }
catch (e) { r = { errs: ['EVAL: ' + e.message] }; }
r.consola = errs;
console.log(JSON.stringify({ file: FILE, r }, null, 1));
await b.close();
