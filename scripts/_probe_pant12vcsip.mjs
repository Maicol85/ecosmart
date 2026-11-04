#!/usr/bin/env node
/**
 * _probe_pant12vcsip.mjs — la casilla de la cava superior izquierda persistente (PANT-12, 3).
 * Mide: la casilla y su area tactil; el censo de campos guardados; las 441 columnas del Excel;
 * el papel en los tres estilos con la casilla encendida y apagada; guardar, reabrir, limpiar e
 * importar; y que ningun predicado de modulo avanzado la cuente.
 *   node scripts/_probe_pant12vcsip.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const br = await _pw.chromium.launch({ channel: 'chrome' });
const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 150)));
pg.on('console', c => { if (c.type() === 'error') errs.push('CONS ' + c.text().slice(0, 150)) });
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
await pg.waitForTimeout(1500);
const r = await pg.evaluate(`(async () => {
  const R = {}; const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const FN = n => (typeof window[n] === 'function') ? window[n] : null;
  try { limpiarCampos(true) } catch (e) {}
  await esperar(300);
  /* ── el censo de campos guardados: el mismo barrido que guardarInforme ──────────────────── */
  const censo = () => { const o = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
      if (FN('_noEsDelEstudio') && window._noEsDelEstudio(e.id)) return;
      if (e.type === 'checkbox') o[e.id + '__chk'] = e.checked ? '1' : '';
      else o[e.id] = String(e.value || '');
    }); return o };
  const c0 = censo();
  R.censoN = Object.keys(c0).length;
  R.tieneClave = ('otr_var_vcsip__chk' in c0) ? 'si' : 'NO';
  R.tieneNota = ('otr_var_vcsip_nota' in c0) ? 'SI (no deberia)' : 'no';
  /* ── la casilla, su rotulo y su area tactil ─────────────────────────────────────────────── */
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const Q = String.fromCharCode(39);
  try { const b = bq('showTab(' + Q + 'otros' + Q); if (b) b.click() } catch (e) {}
  await esperar(420);
  /* ⚠️ LA PESTANIA NO ALCANZA: la seccion de variantes vive en un acordeon, y un hijo de un
     contenedor plegado informa una caja de cero. Se abre por su encabezado real y se le apagan
     las transiciones antes de medir. */
  try { const cont = document.getElementById('otr-sub-variantes');
    let pa = cont; while (pa) { if (pa.classList && pa.classList.contains('sacc') && !pa.classList.contains('open')) {
      const hh = pa.querySelector('.sacc-hdr'); if (hh) hh.click() } pa = pa.parentElement } } catch (e) {}
  try { const ch0 = document.getElementById('otr_var_vcsip');
    if (ch0 && !ch0.offsetParent) { let pa = ch0.parentElement;
      while (pa) { const cs = getComputedStyle(pa);
        if (cs.display === 'none') pa.style.display = 'block';
        if (cs.maxHeight && cs.maxHeight !== 'none' && parseFloat(cs.maxHeight) === 0) pa.style.maxHeight = 'none';
        pa = pa.parentElement } } } catch (e) {}
  await esperar(360);
  try { document.querySelectorAll('.sacc-body, .lab-acc-body').forEach(x => { x.style.transition = 'none' }) } catch (e) {}
  R.subVisible = (function(){ const c = document.getElementById('otr-sub-variantes');
    return c ? getComputedStyle(c).display : 'NO' })();
  const ch = EL('otr_var_vcsip');
  R.existe = ch ? 'si' : 'NO';
  if (ch) {
    const lab = ch.closest('label'), q = lab ? lab.getBoundingClientRect() : null;
    R.rotulo = lab ? String(lab.textContent || '').trim() : 'NO';
    R.labCaja = q ? { w: Math.round(q.width), h: Math.round(q.height) } : null;
    const sc = EL('otr_var_senocor'), lab2 = sc ? sc.closest('label') : null;
    R.mismoEstilo = (lab && lab2) ? (lab.getAttribute('style') === lab2.getAttribute('style') ? 'si' : 'NO') : 'NO';
    R.hermanos = (lab && lab2) ? (lab.parentNode.parentNode === lab2.parentNode.parentNode ? 'si' : 'NO') : 'NO';
    /* Los cinco puntos del area tactil: cada uno tiene que devolver el propio control o su
       rotulo, no un vecino. */
    if (q && q.width > 0) {
      const pts = [[q.left+3,q.top+3],[q.right-3,q.top+3],[q.left+3,q.bottom-3],[q.right-3,q.bottom-3],
                   [(q.left+q.right)/2,(q.top+q.bottom)/2]];
      R.puntos = pts.map(pp => { const el = document.elementFromPoint(pp[0], pp[1]);
        return (el === ch || el === lab || (lab && lab.contains(el))) ? 1 : 0 }).join('');
    } else { R.puntos = 'caja cero' }
  }
  /* ── el registro ────────────────────────────────────────────────────────────────────────── */
  const REG = window.OTR_HALL || [];
  R.regN = REG.length;
  R.regIdx = REG.map(x => x.id).indexOf('otr_var_vcsip');
  R.regDef = (REG.filter(x => x.id === 'otr_var_vcsip')[0] || {}).def || 'NO';
  R.regSuma = String((REG.filter(x => x.id === 'otr_var_vcsip')[0] || {}).suma);
  /* ── el papel, apagada y encendida, en los TRES estilos ─────────────────────────────────── */
  const N = EL('nombre'), CI = EL('ci');
  if (N) N.value = 'Prueba Pant12'; if (CI) CI.value = '11111111';
  const papel = () => { const o = {};
    ['narrativo','telegrafico','mixto'].forEach(st => {
      try { if (FN('setEstiloInforme')) window.setEstiloInforme(st) } catch (e) {}
      try { if (FN('generarInforme')) window.generarInforme() } catch (e) {}
      const t = EL('informe_texto'), s = EL('en_suma_texto') || EL('ensuma_texto');
      o[st] = { inf: t ? String(t.value || '') : 'NO', suma: s ? String(s.value || '') : 'NO' };
    }); return o };
  const pOff = papel();
  R.offLargos = Object.keys(pOff).map(k => k + '=' + pOff[k].inf.length).join(' ');
  R.offFrase = Object.keys(pOff).map(k => k + '=' + (pOff[k].inf.indexOf('cava superior izquierda persistente') >= 0 ? 'SI' : 'no')).join(' ');
  if (ch) { ch.checked = true; ch.dispatchEvent(new Event('change', { bubbles: true })) }
  await esperar(320);
  const pOn = papel();
  R.onLargos = Object.keys(pOn).map(k => k + '=' + pOn[k].inf.length).join(' ');
  R.onFrase = Object.keys(pOn).map(k => k + '=' + (pOn[k].inf.indexOf('Vena cava superior izquierda persistente.') >= 0 ? 1 : 0)).join(' ');
  R.onSuma = Object.keys(pOn).map(k => k + '=' + (pOn[k].suma.indexOf('cava superior') >= 0 ? 'SI (mal)' : 'no')).join(' ');
  R.sumaIgual = Object.keys(pOn).every(k => pOn[k].suma === pOff[k].suma) ? 'si' : 'NO';
  /* el fragmento del cuerpo, para el ejemplo antes y despues */
  const corte = (s) => { const i = s.indexOf('Seno coronario dilatado'); return i < 0 ? s.slice(-180) : s.slice(i, i + 200) };
  R.ejOff = corte(pOff.mixto.inf); R.ejOn = corte(pOn.mixto.inf);
  /* ── censo con la casilla encendida: el juego de claves no puede cambiar ────────────────── */
  const c1 = censo();
  R.censoN1 = Object.keys(c1).length;
  R.censoIgual = (Object.keys(c0).sort().join(',') === Object.keys(c1).sort().join(',')) ? 'si' : 'NO';
  /* ── el Excel ───────────────────────────────────────────────────────────────────────────── */
  /* ⚠️ LAB_XLS_MAP es un const de MODULO y NO esta en window: preguntarle devuelve
     «SIN MAP» y eso se lee como si el Excel no existiera. Se le pregunta al EXPORTADOR, que es
     su unico dueno, con el estudio de esta escena. */
  try { const f = FN('_labExcelRow');
    const fila = f ? f({ campos: c1, fecha: '2026-11-04' }) : null;
    R.xlsN = fila ? Object.keys(fila).length : 'SIN FN';
    R.xlsTiene = fila ? (Object.keys(fila).some(k => k.indexOf('cava superior izquierda') >= 0) ? 'SI (mal)' : 'no') : 'SIN FN';
  } catch (e) { R.xlsN = 'EXC ' + String(e).slice(0,60) }
  /* ── predicados de modulo avanzado ──────────────────────────────────────────────────────── */
  const inf = { campos: c1 };
  const preds = ['_labUsaTavi','_labUsaOai','_labUsaTeer','_labUsaEteVM','_labUsaWilkins'];
  R.preds = preds.map(n => n + '=' + (FN(n) ? (function(){ try { return !!window[n](inf) } catch (e) { return 'EXC' } })() : 'SIN FN')).join(' ');
  /* ── limpiar y restaurar ────────────────────────────────────────────────────────────────── */
  try { limpiarCampos(true) } catch (e) {}
  await esperar(260);
  R.trasLimpiar = EL('otr_var_vcsip') ? (EL('otr_var_vcsip').checked ? 'SIGUE MARCADA (mal)' : 'apagada') : 'NO';
  /* restaurar desde un blob, que es el camino de un estudio guardado */
  /* ⚠️ LA RESTAURACION SE PRUEBA POR EL CAMINO REAL, que es el barrido que reparte un blob de
     campos sobre el formulario. No hay una restaurarCampos global: lo que hay es el bucle que
     usa editarInforme, asi que se reproduce aqui con la MISMA regla —la clave __chk manda
     sobre la casilla— para medir que la casilla se repone. */
  /* El camino REAL: el bucle de _pdfDeInformeGuardadoArmar reparte el blob con
     el.checked = (c[el.id + "__chk"] === "1") sobre TODO input[id] que no este en la lista de
     campos fuera del estudio. Se reproduce con su MISMA regla, sobre el documento entero, para
     medir que la casilla nueva entra por ese barrido sin tocarlo. */
  try { const blob = { otr_var_vcsip__chk: '1' };
    const fuera = window._CAMPOS_FUERA_DEL_ESTUDIO || null;
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(el => {
      if (fuera && fuera.test(el.id)) return;
      if (el.type === 'checkbox' || el.type === 'radio') { el.checked = (blob[el.id + '__chk'] === '1') }
    });
    R.restRegla = 'barrido con la regla real';
  } catch (e) { R.restExc = String(e).slice(0,80) }
  await esperar(260);
  R.trasRestaurar = EL('otr_var_vcsip') ? (EL('otr_var_vcsip').checked ? 'marcada' : 'NO SE REPUSO') : 'NO';
  /* ── el emisor con un estudio como fuente, que es el camino del PDF y del PPT ───────────── */
  try { const f = FN('otrHallazgos');
    const a = f ? f({ otr_var_vcsip__chk: '1' }) : null;
    R.srcOn = a ? a.map(x => x.id + ':' + x.inf).join(' | ') : 'SIN FN';
    const b = f ? f({}) : null;
    R.srcOff = b ? (b.length + ' hallazgos') : 'SIN FN';
  } catch (e) { R.srcOn = 'EXC ' + String(e).slice(0,80) }
  return R;
})()`).catch(e => ({ ERR: String(e).slice(0, 240) }));
await pg.close(); await br.close();
console.log(JSON.stringify({ archivo: FILE, r, errores: errs.slice(0, 8) }, null, 1));
