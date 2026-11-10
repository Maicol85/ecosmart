#!/usr/bin/env node
/* _probe_p33lin.mjs - PANT-33. Mide la ESTRUCTURA del cuerpo editable paso a paso con teclado
   real: que deja Chrome tras un borrado total y tras cada Enter. Sin esto, «no se puede escribir
   en lineas» se diagnostica de memoria.
   ⚠️ EL ENTER VA COMO `escribir('\r')` Y NO COMO `tecla('Enter')`, y esta medido: el `tecla` del
   arnes manda keyDown y keyUp SIN `text`, y asi Chrome no inserta parrafo en un
   `contenteditable` -- el DOM no cambia y el cursor se va al contenedor-. Con `text:'\r'` el
   Enter parte la linea como el del medico. Es la misma trampa que el arnes de PANT-31 documenta
   para el caracter: un evento de teclado sin texto no tiene accion por omision. */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3400 });
const pasos = [];
await S.entrar();
await S.viewport(1440, 900);
await S.ev(() => {
  try { localStorage.setItem('ett_centro_principal', 'GREMEDA');
        localStorage.setItem('ett_centros', JSON.stringify(['GREMEDA'])); } catch (e) {}
  if (window.showTab) showTab('config');
  if (typeof cfgOnShow === 'function') cfgOnShow();
  cfgDocsEditar('constancia');
  return true;
});
const foto = async (etq) => {
  const o = await S.ev((e) => {
    const el = document.querySelector('[data-doc-cuerpo]');
    const sel = window.getSelection();
    let anc = null;
    if (sel && sel.anchorNode) {
      const n = sel.anchorNode;
      anc = (n.nodeType === 3 ? ('texto:' + String(n.nodeValue).slice(0, 14)) : (n.nodeName + '.' + n.className)) + '@' + sel.anchorOffset;
    }
    return { etq: e, html: el.innerHTML.slice(0, 420), innerText: JSON.stringify(el.innerText),
             txt: JSON.stringify(_cdEd.txt), hijos: el.childNodes.length,
             tipos: Array.prototype.map.call(el.childNodes, function (n) {
               return n.nodeType === 3 ? 'T' : n.nodeName; }).join(','), caret: anc };
  }, etq);
  pasos.push(o);
};
const r = await S.ev(() => { const el = document.querySelector('[data-doc-cuerpo]');
  const b = el.getBoundingClientRect(); return { x: Math.round(b.x + 40), y: Math.round(b.y + 10) }; });
await foto('0 · recien abierto');
await S.clic(r.x, r.y);
await S.ev(() => { const el = document.querySelector('[data-doc-cuerpo]');
  const sel = window.getSelection(); const rr = document.createRange();
  rr.selectNodeContents(el); sel.removeAllRanges(); sel.addRange(rr); return true; });
await S.tecla('Backspace');
await foto('1 · tras borrar todo');
await S.escribir('AAA');
await foto('2 · tras escribir AAA');
await S.escribir('\r');
await foto('3 · tras Enter');
await S.escribir('BBB');
await foto('4 · tras escribir BBB');
await S.escribir('\r');
await S.escribir('\r');
await S.escribir('CCC');
await foto('5 · tras dos Enter y CCC');
console.log(JSON.stringify(pasos, null, 1));
console.log('ERRS', JSON.stringify(S.errs.slice(0, 6)));
S.cerrar(); process.exit(0);
