/* Cuerpo de la sonda de la TAREA 5 (PR6-5). SIN ACENTOS GRAVES a proposito. */
(() => {
  const out = {};
  const g = (id) => document.getElementById(id);
  const set = (id, val) => { const e = g(id); if (!e) return false;
    e.value = String(val); e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return true; };
  const hay = (n) => { try { return typeof window[n] === 'function' } catch (e) { return false } };
  const FRASE = 'Revisar el di' + String.fromCharCode(225) + 'metro del tracto de salida';

  /* ══ ESCENA: DISCORDANCIA DE GRADO -- grado «severa» consignado con mediciones que no lo dan ══
     ⚠️ DENOMINADOR: sin discordancia esta rama no se emite y la frase no estaria por no haber
     entrado nunca, que se lee igual que «se retiro». Se monta la discordancia de verdad y se
     confirma que la app la DETECTA antes de afirmar nada. */
  /* ⚠️ LA ESCENA ES LA DE TC-1034, Y LA PRIMERA QUE ESCRIBI NO MONTABA NINGUNA DISCORDANCIA:
     con mediciones leves y el grado consignado «severa», el sincronizador de severidad le gana al
     select y el escenario volvia «grado=leve, disc=false» -o sea un denominador VACIO sobre el que
     medir la ausencia de la frase no dice nada-. La que discrimina es al reves: mediciones SEVERAS
     con el grado consignado «moderada». */
  try { if (hay('limpiarCampos')) limpiarCampos(); } catch (e) {}
  [['nombre','Disc'],['fecha','2026-11-23'],['edad','70'],['sexo','M'],['peso','80'],['talla','172'],
   ['diam_tsvi','20'],['itv_tsvi','18'],['itv_ao','71'],
   ['vmax_ao','4.6'],['gmedio_ao','55'],['fevi','60'],['va_morf','Calcificada'],
   ['vol_lat','80'],['hemo_fc','70'],['ea_grado','moderada']
  ].forEach((p) => set(p[0], p[1]));
  out.escena = {
    discordancia: (function () { try {
      const r = hay('eaEscenario') ? eaEscenario() : null;
      return r ? ('grado=' + r.grado + ' esperado=' + r.esperado
                  + ' disc=' + !!r.discordanciaGrado) : 'SIN RESULTADO';
    } catch (e) { return 'ERR: ' + String(e && e.message || e) } })()
  };
  try { if (hay('generarInforme')) generarInforme(); } catch (e) {}
  const inf = String((g('informe_texto') || {}).value || '');
  const suma = String((g('en_suma') || {}).value || '');
  out.informe = {
    /* DENOMINADOR: el informe SI describe la discordancia -si no, medir su ausencia no dice nada. */
    describeLaDiscordancia: inf.indexOf('no coincide con las mediciones') >= 0,
    conservaElGrado: inf.indexOf('corresponder') >= 0,
    laFrase: inf.indexOf(FRASE) >= 0,
    frasEnSuma: suma.indexOf(FRASE) >= 0,
    muestra: (function () { const i = inf.indexOf('no coincide');
      return i < 0 ? '(no describe)' : inf.slice(Math.max(0, i - 90), i + 180); })()
  };

  /* ══ EL PDF, GENERADO DE VERDAD ══ */
  const pdfBytes = () => {
    let cap = null;
    const J = window.jspdf && window.jspdf.jsPDF;
    if (!J) return null;
    window.jspdf.jsPDF = function (o) {
      const d = new J(o);
      d.save = function () { try { cap = this.output('datauristring') } catch (e) {} return this };
      return d;
    };
    try { if (hay('_pdfAjustarA4')) _pdfAjustarA4(); } catch (e) {}
    window.jspdf.jsPDF = J;
    if (!cap) return null;
    try { return atob(String(cap).split(',')[1]) } catch (e) { return null }
  };
  const b = pdfBytes();
  out.pdf = { bytes: b ? b.length : 'SIN PDF',
    /* El fragmento se busca en ASCII: el PDF va en WinAnsi y la «á» no sobrevive. */
    laFrase: b ? (b.indexOf('metro del tracto de salida') >= 0) : 'SIN PDF',
    describeLaDiscordancia: b ? (b.indexOf('no coincide con las mediciones') >= 0) : 'SIN PDF' };

  /* ══ EL AVISO DE PANTALLA NO SE TOCO ══ */
  out.pantalla = (function () {
    const cands = ['ea-manual-aviso', 'ea-sev', 'ea-fund'];
    return cands.map((id) => { const e = g(id);
      return id + '=' + (!e ? 'SIN NODO' : (e.textContent || '').trim().slice(0, 70)); }).join(' || ');
  })();

  /* ══ LAS CUATRO NOTAS, EN SU PROPIA ESCENA ══
     ⚠️ LA SECCION NO ABRE CON UNA ESTENOSIS QUE NO ES SEVERA NI MODERADA, y con la escena de la
     discordancia -que es de grado y no de area- devolvia null: «LA SECCION NO ABRE» se lee igual
     que «las notas no estan». Se siembra un area severa, que es su compuerta. */
  try { set('itv_ao', '98'); set('itv_tsvi', '19'); set('vmax_ao', '4.4'); set('gmedio_ao', '48'); } catch (e) {}
  out.evid = (function () {
    let r = null;
    try { r = (typeof _indEA === 'function') ? _indEA() : null; } catch (e) { return 'ERR: ' + String(e && e.message || e); }
    if (!r) return 'LA SECCION NO ABRE';
    const notas = (r.notas || []).map((n) => (typeof n === 'string') ? { txt:n, refs:null } : n);
    const unir = notas.map((n) => n.txt).join(' @@ ');
    return {
      n: notas.length,
      conRefs: notas.filter((n) => n.refs && n.refs.length).length,
      /* Los cuatro contenidos, cada uno por una frase propia suya. */
      c1_calcioParadojal: unir.indexOf('paradojal') >= 0
        && unir.indexOf('score de calcio') >= 0 && unir.indexOf('e90') >= 0,
      c2_medicionTsvi: unir.indexOf('errores de medici') >= 0 && unir.indexOf('4670') >= 0,
      c3_vtiFeviReducida: unir.indexOf('sin bajo flujo') >= 0
        && unir.indexOf('varias ventanas') >= 0,
      c4_discordancia: unir.indexOf('no coincide con las mediciones') >= 0
        && unir.indexOf('4663') >= 0,
      /* Los folios, uno por uno. */
      folios: ['e90', 'e92', '4663', '4664', '4666', '4670']
        .map((f) => f + ':' + (unir.indexOf(f) >= 0 ? 1 : 0)).join(' '),
      /* ⚠️ LA REGLA FIJA DEL 2026-11-04: ningun texto compara dos fuentes ni dice que algo falta. */
      comparaFuentes: ['no coinciden', 'difieren', 'discrepan', 'se contradicen', 'no se encontr',
                       'ninguna gu', 'a diferencia de', 'mientras la gu']
        .filter((f) => unir.toLowerCase().indexOf(f.toLowerCase()) >= 0).join(','),
      /* Ni conducta: la Evidencia SI puede recomendar, pero estas cuatro son DESCRIPTIVAS. */
      refsUsadas: notas.filter((n) => n.refs).map((n) => n.refs.join('+')).join(' | ')
    };
  })();
  /* Y la bibliografia de las dos entradas gano sus folios de la aortica. */
  out.biblio = (function () {
    if (typeof IND_REFS === 'undefined') return 'NO';
    const uno = (k) => (IND_REFS.filter((x) => x.k === k)[0] || {}).full || '';
    return { aha_e90: uno('ahaVc2020').indexOf('e90') >= 0,
             aha_e92: uno('ahaVc2020').indexOf('e92') >= 0,
             aha_mitralIntacta: uno('ahaVc2020').indexOf('e121') >= 0 };
  })();
  return out;
})()
