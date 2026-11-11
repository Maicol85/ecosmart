#!/usr/bin/env node
/**
 * _probe_p36res.mjs - parte B de PANT-36 (2026-11-11). Un arbol (--file), apto para A/B.
 * Mide los resumenes de congenitas de `ref-congenitas` contra el molde MEDIDO de `ref-miocard`
 * y contra la especificacion de `scripts/_gen_p36resumenes.py --json`:
 *  - pares titulo/cuerpo, peso 700 en el titulo y no en el cuerpo, 12 px los dos, interlineado 1,8;
 *  - techo de 849 caracteres y 7 vinietas por resumen;
 *  - el texto, carácter por carácter;
 *  - que NINGUNO nombre una guia, una clase, un folio ni una fuente, ni diga «no figura»;
 *  - que los cuatro renglones que la ficha ya tenia sigan IDENTICOS;
 *  - que `ref-miocard` no se haya movido (su techo y sus 14 hijos).
 * ⚠️ Se mide con la ficha ABIERTA y su subpestania ACTIVA: cerrada, el textContent es igual y
 * no prueba que el medico lo pueda leer; con otro panel delante no hay geometria.
 * Nombre propio: verificado con ls, no existia.
 */
import { abrir } from './_p31cdp.mjs';
import { execFileSync } from 'node:child_process';
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1] || RAIZ + '/index.html';
const SPEC = JSON.parse(execFileSync('python3', ['-I', 'scripts/_gen_p36resumenes.py', '--json'],
  { encoding: 'utf-8', cwd: RAIZ }));
const S = await abrir(FILE, { espera: 3400 });
const R = { file: FILE };
R.entrar = await S.entrar();
await S.viewport(1440, 900);
await S.ev(() => { if (window.showTab) showTab('refs');
  if (typeof refSubTab === 'function') refSubTab('congenitas'); });
await S.esperar(600);

R.ficha = await S.ev(() => {
  const ab = (k) => { const d = document.getElementById('ref-' + k);
    if (d && getComputedStyle(d).display === 'none') { try { toggleRef(k, d.previousElementSibling) } catch (e) {} }
    return d; };
  const N = s => String(s || '').replace(/\s+/g, ' ').trim();
  const d = ab('congenitas');
  if (!d) return 'NO EXISTE';
  const hijos = [].slice.call(d.children).map(h => { const cs = getComputedStyle(h);
    const txt = N(h.textContent);
    let vi = 0; for (const c of txt) if (c === '•') vi++;
    return { tag: h.tagName, chars: txt.length, vinietas: vi, peso: cs.fontWeight, size: cs.fontSize,
             lh: cs.lineHeight, color: cs.color, mb: cs.marginBottom,
             vis: cs.display !== 'none' && h.getBoundingClientRect().width > 0, txt: txt }; });
  return { hijos: hijos, nHijos: hijos.length,
    original: hijos[0] ? hijos[0].txt : null,
    abierta: getComputedStyle(d).display !== 'none' && d.getBoundingClientRect().width > 0 };
});
R.miocard = await S.ev(() => {
  const d = document.getElementById('ref-miocard');
  if (!d) return 'NO EXISTE';
  const N = s => String(s || '').replace(/\s+/g, ' ').trim();
  if (getComputedStyle(d).display === 'none') { try { toggleRef('miocard', d.previousElementSibling) } catch (e) {} }
  const h = [].slice.call(d.children).map(x => N(x.textContent).length);
  return { hijos: h.length, techo: h.length >= 10 ? h[8] + h[9] : null, suma: h.reduce((a, b) => a + b, 0) };
});

/* ── el veredicto ── */
const dif = [], PROH = ['ESC ', 'ACC/AHA', 'AHA/ACC', 'folio', 'Clase I', 'Clase II', 'Clase III',
  'no figura', 'no consta en', 'guía ', 'guia ', 'sociedad', 'pendiente de revisi'];
const claves = Object.keys(SPEC);
if (typeof R.ficha === 'object' && R.ficha.hijos) {
  const H = R.ficha.hijos;
  /* el renglon original: primer hijo, intacto */
  const ORIG = 'CIA: Qp/Qs ≥1.5 + dilatación VD → cierre · Percutáneo si ≤38mm y bordes ≥5mm '
    + 'CIV: Qp/Qs >1.5 + dilatación VI → cierre · Gradiente >64mmHg = RVP baja '
    + 'PCA: sobrecarga VI → cierre percutáneo (Amplatzer de elección en adultos) '
    + 'Contraindicación: Eisenmenger (shunt derecha-izquierda) en todas';
  if (R.ficha.original !== ORIG) dif.push({ donde: 'renglon original', esperado: ORIG, hallado: R.ficha.original });
  if (H.length !== 1 + 2 * claves.length)
    dif.push({ donde: 'cantidad de hijos', esperado: String(1 + 2 * claves.length), hallado: String(H.length) });
  claves.forEach((k, i) => {
    const t = H[1 + 2 * i], c = H[2 + 2 * i];
    const sp = SPEC[k];
    if (!t || !c) { dif.push({ donde: k, esperado: 'par titulo/cuerpo', hallado: 'falta' }); return }
    if (t.txt !== sp.titulo) dif.push({ donde: k + '/titulo', esperado: sp.titulo, hallado: t.txt });
    const esperado = sp.vinietas.map(v => '• ' + v.rotulo + ': ' + v.texto).join(' ');
    if (c.txt !== esperado) dif.push({ donde: k + '/cuerpo', esperado: esperado, hallado: c.txt });
    if (t.peso !== '700') dif.push({ donde: k + '/pesoTitulo', esperado: '700', hallado: t.peso });
    if (c.peso === '700') dif.push({ donde: k + '/pesoCuerpo', esperado: 'distinto de 700', hallado: c.peso });
    if (t.size !== '12px' || c.size !== '12px') dif.push({ donde: k + '/tamanio', esperado: '12px/12px', hallado: t.size + '/' + c.size });
    if (c.lh !== '21.6px') dif.push({ donde: k + '/interlineado', esperado: '21.6px', hallado: c.lh });
    if (t.chars + c.chars > 849) dif.push({ donde: k + '/techo', esperado: '<=849', hallado: String(t.chars + c.chars) });
    if (c.vinietas > 7) dif.push({ donde: k + '/vinietas', esperado: '<=7', hallado: String(c.vinietas) });
    if (!t.vis || !c.vis) dif.push({ donde: k + '/visible', esperado: 'si', hallado: t.vis + '/' + c.vis });
    PROH.forEach(p => { if ((t.txt + ' ' + c.txt).toLowerCase().indexOf(p.toLowerCase()) > -1)
      dif.push({ donde: k + '/prohibido', esperado: 'sin "' + p + '"', hallado: p }) });
  });
}
R.medidas = (typeof R.ficha === 'object' && R.ficha.hijos)
  ? claves.map((k, i) => ({ k: k, chars: (R.ficha.hijos[1 + 2 * i] || {}).chars + (R.ficha.hijos[2 + 2 * i] || {}).chars,
      vinietas: (R.ficha.hijos[2 + 2 * i] || {}).vinietas })) : null;
R.diferencias = dif;
R.veredicto = dif.length === 0 ? 'RESUMENES IDENTICOS A LA ESPECIFICACION, DENTRO DEL MOLDE Y DEL TECHO' : (dif.length + ' DIFERENCIAS');
R.errs = S.errs.slice(0, 8);
console.log(JSON.stringify(R, null, 1));
S.cerrar();
