#!/usr/bin/env node
/**
 * _probe_p32cfg.mjs - Parte B de PANT-32 (2026-11-10): la pantalla Documentos de Configuracion.
 *  B1 la seccion nueva, con el estilo de las demas y en su lugar.
 *  B2 el interruptor del boton del Informe: por omision encendido, oculta con CLASE y vale al recargar.
 *  B3 la lista, el cupo y las etiquetas.
 *  B4 ocultar solo saca del menu.
 *  B5 el menu pintado, al instante.
 *  B7 celular: una columna, 44 px y sin desplazamiento horizontal.
 * Nombre propio: verificado con ls, no existia.
 */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const ANCHOS = [1440, 1000, 768, 390];
const S = await abrir(FILE, { espera: 3400 });
const R = { file: FILE };
R.entrar = await S.entrar();
await S.ev(() => {
  try { localStorage.removeItem('ecosmart_doc_modelos'); localStorage.removeItem('ecosmart_doc_boton'); } catch (e) {}
  if (window.docmodArranque) docmodArranque();
  return 1;
});

/* ── B1 · la seccion esta, con el molde de las demas y en su lugar ── */
R.B1 = await S.ev(() => {
  if (window.showTab) showTab('config');
  if (window.cfgOnShow) cfgOnShow();
  const cfg = document.getElementById('tab-config');
  const cards = Array.prototype.slice.call(cfg.querySelectorAll('section.cfg-card'));
  const i = cards.findIndex(function (c) { return c.id === 'cfg-card-docs'; });
  const t = cards[i] ? cards[i].querySelector('.cfg-sec-title') : null;
  return { n: cards.length, idx: i,
           antes: i > 0 ? cards[i - 1].querySelector('.cfg-sec-title').textContent.trim() : null,
           despues: cards[i + 1] ? cards[i + 1].querySelector('.cfg-sec-title').textContent.trim() : null,
           tit: t ? t.textContent.trim() : null,
           tieneSecTitle: !!t, esSection: cards[i] ? cards[i].tagName : null,
           pie: (document.getElementById('cfg-docs-pie') || {}).textContent };
});

/* ── B3 y B4 · la lista, el cupo y las etiquetas ── */
R.B3 = await S.ev(() => {
  const filas = Array.prototype.map.call(document.querySelectorAll('#cfg-docs-lista .cfgdoc-fila'), function (f) {
    return { nom: f.querySelector('.cfgdoc-nom').textContent,
             tags: Array.prototype.map.call(f.querySelectorAll('.cfgdoc-tag'), function (t) { return t.textContent; }),
             vis: !!f.querySelector('[data-cd-vis]').checked,
             editar: !!f.querySelector('[data-cd-ed]'),
             borrar: !!f.querySelector('[data-cd-del]') };
  });
  return { n: filas.length, filas: filas,
           cupo: (document.getElementById('cfg-docs-cupo') || {}).textContent,
           addDesact: !!(document.getElementById('cfg-docs-add') || {}).disabled };
});

/* ── B5 · el menu pintado, y al instante al ocultar ── */
R.B5 = await S.ev(() => {
  if (window.showTab) showTab('informe');
  const leer = function () {
    const m = document.getElementById('doc-menu');
    return Array.prototype.map.call(m.querySelectorAll('[data-doc-k]'), function (b) {
      return b.getAttribute('data-doc-k') + '=' + b.textContent.trim(); });
  };
  const antes = leer();
  /* Ocultar la cardioversion desde Configuracion y mirar el menu SIN recargar. */
  cfgDocsVis('cve', false);
  const despues = leer();
  const mod = docmodModelo('cve');
  cfgDocsVis('cve', true);
  const vuelta = leer();
  /* Ninguno visible: el mensaje de B5. */
  ['constancia', 'cve', 'ete', 'burb'].forEach(function (k) { cfgDocsVis(k, false); });
  const vacio = (document.getElementById('doc-menu').textContent || '').trim();
  const nVacio = leer().length;
  ['constancia', 'cve', 'ete', 'burb'].forEach(function (k) { cfgDocsVis(k, true); });
  return { antes: antes, despues: despues, vuelta: vuelta,
           /* ocultar NO borra: el modelo sigue, con su texto */
           cveSigue: !!mod, cveVis: mod ? mod.vis : null, cveNom: mod ? mod.nom : null,
           mensajeVacio: vacio, nVacio: nVacio,
           cupoConOculto: (function () { cfgDocsVis('cve', false);
             const c = (document.getElementById('cfg-docs-cupo') || {}).textContent;
             cfgDocsVis('cve', true); return c; })() };
});

/* ── B2 · el interruptor ── */
R.B2 = await S.ev(() => {
  const w = function () { return document.querySelector('.doc-menu-wrap'); };
  const ver = function () { const e = w(); const cs = getComputedStyle(e);
    return { clase: e.className, display: cs.display, alto: e.getBoundingClientRect().height,
             btnDisplay: getComputedStyle(document.getElementById('doc-btn')).display }; };
  const pre = ver();
  const chk = document.getElementById('cfg-docs-on');
  const chkPre = chk ? chk.checked : null;
  cfgDocsToggleBoton(false);
  const post = ver();
  const guardado = localStorage.getItem('ecosmart_doc_boton');
  /* ⚠️ `hidden` NO alcanzaria, y aca se mide: con el atributo puesto el boton computa
     `inline-flex` igual, porque `.btn` le gana al `[hidden]` del navegador. */
  const e = w(); e.classList.remove('doc-oculto'); e.hidden = true;
  const conHidden = { display: getComputedStyle(e).display,
                      btn: getComputedStyle(document.getElementById('doc-btn')).display,
                      anchoBtn: document.getElementById('doc-btn').getBoundingClientRect().width };
  e.hidden = false; e.classList.add('doc-oculto');
  cfgDocsToggleBoton(true);
  const fin = ver();
  return { pre: pre, chkPre: chkPre, post: post, guardado: guardado, conHidden: conHidden, fin: fin,
           porOmision: (function () { try { localStorage.removeItem('ecosmart_doc_boton'); } catch (x) {}
             return docmodBotonOn(); })() };
});

/* ── B7 · los cuatro anchos ── */
R.B7 = {};
for (const w of ANCHOS) {
  await S.viewport(w, 900); await S.esperar(220);
  R.B7[w] = await S.ev(() => {
    if (window.showTab) showTab('config');
    if (window.cfgOnShow) cfgOnShow();
    const sec = document.getElementById('cfg-card-docs');
    const filas = Array.prototype.slice.call(sec.querySelectorAll('.cfgdoc-fila'));
    const bts = Array.prototype.slice.call(sec.querySelectorAll('button, .cfgdoc-vis'));
    const chicos = bts.filter(function (b) { const r = b.getBoundingClientRect();
      return r.height > 0 && r.height < 44; }).map(function (b) {
        return (b.textContent || '').trim().slice(0, 22) + ' ' + Math.round(b.getBoundingClientRect().height); });
    /* Una columna: en celular la fila apila, asi que el nombre y las acciones no comparten renglon. */
    const f0 = filas[0];
    const nom = f0.querySelector('.cfgdoc-nom').getBoundingClientRect();
    const acc = f0.querySelector('.cfgdoc-acc').getBoundingClientRect();
    return { anchoSec: Math.round(sec.getBoundingClientRect().width),
             filas: filas.length, chicos: chicos,
             apilado: acc.top >= nom.bottom - 1,
             scrollH: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
             desborde: filas.filter(function (f) {
               return f.getBoundingClientRect().right > sec.getBoundingClientRect().right + 1; }).length };
  });
}
await S.viewport(1440, 900);

console.log(JSON.stringify(R, null, 1));
await S.cerrar();
