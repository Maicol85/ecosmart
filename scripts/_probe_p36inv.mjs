#!/usr/bin/env node
/**
 * _probe_p36inv.mjs - TAREA 0 de PANT-36 (2026-11-11). SOLO LECTURA: no toca index.html.
 * Mide en Chrome real lo que la orden pide inventariar:
 *  a) Referencias -> Cardiopatia congenita: entradas, ids, orden, donde cae coronarias.
 *  b) El molde de los resumenes de ref-miocard: pares de div, peso, tamanio, vinietas y techo.
 *  c) El reparto de entradas y el indice del buscador, con su denominador.
 *  d) El estilo de una tabla ya existente de Referencias, en los DOS temas.
 * El tema se pone con la clase light-mode via loadTheme(), no con prefers-color-scheme.
 */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3400 });
const R = { file: FILE };
R.entrar = await S.entrar();
await S.viewport(1440, 900);
await S.ev(() => { if (window.showTab) showTab('refs'); });
await S.esperar(600);

/* (a) + (c) el reparto y el indice */
R.reparto = await S.ev(() => {
  const t = document.getElementById('tab-refs');
  const heads = [].slice.call(t.querySelectorAll('h2.card-head'))
    .filter(h => (h.getAttribute('onclick') || '').indexOf("toggleRef('") > -1);
  const filas = heads.map(h => {
    const oc = h.getAttribute('onclick') || '';
    const a = oc.indexOf("toggleRef('"), b = oc.indexOf("'", a + 11);
    const id = oc.slice(a + 11, b);
    const cuerpo = document.getElementById('ref-' + id);
    let pan = null;
    for (const k of (window.REF_SUB_ORDEN || [])) {
      const p = document.getElementById('ref-sub-' + k);
      if (p && cuerpo && p.contains(cuerpo)) { pan = k; break; }
    }
    return { id: id, panel: pan, tit: (h.textContent || '').replace(/[▶▼]/g, '').replace(/\s+/g, ' ').trim() };
  });
  let idx = null;
  try { idx = window._refIndiceArmar(true).map(x => x.id); } catch (e) { idx = 'EXC'; }
  return {
    entradas: filas.length,
    orden: (window.REF_SUB_ORDEN || []).slice(),
    mapa: JSON.parse(JSON.stringify(window.REF_SUBTAB || {})),
    congenitas: filas.filter(f => f.panel === 'congenitas'),
    indiceN: Array.isArray(idx) ? idx.length : idx,
    indiceIds: Array.isArray(idx) ? idx : null,
    hostCongenitas: !!document.getElementById('ref-sub-congenitas')
  };
});

/* (b) el molde de ref-miocard, con la ficha ABIERTA: cerrada el textContent es igual y no
   prueba que el medico lo pueda leer. */
R.molde = await S.ev(() => {
  const ab = (k) => { const d = document.getElementById('ref-' + k);
    if (d && getComputedStyle(d).display === 'none') { try { toggleRef(k, d.previousElementSibling) } catch (e) {} }
    return d; };
  const N = s => String(s || '').replace(/\s+/g, ' ').trim();
  const d = ab('miocard');
  if (!d) return 'NO EXISTE';
  const hijos = [].slice.call(d.children).map(h => { const cs = getComputedStyle(h);
    const txt = N(h.textContent);
    let vi = 0; for (const c of txt) if (c === '•') vi++;
    return { tag: h.tagName, chars: txt.length, vinietas: vi, peso: cs.fontWeight,
             size: cs.fontSize, lh: cs.lineHeight, color: cs.color, mb: cs.marginBottom,
             vis: cs.display !== 'none', ini: txt.slice(0, 44) }; });
  const pares = [];
  for (let i = 0; i + 1 < hijos.length; i += 2)
    pares.push({ titulo: hijos[i].ini, chars: hijos[i].chars + hijos[i + 1].chars,
                 vinietas: hijos[i + 1].vinietas, pesoTit: hijos[i].peso, pesoCue: hijos[i + 1].peso,
                 sizeTit: hijos[i].size, sizeCue: hijos[i + 1].size, lhCue: hijos[i + 1].lh,
                 mbTit: hijos[i].mb, mbCue: hijos[i + 1].mb });
  const cong = ab('congenitas'), coro = ab('coronarias');
  return { hijos: hijos.length, pares: pares,
    techoChars: Math.max.apply(null, pares.map(p => p.chars)),
    techoVinietas: Math.max.apply(null, pares.map(p => p.vinietas)),
    refCongenitas: { chars: N(cong.textContent).length, hijos: cong.children.length },
    refCoronarias: { chars: N(coro.textContent).length, hijos: coro.children.length } };
});

/* (d) el estilo de las tablas que Referencias ya tiene, en los DOS temas reales */
const TEMAS = ['dark', 'light'];
R.tablas = {};
for (const tm of TEMAS) {
  R.tablas[tm] = await S.ev((modo) => {
    try { localStorage.setItem('ett_theme', modo); } catch (e) {}
    if (typeof loadTheme === 'function') loadTheme();
    const puesto = document.documentElement.classList.contains('light-mode')
      || document.body.classList.contains('light-mode') ? 'light' : 'dark';
    const ab = (k) => { const d = document.getElementById('ref-' + k);
      if (d && getComputedStyle(d).display === 'none') { try { toggleRef(k, d.previousElementSibling) } catch (e) {} }
      return d; };
    const d = ab('ao');
    const tb = d ? d.querySelector('table') : null;
    const th = tb ? tb.querySelector('th') : null;
    const td = tb ? tb.querySelector('td') : null;
    const dTum = ab('tumores');
    const wrap = dTum ? dTum.querySelector('div[style*="overflow-x"]') : null;
    const tbW = wrap ? wrap.querySelector('table') : null;
    return { temaPuesto: puesto,
      tabla: tb ? { w: getComputedStyle(tb).width, size: getComputedStyle(tb).fontSize,
                    collapse: getComputedStyle(tb).borderCollapse } : null,
      th: th ? { bg: getComputedStyle(th.parentElement).backgroundColor, color: getComputedStyle(th).color,
                 pad: getComputedStyle(th).padding, align: getComputedStyle(th).textAlign } : null,
      td: td ? { pad: getComputedStyle(td).padding, color: getComputedStyle(td).color,
                 borde: getComputedStyle(td).borderTop } : null,
      envoltorio: wrap ? { overflowX: getComputedStyle(wrap).overflowX,
                           minW: tbW ? tbW.style.minWidth : null } : null };
  }, tm);
}

/* celular: que la tabla no desborde la PAGINA */
await S.viewport(390, 844);
await S.esperar(300);
R.celular = await S.ev(() => {
  const ab = (k) => { const d = document.getElementById('ref-' + k);
    if (d && getComputedStyle(d).display === 'none') { try { toggleRef(k, d.previousElementSibling) } catch (e) {} }
    return d; };
  const dTum = ab('tumores');
  const wrap = dTum ? dTum.querySelector('div[style*="overflow-x"]') : null;
  return { scrollPagina: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    envoltorioDesplaza: wrap ? (wrap.scrollWidth - wrap.clientWidth) : null };
});
R.errs = S.errs.slice(0, 8);
console.log(JSON.stringify(R, null, 1));
S.cerrar();
