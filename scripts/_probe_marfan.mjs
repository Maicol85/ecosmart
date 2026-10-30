#!/usr/bin/env node
/**
 * _probe_marfan.mjs — el indice de tamanio aortico calculado y el iDA con un decimal
 * (Parte B, commit B2, 30/10/2026).
 *
 * ⚠️ NI UN ACENTO GRAVE adentro del cuerpo de MEDIR, y las barras invertidas DOBLES.
 *
 *   node scripts/_probe_marfan.mjs --file /ruta/HEAD.html
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
    return e ? (e.textContent||'').replace(/[ \\t\\n\\r]+/g,' ').trim() : 'NO EXISTE' };
  const vis = (id) => { const e=document.getElementById(id); return e ? getComputedStyle(e).display : 'NO EXISTE' };
  try { ['modalAvisoEco','login-overlay'].forEach(i => { const m=document.getElementById(i); if (m) m.style.display='none' }) } catch(e){}

  o.piezas = { aoIndexar: typeof aoIndexar, aoIdaTxt: typeof aoIdaTxt,
               marfanItaEfectivo: typeof marfanItaEfectivo };
  o.campoTipeable = (function(){ const e=document.getElementById('marfan_ita');
    if (!e) return 'NO EXISTE';
    return { display: getComputedStyle(e).display, tieneOninput: !!e.getAttribute('oninput'),
             esCampoDelEstudio: (typeof _noEsDelEstudio==='function') ? !_noEsDelEstudio('marfan_ita') : null }; })();
  o.spanValor = !!document.getElementById('marfan-ita-val');

  /* ── EL INDICE SE CALCULA SOLO ───────────────────────────────────────────────────────────── */
  pon('peso','50'); pon('talla','145');       /* BSA = sqrt(50*145/3600) = 1,4187 */
  pon('marfan_sindrome','turner'); pon('marfan_ao_ascendente','34');
  if (typeof marfanSync==='function') marfanSync();
  await new Promise(r=>setTimeout(r,250));
  o.bsa = (typeof getBSA==='function') ? getBSA() : null;
  o.calculado = { ef: (typeof marfanItaEfectivo==='function') ? marfanItaEfectivo() : null,
                  pantalla: T('marfan-ita-val'), origen: T('marfan-ita-origen'),
                  campo: (document.getElementById('marfan_ita')||{}).value,
                  wrap: vis('marfan-ita-wrap'),
                  concl: T('marfan-resultado') };
  /* CONTROL: nada automatico escribe en el estudio. */
  if (typeof _recalcModulos === 'function') { try { _recalcModulos('ab') } catch(e){} }
  await new Promise(r=>setTimeout(r,500));
  o.trasBarrido = { campo: (document.getElementById('marfan_ita')||{}).value };

  /* ── UN ESTUDIO VIEJO: con el campo guardado y SIN ascendente ────────────────────────────── */
  pon('marfan_ao_ascendente','');
  { const e=document.getElementById('marfan_ita'); e.value='26.4'; }
  if (typeof marfanSync==='function') marfanSync();
  await new Promise(r=>setTimeout(r,200));
  o.guardado = { ef: (typeof marfanItaEfectivo==='function') ? marfanItaEfectivo() : null,
                 pantalla: T('marfan-ita-val'), origen: T('marfan-ita-origen'),
                 concl: T('marfan-resultado') };
  /* Y con los DOS: manda el calculado. */
  pon('marfan_ao_ascendente','34');
  if (typeof marfanSync==='function') marfanSync();
  await new Promise(r=>setTimeout(r,200));
  o.losDos = { ef: (typeof marfanItaEfectivo==='function') ? marfanItaEfectivo() : null,
               pantalla: T('marfan-ita-val'), campoGuardado: (document.getElementById('marfan_ita')||{}).value };

  /* ── EL EXCEL lee el valor efectivo ──────────────────────────────────────────────────────── */
  o.excel = (function(){
    if (typeof _labExcelRow !== 'function' || typeof _noEsDelEstudio !== 'function') return 'SIN FN';
    const campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
      if (_noEsDelEstudio(e.id)) return;
      campos[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || ''); });
    const fila = _labExcelRow({ campos: campos, fecha: '2026-10-30' });
    return { n: Object.keys(fila).length,
             ita: fila['Marfan/EHAT índice tamaño aórtico (mm/m2)'],
             campoCrudo: campos['marfan_ita'] };
  })();
  /* Un estudio GUARDADO viejo: sin ascendente, con el campo. */
  o.excelViejo = (function(){
    if (typeof _labExcelRow !== 'function') return 'SIN FN';
    const f = _labExcelRow({ campos: { marfan_sindrome:'turner', marfan_ita:'26.4', peso:'50', talla:'145' },
                             fecha:'2026-10-30' });
    return { ita: f['Marfan/EHAT índice tamaño aórtico (mm/m2)'], n: Object.keys(f).length };
  })();
  o.excelCalculable = (function(){
    if (typeof _labExcelRow !== 'function') return 'SIN FN';
    const f = _labExcelRow({ campos: { marfan_sindrome:'turner', marfan_ita:'26.4',
                                       marfan_ao_ascendente:'34', peso:'50', talla:'145' },
                             fecha:'2026-10-30' });
    return { ita: f['Marfan/EHAT índice tamaño aórtico (mm/m2)'], n: Object.keys(f).length };
  })();

  /* ── EL iDA DE LA RAIZ, CON UN DECIMAL, en los TRES lugares ──────────────────────────────── */
  o.ida = {};
  /* Talla baja: raiz 39 mm con BSA 1,4187 da iDA 27,49 */
  pon('sexo','M'); pon('ao_sin','39');
  if (typeof calcAorta==='function') calcAorta();
  if (typeof setEstiloInforme==='function') setEstiloInforme('estandar');
  if (typeof generarInforme==='function') generarInforme();
  await new Promise(r=>setTimeout(r,350));
  o.ida.raiz39 = { pastilla: T('ao-interp'),
                   informe: (document.getElementById('informe_texto')||{}).value || '',
                   suma: (document.getElementById('en_suma')||{}).value || '' };
  /* El borde: un iDA que redondeado da justo el corte. 22,04 -> ascendente... se fuerza con la raiz. */
  /* BSA 1,4187; raiz 31,25 da 22,027 */
  pon('ao_sin','31.25');
  if (typeof calcAorta==='function') calcAorta();
  if (typeof generarInforme==='function') generarInforme();
  await new Promise(r=>setTimeout(r,350));
  o.ida.borde = { pastilla: T('ao-interp'),
                  idaCrudo: (typeof aoIndexar==='function') ? aoIndexar(31.25) : null,
                  txt: (typeof aoIdaTxt==='function') ? aoIdaTxt(aoIndexar(31.25)) : null,
                  informe: (document.getElementById('informe_texto')||{}).value || '' };
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
