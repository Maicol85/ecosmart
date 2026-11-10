#!/usr/bin/env node
/**
 * _probe_pant31inv.mjs - TAREA 0 de PANT-31 (2026-11-10). SOLO LECTURA: no toca index.html.
 * Mide los siete puntos del inventario con el gesto real y en cinco anchos.
 *  (a) el boton «Documentos» y el de «Evidencia»: fila, caja, borde derecho, alto.
 *  (b) la hoja de pantalla: que es, cuanto mide, como escala, y que se corta en 1440/1280/1000/768/390.
 *  (c) la EDICION con teclado de verdad por CDP -- clic real, escribir, borrar, pegar.
 *  (d) el cierre: cruz, clic afuera, Escape; y la miniatura guardada en «Imagenes».
 *  (e) el logo: de donde sale y como lo usa el encabezado hoy.
 *  (f) la constancia: como se arma el parrafo y donde caen las dos frases.
 *  (g) el Laboratorio: la casilla «PPT» de cada seccion y que le falta a «Protesis valvulares».
 * Nombre propio: verificado con ls, no existia.
 */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const ANCHOS = [1440, 1280, 1000, 768, 390];
const DOCS = ['constancia', 'cve', 'ete', 'burb'];
const S = await abrir(FILE, { espera: 3400 });
const R = { file: FILE };
R.entrar = await S.entrar();

/* Siembra FICTICIA (el repo es publico) + institucion y medico, que es lo que el encabezado lee. */
R.siembra = await S.ev(() => {
  const set = (id, v) => { const e = document.getElementById(id); if (!e) return false;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return true; };
  const o = {};
  try {
    localStorage.setItem('centro_tipo_activo', 'default');
    localStorage.setItem('centro_nombre_activo', 'Centro Ficticio de Cardiologia del Norte');
    localStorage.setItem('eco_medicos', JSON.stringify([{ nombre: 'Dra. Ficticia Perez', matricula: '12345', especialidad: 'Cardiologia' }]));
    localStorage.setItem('eco_med_principal', '0');
  } catch (e) { o.ls = String(e); }
  o.nombre = set('nombre', 'Prueba Ficticia, Ana');
  o.ci = set('ci', '1.234.567-8');
  o.sexo = set('sexo', 'F');
  o.ciudad = set('cfg-med-lugar', 'Artigas');
  if (window.showTab) showTab('informe');
  o.tab = String((document.getElementById('tab-informe') || {}).className || '').indexOf('active') > -1;
  o.D = (typeof docDatos === 'function') ? docDatos() : null;
  if (o.D) o.D.logoD = o.D.logoD ? ('[' + o.D.logoD.length + ' bytes]') : null;
  return o;
});
await S.esperar(400);

/* ── (a) los dos botones ── */
R.a = await S.ev(() => {
  const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
             der: Math.round(r.right), vis: !!el.offsetParent }; };
  const dB = document.getElementById('doc-btn'), iB = document.getElementById('indic-btn');
  const filaDe = el => { if (!el) return null; const f = el.closest('div[style*="flex"]'); if (!f) return null;
    const r = f.getBoundingClientRect();
    return { der: Math.round(r.right), x: Math.round(r.x), w: Math.round(r.width),
             hijos: Array.prototype.slice.call(f.children).map(c => (c.tagName + ':' + (c.id || c.className || '')).slice(0, 34)) }; };
  return {
    doc: caja(dB), docFila: filaDe(dB), docEnvoltorio: dB ? dB.parentElement.className : null,
    evid: caja(iB), evidFila: filaDe(iB),
    mismaFila: !!(dB && iB && dB.closest('div[style*="flex"]') === iB.closest('div[style*="flex"]')),
    difAlturaY: (dB && iB) ? Math.round(dB.getBoundingClientRect().y - iB.getBoundingClientRect().y) : null,
    difBordeDer: (dB && iB) ? Math.round(dB.getBoundingClientRect().right - iB.getBoundingClientRect().right) : null
  };
});

/* ── (b) la hoja en cinco anchos ── */
R.b = { porDoc: {} };
for (const cl of DOCS) {
  R.b.porDoc[cl] = {};
  for (const w of ANCHOS) {
    await S.viewport(w, 900);
    await S.esperar(220);
    R.b.porDoc[cl][w] = await S.ev((clave) => {
      if (typeof docCerrar === 'function') docCerrar();
      docAbrir(clave);
      const ov = document.getElementById('doc-ov');
      const wrap = document.querySelector('.doc-hoja-wrap');
      const h = document.getElementById('doc-hoja');
      if (!h || !wrap) return { err: 'sin hoja' };
      const cs = getComputedStyle(h);
      const rh = h.getBoundingClientRect(), rw = wrap.getBoundingClientRect();
      /* Que se desborda de la caja de contenido de la hoja. */
      const pl = parseFloat(cs.paddingLeft), pr = parseFloat(cs.paddingRight);
      const izq = rh.x + pl, der = rh.right - pr;
      let fuera = 0; const quien = [];
      h.querySelectorAll('*').forEach(el => {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return;
        if (r.right > der + 0.6 || r.x < izq - 0.6) { fuera++; if (quien.length < 5) quien.push((el.tagName + '.' + el.className).slice(0, 30) + ' ' + Math.round(r.right - der)); }
      });
      /* Texto recortado: scrollWidth mayor que clientWidth en un elemento de texto. */
      let recort = 0; const rq = [];
      h.querySelectorAll('p,div,span,li,h3,td,th').forEach(el => {
        if (el.scrollWidth > el.clientWidth + 1 && el.clientWidth > 0) { recort++; if (rq.length < 5) rq.push((el.tagName + '.' + el.className).slice(0, 30) + ' ' + el.scrollWidth + '>' + el.clientWidth); }
      });
      const maq = (typeof docMaquetar === 'function') ? docMaquetar(DOC_DEFS[clave], docDatos(), (window.__p31est ? null : null) || docBloquesNuevos(DOC_DEFS[clave], docDatos())) : null;
      return {
        abre: !!(ov && !ov.hidden),
        hoja: { w: Math.round(rh.width), h: Math.round(rh.height), x: Math.round(rh.x) },
        wrap: { w: Math.round(rw.width), h: Math.round(rw.height), scrollW: wrap.scrollWidth, clientW: wrap.clientWidth, scrollH: wrap.scrollHeight },
        desbordeHorizWrap: wrap.scrollWidth - wrap.clientWidth,
        desbordeHorizDoc: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        fs: cs.fontSize, lh: cs.lineHeight, pad: cs.padding,
        fueraDeCaja: fuera, fueraQuien: quien,
        recortados: recort, recortQuien: rq,
        barraH: Math.round(document.querySelector('.doc-bar').getBoundingClientRect().height),
        saltosEnPantalla: h.querySelectorAll('.doc-salto').length,
        hojasPdf: maq ? maq.n : null,
        defSz: DOC_DEFS[clave].sz, defLh: DOC_DEFS[clave].lh, defHojas: DOC_DEFS[clave].hojas
      };
    }, cl);
  }
}
await S.viewport(1440, 900);
await S.esperar(200);

/* ── (c) EDICION CON TECLADO DE VERDAD ── */
R.c = {};
{
  await S.ev(() => { if (typeof docCerrar === 'function') docCerrar(); docAbrir('constancia'); });
  await S.esperar(300);
  const pre = await S.ev(() => {
    const h = document.getElementById('doc-hoja');
    const p = h.querySelector('p.doc-p[contenteditable="true"]');
    if (!p) return { campo: false };
    const r = p.getBoundingClientRect();
    return { campo: true, txt: p.innerText.slice(0, 60), cx: Math.round(r.x + 30), cy: Math.round(r.y + r.height / 2),
             editableAttr: p.getAttribute('contenteditable'), isCE: p.isContentEditable,
             designMode: document.designMode, foco: document.activeElement ? (document.activeElement.tagName + '#' + document.activeElement.id) : null };
  });
  R.c.pre = pre;
  if (pre.campo) {
    await S.clic(pre.cx, pre.cy);
    await S.esperar(150);
    R.c.trasClic = await S.ev(() => {
      const a = document.activeElement;
      const sel = window.getSelection();
      return { foco: a ? (a.tagName + '.' + a.className + '#' + a.id) : null,
               focoEsEditable: !!(a && a.isContentEditable),
               selRango: sel ? sel.rangeCount : 0,
               selEnHoja: !!(sel && sel.rangeCount && document.getElementById('doc-hoja').contains(sel.anchorNode)) };
    });
    await S.escribir('XKZ');
    await S.esperar(200);
    R.c.trasEscribir = await S.ev(() => {
      const h = document.getElementById('doc-hoja');
      const p = h.querySelector('p.doc-p[contenteditable="true"]');
      return { txt: p ? p.innerText.slice(0, 80) : null, tieneXKZ: !!(p && p.innerText.indexOf('XKZ') > -1) };
    });
    await S.tecla('Backspace', 3);
    await S.esperar(200);
    R.c.trasBorrar = await S.ev(() => {
      const h = document.getElementById('doc-hoja');
      const p = h.querySelector('p.doc-p[contenteditable="true"]');
      return { txt: p ? p.innerText.slice(0, 80) : null, tieneXKZ: !!(p && p.innerText.indexOf('XKZ') > -1) };
    });
    /* Pegado: evento paste real con clipboardData, para ver si la app lo trata o lo deja al navegador. */
    R.c.pegar = await S.ev(() => {
      const h = document.getElementById('doc-hoja');
      const p = h.querySelector('p.doc-p[contenteditable="true"]');
      if (!p) return { campo: false };
      p.focus();
      const dt = new DataTransfer();
      dt.setData('text/plain', 'PEGADO');
      dt.setData('text/html', '<b style="color:red">PEGADO</b>');
      const ev = new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true });
      const noCancelado = p.dispatchEvent(ev);
      return { campo: true, defaultNoPrevenido: noCancelado, html: p.innerHTML.slice(0, 120), txt: p.innerText.slice(0, 90) };
    });
  }
}

/* ── (d) el cierre ── */
R.d = await S.ev(() => {
  const o = {};
  const ov = document.getElementById('doc-ov');
  o.ovOnclick = ov ? ov.getAttribute('onclick') : null;
  o.ovRole = ov ? ov.getAttribute('role') + '/' + ov.getAttribute('aria-modal') : null;
  docCerrar(); docAbrir('constancia');
  o.abierta = !ov.hidden;
  /* clic en el fondo: el propio overlay, fuera de la hoja */
  ov.click();
  o.clicEnOverlayCierra = !!ov.hidden;
  if (ov.hidden) docAbrir('constancia');
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  o.escapeCierra = !!ov.hidden;
  /* el visor de la miniatura guardada */
  o.visorFns = ['igAbrirEsq', 'igVerEsquema', 'igAbrirImagen', 'igVisor', 'igCerrarVisor']
    .filter(k => typeof window[k] === 'function');
  return o;
});

/* ── (e) el logo ── */
R.e = await S.ev(() => ({
  claveLs: 'logo_centro_' + (localStorage.getItem('centro_tipo_activo') || 'default'),
  hayLogo: !!localStorage.getItem('logo_centro_' + (localStorage.getItem('centro_tipo_activo') || 'default')),
  validador: typeof LOGO_DATA_OK === 'function',
  cssLogo: (function () { const d = document.createElement('img'); d.className = 'doc-enc-logo'; document.body.appendChild(d);
    const c = getComputedStyle(d); const o = { maxH: c.maxHeight, maxW: c.maxWidth, fit: c.objectFit }; d.remove(); return o; })(),
  cssIni: (function () { const d = document.createElement('span'); d.className = 'doc-enc-ini'; document.body.appendChild(d);
    const c = getComputedStyle(d); const o = { w: c.width, h: c.height, radio: c.borderRadius }; d.remove(); return o; })(),
  /* En el PAPEL: donde pone el maquetador el logo y el circulo. */
  papel: (function () {
    const D = docDatos(), def = DOC_DEFS.constancia;
    const maq = docMaquetar(def, D, docBloquesNuevos(def, D));
    const ops = maq.hojas[0];
    const img = ops.filter(o => o.k === 'img')[0] || null;
    const cir = ops.filter(o => o.k === 'circ')[0] || null;
    const nom = ops.filter(o => o.k === 't' && o.b && o.col && o.col[0] === 31).slice(0, 2);
    return { img: img ? { x: img.x, y: img.y, w: img.w, h: img.h } : null,
             circ: cir ? { x: cir.x, y: cir.y, r: cir.r, s: cir.s } : null,
             nombre: nom.map(o => ({ x: o.x, y: Math.round(o.y * 10) / 10, s: o.s })),
             W: DOC_GEO.W, ML: DOC_GEO.ML, MR: DOC_GEO.MR };
  })(),
  /* En PANTALLA: el orden de los hijos del encabezado. */
  pantalla: (function () {
    docCerrar(); docAbrir('constancia');
    const enc = document.querySelector('.doc-enc');
    if (!enc) return null;
    return Array.prototype.slice.call(enc.children).map(c => {
      const r = c.getBoundingClientRect();
      return { cls: c.className, x: Math.round(r.x), w: Math.round(r.width), txt: (c.textContent || '').slice(0, 24) };
    });
  })()
}));

/* ── (f) la constancia ── */
R.f = await S.ev(() => {
  const def = DOC_DEFS.constancia;
  const bl = def.bloques();
  const p = bl.filter(b => b.t === 'p')[0];
  const D = docDatos();
  const maq = docMaquetar(def, D, docBloquesNuevos(def, D));
  const lineas = maq.hojas[0].filter(o => o.k === 't' || o.k === 'tw')
    .map(o => o.k === 'tw' ? o.ws.map(w => w.s).join(' ') : o.s);
  return {
    bloques: bl.map(b => b.t),
    parrafoCrudo: p ? p.x : null,
    nParrafos: bl.filter(b => b.t === 'p').length,
    lineasPapel: lineas,
    hojas: maq.n,
    firmaAire: (function () { const c = getComputedStyle(document.querySelector('.doc-firma') || document.createElement('div')); return c.marginTop; })()
  };
});

/* ── (g) el Laboratorio ── */
R.g = await S.ev(() => {
  if (window.showTab) showTab('lab');
  const cards = Array.prototype.slice.call(document.querySelectorAll('#tab-lab .lab-card'));
  const conClave = cards.filter(c => c.getAttribute('data-ppt'));
  const sinClave = cards.filter(c => !c.getAttribute('data-ppt'));
  const prot = cards.filter(c => (c.querySelector('.lab-card-hdr') || {}).textContent &&
    c.querySelector('.lab-card-hdr').textContent.indexOf('Prótesis valvulares') > -1)[0] || null;
  const una = conClave[0];
  const chk = una ? una.querySelector('.lab-ppt-chk') : null;
  const hdr = una ? una.querySelector('.lab-card-hdr') : null;
  const rc = chk ? chk.getBoundingClientRect() : null, rh = hdr ? hdr.getBoundingClientRect() : null;
  return {
    totalCards: cards.length, conDataPpt: conClave.length,
    sinDataPpt: sinClave.map(c => ({ ppt_no: (c.getAttribute('data-ppt-no') || '').slice(0, 40),
      tit: ((c.querySelector('.lab-card-hdr') || {}).textContent || '').trim().slice(0, 40) })),
    protesis: prot ? { dataPpt: prot.getAttribute('data-ppt'), dataPptNo: prot.getAttribute('data-ppt-no'),
      tieneChk: !!prot.querySelector('.lab-ppt-chk'), id: (prot.querySelector('.lab-acc-body') || {}).id } : null,
    ejemploChk: (chk && rh) ? { clave: una.getAttribute('data-ppt'), x: Math.round(rc.x), w: Math.round(rc.width),
      h: Math.round(rc.height), aDerechaDe: Math.round(rh.right - rc.right), marcada: chk.querySelector('input').checked,
      title: chk.title, texto: chk.textContent } : null,
    claveLs: typeof LAB_PPT_CHK_KEY !== 'undefined' ? LAB_PPT_CHK_KEY : null,
    grupos: typeof LAB_PPT_GRUPOS !== 'undefined' ? LAB_PPT_GRUPOS.map(g => g.k + ':' + g.cards.length) : null,
    assertClaves: typeof _labPptAssertClaves === 'function' ? _labPptAssertClaves() : null,
    assertGrupos: typeof _labPptAssertGrupos === 'function' ? _labPptAssertGrupos() : null,
    statsFns: ['_labProtStats', '_labProtChartPng', 'labProtRender'].filter(k => typeof window[k] === 'function')
  };
});

R.errores = S.errs.slice(0, 12);
console.log(JSON.stringify(R, null, 1));
S.cerrar();
process.exit(0);
