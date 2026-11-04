#!/usr/bin/env node
/**
 * _probe_pant12demo.mjs — la geometria del corazon maestro contra la demo aprobada
 * (PANT-12, commit 4c).
 * NO compara pixeles: corre el scenario() de la demo y el cmEscena() de la app con el MISMO
 * estado y compara el ESCENARIO campo por campo —arterias, corrientes, extras, rotulos y
 * tamanios— con una tolerancia declarada.
 * El scenario() de la demo vive dentro de una IIFE y no exporta nada: se EXTRAE su texto por
 * marcas literales, exigiendo que cada una aparezca UNA sola vez, asi que si la demo cambia la
 * extraccion falla ruidosamente en vez de comparar otra cosa.
 *   node scripts/_probe_pant12demo.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
import fs from 'fs';
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const FILE = arg('--file') || (RAIZ + '/index.html');
const DEMO = RAIZ + '/docs/3d/demo_corazon_maestro_v6_aprobado.html';
const TOL = 0.0005;   /* los dos lados usan los MISMOS literales: la tolerancia cubre el redondeo */

/* ── la demo: se extrae por marcas literales, cada una exigida UNA vez ───────────────────── */
const hd = fs.readFileSync(DEMO, 'utf8');
const una = (s, q) => { const n = s.split(q).length - 1;
  if (n !== 1) { console.log(JSON.stringify({ error: 'la marca no aparece una sola vez', marca: q, veces: n })); process.exit(2) }
  return s.indexOf(q) };
const d0 = una(hd, 'var C={blue:0x2f6fd0');
const d1 = una(hd, 'function boot(){');
const demoSrc = hd.slice(d0, d1);

/* ── la app: el bloque del corazon maestro, por sus propias marcas ───────────────────────── */
const ha = fs.readFileSync(FILE, 'utf8');
const a0 = una(ha, '/* ══ CM-DATOS ══');
const a1 = una(ha, '/* ══ CM-FIN-MODELO ══');
const appSrc = ha.slice(a0, a1);

const S0 = () => ({ base: 'norm', bv: { fal: 'sin', dsav: 'par', ebs: 'std', fon: 'ext' }, mods: {}, ck: {}, src: '' });
let demoEsc, appEsc;
try {
  demoEsc = new Function('__S', demoSrc + '\n S = __S; return scenario();');
} catch (e) { console.log(JSON.stringify({ error: 'la demo no evalua', msg: String(e).slice(0, 160) })); process.exit(2) }
try {
  appEsc = new Function('__S', appSrc + '\n return cmEscena(__S);');
} catch (e) { console.log(JSON.stringify({ error: 'el bloque de la app no evalua', msg: String(e).slice(0, 200) })); process.exit(2) }

/* ── la comparacion, campo por campo ─────────────────────────────────────────────────────── */
const num = v => (typeof v === 'number');
function cmp(a, b, ruta, difs) {
  if (num(a) && num(b)) { if (Math.abs(a - b) > TOL) difs.push(ruta + ': ' + a + ' vs ' + b); return }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) { difs.push(ruta + '.length: ' + a.length + ' vs ' + b.length); return }
    for (let i = 0; i < a.length; i++) cmp(a[i], b[i], ruta + '[' + i + ']', difs); return;
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ks = Array.from(new Set(Object.keys(a).concat(Object.keys(b)))).sort();
    ks.forEach(k => cmp(a[k], b[k], ruta + '.' + k, difs)); return;
  }
  if (String(a) !== String(b)) difs.push(ruta + ': ' + JSON.stringify(a) + ' vs ' + JSON.stringify(b));
}

/* ── los escenarios: las dieciseis vistas y las combinaciones ────────────────────────────── */
const ESC = [];
const BV = { fal: ['sin', 'op'], dsav: ['par', 'tra', 'com'], fon: ['ext', 'tun', 'atr'], ebs: ['std'] };
/* las cinco anatomias de base con TODAS sus variantes */
ESC.push({ n: 'norm', S: S0() });
['fal', 'dsav', 'ebs', 'fon'].forEach(b => BV[b].forEach(v => {
  const s = S0(); s.base = b; s.bv[b] = v; ESC.push({ n: b + ':' + v, S: s });
}));
/* las diez lesiones que se suman, con TODAS sus variantes */
const MODV = { cia: ['sec', 'pri', 'sv'], civ: ['pm', 'mus', 'sal', 'ent'], dap: ['std'],
  vap: ['prox', 'dis'], cvpa: ['cs'], coa: ['nat', 'rep'], ep: ['valv', 'sub', 'sup'],
  ea: ['sub', 'sup'], vcs: ['std'], eis: ['std'] };
Object.keys(MODV).forEach(k => MODV[k].forEach(v => {
  const s = S0(); s.mods[k] = v;
  if (k === 'eis') s.mods.civ = 'pm';            /* Eisenmenger necesita una comunicacion */
  ESC.push({ n: 'mod ' + k + ':' + v, S: s });
}));
/* las casillas de cada lesion y de cada base */
[['cvpa', 'cs', 'svs'], ['coa', 'nat', 'col'], ['coa', 'rep', 'rec'], ['coa', 'rep', 'ane'],
 ['ea', 'sub', 'iao'], ['ea', 'sup', 'iao']].forEach(t => {
  const s = S0(); s.mods[t[0]] = t[1]; s.ck[t[2]] = true;
  ESC.push({ n: 'ck ' + t[0] + ':' + t[1] + '+' + t[2], S: s });
});
[['fal', 'op', 'ip'], ['fal', 'op', 'rciv'], ['fal', 'op', 'rest'], ['fal', 'op', 'rvd'],
 ['dsav', 'par', 'iav'], ['dsav', 'tra', 'iav'], ['dsav', 'com', 'iav'],
 ['ebs', 'std', 'eit'], ['fon', 'ext', 'fen'], ['fon', 'tun', 'fen']].forEach(t => {
  const s = S0(); s.base = t[0]; s.bv[t[0]] = t[1]; s.ck[t[2]] = true;
  ESC.push({ n: 'base-ck ' + t[0] + ':' + t[1] + '+' + t[2], S: s });
});
/* las seis combinaciones frecuentes de la demo */
const PRES = [
 { n: 'pres CIA+CIV+ductus', b: 'norm', m: { cia: 'sec', civ: 'pm', dap: 'std' } },
 { n: 'pres CIA+CVPA+cava', b: 'norm', m: { cia: 'sv', cvpa: 'cs', vcs: 'std' }, k: { svs: true } },
 { n: 'pres CIA+EP', b: 'norm', m: { cia: 'sec', ep: 'valv' } },
 { n: 'pres coa+esub', b: 'norm', m: { coa: 'nat', ea: 'sub' } },
 { n: 'pres Ebstein+CIA', b: 'ebs', m: { cia: 'sec' }, k: { eit: true } },
 { n: 'pres CIV+ductus+Eisen', b: 'norm', m: { civ: 'pm', dap: 'std', eis: 'std' } }
];
PRES.forEach(p => { const s = S0(); s.base = p.b; s.mods = Object.assign({}, p.m);
  s.ck = Object.assign({}, p.k || {}); ESC.push({ n: p.n, S: s }) });
/* combinaciones extra, para que el barrido no sea solo de una lesion por vez */
[['cia', 'sec', 'vcs', 'std'], ['civ', 'pm', 'coa', 'nat'], ['dap', 'std', 'ep', 'valv'],
 ['vap', 'prox', 'cia', 'pri'], ['cvpa', 'cs', 'ea', 'sup'], ['vcs', 'std', 'coa', 'rep']].forEach(t => {
  const s = S0(); s.mods[t[0]] = t[1]; s.mods[t[2]] = t[3];
  ESC.push({ n: 'comb ' + t[0] + '+' + t[2], S: s });
});

/* ⚠️ LA GEOMETRIA Y LOS TEXTOS SE COMPARAN POR SEPARADO, Y ES LO QUE LA ORDEN PIDE. Lo que
   tiene que salir IDENTICO es la geometria -arterias, corrientes, extras, rotulos y tamanios-.
   Los textos de la demo son de EJEMPLO y los de la app estan VERIFICADOS contra las guias hoja
   por hoja, asi que ahi la diferencia es la prueba de que el trabajo se hizo, no un defecto.
   Mezclarlos daba 39 «diferencias» que eran todas de redaccion y tapaban la medicion. */
const SOLO_TEXTO = ['info', 'circ', 'ref', 'src'];
const OUT = { archivo: FILE, demo: DEMO, tolerancia: TOL, n: ESC.length,
              igualesGeo: 0, distintosGeo: [], escenasConTextoDistinto: 0, textos: [] };
ESC.forEach(t => {
  let a = null, b = null;
  try { a = demoEsc(JSON.parse(JSON.stringify(t.S))) } catch (e) { a = { EXC: String(e).slice(0, 120) } }
  try { b = appEsc(JSON.parse(JSON.stringify(t.S))) } catch (e) { b = { EXC: String(e).slice(0, 120) } }
  const geoA = {}, geoB = {}, txA = {}, txB = {};
  Object.keys(a || {}).forEach(k => { (SOLO_TEXTO.indexOf(k) >= 0 ? txA : geoA)[k] = a[k] });
  Object.keys(b || {}).forEach(k => { (SOLO_TEXTO.indexOf(k) >= 0 ? txB : geoB)[k] = b[k] });
  const difs = [], dtx = [];
  /* el denominador: una escena vacia a los dos lados no prueba nada */
  const peso = a && a.ar ? (a.ar.length + (a.fl || []).length + (a.ex || []).length + (a.lb || []).length) : 0;
  cmp(geoA, geoB, '', difs);
  cmp(txA, txB, '', dtx);
  if (difs.length === 0) OUT.igualesGeo++;
  else OUT.distintosGeo.push({ escena: t.n, peso: peso, n: difs.length, difs: difs.slice(0, 6) });
  if (dtx.length) { OUT.escenasConTextoDistinto++; OUT.textos.push({ escena: t.n, campos: dtx.map(x => x.split(':')[0]) }) }
  if (peso === 0) OUT.distintosGeo.push({ escena: t.n, DENOMINADOR_VACIO: true });
});
OUT.textos = OUT.textos.slice(0, 12);
console.log(JSON.stringify(OUT, null, 1));
