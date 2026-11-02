#!/usr/bin/env node
/**
 * _probe_correvid_panel.mjs - el panel de Evidencia de congenitas, escenario por escenario.
 *
 * Mide: que las preguntas del escenario cargado se dibujen con su guia VISIBLE; que ninguna
 * mezcle cortes de las dos (regla E-1); que la linea de referencia de la otra guia aparezca
 * donde corresponde (E-2); los TRES estados; y el CONTROL DEL PAPEL, que es la condicion de la
 * orden: ni una frase de las recomendaciones llega al informe, al EN SUMA ni a la capsula.
 *
 * ⚠️ DENOMINADOR: el panel se arma llamando a la funcion de la seccion, no abriendo el modal,
 * asi que hay que confirmar que DEVUELVE algo -null significa «la compuerta no se abrio» y un
 * cero sobre null no distingue «no mezcla guias» de «no hay panel»-.
 *
 *   node scripts/_probe_correvid_panel.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || process.cwd() + '/index.html';

const CUERPO = `(async (e) => {
  const R = { errs: [] };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const W = ms => new Promise(r => setTimeout(r, ms));
  const S = (id, v) => { const el = EL(id); if (!el) { R.errs.push('NO EXISTE ' + id); return }
    el.value = v; el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true})) };
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (x) {}
  try { if (typeof _indClinVaciar === 'function') _indClinVaciar() } catch (x) {}
  await W(250);
  S('peso','70'); S('talla','170');
  Object.keys(e.s || {}).forEach(k => S(k, e.s[k]));
  await W(600);
  const fn = window['_ind' + e.sec];
  if (typeof fn !== 'function') { R.sinFn = true; return R }
  let P = null; try { P = fn() } catch (x) { R.errs.push('fn: ' + x); return R }
  R.hayPanel = !!P;
  if (!P) return R;
  R.nFilas = (P.filas || []).length;
  R.nPreg  = (P.clinica || []).length;
  R.preguntas = (P.clinica || []).map(f => ({ lbl: String(f.lbl || '').slice(0, 95),
    nota: String(f.nota || '').slice(0, 260), marca: f.marca }));
  R.bloques = (P.bloques || []).map(b => ({ tit: String(b.tit || '').slice(0, 130),
    n: (b.lineas || []).length,
    refs: (b.lineas || []).reduce((a, l) => a.concat(l.refs || []), []) }));
  R.guia = P.guia ? { ref: P.guia.ref, txt: String(P.guia.txt || '').slice(0, 160) } : null;
  /* ⚠️ LA REGLA E-1 SE MIDE SOBRE EL CAMPO rec Y NO SOBRE LA NOTA, y la primera version de esta sonda
     informo SEIS mezclas que no existian. E-1 dice que cada pregunta usa los CORTES de una sola
     guia: el campo rec es lo que la guia que rige manda -con su clase, su nivel y su folio- y es donde
     un hibrido se veria. La NOTA, en cambio, muchas veces dice que la OTRA guia NO trata el
     tema, que es justo lo que E-3 pide decir: contarla como mezcla es contar la declaracion de
     que no hay mezcla. Se mira el dato de la tabla, no el texto armado. */
  /* Las tablas de la CIA y de la CIV son LOCALES de su funcion, asi que no se pueden leer por
     window: para esas dos el invariante se mide sobre la NOTA ya armada, descontando la linea
     de referencia -que empieza con un prefijo fijo- y las frases que declaran que la otra guia
     NO trata el tema. Para la TGA se lee la tabla, que es mas fuerte. */
  /* ⚠️ LA TABLA SE LEE DE window Y SE EXIGE QUE ESTE: sin ella, filasTab queda VACIO y el
     filtro devuelve CERO mezclas sobre un denominador de cero -que se lee igual que «no hay
     mezclas»-. La primera version de esta sonda tenia ese defecto. */
  const TABS = { TGA: window.TGA_IND_PREG, CIA: window.CIA_PREG, CIV: window.CIV_PREG };
  const TAB = TABS[e.sec] || null;
  R.hayTabla = !!TAB;
  const gr = R.grupoDet = (function(){
    try { const j = window.tgaEjes ? tgaEjes() : null; if (!j) return null;
      return (j.anat === 'ltga') ? 'cc' : (j.cir === 'auricular') ? 'aur'
           : (j.cir === 'jatene') ? 'jat' : (j.cir === 'rastelli') ? 'ras' : null } catch (x) { return null } })();
  const filasTab = !TAB ? [] : (e.sec === 'TGA' ? ((gr && TAB[gr]) ? TAB[gr] : []) : TAB);
  R.nTabla = filasTab.length;
  R.mezclan = filasTab.filter(q => {
    const rec = String(q.rec || '');
    const otra = q.guia === 'acc' ? 'ESC 2020' : 'ACC/AHA 2025';
    return rec.indexOf(otra) >= 0;
  }).map(q => String(q.lbl).slice(0, 70));
  /* Y el invariante estructural: UNA sola guia por pregunta, y la linea de referencia -cuando
     existe- tiene que ser de la OTRA. */
  R.sinGuiaTab = filasTab.filter(q => q.guia !== 'acc' && q.guia !== 'esc').map(q => String(q.lbl).slice(0,70));
  R.refMalDirigida = filasTab.filter(q => q.ref && q.guia !== 'acc').map(q => String(q.lbl).slice(0,70));
  R.conRef = R.preguntas.filter(q => /ESC 2020 \\(anterior\\):/.test(String(q.nota || ''))).length;
  R.sinGuia = R.preguntas.filter(q => !/ACC\\/AHA 2025|ESC 2020/.test(String(q.nota || ''))).map(q => q.lbl);
  R.conTramo = R.preguntas.filter(q => /Nota: /.test(String(q.nota || ''))).length;
  /* ── EL CONTROL DEL PAPEL ── */
  try { if (typeof generarInforme === 'function') generarInforme() } catch (x) {}
  await W(200);
  const inf = String((EL('informe_texto')||{}).value || '');
  const sum = String((EL('en_suma')||{}).value || '');
  const cap = String((EL('tga-concl')||{}).textContent || '');
  const MARC = ['Clase 1 ', 'Clase 2a', 'Clase 2b', 'Clase I ', 'Clase IIa', 'Clase IIb',
                'B-NR', 'C-LD', 'C-EO', 'ACC/AHA', 'folio e1', 'recomendación 1'];
  const cuenta = t => { const o = {}; MARC.forEach(m => { const k = String(t).split(m).length - 1; if (k) o[m] = k }); return o };
  R.papel = { informe: cuenta(inf), suma: cuenta(sum), capsula: cuenta(cap),
              denom: { inf: inf.length, suma: sum.length, cap: cap.length } };
  return R;
})`;

const ESC = {
  cia:     { sec:'CIA', s:{ ete_cia_tipo:'secundum', ete_cia_tam_max:'22' } },
  ciaSV:   { sec:'CIA', s:{ ete_cia_tipo:'sv_vcs', ete_cia_tam_max:'18' } },
  ciaVac:  { sec:'CIA', s:{} },
  civ:     { sec:'CIV', s:{ ete_civ_tipo:'perimembranosa', ddfvi:'62' } },
  civVac:  { sec:'CIV', s:{} },
  tgaAur:  { sec:'TGA', s:{ tga_tipo:'mustard' } },
  tgaJat:  { sec:'TGA', s:{ tga_tipo:'dtga', tga_cirugia:'jatene' } },
  tgaRas:  { sec:'TGA', s:{ tga_tipo:'dtga', tga_cirugia:'rastelli' } },
  tgaCc:   { sec:'TGA', s:{ tga_tipo:'cctga' } },
  tgaSinCx:{ sec:'TGA', s:{ tga_tipo:'dtga' } },
  tgaVacio:{ sec:'TGA', s:{} }
};

(async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome', headless: true });
  const pg = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const errs = []; pg.on('pageerror', x => errs.push('PAGE ' + x.message));
  await pg.goto('file://' + FILE); await pg.waitForTimeout(2500);
  console.log('===== EL PANEL DE EVIDENCIA DE CONGENITAS, POR ESCENARIO =====');
  console.log('archivo:', FILE);
  for (const k of Object.keys(ESC)) {
    let R;
    try { R = await Promise.race([ pg.evaluate(new Function('return ' + CUERPO)(), ESC[k]),
      new Promise((_, rj) => setTimeout(() => rj(new Error('TIMEOUT')), 60000)) ]) }
    catch (x) { console.log('\n== ' + k + ' == FALLO: ' + x.message); continue }
    console.log('\n===== ' + k + ' =====  hayPanel=' + R.hayPanel + (R.sinFn ? ' (SIN FUNCION)' : ''));
    if (!R.hayPanel) { if (R.errs.length) console.log('  errs: ' + R.errs.join(' ; ')); continue }
    console.log('  filas de solo lectura: ' + R.nFilas + '   PREGUNTAS: ' + R.nPreg);
    console.log('  con linea de referencia de la otra guia: ' + R.conRef + '   con nota de tramo: ' + R.conTramo);
    console.log('  tabla expuesta: ' + R.hayTabla + '   grupo detectado: ' + R.grupoDet
      + '   preguntas en la tabla: ' + R.nTabla + (R.nTabla === 0 ? '  <-- DENOMINADOR VACIO' : ''));
    console.log('  preguntas cuyo CORTE mezcla las dos guias (debe ser 0): ' + R.mezclan.length
      + (R.mezclan.length ? ' -> ' + R.mezclan.join(' | ') : ''));
    console.log('  preguntas sin guia en la TABLA (debe ser 0): ' + R.sinGuiaTab.length
      + '   con linea de referencia mal dirigida (debe ser 0): ' + R.refMalDirigida.length
      + (R.refMalDirigida.length ? ' -> ' + R.refMalDirigida.join(' | ') : ''));
    console.log('  preguntas SIN guia rotulada (debe ser 0): ' + R.sinGuia.length
      + (R.sinGuia.length ? ' -> ' + R.sinGuia.join(' | ') : ''));
    console.log('  bloques (' + R.bloques.length + '):');
    R.bloques.forEach(x => console.log('     - [' + x.n + ' lineas, refs ' + JSON.stringify(x.refs) + '] ' + x.tit));
    console.log('  guia de la seccion: ' + JSON.stringify(R.guia));
    console.log('  CONTROL DEL PAPEL -> informe ' + JSON.stringify(R.papel.informe)
      + ' | EN SUMA ' + JSON.stringify(R.papel.suma) + ' | capsula ' + JSON.stringify(R.papel.capsula));
    console.log('     denominadores: informe ' + R.papel.denom.inf + ' car, EN SUMA ' + R.papel.denom.suma
      + ' car, capsula ' + R.papel.denom.cap + ' car');
    if (R.errs.length) console.log('  errs: ' + R.errs.slice(0,3).join(' ; '));
  }
  console.log('\nerrores de pagina: ' + (errs.length ? errs.join(' | ') : 'ninguno'));
  await b.close(); process.exit(0);
})();
