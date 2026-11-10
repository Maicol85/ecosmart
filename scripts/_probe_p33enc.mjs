#!/usr/bin/env node
/**
 * _probe_p33enc.mjs - PANT-33, PARTE D. El encabezado: el nombre desde el centro de trabajo, la
 * linea gris cuando no hay dato, el logo a la DERECHA y la regla de oro de D5.
 * Corre contra cualquier arbol con --file=, asi que sirve de A/B.
 */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3400 });
const R = { file: FILE };
R.entrar = await S.entrar();

/* Un PNG de 1x1 escalado por la caja: el ancho y el alto los pone el atributo, asi que para
   medir «no se deforma» alcanza con dos imagenes de proporciones distintas. */
const LOGO_ANCHO = 'data:image/svg+xml;base64,' + Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="80"><rect width="400" height="80" fill="#2a6"/></svg>').toString('base64');
const LOGO_CUAD = 'data:image/svg+xml;base64,' + Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#26a"/></svg>').toString('base64');

/* ── 1 · el nombre: el centro de trabajo, en los dos modos ── */
R.nombre = await S.ev(() => {
  const leer = () => ({ inst: docDatos().inst, hdr: (typeof hdrCentroNombre === 'function') ? hdrCentroNombre() : null });
  const o = {};
  try { localStorage.removeItem('ett_centros'); localStorage.removeItem('ett_centro_principal');
        localStorage.removeItem('centro_nombre'); localStorage.removeItem('centro_nombre_activo'); } catch (e) {}
  const el = document.getElementById('med-centro'); if (el) el.textContent = '';
  o.sinDato = leer();
  try { localStorage.setItem('ett_centros', JSON.stringify(['GREMEDA']));
        localStorage.setItem('ett_centro_principal', 'GREMEDA'); } catch (e) {}
  o.conCentro = leer();
  try { localStorage.setItem('ett_modo_institucional', '1'); } catch (e) {}
  o.conCentroModoInst = leer();
  try { localStorage.setItem('ett_modo_institucional', '0'); } catch (e) {}
  o.conCentroSinModoInst = leer();
  return o;
});

/* ── 2 · el encabezado dibujado, con y sin logo, ancho y cuadrado, y sin institucion ── */
R.enc = await S.ev((la, lc) => {
  const mide = function (inst, logo) {
    const D = docDatos(); D.inst = inst; D.logoD = logo;
    const def = DOC_DEFS.constancia;
    const maq = docMaquetar(def, D, docBloquesNuevos(def, D));
    if (!maq) return { err: 'sin jspdf' };
    const ops = maq.hojas[0];
    const circ = ops.filter(function (o) { return o.k === 'circ'; })[0] || null;
    const img = ops.filter(function (o) { return o.k === 'img'; })[0] || null;
    const nom = ops.filter(function (o) { return o.k === 'c' && o.s === inst; })[0] || null;
    /* La pantalla, con la hoja de verdad: se mide el ORDEN de los hijos y la x de cada uno. */
    const cont = document.createElement('div');
    cont.className = 'doc-hoja'; cont.style.position = 'absolute'; cont.style.left = '0'; cont.style.top = '0';
    cont.innerHTML = docHojaHTML(docBloquesNuevos(def, D), D, true);
    document.body.appendChild(cont);
    const e = cont.querySelector('.doc-enc');
    const caja = e ? e.getBoundingClientRect() : null;
    const hijos = e ? Array.prototype.map.call(e.children, function (c) {
      const r = c.getBoundingClientRect();
      return { cls: c.className, x: Math.round(r.x - caja.x), w: Math.round(r.width),
               h: Math.round(r.height), ed: c.isContentEditable || false,
               ph: c.getAttribute('data-ph') || null, txt: (c.textContent || '').slice(0, 40) };
    }) : null;
    const im = e ? e.querySelector('.doc-enc-logo') : null;
    const prop = im ? { w: Math.round(im.getBoundingClientRect().width), h: Math.round(im.getBoundingClientRect().height),
                        fit: getComputedStyle(im).objectFit } : null;
    /* El texto gris: lo que el navegador CALCULA para el ::before del elemento vacio. */
    const phEl = e ? e.querySelector('.doc-enc-ph') : null;
    const phTxt = phEl ? getComputedStyle(phEl, '::before').content : null;
    const phCol = phEl ? getComputedStyle(phEl, '::before').color : null;
    cont.remove();
    return { papel: { circ: circ ? { x: +circ.x.toFixed(1), s: circ.s } : null,
                      img: img ? { x: +img.x.toFixed(1), w: img.w, h: img.h } : null,
                      nombre: nom ? 'centrado' : null, ops: ops.length,
                      derecha: DOC_GEO.W - DOC_GEO.MR },
             pantalla: { hijos: hijos, logo: prop, ph: phTxt, phColor: phCol,
                         anchoCaja: caja ? Math.round(caja.width) : null } };
  };
  return { conNombreSinLogo: mide('GREMEDA', null),
           conLogoAncho: mide('GREMEDA', la),
           conLogoCuadrado: mide('GREMEDA', lc),
           sinNombreSinLogo: mide('', null),
           sinNombreConLogo: mide('', la) };
}, LOGO_ANCHO, LOGO_CUAD);

/* ── 3 · D5: los cuatro incluidos, hojas y operaciones ── */
R.d5 = await S.ev(() => {
  const D = docDatos(); D.inst = 'GREMEDA'; D.logoD = null;
  const out = {};
  Object.keys(DOC_DEFS).forEach(function (k) {
    const def = DOC_DEFS[k];
    const bl = docBloquesNuevos(def, D);
    const maq = docMaquetar(def, D, bl);
    out[k] = maq ? { hojas: maq.n, ops: maq.hojas.reduce(function (a, o) { return a + o.length; }, 0),
                     bloques: bl.length,
                     mismoObjeto: (typeof docmodDef === 'function') ? (docmodDef(k) === DOC_DEFS[k]) : null,
                     /* el texto, operacion por operacion, SIN las del encabezado */
                     texto: maq.hojas.map(function (ops) { return ops.filter(function (o) {
                       return (o.k === 't' || o.k === 'c' || o.k === 'r' || o.k === 'c2') && o.s; })
                       .map(function (o) { return o.s; }).join('|'); }).join('##') }
                 : { err: 'sin jspdf' };
  });
  return out;
});

/* ── 4 · la edicion del nombre en la hoja del Informe, con TECLADO REAL ── */
await S.viewport(1440, 900);
R.edicion = await S.ev(() => {
  try { localStorage.setItem('ett_centros', JSON.stringify(['GREMEDA']));
        localStorage.setItem('ett_centro_principal', 'GREMEDA');
        localStorage.setItem('ett_medicos', JSON.stringify([{ nombre: 'Dra. Ficticia Perez', matricula: '12345', especialidad: 'Cardiologia' }])); } catch (e) {}
  const set = (id, v) => { const e = document.getElementById(id); if (!e) return false;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); return true; };
  set('nombre', 'Perez, Maria Fernanda'); set('ci', '1.234.567-8'); set('sexo', 'F');
  if (window.showTab) showTab('informe');
  docAbrir('constancia');
  const el = document.querySelector('#doc-hoja [data-doc-inst]');
  if (!el) return { err: 'sin nombre editable' };
  const r = el.getBoundingClientRect();
  return { ed: el.isContentEditable, txt: el.textContent, x: Math.round(r.x), y: Math.round(r.y),
           w: Math.round(r.width), h: Math.round(r.height),
           /* el denominador: ¿el clic real cae en ESTE elemento? */
           enElPunto: (function () { const t = document.elementFromPoint(Math.round(r.x + r.width / 2), Math.round(r.y + r.height / 2));
             return t ? (t.tagName + '.' + t.className) : null; })() };
});
if (!R.edicion.err) {
  await S.clic(Math.round(R.edicion.x + R.edicion.w / 2), Math.round(R.edicion.y + R.edicion.h / 2));
  await S.ev(() => { const el = document.querySelector('#doc-hoja [data-doc-inst]');
    const sel = window.getSelection(); const r = document.createRange();
    r.selectNodeContents(el); sel.removeAllRanges(); sel.addRange(r); return true; });
  await S.escribir('Policlinica del Norte');
  await S.esperar(200);
  R.trasEscribir = await S.ev(() => {
    const el = document.querySelector('#doc-hoja [data-doc-inst]');
    const D = docDatosHoja();
    const def = docDefActual();
    const maq = docMaquetar(def, D, _docEst[_docAbierto].bloques);
    const nom = maq ? maq.hojas[0].filter(function (o) { return o.k === 'c' && o.s === 'Policlinica del Norte'; }).length : null;
    return { enPantalla: el ? el.textContent : null, enEstado: _docEst[_docAbierto].inst,
             enDatosApp: docDatos().inst, enElPapel: nom,
             /* el control: el MODELO no se toco */
             modeloIntacto: (function () { const st = docmodLeer();
               return st.incl.constancia.ed === null && !/Policlinica/.test(JSON.stringify(st)); })() };
  });
}
R.errs = S.errs.slice(0, 12);
console.log(JSON.stringify(R, null, 1));
S.cerrar();
process.exit(0);
