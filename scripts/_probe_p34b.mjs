#!/usr/bin/env node
/* _probe_p34b.mjs - PANT-34, parte B. Mide el esquema de anomalias coronarias en Referencias:
   los cinco apartados, las DIECIOCHO casillas una por una con su dibujo, la superposicion de
   caminos, las combinaciones de la fistula, que destildar todo oculta el cuadro, que las
   casillas se operan con TECLADO real, el ancho en cinco anchos de ventana, y que el globo
   otr-rac y las demas fichas quedan IDENTICOS. */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3600 });
const out = {};
await S.entrar();
await S.viewport(1440, 980);

const PREP = () => S.ev(() => {
  const norm = s => String(s == null ? '' : s).replace(/[\s ]+/g, ' ').trim();
  try { showTab('refs') } catch (e) {}
  const sb = document.getElementById('ref-subtab-congenitas'); if (sb) sb.click();
  const cuerpo = document.getElementById('ref-coronarias');
  const card = cuerpo ? cuerpo.closest('.card') : null;
  const h2 = card ? card.querySelector('h2.card-head') : null;
  if (cuerpo && getComputedStyle(cuerpo).display === 'none' && h2) h2.click();
  return { abierta: cuerpo ? getComputedStyle(cuerpo).display : null,
           hijos: cuerpo ? cuerpo.children.length : null,
           chars: cuerpo ? norm(cuerpo.textContent).length : null };
});
out.prep = await PREP();

/* La estructura: cinco apartados, dieciocho casillas, el pie y el estado inicial. */
out.estructura = await S.ev(() => {
  const r = {};
  const raiz = document.getElementById('rac-root');
  r.existe = !!raiz;
  r.apartados = Array.prototype.map.call(document.querySelectorAll('[data-rac-ap]'), a => ({
    k: a.getAttribute('data-rac-ap'),
    titulo: a.querySelector('.rac-tit .rac-chk-t').textContent,
    sigla: a.querySelector('.rac-sigla').textContent,
    parrafos: a.querySelectorAll('.rac-txt p').length,
    casillas: Array.prototype.map.call(a.querySelectorAll('input[data-rac]'), c => c.getAttribute('data-rac')),
    enTitulo: a.querySelectorAll('.rac-tit input[data-rac]').length,
    enFrases: a.querySelectorAll('.rac-txt input[data-rac]').length,
    cuadroVisible: !a.querySelector('[data-rac-esq]').classList.contains('rac-oculto')
  }));
  r.nCasillas = document.querySelectorAll('#rac-root input[data-rac]').length;
  r.casillasConId = Array.prototype.filter.call(
    document.querySelectorAll('#rac-root input[data-rac]'), c => !!c.id).length;
  r.tildadasAlInicio = Array.prototype.filter.call(
    document.querySelectorAll('#rac-root input[data-rac]'), c => c.checked).length;
  r.etiquetaEnvuelve = Array.prototype.every.call(
    document.querySelectorAll('#rac-root input[data-rac]'),
    c => c.closest('label') && c.closest('label').querySelector('.rac-chk-t'));
  /* Ningun texto nuevo con nombre de guia, folio, clase ni grado. */
  const txt = raiz ? raiz.textContent : '';
  const PROH = ['ESC 20', 'ACC/AHA', 'AHA/ACC', 'ASE 20', 'folio', 'Clase I', 'Clase II',
                'Nivel ', 'no figura', 'grado ', 'Grado '];
  r.prohibidas = PROH.filter(p => txt.indexOf(p) > -1);
  r.gradoSimbolo = (txt.match(/°/g) || []).length;
  r.chars = txt.replace(/[\s ]+/g, ' ').trim().length;
  return r;
});

/* Cada casilla, una por una: se tilda, se mide el dibujo, se destilda. */
out.unaPorUna = await S.ev(() => {
  const o = [];
  const todas = Array.prototype.slice.call(document.querySelectorAll('#rac-root input[data-rac]'));
  todas.forEach(c => { c.checked = false });
  ['aaorca', 'aaolca', 'alcapa', 'arcapa', 'fistula'].forEach(k => racDibujar(k));
  todas.forEach(c => {
    const ap = c.closest('[data-rac-ap]').getAttribute('data-rac-ap');
    c.checked = true; racDibujar(ap);
    const d = racDiag(ap);
    o.push({ ap: ap, k: c.getAttribute('data-rac'), vis: d.visible, display: d.display,
             trazos: d.trazos, textos: d.textos, elipses: d.elipses, circulos: d.circulos,
             poligonos: d.poligonos, leyenda: d.leyenda, nota: d.nota,
             colores: d.colores });
    c.checked = false; racDibujar(ap);
    const d2 = racDiag(ap);
    o.push({ ap: ap, k: c.getAttribute('data-rac') + ' (destildada)', vis: d2.visible,
             display: d2.display, svg: d2.svg, trazos: d2.trazos });
  });
  return o;
});

/* Superposicion de caminos y combinaciones de la fistula. */
out.combina = await S.ev(() => {
  const r = {};
  const set = (ap, claves) => {
    const a = document.querySelector('[data-rac-ap="' + ap + '"]');
    a.querySelectorAll('input[data-rac]').forEach(c => { c.checked = claves.indexOf(c.getAttribute('data-rac')) > -1 });
    racDibujar(ap);
    return racDiag(ap);
  };
  r.aaorca_tres = set('aaorca', ['head', 'pre', 'retro', 'inter']);
  r.aaorca_tresMasIntra = set('aaorca', ['head', 'pre', 'retro', 'inter', 'intra']);
  r.aaorca_soloHead = set('aaorca', ['head']);
  r.aaolca_soloInterIntra = set('aaolca', ['inter', 'intra']);
  r.fist_soloHead = set('fistula', ['head']);
  r.fist_soloOrigen = set('fistula', ['head', 'R']);
  r.fist_soloDest = set('fistula', ['head', 'ad']);
  r.fist_R_ad = set('fistula', ['head', 'R', 'ad']);
  r.fist_dosPorTres = set('fistula', ['head', 'R', 'L', 'ad', 'vd', 'ap']);
  r.nada = set('fistula', []);
  return r;
});

/* El teclado real: Tab hasta la primera casilla y espacio. */
out.teclado = await S.ev(() => {
  const c = document.querySelector('#rac-root input[data-rac]');
  c.focus();
  return { enfocada: document.activeElement === c, checked: c.checked,
           foco: getComputedStyle(c).outlineStyle };
});
await S.ev(() => { document.querySelector('#rac-root input[data-rac]').focus(); return true });
await S.escribir(' ');
out.trasEspacio = await S.ev(() => {
  const c = document.querySelector('#rac-root input[data-rac]');
  const ap = c.closest('[data-rac-ap]').getAttribute('data-rac-ap');
  return { checked: c.checked, visible: racDiag(ap).visible, ap: ap };
});
await S.escribir(' ');
out.trasSegundoEspacio = await S.ev(() => {
  const c = document.querySelector('#rac-root input[data-rac]');
  const ap = c.closest('[data-rac-ap]').getAttribute('data-rac-ap');
  return { checked: c.checked, visible: racDiag(ap).visible };
});

/* El globo otr-rac y las demas fichas: identicos. */
out.globo = await S.ev(() => {
  const norm = s => String(s == null ? '' : s).replace(/[\s ]+/g, ' ').trim();
  let clon = 'ERR', n = -1;
  try { clon = norm(window._otrRefClon('ref-coronarias').textContent); n = clon.length } catch (e) {}
  const fichas = {};
  Array.prototype.forEach.call(document.querySelectorAll('[id^="ref-"]'), el => {
    if (el.tagName !== 'DIV' || !el.classList.contains('card-body')) return;
    fichas[el.id] = norm(el.textContent).length;
  });
  const enc = Array.prototype.map.call(document.querySelectorAll('h2.card-head'),
    h => (h.getAttribute('onclick') || '')).filter(s => s.indexOf('toggleRef') > -1).length;
  return { clonChars: n, clonTxt: clon, fichas: fichas, encabezados: enc,
           nFichas: Object.keys(fichas).length };
});

/* Los anchos. */
out.anchos = {};
for (const w of [1440, 1280, 1000, 768, 390]) {
  await S.viewport(w, 900);
  await new Promise(r => setTimeout(r, 320));
  out.anchos[w] = await S.ev(() => {
    const a = document.querySelector('[data-rac-ap="aaorca"]');
    a.querySelectorAll('input[data-rac]').forEach(c => { c.checked = true });
    racDibujar('aaorca');
    const cuerpo = a.querySelector('.rac-cuerpo');
    const txt = a.querySelector('.rac-txt').getBoundingClientRect();
    const esq = a.querySelector('.rac-esq').getBoundingClientRect();
    const solapa = !(esq.left >= txt.right - 1 || esq.top >= txt.bottom - 1
                     || txt.left >= esq.right - 1 || txt.top >= esq.bottom - 1);
    const chks = Array.prototype.map.call(a.querySelectorAll('.rac-chk'), l => {
      const r = l.getBoundingClientRect();
      const t = l.querySelector('.rac-chk-t').getBoundingClientRect();
      return { k: l.querySelector('input').getAttribute('data-rac'),
               h: Math.round(r.height), th: Math.round(t.height),
               enTitulo: !!l.closest('.rac-tit') };
    });
    const inputs = Array.prototype.map.call(a.querySelectorAll('input[data-rac]'), c => {
      const r = c.getBoundingClientRect(); return Math.round(r.height);
    });
    return { dir: getComputedStyle(cuerpo).flexDirection,
             txtW: Math.round(txt.width), esqW: Math.round(esq.width),
             esqAbajo: esq.top > txt.top + 10, solapa: solapa,
             chks: chks,
             zonaMin: Math.min.apply(null, chks.map(c => Math.max(c.h, c.th))),
             inputMin: Math.min.apply(null, inputs),
             scrollH: document.documentElement.scrollWidth - document.documentElement.clientWidth,
             desbordaFicha: (function (){ const f = document.getElementById('ref-coronarias');
               return f.scrollWidth > f.clientWidth + 1 })() };
  });
}
out.errores = S.errores ? S.errores() : null;
console.log(JSON.stringify(out, null, 1));
S.cerrar();
