#!/usr/bin/env node
/** _probe_pant22txt.mjs - PANT-22 commits 4 y 5: el censo de textos que comparan fuentes.
 *  Mide, sobre el DOM ABIERTO del panel de Evidencia y de Referencias:
 *    (A) cero cadenas con las formas prohibidas en las secciones tocadas, con el denominador
 *        declarado en caracteres por seccion -no cero-;
 *    (B) CONTROL POSITIVO: la cadena vieja, inyectada en el DOM, TIENE que ser detectada;
 *    (C) el inventario de numeros, hojas y folios de cada seccion, para comparar contra HEAD
 *        uno por uno;
 *    (D) el panel a este ancho: scroll y textos recortados.
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
  const R = { secs: {} };
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
  const integrar = (k) => { try { if (typeof amiloIntegrar === 'function') {
      if (!amiloIntegrado(k)) amiloIntegrar(k); return amiloIntegrado(k) } return 'NO FN' } catch (e) { return 'ERR' } };
  const nodosSec = () => Array.from(document.querySelectorAll('#indic-cuerpo > details'));
  const secTxt = (tit) => { const d = nodosSec().filter(x => { const s = x.querySelector('summary');
      return s && norm(s.textContent).indexOf(tit) === 0 })[0];
    if (!d) return null;
    d.open = true;
    /* abrir TODO lo que la seccion pueda tener plegado, y los globos de sus filas */
    for (let i=0;i<3;i++) Array.from(d.querySelectorAll('details')).forEach(x => { x.open = true });
    return norm(d.textContent); };
  /* los ⓘ de las filas viven en el REGISTRO de la seccion, no en el DOM hasta que se abren:
     se abren todos los botones de informacion de la seccion y se junta lo que publican */
  const secConGlobos = async (tit) => {
    const d = nodosSec().filter(x => { const s = x.querySelector('summary');
      return s && norm(s.textContent).indexOf(tit) === 0 })[0];
    if (!d) return null;
    d.open = true;
    for (let i=0;i<3;i++) Array.from(d.querySelectorAll('details')).forEach(x => { x.open = true });
    let t = norm(d.textContent);
    const btns = Array.from(d.querySelectorAll('[data-ind-info], .ind-info, [aria-label*="Qu"], button'))
      .filter(b => norm(b.textContent).indexOf('\\u24d8') > -1);
    for (const b of btns) { try { b.click(); await esperar(60);
      const c = document.getElementById('ind-info-card') || document.getElementById('vinfo-card');
      if (c) t += ' ' + norm(c.textContent); } catch (e) {} }
    return { txt: t, nGlobos: btns.length };
  };

  const FORMAS = ['no coincide','no coinciden','coincide con','coinciden con','difieren','difiere ',
    'discrepan','discrepa ','se contradice','se contradicen','sin resolver','tercera voz',
    'cae de un lado distinto','sale de la columna','no es el mismo corte','a diferencia de',
    'no se encontr','ninguna fuente'];
  const censar = (txt) => { const t = String(txt||'').toLowerCase(); const out = [];
    FORMAS.forEach(f => { let i = 0; while ((i = t.indexOf(f, i)) > -1) {
      out.push({ f: f, ctx: String(txt).slice(Math.max(0,i-90), i+110) }); i += f.length } });
    return out; };
  /* todos los numeros, hojas y folios: el inventario que no se puede perder */
  const inv = (txt) => ({
    numeros: (String(txt).match(/[0-9]+(?:[.,][0-9]+)?/g) || []).sort(),
    folios: (String(txt).match(/folio\\s+e?[0-9]+/g) || []).sort(),
    hojas: (String(txt).match(/hoja\\s+[0-9]+/g) || []).sort(),
    tablas: (String(txt).match(/Tabla\\s+[0-9]+(?:[.\\-][0-9]+)?/g) || []).sort(),
    clases: (String(txt).match(/Clase\\s+[^ ,.;]+/g) || []).sort() });

  const ESC = {
    hemo: { k:['hemo'], tit:'Perfil hemodin\\u00e1mico',
            campos:{ peso:'75', talla:'175', hemo_fc:'70', diam_tsvi:'22', itv_tsvi:'22',
                     onda_e:'95', e_sep:'5', e_lat:'7', hemo_pam:'85' } },
    protm:{ k:[], tit:'Pr\\u00f3tesis mitral', sel:{ vm_morf:'Pr\\u00f3tesis biol\\u00f3gica' },
            campos:{ peso:'75', talla:'175', em_gmedio:'7', em_vmax:'2.1', thp:'150' } },
    prota:{ k:[], tit:'Pr\\u00f3tesis a\\u00f3rtica', sel:{ va_morf:'Pr\\u00f3tesis mec\\u00e1nica' },
            campos:{ peso:'75', talla:'175', vmax_ao:'3.5', gmedio_ao:'26' } },
    vt:   { k:[], tit:'V\\u00e1lvula tricúspide', campos:{ it_grado:'4', peso:'75', talla:'175' } },
    constr:{ k:['cvr'], tit:'Constricci\\u00f3n peric\\u00e1rdica',
             campos:{ tapse:'14', onda_e:'95', e_sep:'5', e_lat:'7' } },
    repar:{ k:['etem'], tit:'Reparabilidad de la v\\u00e1lvula mitral', campos:{ ete_prof_coapt:'12' } },
    tdfip:{ k:[], tit:'Tetralog\\u00eda de Fallot reparada \\u2014 insuficiencia pulmonar',
            campos:{ tdf_ip_rf:'45' } },
    esub: { k:[], tit:'Estenosis sub', campos:{ esub_grad_medio:'45' } },
    cia:  { k:[], tit:'Comunicaci\\u00f3n interauricular',
            campos:{ ete_cia_tipo:'secundum', ete_cia_tam_max:'20', ete_cia_dir:'id' } },
    dsav: { k:[], tit:'Defecto del septo auriculoventricular',
            campos:{ dsav_tipo:'completo', fevi:'60' } }
  };
  for (const nom of Object.keys(ESC)) {
    const e = ESC[nom];
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (ex) {}
    try { if (typeof _indClinLimpiar === 'function') _indClinLimpiar() } catch (ex) {}
    S('nombre','P22'); S('ci','22');
    const fallos = [];
    Object.keys(e.campos || {}).forEach(k => { const r = S(k, e.campos[k]); if (String(r).indexOf('NO EXISTE') === 0) fallos.push(r) });
    Object.keys(e.sel || {}).forEach(k => { const r = S(k, e.sel[k]); if (String(r).indexOf('NO EXISTE') === 0) fallos.push(r) });
    (e.k || []).forEach(k => integrar(k));
    await esperar(430);
    await abrirPanel();
    const g = await secConGlobos(e.tit);
    R.secs[nom] = { tit: e.tit, sembrado: fallos, existe: !!g,
      chars: g ? g.txt.length : 0, nGlobos: g ? g.nGlobos : 0,
      prohibidas: g ? censar(g.txt) : null, inv: g ? inv(g.txt) : null };
    await cerrarPanel();
  }

  /* ── (B) CONTROL POSITIVO: la cadena vieja, inyectada, TIENE que detectarse ── */
  const VIEJAS = ['Esta aplicación marca hipoperfusión con un índice cardíaco de 2,2 o menos, de modo que el 2,2 justo cae de un lado distinto del que resuelve la clasificación original.',
    'los dos libros de referencia no coinciden en un rango único',
    'Las dos definiciones de desajuste protésico-paciente mitral de la misma guía no coinciden.',
    'Para un IMC de 30 o más las dos versiones se contradicen',
    'Y hay una tercera voz: la ESC/EACTS 2025 dice',
    'La ACC/AHA 2020 coincide con la europea en la estenosis'];
  R.ctrlPositivo = VIEJAS.map(v => ({ cadena: v.slice(0, 50), detectada: censar(v).length > 0 }));

  /* ── (D) REFERENCIAS: la ficha del tracto de salida del VD ── */
  try { if (typeof showTab === 'function') showTab('referencias') } catch (e) {}
  await esperar(300);
  const refs = document.getElementById('tab-referencias');
  if (refs) { for (let i=0;i<3;i++) Array.from(refs.querySelectorAll('details')).forEach(x => { x.open = true }); await esperar(200); }
  const txtRef = refs ? norm(refs.textContent) : '';
  R.referencias = { chars: txtRef.length, prohibidas: censar(txtRef), inv: inv(txtRef) };

  /* ── (D) el panel a este ancho ── */
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  S('nombre','P22'); S('ci','22'); S('peso','75'); S('talla','175');
  S('hemo_fc','70'); S('diam_tsvi','22'); S('itv_tsvi','22');
  integrar('hemo'); await esperar(430);
  await abrirPanel();
  R.panel = (function(){ const c = document.getElementById('indic-card'), b = document.getElementById('indic-cuerpo');
    if (!c || !b) return null;
    const rec = Array.from(b.querySelectorAll('*')).filter(e => {
      if (!e.children.length && norm(e.textContent).length > 2) {
        return e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1 } return false }).length;
    return { ancho: Math.round(c.getBoundingClientRect().width), recortados: rec,
             scrollH: Math.round(document.body.scrollWidth - document.documentElement.clientWidth) } })();
  await cerrarPanel();
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
