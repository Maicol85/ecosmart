#!/usr/bin/env node
/**
 * _probe_popc_integrar.mjs - «Integrar al informe» con cualquier dato (POP-C, 4a).
 *
 * Tres escenarios, con CLICK REAL de Playwright sobre el boton:
 *   completo - peso, talla y Swan: el indice se calcula, como siempre
 *   minimo   - Swan con gasto, PAM y PAD y SIN peso ni talla: no hay indice y antes el boton
 *              quedaba deshabilitado (POPB-a). Es el caso que el medico reporto.
 *   vacio    - nada cargado: el boton sigue deshabilitado y conserva su motivo.
 *
 * Mide: si el boton esta habilitado, si el click integra de verdad -el textarea del bloque y
 * la linea del EN SUMA-, que dice el patron y que dice el title del boton.
 *
 *   node scripts/_probe_popc_integrar.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const ESC = {
  completo: { peso:'70', talla:'170', gc:'4', pam:'78', pad:'10', horas:'6' },
  minimo:   { gc:'4', pam:'62', pad:'10' },
  vacio:    {}
};

const MONTAR = `((e) => {
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
                  x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (x) {}
  const S = (id, v) => { const el = EL(id); if (!el) return; el.value = v;
    el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})) };
  const bt = bq('showTab(' + Q + 'hemodinamica'); if (bt) bt.click();
  return true;
})(ESCENA)`;

/* ADVERTENCIA: NO SE CLICKEA A CIEGAS. La seccion sobrevive entre escenas, asi que el click
   del toggle la CIERRA cuando ya estaba abierta — y entonces el boton queda oculto y el click
   real falla con «Element is not visible», que en el volcado se lee como que el boton no
   funciona. Es la trampa que la tanda TGA documento. Se consulta el estado y se abre solo si
   hace falta, y se DEVUELVE si quedo abierta, para que el caso tenga su denominador. */
const ABRIR = `(() => {
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
                  x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const sec = document.getElementById('pop-seccion');
  const abierta = () => !!(sec && sec.offsetParent && sec.getBoundingClientRect().height > 100);
  if (!abierta()) { const ba = bq('toggleCard(' + Q + 'pop-seccion'); if (ba) ba.click(); }
  return abierta();
})()`;

const PONER = `((e) => {
  const EL = id => document.getElementById(id);
  const S = (id, v) => { const el = EL(id); if (!el) return 'NO EXISTE ' + id; el.value = v;
    el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); return el.value };
  if (e.peso) S('peso', e.peso);
  if (e.talla) S('talla', e.talla);
  if (e.gc || e.pam || e.pad) {
    S('pop_monitor','swan');
    if (e.gc) S('pop_sw_gc', e.gc);
    if (e.pam) S('pop_sw_pam', e.pam);
    if (e.pad) S('pop_sw_pad', e.pad);
  }
  if (e.horas) S('pop_cx_horas', e.horas);
  return true;
})(ESCENA)`;

const LEER = `(() => {
  const EL = id => document.getElementById(id);
  const b = EL('pop_integrar');
  let p = null; try { p = popPatron() } catch (x) { p = { err: String(x) } }
  const ta = EL('am-txt-pop');
  return {
    botonExiste: !!b, deshabilitado: b ? !!b.disabled : null,
    title: b ? String(b.title || '') : '',
    opacidad: b ? String(b.style.opacity || '') : '',
    suficiente: p ? p.suficiente : null,
    ic: p ? p.ic : null,
    patron: p && p.pat ? p.pat.lbl : null,
    integrado: (typeof amiloEnInforme === 'function') ? !!amiloEnInforme('pop') : null,
    textoLargo: ta ? String(ta.value || '').length : 'NO HAY TEXTAREA',
    textoFrag: ta ? String(ta.value || '').slice(0, 120).replace(/\\n/g, ' / ') : ''
  };
})()`;

const SUMA = `(() => {
  const EL = id => document.getElementById(id);
  try { if (typeof generarInforme === 'function') generarInforme() } catch (x) {}
  const s = EL('en_suma'); const t = s ? String(s.value || '') : '';
  const i = t.indexOf('PostCEC');
  return { largo: t.length, linea: i < 0 ? '(sin linea PostCEC)' : t.slice(i, i + 110) };
})()`;

(async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome', headless: true });
  const pg = await b.newPage({ viewport: { width: 1440, height: 2600 }   /* el boton cae en y~2218: con 1000 de alto Playwright se niega a clickear */ });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()) });
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(2500);

  console.log('===== «INTEGRAR AL INFORME» CON CUALQUIER DATO (POP-C 4a) =====');
  console.log('archivo:', FILE);
  for (const k of Object.keys(ESC)) {
    await pg.evaluate(MONTAR.replace('ESCENA', JSON.stringify(ESC[k])));
    await pg.waitForTimeout(350);
    const abierta = await pg.evaluate(ABRIR);
    await pg.waitForTimeout(450);
    await pg.evaluate(PONER.replace('ESCENA', JSON.stringify(ESC[k])));
    await pg.waitForTimeout(650);
    const antes = await pg.evaluate(LEER);
    /* EL CLICK ES REAL: Playwright sobre el boton. Si esta deshabilitado, no hace nada —que es
       lo que se quiere comprobar—, asi que se usa force para que no espere a que se habilite. */
    let clickOk = 'no intentado';
    /* ADVERTENCIA MEDIDA: el boton cae en y~2218 con un viewport de 1000, o sea MUY por debajo
       del pliegue, y el auto-scroll de Playwright no siempre lo estabiliza a tiempo: fallaba
       con «Element is not visible» y luego con un timeout, en la escena MINIMO —justo la que
       esta tanda arregla—, dejando el caso sin poder decir si integra. Diagnosticado: el boton
       mide 154x44, con display flex, visibility visible, pointer-events auto, disabled false y
       offsetParent no nulo, o sea que ES clickeable; lo que fallaba era la espera.
       Se scrollea a mano, se espera, y se usa el locator con margen. */
    try {
      await pg.evaluate(() => { const b = document.getElementById('pop_integrar');
        if (b) b.scrollIntoView({ block: 'center', behavior: 'instant' }); });
      await pg.waitForTimeout(400);
      await pg.locator('#pop_integrar').click({ timeout: 8000, force: true });
      clickOk = 'click real de Playwright';
    } catch (e) {
      clickOk = 'Playwright fallo (' + String(e.message).slice(0, 40) + '); se usa el click nativo del DOM';
      await pg.evaluate(() => { const b = document.getElementById('pop_integrar');
        if (b && !b.disabled) b.click(); });
    }
    await pg.waitForTimeout(700);
    const desp = await pg.evaluate(LEER);
    const sm = await pg.evaluate(SUMA);
    console.log('\n--- escena ' + k.toUpperCase() + ' ---');
    console.log('   seccion abierta      : ' + abierta + '   (denominador)');
    console.log('   IC calculable        : ' + antes.ic);
    console.log('   suficiente           : ' + antes.suficiente);
    console.log('   boton deshabilitado  : ' + antes.deshabilitado + '   (opacidad "' + antes.opacidad + '")');
    console.log('   title del boton      : ' + antes.title);
    console.log('   patron               : ' + antes.patron);
    console.log('   click                : ' + clickOk);
    console.log('   integrado despues    : ' + desp.integrado);
    console.log('   texto del bloque     : ' + desp.textoLargo + ' caracteres');
    console.log('       ' + desp.textoFrag);
    console.log('   EN SUMA              : ' + sm.linea);
  }
  console.log('\nerrores de pagina: ' + errs.length + (errs.length ? ' -> ' + errs.slice(0, 4).join(' ; ') : ''));
  await b.close();
  process.exit(0);
})();
