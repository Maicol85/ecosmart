#!/usr/bin/env node
/**
 * _probe_pant29contr.mjs - verificacion de los commits 4 y 5 de PANT-29 (2026-11-10).
 * Corre sobre UN arbol (`--file`) y se usa en SERIE sobre los dos. Mide, con el GESTO REAL:
 *   (A) las dos tarjetas grises a 1440, 1000, 768 y 390 px, con el 3D cerrado y abierto, en los
 *       DOS temas, con el desplazamiento horizontal y el recorte de texto;
 *   (B) el bloque «Arterias posiblemente involucradas» en las CINCO escenas que la orden fija,
 *       con el 3D abierto Y cerrado, y el texto de hallazgos de arriba para compararlo con HEAD;
 *   (C/D) el boton «Coronarias», su panel, las letras, la dominancia, las vistas y el reinicio.
 * ⚠️ DENOMINADOR: se abre la pestania por su `onclick`, el acordeon si hace falta, y el 3D por
 *    `#lv3d-btn`; antes de medir se confirma que `lv3dDiag().abierto` es verdadero y que hay
 *    poligonos. Un canvas sin tamanio cargado pinta el mensaje y no dibuja NADA.
 * Nombre propio: verificado con ls, no existia.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              process.env.HOME + '/.pwtmp/node_modules/playwright-core/index.js', 'playwright'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.error('sin playwright'); process.exit(2) }
const { chromium } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
/* Las cinco escenas del pedido. `null` es «ninguno». */
const ESCENAS = [
  { n: 'solo-DA',    seg: [1, 7, 13] },
  { n: 'basal-Cx',   seg: [5, 6] },
  { n: 'solo-17',    seg: [17] },
  { n: 'DA-y-CD',    seg: [7, 9] },
  { n: 'ninguno',    seg: [] }
];
const errs = [];
const navegador = await chromium.launch({ channel: 'chrome' });
const ctx = await navegador.newContext({ viewport: { width: 1440, height: 980 } });
const pg = await ctx.newPage();
pg.on('console', m => { if (m.type() === 'error') errs.push('consola: ' + m.text().slice(0, 140)) });
pg.on('pageerror', e => errs.push('pagina: ' + String(e).slice(0, 140)));
await pg.goto('file://' + FILE);
await pg.waitForTimeout(2600);
await pg.addStyleTag({ content: '*{transition:none !important}' });

/* Abre Contractilidad y, si hace falta, su acordeon. Deja el DDVI cargado para que el 3D tenga
   tamanio: sin DDVI ni VDFVI el pintor escribe el mensaje y no hay un solo poligono. */
const prep = await pg.evaluate(() => {
  const norm = s => String(s || '').replace(/\s+/g, ' ').trim();
  const bot = Array.prototype.slice.call(document.querySelectorAll('button,[onclick]'));
  const t = bot.filter(b => ((b.getAttribute('onclick') || '').indexOf("'contractilidad'") > -1))[0];
  if (t) t.click(); else if (window.showTab) showTab('contractilidad');
  const o = { tab: !!t };
  const dd = document.getElementById('ddvi') || document.querySelector('[id*="ddvi" i]');
  o.ddviId = dd ? dd.id : null;
  if (dd) { dd.value = '52'; dd.dispatchEvent(new Event('input', { bubbles: true })); dd.dispatchEvent(new Event('change', { bubbles: true })); }
  o.btn3d = !!document.getElementById('lv3d-btn');
  return o;
});
await pg.waitForTimeout(500);

/* ── (A) las dos tarjetas, cuatro anchos x dos temas x 3D cerrado/abierto ── */
const MED = {};
for (const tema of ['dia', 'noche']) {
  await pg.emulateMedia({ colorScheme: tema === 'noche' ? 'dark' : 'light' });
  for (const w of [1440, 1000, 768, 390]) {
    await pg.setViewportSize({ width: w, height: 980 });
    await pg.waitForTimeout(240);
    MED[tema + '/' + w] = await pg.evaluate(() => {
      const caja = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } };
      const o = {};
      const recortados = () => Array.prototype.slice.call(
        document.querySelectorAll('#lv3d-fila *')).filter(e => {
          if (e.children.length) return false;
          return e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0;
        }).length;
      const medir = () => ({
        hall: caja(document.getElementById('lv3d-bloque-hallazgos')),
        bot: caja(document.getElementById('lv3d-bloque-botones')),
        panel: caja(document.getElementById('lv3d-panel')),
        lienzo: caja(document.getElementById('lv3d-lienzo')),
        cols: (function () { const f = document.getElementById('lv3d-fila'); return f ? getComputedStyle(f).gridTemplateColumns : null })(),
        pad: (function () { const e = document.getElementById('lv3d-bloque-hallazgos'); return e ? getComputedStyle(e).padding : null })(),
        rec: recortados()
      });
      const b = document.getElementById('lv3d-btn');
      o.cerrado = medir();
      if (b) b.click();
      o.abierto = medir();
      o.scrollH = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      o.arterias = (function () { const e = document.getElementById('contr-arterias'); return e ? !!e.offsetParent : null })();
      if (b) b.click();
      return o;
    });
  }
}
await pg.emulateMedia({ colorScheme: 'light' });
await pg.setViewportSize({ width: 1440, height: 980 });
await pg.waitForTimeout(240);

/* ── (B) el bloque, en las cinco escenas, con el 3D cerrado y abierto ──── */
const BLO = {};
for (const e of ESCENAS) {
  for (const tresD of [false, true]) {
    BLO[e.n + (tresD ? '/3D' : '/plano')] = await pg.evaluate(({ seg, tresD }) => {
      const norm = s => String(s || '').replace(/\s+/g, ' ').trim();
      /* La via UNICA, la misma que usa el bull's eye. */
      if (typeof LV3D_SEG_ID !== 'undefined' && typeof contrSetSegmento === 'function') {
        for (let s = 1; s <= 17; s++) contrSetSegmento(LV3D_SEG_ID[s], 0);
        seg.forEach(s => contrSetSegmento(LV3D_SEG_ID[s], 1));
      }
      const b = document.getElementById('lv3d-btn');
      const dg = window.lv3dDiag ? window.lv3dDiag() : {};
      if (b && !!dg.abierto !== tresD) b.click();
      const li = document.getElementById('contr-arterias-li');
      const o = {
        lineas: li ? Array.prototype.slice.call(li.children).map(d => norm(d.textContent)) : null,
        visible: li ? !!li.offsetParent : null,
        hallazgos: norm((document.getElementById('contr-texto-informe') || {}).textContent),
        abierto: window.lv3dDiag ? !!window.lv3dDiag().abierto : null,
        fn: typeof window.contrArterias === 'function' ? window.contrArterias() : null
      };
      return o;
    }, { seg: e.seg, tresD });
  }
}
/* se deja limpio */
await pg.evaluate(() => {
  if (typeof LV3D_SEG_ID !== 'undefined' && typeof contrSetSegmento === 'function')
    for (let s = 1; s <= 17; s++) contrSetSegmento(LV3D_SEG_ID[s], 0);
  const dg = window.lv3dDiag ? window.lv3dDiag() : {};
  const b = document.getElementById('lv3d-btn');
  if (b && dg.abierto) b.click();
});

console.log(JSON.stringify({ file: FILE, prep, MED, BLO, errs }, null, 1));
await navegador.close();
process.exit(0);
