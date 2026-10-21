#!/usr/bin/env node
/**
 * _probe_b2.mjs - la sonda de las CORRECCIONES de la reorganizacion (trabajo B2, 2026-10-22).
 *
 * Mide lo RENDERIZADO en los DOS motores: la columna izquierda, las barras apiladas de
 * «Pericardio y pulmon», el eco pulmonar unificado, las dos barras de Otros y el formato de
 * los botones de C. Congenitas. A/B de solo lectura con --file.
 *
 *   node scripts/_probe_b2.mjs --solo rail
 *   node scripts/_probe_b2.mjs --solo color --motor chromium
 *   node scripts/_probe_b2.mjs --solo ctrl --file /tmp/head_b2.html
 *   node scripts/_probe_b2.mjs --solo captura --dest /tmp/b2cap
 *
 * ADVERTENCIA: sin acentos graves dentro del template de la sonda, y sin \s ni \n crudos
 * (se cocinan dentro del template literal: van con doble barra EN EL ARCHIVO).
 */
const CANDIDATAS = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
                    '/tmp/pw/node_modules/playwright/index.js',
                    '/usr/local/lib/node_modules/playwright/index.js',
                    process.env.HOME + '/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CANDIDATAS) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CANDIDATAS }, null, 1));
  process.exit(2); }
const { chromium, webkit } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const SOLO = (arg('--solo') || 'rail').split(',').map(s => s.trim());
const FILE = arg('--file') || (RAIZ + '/index.html');
const DEST = arg('--dest') || '/tmp/b2cap';
const MOTOR = arg('--motor');
const OUT = {};
const hay = (g) => SOLO.indexOf(g) > -1;

const PRELUDIO = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  try { localStorage.setItem('ett_view_mode','avanzado') } catch (e) {}
  if (typeof applyViewMode === 'function') { try { applyViewMode() } catch (e) {} }
  return true;
})()`;

/* ══ (a) LA COLUMNA IZQUIERDA Y LA FILA DE ARRIBA ══════════════════════════════════════
   Un boton con display:none NO tiene geometria, asi que «visible» se mide por el rect. */
const RAIL = `(() => {
  const vis = (b) => { const r = b.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(b).display !== 'none' };
  const lee = (sel) => Array.prototype.slice.call(document.querySelectorAll(sel)).map(b => {
    const oc = b.getAttribute('onclick') || '';
    const a = oc.indexOf("showTab('"); const z = a < 0 ? -1 : oc.indexOf("'", a + 9);
    return { txt: (b.textContent || '').replace(/\\s+/g, ' ').trim(),
             id: (a < 0 || z < 0) ? null : oc.slice(a + 9, z),
             mod: b.getAttribute('data-mod') || null, vis: vis(b) };
  });
  return { rail: lee('.rail .tab-btn'), esp: lee('.tabs-special .tab-btn'),
           nRail: document.querySelectorAll('.rail .tab-btn').length,
           nEsp: document.querySelectorAll('.tabs-special .tab-btn').length,
           paneles: ['tab-pericardio','tab-pulmonar','tab-otros','tab-peripulm']
             .map(id => ({ id: id, existe: !!document.getElementById(id) })) };
})()`;

/* ══ MODOS: que ve el BASICO y que ve el COMPLETO ══════════════════════════════════════ */
const MODOS = `(() => {
  const vis = (b) => { const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 };
  const censo = () => Array.prototype.slice.call(document.querySelectorAll('.rail .tab-btn'))
    .map(b => ({ t: (b.textContent||'').replace(/\\s+/g,' ').trim(), v: vis(b) }));
  const drawer = () => { if (typeof window.ecoDrawerBuild === 'function') window.ecoDrawerBuild();
    const d = document.getElementById('ecoDrawer');
    return d ? Array.prototype.slice.call(d.querySelectorAll('button'))
      .map(b => (b.textContent||'').replace(/\\s+/g,' ').trim()) : null };
  const r = {};
  ['basico','avanzado'].forEach(m => {
    try { localStorage.setItem('ett_view_mode', m) } catch (e) {}
    if (typeof applyViewMode === 'function') applyViewMode();
    r[m] = { rail: censo(), drawer: drawer() };
  });
  try { localStorage.setItem('ett_view_mode','avanzado') } catch (e) {}
  if (typeof applyViewMode === 'function') applyViewMode();
  return r;
})()`;

/* ══ (b) LAS DOS PANTALLAS PULMONARES, LADO A LADO ═════════════════════════════════════ */
const PULM = `(() => {
  const BAS = ['pul_derrame','pul_derrame_tam','pul_balik','pul_derrame_lado','pul_lineasb',
               'pul_lineasb_pat','pul_consolidacion','pul_consol_nota'];
  const AV = ['pua_desliz','pua_desliz_lado','pua_lineasa','pua_punto','pua_lineasb',
              'pua_lineasb_cant','pua_z_ant_d','pua_z_lat_d','pua_z_bas_d','pua_z_ant_i',
              'pua_z_lat_i','pua_z_bas_i','pua_derrame','pua_derrame_tipo','pua_balik',
              'pua_derrame_lado','pua_consol','pua_consol_bronco'];
  const lee = (ids) => ids.map(id => { const e = document.getElementById(id);
    if (!e) return { id: id, existe: false };
    const op = e.tagName === 'SELECT'
      ? Array.prototype.slice.call(e.options).map(o => o.value) : null;
    const lb = e.closest('.fg') ? e.closest('.fg').querySelector('label') : null;
    return { id: id, existe: true, tag: e.tagName, tipo: e.type || null, op: op,
             rot: lb ? (lb.textContent||'').replace(/\\s+/g,' ').trim() : null };
  });
  const txtTab = (id) => { const t = document.getElementById(id);
    return t ? (t.textContent||'').replace(/\\s+/g,' ').trim() : null };
  const tp = txtTab('tab-pulmonar') || '';
  const tpp = txtTab('tab-peripulm') || '';
  const T = tp + ' ' + tpp;
  return { bas: lee(BAS), av: lee(AV),
           nBas: BAS.filter(id => document.getElementById(id)).length,
           nAv: AV.filter(id => document.getElementById(id)).length,
           avanzadoEnPantalla: (T.match(/avanzad[ao]/gi) || []).length,
           integrar: Array.prototype.slice.call(
             document.querySelectorAll('#tab-pericardio [data-am-k]'))
             .map(b => b.getAttribute('data-am-k')) };
})()`;

/* ══ (c) LAS BARRAS DE HEMODINAMICA, PARA REUSAR SU FORMATO ════════════════════════════
   Se mide el COLOR RESUELTO y no la variable: lo que el medico ve es el computado. */
const BARRAS = `(() => {
  const cs = (e) => { const s = getComputedStyle(e);
    return { bg: s.backgroundColor, color: s.color, fs: s.fontSize, fw: s.fontWeight,
             tt: s.textTransform, ls: s.letterSpacing, pad: s.padding,
             bb: s.borderBottomWidth + ' ' + s.borderBottomColor } };
  const barra = (sel) => { const h = document.querySelector(sel);
    if (!h) return { sel: sel, existe: false };
    const fl = h.querySelector('span[id$="-arrow"]');
    return { sel: sel, existe: true, txt: (h.textContent||'').replace(/\\s+/g,' ').trim(),
             flecha: fl ? (fl.textContent||'').trim() : null, est: cs(h) } };
  return { vexus: barra('#tab-hemodinamica .card-head'),
           peri: barra('#tab-pericardio .card-head'),
           peripulm: Array.prototype.slice.call(
             document.querySelectorAll('#tab-pericardio > .card > .card-head')).map(h => {
             const fl = h.querySelector('span[id$="-arrow"]');
             return { txt: (h.textContent||'').replace(/\\s+/g,' ').trim(),
                      flecha: fl ? (fl.textContent||'').trim() : null, est: cs(h) } }),
           otros: Array.prototype.slice.call(
             document.querySelectorAll('#tab-otros .card-head')).map(h =>
             ({ txt: (h.textContent||'').replace(/\\s+/g,' ').trim(), est: cs(h) })),
           secIni: ['ete-seccion-pericardio-masas','ete-seccion-pulmonar','pua-seccion']
             .map(id => { const e = document.getElementById(id);
               return { id: id, existe: !!e, disp: e ? getComputedStyle(e).display : null } }) };
})()`;

/* ══ (d) LAS SUB-PESTANAS DE OTROS Y SU BARRA INTERNA ══════════════════════════════════ */
const OTROS = `(() => {
  const g = (e) => { const r = e.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height) };
  return { subbar: !!document.querySelector('#tab-otros .otr-subbar'),
           subbtns: Array.prototype.slice.call(document.querySelectorAll('#tab-otros .otr-subbar .tab-btn'))
             .map(b => ({ t: (b.textContent||'').replace(/\\s+/g,' ').trim(), g: g(b) })),
           paneles: Array.prototype.slice.call(document.querySelectorAll('#tab-otros .otr-sub'))
             .map(p => ({ id: p.id, act: p.classList.contains('active'),
                          disp: getComputedStyle(p).display })),
           barrasInternas: Array.prototype.slice.call(
             document.querySelectorAll('#tab-otros .card-head')).map(h =>
             ({ t: (h.textContent||'').replace(/\\s+/g,' ').trim(),
                oc: h.getAttribute('onclick') || '' })),
           campos: ['otr_burb','otr_asia','otr_rac','otr_burb_pasaje']
             .map(id => ({ id: id, existe: !!document.getElementById(id) })) };
})()`;

/* ══ (e) EL FORMATO DE LOS BOTONES DE CC CONTRA LOS DE LA FILA DE ARRIBA ═══════════════
   ⚠️ `.tab-btn` lleva `transition: all .15s`: el color se lee DESPUES de la transicion y
   en OTRA llamada que el clic. Esta funcion no clickea nada. */
const COLOR = `(() => {
  const cs = (e) => { const s = getComputedStyle(e);
    return { bg: s.backgroundColor, color: s.color,
             bc: s.borderTopColor, bw: s.borderTopWidth,
             fs: s.fontSize, pad: s.paddingTop + ' ' + s.paddingLeft, br: s.borderRadius } };
  const uno = (sel) => { const e = document.querySelector(sel);
    return e ? { sel: sel, existe: true, t: (e.textContent||'').replace(/\\s+/g,' ').trim(),
                 cls: e.className, est: cs(e) } : { sel: sel, existe: false } };
  return { arribaNormal: uno('.tabs-special .tab-btn:not(.active)'),
           arribaActivo: (() => { const b = document.querySelector('.tabs-special .tab-btn');
             return b ? { cls: b.className } : null })(),
           ccFrec: uno('#cc-subtab-frec'), ccCompl: uno('#cc-subtab-compl'),
           ccOn: (() => { const b = document.getElementById('cc-subtab-frec');
             return b ? { tiene_cc_on: b.classList.contains('cc-on'), cls: b.className } : null })() };
})()`;

/* ══ CONTROLES: informe, EN SUMA, Excel, Laboratorio ═══════════════════════════════════ */
const CTRL = `(() => {
  const r = {};
  try { if (typeof limpiarCampos === 'function') limpiarCampos() } catch (e) {}
  try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
  r.infVacio = (document.getElementById('informe_texto')||{}).value || '';
  r.sumaVacio = (document.getElementById('en_suma')||{}).value || '';
  try { const f = _labExcelRow ? _labExcelRow({ campos:{}, fecha:'2026-01-01', id:'x' }) : null;
        r.nCols = f ? Object.keys(f).length : null;
        r.claves = f ? Object.keys(f).join('|') : null } catch (e) { r.excelErr = String(e) }
  r.campos = (() => { const o = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
      if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
      o[e.id] = e.type === 'checkbox' ? (e.checked ? '1' : '') : (e.value || '') });
    return Object.keys(o).length })();
  return r;
})()`;

const GRUPOS = { rail: RAIL, modos: MODOS, pulm: PULM, barras: BARRAS, otros: OTROS,
                 color: COLOR, ctrl: CTRL };

async function correr(motor, nombre) {
  const br = await motor.launch(motor === chromium ? { channel: 'chrome' } : {});
  const pg = await br.newPage({ viewport: { width: 1200, height: 800 } });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(900);
  await pg.evaluate(PRELUDIO);
  const res = {};
  for (const g of SOLO) {
    if (!GRUPOS[g]) { res[g] = { error: 'GRUPO DESCONOCIDO' }; continue }
    if (g === 'color' || g === 'barras' || g === 'otros') {
      await pg.evaluate(`showTab('congenitas')`).catch(() => {});
      await pg.waitForTimeout(260);
    }
    try { res[g] = await pg.evaluate(GRUPOS[g]) } catch (e) { res[g] = { EXC: String(e).slice(0, 300) } }
  }
  await br.close();
  OUT[nombre] = res;
}

if (!MOTOR || MOTOR === 'chromium') await correr(chromium, 'chrome');
if (!MOTOR || MOTOR === 'webkit') { try { await correr(webkit, 'webkit') } catch (e) { OUT.webkit = { error: String(e).slice(0,200) } } }
console.log(JSON.stringify(OUT, null, 1));
