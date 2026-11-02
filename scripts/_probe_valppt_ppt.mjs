#!/usr/bin/env node
/**
 * _probe_valppt_ppt.mjs - el PPT de la tanda VAL-PPT (commits 7 a 10).
 *
 * Mide tres cosas:
 *   A) LA REGLA DE DISPOSICION, que es una funcion PURA: se le dan relaciones de aspecto y
 *      devuelve la grilla. Asi se puede medir sin generar un PPT, con casos que incluyen el
 *      CONTROL NEGATIVO -dos apaisadas, que tienen que seguir lado a lado como hasta hoy-.
 *   B) LA CASILLA del numero, que existe, arranca encendida y NO es campo del estudio.
 *   C) EL MAZO GENERADO DE VERDAD, espiando PptxGenJS: cuantas diapositivas, que textos lleva
 *      -ninguno puede ser un nombre de paciente-, y si lleva la inicial y la final.
 *
 *   node scripts/_probe_valppt_ppt.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || process.cwd() + '/index.html';

const CUERPO = `(() => {
  const R = { errs: [] };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  /* A - la regla, como funcion pura. W y HB son los de la hoja 16x9 del exportador. */
  const W = 10, HB = 5.63 - 0.62;
  if (typeof igPptDisposicion !== 'function') { R.sinRegla = true; return R }
  const AP = 16/9, VE = 9/16, CU = 1, EC = 4/3;
  R.regla = {
    'uno apaisado':             igPptDisposicion([AP], W, HB).join('x'),
    'DOS apaisadas (control)':  igPptDisposicion([AP, AP], W, HB).join('x'),
    'DOS verticales':           igPptDisposicion([VE, VE], W, HB).join('x'),
    'DOS cuadradas':            igPptDisposicion([CU, CU], W, HB).join('x'),
    'DOS mixtas':               igPptDisposicion([AP, VE], W, HB).join('x'),
    'CUATRO apaisadas (ctrl)':  igPptDisposicion([AP,AP,AP,AP], W, HB).join('x'),
    'CUATRO verticales':        igPptDisposicion([VE,VE,VE,VE], W, HB).join('x'),
    'CUATRO de eco 4:3':        igPptDisposicion([EC,EC,EC,EC], W, HB).join('x'),
    'sin aspecto (null)':       igPptDisposicion([null, null], W, HB).join('x'),
    'CUATRO mixtas':            igPptDisposicion([AP,VE,AP,VE], W, HB).join('x')
  };
  /* ⚠️ CONTROL DE QUE LA REGLA SABE ELEGIR APILADO. En una hoja 16:9 dos elementos verticales
     SIEMPRE quedan mejor lado a lado -apilarlos parte la altura, que es justo lo que limita a un
     vertical-, asi que 1x2 no gana nunca con esta hoja. Si la funcion devolviera 2x1 pase lo que
     pase no se notaria la diferencia: sobre una hoja VERTICAL tiene que elegir 1x2. Sin este
     control, «2x1 en todos los casos de 2» no distingue una regla que funciona de una que
     devuelve siempre lo mismo. */
  R.controlApilado = {
    'hoja VERTICAL, dos apaisadas': igPptDisposicion([AP, AP], HB, W).join('x'),
    'hoja VERTICAL, dos verticales': igPptDisposicion([VE, VE], HB, W).join('x')
  };
  /* El AREA de cada candidata, para que el volcado muestre POR QUE gano una. */
  const areaDe = (ars, cols, rows) => { const cw = W/cols, ch = HB/rows;
    return ars.reduce((a, r0) => { const ar = (r0 && isFinite(r0) && r0 > 0) ? r0 : 4/3;
      return a + Math.min(cw, ch*ar) * Math.min(ch, cw/ar) }, 0) };
  R.areas = {
    'DOS verticales 2x1': areaDe([VE,VE],2,1).toFixed(2),
    'DOS verticales 1x2': areaDe([VE,VE],1,2).toFixed(2),
    'DOS apaisadas 2x1':  areaDe([AP,AP],2,1).toFixed(2),
    'DOS apaisadas 1x2':  areaDe([AP,AP],1,2).toFixed(2),
    'hoja entera':        (W*HB).toFixed(2)
  };
  R.tol = (typeof IG_PPT_DISPOS_TOL !== 'undefined') ? IG_PPT_DISPOS_TOL : 'no expuesta';
  /* B - la casilla del numero. Se pinta al abrir Guardados; se pide el pintor directo. */
  /* ⚠️ LA COLUMNA SALE TEMPRANO CON «Armar PPT» APAGADO: sin encenderla primero, la casilla
     del numero no se pinta y la sonda informa «no existe» sobre un control que si esta. */
  /* ⚠️ DOS PASADAS, Y HACEN FALTA LAS DOS. _igImgPpt es una variable del modulo, no
     window._igImgPpt, asi que no se puede encender desde afuera: la UNICA puerta es la
     casilla «Armar PPT», y esa casilla la CREA el propio pintor. Primera pasada para que
     exista, click para encenderla -su listener repinta-, y recien ahi aparece el resto de la
     columna. Sin esto la sonda informaba «la casilla no existe» sobre un control que si esta. */
  try { if (typeof igImgSidePintar === 'function') igImgSidePintar(0, 0) } catch (e) { R.errs.push('pintar1: ' + e) }
  try { const c0 = EL('ig-ppt-on');
        if (c0 && !c0.checked) { c0.checked = true; c0.dispatchEvent(new Event('change', { bubbles: true })) }
        R.casillaArmar = c0 ? c0.checked : 'NO EXISTE ig-ppt-on';
        /* El listener repinta por renderInformesGuardados, que pide la pestaña Guardados
           abierta; la sonda la evita repintando la columna directo, que es su unico dueño. */
        if (typeof igImgSidePintar === 'function') igImgSidePintar(0, 0);
  } catch (e) { R.errs.push('pintar2: ' + e) }
  const ck = EL('ig-ppt-num');
  R.casilla = ck ? { existe: true, marcada: ck.checked,
                     esDelEstudio: (typeof _noEsDelEstudio === 'function') ? !_noEsDelEstudio('ig-ppt-num') : 'n/d' }
                 : { existe: false };
  R.varNum = (typeof _igImgNum !== 'undefined') ? _igImgNum : 'no expuesta';
  return R;
})`;

(async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome', headless: true });
  const pg = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(2500);
  const R = await pg.evaluate(new Function('return ' + CUERPO)());
  console.log('===== EL PPT DEL BANCO DE IMAGENES (VAL-PPT-7) =====');
  console.log('archivo:', FILE);
  if (R.sinRegla) { console.log('igPptDisposicion NO EXISTE en este arbol (es el de HEAD)'); }
  else {
    console.log('\nA - LA REGLA DE DISPOSICION (tolerancia ' + R.tol + ' del area de la hoja):');
    for (const k of Object.keys(R.regla)) console.log('   ' + k.padEnd(26) + ' -> ' + R.regla[k]);
    console.log('\n   areas comparadas (pulgadas cuadradas):');
    for (const k of Object.keys(R.areas)) console.log('      ' + k.padEnd(22) + R.areas[k]);
  }
  if (R.controlApilado) { console.log('\n   CONTROL -la regla sabe elegir apilado?-:');
    for (const k of Object.keys(R.controlApilado)) console.log('      ' + k.padEnd(32) + R.controlApilado[k]) }
  console.log('\nB - denominador: la casilla «Armar PPT» quedo en ' + JSON.stringify(R.casillaArmar));
  console.log('   LA CASILLA DEL NUMERO: ' + JSON.stringify(R.casilla)
    + '  variable=' + R.varNum);
  if (R.errs && R.errs.length) console.log('errs: ' + R.errs.slice(0,3).join(' ; '));
  console.log('errores de pagina: ' + (errs.length ? errs.join(' | ') : 'ninguno'));
  await b.close();
  process.exit(0);
})();
