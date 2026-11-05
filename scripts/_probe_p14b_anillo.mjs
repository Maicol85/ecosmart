#!/usr/bin/env node
/**
 * _probe_p14b_anillo.mjs - el anillo de la obstruccion subaortica en el 3D (PANT-14b, commit 7).
 * Cuenta en el LIENZO los pixeles del gris del anillo por variante, en los dos temas y con «Por
 * dentro» encendido y apagado, con el control negativo de la casilla en «No».
 *   node scripts/_probe_p14b_anillo.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const CUERPO = `(async () => {
  const R = { casos: [] }; const EL = i => document.getElementById(i);
  const esp = ms => new Promise(z => setTimeout(z, ms));
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  try { if (typeof showTab === 'function') showTab('congenitas') } catch (e) {}
  await esp(420);
  const ab = EL('cc3d-abrir'); if (ab) ab.click(); await esp(3600);
  try { cmSetModo('explorar') } catch (e) {}
  await esp(500);
  R.listo = !!(_cm3d && _cm3d.listo);
  const cv = () => { const h = EL('cm3d-cv'); return h ? h.querySelector('canvas') : null };
  R.canvas = !!cv();
  if (!cv()) return R;
  /* el gris del anillo es 0x9a9a95 = (154,154,149). Se cuentan los pixeles cercanos. */
  const G = [154, 154, 149];
  const contar = () => { const c = cv();
    try {
      const w = c.width, h = c.height;
      const cp = document.createElement('canvas'); cp.width = w; cp.height = h;
      const cx = cp.getContext('2d'); cx.drawImage(c, 0, 0);
      const d = cx.getImageData(0, 0, w, h).data;
      let n = 0, nLax = 0, tot = 0;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i+3] < 10) continue; tot++;
        const dr = Math.abs(d[i]-G[0]), dg = Math.abs(d[i+1]-G[1]), db = Math.abs(d[i+2]-G[2]);
        if (dr < 18 && dg < 18 && db < 18) n++;
        if (dr < 45 && dg < 45 && db < 45) nLax++;
      }
      return { w: w, h: h, opacos: tot, gris: n, grisLax: nLax };
    } catch (e) { return { ERR: String(e).slice(0, 80) } } };
  const VAR = ['d','jat','mus','ras','cc'];
  for (const v of VAR) {
    for (const obs of [true, false]) {
      for (const ins of [true, false]) {
        _cm3d.S.base = 'tga'; _cm3d.S.bv.tga = v; _cm3d.S.mods = {};
        _cm3d.S.ck = obs ? { tobs: true } : {};
        _cm3d.ins = ins;
        const ic = EL('cm3d-ins'); if (ic) ic.checked = ins;
        try { cm3dBuild() } catch (e) {}
        try { if (typeof _cm3dInsSet === 'function') _cm3dInsSet() } catch (e) {}
        try { cmVista() } catch (e) {}
        /* ⚠️ EL DIBUJO SE QUIETA CON LA FRECUENCIA EN CERO Y NO CON LA PAUSA, y la diferencia
           importa: con el bucle PAUSADO el lienzo conserva el cuadro ANTERIOR -el buffer se
           preserva del ultimo render- asi que la cuenta sale la de la escena de antes y el
           control no se distingue del caso. Medido: la primera version de esta sonda daba
           practicamente los mismos pixeles con la casilla en Si y en No. Con la frecuencia en
           cero el latido se queda quieto y el bucle SIGUE renderizando. */
        _cm3d.pausado = false; _cm3d.fc = 0;
        const fcc = EL('cm3d-fc'); if (fcc) fcc.value = '0';
        await esp(1100);
        const px = contar();
        /* y la escena dice si el anillo esta en la lista de objetos */
        let enEscena = 0;
        try { const sc = cmEscena(_cm3d.S);
          enEscena = (sc.ex || []).filter(function (x) { return x.t === 'ring' && x.col === TGA3D_C.grey }).length }
        catch (e) { enEscena = -1 }
        R.casos.push({ v: v, obs: obs, ins: ins, enEscena: enEscena,
                       gris: px.gris, grisLax: px.grisLax, opacos: px.opacos, lienzo: px.w + 'x' + px.h });
      }
    }
  }
  return R;
})()`;

const br = await _pw.chromium.launch({ channel: 'chrome' });
const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 120)));
let out;
try {
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(1900);
  out = await pg.evaluate(CUERPO);
  out.errs = errs.filter(e => !/ERR_FILE_NOT_FOUND|favicon/.test(e));
} catch (e) { out = { fatal: String(e).slice(0, 240), errs } }
await pg.close(); await br.close();
console.log(JSON.stringify(out, null, 1));
