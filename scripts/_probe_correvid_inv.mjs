#!/usr/bin/env node
/**
 * _probe_correvid_inv.mjs - INVENTARIO 1a: que dice hoy el informe y el EN SUMA con la plastia
 * o el TEER en la mitral y en la tricuspide, en tres situaciones (unico hallazgo, con otros
 * hallazgos, y con insuficiencia o estenosis cargada en esa valvula).
 *
 * Denominadores declarados: (a) la seccion de Valvulas tiene que estar abierta y el campo de
 * morfologia tiene que TOMAR el valor -si no, la escena no llega a la compuerta y el EN SUMA
 * sale igual por una razon que no es la que se mide-; (b) el cuerpo del informe tiene que
 * nombrar la valvula, porque la pasada de VAL-PPT-3 reusa LA LINEA DEL CUERPO: sin linea de
 * cuerpo no hay nada que empujar y un EN SUMA mudo no distingue las dos causas.
 *
 *   node scripts/_probe_correvid_inv.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || process.cwd() + '/index.html';

const CUERPO = `(async (e) => {
  const R = { errs: [] };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const W = ms => new Promise(r => setTimeout(r, ms));
  const S = (id, v) => { const el = EL(id); if (!el) { R.errs.push('NO EXISTE ' + id); return }
    el.value = v; el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true})) };
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (x) {}
  /* La marca de severidad fijada a mano SOBREVIVE a limpiarCampos: sin esto la escena
     siguiente hereda la pastilla de la anterior. */
  try { if (window.esqSevManual) Object.keys(window.esqSevManual).forEach(k => { delete window.esqSevManual[k] }) } catch (x) {}
  await W(250);
  S('peso','70'); S('talla','170'); S('sexo','M'); S('edad','60');
  Object.keys(e.s || {}).forEach(k => S(k, e.s[k]));
  await W(500);
  /* Los grados se fijan DESPUES del debounce: calcETE deja agendado un repintado que pisa
     im_grado, asi que fijarlos antes los pierde -lo documenta la tanda E-. */
  Object.keys(e.g || {}).forEach(k => S(k, e.g[k]));
  await W(700);
  R.denomMorf = { vm: String((EL('vm_morf')||{}).value || ''), vt: String((EL('vt_morf')||{}).value || '') };
  R.denomGrado = { im: String((EL('im_grado')||{}).value || ''), it: String((EL('it_grado')||{}).value || ''),
                   em: String((EL('em_grado')||{}).value || ''), et: String((EL('et_grado')||{}).value || '') };
  R.tipoCorto = { vm: (typeof popVTipoCorto === 'function') ? popVTipoCorto(R.denomMorf.vm) : 'n/d',
                  vt: (typeof popVTipoCorto === 'function') ? popVTipoCorto(R.denomMorf.vt) : 'n/d' };
  R.inf = {}; R.suma = {};
  for (const st of ['estandar','narrativo','conciso']) {
    try { if (typeof setEstiloInforme === 'function') setEstiloInforme(st) } catch (x) {}
    try { if (typeof generarInforme === 'function') generarInforme() } catch (x) { R.errs.push('gen ' + st + ': ' + x) }
    await W(120);
    R.inf[st] = String((EL('informe_texto')||{}).value || '');
    R.suma[st] = String((EL('en_suma')||{}).value || '');
  }
  try { if (typeof setEstiloInforme === 'function') setEstiloInforme('estandar') } catch (x) {}
  try { if (typeof generarInforme === 'function') generarInforme() } catch (x) {}
  return R;
})`;

/* Las cuatro situaciones que el 1a pide, por valvula y por tipo. «ajeno» = un hallazgo de OTRA
   valvula, que pone linea en el EN SUMA sin nombrar a esta: separa «no la nombra nunca» de
   «no la nombra cuando ya hay una linea suya». */
const ESC = {
  plaMi_solo:  { s:{ vm_morf:'Plastia mitral' } },
  teerMi_solo: { s:{ vm_morf:'TEER mitral' } },
  plaMi_ajeno: { s:{ vm_morf:'Plastia mitral', ai_diam:'46' } },
  teerMi_ajeno:{ s:{ vm_morf:'TEER mitral', ai_diam:'46' } },
  plaMi_im:    { s:{ vm_morf:'Plastia mitral' },  g:{ im_grado:'2' } },
  teerMi_im:   { s:{ vm_morf:'TEER mitral' },     g:{ im_grado:'2' } },
  teerMi_imSev:{ s:{ vm_morf:'TEER mitral' },     g:{ im_grado:'4' } },
  teerMi_em:   { s:{ vm_morf:'TEER mitral', em_gmedio:'7', avm_plan:'1.5' } },
  plaTr_solo:  { s:{ vt_morf:'Plastia tricuspídea' } },
  teerTr_solo: { s:{ vt_morf:'TEER tricuspídeo (T-TEER)' } },
  plaTr_it:    { s:{ vt_morf:'Plastia tricuspídea' },       g:{ it_grado:'2' } },
  teerTr_it:   { s:{ vt_morf:'TEER tricuspídeo (T-TEER)' }, g:{ it_grado:'4' } },
  teerTr_et:   { s:{ vt_morf:'TEER tricuspídeo (T-TEER)', et_gmedio:'7' } },
  combo:       { s:{ vm_morf:'Plastia mitral', vt_morf:'TEER tricuspídeo (T-TEER)' },
                 g:{ im_grado:'2', it_grado:'1' } },
  nativaMi:    { s:{ vm_morf:'Mixomatosa / Barlow' }, g:{ im_grado:'2' } },
  vacio:       { s:{} }
};

const lineas = t => String(t).split('\n').map(x => x.trim()).filter(Boolean);
const dePest = (t, pal) => lineas(t).filter(l => pal.some(p => l.indexOf(p) >= 0));

(async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome', headless: true });
  const pg = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const errs = [];
  pg.on('pageerror', x => errs.push('PAGE ' + x.message));
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(2500);
  console.log('===== INVENTARIO 1a - EL EN SUMA DE LA PLASTIA Y EL TEER =====');
  console.log('archivo:', FILE);
  for (const k of Object.keys(ESC)) {
    let R;
    try { R = await Promise.race([ pg.evaluate(new Function('return ' + CUERPO)(), ESC[k]),
      new Promise((_, rj) => setTimeout(() => rj(new Error('TIMEOUT')), 60000)) ]) }
    catch (x) { console.log('\n== ' + k + ' == FALLO: ' + x.message); continue }
    console.log('\n===== ' + k + ' =====');
    console.log('  denom morf: vm=' + JSON.stringify(R.denomMorf.vm) + ' vt=' + JSON.stringify(R.denomMorf.vt)
      + '  tipoCorto: vm=' + JSON.stringify(R.tipoCorto.vm) + ' vt=' + JSON.stringify(R.tipoCorto.vt));
    console.log('  denom grado: ' + JSON.stringify(R.denomGrado));
    const PAL = ['mitral','Mitral','VM','tricúspide','tricuspídea','VT','IM ','IT ','EM ','ET ','TEER','plastia','Plastia'];
    for (const st of ['estandar','narrativo','conciso']) {
      const lc = dePest(R.inf[st], PAL);
      console.log('  CUERPO/' + st + ' (' + R.inf[st].length + ' car): '
        + (lc.length ? lc.map(x => '\n     > ' + x).join('') : '(ninguna linea de estas valvulas)'));
    }
    console.log('  --- EN SUMA ---');
    for (const st of ['estandar','narrativo','conciso']) {
      console.log('  SUMA/' + st + ' (' + R.suma[st].length + ' car):'
        + lineas(R.suma[st]).map(x => '\n     | ' + x).join(''));
    }
    if (R.errs && R.errs.length) console.log('  errs: ' + R.errs.slice(0,4).join(' ; '));
  }
  console.log('\nerrores de pagina: ' + (errs.length ? errs.join(' | ') : 'ninguno'));
  await b.close();
  process.exit(0);
})();
