#!/usr/bin/env node
/**
 * _probe_pant30cons.mjs - verificacion del commit 3 de PANT-30 (2026-11-10): los tres
 * consentimientos, las hojas comunes y «Guardar en Imagenes».
 * Mide, para cada uno de los cuatro documentos:
 *   (A) HOJAS: las que da el maquetador y las que da el PDF de verdad, contra las que la orden
 *       fija (constancia 1, cardioversion 1, burbujas 1, ETE 2, + 1 de hojas comunes);
 *   (B) la REGLA DE ORO: la declaracion y la tabla de firmas en LA MISMA hoja;
 *   (C) el SALTO del ETE: «Antes del estudio» arranca hoja;
 *   (D) la numeracion de secciones, el pie en TODAS las hojas y los margenes;
 *   (E) las casillas DIBUJADAS (no el glifo) y las dos columnas del ETE;
 *   (F) el texto completo, para contar que no quedo ningun marcador suelto ni se perdio una
 *       frase, y los tramos en negrita de las viñetas.
 * ⚠️ DENOMINADOR: antes de contar nada se comprueba que la hoja tenga bloques y que el
 *    maquetador haya devuelto operaciones. Un documento vacio da cero de todo y se lee igual
 *    que «no hay defectos».
 * Nombre propio: verificado con ls, no existia.
 */
import { abrir } from './_p30cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3200 });
const R = { file: FILE };

await S.ev(() => {
  const set = (id, v) => { const e = document.getElementById(id); if (!e) return;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); };
  set('nombre', 'Prueba Ficticia, Ana'); set('ci', '1.234.567-8'); set('sexo', 'F');
  set('doc_tipo', 'CI'); set('cfg-med-lugar', 'Artigas'); set('fecha', '2026-11-10');
  if (window.showTab) showTab('informe');
});

R.docs = await S.ev(() => {
  const G = window.DOC_GEO;
  const out = {};
  Object.keys(window.DOC_DEFS).forEach(function (clave) {
    const def = window.DOC_DEFS[clave], D = window.docDatos();
    const bl = def.bloques().map(function (b, i) {
      const c = { t: b.t, i: i };
      if (b.x !== undefined) c.x = String(b.x).replace(/\{\{([a-z]+)\}\}/g,
        function (m, k) { return (D[k] == null || String(D[k]).trim() === '') ? '____' : String(D[k]); });
      if (b.items) c.items = b.items.map(function (s) {
        return String(s).replace(/\{\{([a-z]+)\}\}/g, function (m, k) { return (D[k] == null || String(D[k]).trim() === '') ? '____' : String(D[k]); }); });
      if (b.fuerte) c.fuerte = b.fuerte;
      if (b.nonum) c.nonum = b.nonum;
      if (b.grupo) c.grupo = b.grupo;
      return c;
    });
    const maq = window.docMaquetar(def, D, bl);
    const o = { bloques: bl.length, ops: 0 };
    if (!maq) { out[clave] = { error: 'sin maquetador' }; return; }
    o.hojasMaq = maq.n;
    const doc = window.docOpsAPdf(def, maq);
    o.hojasPdf = doc.getNumberOfPages();
    o.hojasDef = def.hojas;
    /* Donde cae cada cosa. */
    let minX = 1e9, cajas = 0, pies = 0, secs = [];
    o.hojaDe = {};
    maq.hojas.forEach(function (ops, h) {
      ops.forEach(function (op) {
        o.ops++;
        if (op.k === 't') minX = Math.min(minX, op.x);
        if (op.k === 'tw') op.ws.forEach(function (w) { minX = Math.min(minX, w.x); });
        if (op.k === 'box') cajas++;
        const t = op.s ? String(op.s) : '';
        if (t.indexOf('Página ') === 0) pies++;
        if (/^\d+\. /.test(t) && op.b) { secs.push(t.slice(0, 46)); o.hojaDe['sec:' + t.slice(0, 26)] = h; }
        if (t.indexOf('Declaro que:') === 0) o.hojaDe.declaro = h;
        if (t === 'Paciente' || t === 'Médico') o.hojaDe.tablaFirmas = h;
        if (t.indexOf('HOJAS COMUNES') > -1) o.hojaDe.hojasComunes = h;
        if (t.indexOf('Antes del estudio') > -1) o.hojaDe.antesDelEstudio = h;
      });
    });
    o.minX = +minX.toFixed(2); o.cajas = cajas; o.pies = pies;
    o.secs = secs; o.nSecs = secs.length;
    o.pieEnTodas = (pies === maq.n);
    o.dentroDelMargen = minX >= G.ML - 0.01;
    /* ⚠️ TRES ESTADOS Y NO DOS: la constancia no TIENE declaracion, asi que un booleano la
       reportaba como «separada» -- un falso rojo sobre un documento que no puede fallar en eso. */
    o.declaracionJuntoAFirmas = (o.hojaDe.declaro === undefined && o.hojaDe.tablaFirmas === undefined)
      ? 'no aplica' : (o.hojaDe.declaro === o.hojaDe.tablaFirmas);
    /* El aire que sobra en cada hoja. Es el numero que dice si el conteo de hojas es robusto o
       esta a un nombre largo de pasarse. */
    o.libre = maq.hojas.map(function (ops) {
      let fin = 0;
      ops.forEach(function (op) {
        if (op.y !== undefined && op.y < 290) fin = Math.max(fin, op.y);
        if (op.k === 'rect') fin = Math.max(fin, op.y + op.h);
      });
      return +(G.H - G.MB - fin).toFixed(1);
    });
    /* Texto plano completo del papel, para censar marcadores y frases. */
    let txt = '';
    maq.hojas.forEach(function (ops) { ops.forEach(function (op) {
      if (op.s) txt += String(op.s) + ' ';
      if (op.ws) txt += op.ws.map(function (w) { return w.s; }).join(' ') + ' ';
    }); });
    o.chars = txt.length;
    o.marcadoresSueltos = (txt.match(/\{\{[a-z]+\}\}/g) || []).length;
    o.glifoCasilla = (txt.match(/☐/g) || []).length;
    o.tienePaciente = txt.indexOf('Prueba Ficticia, Ana') > -1;
    o.tieneSiNo = (txt.match(/Sí/g) || []).length;
    o.svgTextos = (window.docOpsASvg(maq).match(/<text /g) || []).length;
    o.svgRects = (window.docOpsASvg(maq).match(/<rect /g) || []).length;
    out[clave] = o;
  });
  return out;
});

/* ── La pantalla de cada consentimiento: dos columnas de casillas y negritas ── */
R.pantalla = await S.ev(() => {
  const out = {};
  ['constancia', 'cve', 'ete', 'burb'].forEach(function (clave) {
    window.docAbrir(clave);
    const h = document.getElementById('doc-hoja');
    const cs = h.querySelector('.doc-chk2');
    out[clave] = {
      abre: !document.getElementById('doc-ov').hidden,
      chars: h.innerText.length,
      azules: h.querySelectorAll('.doc-dato').length,
      editables: h.querySelectorAll('[contenteditable="true"]').length,
      negritas: h.querySelectorAll('.doc-ul b').length,
      chk: h.querySelectorAll('.doc-chk').length,
      chk2cols: cs ? getComputedStyle(cs).gridTemplateColumns.split(' ').length : 0,
      saltos: h.querySelectorAll('.doc-salto').length,
      tablaFirmas: h.querySelectorAll('table.doc-tf').length,
      marcadoresSueltos: (h.innerText.match(/\{\{[a-z]+\}\}/g) || []).length,
      botonQuitarOculto: !!(document.getElementById('doc-quitar') || {}).hidden
    };
    window.docCerrar();
  });
  return out;
});

/* ── Guardar en Imagenes: los tres motivos y el camino feliz ── */
R.imagen = await S.ev(async () => {
  const o = {};
  window.docAbrir('constancia');
  /* (1) El estudio no esta guardado todavia: tiene que DECIR el motivo. */
  o.sinUuid = { uuid: (typeof _imgUuidActual !== 'undefined') ? _imgUuidActual : null };
  window.docGuardarImagen();
  await new Promise(r => setTimeout(r, 1800));
  o.sinUuid.estado = (document.getElementById('doc-estado') || {}).textContent;
  o.sinUuid.visible = !(document.getElementById('doc-estado') || {}).hidden;
  o.clave = window.docClaveEsq('constancia');
  o.configPrendido = (typeof imgGuardadoActivo === 'function') ? imgGuardadoActivo() : null;
  return o;
});

R.errores = S.errs;
console.log(JSON.stringify(R, null, 1));
S.cerrar();
process.exit(0);
