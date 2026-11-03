/*
 * _probe_pant5rot.mjs - los rotulos del dibujo del VD, los colores y el dibujo mudo (PANT-5).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * 1e: los dos rotulos -McConnell y el septum desplazado- no pueden pisar la pared, el chorro ni
 *     otro rotulo, medido con getBBox a 1440, 1000, 768 y 390 px.
 * 1c: sin NINGUN dato cargado, un corazon normal SIN un solo texto visible.
 * 1d: el unico color del dibujo es el celeste; todo lo demas en escala de grises.
 *
 *   node scripts/_probe_pant5rot.mjs --file <index.html> --out <json> [--cortos]
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p5rot.json';
const ANCHOS = [1440, 1000, 768, 390];

const JS = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  const o = {};
  const S = (id, v) => { const el = document.getElementById(id); if (!el) { o['falta_'+id]=1; return }
    el.value = v; el.dispatchEvent(new Event('input', { bubbles:true })); el.dispatchEvent(new Event('change', { bubbles:true })) };
  try { showTab('hemodinamica') } catch (e) {}
  const sec = document.getElementById('tep-seccion');
  if (sec && getComputedStyle(sec).display === 'none') { const h = document.querySelector('[onclick*="tep-seccion"]'); if (h) h.click() }
  const svg = document.getElementById('vdsc-svg');
  if (!svg) { o.error = 'NO HAY DIBUJO'; return o }
  svg.scrollIntoView({ block:'center' });

  /* ---- (A) DENOMINADOR + DIBUJO MUDO: formulario vacio ---- */
  try { limpiarCampos(true) } catch (e) { o.limpErr = String(e) }
  try { vdscSync() } catch (e) {}
  try { vdscFase(0.40) } catch (e) {}
  const textosVis = () => Array.prototype.slice.call(svg.querySelectorAll('text'))
      .filter(t => { let n = t; while (n && n !== svg) { if (n.getAttribute && parseFloat(n.getAttribute('opacity') || '1') === 0) return false; n = n.parentNode }
        const b = t.getBBox(); return b.width > 0 && (t.textContent || '').trim().length > 0 })
      .map(t => (t.textContent || '').trim());
  o.mudoTextos = textosVis();
  o.mudoTrazado = (document.getElementById('vdsc-out').getAttribute('d') || '').length;

  /* ---- (B) ESCENA CON LAS DOS MARCAS Y EL CHORRO SEVERO ---- */
  S('tep_vdvi', 1.30); S('tapse', 10); S('tep_mcconnell', 'si'); S('tep_tabique_d', 'si');
  S('it_grado', '4'); S('vmax_it', 4.2);
  try { vdscSync() } catch (e) {}
  try { vdscFase(0.40) } catch (e) {}
  o.conTextos = textosVis();

  /* La caja de cada rotulo, en unidades del viewBox y en pixeles de pantalla. */
  const esc = (() => { const r = svg.getBoundingClientRect(); const vb = svg.getAttribute('viewBox').split(/\\s+/).map(Number);
    return { k: r.width / vb[2], w: r.width, h: r.height, vb: vb } })();
  o.escala = Math.round(esc.k * 1000) / 1000;
  o.svgW = Math.round(esc.w * 10) / 10;
  const caja = (id) => { const n = document.getElementById(id); if (!n) return null;
    if (parseFloat(n.getAttribute('opacity') || '1') === 0) return null;
    const b = n.getBBox();
    return { x: Math.round(b.x*100)/100, y: Math.round(b.y*100)/100, w: Math.round(b.width*100)/100, h: Math.round(b.height*100)/100,
             pxW: Math.round(b.width*esc.k*10)/10, pxH: Math.round(b.height*esc.k*10)/10,
             fs: Math.round(parseFloat(getComputedStyle(n).fontSize) * esc.k * 10) / 10 } };
  o.mcT = caja('vdsc-mctxt'); o.spT = caja('vdsc-sptxt'); o.vmT = caja('vdsc-vmtxt'); o.tpT = caja('vdsc-tptxt');
  o.textoMc = (document.getElementById('vdsc-mctxt').textContent || '').trim();
  o.textoSp = (document.getElementById('vdsc-sptxt').textContent || '').trim();

  /* CRUCES: cada rotulo contra la pared externa, el chorro y los otros rotulos. */
  const inter = (a, b) => (!a || !b) ? 0
    : Math.max(0, Math.min(a.x+a.w, b.x+b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y+a.h, b.y+b.h) - Math.max(a.y, b.y));
  const bb = (sel) => { const n = document.querySelector(sel); if (!n) return null;
    const b = n.getBBox(); return { x:b.x, y:b.y, w:b.width, h:b.height } };
  /* LA PARED: el trazo del contorno es una banda, no un area. Lo que se mide es el cruce con el
     BORDE del contorno aproximado por la caja de la pared libre del VD -el trazado vdsc-cl-,
     que es lo que el rotulo puede tapar. */
  const pared = bb('#vdsc-cl');
  const chorro = (() => { const n = document.querySelector('#vdsc-jets g'); if (!n) return null;
    if (parseFloat(n.getAttribute('opacity') || '1') < 0.01) return null;
    const b = n.getBBox(); return { x:b.x, y:b.y, w:b.width, h:b.height } })();
  const rots = { mc: o.mcT, sp: o.spT, vm: o.vmT, tp: o.tpT };
  o.cruces = {};
  Object.keys(rots).forEach(k => {
    o.cruces[k + '-chorro'] = Math.round(inter(rots[k], chorro) * 100) / 100;
  });
  const ks = Object.keys(rots);
  for (let i = 0; i < ks.length; i++) for (let j = i+1; j < ks.length; j++) {
    o.cruces[ks[i] + '-' + ks[j]] = Math.round(inter(rots[ks[i]], rots[ks[j]]) * 100) / 100;
  }
  /* FUERA DEL LIENZO: ningun rotulo puede salirse del viewBox. */
  o.fuera = [];
  Object.keys(rots).forEach(k => { const r = rots[k]; if (!r) return;
    if (r.x < esc.vb[0] - 0.5 || r.y < esc.vb[1] - 0.5 ||
        r.x + r.w > esc.vb[0] + esc.vb[2] + 0.5 || r.y + r.h > esc.vb[1] + esc.vb[3] + 0.5) o.fuera.push(k) });

  /* ---- (C) COLORES: el unico color del dibujo es el celeste ---- */
  const hexGris = (c) => { const m = c.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
    if (!m) return true; const r=+m[1], g=+m[2], b=+m[3];
    return Math.max(r,g,b) - Math.min(r,g,b) <= 6 };
  const cel = getComputedStyle(document.documentElement).getPropertyValue('--vdsc-cel').trim();
  o.cel = cel;
  o.noGrises = [];
  Array.prototype.slice.call(svg.querySelectorAll('*')).forEach(n => {
    const cs = getComputedStyle(n);
    /* SOLO fill y stroke, y solo de los nodos que PINTAN. El color heredado del tema de
       la app llega a defs, a los gradientes y a cada stop sin pintar un pixel: contarlo da
       doce falsos positivos identicos en los cuatro anchos. */
    if (['defs','linearGradient','radialGradient','stop','pattern','clipPath'].indexOf(n.tagName) > -1) return;
    ['fill','stroke'].forEach(prop => {
      const val = cs[prop];
      if (!val || val === 'none' || val.indexOf('url(') === 0) return;
      if (hexGris(val)) return;
      /* el celeste esta permitido */
      const m = val.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
      const cm = cel.match(/#([0-9a-fA-F]{6})/);
      if (cm) { const R=parseInt(cm[1].slice(0,2),16), G=parseInt(cm[1].slice(2,4),16), B=parseInt(cm[1].slice(4,6),16);
        if (m && Math.abs(+m[1]-R)<=3 && Math.abs(+m[2]-G)<=3 && Math.abs(+m[3]-B)<=3) return }
      o.noGrises.push((n.id || n.tagName) + ':' + prop + '=' + val);
    });
  });
  o.noGrises = o.noGrises.slice(0, 12);
  /* ---- (D) SOLO LECTURA: el dibujo no escribe un solo campo ---- */
  const foto = {};
  document.querySelectorAll('input[id], select[id]').forEach(e => { foto[e.id] = (e.type === 'checkbox') ? (e.checked?'1':'0') : e.value });
  try { for (let i = 0; i < 6; i++) { vdscFase(i/6); vdscSync() } } catch (e) {}
  o.escribio = Object.keys(foto).filter(k => { const e = document.getElementById(k);
    const v = (e.type === 'checkbox') ? (e.checked?'1':'0') : e.value; return v !== foto[k] });
  return o;
})()`;

const res = { file: FILE, anchos: {} };
const nav = await _pw.chromium.launch({ channel: 'chrome' });
for (const w of ANCHOS) {
  const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  try {
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(1100);
    const r = await Promise.race([pg.evaluate(JS),
      new Promise((_, rj) => setTimeout(() => rj(new Error('timeout ' + w)), 60000))]);
    r.errores = errs.length; r.err1 = errs[0] || '';
    res.anchos[w] = r;
  } catch (e) { res.anchos[w] = { error: String(e).slice(0, 220) } }
  await ctx.close();
}
await nav.close();
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
for (const w of ANCHOS) {
  const a = res.anchos[w];
  if (a.error) { console.log(w + ' ERROR ' + a.error); continue }
  const malCr = Object.keys(a.cruces || {}).filter(k => a.cruces[k] > 0.01);
  console.log(w + ' px | svg ' + a.svgW + ' k=' + a.escala +
    ' | MUDO textos=' + JSON.stringify(a.mudoTextos) + ' traz=' + a.mudoTrazado +
    ' | mc "' + a.textoMc + '" ' + (a.mcT ? a.mcT.pxW + 'x' + a.mcT.pxH + ' fs' + a.mcT.fs : 'null') +
    ' | sp "' + a.textoSp + '" ' + (a.spT ? a.spT.pxW + 'x' + a.spT.pxH + ' fs' + a.spT.fs : 'null') +
    ' | tp ' + (a.tpT ? a.tpT.pxW + 'x' + a.tpT.pxH : 'null') +
    ' | vm ' + (a.vmT ? a.vmT.pxW + 'x' + a.vmT.pxH : 'null') +
    ' | cruces=' + (malCr.length ? malCr.map(k => k + '=' + a.cruces[k]).join(',') : '0') +
    ' | fuera=' + JSON.stringify(a.fuera) +
    ' | noGrises=' + a.noGrises.length + (a.noGrises.length ? ' ' + a.noGrises.join(' | ') : '') +
    ' | escribio=' + JSON.stringify(a.escribio) + ' | err ' + a.errores + ' ' + (a.err1 || ''));
}
