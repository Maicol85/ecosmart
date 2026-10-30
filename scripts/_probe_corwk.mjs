#!/usr/bin/env node
/**
 * _probe_corwk.mjs — la sonda de DOS MOTORES de la TANDA CORRECCIONES (2026-10-30).
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
const OUTF = arg('--out') || '/tmp/cor/wk.json';
/* Los SEIS anchos que la orden pide: los cinco del punto 7 (500 a 1200) mas 1440 y 390. */
const ANCHOS = [1440, 1200, 1000, 768, 500, 390];
const TEMAS = ['light', 'dark'];

const MEDIR = `(async () => {
  const o = {};
  const T = (id) => { const e = document.getElementById(id);
    return e ? (e.textContent||'').replace(/[ \\t\\n\\r]+/g,' ').trim() : 'NO EXISTE' };
  const R = (id) => { const e = document.getElementById(id); if (!e) return null;
    const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } };
  const D = (id) => { const e = document.getElementById(id); return e ? getComputedStyle(e).display : 'NO EXISTE' };
  const pon = (id,v) => { const e=document.getElementById(id); if(!e) return 'NO '+id;
    e.value=String(v); e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true})); return e.value };
  const esperar = (ms) => new Promise(r=>setTimeout(r,ms));
  try { ['modalAvisoEco','login-overlay'].forEach(i => { const m=document.getElementById(i); if (m) m.style.display='none' }) } catch(e){}

  /* ── COR-3 · la grilla de VD/AD ──────────────────────────────────────────────────────── */
  try { showTab('vd') } catch(e) {}
  try { secToggle('vd') } catch(e) {}
  await esperar(400);
  const cel = [].slice.call(document.querySelectorAll('.vd-grid .fg')).map(function(d){
    const c=(d.className.match(/vd-c([0-9])/)||[])[1], r=(d.className.match(/vd-r([0-9])/)||[])[1];
    const i=d.querySelector('input[id],select[id]');
    return (c||'?')+':'+(r||'?')+':'+(i?i.id:'?'); });
  o.vdGrid = cel.join(' | ');
  o.vdCols = [1,2,3].map(function(n){ return cel.filter(function(x){return x.indexOf(n+':')===0}).length }).join('/');
  { const a=document.getElementById('vd_vi'), b=document.getElementById('vd_vi_sel');
    const ra=a?a.getBoundingClientRect():null, rb=b?b.getBoundingClientRect():null;
    o.vdVi = ra&&rb ? { aW:Math.round(ra.width), bW:Math.round(rb.width),
      mismaFila: Math.abs(ra.bottom-rb.bottom)<6, aIzq: rb.left>ra.left } : 'SIN CAJA'; }

  /* ── COR-6 · el esquema de la orejuela ───────────────────────────────────────────────── */
  try { showTab('ete') } catch(e) {}
  try { const c=document.getElementById('ete-seccion-oai'); if (c) c.style.display='' } catch(e){}
  pon('oai_morfologia','cactus'); pon('oai_ostium_diam','26');
  pon('oai_profundidad','37'); pon('oai_vel_vac','18'); pon('oai_trombo','si');
  pon('oai_sec','severo');
  await esperar(700);
  { const cont=document.getElementById('oai-esq'); const svg=cont?cont.querySelector('svg'):null;
    const ps = svg ? [].slice.call(svg.querySelectorAll('path')) : [];
    const dde = function(p){ return p.getAttribute('d')||'' };
    o.esq = { caja: R('oai-esq'),
      ai: ps.some(function(p){return dde(p).indexOf('M16 70')===0}),
      vpsi: svg ? svg.querySelectorAll('ellipse').length : -1,
      triangulo: ps.some(function(p){return dde(p).indexOf('M48 164 C60 200')===0}),
      trombo: !!(svg && svg.querySelector('g[clip-path] path')),
      paths: ps.length }; }
  o.botonPdf = { txt: T('oai-esq-pdf'), caja: R('oai-esq-pdf') };
  o.rotuloMorf = (function(){ const s=document.getElementById('oai_morfologia');
    if (!s) return 'NO EXISTE';
    const op=[].slice.call(s.options).filter(function(x){return x.value==='veleta'})[0];
    return op ? op.text : 'SIN OPCION'; })();

  /* ── COR-1 y COR-2 · el papel ────────────────────────────────────────────────────────── */
  pon('dt_triv','76'); pon('vmax_it','3.6'); pon('tvia','120');
  await esperar(400);
  try { if (typeof setEstiloInforme==='function') setEstiloInforme('estandar') } catch(e){}
  try { if (typeof generarInforme==='function') generarInforme() } catch(e){}
  { const t=(document.getElementById('informe_texto')||{}).value||'';
    o.papel = { orejuela: (t.split('\\n').filter(function(l){return l.indexOf('Orejuela izquierda:')===0})[0]||''),
                triv: (t.indexOf('> 75 ms')>-1), triv60: (t.indexOf('> 60 ms')>-1),
                apto: (t.toLowerCase().indexOf('apto')>-1) }; }

  /* ── COR-4 · la lectura de la raiz y el mensaje de Turner ────────────────────────────── */
  try { if (typeof limpiarCampos==='function') limpiarCampos(true) } catch(e){}
  pon('ao_sin','39'); pon('peso','70'); pon('talla','175');
  await esperar(500);
  o.marfanLectura = T('marfan-ao-lectura');
  pon('marfan_sindrome','turner'); await esperar(500);
  o.turnerFalta = T('marfan-ita-origen');

  /* ── EL PUNTO 7: la columna izquierda, los botones de arriba y las pestanias ─────────── */
  /* ⚠️ LA COLUMNA IZQUIERDA NO TIENE id, TIENE CLASE: .rail. Preguntar por getElementById
     devolvia null y «la columna izquierda» habria salido NO EXISTE en los doce cruces, que se
     lee igual que «no se adapta». */
  o.layout = { rail: (function(){ const e = document.querySelector('.rail');
                 if (!e) return 'NO EXISTE'; const r = e.getBoundingClientRect();
                 return { w: Math.round(r.width), h: Math.round(r.height),
                          disp: getComputedStyle(e).display } })(),
               header: (function(){ const h=document.querySelector('header');
                 if (!h) return 'NO EXISTE'; const r=h.getBoundingClientRect();
                 return { w:Math.round(r.width), h:Math.round(r.height),
                          wrap: getComputedStyle(h).flexWrap } })(),
               tabs: (function(){ const b=[].slice.call(document.querySelectorAll('.tab-btn'));
                 const conCaja=b.filter(function(x){const r=x.getBoundingClientRect(); return r.width>0});
                 return b.length+'/'+conCaja.length })(),
               hdrBtns: (function(){ const c=document.querySelector('.hdr-btns');
                 if (!c) return 'NO EXISTE'; const r=c.getBoundingClientRect();
                 return { w:Math.round(r.width), h:Math.round(r.height) } })() };

  /* ── ESCRIBIR NO SE TIENE QUE VOLVER MAS LENTO ──────────────────────────────────────────
     El COR-4 agrego marfanSync a ESPEJOS_VIVOS, que corre en el barrido de 220 ms. Se miden
     TRECE teclas reales sobre un campo del estudio y el barrido una vez, igual que las tandas
     anteriores. La medicion va DESPUES de todo lo demas para que el arbol este poblado, que es
     el escenario caro. */
  { const e = document.getElementById('ddfvi');
    if (e) { const ts = [];
      for (let q = 0; q < 13; q++) {
        const t0 = performance.now();
        e.value = String(40 + q);
        e.dispatchEvent(new Event('input', { bubbles: true }));
        ts.push(performance.now() - t0);
        await esperar(30);
      }
      const t1 = performance.now();
      try { if (typeof _espejosBarrerTodos === 'function') _espejosBarrerTodos('wk') } catch (x) {}
      o.tecla = { media: Math.round(ts.reduce(function(a,b){return a+b},0) / ts.length * 100) / 100,
                  max: Math.round(Math.max.apply(null, ts) * 100) / 100,
                  barrido: Math.round((performance.now() - t1) * 100) / 100 };
    } else { o.tecla = 'SIN CAMPO' } }

  /* ── LO DE SIEMPRE: scroll horizontal, texto recortado, pestanias con caja ───────────── */
  o.scrollH = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  o.recortados = (function(){ let n=0, ej=[];
    [].slice.call(document.querySelectorAll('label,span,button,option,.calc-lbl,.badge'))
      .forEach(function(e){ if (!e.offsetParent) return;
        if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) {
          n++; if (ej.length<4) ej.push((e.textContent||'').slice(0,34)); } });
    return { n: n, ej: ej }; })();
  o.pestanias = (function(){ const b=[].slice.call(document.querySelectorAll('.tab-btn'));
    return b.filter(function(x){ return x.getBoundingClientRect().width>0 }).length+'/'+b.length })();
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
