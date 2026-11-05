#!/usr/bin/env node
/**
 * _probe_pant14pdf2.mjs - los dos caminos que le faltan al commit 2 (PANT-14).
 * (A) el AVISO del boton se lee completo a los cuatro anchos, en los dos modos;
 * (B) guardar un estudio con la casilla encendida, reabrirlo y ver que el PDF lo lleva.
 *   node scripts/_probe_pant14pdf2.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const br = await _pw.chromium.launch({ channel: 'chrome' });
const out = { aviso: {}, guardado: null };

const PRE = `
  const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  const Q = String.fromCharCode(39);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const gesto = (id, v) => { const e = EL(id); if (!e) return 'NO ' + id;
    if (e.type === 'checkbox') { e.checked = (v === true || v === 'si') } else { e.value = v }
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return 'ok' };
`;

/* ── (A) el aviso a los cuatro anchos ── */
for (const w of [1440, 1000, 768, 390]) {
  const pg = await br.newPage({ viewport: { width: w, height: 900 } });
  pg.on('dialog', d => { try { d.accept() } catch (e) {} });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(1600);
  out.aviso[w] = await pg.evaluate(`(async () => {${PRE}
    const R = {};
    try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
    await esperar(400);
    const ab = EL('cc3d-abrir'); if (ab) ab.click();
    await esperar(3000);
    const leer = (etq) => { const n = EL('cm3d-pdfn');
      if (!n) return { etq: etq, ERR: 'NO HAY NOTA' };
      const cs = getComputedStyle(n), cj = n.getBoundingClientRect();
      return { etq: etq, chars: n.textContent.trim().length,
               ancho: Math.round(cj.width), alto: Math.round(cj.height),
               scrollW: n.scrollWidth, clientW: n.clientWidth,
               recortado: (n.scrollWidth > n.clientWidth + 1) || (n.scrollHeight > n.clientHeight + 1),
               overflow: cs.overflow + '/' + cs.textOverflow, lineas: Math.round(cj.height / parseFloat(cs.lineHeight || '14')) };
    };
    /* modo «Explorar»: el aviso largo */
    const me = document.querySelector('.cm3d-md[data-m="explorar"]'); if (me) { me.click(); await esperar(700) }
    R.explorar = leer('explorar');
    const ms = document.querySelector('.cm3d-md[data-m="estudio"]'); if (ms) { ms.click(); await esperar(700) }
    R.vacio = leer('vacio');
    /* con una transposicion cargada: el aviso mas largo de los cuatro */
    try { const b1 = bq('showTab(' + Q + 'congenitas2' + Q); if (b1) b1.click() } catch (e) {}
    await esperar(350); gesto('tga_tipo', 'dtga'); await esperar(300);
    try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
    await esperar(500);
    const ab2 = EL('cc3d-abrir'); if (ab2 && ab2.getAttribute('aria-pressed') !== 'true') { ab2.click(); await esperar(2600) }
    R.tga = leer('tga');
    /* desplazamiento horizontal del cuerpo */
    R.scrollH = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
    return R;
  })()`);
  await pg.close();
}

/* ── (B) guardar con la casilla encendida, reabrir y generar el PDF ── */
{
  const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 130)));
  pg.on('dialog', d => { try { d.accept() } catch (e) {} });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(1700);
  out.guardado = await pg.evaluate(`(async () => {${PRE}
    const R = {};
    window.confirm = () => true; window.alert = () => {};
    /* «Guardar imagenes con los estudios» tiene que estar PRENDIDO: sin eso el slot vive solo
       en memoria y reabrir no puede traerlo. Es la condicion que PANT-13 ya declara. */
    R.cfg = (() => { const c = EL('cfg-guardar-imagenes');
      if (!c) return 'NO HAY CASILLA';
      if (!c.checked) { c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })) }
      return c.checked ? 'prendida' : 'no se pudo' })();
    const nm = EL('nombre'); if (nm) { nm.value = 'Prueba guardado P14'; nm.dispatchEvent(new Event('input', { bubbles: true })) }
    const ci = EL('ci'); if (ci) { ci.value = '5550001'; ci.dispatchEvent(new Event('input', { bubbles: true })) }
    try { const b1 = bq('showTab(' + Q + 'congenitas2' + Q); if (b1) b1.click() } catch (e) {}
    await esperar(400);
    R.siembra = gesto('ete_cia_tipo', 'secundum');
    await esperar(300);
    try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
    await esperar(500);
    const ab = EL('cc3d-abrir'); if (ab) ab.click();
    await esperar(3200);
    const b = EL('cm3d-pdfb');
    R.antesDeGuardar = b ? { apagado: b.disabled, txt: b.textContent.trim() } : 'NO HAY';
    if (b && !b.disabled) { b.click(); await esperar(2600) }
    R.trasTocar = { incluido: (typeof esqEstaIncluido === 'function') ? esqEstaIncluido('cm3d') : 'SIN FN',
                    txt: EL('cm3d-pdfb') ? EL('cm3d-pdfb').textContent.trim() : '' };
    /* GUARDAR, por la puerta real */
    let idGuardado = null;
    /* ⚠️ GUARDAR TAMBIEN PASA POR LA TARJETA DE SEVERIDADES, y el guardado real ocurre al
       confirmarla: sin este clic la superposicion quedaba abierta y bloqueaba TODO lo de abajo
       -el guardado, Nuevo estudio y el PDF daban cero, que es un denominador vacio-. */
    const pGuardado = new Promise(res => { try { if (typeof guardarInforme === 'function') { guardarInforme(() => res(true)) } else res('SIN FN') } catch (e) { res('EXC') }
                               setTimeout(() => res('RELOJ'), 12000) });
    await esperar(700);
    R.tarjetaAlGuardar = !!EL('pdf-review-overlay');
    try { const cf = EL('rev-confirm'); if (cf) cf.click() } catch (e) {}
    R.guardadoRes = await pGuardado;
    await esperar(1600);
    try { const lst = (typeof getInformes === 'function') ? getInformes() : [];
          R.nGuardados = lst.length; idGuardado = lst.length ? lst[lst.length - 1].id : null } catch (e) { R.nGuardados = 'EXC' }
    R.idGuardado = idGuardado;
    /* «Nuevo estudio» y despues REABRIR el guardado */
    /* ⚠️ EL BOTON ES nuevoEstudio() Y NO limpiarCampos: bq(-limpiarCampos-) NO LO ENCUENTRA, y
       sin eso el paso no corria y -incluido = true- era un DENOMINADOR VACIO y no un hallazgo. */
    R.botonNuevo = !!bq('nuevoEstudio');
    try { const bn = bq('nuevoEstudio'); if (bn) bn.click() } catch (e) {}
    await esperar(1000);
    try { const sn = bq('neContinuarSinGuardar'); if (sn) sn.click() } catch (e) {}
    await esperar(1600);
    /* ⚠️ CON SU DENOMINADOR: sin comprobar que el formulario QUEDO VACIO, un -incluido = true-
       no distingue -la casilla sobrevive- de -Nuevo estudio no corrio-. */
    R.trasNuevo = { incluido: (typeof esqEstaIncluido === 'function') ? esqEstaIncluido('cm3d') : 'SIN FN',
                    slot: (typeof esqSlotIdx === 'function') ? esqSlotIdx('cm3d') : 'SIN FN',
                    nombre: EL('nombre') ? EL('nombre').value : 'NO HAY',
                    cia: EL('ete_cia_tipo') ? EL('ete_cia_tipo').value : 'NO HAY',
                    overlay: !!EL('pdf-review-overlay') };
    if (idGuardado && typeof editarInforme === 'function') { try { editarInforme(idGuardado) } catch (e) { R.errEditar = String(e).slice(0, 110) } }
    await esperar(3200);
    R.trasReabrir = { nombre: EL('nombre') ? EL('nombre').value : '', cia: EL('ete_cia_tipo') ? EL('ete_cia_tipo').value : '',
                      incluido: (typeof esqEstaIncluido === 'function') ? esqEstaIncluido('cm3d') : 'SIN FN',
                      slot: (typeof esqSlotIdx === 'function') ? esqSlotIdx('cm3d') : 'SIN FN' };
    /* el PDF del estudio reabierto */
    if (typeof window.jspdf !== 'undefined' && window.jspdf.jsPDF) {
      const Orig = window.jspdf.jsPDF; const reg = { txt: [], imgs: 0 };
      window.jspdf.jsPDF = function () { const d = new Orig(...arguments);
        const ot = d.text.bind(d); d.text = function (t) { reg.txt.push(String(t)); return ot.apply(null, arguments) };
        const oi = d.addImage ? d.addImage.bind(d) : null;
        if (oi) d.addImage = function () { reg.imgs++; return oi.apply(null, arguments) };
        d.save = function () { return true }; d.output = function () { return '' }; return d };
      Object.keys(Orig).forEach(k => { try { window.jspdf.jsPDF[k] = Orig[k] } catch (e) {} });
      try { const bp = EL('hdr-pdf-quick'); if (bp) bp.click() } catch (e) {}
      await esperar(700);
      try { const cf = EL('rev-confirm'); if (cf) cf.click() } catch (e) {}
      await esperar(5200);
      window.jspdf.jsPDF = Orig;
      const todo = reg.txt.join(' | ');
      R.pdfReabierto = { nTxt: reg.txt.length, chars: todo.length, nImg: reg.imgs,
                         etiqueta: todo.indexOf('Corazón en 3D de congénitas') >= 0 };
    } else { R.pdfReabierto = { ERR: 'NO HAY jsPDF' } }
    return R;
  })()`);
  out.guardado.errs = errs.filter(e => !/ERR_FILE_NOT_FOUND|favicon/.test(e));
  await pg.close();
}
await br.close();
console.log(JSON.stringify(out, null, 1));
