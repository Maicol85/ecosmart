#!/usr/bin/env node
/* _probe_pant14c_mut.mjs — mide los numeros que las NUEVE mutaciones sobrevivientes del barrido
   de PANT-14c necesitan para poder cerrarse con una condicion de caso y no con una sonda.

   Lo que mide:
     (1) cuanto difiere el punto del anillo calculado con la TANGENTE del calculado bajando en Y,
         en las cinco variantes — para saber si la mutacion 21 es observable y con que tolerancia;
     (2) el cociente de luminancia relativa entre los dos violetas y de cada uno contra el fondo;
     (3) la distancia de TONO de cada violeta al azul;
     (4) los tonos declarados por tramo del tunel del esquema;
     (5) si popHayDatos() da true con SOLO la casilla del esquema encendida (el control de la 11);
     (6) la relacion ancho/alto que devuelve _cm3dCaptura con y sin recorte.

   Se corre con Playwright sobre el Chrome del sistema. No escribe nada en el arbol.
*/
import { chromium } from '/Users/maicoldossantos/.pwtmp/node_modules/playwright/index.mjs';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const ARCH = process.argv.includes('--file')
  ? process.argv[process.argv.indexOf('--file') + 1]
  : path.resolve('index.html');

const CUERPO = `
  const esperar = (ms) => new Promise(r => setTimeout(r, ms));
  const out = {};
  try { sessionStorage.setItem('ett_auth', '1') } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco() } catch (e) {}

  /* ── (1) la tangente contra el eje Y ── */
  const esc = (v, ck) => { _cm3d.S.base = 'tga'; _cm3d.S.bv.tga = v;
    _cm3d.S.mods = {}; _cm3d.S.ck = ck || {};
    try { return cmEscena(_cm3d.S) } catch (e) { return null } };
  const OB = (typeof CM_OBS_BAJO !== 'undefined') ? CM_OBS_BAJO : 0.30;
  out.tang = [];
  ['d', 'jat', 'mus', 'ras', 'cc'].forEach(function (v) {
    const s = esc(v, { tobs: true });
    if (!s) { out.tang.push([v, 'SIN ESCENA']); return }
    const g = (s.ex || []).filter(function (x) { return x.t === 'ring' && x.col === CM_C.grey });
    const ao = (s.ar || []).filter(function (x) { return x.c === CM_C.red })[0];
    if (g.length !== 1 || !ao) { out.tang.push([v, 'g=' + g.length + ' ao=' + !!ao]); return }
    const p0 = ao.p[0], p1 = ao.p[1];
    const d = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
    const n = Math.sqrt(d[0]*d[0] + d[1]*d[1] + d[2]*d[2]) || 1;
    const t = [d[0]/n, d[1]/n, d[2]/n];
    const conT = [p0[0] - t[0]*OB, p0[1] - t[1]*OB, p0[2] - t[2]*OB];
    const conY = [p0[0], p0[1] - OB, p0[2]];
    const c = g[0].c;
    const dT = Math.sqrt(Math.pow(c[0]-conT[0],2) + Math.pow(c[1]-conT[1],2) + Math.pow(c[2]-conT[2],2));
    const dY = Math.sqrt(Math.pow(c[0]-conY[0],2) + Math.pow(c[1]-conY[1],2) + Math.pow(c[2]-conY[2],2));
    const sep = Math.sqrt(Math.pow(conT[0]-conY[0],2) + Math.pow(conT[1]-conY[1],2) + Math.pow(conT[2]-conY[2],2));
    out.tang.push([v, 'alTang=' + dT.toFixed(4), 'alY=' + dY.toFixed(4),
                   'separacion=' + sep.toFixed(4), 'nrm=' + (g[0].nrm ? g[0].nrm.map(function(q){return q.toFixed(3)}).join(',') : 'NO'),
                   'tg=' + t.map(function(q){return q.toFixed(3)}).join(','),
                   'r=' + (g[0].r != null ? g[0].r.toFixed(3) : 'NO') + ' rAo=' + (ao.r ? ao.r[0].toFixed(3) : 'NO')]);
  });

  /* ── (2) y (3) luminancia y tono ── */
  const lin = (c) => { c = c / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) };
  const lum = (h) => { const r = (h >> 16) & 255, g2 = (h >> 8) & 255, b = h & 255;
    return 0.2126 * lin(r) + 0.7152 * lin(g2) + 0.0722 * lin(b) };
  const tono = (h) => { const r = ((h >> 16) & 255) / 255, g2 = ((h >> 8) & 255) / 255, b = (h & 255) / 255;
    const mx = Math.max(r, g2, b), mn = Math.min(r, g2, b), d = mx - mn;
    if (!d) return 0;
    let t2 = 0;
    if (mx === r) t2 = ((g2 - b) / d) % 6; else if (mx === g2) t2 = (b - r) / d + 2; else t2 = (r - g2) / d + 4;
    t2 = t2 * 60; return t2 < 0 ? t2 + 360 : t2 };
  const dT2 = (a, b) => { const x = Math.abs(tono(a) - tono(b)); return Math.min(x, 360 - x) };
  const VI = TGA3D_C.violet, VC = TGA3D_C.violetClaro, AZ = TGA3D_C.blue;
  const bgTxt = getComputedStyle(document.body).backgroundColor;
  const mb = String(bgTxt).match(/\\d+/g) || ['15','17','23'];
  const bgHex = (Number(mb[0]) << 16) | (Number(mb[1]) << 8) | Number(mb[2]);
  const cont = (a, b) => { const l1 = Math.max(lum(a), lum(b)), l2 = Math.min(lum(a), lum(b));
    return (l1 + 0.05) / (l2 + 0.05) };
  out.lum = {
    violetaOscuro: lum(VI).toFixed(4), violetaClaro: lum(VC).toFixed(4),
    cocienteEntreLosDos: cont(VI, VC).toFixed(3),
    oscuroVsFondo: cont(VI, bgHex).toFixed(3), claroVsFondo: cont(VC, bgHex).toFixed(3),
    fondo: bgTxt,
  };
  out.tono = {
    azul: tono(AZ).toFixed(1), oscuro: tono(VI).toFixed(1), claro: tono(VC).toFixed(1),
    oscuroAlAzul: dT2(VI, AZ).toFixed(1), claroAlAzul: dT2(VC, AZ).toFixed(1),
  };

  /* ── (4) los tonos por tramo del tunel ── */
  out.tramos = {};
  try { Object.keys(TGA_ESQ_DEF).forEach(function (k) {
    const t3 = TGA_ESQ_DEF[k] && TGA_ESQ_DEF[k].tun;
    if (t3) out.tramos[k] = t3.map(function (x) { return x.join(':') }).join('|'); }) } catch (e) { out.tramos = 'EXC' }

  /* ── (5) el control del interruptor ── */
  try {
    if (typeof limpiarCampos === 'function') limpiarCampos(true);
    await esperar(260);
    out.hayDatosVacio = (typeof popHayDatos === 'function') ? popHayDatos() : 'NO FN';
    const pe = document.getElementById('pop_esq_pdf');
    if (pe) pe.value = '1';
    await esperar(120);
    out.hayDatosSoloCasilla = (typeof popHayDatos === 'function') ? popHayDatos() : 'NO FN';
    out.esqPdfOn = (typeof popEsqPdfOn === 'function') ? popEsqPdfOn() : 'NO FN';
    out.esqPdfData = (typeof popEsqPdfData === 'function') ? !!popEsqPdfData() : 'NO FN';
    if (pe) pe.value = '';
  } catch (e) { out.hayDatos = 'EXC ' + e.message }

  /* ── (6) la relacion del recorte ── */
  out.recorte = (typeof CM_PDF_AR !== 'undefined')
    ? { ar: CM_PDF_AR, margen: (typeof CM_PDF_MARGEN !== 'undefined') ? CM_PDF_MARGEN : 'NO' }
    : 'SIN CONST';

  return out;
`;

const nav = await chromium.launch({ channel: 'chrome', headless: true });
const pag = await nav.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pag.on('pageerror', e => errs.push(String(e.message).slice(0, 140)));
await pag.goto(pathToFileURL(ARCH).href);
await pag.waitForFunction('typeof generarInforme === "function"', null, { timeout: 60000 }).catch(() => {});
await pag.evaluate('try{sessionStorage.setItem("ett_auth","1")}catch(e){}');
await pag.reload();
await pag.waitForFunction('typeof generarInforme === "function"', null, { timeout: 60000 }).catch(() => {});
const r = await pag.evaluate(new Function(`return (async () => { ${CUERPO} })()`));
console.log(JSON.stringify(r, null, 1));
console.log('errores de pagina:', errs.length ? errs : 'cero');
await nav.close();
