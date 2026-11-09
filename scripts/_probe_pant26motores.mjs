#!/usr/bin/env node
/**
 * _probe_pant26motores.mjs - tanda PANT-26. SOLO LECTURA.
 * Nombre propio: verificado con ls, no existia.
 * Mide las superficies que esta tanda toca en los DIECISEIS cruces: dos motores -Chrome del
 * sistema y WebKit de Playwright- por 1440, 1000, 768 y 390 px, por tema dia y noche:
 *   · la capsula de la protesis AORTICA con TAVI, su veredicto y su plegable con las DOS
 *     declaraciones nuevas y sin la atribucion que salio;
 *   · las CINCO filas de la capsula MITRAL, con su valor y su escala y sin conclusion;
 *   · la tarjeta ⓘ de la protesis PULMONAR, con su declaracion y su cita;
 *   · el globo ea-prot-ppm abierto por su boton, con la declaracion del desajuste;
 *   · el globo cc-3d, con sus TRES parrafos y sin el texto viejo;
 *   · desplazamiento horizontal, textos recortados, alto de los botones ⓘ y errores.
 * DENOMINADOR: cada cruce declara si cada pieza se encontro; una pieza ausente se DICE.
 * ⚠️ WebKit de Playwright NO es Safari, y se declara.
 * No escribe nada en el proyecto.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium, webkit } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p26motores.json';
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['dia', 'noche'];
const D = {
  DECL_CORTES: 'Los cortes de gradiente y de DVI para la TAVI son los de la prótesis quirúrgica: es un criterio de la aplicación.',
  DECL_AREA: 'La comparación del área efectiva con la referencia del modelo es un criterio de la aplicación.',
  DECL_PULM: 'Con velocidad o gradiente alterados, la aplicación informa posible obstrucción: es un criterio de la aplicación.',
  DECL_PPM: 'El desajuste se define con el área efectiva dentro de 1 desvío estándar de la del modelo implantado. Con el modelo cargado, la aplicación lo comprueba.',
  CITA_PULM: 'ASE 2024 (Zoghbi), Tabla 15, folio 33',
  VIEJA_TAVI: 'hoja 18, folio 19',
  CC3D: ['Diagrama ilustrativo del corazón en 3D. Se puede girar, y al tocar una estructura se vuelve transparente para ver lo que hay detrás.',
         'Según el estudio: representa las lesiones cargadas en este estudio y puede incluirse en el PDF.',
         'Explorar: permite interactuar con el diagrama y entender otras alteraciones, incluidas las complejas o sus combinaciones. No refleja necesariamente lo que dice el estudio, por eso no va al PDF.'],
  CC3D_VIEJO: ['todavía', 'no entra al informe ni al PDF', 'QUÉ NO DIBUJA'],
  CONC: ['sin criterios de obstrucción', 'posible obstrucción', 'sugiere obstrucción significativa']
};

const CUERPO = async (pg, datos) => pg.evaluate(async (D) => {
  const esperar = (ms) => new Promise(r => setTimeout(r, ms));
  const norm = (t) => String(t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return 1 };
  const T = (id) => { const e = document.getElementById(id); return e ? norm(e.textContent) : null };
  const abrirValv = () => {
    try { const b = Array.from(document.querySelectorAll('.tab-btn')).find(x => /Válvulas/.test(x.textContent || ''));
      if (b) b.click(); else showTab('valvulas') } catch (e) {}
    ['aortica','mitral','tricuspide','pulmonar'].forEach(k => {
      const el = document.getElementById('ete-seccion-valv-' + k);
      try { if (el && getComputedStyle(el).display === 'none') toggleEteSeccion('valv-' + k) } catch (e) {}
    });
  };
  const O = {};
  /* ── (1) LA CAPSULA AORTICA CON TAVI ── */
  try { limpiarCampos(true) } catch (e) {}
  S('peso','70'); S('talla','170');
  S('va_morf','TAVI'); S('vmax_ao','2.0'); S('gmedio_ao','12');
  S('diam_tsvi','20'); S('itv_tsvi','27'); S('itv_ao','60');
  try { valvProtSync() } catch (e) {}
  abrirValv(); await esperar(560);
  O.ao = (function(){
    const caja = document.getElementById('caja-esten-aortica');
    const nota = T('ea-det-sev-nota') || '';
    return { cajaVisible: !!(caja && getComputedStyle(caja).display !== 'none'),
      capsula: T('ea-det-sev'), largoNota: nota.length,
      declCortes: nota.indexOf(D.DECL_CORTES) > -1,
      sinAtribucion: nota.indexOf(D.VIEJA_TAVI) === -1,
      ppmFila: T('ea-prot-ppm') };
  })();
  /* ── (2) LA CAPSULA MITRAL ── */
  try { limpiarCampos(true) } catch (e) {}
  S('peso','70'); S('talla','170');
  S('vm_morf','Prótesis biológica'); S('em_vmax','2.6'); S('em_gmedio','14'); S('thp','240');
  S('em_dtsvi','21'); S('em_vtitsvi','20'); S('em_vtimit','40');
  try { valvProtSync() } catch (e) {}
  abrirValv(); await esperar(560);
  O.vm = (function(){
    const ids = ['vm-prot-vmax','vm-prot-gmed','vm-prot-thp','vm-prot-eoa','vm-prot-dvi'];
    const filas = {}; ids.forEach(i => { filas[i] = T(i) });
    const conConc = ids.filter(i => D.CONC.some(c => String(filas[i] || '').indexOf(c) > -1));
    return { filas: filas, conConclusion: conConc,
      escalaVmax: String(filas['vm-prot-vmax'] || '').indexOf('<1.9 normal · ≥2.5 significativa') > -1,
      resumen: T('vm-prot-obstr'),
      resumenConcluye: D.CONC.some(c => String(T('vm-prot-obstr') || '').indexOf(c) > -1) };
  })();
  /* ── (3) LA TARJETA DE LA PULMONAR ── */
  try { limpiarCampos(true) } catch (e) {}
  S('vp_morf','Prótesis biológica'); S('vp_tipo_prot','bio'); S('vp_vmax','3.5'); S('ep_gmedio','25');
  try { valvProtSync() } catch (e) {}
  abrirValv(); await esperar(460);
  O.vp = (function(){
    try { const n = qvTarjeta('prot','pulmonar'); const t = norm(n ? n.textContent : '');
      return { largo: t.length, decl: t.indexOf(D.DECL_PULM) > -1, cita: t.indexOf(D.CITA_PULM) > -1,
               vacia: t.indexOf('Sin parámetros cargados') > -1 };
    } catch (e) { return { err: String(e.message).slice(0, 80) } }
  })();
  /* ── (4) EL GLOBO DEL DESAJUSTE, por su boton real ── */
  O.ppm = (function(){
    const b = document.querySelector('[data-vinfo="ea-prot-ppm"]');
    if (!b) return { err: 'sin boton' };
    const r = b.getBoundingClientRect();
    try { b.scrollIntoView({ block: 'center' }) } catch (e) {}
    b.click();
    const card = document.getElementById('vinfo-card');
    if (!card) return { err: 'sin #vinfo-card' };
    const vis = getComputedStyle(card).display !== 'none';
    const t = norm(card.textContent);
    const cr = card.getBoundingClientRect();
    const o = { caja: Math.round(r.width) + 'x' + Math.round(r.height), abierto: vis, largo: t.length,
                decl: t.indexOf(D.DECL_PPM) > -1,
                dentro: cr.left >= -1 && cr.right <= window.innerWidth + 1 };
    try { vInfoCerrar(true) } catch (e) {}
    return o;
  })();
  /* ── (5) EL GLOBO DEL 3D ── */
  try { limpiarCampos(true) } catch (e) {}
  try { const b = Array.from(document.querySelectorAll('.tab-btn')).find(x => /Cong[eé]nit/i.test(x.textContent || ''));
    if (b) b.click(); else showTab('congenitas') } catch (e) {}
  await esperar(520);
  S('ete_cia_tipo','secundum');
  await esperar(420);
  O.cc3d = (function(){
    const bA = document.getElementById('cc3d-abrir');
    if (bA) { try { bA.scrollIntoView({ block: 'center' }) } catch (e) {} bA.click() }
    return { botonVerEn3D: !!bA };
  })();
  await esperar(900);
  O.cc3d.panelVisible = (function(){ const p = document.getElementById('cc3d-panel');
    return !!(p && getComputedStyle(p).display !== 'none') })();
  O.cc3d.segmentado = Array.from(document.querySelectorAll('.cm3d-md'))
    .map(b => norm(b.textContent)).join(' | ');
  O.cc3d.globo = (function(){
    const b = document.querySelector('[data-vinfo="cc-3d"]');
    if (!b) return { err: 'sin boton' };
    const r = b.getBoundingClientRect();
    try { b.scrollIntoView({ block: 'center' }) } catch (e) {}
    b.click();
    const card = document.getElementById('vinfo-card');
    if (!card) return { err: 'sin #vinfo-card' };
    const t = norm(card.textContent);
    const cr = card.getBoundingClientRect();
    const o = { caja: Math.round(r.width) + 'x' + Math.round(r.height),
      abierto: getComputedStyle(card).display !== 'none', largo: t.length,
      parrafos: D.CC3D.filter(f => t.indexOf(f) > -1).length,
      viejos: D.CC3D_VIEJO.filter(x => t.indexOf(x) > -1),
      dentro: cr.left >= -1 && cr.right <= window.innerWidth + 1 };
    try { vInfoCerrar(true) } catch (e) {}
    return o;
  })();
  S('mch_espesor','20'); await esperar(420);
  try { cc3dTextoSync() } catch (e) {}
  await esperar(320);
  O.cc3d.linea = T('cc3d-faltan');
  O.cc3d.lineaNueva = String(O.cc3d.linea || '').indexOf('Cargadas y no representadas en este diagrama:') > -1;
  O.cc3d.lineaTodavia = /todav[ií]a/.test(String(O.cc3d.linea || ''));
  /* ── (6) DISENIO ── */
  O.scrollH = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  O.recortados = (function(){ let n = 0;
    Array.from(document.querySelectorAll('div,span,td,label,button,summary')).forEach(el => {
      if (el.children.length) return;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      if (cs.overflow === 'visible' && cs.overflowX === 'visible') return;
      if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) n++; });
    return n })();
  O.btnChicos = (function(){ let n = 0;
    Array.from(document.querySelectorAll('.vinfo-btn')).forEach(b => {
      const r = b.getBoundingClientRect();
      if (r.height > 0 && r.height < 30) n++ });
    return n })();
  return O;
}, datos);

const R = { cruces: {}, nota: 'WebKit de Playwright NO es Safari, y se declara.' };
for (const motor of ['chrome', 'webkit']) {
  const br = (motor === 'chrome')
    ? await chromium.launch({ channel: 'chrome', headless: true })
    : await webkit.launch({ headless: true });
  for (const w of ANCHOS) for (const tema of TEMAS) {
    const clave = motor + '-' + w + '-' + tema;
    const pg = await br.newPage({ viewport: { width: w, height: 900 },
                                  colorScheme: (tema === 'noche') ? 'dark' : 'light' });
    const errs = [];
    pg.on('pageerror', e => errs.push('page: ' + String(e).slice(0, 120)));
    pg.on('console', m => { if (m.type() === 'error') errs.push('con: ' + m.text().slice(0, 120)) });
    try {
      await pg.goto('file://' + FILE);
      await pg.waitForTimeout(1200);
      await pg.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
      const o = await CUERPO(pg, D);
      o.errores = errs;
      R.cruces[clave] = o;
    } catch (e) { R.cruces[clave] = { err: String(e.message).slice(0, 160), errores: errs } }
    await pg.close();
  }
  await br.close();
}
fs.writeFileSync(OUTF, JSON.stringify(R, null, 1));
console.log('escrito ' + OUTF);
process.exit(0);
