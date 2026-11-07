#!/usr/bin/env node
/** _probe_pant22todos.mjs - PANT-22 commit 3: los TRECE sectores avanzados, uno por uno.
 *  Por cada sector: su escena propia, el panel abierto por su boton, y la seccion medida
 *  SIN inclusion (tiene que estar ausente) y CON inclusion (su DOM, para comparar contra HEAD).
 *  Mas el control negativo: las secciones NO avanzadas no se mueven.
 *  Nombre propio: verificado con ls, no existia. */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null; for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log('SIN PLAYWRIGHT'); process.exit(2) }
const { chromium } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const ANCHO = parseInt(arg('--ancho') || '1440', 10);

const CUERPO = `(async () => {
  const R = { sectores: {} };
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display='none' });
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const norm = t => String(t || '').replace(/\\s+/g, ' ').trim();
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); return 'ok' };
  const abrirPanel = async () => { const b = document.getElementById('indic-btn'); if (!b) return 'NO BTN';
    const ov = document.getElementById('indic-overlay');
    if (!ov || getComputedStyle(ov).display === 'none') { b.click(); await esperar(340); }
    else { try { indicRender() } catch(e){} await esperar(220); }
    return 'ok'; };
  const cerrarPanel = async () => { const ov = document.getElementById('indic-overlay'); if (ov) ov.style.display='none'; await esperar(40) };
  const nodosSec = () => Array.from(document.querySelectorAll('#indic-cuerpo > details'));
  const titulos = () => nodosSec().map(x => { const s = x.querySelector('summary'); return s ? norm(s.textContent) : '?' });
  const domDe = (tit) => { const d = nodosSec().filter(x => { const s = x.querySelector('summary');
      return s && norm(s.textContent).indexOf(tit) === 0 })[0];
    if (!d) return null;
    d.open = true; Array.from(d.querySelectorAll('details')).forEach(x => { x.open = true });
    return { len: norm(d.innerHTML).length, hash: norm(d.innerHTML),
      texto: norm(d.textContent).length,
      preg: Array.from(new Set(Array.from(d.querySelectorAll('[data-ind-clin]')).map(b => b.getAttribute('data-ind-clin')))).length,
      citas: (norm(d.textContent).match(/\\[[0-9]+\\]/g) || []).length,
      folios: Array.from(new Set((norm(d.textContent).match(/folio\\s+e?[0-9]+/g) || []))).length }; };
  /* los TRECE sectores: clave(s) de amiloSecs, titulo de su seccion y la escena que la abre */
  const SEC = [
    { k:['tep'],   tit:'Tromboembolia pulmonar',        esc:{ tep_vdvi:'1.1' } },
    { k:['htp'],   tit:'Hipertensi\\u00f3n pulmonar',        esc:{ vmax_it:'3.2', peso:'75', talla:'175' } },
    { k:['hfpeff'],tit:'Insuficiencia card\\u00edaca con fracci', esc:{ onda_e:'95', e_sep:'5', e_lat:'7' } },
    { k:['oai'],   tit:'Ecocardiograma transesof',      esc:{ oai_trombo:'si' } },
    { k:['etem'],  tit:'Reparabilidad de la v\\u00e1lvula mitral', esc:{ ete_prof_coapt:'12' } },
    { k:['aoete'], tit:'Ateroma a\\u00f3rtico',               esc:{ ao_grado_atero:'3' } },
    { k:['dpt'],   tit:'Derrame peric\\u00e1rdico y taponamiento', esc:{ pericardio:'Derrame moderado (10-20mm)' } },
    { k:['cvr'],   tit:'Constricci\\u00f3n peric\\u00e1rdica',      esc:{ tapse:'14', onda_e:'95', e_sep:'5', e_lat:'7' } },
    { k:['vexus'], tit:'Congesti\\u00f3n venosa sist\\u00e9mica',   esc:{ vexus_sh:'1', vexus_pv:'1', vexus_ir:'1', vci_diam:'24' } },
    { k:['hemo'],  tit:'Perfil hemodin\\u00e1mico',          esc:{ peso:'75', talla:'175', hemo_fc:'70', diam_tsvi:'22', itv_tsvi:'22' } },
    { k:['conco'], tit:'Cardiotoxicidad por tratamiento', esc:{ co_farmaco:'antracicline', co_fevi_basal:'62', co_fevi_actual:'58' } },
    { k:['ett','alg'], tit:'Amiloidosis card\\u00edaca',     esc:{ 'ett-septo':'14', 'ett-pp':'14', 'ett-rwt':'1' } },
    { k:['pop'],   tit:'Posoperatorio de cirug',          esc:{ pop_cx_tipo:'cabg' } }
  ];
  const base = async (campos) => {
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
    try { if (typeof _indClinLimpiar === 'function') _indClinLimpiar() } catch (e) {}
    S('nombre','P22'); S('ci','22');
    const fallos = [];
    Object.keys(campos).forEach(k => { const r = S(k, campos[k]); if (r !== 'ok' && String(r).indexOf('NO EXISTE') === 0) fallos.push(r) });
    await esperar(430); return fallos;
  };
  /* idempotente: amiloIntegrar es un TOGGLE */
  const integrar = (k) => { try { if (typeof amiloIntegrar === 'function') {
      if (!amiloIntegrado(k)) amiloIntegrar(k); return amiloIntegrado(k) } return 'NO FN' }
    catch (e) { return 'ERR ' + e.message.slice(0,40) } };

  for (const s of SEC) {
    const nom = s.k.join('+');
    const sembrado = await base(s.esc);
    /* SIN inclusion */
    await abrirPanel();
    const sinInc = { existe: titulos().some(t => t.indexOf(s.tit) === 0), dom: domDe(s.tit), n: titulos().length };
    await cerrarPanel();
    /* CON inclusion */
    const integ = s.k.map(k => k + '=' + integrar(k));
    await esperar(260);
    await abrirPanel();
    const conInc = { existe: titulos().some(t => t.indexOf(s.tit) === 0), dom: domDe(s.tit), n: titulos().length };
    await cerrarPanel();
    /* y RETIRANDO */
    try { s.k.forEach(k => { if (amiloIntegrado(k)) amiloRetirar(k) }) } catch (e) {}
    await esperar(260);
    await abrirPanel();
    const trasRet = { existe: titulos().some(t => t.indexOf(s.tit) === 0), n: titulos().length };
    await cerrarPanel();
    R.sectores[nom] = { sembrado, integ, sinInc, conInc, trasRet };
  }

  /* CONTROL NEGATIVO: una escena de valvulas y una de congenitas, con TODAS sus secciones */
  const CTRL = { valv:{ vmax_ao:'4.5', gmedio_ao:'45', peso:'75', talla:'175', ea_grado:'3' },
                 cong:{ ete_cia_tipo:'secundum', ete_cia_tam_max:'20', ete_cia_dir:'id' },
                 vacio:{} };
  R.ctrl = {};
  for (const k of Object.keys(CTRL)) {
    await base(CTRL[k]);
    await abrirPanel();
    const todas = {}; nodosSec().forEach(d => { const su = d.querySelector('summary'); if (!su) return;
      d.open = true; Array.from(d.querySelectorAll('details')).forEach(x => { x.open = true });
      todas[norm(su.textContent).slice(0,60)] = norm(d.innerHTML) });
    const vacio = (function(){ const c = document.getElementById('indic-cuerpo');
      return c ? (norm(c.textContent).indexOf('Sin criterios de intervenci') > -1) : null })();
    R.ctrl[k] = { n: Object.keys(todas).length, titulos: Object.keys(todas), todas, panelVacio: vacio };
    await cerrarPanel();
  }
  return R;
})()`;

const nav = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await nav.newContext({ viewport: { width: ANCHO, height: 900 } });
const pg = await ctx.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(String(e.message).slice(0, 180)));
await pg.goto('file://' + FILE);
await pg.waitForTimeout(1500);
let r;
try { r = await pg.evaluate(CUERPO); } catch (e) { r = { ERR: String(e.message).slice(0, 600) }; }
r._errores = errs; r._ancho = ANCHO; r._file = FILE;
await ctx.close();
await nav.close();
console.log(JSON.stringify(r));
