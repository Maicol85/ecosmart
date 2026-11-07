#!/usr/bin/env node
/** _probe_pant22wk.mjs - PANT-22: Chrome y WebKit, a 1440, 1000, 768 y 390 px y en los dos temas
 *  (dia y noche). Mide (a) que SIN sector incluido no exista NINGUNA de las trece secciones de
 *  sector avanzado y que se vea el mensaje que la app ya tenia; (b) que CON el sector incluido su
 *  seccion aparezca y siga siendo la unica; (c) que las formas que la regla del 04/11 prohibe esten
 *  en CERO en Hemodinamica, en la protesis mitral y en Referencias; y (d) cero desplazamiento
 *  horizontal, cero texto recortado y cero errores de consola y de pagina.
 *  ⚠️ WebKit de Playwright NO es Safari, y se declara. Chrome va por el del sistema con
 *  channel 'chrome'. Nombre propio: verificado con ls, no existia. */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null; for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log('SIN PLAYWRIGHT'); process.exit(2) }
const { chromium, webkit } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');

const CUERPO = `(async () => {
  const R = {};
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display='none' });
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  /* NI UNA EXPRESION REGULAR: el cuerpo es un template literal y la barra no sobrevive.
     /\\\\s+/ llega como /s+/ y se come las «s» del texto medido. */
  const norm = t => { const s0 = String(t || ''); let o = '', sp = false;
    for (let i = 0; i < s0.length; i++) { const c = s0.charCodeAt(i);
      if (c === 32 || c === 9 || c === 10 || c === 13 || c === 160) { if (!sp) { o += ' '; sp = true } }
      else { o += s0.charAt(i); sp = false } }
    return o.trim() };
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO ' + id;
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); return 'ok' };
  /* las transiciones se apagan ANTES de medir */
  (function () { const st = document.createElement('style');
    st.textContent = '*{transition:none !important;animation:none !important}'; document.head.appendChild(st) })();

  const abrirPanel = async () => { const b = document.getElementById('indic-btn'); if (!b) return 'NO BTN';
    b.click(); await esperar(340);
    const ov = document.getElementById('indic-overlay'); return ov ? getComputedStyle(ov).display : 'NO OV' };
  const cerrarPanel = async () => { const ov = document.getElementById('indic-overlay'); if (ov) ov.style.display='none'; await esperar(40) };
  const titulos = () => Array.from(document.querySelectorAll('#indic-cuerpo > details > summary')).map(s => norm(s.textContent));
  const secDe = tit => { for (const d of Array.from(document.querySelectorAll('#indic-cuerpo details'))) {
      const s = d.querySelector('summary'); if (s && norm(s.textContent).indexOf(tit) === 0) return d } return null };
  const limpiar = () => { try { limpiarCampos(true) } catch (e) {} try { _indClinLimpiar() } catch (e) {} };
  const inc = ks => { let f = 0; (Array.isArray(ks)?ks:[ks]).forEach(k => {
      try { if (!amiloIntegrado(k)) amiloIntegrar(k); if (!amiloIntegrado(k)) f++ } catch (e) { f++ } }); return f === 0 };
  const AV = ['Tromboembolia pulmonar','Hipertension pulmonar','Insuficiencia cardiaca con FE preservada',
    'Ecocardiograma transesofagico','Reparabilidad de la valvula mitral','Ateroma aortico',
    'Derrame pericardico y taponamiento','Constriccion pericardica','Congestion venosa sistemica',
    'Perfil hemodinamico','Cardiotoxicidad','Amiloidosis cardiaca','Posoperatorio de cirugia cardiaca'];
  const SIN = t => { const s0 = String(t || '').normalize('NFD'); let o = '';
    for (let i = 0; i < s0.length; i++) { const c = s0.charCodeAt(i); if (c < 768 || c > 879) o += s0.charAt(i) }
    return o };
  const esAv = tit => { const t = SIN(tit); for (const a of AV) if (t.indexOf(a) > -1) return true; return false };
  const PROH = ['no coinciden','no coincide con','difieren','discrepan','se contradicen','sin resolver',
    'ninguna guia','ninguna fuente','no publica un','no se encontr','tercera voz','de un lado distinto',
    'del otro lado coincide','coincide con la europea','a diferencia de la primaria','donde no coinciden'];
  const prohDe = d => { if (!d) return null; const tx = SIN(norm(d.textContent)).toLowerCase();
    return PROH.filter(f => tx.indexOf(SIN(f)) > -1) };

  /* ===== ESCENA A: el caso del medico, SIN integrar nada ===== */
  limpiar();
  S('nombre','P22'); S('ci','22');
  S('tapse','14'); S('onda_e','95'); S('e_sep','5'); S('e_lat','7');
  await esperar(420);
  R.aPanel = await abrirPanel();
  R.aTits = titulos().length;
  R.aAvanzadas = titulos().filter(esAv).length;          /* TIENE QUE SER 0 */
  R.aMensaje = (function () { const c = document.getElementById('indic-cuerpo');
    const t = c ? SIN(norm(c.textContent)).toLowerCase() : '';
    return t.indexOf('sin criterios de intervencion') > -1 })();
  R.aScrollH = Math.round(document.body.scrollWidth - document.documentElement.clientWidth);
  await cerrarPanel();

  /* ===== ESCENA B: con la constriccion incluida, SU seccion aparece ===== */
  R.bInc = inc('cvr');
  await esperar(260);
  R.bPanel = await abrirPanel();
  R.bAvanzadas = titulos().filter(esAv).length;           /* TIENE QUE SER 1 */
  R.bConstr = !!secDe('Constricción pericárdica');
  await cerrarPanel();

  /* ===== ESCENA C: los textos, con los globos de cada fila ABIERTOS ===== */
  limpiar();
  S('nombre','P22'); S('ci','22'); S('peso','75'); S('talla','175');
  S('hemo_fc','80'); S('itv_tsvi','22'); S('diam_tsvi','20'); S('onda_e','95'); S('e_sep','5'); S('e_lat','7');
  S('vm_morf','Prótesis biológica'); S('em_gmedio','7'); S('em_vmax','2.1'); S('thp','150');
  const d1 = document.getElementById('ete-seccion-valv-mitral');
  for (let i=0;i<3 && d1 && getComputedStyle(d1).display==='none';i++){ try{ toggleEteSeccion('valv-mitral') }catch(e){} }
  R.cInc = inc(['hemo','cvr']);
  await esperar(460);
  R.cPanel = await abrirPanel();
  ['Perfil hemodinámico','Prótesis mitral','Constricción pericárdica'].forEach(t => {
    const d = secDe(t); if (d) { d.open = true;
      Array.from(d.querySelectorAll('details')).forEach(x => { x.open = true });
      Array.from(d.querySelectorAll('[data-ind-term]')).forEach(b => { try { b.click() } catch (e) {} }) } });
  await esperar(240);
  R.cTextos = {};
  ['Perfil hemodinámico','Prótesis mitral','Constricción pericárdica'].forEach(t => {
    const d = secDe(t);
    R.cTextos[t] = { existe: !!d, chars: d ? norm(d.textContent).length : 0, proh: prohDe(d) } });
  R.cPanelAncho = (function () { const c = document.getElementById('indic-card');
    return c ? Math.round(c.getBoundingClientRect().width) : null })();
  R.cScrollH = Math.round(document.body.scrollWidth - document.documentElement.clientWidth);
  R.cRecortados = (function () { const c = document.getElementById('indic-cuerpo'); if (!c) return -1;
    return Array.from(c.querySelectorAll('*')).filter(e => {
      if (e.children.length) return false;
      const st = getComputedStyle(e);
      if (st.overflowX === 'auto' || st.overflowX === 'scroll') return false;
      return e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0 }).length })();
  await cerrarPanel();

  /* ===== ESCENA D: Referencias ===== */
  try { if (typeof showTab === 'function') showTab('refs') } catch (e) {}
  await esperar(360);
  try { Array.from(document.querySelectorAll('#tab-refs [data-refsub]')).forEach(b => { try { b.click() } catch (e) {} }) } catch (e) {}
  await esperar(420);
  R.dRefs = (function () { const c = document.getElementById('tab-refs'); if (!c) return null;
    const tx = SIN(norm(c.textContent)).toLowerCase();
    return { chars: tx.length, proh: PROH.filter(f => tx.indexOf(SIN(f)) > -1) } })();
  R.dScrollH = Math.round(document.body.scrollWidth - document.documentElement.clientWidth);
  return R;
})()`;

const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['dia', 'noche'];
const out = {};
for (const [nom, motor] of [['chrome', chromium], ['webkit', webkit]]) {
  let nav;
  try { nav = await motor.launch(nom === 'chrome' ? { channel: 'chrome', headless: true } : { headless: true }); }
  catch (e) { out[nom] = { ERR: String(e.message).slice(0, 180) }; continue; }
  out[nom] = {};
  for (const w of ANCHOS) for (const t of TEMAS) {
    const ctx = await nav.newContext({ viewport: { width: w, height: 900 },
      colorScheme: t === 'noche' ? 'dark' : 'light' });
    const pg = await ctx.newPage();
    const errs = [], cons = [];
    pg.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
    pg.on('console', m => { if (m.type() === 'error') cons.push(String(m.text()).slice(0, 140)) });
    await pg.goto('file://' + FILE);
    await pg.waitForTimeout(1600);
    let r;
    try { r = await pg.evaluate(CUERPO); } catch (e) { r = { ERR: String(e.message).slice(0, 300) }; }
    r._errPagina = errs; r._errConsola = cons;
    out[nom][w + '/' + t] = r;
    await ctx.close();
    process.stderr.write('  ' + nom + ' ' + w + '/' + t + ' ok\n');
  }
  await nav.close();
}
console.log(JSON.stringify(out, null, 1));
