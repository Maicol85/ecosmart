#!/usr/bin/env node
/* _probe_p34geo.mjs - PANT-34, parte B. Mide la GEOMETRIA de los cinco esquemas: que ningun
   rotulo se salga del lienzo de 400 por 360, que dos rotulos no se encimen, y que los trazos
   tengan color resuelto -no el negro heredado- en los dos temas.
   ⚠️ `getBBox` DEVUELVE CEROS EN UN SUBARBOL `display:none`, asi que la ficha se abre y el
      cuadro se hace visible ANTES de medir: sin eso todo da cero y parece impecable. */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3600 });
const out = {};
await S.entrar();
await S.viewport(1440, 980);
await S.ev(() => {
  try { showTab('refs') } catch (e) {}
  const sb = document.getElementById('ref-subtab-congenitas'); if (sb) sb.click();
  const cuerpo = document.getElementById('ref-coronarias');
  const h2 = cuerpo.closest('.card').querySelector('h2.card-head');
  if (getComputedStyle(cuerpo).display === 'none') h2.click();
  return true;
});
/* ⚠️ EL TEMA DE ESTA APP NO ES `prefers-color-scheme`: es la clase `light-mode` en el <html>, y
   la pone el boton del tema. Emular la media query NO cambia nada y la primera version de esta
   sonda midio DOS VECES el tema oscuro -los mismos colores en los dos lados, que se lee igual
   que un control negativo-. */
for (const tema of ['light', 'dark']) {
  await S.ev((t) => { document.documentElement.classList.toggle('light-mode', t === 'light');
                      return document.documentElement.className }, tema);
  await new Promise(r => setTimeout(r, 300));
  out[tema] = await S.ev(() => {
    const ESC = [
      ['aaorca', ['head', 'pre', 'retro', 'inter', 'intra']],
      ['aaolca', ['head', 'pre', 'retro', 'inter', 'intra']],
      ['alcapa', ['head']], ['arcapa', ['head']],
      ['fistula', ['head', 'R', 'L', 'ad', 'vd', 'ap']]
    ];
    const r = {};
    ESC.forEach(function (par) {
      const k = par[0], claves = par[1];
      const a = document.querySelector('[data-rac-ap="' + k + '"]');
      a.querySelectorAll('input[data-rac]').forEach(c => { c.checked = claves.indexOf(c.getAttribute('data-rac')) > -1 });
      racDibujar(k);
      const svg = a.querySelector('svg');
      const caja = a.querySelector('[data-rac-esq]');
      const vis = !caja.classList.contains('rac-oculto');
      const txts = Array.prototype.map.call(svg.querySelectorAll('text'), t => {
        const b = t.getBBox();
        return { t: t.textContent, x: Math.round(b.x), y: Math.round(b.y),
                 w: Math.round(b.width), h: Math.round(b.height) };
      });
      const fuera = txts.filter(t => t.x < -0.5 || t.y < -0.5 || t.x + t.w > 400.5 || t.y + t.h > 360.5);
      let encimados = [];
      for (let i = 0; i < txts.length; i++) for (let j = i + 1; j < txts.length; j++) {
        const A = txts[i], B = txts[j];
        if (A.x < B.x + B.w && B.x < A.x + A.w && A.y < B.y + B.h && B.y < A.y + A.h)
          encimados.push(A.t + ' / ' + B.t);
      }
      /* Color resuelto: ni uno en negro puro, que es donde cae un var() invalido. */
      const trazos = Array.prototype.map.call(svg.querySelectorAll('path'), p => getComputedStyle(p).stroke);
      const negros = trazos.filter(c => c === 'rgb(0, 0, 0)').length;
      const rellenos = Array.prototype.map.call(svg.querySelectorAll('text,polygon,circle'),
        p => getComputedStyle(p).fill);
      const negrosF = rellenos.filter(c => c === 'rgb(0, 0, 0)').length;
      /* La caja del SVG en pantalla y el fondo de la tarjeta. */
      const rb = svg.getBoundingClientRect();
      r[k] = { vis: vis, nTxt: txts.length, fuera: fuera, encimados: encimados,
               trazos: trazos.length, negros: negros, negrosF: negrosF,
               colores: Array.from(new Set(trazos)), anchoCaja: Math.round(rb.width),
               altoCaja: Math.round(rb.height) };
    });
    /* Y todo destildado otra vez. */
    ESC.forEach(function (par) {
      const a = document.querySelector('[data-rac-ap="' + par[0] + '"]');
      a.querySelectorAll('input[data-rac]').forEach(c => { c.checked = false });
      racDibujar(par[0]);
    });
    r.todosOcultos = Array.prototype.every.call(document.querySelectorAll('[data-rac-esq]'),
      c => c.classList.contains('rac-oculto'));
    return r;
  });
}
out.errores = S.errores ? S.errores() : null;
console.log(JSON.stringify(out, null, 1));
S.cerrar();
