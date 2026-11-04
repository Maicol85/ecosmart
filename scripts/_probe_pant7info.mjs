/*
 * _probe_pant7info.mjs - PANT-7 commit 10b: el tamanio de letra del CARTEL de cada globo.
 * Abre cada clave del registro por su propio mecanismo y mide el font-size computado del
 * cuerpo de la tarjeta y de cada nodo de texto que haya adentro.
 * Nombre propio: verificado con ls, no existia.
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda.
 *   node scripts/_probe_pant7info.mjs --file <index.html> --out <json>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p7info.json';

const MEDIR = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m=document.getElementById(id); if(m) m.style.display='none' });
  document.querySelectorAll('*').forEach(e => { e.style.transition='none'; e.style.animation='none' });
  const out = { cartel: null, claves: [] };
  const card = document.getElementById('vinfo-card');
  if (!card) return { err: 'SIN vinfo-card' };
  out.cartelBase = getComputedStyle(card).fontSize;
  let REG = null;
  try { REG = (typeof VINFO !== 'undefined') ? VINFO : null } catch (e) {}
  if (!REG) return { err: 'SIN VINFO' };
  const claves = Object.keys(REG);
  out.n = claves.length;
  claves.forEach(k => {
    try { if (typeof vInfoCerrar === 'function') vInfoCerrar(true) } catch (e) {}
    /* Se abre por el DUENIO, no por el boton: muchos globos viven en pestanias cerradas y
       abrirlas una por una multiplicaria la sonda por cien. Lo que se mide es el CARTEL, que
       es el mismo nodo para todos, asi que el camino de apertura no cambia su tipografia.
       El DENOMINADOR va al lado: cuantos caracteres tiene el cartel abierto. */
    let ok = false;
    try { _vInfoAbrir(k); ok = getComputedStyle(card).display !== 'none' } catch (e) {}
    if (!ok) {
      /* si no abre por geometria, se fuerza el contenido para poder medir la tipografia */
      try { card.innerHTML = _vInfoHTML(k, null); card.style.display = 'block'; ok = true } catch (e) {}
    }
    if (!ok) { out.claves.push({ k: k, err: 'no abre' }); return }
    const chars = (card.textContent || '').trim().length;
    /* el tamanio de cada NODO DE TEXTO del cartel */
    const tam = {};
    const walk = document.createTreeWalker(card, NodeFilter.SHOW_TEXT, null);
    let t;
    while ((t = walk.nextNode())) {
      const s2 = (t.nodeValue || '').trim();
      if (!s2) continue;
      const el = t.parentElement;
      if (!el) continue;
      const cs = getComputedStyle(el);
      const key = cs.fontSize;
      tam[key] = (tam[key] || 0) + s2.length;
    }
    out.claves.push({ k: k, chars: chars, tam: tam,
      cls: (card.firstElementChild ? card.firstElementChild.className : ''),
      evRef: !!card.querySelector('.ev-ref'),
      maxPx: Object.keys(tam).map(x => parseFloat(x)).reduce((a,b) => Math.max(a,b), 0) });
  });
  try { if (typeof vInfoCerrar === 'function') vInfoCerrar(true) } catch (e) {}
  return out;
})()`;

const nav = await _pw.chromium.launch({ channel: 'chrome' });
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const pg = await ctx.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(String(e).slice(0, 150)));
let res = {};
try {
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(1500);
  res = await pg.evaluate(MEDIR);
} catch (e) { res = { error: String(e).slice(0, 200) } }
res.errores = errs.length;
await ctx.close(); await nav.close();
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log('escrito ' + OUTF);
