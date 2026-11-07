#!/usr/bin/env node
/** _probe_pant21wk.mjs - PANT-21: Chrome y WebKit, a 1440, 1000, 768 y 390 px y en los dos
 *  temas (dia y noche). Mide las CUATRO secciones de protesis con el panel ABIERTO por su boton.
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
  const norm = t => String(t || '').replace(/\\s+/g, ' ').trim();
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO ' + id;
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); return 'ok' };
  /* las transiciones se apagan ANTES de medir: una caja a mitad de animacion da un rect que no
     es el de nadie, que es la trampa que esta casa documenta tres veces */
  (function () { const st = document.createElement('style');
    st.textContent = '*{transition:none !important;animation:none !important}'; document.head.appendChild(st) })();

  const abrirPanel = async () => { const b = document.getElementById('indic-btn'); if (!b) return 'NO BTN';
    b.click(); await esperar(320);
    const ov = document.getElementById('indic-overlay'); return ov ? getComputedStyle(ov).display : 'NO OV' };
  const cerrarPanel = async () => { const ov = document.getElementById('indic-overlay'); if (ov) ov.style.display='none'; await esperar(40) };
  const secDe = tit => { for (const d of Array.from(document.querySelectorAll('#indic-cuerpo details'))) {
      const s = d.querySelector('summary'); if (s && norm(s.textContent).indexOf(tit) === 0) return d } return null };
  const ordenDe = d => { if (!d) return null; const cu = d.querySelector(':scope > div'); if (!cu) return 'SIN CUERPO';
    return Array.from(cu.children).map(n => {
      if (n.getAttribute && n.getAttribute('data-ind-grid') != null) return 'grid';
      if (n.getAttribute && n.getAttribute('data-ind-bloque') != null) return 'verDetalle';
      const t = norm(n.textContent).toUpperCase();
      if (t.indexOf('CON LO CONTESTADO') > -1) return 'contestado';
      if (t.indexOf('CAUSAS POSIBLES DEL GRADIENTE ALTO') > -1) return 'causas';
      if (n.querySelector && n.querySelector('[data-ind-colbtn]')) return 'encabezado';
      if (t.indexOf('BIBLIOGRAF') > -1) return 'biblio';
      return 'otro' }) };
  const limpiar = () => { try { limpiarCampos(true) } catch (e) {} try { _indClinLimpiar() } catch (e) {} };

  /* LAS CUATRO VALVULAS PROTESICAS A LA VEZ, con la aortica en «posible» para que su bloque de
     causas exista: sin eso, un cero no distingue «no esta» de «la escena no lo abre». */
  limpiar();
  try { if (typeof showTab === 'function') showTab('valvulas') } catch (e) {}
  ['valv-aortica','valv-mitral','valv-tricuspide','valv-pulmonar'].forEach(k => {
    const d = document.getElementById('ete-seccion-' + k);
    for (let i=0;i<3 && d && getComputedStyle(d).display==='none';i++){ try{ toggleEteSeccion(k) }catch(e){} } });
  S('nombre','P21'); S('ci','21'); S('peso','75'); S('talla','175');
  S('va_morf','Prótesis mecánica'); S('vmax_ao','3.5'); S('gmedio_ao','26');
  S('diam_tsvi','26'); S('itv_tsvi','28'); S('itv_ao','85');
  S('vm_morf','Prótesis biológica'); S('em_gmedio','7'); S('em_vmax','2.1'); S('thp','150');
  S('vt_morf','Prótesis biológica'); S('et_gmedio','10');
  S('vp_morf','Prótesis biológica'); S('vp_tipo_prot','bio'); S('ep_gmedio','22');
  await esperar(420);

  R.panelAbre = await abrirPanel();
  const TITS = ['Prótesis aórtica','Prótesis mitral','Prótesis tricúspide','Prótesis pulmonar'];
  R.secs = {};
  TITS.forEach(t => { const d = secDe(t); if (d && !d.open) d.open = true; });
  await esperar(140);
  TITS.forEach(t => { const d = secDe(t);
    R.secs[t] = { existe: !!d, orden: ordenDe(d),
      preg: d ? Array.from(new Set(Array.from(d.querySelectorAll('[data-ind-clin]')).map(b => b.getAttribute('data-ind-clin')))).length : 0,
      botones44: (function () { if (!d) return null;
        const bs = Array.from(d.querySelectorAll('[data-ind-clin]'));
        const chicos = bs.filter(b => { const r = b.getBoundingClientRect(); return r.height > 0 && r.height < 30 });
        return bs.length + '/' + chicos.length })(),
      alto: d ? Math.round(d.getBoundingClientRect().height) : null,
      texto: d ? norm(d.textContent).length : null } });

  /* los folios de cada seccion, con el «Ver detalle» y la bibliografia ABIERTOS */
  TITS.forEach(t => { const d = secDe(t); if (d) Array.from(d.querySelectorAll('details')).forEach(x => { x.open = true }) });
  R.folios = {};
  R.prohibidas = {};
  const PROH = ['pendiente de revisi','de ejemplo','no coinciden','difieren','discrepan','no se encontr','ninguna fuente'];
  TITS.forEach(t => { const d = secDe(t); const tx = d ? norm(d.textContent) : '';
    R.folios[t] = Array.from(new Set((tx.match(/folio\\s+e?\\d+/g) || []))).sort();
    R.prohibidas[t] = PROH.filter(f => tx.toLowerCase().indexOf(f) > -1) });

  R.panel = (function () { const c = document.getElementById('indic-card'), b = document.getElementById('indic-cuerpo');
    if (!c || !b) return null; return { ancho: Math.round(c.getBoundingClientRect().width),
      altoCuerpo: Math.round(b.getBoundingClientRect().height), altoContenido: b.scrollHeight } })();
  R.scrollH = Math.round(document.body.scrollWidth - document.documentElement.clientWidth);
  /* texto recortado DENTRO del panel: ancho de contenido mayor que la caja, sin scroll propio */
  R.recortados = (function () { const c = document.getElementById('indic-cuerpo'); if (!c) return -1;
    return Array.from(c.querySelectorAll('*')).filter(e => {
      if (e.children.length) return false;
      const st = getComputedStyle(e);
      if (st.overflowX === 'auto' || st.overflowX === 'scroll') return false;
      return e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0 }).length })();
  /* el total de secciones del panel, para que se vea que las demas siguen ahi */
  R.nSecs = Array.from(document.querySelectorAll('#indic-cuerpo > details')).length;
  await cerrarPanel();
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
    await pg.waitForTimeout(1500);
    let r;
    try { r = await pg.evaluate(CUERPO); } catch (e) { r = { ERR: String(e.message).slice(0, 300) }; }
    r._errPagina = errs; r._errConsola = cons;
    out[nom][w + '/' + t] = r;
    await ctx.close();
  }
  await nav.close();
}
console.log(JSON.stringify(out, null, 1));
