/*
 * _probe_pant9inv.mjs - PANT-9: inventario y geometria de las SIETE pantallas de congenitas
 * que esta tanda redisenia (Fontan, Eisenmenger, Ebstein, DSAV, CVPA, DAP, VAP).
 * Mide, a los cuatro anchos y en los dos temas: alto y ancho de la seccion, censo de ids de
 * campo, conteo de citas de guia, desplazamiento horizontal y texto recortado.
 * Nombre propio: verificado con ls, no existia.
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda.
 *   node scripts/_probe_pant9inv.mjs --file <index.html> --out <json>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p9inv.json';
const ANCHOS = [1440, 1000, 900, 899, 768, 390];
const SECS = ['fontan', 'eisen', 'ebs', 'dsav', 'cvpa', 'dap', 'vap'];

const PREP = `(() => {
  const secs = ['fontan','eisen','ebs','dsav','cvpa','dap','vap'];
  ['modalAvisoEco','login-overlay'].forEach(id => { const m=document.getElementById(id); if(m) m.style.display='none' });
  const o = { abiertas: {} };
  try { showTab('congenitas2') } catch(e) { o.tabErr = String(e).slice(0,90) }
  secs.forEach(k => {
    const card = document.getElementById('sacc-cc-' + k);
    if (!card) { o.abiertas[k] = 'SIN CARD'; return }
    const hdr = card.querySelector('.sacc-hdr');
    const body = card.querySelector('.sacc-body');
    if (hdr && body && !card.classList.contains('open')) hdr.click();
    o.abiertas[k] = card.classList.contains('open');
  });
  document.querySelectorAll('*').forEach(e => { e.style.transition='none'; e.style.animation='none' });
  secs.forEach(k => {
    const card = document.getElementById('sacc-cc-' + k);
    const body = card && card.querySelector('.sacc-body');
    if (body) { body.style.maxHeight = 'none'; body.style.overflow = 'visible' }
  });
  return o;
})()`;

const FOTO = `(() => {
  const secs = ['fontan','eisen','ebs','dsav','cvpa','dap','vap'];
  const RR = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10 } };
  const o = { secs: {}, scrollH: document.documentElement.scrollWidth > document.documentElement.clientWidth,
              sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth };
  secs.forEach(k => {
    const card = document.getElementById('sacc-cc-' + k);
    if (!card) { o.secs[k] = { existe: false }; return }
    const body = card.querySelector('.sacc-body');
    const ids = [];
    card.querySelectorAll('input[id],select[id],textarea[id]').forEach(e => ids.push(e.id));
    const txt = (body ? body.innerText : '') || '';
    const nCitas = (s, re) => (s.match(re) || []).length;
    const globos = [];
    card.querySelectorAll('.vinfo-btn').forEach(b => globos.push(b.getAttribute('data-vinfo') || b.getAttribute('aria-label') || '?'));
    // texto recortado: elementos cuyo contenido excede su caja
    let recort = 0;
    card.querySelectorAll('label,span,p,b,div').forEach(e => {
      if (e.children.length) return;
      if (!e.offsetParent) return;
      if (e.scrollWidth > e.clientWidth + 1) recort++;
    });
    const btn44 = [];
    card.querySelectorAll('button').forEach(b => { const r = b.getBoundingClientRect();
      if (r.width > 0) btn44.push({ t: (b.textContent||'').trim().slice(0,26), h: Math.round(r.height), w: Math.round(r.width) }) });
    o.secs[k] = { existe: true, abierta: card.classList.contains('open'),
      cardRect: RR(card), bodyRect: RR(body), nIds: ids.length, ids: ids,
      largoTxt: txt.length,
      citas: { esc: nCitas(txt, /ESC 20\\d\\d/g), aha: nCitas(txt, /ACC\\/AHA|AHA\\/ACC/g),
               clase: nCitas(txt, /Clase [I]+[ab]?/g), folio: nCitas(txt, /folio/gi),
               tabla: nCitas(txt, /Tabla \\d/g) },
      globos: globos, nGlobos: globos.length, recortados: recort, botones: btn44 };
  });
  return o;
})()`;

const out = { file: FILE, cruces: [], prep: null };
try {
  const b = await _pw.chromium.launch({ channel: 'chrome' });
  for (const tema of ['dark', 'light']) {
    for (const W of ANCHOS) {
      const ctx = await b.newContext({ viewport: { width: W, height: 900 }, colorScheme: tema });
      const pg = await ctx.newPage();
      const errs = [];
      pg.on('pageerror', e => errs.push('PAGE:' + String(e).slice(0, 90)));
      pg.on('console', m => { if (m.type() === 'error') errs.push('CON:' + m.text().slice(0, 90)) });
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
      await pg.waitForTimeout(900);
      const p = await pg.evaluate(PREP);
      if (!out.prep) out.prep = p;
      await pg.waitForTimeout(400);
      const f = await pg.evaluate(FOTO);
      out.cruces.push({ tema, W, errs, ...f });
      await ctx.close();
    }
  }
  await b.close();
} catch (e) { out.error = String(e).slice(0, 300) }
fs.writeFileSync(OUTF, JSON.stringify(out, null, 1));
console.log('OK ' + OUTF + (out.error ? ' ERR ' + out.error : ''));
