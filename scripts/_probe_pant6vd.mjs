/*
 * _probe_pant6vd.mjs - el dibujo de sobrecarga del VD, mas grande (PANT-6, commit 2).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *   node scripts/_probe_pant6vd.mjs --file <index.html>
 * Mide, a los cuatro anchos: el ancho del dibujo, el viewBox, el tamanio REAL en px de cada
 * rotulo y de los dos numeros, el alto de los campos y de la lista de criterios, los cruces
 * entre rotulos y la pared / el chorro / los numeros, y el ancho minimo para 12 px.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const FILE = arg('--file') || (RAIZ + '/index.html');
const ANCHOS = [1440, 1000, 768, 390];

const JS = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  const o = {};
  try { showTab('hemodinamica') } catch (e) { o.tabErr = String(e) }
  /* ⚠️ LA SECCION VIVE EN UN toggleCard, NO EN UN ACORDEON sacc, Y NACE EN display:none.
     Sin abrirla por su encabezado real el SVG informa 0x0 y los diez textos salen en 0 px: un
     denominador vacio que se lee igual que «el dibujo no existe». */
  (function(){ const sec = document.getElementById('tep-seccion');
    if (sec && getComputedStyle(sec).display === 'none') {
      const h = document.querySelector('[onclick*="tep-seccion"]');
      if (h) h.click(); else sec.style.display = '' } })();
  /* Las DOS marcas y los dos numeros cargados, que es el denominador: sin datos el dibujo es un
     corazon normal MUDO y no hay un solo rotulo que medir. */
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles:true }));
    e.dispatchEvent(new Event('change', { bubbles:true })); return e.value };
  S('tep_mcconnell','si'); S('tep_tabique_d','si'); S('tep_vdvi','1.3');
  S('tapse','12'); S('vmax_it','3.6'); S('it_grado','4');
  try { calcTEP() } catch (e) {} try { calcVD() } catch (e) {}
  try { if (typeof vdscSync === 'function') vdscSync() } catch (e) { o.syncErr = String(e) }
  /* El latido se para para que la foto sea de UNA fase y los cruces no dependan del instante. */
  try { if (typeof vdscFase === 'function') vdscFase(0.0) } catch (e) {}
  const sv = document.getElementById('vdsc-svg');
  if (!sv) { o.err = 'SIN SVG'; return o }
  const r = sv.getBoundingClientRect();
  o.svgW = Math.round(r.width*10)/10; o.svgH = Math.round(r.height*10)/10;
  const vb = (sv.getAttribute('viewBox')||'').split(/\\s+/).map(Number);
  o.vb = sv.getAttribute('viewBox'); o.vbW = vb[2]; o.vbH = vb[3];
  o.escala = o.vbW ? Math.round(o.svgW / o.vbW * 1000)/1000 : null;
  /* El tamanio REAL en px de cada texto visible: font-size del viewBox por la escala. */
  o.textos = [];
  Array.prototype.slice.call(sv.querySelectorAll('text')).forEach(t => {
    const vis = t.getAttribute('opacity') !== '0' &&
      (!t.parentNode.getAttribute || t.parentNode.getAttribute('opacity') !== '0');
    if (!vis) return;
    const fs = parseFloat(getComputedStyle(t).fontSize) || 0;
    let bb = null; try { bb = t.getBBox() } catch (e) {}
    o.textos.push({ id: t.id || '(sin id)', txt: (t.textContent||'').trim().slice(0,22),
      fsVb: Math.round(fs*100)/100, fsPx: Math.round(fs*o.escala*100)/100,
      bb: bb ? [Math.round(bb.x*10)/10, Math.round(bb.y*10)/10, Math.round(bb.width*10)/10, Math.round(bb.height*10)/10] : null });
  });
  o.minFsPx = o.textos.length ? Math.min.apply(null, o.textos.map(t => t.fsPx)) : null;
  o.maxFsPx = o.textos.length ? Math.max.apply(null, o.textos.map(t => t.fsPx)) : null;
  /* El ancho MINIMO del dibujo para que el rotulo mas chico llegue a 12 px. */
  const fsMin = o.textos.length ? Math.min.apply(null, o.textos.map(t => t.fsVb)) : null;
  o.anchoPara12 = (fsMin && o.vbW) ? Math.ceil(12 * o.vbW / fsMin) : null;
  /* CRUCES: cada rotulo contra la pared (el contorno), el chorro y los otros rotulos. */
  const bbOf = (id) => { const e = document.getElementById(id); if (!e) return null;
    if (e.getAttribute('opacity') === '0') return null;
    try { const b = e.getBBox(); return b.width ? b : null } catch (x) { return null } };
  const inter = (a,b) => { if (!a||!b) return 0;
    const w = Math.min(a.x+a.width,b.x+b.width) - Math.max(a.x,b.x);
    const h = Math.min(a.y+a.height,b.y+b.height) - Math.max(a.y,b.y);
    return (w>0&&h>0) ? Math.round(w*h*10)/10 : 0 };
  const ROT = ['vdsc-mctxt','vdsc-sptxt'];
  const NUM = ['vdsc-tptxt','vdsc-vmtxt'];
  o.cruces = {};
  ROT.forEach(a => { ROT.concat(NUM).forEach(b => { if (a>=b) return;
    const v = inter(bbOf(a), bbOf(b)); if (v) o.cruces[a+' x '+b] = v }) });
  /* contra el chorro de la IT y contra la pared */
  const jets = document.getElementById('vdsc-jets');
  let bbJet = null; try { bbJet = jets && jets.getBBox() } catch (e) {}
  ROT.concat(NUM).forEach(a => { const v = inter(bbOf(a), bbJet); if (v) o.cruces[a+' x chorro'] = v });
  /* fuera del lienzo */
  o.fuera = [];
  ROT.concat(NUM).forEach(id => { const b = bbOf(id); if (!b) return;
    if (b.x < vb[0] || b.y < vb[1] || b.x+b.width > vb[0]+vb[2] || b.y+b.height > vb[1]+vb[3])
      o.fuera.push(id) });
  /* La maqueta: campos a la izquierda, dibujo a la derecha. */
  const R = (e) => { if (!e) return null; const q = e.getBoundingClientRect();
    return { w: Math.round(q.width*10)/10, h: Math.round(q.height*10)/10, x: Math.round(q.x*10)/10, y: Math.round(q.y*10)/10 } };
  o.fila = R(document.getElementById('vdsc-fila'));
  o.campos = R(document.getElementById('vdsc-campos'));
  o.caja = R(document.getElementById('vdsc-caja'));
  o.ladoALado = (o.campos && o.caja) ? (Math.abs(o.campos.y - o.caja.y) < 30 && o.campos.x < o.caja.x) : null;
  /* la lista de criterios: su alto, y que su contenido no cambie */
  const cb = document.querySelector('#tep-seccion .calc-box');
  o.lista = R(cb);
  o.listaFilas = cb ? cb.querySelectorAll('.calc-row').length : null;
  o.listaChars = cb ? (cb.textContent||'').replace(/\\s+/g,' ').trim().length : null;
  /* el boton de pausa */
  o.play = R(document.getElementById('vdsc-play'));
  o.nControles = document.querySelectorAll('#vdsc-caja button, #vdsc-caja input, #vdsc-caja select').length;
  o.secAbierta = (function(){ const e=document.getElementById('tep-seccion');
    return e ? getComputedStyle(e).display !== 'none' : null })();
  /* un solo color: cuantos nodos pintan algo fuera de la escala de grises mas el celeste */
  o.fueraDeGris = (function(){
    const cel = ['rgb(92, 195, 242)','rgb(42, 167, 232)'];
    let n = 0;
    Array.prototype.slice.call(sv.querySelectorAll('*')).forEach(e => {
      ['fill','stroke','color'].forEach(p => { const c = getComputedStyle(e)[p] || '';
        const m = c.match(/^rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);
        if (!m) return;
        const g = (m[1]===m[2] && m[2]===m[3]);
        if (!g && cel.indexOf('rgb('+m[1]+', '+m[2]+', '+m[3]+')') < 0) n++ }) });
    return n })();
  o.scrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  return o;
})()`;

const nav = await _pw.chromium.launch({ channel: 'chrome' });
for (const w of ANCHOS) {
  const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(String(e).slice(0, 110)));
  try {
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(1100);
    const a = await Promise.race([pg.evaluate(JS),
      new Promise((_, rj) => setTimeout(() => rj(new Error('timeout')), 60000))]);
    console.log(String(w).padStart(4) + ' | svg ' + a.svgW + 'x' + a.svgH + ' vb=' + a.vb +
      ' esc=' + a.escala + ' | fs px min/max=' + a.minFsPx + '/' + a.maxFsPx +
      ' | anchoPara12=' + a.anchoPara12 +
      ' | cruces=' + Object.keys(a.cruces||{}).length + JSON.stringify(a.cruces) +
      ' fuera=' + (a.fuera||[]).length + (a.fuera && a.fuera.length ? JSON.stringify(a.fuera) : '') +
      ' | fila ' + (a.fila?a.fila.w+'x'+a.fila.h:'-') + ' campos ' + (a.campos?a.campos.w+'x'+a.campos.h:'-') +
      ' caja ' + (a.caja?a.caja.w+'x'+a.caja.h:'-') + ' lado=' + a.ladoALado +
      ' | lista ' + (a.lista?a.lista.w+'x'+a.lista.h:'-') + ' filas=' + a.listaFilas + ' chars=' + a.listaChars +
      ' | play ' + (a.play?a.play.w+'x'+a.play.h:'-') + ' nCtrl=' + a.nControles +
      ' | fueraDeGris=' + a.fueraDeGris + ' scrollX=' + a.scrollX +
      ' | err ' + errs.length + ' ' + (errs[0]||''));
    (a.textos||[]).forEach(t => console.log('        ' + t.id.padEnd(14) + ' fs ' +
      String(t.fsVb).padStart(5) + ' vb -> ' + String(t.fsPx).padStart(6) + ' px  "' + t.txt + '"'));
  } catch (e) { console.log(w + ' ERROR ' + String(e).slice(0, 180)) }
  await ctx.close();
}
await nav.close();
