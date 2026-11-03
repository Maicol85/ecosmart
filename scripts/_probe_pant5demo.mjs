/*
 * _probe_pant5demo.mjs - la geometria del dibujo del VD de la app contra la demo aprobada.
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * NO compara pixeles: con las MISMAS entradas y la MISMA fase, lee los atributos `d` de los
 * trazados y las posiciones de los rotulos en los dos documentos y compara los NUMEROS.
 * Cinco escenarios x dos fases -sistole 0,40 y diastole 0,80-.
 *
 * ⚠️ DENOMINADOR: cada lado publica cuantos caracteres de trazado leyo. Un cero de los dos lados
 *    compara dos cadenas vacias y se lee igual que «no hubo diferencias».
 *
 *   node scripts/_probe_pant5demo.mjs --file <index.html> --out <json>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const DEMO = RAIZ + '/docs/3d/demo_sobrecarga_vd_v4_a4c_concepto.html';
const OUTF = arg('--out') || '/tmp/p5demo.json';
const TOL = 0.011;   /* tolerancia declarada: la app y la demo redondean a dos decimales con la
                        misma funcion, asi que la diferencia maxima posible es medio ulp. */

/* Los cinco escenarios de la orden. itg: 0 sin IT, 1 leve, 2 moderada, 3 severa (demo);
   en la app `it_grado` vale 0, 1, 2 y 4. */
const ESC = [
  { k: 'normal',  vd: 0.70, tp: 24, mcc: false, tab: false, itg: 0, vm: null },
  { k: 'dilIT',   vd: 1.25, tp: 12, mcc: false, tab: false, itg: 3, vm: 3.6 },
  { k: 'mcc',     vd: 1.00, tp: 15, mcc: true,  tab: false, itg: 1, vm: 3.0 },
  { k: 'd',       vd: 0.95, tp: 18, mcc: false, tab: true,  itg: 0, vm: null },
  { k: 'todos',   vd: 1.30, tp: 10, mcc: true,  tab: true,  itg: 3, vm: 4.2 }
];
const FASES = [0.40, 0.80];
const IT_APP = { 0: '0', 1: '1', 2: '2', 3: '4' };

const LEER_APP = (e, ph) => `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  const o = {};
  const S = (id, v) => { const el = document.getElementById(id); if (!el) { o['falta_'+id] = 1; return }
    el.value = v; el.dispatchEvent(new Event('input', { bubbles:true })); el.dispatchEvent(new Event('change', { bubbles:true })) };
  try { showTab('hemodinamica') } catch (err) {}
  const sec = document.getElementById('tep-seccion');
  if (sec && getComputedStyle(sec).display === 'none') { const h = document.querySelector('[onclick*="tep-seccion"]'); if (h) h.click() }
  S('tep_vdvi', ${e.vd});
  S('tapse', ${e.tp});
  S('tep_mcconnell', ${e.mcc ? "'si'" : "'no'"});
  S('tep_tabique_d', ${e.tab ? "'si'" : "'no'"});
  S('it_grado', '${IT_APP[e.itg]}');
  S('vmax_it', ${e.vm === null ? "''" : e.vm});
  try { vdscSync() } catch (err) { o.syncErr = String(err) }
  try { vdscFase(${ph}) } catch (err) { o.faseErr = String(err) }
  const g = (id) => { const n = document.getElementById(id); return n ? (n.getAttribute('d') || '') : null };
  o.out = g('vdsc-out'); o.cl = g('vdsc-cl'); o.cr = g('vdsc-cr');
  o.mc = g('vdsc-mc'); o.sp = g('vdsc-sp');
  o.valvas = Array.prototype.slice.call(document.querySelectorAll('#vdsc-valves path')).map(x => x.getAttribute('transform') || '');
  const jg = document.querySelector('#vdsc-jets g');
  o.jetTr = jg ? (jg.getAttribute('transform') || '') : null;
  o.jetOp = jg ? (jg.getAttribute('opacity') || '') : null;
  o.jetD = document.querySelector('#vdsc-jets path') ? (document.querySelector('#vdsc-jets path').getAttribute('d') || '') : null;
  const pos = (id) => { const n = document.getElementById(id); if (!n) return null;
    return { x: n.getAttribute('x'), y: n.getAttribute('y'), op: n.getAttribute('opacity') } };
  o.mcT = pos('vdsc-mctxt'); o.spT = pos('vdsc-sptxt'); o.vmT = pos('vdsc-vmtxt');
  o.tpbar = (() => { const n = document.getElementById('vdsc-tpbar'); return n ? { x:n.getAttribute('x'), y:n.getAttribute('y'), h:n.getAttribute('height'), fill:n.getAttribute('fill'), op:n.getAttribute('opacity') } : null })();
  o.vb = document.getElementById('vdsc-svg').getAttribute('viewBox');
  o.chars = (o.out||'').length + (o.cl||'').length + (o.cr||'').length;
  return o;
})()`;

const LEER_DEMO = (e, ph) => `(() => {
  const o = {};
  const S = (id, v) => { const el = document.getElementById(id); if (!el) { o['falta_'+id] = 1; return }
    if (el.type === 'checkbox') el.checked = !!v; else el.value = v;
    el.dispatchEvent(new Event('input', { bubbles:true })) };
  S('r_vd', ${e.vd}); S('r_tp', ${e.tp}); S('mcc', ${e.mcc}); S('tab', ${e.tab});
  S('itg', '${e.itg}'); S('vmx', ${e.vm !== null}); ${e.vm !== null ? "S('r_vm', " + e.vm + ");" : ''}
  /* La fase la fija el parametro de la URL; aca solo se vuelve a dibujar en esa fase. */
  S('r_vd', ${e.vd});
  const g = (id) => { const n = document.getElementById(id); return n ? (n.getAttribute('d') || '') : null };
  o.out = g('p-out'); o.cl = g('p-cl'); o.cr = g('p-cr');
  o.mc = g('mc'); o.sp = g('sp');
  o.valvas = Array.prototype.slice.call(document.querySelectorAll('#g-valves path.leaf')).map(x => x.getAttribute('transform') || '');
  const jg = document.querySelector('#g-jets g');
  o.jetTr = jg ? (jg.getAttribute('transform') || '') : null;
  o.jetOp = jg ? (jg.getAttribute('opacity') || '') : null;
  o.jetD = document.querySelector('#g-jets path') ? (document.querySelector('#g-jets path').getAttribute('d') || '') : null;
  const pos = (id) => { const n = document.getElementById(id); if (!n) return null;
    return { x: n.getAttribute('x'), y: n.getAttribute('y'), op: n.getAttribute('opacity') } };
  o.mcT = pos('mctxt'); o.spT = pos('sptxt'); o.vmT = pos('vmtxt');
  o.tpbar = (() => { const n = document.getElementById('tpbar'); return n ? { x:n.getAttribute('x'), y:n.getAttribute('y'), h:n.getAttribute('height'), fill:n.getAttribute('fill'), op:n.getAttribute('opacity') } : null })();
  o.vb = document.getElementById('esq').getAttribute('viewBox');
  o.chars = (o.out||'').length + (o.cl||'').length + (o.cr||'').length;
  return o;
})()`;

/* Compara dos cadenas de trazado numero por numero. */
function cmpPath(a, b) {
  if (a === b) return { ok: true, max: 0 };
  if (a == null || b == null) return { ok: false, max: -1, nota: 'uno es nulo' };
  const na = a.match(/-?\d+(\.\d+)?/g) || [], nb = b.match(/-?\d+(\.\d+)?/g) || [];
  if (na.length !== nb.length) return { ok: false, max: -1, nota: 'n=' + na.length + ' vs ' + nb.length };
  let mx = 0;
  for (let i = 0; i < na.length; i++) mx = Math.max(mx, Math.abs(parseFloat(na[i]) - parseFloat(nb[i])));
  return { ok: mx <= TOL, max: Math.round(mx * 1000) / 1000 };
}

const res = { tol: TOL, file: FILE, escenas: {} };
const nav = await _pw.chromium.launch({ channel: 'chrome' });
for (const e of ESC) for (const ph of FASES) {
  const key = e.k + '@' + ph;
  try {
    const c1 = await nav.newContext({ viewport: { width: 1440, height: 900 } });
    const p1 = await c1.newPage();
    await p1.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    await p1.waitForTimeout(1000);
    const A = await Promise.race([p1.evaluate(LEER_APP(e, ph)),
      new Promise((_, rj) => setTimeout(() => rj(new Error('timeout app')), 60000))]);
    await c1.close();
    const c2 = await nav.newContext({ viewport: { width: 1440, height: 900 } });
    const p2 = await c2.newPage();
    await p2.goto('file://' + DEMO + '?phi=' + ph, { waitUntil: 'load', timeout: 60000 });
    await p2.waitForTimeout(700);
    const B = await Promise.race([p2.evaluate(LEER_DEMO(e, ph)),
      new Promise((_, rj) => setTimeout(() => rj(new Error('timeout demo')), 60000))]);
    await c2.close();
    const r = { charsApp: A.chars, charsDemo: B.chars, vbApp: A.vb, vbDemo: B.vb };
    for (const k of ['out', 'cl', 'cr', 'mc', 'sp', 'jetD', 'jetTr']) r[k] = cmpPath(A[k], B[k]);
    r.valvas = A.valvas.length === B.valvas.length
      ? A.valvas.map((x, i) => cmpPath(x, B.valvas[i])).reduce((ac, x) => ({ ok: ac.ok && x.ok, max: Math.max(ac.max, x.max) }), { ok: true, max: 0 })
      : { ok: false, max: -1, nota: 'n=' + A.valvas.length + ' vs ' + B.valvas.length };
    r.jetOp = { ok: A.jetOp === B.jetOp, a: A.jetOp, b: B.jetOp };
    for (const k of ['mcT', 'spT', 'vmT']) {
      const x = A[k], y = B[k];
      r[k] = (!x || !y) ? { ok: false, nota: 'nulo' }
        : { ok: Math.abs(parseFloat(x.x || 0) - parseFloat(y.x || 0)) <= TOL
              && Math.abs(parseFloat(x.y || 0) - parseFloat(y.y || 0)) <= TOL && x.op === y.op,
            a: x, b: y };
    }
    r.tpbar = (A.tpbar && B.tpbar)
      ? { ok: Math.abs(parseFloat(A.tpbar.x) - parseFloat(B.tpbar.x)) <= TOL
            && Math.abs(parseFloat(A.tpbar.y) - parseFloat(B.tpbar.y)) <= TOL
            && Math.abs(parseFloat(A.tpbar.h) - parseFloat(B.tpbar.h)) <= TOL,
          a: A.tpbar, b: B.tpbar } : { ok: false, nota: 'nulo' };
    r.vbOk = cmpPath(A.vb, B.vb).ok;
    res.escenas[key] = r;
  } catch (err) { res.escenas[key] = { error: String(err).slice(0, 220) } }
}
await nav.close();
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
/* Resumen legible. */
const lineas = [];
for (const k of Object.keys(res.escenas)) {
  const r = res.escenas[k];
  if (r.error) { lineas.push(k + ' ERROR ' + r.error); continue }
  const campos = ['out', 'cl', 'cr', 'valvas', 'jetD', 'jetTr', 'mc', 'sp', 'vbOk'];
  const malos = campos.filter(c => c === 'vbOk' ? !r.vbOk : !(r[c] && r[c].ok));
  lineas.push(k + ' | chars ' + r.charsApp + '/' + r.charsDemo + ' | ' +
    (malos.length ? 'DIFIEREN: ' + malos.map(c => c + '(' + JSON.stringify(r[c]) + ')').join(' ') : 'IGUALES') +
    ' | tpbar=' + (r.tpbar.ok ? 'ok' : 'DIF ' + JSON.stringify(r.tpbar)));
}
console.log(lineas.join('\n'));
