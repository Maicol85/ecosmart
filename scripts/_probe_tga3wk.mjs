#!/usr/bin/env node
/**
 * _probe_tga3wk.mjs - los DOS MOTORES para la tanda TGA-3 (2026-11-01).
 *
 * Chrome del sistema y WebKit de Playwright x 1440, 1000, 768 y 390 px x dos temas, con su
 * CONTROL contra HEAD. Cubre la conclusion en la columna izquierda (commit 1) y el esquema de
 * circulacion (commits 3 a 5): que no se pisen entre si ni con el 3D, la tipografia del SVG, el
 * boton del globo, el desplazamiento horizontal y el texto recortado.
 *
 * ADVERTENCIA 1: WebKit de Playwright NO es Safari, y se declara.
 * ADVERTENCIA 2: el binario de chromium de Playwright no esta en esta maquina, asi que Chrome va
 *   por el del sistema con channel chrome; sin eso la sonda devuelve los cruces vacios.
 * ADVERTENCIA 3: la seccion vive en la sub-pestana «CC complejas» y hay que abrir las DOS
 *   pestanas por su boton real; el acordeon ya viene abierto y un click a ciegas lo cierra.
 * ADVERTENCIA 4: sin acentos graves ni barras invertidas dentro de los templates.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null; for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log('SIN PLAYWRIGHT'); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const MOTOR = arg('--motor') || 'dos';
const OUTF = arg('--out') || '/tmp/tga3_wk.json';
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['dark', 'light'];

const MEDIR = `(async () => {
  const R = { errs: [] };
  const EL = i => document.getElementById(i);
  const S = (i, v) => { const e = EL(i); if (!e) return 'NO ' + i; e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top) } };
  const inter = (a, b) => { if (!a || !b) return 'NO';
    const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    return (w > 1 && h > 1) ? Math.round(w) + 'x' + Math.round(h) : 0 };
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  S('nombre', 'Prueba TGA3'); S('ci', '601'); S('peso', '70'); S('talla', '170'); S('sexo', 'M');
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const Q = String.fromCharCode(39);
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click();
        const b2 = bq('ccSubTab(' + Q + 'congenitas2'); if (b2) b2.click() } catch (e) {}
  await esperar(400);
  const acc = EL('sacc-cc-tga');
  if (acc && !acc.classList.contains('open')) { const h = document.querySelector('#sacc-cc-tga .sacc-hdr'); if (h) h.click() }
  await esperar(450);
  try { document.querySelectorAll('.sacc-body').forEach(b => { b.style.transition = 'none' }) } catch (e) {}
  /* DENOMINADOR: con el tipo y una cirugia cargados hay escenario, conclusion y comunicaciones. */
  S('tga_tipo', 'dtga'); S('tga_cirugia', 'rastelli'); S('tga_func_vd', 'normal');
  S('tga_sintomas', 'no'); S('ete_cia_tam_max', '12'); S('dap_diam', '3');
  await esperar(1700);

  const campos = caja(EL('tga-campos')), box = caja(EL('tga-3d-box'));
  const cvh = caja(EL('tga-3d-cv')), esq = caja(EL('tga-esq-box'));
  const concl = caja(EL('tga-concl-box'));
  R.campos = campos; R.box = box; R.lienzo = cvh; R.esq = esq; R.concl = concl;
  R.ladoALado = (campos && box) ? ((Math.abs(campos.y - box.y) < 40 && box.x > campos.x + 40) ? 'si' : 'apilado') : 'NO';
  R.esqAlLado = (cvh && esq) ? ((esq.x > cvh.x + 40 && Math.abs(esq.y - cvh.y) < 60) ? 'si' : 'apilado') : 'NO';
  /* Las tres cosas que NO se pueden pisar, medidas en los DOS ejes. */
  R.pisaEsq3D = inter(esq, cvh);
  R.pisaEsqConcl = inter(esq, concl);
  R.pisaConcl3D = inter(concl, box);
  /* El SVG entra en su caja y no desborda. */
  const sv = EL('tga-esq-svg') ? EL('tga-esq-svg').querySelector('svg') : null;
  R.svg = caja(sv);
  R.svgDesborda = (R.svg && esq) ? ((R.svg.w > esq.w + 2 || R.svg.x < esq.x - 2) ? 'SI' : 0) : 'NO';
  /* La tipografia REAL del SVG: el tamano en el viewBox por la escala del render. */
  if (sv && R.svg) {
    const vb = (sv.getAttribute('viewBox') || '0 0 300 290').split(' ').map(Number);
    const k = R.svg.w / (vb[2] || 300);
    let mn = 999, mx = 0;
    Array.prototype.forEach.call(sv.querySelectorAll('text'), function (tx) {
      const f = parseFloat(tx.getAttribute('font-size') || '0') * k;
      if (f > 0) { if (f < mn) mn = f; if (f > mx) mx = f }
    });
    R.fuenteMin = Math.round(mn * 10) / 10; R.fuenteMax = Math.round(mx * 10) / 10;
    R.escala = Math.round(k * 100) / 100;
  }
  /* El globo del esquema: 44x44 y que ningun punto caiga en OTRO control. */
  const g = document.querySelector('[data-vinfo="tga-esq"]');
  if (g) { try { g.scrollIntoView({ block: 'center' }) } catch (e) {} await esperar(140);
    const r = g.getBoundingClientRect();
    R.globo = Math.round(r.width) + 'x' + Math.round(r.height);
    const pts = [[r.left + 3, r.top + 3], [r.right - 3, r.top + 3], [r.left + 3, r.bottom - 3],
                 [r.right - 3, r.bottom - 3], [r.left + r.width / 2, r.top + r.height / 2]];
    let propios = 0, ajenos = 0;
    pts.forEach(function (p) { const e = document.elementFromPoint(p[0], p[1]);
      if (!e) return;
      if (e === g || g.contains(e)) propios++;
      else if (e.closest && (e.closest('button') || e.closest('input') || e.closest('select'))) ajenos++;
    });
    R.globoPropios = propios + '/5'; R.globoEnOtroControl = ajenos;
  } else { R.globo = 'NO HAY' }
  R.leyenda = (function () { const b = EL('tga-esq-box');
    return b && String(b.textContent || '').indexOf('Esquema ilustrativo') >= 0 ? 'si' : 'NO' })();
  R.esqTxt = String((EL('tga-esq-txt') || {}).textContent || '').slice(0, 110);
  R.conclTxt = String((EL('tga-concl') || {}).textContent || '').length;
  R.scrollX = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const rec = [];
  const sec = EL('sacc-cc-tga');
  if (sec) sec.querySelectorAll('label, .calc-lbl, .calc-val, button, p, span').forEach(e => {
    if (!e.offsetParent) return;
    /* ADVERTENCIA: la alternativa accesible es visually-hidden a proposito -1 px de ancho con
       overflow hidden-, asi que su scrollWidth SIEMPRE supera su clientWidth. Contarla es un
       falso positivo de esta sonda, no un texto cortado. */
    if (e.id === 'tga-esq-alt') return;
    if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) rec.push((e.id || e.className || e.tagName).toString().slice(0, 30));
  });
  R.recortados = rec.slice(0, 6); R.nRecort = rec.length;
  return R;
})()`;

const OUT = { archivo: FILE };
async function corre(motor) {
  const nav = await (motor === 'webkit' ? _pw.webkit.launch({ headless: true })
                                        : _pw.chromium.launch({ channel: 'chrome', headless: true }));
  for (const w of ANCHOS) for (const tema of TEMAS) {
    const ctx = await nav.newContext({ viewport: { width: w, height: 900 }, colorScheme: tema });
    const pg = await ctx.newPage();
    const errs = []; pg.on('pageerror', e => errs.push(e.message.slice(0, 130)));
    pg.on('console', m => { if (m.type() === 'error') errs.push('consola: ' + m.text().slice(0, 130)) });
    let R;
    try { await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 90000 });
          await pg.waitForTimeout(1400); R = await pg.evaluate(MEDIR) }
    catch (e) { R = { FATAL: String(e).slice(0, 200) } }
    R.errsPagina = errs;
    OUT[motor + '_' + w + '_' + tema] = R;
    console.log(motor, String(w).padEnd(5), tema.padEnd(6),
      '| esqAlLado=' + R.esqAlLado, '| pisa3D=' + R.pisaEsq3D, '| pisaConcl=' + R.pisaEsqConcl,
      '| svg=' + (R.svg ? R.svg.w + 'x' + R.svg.h : 'NO'), '| fuente=' + R.fuenteMin + '-' + R.fuenteMax,
      '| globo=' + R.globo + ' ' + R.globoPropios, '| leyenda=' + R.leyenda,
      '| scrollX=' + R.scrollX, '| recort=' + R.nRecort, '| errs=' + errs.length);
    await ctx.close();
  }
  await nav.close();
}
if (MOTOR === 'dos') { await corre('chrome'); await corre('webkit') } else { await corre(MOTOR) }
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF);
