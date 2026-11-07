#!/usr/bin/env node
/** _probe_pant21orden.mjs - PANT-21 commit 2: el ORDEN de la seccion de protesis.
 *  Mide, con el gesto real y el panel de Evidencia ABIERTO por su boton:
 *   (A) el orden de los bloques de la seccion mitral protesica;
 *   (B) la zona de preguntas de la mitral, firma a firma, para que se vea que no cambio;
 *   (C) CONTROL NEGATIVO: el DOM de TODAS las demas secciones, firma por firma;
 *   (D) el panel a los cuatro anchos (ancho, alto del cuerpo y alto del contenido).
 *  Nombre propio: verificado con ls, no existia. */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null; for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log('SIN PLAYWRIGHT'); process.exit(2) }
const { chromium } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');

const CUERPO = `(async () => {
  const R = {};
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', {bubbles:true})); e.dispatchEvent(new Event('change', {bubbles:true})); return 'ok' };
  const norm = t => String(t || '').replace(/\\s+/g, ' ').trim();

  /* El panel se abre por su BOTON real. Sin eso, nada de adentro tiene caja. */
  const abrirPanel = async () => {
    const b = document.getElementById('indic-btn');
    if (!b) return 'NO EXISTE indic-btn';
    b.click(); await esperar(260);
    const ov = document.getElementById('indic-overlay');
    return ov ? getComputedStyle(ov).display : 'NO EXISTE overlay';
  };
  const cerrarPanel = async () => {
    const ov = document.getElementById('indic-overlay');
    if (ov) ov.style.display = 'none';
    await esperar(40);
  };

  /* Una seccion del panel, por el PREFIJO de su titulo, igual que IND_SECS se recorre. */
  const secDe = tit => {
    const ds = Array.from(document.querySelectorAll('#indic-cuerpo details'));
    for (const d of ds) {
      const s = d.querySelector('summary');
      if (s && norm(s.textContent).indexOf(tit) === 0) return d;
    }
    return null;
  };
  /* El ORDEN de los bloques de una seccion: la secuencia de marcadores, tal como estan en el DOM. */
  const ordenDe = d => {
    if (!d) return null;
    const cuerpo = d.querySelector(':scope > div');
    if (!cuerpo) return 'SIN CUERPO';
    const out = [];
    Array.from(cuerpo.children).forEach(n => {
      if (n.getAttribute && n.getAttribute('data-ind-grid') != null) { out.push('grid'); return }
      if (n.getAttribute && n.getAttribute('data-ind-bloque') != null) { out.push('verDetalle'); return }
      const t = norm(n.textContent);
      if (t.indexOf('CON LO CONTESTADO') > -1 || t.indexOf('Con lo contestado') > -1) { out.push('contestado'); return }
      if (t.indexOf('CAUSAS POSIBLES DEL GRADIENTE ALTO') > -1 || t.indexOf('Causas posibles del gradiente alto') > -1) { out.push('causas'); return }
      if (n.querySelector && n.querySelector('[data-ind-colbtn]')) { out.push('encabezado'); return }
      if (t.indexOf('Bibliograf') > -1) { out.push('biblio'); return }
      out.push('otro:' + t.slice(0, 26));
    });
    return out;
  };
  /* La firma de la ZONA DE PREGUNTAS: rotulo, opciones y marca de cada control. */
  const pregDe = d => {
    if (!d) return null;
    return Array.from(d.querySelectorAll('tr')).map(tr => {
      const bs = Array.from(tr.querySelectorAll('button[data-ind-op], button'));
      const lbl = norm((tr.children[0] || {}).textContent);
      if (!lbl) return null;
      return lbl + ' :: ' + bs.map(b => norm(b.textContent) + (b.getAttribute('aria-pressed') === 'true' ? '*' : '')).join('|');
    }).filter(Boolean);
  };
  const firmaSec = d => d ? norm(d.textContent) : null;
  const todasLasFirmas = () => {
    const o = {};
    Array.from(document.querySelectorAll('#indic-cuerpo details')).forEach(d => {
      const s = d.querySelector('summary');
      if (s) o[norm(s.textContent)] = norm(d.textContent).length + '|' + d.querySelectorAll('*').length;
    });
    return o;
  };

  const base = async () => {
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
    try { if (typeof showTab === 'function') showTab('valvulas') } catch (e) {}
    S('nombre', 'P21'); S('ci', '21');
    S('vm_morf', 'Prótesis mecánica');
    S('em_gmedio', '8'); S('em_vmax', '2.0'); S('thp', '95');
    await esperar(340);
  };

  /* ── A y B: la mitral protesica, con el panel abierto ───────────────────── */
  await base();
  R.A_panel = await abrirPanel();
  const dM = secDe('Prótesis mitral');
  R.A_existe = !!dM;
  if (dM && !dM.open) { dM.open = true; await esperar(60); }
  R.A_orden = ordenDe(dM);
  R.A_grid = (function () {
    const g = dM ? dM.querySelector('[data-ind-grid]') : null;
    if (!g) return null;
    return { preg: g.getAttribute('data-ind-preg'), dos: g.getAttribute('data-ind-dos'),
             cols: Array.from(g.children).map(n => n.getAttribute('data-ind-col') || '?') };
  })();
  R.B_preguntas = pregDe(dM);
  R.B_firma = firmaSec(dM) ? firmaSec(dM).length : null;
  R.C_todas = todasLasFirmas();
  R.A_contador = (function () {
    const g = dM ? dM.querySelector('[data-ind-cuenta]') : null; return g ? norm(g.textContent) : 'SIN CONTADOR';
  })();

  /* ── D: el panel a este ancho ────────────────────────────────────────────── */
  R.D_panel = (function () {
    const c = document.getElementById('indic-card'), b = document.getElementById('indic-cuerpo');
    if (!c || !b) return null;
    const rc = c.getBoundingClientRect();
    return { anchoPanel: Math.round(rc.width), altoCuerpo: Math.round(b.getBoundingClientRect().height),
             altoContenido: b.scrollHeight,
             scrollH: Math.round(document.body.scrollWidth - document.documentElement.clientWidth) };
  })();
  R.D_mitralAlto = (function () { if (!dM) return null; const r = dM.getBoundingClientRect(); return Math.round(r.height) })();

  await cerrarPanel();
  return R;
})()`;

const ANCHOS = [1440, 1000, 768, 390];
const nav = await chromium.launch({ channel: 'chrome', headless: true });
const out = {};
for (const w of ANCHOS) {
  const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(1400);
  let r;
  try { r = await pg.evaluate(CUERPO); } catch (e) { r = { ERR: String(e.message).slice(0, 300) }; }
  r._errores = errs;
  out[w] = r;
  await ctx.close();
}
await nav.close();
console.log(JSON.stringify(out, null, 1));
