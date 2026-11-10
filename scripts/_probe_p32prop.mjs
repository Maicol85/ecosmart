#!/usr/bin/env node
/**
 * _probe_p32prop.mjs - Parte D de PANT-32 (2026-11-10): la impresion de los documentos propios.
 *  D4 cuerpo 10,2 pt e interlineado 13,4; el texto corre sin salto forzado; la declaracion y la
 *     tabla de firmas SIEMPRE juntas; las hojas comunes aparte; la constancia propia en UNA
 *     hoja con su firma separada; el encabezado; la linea del paciente.
 *  D5 la hoja editable del Informe, el pegado, el cierre, «Guardar en Imagenes» con el nombre
 *     del documento, e «Imprimir».
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
    /* ⚠️ LA CLAVE ES `ett_medicos` Y NO `eco_medicos`: la sonda de PANT-31 sembraba la segunda,
       que NO existe, asi que el medico que firma salia vacio y el papel dibujaba «____» donde va
       su nombre. Se ve recien al preguntar por el nombre en la tinta. `ETT_MEDICOS_KEY` lo fija
       en una sola linea del archivo. */
    localStorage.setItem('ett_medicos', JSON.stringify([{ nombre: 'Dra. Ficticia Perez', matricula: '12345', especialidad: 'Cardiologia' }]));
    localStorage.setItem('ett_medico_principal', '0');
  } catch (e) {}
  const set = (id, v) => { const e = document.getElementById(id); if (!e) return false;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); return true; };
  set('nombre', 'Prueba Ficticia, Ana'); set('ci', '1.234.567-8'); set('sexo', 'F');
  set('cfg-med-lugar', 'Artigas');
  if (window.docmodArranque) docmodArranque();
  return 1;
});
await S.esperar(250);

/* Siembra: dos propios, uno CORTO y uno LARGO, mas una constancia propia medida aparte. */
R.siembra = await S.ev(() => {
  const largo = (function () {
    const p = 'Este es un parrafo de prueba de un consentimiento propio, escrito para medir como corre el texto de una hoja a la siguiente sin ningun salto forzado y para que la declaracion tenga que pasar de hoja entera. ';
    let s = '';
    for (let i = 0; i < 14; i++) s += p + '\n\n';
    return s + '• una vinieta de prueba\n• **Fuerte:** otra vinieta\n\n☐ Sí ☐ No  una casilla\n☐ Sí ☐ No  otra casilla\n\nRotulo de la raya de prueba:\n________\n\nUn cierre con **negrita** adentro.';
  })();
  const st = docmodLeer();
  st.prop = [
    { clave: 'p1', tipo: 'consent', vis: true, nom: 'Propio corto', tit: 'Procedimiento corto',
      pregs: [{ t: '¿Qué es?', x: 'Una prueba breve.' }, { t: 'Vacía a propósito', x: '' }],
      decl: true, firmas: true, comunes: true },
    { clave: 'p2', tipo: 'consent', vis: true, nom: 'Propio largo', tit: 'Procedimiento largo',
      pregs: [{ t: '¿Qué es?', x: largo }], decl: true, firmas: true, comunes: true }
  ];
  const r = docmodValidar(st, false);
  if (!r.ok) return { err: r.motivo };
  docmodEscribir(r.st);
  docmodMenuRender();
  return { ok: true, propios: docmodLeer().prop.length, largo: largo.length };
});

/* ── D4 · el papel de los dos propios ── */
R.D4 = await S.ev(() => {
  const D = docDatos();
  const mide = function (clave) {
    const def = docmodDef(clave);
    const bl = docBloquesNuevos(def, D);
    const maq = docMaquetar(def, D, bl);
    /* En que hoja cae cada pieza. */
    const hojaDe = function (pred) {
      for (let h = 0; h < maq.hojas.length; h++) {
        const ops = maq.hojas[h];
        for (let i = 0; i < ops.length; i++) {
          const t = (ops[i].s || '') + ' ' + (ops[i].ws || []).map(function (w) { return w.s; }).join(' ');
          if (pred(ops[i], t)) return h + 1;
        }
      }
      return 0;
    };
    const tipos = {};
    bl.forEach(function (b) { tipos[b.t] = (tipos[b.t] || 0) + 1; });
    const tinta = [];
    maq.hojas.forEach(function (ops) { ops.forEach(function (o) {
      if (o.s) tinta.push(o.s); (o.ws || []).forEach(function (w) { tinta.push(w.s); }); }); });
    const t = tinta.join(' ');
    return {
      sz: def.sz, lh: def.lh, tit: def.tit, menu: def.menu,
      hojas: maq.n, ops: maq.hojas.reduce(function (a, o) { return a + o.length; }, 0),
      opsPorHoja: maq.hojas.map(function (o) { return o.length; }),
      tipos: tipos,
      /* la declaracion y la tabla de firmas, en la MISMA hoja */
      hojaDeclaro: hojaDe(function (o, s) { return s.indexOf('Declaro que') >= 0; }),
      hojaFirmas: hojaDe(function (o) { return o.k === 'rect'; }),
      hojaComunes: hojaDe(function (o, s) { return s.indexOf('imposibilitado de otorgar') >= 0; }),
      /* el encabezado y la linea del paciente */
      enc: tipos.enc || 0, pacid: tipos.pacid || 0,
      instCentrada: maq.hojas[0].some(function (o) { return o.k === 'c' && String(o.s).indexOf('Centro Ficticio') >= 0; }),
      dicePaciente: t.indexOf('Prueba Ficticia') >= 0,
      /* la declaracion de un propio no nombra procedimiento */
      diceElProc: t.indexOf('en qué consiste el procedimiento') >= 0,
      diceDescrito: t.indexOf('el procedimiento descrito en este documento') >= 0,
      /* ningun salto forzado del texto: solo el de las hojas comunes */
      saltos: tipos.salto || 0,
      /* las cinco convenciones llegaron al papel */
      vinieta: maq.hojas.some(function (ops) { return ops.some(function (o) { return o.s === '•'; }); }),
      casillas: maq.hojas.reduce(function (a, ops) { return a + ops.filter(function (o) { return o.k === 'box'; }).length; }, 0),
      rayas: maq.hojas.reduce(function (a, ops) { return a + ops.filter(function (o) { return o.k === 'l'; }).length; }, 0),
      negritaPorPalabra: maq.hojas.reduce(function (a, ops) { return a + ops.filter(function (o) {
        return o.k === 'tw' && (o.ws || []).some(function (w) { return w.b === true; }); }).length; }, 0),
      /* la pregunta vacia no se imprime */
      diceVacia: t.indexOf('Vacía a propósito') >= 0
    };
  };
  return { p1: mide('p1'), p2: mide('p2') };
});

/* ── D4 · la constancia propia ── */
R.D4c = await S.ev(() => {
  const st = docmodLeer();
  st.prop[0] = { clave: 'p1', tipo: 'constancia', vis: true, nom: 'Constancia propia',
                 tit: 'CONSTANCIA DE ASISTENCIA', frase: true,
                 txt: 'Se extiende la presente a pedido del interesado.', decl: true, firmas: true, comunes: true };
  docmodEscribir(docmodValidar(st, false).st);
  const D = docDatos();
  const def = docmodDef('p1');
  const maq = docMaquetar(def, D, docBloquesNuevos(def, D));
  const ops = maq.hojas[0];
  /* La firma: la raya y el nombre, bien separados del ultimo texto del cuerpo. */
  let yUlt = 0, yRaya = 0;
  ops.forEach(function (o) {
    if ((o.k === 't' || o.k === 'tw') && o.y > yUlt && o.y < 250) yUlt = o.y;
    if (o.k === 'l' && o.col && o.col[0] === 60) yRaya = o.y;
  });
  const tinta = ops.map(function (o) { return (o.s || '') + ' ' + (o.ws || []).map(function (w) { return w.s; }).join(' '); }).join(' ');
  return { sz: def.sz, lh: def.lh, hojas: maq.n, ops: ops.length,
           tit: tinta.indexOf('CONSTANCIA DE ASISTENCIA') >= 0,
           frase: tinta.indexOf('Se deja constancia que') >= 0,
           libre: tinta.indexOf('a pedido del interesado') >= 0,
           firmaMed: tinta.indexOf('Ficticia Perez') >= 0,
           separacion: Math.round((yRaya - yUlt) * 10) / 10, yRaya: Math.round(yRaya) };
});

/* ── D4 · destildar cada pieza ── */
R.piezas = await S.ev(() => {
  const D = docDatos(), out = {};
  [['decl', false], ['firmas', false], ['comunes', false], ['todas', false]].forEach(function (c) {
    const st = docmodLeer();
    const p = st.prop.filter(function (x) { return x.clave === 'p2'; })[0];
    p.decl = c[0] === 'decl' || c[0] === 'todas' ? false : true;
    p.firmas = c[0] === 'firmas' || c[0] === 'todas' ? false : true;
    p.comunes = c[0] === 'comunes' || c[0] === 'todas' ? false : true;
    docmodEscribir(docmodValidar(st, false).st);
    const def = docmodDef('p2');
    const bl = docBloquesNuevos(def, D);
    const maq = docMaquetar(def, D, bl);
    const tipos = {};
    bl.forEach(function (b) { tipos[b.t] = (tipos[b.t] || 0) + 1; });
    const tinta = [];
    maq.hojas.forEach(function (ops) { ops.forEach(function (o) {
      if (o.s) tinta.push(o.s); (o.ws || []).forEach(function (w) { tinta.push(w.s); }); }); });
    const t = tinta.join(' ');
    out[c[0]] = { hojas: maq.n, decl: t.indexOf('Declaro que') >= 0,
                  tfirmas: tipos.tfirmas || 0, firma: tipos.firma || 0,
                  comunes: t.indexOf('imposibilitado de otorgar') >= 0 };
  });
  /* vuelta a las tres tildadas */
  const st = docmodLeer();
  const p = st.prop.filter(function (x) { return x.clave === 'p2'; })[0];
  p.decl = true; p.firmas = true; p.comunes = true;
  docmodEscribir(docmodValidar(st, false).st);
  return out;
});

/* ── D5 · la hoja del Informe con un propio ── */
R.D5 = await S.ev(() => {
  if (window.showTab) showTab('informe');
  docmodMenuRender();
  const items = Array.prototype.map.call(document.querySelectorAll('#doc-menu [data-doc-k]'), function (b) {
    return b.getAttribute('data-doc-k') + '=' + b.textContent.trim(); });
  docAbrir('p2');
  const ov = document.getElementById('doc-ov');
  const h = document.getElementById('doc-hoja');
  return { menu: items, abierta: !ov.hidden,
           tituloOverlay: (document.getElementById('doc-ov-tit') || {}).textContent,
           editables: h.querySelectorAll('[contenteditable]').length,
           largo: (h.textContent || '').length,
           zoom: h.style.zoom || getComputedStyle(h).zoom,
           cuerpo: h.style.fontSize, inter: h.style.lineHeight,
           claveEsq: docClaveEsq(docDefActual().clave), tit: docDefActual().tit };
});
R.D5imp = await S.ev(() => {
  /* Imprimir de verdad: el PDF se arma y el estado dice cuantas hojas. */
  docImprimir();
  return { estado: (document.getElementById('doc-estado') || {}).textContent };
});
R.D5img = await S.ev(() => {
  /* «Guardar en Imagenes»: sin uuid del estudio, el motivo se dice. El nombre que usaria es el
     del documento, que es lo que D5 pide. */
  const def = docDefActual();
  const D = docDatos();
  const maq = docMaquetar(def, D, _docEst[_docAbierto].bloques);
  const svg = docOpsASvg(maq);
  docGuardarImagen();
  return { nombreMiniatura: def.tit, svgLargo: svg.length,
           svgHojas: (svg.match(/<g transform/g) || []).length,
           uuid: docUuid() };
});
await S.esperar(500);
R.D5img2 = await S.ev(() => ({ estado: (document.getElementById('doc-estado') || {}).textContent }));
/* La edicion a mano con teclado REAL, el pegado llano y el cierre. */
R.D5ed = await S.ev(() => {
  const h = document.getElementById('doc-hoja');
  const p = h.querySelector('p.doc-p[contenteditable]');
  if (!p) return { err: 'sin parrafo' };
  p.focus();
  const r = document.createRange(); r.selectNodeContents(p); r.collapse(true);
  const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
  return { foco: document.activeElement === p, antes: (p.textContent || '').slice(0, 24) };
});
await S.escribir("XYZ ");
R.D5ed2 = await S.ev(() => {
  const st = _docEst[_docAbierto];
  const b = (st.bloques || []).filter(function (x) { return String(x.x || '').indexOf('XYZ') >= 0; });
  const r = (st.bloques || []).filter(function (x) { return x.runs && x.runs.some(function (z) { return z.s.indexOf('XYZ') >= 0; }); });
  return { editado: st.editado, enBloque: b.length, enRuns: r.length,
           texto: (b[0] || r[0] || {}).x || ((r[0] || {}).runs || []).map(function (z) { return z.s; }).join('') };
});
R.D5peg = await S.ev(() => {
  const h = document.getElementById('doc-hoja');
  const p = h.querySelector('p.doc-p[contenteditable]');
  p.focus();
  const dt = new DataTransfer();
  dt.setData('text/html', '<b>NEGRITA</b> y <i>cursiva</i>');
  dt.setData('text/plain', 'NEGRITA y cursiva');
  const ev = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true });
  p.dispatchEvent(ev);
  return { b: p.querySelectorAll('b').length, i: p.querySelectorAll('i').length,
           dice: (p.textContent || '').indexOf('NEGRITA y cursiva') >= 0 };
});
R.D5cerrar = await S.ev(() => {
  window.__cf = [];
  window.confirm = function (m) { window.__cf.push(String(m)); return true; };
  const ov = document.getElementById('doc-ov');
  ov.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  const preg = window.__cf.slice();
  const c = document.getElementById('doc-conf');
  const pregunto = c ? !c.hidden : false;
  if (pregunto) { const ok = document.getElementById('doc-conf-ok'); if (ok) ok.click(); }
  return { confirmNativo: preg, preguntoEnLaHoja: pregunto, cerro: ov.hidden };
});

console.log(JSON.stringify(R, null, 1));
await S.cerrar();
