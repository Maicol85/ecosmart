/**
 * _probe_pant17b_tr2.mjs — LO QUE NO SE MUEVE Y EL GESTO (PANT-17b, commit 1).
 *   (v)  la lista de objetos de la escena: cantidad, posiciones y colores ORIGINALES
 *   (vi) toque contra arrastre, pelar capas y el reinicio cuando la escena cambia
 *   (vii) la captura que va al PDF, medida por pixeles
 *   node scripts/_probe_pant17b_tr2.mjs --file <index.html> --out <json>
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
let _pw; try { _pw = require(process.env.HOME + '/.pwtmp/node_modules/playwright') }
catch (e) { console.log('SIN PLAYWRIGHT'); process.exit(0) }
const RAIZ = process.cwd();
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p17b_tr2.json';

const ESC = [ ['tga_d','tga','d'], ['tga_jat','tga','jat'], ['tga_mus','tga','mus'],
  ['tga_ras','tga','ras'], ['tga_cc','tga','cc'], ['fal_op','fal','op'],
  ['dsav','dsav','com'], ['ebs','ebs','std'], ['fon','fon','ext'] ];

const ABRIR = `(async () => {
  ["modalAvisoEco","login-overlay"].forEach(function (id) { var m = document.getElementById(id); if (m) m.style.display = "none" });
  try { if (typeof limpiarCampos === "function") limpiarCampos(true) } catch (e) {}
  var Q = String.fromCharCode(39);
  var bq = function (t) { return Array.prototype.filter.call(document.querySelectorAll("button[onclick]"),
    function (b) { return String(b.getAttribute("onclick")).indexOf(t) >= 0 })[0] };
  try { var b1 = bq("showTab(" + Q + "congenitas" + Q); if (b1) b1.click() } catch (e) {}
  await new Promise(function (r) { setTimeout(r, 420) });
  var ab = document.getElementById("cc3d-abrir"); if (ab) ab.click();
  await new Promise(function (r) { setTimeout(r, 4200) });
  if (!window.THREE) return { error: "sin THREE" };
  try { if (typeof cmSetModo === "function") cmSetModo("explorar") } catch (e) {}
  await new Promise(function (r) { setTimeout(r, 400) });
  return { ok: 1 };
})()`;

(async () => {
  const R = { file: FILE };
  const br = await _pw.chromium.launch({ channel: 'chrome' });
  const ctx = await br.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e && e.message || e)));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLA ' + m.text().slice(0, 90)) });
  try {
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    const ab = await pg.evaluate(ABRIR);
    if (ab && ab.error) { R.error = ab.error }
    else {
      /* (v) la escena, campo por campo: posiciones y colores salen de `cmEscena`, el duenio
         unico de lo que el dibujo arma, y el conteo de piezas del grupo vivo */
      R.escenas = {};
      for (const [k, b, v] of ESC) {
        R.escenas[k] = await pg.evaluate(`(() => {
          var st = window._cm3dEstado();
          st.S.base = ${JSON.stringify(b)};
          st.S.bv = Object.assign({ fal:'sin', dsav:'par', ebs:'std', fon:'ext', tga:'d' }, { ${JSON.stringify(b)}: ${JSON.stringify(v)} });
          st.S.mods = {}; st.S.ck = {}; st.fc = 0;
          try { window.cm3dSync() } catch (e) {}
          var s = window.cmEscena(st.S);
          var pz = window._cm3dPiezas ? window._cm3dPiezas() : [];
          var tocables = 0, pos = [], col = [];
          for (var i = 0; i < pz.length; i++) {
            var o = pz[i]; if (!o || !o.isMesh) continue;
            if (o.userData && o.userData.cmNoTocar) continue;
            tocables++;
            pos.push([ +o.position.x.toFixed(4), +o.position.y.toFixed(4), +o.position.z.toFixed(4) ]);
            var m0 = o.userData && o.userData.cmMat0 ? o.userData.cmMat0 : o.material;
            col.push(m0 && m0.color ? m0.color.getHex() : -1);
          }
          return { hijos: pz.length, tocables: tocables, pos: pos, col: col,
                   firma: JSON.stringify({ ar: s.ar, ex: s.ex, fl: (s.fl || []).length, rv: s.rvShell, lv: s.lvShell, ra: s.raShell }) };
        })()`);
      }
      /* (vi) el gesto real: toque contra arrastre y el reinicio al cambiar la escena */
      R.gesto = await pg.evaluate(`(async () => {
        var st = window._cm3dEstado();
        st.S.base = 'tga'; st.S.bv = Object.assign({}, st.S.bv, { tga: 'd' }); st.S.mods = {}; st.fc = 0;
        try { window.cm3dSync() } catch (e) {}
        await new Promise(function (r) { setTimeout(r, 500) });
        var host = document.getElementById('cm3d-cv');
        var rc = host.getBoundingClientRect();
        var cx = Math.round(rc.left + rc.width / 2), cy = Math.round(rc.top + rc.height / 2);
        var ev = function (t, x, y) { host.dispatchEvent(new PointerEvent(t, { clientX: x, clientY: y, bubbles: true, pointerId: 1 })) };
        var n0 = Object.keys(st.sinColor).length;
        ev('pointerdown', cx, cy); ev('pointerup', cx, cy);
        var n1 = Object.keys(st.sinColor).length;
        ev('pointerdown', cx, cy); ev('pointerup', cx, cy);
        var n2 = Object.keys(st.sinColor).length;
        /* una SEGUNDA estructura: pelar capas */
        ev('pointerdown', cx, cy); ev('pointerup', cx, cy);
        ev('pointerdown', cx + 40, cy + 20); ev('pointerup', cx + 40, cy + 20);
        var n3 = Object.keys(st.sinColor).length;
        /* el arrastre NO apaga nada */
        var n3b = n3;
        ev('pointerdown', cx - 30, cy - 30); ev('pointermove', cx + 10, cy - 30); ev('pointerup', cx + 10, cy - 30);
        var n4 = Object.keys(st.sinColor).length;
        /* la escena cambia: el conjunto se borra entero */
        st.S.bv = Object.assign({}, st.S.bv, { tga: 'cc' });
        try { window.cm3dSync() } catch (e) {}
        await new Promise(function (r) { setTimeout(r, 400) });
        var n5 = Object.keys(st.sinColor).length;
        return { n0: n0, tras1toque: n1, tras2toques: n2, pelando: n3, trasArrastre: n4, trasCambio: n5, arrastreSuma: n4 - n3b };
      })()`);
      /* (vii) la captura que va al PDF, con DOS estructuras sin color */
      R.pdf = await pg.evaluate(`(async () => {
        var st = window._cm3dEstado();
        st.S.base = 'tga'; st.S.bv = Object.assign({}, st.S.bv, { tga: 'd' }); st.S.mods = {}; st.fc = 0;
        try { window.cm3dSync() } catch (e) {}
        await new Promise(function (r) { setTimeout(r, 500) });
        function cap() { try { return _cm3dCaptura() } catch (e) { return null } }
        function cuenta(u) {
          return new Promise(function (res) {
            var im = new Image();
            im.onload = function () {
              var c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
              var x = c.getContext('2d'); x.drawImage(im, 0, 0);
              var d = x.getImageData(0, 0, c.width, c.height).data;
              var gris = 0, color = 0, tot = 0;
              for (var i = 0; i < d.length; i += 4) {
                var r = d[i], g = d[i+1], b = d[i+2];
                if (r > 246 && g > 246 && b > 246) continue;
                tot++;
                var mx = Math.max(r, g, b), mn = Math.min(r, g, b);
                if (mx - mn < 26) gris++; else color++;
              }
              res({ w: im.width, h: im.height, tot: tot, gris: gris, color: color });
            };
            im.onerror = function () { res(null) };
            im.src = u;
          });
        }
        var a = cap(); var A = a ? await cuenta(a.url) : null;
        /* dos estructuras sin color, con el gesto real */
        var host = document.getElementById('cm3d-cv'), rc = host.getBoundingClientRect();
        var cx = Math.round(rc.left + rc.width / 2), cy = Math.round(rc.top + rc.height / 2);
        var ev = function (t, x, y) { host.dispatchEvent(new PointerEvent(t, { clientX: x, clientY: y, bubbles: true, pointerId: 1 })) };
        ev('pointerdown', cx, cy); ev('pointerup', cx, cy);
        ev('pointerdown', cx + 40, cy + 20); ev('pointerup', cx + 40, cy + 20);
        var apagadas = Object.keys(st.sinColor).length;
        var b2 = cap(); var B = b2 ? await cuenta(b2.url) : null;
        return { apagadas: apagadas, normal: A, conApagadas: B };
      })()`);
    }
  } catch (e) { R.error = String(e && e.message || e) }
  R.errores = errs.slice(0, 8);
  await ctx.close(); await br.close();
  fs.writeFileSync(OUTF, JSON.stringify(R, null, 1));
  console.log('OK ->', OUTF);
  console.log('gesto', JSON.stringify(R.gesto));
  console.log('pdf', JSON.stringify(R.pdf));
  console.log('errores', JSON.stringify(R.errores));
  if (R.escenas) for (const k of Object.keys(R.escenas)) {
    const e = R.escenas[k];
    console.log(k, 'hijos', e.hijos, 'tocables', e.tocables, 'firma', String(e.firma).length, 'poshash', JSON.stringify(e.pos).length, 'colhash', JSON.stringify(e.col).length);
  }
})();
