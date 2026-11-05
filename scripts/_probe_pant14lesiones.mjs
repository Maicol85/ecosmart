#!/usr/bin/env node
/**
 * _probe_pant14lesiones.mjs - cada lesion conectada a «Segun el estudio» (PANT-14, c4 a c7).
 * Por cada lesion: carga el dato en SU pestania con el GESTO REAL -evento de entrada y de
 * cambio- y con una SIEMBRA MUDA -asignando el valor sin despachar nada, que es el camino de
 * restaurar un estudio-, y compara la escena que el modulo arma contra la que arma «Explorar»
 * con la misma base, variante y casillas: lista de objetos, rotulos y COLORES.
 * Verifica tambien el borrado, la linea de lo no dibujado y que no se escriba ningun campo.
 *   node scripts/_probe_pant14lesiones.mjs [--file <html>] [--solo <nombre>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const SOLO = arg('--solo');

/* CADA CASO: los campos que el medico carga, y la escena de «Explorar» con la que se compara. */
const CASOS = [
  { n:'fallot',    campos:[['tdf_func_vd','normal']],
    esperado:{ base:'fal', bv:'op', ck:{}, mods:{} } },
  { n:'fallotIP',  campos:[['tdf_func_vd','normal'],['ip_grado','Moderada']],
    esperado:{ base:'fal', bv:'op', ck:{ip:true}, mods:{} } },
  { n:'fallotTodo',campos:[['tdf_func_vd','leve'],['ip_grado','Severa'],['tdf_civ_residual','si'],['tdf_ep_stent','si']],
    esperado:{ base:'fal', bv:'op', ck:{ip:true,rciv:true,rest:true}, mods:{} } },
  { n:'coaNat',    campos:[['coa_istmo','8'],['coa_situacion','nativa']],
    esperado:{ base:'norm', bv:null, ck:{}, mods:{coa:'nat'} } },
  { n:'coaRep',    campos:[['coa_istmo','9'],['coa_situacion','post_cirugia']],
    esperado:{ base:'norm', bv:null, ck:{}, mods:{coa:'rep'} } },
  { n:'coaRec',    campos:[['coa_istmo','9'],['coa_situacion','recoartacion']],
    esperado:{ base:'norm', bv:null, ck:{rec:true}, mods:{coa:'rep'} } },
  /* CONTROL NEGATIVO: cargada sin la situacion -no se dibuja y la linea lo dice- */
  { n:'coaSinSit', campos:[['coa_istmo','8']],
    esperado:{ base:'norm', bv:null, ck:{}, mods:{}, omit:['coa'] } },
  /* CONTROL NEGATIVO: el estudio vacio dibuja el corazon normal y no lista nada */
  { n:'vacio',     campos:[], esperado:{ base:'norm', bv:null, ck:{}, mods:{} } },
];

const CUERPO = (caso, muda) => `(async () => {
  const R = { caso: ${JSON.stringify(caso.n)}, muda: ${muda} };
  const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const CASO = ${JSON.stringify(caso)};
  /* la foto de TODOS los campos del estudio, para probar que el modulo no escribe ninguno */
  const foto = () => { const o = {};
    document.querySelectorAll('input[id],select[id],textarea[id]').forEach(function (e) {
      o[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || '') });
    return o };
  /* la huella de la escena que el motor dibuja: objetos, rotulos y colores */
  const firma = () => {
    try {
      const sc = (typeof cmEscena === 'function') ? cmEscena() : null;
      if (!sc) return { ERR: 'SIN cmEscena' };
      const ex = (sc.ex || []).map(o => o.t + ':' + JSON.stringify(o.p || o.c) + ':r' + (o.r == null ? '-' : o.r) + ':c' + (o.col == null ? (o.c == null ? '-' : o.c) : o.col)).sort();
      const fl = (sc.fl || []).map(o => 'fl:' + JSON.stringify(o.p && o.p[0]) + ':c' + o.c).sort();
      const ar = (sc.ar || []).map(o => 'ar:' + JSON.stringify(o.p && o.p[0]) + ':c' + o.c).sort();
      const lb = (sc.lb || []).map(l => l[0]).sort();
      return { nEx:(sc.ex||[]).length, nFl:(sc.fl||[]).length, nAr:(sc.ar||[]).length, nLb:(sc.lb||[]).length,
               ex:ex.join(' | '), fl:fl.join(' | '), ar:ar.join(' | '), lb:lb.join(' | ') };
    } catch (e) { return { ERR: String(e).slice(0, 110) } }
  };
  const estado = () => ({ base:_cm3d.S.base, bv:JSON.stringify(_cm3d.S.bv), mods:JSON.stringify(_cm3d.S.mods),
                          ck:JSON.stringify(_cm3d.S.ck), omit:JSON.stringify(_cm3d.omitidas||[]),
                          chocan:JSON.stringify(_cm3d.chocan||[]) });
  /* ── 1. la foto del formulario vacio ── */
  const antes = foto();
  /* ── 2. cargar los campos, con el gesto real o con una siembra muda ── */
  R.puestos = {};
  CASO.campos.forEach(function (c) {
    const e = EL(c[0]);
    if (!e) { R.puestos[c[0]] = 'NO EXISTE'; return }
    if (e.tagName === 'SELECT') {
      const ok = Array.prototype.some.call(e.options, o => o.value === c[1]);
      if (!ok) { R.puestos[c[0]] = 'SIN OPCION ' + c[1] + ' [' + Array.prototype.map.call(e.options, o => o.value).join(',') + ']'; return }
    }
    if (e.type === 'checkbox') { e.checked = (c[1] === 'si') } else { e.value = c[1] }
    if (!${muda}) { e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) }
    R.puestos[c[0]] = 'ok=' + (e.type === 'checkbox' ? e.checked : e.value);
  });
  /* por el camino MUDO lo que repuebla es el embudo de restauracion */
  if (${muda}) { try { if (typeof RECALC_MODULOS === 'function') { (RECALC_MODULOS() || []).forEach(function (f) { try { f() } catch (x) {} }) } } catch (e) {} }
  await esperar(420);
  cmDesdeEstudio();
  R.estudio = estado();
  R.firmaEstudio = firma();
  /* ── 3. la MISMA escena armada a mano, que es lo que «Explorar» hace ── */
  const E = CASO.esperado;
  _cm3d.S.base = E.base; _cm3d.S.mods = Object.assign({}, E.mods); _cm3d.S.ck = Object.assign({}, E.ck);
  if (E.bv) _cm3d.S.bv[E.base] = E.bv;
  R.explorar = estado();
  R.firmaExplorar = firma();
  /* ── 4. comparacion ── */
  const a = R.firmaEstudio, b = R.firmaExplorar;
  R.iguales = JSON.stringify(a) === JSON.stringify(b);
  R.difEn = R.iguales ? '' : ['nEx','nFl','nAr','nLb','ex','fl','ar','lb'].filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k])).join(',');
  R.estadoIgual = (R.estudio.base === R.explorar.base) && (R.estudio.mods === R.explorar.mods) && (R.estudio.ck === R.explorar.ck);
  /* ── 5. el modulo NO escribe ningun campo ── */
  cmDesdeEstudio();
  const despues = foto();
  const movidos = Object.keys(antes).filter(k => antes[k] !== despues[k] && !CASO.campos.some(c => c[0] === k));
  R.camposMovidos = movidos.slice(0, 10); R.nMovidos = movidos.length;
  /* ── 6. el BORRADO: se vacia lo cargado y el dibujo vuelve al corazon normal ── */
  CASO.campos.forEach(function (c) { const e = EL(c[0]); if (!e) return;
    if (e.type === 'checkbox') { e.checked = false } else { e.value = '' }
    e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) });
  await esperar(420);
  cmDesdeEstudio();
  R.trasBorrar = estado();
  return R;
})()`;

const br = await _pw.chromium.launch({ channel: 'chrome' });
const salida = {};
for (const caso of CASOS) {
  if (SOLO && caso.n !== SOLO) continue;
  for (const muda of [false, true]) {
    const clave = caso.n + (muda ? '/muda' : '/gesto');
    const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
    const errs = [];
    pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 130)));
    try {
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
      await pg.waitForTimeout(1600);
      const r = await pg.evaluate(CUERPO(caso, muda));
      r.errs = errs.filter(e => !/ERR_FILE_NOT_FOUND|favicon/.test(e));
      salida[clave] = r;
    } catch (e) { salida[clave] = { fatal: String(e).slice(0, 200), errs } }
    await pg.close();
  }
}
await br.close();
console.log(JSON.stringify(salida, null, 1));
