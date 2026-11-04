/*
 * _probe_pant7vd.mjs - PANT-7 commit 1: el dibujo de sobrecarga del VD contra el
 * esquema valvular 2D. Mide ancho, alto y el tamano REAL en px de la letra de cada
 * rotulo de los dos, mas la geometria de la seccion y el hueco entre campos y lista.
 * Nombre propio: verificado con ls, no existia.
 *   node scripts/_probe_pant7vd.mjs --file <index.html> --out <json>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p7vd.json';
const ANCHOS = [1440, 1000, 768, 390];

/* La escena: McConnell, septum en D, IT severa y TAPSE cargados TODOS a la vez, que es
   la que la orden pide para medir si los rotulos se pisan. */
const ESCENA = `(() => {
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 0; e.value = v;
    e.dispatchEvent(new Event('input', {bubbles:true})); e.dispatchEvent(new Event('change', {bubbles:true})); return 1 };
  let n = 0;
  n += S('tep_mcconnell', 'si');
  n += S('tep_signo6060', 'si');
  n += S('tep_tabique_d', 'si');
  n += S('tep_vdvi', '1.4');
  n += S('tapse', '12');
  n += S('it_vmax', '4.2');
  n += S('it_grado', '4');
  n += S('vd_tap', '45');
  try { if (typeof calcTEP === 'function') calcTEP() } catch(e){}
  try { if (typeof calcVD === 'function') calcVD() } catch(e){}
  try { if (typeof vdscSync === 'function') vdscSync() } catch(e){}
  return n;
})()`;

const MEDIR = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  const o = {};
  const R = (sel) => { const e = document.querySelector(sel); if (!e) return null;
    const r = e.getBoundingClientRect();
    return { w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10, x: Math.round(r.x*10)/10, y: Math.round(r.y*10)/10 } };
  try { showTab('hemodinamica') } catch (e) { o.tabErr = String(e) }
  const sec = document.getElementById('tep-seccion');
  if (sec && getComputedStyle(sec).display === 'none') {
    const h = document.querySelector('[onclick*="tep-seccion"]'); if (h) h.click();
  }
  o.secAbierta = sec ? getComputedStyle(sec).display !== 'none' : null;
  o.sec = R('#tep-seccion');
  o.fila = R('#vdsc-fila');
  o.filaDisplay = (function(){ const f=document.getElementById('vdsc-fila'); return f?getComputedStyle(f).display:null })();
  o.campos = R('#vdsc-campos');
  o.caja = R('#vdsc-caja');
  o.lista = R('#vdsc-lista');
  o.dib = R('#vdsc-svg');
  o.play = R('#vdsc-play');
  /* El hueco vertical entre el fondo de los campos y el tope de la lista. */
  if (o.campos && o.lista) o.hueco = Math.round((o.lista.y - (o.campos.y + o.campos.h))*10)/10;
  /* Lado a lado: campos y caja comparten rango vertical. */
  if (o.campos && o.caja) o.ladoALado = Math.abs(o.campos.y - o.caja.y) < 20;
  /* El tamano REAL en px de la letra de cada <text> del dibujo: font-size del viewBox
     multiplicado por ancho/viewBox-ancho. Es la unica forma de saber a cuantos px se ve. */
  const letras = (svgId) => {
    const s = document.getElementById(svgId); if (!s) return null;
    const vb = (s.getAttribute('viewBox')||'').trim().split(/\\s+/).map(Number);
    const r = s.getBoundingClientRect();
    if (!vb || vb.length < 4 || !r.width) return { err: 'sin viewBox o sin caja' };
    /* LA ESCALA NO ES ancho/viewBox: con preserveAspectRatio xMidYMid meet -el valor por
       omision- el dibujo se encuadra DENTRO de la caja, asi que la escala es el MENOR de los
       dos cocientes. La primera version de esta sonda usaba el del ancho y daba 6,42 px donde
       el dibujo se ve en 9,37: una medicion plausible y falsa. */
    const k = Math.min(r.width / vb[2], r.height / vb[3]);
    const out = [];
    Array.prototype.slice.call(s.querySelectorAll('text')).forEach(t => {
      const fs = parseFloat(getComputedStyle(t).fontSize) || 0;
      let scr = null;
      try { const b = t.getBoundingClientRect(); scr = Math.round(b.height*100)/100 } catch(x){}
      out.push({ id: t.id || '', cls: t.getAttribute('class')||'', txt: (t.textContent||'').trim().slice(0,22),
                 fsVb: Math.round(fs*100)/100, px: Math.round(fs*k*100)/100, scrH: scr,
                 op: getComputedStyle(t).opacity });
    });
    return { vbW: vb[2], vbH: vb[3], w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10,
             k: Math.round(k*1000)/1000, textos: out };
  };
  o.vdscLetras = letras('vdsc-svg');
  /* Cruces: ningun rotulo visible pisa la pared, el chorro, otro rotulo ni el borde. */
  (function(){
    const s = document.getElementById('vdsc-svg'); if (!s) { o.cruces='SIN DIBUJO'; return }
    const vis = Array.prototype.slice.call(s.querySelectorAll('text')).filter(t => {
      const cs = getComputedStyle(t); if (cs.display==='none'||cs.visibility==='hidden') return false;
      if (parseFloat(cs.opacity) < 0.05) return false;
      return (t.textContent||'').trim().length > 0;
    });
    o.visN = vis.length;
    o.visTxt = vis.map(t => (t.textContent||'').trim().slice(0,22));
    const caja = (e) => { try { const b = e.getBBox(); return b } catch(x){ return null } };
    const inter = (a,b) => { if(!a||!b) return 0;
      const w = Math.min(a.x+a.width,b.x+b.width) - Math.max(a.x,b.x);
      const h = Math.min(a.y+a.height,b.y+b.height) - Math.max(a.y,b.y);
      return (w>0&&h>0) ? Math.round(w*h*100)/100 : 0 };
    const bs = vis.map(t => ({ t: (t.textContent||'').trim().slice(0,16), b: caja(t) }));
    const pares = [];
    for (let i=0;i<bs.length;i++) for (let j=i+1;j<bs.length;j++) {
      const a = inter(bs[i].b, bs[j].b); if (a>0) pares.push(bs[i].t+' x '+bs[j].t+' = '+a);
    }
    o.crucesTexto = pares;
    /* Contra la pared (el contorno), el chorro y el borde del lienzo. */
    const vb = (s.getAttribute('viewBox')||'').trim().split(/\\s+/).map(Number);
    const fuera = [];
    bs.forEach(x => { if (!x.b) return;
      if (x.b.x < vb[0] || x.b.y < vb[1] || x.b.x+x.b.width > vb[0]+vb[2] || x.b.y+x.b.height > vb[1]+vb[3])
        fuera.push(x.t + ' bbox ' + Math.round(x.b.x)+','+Math.round(x.b.y)+' '+Math.round(x.b.width)+'x'+Math.round(x.b.height));
    });
    o.fueraLienzo = fuera;
    const jet = s.querySelector('#vdsc-jets path, #vdsc-jets *');
    const jb = jet ? caja(jet) : null;
    o.crucesChorro = jb ? bs.filter(x => inter(x.b, jb) > 0).map(x => x.t + ' x chorro = ' + inter(x.b, jb)) : 'SIN CHORRO';
  })();
  /* El esquema valvular 2D: se abre por su boton real. */
  try { showTab('valvulas') } catch (e) {}
  try { const b = document.getElementById('v2d-abrir'); if (b) b.click() } catch (e) { o.v2dErr = String(e) }
  o.v2dSvg = R('#v2d-svg');
  o.v2dLetras = letras('v2d-svg');
  try { if (typeof v2dCerrar === 'function') v2dCerrar() } catch (e) {}
  return o;
})()`;

const res = { file: FILE, anchos: {} };
const nav = await _pw.chromium.launch({ channel: 'chrome' });
for (const w of ANCHOS) {
  const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e).slice(0, 160)));
  pg.on('console', m => { if (m.type() === 'error') errs.push('C:' + m.text().slice(0, 160)) });
  try {
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(1200);
    const nEsc = await pg.evaluate(ESCENA);
    await pg.waitForTimeout(500);
    const r = await Promise.race([pg.evaluate(MEDIR),
      new Promise((_, rj) => setTimeout(() => rj(new Error('timeout ' + w)), 60000))]);
    r.escenaCampos = nEsc;
    r.errores = errs.length;
    r.err1 = errs[0] || '';
    res.anchos[w] = r;
  } catch (e) { res.anchos[w] = { error: String(e).slice(0, 200) } }
  await ctx.close();
}
await nav.close();
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log('escrito ' + OUTF);
