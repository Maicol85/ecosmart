/*
 * _probe_pant5mov.mjs - el latido del dibujo del VD: pausa, prefers-reduced-motion y el costo
 * por tecla (PANT-5). Nombre propio: verificado con ls contra HEAD, no existia.
 *   node scripts/_probe_pant5mov.mjs --file <index.html>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const FILE = arg('--file') || (RAIZ + '/index.html');

const ABRIR = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  try { showTab('hemodinamica') } catch (e) {}
  const sec = document.getElementById('tep-seccion');
  if (sec && getComputedStyle(sec).display === 'none') { const h = document.querySelector('[onclick*="tep-seccion"]'); if (h) h.click() }
  const s = document.getElementById('vdsc-svg'); if (s) s.scrollIntoView({ block:'center' });
  const S = (id, v) => { const el = document.getElementById(id); if (!el) return;
    el.value = v; el.dispatchEvent(new Event('input', { bubbles:true })); el.dispatchEvent(new Event('change', { bubbles:true })) };
  S('tep_vdvi', 1.30); S('tapse', 10); S('tep_mcconnell','si'); S('tep_tabique_d','si');
  S('it_grado','4'); S('vmax_it', 4.2);
  return !!document.getElementById('vdsc-svg');
})()`;
/* DENOMINADOR DEL MOVIMIENTO: dos fotos del trazado del contorno separadas en el tiempo. Si son
   iguales, el dibujo esta quieto; si cambian, late. Un dibujo que no existe da las dos vacias. */
const FOTO = `(() => { const n = document.getElementById('vdsc-out');
  return n ? (n.getAttribute('d') || '') : 'NO EXISTE' })()`;

const nav = await _pw.chromium.launch({ channel: 'chrome' });
async function medir(reduce) {
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 },
    reducedMotion: reduce ? 'reduce' : 'no-preference' });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e).slice(0, 120)));
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
  await pg.waitForTimeout(1100);
  await pg.evaluate(ABRIR);
  await pg.waitForTimeout(400);
  const f1 = await pg.evaluate(FOTO);
  await pg.waitForTimeout(900);
  const f2 = await pg.evaluate(FOTO);
  /* ⚠️ LA PAUSA SE MIDE ANTES QUE LA FASE, Y ES UN DEFECTO DE ESTA SONDA QUE COSTO UNA CORRIDA.
     `vdscFase()` sin argumento tambien PAUSA -es lo que hace su `setPlay(false)`-, asi que
     medida despues, el clic del boton REANUDABA el latido y la sonda informaba
     «pausa quieto=false» sobre una pausa que funciona. */
  let pausa = null;
  if (!reduce) {
    await pg.evaluate(`(() => { const b = document.getElementById('vdsc-play'); if (b) b.click() })()`);
    const p1 = await pg.evaluate(FOTO);
    await pg.waitForTimeout(800);
    const p2 = await pg.evaluate(FOTO);
    pausa = { quieto: p1 === p2, chars: p1.length,
              rotulo: await pg.evaluate(`(() => { const b = document.getElementById('vdsc-play');
                return b ? (b.textContent || '').trim() + '|' + b.getAttribute('aria-pressed') : null })()`) };
    /* y reanuda, para que el control de que SI late siga valiendo */
    await pg.evaluate(`(() => { const b = document.getElementById('vdsc-play'); if (b) b.click() })()`);
    const r1 = await pg.evaluate(FOTO);
    await pg.waitForTimeout(800);
    const r2 = await pg.evaluate(FOTO);
    pausa.reanuda = (r1 !== r2);
  }
  /* Con la preferencia puesta, en que fase se quedo. */
  const fase = await pg.evaluate(`(() => { try { return vdscFase() } catch (e) { return 'ERR' } })()`);
  const barra = await pg.evaluate(`(() => { const n = document.getElementById('vdsc-tpbar');
    return n ? { h: n.getAttribute('height'), op: n.getAttribute('opacity'), fill: n.getAttribute('fill') } : null })()`);
  const chorro = await pg.evaluate(`(() => { const n = document.querySelector('#vdsc-jets g');
    return n ? n.getAttribute('opacity') : null })()`);
  /* EL COSTO POR TECLA: doce teclas reales sobre el campo del VD/VI, con el dibujo latiendo. */
  let tecla = null;
  if (!reduce) {
    tecla = await pg.evaluate(`(async () => {
      const el = document.getElementById('tep_vdvi'); if (!el) return null;
      el.focus(); el.value = '';
      const ts = [];
      const seq = '1.30'.split('').concat('1.25'.split('')).concat('0.85'.split(''));
      for (const ch of seq) {
        const t0 = performance.now();
        el.value = (el.value + ch).slice(-5);
        el.dispatchEvent(new Event('input', { bubbles:true }));
        ts.push(performance.now() - t0);
        await new Promise(r => setTimeout(r, 40));
      }
      const t0 = performance.now();
      await new Promise(r => setTimeout(r, 400));
      return { n: ts.length, media: Math.round(ts.reduce((a,b)=>a+b,0)/ts.length*100)/100,
               max: Math.round(Math.max.apply(null, ts)*100)/100 };
    })()`);
  }
  await ctx.close();
  return { late: f1 !== f2, f1chars: String(f1).length, fase: fase, barra: barra, chorro: chorro,
           pausa: pausa, tecla: tecla, errores: errs.length, err1: errs[0] || '' };
}
const sinRed = await medir(false);
const conRed = await medir(true);
await nav.close();
console.log('SIN prefers-reduced-motion : late=' + sinRed.late + ' chars=' + sinRed.f1chars +
  ' | pausa quieto=' + (sinRed.pausa ? sinRed.pausa.quieto : '-') + ' rotulo=' + (sinRed.pausa||{}).rotulo + ' reanuda=' + (sinRed.pausa||{}).reanuda + ' (chars ' + (sinRed.pausa||{}).chars + ')' +
  ' | tecla ' + JSON.stringify(sinRed.tecla) + ' | err ' + sinRed.errores + ' ' + sinRed.err1);
console.log('CON prefers-reduced-motion : late=' + conRed.late + ' chars=' + conRed.f1chars +
  ' | fase=' + conRed.fase + ' | barra=' + JSON.stringify(conRed.barra) + ' | chorro op=' + conRed.chorro +
  ' | err ' + conRed.errores + ' ' + conRed.err1);
