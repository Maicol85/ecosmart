#!/usr/bin/env node
/**
 * _probe_p32inv.mjs - TAREA 0 de PANT-32 (2026-11-10). Solo lectura: mide el estado de HOY
 * para el inventario, sin tocar una linea de la app.
 *   1 los cuatro documentos incluidos: bloques, hojas y operaciones de papel, por documento.
 *   2 la exclusion de un id nuevo de Configuracion del censo del estudio y del Excel.
 *   3 el menu del boton «Documentos» y la pantalla Configuracion.
 * Nombre propio: verificado con ls, no existia.
 */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3400 });
const R = { file: FILE };
R.entrar = await S.entrar();
R.siembra = await S.ev(() => {
  const set = (id, v) => { const e = document.getElementById(id); if (!e) return false;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); return true; };
  try {
    localStorage.setItem('centro_tipo_activo', 'default');
    localStorage.setItem('centro_nombre_activo', 'Centro Ficticio de Cardiologia del Norte');
    localStorage.setItem('eco_medicos', JSON.stringify([{ nombre: 'Dra. Ficticia Perez', matricula: '12345', especialidad: 'Cardiologia' }]));
  } catch (e) {}
  const o = { nombre: set('nombre', 'Prueba Ficticia, Ana'), ci: set('ci', '1.234.567-8'),
              sexo: set('sexo', 'F'), ciudad: set('cfg-med-lugar', 'Artigas') };
  if (window.showTab) showTab('informe');
  return o;
});
await S.esperar(400);

/* ── 1 · los cuatro documentos: bloques, hojas y operaciones ── */
R.docs = await S.ev(() => {
  if (typeof DOC_DEFS === 'undefined' || typeof docMaquetar !== 'function') return { err: 'sin modulo' };
  const D = docDatos();
  const out = {};
  Object.keys(DOC_DEFS).forEach(function (k) {
    const def = DOC_DEFS[k];
    const bl = docBloquesNuevos(def, D);
    const maq = docMaquetar(def, D, bl);
    if (!maq) { out[k] = { err: 'sin jspdf' }; return; }
    const tipos = {};
    bl.forEach(function (b) { tipos[b.t] = (tipos[b.t] || 0) + 1; });
    const kinds = {};
    maq.hojas.forEach(function (ops) { ops.forEach(function (o) { kinds[o.k] = (kinds[o.k] || 0) + 1; }); });
    out[k] = { menu: def.menu, tit: def.tit, sz: def.sz, lh: def.lh, hojasDecl: def.hojas,
               bloques: bl.length, tipos: tipos, hojas: maq.n,
               opsPorHoja: maq.hojas.map(function (o) { return o.length; }),
               ops: maq.hojas.reduce(function (a, o) { return a + o.length; }, 0), kinds: kinds };
  });
  return out;
});

/* ── 2 · la exclusion de un id de Configuracion ── */
R.exclusion = await S.ev(() => {
  const pruebas = ['cfg-docs-on', 'cfg-doc-x', 'doc-aviso', 'docmod-x', 'cfg-med-lugar'];
  const o = { fuera: {}, noEsDelEstudio: {} };
  pruebas.forEach(function (id) {
    o.fuera[id] = (typeof _CAMPOS_FUERA_DEL_ESTUDIO !== 'undefined') ? _CAMPOS_FUERA_DEL_ESTUDIO.test(id) : null;
    o.noEsDelEstudio[id] = (typeof _noEsDelEstudio === 'function') ? !!_noEsDelEstudio(id) : null;
  });
  o.excelN = (typeof LAB_XLS_MAP !== 'undefined') ? Object.keys(LAB_XLS_MAP).length : null;
  return o;
});

/* ── 3 · el menu, el boton y las tarjetas de Configuracion ── */
R.pantalla = await S.ev(() => {
  const m = document.getElementById('doc-menu'), b = document.getElementById('doc-btn');
  const items = m ? Array.prototype.map.call(m.querySelectorAll('button'), function (x) {
    return { txt: (x.textContent || '').trim(), on: (x.getAttribute('onclick') || '') }; }) : [];
  const cfg = document.getElementById('tab-config');
  const cards = cfg ? Array.prototype.map.call(cfg.querySelectorAll('section.cfg-card'), function (s) {
    const t = s.querySelector('.cfg-sec-title');
    return { tit: t ? (t.textContent || '').trim() : '(sin titulo)', id: s.id || '' }; }) : [];
  const bst = b ? getComputedStyle(b) : null;
  return { menuItems: items, menuOculto: m ? !!m.hidden : null,
           btnDisplay: bst ? bst.display : null, btnTxt: b ? (b.textContent || '').trim() : null,
           cards: cards, nCards: cards.length };
});

/* ── 4 · el procedimiento de la declaracion: dato o literal ── */
R.proc = await S.ev(() => {
  if (typeof docDeclaracion !== 'function') return { err: 'no' };
  const a = docDeclaracion('XXPROCXX', false);
  const b = docDeclaracion('XXPROCXX', true);
  return { bloques: a.length, conInternacion: b.length,
           usos: a.filter(function (x) { return x.x && x.x.indexOf('XXPROCXX') >= 0; }).length,
           usosUl: (a.find(function (x) { return x.t === 'ul'; }) || { items: [] }).items
             .filter(function (s) { return s.indexOf('XXPROCXX') >= 0; }).length,
           grupo: a.every(function (x) { return x.grupo === 'firmas'; }) };
});

console.log(JSON.stringify(R, null, 1));
await S.cerrar();
