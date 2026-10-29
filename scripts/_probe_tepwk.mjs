#!/usr/bin/env node
/**
 * _probe_tepwk.mjs - los ocho cruces de la tanda TEP (2026-10-29).
 * Dos motores x dos anchos (1440 y 390) x dos temas, UNA vez, al final.
 *
 *   node scripts/_probe_tepwk.mjs
 *   node scripts/_probe_tepwk.mjs --file /tmp/head.html
 *
 * ⚠️ WebKit de Playwright NO es Safari, y se declara en el reporte.
 * ⚠️ El binario de chromium de Playwright puede no estar: Chrome va por el del sistema con
 *    channel:'chrome'. Sin eso la sonda devuelve los cruces VACIOS, que en un volcado se lee
 *    igual que «no hubo diferencias».
 * ⚠️ SIN acentos graves dentro de los templates.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2); }
const { chromium, webkit } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUT = {};

const MEDIR = '(() => {' +
  " ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);" +
  '   if (m) m.style.display = String.fromCharCode(110,111,110,101) });' +
  ' const R = {};' +
  /* 1. Las pestanas con caja */
  " const btns = Array.prototype.slice.call(document.querySelectorAll('.tab-btn[data-mod], .tab-btn'));" +
  ' let conCaja = 0;' +
  ' btns.forEach(b => { const r = b.getBoundingClientRect(); if (r.width > 0 && r.height > 0) conCaja++; });' +
  ' R.pestanas = conCaja + String.fromCharCode(47) + btns.length;' +
  /* 2. Scroll horizontal */
  ' R.scrollH = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;' +
  /* 3. La tarjeta de TEP, abierta por su gesto */
  " try { showTab('hemodinamica') } catch (e) {}" +
  " const sc = document.getElementById('tep-seccion'); if (sc) sc.style.display = '';" +
  /* 4. Los dos globos: geometria y los cinco puntos */
  ' const puntos = (el) => { const r = el.getBoundingClientRect();' +
  '   const ps = [[r.left+2,r.top+2],[r.right-2,r.top+2],[r.left+2,r.bottom-2],[r.right-2,r.bottom-2],' +
  '               [r.left+r.width/2, r.top+r.height/2]];' +
  '   return ps.filter(p => { const e = document.elementFromPoint(p[0], p[1]);' +
  '     return e === el || (e && el.contains(e)) }).length; };' +
  " [['mcc','tep-mcconnell'],['eco','tep-eco-dx']].forEach(par => {" +
  "   const b = document.querySelector('[data-vinfo=\"' + par[1] + '\"]');" +
  "   if (!b) { R[par[0]] = 'NO EXISTE'; return }" +
  '   const r = b.getBoundingClientRect();' +
  '   R[par[0]] = Math.round(r.width) + String.fromCharCode(120) + Math.round(r.height) +' +
  "     ' pts=' + puntos(b) + String.fromCharCode(47) + '5'; });" +
  /* 5. La linea del eco: entra entera? */
  " const be = document.querySelector('[data-vinfo=\"tep-eco-dx\"]');" +
  ' const pe = be ? be.closest(String.fromCharCode(112)) : null;' +
  " R.lineaEco = pe ? (pe.scrollWidth <= pe.clientWidth + 2) : 'NO EXISTE';" +
  " R.lineaEcoTxt = pe ? (pe.textContent || '').replace(/\\s+/g,' ').trim().slice(0,70) : '';" +
  /* 6. Texto recortado en la tarjeta de TEP */
  ' let recort = 0;' +
  '  if (sc) Array.prototype.forEach.call(sc.querySelectorAll(String.fromCharCode(42)), e => {' +
  '   if (e.children.length === 0 && e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) recort++; });' +
  ' R.recortados = recort;' +
  /* 7. La capsula y la ficha */
  " const set = (id,v) => { const e = document.getElementById(id); if (!e) return; e.value = v;" +
  "   e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})) };" +
  " ['tep_mcconnell','tep_signo6060','tep_tabique_d'].forEach(k => set(k,'si'));" +
  " set('tapse','16'); set('tep_vdvi','0.90'); set('vmax_it','3.8');" +
  " set('vci_diam','18'); set('vci_col','>50');" +
  " try { calcPmAD() } catch(e){} try { calcPSAP() } catch(e){} try { calcTEP() } catch(e){}" +
  " const T = id => { const e = document.getElementById(id); return e ? (e.textContent||'').trim() : 'NO' };" +
  " R.capVdvi = T('tep-vdvi-interp');" +
  " R.capTapse = T('tep-tapse-interp');" +
  " R.capMcc = T('tep-mcconnell-interp');" +
  ' return R })()';

async function corre(nombre, abrir) {
  const b = await abrir(); const R = {};
  try {
    for (const w of [1440, 390]) {
      for (const esquema of ['light', 'dark']) {
        const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: esquema });
        const pg = await ctx.newPage();
        const errs = [];
        pg.on('pageerror', e => errs.push('PAGEERROR ' + String(e.message).slice(0, 160)));
        pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 160)) });
        try {
          await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
          const r = await pg.evaluate(MEDIR, { timeout: 60000 });
          r.errores = errs.length; r.erroresTxt = errs.slice(0, 3);
          R[w + 'px/' + esquema] = r;
        } catch (e) { R[w + 'px/' + esquema] = { ERROR: String(e).slice(0, 200), errores: errs.length }; }
        await ctx.close();
      }
    }
  } finally { await b.close(); }
  OUT[nombre] = R;
}

await corre('chrome', () => chromium.launch({ channel: 'chrome' }));
await corre('webkit', () => webkit.launch());
console.log('===== TOTAL =====');
console.log(JSON.stringify(OUT, null, 1));
