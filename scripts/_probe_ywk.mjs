#!/usr/bin/env node
/**
 * _probe_ywk.mjs - la sonda de DOS MOTORES de la tanda Y, Parte 1 (2026-10-29).
 *
 * Dos motores x cuatro anchos (1440, 1000, 768 y 390 px) x dos temas = 16 cruces por motor,
 * sobre las tres zonas que la Parte 1 toca: el cuadro de referencias del VD con la fila nueva
 * del strain, el campo del TRIV en la columna 1, y la pastilla de la raiz aortica.
 *
 * ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI, Y SE DECLARA.
 * ⚠️ EL BINARIO DE CHROMIUM DE PLAYWRIGHT NO ESTA EN ESTA MAQUINA, asi que Chrome va por el del
 *    sistema con channel:'chrome'. Sin eso la sonda devuelve los cruces VACIOS, que en un
 *    volcado se lee igual que «no hubo diferencias».
 * ⚠️ LA COPIA DE HEAD VA EN EL DIRECTORIO DEL PROYECTO Y NO EN /tmp: el archivo carga su
 *    tipografia por ruta RELATIVA, asi que una copia en /tmp fabrica un ERR_FILE_NOT_FOUND que
 *    se lee como un error de consola del lado viejo (trampa 8a del mapa de la tanda G).
 * ⚠️ POR DEBAJO DE 768 px LAS PESTANIAS INFORMAN 0 CON CAJA Y ES EL DISENO: la barra lateral se
 *    reemplaza por el desplegable movil. Verificado identico en HEAD en los dos motores.
 *
 *   node scripts/_probe_ywk.mjs --out /tmp/ywk.json
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const { chromium, webkit } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/ywk.json';
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['light', 'dark'];

const MEDIR = `(() => {
  const o = {};
  const T = (id) => { const e = document.getElementById(id); return e ? (e.textContent||'').replace(/\\s+/g,' ').trim() : 'NO EXISTE' };
  const R = (id) => { const e = document.getElementById(id); if (!e) return null;
    const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } };
  const VIS = (id) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE';
    return getComputedStyle(e).display !== 'none' };
  const pon = (id,v) => { const e=document.getElementById(id); if(!e) return 'NO '+id;
    e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); return e.value };
  try { ['modalAvisoEco','login-overlay'].forEach(id => { const m=document.getElementById(id); if (m) m.style.display='none' }) } catch(e){}
  try { limpiarCampos(true) } catch(e) {}
  try { showTab('vd') } catch(e) {}
  pon('vd_strain_pl','-18'); pon('dt_triv','76');
  pon('peso','70'); pon('talla','170'); pon('ao_sin','38');
  o.strainTxt = T('vd-strain-interp');
  o.strainVis = VIS('row-vd-strain-interp');
  o.strainRect = R('vd-strain-interp');
  o.bajoCampo = !!document.getElementById('vd_strain_pl-grado');
  o.trivRect = R('vd-triv');
  o.trivVal = (document.getElementById('vd-triv')||{}).value;
  o.trivFila = T('dt_triv_ref');
  o.aoSinSexo = T('ao-interp');
  pon('sexo','F');
  o.aoConSexo = T('ao-interp');
  try { limpiarCampos(true) } catch(e) {}
  pon('peso','45'); pon('talla','150'); pon('ao_sin','31');
  o.aoIda = T('ao-interp');
  /* Geometria del cuerpo y texto recortado, en las zonas de la tanda. */
  o.scrollH = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  o.pestanias = [].slice.call(document.querySelectorAll('.tab-btn, [data-tab]')).filter(b => {
    const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 }).length;
  const recortados = [];
  ['vd-strain-interp','vd-tei-interp','tapse-interp','sprime-interp','ao-interp','dt_triv_ref']
    .forEach(id => { const e = document.getElementById(id); if (!e) return;
      if (e.scrollWidth > e.clientWidth + 1) recortados.push(id + ' ' + e.scrollWidth + '>' + e.clientWidth) });
  o.recortados = recortados;
  /* El rotulo del campo del TRIV entero. */
  const lab = (function(){ const e = document.getElementById('vd-triv');
    const fg = e && e.closest('.fg'); const l = fg && fg.querySelector('label');
    if (!l) return null; return { txt: (l.textContent||'').trim(),
      rec: l.scrollWidth > l.clientWidth + 1, w: Math.round(l.getBoundingClientRect().width) } })();
  o.trivLabel = lab;
  return o;
})()`;

const OUT = { archivo: FILE, cruces: {} };
for (const [nom, motor, opts] of [['chrome', chromium, { channel: 'chrome' }], ['webkit', webkit, {}]]) {
  let b = null;
  try { b = await motor.launch(opts) } catch (e) { OUT['err_' + nom] = String(e).slice(0, 180); continue }
  for (const w of ANCHOS) for (const tema of TEMAS) {
    const k = nom + '/' + w + '/' + tema;
    try {
      const pg = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: tema });
      const errs = [];
      pg.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)) });
      pg.on('pageerror', e => errs.push('PAGEERROR ' + e.message.slice(0, 120)));
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
      await pg.waitForTimeout(1200);
      const r = await Promise.race([pg.evaluate(MEDIR),
        new Promise((_, rj) => setTimeout(() => rj(new Error('timeout 60s en ' + k)), 60000))]);
      r.errores = errs;
      OUT.cruces[k] = r;
      await pg.close();
      process.stderr.write('  ' + k + ' ok\n');
    } catch (e) { OUT.cruces[k] = { EXC: String(e).slice(0, 180) }; process.stderr.write('  ' + k + ' EXC\n') }
  }
  try { await b.close() } catch (e) {}
}
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF);
process.exit(0);
