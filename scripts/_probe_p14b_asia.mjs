#!/usr/bin/env node
/**
 * _probe_p14b_asia.mjs - TC-515 (G2): el renglon de la excursion del aneurisma al REABRIR.
 * Mide si la excursion sigue llegando al informe cuando «un dato, una sola puerta» enciende
 * el interruptor del FOP, y por que emisor sale.
 *   node scripts/_probe_p14b_asia.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro del template.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const CUERPO = `(async () => {
  const R = {};
  const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const V = id => { const e = EL(id); return e ? String(e.value == null ? '' : e.value) : 'NO EXISTE ' + id };
  const C = id => { const e = EL(id); return e ? !!e.checked : 'NO EXISTE ' + id };
  const T = id => { const e = EL(id); return e ? String(e.value || e.textContent || '') : 'NO EXISTE' };
  const limpiar = () => { try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {} };
  const papel = () => { try { if (typeof setEstiloInforme === 'function') setEstiloInforme('estandar') } catch (e) {}
    try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
    return { inf: T('informe_texto'), suma: T('en_suma') } };
  const hall = () => { try { if (typeof otrHallazgos !== 'function') return { n:'SIN FN' };
      const l = otrHallazgos() || [];
      const a = l.filter(x => x.id === 'otr_asia')[0];
      return { n: l.length, ids: l.map(x => x.id), inf: a ? a.inf : null } }
    catch (e) { return { n:'EXC', ids:[String(e.message)] } } };

  /* ESCENA: un estudio guardado cuyo UNICO dato del FOP es la excursion del aneurisma, por la
     via MUDA (que es donde termina reabrir: RECALC_MODULOS). */
  const campos = { nombre:'P14B515', otr_asia__chk:'1', otr_asia_lado:'ad', fop_asa_mm:'13' };
  limpiar(); await esperar(420);
  Object.keys(campos).forEach(k => { const e = EL(k.replace('__chk',''));
    if (!e) return;
    if (k.indexOf('__chk') > -1) { e.checked = campos[k] === '1' } else { e.value = campos[k] } });
  try { if (typeof _recalcModulos === 'function') _recalcModulos('p14b-asia') } catch (e) {}
  await esperar(460);
  R.alReabrir = { otrMm: V('otr-asia-mm'), fopMm: V('fop_asa_mm'),
                  chkAsia: C('otr_asia'), chkFop: C('fop_incluir_chk'),
                  swFop: (function(){ try { return typeof ccPuertaSync === 'function' } catch (e) { return 'EXC' } })() };
  R.hall = hall();
  const p = papel();
  R.informeTraeExcursion = p.inf.indexOf('con excursion de 13 mm') > -1 ||
                           p.inf.indexOf('excursi') > -1 && p.inf.indexOf('13 mm') > -1;
  R.veces13 = (p.inf.match(/13 mm/g) || []).length;
  R.renglones = p.inf.split(String.fromCharCode(10)).filter(x => x.indexOf('13 mm') > -1).map(x => x.slice(0, 220));
  R.sumaTrae = p.suma.indexOf('ASIA') > -1 || p.suma.indexOf('13') > -1;
  R.suma = p.suma.slice(0, 200);

  /* CONTROL: el MISMO estudio con el interruptor del FOP apagado A MANO despues de restaurar. */
  const sw = EL('fop_incluir_chk');
  if (sw && sw.checked) { sw.checked = false;
    try { sw.dispatchEvent(new Event('change', { bubbles:true })) } catch (e) {}
    await esperar(420);
    const p2 = papel();
    R.controlApagado = { chkFop: C('fop_incluir_chk'), hall: hall(),
                         renglones: p2.inf.split(String.fromCharCode(10)).filter(x => x.indexOf('13 mm') > -1).map(x => x.slice(0, 220)) };
  } else { R.controlApagado = 'EL INTERRUPTOR NO QUEDO ENCENDIDO' }
  return R;
})()`;

let out = null;
const br = await _pw.chromium.launch({ channel: 'chrome', headless: true });
try {
  const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
  pg.on('pageerror', e => console.error('PAGEERROR ' + e.message));
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(1600);
  out = await pg.evaluate(CUERPO);
} finally { await br.close() }
console.log(JSON.stringify(out, null, 1));
