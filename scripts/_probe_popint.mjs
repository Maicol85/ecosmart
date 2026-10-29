#!/usr/bin/env node
/**
 * _probe_popint.mjs - el BLOQUE INTEGRADO del posoperatorio (POP-V2-6, 2026-10-29).
 * Comprueba que lo que ya existia SIGUE ANDANDO, que es lo que el punto 6c pide:
 *   1. integrar el modulo escribe `am-txt-pop` y lo marca en `am-integrados`;
 *   2. editar ese texto a mano lo MARCA en `am-editados`;
 *   3. el texto editado SOBREVIVE a un recalculo del modulo (no se lo pisa);
 *   4. exportar el PDF AVISA antes, y el aviso nombra el bloque editado.
 * SOLO LECTURA sobre index.html. SIN acentos graves.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null; for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const b = await _pw.chromium.launch({ channel: 'chrome' });
const pg = await b.newPage({ viewport: { width: 1400, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push(String(e.message).slice(0, 150)));
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
await pg.waitForTimeout(1200);
const R = await pg.evaluate(async () => {
  ['modalAvisoEco', 'login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  S('peso', '70'); S('talla', '170'); S('pop_monitor', 'swan'); S('pop_sw_gc', '3.2');
  S('pop_sw_pam', '58'); S('pop_sw_pad', '14'); S('pop_sw_pcp', '22'); S('pop_cx_horas', '6');
  S('pop_cx_tipo', 'cabg');
  await new Promise(r => setTimeout(r, 400));
  const o = {};
  if (typeof amiloBuildCard === 'function') amiloBuildCard();
  try { amiloIntegrar('pop') } catch (e) { o.errIntegrar = String(e).slice(0, 90) }
  await new Promise(r => setTimeout(r, 300));
  const ta = document.getElementById('am-txt-pop');
  o.integrado = typeof amiloIntegrado === 'function' ? !!amiloIntegrado('pop') : 'sin fn';
  o.textoLargo = ta ? ta.value.length : 'NO EXISTE';
  o.enRegistro = String((document.getElementById('am-integrados') || {}).value || '');
  /* 2 · editar a mano, por el gesto real */
  if (ta) { ta.value = ta.value + '\nLINEA ESCRITA POR EL MEDICO.';
            ta.dispatchEvent(new Event('input', { bubbles: true })); }
  await new Promise(r => setTimeout(r, 400));
  o.marcaEditado = String((document.getElementById('am-editados') || {}).value || '');
  /* 3 · un recalculo del modulo NO pisa lo editado */
  S('pop_sw_gc', '3.4');
  await new Promise(r => setTimeout(r, 600));
  try { if (typeof amiloRefrescarTodos === 'function') amiloRefrescarTodos() } catch (e) {}
  await new Promise(r => setTimeout(r, 400));
  o.sobrevive = !!(ta && ta.value.indexOf('LINEA ESCRITA POR EL MEDICO.') > -1);
  /* El aviso de pantalla vive en la tarjeta del bloque; su envoltorio real es `am-wrap-pop`
     si existe, y si no se mira la tarjeta entera de ETT Avanzado. */
  o.avisoVisible = (function () {
    const w = document.getElementById('am-wrap-pop') || document.getElementById('amilo-card')
            || (ta ? ta.closest('div') : null);
    if (!w) return 'SIN ENVOLTORIO';
    const t = (w.textContent || '');
    return /desactualiz|sin actualizar|cambiaron|editad/i.test(t)
      ? 'SI: ' + t.replace(/\s+/g, ' ').slice(0, 140) : 'sin aviso en pantalla';
  })();
  /* 4 · EL AVISO ANTES DE EXPORTAR. El duenno es `_amiloDesfasadosRot()`, que `generarPDF`
     consulta y publica en un `confirm`. Se espia el `confirm` y se contesta que NO, asi que el
     PDF no se genera: lo que se mide es la PREGUNTA, no el documento. */
  o.desfasados = (typeof _amiloDesfasadosRot === 'function') ? _amiloDesfasadosRot() : 'sin fn';
  o.preguntaAlExportar = 'no se probo';
  try {
    const oc = window.confirm;
    let visto = null;
    window.confirm = function (m) { visto = String(m).replace(/\s+/g, ' ').slice(0, 260); return false };
    if (typeof generarPDF === 'function') generarPDF();
    window.confirm = oc;
    o.preguntaAlExportar = visto || 'NO PREGUNTO';
  } catch (e) { o.preguntaAlExportar = 'EXC ' + String(e).slice(0, 90) }
  return o;
});
console.log(JSON.stringify({ archivo: FILE, errores: errs, ...R }, null, 1));
await b.close(); process.exit(0);
