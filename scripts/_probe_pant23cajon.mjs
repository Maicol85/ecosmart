#!/usr/bin/env node
/** _probe_pant23cajon.mjs - PANT-23, commit 3: el cajon abierto no deja barra horizontal y se
 *  mide QUE TAPA. Por seccion abre el PRIMER globo y el ULTIMO -el peor caso, porque el cajon
 *  cuelga debajo de la ultima fila- y mide el desplazamiento horizontal, si el cajon queda
 *  ARRIBA en el apilado, y si su rectangulo se superpone con el «Ver detalle», la bibliografia
 *  o alguna botonera de respuesta de la seccion.
 *  Nombre propio: verificado con ls, no existia. SOLO LECTURA sobre el arbol. */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null; for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log('SIN PLAYWRIGHT'); process.exit(2) }
const { chromium } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const ANCHO = parseInt(arg('--ancho') || '1440', 10);
const MOTOR = arg('--motor') || 'chrome';

const CUERPO = `(async () => {
  const R = { secs: {}, tot: { n:0, scroll:0, tapaDetalle:0, tapaBiblio:0, tapaBoton:0, noArriba:0 } };
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display='none' });
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const norm = function (t) { const s = String(t == null ? '' : t); let o = '', sp = false;
    for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i);
      if (c === 32 || c === 9 || c === 10 || c === 13 || c === 160) { sp = true; continue }
      if (sp && o) o += ' '; sp = false; o += s.charAt(i); }
    return o; };
  const sinTilde = function (s) { try { return String(s||'').normalize('NFD').split('').filter(function(ch){
      const c = ch.charCodeAt(0); return !(c >= 768 && c <= 879) }).join('') } catch (e) { return String(s||'') } };
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE';
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); return 'ok' };
  (function(){ const st = document.createElement('style');
    st.textContent = '*{transition:none !important;animation:none !important}';
    document.head.appendChild(st) })();

  const SEED = [
    ['Estenosis aortica',                   { vmax_ao:'4.5' },                                    'esc2025vc'],
    ['Insuficiencia mitral primaria',       { im_grado:'4' },                                 'esc2025vc'],
    ['Insuficiencia mitral secundaria',     { im_grado:'4', teer_tipo_im:'secundaria' },      'esc2025vc'],
    ['Estenosis mitral',                    { avm_plan:'1.2' },                                   'esc2025vc'],
    ['Protesis mitral',                     { vm_morf:'Prótesis mecánica' },                      'esc2025vc'],
    ['Protesis aortica',                    { va_morf:'Prótesis mecánica' },                      'esc2025vc'],
    ['Protesis tricuspide',                 { vt_morf:'Prótesis mecánica' },                      'esc2025vc'],
    ['Protesis pulmonar',                   { vp_morf:'Prótesis mecánica' },                      'acc2025achd'],
    ['Insuficiencia aortica',               { ia_grado:'4' },                                 'esc2025vc'],
    ['Valvula tricuspide',                  { it_grado:'4' },                                     'esc2025vc'],
    ['Estenosis pulmonar',                  { vp_gmax:'70' },                                     'esc2020guch'],
    ['Tromboembolia pulmonar',              { tep_mcconnell:'si', tep_vdvi:'1.3' },               'escTep2019'],
    ['Hipertension pulmonar',                { vmax_it:'3.8' },                                   'escErs2022'],
    ['Insuficiencia cardiaca',               { fevi:'60', e_sep:'6', e_lat:'8', onda_e:'90' },     'hfaPeff2019'],
    ['Comunicacion interauricular',         { ete_cia_tipo:'secundum', ete_cia_tam_max:'18' },    'acc2025achd'],
    ['Comunicacion interventricular',       { ete_civ_tipo:'perimembranosa' },                     'escGuchCiv'],
    ['Ductus arterioso permeable',          { dap_tipo:'no_restrictivo', dap_diam:'4' },           'acc2025achd'],
    ['Coartacion de aorta',                 { coa_vmax:'3.2' },                                   'esc2024ao'],
    ['Ventana aortopulmonar',               { vap_tipo:'i', vap_diam:'8' },                       'yakut2018apw'],
    ['Tetralogia de Fallot reparada — ventriculo derecho', { tdf_sintomas:'si' },                'acc2025achd'],
    ['Estenosis subaortica',                { esub_tipo:'membrana', esub_gradiente_medio:'45' },  'acc2025achd'],
    ['Estenosis supravalvular aortica',     { easv_tipo:'reloj', easv_gradiente_medio:'45' },     'acc2025achd'],
    ['Defecto del septo auriculoventricular', { dsav_tipo:'completo', dsav_qp_qs:'2.1' },        'acc2025achd'],
    ['Anomalia de Ebstein',                  { ebs_desplazamiento:'22', ebs_func_vd:'moderada' }, 'acc2025achd'],
    ['Circulacion de Fontan',                { fontan_tipo:'tunel', fontan_saturacion:'90' },    'acc2025achd'],
    ['Conexion venosa pulmonar anomala parcial', { cvpa_venas_numero:'2', cvpa_conexion:'vcs' }, 'acc2025achd'],
    ['Sindrome de Eisenmenger',              { eis_lesion_base:'civ', eis_saturacion_reposo:'84' }, 'acc2025achd'],
    ['Foramen oval permeable',              { fop_shunt_valsalva:'si', fop_burbujas:'abundante', fop_acv:'si', edad:'45' }, 'fopAha2021'],
    ['Miocardiopatia hipertrofica obstructiva', { mch_grad_reposo:'60' },                          'esc2023mioc'],
    ['Valvula aortica bicuspide \u2014 aorta',      { ao_tub:'50', va_morf:'Bicúspide' },          'esc2024ao'],
    ['Valvula aortica bicuspide \u2014 conclusion', { vab_tipo:'fused_rl', ao_tub:'50' },          'esc2024ao'],
    ['Aorta toracica', { ao_tub:'41' }, 'esc2024ao'],
    ['Ecocardiograma transesofagico', { oai_trombo:'si' },                     'esc2025vc'],
    ['Reparabilidad de la valvula mitral', { ete_prof_coapt:'12', teer_tipo_im:'secundaria' }, 'guiaRegurgNativa'],
    ['Ateroma aortico', { ao_grado_atero:'4' },                                'aseEte2020'],
    ['Tetralogia de Fallot reparada', { tdf_sintomas:'si' },                  'achd2025'],
    ['Derrame pericardico y taponamiento', { pericardio:'Derrame severo (>20mm)' },        'escPeri2025'],
    ['Constriccion pericardica',           { cvr_rebote:'si' },                            'escPeri2025'],
    ['Congestion venosa sistemica',        { vci_diam:'21', vexus_sh:'2' },                'vexus2020'],
    ['Perfil hemodinamico',                { onda_e:'95', e_sep:'6', e_lat:'8' },          'aseDer2025'],
    ['Cardiotoxicidad por tratamiento oncologico', { co_farmaco:'radioterapia' },          'escOnco2022'],
    ['Amiloidosis cardiaca',               { 'alg-ett-score':'6' },                        'gpAmiloid2021'],
    ['Posoperatorio de cirugia cardiaca',  { pop_cx_tipo:'cabg' },                         'escPeri2025'],
    ['Transposicion de grandes arterias',  { tga_tipo:'mustard' },                         'acc2025achd'],
    ['Miocardiopatia hipertrofica \u2014 prevencion', { mch_aneurisma_apical:'si' },      'esc2023miocEn']
  ];


  const sembrar = function (campos) {
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
    try { if (typeof _indClinLimpiar === 'function') _indClinLimpiar() } catch (e) {}
    S('nombre','P23'); S('ci','23232323');
    Object.keys(campos || {}).forEach(function (k) { try { S(k, campos[k]) } catch (e) {} });
  };
  const integrado = function (k) { try { return (typeof amiloIntegrado === 'function') ? !!amiloIntegrado(k) : false } catch (e) { return false } };
  const avInc = function (ks) { [].concat(ks).forEach(function (k) {
    try { if (!integrado(k) && typeof amiloIntegrar === 'function') amiloIntegrar(k) } catch (e) {} }) };
  const abrirPanel = async function () { const b = document.getElementById('indic-btn'); if (!b) return;
    const ov = document.getElementById('indic-overlay');
    if (!ov || getComputedStyle(ov).display === 'none') { b.click(); await esperar(300) }
    else { try { indicRender() } catch (e) {} await esperar(200) } };
  const cerrarPanel = async function () { const ov = document.getElementById('indic-overlay'); if (ov) ov.style.display='none'; await esperar(30) };
  const secPanel = function (pref) { return Array.prototype.slice.call(document.querySelectorAll('#indic-cuerpo > details'))
      .filter(function (d) { const s = d.querySelector('summary');
        return s && sinTilde(norm(s.textContent)).indexOf(sinTilde(pref)) === 0 })[0] || null };
  const cruza = function (a, b) { if (!a || !b) return false;
    return !(a.right <= b.left + 1 || a.left >= b.right - 1 || a.bottom <= b.top + 1 || a.top >= b.bottom - 1) };

  const SEEDMAP = {}; SEED.forEach(function (x) { SEEDMAP[x[0]] = x });
  for (let i = 0; i < IND_SECS.length; i++) {
    const tit = IND_SECS[i].tit, titN = sinTilde(tit);
    const claves = Object.keys(SEEDMAP).filter(function (pr) { return titN.indexOf(sinTilde(pr)) === 0 })
      .sort(function (a, b) { return b.length - a.length });
    if (!claves.length) continue;
    sembrar(SEEDMAP[claves[0]][1]);
    await esperar(340);
    if (IND_SECS[i].av) avInc(IND_SECS[i].av);
    await abrirPanel();
    const d = secPanel(claves[0]);
    if (!d) { await cerrarPanel(); continue }
    d.open = true; await esperar(100);
    const infos = Array.prototype.slice.call(d.querySelectorAll('details[data-ind-info]'));
    if (!infos.length) { await cerrarPanel(); continue }
    const out = [];
    for (const j of [0, infos.length - 1]) {
      const dd = infos[j], sm = dd.querySelector('summary');
      if (!sm) continue;
      sm.scrollIntoView({ block: 'center' }); await esperar(90);
      sm.click(); await esperar(130);
      const caja = dd.querySelector('div');
      const rb = caja ? caja.getBoundingClientRect() : null;
      const det = d.querySelector('details[data-ind-detalle] > summary');
      const bib = d.querySelector('details[data-ind-biblio] > summary');
      const btns = Array.prototype.slice.call(d.querySelectorAll('.ind-ctrl-btn'));
      const sh = Math.round(document.body.scrollWidth - document.documentElement.clientWidth);
      let arriba = null;
      if (rb && rb.width > 4) { const x = Math.round(rb.left + rb.width / 2), y = Math.round(rb.top + 6);
        if (x >= 0 && y >= 0 && x < innerWidth && y < innerHeight) {
          const el = document.elementFromPoint(x, y);
          arriba = !!(el && (el === caja || caja.contains(el))); } else arriba = 'fuera del viewport'; }
      const tD = !!(det && rb && cruza(rb, det.getBoundingClientRect()));
      const tB = !!(bib && rb && cruza(rb, bib.getBoundingClientRect()));
      const tBt = btns.filter(function (b) { return rb && cruza(rb, b.getBoundingClientRect()) }).length;
      R.tot.n++;
      if (sh > 0) R.tot.scroll++;
      if (tD) R.tot.tapaDetalle++;
      if (tB) R.tot.tapaBiblio++;
      if (tBt) R.tot.tapaBoton++;
      if (arriba === false) R.tot.noArriba++;
      out.push({ j: j, scrollH: sh, arriba: arriba, tapaDetalle: tD, tapaBiblio: tB,
                 tapaBotones: tBt, nBotones: btns.length,
                 caja: rb ? { x: Math.round(rb.left), y: Math.round(rb.top), w: Math.round(rb.width), h: Math.round(rb.height) } : null });
      sm.click(); await esperar(90);
    }
    R.secs[tit] = out;
    await cerrarPanel();
  }
  return R;
})()`;

const CODE = CUERPO;

const nav = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await nav.newContext({ viewport: { width: ANCHO, height: 900 } });
const pg = await ctx.newPage();
const errs = [], cons = [];
pg.on('pageerror', e => errs.push(String(e.message).slice(0, 180)));
pg.on('console', m => { if (m.type() === 'error') cons.push(String(m.text()).slice(0, 180)) });
await pg.goto('file://' + FILE);
await pg.waitForTimeout(1600);
let r; try { r = await pg.evaluate(CODE) } catch (e) { r = { ERR: String(e.message).slice(0, 700) } }
r._errores = errs; r._consola = cons; r._ancho = ANCHO; r._file = FILE;
await ctx.close(); await nav.close();
console.log(JSON.stringify(r));
