#!/usr/bin/env node
/**
 * _probe_p33inv.mjs - TAREA 0 de PANT-33 (2026-11-10). SOLO LECTURA: mide el estado de HOY
 * para el inventario, sin tocar una linea de la app.
 *   1 la institucion del encabezado: que cadena resuelve cada camino, y de donde sale la raya.
 *   2 el encabezado dibujado: donde cae el logo (o el circulo) y donde el nombre, en el papel
 *     y en la pantalla.
 *   3 los cuatro incluidos: bloques, hojas y operaciones de papel -- la linea base de D5.
 *   4 Configuracion -> Documentos: ids presentes, claves de almacen y cupo.
 *   5 donde se dibujan la fecha, la firma, la linea del paciente y las tres piezas finales.
 * Nombre propio: verificado con ls, no existia.
 */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3400 });
const R = { file: FILE };
R.entrar = await S.entrar();

/* ── 1 · la institucion: los cuatro caminos, con el centro de trabajo cargado ── */
R.inst = await S.ev(() => {
  const out = {};
  const leer = () => ({
    docDatos: (typeof docDatos === 'function') ? docDatos().inst : null,
    hdrCentroNombre: (typeof hdrCentroNombre === 'function') ? hdrCentroNombre() : null,
    ecoGetCentroPrincipal: (typeof ecoGetCentroPrincipal === 'function') ? ecoGetCentroPrincipal() : null,
    svMedCentro: (typeof sv === 'function') ? sv('med-centro') : null,
    centro_nombre_activo: (function () { try { return localStorage.getItem('centro_nombre_activo'); } catch (e) { return null; } })(),
    modoInst: (function () { try { return localStorage.getItem('ett_modo_institucional'); } catch (e) { return null; } })()
  });
  out.alArrancar = leer();
  /* El escenario del medico: su centro de trabajo cargado en la lista de centros de Config. */
  try {
    localStorage.setItem('ett_centros', JSON.stringify(['GREMEDA']));
    localStorage.setItem('ett_centro_principal', 'GREMEDA');
  } catch (e) {}
  out.conCentro = leer();
  try { localStorage.setItem('ett_modo_institucional', '1'); } catch (e) {}
  out.conCentroYModoInst = leer();
  try { localStorage.setItem('ett_modo_institucional', '0'); } catch (e) {}
  out.conCentroSinModoInst = leer();
  return out;
});

/* ── 2 · el encabezado dibujado: papel y pantalla ── */
R.enc = await S.ev(() => {
  if (typeof docMaquetar !== 'function') return { err: 'sin modulo' };
  const D = docDatos();
  D.inst = 'GREMEDA';
  const def = DOC_DEFS.constancia;
  const maq = docMaquetar(def, D, docBloquesNuevos(def, D));
  if (!maq) return { err: 'sin jspdf' };
  const ops = maq.hojas[0];
  const circ = ops.filter(function (o) { return o.k === 'circ'; })[0] || null;
  const img = ops.filter(function (o) { return o.k === 'img'; })[0] || null;
  const nom = ops.filter(function (o) { return o.k === 'c' && o.s === 'GREMEDA'; })[0] || null;
  const html = docHojaHTML(docBloquesNuevos(def, D), D, false);
  const cont = document.createElement('div');
  cont.className = 'doc-hoja'; cont.style.position = 'absolute'; cont.style.left = '-9999px';
  cont.innerHTML = html; document.body.appendChild(cont);
  const e = cont.querySelector('.doc-enc');
  const cs = e ? getComputedStyle(e) : null;
  const ini = cont.querySelector('.doc-enc-ini'), nm = cont.querySelector('.doc-enc-nom');
  const hu = cont.querySelector('.doc-enc-hueco');
  const rb = function (x) { if (!x) return null; const r = x.getBoundingClientRect();
    return { x: Math.round(r.x), w: Math.round(r.width) }; };
  const o = { papel: { circ: circ ? { x: +circ.x.toFixed(1), y: +circ.y.toFixed(1), s: circ.s } : null,
                       img: img ? { x: +img.x.toFixed(1), w: img.w } : null,
                       nombreCentrado: !!nom, W: DOC_GEO.W },
              pantalla: { cols: cs ? cs.gridTemplateColumns : null, ini: rb(ini), nom: rb(nm), hueco: rb(hu),
                          caja: rb(e) },
              instVacia: docHojaHTML([{ t: 'enc', i: 0 }], { inst: '', logoD: null }, false) };
  cont.remove();
  return o;
});

/* ── 3 · los cuatro incluidos: la linea base de D5 ── */
R.docs = await S.ev(() => {
  if (typeof DOC_DEFS === 'undefined' || typeof docMaquetar !== 'function') return { err: 'sin modulo' };
  const D = docDatos(); D.inst = 'GREMEDA';
  const out = {};
  Object.keys(DOC_DEFS).forEach(function (k) {
    const def = DOC_DEFS[k];
    const bl = docBloquesNuevos(def, D);
    const maq = docMaquetar(def, D, bl);
    if (!maq) { out[k] = { err: 'sin jspdf' }; return; }
    const tipos = {};
    bl.forEach(function (b) { tipos[b.t] = (tipos[b.t] || 0) + 1; });
    out[k] = { menu: def.menu, tit: def.tit, sz: def.sz, lh: def.lh, hojasDecl: def.hojas,
               bloques: bl.length, tipos: tipos, hojas: maq.n,
               ops: maq.hojas.reduce(function (a, o) { return a + o.length; }, 0),
               mismoObjeto: (typeof docmodDef === 'function') ? (docmodDef(k) === DOC_DEFS[k]) : null };
  });
  return out;
});

/* ── 4 · Configuracion -> Documentos: lo que hay hoy ── */
R.cfg = await S.ev(() => {
  const ids = ['cfg-card-docs', 'cfg-docs-on', 'cfg-docs-cupo', 'cfg-docs-lista', 'cfg-docs-botones',
               'cfg-docs-add', 'cfg-docs-imp', 'cfg-docs-imp-btn', 'cfg-docs-tipo', 'cfg-docs-ed',
               'cfg-docs-pie', 'doc-btn', 'doc-menu', 'doc-ov', 'doc-hoja', 'doc-conf'];
  const o = { ids: {}, fns: {}, claves: {} };
  ids.forEach(function (i) { o.ids[i] = !!document.getElementById(i); });
  ['cfgDocsRender', 'cfgDocsVis', 'cfgDocsBorrar', 'cfgDocsEditar', 'cfgDocsExportar',
   'cfgDocsImportar', 'cfgDocsAgregar', 'cfgDocsAgregarCancelar', 'cfgDocsEditarNuevo',
   'cfgDocsEdSalir', 'cfgDocsEdGuardar', 'cfgDocsEdOriginal', 'cfgDocsPegar', 'cfgDocsPrev',
   'docmodLeer', 'docmodEscribir', 'docmodLista', 'docmodModelo', 'docmodDef', 'docmodArmar',
   'docmodOrig', 'docmodNuevo', 'docmodValidar', 'docmodIgualAlOriginal', 'docmodTextoABloques',
   'docmodBloquesATexto', 'docHojaHTML', 'docZoomAjustar', 'docAbrir'].forEach(function (f) {
    o.fns[f] = (typeof window[f] === 'function');
  });
  o.claves = { modelos: (typeof DOCMOD_KEY !== 'undefined') ? DOCMOD_KEY : null,
               boton: (typeof DOCMOD_BTN_KEY !== 'undefined') ? DOCMOD_BTN_KEY : null,
               ver: (typeof DOCMOD_VER !== 'undefined') ? DOCMOD_VER : null,
               incl: (typeof DOCMOD_INCL !== 'undefined') ? DOCMOD_INCL.slice() : null,
               propiosMax: (typeof DOCMOD_PROPIOS_MAX !== 'undefined') ? DOCMOD_PROPIOS_MAX : null,
               totalMax: (typeof DOCMOD_TOTAL_MAX !== 'undefined') ? DOCMOD_TOTAL_MAX : null,
               lim: (typeof DOCMOD_LIM !== 'undefined') ? DOCMOD_LIM : null };
  o.almacenActual = (typeof docmodLeer === 'function') ? docmodLeer() : null;
  o.propiosEnDisco = o.almacenActual ? (o.almacenActual.prop || []).length : null;
  if (typeof cfgDocsRender === 'function') { try { if (window.showTab) showTab('config'); cfgDocsRender(); } catch (e) {} }
  const li = document.getElementById('cfg-docs-lista');
  o.filas = li ? li.querySelectorAll('.cfgdoc-fila').length : null;
  o.cupoTxt = (document.getElementById('cfg-docs-cupo') || {}).textContent || null;
  const mm = document.getElementById('doc-menu');
  o.menuItems = mm ? Array.prototype.map.call(mm.querySelectorAll('[data-doc-k]'), function (b) { return b.textContent; }) : null;
  return o;
});

/* ── 5 · la ida y vuelta de las convenciones, y las piezas finales ── */
R.conv = await S.ev(() => {
  if (typeof docmodOrig !== 'function') return { err: 'sin modulo' };
  const out = {};
  ['constancia', 'cve', 'ete', 'burb'].forEach(function (k) {
    const o = docmodOrig(k);
    if (!o) { out[k] = null; return; }
    const txt = (o.tipo === 'constancia') ? String(o.txt || '')
      : (o.pregs || []).map(function (p) { return (p.t ? ('## ' + p.t + '\n') : '') + p.x; }).join('\n\n');
    const pal = function (s) { return String(s).split(/\s+/).filter(Boolean).length; };
    out[k] = { tipo: o.tipo, tit: o.tit, nom: o.nom,
               pregs: (o.pregs || []).length, txtLargo: txt.length, palabras: pal(txt),
               marcas: { sec: (txt.match(/^## /gm) || []).length, vin: (txt.match(/^• /gm) || []).length,
                         chk: (txt.match(/^☐/gm) || []).length, raya: (txt.match(/^_{3,}$/gm) || []).length,
                         neg: (txt.match(/\*\*/g) || []).length / 2 },
               /* ¿docmodTextoABloques entiende hoy el «## »? */
               secReconocida: (function () { const b = docmodTextoABloques('## Titulo\nCuerpo.');
                 return b.map(function (x) { return x.t; }).join(','); })() };
  });
  const D = docDatos();
  const def = DOC_DEFS.ete;
  const bl = docBloquesNuevos(def, D);
  out.piezasEte = { grupoFirmas: bl.filter(function (b) { return b.grupo === 'firmas'; }).length,
                    tfirmas: bl.filter(function (b) { return b.t === 'tfirmas'; }).length,
                    salto: bl.filter(function (b) { return b.t === 'salto'; }).length,
                    pacid: bl.filter(function (b) { return b.t === 'pacid'; }).length,
                    ciudadfecha: bl.filter(function (b) { return b.t === 'ciudadfecha'; }).length,
                    firma: bl.filter(function (b) { return b.t === 'firma'; }).length };
  return out;
});

R.errs = S.errs.slice(0, 12);
console.log(JSON.stringify(R, null, 1));
S.cerrar();
process.exit(0);
