/*
 * _probe_pant7c3.mjs - PANT-7 commit 3: los tres globos, el resalte del signo 60/60 y la
 * barra del tiempo de aceleracion con sus cuatro tramos.
 * Nombre propio: verificado con ls, no existia.
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda.
 *   node scripts/_probe_pant7c3.mjs --file <index.html> --out <json>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p7c3.json';
const ANCHOS = [1440, 1000, 768, 390];

const PREP = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m=document.getElementById(id); if(m) m.style.display='none' });
  document.querySelectorAll('*').forEach(e => { e.style.transition='none'; e.style.animation='none' });
  return true;
})()`;

/* Abre la pestania y los acordeones de un boton y lo clickea de verdad. */
const ABRIRCLIC = `((clave) => {
  const bs = Array.prototype.slice.call(document.querySelectorAll('[data-vinfo="' + clave + '"]'));
  const out = [];
  bs.forEach((bt, i) => {
    let tabId = '?';
    { let n = bt; while (n) { if (n.id && /^tab-/.test(n.id)) { tabId = n.id; break } n = n.parentElement } }
    if (tabId !== '?') { try { showTab(tabId.replace(/^tab-/,'')) } catch(e){} }
    { let n = bt, g = 0;
      while (n && g++ < 40) {
        if (n.classList && n.classList.contains('sacc-body') && !n.classList.contains('open')) {
          const h = n.previousElementSibling; if (h) h.click();
        }
        if (n.id && getComputedStyle(n).display === 'none') {
          const h2 = document.querySelector('[onclick*="' + n.id + '"]'); if (h2) h2.click();
        }
        n = n.parentElement;
      }
    }
    document.querySelectorAll('*').forEach(e => { e.style.transition='none'; e.style.animation='none' });
    bt.scrollIntoView({ block: 'center' });
    try { if (typeof vInfoCerrar === 'function') vInfoCerrar(true) } catch(e){}
    const rb = bt.getBoundingClientRect();
    const r = { i: i, pest: tabId, clases: bt.className,
                boton: Math.round(rb.width) + 'x' + Math.round(rb.height),
                glifo: (bt.textContent||'').trim() };
    try {
      bt.click();
      const c = document.getElementById('vinfo-card');
      const vis = !!(c && getComputedStyle(c).display !== 'none' && c.getBoundingClientRect().width > 0);
      r.abre = vis;
      if (c) { const rc = c.getBoundingClientRect();
        r.card = Math.round(rc.width) + 'x' + Math.round(rc.height) + ' @' + Math.round(rc.x) + ',' + Math.round(rc.y);
        r.chars = (c.textContent||'').trim().length;
        r.dentro = (rc.x >= 0 && rc.y >= 0 && rc.right <= innerWidth + 1 && rc.bottom <= innerHeight + 1);
        r.scroll = c.scrollHeight > c.clientHeight + 2;
        r.txt = (c.textContent||'').replace(/\\s+/g,' ').slice(0, 1600);
      }
      /* CERRAR: segundo toque, clic afuera y Escape */
      bt.click();
      r.cierraSegundoToque = !(document.getElementById('vinfo-card')
        && getComputedStyle(document.getElementById('vinfo-card')).display !== 'none');
      bt.click();
      document.body.click();
      r.cierraAfuera = !(document.getElementById('vinfo-card')
        && getComputedStyle(document.getElementById('vinfo-card')).display !== 'none');
      bt.click();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      r.cierraEscape = !(document.getElementById('vinfo-card')
        && getComputedStyle(document.getElementById('vinfo-card')).display !== 'none');
      try { if (typeof vInfoCerrar === 'function') vInfoCerrar(true) } catch(e){}
    } catch (e) { r.abre = 'EXC ' + String(e).slice(0,80) }
    out.push(r);
  });
  return out;
})(CLAVE)`;

/* El resalte: 59, 60 y vacio. Mide el color COMPUTADO de los dos rotulos y el contraste. */
const RESALTE = `((tap) => {
  const S=(id,v2)=>{const e=document.getElementById(id); if(!e) return 0; e.value=v2;
    e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); return 1};
  try { showTab('vd') } catch(e){}
  S('tvia', tap);
  try { if (typeof calcVD === 'function') calcVD() } catch(e){}
  try { if (typeof calcTEP === 'function') calcTEP() } catch(e){}
  try { if (typeof tep6060Resalte === 'function') tep6060Resalte() } catch(e){}
  const lum = (c) => { const m=/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/.exec(c); if(!m) return null;
    const f=(x)=>{x=x/255; return x<=0.03928 ? x/12.92 : Math.pow((x+0.055)/1.055,2.4)};
    return 0.2126*f(+m[1]) + 0.7152*f(+m[2]) + 0.0722*f(+m[3]) };
  const cont = (a,b) => { const la=lum(a), lb=lum(b); if(la==null||lb==null) return null;
    const hi=Math.max(la,lb), lo=Math.min(la,lb); return Math.round(((hi+0.05)/(lo+0.05))*100)/100 };
  const fondo = (e) => { let n=e; while(n && n!==document.documentElement) {
      const bg = getComputedStyle(n).backgroundColor;
      if (bg && !/rgba\\(0, 0, 0, 0\\)|transparent/.test(bg)) return bg; n=n.parentElement }
    return getComputedStyle(document.body).backgroundColor };
  const o = { tap: tap, estado: (typeof tep6060Resalte==='function') ? tep6060Resalte() : 'sin fn' };
  ['tep-6060-lbl','tep-6060-fila-lbl'].forEach(id => {
    const e = document.getElementById(id);
    if (!e) { o[id] = 'NO EXISTE'; return }
    const cs = getComputedStyle(e);
    o[id] = { color: cs.color, peso: cs.fontWeight, contraste: cont(cs.color, fondo(e)),
              txt: (e.textContent||'').trim().slice(0,20) };
  });
  /* Que NO agregue texto ni cambie el campo del medico */
  o.selValor = (document.getElementById('tep_signo6060')||{}).value;
  o.spanTxt = ((document.getElementById('tep-6060-interp')||{}).textContent||'').trim();
  o.score = ((document.getElementById('tep-score')||{}).textContent||'').trim();
  return o;
})(TAP)`;

/* La barra del tiempo de aceleracion: cuantos tramos y con que cortes. */
const BARRA = `(() => {
  const o = {};
  try { o.grados = [40,59,60,79,80,105,106,150].map(x => x + '=' + (typeof vdTapGrado==='function' ? vdTapGrado(x) : 'sin fn')) } catch(e){ o.gradErr=String(e).slice(0,80) }
  try { o.catViejo = [59,104,105,106].map(x => x + '=' + (typeof vdTapCat==='function' ? vdTapCat(x) : 'sin fn')) } catch(e){}
  try { o.umbral = (typeof UMBRAL_TAP_HTP !== 'undefined') ? UMBRAL_TAP_HTP : 'sin const' } catch(e){ o.umbral='EXC' }
  try { o.tabla = (typeof ASE25_T1 !== 'undefined' && ASE25_T1.vd_tap)
        ? ASE25_T1.vd_tap.bandas.map(b => b.g + (b.op ? (' ' + b.op + b.v) : '')).join(' | ') : 'SIN FILA' } catch(e){}
  /* La barra dibujada en Referencias */
  try { showTab('referencias') } catch(e){}
  try { const b = document.querySelector('[onclick*="ref-vd2"], [data-ref="vd2"]'); if (b) b.click() } catch(e){}
  const bar = document.querySelector('[data-ev-barra="ref-vd-tap"], [data-ev-barra="vd-tap"]');
  o.barraHay = !!bar;
  if (bar) { o.tramos = bar.querySelectorAll('[data-ev-tramo], .ev-tramo').length;
             o.barTxt = (bar.textContent||'').replace(/\\s+/g,' ').slice(0,240) }
  const notas = Array.prototype.slice.call(document.querySelectorAll('.ev-nota'))
    .map(e => (e.textContent||'').replace(/\\s+/g,' ').slice(0,220));
  o.notas = notas;
  return o;
})()`;

const res = { file: FILE, anchos: {} };
const nav = await _pw.chromium.launch({ channel: 'chrome' });
for (const w of ANCHOS) {
  const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e).slice(0, 150)));
  pg.on('console', m => { if (m.type() === 'error') errs.push('C:' + m.text().slice(0, 150)) });
  const r = {};
  try {
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(1200);
    await pg.evaluate(PREP);
    for (const k of ['vd-tei', 'tep-6060', 'vd-triv', 'pul-balik']) {
      r[k] = await pg.evaluate(ABRIRCLIC.replace('CLAVE', JSON.stringify(k)));
    }
    r.resalte = {};
    for (const t of ['59', '60', '']) {
      r.resalte[t === '' ? 'vacio' : t] = await pg.evaluate(RESALTE.replace('TAP', JSON.stringify(t)));
    }
    if (w === 1440) r.barra = await pg.evaluate(BARRA);
  } catch (e) { r.error = String(e).slice(0, 200) }
  r.errores = errs.length; r.err1 = errs[0] || '';
  res.anchos[w] = r;
  await ctx.close();
}
await nav.close();
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log('escrito ' + OUTF);
