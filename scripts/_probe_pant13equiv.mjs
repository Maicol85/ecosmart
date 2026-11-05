#!/usr/bin/env node
/**
 * _probe_pant13equiv.mjs - la equivalencia del dibujo de la transposicion (PANT-13, c4, 4d).
 * Compara, en TODAS las escenas que la pestania TGA puede producir -Tipo x Cirugia x CIV
 * residual x Obstruccion subaortica x CIA/CIV/DAP cargadas-: el ESCENARIO que el modulo arma
 * contra el que arma el 3D de la transposicion, campo por campo; la lista de objetos del dibujo
 * y de etiquetas de los dos motores; y el esquema de circulacion de los dos.
 *   node scripts/_probe_pant13equiv.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const br = await _pw.chromium.launch({ channel: 'chrome' });
const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 150)));
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
await pg.waitForTimeout(1500);
const r = await pg.evaluate(`(async () => {
  const R = { escenas: [] }; const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  const Q = String.fromCharCode(39);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const S = (id, v) => { const e = EL(id); if (!e) return 'NO ' + id;
    if (e.type === 'checkbox') { e.checked = !!v } else { e.value = v }
    e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); return 'ok' };
  /* abrir congenitas, la sub-pestania de la TGA y su seccion, y el modulo */
  try { const b0 = bq('showTab(' + Q + 'congenitas2' + Q); if (b0) b0.click() } catch (e) {}
  await esperar(300);
  try { const b1 = bq('ccSubTab(' + Q + 'congenitas2' + Q); if (b1) b1.click() } catch (e) {}
  await esperar(400);
  const acc = EL('sacc-cc-tga');
  if (acc && !acc.classList.contains('open')) { const h = document.querySelector('#sacc-cc-tga .sacc-hdr'); if (h) h.click() }
  await esperar(900);
  try { document.querySelectorAll('.sacc-body').forEach(b => { b.style.transition = 'none' }) } catch (e) {}
  R.libA = (typeof window.THREE === 'undefined') ? 'no' : (window.THREE.REVISION || 'si');
  /* abrir el modulo del corazon maestro, que esta en la primera sub-pestania */
  try { const b2 = bq('showTab(' + Q + 'congenitas' + Q); if (b2) b2.click() } catch (e) {}
  await esperar(400);
  const bot = EL('cc3d-abrir'); if (bot) bot.click();
  await esperar(3000);
  R.libB = (typeof window.THREE === 'undefined') ? 'no' : (window.THREE.REVISION || 'si');
  const st = window._cm3dEstado ? window._cm3dEstado() : null;
  if (!st) return { ERR: 'no hay _cm3dEstado' };
  if (typeof window.tga3dEscena !== 'function') return { ERR: 'no hay tga3dEscena' };
  if (typeof window.cmEscena !== 'function') return { ERR: 'no hay cmEscena' };
  /* firma de un escenario: campo por campo, con los numeros a cuatro decimales */
  const red = v => (typeof v === 'number') ? Number(v.toFixed(4)) : v;
  const firma = o => JSON.stringify(o, (k, v) => red(v));
  const firmaEsc = s2 => {
    if (!s2) return 'NULO';
    return firma({ ch: s2.ch, ar: s2.ar, fl: s2.fl, ex: s2.ex, lb: s2.lb,
      rvShell: s2.rvShell || 1, rvPool: s2.rvPool || 1, lvShell: s2.lvShell || 1,
      lvPool: s2.lvPool || 1, raShell: s2.raShell || 1, raPool: s2.raPool || 1,
      hideRPV: !!s2.hideRPV });
  };
  /* el esquema del modulo y el de la transposicion, normalizando los ids de marcador */
  const normSvg = t => String(t || '').replace(/cmm([bro])/g, 'm$1')
    .replace(/class="cm3d-(tp|ts|fl)"/g, 'class="$1"').replace(/\\s+/g, ' ').trim();
  const TIPOS = ['dtga', 'cctga', 'mustard', 'senning'];
  const CIRS = ['', 'ninguna', 'auricular', 'jatene', 'rastelli'];
  let ig = 0, dif = 0, vac = 0;
  const detalle = [];
  for (const tipo of TIPOS) {
    for (const cir of CIRS) {
      for (const tciv of ['', 'si']) {
        for (const tobs of ['', 'si']) {
          for (const coms of [0, 1]) {
            S('tga_tipo', tipo); S('tga_cirugia', cir);
            S('tga_civ_residual', tciv); S('tga_obstr_subaortica', tobs);
            S('ete_cia_tipo', coms ? 'secundum' : '');
            S('ete_civ_tipo', coms ? 'perimembranosa' : '');
            S('dap_tipo', coms ? 'pequeno' : '');
            const nom = tipo + '/' + (cir || 'vacio') + '/civ' + (tciv || '-') + '/obs' + (tobs || '-') + '/coms' + coms;
            /* (A) el escenario que el 3D DE LA TRANSPOSICION arma hoy */
            const ej = window.tgaEjes ? window.tgaEjes() : null;
            const sh = window.tga3dComs ? window.tga3dComs() : null;
            if (!ej || !ej.anat) { vac++; detalle.push([nom, 'sin anatomia: la pestania no produce dibujo']); continue }
            const eA = window.tga3dEscena(ej.anat, ej.cir, sh);
            /* (B) el que el MODULO arma leyendo la misma pestania */
            try { window.cmDesdeEstudio() } catch (e) {}
            const eB = window.cmEscena(st.S);
            const fA = firmaEsc(eA), fB = firmaEsc(eB);
            if (fA.length < 200) { vac++; detalle.push([nom, 'DENOMINADOR VACIO', fA.length]); continue }
            if (fA === fB) { ig++ } else {
              dif++;
              let i2 = 0; while (i2 < fA.length && i2 < fB.length && fA[i2] === fB[i2]) i2++;
              if (detalle.length < 10) detalle.push([nom, 'DISTINTO en ' + i2,
                fA.slice(Math.max(0, i2 - 60), i2 + 80), fB.slice(Math.max(0, i2 - 60), i2 + 80)]);
            }
            /* para clasificar la diferencia: que comunicaciones dibuja CADA lado */
            const comsA = (sh ? ((sh.asd ? 'asd ' : '') + (sh.vsd ? 'vsd ' : '') + (sh.pda ? 'pda' : '')) : '').trim();
            const comsB = ['cia','civ','dap','vcs'].filter(k => st.S.mods[k]).join(' ');
            const bloq = ['cia','civ','dap'].filter(k => coms && !st.S.mods[k]).join(' ');
            R.escenas.push({ n: nom, base: st.S.base, bv: st.S.bv.tga,
              ck: JSON.stringify(st.S.ck), mods: JSON.stringify(st.S.mods), igual: fA === fB,
              comsA: comsA, comsB: comsB, bloqueadas: bloq,
              chocan: (st.S.base === 'tga' && window._cm3dEstado) ? (window._cm3dEstado().chocan || []).join(' ; ') : '' });
          }
        }
      }
    }
  }
  R.resumen = { escenas: ig + dif + vac, iguales: ig, distintas: dif, sinAnatomia: vac };
  /* ── (C) la comparacion de los DOS esquemas de circulacion ── */
  S('tga_tipo', 'dtga'); S('tga_cirugia', 'ninguna');
  S('tga_civ_residual', ''); S('tga_obstr_subaortica', '');
  S('ete_cia_tipo', ''); S('ete_civ_tipo', ''); S('dap_tipo', '');
  try { window.cmDesdeEstudio() } catch (e) {}
  const esb = EL('cm3d-esb'); if (esb && !_schAbierto()) esb.click();
  function _schAbierto() { const e = EL('cm3d-sch'); return e && !e.hidden }
  await esperar(700);
  const esqs = {};
  for (const t2 of ['dtga', 'cctga', 'mustard']) {
    S('tga_tipo', t2);
    try { window.cmDesdeEstudio(); window.cmSchRender(true) } catch (e) {}
    try { if (window.tgaEsqSync) { const ej2 = window.tgaEjes(); window.tgaEsqSync(ej2.anat, ej2.cir) } } catch (e) {}
    await esperar(400);
    const a1 = EL('cm3d-schsvg'), b1 = document.querySelector('#tga-esq-svg svg');
    esqs[t2] = { bvModulo: st.S.bv.tga, baseModulo: st.S.base,
                 ejes: window.tgaEjes ? JSON.stringify(window.tgaEjes()) : 'NO',
                 modulo: a1 ? normSvg(a1.innerHTML).length : 0,
                 tga: b1 ? normSvg(b1.innerHTML).length : 0,
                 modNodos: a1 ? a1.querySelectorAll('*').length : 0,
                 tgaNodos: b1 ? b1.querySelectorAll('*').length : 0,
                 modTxt: a1 ? Array.prototype.map.call(a1.querySelectorAll('text'), e => e.textContent).join('|').slice(0, 150) : '',
                 tgaTxt: b1 ? Array.prototype.map.call(b1.querySelectorAll('text'), e => e.textContent).join('|').slice(0, 150) : '' };
  }
  R.esquemas = esqs;
  R.detalle = detalle;
  return R;
})()`).catch(e => ({ EXC: String(e).slice(0, 300) }));
r.errores = errs.slice(0, 6);
console.log(JSON.stringify(r, null, 1));
await pg.close(); await br.close();
