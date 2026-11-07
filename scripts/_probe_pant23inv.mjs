#!/usr/bin/env node
/** _probe_pant23inv.mjs - PANT-23, commit 1: inventario del orden de bloques y de los globos.
 *  (A) el ORDEN vertical de los bloques de las 45 secciones de IND_SECS, por posicion de DOM;
 *  (B) el censo de globos: cuantos, donde, y con que mecanismo abre cada uno;
 *  (C) la premisa del medico en Hemodinamica, con el gesto real y el panel abierto;
 *  (D) el mecanismo del modelo -la estenosis aortica- a cuatro anchos;
 *  (E) el censo de textContent de toda la Evidencia, para comparar despues.
 *  Nombre propio: verificado con ls, no existia.
 *  SOLO LECTURA: no escribe nada en el arbol. */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null; for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log('SIN PLAYWRIGHT'); process.exit(2) }
const { chromium } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const ANCHO = parseInt(arg('--ancho') || '1440', 10);
const MOTOR = arg('--motor') || 'chrome';
const PARTE = arg('--parte') || 'abe';

const CUERPO = `(async () => {
  const R = { parte: '` + PARTE + `' };
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display='none' });
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  /* normalizador SIN expresion regular: dentro de un template literal el escape se consume */
  const norm = function (t) { const s = String(t == null ? '' : t); let o = '', sp = false;
    for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i);
      if (c === 32 || c === 9 || c === 10 || c === 13 || c === 160) { sp = true; continue }
      if (sp && o) o += ' '; sp = false; o += s.charAt(i); }
    return o; };
  const sinTilde = function (s) { try { return String(s||'').normalize('NFD').split('').filter(function(ch){
      const c = ch.charCodeAt(0); return !(c >= 768 && c <= 879) }).join('') } catch (e) { return String(s||'') } };
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); return 'ok' };

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

  /* ── los bloques de una seccion, por POSICION DE DOM ── */
  const bloquesDe = function (cont) {
    const todos = Array.prototype.slice.call(cont.querySelectorAll('*'));
    const idx = function (el) { return todos.indexOf(el) };
    const out = [];
    const uno = function (sel, tipo) { const e = cont.querySelector(sel); if (e) out.push({ tipo: tipo, i: idx(e) }) };
    uno('[data-ind-grid]', 'preguntas');
    uno('[data-ind-molde]', 'molde');
    /* las cajas de _indCajaReco: se reconocen por su borde izquierdo de 3 px */
    Array.prototype.slice.call(cont.querySelectorAll('div[style]')).forEach(function (d) {
      const st = d.getAttribute('style') || '';
      if (st.indexOf('border-left:3px solid') < 0) return;
      const t = d.firstElementChild ? norm(d.firstElementChild.textContent) : '';
      let tipo = 'caja:' + t.slice(0, 34);
      if (t.indexOf('Con lo contestado') === 0) tipo = 'contestado';
      else if (t.indexOf('Causas posibles') === 0) tipo = 'causas';
      else tipo = 'recuadro';
      out.push({ tipo: tipo, i: idx(d), tit: t.slice(0, 44) });
    });
    uno('details[data-ind-bloque]', 'verDetalleGuia');
    uno('details[data-ind-detalle]', 'verDetalle');
    uno('details[data-ind-biblio]', 'bibliografia');
    out.sort(function (a, b) { return a.i - b.i });
    return out;
  };

  /* ── los globos de una seccion ── */
  const globosDe = function (cont) {
    const info = Array.prototype.slice.call(cont.querySelectorAll('details[data-ind-info]'));
    const term = Array.prototype.slice.call(cont.querySelectorAll('button[data-ind-term]'));
    return {
      nInfo: info.length,
      nTerm: term.length,
      /* el mecanismo: la regla flotante hoy pide [data-ind-grid][data-ind-preg=1] como ancestro */
      infoEnPreg: info.filter(function (d) { return !!d.closest('[data-ind-grid][data-ind-preg="1"]') }).length,
      infoFueraPreg: info.filter(function (d) { return !d.closest('[data-ind-grid][data-ind-preg="1"]') }).length,
      /* la celda que lo contiene */
      infoEnTercerTd: info.filter(function (d) { const td = d.closest('td');
        return !!(td && td.parentNode && Array.prototype.indexOf.call(td.parentNode.children, td) === 2) }).length,
      etiquetas: info.map(function (d) { const s = d.querySelector('summary');
        return s ? norm(s.getAttribute('aria-label')) : '(sin aria-label)' }),
      textos: info.map(function (d) { const v = d.querySelector('div'); return norm(v ? v.textContent : '') }),
      terms: term.map(function (b) { return b.getAttribute('data-ind-term') })
    };
  };

  /* ══════════ (A) y (B) y (E): las 45 secciones ══════════ */
  if (R.parte.indexOf('a') > -1) {
    R.secs = {}; R.sinSeed = []; R.err = [];
    const SEEDMAP = {}; SEED.forEach(function (x) { SEEDMAP[x[0]] = x });
    const cont = document.createElement('div');
    cont.setAttribute('id','p23cont'); document.body.appendChild(cont);
    for (let i = 0; i < IND_SECS.length; i++) {
      const tit = IND_SECS[i].tit, titN = sinTilde(tit);
      const claves = Object.keys(SEEDMAP).filter(function (pr) { return titN.indexOf(sinTilde(pr)) === 0 })
        .sort(function (a, b) { return b.length - a.length });
      if (!claves.length) { R.sinSeed.push(tit); continue }
      const campos = SEEDMAP[claves[0]][1];
      sembrar(campos);
      await esperar(90);
      let r = null, html = '';
      try { r = IND_SECS[i].fn(); if (r) html = _indSecHTML(tit, r) }
      catch (e) { R.err.push(tit + ' LANZO: ' + String(e.message).slice(0,70)); continue }
      if (!r) { R.secs[tit] = { abrio:false }; continue }
      cont.innerHTML = html;
      Array.prototype.slice.call(cont.querySelectorAll('details')).forEach(function (d) { d.open = true });
      const txt = norm(cont.textContent);
      /* los corchetes de cita, en el orden en que salen */
      const cor = [];
      let p = 0;
      while (true) { const a = txt.indexOf('[', p); if (a < 0) break; const b = txt.indexOf(']', a);
        if (b < 0) break; const d = txt.slice(a+1, b); let ok = d.length > 0;
        for (let k = 0; k < d.length; k++) { const c = d.charCodeAt(k); if (c < 48 || c > 57) ok = false }
        if (ok) cor.push(Number(d)); p = b + 1; }
      R.secs[tit] = {
        abrio: true,
        tieneAdapt: !!r.adapt, tieneRecom: !!r.recom, tieneMolde: !!r.molde,
        tieneCausas: !!r.causas, ordenProt: !!r.ordenProt, preguntas: !!r.preguntas,
        compacta: !!r.compacta, hayClin: !!(r.clinica && r.clinica.length),
        bloques: bloquesDe(cont).map(function (x) { return x.tipo }),
        bloquesTit: bloquesDe(cont).filter(function(x){ return x.tit }).map(function(x){ return x.tipo+'='+x.tit }),
        globos: globosDe(cont),
        corchetes: cor,
        texto: txt,
        textoLargo: txt.length
      };
    }
    cont.parentNode.removeChild(cont);
  }

  /* ══════════ (C) y (D): el gesto real en el panel ══════════ */
  const integrado = function (k) { try { return (typeof amiloIntegrado === 'function') ? !!amiloIntegrado(k) : null } catch (e) { return 'ERR' } };
  const avInc = function (k) { try { if (integrado(k) === true) return 'ya'; if (typeof amiloIntegrar === 'function') { amiloIntegrar(k); return integrado(k) ? 'ok' : 'NO QUEDO' } return 'NO FN' } catch (e) { return 'ERR ' + String(e.message).slice(0,40) } };
  const abrirPanel = async function () { const b = document.getElementById('indic-btn'); if (!b) return 'NO BTN';
    const ov = document.getElementById('indic-overlay');
    if (!ov || getComputedStyle(ov).display === 'none') { b.click(); await esperar(380) }
    else { try { indicRender() } catch (e) {} await esperar(240) }
    const o2 = document.getElementById('indic-overlay'); return o2 ? getComputedStyle(o2).display : 'NO OV'; };
  const cerrarPanel = async function () { const ov = document.getElementById('indic-overlay'); if (ov) ov.style.display='none'; await esperar(40) };
  const secPanel = function (pref) { return Array.prototype.slice.call(document.querySelectorAll('#indic-cuerpo > details'))
      .filter(function (d) { const s = d.querySelector('summary'); return s && sinTilde(norm(s.textContent)).indexOf(sinTilde(pref)) === 0 })[0] || null };
  const rect = function (e) { if (!e) return null; const r = e.getBoundingClientRect();
    return { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } };

  /* abre un globo con el GESTO REAL y mide su fila antes y despues */
  const medirGlobo = async function (sec, j) {
    const infos = Array.prototype.slice.call(sec.querySelectorAll('details[data-ind-info]'));
    const d = infos[j]; if (!d) return null;
    const sm = d.querySelector('summary'); if (!sm) return null;
    const fila = d.closest('tr'), td = d.closest('td');
    const antes = { fila: rect(fila), td: rect(td), open: !!d.open };
    sm.click(); await esperar(140);
    const caja = d.querySelector('div');
    const cs = caja ? getComputedStyle(caja) : null;
    const despues = { fila: rect(fila), td: rect(td), open: !!d.open, caja: rect(caja),
      position: cs ? cs.position : null, zIndex: cs ? cs.zIndex : null,
      anchoCss: cs ? cs.width : null };
    /* desborda la fila? el cajon del modelo se sale de la celda a proposito */
    const fuera = (caja && td) ? (caja.getBoundingClientRect().width > td.getBoundingClientRect().width + 2) : null;
    sm.click(); await esperar(100);
    const cerrado = { fila: rect(fila), open: !!d.open };
    return { etiqueta: norm(sm.getAttribute('aria-label')), antes: antes, despues: despues,
             cerrado: cerrado, cajaFueraDeLaCelda: fuera,
             creceLaFila: !!(antes.fila && despues.fila && despues.fila.h > antes.fila.h + 1),
             creceElAncho: !!(antes.fila && despues.fila && Math.abs(despues.fila.w - antes.fila.w) > 1),
             textoCaja: norm(caja ? caja.textContent : '') };
  };

  if (R.parte.indexOf('b') > -1) {
    R.gesto = {};
    /* Hemodinamica: el caso del medico. Sector avanzado -> hay que integrarlo (PANT-22). */
    sembrar({ onda_e:'95', e_sep:'6', e_lat:'8', tapse:'14' });
    await esperar(420);
    R.gesto._hemoInc = avInc('hemo');
    await abrirPanel();
    const sh = secPanel('Perfil hemodinamico');
    R.gesto.hemo = { existe: !!sh };
    if (sh) {
      sh.open = true; await esperar(160);
      R.gesto.hemo.nInfo = sh.querySelectorAll('details[data-ind-info]').length;
      R.gesto.hemo.enPreg = sh.querySelectorAll('[data-ind-grid][data-ind-preg="1"] details[data-ind-info]').length;
      R.gesto.hemo.globos = [];
      for (let j = 0; j < Math.min(4, R.gesto.hemo.nInfo); j++) {
        R.gesto.hemo.globos.push(await medirGlobo(sh, j));
      }
      R.gesto.hemo.bloques = bloquesDe(sh).map(function (x) { return x.tipo });
    }
    await cerrarPanel();
    /* el MODELO: la estenosis aortica */
    sembrar({ vmax_ao:'4.5', gmedio_ao:'45', ava_cont:'0.8', peso:'75', talla:'175' });
    await esperar(420);
    await abrirPanel();
    const se = secPanel('Estenosis aortica');
    R.gesto.ea = { existe: !!se };
    if (se) {
      se.open = true; await esperar(160);
      R.gesto.ea.nInfo = se.querySelectorAll('details[data-ind-info]').length;
      R.gesto.ea.enPreg = se.querySelectorAll('[data-ind-grid][data-ind-preg="1"] details[data-ind-info]').length;
      R.gesto.ea.globos = [];
      for (let j = 0; j < Math.min(4, R.gesto.ea.nInfo); j++) {
        R.gesto.ea.globos.push(await medirGlobo(se, j));
      }
      R.gesto.ea.bloques = bloquesDe(se).map(function (x) { return x.tipo });
      /* como se cierra: Escape y tocar afuera */
      const infos = Array.prototype.slice.call(se.querySelectorAll('details[data-ind-info]'));
      if (infos[0]) {
        const sm = infos[0].querySelector('summary');
        sm.click(); await esperar(120);
        const abierto1 = !!infos[0].open;
        document.dispatchEvent(new KeyboardEvent('keydown', { key:'Escape', bubbles:true }));
        await esperar(120);
        const trasEscape = !!infos[0].open;
        sm.click(); await esperar(120);
        const abierto2 = !!infos[0].open;
        const cu = document.getElementById('indic-cuerpo'); if (cu) cu.click();
        await esperar(120);
        const trasAfuera = !!infos[0].open;
        sm.click(); await esperar(100);
        const abierto3 = !!infos[0].open;
        sm.click(); await esperar(100);
        const trasMismo = !!infos[0].open;
        R.gesto.ea.cierre = { abierto1: abierto1, trasEscape: trasEscape, abierto2: abierto2,
          trasAfuera: trasAfuera, abierto3: abierto3, trasMismo: trasMismo,
          hayX: (function(){ const c = infos[0].querySelector('div');
            return c ? norm(c.textContent).indexOf('✕') > -1 || !!c.querySelector('button') : null })(),
          aria: (function(){ const s = infos[0].querySelector('summary');
            return s ? { expanded: s.getAttribute('aria-expanded'), label: !!s.getAttribute('aria-label') } : null })() };
      }
      /* dos a la vez */
      if (infos[0] && infos[1]) {
        infos[0].querySelector('summary').click(); await esperar(110);
        infos[1].querySelector('summary').click(); await esperar(110);
        R.gesto.ea.unaSola = { a: !!infos[0].open, b: !!infos[1].open };
        infos[1].querySelector('summary').click(); await esperar(80);
      }
    }
    /* el panel a este ancho */
    R.gesto.panel = (function () { const c = document.getElementById('indic-card');
      return c ? { ancho: Math.round(c.getBoundingClientRect().width),
        scrollH: Math.round(document.body.scrollWidth - document.documentElement.clientWidth) } : null })();
    await cerrarPanel();
  }

  /* ══════════ los globos FUERA del panel de Evidencia ══════════ */
  if (R.parte.indexOf('e') > -1) {
    R.fuera = {
      vinfoCard: !!document.getElementById('vinfo-card'),
      indicTerm: !!document.getElementById('indic-term'),
      /* cuantos mecanismos de globo hay en el archivo, por su marca */
      marcas: {
        vinfo: document.querySelectorAll('[onclick*="_vInfoAbrir"], [data-vinfo]').length,
        detallesSueltos: document.querySelectorAll('details:not([data-ind-info]):not([data-ind-detalle]):not([data-ind-biblio]):not([data-ind-bloque])').length
      }
    };
  }
  return R;
})()`;

const CODE = CUERPO;

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
await ctx.close();
await nav.close();
console.log(JSON.stringify(r));
