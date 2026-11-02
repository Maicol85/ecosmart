#!/usr/bin/env node
/**
 * _probe_valppt_grad.mjs - commit 2 de VAL-PPT: COMO SE GRADUA cada tipo nuevo, y los tres
 * globos de Valvulas (2026-11-01).
 *
 * Mide tres cosas, cada una con su denominador:
 *   A) LA GRADUACION. Con la misma medicion -un gradiente medio y un area-, el grado que la
 *      app publica con una morfologia NATIVA y con PLASTIA / TEER tiene que ser EL MISMO, y
 *      con una PROTESIS tiene que apagarse. Si los tres dieran lo mismo, la sonda no
 *      distinguiria nada: la protesis es el control negativo.
 *   B) LOS CAMPOS QUE NO SE ESCONDEN. El pedido dice que el TEER entra al ramal nativo SIN
 *      esconder ni cambiar ningun campo de graduacion: PISA y EROA siguen visibles.
 *   C) LOS TRES GLOBOS. Que existan, midan 44x44 con los cinco puntos dando el propio boton,
 *      publiquen sus folios y NO lleven clase, nivel ni conducta.
 *
 *   node scripts/_probe_valppt_grad.mjs [--file /ruta/index.html] [--out /ruta/out.json]
 */
import fs from 'fs';
const A = process.argv.slice(2);
const g = (f, d) => { const i = A.indexOf(f); return (i >= 0 && A[i + 1]) ? A[i + 1] : d };
const FILE = g('--file', process.cwd() + '/index.html');
const OUTF = g('--out', '/tmp/valppt_grad.json');
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let chromium = null;
for (const c of CAND) { try { chromium = (await import(c)).default.chromium; break } catch (e) {} }
if (!chromium) { console.error('SIN PLAYWRIGHT'); process.exit(2) }

/* A - la graduacion, con los mismos numeros y cuatro morfologias. */
const GRAD = `((c) => {
  const out = {};
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  Object.keys(c.campos).forEach(k => S(k, c.campos[k]));
  (c.pastillas || []).forEach(p => { const b = document.getElementById('pill-' + p[1] + '-' + p[0]);
    if (b && !b.classList.contains('btn-primary')) b.click() });
  out.morf_puesta = S(c.morfId, c.morf);
  Object.keys(window).forEach(k => { if (/^calc[A-Z]/.test(k) && typeof window[k] === 'function') {
    try { window[k]() } catch (e) {} } });
  try { if (typeof _recalcModulos === 'function') _recalcModulos('grad') } catch (e) {}
  const T = (id) => { const e = document.getElementById(id); return e ? String(e.value || e.textContent || '').trim() : 'NO EXISTE' };
  out.grados = { em: T('em_grado'), im: T('im_grado'), et: T('et_grado'), it: T('it_grado') };
  out.capsulas = { em: T('em-sev-integrada'), im: T('im-sev'), et: T('et-sev'), it: T('it-sev') };
  out.predicados = {
    esProt: (typeof valvEsProtesis === 'function') ? valvEsProtesis(c.morf) : 'n/d',
    noGradua: (typeof protNoGradua === 'function') ? protNoGradua(c.morfId) : 'n/d'
  };
  /* B - los campos de graduacion que NO se esconden. */
  const vis = (id) => { const e = document.getElementById(id);
    if (!e) return 'NO EXISTE';
    const r = e.getBoundingClientRect();
    const cs = getComputedStyle(e);
    return (cs.display === 'none' || cs.visibility === 'hidden') ? 'oculto'
         : (e.disabled ? 'deshabilitado' : (r.width > 0 ? 'visible' : 'sin caja')) };
  /* ⚠️ LOS IDS SON LOS REALES, CENSADOS EN EL ARCHIVO: la primera version pidio im_pisa_r
     y im_eroa, que no existen, y la sonda informaba «NO EXISTE» sobre campos que si estan.
     Y el acordeon de cada valvula se abre ANTES de medir: dentro de una seccion cerrada todos
     informan 0 de ancho y «sin caja» no distingue un campo escondido de uno tapado. */
  const Q2 = String.fromCharCode(39);
  const bq2 = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
                   x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const bt2 = bq2('showTab(' + Q2 + 'valvulas'); if (bt2) bt2.click();
  ['valv-mitral','valv-tricuspide'].forEach(k => {
    const sec = document.getElementById('ete-seccion-' + k);
    if (sec && sec.style.display === 'none') { const h = bq2('toggleEteSeccion(' + Q2 + k); if (h) h.click() }
  });
  out.campos = {};
  ['im_pisa','im_eroa_cont','im_fr_cont','im_vc','im_jet_area','em_gmedio','avm_plan','avm_thp',
   'it_pisa_r','it_pisa_val','it_vc','et_gmedio'].forEach(id => { out.campos[id] = vis(id) });
  return out;
})(CFG)`;

/* C - los tres globos. */
const GLOBOS = `(() => {
  const out = {};
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
                  x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const bt = bq('showTab(' + Q + 'valvulas'); if (bt) bt.click();
  /* ⚠️ ABRIR LA PESTAÑA NO LE DA CAJA A LA TARJETA: cada valvula vive en su propio acordeon
     -ete-seccion-valv-mitral y sus tres hermanos nacen en display:none- y un boton dentro de un
     contenedor oculto informa 0x0 y cero puntos propios. Es la trampa que la tanda AO2 documenta
     y que esta sonda pago en su primera corrida: los tres globos daban 0x0 sobre botones que se
     dibujan perfectamente. */
  ['valv-mitral','valv-aortica','valv-tricuspide'].forEach(k => {
    const sec = document.getElementById('ete-seccion-' + k);
    if (sec && sec.style.display === 'none') {
      const h = bq('toggleEteSeccion(' + Q + k); if (h) h.click();
    }
  });
  out.acordeones = ['valv-mitral','valv-aortica','valv-tricuspide'].map(k => {
    const sec = document.getElementById('ete-seccion-' + k);
    return k + '=' + (sec ? (sec.style.display || 'abierto') : 'NO EXISTE') }).join(' ');
  out.registroN = (typeof VINFO === 'object' && VINFO) ? Object.keys(VINFO).length : 'VINFO no visible';
  /* Las tres claves, leidas del registro: es el dueño unico del texto. */
  ['vm-morf-tipos','vt-morf-tipos','va-morf-tipos'].forEach(k => {
    const e = (typeof VINFO === 'object' && VINFO && VINFO[k]) ? VINFO[k] : null;
    const txt = e ? String(e.lee || '') : '';
    out[k] = {
      existe: !!e, tit: e ? e.tit : '', n: txt.length,
      folios: (txt.match(/[Ff]olios?\\s[0-9, yx]+/g) || []),
      /* Lo que un globo de esta app NO puede llevar: clase, nivel ni conducta. */
      clase: /Clase\\s+(I|II|III)/.test(txt),
      nivel: /Nivel\\s+[ABC]/.test(txt),
      conducta: /(?<!no )se recomienda|(?<!no está )indicad|considerar|debe |hay que |seguimiento anual/i.test(txt),
      txt: txt.slice(0, 2600)
    };
  });
  /* Los botones: 44x44 y los cinco puntos. */
  out.botones = {};
  ['vm-morf-tipos','vt-morf-tipos','va-morf-tipos'].forEach(k => {
    const b = document.querySelector('[data-vinfo="' + k + '"]');
    if (!b) { out.botones[k] = 'NO EXISTE'; return }
    b.scrollIntoView({ block: 'center' });
    const r = b.getBoundingClientRect();
    const pts = [[r.left+2,r.top+2],[r.right-2,r.top+2],[r.left+2,r.bottom-2],
                 [r.right-2,r.bottom-2],[r.left+r.width/2,r.top+r.height/2]];
    const propios = pts.filter(p => { const el = document.elementFromPoint(p[0], p[1]);
      return !!(el && (el === b || b.contains(el))) }).length;
    out.botones[k] = { w: Math.round(r.width), h: Math.round(r.height), puntos: propios + '/5',
                       glifo: (b.textContent || '').trim() };
  });
  return out;
})()`;

/* ⚠️ EL GRADIENTE TRICUSPIDEO TIENE QUE GRADUAR, o el control negativo de la protesis es
   vacuo: en la primera corrida la escena no cargaba estenosis tricuspidea, `et_grado` daba
   «sin» en las cuatro morfologias y «la protesis cambia algo» salia FALSO sin que eso probara
   nada. Un control que no puede fallar no esta probando nada. */
const BASE = { pac_nombre: 'Prueba Grad', pac_ci: '999', peso: '75', talla: '172', edad: '70',
               sexo: 'M', em_gmedio: '7', avm_plan: '1.5', im_vc: '0.6',
               et_gmedio: '8', et_avt: '0.9', it_vc: '0.8' };
const PILL = [['mitral','esten'],['mitral','insuf'],['tricuspide','esten'],['tricusp','insuf']];
const CASOS = [
  { k: 'mi_nativa',  morfId: 'vm_morf', morf: 'Mixomatosa / Barlow' },
  { k: 'mi_plastia', morfId: 'vm_morf', morf: 'Plastia mitral' },
  { k: 'mi_teer',    morfId: 'vm_morf', morf: 'TEER mitral' },
  { k: 'mi_protesis', morfId: 'vm_morf', morf: 'Prótesis mecánica' },
  { k: 'tr_nativa',  morfId: 'vt_morf', morf: 'Mixomatosa' },
  { k: 'tr_plastia', morfId: 'vt_morf', morf: 'Plastia tricuspídea' },
  { k: 'tr_teer',    morfId: 'vt_morf', morf: 'TEER tricuspídeo (T-TEER)' },
  { k: 'tr_protesis', morfId: 'vt_morf', morf: 'Prótesis mecánica' }
];

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE };
try {
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([e.message.slice(0, 170)]) });
  pg.on('console', m => { if (m.type() === 'error')
    OUT._conErr = (OUT._conErr || []).concat([m.text().slice(0, 170)]) });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
  await pg.waitForTimeout(1500);
  for (const c of CASOS) {
    const cfg = JSON.stringify({ campos: BASE, pastillas: PILL, morfId: c.morfId, morf: c.morf });
    OUT[c.k] = await pg.evaluate(GRAD.replace('CFG', cfg));
    await pg.waitForTimeout(350);
    console.log('  ' + c.k.padEnd(12) + ' grados=' + JSON.stringify(OUT[c.k].grados)
      + ' esProt=' + OUT[c.k].predicados.esProt + ' noGradua=' + OUT[c.k].predicados.noGradua);
  }
  OUT._globos = await pg.evaluate(GLOBOS);
  await pg.close();
} catch (e) { OUT._err = String(e).slice(0, 250) }
try { await b.close() } catch (e) {}
/* El veredicto: nativa == plastia == TEER, y protesis distinta. */
/* ⚠️ EL VEREDICTO VA POR LA CAPSULA Y NO POR EL CAMPO, y es una leccion medida: con una
   protesis la app se ABSTIENE pero NO BORRA et_grado -la regla de la casa es marcar sin
   borrar, para que volver a nativa recupere el dato-, asi que el campo conserva el grado que
   escribio la pasada anterior y «la protesis cambia algo» salia FALSO. La capsula si dice
   «No graduada: los cortes de valvula nativa no aplican a protesis». */
const cmp = (a, b2) => JSON.stringify(OUT[a] && OUT[a].capsulas) === JSON.stringify(OUT[b2] && OUT[b2].capsulas);
OUT._veredicto = {
  mi_plastia_igual_nativa: cmp('mi_nativa', 'mi_plastia'),
  mi_teer_igual_nativa: cmp('mi_nativa', 'mi_teer'),
  mi_protesis_DISTINTA: !cmp('mi_nativa', 'mi_protesis'),
  tr_plastia_igual_nativa: cmp('tr_nativa', 'tr_plastia'),
  tr_teer_igual_nativa: cmp('tr_nativa', 'tr_teer'),
  tr_protesis_DISTINTA: !cmp('tr_nativa', 'tr_protesis')
};
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('\nVEREDICTO ' + JSON.stringify(OUT._veredicto));
console.log('globos: ' + JSON.stringify(OUT._globos && OUT._globos.botones));
console.log('errores de pagina: ' + ((OUT._pageErr || []).join(' | ') || 'ninguno'));
console.log('escrito: ' + OUTF);
