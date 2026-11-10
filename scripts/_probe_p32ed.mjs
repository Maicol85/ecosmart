#!/usr/bin/env node
/**
 * _probe_p32ed.mjs - Partes C y D de PANT-32 (2026-11-10): el editor de modelos y los propios.
 *  C1 el editor en la misma pantalla, dos columnas desde 900 px y la vista previa al escribir.
 *  C2 que se edita: nombre, titulo, piezas con casilla, preguntas, bloques grises, texto plano.
 *  C3 pegar reemplaza. C4 volver al original. C5 guardar y cancelar. C6 el modelo se usa.
 *  D1 a D3 agregar un propio, su nombre y el tope de dos.
 * Nombre propio: verificado con ls, no existia.
 */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3400 });
const R = { file: FILE };
R.entrar = await S.entrar();
/* Las respuestas de confirm/prompt se deciden desde la sonda: con los dialogos nativos sin
   interceptar, el primero cuelga la pagina y la medicion no vuelve. */
await S.ev(() => {
  try { localStorage.removeItem('ecosmart_doc_modelos'); localStorage.removeItem('ecosmart_doc_boton'); } catch (e) {}
  window.__p32 = { confirm: [], prompt: [], alert: [], resp: true, texto: '' };
  window.confirm = function (m) { window.__p32.confirm.push(String(m)); return window.__p32.resp; };
  window.prompt = function (m, d) { window.__p32.prompt.push(String(m)); return window.__p32.texto; };
  window.alert = function (m) { window.__p32.alert.push(String(m)); };
  if (window.docmodArranque) docmodArranque();
  if (window.showTab) showTab('config');
  if (window.cfgOnShow) cfgOnShow();
  return 1;
});

/* ── C1 y C2 · abrir el editor de la cardioversion ── */
R.C2 = await S.ev(() => {
  cfgDocsEditar('cve');
  const ed = document.getElementById('cfg-docs-ed');
  const q = function (id) { return document.getElementById(id); };
  const pregs = Array.prototype.map.call(document.querySelectorAll('#cfg-docs-pregs .cdd-preg'), function (d) {
    const t = d.querySelector('[data-cdp-t]'), x = d.querySelector('[data-cdp-x]');
    return { t: t.value, largo: x.value.length, tag: x.tagName, vacia: !!d.querySelector('.cdd-vacia'),
             x: !!d.querySelector('[data-cdp-del]') };
  });
  return {
    visible: !ed.hidden,
    listaOculta: q('cfg-docs-lista').classList.contains('doc-oculto'),
    volver: !!q('cfg-docs-volver'),
    nom: q('cfg-docs-nom') ? q('cfg-docs-nom').value : null,
    tit: q('cfg-docs-tit') ? q('cfg-docs-tit').value : null,
    pregs: pregs.length, pregsDet: pregs,
    piezas: { decl: q('cfg-docs-pz-decl') ? q('cfg-docs-pz-decl').checked : null,
              firmas: q('cfg-docs-pz-firmas') ? q('cfg-docs-pz-firmas').checked : null,
              comunes: q('cfg-docs-pz-comunes') ? q('cfg-docs-pz-comunes').checked : null },
    grises: Array.prototype.map.call(ed.querySelectorAll('.cdd-fijo'), function (g) { return g.textContent.slice(0, 48); }),
    ayuda: (ed.querySelector('.cdd-ayuda') || {}).textContent,
    aviso: (ed.querySelector('.cdd-aviso') || {}).textContent,
    orig: !!q('cfg-docs-orig'), pegar: !!q('cfg-docs-pegar'),
    guardar: !!q('cfg-docs-guardar'), cancelar: !!q('cfg-docs-cancelar'),
    addPreg: !!q('cfg-docs-preg-add'),
    /* los campos son de TEXTO PLANO: ni un contenteditable en la columna izquierda */
    contentEditables: ed.querySelectorAll('.cdd-izq [contenteditable]').length
  };
});
await S.esperar(400);
R.C1prev = await S.ev(() => {
  const h = document.getElementById('cfg-docs-prev');
  const t = h.textContent || '';
  return { hay: h.children.length, largo: t.length,
           hojas: (document.getElementById('cfg-docs-prev-n') || {}).textContent,
           /* el paciente de la vista previa es ficticio */
           ficticio: t.indexOf('Paciente de Ejemplo') >= 0,
           sinEditar: h.querySelectorAll('[contenteditable]').length,
           /* la hoja es la del Informe: las mismas clases */
           clases: Array.prototype.slice.call(h.querySelectorAll('[class]')).map(function (e) { return e.className; })
             .filter(function (c, i, a) { return a.indexOf(c) === i; }).slice(0, 9) };
});

/* ── C1 · dos columnas desde 900 px ── */
R.C1cols = {};
for (const w of [1440, 1000, 768, 390]) {
  await S.viewport(w, 900); await S.esperar(200);
  R.C1cols[w] = await S.ev(() => {
    const c = document.querySelector('.cdd-cols');
    const i = document.querySelector('.cdd-izq').getBoundingClientRect();
    const d = document.querySelector('.cdd-der').getBoundingClientRect();
    return { dir: getComputedStyle(c).flexDirection, ladoALado: d.left >= i.right - 1,
             debajo: d.top >= i.bottom - 1,
             scrollH: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth) };
  });
}
await S.viewport(1440, 900); await S.esperar(150);

/* ── C2 · escribir y ver la vista previa cambiar ── */
R.C2esc = await S.ev(() => {
  const ta = document.querySelector('[data-cdp-x="0"]');
  const antes = (document.getElementById('cfg-docs-prev').textContent || '');
  ta.value = 'Texto NUEVO de la institucion para la prueba.';
  ta.dispatchEvent(new Event('input', { bubbles: true }));
  return { antes: antes.indexOf('Texto NUEVO') >= 0, largoAntes: antes.length };
});
await S.esperar(400);
R.C2esc2 = await S.ev(() => {
  const t = document.getElementById('cfg-docs-prev').textContent || '';
  return { ahora: t.indexOf('Texto NUEVO') >= 0, editado: _cdEd.m.pregs[0].x.slice(0, 20),
           /* un bloque de texto que parece HTML se ve como TEXTO */
           html: (function () {
             const ta = document.querySelector('[data-cdp-x="1"]');
             ta.value = '<b>ojo</b> <script>alert(1)</script>';
             ta.dispatchEvent(new Event('input', { bubbles: true }));
             return 1; })() };
});
await S.esperar(400);
R.C2html = await S.ev(() => {
  const h = document.getElementById('cfg-docs-prev');
  return { texto: (h.textContent || '').indexOf('<b>ojo</b>') >= 0,
           bEnLaHoja: h.querySelectorAll('b').length, scripts: h.querySelectorAll('script').length };
});

/* ── C5 · cancelar con cambios pregunta ── */
R.C5 = await S.ev(() => {
  window.__p32.confirm = []; window.__p32.resp = false;
  document.getElementById('cfg-docs-cancelar').click();
  const quedo = !document.getElementById('cfg-docs-ed').hidden;
  window.__p32.resp = true;
  document.getElementById('cfg-docs-cancelar').click();
  const salio = document.getElementById('cfg-docs-ed').hidden;
  return { preguntas: window.__p32.confirm.slice(), quedoAlDecirNo: quedo, salioAlDecirSi: salio,
           listaVuelve: !document.getElementById('cfg-docs-lista').classList.contains('doc-oculto'),
           /* nada se guardo */
           sigueSinEditar: !docmodModelo('cve').editado };
});

/* ── C4 · volver al texto original, y C5 guardar ── */
R.C4 = await S.ev(() => {
  cfgDocsEditar('cve');
  const ta = document.querySelector('[data-cdp-x="0"]');
  ta.value = 'Esto lo escribio la institucion.';
  ta.dispatchEvent(new Event('input', { bubbles: true }));
  window.__p32.confirm = []; window.__p32.resp = true;
  document.getElementById('cfg-docs-orig').click();
  const tras = document.querySelector('[data-cdp-x="0"]').value;
  return { pregunta: window.__p32.confirm.slice(),
           volvio: tras.indexOf('La cardioversión eléctrica es un tratamiento') === 0,
           /* todavia NO se guardo: recien «Guardar» lo deja */
           sigueSinEditar: !docmodModelo('cve').editado };
});
R.C5g = await S.ev(() => {
  /* Guardar el original cargado deja `ed: null`: la regla de oro. */
  document.getElementById('cfg-docs-guardar').click();
  const st = docmodLeer();
  const d = docmodDef('cve');
  return { ed: st.incl.cve.ed, editado: docmodModelo('cve').editado,
           mismoObjeto: d === DOC_DEFS.cve, cerro: document.getElementById('cfg-docs-ed').hidden };
});

/* ── C6 · un incluido editado se usa al abrirlo desde el Informe ── */
R.C6 = await S.ev(() => {
  cfgDocsEditar('cve');
  const ta = document.querySelector('[data-cdp-x="0"]');
  ta.value = 'La cardioversion electrica es un tratamiento, y esta frase la escribio la institucion.';
  ta.dispatchEvent(new Event('input', { bubbles: true }));
  document.getElementById('cfg-docs-guardar').click();
  const st = docmodLeer();
  const d = docmodDef('cve');
  const D = docDatos();
  const maq = docMaquetar(d, D, docBloquesNuevos(d, D));
  const tinta = [];
  maq.hojas.forEach(function (ops) { ops.forEach(function (o) {
    if (o.s) tinta.push(o.s); (o.ws || []).forEach(function (w) { tinta.push(w.s); }); }); });
  const t = tinta.join(' ');
  /* Abrir desde el Informe y mirar la hoja. */
  if (window.showTab) showTab('informe');
  docAbrir('cve');
  const hoja = (document.getElementById('doc-hoja').textContent || '');
  const abierta = !document.getElementById('doc-ov').hidden;
  docCerrar();
  return { guardado: !!st.incl.cve.ed, editado: docmodModelo('cve').editado,
           mismoObjeto: d === DOC_DEFS.cve, tit: d.tit, menu: d.menu,
           papelLoDice: t.indexOf('institución') >= 0 || t.indexOf('institucion') >= 0,
           hojas: maq.n, ops: maq.hojas.reduce(function (a, o) { return a + o.length; }, 0),
           hojaAbierta: abierta, hojaLoDice: hoja.indexOf('escribio la institucion') >= 0,
           /* los OTROS TRES siguen intactos: la regla de oro por documento */
           otros: ['constancia', 'ete', 'burb'].map(function (k) {
             const dd = docmodDef(k);
             const m2 = docMaquetar(dd, D, docBloquesNuevos(dd, D));
             return k + ':' + (dd === DOC_DEFS[k] ? 'mismo' : 'OTRO') + ':' + m2.n + '/' +
               m2.hojas.reduce(function (a, o) { return a + o.length; }, 0); }) };
});

/* ── C3 · pegar reemplaza ── */
R.C3 = await S.ev(() => {
  if (window.showTab) showTab('config');
  cfgDocsEditar('ete');
  const n0 = document.querySelectorAll('#cfg-docs-pregs .cdd-preg').length;
  document.getElementById('cfg-docs-pegar').click();
  const abierto = !document.getElementById('cfg-docs-peg').hidden;
  document.getElementById('cfg-docs-peg-txt').value = 'Un solo bloque de texto de la institucion.\n\nCon dos parrafos.';
  document.getElementById('cfg-docs-peg-ok').click();
  const pregs = Array.prototype.map.call(document.querySelectorAll('#cfg-docs-pregs .cdd-preg'), function (d) {
    return { t: d.querySelector('[data-cdp-t]').value, x: d.querySelector('[data-cdp-x]').value.slice(0, 30) }; });
  return { n0: n0, cuadro: abierto, cerro: document.getElementById('cfg-docs-peg').hidden,
           pregs: pregs };
});
R.C3sal = await S.ev(() => {
  window.__p32.resp = true;
  document.getElementById('cfg-docs-volver').click();
  return { cerro: document.getElementById('cfg-docs-ed').hidden, eteSinEditar: !docmodModelo('ete').editado };
});

/* ── D1 a D3 · un propio ── */
R.D1 = await S.ev(() => {
  document.getElementById('cfg-docs-add').click();
  const pre = !document.getElementById('cfg-docs-tipo').hidden;
  const bts = Array.prototype.map.call(document.querySelectorAll('#cfg-docs-tipo button'), function (b) {
    return b.textContent.trim() + ' ' + Math.round(b.getBoundingClientRect().height); });
  document.querySelectorAll('#cfg-docs-tipo button')[1].click();   // Consentimiento
  const pregs = Array.prototype.map.call(document.querySelectorAll('#cfg-docs-pregs .cdd-preg'), function (d) {
    return { t: d.querySelector('[data-cdp-t]').value, vacia: !!d.querySelector('.cdd-vacia') }; });
  return { pregunta: pre, botones: bts,
           tit: document.getElementById('cfg-docs-tit').value,
           sinNombre: !document.getElementById('cfg-docs-nom'),
           pregs: pregs,
           piezas: ['decl', 'firmas', 'comunes'].map(function (k) {
             return k + '=' + document.getElementById('cfg-docs-pz-' + k).checked; }) };
});
R.D2 = await S.ev(() => {
  const o = {};
  document.querySelector('[data-cdp-x="0"]').value = 'Es una prueba de documento propio.';
  document.querySelector('[data-cdp-x="0"]').dispatchEvent(new Event('input', { bubbles: true }));
  /* nombre vacio: no se acepta */
  window.__p32.texto = '   '; window.__p32.alert = []; window.__p32.prompt = [];
  document.getElementById('cfg-docs-guardar').click();
  o.vacio = { prompt: window.__p32.prompt.slice(), alert: window.__p32.alert.slice(),
              sigueAbierto: !document.getElementById('cfg-docs-ed').hidden,
              propios: docmodLeer().prop.length };
  window.__p32.texto = 'Mi consentimiento propio';
  document.getElementById('cfg-docs-guardar').click();
  const st = docmodLeer();
  o.guardado = { propios: st.prop.length, clave: st.prop[0] ? st.prop[0].clave : null,
                 nom: st.prop[0] ? st.prop[0].nom : null, tipo: st.prop[0] ? st.prop[0].tipo : null,
                 vis: st.prop[0] ? st.prop[0].vis : null, cerro: document.getElementById('cfg-docs-ed').hidden };
  o.lista = Array.prototype.map.call(document.querySelectorAll('#cfg-docs-lista .cfgdoc-fila'), function (f) {
    return f.querySelector('.cfgdoc-nom').textContent + ' [' +
      Array.prototype.map.call(f.querySelectorAll('.cfgdoc-tag'), function (t) { return t.textContent; }).join(',') +
      '] del=' + !!f.querySelector('[data-cd-del]'); });
  o.cupo = document.getElementById('cfg-docs-cupo').textContent;
  o.menu = (function () { docmodMenuRender();
    return Array.prototype.map.call(document.querySelectorAll('#doc-menu [data-doc-k]'), function (b) {
      return b.getAttribute('data-doc-k'); }); })();
  return o;
});
R.D3 = await S.ev(() => {
  const o = {};
  /* segundo propio: una constancia */
  document.getElementById('cfg-docs-add').click();
  document.querySelectorAll('#cfg-docs-tipo button')[0].click();   // Constancia
  o.esConstancia = { frase: !!document.getElementById('cfg-docs-frase'),
                     txt: (document.getElementById('cfg-docs-txt') || {}).value,
                     sinPregs: !document.getElementById('cfg-docs-pregs') };
  window.__p32.texto = 'Mi constancia propia';
  document.getElementById('cfg-docs-guardar').click();
  o.dos = { propios: docmodLeer().prop.length, cupo: document.getElementById('cfg-docs-cupo').textContent,
            addDesact: !!document.getElementById('cfg-docs-add').disabled };
  /* el tercero: el boton esta desactivado, y aunque se llame a la funcion no entra */
  window.__p32.alert = [];
  cfgDocsAgregar();
  o.tercero = { alert: window.__p32.alert.slice(), tipoAbierto: !document.getElementById('cfg-docs-tipo').hidden,
                propios: docmodLeer().prop.length };
  /* borrar uno libera el cupo */
  window.__p32.confirm = []; window.__p32.resp = true;
  cfgDocsBorrar(docmodLeer().prop[0].clave);
  o.borrado = { pregunta: window.__p32.confirm.slice(), propios: docmodLeer().prop.length,
                cupo: document.getElementById('cfg-docs-cupo').textContent,
                addDesact: !!document.getElementById('cfg-docs-add').disabled,
                menu: Array.prototype.map.call(document.querySelectorAll('#doc-menu [data-doc-k]'), function (b) {
                  return b.getAttribute('data-doc-k'); }) };
  return o;
});

console.log(JSON.stringify(R, null, 1));
await S.cerrar();
