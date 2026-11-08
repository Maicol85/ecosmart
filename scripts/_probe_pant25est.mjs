#!/usr/bin/env node
/**
 * _probe_pant25est.mjs - la sonda ESTRUCTURAL de la tanda PANT-25 (2026-11-08).
 * Nombre propio: verificado con ls, no existia.
 *
 * Recorre TODAS las pestanias principales de Referencias y TODAS sus entradas CON EL GESTO
 * REAL -tocando el boton de la barra y el encabezado de cada ficha- y vuelca, por entrada:
 * su id, su titulo, su panel y su textContent normalizado. Corriendola contra HEAD y contra
 * el arbol nuevo, el textContent de cada id tiene que salir IDENTICO caracter por caracter y
 * lo unico que puede cambiar es el PANEL.
 *
 * Mide ademas, en la misma pasada: el orden de la barra; el indice del buscador con su rotulo
 * de seccion; el resultado de CADA entrada de VINFO_REF por `refIr`; y el resultado del
 * buscador para una lista de terminos.
 *
 * ⚠️ DENOMINADOR: una pestania cerrada no prueba nada. Cada panel se activa por su boton y se
 *    comprueba que quedo `.active` ANTES de leer; si no, la entrada se marca `panelCerrado`.
 * ⚠️ Las transiciones se apagan antes de medir.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p25_est.json';

const TERMINOS = ['RWT', 'rwt', '0,42', '0.42', 'TAPSE', 'wilkins', 'onda s', 'Marfan',
  'mixoma', 'fibroelastoma', 'Lambl', 'orejuela', 'coartacion', 'Fallot', 'ductus',
  'cardiotoxicidad', 'CTRCD', 'constriccion', 'taponamiento', 'posoperatorio',
  'vasoplejia', 'anomalia coronaria', 'interarterial', 'strain', 'SGL', 'HFA-PEFF',
  'TEP', 'HTP', 'ateroma', 'pannus', 'trombosis', 'valve-in-valve', 'endocarditis',
  'burbujas', 'foramen', 'xyzqnoexiste'];

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errores = [];
page.on('pageerror', e => errores.push('page: ' + String(e).slice(0, 180)));
page.on('console', m => { if (m.type() === 'error') errores.push('con: ' + m.text().slice(0, 180)) });
await page.goto('file://' + FILE);
await page.waitForTimeout(1200);
await page.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });

const out = await page.evaluate((TERMINOS) => {
  const R = { barra: [], entradas: [], indice: [], vinfo: [], busca: [], avisos: [] };
  const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();

  /* La puerta real: el boton «Referencias» de la fila de herramientas. */
  const btnRefs = Array.from(document.querySelectorAll('.tabs-tools .tab-btn'))
    .find(b => /Referencias/.test(b.textContent || ''));
  if (!btnRefs) { R.avisos.push('NO EXISTE el boton Referencias'); return R; }
  btnRefs.click();

  /* 1 - el orden de la barra, leido del DOM. */
  const botones = Array.from(document.querySelectorAll('#tab-refs .ref-subbar .ref-subtab'));
  R.barra = botones.map(b => ({ id: b.id, rotulo: norm(b.textContent),
                                controla: b.getAttribute('aria-controls') }));

  /* 2 - cada pestania, con el GESTO REAL, y cada entrada de su panel. */
  botones.forEach(function (b) {
    b.click();
    const sub = String(b.id || '').replace(/^ref-subtab-/, '');
    const pan = document.getElementById('ref-sub-' + sub);
    if (!pan) { R.avisos.push('sin panel: ' + sub); return; }
    if (!pan.classList.contains('active')) { R.avisos.push('panelCerrado: ' + sub); return; }
    /* rotulos de bloque del panel */
    const rots = Array.from(pan.querySelectorAll('.ref-bloque-rot, [data-ref-rot]'))
      .map(n => norm(n.textContent));
    /* las entradas: todo h2.card-head con toggleRef */
    const hs = Array.from(pan.querySelectorAll('h2.card-head'));
    hs.forEach(function (h) {
      const oc = h.getAttribute('onclick') || '';
      const a = oc.indexOf("toggleRef('"); if (a < 0) return;
      const z = oc.indexOf("'", a + 11); if (z < 0) return;
      const id = oc.slice(a + 11, z);
      const cuerpo = document.getElementById('ref-' + id);
      if (!cuerpo) { R.avisos.push('sin cuerpo: ' + id); return; }
      /* ABRIR con el gesto real si estaba cerrada */
      const estaba = cuerpo.style.display;
      if (estaba === 'none') h.click();
      const card = h.closest('.card');
      R.entradas.push({
        id: id, sub: sub,
        titulo: norm(h.textContent).replace(/[▶▼]/g, '').trim(),
        abrio: cuerpo.style.display !== 'none',
        /* el texto del CUERPO: es lo que no puede cambiar */
        texto: norm(cuerpo.textContent),
        largo: norm(cuerpo.textContent).length,
        hijas: cuerpo.querySelectorAll('h2.card-head').length,
        /* el panel en que cayo, derivado del DOM igual que lo deriva refIr */
        panelDom: (function () { const p = card ? card.closest('.ref-subpanel') : null;
                                 return p ? String(p.id || '').replace(/^ref-sub-/, '') : null })()
      });
      if (estaba === 'none') h.click();   /* se la deja como estaba */
    });
    R.indice.push({ sub: sub, rotulos: rots });
  });

  /* 3 - el indice del buscador, forzado. */
  try {
    const idx = (typeof _refIndiceArmar === 'function') ? _refIndiceArmar(true) : [];
    R.idxN = idx.length;
    R.idxSubTit = idx.map(e => ({ id: e.id, sub: e.sub, subTit: e.subTit }));
  } catch (e) { R.avisos.push('indice: ' + String(e).slice(0, 90)); R.idxN = -1; }

  /* 4 - CADA entrada de VINFO_REF por su camino real, refIr. */
  try {
    const claves = Object.keys(window.VINFO_REF || {});
    R.vinfoN = claves.length;
    claves.forEach(function (k) {
      const destino = window.VINFO_REF[k];
      let ok = false, panel = null, visible = false;
      try { ok = (typeof refIr === 'function') ? refIr(destino) : false } catch (e) {}
      const cuerpo = document.getElementById('ref-' + destino);
      if (cuerpo) {
        visible = cuerpo.style.display !== 'none';
        const card = cuerpo.closest('.card');
        const p = card ? card.closest('.ref-subpanel') : null;
        panel = p ? String(p.id || '').replace(/^ref-sub-/, '') : null;
      }
      R.vinfo.push({ clave: k, destino: destino, abrio: !!ok, visible: visible,
                     panel: panel,
                     panelActivo: panel ? !!(document.getElementById('ref-sub-' + panel) || {}).classList
                                            && document.getElementById('ref-sub-' + panel).classList.contains('active') : false });
    });
  } catch (e) { R.avisos.push('vinfo: ' + String(e).slice(0, 90)); }

  /* 5 - el buscador, con los terminos de la lista. */
  const inp = document.getElementById('ref-busca');
  if (!inp) { R.avisos.push('NO EXISTE el campo del buscador'); }
  else {
    TERMINOS.forEach(function (t) {
      inp.value = t;
      inp.dispatchEvent(new Event('input', { bubbles: true }));
      const res = document.getElementById('ref-busca-res');
      const items = res ? Array.from(res.querySelectorAll('button')) : [];
      R.busca.push({ termino: t, n: items.length,
                     ids: items.map(b => norm(b.textContent)).sort() });
    });
    inp.value = '';
    inp.dispatchEvent(new Event('input', { bubbles: true }));
  }
  return R;
}, TERMINOS);

out.errores = errores;
out.file = FILE;
fs.writeFileSync(OUTF, JSON.stringify(out, null, 1));
console.log(JSON.stringify({
  barra: out.barra.map(b => b.id.replace('ref-subtab-', '')),
  entradas: out.entradas.length,
  idxN: out.idxN, vinfoN: out.vinfoN,
  avisos: out.avisos, errores: errores.length, out: OUTF
}, null, 1));
await browser.close();
process.exit(0);
