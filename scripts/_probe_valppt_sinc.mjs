#!/usr/bin/env node
/**
 * _probe_valppt_sinc.mjs - la SINCRONIA EN LOS DOS SENTIDOS de las cuatro valvulas operadas,
 * con GESTOS REALES, para la tanda VAL-PPT (2026-11-01).
 *
 * Es la condicion del commit 1b: «Sincronia en los dos sentidos y en las cuatro valvulas (el
 * defecto de POP-C-1 no puede reaparecer: usa el barrido de espejos)». POP-C-1 encontro que
 * `popCxVSync` tenia UN SOLO llamador -`popSync`- y que el barrido de espejos lo excluye a
 * proposito porque escribe campos del estudio, asi que el selector no seguia a Valvulas en
 * NINGUNA de las cuatro.
 *
 * DOS SENTIDOS, y los dos se miden con el gesto de verdad:
 *   A) Valvulas -> posoperatorio: se cambia la morfologia en su select y se espera el barrido
 *      de 220 ms. El selector del posoperatorio tiene que mostrar ese tipo.
 *   B) posoperatorio -> Valvulas: se elige el tipo en el selector del posoperatorio y se
 *      despacha su `change` real. La morfologia de Valvulas tiene que quedar con ese valor.
 *
 * DENOMINADOR: cada medicion imprime el valor de los DOS lados y el estado del selector. Un
 * selector que no existe, o una pestaña sin abrir, da cadena vacia de los dos lados y «sin
 * diferencia» sin que eso pruebe nada.
 *
 *   node scripts/_probe_valppt_sinc.mjs [--file /ruta/index.html] [--out /ruta/out.json]
 */
import fs from 'fs';
const A = process.argv.slice(2);
const g = (f, d) => { const i = A.indexOf(f); return (i >= 0 && A[i + 1]) ? A[i + 1] : d };
const FILE = g('--file', process.cwd() + '/index.html');
const OUTF = g('--out', '/tmp/valppt_sinc.json');
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let chromium = null;
for (const c of CAND) { try { chromium = (await import(c)).default.chromium; break } catch (e) {} }
if (!chromium) { console.error('SIN PLAYWRIGHT'); process.exit(2) }

/* Las cuatro valvulas con su dueño, su casilla, su selector y los tipos que se le piden. */
const V = [
  { k: 'ao', due: 'va_morf', chk: 'pop_cx_v_ao', sel: 'pop-esp-vao',
    tipos: ['Prótesis biológica', 'Prótesis mecánica', 'TAVI'], nativa: 'Calcificada' },
  { k: 'mi', due: 'vm_morf', chk: 'pop_cx_v_mi', sel: 'pop-esp-vmi',
    tipos: ['Prótesis biológica', 'Prótesis mecánica', 'Plastia mitral', 'TEER mitral'],
    nativa: 'Mixomatosa / Barlow' },
  { k: 'tr', due: 'vt_morf', chk: 'pop_cx_v_tr', sel: 'pop-esp-vtr',
    tipos: ['Prótesis biológica', 'Prótesis mecánica', 'Plastia tricuspídea', 'TEER tricuspídeo (T-TEER)'],
    nativa: 'Mixomatosa' },
  { k: 'pu', due: 'vp_morf', chk: 'pop_cx_v_pu', sel: 'pop-esp-vpu',
    tipos: ['Prótesis biológica', 'Prótesis mecánica'], nativa: 'Reumática' }
];

const PREP = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  /* La pestaña y el acordeon del posoperatorio, por su BOTON REAL: sin eso los selectores
     existen sin caja y el gesto de click no llega. El valor del select si se puede poner, pero
     la prueba tiene que pasar por donde pasa el medico. */
  /* ⚠️ LA PESTAÑA SE LLAMA hemodinamica Y LA SECCION pop-seccion, con toggleCard: es lo
     que _probe_popc_dibujo.mjs ya documenta. La primera version de esta sonda buscaba un boton
     con el texto «posoperatorio» y los cuatro selectores informaban 0x0 de ancho -el valor si se
     media bien, pero un «OK» sobre un selector sin caja no prueba que el medico pueda usarlo-. */
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
                  x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const bt = bq('showTab(' + Q + 'hemodinamica'); if (bt) bt.click();
  const sec = document.getElementById('pop-seccion');
  const abierta = () => !!(sec && sec.offsetParent && sec.getBoundingClientRect().height > 100);
  if (!abierta()) { const ba = bq('toggleCard(' + Q + 'pop-seccion'); if (ba) ba.click() }
  /* Las cuatro casillas de valvula operada, por su gesto. La cirugia valvular primero: el
     recuadro de las valvulas solo aparece con el token «valvular». */
  const cx = document.getElementById('pop_cx_valv');
  if (cx && !cx.checked) { cx.checked = true; cx.dispatchEvent(new Event('change', { bubbles: true })) }
  ['pop_cx_v_ao','pop_cx_v_mi','pop_cx_v_tr','pop_cx_v_pu'].forEach(id => {
    const c = document.getElementById(id);
    if (c && !c.checked) { c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })) }
  });
  try { if (typeof popCxVSync === 'function') popCxVSync() } catch (e) {}
  const out = {};
  ['pop-esp-vao','pop-esp-vmi','pop-esp-vtr','pop-esp-vpu'].forEach(id => {
    const e = document.getElementById(id);
    out[id] = e ? { existe: true, n: e.options.length,
                    caja: (e.getBoundingClientRect().width > 0) } : { existe: false };
  });
  out.cx_valvular = !!(cx && cx.checked);
  out.seccion_abierta = abierta();
  const wr = document.getElementById('pop_cx_valv_wrap');
  out.wrap = wr ? (wr.style.display || 'vacio') : 'NO EXISTE';
  return out;
})()`;

/* SENTIDO A - Valvulas escribe, el posoperatorio sigue. El gesto va en el DUEÑO. */
const SENT_A = `((c) => {
  const d = document.getElementById(c.due), s = document.getElementById(c.sel);
  if (!d || !s) return { err: 'falta ' + (d ? c.sel : c.due) };
  const antes = { due: d.value, sel: s.value };
  d.value = c.val;
  d.dispatchEvent(new Event('input', { bubbles: true }));
  d.dispatchEvent(new Event('change', { bubbles: true }));
  return { antes: antes, due_tras_gesto: d.value, sel_antes_barrido: s.value };
})(CFG)`;

const LEER_A = `((c) => {
  const d = document.getElementById(c.due), s = document.getElementById(c.sel);
  const tag = document.getElementById(c.sel + '-tag'), nota = document.getElementById(c.sel + '-nota');
  return { due: d ? d.value : 'n/d', sel: s ? s.value : 'n/d',
           tag: tag ? tag.textContent : 'n/d', nota: nota ? nota.textContent : 'n/d',
           papel: (typeof popCxValvTxt === 'function') ? popCxValvTxt() : 'n/d' };
})(CFG)`;

/* SENTIDO B - el posoperatorio escribe, Valvulas sigue. El gesto va en el SELECTOR. */
const SENT_B = `((c) => {
  const d = document.getElementById(c.due), s = document.getElementById(c.sel);
  if (!d || !s) return { err: 'falta' };
  /* La morfologia se deja en una NATIVA, que es el estado del que parte el medico. */
  d.value = c.nativa;
  d.dispatchEvent(new Event('change', { bubbles: true }));
  const nativaVista = (document.getElementById(c.sel + '-nota') || {}).textContent || '';
  const hay = Array.prototype.some.call(s.options, o => (o.value || o.text) === c.val);
  if (!hay) return { err: 'el selector NO ofrece ' + c.val,
                     ofrece: Array.prototype.map.call(s.options, o => o.value || o.text) };
  s.value = c.val;
  s.dispatchEvent(new Event('change', { bubbles: true }));
  return { nativa_antes: d.value === c.nativa ? c.nativa : d.value,
           aviso_nativa: nativaVista.slice(0, 120),
           sel_tras_gesto: s.value, due_tras_gesto: d.value,
           papel: (typeof popCxValvTxt === 'function') ? popCxValvTxt() : 'n/d' };
})(CFG)`;

/* Que marcar una valvula NUNCA escriba un tipo por omision. */
const SIN_DEFECTO = `(() => {
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  const cx = document.getElementById('pop_cx_valv');
  if (cx && !cx.checked) { cx.checked = true; cx.dispatchEvent(new Event('change', { bubbles: true })) }
  const out = { antes: {}, despues: {} };
  ['va_morf','vm_morf','vt_morf','vp_morf'].forEach(id => {
    out.antes[id] = (document.getElementById(id) || {}).value });
  ['pop_cx_v_ao','pop_cx_v_mi','pop_cx_v_tr','pop_cx_v_pu'].forEach(id => {
    const c = document.getElementById(id);
    if (c) { c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })) } });
  try { if (typeof popCxVSync === 'function') popCxVSync() } catch (e) {}
  ['va_morf','vm_morf','vt_morf','vp_morf'].forEach(id => {
    out.despues[id] = (document.getElementById(id) || {}).value });
  out.selectores = {};
  ['pop-esp-vao','pop-esp-vmi','pop-esp-vtr','pop-esp-vpu'].forEach(id => {
    out.selectores[id] = (document.getElementById(id) || {}).value });
  out.papel = (typeof popCxValvTxt === 'function') ? popCxValvTxt() : 'n/d';
  return out;
})()`;

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE, A: {}, B: {} };
try {
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([e.message.slice(0, 160)]) });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
  await pg.waitForTimeout(1500);
  OUT._denom = await pg.evaluate(PREP);
  console.log('denominador: ' + JSON.stringify(OUT._denom));

  for (const v of V) {
    for (const t of v.tipos) {
      const kk = v.k + ' <- ' + t;
      const cfg = JSON.stringify({ due: v.due, sel: v.sel, val: t, nativa: v.nativa });
      try {
        const pre = await pg.evaluate(SENT_A.replace('CFG', cfg));
        /* EL BARRIDO DE ESPEJOS son 220 ms; se espera 500 para no medir el arbol de antes. */
        await new Promise(r => setTimeout(r, 500));
        const post = await pg.evaluate(LEER_A.replace('CFG', cfg));
        OUT.A[kk] = { pre: pre, post: post,
          OK: post.sel === t, sigue_el_dato: post.sel === t ? 'SI' : 'NO' };
        console.log('  A ' + kk + ': selector=' + JSON.stringify(post.sel)
          + ' tag=' + JSON.stringify(post.tag) + ' -> ' + (post.sel === t ? 'OK' : 'FALLA'));
      } catch (e) { OUT.A[kk] = { _err: String(e).slice(0, 160) } }
    }
  }
  for (const v of V) {
    for (const t of v.tipos) {
      const kk = v.k + ' -> ' + t;
      const cfg = JSON.stringify({ due: v.due, sel: v.sel, val: t, nativa: v.nativa });
      try {
        const r = await pg.evaluate(SENT_B.replace('CFG', cfg));
        await new Promise(r2 => setTimeout(r2, 500));
        const post = await pg.evaluate(LEER_A.replace('CFG', cfg));
        OUT.B[kk] = { gesto: r, post: post, OK: r.due_tras_gesto === t && post.due === t };
        console.log('  B ' + kk + ': morfologia=' + JSON.stringify(r.due_tras_gesto)
          + ' tras barrido=' + JSON.stringify(post.due)
          + ' -> ' + (r.due_tras_gesto === t && post.due === t ? 'OK' : 'FALLA'));
      } catch (e) { OUT.B[kk] = { _err: String(e).slice(0, 160) } }
    }
  }
  OUT._sin_defecto = await pg.evaluate(SIN_DEFECTO);
  console.log('sin tipo por omision: ' + JSON.stringify(OUT._sin_defecto.despues)
    + ' selectores=' + JSON.stringify(OUT._sin_defecto.selectores));
  console.log('  papel: ' + JSON.stringify(OUT._sin_defecto.papel));
  await pg.close();
} catch (e) { OUT._err = String(e).slice(0, 250) }
try { await b.close() } catch (e) {}
const okA = Object.values(OUT.A).filter(x => x.OK).length, nA = Object.keys(OUT.A).length;
const okB = Object.values(OUT.B).filter(x => x.OK).length, nB = Object.keys(OUT.B).length;
OUT._resumen = 'sentido A (Valvulas -> posop): ' + okA + '/' + nA
             + ' | sentido B (posop -> Valvulas): ' + okB + '/' + nB;
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('\nRESULTADO ' + OUT._resumen);
console.log('escrito: ' + OUTF);
