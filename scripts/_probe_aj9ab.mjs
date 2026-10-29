#!/usr/bin/env node
/**
 * _probe_aj9ab.mjs - el A/B de SUPERFICIES de la tanda AJ9 (2026-10-29). Calcado de
 * _probe_bab.mjs, con sus escenas cambiadas por las del SGL: los SIETE bordes de los dos
 * cortes de la ASE 2025, el signo POSITIVO y sus decimales, el dato tipeado en la pestana de
 * Contractilidad y SGL en vez de en AI/VI, y un control NEGATIVO sin SGL.
 *
 * ORIGINAL:
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
  /* ⚠️ LA FEVI VA EN TODAS LAS ESCENAS CON SGL, Y ES EL DENOMINADOR. El informe narrativo
     publica el SGL PEGADO a la FEVI -`if (fevi !== null)`-, asi que una escena con SGL y sin
     FEVI deja la frase del strain fuera del papel y el A/B diria «sin diferencias» sobre una
     superficie que no se emitio. Medido antes de fijar las escenas. */
  vacio:     { campos: {} },
  /* Los SIETE bordes que la orden fija. -18,1 y -20 normales; -18, -17,9, -16,1 y -16
     limitrofes; -15,9 anormal. */
  sgl_m181:  { campos: { fevi: '55', sgl: '-18.1' } },
  sgl_m18:   { campos: { fevi: '55', sgl: '-18' } },
  sgl_m179:  { campos: { fevi: '55', sgl: '-17.9' } },
  sgl_m161:  { campos: { fevi: '55', sgl: '-16.1' } },
  sgl_m16:   { campos: { fevi: '55', sgl: '-16' } },
  sgl_m159:  { campos: { fevi: '55', sgl: '-15.9' } },
  sgl_m20:   { campos: { fevi: '55', sgl: '-20' } },
  /* El SIGNO: el mismo strain tipeado en positivo. El papel tiene que publicarlo NEGATIVO y la
     clasificacion tiene que ser la del valor negativo, no la del positivo. */
  sgl_pos18: { campos: { fevi: '55', sgl: '18' } },
  sgl_pos20: { campos: { fevi: '55', sgl: '20' } },
  /* Los DECIMALES, de los dos lados: el positivo cambia -gana el signo- y el negativo NO puede
     cambiar ni un caracter. Sin el segundo, «se publica negativo» no se distingue de
     «se reescribe el numero». */
  sgl_posdec:{ campos: { fevi: '55', sgl: '18.5' } },
  sgl_negdec:{ campos: { fevi: '55', sgl: '-18.5' } },
  /* El dato tipeado en la PESTANA de Contractilidad y SGL y no en AI/VI. */
  sgl_tab:   { campos: { fevi: '55', sgl_gls: '-17' } },
  /* COMMIT 4 · el criterio del 2,9 del score de amiloidosis, en sus tres bordes. La relacion
     la calcula |apical| / |basal|, asi que 17.4/6 = 2.90 justo, 17.46/6 = 2.91 y 17.34/6 =
     2.89. El corte es ESTRICTO: el 2,90 exacto NO suma. */
  amil289:   { campos: { 'ap-apic': '-17.34', 'ap-base': '-6' } },
  amil290:   { campos: { 'ap-apic': '-17.4',  'ap-base': '-6' } },
  amil291:   { campos: { 'ap-apic': '-17.46', 'ap-base': '-6' } },
  /* El MISMO paciente medido de dos formas, que es lo que el punto 4 manda reportar: el
     septal de cuatro camaras -lo que el corte valido- contra el promedio GLOBAL. */
  amilSept:  { campos: { 'ap-apic': '-18', 'ap-base': '-6' } },
  amilGlob:  { campos: { 'ap-apic': '-18', 'ap-base': '-7.5' } },
  /* CONTROL NEGATIVO: un estudio cargado SIN SGL. Ninguna superficie puede cambiar. */
  ajeno:     { campos: { im_vc: '8', ea_dtsvi: '20', itv_tsvi: '20', itv_ao: '100', vmax_ao: '4.5',
                         onda_e: '110', e_sep: '5', e_lat: '6', ai_vol: '70', peso: '80', talla: '180' } }
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
  ['fevi-interp', 'geom-val', 'ett-score-num', 'ett-score-cat', 'ett-hvi-badge',
   'ap-result', 'co-ctrcd-badge', 'co-riesgo-resultado'].forEach(id => {
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
  /* ══ COMMIT 5 · LA FICHA DE REFERENCIAS ═══════════════════════════════════════════════
     Su texto, su reparto en subpestanas -el paso que la tanda J se olvido con constriccion- y
     el boton «Ver referencia» de las tres tarjetas i de esta tanda. */
  try {
    out._refStrain = N((document.getElementById('ref-strain') || {}).textContent);
    out._refStrainFilas = document.querySelectorAll('#ref-strain table tr').length;
    out._refSubFun = (typeof REF_SUBTAB !== 'undefined') ? REF_SUBTAB.fun.join(',') : 'SIN REGISTRO';
    out._refSubTodas = (typeof REF_SUBTAB !== 'undefined')
      ? Object.keys(REF_SUBTAB).map(k => k + ':' + REF_SUBTAB[k].length).join(' ') : 'SIN REGISTRO';
    /* El invariante: toda entrada ref-<id> con encabezado propio tiene que estar en ALGUNA
       subpestana. Sin esto, «la ficha existe» no se distingue de «la ficha se encuentra». */
    const todas = (typeof REF_SUBTAB !== 'undefined')
      ? [].concat.apply([], Object.keys(REF_SUBTAB).map(k => REF_SUBTAB[k].slice())) : [];
    out._refSinPanel = [].slice.call(document.querySelectorAll('h2.card-head'))
      .map(h => (String(h.getAttribute('onclick') || '').match(/toggleRef\\('([a-z0-9_-]+)'/) || [])[1])
      .filter(Boolean).filter(id => todas.indexOf(id) < 0).join(',') || 'ninguna';
    out._vinfoRefAJ9 = (typeof VINFO_REF !== 'undefined')
      ? ['contr-territorio', 'patrones-sgl', 'amil-apice'].map(k => k + '->' + (VINFO_REF[k] || 'SIN')).join(' ')
      : 'SIN REGISTRO';
    out._vinfoRefAssert = (typeof _vinfoRefAssert === 'function') ? (_vinfoRefAssert().join(' | ') || 'sin fallas') : 'SIN FN';
  } catch (e) { out._refStrain = 'EXC ' + String(e).slice(0, 90) }
  ['ref-pop', 'ref-pulmon', 'ref-cardiotox', 'co-referencia-seccion'].forEach(id => {
    out['_ficha_' + id] = N((document.getElementById(id) || {}).textContent);
  });
  out._manualSello = N((document.getElementById('manual-cuerpo') || document.body).textContent)
    .indexOf('v20260916-0227') > -1 ? 'SELLO VIEJO PRESENTE' : 'sin el sello viejo';
  /* ══ EL CONTROL POSITIVO DE LA TANDA B ═══════════════════════════════════════════════════
     Los TRES nodos de PANTALLA que esta tanda SI cambia. Van con prefijo _pant para que el
     comparador los agrupe aparte de las superficies firmadas. Sin ellos, un «cero diferencias»
     en el bloque A no se distingue de «la sonda no esta mirando nada»: es exactamente el
     denominador que este repo exige al lado de cada A/B. */
  ['sgl-interp', 'sgl-interp-tab'].forEach((id) => {
    const e = document.getElementById(id);
    out['_pant_' + id] = e ? N(e.textContent) : 'NO EXISTE';
    out['_pant_' + id + '_color'] = e ? String(e.style.color || '') : '';
  });
  /* Los dos campos del estudio: NINGUNA escena puede reescribirlos -el campo acepta lo que el
     medico escriba, y eso incluye el signo positivo-. Van sin prefijo _pant porque una
     diferencia aca SI es una regresion. */
  out.campo_sgl = T('sgl');
  out.campo_sgl_gls = T('sgl_gls');
  /* ══ LOS DUENOS, PREGUNTADOS DIRECTO ═══════════════════════════════════════════════════
     Independientes de la escena: fijan los dos cortes y las tres bandas en sus bordes. En HEAD
     no existen, asi que esta linea sale 'SIN FN' y eso es el control de que la sonda mira algo
     que la tanda agrega. */
  try {
    out._cortes = (typeof SGL_NORMAL_MAX !== 'undefined')
      ? [SGL_NORMAL_MAX, SGL_ANORMAL_MIN].join('/') : 'SIN CONSTANTES';
  } catch (e) { out._cortes = 'SIN CONSTANTES' }
  try {
    out._bandas = (typeof sglClasificar === 'function')
      ? [-20, -18.1, -18, -17.9, -16.1, -16, -15.9, 18, 20, 18.5, 0]
          .map(x => x + '=' + ((sglClasificar(x) || {}).clave || 'null')).join(' ')
      : 'SIN FN';
  } catch (e) { out._bandas = 'EXC' }
  try {
    out._signo = (typeof sglNegTxt === 'function')
      ? ['18', '-18', '18.50', '-18.50', '+18', '0', ''].map(x => JSON.stringify(x) + '->'
          + JSON.stringify(sglNegTxt(x))).join(' ') : 'SIN FN';
  } catch (e) { out._signo = 'EXC' }
  /* ══ COMMIT 2 · LOS TERRITORIOS ══════════════════════════════════════════════════════════
     El REPARTO tiene que salir IDENTICO -la tanda no lo toca- y el aviso y el globo son el
     control positivo: sin ellos, «cero diferencias» no se distingue de «la sonda no mira». */
  try {
    out._terrReparto = (typeof CONTR_TERRITORIO !== 'undefined')
      ? Object.keys(CONTR_TERRITORIO).sort().map(k => k + '=' + CONTR_TERRITORIO[k]).join(' ')
      : 'SIN CONSTANTE';
  } catch (e) { out._terrReparto = 'EXC' }
  try {
    const bl = document.querySelector('[data-vinfo="contr-territorio"]');
    out._pant_terrBoton = bl ? 'SI' : 'NO';
    const pan = bl ? bl.closest('div').parentNode : null;
    out._pant_terrPanel = pan ? N(pan.textContent) : 'NO EXISTE';
    out._pant_terrGlobo = (typeof VINFO !== 'undefined' && VINFO['contr-territorio'])
      ? N(JSON.stringify(VINFO['contr-territorio'])) : 'SIN TARJETA';
    /* ⚠️ EL GLOBO NO ABRE CON LA PESTANA CERRADA, y la primera version de esta sonda lo midio
       VACIO sobre una tarjeta que si funciona: _vInfoAbrir llama a _vInfoColocar, que
       devuelve null cuando el boton no tiene caja, y entonces la tarjeta NI SE ABRE. Es la
       trampa que este repo ya documenta: showTab no le da caja a lo que esta dentro de una
       seccion colapsada, asi que hay que abrir la pestana Y la seccion. */
    if (bl && typeof vInfoClic === 'function') {
      try { if (typeof showTab === 'function') showTab('contractilidad') } catch (x) {}
      try { const h = document.querySelector('#sacc-contr .sacc-hdr');
            if (h && h.getAttribute('aria-expanded') !== 'true') h.click() } catch (x) {}
      out._pant_terrBotonCaja = (function () { const r = bl.getBoundingClientRect();
        return Math.round(r.width) + 'x' + Math.round(r.height) })();
      vInfoClic(bl);
      const c = document.getElementById('vinfo-card');
      out._pant_terrGloboAbierto = c ? N(c.textContent).slice(0, 1200) : 'NO ABRE';
      vInfoClic(bl);
    } else { out._pant_terrGloboAbierto = 'SIN BOTON' }
  } catch (e) { out._pant_terrGlobo = 'EXC ' + String(e).slice(0, 80) }
  /* ⚠️ Y EL WMSI: la orden manda PARAR si existe uno en esta pestana. El unico de la app vive
     en el bloque muerto de Eco Estres, asi que se cuenta por su prefijo propio. */
  try {
    out._wmsi = Object.keys(window).filter(k => /wmsi/i.test(k)).sort().join(',') || 'ninguno';
    out._wmsiNodos = [].slice.call(document.querySelectorAll('[id*="wmsi"]')).map(n => n.id).join(',') || 'ninguno';
  } catch (e) { out._wmsi = 'EXC' }
  /* ══ COMMIT 3 · LOS PATRONES DEL OJO DE BUEY ═════════════════════════════════════════════
     Los quince rangos textuales -que NO se tocan-, los dos patrones que la tanda reescribe y
     el rotulo ilustrativo. El registro PATRONES es la fuente; la grilla y el panel de detalle
     son sus dos lectores. */
  try {
    out._patN = (typeof PATRONES !== 'undefined') ? PATRONES.length : -1;
    out._patRangos = (typeof PATRONES !== 'undefined')
      ? PATRONES.map(p => p.id + '=' + p.sgl).join(' | ') : 'SIN REGISTRO';
    out._patAmil = (typeof PATRONES !== 'undefined')
      ? N(JSON.stringify((PATRONES.filter(p => p.id === 'amiloidosis')[0] || {}))) : 'SIN REGISTRO';
    out._patPres = (typeof PATRONES !== 'undefined')
      ? N(JSON.stringify((PATRONES.filter(p => p.id === 'sobrecarga-presion')[0] || {}))) : 'SIN REGISTRO';
    /* Los patrones de MCH: NINGUNO puede nombrar una relacion apice/base. */
    out._patMch = (typeof PATRONES !== 'undefined')
      ? PATRONES.filter(p => /mch/.test(p.id)).map(p => p.id + ':'
          + (/pice.base|2[.,]9/.test(p.sgl + p.descripcion + p.hallazgos) ? 'CON RATIO' : 'sin ratio')).join(' ')
      : 'SIN REGISTRO';
    /* Cuantas veces aparece el 2.9 en los quince patrones: tiene que ser CERO. */
    out._pat29 = (typeof PATRONES !== 'undefined')
      ? PATRONES.filter(p => /2[.,]9/.test(p.sgl + p.descripcion + p.hallazgos)).map(p => p.id).join(',') || 'ninguno'
      : 'SIN REGISTRO';
  } catch (e) { out._patRangos = 'EXC ' + String(e).slice(0, 80) }
  /* Los DOS lectores del rotulo, pintados de verdad. */
  try {
    if (typeof renderGrid === 'function') renderGrid();
    const g = document.getElementById('patron-grid');
    const cel = g ? g.querySelectorAll('.detalle-sgl') : [];
    out._pant_patGrillaN = cel.length;
    out._pant_patGrilla = [].slice.call(cel).map(x => N(x.textContent)).join(' | ');
  } catch (e) { out._pant_patGrilla = 'EXC' }
  try {
    if (typeof selPatron === 'function') selPatron('amiloidosis');
    out._pant_patDetalle = N((document.getElementById('det-sgl') || {}).textContent)
      + ' || ' + N((document.getElementById('det-hallazgos') || {}).textContent);
  } catch (e) { out._pant_patDetalle = 'EXC' }
  try {
    out._pant_patGlobo = (typeof VINFO !== 'undefined' && VINFO['patrones-sgl'])
      ? N(JSON.stringify(VINFO['patrones-sgl'])) : 'SIN TARJETA';
  } catch (e) { out._pant_patGlobo = 'EXC' }
  /* ══ COMMIT 4 · EL 2,9 DEL SCORE ════════════════════════════════════════════════════════
     El corte CONSERVADO -su valor, su operador y sus tres puntos- y el globo que explica de
     donde sale. El control que importa: abrir el globo NO puede marcar el criterio, porque el
     contenedor lleva su propio onclick que suma tres puntos. */
  out._amilRel     = T('ap-result');
  out._amilCrit    = T('ett-apice');
  out._amilChk     = N((document.getElementById('chk-apice') || {}).textContent);
  out._amilScore   = N((document.getElementById('ett-score-num') || {}).textContent);
  out._amilCritTxt = N((document.querySelector('#crit-apice .criterio-nombre') || {}).textContent);
  out._amilDef     = N((document.querySelector('#crit-apice .criterio-def') || {}).textContent);
  try {
    out._pant_amilGlobo = (typeof VINFO !== 'undefined' && VINFO['amil-apice'])
      ? N(JSON.stringify(VINFO['amil-apice'])) : 'SIN TARJETA';
  } catch (e) { out._pant_amilGlobo = 'EXC' }
  /* El control de que el globo no marca el criterio: se CLICKEA de verdad -no se llama a
     vInfoClic-, porque lo que se quiere probar es que el evento no sube al contenedor. */
  try {
    const bA = document.querySelector('#crit-apice [data-vinfo="amil-apice"]');
    if (bA) {
      const antes = T('ett-apice') + '|' + N((document.getElementById('ett-score-num') || {}).textContent);
      bA.click();
      const despues = T('ett-apice') + '|' + N((document.getElementById('ett-score-num') || {}).textContent);
      out._amilGloboNoMarca = (antes === despues) ? ('NO MARCA (' + antes + ')') : ('MARCA ' + antes + ' -> ' + despues);
      bA.click();
    } else { out._amilGloboNoMarca = 'SIN BOTON' }
  } catch (e) { out._amilGloboNoMarca = 'EXC ' + String(e).slice(0, 70) }
  /* El rotulo de la alerta del Laboratorio que lee el corte anormal. */
  try {
    out._labAlertas = (typeof _labIndicadoresList === 'function')
      ? _labIndicadoresList([]).map(x => x.lbl).join(' || ') : 'SIN FN';
  } catch (e) { out._labAlertas = 'EXC' }
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
