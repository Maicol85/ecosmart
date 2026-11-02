#!/usr/bin/env node
/**
 * _probe_valppt_simb.mjs - LAS PIEZAS de los tres simbolos nuevos y SU LATIDO (VAL-PPT-4).
 *
 * El arnes del dibujo mide superposiciones y recortes; esto mide lo otro: que cada tipo prenda
 * EXACTAMENTE sus piezas y apague las de los demas, y que el simbolo LATA con la frecuencia
 * cargada y quede quieto sin ella.
 *
 * ⚠️ EL DENOMINADOR DEL LATIDO ES `_popEsq.visible` Y NO `rafId`: POP-C lo documenta: el bucle
 * deja de re-agendarse cuando el dibujo sale de la vista y NO limpia el id, asi que preguntar
 * por el id da un falso «si» sobre un dibujo quieto. Y hay que traer el esquema a la vista, o
 * su IntersectionObserver apaga el bucle y el latido se lee siempre en cero.
 *
 *   node scripts/_probe_valppt_simb.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || process.cwd() + '/index.html';

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
    el.checked = o; el.dispatchEvent(new Event('change',{bubbles:true})) };
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (x) {}
  const bt = bq('showTab(' + Q + 'hemodinamica'); if (bt) bt.click(); await W(300);
  const sec = EL('pop-seccion');
  const abierta = () => !!(sec && sec.offsetParent && sec.getBoundingClientRect().height > 100);
  if (!abierta()) { const ba = bq('toggleCard(' + Q + 'pop-seccion'); if (ba) ba.click() }
  await W(400);
  R.denomAbierta = abierta();
  S('peso','70'); S('talla','170');
  if (e.fc) S('hemo_fc', e.fc);
  Object.keys(e.s || {}).forEach(k => S(k, e.s[k]));
  (e.chk || []).forEach(id => C(id, true));
  await W(600);
  /* El esquema A LA VISTA: su IntersectionObserver apaga el bucle cuando no se ve, y entonces
     el latido se lee siempre en cero -que es la trampa que POP-B y POP-C ya pagaron-. */
  const svg = document.querySelector('[data-pop-esq-svg], #pop-esq svg, #pop-esq-svg');
  const cont = EL('pop-esq') || (svg && svg.parentNode);
  if (cont && cont.scrollIntoView) cont.scrollIntoView({ block: 'center' });
  await W(700);
  R.visible = (typeof _popEsq === 'object' && _popEsq) ? !!_popEsq.visible : 'no expuesto';
  /* LAS PIEZAS de la valvula que la escena toca. */
  const G = document.querySelector('[data-pop-esq="valv-' + e.k + '"]');
  if (!G) { R.sinGrupo = true; return R }
  R.grupoVisible = G.getAttribute('display') !== 'none';
  const vis = n => !!(n && n.getAttribute('display') !== 'none');
  const circ = G.querySelector('circle[r="10"]');
  const aro = Array.prototype.filter.call(G.querySelectorAll('path'),
              x => /^M-10 0A10/.test(x.getAttribute('d') || ''))[0];
  const stent = G.querySelector('rect[width="18"]');
  const malla = Array.prototype.filter.call(G.querySelectorAll('path'),
                x => /^M-9 -11L9 11/.test(x.getAttribute('d') || ''))[0];
  const clip = G.querySelector('rect[width="3.2"]');
  const ori = Array.prototype.slice.call(G.querySelectorAll('ellipse'));
  const velos = Array.prototype.filter.call(G.querySelectorAll('path'),
                x => /^M-?[78] 0/.test(x.getAttribute('d') || ''));
  const sop = Array.prototype.filter.call(G.querySelectorAll('circle'),
              x => x.getAttribute('r') === '2.2');
  R.piezas = {
    circulo: vis(circ), aro: vis(aro), stent: vis(stent), malla: vis(malla),
    clip: vis(clip), orificios: ori.filter(vis).length, velos: velos.filter(vis).length,
    soportes: sop.filter(vis).length,
    colorAnillo: circ ? circ.getAttribute('stroke') : null,
    dash: circ ? (circ.getAttribute('stroke-dasharray') || '') : null,
    colorVelo: velos[0] ? velos[0].getAttribute('stroke') : null
  };
  /* EL LATIDO: cuarenta muestras en 1,6 s. Se mira el HUECO de los velos -la d cambia- y,
     en el TEER, la opacidad de los orificios. */
  const muestras = { velo: {}, op: {} };
  for (let i = 0; i < 40; i++) {
    const d0 = velos[0] ? velos[0].getAttribute('d') : '';
    muestras.velo[d0] = 1;
    if (ori[0]) muestras.op[ori[0].getAttribute('fill-opacity')] = 1;
    await W(40);
  }
  R.latido = { formasDeVelo: Object.keys(muestras.velo).length,
               opacidadesDeOrificio: Object.keys(muestras.op).length };
  R.texto = (EL('pop-esq-txt') || {}).textContent || '';
  R.textoValv = (function(){ /* La fila se llama «valvulas operadas» en MINUSCULA dentro del texto del esquema: la
       primera version buscaba con mayuscula y la sonda informaba «(sin fila)» sobre una fila
       que si estaba. */
    const i = R.texto.toLowerCase().indexOf('válvulas operadas');
    return i < 0 ? '(sin fila)' : R.texto.slice(i, i + 170) })();
  return R;
})`;

const ESC = {
  plaMi:  { k:'mi', fc:'80', s:{ vm_morf:'Plastia mitral' },            chk:['pop_cx_valv','pop_cx_v_mi'] },
  teerMi: { k:'mi', fc:'80', s:{ vm_morf:'TEER mitral' },               chk:['pop_cx_valv','pop_cx_v_mi'] },
  plaTr:  { k:'tr', fc:'80', s:{ vt_morf:'Plastia tricuspídea' },       chk:['pop_cx_valv','pop_cx_v_tr'] },
  teerTr: { k:'tr', fc:'80', s:{ vt_morf:'TEER tricuspídeo (T-TEER)' }, chk:['pop_cx_valv','pop_cx_v_tr'] },
  tavi:   { k:'ao', fc:'80', s:{ va_morf:'TAVI' },                      chk:['pop_cx_valv','pop_cx_v_ao'] },
  mecMi:  { k:'mi', fc:'80', s:{ vm_morf:'Prótesis mecánica' },         chk:['pop_cx_valv','pop_cx_v_mi'] },
  bioMi:  { k:'mi', fc:'80', s:{ vm_morf:'Prótesis biológica' },        chk:['pop_cx_valv','pop_cx_v_mi'] },
  neutro: { k:'mi', fc:'80',                                            chk:['pop_cx_valv','pop_cx_v_mi'] },
  nativa: { k:'mi', fc:'80', s:{ vm_morf:'Mixomatosa / Barlow' },       chk:['pop_cx_valv','pop_cx_v_mi'] },
  sinFc:  { k:'mi', s:{ vm_morf:'TEER mitral' },                        chk:['pop_cx_valv','pop_cx_v_mi'] }
};

(async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome', headless: true });
  const pg = await b.newPage({ viewport: { width: 1440, height: 1200 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(2500);
  console.log('===== LAS PIEZAS DE LOS TRES SIMBOLOS Y SU LATIDO (VAL-PPT-4) =====');
  console.log('archivo:', FILE);
  for (const k of Object.keys(ESC)) {
    let R;
    try { R = await Promise.race([ pg.evaluate(new Function('return ' + CUERPO)(), ESC[k]),
      new Promise((_, rj) => setTimeout(() => rj(new Error('TIMEOUT')), 60000)) ]) }
    catch (e) { console.log('\n== ' + k + ' == FALLO: ' + e.message); continue }
    const P = R.piezas || {};
    console.log('\n== ' + k + ' ==  seccion=' + R.denomAbierta + ' bucle visible=' + R.visible
      + ' grupo=' + R.grupoVisible);
    console.log('   piezas: circulo=' + P.circulo + ' aro=' + P.aro + ' stent=' + P.stent
      + ' malla=' + P.malla + ' clip=' + P.clip + ' orificios=' + P.orificios
      + ' velos=' + P.velos + ' soportes=' + P.soportes);
    console.log('   color anillo=' + P.colorAnillo + ' dash=' + JSON.stringify(P.dash)
      + ' color velo=' + P.colorVelo);
    console.log('   latido: ' + R.latido.formasDeVelo + ' formas de velo en 40 muestras, '
      + R.latido.opacidadesDeOrificio + ' opacidades de orificio');
    console.log('   texto : ' + R.textoValv);
    if (R.errs && R.errs.length) console.log('   errs: ' + R.errs.slice(0,3).join(' ; '));
  }
  console.log('\nerrores de pagina: ' + (errs.length ? errs.join(' | ') : 'ninguno'));
  await b.close();
  process.exit(0);
})();
