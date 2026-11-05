#!/usr/bin/env node
/**
 * _probe_pant14linea.mjs - la linea de lo no dibujado a los cuatro anchos (PANT-14, commit 6).
 * Mide, con el modulo ABIERTO por su boton real y la pestania abierta -sin eso la caja da 0 px y
 * la medicion no prueba nada-: el texto, la caja, si se recorta y si hay barra horizontal, en
 * cuatro escenarios: el estudio vacio, todo dibujado, con una lista de omitidas y con conflictos.
 *   node scripts/_probe_pant14linea.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const ESC = [
  { n:'vacio',    campos:[] },
  { n:'todoOk',   campos:[['ete_cia_tipo','secundum']] },
  { n:'omitidas', campos:[['coa_istmo','8'],['ep_nivel','Mixto']] },
  { n:'conflicto',campos:[['tga_tipo','dtga'],['tdf_func_vd','normal'],['ebs_desplazamiento','14']] },
];
const br = await _pw.chromium.launch({ channel: 'chrome' });
const out = {};
for (const w of [1440, 1000, 768, 390]) {
  const pg = await br.newPage({ viewport: { width: w, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 120)));
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(1600);
  out[w] = await pg.evaluate(`(async () => {
    const R = {}; const EL = id => document.getElementById(id);
    const esperar = ms => new Promise(z => setTimeout(z, ms));
    const Q = String.fromCharCode(39);
    ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
    const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
      b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
    const gesto = (id, v) => { const e = EL(id); if (!e) return 'NO ' + id;
      if (e.type === 'checkbox') { e.checked = (v === 'si') } else { e.value = v }
      e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); return 'ok' };
    const limpiar = () => { ['ete_cia_tipo','coa_istmo','ep_nivel','tga_tipo','tdf_func_vd','ebs_desplazamiento']
      .forEach(id => { const e = EL(id); if (!e) return;
        e.value = (id === 'ep_nivel') ? 'No especificado' : '';
        e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) }) };
    /* abrir la pestania y el modulo por su boton real: sin eso la caja da 0 px */
    try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
    await esperar(420);
    if (typeof cc3dPieSync === 'function') { try { cc3dPieSync() } catch (e) {} }
    const ab = EL('cc3d-abrir'); if (ab && ab.getAttribute('aria-pressed') !== 'true') { ab.click(); await esperar(2800) }
    const ESC = ${JSON.stringify(ESC)};
    for (const e of ESC) {
      limpiar();
      e.campos.forEach(c => gesto(c[0], c[1]));
      await esperar(520);
      try { cmDesdeEstudio(); cc3dTextoSync() } catch (x) {}
      const p = EL('cc3d-faltan');
      const cj = p ? p.getBoundingClientRect() : null;
      R[e.n] = { texto: p ? p.textContent.trim() : 'NO HAY', chars: p ? p.textContent.trim().length : 0,
                 ancho: cj ? Math.round(cj.width) : null, alto: cj ? Math.round(cj.height) : null,
                 visible: cj ? (cj.width > 0 && cj.height > 0) : null,
                 recortado: p ? ((p.scrollWidth > p.clientWidth + 1) || (p.scrollHeight > p.clientHeight + 1)) : null,
                 scrollH: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 };
    }
    limpiar();
    return R;
  })()`);
  out[w].errs = errs.filter(e => !/ERR_FILE_NOT_FOUND|favicon/.test(e));
  await pg.close();
}
await br.close();
for (const w of Object.keys(out)) {
  console.log('== ' + w + ' px == errores: ' + (out[w].errs || []).length);
  ESC.forEach(e => { const x = out[w][e.n]; if (!x) return;
    console.log('  ' + e.n.padEnd(10) + ' caja ' + String(x.ancho) + 'x' + String(x.alto)
      + ' | visible ' + x.visible + ' | recortado ' + x.recortado + ' | scrollH ' + x.scrollH
      + ' | ' + x.chars + ' chars: ' + JSON.stringify(String(x.texto).slice(0, 110))); });
}
