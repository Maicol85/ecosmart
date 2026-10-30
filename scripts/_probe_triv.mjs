#!/usr/bin/env node
/**
 * _probe_triv.mjs — el TRIV del VD en sus DOS referencias (Parte B, commit B1, 30/10/2026).
 *
 * Mide los bordes 74, 75 y 76 ms en los DOS cuadros, el amarillo, que la fila no aparezca sin
 * valor, que el texto sea EL MISMO en los dos, y —el control— que el TRIV no vote ni entre en
 * la probabilidad de HTP, con y sin el dato.
 *
 * ⚠️ UNA BARRA INVERTIDA SIMPLE NO SOBREVIVE AL TEMPLATE LITERAL: en el archivo van DOS.
 * ⚠️ NI UN ACENTO GRAVE adentro del cuerpo de MEDIR.
 *
 *   node scripts/_probe_triv.mjs --file /ruta/HEAD.html
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const { chromium } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');

const MEDIR = `(async () => {
  const o = {};
  const pon = (id,v) => { const e=document.getElementById(id); if(!e) return 'NO '+id;
    e.value=String(v); e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true})); return e.value };
  const T = (id) => { const e=document.getElementById(id);
    return e ? (e.textContent||'').replace(/[ \\\\t\\\\n]+/g,' ').trim() : 'NO EXISTE' };
  const col = (id) => { const e=document.getElementById(id); return e ? getComputedStyle(e).color : 'NO EXISTE' };
  const vis = (id) => { const e=document.getElementById(id); return e ? getComputedStyle(e).display : 'NO EXISTE' };
  try { ['modalAvisoEco','login-overlay'].forEach(i => { const m=document.getElementById(i); if (m) m.style.display='none' }) } catch(e){}

  o.constantes = { panel: (typeof DT_TRIV_HTP_PANEL !== 'undefined') ? DT_TRIV_HTP_PANEL : 'NO EXISTE',
                   informe: (typeof DT_TRIV_HTP !== 'undefined') ? DT_TRIV_HTP : 'NO EXISTE' };
  o.duenoTexto = (typeof _dtTrivRefTxt === 'function');
  o.campos = { vdad: !!document.getElementById('vd-triv'), doppler: !!document.getElementById('dt_triv') };
  o.filaNueva = !!document.getElementById('row-vd-triv-ref');
  o.globo = !!document.querySelector('[data-vinfo="vd-triv"]');

  /* SIN VALOR: la fila no se dibuja. */
  pon('vd-triv',''); if (typeof calcDopTric==='function') calcDopTric();
  await new Promise(r=>setTimeout(r,150));
  o.sinValor = { fila: vis('row-vd-triv-ref'), vdad: T('vd-triv-ref'), doppler: T('dt_triv_ref') };

  /* LOS BORDES, por las DOS puertas. */
  o.bordes = {};
  for (const puerta of ['vd-triv','dt_triv']) {
    o.bordes[puerta] = {};
    for (const x of [74,75,76,30]) {
      pon(puerta, x);
      if (typeof calcDopTric==='function') calcDopTric();
      await new Promise(r=>setTimeout(r,120));
      o.bordes[puerta][x] = { vdad: T('vd-triv-ref'), doppler: T('dt_triv_ref'),
                              colorVdad: col('vd-triv-ref'), colorDoppler: col('dt_triv_ref'),
                              fila: vis('row-vd-triv-ref'),
                              espejo: (document.getElementById(puerta==='vd-triv'?'dt_triv':'vd-triv')||{}).value };
    }
  }

  /* CONTROL: el TRIV no vota ni entra en la probabilidad de HTP. Se mide con y SIN el dato, y
     con la probabilidad despierta -VRT cargada-, que es el denominador. */
  const htp = () => ({ catA: T('htp2022-catA'), catB: T('htp2022-catB'), catC: T('htp2022-catC'),
                       prob: T('htp2022-prob'), vrt: T('htp2022-vrt-interp') });
  pon('vmax_it','3.2'); pon('vd_bas','45'); pon('tapse','18');
  if (typeof calcVD==='function') calcVD();
  if (typeof htpTablaPintar==='function') htpTablaPintar();
  await new Promise(r=>setTimeout(r,300));
  pon('vd-triv',''); if (typeof calcDopTric==='function') calcDopTric();
  if (typeof htpTablaPintar==='function') htpTablaPintar();
  await new Promise(r=>setTimeout(r,300));
  o.htpSinTriv = htp();
  pon('vd-triv','110'); if (typeof calcDopTric==='function') calcDopTric();
  if (typeof htpTablaPintar==='function') htpTablaPintar();
  await new Promise(r=>setTimeout(r,300));
  o.htpConTriv = htp();
  o.htpIgual = JSON.stringify(o.htpSinTriv) === JSON.stringify(o.htpConTriv);

  /* La frase del INFORME que usa el 60, con su ejemplo. SOLO SE REPORTA. */
  o.informe60 = (typeof htpIndirectosFrase === 'function') ? htpIndirectosFrase() : 'NO EXISTE';
  pon('vd-triv','65'); if (typeof calcDopTric==='function') calcDopTric();
  o.informe60_con65 = (typeof htpIndirectosFrase === 'function') ? htpIndirectosFrase() : 'NO EXISTE';
  pon('vd-triv','55'); if (typeof calcDopTric==='function') calcDopTric();
  o.informe60_con55 = (typeof htpIndirectosFrase === 'function') ? htpIndirectosFrase() : 'NO EXISTE';

  /* Las filas del cuadro del VD, para el conteo que TC-457 y TC-476 fijan. */
  const caja = document.getElementById('vd-tam') ? document.getElementById('vd-tam').closest('.calc-box') : null;
  o.filasVD = caja ? caja.querySelectorAll('.calc-row').length : 'NO EXISTE';
  o.filasVDvisibles = caja ? [].slice.call(caja.querySelectorAll('.calc-row'))
      .filter(r => getComputedStyle(r).display !== 'none').length : 'NO EXISTE';
  return o;
})()`;

const b = await chromium.launch({ channel: 'chrome' });
const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push(e.message.slice(0, 140)));
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
await pg.waitForTimeout(1500);
const r = await Promise.race([pg.evaluate(MEDIR),
  new Promise((_, rj) => setTimeout(() => rj(new Error('timeout 90s')), 90000))]);
r.errores = errs; r.archivo = FILE;
console.log(JSON.stringify(r, null, 1));
await b.close(); process.exit(0);
