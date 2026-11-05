#!/usr/bin/env node
/**
 * _probe_p14b_estado.mjs - el recorrido (A) a (I) de PANT-14b, commit 1a.
 * Mide, con el GESTO REAL y SIN llamar a cmDesdeEstudio a mano -que es la trampa que la sonda de
 * PANT-14 pagaba: fabricaba el recalculo que la app no hace-, que el modulo derive su estado de
 * las pestanias en cada apertura y en cada cambio.
 *   node scripts/_probe_p14b_estado.mjs [--file <html>] [--solo <nombre>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const SOLO = arg('--solo');

/* Cada escenario es una lista de PASOS. Cada paso se mide: que dibuja, que dice la linea, el
   aviso, el modo, el estado del boton del PDF y si el boton y el panel se ven. */
const ESC = [
  { n:'A_ebstein_a_cia', pasos:[
      ['cargar', [['ebs_desplazamiento','16']]],
      ['tab','congenitas2'], ['abrir'], ['medir','ebstein cargado, modulo abierto'],
      ['cerrar'],
      ['nuevo'], ['medir','tras Nuevo estudio: panel y boton'],
      ['tab','congenitas'], ['cargar', [['ete_cia_tipo','secundum']]],
      ['abrir'], ['medir','CIA cargada, reabierto por el 3D de congenitas'] ] },
  { n:'B_dtga_cia_civ', pasos:[
      ['tab','congenitas'], ['cargar', [['ete_cia_tipo','secundum'],['ete_civ_tipo','perimembranosa']]],
      ['tab','congenitas2'], ['cargar', [['tga_tipo','dtga']]],
      ['abrir'], ['medir','d-TGA con CIA y CIV desde un estudio limpio'] ] },
  { n:'C_mustard_nuevo', pasos:[
      ['tab','congenitas2'], ['cargar', [['tga_tipo','mustard'],['tga_civ_residual','si'],['tga_obstr_subaortica','si']]],
      ['abrir'], ['medir','switch auricular con sus dos casillas'],
      ['nuevo'], ['tab','congenitas2'], ['abrir'], ['medir','tras Nuevo estudio, reabierto'] ] },
  { n:'D_fallot_ip', pasos:[
      ['tab','congenitas'], ['cargar', [['tdf_func_vd','normal'],['ip_grado','Severa']]],
      ['abrir'], ['medir','Fallot con IP severa desde un estudio limpio'] ] },
  { n:'D2_tga_luego_fallot', pasos:[
      ['tab','congenitas2'], ['cargar', [['tga_tipo','dtga']]], ['abrir'], ['medir','d-TGA'],
      ['nuevo'], ['tab','congenitas'], ['cargar', [['tdf_func_vd','normal'],['ip_grado','Severa']]],
      ['abrir'], ['medir','Fallot despues de una transposicion'] ] },
  { n:'E_coa_nativa', pasos:[
      ['tab','congenitas'], ['cargar', [['coa_istmo','8'],['coa_situacion','nativa']]],
      ['abrir'], ['medir','coartacion nativa'] ] },
  { n:'E2_coa_reparada', pasos:[
      ['tab','congenitas'], ['cargar', [['coa_istmo','9'],['coa_situacion','post_cirugia']]],
      ['abrir'], ['medir','coartacion reparada'] ] },
  { n:'F_vp_35', pasos:[
      ['tab','congenitas'], ['cargar', [['ep_vmax','3.5']]],
      ['abrir'], ['medir','velocidad pulmonar 3,5 sin nivel'] ] },
  { n:'F2_vp_35_nivel', pasos:[
      ['tab','congenitas'], ['cargar', [['ep_nivel','Valvular'],['ep_vmax','3.5']]],
      ['abrir'], ['medir','velocidad pulmonar 3,5 con nivel valvular'] ] },
  { n:'G_cambiar_pestania', pasos:[
      ['tab','congenitas2'], ['cargar', [['tga_tipo','dtga']]], ['abrir'], ['medir','abierto con d-TGA'],
      ['tab','valvulas'], ['medir','en Valvulas: boton y panel'],
      ['tab','congenitas2'], ['medir','de vuelta en congenitas'] ] },
  { n:'H_todas_tras_nuevo', pasos:[
      ['tab','congenitas'], ['cargar', [['tdf_func_vd','normal'],['coa_istmo','8'],['coa_situacion','nativa'],
        ['ete_cia_tipo','secundum'],['ete_civ_tipo','perimembranosa'],['dap_tipo','restrictivo'],
        ['ep_nivel','Valvular'],['esub_tipo','membrana']]],
      ['abrir'], ['medir','ocho lesiones cargadas'],
      ['nuevo'], ['tab','congenitas'], ['abrir'], ['medir','tras Nuevo estudio, reabierto'] ] },
  { n:'I_fuera_congenitas', pasos:[
      ['medir','en la pantalla Paciente al arrancar'],
      ['tab','valvulas'], ['medir','en Valvulas'],
      ['tab','congenitas'], ['medir','en congenitas'] ] },
];

const CUERPO = (esc) => `(async () => {
  const R = { esc: ${JSON.stringify(esc.n)}, pasos: [] };
  const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const PASOS = ${JSON.stringify(esc.pasos)};
  const vis = e => { if (!e) return 'NO EXISTE';
    const r = e.getBoundingClientRect();
    return (r.width > 0 && r.height > 0) ? Math.round(r.width) + 'x' + Math.round(r.height) : '0x0' };
  const firma = () => { try {
      const sc = (typeof cmEscena === 'function') ? cmEscena(_cm3d.S) : null;
      if (!sc) return 'SIN cmEscena';
      const ex = (sc.ex || []).map(o => o.t).sort();
      return 'nEx' + ex.length + ' [' + ex.join(',') + ']';
    } catch (e) { return 'ERR ' + String(e).slice(0, 80) } };
  const medir = (nota) => {
    const o = { nota: nota };
    try { o.base = _cm3d.S.base; o.bv = _cm3d.S.bv[_cm3d.S.base] || '-';
          o.mods = Object.keys(_cm3d.S.mods || {}).sort().join(',');
          o.ck = Object.keys(_cm3d.S.ck || {}).sort().join(',');
          o.modo = _cm3d.modo; } catch (e) { o.ERR = String(e).slice(0, 80) }
    o.firma = firma();
    const lin = EL('cc3d-faltan'); o.linea = lin ? String(lin.textContent || '').slice(0, 170) : 'NO EXISTE';
    const w = EL('cc3d-wrap'), b = EL('cc3d-abrir'), p = EL('cc3d-panel');
    o.wrapDisp = w ? getComputedStyle(w).display : 'NO EXISTE';
    o.botonCaja = vis(b);
    o.panelDisp = p ? getComputedStyle(p).display : 'NO EXISTE';
    const pb = EL('cm3d-pdfb'); o.pdfBtn = pb ? (pb.disabled ? 'apagado' : 'activo') : 'NO EXISTE';
    const pa = EL('cm3d-pdfn'); o.pdfAviso = pa ? String(pa.textContent || '').slice(0, 110) : 'NO EXISTE';
    const sv = EL('cm3d-sch'); o.esquemaNodos = sv ? sv.querySelectorAll('rect,path,circle,text').length : 0;
    return o };
  for (let i = 0; i < PASOS.length; i++) {
    const p = PASOS[i], k = p[0];
    try {
      if (k === 'cargar') {
        p[1].forEach(function (c) { const e = EL(c[0]); if (!e) { R.pasos.push({ nota: 'NO EXISTE ' + c[0] }); return }
          if (e.type === 'checkbox') { e.checked = (c[1] === 'si') } else { e.value = c[1] }
          e.dispatchEvent(new Event('input', { bubbles: true }));
          e.dispatchEvent(new Event('change', { bubbles: true })) });
        await esperar(450);
      } else if (k === 'tab') {
        const btn = Array.prototype.find.call(document.querySelectorAll('.tab-btn'),
          b => (b.getAttribute('onclick') || '').indexOf("showTab('" + p[1] + "')") !== -1);
        if (btn) { btn.click() } else if (typeof showTab === 'function') { showTab(p[1]) }
        if (p[1] === 'congenitas' || p[1] === 'congenitas2') {
          const sb = Array.prototype.find.call(document.querySelectorAll('button'),
            b => (b.getAttribute('onclick') || '').indexOf("ccSubTab('" + p[1] + "')") !== -1);
          if (sb) sb.click();
        }
        await esperar(350);
      } else if (k === 'abrir') {
        const b = EL('cc3d-abrir');
        if (b) { b.click() } else if (typeof cc3dAbrir === 'function') { cc3dAbrir() }
        await esperar(900);
      } else if (k === 'cerrar') {
        if (typeof cc3dCerrar === 'function') cc3dCerrar();
        await esperar(250);
      } else if (k === 'nuevo') {
        if (typeof nuevoEstudio === 'function') nuevoEstudio();
        await esperar(260);
        const cont = Array.prototype.find.call(document.querySelectorAll('#modal-nuevo-estudio button'),
          b => /sin guardar/i.test(b.textContent || ''));
        if (cont) { cont.click() } else if (typeof neContinuarSinGuardar === 'function') { neContinuarSinGuardar() }
        await esperar(620);
      } else if (k === 'medir') {
        R.pasos.push(medir(p[1]));
      }
    } catch (e) { R.pasos.push({ nota: 'EXC en ' + k + ': ' + String(e).slice(0, 110) }) }
  }
  return R;
})()`;

const br = await _pw.chromium.launch({ channel: 'chrome' });
const salida = {};
for (const esc of ESC) {
  if (SOLO && esc.n !== SOLO) continue;
  const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 130)));
  try {
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
    await pg.waitForTimeout(1700);
    const r = await pg.evaluate(CUERPO(esc));
    r.errs = errs.filter(e => !/ERR_FILE_NOT_FOUND|favicon/.test(e));
    salida[esc.n] = r;
  } catch (e) { salida[esc.n] = { fatal: String(e).slice(0, 220), errs } }
  await pg.close();
}
await br.close();
console.log(JSON.stringify(salida, null, 1));
