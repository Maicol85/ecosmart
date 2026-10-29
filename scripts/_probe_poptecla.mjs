#!/usr/bin/env node
/**
 * _probe_poptecla.mjs - TIEMPO DE ESCRITURA en Chrome (POP-V2, 2026-10-29).
 * Esta tanda toca la sincronizacion de campos —la dosis se escribe sola desde el barrido de
 * espejos—, asi que hay que medir que escribir no se volvio mas lento.
 * Teclea de verdad en los campos del modulo y cronometra cada tecla; despues espera el debounce
 * de 220 ms y cronometra el barrido. SIN acentos graves.
 *   node scripts/_probe_poptecla.mjs [--file /tmp/arbol.html]
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null; for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const b = await _pw.chromium.launch({ channel: 'chrome' });
const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
await pg.waitForTimeout(1200);
const R = await pg.evaluate(async () => {
  ['modalAvisoEco', 'login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  try { showTab('hemodinamica'); } catch (e) {}
  const s = document.getElementById('pop-seccion');
  if (s && s.style.display === 'none') { const h = document.querySelector('[onclick*="pop-seccion"]'); if (h) h.click(); }
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return; e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); };
  S('peso', '70'); S('talla', '170'); S('pop_monitor', 'swan');
  const c = document.getElementById('pop_nor_activa');
  if (c) { c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })); }
  await new Promise(r => setTimeout(r, 400));
  /* Quince teclas REALES sobre los campos del modulo, una por una. */
  const plan = [['pop_sw_gc', '3'], ['pop_sw_gc', '3.'], ['pop_sw_gc', '3.2'],
                ['pop_sw_pam', '5'], ['pop_sw_pam', '58'],
                ['pop_sw_pad', '1'], ['pop_sw_pad', '14'],
                ['pop_sw_pcp', '2'], ['pop_sw_pcp', '22'],
                ['pop_nor_diluc_mg', '4'],
                ['pop_nor_diluc_ml', '1'], ['pop_nor_diluc_ml', '10'], ['pop_nor_diluc_ml', '100'],
                ['pop_nor_veloc', '2'], ['pop_nor_veloc', '21']];
  const ms = [];
  for (const [id, v] of plan) {
    const e = document.getElementById(id); if (!e) continue;
    const t0 = performance.now();
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    ms.push(+(performance.now() - t0).toFixed(3));
    await new Promise(r => setTimeout(r, 30));
  }
  /* El barrido: corre UNA vez, 220 ms despues de la ultima tecla. Se cronometra llamandolo. */
  await new Promise(r => setTimeout(r, 500));
  let barrido = null;
  try { const t0 = performance.now(); _espejosBarrerTodos(); barrido = +(performance.now() - t0).toFixed(3); }
  catch (e) { barrido = 'sin fn'; }
  const med = ms.reduce((a, x) => a + x, 0) / (ms.length || 1);
  return { teclas: ms.length, media: +med.toFixed(3), max: Math.max.apply(null, ms),
           min: Math.min.apply(null, ms), barridoMs: barrido,
           dosis: (document.getElementById('pop_nor_dosis') || {}).value };
});
console.log(JSON.stringify({ archivo: FILE, ...R }));
await b.close(); process.exit(0);
