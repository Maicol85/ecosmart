#!/usr/bin/env node
/**
 * _probe_marfan1pant.mjs — la pantalla de Marfan (MARFAN-1, commit 4 y 6).
 *
 * Mide en los cuatro anchos y los dos temas, en los dos motores: la maqueta lado a lado desde
 * 900 px y apilada por debajo; que la ASCENDENTE quede DEBAJO de la SINUSAL; el globo de
 * «Conducta aortica» en 44x44 con sus cinco puntos; que el cuadro ya no nombre la guia, la
 * tabla, el folio ni la clase; y cero scroll horizontal y cero texto recortado.
 *
 * ATENCION 1: la seccion vive en C. Congenitas -> #tab-congenitas y su acordeon nace CERRADO:
 * hay que abrirlo por su boton REAL o todo da 0x0.
 * ATENCION 2: la transicion de apertura es de 0,3 s y un rect leido a mitad de la animacion se
 * superpone con su propio encabezado. Se le quita antes de medir.
 * ATENCION 3: un `elementFromPoint` fuera del viewport devuelve null, no «tapado»: el control
 * se trae a la vista antes de medir el area tactil.
 *
 *   node scripts/_probe_marfan1pant.mjs [--file <html>] [--motor chrome|webkit]
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const MOTOR = arg('--motor') || 'chrome';
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['dark', 'light'];

const MEDIR = `(async () => {
  const R = { errs: [], ancho: window.innerWidth };
  const EL = id => document.getElementById(id);
  const S = (id, v) => { const e = EL(id); if (!e) return;
    if (e.type === 'checkbox') e.checked = (v === 1 || v === true); else e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })) };
  const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top) } };
  const cajaId = id => caja(EL(id));
  const T = el => el ? String(el.textContent || '').split(' ').filter(Boolean).join(' ').trim() : 'NO';
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  S('nombre', 'Prueba MARFAN1'); S('ci', '586'); S('peso', '70'); S('talla', '170');
  S('sexo', 'M'); S('edad', '34');

  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const Q = String.fromCharCode(39);
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click(); else showTab('congenitas') } catch (e) {}
  await new Promise(r => setTimeout(r, 300));
  const acc = EL('sacc-cc-marfan');
  if (acc && !acc.classList.contains('open')) { const h = document.querySelector('#sacc-cc-marfan .sacc-hdr'); if (h) h.click() }
  await new Promise(r => setTimeout(r, 420));
  R.accAbierto = acc ? (acc.classList.contains('open') ? 'si' : 'NO') : 'NO EXISTE';
  try { document.querySelectorAll('.sacc-body').forEach(b => { b.style.transition = 'none' }) } catch (e) {}
  await new Promise(r => setTimeout(r, 120));

  /* un paciente con conducta: asi la capsula tiene todas sus filas */
  S('marfan_sindrome', 'marfan'); S('marfan_ao_seno', '52'); S('marfan_ao_ascendente', '44');
  await new Promise(r => setTimeout(r, 350));

  /* ── MAQUETA ────────────────────────────────────────────────────────────────── */
  const campos = EL('mfs-campos-col'), concl = EL('mfs-concl-col');
  R.campos = caja(campos); R.concl = caja(concl);
  R.ladoALado = (campos && concl) ? (Math.abs(R.campos.y - R.concl.y) < 12 && R.concl.x > R.campos.x ? 'si' : 'NO') : 'NO EXISTE';
  /* la ASCENDENTE debajo de la SINUSAL: misma x, mayor y */
  const cs = cajaId('marfan_ao_seno'), ca = cajaId('marfan_ao_ascendente');
  R.sinusal = cs; R.ascendente = ca;
  R.ascDebajo = (cs && ca) ? ((Math.abs(cs.x - ca.x) < 4 && ca.y > cs.y) ? 'si' : 'NO') : 'NO EXISTE';
  R.integrarCaja = caja(document.querySelector('#mfs-concl-col .btn-integrar'));
  R.integrarDebajo = (R.integrarCaja && R.concl) ? (R.integrarCaja.y > (cajaId('marfan-resultado') || {y:0}).y ? 'si' : 'NO') : 'NO';

  /* ── EL CUADRO: sin guia, tabla, folio ni clase ─────────────────────────────── */
  const cap = EL('marfan-resultado');
  R.capsula = T(cap);
  const MARC = ['ESC 2024', 'Tabla 62', 'Tabla 38', 'Tabla 66', 'folio', 'Clase I', 'Clase II', 'Nivel B', 'Nivel C'];
  R.capsulaMarc = {};
  MARC.forEach(m => { const n = R.capsula.split(m).length - 1; if (n) R.capsulaMarc[m] = n });
  R.capsulaFilas = cap ? Array.prototype.map.call(cap.querySelectorAll('.calc-row'),
    f => T(f.querySelector('.calc-lbl'))) : [];

  /* ── EL GLOBO: 44x44 y sus cinco puntos ─────────────────────────────────────── */
  const gb = document.querySelector('#marfan-resultado [data-vinfo="mf-conducta"]');
  R.globo = caja(gb);
  if (gb) {
    /* fuera del viewport, elementFromPoint da null: se trae a la vista primero */
    gb.scrollIntoView({ block: 'center' });
    await new Promise(r => setTimeout(r, 160));
    const r2 = gb.getBoundingClientRect();
    const pts = [[r2.left + 2, r2.top + 2], [r2.right - 2, r2.top + 2],
                 [r2.left + 2, r2.bottom - 2], [r2.right - 2, r2.bottom - 2],
                 [(r2.left + r2.right) / 2, (r2.top + r2.bottom) / 2]];
    R.globoPuntos = pts.map(pp => { const e = document.elementFromPoint(pp[0], pp[1]);
      return e === gb ? 'P' : (e && gb.contains(e) ? 'p' : (e ? (e.tagName === 'BUTTON' || e.tagName === 'SELECT' || e.tagName === 'INPUT' ? 'X' : '-') : 'n')) }).join('');
    gb.click();
    await new Promise(r => setTimeout(r, 260));
    const card = document.getElementById('vinfo-card');
    R.globoTarjeta = caja(card);
    R.globoTxt = T(card);
    R.globoDentro = (card && R.globoTarjeta) ? (R.globoTarjeta.x >= 0 && R.globoTarjeta.y >= 0 &&
      R.globoTarjeta.x + R.globoTarjeta.w <= window.innerWidth + 1 ? 'si' : 'NO') : 'NO';
    /* el globo SI tiene que traer lo que el cuadro ya no dice */
    R.globoTiene = ['ESC 2024', 'Clase I', 'Nivel B', 'Tabla'].filter(m => R.globoTxt.indexOf(m) >= 0);
    gb.click(); await new Promise(r => setTimeout(r, 140));
  }

  /* ── LA FIGURA (commit 6): se abre la tarjeta y se mide ──────────────────────── */
  R.figura = { existeEnSeccion: !!EL('mfs-fig-svg') };
  try { critAbrir('marfan') } catch (e) { R.errs.push('critAbrir: ' + e.message) }
  await new Promise(r => setTimeout(r, 320));
  {
    const sv = EL('mfs-fig-svg'), cj = document.querySelector('#crit-cuerpo .mfs-fig-caja');
    R.figura.svg = caja(sv); R.figura.caja = caja(cj);
    R.figura.enTarjeta = !!document.querySelector('#crit-cuerpo #mfs-fig-svg');
    R.figura.columnas = document.querySelectorAll('#crit-cuerpo > div > div').length;
    /* un rasgo: la marca tiene que aparecer */
    const mp = EL('mfs_muneca_pulgar');
    if (mp) { mp.value = 'ambos'; mp.dispatchEvent(new Event('change', { bubbles: true })) }
    await new Promise(r => setTimeout(r, 420));
    const mk = EL('mfs-fig-marcas');
    R.figura.marcasConRasgo = mk ? mk.children.length : -1;
    R.figura.alt = T(EL('mfs-fig-alt'));
    /* la casilla de referencia: es preferencia de pantalla y NO campo guardado */
    const rf = EL('mfs-fig-ref');
    R.figura.refEsCampo = (rf && typeof _noEsDelEstudio === 'function') ? (_noEsDelEstudio('mfs-fig-ref') ? 'NO' : 'SI ES CAMPO') : '?';
    if (rf) { rf.checked = true; rf.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(r => setTimeout(r, 200));
      const gh = EL('mfs-fig-ghost');
      R.figura.ghost = gh ? (gh.style.display === 'none' ? 'oculto' : 'visible') : 'NO EXISTE';
      rf.checked = false; rf.dispatchEvent(new Event('change', { bubbles: true }));
      await new Promise(r => setTimeout(r, 160));
      const gh2 = EL('mfs-fig-ghost');
      R.figura.ghostApagado = gh2 ? (gh2.style.display === 'none' ? 'oculto' : 'VISIBLE') : 'NO'; }
    /* la tarjeta no puede desbordar la ventana ni scrollear en horizontal */
    const card = EL('crit-card');
    R.figura.cardCaja = caja(card);
    R.figura.cardScrollX = card ? card.scrollWidth - card.clientWidth : -1;
    if (mp) { mp.value = ''; mp.dispatchEvent(new Event('change', { bubbles: true })) }
  }
  R.scrollHConTarjeta = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  try { critCerrar() } catch (e) {}
  await new Promise(r => setTimeout(r, 160));

  /* ── SCROLL HORIZONTAL Y TEXTO RECORTADO ────────────────────────────────────── */
  R.scrollH = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  R.recortados = [];
  if (acc) acc.querySelectorAll('label, .calc-lbl, .calc-val, option, .mfs-rot, button').forEach(e => {
    if (!e.offsetParent && e.tagName !== 'OPTION') return;
    if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0)
      R.recortados.push(e.tagName + '.' + String(e.className).slice(0, 20) + ':' + T(e).slice(0, 26));
  });
  /* las pestanas con caja, como control de que la pagina no se rompio */
  R.pestanas = Array.prototype.filter.call(document.querySelectorAll('.tab-btn'),
    b => b.getBoundingClientRect().width > 0).length;
  return R;
})()`;

(async () => {
  const lanzar = async () => MOTOR === 'webkit'
    ? await _pw.webkit.launch() : await _pw.chromium.launch({ channel: 'chrome' });
  const br = await lanzar();
  const out = { file: FILE, motor: MOTOR, cruces: {} };
  for (const w of ANCHOS) for (const t of TEMAS) {
    const ctx = await br.newContext({ viewport: { width: w, height: 900 }, colorScheme: t });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', e => errs.push('PAGE ' + e.message));
    pg.on('console', m => { if (m.type() === 'error') errs.push('CONS ' + m.text().slice(0, 110)) });
    await pg.goto('file://' + FILE);
    await pg.waitForTimeout(1400);
    if (t === 'light') await pg.evaluate("document.documentElement.classList.add('light-mode')");
    let r;
    try { r = await pg.evaluate(MEDIR) } catch (e) { r = { fatal: e.message } }
    r.errsPagina = errs;
    out.cruces[w + '/' + t] = r;
    await ctx.close();
  }
  await br.close();
  console.log(JSON.stringify(out, null, 1));
  process.exit(0);
})();
