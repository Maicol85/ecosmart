#!/usr/bin/env node
/**
 * _probe_valppt_dib.mjs - calcado de _probe_popc_dibujo.mjs, con las escenas de los
 * tres simbolos nuevos de VAL-PPT-4. ORIGINAL: el dibujo del posoperatorio (POP-C, commits 6 a 9).
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

/* ══ ESCENAS DE LA TANDA VAL-PPT, commit 4 ══════════════════════════════════
   Los TRES simbolos nuevos, cada uno en su valvula, con la casilla de esa valvula marcada y la
   cirugia valvular encendida -sin eso el recuadro no existe y el simbolo no se dibuja-.
   ⚠️ EL TIPO SE PONE EN LA MORFOLOGIA DE VALVULAS, que es el dueño: ponerlo en el selector del
   posoperatorio tambien funciona -son dos puertas- pero el dueño es el camino corto.
   Y las escenas de CRUCE con un chorro y con un cateter, que es donde se mide que los simbolos
   nuevos no se superponen con lo que ya habia. */
const ESC = {
  vpPlaMi:  { fc:'80', s:{ vm_morf:'Plastia mitral' },              chk:['pop_cx_valv','pop_cx_v_mi'] },
  vpTeerMi: { fc:'80', s:{ vm_morf:'TEER mitral' },                 chk:['pop_cx_valv','pop_cx_v_mi'] },
  vpPlaTr:  { fc:'80', s:{ vt_morf:'Plastia tricuspídea' },         chk:['pop_cx_valv','pop_cx_v_tr'] },
  vpTeerTr: { fc:'80', s:{ vt_morf:'TEER tricuspídeo (T-TEER)' },   chk:['pop_cx_valv','pop_cx_v_tr'] },
  vpTavi:   { fc:'80', s:{ va_morf:'TAVI' },                        chk:['pop_cx_valv','pop_cx_v_ao'] },
  /* Los cuatro a la vez, que es donde los simbolos pueden pisarse entre si. */
  vpCuatro: { fc:'80', s:{ vm_morf:'TEER mitral', vt_morf:'Plastia tricuspídea', va_morf:'TAVI',
                           vp_morf:'Prótesis biológica' },
              chk:['pop_cx_valv','pop_cx_v_mi','pop_cx_v_tr','pop_cx_v_ao','pop_cx_v_pu'] },
  /* Con CHORROS y con CATETER encima, que es el cruce que el pedido pide verificar. */
  vpConJet: { fc:'80', s:{ vm_morf:'TEER mitral', vt_morf:'Plastia tricuspídea' },
              g:{ im_grado:'4', it_grado:'2' }, chk:['pop_cx_valv','pop_cx_v_mi','pop_cx_v_tr'] },
  vpConCat: { fc:'80', mon:'swan', s:{ va_morf:'TAVI', vm_morf:'Plastia mitral' },
              chk:['pop_cx_valv','pop_cx_v_ao','pop_cx_v_mi'] },
  vpTodo:   { fc:'80', mon:'swan', asis:'bcia',
              s:{ vm_morf:'TEER mitral', vt_morf:'TEER tricuspídeo (T-TEER)', va_morf:'TAVI' },
              g:{ im_grado:'3', it_grado:'4', ia_grado:'2' },
              chk:['pop_cx_valv','pop_cx_v_mi','pop_cx_v_tr','pop_cx_v_ao'] },
  /* SIN frecuencia: el simbolo tiene que quedar quieto y cerrado. */
  vpSinFc:  { s:{ vm_morf:'TEER mitral' }, chk:['pop_cx_valv','pop_cx_v_mi'] },
  /* CONTROL NEGATIVO: la misma casilla marcada y la morfologia en su valor de fabrica. */
  vpNeutro: { fc:'80', chk:['pop_cx_valv','pop_cx_v_mi'] },
  /* Y el control de que una morfologia NATIVA tampoco dibuja un simbolo. */
  vpNativa: { fc:'80', s:{ vm_morf:'Mixomatosa / Barlow' }, chk:['pop_cx_valv','pop_cx_v_mi'] },
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
  cavSepNo: { fc:'80', s:{ tep_tabique_d:'no' } },
  cavSepSi: { fc:'80', s:{ tep_tabique_d:'si' } },
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
  R.globoRx = { min: 99, max: 0 };
  for (let s2 = 0; s2 < 110; s2++) {
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
    { const sg2 = svg.querySelector('[data-pop-esq="cat-swan"] ellipse');
      if (sg2 && sg2.getClientRects().length) {
        const rx = parseFloat(sg2.getAttribute('rx') || '0');
        R.globoRx.min = Math.min(R.globoRx.min, rx); R.globoRx.max = Math.max(R.globoRx.max, rx);
      } }
    await W(40);
  }

  /* 7 · LOS CATETERES, y su CRUCE con lo que no deben pisar. La orden pide que no se
     superpongan con la aorta, el balon ni la asistencia (ECMO, Impella). Se cruzan las cajas
     YA transformadas -getBoundingClientRect, no getBBox: sobre un <g> ese devuelve
     coordenadas LOCALES y reporta solapes que no existen, que es lo que POP-B pago-. */
  R.cat = { swan: on('cat-swan'), picco: on('cat-picco'), cruces: [], globo: null };
  { const bal = svg.querySelector('[data-pop-esq="balon"]');
    if (bal) R.cat.balonRx = bal.getAttribute('rx');
    const sg = svg.querySelector('[data-pop-esq="cat-swan"] ellipse');
    if (sg && sg.getClientRects().length) R.cat.globo = [sg.getAttribute('rx'), sg.getAttribute('ry')];
    const caja = el => { if (!el || !el.getClientRects().length) return null;
      const b = el.getBoundingClientRect(); return { x:b.x, y:b.y, w:b.width, h:b.height } };
    const cruza = (a, b2) => { if (!a || !b2) return 0;
      const ix = Math.max(0, Math.min(a.x+a.w, b2.x+b2.w) - Math.max(a.x, b2.x));
      const iy = Math.max(0, Math.min(a.y+a.h, b2.y+b2.h) - Math.max(a.y, b2.y));
      return Math.round(ix * iy) };
    /* se comparan los TRAZOS del cateter uno por uno, no el grupo entero: el grupo abarca una
       caja enorme que toca todo y no diria nada */
    const trazos = [];
    ['cat-swan','cat-picco'].forEach(k => {
      const g = svg.querySelector('[data-pop-esq="' + k + '"]');
      if (!g || !g.getClientRects().length) return;
      Array.prototype.forEach.call(g.querySelectorAll('path,ellipse'), (el, i) => {
        trazos.push([k + '#' + i, caja(el)]);
      });
    });
    [['aorta', svg.querySelector('[data-pop-esq="ao"]')],
     ['balon', bal],
     ['ecmova', svg.querySelector('[data-pop-esq="ecmova"]')],
     ['ecmovv', svg.querySelector('[data-pop-esq="ecmovv"]')],
     ['impella', svg.querySelector('[data-pop-esq="impella"]')]].forEach(o => {
      const cb = caja(o[1]); if (!cb) return;
      trazos.forEach(t => { const a2 = cruza(t[1], cb);
        if (a2 > 0) R.cat.cruces.push(t[0] + ' x ' + o[0] + ' = ' + a2) });
    });
  }

  /* 8 · LAS CAVIDADES. ⚠️ SUS RECTS NO LLEVAN data-pop-esq, asi que buscarlos por marca
     daba null en TODAS las escenas —un denominador vacio que se lee como «no cambia»—. Se
     le pregunta al DUENO, _popEsqGeo, que es quien decide el factor de cada una, y ademas
     se leen los cuatro rects renderizados: son los unicos con rx=10, en orden AD, AI, VD, VI. */
  R.cav = {};
  try {
    const dd = popEsquema(), gg = _popEsqGeo(dd);
    R.cav.factores = { AD:+gg.sAD.toFixed(3), AI:+gg.sAI.toFixed(3),
                       VD:+gg.sVD.toFixed(3), VI:+gg.sVI.toFixed(3) };
    R.cav.amp = { VI:+gg.ampVI.toFixed(3), VD:+gg.ampVD.toFixed(3) };
    R.cav.bulge = +gg.bulge.toFixed(2);
    R.anillo = { w: gg.eff, hayDerrame: dd.hayDerrame, compresion: dd.compresion };
  } catch (x) { R.cav.err = String(x).slice(0,90); R.anillo = null }
  { const rs = Array.prototype.filter.call(svg.querySelectorAll('rect'),
      r2 => r2.getAttribute('rx') === '10');
    R.cav.rects = rs.slice(0,4).map(r2 =>
      Math.round(+r2.getAttribute('width')) + 'x' + Math.round(+r2.getAttribute('height')));
    const eo = Array.prototype.filter.call(svg.querySelectorAll('rect'),
      r2 => r2.getAttribute('x') === '248' && r2.getAttribute('y') === '92')[0];
    if (eo && R.anillo) R.anillo.trazoReal = eo.getAttribute('stroke-width'); }

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
    console.log('   chorros (110 muestras (4,4 s: cubre el ciclo de 4 s del globo)): ' + ['im','it','ia','ip'].map(x => {
      const j = R.jets[x];
      return x + '=' + j.n + '/110' + (j.n ? ' area' + j.areaMax + ' op' + j.opMax.toFixed(2) : '');
    }).join('  '));
    console.log('   grados leidos: ' + JSON.stringify(R.gradoLeido));
    console.log('   cateter : swan=' + R.cat.swan + ' picco=' + R.cat.picco
      + '  globo rx ' + (R.globoRx.max ? R.globoRx.min.toFixed(2) + ' a ' + R.globoRx.max.toFixed(2) : 'sin globo')
      + '  CRUCES=' + R.cat.cruces.length
      + (R.cat.cruces.length ? ' -> ' + R.cat.cruces.slice(0,4).join(' | ') : ''));
    console.log('   cavidad : factores ' + JSON.stringify(R.cav.factores)
      + '  bulge=' + R.cav.bulge + '  rects ' + JSON.stringify(R.cav.rects) + (R.cav.err ? '  ERR ' + R.cav.err : ''));
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
