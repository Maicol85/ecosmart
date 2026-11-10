#!/usr/bin/env node
/**
 * _probe_pant31hoja.mjs - R1 a R4 de PANT-31 (2026-11-10). Corre sobre UN arbol (--file) y se
 * usa en SERIE sobre los dos lados de un A/B.
 *  R1 el boton «Documentos» en el rincon derecho, alineado por la derecha con «Evidencia», y sin
 *     tapar ni desplazar a nadie en celular.
 *  R2 la hoja COMPLETA: toda la tinta dentro del papel blanco, cero desborde horizontal, la A4
 *     en milimetros, el cuerpo en los puntos de la def y el zoom que la hace entrar.
 *  R3 la EDICION con clic y teclado REALES por CDP, en los cinco anchos, y el pegado como texto
 *     llano.
 *  R4 el cierre: cruz, clic en el fondo, Escape, y la confirmacion con sus dos respuestas.
 * Nombre propio: verificado con ls, no existia.
 */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const ANCHOS = [1440, 1280, 1000, 768, 390];
const S = await abrir(FILE, { espera: 3400 });
const R = { file: FILE };
R.entrar = await S.entrar();
R.siembra = await S.ev(() => {
  const set = (id, v) => { const e = document.getElementById(id); if (!e) return false;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); return true; };
  try {
    localStorage.setItem('centro_tipo_activo', 'default');
    localStorage.setItem('centro_nombre_activo', 'Centro Ficticio de Cardiologia del Norte');
    localStorage.setItem('eco_medicos', JSON.stringify([{ nombre: 'Dra. Ficticia Perez', matricula: '12345', especialidad: 'Cardiologia' }]));
  } catch (e) {}
  const o = { nombre: set('nombre', 'Prueba Ficticia, Ana'), ci: set('ci', '1.234.567-8'),
              sexo: set('sexo', 'F'), ciudad: set('cfg-med-lugar', 'Artigas') };
  if (window.showTab) showTab('informe');
  return o;
});
await S.esperar(400);

/* ── R1 ── */
R.R1 = {};
for (const w of ANCHOS) {
  await S.viewport(w, 900); await S.esperar(220);
  R.R1[w] = await S.ev(() => {
    const d = document.getElementById('doc-btn'), i = document.getElementById('indic-btn');
    if (!d || !i) return { hay: false };
    /* ⚠️ EL BOTON SE TRAE A LA VENTANA ANTES DE PREGUNTAR QUIEN ESTA ARRIBA. A 390 px la fila de
       acciones se parte en tres renglones y el boton cae por debajo del pliegue:
       `elementFromPoint` devuelve `null` fuera del viewport, que se lee igual que «algo lo tapa».
       Es la trampa que este repo ya documenta (TGA-h). */
    d.scrollIntoView({ block: 'center' });
    const rd = d.getBoundingClientRect(), ri = i.getBoundingClientRect();
    const fila = d.closest('div[style*="flex-wrap"]');
    const rf = fila.getBoundingClientRect();
    /* Nadie tapado: el centro del boton tiene que devolver el boton, y ningun hermano puede
       solaparse con su caja. */
    const centro = document.elementFromPoint(Math.round(rd.x + rd.width / 2), Math.round(rd.y + rd.height / 2));
    const hermanos = Array.prototype.slice.call(fila.children).filter(x => x !== d.parentElement);
    const solapa = hermanos.filter(x => { const r = x.getBoundingClientRect();
      return !(r.right <= rd.x || r.x >= rd.right || r.bottom <= rd.y || r.y >= rd.bottom); }).length;
    return { hay: true, doc: { x: Math.round(rd.x), y: Math.round(rd.y), w: Math.round(rd.width), h: Math.round(rd.height), der: Math.round(rd.right) },
      evid: { der: Math.round(ri.right), y: Math.round(ri.y) },
      filaDer: Math.round(rf.right), filaAlto: Math.round(rf.height),
      alineadoPorDerecha: Math.abs(rd.right - ri.right) <= 1,
      pegadoAlBordeDeSuFila: Math.abs(rd.right - rf.right) <= 1,
      centroDevuelveElBoton: !!(centro && (centro === d || d.contains(centro))),
      centroQuien: centro ? (centro.tagName + '.' + String(centro.className).slice(0, 24) + '#' + centro.id + ' z=' + getComputedStyle(centro).zIndex) : null,
      hermanosSolapados: solapa, nHijosFila: fila.children.length,
      hermanosTxt: hermanos.map(x => (x.textContent || '').trim().slice(0, 18)) };
  });
}

/* ── R2 ── */
R.R2 = { porDoc: {} };
for (const cl of ['constancia', 'cve', 'ete', 'burb']) {
  R.R2.porDoc[cl] = {};
  for (const w of ANCHOS) {
    await S.viewport(w, 900); await S.esperar(200);
    R.R2.porDoc[cl][w] = await S.ev((clave) => {
      if (typeof docCerrar === 'function') docCerrar();
      docAbrir(clave);
      const h = document.getElementById('doc-hoja'), wr = h.parentElement;
      const cs = getComputedStyle(h), r = h.getBoundingClientRect();
      /* La tinta: el borde inferior y el derecho del ultimo/mas ancho descendiente, contra la
         caja BLANCA. Positivo = dibujado fuera del papel. */
      let abajo = -1e9, derecha = -1e9, izq = 1e9;
      h.querySelectorAll('*').forEach(el => { const q = el.getBoundingClientRect();
        if (q.width === 0 && q.height === 0) return;
        if (q.bottom > abajo) abajo = q.bottom;
        if (q.right > derecha) derecha = q.right;
        if (q.x < izq) izq = q.x; });
      let recort = 0; const rq = [];
      h.querySelectorAll('p,div,span,li,h3,td,th').forEach(el => {
        if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) { recort++; if (rq.length < 4) rq.push((el.tagName + '.' + el.className).slice(0, 26)); } });
      const maq = docMaquetar(DOC_DEFS[clave], docDatos(), docBloquesNuevos(DOC_DEFS[clave], docDatos()));
      return {
        zoom: cs.zoom, anchoCss: cs.width, minAlto: cs.minHeight, pad: cs.padding,
        cuerpo: cs.fontSize, interlineado: cs.lineHeight,
        defSz: DOC_DEFS[clave].sz + 'pt', defLh: DOC_DEFS[clave].lh + 'pt',
        cuerpoOk: cs.fontSize === (DOC_DEFS[clave].sz * 4 / 3).toFixed(4).replace(/0+$/, '').replace(/\.$/, '') + 'px' || null,
        caja: { w: Math.round(r.width), h: Math.round(r.height) },
        tintaFueraAbajo: Math.round(abajo - r.bottom), tintaFueraDerecha: Math.round(derecha - r.right),
        tintaFueraIzquierda: Math.round(r.x - izq),
        desbordeWrap: wr.scrollWidth - wr.clientWidth,
        desbordeDoc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        recortados: recort, recortQuien: rq,
        hojasPdf: maq.n, defHojas: DOC_DEFS[clave].hojas,
        chk2Cols: (function () { const c = h.querySelector('.doc-chk2'); return c ? getComputedStyle(c).gridTemplateColumns.split(' ').length : null; })()
      };
    }, cl);
  }
}

/* ── R3 ── */
R.R3 = { escribir: {}, pegar: null };
for (const w of ANCHOS) {
  await S.viewport(w, 900); await S.esperar(200);
  const pos = await S.ev(() => {
    if (typeof docCerrar === 'function') docCerrar();
    docAbrir('ete');
    const h = document.getElementById('doc-hoja');
    const p = h.querySelector('p.doc-p[contenteditable="true"]');
    p.scrollIntoView({ block: 'center' });
    const r = p.getBoundingClientRect();
    const x = Math.round(r.x + 8), y = Math.round(r.y + Math.min(6, r.height / 2));
    const top = document.elementFromPoint(x, y);
    return { x: x, y: y, top: top ? (top.tagName + '.' + String(top.className).slice(0, 14)) : null,
             enViewport: r.y > 0 && r.y < innerHeight };
  });
  if (!pos.enViewport) { R.R3.escribir[w] = Object.assign({ ok: null }, pos); continue; }
  await S.clic(pos.x, pos.y);
  await S.esperar(120);
  await S.escribir('QQW');
  await S.esperar(160);
  await S.tecla('Backspace', 1);
  await S.esperar(160);
  R.R3.escribir[w] = await S.ev(() => {
    const h = document.getElementById('doc-hoja');
    const p = h.querySelector('p.doc-p[contenteditable="true"]');
    return { ok: p.innerText.indexOf('QQ') > -1 && p.innerText.indexOf('QQW') === -1,
             txt: p.innerText.slice(0, 26), foco: document.activeElement.tagName,
             editado: !!(typeof docSinEntregar === 'function' ? docSinEntregar() : null) };
  });
  Object.assign(R.R3.escribir[w], { topAlClic: pos.top });
}
await S.viewport(1440, 900); await S.esperar(200);
R.R3.pegar = await S.ev(() => {
  if (typeof docCerrar === 'function') docCerrar();
  docAbrir('constancia');
  const h = document.getElementById('doc-hoja');
  const p = h.querySelector('p.doc-p[contenteditable="true"]');
  p.focus();
  const r = document.createRange(); r.selectNodeContents(p); r.collapse(false);
  const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r);
  const dt = new DataTransfer();
  dt.setData('text/plain', 'TEXTO  PEGADO—con raya y ☐ casilla');
  dt.setData('text/html', '<b style="color:red">TEXTO PEGADO</b><ul><li>lista</li></ul>');
  const ev = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true });
  const noCancelado = p.dispatchEvent(ev);
  return { cancelado: !noCancelado, tieneTexto: p.innerText.indexOf('TEXTO PEGADO') > -1,
    sinNegrita: p.querySelectorAll('b,strong,ul,li').length === 0,
    sinRaya: p.innerText.indexOf('—') === -1, sinCasilla: p.innerText.indexOf('☐') === -1,
    cola: p.innerText.slice(-48), editado: docSinEntregar() };
});

/* ── R4 ── */
R.R4 = await S.ev(() => {
  const o = {};
  const ov = document.getElementById('doc-ov'), cf = document.getElementById('doc-conf');
  o.confExiste = !!cf;
  /* (1) sin editar: el clic en el fondo cierra directo.
     ⚠️ EL DENOMINADOR SE LIMPIA PRIMERO. `_docEst` vive en memoria por clave y las pruebas de R3
     dejaron la constancia EDITADA: sin este `docActualizarDatos` el primer clic en el fondo
     preguntaba -- correctamente-- y la condicion lo leia como «el fondo no cierra». */
  docCerrar(); docAbrir('constancia');
  docActualizarDatos();
  o.limpio_noEditado = !docSinEntregar();
  ov.click();
  o.sinEditar_fondoCierra = !!ov.hidden;
  o.sinEditar_sinPreguntar = !!(cf && cf.hidden);
  /* (2) un clic DENTRO no cierra */
  docAbrir('constancia');
  document.getElementById('doc-hoja').click();
  o.clicAdentroNoCierra = !ov.hidden;
  /* (3) editado: el clic en el fondo pregunta */
  const h = document.getElementById('doc-hoja');
  const p = h.querySelector('p.doc-p[contenteditable="true"]');
  p.innerText = p.innerText + ' corregido a mano';
  p.dispatchEvent(new Event('input', { bubbles: true }));
  o.marcadoEditado = docSinEntregar();
  ov.click();
  o.editado_pregunta = !!(cf && !cf.hidden) && !ov.hidden;
  o.focoEnSeguir = document.activeElement === document.getElementById('doc-conf-seguir');
  o.textoPregunta = cf ? (document.getElementById('doc-conf-txt') || {}).textContent : null;
  o.botones = cf ? Array.prototype.slice.call(cf.querySelectorAll('button')).map(b => b.textContent.trim()) : null;
  /* (4) «Seguir editando» deja la hoja abierta */
  document.getElementById('doc-conf-seguir').click();
  o.seguirDejaAbierta = !ov.hidden && cf.hidden;
  /* (5) Escape sobre la pregunta = seguir editando */
  ov.click();
  o.vuelveAPreguntar = !cf.hidden;
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  o.escapeEnPreguntaSigueEditando = cf.hidden && !ov.hidden;
  /* (6) «Cerrar» cierra */
  ov.click();
  document.getElementById('doc-conf-ok').click();
  o.cerrarCierra = !!ov.hidden && !!cf.hidden;
  /* (7) la cruz y Escape cierran DIRECTO aunque este editado */
  docAbrir('constancia');
  o.sigueEditadoAlReabrir = docSinEntregar();
  document.getElementById('doc-x').click();
  o.cruzCierraDirecto = !!ov.hidden && !!cf.hidden;
  docAbrir('constancia');
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  o.escapeCierraDirecto = !!ov.hidden && !!cf.hidden;
  /* (8) el visor de la miniatura: ya cerraba con clic afuera y con Escape */
  o.visorTieneCierre = !!document.getElementById('ig-imgv-cerrar');
  return o;
});

R.errores = S.errs.slice(0, 12);
console.log(JSON.stringify(R, null, 1));
S.cerrar();
process.exit(0);
