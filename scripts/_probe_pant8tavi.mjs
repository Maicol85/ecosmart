/*
 * _probe_pant8tavi.mjs - PANT-8, commits 1 y 2: el inventario de la pantalla de TAVI, sus dos
 * botones Pre-TAVI / Post-TAVI, su persistencia al cambiar de pantalla, la geometria a los
 * cuatro anchos y la comparacion con los botones de CIA / CIV.
 * Nombre propio: verificado con ls, no existia.
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda.
 *   node scripts/_probe_pant8tavi.mjs --file <index.html> --out <json>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p8tavi.json';
const ANCHOS = [1440, 1000, 900, 899, 768, 390];

/* ══ PREPARAR: abrir la pestania ETE y la seccion de TAVI por su boton real ══
   La seccion abre con toggleEteSeccion('tavi'); su encabezado NO lleva el id en el onclick,
   asi que buscar [onclick*="ete-seccion-tavi"] no encuentra nada. Las transiciones se apagan
   DESPUES de abrir, que es la leccion de las sondas de PANT-3. */
const PREP = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m=document.getElementById(id); if(m) m.style.display='none' });
  const o = {};
  try { showTab('ete') } catch(e) { o.tabErr = String(e).slice(0,80) }
  const sec = document.getElementById('ete-seccion-tavi');
  o.secExiste = !!sec;
  if (sec && getComputedStyle(sec).display === 'none') {
    try { toggleEteSeccion('tavi') } catch(e) { o.abrirErr = String(e).slice(0,80) }
  }
  try { if (typeof eteTaviSync === 'function') eteTaviSync() } catch(e) {}
  document.querySelectorAll('*').forEach(e => { e.style.transition='none'; e.style.animation='none' });
  o.abierta = sec ? getComputedStyle(sec).display !== 'none' : false;
  return o;
})()`;

const R = `((e) => { if (!e) return null; const r = e.getBoundingClientRect();
  return { w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10,
           x: Math.round(r.x*10)/10, y: Math.round(r.y*10)/10 } })`;

/* ══ FOTO de los dos botones y de los dos paneles ══ */
const FOTO = `(() => {
  const RR = ${R};
  const g = (id) => document.getElementById(id);
  const cs = (e) => { if(!e) return null; const s = getComputedStyle(e);
    return { bg: s.backgroundColor, color: s.color, bc: s.borderColor,
             mh: s.minHeight, mw: s.minWidth, display: s.display, bs: s.boxShadow.slice(0,40) } };
  const btn = (id) => { const e = g(id); if(!e) return { existe:false };
    const bar = e.closest('.subtabs-wrap');
    return { existe:true, cls: e.className, aria: e.getAttribute('aria-pressed'),
             txt: (e.textContent||'').trim(), rect: RR(e), st: cs(e),
             barCls: bar ? bar.className : null,
             barJust: bar ? getComputedStyle(bar).justifyContent : null,
             barRect: bar ? RR(bar) : null,
             title: e.getAttribute('title') || null,
             visible: !!e.offsetParent && RR(e).w > 0 };
  };
  const o = {};
  o.pre  = btn('ete-tavi-tab-pre');
  o.post = btn('ete-tavi-tab-post');
  o.panePre  = { d: (g('ete-tavi-pane-pre')  ? getComputedStyle(g('ete-tavi-pane-pre')).display  : 'NO EXISTE'), rect: RR(g('ete-tavi-pane-pre')) };
  o.panePost = { d: (g('ete-tavi-pane-post') ? getComputedStyle(g('ete-tavi-pane-post')).display : 'NO EXISTE'), rect: RR(g('ete-tavi-pane-post')) };
  const sec = g('ete-seccion-tavi');
  o.sec = RR(sec);
  /* barra horizontal del cuerpo */
  o.scrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  /* los dos botones de CIA / CIV, para comparar estilo */
  o.cia  = btn('ete-shunt-tab-cia');
  o.civ  = btn('ete-shunt-tab-civ');
  /* ══ LAS TRES COLUMNAS DEL PANEL POST (commit 2) ══ */
  const cc = g('ete-tavi-post-cols');
  o.cols = { existe: !!cc };
  if (cc) {
    o.cols.tpl = getComputedStyle(cc).gridTemplateColumns;
    o.cols.gap = getComputedStyle(cc).columnGap;
    const hijos = Array.prototype.slice.call(cc.children);
    o.cols.n = hijos.length;
    o.cols.rects = hijos.map(h => RR(h));
    /* lado a lado = los tres comparten su y */
    const ys = hijos.map(h => Math.round((RR(h)||{}).y));
    o.cols.ladoALado = (Math.max.apply(null,ys) - Math.min.apply(null,ys)) < 20;
    /* campos por fila dentro de cada columna */
    o.cols.porFila = hijos.map(h => {
      const fg = Array.prototype.slice.call(h.querySelectorAll('.fg'))
        .filter(e => e.getBoundingClientRect().width > 0);
      const porY = {};
      fg.forEach(e => { const y = Math.round(e.getBoundingClientRect().y); (porY[y]=porY[y]||[]).push(1) });
      const f = Object.keys(porY).sort((a,b)=>a-b).map(y => porY[y].length);
      return { nCampos: fg.length, filas: f, max: f.length ? Math.max.apply(null,f) : 0 };
    });
    /* el bloque del jet sigue a todo el ancho y DEBAJO */
    const jet = cc.nextElementSibling;
    o.cols.trasCols = jet ? (jet.textContent||'').replace(/\s+/g,' ').trim().slice(0,46) : null;
  }
  /* textos recortados dentro de la seccion */
  const sec2 = g('ete-seccion-tavi');
  o.recortados = 0;
  if (sec2) {
    Array.prototype.slice.call(sec2.querySelectorAll('label, .calc-lbl, option, button, div')).forEach(e => {
      if (e.children.length) return;
      if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0) o.recortados++;
    });
  }
  return o;
})()`;

/* ══ CENSO de campos por panel: id, rotulo, grupo ══ */
const CENSO = `(() => {
  const sec = document.getElementById('ete-seccion-tavi');
  if (!sec) return { error: 'sin seccion' };
  const rot = (e) => { const fg = e.closest('.fg'); const l = fg ? fg.querySelector('label') : null;
    return l ? (l.textContent||'').replace(/\\s+/g,' ').trim() : '' };
  /* el grupo es el ultimo encabezado de bloque (div con font-weight 700 y color accent2)
     que precede al campo en el orden del documento */
  const todos = Array.prototype.slice.call(sec.querySelectorAll('div, input, select, textarea, canvas'));
  let grupo = '';
  const out = { pre: [], post: [], fuera: [] };
  const enPane = (e) => { const p = e.closest('#ete-tavi-pane-pre') ? 'pre'
    : (e.closest('#ete-tavi-pane-post') ? 'post' : 'fuera'); return p };
  todos.forEach(e => {
    const tg = e.tagName;
    if (tg === 'DIV') {
      const s = getComputedStyle(e);
      const t = (e.textContent||'').replace(/\\s+/g,' ').trim();
      if (s.fontWeight === '700' && e.children.length <= 1 && t.length > 0 && t.length < 70
          && s.fontSize === '12px') grupo = t;
      return;
    }
    if (!e.id) return;
    const o = { id: e.id, tag: tg.toLowerCase(), tipo: e.type || '', grupo: grupo, rotulo: rot(e),
                ro: !!e.readOnly,
                ops: (tg === 'SELECT') ? Array.prototype.slice.call(e.options).map(x => x.value).join('|') : null };
    out[enPane(e)].push(o);
  });
  out.nPre = out.pre.length; out.nPost = out.post.length; out.nFuera = out.fuera.length;
  return out;
})()`;

/* ══ PERSISTENCIA: tocar Post-TAVI, irse a otra pestania y volver ══ */
const PERSIST = `(async () => {
  const g = (id) => document.getElementById(id);
  const o = {};
  const leer = () => ({ preCls: (g('ete-tavi-tab-pre')||{}).className || 'NO',
                        postCls: (g('ete-tavi-tab-post')||{}).className || 'NO',
                        preD: g('ete-tavi-pane-pre') ? getComputedStyle(g('ete-tavi-pane-pre')).display : 'NO',
                        postD: g('ete-tavi-pane-post') ? getComputedStyle(g('ete-tavi-pane-post')).display : 'NO' });
  o.alAbrir = leer();
  /* clic REAL en Post-TAVI */
  const bp = g('ete-tavi-tab-post'); if (bp) bp.click();
  o.trasClicPost = leer();
  /* cambio de pantalla: a Valvulas y de vuelta al ETE */
  try { showTab('valvulas') } catch(e) { o.e1 = String(e).slice(0,60) }
  try { showTab('ete') } catch(e) { o.e2 = String(e).slice(0,60) }
  const sec = g('ete-seccion-tavi');
  if (sec && getComputedStyle(sec).display === 'none') { try { toggleEteSeccion('tavi') } catch(e) {} }
  o.trasCambioPantalla = leer();
  /* y una pasada del embudo de recalculo, que es lo que repinta a CIA/CIV */
  try { if (typeof eteTaviSync === 'function') eteTaviSync() } catch(e) {}
  o.trasSync = leer();
  return o;
})()`;

/* ══ CIA / CIV: lo mismo, para tener el patron medido en el MISMO arbol ══ */
const PERSIST_CIA = `(() => {
  const g = (id) => document.getElementById(id);
  const o = {};
  const leer = () => ({ ciaCls: (g('ete-shunt-tab-cia')||{}).className || 'NO',
                        civCls: (g('ete-shunt-tab-civ')||{}).className || 'NO',
                        ciaChk: (g('ete_cia_activa')||{}).checked,
                        civChk: (g('ete_civ_activa')||{}).checked });
  try { showTab('ete') } catch(e) {}
  const sec = g('ete-seccion-shunt') || g('ete-seccion-cia');
  o.secId = sec ? sec.id : 'no hallada';
  try { toggleEteSeccion('shunt') } catch(e) { o.abrirErr = String(e).slice(0,60) }
  o.alAbrir = leer();
  const b = g('ete-shunt-tab-cia'); if (b) b.click();
  o.trasClic = leer();
  try { showTab('valvulas') } catch(e) {}
  try { showTab('ete') } catch(e) {}
  o.trasCambioPantalla = leer();
  return o;
})()`;

const res = { file: FILE, anchos: {} };
const nav = await _pw.chromium.launch({ channel: 'chrome' });
for (const w of ANCHOS) {
  const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e).slice(0, 150)));
  const r = {};
  try {
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(1200);
    r.prep = await pg.evaluate(PREP);
    r.conPre = await pg.evaluate(FOTO);
    if (w === 1440) r.censo = await pg.evaluate(CENSO);
    /* ahora el panel POST */
    await pg.evaluate("(()=>{ const b=document.getElementById('ete-tavi-tab-post'); if(b) b.click(); })()");
    await pg.waitForTimeout(250);
    r.conPost = await pg.evaluate(FOTO);
    if (w === 1440) {
      /* recargar para medir la persistencia desde cero */
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
      await pg.waitForTimeout(1200);
      await pg.evaluate(PREP);
      r.persist = await pg.evaluate(PERSIST);
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
      await pg.waitForTimeout(1200);
      r.persistCia = await pg.evaluate(PERSIST_CIA);
    }
  } catch (e) { r.error = String(e).slice(0, 220) }
  r.errores = errs.length; r.err1 = errs[0] || '';
  res.anchos[w] = r;
  await ctx.close();
}
await nav.close();
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log('escrito ' + OUTF);
