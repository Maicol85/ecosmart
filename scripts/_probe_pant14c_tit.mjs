#!/usr/bin/env node
/**
 * _probe_pant14c_tit.mjs - el titulo del dibujo y los textos chicos (PANT-14c, commit 4).
 * Mide, en los dos modos, los dos temas y los cuatro anchos: el texto del titulo, su caja, si se
 * recorta, si tapa el dibujo, el titulo de la cabecera del esquema, que textos chicos quedan
 * alrededor del dibujo, y el aviso de conexion cuando la libreria 3D NO carga.
 *   node scripts/_probe_pant14c_tit.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const ANCHOS = [1440, 1000, 768, 390];

const CUERPO = (modo) => `(async () => {
  const R = { modo: ${JSON.stringify(modo)} }; const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  const Q = String.fromCharCode(39);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const gesto = (id, v) => { const e = EL(id); if (!e) return 'NO EXISTE';
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return 'ok' };
  /* un estudio con una CIA, para que el titulo tenga algo que decir */
  try { const b0 = bq('showTab(' + Q + 'congenitas2' + Q); if (b0) b0.click() } catch (x) {}
  await esperar(400);
  R.siembra = gesto('ete_cia_tipo', 'secundum');
  await esperar(500);
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (x) {}
  await esperar(420);
  const ab = EL('cc3d-abrir'); if (ab) ab.click();
  await esperar(3500);
  if (${JSON.stringify(modo)} === 'explorar') {
    try { if (typeof cmSetModo === 'function') cmSetModo('explorar') } catch (x) {}
    await esperar(700);
    try { const S = _cm3dEstado().S; S.base = 'tga'; S.bv.tga = 'mus'; S.mods = {};
          if (typeof cm3dBuild === 'function') cm3dBuild() } catch (x) {}
    await esperar(600);
  }
  const caja = n => { if (!n) return null; const r = n.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top) } };
  const t = EL('cm3d-tit'), cv = EL('cm3d-cv');
  R.titulo = t ? (t.textContent || '') : 'NO EXISTE';
  R.tituloCaja = caja(t);
  R.tituloRecorta = t ? (t.scrollWidth > t.clientWidth + 1) : 'NO EXISTE';
  R.tituloFuente = t ? (getComputedStyle(t).fontSize + '/' + getComputedStyle(t).fontWeight) : '-';
  R.tituloPuntero = t ? getComputedStyle(t).pointerEvents : '-';
  R.lienzo = caja(cv);
  /* ¿tapa el dibujo? El titulo esta ARRIBA del lienzo y dentro de su ancho: se mide cuanto del
     lienzo cubre, que es lo que importa, y no si hay interseccion -la hay por diseno-. */
  R.tapaPct = (function () {
    const a = caja(t), b = caja(cv);
    if (!a || !b || !b.w || !b.h) return '-';
    const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    if (ox <= 0 || oy <= 0) return 0;
    return +(100 * (ox * oy) / (b.w * b.h)).toFixed(2);
  })();
  /* el titulo de la cabecera del esquema, con el esquema abierto por su boton real */
  const sb = EL('cm3d-esb'); if (sb) { sb.click(); await esperar(1100) }
  const st = EL('cm3d-schtit');
  R.schTitulo = st ? (st.textContent || '') : 'NO EXISTE';
  R.schCab = (function () { const h = document.querySelector('.cm3d-schh');
    return h ? (h.textContent || '').replace(/\\s+/g, ' ').trim() : 'NO HAY' })();
  if (sb) { sb.click(); await esperar(600) }
  /* los textos chicos alrededor del dibujo */
  R.chicos = (function () {
    const sec = EL('cm3d-shell') ? EL('cm3d-shell').closest('section') : null;
    const raiz = sec || document.getElementById('cm3d-box') || document;
    const o = [];
    Array.prototype.forEach.call(raiz.querySelectorAll('p, .cm3d-nt'), function (n) {
      if (n.closest('#cm3d-ip')) return;
      const s = getComputedStyle(n);
      if (s.display === 'none' || s.visibility === 'hidden') return;
      const tx = (n.textContent || '').replace(/\\s+/g, ' ').trim();
      if (tx) o.push((n.id ? ('#' + n.id + ' ') : '') + s.fontSize + ' :: ' + tx.slice(0, 120));
    });
    return o;
  })();
  R.lineaFaltan = (EL('cc3d-faltan') || {}).textContent || '';
  /* el ⓘ del recuadro: se abre por su boton real y se lee */
  R.globo = (function () {
    const b = EL('cm3d-ib'); if (!b) return 'NO HAY BOTON';
    b.click();
    const ip = EL('cm3d-ip');
    const abierto = ip ? !ip.hidden : false;
    const tx = ip ? (ip.textContent || '').replace(/\\s+/g, ' ').trim() : '';
    const r = { abierto: abierto, esquematico: tx.indexOf('esquemático, no a escala') >= 0,
                rota: tx.indexOf('rota arrastrando') >= 0, chars: tx.length };
    b.click();
    r.cierra = ip ? !!ip.hidden : 'x';
    return r;
  })();
  return R;
})()`;

const SINLIB = `(async () => {
  const R = {}; const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  const Q = String.fromCharCode(39);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (x) {}
  await esperar(420);
  const ab = EL('cc3d-abrir'); if (ab) ab.click();
  await esperar(5000);
  R.three = (typeof window.THREE !== 'undefined');
  const cv = EL('cm3d-cv');
  R.texto = cv ? (cv.textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 160) : 'NO HAY';
  R.avisaConexion = /conexi/i.test(R.texto);
  return R;
})()`;

const br = await _pw.chromium.launch({ channel: 'chrome' });
const salida = {};
for (const tema of ['dark', 'light']) {
  for (const w of ANCHOS) {
    for (const modo of ['estudio', 'explorar']) {
      const pg = await br.newPage({ viewport: { width: w, height: 900 } });
      const errs = [];
      pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 130)));
      try {
        await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
        await pg.evaluate('document.documentElement.setAttribute("data-theme", ' + JSON.stringify(tema) + ')');
        await pg.waitForTimeout(1700);
        const r = await pg.evaluate(CUERPO(modo));
        r.errs = errs.filter(e => !/ERR_FILE_NOT_FOUND|favicon/.test(e));
        salida[tema + ':' + w + ':' + modo] = r;
      } catch (e) { salida[tema + ':' + w + ':' + modo] = { fatal: String(e).slice(0, 200), errs } }
      await pg.close();
    }
  }
}
/* EL CONTROL DEL AVISO DE CONEXION: la libreria 3D bloqueada. */
{
  const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
  await pg.route('**/three*.js', r => r.abort());
  await pg.route('**/three.min.js', r => r.abort());
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 130)));
  try {
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
    await pg.waitForTimeout(1700);
    salida.sinLibreria = await pg.evaluate(SINLIB);
    salida.sinLibreria.errs = errs.filter(e => !/ERR_FILE_NOT_FOUND|favicon|three/i.test(e));
  } catch (e) { salida.sinLibreria = { fatal: String(e).slice(0, 200) } }
  await pg.close();
}
await br.close();
console.log(JSON.stringify(salida, null, 1));
