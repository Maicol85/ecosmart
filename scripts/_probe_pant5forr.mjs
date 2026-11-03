/*
 * _probe_pant5forr.mjs - el perfil hemodinamico y el Forrester (PANT-5, commit 2).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 * Verifica la PREMISA: el mensaje de lo que falta aparece TRES veces, y uno tapa los rotulos
 * del grafico. Y mide el alto y el ancho de la tarjeta antes y despues.
 *   node scripts/_probe_pant5forr.mjs --file <index.html>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p5forr.json';
const ANCHOS = [1440, 1000, 768, 390];

const JS = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  const o = {};
  try { showTab('hemodinamica') } catch (e) {}
  const sec = document.getElementById('hemo-seccion') || document.getElementById('calculos-seccion');
  /* la tarjeta se abre por el encabezado que la nombra */
  const hs = Array.prototype.slice.call(document.querySelectorAll('h2.card-head'));
  hs.forEach(h => { if (/Hemodin|C.lculos/i.test(h.textContent || '')) { const m = (h.getAttribute('onclick')||'').match(/toggleCard\\('([^']+)'/);
    if (m) { const t = document.getElementById(m[1]); if (t && getComputedStyle(t).display === 'none') h.click() } } });
  /* ⚠️ DENOMINADOR: EL GRAFICO NO SE PINTA SOLO AL ABRIR LA PESTANA. Quien lo dibuja es
     hemoForrGrafSync, que cuelga del BARRIDO DE ESPEJOS, y quien escribe el span del perfil es
     calcHemo. Sin llamarlos, la sonda media sobre un grafico de CERO caracteres y el censo del
     mensaje daba cero apariciones: un denominador vacio que se lee igual que «no se reproduce». */
  try { if (typeof calcHemo === 'function') calcHemo() } catch (e) { o.hemoErr = String(e) }
  try { if (typeof hemoForrGrafSync === 'function') hemoForrGrafSync() } catch (e) { o.grafErr = String(e) }
  const forrEl = document.getElementById('hemo-forrester');
  if (!forrEl) { o.error = 'NO HAY hemo-forrester'; return o }
  /* ⚠️ EL CENSO VA SOBRE LA TARJETA ENTERA Y NO SOBRE LA .calc-box, Y ES UNA LECCION MEDIDA DE
     ESTA MISMA TANDA: despues del commit 2 el grafico vive FUERA de esa caja -en la columna
     derecha de la fila-, asi que un censo acotado a la caja dejaba de ver el mensaje de abajo y
     la cuenta bajaba de tres a uno sin que eso probara nada. */
  const caja = forrEl.closest('.card-body') || forrEl.closest('.card') || forrEl.closest('.calc-box');
  const tarjeta = caja;
  caja.scrollIntoView({ block:'center' });
  /* DENOMINADOR: el mensaje de lo que falta, con el formulario SIN indice cardiaco ni PCP. */
  const falta = (typeof forrFaltaTxt === 'function') ? forrFaltaTxt(false, false) : 'SIN FN';
  o.msg = falta;
  /* CENSO: cuantas veces aparece el mensaje en la tarjeta, nodo por nodo. */
  const clave = 'presi.n capilar pulmonar estimada';
  const re = new RegExp(clave, 'i');
  const nodos = [];
  const rec = (n) => { if (n.nodeType === 3) { if (re.test(n.nodeValue||'')) nodos.push((n.parentNode.id || n.parentNode.tagName) + ':' + (n.nodeValue||'').trim().slice(0,60)); return }
    if (n.nodeType !== 1) return; Array.prototype.slice.call(n.childNodes).forEach(rec) };
  rec(caja);
  o.apariciones = nodos.length;
  o.donde = nodos;
  /* El grafico: sus rotulos y si alguno queda tapado por el mensaje. */
  const graf = document.getElementById('hemo-forr-graf');
  o.grafChars = graf ? graf.innerHTML.length : 0;
  o.grafRotulos = graf ? Array.prototype.slice.call(graf.querySelectorAll('text')).map(t => (t.textContent||'').trim()).filter(x => x) : [];
  /* Cruce real en los DOS ejes entre cada nodo del mensaje y cada rotulo del grafico. */
  const inter = (a,b) => Math.max(0, Math.min(a.right,b.right)-Math.max(a.left,b.left)) * Math.max(0, Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
  const msgs = Array.prototype.slice.call(caja.querySelectorAll('*')).filter(e => {
    const t = (e.textContent||''); return re.test(t) && e.children.length === 0 });
  o.nMsgNodos = msgs.length;
  o.tapa = [];
  msgs.forEach(m => { const rm = m.getBoundingClientRect(); if (rm.width === 0) return;
    (o.grafRotulos.length ? Array.prototype.slice.call(graf.querySelectorAll('text')) : []).forEach(t => {
      const rt = t.getBoundingClientRect(); if (rt.width === 0) return;
      const a = inter(rm, rt); if (a > 1) o.tapa.push((m.id||m.tagName) + ' tapa "' + (t.textContent||'').trim() + '" = ' + Math.round(a)) }) });
  /* GEOMETRIA: la caja, el grafico y el aviso. */
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10, x: Math.round(r.x*10)/10, y: Math.round(r.y*10)/10 } };
  o.caja = R(forrEl.closest('.calc-box'));
  o.tarjeta = R(tarjeta);
  o.graf = R(graf);
  o.cajaValores = R(document.getElementById('hemo-gc') ? document.getElementById('hemo-gc').closest('.calc-box') : null);
  o.aviso = R(Array.prototype.slice.call(caja.querySelectorAll('div')).filter(d => /PCP estimada/.test(d.textContent||'') && d.children.length <= 2)[0]);
  /* LA FILA: existe la disposicion nueva? */
  const fila = document.getElementById('hemo-forr-fila');
  o.fila = R(fila);
  if (fila) { o.filaDisp = getComputedStyle(fila).display;
    const ys = Array.prototype.slice.call(fila.children).map(c => Math.round(c.getBoundingClientRect().y*10)/10);
    o.ladoALado = ys.length > 1 ? (Math.max.apply(null,ys) - Math.min.apply(null,ys) < 20) : null; }
  /* == EL CONTROL DEL LABORATORIO, CON SU CONTROL NEGATIVO ====================================
     El commit 2 apaga el mensaje del SVG con una opcion ADITIVA. La prueba de que el grafico del
     LABORATORIO no cambia es directa: el mismo generador, sin la opcion, tiene que seguir
     escribiendo su texto; con la opcion, no. Sin el control negativo, un cero no distingue
     «la opcion funciona» de «el generador no escribe nada». */
  try {
    if (typeof _labForrSVG === 'function' && typeof _labForrPal === 'function') {
      const pal = _labForrPal();
      const sinOpc = _labForrSVG([], pal, {});
      const conOpc = _labForrSVG([], pal, { sinVacio: true });
      const conTxt = _labForrSVG([], pal, { vacioTxt: 'XX-CENTINELA-XX' });
      o.labSinOpc = { chars: sinOpc.length, textos: (sinOpc.match(/<text/g) || []).length };
      o.labConOpc = { chars: conOpc.length, textos: (conOpc.match(/<text/g) || []).length };
      o.labCentinela = conTxt.indexOf('XX-CENTINELA-XX') > -1;
    } else o.labErr = 'SIN FN';
  } catch (e) { o.labErr = String(e).slice(0, 90) }
  o.scrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  return o;
})()`;

const res = { file: FILE, anchos: {} };
const nav = await _pw.chromium.launch({ channel: 'chrome' });
for (const w of ANCHOS) {
  const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e).slice(0, 140)));
  try {
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(1100);
    const r = await Promise.race([pg.evaluate(JS),
      new Promise((_, rj) => setTimeout(() => rj(new Error('timeout ' + w)), 60000))]);
    r.errores = errs.length; r.err1 = errs[0] || '';
    res.anchos[w] = r;
  } catch (e) { res.anchos[w] = { error: String(e).slice(0, 200) } }
  await ctx.close();
}
await nav.close();
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
for (const w of ANCHOS) {
  const a = res.anchos[w];
  if (a.error) { console.log(w + ' ERROR ' + a.error); continue }
  console.log(w + ' px | FALTA="' + a.msg + '" | msg x' + a.apariciones + ' ' + JSON.stringify(a.donde) +
    ' | graf chars=' + a.grafChars + ' rotulos=' + a.grafRotulos.length +
    ' | TAPA=' + (a.tapa.length ? JSON.stringify(a.tapa) : '0') +
    ' | TARJETA ' + (a.tarjeta ? a.tarjeta.w+'x'+a.tarjeta.h : '-') + ' | caja ' + (a.caja ? a.caja.w+'x'+a.caja.h : '-') +
    ' | valores ' + (a.cajaValores ? a.cajaValores.w+'x'+a.cajaValores.h : '-') +
    ' | graf ' + (a.graf ? a.graf.w+'x'+a.graf.h : '-') +
    ' | fila ' + (a.fila ? a.fila.w+'x'+a.fila.h+' disp='+a.filaDisp+' lado='+a.ladoALado : 'NO EXISTE') +
    ' | LAB sinOpc=' + JSON.stringify(a.labSinOpc) + ' conOpc=' + JSON.stringify(a.labConOpc) + ' centinela=' + a.labCentinela + ' | scrollX=' + a.scrollX + ' | err ' + a.errores + ' ' + (a.err1||''));
}
