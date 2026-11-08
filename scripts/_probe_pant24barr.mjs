#!/usr/bin/env node
/** _probe_pant24barr.mjs - PANT-24, commit 1, decision (6): BARRIDO DE TEXTOS QUE EXPONEN LO
 *  PENDIENTE. SOLO REPORTE: no cambia una linea de la app.
 *  Se mide SOBRE textContent EN EL NAVEGADOR y no por grep, que es la regla de esta casa: un
 *  grep sobre el archivo marca cientos de COMENTARIOS, que en esta casa van sin tilde y sin
 *  pulir a proposito. Cuatro superficies:
 *    1) el DOM con TODO abierto, sin los <script> ni los <style>;
 *    2) el registro de tarjetas de Referencias y de globos (EV_REG, IND_REFS, _popNotas);
 *    3) el panel de Evidencia, seccion por seccion, con los globos ABIERTOS;
 *    4) el papel: informe en los tres estilos y EN SUMA, sobre una escena sembrada.
 *  CONTROL POSITIVO: se inyectan seis frases que SI tienen que salir, y se cuentan.
 *  Nombre propio: verificado con ls, no existia.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null; for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log('SIN PLAYWRIGHT'); process.exit(2) }
const { chromium } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');

const CUERPO = `(async () => {
  const R = { dom:[], reg:[], panel:[], papel:[], ctrlPos:{}, den:{} };
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display='none' });
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE';
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); return 'ok' };
  const norm = function (t) { const s = String(t == null ? '' : t); let o = '', sp = false;
    for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i);
      if (c === 32 || c === 9 || c === 10 || c === 13 || c === 160) { sp = true; continue }
      if (sp && o) o += ' '; sp = false; o += s.charAt(i); }
    return o; };
  const bajo = function (s) { try { return String(s||'').normalize('NFD').split('').filter(function(ch){
      const c = ch.charCodeAt(0); return !(c >= 768 && c <= 879) }).join('').toLowerCase() }
    catch (e) { return String(s||'').toLowerCase() } };

  /* Los patrones. Van SIN tilde y en minuscula porque se comparan contra bajo(texto).
     TODO va aparte: en espaniol es una palabra corriente, asi que solo cuenta en MAYUSCULAS
     como token suelto o seguido de dos puntos -la forma del marcador de codigo-. */
  const PAT = ['pendiente', 'pendientes', 'sin resolver', 'a decidir', 'por resolver',
    'por definir', 'por verificar', 'sin definir', 'sin decidir', 'provisorio', 'provisoria',
    'proximamente', 'a confirmar', 'por confirmar', 'queda declarado', 'falta decidir',
    'en revision', 'sin validar', 'a revisar', 'por revisar', 'no implementa',
    'todavia no', 'aun no', 'queda pendiente', 'sin terminar', 'en curso', 'provisional'];
  const todoMay = function (t) { const s = String(t||''); const out = [];
    for (let i = 0; i + 4 <= s.length; i++) {
      if (s.substr(i,4) !== 'TODO') continue;
      const a = i > 0 ? s.charAt(i-1) : ' ', b = (i+4 < s.length) ? s.charAt(i+4) : ' ';
      const esLetra = function (c) { return /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(c) };
      if (!esLetra(a) && (!esLetra(b) || b === ':')) out.push(i);
    }
    return out; };
  const hallar = function (texto) { const t = norm(texto), b = bajo(t), out = [];
    PAT.forEach(function (p) { let k = 0;
      while (true) { const i = b.indexOf(p, k); if (i < 0) break;
        out.push({ pat: p, frag: t.slice(Math.max(0, i - 110), i + p.length + 130) }); k = i + p.length;
        if (out.length > 400) break } });
    todoMay(t).forEach(function (i) { out.push({ pat: 'TODO', frag: t.slice(Math.max(0,i-110), i+134) }) });
    return out; };

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
  /* ══ 1) EL DOM, CON TODO ABIERTO, SIN LOS <script> NI LOS <style> ══
     La receta de abrir todo es la de check_mobile.js: lo que esta en display:none no tiene
     geometria, y un barrido sobre la app cerrada da cero y parece impecable. */
  try { document.querySelectorAll('.tab-section').forEach(function(s){ s.classList.add('active') }) } catch (e) {}
  try { document.querySelectorAll('[id$="-seccion"], .card-body, .sacc-body').forEach(function(s){
    if (getComputedStyle(s).display === 'none') s.style.display = '' }) } catch (e) {}
  try { document.querySelectorAll('details').forEach(function(d){ d.open = true }) } catch (e) {}
  await esperar(500);
  /* CONTROL POSITIVO: seis frases inyectadas que SI tienen que salir. Sin esto, un cero se lee
     igual que «la sonda no mira nada». */
  const CP = ['Criterio pendiente de revision clinica', 'La divergencia esta sin resolver',
    'Dato a confirmar por el especialista', 'Valor provisorio', 'Esto queda por definir',
    'TODO: revisar este corte'];
  const cpDiv = document.createElement('div'); cpDiv.id = '__p24cp';
  CP.forEach(function (t) { const p = document.createElement('p'); p.textContent = t; cpDiv.appendChild(p) });
  document.body.appendChild(cpDiv);
  await esperar(60);
  const textoDom = function () {
    const cl = document.body.cloneNode(true);
    Array.prototype.slice.call(cl.querySelectorAll('script,style,noscript,template')).forEach(function(n){ n.remove() });
    return String(cl.textContent || '');
  };
  const domCon = textoDom();
  R.den.domChars = domCon.length;
  const hCon = hallar(domCon);
  R.ctrlPos.inyectadas = CP.length;
  R.ctrlPos.detectadas = CP.filter(function (t) { return domCon.indexOf(t) > -1 }).length;
  cpDiv.remove(); await esperar(60);
  const dom = textoDom();
  R.den.domCharsSinCP = dom.length;
  R.dom = hallar(dom);

  /* ══ 2) EL REGISTRO DE TARJETAS Y DE GLOBOS ══ */
  const vuelca = function (obj, pref, lim) {
    const out = [];
    const rec = function (o, ruta, prof) {
      if (prof > 4 || o == null) return;
      if (typeof o === 'string') { if (o.length > 2) out.push([ruta, o]); return }
      if (typeof o !== 'object') return;
      if (Array.isArray(o)) { o.forEach(function (x, i) { rec(x, ruta + '[' + i + ']', prof + 1) }); return }
      Object.keys(o).forEach(function (k) { rec(o[k], ruta + '.' + k, prof + 1) });
    };
    try { rec(obj, pref, 0) } catch (e) {}
    return out.slice(0, lim || 100000);
  };
  const REGS = [];
  ['EV_REG','IND_REFS','_popNotas','VINFO','VINFO_REG','QV_BARRA'].forEach(function (n) {
    let o = null; try { o = eval(n) } catch (e) { o = null }
    if (o) REGS.push([n, o]);
  });
  R.den.registros = REGS.map(function (x) { return x[0] });
  REGS.forEach(function (x) {
    const pares = vuelca(x[1], x[0], 200000);
    R.den['reg_' + x[0] + '_cadenas'] = pares.length;
    R.den['reg_' + x[0] + '_chars'] = pares.reduce(function (a, p) { return a + p[1].length }, 0);
    pares.forEach(function (p) { hallar(p[1]).forEach(function (h) {
      R.reg.push({ donde: p[0], pat: h.pat, frag: h.frag }) }) });
  });

  /* ══ 3) EL PANEL DE EVIDENCIA, SECCION POR SECCION, CON LOS GLOBOS ABIERTOS ══ */
  const abrirPanel = async function () { const b = document.getElementById('indic-btn'); if (!b) return;
    const ov = document.getElementById('indic-overlay');
    if (!ov || getComputedStyle(ov).display === 'none') { b.click(); await esperar(300) }
    else { try { indicRender() } catch (e) {} await esperar(200) } };
  const sembrar = function (campos) {
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
    try { if (typeof _indClinLimpiar === 'function') _indClinLimpiar() } catch (e) {}
    S('nombre','P24'); S('ci','24242424');
    Object.keys(campos || {}).forEach(function (k) { try { S(k, campos[k]) } catch (e) {} });
  };
  const integrado = function (k) { try { return (typeof amiloIntegrado === 'function') ? !!amiloIntegrado(k) : false } catch (e) { return false } };
  const avInc = function (ks) { [].concat(ks).forEach(function (k) {
    try { if (!integrado(k) && typeof amiloIntegrar === 'function') amiloIntegrar(k) } catch (e) {} }) };
  const sinTilde = bajo;
  const SEEDMAP = {}; SEED.forEach(function (x) { SEEDMAP[x[0]] = x });
  let nSecMed = 0, charsPanel = 0;
  for (let i = 0; i < IND_SECS.length; i++) {
    const tit = IND_SECS[i].tit, titN = sinTilde(tit);
    const claves = Object.keys(SEEDMAP).filter(function (pr) { return titN.indexOf(sinTilde(pr)) === 0 })
      .sort(function (a, b) { return b.length - a.length });
    if (!claves.length) continue;
    sembrar(SEEDMAP[claves[0]][1]); await esperar(320);
    if (IND_SECS[i].av) avInc(IND_SECS[i].av);
    await abrirPanel();
    const d = Array.prototype.slice.call(document.querySelectorAll('#indic-cuerpo > details'))
      .filter(function (x) { const s = x.querySelector('summary');
        return s && sinTilde(norm(s.textContent)).indexOf(sinTilde(claves[0])) === 0 })[0];
    if (!d) { const ov = document.getElementById('indic-overlay'); if (ov) ov.style.display='none'; continue }
    d.open = true; await esperar(90);
    Array.prototype.slice.call(d.querySelectorAll('details')).forEach(function (x) { x.open = true });
    await esperar(110);
    const t = String(d.textContent || '');
    nSecMed++; charsPanel += t.length;
    hallar(t).forEach(function (h) { R.panel.push({ sec: tit, pat: h.pat, frag: h.frag }) });
    const ov = document.getElementById('indic-overlay'); if (ov) ov.style.display='none';
    await esperar(25);
  }
  R.den.panelSecs = nSecMed; R.den.panelChars = charsPanel;

  /* ══ 4) EL PAPEL: informe en los TRES estilos y EN SUMA ══ */
  const ESC = [
    ['vacio', {}],
    ['taviSinDatos', { va_morf:'TAVI' }],
    ['protMitral', { vm_morf:'Prótesis mecánica' }],
    ['completo', { va_morf:'Prótesis biológica', vmax_ao:'4.5', gmedio_ao:'45', itv_tsvi:'20', itv_ao:'100',
                   im_grado:'3', it_grado:'2', vmax_it:'3.8', fevi:'45', pericardio:'Derrame severo (>20mm)' }]
  ];
  let charsPapel = 0;
  for (const e of ESC) {
    sembrar(e[1]); await esperar(330);
    for (const st of ['conciso','estandar','narrativo']) {
      try { setEstiloInforme(st) } catch (x) {}
      await esperar(50);
      try { if (typeof generarInforme === 'function') generarInforme() } catch (x) {}
      await esperar(110);
      const a = String((document.getElementById('informe_texto')||{}).value || '');
      const b = String((document.getElementById('en_suma')||{}).value || '');
      charsPapel += a.length + b.length;
      hallar(a).forEach(function (h) { R.papel.push({ esc: e[0], sup: 'informe_' + st, pat: h.pat, frag: h.frag }) });
      hallar(b).forEach(function (h) { R.papel.push({ esc: e[0], sup: 'suma_' + st, pat: h.pat, frag: h.frag }) });
    }
  }
  R.den.papelChars = charsPapel;

  /* ══ 5) LOS NUMEROS CON PUNTO DECIMAL EN TEXTO VISIBLE EN ESPANIOL (PANT-24, P24-c) ══
     SOLO REPORTE. Se busca digito-punto-digito sobre el texto que el medico lee. Se descartan
     las formas que NO son un decimal en espaniol: una version (4.4.1), una fecha, una hoja o un
     folio con punto de miles, un identificador y una URL. El contexto de cada hallazgo se
     publica para que se pueda clasificar a mano. */
  const puntos = function (texto, donde) {
    const t = norm(texto), out = [];
    for (let i = 1; i + 1 < t.length; i++) {
      if (t.charAt(i) !== '.') continue;
      const a0 = t.charCodeAt(i - 1), b0 = t.charCodeAt(i + 1);
      if (!(a0 >= 48 && a0 <= 57) || !(b0 >= 48 && b0 <= 57)) continue;
      /* un tercer grupo de digitos con otro punto es una version o una IP, no un decimal */
      const sig = t.charAt(i + 2), sig2 = t.charAt(i + 3);
      if (sig === '.' || sig2 === '.') continue;
      /* una barra inmediata es una fecha o una URL */
      if (t.charAt(i - 2) === '/' || t.charAt(i + 3) === '/') continue;
      out.push({ donde: donde, frag: t.slice(Math.max(0, i - 60), i + 62) });
      if (out.length > 300) break;
    }
    return out;
  };
  R.puntoDom = puntos(dom, 'DOM');
  R.puntoPapel = [];
  R.puntoReg = [];
  REGS.forEach(function (x) {
    vuelca(x[1], x[0], 200000).forEach(function (pr) {
      puntos(pr[1], pr[0]).forEach(function (h) { R.puntoReg.push(h) });
    });
  });
  /* el papel se vuelve a medir sobre la escena completa, que es la que trae mas numeros */
  sembrar({ va_morf:'Prótesis biológica', vmax_ao:'4.5', gmedio_ao:'45', itv_tsvi:'20', itv_ao:'100',
            va_at:'50', tango_te:'100', peso:'75', talla:'175', im_grado:'3', fevi:'45' });
  await esperar(360);
  try { setEstiloInforme('estandar') } catch (x) {}
  try { if (typeof generarInforme === 'function') generarInforme() } catch (x) {}
  await esperar(140);
  R.puntoPapel = puntos(String((document.getElementById('informe_texto')||{}).value || ''), 'informe')
    .concat(puntos(String((document.getElementById('en_suma')||{}).value || ''), 'en_suma'));
  R.den.puntoDom = R.puntoDom.length; R.den.puntoReg = R.puntoReg.length;
  R.den.puntoPapel = R.puntoPapel.length;
  R.den.hConCP = hCon.length;
  return R;
})()`;

const nav = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await nav.newContext({ viewport: { width: 1440, height: 1000 } });
const pg = await ctx.newPage();
const errs = [], cons = [];
pg.on('pageerror', e => errs.push(String(e.message).slice(0, 180)));
pg.on('console', m => { if (m.type() === 'error') cons.push(String(m.text()).slice(0, 180)) });
await pg.goto('file://' + FILE);
await pg.waitForTimeout(1700);
let r; try { r = await pg.evaluate(CUERPO) } catch (e) { r = { ERR: String(e.message).slice(0, 900) } }
r._errores = errs; r._consola = cons.slice(0, 20); r._file = FILE;
await ctx.close(); await nav.close();
console.log(JSON.stringify(r));
