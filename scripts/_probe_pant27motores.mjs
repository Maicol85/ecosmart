#!/usr/bin/env node
/**
 * _probe_pant27motores.mjs - tanda PANT-27. SOLO LECTURA.
 * Nombre propio: verificado con ls, no existia.
 * Mide las TRES superficies que esta tanda toca en los DIECISEIS cruces: dos motores
 * -Chrome del sistema y WebKit de Playwright- por 1440, 1000, 768 y 390 px, por tema dia y
 * noche. Por cruce registra:
 *   · las SIETE frases de la estenosis mitral presentes en el detalle plegado,
 *   · la fila de Fontan con la frase nueva y SIN el rotulo huerfano,
 *   · el globo tavi-calc abierto por su boton, con la caja del boton y el largo de la tarjeta,
 *   · el bloque del reverso de la ficha ref-ia con sus cuatro frases,
 *   · desplazamiento horizontal del cuerpo, textos recortados y errores de consola y de pagina.
 * DENOMINADOR: cada cruce declara si cada pieza se encontro; una pieza ausente se DICE.
 * ⚠️ WebKit de Playwright NO es Safari, y se declara.
 * No escribe nada en el proyecto.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium, webkit } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p27motores.json';

const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['dia', 'noche'];
const SIETE = [
  'La palabra de la guía es «clínicamente grave» (folio 4680)',
  'Esta aplicación usa un área menor o igual a 1,5 cm², como figura en la guía ESC 2025.',
  'La comisurotomía mitral percutánea es posible en ausencia de características desfavorables (folio 4681).',
  'El corte del score es «score ecocardiográfico > 8», tal como la guía lo escribe.',
  'Contraindicaciones de la comisurotomía (Tabla 8, folio 4682): AVm > 1,5 cm²;',
  'Excepciones de la Tabla 8 (folio 4682): con el área mayor que 1,5 cm²',
  'Los cortes de 5 y 10 mmHg del gradiente medio son un criterio de la aplicación.' ];
const FRASE_FON = 'La ESC 2020 indica anticoagulacion con trombo, arritmia auricular o tromboembolia (hoja 65, folio 627)';
const FRASE_TAVI = 'Se plantea calcificación valvular severa por evaluación con tomografía y progresión de la velocidad máxima de 0,3 m/s por año o más.';
const CUATRO_IA = [
  'se gradúa por su duración, y el VTI y la velocidad telediastólica la califican.',
  'La estructura de los tres grados es la de la EACVI 2013 (Lancellotti y col.,',
  'El corte de 15 cm del VTI sale del libro «Ecocardiografía avanzada» (Moya Mur, capítulo 20).',
  'Con 15 cm exactos la aplicación lo considera moderada.' ];

const CUERPO = async (pg, datos) => pg.evaluate(async (D) => {
  const esperar = (ms) => new Promise(r => setTimeout(r, ms));
  const norm = (t) => String(t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  const S = (id, val) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = val;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return (String(e.value) === String(val)) ? 1 : 'quedo en ' + e.value; };
  const O = {};

  /* ── (1) LAS SIETE NOTAS DE LA ESTENOSIS MITRAL ── */
  try { if (typeof limpiarCampos === 'function') limpiarCampos() } catch (e) {}
  S('vm_morf', 'Calcificada'); S('avm_plan', '1.2');
  try { if (typeof calcEM === 'function') calcEM() } catch (e) {}
  await esperar(400);
  try { indicAbrir() } catch (e) { O.emErr = String(e.message).slice(0, 60) }
  await esperar(280);
  O.em = (function () {
    const ov = document.getElementById('indic-overlay');
    if (!ov || ov.style.display !== 'block') return { err: 'el panel no abrio' };
    const dets = Array.from(ov.querySelectorAll('details'));
    const sec = dets.filter(d => { const su = d.querySelector('summary');
                                   return su && norm(su.textContent) === 'Estenosis mitral' })[0];
    if (!sec) return { err: 'sin seccion Estenosis mitral' };
    if (!sec.open) sec.querySelector('summary').click();
    const det = sec.querySelector('details[data-ind-detalle]');
    if (!det) return { err: 'sin detalle plegado' };
    if (!det.open) det.querySelector('summary').click();
    const t = norm(det.textContent);
    return { abierto: !!det.open, largo: t.length,
             frases: D.SIETE.filter(f => t.indexOf(f) > -1).length,
             viejas: ['Queda declarado', 'tampoco se definen igual', 'clinically severe'].filter(x => t.indexOf(x) > -1),
             panelAncho: Math.round((document.getElementById('indic-card') || {}).clientWidth || 0) };
  })();
  try { indicCerrar() } catch (e) {}

  /* ── (2) LA FILA DE FONTAN ── */
  try { if (typeof limpiarCampos === 'function') limpiarCampos() } catch (e) {}
  (function () { const sel = document.getElementById('fontan_tipo');
    if (sel && sel.options.length > 1) S('fontan_tipo', sel.options[1].value) })();
  await esperar(400);
  try { indicAbrir() } catch (e) {}
  await esperar(280);
  O.fon = (function () {
    const ov = document.getElementById('indic-overlay');
    if (!ov || ov.style.display !== 'block') return { err: 'el panel no abrio' };
    const t = norm(ov.textContent);
    const i = t.indexOf('Contraindicacion de sangrado para la anticoagulacion');
    const j = t.indexOf('Taquicardia supraventricular recurrente');
    if (i < 0 || j <= i) return { err: 'sin la fila de sangrado', i: i, j: j };
    const fila = t.slice(i, j);
    return { largo: fila.length, frase: fila.indexOf(D.FRASE_FON) > -1,
             notaHuerfana: fila.indexOf('Nota:') > -1,
             comparaba: fila.indexOf('no cubren lo mismo') > -1 };
  })();
  try { indicCerrar() } catch (e) {}

  /* ── (3) EL GLOBO tavi-calc, por su boton real ── */
  O.globo = (function () {
    try { if (typeof showTab === 'function') showTab('ete') } catch (e) {}
    try { if (typeof toggleEteSeccion === 'function') toggleEteSeccion('ete-seccion-tavi') } catch (e) {}
    const sc = document.getElementById('ete-seccion-tavi');
    if (sc && getComputedStyle(sc).display === 'none') sc.style.display = '';
    const b = document.querySelector('[data-vinfo="tavi-calc"]');
    if (!b) return { err: 'sin boton del globo' };
    const r = b.getBoundingClientRect();
    b.click();
    const card = document.getElementById('vinfo-card');
    if (!card) return { err: 'sin #vinfo-card', caja: Math.round(r.width) + 'x' + Math.round(r.height) };
    const vis = getComputedStyle(card).display !== 'none';
    const t = norm(card.textContent);
    const cr = card.getBoundingClientRect();
    return { caja: Math.round(r.width) + 'x' + Math.round(r.height), abierto: vis, largo: t.length,
             frase: t.indexOf(D.FRASE_TAVI) > -1,
             vieja: t.indexOf('SIN DEFINIRLA') > -1,
             dentro: cr.left >= -1 && cr.right <= window.innerWidth + 1 };
  })();

  /* ── (4) LA FICHA ref-ia ── */
  O.refia = (function () {
    try { if (typeof showTab === 'function') showTab('refs') } catch (e) {}
    try { if (typeof evRefPintar === 'function') evRefPintar('ia') } catch (e) {}
    const e = document.getElementById('ref-ia');
    if (!e) return { err: 'NO EXISTE ref-ia' };
    e.style.display = '';
    const t = norm(e.textContent);
    return { largo: t.length, frases: D.CUATRO_IA.filter(f => t.indexOf(f) > -1).length,
             viejas: ['Tabla 20-5', 'no figura en las guías', 'Tribouilloy'].filter(x => t.indexOf(x) > -1) };
  })();

  /* ── (5) DISENIO: desplazamiento horizontal y textos recortados ── */
  O.scrollH = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  O.recortados = (function () {
    let n = 0;
    Array.from(document.querySelectorAll('div,span,td,label,button,summary')).forEach(el => {
      if (el.children.length) return;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      if (cs.overflow === 'visible' && cs.overflowX === 'visible') return;
      if (el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0) n++;
    });
    return n;
  })();
  return O;
}, datos);

const R = { cruces: {}, nota: 'WebKit de Playwright NO es Safari, y se declara.' };
for (const motor of ['chrome', 'webkit']) {
  const br = (motor === 'chrome')
    ? await chromium.launch({ channel: 'chrome', headless: true })
    : await webkit.launch({ headless: true });
  for (const w of ANCHOS) {
    for (const tema of TEMAS) {
      const clave = motor + '-' + w + '-' + tema;
      const pg = await br.newPage({ viewport: { width: w, height: 900 },
                                    colorScheme: (tema === 'noche') ? 'dark' : 'light' });
      const errs = [];
      pg.on('pageerror', e => errs.push('page: ' + String(e).slice(0, 110)));
      pg.on('console', m => { if (m.type() === 'error') errs.push('con: ' + m.text().slice(0, 110)) });
      try {
        await pg.goto('file://' + FILE);
        await pg.waitForTimeout(1100);
        await pg.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });
        const o = await CUERPO(pg, { SIETE, FRASE_FON, FRASE_TAVI, CUATRO_IA });
        o.errores = errs;
        R.cruces[clave] = o;
      } catch (e) { R.cruces[clave] = { err: String(e.message).slice(0, 140), errores: errs } }
      await pg.close();
    }
  }
  await br.close();
}
fs.writeFileSync(OUTF, JSON.stringify(R, null, 1));
console.log('escrito ' + OUTF);
process.exit(0);
