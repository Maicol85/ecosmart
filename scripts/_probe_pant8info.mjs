/*
 * _probe_pant8info.mjs - PANT-8, commit 4: el globo de la calcificacion. Abre y cierra por las
 * TRES vias (clic, fuera, Escape), a los cuatro anchos, con la letra unica de los carteles y
 * sin recortes. Nombre propio: verificado con ls, no existia.
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda.
 *   node scripts/_probe_pant8info.mjs --file <index.html> --out <json>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p8info.json';
const ANCHOS = [1440, 1000, 768, 390];
const CLAVE = 'tavi-calc';

const PREP = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m=document.getElementById(id); if(m) m.style.display='none' });
  const o = {};
  try { showTab('ete') } catch(e) { o.e1 = String(e).slice(0,70) }
  const sec = document.getElementById('ete-seccion-tavi');
  if (sec && getComputedStyle(sec).display === 'none') { try { toggleEteSeccion('tavi') } catch(e) {} }
  try { if (typeof eteTaviTab === 'function') eteTaviTab('pre') } catch(e) {}
  document.querySelectorAll('*').forEach(e => { e.style.transition='none'; e.style.animation='none' });
  o.nVinfo = (typeof VINFO !== 'undefined') ? Object.keys(VINFO).length : 'sin VINFO';
  o.existeClave = (typeof VINFO !== 'undefined') ? !!VINFO['${CLAVE}'] : false;
  return o;
})()`;

const MEDIR = `((fase) => {
  const o = { fase: fase };
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10,
             x: Math.round(r.x*10)/10, y: Math.round(r.y*10)/10 } };
  const b = document.querySelector('[data-vinfo="${CLAVE}"]');
  o.btn = R(b);
  o.btnAria = b ? b.getAttribute('aria-expanded') : null;
  /* los cinco puntos del area tactil tienen que devolver el PROPIO boton */
  if (b) {
    const r = b.getBoundingClientRect();
    const pts = [[r.x+2,r.y+2],[r.right-2,r.y+2],[r.x+2,r.bottom-2],[r.right-2,r.bottom-2],
                 [r.x+r.width/2, r.y+r.height/2]];
    o.propios = pts.filter(p => { const e = document.elementFromPoint(p[0],p[1]);
      return e && (e === b || b.contains(e)) }).length;
  }
  const card = document.getElementById('vinfo-card');
  const vis = card && getComputedStyle(card).display !== 'none' && card.getBoundingClientRect().width > 0;
  o.abierto = !!vis;
  if (vis) {
    o.card = R(card);
    const t = (card.textContent || '').replace(/\\s+/g,' ').trim();
    o.chars = t.length;
    o.tit = t.slice(0,46);
    /* dentro de la pantalla? */
    const r = card.getBoundingClientRect();
    o.dentro = (r.x >= -1 && r.y >= -1 && r.right <= window.innerWidth + 1 && r.bottom <= window.innerHeight + 1);
    o.scrollInterno = Math.max(0, card.scrollHeight - card.clientHeight);
    /* la LETRA UNICA: tamanios de los nodos de texto del cuerpo */
    const tam = {};
    const andar = (n) => {
      for (const h of n.childNodes) {
        if (h.nodeType === 3) {
          const s = (h.textContent||'').replace(/\\s+/g,' ').trim();
          if (!s) continue;
          const fs = getComputedStyle(h.parentElement).fontSize;
          tam[fs] = (tam[fs]||0) + s.length;
        } else if (h.nodeType === 1) andar(h);
      }
    };
    andar(card);
    o.tam = tam;
    /* citas de guia y folios */
    const cuenta = (pat) => (t.match(new RegExp(pat,'g'))||[]).length;
    o.folios = cuenta('folio\\\\s*\\\\d');
    o.clases = cuenta('Clase\\\\s*I');
    o.conducta = cuenta('se recomienda|recomendad|indicad|considerar la intervenci');
    o.revision = cuenta('pendiente de revisi|sin validar|a confirmar por');
  }
  return o;
})(__F__)`;

const res = { file: FILE, anchos: {} };
const nav = await _pw.chromium.launch({ channel: 'chrome' });
for (const w of ANCHOS) {
  const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e).slice(0, 150)));
  const r = {};
  try {
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(1100);
    r.prep = await pg.evaluate(PREP);
    /* traer el boton a la vista: elementFromPoint fuera del viewport devuelve null, que es la
       trampa que TGA-h documenta */
    await pg.evaluate('(()=>{const b=document.querySelector(\'[data-vinfo="' + CLAVE + '"]\'); if(b) b.scrollIntoView({block:"center"})})()');
    await pg.waitForTimeout(200);
    r.cerrado = await pg.evaluate(MEDIR.replace('__F__', '"antes"'));
    /* 1 · CLIC: abre */
    await pg.evaluate('(()=>{const b=document.querySelector(\'[data-vinfo="' + CLAVE + '"]\'); if(b) b.click()})()');
    await pg.waitForTimeout(250);
    r.abierto = await pg.evaluate(MEDIR.replace('__F__', '"abierto"'));
    /* 2 · CLIC AFUERA: cierra */
    await pg.mouse.click(3, 3);
    await pg.waitForTimeout(250);
    r.trasFuera = await pg.evaluate(MEDIR.replace('__F__', '"trasFuera"'));
    /* 3 · ESCAPE: abrir de nuevo y cerrar con la tecla */
    await pg.evaluate('(()=>{const b=document.querySelector(\'[data-vinfo="' + CLAVE + '"]\'); if(b) b.click()})()');
    await pg.waitForTimeout(220);
    r.reabierto = await pg.evaluate(MEDIR.replace('__F__', '"reabierto"'));
    await pg.keyboard.press('Escape');
    await pg.waitForTimeout(250);
    r.trasEscape = await pg.evaluate(MEDIR.replace('__F__', '"trasEscape"'));
    /* 4 · EL PROPIO BOTON: abrir y volver a tocar */
    await pg.evaluate('(()=>{const b=document.querySelector(\'[data-vinfo="' + CLAVE + '"]\'); if(b) b.click()})()');
    await pg.waitForTimeout(200);
    await pg.evaluate('(()=>{const b=document.querySelector(\'[data-vinfo="' + CLAVE + '"]\'); if(b) b.click()})()');
    await pg.waitForTimeout(250);
    r.trasSegundoClic = await pg.evaluate(MEDIR.replace('__F__', '"trasSegundoClic"'));
  } catch (e) { r.error = String(e).slice(0, 200) }
  r.errores = errs.length; r.err1 = errs[0] || '';
  res.anchos[w] = r;
  await ctx.close();
}
await nav.close();
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log('escrito ' + OUTF);
