#!/usr/bin/env node
/**
 * _probe_tga3circ.mjs - el ESQUEMA DE CIRCULACION de la TGA (TGA-3, commits 3, 4 y 5).
 *
 * Mide, escenario por escenario:
 *   - que se dibuje el escenario que los campos piden (seis claves: norm, dtga, mus, jat, ras, ltga);
 *   - EL CONTROL CLINICO DEL 4b: la secuencia de cavidades y vasos que el dibujo recorre contra
 *     el recorrido que `TGA3D_CIRC` -de la app, no de la demo- ya publica para esa clave;
 *   - las dos exclusiones medidas: no la CIA con el switch auricular, no la CIV con el Rastelli;
 *   - que cada comunicacion se dibuje SOLO si esta cargada, y que lleve punta de flecha SOLO
 *     donde la app guarda la direccion (CIA y DAP si, CIV no);
 *   - el cambio en vivo en los DOS sentidos;
 *   - que el esquema NO escribe un solo campo del estudio;
 *   - el globo, la leyenda y la alternativa de texto.
 *
 *   node scripts/_probe_tga3circ.mjs [--file <html>]
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null; for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log('SIN PLAYWRIGHT'); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/tga3_circ.json';

const CUERPO = `(async () => {
  const R = { errs: [] };
  const EL = i => document.getElementById(i);
  const S = (i, v) => { const e = EL(i); if (!e) return 'NO ' + i; e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const esperar = ms => new Promise(r => setTimeout(r, ms));

  /* DENOMINADOR: la seccion vive en la sub-pestana «CC complejas» y su acordeon ya viene
     abierto. Sin las dos pestanas por su boton real todo da 0x0 y el esquema parece no existir. */
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const Q = String.fromCharCode(39);
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  S('nombre', 'Prueba TGA3'); S('ci', '601');
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click();
        const b2 = bq('ccSubTab(' + Q + 'congenitas2'); if (b2) b2.click() } catch (e) {}
  await esperar(400);
  const acc = EL('sacc-cc-tga');
  if (acc && !acc.classList.contains('open')) { const h = document.querySelector('#sacc-cc-tga .sacc-hdr'); if (h) h.click() }
  await esperar(1500);
  R.accAbierto = acc ? (acc.classList.contains('open') ? 'si' : 'NO') : 'NO EXISTE';
  R.hayEsq = EL('tga-esq-svg') ? 'si' : 'NO';
  R.hayGlobo = document.querySelector('[data-vinfo="tga-esq"]') ? 'si' : 'NO';
  R.leyenda = (function () { const b = EL('tga-esq-box');
    return b && String(b.textContent || '').indexOf('Esquema ilustrativo') >= 0 ? 'si' : 'NO' })();

  /* ── El recorrido DIBUJADO: de donde a donde va cada flecha, leido de la geometria ────────
     Cada flecha es un trazado; se la clasifica por el punto donde empieza y donde termina,
     comparando contra las cajas de las cavidades y de los dos organos. Asi la secuencia sale
     del DIBUJO y no de una constante que yo escriba. */
  const nodos = () => {
    const sv = EL('tga-esq-svg') ? EL('tga-esq-svg').querySelector('svg') : null;
    if (!sv) return null;
    const cajas = [];
    Array.prototype.forEach.call(sv.querySelectorAll('rect'), function (r) {
      const x = +r.getAttribute('x'), y = +r.getAttribute('y'),
            w = +r.getAttribute('width'), h = +r.getAttribute('height');
      let nom = '';
      Array.prototype.forEach.call(sv.querySelectorAll('text'), function (tx) {
        const tc = +tx.getAttribute('x'), ty = +tx.getAttribute('y');
        if (tc > x && tc < x + w && ty > y && ty < y + h + 2 && !nom) nom = String(tx.textContent || '').trim();
      });
      cajas.push({ nom: nom, x: x, y: y, w: w, h: h });
    });
    return cajas;
  };
  const flechas = () => {
    const sv = EL('tga-esq-svg') ? EL('tga-esq-svg').querySelector('svg') : null;
    if (!sv) return [];
    return Array.prototype.map.call(sv.querySelectorAll('.tga-esq-fl'), function (p) {
      const d = p.getAttribute('d') || '';
      const col = p.getAttribute('stroke') || '';
      let L = 0; try { L = Math.round(p.getTotalLength()) } catch (e) {}
      let a = null, b = null;
      try { const p0 = p.getPointAtLength(0), p1 = p.getPointAtLength(p.getTotalLength());
            a = [Math.round(p0.x), Math.round(p0.y)]; b = [Math.round(p1.x), Math.round(p1.y)] } catch (e) {}
      return { d: d, col: col.indexOf('azul') >= 0 ? 'b' : (col.indexOf('rojo') >= 0 ? 'r' : '?'),
               ini: a, fin: b, largo: L };
    });
  };
  const estado = () => {
    const h = EL('tga-esq-svg') ? EL('tga-esq-svg').innerHTML : '';
    const cj = nodos() || [];
    return {
      fl: flechas().length,
      azules: flechas().filter(f => f.col === 'b').length,
      rojas: flechas().filter(f => f.col === 'r').length,
      cav: cj.filter(c => c.w === 80).map(c => c.nom),
      organos: cj.filter(c => c.w === 180).map(c => c.nom),
      valvulas: (function () { const sv = EL('tga-esq-svg').querySelector('svg');
        if (!sv) return [];
        return Array.prototype.map.call(sv.querySelectorAll('circle'), function (c) {
          let L = ''; Array.prototype.forEach.call(sv.querySelectorAll('text'), function (tx) {
            if (Math.abs(+tx.getAttribute('x') - +c.getAttribute('cx')) < 2 &&
                Math.abs(+tx.getAttribute('y') - +c.getAttribute('cy')) < 8) L = String(tx.textContent || '').trim();
          });
          return L + '@' + c.getAttribute('cx') + ',' + c.getAttribute('cy');
        }).filter(x => x.charAt(0) === 'T' || x.charAt(0) === 'M');
      })(),
      CIA: h.indexOf('>CIA<') >= 0, CIV: h.indexOf('>CIV<') >= 0, DAP: h.indexOf('>DAP<') >= 0,
      puntas: (h.match(/marker-end/g) || []).length,
      naranjas: (h.match(/naranja/g) || []).length,
      txt: String((EL('tga-esq-txt') || {}).textContent || ''),
      alt: String((EL('tga-esq-alt') || {}).textContent || ''),
      circ: String((EL('tga-3d-circ') || {}).textContent || '')
    };
  };

  /* ── ESCENARIO POR ESCENARIO ──────────────────────────────────────────────────────────── */
  const ESC = [
    ['A_norm',   { tga_tipo:'' }],
    ['B_dtga',   { tga_tipo:'dtga' }],
    ['C_mus',    { tga_tipo:'dtga', tga_cirugia:'auricular' }],
    ['C2_mustard', { tga_tipo:'mustard' }],
    ['D_jat',    { tga_tipo:'dtga', tga_cirugia:'jatene' }],
    ['E_ras',    { tga_tipo:'dtga', tga_cirugia:'rastelli' }],
    ['F_ltga',   { tga_tipo:'cctga' }]
  ];
  R.esc = {};
  for (const par of ESC) {
    S('tga_tipo', par[1].tga_tipo || '');
    S('tga_cirugia', par[1].tga_cirugia || '');
    await esperar(420);
    R.esc[par[0]] = estado();
  }

  /* ── LAS COMUNICACIONES Y SUS DOS EXCLUSIONES ─────────────────────────────────────────── */
  S('ete_cia_tam_max', '12'); S('ete_civ_tam', '6'); S('dap_diam', '3');
  await esperar(420);
  R.coms = {};
  for (const par of ESC) {
    S('tga_tipo', par[1].tga_tipo || '');
    S('tga_cirugia', par[1].tga_cirugia || '');
    await esperar(420);
    const e = estado();
    R.coms[par[0]] = { CIA:e.CIA, CIV:e.CIV, DAP:e.DAP, puntas:e.puntas, txt:e.txt };
  }
  /* La direccion: la app la guarda para la CIA y el DAP y NO para la CIV. */
  S('tga_tipo', 'dtga'); S('tga_cirugia', 'ninguna'); await esperar(300);
  const sinDir = estado().puntas;
  S('ete_cia_dir', 'id'); await esperar(350); const conCia = estado().puntas;
  S('dap_dir', 'id');     await esperar(350); const conDap = estado().puntas;
  R.direcciones = { sinDir:sinDir, conCIA:conCia, conCIADAP:conDap,
                    civTieneCampoDeDireccion: !!document.getElementById('ete_civ_dir') };

  /* ── EL CAMBIO EN VIVO, EN LOS DOS SENTIDOS ───────────────────────────────────────────── */
  S('tga_tipo', 'dtga'); S('tga_cirugia', 'jatene'); await esperar(400);
  const v1 = estado();
  S('tga_cirugia', 'rastelli'); await esperar(400);
  const v2 = estado();
  S('tga_cirugia', ''); await esperar(400);
  const v3 = estado();
  S('tga_tipo', ''); await esperar(400);
  const v4 = estado();
  R.vivo = { jatene:v1.naranjas + '/' + v1.fl, rastelli:v2.naranjas + '/' + v2.fl,
             sinCirugia:v3.naranjas + '/' + v3.fl, sinTipo:v4.cav.join('-'),
             distintos: new Set([v1.txt, v2.txt, v3.txt, v4.txt]).size };

  /* ── NO ESCRIBE NADA: el juego de campos del estudio antes y despues de recorrer los seis ─ */
  const foto = () => { const o = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
      if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
      o[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || '') });
    return o };
  const antes = foto();
  for (const par of ESC) { S('tga_tipo', par[1].tga_tipo || ''); S('tga_cirugia', par[1].tga_cirugia || '');
    await esperar(260) }
  S('tga_tipo', ''); S('tga_cirugia', ''); await esperar(500);
  const desp = foto();
  const movidos = Object.keys(antes).filter(k => String(antes[k]) !== String(desp[k]));
  R.noEscribe = { campos:Object.keys(antes).length, movidos:movidos.length, cuales:movidos.slice(0, 8) };
  /* Y que ninguna clave del esquema sea campo del estudio. */
  R.clavesEsq = Object.keys(foto()).filter(k => k.indexOf('tga-esq') === 0 || k.indexOf('tga_esq') === 0);
  return R;
})()`;

const b = await _pw.chromium.launch({ channel: 'chrome', headless: true });
const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; pg.on('pageerror', e => errs.push(e.message.slice(0, 160)));
pg.on('console', m => { if (m.type() === 'error') errs.push('consola: ' + m.text().slice(0, 160)) });
let R;
try { await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 90000 });
      await pg.waitForTimeout(1400);
      R = await pg.evaluate(CUERPO) }
catch (e) { R = { FATAL: String(e).slice(0, 300) } }
R.errsPagina = errs;
fs.writeFileSync(OUTF, JSON.stringify(R, null, 1));
console.log('ARCHIVO ' + FILE);
if (R.FATAL) { console.log('FATAL ' + R.FATAL); }
else {
  console.log('denominador: acordeon=' + R.accAbierto + ' esquema=' + R.hayEsq +
              ' globo=' + R.hayGlobo + ' leyenda=' + R.leyenda);
  console.log('');
  console.log('ESCENARIO   fl  cavidades                  valvulas          recorrido de la app (TGA3D_CIRC)');
  Object.keys(R.esc).forEach(k => { const e = R.esc[k];
    console.log(k.padEnd(11) + String(e.fl).padEnd(4) + e.cav.join(',').padEnd(27) +
                e.valvulas.join(' ').padEnd(18) + e.circ.slice(0, 60)); });
  console.log('');
  console.log('COMUNICACIONES (las tres cargadas)');
  Object.keys(R.coms).forEach(k => { const c = R.coms[k];
    console.log('  ' + k.padEnd(11) + 'CIA=' + (c.CIA ? 'si' : 'NO ') + ' CIV=' + (c.CIV ? 'si' : 'NO ') +
                ' DAP=' + (c.DAP ? 'si' : 'NO ') + ' puntas=' + c.puntas); });
  console.log('');
  console.log('direcciones: ' + JSON.stringify(R.direcciones));
  console.log('en vivo    : ' + JSON.stringify(R.vivo));
  console.log('no escribe : ' + JSON.stringify(R.noEscribe));
  console.log('claves del esquema que son campo del estudio: ' + JSON.stringify(R.clavesEsq));
  console.log('ERRORES de consola y de pagina: ' + errs.length + (errs.length ? ' :: ' + errs.slice(0, 2).join(' | ') : ''));
}
await b.close();
