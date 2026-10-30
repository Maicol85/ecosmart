#!/usr/bin/env node
/**
 * _probe_ao2wk.mjs — la sonda de DOS MOTORES de la TANDA AORTA-2 (2026-10-30).
 * Calcada de _probe_ajustes1wk.mjs, con sus advertencias intactas.
 *
 * ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI. ⚠️ Chrome va por el del sistema con channel:'chrome'.
 * ⚠️ La copia de HEAD va en el directorio del proyecto, no en /tmp: el archivo carga su
 *    tipografia por ruta RELATIVA y una copia en /tmp fabrica un ERR_FILE_NOT_FOUND que se lee
 *    como un error de consola del lado viejo.
 * ⚠️ `#login-overlay` es position:fixed y tapa la pagina entera.
 * ⚠️ `elementFromPoint` devuelve null FUERA del viewport, no «tapado».
 * ⚠️ Los acordeones abren con una transicion de 0,3 s: se le saca antes de medir.
 * ⚠️ Barras invertidas DOBLES y ni un acento grave adentro de MEDIR.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const { chromium, webkit } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/ao2wk.json';
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['light', 'dark'];

const MEDIR = `(async () => {
  const o = {};
  const T = (id) => { const e = document.getElementById(id);
    return e ? (e.textContent||'').replace(/[ \\t\\n\\r]+/g,' ').trim() : 'NO EXISTE' };
  const pon = (id,v) => { const e=document.getElementById(id); if(!e) return 'NO '+id;
    e.value=String(v); e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true})); return e.value };
  const esperar = (ms) => new Promise(r=>setTimeout(r,ms));
  try { ['modalAvisoEco','login-overlay'].forEach(i => { const m=document.getElementById(i); if (m) m.style.display='none' }) } catch(e){}
  try { if (window.setViewMode) setViewMode('avanzado'); if (window.applyViewMode) applyViewMode() } catch(e){}
  /* Las transiciones de los acordeones: medir a mitad de la animacion da una caja falsa. */
  try { const st=document.createElement('style');
        st.textContent='*{transition:none !important;animation:none !important}';
        document.head.appendChild(st) } catch(e){}

  /* ── COMMIT 1 · los segmentos de la Figura 5 ────────────────────────────────────────── */
  pon('nombre','P'); pon('documento','9'); pon('peso','70'); pon('talla','170');
  pon('sexo','F'); pon('ao_st','34'); pon('ao_tub','37'); pon('diam_cayado','41');
  await esperar(500);
  o.capSt  = T('ao-st-interp');
  o.capTub = T('ao-tub-interp');
  o.capCay = T('ao-cay-interp');
  try { if (window.setEstiloInforme) setEstiloInforme('estandar') } catch(e){}
  try { if (window.generarInforme) generarInforme() } catch(e){}
  o.inf  = (function(){ const e=document.getElementById('informe_texto');
    return e ? String(e.value||'').split('\\n').filter(function(l){ return /[Aa]orta|sinotubular|cayado/.test(l) }).join(' | ').slice(0,300) : 'NO EXISTE' })();
  o.suma = (function(){ const e=document.getElementById('en_suma'); return e ? String(e.value||'').slice(0,240) : 'NO EXISTE' })();

  /* Los DOS globos nuevos de los segmentos: existen, se CLICKEAN de verdad y entran en la
     pantalla. El contenido lo mide TC-555 pidiendoselo al constructor. */
  /* ⚠️ ABRIR LA PESTANA NO LE DA CAJA A LA TARJETA: hay que abrir la PESTANA y ademas el ACORDEON,
     por su boton real. Sin eso los tres globos informan 0x0 y 0/5 en los dieciseis cruces —y
     dan lo mismo en los DOS arboles, que es como un cero se lee igual que «no cambio». Es la
     trampa que este repositorio ya documenta. */
  o.globos = [];
  const ABRIR = { 'ao-cay-card': ['ai-vi','aorta'], 'ao-desc-card': ['ai-vi','aorta'], 'coa-card': ['congenitas','cc-coa'] };
  for (const k of ['ao-cay-card','ao-desc-card','coa-card']) {
    try { const t = ABRIR[k][0];
          if (window.showTab) showTab(t);
          await esperar(200);
          const hdr = document.querySelector('#sacc-'+ABRIR[k][1]+' > .sacc-hdr');
          if (hdr && hdr.getAttribute('aria-expanded') !== 'true') hdr.click();
          await esperar(200);
          const body = document.querySelector('#sacc-'+ABRIR[k][1]+' .sacc-body');
          if (body) { body.style.display='block'; body.style.maxHeight='none' }
    } catch(e) {}
    const b = document.querySelector('[data-vinfo="'+k+'"]');
    if (!b) { o.globos.push(k+':NO EXISTE'); continue }
    try { b.scrollIntoView({ block:'center' }) } catch(e){}
    await esperar(60);
    const r = b.getBoundingClientRect();
    const pts=[[r.left+2,r.top+2],[r.right-2,r.top+2],[r.left+2,r.bottom-2],
               [r.right-2,r.bottom-2],[(r.left+r.right)/2,(r.top+r.bottom)/2]];
    let ok=0; pts.forEach(function(p){ const e=document.elementFromPoint(p[0],p[1]);
      if (e && (e===b || b.contains(e))) ok++ });
    b.click(); await esperar(120);
    const c = document.getElementById('vinfo-card');
    const cr = c ? c.getBoundingClientRect() : null;
    const dentro = cr ? (cr.left >= -1 && cr.top >= -1 && cr.right <= window.innerWidth+1
                         && cr.bottom <= window.innerHeight+1) : false;
    o.globos.push(k+':'+Math.round(r.width)+'x'+Math.round(r.height)+' '+ok+'/5 card='
      + (c ? Math.round(cr.width)+'x'+Math.round(cr.height)+(dentro?' dentro':' FUERA') : 'sin card'));
    b.click(); await esperar(60);
  }

  /* ── COMMIT 2 · la coartacion en el EN SUMA y sus tres hints cortos ─────────────────── */
  try { if (window.limpiarCampos) limpiarCampos(true) } catch(e){}
  await esperar(120);
  pon('nombre','P'); pon('documento','9'); pon('peso','70'); pon('talla','170'); pon('sexo','M');
  pon('coa_loc','istmo'); pon('coa_situacion','nativa'); pon('coa_istmo','8');
  pon('coa_ao_desc','20'); pon('coa_gmedio','25');
  await esperar(500);
  try { if (window.generarInforme) generarInforme() } catch(e){}
  o.sumaCoa = (function(){ const e=document.getElementById('en_suma'); return e ? String(e.value||'').slice(0,200) : 'NO EXISTE' })();
  o.hints = (function(){ const h=function(id){ const e=document.getElementById(id); if(!e) return 'NO';
      const fg=e.closest('.fg')||e.parentElement; const sp=fg?fg.querySelector('span'):null;
      return sp ? (sp.textContent||'').trim() : 'SIN SPAN' };
    return [h('coa_gradiente_picopico'), h('coa_estenosis_relativa'), h('coa_hta')].join(' | ') })();

  /* ── COMMIT 3 · las casillas fuera de la pantalla y la linea que dice donde se contestan ── */
  o.chks = ['vabchk-familiar','vabchk-hta','vabchk-crecimiento','vabchk-longitud','vabchk-cx','vabchk-embarazo']
    .filter(function(i){ return !!document.getElementById(i) }).length;
  o.grid = (function(){ const g=document.getElementById('vab-fr-grid');
    return g ? (g.hidden ? 'oculto' : 'VISIBLE') : 'NO EXISTE' })();

  /* ── LO DE SIEMPRE ─────────────────────────────────────────────────────────────────── */
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
        new Promise((_, rj) => setTimeout(() => rj(new Error('timeout 120s en ' + k)), 120000))]);
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
