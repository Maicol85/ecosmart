#!/usr/bin/env node
/**
 * _probe_marfan2wk.mjs — los DOS MOTORES de la tanda MARFAN-2.
 *
 * Chrome del sistema y WebKit de Playwright, en 1440, 1000, 768 y 390 px y en los dos temas:
 * dieciseis cruces por motor. Mide la seccion, la tarjeta y la conclusion, y exige cero
 * errores de consola, cero desplazamiento horizontal del cuerpo y cero texto recortado.
 *
 * ATENCION 1: WebKit de Playwright NO es Safari, y se declara.
 * ATENCION 2: el binario de chromium de Playwright no esta en esta maquina: Chrome va por el
 * del sistema con channel chrome. Sin eso la sonda devuelve los cruces VACIOS, que en un
 * volcado se lee igual que «no hubo diferencias».
 * ATENCION 3: la seccion vive en C. Congenitas y su acordeon nace CERRADO; sin abrirlo por su
 * boton REAL todo da 0x0.
 *
 *   node scripts/_probe_marfan2wk.mjs [--file <html>]
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['dark', 'light'];

const MEDIR = `(async () => {
  const R = { ancho: window.innerWidth, errs: [] };
  const EL = id => document.getElementById(id);
  const S = (id, v) => { const e = EL(id); if (!e) return;
    if (e.type === 'checkbox') e.checked = (v === 1 || v === true); else e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })) };
  const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top) } };
  const T = el => el ? String(el.textContent || '').split(/\\s+/).filter(Boolean).join(' ').trim() : 'NO';
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  S('nombre', 'Prueba MARFAN2'); S('ci', '591'); S('peso', '70'); S('talla', '170');
  S('sexo', 'M'); S('edad', '34');
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click(); else showTab('congenitas') } catch (e) {}
  await new Promise(r => setTimeout(r, 300));
  const acc = EL('sacc-cc-marfan');
  if (acc && !acc.classList.contains('open')) { const h = document.querySelector('#sacc-cc-marfan .sacc-hdr'); if (h) h.click() }
  await new Promise(r => setTimeout(r, 430));
  try { document.querySelectorAll('.sacc-body').forEach(b => { b.style.transition = 'none' }) } catch (e) {}
  R.accAbierto = acc && acc.classList.contains('open') ? 'si' : 'NO';
  S('marfan_sindrome', 'marfan'); S('marfan_ao_seno', '52'); S('marfan_ao_ascendente', '44');
  S('marfan_factores_riesgo', 'si');
  S('mfs_ectopia_lentis', 'si'); S('mfs_historia_familiar', 'si'); S('mfs_sin_otros', 'si');
  S('mfs_z_raiz', '2.4'); S('mfs_pie', 'plano');
  await new Promise(r => setTimeout(r, 420));

  /* ── LA SECCION ───────────────────────────────────────────────────────────── */
  const cam = EL('mfs-campos-col'), con = EL('mfs-concl-col');
  R.campos = caja(cam); R.concl = caja(con);
  R.ladoALado = (cam && con)
    ? ((Math.abs(R.campos.y - R.concl.y) < 12 && R.concl.x > R.campos.x) ? 'si' : 'NO') : 'NO EXISTE';
  R.esperaLado = window.innerWidth >= 900 ? 'si' : 'NO';
  R.hintFuera = EL('marfan-fr-hint') ? 'SIGUE' : 'si';
  /* el orden de los campos por subcolumna */
  const sub = id => { const e = EL(id); if (!e || !e.closest) return -2;
    const c = e.closest('.mfs-subcol');
    return Array.prototype.slice.call(document.querySelectorAll('#mfs-campos-col > .mfs-subcol')).indexOf(c) };
  R.cols = { sind: sub('marfan_sindrome'), fr: sub('marfan_factores_riesgo'),
             seno: sub('marfan_ao_seno'), asc: sub('marfan_ao_ascendente') };
  /* la conclusion en cuatro filas */
  R.filas = Array.prototype.map.call(document.querySelectorAll('#marfan-resultado .calc-row'),
    f => T(f.querySelector('.calc-lbl')).replace(/\\s*\\u24D8\\s*$/, '').trim());
  R.pastilla = T(document.querySelector('#marfan-resultado .badge'));
  R.capSinIndicacion = /indicada|se recomienda|seguimiento|considerar/i.test(T(EL('marfan-resultado'))) ? 'DA INDICACION' : 'si';
  /* el globo de la seccion */
  { const b = document.querySelector('#marfan-resultado [data-vinfo="mf-conducta"]');
    R.secGlobo = b ? { glifo: 'U+' + String(b.textContent).trim().codePointAt(0).toString(16).toUpperCase(),
                       caja: caja(b) } : 'NO EXISTE';
    if (b) { b.scrollIntoView({ block: 'center' }); await new Promise(r => setTimeout(r, 140));
      b.click(); await new Promise(r => setTimeout(r, 300));
      const c = EL('vinfo-card'); const rc = c ? c.getBoundingClientRect() : null;
      R.secTarjeta = { caja: caja(c),
        dentro: rc ? (rc.left >= -1 && rc.top >= -1 && rc.right <= window.innerWidth + 1 &&
                      rc.bottom <= window.innerHeight + 1 ? 'si' : 'NO') : 'NO',
        traeFactores: T(c).indexOf('Historia familiar de disecci') > -1 ? 'si' : 'NO',
        sinImperativos: /se debe|se recomienda|seguimiento|indicada/i.test(T(c)) ? 'NO' : 'si' };
      b.click(); await new Promise(r => setTimeout(r, 170)); } }

  /* ── LA TARJETA ───────────────────────────────────────────────────────────── */
  const bc = bq('critAbrir(' + Q + 'marfan' + Q);
  if (bc) bc.click(); else { try { critAbrir('marfan') } catch (e) { R.errs.push('critAbrir') } }
  await new Promise(r => setTimeout(r, 650));
  const card = EL('crit-card'), cuerpo = EL('crit-cuerpo');
  R.tarjeta = { cuerpo: caja(cuerpo), card: caja(card),
    scrollInterno: card ? Math.max(0, card.scrollHeight - card.clientHeight) : -1,
    bandas: document.querySelectorAll('#crit-cuerpo .mfs-tarj-izq .mfs-banda').length,
    globos: document.querySelectorAll('#crit-cuerpo .vinfo-btn').length,
    figuraDer: (function () { const i = document.querySelector('#crit-cuerpo .mfs-tarj-izq');
      const d = document.querySelector('#crit-cuerpo .mfs-tarj-der');
      if (!i || !d) return 'NO EXISTE';
      const ri = i.getBoundingClientRect(), rd = d.getBoundingClientRect();
      return rd.left > ri.left + 10 ? 'derecha' : 'apilada' })(),
    reglasUnaLinea: Array.prototype.filter.call(document.querySelectorAll('#mfs-reglas .mfs-reg'),
      d => d.getBoundingClientRect().height > 26).length,
    falta: document.querySelectorAll('#mfs-reglas .mfs-falta').length,
    ptsPie: (function () { const b = document.querySelector('#crit-cuerpo [data-mf-pts="mfs_pie"]');
      return b ? String(b.textContent).trim() : 'NO' })(),
    selCortados: (function () { const mal = [];
      document.querySelectorAll('#crit-cuerpo select.mfs-sel').forEach(s => {
        const op = s.options[s.selectedIndex] || s.options[0];
        const m = document.createElement('span');
        m.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
        m.style.font = window.getComputedStyle(s).font; m.textContent = op ? op.textContent : '';
        document.body.appendChild(m);
        const need = m.getBoundingClientRect().width; m.remove();
        const cs = window.getComputedStyle(s);
        const util = s.getBoundingClientRect().width - parseFloat(cs.paddingLeft) -
                     parseFloat(cs.paddingRight) - 18;
        if (need > util + 1) mal.push(s.id) });
      return mal.join(',') || 'ninguno' })(),
    zEnTarjeta: EL('mfs_z_raiz') && EL('mfs_z_raiz').closest('#crit-cuerpo') ? String(EL('mfs_z_raiz').value) : 'NO' };
  /* los tres globos de la tarjeta, con su glifo y su caja */
  R.globos = Array.prototype.map.call(document.querySelectorAll('#crit-cuerpo .vinfo-btn'), b => ({
    k: b.getAttribute('data-vinfo'),
    g: 'U+' + String(b.textContent).trim().codePointAt(0).toString(16).toUpperCase(),
    c: caja(b) }));
  /* las diecinueve definiciones */
  { let pub = 0;
    for (const g of ['mfs-puntaje', 'mfs-aparte']) {
      const b = document.querySelector('#crit-cuerpo [data-vinfo="' + g + '"]');
      if (!b) continue;
      b.scrollIntoView({ block: 'center' }); await new Promise(r => setTimeout(r, 130));
      b.click(); await new Promise(r => setTimeout(r, 290));
      const c = EL('vinfo-card');
      pub += c ? c.querySelectorAll('[data-mfs-def]').length : 0;
      b.click(); await new Promise(r => setTimeout(r, 150));
    }
    R.defs = pub; }
  R.citaEnTarjeta = (function () { const t = T(cuerpo);
    return (t.match(/folio/gi) || []).length + (t.match(/Box [0-9]/g) || []).length +
           (t.indexOf('J Med Genet') > -1 ? 1 : 0) })();
  try { critCerrar() } catch (e) {}
  await new Promise(r => setTimeout(r, 260));

  /* ── EL PAPEL, y las dos cosas que no pueden pasar ────────────────────────── */
  { const c = EL('marfan_incluir_chk');
    if (c && !c.checked) { c.checked = true; c.dispatchEvent(new Event('change', { bubbles: true })) } }
  try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
  await new Promise(r => setTimeout(r, 380));
  { const i = String((EL('informe_texto') || {}).value || '') + ' ' + String((EL('en_suma') || {}).value || '');
    R.papel = { traeScore: i.indexOf('Score sist') > -1 ? 'si' : 'NO',
                sinConclusion: i.indexOf('Cumple criterios para cirug') < 0 ? 'si' : 'NO',
                sinZ: i.indexOf('2.4') < 0 && i.indexOf('2,4') < 0 ? 'si' : 'NO' }; }

  /* ── DESPLAZAMIENTO Y TEXTO RECORTADO ─────────────────────────────────────── */
  R.scrollH = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1 ? 'SI' : 'no';
  R.recortes = (function () { const out = [];
    document.querySelectorAll('#sacc-cc-marfan label, #sacc-cc-marfan .calc-lbl, #sacc-cc-marfan .badge')
      .forEach(e => { const r = e.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;
        if (e.scrollWidth > e.clientWidth + 1) out.push(String(e.textContent).trim().slice(0, 28)) });
    return out.join(' | ') || 'ninguno' })();
  return R;
})()`;

async function unMotor(motor) {
  const b = motor === 'webkit'
    ? await _pw.webkit.launch()
    : await _pw.chromium.launch({ channel: 'chrome' });
  const out = {};
  for (const w of ANCHOS) for (const t of TEMAS) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: t });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 130)) });
    pg.on('pageerror', e => errs.push('PAGE: ' + e.message.slice(0, 130)));
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(1300);
    let r;
    try { r = await Promise.race([pg.evaluate(MEDIR),
      new Promise((_, rj) => setTimeout(() => rj(new Error('reloj ' + motor + ' ' + w + ' ' + t)), 120000))]); }
    catch (e) { r = { errs: ['EVAL: ' + e.message] }; }
    r.consola = errs;
    out[w + '/' + t] = r;
    await ctx.close();
  }
  await b.close();
  return out;
}

const res = {};
for (const m of ['chrome', 'webkit']) res[m] = await unMotor(m);
console.log(JSON.stringify({ file: FILE, res }, null, 1));
