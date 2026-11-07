#!/usr/bin/env node
/** _probe_pant22sec.mjs - PANT-22: un sector avanzado solo genera Evidencia si esta incluido.
 *  Mide, con el gesto real y el panel abierto por su boton:
 *    (A) el caso del medico: las secciones de sector avanzado NO aparecen sin inclusion;
 *    (B) incluir el sector la hace aparecer y retirarlo la hace desaparecer;
 *    (C) el DOM de cada seccion, para comparar contra HEAD afuera;
 *    (D) las secciones NO avanzadas, con su propio control negativo;
 *    (E) el dato sigue sincronizado en el sector (gesto real y siembra muda);
 *    (F) control positivo y negativo del ayudante;
 *    (G) el panel a este ancho: scroll, recortes y el mensaje de panel vacio.
 *  Nombre propio: verificado con ls, no existia. */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null; for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log('SIN PLAYWRIGHT'); process.exit(2) }
const { chromium } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const ANCHO = parseInt(arg('--ancho') || '1440', 10);
const MOTOR = arg('--motor') || 'chrome';

const CUERPO = `(async () => {
  const R = {};
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display='none' });
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const norm = t => String(t || '').replace(/\\s+/g, ' ').trim();
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); return 'ok' };
  /* siembra MUDA: escribe el valor y NO despacha ningun evento */
  const SM = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE'; e.value = v; return 'ok' };
  const abrirPanel = async () => { const b = document.getElementById('indic-btn'); if (!b) return 'NO BTN';
    const ov = document.getElementById('indic-overlay');
    if (!ov || getComputedStyle(ov).display === 'none') { b.click(); await esperar(340); }
    else { try { indicRender() } catch(e){} await esperar(220); }
    const o2 = document.getElementById('indic-overlay'); return o2 ? getComputedStyle(o2).display : 'NO OV'; };
  const cerrarPanel = async () => { const ov = document.getElementById('indic-overlay'); if (ov) ov.style.display='none'; await esperar(40) };
  const nodosSec = () => Array.from(document.querySelectorAll('#indic-cuerpo > details'));
  const titulos = () => nodosSec().map(x => { const s = x.querySelector('summary'); return s ? norm(s.textContent) : '?' });
  /* el DOM de una seccion, por su titulo: todos sus details abiertos y el html normalizado */
  const domDe = (tit) => { const d = nodosSec().filter(x => { const s = x.querySelector('summary');
      return s && norm(s.textContent).indexOf(tit) === 0 })[0];
    if (!d) return null;
    d.open = true;
    Array.from(d.querySelectorAll('details')).forEach(x => { x.open = true });
    return { html: norm(d.innerHTML).length, htmlHash: norm(d.innerHTML),
             texto: norm(d.textContent).length,
             preg: Array.from(new Set(Array.from(d.querySelectorAll('[data-ind-clin]'))
               .map(b => b.getAttribute('data-ind-clin')))).length,
             citas: (norm(d.textContent).match(/\\[[0-9]+\\]/g) || []).length,
             folios: Array.from(new Set((norm(d.textContent).match(/folio\\s+e?[0-9]+/g) || []))).length,
             biblio: !!Array.from(d.querySelectorAll('summary')).filter(s => norm(s.textContent).indexOf('Bibliograf') === 0).length }; };

  const SECS_AV = ['Constricci\\u00f3n peric\\u00e1rdica', 'Perfil hemodin\\u00e1mico', 'Amiloidosis card\\u00edaca',
                   'Insuficiencia cardíaca con fracci'];
  const base = async (campos, mudos) => {
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
    try { if (typeof _indClinLimpiar === 'function') _indClinLimpiar() } catch (e) {}
    S('nombre','P22'); S('ci','22');
    Object.keys(campos || {}).forEach(k => S(k, campos[k]));
    Object.keys(mudos || {}).forEach(k => SM(k, mudos[k]));
    await esperar(430);
  };
  const integrar = (k) => { try { if (typeof amiloIntegrar === 'function') { amiloIntegrar(k); return 'ok' } return 'NO FN' }
    catch (e) { return 'ERR ' + e.message.slice(0,50) } };
  const retirar = (k) => { try { if (typeof amiloRetirar === 'function') { amiloRetirar(k); return 'ok' } return 'NO FN' }
    catch (e) { return 'ERR ' + e.message.slice(0,50) } };

  /* el caso del medico: TAPSE bajo y E/e-prima elevado, NADA mas */
  const MED = { tapse:'14', onda_e:'95', e_sep:'5', e_lat:'7' };
  /* una escena de valvulas y una de congenitas: controles negativos */
  const VALV = { vmax_ao:'4.5', gmedio_ao:'45', peso:'75', talla:'175', ea_grado:'3' };
  const CONG = { ete_cia_tipo:'secundum', ete_cia_tam_max:'20', ete_cia_dir:'id' };

  /* ── (A) y (B) ── */
  R.escenas = {};
  const correr = async (nom, campos, pasos, mudos) => {
    await base(campos, mudos);
    const hechos = [];
    (pasos || []).forEach(p => { hechos.push(p[0] + ':' + p[1] + '=' + (p[0] === 'in' ? integrar(p[1]) : retirar(p[1]))) });
    await esperar(300);
    const integ = (typeof amiloSecs === 'function')
      ? amiloSecs().filter(s => amiloIntegrado(s.k)).map(s => s.k) : null;
    await abrirPanel();
    const t = titulos();
    const doms = {}; SECS_AV.forEach(x => { doms[x] = domDe(x) });
    /* el DOM de TODAS las secciones, para el control de las no avanzadas */
    const todas = {}; nodosSec().forEach(d => { const s = d.querySelector('summary');
      if (!s) return; const k = norm(s.textContent).slice(0, 60);
      d.open = true; Array.from(d.querySelectorAll('details')).forEach(x => { x.open = true });
      todas[k] = norm(d.innerHTML); });
    const vacio = (function(){ const c = document.getElementById('indic-cuerpo');
      return c ? (norm(c.textContent).indexOf('Sin criterios de intervenci') > -1) : null })();
    const panel = (function(){ const c = document.getElementById('indic-card'), b = document.getElementById('indic-cuerpo');
      if (!c || !b) return null;
      const rec = Array.from(b.querySelectorAll('*')).filter(e => {
        if (!e.children.length && norm(e.textContent).length > 2) {
          return e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1 } return false }).length;
      return { ancho: Math.round(c.getBoundingClientRect().width), recortados: rec,
               scrollH: Math.round(document.body.scrollWidth - document.documentElement.clientWidth) } })();
    /* el dato del sector: veredictos y campos espejo */
    const dato = { cvr:null, hemoIc:null, ettSepto:null, ettPp:null, hfpeff:null };
    try { dato.cvr = (typeof cvrEstado === 'function') ? JSON.stringify(cvrEstado()).length : 'NO FN' } catch(e){ dato.cvr='ERR' }
    try { const e1 = document.getElementById('hemo-ic'); dato.hemoIc = e1 ? norm(e1.textContent) : 'NO ID' } catch(e){}
    try { const e2 = document.getElementById('ett-septo'); dato.ettSepto = e2 ? e2.value : 'NO ID' } catch(e){}
    try { const e3 = document.getElementById('ett-pp'); dato.ettPp = e3 ? e3.value : 'NO ID' } catch(e){}
    try { dato.hfpeff = (typeof hfapeffScore === 'function') ? (hfapeffScore(false)||{}).total : 'NO FN' } catch(e){ dato.hfpeff='ERR' }
    await cerrarPanel();
    R.escenas[nom] = { hechos, integrados: integ, nSecs: t.length, titulos: t,
      avances: SECS_AV.filter(x => t.some(y => y.indexOf(x) === 0)),
      doms, todas, panelVacio: vacio, panel, dato };
  };

  await correr('med', MED, []);
  await correr('medCvr', MED, [['in','cvr']]);
  await correr('medHemo', MED, [['in','hemo']]);
  await correr('medEtt', MED, [['in','ett']]);
  await correr('medAlg', MED, [['in','alg']]);
  await correr('medTres', MED, [['in','cvr'],['in','hemo'],['in','ett']]);
  await correr('medCvrFuera', MED, [['in','cvr'],['out','cvr']]);
  await correr('medMudo', {}, [], MED);
  await correr('valv', VALV, []);
  await correr('cong', CONG, []);
  await correr('vacio', {}, []);

  /* ── (F) el ayudante: control positivo y negativo ── */
  await base(MED, null);
  R.F = { existe: typeof _indSectorIncluido === 'function' };
  if (R.F.existe) {
    R.F.sinNada = { cvr: _indSectorIncluido('cvr'), hemo: _indSectorIncluido('hemo'),
                    amil: _indSectorIncluido(['ett','alg']), nulo: _indSectorIncluido(null) };
    integrar('cvr'); await esperar(200);
    R.F.conCvr = { cvr: _indSectorIncluido('cvr'), hemo: _indSectorIncluido('hemo'),
                   amil: _indSectorIncluido(['ett','alg']) };
    integrar('alg'); await esperar(200);
    R.F.conAlg = { amil: _indSectorIncluido(['ett','alg']), soloEtt: _indSectorIncluido('ett') };
    retirar('cvr'); await esperar(200);
    R.F.trasRetirar = { cvr: _indSectorIncluido('cvr') };
  }

  /* ── (2c) el panel es modal: para integrar hay que cerrarlo ── */
  await base(MED, null);
  await abrirPanel();
  R.modal = (function(){ const ov = document.getElementById('indic-overlay');
    if (!ov) return null; const cs = getComputedStyle(ov);
    const btn = document.querySelector('.btn-integrar[data-am-k="cvr"]');
    let tapado = null;
    if (btn) { const r = btn.getBoundingClientRect();
      const x = Math.round(r.left + r.width/2), y = Math.round(r.top + r.height/2);
      const el = (x>=0 && y>=0 && x<innerWidth && y<innerHeight) ? document.elementFromPoint(x,y) : null;
      tapado = el ? (el === btn ? 'el propio boton' : (el.id || el.className || el.tagName)) : 'fuera del viewport'; }
    return { display: cs.display, position: cs.position, zIndex: cs.zIndex,
             ariaModal: ov.getAttribute('aria-modal'), role: ov.getAttribute('role'),
             botonIntegrarCvr: tapado }; })();
  await cerrarPanel();
  return R;
})()`;

const motores = { chrome: () => chromium.launch({ channel: 'chrome', headless: true }),
                  webkit: () => _pw.webkit.launch({ headless: true }) };
const nav = await (motores[MOTOR] || motores.chrome)();
const ctx = await nav.newContext({ viewport: { width: ANCHO, height: 900 } });
const pg = await ctx.newPage();
const errs = [], cons = [];
pg.on('pageerror', e => errs.push(String(e.message).slice(0, 180)));
pg.on('console', m => { if (m.type() === 'error') cons.push(String(m.text()).slice(0, 180)) });
await pg.goto('file://' + FILE);
await pg.waitForTimeout(1500);
let r;
try { r = await pg.evaluate(CUERPO); } catch (e) { r = { ERR: String(e.message).slice(0, 600) }; }
r._errores = errs; r._consola = cons; r._ancho = ANCHO; r._file = FILE; r._motor = MOTOR;
await ctx.close();
await nav.close();
console.log(JSON.stringify(r));
