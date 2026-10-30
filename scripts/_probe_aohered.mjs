#!/usr/bin/env node
/** _probe_aohered.mjs — que publica HOY la aortopatia hereditaria: el papel y la Evidencia
 *  (Parte B, commits B3 y B4, 30/10/2026). ⚠️ sin acentos graves en MEDIR. */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const { chromium } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');

const MEDIR = `(async () => {
  const o = { escenas: {} };
  const pon = (id,v) => { const e=document.getElementById(id); if(!e) return 'NO '+id;
    e.value=String(v); e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true})); return e.value };
  const chk = (id,on) => { const e=document.getElementById(id); if(!e) return 'NO '+id;
    e.checked=!!on; e.dispatchEvent(new Event('change',{bubbles:true})); return e.checked };
  const N = (t) => String(t||'').replace(/[ \\t\\n\\r]+/g,' ').trim();
  try { ['modalAvisoEco','login-overlay'].forEach(i => { const m=document.getElementById(i); if (m) m.style.display='none' }) } catch(e){}

  const ESC = {
    marfan449: { marfan_sindrome:'marfan', marfan_ao_seno:'44.9', sexo:'M', peso:'70', talla:'175' },
    marfan45:  { marfan_sindrome:'marfan', marfan_ao_seno:'45',   sexo:'M', peso:'70', talla:'175' },
    marfan451: { marfan_sindrome:'marfan', marfan_ao_seno:'45.1', sexo:'M', peso:'70', talla:'175' },
    marfan45fr:{ marfan_sindrome:'marfan', marfan_ao_seno:'45', marfan_factores_riesgo:'si', sexo:'M', peso:'70', talla:'175' },
    marfan52:  { marfan_sindrome:'marfan', marfan_ao_seno:'52',   sexo:'M', peso:'70', talla:'175' },
    lds45:     { marfan_sindrome:'lds', marfan_ao_seno:'45',   sexo:'M', peso:'70', talla:'175' },
    lds451:    { marfan_sindrome:'lds', marfan_ao_seno:'45.1', sexo:'M', peso:'70', talla:'175' },
    acta45:    { marfan_sindrome:'otro', marfan_ao_seno:'45',  sexo:'M', peso:'70', talla:'175' },
    turner:    { marfan_sindrome:'turner', marfan_ao_ascendente:'36', marfan_factores_riesgo:'si', sexo:'F', peso:'45', talla:'145' },
    eds:       { marfan_sindrome:'eds', marfan_ao_seno:'46', sexo:'M', peso:'70', talla:'175' },
    ajeno:     { im_vc:'8', onda_e:'110' }
  };
  for (const k of Object.keys(ESC)) {
    try { if (typeof limpiarCampos==='function') limpiarCampos() } catch(e){}
    await new Promise(r=>setTimeout(r,120));
    Object.keys(ESC[k]).forEach(id => pon(id, ESC[k][id]));
    chk('marfan_incluir_chk', true);
    try { if (typeof marfanSync==='function') marfanSync() } catch(e){}
    try { if (typeof _recalcModulos==='function') _recalcModulos('ab') } catch(e){}
    try { if (typeof setEstiloInforme==='function') setEstiloInforme('estandar') } catch(e){}
    try { if (typeof generarInforme==='function') generarInforme() } catch(e){}
    await new Promise(r=>setTimeout(r,320));
    const inf = (document.getElementById('informe_texto')||{}).value || '';
    const sum = (document.getElementById('en_suma')||{}).value || '';
    const est = (typeof marfanEstado==='function') ? marfanEstado() : null;
    o.escenas[k] = {
      clave: est ? est.clave : null,
      lineasAorto: inf.split('\\n').filter(l => /Aortopat|Marfan|Loeys|Turner|Ehlers|ACTA|sinusal|ascendente/i.test(l)),
      suma: sum.split('\\n').filter(l => /Aortopat|Marfan|Loeys|Turner|Ehlers|ACTA|Dilataci/i.test(l)),
      tieneClase: /Clase\\s+(I|II)/.test(inf) || /Clase\\s+(I|II)/.test(sum),
      tieneTabla: /Tabla\\s+\\d/.test(inf) || /Tabla\\s+\\d/.test(sum),
      tieneFolio: /folio\\s+\\d/.test(inf) || /folio\\s+\\d/.test(sum),
      tieneUmbral: /(>=|≥|>|desde)\\s*\\d{2}\\s*mm/.test(inf) || /(>=|≥|>|desde)\\s*\\d{2}\\s*mm/.test(sum),
      tieneIndice: /mm\\/m²/.test(inf) || /mm\\/m²/.test(sum)
    };
  }
  /* ── LA EVIDENCIA de la aortopatia, con un Marfan cargado ─────────────────────────────── */
  try { if (typeof limpiarCampos==='function') limpiarCampos() } catch(e){}
  Object.keys(ESC.marfan52).forEach(id => pon(id, ESC.marfan52[id]));
  try { if (typeof indicRender==='function') indicRender() } catch(e){}
  await new Promise(r=>setTimeout(r,450));
  o.evidencia = (function(){
    const cu = document.getElementById('ind-cuerpo') || document.getElementById('indic-cuerpo');
    if (!cu) return 'NO EXISTE el cuerpo del panel';
    const secs = [].slice.call(cu.children).filter(d => d.tagName === 'DETAILS');
    const ao = secs.filter(d => /Aorta tor/i.test(N(d.textContent)))[0];
    if (!ao) return { secciones: secs.map(d => N(d.textContent).slice(0,40)) };
    const t = N(ao.textContent);
    return { chars: t.length,
             marfan50: t.indexOf('50 mm') > -1, marfan45: t.indexOf('45 mm') > -1,
             nombraMarfan: /Marfan/i.test(t), nombraLDS: /Loeys/i.test(t),
             nombraACTA2: /ACTA2/i.test(t), nombraTurner: /Turner/i.test(t),
             nombraEDS: /Ehlers/i.test(t),
             preservacion: /preserva/i.test(t),
             texto: t.slice(0, 2600) };
  })();
  return o;
})()`;

const b = await chromium.launch({ channel: 'chrome' });
const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; pg.on('pageerror', e => errs.push(e.message.slice(0,140)));
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
await pg.waitForTimeout(1500);
const r = await Promise.race([pg.evaluate(MEDIR),
  new Promise((_, rj) => setTimeout(() => rj(new Error('timeout 120s')), 120000))]);
r.errores = errs; r.archivo = FILE;
console.log(JSON.stringify(r, null, 1));
await b.close(); process.exit(0);
