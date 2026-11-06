/**
 * _probe_pant17col.mjs — EL COLOR AL TOCAR DEL CORAZON MAESTRO (PANT-17, commit 7).
 *
 * Mide POR PIXELES y no por geometria: el pedido es que tocar una estructura le saque el COLOR,
 * y un contorno no mueve un solo punto —es la leccion que PANT-14 dejo escrita—. El lienzo de
 * WebGL lleva `preserveDrawingBuffer:true`, asi que `toDataURL` sobre el devuelve el cuadro.
 *
 *   node scripts/_probe_pant17col.mjs --file <index.html> --out <json>
 */
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
let _pw; try { _pw = require(process.env.HOME + '/.pwtmp/node_modules/playwright') }
catch (e) { console.log('SIN PLAYWRIGHT'); process.exit(0) }
const RAIZ = process.cwd();
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p17col.json';

/* Abre el panel del corazon maestro en «Explorar» y deja el dibujo QUIETO. La frecuencia en
   CERO detiene el latido SIN pausar el bucle: con el bucle pausado el lienzo conserva el cuadro
   ANTERIOR y la cuenta sale la de la escena de antes —lo que PANT-14b pago con una medicion
   falsa y plausible—. */
const ABRIR = `(async () => {
  ["modalAvisoEco","login-overlay"].forEach(function (id) { var m = document.getElementById(id); if (m) m.style.display = "none" });
  try { if (typeof limpiarCampos === "function") limpiarCampos(true) } catch (e) {}
  /* EL CAMINO REAL, el mismo de _probe_pant14c_color.mjs: el boton de la pestania y despues el
     de abrir el modulo. Llamar a \`cc3dAbrir\` a mano no alcanza —la libreria se baja al abrir la
     seccion— y la espera tiene que ser larga: es un script de CDN. */
  var Q = String.fromCharCode(39);
  var bq = function (t) { return Array.prototype.filter.call(document.querySelectorAll("button[onclick]"),
    function (b) { return String(b.getAttribute("onclick")).indexOf(t) >= 0 })[0] };
  try { var b1 = bq("showTab(" + Q + "congenitas" + Q); if (b1) b1.click() } catch (e) {}
  await new Promise(function (r) { setTimeout(r, 420) });
  var ab = document.getElementById("cc3d-abrir"); if (ab) ab.click();
  await new Promise(function (r) { setTimeout(r, 3800) });
  if (!window.THREE) return { error: "sin THREE" };
  try { if (typeof cmSetModo === "function") cmSetModo("explorar") } catch (e) {}
  try { if (typeof cmSetBase === "function") cmSetBase("norm") } catch (e) {}
  var st = (typeof _cm3dEstado === "function") ? _cm3dEstado() : null;
  if (!st) return { error: "sin _cm3dEstado" };
  st.fc = 0; st.ins = false;
  try { if (typeof _cm3dInsSet === "function") _cm3dInsSet() } catch (e) {}
  await new Promise(function (r) { setTimeout(r, 500) });
  var cv = document.querySelector("#cm3d-cv canvas");
  return cv ? { ok:1, w: cv.width, h: cv.height } : { error: "sin lienzo" };
})()`;

/* Cuenta los pixeles OPACOS del lienzo y devuelve ademas un punto que cae sobre una estructura:
   el centroide de los opacos, corrido al opaco mas cercano. El fondo del renderer es
   transparente (`alpha:true`), asi que «opaco» es exactamente «hay dibujo». */
const MEDIR = `(() => {
  var cv = document.querySelector("#cm3d-cv canvas");
  if (!cv) return { error: "sin lienzo" };
  var o = document.createElement("canvas"); o.width = cv.width; o.height = cv.height;
  var x = o.getContext("2d"); x.drawImage(cv, 0, 0);
  var d; try { d = x.getImageData(0, 0, o.width, o.height).data } catch (e) { return { error: "getImageData" } }
  var n = 0, sx = 0, sy = 0, pts = [], dom = {};
  for (var y = 0; y < o.height; y += 2) for (var xx = 0; xx < o.width; xx += 2) {
    var i = (y * o.width + xx) * 4;
    if (d[i + 3] < 200) continue;
    var dk = (d[i] >> 4) + "," + (d[i + 1] >> 4) + "," + (d[i + 2] >> 4);
    (dom[dk] = dom[dk] || []).push([xx, y]);
    n++; sx += xx; sy += y; if (pts.length < 40000) pts.push([xx, y]);
  }
  /* EL PUNTO CAE SOBRE EL COLOR DOMINANTE, que es la estructura mas grande del cuadro: el pixel
     mas cercano al centroide puede ser una arteria fina que cruza el medio, y entonces el toque
     apaga algo de veinte pixeles y la medicion no distingue nada. */
  var dmk = null, dmn = -1;
  Object.keys(dom).forEach(function (k3) { if (dom[k3].length > dmn) { dmn = dom[k3].length; dmk = k3 } });
  if (dmk) pts = dom[dmk];
  if (!n) return { opacos: 0, punto: null };
  var cx = sx / n, cy = sy / n, bd = 1e12, bp = pts[0];
  for (var k = 0; k < pts.length; k++) {
    var dd = (pts[k][0] - cx) * (pts[k][0] - cx) + (pts[k][1] - cy) * (pts[k][1] - cy);
    if (dd < bd) { bd = dd; bp = pts[k] }
  }
  var rc = cv.getBoundingClientRect();
  /* FIRMA DEL CUADRO: un hash barato del dataURL. Dos cuadros con el mismo conteo de opacos
     pueden ser distintos —y al reves no—: sin la firma, «el mismo numero» no distingue «no
     cambio nada» de «cambio y el conteo quedo igual». */
  var fr = 0, du = "";
  try { du = cv.toDataURL("image/png") } catch (e) { du = "" }
  for (var z = 0; z < du.length; z++) { fr = ((fr << 5) - fr + du.charCodeAt(z)) | 0 }
  /* HISTOGRAMA: cuantos pixeles opacos hay de cada color, los seis mas frecuentes. Es lo que ve
     el color al tocar —un contorno gris en vez de un relleno de color—. */
  var hs = {};
  for (var y2 = 0; y2 < o.height; y2 += 2) for (var x2 = 0; x2 < o.width; x2 += 2) {
    var j = (y2 * o.width + x2) * 4; if (d[j + 3] < 200) continue;
    var key = (d[j] >> 4) + "," + (d[j + 1] >> 4) + "," + (d[j + 2] >> 4);
    hs[key] = (hs[key] || 0) + 1;
  }
  var top = Object.keys(hs).map(function (k2) { return [k2, hs[k2]] })
    .sort(function (a2, b2) { return b2[1] - a2[1] }).slice(0, 6);
  return { opacos: n, firma: fr, nColores: Object.keys(hs).length, top: top,
    gris: (hs["8,9,10"] || 0) + (hs["8,9,9"] || 0) + (hs["9,9,10"] || 0), dom: dmk, domN: dmn,
    lienzo: { w: o.width, h: o.height },
    punto: { cx: bp[0], cy: bp[1],
      clientX: rc.left + (bp[0] / o.width) * rc.width,
      clientY: rc.top + (bp[1] / o.height) * rc.height } };
})()`;

const GESTO = (x0, y0, x1, y1) => `(() => {
  var cv = document.querySelector("#cm3d-cv canvas"), host = document.getElementById("cm3d-cv");
  if (!cv || !host) return { error: "sin lienzo" };
  function ev(t, x, y) { return new PointerEvent(t, { clientX:x, clientY:y, bubbles:true, pointerId:1, isPrimary:true }) }
  host.setPointerCapture = function () {};
  host.dispatchEvent(ev("pointerdown", ${x0}, ${y0}));
  host.dispatchEvent(ev("pointermove", ${x1}, ${y1}));
  host.dispatchEvent(ev("pointerup", ${x1}, ${y1}));
  var st = (typeof _cm3dEstado === "function") ? _cm3dEstado() : null;
  return { claves: st ? Object.keys(st.sinColor || {}) : null };
})()`;

const CENSO = `(() => {
  var st = (typeof _cm3dEstado === "function") ? _cm3dEstado() : null;
  var campos = 0; document.querySelectorAll("input[id],select[id],textarea[id]").forEach(function () { campos++ });
  var btn = document.querySelectorAll("#cm3d-cv button, .cm3d-ctl button").length;
  return { claves: st ? Object.keys(st.sinColor || {}) : null, campos: campos, botones: btn,
    txtInf: (document.getElementById("cm3d-inf") || {}).textContent || "" };
})()`;

const res = { file: FILE, pasos: [], errs: [] };
const br = await _pw.chromium.launch({ channel: 'chrome' });
try {
  const pg = await br.newPage({ viewportSize: { width: 1440, height: 900 } });
  pg.on('pageerror', e => res.errs.push(String(e).slice(0, 140)));
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(1200);
  res.abrir = await pg.evaluate(ABRIR);
  if (res.abrir && res.abrir.error) { res.errs.push('abrir: ' + res.abrir.error) }
  else {
    const m0 = await pg.evaluate(MEDIR); res.pasos.push({ k: 'base', m: m0 });
    res.censo0 = await pg.evaluate(CENSO);
    if (m0 && m0.punto) {
      const P = m0.punto;
      /* (1) ARRASTRE: 40 px. NO puede apagar nada. */
      res.drag = await pg.evaluate(GESTO(Math.round(P.clientX), Math.round(P.clientY),
                                         Math.round(P.clientX) + 40, Math.round(P.clientY) + 18));
      await pg.waitForTimeout(260);
      res.pasos.push({ k: 'trasArrastre', m: await pg.evaluate(MEDIR) });
      /* (2) TOQUE: el mismo punto, sin mover. */
      res.tap1 = await pg.evaluate(GESTO(Math.round(P.clientX), Math.round(P.clientY),
                                         Math.round(P.clientX), Math.round(P.clientY)));
      await pg.waitForTimeout(260);
      res.pasos.push({ k: 'trasToque1', m: await pg.evaluate(MEDIR) });
      /* (3) SEGUNDO TOQUE en el mismo punto: le devuelve el color. */
      res.tap2 = await pg.evaluate(GESTO(Math.round(P.clientX), Math.round(P.clientY),
                                         Math.round(P.clientX), Math.round(P.clientY)));
      await pg.waitForTimeout(260);
      res.pasos.push({ k: 'trasToque2', m: await pg.evaluate(MEDIR) });
      /* (4) LA ESCENA CAMBIA: lo apagado se borra. */
      res.tap3 = await pg.evaluate(GESTO(Math.round(P.clientX), Math.round(P.clientY),
                                         Math.round(P.clientX), Math.round(P.clientY)));
      await pg.waitForTimeout(200);
      res.trasEscena = await pg.evaluate(`(() => { try { cmSetBase("fal") } catch (e) {}
        var st = _cm3dEstado(); return { claves: Object.keys(st.sinColor || {}) } })()`);
      await pg.waitForTimeout(400);
      /* (5) EL REPINTADO DEL MISMO DIBUJO CONSERVA LO APAGADO. */
      res.tap4 = await pg.evaluate(GESTO(Math.round(P.clientX), Math.round(P.clientY),
                                         Math.round(P.clientX), Math.round(P.clientY)));
      await pg.waitForTimeout(200);
      res.trasRepintado = await pg.evaluate(`(() => { try { cm3dSync() } catch (e) {}
        var st = _cm3dEstado(); return { claves: Object.keys(st.sinColor || {}) } })()`);
    }
    res.censo1 = await pg.evaluate(CENSO);
  }
} finally { await br.close() }
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log('OK ' + OUTF);
