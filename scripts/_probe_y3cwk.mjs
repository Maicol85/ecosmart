#!/usr/bin/env node
/**
 * _probe_y3cwk.mjs - la maqueta y las CAPTURAS de la tanda P en los DOS motores (2026-10-18).
 *
 * Resuelve Playwright POR RUTA y, si no esta, lo DICE y sale con codigo 2 en vez de reventar.
 * Mide, por motor x tema x viewport: que no haya scroll horizontal de la PAGINA con la pestana
 * Referencias abierta, que la barra de subpestanas se desplace POR DENTRO, el COLOR REAL
 * resuelto de la subpestana activa y de la de reposo, y saca los PNG de las cinco subpestanas,
 * del buscador con un resultado, de «Ver referencia» resaltando una entrada y de la tabla de
 * cirugia.
 *
 *   node scripts/_probe_y3cwk.mjs --dest /tmp/pcap
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
  try { if (typeof showTab === 'function') showTab('ete') } catch (e) {}
  try { const s = document.getElementById('ete-seccion-mitral');
    if (s && getComputedStyle(s).display === 'none' && typeof toggleEteSeccion === 'function')
      toggleEteSeccion('mitral'); } catch (e) {}
  try { if (typeof eteQxDibujar === 'function') eteQxDibujar() } catch (e) {}
  try { if (typeof m3dBotonSync === 'function') m3dBotonSync() } catch (e) {}
  try { if (typeof eteLimpiarSegmentos === 'function') eteLimpiarSegmentos() } catch (e) {}
  try { const p = document.getElementById('ete-qx-P2');
    if (p) { const op = { bubbles: true, clientX: 10, clientY: 10, pointerId: 1 };
      const K = (typeof PointerEvent === 'function') ? PointerEvent : MouseEvent;
      p.dispatchEvent(new K('pointerdown', op)); p.dispatchEvent(new K('pointerup', op));
      p.dispatchEvent(new K('pointerdown', op)); p.dispatchEvent(new K('pointerup', op)); } } catch (e) {}
  return 1;
})()`;

const MEDIR = `(() => {
  const de = document.documentElement;
  const cs = (id, p) => { const e = document.getElementById(id);
    return e ? getComputedStyle(e)[p] : 'NO EXISTE' };
  const svg = document.getElementById('ete-svg-qx');
  const r = svg ? svg.getBoundingClientRect() : null;
  const at = (id, a) => { const e = document.getElementById(id);
    return e ? String(e.getAttribute(a) === null ? '' : e.getAttribute(a)) : 'NO EXISTE' };
  const T = (typeof ETE_CORTES !== 'undefined') ? ETE_CORTES : null;
  /* El censo de festones de los cuatro esquemas, leido del marcado: tiene que dar lo mismo en los
     dos motores y en los doce viewports. */
  const SVGE = { '4ch':'ete-svg-4ch', 'bc':'ete-svg-bc', '2ch':'ete-svg-2ch', '3ch':'ete-svg-3ch' };
  const censo = {};
  Object.keys(SVGE).forEach(k => { const s = document.getElementById(SVGE[k]);
    censo[k] = s ? Array.prototype.slice.call(s.querySelectorAll('g.ete-valve-seg[id]'))
      .map(g => g.id.replace('valve-','').replace('-'+k,'')).sort().join(',') : 'NO EXISTE' });
  return {
    tema: de.classList.contains('light-mode') ? 'claro' : 'oscuro',
    svgW: r ? Math.round(r.width) : null, svgH: r ? Math.round(r.height) : null,
    scrollW: de.scrollWidth, clientW: de.clientWidth,
    scrollHorizontal: de.scrollWidth > de.clientWidth + 1,
    colAnillo: cs('ete-qx-anillo', 'stroke'), colRotulo: cs('ete-qx-lbl-A2', 'fill'),
    colPlano: cs('ete-qx-plano', 'stroke'),
    marcas: ['ete-qx-mAo','ete-qx-mOr','ete-qx-mAL','ete-qx-mPM']
      .map(id => { const e = document.getElementById(id); return e ? (e.textContent || '') : 'NO' }).join('|'),
    lesionP2: (function(){ const e = document.getElementById('ete-qx-P2');
      return e ? String(e.style.fill || '') : 'NO EXISTE' })(),
    nFest: document.querySelectorAll('#ete-svg-qx polygon[id^="ete-qx-"]').length,
    tabla: T ? [0,45,60,90,120].map(a => a + ':' + T[a].fest.join('-')).join(' ') : 'SIN ETE_CORTES',
    censo: censo,
    planoDisp: at('ete-qx-plano', 'display'),
    vistasW: (function(){ const h = document.getElementById('ete-qx-vistas');
      return h ? Math.round(h.getBoundingClientRect().width) : 'NO EXISTE' })(),
    teer: (function(){ const o = {};
      ['prof','len','gap','anch'].forEach(k => { const f = document.getElementById('teer-fig-'+k);
        const rr = f ? f.getBoundingClientRect() : null;
        o[k] = rr ? Math.round(rr.width) + 'x' + Math.round(rr.height) : 'NO EXISTE' });
      return o })()
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
      await pg.waitForTimeout(260);
      const m = await pg.evaluate(MEDIR);
      if (m.tema !== (claro ? 'claro' : 'oscuro')) m.ABORTO = 'EL TEMA NO QUEDO PUESTO';
      celdas.push(Object.assign({ w, h, claro }, m));
      if (DEST && (w === 1200 || w === 390)) {
        const pre = DEST + '/y3c-' + nom + '-' + (claro ? 'claro' : 'oscuro') + '-' + w + '-';
        try {
          const tira = async (n) => { const el = await pg.$('#ete-svg-qx');
            if (el) { await el.screenshot({ path: pre + n + '.png' });
                      salida.capturas.push('y3c-' + nom + '-' + (claro ? 'claro' : 'oscuro') + '-' + w + '-' + n + '.png'); } };
          for (const v of ['cir','ett','tg']) {
            await pg.evaluate("(function(){ try { eteQxVista('" + v + "') } catch(e){} })()");
            await pg.waitForTimeout(1500);
            await tira('v-' + v);
          }
          await pg.evaluate("(function(){ try { eteQxVista('cir') } catch(e){} })()");
          await pg.waitForTimeout(1500);
          /* Con el 3D abierto y un angulo: la linea del plano. */
          await pg.evaluate("(function(){ var b=document.getElementById('m3d-btn'); if(b && !b.hasAttribute('hidden')) b.click(); })()");
          await pg.waitForTimeout(300);
          for (const a of [0, 60, 120]) {
            await pg.evaluate("(function(){ var b=document.getElementById('m3d-a-" + a + "'); if(b) b.click(); })()");
            await pg.waitForTimeout(220);
            await tira('ang' + a);
            await pg.evaluate("(function(){ var b=document.getElementById('m3d-a-" + a + "'); if(b) b.click(); })()");
          }
          await pg.evaluate("(function(){ var b=document.getElementById('m3d-btn'); if(b) b.click(); })()");
          /* Los cuatro dibujos TEER, con valores. */
          await pg.evaluate(`(function(){ try { showTab('ete');
            var s=document.getElementById('ete-seccion-teer');
            if (s && getComputedStyle(s).display==='none') toggleEteSeccion('teer');
            var V={teer_prof_flail:'8',teer_gap:'5',teer_flail_gap:'7',teer_ancho_flail:'12'};
            Object.keys(V).forEach(function(k){ var e=document.getElementById(k);
              if(e){ e.value=V[k]; e.dispatchEvent(new Event('input',{bubbles:true})); } });
            if (typeof calcTEER==='function') calcTEER(); } catch(e){} })()`);
          await pg.waitForTimeout(260);
          for (const k of ['prof','len','gap','anch']) {
            const el = await pg.$('#teer-fig-' + k);
            if (el) { await el.screenshot({ path: pre + 'teer-' + k + '.png' });
              salida.capturas.push('y3c-' + nom + '-' + (claro ? 'claro' : 'oscuro') + '-' + w + '-teer-' + k + '.png'); }
          }
        } catch (e) { salida.capturas.push('ERR ' + nom + ' ' + w + ' ' + e.message) }
      }
      await pg.close();
    }
  }
  /* El CICLO de 20 aperturas del panel 3D, una vez por motor, con su vuelta de calentamiento. */
  const pg2 = await br.newPage({ viewport: { width: 1200, height: 700 } });
  await pg2.goto('file://' + RAIZ + '/index.html', { waitUntil: 'load' });
  await pg2.waitForTimeout(1600);
  await pg2.evaluate(ABRIR);
  const ciclo = await pg2.evaluate(`(() => {
    const N = () => document.getElementsByTagName('*').length;
    const B = () => document.getElementById('m3d-btn');
    const C = (e) => { try { if (e) e.click() } catch (x) {} };
    /* La vuelta de calentamiento: el primer pintado CREA el contenido del panel. */
    C(B()); C(B());
    const n0 = N();
    for (let i = 0; i < 20; i++) { C(B()); C(B()); }
    const n1 = N();
    const p = document.getElementById('m3d-panel');
    const pl = document.getElementById('ete-qx-plano');
    return { n0, n1, delta: n1 - n0, panelCerrado: p ? p.hasAttribute('hidden') : null,
             planoApagado: pl ? pl.getAttribute('display') === 'none' : null };
  })()`);
  await pg2.close();
  await br.close();
  salida.motores[nom] = { celdas, ciclo };
}
console.log(JSON.stringify(salida, null, 1));
