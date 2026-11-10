#!/usr/bin/env node
/**
 * _probe_pant30doc.mjs - verificacion de la Parte A de PANT-30 (2026-11-10).
 * Corre sobre UN arbol (--file) y se usa en SERIE sobre los dos lados de un A/B.
 * Mide, con el GESTO REAL (clic en el boton, clic en la opcion del menu):
 *   (A) el boton «Documentos» en la fila de acciones del Informe: que existe, su alto tactil y
 *       que la fila sigue teniendo los cuatro botones de antes;
 *   (B) el menu: abre, cierra con Escape devolviendo el foco, y cierra con un clic afuera;
 *   (C) la hoja: que abre, que los marcadores quedaron sustituidos (cero «{{...}}» sueltos),
 *       cuantos tramos azules tiene y que el titulo y la firma estan;
 *   (D) la EDICION: corregir un parrafo y comprobar que sobrevive a cerrar y reabrir;
 *   (E) el AVISO: cambiar un dato de la app con la hoja editada -> «Actualizar con los datos»;
 *   (F) el PAPEL: hojas que da el maquetador, hojas que da el PDF de verdad, y la geometria
 *       (margenes, pie en las dos hojas, nada por fuera de la caja);
 *   (G) el ancho de celular: cero desplazamiento horizontal.
 * Nombre propio: verificado con ls, no existia.
 */
import { abrir } from './_p30cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const CLAVE = (process.argv.find(a => a.startsWith('--doc=')) || '').split('=')[1] || 'constancia';
const S = await abrir(FILE, { espera: 3200 });
const errs = S.errs;

const R = { file: FILE, doc: CLAVE };

/* Siembra: paciente, documento, sexo y fecha. Datos FICTICIOS: el repo es publico. */
R.siembra = await S.ev(() => {
  const set = (id, v) => {
    const e = document.getElementById(id); if (!e) return false;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return true;
  };
  const o = {};
  o.nombre = set('nombre', 'Prueba Ficticia, Ana');
  o.doc_tipo = set('doc_tipo', 'CI');
  o.ci = set('ci', '1.234.567-8');
  o.sexo = set('sexo', 'F');
  o.fecha = set('fecha', '2026-11-10');
  o.ciudad = set('cfg-med-lugar', 'Artigas');
  /* ⚠️ LA PESTAÑA SE ABRE CON showTab Y NO BUSCANDO UN [onclick], y se midio por que: el primer
     elemento que empareja no es el de la pestaña, asi que #tab-informe se quedaba SIN la clase
     active, el boton informaba 0x0 con offsetParent nulo y el menu -- que es absoluto adentro--
     contaba como «opcion inactiva». Tres mediciones falsas de una sola causa, y las tres se leen
     como «el boton no esta». */
  if (window.showTab) showTab('informe');
  o.clase = (document.getElementById('tab-informe') || {}).className;
  o.tab = o.clase.indexOf('active') > -1;
  return o;
});
await S.esperar(500);

/* ── (A) el boton y la fila ── */
R.A = await S.ev(() => {
  const b = document.getElementById('doc-btn');
  if (!b) return { existe: false };
  const r = b.getBoundingClientRect();
  const fila = b.closest('div[style*="flex-wrap"]');
  const btns = fila ? Array.prototype.slice.call(fila.querySelectorAll(':scope > button')).map(x => x.textContent.trim()) : [];
  return {
    existe: true, w: Math.round(r.width), h: Math.round(r.height),
    txt: b.textContent.trim(), visible: !!b.offsetParent,
    hermanos: btns, nHermanos: btns.length
  };
});

/* ── (B) el menu ── */
R.B = await S.ev(() => {
  const o = {};
  const b = document.getElementById('doc-btn'), m = document.getElementById('doc-menu');
  o.cerradoAlNacer = !!(m && m.hidden);
  b.click();
  o.abre = !!(m && !m.hidden);
  o.aria = b.getAttribute('aria-expanded');
  o.opciones = Array.prototype.slice.call(m.querySelectorAll('button')).map(x => x.textContent.trim());
  /* Todas SIEMPRE activas: ninguna deshabilitada ni oculta. */
  o.inactivas = Array.prototype.slice.call(m.querySelectorAll('button'))
    .filter(x => x.disabled || x.hidden || !x.offsetParent).length;
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  o.escCierra = !!(m && m.hidden);
  o.focoVuelve = document.activeElement === b;
  b.click();
  document.body.click();
  o.clicAfueraCierra = !!(m && m.hidden);
  return o;
});

/* ── (C) la hoja ── */
R.C = await S.ev((clave) => {
  const b = document.getElementById('doc-btn'); b.click();
  const m = document.getElementById('doc-menu');
  const op = Array.prototype.slice.call(m.querySelectorAll('button'))
    .filter(x => (x.getAttribute('onclick') || '').indexOf("'" + clave + "'") > -1)[0];
  if (!op) return { opcion: false };
  op.click();
  const ov = document.getElementById('doc-ov'), h = document.getElementById('doc-hoja');
  const txt = h ? h.innerText : '';
  return {
    opcion: true, abre: !!(ov && !ov.hidden),
    tit: (document.getElementById('doc-ov-tit') || {}).textContent,
    chars: txt.length,
    marcadoresSueltos: (txt.match(/\{\{[a-z]+\}\}/g) || []).length,
    azules: h ? h.querySelectorAll('.doc-dato').length : 0,
    azulTxt: h ? Array.prototype.slice.call(h.querySelectorAll('.doc-dato')).map(e => e.textContent.trim()).slice(0, 8) : [],
    editables: h ? h.querySelectorAll('[contenteditable="true"]').length : 0,
    tienePaciente: txt.indexOf('Prueba Ficticia, Ana') > -1,
    tieneCI: txt.indexOf('1.234.567-8') > -1,
    tieneArticulo: txt.indexOf('la paciente') > -1,
    tieneEstudio: txt.indexOf('ecocardiograma transtor') > -1,
    tieneCiudad: txt.indexOf('Artigas') > -1,
    focoEnCerrar: document.activeElement === document.getElementById('doc-x'),
    avisoVisible: !(document.getElementById('doc-aviso') || {}).hidden
  };
}, CLAVE);

/* ── (D) la edicion sobrevive a cerrar y reabrir ── */
R.D = await S.ev((clave) => {
  const h = document.getElementById('doc-hoja');
  const p = h.querySelector('p.doc-p[contenteditable="true"]') || h.querySelector('[contenteditable="true"]');
  if (!p) return { campo: false };
  const antes = p.innerText.trim();
  p.innerText = antes + ' TEXTO CORREGIDO A MANO.';
  p.dispatchEvent(new Event('input', { bubbles: true }));
  document.getElementById('doc-x').click();
  const b = document.getElementById('doc-btn'); b.click();
  const op = Array.prototype.slice.call(document.querySelectorAll('#doc-menu button'))
    .filter(x => (x.getAttribute('onclick') || '').indexOf("'" + clave + "'") > -1)[0];
  op.click();
  const txt = document.getElementById('doc-hoja').innerText;
  return { campo: true, sobrevive: txt.indexOf('TEXTO CORREGIDO A MANO.') > -1, chars: txt.length };
}, CLAVE);

/* ── (E) el aviso: cambiar un dato con la hoja ya editada ── */
R.E = await S.ev((clave) => {
  const o = {};
  o.antesDelCambio = !(document.getElementById('doc-aviso') || {}).hidden;
  document.getElementById('doc-x').click();
  const n = document.getElementById('nombre');
  n.value = 'Otro Ficticio, Luis';
  n.dispatchEvent(new Event('input', { bubbles: true })); n.dispatchEvent(new Event('change', { bubbles: true }));
  const b = document.getElementById('doc-btn'); b.click();
  const op = Array.prototype.slice.call(document.querySelectorAll('#doc-menu button'))
    .filter(x => (x.getAttribute('onclick') || '').indexOf("'" + clave + "'") > -1)[0];
  op.click();
  o.avisa = !(document.getElementById('doc-aviso') || {}).hidden;
  const txt = document.getElementById('doc-hoja').innerText;
  /* NO PISA: la correccion a mano sigue ahi y el nombre viejo tambien. */
  o.conservaCorreccion = txt.indexOf('TEXTO CORREGIDO A MANO.') > -1;
  o.conservaNombreViejo = txt.indexOf('Prueba Ficticia, Ana') > -1;
  o.tieneNombreNuevo = txt.indexOf('Otro Ficticio, Luis') > -1;
  /* Y al apretar «Actualizar con los datos» se rearma. */
  document.querySelector('#doc-aviso button').click();
  const t2 = document.getElementById('doc-hoja').innerText;
  o.trasActualizar = { correccion: t2.indexOf('TEXTO CORREGIDO A MANO.') > -1,
                       nombreNuevo: t2.indexOf('Otro Ficticio, Luis') > -1,
                       avisa: !(document.getElementById('doc-aviso') || {}).hidden };
  return o;
}, CLAVE);

/* ── (F) el papel: maquetador y PDF de verdad ── */
R.F = await S.ev((clave) => {
  const def = window.DOC_DEFS[clave], D = window.docDatos();
  const st = { bloques: null };
  /* Se maqueta desde los bloques NUEVOS: el papel de la verificacion no lleva la correccion de
     la prueba (D), que es texto de prueba y correria la medicion de hojas. */
  const bl = def.bloques().map((b, i) => {
    const c = { t: b.t, i: i };
    if (b.x !== undefined) c.x = String(b.x).replace(/\{\{([a-z]+)\}\}/g, (_m, k) => (D[k] == null || String(D[k]).trim() === '') ? '____' : String(D[k]));
    if (b.items) c.items = b.items.slice();
    if (b.fuerte) c.fuerte = b.fuerte;
    if (b.nonum) c.nonum = b.nonum;
    if (b.grupo) c.grupo = b.grupo;
    return c;
  });
  const maq = window.docMaquetar(def, D, bl);
  if (!maq) return { maq: false };
  const G = window.DOC_GEO;
  let minX = 1e9, maxX = -1e9, maxY = -1e9, nOps = 0, pies = 0;
  maq.hojas.forEach(ops => {
    ops.forEach(o => {
      nOps++;
      if (o.k === 't') { minX = Math.min(minX, o.x); maxY = Math.max(maxY, o.y); }
      if (o.k === 'tw') { o.ws.forEach(w => { minX = Math.min(minX, w.x); maxX = Math.max(maxX, w.x); }); maxY = Math.max(maxY, o.y); }
      if (o.s && String(o.s).indexOf('Página ') === 0) pies++;
    });
  });
  const doc = window.docOpsAPdf(def, maq);
  const svg = window.docOpsASvg(maq);
  return {
    maq: true, hojasMaq: maq.n, hojasPdf: doc.getNumberOfPages(),
    hojasEsperadas: def.hojas, nOps: nOps, pies: pies,
    minX: +minX.toFixed(2), maxY: +maxY.toFixed(2),
    ML: G.ML, fondo: G.H - G.MB,
    dentro: minX >= G.ML - 0.01,
    svgChars: svg.length,
    svgTieneFuente: svg.indexOf('font-family:Helvetica') > -1,
    svgTextos: (svg.match(/<text /g) || []).length
  };
}, CLAVE);

/* ── (G) celular ── */
await S.viewport(390, 844);
await S.esperar(300);
R.G = await S.ev(() => ({
  scrollH: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  hojaW: Math.round((document.getElementById('doc-hoja') || { getBoundingClientRect: () => ({ width: 0 }) }).getBoundingClientRect().width)
}));

R.errores = errs;
console.log(JSON.stringify(R, null, 1));
S.cerrar();
process.exit(0);
