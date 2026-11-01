#!/usr/bin/env node
/**
 * _probe_popc_dibujo.mjs - el dibujo del posoperatorio (POP-C, commits 6 a 9).
 *
 * Mide, sobre el SVG real y con los datos cargados por gestos:
 *   6 - los chorros: existencia por grado, tamano creciente, sincronia con la fase, el texto
 *       del esquema, y que SIN grado no hay chorro.
 *   7 - los cateteres del Swan y del PiCCO, con el cruce de cajas contra la aorta, el balon y
 *       la asistencia.
 *   8 - el tamano de las cavidades y el anillo del derrame por grado.
 *   9 - los trazados de TAPSE y de E/A.
 * Y SIEMPRE: el censo de nodos, los textos que se superponen (cruzando todos los pares con
 * getBoundingClientRect, que es la caja YA transformada) y lo que se sale del viewBox.
 *
 *   node scripts/_probe_popc_dibujo.mjs [--file <html>] [--solo a,b]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const ESC = {
  /* ── commit 6 · los chorros ── */
  jetNada:  { fc:'80' },
  jetImLev: { fc:'80', g:{ im_grado:'1' } },
  jetImMod: { fc:'80', g:{ im_grado:'2' } },
  jetImSev: { fc:'80', g:{ im_grado:'4' } },
  jetImMS:  { fc:'80', g:{ im_grado:'3' } },
  jetCuatro:{ fc:'80', g:{ im_grado:'4', it_grado:'2', ia_grado:'1', ip_grado:'Moderada' } },
  jetSinFc: { g:{ im_grado:'4' } },
  jetSinOp: { fc:'80', g:{ it_grado:'4' } },
  jetIP:    { fc:'80', g:{ ip_grado:'Severa' } },   /* insuficiencia SIN la valvula operada marcada */
  jetConOp: { fc:'80', g:{ it_grado:'4' }, chk:['pop_cx_valv','pop_cx_v_tr'] },
  /* ── commit 7 · los cateteres ── */
  catNada:  { fc:'80' },
  catSwan:  { fc:'80', mon:'swan' },
  catPicco: { fc:'80', mon:'picco' },
  catSwanBal:{ fc:'80', mon:'swan', asis:'bcia' },
  catSwanEc:{ fc:'80', mon:'swan', asis:'ecmo_va' },
  catSwanImp:{ fc:'80', mon:'swan', asis:'impella' },
  catPiccoEc:{ fc:'80', mon:'picco', asis:'ecmo_va' },
  /* ── commit 8 · cavidades y anillo ── */
  cavNada:  { fc:'80' },
  cavFevi:  { fc:'80', c:{ fevi:'25' } },
  cavTapse: { fc:'80', c:{ tapse:'10' } },
  cavAI:    { fc:'80', c:{ ai_vol:'55' } },
  cavAD:    { fc:'80', c:{ ad_area:'22' } },
  periLev:  { fc:'80', s:{ pericardio:'Derrame leve (<10mm)' } },
  periMod:  { fc:'80', s:{ pericardio:'Derrame moderado (10-20mm)' } },
  periSev:  { fc:'80', s:{ pericardio:'Derrame severo (>20mm)' } },
  periComp: { fc:'80', s:{ pericardio:'Derrame severo (>20mm)', pericardio_hemo:'si' } },
  /* ── commit 9 · los trazados ── */
  trzNada:  { fc:'80' },
  trzTapse: { fc:'80', c:{ tapse:'18' } },
  trzEA:    { fc:'80', c:{ onda_e:'90', onda_a:'60' } },
  trzTodo:  { fc:'80', c:{ tapse:'18', onda_e:'90', onda_a:'60' } }
};

const CUERPO = `(async (e) => {
  const R = { errs: [] };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
                  x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const W = ms => new Promise(r => setTimeout(r, ms));
  const S = (id, v) => { const el = EL(id); if (!el) { R.errs.push('NO EXISTE ' + id); return }
    el.value = v; el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true})) };
  const C = (id, o) => { const el = EL(id); if (!el) { R.errs.push('NO EXISTE ' + id); return }
    el.checked = o; el.dispatchEvent(new Event('change',{bubbles:true})) };

  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (x) {}
  const bt = bq('showTab(' + Q + 'hemodinamica'); if (bt) bt.click(); await W(300);
  const sec = EL('pop-seccion');
  const abierta = () => !!(sec && sec.offsetParent && sec.getBoundingClientRect().height > 100);
  if (!abierta()) { const ba = bq('toggleCard(' + Q + 'pop-seccion'); if (ba) ba.click(); }
  await W(400);
  R.denomAbierta = abierta();
  S('peso','70'); S('talla','170');
  if (e.fc) S('hemo_fc', e.fc);
  if (e.mon) { S('pop_monitor', e.mon); await W(200);
    if (e.mon === 'swan') { S('pop_sw_gc','4'); S('pop_sw_pam','78'); S('pop_sw_pad','10') }
    if (e.mon === 'picco') { S('pop_picco_gc','4'); S('pop_picco_ic','2.4') } }
  if (e.asis) S('pop_asistencia', e.asis);
  Object.keys(e.g || {}).forEach(k => S(k, e.g[k]));
  Object.keys(e.c || {}).forEach(k => S(k, e.c[k]));
  Object.keys(e.s || {}).forEach(k => S(k, e.s[k]));
  (e.chk || []).forEach(id => C(id, true));
  await W(500);
  /* ADVERTENCIA MEDIDA: EL BUCLE DEL DIBUJO SE APAGA CUANDO EL DIBUJO NO SE VE —lo apaga su
     IntersectionObserver— y el esquema cae en y~2000. Sin este scroll los chorros, el latido de
     las valvulas y los trazados se leen SIEMPRE apagados, que es un denominador vacio: la
     primera corrida dio los cuatro chorros en «off» con los grados cargados. Es la trampa que
     POP-B ya documento. */
  { const sv0 = EL('pop-esq-svg'); if (sv0) sv0.scrollIntoView({ block:'center' }); }
  await W(900);

  const svg = EL('pop-esq-svg');
  if (!svg) { R.sinSvg = true; return R }
  R.viewBox = svg.getAttribute('viewBox');
  const vb = String(R.viewBox || '0 0 600 496').split(' ').map(Number);

  /* CENSO de nodos marcados, con su display efectivo. */
  R.nodos = Array.prototype.map.call(svg.querySelectorAll('[data-pop-esq]'), n => {
    const vis = !!n.getClientRects().length;
    return n.getAttribute('data-pop-esq') + (vis ? '/on' : '/off');
  });
  const on = m => R.nodos.indexOf(m + '/on') >= 0;

  /* 6 · LOS CHORROS. ⚠️ SON PULSATILES: la mitral y la tricuspide solo se dibujan en SISTOLE
     y la aortica y la pulmonar en DIASTOLE, asi que una foto cae en un instante al azar del
     ciclo y los lee prendidos o apagados sin que eso diga nada. Se MUESTREA el ciclo: 40
     fotos en 1,6 s —con FC 80 son algo mas de dos ciclos— y se registra en cuantas aparece
     cada uno y su area MAXIMA. Eso mide las dos cosas a la vez: el tamano por grado y la
     SINCRONIA, porque la fraccion del ciclo en que aparece es distinta para cada familia. */
  R.jets = {};
  R.gradoLeido = {};
  ['im','it','ia','ip'].forEach(k => { R.jets[k] = { n:0, areaMax:0, opMax:0, existe:false } });
  [['im','im_grado'],['it','it_grado'],['ia','ia_grado'],['ip','ip_grado']].forEach(x => {
    const el = EL(x[1]); R.gradoLeido[x[1]] = el ? String(el.value) : 'NO EXISTE';
  });
  for (let s2 = 0; s2 < 40; s2++) {
    ['im','it','ia','ip'].forEach(k => {
      const g = svg.querySelector('[data-pop-esq="jet-' + k + '"]');
      if (!g) return;
      R.jets[k].existe = true;
      if (!g.getClientRects().length) return;
      R.jets[k].n++;
      const p = g.querySelector('path');
      let bb = null; try { bb = p ? p.getBBox() : null } catch (x) {}
      if (bb) R.jets[k].areaMax = Math.max(R.jets[k].areaMax, Math.round(bb.width * bb.height));
      R.jets[k].opMax = Math.max(R.jets[k].opMax, parseFloat(g.getAttribute('opacity') || '0'));
    });
    await W(40);
  }

  /* 7 · LOS CATETERES */
  R.cat = { swan: on('cat-swan'), picco: on('cat-picco') };

  /* 8 · LAS CAVIDADES, por su caja; y el anillo del derrame, por su grosor. */
  R.cav = {};
  ['AD','AI','VD','VI'].forEach(k => {
    const r = svg.querySelector('[data-pop-esq="caja-' + k + '"]') ||
              svg.querySelector('[data-pop-esq="r' + k + '"]');
    R.cav[k] = r ? [Math.round(+r.getAttribute('width')), Math.round(+r.getAttribute('height'))] : null;
  });
  { const pr = svg.querySelector('[data-pop-esq="peri"]') || svg.querySelector('[data-pop-esq="peri-r"]');
    R.anillo = pr ? { w: pr.getAttribute('stroke-width'), vis: !!pr.getClientRects().length } : null; }

  /* 9 · LOS TRAZADOS */
  R.trz = { tapse: on('trz-tapse'), ea: on('trz-ea') };

  /* TEXTOS que se superponen y que se salen del lienzo. Se usa getBoundingClientRect, que es
     la caja YA transformada: getBBox sobre un <g> devuelve coordenadas LOCALES, o sea antes de
     su transform, y reporta superposiciones que no existen (lo pago POP-B). */
  const ts = Array.prototype.filter.call(svg.querySelectorAll('text'), t => t.getClientRects().length
    && String(t.textContent || '').trim());
  R.nTextos = ts.length;
  const rc = ts.map(t => { const b = t.getBoundingClientRect();
    return { t: String(t.textContent).slice(0,26), x:b.x, y:b.y, w:b.width, h:b.height } });
  R.sup = [];
  for (let i = 0; i < rc.length; i++) for (let j = i+1; j < rc.length; j++) {
    const a = rc[i], b = rc[j];
    const ix = Math.max(0, Math.min(a.x+a.w, b.x+b.w) - Math.max(a.x, b.x));
    const iy = Math.max(0, Math.min(a.y+a.h, b.y+b.h) - Math.max(a.y, b.y));
    if (ix > 0.5 && iy > 0.5) R.sup.push(a.t + ' x ' + b.t + ' = ' + Math.round(ix) + 'x' + Math.round(iy));
  }
  /* Fuera del viewBox, en coordenadas del SVG. */
  R.fuera = [];
  Array.prototype.forEach.call(svg.querySelectorAll('text,path,rect,circle,ellipse,line'), n => {
    if (!n.getClientRects().length) return;
    let b = null; try { b = n.getBBox() } catch (x) { return }
    if (!b || (!b.width && !b.height)) return;
    const g = n.ownerSVGElement ? n.getCTM() : null;
    if (!g) return;
    const x0 = g.a * b.x + g.c * b.y + g.e, y0 = g.b * b.x + g.d * b.y + g.f;
    const x1 = g.a * (b.x+b.width) + g.c * (b.y+b.height) + g.e;
    const y1 = g.b * (b.x+b.width) + g.d * (b.y+b.height) + g.f;
    const mnx = Math.min(x0,x1), mxx = Math.max(x0,x1), mny = Math.min(y0,y1), mxy = Math.max(y0,y1);
    if (mnx < vb[0]-1 || mny < vb[1]-1 || mxx > vb[0]+vb[2]+1 || mxy > vb[1]+vb[3]+1)
      R.fuera.push((n.getAttribute('data-pop-esq') || n.tagName) + ' ' +
        [mnx,mny,mxx,mxy].map(v => Math.round(v)).join(','));
  });

  /* EL TEXTO del esquema, que es el equivalente legible del dibujo. */
  const tx = EL('pop-esq-txt');
  R.texto = tx ? String(tx.textContent || '').replace(/\\s+/g,' ') : 'NO HAY NODO';
  R.textoInsuf = (() => { const i = R.texto.indexOf('Insuficiencias valvulares');
    return i < 0 ? '(sin fila)' : R.texto.slice(i, i + 170) })();
  return R;
})`;

(async () => {
  const solo = (arg('--solo') || Object.keys(ESC).join(',')).split(',').map(s => s.trim());
  const b = await _pw.chromium.launch({ channel: 'chrome', headless: true });
  const pg = await b.newPage({ viewport: { width: 1440, height: 1200 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()) });
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(2500);
  console.log('===== EL DIBUJO DEL POSOPERATORIO (POP-C 6 a 9) =====');
  console.log('archivo:', FILE);
  let totSup = 0, totFuera = 0, n = 0;
  for (const k of solo) {
    if (!ESC[k]) continue;
    let R;
    try {
      R = await Promise.race([ pg.evaluate(new Function('return ' + CUERPO)(), ESC[k]),
        new Promise((_, rj) => setTimeout(() => rj(new Error('TIMEOUT')), 60000)) ]);
    } catch (e) { console.log('\n== ' + k + ' == FALLO: ' + e.message); continue }
    n++;
    totSup += (R.sup || []).length; totFuera += (R.fuera || []).length;
    console.log('\n== ' + k + ' ==  (seccion abierta: ' + R.denomAbierta + ', ' + R.nTextos + ' textos)');
    if (R.sinSvg) { console.log('   SIN SVG'); continue }
    console.log('   chorros (40 muestras del ciclo): ' + ['im','it','ia','ip'].map(x => {
      const j = R.jets[x];
      return x + '=' + j.n + '/40' + (j.n ? ' area' + j.areaMax + ' op' + j.opMax.toFixed(2) : '');
    }).join('  '));
    console.log('   grados leidos: ' + JSON.stringify(R.gradoLeido));
    console.log('   cateter : swan=' + R.cat.swan + ' picco=' + R.cat.picco);
    console.log('   cavidad : ' + Object.keys(R.cav).map(x => x + '=' + (R.cav[x] ? R.cav[x].join('x') : '-')).join(' '));
    console.log('   anillo  : ' + JSON.stringify(R.anillo));
    console.log('   trazados: tapse=' + R.trz.tapse + ' ea=' + R.trz.ea);
    console.log('   SUPERPUESTOS: ' + R.sup.length + '   FUERA DEL viewBox: ' + R.fuera.length);
    if (R.sup.length) R.sup.slice(0,4).forEach(s => console.log('      sup: ' + s));
    if (R.fuera.length) R.fuera.slice(0,4).forEach(s => console.log('      fuera: ' + s));
    console.log('   texto   : ' + R.textoInsuf);
    if (R.errs && R.errs.length) console.log('   errs: ' + R.errs.slice(0,3).join(' ; '));
  }
  console.log('\n===== TOTAL: ' + n + ' escenas · SUPERPUESTOS ' + totSup + ' · FUERA ' + totFuera + ' =====');
  console.log('errores de pagina: ' + errs.length + (errs.length ? ' -> ' + errs.slice(0,4).join(' ; ') : ''));
  await b.close();
  process.exit(0);
})();
