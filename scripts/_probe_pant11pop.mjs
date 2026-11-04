#!/usr/bin/env node
/**
 * _probe_pant11pop.mjs - la sincronia entre la ecografia pulmonar del BASICO y la tarjeta
 * «Pleura y pulmon» del POSOPERATORIO (PANT-11, commit 6).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * Mide, con gestos reales y con siembra muda:
 *   - la GUARDA: popModuloEnUso() tiene que dar falso en un formulario en blanco Y con SOLO los
 *     cinco campos espejados cargados -si no, el espejo se autoriza a si mismo-;
 *   - basico -> posoperatorio con la guarda cerrada y con la guarda abierta;
 *   - posoperatorio -> basico, que escribe siempre;
 *   - el BORRADO: el otro lado se vacia SOLO si tiene el valor equivalente;
 *   - «hemotorax», que no tiene equivalente: ni se escribe ni se borra;
 *   - la reconciliacion muda, idempotente.
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
const OUTF = arg('--out') || '/tmp/pant11_pop.json';

const PREP = `(() => {
  ['modalAvisoEco','login-overlay'].forEach((id) => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  const st = document.createElement('style');
  st.textContent = '*,*::before,*::after{transition:none !important;animation:none !important}';
  document.head.appendChild(st);
  return !!document.getElementById('pua_derrame_der');
})()`;

/* El gesto REAL de un select: asignar y despachar change, que es lo que el navegador hace.
   PANT-5 midio que selectOption de Playwright no produce un evento de confianza, asi que lo que
   se prueba es la cadena de manejadores, no el gesto del sistema operativo. */
const G = `((id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
  e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); return e.value })`;
const MUDO = `((o) => { Object.keys(o).forEach((k) => { const e = document.getElementById(k);
  if (e) e.value = o[k]; }); return true })`;
const FOTO = `(() => {
  const V = (id) => { const e = document.getElementById(id); return e ? String(e.value) : 'NO EXISTE' };
  let uso = 'NO';
  try { uso = (typeof popModuloEnUso === 'function') ? String(popModuloEnUso()) : 'no existe' } catch (e) { uso = 'EXC' }
  return { enUso: uso,
    bDer: V('pua_derrame_der'), bIzq: V('pua_derrame_izq'), bTipo: V('pua_derrame_tipo'),
    bCons: V('pua_consol'), bLado: V('pua_consol_lado'), bLB: V('pua_lineasb'),
    bComp: V('pua_derrame'),
    pDer: V('pop_pleura_der'), pIzq: V('pop_pleura_izq'), pCar: V('pop_pleura_caract'),
    pCons: V('pop_pulmon_consol'), pLB: V('pop_pulmon_lineasb'), pNeu: V('pop_pulmon_neumo') };
})()`;
const LIMPIA = `(() => { try { limpiarCampos(true) } catch (e) {} return true })()`;

const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
await page.goto('file://' + FILE);
await page.waitForTimeout(1000);
const res = {};
res._denominador = { campos: await page.evaluate(PREP) };

const foto = () => page.evaluate(FOTO);
const g = (id, v) => page.evaluate(`(${G})('${id}','${v}')`);
const mudo = (o) => page.evaluate(`(${MUDO})(${JSON.stringify(o)})`);
const limpia = () => page.evaluate(LIMPIA);
const recalc = () => page.evaluate(`(() => { try { _recalcModulos('p11'); _recalcModulos('p11'); } catch (e) {} return true })()`);

/* 1 · la guarda sobre un formulario en blanco y con SOLO los campos espejados */
await limpia(); await page.waitForTimeout(300);
res.blanco = await foto();
await g('pop_pleura_der', 'moderado'); await page.waitForTimeout(250);
res.soloEspejados = await foto();

/* 2 · basico -> posoperatorio con la GUARDA CERRADA */
await limpia(); await page.waitForTimeout(300);
await g('pua_derrame', 'si'); await g('pua_derrame_der', 'severo');
await g('pua_derrame_tipo', 'tabicado'); await g('pua_consol', 'si'); await g('pua_consol_lado', 'izq');
await g('pua_lineasb', 'ausentes');
await page.waitForTimeout(300);
res.basicoGuardaCerrada = await foto();

/* 3 · basico -> posoperatorio con la GUARDA ABIERTA (otro campo del posoperatorio cargado) */
await g('pop_cx_horas', '6'); await page.waitForTimeout(250);
await g('pua_derrame_der', 'leve'); await g('pua_derrame_tipo', 'tabicado');
await g('pua_consol', 'si'); await g('pua_consol_lado', 'izq'); await g('pua_lineasb', 'ausentes');
await page.waitForTimeout(300);
res.basicoGuardaAbierta = await foto();

/* 4 · posoperatorio -> basico, SIEMPRE */
await limpia(); await page.waitForTimeout(300);
await g('pop_pleura_der', 'leve'); await g('pop_pleura_izq', 'severo');
await g('pop_pleura_caract', 'loculado'); await g('pop_pulmon_consol', 'bilateral');
await g('pop_pulmon_lineasb', 'ausentes');
await page.waitForTimeout(300);
res.popAlBasico = await foto();

/* 5 · HEMOTORAX: no tiene equivalente. Ni escribe ni borra. */
await g('pop_pleura_caract', 'hemotorax'); await page.waitForTimeout(250);
res.hemotorax = await foto();

/* 6 · BORRADO desde el posoperatorio */
await g('pop_pleura_caract', ''); await g('pop_pleura_der', ''); await g('pop_pulmon_consol', '');
await page.waitForTimeout(300);
res.popBorrado = await foto();

/* 7 · RECONCILIACION MUDA, dos pasadas */
await limpia(); await page.waitForTimeout(300);
await mudo({ pop_pleura_der: 'moderado', pop_pleura_izq: 'leve', pop_pleura_caract: 'loculado',
             pop_pulmon_consol: 'der', pop_cx_horas: '6' });
await recalc(); await page.waitForTimeout(400);
res.mudaPop = await foto();
/* los dos lados cargados y DISTINTOS: no se toca nada */
await limpia(); await page.waitForTimeout(300);
await mudo({ pop_pleura_der: 'moderado', pua_derrame_der: 'severo', pop_cx_horas: '6' });
await recalc(); await page.waitForTimeout(400);
res.mudaDistintos = await foto();

res._errores = errs;
await ctx.close(); await browser.close();
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log('escrito: ' + OUTF);
