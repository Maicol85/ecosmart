#!/usr/bin/env node
/**
 * _probe_p33cfg.mjs - PANT-33, PARTE A. Configuracion -> Documentos queda minima:
 *   1 la lista y sus filas, sin cupo, sin «Propio» y sin «Borrar».
 *   2 los ids y las funciones que salieron: tienen que NO existir.
 *   3 A5: los documentos «propios» que PANT-32 hubiera dejado en disco no se listan y
 *     SOBREVIVEN a una escritura del almacen.
 *   4 ocultar y mostrar: el menu del Informe cambia al instante.
 * Corre contra cualquier arbol con --file=, asi que sirve de A/B.
 */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3400 });
await S.entrar();
const R = await S.ev(() => {
  if (window.showTab) showTab('config');
  if (typeof cfgOnShow === 'function') cfgOnShow();
  const li = document.getElementById('cfg-docs-lista');
  const filas = li ? Array.prototype.map.call(li.querySelectorAll('.cfgdoc-fila'), function (f) {
    const cb = f.querySelector('[data-cd-vis]');
    return { nom: f.querySelector('.cfgdoc-nom').textContent,
             tags: Array.prototype.map.call(f.querySelectorAll('.cfgdoc-tag'), function (t) { return t.textContent; }),
             vis: !!(cb && cb.checked),
             botones: Array.prototype.map.call(f.querySelectorAll('button'), function (b) { return b.textContent; }),
             /* el area tactil de cada control de la fila */
             alturas: Array.prototype.map.call(f.querySelectorAll('button,label'), function (b) {
               return Math.round(b.getBoundingClientRect().height); }) };
  }) : null;
  return { filas: filas,
    idsFuera: ['cfg-docs-cupo', 'cfg-docs-botones', 'cfg-docs-add', 'cfg-docs-imp',
               'cfg-docs-imp-btn', 'cfg-docs-tipo'].map(function (i) { return [i, !!document.getElementById(i)]; }),
    fnsFuera: ['cfgDocsExportar', 'cfgDocsImportar', 'cfgDocsAgregar', 'cfgDocsAgregarCancelar',
               'cfgDocsEditarNuevo', 'cfgDocsBorrar', 'docmodNuevo'].map(function (f) { return [f, typeof window[f]]; }),
    on: (document.getElementById('cfg-docs-on') || {}).checked,
    pie: (document.getElementById('cfg-docs-pie') || {}).textContent,
    etq: (typeof docmodEtiqueta === 'function') ? [docmodEtiqueta('constancia'), docmodEtiqueta('consent'), docmodEtiqueta('blanco')] : null,
    menu: Array.prototype.map.call((document.getElementById('doc-menu') || { querySelectorAll: function () { return []; } }).querySelectorAll('[data-doc-k]'), function (b) { return b.textContent; })
  };
});
const A5 = await S.ev(() => {
  const st = docmodLeer();
  st.prop = [{ clave: 'p1', tipo: 'constancia', vis: true, nom: 'Propio viejo 1', tit: 'X', frase: true, txt: 'algo', decl: true, firmas: true, comunes: true },
             { clave: 'p2', tipo: 'consent', vis: true, nom: 'Propio viejo 2', tit: 'Y', pregs: [{ t: 'a', x: 'b' }], decl: true, firmas: true, comunes: true }];
  docmodEscribir(st);
  cfgDocsRender();
  const li = document.getElementById('cfg-docs-lista');
  const filas = li ? li.querySelectorAll('.cfgdoc-fila').length : null;
  cfgDocsVis('ete', false);
  const st2 = docmodLeer();
  const r = { filasConPropios: filas, propiosEnDisco: (st2.prop || []).length,
              nombres: (st2.prop || []).map(function (p) { return p.nom; }),
              eteOculta: st2.incl.ete.vis === false,
              menuTrasOcultar: Array.prototype.map.call(document.getElementById('doc-menu').querySelectorAll('[data-doc-k]'), function (b) { return b.textContent; }),
              filaDiceOculto: !!document.querySelector('.cfgdoc-tag-ocu') };
  cfgDocsVis('ete', true);
  const st3 = docmodLeer();
  r.vuelve = st3.incl.ete.vis === true;
  r.menuVuelve = document.getElementById('doc-menu').querySelectorAll('[data-doc-k]').length;
  r.propiosTrasTodo = (st3.prop || []).length;
  r.sinOcultoEnFila = !document.querySelector('.cfgdoc-tag-ocu');
  return r;
});
console.log(JSON.stringify({ R, A5, errs: S.errs.slice(0, 8) }, null, 1));
S.cerrar(); process.exit(0);
