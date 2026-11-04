#!/usr/bin/env node
/**
 * _probe_pant12est.mjs — el modo «Segun el estudio» (PANT-12, commit 6).
 * Mide, modulo por modulo y con el GESTO REAL sobre la pestania: que el dibujo tome la variante
 * que le toca, que la escena coincida con la del modo «Explorar» equivalente, que lo que no
 * tiene dibujo se DECLARE en la linea de abajo, que las incompatibilidades se digan, que el
 * estudio vacio dibuje el corazon normal SIN lista de ausentes, y que nada escriba un campo.
 *   node scripts/_probe_pant12est.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const br = await _pw.chromium.launch({ channel: 'chrome' });
const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 140)));
pg.on('console', c => { if (c.type() === 'error') errs.push('CONS ' + c.text().slice(0, 140)) });
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
await pg.waitForTimeout(1500);
const r = await pg.evaluate(`(async () => {
  const R = {}; const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  const FN = n => (typeof window[n] === 'function') ? window[n] : null;
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const S = (id, v) => { const e = EL(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  const CHK = (id, on) => { const e = EL(id); if (!e) return 'NO ' + id;
    e.checked = !!on; e.dispatchEvent(new Event('change', { bubbles: true })); return 'ok' };
  try { limpiarCampos(true) } catch (e) {}
  await esperar(320);
  const censo = () => { const o = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
      if (FN('_noEsDelEstudio') && window._noEsDelEstudio(e.id)) return;
      o[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || '');
    }); return o };
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  /* ADVERTENCIA: limpiarCampos CIERRA el panel del corazon maestro -lo hace desde PANT-3, con
     cc3dCerrar-, y con el panel cerrado _cm3dVisible es falso y el repintado sale temprano,
     que es lo correcto. Sin reabrirlo, TODAS las escenas se miden sobre un modulo cerrado y
     dan el estado de la escena anterior: un denominador vacio que se lee como «el lector no
     funciona». Este helper vacia y vuelve a abrir. */
  const limpiarYAbrir = async () => {
    try { limpiarCampos(true) } catch (e) {}
    await esperar(260);
    const b2 = EL('cc3d-abrir');
    if (b2 && b2.getAttribute('aria-pressed') !== 'true') b2.click();
    await esperar(320);
  };
  const Q = String.fromCharCode(39);
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
  await esperar(380);
  const bot = EL('cc3d-abrir'); if (bot) bot.click();
  await esperar(2900);
  const st = FN('_cm3dEstado') ? window._cm3dEstado() : null;
  R.hayEstado = st ? 'si' : 'NO';
  R.three = (typeof window.THREE === 'undefined') ? 'no' : (window.THREE.REVISION || 'si');
  const linea = () => String((EL('cc3d-faltan') || {}).textContent || '');
  /* firma de la escena: lo que el dibujo pinta, sin los textos */
  const firma = () => { const f = FN('cmEscena'); if (!f || !st) return 'SIN FN';
    try { const s = f(st.S);
      return JSON.stringify({ ar:(s.ar||[]).length, fl:(s.fl||[]).length, ex:(s.ex||[]).length,
        lb:(s.lb||[]).map(x => x[0]), rv:s.rvShell, lv:s.lvShell, ra:s.raShell, hr:!!s.hideRPV,
        col:(s.fl||[]).map(x => x.c) }) } catch (e) { return 'EXC ' + String(e).slice(0,70) } };
  const mods = () => st ? JSON.stringify(st.S.mods) : 'NO';
  const dir = () => st ? JSON.stringify(st.S.dir || {}) : 'NO';

  /* ── (A) EL ESTUDIO VACIO: corazon normal y NINGUNA lista de ausentes ──────────────────── */
  R.vacio = { mods: mods(), linea: linea(), base: st ? st.S.base : 'NO' };

  /* ── (B) UNA ESCENA POR MODULO, con el GESTO REAL sobre su pestania ────────────────────── */
  const CASOS = [
    { n:'cia secundum',  set:() => { S('ete_cia_tipo','secundum'); S('ete_cia_tam_max','12') },
      exp:{ cia:'sec' } },
    { n:'cia primum',    set:() => { S('ete_cia_tipo','primum') },   exp:{ cia:'pri' } },
    { n:'cia seno ven',  set:() => { S('ete_cia_tipo','sv_vcs') },   exp:{ cia:'sv' } },
    { n:'cia sv_vci',    set:() => { S('ete_cia_tipo','sv_vci') },   exp:{ cia:'sec' }, nota:'sin variante: cae en el valor por omision' },
    { n:'cia dir di',    set:() => { S('ete_cia_tipo','secundum'); S('ete_cia_dir','di') }, exp:{ cia:'sec' }, dirEsp:{ cia:true } },
    { n:'cia dir id',    set:() => { S('ete_cia_tipo','secundum'); S('ete_cia_dir','id') }, exp:{ cia:'sec' }, dirEsp:{ cia:false } },
    { n:'civ perimemb',  set:() => { S('ete_civ_tipo','perimembranosa') }, exp:{ civ:'pm' } },
    { n:'civ muscular',  set:() => { S('ete_civ_tipo','muscular') },      exp:{ civ:'mus' } },
    { n:'civ infundib',  set:() => { S('ete_civ_tipo','infundibular') },  exp:{ civ:'sal' } },
    { n:'civ inlet',     set:() => { S('ete_civ_tipo','inlet') },         exp:{ civ:'ent' } },
    { n:'ductus',        set:() => { S('dap_tipo','restrictivo'); S('dap_diam','4') }, exp:{ dap:'std' } },
    { n:'ductus dir di', set:() => { S('dap_tipo','restrictivo'); S('dap_dir','di') }, exp:{ dap:'std' }, dirEsp:{ dap:true } },
    { n:'vap proximal',  set:() => { S('vap_tipo','i') },  exp:{ vap:'prox' } },
    { n:'vap distal',    set:() => { S('vap_tipo','ii') }, exp:{ vap:'dis' } },
    { n:'vap total',     set:() => { S('vap_tipo','iii') }, exp:{}, omite:'vap', nota:'la forma total no tiene variante' },
    { n:'cvpa a la VCS', set:() => { S('cvpa_conexion','vcs'); S('cvpa_lado','der') }, exp:{ cvpa:'cs' } },
    { n:'cvpa a la VCI', set:() => { S('cvpa_conexion','vci') }, exp:{}, omite:'cvpa', nota:'ese drenaje no tiene variante' },
    { n:'cava izq',      set:() => { CHK('otr_var_vcsip', true) }, exp:{ vcs:'std' } },
    { n:'eisen con CIV', set:() => { S('eis_lesion_base','civ') }, exp:{ civ:'pm', eis:'std' } },
    { n:'eisen con CIA', set:() => { S('eis_lesion_base','cia') }, exp:{ cia:'sec', eis:'std' } },
    { n:'eisen tronco',  set:() => { S('eis_lesion_base','tronco') }, exp:{}, omite:'eisen', nota:'esa lesion de base no se dibuja' },
    { n:'fop',           set:() => { S('fop_shunt_reposo','si') }, exp:{ cia:'sec' }, nota:'el foramen cuenta como comunicacion interauricular' }
  ];
  R.casos = [];
  for (const c of CASOS) {
    await limpiarYAbrir();
    c.set();
    await esperar(520);
    try { if (FN('cm3dEstudioSync')) window.cm3dEstudioSync() } catch (e) {}
    await esperar(160);
    const m = st ? st.S.mods : {};
    const ok = JSON.stringify(Object.keys(m).sort().reduce((a,k)=>{a[k]=m[k];return a},{}))
             === JSON.stringify(Object.keys(c.exp).sort().reduce((a,k)=>{a[k]=c.exp[k];return a},{}));
    const o = { n: c.n, mods: mods(), esperado: JSON.stringify(c.exp), ok: ok ? 'si' : 'NO' };
    if (c.dirEsp) { o.dir = dir(); o.dirOk = (dir() === JSON.stringify(c.dirEsp)) ? 'si' : 'NO' }
    if (c.omite) { const l = linea(); o.declara = (l.indexOf('no distingue') >= 0 || l.indexOf('Cargadas y no dibujadas') >= 0) ? 'si' : 'NO: ' + l.slice(0,90) }
    o.firmaEstudio = firma();
    R.casos.push(o);
  }

  /* ── (C) LA MISMA ESCENA EN «EXPLORAR»: la firma tiene que coincidir ───────────────────── */
  R.cruce = [];
  const bExp = Array.prototype.filter.call(document.querySelectorAll('.cm3d-md'), b => b.getAttribute('data-m') === 'explorar')[0];
  const bEst = Array.prototype.filter.call(document.querySelectorAll('.cm3d-md'), b => b.getAttribute('data-m') === 'estudio')[0];
  for (const par of [['cia secundum', { cia:'sec' }], ['civ inlet', { civ:'ent' }],
                     ['ductus', { dap:'std' }], ['vap proximal', { vap:'prox' }],
                     ['cvpa a la VCS', { cvpa:'cs' }], ['cava izq', { vcs:'std' }]]) {
    if (bExp) bExp.click(); await esperar(260);
    st.S.base = 'norm'; st.S.mods = Object.assign({}, par[1]); st.S.ck = {}; st.S.dir = {};
    try { window.cm3dSync() } catch (e) {}
    await esperar(200);
    const fx = firma();
    const caso = R.casos.filter(x => x.n === par[0])[0];
    R.cruce.push({ escena: par[0], igual: (caso && caso.firmaEstudio === fx) ? 'si' : 'NO',
                   explorar: fx.slice(0, 110) });
  }
  if (bEst) bEst.click(); await esperar(400);

  /* ── (D) INCOMPATIBLES: se dibuja lo que se pueda y la linea lo dice ───────────────────── */
  await limpiarYAbrir();
  S('eis_lesion_base','civ'); S('ep_nivel','Valvular'); S('ete_civ_tipo','perimembranosa');
  await esperar(520);
  try { if (FN('cm3dEstudioSync')) window.cm3dEstudioSync() } catch (e) {}
  await esperar(180);
  R.incompat = { mods: mods(), linea: linea().slice(0, 220) };

  /* ── (E) LA TRANSPOSICION TIENE SU PROPIA FRASE ────────────────────────────────────────── */
  await limpiarYAbrir();
  S('tga_tipo','dtga');
  await esperar(520);
  try { if (FN('cm3dEstudioSync')) window.cm3dEstudioSync() } catch (e) {}
  await esperar(180);
  R.tga = linea().slice(0, 200);

  /* ── (F) NADA ESCRIBE UN CAMPO ─────────────────────────────────────────────────────────── */
  await limpiarYAbrir();
  const c0 = JSON.stringify(censo());
  S('ete_cia_tipo','secundum'); S('ete_civ_tipo','inlet'); CHK('otr_var_vcsip', true);
  await esperar(520);
  const cTrasCargar = censo();
  try { if (FN('cm3dEstudioSync')) window.cm3dEstudioSync(); if (FN('cm3dSync')) window.cm3dSync() } catch (e) {}
  await esperar(300);
  const cTrasDibujar = censo();
  const mov = Object.keys(cTrasDibujar).filter(k => String(cTrasDibujar[k]) !== String(cTrasCargar[k]));
  R.dibujarNoEscribe = mov.length === 0 ? 'si' : 'NO: ' + mov.slice(0,6).join(',');

  /* ── (G) «NUEVO ESTUDIO» devuelve el corazon normal ────────────────────────────────────── */
  await limpiarYAbrir();
  try { if (FN('cm3dEstudioSync')) window.cm3dEstudioSync() } catch (e) {}
  await esperar(200);
  R.trasNuevo = { mods: mods(), base: st ? st.S.base : 'NO', linea: linea().slice(0, 90) };
  return R;
})()`).catch(e => ({ ERR: String(e).slice(0, 240) }));
await pg.close(); await br.close();
console.log(JSON.stringify({ archivo: FILE, r, errores: errs.slice(0, 8) }, null, 1));
