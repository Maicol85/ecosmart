#!/usr/bin/env node
/**
 * _probe_arrwk.mjs - la maqueta y las CAPTURAS de la tanda ARR en los DOS motores (2026-10-18).
 *
 * Resuelve Playwright POR RUTA y, si no esta, lo DICE y sale con codigo 2 en vez de reventar.
 * Mide, por motor x tema x viewport: que no haya scroll horizontal de la pagina, el COLOR REAL
 * resuelto de las referencias en «sin datos» y el de los elementos nuevos, y saca los PNG.
 *
 *   node scripts/_probe_arrwk.mjs --dest /tmp/arrcap
 *
 * ADVERTENCIA: sin acentos graves dentro del template de la sonda.
 */
const CANDIDATAS = ['/tmp/node_modules/playwright/index.js',
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
const DEST = arg('--dest') || '/tmp/arrcap';
const VIEWPORTS = [[1200,700],[1440,800],[1920,1080],[768,1024],[390,844],[360,740]];

/* La escena: se cargan los campos que el censo marco, se BORRAN, y se mide el estado SIN DATO.
   Es la escena de la que la orden pide capturas. */
const ESCENA = `(async () => {
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  const CHK = (id, b) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE';
    if (e.checked !== b) e.click(); return e.checked };
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  const CAMPOS = { ao_sin:'46', ao_st:'45', ao_tub:'47', diam_cayado:'46', diam_ao_toracica:'42',
                   tapse:'14', s_prime:'8', ad_area:'22', e_sep:'5', e_lat:'6' };
  Object.keys(CAMPOS).forEach(k => S(k, CAMPOS[k]));
  S('it_densidad', 'denso');
  Object.keys(window).forEach(k => { if (/^calc[A-Z]/.test(k) && typeof window[k] === 'function') {
    try { window[k]() } catch (e) {} } });
  Object.keys(CAMPOS).forEach(k => S(k, ''));
  S('it_densidad', '');
  Object.keys(window).forEach(k => { if (/^calc[A-Z]/.test(k) && typeof window[k] === 'function') {
    try { window[k]() } catch (e) {} } });
  try { if (typeof _recalcModulos === 'function') _recalcModulos('cap') } catch (e) {}
  return 1;
})()`;

const MEDIR = `(() => {
  const t = (id) => { const e = document.getElementById(id);
    return e ? String(e.textContent || '').trim() : 'NO EXISTE' };
  const col = (id) => { const e = document.getElementById(id);
    return e ? getComputedStyle(e).color : 'NO EXISTE' };
  return {
    refs: { ao: t('ao-interp'), aoSt: t('ao-st-interp'), aoDesc: t('ao-desc-interp'),
            tapse: t('tapse-interp'), sprime: t('sprime-interp'), ad: t('ad-interp'),
            eprom: t('eprom-val'), itDens: t('it-densidad-interp'), catC: t('htp2022-catC') },
    colores: { ao: col('ao-interp'), tapse: col('tapse-interp'), eprom: col('eprom-val') },
    scrollH: { sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth,
               hay: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 },
    tema: document.documentElement.classList.contains('light-mode') ? 'claro' : 'oscuro',
    vw: window.innerWidth
  };
})()`;

const FOPESC = `(async () => {
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  S('fop_tunel','8'); S('fop_mov','si'); S('fop_asa','si'); S('fop_asa_mm','22');
  S('fop_contraste','si'); S('fop_shunt_reposo','no'); S('fop_shunt_valsalva','si');
  S('fop_burbujas','moderado'); S('fop_acv','si'); S('edad','52');
  const b = document.querySelector('[data-ete-chk="fop_incluir_chk"]');
  const c = document.getElementById('fop_incluir_chk');
  if (c && !c.checked && b) b.click();
  try { if (typeof setEstiloInforme === 'function') setEstiloInforme('estandar');
        if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
  try { if (typeof showTab === 'function') showTab('informe') } catch (e) {}
  const ta = document.getElementById('informe_texto');
  return { inf: ta ? ta.value : 'NO EXISTE', suma: (document.getElementById('en_suma') || {}).value };
})()`;

const salida = { motores: {}, capturas: [] };
/* ADVERTENCIA: EL CHROMIUM QUE TRAE PLAYWRIGHT NO ARRANCA en esta maquina -espera
   `chromium_headless_shell-1248` y en el cache esta el `-1234`-, asi que se usa el CANAL DEL
   SISTEMA, que es ademas el Chrome con el que mide el resto de este repo. Es la trampa que
   CLAUDE.md ya tiene escrita desde la tanda J. WebKit si arranca del cache. */
for (const [nom, motor, opc] of [['chrome', chromium, { channel: 'chrome' }], ['webkit', webkit, {}]]) {
  const br = await motor.launch(opc);
  const celdas = [];
  for (const claro of [false, true]) {
    for (const [w, h] of VIEWPORTS) {
      const pg = await br.newPage({ viewport: { width: w, height: h } });
      await pg.goto('file://' + RAIZ + '/index.html', { waitUntil: 'load' });
      await pg.waitForTimeout(1600);
      await pg.evaluate(`document.documentElement.classList.${claro ? 'add' : 'remove'}('light-mode')`);
      await pg.evaluate(ESCENA);
      await pg.waitForTimeout(250);
      const m = await pg.evaluate(MEDIR);
      if (m.tema !== (claro ? 'claro' : 'oscuro')) { m.ABORTO = 'EL TEMA NO QUEDO PUESTO'; }
      celdas.push(Object.assign({ w, h, claro }, m));
      /* Las capturas solo en tres viewports por tema, para no generar 24 PNG por motor. */
      if (DEST && (w === 1200 || w === 768 || w === 360)) {
        try { await pg.evaluate(`(function(){ try { showTab('vd') } catch(e){} })()`);
          await pg.screenshot({ path: DEST + '/' + nom + '-' + (claro ? 'claro' : 'oscuro')
            + '-' + w + '-vd.png' });
          salida.capturas.push(nom + '-' + (claro ? 'claro' : 'oscuro') + '-' + w + '-vd.png');
          await pg.evaluate(`(function(){ try { showTab('otros') } catch(e){} })()`);
          await pg.screenshot({ path: DEST + '/' + nom + '-' + (claro ? 'claro' : 'oscuro')
            + '-' + w + '-otros.png' });
          salida.capturas.push(nom + '-' + (claro ? 'claro' : 'oscuro') + '-' + w + '-otros.png');
        } catch (e) { salida.capturas.push('ERR ' + e.message) }
      }
      await pg.close();
    }
  }
  /* El FOP con su texto esquematico, una vez por motor. */
  const pg2 = await br.newPage({ viewport: { width: 1200, height: 700 } });
  await pg2.goto('file://' + RAIZ + '/index.html', { waitUntil: 'load' });
  await pg2.waitForTimeout(1600);
  const fop = await pg2.evaluate(FOPESC);
  if (DEST) { try { await pg2.screenshot({ path: DEST + '/' + nom + '-fop-informe.png' });
    salida.capturas.push(nom + '-fop-informe.png') } catch (e) {} }
  await pg2.close();
  await br.close();
  salida.motores[nom] = { celdas, fop: { inf: String(fop.inf || '').split('\n')
    .filter(l => l.indexOf('oramen oval') >= 0).join(' // '),
    suma: String(fop.suma || '').split('\n').filter(l => l.indexOf('FOP') >= 0).join(' // ') } };
}
console.log(JSON.stringify(salida, null, 1));
