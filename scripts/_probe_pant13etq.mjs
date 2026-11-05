#!/usr/bin/env node
/**
 * _probe_pant13etq.mjs - las etiquetas que se despegan del dibujo (PANT-13, commit 1).
 * Mide, en el modulo del corazon maestro Y en el 3D de la transposicion: el ancho del
 * renderer (canvas.width / pixelRatio) contra el ancho del recuadro (host.clientWidth),
 * antes y despues de cambiar de modo y de cambiar el ancho del recuadro, mas la posicion
 * de cada etiqueta y si queda FUERA de la caja del recuadro.
 *   node scripts/_probe_pant13etq.mjs [--file <html>] [--anchos ...]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const ANCHOS = (arg('--anchos') || '1440,1000').split(',').map(Number);
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
    const FN = n => (typeof window[n] === 'function') ? window[n] : null;
    const DISPX = id => { const e = EL(id); return e ? (e.hidden ? 'hidden' : getComputedStyle(e).display + '/' + Math.round(e.getBoundingClientRect().width)) : 'NO' };
    ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
    try { limpiarCampos(true) } catch (e) {}
    const Q = String.fromCharCode(39);
    const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
      b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
    /* medir: ancho del renderer contra ancho del recuadro, y las etiquetas */
    const medir = hostId => {
      const h = EL(hostId); if (!h) return { err: 'NO HOST ' + hostId };
      const cv = h.querySelector('canvas'); if (!cv) return { err: 'NO CANVAS ' + hostId };
      const pr = Math.min(2, window.devicePixelRatio || 1);
      const rendW = Math.round(cv.width / pr);
      const hostW = Math.round(h.clientWidth);
      const cajaH = h.getBoundingClientRect();
      const lbs = Array.prototype.map.call(h.querySelectorAll('.cm3d-lbl, .tga3d-lbl, [class*=lbl]'), e => {
        const q = e.getBoundingClientRect();
        const fuera = (q.left < cajaH.left - 2) || (q.right > cajaH.right + 2) ||
                      (q.top < cajaH.top - 2) || (q.bottom > cajaH.bottom + 2);
        return { t: String(e.textContent || '').slice(0, 8), x: Math.round(q.left - cajaH.left), fuera: fuera };
      });
      const cq = cv.getBoundingClientRect();
      const cssW = Math.round(cq.width);
      const cvX = Math.round(cq.left - cajaH.left);
      /* el centro del dibujo en pantalla es el centro del CANVAS; el centro que la
         proyeccion de las etiquetas supone es la mitad del HOST */
      const centroDibujo = Math.round(cvX + cssW / 2);
      const centroLbl = Math.round(hostW / 2);
      return { rendW: rendW, hostW: hostW, difAncho: hostW - rendW,
               cssW: cssW, cvX: cvX, desborde: Math.round(cvX + cssW - hostW),
               centroDibujo: centroDibujo, centroLbl: centroLbl,
               desfase: centroDibujo - centroLbl,
               nLbl: lbs.length, fuera: lbs.filter(l => l.fuera).length,
               lbl: lbs.map(l => l.t + '@' + l.x + (l.fuera ? '!' : '')).join(' ') };
    };
    /* ============ (A) EL MODULO DEL CORAZON MAESTRO ============ */
    try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
    await esperar(400);
    const bot = EL('cc3d-abrir'); if (bot) bot.click();
    await esperar(3000);
    R.three = (typeof window.THREE === 'undefined') ? 'no' : (window.THREE.REVISION || 'si');
    /* nombres encendidos, para que haya etiquetas que contar (denominador) */
    const chkN = EL('cm3d-noms'); if (chkN && !chkN.checked) { chkN.checked = true; chkN.dispatchEvent(new Event('change', { bubbles: true })); }
    await esperar(600);
    R.cm_modoIni = FN('_cm3dEstado') ? window._cm3dEstado().modo : 'NO';
    R.cm_antes = medir('cm3d-cv');
    /* cambiar a Explorar: aparece la tabla lateral y el recuadro se angosta */
    const bExp = Array.prototype.filter.call(document.querySelectorAll('.cm3d-md'), b => b.getAttribute('data-m') === 'explorar')[0];
    if (bExp) bExp.click();
    await esperar(800);
    R.cm_modoExp = FN('_cm3dEstado') ? window._cm3dEstado().modo : 'NO';
    R.cm_explorar = medir('cm3d-cv');
    /* volver a Segun el estudio: el recuadro se ensancha otra vez */
    const bEst = Array.prototype.filter.call(document.querySelectorAll('.cm3d-md'), b => b.getAttribute('data-m') !== 'explorar')[0];
    if (bEst) bEst.click();
    await esperar(800);
    R.cm_vuelta = medir('cm3d-cv');
    /* control: tras un resize de ventana el motor SI se reajusta */
    window.dispatchEvent(new Event('resize'));
    await esperar(500);
    R.cm_trasResize = medir('cm3d-cv');
    /* ============ (B) EL 3D DE LA TRANSPOSICION ============ */
    /* ⚠️ EL PANEL DEL MODULO SE CIERRA ANTES: con el abierto, el host de la TGA mide 0 px de
       ancho y la medicion sale sobre un denominador vacio (medido). */
    if (bot) bot.click();
    await esperar(600);
    /* ⚠️ LAS SUB-PESTANIAS DE CONGENITAS NO USAN showTab: usan ccSubTab, y sin eso
       #tab-congenitas2 queda en display:none y todo su arbol informa 0 px (medido). */
    try { const b2 = bq('ccSubTab(' + Q + 'congenitas2' + Q); if (b2) b2.click() } catch (e) {}
    await esperar(400);
    const acc = EL('sacc-cc-tga');
    if (acc && !acc.classList.contains('open')) { const hh = document.querySelector('#sacc-cc-tga .sacc-hdr'); if (hh) hh.click() }
    await esperar(700);
    try { document.querySelectorAll('.sacc-body').forEach(b => { b.style.transition = 'none' }) } catch (e) {}
    /* (B1) la seccion abre SIN tipo: el 3D carga el corazon normal y el esquema todavia no esta */
    await esperar(3200);
    R.tga_sinTipo = medir('tga-3d-cv');
    R.tga_esqW0 = Math.round((EL('tga-esq-box') || { getBoundingClientRect: () => ({ width: 0 }) }).getBoundingClientRect().width);
    /* (B2) se carga el tipo: aparece el esquema al lado y el recuadro del 3D se angosta */
    const tt = EL('tga_tipo');
    if (tt) { tt.value = 'dtga'; tt.dispatchEvent(new Event('change', { bubbles: true })); }
    await esperar(1600);
    R.tga_conTipo = medir('tga-3d-cv');
    R.tga_esqW1 = Math.round((EL('tga-esq-box') || { getBoundingClientRect: () => ({ width: 0 }) }).getBoundingClientRect().width);
    await esperar(1600);
    { let n = EL('tga-3d-cv'), ca = [];
      while (n && ca.length < 14) { ca.push(n.tagName + (n.id ? '#' + n.id : '') + ':' + getComputedStyle(n).display + '/' + Math.round(n.getBoundingClientRect().width)); n = n.parentElement }
      R.tga_padres = ca.join(' < ');
      R.tga_botones = Array.prototype.map.call(document.querySelectorAll('button[onclick*=showTab]'), b => String(b.getAttribute('onclick')).slice(0, 34)).join(' | ').slice(0, 400); }
    R.tga_diag = { acc: acc ? (acc.classList.contains('open') ? 'open' : 'cerrado') : 'NO',
      box: DISPX('tga-3d-box'), cv: DISPX('tga-3d-cv'), aviso: (EL('tga-3d-aviso') || {}).textContent,
      estado: (typeof window._tga3dEstado === 'function') ? JSON.stringify(window._tga3dEstado()).slice(0, 160) : 'NO' };
    if (typeof window.tgaSync === 'function') { try { window.tgaSync() } catch (e) {} }
    if (typeof window.tga3dBoot === 'function') { try { window.tga3dBoot() } catch (e) {} }
    await esperar(2500);
    R.tga_diag2 = { box: DISPX('tga-3d-box'), cv: DISPX('tga-3d-cv'), nCanvas: document.querySelectorAll('#tga-3d-cv canvas').length };
    const chkT = EL('tga-3d-noms'); if (chkT && !chkT.checked) { chkT.checked = true; chkT.dispatchEvent(new Event('change', { bubbles: true })); }
    await esperar(600);
    R.tga_antes = medir('tga-3d-cv');
    /* cambiar el ancho del recuadro SIN resize de ventana: es el escenario del defecto */
    const hT = EL('tga-3d-cv');
    if (hT && hT.parentElement) { hT.parentElement.style.maxWidth = '420px'; }
    await esperar(700);
    R.tga_angosto = medir('tga-3d-cv');
    if (hT && hT.parentElement) { hT.parentElement.style.maxWidth = ''; }
    await esperar(700);
    R.tga_ancho = medir('tga-3d-cv');
    return R;
  })()`).catch(e => ({ EXC: String(e).slice(0, 220) }));
  r.errores = errs.slice(0, 6);
  OUT['w' + w] = r;
  await pg.close();
}
await br.close();
console.log(JSON.stringify(OUT, null, 1));
