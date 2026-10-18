#!/usr/bin/env node
/**
 * _probe_pwk.mjs - la maqueta y las CAPTURAS de la tanda P en los DOS motores (2026-10-18).
 *
 * Resuelve Playwright POR RUTA y, si no esta, lo DICE y sale con codigo 2 en vez de reventar.
 * Mide, por motor x tema x viewport: que no haya scroll horizontal de la PAGINA con la pestana
 * Referencias abierta, que la barra de subpestanas se desplace POR DENTRO, el COLOR REAL
 * resuelto de la subpestana activa y de la de reposo, y saca los PNG de las cinco subpestanas,
 * del buscador con un resultado, de «Ver referencia» resaltando una entrada y de la tabla de
 * cirugia.
 *
 *   node scripts/_probe_pwk.mjs --dest /tmp/pcap
 *
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda.
 */
const CANDIDATAS = ['/tmp/node_modules/playwright/index.js',
                    '/tmp/pw/node_modules/playwright/index.js',
                    '/usr/local/lib/node_modules/playwright/index.js',
                    process.env.HOME + '/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CANDIDATAS) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) {
  console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CANDIDATAS,
    comoInstalar: 'mkdir -p /tmp/pw && cd /tmp/pw && npm i playwright && npx playwright install webkit' }, null, 1));
  process.exit(2);
}
const { chromium, webkit } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const DEST = arg('--dest') || '/tmp/pcap';
const VIEWPORTS = [[1200,700],[1440,800],[1920,1080],[768,1024],[390,844],[360,740]];

const ABRIR = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  try { if (typeof showTab === 'function') showTab('refs') } catch (e) {}
  try { if (typeof refSubInit === 'function') refSubInit() } catch (e) {}
  return 1;
})()`;

const MEDIR = `(() => {
  const col = (sel) => { const e = document.querySelector(sel);
    return e ? getComputedStyle(e).color : 'NO EXISTE' };
  const bar = document.querySelector('#tab-refs .ref-subbar');
  const de = document.documentElement;
  const censo = (() => { const t = document.getElementById('tab-refs');
    if (!t) return -1;
    const hs = t.querySelectorAll('h2.card-head'); let n = 0;
    for (let i = 0; i < hs.length; i++) {
      if ((hs[i].getAttribute('onclick') || '').indexOf('toggleRef(') >= 0) n++;
    }
    return n })();
  return {
    tema: de.classList.contains('light-mode') ? 'claro' : 'oscuro',
    vw: window.innerWidth,
    scrollH: { sw: de.scrollWidth, cw: de.clientWidth, hay: de.scrollWidth > de.clientWidth + 1 },
    barra: bar ? { w: Math.round(bar.getBoundingClientRect().width), sw: bar.scrollWidth,
                   wrap: getComputedStyle(bar).flexWrap, ovx: getComputedStyle(bar).overflowX,
                   desplaza: bar.scrollWidth > bar.clientWidth + 1 } : null,
    colores: { activa: col('#tab-refs .ref-subtab.active'),
               reposo: col('#tab-refs .ref-subtab:not(.active)'),
               buscador: col('#tab-refs .ref-busc-input'),
               rotulo: col('#tab-refs .ref-bloque-rot') },
    censo: censo,
    paneles: ['dim','fun','valv','ao','otros'].map(k => {
      const p = document.getElementById('ref-sub-' + k);
      return k + ':' + (p ? (p.classList.contains('active') ? 'on' : 'off') : 'NO') }).join(' ')
  };
})()`;

const salida = { motores: {}, capturas: [] };
/* ⚠️ EL CHROMIUM QUE TRAE PLAYWRIGHT NO ARRANCA en esta maquina -espera un build que no esta en
   el cache-, asi que se usa el CANAL DEL SISTEMA, que es ademas el Chrome con el que mide el
   resto de este repo. Es la trampa que CLAUDE.md tiene escrita desde la tanda J. Y WebKit de
   Playwright NO es Safari: se declara. */
for (const [nom, motor, opc] of [['chrome', chromium, { channel: 'chrome' }], ['webkit', webkit, {}]]) {
  const br = await motor.launch(opc);
  const celdas = [];
  for (const claro of [false, true]) {
    for (const [w, h] of VIEWPORTS) {
      const pg = await br.newPage({ viewport: { width: w, height: h } });
      await pg.goto('file://' + RAIZ + '/index.html', { waitUntil: 'load' });
      await pg.waitForTimeout(1600);
      await pg.evaluate('document.documentElement.classList.' + (claro ? 'add' : 'remove') + "('light-mode')");
      await pg.evaluate(ABRIR);
      await pg.waitForTimeout(220);
      const m = await pg.evaluate(MEDIR);
      if (m.tema !== (claro ? 'claro' : 'oscuro')) m.ABORTO = 'EL TEMA NO QUEDO PUESTO';
      celdas.push(Object.assign({ w, h, claro }, m));
      /* Las capturas, en tres viewports por tema. */
      if (DEST && (w === 1200 || w === 768 || w === 360)) {
        const pre = DEST + '/' + nom + '-' + (claro ? 'claro' : 'oscuro') + '-' + w + '-';
        try {
          for (const k of ['dim', 'valv', 'ao', 'otros']) {
            await pg.evaluate("(function(){ try { refSubTab('" + k + "', document.getElementById('ref-subtab-" + k + "')) } catch(e){} })()");
            await pg.waitForTimeout(80);
            await pg.screenshot({ path: pre + 'sub-' + k + '.png' });
            salida.capturas.push(nom + '-' + (claro ? 'claro' : 'oscuro') + '-' + w + '-sub-' + k + '.png');
          }
          /* El buscador CON un resultado. */
          await pg.evaluate(`(function(){ var e = document.getElementById('ref-busca');
            if (e) { e.value = 'RWT'; e.dispatchEvent(new Event('input', { bubbles: true })); } })()`);
          await pg.waitForTimeout(140);
          await pg.screenshot({ path: pre + 'buscador.png' });
          salida.capturas.push(nom + '-' + (claro ? 'claro' : 'oscuro') + '-' + w + '-buscador.png');
          /* «Ver referencia» resaltando una entrada: se entra por el buscador, que es el mismo
             camino de `refIr`. */
          await pg.evaluate(`(function(){ var h = document.querySelector('#ref-busca-res .ref-busc-hit');
            if (h) h.click(); })()`);
          await pg.waitForTimeout(160);
          await pg.screenshot({ path: pre + 'destacada.png' });
          salida.capturas.push(nom + '-' + (claro ? 'claro' : 'oscuro') + '-' + w + '-destacada.png');
          /* La tabla de cirugia aortica, abierta. */
          await pg.evaluate(`(function(){ try { refSubTab('ao', document.getElementById('ref-subtab-ao')) } catch(e){}
            var cu = document.getElementById('ref-aocx');
            var hh = cu ? cu.previousElementSibling : null;
            if (hh && cu.style.display === 'none') hh.click();
            if (cu) cu.scrollIntoView({ block: 'start' }); })()`);
          await pg.waitForTimeout(160);
          await pg.screenshot({ path: pre + 'tablacx.png' });
          salida.capturas.push(nom + '-' + (claro ? 'claro' : 'oscuro') + '-' + w + '-tablacx.png');
        } catch (e) { salida.capturas.push('ERR ' + nom + ' ' + w + ' ' + e.message) }
      }
      await pg.close();
    }
  }
  /* El CICLO de 20 aperturas, una vez por motor, con su vuelta de calentamiento. */
  const pg2 = await br.newPage({ viewport: { width: 1200, height: 700 } });
  await pg2.goto('file://' + RAIZ + '/index.html', { waitUntil: 'load' });
  await pg2.waitForTimeout(1600);
  await pg2.evaluate(ABRIR);
  const ciclo = await pg2.evaluate(`(() => {
    const N = () => { const t = document.getElementById('tab-refs'); return t ? t.querySelectorAll('*').length : -1 };
    const O = ['dim','fun','valv','ao','otros'];
    const C = (e) => { try { if (e) e.click() } catch (x) {} };
    const h0 = () => document.querySelector('#ref-sub-dim h2.card-head');
    O.forEach(k => C(document.getElementById('ref-subtab-' + k)));
    C(document.getElementById('ref-subtab-dim')); C(h0()); C(h0());
    const n0 = N();
    for (let i = 0; i < 20; i++) O.forEach(k => C(document.getElementById('ref-subtab-' + k)));
    C(document.getElementById('ref-subtab-dim'));
    for (let i = 0; i < 20; i++) C(h0());
    const n1 = N();
    const cu = document.getElementById('ref-ai');
    return { n0, n1, delta: n1 - n0, cerrada: cu ? cu.style.display === 'none' : null };
  })()`);
  await pg2.close();
  await br.close();
  salida.motores[nom] = { celdas, ciclo };
}
console.log(JSON.stringify(salida, null, 1));
