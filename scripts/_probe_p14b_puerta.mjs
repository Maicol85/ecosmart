#!/usr/bin/env node
/**
 * _probe_p14b_puerta.mjs - «un dato, una sola puerta» (PANT-14b, commit 2d).
 * Por cada seccion de _CC_SECS mide las CUATRO combinaciones interruptor x dato contra el
 * informe y el EN SUMA de verdad, con el GESTO REAL, mas el apagado a mano y el estudio viejo.
 *   node scripts/_probe_p14b_puerta.mjs [--file <html>] [--solo <k>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const SOLO = arg('--solo');

/* El dato identificatorio que se carga por seccion, y el valor que lo identifica. */
const DATO = {
  cia:['ete_cia_tipo','secundum'], civ:['ete_civ_tipo','perimembranosa'],
  dap:['dap_tipo','restrictivo'], vap:['vap_tipo','i'], coa:['coa_istmo','8'],
  fop:['fop_tunel','6'], vab:['vab_tipo','fused_rl'], ebs:['ebs_desplazamiento','16'],
  mch:['mch_espesor','18'], mca:['mca_fenotipo','derecho'],
  tdf:['tdf_func_vd','normal'], tga:['tga_tipo','dtga'],
  marfan:['marfan_ao_seno','45'], eisen:['eis_lesion_base','civ'],
  fontan:['fontan_tipo','extra'], esub:['esub_tipo','membrana'],
  easv:['easv_tipo','reloj'], dsav:['dsav_tipo','completo'], cvpa:['cvpa_conexion','vcs'],
};

const CUERPO = `(async () => {
  const R = { secs: {} };
  const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const DATO = ${JSON.stringify(DATO)};
  const SOLO = ${JSON.stringify(SOLO)};
  const SW = { cia:'ete_cia_activa', civ:'ete_civ_activa', dap:'ductus_incluir_chk', coa:'coart_incluir_chk' };
  const swId = k => SW[k] || (k + '_incluir_chk');
  /* el estilo se fija a mano: es estado de SESION y un paso anterior lo puede haber movido */
  const T = id => { const e = EL(id); return e ? String(e.value || e.textContent || '') : 'NO EXISTE' };
  const papel = () => { const o = {};
    try { if (typeof setEstiloInforme === 'function') setEstiloInforme('estandar') } catch (e) {}
    try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
    o.inf = T('informe_texto'); o.suma = T('en_suma');
    return o };
  const limpiar = () => { try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {} };
  const poner = (id, v, muda) => { const e = EL(id); if (!e) return 'NO EXISTE';
    if (e.tagName === 'SELECT' && !Array.prototype.some.call(e.options, o => o.value === v))
      return 'SIN OPCION ' + v + ' [' + Array.prototype.map.call(e.options, o => o.value).join('|') + ']';
    if (e.type === 'checkbox') { e.checked = (v === '1') } else { e.value = v }
    if (!muda) { e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) }
    return 'ok' };
  for (const k of Object.keys(DATO)) {
    if (SOLO && k !== SOLO) continue;
    const o = {};
    const d = DATO[k], sw = swId(k);
    /* (1) interruptor APAGADO + dato VACIO */
    limpiar(); await esperar(460);
    o.swVacio = !!(EL(sw) && EL(sw).checked);
    o.p_off_sin = papel();
    /* (2) interruptor APAGADO al cargar el dato -es lo que esta tanda cambia- */
    limpiar(); await esperar(300);
    o.puesto = poner(d[0], d[1], false);
    await esperar(520);
    o.swTrasDato = !!(EL(sw) && EL(sw).checked);
    o.p_dato = papel();
    /* (3) el apagado A MANO se respeta */
    const e2 = EL(sw);
    if (e2) { e2.checked = false;
      if (typeof eteInclSync === 'function') { try { eteInclSync() } catch (x) {} }
      if (typeof eteShuntLesionSync === 'function') { try { eteShuntLesionSync() } catch (x) {} } }
    await esperar(560);
    o.swTrasApagarMano = !!(EL(sw) && EL(sw).checked);
    o.p_apagado = papel();
    /* (4) y un dato identificatorio NUEVO lo vuelve a encender */
    const otros = (typeof window._ccPuertaIds === 'function') ? (window._ccPuertaIds()[k] || []) : [];
    const otro = otros.filter(x => x !== d[0])[0];
    if (otro) { const ee = EL(otro);
      if (ee) { if (ee.tagName === 'SELECT') { const op = Array.prototype.filter.call(ee.options, x => x.value)[0];
                  if (op) poner(otro, op.value, false) } else { poner(otro, '7', false) } } }
    await esperar(560);
    o.otroCampo = otro || 'NO HAY OTRO';
    o.swTrasOtroDato = !!(EL(sw) && EL(sw).checked);
    /* (5) el estudio VIEJO: dato cargado por la via MUDA con el interruptor apagado */
    limpiar(); await esperar(300);
    poner(d[0], d[1], true);
    const e3 = EL(sw); if (e3) e3.checked = false;
    try { if (typeof RECALC_MODULOS === 'function') { (RECALC_MODULOS() || []).forEach(function (f) {
      if (typeof window[f] === 'function') { try { window[f]() } catch (x) {} } }) } } catch (e) {}
    await esperar(520);
    o.swEstudioViejo = !!(EL(sw) && EL(sw).checked);
    o.p_viejo = papel();
    R.secs[k] = o;
  }
  return R;
})()`;

const br = await _pw.chromium.launch({ channel: 'chrome' });
const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 130)));
let out;
try {
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(1700);
  out = await pg.evaluate(CUERPO);
  out.errs = errs.filter(e => !/ERR_FILE_NOT_FOUND|favicon/.test(e));
} catch (e) { out = { fatal: String(e).slice(0, 240), errs } }
await pg.close(); await br.close();
console.log(JSON.stringify(out, null, 1));
