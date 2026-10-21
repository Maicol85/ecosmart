#!/usr/bin/env node
/**
 * _probe_haorta.mjs - la sonda del trabajo «H»: la AORTA (2026-10-21).
 *
 * Mide lo RENDERIZADO en los DOS motores: las citas por sindrome, los umbrales con su clase y
 * nivel, la coartacion por gradiente MEDIO, los textos de la VAB y el motor de Evidencia de
 * aorta con su cuestionario. A/B de solo lectura con --file.
 *
 *   node scripts/_probe_haorta.mjs --solo citas
 *   node scripts/_probe_haorta.mjs --solo ctrl --file /tmp/head_H.html
 *   node scripts/_probe_haorta.mjs --solo maqueta --motor chromium
 *   node scripts/_probe_haorta.mjs --solo captura --dest /tmp/hcap
 *
 * ADVERTENCIA: sin acentos graves dentro del template de la sonda, y sin \s ni \n crudos
 * (se cocinan dentro del template literal: van con doble barra EN EL ARCHIVO).
 */
const CANDIDATAS = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
                    '/tmp/pw/node_modules/playwright/index.js',
                    '/usr/local/lib/node_modules/playwright/index.js',
                    process.env.HOME + '/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CANDIDATAS) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CANDIDATAS }, null, 1));
  process.exit(2); }
const { chromium, webkit } = _pw;
import fs from 'fs';
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const SOLO = (arg('--solo') || 'citas').split(',').map(s => s.trim());
const FILE = arg('--file') || (RAIZ + '/index.html');
const DEST = arg('--dest') || '/tmp/hcap';
const MOTOR = arg('--motor');
const OUT = {};

/* El aviso legal VUELVE a mitad de corrida: se despeja antes de CADA grupo, no una vez. */
const PRELUDIO = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  try { localStorage.setItem('ett_view_mode','avanzado') } catch (e) {}
  if (typeof applyViewMode === 'function') { try { applyViewMode() } catch (e) {} }
  return true;
})()`;

/* ══ (a) LAS CITAS POR SINDROME ═══════════════════════════════════════════════════════════
   Se mide el TEXTO que la pantalla y el informe publican, no la constante. */
const CITAS = `(() => {
  const out = { consola: [] };
  const esc = (o) => { __t_set_all(o);
    const r = (typeof marfanEstado === 'function') ? marfanEstado() : null;
    if (typeof marfanSync === 'function') { try { marfanSync() } catch (e) {} }
    const box = document.getElementById('marfan-resultado');
    const hint = document.getElementById('marfan-fr-hint');
    return { clave: r && r.clave, txt: (r && r.txt) || '',
             pantalla: box ? (box.textContent || '').replace(/[ ]+/g, ' ').trim() : 'SIN BOX',
             hint: hint ? (hint.textContent || '').trim() : 'SIN HINT' };
  };
  function __t_set_all(o) {
    if (typeof limpiarCampos === 'function') { try { limpiarCampos() } catch (e) {} }
    Object.keys(o).forEach(k => { const e = document.getElementById(k);
      if (!e) { out.consola.push('SIN CAMPO ' + k); return }
      e.value = o[k];
      try { e.dispatchEvent(new Event('input', { bubbles:true })) } catch (x) {}
      try { e.dispatchEvent(new Event('change', { bubbles:true })) } catch (x) {}
    });
  }
  out.marfan50  = esc({ marfan_sindrome:'marfan', marfan_ao_seno:'50' });
  out.marfan45fr= esc({ marfan_sindrome:'marfan', marfan_ao_seno:'45', marfan_factores_riesgo:'si' });
  out.lds46     = esc({ marfan_sindrome:'lds',    marfan_ao_seno:'46' });
  out.lds45     = esc({ marfan_sindrome:'lds',    marfan_ao_seno:'45' });
  out.lds41fr   = esc({ marfan_sindrome:'lds',    marfan_ao_seno:'41', marfan_factores_riesgo:'si' });
  out.turner24fr= esc({ marfan_sindrome:'turner', marfan_ita:'24', marfan_factores_riesgo:'si' });
  out.turner26  = esc({ marfan_sindrome:'turner', marfan_ita:'26', marfan_factores_riesgo:'no' });
  out.ehat55    = esc({ marfan_sindrome:'ehat',   marfan_ao_seno:'55' });
  out.ehat50fr  = esc({ marfan_sindrome:'ehat',   marfan_ao_seno:'50', marfan_factores_riesgo:'si' });
  out.ehat50no  = esc({ marfan_sindrome:'ehat',   marfan_ao_seno:'50', marfan_factores_riesgo:'no' });
  out.otro42    = esc({ marfan_sindrome:'otro',   marfan_ao_seno:'42' });
  out.eds46     = esc({ marfan_sindrome:'eds',    marfan_ao_seno:'46' });
  /* El manual: se cuentan las citas de cada tabla en el bloque de aorta de ECO_AYUDA. */
  const ay = (typeof window.ECO_AYUDA === 'object') ? 'EN WINDOW' : 'CONST DE MODULO';
  out.ayudaEn = ay;
  out.htmlTablas = ['Tabla 62','Tabla 58','Tabla 66','Tabla 38','Tabla 68']
    .map(t => t + '=' + (document.documentElement.innerHTML.split(t).length - 1)).join(' ');
  return out;
})()`;

/* ══ (b) EL INFORME Y EL EN SUMA de la aortopatia ══════════════════════════════════════════ */
const INFORME = `(() => {
  const esc = (o) => {
    if (typeof limpiarCampos === 'function') { try { limpiarCampos() } catch (e) {} }
    Object.keys(o).forEach(k => { const e = document.getElementById(k); if (!e) return;
      e.value = o[k];
      try { e.dispatchEvent(new Event('input', { bubbles:true })) } catch (x) {}
      try { e.dispatchEvent(new Event('change', { bubbles:true })) } catch (x) {} });
    const cb = document.getElementById('marfan_incluir_chk');
    if (cb && !cb.checked) { cb.checked = true;
      try { cb.dispatchEvent(new Event('change', { bubbles:true })) } catch (x) {} }
    if (typeof generarInforme === 'function') { try { generarInforme() } catch (e) {} }
    const inf = (document.getElementById('informe_texto')||{}).value || '';
    const sum = (document.getElementById('en_suma')||{}).value || '';
    const li = inf.split(String.fromCharCode(10)).filter(x => x.indexOf('ortopat') > -1 ||
      x.indexOf('Marfan') > -1 || x.indexOf('Turner') > -1 || x.indexOf('Loeys') > -1 ||
      x.indexOf('Ehlers') > -1);
    const ls = sum.split(String.fromCharCode(10)).filter(x => x.indexOf('ortopat') > -1);
    return { inf: li.join(' // '), suma: ls.join(' // ') };
  };
  return {
    marfan50:   esc({ marfan_sindrome:'marfan', marfan_ao_seno:'50' }),
    ehat50fr:   esc({ marfan_sindrome:'ehat',   marfan_ao_seno:'50', marfan_factores_riesgo:'si' }),
    turner24fr: esc({ marfan_sindrome:'turner', marfan_ita:'24', marfan_factores_riesgo:'si' }),
    lds46:      esc({ marfan_sindrome:'lds',    marfan_ao_seno:'46' })
  };
})()`;

/* ══ (c) CONTROL: lo que esta tanda NO puede mover ═════════════════════════════════════════ */
const CTRL = `(() => {
  const r = {};
  if (typeof limpiarCampos === 'function') { try { limpiarCampos() } catch (e) {} }
  if (typeof generarInforme === 'function') { try { generarInforme() } catch (e) {} }
  r.infVacio  = (document.getElementById('informe_texto')||{}).value || '';
  r.sumaVacio = (document.getElementById('en_suma')||{}).value || '';
  try { const f = (typeof _labExcelRow === 'function') ? _labExcelRow({ campos:{}, fecha:'2026-01-01', id:'x' }) : null;
        r.nCols = f ? Object.keys(f).length : null;
        r.claves = f ? Object.keys(f).join('|') : null } catch (e) { r.excelErr = String(e) }
  r.nCampos = (() => { const o = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
      if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
      o[e.id] = e.type === 'checkbox' ? (e.checked ? '1' : '') : (e.value || '') });
    return Object.keys(o).length })();
  r.idsCampos = (() => { const a = [];
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
      if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return; a.push(e.id) });
    return a.sort().join('|') })();
  /* Un escenario AJENO a la aorta: valvulas, diastolica, VD y TEP. */
  const pon = (o) => Object.keys(o).forEach(k => { const e = document.getElementById(k); if (!e) return;
    e.value = o[k];
    try { e.dispatchEvent(new Event('input', { bubbles:true })) } catch (x) {}
    try { e.dispatchEvent(new Event('change', { bubbles:true })) } catch (x) {} });
  pon({ onda_e:'90', onda_a:'40', tde:'180', eprima_sep:'5', eprima_lat:'7', ai_vol:'70',
        peso:'80', talla:'180', fevi:'55', vmax_it:'2.9', tapse:'18', vd_bas:'40',
        im_vc:'7', ea_dtsvi:'20', itv_tsvi:'20', vmax_ao:'4.2' });
  if (typeof generarInforme === 'function') { try { generarInforme() } catch (e) {} }
  r.infAjeno  = (document.getElementById('informe_texto')||{}).value || '';
  r.sumaAjeno = (document.getElementById('en_suma')||{}).value || '';
  try { const f2 = (typeof _labExcelRow === 'function')
          ? _labExcelRow({ campos:(() => { const o={};
              document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
                if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
                o[e.id] = e.type === 'checkbox' ? (e.checked ? '1' : '') : (e.value || '') });
              return o })(), fecha:'2026-01-01', id:'y' }) : null;
        r.filaAjena = f2 ? JSON.stringify(f2) : null } catch (e) { r.excel2Err = String(e) }
  /* TEP, HTP y FOP, que la orden congela. */
  r.tep = (typeof calcTEP === 'function') ? (document.getElementById('tep-interpretacion')||{}).textContent : 'SIN FN';
  r.htp = (() => { const core = window._htp2022Core;
    if (typeof core !== 'function' || typeof sv !== 'function') return 'SIN FN';
    try { const R = core({ num:window._hfN, txt:sv, chk:window._hfChk }); return R ? R.prob : null }
    catch (e) { return 'EXC' } })();
  return r;
})()`;


/* == (d) LA COARTACION: el gradiente MEDIO decide y el MAXIMO describe ==================== */
const COA = `(() => {
  const esc = (o) => {
    if (typeof limpiarCampos === 'function') { try { limpiarCampos() } catch (e) {} }
    const base = { coa_loc:'yuxtaductal', coa_situacion:'nativa' };
    Object.assign(base, o);
    Object.keys(base).forEach(k => { const e = document.getElementById(k); if (!e) return;
      if (e.type === 'checkbox') { e.checked = base[k] === '1' } else { e.value = base[k] }
      try { e.dispatchEvent(new Event('input', { bubbles:true })) } catch (x) {}
      try { e.dispatchEvent(new Event('change', { bubbles:true })) } catch (x) {} });
    const c = (typeof coaConclusion === 'function') ? coaConclusion() : null;
    const g = (typeof coaGmax === 'function') ? coaGmax() : null;
    return { clave: c && c.clave, txt: (c && c.txt) || '', gmax: g == null ? null : Math.round(g) };
  };
  return {
    med21:      esc({ coa_gmedio:'21' }),
    med20:      esc({ coa_gmedio:'20' }),
    med19:      esc({ coa_gmedio:'19' }),
    max64solo:  esc({ coa_vmax:'4.0' }),
    max64ymed:  esc({ coa_vmax:'4.0', coa_gmedio:'21' }),
    max64med19: esc({ coa_vmax:'4.0', coa_gmedio:'19' }),
    max21solo:  esc({ coa_vmax:'2.3' }),
    max16solo:  esc({ coa_vmax:'2.0' }),
    cola:       esc({ coa_diast_anterogrado:'1' }),
    nada:       esc({})
  };
})()`;

/* == (e) LOS TEXTOS DE LA VAB: sin «vigilancia estrecha», sin «Heart Team» y sin intervalos == */
const VABTXT = `(() => {
  const esc = (o) => {
    if (typeof limpiarCampos === 'function') { try { limpiarCampos() } catch (e) {} }
    const base = { va_morf:'Bicúspide' };
    Object.assign(base, o);
    Object.keys(base).forEach(k => { const e = document.getElementById(k); if (!e) return;
      e.value = base[k];
      try { e.dispatchEvent(new Event('input', { bubbles:true })) } catch (x) {}
      try { e.dispatchEvent(new Event('change', { bubbles:true })) } catch (x) {} });
    const c = (typeof vabConclusion === 'function') ? vabConclusion() : null;
    return { clave: c && c.clave, txt: (c && c.txt) || '' };
  };
  const o = {
    cx55:      esc({ ao_tub:'56', vab_tipo:'1' }),
    conc45:    esc({ ao_tub:'46', vab_cx_valvular:'si', vab_tipo:'1' }),
    sinRiesgo: esc({ ao_tub:'51', vab_tipo:'1' }),
    vig50:     esc({ ao_tub:'51', vab_riesgo_qx:'si', vab_tipo:'1' }),
    vig45:     esc({ ao_tub:'46', vab_tipo:'1' }),
    leve40:    esc({ ao_tub:'42', vab_tipo:'1' }),
    sinDil:    esc({ ao_tub:'36', vab_tipo:'1' })
  };
  const todo = Object.keys(o).map(k => o[k].txt).join(' || ');
  o._frases = { heartTeam: todo.indexOf('Heart Team') > -1,
                vigEstrecha: todo.indexOf('vigilancia estrecha') > -1,
                mismoActo: todo.indexOf('mismo acto') > -1,
                anual: todo.indexOf('anual') > -1,
                controlAnual: todo.indexOf('control anual') > -1 };
  return o;
})()`;

/* == (f) EL PANEL DE EVIDENCIA: las notas que recibieron lo que salio del informe ========== */
const EVID = `(() => {
  const esc = (o) => {
    if (typeof limpiarCampos === 'function') { try { limpiarCampos() } catch (e) {} }
    Object.keys(o).forEach(k => { const e = document.getElementById(k); if (!e) return;
      if (e.type === 'checkbox') { e.checked = o[k] === '1' } else { e.value = o[k] }
      try { e.dispatchEvent(new Event('input', { bubbles:true })) } catch (x) {}
      try { e.dispatchEvent(new Event('change', { bubbles:true })) } catch (x) {} });
    const sec = {};
    (window.IND_SECS_PUB || []).forEach(() => {});
    const f = (n) => (typeof window[n] === 'function') ? window[n]() : 'SIN FN';
    return { vab: f('_indVAB'), coa: f('_indCoAo') };
  };
  const r1 = esc({ va_morf:'Bicúspide', ao_tub:'46', vab_tipo:'1' });
  const r2 = esc({ coa_loc:'yuxtaductal', coa_situacion:'nativa', coa_gmedio:'25' });
  const notas = (x) => (x && x.notas) ? x.notas.join(' || ') : String(x);
  return {
    vabNotas: notas(r1.vab),
    coaNotas: notas(r2.coa),
    vabTieneMismoActo: notas(r1.vab).indexOf('mismo acto') > -1,
    vabTieneIntervalo: notas(r1.vab).indexOf('cada 2 o 3 años') > -1,
    coaTiene5085: notas(r2.coa).indexOf('50 a 85 %') > -1,
    coaTieneMedio: notas(r2.coa).indexOf('gradiente MEDIO') > -1
  };
})()`;


/* == (g) EL MOTOR DE AORTA: disparo por sexo, cuestionario y recomendaciones < 45 mm ======= */
const AOMOTOR = `(() => {
  const esc = (o, resp) => {
    if (typeof limpiarCampos === 'function') { try { limpiarCampos() } catch (e) {} }
    if (typeof _indClinLimpiar === 'function') { try { _indClinLimpiar() } catch (e) {} }
    Object.keys(o).forEach(k => { const e = document.getElementById(k); if (!e) return;
      if (e.type === 'checkbox') { e.checked = o[k] === '1' } else { e.value = o[k] }
      try { e.dispatchEvent(new Event('input', { bubbles:true })) } catch (x) {}
      try { e.dispatchEvent(new Event('change', { bubbles:true })) } catch (x) {} });
    if (resp && typeof _indClin === 'object') Object.keys(resp).forEach(k => { _indClin[k] = resp[k] });
    const r = (typeof _indAo === 'function') ? _indAo() : 'SIN FN';
    if (r === 'SIN FN' || r === null) return { hay: r !== 'SIN FN' ? false : 'SIN FN' };
    return { hay: true, nFilas: r.filas.length,
             filas: r.filas.map(f => f.lbl + ' = ' + (f.ctrl ? '[CTRL]' : f.val)).join(' | '),
             notas: r.notas.join(' || ') };
  };
  const out = {};
  /* El disparo por los dos bordes y los dos sexos. 39/40/41 y 35/36/37. */
  [['h','M',[39,40,41]], ['m','F',[35,36,37]], ['sin','',[35,36,37,39,40,41]]].forEach(([tag, sx, vals]) => {
    vals.forEach(v => { const o = { ao_tub: String(v) }; if (sx) o.sexo = sx;
      out['disparo_' + tag + '_' + v] = esc(o).hay; });
  });
  out.corteH = esc({ ao_tub:'41', sexo:'M' }).filas;
  out.corteM = esc({ ao_tub:'37', sexo:'F' }).filas;
  out.corteSin = esc({ ao_tub:'41' }).filas;
  /* La aortopatia DERIVADA cuando el estudio la tiene, y PREGUNTADA cuando no. */
  out.derivMarfan = esc({ ao_tub:'46', marfan_sindrome:'marfan', marfan_ao_seno:'46' }).filas;
  out.derivVab    = esc({ ao_tub:'46', va_morf:'Bicúspide' }).filas;
  out.sinAorto    = esc({ ao_tub:'46' });
  out.preguntada  = esc({ ao_tub:'46' }, { 'ao.aortopatia':'ninguna' });
  /* Las recomendaciones POR DEBAJO de 45 mm, que el arranque en 45 escondia. */
  out.marfanEmb42 = esc({ ao_sin:'42', marfan_sindrome:'marfan' }, { 'ao.embarazo':'si' }).notas;
  out.marfanSin42 = esc({ ao_sin:'42', marfan_sindrome:'marfan' }, { 'ao.embarazo':'no' }).notas;
  out.lds41fr     = esc({ ao_sin:'41', marfan_sindrome:'lds' }, { 'ao.crecimiento':'si' }).notas;
  out.acta2_42fr  = esc({ ao_sin:'42', marfan_sindrome:'ehat' }, { 'ao.familiar':'si' }).notas;
  out.turner41    = esc({ ao_sin:'41', marfan_sindrome:'turner', marfan_ita:'24' }, { 'ao.crecimiento':'si' }).notas;
  out.eds41       = esc({ ao_sin:'41', marfan_sindrome:'eds' }).notas;
  /* Y las de 45 mm o mas, con su clase y su nivel. */
  out.ning55      = esc({ ao_tub:'55' }, { 'ao.aortopatia':'ninguna' }).notas;
  out.ning53riesgo= esc({ ao_tub:'53' }, { 'ao.aortopatia':'ninguna', 'ao.riesgo':'bajo' }).notas;
  out.ning46cx    = esc({ ao_tub:'46', vab_cx_valvular:'si', vab_riesgo_qx:'si' }, { 'ao.aortopatia':'ninguna' }).notas;
  out.ning50fact  = esc({ ao_tub:'50' }, { 'ao.aortopatia':'ninguna', 'ao.riesgo':'bajo', 'ao.crecimiento':'si' }).notas;
  out.marfan50    = esc({ ao_sin:'50', marfan_sindrome:'marfan' }).notas;
  out.coa         = esc({ ao_tub:'46', coa_loc:'yuxtaductal', coa_situacion:'nativa', coa_gmedio:'25' }).filas;
  /* El titulo nuevo no colisiona con ninguno. */
  out.titulos = (typeof IND_SECS !== 'undefined')
    ? IND_SECS.map(x => x.tit).filter((t,i,a) => a.some((u,j) => j !== i && (u.indexOf(t) === 0 || t.indexOf(u) === 0))).join(' | ')
    : 'SIN IND_SECS';
  out.nSecs = (typeof IND_SECS !== 'undefined') ? IND_SECS.length : null;
  return out;
})()`;

const GRUPOS = { citas: CITAS, informe: INFORME, coa: COA, vabtxt: VABTXT, evid: EVID, motor: AOMOTOR, ctrl: CTRL };

async function correr(motor, nombre) {
  const br = await motor.launch(motor === chromium ? { channel: 'chrome' } : {});
  const pg = await br.newPage({ viewport: { width: 1200, height: 800 } });
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e).slice(0, 180)));
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(900);
  const res = {};
  for (const g of SOLO) {
    if (!GRUPOS[g]) { res[g] = { error: 'GRUPO DESCONOCIDO' }; continue }
    await pg.evaluate(PRELUDIO);
    if (g === 'coa' || g === 'vabtxt' || g === 'evid' || g === 'motor') {
      await pg.evaluate(`(() => { try { showTab('congenitas') } catch (e) {}
        try { if (typeof secToggle === 'function') { secToggle('cc-coa'); secToggle('cc-vab') } } catch (e) {}
        return true })()`).catch(() => {});
      await pg.waitForTimeout(260);
    }
    if (g === 'citas' || g === 'informe') {
      await pg.evaluate(`(() => { try { showTab('congenitas') } catch (e) {}
        try { if (typeof secToggle === 'function') secToggle('cc-marfan') } catch (e) {}
        return true })()`).catch(() => {});
      await pg.waitForTimeout(260);
    }
    try { res[g] = await pg.evaluate(GRUPOS[g]) } catch (e) { res[g] = { EXC: String(e).slice(0, 300) } }
  }
  res._consola = errs;
  await br.close();
  OUT[nombre] = res;
}

if (!MOTOR || MOTOR === 'chromium') await correr(chromium, 'chrome');
if (!MOTOR || MOTOR === 'webkit') { try { await correr(webkit, 'webkit') } catch (e) { OUT.webkit = { error: String(e).slice(0,200) } } }
console.log(JSON.stringify(OUT, null, 1));
