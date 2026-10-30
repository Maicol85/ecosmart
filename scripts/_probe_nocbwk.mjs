#!/usr/bin/env node
/**
 * _probe_nocbwk.mjs — la sonda de DOS MOTORES de la TANDA NOCTURNA, Parte B (2026-10-30).
 * Calcada de _probe_oaiwk.mjs, con sus advertencias intactas.
 *
 * ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI. ⚠️ Chrome va por el del sistema con channel:'chrome'.
 * ⚠️ La copia de HEAD va en el directorio del proyecto. ⚠️ `#login-overlay` tapa la pagina.
 * ⚠️ `elementFromPoint` devuelve null FUERA del viewport: hay que traer el nodo a la vista.
 * ⚠️ Barras invertidas DOBLES y ni un acento grave adentro de MEDIR.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const { chromium, webkit } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/nocbwk.json';
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['light', 'dark'];

const MEDIR = `(async () => {
  const o = {};
  const T = (id) => { const e = document.getElementById(id);
    return e ? (e.textContent||'').replace(/[ \\t\\n\\r]+/g,' ').trim() : 'NO EXISTE' };
  const R = (id) => { const e = document.getElementById(id); if (!e) return null;
    const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } };
  const D = (id) => { const e = document.getElementById(id); return e ? getComputedStyle(e).display : 'NO EXISTE' };
  const C = (id) => { const e = document.getElementById(id); return e ? getComputedStyle(e).color : 'NO EXISTE' };
  const pon = (id,v) => { const e=document.getElementById(id); if(!e) return 'NO '+id;
    e.value=String(v); e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true})); return e.value };
  try { ['modalAvisoEco','login-overlay'].forEach(i => { const m=document.getElementById(i); if (m) m.style.display='none' }) } catch(e){}

  /* ── B1 · la fila del TRIV, sin valor y en los tres bordes ───────────────────────────── */
  try { showTab('vd') } catch(e) {}
  pon('vd-triv',''); if (typeof calcDopTric==='function') calcDopTric();
  await new Promise(r=>setTimeout(r,250));
  o.trivSinValor = { fila: D('row-vd-triv-ref'), txt: T('vd-triv-ref') };
  o.trivBordes = {};
  for (const x of [75, 76]) {
    pon('vd-triv', x); if (typeof calcDopTric==='function') calcDopTric();
    await new Promise(r=>setTimeout(r,180));
    o.trivBordes[x] = { vdad: T('vd-triv-ref'), doppler: T('dt_triv_ref'),
                        color: C('vd-triv-ref'), fila: D('row-vd-triv-ref'),
                        rect: R('row-vd-triv-ref') };
  }
  o.filasVD = (function(){ const c = document.getElementById('vd-tei-interp');
    const caja = c ? c.closest('.calc-box') : null;
    return caja ? caja.querySelectorAll('.calc-row').length : 'NO EXISTE' })();

  /* ── El globo del TRIV ─────────────────────────────────────────────────────────────────── */
  const btn = document.querySelector('[data-vinfo="vd-triv"]');
  o.globoBtn = (function(){ if (!btn) return 'NO EXISTE';
    try { btn.scrollIntoView({ block:'center' }) } catch(e){}
    const r = btn.getBoundingClientRect();
    if (!r.width) return 'SIN CAJA';
    if (r.top < 0 || r.bottom > window.innerHeight) return 'FUERA DEL VIEWPORT';
    const pts = [[r.left+2,r.top+2],[r.right-2,r.top+2],[r.left+2,r.bottom-2],
                 [r.right-2,r.bottom-2],[(r.left+r.right)/2,(r.top+r.bottom)/2]];
    let n=0; pts.forEach(p => { const t=document.elementFromPoint(p[0],p[1]);
      if (t && (t===btn || btn.contains(t))) n++ });
    return n + '/5 · ' + Math.round(r.width) + 'x' + Math.round(r.height) })();
  if (btn && typeof vInfoClic === 'function') { try { vInfoClic(btn) } catch(e){} }
  await new Promise(r=>setTimeout(r,320));
  o.globo = (function(){ const c = document.getElementById('vinfo-card');
    if (!c) return 'NO EXISTE';
    const r = c.getBoundingClientRect();
    const t = (c.textContent||'').replace(/[ \\t\\n\\r]+/g,' ').trim();
    return { w: Math.round(r.width), h: Math.round(r.height),
             enPantalla: r.left >= -1 && r.top >= -1 && r.right <= window.innerWidth+1 && r.bottom <= window.innerHeight+1,
             scroll: c.scrollHeight > c.clientHeight + 2,
             chars: t.length,
             tresFuentes: /Howard/.test(t) && /Cabrita/.test(t) && /Bréchot|Brechot/.test(t),
             diceQueNoSuma: /No suma a la probabilidad/.test(t) } })();
  try { if (typeof vInfoCerrar === 'function') vInfoCerrar(true) } catch(e){}
  await new Promise(r=>setTimeout(r,180));

  /* ── B2 · el indice calculado y el iDA con un decimal ──────────────────────────────────── */
  try { if (typeof limpiarCampos==='function') limpiarCampos() } catch(e){}
  await new Promise(r=>setTimeout(r,180));
  pon('peso','50'); pon('talla','145');
  pon('marfan_sindrome','turner'); pon('marfan_ao_ascendente','34');
  if (typeof marfanSync==='function') marfanSync();
  await new Promise(r=>setTimeout(r,280));
  o.indice = { campoVisible: D('marfan_ita'), valor: T('marfan-ita-val'),
               origen: T('marfan-ita-origen').slice(0, 70), wrap: D('marfan-ita-wrap'),
               rect: R('marfan-ita-val') };
  pon('sexo','M'); pon('ao_sin','39');
  if (typeof calcAorta==='function') calcAorta();
  await new Promise(r=>setTimeout(r,280));
  o.ida = { capsula: T('ao-interp'), rect: R('ao-interp') };

  /* ── B3 · el papel de la aortopatia ────────────────────────────────────────────────────── */
  pon('marfan_sindrome','marfan'); pon('marfan_ao_seno','52');
  { const c = document.getElementById('marfan_incluir_chk');
    if (c) { c.checked = true; c.dispatchEvent(new Event('change',{bubbles:true})) } }
  if (typeof marfanSync==='function') marfanSync();
  if (typeof setEstiloInforme==='function') setEstiloInforme('estandar');
  if (typeof generarInforme==='function') generarInforme();
  await new Promise(r=>setTimeout(r,380));
  o.papel = (function(){
    const inf = (document.getElementById('informe_texto')||{}).value || '';
    const sum = (document.getElementById('en_suma')||{}).value || '';
    return { linea: (inf.split('\\n').filter(l => /Aortopat/.test(l))[0] || '(sin linea)'),
             suma: (sum.split('\\n').filter(l => /Aortopat/.test(l))[0] || '(sin linea)'),
             sinClase: !/Clase\\s+(I|II)/.test(inf + sum),
             sinTabla: !/Tabla\\s+\\d/.test(inf + sum),
             sinFolio: !/folio\\s+\\d/.test(inf + sum) } })();
  o.capsulaMarfan = T('marfan-resultado').slice(0, 120);

  /* ── Geometria del cuerpo y texto recortado ────────────────────────────────────────────── */
  o.scrollH = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  o.pestanias = [].slice.call(document.querySelectorAll('.tab-btn, [data-tab]')).filter(b => {
    const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 }).length;
  const rec = [];
  ['vd-triv-ref','marfan-ita-val','marfan-ita-origen','ao-interp','sprime-interp','vd-tei-interp']
    .forEach(id => { const e = document.getElementById(id); if (!e) return;
      if (e.scrollWidth > e.clientWidth + 1) rec.push(id + ' ' + e.scrollWidth + '>' + e.clientWidth) });
  o.recortados = rec;
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
        new Promise((_, rj) => setTimeout(() => rj(new Error('timeout 90s en ' + k)), 90000))]);
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
