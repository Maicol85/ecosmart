#!/usr/bin/env node
/**
 * _probe_p14b_esq.mjs - la equivalencia del esquema de la transposicion (PANT-14b, commit 4b).
 * Compara, escena por escena, el esquema que el MODULO dibuja contra el que la PESTANIA dibuja
 * con las mismas entradas: cada rect, path, circle y text con su posicion, su texto, su TAMANIO
 * DE LETRA y sus COLORES resueltos. La obstruccion subaortica se lista aparte: es la unica
 * diferencia esperada.
 *   node scripts/_probe_p14b_esq.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const CUERPO = `(async () => {
  const R = { escenas: [], err: '' };
  const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  /* la huella de un esquema: cada nodo con su etiqueta, sus atributos de posicion, su texto,
     su tamanio de letra y su color RESUELTO -el calculado, no el literal del atributo-. */
  const firma = (cont) => {
    const out = [];
    cont.querySelectorAll('rect,path,circle,text,marker').forEach(function (e) {
      const cs = getComputedStyle(e);
      const at = ['x','y','width','height','cx','cy','r','d','font-size','text-anchor','stroke-width','stroke-dasharray','marker-end','paint-order']
        .map(function (a) { const v = e.getAttribute(a); return v == null ? '' : a + '=' + v }).filter(Boolean).join(' ');
      out.push(e.tagName + ' | ' + at + ' | fs=' + cs.fontSize + ' fill=' + cs.fill + ' stroke=' + cs.stroke
               + ' | t=' + String(e.textContent || '').trim());
    });
    return out.sort();
  };
  /* el contenedor de la pestania y el del modulo */
  const CONT_TAB = 'tga-esq-svg', CONT_MOD = 'cm3d-schsvg';
  /* se dibuja el esquema de la pestania a mano, con el dueno, en un contenedor suelto */
  const dibujarTab = (k, sh) => {
    let c = EL('_p14b_tab');
    if (!c) { c = document.createElement('div'); c.id = '_p14b_tab';
      c.style.cssText = 'position:absolute;left:-9999px;top:0;width:300px;'; document.body.appendChild(c) }
    c.innerHTML = (typeof tgaEsqSVG === 'function') ? tgaEsqSVG(k, sh) : '';
    return c;
  };
  const VAR = ['d','jat','mus','ras','cc'];
  const COMS = [ {asd:false,vsd:false,pda:false}, {asd:true,vsd:false,pda:false},
                 {asd:false,vsd:true,pda:false}, {asd:false,vsd:false,pda:true},
                 {asd:true,vsd:true,pda:true} ];
  const CLAVE = { d:'dtga', jat:'jat', mus:'mus', ras:'ras', cc:'ltga' };
  /* el modulo tiene que estar abierto para que su svg tenga geometria */
  try { if (typeof showTab === 'function') showTab('congenitas') } catch (e) {}
  await esperar(420);
  const ab = EL('cc3d-abrir'); if (ab) ab.click();
  await esperar(3200);
  try { if (typeof cmSetModo === 'function') cmSetModo('explorar') } catch (e) { R.err = String(e).slice(0, 110) }
  await esperar(500);
  try { if (typeof cmSchSet === 'function') cmSchSet(true) } catch (e) {}
  await esperar(600);
  for (const v of VAR) {
    for (let ci = 0; ci < COMS.length; ci++) {
      for (const tobs of [false, true]) {
        const sh = COMS[ci];
        /* el estado del modulo, puesto a mano -es «Explorar» y es lo que esa pantalla permite- */
        _cm3d.S.base = 'tga'; _cm3d.S.bv.tga = v;
        _cm3d.S.mods = {}; if (sh.asd) _cm3d.S.mods.cia = 'sec';
        if (sh.vsd) _cm3d.S.mods.civ = 'pm'; if (sh.pda) _cm3d.S.mods.dap = 'std';
        _cm3d.S.ck = {}; if (tobs) _cm3d.S.ck.tobs = true;
        try { cmSchRender(true) } catch (e) {}
        await esperar(60);
        const fm = firma(EL(CONT_MOD));
        const ft = firma(dibujarTab(CLAVE[v], sh));
        /* la barra de la obstruccion y su rotulo se listan aparte */
        const esObs = x => /obstr\\. suba/.test(x) || (tobs && /^rect \\| x=(22|146|210) y=(112|150|208) width=20 height=6/.test(x));
        const fmSin = fm.filter(x => !esObs(x));
        const soloObs = fm.filter(esObs);
        const faltan = ft.filter(x => fmSin.indexOf(x) < 0);
        const sobran = fmSin.filter(x => ft.indexOf(x) < 0);
        R.escenas.push({ v: v, coms: ci, tobs: tobs, nMod: fm.length, nTab: ft.length,
          iguales: (faltan.length === 0 && sobran.length === 0),
          nObs: soloObs.length,
          faltan: faltan.slice(0, 3), sobran: sobran.slice(0, 3) });
      }
    }
  }
  return R;
})()`;

const br = await _pw.chromium.launch({ channel: 'chrome' });
const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 130)));
let out;
try {
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(1900);
  out = await pg.evaluate(CUERPO);
  out.errs = errs.filter(e => !/ERR_FILE_NOT_FOUND|favicon/.test(e));
} catch (e) { out = { fatal: String(e).slice(0, 240), errs } }
await pg.close(); await br.close();
console.log(JSON.stringify(out, null, 1));
