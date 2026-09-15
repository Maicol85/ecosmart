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

/* CASO DE DEFECTO ABIERTO (xfail). Describe lo que la app DEBERIA hacer sobre un defecto que
   hoy sigue vivo. Falla a proposito, y por eso NO cuenta como rojo: si contara, el suite
   quedaria rojo para siempre y se dejaria de correr —que es exactamente como un defecto deja
   de verse—. Pero si algun dia PASA, el runner sale con 1 y pide promoverlo a `caso()`: un
   arreglo silencioso tambien es un cambio que hay que enterarse.
   `motivo` se imprime en el reporte: un xfail sin explicacion es una excepcion que se hereda. */
const casoAbierto = (id, nombre, motivo, fn) => CASOS.push({ id, nombre, fn, abierto: motivo });

/* Helpers que se inyectan en la pagina. `set` despacha input Y change: asignar `.value` no
   dispara ningun evento, que es la trampa numero uno de esta app. */
const PRELUDIO = `
  window.__t = {
    set(id, val) { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
      e.value = val;
      e.dispatchEvent(new Event('input', { bubbles: true }));
      e.dispatchEvent(new Event('change', { bubbles: true })); return 1; },
    /* Los checkbox «Integrar al informe» son la compuerta de los modulos del ETE y de
       congenitas: sin tildar, el parrafo NO sale. Asignar \`.checked\` tampoco dispara evento. */
    chk(id, on) { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
      e.checked = on !== false;
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

/* ═══════════════════════════════════════════════════════════════════════════════════════════
   TC-18 en adelante — barrido por modulo, generado leyendo el codigo rama por rama.

   COMO SE FIJARON LOS VALORES ESPERADOS. El umbral y el operador salen del CODIGO (`>` y `>=`
   no son lo mismo, y varias ramas de este archivo se cerraron justamente por eso); el TEXTO
   literal sale de la SALIDA REAL de la app corrida en Chrome. Escribir el texto de memoria, o
   copiarlo de un resumen, es como se congela una redaccion que nunca existio.

   BSA = 2,00 EXACTA con peso 80 / talla 180 —sqrt(80*180/3600) = 2—, asi que todo lo indexado
   (LAVI, masa VI, VLI, AVAi) da numeros redondos y el test dice que umbral prueba en vez de
   arrastrar una superficie corporal arbitraria escondida en los insumos.
   ═══════════════════════════════════════════════════════════════════════════════════════════ */

const BSA2 = `__t.set('peso','80'); __t.set('talla','180');`;   // BSA exactamente 2,00 m²

// ═══ GRUPO 9 — VI: dimensiones y funcion sistolica ══════════════════════════════════════════
/* Las bandas del DDFVI son <=58 normal, <=65 leve, >65 dilatado. Se prueban los DOS lados de
   cada corte: un test que solo mira 50 y 70 pasa igual con el umbral corrido tres milimetros. */
caso('TC-18', 'DDFVI 58 normal / 59 levemente dilatado (corte >58)', `
  __t.limpiar(); __t.set('ddfvi','58'); const a = __t.informe();
  __t.limpiar(); __t.set('ddfvi','59'); const b = __t.informe();
  return { extra: [
    ['58 mm es normal',        /dimensiones normales \\(diámetro diastólico 58 mm\\)/.test(a.inf)],
    ['58 mm no va al EN SUMA', !/VI (levemente )?dilatado/.test(a.suma)],
    ['59 mm es levemente dilatado', /levemente dilatado con diámetro diastólico de 59 mm/.test(b.inf)],
    ['59 mm va al EN SUMA',    b.suma.indexOf('VI levemente dilatado.') > -1]
  ] };
`);

caso('TC-19', 'DDFVI 65 leve / 66 dilatado (corte >65)', `
  __t.limpiar(); __t.set('ddfvi','65'); const a = __t.informe();
  __t.limpiar(); __t.set('ddfvi','66'); const b = __t.informe();
  return { extra: [
    ['65 mm sigue siendo leve', a.suma.indexOf('VI levenmente') === -1 && a.suma.indexOf('VI levemente dilatado.') > -1],
    ['66 mm es dilatado',       /^Ventrículo izquierdo dilatado con diámetro diastólico de 66 mm/m.test(b.inf)],
    ['66 mm va al EN SUMA',     b.suma.indexOf('VI dilatado.') > -1]
  ] };
`);

/* UMBRAL_FEVI_NORMAL = 50, y las bandas de abajo son 40 y 30. Los tres cortes, por los dos
   lados. La FEVI es el numero que mas decide conducta en todo el informe. */
caso('TC-20', 'FEVI: los tres cortes (50 / 40 / 30) por ambos lados', `
  function fevi(v) { __t.limpiar(); __t.set('fevi', String(v)); return __t.informe(); }
  const r = [50, 49, 40, 39, 30, 29].map(fevi);
  return { extra: [
    ['FEVI 50 normal',                 r[0].suma.indexOf('FEVI normal (50%).') > -1],
    ['FEVI 49 levemente reducida',     r[1].suma.indexOf('FEVI levemente reducida (49%).') > -1],
    ['FEVI 40 levemente reducida',     r[2].suma.indexOf('FEVI levemente reducida (40%).') > -1],
    ['FEVI 39 moderadamente reducida', r[3].suma.indexOf('FEVI moderadamente reducida (39%).') > -1],
    ['FEVI 30 moderadamente reducida', r[4].suma.indexOf('FEVI moderadamente reducida (30%).') > -1],
    ['FEVI 29 severamente reducida',   r[5].suma.indexOf('FEVI severamente reducida (29%).') > -1]
  ] };
`);

/* Sin FEVI cargada el informe NO puede afirmar que la funcion sistolica es normal: es la misma
   regla que el VD sin diametros. Publicar lo medido, callar lo no medido. */
caso('TC-21', 'Sin FEVI el informe no afirma nada sobre la funcion sistolica', `
  __t.limpiar(); __t.set('ddfvi','50');
  const r = __t.informe();
  return { inf: r.inf,
    debe: ['dimensiones normales'],
    noDebe: ['función sistólica normal', 'FEVI'] };
`);

// ═══ GRUPO 10 — VI: geometria (masa de Devereux x RWT) ══════════════════════════════════════
/* Los cuatro cuadrantes de la grilla masa x RWT. El corte de RWT es 0,42 y el de masa depende
   del SEXO (M 115, F 95 g/m²) — un test que no fija el sexo prueba el default y no el umbral. */
caso('TC-22', 'Geometria normal (masa normal, RWT <0.42)', `
  __t.limpiar(); ${BSA2} __t.set('sexo','M');
  __t.set('ddfvi','48'); __t.set('siv','9'); __t.set('ppvi','9'); __t.set('fevi','60');
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    noSuma: ['Remodelado', 'HVI'],
    extra: [['RWT < 0.42', parseFloat(__t.txt('rwt-val')) < 0.42],
            ['la capsula dice Geometría normal', __t.txt('geom-val').indexOf('Geometría normal') > -1]] };
`);

caso('TC-23', 'Remodelado concentrico (masa normal, RWT >=0.42)', `
  __t.limpiar(); ${BSA2} __t.set('sexo','M');
  __t.set('ddfvi','42'); __t.set('siv','11'); __t.set('ppvi','11'); __t.set('fevi','60');
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['Remodelado concéntrico.'], debeSuma: ['Remodelado concéntrico.'],
    extra: [['la capsula dice lo mismo que el informe', /Remodelado concéntrico/.test(__t.txt('geom-val'))]] };
`);

caso('TC-24', 'Hipertrofia concentrica (masa alta, RWT >=0.42)', `
  __t.limpiar(); ${BSA2} __t.set('sexo','M');
  __t.set('ddfvi','45'); __t.set('siv','15'); __t.set('ppvi','15'); __t.set('fevi','60');
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['Hipertrofia concéntrica'], debeSuma: ['HVI — hipertrofia concéntrica'],
    extra: [['la capsula concuerda', /HVI concéntrica/.test(__t.txt('geom-val'))]] };
`);

caso('TC-25', 'Hipertrofia excentrica (masa alta, RWT <0.42)', `
  __t.limpiar(); ${BSA2} __t.set('sexo','M');
  __t.set('ddfvi','62'); __t.set('siv','12'); __t.set('ppvi','11'); __t.set('fevi','60');
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['Hipertrofia excéntrica'], debeSuma: ['HVI — hipertrofia excéntrica'],
    extra: [['RWT < 0.42', parseFloat(__t.txt('rwt-val')) < 0.42]] };
`);

/* MISMA masa indexada, distinto sexo, distinto veredicto. Es el unico test que prueba que el
   corte de masa NO esta cableado a un solo numero. */
caso('TC-26', 'La masa VI se clasifica por sexo: ~100 g/m² es HVI en mujer y normal en hombre', `
  function geo(sexo) { __t.limpiar(); ${BSA2} __t.set('sexo', sexo);
    __t.set('ddfvi','50'); __t.set('siv','11.5'); __t.set('ppvi','10'); __t.set('fevi','60');
    return { cap: __t.txt('geom-val'), suma: __t.informe().suma, masa: __t.txt('devereux-val') }; }
  const h = geo('M'), m = geo('F');
  /* La capsula de masa concatena el numero y la etiqueta —«100 g/m² Normal» / «100 g/m² HVI»—,
     asi que se compara el NUMERO: la etiqueta es justamente lo que tiene que diferir. */
  return { extra: [
    ['la masa indexada es la misma en ambos', parseFloat(h.masa) === parseFloat(m.masa)],
    ['en hombre no es HVI (corte 115)', !/HVI/.test(h.cap) && h.suma.indexOf('HVI') === -1],
    ['en mujer si es HVI (corte 95)',   /HVI/.test(m.cap)  && m.suma.indexOf('HVI') > -1]
  ] };
`);

// ═══ GRUPO 11 — Funcion diastolica ══════════════════════════════════════════════════════════
/* Sin e' cargada el informe pide el dato en vez de clasificar. Es una compuerta, no un default:
   un «funcion diastolica normal» de fabrica seria una afirmacion sobre algo que nadie midio. */
caso('TC-27', "Sin e' la diastolica no se clasifica, se pide el dato", `
  __t.limpiar(); __t.set('fevi','60');
  const r = __t.informe();
  return { inf: r.inf,
    debe: ["Completar e' septal y/o lateral para clasificar."],
    noDebe: ['Función diastólica normal', 'Disfunción diastólica'] };
`);

caso('TC-28', "Diastolica normal: e' conservada, 0/3 parametros positivos", `
  __t.limpiar(); ${BSA2} __t.set('fevi','60');
  __t.set('onda_e','70'); __t.set('onda_a','70'); __t.set('e_sep','10'); __t.set('e_lat','13');
  __t.set('ai_vol','40'); __t.set('vmax_it','2.0');
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['Función diastólica normal', '(0/3 parámetros positivos)'],
    noSuma: ['Disfunción diastólica'] };
`);

caso('TC-29', 'Disfuncion diastolica grado II (pseudonormal) con presion de llenado elevada', `
  __t.limpiar(); ${BSA2} __t.set('fevi','60');
  __t.set('onda_e','90'); __t.set('onda_a','60'); __t.set('e_sep','5'); __t.set('e_lat','7');
  __t.set('ai_vol','80'); __t.set('vmax_it','2.5');
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['Disfunción diastólica grado II (patrón pseudonormal)', 'presión de llenado elevada'],
    debeSuma: ['Disfunción diastólica grado II — presión de llenado elevada.'] };
`);

// ═══ GRUPO 12 — Auriculas ═══════════════════════════════════════════════════════════════════
/* UMBRAL_LAVI_DILATADO = 34, y despues 41 y 48. Con BSA 2,00 el volumen en ml es el doble del
   indexado, asi que 68 ml es exactamente 34,0 ml/m². */
caso('TC-30', 'AI por volumen indexado: las cuatro bandas en sus cortes exactos', `
  function ai(vol) { __t.limpiar(); ${BSA2} __t.set('ai_vol', String(vol)); return __t.informe(); }
  const r = [68, 70, 84, 98].map(ai);
  return { extra: [
    ['LAVI 34.0 normal',              /Aurícula izquierda de dimensiones normales \\(Vol Index 34.0 ml\\/m²\\)/.test(r[0].inf)],
    ['LAVI 34.0 no va al EN SUMA',    r[0].suma.indexOf('AI ') === -1],
    ['LAVI 35.0 levemente dilatada',  r[1].suma.indexOf('AI levemente dilatada (Vol Index 35.0 ml/m²).') > -1],
    ['LAVI 42.0 moderadamente dilatada', r[2].suma.indexOf('AI moderadamente dilatada (Vol Index 42.0 ml/m²).') > -1],
    ['LAVI 49.0 severamente dilatada',   r[3].suma.indexOf('AI severamente dilatada (Vol Index 49.0 ml/m²).') > -1]
  ] };
`);

caso('TC-31', 'AI por diametro AP cuando no hay volumen: 38 / 40 / 45', `
  function ai(d) { __t.limpiar(); __t.set('ai_diam', String(d)); return __t.informe().inf; }
  return { extra: [
    ['38 mm normal',            /Aurícula izquierda de dimensiones normales \\(diámetro AP 38 mm\\)/.test(ai(38))],
    ['40 mm levemente dilatada',/Aurícula izquierda levemente dilatada \\(diámetro AP 40 mm\\)/.test(ai(40))],
    ['45 mm dilatada',          /Aurícula izquierda dilatada \\(diámetro AP 45 mm\\)/.test(ai(45))]
  ] };
`);

/* El volumen MANDA sobre el diametro: cargados los dos, la rama del diametro ni se evalua
   (`if (ai_vol && bsa) ... else if (ai_diam)`). Si algun dia se invierte, este test lo dice. */
caso('TC-32', 'Con volumen Y diametro cargados manda el volumen', `
  __t.limpiar(); ${BSA2} __t.set('ai_vol','98'); __t.set('ai_diam','30');
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['Vol Index 49.0 ml/m²'], noDebe: ['diámetro AP'],
    debeSuma: ['AI severamente dilatada'] };
`);

/* UMBRAL_AD_AREA_NORMAL = 18: corte estricto `> 18`. */
caso('TC-33', 'AD area 18 normal / 19 dilatada, y sin area no se valora', `
  __t.limpiar(); __t.set('ad_area','18'); const a = __t.informe();
  __t.limpiar(); __t.set('ad_area','19'); const b = __t.informe();
  __t.limpiar();                          const c = __t.informe();
  return { extra: [
    ['18 cm² normal',       /Aurícula derecha de dimensiones normales \\(área 18 cm²\\)/.test(a.inf)],
    ['18 cm² no va al EN SUMA', a.suma.indexOf('AD dilatada') === -1],
    ['19 cm² dilatada',     /Aurícula derecha dilatada \\(área 19 cm²\\)/.test(b.inf)],
    ['19 cm² va al EN SUMA', b.suma.indexOf('AD dilatada (área 19 cm²).') > -1],
    ['sin area: no valorada, no normal', c.inf.indexOf('Aurícula derecha no valorada.') > -1]
  ] };
`);

// ═══ GRUPO 13 — Ventriculo derecho: los tres diametros ══════════════════════════════════════
/* El basal tiene TRES bandas (<=41 normal, <=45 leve, >45 dilatado); el medio y el longitudinal
   son binarios (VD_MID_NORMAL_MAX 35, VD_LONG_NORMAL_MAX 86). Son los cortes que decidian si el
   VD aparecia o no en el informe firmado. */
caso('TC-34', 'VD basal: 41 normal / 42 leve / 45 leve / 46 dilatado', `
  function vd(mm) { __t.limpiar(); __t.set('vd_bas', String(mm)); __t.set('tapse','22'); return __t.informe(); }
  const r = [41, 42, 45, 46].map(vd);
  return { extra: [
    ['41 mm normal',         /Ventrículo derecho de dimensiones normales/.test(r[0].inf) && r[0].suma.indexOf('VD ') === -1],
    ['42 mm levemente dilatado', r[1].suma.indexOf('VD levemente dilatado') > -1],
    ['45 mm sigue leve',     r[2].suma.indexOf('VD levemente dilatado') > -1],
    ['46 mm dilatado',       r[3].suma.indexOf('VD dilatado') > -1 && r[3].suma.indexOf('levemente') === -1]
  ] };
`);

caso('TC-35', 'VD medio 35 normal / 36 dilatado, y VD longitudinal 86 normal / 87 dilatado', `
  function solo(id, mm) { __t.limpiar(); __t.set(id, String(mm)); return __t.informe(); }
  const m0 = solo('vd_mid', 35), m1 = solo('vd_mid', 36);
  const l0 = solo('vd_long', 86), l1 = solo('vd_long', 87);
  return { extra: [
    ['medio 35 normal',        m0.suma.indexOf('VD dilatado') === -1],
    ['medio 36 dilatado',      m1.suma.indexOf('VD dilatado.') > -1 && /medio 36 mm/.test(m1.inf)],
    ['longitudinal 86 normal', l0.suma.indexOf('VD dilatado') === -1],
    ['longitudinal 87 dilatado', l1.suma.indexOf('VD dilatado.') > -1 && /longitudinal 87 mm/.test(l1.inf)]
  ] };
`);

/* TAPSE < 17 (UMBRAL_TAPSE_NORMAL) y S' < 9,5 son disfuncion. Con el VD de tamano normal el
   informe tiene que decir las DOS cosas: dimensiones normales Y disfuncion. */
caso('TC-36', "TAPSE 17 / 16 y S' 9.5 / 9.4 — los cortes de disfuncion del VD", `
  function f(id, val) { __t.limpiar(); __t.set('vd_bas','35'); __t.set(id, String(val)); return __t.informe(); }
  const t0 = f('tapse', 17), t1 = f('tapse', 16), s0 = f('s_prime', 9.5), s1 = f('s_prime', 9.4);
  return { extra: [
    ['TAPSE 17 conservada', /función sistólica conservada/.test(t0.inf)],
    ['TAPSE 16 disfuncion', /con disfunción sistólica/.test(t1.inf) &&
                            t1.suma.indexOf('VD de dimensiones normales con disfunción sistólica.') > -1],
    ["S' 9.5 conservada",   /función sistólica conservada/.test(s0.inf)],
    ["S' 9.4 disfuncion",   /con disfunción sistólica/.test(s1.inf)]
  ] };
`);

/* FAC = (areaD - areaS) / areaD x 100, REDONDEADA. UMBRAL_FAC_VD_NORMAL 35, SEVERA 25. */
caso('TC-37', 'FAC del VD: 35 normal / 34 disfuncion / 24 severa', `
  function fac(d, s) { __t.limpiar(); __t.set('vd_area_d', String(d)); __t.set('vd_area_s', String(s));
    return { fac: __t.val('vd_fac'), r: __t.informe() }; }
  const a = fac(20, 13), b = fac(20, 13.2), c = fac(20, 15.2);
  return { extra: [
    ['FAC 35 %',        a.fac === '35' && /función sistólica conservada/.test(a.r.inf)],
    ['FAC 34 disfuncion', b.fac === '34' && /con disfunción sistólica/.test(b.r.inf)],
    ['FAC 24 severa',   c.fac === '24' &&
                        c.r.suma.indexOf('Disfunción sistólica severa del VD (FAC 24%).') > -1],
    ['FAC 34 NO es severa', b.r.suma.indexOf('severa del VD') === -1]
  ] };
`);

/* LECCION 6 del 2026-09-14: se clasifica el numero que se IMPRIME. Con areaD 20 / areaS 13,1 el
   FAC crudo es 34,5 —banda de disfuncion— y el redondeado 35 —banda normal—. El informe publica
   35, asi que tiene que decir «conservada». Si algun dia clasifica el crudo, la capsula y el
   informe vuelven a contradecirse dentro del mismo estudio. */
caso('TC-38', 'FAC 34.5 se publica 35 y se clasifica como 35, no como 34.5', `
  __t.limpiar(); __t.set('vd_area_d','20'); __t.set('vd_area_s','13.1');
  const r = __t.informe();
  return { inf: r.inf,
    debe: ['FAC 35%', 'función sistólica conservada'],
    noDebe: ['FAC 34.5'],
    extra: [['el campo guarda el redondeado', __t.val('vd_fac') === '35'],
            ['la capsula clasifica el mismo numero', /35% — normal/.test(__t.txt('fac-interp') || '')]] };
`);

// ═══ GRUPO 14 — Aorta toracica, los cinco segmentos ═════════════════════════════════════════
/* Umbrales unificados ESC 2021, uno por segmento. `diam_cayado` y `diam_ao_toracica` estuvieron
   meses en pantalla sin llegar a ningun lado: estos dos casos son su red. */
caso('TC-39', 'Aorta: cada segmento dilatado llega al narrativo Y al EN SUMA', `
  __t.limpiar();
  __t.set('ao_sin','44'); __t.set('ao_st','40'); __t.set('ao_tub','47');
  __t.set('diam_cayado','44'); __t.set('diam_ao_toracica','40');
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['Raíz aórtica 44 mm (levemente dilatada)', 'Unión sinotubular 40 mm (levemente dilatada)',
           'Aorta ascendente 47 mm (moderadamente dilatada)', 'Cayado aórtico 44 mm (levemente dilatado)',
           'Ao torácica descendente 40 mm (levemente dilatada)'],
    debeSuma: ['Dilatación raíz aórtica (44 mm).', 'Dilatación unión sinotubular (40 mm).',
               'Dilatación aorta ascendente (47 mm).', 'Dilatación cayado aórtico (44 mm).',
               'Dilatación aorta torácica descendente (40 mm).'] };
`);

caso('TC-40', 'Cayado y aorta descendente solos, sin ningun otro segmento cargado', `
  __t.limpiar(); __t.set('diam_cayado','50'); const a = __t.informe();
  __t.limpiar(); __t.set('diam_ao_toracica','44'); const b = __t.informe();
  return { extra: [
    ['el cayado solo sale',      /Aorta torácica: Cayado aórtico 50 mm \\(moderadamente dilatado\\)/.test(a.inf)],
    ['el cayado solo va al EN SUMA', a.suma.indexOf('Dilatación cayado aórtico (50 mm).') > -1],
    ['la descendente sola sale', /Ao torácica descendente 44 mm \\(moderadamente dilatada\\)/.test(b.inf)],
    ['la descendente va al EN SUMA', b.suma.indexOf('Dilatación aorta torácica descendente (44 mm).') > -1]
  ] };
`);

/* Sin un solo segmento medido la aorta NO se nombra. Afirmar «de calibre normal» sobre lo que
   nadie midio es la otra mitad de la regla: publicar lo medido, callar lo no medido. */
caso('TC-41', 'Aorta sin medir: silencio. Aorta medida y normal: se publica.', `
  __t.limpiar(); const a = __t.informe();
  __t.limpiar(); __t.set('ao_sin','36'); __t.set('ao_tub','34'); const b = __t.informe();
  return { extra: [
    ['sin medir no se nombra', a.inf.indexOf('Aorta torácica') === -1],
    ['medida y normal se publica',
      b.inf.indexOf('Aorta torácica de calibre normal (Raíz aórtica 36 mm, Aorta ascendente 34 mm).') > -1],
    ['normal no va al EN SUMA', b.suma.indexOf('Dilatación') === -1]
  ] };
`);

// ═══ GRUPO 15 — Valvula mitral ══════════════════════════════════════════════════════════════
/* AVm por THP = 220 / THP. El corte de severa es 1,5 cm², o sea THP 146,7 ms. */
caso('TC-42', 'EM por THP: 220/THP, y el corte de severa en AVm 1.5', `
  function thp(ms) { __t.limpiar(); __t.set('thp', String(ms));
    return { avm: __t.val('avm_thp'), suma: __t.informe().suma }; }
  const a = thp(140), b = thp(150);
  return { extra: [
    ['THP 140 -> AVm 1.57',    a.avm === '1.57'],
    ['AVm 1.57 es moderada',   a.suma.indexOf('EM moderada.') > -1],
    ['THP 150 -> AVm 1.47',    b.avm === '1.47'],
    ['AVm 1.47 es severa',     b.suma.indexOf('EM severa.') > -1]
  ] };
`);

caso('TC-43', 'EM por planimetria 1.2 cm²: severa, con AVm indexada', `
  __t.limpiar(); ${BSA2} __t.set('avm_plan','1.2');
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['con estenosis severa'], debeSuma: ['EM severa.'],
    extra: [['AVm indexada = 1.2 / 2.00', (__t.val('avm_idx') || '').indexOf('0.60') > -1]] };
`);

/* Wilkins: <=8 favorable, 9-11 suboptimo, >=12 no favorable. El total se pinta sobre 16. */
caso('TC-44', 'Score de Wilkins: 6 favorable / 13 no favorable', `
  function w(a,b,c,d) { __t.limpiar();
    __t.set('wilkins_movilidad',a); __t.set('wilkins_engrosamiento',b);
    __t.set('wilkins_calcificacion',c); __t.set('wilkins_subvalvular',d);
    return { total: __t.txt('wilkins-total'), interp: __t.txt('wilkins-interp') }; }
  const f = w(1,1,2,2), n = w(4,3,3,3);
  return { extra: [
    ['6/16 favorable',    f.total === '6 / 16' && f.interp.indexOf('Favorable para valvuloplastia percutánea') > -1],
    ['13/16 no favorable', n.total === '13 / 16' && n.interp.indexOf('No favorable para valvuloplastia') > -1]
  ] };
`);

/* La votacion de `calcIM_ESC`: cada parametro vota una banda y el veredicto sale de la mayoria.
   UN SOLO criterio severo NO alcanza para «severa» —cae al `else` con «Moderada — evaluar
   integrado»—: son necesarios dos severos, o uno severo y uno moderado. Es la evaluacion
   integrada de la ESC y es deliberada; la primera version de este test daba por hecho que una
   vena contracta de 8 mm bastaba, y la habria congelado al reves. */
caso('TC-45', 'IM: la vena contracta sola no puede declarar severa — hacen falta dos criterios', `
  function im(campos) { __t.limpiar();
    Object.keys(campos).forEach(k => __t.set(k, String(campos[k])));
    return { g: __t.val('im_grado'), r: __t.informe() }; }
  const leve = im({ im_vc: 2 }), mod = im({ im_vc: 5 }), solaSev = im({ im_vc: 8 });
  const dosSev = im({ im_vc: 8, im_onda_s: 'invertida' });
  return { extra: [
    ['VC 2 -> grado 1 leve',  leve.g === '1' && leve.r.suma.indexOf('IM leve.') > -1],
    ['VC 5 -> moderada',      mod.r.suma.indexOf('IM moderada.') > -1],
    ['VC 8 SOLA no llega a severa', solaSev.g !== '4' && solaSev.r.suma.indexOf('IM severa.') === -1],
    ['VC 8 + onda S invertida -> severa',
      dosSev.g === '4' && dosSev.r.suma.indexOf('IM severa.') > -1],
    ['y el narrativo acompana', /con insuficiencia severa/.test(dosSev.r.inf)]
  ] };
`);

// ═══ GRUPO 16 — Valvula aortica ═════════════════════════════════════════════════════════════
caso('TC-46', 'Esclerosis aortica: se informa, sin afirmar estenosis', `
  __t.limpiar(); __t.set('ea_grado','esclerosis');
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['con esclerosis valvular, sin estenosis significativa ni insuficiencia'],
    debeSuma: ['Esclerosis aórtica.'],
    noSuma: ['EAo'] };
`);

/* AVA por continuidad = pi*(d/20)² * ITV TSVI / ITV Ao. Con d 20 e ITV TSVI 18 el numerador es
   56,5: ITV Ao 47 da AVA 1,20 (moderada) y 71 da 0,80 (severa). */
caso('TC-47', 'EAo moderada concordante: AVA 1.20 con Vmax 3.5 y Gmedio 30', `
  __t.limpiar(); ${BSA2}
  __t.set('diam_tsvi','20'); __t.set('itv_tsvi','18'); __t.set('itv_ao','47');
  __t.set('vmax_ao','3.5'); __t.set('gmedio_ao','30'); __t.set('fevi','60');
  __t.set('ea_grado','moderada');
  const e = eaEscenario(); const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['con estenosis moderada', 'AVA 1.20 cm²'],
    debeSuma: ['EAo moderada.'],
    noDebe: ['bajo flujo', 'paradojal'],
    extra: [['el escenario es moderada', e.clave === 'moderada' && e.esperado === 'moderada'],
            ['sin discordancia de grado', e.discordanciaGrado === false]] };
`);

/* DOS FUENTES DE VERDAD: manda `ea_grado` (lo que fija el medico) y el algoritmo aporta el
   subtipo. Cuando se contradicen el informe lo DICE, no elige por su cuenta. */
caso('TC-48', 'EAo: grado consignado «leve» contra mediciones severas — se publica la discrepancia', `
  __t.limpiar(); ${BSA2}
  __t.set('diam_tsvi','20'); __t.set('itv_tsvi','18'); __t.set('itv_ao','71');
  __t.set('vmax_ao','4.5'); __t.set('gmedio_ao','45'); __t.set('fevi','65');
  __t.set('ea_grado','leve');
  const e = eaEscenario(); const r = __t.informe();
  return { suma: r.suma,
    debeSuma: ['EAo: el grado consignado (leve) no coincide con las mediciones (corresponderían severa) - revisar.'],
    extra: [['el algoritmo marca la discordancia', e.discordanciaGrado === true],
            ['el grado que manda es el consignado', e.grado === 'leve'],
            ['lo esperado por mediciones es severa', e.esperado === 'severa']] };
`);

// ═══ GRUPO 17 — Tricuspide y pulmonar ═══════════════════════════════════════════════════════
/* TAP (tiempo de aceleracion pulmonar) < 105 ms: elemento indirecto de HTP. Es la unica via a
   una linea de HTP en el EN SUMA cuando NO hay IT medible. */
caso('TC-49', 'TAP < 105 ms sin IT: elementos indirectos de HTP, sin inventar PSAP', `
  __t.limpiar(); __t.set('tvia','90');
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['No se obtiene valor de PSAP por ausencia de insuficiencia tricuspídea valorable',
           'elementos indirectos de hipertensión pulmonar dado por TAP < 105 ms'],
    debeSuma: ['Elementos indirectos de hipertensión pulmonar (TAP < 105 ms), sin PSAP estimable.'] };
`);

caso('TC-50', 'IT con PSAP: la PSAP alta sube al EN SUMA', `
  __t.limpiar(); __t.set('it_vc','9');
  __t.set('vci_diam','23'); __t.set('vci_col','<50'); __t.set('vmax_it','3.5');
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['PSAP estimada de 64 mmHg (PmAD 15 mmHg)'],
    debeSuma: ['PSAP estimada 64 mmHg.'],
    extra: [['PSAP = 4·3.5² + 15', __t.val('psap_calc') === '64']] };
`);

/* epGradoPorGmax: <9 normal, <36 leve, <=64 moderada, >64 severa. Los cuatro cortes. */
caso('TC-51', 'Estenosis pulmonar: las cuatro bandas de Gmax en sus cortes', `
  function ep(vmax) { __t.limpiar(); __t.set('vp_vmax', String(vmax));
    return { g: __t.val('vp_gmax'), r: __t.informe() }; }
  const a = ep(1.4), b = ep(1.6), c = ep(3.1), d = ep(4.0), e = ep(4.1);
  return { extra: [
    ['Gmax 7.8 normal',    a.g === '7.8'  && /Válvula pulmonar normal/.test(a.r.inf) && a.r.suma.indexOf('VP -') === -1],
    ['Gmax 10.2 leve',     b.g === '10.2' && b.r.suma.indexOf('VP - Estenosis leve.') > -1],
    ['Gmax 38.4 moderada', c.g === '38.4' && c.r.suma.indexOf('VP - Estenosis moderada.') > -1],
    ['Gmax 64 sigue moderada (corte <=64)', d.g === '64' && d.r.suma.indexOf('VP - Estenosis moderada.') > -1],
    ['Gmax 67.2 severa',   e.g === '67.2' && e.r.suma.indexOf('VP - Estenosis severa.') > -1]
  ] };
`);

// ═══ GRUPO 18 — Hemodinamica: PmAD, VEXUS, TEP, HTP ═════════════════════════════════════════
/* La tabla de PmAD segun VCI: las CUATRO combinaciones de diametro x colapso. De este numero
   cuelga toda la PSAP del informe. */
caso('TC-52', 'PmAD segun VCI: las cuatro combinaciones (3 / 8 / 8 / 15 mmHg)', `
  function pmad(d, col) { __t.limpiar(); __t.set('vci_diam', d); __t.set('vci_col', col);
    return __t.val('pmad'); }
  return { extra: [
    ['VCI <21 con colapso >50% -> 3',  pmad('18','>50') === '3'],
    ['VCI <21 con colapso <50% -> 8',  pmad('18','<50') === '8'],
    ['VCI >=21 con colapso >50% -> 8', pmad('25','>50') === '8'],
    ['VCI >=21 con colapso <50% -> 15', pmad('25','<50') === '15']
  ] };
`);

/* VEXUS: con VCI < 20 mm el grado es 0 AUNQUE los tres vasos sean severos — es la regla del
   protocolo, no un bug. Y sin VCI medida no hay grado, ni siquiera 0. */
caso('TC-53', 'VEXUS: grado 3 con dos vasos severos, 0 si la VCI mide menos de 20', `
  __t.limpiar(); __t.set('vci_diam','25');
  __t.set('vexus_sh','2'); __t.set('vexus_pv','2'); __t.set('vexus_ir','1');
  const a = vexusEstado(); const txt = amiloTextoVEXUS();
  __t.limpiar(); __t.set('vci_diam','18');
  __t.set('vexus_sh','2'); __t.set('vexus_pv','2'); __t.set('vexus_ir','2');
  const b = vexusEstado();
  return { extra: [
    ['VCI 25 con 2 severos -> VEXUS 3', a.score === 3 && a.evaluados === 3],
    ['la hoja lo dice',  txt.indexOf('VEXUS 3 | 2 severos de 3 vasos evaluados') > -1],
    ['la hoja da la conducta', txt.indexOf('Congestión venosa severa') > -1],
    ['VCI 18 con 3 severos -> VEXUS 0', b.score === 0]
  ] };
`);

caso('TC-54', 'VEXUS sin VCI medida: no se informa grado, ni siquiera 0', `
  __t.limpiar(); __t.set('vexus_sh','2'); __t.set('vexus_pv','2');
  const st = vexusEstado(); const txt = amiloTextoVEXUS();
  return { extra: [
    ['sin VCI no hay score', st === null || st.score === null],
    ['la hoja lo explica',   txt.indexOf('Protocolo VEXUS no aplicado') > -1],
    ['no aparece un VEXUS 0 inventado', txt.indexOf('VEXUS 0 |') === -1]
  ] };
`);

/* TEP: con un criterio en «No evaluado» NO se emite conclusion. Un score parcial presentado
   como total es peor que no tenerlo: un 2/7 con tres sin mirar se lee como bajo riesgo. */
caso('TC-55', 'TEP: cinco criterios positivos dan alta probabilidad; uno sin evaluar no concluye', `
  __t.limpiar();
  __t.set('tapse','14'); __t.set('vd_bas','45'); __t.set('ddfvi','40');
  __t.set('vci_diam','23'); __t.set('vci_col','<50'); __t.set('vmax_it','3.5');
  __t.set('tep_mcconnell','si'); __t.set('tep_signo6060','si'); __t.set('tep_tabique_d','no');
  const score = __t.txt('tep-score'), interp = __t.txt('tep-interpretacion');
  __t.set('tep_mcconnell','ne');
  const interpNE = __t.txt('tep-interpretacion');
  return { extra: [
    ['score 5/5', score.indexOf('5/5') > -1],
    ['alta probabilidad', interp.indexOf('Disfunción VD severa — alta probabilidad de TEP/HTP aguda') > -1],
    ['con uno sin evaluar no concluye', interpNE.indexOf('Completá todos los criterios') > -1],
    ['y el score se borra',             __t.txt('tep-score').indexOf('5') === -1]
  ] };
`);

caso('TC-56', 'HTP ESC 2022: VRT alta + un signo = probabilidad ALTA', `
  __t.limpiar(); __t.set('htp2022_vrt','alta'); __t.chk('htp2022_a3', true);
  const alta = __t.txt('htp2022-prob');
  __t.limpiar(); __t.set('htp2022_vrt','baja');
  const baja = __t.txt('htp2022-prob');
  return { extra: [
    ['VRT >3.4 con signo -> ALTA', alta.indexOf('Probabilidad ALTA') > -1],
    ['VRT <2.8 sin signos no da alta', baja.indexOf('ALTA') === -1]
  ] };
`);

// ═══ GRUPO 19 — HFA-PEFF ════════════════════════════════════════════════════════════════════
/* Los umbrales de NT-proBNP son los de Pieske 2019: ritmo sinusal mayor >220 y menor 125-220;
   FA mayor >660 y menor 375-660.

   EL VALOR 370 ES EL QUE IMPORTA. El piso de FA ya se bajo a 365 una vez, de memoria, con un
   comentario nuevo que contradecia al que estaba dos lineas mas abajo. Una bateria con 300 y 400
   pasa IGUAL con 375 que con 365 —los dos caen del mismo lado de ambos— y no habria dicho nada:
   verificado moviendo el umbral a 365 en una copia, el caso seguia verde.
   370 cae ENTRE los dos: con 375 vale 0 puntos, con 365 vale 1. Es el unico valor que separa el
   umbral correcto del que ya se colo. */
caso('TC-57', 'HFA-PEFF: umbrales de NT-proBNP en ritmo sinusal y en FA (Pieske 2019)', `
  function biom(ritmo, nt) { __t.limpiar(); ${BSA2}
    __t.set('edad','70'); __t.set('fevi','60'); __t.set('hf_ritmo', ritmo); __t.set('hf_ntprobnp', String(nt));
    return hfapeffScore(false).hum.pts; }
  return { extra: [
    ['sinusal 100 -> 0 pts',  biom('sinusal', 100) === 0],
    ['sinusal 150 -> 1 pt (menor 125-220)', biom('sinusal', 150) === 1],
    ['sinusal 300 -> 2 pts (mayor >220)',   biom('sinusal', 300) === 2],
    ['FA 300 -> 0 pts (por debajo de 375)', biom('fa', 300) === 0],
    ['FA 370 -> 0 pts — el piso es 375, NO 365', biom('fa', 370) === 0],
    ['FA 400 -> 1 pt (menor 375-660)',      biom('fa', 400) === 1],
    ['FA 660 -> sigue siendo menor (mayor es >660)', biom('fa', 660) === 1],
    ['FA 700 -> 2 pts (mayor >660)',        biom('fa', 700) === 2]
  ] };
`);

caso('TC-58', 'HFA-PEFF: 0/6 es probabilidad baja, 4/6 intermedia', `
  __t.limpiar(); ${BSA2}
  __t.set('edad','60'); __t.set('fevi','60'); __t.set('onda_e','60');
  __t.set('e_sep','10'); __t.set('e_lat','13'); __t.set('ai_vol','40');
  __t.set('ddfvi','45'); __t.set('siv','9'); __t.set('ppvi','9');
  __t.set('vmax_it','2.0'); __t.set('hf_ntprobnp','50');
  const bajo = hfapeffScore(false);
  __t.limpiar(); ${BSA2}
  __t.set('edad','70'); __t.set('fevi','60'); __t.set('onda_e','90');
  __t.set('e_sep','6'); __t.set('e_lat','8'); __t.set('ai_vol','60');
  __t.set('ddfvi','45'); __t.set('siv','10'); __t.set('ppvi','10');
  __t.set('vmax_it','2.5'); __t.set('hf_ntprobnp','150');
  const medio = hfapeffScore(false);
  return { extra: [
    ['0/6 total',     bajo.total === 0],
    ['0/6 conclusion', hfapeffConclusion(bajo).indexOf('probabilidad baja de HFpEF') > -1],
    ['4/6 total',     medio.total === 4],
    ['4/6 conclusion', hfapeffConclusion(medio).indexOf('probabilidad intermedia de HFpEF') > -1],
    ['4/6 pide confirmacion', hfapeffConclusion(medio).indexOf('cateterismo cardíaco derecho') > -1]
  ] };
`);

// ═══ GRUPO 20 — Pericardio ══════════════════════════════════════════════════════════════════
/* Taponamiento pide los TRES criterios cumplidos. Con dos cumplidos y uno sin evaluar la
   conclusion es «incipiente» y ademas DICE cual falto: negar exige evidencia de haber buscado. */
caso('TC-59', 'Taponamiento: tres criterios cumplidos; con uno sin evaluar es incipiente', `
  __t.limpiar();
  __t.set('pericardio','Derrame severo (>20mm)'); __t.set('dpt_col_vd','si'); __t.set('dpt_col_ad','si');
  __t.set('resp_var_mitral','30'); __t.set('vci_diam','25'); __t.set('vci_col','<50');
  const tap = dptEstado().clave, txtTap = amiloTextoDPT();
  __t.limpiar();
  __t.set('pericardio','Derrame severo (>20mm)'); __t.set('dpt_col_vd','si'); __t.set('dpt_col_ad','si');
  __t.set('resp_var_mitral','30');
  const inc = dptEstado().clave, txtInc = amiloTextoDPT();
  return { extra: [
    ['con VCI pletorica -> taponamiento', tap === 'taponamiento'],
    ['la hoja lo afirma', txtTap.indexOf('Se cumplen los tres criterios ecocardiográficos de taponamiento') > -1],
    ['sin VCI -> incipiente, no taponamiento', inc === 'incipiente'],
    ['y declara lo no evaluado', txtInc.indexOf('No se evaluó: plétora de VCI sin colapso.') > -1],
    ['la salvedad clinica viaja', txtTap.indexOf('El diagnóstico de taponamiento es clínico-ecocardiográfico') > -1]
  ] };
`);

caso('TC-60', 'Constriccion vs restriccion: los dos veredictos opuestos', `
  __t.limpiar();
  __t.set('e_sep','9'); __t.set('e_lat','8'); __t.set('onda_e','90');
  __t.set('resp_var_mitral','30'); __t.set('resp_var_tric','50');
  __t.set('cvr_rebote','si'); __t.set('cvr_hepatico','esp'); __t.set('cvr_pericardio_tc','engrosado');
  const c = cvrEstado().clave, txtC = amiloTextoCVR();
  __t.limpiar();
  __t.set('e_sep','4'); __t.set('e_lat','5'); __t.set('onda_e','110');
  __t.set('resp_var_mitral','8'); __t.set('resp_var_tric','15');
  __t.set('cvr_rebote','no'); __t.set('cvr_hepatico','insp'); __t.set('cvr_pericardio_tc','normal');
  const r = cvrEstado().clave, txtR = amiloTextoCVR();
  return { extra: [
    ['constrictiva', c === 'constrictiva'],
    ['la hoja nombra el annulus reversus', txtC.indexOf('annulus reversus') > -1],
    ['restrictiva', r === 'restrictiva'],
    ['la hoja la nombra', txtR.indexOf('compatibles con miocardiopatía restrictiva') > -1],
    ['y manda a RMC',     txtR.indexOf('Considerar RMC con gadolinio') > -1]
  ] };
`);

// ═══ GRUPO 21 — Congenitas ══════════════════════════════════════════════════════════════════
/* Los modulos de congenitas y del ETE tienen compuerta de CHECKBOX: sin tildar «Integrar al
   informe», el parrafo no sale. Es la mitad del contrato que mas se rompe al refactorizar. */
caso('TC-61', 'CIA: sale al informe solo con el checkbox tildado', `
  __t.limpiar();
  __t.set('ete_cia_tipo','secundum'); __t.set('ete_cia_tam_max','18'); __t.set('ete_cia_tam_min','14');
  __t.set('ete_cia_dir','id'); __t.set('ete_cia_borde_ao','3');
  const sin = __t.informe();
  __t.chk('ete_shunt_incluir_chk', true);
  const con = __t.informe();
  return { extra: [
    ['sin tildar no sale',  sin.inf.indexOf('CIA') === -1],
    ['tildado sale',        con.inf.indexOf('CIA tipo ostium secundum. Tamaño 18 × 14 mm.') > -1],
    ['con el borde minimo', con.inf.indexOf('Borde mínimo 3 mm (aórtico).') > -1],
    ['y la direccion',      con.inf.indexOf('Shunt de izquierda a derecha.') > -1],
    ['EN SUMA con encabezado', con.suma.indexOf('Cardiopatías congénitas y miocardiopatías genéticas:') > -1],
    ['EN SUMA conciso',     con.suma.indexOf('CIA ostium secundum 18×14 mm — borde aórtico de 3 mm.') > -1]
  ] };
`);

/* El gradiente de la CIV es Bernoulli sobre la velocidad del jet: 4·4,5² = 81 mmHg. Y la PAPs
   estimada por CIV es PAS - gradiente: 90 - 81 = 9. */
caso('TC-62', 'CIV: gradiente pico 4·V² y PAPs estimada por diferencia', `
  __t.limpiar();
  __t.set('ete_civ_tipo','perimembranosa'); __t.set('ete_civ_tam','4');
  __t.set('ete_civ_vel','4.5'); __t.set('ete_civ_pas','90');
  __t.chk('ete_shunt_incluir_chk', true);
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['Gradiente pico 81 mmHg (V 4.5 m/s).', 'PAPs estimada por CIV 9 mmHg.'],
    debeSuma: ['CIV perimembranosa 4 mm — gradiente 81 mmHg.'] };
`);

caso('TC-63', 'MCH: espesor 17 mm es diagnostico; 13 mm solo con historia familiar', `
  __t.limpiar(); __t.set('mch_espesor','17'); __t.set('mch_grad_reposo','60'); __t.set('mch_cf','iii_iv');
  __t.chk('mch_incluir_chk', true);
  const a = __t.informe();
  __t.limpiar(); __t.set('mch_espesor','13'); __t.set('mch_fam_mch','si');
  __t.chk('mch_incluir_chk', true);
  const b = __t.informe();
  return { extra: [
    ['17 mm en rango diagnostico', a.inf.indexOf('en rango diagnóstico de miocardiopatía hipertrófica') > -1],
    ['gradiente 60 con CF III-IV manda a reduccion septal',
      a.inf.indexOf('umbral de reducción septal (miectomía o alcoholización)') > -1],
    ['EN SUMA con espesor y gradiente', a.suma.indexOf('MCH — espesor máx. 17 mm — gradiente TSVI 60 mmHg.') > -1],
    ['13 mm es diagnostico SOLO por el contexto familiar',
      b.inf.indexOf('en rango diagnóstico en el contexto de historia familiar') > -1]
  ] };
`);

/* El score HCM Risk-SCD no se publica si falta una sola de sus siete variables, y ENUMERA lo que
   falta. Una calculadora que trata «no consta» como «no» da un riesgo mas bajo del que es. */
caso('TC-64', 'MCH: el score HCM Risk-SCD no se publica incompleto, y dice que falta', `
  __t.limpiar(); __t.set('mch_espesor','17'); __t.set('mch_grad_reposo','60');
  __t.chk('mch_incluir_chk', true);
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['Score HCM Risk-SCD no calculado, faltan datos:', 'síncope inexplicado'],
    noDebe: ['riesgo de muerte súbita a 5 años'],
    debeSuma: ['HCM Risk-SCD no calculado, faltan 5 datos.'] };
`);

caso('TC-65', 'MCA: el puntaje Task Force declara el reparto por categoria', `
  __t.limpiar(); __t.set('mca_tsvd_plax','34'); __t.set('mca_mov_regional','aqui_disc');
  __t.chk('mca_incluir_chk', true);
  const r = __t.informe();
  return { inf: r.inf, suma: r.suma,
    debe: ['Estructural por ecocardiografía — mayor (2 puntos)',
           'un puntaje ecocardiográfico aislado no confirma ni descarta la enfermedad'],
    debeSuma: ['MCA — Task Force 2010 2 puntos (eco 2, resto 0) — diagnóstico posible.'] };
`);

caso('TC-66', 'VAB: aorta de 56 mm dispara la indicacion Clase I de la ESC 2024', `
  __t.limpiar(); __t.set('va_morf','Bicúspide'); __t.set('ao_tub','56');
  __t.chk('vab_incluir_chk', true);
  const r = __t.informe();
  return { suma: r.suma,
    debeSuma: ['Dilatación aorta ascendente (56 mm).', 'VAB — Ao ascendente 56 mm.'],
    extra: [['la conclusion es Clase I',
      (__t.txt('vab-concl') || '').indexOf('cirugía de la aorta indicada (ESC 2024, Clase I)') > -1]] };
`);

// ═══ GRUPO 22 — Amiloidosis ═════════════════════════════════════════════════════════════════
/* El criterio INDISPENSABLE del score ESC 2021 es HVI >= 12 mm. Por debajo, el score no es
   formalmente aplicable y la hoja tiene que decirlo en vez de publicar un numero. */
caso('TC-67', 'Amiloidosis: con HVI <12 mm el score ESC no es aplicable y la hoja lo dice', `
  __t.limpiar(); __t.set('ett-septo','10'); __t.set('ett-pp','10');
  const txt = amiloTextoETT();
  return { extra: [
    ['la capsula lo declara', (__t.txt('ett-hvi-badge') || '').indexOf('HVI <12mm — Score ESC no aplicable') > -1],
    ['la hoja lo declara',    txt.indexOf('HVI < 12 mm: el score ESC no es formalmente aplicable') > -1],
    ['y publica 0, no un score',  txt.indexOf('Score ESC 2021: 0 / 10 puntos') > -1]
  ] };
`);

/* Los criterios se marcan por click (`toggleCrit`), que es lo que hace el medico. Los hidden
   `ett-*` guardan PUNTOS, no mediciones: escribirles un valor medido inventa un score. */
caso('TC-68', 'Amiloidosis: score 9/10 con HVI cumplida y cuatro criterios marcados', `
  __t.limpiar(); __t.set('ett-septo','16'); __t.set('ett-pp','15');
  toggleCrit('crit-rwt','ett-rwt',3); toggleCrit('crit-ee','ett-ee',1);
  toggleCrit('crit-tapse','ett-tapse',2); toggleCrit('crit-apice','ett-apice',3);
  const txt = amiloTextoETT();
  return { extra: [
    ['el numero de pantalla es 9', __t.txt('ett-score-num') === '9'],
    ['la hoja publica 9/10',       txt.indexOf('Score ESC 2021: 9 / 10 puntos') > -1],
    ['el espesor maximo se declara', txt.indexOf('Espesor parietal máximo 16.0 mm') > -1],
    ['HVI cumplida',               txt.indexOf('HVI >= 12 mm presente, criterio cumplido') > -1],
    ['y avisa que fueron marcados sin valor numerico',
      txt.indexOf('(marcado por criterio clinico, sin valor numerico)') > -1]
  ] };
`);

// ═══ GRUPO 23 — Cardio-Oncologia ════════════════════════════════════════════════════════════
/* CO_UMBRAL_FEVI_CAIDA 10 pp, CO_UMBRAL_FEVI_ABS 50 %, CO_UMBRAL_GLS_REL 15 %. Cada grado de
   CTRCD de la ESC 2022 cambia la conducta oncologica: son los umbrales que suspenden un
   tratamiento. */
caso('TC-69', 'CTRCD por FEVI: severa, moderada, sub-umbral y sin toxicidad', `
  function tox(basal, actual) { __t.limpiar();
    __t.set('co_fevi_basal', String(basal)); __t.set('co_fevi_actual', String(actual));
    return (__t.txt('co-toxicidad-resultado') || '').replace(/\\s+/g,' '); }
  return { extra: [
    ['60 -> 35: SEVERA',   /nueva reduccion por debajo de 40.*cardiotoxicidad SEVERA \\(ESC 2022\\)/.test(tox(60,35))],
    ['60 -> 45: MODERADA', /FEVI 45% con caida de 15.0 pp — cardiotoxicidad MODERADA \\(ESC 2022\\)/.test(tox(60,45))],
    ['60 -> 52: bajo el umbral, vigilancia', /Caida FEVI 8.0 pp — por debajo del umbral de CTRCD; vigilancia estrecha/.test(tox(60,52))],
    ['60 -> 58: sin toxicidad', /Sin toxicidad detectada/.test(tox(60,58))]
  ] };
`);

/* Una caida de 10 pp sobre un basal YA por debajo de 40 no es la reduccion NUEVA que define la
   CTRCD severa. Llamarla severa borra la diferencia entre un corazon que se rompio ahora y uno
   que ya estaba roto. */
caso('TC-70', 'CTRCD: caida sobre un basal ya <40 no es «reduccion nueva»', `
  __t.limpiar(); __t.set('co_fevi_basal','35'); __t.set('co_fevi_actual','25');
  const t = (__t.txt('co-toxicidad-resultado') || '').replace(/\\s+/g,' ');
  return { extra: [
    ['lo llama empeoramiento', t.indexOf('empeoramiento significativo sobre disfuncion previa') > -1],
    ['y niega explicitamente la severa', t.indexOf('no configura la reduccion NUEVA') > -1],
    ['no dice SEVERA a secas', t.indexOf('cardiotoxicidad SEVERA') === -1]
  ] };
`);

caso('TC-71', 'CTRCD leve por GLS: caida relativa >=15 % con FEVI conservada', `
  function gls(basal, actual) { __t.limpiar();
    __t.set('co_fevi_basal','60'); __t.set('co_fevi_actual','58');
    __t.set('co_gls_basal', String(basal)); __t.set('co_gls_actual', String(actual));
    return (__t.txt('co-toxicidad-resultado') || '').replace(/\\s+/g,' '); }
  return { extra: [
    ['GLS -20 -> -16 (20 % relativo): LEVE',
      /caida relativa de GLS 20.0% — cardiotoxicidad LEVE asintomatica \\(ESC 2022\\)/.test(gls(-20,-16))],
    ['GLS -20 -> -18 (10 % relativo): sin toxicidad', /Sin toxicidad detectada/.test(gls(-20,-18))]
  ] };
`);

caso('TC-72', 'Cardio-onco: la hoja del PDF trae riesgo basal, funcion y conclusion', `
  __t.limpiar();
  __t.set('co_fevi_basal','60'); __t.set('co_fevi_actual','45');
  __t.set('co_gls_basal','-20'); __t.set('co_gls_actual','-15');
  const txt = amiloTextoCardioOnco();
  return { extra: [
    ['caida de FEVI en pp',      txt.indexOf('Caída de FEVI | 15.0 pp') > -1],
    ['caida relativa de GLS',    txt.indexOf('Caída relativa de GLS | 25.0 %') > -1],
    ['conclusion con el grado',  txt.indexOf('cardiotoxicidad MODERADA (ESC 2022)') > -1],
    ['la salvedad del score viaja', txt.indexOf('Score orientativo') > -1]
  ] };
`);

/* LOS UMBRALES DE CARDIO-ONCO ESTAN ESCRITOS DOS VECES. `calcCardioOnco` clasifica con literales
   propios (10 pp, 50 %, 15 % relativo) y las constantes `CO_UMBRAL_*` alimentan SOLO la leyenda
   del PDF y las lineas de referencia de la curva de evolucion. Hoy los dos juegos coinciden, asi
   que no hay error clinico — pero nada los ata: mover la constante redibuja la linea «basal
   -20pp» y reescribe la leyenda mientras el veredicto impreso al lado sigue marcando a los 10.
   Descubierto mutando la constante a 20 y viendo que NINGUN caso se ponia en rojo.
   Este caso ata las dos copias: verifica el VALOR de la constante y, en el mismo test, el punto
   exacto donde el clasificador cambia de banda. Mover una sola de las dos lo pone en rojo. */
caso('TC-88', 'Cardio-onco: la constante de la leyenda y el umbral que clasifica son el mismo numero', `
  function fevi(b, a) { __t.limpiar();
    __t.set('co_fevi_basal', String(b)); __t.set('co_fevi_actual', String(a));
    return (__t.txt('co-toxicidad-resultado') || '').replace(/\\s+/g, ' '); }
  function gls(gb, ga) { __t.limpiar();
    __t.set('co_fevi_basal','60'); __t.set('co_fevi_actual','58');
    __t.set('co_gls_basal', String(gb)); __t.set('co_gls_actual', String(ga));
    return (__t.txt('co-toxicidad-resultado') || '').replace(/\\s+/g, ' '); }
  return { extra: [
    ['la constante de caida de FEVI vale 10 pp',  CO_UMBRAL_FEVI_CAIDA === 10],
    ['la constante de FEVI absoluta vale 50 %',   CO_UMBRAL_FEVI_ABS === 50],
    ['la constante de GLS relativo vale 15 %',    CO_UMBRAL_GLS_REL === 15],
    ['con 9 pp el clasificador dice «por debajo del umbral»',
      fevi(60, 51).indexOf('por debajo del umbral de CTRCD') > -1],
    ['con 10 pp exactos ya cruza el umbral',
      fevi(60, 50).indexOf('Caida FEVI 10.0 pp con FEVI >= 50%') > -1],
    ['con 14 % relativo de GLS no hay toxicidad', gls(-20, -17.2).indexOf('Sin toxicidad detectada') > -1],
    ['con 15.0 % exactos es CTRCD leve',
      gls(-20, -17).indexOf('caida relativa de GLS 15.0% — cardiotoxicidad LEVE asintomatica') > -1]
  ] };
`);

// ═══ GRUPO 24 — ETE: TEER, TAVI y orejuela ══════════════════════════════════════════════════
/* Los criterios se gatean por el DATO (`teer_tipo_im`), no por lo que se ve en pantalla. En la
   IM primaria, el gap y la profundidad de coaptacion —que son de la funcional— no cuentan como
   criterios faltantes: un criterio que NO APLICA no es un criterio que FALTA. */
caso('TC-73', 'TEER: el tipo de IM gatea que criterios cuentan, sin dejar el veredicto incompleto', `
  __t.limpiar(); __t.set('teer_tipo_im','primaria');
  __t.set('teer_lva','24'); __t.set('teer_lvp','9'); __t.set('teer_ancho_flail','12');
  __t.set('teer_area_mitral','5.2'); __t.set('teer_pasp','40');
  __t.set('teer_calcificacion','no'); __t.set('teer_clefts','no'); __t.set('teer_trombo','no');
  const e = teerEstado(); const hoja = amiloTextoTEER();
  return { extra: [
    ['primaria y completa -> APTO', e.clave === 'apto' && e.noIngresados === 0],
    ['la hoja trae la anchura de flail', hoja.indexOf('Anchura de flail <=15 mm') > -1],
    ['y NO pide gap ni profundidad de coaptacion',
      hoja.indexOf('Gap de coaptación') === -1 && hoja.indexOf('Profundidad de coaptación') === -1],
    ['la nota es la de anatomia, no la de GDMT', e.nota.indexOf('Anatomía favorable') > -1]
  ] };
`);

caso('TC-74', 'TEER: un criterio no cumplido es borderline; dos son NO apto', `
  function base() { __t.limpiar(); __t.set('teer_tipo_im','secundaria');
    __t.set('teer_lva','24'); __t.set('teer_lvp','9'); __t.set('teer_gap','6');
    __t.set('teer_prof_flail','8'); __t.set('teer_area_mitral','5.2'); __t.set('teer_pasp','40');
    __t.set('teer_fevi','35'); __t.set('teer_dtsvi','62');
    __t.set('teer_calcificacion','no'); __t.set('teer_clefts','no'); __t.set('teer_trombo','no'); }
  base(); const ok = teerEstado();
  base(); __t.set('teer_area_mitral','3.0'); const uno = teerEstado();
  base(); __t.set('teer_area_mitral','3.0'); __t.set('teer_lva','15'); const dos = teerEstado();
  return { extra: [
    ['completo y correcto -> apto', ok.clave === 'apto' && ok.fallos === 0],
    ['un fallo -> borderline',      uno.clave === 'borderline' && uno.fallos === 1],
    ['dos fallos -> no apto',       dos.clave === 'no_apto' && dos.fallos === 2],
    ['y la hoja lo dice sin emoji',
      amiloTextoTEER().indexOf('NO apto para TEER según criterios actuales') > -1]
  ] };
`);

/* El trombo SIN consignar no puede dar «APTO»: no se sabe si se descarto por ETE o si nadie lo
   miro, y es una contraindicacion ABSOLUTA. El lado seguro es pedirlo, no suponerlo. */
caso('TC-75', 'TEER: trombo sin consignar nunca es APTO', `
  __t.limpiar(); __t.set('teer_tipo_im','secundaria');
  __t.set('teer_lva','24'); __t.set('teer_lvp','9'); __t.set('teer_gap','6');
  __t.set('teer_prof_flail','8'); __t.set('teer_area_mitral','5.2'); __t.set('teer_pasp','40');
  __t.set('teer_calcificacion','no'); __t.set('teer_clefts','no');
  const e = teerEstado();
  return { extra: [
    ['no es apto',        e.clave === 'parcial' && e.clave !== 'apto'],
    ['y pide el dato',    e.titulo.indexOf('Falta descartar trombo en aurícula izquierda') > -1]
  ] };
`);

caso('TC-76', 'TAVI: regurgitacion paravalvular severa y ausencia de RPV', `
  __t.limpiar(); __t.set('ete_tavi_ext_circ','35'); __t.set('ete_tavi_vc_ancho','0.7');
  const sev = eteTaviRPV(), narrSev = taviRpvNarrativa();
  __t.limpiar(); __t.set('ete_tavi_ext_circ','0'); __t.set('ete_tavi_flujo_rev','ausente');
  const nula = eteTaviRPV(), narrNula = taviRpvNarrativa();
  return { extra: [
    ['extension 35 % con VC 0.7 cm -> severa', sev.sev === 'Severa'],
    ['el motivo enumera los dos criterios', sev.motivo.indexOf('extensión 35%') > -1 && sev.motivo.indexOf('vena contracta 0.7 cm') > -1],
    ['la narrativa la gradua', narrSev.txt.indexOf('Insuficiencia paravalvular severa') > -1],
    ['medido en cero y flujo ausente -> sin RPV', nula.nula === true],
    ['y recien ahi se niega', narrNula.clave === 'negativa' &&
                              narrNula.txt.indexOf('Sin insuficiencia paravalvular significativa') > -1]
  ] };
`);

caso('TC-77', 'Orejuela: trombo confirmado contraindica cardioversion y manda sobre la morfologia', `
  __t.limpiar();
  __t.set('oai_lobulos','2'); __t.set('oai_trombo','si');
  __t.set('oai_vel_vac','18'); __t.set('oai_sec','severo');
  const r = __t.informe();
  return { inf: r.inf,
    debe: ['Orejuela izquierda bilobulada con trombo confirmado.',
           'Velocidad de vaciamiento 18 cm/s (estasis severa).',
           'Hallazgo que contraindica cardioversión eléctrica.'],
    noDebe: ['Considerar mayor complejidad para el cierre percutáneo'] };
`);

caso('TC-78', 'Orejuela multilobulada sin trombo: sale la nota de complejidad', `
  __t.limpiar(); __t.set('oai_lobulos','3'); __t.set('oai_trombo','no');
  const r = __t.informe();
  return { inf: r.inf,
    debe: ['Orejuela izquierda multilobulada sin trombo.',
           'Considerar mayor complejidad para el cierre percutáneo.'] };
`);

// ═══ GRUPO 25 — Campos derivados y sincronias ═══════════════════════════════════════════════
/* Un derivado se recalcula SIEMPRE que cambia su origen y se LIMPIA cuando el origen desaparece.
   Si se congela, el informe publica dos numeros contradiciendose en el mismo parentesis. */
caso('TC-79', 'El gradiente pulmonar se limpia cuando se borra la velocidad', `
  __t.limpiar(); __t.set('vp_vmax','4');
  const con = __t.val('vp_gmax');
  __t.set('vp_vmax','');
  const sin = __t.val('vp_gmax');
  return { extra: [['con Vmax 4 el gradiente es 64', con === '64'],
                   ['sin Vmax el gradiente queda vacio, no congelado', sin === '']] };
`);

caso('TC-80', 'La PASP del TEER espeja a psap_calc y la sigue al cambiar la VIT', `
  __t.limpiar(); __t.set('vci_diam','23'); __t.set('vci_col','<50');
  __t.set('vmax_it','3'); const a = __t.val('teer_pasp');
  __t.set('vmax_it','4'); const b = __t.val('teer_pasp');
  return { extra: [
    ['con VIT 3: 4·9 + 15 = 51', a === '51'],
    ['con VIT 4: 4·16 + 15 = 79', b === '79'],
    ['y coincide con psap_calc',  b === __t.val('psap_calc')]
  ] };
`);

caso('TC-81', 'VLI = volumen sistolico / BSA, y el volumen sale del TSVI', `
  __t.limpiar(); ${BSA2}
  __t.set('diam_tsvi','20'); __t.set('itv_tsvi','18'); __t.set('itv_ao','71'); __t.set('vmax_ao','2.8');
  const vs = parseFloat(__t.val('vs_calc')), vli = parseFloat(__t.val('vli_calc'));
  return { extra: [
    ['VS = pi·(20/20)²·18 = 56.5', Math.abs(vs - 56.5) < 0.1],
    ['VLI = VS / 2.00',            Math.abs(vli - vs / 2) < 1],
    ['vliCalc() concuerda con el campo', Math.abs(vliCalc() - vs / 2) < 0.1]
  ] };
`);

/* `input[type=hidden]` NO entra en el barrido de `.value` de `limpiarCampos`, y ahi vivian las
   horas del jet paravalvular y la serie congelada de cardio-onco: la serie del paciente A
   terminaba impresa en la hoja del paciente B. */
caso('TC-82', 'Nuevo estudio: los campos ocultos y los derivados tambien se limpian', `
  __t.limpiar();
  __t.set('nombre','PACIENTE A'); __t.set('vd_bas','52'); __t.set('vp_vmax','4');
  __t.set('co_fevi_basal','60'); __t.set('co_fevi_actual','45');
  const gmaxA = __t.val('vp_gmax');
  __t.limpiar();
  return { extra: [
    ['el paciente A tenia gradiente', gmaxA === '64'],
    ['vd_bas vacio',         __t.val('vd_bas') === ''],
    ['co_fevi_basal vacio',  __t.val('co_fevi_basal') === ''],
    ['co_serie_json vacio (hidden)',      (__t.val('co_serie_json') || '') === ''],
    ['ete_tavi_jet_horas vacio (hidden)', (__t.val('ete_tavi_jet_horas') || '') === ''],
    ['el derivado vp_gmax vacio',         __t.val('vp_gmax') === '']
  ] };
`);

/* Sin NINGUN dato cargado el EN SUMA no puede quedar vacio ni enumerar hallazgos. */
caso('TC-83', 'Estudio vacio: el EN SUMA dice que no hay alteraciones, no queda en blanco', `
  __t.limpiar();
  const r = __t.informe();
  return { suma: r.suma,
    debeSuma: ['Estudio sin alteraciones estructurales ni funcionales significativas.'] };
`);

// ═══ GRUPO 26 — Defectos que el suite encontro y ya estan cerrados ══════════════════════════
/* CERRADOS. c7 y c8 —los dos criterios de inclusion del COAPT— se CALCULABAN, se pintaban y se
   imprimian en la hoja firmada sin entrar en la lista `veto` de `teerEstado`: no sumaban fallo.
   Era el defecto que ya se habia cerrado para c10, con dos criterios que quedaron afuera de
   aquel arreglo. Hoy vetan, gateados por `esSec` estricto, y el Laboratorio los cuenta con el
   mismo gate — si se arreglaba uno solo, el informe firmado decia «NO apto» y el PDF de
   auditoria «Elegible» sobre el mismo estudio.
   c1b (velo posterior) sigue abierto mas abajo: es una decision clinica, no un arreglo. */
caso('TC-84', 'TEER: DTSVI >70 mm cuenta como criterio no cumplido', `
  __t.limpiar(); __t.set('teer_tipo_im','secundaria');
  __t.set('teer_lva','24'); __t.set('teer_lvp','9'); __t.set('teer_gap','6');
  __t.set('teer_prof_flail','8'); __t.set('teer_area_mitral','5.2'); __t.set('teer_pasp','40');
  __t.set('teer_fevi','35'); __t.set('teer_dtsvi','78');
  __t.set('teer_calcificacion','no'); __t.set('teer_clefts','no'); __t.set('teer_trombo','no');
  const e = teerEstado(); const hoja = amiloTextoTEER();
  return { extra: [
    ['el criterio se marca como no cumplido', e.cs.c8.ok === false],
    ['y cuenta como fallo',                   e.fallos >= 1],
    ['la conclusion no puede decir APTO',     e.clave !== 'apto'],
    ['la hoja no se contradice',
      !(hoja.indexOf('>70mm - NO apto') > -1 && hoja.indexOf('APTO para TEER - criterios cumplidos') > -1)]
  ] };
`);

caso('TC-85', 'TEER: FEVI fuera del rango COAPT cuenta como criterio no cumplido', `
  __t.limpiar(); __t.set('teer_tipo_im','secundaria');
  __t.set('teer_lva','24'); __t.set('teer_lvp','9'); __t.set('teer_gap','6');
  __t.set('teer_prof_flail','8'); __t.set('teer_area_mitral','5.2'); __t.set('teer_pasp','40');
  __t.set('teer_fevi','62'); __t.set('teer_dtsvi','62');
  __t.set('teer_calcificacion','no'); __t.set('teer_clefts','no'); __t.set('teer_trombo','no');
  const e = teerEstado();
  return { extra: [
    ['el criterio se marca como no cumplido', e.cs.c7.ok === false],
    ['y cuenta como fallo',                   e.fallos >= 1],
    ['la conclusion no puede decir APTO',     e.clave !== 'apto']
  ] };
`);

/* El gate de c7/c8 es `esSec` ESTRICTO, no `aplSec`. Sin ese matiz el arreglo se comia el caso
   mas comun: con el tipo de IM sin consignar los dos criterios son `null` por construccion, o
   sea «no ingresados» imposibles de completar, y TODO estudio sin tipo caeria de «APTO» a
   «Posiblemente apto — faltan 2 criterios». Es la trampa que el propio bloque ya documenta para
   c2 y c4. Este caso fija el gate: el mismo estudio, con y sin tipo, y en la IM primaria, donde
   los criterios del COAPT no aplican. */
caso('TC-89', 'TEER: los criterios COAPT solo cuentan con la IM secundaria consignada', `
  function base(tipo) { __t.limpiar(); if (tipo) __t.set('teer_tipo_im', tipo);
    __t.set('teer_lva','24'); __t.set('teer_lvp','9'); __t.set('teer_gap','6');
    __t.set('teer_prof_flail','8'); __t.set('teer_ancho_flail','12');
    __t.set('teer_area_mitral','5.2'); __t.set('teer_pasp','40');
    __t.set('teer_calcificacion','no'); __t.set('teer_clefts','no'); __t.set('teer_trombo','no');
    return teerEstado(); }
  const sinTipo = base('');            // sin FEVI ni DTSVI cargados
  const prim    = base('primaria');
  const sec     = base('secundaria');  // aca SI faltan, y son exigibles
  return { extra: [
    ['sin tipo consignado sigue siendo APTO', sinTipo.clave === 'apto' && sinTipo.noIngresados === 0],
    ['en IM primaria tampoco cuentan',        prim.clave === 'apto' && prim.noIngresados === 0],
    ['en IM secundaria son dos datos que faltan',
      sec.clave === 'parcial' && sec.noIngresados === 2],
    ['y faltar no es fallar',                 sec.fallos === 0]
  ] };
`);

/* Los tres bordes que aparecieron al hacer que c7/c8 veten, cada uno con su forma de fallar:
   1) El ESPEJO CONGELADO. `teer_fevi`/`teer_dtsvi` se copiaban con `_syncSiVacio` —escribe una
      vez y no refresca—, asi que corregir la FEVI en su tab dejaba a la hoja firmada evaluando
      el criterio del COAPT contra el valor viejo. Mientras los criterios eran decoracion eso
      solo desentonaba; desde que deciden APTO / NO APTO sale mal la conclusion, y en la
      direccion tranquilizadora tambien.
   2) El CERO. `dtsvi <= 70` es un criterio de TECHO: falla ABIERTO con el cero. Un `dsfvi`
      tipeado 0 imprimia «0mm <=70mm ✓» y podia dejar noIngresados en cero.
   3) La COMPUERTA. `hayDatos` contaba los dos espejos, asi que el boton «Integrar al informe»
      se destrababa sobre un modulo en el que nadie entro y el PDF firmado se llevaba una hoja
      TEER completa cuyas unicas filas con dato eran valores auto-copiados. */
caso('TC-90', 'TEER: los criterios COAPT se espejan vivos, rechazan el cero y no destraban la hoja solos', `
  __t.limpiar(); __t.set('teer_tipo_im','secundaria');
  __t.set('fevi','45'); __t.set('dsfvi','62'); sincronizarTEERDesdeGlobal();
  const espejo1 = __t.val('teer_fevi');
  __t.set('fevi','60'); sincronizarTEERDesdeGlobal();
  const espejo2 = __t.val('teer_fevi');
  const soloEspejo = teerEstado(); const hojaEspejo = amiloTextoTEER();

  __t.limpiar(); __t.set('teer_tipo_im','secundaria');
  __t.set('teer_lva','24'); __t.set('teer_lvp','9'); __t.set('teer_gap','6');
  __t.set('teer_prof_flail','8'); __t.set('teer_area_mitral','5.2'); __t.set('teer_pasp','40');
  __t.set('teer_fevi','35'); __t.set('teer_dtsvi','0');
  __t.set('teer_calcificacion','no'); __t.set('teer_clefts','no'); __t.set('teer_trombo','no');
  const cero = teerEstado();

  __t.limpiar(); __t.set('teer_tipo_im','secundaria');
  __t.set('teer_lva','24'); __t.set('teer_lvp','9'); __t.set('teer_gap','6');
  __t.set('teer_prof_flail','8'); __t.set('teer_area_mitral','5.2'); __t.set('teer_pasp','40');
  __t.set('teer_calcificacion','no'); __t.set('teer_clefts','no'); __t.set('teer_trombo','no');
  const faltan = teerEstado();

  return { extra: [
    ['el espejo copia la FEVI la primera vez',   espejo1 === '45'],
    ['y la SIGUE al corregirla, no queda en 45', espejo2 === '60'],
    ['con solo los espejos la tarjeta no evalua', soloEspejo.clave === 'sin_datos'],
    ['y la hoja del PDF sale vacia',              hojaEspejo === ''],
    ['DTSVI 0 no es un criterio cumplido',        cero.cs.c8.ok === null],
    ['y por eso el estudio no puede decir APTO',  cero.clave !== 'apto'],
    ['sin FEVI ni DSFVI la nota NOMBRA los dos que faltan',
      faltan.nota.indexOf('FEVI 20-50 % (COAPT)') > -1 && faltan.nota.indexOf('DTSVI ≤70 mm (COAPT)') > -1]
  ] };
`);

/* CERRADO. La rama `else if (ai_diam)` de `generarInforme` no tenia ni un `suma.push`: la misma
   auricula dilatada subia al EN SUMA si se midio por volumen y no subia si se midio por diametro
   —la via que queda en el eco de rutina—, asi que el informe firmado decia «Aurícula izquierda
   dilatada» arriba y «Estudio sin alteraciones estructurales ni funcionales significativas»
   abajo. Es la asimetria entre rutas de la leccion 9; la AD dilatada tenia esta misma forma.
   El caso verifica las DOS mitades: que el hallazgo suba, y que la afirmacion tranquilizadora
   deje de emitirse. Sin la segunda, un `suma.push` de mas seguiria pasando el test. */
caso('TC-87', 'AI dilatada por diametro AP llega al EN SUMA, y la normal no', `
  function ai(mm) { __t.limpiar(); __t.set('ai_diam', String(mm)); return __t.informe(); }
  const r = ai(45), leve = ai(39), normal = ai(38);
  return { inf: r.inf, suma: r.suma,
    debe: ['Aurícula izquierda dilatada (diámetro AP 45 mm).'],
    debeSuma: ['AI dilatada (diámetro AP 45 mm).'],
    noSuma: ['Estudio sin alteraciones estructurales ni funcionales significativas.'],
    extra: [
      ['39 mm sube como levemente dilatada',
        leve.suma.indexOf('AI levemente dilatada (diámetro AP 39 mm).') > -1],
      ['38 mm es normal y NO sube al EN SUMA', /AI .*dilatada/.test(normal.suma) === false],
      ['y ese estudio sigue diciendo que no hay alteraciones',
        normal.suma.indexOf('Estudio sin alteraciones estructurales ni funcionales significativas.') > -1]
    ] };
`);

/* ═══════════════════════════════════════════════════════════════════════════════════════════
   DEFECTOS ABIERTOS — casos que describen lo que la app DEBERIA hacer y hoy no hace.
   Fallan a proposito. Ver el encabezado de `casoAbierto`.
   ═══════════════════════════════════════════════════════════════════════════════════════════ */

/* c1b (velo posterior <7 mm) se pinta y no cuenta, igual que c7 y c8 — pero NO se cerro con
   ellos, y a proposito. Su texto de fallo dice «agarre difícil», no «NO apto»: es una
   advertencia de factibilidad tecnica, no un criterio de exclusion del COAPT. Convertirlo en
   veto cambiaria el veredicto de pacientes reales, asi que es una decision clinica de Maicol,
   no un arreglo que corresponda hacer por consistencia. El caso queda abierto para que la
   decision este escrita en algun lado y no se pierda. */
casoAbierto('TC-86', 'TEER: velo posterior <7 mm debe pesar en el veredicto',
  'Decision clinica pendiente, no defecto: c1b no esta en `veto` y su texto de fallo dice «agarre difícil». Con 4 mm de velo posterior el estado sigue siendo APTO con cero fallos.', `
  __t.limpiar(); __t.set('teer_tipo_im','secundaria');
  __t.set('teer_lva','24'); __t.set('teer_lvp','4'); __t.set('teer_gap','6');
  __t.set('teer_prof_flail','8'); __t.set('teer_area_mitral','5.2'); __t.set('teer_pasp','40');
  __t.set('teer_fevi','35'); __t.set('teer_dtsvi','62');
  __t.set('teer_calcificacion','no'); __t.set('teer_clefts','no'); __t.set('teer_trombo','no');
  const e = teerEstado();
  return { extra: [
    ['el criterio se marca como no cumplido', e.cs.c1b.ok === false],
    ['y cuenta como fallo',                   e.fallos >= 1]
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

  let ok = 0; const rotos = [], abiertos = [], arreglados = [];
  for (const c of CASOS) {
    if (SOLO && c.id !== SOLO) continue;
    let fallos;
    try { fallos = evaluar(await ev(c.fn)); }
    catch (e) { fallos = [['excepcion', e.message, '']]; }
    const punteado = (c.id + ' ' + c.nombre).padEnd(62, ' ').replace(/ (?= *$)/g, '.');
    if (c.abierto) {
      /* Un defecto abierto que sigue roto es lo esperado: se lista aparte y NO tine el suite.
         Si PASA, el defecto se arreglo y hay que promover el caso a `caso()` — eso si sale con
         1, porque un arreglo que nadie registra vuelve a abrirse igual que uno que nadie hizo. */
      if (fallos.length) { console.log('  ' + punteado + ' ⊘'); abiertos.push([c, fallos]); }
      else               { console.log('  ' + punteado + ' ▲'); arreglados.push(c); }
      continue;
    }
    if (fallos.length) { console.log('  ' + punteado + ' ✗'); rotos.push([c, fallos]); }
    else { console.log('  ' + punteado + ' ✓'); ok++; }
  }

  console.log(L);
  const sel   = CASOS.filter(c => !SOLO || c.id === SOLO);
  const total = sel.filter(c => !c.abierto).length;
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

  if (abiertos.length) {
    console.log('');
    console.log('  ⊘ DEFECTOS ABIERTOS — %d caso(s) que fallan A PROPOSITO.', abiertos.length);
    console.log('    Describen lo que la app deberia hacer. No tinen el resultado; se arreglan');
    console.log('    en el codigo y recien ahi se promueven a caso() normal.');
    abiertos.forEach(([c]) => {
      console.log('');
      console.log('    ' + c.id + '  ' + c.nombre);
      console.log('      ' + c.abierto);
    });
    console.log('');
  }
  if (arreglados.length) {
    console.log('');
    console.log('  ▲ %d caso(s) marcados como DEFECTO ABIERTO ahora PASAN:', arreglados.length);
    arreglados.forEach(c => console.log('      ' + c.id + '  ' + c.nombre));
    console.log('    El defecto se corrigio. Cambiar casoAbierto() por caso() para que quede');
    console.log('    cubierto como regresion, y actualizar CLAUDE.md.');
    console.log('');
  }

  cdp.close();
  process.exitCode = (rotos.length || arreglados.length) ? 1 : 0;
} catch (e) {
  console.error('\n  ERROR: ' + e.message + '\n');
  process.exitCode = 2;
} finally {
  try { servidor && servidor.close(); } catch {}
  try { chrome && chrome.proc.kill(); } catch {}
  try { chrome && await rm(chrome.perfil, { recursive: true, force: true }); } catch {}
}
