#!/usr/bin/env node
/** _probe_pant23orden.mjs - PANT-23, commit 2: el orden de bloques en TODAS las secciones,
 *  con el GESTO REAL y por POSICION EN PANTALLA (getBoundingClientRect), no por indice de DOM.
 *  (A) las 45 secciones: preguntas antes que «Con lo contestado» y este antes del «Ver detalle»;
 *  (B) CONTROL NEGATIVO: se invierten dos bloques a mano y la condicion tiene que CAER;
 *  (C) donde viven los corchetes de cita -en la grilla o en el recuadro-, que es lo que explica
 *      que la renumeracion medida sea CERO;
 *  (D) el panel a este ancho: scroll horizontal, recortes y solapes.
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
const TEMA = arg('--tema') || 'noche';
const PARTE = arg('--parte') || 'anp';

const CUERPO = `(async () => {
  const R = {};
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display='none' });
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const norm = function (t) { const s = String(t == null ? '' : t); let o = '', sp = false;
    for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i);
      if (c === 32 || c === 9 || c === 10 || c === 13 || c === 160) { sp = true; continue }
      if (sp && o) o += ' '; sp = false; o += s.charAt(i); }
    return o; };
  const sinTilde = function (s) { try { return String(s||'').normalize('NFD').split('').filter(function(ch){
      const c = ch.charCodeAt(0); return !(c >= 768 && c <= 879) }).join('') } catch (e) { return String(s||'') } };
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); return 'ok' };
  /* las transiciones apagadas: un bloque a medio animar da una posicion falsa */
  (function(){ const st = document.createElement('style');
    st.textContent = '*{transition:none !important;animation:none !important}';
    document.head.appendChild(st) })();
  if ('TEMAAQUI' === 'dia') { try { if (typeof toggleTheme === 'function') toggleTheme(); } catch (e) {} }
  R.temaAplicado = document.documentElement.classList.contains('light-mode') ? 'dia' : 'noche';

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
  const avInc = function (ks) { const L = [].concat(ks); let o = [];
    L.forEach(function (k) { try { if (integrado(k)) { o.push(k + ':ya'); return }
      if (typeof amiloIntegrar === 'function') { amiloIntegrar(k); o.push(k + ':' + (integrado(k) ? 'ok' : 'NO QUEDO')) }
      else o.push(k + ':NO FN') } catch (e) { o.push(k + ':ERR') } });
    return o.join(' ') };
  const abrirPanel = async function () { const b = document.getElementById('indic-btn'); if (!b) return 'NO BTN';
    const ov = document.getElementById('indic-overlay');
    if (!ov || getComputedStyle(ov).display === 'none') { b.click(); await esperar(300) }
    else { try { indicRender() } catch (e) {} await esperar(200) }
    const o2 = document.getElementById('indic-overlay'); return o2 ? getComputedStyle(o2).display : 'NO OV'; };
  const cerrarPanel = async function () { const ov = document.getElementById('indic-overlay'); if (ov) ov.style.display='none'; await esperar(30) };
  const secPanel = function (pref) { return Array.prototype.slice.call(document.querySelectorAll('#indic-cuerpo > details'))
      .filter(function (d) { const s = d.querySelector('summary');
        return s && sinTilde(norm(s.textContent)).indexOf(sinTilde(pref)) === 0 })[0] || null };

  /* la caja de «Con lo contestado» de una seccion, por su rotulo y su borde */
  const cajaCon = function (d) { let o = null;
    Array.prototype.slice.call(d.querySelectorAll('div[style]')).forEach(function (x) { if (o) return;
      const st = x.getAttribute('style') || '';
      if (st.indexOf('border-left:3px solid') < 0) return;
      const t = x.firstElementChild ? norm(x.firstElementChild.textContent) : '';
      if (t.indexOf('Con lo contestado') === 0) o = x });
    return o };
  /* la POSICION EN PANTALLA de cada bloque */
  const top = function (e) { if (!e) return null; const r = e.getBoundingClientRect();
    return (r.width === 0 && r.height === 0) ? null : Math.round(r.top + (document.getElementById('indic-cuerpo') || {scrollTop:0}).scrollTop) };

  const medir = function (d) {
    const grid = d.querySelector('[data-ind-grid]');
    const con = cajaCon(d);
    const vdg = d.querySelector('details[data-ind-bloque]');
    const vd = d.querySelector('details[data-ind-detalle]');
    const bib = d.querySelector('details[data-ind-biblio]');
    const refs = Array.prototype.slice.call(d.querySelectorAll('[data-ind-ref]'));
    return {
      tGrid: top(grid), tCon: top(con), tVdg: top(vdg), tVd: top(vd), tBib: top(bib),
      hayCon: !!con,
      nRefs: refs.length,
      refsEnGrid: refs.filter(function (x) { return !!grid && grid.contains(x) }).length,
      refsEnCon: refs.filter(function (x) { return !!con && con.contains(x) }).length,
      refsEnVdg: refs.filter(function (x) { return !!vdg && vdg.contains(x) }).length,
      refsEnBib: refs.filter(function (x) { return !!bib && bib.contains(x) }).length,
      /* el ORDEN DE EMISION, que es el que numera: por indice en el innerHTML */
      iGridHtml: d.innerHTML.indexOf('data-ind-grid'),
      iConHtml: d.innerHTML.indexOf('Con lo contestado'),
      iPrimerRef: d.innerHTML.indexOf('data-ind-ref=')
    };
  };

  /* ══════════ (A) las 45 secciones, con el gesto real ══════════ */
  R.secs = {}; R.sinSeed = []; R.noAparecio = [];
  const SEEDMAP = {}; SEED.forEach(function (x) { SEEDMAP[x[0]] = x });
  if ('PARTEAQUI'.indexOf('a') > -1)
  /* la clave de sector avanzado de cada seccion, leida de IND_SECS y no de memoria */
  for (let i = 0; i < IND_SECS.length; i++) {
    const tit = IND_SECS[i].tit, titN = sinTilde(tit);
    const claves = Object.keys(SEEDMAP).filter(function (pr) { return titN.indexOf(sinTilde(pr)) === 0 })
      .sort(function (a, b) { return b.length - a.length });
    if (!claves.length) { R.sinSeed.push(tit); continue }
    sembrar(SEEDMAP[claves[0]][1]);
    await esperar(360);
    let inc = '';
    if (IND_SECS[i].av) inc = avInc(IND_SECS[i].av);
    await abrirPanel();
    const d = secPanel(claves[0]);
    if (!d) { R.noAparecio.push(tit + ' [' + inc + ']'); await cerrarPanel(); continue }
    d.open = true; await esperar(120);
    Array.prototype.slice.call(d.querySelectorAll('details')).forEach(function (x) { x.open = true });
    await esperar(120);
    R.secs[tit] = medir(d);
    R.secs[tit].inc = inc;
    await cerrarPanel();
  }

  /* ══════════ (B) CONTROL NEGATIVO: se invierten dos bloques a mano ══════════ */
  R.neg = { saltado: true };
  if ('PARTEAQUI'.indexOf('n') > -1) {
  sembrar({ ete_cia_tipo:'secundum', ete_cia_tam_max:'18' });
  await esperar(360);
  await abrirPanel();
  const dC = secPanel('Comunicacion interauricular');
  R.neg = { existe: !!dC };
  if (dC) {
    dC.open = true; await esperar(120);
    Array.prototype.slice.call(dC.querySelectorAll('details')).forEach(function (x) { x.open = true });
    await esperar(120);
    const m0 = medir(dC);
    R.neg.antes = { tGrid: m0.tGrid, tCon: m0.tCon, ok: m0.tGrid < m0.tCon };
    /* se mueve la caja ARRIBA de la grilla, que es el orden viejo */
    const g = dC.querySelector('[data-ind-grid]'), c = cajaCon(dC);
    if (g && c && g.parentNode) { g.parentNode.insertBefore(c, g); await esperar(120);
      const m1 = medir(dC);
      R.neg.invertido = { tGrid: m1.tGrid, tCon: m1.tCon, ok: m1.tGrid < m1.tCon }; }
    /* se repinta y vuelve al orden bueno */
    try { indicRender() } catch (e) {}
    await esperar(220);
    const dC2 = secPanel('Comunicacion interauricular');
    if (dC2) { dC2.open = true; await esperar(120);
      Array.prototype.slice.call(dC2.querySelectorAll('details')).forEach(function (x) { x.open = true });
      await esperar(120);
      const m2 = medir(dC2);
      R.neg.repintado = { tGrid: m2.tGrid, tCon: m2.tCon, ok: m2.tGrid < m2.tCon }; }
  }
  await cerrarPanel();
  }

  /* ══════════ (D) el panel a este ancho: scroll, recortes y solapes ══════════ */
  sembrar({ ete_cia_tipo:'secundum', ete_cia_tam_max:'18', ete_civ_tipo:'perimembranosa',
            coa_vmax:'3.2', dap_tipo:'no_restrictivo', dap_diam:'4', vmax_ao:'4.5' });
  await esperar(420);
  await abrirPanel();
  R.panel = (function () {
    const c = document.getElementById('indic-card'), b = document.getElementById('indic-cuerpo');
    if (!c || !b) return null;
    const secs = Array.prototype.slice.call(b.querySelectorAll(':scope > details'));
    secs.forEach(function (d) { d.open = true;
      Array.prototype.slice.call(d.querySelectorAll('details')).forEach(function (x) { x.open = true }) });
    const rec = Array.prototype.slice.call(b.querySelectorAll('*')).filter(function (e) {
      if (!e.children.length && norm(e.textContent).length > 2) {
        return e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1 } return false }).length;
    /* SOLAPES: la caja «Con lo contestado» no puede pisar la grilla ni el «Ver detalle» */
    let solapes = 0; const detalle = [];
    secs.forEach(function (d) {
      const g = d.querySelector('[data-ind-grid]'), cc = cajaCon(d),
            vd = d.querySelector('details[data-ind-detalle]');
      if (!g || !cc) return;
      const rg = g.getBoundingClientRect(), rc = cc.getBoundingClientRect();
      if (rc.top < rg.bottom - 1) { solapes++; detalle.push(norm((d.querySelector('summary')||{}).textContent).slice(0,30)) }
      if (vd) { const rv = vd.getBoundingClientRect();
        if (rv.top < rc.bottom - 1) { solapes++; detalle.push('vd:' + norm((d.querySelector('summary')||{}).textContent).slice(0,26)) } }
    });
    return { ancho: Math.round(c.getBoundingClientRect().width),
             scrollH: Math.round(document.body.scrollWidth - document.documentElement.clientWidth),
             scrollHcuerpo: Math.round(b.scrollWidth - b.clientWidth),
             recortados: rec, solapes: solapes, solapeDetalle: detalle,
             nSecs: secs.length,
             conCaja: secs.filter(function (d) { return !!cajaCon(d) }).length };
  })();
  /* con las secciones CERRADAS */
  (function(){ const b = document.getElementById('indic-cuerpo'); if (!b) return;
    Array.prototype.slice.call(b.querySelectorAll(':scope > details')).forEach(function (d) { d.open = false }) })();
  await esperar(160);
  R.panelCerrado = (function () { const b = document.getElementById('indic-cuerpo');
    if (!b) return null;
    const rec = Array.prototype.slice.call(b.querySelectorAll('*')).filter(function (e) {
      if (!e.children.length && norm(e.textContent).length > 2) {
        return e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1 } return false }).length;
    return { recortados: rec,
             scrollH: Math.round(document.body.scrollWidth - document.documentElement.clientWidth) } })();
  await cerrarPanel();
  R.fondo = (function(){ try { return getComputedStyle(document.body).backgroundColor } catch(e){ return '?' } })();
  return R;
})()`;

const CODE = CUERPO.split('TEMAAQUI').join(TEMA).split('PARTEAQUI').join(PARTE);

const motores = { chrome: () => chromium.launch({ channel: 'chrome', headless: true }),
                  webkit: () => _pw.webkit.launch({ headless: true }) };
const nav = await (motores[MOTOR] || motores.chrome)();
const ctx = await nav.newContext({ viewport: { width: ANCHO, height: 900 } });
const pg = await ctx.newPage();
const errs = [], cons = [];
pg.on('pageerror', e => errs.push(String(e.message).slice(0, 180)));
pg.on('console', m => { if (m.type() === 'error') cons.push(String(m.text()).slice(0, 180)) });
await pg.goto('file://' + FILE);
await pg.waitForTimeout(1600);
let r;
try { r = await pg.evaluate(CODE); } catch (e) { r = { ERR: String(e.message).slice(0, 800) }; }
r._errores = errs; r._consola = cons; r._ancho = ANCHO; r._file = FILE; r._motor = MOTOR; r._tema = TEMA; r._parte = PARTE;
await ctx.close(); await nav.close();
console.log(JSON.stringify(r));
