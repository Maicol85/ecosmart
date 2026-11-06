/**
 * _probe_pant17b_tr.mjs — LA TRANSPARENCIA DE UNA ESTRUCTURA SIN COLOR (PANT-17b, commit 1).
 *
 * Mide POR PIXELES y no por geometria: un contorno no mueve un solo punto, que es la leccion
 * que PANT-14 dejo escrita. Lo que se compara son TRES cuadros del MISMO dibujo:
 *   A  todo normal
 *   B  la estructura elegida SIN COLOR
 *   C  la MISMA estructura OCULTA por completo (visible=false)
 * Una transparencia de verdad hace que B se parezca a C en el interior de la silueta; una malla
 * de alambre no, porque sus lineas tapan lo de atras.
 *
 * Los tres cuadros se componen sobre el FONDO REAL del recuadro antes de contar, asi que lo que
 * se mide es lo que el medico ve y no un lienzo premultiplicado.
 *
 *   node scripts/_probe_pant17b_tr.mjs --file <index.html> --out <json> --motor chrome|webkit
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
let _pw; try { _pw = require(process.env.HOME + '/.pwtmp/node_modules/playwright') }
catch (e) { console.log('SIN PLAYWRIGHT'); process.exit(0) }
const RAIZ = process.cwd();
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p17b_tr.json';
const MOTOR = arg('--motor') || 'chrome';
const SOLO  = arg('--solo');

/* Las diez escenas que la orden pide: las cinco variantes de la transposicion, el Fallot
   operado, el defecto AV, Ebstein, Fontan y una CIA. */
const ESCENAS = [
  { k:'tga_d',   S:{ base:'tga', bv:{ tga:'d' } } },
  { k:'tga_jat', S:{ base:'tga', bv:{ tga:'jat' } } },
  { k:'tga_mus', S:{ base:'tga', bv:{ tga:'mus' } } },
  { k:'tga_ras', S:{ base:'tga', bv:{ tga:'ras' } } },
  { k:'tga_cc',  S:{ base:'tga', bv:{ tga:'cc' } } },
  { k:'fal_op',  S:{ base:'fal', bv:{ fal:'op' } } },
  { k:'dsav',    S:{ base:'dsav', bv:{ dsav:'com' } } },
  { k:'ebs',     S:{ base:'ebs', bv:{ ebs:'std' } } },
  { k:'fon',     S:{ base:'fon', bv:{ fon:'ext' } } },
  { k:'cia',     S:{ base:'norm', mods:{ cia:'sec' } } }
];

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
  var cv = document.querySelector("#cm3d-cv canvas");
  var pz = (typeof window._cm3dPiezas === "function") ? window._cm3dPiezas() : null;
  return cv ? { ok:1, w: cv.width, h: cv.height, piezas: pz ? pz.length : -1 } : { error: "sin lienzo" };
})()`;

/* El ayudante de medicion vive en la pagina: compone sobre el fondo real y cuenta. */
const HELPER = `(() => {
  var host = document.getElementById("cm3d-cv");
  function bgDe(e) {
    while (e) { var c = getComputedStyle(e).backgroundColor;
      if (c && c.indexOf("rgba(0, 0, 0, 0)") < 0 && c !== "transparent") return c; e = e.parentElement }
    return "rgb(255,255,255)";
  }
  var m = bgDe(host).match(/\\d+/g) || ["255","255","255"];
  window.__P17B = {
    bg: [ +m[0], +m[1], +m[2] ],
    /* Un cuadro del lienzo, COMPUESTO sobre el fondo del recuadro. */
    foto: function () {
      var cv = document.querySelector("#cm3d-cv canvas"); if (!cv) return null;
      var o = document.createElement("canvas"); o.width = cv.width; o.height = cv.height;
      var x = o.getContext("2d");
      x.fillStyle = "rgb(" + this.bg[0] + "," + this.bg[1] + "," + this.bg[2] + ")";
      x.fillRect(0, 0, o.width, o.height);
      x.drawImage(cv, 0, 0);
      var d; try { d = x.getImageData(0, 0, o.width, o.height) } catch (e) { return null }
      return { w: o.width, h: o.height, d: Array.prototype.slice.call(d.data) };
    },
    /* Las piezas que un toque puede alcanzar, con un area PROYECTADA estimada de su esfera
       envolvente: sirve para ELEGIR la cavidad grande y el vaso, no para medir. */
    piezas: function () {
      var T = window.THREE, pz = window._cm3dPiezas ? window._cm3dPiezas() : null;
      if (!pz || !T) return [];
      var cam = null;
      /* La camara se alcanza por el objeto padre de la escena: el grupo cuelga de la escena y
         la escena no se expone. Se estima el radio en pixeles con la distancia a la camara
         implicita del encuadre, que es constante en este motor: basta el radio del modelo. */
      var out = [];
      for (var i = 0; i < pz.length; i++) {
        var ob = pz[i];
        if (!ob || !ob.isMesh || !ob.visible) continue;
        if (ob.userData && ob.userData.cmNoTocar) continue;
        var k = ob.userData && ob.userData.cmK; if (!k) continue;
        var g = ob.geometry; if (!g) continue;
        if (!g.boundingSphere) { try { g.computeBoundingSphere() } catch (e) {} }
        var r = (g.boundingSphere ? g.boundingSphere.radius : 0) * (ob.scale ? ob.scale.x : 1);
        out.push({ i: i, k: k, r: r });
      }
      return out;
    },
    ocultar: function (i, v) {
      var pz = window._cm3dPiezas ? window._cm3dPiezas() : null;
      if (!pz || !pz[i]) return false; pz[i].visible = !!v; return true;
    },
    sinColor: function (k, v) {
      var st = window._cm3dEstado ? window._cm3dEstado() : null; if (!st) return false;
      if (v) st.sinColor[k] = 1; else delete st.sinColor[k];
      /* nombre PELADO: ese setter es un let de nivel de script y NO esta en window */
      try { _cm3dInsSet() } catch (e) {}
      return true;
    }
  };
  return { bg: window.__P17B.bg };
})()`;

function cmp(A, B, C, w, h, bg) { 
  /* la banda de borde se ADAPTA: en un vaso fino, erosionar 4 px deja un interior de cero
     pixeles y un cero sobre un denominador vacio no prueba nada */
  for (const b of [4, 2, 1]) { const r = cmp1(A, B, C, w, h, bg, b); if (r.error || r.int_tot >= 200 || b === 1) return r }
}
function cmp1(A, B, C, w, h, bg, BAND) {
  const TOL = 12, TOLB = 28;
  const dif = (d1, d2, i) => Math.max(Math.abs(d1[i]-d2[i]), Math.abs(d1[i+1]-d2[i+1]), Math.abs(d1[i+2]-d2[i+2]));
  const difBg = (d, i) => Math.max(Math.abs(d[i]-bg[0]), Math.abs(d[i+1]-bg[1]), Math.abs(d[i+2]-bg[2]));
  const S = new Uint8Array(w*h);
  let sN = 0;
  for (let p = 0; p < w*h; p++) { const i = p*4; if (dif(A, C, i) > TOL) { S[p] = 1; sN++ } }
  if (!sN) return { error: 'silueta vacia' };
  let E = S;
  for (let it = 0; it < BAND; it++) {
    const N = new Uint8Array(w*h);
    for (let y = 1; y < h-1; y++) for (let x = 1; x < w-1; x++) {
      const p = y*w+x; if (!E[p]) continue;
      if (E[p-1] && E[p+1] && E[p-w] && E[p+w]) N[p] = 1;
    }
    E = N;
  }
  let per = 0;
  for (let y = 1; y < h-1; y++) for (let x = 1; x < w-1; x++) {
    const p = y*w+x; if (!S[p]) continue;
    if (!S[p-1] || !S[p+1] || !S[p-w] || !S[p+w]) per++;
  }
  let detrasTot = 0, detrasOk = 0, intTot = 0, intCambia = 0, halo = 0, dIntTot = 0, dIntOk = 0;
  let hr = 0, hg = 0, hb = 0, hbN = 0, br2 = 0, bg2 = 0, bb2 = 0, pmax = -1, pcol = null;
  for (let p = 0; p < w*h; p++) {
    if (!S[p]) continue;
    const i = p*4;
    const esAtras = difBg(C, i) > TOL;
    const cambia  = dif(B, C, i) > TOLB;
    if (esAtras) { detrasTot++; if (!cambia) detrasOk++ }
    if (E[p]) { intTot++; if (cambia) intCambia++;
      /* lo de atras medido DENTRO de la silueta, fuera de la banda del halo: es la pregunta de
         verdad -deja ver el centro lo que hay detras- y el halo no se la come */
      if (esAtras) { dIntTot++; if (!cambia) dIntOk++ } }
    if (cambia) { halo++; hr += B[i]; hg += B[i+1]; hb += B[i+2];
      /* el halo SOBRE EL FONDO del recuadro: es el unico subconjunto donde el contraste que la
         orden pide -halo contra fondo- se puede medir sin que un color de atras lo diluya */
      if (!esAtras) { hbN++; br2 += B[i]; bg2 += B[i+1]; bb2 += B[i+2];
        /* el pixel mas LEJANO del fondo, no el mas claro: en el tema claro el halo es mas
           oscuro que el fondo y un maximo por brillo devolveria un pixel casi igual al fondo */
        const dd = (B[i]-bg[0])*(B[i]-bg[0]) + (B[i+1]-bg[1])*(B[i+1]-bg[1]) + (B[i+2]-bg[2])*(B[i+2]-bg[2]);
        if (dd > pmax) { pmax = dd; pcol = [B[i], B[i+1], B[i+2]] } } }
  }
  const col = halo ? [Math.round(hr/halo), Math.round(hg/halo), Math.round(hb/halo)] : null;
  const lum = (c) => { const f = c.map(v => { const s = v/255; return s <= 0.03928 ? s/12.92 : Math.pow((s+0.055)/1.055, 2.4) });
    return 0.2126*f[0] + 0.7152*f[1] + 0.0722*f[2] };
  const cfond = hbN ? [Math.round(br2/hbN), Math.round(bg2/hbN), Math.round(bb2/hbN)] : null;
  const ctr = (c) => { const l1 = lum(c), l2 = lum(bg); return +(((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05))).toFixed(2) };
  let contr = col ? ctr(col) : null;
  const contrFondo = cfond ? ctr(cfond) : null;
  const contrPico = pcol ? ctr(pcol) : null;
  return {
    silueta: sN, perimetro: per, banda: BAND,
    detras_tot: detrasTot, detras_ok: detrasOk,
    detras_pct: detrasTot ? +(100*detrasOk/detrasTot).toFixed(1) : null,
    detras_int_tot: dIntTot, detras_int_ok: dIntOk,
    detras_int_pct: dIntTot ? +(100*dIntOk/dIntTot).toFixed(1) : null,
    int_tot: intTot, int_cambia: intCambia,
    int_pct: intTot ? +(100*intCambia/intTot).toFixed(1) : null,
    halo: halo, halo_ancho: per ? +(halo/per).toFixed(2) : null,
    halo_color: col, halo_contraste: contr,
    halo_sobre_fondo: hbN, halo_color_fondo: cfond, halo_contraste_fondo: contrFondo,
    halo_color_pico: pcol, halo_contraste_pico: contrPico
  };
}

(async () => {
  const R = { file: FILE, motor: MOTOR, temas: {} };
  const br = MOTOR === 'webkit'
    ? await _pw.webkit.launch()
    : await _pw.chromium.launch({ channel: 'chrome' });
  try {
    for (const tema of ['osc', 'clr']) {
      const ctx = await br.newContext({ viewport: { width: 1440, height: 900 } });
      const pg = await ctx.newPage();
      const errs = [];
      pg.on('pageerror', e => errs.push(String(e && e.message || e)));
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
      /* el tema claro de esta app es la clase light-mode en la raiz, no un data-theme */
      if (tema === 'clr') { await pg.evaluate(`document.documentElement.classList.add('light-mode')`); }
      const ab = await pg.evaluate(ABRIR);
      if (ab && ab.error) { R.temas[tema] = { error: ab.error }; await ctx.close(); continue }
      await pg.evaluate(HELPER);
      const esc = {};
      for (const E of ESCENAS) {
        if (SOLO && E.k !== SOLO) continue;
        try {
          await pg.evaluate(`(() => {
            var st = window._cm3dEstado(); 
            st.S.base = ${JSON.stringify(E.S.base)};
            st.S.bv = Object.assign({ fal:'sin', dsav:'par', ebs:'std', fon:'ext', tga:'d' }, ${JSON.stringify(E.S.bv || {})});
            st.S.mods = ${JSON.stringify(E.S.mods || {})}; st.S.ck = {};
            st.fc = 0; st.ins = false;
            try { window.cm3dSync() } catch (e) {}
            try { _cm3dVistaSet(0.6) } catch (e) {}
            try { _cm3dInsSet() } catch (e) {}
          })()`);
          await pg.waitForTimeout(650);
          const pz = await pg.evaluate(`window.__P17B.piezas()`);
          if (!pz.length) { esc[E.k] = { error: 'sin piezas' }; continue }
          /* cavidad = la mas gruesa; vaso = la mas fina con radio util */
          const ordn = (x) => { const n = parseInt(String(x.k).slice(1), 10); return isNaN(n) ? 999 : n };
          const ord = pz.slice().sort((a, b) => b.r - a.r);
          const cav = ord[0];
          /* el vaso: la pieza mas gruesa que NO es una de las cuatro camaras ni una orejuela
             -los ordinales m0 a m5-, asi que es una arteria, una vena o un extra */
          const vaso = ord.filter(x => ordn(x) >= 6 && x.k !== cav.k)[0] || null;
          const bg = (await pg.evaluate(`window.__P17B.bg`));
          const A = await pg.evaluate(`window.__P17B.foto()`);
          const res = {};
          for (const [nom, tg] of [['cavidad', cav], ['vaso', vaso]]) {
            if (!tg) { res[nom] = { error: 'sin objetivo' }; continue }
            await pg.evaluate(`window.__P17B.ocultar(${tg.i}, false)`);
            await pg.waitForTimeout(220);
            const C = await pg.evaluate(`window.__P17B.foto()`);
            await pg.evaluate(`window.__P17B.ocultar(${tg.i}, true)`);
            await pg.evaluate(`window.__P17B.sinColor(${JSON.stringify(tg.k)}, true)`);
            await pg.waitForTimeout(220);
            const B = await pg.evaluate(`window.__P17B.foto()`);
            await pg.evaluate(`window.__P17B.sinColor(${JSON.stringify(tg.k)}, false)`);
            await pg.waitForTimeout(120);
            if (!A || !B || !C) { res[nom] = { error: 'sin foto' }; continue }
            res[nom] = Object.assign({ clave: tg.k, r: +tg.r.toFixed(3) }, cmp(A.d, B.d, C.d, A.w, A.h, bg));
          }
          esc[E.k] = res;
        } catch (e) { esc[E.k] = { error: String(e && e.message || e) } }
      }
      R.temas[tema] = { escenas: esc, errores: errs.slice(0, 6), bg: await pg.evaluate(`window.__P17B.bg`) };
      await ctx.close();
    }
  } finally { await br.close() }
  fs.writeFileSync(OUTF, JSON.stringify(R, null, 1));
  console.log('OK ->', OUTF);
  for (const t of Object.keys(R.temas)) {
    const T = R.temas[t]; if (!T.escenas) { console.log(t, 'ERROR', T.error); continue }
    for (const k of Object.keys(T.escenas)) {
      const e = T.escenas[k];
      for (const n of ['cavidad', 'vaso']) {
        const v = e[n]; if (!v) continue;
        if (v.error) { console.log(`${MOTOR} ${t} ${k} ${n}: ERROR ${v.error}`); continue }
        console.log(`${MOTOR} ${t} ${k} ${n}: detras ${v.detras_pct}% (${v.detras_ok}/${v.detras_tot}) centro ${v.detras_int_pct}% (${v.detras_int_ok}/${v.detras_int_tot}) banda ${v.banda} interior ${v.int_pct}% halo ${v.halo} ancho ${v.halo_ancho} contr(fondo) ${v.halo_contraste_fondo} contr(pico) ${v.halo_contraste_pico}`);
      }
    }
  }
})();
