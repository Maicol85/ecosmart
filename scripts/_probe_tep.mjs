#!/usr/bin/env node
/**
 * _probe_tep.mjs - la sonda de la tanda C (TEP), 2026-10-21.
 *
 * A/B de SOLO LECTURA: con --file se corre contra una copia de HEAD y se comparan las salidas.
 * Mide lo RENDERIZADO (textContent de la pantalla, texto del informe, del EN SUMA y de la hoja
 * del PDF), nunca el valor de retorno de una funcion.
 *
 *   node scripts/_probe_tep.mjs --solo score
 *   node scripts/_probe_tep.mjs --solo score --file /tmp/head.html
 *   node scripts/_probe_tep.mjs --solo maqueta --dest /tmp/tepcap
 *
 * ADVERTENCIA: sin acentos graves dentro de los templates, y sin \s ni \n (se cocinan).
 */
const CANDIDATAS = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
                    '/tmp/pw/node_modules/playwright/index.js',
                    '/usr/local/lib/node_modules/playwright/index.js',
                    process.env.HOME + '/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CANDIDATAS) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) {
  console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CANDIDATAS,
    comoInstalar: 'mkdir -p ~/.pwtmp && cd ~/.pwtmp && npm i playwright' }, null, 1));
  process.exit(2);
}
const { chromium, webkit } = _pw;
import fs from 'fs';
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const SOLO = (arg('--solo') || 'score').split(',').map(s => s.trim());
const FILE = arg('--file') || (RAIZ + '/index.html');
const DEST = arg('--dest') || '/tmp/tepcap';
const MOTORES = (arg('--motor') || 'chrome').split(',').map(s => s.trim());
const OUT = {};
const hay = (g) => SOLO.indexOf(g) > -1;

/* Despeja los dos overlays que envenenan elementFromPoint y que VUELVEN a mitad de corrida. */
const PRELUDIO = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  if (typeof showTab === 'function') { try { showTab('hemodinamica') } catch (e) {} }
  const s = document.getElementById('tep-seccion'); if (s) s.style.display = '';
  return true })()`;

/* AYUDANTES que viven EN la pagina. `__p.set` escribe por el camino de la app (despacha el
   evento), y `__p.T` lee el texto RENDERIZADO. */
const AYUD = `window.__p = (function(){
  const T = id => { const e = document.getElementById(id); return e ? (e.textContent || '').trim() : 'NO EXISTE' };
  const set = (id, val) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = val;
    e.dispatchEvent(new Event('input', {bubbles:true}));
    e.dispatchEvent(new Event('change', {bubbles:true}));
    return e.value };
  const limpiar = () => { try { limpiarCampos() } catch(e){} };
  return { T:T, set:set, limpiar:limpiar } })(); true`;

/* ══ ESCENA DEL SCORE ════════════════════════════════════════════════════════════════════
   Cada escena limpia, carga sus campos, y lee: las siete filas, el score, la interpretacion,
   el renglon de orientacion, el cociente, el informe, el EN SUMA y la hoja del PDF de TEP. */
const ESCENA = `(() => {
  const C = CASO;
  __p.limpiar();
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  Object.keys(C.campos || {}).forEach(k => __p.set(k, C.campos[k]));
  try { if (typeof calcPmAD === 'function') calcPmAD() } catch(e){}
  try { if (typeof calcPSAP === 'function') calcPSAP() } catch(e){}
  try { calcTEP() } catch(e){}
  /* El boton «Integrar al informe» es la perilla del narrativo. */
  try { if (typeof amiloIntegrar === 'function' && typeof amiloIntegrado === 'function' &&
            !amiloIntegrado('tep')) amiloIntegrar('tep') } catch(e){}
  try { generarInforme() } catch(e){}
  const inf = (document.getElementById('informe_texto') || {}).value || '';
  const sum = (document.getElementById('en_suma') || {}).value || '';
  const lin = inf.split(String.fromCharCode(10)).filter(l => l.indexOf('sobrecarga VD aguda') > -1);
  const sumL = sum.split(String.fromCharCode(10)).filter(l => l.indexOf('TEP/sobrecarga') > -1);
  let hoja = '';
  try { hoja = (typeof amiloTextoTEP === 'function') ? amiloTextoTEP() : 'SIN FN' } catch(e){ hoja = 'EXC' }
  return {
    tpsp: __p.T('tep-tapse-psap'),
    acop: __p.T('tep-acoplamiento'),
    vdvi: __p.T('tep-vdvi-interp'),
    tapse: __p.T('tep-tapse-interp'),
    psap: __p.T('tep-psap-interp'),
    mcc: __p.T('tep-mcconnell-interp'),
    s60: __p.T('tep-6060-interp'),
    td: __p.T('tep-tabiqued-interp'),
    score: __p.T('tep-score'),
    interp: __p.T('tep-interpretacion'),
    estrat: __p.T('tep-estratificacion'),
    psapCalc: (document.getElementById('psap_calc') || {}).value || '',
    infLinea: lin.join(' // '),
    sumLinea: sumL.join(' // '),
    hojaSalvedad: hoja.indexOf('Salvedad') > -1,
    hojaOrient: (hoja.split(String.fromCharCode(10)).filter(l => l.indexOf('Orientaci') === 0)[0] || ''),
    hojaAcop: (hoja.split(String.fromCharCode(10)).filter(l => l.indexOf('TAPSE/PSAP:') === 0)[0] || '')
  } })()`;

/* ══ CONTROLES: lo que esta tanda NO toca ══════════════════════════════════════════════════ */
const CONTROLES = `(() => {
  __p.limpiar();
  const C = CASO;
  Object.keys(C.campos || {}).forEach(k => __p.set(k, C.campos[k]));
  try { if (typeof calcPmAD === 'function') calcPmAD() } catch(e){}
  try { if (typeof calcPSAP === 'function') calcPSAP() } catch(e){}
  try { if (typeof calcVD === 'function') calcVD() } catch(e){}
  try { if (typeof calcHTP2022 === 'function') calcHTP2022() } catch(e){}
  try { if (typeof calcDiastol === 'function') calcDiastol() } catch(e){}
  try { if (typeof popPocusSync === 'function') popPocusSync() } catch(e){}
  try { if (typeof dptEstado === 'function') dptEstado() } catch(e){}
  const R = {};
  ['tapse-interp','sprime-interp','vd-tei-interp','vd-vi-interp','vd-pared-interp','vd-tam',
   'htp2022-prob','htp2022-catA','htp2022-catB','htp2022-catC','dd-interp','pop-pocus-vd',
   'ad-interp','dpt-badge','dpt-estado'].forEach(id => {
     const e = document.getElementById(id); R[id] = e ? (e.textContent || '').trim().slice(0,220) : 'NO EXISTE' });
  /* El Excel se mide sobre un estudio ARCHIVADO armado con los campos de la pantalla, que es
     como lo consume el Laboratorio. Se comparan las CLAVES y los VALORES, no solo el conteo. */
  try {
    const campos = {};
    Array.prototype.forEach.call(document.querySelectorAll('input[id],select[id],textarea[id]'),
      e => { if (e.type !== 'button' && e.id) campos[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : e.value });
    const fila = (typeof _labExcelRow === 'function') ? _labExcelRow({ campos: campos, fecha: '2026-10-21' }) : null;
    R.excelN = fila ? Object.keys(fila).length : 'SIN FN';
    R.excelFila = fila ? JSON.stringify(fila) : 'SIN FN';
  } catch(e){ R.excelN = 'EXC ' + e.message.slice(0,80); R.excelFila = 'EXC' }
  /* Laboratorio: las funciones dueñas. */
  ['_labDiastGrado','_labGeomCat','_labDisfSistVent'].forEach(fn => {
    try { R[fn] = (typeof window[fn] === 'function') ? JSON.stringify(window[fn]('')) : 'SIN FN' }
    catch(e){ R[fn] = 'EXC' } });
  return R })()`;

/* ══ LA FICHA DE REFERENCIAS DEL TEP ════════════════════════════════════════════════════
   Se mide el TEXTO RENDERIZADO de la entrada, no el fuente: lo que se afirma es lo que el
   medico lee. La entrada nace plegada y vive en una subpestaña de Referencias, asi que se
   abre por el gesto y se ABORTA si no tiene geometria. */
const REFS = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  try { showTab('refs') } catch(e){}
  try { if (typeof refSubInit === 'function') refSubInit() } catch(e){}
  /* ⚠️ LA ENTRADA VIVE EN LA SUBPESTAÑA «fun» (REF_SUBTAB). Sin activarla, la tarjeta existe y
     mide 0x0 dentro de un panel apagado, y la medicion informa «sin geometria» sobre una ficha
     perfecta. refSubTab EXIGE su segundo argumento: sin el boton lanza al tocarle el
     classList y se traga el resto del abridor. */
  try {
    let btn = null;
    Array.prototype.forEach.call(document.querySelectorAll('[onclick]'), b => {
      const oc = b.getAttribute('onclick') || '';
      if (!btn && oc.indexOf('refSubTab') > -1 && oc.indexOf('fun') > -1) btn = b; });
    if (typeof refSubTab === 'function') refSubTab('fun', btn);
  } catch(ex){}
  const e = document.getElementById('ref-tep');
  if (!e) return { ABORTO: 'SIN ref-tep' };
  if (getComputedStyle(e).display === 'none') { try { toggleRef('tep') } catch(ex){} }
  e.style.display = '';
  const r = e.getBoundingClientRect();
  const t = (e.textContent || '').replace(/[ ]+/g, ' ').trim();
  return {
    geom: { w: Math.round(r.width), h: Math.round(r.height) },
    n: t.length,
    chip: t.indexOf('CRITERIO DE ECOSMART') > -1,
    tapse16: t.indexOf('< 16 mm') > -1,
    tapse17: t.indexOf('17mm') > -1 || t.indexOf('17 mm') > -1,
    psap35: t.indexOf('35 mmHg') > -1,
    psapMayor: t.indexOf('> 35') > -1 || t.indexOf('>35') > -1,
    vdvi10: t.indexOf('1,0') > -1,
    ad18: t.indexOf('18 cm') > -1,
    ad19: t.indexOf('19 cm') > -1,
    independiente: t.indexOf('independiente') > -1,
    pesi: t.indexOf('PESI') > -1,
    tabla8: t.indexOf('Tabla 8') > -1,
    e17: t.indexOf('497.e17') > -1,
    e15: t.indexOf('497.e15') > -1,
    e14: t.indexOf('497.e14') > -1,
    folio145: t.indexOf('folio 145') > -1,
    folio28: t.indexOf('folio 28') > -1,
    folio41: t.indexOf('folio 41') > -1,
    esp94: t.indexOf('94%') > -1 || t.indexOf('94 %') > -1,
    corte032: t.indexOf('0,32') > -1 || t.indexOf('0.32') > -1,
    texto: t.slice(0, 900)
  } })()`;

/* ══ MAQUETA Y CAPTURA ════════════════════════════════════════════════════════════════════
   Mide lo RENDERIZADO a cuatro anchos por los dos temas: sin scroll horizontal, la tarjeta de
   TEP entera y el COLOR REAL computado de lo nuevo. El tema se EXIGE: si la clase no queda
   puesta, la celda aborta en vez de medir dos veces el mismo tema. */
const TEMA = `(() => {
  const claro = CLARO;
  const r = document.documentElement;
  if (claro) r.classList.add('light-mode'); else r.classList.remove('light-mode');
  return { claro: r.classList.contains('light-mode') === claro } })()`;

/* ⚠️ LA SECCION DE TEP NACE PLEGADA Y `limpiarCampos` LA VUELVE A CERRAR. Medir sin abrirla da
   0x0 en todo, «cero scroll horizontal» y una captura VACIA: la medicion numerica sale impecable
   sobre una tarjeta que no esta dibujada. Se abre por el gesto del medico (`toggleCard`) y se
   ABORTA si despues de abrirla sigue sin geometria. */
const ABRIR = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  try { showTab('hemodinamica') } catch(e){}
  const s = document.getElementById('tep-seccion');
  if (!s) return { ok:false, por:'SIN SECCION' };
  if (getComputedStyle(s).display === 'none') { try { toggleCard('tep-seccion') } catch(e){} }
  const r = s.getBoundingClientRect();
  return { ok: r.width > 0 && r.height > 0, w: Math.round(r.width), h: Math.round(r.height) } })()`;

const MAQ = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  const g = id => { const e = document.getElementById(id); if (!e) return null;
    const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } };
  const col = id => { const e = document.getElementById(id);
    return e ? getComputedStyle(e).color : 'NO EXISTE' };
  return {
    scrollH: document.documentElement.scrollWidth,
    clientH: document.documentElement.clientWidth,
    desborde: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    sec: g('tep-seccion'),
    tpsp: g('tep-tapse-psap'),
    acop: g('tep-acoplamiento'),
    colTpsp: col('tep-tapse-psap'),
    colScore: col('tep-score'),
    filas: document.querySelectorAll('#tep-seccion .calc-row').length,
    hayEstrat: !!document.getElementById('tep-estratificacion')
  } })()`;

async function corre(nombre, abrir) {
  const b = await abrir();
  const R = {};
  try {
    const pg = await b.newPage({ viewport: { width: 1200, height: 700 } });
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 240000 });
    await pg.evaluate(PRELUDIO);
    await pg.evaluate(AYUD);
    R.consola = [];
    pg.on('console', m => { if (m.type() === 'error') R.consola.push(m.text().slice(0, 160)) });

    if (hay('score')) {
      R.score = {};
      for (const c of ESCENAS) R.score[c.k] = await pg.evaluate(ESCENA.replace('CASO', JSON.stringify(c)));
    }
    if (hay('refs')) {
      R.refs = await pg.evaluate(REFS);
      try { fs.mkdirSync(DEST, { recursive: true }) } catch (e) {}
      for (const claro of [false, true]) {
        const t = await pg.evaluate(TEMA.replace('CLARO', JSON.stringify(claro)));
        if (!t.claro) { R['refTema_' + claro] = 'TEMA NO QUEDO'; continue }
        await pg.waitForTimeout(120);
        const el = await pg.$('#ref-tep');
        if (el) { try { await el.screenshot({ path: DEST + '/reftep_' + nombre + '_' + (claro ? 'claro' : 'osc') + '.png' }) } catch (e) {} }
      }
      await pg.evaluate(TEMA.replace('CLARO', 'false'));
    }
    if (hay('maqueta')) {
      R.maq = {};
      try { fs.mkdirSync(DEST, { recursive: true }) } catch (e) {}
      await pg.evaluate(ESCENA.replace('CASO', JSON.stringify(ESCENAS.find(x => x.k === 'cuatro'))));
      for (const vp of [[1200,700],[1440,800],[768,1024],[390,844],[360,740]]) {
        for (const claro of [false, true]) {
          await pg.setViewportSize({ width: vp[0], height: vp[1] });
          const t = await pg.evaluate(TEMA.replace('CLARO', JSON.stringify(claro)));
          if (!t.claro) { R.maq[vp[0] + 'x' + (claro ? 'claro' : 'osc')] = 'TEMA NO QUEDO'; continue }
          await pg.waitForTimeout(120);
          const k = vp[0] + '_' + (claro ? 'claro' : 'osc');
          const ab = await pg.evaluate(ABRIR);
          if (!ab.ok) { R.maq[k] = { ABORTO: 'SIN GEOMETRIA tep-seccion', det: ab }; continue }
          R.maq[k] = await pg.evaluate(MAQ);
          const el = await pg.$('#tep-seccion');
          if (el) { try { await el.screenshot({ path: DEST + '/tep_' + nombre + '_' + k + '.png' }) } catch (e) {} }
        }
      }
      await pg.setViewportSize({ width: 1200, height: 700 });
    }
    if (hay('controles')) {
      R.ctrl = {};
      for (const c of CTRL_ESC) R.ctrl[c.k] = await pg.evaluate(CONTROLES.replace('CASO', JSON.stringify(c)));
    }
    await pg.close();
  } catch (e) { R.error = e.message.slice(0, 220) }
  try { await b.close() } catch (e) {}
  OUT[nombre] = R;
  console.log('-- parcial ' + nombre + ' --');
  console.log(JSON.stringify(R, null, 1).slice(0, 9000));
}

/* ══ LAS ESCENAS ══════════════════════════════════════════════════════════════════════════
   La PSAP se DERIVA: `psap_calc` es readonly y vale 4*VRT^2 + PmAD. Con la VCI en <=21 mm y
   colapso >50 % la PmAD es 3, asi que la VRT elige la PSAP:
     VRT 2.78 -> 4*7.7284 + 3 = 33.9  -> 34
     VRT 2.83 -> 4*8.0089 + 3 = 35.0  -> 35
     VRT 2.87 -> 4*8.2369 + 3 = 35.9  -> 36  */
const BASE = { vci_diam:'18', vci_col:'>50' };
const mk = (k, extra) => ({ k:k, campos: Object.assign({}, BASE, extra) });
const ESCENAS = [
  /* (a) TAPSE por sus tres valores, con McConnell positivo para que el score tenga denominador */
  mk('tapse_159', { tapse:'15.9', tep_mcconnell:'si', tep_signo6060:'no', tep_tabique_d:'no' }),
  mk('tapse_16',  { tapse:'16',   tep_mcconnell:'si', tep_signo6060:'no', tep_tabique_d:'no' }),
  mk('tapse_169', { tapse:'16.9', tep_mcconnell:'si', tep_signo6060:'no', tep_tabique_d:'no' }),
  mk('tapse_17',  { tapse:'17',   tep_mcconnell:'si', tep_signo6060:'no', tep_tabique_d:'no' }),
  /* (b) PSAP por sus tres valores, derivada de la VRT */
  mk('psap_34', { vmax_it:'2.78', tep_mcconnell:'si', tep_signo6060:'no', tep_tabique_d:'no' }),
  mk('psap_35', { vmax_it:'2.83', tep_mcconnell:'si', tep_signo6060:'no', tep_tabique_d:'no' }),
  mk('psap_36', { vmax_it:'2.87', tep_mcconnell:'si', tep_signo6060:'no', tep_tabique_d:'no' }),
  /* (c) VD/VI por sus dos lados */
  mk('vdvi_099', { tep_vdvi:'0.99', tep_mcconnell:'si', tep_signo6060:'no', tep_tabique_d:'no' }),
  mk('vdvi_100', { tep_vdvi:'1.0',  tep_mcconnell:'si', tep_signo6060:'no', tep_tabique_d:'no' }),
  /* (d) el cociente: dos criterios positivos y el cociente a cada lado del viejo 0,32 */
  mk('coc_0311', { tapse:'14', vmax_it:'3.6', tep_mcconnell:'si', tep_signo6060:'no', tep_tabique_d:'no' }),
  mk('coc_0320', { tapse:'15', vmax_it:'3.55', tep_mcconnell:'si', tep_signo6060:'no', tep_tabique_d:'no' }),
  mk('coc_0344', { tapse:'20', vmax_it:'3.55', tep_mcconnell:'si', tep_signo6060:'no', tep_tabique_d:'no' }),
  /* (e) cuatro criterios positivos -> el renglon rojo por score, no por cociente */
  mk('cuatro', { tapse:'12', vmax_it:'3.8', tep_vdvi:'1.3', tep_mcconnell:'si', tep_signo6060:'si', tep_tabique_d:'no' }),
  /* (f) sin ningun criterio */
  mk('cero', { tapse:'22', tep_mcconnell:'no', tep_signo6060:'no', tep_tabique_d:'no' }),
  /* (g) el VD/VI propio AUSENTE y el de la pestaña VD cargado -> pantalla vs informe.
     McConnell va en «si» para que la compuerta `hayDatos` del informe deje salir la linea: sin
     ella el informe calla y la comparacion no mide nada. */
  mk('vdvi_ajeno', { vd_vi:'1.2', tapse:'22', tep_mcconnell:'si', tep_signo6060:'no', tep_tabique_d:'no' }),
  /* (h) idem con el de la pestaña VD por debajo del corte: control negativo */
  mk('vdvi_ajeno_bajo', { vd_vi:'0.7', tapse:'22', tep_mcconnell:'si', tep_signo6060:'no', tep_tabique_d:'no' }),
  /* (i) con el VD/VI PROPIO cargado: control negativo del fallback -> los dos cuentan igual */
  mk('vdvi_propio', { tep_vdvi:'1.2', vd_vi:'0.7', tapse:'22', tep_mcconnell:'si', tep_signo6060:'no', tep_tabique_d:'no' })
];
const CTRL_ESC = [
  { k:'vacio', campos:{} },
  { k:'vd', campos:{ tapse:'16.5', s_prime:'9', vd_bas:'45', ad_area:'20', vci_diam:'23', vci_col:'<50',
                     vmax_it:'3.2', ddfvi:'48' } }
];

for (const m of MOTORES) {
  if (m === 'chrome') await corre('chrome', () => chromium.launch({ channel: 'chrome' }));
  if (m === 'webkit') await corre('webkit', () => webkit.launch());
}
console.log('===== TOTAL =====');
console.log(JSON.stringify(OUT, null, 1));
