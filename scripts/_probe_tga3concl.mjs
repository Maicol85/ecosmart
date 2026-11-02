#!/usr/bin/env node
/**
 * _probe_tga3concl.mjs - la CONCLUSION de la TGA en la columna izquierda (TGA-3, commit 1b).
 *
 * Mide la maqueta en los cuatro anchos y los dos temas, en los dos motores, con su CONTROL
 * contra HEAD. Lo que decide:
 *   - la conclusion esta DENTRO de la columna de campos (su caja cae en el rango x de
 *     #tga-campos) y DEBAJO del ultimo campo;
 *   - la interseccion REAL con el recuadro del 3D es cero. Se mide en LOS DOS EJES: la metrica
 *     `pisaConcl` de _probe_cong2a_pant.mjs compara solo el vertical -suponia la conclusion
 *     DEBAJO del lienzo- y con la maqueta nueva dos cajas lado a lado comparten rango vertical
 *     por diseno, asi que ahi informa un solape que no existe;
 *   - por debajo de 900 px queda apilada DESPUES de los campos y ANTES del diagrama;
 *   - sin desplazamiento horizontal del cuerpo y sin texto recortado.
 *
 *   node scripts/_probe_tga3concl.mjs [--file <html>] [--motor chrome|webkit|dos]
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null; for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log('SIN PLAYWRIGHT'); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const MOTOR = arg('--motor') || 'chrome';
const OUTF = arg('--out') || '/tmp/tga3_concl.json';
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['dark', 'light'];

const MEDIR = `(async () => {
  const R = { errs: [] };
  const EL = id => document.getElementById(id);
  const S = (id, v) => { const e = EL(id); if (!e) return 'NO ' + id; e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height),
             x: Math.round(r.left), y: Math.round(r.top) } };
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  S('nombre', 'Prueba TGA3'); S('ci', '601'); S('peso', '70'); S('talla', '170'); S('sexo', 'M');

  /* La seccion vive en la sub-pestana «CC complejas»: sin las DOS pestanas abiertas por su
     boton real todo da 0x0, que es la trampa 1 del mapa de la TGA. */
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const Q = String.fromCharCode(39);
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click(); else showTab('congenitas');
        const b2 = bq('ccSubTab(' + Q + 'congenitas2'); if (b2) b2.click(); else ccSubTab('congenitas2') } catch (e) {}
  await new Promise(r => setTimeout(r, 320));
  const acc = EL('sacc-cc-tga');
  if (acc && !acc.classList.contains('open')) { const h = document.querySelector('#sacc-cc-tga .sacc-hdr'); if (h) h.click() }
  await new Promise(r => setTimeout(r, 420));
  R.accAbierto = acc ? (acc.classList.contains('open') ? 'si' : 'NO') : 'NO EXISTE';
  /* Sin esto el rect sale de MITAD de la transicion de 0,3 s del acordeon: es la trampa del AJ9. */
  try { document.querySelectorAll('.sacc-body').forEach(b => { b.style.transition = 'none' }) } catch (e) {}
  await new Promise(r => setTimeout(r, 120));

  /* DENOMINADOR: con el tipo cargado hay conclusion que mirar. Sin esto la conclusion dice «—»
     y su caja mide casi nada: una medicion sobre una caja vacia no prueba la maqueta. */
  S('tga_tipo', 'dtga'); S('tga_func_vd', 'normal'); S('tga_sintomas', 'no');
  await new Promise(r => setTimeout(r, 1500));

  const campos = EL('tga-campos'), box = EL('tga-3d-box'), fila = EL('tga-fila');
  const concl = EL('tga-concl');
  const cBox = EL('tga-concl-box');
  R.camposBox = caja(campos); R.boxBox = caja(box); R.conclBox = caja(cBox || (concl && concl.parentElement));
  R.conclTxt = concl ? String(concl.textContent || '').trim().slice(0, 90) : 'NO EXISTE';
  R.conclLargo = concl ? String(concl.textContent || '').trim().length : 0;
  R.hayConclBox = cBox ? 'si' : 'NO';

  /* ── 1 · LA CONCLUSION ESTA EN LA COLUMNA IZQUIERDA ──────────────────────────────────────
     «Dentro de la columna» = su caja cae en el rango x de #tga-campos, no en el del 3D. */
  const cb = R.conclBox, kb = R.camposBox, bb = R.boxBox;
  R.enColumnaIzq = (cb && kb) ? ((cb.x >= kb.x - 2 && (cb.x + cb.w) <= (kb.x + kb.w) + 2) ? 'si' : 'NO') : 'NO';
  /* ── 2 · ESTA DEBAJO DEL ULTIMO CAMPO ─────────────────────────────────────────────────── */
  const ids = ['tga_tipo','tga_cirugia','tga_func_vd','tga_dilatacion_ro','tga_it_ro','tga_bav',
               'tga_obstr_subaortica','tga_grad_subaortico','tga_civ_residual','tga_civ_grad','tga_sintomas'];
  let maxY = -1, nVis = 0;
  ids.forEach(i => { const e = EL(i); if (!e) return; const r = caja(e);
    if (!r || (r.w === 0 && r.h === 0)) return; nVis++; if (r.y + r.h > maxY) maxY = r.y + r.h });
  R.nCamposVis = nVis; R.ultimoCampoFin = maxY;
  R.bajoLosCampos = (cb && maxY > 0) ? ((cb.y >= maxY - 2) ? 'si' : 'NO') : 'NO';
  /* ── 3 · INTERSECCION REAL CON EL RECUADRO DEL 3D, EN LOS DOS EJES ──────────────────────── */
  const inter = (a, b2) => { if (!a || !b2) return 'NO';
    const w = Math.min(a.x + a.w, b2.x + b2.w) - Math.max(a.x, b2.x);
    const h = Math.min(a.y + a.h, b2.y + b2.h) - Math.max(a.y, b2.y);
    return (w > 1 && h > 1) ? Math.round(w) + 'x' + Math.round(h) : 0 };
  R.pisa3D = inter(cb, bb);
  R.pisaCampos = 0;
  ids.forEach(i => { const e = EL(i); if (!e) return; const r = caja(e);
    if (r && inter(cb, r) !== 0 && inter(cb, r) !== 'NO') R.pisaCampos++ });
  /* ── 4 · LA MAQUETA: lado a lado o apilada, y el ORDEN cuando apila ─────────────────────── */
  R.ladoALado = (kb && bb) ? ((Math.abs(kb.y - bb.y) < 40 && bb.x > kb.x + 40) ? 'si' : 'apilado') : 'NO';
  R.ordenApilado = (kb && cb && bb)
    ? ((cb.y >= kb.y && bb.y >= cb.y + cb.h - 2) ? 'campos-concl-3D' : 'OTRO')
    : 'NO';
  R.filaHijos = fila ? fila.children.length : 'NO';
  R.secAlto = acc ? Math.round(acc.getBoundingClientRect().height) : 'NO';
  /* ── 5 · SIN BARRA HORIZONTAL NI TEXTO RECORTADO ───────────────────────────────────────── */
  R.scrollX = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  const rec = [];
  const sec = EL('sacc-cc-tga');
  if (sec) sec.querySelectorAll('label, .calc-lbl, .calc-val, option, button, p').forEach(e => {
    if (!e.offsetParent && e.tagName !== 'OPTION') return;
    if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) rec.push((e.id || e.className || e.tagName) + ' ' + e.scrollWidth + '>' + e.clientWidth);
  });
  R.recortados = rec; R.nRecort = rec.length;
  return R;
})()`;

const OUT = { archivo: FILE };
async function corre(motor) {
  const tipo = motor === 'webkit' ? 'webkit' : 'chromium';
  const nav = await (motor === 'webkit' ? _pw.webkit.launch({ headless: true })
                                        : _pw.chromium.launch({ channel: 'chrome', headless: true }));
  for (const w of ANCHOS) for (const tema of TEMAS) {
    const ctx = await nav.newContext({ viewport: { width: w, height: 900 }, colorScheme: tema });
    const pg = await ctx.newPage();
    const errs = []; pg.on('pageerror', e => errs.push(e.message.slice(0, 120)));
    pg.on('console', m => { if (m.type() === 'error') errs.push('consola: ' + m.text().slice(0, 120)) });
    let R;
    try { await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
          await pg.waitForTimeout(1300);
          R = await pg.evaluate(MEDIR); }
    catch (e) { R = { FATAL: String(e).slice(0, 220) } }
    R.errsPagina = errs;
    OUT[motor + '_' + w + '_' + tema] = R;
    console.log(motor, w, tema, '| izq=' + R.enColumnaIzq, '| bajoCampos=' + R.bajoLosCampos,
      '| pisa3D=' + R.pisa3D, '| pisaCampos=' + R.pisaCampos, '| lado=' + R.ladoALado,
      '| orden=' + R.ordenApilado, '| hijosFila=' + R.filaHijos, '| alto=' + R.secAlto,
      '| scrollX=' + R.scrollX, '| recort=' + R.nRecort, '| concl=' + R.conclLargo, '| errs=' + errs.length);
    await ctx.close();
  }
  await nav.close();
}
if (MOTOR === 'dos') { await corre('chrome'); await corre('webkit') } else { await corre(MOTOR) }
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF);
