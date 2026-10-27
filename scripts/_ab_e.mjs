#!/usr/bin/env node
/**
 * _ab_e.mjs - el A/B de SUPERFICIES de la tanda E (2026-10-27). Calcado de _probe_bab.mjs,
 * que es el unico de la familia SIN el defecto del `RECALC_MODULOS.forEach` (ver abajo).
 * Agrega las nueve escenas de la tanda E y cambia los nodos del control positivo.
 *
 * ORIGEN:
 * _probe_bab.mjs - el A/B de SUPERFICIES de la tanda B (2026-10-27). Calcado de _probe_aab.mjs;
 * lo unico que agrega son las TRES escenas con UNA sola fuente de PAM, que es donde el
 * encabezado de la tanda exige CERO diferencias, y una CUARTA con dos que difieren.
 * Calcado de _probe_r2ab.mjs. Agrega cuatro escenas -fallot, vexus, conco, pop-, el PPT,
 * y el TEXTO del panel de Evidencia y de las tres fichas de Referencias que la tanda toca:
 * ahi SI tiene que haber diferencias, y es lo unico que puede tenerlas.
 *
 * Volca, para cada escena, las superficies firmadas y las de pantalla, y se corre DOS veces
 * -contra el arbol vivo y contra una copia de HEAD- para comparar con `_ab_r2diff.mjs`.
 * Cada superficie se enumera UNA POR UNA: informe en los tres estilos, EN SUMA, Excel con sus
 * 440 columnas CLAVE POR CLAVE, campos del estudio, PDF generado de verdad en sus seis
 * plantillas, PPT, PDF de auditoria y el Laboratorio por sus funciones dueñas.
 *
 *   node scripts/_probe_r2ab.mjs --file /tmp/head_r2.html --out /tmp/ab_head.json
 *   node scripts/_probe_r2ab.mjs --out /tmp/ab_nuevo.json --solo vacio,derrame
 *
 * ADVERTENCIA: sin acentos graves dentro del template de la sonda.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CAND })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/ab_a.json';

/* ══ LAS ESCENAS ═══════════════════════════════════════════════════════════════════════
   Cada una es un objeto de campos + los gestos que no son un campo. El escenario AJENO existe
   para probar que la sonda distingue escenarios: ninguna parte de esta tanda lo toca. */
const ESCENAS = {
  vacio:   { campos: {} },
  derrame: { campos: {}, sel: { pericardio: 'Derrame moderado (10-20mm)', pericardio_hemo: 'no' } },
  vab:     { campos: { ao_sin: '46', ao_tub: '47' }, pastillas: [['aortica', 'esten']],
             sel: { vab_fenotipo: 'rl', va_morf: 'Bicúspide' } },
  htp:     { campos: { vmax_it: '2.8', vd_bas: '45', vd_vi: '0.9', tapse: '18', ip_ap_diam: '28',
                       ao_sin: '30', vci_diam: '24', ad_area: '16', tvia: '120' },
             sel: { vci_col: '>50' } },
  hemo:    { campos: { peso: '80', talla: '180', fc: '70', pam: '90', ddfvi: '50', vsfvi: '35',
                       onda_e: '90', e_sep: '8', e_lat: '10', diam_tsvi_ao: '20', itv_tsvi: '20' } },
  amil:    { campos: { ett_septo_x: '' } },   /* los de amiloidosis van por su propio grupo */
  /* La escena de constriccion/restriccion: el e' medial en el tramo que el R2-E4 mueve, con un
     criterio especifico cargado para que la cascada llegue a clasificar. */
  cvr:     { campos: { e_sep: '7', e_lat: '12', onda_e: '100' },
             sel: { cvr_rebote: 'si', resp_var_tric: '45' } },
  /* La de amiloidosis: septo ASIMETRICO, que es la escena que el R2-E5 pide mostrar. */
  amilo:   { campos: { rwt_septo_x: '' } },
  /* ══ ESCENAS NUEVAS DE LA TANDA A ═══════════════════════════════════════════════════════
     Despiertan las cuatro secciones compactas que la sonda de la R2 no cubria. Si una no
     despierta, el `_ev` de su medicion sale vacio y el denominador lo dice. */
  fallot:  { campos: { tdf_grad_tsvd: '30', tdf_vtsvdi: '90', tdf_vtdvdi: '170', fevd: '40',
                       fevi: '45', ip_vmax: '2.6', vmax_it: '3.2' },
             sel: { tdf_civ_residual: 'no', tdf_sintomas: 'no', tdf_func_vd: 'moderada',
                    tdf_vol_fuente: 'rmc', tdf_ejercicio: 'si', ip_grado: 'Severa' } },
  /* La de amiloidosis: el modulo pide espesor Y puntos del score, si no _indAmil no despierta
     -medido: las escenas amil y amilo de la R2 dan CERO secciones-. */
  amiloid: { campos: {}, sel: { 'ett-septo': '16', 'ett-pp': '14', 'ett-rwt': '1', 'ett-ee': '1',
                                'ett-cual-1': '1', 'ett-cual-2': '1' } },
  vexus:   { campos: { vci_diam: '24' }, sel: { vexus_sh: '2', vexus_pv: '1', vexus_ir: '2' } },
  conco:   { campos: { co_fevi_basal: '60', co_fevi_actual: '45', co_dosis_antrac: '300',
                       co_gls_basal: '-20', co_gls_actual: '-15' },
             sel: { co_farmaco: 'inmunoterapia', co_troponi: 'si' } },
  pop:     { campos: { pop_cx_horas: '12' },
             sel: { pop_cx_tipo: 'cabg', pop_asist_tipo: 'ecmo_va', pop_pleura_der: 'moderado' } },
  /* ══ ESCENAS DE LA TANDA B ═══════════════════════════════════════════════════════════
     Las tres con UNA sola fuente de PAM -donde el papel tiene que salir IDENTICO- y una
     cuarta con dos que difieren, que es la unica donde se permite una diferencia y donde
     ademas sirve de control de que la sonda distingue escenarios. El posoperatorio va
     poblado en las cuatro: es el modulo que publica la PAM en una hoja del PDF. */
  pamI:    { campos: { peso: '80', talla: '175', pop_cx_horas: '8', pop_sw_pam: '58',
                       pop_sw_gc: '4.2', pop_sw_pad: '9', pop_sw_pcp: '14', pop_sw_paps: '38',
                       pop_sw_papd: '18', diam_tsvi: '21', itv_tsvi: '18', hemo_fc: '75' },
             sel: { pop_monitor: 'swan' } },
  pamT:    { campos: { peso: '80', talla: '175', pop_cx_horas: '8', hemo_pam: '95',
                       diam_tsvi: '21', itv_tsvi: '18', hemo_fc: '75', vci_diam: '22' } },
  pamC:    { campos: { peso: '80', talla: '175', pop_cx_horas: '8', ao_pas: '120', ao_pad: '70',
                       diam_tsvi: '21', itv_tsvi: '18', hemo_fc: '75', vci_diam: '22' } },
  pamIT:   { campos: { peso: '80', talla: '175', pop_cx_horas: '8', pop_sw_pam: '58',
                       pop_sw_gc: '4.2', pop_sw_pad: '9', pop_sw_pcp: '14', hemo_pam: '95',
                       diam_tsvi: '21', itv_tsvi: '18', hemo_fc: '75' },
             sel: { pop_monitor: 'swan' } },
  ajeno:   { campos: { im_vc: '8', ea_dtsvi: '20', itv_tsvi: '20', itv_ao: '100', vmax_ao: '4.5',
                       onda_e: '110', e_sep: '5', e_lat: '6', ai_vol: '70', peso: '80', talla: '180' } },
  /* ══ ESCENAS DE LA TANDA E ══════════════════════════════════════════════════════════════
     Las TRES del Carpentier -las dos donde el papel SI cambia (salia dos y tres veces) y una
     donde NO puede cambiar-, la del aviso de la IM secundaria, la de la tricuspide, la de la
     protesis mitral, las dos del strain -una que cambia y una que no- y la de la orejuela. */
  carpTT:  { campos: { im_vc: '7' }, pastillas: [['mitral', 'insuf']],
             sel: { vm_morf: 'Prolapso / EVMS', vm_carp: 'II', vm_tipo_im: 'secundaria' } },
  carpETE: { campos: { im_vc: '7' }, pastillas: [['mitral', 'insuf']],
             chks: ['ete-es-ete', 'ete_morfo_incluir_chk'],
             sel: { vm_morf: 'Prolapso / EVMS', ete_carpentier: 'IIIb',
                    vm_tipo_im: 'secundaria', ete_etiologia: 'barlow' } },
  /* CONTROL NEGATIVO del Carpentier: sin insuficiencia el parentesis no habla, asi que la frase
     de prolapso sigue siendo la unica voz y el papel tiene que salir IDENTICO a HEAD. */
  carpSin: { campos: {}, sel: { vm_morf: 'Prolapso / EVMS', vm_carp: 'II' } },
  imsecE:  { campos: { pisa_r: '5', pisa_val: '95.5', im_vmax: '5' },
             pastillas: [['mitral', 'insuf']], sel: { vm_tipo_im: 'secundaria' } },
  tricE:   { campos: {}, pastillas: [['tricusp', 'esten']], sel: { et_grado: 'Significativa' } },
  protE:   { campos: { em_vmax: '1.8', em_gmedio: '6', thp: '110' },
             pastillas: [['mitral', 'esten']], sel: { vm_morf: 'Prótesis mecánica' } },
  strE12:  { campos: { vd_strain_pl: '-12', tapse: '22', s_prime: '13' } },
  strE18:  { campos: { vd_strain_pl: '-18', tapse: '22', s_prime: '13' } },
  orejE:   { campos: { oai_ostium_diam: '36', oai_profundidad: '25', oai_vel_vac: '30' } }
};
const SOLO = (arg('--solo') || Object.keys(ESCENAS).join(',')).split(',').map(s => s.trim());

const MONTAR = `((esc) => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  Object.keys(esc.campos || {}).forEach(k => { if (esc.campos[k] !== '') S(k, esc.campos[k]) });
  Object.keys(esc.sel || {}).forEach(k => S(k, esc.sel[k]));
  /* Las CASILLAS no se ponen con .value: S() escribiria la cadena en una propiedad que el
     checkbox ignora y la escena no llegaria a su compuerta. Es el denominador de carpETE.
     ADVERTENCIA: sin acentos graves aca adentro - esto vive dentro del template MONTAR. */
  (esc.chks || []).forEach(id => { const e = document.getElementById(id);
    if (e && !e.checked) { e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })) } });
  (esc.pastillas || []).forEach(p => { const b = document.getElementById('pill-' + p[1] + '-' + p[0]);
    if (b && !b.classList.contains('btn-primary')) b.click() });
  /* Todos los calculadores, para que no haya desfase por el orden de carga. */
  Object.keys(window).forEach(k => { if (/^calc[A-Z]/.test(k) && typeof window[k] === 'function') {
    try { window[k]() } catch (e) {} } });
  /* ADVERTENCIA: era RECALC_MODULOS.forEach, y RECALC_MODULOS es una FUNCION: tiraba
     TypeError, el catch lo tragaba y el embudo de restauracion NUNCA corria. Viene asi desde
     _probe_r2ab.mjs, o sea que varias tandas midieron su A/B sin pasar por el embudo. Lo
     destapo la tanda B al agregarle una entrada y ver que el A/B no la tocaba. */
  try { if (typeof _recalcModulos === 'function') _recalcModulos('ab'); } catch (e) {}
  return true;
})(ESC)`;

const MEDIR = `(() => {
  const out = {};
  const T = (id) => { const e = document.getElementById(id); return e ? String(e.value || e.textContent || '') : 'NO EXISTE' };
  /* 1-3 · EL INFORME EN LOS TRES ESTILOS, y 4 · su EN SUMA. El estilo es estado de SESION. */
  ['estandar', 'narrativo', 'conciso'].forEach(st => {
    try { if (typeof setEstiloInforme === 'function') setEstiloInforme(st) } catch (e) {}
    try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
    out['informe_' + st] = T('informe_texto');
    out['suma_' + st] = T('en_suma');
  });
  try { if (typeof setEstiloInforme === 'function') setEstiloInforme('estandar') } catch (e) {}
  try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
  /* 5 · EL EXCEL, clave por clave. */
  try {
    const campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
      if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
      campos[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || '');
    });
    out._camposN = Object.keys(campos).length;
    out._camposClaves = Object.keys(campos).sort().join(',');
    out._campos = campos;
    const fila = (typeof _labExcelRow === 'function') ? _labExcelRow({ campos: campos, fecha: '2026-10-21' }) : null;
    out._excelN = fila ? Object.keys(fila).length : 'SIN FN';
    out._excel = fila || {};
  } catch (e) { out._excelErr = String(e).slice(0, 140) }
  /* 6 · El LABORATORIO por sus funciones dueñas. */
  const inf = { campos: out._campos || {}, fecha: '2026-10-21',
                informe: out.informe_estandar || '', en_suma: out.suma_estandar || '' };
  ['_labDiastGrado', '_labGeomCat', '_labValvCounts', '_labEmLectura', '_labDisfSistVent',
   '_labEstenSev', '_labHtpProb', '_labFevi'].forEach(fn => {
    try { out['lab_' + fn] = (typeof window[fn] === 'function')
      ? JSON.stringify(window[fn](inf, 'em_grado')) : 'SIN FN' } catch (e) { out['lab_' + fn] = 'EXC' }
  });
  /* 7 · Las capsulas de pantalla de las zonas que esta tanda toca. */
  ['htp2022-catA', 'htp2022-catB', 'htp2022-catC', 'htp2022-prob', 'htp2022-vrt-interp',
   'dpt-concl-badge', 'dpt-tam-eco', 'vab-concl', 'cx-concl-badge', 'ett-score-num',
   'ett-score-cat', 'ett-hvi-badge', 'ett-cual-count', 'hemo-ic', 'hemo-rvs', 'hemo-perfil',
   'hemo-forrester', 'oai-elegibilidad', 'pua-patron', 'co-ctrcd-badge'].forEach(id => {
    out['pant_' + id] = T(id);
  });
  /* ══ 8 · EL PANEL DE EVIDENCIA Y LAS FICHAS QUE LA TANDA TOCA ══════════════════════════════
     Aca SI tiene que haber diferencias: es lo unico que la tanda A cambia. Se mide para poder
     mostrarlas una por una y para probar que la sonda DISTINGUE escenarios -si saliera igual en
     los dos lados, el A/B no estaria mirando lo que la tanda toco-. */
  try { if (typeof indicRender === 'function') indicRender() } catch (e) {}
  /* La barra invertida va DOBLE: esta linea vive dentro de un template de JavaScript, que
     consume una, y /\\s+/ escrito simple llegaba al navegador como /s+/ — o sea borraba
     todas las ESES del texto medido. Paso inadvertido una corrida entera: el volcado decia
     «ademá valor» y «Mecani mo». Afectaba a los DOS lados igual, asi que el A/B seguia
     siendo valido, pero el texto era ilegible y una diferencia de solo eses quedaba tapada. */
  const N = (s) => String(s || '').replace(/\\s+/g, ' ').trim();
  const cu = document.getElementById('indic-cuerpo');
  out._evN = cu ? cu.querySelectorAll('details').length : -1;
  out._evSecs = cu ? [].slice.call(cu.children).filter(d => d.tagName === 'DETAILS')
    .map(d => N((d.querySelector('summary') || {}).textContent)).join(' || ') : 'SIN PANEL';
  out._evCompactas = cu ? cu.querySelectorAll('[data-ind-compacta]').length : -1;
  out._evTexto = N(cu ? cu.textContent : '');
  ['ref-pop', 'ref-pulmon', 'ref-cardiotox', 'co-referencia-seccion'].forEach(id => {
    out['_ficha_' + id] = N((document.getElementById(id) || {}).textContent);
  });
  out._manualSello = N((document.getElementById('manual-cuerpo') || document.body).textContent)
    .indexOf('v20260916-0227') > -1 ? 'SELLO VIEJO PRESENTE' : 'sin el sello viejo';
  /* ══ EL CONTROL POSITIVO DE LA TANDA B ═══════════════════════════════════════════════════
     Los nodos de PANTALLA que esta tanda SI cambia. Van con prefijo _pant para que el
     comparador los agrupe aparte de las superficies firmadas. Sin ellos, un «cero diferencias»
     en el bloque A no se distingue de «la sonda no esta mirando nada»: es exactamente el
     denominador que este repo exige al lado de cada A/B. */
  ['vm-carp-origen', 'vm-carp-aviso', 'im-sec-alt', 'et-evid-aviso', 'oai-notas',
   'vd_strain_pl-grado', 'ao-ref-pam'].forEach((id) => {
    const e = document.getElementById(id);
    out['_pant_' + id] = e ? N(e.textContent) : 'NO EXISTE';
  });
  return out;
})()`;

/* ══ 10 · EL PPT, espiando a PptxGenJS ═══════════════════════════════════════════════════════ */
const PPT = `(async () => {
  if (typeof window.PptxGenJS === 'undefined') return { err: 'SIN PPTXGENJS' };
  const Orig = window.PptxGenJS;
  const reg = { textos: [], slides: 0 };
  window.PptxGenJS = function (...a) {
    const p = new Orig(...a);
    const oa = p.addSlide.bind(p);
    p.addSlide = function (...z) { reg.slides++; const s = oa(...z);
      const ot = s.addText.bind(s);
      s.addText = function (t, ...r) { reg.textos.push(JSON.stringify(t).slice(0, 400)); return ot(t, ...r) };
      return s; };
    p.writeFile = function () { return Promise.resolve(true) };
    p.write = function () { return Promise.resolve('') };
    return p;
  };
  Object.keys(Orig).forEach(k => { try { window.PptxGenJS[k] = Orig[k] } catch (e) {} });
  /* ⚠️ EL DENOMINADOR DEL PPT: generarPPT(id) exige un estudio GUARDADO con informe y
     contesta DOS modales. La primera version de esta sonda lo llamaba con el id de un boton y
     devolvia «0 diapositivas, sin error», que es indistinguible de «el PPT no cambio». Aca se
     inyecta un estudio sintetico armado con los campos de la escena y se contestan los dos
     modales, asi que el constructor corre de verdad. Si slides sale 0, la medicion NO vale. */
  const campos = {};
  document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
    campos[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || '');
  });
  campos.informe_texto = String((document.getElementById('informe_texto') || {}).value || '');
  campos.en_suma = String((document.getElementById('en_suma') || {}).value || '');
  campos['med-nombre'] = 'Medico de prueba';
  const ESTU = { id: '__ab__', fecha: '2026-10-26', nombre: 'AB Tanda A', campos: campos };
  const oGI = window.getInformes, oTema = window._pptElegirTema, oQuien = window._pptElegirPresentador;
  window.getInformes = function () { return [ESTU] };
  window._pptElegirTema = function (cb) { return cb('dark') };
  window._pptElegirPresentador = function (inf, cb) { return cb('Medico de prueba') };
  let err = null;
  try { if (typeof generarPPT === 'function') await generarPPT('__ab__'); } catch (e) { err = String(e).slice(0, 140) }
  await new Promise(r => setTimeout(r, 900));
  window.getInformes = oGI; window._pptElegirTema = oTema; window._pptElegirPresentador = oQuien;
  window.PptxGenJS = Orig;
  return { slides: reg.slides, n: reg.textos.length, txt: reg.textos.join(' | '), err: err };
})()`;

/* 8-9 · EL PDF GENERADO DE VERDAD en sus seis plantillas, espiando el constructor de jsPDF. */
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
    r[p] = { n: reg.textos.length, figs: reg.nFigs, txt: reg.textos.join(' | ') };
  }
  window.jspdf.jsPDF = Orig;
  return r;
})()`;

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE };
try {
  const pg = await b.newPage({ viewport: { width: 1200, height: 700 } });
  pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([e.message.slice(0, 150)]) });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
  await pg.waitForTimeout(1500);
  for (const k of SOLO) {
    if (!ESCENAS[k]) continue;
    await pg.evaluate(MONTAR.replace('ESC', JSON.stringify(ESCENAS[k])));
    /* ⚠️ EL DEBOUNCE DE 220 ms TIENE QUE HABER CORRIDO ANTES DE MEDIR. Los campos se ponen
       despachando `input` y `change`, asi que el barrido de espejos queda AGENDADO: midiendo en
       el acto se lee el arbol de antes del barrido, y los tres nodos de pantalla de la PAM
       salen vacios en los dos lados. Medido: sin esta espera el control positivo daba cero. */
    await new Promise((r) => setTimeout(r, 500));
    OUT[k] = await pg.evaluate(MEDIR);
    OUT[k]._pdf = await pg.evaluate(PDF);
    OUT[k]._ppt = await pg.evaluate(PPT);
    console.log('-- escena ' + k + ' medida (campos=' + OUT[k]._camposN + ' excel=' + OUT[k]._excelN
      + ' secciones de Evidencia=' + OUT[k]._evN + ' compactas=' + OUT[k]._evCompactas
      + ' ppt=' + (OUT[k]._ppt || {}).n + ') --');
  }
  await pg.close();
} catch (e) { OUT._err = String(e).slice(0, 250) }
try { await b.close() } catch (e) {}
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF + ' (' + fs.statSync(OUTF).size + ' bytes)');
