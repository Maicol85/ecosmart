#!/usr/bin/env node
/**
 * _probe_pant11coapt.mjs - la sincronia de la PROFUNDIDAD DE COAPTACION (PANT-11, commit 4).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * Prueba los DOS caminos que la orden exige, en los dos sentidos:
 *   - el GESTO REAL -teclas de verdad sobre el campo, no `.value = x`-, incluido el BORRADO;
 *   - la SIEMBRA MUDA -asignar `.value` sin evento, que es como restaura un estudio guardado-
 *     seguida del embudo `_recalcModulos`, con los tres casos: uno vacio, el otro vacio, y los
 *     DOS cargados y DISTINTOS, donde no se puede tocar nada.
 * Y mide que el veredicto del TEER y la tarjeta de desfavorables digan lo MISMO con el dato
 * cargado de un lado o del otro.
 *
 * ADVERTENCIA: sin acentos graves dentro de los templates.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/pant11_coapt.json';

const PREP = `(() => {
  ['modalAvisoEco','login-overlay'].forEach((id) => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  const st = document.createElement('style');
  st.textContent = '*,*::before,*::after{transition:none !important;animation:none !important}';
  document.head.appendChild(st);
  const tb = Array.prototype.slice.call(document.querySelectorAll('.tab-btn'))
    .filter((x) => /ETE/i.test(x.textContent || ''))[0];
  if (tb) tb.click();
  /* ADVERTENCIA: LAS SECCIONES DEL ETE NO SON ACORDEONES .sacc: son div id=ete-seccion-CLAVE
     en display:none que abre toggleEteSeccion, y un campo escondido no recibe foco ni teclas
     -Playwright espera «visible» para siempre-. Las dos que esta sonda necesita son morfo
     -las mediciones de la mitral, donde vive ete_prof_coapt- y teer. Se abren por el
     ENCABEZADO REAL, no llamando a la funcion.
     (Sin acentos graves: este comentario vive DENTRO del template de PREP.) */
  ['morfo', 'teer'].forEach((k) => {
    const d = document.getElementById('ete-seccion-' + k);
    if (d && getComputedStyle(d).display === 'none') {
      const h = Array.prototype.slice.call(document.querySelectorAll('h2.card-head'))
        .filter((x) => (x.getAttribute('onclick') || '').indexOf("'" + k + "'") >= 0)[0];
      if (h) h.click();
    }
  });
  return ['morfo', 'teer'].map((k) => { const d = document.getElementById('ete-seccion-' + k);
    return k + '=' + (d ? getComputedStyle(d).display : 'NO EXISTE'); }).join(' ');
})()`;

const FOTO = `(() => {
  const V = (id) => { const e = document.getElementById(id); return e ? String(e.value) : 'NO EXISTE' };
  const T = (id) => { const e = document.getElementById(id);
    return e ? String(e.textContent || '').replace(/\\s+/g, ' ').trim() : 'NO EXISTE' };
  let ver = 'NO';
  try { const st = (typeof teerEstado === 'function') ? teerEstado() : null;
        ver = st ? (st.titulo || '') + ' // ' + (st.nota || '') : 'null'; } catch (e) { ver = 'EXC' }
  return { ete: V('ete_prof_coapt'), teer: V('teer_prof_flail'),
           c4: T('teer-c4'), desfav: T('ete-coapt-interp'), veredicto: ver };
})()`;

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
await page.goto('file://' + FILE);
await page.waitForTimeout(1000);
const res = { _errores: errs };
res._abrio = await page.evaluate(PREP);
await page.waitForTimeout(500);

const existe = await page.evaluate(`(() => !!document.getElementById('teer_prof_flail'))()`);
res._denominador = { campos: existe };

/* ── 1 · GESTO REAL desde el campo del ETE ── */
await page.evaluate(`(() => { ['ete_prof_coapt','teer_prof_flail'].forEach((id) => {
  const e = document.getElementById(id); if (e) { e.value = ''; e.dispatchEvent(new Event('input',{bubbles:true})); } }) })()`);
await page.fill('#ete_prof_coapt', '');
await page.type('#ete_prof_coapt', '12', { delay: 30 });
await page.waitForTimeout(300);
res.gestoEte = await page.evaluate(FOTO);
/* BORRADO con teclas reales */
await page.fill('#ete_prof_coapt', '');
await page.waitForTimeout(300);
res.gestoEteBorrado = await page.evaluate(FOTO);

/* ── 2 · GESTO REAL desde el campo del TEER ── */
await page.type('#teer_prof_flail', '14', { delay: 30 });
await page.waitForTimeout(300);
res.gestoTeer = await page.evaluate(FOTO);
await page.fill('#teer_prof_flail', '');
await page.waitForTimeout(300);
res.gestoTeerBorrado = await page.evaluate(FOTO);

/* ── 3 · SIEMBRA MUDA: tres casos ── */
const muda = async (a, b, k) => {
  await page.evaluate(`((x, y) => {
    const e1 = document.getElementById('ete_prof_coapt'), e2 = document.getElementById('teer_prof_flail');
    if (e1) e1.value = x; if (e2) e2.value = y;
    try { if (typeof _recalcModulos === 'function') _recalcModulos('coapt'); } catch (e) {}
    /* Dos veces: si no es idempotente, la segunda pasada lo delata. */
    try { if (typeof _recalcModulos === 'function') _recalcModulos('coapt'); } catch (e) {}
  })('${a}','${b}')`);
  await page.waitForTimeout(300);
  res[k] = await page.evaluate(FOTO);
};
await muda('12', '', 'mudaSoloEte');
await muda('', '14', 'mudaSoloTeer');
await muda('12', '14', 'mudaDistintos');
await muda('', '', 'mudaVacios');
res._errores = errs;
await ctx.close(); await browser.close();
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log('escrito: ' + OUTF);
