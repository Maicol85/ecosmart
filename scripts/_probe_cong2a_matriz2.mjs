#!/usr/bin/env node
/**
 * _probe_cong2a_matriz2.mjs — la MATRIZ de «desmarcar» con la SECCION DESPIERTA (CONG-2A, 1a).
 *
 * POR QUE EXISTE: la primera version barria los 105 selects con opcion vacia sobre un
 * formulario VACIO, y 88 de los 105 no movian ninguna superficie al ponerlos -sus secciones
 * tienen compuertas: la miocardiopatia necesita el espesor, el foramen su predicado-. Un campo
 * que no mueve nada al ponerse NO PUEDE PROBAR NADA al vaciarse: es el denominador de cero que
 * CLAUDE.md documenta. Aca el basal de cada campo es «su seccion cargada SIN ese campo», asi
 * que la seccion esta despierta y el campo queda aislado.
 *
 *   node scripts/_probe_cong2a_matriz2.mjs [--file <html>] [--sec <clave>]
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const { chromium } = _pw;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const SOLO = arg('--sec') || '';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const pg = await b.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(e.message));
pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()) });
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
await pg.waitForTimeout(1500);

const r = await pg.evaluate(`(async (SOLO) => {
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = document.getElementById(i); if (m) m.style.display = 'none' });
  const esperar = ms => new Promise(res => setTimeout(res, ms));
  const lim = () => { try { limpiarCampos(true) } catch (e) {} };
  const T = id => { const e = document.getElementById(id); return e ? String(e.value || e.textContent || '') : '' };
  const poner = (e, v) => { e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })) };

  const SECS = [].slice.call(document.querySelectorAll('[id^="sacc-cc-"]'))
                 .filter(s => !SOLO || s.id === 'sacc-cc-' + SOLO);
  /* El valor de siembra de cada control de la seccion: la primera opcion no vacia de un select,
     el medio de la ventana de plausibilidad de un numerico, y la casilla tildada. */
  const semilla = e => {
    if (e.tagName === 'SELECT') { const o = [].slice.call(e.options).filter(x => String(x.value) !== '');
      return o.length ? o[0].value : null }
    if (e.type === 'checkbox') return '1';
    if (e.type === 'number') { const mn = parseFloat(e.min), mx = parseFloat(e.max);
      if (isFinite(mn) && isFinite(mx)) return String(Math.round((mn + mx) / 2));
      return '10' }
    if (e.tagName === 'TEXTAREA' || e.type === 'text') return null;
    return null;
  };
  const sembrar = (sec, salvo) => {
    [].slice.call(sec.querySelectorAll('select[id], input[id], textarea[id]')).forEach(e => {
      if (e.id === salvo) return;
      const v = semilla(e); if (v === null) return;
      if (e.type === 'checkbox') { if (!e.checked) { e.checked = true;
        e.dispatchEvent(new Event('change', { bubbles: true })) } return }
      poner(e, v);
    });
  };
  const CAPS = ['vab-concl','coa-concl','fop-concl','mch-concl','tdf-concl','tga-concl',
                'ebs-concl','cia-concl','civ-concl','dap-concl','vap-concl','dsav-concl',
                'cvpa-concl','esub-concl','easv-concl','mca-concl','tv-concl','eisen-concl',
                'fontan-concl','marfan-concl','shunt-concl','vab-resumen','coa-concl-badge'];
  const medir = () => {
    const o = {};
    try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
    o.inf = T('informe_texto'); o.suma = T('en_suma');
    CAPS.forEach(c => { const v = T(c); if (v) o['c_' + c] = v });
    try { const ch = document.querySelectorAll('#indic-cuerpo .ind-chip');
      o.chips = ch ? ch.length : 0 } catch (e) {}
    return o;
  };
  const dif = (a, bb) => { const ks = {};
    Object.keys(a).forEach(k => ks[k] = 1); Object.keys(bb).forEach(k => ks[k] = 1);
    const d = []; Object.keys(ks).forEach(k => { if (String(a[k] || '') !== String(bb[k] || '')) d.push(k) });
    return d };

  const filas = [];
  for (let s = 0; s < SECS.length; s++) {
    const sec = SECS[s]; const clave = sec.id.replace('sacc-cc-','');
    const cands = [].slice.call(sec.querySelectorAll('select[id]')).filter(x => {
      const ops = [].slice.call(x.options);
      return ops.some(o => String(o.value) === '') && ops.some(o => String(o.value) !== '');
    });
    for (let i = 0; i < cands.length; i++) {
      const c = cands[i]; const id = c.id;
      const val = [].slice.call(c.options).filter(o => String(o.value) !== '')[0].value;
      /* BASAL: la seccion sembrada SIN este campo. */
      lim(); await esperar(250); sembrar(sec, id); await esperar(450);
      const basal = medir();
      /* PUESTO. */
      poner(document.getElementById(id), val); await esperar(450);
      const puesto = medir();
      /* VACIADO. */
      poner(document.getElementById(id), ''); await esperar(450);
      const vaciado = medir();
      const movio = dif(basal, puesto), queda = dif(basal, vaciado);
      filas.push({ sec: clave, id: id, val: String(val).slice(0,16),
                   movio: movio.length, queda: queda.length, quedaEn: queda.slice(0,6),
                   ej: queda.length ? String(vaciado[queda[0]] || '').slice(0,90) : '' });
    }
  }
  lim(); await esperar(300);
  return { n: filas.length, caps: CAPS.length,
           movieron: filas.filter(f => f.movio > 0).length,
           mudos: filas.filter(f => f.movio === 0).map(f => f.sec + '/' + f.id),
           sobreviven: filas.filter(f => f.queda > 0),
           limpios: filas.filter(f => f.queda === 0 && f.movio > 0).length };
})(${JSON.stringify(SOLO)})`, { timeout: 0 });

console.log(JSON.stringify(r, null, 1));
console.log('errores de consola:', errs.length, errs.slice(0, 3));
await b.close(); process.exit(0);
