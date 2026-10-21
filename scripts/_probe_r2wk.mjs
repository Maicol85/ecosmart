#!/usr/bin/env node
/**
 * _probe_r2wk.mjs - la sonda de los DOS MOTORES de la tanda R2 (2026-10-21).
 *
 * Mide lo RENDERIZADO, que es la regla nueva de esta tanda: la tanda R paso sus pruebas y
 * fallo en Safari porque las pruebas miraban el ATRIBUTO hidden y no el display COMPUTADO.
 *
 * Resuelve Playwright POR RUTA y, si no esta, lo DICE y sale con codigo 2 en vez de reventar.
 * WebKit de Playwright NO es Safari, y se declara.
 *
 *   node scripts/_probe_r2wk.mjs --solo derrame
 *   node scripts/_probe_r2wk.mjs --solo derrame,vab --file /tmp/head.html
 *   node scripts/_probe_r2wk.mjs --solo maqueta --dest /tmp/r2cap
 *
 * ADVERTENCIA: sin acentos graves dentro del template de la sonda, y sin \s ni \n (se cocinan).
 */
const CANDIDATAS = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
                    '/tmp/pw/node_modules/playwright/index.js',
                    '/usr/local/lib/node_modules/playwright/index.js',
                    process.env.HOME + '/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CANDIDATAS) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) {
  console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CANDIDATAS,
    comoInstalar: 'mkdir -p ~/.pwtmp && cd ~/.pwtmp && npm i playwright' }, null, 1));
  process.exit(2);
}
const { chromium, webkit } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const SOLO = (arg('--solo') || 'derrame,vab').split(',').map(s => s.trim());
const FILE = arg('--file') || (RAIZ + '/index.html');
const DEST = arg('--dest') || '/tmp/r2cap';
const OUT = {};
const hay = (g) => SOLO.indexOf(g) > -1;

/* El preludio: despeja los dos overlays que envenenan elementFromPoint y deja el formulario
   limpio. El aviso legal VUELVE a mitad de corrida, asi que se despeja en CADA escena. */
const PRELUDIO = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  return true;
})()`;

/* ══ (a) EL DESPLEGABLE DEL DERRAME, MEDIDO POR SU DISPLAY COMPUTADO ══════════════════
   La propiedad .hidden y el atributo dicen lo mismo en los dos motores; lo que cambia es si
   el motor lo RESPETA al pintar la lista. Un desplegable nativo no esta obligado a aplicar
   el layout de sus <option>, asi que se mide el computado Y se cuenta cuantas quedan. */
const MED_DERRAME = `(() => {
  const e = document.getElementById('pericardio');
  if (!e) return { err: 'NO EXISTE pericardio' };
  const ops = Array.prototype.slice.call(e.options).map(o => ({
    txt: o.text, val: o.value,
    attr: o.hasAttribute('hidden'), prop: !!o.hidden,
    disp: getComputedStyle(o).display,
    vis: getComputedStyle(o).visibility
  }));
  /* «visible en la lista» = el motor no la saca del layout. */
  const visibles = ops.filter(o => o.disp !== 'none' && o.vis !== 'hidden');
  return { n: ops.length, nVisibles: visibles.length,
           visibles: visibles.map(o => o.txt), ops: ops };
})()`;

/* Un token de legado entra y tiene que quedar en una opcion REAL, no en selectedIndex -1. */
const MED_LEGADO = `((tok) => {
  const e = document.getElementById('pericardio');
  if (!e) return { err: 'NO EXISTE' };
  e.value = tok;
  e.dispatchEvent(new Event('change', { bubbles: true }));
  const r = { puesto: tok, leido: e.value, idx: e.selectedIndex,
    tam: (typeof dptTamano === 'function') ? (dptTamano() || {}).clave : 'SIN FN',
    lbl: (typeof dptTamano === 'function') ? (dptTamano() || {}).lbl : 'SIN FN' };
  return r;
})(TOKEN)`;

/* ══ (b) LA VAB: la matriz de estenosis / insuficiencia sin grado ═════════════════════
   Se enciende la pastilla con un CLIC REAL en el boton, que es el gesto del medico, y se lee
   lo que la seccion VAB PUBLICA. `pillOn` lee la clase del boton; `aoLesionSinGrado` lo lee a
   el. Lo que se mide es si el RESUMEN se repinta. */
const VAB_ESCENA = `((cual) => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  if (typeof showTab === 'function') { try { showTab('valvulas') } catch (e) {} }
  const r = { cual: cual };
  /* La pastilla: clic REAL en el boton que el medico aprieta. */
  const pin = (t) => { const b = document.getElementById('pill-' + t + '-aortica');
    if (!b) return 'NO EXISTE'; if (!b.classList.contains('btn-primary')) b.click();
    return b.classList.contains('btn-primary') };
  if (cual === 'ea' || cual === 'ambas') r.pillEA = pin('esten');
  if (cual === 'ia' || cual === 'ambas') r.pillIA = pin('insuf');
  r.pillOnEA = (typeof pillOn === 'function') ? pillOn('aortica','esten') : 'SIN FN';
  r.pillOnIA = (typeof pillOn === 'function') ? pillOn('aortica','insuf') : 'SIN FN';
  r.sinGradoEA = (typeof aoLesionSinGrado === 'function') ? aoLesionSinGrado('ea') : 'SIN FN';
  r.sinGradoIA = (typeof aoLesionSinGrado === 'function') ? aoLesionSinGrado('ia') : 'SIN FN';
  r.eaGrado = (typeof sv === 'function') ? sv('ea_grado') : 'SIN FN';
  r.iaGrado = (typeof sv === 'function') ? sv('ia_grado') : 'SIN FN';
  /* Ahora la seccion VAB, SIN tocar nada mas: es el estado en el que el medico la mira. */
  if (typeof showTab === 'function') { try { showTab('congenitas') } catch (e) {} }
  const sec = document.getElementById('sacc-cc-vab');
  if (sec && typeof secToggle === 'function') { try { secToggle('cc-vab') } catch (e) {} }
  const res = document.getElementById('vab-concl');
  r.resumen = res ? String(res.textContent || '').replace(/[ ]+/g, ' ').trim() : 'NO EXISTE vab-concl';
  r.funcion = (typeof vabFuncionDerivada === 'function') ? vabFuncionDerivada() : 'SIN FN';
  const fh = document.getElementById('vab_funcion');
  r.funcionCampo = fh ? fh.value : 'NO EXISTE';
  /* EL DIAGNOSTICO: llamar a vabSync() A MANO. Si el resumen aparece recien aca, lo que falta
     no es la funcion duena -que ya devuelve el estado- sino QUIEN la llama. */
  if (typeof vabSync === 'function') { try { vabSync() } catch (e) { r.errSync = String(e) } }
  r.resumenTrasSync = res ? String(res.textContent || '').replace(/[ ]+/g, ' ').trim() : 'NO EXISTE';
  r.campoTrasSync = fh ? fh.value : 'NO EXISTE';
  /* Y el informe de VALVULAS, que es el que Maicol dice que SI lo publica. */
  try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
  const ti = document.getElementById('informe_texto');
  const todo = ti ? String(ti.value || '') : '';
  r.infAortica = (todo.split(/[.]/).filter(x => x.indexOf('ortica') > -1)[0] || 'SIN LINEA').trim().slice(0, 150);
  return r;
})(CUAL)`;

/* ══ LA MATRIZ COMPLETA DE E2 ═════════════════════════════════════════════════════════
   Cada fila es una combinacion de la orden. `grado` fija el <select> de severidad ANTES de
   mirar; `cerrada` deja la seccion VAB plegada al prender la pastilla y la abre DESPUES;
   `volver` cambia de pestana y vuelve; `desmarcar` apaga la pastilla al final. */
const MATRIZ = [
  { k: 'ea_sin_grado',      pin: ['esten'] },
  { k: 'ia_sin_grado',      pin: ['insuf'] },
  { k: 'ambas_sin_grado',   pin: ['esten', 'insuf'] },
  { k: 'ea_con_grado',      pin: ['esten'], grado: { ea_grado: 'moderada' } },
  { k: 'ia_con_grado',      pin: ['insuf'], grado: { ia_grado: '2' } },
  { k: 'ea_desmarcar',      pin: ['esten'], desmarcar: ['esten'] },
  { k: 'ea_seccion_cerrada', pin: ['esten'], cerrada: true },
  { k: 'ea_cambiar_pestana', pin: ['esten'], volver: true }
];

const VAB_MATRIZ = `((C) => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  const r = { k: C.k };
  /* La seccion VAB: si la fila la quiere CERRADA, se deja plegada; si no, se abre ANTES del
     gesto, que es el caso en que el medico la esta mirando mientras marca. */
  const abrirVab = () => { if (typeof showTab === 'function') { try { showTab('congenitas') } catch (e) {} }
    const sec = document.getElementById('sacc-cc-vab');
    const abierta = sec && getComputedStyle(sec).maxHeight !== '0px' && sec.offsetHeight > 0;
    if (!abierta && typeof secToggle === 'function') { try { secToggle('cc-vab') } catch (e) {} } };
  if (!C.cerrada) abrirVab();
  if (typeof showTab === 'function') { try { showTab('valvulas') } catch (e) {} }
  (C.pin || []).forEach(t => { const b = document.getElementById('pill-' + t + '-aortica');
    if (b && !b.classList.contains('btn-primary')) b.click() });
  Object.keys(C.grado || {}).forEach(id => { const e = document.getElementById(id);
    if (e) { e.value = C.grado[id]; e.dispatchEvent(new Event('change', { bubbles: true })) } });
  if (C.volver) { if (typeof showTab === 'function') { try { showTab('datos'); showTab('valvulas') } catch (e) {} } }
  (C.desmarcar || []).forEach(t => { const b = document.getElementById('pill-' + t + '-aortica');
    if (b && b.classList.contains('btn-primary')) b.click() });
  if (C.cerrada) abrirVab(); else abrirVab();
  const res = document.getElementById('vab-concl');
  r.resumen = res ? String(res.textContent || '').replace(/[ ]+/g, ' ').trim() : 'NO EXISTE';
  r.linea2 = r.resumen.replace('Factores de riesgo: ninguno marcado', '').trim();
  r.funcion = (typeof vabFuncionDerivada === 'function') ? vabFuncionDerivada() : 'SIN FN';
  const fh = document.getElementById('vab_funcion'); r.campo = fh ? fh.value : 'NO EXISTE';
  r.sgEA = (typeof aoLesionSinGrado === 'function') ? aoLesionSinGrado('ea') : 'SIN FN';
  r.sgIA = (typeof aoLesionSinGrado === 'function') ? aoLesionSinGrado('ia') : 'SIN FN';
  /* El informe de VALVULAS y el EN SUMA: la misma palabra. */
  try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
  const ti = document.getElementById('informe_texto'), su = document.getElementById('en_suma');
  const todo = ti ? String(ti.value || '') : '';
  r.infAo = (todo.split('.').filter(x => x.indexOf('rtica') > -1 && x.indexOf('Aorta') < 0)[0] || 'SIN LINEA').trim().slice(0, 170);
  const sm = su ? String(su.value || '') : '';
  r.sumaAo = (sm.split(String.fromCharCode(10)).filter(x => /EA |IAo |VAB/.test(x))[0] || 'SIN LINEA').slice(0, 130);
  return r;
})(CASO)`;

async function corre(nombre, lanzar) {
  let b = null;
  try { b = await lanzar() } catch (e) { OUT[nombre] = { error: 'NO ARRANCA: ' + e.message.slice(0, 120) }; return }
  const R = {};
  try {
    const pg = await b.newPage({ viewport: { width: 1200, height: 700 } });
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
    await pg.waitForTimeout(1200);
    await pg.evaluate(PRELUDIO);

    if (hay('derrame')) {
      R.derrame = await pg.evaluate(MED_DERRAME);
      R.legado = {};
      for (const tok of ['Derrame mínimo', 'Derrame leve (5-10mm)', 'Derrame leve (<10mm)',
                         'Derrame moderado (10-20mm)', 'Engrosamiento / calcificación']) {
        R.legado[tok] = await pg.evaluate(MED_LEGADO.replace('TOKEN', JSON.stringify(tok)));
      }
      /* El filtro de cohorte: sus opciones, para ver la que filtra a cero. */
      R.cohorte = await pg.evaluate(`(() => { const e = document.getElementById('coh-dpt-tam');
        return e ? Array.prototype.slice.call(e.options).map(o => o.value + '|' + o.text) : 'NO EXISTE' })()`);
      /* LA RUTA REAL. Asignar el token crudo al <select> NO es ningun camino de la app: las dos
         rutas de restauracion y la reimpresion pasan por `_migrarCamposLegacy`, y el importador
         por `LAB_XLS_LISTAS_LEGADO`. Se mide ESO. */
      R.rutaReal = await pg.evaluate(`(() => {
        const out = {};
        ['Derrame mínimo', 'Derrame leve (5-10mm)', 'Derrame leve (<10mm)',
         'Derrame moderado (10-20mm)', 'Engrosamiento / calcificación'].forEach(tok => {
          const c = { pericardio: tok };
          let mig = 'SIN FN';
          if (typeof _migrarCamposLegacy === 'function') { _migrarCamposLegacy(c); mig = c.pericardio }
          const e = document.getElementById('pericardio');
          e.value = mig; e.dispatchEvent(new Event('change', { bubbles: true }));
          out[tok] = { migrado: mig, idx: e.selectedIndex,
            tam: (typeof dptTamano === 'function') ? (dptTamano() || {}).clave : 'SIN FN' };
        });
        /* Y el importador: tiene que SEGUIR aceptando los dos textos viejos. */
        out._importador = {};
        ['Derrame mínimo', 'Derrame leve (5-10mm)', 'Derrame leve (<10mm)', 'Un valor inventado']
          .forEach(tok => { out._importador[tok] =
            (typeof _labXlsLista === 'function') ? _labXlsLista('pericardio', tok) : 'SIN FN' });
        return out;
      })()`);
      /* La lista EXPANDIDA (size = n): es el layout real de la lista, y es la medicion que
         distinguio los dos motores. Con cinco opciones vivas las cinco tienen que tener altura. */
      R.expandida = await pg.evaluate(`(() => { const e = document.getElementById('pericardio');
        /* SIN GEOMETRIA NO SE MIDE NADA: el select vive en la pestana Otros, dentro de una seccion
           que nace plegada. La primera version informo «0 de 5 con altura» sobre un desplegable
           perfecto. */
        if (typeof showTab === 'function') { try { showTab('otros') } catch (e2) {} }
        const sec = document.getElementById('ete-seccion-pericardio-masas');
        if (sec) sec.style.display = 'block';
        if (!e.getBoundingClientRect().height) return { err: 'SIN GEOMETRIA pericardio' };
        e.size = e.options.length;
        const f = Array.prototype.slice.call(e.options).map(o => ({ t: o.text.slice(0, 26),
          h: Math.round(o.getBoundingClientRect().height) }));
        e.size = 1;
        return { n: f.length, conAltura: f.filter(x => x.h > 0).length, filas: f } })()`);
    }

    if (hay('vab')) {
      R.vab = {};
      for (const c of ['ea', 'ia', 'ambas']) {
        R.vab[c] = await pg.evaluate(VAB_ESCENA.replace('CUAL', JSON.stringify(c)));
      }
    }
    if (hay('vabmat')) {
      R.matriz = {};
      for (const c of MATRIZ) {
        R.matriz[c.k] = await pg.evaluate(VAB_MATRIZ.replace('CASO', JSON.stringify(c)));
      }
    }
    await pg.close();
  } catch (e) { R.error = e.message.slice(0, 200) }
  try { await b.close() } catch (e) {}
  OUT[nombre] = R;
  console.log('-- parcial ' + nombre + ' --');
  console.log(JSON.stringify(R, null, 1).slice(0, 2600));
}

await corre('chrome', () => chromium.launch({ channel: 'chrome' }));
await corre('webkit', () => webkit.launch());
console.log('===== TOTAL =====');
console.log(JSON.stringify(OUT, null, 1));
