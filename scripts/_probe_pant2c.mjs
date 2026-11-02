/*
 * _probe_pant2c.mjs - la DISPOSICION de los paneles de Evidencia con mas de 6 preguntas
 * (tanda PANT-2, correccion C, 2026-11-02). Nombre propio: verificado con ls.
 *
 * QUE MIDE. La regla del medico: toda Evidencia con MAS DE 6 PREGUNTAS ordena las preguntas en
 * DOS columnas, y en UNA en anchos menores, y tiene que FUNCIONAR igual.
 *   C1  el inventario: por seccion, cuantas preguntas, si usa el molde y su alto;
 *   C2  el alto de cada bloque a 1440, 1000, 768 y 390 px, SIN maximizar y MAXIMIZADO -que es
 *       la unica forma de comparar las dos disposiciones en las mismas condiciones-;
 *   C2b el alto de la fila de pregunta mas alta (meta del pedido: 56 px o menos);
 *   C2c el area tactil de la botonera: 44 px y que NINGUN punto caiga en otro control;
 *   C2d el reparto: cuantas sub-tablas y si el orden de lectura se conserva;
 *   C3  el conteo de CITAS, que tiene que quedar IGUAL, y los TRES estados con su control
 *       negativo -«sin dato» no es «No»-.
 * El DENOMINADOR: cuantas secciones despiertan y cuantas tienen mas de 6 preguntas. Sin el,
 * «ninguna cambio» no se distingue de «no desperto ninguna».
 *
 *   node scripts/_probe_pant2c.mjs --file /tmp/x.html --out /tmp/pant2c.json
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CAND })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/pant2c.json';
const ANCHOS = (arg('--anchos') || '1440,1000,768,390').split(',').map(Number);

/* El estudio RICO. El tipo de CIA es `secundum` y NO `os`: medido, con un valor que el selector
   no tiene el select queda en cadena vacia y la compuerta de _indCIA devuelve null, asi que la
   seccion de la CIA no despertaba y el inventario la informaba dormida. */
const RICO = {
  campos: { nombre:'Prueba PANT2 C', ci:'622', peso:'70', talla:'170', edad:'42',
    ete_cia_tam_max:'18', ete_civ_tam:'8', dap_diam:'3', ao_sin:'44', ao_asc:'48',
    vmax_ao:'3.2', mch_grad_reposo:'45', siv:'18', ppvi:'12', fevi:'55',
    vd_bas:'45', fop_tunel:'9', diam_tsvi:'20', itv_tsvi:'90', tsvd_diametro:'22', vti_tsvd:'85' },
  sel: { sexo:'M', tga_tipo:'dtga', tga_cirugia:'auricular',
    ete_cia_tipo:'secundum', ete_civ_tipo:'perimembranosa', dap_tipo:'tubular',
    va_morf:'Bicúspide', vab_tipo:'L-R' }
};

const INV = `(() => {
  if (typeof IND_SECS === 'undefined') return { err: 'SIN IND_SECS' };
  const out = { n: IND_SECS.length, secs: [] };
  IND_SECS.forEach(function (s, i) {
    const o = { tit: String(s.tit || '').slice(0, 58) };
    let r = null;
    try { r = s.fn() } catch (e) { o.err = String(e).slice(0, 60) }
    o.despierta = !!r;
    if (r) {
      const cl = r.clinica || [];
      o.preguntas = cl.filter(function (f) { return f && f.ctrl && !f.grupoHdr }).length;
      o.grupos = cl.filter(function (f) { return f && f.grupoHdr }).length;
      o.infoFilas = cl.filter(function (f) { return f && !f.ctrl && !f.grupoHdr }).length;
      o.compacta = !!r.compacta; o.molde = !!r.preguntas;
      o.filasDato = (r.filas || []).length;
    }
    out.secs.push(o);
  });
  return out;
})()`;

const MIDE = `(() => {
  const card = document.getElementById('indic-card');
  if (!card) return { err: 'sin panel' };
  const cr = card.getBoundingClientRect();
  const cu = document.getElementById('indic-cuerpo');
  const o = { panelW: Math.round(cr.width), panelH: Math.round(cr.height),
    cuerpoH: cu ? Math.round(cu.scrollHeight) : 0,
    max: card.getAttribute('data-ind-max') || '-', bloques: [] };
  Array.prototype.forEach.call(card.querySelectorAll('[data-ind-grid]'), function (g) {
    const r = g.getBoundingClientRect();
    let t = '', n = g.previousElementSibling, k = 0;
    while (n && !t && k++ < 4) { const x = String(n.textContent || '').trim(); if (x) t = x.slice(0, 46); n = n.previousElementSibling }
    let nPreg = 0, filaMax = 0;
    Array.prototype.forEach.call(g.querySelectorAll('tr'), function (tr) {
      if (!tr.querySelector('[data-ind-clin]')) return;
      nPreg++; filaMax = Math.max(filaMax, Math.round(tr.getBoundingClientRect().height));
    });
    /* El reparto: cuantas sub-tablas tiene la zona de preguntas y si de verdad se ven en dos
       columnas -dos sub-tablas con la MISMA y de tope-. */
    const pc = g.querySelector('[data-ind-pregcols="1"]');
    let subs = 0, enDos = 'no', ys = [];
    if (pc) { const ss = pc.querySelectorAll('[data-ind-sub="1"]'); subs = ss.length;
      ys = Array.prototype.map.call(ss, function (x) { return Math.round(x.getBoundingClientRect().top) });
      enDos = (subs === 2 && ys[0] === ys[1]) ? 'si' : 'no'; }
    o.bloques.push({ tit: t, h: Math.round(r.height), w: Math.round(r.width),
      cols: g.getAttribute('data-ind-cols') || '-', preg: g.getAttribute('data-ind-preg') || '-',
      nPreg: nPreg, filaMax: filaMax, subs: subs, enDos: enDos, ys: ys,
      ecoSubs: g.querySelectorAll('[data-ind-col="eco"] [data-ind-sub="1"]').length,
      infoFilas: g.querySelectorAll('[data-ind-infofilas="1"] tr').length });
  });
  o.citas = card.querySelectorAll('[data-ind-ref]').length;
  o.biblio = card.querySelectorAll('[data-ind-biblio]').length;
  o.colbtn = card.querySelectorAll('[data-ind-colbtn]').length;
  o.totPreg = (function () { let c = 0;
    Array.prototype.forEach.call(card.querySelectorAll('tr'), function (tr) {
      if (tr.querySelector('[data-ind-clin]')) c++ }); return c })();
  /* El AREA TACTIL de la botonera: alto visible, alto del area y si algun punto cae en OTRO
     control. Se mide el primer boton VISIBLE de cada tipo. */
  const vis = function (b) { return typeof b.checkVisibility === 'function' ? b.checkVisibility() : !!b.offsetParent };
  const todos = Array.prototype.slice.call(card.querySelectorAll('[data-ind-clin]')).filter(vis);
  /* ⚠️ DENTRO Y FUERA DEL MOLDE SE MIDEN APARTE. La orden manda que las secciones de SEIS O
     MENOS preguntas NO se muevan, asi que el alto del boton de una seccion SIN molde es un
     CONTROL NEGATIVO: tiene que seguir en el piso tactil global de 44 px. */
  const dentro = todos.filter(function (b) { return !!b.closest('[data-ind-preg="1"]') });
  const fuera = todos.filter(function (b) { return !b.closest('[data-ind-preg="1"]') });
  o.nBotones = dentro.length; o.nBotonesFuera = fuera.length;
  if (fuera.length) { const f = fuera[0].getBoundingClientRect();
    o.botonFuera = [Math.round(f.width), Math.round(f.height)]; }
  const bs = dentro;
  if (bs.length) {
    const b0 = bs[0];
    try { b0.scrollIntoView({ block: 'center' }) } catch (e) {}
    const br = b0.getBoundingClientRect();
    o.botonVis = [Math.round(br.width), Math.round(br.height)];
    /* El area la extiende un ::after absoluto, que getBoundingClientRect NO ve: se sondea con
       elementFromPoint arriba y abajo del borde visible. */
    const cx = br.x + br.width / 2;
    const prueba = function (dy) { const e = document.elementFromPoint(cx, dy);
      return e ? (e === b0 ? 'propio' : (e.closest && e.closest('.ind-ctrl-btn') ? 'OTRO BOTON' : 'ni boton')) : 'nada' };
    o.areaArr = prueba(br.top - 5); o.areaAba = prueba(br.bottom + 5);
    o.areaCen = prueba(br.y + br.height / 2);
    /* Y el punto medio entre dos botones de filas CONSECUTIVAS: ahi es donde un area de 44 px
       sobre una fila de menos de 44 podria robarle el toque a su vecina. */
    o.vecino = 'sin par';
    for (let i = 1; i < bs.length; i++) {
      const a = bs[i - 1].getBoundingClientRect(), c2 = bs[i].getBoundingClientRect();
      if (Math.round(a.y) === Math.round(c2.y)) continue;
      try { bs[i].scrollIntoView({ block: 'center' }) } catch (e) {}
      const a2 = bs[i - 1].getBoundingClientRect(), b2 = bs[i].getBoundingClientRect();
      const my = (a2.bottom + b2.top) / 2;
      const e = document.elementFromPoint(b2.x + b2.width / 2, my);
      o.vecino = 'gap=' + Math.round(b2.top - a2.bottom) + ' medio='
        + (e ? (e.closest && e.closest('.ind-ctrl-btn') ? 'un boton' : 'ni boton') : 'nada');
      break;
    }
  }
  return o;
})()`;

/* Los TRES estados, con su control negativo: contestar «?» deja la respuesta en null y el panel
   tiene que seguir diciendo que falta contestar, no que la respuesta es «No». */
const TRES = `(() => {
  const card = document.getElementById('indic-card');
  if (!card) return { err: 'sin panel' };
  const bs = Array.prototype.slice.call(card.querySelectorAll('[data-ind-clin]'));
  if (!bs.length) return { err: 'sin botones' };
  /* ⚠️ SE ELIGE UNA PREGUNTA QUE TENGA EL CENTINELA, y es una correccion medida: el primer boton
     del panel era de hfpeff.paso3, que solo tiene DOS opciones -hecha y pendiente-, asi que
     tocar el tercer estado no hacia nada y la condicion informaba «sd no deja null» sobre una
     pregunta que no tiene tercer estado. El denominador es cuantas claves lo tienen. */
  const SD = (typeof IND_SD_VAL !== 'undefined') ? IND_SD_VAL : '__sd';
  const conSd = {};
  bs.forEach(function (b) { if (b.getAttribute('data-ind-val') === SD)
    conSd[b.getAttribute('data-ind-clin')] = 1 });
  const claves = Object.keys(conSd);
  if (!claves.length) return { err: 'ninguna pregunta tiene el tercer estado', nBotones: bs.length };
  const clave = claves[0];
  const ops = bs.filter(function (b) { return b.getAttribute('data-ind-clin') === clave })
    .map(function (b) { return b.getAttribute('data-ind-val') });
  const leer = function () { try { return (typeof _indClinGet === 'function') ? _indClinGet(clave) : 'SIN GETTER' }
    catch (e) { return 'ERR' } };
  const tocar = function (v) { const b = card.querySelector('[data-ind-clin="' + clave + '"][data-ind-val="' + v + '"]');
    if (!b) return 'no existe'; b.click(); return 'ok' };
  const o = { clave: clave, ops: ops, sd: SD, nConSd: claves.length };
  o.inicial = leer();
  const si = ops.filter(function (v) { return v !== o.sd })[0];
  o.trasSi = (tocar(si), leer());
  o.trasSd = (tocar(o.sd), leer());
  o.sdEsNull = (o.trasSd === null);
  return o;
})()`;

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE };
try {
  for (const W of ANCHOS) {
    const pg = await b.newPage({ viewport: { width: W, height: 900 } });
    pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([W + ': ' + e.message.slice(0, 140)]) });
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
    await pg.waitForTimeout(1400);
    await pg.evaluate(`((R) => {
      ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
      try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
      const S = (id, v) => { const e = document.getElementById(id); if (!e) return; e.value = v;
        e.dispatchEvent(new Event('input', { bubbles: true }));
        e.dispatchEvent(new Event('change', { bubbles: true })) };
      Object.keys(R.campos).forEach(x => S(x, R.campos[x]));
      Object.keys(R.sel).forEach(x => S(x, R.sel[x]));
      try { if (typeof _recalcModulos === 'function') _recalcModulos('c') } catch (e) {}
      Object.keys(window).forEach(k => { if (/^calc[A-Z]/.test(k) && typeof window[k] === 'function') {
        try { window[k]() } catch (e) {} } });
      return true; })(${JSON.stringify(RICO)})`);
    await pg.waitForTimeout(900);
    const inv = await pg.evaluate(INV);
    await pg.evaluate("(() => { const b = document.getElementById('indic-btn'); if (b) b.click(); return 1 })()");
    await pg.waitForTimeout(700);
    const sinMax = await pg.evaluate(MIDE);
    await pg.evaluate("(() => { if (typeof indicMaxPoner === 'function') indicMaxPoner(true);"
      + " if (typeof _indColsSync === 'function') _indColsSync(); return 1 })()");
    await pg.waitForTimeout(600);
    const conMax = await pg.evaluate(MIDE);
    const tres = await pg.evaluate(TRES);
    OUT['w' + W] = { inv, sinMax, conMax, tres };
    const des = (inv.secs || []).filter(s => s.despierta);
    const may6 = des.filter(s => s.preguntas > 6);
    const pm = (x) => (x.bloques || []).filter(b => b.preg === '1')
      .map(b => b.tit.slice(0, 14) + ' h=' + b.h + ' c=' + b.cols + ' p=' + b.nPreg
        + ' fMax=' + b.filaMax + ' subs=' + b.subs + '/' + b.enDos + ' eco=' + b.ecoSubs).join(' | ');
    console.log('== ' + W + 'px | despiertas=' + des.length + '/' + inv.n + ' >6preg=' + may6.length
      + ' | citas=' + sinMax.citas + ' preg=' + sinMax.totPreg + ' botones=' + sinMax.nBotones
      + ' btnVis=' + JSON.stringify(sinMax.botonVis) + ' area(arr/cen/aba)=' + sinMax.areaArr + '/'
      + sinMax.areaCen + '/' + sinMax.areaAba + ' vecino=' + sinMax.vecino
      + ' btnFuera=' + JSON.stringify(sinMax.botonFuera)
      + ' | 3estados(' + tres.clave + ' x' + tres.nConSd + ') si=' + tres.trasSi
      + ' sd=' + tres.trasSd + ' esNull=' + tres.sdEsNull);
    console.log('   SIN MAX (panel ' + sinMax.panelW + ', cuerpo ' + sinMax.cuerpoH + '): ' + pm(sinMax));
    console.log('   CON MAX (panel ' + conMax.panelW + ', cuerpo ' + conMax.cuerpoH + '): ' + pm(conMax));
    await pg.close();
  }
} catch (e) { OUT._err = String(e).slice(0, 250) }
await b.close();
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF);
process.exit(0);
