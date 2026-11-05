#!/usr/bin/env node
/**
 * _probe_pant13ui.mjs - el rediseno de «Explorar» y el esquema de circulacion (PANT-13, c2).
 * Mide: las tres zonas a los cuatro anchos, las dos listas con sus filas, las combinaciones con
 * siglas, el area tactil de 44 px de los botones finos por elementFromPoint en cinco puntos, la
 * ausencia de la tabla lateral, el esquema en doce escenas y el movimiento reducido.
 *   node scripts/_probe_pant13ui.mjs [--file <html>] [--anchos ...] [--reduce]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const ANCHOS = (arg('--anchos') || '1440,1000,768,390').split(',').map(Number);
const RED = process.argv.indexOf('--reduce') > 0;
const br = await _pw.chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE, reduce: RED };
for (const w of ANCHOS) {
  const pg = await br.newPage({ viewport: { width: w, height: 900 },
    reducedMotion: RED ? 'reduce' : 'no-preference' });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 150)));
  pg.on('console', c => { if (c.type() === 'error') errs.push('CONS ' + c.text().slice(0, 150)) });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(1400);
  const r = await pg.evaluate(`(async () => {
    const R = {}; const EL = id => document.getElementById(id);
    const esperar = ms => new Promise(z => setTimeout(z, ms));
    const Q = String.fromCharCode(39);
    ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
    const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
      b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
    const caja = el => { if (!el) return null; const q = el.getBoundingClientRect();
      return { w: Math.round(q.width), h: Math.round(q.height), x: Math.round(q.left), y: Math.round(q.top) } };
    const DISP = id => { const e = EL(id); return e ? (e.hidden ? 'hidden' : getComputedStyle(e).display) : 'NO' };
    /* area tactil: cinco puntos del rect EXTENDIDO (el ::after), via elementFromPoint */
    const tactil = el => {
      if (!el) return 'NO';
      el.scrollIntoView({ block: 'center' });
      const q = el.getBoundingClientRect();
      const cs = getComputedStyle(el, '::after');
      const t = parseFloat(cs.top) || 0, b = parseFloat(cs.bottom) || 0;
      const top = q.top + (isNaN(t) ? 0 : t), bot = q.bottom - (isNaN(b) ? 0 : b);
      const alto = Math.round(q.height + Math.abs(t) + Math.abs(b));
      const pts = [[q.left + 2, top + 2], [q.right - 2, top + 2], [q.left + 2, bot - 2],
                   [q.right - 2, bot - 2], [(q.left + q.right) / 2, (top + bot) / 2]];
      let propios = 0; const ajenos = [];
      pts.forEach(p => { const e2 = document.elementFromPoint(p[0], p[1]);
        if (e2 === el || (e2 && el.contains(e2)) || (e2 && e2.contains(el) && e2.tagName !== 'BODY' && e2.tagName !== 'HTML')) propios++;
        else { /* lo que importa no es que sea el propio boton: es que no sea OTRO control */
          const ctl = e2 ? e2.closest('button, input, select, a, [onclick]') : null;
          ajenos.push(ctl ? ('CONTROL:' + (ctl.id || ctl.tagName)) : (e2 ? e2.tagName + (e2.id ? '#' + e2.id : '') : 'null')) } });
      return Math.round(q.width) + 'x' + alto + ' pts=' + propios + '/5' + (ajenos.length ? ' [' + ajenos.join(' ') + ']' : '');
    };
    try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
    await esperar(400);
    const bot = EL('cc3d-abrir'); if (bot) bot.click();
    await esperar(3000);
    try { document.querySelectorAll('.sacc-body').forEach(b => { b.style.transition = 'none' }) } catch (e) {}
    R.three = (typeof window.THREE === 'undefined') ? 'no' : (window.THREE.REVISION || 'si');
    /* ── (A) MODO «SEGUN EL ESTUDIO»: una columna, listas y combinaciones ocultas ── */
    R.modoIni = (typeof window._cm3dEstado === 'function') ? window._cm3dEstado().modo : 'NO';
    R.estCols = getComputedStyle(EL('cm3d-shell')).gridTemplateColumns;
    R.estPl = DISP('cm3d-pl'); R.estPr = DISP('cm3d-pr'); R.estCbw = DISP('cm3d-cbw');
    R.estEstb = DISP('cm3d-estb');
    R.altoEst = (caja(EL('cc3d-panel')) || {}).h;
    /* ── (B) MODO «EXPLORAR»: tres zonas ── */
    const bExp = Array.prototype.filter.call(document.querySelectorAll('.cm3d-md'), b => b.getAttribute('data-m') === 'explorar')[0];
    if (bExp) bExp.click();
    await esperar(700);
    R.expCols = getComputedStyle(EL('cm3d-shell')).gridTemplateColumns;
    R.expPl = caja(EL('cm3d-pl')); R.expPr = caja(EL('cm3d-pr')); R.expMid = caja(EL('cm3d-mid'));
    R.expCbw = DISP('cm3d-cbw');
    R.altoExp = (caja(EL('cc3d-panel')) || {}).h;
    /* la izquierda, el centro y la derecha, en el orden en que se ven */
    R.ordenVisual = [['pl', R.expPl], ['mid', R.expMid], ['pr', R.expPr]]
      .filter(z => z[1]).sort((a, b) => (a[1].y - b[1].y) || (a[1].x - b[1].x)).map(z => z[0]).join('<');
    /* ── (C) LAS DOS LISTAS ── */
    R.filasBase = document.querySelectorAll('#cm3d-baseb .cm3d-rw').length;
    R.filasMods = document.querySelectorAll('#cm3d-modb .cm3d-rw').length;
    R.chipsComb = document.querySelectorAll('#cm3d-presb .cm3d-chip').length;
    R.siglasBase = Array.prototype.map.call(document.querySelectorAll('#cm3d-baseb .cm3d-sg1'), e => e.textContent).join(',');
    R.siglasMods = Array.prototype.map.call(document.querySelectorAll('#cm3d-modb .cm3d-sg1'), e => e.textContent).join(',');
    R.siglasComb = Array.prototype.map.call(document.querySelectorAll('#cm3d-presb .cm3d-chip'), e => e.textContent).join(',');
    R.titComb = Array.prototype.map.call(document.querySelectorAll('#cm3d-presb .cm3d-chip'), e => e.getAttribute('title') || 'SIN').join(' | ');
    R.ariaComb = Array.prototype.filter.call(document.querySelectorAll('#cm3d-presb .cm3d-chip'), e => !e.getAttribute('aria-label')).length;
    /* ── (D) LA TABLA LATERAL Y LAS FILAS DE BOTONES GRANDES NO EXISTEN ── */
    R.tablaLateral = EL('cm3d-side') ? 'EXISTE' : 'no';
    R.ctlViejo = EL('cm3d-ctl') ? 'EXISTE' : 'no';
    R.noteViejo = EL('cm3d-note') ? 'EXISTE' : 'no';
    R.filaVieja = EL('cm3d-fila') ? 'EXISTE' : 'no';
    R.srowViejas = document.querySelectorAll('.cm3d-srow').length;
    /* ── (E) LOS BOTONES FINOS: variante de una base y de una lesion ── */
    const fB = document.querySelectorAll('#cm3d-baseb .cm3d-rw')[1]; if (fB) fB.click();   /* Fallot */
    await esperar(420);
    R.subBase = document.querySelectorAll('#cm3d-baseb .cm3d-sub .cm3d-chip').length;
    R.subBaseTxt = Array.prototype.map.call(document.querySelectorAll('#cm3d-baseb .cm3d-sub .cm3d-chip'), e => e.textContent).join(',');
    const ch1 = document.querySelector('#cm3d-baseb .cm3d-sub .cm3d-chip');
    R.tactilChip = tactil(ch1);
    R.tactilFila = tactil(document.querySelectorAll('#cm3d-modb .cm3d-rw')[0]);
    R.tactilModo = tactil(document.querySelectorAll('.cm3d-md')[0]);
    R.tactilEsb = tactil(EL('cm3d-esb'));
    R.tactilTbn = tactil(EL('cm3d-frente'));
    /* la fila apagada dice su motivo */
    const apag = Array.prototype.filter.call(document.querySelectorAll('#cm3d-modb .cm3d-rw'), b => b.disabled);
    R.apagadas = apag.length;
    R.apagadaTxt = apag.length ? (apag[0].querySelector('.cm3d-nm') || {}).textContent : 'NINGUNA';
    R.apagadaTitle = apag.length ? apag[0].getAttribute('title') : 'NINGUNA';
    /* volver al corazon normal */
    const fN = document.querySelectorAll('#cm3d-baseb .cm3d-rw')[0]; if (fN) fN.click();
    await esperar(400);
    /* ── (F) LA BARRA DE HERRAMIENTAS EN UNA LINEA ── */
    const tb = document.querySelector('#cm3d-mid .cm3d-tb');
    if (tb) { const q = tb.getBoundingClientRect();
      R.barra = Math.round(q.width) + 'x' + Math.round(q.height);
      R.barraHijos = Array.prototype.map.call(tb.children, c => (c.id || c.tagName) + '@y' + Math.round(c.getBoundingClientRect().top - q.top)).join(' ');
      /* las lineas se agrupan con tolerancia de 6 px: un borde de 1 px no es otra linea */
      const tops = Array.prototype.map.call(tb.children, c => c.getBoundingClientRect().top).sort((x, y) => x - y);
      let lin = 0, ult = -999;
      tops.forEach(t => { if (t - ult > 6) { lin++; ult = t } });
      R.barraLineas = lin;
    }
    /* ── (G) EL ESQUEMA DE CIRCULACION ── */
    R.schAntes = DISP('cm3d-sch');
    const esb = EL('cm3d-esb'); if (esb) esb.click();
    await esperar(600);
    R.schDespues = DISP('cm3d-sch');
    R.schAria = esb ? esb.getAttribute('aria-expanded') : 'NO';
    R.vwCols = getComputedStyle(EL('cm3d-vw')).gridTemplateColumns;
    R.schCaja = caja(EL('cm3d-sch'));
    R.cvCaja = caja(EL('cm3d-cv'));
    const svg = EL('cm3d-schsvg');
    R.schNodos = svg ? svg.querySelectorAll('*').length : 'NO';
    R.schCajas = svg ? svg.querySelectorAll('rect').length : 'NO';
    R.schTextos = svg ? Array.prototype.map.call(svg.querySelectorAll('text'), e => e.textContent).join('|') : 'NO';
    R.schAriaLbl = svg ? svg.getAttribute('aria-label') : 'NO';
    R.schCap = (EL('cm3d-schcap') || {}).textContent;
    /* ── (H) LAS DOCE ESCENAS DEL ESQUEMA ── */
    const st = window._cm3dEstado ? window._cm3dEstado() : null;
    const escena = (base, bv, mods, ck) => {
      if (!st) return 'NO';
      st.S.base = base; if (bv) st.S.bv[base] = bv;
      st.S.mods = {}; Object.keys(mods || {}).forEach(k => { st.S.mods[k] = mods[k] });
      st.S.ck = {}; Object.keys(ck || {}).forEach(k => { st.S.ck[k] = ck[k] });
      try { window.cm3dSync() } catch (e) {}
      try { window.cmSchRender() } catch (e) {}
      const sv = EL('cm3d-schsvg');
      if (!sv) return 'NO SVG';
      return { n: sv.querySelectorAll('*').length,
               fl: sv.querySelectorAll('.cm3d-fl').length,
               flechas: Array.prototype.filter.call(sv.querySelectorAll('.cm3d-fl'), p => p.getAttribute('marker-end')).length,
               txt: Array.prototype.map.call(sv.querySelectorAll('text'), e => e.textContent).join('|').slice(0, 220),
               aria: sv.getAttribute('aria-label') };
    };
    R.esc = {};
    R.esc.norm = escena('norm', null, {});
    R.esc.falSin = escena('fal', 'sin', {});
    R.esc.dsavCom = escena('dsav', 'com', {}, { iav: true });
    R.esc.ebs = escena('ebs', 'std', {}, { eit: true });
    R.esc.fonExt = escena('fon', 'ext', {}, { fen: true });
    R.esc.cia = escena('norm', null, { cia: 'sec' });
    R.esc.civ = escena('norm', null, { civ: 'pm' });
    R.esc.dap = escena('norm', null, { dap: 'std' });
    R.esc.coa = escena('norm', null, { coa: 'nat' });
    R.esc.ep = escena('norm', null, { ep: 'valv' });
    R.esc.vcs = escena('norm', null, { vcs: 'std' });
    R.esc.eis = escena('norm', null, { civ: 'pm', dap: 'std', eis: 'std' });
    /* la inversion con Eisenmenger: la CIV sin y con el modificador */
    const sinEis = escena('norm', null, { civ: 'pm' });
    const conEis = escena('norm', null, { civ: 'pm', eis: 'std' });
    const dciv = sv => { const p = Array.prototype.filter.call(document.querySelectorAll('#cm3d-schsvg .cm3d-fl'), x => x.getAttribute('stroke') === '#e08a1e')[0]; return p ? p.getAttribute('d') : 'NO' };
    escena('norm', null, { civ: 'pm' }); R.civSinEis = dciv();
    escena('norm', null, { civ: 'pm', eis: 'std' }); R.civConEis = dciv();
    /* ── (I) EL MOVIMIENTO REDUCIDO ── */
    R.pausado = st ? st.pausado : 'NO';
    R.fcVal = (EL('cm3d-fc') || {}).value;
    const pz = EL('cm3d-pausar');
    R.pzTxt = pz ? pz.textContent : 'NO';
    R.pzAria = pz ? pz.getAttribute('aria-pressed') : 'NO';
    const off0 = Array.prototype.map.call(document.querySelectorAll('#cm3d-schsvg .cm3d-fl'), p => p.getAttribute('stroke-dashoffset') || '-').join(',');
    await esperar(700);
    const off1 = Array.prototype.map.call(document.querySelectorAll('#cm3d-schsvg .cm3d-fl'), p => p.getAttribute('stroke-dashoffset') || '-').join(',');
    R.lineasQuietas = (off0 === off1);
    /* ── (J) desplazamiento horizontal y texto recortado ── */
    const cu = document.querySelector('#cc3d-panel');
    R.scrollH = cu ? Math.max(0, cu.scrollWidth - cu.clientWidth) : 'NO';
    R.recortados = Array.prototype.filter.call(document.querySelectorAll('#cc3d-panel .cm3d-sg1, #cc3d-panel .cm3d-chip, #cc3d-panel .cm3d-ph, #cc3d-panel .cm3d-ph2, #cc3d-panel .cm3d-tg'),
      e => e.scrollWidth > e.clientWidth + 1 && e.getBoundingClientRect().width > 0).map(e => (e.className || '') + ':' + String(e.textContent || '').slice(0, 24)).join(' | ');
    return R;
  })()`).catch(e => ({ EXC: String(e).slice(0, 260) }));
  r.errores = errs.slice(0, 6);
  OUT['w' + w] = r;
  await pg.close();
}
await br.close();
console.log(JSON.stringify(OUT, null, 1));
