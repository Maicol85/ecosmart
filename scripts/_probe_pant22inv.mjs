#!/usr/bin/env node
/** _probe_pant22inv.mjs - PANT-22 commit 1: inventario de sectores avanzados y
 *  reproduccion de la premisa del medico, mas el censo de textos que comparan fuentes.
 *  SOLO LECTURA sobre la app: no cambia nada, mide.
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
  const R = {};
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display='none' });
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const norm = t => String(t || '').replace(/\\s+/g, ' ').trim();
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); return 'ok' };
  const abrirPanel = async () => { const b = document.getElementById('indic-btn'); if (!b) return 'NO BTN';
    const ov = document.getElementById('indic-overlay');
    if (!ov || getComputedStyle(ov).display === 'none') { b.click(); await esperar(340); }
    else { try { indicRender() } catch(e){} await esperar(220); }
    const o2 = document.getElementById('indic-overlay'); return o2 ? getComputedStyle(o2).display : 'NO OV'; };
  const cerrarPanel = async () => { const ov = document.getElementById('indic-overlay'); if (ov) ov.style.display='none'; await esperar(40) };
  const secciones = () => Array.from(document.querySelectorAll('#indic-cuerpo details'))
    .map(x => { const s = x.querySelector('summary'); return s ? norm(s.textContent) : '?' })
    .filter(t => t.indexOf('Bibliograf') !== 0 && t.indexOf('Ver detalle') !== 0 && t.indexOf('\\u24d8') !== 0);

  /* ====== (a) INVENTARIO DE SECTORES AVANZADOS ====== */
  R.a_secs = (typeof amiloSecs === 'function') ? amiloSecs().map(s => {
    const w = document.getElementById('am-wrap-' + s.k);
    const ta = document.getElementById('am-txt-' + s.k);
    const btn = document.querySelector('.btn-integrar[data-am-k="' + s.k + '"]');
    return { k: s.k, lbl: s.lbl, grupo: s.grupo || 'ett',
             wrap: !!w, wrapDisplay: w ? (w.style.display || getComputedStyle(w).display) : null,
             textarea: !!ta, boton: !!btn,
             integradoAlAbrir: (typeof amiloIntegrado === 'function') ? amiloIntegrado(s.k) : 'NO FN',
             tieneHayDatos: typeof s.hayDatos === 'function', tieneOmitir: typeof s.omitir === 'function',
             soloHoja: !!s.soloHoja, enCuerpo: !!s.enCuerpo };
  }) : 'NO FN';
  R.a_integradosCampo = (function(){ const e = document.getElementById('am-integrados');
    return e ? { existe:true, tag:e.tagName, type:e.type||null, value:e.value } : { existe:false } })();
  R.a_cardDisplay = (function(){ const c = document.getElementById('amilo-card');
    return c ? (c.style.display || getComputedStyle(c).display) : 'NO CARD' })();
  R.a_titulos = (typeof IND_SECS !== 'undefined') ? IND_SECS.map(s => s.tit) : 'NO IND_SECS';
  R.a_nIndSecs = (typeof IND_SECS !== 'undefined') ? IND_SECS.length : null;
  R.a_tieneAv = (typeof IND_SECS !== 'undefined')
    ? IND_SECS.filter(s => s.av != null).map(s => s.tit) : null;

  /* ====== (b) LA PREMISA DEL MEDICO ====== */
  const base = async (campos) => {
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
    try { if (typeof _indClinLimpiar === 'function') _indClinLimpiar() } catch (e) {}
    S('nombre','P22'); S('ci','22');
    Object.keys(campos).forEach(k => S(k, campos[k]));
    await esperar(420);
  };
  /* El caso del medico: TAPSE bajo y E/e-prima elevado, y NADA mas. */
  const ESC_MED = { tapse:'14', onda_e:'95', e_sep:'5', e_lat:'7' };
  await base(ESC_MED);
  R.b_integradosTrasSembrar = (typeof amiloSecs === 'function')
    ? amiloSecs().filter(s => amiloIntegrado(s.k)).map(s => s.k) : null;
  await abrirPanel();
  R.b_sinIncluir = secciones();
  await cerrarPanel();

  /* Ahora INCLUIR cada sector avanzado, de a uno, y ver que secciones aparecen. */
  R.b_porSector = {};
  const KS = (typeof amiloSecs === 'function') ? amiloSecs().map(s => s.k) : [];
  for (const k of KS) {
    await base(ESC_MED);
    let est = 'no-intento';
    try { if (typeof amiloIntegrar === 'function') { amiloIntegrar(k); est = 'ok'; } } catch (e) { est = 'ERR ' + e.message.slice(0,60) }
    await esperar(300);
    const integ = (typeof amiloIntegrado === 'function') ? amiloIntegrado(k) : null;
    await abrirPanel();
    const secs = secciones();
    await cerrarPanel();
    R.b_porSector[k] = { integrar: est, integrado: integ, secciones: secs,
      nuevas: secs.filter(t => R.b_sinIncluir.indexOf(t) < 0) };
  }

  /* Escena ANCHA: muchos datos del eco basal, sin incluir nada. Es el denominador del censo. */
  const ESC_ANCHA = { tapse:'14', onda_e:'95', e_sep:'5', e_lat:'7', peso:'75', talla:'175',
    sexo:'M', edad:'70', fc:'70', siv:'14', ppvi:'14', ddvi:'45', dsvi:'30', fevi:'55',
    ai_vol:'40', ai_diam:'42', vd_bas:'40', tapse_sp:'9', pap_s:'45', it_vmax:'3.2',
    hemo_pam:'85', diam_tsvi:'22', itv_tsvi:'22', vci_d:'22',
    ett_septo:'14', ett_pp:'14', ett_rwt:'1', ett_ee:'1', ett_tapse:'1',
    e_sep_cvr:'5', e_lat_cvr:'12' };
  await base(ESC_ANCHA);
  await abrirPanel();
  R.b_anchaSinIncluir = secciones();
  await cerrarPanel();

  /* ====== (c) CENSO DE TEXTOS ====== */
  /* Se abre el panel con TODO lo que se pueda abrir y se censa su texto. */
  const FORMAS = {
    noCoincide: ['no coincide','no coinciden','difieren','difiere','discrepan','discrepa',
                 'discrepancia','se contradice','se contradicen','sin resolver'],
    compara:    ['cae de un lado distinto','sale de la columna','no es el mismo corte',
                 'de modo que el','mientras la gu','en cambio la','a diferencia de',
                 'mas estricta','m\\u00e1s estricta','mas laxa','m\\u00e1s laxa'],
    ausencia:   ['no se encontr','ninguna fuente','ninguna gu','no publica','no define',
                 'no da un','no trae'],
  };
  const censar = (txt) => { const t = String(txt||'').toLowerCase(); const out = {};
    Object.keys(FORMAS).forEach(cl => { FORMAS[cl].forEach(f => {
      let i = 0; while ((i = t.indexOf(f, i)) > -1) {
        out[cl] = out[cl] || []; out[cl].push({ f: f, ctx: String(txt).slice(Math.max(0,i-140), i+160) });
        i += f.length; } }) });
    return out; };

  await base(ESC_ANCHA);
  await abrirPanel();
  /* abrir TODOS los details del panel, incluidos los Ver detalle y las bibliografias */
  for (let i=0;i<3;i++){ Array.from(document.querySelectorAll('#indic-cuerpo details')).forEach(d => { d.open = true }); await esperar(120); }
  const cuerpo = document.getElementById('indic-cuerpo');
  const txtPanel = cuerpo ? norm(cuerpo.textContent) : '';
  R.c_panelChars = txtPanel.length;
  R.c_panelSecciones = secciones().length;
  R.c_panel = censar(txtPanel);
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
console.log(JSON.stringify(r, null, 1));
