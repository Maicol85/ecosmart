#!/usr/bin/env node
/**
 * _probe_p33bl.mjs - PANT-33, PARTE C. Los dos documentos en blanco:
 *   1 la lista de SEIS filas y el menu del Informe con sus seis entradas.
 *   2 el contenido: encabezado, fecha, cuerpo vacio con su texto gris, firma opcional, y NADA
 *     mas -- sin titulo, sin linea del paciente, sin declaracion, sin tabla de firmas-.
 *   3 el nombre personalizado: menu, lista y nombre de la miniatura.
 *   4 «Vaciar».
 *   5 la casilla de firma en Configuracion y en el Informe.
 *   6 la impresion: texto corto, largo y vacio, y la firma que NUNCA queda sola en una hoja.
 *   7 el pegado de un texto largo como texto simple.
 * ⚠️ El Enter va como escribir('\r'): el `tecla` del arnes no inserta parrafo (ver _probe_p33lin).
 */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3400 });
const R = {};
await S.entrar();
await S.viewport(1440, 900);
await S.ev(() => {
  try {
    localStorage.setItem('ett_centros', JSON.stringify(['GREMEDA']));
    localStorage.setItem('ett_centro_principal', 'GREMEDA');
    localStorage.setItem('ett_medicos', JSON.stringify([{ nombre: 'Dra. Ficticia Perez', matricula: '12345', especialidad: 'Cardiologia' }]));
    localStorage.setItem('ett_medico_principal', '0');
    localStorage.removeItem('ecosmart_doc_modelos');
  } catch (e) {}
  const set = (id, v) => { const e = document.getElementById(id); if (!e) return false;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); return true; };
  set('cfg-med-lugar', 'Artigas'); set('nombre', 'Perez, Maria'); set('ci', '1.111.111-1'); set('sexo', 'F');
  if (window.showTab) showTab('config');
  if (typeof cfgOnShow === 'function') cfgOnShow();
  return true;
});

/* ── 1 · la lista y el menu ── */
R.lista = await S.ev(() => {
  const li = document.getElementById('cfg-docs-lista');
  return { filas: Array.prototype.map.call(li.querySelectorAll('.cfgdoc-fila'), function (f) {
      return [f.querySelector('.cfgdoc-nom').textContent,
              Array.prototype.map.call(f.querySelectorAll('.cfgdoc-tag'), function (t) { return t.textContent; }).join('+'),
              !!f.querySelector('[data-cd-vis]').checked]; }),
    menu: Array.prototype.map.call(document.getElementById('doc-menu').querySelectorAll('[data-doc-k]'),
      function (b) { return [b.getAttribute('data-doc-k'), b.textContent]; }) };
});

/* ── 2 · el contenido de un blanco, en el papel y en la pantalla ── */
R.contenido = await S.ev(() => {
  const D = docDatos();
  const def = docmodDef('b1');
  const bl = docBloquesNuevos(def, D);
  const maq = docMaquetar(def, D, bl);
  const tipos = {}; bl.forEach(function (b) { tipos[b.t] = (tipos[b.t] || 0) + 1; });
  /* sin firma */
  const m2 = { tipo: 'blanco', txt: '', firma: false };
  const bl2 = docmodArmar(m2);
  const def2 = { clave: 'b1', menu: 'x', tit: 'x', sz: 10.2, lh: 13.4, hojas: 1, bloques: function () { return bl2; } };
  const maq2 = docMaquetar(def2, D, docSustBloques(bl2, D, 0));
  return { tipos: tipos, hojas: maq ? maq.n : null, sz: def.sz, lh: def.lh, tit: def.tit, menu: def.menu,
           ops: maq ? maq.hojas.reduce(function (a, o) { return a + o.length; }, 0) : null,
           sinFirma: { tipos: bl2.map(function (b) { return b.t; }), hojas: maq2 ? maq2.n : null,
                       ops: maq2 ? maq2.hojas.reduce(function (a, o) { return a + o.length; }, 0) : null } };
});

/* ── 3 · abrir el editor de un blanco ── */
R.editor = await S.ev(() => {
  cfgDocsEditar('b1');
  const h = document.getElementById('doc-hoja');
  const ed = h.querySelector('[data-doc-cuerpo]');
  const vis = function (id) { const e = document.getElementById(id);
    return e ? !e.classList.contains('doc-oculto') : null; };
  const r = ed.getBoundingClientRect();
  return { tit: document.getElementById('doc-ov-tit').textContent,
    frase: vis('cfg-doc-frase-wrap'), firmam: vis('cfg-doc-firmam-wrap'), orig: vis('doc-mod-orig'),
    vaciar: vis('doc-mod-vaciar'), nom: vis('cfg-doc-nom-wrap'),
    nomValor: document.getElementById('cfg-doc-nom').value,
    firmaTildada: document.getElementById('cfg-doc-firmam').checked,
    /* lo que se ve en la hoja: NADA de titulo, paciente, declaracion ni tabla de firmas */
    enc: h.querySelectorAll('.doc-enc').length, cf: h.querySelectorAll('.doc-cf').length,
    titulos: h.querySelectorAll('.doc-tit,.doc-sub').length,
    pacid: h.querySelectorAll('.doc-pacid').length, tf: h.querySelectorAll('.doc-tf').length,
    firma: h.querySelectorAll('.doc-firma').length,
    secciones: h.querySelectorAll('.doc-sec').length,
    cuerpoVacio: ed.classList.contains('doc-ed-ph'),
    ph: getComputedStyle(ed, '::before').content,
    editables: h.querySelectorAll('[contenteditable="true"]').length,
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) } };
});

/* ── 4 · escribir un texto, ponerle nombre y guardar ── */
await S.clic(R.editor.rect.x + 40, R.editor.rect.y + 12);
await S.escribir('## Informe de asistencia');
await S.escribir('\r');
await S.escribir('Se deja constancia de lo actuado.');
await S.esperar(150);
await S.ev(() => { const n = document.getElementById('cfg-doc-nom');
  n.value = 'Pase a emergencia'; n.dispatchEvent(new Event('input', { bubbles: true })); return true; });
R.guardado = await S.ev(() => {
  const antes = document.getElementById('doc-mod-guardar').disabled;
  docmodEdGuardar();
  const st = docmodLeer();
  return { botonAntes: antes, estado: document.getElementById('doc-estado').textContent,
           botonDespues: document.getElementById('doc-mod-guardar').disabled,
           abierta: !document.getElementById('doc-ov').hidden,
           enDisco: st.blanco.b1, titDelPdf: docmodDef('b1').tit,
           /* el nombre en la LISTA y en el MENU */
           lista: Array.prototype.map.call(document.getElementById('cfg-docs-lista').querySelectorAll('.cfgdoc-nom'),
             function (e) { return e.textContent; }),
           menu: Array.prototype.map.call(document.getElementById('doc-menu').querySelectorAll('[data-doc-k]'),
             function (b) { return b.textContent; }) };
});

/* ── 5 · la impresion: corto, largo y vacio; la firma nunca sola ── */
R.papel = await S.ev(() => {
  const D = docDatos();
  const mide = function (txt, firma) {
    const m = { tipo: 'blanco', txt: txt, firma: firma };
    const bl = docmodArmar(m);
    const def = { clave: 'b1', menu: 'x', tit: 'Pase a emergencia', sz: 10.2, lh: 13.4, hojas: 1,
                  bloques: function () { return bl; } };
    const maq = docMaquetar(def, D, docSustBloques(bl, D, 0));
    if (!maq) return null;
    /* ¿en que hoja cae la firma, y hay algo de texto en esa hoja? */
    let hFirma = -1;
    maq.hojas.forEach(function (ops, i) {
      ops.forEach(function (o) { if (o.k === 'l' && o.x2 !== undefined && Math.abs((o.x2 - o.x1) - 62) < 0.6) hFirma = i; });
    });
    const textoEnHojaFirma = (hFirma < 0) ? null : maq.hojas[hFirma].filter(function (o) {
      return (o.k === 't' || o.k === 'tw') && o.y < 270 && o.sz > 8; }).length;
    return { hojas: maq.n, hojaDeLaFirma: hFirma, textoEnEsaHoja: textoEnHojaFirma,
             ops: maq.hojas.reduce(function (a, o) { return a + o.length; }, 0) };
  };
  const parrafo = 'Este es un parrafo de prueba con suficiente texto para que el maquetador tenga que envolverlo en varias lineas y asi llenar la hoja de a poco. ';
  const largo = [];
  for (let i = 0; i < 26; i++) largo.push(parrafo + '(' + (i + 1) + ')');
  /* el borde: justo el largo que deja la firma sin lugar */
  const casi = [];
  for (let i = 0; i < 14; i++) casi.push(parrafo + '(' + (i + 1) + ')');
  return { vacioSinFirma: mide('', false), vacioConFirma: mide('', true),
           corto: mide('Un renglon corto.', true),
           casi: mide(casi.join('\n\n'), true),
           largo: mide(largo.join('\n\n'), true) };
});

/* ── 6 · en el INFORME: la hoja, la casilla de firma y el pegado ── */
R.informe = await S.ev(() => {
  docmodEdSalir();
  if (window.showTab) showTab('informe');
  docAbrir('b1');
  const h = document.getElementById('doc-hoja');
  const ed = h.querySelector('[data-doc-cuerpo]');
  const vis = function (id) { const e = document.getElementById(id);
    return e ? !e.classList.contains('doc-oculto') : null; };
  return { tit: document.getElementById('doc-ov-tit').textContent,
    accInforme: vis('doc-acc-informe'), accModelo: vis('doc-acc-modelo'),
    casillaFirma: vis('cfg-doc-firma-wrap'), tildada: document.getElementById('cfg-doc-firma').checked,
    texto: ed ? ed.innerText : null, firma: h.querySelectorAll('.doc-firma').length,
    editable: !!(ed && ed.isContentEditable),
    secEnPantalla: h.querySelectorAll('.doc-ed-sec').length };
});
R.destildar = await S.ev(() => {
  const c = document.getElementById('cfg-doc-firma');
  c.checked = false; c.dispatchEvent(new Event('change', { bubbles: true }));
  const h = document.getElementById('doc-hoja');
  const D = docDatosHoja();
  const maq = docMaquetar(docDefActual(), D, docBloquesHoja('b1', D));
  const st = docmodLeer();
  return { firmaEnPantalla: h.querySelectorAll('.doc-firma').length,
           hojas: maq ? maq.n : null,
           firmaEnPapel: maq ? maq.hojas[0].filter(function (o) { return o.k === 'l' && o.x2 !== undefined && Math.abs((o.x2 - o.x1) - 62) < 0.6; }).length : null,
           modeloIntacto: st.blanco.b1.firma === true, textoIntacto: _docEst.b1.txt.length > 0 };
});
R.errs = S.errs.slice(0, 12);
console.log(JSON.stringify(R, null, 1));
S.cerrar(); process.exit(0);
