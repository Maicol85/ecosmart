#!/usr/bin/env node
/** _probe_pant21prot.mjs - PANT-21: las CUATRO secciones de Evidencia de protesis.
 *  Un solo arnes, parametrizado por posicion (--pos va|vm|vt|vp), con el gesto real y el
 *  panel de Evidencia ABIERTO por su boton.
 *  Mide: (A) la seccion aparece SOLO con su valvula protesica (control negativo con nativa);
 *        (B) el orden preguntas -> contestado -> causas -> detalle -> bibliografia;
 *        (C) contestar Si dispara la recomendacion con su clase, su nivel y su folio, y el «?»
 *            la hace desaparecer;
 *        (D) el bloque de causas aparece y desaparece con el veredicto de la pantalla, y su
 *            marca automatica cambia con el dato (control positivo y negativo);
 *        (E) el panel a este ancho, y los folios de CADA recomendacion.
 *  Nombre propio: verificado con ls, no existia. */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null; for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log('SIN PLAYWRIGHT'); process.exit(2) }
const { chromium } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const POS = arg('--pos') || 'va';
const ANCHO = parseInt(arg('--ancho') || '1440', 10);

const CFG = {
  va: { tit: 'Prótesis aórtica',    morf: 'va_morf', sec: 'valv-aortica',    nat: 'Trivalva normal' },
  vm: { tit: 'Prótesis mitral',     morf: 'vm_morf', sec: 'valv-mitral',     nat: 'Normal' },
  vt: { tit: 'Prótesis tricúspide', morf: 'vt_morf', sec: 'valv-tricuspide', nat: 'Normal' },
  vp: { tit: 'Prótesis pulmonar',   morf: 'vp_morf', sec: 'valv-pulmonar',   nat: 'Normal' }
}[POS];

/* Las escenas: la de la valvula nativa (control negativo), la protesis sin datos, y las que
   llevan el veredicto a cada uno de sus estados. Los numeros se SIEMBRAN y el veredicto se MIDE:
   el arnes no supone en que estado cae, lo informa. */
const ESC = {
  va: {
    nativa:  { va_morf: 'Trivalva normal', vmax_ao: '3.5' },
    vacia:   { va_morf: 'Pr\u00f3tesis mec\u00e1nica' },
    /* hiperflujo: cociente 0,33 (banda «posible» de la Tabla 5, rama «Normal AVR» de la Figura 13)
       y area indexada POR ENCIMA de 0,85 */
    hiper:   { va_morf: 'Pr\u00f3tesis mec\u00e1nica', peso: '75', talla: '175', vmax_ao: '3.5',
               gmedio_ao: '26', diam_tsvi: '26', itv_tsvi: '28', itv_ao: '85' },
    /* desajuste: el MISMO cociente con el area indexada POR DEBAJO de 0,85 */
    desaj:   { va_morf: 'Pr\u00f3tesis mec\u00e1nica', peso: '110', talla: '185', vmax_ao: '3.5',
               gmedio_ao: '26', diam_tsvi: '19', itv_tsvi: '28', itv_ao: '85' },
    /* cociente por DEBAJO de 0,30: la rama automatica NO decide ninguna de las dos */
    bajo:    { va_morf: 'Pr\u00f3tesis mec\u00e1nica', peso: '75', talla: '175', vmax_ao: '3.5',
               gmedio_ao: '26', diam_tsvi: '22', itv_tsvi: '18', itv_ao: '85' },
    normal:  { va_morf: 'Pr\u00f3tesis mec\u00e1nica', peso: '75', talla: '175', vmax_ao: '2.2',
               gmedio_ao: '10', diam_tsvi: '22', itv_tsvi: '26', itv_ao: '50' },
    signif:  { va_morf: 'Pr\u00f3tesis mec\u00e1nica', peso: '75', talla: '175', vmax_ao: '4.5',
               gmedio_ao: '42', diam_tsvi: '20', itv_tsvi: '14', itv_ao: '90' },
    tavi:    { va_morf: 'TAVI', peso: '75', talla: '175', vmax_ao: '3.5', gmedio_ao: '26',
               diam_tsvi: '26', itv_tsvi: '28', itv_ao: '85' },
    bio:     { va_morf: 'Pr\u00f3tesis biol\u00f3gica', peso: '75', talla: '175', vmax_ao: '3.5',
               gmedio_ao: '26', diam_tsvi: '26', itv_tsvi: '28', itv_ao: '85' },
    fuga:    { va_morf: 'Pr\u00f3tesis mec\u00e1nica', peso: '75', talla: '175', vmax_ao: '3.5',
               gmedio_ao: '26', diam_tsvi: '26', itv_tsvi: '28', itv_ao: '85', ea_pvl_origen: 'paraval' },
    fugaCen: { va_morf: 'Pr\u00f3tesis mec\u00e1nica', peso: '75', talla: '175', ea_pvl_origen: 'central' }
  },
  vm: {
    nativa:  { vm_morf: 'Normal', em_gmedio: '7' },
    vacia:   { vm_morf: 'Prótesis mecánica' },
    posible: { vm_morf: 'Prótesis biológica', peso: '75', talla: '175', em_gmedio: '7',
               em_vmax: '2.1', thp: '150' },
    normal:  { vm_morf: 'Prótesis mecánica', peso: '75', talla: '175', em_gmedio: '3',
               em_vmax: '1.5', thp: '70' },
    signif:  { vm_morf: 'Prótesis mecánica', peso: '75', talla: '175', em_gmedio: '14',
               em_vmax: '2.8', thp: '260' }
  },
  vt: {
    nativa:  { vt_morf: 'Normal', et_gmedio: '10' },
    vacia:   { vt_morf: 'Pr\u00f3tesis mec\u00e1nica' },
    /* un SOLO criterio de la Tabla 19 (gradiente medio 10 >= 9 en la biologica) -> «aislado» */
    aislado: { vt_morf: 'Pr\u00f3tesis biol\u00f3gica', peso: '75', talla: '175', et_gmedio: '10' },
    normal:  { vt_morf: 'Pr\u00f3tesis biol\u00f3gica', peso: '75', talla: '175', et_gmedio: '5' },
    /* DOS criterios -> «estenosis» */
    esten:   { vt_morf: 'Pr\u00f3tesis biol\u00f3gica', peso: '75', talla: '175', et_gmedio: '10',
               et_e_vmax: '220' },
    mec:     { vt_morf: 'Pr\u00f3tesis mec\u00e1nica', peso: '75', talla: '175', et_gmedio: '7' }
  },
  vp: {
    nativa:  { vp_morf: 'Normal', ep_gmedio: '22' },
    vacia:   { vp_morf: 'Pr\u00f3tesis mec\u00e1nica' },
    /* un criterio de la Tabla 15 (gradiente medio 22 >= 20 en la biologica) -> «posible» */
    posible: { vp_morf: 'Pr\u00f3tesis biol\u00f3gica', peso: '75', talla: '175', ep_gmedio: '22' },
    normal:  { vp_morf: 'Pr\u00f3tesis biol\u00f3gica', peso: '75', talla: '175', ep_gmedio: '10',
               vp_vmax: '2.0' }
  }
}[POS];

const CUERPO = `(async () => {
  const R = {}; const TIT = ${JSON.stringify(CFG.tit)}, SEC = ${JSON.stringify(CFG.sec)};
  const ESC = ${JSON.stringify(ESC)};
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display='none' });
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const norm = t => String(t || '').replace(/\\s+/g, ' ').trim();
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); return 'ok' };
  const abrirSec = k => { const d = document.getElementById('ete-seccion-' + k); if (!d) return 'NO EXISTE';
    for (let i=0;i<3 && getComputedStyle(d).display==='none';i++){ try{ toggleEteSeccion(k) }catch(e){ return 'ERR' } }
    return getComputedStyle(d).display; };
  const abrirPanel = async () => { const b = document.getElementById('indic-btn'); if (!b) return 'NO BTN';
    const ov = document.getElementById('indic-overlay');
    if (!ov || getComputedStyle(ov).display === 'none') { b.click(); await esperar(300); }
    else { try { indicRender() } catch(e){} await esperar(200); }
    const o2 = document.getElementById('indic-overlay'); return o2 ? getComputedStyle(o2).display : 'NO OV'; };
  const cerrarPanel = async () => { const ov = document.getElementById('indic-overlay'); if (ov) ov.style.display='none'; await esperar(40) };
  const secDe = tit => { for (const d of Array.from(document.querySelectorAll('#indic-cuerpo details'))) {
      const s = d.querySelector('summary'); if (s && norm(s.textContent).indexOf(tit) === 0) return d; } return null; };
  const ordenDe = d => { if (!d) return null; const cu = d.querySelector(':scope > div'); if (!cu) return 'SIN CUERPO';
    return Array.from(cu.children).map(n => {
      if (n.getAttribute && n.getAttribute('data-ind-grid') != null) return 'grid';
      if (n.getAttribute && n.getAttribute('data-ind-bloque') != null) return 'verDetalle';
      const t = norm(n.textContent);
      if (t.toUpperCase().indexOf('CON LO CONTESTADO') > -1) return 'contestado';
      if (t.toUpperCase().indexOf('CAUSAS POSIBLES DEL GRADIENTE ALTO') > -1) return 'causas';
      if (n.querySelector && n.querySelector('[data-ind-colbtn]')) return 'encabezado';
      if (t.indexOf('Bibliograf') > -1) return 'biblio';
      return 'otro:' + t.slice(0, 24); }); };
  const causasDe = d => { if (!d) return null; const cu = d.querySelector(':scope > div'); if (!cu) return null;
    for (const n of Array.from(cu.children)) { const t = norm(n.textContent);
      if (t.toUpperCase().indexOf('CAUSAS POSIBLES DEL GRADIENTE ALTO') > -1) {
        return Array.from(n.querySelectorAll('div')).map(x => norm(x.textContent))
          .filter(t2 => /^(\\u2705|\\u2014|\\u2753)/.test(t2)).map(t2 => t2.slice(0, 90)); } }
    return null; };
  const contestadoDe = d => { if (!d) return null; const cu = d.querySelector(':scope > div'); if (!cu) return null;
    for (const n of Array.from(cu.children)) { const t = norm(n.textContent);
      if (t.toUpperCase().indexOf('CON LO CONTESTADO') > -1) return t.slice(0, 900); } return null; };
  const botonesDe = d => { if (!d) return []; return Array.from(d.querySelectorAll('[data-ind-clin]'))
    .map(b => norm(b.getAttribute('data-ind-clin')) + '=' + norm(b.getAttribute('data-ind-val'))); };
  const contestar = async (clave, val) => {
    const b = Array.from(document.querySelectorAll('[data-ind-clin]'))
      .filter(x => x.getAttribute('data-ind-clin') === clave && x.getAttribute('data-ind-val') === val)[0];
    if (!b) return 'NO EXISTE ' + clave + '=' + val;
    b.click(); await esperar(200); return 'ok'; };

  const base = async (campos) => {
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
    try { if (typeof _indClinLimpiar === 'function') _indClinLimpiar() } catch (e) {}
    try { if (typeof showTab === 'function') showTab('valvulas') } catch (e) {}
    abrirSec(SEC);
    S('nombre','P21'); S('ci','21');
    Object.keys(campos).forEach(k => S(k, campos[k]));
    await esperar(360);
  };
  const vered = () => { const o = {};
    try { o.ea = (typeof eaProtVeredicto === 'function') ? (eaProtVeredicto() || {}) : 'NO EXISTE' } catch(e){ o.ea = 'ERR' }
    try { o.vm = (typeof vmProtEOA === 'function') ? (vmProtEOA() || {}) : 'NO EXISTE' } catch(e){ o.vm = 'ERR' }
    try { o.vt = (typeof vtProtObstr === 'function') ? (vtProtObstr() || {}) : 'NO EXISTE' } catch(e){ o.vt = 'ERR' }
    try { o.vp = (typeof vpProtObstr === 'function') ? (vpProtObstr() || {}) : 'NO EXISTE' } catch(e){ o.vp = 'ERR' }
    return { eaNivel:o.ea && o.ea.nivel, eaDvi:o.ea && o.ea.dvi, eaAvai:o.ea && o.ea.avai,
             vmObstr:o.vm && o.vm.obstr, vtObstr:o.vt && o.vt.obstr, vpObstr:o.vp && o.vp.obstr }; };

  R.escenas = {};
  for (const k of Object.keys(ESC)) {
    await base(ESC[k]);
    const v = vered();
    await abrirPanel();
    const d = secDe(TIT);
    if (d && !d.open) { d.open = true; await esperar(60); }
    R.escenas[k] = { vered:v, existe: !!d, orden: ordenDe(d),
      nPreg: d ? Array.from(new Set(botonesDe(d).map(x => x.split('=')[0]))).length : 0,
      causas: causasDe(d), contestado: contestadoDe(d),
      alto: d ? Math.round(d.getBoundingClientRect().height) : null,
      texto: d ? norm(d.textContent).length : null };
    await cerrarPanel();
  }

  /* ── C: contestar y des-contestar ─────────────────────────────────────── */
  const kPrin = Object.keys(ESC).filter(k => k !== 'nativa' && k !== 'vacia')[0];
  await base(ESC[kPrin]);
  await abrirPanel();
  let d0 = secDe(TIT); if (d0 && !d0.open) { d0.open = true; await esperar(60); }
  const claves = Array.from(new Set(botonesDe(d0).map(x => x.split('=')[0])));
  R.C_claves = claves;
  R.C_antes = contestadoDe(d0);
  const c1 = claves[0];
  R.C_clic = await contestar(c1, 'si');
  await esperar(240);
  let d1 = secDe(TIT); if (d1 && !d1.open) { d1.open = true; await esperar(60); }
  R.C_conSi = contestadoDe(d1);
  R.C_conSiTieneClase = /Clase\\s+(I|II|III|1|2a|3)/.test(R.C_conSi || '');
  R.C_conSiTieneFolio = /folio\\s*e?\\d+/.test(R.C_conSi || '');
  R.C_sd = await contestar(c1, '__sd');
  await esperar(240);
  let d2 = secDe(TIT); if (d2 && !d2.open) { d2.open = true; await esperar(60); }
  R.C_conSd = contestadoDe(d2);
  await cerrarPanel();

  /* ── E: los folios de la seccion, censados sobre el texto ─────────────── */
  await base(ESC[kPrin]);
  await abrirPanel();
  const dE = secDe(TIT); if (dE && !dE.open) { dE.open = true; await esperar(60); }
  /* el «Ver detalle» y la bibliografia se abren para censar todo lo que la seccion publica */
  if (dE) Array.from(dE.querySelectorAll('details')).forEach(x => { x.open = true });
  await esperar(140);
  const txtE = dE ? norm(dE.textContent) : '';
  R.E_folios = Array.from(new Set((txtE.match(/folio\\s+e?\\d+/g) || [])));
  R.E_hojas  = Array.from(new Set((txtE.match(/hoja\\s+\\d+/g) || [])));
  R.E_prohibidas = ['pendiente de revisi', 'de ejemplo', 'no coinciden', 'difieren', 'discrepan',
    'no se encontr', 'ninguna fuente'].filter(f => txtE.toLowerCase().indexOf(f) > -1);
  R.E_panel = (function () { const c = document.getElementById('indic-card'), b = document.getElementById('indic-cuerpo');
    if (!c || !b) return null; return { ancho: Math.round(c.getBoundingClientRect().width),
      altoCuerpo: Math.round(b.getBoundingClientRect().height), altoContenido: b.scrollHeight,
      scrollH: Math.round(document.body.scrollWidth - document.documentElement.clientWidth) } })();
  /* el panel entero: cuantas secciones se ven, y si alguna otra trae el orden de protesis */
  R.E_secciones = Array.from(document.querySelectorAll('#indic-cuerpo details'))
    .map(x => { const s = x.querySelector('summary'); return s ? norm(s.textContent) : '?' })
    .filter(t => t.indexOf('Bibliograf') !== 0 && t.indexOf('Ver detalle') !== 0);
  await cerrarPanel();
  return R;
})()`;

const nav = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await nav.newContext({ viewport: { width: ANCHO, height: 900 } });
const pg = await ctx.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(String(e.message).slice(0, 180)));
await pg.goto('file://' + FILE);
await pg.waitForTimeout(1400);
let r;
try { r = await pg.evaluate(CUERPO); } catch (e) { r = { ERR: String(e.message).slice(0, 500) }; }
r._errores = errs;
r._pos = POS; r._ancho = ANCHO; r._file = FILE;
await ctx.close();
await nav.close();
console.log(JSON.stringify(r, null, 1));
