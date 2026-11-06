#!/usr/bin/env node
/**
 * _probe_pant14c_tga.mjs - la pestania de transposicion sin boton y sin hueco (commit 5) y las
 * secciones de congenitas siempre cerradas (commit 6).
 * Mide, a los cuatro anchos y en los dos temas: el alto de la seccion TGA en TODAS las
 * combinaciones de Tipo x Cirugia, la posicion de cada campo, cuantas columnas se ven, si queda
 * algun grupo vacio ocupando espacio, si hay barra horizontal o texto recortado, y el recorrido
 * de abrir secciones, cambiar de pestania y volver.
 *   node scripts/_probe_pant14c_tga.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const ANCHOS = [1440, 1000, 768, 390];

/* Tipo x Cirugia: las combinaciones que la seccion admite. */
const COMB = [
  { n:'sinTipo',  tipo:'' },
  { n:'dtga',     tipo:'dtga' },
  { n:'dtgaJat',  tipo:'dtga', cir:'jatene' },
  { n:'dtgaAur',  tipo:'dtga', cir:'auricular' },
  { n:'dtgaRas',  tipo:'dtga', cir:'rastelli' },
  { n:'cctga',    tipo:'cctga' },
  { n:'mustard',  tipo:'mustard' },
  { n:'senning',  tipo:'senning' }
];

const CUERPO = `(async () => {
  const R = { comb: {} }; const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  const Q = String.fromCharCode(39);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const COMB = __COMB__;
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const poner = (id, v) => { const e = EL(id); if (!e) return 'NO EXISTE';
    e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })); return 'ok' };
  const caja = n => { if (!n) return null; const r = n.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top) } };
  /* la sub-pestania de congenitas complejas y la seccion de la TGA, abierta por su boton real */
  /* ⚠️ LA SUB-PESTANIA SE ABRE CON ccSubTab Y NO CON showTab: su boton lleva
     onclick="ccSubTab('congenitas2')", asi que buscar showTab no encuentra nada, el panel queda
     inactivo y TODO mide cero -el alto de la seccion, las columnas, los rotulos-. Medido: la
     primera corrida dio alto 0 y una sola columna en los ocho cruces, en los DOS arboles.
     ccSubTab llama a showTab adentro, asi que el camino es el real. */
  try { if (typeof ccSubTab === 'function') ccSubTab('congenitas2') } catch (x) {}
  await esperar(600);
  R.panelActivo = (function () { const t = EL('tab-congenitas2');
    return t ? t.classList.contains('active') : 'NO HAY' })();
  const acc = EL('sacc-cc-tga');
  R.hayAcc = !!acc;
  if (acc && !acc.classList.contains('open')) {
    const h = acc.querySelector('.sacc-hdr'); if (h) h.click();
    await esperar(600);
  }
  /* las transiciones del acordeon, apagadas antes de medir */
  try { const b2 = acc.querySelector('.sacc-body');
        if (b2) { b2.style.transition = 'none'; b2.style.maxHeight = 'none'; b2.style.overflow = 'visible' } } catch (x) {}
  await esperar(250);
  R.verBtn = !!EL('tga-ver3d');
  R.hayGrupos = !!EL('tga-grupos');
  R.nGrupos = EL('tga-grupos') ? EL('tga-grupos').querySelectorAll('.cc9-col').length : 0;
  R.nCampos = EL('tga-grupos') ? EL('tga-grupos').querySelectorAll('.fg').length : 0;
  for (const c of COMB) {
    poner('tga_tipo', c.tipo);
    await esperar(260);
    if (c.cir) { poner('tga_cirugia', c.cir); await esperar(260) }
    const sec = acc ? acc.querySelector('.sacc-body') : null;
    const g = EL('tga-grupos');
    /* cuantas columnas se ven: los distintos valores de x de los grupos visibles */
    let cols = 0, vacios = 0, visibles = 0;
    const xs = {};
    if (g) Array.prototype.forEach.call(g.querySelectorAll('.cc9-col'), function (col) {
      const vis = getComputedStyle(col).display !== 'none';
      if (!vis) return;
      visibles++;
      let alguno = false;
      Array.prototype.forEach.call(col.querySelectorAll('.fg'), function (f) {
        if (getComputedStyle(f).display !== 'none') alguno = true });
      if (!alguno) vacios++;
      xs[Math.round(col.getBoundingClientRect().left)] = 1;
    });
    cols = Object.keys(xs).length;
    /* el hueco: el alto de la seccion y el alto del grupo mas alto */
    const concl = EL('tga-concl-box');
    R.comb[c.n] = { alto: sec ? caja(sec).h : 'x', cols: cols, gruposVis: visibles,
                    gruposVacios: vacios,
                    conclAncho: concl ? caja(concl).w : 'x',
                    gAncho: g ? caja(g).w : 'x',
                    conclDebajo: (concl && g) ? (caja(concl).y >= caja(g).y + caja(g).h - 4) : 'x' };
  }
  /* barra horizontal y textos recortados en la seccion */
  R.scrollX = (function () { const b = document.querySelector('.app-content') || document.body;
    return Math.max(0, b.scrollWidth - b.clientWidth) })();
  R.recortados = (function () {
    const o = [];
    const raiz = EL('sacc-cc-tga'); if (!raiz) return o;
    raiz.querySelectorAll('label, .cc9-h, .calc-lbl').forEach(function (n) {
      if (getComputedStyle(n).display === 'none') return;
      if (n.scrollWidth > n.clientWidth + 2) o.push((n.textContent || '').trim().slice(0, 40));
    });
    return o;
  })();
  /* ══ COMMIT 6: el recorrido de las secciones ══ */
  const abiertas = (t) => { const x = EL('tab-' + t);
    return x ? x.querySelectorAll('.sacc.open').length : 'NO HAY' };
  R.cc = {};
  /* abrir tres secciones a mano */
  ['cc-tga', 'cc-cvpa', 'cc-ebstein'].forEach(function (k) {
    try { if (typeof secToggle === 'function') secToggle(k) } catch (x) {} });
  await esperar(500);
  R.cc.abiertasTrasAbrir = abiertas('congenitas2');
  /* cambiar de pestania y volver, por sus botones reales */
  try { if (typeof showTab === 'function') showTab('valvulas') } catch (x) {}
  await esperar(450);
  try { if (typeof ccSubTab === 'function') ccSubTab('congenitas2') } catch (x) {}
  await esperar(550);
  R.cc.abiertasAlVolver = abiertas('congenitas2');
  R.cc.cerradorDevuelve = (typeof ccSeccionesCerrar === 'function') ? ccSeccionesCerrar('congenitas2') : 'SIN FN';
  /* lo que se abre MIENTRAS se esta en la pestania, se queda */
  try { if (typeof secToggle === 'function') secToggle('cc-tga') } catch (x) {}
  await esperar(400);
  R.cc.abiertaEnLaMismaPestania = abiertas('congenitas2');
  /* la otra sub-pestania */
  try { if (typeof ccSubTab === 'function') ccSubTab('congenitas') } catch (x) {}
  await esperar(500);
  R.cc.abiertasEnLaOtra = abiertas('congenitas');
  /* CONTROL: en una pestania que NO es de congenitas, secAutoOpen sigue abriendo con datos */
  /* EL CONTROL: en una pestania que NO es de congenitas, secAutoOpen tiene que seguir abriendo
     una seccion con un dato cargado. Se usa VD/AD, que tiene acordeon propio. */
  const sv = EL('tapse'); if (sv) { sv.value = '18'; sv.dispatchEvent(new Event('input', { bubbles: true })) }
  await esperar(350);
  try { if (typeof showTab === 'function') showTab('valvulas') } catch (x) {}
  await esperar(300);
  try { if (typeof showTab === 'function') showTab('vd') } catch (x) {}
  await esperar(550);
  R.cc.autoOpenEnOtraPestania = (function () { const x = EL('tab-vd');
    return x ? x.querySelectorAll('.sacc.open').length : 'NO HAY' })();
  R.cc.hayCerrador = (typeof ccSeccionesCerrar === 'function');
  R.cc.soloCongenitas = (typeof CC_TABS_CERRAR !== 'undefined') ? CC_TABS_CERRAR.join(',') : 'x';
  return R;
})()`;

const br = await _pw.chromium.launch({ channel: 'chrome' });
const salida = {};
for (const tema of ['dark', 'light']) {
  for (const w of ANCHOS) {
    const pg = await br.newPage({ viewport: { width: w, height: 900 } });
    const errs = [];
    pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 130)));
    try {
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
      await pg.evaluate('document.documentElement.setAttribute("data-theme", ' + JSON.stringify(tema) + ')');
      await pg.waitForTimeout(1700);
      const r = await pg.evaluate(CUERPO.replace('__COMB__', JSON.stringify(COMB)));
      r.errs = errs.filter(e => !/ERR_FILE_NOT_FOUND|favicon/.test(e));
      salida[tema + ':' + w] = r;
    } catch (e) { salida[tema + ':' + w] = { fatal: String(e).slice(0, 220), errs } }
    await pg.close();
  }
}
await br.close();
console.log(JSON.stringify(salida, null, 1));
