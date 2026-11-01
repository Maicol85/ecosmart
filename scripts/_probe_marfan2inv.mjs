#!/usr/bin/env node
/**
 * _probe_marfan2inv.mjs — INVENTARIO de la tanda MARFAN-2 (punto 1a). SOLO LEE.
 *
 * Mide, sobre el arbol que se le pase:
 *   (i)   la seccion de Marfan a 1440, 1000, 768 y 390 px: alto, maqueta, cajas;
 *   (ii)  TODOS los textos que emite la pantalla de la seccion, con su nodo;
 *   (iii) el glifo y la caja del boton de ayuda estandar frente al de MARFAN-1;
 *   (iv)  la superficie corporal, la edad, el sexo, el peso y la talla;
 *   (v)   la tarjeta de criterios a 1440x900: alto total y scroll interno.
 *
 * ATENCION 1: la seccion vive en C. Congenitas y su acordeon nace CERRADO; sin abrirlo por su
 * boton REAL todo da 0x0 y un cero se lee igual que «no existe».
 * ATENCION 2: la transicion del acordeon es de 0,3 s; un rect leido a mitad de la animacion
 * se superpone con su propio encabezado. Se le quita antes de medir.
 *
 *   node scripts/_probe_marfan2inv.mjs [--file <html>] [--motor chrome|webkit]
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const MOTOR = arg('--motor') || 'chrome';
const ANCHOS = [1440, 1000, 768, 390];

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
  const T = el => el ? String(el.textContent || '').split(/\\s+/).filter(Boolean).join(' ').trim() : 'NO EXISTE';
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  S('nombre', 'Inventario MARFAN2'); S('ci', '591'); S('peso', '70'); S('talla', '170');
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

  /* El paciente del inventario: sindrome con conducta y rasgos cargados, para que TODO emita. */
  S('marfan_sindrome', 'marfan'); S('marfan_ao_seno', '52'); S('marfan_ao_ascendente', '44');
  S('marfan_factores_riesgo', 'si');
  S('mfs_muneca_pulgar', 'ambos'); S('mfs_pectus', 'carinatum'); S('mfs_pie', 'plano');
  S('mfs_neumotorax', 1); S('mfs_estrias', 1); S('mfs_miopia', 1);
  S('mfs_ectopia_lentis', 'si'); S('mfs_historia_familiar', 'si');
  await new Promise(r => setTimeout(r, 400));

  /* ── (i) LA SECCION ──────────────────────────────────────────────────────────── */
  R.seccion   = caja(document.querySelector('#sacc-cc-marfan .sacc-body'));
  R.fila      = cajaId('mfs-fila');
  R.camposCol = cajaId('mfs-campos-col');
  R.conclCol  = cajaId('mfs-concl-col');
  R.ladoALado = (R.camposCol && R.conclCol)
    ? ((Math.abs(R.camposCol.y - R.conclCol.y) < 12 && R.conclCol.x > R.camposCol.x) ? 'si' : 'NO') : 'NO EXISTE';
  R.cajas = {};
  ['marfan_sindrome','marfan_ao_seno','marfan_ao_ascendente','marfan_factores_riesgo',
   'marfan-resultado','marfan-fr-hint','marfan-ao-lectura','marfan-ita-wrap'].forEach(function (id) {
    R.cajas[id] = cajaId(id); });
  R.integrar = caja(document.querySelector('#mfs-concl-col .btn-integrar'));

  /* ── (ii) TODOS LOS TEXTOS QUE EMITE LA PANTALLA ─────────────────────────────── */
  R.txt = {};
  R.txt.introSeccion = T(document.querySelector('#sacc-cc-marfan .sacc-body > p'));
  R.txt.frHint       = T(EL('marfan-fr-hint'));
  R.txt.aoLectura    = T(EL('marfan-ao-lectura'));
  R.txt.itaOrigen    = T(EL('marfan-ita-origen'));
  R.txt.resultado    = T(EL('marfan-resultado'));
  /* fila por fila del cuadro */
  R.filasConcl = Array.prototype.map.call(
    document.querySelectorAll('#marfan-resultado .calc-row'),
    function (f) { return { lbl: T(f.querySelector('.calc-lbl')),
                            val: T(f.querySelector('.calc-val')) || T(f.querySelector('.badge')) }; });
  /* la pastilla: su texto y su clase */
  { const p = document.querySelector('#marfan-resultado .badge');
    R.pastilla = p ? { txt: T(p), cls: p.className } : 'NO EXISTE'; }
  /* TODOS los estados de la pastilla, barriendo las ramas de marfanEstado */
  R.estadosPastilla = [];
  try {
    const esc = [['', '', '', ''], ['marfan','52','44','si'], ['marfan','52','44','no'],
                 ['marfan','47','44','si'], ['marfan','47','44','no'], ['marfan','42','40',''],
                 ['lds','46','42','si'], ['lds','41','40','si'], ['turner','40','38','si'],
                 ['turner','','38',''], ['ehat','56','50','si'], ['ehat','51','48','si'],
                 ['eds','60','55','si'], ['otro','56','50','no']];
    for (const e of esc) {
      S('marfan_sindrome', e[0]); S('marfan_ao_seno', e[1]);
      S('marfan_ao_ascendente', e[2]); S('marfan_factores_riesgo', e[3]);
      await new Promise(r => setTimeout(r, 40));
      const st = (typeof marfanEstado === 'function') ? marfanEstado() : {};
      const pp = document.querySelector('#marfan-resultado .badge');
      R.estadosPastilla.push({ esc: e.join('|'), clave: st.clave || '?', pastilla: T(pp),
        fundamento: (function(){ const fs = document.querySelectorAll('#marfan-resultado .calc-row');
          for (const f of fs) if (T(f.querySelector('.calc-lbl')).indexOf('Fundamento') === 0)
            return T(f.querySelector('.calc-val')); return ''; })(),
        umbral: (function(){ const fs = document.querySelectorAll('#marfan-resultado .calc-row');
          for (const f of fs) if (T(f.querySelector('.calc-lbl')).indexOf('Umbral') === 0)
            return T(f.querySelector('.calc-val')); return ''; })() });
    }
  } catch (e) { R.errs.push('estados: ' + e.message) }
  S('marfan_sindrome', 'marfan'); S('marfan_ao_seno', '52');
  S('marfan_ao_ascendente', '44'); S('marfan_factores_riesgo', 'si');
  await new Promise(r => setTimeout(r, 300));

  /* ── (iii) EL BOTON DE AYUDA: glifo y caja, estandar contra el de MARFAN-1 ───── */
  const glifo = b => { const t = String(b.textContent || '').trim();
    return t.length ? (t + ' U+' + t.codePointAt(0).toString(16).toUpperCase()) : 'VACIO' };
  R.ayuda = { total: document.querySelectorAll('.vinfo-btn').length };
  { const ej = {};
    ['oai-ref','amilo-score','vab-tit','vexus-lim','hemo-forr','mf-conducta'].forEach(function (k) {
      const b = document.querySelector('[data-vinfo="' + k + '"]');
      if (b) ej[k] = { glifo: glifo(b), caja: caja(b), cls: b.className }; else ej[k] = 'NO EN DOM'; });
    R.ayuda.ejemplos = ej; }
  /* censo de glifos de TODOS los botones del documento */
  { const c = {};
    Array.prototype.forEach.call(document.querySelectorAll('.vinfo-btn'), function (b) {
      const g = glifo(b); c[g] = (c[g] || 0) + 1 });
    R.ayuda.censoGlifos = c; }

  /* ── (iv) SUPERFICIE CORPORAL, EDAD, SEXO, PESO, TALLA ───────────────────────── */
  R.datos = {};
  try { R.datos.bsa = (typeof getBSA === 'function') ? getBSA() : 'NO EXISTE'; } catch (e) { R.datos.bsa = 'ERR' }
  ['edad','sexo','peso','talla'].forEach(function (id) {
    const e = EL(id); R.datos[id] = e ? { valor: e.value, tag: e.tagName } : 'NO EXISTE'; });
  R.datos.rotuloSinusal = (function () {
    const i = EL('marfan_ao_seno'); if (!i) return 'NO EXISTE';
    const fg = i.closest ? i.closest('.fg') : null;
    return fg ? T(fg.querySelector('label')) : 'SIN .fg'; })();

  /* ── (v) LA TARJETA DE CRITERIOS ─────────────────────────────────────────────── */
  if (window.innerWidth === 1440) {
    try { critAbrir('marfan') } catch (e) { R.errs.push('critAbrir: ' + e.message) }
    await new Promise(r => setTimeout(r, 600));
    const cuerpo = EL('crit-cuerpo');
    /* ATENCION: el que scrollea es crit-card, NO crit-cuerpo. La tarjeta lleva su max-height
       y su overflow auto en la CAJA, asi que el cuerpo informa su alto COMPLETO -scrollHeight
       igual a clientHeight- aunque no entre, y medirlo a el da «scroll interno 0» sobre una
       tarjeta que se corta. Y el alto del modal tampoco sirve de presupuesto: en cuanto el
       contenido entra, la caja se ENCOGE a su contenido. */
    const modal = EL('crit-card');
    R.tarjeta = {
      cuerpo: caja(cuerpo), modal: caja(modal),
      scrollH: cuerpo ? cuerpo.scrollHeight : 0,
      clientH: cuerpo ? cuerpo.clientHeight : 0,
      scrollInterno: cuerpo ? Math.max(0, cuerpo.scrollHeight - cuerpo.clientHeight) : 0,
      cardScroll: modal ? Math.max(0, modal.scrollHeight - modal.clientHeight) : -1,
      cardScrollH: modal ? modal.scrollHeight : -1,
      cardClientH: modal ? modal.clientHeight : -1,
      cardTope: modal ? window.getComputedStyle(modal).maxHeight : '-',
      ventana: { w: window.innerWidth, h: window.innerHeight },
      globos: document.querySelectorAll('#crit-cuerpo .vinfo-btn').length,
      filas: document.querySelectorAll('#crit-cuerpo .mfs-fila').length,
      reglas: document.querySelectorAll('#crit-cuerpo .mfs-reg').length
    };
    /* ancho util de cada selector contra el ancho que su texto necesita */
    R.selCortados = [];
    Array.prototype.forEach.call(document.querySelectorAll('#crit-cuerpo select.mfs-sel'), function (s) {
      const op = s.options[s.selectedIndex] || s.options[0];
      const txt = op ? String(op.textContent) : '';
      const med = document.createElement('span');
      med.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
      med.style.font = window.getComputedStyle(s).font; med.textContent = txt;
      document.body.appendChild(med);
      const need = med.getBoundingClientRect().width; med.remove();
      const cs = window.getComputedStyle(s);
      const util = s.getBoundingClientRect().width - parseFloat(cs.paddingLeft) -
                   parseFloat(cs.paddingRight) - 18;
      R.selCortados.push({ id: s.id, txt: txt, util: Math.round(util), need: Math.round(need),
                           cortado: (need > util + 1) ? 'SI' : 'no' });
    });
    /* el puntaje MOSTRADO de cada fila contra el de la opcion elegida */
    R.ptsMostrados = [];
    Array.prototype.forEach.call(document.querySelectorAll('#crit-cuerpo .mfs-fila'), function (f) {
      const s = f.querySelector('select'), b = f.querySelector('.mfs-pts');
      if (!s || !b) return;
      const op = s.options[s.selectedIndex];
      const m = op ? String(op.textContent).match(/\\((\\d+)\\)\\s*$/) : null;
      R.ptsMostrados.push({ id: s.id, elegido: s.value, ptsDeLaOpcion: m ? m[1] : '-',
                            mostrado: String(b.textContent).trim() });
    });
    /* los tres bloques: alto de cada uno */
    R.bloques = { score: cajaId('mfs-bloque-score'), aparte: cajaId('mfs-bloque-aparte'),
                  reglas: cajaId('mfs-reglas'), figura: cajaId('mfs-bloque-figura') };
    /* el texto que la tarjeta repite */
    R.tarjetaTxt = {
      notaZ: T(document.querySelector('#crit-cuerpo .mfs-nota')),
      notaFija: T(document.querySelector('#crit-cuerpo .mfs-nota-fija')),
      porReglas: Array.prototype.map.call(document.querySelectorAll('#crit-cuerpo .mfs-reg-por'), T)
    };
    try { critCerrar() } catch (e) {}
    await new Promise(r => setTimeout(r, 200));
  }

  R.scrollH = document.documentElement.scrollWidth > document.documentElement.clientWidth ? 'SI' : 'no';
  return R;
})()`;

async function unMotor(motor) {
  const b = motor === 'webkit'
    ? await _pw.webkit.launch()
    : await _pw.chromium.launch({ channel: 'chrome' });
  const out = {};
  for (const w of ANCHOS) {
    const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: 'dark' });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 160)) });
    pg.on('pageerror', e => errs.push('PAGE: ' + e.message.slice(0, 160)));
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(1200);
    let r;
    try { r = await Promise.race([pg.evaluate(MEDIR),
      new Promise((_, rj) => setTimeout(() => rj(new Error('reloj ' + motor + ' ' + w)), 60000))]); }
    catch (e) { r = { errs: ['EVAL: ' + e.message] }; }
    r.consola = errs;
    out[w] = r;
    await ctx.close();
  }
  await b.close();
  return out;
}

const res = await unMotor(MOTOR);
console.log(JSON.stringify({ motor: MOTOR, file: FILE, res }, null, 1));
