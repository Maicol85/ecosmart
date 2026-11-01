#!/usr/bin/env node
/**
 * _probe_marfan1reglas.mjs — las siete reglas del Box 1 (MARFAN-1, commit 2).
 *
 * Tabla de casos: CUMPLE, NO CUMPLE y SIN DATO de cada una de las siete; el asterisco en 1, 3,
 * 6 y 7 y su ausencia en 2, 4 y 5; la edad en la regla 7 con sus dos cortes y sus dos motivos
 * de «sin dato»; y las dos variantes de FBN1 como INDEPENDIENTES -que una no infiera la otra-.
 *
 * ATENCION: el Z vive en la TARJETA y no es un campo guardado, asi que la tarjeta tiene que
 * estar ABIERTA para que las reglas que dependen del Z puedan evaluarse. Sin eso, las siete dan
 * «sin dato» y el cero se lee como que la logica no anda.
 *
 *   node scripts/_probe_marfan1reglas.mjs [--file <html>]
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const MEDIR = `(async () => {
  const R = { errs: [], casos: [] };
  const EL = id => document.getElementById(id);
  const S = (id, v) => { const e = EL(id); if (!e) { R.errs.push('NO ' + id); return }
    if (e.type === 'checkbox') e.checked = (v === 1 || v === true); else e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })) };
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  critAbrir('marfan'); await new Promise(r => setTimeout(r, 200));
  const Z = () => document.querySelector('#crit-cuerpo [data-mf-z]');
  R.hayZ = !!Z();
  const setZ = v => { const e = Z(); if (!e) return; e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true })) };

  /* el escenario se arma desde CERO cada vez: sin esto, un valor de la escena anterior
     sobrevive y la tabla de casos mide otra cosa */
  const esc = (o) => {
    ['mfs_ectopia_lentis','mfs_historia_familiar','mfs_fbn1_causal','mfs_fbn1_ao',
     'mfs_sin_otros','mfs_diseccion_raiz'].forEach(k => S(k, ''));
    (typeof MFS_SCORE !== 'undefined' ? MFS_SCORE : []).forEach(r => {
      if (r.t === 'sel') S(r.c, ''); else S(r.c, 0) });
    S('edad', ''); setZ('');
    Object.keys(o || {}).forEach(k => { if (k === '_z') setZ(o[k]); else S(k, o[k]) });
  };
  /* nueve rasgos que suman 9: muneca+pulgar 3, carinatum 2, neumotorax 2, estrias 1, miopia 1 */
  const score9 = { mfs_muneca_pulgar: 'ambos', mfs_pectus: 'carinatum', mfs_neumotorax: 1,
                   mfs_estrias: 1, mfs_miopia: 1 };
  const caso = (nom, campos, mirar) => {
    esc(campos);
    const r = mfsReglas();
    const g = r.reglas.filter(x => x.n === mirar)[0];
    R.casos.push({ caso: nom, regla: mirar, estado: g.estado, por: g.por,
      score: r.score.pts, edad: r.edad, z: r.z,
      todas: r.reglas.map(x => x.n + ':' + x.estado).join(' ') });
    return g;
  };

  /* ── LAS SIETE: cumple, no cumple, sin dato ─────────────────────────────────── */
  caso('R1 cumple', { _z: '2.4', mfs_ectopia_lentis: 'si', mfs_sin_otros: 'si' }, 1);
  caso('R1 no (sin EL)', { _z: '2.4', mfs_ectopia_lentis: 'no', mfs_sin_otros: 'si' }, 1);
  caso('R1 sin dato (falta EL)', { _z: '2.4', mfs_sin_otros: 'si' }, 1);
  caso('R1 sin dato (falta el asterisco)', { _z: '2.4', mfs_ectopia_lentis: 'si' }, 1);
  caso('R1 no (hay rasgos de otro sindrome)', { _z: '2.4', mfs_ectopia_lentis: 'si', mfs_sin_otros: 'no' }, 1);

  caso('R2 cumple', { _z: '2.4', mfs_fbn1_causal: 'si' }, 2);
  caso('R2 no (FBN1 no causal)', { _z: '2.4', mfs_fbn1_causal: 'no' }, 2);
  caso('R2 sin dato (falta el Z)', { mfs_fbn1_causal: 'si' }, 2);
  caso('R2 cumple SIN el asterisco contestado', { _z: '2.4', mfs_fbn1_causal: 'si' }, 2);

  caso('R3 cumple', Object.assign({ _z: '2.4', mfs_sin_otros: 'si' }, score9), 3);
  caso('R3 no (score 5)', { _z: '2.4', mfs_sin_otros: 'si', mfs_muneca_pulgar: 'ambos', mfs_neumotorax: 1 }, 3);
  caso('R3 sin dato (falta el Z)', Object.assign({ mfs_sin_otros: 'si' }, score9), 3);

  caso('R4 cumple', { mfs_ectopia_lentis: 'si', mfs_fbn1_ao: 'si' }, 4);
  caso('R4 no (FBN1 sin Ao conocida)', { mfs_ectopia_lentis: 'si', mfs_fbn1_ao: 'no' }, 4);
  caso('R4 sin dato', { mfs_ectopia_lentis: 'si' }, 4);

  caso('R5 cumple', { mfs_ectopia_lentis: 'si', mfs_historia_familiar: 'si' }, 5);
  caso('R5 no (sin FH)', { mfs_ectopia_lentis: 'si', mfs_historia_familiar: 'no' }, 5);
  caso('R5 sin dato', { mfs_ectopia_lentis: 'si' }, 5);

  caso('R6 cumple', Object.assign({ mfs_historia_familiar: 'si', mfs_sin_otros: 'si' }, score9), 6);
  caso('R6 no (score 5)', { mfs_historia_familiar: 'si', mfs_sin_otros: 'si', mfs_muneca_pulgar: 'ambos', mfs_neumotorax: 1 }, 6);
  caso('R6 sin dato (falta el asterisco)', Object.assign({ mfs_historia_familiar: 'si' }, score9), 6);

  /* ── LA REGLA 7: los dos cortes por edad y los dos motivos de «sin dato» ─────── */
  caso('R7 cumple adulto Z 2.0', { _z: '2.0', edad: '34', mfs_historia_familiar: 'si', mfs_sin_otros: 'si' }, 7);
  caso('R7 no adulto Z 1.9', { _z: '1.9', edad: '34', mfs_historia_familiar: 'si', mfs_sin_otros: 'si', mfs_diseccion_raiz: 'no' }, 7);
  caso('R7 no menor Z 2.5', { _z: '2.5', edad: '14', mfs_historia_familiar: 'si', mfs_sin_otros: 'si', mfs_diseccion_raiz: 'no' }, 7);
  caso('R7 cumple menor Z 3.0', { _z: '3.0', edad: '14', mfs_historia_familiar: 'si', mfs_sin_otros: 'si' }, 7);
  caso('R7 borde: 20 anios exactos Z 2.0', { _z: '2.0', edad: '20', mfs_historia_familiar: 'si', mfs_sin_otros: 'si' }, 7);
  caso('R7 borde: 19 anios Z 2.0', { _z: '2.0', edad: '19', mfs_historia_familiar: 'si', mfs_sin_otros: 'si', mfs_diseccion_raiz: 'no' }, 7);
  caso('R7 SIN DATO: falta la edad', { _z: '2.4', mfs_historia_familiar: 'si', mfs_sin_otros: 'si' }, 7);
  caso('R7 SIN DATO: falta el valor del Z', { edad: '34', mfs_historia_familiar: 'si', mfs_sin_otros: 'si' }, 7);
  caso('R7 cumple por DISECCION sin Z ni edad', { mfs_diseccion_raiz: 'si', mfs_historia_familiar: 'si', mfs_sin_otros: 'si' }, 7);

  /* ── LAS DOS FBN1 SON INDEPENDIENTES ────────────────────────────────────────── */
  esc({ _z: '2.4', mfs_fbn1_causal: 'si', mfs_ectopia_lentis: 'si' });
  R.fbn1 = { soloCausal: mfsReglas().reglas.map(x => x.n + ':' + x.estado).join(' ') };
  esc({ _z: '2.4', mfs_fbn1_ao: 'si', mfs_ectopia_lentis: 'si' });
  R.fbn1.soloAo = mfsReglas().reglas.map(x => x.n + ':' + x.estado).join(' ');

  /* ── LA DISECCION HACE «Ao» SIN MIRAR EL Z ──────────────────────────────────── */
  esc({ mfs_diseccion_raiz: 'si', mfs_ectopia_lentis: 'si', mfs_sin_otros: 'si' });
  R.diseccion = { r1: mfsReglas().reglas[0].estado, por: mfsReglas().reglas[0].por };

  /* ── CONTROL NEGATIVO: todo vacio = las siete en «sin dato», ninguna cumple ──── */
  esc({});
  const v = mfsReglas();
  R.vacio = { todas: v.reglas.map(x => x.n + ':' + x.estado).join(' '), alguna: v.algunaCumple };

  /* ── EL TEXTO FIJO Y QUE NADA DE ESTO LLEGUE AL PAPEL ────────────────────────── */
  const cu = document.getElementById('crit-cuerpo');
  R.textoFijo = cu ? (String(cu.textContent).indexOf('no es un diagnóstico') >= 0) : 'NO';
  R.nFilasReglas = document.querySelectorAll('#mfs-reglas .mfs-reg').length;
  R.pintadas = Array.prototype.map.call(document.querySelectorAll('#mfs-reglas .mfs-reg'),
    e => String(e.className).replace('mfs-reg mfs-reg-', '')).join(' ');
  return R;
})()`;

(async () => {
  const br = await _pw.chromium.launch({ channel: 'chrome' });
  const ctx = await br.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONS ' + m.text().slice(0, 140)) });
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(1400);
  let r;
  try { r = await pg.evaluate(MEDIR) } catch (e) { r = { fatal: e.message } }
  r.errsPagina = errs;
  console.log(JSON.stringify(r, null, 1));
  await br.close();
  process.exit(0);
})();
