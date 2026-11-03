/*
 * _probe_pant3c4.mjs - el boton «3D» del corazon maestro (tanda PANT-3, commit 4).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * Mide: UNA sola instancia del boton y del panel; que se ve en las DOS sub-pestanias de
 * congenitas y en NINGUNA otra; el PRESTAMO del recuadro de la transposicion y su devolucion al
 * MISMO lugar; que el diagrama dibuja las comunicaciones cargadas; la linea de lo no dibujado; y
 * que nada de esto escribe un campo del estudio.
 *
 * DENOMINADORES declarados en cada bloque. En HEAD el boton no existe: eso es la linea base.
 *
 *   node scripts/_probe_pant3c4.mjs --file <index.html> --out /tmp/p3c4.json
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p3c4.json';
const ANCHOS = (arg('--anchos') || '1440,1000,768,390').split(',').map(Number);

const PREP = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  return 1;
})()`;

/* El censo de instancias: cuantos botones y cuantos paneles hay en TODO el documento. */
const INST = `(() => ({
  botones: document.querySelectorAll('#cc3d-abrir, [onclick*="cc3dTog"]').length,
  paneles: document.querySelectorAll('#cc3d-panel').length,
  wraps:   document.querySelectorAll('#cc3d-wrap').length,
  globos:  document.querySelectorAll('[data-vinfo="cc-3d"]').length,
  todosGlobos: document.querySelectorAll('[data-vinfo]').length
}))()`;

const LEER = `(() => {
  const o = {};
  const w = document.getElementById('cc3d-wrap');
  const b = document.getElementById('cc3d-abrir');
  const pan = document.getElementById('cc3d-panel');
  const host = document.getElementById('cc3d-host');
  const box = document.getElementById('tga-3d-box');
  o.wrapVis = w ? (getComputedStyle(w).display === 'none' ? 'oculto' : 'visible') : 'NO EXISTE';
  if (b) { const r = b.getBoundingClientRect();
    o.bot = { w: Math.round(r.width), h: Math.round(r.height), cls: b.className,
              pressed: b.getAttribute('aria-pressed') }; } else o.bot = 'NO EXISTE';
  o.panVis = pan ? (getComputedStyle(pan).display === 'none' ? 'oculto' : 'visible') : 'NO EXISTE';
  /* ¿Donde esta el recuadro? El padre dice si esta prestado o devuelto. */
  o.recuadroEn = box ? (box.parentNode ? (box.parentNode.id || box.parentNode.className || 'sin id') : 'suelto') : 'NO EXISTE';
  o.hostHijos = host ? host.children.length : 'NO EXISTE';
  /* El dibujo: cuantos anillos de comunicacion tiene el esquema, y si el lienzo del 3D existe. */
  const sv = document.getElementById('tga-esq-svg');
  const tx = sv ? sv.querySelectorAll('text') : [];
  o.esqTextos = tx.length;
  o.esqComs = Array.prototype.filter.call(tx, t => ['CIA','CIV','DAP'].indexOf(String(t.textContent||'').trim()) >= 0)
                .map(t => String(t.textContent||'').trim()).sort().join(',');
  o.cv = document.querySelector('#tga-3d-cv canvas') ? 'si' : 'no';
  const f = document.getElementById('cc3d-faltan');
  o.faltan = f ? String(f.textContent || '').slice(0, 170) : 'NO EXISTE';
  const et = document.getElementById('tga-esq-txt');
  o.esqTxt = et ? String(et.textContent || '').slice(0, 120) : 'NO EXISTE';
  return o;
})()`;

/* Foto de TODOS los campos del estudio, para probar que el panel no escribe nada. */
const FOTO = `(() => {
  const c = {};
  document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
    if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
    c[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '0') : String(e.value || '');
  });
  return c;
})()`;

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE };
try {
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([e.message.slice(0, 140)]) });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
  await pg.waitForTimeout(1600);
  await pg.evaluate(PREP);
  OUT.instancias = await pg.evaluate(INST);

  /* ── A · el pie se ve SOLO en congenitas ── */
  OUT.porTab = {};
  for (const t of ['datos', 'valvulas', 'congenitas', 'congenitas2', 'lab', 'refs']) {
    await pg.evaluate(`(() => { try { showTab(${JSON.stringify(t)}) } catch (e) {}
      try { if (${JSON.stringify(t)}.indexOf('congenitas') === 0) ccSubTab(${JSON.stringify(t)}) } catch (e) {}
      return 1 })()`);
    await pg.waitForTimeout(260);
    const r = await pg.evaluate(LEER);
    OUT.porTab[t] = { wrapVis: r.wrapVis, bot: r.bot && r.bot.w ? (r.bot.w + 'x' + r.bot.h) : String(r.bot) };
  }

  /* ── B · sin lesiones: corazon normal y la linea lo dice ── */
  await pg.evaluate(`(() => { try { showTab('congenitas'); ccSubTab('congenitas') } catch (e) {} return 1 })()`);
  await pg.waitForTimeout(300);
  OUT.B_antes = await pg.evaluate(LEER);
  OUT.B_foto = await pg.evaluate(FOTO);
  await pg.evaluate(`(() => { const b = document.getElementById('cc3d-abrir'); if (b) b.click(); return 1 })()`);
  await pg.waitForTimeout(1600);
  OUT.B_abierto = await pg.evaluate(LEER);
  OUT.B_foto2 = await pg.evaluate(FOTO);

  /* ── C · con las tres comunicaciones cargadas ── */
  await pg.evaluate(`(() => {
    const S = (id, v) => { const e = document.getElementById(id); if (!e) return; e.value = v;
      e.dispatchEvent(new Event('input', { bubbles:true })); e.dispatchEvent(new Event('change', { bubbles:true })) };
    S('ete_cia_tipo','secundum'); S('ete_cia_tam_max','12'); S('ete_cia_dir','id');
    S('ete_civ_tipo','muscular'); S('ete_civ_tam','6');
    S('dap_tipo','restrictivo'); S('dap_diam','4'); S('dap_dir','id');
    S('coa_istmo','8'); S('mch_espesor','18');
    try { if (typeof _recalcModulos === 'function') _recalcModulos('c4') } catch (e) {}
    return 1 })()`);
  await pg.waitForTimeout(700);
  await pg.evaluate(`(() => { if (typeof cc3dTextoSync === 'function') cc3dTextoSync();
    if (typeof tgaSync === 'function') tgaSync(); return 1 })()`);
  await pg.waitForTimeout(700);
  OUT.C_coms = await pg.evaluate(LEER);
  OUT.C_noDib = await pg.evaluate(`(() => (typeof cc3dNoDibujadas === 'function') ? cc3dNoDibujadas() : 'SIN FN')()`);

  /* ── D · cerrar: el recuadro vuelve a su lugar ── */
  await pg.evaluate(`(() => { const b = document.getElementById('cc3d-abrir'); if (b) b.click(); return 1 })()`);
  await pg.waitForTimeout(600);
  OUT.D_cerrado = await pg.evaluate(LEER);

  /* ── E · abrir y cambiar de pestania: se cierra y devuelve el recuadro ── */
  await pg.evaluate(`(() => { const b = document.getElementById('cc3d-abrir'); if (b) b.click(); return 1 })()`);
  await pg.waitForTimeout(900);
  OUT.E_abierto = await pg.evaluate(LEER);
  await pg.evaluate(`(() => { try { showTab('valvulas') } catch (e) {} return 1 })()`);
  await pg.waitForTimeout(500);
  await pg.evaluate(`(() => { try { showTab('congenitas2'); ccSubTab('congenitas2') } catch (e) {} return 1 })()`);
  await pg.waitForTimeout(600);
  OUT.E_vuelta = await pg.evaluate(LEER);
  /* y el recuadro tiene que estar DENTRO de la seccion de la transposicion */
  OUT.E_donde = await pg.evaluate(`(() => {
    const box = document.getElementById('tga-3d-box');
    if (!box) return 'NO EXISTE';
    const sec = document.getElementById('sacc-cc-tga');
    return { dentroDeTGA: !!(sec && sec.contains(box)), padre: box.parentNode ? (box.parentNode.id || box.parentNode.className) : '-' };
  })()`);

  /* ── F · con una TGA cargada: su escenario, y la CIA no se dibuja con el switch auricular ── */
  await pg.evaluate(`(() => {
    const S = (id, v) => { const e = document.getElementById(id); if (!e) return; e.value = v;
      e.dispatchEvent(new Event('change', { bubbles:true })) };
    S('tga_tipo','dtga'); S('tga_cirugia','auricular');
    try { if (typeof tgaSync === 'function') tgaSync() } catch (e) {}
    return 1 })()`);
  await pg.waitForTimeout(700);
  await pg.evaluate(`(() => { const b = document.getElementById('cc3d-abrir'); if (b) b.click(); return 1 })()`);
  await pg.waitForTimeout(1400);
  OUT.F_tga = await pg.evaluate(LEER);

  /* ── G · la geometria a los cuatro anchos, con el panel abierto ── */
  OUT.altos = {};
  for (const w of ANCHOS) {
    await pg.setViewportSize({ width: w, height: 900 });
    await pg.waitForTimeout(450);
    OUT.altos[w] = await pg.evaluate(`(() => {
      const pan = document.getElementById('cc3d-panel'), b = document.getElementById('cc3d-abrir');
      const cv = document.getElementById('tga-3d-cv'), sv = document.getElementById('tga-esq-svg');
      const rp = pan ? pan.getBoundingClientRect() : null, rb = b ? b.getBoundingClientRect() : null;
      const rc = cv ? cv.getBoundingClientRect() : null, rs = sv ? sv.getBoundingClientRect() : null;
      return { pan: rp ? [Math.round(rp.width), Math.round(rp.height)] : null,
               bot: rb ? [Math.round(rb.width), Math.round(rb.height)] : null,
               cv:  rc ? [Math.round(rc.width), Math.round(rc.height)] : null,
               esq: rs ? [Math.round(rs.width), Math.round(rs.height)] : null,
               scrollX: document.documentElement.scrollWidth > document.documentElement.clientWidth ? 1 : 0 };
    })()`);
  }
  /* ── H · el globo ── */
  await pg.setViewportSize({ width: 1440, height: 900 });
  await pg.waitForTimeout(300);
  OUT.H_globo = await pg.evaluate(`(() => {
    const b = document.querySelector('[data-vinfo="cc-3d"]');
    if (!b) return 'NO EXISTE';
    const rb = b.getBoundingClientRect();
    b.click();
    const c = document.getElementById('vinfo-card');
    const vis = c && getComputedStyle(c).display !== 'none';
    const t = c ? String(c.textContent || '') : '';
    const rc = c ? c.getBoundingClientRect() : null;
    const o = { bot: [Math.round(rb.width), Math.round(rb.height)], abierta: vis ? 1 : 0,
                largo: t.length,
                dentro: rc ? (rc.left >= -1 && rc.top >= -1 && rc.right <= innerWidth + 1 && rc.bottom <= innerHeight + 1 ? 1 : 0) : 0,
                revision: /pendiente de revisi|sin validar|cardi[oó]logo/i.test(t) ? 1 : 0,
                cita: /Clase |folio |Tabla \\d|ESC |AHA/.test(t) ? 1 : 0,
                ilustrativo: /ILUSTRATIVO|ilustrativo/.test(t) ? 1 : 0 };
    b.click();
    return o;
  })()`);
  await pg.close();
} catch (e) { OUT._err = String(e).slice(0, 300) }
try { await b.close() } catch (e) {}
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
/* El diff de las dos fotos: el panel no puede escribir un campo del estudio. */
let dif = [];
if (OUT.B_foto && OUT.B_foto2) {
  for (const k of Object.keys(OUT.B_foto))
    if (OUT.B_foto[k] !== OUT.B_foto2[k]) dif.push(k + ': ' + OUT.B_foto[k] + ' -> ' + OUT.B_foto2[k]);
  OUT.camposMovidos = dif;
  fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
}
console.log('instancias: ' + JSON.stringify(OUT.instancias));
console.log('campos del estudio que el panel movio al abrirse: ' + dif.length + (dif.length ? ' -> ' + dif.slice(0, 6).join(' | ') : ''));
console.log('escrito: ' + OUTF);
