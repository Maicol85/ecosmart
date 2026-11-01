#!/usr/bin/env node
/**
 * _probe_cong2a_matriz.mjs — la MATRIZ de «desmarcar» de la tanda CONG-2A (punto 1a).
 *
 * Para CADA select con opcion vacia de las diecinueve secciones de congenitas:
 * basal (formulario limpio) -> poner el primer valor no vacio -> volver a vaciarlo,
 * y se compara el estado VACIADO contra el BASAL. Si difieren, algo sobrevivio al desmarcado.
 *
 * DENOMINADORES DECLARADOS: cuantos selects se barrieron, cuantos movieron algo al PONERLOS
 * -un campo que no mueve ninguna superficie no puede probar nada al vaciarse- y cuantas
 * superficies se comparan por campo.
 *
 *   node scripts/_probe_cong2a_matriz.mjs [--file <html>]
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const { chromium } = _pw;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const b = await chromium.launch({ channel: 'chrome', headless: true });
const pg = await b.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(e.message));
pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()) });
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
await pg.waitForTimeout(1500);

const r = await pg.evaluate(`(async () => {
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = document.getElementById(i); if (m) m.style.display = 'none' });
  const esperar = ms => new Promise(res => setTimeout(res, ms));
  const lim = () => { try { limpiarCampos(true) } catch (e) {} };
  const T = id => { const e = document.getElementById(id); return e ? String(e.value || e.textContent || '') : '' };

  /* El catalogo: los select con opcion vacia de las diecinueve secciones de congenitas. */
  const SECS = [].slice.call(document.querySelectorAll('[id^="sacc-cc-"]'));
  const campos = [];
  SECS.forEach(sec => {
    [].slice.call(sec.querySelectorAll('select[id]')).forEach(s => {
      const ops = [].slice.call(s.options);
      const vac = ops.filter(o => String(o.value) === '');
      const noVac = ops.filter(o => String(o.value) !== '');
      if (!vac.length || !noVac.length) return;
      campos.push({ sec: sec.id.replace('sacc-cc-',''), id: s.id, val: noVac[0].value,
                    lbl: String(noVac[0].textContent || '').trim().slice(0,28) });
    });
  });

  /* Las superficies que se comparan por campo. El informe se mide en el estilo estandar en el
     barrido -los tres estilos salen del MISMO emisor- y los tres se miden aparte sobre los
     campos que difieran. */
  const CAPS = ['vab-concl','coa-concl','fop-concl','mch-concl','tdf-concl','tga-concl',
                'ebs-concl','cia-concl','civ-concl','dap-concl','vap-concl','dsav-concl',
                'cvpa-concl','esub-concl','easv-concl','mca-concl','tv-concl','eisen-concl',
                'fontan-concl','marfan-concl','shunt-concl'];
  const medir = () => {
    const o = {};
    try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
    o.inf = T('informe_texto');
    o.suma = T('en_suma');
    CAPS.forEach(c => { const v = T(c); if (v) o['c_' + c] = v });
    return o;
  };
  const dif = (a, bb) => {
    const ks = {}; Object.keys(a).forEach(k => ks[k] = 1); Object.keys(bb).forEach(k => ks[k] = 1);
    const d = [];
    Object.keys(ks).forEach(k => { if (String(a[k] || '') !== String(bb[k] || '')) d.push(k) });
    return d;
  };

  lim(); await esperar(400);
  const basal = medir();

  const filas = [];
  for (let i = 0; i < campos.length; i++) {
    const c = campos[i];
    const e = document.getElementById(c.id);
    if (!e) continue;
    lim(); await esperar(300);
    e.value = c.val;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    await esperar(400);
    const puesto = medir();
    e.value = '';
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    await esperar(400);
    const vaciado = medir();
    const movio = dif(basal, puesto);
    const queda = dif(basal, vaciado);
    filas.push({ sec: c.sec, id: c.id, val: String(c.val).slice(0,18), lbl: c.lbl,
                 movio: movio.length, queda: queda.length, quedaEn: queda,
                 ej: queda.length ? (String(vaciado[queda[0]] || '').slice(0,120)) : '' });
  }
  lim(); await esperar(400);
  const cierre = dif(basal, medir());

  return { n: campos.length, caps: CAPS.length,
           basalInf: basal.inf.length, basalSuma: basal.suma.length,
           movieron: filas.filter(f => f.movio > 0).length,
           sobreviven: filas.filter(f => f.queda > 0),
           limpios: filas.filter(f => f.queda === 0 && f.movio > 0).length,
           mudos: filas.filter(f => f.movio === 0).map(f => f.sec + '/' + f.id),
           cierreLimpio: cierre.length === 0 };
})()`, { timeout: 0 });

console.log(JSON.stringify(r, null, 1));
console.log('errores de consola:', errs.length, errs.slice(0, 3));
await b.close(); process.exit(0);
