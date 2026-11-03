/*
 * _probe_pant6teer.mjs - los criterios TEER lado a lado (PANT-6, commit 5).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *   node scripts/_probe_pant6teer.mjs --file <index.html>
 * Mide, a los cuatro anchos y con tres tipos de IM: la maqueta, la franja rosada, los dibujos,
 * las sincronias en los dos sentidos, el veredicto y la geometria.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const FILE = arg('--file') || (RAIZ + '/index.html');
const ANCHOS = [1440, 1000, 768, 390];
const TIPOS = ['', 'primaria', 'secundaria'];
/* Los ids REALES, censados sobre el marcado: la primera version de esta lista invento cinco
   nombres -teer_psap, teer_long_coapt, teer_dsfvi, teer_calcif, teer_trombo_ai- y la sonda
   informaba falta=5 sobre campos que si existen con otro id. */
const CAMPOS = ['teer_tipo_im','teer_area_mitral','teer_pasp','teer_flail_gap','teer_ancho_flail',
  'teer_prof_flail','teer_gap','teer_fevi','teer_dtsvi','teer_lva','teer_lvp',
  'teer_calcificacion','teer_clefts','teer_trombo'];

const JS = (tipo) => `(async () => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  const o = {};
  try { showTab('ete') } catch (e) { o.tabErr = String(e) }
  (function(){ const h = document.querySelector('[onclick*="toggleEteSeccion(\\'teer\\'"]');
    const s = document.getElementById('ete-seccion-teer');
    if (s && getComputedStyle(s).display === 'none' && h) h.click(); })();
  await new Promise(r => setTimeout(r, 140));
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles:true }));
    e.dispatchEvent(new Event('change', { bubbles:true })); return e.value };
  /* El denominador: la seccion cargada con datos de los dos tipos, que es la unica forma de que
     los dibujos y el veredicto existan. */
  if (${JSON.stringify(tipo)}) S('teer_tipo_im', ${JSON.stringify(tipo)});
  S('teer_flail_gap','6'); S('teer_ancho_flail','11');
  S('teer_prof_flail','8'); S('teer_gap','4');
  S('teer_fevi','40'); S('teer_dtsvi','58'); S('teer_area_mitral','4.4'); S('teer_pasp','55');
  try { calcTEER() } catch (e) { o.calcErr = String(e) }
  await new Promise(r => setTimeout(r, 120));
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10,
             x: Math.round(r.x*10)/10, y: Math.round(r.y*10)/10 } };
  const vis = (id) => { const e = document.getElementById(id);
    return e ? getComputedStyle(e).display !== 'none' : null };
  /* LA FRANJA ROSADA: existe, se ve, y QUE DICE. */
  const av = document.getElementById('teer-tipo-aviso');
  o.franjaVis = av ? getComputedStyle(av).display !== 'none' : 'NO EXISTE';
  o.franjaTxt = av ? (av.textContent||'').replace(/\\s+/g,' ').trim() : '';
  o.franjaChars = o.franjaTxt.length;
  o.franjaCaja = R(av);
  o.franjaBorde = av ? getComputedStyle(av).borderLeftWidth + ' ' + getComputedStyle(av).borderLeftColor : '';
  /* LA MAQUETA: la franja de arriba, los dos cuadros y los dos de abajo. */
  const cols = (id) => { const g = document.getElementById(id); if (!g) return null;
    return getComputedStyle(g).gridTemplateColumns.split(' ').filter(Boolean).length };
  o.arriba = cols('teer-arriba'); o.medio = cols('teer-medio');
  o.abajo = cols('teer-abajo'); o.comunesCols = cols('teer-comunes-cols');
  o.pri = R(document.getElementById('teer-bloque-primaria'));
  o.sec = R(document.getElementById('teer-bloque-secundaria'));
  o.visPri = vis('teer-bloque-primaria'); o.visSec = vis('teer-bloque-secundaria');
  o.ladoALado = (o.pri && o.sec && o.visPri && o.visSec) ?
    (Math.abs(o.pri.y - o.sec.y) < 20 && o.pri.x < o.sec.x) : null;
  o.igualAlto = (o.pri && o.sec && o.visPri && o.visSec) ? (Math.abs(o.pri.h - o.sec.h) < 2) : null;
  o.igualAncho = (o.pri && o.sec && o.visPri && o.visSec) ? (Math.abs(o.pri.w - o.sec.w) < 2) : null;
  /* Los CUATRO dibujos y su ancho. */
  o.figs = Array.prototype.slice.call(document.querySelectorAll('#ete-seccion-teer .teer-fig'))
    .map(function(f){ const r = f.getBoundingClientRect();
      return f.id + ':' + Math.round(r.width) + 'x' + Math.round(r.height) });
  /* TODOS los campos: existen y estan HABILITADOS. */
  o.falta = ${JSON.stringify(CAMPOS)}.filter(function(id){ return !document.getElementById(id) });
  o.deshab = ${JSON.stringify(CAMPOS)}.filter(function(id){ const e = document.getElementById(id);
    return e && (e.disabled || getComputedStyle(e).opacity === '0.5') });
  o.ocultos = ${JSON.stringify(CAMPOS)}.filter(function(id){ const e = document.getElementById(id);
    return e && e.getBoundingClientRect().width === 0 });
  /* EL VEREDICTO y la tarjeta de criterios. */
  o.veredicto = ((document.getElementById('teer-resultado')||{}).textContent||'').trim();
  o.notas = ((document.getElementById('teer-notas')||{}).textContent||'').trim().slice(0,60);
  o.critFilas = document.querySelectorAll('#ete-seccion-teer .calc-box .calc-row').length;
  o.crit = R(document.getElementById('teer-concl'));
  /* LAS SINCRONIAS, una por una y en los DOS sentidos. */
  o.sinc = {};
  S('ete_lva','27'); try { etemVeloGesto('ete_lva') } catch (e) {}
  o.sinc.lvaEteATeer = (document.getElementById('teer_lva')||{}).value;
  S('teer_lvp','8'); try { etemVeloGesto('teer_lvp') } catch (e) {}
  o.sinc.lvpTeerAEte = (document.getElementById('ete_lvp')||{}).value;
  S('avm_plan','4.8'); try { sincronizarTEERDesdeGlobal() } catch (e) {}
  o.sinc.areaValv = (document.getElementById('teer_area_mitral')||{}).value;
  S('fevi','38'); try { sincronizarTEERDesdeGlobal() } catch (e) {}
  o.sinc.fevi = (document.getElementById('teer_fevi')||{}).value;
  S('dsfvi','61'); try { sincronizarTEERDesdeGlobal() } catch (e) {}
  o.sinc.dsfvi = (document.getElementById('teer_dtsvi')||{}).value;
  S('psap_calc','62'); try { sincronizarTEERDesdeGlobal() } catch (e) {}
  o.sinc.psap = (document.getElementById('teer_pasp')||{}).value;
  /* geometria */
  o.scrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  o.recortados = Array.prototype.slice.call(document.querySelectorAll('#ete-seccion-teer label, #ete-seccion-teer .calc-lbl'))
    .filter(function(e){ return e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0 })
    .map(function(e){ return (e.textContent||'').trim().slice(0,24) });
  o.secTeer = R(document.querySelector('#ete-seccion-teer .card-body'));
  return o;
})()`;

const nav = await _pw.chromium.launch({ channel: 'chrome' });
for (const w of ANCHOS) {
  for (const t of TIPOS) {
    const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
    const pg = await ctx.newPage();
    const errs = []; pg.on('pageerror', e => errs.push(String(e).slice(0, 110)));
    try {
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
      await pg.waitForTimeout(1100);
      const a = await Promise.race([pg.evaluate(JS(t)),
        new Promise((_, rj) => setTimeout(() => rj(new Error('timeout')), 60000))]);
      console.log(String(w).padStart(4) + ' ' + (t || '(sin tipo)').padEnd(11) +
        ' | sec ' + (a.secTeer ? a.secTeer.w + 'x' + a.secTeer.h : '-') +
        ' | franja vis=' + a.franjaVis + ' chars=' + a.franjaChars + ' caja=' + (a.franjaCaja ? a.franjaCaja.w+'x'+a.franjaCaja.h : '-') +
        ' borde="' + a.franjaBorde + '"' +
        ' | cols a/m/ab/com=' + a.arriba + '/' + a.medio + '/' + a.abajo + '/' + a.comunesCols +
        ' | pri ' + (a.pri ? a.pri.w+'x'+a.pri.h : '-') + ' sec2 ' + (a.sec ? a.sec.w+'x'+a.sec.h : '-') +
        ' vis=' + a.visPri + '/' + a.visSec + ' lado=' + a.ladoALado + ' igualW=' + a.igualAncho + ' igualH=' + a.igualAlto +
        ' | figs=' + a.figs.length +
        ' | falta=' + a.falta.length + ' deshab=' + a.deshab.length + ' ocultos=' + a.ocultos.length +
        (a.ocultos.length?JSON.stringify(a.ocultos):'') +
        ' | veredicto="' + a.veredicto.slice(0,30) + '" critFilas=' + a.critFilas +
        ' | sinc=' + JSON.stringify(a.sinc) +
        ' | recort=' + a.recortados.length + ' scrollX=' + a.scrollX + ' | err ' + errs.length + ' ' + (errs[0]||''));
      if (w === 1440 && t === 'primaria') console.log('      FIGS: ' + JSON.stringify(a.figs) + ' franjaTxt="' + a.franjaTxt + '"');
    } catch (e) { console.log(w + ' ' + t + ' ERROR ' + String(e).slice(0, 170)) }
    await ctx.close();
  }
}
await nav.close();
