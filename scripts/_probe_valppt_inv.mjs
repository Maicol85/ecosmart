#!/usr/bin/env node
/**
 * _probe_valppt_inv.mjs - INVENTARIO 1a de la tanda VAL-PPT (2026-11-01). SOLO LECTURA de la app.
 *
 * Contesta empiricamente, no por lectura, el 1a(i) a 1a(v):
 *   (i)   las opciones de los cuatro campos de morfologia, leidas del DOM;
 *   (ii)  QUE HACE CADA CONSUMIDOR CON UN VALOR QUE NO CONOCE. No se puede medir asignando
 *         el valor al select -un value que no es ninguna option deja el select en cadena
 *         vacia-, asi que la sonda INYECTA la option al vuelo y la elige: eso reproduce
 *         exactamente el estado posterior al commit 1b sin tocar el archivo;
 *   (iii) el valor exacto de TAVI y como lo describe el informe;
 *   (iv)  que ofrece hoy el selector de tipo del posoperatorio por valvula;
 *   (v)   donde aparecen las etiquetas del TEER y cuales llegan al papel.
 *
 *   node scripts/_probe_valppt_inv.mjs [--file /ruta/index.html] [--out /ruta/out.json]
 */
import fs from 'fs';
const A = process.argv.slice(2);
const g = (f, d) => { const i = A.indexOf(f); return (i >= 0 && A[i + 1]) ? A[i + 1] : d };
const FILE = g('--file', process.cwd() + '/index.html');
const OUTF = g('--out', '/tmp/valppt_inv.json');
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let chromium = null;
for (const c of CAND) { try { chromium = (await import(c)).default.chromium; break } catch (e) {} }
if (!chromium) { console.error('SIN PLAYWRIGHT'); process.exit(2) }

/* Los valores que el commit 1b va a agregar, por campo. La sonda los inyecta para medir que
   hace cada consumidor con ellos ANTES de escribirlos en el archivo. */
const NUEVOS = {
  vm_morf: ['Plastia mitral', 'TEER mitral'],
  vt_morf: ['Plastia tricuspídea', 'TEER tricuspídeo (T-TEER)'],
  va_morf: ['TAVI'],
  vp_morf: []
};

const INV = `(() => {
  const out = { opciones: {}, pop_selector: {}, teer_etiquetas: {} };
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  /* 1a(i) - las opciones de los cuatro campos, leidas del DOM. */
  ['va_morf','vm_morf','vt_morf','vp_morf'].forEach(id => {
    const e = document.getElementById(id);
    if (!e) { out.opciones[id] = 'NO EXISTE'; return }
    out.opciones[id] = Array.prototype.map.call(e.options,
      o => (o.value || o.text) + (o.value && o.value !== o.text ? ' [texto: ' + o.text + ']' : ''));
  });
  /* 1a(iv) - que ofrece el selector del posoperatorio, por valvula. */
  try { if (typeof popCxVSync === 'function') popCxVSync() } catch (e) {}
  ['pop-esp-vao','pop-esp-vmi','pop-esp-vtr','pop-esp-vpu'].forEach(id => {
    const e = document.getElementById(id);
    out.pop_selector[id] = e ? Array.prototype.map.call(e.options, o => o.value || o.text)
                             : 'NO EXISTE';
  });
  out.pop_filtro = (typeof window._popVEsProt === 'function') ? 'expuesto' : 'no expuesto en window';
  /* 1a(iii) - TAVI: valor exacto y su redaccion. */
  out.tavi_valor = (function(){ const e = document.getElementById('va_morf');
    if (!e) return 'NO EXISTE';
    const o = Array.prototype.filter.call(e.options, x => /TAVI/.test(x.text))[0];
    return o ? JSON.stringify({ value: o.value, text: o.text }) : 'sin option TAVI' })();
  out.tavi_frase = (typeof valvMorfDe === 'function')
    ? JSON.stringify({ de: valvMorfDe('TAVI'), presenta: valvMorfPresenta('TAVI'),
                       adj: valvMorfAdj('TAVI'), es: valvMorfEs('TAVI') }) : 'sin valvMorfDe';
  /* Las dos listas dueñas de los predicados. */
  out.VALV_PROT_OPCIONES = window.VALV_PROT_OPCIONES ? Array.from(window.VALV_PROT_OPCIONES) : 'no expuesta';
  out.VALV_MORF_FRASE_claves = window.VALV_MORF_FRASE ? Object.keys(window.VALV_MORF_FRASE) : 'no expuesta';
  out.VALV_MORF_ETIOL_claves = window.VALV_MORF_ETIOL ? Object.keys(window.VALV_MORF_ETIOL) : 'no expuesta';
  return out;
})()`;

/* 1a(ii) - el nucleo. Pone un valor en una morfologia y mide TODOS los consumidores. */
const MEDIR = `((cfg) => {
  const out = { cfg: cfg };
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  /* Un estudio minimo que despierte las cuatro valvulas: lesiones consignadas por pastilla. */
  Object.keys(cfg.campos || {}).forEach(k => S(k, cfg.campos[k]));
  /* INYECCION DE LA OPTION NUEVA, que es lo que permite medir un valor desconocido. */
  if (cfg.inyecta) {
    const e = document.getElementById(cfg.inyecta.id);
    if (e) {
      const existe = Array.prototype.some.call(e.options, o => (o.value || o.text) === cfg.inyecta.val);
      if (!existe) { const o = document.createElement('option');
        o.value = cfg.inyecta.val; o.textContent = cfg.inyecta.val; e.appendChild(o) }
      out.inyectada = !existe;
      S(cfg.inyecta.id, cfg.inyecta.val);
      out.valor_quedo = e.value;
    } else out.inyectada = 'NO EXISTE ' + cfg.inyecta.id;
  }
  (cfg.pastillas || []).forEach(p => { const b = document.getElementById('pill-' + p[1] + '-' + p[0]);
    if (b && !b.classList.contains('btn-primary')) b.click() });
  Object.keys(window).forEach(k => { if (/^calc[A-Z]/.test(k) && typeof window[k] === 'function') {
    try { window[k]() } catch (e) {} } });
  try { if (typeof _recalcModulos === 'function') _recalcModulos('inv') } catch (e) {}
  const T = (id) => { const e = document.getElementById(id); return e ? String(e.value || e.textContent || '') : 'NO EXISTE' };
  /* Los PREDICADOS, uno por uno. */
  const v = cfg.inyecta ? cfg.inyecta.val : '';
  out.pred = {
    valvEsProtesis: (typeof valvEsProtesis === 'function') ? valvEsProtesis(v) : 'n/d',
    protNoGradua_vm: (typeof protNoGradua === 'function') ? protNoGradua('vm_morf') : 'n/d',
    protNoGradua_vt: (typeof protNoGradua === 'function') ? protNoGradua('vt_morf') : 'n/d',
    protNoGradua_vp: (typeof protNoGradua === 'function') ? protNoGradua('vp_morf') : 'n/d',
    valvMorfDe: (typeof valvMorfDe === 'function') ? valvMorfDe(v) : 'n/d',
    valvMorfPresenta: (typeof valvMorfPresenta === 'function') ? valvMorfPresenta(v) : 'n/d',
    valvMorfAdj: (typeof valvMorfAdj === 'function') ? valvMorfAdj(v) : 'n/d',
    valvMorfEs: (typeof valvMorfEs === 'function') ? valvMorfEs(v) : 'n/d'
  };
  /* Los BLOQUES de prótesis: visibles u ocultos. */
  out.bloques = {};
  ['bloque-prot-va','bloque-prot-vm','bloque-prot-vt','bloque-prot-vp'].forEach(id => {
    const e = document.getElementById(id);
    out.bloques[id] = e ? (e.style.display === 'none' ? 'oculto' : 'visible') : 'NO EXISTE';
  });
  /* Las CAPSULAS de severidad de las cuatro valvulas y sus grados. */
  out.pant = {};
  ['em-sev','ea-sev','et-sev','ep-sev','im-sev','ia-sev','it-sev','ip-sev',
   'vp-sev-badge','em_grado','ea_grado','et_grado','ep_grado','im_grado','ia_grado',
   'it_grado','ip_grado'].forEach(id => { out.pant[id] = T(id) });
  /* El SELECTOR del posoperatorio despues del cambio de morfologia. */
  try { if (typeof popCxVSync === 'function') popCxVSync() } catch (e) {}
  out.pop = {};
  ['pop-esp-vao','pop-esp-vmi','pop-esp-vtr','pop-esp-vpu'].forEach(id => {
    const e = document.getElementById(id);
    out.pop[id] = e ? { ofrece: Array.prototype.map.call(e.options, o => o.value || o.text),
                        valor: e.value,
                        tag: T(id + '-tag'), nota: T(id + '-nota') } : 'NO EXISTE';
  });
  out.popVEstado = {};
  ['pop-esp-vao','pop-esp-vmi','pop-esp-vtr','pop-esp-vpu'].forEach(id => {
    try { out.popVEstado[id] = (typeof popVEstado === 'function') ? JSON.stringify(popVEstado(id)) : 'n/d' }
    catch (e) { out.popVEstado[id] = 'ERR ' + String(e).slice(0, 60) }
  });
  /* El INFORME en los tres estilos y el EN SUMA. */
  ['estandar','narrativo','conciso'].forEach(st => {
    try { if (typeof setEstiloInforme === 'function') setEstiloInforme(st) } catch (e) {}
    try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
    out['informe_' + st] = T('informe_texto');
    out['suma_' + st] = T('en_suma');
  });
  try { if (typeof setEstiloInforme === 'function') setEstiloInforme('estandar') } catch (e) {}
  try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
  /* El EXCEL: solo las cuatro columnas de morfologia y los grados, para no inflar el volcado. */
  try {
    const campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
      if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
      campos[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || '');
    });
    out._camposN = Object.keys(campos).length;
    const fila = (typeof _labExcelRow === 'function') ? _labExcelRow({ campos: campos, fecha: '2026-11-01' }) : null;
    out._excelN = fila ? Object.keys(fila).length : 'SIN FN';
    out._excel_morf = fila ? { mitral: fila['Morfología mitral'], aortica: fila['Morfología aórtica'],
      tricuspide: fila['Morfología tricúspide'], pulmonar: fila['Morfología pulmonar'] } : 'n/d';
  } catch (e) { out._excelErr = String(e).slice(0, 140) }
  /* El IMPORTADOR: la lista paralela acepta el valor nuevo? */
  try {
    out.importador = (typeof _labXlsLista === 'function')
      ? ['vm_morf','va_morf','vt_morf','vp_morf'].map(k => k + '=' + JSON.stringify(_labXlsLista(k, v))).join(' ; ')
      : (window.LAB_XLS_LISTAS ? 'LAB_XLS_LISTAS expuesta sin _labXlsLista' : 'no expuesto');
  } catch (e) { out.importador = 'ERR ' + String(e).slice(0, 80) }
  /* La VISTA 2D: lee la morfologia? */
  try { out.v2d = (typeof v2dEstado === 'function') ? JSON.stringify(v2dEstado()).slice(0, 700) : 'n/d' }
  catch (e) { out.v2d = 'ERR ' + String(e).slice(0, 80) }
  /* Los CRITERIOS TEER de ETE mitral: su veredicto no debe moverse por la morfologia. */
  try { out.teerEstado = (typeof teerEstado === 'function') ? JSON.stringify(teerEstado()).slice(0, 500) : 'n/d' }
  catch (e) { out.teerEstado = 'ERR ' + String(e).slice(0, 80) }
  return out;
})(CFG)`;

/* El censo del PAPEL de las etiquetas del TEER: 1a(v). */
const TEERPAPEL = `(() => {
  const out = {};
  const MARC = ['NO apto', 'Heart Team', 'anatomía compleja', 'APTO para TEER'];
  const T = (id) => { const e = document.getElementById(id); return e ? String(e.value || e.textContent || '') : '' };
  /* El modulo TEER llega al papel SOLO si el medico lo integra: sin eso, un cero no prueba nada. */
  try { if (typeof amiloIntegrar === 'function') amiloIntegrar('teer') } catch (e) {}
  out.am_txt_teer = T('am-txt-teer').slice(0, 1200);
  out.am_txt_teer_n = T('am-txt-teer').length;
  out.integrado = (typeof amiloEnInforme === 'function') ? JSON.stringify(amiloEnInforme()) : 'n/d';
  const sup = {};
  ['estandar','narrativo','conciso'].forEach(st => {
    try { if (typeof setEstiloInforme === 'function') setEstiloInforme(st) } catch (e) {}
    try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
    sup['informe_' + st] = T('informe_texto'); sup['suma_' + st] = T('en_suma');
  });
  out.censo = {};
  Object.keys(sup).forEach(k => {
    MARC.forEach(m => { const n = sup[k].split(m).length - 1;
      if (n > 0) out.censo[k + ' // ' + m] = n });
  });
  out.pantalla = {};
  ['teer-badge','teer-titulo','teer-nota','teer-c1','teer-c4','teer-c5'].forEach(id => {
    out.pantalla[id] = T(id).slice(0, 220) });
  out.denom = Object.keys(sup).map(k => k + '=' + sup[k].length).join(' ');
  return out;
})()`;

const ESC_TEER = { campos: {
  pac_nombre: 'Prueba Inventario', pac_ci: '1234567', peso: '75', talla: '172', edad: '70', sexo: 'M',
  ete_lva: '18', ete_coapt_gap: '1', avm_plan: '3.5', psap: '75', ddfvi: '62', dsfvi: '72',
  ete_flail_ancho: '16', ete_flail_prof: '12', ete_flail_gap: '11' },
  sel: { ete_tipo_im: 'secundaria' } };

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE, md5nota: 'medido por el llamador' };
try {
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([e.message.slice(0, 160)]) });
  pg.on('console', m => { if (m.type() === 'error')
    OUT._conErr = (OUT._conErr || []).concat([m.text().slice(0, 160)]) });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
  await pg.waitForTimeout(1500);
  OUT._1a_i_iii_iv = await pg.evaluate(INV);

  /* Un estudio base con las cuatro valvulas despiertas. */
  const BASE = { campos: { pac_nombre: 'Prueba Inventario', pac_ci: '1234567', peso: '75',
      talla: '172', edad: '70', sexo: 'M', em_gmedio: '7', avm_plan: '1.5', im_vc: '0.6',
      gmedio_ao: '20', vmax_ao: '3.0', ia_vc: '0.4', et_gmedio: '4', it_vc: '0.8',
      vp_gmax: '20', ip_vmax: '2.0' },
    pastillas: [['mitral','esten'],['mitral','insuf'],['aortica','esten'],['aortica','insuf'],
                ['tricusp','insuf'],['pulmonar','insuf']] };

  const CASOS = [ { k: 'base', cfg: Object.assign({}, BASE) } ];
  /* Control: una PROTESIS, que es el comportamiento conocido. */
  CASOS.push({ k: 'ctl_prot_mitral', cfg: Object.assign({}, BASE, { inyecta: { id: 'vm_morf', val: 'Prótesis mecánica' } }) });
  CASOS.push({ k: 'ctl_tavi', cfg: Object.assign({}, BASE, { inyecta: { id: 'va_morf', val: 'TAVI' } }) });
  /* Los valores NUEVOS, inyectados. */
  for (const id of Object.keys(NUEVOS)) for (const val of NUEVOS[id]) {
    if (id === 'va_morf' && val === 'TAVI') continue;
    CASOS.push({ k: 'nuevo_' + id + '_' + val.replace(/[^a-zA-Z]/g, '').slice(0, 12),
                 cfg: Object.assign({}, BASE, { inyecta: { id: id, val: val } }) });
  }
  for (const c of CASOS) {
    try {
      OUT[c.k] = await pg.evaluate(MEDIR.replace('CFG', JSON.stringify(c.cfg)));
      console.log('-- ' + c.k + ' medido (campos=' + OUT[c.k]._camposN + ' excel=' + OUT[c.k]._excelN + ')');
    } catch (e) { OUT[c.k] = { _err: String(e).slice(0, 200) }; console.log('-- ' + c.k + ' ERROR') }
  }
  /* 1a(v) - el censo del papel del TEER, en su propia pasada. */
  try {
    await pg.evaluate(MEDIR.replace('CFG', JSON.stringify(ESC_TEER)));
    OUT._1a_v_teer = await pg.evaluate(TEERPAPEL);
    console.log('-- 1a(v) TEER medido, denom: ' + (OUT._1a_v_teer || {}).denom);
  } catch (e) { OUT._1a_v_teer = { _err: String(e).slice(0, 200) } }
  await pg.close();
} catch (e) { OUT._err = String(e).slice(0, 250) }
try { await b.close() } catch (e) {}
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF + ' (' + fs.statSync(OUTF).size + ' bytes)');
