#!/usr/bin/env node
/**
 * _probe_popc_demo.mjs - la comparacion OBLIGATORIA con la demo v9 (POP-C, commits 5 a 9).
 *
 * NO compara pixeles: dos motores dan pixeles distintos con el mismo SVG. Corre la funcion de
 * la DEMO y la de la APP con los MISMOS datos, en la misma pagina, y compara numero por numero
 * con una tolerancia declarada.
 *
 * La demo es `docs/3d/demo_posoperatorio_v9_concepto.html`, un dibujo del medico que la orden
 * autoriza expresamente a copiar. Su `valveGeo` y su `openFrac` se EXTRAEN del archivo por
 * marcas literales -verificando que cada una aparezca UNA sola vez, asi que si la demo cambia
 * la extraccion falla ruidosamente- y se evaluan en una pagina en blanco.
 *
 *   node scripts/_probe_popc_demo.mjs [--file <html>] [--demo <html>]
 */
import fs from 'fs';
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const FILE = arg('--file') || RAIZ + '/index.html';
const DEMO = arg('--demo') || RAIZ + '/docs/3d/demo_posoperatorio_v9_concepto.html';
const TOL = 1e-9;

/* ── EXTRACCION de la demo, por marcas literales y exigiendo UNICIDAD ── */
const src = fs.readFileSync(DEMO, 'utf8');
function saca(nombre) {
  const marca = 'function ' + nombre + '(';
  const n = src.split(marca).length - 1;
  if (n !== 1) { console.log('ABORTA: "' + marca + '" aparece ' + n + ' veces en la demo (se esperaba 1)'); process.exit(1); }
  const i = src.indexOf(marca);
  /* se corta en el cierre de la funcion, contando llaves desde la primera */
  let j = src.indexOf('{', i), d = 0, k = j;
  for (; k < src.length; k++) {
    if (src[k] === '{') d++;
    else if (src[k] === '}') { d--; if (d === 0) break; }
  }
  return src.slice(i, k + 1);
}
const DEMO_VALVEGEO = saca('valveGeo');
const DEMO_OPENFRAC = saca('openFrac');
const DEMO_PLUME    = saca('plume');

/* ── Las escenas: los tres tipos x once fases del ciclo x las cuatro valvulas ── */
const TIPOS = [['', 'sin tipo'], ['mec', 'mecanica'], ['bio', 'biologica']];
const FASES = [0, 0.1, 0.17, 0.25, 0.34, 0.35, 0.4, 0.5, 0.67, 0.94, 0.95];
const VALV = [['ao', 'Ao'], ['pu', 'Pu'], ['mi', 'Mi'], ['tr', 'Tr']];

(async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome', headless: true });

  /* 1 · la demo, evaluada en una pagina EN BLANCO */
  const pd = await b.newPage();
  await pd.goto('about:blank');
  await pd.addScriptTag({ content: DEMO_VALVEGEO + '\n' + DEMO_OPENFRAC + '\n' + DEMO_PLUME + '\nwindow.__vg=valveGeo;window.__of=openFrac;window.__pl=plume;' });
  const demo = await pd.evaluate(({ TIPOS, FASES, VALV }) => {
    const out = {};
    /* la demo necesita que existan las variables CSS; no importa, solo se leen las rutas */
    for (const [t] of TIPOS) for (const [, dk] of VALV) for (const ph of FASES) {
      const a = window.__of(dk, ph);
      out[t + '|' + dk + '|' + ph] = { a: a, html: window.__vg(t, a) };
    }
    /* plume: los mismos L, w y o que la app usa para los cuatro grados y varias fases */
    out.__plume = {};
    [[14,4],[24,7],[29,9],[34,11]].forEach(m => {
      [0.1,0.4,0.7,1].forEach(a => {
        const L = m[0]*(0.35+0.65*a), w = m[1]*(0.55+0.45*a);
        [0, 0.8, -0.8].forEach(o => {
          out.__plume[m[0]+'|'+a+'|'+o] = window.__pl(L, w, o);
        });
      });
    });
    return out;
  }, { TIPOS, FASES, VALV });
  await pd.close();

  /* 2 · la app */
  const pa = await b.newPage();
  const errs = [];
  pa.on('pageerror', e => errs.push('PAGE ' + e.message));
  await pa.goto('file://' + FILE);
  await pa.waitForTimeout(2500);
  const app = await pa.evaluate(({ TIPOS, FASES, VALV }) => {
    const out = { falta: [] };
    if (typeof _popValvVelos !== 'function') { out.falta.push('_popValvVelos'); return out }
    if (typeof _popValvApertura !== 'function') { out.falta.push('_popValvApertura'); return out }
    for (const [t] of TIPOS) for (const [ak, dk] of VALV) for (const ph of FASES) {
      const a = _popValvApertura(ak, ph);
      out[t + '|' + dk + '|' + ph] = { a: a, velos: t ? _popValvVelos(a, t === 'bio') : null };
    }
    out.__plume = {};
    if (typeof _popEsqPluma === 'function') {
      [[14,4],[24,7],[29,9],[34,11]].forEach(m => {
        [0.1,0.4,0.7,1].forEach(a => {
          const L = m[0]*(0.35+0.65*a), w = m[1]*(0.55+0.45*a);
          [0, 0.8, -0.8].forEach(o => {
            out.__plume[m[0]+'|'+a+'|'+o] = _popEsqPluma(L, w, o);
          });
        });
      });
    }
    out.r = (typeof POP_ESQ_VALV_L !== 'undefined') ? POP_ESQ_VALV_L : null;
    out.ang = (typeof POP_ESQ_VALV_ANG !== 'undefined') ? POP_ESQ_VALV_ANG : null;
    out.bio = (typeof POP_ESQ_VALV_BIO !== 'undefined') ? POP_ESQ_VALV_BIO : null;
    return out;
  }, { TIPOS, FASES, VALV });
  await pa.close();
  await b.close();

  if (app.falta && app.falta.length) {
    console.log('===== COMPARACION CON LA DEMO v9 =====');
    console.log('archivo:', FILE);
    console.log('NO EXISTEN en este arbol: ' + app.falta.join(', ') + '  (es el arbol de HEAD)');
    process.exit(0);
  }

  /* 3 · la comparacion. De la cadena de la demo se extraen los numeros de las rutas. */
  const nums = s => (String(s).match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
  let ok = 0, mal = 0; const detalle = [];
  console.log('===== COMPARACION CON LA DEMO v9 (POP-C, commit 5) =====');
  console.log('app :', FILE);
  console.log('demo:', DEMO);
  console.log('metodo: se corre `valveGeo`/`openFrac` de la demo y `_popValvVelos`/'
    + '`_popValvApertura` de la app con los MISMOS datos y se comparan los NUMEROS de las rutas.');
  console.log('tolerancia: ' + TOL + ' (absoluta, por numero)');
  console.log('constantes de la app: L=' + app.r + '  angulo=' + app.ang + '  dorado=' + app.bio);
  console.log('');
  for (const [t, tn] of TIPOS) for (const [ak, dk] of VALV) for (const ph of FASES) {
    const k = t + '|' + dk + '|' + ph;
    const D = demo[k], A = app[k];
    const esc = tn.padEnd(10) + ' ' + dk + ' ph=' + String(ph).padEnd(5);
    /* 3a · la APERTURA tiene que coincidir exacto */
    if (Math.abs(D.a - A.a) > TOL) { mal++; detalle.push(esc + ' APERTURA demo=' + D.a + ' app=' + A.a); continue }
    if (t === '') {
      /* sin tipo: la demo dibuja SOLO el aro punteado y la app no dibuja velos */
      const tieneDash = /stroke-dasharray="3 3"/.test(D.html);
      const sinVelos = A.velos === null;
      if (tieneDash && sinVelos) ok++; else { mal++; detalle.push(esc + ' SIN TIPO demo dash=' + tieneDash + ' app sin velos=' + sinVelos) }
      continue;
    }
    /* 3b · los numeros de los DOS velos. De la demo se toma el `path` de los velos: es el
       ultimo `d="..."` con dos subrutas (la mecanica y la biologica lo tienen asi). */
    const m = D.html.match(/<path d="(M-8 0[^"]*)"/);
    if (!m) { mal++; detalle.push(esc + ' no se encontro el path de velos en la demo'); continue }
    const nd = nums(m[1]), na = nums(A.velos[0] + A.velos[1]);
    if (nd.length !== na.length) { mal++; detalle.push(esc + ' distinta cantidad de numeros: demo ' + nd.length + ' app ' + na.length + '\n      demo=' + m[1] + '\n      app =' + A.velos[0] + A.velos[1]); continue }
    let peor = 0;
    for (let i = 0; i < nd.length; i++) peor = Math.max(peor, Math.abs(nd[i] - na[i]));
    if (peor > TOL) { mal++; detalle.push(esc + ' difieren, peor=' + peor + '\n      demo=' + m[1] + '\n      app =' + A.velos[0] + A.velos[1]) }
    else ok++;
  }
  /* 4 · LA PLUMA de los chorros (commit 6), numero por numero. */
  let pok = 0, pmal = 0;
  const kp = Object.keys(demo.__plume || {});
  for (const k of kp) {
    const nd = nums(demo.__plume[k]), na = nums((app.__plume || {})[k] || '');
    if (nd.length !== na.length) { pmal++; detalle.push('PLUMA ' + k + ' distinta cantidad de numeros'); continue }
    let peor = 0;
    for (let i = 0; i < nd.length; i++) peor = Math.max(peor, Math.abs(nd[i] - na[i]));
    /* ⚠️ LA TOLERANCIA ES 0,005 INCLUSIVE, Y ESE NUMERO NO ES ARBITRARIO: la app REDONDEA la
       ruta a dos decimales -para no escribir cuarenta digitos por cuadro, que es lo que la demo
       hace- y la demo deja el valor crudo, asi que la diferencia maxima POSIBLE es medio ulp,
       o sea exactamente 0,005. Seis escenarios caen justo ahi y el `>` estricto los contaba
       como distintos por el epsilon de la representacion en punto flotante. */
    if (peor > 0.005 + 1e-9) { pmal++; detalle.push('PLUMA ' + k + ' peor=' + peor + '\n      demo=' + demo.__plume[k] + '\n      app =' + (app.__plume||{})[k]) }
    else pok++;
  }
  console.log('ESCENARIOS de VALVULA: ' + (ok + mal) + '   IGUALES: ' + ok + '   DISTINTOS: ' + mal);
  console.log('ESCENARIOS de PLUMA  : ' + kp.length + '   IGUALES: ' + pok + '   DISTINTOS: ' + pmal
    + '   (tolerancia 0,005 INCLUSIVE = medio ulp del redondeo a dos decimales de la app)');
  ok += pok; mal += pmal;
  if (detalle.length) { console.log('\n--- los que difieren ---'); detalle.slice(0, 20).forEach(d => console.log('  ' + d)) }
  console.log('\nerrores de pagina: ' + errs.length + (errs.length ? ' -> ' + errs.slice(0, 3).join(' ; ') : ''));
  console.log('\nRESULTADO ' + ok + '/' + (ok + mal) + (mal ? '  ** HAY DIFERENCIAS **' : '  todos iguales'));
  process.exit(0);
})();
