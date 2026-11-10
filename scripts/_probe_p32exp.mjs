#!/usr/bin/env node
/**
 * _probe_p32exp.mjs - Parte E de PANT-32 (2026-11-10): exportar e importar modelos.
 *  E1 los dos botones y la linea.
 *  E2 el archivo: nombre, marca, version y SOLO textos y opciones.
 *  E3 la validacion ANTES de cargar nada, con sus dos mensajes y los topes.
 *  E4 la confirmacion y el reemplazo.
 *  Ida y vuelta completa, archivo ajeno, danado, con tres propios y con texto que parece HTML.
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
    localStorage.setItem('centro_nombre_activo', 'Centro Ficticio de Cardiologia del Norte');
    localStorage.setItem('ett_medicos', JSON.stringify([{ nombre: 'Dra. Ficticia Perez', matricula: '12345', especialidad: 'Cardiologia' }]));
    localStorage.setItem('ett_medico_principal', '0');
  } catch (e) {}
  window.__p32 = { confirm: [], alert: [], resp: true, bajadas: [] };
  window.confirm = function (m) { window.__p32.confirm.push(String(m)); return window.__p32.resp; };
  window.alert = function (m) { window.__p32.alert.push(String(m)); };
  /* La descarga se intercepta: el `a.click()` de un `blob:` en un Chrome de prueba abriria una
     descarga real, y lo que hay que medir es el NOMBRE y el CONTENIDO, no el guardado. */
  const orig = HTMLAnchorElement.prototype.click;
  HTMLAnchorElement.prototype.click = function () {
    if (this.download) { window.__p32.bajadas.push({ nombre: this.download, href: String(this.href).slice(0, 12) }); return; }
    return orig.apply(this, arguments);
  };
  window.__blobs = [];
  const B = window.Blob;
  window.Blob = function (partes, o) { try { window.__blobs.push(String(partes[0])); } catch (e) {} return new B(partes, o); };
  if (window.docmodArranque) docmodArranque();
  if (window.showTab) showTab('config');
  if (window.cfgOnShow) cfgOnShow();
  return 1;
});

/* ── E1 · los dos botones y la linea ── */
R.E1 = await S.ev(() => {
  const sec = document.getElementById('cfg-card-docs');
  const bts = Array.prototype.map.call(sec.querySelectorAll('button'), function (b) {
    return b.textContent.trim() + '|' + Math.round(b.getBoundingClientRect().height); });
  const inp = document.getElementById('cfg-docs-imp');
  return { botones: bts, inputFile: !!inp, accept: inp ? inp.getAttribute('accept') : null,
           linea: (sec.textContent || '').indexOf('El archivo lleva solo los textos de los modelos, sin datos de pacientes.') >= 0 };
});

/* ── E2 · el archivo exportado ── */
R.E2 = await S.ev(() => {
  /* Un estado con las dos cosas que tienen que viajar: un incluido editado y un propio. */
  const st = docmodLeer();
  st.incl.constancia.ed = { tit: 'CONSTANCIA PROPIA', frase: true,
                            txt: 'Texto de la institucion de prueba.', decl: true, firmas: true, comunes: true };
  st.incl.ete.vis = false;
  st.incl.cve.nom = 'Cardioversion (renombrada)';
  st.prop = [{ clave: 'p1', tipo: 'consent', vis: true, nom: 'Propio de prueba', tit: 'Mi procedimiento',
               pregs: [{ t: '¿Qué es?', x: 'Una prueba.' }], decl: true, firmas: false, comunes: true }];
  docmodEscribir(docmodValidar(st, false).st);
  window.__p32.bajadas = []; window.__blobs = [];
  cfgDocsExportar();
  const txt = window.__blobs[window.__blobs.length - 1] || '';
  let obj = null; try { obj = JSON.parse(txt); } catch (e) {}
  /* Nada de datos de paciente ni de institucion en el archivo. */
  const prohibido = ['Prueba Ficticia', 'Centro Ficticio', 'Ficticia Perez', 'data:image', '1.234.567']
    .filter(function (w) { return txt.indexOf(w) >= 0; });
  return { bajada: window.__p32.bajadas[0] || null,
           claves: obj ? Object.keys(obj) : null, marca: obj ? obj._ecosmart_modelos : null,
           v: obj ? obj.v : null, fecha: obj ? obj.fecha : null,
           incl: obj ? Object.keys(obj.incl) : null,
           edConstancia: obj && obj.incl.constancia.ed ? obj.incl.constancia.ed.txt : null,
           eteVis: obj ? obj.incl.ete.vis : null, cveNom: obj ? obj.incl.cve.nom : null,
           prop: obj ? obj.prop : null, prohibido: prohibido, largo: txt.length,
           /* solo cadenas, booleanos, objetos y listas: ni un numero suelto en los textos */
           tipos: (function () { const t = {}; const rec = function (o) {
             if (o === null) { t['null'] = 1; return; }
             if (Array.isArray(o)) { t.array = 1; o.forEach(rec); return; }
             t[typeof o] = 1;
             if (typeof o === 'object') for (const k in o) rec(o[k]); };
             rec(obj); return Object.keys(t).sort(); })() };
});

/* ── E3 y E4 · la importacion ── */
const imp = async (nombre, contenido, resp) => S.ev((a) => {
  window.__p32.alert = []; window.__p32.confirm = []; window.__p32.resp = a.resp;
  const antes = JSON.stringify(docmodLeer());
  const f = new File([a.contenido], a.nombre, { type: 'application/json' });
  const inp = document.getElementById('cfg-docs-imp');
  const dt = new DataTransfer(); dt.items.add(f);
  inp.files = dt.files;
  inp.dispatchEvent(new Event('change', { bubbles: true }));
  window.__antes = antes;
  return { tam: f.size };
}, { nombre, contenido, resp });

const leer = async () => S.ev(() => ({
  alert: window.__p32.alert.slice(), confirm: window.__p32.confirm.slice(),
  cambio: JSON.stringify(docmodLeer()) !== window.__antes,
  propios: docmodLeer().prop.length,
  nombres: docmodLista().map(function (m) { return m.nom + (m.vis ? '' : ' (oculto)'); })
}));

R.E4ida = await S.ev(() => {
  /* El archivo bueno, el que acabamos de exportar. */
  window.__bueno = window.__blobs[window.__blobs.length - 1];
  /* Y se borra lo propio para que la vuelta se note. */
  const st = docmodLeer(); st.prop = []; st.incl.constancia.ed = null; st.incl.ete.vis = true;
  st.incl.cve.nom = '';
  docmodEscribir(st);
  cfgDocsRender();
  return { antesDeVolver: docmodLista().map(function (m) { return m.nom + (m.vis ? '' : ' (oculto)'); }),
           propios: docmodLeer().prop.length, constanciaEditada: docmodModelo('constancia').editado };
});
const bueno = await S.ev(() => window.__bueno);
await imp('ecosmart_modelos_documentos_2026-11-10.json', bueno, true);
await S.esperar(350);
R.E4vuelta = await leer();
R.E4igual = await S.ev(() => {
  const st = docmodLeer();
  return { propios: st.prop.length, propio: st.prop[0] || null,
           edConstancia: st.incl.constancia.ed ? st.incl.constancia.ed.txt : null,
           eteVis: st.incl.ete.vis, cveNom: st.incl.cve.nom,
           /* el documento propio imprime igual que antes de la vuelta */
           papel: (function () { const D = docDatos(); const d = docmodDef('p1');
             const m = docMaquetar(d, D, docBloquesNuevos(d, D));
             return { hojas: m.n, ops: m.hojas.reduce(function (a, o) { return a + o.length; }, 0) }; })(),
           /* los tres sin editar siguen siendo el mismo objeto */
           reglaDeOro: ['cve', 'ete', 'burb'].map(function (k) {
             return k + '=' + (docmodDef(k) === DOC_DEFS[k]); }) };
});

/* archivo AJENO */
await imp('otro.json', JSON.stringify({ hola: 1, chau: [2, 3] }), true);
await S.esperar(250); R.ajeno = await leer();
/* archivo DANIADO */
await imp('roto.json', '{"_ecosmart_modelos":true,"v":1,"incl":{', true);
await S.esperar(250); R.daniado = await leer();
/* archivo con TRES propios */
await imp('tres.json', JSON.stringify({ _ecosmart_modelos: true, v: 1, incl: {}, prop: [
  { clave: 'a', tipo: 'consent', vis: true, nom: 'A', tit: 'A', pregs: [], decl: true, firmas: true, comunes: true },
  { clave: 'b', tipo: 'consent', vis: true, nom: 'B', tit: 'B', pregs: [], decl: true, firmas: true, comunes: true },
  { clave: 'c', tipo: 'consent', vis: true, nom: 'C', tit: 'C', pregs: [], decl: true, firmas: true, comunes: true }] }), true);
await S.esperar(250); R.tresPropios = await leer();
/* SIN la marca de formato */
await imp('sinmarca.json', JSON.stringify({ v: 1, incl: {}, prop: [] }), true);
await S.esperar(250); R.sinMarca = await leer();
/* clave DESCONOCIDA */
await imp('desconocida.json', JSON.stringify({ _ecosmart_modelos: true, v: 1, incl: {}, prop: [], extra: 'x' }), true);
await S.esperar(250); R.desconocida = await leer();
/* un NUMERO donde va un texto */
await imp('numero.json', JSON.stringify({ _ecosmart_modelos: true, v: 1, incl: {}, prop: [
  { clave: 'a', tipo: 'consent', vis: true, nom: 'A', tit: 'A', pregs: [{ t: 'x', x: 7 }], decl: true, firmas: true, comunes: true }] }), true);
await S.esperar(250); R.numero = await leer();
/* TOPES de largo: nombre de 61 y texto de pregunta de 6.001 */
await imp('topes.json', JSON.stringify({ _ecosmart_modelos: true, v: 1, incl: {}, prop: [
  { clave: 'a', tipo: 'consent', vis: true, nom: new Array(62).join('x'), tit: 'A', pregs: [], decl: true, firmas: true, comunes: true }] }), true);
await S.esperar(250); R.topeNom = await leer();
await imp('topex.json', JSON.stringify({ _ecosmart_modelos: true, v: 1, incl: {}, prop: [
  { clave: 'a', tipo: 'consent', vis: true, nom: 'A', tit: 'A', pregs: [{ t: 'x', x: new Array(6003).join('y') }], decl: true, firmas: true, comunes: true }] }), true);
await S.esperar(250); R.topeTxt = await leer();
/* 31 preguntas */
await imp('pregs.json', JSON.stringify({ _ecosmart_modelos: true, v: 1, incl: {}, prop: [
  { clave: 'a', tipo: 'consent', vis: true, nom: 'A', tit: 'A',
    pregs: new Array(31).fill(0).map(function () { return { t: 't', x: 'x' }; }), decl: true, firmas: true, comunes: true }] }), true);
await S.esperar(250); R.tope31 = await leer();
/* decir NO a la confirmacion */
await imp('no.json', bueno, false);
await S.esperar(250); R.dijoNo = await leer();
/* texto que PARECE HTML o codigo: entra y se muestra como TEXTO */
await imp('html.json', JSON.stringify({ _ecosmart_modelos: true, v: 1, incl: {}, prop: [
  { clave: 'h', tipo: 'consent', vis: true, nom: '<b>Nombre</b>', tit: '<i>Titulo</i>',
    pregs: [{ t: '<u>Preg</u>', x: '<script>alert(1)</script> y <img src=x onerror=alert(2)>' }],
    decl: true, firmas: true, comunes: true }] }), true);
await S.esperar(350);
R.html = await S.ev(() => {
  const o = { alert: window.__p32.alert.slice(), propios: docmodLeer().prop.length };
  const lista = document.getElementById('cfg-docs-lista');
  o.filaHTML = lista.querySelectorAll('b, i, u, script, img').length;
  o.filaTexto = (lista.textContent || '').indexOf('<b>Nombre</b>') >= 0;
  if (window.showTab) showTab('informe');
  docmodMenuRender();
  const m = document.getElementById('doc-menu');
  o.menuHTML = m.querySelectorAll('b, i, u, script, img').length;
  o.menuTexto = (m.textContent || '').indexOf('<b>Nombre</b>') >= 0;
  docAbrir('h');
  const h = document.getElementById('doc-hoja');
  o.hojaHTML = h.querySelectorAll('script, img, u').length;
  o.hojaTexto = (h.textContent || '').indexOf('<script>alert(1)</script>') >= 0;
  const D = docDatos(), d = docmodDef('h');
  const maq = docMaquetar(d, D, docBloquesNuevos(d, D));
  const tinta = [];
  maq.hojas.forEach(function (ops) { ops.forEach(function (x) {
    if (x.s) tinta.push(x.s); (x.ws || []).forEach(function (w) { tinta.push(w.s); }); }); });
  o.papelTexto = tinta.join(' ').indexOf('alert(1)') >= 0;
  o.papelHojas = maq.n;
  docCerrar();
  return o;
});

console.log(JSON.stringify(R, null, 1));
await S.cerrar();
