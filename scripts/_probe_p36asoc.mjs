#!/usr/bin/env node
/**
 * _probe_p36asoc.mjs - parte A de PANT-36 (2026-11-11). Un arbol (--file), apto para A/B.
 * Compara CELDA POR CELDA, carácter por carácter, el texto de las dos tablas contra la
 * especificacion de `scripts/_gen_p36tablas.py --json`, que es donde vive el texto del medico.
 * Mide ademas: la entrada TERCERA del panel, el censo y el indice del buscador, el buscador
 * encontrando la entrada nueva SIN alterar sus demas resultados, el desplazamiento dentro del
 * envoltorio y el de la pagina a los cinco anchos, y los DOS temas REALES.
 *
 * ⚠️ EL TEMA VA POR `localStorage.ett_theme` + `loadTheme()`, no por prefers-color-scheme, y la
 * sonda DEVUELVE que tema quedo puesto: es el hallazgo de metodo de PANT-34.
 * ⚠️ LA TABLA SE MIDE CON LA ENTRADA ABIERTA Y SU PANEL ACTIVO: Referencias muestra un panel a
 * la vez, asi que con otro panel delante el nodo no tiene geometria y el desplazamiento del
 * envoltorio da 0 sobre un denominador vacio.
 * Nombre propio: verificado con ls, no existia.
 */
import { abrir } from './_p31cdp.mjs';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const SPEC = JSON.parse(execFileSync('python3', ['-I', 'scripts/_gen_p36tablas.py', '--json'],
  { encoding: 'utf-8', cwd: '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart' }));
const S = await abrir(FILE, { espera: 3400 });
const R = { file: FILE };
R.entrar = await S.entrar();
await S.viewport(1440, 900);
/* ⚠️ HAY QUE ACTIVAR LA SUBPESTANIA, y no solo la pestana: Referencias muestra UN panel a la
   vez, asi que con `calc` delante la entrada no tiene geometria y el desplazamiento del
   envoltorio da 0 sobre un denominador vacio -- que se lee igual que «no desborda». */
await S.ev(() => { if (window.showTab) showTab('refs');
  if (typeof refSubTab === 'function') refSubTab('congenitas'); });
await S.esperar(600);

/* ── el buscador ANTES de buscar lo nuevo: sus resultados de control ── */
R.buscador = await S.ev(() => {
  const buscar = (q) => { try { const ix = window._refIndiceArmar(true);
    const n = window._refNorm ? window._refNorm(q) : q.toLowerCase();
    return ix.filter(x => x.txt.indexOf(n) > -1).map(x => x.id); } catch (e) { return 'EXC' } };
  let idx = null; try { idx = window._refIndiceArmar(true) } catch (e) {}
  const fila = Array.isArray(idx) ? idx.filter(x => x.id === 'asoc')[0] : null;
  return { n: Array.isArray(idx) ? idx.length : 'EXC',
    asoc: fila ? { sub: fila.sub, subTit: fila.subTit, tit: fila.tit } : null,
    turner: buscar('Turner'), heterotaxia: buscar('Heterotaxia'), arcapa: buscar('ARCAPA'),
    /* CONTROLES: cuatro busquedas que NO deben haber cambiado. */
    rwt: buscar('RWT'), wilkins: buscar('Wilkins'), vexus: buscar('VExUS'), rassi: buscar('Rassi') };
});

/* ── las celdas, carácter por carácter ── */
R.celdas = await S.ev(() => {
  const d = document.getElementById('ref-asoc');
  if (!d) return 'NO EXISTE';
  if (getComputedStyle(d).display === 'none') toggleRef('asoc', d.previousElementSibling);
  const tbs = [].slice.call(d.querySelectorAll('table'));
  /* Los rotulos son los DIV que NO contienen tabla: el envoltorio de desplazamiento tambien
     es un DIV hijo, y sin este filtro el rotulo 2 sale con la tabla 1 entera adentro. */
  const rots = [].slice.call(d.children).filter(e => e.tagName === 'DIV' && !e.querySelector('table'))
    .map(e => e.textContent.trim());
  return { rotulos: rots, tablas: tbs.length,
    datos: tbs.map(tb => {
      const trs = [].slice.call(tb.querySelectorAll('tr'));
      return { cols: [].slice.call(trs[0].querySelectorAll('th')).map(t => t.textContent),
               filas: trs.slice(1).map(tr => [].slice.call(tr.querySelectorAll('td')).map(t => t.textContent)),
               negritas: trs.slice(1).map(tr => { const td = tr.querySelector('td');
                 return td ? getComputedStyle(td).fontWeight : null }) };
    }),
    controles: d.querySelectorAll('input,select,textarea,button').length,
    pies: d.querySelectorAll('i').length,
    hijosConIdAviso: [].slice.call(d.querySelectorAll('[id]')).filter(e => /-aviso$/.test(e.id)).length };
});

/* ── los dos temas REALES, y la geometria a los cinco anchos ── */
R.temas = {}; R.anchos = {};
for (const tm of ['dark', 'light']) {
  R.temas[tm] = await S.ev((modo) => {
    try { localStorage.setItem('ett_theme', modo) } catch (e) {}
    if (typeof loadTheme === 'function') loadTheme();
    const puesto = document.documentElement.classList.contains('light-mode') ? 'light' : 'dark';
    const d = document.getElementById('ref-asoc');
    if (getComputedStyle(d).display === 'none') toggleRef('asoc', d.previousElementSibling);
    const th = d.querySelector('th'), td = d.querySelector('td');
    const cs = (e, p) => e ? getComputedStyle(e)[p] : null;
    const rgb = (s) => (String(s).match(/\d+/g) || []).map(Number);
    const lum = (s) => { const c = rgb(s); if (c.length < 3) return null;
      const f = c.slice(0, 3).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4) });
      return 0.2126 * f[0] + 0.7152 * f[1] + 0.0722 * f[2]; };
    const contraste = (a, b) => { const la = lum(a), lb = lum(b);
      if (la == null || lb == null) return null;
      return Math.round(((Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)) * 100) / 100; };
    return { temaPuesto: puesto,
      thColor: cs(th, 'color'), thFondo: cs(th.parentElement, 'backgroundColor'),
      tdColor: cs(td, 'color'), tdFondo: cs(d, 'backgroundColor'),
      contrasteTh: contraste(cs(th, 'color'), cs(th.parentElement, 'backgroundColor')),
      negros: [].slice.call(d.querySelectorAll('th,td')).filter(e => {
        const c = rgb(getComputedStyle(e).color);
        return c.length >= 3 && c[0] === 0 && c[1] === 0 && c[2] === 0 }).length };
  }, tm);
}
for (const w of [1440, 1280, 1000, 768, 390]) {
  await S.viewport(w, 900); await S.esperar(320);
  R.anchos[w] = await S.ev(() => {
    if (typeof refSubTab === 'function') refSubTab('congenitas');
    const d = document.getElementById('ref-asoc');
    if (getComputedStyle(d).display === 'none') toggleRef('asoc', d.previousElementSibling);
    const wraps = [].slice.call(d.querySelectorAll('div[style*="overflow-x"]'));
    const recortados = [];
    d.querySelectorAll('th,td').forEach(e => { const t = (e.textContent || '').trim();
      if (t && e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible')
        recortados.push(t.slice(0, 20)); });
    const r = d.getBoundingClientRect();
    return { visible: getComputedStyle(d).display !== 'none' && r.width > 0,
      anchoEntrada: Math.round(r.width),
      envoltorios: wraps.length,
      anchoEnvoltorio: wraps.map(x => Math.round(x.clientWidth)),
      desplazaEnvoltorio: wraps.map(x => Math.max(0, x.scrollWidth - x.clientWidth)),
      scrollPagina: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      recortados: recortados };
  });
}
/* ── el veredicto de la comparacion carácter por carácter ── */
const dif = [];
const cmp = (ruta, a, b) => { if (a !== b) dif.push({ donde: ruta, esperado: a, hallado: b }) };
if (typeof R.celdas === 'object' && R.celdas.datos) {
  cmp('rotulo1', SPEC.tit1, (R.celdas.rotulos[0] || '').trim());
  cmp('rotulo2', SPEC.tit2, (R.celdas.rotulos[1] || '').trim());
  const T = [{ cols: SPEC.cols1, f: SPEC.t1 }, { cols: SPEC.cols2, f: SPEC.t2 }];
  T.forEach((t, i) => {
    const got = R.celdas.datos[i];
    if (!got) { dif.push({ donde: 'tabla' + (i + 1), esperado: 'existe', hallado: 'NO' }); return }
    cmp('tabla' + (i + 1) + '/ncols', String(t.cols.length), String(got.cols.length));
    t.cols.forEach((c, j) => cmp('tabla' + (i + 1) + '/col' + j, c, got.cols[j]));
    cmp('tabla' + (i + 1) + '/nfilas', String(t.f.length), String(got.filas.length));
    t.f.forEach((fila, r) => fila.forEach((cel, c) =>
      cmp('tabla' + (i + 1) + '/f' + (r + 1) + '/c' + (c + 1), cel, (got.filas[r] || [])[c])));
    got.negritas.forEach((p, r) => cmp('tabla' + (i + 1) + '/negrita/f' + (r + 1), '700', p));
  });
}
R.diferencias = dif;
R.veredicto = dif.length === 0 ? 'TEXTO IDENTICO A LA ESPECIFICACION' : (dif.length + ' DIFERENCIAS');
R.errs = S.errs.slice(0, 8);
console.log(JSON.stringify(R, null, 1));
S.cerrar();
