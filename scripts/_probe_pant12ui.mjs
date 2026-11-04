#!/usr/bin/env node
/**
 * _probe_pant12ui.mjs — los dos modos, la tabla lateral y el globo (PANT-12, commit 5).
 * Mide: los dos modos y el cambio entre ellos; los controles y la tabla alcanzables con teclado;
 * el globo abriendo y cerrando por las TRES vias con la letra unica; la tabla a la derecha desde
 * 900 px y apilada debajo; y que lo didactico no escriba ningun campo.
 *   node scripts/_probe_pant12ui.mjs [--file <html>] [--anchos ...]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const ANCHOS = (arg('--anchos') || '1440,1000,768,390').split(',').map(Number);
const br = await _pw.chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE };
for (const w of ANCHOS) {
  const pg = await br.newPage({ viewport: { width: w, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 130)));
  pg.on('console', c => { if (c.type() === 'error') errs.push('CONS ' + c.text().slice(0, 130)) });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(1400);
  const r = await pg.evaluate(`(async () => {
    const R = {}; const EL = id => document.getElementById(id);
    const esperar = ms => new Promise(z => setTimeout(z, ms));
    const caja = el => { if (!el) return null; const q = el.getBoundingClientRect();
      return { w: Math.round(q.width), h: Math.round(q.height), x: Math.round(q.left), y: Math.round(q.top) } };
    const FN = n => (typeof window[n] === 'function') ? window[n] : null;
    const DISP = id => { const e = EL(id); return e ? (e.hidden ? 'hidden' : getComputedStyle(e).display) : 'NO' };
    ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
    try { limpiarCampos(true) } catch (e) {}
    const censo = () => { const o = {};
      document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
        if (FN('_noEsDelEstudio') && window._noEsDelEstudio(e.id)) return;
        o[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || '');
      }); return o };
    const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
      b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
    const Q = String.fromCharCode(39);
    try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
    await esperar(380);
    const bot = EL('cc3d-abrir'); if (bot) bot.click();
    await esperar(2900);
    try { document.querySelectorAll('.sacc-body').forEach(b => { b.style.transition = 'none' }) } catch (e) {}
    const c0 = JSON.stringify(censo());
    R.three = (typeof window.THREE === 'undefined') ? 'no' : (window.THREE.REVISION || 'si');
    /* ── (A) EL MODO QUE ABRE POR OMISION ────────────────────────────────────────────────── */
    const st = FN('_cm3dEstado') ? window._cm3dEstado() : null;
    R.modoInicial = st ? st.modo : 'NO';
    R.ctlOculto = DISP('cm3d-ctl');
    R.sideOculto = DISP('cm3d-side');
    R.estbVisible = DISP('cm3d-estb');
    R.btnModos = Array.prototype.map.call(document.querySelectorAll('.cm3d-md'),
      b => b.getAttribute('data-m') + '=' + b.getAttribute('aria-pressed') + '/' + Math.round(b.getBoundingClientRect().height)).join(' ');
    R.baseInicial = st ? st.S.base : 'NO';
    /* ── (B) EL CAMBIO A EXPLORAR ────────────────────────────────────────────────────────── */
    const bExp = Array.prototype.filter.call(document.querySelectorAll('.cm3d-md'), b => b.getAttribute('data-m') === 'explorar')[0];
    if (bExp) bExp.click();
    await esperar(600);
    R.modoExp = st ? st.modo : 'NO';
    R.ctlExp = DISP('cm3d-ctl');
    R.sideExp = DISP('cm3d-side');
    R.estbExp = DISP('cm3d-estb');
    R.baseBtns = document.querySelectorAll('#cm3d-baseb button').length;
    R.modBtns = document.querySelectorAll('#cm3d-modb button').length;
    R.presBtns = document.querySelectorAll('#cm3d-presb button').length;
    R.filas = document.querySelectorAll('#cm3d-sidebody .cm3d-srow').length;
    R.secciones = Array.prototype.map.call(document.querySelectorAll('#cm3d-sidebody .cm3d-sidet'), e => e.textContent).join(' | ');
    R.filasConLinea = Array.prototype.filter.call(document.querySelectorAll('#cm3d-sidebody .cm3d-srow'),
      b => (b.querySelector('.cm3d-srd') || {}).textContent).length;
    R.filasAlto = Array.prototype.map.call(document.querySelectorAll('#cm3d-sidebody .cm3d-srow'),
      b => Math.round(b.getBoundingClientRect().height)).filter(x => x < 44).length;
    /* la tabla a la derecha desde 900 px */
    const col = caja(EL('cm3d-col')), sd = caja(EL('cm3d-side'));
    R.ladoALado = (col && sd && sd.w > 0) ? (sd.x >= col.x + col.w - 2 ? 'al lado' : 'apilada') : 'sin caja';
    R.sideCaja = sd;
    R.sideScroll = EL('cm3d-side') ? (EL('cm3d-side').scrollHeight > EL('cm3d-side').clientHeight + 2 ? 'si' : 'no') : 'NO';
    /* ── (C) TOCAR UNA FILA LA APLICA, Y LAS BLOQUEADAS QUEDAN APAGADAS ──────────────────── */
    const fila = t => Array.prototype.filter.call(document.querySelectorAll('#cm3d-sidebody .cm3d-srow'),
      b => String((b.querySelector('.cm3d-srn') || {}).textContent || '').indexOf(t) === 0)[0];
    const fEb = fila('Anomal');
    if (fEb) fEb.click();
    await esperar(400);
    R.trasTocarEbstein = st ? st.S.base : 'NO';
    const fEis = fila('Eisenmenger');
    R.eisBloqueado = fEis ? (fEis.disabled ? 'apagada' : 'NO') : 'NO EXISTE';
    R.eisMotivo = fEis ? String(fEis.title || (fEis.querySelector('.cm3d-srd') || {}).textContent || '').slice(0, 70) : 'NO';
    /* vuelta al corazon normal */
    const fN = fila('Coraz');
    if (fN) fN.click();
    await esperar(400);
    R.trasVolver = st ? st.S.base : 'NO';
    /* ── (D) EL GLOBO, SUS TRES VIAS Y SU LETRA ──────────────────────────────────────────── */
    const ib = EL('cm3d-ib'), ip = EL('cm3d-ip');
    R.ibCaja = caja(ib);
    R.ibGlifo = ib ? String(ib.textContent || '').trim() : 'NO';
    R.ipInicial = ip ? (ip.hidden ? 'cerrado' : 'ABIERTO (mal)') : 'NO';
    R.ariaIni = ib ? ib.getAttribute('aria-expanded') : 'NO';
    if (ib) { try { ib.scrollIntoView({ block: 'center' }) } catch (z) {} }
    await esperar(160);
    if (ib) ib.click();
    await esperar(220);
    R.ipTrasBoton = ip ? (ip.hidden ? 'NO ABRIO' : 'abierto') : 'NO';
    R.ariaAbierto = ib ? ib.getAttribute('aria-expanded') : 'NO';
    R.letraCuerpo = (function () { const e = EL('cm3d-inf'); return e ? getComputedStyle(e).fontSize : 'NO' })();
    R.letraCirc = (function () { const e = EL('cm3d-circ'); return e ? getComputedStyle(e).fontSize : 'NO' })();
    R.letraRef = (function () { const e = EL('cm3d-ref'); return e ? getComputedStyle(e).fontSize : 'NO' })();
    R.textos = ['cm3d-circ','cm3d-inf','cm3d-ref','cm3d-src'].map(i => i + '=' + ((EL(i) || {}).textContent || '').length).join(' ');
    /* via 1: el mismo boton */
    if (ib) ib.click();
    await esperar(200);
    R.cierraBoton = ip ? (ip.hidden ? 'si' : 'NO') : 'NO';
    /* via 2: un clic afuera */
    if (ib) ib.click(); await esperar(200);
    document.body.click(); await esperar(200);
    R.cierraAfuera = ip ? (ip.hidden ? 'si' : 'NO') : 'NO';
    /* via 3: Escape */
    if (ib) ib.click(); await esperar(200);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await esperar(200);
    R.cierraEscape = ip ? (ip.hidden ? 'si' : 'NO') : 'NO';
    /* ── (E) TECLADO: todo control alcanzable ────────────────────────────────────────────── */
    R.focoOk = ['cm3d-ins','cm3d-nom','cm3d-fc','cm3d-pausar','cm3d-frente','cm3d-ib'].map(i => {
      const e = EL(i); if (!e) return i + '=NO';
      try { e.focus() } catch (z) {}
      return i + '=' + (document.activeElement === e ? 1 : 0) }).join(' ');
    R.filasFoco = (function () { const b = document.querySelectorAll('#cm3d-sidebody .cm3d-srow')[0];
      if (!b) return 'NO'; try { b.focus() } catch (z) {}
      return document.activeElement === b ? 'si' : 'NO' })();
    /* ── (F) EL CONTADOR DE GLOBOS DEL REGISTRO no se mueve ──────────────────────────────── */
    R.vinfoN = (typeof window.VINFO === 'object' && window.VINFO) ? Object.keys(window.VINFO).length : 'no esta en window';
    /* ── (G) LO DIDACTICO NO ESCRIBE NINGUN CAMPO ───────────────────────────────────────── */
    const c1 = censo(), c0o = JSON.parse(c0);
    const mov = Object.keys(c1).filter(k => String(c1[k]) !== String(c0o[k]));
    R.censoIgual = mov.length === 0 ? 'si' : 'NO';
    R.censoMovidos = mov.slice(0, 8).join(',');
    /* ── (H) VOLVER AL MODO ESTUDIO ─────────────────────────────────────────────────────── */
    const bEst = Array.prototype.filter.call(document.querySelectorAll('.cm3d-md'), b => b.getAttribute('data-m') === 'estudio')[0];
    if (bEst) bEst.click();
    await esperar(500);
    R.modoVuelta = st ? st.modo : 'NO';
    R.baseVuelta = st ? st.S.base : 'NO';
    R.modsVuelta = st ? JSON.stringify(st.S.mods) : 'NO';
    R.ctlVuelta = DISP('cm3d-ctl'); R.sideVuelta = DISP('cm3d-side');
    /* ── (I) desplazamiento horizontal y texto recortado ────────────────────────────────── */
    const bx = EL('cm3d-box');
    R.scrollH = bx ? Math.max(0, bx.scrollWidth - bx.clientWidth) : 'NO';
    R.recortados = Array.prototype.filter.call(
      document.querySelectorAll('#cm3d-box .cm3d-srn, #cm3d-box .cm3d-tit, #cm3d-box .cm3d-sg, #cm3d-box .cm3d-lab'),
      e => e.scrollWidth > e.clientWidth + 2).length;
    return R;
  })()`).catch(e => ({ ERR: String(e).slice(0, 240) }));
  OUT['w' + w] = { r, errores: errs.slice(0, 6) };
  await pg.close();
}
await br.close();
console.log(JSON.stringify(OUT, null, 1));
