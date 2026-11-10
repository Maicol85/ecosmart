#!/usr/bin/env node
/**
 * _probe_p32mod.mjs - Parte A de PANT-32 (2026-11-10): el almacen de modelos.
 *  A1 el almacen en localStorage, su validador y su lectura tolerante.
 *  A2 los cuatro incluidos representados como modelos editables.
 *  A3 LA REGLA DE ORO: sin editar, hojas y operaciones identicas a PANT-31.
 *  A4 las cinco convenciones de texto, con ida y vuelta.
 *  A5 la declaracion de un propio no nombra el procedimiento.
 * Nombre propio: verificado con ls, no existia.
 */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3400 });
const R = { file: FILE };
R.entrar = await S.entrar();
await S.ev(() => {
  try {
    localStorage.removeItem('ecosmart_doc_modelos');
    localStorage.setItem('centro_tipo_activo', 'default');
    localStorage.setItem('centro_nombre_activo', 'Centro Ficticio de Cardiologia del Norte');
    localStorage.setItem('ett_medicos', JSON.stringify([{ nombre: 'Dra. Ficticia Perez', matricula: '12345', especialidad: 'Cardiologia' }]));
  } catch (e) {}
  const set = (id, v) => { const e = document.getElementById(id); if (!e) return false;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); return true; };
  set('nombre', 'Prueba Ficticia, Ana'); set('ci', '1.234.567-8'); set('sexo', 'F');
  set('cfg-med-lugar', 'Artigas');
  if (window.showTab) showTab('informe');
  return 1;
});
await S.esperar(300);

/* ── A3 · la regla de oro, y el objeto DEVUELTO es el mismo ── */
R.A3 = await S.ev(() => {
  const D = docDatos(), out = {};
  ['constancia', 'cve', 'ete', 'burb'].forEach(function (k) {
    const def = docmodDef(k);
    const maq = docMaquetar(def, D, docBloquesNuevos(def, D));
    out[k] = { mismoObjeto: def === DOC_DEFS[k], hojas: maq ? maq.n : null,
               ops: maq ? maq.hojas.reduce(function (a, o) { return a + o.length; }, 0) : null,
               editado: docmodModelo(k).editado, igual: docmodIgualAlOriginal(k, docmodModelo(k)) };
  });
  return out;
});

/* ── A2 y A4 · el modelo original y la ida y vuelta del texto ── */
R.A2 = await S.ev(() => {
  const out = {};
  ['constancia', 'cve', 'ete', 'burb'].forEach(function (k) {
    const o = docmodOrig(k);
    const pal = function (s) { return String(s).replace(/[^A-Za-zÀ-ÿ0-9]+/g, ' ').trim().split(' ').filter(Boolean); };
    let txt = '';
    if (o.tipo === 'constancia') txt = o.txt;
    else txt = (o.pregs || []).map(function (p) { return p.t + '\n' + p.x; }).join('\n');
    /* Las palabras del CUERPO de la definicion -- sin encabezado, sin piezas-- contra las del
       texto derivado: lo que el editor muestra no puede perder una palabra. */
    const b = DOC_DEFS[k].bloques();
    let iIni = -1, iFin = -1;
    b.forEach(function (x, i) {
      if (o.tipo === 'constancia') {
        if (iIni < 0 && x.t === 'p') iIni = i;
        if (iFin < 0 && x.t === 'firma') iFin = i;
      } else {
        if (iIni < 0 && x.t === 'pacid') iIni = i;
        if (iFin < 0 && x.grupo === 'firmas') iFin = i;
      }
    });
    const cuerpo = b.slice(iIni + 1, iFin < 0 ? b.length : iFin);
    const pDef = [];
    cuerpo.forEach(function (x) {
      if (x.x) pDef.push.apply(pDef, pal(x.x));
      (x.items || []).forEach(function (it) { pDef.push.apply(pDef, pal(it)); });
    });
    if (o.tipo !== 'constancia') cuerpo.forEach(function (x) { if (x.t === 'sec') {} });
    const pTxt = pal(txt);
    const falta = pDef.filter(function (w) { return pTxt.indexOf(w) < 0; });
    out[k] = { tipo: o.tipo, nom: o.nom, tit: o.tit,
               pregs: o.pregs ? o.pregs.length : null,
               pregTits: o.pregs ? o.pregs.map(function (p) { return p.t; }) : null,
               vacias: o.pregs ? o.pregs.filter(function (p) { return !p.x.trim(); }).length : null,
               txtLargo: txt.length, palDef: pDef.length, palTxt: pTxt.length,
               faltan: falta.slice(0, 12), nFaltan: falta.length,
               igualAlOriginal: docmodIgualAlOriginal(k, o) };
  });
  return out;
});

/* ── A4 · la ida y vuelta del dibujo: el modelo original armado por el armador comun ── */
R.A4 = await S.ev(() => {
  const D = docDatos(), out = {};
  ['constancia', 'cve', 'ete', 'burb'].forEach(function (k) {
    /* ⚠️ `incl: true` NO ES ADORNO: sin el, `docmodPiezas` toma la rama del PROPIO y la
       declaracion sale con «el procedimiento» en vez de con el del documento -- y la
       cardioversion pierde ademas su vinieta de internacion-. Es el camino que la app toma
       cuando el medico edita UNA palabra de un incluido, y la primera version de esta sonda lo
       midio sin el: once palabras «faltaban» y el que estaba mal era el denominador. */
    const o = docmodOrig(k); o.incl = true;
    const def = { clave: k, menu: o.nom, tit: 'x', sz: (o.tipo === 'constancia' ? 10.5 : 10.2),
                  lh: (o.tipo === 'constancia' ? 16 : 13.4), hojas: 1,
                  bloques: function () { return docmodArmar(o); } };
    const bl = docBloquesNuevos(def, D);
    const maq = docMaquetar(def, D, bl);
    const tipos = {};
    bl.forEach(function (b) { tipos[b.t] = (tipos[b.t] || 0) + 1; });
    /* La tinta: todas las palabras que el papel dibuja, de un lado y del otro. */
    const tinta = function (m) {
      const w = [];
      m.hojas.forEach(function (ops) { ops.forEach(function (op) {
        if (op.s) w.push(String(op.s));
        (op.ws || []).forEach(function (x) { w.push(String(x.s)); });
      }); });
      return w.join(' ').replace(/[^A-Za-zÀ-ÿ0-9]+/g, ' ').trim().split(' ').filter(Boolean);
    };
    const mo = docMaquetar(DOC_DEFS[k], D, docBloquesNuevos(DOC_DEFS[k], D));
    const a = tinta(mo), b2 = tinta(maq);
    const falta = a.filter(function (x) { return b2.indexOf(x) < 0; });
    /* De donde sale cada palabra que falta, para no adivinar. */
    const donde = [];
    mo.hojas.forEach(function (ops, h) { ops.forEach(function (op) {
      const t = (op.s || '') + ' ' + (op.ws || []).map(function (x) { return x.s; }).join(' ');
      falta.forEach(function (w) { if (t.indexOf(w) >= 0 && donde.length < 8) donde.push('h' + (h + 1) + ' ' + op.k + ': ' + t.slice(0, 70)); });
    }); });
    out[k] = { donde: donde, hojas: maq.n, ops: maq.hojas.reduce(function (s, o2) { return s + o2.length; }, 0),
               opsPorHoja: maq.hojas.map(function (o2) { return o2.length; }),
               tipos: tipos, palOrig: a.length, palNuevo: b2.length,
               nFaltan: falta.length, faltan: falta.slice(0, 15) };
  });
  return out;
});

/* ── A4 · las cinco convenciones, una por una ── */
R.conv = await S.ev(() => {
  const t = [
    'Un parrafo normal.',
    '',
    '• una vinieta',
    '• **Fuerte:** otra vinieta',
    '',
    '☐ Sí ☐ No  primera casilla',
    '☐ Sí ☐ No  segunda casilla',
    '',
    'Rotulo de la raya:',
    '________',
    '',
    'Un parrafo con **una palabra** en negrita.',
    '',
    'El firmante deja constancia de que el paciente ☐ sí ☐ no se encuentra capacitado.',
    '',
    '☐ Sí ☐ No  una sola casilla'
  ].join('\n');
  const bl = docmodTextoABloques(t);
  return { n: bl.length, bl: bl.map(function (b) {
    return { t: b.t, x: b.x, items: b.items, fuerte: b.fuerte,
             runs: b.runs ? b.runs.map(function (r) { return (r.b ? '**' : '') + r.s + (r.b ? '**' : ''); }) : undefined }; }) };
});

/* ── A5 · la declaracion de un propio ── */
R.A5 = await S.ev(() => {
  const D = docDatos();
  const m = docmodNuevo('consent');
  m.clave = 'pX'; m.nom = 'Mi consentimiento'; m.incl = false; m.propio = true;
  m.pregs[0].x = 'Esto es una prueba.';
  const bl = docmodArmar(m);
  const txt = bl.map(function (b) { return String(b.x || '') + ' ' + (b.items || []).join(' '); }).join(' ');
  const def = { clave: 'pX', menu: m.nom, tit: m.nom, sz: 10.2, lh: 13.4, hojas: 1,
                bloques: function () { return docmodArmar(m); } };
  const maq = docMaquetar(def, D, docBloquesNuevos(def, D));
  /* El de un INCLUIDO, para el control negativo: ese SI nombra su procedimiento. */
  const bi = DOC_DEFS.ete.bloques();
  const ti = bi.map(function (b) { return String(b.x || '') + ' ' + (b.items || []).join(' '); }).join(' ');
  return {
    bloques: bl.length, hojas: maq.n, ops: maq.hojas.reduce(function (a, o) { return a + o.length; }, 0),
    diceProc: txt.indexOf('en qué consiste el procedimiento') >= 0,
    diceAcuerdo: txt.indexOf('se me realice el procedimiento descrito en este documento') >= 0,
    noNombraEte: txt.indexOf('transesofágico') < 0,
    pregsImpresas: bl.filter(function (b) { return b.t === 'sec'; }).length,
    tfirmas: bl.filter(function (b) { return b.t === 'tfirmas'; }).length,
    pacid: bl.filter(function (b) { return b.t === 'pacid'; }).length,
    /* control negativo: el incluido conserva su procedimiento, palabra por palabra */
    inclDiceSuProc: ti.indexOf('en qué consiste un ecocardiograma transesofágico con sedación') >= 0,
    inclNoDiceDescrito: ti.indexOf('descrito en este documento') < 0
  };
});

/* ── A1 · el almacen: escritura, lectura, valor corrupto y clave desconocida ── */
R.A1 = await S.ev(() => {
  const o = {};
  const st = docmodLeer();
  o.vacio = { incl: Object.keys(st.incl).length, prop: st.prop.length, v: st.v };
  /* Editar la constancia y volver a leer. */
  st.incl.constancia.ed = { tit: 'CONSTANCIA', frase: true, txt: 'Texto propio de la institucion.',
                            decl: true, firmas: true, comunes: true };
  st.incl.cve.vis = false;
  o.escribio = docmodEscribir(st);
  const st2 = docmodLeer();
  o.releido = { edTxt: st2.incl.constancia.ed ? st2.incl.constancia.ed.txt : null,
                cveVis: st2.incl.cve.vis };
  const d = docmodDef('constancia');
  o.defEditada = { mismoObjeto: d === DOC_DEFS.constancia, menu: d.menu, sz: d.sz, lh: d.lh };
  const D = docDatos();
  const maq = docMaquetar(d, D, docBloquesNuevos(d, D));
  o.papelEditado = { hojas: maq.n, ops: maq.hojas.reduce(function (a, x) { return a + x.length; }, 0) };
  o.editado = docmodModelo('constancia').editado;
  o.visibles = docmodLista().filter(function (m) { return m.vis; }).map(function (m) { return m.clave; });
  /* Volver al original: el cuerpo vuelve a ser igual y el almacen vuelve a `ed: null`. */
  const st3 = docmodLeer(); st3.incl.constancia.ed = null; docmodEscribir(st3);
  o.trasVolver = { mismoObjeto: docmodDef('constancia') === DOC_DEFS.constancia,
                   editado: docmodModelo('constancia').editado };
  /* Valor corrupto y clave desconocida: el estado vacio, nunca una excepcion. */
  try { localStorage.setItem('ecosmart_doc_modelos', '{no es json'); } catch (e) {}
  o.corrupto = { incl: Object.keys(docmodLeer().incl).length, prop: docmodLeer().prop.length };
  o.valida = {
    desconocida: docmodValidar({ v: 1, incl: {}, prop: [], otra: 1 }, false).ok,
    versionMala: docmodValidar({ v: 9, incl: {}, prop: [] }, false).ok,
    inclAjena: docmodValidar({ v: 1, incl: { xx: { vis: true } }, prop: [] }, false).ok,
    tresPropios: docmodValidar({ v: 1, incl: {}, prop: [
      { clave: 'a', tipo: 'consent', nom: 'A', tit: 'A', pregs: [] },
      { clave: 'b', tipo: 'consent', nom: 'B', tit: 'B', pregs: [] },
      { clave: 'c', tipo: 'consent', nom: 'C', tit: 'C', pregs: [] }] }, false),
    nomLargo: docmodValidar({ v: 1, incl: {}, prop: [
      { clave: 'a', tipo: 'consent', nom: new Array(70).join('x'), tit: 'A', pregs: [] }] }, false).ok,
    numeroEnTexto: docmodValidar({ v: 1, incl: {}, prop: [
      { clave: 'a', tipo: 'consent', nom: 'A', tit: 'A', pregs: [{ t: 'x', x: 5 }] }] }, false).ok,
    sinMarca: docmodValidar({ v: 1, incl: {}, prop: [] }, true).ok,
    conMarca: docmodValidar({ _ecosmart_modelos: true, v: 1, incl: {}, prop: [] }, true).ok,
    buena: docmodValidar({ v: 1, incl: { constancia: { vis: false, nom: 'Otra', ed: null } }, prop: [] }, false).ok
  };
  try { localStorage.removeItem('ecosmart_doc_modelos'); } catch (e) {}
  return o;
});

console.log(JSON.stringify(R, null, 1));
await S.cerrar();
