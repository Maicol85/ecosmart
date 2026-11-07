#!/usr/bin/env node
/** _probe_pant23globos.mjs - PANT-23, commit 3: CADA globo de la Evidencia abre el cajon del
 *  modelo. Con el GESTO REAL -click sobre el summary- y midiendo la fila antes y despues.
 *  Por cada globo: el position computado de su caja, el alto y el ancho de su fila antes y
 *  despues, si la caja sale de la celda, si se sale del panel, y su texto.
 *  Y por seccion: el cierre de las tres formas y que abrir uno cierre el otro.
 *  CONTROL NEGATIVO: se le quita a mano el marcador que la regla de CSS necesita y la
 *  condicion tiene que CAER.
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
const ESPERA = parseInt(arg('--espera') || '70', 10);

const CUERPO = `(async () => {
  const R = {};
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display='none' });
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const W = ESPERAAQUI;
  const norm = function (t) { const s = String(t == null ? '' : t); let o = '', sp = false;
    for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i);
      if (c === 32 || c === 9 || c === 10 || c === 13 || c === 160) { sp = true; continue }
      if (sp && o) o += ' '; sp = false; o += s.charAt(i); }
    return o; };
  const sinTilde = function (s) { try { return String(s||'').normalize('NFD').split('').filter(function(ch){
      const c = ch.charCodeAt(0); return !(c >= 768 && c <= 879) }).join('') } catch (e) { return String(s||'') } };
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); return 'ok' };
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
  const avInc = function (ks) { const L = [].concat(ks); const o = [];
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
  const rc = function (e) { if (!e) return null; const r = e.getBoundingClientRect();
    return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height),
             r: Math.round(r.right), b: Math.round(r.bottom) } };

  /* ══════════ el barrido: CADA globo de CADA seccion ══════════ */
  R.secs = {}; R.sinSeed = []; R.noAparecio = [];
  R.tot = { n: 0, absolutas: 0, estaticas: 0, filaCrece: 0, anchoCambia: 0, saleDeLaCelda: 0,
            seSaleDelPanel: 0, noCerro: 0, sinCaja: 0, textoVacio: 0 };
  R.malos = [];
  const SEEDMAP = {}; SEED.forEach(function (x) { SEEDMAP[x[0]] = x });
  const card = function () { return document.getElementById('indic-card') };
  for (let i = 0; i < IND_SECS.length; i++) {
    const tit = IND_SECS[i].tit, titN = sinTilde(tit);
    const claves = Object.keys(SEEDMAP).filter(function (pr) { return titN.indexOf(sinTilde(pr)) === 0 })
      .sort(function (a, b) { return b.length - a.length });
    if (!claves.length) { R.sinSeed.push(tit); continue }
    sembrar(SEEDMAP[claves[0]][1]);
    await esperar(340);
    let inc = ''; if (IND_SECS[i].av) inc = avInc(IND_SECS[i].av);
    await abrirPanel();
    const d = secPanel(claves[0]);
    if (!d) { R.noAparecio.push(tit); await cerrarPanel(); continue }
    d.open = true; await esperar(100);
    Array.prototype.slice.call(d.querySelectorAll('details')).forEach(function (x) { if (!x.hasAttribute('data-ind-info')) x.open = true });
    await esperar(100);
    const infos = Array.prototype.slice.call(d.querySelectorAll('details[data-ind-info]'));
    const S2 = { n: infos.length, inc: inc, globos: [], textos: [], etiquetas: [] };
    const cr = rc(card());
    for (let j = 0; j < infos.length; j++) {
      const dd = infos[j], sm = dd.querySelector('summary');
      if (!sm) continue;
      const fila = dd.closest('tr'), td = dd.closest('td');
      const a0 = rc(fila), t0 = rc(td);
      sm.click(); await esperar(W);
      const caja = dd.querySelector('div');
      const cs = caja ? getComputedStyle(caja) : null;
      /* El objeto de getComputedStyle es VIVO: leerlo despues de cerrar el globo devuelve el
         valor del elemento CERRADO -o sea static para todos- y la medicion sale toda en rojo
         sobre un panel perfecto. Se copia a cadenas ACA, con el globo abierto. */
      const pos = cs ? String(cs.position) : 'SIN CAJA';
      const anchoCss = cs ? String(cs.width) : null;
      const zCss = cs ? String(cs.zIndex) : null;
      const a1 = rc(fila), c1 = rc(caja);
      const txt = norm(caja ? caja.textContent : '');
      sm.click(); await esperar(Math.max(40, W - 20));
      const a2 = rc(fila);
      R.tot.n++;
      if (pos === 'absolute') R.tot.absolutas++; else R.tot.estaticas++;
      if (!caja) R.tot.sinCaja++;
      if (!txt) R.tot.textoVacio++;
      const crece = !!(a0 && a1 && a1.h > a0.h + 1);
      const anchoCambia = !!(a0 && a1 && Math.abs(a1.w - a0.w) > 1);
      /* «lee a ancho util» NO es «sale de la celda», y la diferencia esta medida: a 390 px la
         celda mide 310 y el cajon 296, asi que no la excede y aun asi se lee perfecto. Con la
         condicion de exceso, 462 de 473 salian en rojo sobre un panel impecable. Lo que importa
         es que el texto tenga ancho de lectura: o excede la celda, o ya mide 200 px o mas. */
      const sale = !!(c1 && t0 && c1.w > t0.w + 2);
      const anchoUtil = !!(c1 && (c1.w >= 200 || (t0 && c1.w > t0.w + 2)));
      const fuera = !!(c1 && cr && (c1.x < cr.x - 2 || c1.r > cr.r + 2));
      const noCerro = !!dd.open;
      if (crece) R.tot.filaCrece++;
      if (anchoCambia) R.tot.anchoCambia++;
      if (sale) R.tot.saleDeLaCelda++;
      if (fuera) R.tot.seSaleDelPanel++;
      if (noCerro) R.tot.noCerro++;
      S2.textos.push(txt);
      S2.etiquetas.push(norm(sm.getAttribute('aria-label')));
      if (anchoUtil) R.tot.anchoUtil = (R.tot.anchoUtil || 0) + 1;
      if (pos !== 'absolute' || crece || anchoCambia || !anchoUtil || fuera || noCerro) {
        R.malos.push({ sec: tit.slice(0, 40), j: j, pos: pos, crece: crece, anchoCambia: anchoCambia,
                       sale: sale, anchoUtil: anchoUtil, fuera: fuera, noCerro: noCerro,
                       fila: [a0 ? a0.h : null, a1 ? a1.h : null, a2 ? a2.h : null],
                       caja: c1, celda: t0, card: cr });
      }
      if (j < 3) S2.globos.push({ et: S2.etiquetas[j].slice(0, 46), pos: pos,
        filaH: [a0 ? a0.h : null, a1 ? a1.h : null, a2 ? a2.h : null],
        filaW: [a0 ? a0.w : null, a1 ? a1.w : null],
        caja: c1, celda: t0, anchoCss: anchoCss, z: zCss });
    }
    /* el cierre de las tres formas, sobre el PRIMER globo de la seccion */
    if (infos.length) {
      const dd = infos[0], sm = dd.querySelector('summary');
      sm.click(); await esperar(W); const ab1 = !!dd.open;
      document.dispatchEvent(new KeyboardEvent('keydown', { key:'Escape', bubbles:true }));
      await esperar(W); const esc = !!dd.open;
      sm.click(); await esperar(W); const ab2 = !!dd.open;
      const cu = document.getElementById('indic-cuerpo'); if (cu) cu.click();
      await esperar(W); const afu = !!dd.open;
      sm.click(); await esperar(W); const ab3 = !!dd.open;
      sm.click(); await esperar(W); const mis = !!dd.open;
      S2.cierre = { abre: ab1 && ab2 && ab3, escape: !esc, afuera: !afu, mismo: !mis };
      S2.aria = { expanded: sm.getAttribute('aria-expanded'), label: !!sm.getAttribute('aria-label'),
                  alto: rc(sm) ? rc(sm).h : null };
      if (infos.length > 1) {
        infos[0].querySelector('summary').click(); await esperar(W);
        infos[1].querySelector('summary').click(); await esperar(W);
        S2.unaSola = { a: !!infos[0].open, b: !!infos[1].open };
        infos[1].querySelector('summary').click(); await esperar(W);
      }
      /* el panel sigue vivo: se contesta una pregunta con un globo abierto */
      const btn = d.querySelector('[data-ind-clin] , .ind-ctrl-btn');
      if (btn) { infos[0].querySelector('summary').click(); await esperar(W);
        let err = '';
        try { btn.click() } catch (e) { err = String(e.message).slice(0, 50) }
        await esperar(320);
        S2.trasContestar = { err: err, secSigueAhi: !!secPanel(claves[0]) }; }
    }
    R.secs[tit] = S2;
    await cerrarPanel();
  }

  /* ══════════ CONTROL NEGATIVO: se le quita el marcador que la regla necesita ══════════ */
  sembrar({ onda_e:'95', e_sep:'6', e_lat:'8', tapse:'14' });
  await esperar(360);
  avInc('hemo');
  await abrirPanel();
  const dh = secPanel('Perfil hemodinamico');
  R.neg = { existe: !!dh };
  if (dh) {
    dh.open = true; await esperar(120);
    const i0 = dh.querySelector('details[data-ind-info]');
    const g = dh.querySelector('[data-ind-grid]');
    if (i0 && g) {
      const fila = i0.closest('tr'), sm = i0.querySelector('summary');
      const h0 = rc(fila).h;
      sm.click(); await esperar(W);
      R.neg.conMarca = { pos: String(getComputedStyle(i0.querySelector('div')).position),
                         filaH: [h0, rc(fila).h] };
      sm.click(); await esperar(W);
      /* se le quita data-ind-grid, que es lo que la regla pide */
      g.removeAttribute('data-ind-grid');
      await esperar(80);
      const h1 = rc(fila).h;
      sm.click(); await esperar(W);
      R.neg.sinMarca = { pos: String(getComputedStyle(i0.querySelector('div')).position),
                         filaH: [h1, rc(fila).h] };
      sm.click(); await esperar(W);
      g.setAttribute('data-ind-grid', '1');
    }
  }
  await cerrarPanel();
  return R;
})()`;

const CODE = CUERPO.split('TEMAAQUI').join(TEMA)
  .split('ESPERAAQUI').join(String(ESPERA));

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
r._errores = errs; r._consola = cons; r._ancho = ANCHO; r._file = FILE; r._motor = MOTOR;
r._tema = TEMA; r._espera = ESPERA;
await ctx.close(); await nav.close();
console.log(JSON.stringify(r));
