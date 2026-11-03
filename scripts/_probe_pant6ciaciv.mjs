/*
 * _probe_pant6ciaciv.mjs - la pantalla de CIA y CIV (PANT-6, commit 1).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *   node scripts/_probe_pant6ciaciv.mjs --file <index.html> [--pasos]
 * --pasos: reproduce paso a paso lo que el medico observo (1a).
 * sin --pasos: los dieciseis cruces (cuatro anchos x cuatro combinaciones) + inventario.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const has = (n) => process.argv.indexOf(n) > -1;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const FILE = arg('--file') || (RAIZ + '/index.html');
const ANCHOS = [1440, 1000, 768, 390];
const COMBOS = ['ninguna', 'cia', 'civ', 'dos'];

/* Abre la pestania y el acordeon por su boton REAL y apaga transiciones. */
const ABRIR = `
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  try { showTab('congenitas') } catch (e) {}
  try { if (typeof ccSubTab === 'function') ccSubTab('congenitas2') } catch (e) {}
  const sec = document.getElementById('sacc-cc-shunt');
  if (sec && !sec.classList.contains('open')) { const h = sec.querySelector('.sacc-hdr'); if (h) h.click() }
  const body = sec && sec.querySelector('.sacc-body'); if (body) body.style.transition = 'none';
`;

/* ══ 1a - PASO A PASO: prender CIA, prender CIV, apagar CIV, apagar CIA ══ */
const JS_PASOS = `(() => {
  ${ABRIR}
  const o = { pasos: [] };
  const vis = (id) => { const e = document.getElementById(id);
    return e ? getComputedStyle(e).display !== 'none' : null };
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
    return Math.round(r.width*10)/10 + 'x' + Math.round(r.height*10)/10 };
  const foto = (nom) => {
    const f = document.getElementById('ete-shunt-fila');
    o.pasos.push({ paso: nom,
      chk: ((document.getElementById('ete_cia_activa')||{}).checked ? 'C' : '-') +
           ((document.getElementById('ete_civ_activa')||{}).checked ? 'V' : '-'),
      pane: (typeof _eteShuntPane !== 'undefined') ? _eteShuntPane : '?',
      visCia: vis('ete-shunt-pane-cia'), visCiv: vis('ete-shunt-pane-civ'),
      clase: f ? (f.className || '(sin clase)') : null,
      wCia: R(document.getElementById('ete-shunt-pane-cia')),
      wCiv: R(document.getElementById('ete-shunt-pane-civ')) });
  };
  const tog = (k) => { const b = document.getElementById('ete-shunt-tab-' + k); if (b) b.click() };
  try { eteShuntSync() } catch (e) { o.syncErr = String(e) }
  foto('0 al abrir');
  tog('cia'); foto('1 prender CIA');
  tog('civ'); foto('2 prender CIV');
  tog('civ'); foto('3 APAGAR CIV');
  tog('cia'); foto('4 APAGAR CIA');
  /* Quien decide: los dos duenos que la orden nombra. */
  o.duenos = {
    eteShuntPanes: (typeof eteShuntPanes === 'function') ? String(eteShuntPanes).replace(/\\s+/g,' ').slice(0, 420) : 'NO EXISTE',
    claseDos: (typeof eteShuntSync === 'function') ? (String(eteShuntSync).indexOf("classList.toggle('dos'") > -1) : null
  };
  return o;
})()`;

/* ══ INVENTARIO + LOS DIECISEIS CRUCES ══ */
const JS = (combo) => `(() => {
  ${ABRIR}
  const o = {};
  const tog = (k) => { const b = document.getElementById('ete-shunt-tab-' + k); if (b) b.click() };
  const want = ${JSON.stringify(combo)};
  if (want === 'cia' || want === 'dos') tog('cia');
  if (want === 'civ' || want === 'dos') tog('civ');
  try { eteShuntSync() } catch (e) { o.syncErr = String(e) }
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10, x: Math.round(r.x*10)/10, y: Math.round(r.y*10)/10 } };
  const vis = (id) => { const e = document.getElementById(id);
    return e ? getComputedStyle(e).display !== 'none' : null };
  o.ciaVis = vis('ete-shunt-pane-cia'); o.civVis = vis('ete-shunt-pane-civ');
  o.chk = ((document.getElementById('ete_cia_activa')||{}).checked ? 'C' : '-') +
          ((document.getElementById('ete_civ_activa')||{}).checked ? 'V' : '-');
  const pc = document.getElementById('ete-shunt-pane-cia'), pv = document.getElementById('ete-shunt-pane-civ');
  const secc = document.getElementById('sacc-cc-shunt');
  o.fila = R(document.getElementById('ete-shunt-fila'));
  o.pc = R(pc); o.pv = R(pv); o.sec = R(secc && secc.querySelector('.sacc-body'));
  o.ladoALado = (o.pc && o.pv && o.ciaVis && o.civVis) ? (Math.abs(o.pc.y - o.pv.y) < 20 && o.pc.x < o.pv.x) : null;
  o.igualAncho = (o.pc && o.pv && o.ciaVis && o.civVis) ? (Math.abs(o.pc.w - o.pv.w) < 2) : null;
  o.donut = R(document.getElementById('cia-donut-svg'));
  o.donutSegs = document.querySelectorAll('#cia-donut-svg path, #cia-donut-svg circle').length;
  o.donutTextos = Array.prototype.slice.call(document.querySelectorAll('#cia-donut-svg text'))
    .map(t => (t.textContent||'').trim()).filter(x => x).length;
  o.donutPanel = (document.getElementById('cia-donut-panel') || { innerHTML: '' }).innerHTML.length;
  /* TODOS los campos de la seccion habilitados (los _ro de solo lectura NO cuentan: son espejos) */
  const cuerpo = secc && secc.querySelector('.sacc-body');
  const campos = cuerpo ? Array.prototype.slice.call(cuerpo.querySelectorAll('input[id], select[id], textarea[id]'))
    .filter(e => e.type !== 'checkbox' && e.type !== 'hidden') : [];
  o.nCampos = campos.length;
  o.deshab = campos.filter(e => e.disabled).map(e => e.id);
  o.roEsperados = campos.filter(e => e.readOnly).map(e => e.id);
  o.ids = campos.map(e => e.id).sort().join(',');
  /* los botones de lesion, y DONDE estan dentro de su cuadro */
  const bc = document.getElementById('ete-shunt-tab-cia'), bv = document.getElementById('ete-shunt-tab-civ');
  o.btnCia = R(bc); o.btnCiv = R(bv);
  o.btnCiaDentroCia = !!(bc && pc && pc.contains(bc));
  o.btnCivDentroCiv = !!(bv && pv && pv.contains(bv));
  /* el cuadro comun de abajo */
  const com = document.getElementById('ete-shunt-comun');
  o.comun = R(com);
  o.comunFuera = (com && document.getElementById('ete-shunt-fila')) ?
    !document.getElementById('ete-shunt-fila').contains(com) : null;
  const bi = document.querySelector('[data-ete-chk="ete_shunt_incluir_chk"]');
  o.btnIntegrar = R(bi);
  /* paps-it repetido dentro de la CIA */
  o.papsItEnCia = !!(pc && document.getElementById('ete-cia-paps-it') && pc.contains(document.getElementById('ete-cia-paps-it')));
  /* geometria global */
  o.scrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  o.recortados = [];
  if (cuerpo) Array.prototype.slice.call(cuerpo.querySelectorAll('label, .calc-lbl')).forEach(e => {
    if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) o.recortados.push((e.textContent||'').trim().slice(0,30)) });
  /* columnas internas de cada cuadro */
  const ncols = (id) => { const g = document.getElementById(id); if (!g) return null;
    const t = getComputedStyle(g).gridTemplateColumns; return t ? t.split(' ').filter(x=>x).length : null };
  o.colsCia = ncols('ete-cia-cols'); o.colsCiv = ncols('ete-civ-cols'); o.colsCom = ncols('ete-shunt-comun-cols');
  return o;
})()`;

const nav = await _pw.chromium.launch({ channel: 'chrome' });
if (has('--pasos')) {
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(String(e).slice(0, 110)));
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
  await pg.waitForTimeout(1200);
  try {
    const a = await Promise.race([pg.evaluate(JS_PASOS),
      new Promise((_, rj) => setTimeout(() => rj(new Error('timeout')), 60000))]);
    console.log('== 1a PASO A PASO a 1440 px, archivo ' + FILE.split('/').pop() + ' ==');
    a.pasos.forEach(p => console.log('  ' + p.paso.padEnd(16) + ' chk=' + p.chk +
      ' pane=' + String(p.pane).padEnd(4) + ' visCIA=' + String(p.visCia).padEnd(5) +
      ' visCIV=' + String(p.visCiv).padEnd(5) + ' clase="' + p.clase + '"' +
      ' wCIA=' + p.wCia + ' wCIV=' + p.wCiv));
    console.log('  duenos: claseDos en eteShuntSync=' + a.duenos.claseDos);
    console.log('  eteShuntPanes: ' + a.duenos.eteShuntPanes);
    if (a.syncErr) console.log('  syncErr ' + a.syncErr);
    console.log('  err ' + errs.length + ' ' + (errs[0] || ''));
  } catch (e) { console.log('ERROR ' + String(e).slice(0, 200)) }
  await ctx.close();
} else {
  for (const w of ANCHOS) {
    for (const c of COMBOS) {
      const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
      const pg = await ctx.newPage();
      const errs = []; pg.on('pageerror', e => errs.push(String(e).slice(0, 110)));
      try {
        await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
        await pg.waitForTimeout(1000);
        const a = await Promise.race([pg.evaluate(JS(c)),
          new Promise((_, rj) => setTimeout(() => rj(new Error('timeout')), 60000))]);
        console.log(String(w).padStart(4) + ' ' + c.padEnd(8) +
          ' | chk=' + a.chk + ' vis=' + (a.ciaVis?'C':'-') + (a.civVis?'V':'-') +
          ' | sec ' + (a.sec ? a.sec.w + 'x' + a.sec.h : '-') +
          ' pc ' + (a.pc ? a.pc.w + 'x' + a.pc.h : '-') + ' pv ' + (a.pv ? a.pv.w + 'x' + a.pv.h : '-') +
          ' | lado=' + a.ladoALado + ' igual=' + a.igualAncho +
          ' | btnEnCuadro=' + a.btnCiaDentroCia + '/' + a.btnCivDentroCiv +
          ' | cols C/V/com=' + a.colsCia + '/' + a.colsCiv + '/' + a.colsCom +
          ' | donut ' + (a.donut ? a.donut.w + 'x' + a.donut.h : '-') + ' segs=' + a.donutSegs +
          ' txt=' + a.donutTextos + ' panel=' + a.donutPanel +
          ' | campos=' + a.nCampos + ' deshab=' + a.deshab.length + (a.deshab.length?JSON.stringify(a.deshab):'') +
          ' ro=' + a.roEsperados.length +
          ' | comun=' + (a.comun ? a.comun.w+'x'+a.comun.h : 'NO') + ' fuera=' + a.comunFuera +
          ' | papsItEnCia=' + a.papsItEnCia +
          ' | recort=' + a.recortados.length + (a.recortados.length ? JSON.stringify(a.recortados) : '') +
          ' | scrollX=' + a.scrollX + ' | err ' + errs.length + ' ' + (errs[0] || ''));
        if (w === 1440 && c === 'dos') console.log('      IDS: ' + a.ids);
      } catch (e) { console.log(w + ' ' + c + ' ERROR ' + String(e).slice(0, 160)) }
      await ctx.close();
    }
  }
}
await nav.close();
