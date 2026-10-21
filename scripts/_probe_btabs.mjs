#!/usr/bin/env node
/**
 * _probe_btabs.mjs - la sonda de la REORGANIZACION DE PESTANAS (trabajo B, 2026-10-21).
 *
 * Mide lo RENDERIZADO en los DOS motores: el rail, la fila de arriba, las sub-pestanas de
 * Otros, el eco pulmonar unificado, Calculadoras dentro de Referencias y C. Congenitas.
 * A/B de solo lectura con --file.
 *
 *   node scripts/_probe_btabs.mjs --solo rail
 *   node scripts/_probe_btabs.mjs --solo rail --file /tmp/head.html
 *   node scripts/_probe_btabs.mjs --solo maqueta --dest /tmp/bcap
 *
 * ADVERTENCIA: sin acentos graves dentro del template de la sonda, y sin \s ni \n (se cocinan).
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
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const SOLO = (arg('--solo') || 'rail').split(',').map(s => s.trim());
const FILE = arg('--file') || (RAIZ + '/index.html');
const DEST = arg('--dest') || '/tmp/bcap';
const MOTOR = arg('--motor');
const OUT = {};
const hay = (g) => SOLO.indexOf(g) > -1;

const PRELUDIO = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  try { localStorage.setItem('ett_view_mode','avanzado') } catch (e) {}
  if (typeof applyViewMode === 'function') { try { applyViewMode() } catch (e) {} }
  return true;
})()`;

/* ══ (a) EL RAIL Y LA FILA DE ARRIBA, MEDIDOS POR SU GEOMETRIA ═══════════════════════════
   Un boton con display:none NO tiene geometria, asi que «visible» se mide por el rect y no
   por el atributo: es la regla que la tanda R pago en Safari. */
const RAIL = `(() => {
  const vis = (b) => { const r = b.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(b).display !== 'none' };
  const lee = (sel) => Array.prototype.slice.call(document.querySelectorAll(sel)).map(b => {
    const oc = b.getAttribute('onclick') || '';
    const a = oc.indexOf("showTab('"); const z = a < 0 ? -1 : oc.indexOf("'", a + 9);
    return { txt: (b.textContent || '').replace(/\\s+/g, ' ').trim(),
             id: (a < 0 || z < 0) ? null : oc.slice(a + 9, z),
             mod: b.getAttribute('data-mod') || null, vis: vis(b),
             w: Math.round(b.getBoundingClientRect().width) };
  });
  const rail = lee('.rail .tab-btn');
  const esp  = lee('.tabs-special .tab-btn');
  const too  = lee('.tabs-tools .tab-btn');
  const r = document.querySelector('.rail');
  const rr = r ? r.getBoundingClientRect() : null;
  return { rail: rail, nRail: rail.length, nRailVis: rail.filter(x => x.vis).length,
    arriba: esp.concat(too), nArriba: esp.length + too.length,
    nArribaVis: esp.concat(too).filter(x => x.vis).length,
    railScroll: r ? { alto: Math.round(rr.height), contenido: r.scrollHeight,
                      desplaza: r.scrollHeight > Math.round(rr.height) + 1,
                      overflowY: getComputedStyle(r).overflowY } : null,
    hScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
})()`;

/* ══ (b) PERICARDIO Y MASAS: el contenido INTACTO en su pestana nueva ════════════════════
   Se cuentan los campos por su ID y se comprueba que tengan geometria con la seccion
   abierta: un campo que existe en el DOM y mide 0x0 no se puede cargar. */
const PERI = `(() => {
  const IDS = ['pericardio','pericardio_hemo','otras_notas','masa_presente','masa_loc',
    'masa_tam_mm','masa_morf','masa_movil','masa_eco','masa_dx','masa_notas'];
  if (typeof showTab === 'function') { try { showTab(DEST_TAB) } catch (e) {} }
  const sec = document.getElementById('ete-seccion-pericardio-masas');
  if (sec) sec.style.display = 'block';
  /* El bloque de masas lo muestra showMasaPanel, y el valor de la option es su TEXTO
     («Masa / imagen intracardiaca presente»), no un «si»: con el token inventado el panel
     queda cerrado y los siete campos miden 0x0 sobre una pestana perfecta. */
  const mp = document.getElementById('masa_presente');
  if (mp) { mp.selectedIndex = 1;
    if (typeof showMasaPanel === 'function') { try { showMasaPanel() } catch (e) {} } }
  const campos = IDS.map(id => { const e = document.getElementById(id);
    if (!e) return { id: id, hay: false };
    const r = e.getBoundingClientRect();
    return { id: id, hay: true, geo: r.width > 0 && r.height > 0,
             tab: (e.closest('.tab-section') || {}).id || null };
  });
  const h2 = sec ? (sec.previousElementSibling || {}) : {};
  return { nCampos: campos.filter(c => c.hay).length, nGeo: campos.filter(c => c.geo).length,
    campos: campos, secTab: sec ? (sec.closest('.tab-section') || {}).id : null,
    nOpcPericardio: (document.getElementById('pericardio') || { options: [] }).options.length,
    globos: Array.prototype.slice.call((sec || document.createElement('div'))
      .querySelectorAll('.vinfo-btn')).map(b => b.getAttribute('data-vinfo')) };
})()`;

/* ══ (c) OTROS: las dos sub-pestanas y el ASIA con UN dueno en los dos sentidos ══════════ */
const OTROS = `(() => {
  if (typeof showTab === 'function') { try { showTab('otros') } catch (e) {} }
  const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0 };
  const barra = document.querySelector('#tab-otros .otr-subbar');
  const btns = barra ? Array.prototype.slice.call(barra.querySelectorAll('button')).map(b => ({
    txt: (b.textContent || '').trim(), id: b.id,
    act: b.classList.contains('active'), sel: b.getAttribute('aria-selected') })) : null;
  const pan = Array.prototype.slice.call(document.querySelectorAll('#tab-otros [id^=otr-sub-]'))
    .map(p => ({ id: p.id, act: p.classList.contains('active'), vis: vis(p) }));
  const IDS = ['otr_asia','otr_var_eustaquio','otr_var_chiari','otr_var_lipo',
    'otr_var_tendones','otr_var_lambl','otr_var_senocor','otr_rac'];
  const dondeVive = (id) => { const e = document.getElementById(id); if (!e) return null;
    const p = e.closest('[id^=otr-sub-]'); return p ? p.id : 'SUELTO' };
  return { barra: !!barra, btns: btns, nBtns: btns ? btns.length : 0, paneles: pan,
    variantes: IDS.map(id => ({ id: id, pan: dondeVive(id) })),
    burbuja: dondeVive('otr_burb'),
    pulmonarEnOtros: !!document.getElementById('pul_derrame')
      && (document.getElementById('pul_derrame').closest('.tab-section') || {}).id === 'tab-otros' };
})()`;

/* El ASIA en los DOS SENTIDOS, con el gesto real de un clic y de un <select>. */
const ASIA = `(() => {
  if (typeof limpiarCampos === 'function') { try { limpiarCampos() } catch (e) {} }
  const chk = document.getElementById('otr_asia');
  const sel = document.getElementById('fop_asa');
  if (!chk || !sel) return { err: 'faltan nodos', chk: !!chk, sel: !!sel };
  const r = { ini: { chk: chk.checked, sel: sel.value } };
  /* Sentido 1: Otros -> FOP. El clic es el gesto del medico. */
  chk.click();
  r.trasClic = { chk: chk.checked, sel: sel.value };
  /* Sentido 2: FOP -> Otros, por un change de confianza simulado con el despacho real. */
  sel.value = 'no';
  sel.dispatchEvent(new Event('change', { bubbles: true }));
  r.trasSelNo = { chk: chk.checked, sel: sel.value };
  sel.value = 'si';
  sel.dispatchEvent(new Event('change', { bubbles: true }));
  r.trasSelSi = { chk: chk.checked, sel: sel.value };
  r.unDueno = (r.trasClic.sel === 'si') && (r.trasSelNo.chk === false) && (r.trasSelSi.chk === true);
  return r;
})()`;

/* ══ (d) ECO PULMONAR: un solo lugar, el boton adentro y el texto en el informe ══════════ */
const PULM = `(() => {
  const puertas = Array.prototype.slice.call(document.querySelectorAll('[onclick]'))
    .filter(b => (b.getAttribute('onclick') || '').indexOf("showTab('pulmonar')") > -1)
    .map(b => ({ txt: (b.textContent || '').trim().slice(0, 30),
                 donde: b.closest('.rail') ? 'rail' : (b.closest('.tabs-special') ? 'arriba'
                   : (b.closest('.tabs-tools') ? 'tools' : 'otro')) }));
  if (typeof showTab === 'function') { try { showTab('pulmonar') } catch (e) {} }
  const t = document.getElementById('tab-pulmonar');
  const integ = t ? t.querySelector('[data-am-k=pulm]') : null;
  const BAS = ['pul_derrame','pul_derrame_tam','pul_balik','pul_derrame_lado','pul_lineasb',
    'pul_lineasb_pat','pul_consolidacion','pul_consol_nota'];
  return { puertas: puertas, nPuertas: puertas.length,
    integrarEnTab: !!integ, tabDeIntegrar: integ ? (integ.closest('.tab-section') || {}).id : null,
    basicos: BAS.map(id => { const e = document.getElementById(id);
      return { id: id, tab: e ? (e.closest('.tab-section') || {}).id : null } }) };
})()`;

/* ══ (e) EL FONOCARDIOGRAMA, AUSENTE ═════════════════════════════════════════════════════ */
const FONO = `(() => ({
  tab: !!document.getElementById('tab-fono'),
  boton: !!document.querySelector('[onclick*="showTab(&#39;fono&#39;)"]'),
  botonTxt: Array.prototype.slice.call(document.querySelectorAll('[onclick]'))
    .filter(b => (b.getAttribute('onclick') || '').indexOf("'fono'") > -1).length,
  canvas: !!document.getElementById('fcg-canvas'),
  enModulos: (typeof EE_MODULES !== 'undefined')
    ? EE_MODULES.map(m => m.key).indexOf('fono') : 'SIN EE_MODULES',
  dataMod: !!document.querySelector('[data-mod=fono]')
}))()`;

/* ══ (f) CALCULADORAS DENTRO DE REFERENCIAS ══════════════════════════════════════════════ */
const CALC = `(() => {
  if (typeof showTab === 'function') { try { showTab('refs') } catch (e) {} }
  if (typeof refSubInit === 'function') { try { refSubInit() } catch (e) {} }
  const bar = document.querySelector('#tab-refs .ref-subbar');
  const btns = bar ? Array.prototype.slice.call(bar.querySelectorAll('button')).map(b => ({
    txt: (b.textContent || '').trim(), id: b.id })) : null;
  const orden = (typeof REF_SUB_ORDEN !== 'undefined') ? REF_SUB_ORDEN.slice() : null;
  const cx = document.getElementById('cx-wilkins') || document.querySelector('[id^=cx-]');
  return { btns: btns, nBtns: btns ? btns.length : 0, primero: btns ? btns[0] : null,
    orden: orden,
    calcEnRefs: cx ? (cx.closest('.tab-section') || {}).id : null,
    tabCalcVive: !!document.getElementById('tab-calculadoras'),
    botonArriba: Array.prototype.slice.call(document.querySelectorAll('.tabs-tools .tab-btn'))
      .filter(b => (b.getAttribute('onclick') || '').indexOf('calculadoras') > -1).length };
})()`;

/* ══ (g) C. CONGENITAS: un boton, dos pestanas ═══════════════════════════════════════════ */
const CC = `(() => {
  const vis = (e) => { if (!e) return false; const r = e.getBoundingClientRect();
    return r.width > 0 && r.height > 0 };
  const arriba = Array.prototype.slice.call(document.querySelectorAll('.tabs-special .tab-btn'))
    .filter(b => (b.getAttribute('onclick') || '').indexOf('congenitas') > -1)
    .map(b => ({ txt: (b.textContent || '').trim(), vis: vis(b) }));
  /* ⚠️ ESTE MEDIDOR NO NAVEGA. La primera version hacia showTab('congenitas') adentro, asi que
     volvia a la primera pestana DESPUES de cada clic y la escena se pisaba a si misma: informaba
     «el clic no cambia de pestana» sobre un mecanismo que funciona. La navegacion la hace quien
     llama, con clics reales. */
  const bar = document.querySelector('.tab-section.active .cc-subbar')
    || document.querySelector('.cc-subbar');
  /* El estado activo vive en la clase cc-on y no en active —showTab barre la segunda—, y el color
     se lee DESPUES de la transicion, en otra llamada. */
  const sub = bar ? Array.prototype.slice.call(bar.querySelectorAll('button')).map(b => ({
    txt: (b.textContent || '').trim(), on: b.classList.contains('cc-on'),
    sel: b.getAttribute('aria-selected'), ti: b.tabIndex,
    col: getComputedStyle(b).color })) : null;
  const act = ['congenitas','congenitas2'].filter(k => { const t = document.getElementById('tab-' + k);
    return t && t.classList.contains('active') })[0] || null;
  const nBarras = document.querySelectorAll('.cc-subbar').length;
  return { arriba: arriba, nArriba: arriba.length, sub: sub, nSub: sub ? sub.length : 0,
    activa: act, nBarras: nBarras,
    t1: !!document.getElementById('tab-congenitas'),
    t2: !!document.getElementById('tab-congenitas2'),
    secciones: { frec: document.querySelectorAll('#tab-congenitas .sacc').length,
                 compl: document.querySelectorAll('#tab-congenitas2 .sacc').length } };
})()`;

/* ══ CONTROLES: las superficies que NO se tocan ══════════════════════════════════════════ */
const CTRL = `(() => {
  const g = (id) => { const e = document.getElementById(id); return e ? e.value : null };
  if (typeof limpiarCampos === 'function') { try { limpiarCampos() } catch (e) {} }
  const sv = (id, v) => { const e = document.getElementById(id); if (!e) return false;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return true };
  ESCENA
  if (typeof generarInforme === 'function') { try { generarInforme() } catch (e) {} }
  const inf = g('informe_texto') || '', suma = g('en_suma') || '';
  let xls = null, nCols = 0;
  try { const f = _labExcelRow({ campos: (typeof recolectar === 'function' ? {} : {}) });
    nCols = Object.keys(f).length } catch (e) {}
  try { if (typeof guardarInforme === 'function') { /* no se guarda: solo se mide */ } } catch (e) {}
  const campos = {};
  document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
    if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
    if (e.id.indexOf('_') < 0) return;
    campos[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : e.value;
  });
  const ks = Object.keys(campos).sort();
  let h = 0; const s = JSON.stringify(ks.map(k => k + '=' + campos[k]));
  for (let i = 0; i < s.length; i++) { h = ((h << 5) - h + s.charCodeAt(i)) | 0 }
  return { inf: inf, suma: suma, nCampos: ks.length, hash: h,
    grados: ['im_grado','ia_grado','it_grado','ea_grado','em_grado','et_grado','ip_grado','ep_grado']
      .map(k => k + ':' + g(k)).join(' '),
    diast: (document.getElementById('dd-interp') || {}).textContent || null };
})()`;


/* ══ EXCEL Y CAMPOS DEL ESTUDIO, con el recolector REAL ══════════════════════════════════
   Se replica el barrido de guardarInforme letra por letra —todos los input/select/textarea
   con id que pasen _noEsDelEstudio, mas los __chk de los checkbox—: el helper comodo que
   exige un guion bajo en el id mide «campos del DOM» y da otro numero. */
const EXCEL = `(() => {
  if (typeof limpiarCampos === 'function') { try { limpiarCampos() } catch (e) {} }
  ESCENA
  const campos = {};
  document.querySelectorAll('input[id], select[id], textarea[id]').forEach(el => {
    if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return;
    campos[el.id] = el.value;
  });
  document.querySelectorAll('input[type=checkbox][id]').forEach(el => {
    if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return;
    campos[el.id + '__chk'] = el.checked ? '1' : '0';
  });
  let fila = null, err = null;
  try { fila = _labExcelRow({ campos: campos, fecha: '2026-10-21', id: 'X' }) }
  catch (e) { err = e.message.slice(0, 120) }
  const ks = Object.keys(campos).sort();
  const ck = fila ? Object.keys(fila).sort() : [];
  const hh = (a) => { let h = 0; const s = JSON.stringify(a);
    for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return h };
  return { nCampos: ks.length, hashCampos: hh(ks.map(k => k + '=' + campos[k])),
    nCols: ck.length, hashCols: hh(ck), err: err,
    hashVals: fila ? hh(ck.map(k => k + '=' + fila[k])) : null };
})()`;


/* ══ EL DRAWER MOVIL ══════════════════════════════════════════════════════════════════════
   Por debajo de 768 px el rail pasa a display:none y la UNICA puerta a las secciones es el
   drawer. Desde que «Eco pulmonar» vive en el rail con su data-mod, esa lista depende del
   modo: un drawer que no mire el display ofreceria en Modo Basico un modulo que el rail ya
   esconde. Se mide con los dos modos. */
const DRAWER = `(() => {
  const leer = () => { const d = document.getElementById('ecoDrawer');
    return d ? Array.prototype.slice.call(d.querySelectorAll('button')).map(
      b => b.getAttribute('data-tab')) : null };
  const poner = (m) => { try { localStorage.setItem('ett_view_mode', m) } catch (e) {}
    if (typeof applyViewMode === 'function') { try { applyViewMode() } catch (e) {} } };
  poner('avanzado');
  const av = leer();
  poner('basico');
  const ba = leer();
  poner('avanzado');
  const vuelta = leer();
  const sel = document.getElementById('ecoAdvSelect');
  return { avanzado: av, nAv: av ? av.length : 0, basico: ba, nBa: ba ? ba.length : 0,
    vuelta: vuelta, pulmEnBasico: ba ? ba.indexOf('pulmonar') > -1 : null,
    pulmEnAvanzado: av ? av.indexOf('pulmonar') > -1 : null,
    advSelect: sel ? Array.prototype.slice.call(sel.options).map(o => o.value).filter(v => v) : null };
})()`;


/* ══ EL CLIC REAL EN LA SUB-PESTANA Y EL COLOR EN LOS DOS TEMAS ══════════════════════════ */
const OTRCLIC = `(() => {
  const col = (id) => { const e = document.getElementById(id);
    return e ? getComputedStyle(e).color : null };
  const vis = (id) => { const e = document.getElementById(id); if (!e) return null;
    const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 };
  return { burbBtn: col('otr-subtab-burbuja'), varBtn: col('otr-subtab-variantes'),
    burbPan: vis('otr-sub-burbuja'), varPan: vis('otr-sub-variantes'),
    burbCls: (document.getElementById('otr-subtab-burbuja') || {}).className,
    varCls: (document.getElementById('otr-subtab-variantes') || {}).className,
    burbSel: (document.getElementById('otr-subtab-burbuja') || {}).getAttribute('aria-selected'),
    varSel: (document.getElementById('otr-subtab-variantes') || {}).getAttribute('aria-selected'),
    tabulables: (document.getElementById('otr-sub-variantes') || document.createElement('div'))
      .querySelectorAll('input,select,textarea,button').length,
    tabulablesBurb: (document.getElementById('otr-sub-burbuja') || document.createElement('div'))
      .querySelectorAll('input,select,textarea,button').length };
})()`;


/* ══ EL INFORME PULMONAR: posicion, Balik y la hoja que no duplica ═══════════════════════ */
const INFPUL = `(() => {
  if (typeof limpiarCampos === 'function') { try { limpiarCampos() } catch (e) {} }
  const sv = (id, v) => { const e = document.getElementById(id); if (!e) return false;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return true };
  ESCENA
  if (typeof generarInforme === 'function') { try { generarInforme() } catch (e) {} }
  const inf = (document.getElementById('informe_texto') || {}).value || '';
  const suma = (document.getElementById('en_suma') || {}).value || '';
  const li = inf.split(String.fromCharCode(10)).filter(x => x.trim());
  const idx = (pat) => { for (let i = 0; i < li.length; i++) if (li[i].indexOf(pat) > -1) return i; return -1 };
  /* La hoja del PDF: lo que amiloEnInforme devuelve es lo que se dibuja. */
  let hoja = null;
  try { hoja = (amiloEnInforme() || []).map(d => d.k) } catch (e) { hoja = 'EXC' }
  return { nLineas: li.length,
    iPeri: idx('pericárdic'), iMasa: idx('masa'), iDerrPl: idx('Derrame pleural'),
    iLineasB: idx('Líneas B'), iDesliz: idx('Deslizamiento pleural'),
    lineasPulm: li.filter(x => /pleural|Líneas [AB]|Consolidación|Neumotórax|intersticial|Punto pulmón/.test(x)),
    balik: (inf.match(/[^.]*Balik[^.]*\./g) || []).concat(suma.match(/[^.]*Balik[^.]*\./g) || []),
    sumaPulm: suma.split(String.fromCharCode(10)).filter(x => /pleural|Líneas|Consolidaci|intersticial/.test(x)),
    hojaPDF: hoja, pulmEnHoja: Array.isArray(hoja) ? hoja.indexOf('pulm') > -1 : hoja };
})()`;


/* ══ EL PDF GENERADO DE VERDAD, SEIS PLANTILLAS, espiando el constructor de jsPDF ════════
   Es el patron de _probe_r2ab.mjs. Sin esto, «la hoja no sale» se afirma sobre el objeto que
   amiloEnInforme devuelve y no sobre el papel. */
const PDF = `(async () => {
  const PL = ['clasico', 'moderno', 'minimalista', 'academico', 'compacto', 'elegante'];
  const r = {};
  if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) return { err: 'SIN JSPDF' };
  const Orig = window.jspdf.jsPDF;
  for (const p of PL) {
    const reg = { textos: [], nFigs: 0 };
    window.jspdf.jsPDF = function (...a) {
      const d = new Orig(...a);
      const ot = d.text.bind(d);
      d.text = function (t, x, y, ...rest) { reg.textos.push(String(t)); return ot(t, x, y, ...rest) };
      ['circle', 'line', 'rect', 'addImage', 'triangle'].forEach(m => {
        if (typeof d[m] === 'function') { const o = d[m].bind(d); d[m] = function (...z) { reg.nFigs++; return o(...z) } }
      });
      d.save = function () { return true };
      d.output = function () { return '' };
      return d;
    };
    Object.keys(Orig).forEach(k => { try { window.jspdf.jsPDF[k] = Orig[k] } catch (e) {} });
    try { const pl = document.getElementById('pdf_plantilla'); if (pl) { pl.value = p;
            pl.dispatchEvent(new Event('change', { bubbles: true })) } } catch (e) {}
    try { if (typeof _pdfAjustarA4 === 'function') await _pdfAjustarA4();
          else if (typeof generarPDF === 'function') await generarPDF() } catch (e) { reg.err = String(e).slice(0, 110) }
    const T = reg.textos.join(' | ');
    r[p] = { n: reg.textos.length, figs: reg.nFigs,
      hojaPulm: T.indexOf('ECOGRAFIA PULMONAR') > -1,
      nDerrPleural: (T.match(/Derrame pleural/g) || []).length,
      nBalik: (T.match(/Balik/g) || []).length, err: reg.err || null, txt: T };
  }
  window.jspdf.jsPDF = Orig;
  return r;
})()`;

async function corre(nombre, abrir) {
  if (MOTOR && MOTOR !== nombre) return;
  const R = {};
  let b;
  try { b = await abrir() } catch (e) { OUT[nombre] = { error: 'NO ARRANCA: ' + e.message }; return }
  try {
    const pg = await b.newPage({ viewport: { width: 1200, height: 700 } });
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
    await pg.evaluate(PRELUDIO);
    if (hay('rail'))  R.rail  = await pg.evaluate(RAIL);
    if (hay('peri'))  R.peri  = await pg.evaluate(PERI.replace('DEST_TAB', JSON.stringify(
      await pg.evaluate("(!!document.getElementById('tab-pericardio')) ? 'pericardio' : 'otros'"))));
    if (hay('otros')) { R.otros = await pg.evaluate(OTROS); R.asia = await pg.evaluate(ASIA); }
    if (hay('pulm'))  R.pulm  = await pg.evaluate(PULM);
    if (hay('fono'))  R.fono  = await pg.evaluate(FONO);
    if (hay('calc'))  R.calc  = await pg.evaluate(CALC);
    if (hay('cc')) {
      R.cc = await pg.evaluate(CC);
      /* Con clics REALES y lecturas tras la transicion, que es el defecto del commit 2. */
      R.ccclic = {};
      await pg.evaluate("try{showTab('congenitas')}catch(e){}");
      await pg.waitForTimeout(260);
      R.ccclic.ini = await pg.evaluate(CC);
      await pg.click('#cc-subtab-compl'); await pg.waitForTimeout(300);
      R.ccclic.trasCompl = await pg.evaluate(CC);
      await pg.click('#cc-subtab-frec2'); await pg.waitForTimeout(300);
      R.ccclic.vuelta = await pg.evaluate(CC);
      /* Y por un camino que NO es la barra: el drawer / showTab directo. */
      await pg.evaluate("try{showTab('congenitas2')}catch(e){}"); await pg.waitForTimeout(300);
      R.ccclic.porShowTab = await pg.evaluate(CC);
    }
    if (hay('ctrl')) {
      const ESC = {
        vacio: '',
        peri: "sv('pericardio','Derrame moderado (10-20mm)');",
        pulm: "sv('pul_derrame','si');sv('pul_derrame_tam','moderado');sv('pul_balik','25');",
        valv: "sv('im_vc','8');sv('onda_e','90');sv('e_prima_sept','5');sv('ai_vol','90');sv('peso','80');sv('talla','180');"
      };
      R.ctrl = {};
      for (const k of Object.keys(ESC)) {
        R.ctrl[k] = await pg.evaluate(CTRL.replace('ESCENA', ESC[k]));
      }
    }
    if (hay('otrclic')) {
      /* ⚠️ EL COLOR SE LEE DESPUES DE LA TRANSICION, y en otra llamada que el clic.
         `.tab-btn` lleva `transition: all .15s`, asi que leerlo en el mismo turno devuelve un
         valor INTERMEDIO de la animacion —medido rgb(62,153,154) entre el teal y el gris— y la
         regla parece no ganar. Costo dos diagnosticos falsos. */
      R.otrclic = {};
      for (const tema of ['oscuro','claro']) {
        await pg.evaluate("document.documentElement.classList." + (tema === 'claro' ? 'add' : 'remove') + "('light-mode')");
        await pg.evaluate("(() => { if (typeof showTab === 'function') showTab('otros'); return true })()");
        const paso = {};
        const pasos = [['ini', null], ['trasClic', '#otr-subtab-variantes'],
                       ['vuelta', '#otr-subtab-burbuja'], ['trasShowTab', '#otr-subtab-variantes']];
        for (const [k, sel] of pasos) {
          if (sel) { await pg.click(sel); await pg.waitForTimeout(260) }
          if (k === 'trasShowTab') {
            await pg.evaluate("showTab('datos')"); await pg.evaluate("showTab('otros')");
            await pg.waitForTimeout(260);
          }
          paso[k] = await pg.evaluate(OTRCLIC);
        }
        R.otrclic[tema] = paso;
      }
      await pg.evaluate("document.documentElement.classList.remove('light-mode')");
    }
    if (hay('infpul')) {
      const E = {
        basico: "sv('pul_derrame','si');sv('pul_derrame_tam','moderado');sv('pul_derrame_lado','derecho');sv('pul_balik','25');sv('pul_lineasb','si');sv('pul_lineasb_pat','difuso');",
        basicoFuera: "sv('pul_derrame','si');sv('pul_derrame_tam','severo');sv('pul_balik','200');",
        periYpulm: "sv('pericardio','Derrame moderado (10-20mm)');sv('pul_derrame','si');sv('pul_derrame_tam','moderado');sv('pul_balik','25');",
        avanzado: "sv('pua_desliz','presente');sv('pua_lineasa','presentes');sv('pua_lineasb','presentes');sv('pua_lineasb_cant','multiples');sv('pua_derrame','si');sv('pua_derrame_lado','bilateral');sv('pua_balik','30');sv('pua_consol','si');sv('pua_consol_bronco','con');const b=document.querySelector('[data-am-k=pulm]'); if(b) b.click();",
        avanzadoYperi: "sv('pericardio','Derrame moderado (10-20mm)');sv('pua_desliz','presente');sv('pua_derrame','si');sv('pua_derrame_lado','bilateral');sv('pua_balik','30');const b=document.querySelector('[data-am-k=pulm]'); if(b) b.click();"
      };
      R.infpul = {};
      for (const k of Object.keys(E)) R.infpul[k] = await pg.evaluate(INFPUL.replace('ESCENA', E[k]));
    }
    if (hay('pdf')) {
      const E = {
        avanzado: "sv('pua_desliz','presente');sv('pua_lineasa','presentes');sv('pua_derrame','si');sv('pua_derrame_lado','bilateral');sv('pua_balik','30');sv('pua_consol','si');sv('pua_consol_bronco','con');sv('pua_lineasb','presentes');const b=document.querySelector('[data-am-k=pulm]'); if(b) b.click();",
        basico: "sv('pul_derrame','si');sv('pul_derrame_tam','moderado');sv('pul_balik','25');",
        vacio: ''
      };
      R.pdf = {};
      for (const k of Object.keys(E)) {
        await pg.evaluate(`(() => { if (typeof limpiarCampos === 'function') { try { limpiarCampos() } catch (e) {} }
          const sv = (id, v) => { const e = document.getElementById(id); if (!e) return false;
            e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
            e.dispatchEvent(new Event('change', { bubbles: true })); return true };
          ESC
          if (typeof generarInforme === 'function') { try { generarInforme() } catch (e) {} }
          return true })()`.replace('ESC', E[k]));
        R.pdf[k] = await pg.evaluate(PDF);
      }
    }
    if (hay('drawer')) R.drawer = await pg.evaluate(DRAWER);
    if (hay('excel')) {
      const ESC2 = { vacio: '', peri: "const e=document.getElementById('pericardio'); if(e){e.value='Derrame moderado (10-20mm)';e.dispatchEvent(new Event('change',{bubbles:true}))}",
        pulm: "['pul_derrame','pul_derrame_tam'].forEach((id,i)=>{const e=document.getElementById(id); if(e){e.value=['si','moderado'][i];e.dispatchEvent(new Event('change',{bubbles:true}))}}); const b=document.getElementById('pul_balik'); if(b){b.value='25';b.dispatchEvent(new Event('input',{bubbles:true}))}" };
      R.excel = {};
      for (const k of Object.keys(ESC2)) R.excel[k] = await pg.evaluate(EXCEL.replace('ESCENA', ESC2[k]));
    }
    if (hay('maqueta')) {
      const fs = await import('fs');
      try { fs.mkdirSync(DEST, { recursive: true }) } catch (e) {}
      R.maqueta = [];
      const VP = [[1200,700],[1440,800],[768,1024],[390,844],[360,740]];
      for (const [w, h] of VP) for (const tema of ['oscuro','claro']) {
        await pg.setViewportSize({ width: w, height: h });
        const ok = await pg.evaluate(`(() => {
          const d = document.documentElement;
          if (TEMA_CLARO) d.classList.add('light-mode'); else d.classList.remove('light-mode');
          return d.classList.contains('light-mode') === TEMA_CLARO;
        })()`.replace(/TEMA_CLARO/g, tema === 'claro' ? 'true' : 'false'));
        if (!ok) { R.maqueta.push({ w, h, tema, err: 'EL TEMA NO QUEDO' }); continue }
        const m = await pg.evaluate(RAIL);
        const f = DEST + '/' + nombre + '-' + w + 'x' + h + '-' + tema + '.png';
        await pg.screenshot({ path: f });
        R.maqueta.push({ w, h, tema, nRailVis: m.nRailVis, nArribaVis: m.nArribaVis,
          hScroll: m.hScroll, sw: m.sw, cw: m.cw, railDesplaza: m.railScroll
            ? m.railScroll.desplaza : null, png: f });
      }
      await pg.evaluate("document.documentElement.classList.remove('light-mode')");
      await pg.setViewportSize({ width: 1200, height: 700 });
    }
    await pg.close();
  } catch (e) { R.error = e.message.slice(0, 300) }
  try { await b.close() } catch (e) {}
  OUT[nombre] = R;
  console.log('-- parcial ' + nombre + ' --');
  console.log(JSON.stringify(R, null, 1).slice(0, 4000));
}

await corre('chrome', () => chromium.launch({ channel: 'chrome' }));
await corre('webkit', () => webkit.launch());
console.log('===== TOTAL =====');
console.log(JSON.stringify(OUT, null, 1));
