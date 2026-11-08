#!/usr/bin/env node
/** _probe_pant24info.mjs - PANT-24, commit 1 y commit 5: la ZONA DE TOQUE del circulo-i de la
 *  Evidencia. Con emulacion tactil (hasTouch) mide, para CADA globo de las 45 secciones:
 *  el rectangulo del summary, el rectangulo efectivo de toque -el del propio summary mas su
 *  pseudo-elemento, deducido con elementFromPoint en las CUATRO esquinas de la caja de 44x44
 *  centrada en el-, la distancia minima entre centros de globos vecinos, y si la caja de 44
 *  se superpone con otro globo o con un boton de respuesta.
 *  Sin emulacion tactil (--mouse) mide el ALTO y el ANCHO de todas las filas, que es el control
 *  de que nada se movio.
 *  Nombre propio: verificado con ls, no existia. SOLO LECTURA sobre el arbol.
 *
 *   node scripts/_probe_pant24info.mjs --ancho 1440 [--mouse] [--file X] [--motor webkit]
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null; for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log('SIN PLAYWRIGHT'); process.exit(2) }
const { chromium, webkit } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const ANCHO = parseInt(arg('--ancho') || '1440', 10);
const MOTOR = arg('--motor') || 'chrome';
const TOQUE = process.argv.indexOf('--mouse') === -1;
const DIA = process.argv.indexOf('--dia') > -1;

const CUERPO = `(async () => {
  const R = { secs:{}, tot:{ nSecs:0, nInfo:0, zonaOK:0, zonaChica:0, esquinasOK:0,
                             pisaInfo:0, pisaInfoImp:0, pisaBoton:0, pisaBotonImp:0, pares44:0, scroll:0 },
              pares:[], chicos:[], pisadas:[], filas:{}, _coarse: matchMedia('(pointer: coarse)').matches };
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
  /* MODO DIA por su DUENO real, toggleTheme, y no agregando la clase a mano: asi corren los dos
     repintados que esa funcion encadena y la medicion es la del gesto del medico. */
  if (window.__p24dia) { try { if (!document.documentElement.classList.contains('light-mode')) toggleTheme() } catch (e) {} }
  R._dia = document.documentElement.classList.contains('light-mode');

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
    S('nombre','P24'); S('ci','24242424');
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
    return !(a.right <= b.left + 0.5 || a.left >= b.right - 0.5 || a.bottom <= b.top + 0.5 || a.top >= b.bottom - 0.5) };
  /* La caja de 44x44 CENTRADA en el glifo: es la que la decision pide, y es contra ella que se
     mide la superposicion y el elementFromPoint de las cuatro esquinas. */
  /* DOS cajas, y las dos se miden: la de 44x44 que la decision pide -contra la que se cuenta la
     superposicion con un vecino, que es lo que obliga a acotar- y la IMPLEMENTADA, 44 de ancho
     por ZALTO de alto, contra la que se prueban las cuatro esquinas con elementFromPoint. */
  const ZALTO = (typeof window.__p24zalto === 'number') ? window.__p24zalto : 42;
  R._zalto = ZALTO;   /* se asigna ACA y no en el literal de R: alla ZALTO esta en zona muerta y
                         el cuerpo entero abortaria con ReferenceError, que se lee igual que
                         «la sonda no mide nada». */
  const cajaWH = function (r, w, h) { const cx = r.left + r.width/2, cy = r.top + r.height/2;
    return { left:cx-w/2, right:cx+w/2, top:cy-h/2, bottom:cy+h/2, width:w, height:h, cx:cx, cy:cy } };
  const caja44 = function (r) { return cajaWH(r, 44, 44) };
  const cajaImp = function (r) { return cajaWH(r, 44, ZALTO) };

  const SEEDMAP = {}; SEED.forEach(function (x) { SEEDMAP[x[0]] = x });
  for (let i = 0; i < IND_SECS.length; i++) {
    const tit = IND_SECS[i].tit, titN = sinTilde(tit);
    const claves = Object.keys(SEEDMAP).filter(function (pr) { return titN.indexOf(sinTilde(pr)) === 0 })
      .sort(function (a, b) { return b.length - a.length });
    if (!claves.length) continue;
    sembrar(SEEDMAP[claves[0]][1]);
    await esperar(330);
    if (IND_SECS[i].av) avInc(IND_SECS[i].av);
    await abrirPanel();
    const d = secPanel(claves[0]);
    if (!d) { await cerrarPanel(); continue }
    d.open = true; await esperar(110);
    const infos = Array.prototype.slice.call(d.querySelectorAll('details[data-ind-info] > summary'));
    const btns  = Array.prototype.slice.call(d.querySelectorAll('.ind-ctrl-btn'));
    if (!infos.length) { R.secs[tit] = { nInfo:0 }; R.tot.nSecs++; await cerrarPanel(); continue }
    R.tot.nSecs++;
    const rects = infos.map(function (s) { const r = s.getBoundingClientRect();
      return { left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height } });
    const o = { nInfo: infos.length, glifo:{}, zona:{}, esquinas:{ ok:0, mal:0, det:[] },
                minPar: null, pares44:[], pisaInfo:0, pisaBoton:0, nBotones: btns.length };
    /* Tamanio visible del glifo: ancho x alto del summary, y su font-size computado */
    const fs = infos.map(function (s) { return Math.round(parseFloat(getComputedStyle(s).fontSize) * 10) / 10 });
    o.glifo = { w: Math.round(Math.min.apply(null, rects.map(r=>r.width))*10)/10,
                W: Math.round(Math.max.apply(null, rects.map(r=>r.width))*10)/10,
                h: Math.round(Math.min.apply(null, rects.map(r=>r.height))*10)/10,
                H: Math.round(Math.max.apply(null, rects.map(r=>r.height))*10)/10,
                fsMin: Math.min.apply(null, fs), fsMax: Math.max.apply(null, fs) };
    /* Distancia minima entre centros de globos de la MISMA seccion */
    let minD = Infinity;
    for (let a = 0; a < rects.length; a++) for (let b = a+1; b < rects.length; b++) {
      const ca = caja44(rects[a]), cb = caja44(rects[b]);
      const dx = ca.cx - cb.cx, dy = ca.cy - cb.cy;
      const dist = Math.sqrt(dx*dx + dy*dy);
      if (dist < minD) minD = dist;
      if (dist < 44) { o.pares44.push({ a:a, b:b, d: Math.round(dist*10)/10,
            dx: Math.round(Math.abs(dx)*10)/10, dy: Math.round(Math.abs(dy)*10)/10 });
        R.tot.pares44++; R.pares.push({ sec:tit, a:a, b:b, d: Math.round(dist*10)/10 }); }
      if (cruza(ca, cb)) { o.pisaInfo++; R.tot.pisaInfo++;
        R.pisadas.push({ sec:tit, tipo:'info44', a:a, b:b }); }
      if (cruza(cajaImp(rects[a]), cajaImp(rects[b]))) { o.pisaInfoImp = (o.pisaInfoImp||0)+1;
        R.tot.pisaInfoImp = (R.tot.pisaInfoImp||0)+1;
        R.pisadas.push({ sec:tit, tipo:'infoIMP', a:a, b:b }); }
    }
    o.minPar = (minD === Infinity) ? null : Math.round(minD*10)/10;
    /* Superposicion con un boton de respuesta */
    for (let a = 0; a < rects.length; a++) {
      const ca = caja44(rects[a]);
      const n = btns.filter(function (bt) { return cruza(ca, bt.getBoundingClientRect()) }).length;
      const nI = btns.filter(function (bt) { return cruza(cajaImp(rects[a]), bt.getBoundingClientRect()) }).length;
      if (nI) { o.pisaBotonImp = (o.pisaBotonImp||0)+nI; R.tot.pisaBotonImp = (R.tot.pisaBotonImp||0)+nI }
      if (n) { o.pisaBoton += n; R.tot.pisaBoton += n;
        R.pisadas.push({ sec:tit, tipo:'boton', a:a, n:n }); }
    }
    /* elementFromPoint en las CUATRO esquinas de la caja de 44, con el globo a la vista */
    for (let a = 0; a < infos.length; a++) {
      const s = infos[a];
      s.scrollIntoView({ block:'center' }); await esperar(45);
      const r = s.getBoundingClientRect(), c = cajaImp(r), c44 = caja44(r);
      const pts = [[c.left+1, c.top+1], [c.right-1, c.top+1], [c.left+1, c.bottom-1], [c.right-1, c.bottom-1]];
      let ok = 0, fuera = 0;
      for (const p of pts) {
        const x = Math.round(p[0]), y = Math.round(p[1]);
        if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) { fuera++; continue }
        const el = document.elementFromPoint(x, y);
        if (el === s || (s.contains && s.contains(el)) || (el && el.closest && el.closest('details[data-ind-info]') &&
            el.closest('details[data-ind-info]') === s.parentElement)) ok++;
      }
      /* EL CENTRO DEL GLIFO, que es lo que distingue «mi zona no llega» de «otra capa lo tapa».
         Si el centro tampoco responde, el globo esta tapado y eso es preexistente: lo mismo pasa
         con la zona de 11x14 de HEAD. P23-b ya declara un caso asi en la estenosis mitral. */
      const elC = (Math.round(c.cx) >= 0 && Math.round(c.cy) >= 0 && Math.round(c.cx) < innerWidth
                   && Math.round(c.cy) < innerHeight)
        ? document.elementFromPoint(Math.round(c.cx), Math.round(c.cy)) : null;
      const centroOK = !!(elC && (elC === s || (s.contains && s.contains(elC))));
      /* ⚠️ Y LA SUPERPOSICION CON UN CONTROL SE MIDE CONTRA SU ZONA DE TOQUE, NO CONTRA SU
         RECTANGULO. Los botones de respuesta miden 32 px de alto visible y 44 de area tactil,
         que les da su propio ::after, y ese pseudo-elemento NO entra en
         getBoundingClientRect. Se barre la caja implementada punto por punto -una rejilla de
         5 x 5- y se mira si alguno devuelve un .ind-ctrl-btn o otro globo: eso es lo que el
         dedo encontraria. */
      let chocaCtrl = 0, chocaOtro = 0;
      for (let gx = 0; gx <= 4; gx++) for (let gy = 0; gy <= 4; gy++) {
        const x = Math.round(c.left + 1 + (c.width - 2) * gx / 4);
        const y = Math.round(c.top + 1 + (c.height - 2) * gy / 4);
        if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
        const e2 = document.elementFromPoint(x, y);
        if (!e2) continue;
        if (e2 === s || (s.contains && s.contains(e2))) continue;
        if (e2.closest && e2.closest('.ind-ctrl-btn')) chocaCtrl++;
        else if (e2.closest && e2.closest('details[data-ind-info]')) chocaOtro++;
      }
      if (chocaCtrl) { R.tot.chocaCtrl = (R.tot.chocaCtrl || 0) + 1;
        if ((R.choques || (R.choques = [])).length < 20) R.choques.push({ sec:tit, a:a, ctrl:chocaCtrl }) }
      if (chocaOtro) { R.tot.chocaOtro = (R.tot.chocaOtro || 0) + 1;
        if ((R.choques || (R.choques = [])).length < 20) R.choques.push({ sec:tit, a:a, otroInfo:chocaOtro }) }
      if (centroOK) R.tot.centroOK = (R.tot.centroOK || 0) + 1;
      else { R.tot.centroTapado = (R.tot.centroTapado || 0) + 1;
        if ((R.tapados || (R.tapados = [])).length < 30)
          R.tapados.push({ sec:tit, a:a, encima: elC ? (elC.tagName + '.' + String(elC.className||'').slice(0,28) + '#' + (elC.id||'')) : 'null' }); }
      R.tot.nInfo++;
      if (ok === 4) { R.tot.esquinasOK++; o.esquinas.ok++ }
      else { o.esquinas.mal++;
        if (o.esquinas.det.length < 4) o.esquinas.det.push({ a:a, ok:ok, fuera:fuera,
          w:Math.round(r.width*10)/10, h:Math.round(r.height*10)/10 }); }
      /* La ZONA real: el rectangulo que de verdad responde al toque. Se mide barriendo desde el
         centro hacia los cuatro lados y viendo hasta donde elementFromPoint sigue devolviendo
         este globo. Es lo que el commit 5 tiene que llevar a 44. */
      /* El barrido de la zona REAL se hace en TODOS los globos y no en los tres primeros: a 390
         px la botonera se envuelve y la zona queda acotada por un control en una parte de ellos,
         asi que el promedio de los tres primeros no describe el conjunto. */
      {
        const mide = function (dx, dy) { let k = 0;
          for (let t = 1; t <= 30; t++) { const x = Math.round(c.cx + dx*t), y = Math.round(c.cy + dy*t);
            if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) break;
            const el = document.elementFromPoint(x, y);
            if (el === s || (s.contains && s.contains(el))) k = t; else break }
          return k };
        const z = { izq: mide(-1,0), der: mide(1,0), arr: mide(0,-1), aba: mide(0,1) };
        if (a < 3) o.zona['g' + a] = z;
        const anc = z.izq + z.der + 1, alt = z.arr + z.aba + 1;
        R.tot.anchoSuma = (R.tot.anchoSuma || 0) + anc;
        R.tot.altoSuma  = (R.tot.altoSuma  || 0) + alt;
        if (anc >= 40 && alt >= 38) R.tot.zonaEntera = (R.tot.zonaEntera || 0) + 1;
        else if (anc >= 30 && alt >= 24) R.tot.zonaAmplia = (R.tot.zonaAmplia || 0) + 1;
        else if (anc >= 20 || alt >= 20) R.tot.zonaMedia = (R.tot.zonaMedia || 0) + 1;
        else R.tot.zonaMinima = (R.tot.zonaMinima || 0) + 1;
        const k2 = anc + 'x' + alt;
        (R.zonaHist || (R.zonaHist = {}))[k2] = ((R.zonaHist || {})[k2] || 0) + 1;
      }
    }
    if (o.esquinas.ok === o.nInfo) R.tot.zonaOK++; else R.tot.zonaChica++;
    if (o.esquinas.mal) R.chicos.push({ sec:tit, mal:o.esquinas.mal, de:o.nInfo, det:o.esquinas.det });
    const sh = Math.round(document.body.scrollWidth - document.documentElement.clientWidth);
    if (sh > 0) { o.scrollH = sh; R.tot.scroll++ }
    /* Las FILAS de la seccion: alto y ancho, que es el control de que nada se movio */
    const tds = Array.prototype.slice.call(d.querySelectorAll('[data-ind-grid] tr'));
    R.filas[tit] = tds.map(function (tr) { const r = tr.getBoundingClientRect();
      return Math.round(r.height*10)/10 + 'x' + Math.round(r.width*10)/10 });
    R.secs[tit] = o;
    await cerrarPanel();
  }
  /* Los circulo-i de FUERA del panel: los de vinfo-btn y cualquier otro summary de detalle */
  R.fuera = (function(){
    const b = Array.prototype.slice.call(document.querySelectorAll('.vinfo-btn'));
    const alt = Array.prototype.slice.call(document.querySelectorAll('[onclick*="vInfoClic"]'));
    const set = {}; b.concat(alt).forEach(function(e){ set[e.id || (e.getAttribute('data-vinfo')||'') + '|' + (e.getAttribute('aria-label')||'').slice(0,30)] = 1 });
    const vis = b.concat(alt).filter(function(e){ const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 });
    const dim = vis.map(function(e){ const r = e.getBoundingClientRect();
      return Math.round(r.width) + 'x' + Math.round(r.height) });
    const cnt = {}; dim.forEach(function(x){ cnt[x] = (cnt[x]||0)+1 });
    return { nVinfoBtn: b.length, nOnclick: alt.length, nDistintos: Object.keys(set).length,
             nVisibles: vis.length, dimensiones: cnt };
  })();
  return R;
})()`;

const nav = await (MOTOR === 'webkit' ? webkit : chromium).launch(
  MOTOR === 'webkit' ? { headless: true } : { channel: 'chrome', headless: true });
const ctx = await nav.newContext(TOQUE
  ? { viewport: { width: ANCHO, height: 900 }, hasTouch: true }
  : { viewport: { width: ANCHO, height: 900 } });
const pg = await ctx.newPage();
const errs = [], cons = [];
pg.on('pageerror', e => errs.push(String(e.message).slice(0, 180)));
pg.on('console', m => { if (m.type() === 'error') cons.push(String(m.text()).slice(0, 180)) });
await pg.addInitScript('window.__p24dia = ' + (DIA ? 'true' : 'false') + ';');
await pg.goto('file://' + FILE);
await pg.waitForTimeout(1700);
let r; try { r = await pg.evaluate(CUERPO) } catch (e) { r = { ERR: String(e.message).slice(0, 900) } }
r._errores = errs; r._consola = cons.slice(0, 20); r._ancho = ANCHO; r._motor = MOTOR;
r._modo = TOQUE ? 'TACTIL (hasTouch)' : 'MOUSE'; r._file = FILE;
r._tema = DIA ? 'DIA (light-mode)' : 'NOCHE';
await ctx.close(); await nav.close();
console.log(JSON.stringify(r));
