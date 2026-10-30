#!/usr/bin/env node
/**
 * _probe_ajustes1wk.mjs — la sonda de DOS MOTORES de la TANDA AJUSTES-1 (2026-10-30).
 * Calcada de _probe_corwk.mjs, con sus advertencias intactas.
 *
 * ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI. ⚠️ Chrome va por el del sistema con channel:'chrome'.
 * ⚠️ La copia de HEAD va en el directorio del proyecto, no en /tmp: el archivo carga su
 *    tipografia por ruta RELATIVA y una copia en /tmp fabrica un ERR_FILE_NOT_FOUND que se lee
 *    como un error de consola del lado viejo.
 * ⚠️ `#login-overlay` es position:fixed y tapa la pagina entera: sin descartarlo,
 *    `elementFromPoint` da 0 de 5 puntos sobre un boton que mide 44x44 de verdad.
 * ⚠️ `elementFromPoint` devuelve null FUERA del viewport, no «tapado»: hay que traer el nodo a
 *    la vista antes de medir.
 * ⚠️ Los acordeones abren con una transicion de 0,3 s: medir en el acto lee la caja de MITAD de
 *    la animacion. Se le saca la transicion antes de medir.
 * ⚠️ Barras invertidas DOBLES y ni un acento grave adentro de MEDIR.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const { chromium, webkit } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
/* ⚠️ EL NOMBRE NO ES «_probe_aj1wk.mjs», Y NO ES UN CAPRICHO: ESE ARCHIVO YA EXISTE y es la
   sonda de dos motores de la tanda AJ1 del 23/10 (commit 92198c3). Esta tanda se llama
   AJUSTES-1, que es otra; al escribir la suya con el nombre corto la sobrescribi, y hubo que
   restaurarla desde HEAD byte por byte. El mismo cuidado vale para el mapa:
   «docs/mapa/aj1-ajustes.md» es de aquella tanda y el de esta es
   «docs/mapa/aj1-orejuela-pdf-ensuma.md». */
const OUTF = arg('--out') || '/tmp/aj1/wk.json';
/* Los SEIS anchos que la orden pide. */
const ANCHOS = [1440, 1200, 1000, 768, 500, 390];
const TEMAS = ['light', 'dark'];

const MEDIR = `(async () => {
  const o = {};
  const T = (id) => { const e = document.getElementById(id);
    return e ? (e.textContent||'').replace(/[ \\t\\n\\r]+/g,' ').trim() : 'NO EXISTE' };
  const R = (id) => { const e = document.getElementById(id); if (!e) return null;
    const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } };
  const pon = (id,v) => { const e=document.getElementById(id); if(!e) return 'NO '+id;
    e.value=String(v); e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true})); return e.value };
  const esperar = (ms) => new Promise(r=>setTimeout(r,ms));
  try { ['modalAvisoEco','login-overlay'].forEach(i => { const m=document.getElementById(i); if (m) m.style.display='none' }) } catch(e){}

  /* ── AJ1-1a · el rotulo del cactus, que no depende del ancho pero si del arbol ───────── */
  o.opts = (function(){ const s=document.getElementById('oai_morfologia');
    return s ? [].slice.call(s.options).map(function(x){ return x.value+'='+x.text }).join(' | ') : 'NO EXISTE' })();

  /* ── AJ1-1d · el esquema de la orejuela CON y SIN velocidad ──────────────────────────── */
  try { showTab('ete') } catch(e) {}
  try { const c=document.getElementById('ete-seccion-oai'); if (c) c.style.display='' } catch(e){}
  pon('oai_morfologia','ala'); pon('oai_ostium_diam','26');
  pon('oai_profundidad','37'); pon('oai_vel_vac','30'); pon('oai_trombo','no');
  await esperar(700);
  o.esqCon = (function(){ const c=document.getElementById('oai-esq'); const g=c?c.querySelector('svg'):null;
    if (!g) return 'SIN SVG';
    const r=g.getBoundingClientRect();
    return { alto: g.getAttribute('height'), caja:{ w:Math.round(r.width), h:Math.round(r.height) },
             doppler: (g.textContent||'').indexOf('Doppler pulsado')>-1 } })();
  pon('oai_vel_vac','');
  await esperar(700);
  o.esqSin = (function(){ const c=document.getElementById('oai-esq'); const g=c?c.querySelector('svg'):null;
    if (!g) return 'SIN SVG';
    const r=g.getBoundingClientRect();
    /* El BBOX real del dibujo: es lo que prueba que acortar el lienzo a 262 no recorta nada. */
    let bb=null; try { const b=g.getBBox(); bb={ y2: Math.round((b.y+b.height)*10)/10 } } catch(e){ bb='SIN BBOX' }
    return { alto: g.getAttribute('height'), caja:{ w:Math.round(r.width), h:Math.round(r.height) },
             doppler: (g.textContent||'').indexOf('Doppler pulsado')>-1,
             sinVel: (g.textContent||'').indexOf('sin velocidad cargada')>-1, bbox: bb } })();
  o.pastilla = T('oai-elegibilidad');

  /* ── AJ1-5 · la fila de miniaturas, con sus areas tactiles ───────────────────────────── */
  pon('oai_vel_vac','30');
  await esperar(300);
  try { if (typeof oaiEsqIncluirPDF === 'function') await oaiEsqIncluirPDF() } catch(e){}
  await esperar(700);
  try { showTab('informe') } catch(e) {}
  await esperar(500);
  o.fila = (function(){ const f=document.getElementById('inf-min-fila');
    if (!f) return 'NO EXISTE';
    const cs=getComputedStyle(f), r=f.getBoundingClientRect();
    const it=[].slice.call(f.querySelectorAll('[data-min-i]'));
    return { display: cs.display, w: Math.round(r.width), h: Math.round(r.height),
             n: it.length, cont: T('inf-min-cont'),
             scrollH: f.scrollWidth - f.clientWidth } })();
  /* El area tactil de la ✕ y de las flechas, con los CINCO puntos. El nodo se trae a la vista
     primero: fuera del viewport elementFromPoint devuelve null y da 0/5 sobre un boton sano. */
  o.toques = (function(){
    const bs=[].slice.call(document.querySelectorAll('#inf-min-lista .inf-min-x, #inf-min-lista .inf-min-ord button'));
    if (!bs.length) return 'SIN BOTONES';
    const out=[];
    bs.slice(0,3).forEach(function(b){
      try { b.scrollIntoView({ block:'center' }) } catch(e){}
      const r=b.getBoundingClientRect();
      const pts=[[r.left+2,r.top+2],[r.right-2,r.top+2],[r.left+2,r.bottom-2],
                 [r.right-2,r.bottom-2],[(r.left+r.right)/2,(r.top+r.bottom)/2]];
      let ok=0; pts.forEach(function(p){ const e=document.elementFromPoint(p[0],p[1]);
        if (e && (e===b || b.contains(e))) ok++ });
      /* El area EXTENDIDA por el ::after: el rect NO la ve. Se busca hasta donde
         elementFromPoint sigue devolviendo el propio boton, en los cuatro sentidos. */
      const al=function(dx,dy){ let n=0; for (let k=1;k<=40;k++){
        const e=document.elementFromPoint(r.left+r.width/2+dx*k, r.top+r.height/2+dy*k);
        if (!(e && (e===b || b.contains(e)))) break; n=k } return n };
      out.push(Math.round(r.width)+'x'+Math.round(r.height)+' area='+
               (al(-1,0)+al(1,0))+'x'+(al(0,-1)+al(0,1))+' '+ok+'/5');
    });
    return out.join(' | ');
  })();

  /* ── AJ1-3 · el EN SUMA con la bicuspide ─────────────────────────────────────────────── */
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch(e){}
  pon('va_morf','Bic\\u00faspide'); pon('vab_tipo','fused_rl'); pon('vab_rafe','si');
  pon('vab_simetria','simetrica'); pon('ao_sin','43'); pon('peso','70'); pon('talla','170');
  pon('sexo','M');
  await esperar(500);
  try { if (typeof setEstiloInforme === 'function') setEstiloInforme('estandar') } catch(e){}
  try { if (typeof generarInforme === 'function') generarInforme() } catch(e){}
  o.suma = (function(){ const e=document.getElementById('en_suma'); return e ? String(e.value||'').slice(0,200) : 'NO EXISTE' })();

  /* ── AJ1-4 · el ⓘ del TRIV, que es donde entra el texto nuevo ────────────────────────── */
  try { showTab('vd') } catch(e) {}
  await esperar(300);
  /* El ⓘ del TRIV: se lee del REGISTRO y no clickeando el boton. Clickearlo abre una tarjeta
     flotante cuya clase cambio de nombre entre tandas, y la primera version devolvia null en
     los DOS arboles -o sea un denominador vacio-. Lo que esta sonda tiene que confirmar es que
     el texto nuevo esta en los dos motores; que la tarjeta ENTRA en la pantalla lo mide
     _vInfoColocar, que la TANDA NOCTURNA ya arreglo y no se toco. */
  o.globoTriv = (function(){
    try {
      const e = (typeof VINFO !== 'undefined') ? VINFO['vd-triv'] : null;
      if (!e) return 'SIN ENTRADA';
      const t = String(e.lee || '');
      const btn = document.querySelector('.vinfo-btn[data-vinfo=vd-triv]');
      const r = btn ? btn.getBoundingClientRect() : null;
      return { boton: r ? (Math.round(r.width) + 'x' + Math.round(r.height)) : 'SIN BOTON',
               rotulo: t.indexOf('respaldado en parte por la ASE 2025') > -1,
               folios: t.indexOf('folio 165') > -1 && t.indexOf('164') > -1,
               matiz: t.indexOf('falla significativa del ventr') > -1,
               viejo: t.indexOf('sin fuente verificada') > -1,
               n: t.length };
    } catch (x) { return 'EXC ' + String(x).slice(0, 60) }
  })();

  /* ── ESCRIBIR NO SE TIENE QUE VOLVER MAS LENTO ───────────────────────────────────────── */
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

  /* ── LO DE SIEMPRE ───────────────────────────────────────────────────────────────────── */
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
