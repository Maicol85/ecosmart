/*
 * _probe_pant2bc.mjs - el ⓘ QUE SE CIERRA (correccion B) y el INVENTARIO de los paneles de
 * Evidencia (correccion C1), tanda PANT-2, 2026-11-02. Nombre propio: verificado con ls.
 *
 * PARTE B - con CLICS REALES, no llamando funciones:
 *   B1  tocar el ⓘ abre su nota y pone aria-expanded en true;
 *   B2  tocar OTRO ⓘ cierra el primero: UNA sola abierta por vez;
 *   B3  tocar FUERA de la nota la cierra;
 *   B4  Escape la cierra Y DEJA EL PANEL ABIERTO;
 *   B5  CONTROL NEGATIVO: tocar DENTRO de la nota NO la cierra;
 *   B6  la nota no tapa la pregunta de su PROPIA fila (interseccion de rectangulos);
 *   B7  la nota no se sale de la pantalla;
 *   B8  cerrar y reabrir el panel no deja ninguna nota abierta.
 * En DOS anchos y en todos los paneles que usan el molde.
 *
 * PARTE C1 - el inventario: por cada seccion de IND_SECS que DESPIERTE, cuantas preguntas
 * tiene, si usa el molde (compacta / preguntas) y el alto de su bloque a 1440, 1000 y 390 px.
 * El DENOMINADOR es cuantas secciones despertaron: sin el, «ninguna de mas de 6 preguntas» no
 * se distingue de «no desperto ninguna».
 *
 *   node scripts/_probe_pant2bc.mjs --file /tmp/x.html --out /tmp/pant2bc.json
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
const OUTF = arg('--out') || '/tmp/pant2bc.json';
const ANCHOS = (arg('--anchos') || '1440,1000,390').split(',').map(Number);

/* El estudio RICO: despierta todas las secciones de preguntas que se pueden despertar juntas.
   Los valores salen de los montajes de las sondas de TGA-3, TGA-4, CONG-2A y AORTA-2. */
const RICO = {
  campos: { nombre:'Prueba PANT2 BC', ci:'621', peso:'70', talla:'170', edad:'42',
    ete_cia_tam_max:'18', ete_civ_tam:'8', dap_diam:'3', ao_sin:'44', ao_asc:'48',
    vmax_ao:'3.2', mch_grad_reposo:'45', siv:'18', ppvi:'12', fevi:'55',
    vd_bas:'45', fop_tunel:'9' },
  sel: { sexo:'M', tga_tipo:'dtga', tga_cirugia:'auricular',
    ete_cia_tipo:'os', ete_civ_tipo:'perimembranosa', dap_tipo:'tubular',
    va_morf:'Bicúspide', vab_tipo:'L-R', coa_presente:'si' }
};

/* El inventario: se le pregunta a cada funcion de IND_SECS, que es el dueno. */
const INV = `(() => {
  if (typeof IND_SECS === 'undefined') return { err: 'SIN IND_SECS' };
  const out = { n: IND_SECS.length, secs: [] };
  IND_SECS.forEach(function (s, i) {
    const o = { i: i, tit: String(s.tit || '').slice(0, 64) };
    let r = null;
    try { r = s.fn() } catch (e) { o.err = String(e).slice(0, 70) }
    o.despierta = !!r;
    if (r) {
      const cl = r.clinica || [];
      o.filasClin = cl.length;
      o.grupos = cl.filter(function (f) { return f && f.grupoHdr }).length;
      o.preguntas = cl.filter(function (f) { return f && f.ctrl && !f.grupoHdr }).length;
      o.conNota = cl.filter(function (f) { return f && f.ctrl && f.nota }).length;
      o.compacta = !!r.compacta;
      o.molde = !!r.preguntas;
      o.filasDato = (r.filas || []).length;
    }
    out.secs.push(o);
  });
  return out;
})()`;

/* Las alturas: por cada bloque de seccion pintado en el panel, su titulo y su alto. */
const ALTOS = `(() => {
  const card = document.getElementById('indic-card');
  if (!card) return { err: 'sin panel' };
  const o = { panelW: Math.round(card.getBoundingClientRect().width),
    panelH: Math.round(card.getBoundingClientRect().height), bloques: [] };
  const cu = document.getElementById('indic-cuerpo');
  o.cuerpoH = cu ? Math.round(cu.scrollHeight) : 0;
  Array.prototype.forEach.call(card.querySelectorAll('[data-ind-grid]'), function (g) {
    const r = g.getBoundingClientRect();
    /* El titulo de la seccion es el encabezado mas cercano hacia arriba. */
    let t = '', n = g.previousElementSibling, k = 0;
    while (n && !t && k++ < 4) { const s = String(n.textContent || '').trim(); if (s) t = s.slice(0, 54); n = n.previousElementSibling }
    o.bloques.push({ tit: t, w: Math.round(r.width), h: Math.round(r.height),
      cols: g.getAttribute('data-ind-cols') || '-', preg: g.getAttribute('data-ind-preg') || '-',
      compacta: g.getAttribute('data-ind-compacta') || '-',
      /* SE CUENTAN LAS FILAS Y NO LOS BOTONES: un data-ind-clin es un BOTON de respuesta y una
         pregunta de tres estados trae tres, asi que contarlos daba el triple -con 42 botones la
         seccion tiene 14 preguntas, no 42-. La regla del medico habla de PREGUNTAS.
         (Sin acentos graves: este comentario vive DENTRO de un template literal.) */
      nPreg: (function () { let c = 0;
        Array.prototype.forEach.call(g.querySelectorAll('tr'), function (tr) {
          if (tr.querySelector('[data-ind-clin]')) c++ });
        return c })(),
      nBotones: g.querySelectorAll('[data-ind-clin]').length,
      nInfo: g.querySelectorAll('details[data-ind-info]').length,
      /* El alto de la fila de pregunta mas alta, que es la meta de 56 px del C2. */
      filaMax: (function () { let m = 0;
        Array.prototype.forEach.call(g.querySelectorAll('tr'), function (tr) {
          if (!tr.querySelector('[data-ind-clin]')) return;
          m = Math.max(m, Math.round(tr.getBoundingClientRect().height)) });
        return m })() });
  });
  o.totInfo = card.querySelectorAll('details[data-ind-info]').length;
  o.totPreg = (function () { let c = 0;
    Array.prototype.forEach.call(card.querySelectorAll('tr'), function (tr) {
      if (tr.querySelector('[data-ind-clin]')) c++ });
    return c })();
  o.totBotones = card.querySelectorAll('[data-ind-clin]').length;
  /* El conteo de CITAS del panel, que tiene que quedar IGUAL antes y despues. */
  o.citas = card.querySelectorAll('[data-ind-ref]').length;
  o.biblio = card.querySelectorAll('[data-ind-biblio]').length;
  o.colbtn = card.querySelectorAll('[data-ind-colbtn]').length;
  return o;
})()`;

/* El estado de las notas, para las ocho condiciones de B. */
const EST = `(() => {
  const ds = Array.prototype.slice.call(document.querySelectorAll('details[data-ind-info]'));
  const ab = ds.filter(function (d) { return d.open });
  const ov = document.getElementById('indic-overlay');
  const o = { n: ds.length, abiertas: ab.length,
    panelVisible: !!(ov && ov.style.display !== 'none'),
    aria: ds.map(function (d) { const s = d.querySelector('summary');
      return (s ? s.getAttribute('aria-expanded') : 'SIN SUMMARY') + '/' + (d.open ? 'open' : 'cerr') })
      .filter(function (x, i) { return i < 6 }) };
  /* La geometria de la nota abierta: que no tape su propia fila ni se salga de la pantalla. */
  if (ab.length === 1) {
    const d = ab[0], nota = d.querySelector('div'), tr = d.closest('tr');
    if (nota && tr) {
      const a = nota.getBoundingClientRect(), b = tr.getBoundingClientRect();
      const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      o.nota = { w: Math.round(a.width), h: Math.round(a.height),
        x: Math.round(a.left), y: Math.round(a.top) };
      /* ⚠️ LA INTERSECCION SE MIDE EN LOS DOS EJES. Un solo eje informa un solape que no existe:
         es la leccion de T3-g, donde dos arneses midieron la resta vertical sobre dos cajas que
         comparten rango por diseno. */
      o.enFila = Math.round(ix * iy);
      /* ⚠️ Y SE MIDE CONTRA LA CELDA DEL ROTULO, NO CONTRA EL tr, que es otra correccion medida.
         Una nota EN FLUJO -las secciones sin el molde de preguntas- vive DENTRO de su propia
         celda y hace crecer la fila, asi que su interseccion con el tr es total POR
         CONSTRUCCION: la metrica daba 10.577 px2 sobre una nota que no tapa nada. Lo que la
         orden prohibe es tapar LA PREGUNTA, y la pregunta es el rotulo. */
      const td = tr.querySelector('td');
      if (td) { const c = td.getBoundingClientRect();
        const jx = Math.max(0, Math.min(a.right, c.right) - Math.max(a.left, c.left));
        const jy = Math.max(0, Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top));
        o.tapaRotulo = Math.round(jx * jy);
        o.rotulo = { w: Math.round(c.width), h: Math.round(c.height), y: Math.round(c.top) };
      }
      o.fueraIzq = Math.round(Math.max(0, -a.left));
      o.fueraDer = Math.round(Math.max(0, a.right - window.innerWidth));
      o.fueraArr = Math.round(Math.max(0, -a.top));
    }
  }
  return o;
})()`;

/* ⚠️ EL CLIC ES `summary.click()` DEL DOM, Y NO UN CLIC POR COORDENADAS DE PLAYWRIGHT. Es una
   correccion medida, no una comodidad. El ⓘ es un <summary> con display:inline de ONCE por
   TRECE pixeles -lo que T4-g declara- dentro de #indic-cuerpo, que tiene overflow:auto: cuando
   la fila queda fuera del area visible del scroll, su getBoundingClientRect devuelve la
   posicion TEORICA dentro del contenido y elementFromPoint en ese punto devuelve el pie de la
   tarjeta. Medido: los NUEVE puntos del rect del summary daban DIV y ninguno el summary, con la
   tarjeta en 283 px de alto y el glifo informando y=578. Con eso, los tres anchos informaban
   «la nota no se abre» sobre un panel sano, y Playwright fallaba por timeout de actionability.
   `summary.click()` dispara el toggle NATIVO del <details> y pasa por captura y burbuja igual
   que un clic de raton, que es lo que hay que ejercitar: el cierre al tocar fuera, el Escape y
   la regla de una sola abierta cuelgan de esos listeners. Medido que abre: open pasa a true y
   la cuenta de abiertas a 1.
   EL HIT TEST SE MIDE APARTE, en `hit`, con el contenedor ya scrolleado: es una condicion
   propia y no se mezcla con las del comportamiento. */
async function clicDom(pg, sel) {
  return await pg.evaluate("(() => { try { const e = document.querySelector(" + JSON.stringify(sel) + ");"
    + " if (!e) return 'NO EXISTE';"
    + " try { e.scrollIntoView({ block: 'center' }) } catch (x) {}"
    + " e.click(); return 'ok' } catch (x) { return String(x).slice(0, 70) } })()");
}

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
      try { if (typeof _recalcModulos === 'function') _recalcModulos('bc') } catch (e) {}
      Object.keys(window).forEach(k => { if (/^calc[A-Z]/.test(k) && typeof window[k] === 'function') {
        try { window[k]() } catch (e) {} } });
      return true;
    })(${JSON.stringify(RICO)})`);
    await pg.waitForTimeout(900);
    const inv = await pg.evaluate(INV);
    /* El panel se abre por su BOTON real, no por indicAbrir(): es lo que la orden pide. */
    const abrio = await pg.evaluate("(() => { const b = document.getElementById('indic-btn');"
      + " if (!b) return 'NO EXISTE'; b.click(); return 'click' })()");
    await pg.waitForTimeout(700);
    const altos = await pg.evaluate(ALTOS);
    const B = {};
    B.inicial = await pg.evaluate(EST);
    /* ⚠️ SE NUMERAN SOLO LOS ⓘ VISIBLES, y es una correccion medida. Un data-ind-info puede vivir
       dentro del bloque de notas de su seccion, que es OTRO details y nace CERRADO: ahi el ⓘ no se
       renderiza, pero getBoundingClientRect devuelve su posicion teorica y elementFromPoint en ese
       punto da el pie de la tarjeta. Los NUEVE puntos daban DIV, o sea 0 de 9, sobre un ⓘ que
       simplemente no estaba a la vista. Se mide sobre los que el medico ve. */
    const sels = await pg.evaluate("(() => { const todos = document.querySelectorAll('details[data-ind-info]');"
      + " let n = 0, oculto = 0;"
      + " for (let i = 0; i < todos.length; i++) { const d = todos[i];"
      + "   const pa = d.parentElement ? d.parentElement.closest('details:not([open])') : null;"
      + "   const vis = !pa && (typeof d.checkVisibility === 'function' ? d.checkVisibility() : !!d.offsetParent);"
      + "   if (!vis) { oculto++; continue }"
      + "   d.setAttribute('data-bc', String(n++)) }"
      + " return n + '|' + oculto + '|' + todos.length })()");
    B.nInfo = sels;
    const nVis = parseInt(String(sels).split('|')[0], 10) || 0;
    /* El hit test del glifo, como condicion PROPIA: con el ⓘ ya traido al centro del scroll,
       cuantos de los nueve puntos de su rect devuelven el propio summary. */
    B.hit = await pg.evaluate("(() => { const d = document.querySelector('details[data-bc=\"0\"]');"
      + " if (!d) return 'SIN ⓘ'; const s = d.querySelector('summary');"
      + " try { s.scrollIntoView({ block: 'center' }) } catch (e) {}"
      + " const r = s.getBoundingClientRect(); let n = 0, tot = 0;"
      + " for (const fx of [0.2, 0.5, 0.8]) for (const fy of [0.2, 0.5, 0.8]) { tot++;"
      + "   const e = document.elementFromPoint(r.x + r.width * fx, r.y + r.height * fy);"
      + "   if (e && e.closest && e.closest('summary') === s) n++ }"
      + " return n + '/' + tot + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) })()");
    /* B1: tocar el PRIMER ⓘ. Se usa un clic REAL de Playwright sobre el summary. */

    if (nVis >= 1) {
      B.e1 = await clicDom(pg, 'details[data-bc="0"] > summary');
      await pg.waitForTimeout(250);
      B.b1 = await pg.evaluate(EST);
      /* B5 (CONTROL NEGATIVO): tocar DENTRO de la nota no la cierra. */
      B.e5 = await clicDom(pg, 'details[data-bc="0"][open] > div');
      await pg.waitForTimeout(250);
      B.b5_dentro = await pg.evaluate(EST);
      /* B2: tocar OTRO ⓘ -> una sola abierta. */
      if (nVis >= 2) {
        B.e2 = await clicDom(pg, 'details[data-bc="1"] > summary');
        await pg.waitForTimeout(250);
        B.b2_otra = await pg.evaluate(EST);
      }
      /* B3: tocar FUERA -> se cierra. El titulo del panel esta fuera de toda nota. */
      B.e3 = await clicDom(pg, '#indic-titulo');
      await pg.waitForTimeout(250);
      B.b3_fuera = await pg.evaluate(EST);
      /* B4: abrir de nuevo y cerrar con Escape; el panel tiene que seguir abierto. */
      B.e4 = await clicDom(pg, 'details[data-bc="0"] > summary');
      await pg.waitForTimeout(200);
      B.b4_antes = await pg.evaluate(EST);
      /* El foco en la tarjeta: Escape se despacha sobre el elemento enfocado, y sin esto podia
         irse a un nodo fuera del panel. */
      await pg.evaluate("(() => { const c = document.getElementById('indic-card'); if (c) c.focus(); return 1 })()");
      await pg.keyboard.press('Escape');
      await pg.waitForTimeout(300);
      B.b4_esc = await pg.evaluate(EST);
      /* B8: cerrar el panel y reabrirlo. */
      B.e8 = await clicDom(pg, 'details[data-bc="0"] > summary');
      await pg.waitForTimeout(200);
      await pg.evaluate("(() => { if (typeof indicCerrar === 'function') indicCerrar(); return 1 })()");
      await pg.waitForTimeout(300);
      await pg.evaluate("(() => { const b = document.getElementById('indic-btn'); if (b) b.click(); return 1 })()");
      await pg.waitForTimeout(600);
      B.b8_reabre = await pg.evaluate(EST);
    }
    OUT['w' + W] = { inv, abrio, altos, B };
    const d = (x) => x ? (x.abiertas + '/' + x.n) : '-';
    console.log('-- ' + W + 'px | secs despiertas=' + (inv.secs || []).filter(s => s.despierta).length
      + '/' + inv.n + ' | panel=' + altos.panelW + 'x' + altos.panelH + ' cuerpo=' + altos.cuerpoH
      + ' preg=' + altos.totPreg + ' info=' + altos.totInfo + ' citas=' + altos.citas
      + ' colbtn=' + altos.colbtn
      + ' | vis=' + B.nInfo + ' hit=' + B.hit
      + ' | B1=' + d(B.b1) + ' dentro=' + d(B.b5_dentro) + ' otra=' + d(B.b2_otra)
      + ' fuera=' + d(B.b3_fuera) + ' esc=' + d(B.b4_esc)
      + ' panelTrasEsc=' + ((B.b4_esc || {}).panelVisible) + ' reabre=' + d(B.b8_reabre));
    await pg.close();
  }
} catch (e) { OUT._err = String(e).slice(0, 250) }
await b.close();
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF);
process.exit(0);
