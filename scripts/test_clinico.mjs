#!/usr/bin/env node
/**
 * test_clinico.mjs — CeiboMed / EcoSmart
 *
 * Bateria de casos clinicos sobre el informe narrativo, el EN SUMA y las formulas. Cada bug
 * grave del 2026-09-14 (VD que desaparecia, gradiente pulmonar congelado, contraindicacion
 * invertida del TEER, fuga entre pacientes) esta cubierto por al menos un caso.
 *
 * CON QUE CORRE — no con Playwright. `pip install` esta bloqueado en este entorno y bajar un
 * Chromium propio son ~150 MB. Node 24 trae `fetch` y `WebSocket` nativos, y en la maquina ya
 * hay Google Chrome, asi que el script habla CDP directo contra el Chrome del sistema:
 *   CERO dependencias, cero descargas, y ademas prueba sobre el motor real, no sobre un DOM
 *   simulado — que era la otra alternativa del pedido y habria verificado una reimplementacion
 *   de la app en vez de la app.
 *
 * Uso:
 *     node scripts/test_clinico.mjs
 *     node scripts/test_clinico.mjs --ver        # deja el navegador visible
 *     node scripts/test_clinico.mjs --solo TC-04
 *
 * Salida 0 si pasan todos, 1 si falla alguno.
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const VER  = process.argv.includes('--ver');
const SOLO = (() => { const i = process.argv.indexOf('--solo'); return i > -1 ? process.argv[i + 1] : null; })();

const CHROMES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
];

// ── Servidor estatico minimo ────────────────────────────────────────────────────────────────
// `file://` no sirve: la app usa localStorage e IndexedDB, y en file:// el origen es opaco.
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css',
               '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml' };
function servir() {
  return new Promise((res) => {
    const srv = createServer(async (req, rq) => {
      try {
        const p = join(RAIZ, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
        if (!p.startsWith(RAIZ)) { rq.writeHead(403).end(); return; }
        const buf = await readFile(p);
        rq.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }).end(buf);
      } catch { rq.writeHead(404).end('no'); }
    });
    srv.listen(0, '127.0.0.1', () => res({ srv, port: srv.address().port }));
  });
}

// ── CDP sin dependencias ────────────────────────────────────────────────────────────────────
async function abrirChrome(url) {
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-test-'));
  let bin = null;
  for (const c of CHROMES) { try { await readFile(c); bin = c; break; } catch {} }
  if (!bin) throw new Error('No encontre Chrome/Chromium/Edge. Instalalo o pasa --ver con otro navegador.');
  const args = ['--remote-debugging-port=0', `--user-data-dir=${perfil}`, '--no-first-run',
                '--no-default-browser-check', '--disable-extensions', url];
  if (!VER) args.unshift('--headless=new');
  const proc = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  // El puerto real sale por stderr en la linea «DevTools listening on ws://...»
  const wsUrl = await new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('Chrome no respondio en 20 s')), 20000);
    let acc = '';
    proc.stderr.on('data', (d) => {
      acc += d.toString();
      const m = acc.match(/ws:\/\/[^\s]+/);
      if (m) { clearTimeout(t); res(m[0]); }
    });
  });
  return { proc, perfil, wsUrl };
}

function conectar(wsUrl) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(wsUrl);
    let id = 0; const pend = new Map();
    ws.addEventListener('open', () => res({
      send: (method, params = {}, sessionId) => new Promise((ok, no) => {
        const msg = { id: ++id, method, params };
        if (sessionId) msg.sessionId = sessionId;
        pend.set(msg.id, { ok, no });
        ws.send(JSON.stringify(msg));
      }),
      close: () => ws.close(),
    }));
    ws.addEventListener('error', rej);
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pend.has(m.id)) {
        const { ok, no } = pend.get(m.id); pend.delete(m.id);
        m.error ? no(new Error(m.error.message)) : ok(m.result);
      }
    });
  });
}

// ── Caso de prueba ──────────────────────────────────────────────────────────────────────────
const CASOS = [];
const caso = (id, nombre, fn) => CASOS.push({ id, nombre, fn });

/* Helpers que se inyectan en la pagina. `set` despacha input Y change: asignar `.value` no
   dispara ningun evento, que es la trampa numero uno de esta app. */
const PRELUDIO = `
  window.__t = {
    set(id, val) { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
      e.value = val;
      e.dispatchEvent(new Event('input', { bubbles: true }));
      e.dispatchEvent(new Event('change', { bubbles: true })); return 1; },
    limpiar() { limpiarCampos(true); try { localStorage.removeItem('co_seguimiento'); } catch (e) {} },
    informe() { generarInforme(); return {
      inf: document.getElementById('informe_texto').value,
      suma: document.getElementById('en_suma').value }; },
    txt(id) { const e = document.getElementById(id); return e ? (e.textContent || '') : null; },
    val(id) { const e = document.getElementById(id); return e ? e.value : null; }
  };
`;

// ═══ GRUPO 1 — Ventriculo derecho ═══════════════════════════════════════════════════════════
caso('TC-01', 'VD normal (basal 35, TAPSE 22)', `
  __t.limpiar();
  __t.set('vd_bas','35'); __t.set('tapse','22');
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['Ventrículo derecho de dimensiones normales, función sistólica conservada'],
    noSuma: ['VD'] };
`);

/* Basal 45 cae en la banda LEVE de \`vdBasCat\` (>41 y <=45), que es la misma que pinta la
   capsula. El pedido esperaba «VD dilatado»; la app dice «VD levemente dilatado» a proposito —
   ver lecciones 2026-09-14, punto 6: la capsula y el informe tienen que decir lo mismo. */
caso('TC-02', 'VD dilatado (basal 45) + funcion conservada', `
  __t.limpiar();
  __t.set('vd_bas','45'); __t.set('tapse','18');
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['levemente dilatado'], debeSuma: ['VD levemente dilatado'] };
`);

/* El pedido decia «VD sin datos -> el informe DEBE contener texto del VD». Es al reves de lo
   decidido: sin una sola medicion el VD NO se nombra, porque nombrarlo obliga a afirmar algo
   —normal o no— sobre lo que nadie midio. Lo que si se verifica es que con UN SOLO campo
   cargado ya aparece, que es el bug que hubo (la compuerta \`tapse || sp\`). */
caso('TC-03', 'VD con UN solo campo cargado no desaparece', `
  __t.limpiar();
  const sinNada = __t.informe();
  __t.set('vd_bas','48');            // sin TAPSE ni S': la compuerta vieja lo borraba
  const soloBasal = __t.informe();
  __t.limpiar(); __t.set('tapse','14');   // sin diametro
  const soloTapse = __t.informe();
  return { inf: soloBasal.inf, suma: soloBasal.suma,
    debe: ['Ventrículo derecho'],
    extra: [
      ['sin ningun dato el VD no se nombra', !/[Vv]entrículo derecho/.test(sinNada.inf)],
      ['con solo TAPSE el VD se nombra', /[Vv]entrículo derecho/.test(soloTapse.inf)]
    ] };
`);

// ═══ GRUPO 2 — Gradiente pulmonar ═══════════════════════════════════════════════════════════
caso('TC-04', 'Gradiente pulmonar Vmax 4 m/s = 64 mmHg', `
  __t.limpiar();
  __t.set('vp_vmax','2');            // primero otra velocidad: el bug era que se congelaba
  __t.set('vp_vmax','4');
  return { valor: __t.val('vp_gmax'), esperado: '64', noEsperado: '16' };
`);

caso('TC-05', 'Gradiente pulmonar Vmax 3 m/s = 36 mmHg', `
  __t.limpiar();
  __t.set('vp_vmax','3');
  return { valor: __t.val('vp_gmax'), esperado: '36' };
`);

// ═══ GRUPO 3 — Auricula derecha ═════════════════════════════════════════════════════════════
/* El pedido esperaba «Dilatación auricular derecha». La app usa la forma que ya tenia la AI
   —sigla + grado + valor entre parentesis— para que las dos lineas se lean iguales cuando
   aparecen juntas. Ver lecciones 2026-09-14, punto 9. */
caso('TC-06', 'AD dilatada llega al EN SUMA', `
  __t.limpiar();
  __t.set('ad_area','25');
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['Aurícula derecha dilatada'], debeSuma: ['AD dilatada'] };
`);

// ═══ GRUPO 4 — HFA-PEFF ═════════════════════════════════════════════════════════════════════
const HF_DATOS = `
  __t.set('peso','70'); __t.set('talla','170'); __t.set('edad','78');
  __t.set('ddfvi','45'); __t.set('siv','14'); __t.set('ppvi','13');
  __t.set('onda_e','90'); __t.set('e_sep','4'); __t.set('e_lat','5');
  __t.set('ai_vol','80'); __t.set('vmax_it','3.2'); __t.set('hf_ntprobnp','900');
`;

caso('TC-07', 'HFA-PEFF bloqueado con FEVI 35%', `
  __t.limpiar(); ${HF_DATOS} __t.set('fevi','35');
  const r = hfapeffScore(false);
  const hoja = amiloTextoHFAPEFF();
  return { extra: [
    ['gate bloquea', r.gate && r.gate.aplica === false],
    ['la hoja del PDF queda vacia', hoja === ''],
    ['la conclusion no nombra HFpEF como diagnostico', !/probabilidad (alta|intermedia|baja) de HFpEF/.test(hfapeffConclusion(r))],
    ['no se puede integrar', amiloSecs().find(s => s.k === 'hfpeff').hayDatos() === false]
  ] };
`);

caso('TC-08', 'HFA-PEFF calcula con FEVI 60%', `
  __t.limpiar(); ${HF_DATOS} __t.set('fevi','60');
  const r = hfapeffScore(false);
  return { extra: [
    ['gate aplica', !!(r.gate && r.gate.aplica)],
    ['puntaje 6/6', r.total === 6],
    ['la hoja del PDF sale', amiloTextoHFAPEFF().indexOf('Score HFA-PEFF') > -1]
  ] };
`);

// ═══ GRUPO 5 — Estenosis aortica ════════════════════════════════════════════════════════════
/* AVA = pi*(d/20)^2 * itv_tsvi / itv_ao. Con d=20 e itv_tsvi=18 -> 56,5 / itv_ao.
   itv_ao=71 da 0,80 cm2. El AVA no se puede tipear: es readonly y lo calcula la app, asi que
   el test carga los INSUMOS, que es lo que hace el medico. */
const EA_AVA08 = `__t.set('diam_tsvi','20'); __t.set('itv_tsvi','18'); __t.set('itv_ao','71');`;

caso('TC-09', 'EAo severa concordante (Vmax 4.5, Gmedio 45, FEVI 65)', `
  __t.limpiar(); __t.set('peso','70'); __t.set('talla','170');
  ${EA_AVA08}
  __t.set('vmax_ao','4.5'); __t.set('gmedio_ao','45'); __t.set('fevi','65');
  document.getElementById('ea_grado').value = 'severa';
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['estenosis severa', 'AVA 0.80'], debeSuma: ['EAo severa.'],
    noDebe: ['bajo flujo', 'paradojal'],
    extra: [['el escenario es concordante', eaEscenario().clave === 'severa_concordante']] };
`);

caso('TC-10', 'EAo BF/BG clasica (Gmedio 25, FEVI 30, VLI bajo)', `
  __t.limpiar(); __t.set('peso','70'); __t.set('talla','170');
  ${EA_AVA08}
  __t.set('vmax_ao','2.8'); __t.set('gmedio_ao','25'); __t.set('fevi','30');
  document.getElementById('ea_grado').value = 'severa';
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['BF/BG clásica', 'FEVI reducida'],
    extra: [['VLI <= 35', vliCalc() !== null && vliCalc() <= 35],
            ['sub = bfbg_clasica', eaEscenario().sub === 'bfbg_clasica']] };
`);

caso('TC-11', 'EAo BF/BG paradojal (Gmedio 25, FEVI 60, VLI bajo)', `
  __t.limpiar(); __t.set('peso','70'); __t.set('talla','170');
  ${EA_AVA08}
  __t.set('vmax_ao','2.8'); __t.set('gmedio_ao','25'); __t.set('fevi','60');
  document.getElementById('ea_grado').value = 'severa';
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['paradojal'],
    extra: [['sub = bfbg_paradojal', eaEscenario().sub === 'bfbg_paradojal']] };
`);

// ═══ GRUPO 6 — Limpieza entre pacientes ═════════════════════════════════════════════════════
caso('TC-12', 'El VD del paciente A no viaja al informe del B', `
  __t.limpiar();
  __t.set('nombre','PACIENTE A'); __t.set('vd_bas','52'); __t.set('tapse','12');
  const a = __t.informe();
  __t.limpiar();                       // «Nuevo estudio»
  __t.set('nombre','PACIENTE B');
  const b = __t.informe();
  return { inf: b.inf, suma: b.suma,
    noDebe: ['Ventrículo derecho', '52 mm'],
    extra: [['el paciente A si tenia VD dilatado', /dilatado/.test(a.inf)],
            ['los campos quedaron vacios', __t.val('vd_bas') === '' && __t.val('tapse') === '']] };
`);

/* La hoja del TEER del PDF sale de \`amiloTextoTEER()\`: es literalmente el texto que se dibuja.
   El bug era que \`_teerAsciiPDF\` mapeaba la cruz a «NO» y «CONTRAINDICADO» salia impreso como
   «NO CONTRAINDICADO» — la negacion de una contraindicacion absoluta. */
caso('TC-13', 'TEER con trombo en AI: CONTRAINDICADO, no NO CONTRAINDICADO', `
  __t.limpiar();
  __t.set('teer_tipo_im','secundaria');
  __t.set('teer_lva','24'); __t.set('teer_lvp','9'); __t.set('teer_gap','6');
  __t.set('teer_prof_flail','8'); __t.set('teer_area_mitral','5.2'); __t.set('teer_pasp','40');
  __t.set('teer_fevi','35'); __t.set('teer_dtsvi','62');
  __t.set('teer_calcificacion','no'); __t.set('teer_clefts','no');
  __t.set('teer_trombo','si');
  const hoja = amiloTextoTEER();
  return { inf: hoja,
    debe: ['CONTRAINDICADO'], noDebe: ['NO CONTRAINDICADO', 'APTO para TEER'],
    extra: [['la pantalla dice lo mismo', /CONTRAINDICADO/.test(__t.txt('teer-resultado'))]] };
`);

// ═══ GRUPO 7 — Aorta ════════════════════════════════════════════════════════════════════════
caso('TC-14', 'Seno de Valsalva 42 mm: levemente dilatada', `
  __t.limpiar();
  __t.set('ao_sin','42');
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['levemente dilatada'], noDebe: ['Aorta torácica de calibre normal'],
    debeSuma: ['Dilatación raíz aórtica'] };
`);

caso('TC-15', 'Aorta ascendente 52 mm con seno vacio', `
  __t.limpiar();
  __t.set('ao_tub','52');
  const r = __t.informe();
  /* «Aorta ascendente» con mayuscula: es \`sg.lblC\`, el rotulo corto de AO_SEGS, y asi lo
     imprime el estilo estandar. La primera version del test buscaba minuscula y fallaba por el
     test, no por la app — se verifico el texto real antes de cambiar nada. */
  return { inf: r.inf, suma: r.suma,
    debe: ['Aorta ascendente 52 mm', 'dilatada'],
    noDebe: ['Aorta torácica de calibre normal'],
    debeSuma: ['Dilatación aorta ascendente'] };
`);

// ═══ GRUPO 8 — Sincronias ═══════════════════════════════════════════════════════════════════
/* PSAP = 4*VIT^2 + PmAD. La PmAD la deriva la app de la VCI, asi que el test no la fija a mano:
   verifica la IDENTIDAD contra la PmAD que la app calculo. Fijar «45 mmHg» habria atado el test
   a una VCI concreta sin decirlo. */
caso('TC-16', 'PSAP = 4·VIT² + PmAD', `
  __t.limpiar();
  __t.set('vci_diam','23'); __t.set('vci_col','<50');
  __t.set('vmax_it','3');
  const pmad = parseFloat(__t.val('pmad')), psap = parseFloat(__t.val('psap_calc'));
  return { extra: [
    ['PmAD calculada desde la VCI', !isNaN(pmad)],
    ['PSAP = 36 + PmAD (' + psap + ' = 36 + ' + pmad + ')', psap === 36 + pmad],
    ['gradiente VD-AD = 36 mmHg', /36/.test(__t.val('grad_vdad_display') || '')]
  ] };
`);

caso('TC-17', "e' septal del Doppler se espeja en Constricción/Restricción", `
  __t.limpiar();
  __t.set('e_sep','5'); __t.set('e_lat','7');
  return { extra: [
    ["cvr-esep muestra el e' septal", (__t.txt('cvr-esep') || '').indexOf('5') > -1],
    ["cvr-elat muestra el e' lateral", (__t.txt('cvr-elat') || '').indexOf('7') > -1]
  ] };
`);

// ── Evaluacion ──────────────────────────────────────────────────────────────────────────────
function evaluar(r) {
  const fallos = [];
  const enInf = (s) => (r.inf || '').indexOf(s) > -1;
  const enSum = (s) => (r.suma || '').indexOf(s) > -1;
  (r.debe || []).forEach(s => { if (!enInf(s)) fallos.push(['el informe debe contener', s, recorte(r.inf)]); });
  (r.noDebe || []).forEach(s => { if (enInf(s)) fallos.push(['el informe NO debe contener', s, recorte(r.inf)]); });
  (r.debeSuma || []).forEach(s => { if (!enSum(s)) fallos.push(['el EN SUMA debe contener', s, recorte(r.suma)]); });
  (r.noSuma || []).forEach(s => { if (enSum(s)) fallos.push(['el EN SUMA NO debe contener', s, recorte(r.suma)]); });
  /* Comparacion NUMERICA cuando los dos lados son numeros. Con `String(...)` el test daba rojo
     por «36» contra «36.0» —dos formas de escribir el mismo gradiente— y un test que falla por
     el formato es un test que se empieza a ignorar. Lo que se verifica es el VALOR. */
  const igual = (a, b) => {
    const na = parseFloat(a), nb = parseFloat(b);
    return (!isNaN(na) && !isNaN(nb)) ? na === nb : String(a) === String(b);
  };
  if (r.esperado !== undefined && !igual(r.valor, r.esperado))
    fallos.push(['valor esperado', r.esperado, String(r.valor)]);
  if (r.noEsperado !== undefined && igual(r.valor, r.noEsperado))
    fallos.push(['valor NO esperado', r.noEsperado, String(r.valor)]);
  (r.extra || []).forEach(([desc, ok]) => { if (!ok) fallos.push(['condicion', desc, '']); });
  return fallos;
}
const recorte = (s) => !s ? '(vacio)' : String(s).replace(/\n/g, ' | ').slice(0, 150);

// ── Main ────────────────────────────────────────────────────────────────────────────────────
const L = '═'.repeat(62);
let servidor, chrome;
try {
  const s = await servir(); servidor = s.srv;
  chrome = await abrirChrome(`http://127.0.0.1:${s.port}/index.html`);
  const cdp = await conectar(chrome.wsUrl);

  const { targetInfos } = await cdp.send('Target.getTargets');
  const page = targetInfos.find(t => t.type === 'page');
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: page.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);

  const ev = async (expr) => {
    const r = await cdp.send('Runtime.evaluate', {
      expression: `(function(){ ${expr} })()`, returnByValue: true, awaitPromise: true,
    }, sessionId);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'error en la pagina');
    return r.result.value;
  };

  // La app arranca con pantalla de login: se saltea con el flag de sesion y se recarga.
  await ev(`try{sessionStorage.setItem('ett_auth','1');}catch(e){} location.reload(); return 1;`);
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 250));
    const listo = await ev(`return (typeof generarInforme === 'function') && !!document.getElementById('informe_texto');`).catch(() => false);
    if (listo) break;
  }
  const listo = await ev(`return typeof generarInforme === 'function';`);
  if (!listo) throw new Error('La app no termino de cargar (generarInforme no existe).');
  await ev(PRELUDIO + ' return 1;');
  // Cartel legal de arranque: tapa la pantalla y algunos click() del test.
  await ev(`try{ if (typeof cerrarAvisoEco==='function') cerrarAvisoEco(); }catch(e){} return 1;`);

  const fecha = new Date().toISOString().slice(0, 10).split('-').reverse().join('/');
  console.log(L);
  console.log('  TEST SUITE CLINICO — EcoSmart');
  console.log('  ' + fecha + '   ·   Chrome del sistema via CDP, sin dependencias');
  console.log(L);

  let ok = 0; const rotos = [];
  for (const c of CASOS) {
    if (SOLO && c.id !== SOLO) continue;
    let fallos;
    try { fallos = evaluar(await ev(c.fn)); }
    catch (e) { fallos = [['excepcion', e.message, '']]; }
    const punteado = (c.id + ' ' + c.nombre).padEnd(56, ' ').replace(/ (?= *$)/g, '.');
    if (fallos.length) { console.log('  ' + punteado + ' ✗'); rotos.push([c, fallos]); }
    else { console.log('  ' + punteado + ' ✓'); ok++; }
  }

  console.log(L);
  const total = CASOS.filter(c => !SOLO || c.id === SOLO).length;
  if (rotos.length) {
    console.log('  RESULTADO: %d/%d  —  %d CON FALLAS', ok, total, rotos.length);
    console.log(L);
    rotos.forEach(([c, fallos]) => {
      console.log('\n  ' + c.id + '  ' + c.nombre);
      fallos.forEach(([q, esp, enc]) => {
        console.log('      ' + q + ': «' + esp + '»');
        if (enc) console.log('      encontrado: ' + enc);
      });
    });
    console.log('');
  } else {
    console.log('  RESULTADO: %d/%d ✓ — sin regresiones', ok, total);
    console.log(L);
  }
  cdp.close();
  process.exitCode = rotos.length ? 1 : 0;
} catch (e) {
  console.error('\n  ERROR: ' + e.message + '\n');
  process.exitCode = 2;
} finally {
  try { servidor && servidor.close(); } catch {}
  try { chrome && chrome.proc.kill(); } catch {}
  try { chrome && await rm(chrome.perfil, { recursive: true, force: true }); } catch {}
}
