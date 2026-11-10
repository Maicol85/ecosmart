#!/usr/bin/env node
/**
 * _probe_p33ed.mjs - PANT-33, PARTE B. El editor SOBRE LA HOJA, con teclado real por CDP:
 *   1 «Editar» abre la hoja grande, con las partes fijas no editables y el cuerpo editable.
 *   2 la ida y vuelta de las convenciones: el texto del incluido vuelve IGUAL.
 *   3 edicion real: escribir, borrar todo y rehacer de cero, y pegar como texto simple.
 *   4 «Guardar como modelo», el boton que se apaga, y el cambio visible desde el Informe.
 *   5 «Volver al texto original» y los dos cierres -- con y sin cambios-, Escape y clic afuera.
 *   6 B7: lo que se edita en la hoja del INFORME no toca el modelo.
 */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3400 });
const R = {};
R.entrar = await S.entrar();
await S.viewport(1440, 900);
await S.ev(() => {
  try {
    localStorage.setItem('ett_centros', JSON.stringify(['GREMEDA']));
    localStorage.setItem('ett_centro_principal', 'GREMEDA');
    localStorage.setItem('ett_medicos', JSON.stringify([{ nombre: 'Dra. Ficticia Perez', matricula: '12345', especialidad: 'Cardiologia' }]));
    localStorage.setItem('ett_medico_principal', '0');
    localStorage.setItem('ecosmart_doc_modelos', JSON.stringify({ v: 1, incl: {
      constancia: { vis: true, nom: '', ed: null }, cve: { vis: true, nom: '', ed: null },
      ete: { vis: true, nom: '', ed: null }, burb: { vis: true, nom: '', ed: null } }, prop: [] }));
  } catch (e) {}
  const set = (id, v) => { const e = document.getElementById(id); if (!e) return false;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); return true; };
  set('cfg-med-lugar', 'Artigas');
  if (window.showTab) showTab('config');
  if (typeof cfgOnShow === 'function') cfgOnShow();
  return true;
});

/* ── 1 · la ida y vuelta de las convenciones, en los cuatro ── */
R.idaYVuelta = await S.ev(() => {
  const pal = function (s) { return String(s).split(/\s+/).filter(Boolean); };
  const out = {};
  ['constancia', 'cve', 'ete', 'burb'].forEach(function (k) {
    const o = docmodOrig(k);
    const txt = docmodModeloATexto(o);
    const m2 = { tipo: o.tipo, tit: o.tit, frase: o.frase, decl: true, firmas: true, comunes: true };
    docmodTextoAModelo(m2, txt);
    const txt2 = docmodModeloATexto(m2);
    /* el control de verdad: los bloques que el maquetador recibe, con el modelo reconstruido */
    const bl1 = docmodArmar(Object.assign({ clave: k, incl: true }, o));
    const bl2 = docmodArmar(Object.assign({ clave: k, incl: true }, m2));
    const firma = function (bs) { return JSON.stringify(bs.map(function (b) {
      return [b.t, b.x || '', (b.items || []).join('§'), (b.runs || []).map(function (r) { return (r.b ? '*' : '') + r.s; }).join('§')]; })); };
    out[k] = { texto: txt.length, textoVuelta: txt2.length, textoIgual: txt === txt2,
               palabras: pal(txt).length, palabrasVuelta: pal(txt2).length,
               bloques: bl1.length, bloquesVuelta: bl2.length, bloquesIguales: firma(bl1) === firma(bl2),
               secciones: (txt.match(/^## /gm) || []).length };
  });
  return out;
});

/* ── 2 · abrir el editor de la constancia ── */
R.abrir = await S.ev(() => {
  cfgDocsEditar('constancia');
  const ov = document.getElementById('doc-ov');
  const h = document.getElementById('doc-hoja');
  const ed = h.querySelector('[data-doc-cuerpo]');
  const tt = h.querySelector('[data-doc-tit]');
  const vis = function (id) { const e = document.getElementById(id);
    return e ? !e.classList.contains('doc-oculto') : null; };
  const r = ed ? ed.getBoundingClientRect() : null;
  return { overlay: !ov.hidden, modo: _docModo, tit: document.getElementById('doc-ov-tit').textContent,
    accInforme: vis('doc-acc-informe'), accModelo: vis('doc-acc-modelo'),
    frase: vis('cfg-doc-frase-wrap'), orig: vis('doc-mod-orig'), vaciar: vis('doc-mod-vaciar'),
    nomWrap: vis('cfg-doc-nom-wrap'),
    guardarApagado: document.getElementById('doc-mod-guardar').disabled,
    zoom: h.style.zoom, anchoHoja: Math.round(h.getBoundingClientRect().width),
    cuerpoEditable: !!(ed && ed.isContentEditable), tituloEditable: !!(tt && tt.isContentEditable),
    tituloTxt: tt ? tt.textContent : null,
    /* las partes FIJAS: ni una con contenteditable */
    fijosEditables: Array.prototype.filter.call(h.querySelectorAll('.doc-enc,.doc-cf,.doc-firma,.doc-pacid,.doc-tf,.doc-p,.doc-sec,.doc-chk,.doc-ul'),
      function (e) { return e.isContentEditable; }).length,
    editablesTotal: h.querySelectorAll('[contenteditable="true"]').length,
    cuerpoRect: r ? { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } : null,
    lineas: ed ? ed.children.length : null,
    texto: ed ? ed.innerText : null
  };
});

/* ── 3 · escribir de verdad: borrar todo y rehacer de cero ── */
if (R.abrir.cuerpoRect) {
  await S.clic(R.abrir.cuerpoRect.x + 40, R.abrir.cuerpoRect.y + 10);
  await S.ev(() => { const el = document.querySelector('[data-doc-cuerpo]');
    const sel = window.getSelection(); const r = document.createRange();
    r.selectNodeContents(el); sel.removeAllRanges(); sel.addRange(r); return true; });
  await S.tecla('Backspace');
  await S.esperar(120);
  R.trasBorrar = await S.ev(() => {
    const el = document.querySelector('[data-doc-cuerpo]');
    return { txt: _cdEd.txt, vacio: el.classList.contains('doc-ed-ph'),
             ph: getComputedStyle(el, '::before').content,
             guardar: !document.getElementById('doc-mod-guardar').disabled };
  });
  await S.escribir('## Lo que certifico');
  await S.escribir('\r');
  await S.escribir('Primer parrafo con **negrita** adentro.');
  await S.escribir('\r');
  await S.escribir('• una vinieta');
  await S.escribir('\r');
  await S.escribir('☐ Sí ☐ No una casilla');
  await S.esperar(200);
  R.trasEscribir = await S.ev(() => {
    const el = document.querySelector('[data-doc-cuerpo]');
    const cls = Array.prototype.map.call(el.children, function (d) { return d.className; });
    const bl = docmodTextoABloques(_cdEd.txt);
    return { txt: _cdEd.txt, clases: cls, bloques: bl.map(function (b) { return b.t; }),
             guardar: !document.getElementById('doc-mod-guardar').disabled,
             negEnBloque: JSON.stringify((bl.filter(function (b) { return b.t === 'pr'; })[0] || {}).runs || null) };
  });
  /* al salir del cuerpo se repinta: la negrita se ve */
  await S.ev(() => { document.getElementById('doc-mod-ayuda').focus(); return true; });
  await S.esperar(150);
  R.trasSalir = await S.ev(() => {
    const el = document.querySelector('[data-doc-cuerpo]');
    return { negritas: el.querySelectorAll('b').length,
             textoDeLaNegrita: (el.querySelector('b') || {}).textContent,
             innerTextIgual: docmodEdLeerCuerpo(el) === _cdEd.txt };
  });
}

/* ── 4 · guardar el modelo y verlo desde el Informe ── */
R.guardar = await S.ev(() => {
  docmodEdGuardar();
  const st = docmodLeer();
  return { estado: document.getElementById('doc-estado').textContent,
           botonApagado: document.getElementById('doc-mod-guardar').disabled,
           hojaSigueAbierta: !document.getElementById('doc-ov').hidden,
           edNoNull: st.incl.constancia.ed !== null,
           tit: st.incl.constancia.ed ? st.incl.constancia.ed.tit : null,
           txt: st.incl.constancia.ed ? st.incl.constancia.ed.txt : null,
           /* el papel del modelo guardado */
           hojasYOps: (function () { const def = docmodDef('constancia');
             const D = docDatos(); const maq = docMaquetar(def, D, docBloquesNuevos(def, D));
             return maq ? [maq.n, maq.hojas.reduce(function (a, o) { return a + o.length; }, 0)] : null; })(),
           mismoObjeto: docmodDef('constancia') === DOC_DEFS.constancia };
});
R.enElInforme = await S.ev(() => {
  docmodEdSalir();
  if (window.showTab) showTab('informe');
  docAbrir('constancia');
  const h = document.getElementById('doc-hoja');
  return { modo: _docModo, accInforme: !document.getElementById('doc-acc-informe').classList.contains('doc-oculto'),
           accModelo: !document.getElementById('doc-acc-modelo').classList.contains('doc-oculto'),
           texto: h.innerText.indexOf('Lo que certifico') >= 0,
           negrita: h.querySelectorAll('b').length,
           sinMarcas: h.innerText.indexOf('## ') < 0 && h.innerText.indexOf('**') < 0 };
});

/* ── 5 · B7: editar la hoja del Informe no toca el modelo ── */
R.b7 = await S.ev(() => {
  const st0 = JSON.stringify(docmodLeer());
  const p = document.querySelector('#doc-hoja .doc-p[data-doc-i]');
  if (!p) return { err: 'sin parrafo editable' };
  p.innerText = 'Corregido solo para este paciente.';
  p.dispatchEvent(new Event('input', { bubbles: true }));
  const st1 = JSON.stringify(docmodLeer());
  return { modeloIntacto: st0 === st1, editado: _docEst.constancia.editado };
});

/* ── 6 · los dos cierres, Escape y el clic afuera ── */
R.cierres = await S.ev(() => {
  docCerrar();
  if (window.showTab) showTab('config');
  cfgDocsEditar('cve');
  const sinCambios = { conf: document.getElementById('doc-conf').hidden };
  docmodEdCerrar();
  sinCambios.cerroDirecto = document.getElementById('doc-ov').hidden;
  cfgDocsEditar('cve');
  _cdEd.txt = _cdEd.txt + '\nalgo nuevo';
  docmodEdCerrar();
  const conCambios = { pregunta: !document.getElementById('doc-conf').hidden,
                       txt: document.getElementById('doc-conf-txt').textContent,
                       ok: document.getElementById('doc-conf-ok').textContent,
                       seguir: document.getElementById('doc-conf-seguir').textContent,
                       foco: document.activeElement.id };
  docConfCerrar();
  conCambios.sigueAbierta = !document.getElementById('doc-ov').hidden;
  conCambios.focoTrasSeguir = document.activeElement.id;
  /* el clic afuera NO cierra */
  docCerrarPreguntando();
  conCambios.clicAfueraNoCierra = !document.getElementById('doc-ov').hidden;
  return { sinCambios: sinCambios, conCambios: conCambios };
});
/* Escape con cambios: pregunta; Escape sobre la pregunta: seguir editando */
await S.tecla('Escape');
await S.esperar(120);
R.escape = await S.ev(() => ({ pregunta: !document.getElementById('doc-conf').hidden,
                               hoja: !document.getElementById('doc-ov').hidden }));
await S.tecla('Escape');
await S.esperar(120);
R.escape2 = await S.ev(() => ({ pregunta: !document.getElementById('doc-conf').hidden,
                                hoja: !document.getElementById('doc-ov').hidden }));
R.salirSinGuardar = await S.ev(() => {
  const st0 = JSON.stringify(docmodLeer());
  docmodEdCerrar();
  docConfAceptar();
  const st1 = JSON.stringify(docmodLeer());
  return { cerro: document.getElementById('doc-ov').hidden, almacenIntacto: st0 === st1,
           modo: _docModo, cdEd: _cdEd };
});

/* ── 7 · «Volver al texto original» ── */
R.original = await S.ev(() => {
  cfgDocsEditar('burb');
  const t0 = _cdEd.txt;
  _cdEd.txt = 'Texto de la institucion.';
  docmodEdGuardar();
  const edTrasGuardar = docmodLeer().incl.burb.ed !== null;
  docmodEdOriginal();
  const pregunta = document.getElementById('doc-conf-txt').textContent;
  const ok = document.getElementById('doc-conf-ok').textContent;
  docConfAceptar();
  const volvio = _cdEd.txt === t0;
  const edAntesDeGuardar = docmodLeer().incl.burb.ed !== null;
  docmodEdGuardar();
  const edDespues = docmodLeer().incl.burb.ed;
  return { edTrasGuardar: edTrasGuardar, pregunta: pregunta, ok: ok, volvio: volvio,
           edAntesDeGuardar: edAntesDeGuardar, edNull: edDespues === null,
           mismoObjeto: docmodDef('burb') === DOC_DEFS.burb,
           estado: document.getElementById('doc-estado').textContent };
});
R.errs = S.errs.slice(0, 12);
console.log(JSON.stringify(R, null, 1));
S.cerrar(); process.exit(0);
