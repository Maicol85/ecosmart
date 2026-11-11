#!/usr/bin/env node
/* _probe_p34inv.mjs - PANT-34, TAREA 0. Inventario de SOLO LECTURA: mide el panel de Coronarias
   de PANT-29 (sus filas, sus botones y su ancho en cuatro anchos de ventana), el cuadro del 3D
   (la brujula y el rincon libre), la captura, y la ficha de anomalias coronarias de Referencias
   con su globo. No toca index.html ni escribe nada. */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3600 });
const out = {};
await S.entrar();
await S.viewport(1440, 980);

/* -- (a) El panel de Coronarias -- */
out.panel = await S.ev(() => {
  const r = {};
  try { showTab('contractilidad'); } catch (e) {}
  const set = (id, v) => { const e = document.getElementById(id); if (e) { e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); } };
  set('ddvi', '52'); set('vdfvi', '110'); set('vsfvi', '45');
  try { if (typeof lv3dToggle === 'function') lv3dToggle(); } catch (e) { r.errAbrir = String(e) }
  r.abierto = !!(window.lv3dDiag && lv3dDiag().abierto);
  const cb = document.querySelector('.lv3d-coro-btn');
  r.coroBtnTexto = cb ? cb.textContent.trim() : null;
  if (cb) cb.click();
  r.diag = window.lv3dCoroDiag ? lv3dCoroDiag() : null;
  const pan = document.getElementById('lv3d-coro-panel');
  r.panelDisplay = pan ? getComputedStyle(pan).display : null;
  r.filas = pan ? Array.prototype.map.call(pan.children, el => ({
    id: el.id || '', clase: el.className || '',
    botones: Array.prototype.map.call(el.querySelectorAll('button'), b => b.textContent.trim())
  })) : null;
  const lista = document.getElementById('lv3d-coro-lista');
  r.vistas = lista ? Array.prototype.map.call(lista.querySelectorAll('.lv3d-coro-v'),
    b => ({ v: b.getAttribute('data-v'), n: b.textContent.trim() })) : null;
  r.listaOtros = lista ? Array.prototype.map.call(lista.querySelectorAll('button:not(.lv3d-coro-v)'),
    b => b.textContent.trim()) : null;
  const vb = document.querySelector('.lv3d-coro-vista-btn');
  r.tituloBotonVista_sinVista = vb ? vb.textContent.trim() : null;
  const pie = document.getElementById('lv3d-coro-pie');
  r.pie = pie ? { display: getComputedStyle(pie).display, txt: pie.textContent.trim() } : null;
  r.vistasJS = (typeof LV3D_CORO_VISTAS !== 'undefined')
    ? LV3D_CORO_VISTAS.map(v => ({ n: v.n, a: v.a, b: v.b })) : 'NO ALCANZABLE';
  const v0 = document.querySelector('.lv3d-coro-v[data-v="0"]');
  if (v0) v0.click();
  r.tituloBotonVista_conVista = vb ? vb.textContent.trim() : null;
  r.diagConVista = window.lv3dCoroDiag ? lv3dCoroDiag() : null;
  return r;
});

/* -- (c) Las arterias y su duenio, por dominancia -- */
out.arterias = await S.ev(() => {
  const r = {};
  const leer = () => {
    const s = window.lv3dCoroSonda(0);
    return { n: s.arterias.length, letras: s.letras,
             duenio: s.arterias.filter(a => a.n).map(a => a.n + '=' + a.g).join(' '),
             grupos: s.arterias.reduce((o, a) => { o[a.g] = (o[a.g] || 0) + 1; return o }, {}) };
  };
  [0, 1, 2].forEach(d => {
    const b = document.querySelector('.lv3d-coro-dom[data-d="' + d + '"]');
    if (b) b.click();
    r['dom' + d] = leer();
  });
  const b0 = document.querySelector('.lv3d-coro-dom[data-d="0"]'); if (b0) b0.click();
  return r;
});

/* -- (d) y (e) El cuadro, la brujula y la captura -- */
out.cuadro = await S.ev(() => {
  const cv = document.getElementById('lv3d-canvas');
  const r = { W: (typeof LV3D_W !== 'undefined') ? LV3D_W : null,
              H: (typeof LV3D_H !== 'undefined') ? LV3D_H : null };
  r.caja = cv ? { w: Math.round(cv.getBoundingClientRect().width),
                  h: Math.round(cv.getBoundingClientRect().height) } : null;
  const ctx = cv ? cv.getContext('2d') : null;
  const dpr = window.devicePixelRatio || 1;
  const tinta = (x0, y0, x1, y1) => {
    if (!ctx) return null;
    const d = ctx.getImageData(Math.round(x0 * dpr), Math.round(y0 * dpr),
                               Math.round((x1 - x0) * dpr), Math.round((y1 - y0) * dpr)).data;
    let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) n++;
    return n;
  };
  r.tintaRinconIzq = tinta(10, 290, 110, 375);
  r.tintaRinconDer = tinta(570, 290, 670, 375);
  r.capturaExiste = typeof lv3dCapturar === 'function';
  r.capAltoPie = (typeof LV3D_CAP_ALTO_PIE !== 'undefined') ? LV3D_CAP_ALTO_PIE : null;
  return r;
});

/* -- Anchos: donde caben los botones del panel -- */
out.anchos = {};
for (const w of [1440, 1000, 768, 390]) {
  await S.viewport(w, 900);
  await new Promise(r => setTimeout(r, 320));
  out.anchos[w] = await S.ev(() => {
    const pan = document.getElementById('lv3d-coro-panel');
    const col = document.getElementById('lv3d-col-der');
    const bs = pan ? Array.prototype.map.call(pan.querySelectorAll('button'), b => {
      const r = b.getBoundingClientRect();
      return { t: b.textContent.trim().slice(0, 22), w: Math.round(r.width), h: Math.round(r.height) };
    }) : null;
    return { col: col ? Math.round(col.getBoundingClientRect().width) : null,
             botones: bs,
             bajo44: bs ? bs.filter(b => b.h > 0 && b.h < 44).length : null,
             scrollH: document.documentElement.scrollWidth - document.documentElement.clientWidth };
  });
}

/* -- (g) REFERENCIAS: la ficha de anomalias coronarias -- */
await S.viewport(1440, 980);
out.refs = await S.ev(() => {
  const r = {};
  const norm = s => String(s == null ? '' : s).replace(/[\s ]+/g, ' ').trim();
  try { showTab('refs'); } catch (e) {}
  const sb = document.getElementById('ref-subtab-congenitas');
  r.solapaExiste = !!sb; if (sb) sb.click();
  const cuerpo = document.getElementById('ref-coronarias');
  const card = cuerpo ? cuerpo.closest('.card') : null;
  const h2 = card ? card.querySelector('h2.card-head') : null;
  if (cuerpo && getComputedStyle(cuerpo).display === 'none' && h2) h2.click();
  r.titulo = h2 ? norm(h2.textContent) : null;
  r.hijos = cuerpo ? Array.prototype.map.call(cuerpo.children, el => ({
    tag: el.tagName, marca: el.getAttribute('data-ref-solo'),
    chars: norm(el.textContent).length, ini: norm(el.textContent).slice(0, 60) })) : null;
  r.chars = cuerpo ? norm(cuerpo.textContent).length : null;
  r.ancho = cuerpo ? Math.round(cuerpo.getBoundingClientRect().width) : null;
  const cadena = [];
  let n = cuerpo;
  while (n && n !== document.body) {
    const cs = getComputedStyle(n);
    cadena.push({ id: n.id || ('.' + String(n.className || '').split(' ')[0]),
                  oy: cs.overflowY, ox: cs.overflowX, pos: cs.position,
                  h: Math.round(n.getBoundingClientRect().height) });
    n = n.parentElement;
  }
  r.cadena = cadena.slice(0, 8);
  r.hermanas = (typeof REF_SUBTAB !== 'undefined') ? REF_SUBTAB.congenitas.slice() : null;
  try { r.clonChars = norm(window._otrRefClon('ref-coronarias').textContent).length } catch (e) { r.clonChars = 'ERR' }
  try { r.clonTxt = norm(window._otrRefClon('ref-coronarias').textContent) } catch (e) { r.clonTxt = 'ERR' }
  const tab = document.getElementById('tab-refs') || document.getElementById('refs');
  r.tabRefsId = tab ? tab.id : null;
  r.nCasillasEnRefs = tab ? tab.querySelectorAll('input[type=checkbox]').length : null;
  r.casillasEnRefs = tab ? Array.prototype.map.call(tab.querySelectorAll('input[type=checkbox]'),
    c => ({ id: c.id || '(sin id)', clase: String(c.className || '') })).slice(0, 20) : null;
  r.encabezadosToggleRef = Array.prototype.map.call(document.querySelectorAll('h2.card-head'),
    h => (h.getAttribute('onclick') || '')).filter(s => s.indexOf('toggleRef') > -1).length;
  return r;
});
out.errores = S.errores ? S.errores() : null;
console.log(JSON.stringify(out, null, 1));
S.cerrar();
