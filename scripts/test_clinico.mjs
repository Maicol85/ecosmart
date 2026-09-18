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
/* ⚠ EL CUERPO DE UN CASO ES UN TEMPLATE LITERAL: NO USES ACENTOS GRAVES ADENTRO, ni siquiera
   dentro de un comentario. Un solo backtick cierra la cadena en la mitad y el archivo entero
   deja de parsear con «SyntaxError: missing ) after argument list» apuntando a la linea del
   `caso(` — que es varias decenas de lineas ANTES del backtick culpable, asi que el mensaje no
   te lleva al error. Para citar un identificador en un comentario del cuerpo, escribilo pelado:
   amiloTextoTEER, no el identificador entre acentos graves. Ya se pago cuatro veces. */
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
    val(id) { const e = document.getElementById(id); return e ? e.value : null; },

    /* ── GUARDAR / REABRIR ────────────────────────────────────────────────────────────────
       Entran por las funciones REALES —\`guardarInforme\` y \`cargarEstudioPorId\`— y no por el
       store: lo que se quiere probar es justamente el viaje completo, que es donde vivieron
       los bugs mas caros de esta app (datos del paciente anterior, segmentos ETE que no
       volvian, la serie de cardio-onco que no viajaba).

       Tres cosas que hay que saber para leer esto:
       · \`guardarInforme\` EXIGE nombre o documento. Sin eso hace toast y devuelve false, y el
         caso fallaria por un motivo que no es el que se esta probando.
       · La primera vez muestra la CARD DE SEVERIDADES VALVULARES y devuelve false; el guardado
         real ocurre al confirmarla. Se confirma apretando \`#rev-confirm\`, que es el boton de
         verdad — asi el gate queda ejercitado y no salteado.
       · Con \`window._ettEditandoId\` puesto sale OTRO modal («sobreescribir / guardar como
         nuevo»). Se limpia antes: cada caso guarda un estudio nuevo.
       El guardado es ASINCRONO (IndexedDB con respaldo en localStorage), de ahi el await. */
    guardar() {
      window._ettEditandoId = null;
      const antes = new Set(getInformes().map(i => i.estudioId));
      return new Promise((resolve) => {
        const alTerminar = (ok) => {
          const nuevo = getInformes().find(i => !antes.has(i.estudioId));
          resolve({ ok: ok === true, estudioId: nuevo ? nuevo.estudioId : null });
        };
        try { guardarInforme(alTerminar); } catch (e) { resolve({ ok:false, error:String(e) }); return; }
        // Si aparecio la card de severidades, confirmarla: el guardado real cuelga de ahi.
        const cf = document.getElementById('rev-confirm');
        if (cf) cf.click();
      });
    },
    /* «Nuevo estudio» de verdad es un modal de confirmacion; lo que ese modal termina
       ejecutando es \`limpiarCampos\`. Se llama directo para no depender del overlay. */
    nuevoEstudio() { limpiarCampos(true); try { localStorage.removeItem('co_seguimiento'); } catch (e) {} },
    reabrir(estudioId) { cargarEstudioPorId(estudioId); },
    /* Cada caso BORRA lo que guardo. Los casos tienen que ser independientes, y un estudio
       que sobrevive cambia el denominador de cualquier caso posterior que mire la lista. */
    borrar(estudioId) {
      if (!estudioId) return Promise.resolve(false);
      return CeiboStore.setLocal(getInformes().filter(i => i.estudioId !== estudioId));
    },
    /* Las casillas «☐ PPT» del Laboratorio, que desde el 2026-09-16 son lo que decide el
       contenido del mazo. Antes esto iba como mods/anal dentro de las opciones del
       generador; esos dos campos ya no existen. */
    pptSel(claves) {
      try { localStorage.setItem('ecosmart_lab_ppt_chk',
        JSON.stringify((claves || []).reduce((a, k) => { a[k] = true; return a; }, {}))); } catch (e) {}
    },
    pptTodo() {
      this.pptSel(['actividad','demografia','funcion','vd','htp','valvulas','onco','eisenmenger',
                   'tavi','amiloidosis','asoc','comparar','contractilidad','hemo']);
    }
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
    /* La redaccion cambio el 2026-09-16: las dos ramas de esta linea y el EN SUMA pasaron a usar
       UNA sola frase (htpIndirectosFrase), que ademas incluye el TRIV tricuspideo. Antes el TAP
       estaba escrito a mano en cada rama con dos redacciones distintas. */
    debe: ['No se obtiene valor de PSAP por ausencia de insuficiencia tricuspídea valorable',
           'Presenta elementos indirectos de HTP (TAP < 105 ms).'],
    debeSuma: ['Presenta elementos indirectos de HTP (TAP < 105 ms), sin PSAP estimable.'] };
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
/* Las BANDAS no cambiaron (ESC/ASE: <9 normal · <36 leve · 36-64 moderada · >64 severa); lo que
   cambio el 2026-09-16 es DONDE aterriza el grado —`ep_grado`, no `vp_morf`— y que al EN SUMA
   sube desde moderada, no desde leve. El caso prueba las dos cosas por los dos lados del corte. */
caso('TC-51', 'Estenosis pulmonar: las cuatro bandas de Gmax en sus cortes', `
  function ep(vmax) { __t.limpiar(); __t.set('vp_vmax', String(vmax));
    return { g: __t.val('vp_gmax'), sel: __t.val('ep_grado'), r: __t.informe() }; }
  const a = ep(1.4), b = ep(1.6), c = ep(3.1), d = ep(4.0), e = ep(4.1);
  return { extra: [
    ['Gmax 7.8 normal',    a.g === '7.8'  && a.sel === 'sin' &&
      /Válvula pulmonar normal/.test(a.r.inf) && a.r.suma.indexOf('stenosis pulmonar') === -1, a.sel],
    ['Gmax 10.2 leve',     b.g === '10.2' && b.sel === 'Leve' &&
      b.r.inf.indexOf('con estenosis leve') > -1, b.sel + ' | ' + b.g],
    ['y la LEVE no sube al EN SUMA', b.r.suma.indexOf('stenosis pulmonar') === -1, b.r.suma],
    ['Gmax 38.4 moderada', c.g === '38.4' && c.sel === 'Moderada' &&
      c.r.suma.indexOf('Estenosis pulmonar moderada.') > -1, c.sel],
    ['Gmax 64 sigue moderada (corte <=64)', d.g === '64' && d.sel === 'Moderada' &&
      d.r.suma.indexOf('Estenosis pulmonar moderada.') > -1, d.sel + ' | ' + d.g],
    ['Gmax 67.2 severa',   e.g === '67.2' && e.sel === 'Severa' &&
      e.r.suma.indexOf('Estenosis pulmonar severa.') > -1, e.sel],
    /* El auto-grado NO puede producir «Moderada-severa»: la guia tiene tres bandas y el select
       cuatro. Si alguna vez la produce, es que alguien invento un umbral. */
    ['ninguna banda automatica produce Moderada-severa',
      [a,b,c,d,e].every(function(x){ return x.sel !== 'Moderada-severa'; })]
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
  const sinFactores = amiloTextoCardioOnco();
  /* Y con la calculadora cargada: la hoja toma la banda de ahi. Desde que se elimino el segundo
     score, co-riesgo-resultado —que es lo que lee _amRows para esta hoja— se repuebla desde
     hfaicosEstado(), asi que el PDF publica la clasificacion HFA-ICOS y no una propia. */
  document.getElementById('hfaicos_cv_previa').checked = true;
  hfaicosToggle('hfaicos_cv_previa');
  const txt = amiloTextoCardioOnco();
  return { extra: [
    ['caida de FEVI en pp',      txt.indexOf('Caída de FEVI | 15.0 pp') > -1],
    ['caida relativa de GLS',    txt.indexOf('Caída relativa de GLS | 25.0 %') > -1],
    ['conclusion con el grado',  txt.indexOf('cardiotoxicidad MODERADA (ESC 2022)') > -1],
    ['sin factores cargados la hoja NO inventa una banda: remite a la calculadora',
      sinFactores.indexOf('Completar en «Calculadora de Riesgo CV»') > -1 &&
      !/Riesgo (BAJO|MEDIO|ALTO|MUY ALTO)/.test(sinFactores)],
    ['con la calculadora cargada, la hoja trae SU banda',
      txt.indexOf('Riesgo CV basal (HFA-ICOS) | Riesgo ALTO (2/13 pts)') > -1],
    ['con su recomendacion de seguimiento',
      txt.indexOf('Eco cada 2 ciclos durante el tratamiento') > -1],
    ['y la salvedad del marco',  txt.indexOf('Marco HFA-ICOS (ESC 2022)') > -1],
    ['ya no queda rastro del score viejo',
      txt.indexOf('Score orientativo') === -1 && txt.indexOf('pts)') > -1 &&
      txt.indexOf('Riesgo MODERADO') === -1]
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
    ['la constante de la severa vale 40 %',       CO_UMBRAL_FEVI_SEVERA === 40],
    // El punto donde el clasificador cambia de banda, para que la constante no quede suelta.
    ['con FEVI 40 todavia NO es severa',
      fevi(60, 40).indexOf('cardiotoxicidad SEVERA') === -1],
    ['con 39 ya lo es',
      fevi(60, 39).indexOf('cardiotoxicidad SEVERA (ESC 2022)') > -1],
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

/* DECISION TOMADA (Maicol, 2026-09-15): c1b es ADVERTENCIA, no veto. Las guias no lo tratan
   como contraindicacion — es factibilidad tecnica del operador. Este caso dejo de ser
   `casoAbierto`: mientras la decision estaba pendiente el xfail decia «debe pesar en el
   veredicto», y sostener eso DESPUES de decidir lo contrario es peor que no tener el caso —
   el runner exigiria promoverlo el dia que alguien lo «arregle», o sea que empujaria
   activamente hacia la conducta que se descarto. Ahora fija la decision por el lado correcto.
   Lo que SI se verifica es que la advertencia se lea como advertencia: su texto lo dice con
   todas las letras y `vetoIds` la deja fuera, que es de donde sale el color de la capsula.
   Sin eso, c1b se pintaba en rojo identico a c1 —que si veta— y se leia como un rechazo. */
caso('TC-86', 'TEER: el velo posterior <7 mm advierte y NO cambia el veredicto', `
  function base(lvp) { __t.limpiar(); __t.set('teer_tipo_im','secundaria');
    __t.set('teer_lva','24'); __t.set('teer_lvp', String(lvp)); __t.set('teer_gap','6');
    __t.set('teer_prof_flail','8'); __t.set('teer_area_mitral','5.2'); __t.set('teer_pasp','40');
    __t.set('teer_fevi','35'); __t.set('teer_dtsvi','62');
    __t.set('teer_calcificacion','no'); __t.set('teer_clefts','no'); __t.set('teer_trombo','no');
    return teerEstado(); }
  // La hoja se toma con el velo CORTO. Tomarla despues de base(9) la lee sobre un c1b que
  // cumple, o sea sobre un estudio sin advertencia — el test pasaba a preguntar por otra cosa.
  const corto = base(4); const hoja = amiloTextoTEER();
  const largo = base(9);
  return { extra: [
    ['4 mm se marca como no cumplido',        corto.cs.c1b.ok === false],
    ['pero NO suma fallo',                    corto.fallos === 0],
    ['y el veredicto sigue siendo APTO',      corto.clave === 'apto'],
    ['identico al del velo normal',           corto.clave === largo.clave],
    ['el texto se declara advertencia',
      corto.cs.c1b.txt.indexOf('Advertencia: agarre difícil') > -1],
    ['y dice que no mueve el veredicto',
      corto.cs.c1b.txt.indexOf('No modifica el veredicto') > -1],
    ['c1b queda FUERA de vetoIds, de ahi sale el color',
      corto.vetoIds.has('teer-c1b') === false],
    ['mientras que c1, que si veta, esta dentro',
      corto.vetoIds.has('teer-c1') === true],
    // Con tilde: _teerAsciiPDF borra lo que cae fuera de \\x20-\\xFF, y la «í» esta DENTRO.
    // Lo que si convierte es la raya larga en guion. (Sin acentos graves en este comentario:
    // el cuerpo del caso es un template literal y un backtick lo cierra en la mitad.)
    ['la hoja del PDF imprime la advertencia',
      hoja.indexOf('4mm <7mm - Advertencia: agarre difícil') > -1],
    ['y la conclusion de la hoja sigue siendo APTO',
      hoja.indexOf('APTO para TEER - criterios cumplidos') > -1]
  ] };
`);

/* c6 (PASP <=70) es un criterio de TECHO: falla ABIERTO con el cero. Con `pasp !== null` solo,
   un `psap_calc` de 0 imprimia «0mmHg <=70mmHg ✓» en la hoja firmada y contaba como CUMPLIDO,
   asi que podia dejar noIngresados en cero y publicar «APTO para TEER». Es el mismo patron que
   ya se cerro para c8; c6 quedo pendiente aquella vez por ser preexistente.
   Los tres puntos del checklist de Maicol —sin PSAP, 80 mmHg, 60 mmHg— van como los tres
   lados del corte, mas el cero que es el que importa. */
caso('TC-91', 'TEER: la PASP en cero no es un criterio cumplido', `
  function pasp(v) { __t.limpiar(); __t.set('teer_tipo_im','secundaria');
    __t.set('teer_lva','24'); __t.set('teer_lvp','9'); __t.set('teer_gap','6');
    __t.set('teer_prof_flail','8'); __t.set('teer_area_mitral','5.2');
    __t.set('teer_fevi','35'); __t.set('teer_dtsvi','62');
    if (v !== null) __t.set('teer_pasp', String(v));
    __t.set('teer_calcificacion','no'); __t.set('teer_clefts','no'); __t.set('teer_trombo','no');
    return teerEstado(); }
  const cero = pasp(0), sin = pasp(null), alta = pasp(80), ok = pasp(60), borde = pasp(70);
  return { extra: [
    ['PASP 0 no dice ni apto ni no apto',   cero.cs.c6.ok === null],
    ['y el estudio no puede decir APTO',    cero.clave !== 'apto'],
    ['sin PSAP cargada, igual',             sin.cs.c6.ok === null],
    ['PASP 80 no cumple',                   alta.cs.c6.ok === false && alta.fallos === 1],
    ['PASP 70 exactos todavia cumple',      borde.cs.c6.ok === true],
    ['PASP 60 cumple y el estudio es APTO', ok.cs.c6.ok === true && ok.clave === 'apto']
  ] };
`);

/* LA TABLA DE REFERENCIAS CONTRA EL CLASIFICADOR. Decia «Leve: FEVI >=50% con caída >=10% +
   síntomas/biomarcadores» y eso NO es ESC 2022 ni lo que calcula la app: la leve asintomatica
   no exige caida de FEVI. El codigo estaba bien; la tabla, mal — y en la direccion peligrosa,
   pidiendo MAS de lo que pide la guia, asi que el mismo paciente salia «cardiotoxicidad LEVE»
   en su informe firmado y no calificaba segun la tabla de la propia app, dos pestañas mas alla.
   Es prosa HTML estatica que no puede leer las constantes, o sea que nada la ata sola. Este
   caso es esa atadura: verifica LOS DOS LADOS en la misma corrida — que la tabla lo diga y que
   el clasificador lo haga— sobre el caso exacto donde diferian. Con un solo lado, la tabla
   podria volver a la redaccion vieja sin que nada se pusiera en rojo. */
caso('TC-93', 'Cardio-onco: la tabla de Referencias dice lo mismo que clasifica el codigo', `
  const tabla = (document.getElementById('ref-cardiotox') || {}).textContent || '';
  function tox(fb, fa, tropo) { __t.limpiar();
    __t.set('co_fevi_basal', String(fb)); __t.set('co_fevi_actual', String(fa));
    if (tropo) __t.set('co_troponi','si');
    return (__t.txt('co-toxicidad-resultado') || '').replace(/\\s+/g,' '); }
  const rapida = (document.getElementById('co-referencia-seccion') || {}).textContent || '';
  const leve     = tox(60, 58, true);   // caida de 2 pp: MENOS de 10, y aun asi es LEVE
  const mejora   = tox(42, 48, true);   // MEJORA hasta 40-49 con troponina: NO es moderada
  const moderada = tox(62, 48, false);  // 14 pp hasta 48: MODERADA, no severa
  return { extra: [
    ['la tabla declara que la leve no exige caida de FEVI',
      tabla.indexOf('No exige caída de FEVI') > -1],
    ['y ya no pide «caída ≥10%» para la leve',
      tabla.indexOf('FEVI ≥50% con caída ≥10% + síntomas/biomarcadores') === -1],
    ['el clasificador rotula LEVE con 2 pp de caida y troponina elevada',
      leve.indexOf('cardiotoxicidad LEVE asintomatica (ESC 2022)') > -1],
    // El umbral del SGL es >= 15, no > 15: la tabla tiene que escribir el operador que
    // el codigo usa. Con «>15%» un GLS de -20 a -17 —15,0 exactos— es LEVE para el
    // clasificador y no califica segun la tabla, que es la discrepancia que esto cierra.
    ['la tabla usa ≥15% para el SGL, igual que el codigo',
      tabla.indexOf('SGL ↓ ≥15% relativo') > -1 && tabla.indexOf('SGL ↓ >15% relativo') === -1],
    ['la tabla exige descenso para la moderada',
      tabla.indexOf('Tiene que haber descenso') > -1],
    ['y el clasificador NO llama moderada a una FEVI que mejora hasta 40-49 con troponina',
      mejora.indexOf('MODERADA') === -1 && mejora.indexOf('no cumple criterio de CTRCD') > -1],
    ['la fila «sin graduar» se declara abierta, no una enumeracion cerrada',
      tabla.indexOf('No es una lista cerrada') > -1],
    ['la tabla nombra la reduccion NUEVA en la severa',
      tabla.indexOf('nueva') > -1],
    ['y advierte que la app solo puntua troponina',
      tabla.indexOf('sólo troponina') > -1],
    /* La SEGUNDA tabla, la que vive dentro de la pestaña de Cardio-Oncologia. Es la peor de las
       dos: esta a dos clics del veredicto que contradecia. Decia «Caida FEVI severa | FEVI <50%
       o caida >=10pp | Suspender», y el codigo rotula severa solo con FEVI <40 Y reduccion
       nueva — un basal de 62 que cae a 48 salia MODERADA debajo de una tabla que decia severa. */
    ['la tabla de la propia pestaña define la severa como FEVI nueva <40%',
      rapida.indexOf('FEVI nueva <40% (basal >=40%)') > -1 &&
      rapida.indexOf('FEVI <50% o caida >=10pp') === -1],
    ['y usa >=15% para el GLS, no >15%',
      rapida.indexOf('GLS reduccion >=15% relativa') > -1],
    ['el clasificador confirma: basal 62 a 48 es MODERADA, no severa',
      moderada.indexOf('cardiotoxicidad MODERADA (ESC 2022)') > -1 &&
      moderada.indexOf('SEVERA') === -1]
  ] };
`);

/* EL SGL SE CLASIFICA CON EL VALOR QUE SE IMPRIME. `_ctrcdGlsRel(-18, -15.3)` daba
   14.999999999999996 en coma flotante, asi que `>= 15` era FALSO — pero toda la interfaz lo
   muestra como «15.0 %» por toFixed(1). Ese paciente salia «Sin toxicidad detectada» EN VERDE
   mientras que -20 → -17, que la app tambien muestra como 15,0 %, salia «cardiotoxicidad LEVE».
   Dos numeros identicos a la vista, veredictos opuestos en el informe firmado, y el falso
   negativo del lado tranquilizador. Es la leccion 6 en version coma flotante: aca el crudo ni
   siquiera es «mas exacto», es el error de representacion de una division que en decimal da 15
   clavado. El redondeo va DENTRO de `_ctrcdGlsRel` para que los cinco consumidores vean el mismo
   numero. El caso prueba el par que fallaba, su gemelo, y que el redondeo no corrio la banda. */
caso('TC-94', 'CTRCD: el SGL se clasifica con el mismo valor que se publica', `
  function tox(gb, ga) { __t.limpiar();
    __t.set('co_fevi_basal','60'); __t.set('co_fevi_actual','58');
    __t.set('co_gls_basal', String(gb)); __t.set('co_gls_actual', String(ga));
    return (__t.txt('co-toxicidad-resultado') || '').replace(/\\s+/g,' '); }
  const LEVE = 'cardiotoxicidad LEVE asintomatica (ESC 2022)';
  return { extra: [
    ['_ctrcdGlsRel(-18,-15.3) ya no es 14.999999999999996',
      _ctrcdGlsRel(-18, -15.3) === 15],
    ['y da exactamente lo mismo que -20 -> -17',
      _ctrcdGlsRel(-18, -15.3) === _ctrcdGlsRel(-20, -17)],
    ['los dos pares clasifican igual: LEVE',
      tox(-18, -15.3).indexOf(LEVE) > -1 && tox(-20, -17).indexOf(LEVE) > -1],
    ['y ninguno queda en el verde de «sin toxicidad»',
      tox(-18, -15.3).indexOf('Sin toxicidad detectada') === -1],
    // El redondeo no puede correr la banda: 14,94 redondea a 14,9 y sigue por debajo.
    ['14,94 % redondea a 14,9 y NO es toxicidad',
      _ctrcdGlsRel(-20, -17.012) === 14.9 && tox(-20, -17.012).indexOf('Sin toxicidad detectada') > -1],
    // Y del otro lado: 14,96 se publica como 15,0, asi que clasifica como 15,0.
    ['14,96 % se publica 15,0 y por eso clasifica como 15,0',
      _ctrcdGlsRel(-20, -17.008) === 15 && tox(-20, -17.008).indexOf(LEVE) > -1]
  ] };
`);

/* LA MISMA HOJA NO PUEDE IMPRIMIR DOS VECES EL MISMO NUMERO Y QUE DEN DISTINTO. El redondeo de
   TC-94 entro en `_ctrcdGlsRel`, pero CUATRO superficies tenian su propia copia de la formula y
   no lo heredaban: la hoja del PDF, el texto del modulo integrado, el PPT y la tabla de
   evolucion. Mientras todas redondeaban recien al imprimir daba igual; con el redondeo adentro,
   `Math.round` desempata hacia +infinito y `toFixed` alejandose del cero, asi que discrepan en
   los empates a .x5 — alcanzables tipeando un GLS de dos decimales, que el campo admite.
   Medido: con -20 / -16.91 la hoja imprimia «Caída relativa de GLS | 15.4 %» y, ocho renglones
   abajo, «caida relativa de GLS 15.5% — cardiotoxicidad LEVE». Mismo numero, misma hoja firmada.
   Y la caida de FEVI tenia el defecto de coma flotante SIN arreglar: 64.1 - 54.1 da
   9.999999999999993, se imprime «10.0 pp», y el clasificador decia «por debajo del umbral» con
   el pie de la tabla declarando que el umbral es >=10. Tres afirmaciones incompatibles.
   Lo encontro el differential-review del arreglo del GLS. */
caso('TC-97', 'Cardio-onco: el numero que se imprime es el que clasifica', `
  function hoja(gb, ga, fb, fa) { __t.limpiar();
    __t.set('co_fevi_basal', String(fb)); __t.set('co_fevi_actual', String(fa));
    __t.set('co_gls_basal', String(gb)); __t.set('co_gls_actual', String(ga));
    return { txt: amiloTextoCardioOnco(),
             cap: (__t.txt('co-toxicidad-resultado') || '').replace(/\\s+/g,' ') }; }
  // Empate a .x5: el par que separaba Math.round de toFixed.
  const e = hoja(-20, -16.91, 60, 58);
  // Caida de FEVI con error de representacion: 64.1 - 54.1
  const f = hoja(-20, -20, 64.1, 54.1);
  return { extra: [
    ['_ctrcdFeviCaida(64.1, 54.1) ya no es 9.999999999999993',
      _ctrcdFeviCaida(64.1, 54.1) === 10],
    ['y por eso 10,0 pp YA cruza el umbral, no queda «por debajo»',
      f.cap.indexOf('por debajo del umbral de CTRCD') === -1],
    /* amiloTextoCardioOnco() es el TEXTO DEL MODULO INTEGRADO — el que se congela en el
       textarea y baja al bloque de ETT Avanzado. NO es la hoja que _coFila dibuja con jsPDF:
       esa es otra superficie, y su copia de la formula tambien se ruteo al helper pero NO la
       cubre ningun caso (_coFila es un closure dentro de la funcion del PDF, inalcanzable
       desde el harness). Dicho para que la etiqueta no prometa mas de lo que prueba. */
    ['el texto del modulo integrado y el clasificador dicen el MISMO 15,5',
      e.txt.indexOf('Caída relativa de GLS | 15.5 %') > -1 &&
      e.cap.indexOf('caida relativa de GLS 15.5%') > -1],
    ['y ya no imprime el 15.4 crudo',
      e.txt.indexOf('15.4 %') === -1],
    ['la caida de FEVI del modulo integrado coincide con la del clasificador',
      hoja(-20,-20,60,45).txt.indexOf('Caída de FEVI | 15.0 pp') > -1],
    // La tabla de evolucion invierte el signo, y el -0 tiene que salir 0.
    ['el delta de la tabla de evolucion es el mismo numero, con el signo dado vuelta',
      (function(){ __t.limpiar();
        __t.set('co_fevi_basal','60'); __t.set('co_fevi_actual','45');
        __t.set('co_gls_basal','-20'); __t.set('co_gls_actual','-16.91');
        const t = coTablaEvolucion(), act = t.find(r => r.actual);
        return act && act.dFevi === -15 && act.dGls === -15.5; })()],
    ['y una fila sin cambio da 0, no -0',
      (function(){ __t.limpiar();
        __t.set('co_fevi_basal','60'); __t.set('co_fevi_actual','60');
        const t = coTablaEvolucion(), act = t.find(r => r.actual);
        return act && Object.is(act.dFevi, 0); })()]
  ] };
`);

/* LAS DOS LISTAS DE «EL CERO NO CUENTA» TIENEN QUE DECIR LO MISMO. `teerEstado` decide el
   informe FIRMADO; `TEER_CRIT` decide el PDF de auditoria del Laboratorio. Son dos copias de la
   misma regla, y CLAUDE.md documenta que divergir entre esas dos superficies es la clase de
   defecto mas cara de esta app: el mismo estudio sale «Posiblemente apto» en un papel y «Apto»
   en el otro, y los dos numeros se leen igual de bien.
   Este caso existe porque la mutacion lo pidio: al sacar la guarda de c5 probe revertirla SOLO
   del lado del Laboratorio y el suite siguio en VERDE. `TEER_CRIT` es un const local dentro de
   labEteRender y no se alcanza desde el harness — asi que en vez de dejar el hueco documentado
   otra vez, se verifica sobre el FUENTE, que para un invariante de «dos listas tienen que
   coincidir» es exactamente lo que hay que mirar.
   Es la unica verificacion de este suite que lee texto en vez de comportamiento. Eso la hace
   fragil al reformateo —si alguien cambia los espacios de esas lineas, da rojo sin que haya un
   defecto— y por eso no se generaliza: se usa donde el invariante ES textual. */
caso('TC-98', 'TEER: la pantalla y el Laboratorio rechazan el cero en los MISMOS criterios', `
  return (async () => {
    const src = await (await fetch(location.href, { cache:'no-store' })).text();
    // Lado del informe firmado: la guarda vive en la condicion de cada criterio.
    const guarda = {
      gap:   src.indexOf('gap  !== null && gap > 0') > -1,
      prof:  src.indexOf('profFlail  !== null && profFlail  > 0') > -1,
      pasp:  src.indexOf('pasp !== null && pasp > 0') > -1,
      dtsvi: src.indexOf('dtsvi !== null && dtsvi > 0') > -1,
      anch:  src.indexOf('anchoFlail !== null && anchoFlail > 0') > -1
    };
    // Lado del Laboratorio: la marca cero:'no' en la fila de TEER_CRIT de cada campo.
    const fila = campo => {
      const i = src.indexOf("campo:'teer_" + campo + "'");
      if (i < 0) return null;
      return src.slice(i, src.indexOf('\\n', i));
    };
    const marca = {
      gap:   (fila('gap')         || '').indexOf("cero:'no'") > -1,
      prof:  (fila('prof_flail')  || '').indexOf("cero:'no'") > -1,
      pasp:  (fila('pasp')        || '').indexOf("cero:'no'") > -1,
      dtsvi: (fila('dtsvi')       || '').indexOf("cero:'no'") > -1,
      anch:  (fila('ancho_flail') || '').indexOf("cero:'no'") > -1
    };
    const campos = ['gap','prof','pasp','dtsvi','anch'];
    return { extra: [
      ['el fuente se pudo leer', src.length > 100000],
      ['las cinco filas de TEER_CRIT existen', campos.every(k => fila(k === 'prof' ? 'prof_flail' : k === 'anch' ? 'ancho_flail' : k) !== null)],
      ['los cuatro que rechazan el cero lo rechazan en las DOS superficies',
        ['gap','prof','pasp','dtsvi'].every(k => guarda[k] === true && marca[k] === true)],
      ['y la anchura de flail lo acepta en las DOS',
        guarda.anch === false && marca.anch === false],
      ['ninguna de las cinco quedo desparejada',
        campos.every(k => guarda[k] === marca[k])]
    ] };
  })();
`);

/* EL FILTRO DE COHORTE CONTRA EL CLASIFICADOR. Los umbrales de cardio-onco del filtro eran
   literales pelados y con `>` donde el clasificador usa `>=`, asi que el estudio parado en el
   corte EXACTO quedaba fuera de su propia cohorte: una caida de 10,0 pp se rotula CTRCD en el
   informe firmado y no aparecia en «Caída FEVI > 10 pp»; un GLS de -20 a -17 —15,0 clavados—
   se rotula CTRCD LEVE y no aparecia en «Caída GLS > 15 %». Con el redondeo del GLS a un
   decimal (TC-94) el 15,0 exacto dejo de ser una rareza de coma flotante y paso a ser un valor
   FRECUENTE, asi que el desacuerdo se volvio alcanzable de verdad.
   El caso entra por `_labCohorteOk`, que es la funcion real del panel, con `_LAB_COHORTE`
   puesto a mano — y lo REPONE al salir, porque es estado de modulo y dejarlo puesto filtraria
   los casos siguientes. */
caso('TC-96', 'Cohorte: el estudio parado en el umbral entra en su propia cohorte', `
  const previo = _LAB_COHORTE;
  /* La cohorte se pone MOVIENDO EL SELECT del panel y leyendola con _labCohorteLeer(), no
     armando un objeto a mano. Dos motivos: los campos numericos tienen que valer null y no
     undefined —undefined !== null es CIERTO, asi que un objeto literal activaba el filtro de
     edad y descartaba todo estudio sin edad cargada, y el caso daba rojo por el motivo
     equivocado—, y asi se prueba el camino real, select incluido. */
  function enCohorte(selectId, valor, campos) {
    __t.set('coh-co-gls',''); __t.set('coh-co-fevi','');
    __t.set(selectId, valor);
    _LAB_COHORTE = _labCohorteLeer();
    return _labCohorteOk({ campos });
  }
  try {
    const G = 'coh-co-gls', F = 'coh-co-fevi';
    const glsJusto  = enCohorte(G, 'gt15', { co_gls_basal:'-20', co_gls_actual:'-17' });
    const glsFlotan = enCohorte(G, 'gt15', { co_gls_basal:'-18', co_gls_actual:'-15.3' });
    const glsMenos  = enCohorte(G, 'gt15', { co_gls_basal:'-20', co_gls_actual:'-17.2' });
    const feviJusta = enCohorte(F, 'gt10', { co_fevi_basal:'60', co_fevi_actual:'50' });
    const feviMenos = enCohorte(F, 'gt10', { co_fevi_basal:'60', co_fevi_actual:'51' });
    // La etiqueta que ve el medico tiene que decir el operador que el filtro usa.
    const desc = _labCohorteDesc();
    // El mismo par de GLS que el clasificador rotula LEVE tiene que entrar en la cohorte.
    __t.limpiar();
    __t.set('co_fevi_basal','60'); __t.set('co_fevi_actual','58');
    __t.set('co_gls_basal','-20'); __t.set('co_gls_actual','-17');
    const rotulado = (__t.txt('co-toxicidad-resultado') || '').indexOf('cardiotoxicidad LEVE') > -1;
    return { extra: [
      ['GLS 15,0 % exactos entra en la cohorte',   glsJusto === true],
      ['y el par que daba 14.999... tambien',      glsFlotan === true],
      ['14,0 % sigue quedando fuera',              glsMenos === false],
      ['caida de FEVI de 10,0 pp exactos entra',   feviJusta === true],
      ['9 pp sigue quedando fuera',                feviMenos === false],
      ['la etiqueta del filtro dice ≥ y no >',
        desc.indexOf('Caída FEVI ≥ 10 pp') > -1 && desc.indexOf('Caída FEVI > 10 pp') === -1],
      ['y el clasificador rotula LEVE ese mismo estudio: cohorte e informe coinciden',
        rotulado === true && glsJusto === true]
    ] };
  } finally { _LAB_COHORTE = previo; }
`);

/* EL CERO SE RECHAZA DONDE NO PUEDE SER UNA MEDICION — que NO es lo mismo que «en los criterios
   de techo», y la diferencia es todo este caso. `v <= X` es verdadero con 0 y ninguno de esos
   campos tiene `min`, asi que «0mm <=10mm ✓» contaba como criterio CUMPLIDO en la hoja firmada.
   Llevan guarda CUATRO: gap, profundidad, PASP y DTSVI. No hay PASP de cero ni DTSVI de cero, y
   una coaptacion o un tenting de 0 describen un hallazgo PATOLOGICO — contarlos como cumplidos
   es el error en la direccion peligrosa.
   **La anchura de flail es la excepcion, decidida por Maicol el 2026-09-15**: 0 mm es «no hay
   flail», el prolapso sin flail de todos los dias, y satisface genuinamente el «<=15 mm» — es
   anatomia FAVORABLE, no un dato que falta. Con la guarda puesta ese estudio pasaba de APTO a
   «Posiblemente apto — completar datos faltantes», y el medico iba a buscar una medicion que ya
   habia hecho. El caso fija las dos mitades de la decision: las cuatro que rechazan y la que
   acepta. Si alguien «uniformiza» los cinco, esto se pone en rojo.
   Y los criterios de PISO (velo anterior >=20, area mitral >=4) tampoco llevan guarda: con el
   cero ya fallan CERRADOS, y ponersela los convertiria en «no ingresado» donde hoy dicen,
   correctamente, que no se cumplen. */
caso('TC-95', 'TEER: el cero se rechaza donde no puede ser una medicion, no en todos los techos', `
  function conCero(campo) { __t.limpiar(); __t.set('teer_tipo_im','secundaria');
    __t.set('teer_lva','24'); __t.set('teer_lvp','9'); __t.set('teer_gap','6');
    __t.set('teer_prof_flail','8'); __t.set('teer_ancho_flail','12');
    __t.set('teer_area_mitral','5.2'); __t.set('teer_pasp','40');
    __t.set('teer_fevi','35'); __t.set('teer_dtsvi','62');
    __t.set('teer_calcificacion','no'); __t.set('teer_clefts','no'); __t.set('teer_trombo','no');
    __t.set(campo, '0');
    return teerEstado(); }
  const gap = conCero('teer_gap'), prof = conCero('teer_prof_flail');
  const pasp = conCero('teer_pasp'), dtsvi = conCero('teer_dtsvi');
  // La anchura de flail es criterio de IM PRIMARIA, asi que se prueba con ese tipo.
  __t.limpiar(); __t.set('teer_tipo_im','primaria');
  __t.set('teer_lva','24'); __t.set('teer_lvp','9'); __t.set('teer_area_mitral','5.2');
  __t.set('teer_pasp','40'); __t.set('teer_ancho_flail','0');
  __t.set('teer_calcificacion','no'); __t.set('teer_clefts','no'); __t.set('teer_trombo','no');
  const anch = teerEstado();
  // Los DOS de piso, con cero: tienen que seguir diciendo que NO se cumplen.
  const piso = conCero('teer_lva'), pisoArea = conCero('teer_area_mitral');
  return { extra: [
    ['gap 0 no es criterio cumplido',          gap.cs.c2.ok === null],
    ['profundidad 0 tampoco',                  prof.cs.c4.ok === null],
    ['PASP 0 tampoco',                         pasp.cs.c6.ok === null],
    ['DTSVI 0 tampoco',                        dtsvi.cs.c8.ok === null],
    ['y ninguno de los cuatro deja decir APTO',
      [gap, prof, pasp, dtsvi].every(e => e.clave !== 'apto')],
    // La excepcion: 0 mm de anchura de flail es «no hay flail», una medicion favorable.
    ['anchura de flail 0 SI es criterio cumplido', anch.cs.c5.ok === true],
    ['y el estudio queda APTO, sin pedir datos que ya estan',
      anch.clave === 'apto' && anch.noIngresados === 0],
    ['el texto del criterio muestra el valor medido, no «No ingresado»',
      anch.cs.c5.txt.indexOf('0mm ≤15mm') > -1],
    // Y sigue rechazando lo que de verdad es un flail ancho.
    ['un flail de 18 mm sigue siendo criterio NO cumplido',
      (function(){ __t.limpiar(); __t.set('teer_tipo_im','primaria');
        __t.set('teer_lva','24'); __t.set('teer_area_mitral','5.2'); __t.set('teer_pasp','40');
        __t.set('teer_ancho_flail','18');
        __t.set('teer_calcificacion','no'); __t.set('teer_clefts','no'); __t.set('teer_trombo','no');
        const e = teerEstado(); return e.cs.c5.ok === false && e.fallos === 1; })()],
    ['el velo anterior en 0 SIGUE fallando, no se vuelve «no ingresado»',
      piso.cs.c1.ok === false && piso.fallos === 1],
    ['y el area mitral en 0 tambien',
      pisoArea.cs.c3.ok === false && pisoArea.fallos === 1]
  ] };
`);

/* REIMPRIMIR NO PUEDE RECALCULAR. El texto de cada modulo de ETT Avanzado se congela al
   integrar; `amiloRefrescarSiIntacto` lo regenera si sigue siendo el que genero la app, para
   que cargar un dato DESPUES de integrar no deje la conclusion vieja en el PDF. La reimpresion
   de un informe firmado esta excluida de eso — pero la exclusion se apoyaba en que el texto
   restaurado NO coincidiera con `_amiloUltimo`, y `_amiloUltimo` es global a la pagina y solo
   se vacia en «Nuevo estudio». Asi que abrir un estudio para editar —o por el QR del PDF— y
   despues reimprimir ESE MISMO estudio hacia coincidir los dos lados y la hoja se REGENERABA:
   la reimpresion dejaba de reproducir lo firmado justo en el caso mas normal.
   El caso prueba las DOS direcciones. Sin la segunda, borrar la marca siempre tambien pasaria
   el test, y eso romperia el refresco que existe por un defecto real ya cerrado. */
caso('TC-92', 'Reimprimir conserva la hoja TEER firmada; abrir para editar la regenera', `
  const FIRMADO = '## Conclusión\\nAPTO para TEER - criterios cumplidos\\nAnatomía favorable.';
  const campos  = { 'am-integrados':'teer', 'am-txt-teer': FIRMADO };
  function escenario(reimpresion) {
    __t.limpiar();
    // Estudio que HOY evalua distinto de lo firmado: DTSVI 78 mm, o sea NO apto.
    __t.set('teer_tipo_im','secundaria');
    __t.set('teer_lva','24'); __t.set('teer_lvp','9'); __t.set('teer_gap','6');
    __t.set('teer_prof_flail','8'); __t.set('teer_area_mitral','5.2'); __t.set('teer_pasp','40');
    __t.set('teer_fevi','35'); __t.set('teer_dtsvi','78');
    __t.set('teer_calcificacion','no'); __t.set('teer_clefts','no'); __t.set('teer_trombo','no');
    // 1) el estudio se abre para EDITAR: deja su marca en _amiloUltimo
    amiloRestaurarDesdeCampos(campos, false);
    // 2) y despues se reimprime (o se vuelve a abrir), sin recargar la pagina
    amiloRestaurarDesdeCampos(campos, reimpresion);
    calcTEER();
    return (document.getElementById('am-txt-teer') || {}).value || '';
  }
  const reimpreso = escenario(true), reabierto = escenario(false);

  /* El estudio marcado como integrado pero SIN texto guardado. Es el unico caso que separa el
     borrado de la marca de la guarda hasOwnProperty: borrada la marca, la comparacion de textos
     ya protege a cualquier hoja con contenido —cadena vacia contra el texto firmado difieren—,
     pero con el textarea vacio los dos lados valen '' y sin la guarda la reimpresion INYECTA una
     hoja TEER recien calculada en un informe que no la tenia. Se llega desde un guardado viejo o
     parcial: am-integrados trae la clave y am-txt-teer no.
     (Sin acentos graves: el cuerpo del caso es un template literal y un backtick lo parte.) */
  __t.limpiar(); __t.set('teer_tipo_im','secundaria');
  __t.set('teer_lva','24'); __t.set('teer_area_mitral','5.2'); __t.set('teer_pasp','40');
  __t.set('teer_fevi','35'); __t.set('teer_dtsvi','62');
  __t.set('teer_calcificacion','no'); __t.set('teer_clefts','no'); __t.set('teer_trombo','no');
  amiloRestaurarDesdeCampos({ 'am-integrados':'teer', 'am-txt-teer':'' }, true);
  calcTEER();
  const vacio = (document.getElementById('am-txt-teer') || {}).value || '';

  return { extra: [
    ['reimprimir conserva el texto firmado, palabra por palabra', reimpreso === FIRMADO],
    ['y no cuela el veredicto de hoy',      reimpreso.indexOf('NO apto') === -1],
    ['abrir para editar SI regenera',       reabierto !== FIRMADO],
    ['y ahi aparece el criterio que fallaba', reabierto.indexOf('>70mm - NO apto') > -1],
    ['una hoja guardada VACIA no se rellena al reimprimir', vacio === '']
  ] };
`);


/* ═══ GRUPO 27 — CALCULADORA DE RIESGO CV BASAL (marco HFA-ICOS) ════════════════════════════
   Cada corte se prueba por los DOS lados. Un caso que mira 0 y 5 pasa igual con las bandas
   corridas. */
/* SOLO `__t.limpiar()`, que es `limpiarCampos` de verdad. La primera version tambien destildaba
   las casillas y borraba las marcas a mano, y eso enmascaraba el defecto: `limpiarCampos` NO
   limpiaba la marca de «lo movio una persona» —vivia en `dataset`, y el barrido de limpieza usa
   una lista CERRADA de atributos— asi que la decision del paciente A sobrevivia al siguiente y
   al paciente B no se le tildaba nada. Es «un test de restauracion que limpia a mano no prueba
   la limpieza», en el helper. */
const HFA_LIMPIAR = `__t.limpiar();`;

caso('TC-101', 'HFA-ICOS: el puntaje y las cuatro bandas, por los dos lados de cada corte', `
  ${HFA_LIMPIAR}
  const marcar = ids => { ${HFA_LIMPIAR}
    ids.forEach(id => { document.getElementById(id).checked = true; });
    return hfaicosEstado(); };
  const vacio = hfaicosEstado();
  const p0 = marcar([]);
  const p1 = marcar(['hfaicos_hta']);
  const p2 = marcar(['hfaicos_hta','hfaicos_dm']);
  const p3 = marcar(['hfaicos_hta','hfaicos_dm','hfaicos_obesidad']);
  const p4 = marcar(['hfaicos_hta','hfaicos_dm','hfaicos_obesidad','hfaicos_tabaco']);
  const cv = marcar(['hfaicos_cv_previa']);            // vale 2 solo
  return { extra: [
    ['el modulo vacio NO publica «riesgo bajo»: no hay evaluacion', vacio.hayDatos === false],
    ['0 puntos -> BAJO',      p0.pts === 0 && p0.banda === 'BAJO'],
    ['1 punto  -> MEDIO',     p1.pts === 1 && p1.banda === 'MEDIO'],
    ['2 puntos -> ALTO',      p2.pts === 2 && p2.banda === 'ALTO'],
    ['3 puntos todavia ALTO', p3.pts === 3 && p3.banda === 'ALTO'],
    ['4 puntos ya es MUY ALTO', p4.pts === 4 && p4.banda === 'MUY ALTO'],
    ['la enfermedad CV previa vale 2 por si sola, y eso ya es ALTO',
      cv.pts === 2 && cv.banda === 'ALTO'],
    // El denominador: doce filas NO son doce puntos.
    ['el maximo se deriva del catalogo y vale 13, no 12', hfaicosMax() === 13],
    ['y el texto publica ese denominador',
      marcar(['hfaicos_hta']).pts === 1 && hfaicosTexto().indexOf('1/13 puntos') > -1],
    /* LAS DOS LISTAS. Las doce filas son HTML estatico —tienen que existir en una carga limpia,
       si no, cargarEstudioPorId no tiene donde reponer lo guardado— y el puntaje vive en
       hfaicosFactores(), que es quien suma. Son dos copias de la misma lista, asi que el
       puntaje que se MUESTRA al lado de cada fila puede divergir del que se CUENTA: el medico
       marcaria «2 pts» y el score sumaria 1. Esto las ata. */
    ['las doce filas del catalogo existen en el DOM',
      hfaicosFactores().every(f => !!document.getElementById(f.id))],
    ['y no hay filas de mas en el HTML',
      document.querySelectorAll('#hfaicos-factores input[type=checkbox]').length === hfaicosFactores().length],
    ['el puntaje que se muestra es el que se cuenta, fila por fila',
      hfaicosFactores().every(f => {
        const fila = document.getElementById(f.id).closest('label');
        const sp = fila ? fila.querySelector('[data-hfa-pts]') : null;
        return !!sp && Number(sp.dataset.hfaPts) === f.pts &&
               sp.textContent.trim() === f.pts + ' pt' + (f.pts > 1 ? 's' : '');
      })]
  ] };
`);

/* Los dos criterios de FEVI son mutuamente excluyentes: una misma medicion no puede estar a la
   vez en 50-54% y por debajo de 50. Marcados los dos sumaban 3 puntos por UNA sola FEVI y
   empujaban al paciente una banda entera hacia arriba sobre una contradiccion. */
caso('TC-102', 'HFA-ICOS: los dos criterios de FEVI no pueden estar marcados a la vez', `
  ${HFA_LIMPIAR}
  document.getElementById('hfaicos_fevi_lim').checked = true;
  hfaicosToggle('hfaicos_fevi_lim');
  const soloLim = hfaicosEstado().pts;
  document.getElementById('hfaicos_fevi_red').checked = true;
  hfaicosToggle('hfaicos_fevi_red');
  const e = hfaicosEstado();
  return { extra: [
    ['la FEVI 50-54% sola vale 1', soloLim === 1],
    ['al marcar «<50%» se destilda «50-54%»',
      document.getElementById('hfaicos_fevi_lim').checked === false],
    ['y el puntaje es 2, no 3',    e.pts === 2],
    ['o sea ALTO y no MUY ALTO',   e.banda === 'ALTO']
  ] };
`);

/* El farmaco impone un PISO, no un reemplazo: la banda final es la MAYOR de las dos. Un paciente
   sin ningun factor que recibe antraciclinas a dosis alta es de muy alto riesgo; y uno que suma
   cuatro factores lo es con cualquier farmaco. */
caso('TC-103', 'HFA-ICOS: el farmaco impone un piso, no reemplaza al puntaje', `
  const conFarmaco = (ids, farm) => { ${HFA_LIMPIAR}
    ids.forEach(id => { document.getElementById(id).checked = true; });
    __t.set('hfaicos_farmaco', farm);
    return hfaicosEstado(); };
  const ceroMuyAlto = conFarmaco([], 'muy_alto');
  const ceroAlto    = conFarmaco([], 'alto');
  const ceroMedio   = conFarmaco([], 'medio');
  const ceroBajo    = conFarmaco([], 'bajo');
  const cuatroBajo  = conFarmaco(['hfaicos_hta','hfaicos_dm','hfaicos_obesidad','hfaicos_tabaco'], 'bajo');
  const unoAlto     = conFarmaco(['hfaicos_hta'], 'alto');
  /* EL CASO QUE SEPARA «PISO» DE «REEMPLAZO», y es la direccion peligrosa: cuatro factores con
     un farmaco de riesgo MEDIO. Con piso queda MUY ALTO; con reemplazo BAJA a medio, o sea que
     el farmaco desclasificaria a un paciente de muy alto riesgo. Los demas casos de este test
     pasan igual con las dos logicas — lo delato la mutacion, no la lectura. */
  const cuatroMedio = conFarmaco(['hfaicos_hta','hfaicos_dm','hfaicos_obesidad','hfaicos_tabaco'], 'medio');
  const dosMedio    = conFarmaco(['hfaicos_hta','hfaicos_dm'], 'medio');
  return { extra: [
    ['sin factores, un farmaco de muy alto riesgo da MUY ALTO',
      ceroMuyAlto.pts === 0 && ceroMuyAlto.banda === 'MUY ALTO' && ceroMuyAlto.mandaFarmaco === true],
    ['uno de alto riesgo da ALTO',   ceroAlto.banda === 'ALTO'],
    ['uno de riesgo medio da MEDIO', ceroMedio.banda === 'MEDIO'],
    ['y uno de riesgo bajo NO sube nada: queda BAJO',
      ceroBajo.banda === 'BAJO' && ceroBajo.mandaFarmaco === false],
    ['el farmaco de riesgo bajo tampoco BAJA una banda ganada por puntaje',
      cuatroBajo.pts === 4 && cuatroBajo.banda === 'MUY ALTO'],
    ['ni uno de riesgo MEDIO: 4 puntos siguen siendo MUY ALTO',
      cuatroMedio.pts === 4 && cuatroMedio.banda === 'MUY ALTO' && cuatroMedio.mandaFarmaco === false],
    ['y 2 puntos con farmaco medio siguen siendo ALTO, que es lo que manda el puntaje',
      dosMedio.pts === 2 && dosMedio.banda === 'ALTO' && dosMedio.mandaFarmaco === false],
    ['con 1 punto y farmaco alto manda el farmaco',
      unoAlto.pts === 1 && unoAlto.banda === 'ALTO' && unoAlto.mandaFarmaco === true],
    // El seguimiento sale de la banda FINAL, no del puntaje.
    ['el seguimiento es el de la banda final, no el del puntaje',
      ceroMuyAlto.seguimiento.indexOf('cada ciclo') > -1 &&
      ceroMuyAlto.seguimiento.indexOf('troponina y BNP seriados') > -1],
    ['y cada banda trae el suyo',
      ceroAlto.seguimiento.indexOf('cada 2 ciclos') > -1 &&
      ceroMedio.seguimiento.indexOf('Eco a los 12 meses') > -1 &&
      ceroBajo.seguimiento.indexOf('Control clínico') > -1]
  ] };
`);

/* La FEVI y el GLS se deducen del estudio, pero la deduccion NO puede pisar una decision del
   medico ni rehacerse al reabrir un estudio guardado. «Deteriorado» es MENOS negativo que -16:
   un -14 es peor que un -20, asi que la comparacion va sobre el valor CON SIGNO — con Math.abs
   el sentido se invierte y un strain normal quedaria marcado como alterado. */
caso('TC-104', 'HFA-ICOS: la FEVI y el GLS se deducen del estudio y respetan al medico', `
  ${HFA_LIMPIAR}
  __t.set('co_fevi_basal','52'); __t.set('co_gls_basal','-14');
  hfaicosSyncDesdeEstudio();
  const a = { lim: __t.val('hfaicos_fevi_lim') !== null && document.getElementById('hfaicos_fevi_lim').checked,
              red: document.getElementById('hfaicos_fevi_red').checked,
              gls: document.getElementById('hfaicos_gls_alt').checked, pts: hfaicosEstado().pts };
  __t.set('co_fevi_basal','44'); hfaicosSyncDesdeEstudio();
  const b = { lim: document.getElementById('hfaicos_fevi_lim').checked,
              red: document.getElementById('hfaicos_fevi_red').checked, pts: hfaicosEstado().pts };
  // El medico destilda a mano: desde aca la deduccion no lo toca mas.
  document.getElementById('hfaicos_fevi_red').checked = false;
  hfaicosToggle('hfaicos_fevi_red');
  __t.set('co_fevi_basal','38'); hfaicosSyncDesdeEstudio();
  const c = document.getElementById('hfaicos_fevi_red').checked;
  // Un GLS NORMAL no se marca.
  ${HFA_LIMPIAR}
  __t.set('co_gls_basal','-20'); hfaicosSyncDesdeEstudio();
  const glsNormal = document.getElementById('hfaicos_gls_alt').checked;
  // Y el borde exacto: -16 no es deteriorado; -15.9 si.
  ${HFA_LIMPIAR}
  __t.set('co_gls_basal','-16'); hfaicosSyncDesdeEstudio();
  const borde = document.getElementById('hfaicos_gls_alt').checked;
  ${HFA_LIMPIAR}
  __t.set('co_gls_basal','-15.9'); hfaicosSyncDesdeEstudio();
  const pasado = document.getElementById('hfaicos_gls_alt').checked;
  return { extra: [
    ['FEVI 52 marca «50-54%» y no «<50%»', a.lim === true && a.red === false],
    ['GLS -14 se marca como deteriorado',  a.gls === true],
    ['con los dos, 2 puntos',              a.pts === 2],
    ['FEVI 44 cambia solo al criterio de <50%', b.lim === false && b.red === true && b.pts === 3],
    ['destildado a mano, la deduccion ya no lo pisa', c === false],
    ['un GLS de -20 (normal) NO se marca',  glsNormal === false],
    ['-16 exacto tampoco',                 borde === false],
    ['-15.9 si',                           pasado === true]
  ] };
`);

/* El parrafo entra al informe por la CASILLA, que es el dato que viaja con el estudio — no por
   si la seccion esta abierta ni por si hay datos cargados. Un modulo con datos que el medico no
   integro no entra al informe firmado. */
caso('TC-105', 'HFA-ICOS: el parrafo entra al informe solo si se integro, y dice lo que calcula', `
  ${HFA_LIMPIAR}
  document.getElementById('hfaicos_edad').checked = true;
  document.getElementById('hfaicos_hta').checked = true;
  document.getElementById('hfaicos_cv_previa').checked = true;
  calcHFAICOS();
  __t.chk('hfaicos_incluir_chk', false);
  const sin = __t.informe();
  __t.chk('hfaicos_incluir_chk', true);
  const con = __t.informe();
  const e = hfaicosEstado();
  return { extra: [
    ['sin integrar el parrafo NO esta', sin.inf.indexOf('marco HFA-ICOS ESC 2022') === -1],
    ['integrado si',                    con.inf.indexOf('Evaluación de riesgo cardiovascular basal (marco HFA-ICOS ESC 2022)') > -1],
    ['con el puntaje que calcula la capsula',
      e.pts === 4 && con.inf.indexOf('puntaje 4/13 puntos — riesgo muy alto') > -1],
    ['y la lista de factores presentes',
      con.inf.indexOf('Factores presentes: Edad ≥65 años, Hipertensión arterial, Enfermedad CV previa') > -1],
    ['y el seguimiento de esa banda',
      con.inf.indexOf('Eco cada ciclo durante el tratamiento') > -1],
    ['el modulo vacio no mete nada aunque este integrado',
      (function(){ ${HFA_LIMPIAR} __t.chk('hfaicos_incluir_chk', true);
        return __t.informe().inf.indexOf('marco HFA-ICOS') === -1; })()],
    /* ROTULO y no una linea en blanco: inf.filter(Boolean) se come la cadena vacia, asi que
       inf.push('', t) es codigo muerto —el archivo ya lo documenta para etePars— y el parrafo
       salia pegado al renglon anterior, sin ninguna separacion entre los hallazgos del eco y la
       estratificacion oncologica. */
    ['el parrafo entra con rotulo propio',
      con.inf.indexOf('Estratificación de riesgo cardio-oncológico:') > -1],
    /* Sin regex: un salto de linea dentro de un literal de expresion regular, en un template,
       parte el literal en dos renglones y tira «Invalid regular expression». Se compara con
       indexOf sobre la cadena armada, que dice lo mismo y no tiene escapes. */
    ['y el rotulo esta en su propio renglon, no pegado al anterior',
      con.inf.split('\\n').some(l => l.trim() === 'Estratificación de riesgo cardio-oncológico:')],
    /* Doce casillas en su estado de fabrica significan «no esta» y «no lo mire» a la vez, y aca
       esa negacion ademas sostiene una agenda de control. No se afirma la ausencia. */
    ['con solo el farmaco elegido NO se afirma que no haya factores',
      (function(){ ${HFA_LIMPIAR} __t.set('hfaicos_farmaco','bajo');
        const t = hfaicosTexto();
        return t.indexOf('No se consignaron factores') > -1 &&
               t.indexOf('Sin factores de riesgo del paciente identificados') === -1; })()],
    /* toggleCard rota el PRIMER span del encabezado. Con el badge adelante, la flecha no giraba
       nunca y el badge quedaba de costado. */
    ['la flecha es el primer span del encabezado, para que toggleCard la rote',
      (function(){ const h = document.querySelector('h2.card-head[onclick*="hfaicos-seccion"]');
        return !!h && h.querySelector('span').id === 'hfaicos-seccion-arrow'; })()]
  ] };
`);

/* GUARDAR Y REABRIR. Las doce casillas viajan por el barrido de `__chk` y el select por el de
   inputs; la casilla de integracion la repone `_restaurarChkInclusion` y el boton lo repinta
   `eteInclSync` desde RECALC_MODULOS. Y lo que NO tiene que pasar: que al reabrir se rehaga la
   deduccion de FEVI/GLS y pise lo que el medico dejo decidido. */
caso('TC-106', 'HFA-ICOS: la calculadora entera viaja con el estudio y no se re-deduce al reabrir', `
  return (async () => {
    ${HFA_LIMPIAR}
    __t.set('nombre','HFA-ICOS'); __t.set('ci','1414');
    __t.set('co_fevi_basal','44');            // deduciria «FEVI <50%»
    hfaicosSyncDesdeEstudio();
    // El medico lo destilda: la basal oncologica no es la del eco de hoy.
    document.getElementById('hfaicos_fevi_red').checked = false;
    hfaicosToggle('hfaicos_fevi_red');
    document.getElementById('hfaicos_hta').checked = true;
    document.getElementById('hfaicos_cv_previa').checked = true;
    __t.set('hfaicos_farmaco','alto');
    calcHFAICOS();
    __t.chk('hfaicos_incluir_chk', true);
    const antes = hfaicosEstado();
    const infAntes = __t.informe().inf;

    const g = await __t.guardar();
    __t.nuevoEstudio();
    const trasLimpiar = document.getElementById('hfaicos_hta').checked;
    /* Se deja OTRO paciente en pantalla, con una banda DISTINTA, y se reabre ENCIMA. Sin esto la
       condicion de la capsula pasaba sin que nada se repintara: «Nuevo estudio» no borra el
       badge del .calc-box —el barrido generico alcanza a .calc-val, no a este span— asi que la
       capsula conservaba «Riesgo ALTO» del paciente anterior y el texto viejo coincidia por
       casualidad con el esperado. Un test que no distingue «se repinto» de «quedo lo de antes»
       no prueba el repintado. Lo delato la mutacion que saca calcHFAICOS de RECALC_MODULOS. */
    ['hfaicos_hta','hfaicos_dm','hfaicos_obesidad','hfaicos_tabaco'].forEach(id => {
      document.getElementById(id).checked = true; });
    calcHFAICOS();
    const ruido = (__t.txt('hfaicos-resultado') || '').replace(/\\s+/g,' ').trim();
    __t.reabrir(g.estudioId);
    const despues = hfaicosEstado();
    const infDespues = __t.informe().inf;
    /* La CAPSULA la repinta calcHFAICOS, que entra por RECALC_MODULOS. hfaicosEstado() y el
       boton no la cubren —el primero recalcula solo, al segundo lo repinta eteInclSync—, asi que
       sin esto sacar calcHFAICOS de la lista dejaba el suite en verde: el medico reabre el
       estudio, el informe trae el parrafo con la banda, y la capsula dice «Ingresar factores». */
    /* Doble barra en el escape del regex: el cuerpo del caso es un template literal, y ahi una
       barra sola delante de la s es un escape no reconocido que se evalua como la letra «s». Con una sola barra el regex llegaba a la
       pagina como /s+/g y BORRABA todas las eses: la capsula decia «Cla ificacion de rie go» y
       el caso fallaba por eso, no por la app. */
    const capsula = (__t.txt('hfaicos-resultado') || '').replace(/\\s+/g,' ').trim();
    const btn = document.querySelector('.btn-integrar[data-ete-chk="hfaicos_incluir_chk"]');
    const boton = btn ? btn.textContent.trim() : null;
    const badgeVisible = (function(){ const b = document.getElementById('hfaicos_badge');
      return !!b && b.hidden === false; })();
    await __t.borrar(g.estudioId);
    return { extra: [
      ['«Nuevo estudio» destilda los factores',  trasLimpiar === false],
      ['los factores vuelven',
        document.getElementById('hfaicos_hta').checked === true &&
        document.getElementById('hfaicos_cv_previa').checked === true],
      ['el farmaco vuelve',                      __t.val('hfaicos_farmaco') === 'alto'],
      ['el puntaje y la banda son los mismos',
        despues.pts === antes.pts && despues.banda === antes.banda],
      ['la casilla que el medico DESTILDO sigue destildada, no se re-dedujo',
        document.getElementById('hfaicos_fevi_red').checked === false],
      ['aunque la FEVI basal del estudio volvio', __t.val('co_fevi_basal') === '44'],
      ['el boton se repinta al reabrir',          boton === '✓ Integrado al informe'],
      ['y su badge queda visible',                badgeVisible === true],
      ['el paciente que quedo en pantalla mostraba OTRA banda', ruido.indexOf('Riesgo MUY ALTO') > -1],
      ['la CAPSULA se repinto al reabrir, con la banda del estudio',
        capsula.indexOf('Ingresar factores') === -1 && capsula.indexOf('Riesgo ' + antes.banda) > -1],
      ['y no quedo con la del paciente que estaba en pantalla', capsula !== ruido],
      ['con el puntaje del estudio', capsula.indexOf(antes.pts + ' / 13 puntos') > -1],
      ['el informe reabierto es identico al de antes de guardar', infDespues === infAntes]
    ] };
  })();
`);

/* LO QUE ENCONTRO EL /differential-review DE LA CALCULADORA. Cinco defectos, todos de la misma
   familia: un invariante que vivia SOLO en la interfaz, o un estado que no se limpiaba. */
caso('TC-107', 'HFA-ICOS: la exclusion, la marca del medico y la capsula, por las vias que NO son el clic', `
  return (async () => {
    // 1 · EXCLUSION EN LA EVALUACION. excluye corria solo en hfaicosToggle, o sea en el dedo
    //     del medico. La deduccion tilda por su cuenta, asi que una casilla marcada a mano podia
    //     convivir con la deducida: 3 puntos por UNA sola FEVI, y el informe firmado listando la
    //     misma medicion en dos rangos disjuntos.
    __t.limpiar();
    document.getElementById('hfaicos_fevi_lim').checked = true;
    hfaicosToggle('hfaicos_fevi_lim');                 // queda marcada como decidida
    document.getElementById('hfaicos_fevi_red').checked = true;   // como si la tildara la deduccion
    const ambas = hfaicosEstado();
    const textoAmbas = hfaicosTexto();

    // 2 · LA DEDUCCION NO SE CAE A LA FEVI DE HOY. En un control de ciclo 4 la FEVI de hoy puede
    //     estar caida POR el tratamiento; tildar con ella «FEVI BASAL <50%» pone en el informe
    //     una afirmacion falsa sobre una medicion anterior al tratamiento.
    __t.limpiar();
    __t.set('fevi','45');                              // la de HOY, sin basal cargada
    hfaicosSyncDesdeEstudio();
    const sinBasal = document.getElementById('hfaicos_fevi_red').checked;
    __t.set('co_fevi_basal','45');                     // ahora si, la basal
    hfaicosSyncDesdeEstudio();
    const conBasal = document.getElementById('hfaicos_fevi_red').checked;

    // 3 · UN GLS POSITIVO ES UN ERROR DE TIPEO. El resto de cardio-onco usa Math.abs, asi que
    //     nadie avisa; aca un 18 en vez de -18 daria «deteriorado» sobre un strain normal.
    __t.limpiar(); __t.set('co_gls_basal','18'); hfaicosSyncDesdeEstudio();
    const glsPositivo = document.getElementById('hfaicos_gls_alt').checked;

    // 4 · LA MARCA DEL MEDICO SOBREVIVE A LA PAGINA. Vivia en dataset, que muere al recargar:
    //     al dia siguiente el medico abria la seccion de su propio estudio y la deduccion le
    //     volvia a tildar lo que el habia destildado, subiendo de banda un informe ya firmado.
    __t.limpiar();
    __t.set('nombre','HFA marca'); __t.set('ci','1515');
    __t.set('co_fevi_basal','44'); hfaicosSyncDesdeEstudio();
    document.getElementById('hfaicos_fevi_red').checked = false;
    hfaicosToggle('hfaicos_fevi_red');                 // el medico lo destilda a proposito
    /* Y se deja algun factor tildado para que la capsula muestre una BANDA. Sin esto el estudio
       quedaba en cero, la capsula ya decia «Ingresar factores» antes de limpiar, y la condicion
       de mas abajo pasaba sin que limpiarCampos repintara nada: el texto viejo coincidia por
       casualidad con el esperado. Lo delato la mutacion que saca calcHFAICOS de limpiarCampos. */
    document.getElementById('hfaicos_cv_previa').checked = true;
    hfaicosToggle('hfaicos_cv_previa');
    const capsulaAntes = (__t.txt('hfaicos-resultado') || '').replace(/\\s+/g,' ').trim();
    const marcaGuardada = __t.val('hfaicos_manual');
    const g = await __t.guardar();
    __t.nuevoEstudio();
    // 5 · Y NO FUGA AL PACIENTE SIGUIENTE. limpiarCampos barre una lista cerrada de atributos y
    //     el hidden no entra en el barrido de text/number: hubo que limpiarlo a mano.
    const marcaTrasLimpiar = __t.val('hfaicos_manual');
    const capsulaTrasLimpiar = (__t.txt('hfaicos-resultado') || '').replace(/\\s+/g,' ').trim();
    __t.set('co_fevi_basal','38'); hfaicosSyncDesdeEstudio();
    const pacienteB = document.getElementById('hfaicos_fevi_red').checked;
    // Y al reabrir el estudio, la decision vuelve y la deduccion sigue sin pisarla.
    __t.reabrir(g.estudioId);
    hfaicosAbrir();                                    // el medico abre la seccion a revisarla
    const traReabrir = document.getElementById('hfaicos_fevi_red').checked;
    await __t.borrar(g.estudioId);
    return { extra: [
      ['con las dos FEVI marcadas gana la MAYOR, no se suman', ambas.pts === 2],
      ['asi que es ALTO y no MUY ALTO',                        ambas.banda === 'ALTO'],
      ['y el informe no lista la misma FEVI en dos rangos',
        textoAmbas.indexOf('FEVI basal 50-54%') === -1 && textoAmbas.indexOf('FEVI basal <50%') > -1],
      ['sin FEVI basal cargada NO se deduce de la FEVI de hoy', sinBasal === false],
      ['con la basal cargada si',                              conBasal === true],
      ['un GLS positivo (error de tipeo) no marca deterioro',  glsPositivo === false],
      ['la decision del medico se persiste en un campo, no en dataset',
        (marcaGuardada || '').indexOf('hfaicos_fevi_red') > -1],
      ['«Nuevo estudio» la borra: no fuga al paciente siguiente', marcaTrasLimpiar === ''],
      ['y por eso al paciente B si se le deduce',                pacienteB === true],
      ['antes de limpiar la capsula mostraba una banda', capsulaAntes.indexOf('Riesgo ALTO') > -1],
      ['«Nuevo estudio» tambien limpia la capsula',
        capsulaTrasLimpiar.indexOf('Ingresar factores') > -1 && capsulaTrasLimpiar !== capsulaAntes],
      ['al reabrir, abrir la seccion NO revive lo que el medico destildo', traReabrir === false]
    ] };
  })();
`);

/* LA TABLA DE REFERENCIA Y LA CALCULADORA TIENEN QUE CLASIFICAR IGUAL. Viven en la misma pestaña,
   a dos clics, y la calculadora dice en su propio aviso que sigue a esa tabla. La seccion C decia
   «>=4 FACTORES / 2-3 factores / 1 factor» y la seccion A de arriba reparte PUNTOS: hay filas que
   valen 2. Con enfermedad CV previa + FEVI <50% son 2 FILAS —«Alto» por el texto viejo— y 4
   PUNTOS, que es «Muy alto»: una banda de diferencia, y otra agenda de control impresa.
   El caso verifica los DOS lados sobre el mismo paciente. */
caso('TC-108', 'HFA-ICOS: la tabla de referencia y la calculadora dan la misma banda', `
  const ref = (document.getElementById('co-referencia-seccion') || {}).textContent || '';
  const marcar = ids => { __t.limpiar();
    ids.forEach(id => { document.getElementById(id).checked = true; });
    return hfaicosEstado(); };
  const cvYFevi = marcar(['hfaicos_cv_previa','hfaicos_fevi_red']);   // 2 filas, 4 puntos
  const soloCv  = marcar(['hfaicos_cv_previa']);                      // 1 fila,  2 puntos
  return { extra: [
    ['la tabla clasifica por PUNTOS, no por filas',
      ref.indexOf('>=4 puntos de la seccion A') > -1 && ref.indexOf('2-3 puntos') > -1 &&
      ref.indexOf('1 punto') > -1 && ref.indexOf('0 puntos') > -1],
    ['y ya no dice «factores» en la clasificacion global',
      ref.indexOf('>=4 factores de riesgo') === -1 && ref.indexOf('2-3 factores') === -1],
    ['CV previa + FEVI <50% son 4 puntos para la calculadora',  cvYFevi.pts === 4],
    ['y MUY ALTO, que es lo que ahora dice la tabla',           cvYFevi.banda === 'MUY ALTO'],
    ['CV previa sola son 2 puntos',                             soloCv.pts === 2],
    ['y ALTO, no MEDIO',                                        soloCv.banda === 'ALTO'],
    // Los dos criterios que discrepaban fila por fila con el catalogo.
    ['la tabla usa >=65 para la edad, igual que el catalogo',
      ref.indexOf('Edad >=65 anos') > -1 && ref.indexOf('Edad >65 anos') === -1],
    ['y lista el ACV en la enfermedad CV previa, igual que el catalogo',
      ref.indexOf('Enfermedad CV previa (IC, CAD, FA, ACV)') > -1 &&
      hfaicosFactores().find(f => f.id === 'hfaicos_cv_previa').lbl.indexOf('ACV') > -1]
  ] };
`);

/* UNA SOLA CALCULADORA DE RIESGO BASAL. Convivieron dos: el score propio de calcCardioOnco
   (riesgo CV + edad + FEVI + dosis, bandas <=1/<=3/<=5) y el marco HFA-ICOS. Respondian la misma
   pregunta con otra escala, y las DOS bajaban al mismo informe firmado por caminos distintos —una
   a la hoja de cardio-oncologia del PDF, la otra al cuerpo narrativo—, asi que un paciente con
   doxorrubicina 250 mg/m2 y nada mas cargado salia «MODERADO (2 pts)» en una pagina y «MUY ALTO»
   en otra, con dos agendas de control incompatibles. Se elimino el score propio.
   Lo que NO se borro: los CAMPOS de entrada, que los leen la cascada de toxicidad, la tabla de
   evolucion, el Excel y el filtro de cohorte del Laboratorio, y que viven en estudios ya
   guardados; y el contenedor `co-riesgo-resultado`, que es de donde el PDF, el PPT y el texto del
   modulo integrado toman la clasificacion — se repuebla desde hfaicosEstado(). */
caso('TC-109', 'Cardio-onco: quedo UNA sola calculadora de riesgo basal', `
  __t.limpiar();
  // El caso exacto en que las dos discrepaban.
  __t.set('co_farmaco','antracicline'); __t.set('co_dosis_antrac','250');
  const capsulaSinFactores = (__t.txt('co-riesgo-resultado') || '').replace(/\\s+/g,' ');
  document.getElementById('hfaicos_cv_previa').checked = true; hfaicosToggle('hfaicos_cv_previa');
  const e = hfaicosEstado();
  const capsula = (__t.txt('co-riesgo-resultado') || '').replace(/\\s+/g,' ');
  const hoja = amiloTextoCardioOnco();
  return { extra: [
    // 1 · El score viejo no vuelve por ningun lado.
    ['la capsula ya no publica un score propio',
      capsula.indexOf('Riesgo MODERADO') === -1 && capsula.indexOf('Score orientativo') === -1],
    ['sin factores no inventa una banda: remite a la calculadora',
      capsulaSinFactores.indexOf('Completar en «Calculadora de Riesgo CV»') > -1],
    // 2 · Y publica la de la calculadora que queda, con su mismo puntaje.
    ['la capsula publica la banda HFA-ICOS',
      capsula.indexOf('Riesgo ' + e.banda + ' (' + e.pts + '/' + e.max + ' pts)') > -1],
    ['con el seguimiento de esa banda',   capsula.indexOf('Eco cada 2 ciclos') > -1],
    ['y la hoja del PDF toma lo mismo',   hoja.indexOf('Riesgo ' + e.banda) > -1],
    // 3 · Tildar un factor repinta AMBOS: el contenedor viejo es el que baja al informe, asi que
    //     si solo se repintara la capsula nueva el PDF saldria con la banda anterior.
    ['al tildar otro factor se repinta tambien el contenedor que baja al informe',
      (function(){ document.getElementById('hfaicos_fevi_red').checked = true;
        hfaicosToggle('hfaicos_fevi_red');
        const e2 = hfaicosEstado();
        const c2 = (__t.txt('co-riesgo-resultado') || '').replace(/\\s+/g,' ');
        return e2.pts === 4 && e2.banda === 'MUY ALTO' &&
               c2.indexOf('Riesgo MUY ALTO (4/13 pts)') > -1; })()],
    // 4 · Los campos de entrada siguen existiendo: los leen otras cinco superficies.
    ['los campos basales siguen existiendo',
      ['co_farmaco','co_dosis_antrac','co_fevi_basal','co_gls_basal','co_edad','co_riesgo_cv']
        .every(id => !!document.getElementById(id))],
    ['y el aviso de dosis acumulada, que no era parte del score, se conserva',
      (function(){ __t.set('co_dosis_antrac','400');
        return (__t.txt('co-riesgo-resultado') || '').indexOf('zona de alto riesgo') > -1; })()]
  ] };
`);

/* LOS UMBRALES DEL FILTRO DE COHORTE SALEN DE CONSTANTES, Y LAS ETIQUETAS DE LAS MISMAS. La
   descripcion de la cohorte alimenta el ENCABEZADO del PDF de auditoria y la hoja «Cohorte» del
   Excel que va a CeiboAnalytics: una etiqueta cableada sobre un predicado por constante hace que
   el papel declare un denominador que no es el que se uso. El 50 de la PSAP estaba escrito CUATRO
   veces —los dos lados del predicado, _COH_LBL y el texto del <option>—; ahora sale de
   UMBRAL_PSAP_COHORTE_ALTA. Los demas filtros ya delegaban en clasificadores compartidos. */
caso('TC-110', 'Cohorte: los umbrales y sus etiquetas salen de la misma constante', `
  const previo = _LAB_COHORTE;
  function enCohorte(selectId, valor, campos) {
    ['coh-psap','coh-fevi'].forEach(id => __t.set(id, ''));
    __t.set(selectId, valor);
    _LAB_COHORTE = _labCohorteLeer();
    return { ok: _labCohorteOk({ campos }), desc: _labCohorteDesc() };
  }
  try {
    const U = UMBRAL_PSAP_ELEVADA, A = UMBRAL_PSAP_COHORTE_ALTA;
    // El estudio parado en el corte EXACTO de cada banda.
    const psap = v => ({ vmax_it:'3.0', pmad_manual:'', psap_calc: String(v) });
    const borde   = enCohorte('coh-psap','a3650', psap(A));      // 50 clavados: banda intermedia
    const pasado  = enCohorte('coh-psap','gt50',  psap(A + 1));  // 51: banda alta
    const noPasa  = enCohorte('coh-psap','gt50',  psap(A));      // 50 NO es «> 50»
    /* Los <option> los repuebla _labCohorteCCBox, que corre cuando se renderiza el panel del
       Laboratorio — no al cargar la pagina. Se lo invoca igual que lo hace ese render; si no, el
       caso estaria mirando el texto placeholder del HTML. */
    _labCohorteCCBox();
    const opt = document.querySelector('#coh-psap option[value="gt50"]');
    const optMed = document.querySelector('#coh-psap option[value="a3650"]');
    return { extra: [
      ['la constante de la banda alta existe y vale 50', A === 50],
      ['y la intermedia arranca donde termina la elevada', U === 35],
      ['la PSAP en el corte exacto cae en la banda intermedia', borde.ok === true],
      ['uno por encima cae en la alta',                         pasado.ok === true],
      ['y el corte exacto NO entra en la alta',                 noPasa.ok === false],
      // Las etiquetas, que son las que se imprimen en el PDF de auditoria.
      ['la etiqueta de la banda alta sale de la constante',
        _cohPsapLbl('gt50') === '> ' + A + ' mmHg'],
      ['la de la intermedia tambien, por los dos extremos',
        _cohPsapLbl('a3650') === (U + 1) + '–' + A + ' mmHg'],
      ['la descripcion que va al encabezado del PDF usa esa etiqueta',
        pasado.desc.indexOf('PSAP > ' + A + ' mmHg') > -1],
      ['y el texto del <option> tambien se repuebla desde ahi',
        !!opt && opt.textContent.trim() === '> ' + A + ' mmHg' &&
        !!optMed && optMed.textContent.trim() === (U + 1) + '–' + A + ' mmHg'],
      // Los de cardio-onco, que ya se habian unificado, siguen por constante.
      ['los de cardio-onco siguen leyendo sus constantes',
        CO_UMBRAL_FEVI_CAIDA === 10 && CO_UMBRAL_GLS_REL === 15]
    ] };
  } finally { _LAB_COHORTE = previo; }
`);

/* EL REDISEÑO NO PUEDE LLEVARSE CONTENIDO PUESTO. Dos reorganizaciones puramente visuales —los
   doce factores en cuatro columnas y la referencia en cuatro subtabs— y las dos mueven bloques
   grandes de marcado. Lo que se rompe en un movimiento asi no es la logica: es una fila que se
   quedo en el portapapeles, un id duplicado al copiar, o un panel que tapa contenido que otros
   casos creen estar verificando.
   Los cuatro casos que leen #co-referencia-seccion por textContent siguen valiendo porque
   display:none NO saca el texto de textContent. Este caso fija ESA dependencia: si alguien pasa
   a quitar los paneles del DOM, aca da rojo y no en silencio dentro de los otros cuatro. */
caso('TC-111', 'Cardio-onco: el rediseño no perdio ni duplico contenido', `
  const sec = document.getElementById('co-referencia-seccion');
  const ref = sec.textContent || '';
  const panes = Array.from(document.querySelectorAll('.co-ref-pane'));
  const botones = Array.from(document.querySelectorAll('.co-ref-tab'));
  // Los doce factores, cada uno en su columna y todos dentro del contenedor que lee el codigo.
  const cont = document.getElementById('hfaicos-factores');
  const cols = Array.from(cont.querySelectorAll('.hfa-col'));
  const ids = hfaicosFactores().map(f => f.id);
  return { extra: [
    // ── Calculadora en columnas ──
    ['los doce factores siguen dentro de #hfaicos-factores',
      ids.every(id => { const e = document.getElementById(id); return !!e && cont.contains(e); })],
    ['repartidos en cuatro columnas',            cols.length === 4],
    ['ninguna columna quedo vacia',
      cols.every(c => c.querySelectorAll('input, select').length > 0)],
    ['cada factor sigue dentro de su etiqueta, con su puntaje visible',
      hfaicosFactores().every(f => {
        const l = document.getElementById(f.id).closest('label');
        const sp = l && l.querySelector('[data-hfa-pts]');
        return !!sp && Number(sp.dataset.hfaPts) === f.pts; })],
    ['el selector de farmaco es la cuarta columna y sigue siendo uno solo',
      document.querySelectorAll('#hfaicos_farmaco').length === 1 &&
      cont.contains(document.getElementById('hfaicos_farmaco'))],
    ['y el puntaje sigue saliendo igual',
      (function(){ __t.limpiar();
        document.getElementById('hfaicos_cv_previa').checked = true;
        document.getElementById('hfaicos_hta').checked = true;
        const e = hfaicosEstado(); return e.pts === 3 && e.banda === 'ALTO'; })()],

    // ── Subtabs ──
    ['hay cuatro subtabs con su boton',          panes.length === 4 && botones.length === 4],
    ['arranca con una sola visible',
      panes.filter(p => p.style.display !== 'none').length === 1],
    ['y su boton es el marcado como activo',
      botones.filter(b => b.classList.contains('activa')).length === 1],
    ['cada panel tiene contenido',
      panes.every(p => (p.textContent || '').trim().length > 80)],
    /* display:none NO saca el texto de textContent: de eso dependen TC-93, TC-99, TC-100 y
       TC-108, que leen el contenedor entero. */
    ['el contenido oculto SIGUE en textContent, que es de lo que dependen los otros casos',
      ref.indexOf('CTRCD severa') > -1 && ref.indexOf('marco HFA-ICOS') > -1 &&
      ref.indexOf('Inhibidores del proteasoma') > -1 && ref.indexOf('Seguimiento ecocardiografico') > -1],
    ['cambiar de subtab muestra una y esconde las otras tres',
      (function(){ coRefTab('monit');
        const vis = panes.filter(p => p.style.display !== 'none');
        return vis.length === 1 && vis[0].dataset.corefPane === 'monit'; })()],
    ['la subtab de monitoreo trae las diez clases',
      (function(){ const p = panes.find(x => x.dataset.corefPane === 'monit');
        return p.querySelectorAll('tr').length === 11; })()],   // 10 + encabezado
    ['incluso la que no empieza con «Basal», que es donde fallaba la extraccion',
      (function(){ const p = panes.find(x => x.dataset.corefPane === 'monit');
        const t = p.textContent || '';
        return t.indexOf('Hormonoterapia') > -1 && t.indexOf('No rutinario') > -1; })()]
  ] };
`);

/* MOVER 1.800 LINEAS ES DONDE SE PIERDE CONTENIDO EN SILENCIO. Las doce secciones de Congenitas
   se repartieron en DOS pestañas y se agregaron siete acordeones vacios. Los 126 casos pasaban
   igual con las dos primeras versiones del movimiento — y las dos se habian comido DOS bloques de
   codigo embebido que vivian ENTRE las secciones. Lo delato un conteo, no los tests.
   Este caso cuenta: las doce originales tienen que seguir existiendo, con su id, su cabecera y su
   cuerpo, y cada una en la pestaña que le toca. */
caso('TC-112', 'Congenitas: ninguna seccion se perdio en el reparto ni al implementarlas', `
  const T1 = ['vab','coa','marfan','fop','esub','easv','mch','mca','tdf','tv'];
  const T2 = ['shunt','dap','vap','dsav','cvpa','tga','ebs','eisen','fontan'];
  /* marfan, eisen y fontan pasaron de placeholder a seccion real el 2026-09-15: salen de PH y
     entran en ORIG con su campo caracteristico. Que TC-112 se pusiera en rojo al implementarlas
     es lo correcto —la condicion «ningun placeholder trae campos» es justamente lo que hay que
     actualizar cuando uno deja de serlo—. */
  const ORIG = ['tv','shunt','dap','coa','vap','fop','vab','ebs','tdf','tga','mch','mca','marfan','eisen','fontan','esub','easv','dsav','cvpa'];
  const PH   = [];   // CERO placeholders: las diecinueve secciones tienen contenido
  const t1 = document.getElementById('tab-congenitas');
  const t2 = document.getElementById('tab-congenitas2');
  const de = k => document.getElementById('sacc-cc-' + k);
  const enTab = (k, t) => { const e = de(k); return !!e && !!t && t.contains(e); };
  return { extra: [
    ['existen las dos pestañas', !!t1 && !!t2],
    ['las secciones con contenido siguen existiendo', ORIG.every(k => !!de(k))],
    ['mas los acordeones en desarrollo, sin repetir id',
      PH.every(k => !!de(k)) &&
      document.querySelectorAll('[id^="sacc-cc-"]').length === ORIG.length + PH.length],
    ['cada una esta en la pestaña que le toca',
      T1.every(k => enTab(k, t1)) && T2.every(k => enTab(k, t2))],
    ['ninguna quedo en las dos',  T1.every(k => !enTab(k, t2)) && T2.every(k => !enTab(k, t1))],
    ['todas conservan cabecera y cuerpo',
      ORIG.concat(PH).every(k => { const e = de(k);
        return !!e.querySelector('.sacc-hdr') && !!e.querySelector('.sacc-body'); })],
    /* Que el CONTENIDO viajo entero, no solo el envoltorio: se toma un campo caracteristico de
       cada una de las doce y se verifica que siga dentro de SU seccion. Sin esto, una seccion
       vaciada pero con su cabecera pasaria las condiciones de arriba. */
    ['y su contenido: cada campo caracteristico sigue dentro de su seccion',
      [['vab','vab_fenotipo'],['coa','coa_istmo'],['fop','fop_tunel'],['mch','mch_espesor'],
       ['mca','mca_tsvd_plax'],['tdf','tdf_civ_grad'],['tv','tv_tipo'],['shunt','ete_cia_tipo'],
       ['dap','dap_diam'],['vap','vap_diam'],['tga','tga_tipo'],['ebs','ebs_area_ad'],
       ['marfan','marfan_ao_seno'],['eisen','eis_lesion_base'],['fontan','fontan_tipo'],['esub','esub_tipo'],['easv','easv_tipo'],['dsav','dsav_tipo'],['cvpa','cvpa_conexion']]
        .every(par => { const s = de(par[0]), c = document.getElementById(par[1]);
          return !!s && !!c && s.contains(c); })],
    ['los placeholders dicen que estan en desarrollo',
      PH.every(k => (de(k).textContent || '').indexOf('En desarrollo') > -1)],
    ['y ninguno trae campos, que es lo que los hace placeholder',
      PH.every(k => de(k).querySelectorAll('input, select, textarea').length === 0)],
    ['las dos pestañas tienen su boton de navegacion',
      !!document.querySelector('[onclick*="showTab(\\'congenitas\\')"]') &&
      !!document.querySelector('[onclick*="showTab(\\'congenitas2\\')"]')]
  ] };
`);

/* EL GRADIENTE DOPPLER YA NO INDICA INTERVENCION. coaConclusion emitia «indicacion de
   intervencion segun ESC 2020» cuando el gradiente DOPPLER pasaba 20 mmHg. Es el numero
   equivocado: la guia indica sobre el PICO-PICO INVASIVO, y el Doppler se subestima con
   colaterales extensas —justo el paciente que mas las tiene— y se sobreestima post-stent. Fallaba
   en las dos direcciones, y la primera es la peligrosa: una coartacion grave con colaterales
   salia «sin gradiente significativo — seguimiento clinico» en el informe firmado.
   Cada clase se prueba por los DOS lados de su corte: 19/20 en el pico-pico y 49/50 en la
   estenosis relativa. Un caso que mira 10 y 40 pasa igual con los umbrales corridos. */
caso('TC-113', 'CoAo: la indicacion sale del pico-pico invasivo, no del Doppler', `
  function coa(o) { __t.limpiar();
    __t.set('coa_loc','yuxtaductal'); __t.set('coa_situacion', o.sit || 'nativa');
    if (o.vmax != null) __t.set('coa_vmax', String(o.vmax));
    if (o.pp   != null) __t.set('coa_gradiente_picopico', String(o.pp));
    if (o.est  != null) __t.set('coa_estenosis_relativa', String(o.est));
    if (o.hta  != null) __t.set('coa_hta', o.hta);
    __t.chk('coart_incluir_chk', true);
    const c = coaConclusion();
    return { clave: c && c.clave, txt: (c && c.txt) || '', inf: __t.informe() };
  }
  // 4.0 m/s -> 64 mmHg por Doppler: antes esto SOLO ya indicaba intervenir.
  const soloDoppler = coa({ vmax: 4.0 });
  const i    = coa({ pp: 20, hta: 'si' });
  const iNo  = coa({ pp: 19, hta: 'si' });
  const iia1 = coa({ pp: 10, est: 60, hta: 'si' });
  const iia1No = coa({ pp: 10, est: 49, hta: 'si' });
  const iia2 = coa({ pp: 20, hta: 'no' });
  const iib  = coa({ pp: 10, est: 50, hta: 'no' });
  const sin  = coa({ pp: 10, est: 40, hta: 'no' });
  const faltaHta = coa({ pp: 30 });
  const post = coa({ sit: 'post_stent', pp: 10, est: 20, hta: 'no' });
  return { extra: [
    // 1 · El Doppler solo NO indica intervencion.
    ['un gradiente Doppler de 64 mmHg ya NO indica intervenir',
      soloDoppler.txt.indexOf('indicación de intervención') === -1],
    ['manda a medir el pico-pico, que es el criterio de la guia',
      soloDoppler.txt.indexOf('medir el gradiente pico-pico invasivo') > -1],
    // 2 · Las cuatro clases, por los dos lados del corte.
    ['HTA + pico-pico 20 exactos -> Clase I',
      i.clave === 'indicacion_i' && i.txt.indexOf('Clase I ESC 2020') > -1],
    ['con 19 NO es Clase I',        iNo.clave !== 'indicacion_i'],
    ['HTA + estenosis 60 % con pico-pico bajo -> Clase IIa',
      iia1.clave === 'indicacion_iia' && iia1.txt.indexOf('Clase IIa') > -1],
    ['con estenosis 49 % no llega',  iia1No.clave !== 'indicacion_iia'],
    ['normotenso + pico-pico 20 -> Clase IIa',
      iia2.clave === 'indicacion_iia' && iia2.txt.indexOf('normotensa') > -1],
    ['estenosis 50 exactos sin HTA ni gradiente -> Clase IIb',
      iib.clave === 'indicacion_iib' && iib.txt.indexOf('Clase IIb') > -1],
    ['por debajo de todo -> sin criterios',
      sin.clave === 'sin_indicacion' && sin.txt.indexOf('Sin criterios'.toLowerCase()) > -1],
    // 3 · Sin HTA consignada no se concluye: falta la mitad del criterio Clase I.
    ['con el pico-pico alto y la HTA sin consignar, se pide el dato en vez de suponerlo',
      faltaHta.clave === 'limitrofe' && faltaHta.txt.indexOf('falta consignar si hay HTA') > -1],
    ['y NO se declara Clase I',     faltaHta.clave !== 'indicacion_i'],
    // 4 · Seguimiento del operado, que aplica aunque no haya indicacion.
    ['el post-stent sin criterios igual lleva su seguimiento',
      post.clave === 'sin_indicacion' &&
      post.inf.inf.indexOf('Seguimiento anual obligatorio') > -1 &&
      post.inf.inf.indexOf('cada 3-5 años') > -1],
    // 5 · Los insumos de la indicacion se imprimen, para que sea auditable.
    ['el informe imprime el pico-pico sobre el que indica',
      i.inf.inf.indexOf('Gradiente pico-pico invasivo 20 mmHg') > -1],
    ['y la HTA confirmada',        i.inf.inf.indexOf('Hipertensión arterial confirmada') > -1],
    ['la estenosis relativa tambien', iib.inf.inf.indexOf('Estenosis relativa al diámetro aórtico al diafragma 50 %') > -1],
    // 6 · El EN SUMA lleva la clase: una indicacion solo en el cuerpo no se ve.
    ['el EN SUMA declara la Clase I',   i.inf.suma.indexOf('Clase I ESC 2020') > -1],
    ['y distingue post-stent de nativa', post.inf.suma.indexOf('post-stent') > -1]
  ] };
`);

/* LAS DOS PESTAÑAS DE CONGENITAS TIENEN QUE VERSE IGUAL. El estilo de los acordeones esta
   SCOPEADO a #tab-congenitas a proposito —.sacc lo usan seis pestañas y el selector pelado
   repintaria las otras cinco—, asi que al crear la segunda quedo con el .sacc crudo: celdas mas
   altas, texto mas grande y otro fondo. Son CINCO reglas; con una sola sin actualizar la
   diferencia vuelve.
   Se comparan propiedades COMPUTADAS y en los DOS temas, no la hoja de estilo: lo que importa es
   lo que el navegador resuelve, y el fondo sale de una variable que cambia con el tema. */
caso('TC-114', 'Congenitas: las dos pestañas se ven identicas, de dia y de noche', `
  const PROPS = ['backgroundColor','color','fontSize','fontWeight','textTransform',
                 'letterSpacing','paddingTop','paddingLeft','borderBottomWidth'];
  document.querySelectorAll('.tab-section').forEach(s => s.classList.add('active'));
  function leer(id) {
    const h = document.querySelector('#' + id + ' .sacc .sacc-hdr');
    const a = document.querySelector('#' + id + ' .sacc .sacc-arrow');
    if (!h || !a) return null;
    const cs = getComputedStyle(h); const o = {};
    PROPS.forEach(k => o[k] = cs[k]);
    o.flecha = getComputedStyle(a).fontSize;
    return o;
  }
  function difs() {
    const a = leer('tab-congenitas'), b = leer('tab-congenitas2');
    if (!a || !b) return ['falta alguna pestaña'];
    return Object.keys(a).filter(k => a[k] !== b[k]).map(k => k + ': ' + a[k] + ' vs ' + b[k]);
  }
  const cls = document.documentElement.className;
  document.documentElement.classList.remove('light-mode');
  const oscuro = { dif: difs(), bg: leer('tab-congenitas').backgroundColor };
  document.documentElement.classList.add('light-mode');
  const claro  = { dif: difs(), bg: leer('tab-congenitas').backgroundColor };
  document.documentElement.className = cls;
  return { extra: [
    ['en tema oscuro no hay ni una diferencia', oscuro.dif.length === 0],
    ['en tema claro tampoco',                   claro.dif.length === 0],
    /* Y que el tema SI cambie el fondo: si las dos lecturas dieran lo mismo, el caso estaria
       comparando dos veces el mismo tema y pasaria sin probar el modo noche. Me paso al
       verificarlo a mano. */
    ['el fondo cambia entre los dos temas, o sea que se midieron los dos',
      oscuro.bg !== claro.bg],
    /* SIN COBERTURA: las dos reglas de :hover. getComputedStyle no resuelve pseudo-clases sin
       hover real, asi que mutarlas no pone nada en rojo — verificado. Son las de menor riesgo de
       las cinco (una capa de fondo al pasar el puntero), pero se dice para que no se lea como
       cubierto: si alguien saca el id de esas dos, la pestaña nueva pierde el hover y el suite
       pasa igual. */
    ['y el estilo scopeado alcanza a la pestaña nueva, no es el .sacc pelado',
      leer('tab-congenitas2').fontSize === '11px' &&
      leer('tab-congenitas2').textTransform === 'uppercase' &&
      leer('tab-congenitas2').flecha === '10px']
  ] };
`);

/* VAB: Sievers (2007) -> Consenso Internacional 2021. Sievers clasificaba por inspeccion
   QUIRURGICA, asi que no se puede aplicar a un paciente sin operar; el Consenso se basa en imagen.
   LO PELIGROSO DE LA MIGRACION: los estudios guardados tienen `t1rl`, `t0`... Si esos valores no
   se traducen, el select reabre VACIO —el valor ya no es una opcion— y el informe pierde la
   morfologia de la valvula EN SILENCIO: no hay error, solo un campo en blanco. */
caso('TC-115', 'VAB: la migracion a Consenso 2021 no pierde los estudios de Sievers', `
  return (async () => {
    // 1 · Los cinco valores viejos se traducen.
    const M = { t0:'dos_senos_ll', t1rl:'fused_rl', t1rn:'fused_rn', t1nl:'fused_ln', t2:'no_clasif' };
    const trad = Object.keys(M).map(v => {
      const c = _migrarCamposLegacy({ vab_tipo: v });
      return c.vab_tipo === M[v];
    });
    // 2 · Y un valor NUEVO no se toca (no se re-migra al reabrir dos veces).
    const yaNuevo = _migrarCamposLegacy({ vab_tipo: 'fused_rl' }).vab_tipo === 'fused_rl';
    // 3 · El viaje real: un estudio guardado con Sievers reabre con el tipo puesto.
    __t.limpiar();
    __t.set('nombre','VAB Sievers'); __t.set('ci','2121');
    __t.set('vab_tipo','fused_rl'); __t.set('vab_rafe','presente');
    __t.set('vab_simetria','asimetrica'); __t.chk('vab_incluir_chk', true);
    const inf = __t.informe();
    const g = await __t.guardar();
    // Se degrada el estudio guardado a la nomenclatura VIEJA, como los de antes del cambio.
    const todos = getInformes();
    const est = todos.find(i => i.estudioId === g.estudioId);
    est.campos.vab_tipo = 't1rl';
    await CeiboStore.setLocal(todos);
    __t.nuevoEstudio();
    __t.reabrir(g.estudioId);
    const trasReabrir = __t.val('vab_tipo');
    const infMigrado = __t.informe();
    await __t.borrar(g.estudioId);
    return { extra: [
      ['los cinco valores de Sievers se traducen', trad.every(Boolean)],
      ['t2 (unicuspide) va a «no clasificable», no a una fusion inventada',
        _migrarCamposLegacy({ vab_tipo:'t2' }).vab_tipo === 'no_clasif'],
      ['un valor ya migrado no se vuelve a tocar', yaNuevo === true],
      ['un estudio guardado con Sievers reabre con el tipo PUESTO, no vacio',
        trasReabrir === 'fused_rl'],
      ['y el informe lo imprime en la nomenclatura nueva',
        infMigrado.inf.indexOf('fused type R-L') > -1],
      ['el mapa de etiquetas ya no tiene las claves viejas',
        VAB_TIPO_TXT.t1rl === undefined && VAB_TIPO_TXT.t0 === undefined],
      // 4 · Lo aditivo.
      ['la simetria sale en el informe', inf.inf.indexOf('Senos asimétrica') > -1],
      ['el recordatorio de coartacion tambien',
        inf.inf.indexOf('excluir coartación de aorta asociada') > -1 &&
        inf.inf.indexOf('85 %') > -1],
      ['y el tipo, con la nomenclatura del Consenso',
        inf.inf.indexOf('Válvula aórtica bicúspide — fused type R-L') > -1]
    ] };
  })();
`);

/* EL UMBRAL DEPENDE DEL SINDROME, NO DEL DIAMETRO. Loeys-Dietz opera a los 45 mm donde el Marfan
   espera a 50 y la EHAT no sindromica a 55. Aplicar el umbral del Marfan a un Loeys-Dietz son 5 mm
   de mas sobre una aorta que diseca antes. Cada corte se prueba por los DOS lados: 44/45, 49/50,
   54/55 y 25/25.1 en el indice de Turner. */
caso('TC-116', 'Marfan/EHAT: el umbral quirurgico sale del sindrome, no solo del diametro', `
  function m(o) { __t.limpiar();
    if (o.s   != null) __t.set('marfan_sindrome', o.s);
    if (o.seno!= null) __t.set('marfan_ao_seno', String(o.seno));
    if (o.asc != null) __t.set('marfan_ao_ascendente', String(o.asc));
    if (o.ita != null) __t.set('marfan_ita', String(o.ita));
    if (o.fr  != null) __t.set('marfan_factores_riesgo', o.fr);
    __t.chk('marfan_incluir_chk', true);
    const r = marfanEstado();
    return { c: r.clave, t: r.txt, inf: __t.informe() };
  }
  const lds45 = m({ s:'lds', seno:45 }),      lds44 = m({ s:'lds', seno:44 });
  const mar50 = m({ s:'marfan', seno:50 }),   mar49 = m({ s:'marfan', seno:49 });
  const mar45fr = m({ s:'marfan', seno:45, fr:'si' });
  const mar45no = m({ s:'marfan', seno:45, fr:'no' });
  const eh55 = m({ s:'ehat', seno:55 }),      eh54 = m({ s:'ehat', seno:54 });
  const eh50fr = m({ s:'ehat', seno:50, fr:'si' });
  /* Turner lleva DOS cortes DISTINTOS (ESC 2024, Tabla 62): 23 con factores de riesgo y 25 sin
     ellos. Cada uno por sus dos lados. El caso que separa las dos versiones es ASI 24 CON
     factores: con el umbral unico de 25 salia «sin criterios», que es el escenario exacto en que
     el umbral bajo existe. */
  const tu24fr = m({ s:'turner', ita:24, fr:'si' });
  const tu23fr = m({ s:'turner', ita:23, fr:'si' });
  const tu24no = m({ s:'turner', ita:24, fr:'no' });
  const tu26no = m({ s:'turner', ita:25.1, fr:'no' });
  const tu25no = m({ s:'turner', ita:25, fr:'no' });
  const tuSinIta = m({ s:'turner', seno:48 });
  const sinSind  = m({ seno:47 });
  const tubular  = m({ s:'marfan', seno:42, asc:52 });
  return { extra: [
    // Loeys-Dietz: 45 es Clase I; el Marfan a los 45 todavia no.
    ['Loeys-Dietz con 45 mm ya es Clase I', lds45.c === 'cx_i'],
    ['con 44 todavia no',                   lds44.c !== 'cx_i'],
    ['el mismo 45 en Marfan NO es Clase I', mar45no.c !== 'cx_i'],
    ['Marfan con 50 si',                    mar50.c === 'cx_i'],
    ['con 49 no',                           mar49.c !== 'cx_i'],
    ['Marfan 45 CON factores es Clase IIa', mar45fr.c === 'cx_iia'],
    ['EHAT no sindromica corta en 55',      eh55.c === 'cx_i' && eh54.c !== 'cx_i'],
    ['y en 50 con factores, Clase IIa',     eh50fr.c === 'cx_iia'],
    // Turner: indexado, y las dos clases segun factores.
    ['Turner con indice 24 Y factores -> IIa (el umbral baja a 23)', tu24fr.c === 'cx_iia'],
    ['23 exactos con factores no pasa (es >23)',  tu23fr.c === 'sin_indicacion'],
    ['el mismo 24 SIN factores no indica',        tu24no.c === 'sin_indicacion'],
    ['pero el texto avisa que con factores seria IIa',
      tu24no.t.indexOf('con factores de riesgo este índice ya sería Clase IIa') > -1],
    ['sin factores el umbral es 25: 25.1 -> IIb', tu26no.c === 'cx_iib'],
    ['25 exactos no pasa',                        tu25no.c === 'sin_indicacion'],
    ['Turner sin el indice no concluye por el diametro absoluto',
      tuSinIta.c === 'falta_ita' && tuSinIta.t.indexOf('se indexa por superficie corporal') > -1],
    // Sin sindrome NO se concluye: es el dato que ELIGE el umbral.
    ['sin sindrome declarado no se concluye', sinSind.c === 'sin_sindrome'],
    ['y el texto dice los tres umbrales, para que se vea por que hace falta',
      sinSind.t.indexOf('Loeys-Dietz desde 45') > -1 && sinSind.t.indexOf('Marfan desde 50') > -1],
    // El diametro que decide es el MAYOR: el fenotipo tubular tiene la dilatacion en la ascendente.
    ['con la dilatacion en la ascendente tambien indica',
      tubular.c === 'cx_i' && tubular.t.indexOf('52 mm') > -1],
    // Informe y EN SUMA.
    ['el informe imprime los diametros sobre los que indica',
      lds45.inf.inf.indexOf('Aorta sinusal 45 mm') > -1],
    /* El ano se verifica en el informe: el PDF circula solo y «riesgo alto» sin marco no es
       interpretable por quien lo recibe. Y se verifica que NO quede rastro del anterior. */
    ['nombra la guia y el ano correctos',
      lds45.inf.inf.indexOf('ESC 2024') > -1 && lds45.inf.inf.indexOf('ESC 2020') === -1],
    /* Se normaliza el espacio: la nota usa &nbsp; entre el numero y la unidad para que no se
       parta el renglon, y en textContent eso NO es un espacio comun — un indexOf con espacio
       normal da -1 y el caso falla por el caracter, no por el contenido. */
    ['el factor de progresion dice >5 mm/año, no >3',
      (function(){ const t = (document.getElementById('sacc-cc-marfan').textContent || '')
        .replace(/\\u00a0/g, ' ');
        return t.indexOf('progresion >5 mm/año') > -1 && t.indexOf('>3 mm/año') === -1; })()],
    ['el EN SUMA lleva la clase',  lds45.inf.suma.indexOf('indicación quirúrgica Clase I') > -1],
    ['sin criterios NO llena el EN SUMA',
      mar49.inf.suma.indexOf('indicación quirúrgica') === -1],
    ['pero «falta el sindrome» SI sube: no es «sin hallazgo», es «no se puede concluir»',
      sinSind.inf.suma.indexOf('falta declarar el síndrome') > -1]
  ] };
`);

/* EISENMENGER: LAS ALERTAS SON EL MODULO. Las tres —saturacion critica, sincope y hemoptisis— no
   describen la lesion: cambian una conducta, y dos son de vida o muerte (embarazo con mortalidad
   materna >50 %, hemoptisis masiva). Por eso suben al EN SUMA: una alerta que hay que ir a buscar
   tres parrafos abajo ya fallo.
   Y las tres condicionan por «si» explicito o por un numero MEDIDO, nunca por la ausencia del
   dato: un select vacio no dice «no tiene sincope», dice «nadie lo pregunto». */
caso('TC-117', 'Eisenmenger: las alertas salen en el informe Y en el EN SUMA, y no por defecto', `
  function e(o) { __t.limpiar();
    __t.set('eis_lesion_base', o.les || 'civ');
    if (o.sat  != null) __t.set('eis_saturacion_reposo', String(o.sat));
    if (o.sinc != null) __t.set('eis_sincope', o.sinc);
    if (o.hemo != null) __t.set('eis_hemoptisis', o.hemo);
    if (o.peri != null) __t.set('eis_pericardio', o.peri);
    if (o.nyha != null) __t.set('eis_clase_nyha', o.nyha);
    __t.chk('eisen_incluir_chk', true);
    const r = eisenEstado();
    return { r, inf: __t.informe() };
  }
  const sat85 = e({ sat:85 }), sat89 = e({ sat:89 }), sat90 = e({ sat:90 }), sat93 = e({ sat:93 });
  const sinc  = e({ sat:95, sinc:'si' }),  sincNo  = e({ sat:95, sinc:'no' });
  const hemo  = e({ sat:95, hemo:'si' }),  hemoNo  = e({ sat:95, hemo:'no' });
  const periSev = e({ sat:95, peri:'severo' }), periLev = e({ sat:95, peri:'leve' });
  const vacio = e({ sat:95 });                       // sin sincope ni hemoptisis consignados
  const satMal = e({ sat:9 });                       // 9 por 90: numero ilegible
  return { extra: [
    // Saturacion: los dos lados del corte.
    ['sat 89 dispara la alerta de embarazo',
      sat89.inf.inf.indexOf('Embarazo contraindicado') > -1],
    ['sat 90 exactos NO la dispara',
      sat90.inf.inf.indexOf('Embarazo contraindicado') === -1],
    ['sat 93 tampoco',  sat93.inf.inf.indexOf('Embarazo contraindicado') === -1],
    ['la alerta nombra la mortalidad materna y la guia',
      sat85.inf.inf.indexOf('mortalidad materna >50 % (ESC 2020)') > -1],
    ['y sube al EN SUMA, no se queda en el cuerpo',
      sat85.inf.suma.indexOf('embarazo contraindicado') > -1],
    // Sincope y hemoptisis: por «si» explicito.
    ['sincope Si alerta en informe y EN SUMA',
      sinc.inf.inf.indexOf('marcador de mal pronóstico') > -1 &&
      sinc.inf.suma.indexOf('síncope') > -1],
    ['sincope No no alerta',  sincNo.inf.inf.indexOf('marcador de mal pronóstico') === -1],
    ['hemoptisis Si alerta en los dos',
      hemo.inf.inf.indexOf('episodio masivo y fatal') > -1 &&
      hemo.inf.suma.indexOf('hemoptisis') > -1],
    ['hemoptisis No no alerta', hemoNo.inf.inf.indexOf('episodio masivo') === -1],
    // NINGUNA se dispara por el campo vacio: eso seria afirmar una ausencia... o inventarla.
    ['sin consignar sincope ni hemoptisis no aparece ninguna alerta de esas',
      vacio.inf.inf.indexOf('marcador de mal pronóstico') === -1 &&
      vacio.inf.inf.indexOf('episodio masivo') === -1],
    // Derrame: moderado/severo si, leve no. Y NO sube al EN SUMA: es pronostico, no conducta.
    ['derrame severo sale en el informe',
      periSev.inf.inf.indexOf('Derrame pericárdico severo') > -1],
    ['derrame leve no',  periLev.inf.inf.indexOf('Derrame pericárdico leve —') === -1],
    ['el derrame no llena el EN SUMA', periSev.inf.suma.indexOf('Derrame pericárdico') === -1],
    // La saturacion se valida por BANDA: un 9 por 90 no puede publicar «critica».
    ['una saturacion de 9 % no dispara la alerta: es un numero ilegible',
      satMal.inf.inf.indexOf('Embarazo contraindicado') === -1],
    ['y se declara como fuera de rango en vez de callarse',
      satMal.inf.inf.indexOf('fuera de rango') > -1],
    // La linea base y el seguimiento.
    ['el EN SUMA siempre lleva la linea base: no es un hallazgo incidental',
      sat93.inf.suma.indexOf('Síndrome de Eisenmenger sobre comunicación interventricular') > -1],
    ['y el informe cierra con el seguimiento',
      sat93.inf.inf.indexOf('Control cada 6-12 meses') > -1 &&
      sat93.inf.inf.indexOf('Saturación de oxígeno en cada visita') > -1],
    // El panel de contraindicaciones va SIEMPRE visible, no condicionado a ningun campo.
    ['el panel de contraindicaciones absolutas esta siempre en la seccion',
      (document.getElementById('sacc-cc-eisen').textContent || '').indexOf('Contraindicaciones absolutas') > -1],
    /* Mismo defecto que Fontan, cerrado el mismo dia: los .calc-row del panel no llevan id y
       limpiarCampos no pasa por RECALC_MODULOS, asi que la saturacion del paciente anterior
       seguia en pantalla despues de «Nuevo estudio». */
    ['el panel del paciente anterior no sobrevive a Nuevo estudio', (function(){
      __t.limpiar(); __t.set('eis_lesion_base','civ'); __t.set('eis_saturacion_reposo','82');
      eisenSync();
      const pan = document.getElementById('eisen-resultado');
      const antes = (pan.textContent || ''); __t.limpiar();
      return antes.indexOf('82') > -1 && (pan.textContent || '').indexOf('82') === -1;
    })()]
  ] };
`);

/* FONTAN — LAS COMPLICACIONES TIENEN TRES ESTADOS, NO DOS. «Ninguna casilla marcada» NO es «sin
   complicaciones»: es «nadie las interrogo». Por eso hay una casilla explicita, y por eso el caso
   prueba los TRES estados por separado — el que mas importa es el del medio, que no puede afirmar
   ninguna de las dos cosas. Mismas reglas que Eisenmenger para saturacion y campos vacios. */
caso('TC-118', 'Fontan: alertas, complicaciones en tres estados y riesgo de embarazo', `
  function e(o) { __t.limpiar();
    __t.set('fontan_tipo', o.tipo || 'extra');
    if (o.fen  != null) __t.set('fontan_fenestracion', o.fen);
    if (o.sat  != null) __t.set('fontan_saturacion', String(o.sat));
    if (o.fevi != null) __t.set('fontan_vs_fevi', String(o.fevi));
    if (o.it   != null) __t.set('fontan_it_grado', o.it);
    if (o.asc  != null) __t.set('fontan_ascitis', o.asc);
    if (o.pleu != null) __t.set('fontan_derrame_pleural', o.pleu);
    if (o.nyha != null) __t.set('fontan_clase_nyha', o.nyha);
    (o.comp || []).forEach(id => __t.chk(id, true));
    __t.chk('fontan_incluir_chk', true);
    const r = fontanEstado();
    return { r, inf: __t.informe() };
  }
  const sat88 = e({ sat:88 }), sat89 = e({ sat:89 }), sat90 = e({ sat:90 }), sat95 = e({ sat:95 });
  const satMal = e({ sat:9 });                          // 9 por 90: numero ilegible
  const itSev = e({ sat:95, it:'severa' }), itMod = e({ sat:95, it:'moderada' });
  const itLev = e({ sat:95, it:'leve' }),   itNo   = e({ sat:95, it:'no' });
  const ascMod = e({ sat:95, asc:'moderada' }), ascLev = e({ sat:95, asc:'leve' });
  const pleuSev = e({ sat:95, pleu:'severo' });
  const epp  = e({ sat:95, comp:['fontan_comp_epp'] });
  const fald = e({ sat:95, comp:['fontan_comp_fald'] });
  const ning = e({ sat:95, comp:['fontan_comp_ninguna'] });
  const vacio = e({ sat:95 });                          // nadie interrogo las complicaciones
  const feviMal = e({ sat:95, fevi:5 });                // fuera de la banda 10-85
  return { extra: [
    // Saturacion: los dos lados del corte, y el numero ilegible.
    ['sat 88 dispara la alerta de circuito',
      sat88.inf.inf.indexOf('obstrucción del circuito de Fontan') > -1],
    ['sat 89 tambien: el corte es <90',
      sat89.inf.inf.indexOf('obstrucción del circuito de Fontan') > -1],
    ['sat 90 exactos NO la dispara',
      sat90.inf.inf.indexOf('obstrucción del circuito') === -1],
    ['sat 95 tampoco', sat95.inf.inf.indexOf('obstrucción del circuito') === -1],
    ['y la alerta de saturacion sube al EN SUMA',
      sat88.inf.suma.indexOf('obstrucción del circuito') > -1],
    ['una saturacion de 9 % no alerta: es ilegible, no critica',
      satMal.inf.inf.indexOf('obstrucción del circuito') === -1],
    ['y se declara fuera de rango en vez de callarse',
      satMal.inf.inf.indexOf('fuera de rango') > -1],
    ['la banda tambien corre para la FEVI del ventriculo sistemico',
      feviMal.inf.inf.indexOf('fuera de rango') > -1 && feviMal.r.feviOk === false],
    // Insuficiencia AV: moderada y severa alertan; leve y sin IT, no.
    ['IT severa alerta en el informe',
      itSev.inf.inf.indexOf('marcador de disfunción del ventrículo sistémico') > -1],
    ['IT moderada tambien', itMod.inf.inf.indexOf('marcador de disfunción del ventrículo sistémico') > -1],
    ['IT leve no alerta',   itLev.inf.inf.indexOf('marcador de disfunción') === -1],
    ['sin IT tampoco',      itNo.inf.inf.indexOf('marcador de disfunción') === -1],
    // Derrame y ascitis: moderado/severo mandan evaluacion urgente.
    ['ascitis moderada manda evaluacion urgente',
      ascMod.inf.inf.indexOf('fallo de Fontan o enteropatía pierdeproteínas') > -1 &&
      ascMod.inf.inf.indexOf('Evaluación urgente') > -1],
    ['ascitis leve no',     ascLev.inf.inf.indexOf('fallo de Fontan o enteropatía') === -1],
    ['derrame pleural severo tambien la manda',
      pleuSev.inf.inf.indexOf('fallo de Fontan') > -1],
    // Complicaciones: cada una con su texto propio.
    ['enteropatia marcada imprime su texto especifico',
      epp.inf.inf.indexOf('hipoalbuminemia y ascitis') > -1],
    ['FALD marcado imprime el suyo',
      fald.inf.inf.indexOf('universal en esta circulación') > -1],
    ['y cada complicacion sube al EN SUMA, que es donde se actua',
      epp.inf.suma.indexOf('enteropatía pierdeproteínas') > -1],
    // LOS TRES ESTADOS. El del medio es el que no puede afirmar nada.
    ['«Sin complicaciones» marcado lo dice y no lista ninguna',
      ning.inf.inf.indexOf('Sin complicaciones consignadas') > -1 &&
      ning.inf.inf.indexOf('hipoalbuminemia') === -1 && ning.r.sinComp === true],
    ['ninguna casilla marcada NO afirma la ausencia: no dice «sin complicaciones»',
      vacio.inf.inf.indexOf('Sin complicaciones consignadas') === -1 && vacio.r.sinComp === false],
    ['y tampoco inventa una alerta', vacio.r.comps.length === 0],
    // Embarazo: clase IV solo con complicaciones; clase III solo si se interrogaron.
    ['con complicaciones el embarazo esta contraindicado, clase IV',
      epp.inf.inf.indexOf('clase IV de la OMS') > -1 &&
      epp.inf.suma.indexOf('embarazo contraindicado, clase IV de la OMS') > -1],
    ['sin complicaciones consignadas es clase III, que NO es contraindicacion',
      ning.inf.inf.indexOf('clase III de la OMS') > -1 &&
      ning.inf.inf.indexOf('clase IV') === -1],
    ['la clase III NO sube al EN SUMA: es seguimiento, no contraindicacion',
      ning.inf.suma.indexOf('clase III') === -1],
    ['sin interrogar las complicaciones no se declara ninguna clase de riesgo',
      vacio.inf.inf.indexOf('clase III de la OMS') === -1 &&
      vacio.inf.inf.indexOf('clase IV de la OMS') === -1],
    // Linea base y seguimiento.
    ['el EN SUMA siempre lleva la linea base: un Fontan no es un hallazgo incidental',
      sat95.inf.suma.indexOf('Circulación de Fontan') > -1],
    ['y el informe cierra con el seguimiento',
      sat95.inf.inf.indexOf('Ecocardiograma anual obligatorio') > -1 &&
      sat95.inf.inf.indexOf('Control hepático periódico') > -1],
    /* EL PANEL NO PUEDE SOBREVIVIR A «Nuevo estudio». Sus .calc-row no llevan id, asi que el
       barrido de limpiarCampos no los alcanza: sin la llamada explicita a fontanSync, la
       saturacion critica y las complicaciones del paciente A quedaban en pantalla con el
       formulario en blanco. Medido antes y despues del arreglo. */
    ['el panel del paciente anterior no sobrevive a Nuevo estudio', (function(){
      __t.limpiar(); __t.set('fontan_tipo','extra'); __t.set('fontan_saturacion','82');
      __t.chk('fontan_comp_epp', true); fontanSync();
      const pan = document.getElementById('fontan-resultado');
      const antes = (pan.textContent || ''); __t.limpiar();
      const desp = (pan.textContent || '');
      return antes.indexOf('enteropat') > -1 && desp.indexOf('enteropat') === -1 && desp.indexOf('82') === -1;
    })()]
  ] };
`);

/* LA PLANTILLA NO PUEDE ENSEÑAR UN VALOR QUE EL IMPORTADOR RECHAZA. Marfan, Eisenmenger y Fontan
   entraron al Excel con 18 columnas declaradas «vocab» y CERO entradas en LAB_XLS_VOCAB: el
   importador devolvia null y descartaba la FILA ENTERA —nombre, cedula, FEVI, informe—, asi que
   un estudio de esas tres secciones no volvia nunca de su propio Excel. Y como la ayuda se habia
   escrito a mano en LAB_XLS_OPCIONES, la plantilla mostraba el formato que el importador
   rechazaba. La app lo gritaba en la consola desde el arranque, tres commits seguidos.
   Este caso cubre las TRES puntas: que no quede ninguna columna sin vocabulario, que lo que la
   app EXPORTA lo acepte el importador, y que la ayuda no ofrezca nada que no acepte. */
caso('TC-119', 'Excel: ninguna columna vocab sin vocabulario, y la plantilla no miente', `
  const sinVocab = _labXlsAssertVocab();
  const CAMPOS = ['coa_hta','vab_simetria','marfan_sindrome','marfan_factores_riesgo',
    'eis_lesion_base','eis_vd_funcion','eis_pericardio','eis_clase_nyha','eis_sincope','eis_hemoptisis',
    'fontan_tipo','fontan_fenestracion','fontan_vs_morfologia','fontan_it_grado',
    'fontan_derrame_pleural','fontan_ascitis','fontan_clase_nyha','fontan_arritmia'];
  /* La vuelta que importa: por cada token del <select>, la ETIQUETA que exporta la app tiene que
     volver a resolver al MISMO token. No es tautologico —era justo lo que estaba roto: el
     exportador emitia Tunel lateral y el importador no lo conocia—. */
  const ida = [];
  CAMPOS.forEach(c => {
    Object.keys(LAB_XLS_ETIQ[c] || {}).forEach(tok => {
      const etq = _labXlsEtiq(c, tok);
      const vuelta = _labXlsVocab(c, etq);
      if (vuelta !== tok) ida.push(c + ': ' + tok + ' -> ' + etq + ' -> ' + vuelta);
    });
  });
  /* Y que el <select> de la pantalla y el mapa de etiquetas hablen de los mismos valores: un
     token que exista en el Excel y no en el select es una columna que nadie puede llenar. */
  const desfasados = [];
  CAMPOS.forEach(c => {
    const el = document.getElementById(c); if (!el || el.tagName !== 'SELECT') return;
    const opts = [...el.options].map(o => o.value).filter(Boolean).sort().join(',');
    const toks = Object.keys(LAB_XLS_ETIQ[c] || {}).sort().join(',');
    if (opts !== toks) desfasados.push(c + ' select=[' + opts + '] etiq=[' + toks + ']');
  });
  /* La ayuda de la plantilla: cada valor que ofrece tiene que ser aceptado. */
  const ayudaMentirosa = [];
  CAMPOS.forEach(c => {
    (LAB_XLS_OPCIONES[c] || '').split(' · ').filter(Boolean).forEach(op => {
      if (_labXlsVocab(c, op) === null) ayudaMentirosa.push(c + ': ofrece "' + op + '" y lo rechaza');
    });
  });
  return { extra: [
    ['ninguna columna vocab quedo sin vocabulario', sinVocab.length === 0, 'faltan: ' + sinVocab.join(' | ')],
    ['los 18 campos nuevos tienen etiquetas', CAMPOS.every(c => !!LAB_XLS_ETIQ[c])],
    ['lo que la app exporta, el importador lo acepta y resuelve al mismo token',
      ida.length === 0, ida.slice(0,4).join(' | ')],
    ['el select de pantalla y el mapa de Excel manejan los mismos valores',
      desfasados.length === 0, desfasados.slice(0,3).join(' | ')],
    ['la ayuda de la plantilla no ofrece nada que el importador rechace',
      ayudaMentirosa.length === 0, ayudaMentirosa.slice(0,4).join(' | ')]
  ] };
`);

/* AUDITORIA DE limpiarCampos SOBRE LAS DOCE SECCIONES DE CONGENITAS. El barrido exige id
   (.calc-box .calc-row span[id]) y limpiarCampos NO pasa por RECALC_MODULOS, asi que una seccion
   cuyo panel se pinte con spans sin id deja el del paciente ANTERIOR en pantalla. Eisenmenger y
   Fontan lo tenian; el commit anterior los cerro nombrandolos en limpiarCampos. Este caso audita
   las DOCE de una vez, en vez de ir descubriendolas de a una. */
caso('TC-120', 'Congenitas: ningun panel de seccion sobrevive a Nuevo estudio', `
  /* EL INVARIANTE: despues de «Nuevo estudio» el panel tiene que volver EXACTAMENTE a su estado
     vacio. Es mejor que buscar el valor tipeado por dos motivos que ya costaron dos pasadas de
     este mismo caso: un entero corto —un 5, un 4— matchea los numeros de las tablas de
     referencia que viven en la misma seccion (cuatro falsos positivos), y una seccion que no
     reacciona con un solo campo se salteaba en SILENCIO (nueve de trece no median nada).
     Comparar contra la linea base caza cualquier residuo y no necesita valor distinguible.
     Los contenedores son los REALES, leidos del archivo: nueve terminan en -concl y tres en
     -resultado. Inventar el id no falla, calla. */
  const SECS = [
    ['vab',    'vab-concl',       { vab_fenotipo:'raiz', vab_tipo:'fused_rl' }],
    ['coa',    'coa-concl',       { coa_situacion:'nativa', coa_gradiente_picopico:'34' }],
    ['fop',    'fop-concl',       { fop_burbujas:'abundante', fop_tunel:'12' }],
    ['mch',    'mch-concl',       { mch_espesor:'22' }],
    ['mca',    'mca-concl',       { mca_tsvd_plax:'38' }],
    ['tdf',    'tdf-concl',       { ip_grado:'severa', tdf_civ_grad:'31' }],
    ['dap',    'dap-concl',       { dap_tipo:'tubular', dap_diam:'4' }],
    ['vap',    'vap-concl',       { vap_tipo:'simple', vap_diam:'6' }],
    ['tga',    'tga-concl',       { tga_tipo:'mustard', tga_func_vd:'moderada' }],
    ['ebs',    'ebs-concl',       { ebs_desplazamiento:'22', ebs_area_vd_atrial:'28', ebs_area_vd_func:'14' }],
    ['marfan', 'marfan-resultado',{ marfan_sindrome:'marfan', marfan_ao_seno:'47' }],
    ['eisen',  'eisen-resultado', { eis_lesion_base:'civ', eis_saturacion_reposo:'82' }],
    ['fontan', 'fontan-resultado',{ fontan_tipo:'extra', fontan_saturacion:'82' }]
  ];
  const sinCont = [], mudas = [], sucias = [];
  SECS.forEach(function(t) {
    const k = t[0], contId = t[1], campos = t[2];
    const cont = document.getElementById(contId);
    if (!cont) { sinCont.push(k + ': no existe #' + contId); return; }
    __t.limpiar();
    const base = (cont.textContent || '').trim();
    Object.keys(campos).forEach(function(id) { __t.set(id, campos[id]); });
    const vivo = (cont.textContent || '').trim();
    /* Denominador: si el panel no cambia al cargar datos, este caso no esta probando nada sobre
       esa seccion. Se REPORTA en vez de saltearse. */
    if (vivo === base) { mudas.push(k); return; }
    __t.limpiar();
    if ((cont.textContent || '').trim() !== base) sucias.push(k);
  });
  return { extra: [
    ['los trece contenedores de conclusion existen', sinCont.length === 0, sinCont.join(' | ')],
    ['las trece secciones reaccionan al dato: hay sobre que medir', mudas.length === 0, 'mudas: ' + mudas.join(', ')],
    ['ninguna deja el panel del paciente anterior tras Nuevo estudio', sucias.length === 0, 'sucias: ' + sucias.join(', ')]
  ] };
`);

/* TdF REPARADA — EL CRITERIO VOLUMETRICO ESTABA EN LA PROSA Y NO PODIA APLICARSE. Las tres ramas
   de tdfConclusion decian «el criterio volumetrico se evalua por RESONANCIA», y no habia campo:
   un asintomatico con IP severa y VTDVD indexado de 180 salia «sin criterios de reintervencion
   por los datos cargados» con el criterio que lo indica impreso dos renglones mas arriba.
   Umbrales ESC 2020 (Baumgartner, EHJ 2021;42:563): VTDVDi >=160 o VTSVDi >=80.
   EL METODO IMPORTA TANTO COMO EL NUMERO: estos volumenes no los mide un eco, se transcriben, y
   el umbral esta validado sobre resonancia. Por eco 3D —que SUBESTIMA— el valor se declara y NO
   vota. Es la leccion de coaConclusion: el numero correcto medido con el metodo equivocado. */
caso('TC-121', 'TdF: el criterio volumetrico del VD vota, y solo medido por resonancia', `
  function e(o) { __t.limpiar();
    __t.set('tdf_sintomas', o.sint || 'no');
    __t.set('ip_grado', o.ip || 'Severa');
    if (o.vtd != null) __t.set('tdf_vtdvdi', String(o.vtd));
    if (o.vts != null) __t.set('tdf_vtsvdi', String(o.vts));
    if (o.fuente != null) __t.set('tdf_vol_fuente', o.fuente);
    __t.chk('tdf_incluir_chk', true);
    const c = tdfConclusion();
    return { c, inf: __t.informe() };
  }
  const rmc = 'rmc';
  const d159 = e({ vtd:159, fuente:rmc }), d160 = e({ vtd:160, fuente:rmc });
  const s79  = e({ vts:79,  fuente:rmc }), s80  = e({ vts:80,  fuente:rmc });
  const eco  = e({ vtd:180, fuente:'eco3d' });
  const sinF = e({ vtd:180 });
  const tcx  = e({ vtd:180, fuente:'tc' });
  const bajo = e({ vtd:120, vts:40, fuente:rmc });
  const ilegible = e({ vtd:1800, fuente:rmc });
  const conSint = e({ vtd:180, fuente:rmc, sint:'si' });
  return { extra: [
    // Los dos lados de cada corte. 159 y 79 no alcanzan; 160 y 80 exactos si.
    ['VTDVD 160 exactos dan criterio IIa', d160.c.clave === 'reintervencion_iia'],
    ['VTDVD 159 no', d159.c.clave !== 'reintervencion_iia'],
    ['VTSVD 80 exactos dan criterio IIa', s80.c.clave === 'reintervencion_iia'],
    ['VTSVD 79 no', s79.c.clave !== 'reintervencion_iia'],
    ['el criterio se nombra en el informe con su valor',
      d160.inf.inf.indexOf('dilatación del ventrículo derecho por resonancia') > -1 &&
      d160.inf.inf.indexOf('160 ml/m²') > -1],
    // EL METODO: por eco 3D el valor se declara y NO vota.
    ['por eco 3D no vota', eco.c.clave !== 'reintervencion_iia'],
    ['pero el valor SI se describe: es dato clinico',
      eco.inf.inf.indexOf('180 ml/m²') > -1],
    ['y se dice por que no cuenta, nombrando la subestimacion',
      eco.inf.inf.indexOf('SUBESTIMA') > -1],
    ['sin metodo consignado tampoco vota', sinF.c.clave !== 'reintervencion_iia'],
    ['y lo declara en vez de callarlo',
      sinF.inf.inf.indexOf('No consta con qué método se midieron') > -1],
    ['por tomografia tampoco vota', tcx.c.clave !== 'reintervencion_iia'],
    // Valores por debajo del umbral: la rama de vigilancia deja de PROMETER la resonancia.
    ['con volumenes normales por resonancia no hay criterio', bajo.c.clave !== 'reintervencion_iia'],
    ['y el informe deja de mandar a hacer una resonancia que ya se hizo',
      bajo.inf.inf.indexOf('se miden por RESONANCIA: VTDVD') === -1 &&
      bajo.inf.inf.indexOf('por debajo del umbral') > -1],
    // Banda de plausibilidad: 1800 ml/m2 es ilegible.
    ['un volumen de 1800 ml/m2 no vota', ilegible.c.clave !== 'reintervencion_iia'],
    ['y se declara fuera de rango', ilegible.c.clave === 'no_interpretable'],
    // Con sintomas manda la Clase I: el volumetrico no la degrada.
    ['con sintomas sigue siendo Clase I', conSint.c.clave === 'reintervencion_i'],
    ['y ahi el texto no promete una resonancia pendiente',
      conSint.inf.inf.indexOf('se evalúa por RESONANCIA') === -1]
  ] };
`);

/* EL ACORDEON QUE NO ABRE. `secToggle(id)` resuelve `#sacc-<id>`, y el card de Congenitas se
   llama `sacc-cc-<X>`: siete cabeceras pasaban el token SIN el prefijo `cc-` —marfan, eisen,
   fontan y los cuatro placeholders— asi que buscaban un id inexistente, `secToggle` salia por su
   `if (!acc) return` y el boton quedaba MUERTO: visible, clicable, sin efecto.
   NINGUNA prueba lo veia, y por eso este caso existe: TC-112 verifica que la seccion y su
   cabecera EXISTAN, y TC-120 lee el CONTENIDO del panel —que esta en el DOM abierto o cerrado—.
   Ver que algo esta no es lo mismo que poder alcanzarlo. Este caso CLIQUEA de verdad las
   cabeceras de TODOS los acordeones de la app y exige que la clase `open` cambie. */
caso('TC-122', 'Todos los acordeones abren de verdad al tocar su cabecera', `
  const cards = [...document.querySelectorAll('.sacc[id^=sacc-]')];
  const muertos = [], sinHdr = [], noCierran = [];
  cards.forEach(function(acc) {
    const hdr = acc.querySelector('.sacc-hdr');
    if (!hdr) { sinHdr.push(acc.id); return; }
    const antes = acc.classList.contains('open');
    hdr.click();
    if (acc.classList.contains('open') === antes) { muertos.push(acc.id); return; }
    /* Y que vuelva: un toggle que solo abre tampoco es un toggle. */
    hdr.click();
    if (acc.classList.contains('open') !== antes) noCierran.push(acc.id);
  });
  /* El cruce estatico que da el diagnostico exacto cuando alguno falla: que el token que recibe
     secToggle resuelva a un id que existe. */
  const rotos = [];
  cards.forEach(function(acc) {
    const hdr = acc.querySelector('.sacc-hdr'); if (!hdr) return;
    /* SIN REGEX A PROPOSITO. La primera version usaba /secToggle\\('([^']+)'\\)/ y el cuerpo de un
       caso es un TEMPLATE LITERAL: se come una barra invertida, el regex emitido quedo sin los
       parentesis escapados y no matcheo NUNCA — los 28 acordeones dieron «no llama a secToggle»
       y el caso acusaba a la app de un defecto que estaba en el caso. Es la misma trampa que ya
       documenta CLAUDE.md con el \\s. Partir la cadena no tiene escapes que perder. */
    const oc = hdr.getAttribute('onclick') || '';
    const i = oc.indexOf("secToggle('");
    if (i < 0) { rotos.push(acc.id + ': la cabecera no llama a secToggle'); return; }
    const j = oc.indexOf("'", i + 11);
    const tok = j > -1 ? oc.slice(i + 11, j) : '';
    if (!tok) { rotos.push(acc.id + ': no se pudo leer el token de secToggle'); return; }
    if (!document.getElementById('sacc-' + tok)) rotos.push(acc.id + ': secToggle("' + tok + '") busca #sacc-' + tok + ', que no existe');
  });
  return { extra: [
    ['hay acordeones sobre que medir', cards.length >= 25, 'encontrados: ' + cards.length],
    ['todos tienen cabecera', sinHdr.length === 0, sinHdr.join(', ')],
    ['todos ABREN al tocar la cabecera', muertos.length === 0, 'muertos: ' + muertos.join(', ')],
    ['y todos vuelven a cerrar', noCierran.length === 0, 'no cierran: ' + noCierran.join(', ')],
    ['ninguna cabecera apunta a un id inexistente', rotos.length === 0, rotos.join(' | ')]
  ] };
`);

/* EL ROTULO DE UNA PESTAÑA VIVE EN CUATRO SUPERFICIES. El boton, la casilla de Config
   (EE_MODULES), el desplegable de movil —que deriva su texto del boton— y el MANUAL, que
   enumera el contenido de cada pestaña y por eso se desactualiza en silencio con cada mudanza:
   CLAUDE.md ya tenia una entrada sobre esto y aun asi el manual decia que CIA/CIV estaba en la
   pestaña equivocada y que Congenitas tenia «tres secciones» cuando son diecinueve.
   Los IDs NO se renombran —congenitas y congenitas2 son los que usan showTab, data-mod y las
   preferencias guardadas en localStorage—: lo que cambia es el texto. */
caso('TC-123', 'CC frecuentes y CC complejas: el rotulo dice lo mismo en las cuatro superficies', `
  /* SIN COMILLAS ANIDADAS: el cuerpo de un caso es un template literal y se come la barra
     invertida, asi que el selector emitido quedaba con la cadena cortada y rompia el parseo del
     archivo ENTERO —«SyntaxError: missing ) after argument list»—. Se busca por indexOf sobre el
     atributo, que no tiene nada que escapar. Tercera vez esta semana con la misma trampa. */
  const btns = [...document.querySelectorAll('.tab-btn')];
  const porTab = id => btns.filter(b => (b.getAttribute('onclick') || '').indexOf("showTab('" + id + "')") > -1)[0];
  const bI  = porTab('congenitas');
  const bII = porTab('congenitas2');
  const txt = b => b ? (b.textContent || '').trim() : '(sin boton)';
  const sel = document.getElementById('ecoAdvSelect');
  try { ecoAdvBuild(); } catch (e) {}
  const ops = sel ? [...sel.options].map(o => (o.textContent || '').trim()) : [];
  const cfg = (typeof EE_MODULES !== 'undefined')
    ? (EE_MODULES.filter(m => m.key === 'congenitas')[0] || {}).label : '(sin EE_MODULES)';
  const manual = (typeof ECO_AYUDA !== 'undefined')
    ? ECO_AYUDA.map(a => (a.tab || '') + ' ' + (a.html || '')).join(' ') : '';
  const cuerpo = document.body.textContent || '';
  return { extra: [
    ['la primera se llama CC frecuentes', txt(bI)  === '🧬 CC frecuentes'],
    ['la segunda se llama CC complejas',  txt(bII) === '🧬 CC complejas'],
    /* Los IDs son contrato: los usan showTab, data-mod y ett_modules en localStorage. */
    ['los ids NO cambiaron', !!document.getElementById('tab-congenitas') && !!document.getElementById('tab-congenitas2')],
    ['las dos pestañas siguen compartiendo el modulo, o Config gobierna media',
      bI.getAttribute('data-mod') === 'congenitas' && bII.getAttribute('data-mod') === 'congenitas'],
    ['la casilla de Config avisa que gobierna las DOS', /frecuentes y complejas/.test(String(cfg))],
    ['el desplegable de movil hereda los dos nombres',
      ops.indexOf('🧬 CC frecuentes') > -1 && ops.indexOf('🧬 CC complejas') > -1],
    /* El nombre viejo no puede sobrevivir en NINGUNA superficie visible: un manual que nombra
       una pestaña que ya no existe manda al medico a buscar algo que no va a encontrar. */
    /* NINGUNO de los dos nombres anteriores puede sobrevivir: «CC estructurales» fue el primero
       y «Congenitas I/II» el segundo. Un manual que nombra una pestaña que ya no existe manda al
       medico a buscar algo que no va a encontrar. */
    ['los nombres viejos no quedan en el manual',
      manual.indexOf('CC estructurales') === -1 && manual.indexOf('Congénitas I') === -1 &&
      manual.indexOf('Congénitas II') === -1],
    ['ni en ninguna parte visible de la app',
      cuerpo.indexOf('CC estructurales') === -1 && cuerpo.indexOf('Congénitas II') === -1],
    /* Y las dos afirmaciones del manual que el reparto habia dejado FALSAS. */
    /* Se verifica el HECHO —CIA/CIV se describe bajo el encabezado de CC complejas y NO bajo el
       de CC frecuentes— y no una oracion literal. La version anterior exigia la frase exacta
       «CC complejas</b>, primera de sus secciones», que era la redaccion de un manual concreto:
       cualquier reescritura legitima la ponia en rojo sin que el dato hubiera dejado de ser
       cierto. El invariante nuevo sigue cayendo si alguien mueve CIA/CIV de pestaña. */
    ['el manual describe CIA/CIV bajo CC complejas y no bajo CC frecuentes',
      (function(){
        const iF = manual.indexOf('🧬 CC frecuentes'), iC = manual.lastIndexOf('🧬 CC complejas');
        if (iF < 0 || iC < 0 || iC <= iF) return false;
        const enFrec = manual.slice(iF, iC), enComp = manual.slice(iC);
        return enComp.indexOf('CIA / CIV') > -1 && enFrec.indexOf('CIA / CIV') === -1;
      })()],
    ['y ya no dice que Congenitas tiene tres secciones', manual.indexOf('primera de las tres secciones') === -1]
  ] };
`);

/* EBSTEIN — LA SATURACION CONVIERTE «HAY UNA COMUNICACION» EN «HAY UN SHUNT QUE DESATURA».
   La seccion ya detectaba la CIA y el foramen desde sus secciones reales, y su propio comentario
   decia que «una CIA con shunt derecha-izquierda es lo que produce cianosis y lo que se cierra en
   el acto quirurgico» — pero no habia con que saber si ese shunt era derecha-izquierda.
   El indice de Celermajer y sus cuatro grados YA existian (ebsCelermajer), con estos mismos
   cortes; este caso los fija de paso, por los dos lados de cada uno.
   EL 90 % NO SE ATRIBUYE A LA GUIA: la ESC 2020 nombra la cianosis entre los desencadenantes de
   intervencion en Ebstein pero no publica un numero para Ebstein. */
caso('TC-124', 'Ebstein: cianosis y los cuatro grados de Celermajer', `
  function e(o) { __t.limpiar();
    __t.set('ebs_desplazamiento', '25'); __t.set('peso','80'); __t.set('talla','180');
    if (o.areas) { __t.set('ebs_area_ad', String(o.areas[0])); __t.set('ebs_area_vd_atrial', String(o.areas[1]));
      __t.set('ebs_area_vd_func', String(o.areas[2])); __t.set('ebs_area_ai', String(o.areas[3]));
      __t.set('ebs_area_vi', String(o.areas[4])); }
    if (o.sat != null) __t.set('ebs_saturacion', String(o.sat));
    if (o.it)   __t.set('it_grado', o.it);
    if (o.sint) __t.set('ebs_sintomas', o.sint);
    if (o.cia)  __t.set('ete_cia_tipo', o.cia);
    __t.chk('ebs_incluir_chk', true);
    const c = ebsConclusion();
    return { c, cel: ebsCelermajer(), inf: __t.informe() };
  }
  /* Denominador 10 exacto (VDfunc 4 + AI 3 + VI 3), asi el numerador ES diez veces el indice.
     El atrializado va en 1 y NO en 0: la banda de plausibilidad de ebsCelermajer exige cada area
     entre 1 y 200 cm2, y con un 0 devolvia fuera — el caso media sobre un indice que nunca se
     calculo y acusaba a los cortes de estar mal. Elegir los insumos mirando la guarda. */
  const g = n => ({ areas: [n - 1, 1, 4, 3, 3] });   // (AD + atrializado) / 10 = n / 10
  const i04 = e(g(4)), i05 = e(g(5)), i099 = e(g(9.9)), i10 = e(g(10)), i149 = e(g(14.9)), i15 = e(g(15));
  const sat88 = e({ sat:88 }), sat90 = e({ sat:90 }), sat92 = e({ sat:92 });
  const satMal = e({ sat:9 });
  const vacio  = e({});
  const conCia = e({ sat:88, cia:'secundum' });   // token REAL del select, no inventado
  const claseI = e({ sat:88, it:'4', sint:'si' });
  return { extra: [
    // Los cuatro grados, por los dos lados de cada corte.
    ['indice 0.40 es grado 1', i04.cel.grado === 1],
    ['indice 0.50 exacto pasa a grado 2', i05.cel.grado === 2],
    ['indice 0.99 sigue en grado 2', i099.cel.grado === 2],
    ['indice 1.00 exacto pasa a grado 3', i10.cel.grado === 3],
    ['indice 1.49 sigue en grado 3', i149.cel.grado === 3],
    ['indice 1.50 exacto pasa a grado 4', i15.cel.grado === 4],
    /* EL INDICE DESCRIBE, NO INDICA. Un grado 4 sin sintomas, sin IT severa y sin cianosis NO
       puede producir una indicacion: la ESC 2020 no contiene este indice —verificado por
       busqueda de texto completo, ver el comentario de ebsCelermajer— y fue derivado en 28
       NEONATOS. El informe lo dice con todas las letras. */
    ['un Celermajer grado 4 aislado NO indica intervencion',
      i15.c.clave !== 'cirugia' && i15.c.clave !== 'considerar_cirugia' && i15.c.clave !== 'cianosis'],
    ['y el informe declara que la indicacion de la ESC no depende del indice',
      i15.inf.inf.indexOf('La indicación quirúrgica de la ESC 2020 es clínica y no depende de este índice') > -1],
    ['y que el eco sobreestima y la serie era neonatal',
      i15.inf.inf.indexOf('SOBREESTIMAR') > -1 && i15.inf.inf.indexOf('serie neonatal') > -1],
    // Cianosis: los dos lados del corte.
    ['sat 88 da cianosis',  sat88.c.clave === 'cianosis'],
    ['sat 90 exactos NO',   sat90.c.clave !== 'cianosis'],
    ['sat 92 tampoco',      sat92.c.clave !== 'cianosis'],
    ['la cianosis sube al EN SUMA', sat88.inf.suma.indexOf('cianosis') > -1],
    ['y se nombra a la ESC 2020 como quien la lista, sin inventarle un numero',
      sat88.inf.inf.indexOf('la ESC 2020 incluye la cianosis entre los desencadenantes') > -1 &&
      sat88.inf.inf.indexOf('<90 % (ESC 2020)') === -1],
    // Sin comunicacion documentada no se promete cerrar nada; con ella, si.
    ['sin CIA documentada manda a buscarla en vez de prometer el cierre',
      sat88.inf.inf.indexOf('obliga a buscarla') > -1 &&
      sat88.inf.inf.indexOf('cerrarla en el mismo acto') === -1],
    ['con CIA documentada nombra el cierre en el mismo acto',
      conCia.inf.inf.indexOf('cerrarla en el mismo acto') > -1],
    // Con Clase I por otra via la cianosis no desaparece del informe.
    ['con indicacion Clase I la cianosis sigue nombrada',
      claseI.c.clave === 'cirugia' && claseI.inf.inf.indexOf('Cianosis asociada') > -1],
    // Campo vacio y valor ilegible.
    ['sin saturacion cargada no hay alerta', vacio.c.clave !== 'cianosis'],
    ['una saturacion de 9 % no da cianosis', satMal.c.clave !== 'cianosis'],
    ['y corta antes de publicar conducta', satMal.c.clave === 'no_interpretable']
  ] };
`);

/* LOS TRES PANELES DE REFERENCIA. Reusan el armazon de MCH/MCA: un solo #crit-overlay, registro
   CRIT_PANELES y critAbrir/critCerrar. Lo que este caso vigila no es que existan sino que:
   (a) ABRAN Y CIERREN de verdad —el boton de una seccion ya quedo muerto una vez, ver TC-122—;
   (b) NINGUN control del panel lleve id. guardarInforme barre input[id] de TODO el documento, asi
       que un checkbox de referencia con id se persistiria en campos de CADA estudio, viajaria al
       Excel y lo contaria detectar_huerfanos. Es la condicion que separa «panel de referencia» de
       «campos clinicos disfrazados»;
   (c) la calculadora de Ghent calcule, por los dos lados del corte de 7. */
caso('TC-125', 'Paneles de criterios: abren, cierran y no ensucian el estudio', `
  const ov = document.getElementById('crit-overlay');
  const cuerpo = document.getElementById('crit-cuerpo');
  const titulo = document.getElementById('crit-titulo');
  const abiertos = [], sinBoton = [], conId = [];
  ['marfan','eisen','fontan'].forEach(function(k) {
    /* El boton tiene que EXISTIR en su seccion, no en cualquier lado. */
    const sec = document.getElementById('sacc-cc-' + k);
    const btn = sec ? [...sec.querySelectorAll('button')].filter(function(b) {
      return (b.getAttribute('onclick') || '').indexOf("critAbrir('" + k + "')") > -1; })[0] : null;
    if (!btn) { sinBoton.push(k); return; }
    btn.click();
    const vis = ov && ov.style.display === 'block';
    const tieneTexto = (cuerpo.textContent || '').trim().length > 200;
    if (vis && tieneTexto) abiertos.push(k);
    /* NINGUN control del panel puede llevar id. */
    [...cuerpo.querySelectorAll('input,select,textarea')].forEach(function(e) {
      if (e.id) conId.push(k + ': ' + e.id); });
    critCerrar();
  });
  const cerroBien = ov && ov.style.display === 'none';
  /* La calculadora de Ghent, por los dos lados del corte. */
  critAbrir('marfan');
  const chks = [...cuerpo.querySelectorAll('[data-mf-p]')];
  const marcar = n => { chks.forEach(function(c) { c.checked = false; });
    let acum = 0;
    chks.forEach(function(c) { const pt = parseFloat(c.getAttribute('data-mf-p'));
      if (acum + pt <= n) { c.checked = true; acum += pt; } });
    critMarfanCalc(); return acum; };
  const seis = marcar(6), msg6 = (cuerpo.querySelector('[data-mf-msg]').textContent || '');
  const siete = marcar(7), msg7 = (cuerpo.querySelector('[data-mf-msg]').textContent || '');
  const badge = (cuerpo.querySelector('[data-mf-badge]').textContent || '').trim();
  /* Aorta Z >= 2 + score >= 7 es una de las cinco vias de Ghent sin historia familiar. */
  const z = cuerpo.querySelector('[data-mf-z]');
  z.value = '2.1'; critMarfanCalc();
  const sf = (cuerpo.querySelector('[data-mf-res-sf]').textContent || '');
  z.value = '1.5'; critMarfanCalc();
  const sfNo = (cuerpo.querySelector('[data-mf-res-sf]').textContent || '');
  /* EL LADO NEGATIVO DE LAS CINCO VIAS. Ghent 2010 exige DOS criterios sin historia familiar:
     ninguno alcanza solo. Sin estos casos, agregar una via de mas —ectopia lentis sola, que es
     el error clasico porque la luxacion del cristalino tambien es aislada o de otra entidad—
     pasaba desapercibido: lo dejo vivo una mutacion. */
  marcar(0); z.value = ''; cuerpo.querySelector('[data-mf-lentis]').checked = true; critMarfanCalc();
  const soloLentis = (cuerpo.querySelector('[data-mf-res-sf]').textContent || '');
  cuerpo.querySelector('[data-mf-lentis]').checked = false; marcar(7); critMarfanCalc();
  const soloScore = (cuerpo.querySelector('[data-mf-res-sf]').textContent || '');
  marcar(0); cuerpo.querySelector('[data-mf-fbn1]').checked = true; critMarfanCalc();
  const soloFbn1 = (cuerpo.querySelector('[data-mf-res-fbn1]') ? '' : (cuerpo.querySelector('[data-mf-res-sf]').textContent || ''));
  cuerpo.querySelector('[data-mf-fbn1]').checked = false;
  /* Y se repone el escenario que usan las condiciones de abajo. */
  marcar(7); z.value = '2.1'; critMarfanCalc();
  /* Con historia familiar alcanza UN criterio mayor. */
  cuerpo.querySelector('[data-mf-hf]').checked = true; critMarfanCalc();
  const cf = (cuerpo.querySelector('[data-mf-res-cf]').textContent || '');
  /* Con EXACTAMENTE UNO. El escenario de arriba trae dos criterios mayores (aorta y score), asi
     que exigir dos seguia pasando: lo dejo vivo una mutacion. «Basta UN criterio mayor» solo se
     prueba con uno solo. */
  marcar(0); z.value = ''; cuerpo.querySelector('[data-mf-fbn1]').checked = true; critMarfanCalc();
  const cfUno = (cuerpo.querySelector('[data-mf-res-cf]').textContent || '');
  cuerpo.querySelector('[data-mf-fbn1]').checked = false; critMarfanCalc();
  const cfCero = (cuerpo.querySelector('[data-mf-res-cf]').textContent || '');
  /* Y el lado que faltaba: criterio mayor presente pero SIN historia familiar. Esta columna
     existe justamente porque la historia familiar cambia la regla; si deja de exigirla,
     diagnostica Marfan con un solo criterio en un paciente sin familiar afectado. Los dos casos
     de arriba tenian la historia familiar marcada, asi que sacarla del predicado sobrevivia. */
  cuerpo.querySelector('[data-mf-hf]').checked = false;
  cuerpo.querySelector('[data-mf-fbn1]').checked = true; critMarfanCalc();
  const cfSinHF = (cuerpo.querySelector('[data-mf-res-cf]').textContent || '');
  cuerpo.querySelector('[data-mf-fbn1]').checked = false;
  critCerrar();
  return { extra: [
    ['los tres botones existen en su seccion', sinBoton.length === 0, 'faltan: ' + sinBoton.join(', ')],
    ['los tres paneles abren con contenido', abiertos.length === 3, 'abrieron: ' + abiertos.join(', ')],
    ['y el overlay cierra', cerroBien],
    ['ningun control del panel lleva id: no se persiste en el estudio',
      conId.length === 0, conId.join(' | ')],
    ['el registro tiene los tres, con titulo',
      !!CRIT_PANELES.marfan && !!CRIT_PANELES.eisen && !!CRIT_PANELES.fontan &&
      CRIT_PANELES.marfan.titulo.indexOf('Ghent 2010') > -1],
    ['score 6 no alcanza el compromiso sistemico', seis === 6 && msg6.indexOf('< 7') > -1],
    ['score 7 exacto si', siete === 7 && msg7.indexOf('≥ 7') > -1],
    ['el badge publica el score sobre 20', badge === '7 / 20'],
    ['Z 2.1 + score 7 cumple criterios de Marfan', sf.indexOf('Cumple criterios') > -1],
    ['Z 1.5 con el mismo score no', sfNo.indexOf('No cumple criterios') > -1],
    ['con historia familiar alcanza un criterio mayor', cf.indexOf('Cumple criterios') > -1],
    ['y con UNO SOLO tambien: eso es lo que dice la regla', cfUno.indexOf('Cumple criterios') > -1],
    ['sin ningun criterio mayor, la historia familiar sola no alcanza',
      cfCero.indexOf('Falta al menos un criterio mayor') > -1],
    ['y sin historia familiar la columna no diagnostica, aunque haya criterio mayor',
      cfSinHF.indexOf('Marcá la historia familiar') > -1 && cfSinHF.indexOf('Cumple') === -1],
    /* El TINTE tiene que acompañar al texto. El verde lo decide ok y el texto lo decide otro
       predicado: sacarle la historia familiar a ok no cambiaba una palabra —el !hf corta
       antes— y dejaba el recuadro en VERDE diciendo «Marcá la historia familiar». Un invariante
       que vive en dos expresiones se desincroniza sin que se vea. */
    ['y el recuadro no queda en verde mientras pide el dato', (function(){
      const el = cuerpo.querySelector('[data-mf-res-cf]');
      return (el.getAttribute('style') || '').indexOf('16,185,129') === -1;
    })()],
    ['ectopia lentis SOLA no diagnostica: Ghent exige dos criterios',
      soloLentis.indexOf('No cumple criterios') > -1],
    ['score sistemico >= 7 solo tampoco', soloScore.indexOf('No cumple criterios') > -1],
    ['mutacion FBN1 sola tampoco', soloFbn1.indexOf('No cumple criterios') > -1],
    /* El panel de Fontan NO puede publicar un corte que la seccion no aplica. */
    ['el panel de Fontan declara que la seccion clasifica por complicaciones',
      critFontan().indexOf('la sección clasifica por las complicaciones consignadas') > -1],
    ['y los tres declaran que no leen ni escriben la seccion',
      [critMarfan(), critEisen(), critFontan()].every(function(h) {
        return h.indexOf('no lee ni escribe ningún campo de la sección') > -1; })]
  ] };
`);

/* SELLO DE VERSION. Existe porque una pestaña abierta hace dias sirve una copia vieja del HTML
   SIN UN SOLO ERROR EN CONSOLA —las secciones nuevas no estan— y eso se ve identico a la app
   rota: ya costo tres diagnosticos.
   Lo que este caso vigila: que el pie publique el sello, que el aviso salga SOLO cuando el
   publicado es mas nuevo, que se pueda cerrar y no vuelva en la sesion, y —lo mas importante—
   que NO BLOQUEE NADA cuando no se puede comparar. Un aviso de actualizacion es una comodidad;
   romper la app por no poder comprobarlo seria peor que el problema que cierra. */
caso('TC-126', 'Sello de version: el pie lo publica y el aviso falla hacia no molestar', `
  const pie = document.getElementById('eco-build-sello');
  const ban = document.getElementById('eco-ver-banner');
  const sello = (pie.textContent || '').trim();
  /* EL BANNER ARRANCA OCULTO — Y SE MIDE LO QUE SE VE, NO EL ATRIBUTO. La primera version
     comprobaba ban.hidden === true y pasaba mientras el banner se DIBUJABA en cada carga: la
     regla [hidden]{display:none} del navegador pierde contra un display:flex en linea. Un caso
     que mira la propiedad en vez del pixel da verde sobre el defecto que viene a cerrar. */
  const vis = () => getComputedStyle(ban).display !== 'none';
  const arrancaOculto = ban.hidden === true && !vis();
  /* Las dos constantes existen y son coherentes entre si. Dos y no una porque una compara contra
     una fecha en GMT y la otra se muestra en hora local. */
  const fmtOk = /^[0-9]{8}-[0-9]{4}$/.test(ECO_BUILD);
  const msOk = typeof ECO_BUILD_MS === 'number' && ECO_BUILD_MS > 1700000000000;
  /* La cadena tiene que describir el MISMO instante que el epoch: si el script las escribiera
     por separado, el pie mostraria una fecha y la comparacion usaria otra. */
  const d = new Date(ECO_BUILD_MS);
  const z = n => (n < 10 ? '0' : '') + n;
  const esperado = d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + '-' + z(d.getHours()) + z(d.getMinutes());
  /* Cierre: oculta y no vuelve en la sesion. */
  /* Se usa LA RUTA DE LA APP y no se pinta a mano: pintarlo desde el caso probaba el navegador,
     no el codigo — sacarle el display al pintor sobrevivia. */
  ecoBannerMostrar();
  const seVeCuandoSeMuestra = vis() && ban.hidden === false;
  ecoBannerCerrar();
  const cerro = ban.hidden === true && !vis();
  const recordo = (function(){ try { return sessionStorage.getItem('eco_ver_oculto') === '1'; } catch (e) { return false; } })();
  /* Con la marca de sesion puesta, chequear otra vez no puede volver a mostrarlo. */
  ecoChequearVersion();
  const siguioOculto = ban.hidden === true;
  try { sessionStorage.removeItem('eco_ver_oculto'); } catch (e) {}
  /* NO BLOQUEA. Se corre con el fetch roto a proposito: si lanzara, la excepcion saldria de aca. */
  const _f = window.fetch;
  let exploto = false;
  window.fetch = function(){ throw new Error('sin red'); };
  try { ecoChequearVersion(); } catch (e) { exploto = true; }
  window.fetch = _f;
  /* Y sobre http/file no se pide nada: no hay con que comparar y pedirlo seria ruido. */
  let pidio = false;
  window.fetch = function(){ pidio = true; return Promise.reject(new Error('x')); };
  ecoChequearVersion();
  window.fetch = _f;
  const enHttp = location.protocol !== 'https:';
  /* LOS DOS LADOS DEL CORTE, sobre el predicado puro: sin esto el caso sólo probaba que el aviso
     no estalla, no que aparezca cuando corresponde. */
  const M = ECO_BUILD_MS;
  const nueva   = ecoVersionMasNueva({ ms: M + 61 * 1000 });
  const justo   = ecoVersionMasNueva({ ms: M + 60 * 1000 });   // el margen NO alcanza
  const igual   = ecoVersionMasNueva({ ms: M });
  const vieja   = ecoVersionMasNueva({ ms: M - 3600 * 1000 }); // esta copia es la mas nueva
  const dias    = ecoVersionMasNueva({ ms: M + 4 * 86400 * 1000 });
  const basura  = [null, undefined, {}, { ms: 'x' }, { ms: NaN }, { ms: Infinity }]
    .map(function(x){ return ecoVersionMasNueva(x); });
  return { extra: [
    ['un publicado 61 s mas nuevo avisa', nueva === true],
    ['exactamente en el margen de 60 s NO avisa', justo === false],
    ['el mismo sello no avisa', igual === false],
    ['una copia local MAS NUEVA que la publicada no avisa', vieja === false],
    ['cuatro dias de diferencia avisa: es el caso que costo medio dia', dias === true],
    ['un version.json ausente o ilegible no avisa: se calla, no adivina',
      basura.every(function(x){ return x === false; })],
    ['el pie publica el sello', /^v[0-9]{8}-[0-9]{4}$/.test(sello), 'dice: ' + sello],
    ['el aviso arranca oculto, y no solo en el atributo', arrancaOculto],
    ['y cuando se muestra, se ve de verdad', seVeCuandoSeMuestra],
    ['el sello tiene formato YYYYMMDD-HHMM', fmtOk, 'ECO_BUILD = ' + ECO_BUILD],
    ['hay epoch para comparar, y es una fecha real', msOk],
    ['la cadena y el epoch describen el MISMO instante', ECO_BUILD === esperado,
      'cadena ' + ECO_BUILD + ' vs epoch ' + esperado],
    ['el pie muestra exactamente la constante', sello === 'v' + ECO_BUILD],
    ['la X cierra el aviso', cerro],
    ['y lo recuerda por la sesion', recordo],
    ['con la marca puesta no vuelve a aparecer', siguioOculto],
    ['un fetch que lanza NO rompe la app', exploto === false],
    ['fuera de https no se pide nada: no hay con que comparar',
      enHttp ? pidio === false : true, 'protocolo: ' + location.protocol]
  ] };
`);

/* ESTENOSIS SUBAORTICA — GRADUA EL GRADIENTE MEDIO, NO EL PICO. La ESC 2020 adapto la definicion
   de obstruccion SEVERA del tracto de salida izquierdo, a CUALQUIER nivel, al gradiente MEDIO
   >=40 mmHg a flujo normal. El pedido graduaba por el PICO con cortes 20/40: un pico de 45 con
   medio de 24 es moderada para la guia, y publicarlo como «severa, evaluar cirugia» al lado de
   la sigla ESC 2020 es una cita falsa. Es el mismo defecto que ya costo la coartacion. */
caso('TC-127', 'Estenosis subaortica: gradua el gradiente MEDIO y no el pico', `
  function e(o) { __t.limpiar();
    __t.set('esub_tipo', o.tipo || 'membrana');
    if (o.medio != null) __t.set('esub_gradiente_medio', String(o.medio));
    if (o.pico  != null) __t.set('esub_gradiente_mmhg', String(o.pico));
    if (o.ia    != null) __t.set('esub_ia_asociada', o.ia);
    if (o.vals  != null) __t.set('esub_valsalva', o.vals);
    if (o.largo != null) __t.set('esub_longitud_mm', String(o.largo));
    __t.chk('esub_incluir_chk', true);
    const r = esubEstado();
    return { r, inf: __t.informe() };
  }
  const m39 = e({ medio:39 }), m40 = e({ medio:40 }), m41 = e({ medio:41 });
  /* EL CASO QUE SEPARA LAS DOS REGLAS: pico alto con medio no severo. */
  const picoAlto = e({ pico:65, medio:24 });
  const soloPico = e({ pico:65 });
  const ilegible = e({ medio:900 });
  const iaMod = e({ medio:20, ia:'moderada' }), iaLeve = e({ medio:20, ia:'leve' });
  const vals = e({ medio:20, vals:'aumenta' }), valsNo = e({ medio:20, vals:'sin_cambios' });
  const tunel = e({ tipo:'tunel', medio:20, largo:14 });
  const memLargo = e({ tipo:'membrana', medio:20, largo:14 });
  /* El formulario VACIO de verdad: e() pone 'membrana' por defecto, asi que pasarle tipo:''
     caia en el default y la seccion tenia datos. Un caso «vacio» que no esta vacio no prueba
     nada — es el denominador otra vez. */
  __t.limpiar();
  const vacio = { r: esubEstado() };
  return { extra: [
    ['medio 40 exactos es severa', m40.r.severa === true],
    ['medio 39 no', m39.r.severa === false],
    ['medio 41 si', m41.r.severa === true],
    ['la alerta quirurgica sube al EN SUMA',
      m40.inf.suma.indexOf('evaluar indicación quirúrgica') > -1],
    // EL PICO NO GRADUA.
    ['un pico de 65 con medio 24 NO es severa', picoAlto.r.severa === false],
    ['y el informe publica los dos gradientes', picoAlto.inf.inf.indexOf('65 mmHg') > -1 && picoAlto.inf.inf.indexOf('24 mmHg') > -1],
    ['sin gradiente medio no se gradua', soloPico.r.gradua === false && soloPico.r.severa === false],
    ['y el informe dice cual falta en vez de callarlo',
      soloPico.inf.inf.indexOf('el criterio de la ESC 2020 es el gradiente MEDIO y no consta') > -1],
    // La salvedad de flujo normal, solo donde podria tranquilizar de mas.
    ['al graduar como NO severa se declara el supuesto de flujo normal',
      m39.inf.inf.indexOf('con gasto cardíaco bajo el gradiente subestima') > -1],
    ['y no se repite cuando ya es severa',
      m40.inf.inf.indexOf('con gasto cardíaco bajo el gradiente subestima') === -1],
    // IA secundaria.
    ['IA moderada alerta y sube al EN SUMA',
      iaMod.inf.inf.indexOf('marcador de severidad') > -1 && iaMod.inf.suma.indexOf('insuficiencia aórtica moderada') > -1],
    ['IA leve se describe y no alerta',
      iaLeve.inf.inf.indexOf('asociada leve') > -1 && iaLeve.inf.inf.indexOf('marcador de severidad') === -1],
    // Valsalva: distingue fija de dinamica.
    ['un gradiente que AUMENTA con Valsalva manda al diferencial con MCH',
      vals.inf.inf.indexOf('obstrucción DINÁMICA') > -1 && vals.inf.suma.indexOf('aumenta con Valsalva') > -1],
    ['sin cambios no alerta', valsNo.inf.inf.indexOf('obstrucción DINÁMICA') === -1],
    // La longitud solo con tunel.
    ['la longitud se imprime con el tunel', tunel.inf.inf.indexOf('14 mm') > -1],
    ['y NO con una membrana: ahi no significa nada', memLargo.inf.inf.indexOf('14 mm') === -1],
    // Vacio e ilegible.
    ['sin ningun dato no hay seccion', vacio.r.hayDatos === false],
    ['un medio de 900 no gradua', ilegible.r.severa === false],
    ['y se declara fuera de rango', ilegible.inf.inf.indexOf('fuera de rango') > -1]
  ] };
`);

/* ESTENOSIS SUPRAVALVULAR — mismo criterio de gradiente que la subaortica (ESC 2020: MEDIO >=40
   a cualquier nivel del tracto de salida), y una cosa propia: LOS OSTIOS CORONARIOS. La lesion
   esta por ENCIMA de la union sinotubular, asi que los ostios quedan proximales, en la camara de
   alta presion: es la unica de las tres formas en que la obstruccion puede producir isquemia por
   si misma. Por eso el compromiso coronario alerta AUNQUE el gradiente no sea severo.
   Y «no evaluados» no es «normales»: negar el riesgo sin haberlo mirado es la afirmacion
   tranquilizadora de siempre, y aca lo que se negaria es isquemia. */
caso('TC-128', 'Supravalvular aortica: gradiente MEDIO, y los ostios alertan solos', `
  function e(o) { __t.limpiar();
    __t.set('easv_tipo', o.tipo || 'reloj');
    if (o.medio != null) __t.set('easv_gradiente_medio', String(o.medio));
    if (o.pico  != null) __t.set('easv_gradiente_mmhg', String(o.pico));
    if (o.wil   != null) __t.set('easv_williams', o.wil);
    if (o.cor   != null) __t.set('easv_coronarias', o.cor);
    if (o.ep    != null) __t.set('easv_estenosis_pulmonar', o.ep);
    __t.chk('easv_incluir_chk', true);
    const r = easvEstado();
    return { r, inf: __t.informe() };
  }
  const m39 = e({ medio:39 }), m40 = e({ medio:40 });
  const picoAlto = e({ pico:70, medio:22 });
  const soloPico = e({ pico:70 });
  const corMal = e({ medio:15, cor:'comprometidos' });
  const corBien = e({ medio:15, cor:'normales' });
  const corNo  = e({ medio:15, cor:'no_eval' });
  const corSin = e({ medio:15 });
  const wil = e({ medio:15, wil:'si' }), wilNo = e({ medio:15, wil:'no' });
  const epMod = e({ medio:15, ep:'moderada' }), epLeve = e({ medio:15, ep:'leve' });
  __t.limpiar();
  const vacio = { r: easvEstado() };
  return { extra: [
    ['medio 40 exactos es severa', m40.r.severa === true],
    ['medio 39 no', m39.r.severa === false],
    // El pico no gradua, igual que en la subaortica.
    ['un pico de 70 con medio 22 NO es severa', picoAlto.r.severa === false],
    ['sin gradiente medio no se gradua y se dice cual falta',
      soloPico.r.gradua === false &&
      soloPico.inf.inf.indexOf('el criterio de la ESC 2020 es el gradiente MEDIO y no consta') > -1],
    // LOS OSTIOS: alertan con gradiente NO severo, que es lo propio de esta forma.
    ['el compromiso de ostios alerta aunque el gradiente no sea severo',
      corMal.r.severa === false && corMal.inf.inf.indexOf('riesgo de isquemia miocárdica') > -1],
    ['y sube al EN SUMA', corMal.inf.suma.indexOf('compromiso de los ostios coronarios') > -1],
    ['ostios normales se nombran y no alertan',
      corBien.inf.inf.indexOf('Ostios coronarios normales') > -1 &&
      corBien.inf.inf.indexOf('riesgo de isquemia') === -1],
    ['«no evaluados» NO se publica como normales: se declara pendiente',
      corNo.inf.inf.indexOf('no evaluados en este estudio') > -1 &&
      corNo.inf.inf.indexOf('Ostios coronarios normales') === -1],
    ['y sin contestar nada, tambien se declara pendiente',
      corSin.inf.inf.indexOf('no evaluados en este estudio') > -1],
    // Williams-Beuren.
    ['Williams-Beuren manda a buscar estenosis pulmonar e hipercalcemia',
      wil.inf.inf.indexOf('hipercalcemia') > -1 && wil.inf.suma.indexOf('Williams-Beuren') > -1],
    ['«sin sindrome» se nombra y no alerta',
      wilNo.inf.inf.indexOf('Sin síndrome de Williams-Beuren') > -1 &&
      wilNo.inf.inf.indexOf('hipercalcemia') === -1],
    // Estenosis pulmonar asociada.
    ['EP moderada propone la correccion simultanea',
      epMod.inf.inf.indexOf('corrección simultánea') > -1],
    ['EP leve se describe y no lo propone',
      epLeve.inf.inf.indexOf('asociada leve') > -1 && epLeve.inf.inf.indexOf('corrección simultánea') === -1],
    ['sin ningun dato no hay seccion', vacio.r.hayDatos === false]
  ] };
`);

/* DSAV — DOS UMBRALES QUE EL PEDIDO TRAIA MAL Y QUE ESTE ARCHIVO YA HABIA RESUELTO. La ESC 2020
   remite la regurgitacion de la valvula AV IZQUIERDA a las recomendaciones de insuficiencia
   mitral, y el panel de indicaciones ya implementa DTSI >=40 mm y FEVI <=60 % (ESC/EACTS 2021).
   El pedido decia DTSVI >=45: el 45 es de la ESC 2017, y va hacia el lado MENOS protector — deja
   fuera al paciente de 42 mm que la guia opera.
   Y LA COMPUERTA QUE MAS IMPORTA: el DTSVI y la FEVI SOLO votan con regurgitacion izquierda
   severa. Solos describen un ventriculo; son criterio de CIRUGIA VALVULAR, y sin valvula severa
   no hay valvula que operar. */
caso('TC-129', 'DSAV: el criterio ventricular solo vota con regurgitacion izquierda severa', `
  function e(o) { __t.limpiar();
    __t.set('dsav_tipo', o.tipo || 'completo');
    if (o.izq  != null) __t.set('dsav_regurg_av_izq', o.izq);
    if (o.der  != null) __t.set('dsav_regurg_av_der', o.der);
    if (o.fevi != null) __t.set('fevi', String(o.fevi));
    if (o.dtsi != null) __t.set('dsfvi', String(o.dtsi));
    if (o.rvp  != null) __t.set('dsav_rvp_uw', String(o.rvp));
    if (o.htp  != null) __t.set('dsav_htp', o.htp);
    if (o.down != null) __t.set('dsav_down', o.down);
    if (o.civ  != null) __t.set('dsav_dssd_mm', String(o.civ));
    if (o.qp   != null) __t.set('dsav_qp_qs', String(o.qp));
    __t.chk('dsav_incluir_chk', true);
    const r = dsavEstado();
    return { r, inf: __t.informe() };
  }
  // EL 40, NO EL 45: los dos lados del corte con regurgitacion severa.
  const d39 = e({ izq:'severa', dtsi:39, fevi:65 });
  const d40 = e({ izq:'severa', dtsi:40, fevi:65 });
  const d42 = e({ izq:'severa', dtsi:42, fevi:65 });   // el paciente que el 45 dejaba fuera
  const f60 = e({ izq:'severa', dtsi:30, fevi:60 });
  const f61 = e({ izq:'severa', dtsi:30, fevi:61 });
  // LA COMPUERTA: los mismos numeros sin regurgitacion severa no pueden indicar cirugia.
  const sinSev  = e({ izq:'leve',     dtsi:44, fevi:55 });
  const sinIzq  = e({ dtsi:44, fevi:55 });
  const modSev  = e({ izq:'moderada', dtsi:44, fevi:55 });
  // RVP: decide el cierre, y la PSAP del eco no.
  const rvp5 = e({ izq:'leve', rvp:5 }), rvp4 = e({ izq:'leve', rvp:4 }), rvp2 = e({ izq:'leve', rvp:2 });
  const htpSinRvp = e({ izq:'leve', htp:'severa' });
  const down = e({ izq:'leve', down:'si' });
  const civParcial = e({ tipo:'parcial', izq:'leve', civ:12 });
  const civCompleto = e({ tipo:'completo', izq:'leve', civ:12 });
  __t.limpiar();
  const vacio = { r: dsavEstado() };
  return { extra: [
    ['DTSVI 40 exactos cumple', d40.r.dtsiVota === true && d40.r.clave === 'cx_asintomatico'],
    ['DTSVI 39 no', d39.r.dtsiVota === false],
    ['DTSVI 42 cumple: es el paciente que el umbral de 45 dejaba fuera', d42.r.dtsiVota === true],
    ['FEVI 60 exactos cumple', f60.r.feviVota === true],
    ['FEVI 61 no', f61.r.feviVota === false],
    ['y con severa sin criterio ventricular manda seguimiento estrecho',
      f61.r.clave === 'seguimiento_estrecho'],
    // LA COMPUERTA.
    ['con regurgitacion LEVE, un DTSVI de 44 y FEVI 55 NO indican cirugia',
      sinSev.r.dtsiVota === false && sinSev.r.feviVota === false && sinSev.r.clave === null],
    ['sin regurgitacion consignada tampoco',
      sinIzq.r.dtsiVota === false && sinIzq.r.clave === null],
    ['con MODERADA tampoco votan los ventriculares',
      modSev.r.dtsiVota === false && modSev.r.clave === 'moderada'],
    ['y el informe no nombra el criterio ventricular cuando no aplica',
      sinSev.inf.inf.indexOf('criterios ventriculares de cirugía') === -1 &&
      sinSev.inf.inf.indexOf('Función ventricular izquierda del estudio') === -1],
    ['con severa SI lo nombra, porque ahi decide',
      d40.inf.inf.indexOf('Función ventricular izquierda del estudio') > -1],
    ['la indicacion sube al EN SUMA', d40.inf.suma.indexOf('criterios de cirugía valvular cumplidos') > -1],
    // RVP.
    ['RVP 5 contraindica el cierre', rvp5.inf.inf.indexOf('cierre del defecto está contraindicado') > -1],
    ['RVP 4 manda a cateterismo, no contraindica',
      rvp4.inf.inf.indexOf('decisión individualizada') > -1 &&
      rvp4.inf.inf.indexOf('contraindicado') === -1],
    ['RVP 2 no alerta', rvp2.inf.inf.indexOf('contraindicado') === -1 && rvp2.inf.inf.indexOf('individualizada') === -1],
    ['HTP severa sin RVP pide la resistencia en vez de decidir con la PSAP',
      htpSinRvp.inf.inf.indexOf('no con la presión estimada por ecocardiografía') > -1],
    // Down y componente ventricular.
    ['el sindrome de Down sube al EN SUMA', down.inf.suma.indexOf('síndrome de Down') > -1],
    ['el componente ventricular se imprime en el completo', civCompleto.inf.inf.indexOf('12 mm') > -1],
    ['y NO en el parcial, donde no existe', civParcial.inf.inf.indexOf('12 mm') === -1],
    ['sin ningun dato no hay seccion', vacio.r.hayDatos === false]
  ] };
`);

/* CVPA PARCIAL — LA INDICACION EXIGE LOS DOS: Qp/Qs >=1,5 Y ventriculo derecho dilatado. Ninguno
   solo la activa.
   Y EL AGUJERO QUE TENIA LA CASCADA DEL PEDIDO: «Qp/Qs <1,5 o NO CALCULADO + VD no dilatado ->
   sin criterios, seguimiento anual» dejaba sin rama al VD DILATADO SIN Qp/Qs, que es justo el
   paciente en el que hay que cuantificar, y lo mandaba a la rama que tranquiliza. Aca tiene rama
   propia y pide la resonancia.
   El VD sale de vdBasCat() sobre vd_bas y la CIA de ete_cia_tipo: son los del ESTUDIO, no campos
   propios. vdBasCat devuelve null sin medicion, asi que «no dilatado» y «no medido» no se
   confunden — y esa diferencia decide si se tranquiliza o se pide el dato. */
caso('TC-130', 'CVPA parcial: la indicacion exige Qp/Qs Y VD dilatado, y el VD sin Qp/Qs no tranquiliza', `
  function e(o) { __t.limpiar();
    __t.set('cvpa_conexion', o.conex || 'vcs');
    if (o.venas != null) __t.set('cvpa_venas_numero', o.venas);
    if (o.lado  != null) __t.set('cvpa_lado', o.lado);
    if (o.qp    != null) __t.set('cvpa_qp_qs', String(o.qp));
    if (o.vd    != null) __t.set('vd_bas', String(o.vd));
    if (o.htp   != null) __t.set('cvpa_htp', o.htp);
    if (o.cia   != null) __t.set('ete_cia_tipo', o.cia);
    __t.chk('cvpa_incluir_chk', true);
    const r = cvpaEstado();
    return { r, inf: __t.informe() };
  }
  /* vd_bas: <=41 normal, >41 y <=45 leve, >45 dilatado (vdBasCat). */
  const ambos   = e({ qp:1.8, vd:50 });
  const qp15    = e({ qp:1.5, vd:50 });   // el corte exacto
  const qp149   = e({ qp:1.49, vd:50 });
  const soloQp  = e({ qp:1.8, vd:38 });
  const soloVd  = e({ vd:50 });           // EL CASO QUE LA CASCADA DEL PEDIDO DEJABA CAER
  const vdLeve  = e({ qp:1.8, vd:43 });   // «leve» ya cuenta como dilatado
  const nada    = e({ conex:'vcs' });
  const unaVena = e({ venas:'1', vd:38, qp:1.2 });
  const htpSev  = e({ qp:1.2, vd:38, htp:'severa' });
  const cia     = e({ qp:1.2, vd:38, cia:'sv_vcs' });
  const ilegible= e({ qp:9, vd:50 });
  __t.limpiar();
  const vacio = { r: cvpaEstado() };
  return { extra: [
    ['Qp/Qs 1.8 con VD dilatado da criterios', ambos.r.clave === 'cirugia'],
    ['1.5 exactos tambien', qp15.r.clave === 'cirugia'],
    ['1.49 no', qp149.r.clave !== 'cirugia'],
    ['la dilatacion LEVE ya cuenta', vdLeve.r.clave === 'cirugia'],
    ['y la alerta sube al EN SUMA', ambos.inf.suma.indexOf('criterios de corrección quirúrgica') > -1],
    // NINGUNO SOLO ACTIVA LA INDICACION.
    ['Qp/Qs alto SIN VD dilatado no indica cirugia',
      soloQp.r.clave === 'qp_sin_vd' && soloQp.inf.inf.indexOf('exige AMBAS cosas') > -1],
    ['VD dilatado SIN Qp/Qs tampoco', soloVd.r.clave !== 'cirugia'],
    // EL AGUJERO: no puede caer en la rama que tranquiliza.
    ['y NO se publica «sin criterios de intervención» sobre el VD dilatado sin cuantificar',
      soloVd.inf.inf.indexOf('Sin criterios de intervención') === -1],
    ['se pide cuantificar, y por resonancia',
      soloVd.inf.inf.indexOf('no se puede afirmar ni descartar') > -1 &&
      soloVd.inf.suma.indexOf('cuantificar por resonancia') > -1],
    // El Qp/Qs se declara SIEMPRE como ecocardiografico: en esta lesion el eco subestima.
    ['el Qp/Qs se publica como ecocardiografico',
      ambos.inf.inf.indexOf('Qp/Qs estimado por ecocardiografía') > -1],
    ['y con VD dilatado y Qp/Qs bajo se manda a resonancia en vez de descartar',
      qp149.r.clave === 'vd_qp_bajo' && qp149.inf.inf.indexOf('SUBESTIMA') > -1],
    // Sin nada medido no se niega nada.
    ['sin Qp/Qs ni VD medido no se afirma que no hay repercusion',
      nada.r.clave === 'incompleto' && nada.inf.inf.indexOf('Sin criterios de intervención') === -1],
    ['una sola vena con VD normal cierra conservador',
      unaVena.r.clave === 'una_vena' && unaVena.inf.inf.indexOf('rara vez genera un shunt significativo') > -1],
    // HTP severa y CIA del estudio.
    ['HTP severa manda a cateterismo', htpSev.inf.suma.indexOf('evaluar operabilidad por cateterismo') > -1],
    ['la CIA sale de la seccion de CIA/CIV, no de un campo propio',
      cia.inf.inf.indexOf('seno venoso de vena cava superior') > -1 &&
      !document.getElementById('cvpa_cia_asociada')],
    ['el VD sale de vdBasCat, no de un campo propio', !document.getElementById('cvpa_vd_dilatado')],
    ['un Qp/Qs de 9 no vota y se declara',
      ilegible.r.clave !== 'cirugia' && ilegible.inf.inf.indexOf('fuera de rango') > -1],
    ['sin ningun dato no hay seccion', vacio.r.hayDatos === false]
  ] };
`);

/* ROUND-TRIP DE EXCEL, POR LAS FUNCIONES REALES. TC-119 verifica el MAPA: que la etiqueta que la
   app emite resuelva al mismo token. Esto es la otra mitad: se guarda un estudio de verdad, se
   exporta con `_labExportarXLSXReal` —el mismo camino del boton—, SheetJS serializa el .xlsx, se
   construye un File y se lo come `labImportarXLSX`, que es el mismo camino del import. Despues se
   comparan los campos.

   NO ES TAUTOLOGICO, y eso importa porque este archivo ya documenta que «ida y vuelta exacto no
   prueba nada» cuando exportador e importador son espejo. Aca NO lo son: el export va
   token -> etiqueta legible (LAB_XLS_ETIQ) y el import va celda -> normalizacion -> vocabulario
   -> token (LAB_XLS_VOCAB), que son dos tablas distintas, mas el parseo numerico con su ventana
   de plausibilidad, mas la serializacion de SheetJS —que es donde vivio el defecto de los id en
   notacion cientifica—. Si alguna de esas piezas se desalinea, el token no vuelve.

   Se prueban los campos de las NUEVE secciones de congenitas que entraron esta semana, con valor
   en todos: un campo vacio pasa el round-trip siempre. */
caso('TC-131', 'Excel: un estudio de congenitas vuelve entero de su propio archivo', `
  return (async function(){
    /* LA DEPENDENCIA SE DECLARA. SheetJS se sirve por CDN, asi que sin red este caso no puede
       correr — y tiene que decirlo como ROJO con el motivo, no tirar un ReferenceError crudo ni,
       peor, saltearse en silencio: un caso que se saltea solo es cobertura que no existe. */
    /* Se ESPERA a que cargue antes de rendirse: el <script> del CDN puede no haber terminado
       cuando arranca el caso, y eso daba rojo intermitente — que es peor que no tener el caso,
       porque un suite que falla a veces se deja de mirar. */
    for (let i = 0; i < 60 && typeof XLSX === 'undefined'; i++) await new Promise(function(r){ setTimeout(r, 100); });
    if (typeof XLSX === 'undefined') return { extra: [
      ['la libreria XLSX esta disponible (llega por CDN: este caso necesita red)', false,
       'sin red o CDN inaccesible tras 6 s de espera']] };
    /* Valores elegidos para que no sean cómodos: decimales en los Qp/Qs y el Z, tokens largos en
       los selects, y numeros pegados a los bordes de las bandas de plausibilidad. */
    const CAMPOS = {
      nombre:'Roundtrip Excel', ci:'55667788', edad:'44', peso:'80', talla:'180',
      fevi:'52', dsfvi:'41', vd_bas:'47', ete_cia_tipo:'sv_vcs',
      marfan_sindrome:'lds', marfan_ao_seno:'46.5', marfan_ao_ascendente:'44.2',
      marfan_ita:'23.5', marfan_factores_riesgo:'si',
      eis_lesion_base:'dsav', eis_saturacion_reposo:'86', eis_saturacion_ejercicio:'74',
      eis_psap:'92', eis_pdap:'41', eis_it_vel:'4.6', eis_vd_funcion:'moderada',
      eis_pericardio:'leve', eis_clase_nyha:'iii', eis_sincope:'si', eis_hemoptisis:'no',
      fontan_tipo:'extra', fontan_fenestracion:'presente', fontan_vs_morfologia:'der',
      fontan_vs_fevi:'44', fontan_vs_fac:'31', fontan_saturacion:'88',
      fontan_it_grado:'moderada', fontan_derrame_pleural:'moderado', fontan_ascitis:'leve',
      fontan_clase_nyha:'ii', fontan_arritmia:'flutter',
      tdf_vtdvdi:'172', tdf_vtsvdi:'84', tdf_vol_fuente:'rmc',
      ebs_saturacion:'91',
      esub_tipo:'tunel', esub_gradiente_medio:'44', esub_gradiente_mmhg:'78',
      esub_ia_asociada:'moderada', esub_longitud_mm:'16', esub_valsalva:'sin_cambios',
      easv_tipo:'difusa', easv_gradiente_medio:'38', easv_gradiente_mmhg:'66',
      easv_williams:'si', easv_coronarias:'comprometidos', easv_estenosis_pulmonar:'moderada',
      dsav_tipo:'completo', dsav_regurg_av_izq:'severa', dsav_regurg_av_der:'moderada',
      dsav_dssd_mm:'18', dsav_qp_qs:'2.4', dsav_down:'si', dsav_htp:'moderada', dsav_rvp_uw:'3.6',
      cvpa_venas_numero:'2', cvpa_conexion:'vcs', cvpa_lado:'der', cvpa_qp_qs:'1.9',
      cvpa_htp:'leve', cvpa_sintomas:'disnea'
    };
    const COMPS = ['fontan_comp_epp','fontan_comp_fald'];
    __t.limpiar();
    const noExisten = [];
    Object.keys(CAMPOS).forEach(function(k){ if (__t.set(k, CAMPOS[k]) !== 1) noExisten.push(k); });
    COMPS.forEach(function(k){ if (__t.chk(k, true) !== 1) noExisten.push(k); });
    const g = await __t.guardar();
    const inf = getInformes().find(function(i){ return i.estudioId === g.estudioId; });
    if (!inf) return { extra:[['se guardo el estudio', false, JSON.stringify(g)]] };

    /* EXPORT por la ruta real: se intercepta writeFile para quedarse con el libro en vez de
       bajarlo, y se serializa con el mismo SheetJS. */
    const _wf = XLSX.writeFile; let wb = null;
    XLSX.writeFile = function(libro){ wb = libro; };
    try { _labExportarXLSXReal([inf], false); } finally { XLSX.writeFile = _wf; }
    if (!wb) { __t.borrar(g.estudioId); return { extra:[['el export produjo un libro', false]] }; }
    const buf = XLSX.write(wb, { type:'array', bookType:'xlsx' });
    const file = new File([buf], 'roundtrip.xlsx',
      { type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

    /* IMPORT por la ruta real. FileReader es asincrono: se espera a que aparezca el resultado. */
    _labImpDatos = null;
    labImportarXLSX(file);
    for (let i = 0; i < 100 && !_labImpDatos; i++) await new Promise(function(r){ setTimeout(r, 50); });
    const d = _labImpDatos;
    __t.borrar(g.estudioId);
    if (!d) return { extra:[['el import produjo resultado', false, 'timeout de 5 s']] };
    if (!d.filas.length) return { extra:[['la fila se importo', false,
      'errores: ' + JSON.stringify(d.errores).slice(0,600)]] };

    const vuelta = d.filas[0].inf.campos || {};
    const dif = [];
    Object.keys(CAMPOS).forEach(function(k){
      /* Los espejos NO son campos propios de sus secciones y no tienen columna: se verifican
         aparte, mas abajo. */
      if (['fevi','dsfvi','vd_bas','ete_cia_tipo','nombre','ci','edad','peso','talla'].indexOf(k) >= 0) return;
      const ida = CAMPOS[k], vta = vuelta[k];
      if (vta === undefined) { dif.push(k + ': NO VOLVIO (ida=' + ida + ')'); return; }
      /* Numerico contra numerico: '2.4' y '2.40' son el mismo valor y compararlos como texto
         seria exigir un formato, no un dato. */
      const a = parseFloat(String(ida).replace(',','.')), b = parseFloat(String(vta).replace(',','.'));
      if (isFinite(a) && isFinite(b)) { if (Math.abs(a-b) > 1e-9) dif.push(k + ': ida=' + ida + ' vuelta=' + vta); }
      else if (String(ida) !== String(vta)) dif.push(k + ': ida=' + ida + ' vuelta=' + vta);
    });
    COMPS.forEach(function(k){ if (vuelta[k + '__chk'] !== '1') dif.push(k + '__chk: ida=1 vuelta=' + vuelta[k + '__chk']); });
    /* Que la que NO se marco no vuelva marcada. */
    const falsoPositivo = vuelta['fontan_comp_trombo__chk'] === '1';
    /* LOS ESPEJOS: no pueden tener columna propia ni volver como campo de la seccion. */
    const cols = Object.keys(_labExcelRow(inf));
    const espejosConColumna = ['dsav_fevi','dsav_dtsvi_mm','dsav_vi_ro','cvpa_vd_ro','cvpa_cia_ro',
      'cvpa_vd_dilatado','cvpa_cia_asociada','esub_severidad']
      .filter(function(id){ return vuelta[id] !== undefined; });
    return { extra: [
      ['los campos del estudio existen', noExisten.length === 0, 'no existen: ' + noExisten.join(', ')],
      ['la fila se importo sin errores', d.errores.length === 0,
        JSON.stringify(d.errores).slice(0,600)],
      ['los ' + Object.keys(CAMPOS).length + ' campos vuelven identicos', dif.length === 0,
        dif.slice(0,10).join(' | ')],
      ['las complicaciones marcadas vuelven marcadas',
        COMPS.every(function(k){ return vuelta[k + '__chk'] === '1'; })],
      ['y la que no se marco no vuelve marcada', falsoPositivo === false],
      ['ningun espejo volvio como campo propio de su seccion',
        espejosConColumna.length === 0, espejosConColumna.join(', ')],
      ['y el export no inventa una columna para ellos',
        !cols.some(function(c){ return /dsav (FEVI|DTSVI)|CVPA (VD|CIA)/i.test(c); })]
    ] };
  })();
`);

/* LAS SEIS CORRECCIONES DEL 2026-09-16. Tres ya estaban hechas y el caso las FIJA para que no se
   deshagan; tres se hicieron ahora. */
caso('TC-132', 'Seis correcciones: titulos, limpieza, capsulas, SGL, denominadores y navegacion', `
  const out = [];
  // ── FIX 1 — los dos bloques de titulo no existen en ninguna de las dos pestañas ──
  const t1 = (document.getElementById('tab-congenitas').textContent || '');
  const t2 = (document.getElementById('tab-congenitas2').textContent || '');
  /* SE MIDE POR ESTRUCTURA, NO POR FRASE. La primera version buscaba textos concretos y dejo
     pasar un SEGUNDO bloque de titulo en CC frecuentes: estaba escrito SIN acentos
     —«Cardiopatias del adulto y miocardiopatias geneticas»— y el grep de la frase acentuada no
     lo encontro. Buscar cadenas encuentra lo que uno ya sabe que esta; lo que hay que exigir es
     que ANTES de la primera seccion no haya NADA que renderice. */
  /* Se saltean los nodos de COMENTARIO (nodeType 8): textContent devuelve su contenido, asi que
     el comentario de cabecera de la pestaña —que es largo— se contaba como texto visible.
     Y NO se usa una regex con \\s: el cuerpo de un caso es un template literal y se come la
     barra, con lo que /\\s+/ quedaba en /s+/ y borraba todas las eses del texto. Se ve en el
     diagnostico: «la do co a a propo ito». Septima vez con esta trampa. Alcanza con trim(). */
  const primero = tab => { const e = document.getElementById(tab);
    const sec = e.querySelector('.sacc');
    let txt = '';
    for (let n = e.firstChild; n && n !== sec; n = n.nextSibling) {
      if (n.nodeType === 8) continue;
      txt += (n.textContent || '');
    }
    return txt.trim(); };
  out.push(['FIX1 · CC frecuentes arranca directo en su primera seccion',
    primero('tab-congenitas') === '', 'sobra: ' + primero('tab-congenitas').slice(0,140)]);
  out.push(['FIX1 · CC complejas tambien',
    primero('tab-congenitas2') === '', 'sobra: ' + primero('tab-congenitas2').slice(0,140)]);
  out.push(['FIX1 · y ninguna frase de titulo sobrevive, con acentos o sin ellos',
    !/Cada patolog[ií]a es una secci[oó]n plegable/i.test(t1) &&
    !/Cardiopat[ií]as? congenitas estructurales/i.test(t2) &&
    !/miocardiopat[ií]as? gen[eé]ticas/i.test(t1.slice(0, 400))]);
  out.push(['FIX1 · y las secciones siguen ahi', t1.indexOf('Marfan') > -1 && t2.indexOf('Fontan') > -1]);

  // ── FIX 2 — los campos de las diez secciones se limpian ──
  const SECS = {
    marfan:['marfan_sindrome','marfan_ao_seno'], eisen:['eis_lesion_base','eis_saturacion_reposo'],
    fontan:['fontan_tipo','fontan_saturacion'],  tdf:['tdf_func_vd','tdf_vtdvdi'],
    ebs:['ebs_desplazamiento','ebs_saturacion'], esub:['esub_tipo','esub_gradiente_medio'],
    easv:['easv_tipo','easv_gradiente_medio'],   dsav:['dsav_tipo','dsav_qp_qs'],
    cvpa:['cvpa_conexion','cvpa_qp_qs'],         fop:['fop_tunel','fop_burbujas']
  };
  const VALOR = { marfan_sindrome:'lds', eis_lesion_base:'cia', fontan_tipo:'extra', tdf_func_vd:'moderada',
    esub_tipo:'tunel', easv_tipo:'difusa', dsav_tipo:'completo', cvpa_conexion:'vcs', fop_burbujas:'abundante' };
  const sucios = [], faltan = [];
  __t.limpiar();
  Object.keys(SECS).forEach(function(k){ SECS[k].forEach(function(id){
    const v = VALOR[id] || '33';
    if (__t.set(id, v) !== 1) { faltan.push(id); return; }
  }); });
  __t.limpiar();
  Object.keys(SECS).forEach(function(k){ SECS[k].forEach(function(id){
    const e = document.getElementById(id); if (!e) return;
    if (String(e.value || '').trim() !== '') sucios.push(k + '/' + id + '="' + e.value + '"');
  }); });
  out.push(['FIX2 · los veinte campos existen', faltan.length === 0, faltan.join(', ')]);
  out.push(['FIX2 · y ninguno sobrevive a limpiarCampos', sucios.length === 0, sucios.join(' | ')]);
  /* Los espejos NO son campos propios: se limpian por su seccion de origen. Que existan como
     readonly y con data-espejo es lo que los mantiene fuera de secAutoOpen. */
  const ESP = ['dsav_vi_ro','cvpa_cia_ro','cvpa_vd_ro','tdf_psvd_ro','tdf_it_ro'];
  out.push(['FIX2 · los espejos son readonly y llevan data-espejo o son _ro',
    ESP.every(function(id){ const e = document.getElementById(id);
      return !!e && e.readOnly === true; }), ESP.filter(function(id){
      const e = document.getElementById(id); return !e || !e.readOnly; }).join(', ')]);

  // ── FIX 3 — las tres capsulas estan en el recalculo al reabrir ──
  const src = String(cargarEstudioPorId);
  out.push(['FIX3 · calcBSA, calcPSAP y calcSGL se recalculan al reabrir',
    ['calcBSA','calcPSAP','calcSGL'].every(function(f){ return src.indexOf(f) > -1; })]);

  // ── FIX 4 — el SGL sincroniza en las DOS direcciones ──
  __t.limpiar();
  __t.set('sgl', '-18');
  const g1 = (document.getElementById('sgl_gls') || {}).value;
  __t.set('sgl_gls', '-13');
  const s1 = (document.getElementById('sgl') || {}).value;
  out.push(['FIX4 · escribir en sgl actualiza sgl_gls', String(g1) === '-18', 'sgl_gls=' + g1]);
  out.push(['FIX4 · y escribir en sgl_gls actualiza sgl', String(s1) === '-13', 'sgl=' + s1]);
  /* UNA SOLA FUENTE. La primera version de esta condicion miraba el texto del informe y fallaba
     por el CASO, no por el codigo: sin FEVI ni contexto el narrativo no emite la linea de strain,
     asi que buscaba un numero que nunca iba a estar. Lo que hay que probar es que las dos
     entradas quedan con EL MISMO valor —el ultimo escrito— y que lo que lee el informe (#sgl) es
     ese. Con FEVI cargada, ademas, se comprueba que la linea salga con el valor correcto. */
  out.push(['FIX4 · las dos entradas quedan con el mismo valor', String(s1) === String((document.getElementById('sgl_gls')||{}).value)]);
  __t.set('fevi', '58'); __t.set('sgl_gls', '-11');
  const inf4 = __t.informe();
  out.push(['FIX4 · y el informe publica el ultimo valor, no el de la otra pestaña',
    inf4.inf.indexOf('11') > -1 && inf4.inf.indexOf('-18') === -1, inf4.inf.slice(0, 200)]);

  // ── FIX 5 — NO MARCAR UNA VALVULA ES UN HALLAZGO ──
  /* El flujo clinico es que el medico marca SOLO lo que el paciente tiene: si no marco nada, el
     paciente no tiene esa valvulopatia, y eso es un dato. Por eso el valor de fabrica se traduce
     a «Sin» —que es un grado— y el denominador de las barras es el TOTAL del periodo.
     LA PRIMERA VERSION DE ESTE CASO AFIRMABA LO CONTRARIO. Se habia agregado una compuerta que
     exigia una bandera o un valor distinto del de fabrica; medido sobre los 95 estudios reales,
     el denominador de la IM caia de 95 a 44 y el grafico pasaba a decir «Sin: 0 %» — ningun
     paciente con mitral normal, 100 % de los evaluados con insuficiencia. Revertido. */
  const conFabrica = { campos:{ im_grado:'0', ea_grado:'sin', et_grado:'Sin estenosis' } };
  const conValor   = { campos:{ im_grado:'3', ea_grado:'severa' } };
  const sinCampo   = { campos:{} };
  out.push(['FIX5 · el valor de fabrica es «Sin», que es un HALLAZGO y cuenta',
    _labRegurgSev(conFabrica,'im_grado') === 'Sin' &&
    _labEstenSev(conFabrica,'ea_grado') === 'Sin' &&
    _labEstenSev(conFabrica,'et_grado') === 'Sin']);
  out.push(['FIX5 · un valor real se lee como el grado que es',
    _labRegurgSev(conValor,'im_grado') === 'Moderada' && _labEstenSev(conValor,'ea_grado') === 'Severa']);
  /* Lo UNICO que no cuenta es el campo ausente: un Excel importado sin esa columna no trae dato
     ni de presencia ni de ausencia. */
  out.push(['FIX5 · el campo AUSENTE sigue sin contar: ahi no hay dato',
    _labRegurgSev(sinCampo,'im_grado') === null && _labEstenSev(sinCampo,'ea_grado') === null]);
  /* Y la compuerta que se habia agregado no puede volver por ninguna puerta. */
  out.push(['FIX5 · no quedo ninguna compuerta ni bandera __tocado',
    typeof window._labValvEvaluada === 'undefined' &&
    typeof window._valvTocar === 'undefined' &&
    !document.getElementById('im_grado__tocado')]);
  /* EL DEFECTO REAL ERA EL ROTULO: prometia un filtro que no existe. */
  /* SE MIDE LA CADENA QUE SE EMITE, no document.body.textContent: ese INCLUYE el contenido de
     los <script>, asi que la frase vieja citada en un COMENTARIO del codigo lo hacia fallar —el
     caso acusaba a la app de un texto que ya no publica. */
  out.push(['FIX5 · el rotulo dice sobre que base esta calculando', (function(){
    const src = String(labRenderExtras);
    return src.indexOf('con esa válvula evaluada') === -1 &&
           src.indexOf('total de estudios del período') > -1 &&
           src.indexOf('fue valorada como normal') > -1;
  })()]);

  // ── FIX 6 — la hamburguesa se anuncia y es tocable ──
  const bg = document.querySelector('.eco-tabsburger');
  out.push(['FIX6 · la hamburguesa dice que ahi estan las secciones',
    (bg.textContent || '').indexOf('Secciones') > -1]);
  out.push(['FIX6 · conserva la etiqueta para lector de pantalla',
    (bg.getAttribute('aria-label') || '').indexOf('Secciones del estudio') > -1]);
  return { extra: out };
`);

/* DOPPLER TRICUSPIDEO. Lo que vigila este caso, ademas de los cortes: que el TRIV y el TAP se
   publiquen como elementos INDIRECTOS y no como diagnostico —la PSAP y la clasificacion ESC 2022
   ya estan en la misma tarjeta—, que NO suban al EN SUMA, y que los dos alterados salgan en UNA
   sola oracion: dos frases separadas se leen como dos hallazgos y son el mismo.
   TAP se lee de `tvia`, que es su id REAL en esta app —no `tap`—, y el TRIV tricuspideo es un
   campo nuevo porque el `triv` que ya existia es el del VENTRICULO IZQUIERDO. */
caso('TC-133', 'Doppler tricuspideo: E/A, E/e y los dos signos INDIRECTOS de HTP', `
  function e(o) { __t.limpiar();
    __t.set('vd_bas','40');                       // para que el bloque del VD emita parrafo
    if (o.E    != null) __t.set('dt_onda_e', String(o.E));
    if (o.A    != null) __t.set('dt_onda_a', String(o.A));
    if (o.ep   != null) __t.set('dt_eprime_lat', String(o.ep));
    if (o.triv != null) __t.set('dt_triv', String(o.triv));
    if (o.tap  != null) __t.set('tvia', String(o.tap));
    return { r: dopTricEstado(), f: dopTricFrase(), inf: __t.informe() };
  }
  const t70 = e({ triv:70 }), t60 = e({ triv:60 }), t55 = e({ triv:55 });
  const p95 = e({ tap:95 }), p110 = e({ tap:110 });
  const ambos = e({ triv:70, tap:95 });
  const nada  = e({ triv:55, tap:110 });
  /* LA OTRA RAMA. La linea de la valvula tricuspide tiene DOS: con PSAP calculable y sin ella.
     Los casos de arriba no miden IT, asi que solo ejercian la segunda — una redaccion vieja
     dejada en la primera sobrevivia. Con vmax_it y VCI la PSAP se calcula y entra la otra. */
  __t.limpiar(); __t.set('vd_bas','40'); __t.set('vmax_it','2.8');
  __t.set('vci_diam','18'); __t.set('vci_col','>50');
  __t.set('dt_triv','70'); __t.set('tvia','95');
  const conPsap = { inf: __t.informe() };
  const cocientes = e({ E:90, A:70, ep:8 });
  const soloE = e({ E:90 });
  const ilegible = e({ E:9 });          // 9 cm/s: por debajo de la banda 10-200
  __t.limpiar(); __t.set('vd_bas','40');
  const vacio = { r: dopTricEstado(), f: dopTricFrase(), inf: __t.informe() };
  const FR = 'Presenta elementos indirectos de HTP';
  return { extra: [
    // LA FRASE UNICA, en sus cuatro combinaciones.
    ['solo TAP 95 ms', p95.inf.inf.indexOf(FR + ' (TAP < 105 ms).') > -1],
    ['solo TRIV 70 ms', t70.inf.inf.indexOf(FR + ' (TRIV tricuspídeo > 60 ms).') > -1],
    ['los dos, en una sola frase',
      ambos.inf.inf.indexOf(FR + ' (TAP < 105 ms y TRIV tricuspídeo > 60 ms).') > -1],
    ['y el TAP se nombra UNA sola vez', ambos.inf.inf.split('TAP < 105 ms').length - 1 === 1],
    ['con TAP 110 y TRIV 55 no aparece nada', nada.inf.inf.indexOf(FR) === -1],
    ['con los campos vacios tampoco', vacio.inf.inf.indexOf(FR) === -1],
    // Los dos lados de cada corte.
    ['TRIV 60 exactos NO cuenta: el corte es >60', t60.inf.inf.indexOf('TRIV tricuspídeo') === -1],
    ['TRIV 55 tampoco', t55.inf.inf.indexOf('TRIV tricuspídeo') === -1],
    ['TAP 110 no cuenta', p110.inf.inf.indexOf('TAP < 105') === -1],
    // El texto viejo no vuelve, en ninguna de las dos ramas.
    ['no queda la redaccion vieja',
      ambos.inf.inf.indexOf('Se suman elementos indirectos') === -1 &&
      ambos.inf.inf.indexOf('Se evidencian elementos indirectos') === -1],
    ['y tampoco en la rama con PSAP calculable, que es la otra mitad',
      conPsap.inf.inf.indexOf('Se suman elementos indirectos') === -1 &&
      conPsap.inf.inf.indexOf('Presenta elementos indirectos de HTP (TAP < 105 ms y TRIV tricuspídeo > 60 ms).') > -1],
    // EN SUMA: la misma frase, y solo sin PSAP estimable — como antes.
    ['al EN SUMA va la frase nueva con los dos signos',
      ambos.inf.suma.indexOf(FR + ' (TAP < 105 ms y TRIV tricuspídeo > 60 ms), sin PSAP estimable.') > -1],
    ['y el TRIV solo tambien llega al EN SUMA',
      t70.inf.suma.indexOf('TRIV tricuspídeo > 60 ms') > -1],
    // UNIDADES: cm/s.
    ['el campo dice cm/s, no m/s', (function(){
      const l = document.querySelector('label[for], .fg label');
      return (document.getElementById('dt_onda_e').placeholder === 'cm/s');
    })()],
    ['E 90 y A 70 dan E/A 1.29', cocientes.r.ea === 1.29],
    /* EL ×100 TENIA QUE SALIR. E/e' se calculaba como e*100/ep porque E venia en m/s y e' en
       cm/s. Con E ya en cm/s, dejarlo habria publicado un E/e' CIEN VECES mayor. */
    ["E 90 y e' 8 dan E/e' 11.3, no 1125", cocientes.r.eep === 11.3],
    ['y el informe los publica en cm/s',
      cocientes.f.indexOf('E 90 cm/s') > -1 && cocientes.f.indexOf('A 70 cm/s') > -1],
    ['la banda es 10-200: un 9 no entra', ilegible.r.eOk === false],
    ['y se declara en vez de desaparecer', ilegible.f.indexOf('fuera de rango') > -1],
    ['con un solo insumo no hay cociente', soloE.r.ea === null && soloE.r.eep === null],
    // El modulo sigue sin duplicar campos ni frases.
    ['el TAP se lee de tvia: no se creo un campo propio', !document.getElementById('dt_tap')],
    ['el TRIV del ventriculo izquierdo sigue existiendo aparte',
      !!document.getElementById('triv') && !!document.getElementById('dt_triv')],
    ['y el bloque de llenado no repite los signos indirectos',
      ambos.f.indexOf('indirecto') === -1 && ambos.f.indexOf('TAP') === -1]
  ] };
`);

/* EXPORTADOR CON FILTROS POR MODULO — ver el comentario original arriba de TC-134. */
caso('TC-134', 'Exportador Excel: modulos, filas y la plantilla comparten filtro', `
  const TODAS = _labOrdenarCols(Object.keys(_labExcelRow({ id:0, campos:{} })));
  const basicas = _labColsFiltradas(TODAS, []);
  const conDtr  = _labColsFiltradas(TODAS, ['dtric']);
  const conPeri = _labColsFiltradas(TODAS, ['peri']);
  const todas   = _labColsFiltradas(TODAS, LAB_XLS_MODULOS.map(function(m){ return m.k; }));
  /* Estudios sinteticos: uno con datos de pericardio y otro sin nada avanzado. */
  /* El select pericardio distinto de normal es lo que abre la compuerta del modulo (_pcHayDpt),
     y dpt_local es un campo propio suyo. Un id inventado no falla: da columnas vacias y el caso
     mide sobre cero. */
  const conDato = { campos:{ nombre:'A', pericardio:'Derrame leve (<10mm)', dpt_local:'circ' } };
  const sinDato = { campos:{ nombre:'B', fevi:'55' } };
  const dos = [conDato, sinDato];
  return { extra: [
    ['el assert de modulos no encuentra nada mal', _labAssertModulos().length === 0,
      _labAssertModulos().join(' | ')],
    // Los basicos no se pueden sacar.
    ['sin ningun modulo quedan solo los basicos, y son muchos menos',
      basicas.length > 50 && basicas.length < TODAS.length],
    ['y los basicos incluyen paciente, FEVI e informe',
      basicas.indexOf('Nombre') > -1 && basicas.indexOf('FEVI Simpson (%)') > -1 &&
      basicas.indexOf('Informe (texto completo)') > -1],
    ['con TODOS los modulos vuelven todas las columnas', todas.length === TODAS.length],
    // Marcar un modulo agrega SUS columnas y ninguna otra.
    ['marcar pericardio agrega solo sus columnas',
      conPeri.length > basicas.length &&
      conPeri.filter(function(c){ return basicas.indexOf(c) === -1; })
             .every(function(c){ return c.indexOf('DPT ') === 0 || c.indexOf('CVR ') === 0; })],
    ['y no arrastra las de otro modulo', conPeri.indexOf('Fontan tipo') === -1],
    ['marcar Doppler tricuspideo agrega las suyas', conDtr.length > basicas.length],
    // FILAS: independiente de columnas.
    ['«todos» devuelve las dos filas', _labFilasFiltradas(dos, ['peri'], false).length === 2],
    ['«solo con datos» deja solo la que tiene pericardio',
      _labFilasFiltradas(dos, ['peri'], true).length === 1 &&
      _labFilasFiltradas(dos, ['peri'], true)[0].campos.nombre === 'A'],
    ['y con otro modulo elegido, ninguna de las dos',
      _labFilasFiltradas(dos, ['onco'], true).length === 0],
    // EL BORDE: sin modulos, el filtro de filas NO se aplica.
    ['«solo con datos» SIN modulos exporta a todos igual',
      _labFilasFiltradas(dos, [], true).length === 2],
    // El predicado de «tiene datos» no confunde un 0 con vacio.
    /* La linea base: las cuatro casillas de pericardio salen «No» en un estudio VACIO, asi que
       la prueba ingenua daba «tiene datos» para todos. Se compara contra esa linea base. */
    ['un valor distinto del de un estudio vacio cuenta como dato',
      _labInfTieneModulo({ campos:{ pericardio:'Derrame leve (<10mm)', dpt_col_vd:'no' } }, 'peri') === true],
    ['y un campo vacio no', _labInfTieneModulo({ campos:{} }, 'peri') === false],
    // Preferencias.
    ['las preferencias se recuerdan', (function(){
      _labExpGuardarPref(['peri','onco'], false);
      const p = _labExpLeerPref();
      return p.sel.length === 2 && p.sel.indexOf('peri') > -1 && p.solo === false;
    })()],
    ['y una clave basura no rompe nada', (function(){
      try { localStorage.setItem('ett_lab_export_pref', '{no es json'); } catch(e){}
      const p = _labExpLeerPref();
      try { localStorage.removeItem('ett_lab_export_pref'); } catch(e){}
      return Array.isArray(p.sel) && p.sel.length === 0;
    })()],
    // El modal existe y arranca oculto.
    ['el modal existe y no se dibuja al cargar', (function(){
      const ov = document.getElementById('lab-exp-overlay');
      return !!ov && getComputedStyle(ov).display === 'none';
    })()],
    ['la casilla de datos basicos esta deshabilitada', (function(){
      const ov = document.getElementById('lab-exp-overlay');
      const c = ov.querySelector('input[type=checkbox][disabled]');
      return !!c && c.checked === true;
    })()],
    /* La plantilla usa EL MISMO filtro que el export: si enseñara columnas que el export no
       emite, el medico la rellena y reimporta datos que no tienen destino. */
    ['la plantilla comparte el filtro con el export',
      String(labPlantillaXLSX).indexOf('_labColsFiltradas') > -1]
  ] };
`);

/* GLS Y CONTRACTILIDAD SON BASICOS (2026-09-16).
   El modulo 'contr' sacaba del export dos columnas del bloque 4 (VENTRICULO IZQUIERDO) mientras
   las otras diez de ese mismo bloque nunca fueron opcionales. El invariante que se fija NO es
   «estas tres columnas son basicas» —nombrar tres deja abierto que manana se module una cuarta—
   sino que NINGUNA columna del bloque 4 tiene modulo. */
caso('TC-135', 'GLS y contractilidad son BASICOS del Excel: sin checkbox y siempre presentes', `
  return (async function(){
    const NUCLEO = ['GLS (%)', 'Trastornos sectoriales', 'TS_Presente'];
    const TODAS = _labOrdenarCols(Object.keys(_labExcelRow({ id:0, campos:{} })));
    const basicas = _labColsFiltradas(TODAS, []);
    const claves = LAB_XLS_MODULOS.map(function(m){ return m.k; });
    const conTodo = _labColsFiltradas(TODAS, claves);
    const bloque4 = TODAS.filter(function(c){ return _labXlsBloqueDe(c).indexOf('4 · ') === 0; });
    /* El modal se construye desde LAB_XLS_MODULOS, asi que hay que ABRIRLO para probar que el
       checkbox no se dibuja: leer la constante prueba la constante, no la pantalla. Necesita un
       estudio guardado y la libreria del CDN — las dos se declaran, no se saltean. */
    for (let i = 0; i < 60 && typeof XLSX === 'undefined'; i++) await new Promise(function(r){ setTimeout(r, 100); });
    if (typeof XLSX === 'undefined') return { extra: [
      ['la libreria XLSX esta disponible (llega por CDN: este caso necesita red)', false,
       'sin red o CDN inaccesible tras 6 s de espera']] };
    try { localStorage.removeItem('ett_lab_export_pref'); } catch(e){}
    __t.limpiar(); __t.set('nombre','Export Basicos'); __t.set('fevi','55');
    const gid = __t.guardar();
    labExpAbrir();
    const cont = document.getElementById('lab-exp-mods');
    const chks = [].slice.call(cont.querySelectorAll('[data-exp-mod]'));
    const rotulos = [].slice.call(cont.querySelectorAll('label')).map(function(l){ return l.textContent; });
    const cuentaTxt = document.getElementById('lab-exp-cuenta').textContent;
    labExpCerrar();
    __t.borrar(gid);
    const nombra = function(t){ const u = t.toUpperCase();
      return u.indexOf('CONTRACTILIDAD') > -1 || u.indexOf('SGL') > -1 || u.indexOf('GLS') > -1 ||
             u.indexOf('SECTORIAL') > -1 || u.indexOf('MOTILIDAD') > -1; };
    return { extra: [
      // 1 · El modulo dejo de existir, y nada quedo huerfano.
      ['ya no hay un modulo contr', claves.indexOf('contr') === -1, claves.join(',')],
      ['el assert de modulos sigue en cero', _labAssertModulos().length === 0,
        _labAssertModulos().join(' | ')],
      // 2 · LA PANTALLA: ningun checkbox nombra contractilidad ni el strain.
      ['el modal dibuja un checkbox por modulo y ninguno mas', chks.length === claves.length,
        chks.length + ' vs ' + claves.length],
      ['y ninguna etiqueta del modal nombra contractilidad ni SGL',
        !rotulos.some(nombra), rotulos.join(' | ')],
      // 3 · LAS COLUMNAS: las tres del nucleo salen sin elegir nada.
      ['las tres del nucleo no tienen modulo',
        NUCLEO.every(function(c){ return _labModDeCol(c) === null; }),
        NUCLEO.map(function(c){ return c + '=' + _labModDeCol(c); }).join(' | ')],
      ['y estan en el export SIN ningun modulo elegido',
        NUCLEO.every(function(c){ return basicas.indexOf(c) > -1; })],
      ['tambien con todos los modulos, y sin duplicarse',
        NUCLEO.every(function(c){ return conTodo.indexOf(c) > -1; }) &&
        conTodo.length === new Set(conTodo).size],
      // 4 · EL INVARIANTE FUERTE: el bloque 4 entero es basico.
      ['el bloque 4 tiene las tres y ademas la FEVI', bloque4.length >= 12 &&
        NUCLEO.every(function(c){ return bloque4.indexOf(c) > -1; }) &&
        bloque4.indexOf('FEVI Simpson (%)') > -1, bloque4.join(' | ')],
      ['NINGUNA columna del bloque 4 es opcional',
        bloque4.every(function(c){ return _labModDeCol(c) === null; }),
        bloque4.filter(function(c){ return _labModDeCol(c) !== null; }).join(' | ')],
      // 5 · LA CUENTA del modal es la que sale del export, no un numero aparte.
      ['la cuenta del modal declara las basicas reales',
        cuentaTxt.indexOf(basicas.length + ' columnas') === 0, cuentaTxt],
      ['y las basicas crecieron: el total no cambio, lo opcional si',
        basicas.length === 129 && TODAS.length === 429,   // +4 ET · +8 al cerrar la brecha del Lab
        basicas.length + ' basicas de ' + TODAS.length],
      // 6 · Una preferencia vieja con el modulo borrado no lo revive.
      ['una preferencia guardada con contr no revive el modulo', (function(){
        try { localStorage.setItem('ett_lab_export_pref', JSON.stringify({ sel:['contr','peri'], solo:true })); } catch(e){}
        const p = _labExpLeerPref();
        try { localStorage.removeItem('ett_lab_export_pref'); } catch(e){}
        return p.sel.length === 1 && p.sel[0] === 'peri';
      })()]
    ] };
  })();
`);

/* FUNCION DIASTOLICA DEL VD — ASE 2025 Tabla 6 (Mukherjee, JASE 2025;38:141-186).
   EL PATRON SALE DEL E/A SOLO; el E/e desempata unicamente la banda 0,8-2,1. Las dos bandas
   externas NO lo necesitan —en la Tabla 6 esa celda esta en blanco para relajacion y para
   restrictivo—, y exigirlo dejaba dos combinaciones sin ninguna rama, o sea en SILENCIO:
   E/A<0,8 con E/e>6, y E/A>2,1 con E/e<=6, que es el patron mas grave. Las dos estan acá. */
caso('TC-136', 'Diastolica del VD: el patron sale del E/A, el E/e desempata solo la banda del medio', `
  const V = function(o){ const faltan = [];
    Object.keys(o).forEach(function(k){ if (__t.set(k, o[k]) !== 1) faltan.push(k); });
    return faltan; };
  const esc = function(o){ __t.limpiar(); const f = V(o); const r = __t.informe();
    const lineas = r.inf.split(String.fromCharCode(10));
    let vd = '';
    for (let i = 0; i < lineas.length; i++)
      if (lineas[i].indexOf('culo derecho') > -1) { vd = lineas[i]; break; }
    return { vd: vd, inf: r.inf, suma: r.suma, faltan: f }; };
  const VDN = { vd_bas:'38', tapse:'20' };
  const con = function(extra){ const o = {}; Object.keys(VDN).forEach(function(k){ o[k] = VDN[k]; });
    Object.keys(extra).forEach(function(k){ o[k] = extra[k]; }); return o; };

  /* CLASIFICACION COMPLETA (E/A + E/e). Valores elegidos para que el cociente sea exacto. */
  const relaj  = esc(con({ dt_onda_e:'30',  dt_onda_a:'50', dt_eprime_lat:'6'    })); // E/A 0.60 · E/e 5.0
  const pseudo = esc(con({ dt_onda_e:'60',  dt_onda_a:'50', dt_eprime_lat:'7.5'  })); // E/A 1.20 · E/e 8.0
  const restr  = esc(con({ dt_onda_e:'100', dt_onda_a:'40', dt_eprime_lat:'11'   })); // E/A 2.50 · E/e 9.1
  const normal = esc(con({ dt_onda_e:'50',  dt_onda_a:'50', dt_eprime_lat:'12.5' })); // E/A 1.00 · E/e 4.0
  /* SOLO E/A: se nombra el patron y NO se gradua. */
  const relajS = esc(con({ dt_onda_e:'30',  dt_onda_a:'50' }));
  const restrS = esc(con({ dt_onda_e:'100', dt_onda_a:'40' }));
  const indet  = esc(con({ dt_onda_e:'60',  dt_onda_a:'50' }));   // banda del medio sin E/e
  const soloEp = esc(con({ dt_eprime_lat:'7' }));                 // E/e sin E/A: no se clasifica
  const nada   = esc(con({}));
  /* LOS DOS AGUJEROS que cerraria una cascada que exigiera E/e en las bandas externas. */
  const hoyoA  = esc(con({ dt_onda_e:'40',  dt_onda_a:'70', dt_eprime_lat:'5'  })); // E/A 0.57 · E/e 8.0
  const hoyoB  = esc(con({ dt_onda_e:'100', dt_onda_a:'40', dt_eprime_lat:'20' })); // E/A 2.50 · E/e 5.0
  /* COMBINACIONES con el resto de la oracion del VD. */
  const dilSev = esc({ vd_bas:'48', tapse:'14', dt_onda_e:'100', dt_onda_a:'40', dt_eprime_lat:'11' });
  const todoOk = esc({ vd_bas:'38', tapse:'20', s_prime:'14' });
  const sinVD  = esc({ dt_onda_e:'100', dt_onda_a:'40', dt_eprime_lat:'11' });
  /* UMBRALES POR LOS DOS LADOS. El operador sale del codigo: < 0.8, > 2.1, > 6. */
  const ea079 = esc(con({ dt_onda_e:'79',  dt_onda_a:'100', dt_eprime_lat:'5' })); // 0.79 -> relajacion
  const ea080 = esc(con({ dt_onda_e:'80',  dt_onda_a:'100', dt_eprime_lat:'5' })); // 0.80 -> NO relajacion
  const ea210 = esc(con({ dt_onda_e:'189', dt_onda_a:'90',  dt_eprime_lat:'5' })); // 2.10 -> NO restrictivo
  const ea211 = esc(con({ dt_onda_e:'190', dt_onda_a:'90',  dt_eprime_lat:'5' })); // 2.11 -> restrictivo
  const ee60  = esc(con({ dt_onda_e:'60',  dt_onda_a:'50',  dt_eprime_lat:'10' })); // E/e 6.0 -> normal
  const ee61  = esc(con({ dt_onda_e:'61',  dt_onda_a:'50',  dt_eprime_lat:'10' })); // E/e 6.1 -> pseudonormal
  /* SALVEDAD DE IT SIGNIFICATIVA (it_grado 3 = mod-severa). */
  __t.limpiar(); V(con({ dt_onda_e:'100', dt_onda_a:'40', dt_eprime_lat:'11' }));
  __t.set('it_grado','3'); const itSig = __t.informe();
  __t.limpiar(); V(con({ dt_onda_e:'100', dt_onda_a:'40', dt_eprime_lat:'11' }));
  __t.set('it_grado','1'); const itLeve = __t.informe();
  __t.limpiar(); V(con({ dt_onda_e:'50', dt_onda_a:'50', dt_eprime_lat:'12.5' }));
  __t.set('it_grado','4'); const itNormal = __t.informe();
  const SALV = 'puede invalidar estos par';

  return { extra: [
    // 0 · Ningun id inventado: asignar sobre un elemento inexistente no falla, calla.
    ['todos los ids del caso existen', relaj.faltan.length === 0 && dilSev.faltan.length === 0,
      relaj.faltan.concat(dilSev.faltan).join(',')],

    // 1 · CLASIFICACION COMPLETA — patron en el cuerpo, grado en el EN SUMA.
    ['E/A 0.60 + E/e 5.0 -> relajacion anormal',
      relaj.vd.indexOf('patrón de relajación anormal (E/A 0.60, E/e\\' 5.0)') > -1, relaj.vd],
    ['y al EN SUMA va el grado LEVE',
      relaj.suma.indexOf('disfunción diastólica leve') > -1, relaj.suma],
    ['E/A 1.20 + E/e 8.0 -> pseudonormal',
      pseudo.vd.indexOf('patrón pseudonormal (E/A 1.20, E/e\\' 8.0)') > -1, pseudo.vd],
    ['y al EN SUMA va MODERADA',
      pseudo.suma.indexOf('disfunción diastólica moderada') > -1, pseudo.suma],
    ['E/A 2.50 + E/e 9.1 -> restrictivo',
      restr.vd.indexOf('patrón restrictivo (E/A 2.50, E/e\\' 9.1)') > -1, restr.vd],
    ['y al EN SUMA va SEVERA',
      restr.suma.indexOf('disfunción diastólica severa') > -1, restr.suma],

    // 2 · EL PATRON NORMAL SE DESCRIBE Y NO SUBE. Las dos mitades: que este en el cuerpo Y que
    //     NO este en el resumen. Sin la segunda, un push de mas seguiria pasando el caso.
    ['E/A 1.00 + E/e 4.0 se describe como patron normal',
      normal.vd.indexOf('patrón normal (E/A 1.00, E/e\\' 4.0)') > -1, normal.vd],
    ['y NO sube ninguna disfuncion al EN SUMA',
      normal.suma.indexOf('diastólica') === -1 && normal.suma.indexOf('VD') === -1, normal.suma],

    // 3 · SOLO E/A: patron sugestivo, SIN grado.
    ['E/A 0.60 sin e -> sugestivo de relajacion anormal',
      relajS.vd.indexOf('patrón sugestivo de relajación anormal (E/A 0.60)') > -1, relajS.vd],
    ['E/A 2.50 sin e -> sugestivo de llenado restrictivo',
      restrS.vd.indexOf('patrón sugestivo de llenado restrictivo (E/A 2.50)') > -1, restrS.vd],
    ['y ninguno de los dos publica un GRADO',
      relajS.suma.indexOf('leve') === -1 && restrS.suma.indexOf('severa') === -1 &&
      relajS.suma.indexOf('patrón sugestivo de disfunción diastólica') > -1 &&
      restrS.suma.indexOf('patrón sugestivo de disfunción diastólica') > -1,
      relajS.suma + ' // ' + restrS.suma],
    ['sin E/e no se imprime un E/e inventado', relajS.vd.indexOf("E/e'") === -1, relajS.vd],

    // 4 · LA BANDA DEL MEDIO SIN E/e ES INDETERMINADA, y no afirma disfuncion.
    ['E/A 1.20 sin e -> normal o pseudonormal, sin decidir',
      indet.vd.indexOf('patrón sugestivo de llenado normal o pseudonormal (E/A 1.20)') > -1, indet.vd],
    ['y NO sube al EN SUMA: podria ser normal',
      indet.suma.indexOf('diastólica') === -1, indet.suma],

    // 5 · SIN E/A NO SE CLASIFICA NADA, tenga o no e.
    ['con e y sin E/A no hay texto diastolico',
      soloEp.vd.indexOf('diastólica') === -1, soloEp.vd],
    ['y sin ningun dato tricuspideo tampoco',
      nada.vd.indexOf('diastólica') === -1, nada.vd],

    // 6 · LOS DOS AGUJEROS. Son el corazon de este caso: con la cascada que pedia E/e en las
    //     bandas externas, los dos salian en SILENCIO — y el segundo es el patron mas grave.
    ['E/A < 0.8 con E/e > 6 NO queda en silencio',
      hoyoA.vd.indexOf('relajación anormal') > -1 &&
      hoyoA.suma.indexOf('disfunción diastólica leve') > -1, hoyoA.vd + ' // ' + hoyoA.suma],
    ['E/A > 2.1 con E/e <= 6 sigue siendo RESTRICTIVO',
      hoyoB.vd.indexOf('patrón restrictivo') > -1 &&
      hoyoB.suma.indexOf('disfunción diastólica severa') > -1, hoyoB.vd + ' // ' + hoyoB.suma],

    // 7 · LA ORACION DEL VD: la diastolica se suma, no reemplaza.
    ['VD dilatado + disfuncion sistolica + restrictivo: los tres en el cuerpo',
      dilSev.vd.indexOf('dilatado con disfunción sistólica') > -1 &&
      dilSev.vd.indexOf('patrón restrictivo') > -1, dilSev.vd],
    ['y los tres en el EN SUMA, en una sola linea',
      dilSev.suma.indexOf('VD dilatado con disfunción sistólica, disfunción diastólica severa.') > -1,
      dilSev.suma],
    ['VD normal con la diastolica alterada tiene linea propia',
      pseudo.suma.indexOf('VD de dimensiones normales, disfunción diastólica moderada.') > -1,
      pseudo.suma],
    ['VD normal y todo normal: silencio en el EN SUMA',
      todoOk.suma.indexOf('VD') === -1, todoOk.suma],
    /* LA COMPUERTA DEL BLOQUE. Sin el dato del VD, la oracion entera no se emitia y la
       diastolica —y la linea del Doppler tricuspideo— desaparecian sin una palabra. */
    ['con SOLO Doppler tricuspideo el VD igual se nombra',
      sinVD.vd.indexOf('Ventrículo derecho: función diastólica con patrón restrictivo') > -1, sinVD.vd],
    ['y la linea del Doppler tricuspideo tambien sale',
      sinVD.inf.indexOf('Doppler tricuspídeo:') > -1, sinVD.inf.slice(0, 300)],

    // 8 · UMBRALES POR LOS DOS LADOS. El operador es < 0.8, > 2.1 y > 6, no <= ni >=.
    ['E/A 0.79 es relajacion y 0.80 ya no',
      ea079.vd.indexOf('relajación anormal') > -1 && ea080.vd.indexOf('relajación anormal') === -1,
      ea079.vd + ' // ' + ea080.vd],
    ['E/A 2.11 es restrictivo y 2.10 ya no',
      ea211.vd.indexOf('patrón restrictivo') > -1 && ea210.vd.indexOf('patrón restrictivo') === -1,
      ea211.vd + ' // ' + ea210.vd],
    ['E/e 6.1 es pseudonormal y 6.0 es normal',
      ee61.vd.indexOf('patrón pseudonormal') > -1 && ee60.vd.indexOf('patrón normal') > -1,
      ee61.vd + ' // ' + ee60.vd],

    // 9 · LA SALVEDAD DE LA IT SIGNIFICATIVA (ASE: estos parametros pueden no ser validos).
    ['con IT mod-severa y patron anormal se imprime la salvedad',
      itSig.inf.indexOf(SALV) > -1, itSig.inf.slice(0, 200)],
    ['con IT leve NO se imprime', itLeve.inf.indexOf(SALV) === -1],
    ['y sobre un patron NORMAL tampoco, aunque la IT sea severa',
      itNormal.inf.indexOf(SALV) === -1]
  ] };
`);

/* CUATRO DEFECTOS DE VALVULA TRICUSPIDE Y PULMONAR (2026-09-16).
   1 calcET no tenia rama de normalidad: un gradiente medio de 1-2 mmHg —que es NORMAL— se
     escribia como 'Leve' en et_grado y bajaba al informe firmado. Y no se deshacia.
   2 _labValvCounts tenia et_grado en () => null con un comentario que decia que no existia en
     el modelo de datos. Era falso: esta en los 95 estudios.
   3 ip_grado era el unico grado valvular con value="" en su opcion 0: la ETIQUETA afirmaba
     «Sin insuficiencia» y el VALOR negaba. Cambiarlo rompe CINCO consumidores que preguntaban
     por verdad/falsedad — el peor borraba «Valvula pulmonar normal.» de todos los informes.
   4 cargarValvPills excluia la pastilla de estenosis tricuspidea al restaurar. */
caso('TC-137', 'Tricuspide y pulmonar: calcET sin rama normal, et_grado en el Lab, ip_grado y la pastilla', `
  const G = function(){ return document.getElementById('et_grado').value; };
  const set = function(id, v){ const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles:true })); return 1; };
  const gm = function(v){ set('et_gmedio', v); calcET(); return G(); };
  const limpio = function(){ const g = document.getElementById('et_grado');
    g.value = 'Sin estenosis'; delete g.dataset.sugerido; set('et_gmedio',''); calcET(); };

  // ── FIX 1 · calcET ──────────────────────────────────────────────────────────────────────
  limpio();
  const g1 = gm('1'), g3 = gm('3'), g49 = gm('4.9'), g50 = gm('5'), g6 = gm('6');
  const sev6 = (document.getElementById('et-sev').textContent || '').trim();
  /* Al borrar el gradiente NO hay grado que revertir —calcET solo sugiere el valor de reposo—
     pero la CAPSULA tiene que quedar limpia: si no, «Significativa (8 mmHg)» sigue en pantalla
     sobre un campo vacio. Eso si es alcanzable y es lo que se prueba. */
  limpio(); gm('8');
  const sevAntes = (document.getElementById('et-sev').textContent || '').trim();
  const gBorrado = gm('');
  const sevDespues = (document.getElementById('et-sev').textContent || '').trim();
  const msgDespues = (document.getElementById('et-gmedio-badge').textContent || '').trim();
  limpio();
  document.getElementById('et_grado').value = 'Moderada';
  const gManual = gm('1');                       // eleccion manual: no se pisa
  limpio();

  // ── FIX 1 · el informe emite la significacion DESDE EL GRADIENTE ────────────────────────
  const esc = function(gmed, grado){ __t.limpiar(); set('vd_bas','38'); set('et_gmedio', gmed);
    document.getElementById('et_grado').value = grado;
    const r = __t.informe();
    const li = r.inf.split(String.fromCharCode(10)).filter(function(l){ return l.indexOf('ricusp') > -1; }).join(' // ');
    return { inf: li, suma: r.suma }; };
  const i3 = esc('3','Sin estenosis');
  const i6 = esc('6','Sin estenosis');
  const i8 = esc('8','Moderada');

  // ── FIX 2 · _labValvCounts ──────────────────────────────────────────────────────────────
  const mk = function(et){ return { campos:{ im_grado:'0', em_grado:'sin', ia_grado:'0',
    ea_grado:'sin', it_grado:'0', et_grado: et } }; };
  const vc = _labValvCounts([mk('Sin estenosis'), mk('Sin estenosis'), mk('Moderada'), mk('Severa')]);
  /* POR NOMBRE, no por posicion: era length - 1 y al agregar la estenosis pulmonar como
     septima valvula ese indice paso a apuntar a OTRA columna — el caso seguia verde midiendo
     la valvula equivocada hasta que los conteos no dieron. */
  const iET = _LAB_VALV_LABELS.indexOf('Esten. Tricusp.');

  // ── FIX 3 · ip_grado ────────────────────────────────────────────────────────────────────
  const op0 = document.getElementById('ip_grado').options[0];
  const mig = function(c){ _migrarCamposLegacy(c); return c; };
  const mVacio = mig({ ip_grado:'' });
  const mAusente = mig({});
  const mReal = mig({ ip_grado:'Severa' });        // token nuevo: la migracion no lo toca
  __t.limpiar(); set('vd_bas','38'); const vpOp0 = __t.informe();
  /* Token NUEVO: «IP severa» dejo de ser una opcion al separar el modelo (2026-09-16) y
     asignarlo deja el select sin seleccion. La migracion de ese valor se prueba abajo. */
  __t.limpiar(); set('vd_bas','38'); set('ip_grado','Severa'); const vpSev = __t.informe();
  /* Fallot: con la opcion 0 el parrafo NO puede arrastrar un «Sin» suelto. */
  __t.limpiar(); set('tdf_civ_grad','31'); set('ip_grado','Sin insuficiencia');
  const tdfSin = __t.informe();
  __t.limpiar(); set('tdf_civ_grad','31'); set('ip_grado','Severa');
  const tdfSev = __t.informe();
  __t.limpiar();

  // ── FIX 4 · la pastilla se restaura ─────────────────────────────────────────────────────
  localStorage.setItem('valv-pill-esten-tricuspide','1');
  document.getElementById('bloque-esten-tricuspide').style.display = 'none';
  document.getElementById('pill-esten-tricuspide').className = 'btn btn-ghost valv-pill';
  cargarValvPills();
  const pillBloque = getComputedStyle(document.getElementById('bloque-esten-tricuspide')).display;
  const pillOn = document.getElementById('pill-esten-tricuspide').className.indexOf('btn-primary') > -1;
  try { localStorage.removeItem('valv-pill-esten-tricuspide'); } catch(e){}

  return { extra: [
    // FIX 1 — la bomba: un gradiente normal no puede escribir un grado.
    ['1 mmHg NO produce «Leve»', g1 === 'Sin estenosis', g1],
    ['3 mmHg tampoco', g3 === 'Sin estenosis', g3],
    ['el umbral es 5 y se prueba por los dos lados: 4.9 no es significativa',
      g49 === 'Sin estenosis', g49],
    ['5.0 ya lo es, y calcET NO inventa un grado por encima del umbral',
      g50 === 'Sin estenosis' && ET_GMEDIO_SIGNIF === 5, g50 + ' / umbral ' + ET_GMEDIO_SIGNIF],
    /* La capsula dice solo «Significativa» desde que integra los TRES criterios: el numero que
       la sostiene se movio al mensaje de abajo, porque ahora puede ser el gradiente, el THP o el
       area y ponerlos todos en la pastilla la volvia ilegible. */
    ['a 6 mmHg la capsula declara la significacion',
      sev6.indexOf('Significativa') > -1, sev6],
    ['borrar el gradiente deja el select en reposo y LIMPIA la capsula',
      gBorrado === 'Sin estenosis' && sevAntes.indexOf('Significativa') > -1 &&
      sevDespues.indexOf('Significativa') === -1 && msgDespues === '',
      'antes=' + sevAntes + ' | despues=' + sevDespues + ' | msg=' + JSON.stringify(msgDespues)],
    ['y un grado elegido a mano NO se pisa', gManual === 'Moderada', gManual],

    // FIX 1 — el informe: la significacion sale del gradiente, no del grado.
    ['3 mmHg no genera texto de estenosis tricuspidea',
      i3.inf.indexOf('Estenosis tricusp') === -1, i3.inf],
    ['y tampoco sube al EN SUMA', i3.suma.indexOf('ET ') === -1 &&
      i3.suma.indexOf('Estenosis tricusp') === -1, i3.suma],
    ['6 mmHg con el grado en «Sin estenosis» NO queda en silencio',
      i6.inf.indexOf('Estenosis tricuspídea significativa') > -1 &&
      i6.inf.indexOf('6 mmHg') > -1, i6.inf],
    ['y sube al EN SUMA', i6.suma.indexOf('ET significativa.') > -1, i6.suma],
    ['con grado manual Y gradiente alto salen los dos',
      i8.inf.indexOf('moderada') > -1 && i8.inf.indexOf('significativa') > -1 &&
      i8.suma.indexOf('ET moderada, significativa') > -1, i8.inf + ' // ' + i8.suma],

    // FIX 2 — et_grado deja de estar cableado a null.
    ['la ultima columna del Lab es la estenosis tricuspidea',
      _LAB_VALV_LABELS[iET].indexOf('Tricusp') > -1, _LAB_VALV_LABELS[iET]],
    ['y ya no sale con base 0: «Sin estenosis» es un hallazgo, no ausencia de dato',
      vc.bases[iET] === 4, 'base ' + vc.bases[iET]],
    ['cuenta la moderada y la severa donde corresponde',
      vc.counts.Moderada[iET] === 1 && vc.counts.Severa[iET] === 1 && vc.counts.Leve[iET] === 0,
      'L' + vc.counts.Leve[iET] + ' M' + vc.counts.Moderada[iET] + ' S' + vc.counts.Severa[iET]],
    ['y no se le mezclan las otras cinco valvulas',
      vc.counts.Moderada.slice(0, iET).every(function(n){ return n === 0; })],

    // FIX 3 — el token, el predicado y la migracion.
    ['la opcion 0 de ip_grado ya no vale cadena vacia',
      op0.value === 'Sin insuficiencia', 'value=' + JSON.stringify(op0.value)],
    ['y su value coincide con lo que el medico lee', op0.value === op0.textContent.trim()],
    ['ipHayInsuf distingue las cuatro',
      ipHayInsuf('Sin insuficiencia') === false && ipHayInsuf('') === false &&
      ipHayInsuf('IP leve (fisiológica)') === true && ipHayInsuf('IP severa') === true],
    ['la migracion traduce la cadena vacia', mVacio.ip_grado === 'Sin insuficiencia'],
    ['NO inventa el campo donde nunca estuvo',
      !Object.prototype.hasOwnProperty.call(mAusente, 'ip_grado')],
    ['y no toca un valor ya migrado', mReal.ip_grado === 'Severa'],
    /* LA REGRESION QUE ESTE CAMBIO PODIA CAUSAR: con el token truthy, hayIP daba siempre
       verdadero y la frase de normalidad de la valvula pulmonar desaparecia de TODO informe. */
    ['«Válvula pulmonar normal.» sigue saliendo con la opcion 0',
      vpOp0.inf.indexOf('Válvula pulmonar normal') > -1 ||
      vpOp0.inf.indexOf('morfología y flujo dentro de límites normales') > -1,
      vpOp0.inf.slice(0, 200)],
    ['y con IP severa se describe la insuficiencia',
      vpSev.inf.indexOf('nsuficiencia pulmonar severa') > -1, vpSev.inf.slice(0, 200)],
    ['Fallot con la opcion 0 no arrastra un «Sin» suelto',
      tdfSin.inf.indexOf('Sin insuficiencia') === -1 && tdfSin.suma.indexOf('Sin insuficiencia') === -1,
      tdfSin.suma],
    ['y con IP severa Fallot sigue nombrandola',
      tdfSev.inf.indexOf('nsuficiencia pulmonar severa') > -1, tdfSev.inf.slice(0, 250)],

    // FIX 4 — la sexta pastilla.
    ['la pastilla de estenosis tricuspidea se restaura al reabrir',
      pillBloque !== 'none' && pillOn === true, 'display=' + pillBloque + ' encendida=' + pillOn]
  ] };
`);

/* LA BRECHA DEL EXCEL EN LAS SECCIONES NUEVAS (2026-09-16).
   De todo lo construido esta semana faltaban OCHO columnas, no cuarenta: el resto ya estaba.
   · et_grado — viajaban el THP, el VTI y el area (los tres insumos de la significacion) y NO el
     grado que el medico consigno.
   · las SIETE casillas de inclusion de las secciones nuevas, mientras las doce viejas SI estaban.
     No es cosmetico: esa casilla decide si la seccion SALE en el informe firmado, asi que un
     estudio reimportado volvia con los datos y sin la decision de integrarlos — la seccion
     desaparecia del informe sin que nada lo dijera. */
caso('TC-146', 'Excel: el grado de ET y las siete casillas de inclusion que faltaban', `
  const cols = Object.keys(_labExcelRow({ id:0, campos:{} }));
  const CHKS = [['Incluir Marfan en informe','marfan_incluir_chk__chk'],
                ['Incluir Eisenmenger en informe','eisen_incluir_chk__chk'],
                ['Incluir Fontan en informe','fontan_incluir_chk__chk'],
                ['Incluir subaórtica en informe','esub_incluir_chk__chk'],
                ['Incluir supravalvular en informe','easv_incluir_chk__chk'],
                ['Incluir DSAV en informe','dsav_incluir_chk__chk'],
                ['Incluir CVPA en informe','cvpa_incluir_chk__chk']];
  /* Un estudio con la casilla ENCENDIDA y otro con ella apagada: el 1/0 tiene que distinguirlos,
     porque lo que se pierde al no viajar es justamente la decision de integrar. */
  const on = {}, off = {};
  CHKS.forEach(function(p){ on[p[1]] = '1'; off[p[1]] = '0'; });
  on.et_grado = 'Severa';
  const rOn = _labExcelRow({ id:0, campos:on }), rOff = _labExcelRow({ id:0, campos:off });

  return { extra: [
    // 1 · EL GRADO DE ET.
    ['ET grado tiene columna', cols.indexOf('ET grado') > -1],
    ['y sale lo consignado, no lo derivado', rOn['ET grado'] === 'Severa', JSON.stringify(rOn['ET grado'])],
    /* Es tipo «opcion»: sin entrada en LAB_XLS_LISTAS el importador descarta la FILA ENTERA. */
    ['el importador acepta las cuatro opciones del grado',
      ['Sin estenosis','Leve','Moderada','Severa'].every(function(v){ return _labXlsLista('et_grado', v) === v; }),
      ['Sin estenosis','Leve','Moderada','Severa'].map(function(v){ return v + '->' + _labXlsLista('et_grado', v); }).join(' | ')],
    ['y rechaza lo que no es una opcion', _labXlsLista('et_grado', 'Gravisima') === null],
    ['viajan tambien los tres insumos de la significacion',
      ['ET grad medio (mmHg)','ET THP (ms)','ET VTI diast (cm)','ET área (cm²)']
        .every(function(c){ return cols.indexOf(c) > -1; })],

    // 2 · LAS SIETE CASILLAS.
    ['las siete secciones nuevas tienen su columna de inclusion',
      CHKS.every(function(p){ return cols.indexOf(p[0]) > -1; }),
      CHKS.filter(function(p){ return cols.indexOf(p[0]) === -1; }).map(function(p){ return p[0]; }).join(', ')],
    ['encendida exporta 1', CHKS.every(function(p){ return rOn[p[0]] === 1; }),
      CHKS.map(function(p){ return p[0].replace('Incluir ','').replace(' en informe','') + '=' + rOn[p[0]]; }).join(' ')],
    ['y apagada exporta 0, que NO es lo mismo que ausente',
      CHKS.every(function(p){ return rOff[p[0]] === 0; })],
    /* Las doce viejas siguen estando: agregar las nuevas no podia desplazarlas. */
    ['las doce casillas anteriores siguen en su lugar',
      ['Incluir FOP en informe','Incluir VAB en informe','Incluir TAVI en informe','Incluir ductus en informe']
        .every(function(c){ return cols.indexOf(c) > -1; })],

    // 3 · LOS CUATRO ASSERTS DEL EXCEL.
    ['listas, vocabularios, bloques y modulos, todos en cero',
      _labXlsAssertListas().length === 0 && _labXlsAssertVocab().length === 0 &&
      _labXlsAssertBloques().length === 0 && _labAssertModulos().length === 0,
      _labXlsAssertListas().concat(_labXlsAssertVocab()).concat(_labXlsAssertBloques()).join(' | ')]
  ] };
`);

/* TC-147 — Los bloques nuevos del Laboratorio LEEN las funciones clinicas, no las reimplementan.
   La condicion que vale es la del UMBRAL POR SINDROME: un Loeys-Dietz de 47 mm tiene indicacion
   Clase I y un Marfan de 47 mm NO la tiene (su corte es 50). Cualquier reimplementacion que
   cablee un umbral unico -que es lo que hacen los trece bloques viejos- se pone en rojo ahi, y
   ninguna condicion que solo cuente estudios lo detecta. */
caso('TC-147', 'Lab CC/Mediciones: los bloques leen *Estado(), no reimplementan la regla', `
  const C = function(o){ return { id: 0, campos: o }; };
  const infs = [
    C({ marfan_sindrome:'lds',    marfan_ao_seno:'47' }),
    C({ marfan_sindrome:'marfan', marfan_ao_seno:'47' }),
    C({ marfan_sindrome:'marfan', marfan_ao_seno:'47', marfan_factores_riesgo:'si' }),
    C({ marfan_ao_seno:'47' }),
    C({ eis_lesion_base:'civ', eis_saturacion_reposo:'86', eis_clase_nyha:'iii', eis_psap:'80', tapse:'16' }),
    C({ eis_lesion_base:'cia', eis_saturacion_reposo:'9' }),
    C({ fontan_tipo:'extra', fontan_vs_fevi:'42', fontan_saturacion:'88', fontan_comp_epp__chk:'1' }),
    C({ fontan_tipo:'tunel', fontan_vs_fevi:'50', fontan_saturacion:'94' }),
    C({ esub_tipo:'membrana' }), C({ easv_tipo:'reloj' }),
    C({ dsav_tipo:'parcial' }), C({ dsav_tipo:'completo' }), C({ cvpa_venas_numero:'1' }),
    C({ dt_onda_e:'60', dt_onda_a:'50', dt_eprime_lat:'7.5', dt_triv:'70', vm_morf:'Endocarditis', vt_morf:'Carcinoide', ep_etiologia:'Carcinoide' }),
    C({ dt_onda_e:'40', dt_onda_a:'80', vm_morf:'Endocarditis', ip_etiologia:'No especificada' }),
    C({ dt_onda_e:'120', dt_onda_a:'40', va_morf:'Bicúspide' })
  ];
  labCCRender(infs, infs.length);
  labMedTricValvRender(infs, infs.length);
  const T = function(id){ const e = document.getElementById(id); return e ? e.innerText.replace(/\\s+/g,' ') : ''; };
  const marfan = T('lab-cc-marfan-cx-bars'), eisen = T('lab-cc-eisen-stats');
  const fontan = T('lab-cc-fontan-oms-bars'), etiol = T('lab-med-etiol-cont');
  const patron = T('lab-med-dt-bars'), dtst = T('lab-med-dt-stats');

  /* Un estudio que hace LANZAR una cascada no puede tumbar la tarjeta: se cuenta y se declara.
     Se prueba con un getter hostil, que es lo que puede llegar de un backup JSON manipulado. */
  /* Se prueba el SEAM que se construyo (_labEstado), no un estudio-bomba armado a mano: un
     getter que lanza no puede venir de JSON.parse, asi que probarlo con eso seria probar el
     mecanismo y no la alcanzabilidad. Lo que se fija es que el envoltorio devuelva null, cuente
     el fallo y no propague. */
  const cont = { n: 0 };
  const capturado = _labEstado(function reventar(){ throw new Error('boom'); }, { id:0, campos:{} }, cont);

  return { extra: [
    // 1 · EL UMBRAL LO ELIGE EL SINDROME — es lo que separa leer de reimplementar.
    /* 'Clase I' es SUBSTRING de 'Clase IIa': la condicion pasaria con la rama equivocada.
       Se busca el texto que solo produce cx_i. Tercera vez en la sesion que muerde esto. */
    ['Loeys-Dietz 47mm sale Clase I (su corte es 45)', marfan.indexOf('cirug') > -1 && marfan.indexOf('indicada') > -1, marfan],
    /* La cascada tiene rama PROPIA para esto (umbral_iia_sin_fr): 47mm esta sobre el corte de
       45 en que los factores pasan a indicar cirugia, pero no hay factores consignados. No es
       'sin criterios' ni es criterio cumplido. Mi expectativa inicial estaba mal, no el codigo. */
    ['Marfan 47mm SIN factores queda sobre el umbral IIa, no en criterio cumplido',
      marfan.indexOf('Sobre el umbral IIa') > -1, marfan],
    ['Marfan 47mm CON factores sale Clase IIa', marfan.indexOf('Clase IIa') > -1, marfan],
    ['aorta medida sin sindrome es NO CONCLUIBLE, no "sin criterios"', marfan.indexOf('falta el s') > -1, marfan],

    // 2 · LA BANDA DE PLAUSIBILIDAD ES LA DE LA SECCION CLINICA, no una escrita en el Lab.
    ['saturacion 9 (fuera de banda 40-100) NO entra al promedio', eisen.indexOf('86 % (n=1)') > -1, eisen],
    ['el denominador de "<90 %" son las saturaciones VALIDAS, no todos', eisen.indexOf('1 de 1') > -1, eisen],
    ['la PSAP se lee, no se recalcula', eisen.indexOf('80 mmHg') > -1, eisen],

    // 3 · TRES ESTADOS EN EL RIESGO OMS DE FONTAN, no dos.
    ['Fontan con complicaciones sale clase IV', fontan.indexOf('Clase IV') > -1, fontan],
    ['Fontan sin complicaciones interrogadas sale NO INTERROGADO', fontan.indexOf('No interrogado') > -1, fontan],
    ['"no interrogado" no se reparte entre III y IV', fontan.indexOf('Clase III') === -1, fontan],

    // 4 · EL PATRON DIASTOLICO DEL VD SALE DE dtDiastEstado.
    ['E/A 1,2 con E/e-prima 8 -> pseudonormal', patron.indexOf('Pseudonormal') > -1, patron],
    ['E/A 0,5 -> relajacion anormal', patron.indexOf('Relajaci') > -1, patron],
    ['E/A 3,0 -> restrictivo', patron.indexOf('Restrictivo') > -1, patron],
    ['el E/A promedio lo calcula dopTricEstado (1,57)', dtst.indexOf('1.57') > -1, dtst],

    // 5 · "No especificada" NO es una etiologia: es el default Y el destino de la migracion.
    ['la insuficiencia pulmonar NO aparece: su unico valor era "No especificada"',
      etiol.indexOf('Insuficiencia pulmonar') === -1, etiol],
    ['la estenosis pulmonar SI aparece: tiene una etiologia real', etiol.indexOf('Estenosis pulmonar') > -1, etiol],
    ['solo se listan valvulas con al menos un caso (pulmonar sin morfologia, ausente)',
      etiol.indexOf('Válvula pulmonar') === -1, etiol],
    ['la mitral cuenta sus dos endocarditis', etiol.indexOf('Endocarditis') > -1, etiol],

    // 6 · LOS SIETE PREDICADOS NUEVOS NO MATCHEAN UN ESTUDIO VACIO.
    ['las 7 secciones nuevas estan en _CC_SECS',
      ['marfan','eisen','fontan','esub','easv','dsav','cvpa'].every(function(k){ return !!_ccSecPred(k); })],
    ['ningun predicado nuevo matchea un estudio en blanco (no dice que la tenga todo el mundo)',
      ['marfan','eisen','fontan','esub','easv','dsav','cvpa'].every(function(k){ return !_ccSecPred(k)({ id:0, campos:{} }); })],

    // 7 · GUARDAS DE BORDE: token ajeno y estudio que lanza.
    ['un sindrome que el select no puede producir NO lanza y se declara',
      (function(){ try { return marfanEstado({ marfan_sindrome:'constructor', marfan_ao_seno:'47' }).clave === 'sindrome_no_reconocido'; } catch (e) { return false; } })()],
    ['una cascada que lanza devuelve null y no propaga', capturado === null],
    ['y el fallo se CUENTA para poder declararlo al pie', cont.n === 1, String(cont.n)],
    ['todas las claves de marfanEstado tienen etiqueta (si aparece una decima, esto se pone rojo)',
      T('lab-cc-marfan-stats').indexOf('4 de 4') > -1, T('lab-cc-marfan-stats')]
  ] };
`);

/* TC-148 — PPT estadistico del Laboratorio. Se intercepta `writeFile` para LEER las diapositivas
   reales en vez de descargar un archivo: es la misma tecnica que el archivo ya usa para jsPDF.
   Sin eso, lo unico verificable seria que la funcion no lanza, que es lo que no importa. */
caso('TC-148', 'PPT del Laboratorio: rangos de PSAP y no grados, paleta, y la compuerta del periodo vacio', `
  return (async function(){
    /* ESPERA A QUE CARGUE, como TC-131 con SheetJS. El bundle de pptxgenjs son 477 KB y es el
       ultimo de los seis scripts externos: sin esta espera el caso da rojo intermitente por el
       ENTORNO —medido, la libreria si estaba a los 6 s— y eso es peor que no tener el caso,
       porque se deja de creerle al rojo. Si igual no llega, falla con el motivo escrito. */
    for (let _i = 0; _i < 80 && typeof PptxGenJS === 'undefined'; _i++) await new Promise(function(r){ setTimeout(r, 100); });
    if (typeof PptxGenJS === 'undefined') {
      return { extra: [['PptxGenJS cargo por CDN (sin esto el caso no prueba nada)', false, 'la libreria no llego']] };
    }
    const orig = PptxGenJS.prototype.writeFile;
    let capt = null;
    /* Se intercepta "_pptxDescargarSaneado", que es por donde sale el mazo desde que hay que
       podar el [Content_Types].xml. Interceptar writeFile dejo de capturar nada. */
    const origDesc = window._pptxDescargarSaneado;
    window._pptxDescargarSaneado = function(P2, nombre){ capt = { self:P2, name:nombre || '' }; return Promise.resolve({ saneado:true, quitadas:0 }); };
    PptxGenJS.prototype.writeFile = function(o){ capt = { self:this, name:(o && o.fileName) || '' }; return Promise.resolve(capt.name); };

    const C = function(f, o){ return { id:0, fecha_estudio:f, campos:o }; };
    const infs = [
      C('2026-03-15', { fevi:'62', sexo:'F', edad:'71', psap_calc:'48', tapse:'19', im_grado:'2',
                        en_suma:'Disfuncion diastolica grado II, pseudonormal.' }),
      C('2026-04-02', { fevi:'28', sexo:'M', edad:'64', psap_calc:'72', tapse:'14', ia_grado:'4',
                        en_suma:'Patron restrictivo (grado III).' }),
      /* Este NIEGA el patron restrictivo. Con el clasificador crudo contaba como grado III. */
      C('2026-04-20', { fevi:'45', sexo:'F', edad:'58', psap_calc:'30', tapse:'22',
                        en_suma:'Se descarta patron restrictivo.' })
    ];

    let toasts = [];
    const origToast = window.toast;
    window.toast = function(m){ toasts.push(String(m)); };

    /* Se pasa la seleccion COMPLETA: desde el rediseno el mazo es modular y sin "mods"/"anal"
       solo se generan las diapositivas fijas. */
    __t.pptTodo();
    await _labPPTGenerar(infs, { presentador:'Dra. Prueba', institucion:'Centro X', fecha:'2026-09-20', tema:'azul' });

    const P = capt ? capt.self : null;
    const slides = P ? (P.slides || P._slides || []) : [];
    const txtDe = function(k){
      const s2 = slides[k]; if (!s2) return '';
      const objs = s2._slideObjects || s2.data || [];
      return objs.map(function(o){
        if (o.text == null) return '';
        if (typeof o.text === 'string') return o.text;
        if (Array.isArray(o.text)) return o.text.map(function(t){ return t && t.text ? t.text : ''; }).join(' ');
        return '';
      }).join(' | ');
    };
    const tablasDe = function(k){
      const s2 = slides[k]; if (!s2) return 0;
      const objs = s2._slideObjects || s2.data || [];
      return objs.filter(function(o){ return o._type === 'table' || !!o.arrTabRows; }).length;
    };
    /* El nombre se guarda ACA: mas abajo "capt" se resetea a null para probar la compuerta del
       periodo vacio, y leerlo despues daba cadena vacia. */
    const archivo = capt ? capt.name : '';
    /* POR TITULO Y NO POR INDICE. La version anterior usaba txtDe(4)/txtDe(8) sobre un mazo de
       nueve fijas; al volverse modular esos indices pasaron a apuntar a otra diapositiva y el
       caso acusaba al generador de perder el cierre. Un indice posicional es lo primero que se
       rompe cuando el mazo gana o pierde una hoja. */
    const idxDe = function(t){ for (let k = 0; k < slides.length; k++) { if (txtDe(k).indexOf(t) > -1) return k; } return -1; };
    const porTitulo = function(t){ const k = idxDe(t); return k < 0 ? '' : txtDe(k); };
    const portada = txtDe(0), resumen = porTitulo('Resumen ejecutivo');
    const valv = porTitulo('Valvulopat'), htp = porTitulo('Presión pulmonar');
    const cierre = txtDe(slides.length - 1);
    const bgAzul = slides.length ? ((slides[0].background && slides[0].background.color) || (slides[0].bkgd && slides[0].bkgd.color) || '') : '';

    /* COMPUERTA DEL PERIODO VACIO: se llama la ENTRADA real, que es la que decide, con el store
       filtrado a cero. Probar _labPPTGenerar con [] probaria otra cosa: la compuerta vive antes. */
    capt = null; toasts = [];
    const origGet = window.labGetInformes;
    window.labGetInformes = function(){ return []; };
    let abrioModal = false;
    const origModal = window._labPPTModal;
    window._labPPTModal = function(){ abrioModal = true; };
    labPPTEstadistico();
    window.labGetInformes = origGet;
    window._labPPTModal = origModal;
    const toastVacio = toasts.join(' ');

    window.toast = origToast;
    PptxGenJS.prototype.writeFile = orig;
    window._pptxDescargarSaneado = origDesc;

    return { extra: [
      // 1 · ESTRUCTURA
      ['con todos los modulos el mazo pasa de 9 diapositivas', slides.length > 9, String(slides.length)],
      ['el archivo se llama EcoSmart_Laboratorio_*.pptx', /^EcoSmart_Laboratorio_\\d{8}/.test(archivo), archivo],

      // 2 · PORTADA
      ['la portada lleva el titulo del laboratorio', portada.indexOf('Laboratorio de Ecocardiograf') > -1, portada.slice(0,140)],
      ['la portada lleva presentador e institucion', portada.indexOf('Dra. Prueba') > -1 && portada.indexOf('Centro X') > -1, portada.slice(0,140)],
      ['la portada declara el periodo', portada.indexOf('Per') > -1 && portada.indexOf('odo analizado') > -1, portada.slice(0,140)],
      ['la portada declara el N', portada.indexOf('3 estudios') > -1, portada.slice(0,180)],

      // 3 · EL N DE LA DIAPO 2 ES EL DE LA COHORTE
      ['el resumen ejecutivo publica el N correcto', resumen.indexOf('Estudios') > -1 && resumen.indexOf('| 3 |') > -1, resumen.slice(0,200)],
      ['el titulo de la diapositiva de PSAP sigue existiendo', htp.length > 0, String(idxDe('Presión pulmonar'))],
      ['y el promedio de FEVI de los tres', resumen.indexOf('45.0 %') > -1, resumen.slice(0,240)],

      // 4 · LA DIASTOLICA USA EL CLASIFICADOR CANONICO
      /* Tres estudios: uno grado II, uno grado III, uno que NIEGA el restrictivo. Con "test()"
         crudo el negado sumaba a III y la diapositiva diria «Grado III (n=2)». */
      /* Se verifica sobre el SEAM y no sobre el texto de la diapositiva: desde el rediseno la
       distribucion diastolica es un grafico nativo, asi que su rotulo ya no esta en el innerText.
       El invariante es el mismo y ahora no depende de como se presente. */
    ['«se descarta patron restrictivo» NO cuenta como grado III',
      _labDiastDist(infs).cat.III === 1, JSON.stringify(_labDiastDist(infs).cat)],

      // 5 · VALVULOPATIAS: TABLA CON LAS OCHO VALVULAS
      ['la diapositiva de valvulopatias lleva una tabla', tablasDe(idxDe('Valvulopat')) === 1, String(idxDe('Valvulopat'))],
      ['y declara sobre que base son los porcentajes', valv.indexOf('total de estudios') > -1, valv.slice(0,200)],

      // 6 · RANGOS DE PSAP, NO GRADOS DE HTP
      ['la diapositiva de PSAP declara que son RANGOS y no grados', htp.indexOf('RANGOS') > -1 && htp.indexOf('no grados') > -1, htp.slice(-200)],
      ['y NO rotula ninguna banda como Leve/Moderada/Severa',
        htp.indexOf('Leve') === -1 && htp.indexOf('Moderada') === -1 && htp.indexOf('Severa') === -1, htp.slice(0,300)],
      /* «PSAP promedio de los elevados» salio de esta diapositiva en el rediseno: la especificacion
       la reemplazo por TAPSE y patron diastolico del VD. Se verifica lo que SI publica. */
    ['la diapositiva de PSAP declara cuantos estudios la tienen estimable', htp.indexOf('Con PSAP estimable') > -1, htp.slice(0,300)],

      // 7 · CIERRE
      ['el cierre dice «Preguntas»', cierre.indexOf('Preguntas') > -1, cierre],
      ['el cierre lleva al presentador', cierre.indexOf('Dra. Prueba') > -1, cierre],
      ['y la fecha de presentacion sin correrse un dia por UTC', cierre.indexOf('20/09/2026') > -1, cierre],

      // 8 · PALETA
      ['la paleta elegida se aplica al fondo', String(bgAzul).toUpperCase().indexOf('0F172A') > -1, String(bgAzul)],

      // 9 · SIN ESTUDIOS NO SE GENERA NADA
      ['sin estudios no se abre el modal', abrioModal === false],
      ['sin estudios no se genera PPT', capt === null],
      ['y se avisa por que', toastVacio.indexOf('No hay estudios') > -1, toastVacio]
    ] };
  })();
`);

/* TC-149 — Manual interactivo y su PDF. El invariante que manda es el CONTEO DE PAGINAS del PDF
   REAL: el criterio del pedido era "<= 20 paginas" y eso no se deduce del tamano del HTML.
   Se mide envolviendo el CONSTRUCTOR de jsPDF, porque save() es propiedad de la instancia. */
caso('TC-149', 'Manual: 8 pestanas, PDF de 20 paginas o menos, y las advertencias clinicas intactas', `
  const M = ECO_AYUDA.map(function(a){ return (a.tab || '') + ' ' + (a.html || ''); }).join(' ');

  let pags = null;
  if (typeof window.jspdf !== 'undefined') {
    const Orig = window.jspdf.jsPDF;
    window.jspdf.jsPDF = function(){ const d = new Orig(arguments[0]);
      d.save = function(){ try { pags = d.internal.getNumberOfPages(); } catch(e){} return d; }; return d; };
    window.jspdf.jsPDF.prototype = Orig.prototype;
    try { _manualPDFArmar(); } catch(e){ pags = 'EXC: ' + e.message; }
    window.jspdf.jsPDF = Orig;
  }

  /* El aplanador reconoce las clases por NOMBRE. Una clase m* que no este en esta lista no
     rompe nada en pantalla: rompe el PDF en silencio, porque su recuadro pierde el prefijo. */
  const CONOCIDAS = ['mP','mSub','mBox','mAviso','mTip','mCaso','mUl','mOl','mTbl','mKbd'];
  const usadas = {};
  (M.match(/class="([^"]*)"/g) || []).forEach(function(c){
    c.replace(/class="|"/g,'').split(/\\s+/).forEach(function(x){ if (x.indexOf('m') === 0) usadas[x] = 1; });
  });
  const desconocidas = Object.keys(usadas).filter(function(k){ return CONOCIDAS.indexOf(k) < 0; });

  /* Umbrales que el pedido declara intocables. Se eligen de modulos distintos a proposito. */
  const UMBRALES = [
    ['ET significativa', '5 mmHg'], ['THP tricuspideo', '190 ms'],
    ['Loeys-Dietz', '45 mm'], ['Marfan', '50 mm'], ['no sindromica', '55 mm'],
    ['caida de FEVI', '10 puntos porcentuales'], ['NT-proBNP en FA', '375 pg/mL'],
    ['CIA resistencia', '3 UW'], ['Fallot VTDVD', '160 ml/m'], ['LAVI', '34 ml/m']
  ];
  const faltan = UMBRALES.filter(function(u){ return M.indexOf(u[1]) === -1; }).map(function(u){ return u[0]; });

  const tabsOk = ECO_AYUDA.every(function(a){ return a.tab && a.html && a.html.length > 400; });
  const sinBackticks = ECO_AYUDA.every(function(a){ return a.html.indexOf(String.fromCharCode(96)) === -1; });

  return { extra: [
    // 1 · ESTRUCTURA
    ['el manual tiene 8 pestanas', ECO_AYUDA.length === 8, String(ECO_AYUDA.length)],
    ['ninguna pestana quedo vacia', tabsOk],
    ['existe la pestana de referencia clinica', M.indexOf('Referencia cl') > -1],

    // 2 · EL CRITERIO DEL PEDIDO, MEDIDO SOBRE EL PDF REAL
    ['el PDF del manual entra en 20 paginas o menos', typeof pags === 'number' && pags <= 20, String(pags)],
    ['y sigue teniendo contenido (no se vacio)', typeof pags === 'number' && pags >= 8, String(pags)],

    // 3 · EL MARCADO ES UN CONTRATO CON EL APLANADOR
    ['no hay clases m* que el aplanador no reconozca', desconocidas.length === 0, desconocidas.join(', ')],
    ['ningun html lleva backticks (romperian el template literal)', sinBackticks],

    // 4 · LO QUE NO SE PUEDE PERDER
    ['estan los umbrales de modulos distintos', faltan.length === 0, faltan.join(' · ')],
    ['esta el disclaimer medico-legal', M.indexOf('No reemplaza el juicio cl') > -1],
    ['esta el aviso de que el JSON es la unica copia', M.indexOf('backup JSON') > -1],
    ['esta la advertencia de que la app no gradua la HTP por PSAP',
      M.indexOf('no grad') > -1 && M.indexOf('PSAP') > -1],
    ['esta la diferencia entre modo basico y avanzado',
      M.indexOf('Avanzado') > -1 && M.indexOf('no borra lo cargado') > -1],
    ['esta la advertencia de VEXUS sobre graduar por el vaso peor', M.indexOf('vaso peor') > -1],
    ['cada umbral nombra su guia', M.indexOf('ESC 2020') > -1 && M.indexOf('ASE 2025') > -1 && M.indexOf('ESC/EACTS 2024') > -1],

    // 5 · LAS TRES AFIRMACIONES QUE HABIAN QUEDADO FALSAS
    ['ya no dice que el Excel son 94 columnas', M.indexOf('94 columnas') === -1],
    ['dice las 429 columnas reales', M.indexOf('429') > -1],
    ['ya no dice que Fallot no tiene campos de volumen',
      M.indexOf('no tiene campos de volumen') === -1 && M.indexOf('VTDVD indexado') > -1],
    ['ya no dice que la valvula pulmonar no tiene columna propia',
      M.indexOf('no tiene columna propia') === -1]
  ] };
`);

/* TC-150 — PPT del Laboratorio rediseñado: selector de contenido y graficos NATIVOS.
   Se intercepta writeFile y se inspeccionan los objetos de cada diapositiva: un mazo que "se
   genera sin lanzar" no prueba nada; lo que hay que ver es que la diapositiva opcional NO este
   cuando no se pidio, y que los graficos sean charts y no rectangulos dibujados a mano. */
caso('TC-150', 'PPT Lab: graficos nativos, semaforo de FEVI y asociaciones leidas del Lab', `
  return (async function(){
    /* ESPERA A QUE CARGUE, como TC-131 con SheetJS. El bundle de pptxgenjs son 477 KB y es el
       ultimo de los seis scripts externos: sin esta espera el caso da rojo intermitente por el
       ENTORNO —medido, la libreria si estaba a los 6 s— y eso es peor que no tener el caso,
       porque se deja de creerle al rojo. Si igual no llega, falla con el motivo escrito. */
    for (let _i = 0; _i < 80 && typeof PptxGenJS === 'undefined'; _i++) await new Promise(function(r){ setTimeout(r, 100); });
    if (typeof PptxGenJS === 'undefined') {
      return { extra: [['PptxGenJS cargo por CDN', false, 'la libreria no llego']] };
    }
    const orig = PptxGenJS.prototype.writeFile;
    const origAdd = PptxGenJS.prototype.addSlide;
    let capt = null, llamadas = [];
    /* Se intercepta "_pptxDescargarSaneado", que es por donde sale el mazo desde que hay que
       podar el [Content_Types].xml. Interceptar writeFile dejo de capturar nada. */
    const origDesc = window._pptxDescargarSaneado;
    window._pptxDescargarSaneado = function(P2, nombre){ capt = { self:P2, name:nombre || '' }; return Promise.resolve({ saneado:true, quitadas:0 }); };
    PptxGenJS.prototype.writeFile = function(o){ capt = { self:this, name:(o && o.fileName) || '' }; return Promise.resolve(''); };
    /* Se intercepta en la FRONTERA DE LA API (addChart), no leyendo los internos de la slide:
       los datos del grafico no quedan en el objeto de la diapositiva sino en el registro de la
       presentacion, y las opciones viven en "options" y no en "opts". Envolviendo la llamada se
       captura exactamente lo que la app pasa: tipo, series y opciones. */
    PptxGenJS.prototype.addSlide = function(){
      const sl = origAdd.apply(this, arguments);
      const oc = sl.addChart;
      sl.addChart = function(tipo, datos, opciones){
        llamadas.push({ tipo: tipo, datos: datos, opciones: opciones || {} });
        return oc.apply(this, arguments);
      };
      return sl;
    };

    const infs = [];
    for (let i = 0; i < 16; i++) {
      infs.push({ id:i, fecha_estudio:'2026-0' + (1 + (i % 4)) + '-1' + (i % 9), campos:{
        fevi:String(25 + i*4), psap_calc:String(22 + i*4), onda_e:String(70 + i*2), e_prima_sept:String(11 - i*0.4),
        tapse:String(13 + i), sgl:String(-(9 + i*0.7)), edad:String(45 + i*2), sexo: i%2 ? 'F':'M',
        peso:'80', talla:'180', vol_ai:String(50 + i*3), ai_diam:String(34 + i),
        im_grado:String(1 + (i%4)), ea_grado: i%3===0 ? 'Severa':'sin', vm_morf: i%4===0 ? 'Endocarditis':'Normal',
        dt_onda_e:String(50 + i), dt_onda_a:String(60 - i), dt_eprime_lat:'7.5',
        indicaciones:['Disnea','Control'][i%2], antecedentes_sel:['HTA','DM'][i%2],
        eis_lesion_base: i<4 ? 'civ':'', eis_saturacion_reposo: i<4 ? String(84+i):'', eis_clase_nyha: i<4 ? 'iii':'',
        co_farmaco: i<6 ? 'antraciclina':'', co_fevi_basal: i<6 ? String(58+i):'', co_riesgo_cv: i<6 ? ['bajo','alto','moderado'][i%3]:'',
        /* El texto de geometria alimenta _labGeomCat, que es de donde sale la TORTA de la
           diapositiva 2. Sin el, esa torta se omite (correctamente) y el caso no podria
           verificar que se usan los tres tipos de grafico nativo. */
        en_suma: (i%3===0 ? 'Disfuncion diastolica grado II, pseudonormal. Hipertension pulmonar. ' : 'Patron restrictivo (grado III). ') +
                 (i%2===0 ? 'Hipertrofia ventricular izquierda concentrica.' : 'Remodelado concentrico del ventriculo izquierdo.')
      } });
    }
    const base = { presentador:'Dra. Prueba', institucion:'Centro X', fecha:'2026-09-20', tema:'azul' };
    /* Recibe CLAVES DE TARJETA: desde el 2026-09-16 el mazo lo gobiernan las casillas «PPT» y
       no el selector del modal, que quedo con presentador y paleta. La ESTRUCTURA del mazo la
       cubre TC-155; lo que sigue siendo de este caso son los graficos nativos, el semaforo de la
       FEVI y que las asociaciones y la tendencia salgan de los seams del Lab. */
    const corrida = async function(claves){
      __t.pptSel(claves);
      capt = null; llamadas = [];
      await _labPPTGenerar(infs, Object.assign({}, base, {}));
      const P2 = capt ? capt.self : null;
      const sl = P2 ? (P2.slides || []) : [];
      return sl.map(function(s2){
        const objs = s2._slideObjects || [];
        const txt = objs.map(function(o){
          if (typeof o.text === 'string') return o.text;
          if (Array.isArray(o.text)) return o.text.map(function(t){ return t && t.text ? t.text : ''; }).join(' ');
          return '';
        }).filter(Boolean).join(' | ');
        const charts = objs.filter(function(o){ return o._type === 'chart' || !!o.chartRid; });
        return { txt: txt, charts: charts, tablas: objs.filter(function(o){ return o._type === 'table' || !!o.arrTabRows; }).length };
      });
    };
    let capturadas = [];
    const tieneTitulo = function(sl, t){ return sl.some(function(x){ return x.txt.indexOf(t) > -1; }); };

    const TODO = await corrida(['actividad','demografia','funcion','vd','htp','valvulas','onco','eisenmenger','asoc','comparar']);
    capturadas = llamadas.slice();
    const MIN  = await corrida(['actividad','demografia']);
    const SINV = await corrida(['actividad','funcion','vd','htp']);
    /* Sin un solo campo de congenitas: la 11 tiene que omitirse SIN error, no salir vacia. */
    const sinCC = infs.map(function(x){
      const c = Object.assign({}, x.campos);
      c.eis_lesion_base = ''; c.eis_saturacion_reposo = ''; c.eis_clase_nyha = '';
      return { id:x.id, fecha_estudio:x.fecha_estudio, campos:c };
    });
    capt = null;
    __t.pptSel(['actividad','ciaciv','eisenmenger']);
    await _labPPTGenerar(sinCC, Object.assign({}, base, {}));
    const sinCCsl = capt ? (capt.self.slides || []).map(function(s2){
      const objs = s2._slideObjects || [];
      return objs.map(function(o){ return typeof o.text === 'string' ? o.text : ''; }).join(' ');
    }) : [];

    /* Los colores del grafico de FEVI. El semaforo tiene que ir de VERDE (>=50) a ROJO (<30),
       en el orden en que _labFeviDist devuelve las bandas. Invertirlo pinta de verde la FEVI
       severamente reducida, y en una sala eso se lee antes que el rotulo. */
    const chFevi = capturadas.filter(function(c){ return String(c.opciones.title || '').indexOf('FEVI por rangos') > -1; })[0];
    const colFevi = chFevi ? (chFevi.opciones.chartColors || []) : [];

    const sAsoc = TODO.filter(function(x){ return x.txt.indexOf('Asociaciones estad') > -1; })[0];
    const sTend = TODO.filter(function(x){ return x.txt.indexOf('Actividad por mes') > -1; })[0];
    const tipos = {};
    capturadas.forEach(function(c){ const t = c.tipo && (c.tipo.name || c.tipo); if (t) tipos[String(t)] = 1; });

    PptxGenJS.prototype.writeFile = orig;
    window._pptxDescargarSaneado = origDesc;
    PptxGenJS.prototype.addSlide = origAdd;

    return { extra: [
      // 1 · ESTRUCTURA COMPLETA
      /* El conteo exacto ya no es de este caso: depende de que tarjetas se tilden, y eso lo fija
         TC-155. Lo que sigue siendo invariante es que haya mas de una tematica. */
      ['con diez tarjetas tildadas salen varias tematicas', TODO.length > 6, String(TODO.length)],
      ['la metodologia esta siempre', tieneTitulo(TODO, 'Metodolog') && tieneTitulo(MIN, 'Metodolog')],
      ['el cierre dice Preguntas', tieneTitulo(TODO, 'Preguntas')],

      // 2 · EL SELECTOR MANDA
      ['con solo actividad y demografia el mazo se achica', MIN.length < TODO.length, MIN.length + ' vs ' + TODO.length],
      ['sin asociaciones no hay diapositiva de asociaciones', !tieneTitulo(MIN, 'Asociaciones estad')],
      ['sin tendencia no hay diapositiva de actividad por mes', !tieneTitulo(MIN, 'Actividad por mes')],
      ['sin subgrupos no hay comparacion de FEVI', !tieneTitulo(MIN, 'frente a FEVI')],
      ['sin el modulo de valvulas no hay tabla de valvulopatias', !tieneTitulo(SINV, 'Valvulopat')],
      ['pero si los modulos que si se pidieron', tieneTitulo(SINV, 'Función sistólica') && tieneTitulo(SINV, 'Presión pulmonar')],
      ['sin datos de congenitas la diapositiva se omite sin error',
        sinCCsl.length > 0 && !sinCCsl.some(function(t){ return t.indexOf('Cardiopat') > -1; }), String(sinCCsl.length)],

      // 3 · GRAFICOS NATIVOS, NO DIBUJOS
      ['los graficos son charts nativos de PowerPoint', Object.keys(tipos).length > 0, Object.keys(tipos).join(',')],
      ['se usan barras y torta y linea', !!tipos.bar && !!tipos.pie && !!tipos.line, Object.keys(tipos).join(',')],
      ['la tabla de valvulopatias sigue siendo tabla nativa',
        TODO.filter(function(x){ return x.txt.indexOf('Valvulopat') > -1; })[0].tablas === 1],

      // 4 · SEMAFORO DE LA FEVI
      ['el grafico de FEVI lleva cuatro colores', colFevi.length === 4, colFevi.join(',')],
      ['verde para FEVI conservada y rojo para la severamente reducida',
        String(colFevi[0]).toUpperCase() === '3ECF8E' && String(colFevi[3]).toUpperCase() === 'F05454', colFevi.join(',')],

      // 5 · LAS ASOCIACIONES SE LEEN DEL LAB
      ['la diapositiva de asociaciones existe', !!sAsoc],
      ['y declara que corrige por comparaciones multiples',
        !!sAsoc && sAsoc.txt.indexOf('comparaciones m') > -1, sAsoc ? sAsoc.txt.slice(-160) : ''],
      /* LO QUE DISTINGUE "lee del Lab" DE "recalcula": el mazo tiene que mostrar EXACTAMENTE las
         asociaciones que _labAsocParaPDF marca como establecidas, ni una mas ni una menos, y con
         sus mismos rotulos. Verificar que la diapositiva existe y lleva las salvedades NO alcanza
         — un generador que recalcula por su cuenta las escribe igual. */
      ['muestra tantas asociaciones como establecidas reporta el Lab (hasta 3)',
        (function(){
          const A2 = _labAsocParaPDF(infs);
          const ok = (A2.clinicas || []).concat(A2.general || []).filter(function(r){ return r && r.ok; });
          const barras = capturadas.filter(function(c){ return c.opciones.valAxisMaxVal === 1; });
          return barras.length === Math.min(3, ok.length);
        })(),
        (function(){
          const A2 = _labAsocParaPDF(infs);
          const ok = (A2.clinicas || []).concat(A2.general || []).filter(function(r){ return r && r.ok; });
          return 'lab=' + ok.length + ' mazo=' + capturadas.filter(function(c){ return c.opciones.valAxisMaxVal === 1; }).length;
        })()],
      ['y sus tamanos de efecto son los que calculo el Lab, no otros',
        (function(){
          const A2 = _labAsocParaPDF(infs);
          const ok = (A2.clinicas || []).concat(A2.general || []).filter(function(r){ return r && r.ok; })
            .sort(function(a, b){ return Math.abs(b.coef || 0) - Math.abs(a.coef || 0); }).slice(0, 3);
          const barras = capturadas.filter(function(c){ return c.opciones.valAxisMaxVal === 1; });
          if (!barras.length || barras.length !== ok.length) return false;
          return ok.every(function(r, k){
            const esperado = Math.round(Math.abs(r.coef || 0) * 100) / 100;
            /* El rotulo pasa por _pptTxt (saneador de XML) antes de entrar al grafico, asi que
               se compara contra la forma saneada y no contra la cruda. */
            /* PptxGenJS normaliza "labels" a array ANIDADO (soporta categorias multinivel), asi
               que labels[0] es ['Fuerte'] y no 'Fuerte'. Se aplana antes de comparar. */
            const lbl0 = String([].concat(barras[k].datos[0].labels[0])[0]);
            return barras[k].datos[0].values[0] === esperado && lbl0 === _pptTxt(r.fuerza || '');
          });
        })(),
        (function(){
          const A2 = _labAsocParaPDF(infs);
          const ok = (A2.clinicas || []).concat(A2.general || []).filter(function(r){ return r && r.ok; })
            .sort(function(a, b){ return Math.abs(b.coef || 0) - Math.abs(a.coef || 0); }).slice(0, 3);
          const barras = capturadas.filter(function(c){ return c.opciones.valAxisMaxVal === 1; });
          return 'lab=' + JSON.stringify(ok.map(function(r){ return [Math.round(Math.abs(r.coef||0)*100)/100, r.fuerza]; })) +
                 ' mazo=' + JSON.stringify(barras.map(function(b){ return [b.datos[0].values[0], b.datos[0].labels[0]]; }));
        })()],
      ['y los rotulos de las asociaciones salen del Lab',
        (function(){
          const A2 = _labAsocParaPDF(infs);
          const lbls = (A2.clinicas || []).concat(A2.general || []).filter(function(r){ return r && r.ok; }).map(function(r){ return r.lbl; });
          if (!sAsoc) return false;
          const barras = capturadas.filter(function(c){ return c.opciones.valAxisMaxVal === 1; });
          if (!barras.length) return false;
          return lbls.some(function(l){ return sAsoc.txt.indexOf(l) > -1; });
        })()],
      ['y que asociacion no implica causalidad (o que ninguna alcanzo significacion)',
        !!sAsoc && (sAsoc.txt.indexOf('no implica causalidad') > -1 || sAsoc.txt.indexOf('Ninguna asociaci') > -1), sAsoc ? sAsoc.txt.slice(0,160) : ''],

      // 6 · LA TENDENCIA SALE DE _labMeses
      /* La serie tiene que ser, valor por valor, la que devuelve _labMeses. Es la unica forma de
         distinguir "lee el seam" de "cuenta por su cuenta y da parecido". */
      ['la tendencia usa la funcion del Lab y no un conteo propio',
        (function(){
          const c = capturadas.filter(function(x){ return String(x.tipo && (x.tipo.name || x.tipo)) === 'line'; })[0];
          if (!c || !c.datos || !c.datos.length) return false;
          const meses = _labMeses(infs);
          return c.datos[0].values.length === meses.length &&
                 c.datos[0].values.every(function(v, k){ return v === meses[k][1]; });
        })(), String(capturadas.length)]
    ] };
  })();
`);

/* TC-151 — Los dos bugs reportados el 2026-09-16 sobre el archivo REAL.
   1) PowerPoint pedia reparar: PptxGenJS 3.12.0 declara un slideMaster POR DIAPOSITIVA en
      [Content_Types].xml y embarca uno solo. Es de la libreria —se reproduce con un mazo
      vainilla— y afectaba a los DOS exportadores.
   2) Solo 7 diapositivas: con una cohorte chica se caen todas las compuertas de datos a la vez
      y el mazo se achicaba SIN DECIR NADA. */
caso('TC-151', 'PPT: el paquete no pide reparacion y las diapositivas omitidas se declaran', `
  return (async function(){
    /* ESPERA A QUE CARGUE, como TC-131 con SheetJS. El bundle de pptxgenjs son 477 KB y es el
       ultimo de los seis scripts externos: sin esta espera el caso da rojo intermitente por el
       ENTORNO —medido, la libreria si estaba a los 6 s— y eso es peor que no tener el caso,
       porque se deja de creerle al rojo. Si igual no llega, falla con el motivo escrito. */
    for (let _i = 0; _i < 80 && typeof PptxGenJS === 'undefined'; _i++) await new Promise(function(r){ setTimeout(r, 100); });
    if (typeof PptxGenJS === 'undefined' || typeof JSZip === 'undefined') {
      return { extra: [['PptxGenJS y JSZip disponibles', false, 'falta ' + (typeof PptxGenJS === 'undefined' ? 'PptxGenJS' : 'JSZip')]] };
    }
    const colgados = async function(buf){
      const z = await JSZip.loadAsync(buf);
      const ct = await z.file('[Content_Types].xml').async('string');
      const decl = (ct.match(/PartName="\\/[^"]+"/g) || []).map(function(m){ return m.slice(11, -1); });
      return decl.filter(function(pn){ return !z.file(pn); });
    };

    /* 1 · EL DEFECTO ES DE LA LIBRERIA: un mazo vainilla de 4 diapositivas, sin una linea de
       esta app, ya declara partes que no existen. Sin esta comprobacion el caso no distingue
       "lo arregle" de "nunca estuvo roto". */
    const V = new PptxGenJS(); V.layout = 'LAYOUT_16x9';
    for (let k = 0; k < 4; k++) { V.addSlide().addText('x' + k, { x:1, y:1, w:2, h:0.4 }); }
    const colgVanilla = await colgados(await V.write({ outputType:'arraybuffer' }));

    /* 2 · EL HELPER REAL, con la descarga interceptada. */
    const origCreate = URL.createObjectURL, origClick = HTMLAnchorElement.prototype.click;
    let blobCapt = null;
    URL.createObjectURL = function(b){ blobCapt = b; return 'blob:test'; };
    HTMLAnchorElement.prototype.click = function(){};
    const P2 = new PptxGenJS(); P2.layout = 'LAYOUT_16x9';
    for (let k = 0; k < 4; k++) { P2.addSlide().addText('x' + k, { x:1, y:1, w:2, h:0.4 }); }
    const res = await _pptxDescargarSaneado(P2, 'prueba.pptx');
    URL.createObjectURL = origCreate; HTMLAnchorElement.prototype.click = origClick;
    const colgSaneado = blobCapt ? await colgados(await blobCapt.arrayBuffer()) : ['sin blob'];

    /* 3 · LAS OMISIONES SE DECLARAN. Cohorte de DOS estudios: se caen las compuertas de FEVI,
       diastolica, PSAP, subgrupos y oncologia, que es el caso reportado. */
    const chica = [];
    for (let k = 0; k < 2; k++) {
      chica.push({ id:k, fecha_estudio:'2026-03-0' + (1 + k), campos:{
        fevi:String(45 + k*5), psap_calc:String(30 + k*5), tapse:String(18 + k), edad:String(60 + k), sexo:'F',
        en_suma:'Disfuncion diastolica grado II, pseudonormal.' } });
    }
    let capt2 = null, toasts = [];
    const origDesc2 = window._pptxDescargarSaneado, origToast = window.toast;
    window._pptxDescargarSaneado = function(P3){ capt2 = P3; return Promise.resolve({ saneado:true, quitadas:0 }); };
    window.toast = function(m){ toasts.push(String(m)); };
    __t.pptTodo();
    await _labPPTGenerar(chica, { presentador:'X', institucion:'Y', fecha:'2026-09-20', tema:'dark' });
    window._pptxDescargarSaneado = origDesc2; window.toast = origToast;
    const slides = capt2 ? (capt2.slides || []) : [];
    /* PptxGenJS guarda el texto como ARRAY DE RUNS cuando lo normaliza, no siempre como cadena.
       Leyendo solo el caso string, la hoja de metodologia quedaba invisible para el caso. */
    const textoDe = function(s2){ return (s2._slideObjects || []).map(function(o){
      if (typeof o.text === 'string') return o.text;
      if (Array.isArray(o.text)) return o.text.map(function(t){ return t && t.text ? t.text : ''; }).join('');
      return '';
    }).join(' | '); };
    const meto = slides.filter(function(s2){ return textoDe(s2).indexOf('Metodolog') > -1; })[0];
    const lineasOmit = meto ? textoDe(meto).split(' | ').filter(function(t){ return t.indexOf('NO se incluy') > -1; }) : [];
    const elToast = toasts.join(' ');

    return { extra: [
      // 1 · EL DEFECTO EXISTIA Y ERA DE LA LIBRERIA
      ['un mazo vainilla de PptxGenJS declara partes que no existen',
        colgVanilla.length > 0, String(colgVanilla.length) + ' colgados: ' + colgVanilla.slice(0,2).join(',')],
      ['y son overrides de slideMaster',
        colgVanilla.every(function(x){ return x.indexOf('slideMaster') > -1; }), colgVanilla.slice(0,3).join(',')],

      // 2 · EL HELPER LO CIERRA
      ['el helper reporta que saneo el paquete', res.saneado === true],
      ['y cuenta cuantos overrides quito', res.quitadas === colgVanilla.length, res.quitadas + ' vs ' + colgVanilla.length],
      ['el paquete descargado no tiene NINGUNA parte declarada que falte',
        colgSaneado.length === 0, colgSaneado.slice(0,3).join(',')],

      // 3 · LAS OMISIONES SE DECLARAN
      ['con una cohorte chica el mazo se achica', slides.length > 0 && slides.length < 14, String(slides.length)],
      ['pero el toast dice cuantas se omitieron', elToast.indexOf('Se omitieron') > -1, elToast.slice(0,180)],
      ['y la hoja de metodologia lista cada una con su motivo',
        lineasOmit.length >= 3, lineasOmit.length + ': ' + lineasOmit.slice(0,2).join(' // ')],
      /* Especifico de la linea que produce faltanN. La version anterior buscaba solo
         "se necesitan al menos", frase que tambien escriben las omisiones de tendencia y de
         subgrupos —que no pasan por faltanN—, asi que vaciar faltanN no ponia nada en rojo. */
      ['el motivo nombra el dato que falta y cuantos hacen falta',
        lineasOmit.some(function(t){
          return t.indexOf('sist') > -1 && t.indexOf('estudio(s) con FEVI medida') > -1 &&
                 t.indexOf('se necesitan al menos') > -1;
        }), lineasOmit.join(' // ').slice(0, 200)],
      ['la metodologia sigue estando aunque falten diapositivas', !!meto]
    ] };
  })();
`);

/* TC-152 - "Sigue pidiendo reparar" + "las diapositivas 2 y 5 salen vacias" (2026-09-16).
   ERAN EL MISMO DEFECTO. Los seams del Laboratorio guardan el color en formato CSS -con
   almohadilla- porque los consume el dashboard; PptxGenJS normaliza eso en la ruta de la TORTA y
   no en la de las BARRAS, asi que el hexadecimal invalido llegaba crudo a srgbClr. OOXML exige
   seis digitos y PowerPoint no ignora el atributo: pide reparar y AL REPARAR BORRA LA DIAPOSITIVA
   ENTERA. Las dos unicas barras que reciben un seam con color propio son la diastolica del resumen
   (hoja 2) y la de la hoja 5 - exactamente las dos que salian en blanco.
   La condicion que vale es la GENERICA: cero srgbClr fuera de seis hex en TODO el paquete. Buscar
   la almohadilla en dos graficos concretos pasaria en verde el dia que un seam nuevo entre por
   otra hoja, que es como entro este. */
caso('TC-152', 'PPT Lab: ningun color invalido llega al paquete, y las diapositivas 2 y 5 traen su grafico', `
  return (async function(){
    /* ESPERA A QUE CARGUE, como TC-131 con SheetJS. El bundle de pptxgenjs son 477 KB y es el
       ultimo de los seis scripts externos: sin esta espera el caso da rojo intermitente por el
       ENTORNO —medido, la libreria si estaba a los 6 s— y eso es peor que no tener el caso,
       porque se deja de creerle al rojo. Si igual no llega, falla con el motivo escrito. */
    for (let _i = 0; _i < 80 && typeof PptxGenJS === 'undefined'; _i++) await new Promise(function(r){ setTimeout(r, 100); });
    if (typeof PptxGenJS === 'undefined' || typeof JSZip === 'undefined') {
      return { extra: [['PptxGenJS y JSZip disponibles', false, 'falta ' + (typeof PptxGenJS === 'undefined' ? 'PptxGenJS' : 'JSZip')]] };
    }
    /* Sin regex: el escape se lo come el template literal del caso, y ya se pago siete veces. */
    const coloresDe = function(xml){
      const out = [], p = xml.split('srgbClr val="');
      for (let i = 1; i < p.length; i++) out.push(p[i].slice(0, p[i].indexOf('"')));
      return out;
    };
    const SEIS = /^[0-9A-Fa-f]{6}$/;

    /* 1 - EL DEFECTO ES REAL Y ES DE LA LIBRERIA: un mazo vainilla con una barra a la que se le
       pasa el color en formato CSS escribe el hexadecimal invalido tal cual. Sin esta mitad el
       caso no distingue "lo arregle" de "nunca estuvo roto". */
    const V = new PptxGenJS(); V.layout = 'LAYOUT_16x9';
    const sv = V.addSlide();
    sv.addChart(V.ChartType.bar, [{ name:'x', labels:['a','b'], values:[1,2] }],
      { x:1, y:1, w:4, h:2, barDir:'bar', chartColors:['#f05454', '#f0a500'] });
    const zv = await JSZip.loadAsync(await V.write({ outputType:'arraybuffer' }));
    let crudos = [];
    const nomsV = Object.keys(zv.files).filter(function(f){ return f.indexOf('.xml') > -1 && !zv.files[f].dir; });
    for (let i = 0; i < nomsV.length; i++) {
      crudos = crudos.concat(coloresDe(await zv.file(nomsV[i]).async('string')).filter(function(c){ return !SEIS.test(c); }));
    }

    /* 2 - EL SANEADOR. */
    const hex = [_pptHex('#f05454'), _pptHex('F05454'), _pptHex('#fff'), _pptHex('rojo'), _pptHex(null), _pptHex('#F05454  ')];

    /* 3 - UN COLOR ILEGIBLE SE REEMPLAZA, NO SE DESCARTA. Filtrarlo correria las categorias una
       posicion y pintaria de verde la FEVI severamente reducida - el defecto que TC-150 vigila. */
    let paleta = null;
    const P0 = new PptxGenJS(); P0.layout = 'LAYOUT_16x9';
    const s0 = P0.addSlide();
    const och = s0.addChart;
    s0.addChart = function(t, d, o){ paleta = (o || {}).chartColors; return och.apply(this, arguments); };
    _pptAddChart(s0, P0.ChartType.bar, [{ name:'x', labels:['a','b','c'], values:[1,2,3] }],
      { x:1, y:1, w:4, h:2, chartColors:['#3ecf8e', 'no-es-un-color', '#f05454'] });

    /* 4 - EL ARREGLO ESTA EN EL BORDE, NO EN EL SEAM: el dashboard necesita la almohadilla. */
    const semilla = [];
    for (let k = 0; k < 6; k++) {
      semilla.push({ id:k, fecha_estudio:'2026-0' + (1 + (k % 3)) + '-1' + k, campos:{
        fevi:String(28 + k*8), psap_calc:String(25 + k*8), onda_e:String(80 + k*3), e_prima_sept:String(10 - k*0.5),
        tapse:String(15 + k), edad:String(50 + k*3), sexo: k%2 ? 'F':'M', peso:'80', talla:'180',
        vol_ai:String(45 + k*4), im_grado:String(1 + (k%4)),
        en_suma: (k%2===0 ? 'Disfuncion diastolica grado II, pseudonormal. ' : 'Patron restrictivo (grado III). ') +
                 (k%2===0 ? 'Hipertrofia ventricular izquierda concentrica.' : 'Remodelado concentrico del ventriculo izquierdo.') } });
    }
    const seamConNumeral = _labDiastDist(semilla).dist.every(function(x){ return String(x.color).charAt(0) === '#'; });

    /* 5 - EL MAZO REAL. Se intercepta la DESCARGA y no "_pptxDescargarSaneado", porque lo que hay
       que mirar es el paquete que sale, no el que entra al saneador del [Content_Types]. */
    const origCreate = URL.createObjectURL, origClick = HTMLAnchorElement.prototype.click, origToast = window.toast;
    let blobCapt = null;
    URL.createObjectURL = function(b){ blobCapt = b; return 'blob:test'; };
    HTMLAnchorElement.prototype.click = function(){};
    window.toast = function(){};
    __t.pptTodo();
    await _labPPTGenerar(semilla, { presentador:'X', institucion:'Y', fecha:'2026-09-20', tema:'azul' });
    URL.createObjectURL = origCreate; HTMLAnchorElement.prototype.click = origClick; window.toast = origToast;
    if (!blobCapt) return { extra: [['el mazo del Laboratorio se descargo', false, 'no hubo blob']] };
    const z = await JSZip.loadAsync(await blobCapt.arrayBuffer());
    const noms = Object.keys(z.files).filter(function(f){ return f.indexOf('.xml') > -1 && !z.files[f].dir; });
    let malos = [];
    for (let i = 0; i < noms.length; i++) {
      const cs = coloresDe(await z.file(noms[i]).async('string')).filter(function(c){ return !SEIS.test(c); });
      if (cs.length) malos.push(noms[i] + ': ' + cs.join(','));
    }
    /* 6 - LAS HOJAS 2 Y 5 NO PUEDEN QUEDAR SIN SU GRAFICO. Es el sintoma que se reporto, y se
       verifica sobre el paquete y no sobre los objetos de PptxGenJS. */
    const graficosDe = async function(n){
      const f = z.file('ppt/slides/slide' + n + '.xml');
      if (!f) return -1;
      return (await f.async('string')).split('<p:graphicFrame>').length - 1;
    };
    const g2 = await graficosDe(2), g5 = await graficosDe(5);
    const txt2 = z.file('ppt/slides/slide2.xml') ? (await z.file('ppt/slides/slide2.xml').async('string')) : '';

    return { extra: [
      // 1 - EL DEFECTO EXISTIA Y ERA DE LA LIBRERIA
      ['PptxGenJS escribe el color de una BARRA sin normalizarlo',
        crudos.length > 0, crudos.join(',') || 'ninguno: la libreria ya lo normaliza y este caso no prueba nada'],
      ['y el invalido es exactamente el que traen los seams del Lab',
        crudos.indexOf('#f05454') > -1, crudos.join(',')],

      // 2 - EL SANEADOR
      ['saca la almohadilla y pasa a mayusculas', hex[0] === 'F05454', String(hex[0])],
      ['deja igual el que ya estaba bien', hex[1] === 'F05454', String(hex[1])],
      ['expande el hexadecimal de tres digitos', hex[2] === 'FFFFFF', String(hex[2])],
      ['y devuelve null para lo que no es un color', hex[3] === null && hex[4] === null, hex[3] + ' / ' + hex[4]],
      ['tolera espacios alrededor', hex[5] === 'F05454', String(hex[5])],

      // 3 - SE REEMPLAZA, NO SE DESCARTA
      ['la paleta conserva su largo aunque un color sea ilegible',
        !!paleta && paleta.length === 3, paleta ? paleta.join(',') : 'sin paleta'],
      ['y cada color queda en SU posicion',
        !!paleta && paleta[0] === '3ECF8E' && paleta[2] === 'F05454', paleta ? paleta.join(',') : ''],

      // 4 - EL ARREGLO VA EN EL BORDE
      ['el seam del Lab sigue devolviendo el color con almohadilla para el dashboard',
        seamConNumeral, JSON.stringify(_labDiastDist(semilla).dist.map(function(x){ return x.color; }))],

      // 5 - EL PAQUETE REAL
      ['ningun srgbClr del paquete queda fuera de seis hexadecimales',
        malos.length === 0, malos.slice(0, 3).join(' // ')],

      // 6 - LAS DOS HOJAS DEL REPORTE
      ['la diapositiva 2 conserva sus dos graficos', g2 === 2, String(g2)],
      ['la diapositiva 5 conserva el suyo', g5 === 1, String(g5)],
      ['y la 2 sigue siendo el resumen ejecutivo', txt2.indexOf('Resumen ejecutivo') > -1, txt2.slice(0, 0) + String(txt2.length)]
    ] };
  })();
`);

/* TC-157 - Diagrama de Forrester: interactivo en el Lab, PNG en la diapositiva (2026-09-16).
   LA DIVISORIA QUE SE DIBUJA Y EL OPERADOR QUE CLASIFICA SON EL MISMO NUMERO. El pedido proponia
   la linea en PCP 18 y la app clasifica en 15 —y lo imprime: la capsula dice «con congestion
   (PCP >15)»—; con 18, todo punto entre 15 y 18 saldria pintado de «humedo» por DEBAJO de la
   linea de «seco». Se conservo el 15 y se extrajo a UMBRAL_PCP_HUMEDO, que ahora gobierna los
   cuatro sitios.
   Aritmetica de la cohorte, para que los valores no sean magicos: con D=20 mm, VTI=20 cm,
   talla 170 y peso 75, vs = pi*1^2*20 = 62.83 mL y BSA = 1.882, asi que IC = 62.83*FC/1000/1.882
   — FC 84 da 2.80 (caliente) y FC 54 da 1.80 (frio). PCP = 1.24*(E/e')+1.9: E 60 con e' 11 da
   8.7 (seco) y E 110 con e' 5.5 da 26.7 (humedo). */
caso('TC-157', 'Forrester: cuadrantes, puntos por paciente y el diagrama en la diapositiva', `
  return (async function(){
    const mk = function(i, c, nom){
      const base = { talla:'170', peso:'75', diam_tsvi:'20', itv_tsvi:'20' };
      Object.keys(c).forEach(function(k){ base[k] = c[k]; });
      return { id:400+i, estudioId:'t157-'+i, uuid:'u157-'+i, nombre: nom || ('Pac ' + i), ci:'C'+i,
               fecha_estudio:'2026-03-0'+i, fecha_guardado:'2026-04-01T09:00:00',
               informe_texto:'', en_suma:'', campos: base };
    };
    const SECO   = { onda_e:'60',  e_sep:'10', e_lat:'12' };
    const HUMEDO = { onda_e:'110', e_sep:'5',  e_lat:'6'  };
    const coh = [
      mk(1, Object.assign({ hemo_fc:'84' }, SECO),   "O'Brien & <b>X</b>"),
      mk(2, Object.assign({ hemo_fc:'54' }, HUMEDO)),
      mk(3, Object.assign({ hemo_fc:'84' }, HUMEDO)),
      mk(4, Object.assign({ hemo_fc:'54' }, SECO)),
      mk(5, SECO),                      // sin FC  -> sin IC
      mk(6, { hemo_fc:'84' })           // sin E/e -> sin PCP
    ];
    const r = coh.map(_labICPCP);
    const pts = _labForrPuntos(coh);

    await CeiboStore.setLocal(coh);
    const b = [].slice.call(document.querySelectorAll('[onclick*="showTab"]'))
      .filter(function(x){ return (x.getAttribute('onclick') || '').indexOf("'lab'") > -1; })[0];
    if (b) b.click();
    await new Promise(function(x){ setTimeout(x, 400); });
    const selP = document.getElementById('lab-periodo'); if (selP) selP.value = '0';
    if (typeof labCohorteLimpiar === 'function') { try { labCohorteLimpiar(true); } catch (e) {} }
    labInit();
    await new Promise(function(x){ setTimeout(x, 1600); });
    const cont = document.getElementById('lab-adv-hemo-diag');
    const svg  = cont ? cont.querySelector('svg') : null;
    const circ = svg ? [].slice.call(svg.querySelectorAll('circle[data-eid]')) : [];
    const tip0 = circ.length ? (circ[0].querySelector('title') || {}).textContent : '';
    const torta = document.getElementById('lab-adv-hemo-forr');
    const debajo = (torta && cont) ? (cont.getBoundingClientRect().top >= torta.getBoundingClientRect().top) : false;
    const denom = (typeof labGetInformes === 'function') ? labGetInformes().length : -1;
    const fondo1 = svg ? (svg.querySelector('rect') || {}).getAttribute('fill') : null;
    /* Modo dia/noche: el fondo tiene que CAMBIAR. Si diera lo mismo estaria comparando dos veces
       el mismo tema y pasaria sin probar nada — la trampa que ya costo TC-114. */
    const htmlEl = document.documentElement;
    if (typeof toggleTheme === 'function') { try { toggleTheme(); } catch (e) {} }
    else { htmlEl.setAttribute('data-theme', 'light'); }
    labInit(); await new Promise(function(x){ setTimeout(x, 900); });
    const svg2 = document.getElementById('lab-adv-hemo-diag').querySelector('svg');
    const fondo2 = svg2 ? (svg2.querySelector('rect') || {}).getAttribute('fill') : null;
    if (typeof toggleTheme === 'function') { try { toggleTheme(); } catch (e) {} }

    /* EL ESTADO VACIO: sin ningun estudio estimable el diagrama sale IGUAL, con sus cuadrantes y
       el mensaje. Un contenedor en blanco se lee como que el modulo se rompio. */
    const vacio = _labForrSVG([], _FORR_PAL_PPT, {});
    /* Y un estudio SIN IC no puede aparecer en el origen, que se leeria como shock. */
    const sinIC = _labForrPuntos([mk(9, SECO)]);

    let pptOk = false, tienePng = false;
    if (typeof PptxGenJS !== 'undefined') {
      const oD = window._pptxDescargarSaneado, oT = window.toast;
      let capt = null;
      window._pptxDescargarSaneado = function(P){ capt = P; return Promise.resolve({saneado:true, quitadas:0}); };
      window.toast = function(){};
      try { localStorage.setItem('ecosmart_lab_ppt_chk', JSON.stringify({ hemo:true })); } catch (e) {}
      await _labPPTGenerar(coh, { presentador:'X', institucion:'Y', fecha:'2026-09-20', tema:'azul' });
      window._pptxDescargarSaneado = oD; window.toast = oT;
      try { localStorage.removeItem('ecosmart_lab_ppt_chk'); } catch (e) {}
      const sl = capt ? (capt.slides || []) : [];
      const hoja = sl.filter(function(x){
        return (x._slideObjects || []).some(function(o){
          const t = typeof o.text === 'string' ? o.text : (Array.isArray(o.text) ? o.text.map(function(z){ return z && z.text ? z.text : ''; }).join('') : '');
          return t.indexOf('Perfil hemodinámico') > -1; }); })[0];
      pptOk = !!hoja;
      if (hoja) tienePng = (hoja._slideObjects || []).filter(function(o){ return o._type === 'image' || o.image; }).length === 1;
    }
    await CeiboStore.setLocal([]);

    return { extra: [
      // 1 - LOS CUATRO CUADRANTES, POR LOS DOS EJES
      ['IC 2.80 y PCP 8.7 cae en I (seco-caliente)',  r[0].perfil === 'I',   JSON.stringify(r[0])],
      ['IC 1.80 y PCP 26.7 cae en IV (humedo-frio)',  r[1].perfil === 'IV',  JSON.stringify(r[1])],
      ['IC 2.80 y PCP 26.7 cae en II (humedo-caliente)', r[2].perfil === 'II',  JSON.stringify(r[2])],
      ['IC 1.80 y PCP 8.7 cae en III (seco-frio)',    r[3].perfil === 'III', JSON.stringify(r[3])],

      // 2 - LO QUE NO SE PUEDE ESTIMAR NO SE DIBUJA
      ['sin frecuencia cardiaca no hay IC', r[4].ic === null && r[4].pcp !== null, JSON.stringify(r[4])],
      ['sin E/e no hay PCP',                r[5].pcp === null && r[5].ic !== null, JSON.stringify(r[5])],
      ['y ninguno de los dos entra como punto', pts.length === 4, String(pts.length)],
      ['un estudio sin IC no aparece en el origen', sinIC.length === 0, JSON.stringify(sinIC)],

      // 3 - EL DIAGRAMA EN EL LABORATORIO
      ['el diagrama esta debajo de la torta de Forrester', debajo],
      ['el denominador del dashboard son los seis sembrados', denom === 6, String(denom)],
      ['dibuja un circulo por punto estimable', circ.length === 4, String(circ.length)],
      ['el tooltip trae paciente, fecha, IC, PCP y perfil',
        tip0.indexOf('IC 2.80') > -1 && tip0.indexOf('PCP 8.7') > -1 && tip0.indexOf('seco-caliente') > -1, tip0],
      /* El nombre del paciente entra al SVG: se escapa. Y el click NO va por onclick inline —el
         atributo se compila DESPUES de decodificar entidades, asi que ahi el escape no protege—
         sino por data-eid con listener delegado, que es la regla del donut de la CIA. */
      ['el nombre del paciente sale escapado en el marcado',
        svg.innerHTML.indexOf('&lt;b&gt;') > -1 && svg.querySelectorAll('b').length === 0,
        svg.innerHTML.indexOf('&lt;b&gt;') > -1 ? 'escapado' : 'CRUDO'],
      ['y el punto no lleva onclick inline', svg.innerHTML.indexOf('onclick') === -1],
      ['lleva data-eid para abrir el estudio', circ[0].getAttribute('data-eid') === 't157-1',
        String(circ[0].getAttribute('data-eid'))],

      // 4 - LOS CORTES SON LOS DE LA APP
      /* Si alguien mueve la linea a 18 sin mover el clasificador, esto se pone en rojo. */
      ['la divisoria de congestion es la que aplica la app', UMBRAL_PCP_HUMEDO === 15, String(UMBRAL_PCP_HUMEDO)],
      ['y la de hipoperfusion tambien', FORR_IC_CORTE === 2.2, String(FORR_IC_CORTE)],
      ['los rotulos salen de _LAB_FORR_LBL y no de una copia',
        svg.innerHTML.indexOf('seco-caliente') > -1 && svg.innerHTML.indexOf('húmedo-frío') > -1],

      // 5 - MODO DIA/NOCHE
      ['el fondo del diagrama cambia con el tema', !!fondo1 && !!fondo2 && fondo1 !== fondo2,
        fondo1 + ' vs ' + fondo2],

      // 6 - ESTADO VACIO
      ['sin estudios estimables el diagrama igual dibuja sus cuadrantes',
        vacio.indexOf('seco-caliente') > -1 && vacio.indexOf('<circle') === -1,
        String(vacio.length)],
      ['y lo dice', vacio.indexOf('Sin estudios con IC y PCP estimables') > -1],

      // 7 - LA DIAPOSITIVA
      ['la hoja de hemodinamica se genera', pptOk],
      ['y lleva el diagrama incrustado como imagen', tienePng]
    ] };
  })();
`);

/* TC-156 - Las tres diapositivas que faltaban: contractilidad, amiloidosis y hemodinamica.
   OJO CON LA SONDA, que fallo dos veces antes de acusar al codigo:
   · el texto del informe vive DENTRO de `campos` —guardarInforme barre textarea[id]— y es de ahi
     que leen _labContrPoblacion y _labHallazgosCuenta. En el nivel superior del estudio, difusa y
     disquinesia dan 0;
   · los ids de segmento son basal_anterior / mid_anterior / apical_lateral, no basal_ant: un id
     inventado no falla, calla, y el bull's eye sale todo gris.
   · y el Forrester necesita onda_e + e_sep + e_lat, porque la PCP es la de Nagueh. Sin eso todo
     cae en "No clasificado" y parece que el seam no anda. */
caso('TC-156', 'PPT Lab: contractilidad con su bulls eye, amiloidosis y hemodinamica', `
  return (async function(){
    /* ESPERA A QUE CARGUE, como TC-131 con SheetJS. El bundle de pptxgenjs son 477 KB y es el
       ultimo de los seis scripts externos: sin esta espera el caso da rojo intermitente por el
       ENTORNO —medido, la libreria si estaba a los 6 s— y eso es peor que no tener el caso,
       porque se deja de creerle al rojo. Si igual no llega, falla con el motivo escrito. */
    for (let _i = 0; _i < 80 && typeof PptxGenJS === 'undefined'; _i++) await new Promise(function(r){ setTimeout(r, 100); });
    if (typeof PptxGenJS === 'undefined') {
      return { extra: [['PptxGenJS cargo por CDN', false, 'la libreria no llego']] };
    }
    const mk = function(i, c){
      const base = { fevi:String(30+i*4), edad:String(50+i), sexo: i%2?'F':'M', talla:'170',
                     peso:'75', diam_tsvi:'20', itv_tsvi:'20',
                     en_suma: c._suma || '', informe_texto: c._inf || '' };
      Object.keys(c).forEach(function(k){ base[k] = c[k]; });
      return { id:500+i, estudioId:'t156-'+i, fecha_estudio:'2026-0'+((i%4)+1)+'-1'+(i%9), campos: base };
    };
    const coh = [
      mk(1,{'alg-ett-score':'9','ett-sparkling':'si',hemo_fc:'70',hemo_pam:'85',onda_e:'70',e_sep:'9',e_lat:'11'}),
      mk(2,{'alg-ett-score':'6','ett-sparkling':'no',hemo_fc:'95',hemo_pam:'70',onda_e:'110',e_sep:'5',e_lat:'6'}),
      mk(3,{'alg-ett-score':'3',hemo_fc:'60',hemo_pam:'95',onda_e:'60',e_sep:'10',e_lat:'12'}),
      mk(4,{'alg-ett-score':'8','ett-sparkling':'si',hemo_fc:'110',hemo_pam:'60',onda_e:'120',e_sep:'4',e_lat:'5'}),
      mk(5,{hemo_fc:'80',hemo_pam:'90',contractilidad:JSON.stringify({basal_anterior:1,mid_anterior:2,apex:1}),
            _suma:'Hipocontractilidad difusa del ventriculo izquierdo.'}),
      mk(6,{contractilidad:JSON.stringify({basal_inferior:3}), _inf:'Disquinesia septal aislada.'}),
      mk(7,{_suma:'Sin trastornos de la motilidad segmentaria.'}),
      mk(8,{'alg-ett-score':'7',contractilidad:JSON.stringify({mid_inferolateral:1})})
    ];
    const cp = _labContrPoblacion(coh), am = _labAmilResumen(coh), hm = _labHemoResumen(coh);

    const oD = window._pptxDescargarSaneado, oT = window.toast;
    /* Los rotulos de una torta viven en el CHART, no en los objetos de texto de la diapositiva:
       buscarlos en el innerText de la hoja da vacio y el caso acusa al generador. Se intercepta
       en la FRONTERA DE LA API, que es la tecnica que ya usa TC-150. */
    const oAdd = PptxGenJS.prototype.addSlide;
    let charts = [];
    PptxGenJS.prototype.addSlide = function(){
      const sl = oAdd.apply(this, arguments), oc = sl.addChart;
      sl.addChart = function(tipo, datos, op){ charts.push({ datos: datos, op: op || {} }); return oc.apply(this, arguments); };
      return sl;
    };
    let capt = null, toasts = [];
    window._pptxDescargarSaneado = function(P){ capt = P; return Promise.resolve({saneado:true, quitadas:0}); };
    window.toast = function(m){ toasts.push(String(m)); };
    const textoDe = function(sl){ return (sl._slideObjects || []).map(function(o){
      if (typeof o.text === 'string') return o.text;
      if (Array.isArray(o.text)) return o.text.map(function(x){ return x && x.text ? x.text : ''; }).join('');
      return ''; }).filter(function(x){ return x && x.trim(); }); };
    const run = async function(cl){
      try { localStorage.setItem('ecosmart_lab_ppt_chk', JSON.stringify(cl.reduce(function(a,k){ a[k]=true; return a; }, {}))); } catch (e) {}
      capt = null; toasts.length = 0; charts = [];
      await _labPPTGenerar(coh, { presentador:'X', institucion:'Y', fecha:'2026-09-20', tema:'azul' });
      const sl = capt ? (capt.slides || []) : [];
      return { tit: sl.map(function(x){ const t = textoDe(x); return t.length ? t[0] : '(vacia)'; }),
               txt: sl.map(function(x){ return textoDe(x).join(' | '); }),
               img: sl.map(function(x){ return (x._slideObjects || []).filter(function(o){ return o._type === 'image' || o.image; }).length; }),
               toast: toasts.join(' '), charts: charts.slice() };
    };
    const c1 = await run(['contractilidad']);
    const c2 = await run(['amiloidosis']);
    const c3 = await run(['hemo']);
    const c4 = await run(['contractilidad','amiloidosis','hemo']);
    const iMeto = c4.tit.indexOf('Metodología y límites');
    const meto  = iMeto > -1 ? c4.txt[iMeto] : '';
    window._pptxDescargarSaneado = oD; window.toast = oT; PptxGenJS.prototype.addSlide = oAdd;
    try { localStorage.removeItem('ecosmart_lab_ppt_chk'); } catch (e) {}
    const g = _labPptAssertGrupos();
    const iContr = c1.tit.indexOf('Contractilidad segmentaria');

    return { extra: [
      // 1 - CADA TARJETA PRODUCE SU DIAPOSITIVA
      ['solo contractilidad da su diapositiva', iContr > -1, c1.tit.join(' · ')],
      ['solo amiloidosis da la suya', c2.tit.indexOf('Amiloidosis — score ecocardiográfico') > -1, c2.tit.join(' · ')],
      ['solo hemodinamica da la suya', c3.tit.indexOf('Perfil hemodinámico') > -1, c3.tit.join(' · ')],
      ['y ninguna arrastra a las otras dos',
        c1.tit.indexOf('Perfil hemodinámico') === -1 && c2.tit.indexOf('Contractilidad segmentaria') === -1,
        c1.tit.join(' · ') + ' // ' + c2.tit.join(' · ')],
      ['las tres juntas dan seis diapositivas', c4.tit.length === 6, c4.tit.join(' · ')],

      // 2 - LAS OMISIONES DESAPARECIERON
      /* Con las tres tildadas y con datos, la metodologia NO puede seguir diciendo que se
         omitieron: era la declaracion de que todavia no tenian hoja. */
      ['la metodologia ya no declara omisiones', meto.indexOf('NO se incluy') === -1, meto.slice(-170)],
      ['ni el toast', c4.toast.indexOf('Se omitieron') === -1, c4.toast.slice(0, 150)],

      // 3 - EL BULLS EYE VA COMO IMAGEN
      /* addImage de PptxGenJS 3.12 no acepta SVG: va como PNG por _svgToPng, que es el mismo
         camino que el PDF de auditoria ya usa para ESTA diana. */
      ['la diapositiva de contractilidad lleva la diana incrustada',
        iContr > -1 && c1.img[iContr] === 1, JSON.stringify(c1.img)],

      // 4 - LOS NUMEROS SON LOS DEL SEAM
      ['contractilidad cuenta los tres con segmentos', cp.conTrast === 3, String(cp.conTrast)],
      ['y separa difusa de disquinesia', cp.difusa === 1 && cp.disqSep === 1, cp.difusa + '/' + cp.disqSep],
      ['los 17 segmentos estan en pctById', Object.keys(cp.pctById).length === 17, String(Object.keys(cp.pctById).length)],
      ['amiloidosis cuenta los cinco con score', am.n === 5, String(am.n)],
      /* El sparkling se cuenta sobre los EVALUADOS: su select arranca en «— no evaluado —» y
         contar el vacio como ausencia bajaria el porcentaje de presentes en silencio. */
      ['y el sparkling va sobre los evaluados, no sobre todos',
        am.sparkEval === 3 && am.spark === 2, am.spark + ' de ' + am.sparkEval],
      /* LO QUE DISTINGUE «lee el seam» DE «recalcula»: la torta tiene que llevar, valor por
         valor, lo que devuelve _labAmilResumen. Que la diapositiva exista no prueba nada. */
      ['la torta lleva los MISMOS valores que el seam',
        (function(){
          const ch = c2.charts[0];
          if (!ch || !ch.datos || !ch.datos.length) return false;
          const lbls = [].concat.apply([], ch.datos[0].labels).map(String);
          const vals = ch.datos[0].values;
          const claves = Object.keys(am.cat);
          if (lbls.length !== claves.length) return false;
          return lbls.every(function(l, k){ return am.cat[l] === vals[k]; });
        })(),
        c2.charts[0] ? JSON.stringify([c2.charts[0].datos[0].labels, c2.charts[0].datos[0].values, am.cat]) : 'sin chart'],
      ['hemodinamica reparte el Forrester', hm.forr['II — húmedo-caliente'] === 2, JSON.stringify(hm.forr)],
      ['con FC y PAM promedio', hm.fc && hm.fc.v === 83 && hm.pam && hm.pam.v === 80,
        JSON.stringify([hm.fc, hm.pam])],

      // 5 - EL MAPEO DE FORRESTER ES EL CLASICO
      /* El pedido traia I humedo-caliente / II humedo-frio / III seco-caliente / IV seco-frio,
         que rota las cuatro: rotularia «I» al congestivo y «IV» al seco-frio. El I es el perfil
         NORMAL. Si alguien lo cambia, esto se pone en rojo. */
      ['el I es seco-caliente y el IV humedo-frio',
        _LAB_FORR_LBL.I.indexOf('seco-caliente') > -1 && _LAB_FORR_LBL.IV.indexOf('húmedo-frío') > -1,
        JSON.stringify(_LAB_FORR_LBL)],
      /* La condicion es el HECHO, no la palabra: que la hoja declare que esto no reemplaza la
         medicion invasiva y con que corte separa humedo de seco. Pinar «ESTIMADA» en mayusculas
         bloqueaba una reescritura legitima de la nota sin que el dato hubiera dejado de ser
         cierto — es la correccion que ya se le hizo a TC-123 y a TC-132. */
      ['la diapositiva declara que no reemplaza la medicion invasiva',
        c3.txt.join(' ').indexOf('no equivalen a medición invasiva') > -1, (c3.txt[1] || '').slice(-200)],
      ['y nombra la divisoria de congestion que aplica',
        c3.txt.join(' ').indexOf('PCP > 15') > -1, (c3.txt[1] || '').slice(-200)],

      // 6 - EL REGISTRO SIGUE COMPLETO
      ['los grupos siguen cubriendo las 53 tarjetas',
        g.enDom === 53 && g.enGrupo === 53 && !g.sinGrupo.length && !g.dobles.length,
        g.enDom + '/' + g.enGrupo]
    ] };
  })();
`);

/* TC-155 - El mazo se arma con las CASILLAS, no con el modal (2026-09-16).
   El modal quedo con presentador, institucion, fecha y paleta; el contenido lo deciden las
   casillas de las tarjetas. La condicion que vale NO es "salen N diapositivas" sino que el
   conjunto de TITULOS siga a lo tildado: un generador que ignorara las casillas y sacara todo
   igual daria un numero plausible en cualquier corrida. */
caso('TC-155', 'PPT Lab: las casillas deciden el mazo, y lo que no tiene hoja se declara', `
  return (async function(){
    /* ESPERA A QUE CARGUE, como TC-131 con SheetJS. El bundle de pptxgenjs son 477 KB y es el
       ultimo de los seis scripts externos: sin esta espera el caso da rojo intermitente por el
       ENTORNO —medido, la libreria si estaba a los 6 s— y eso es peor que no tener el caso,
       porque se deja de creerle al rojo. Si igual no llega, falla con el motivo escrito. */
    for (let _i = 0; _i < 80 && typeof PptxGenJS === 'undefined'; _i++) await new Promise(function(r){ setTimeout(r, 100); });
    if (typeof PptxGenJS === 'undefined') {
      return { extra: [['PptxGenJS cargo por CDN', false, 'la libreria no llego']] };
    }
    const infs = [];
    for (let i = 0; i < 14; i++) {
      infs.push({ id:i, estudioId:'t155-'+i, fecha_estudio:'2026-0'+(1+(i%4))+'-1'+(i%9), campos:{
        fevi:String(25+i*4), psap_calc:String(22+i*4), onda_e:String(70+i*2), e_prima_sept:String(11-i*0.4),
        tapse:String(13+i), edad:String(45+i*2), sexo: i%2?'F':'M', peso:'80', talla:'180',
        vol_ai:String(50+i*3), im_grado:String(1+(i%4)),
        'ete-es-ete__chk': i<5 ? '1':'0',
        ete_tavi_gmedio: i<3 ? String(10+i):'', ete_tavi_pro_tipo: i<3 ? 'balon':'', ete_tavi_jet_horas: i<3 ? String(3+i):'',
        wilkins_movilidad: i<4?'2':'', wilkins_engrosamiento: i<4?'2':'', wilkins_calcificacion: i<4?'2':'', wilkins_subvalvular: i<4?'2':'',
        eis_lesion_base: i<4?'civ':'', eis_clase_nyha: i<4?'iii':'',
        en_suma:(i%3===0?'Disfuncion diastolica grado II, pseudonormal. ':'Patron restrictivo (grado III). ')+
                (i%2===0?'Hipertrofia ventricular izquierda concentrica.':'Remodelado concentrico del ventriculo izquierdo.') } });
    }
    const origD = window._pptxDescargarSaneado, origT = window.toast;
    let capt = null, toasts = [];
    window._pptxDescargarSaneado = function(P){ capt = P; return Promise.resolve({saneado:true, quitadas:0}); };
    window.toast = function(m){ toasts.push(String(m)); };
    const titulos = function(){
      return (capt ? (capt.slides || []) : []).map(function(sl){
        const t = (sl._slideObjects || []).map(function(o){
          if (typeof o.text === 'string') return o.text;
          if (Array.isArray(o.text)) return o.text.map(function(x){ return x && x.text ? x.text : ''; }).join('');
          return '';
        }).filter(function(x){ return x && x.trim(); });
        return t.length ? t[0] : '(vacia)';
      });
    };
    const corrida = async function(claves){
      try { localStorage.setItem('ecosmart_lab_ppt_chk', JSON.stringify(claves.reduce(function(a,k){ a[k]=true; return a; }, {}))); } catch (e) {}
      capt = null; toasts.length = 0;
      await _labPPTGenerar(infs, { presentador:'X', institucion:'Y', fecha:'2026-09-20', tema:'azul' });
      return { tit: titulos(), toast: toasts.join(' ') };
    };
    const soloTavi = await corrida(['tavi']);
    const tres     = await corrida(['tavi','eisenmenger','funcion']);
    const nada     = await corrida([]);
    /* LA OMISION SE DECLARA CON SU MOTIVO. Hasta el commit anterior el disparador era «este grupo
       todavia no tiene diapositiva»; amiloidosis y contractilidad ya la tienen, asi que ahora se
       ejerce por FALTA DE DATOS, que es el otro disparador y el que queda vivo: la cohorte de
       este caso no tiene ningun estudio marcado como ETE. El mecanismo es el mismo y la leccion
       tambien —el medico tildo la tarjeta y tiene derecho a saber por que no salio—. Se tilda
       amiloidosis, que en esta cohorte no tiene un solo score ETT cargado; con TAVI no servia,
       porque aca SI hay estudios marcados como ETE y la hoja se genera. */
    const pend    = await corrida(['amiloidosis']);
    const meto    = pend.tit.indexOf('Metodología y límites');
    const txtMeto = meto > -1 ? (capt.slides[meto]._slideObjects || []).map(function(o){
      if (typeof o.text === 'string') return o.text;
      if (Array.isArray(o.text)) return o.text.map(function(x){ return x && x.text ? x.text : ''; }).join('');
      return '';
    }).join(' | ') : '';

    /* LA COMPUERTA DE "NINGUNA TILDADA" vive en labPPTEstadistico, ANTES del modal. Hay que
       SEMBRAR EL STORE: con la base vacia sale por la compuerta del periodo y el caso no prueba
       la suya. Ya me paso midiendo esto a mano. */
    const antes = getInformes();
    await CeiboStore.setLocal(infs.map(function(x, k){
      return { id:600+k, estudioId:'t155b-'+k, uuid:'u155-'+k, nombre:'P'+k, ci:'C'+k,
               fecha_estudio:x.fecha_estudio, fecha_guardado:'2026-04-01T09:00:00',
               informe_texto:'', en_suma:'', campos:x.campos };
    }));
    const selP = document.getElementById('lab-periodo'); if (selP) selP.value = '0';
    if (typeof labCohorteLimpiar === 'function') { try { labCohorteLimpiar(true); } catch (e) {} }
    let abrio = 0;
    const origModal = window._labPPTModal;
    window._labPPTModal = function(){ abrio++; };
    try { localStorage.setItem('ecosmart_lab_ppt_chk', '{}'); } catch (e) {}
    toasts.length = 0;
    labPPTEstadistico();
    const toastVacio = toasts.join(' '), abrioSinNada = abrio;
    try { localStorage.setItem('ecosmart_lab_ppt_chk', JSON.stringify({ tavi:true })); } catch (e) {}
    labPPTEstadistico();
    const abrioConUna = abrio - abrioSinNada;
    window._labPPTModal = origModal;
    window._pptxDescargarSaneado = origD; window.toast = origT;
    await CeiboStore.setLocal(antes);
    try { localStorage.removeItem('ecosmart_lab_ppt_chk'); } catch (e) {}

    const g = _labPptAssertGrupos();
    const tieneTit = function(r, t){ return r.tit.indexOf(t) > -1; };

    return { extra: [
      // 1 - EL REGISTRO NO SE PUDRE
      ['toda tarjeta con casilla tiene diapositiva', g.sinGrupo.length === 0, g.sinGrupo.join(',')],
      ['ningun grupo nombra una tarjeta que no existe', g.sinTarjeta.length === 0, g.sinTarjeta.join(',')],
      ['y ninguna tarjeta esta en dos grupos', g.dobles.length === 0, g.dobles.join(',')],
      ['las 53 con casilla estan agrupadas', g.enDom === 53 && g.enGrupo === 53, g.enDom + '/' + g.enGrupo],

      // 2 - LAS CASILLAS DECIDEN
      ['solo TAVI da cuatro diapositivas', soloTavi.tit.length === 4, soloTavi.tit.join(' · ')],
      ['y son portada + ETE + metodologia + cierre',
        tieneTit(soloTavi,'Ecocardiograma transesofágico') && tieneTit(soloTavi,'Metodología y límites') &&
        tieneTit(soloTavi,'¿Preguntas?'), soloTavi.tit.join(' · ')],
      /* Lo que separa "las casillas mandan" de "sale todo igual": con solo TAVI NO puede haber
         ninguna hoja de los otros grupos. */
      ['y NO sale nada de los grupos que no se tildaron',
        !tieneTit(soloTavi,'Función sistólica') && !tieneTit(soloTavi,'Valvulopatías') &&
        !tieneTit(soloTavi,'Cardiopatías congénitas') && !tieneTit(soloTavi,'Perfil demográfico'),
        soloTavi.tit.join(' · ')],
      ['tres grupos dan sus tres temas', tieneTit(tres,'Ecocardiograma transesofágico') &&
        tieneTit(tres,'Función sistólica') && tieneTit(tres,'Cardiopatías congénitas'), tres.tit.join(' · ')],

      // 3 - LAS FIJAS SIEMPRE
      ['portada, metodologia y cierre estan aun sin tildar nada',
        nada.tit.length === 3 && tieneTit(nada,'Metodología y límites') && tieneTit(nada,'¿Preguntas?'),
        nada.tit.join(' · ')],

      // 4 - LO QUE NO TIENE HOJA SE DECLARA
      ['un grupo tildado sin datos se omite con su motivo',
        txtMeto.indexOf('Amiloidosis') > -1 && txtMeto.indexOf('NO se incluy') > -1, txtMeto.slice(-260)],
      /* Y el motivo nombra el DATO que falta, no un generico: sin eso el medico no sabe si
         corregir el filtro o cargar el campo. */
      ['y el motivo nombra el dato que falta',
        txtMeto.indexOf('score ETT') > -1, txtMeto.slice(-200)],
      ['y el toast tambien lo dice', pend.toast.indexOf('Se omitieron') > -1, pend.toast.slice(0, 170)],

      // 5 - LA COMPUERTA DE NINGUNA TILDADA
      ['sin ninguna tildada NO se abre el modal', abrioSinNada === 0, String(abrioSinNada)],
      ['y el mensaje dice donde esta el control',
        toastVacio.indexOf('al menos una tarjeta') > -1 && toastVacio.indexOf('PPT') > -1, toastVacio.slice(0, 180)],
      ['con una tildada si se abre', abrioConUna === 1, String(abrioConUna)]
    ] };
  })();
`);

/* TC-154 - Los seams de la subtab ETE (2026-09-16). TAVI, Wilkins, orejuela y TEER se calculaban
   INLINE dentro de labEteRender, asi que el PPT no tenia como leerlos sin escribir una segunda
   copia: dos superficies contando la misma cohorte con dos implementaciones es el defecto de los
   denominadores que este archivo ya pago tres veces.
   LA CONDICION QUE VALE ES QUE EL RENDER LOS CONSUMA. Que el seam devuelva el numero correcto no
   prueba nada por si solo: si el render siguiera calculando por su cuenta, el seam seria una
   tercera copia y el caso pasaria igual. Por eso cada bloque compara el seam contra lo que HAY
   PINTADO en la pantalla. */
caso('TC-154', 'Subtab ETE: los cuatro seams existen y el dashboard los consume', `
  return (async function(){
    const mk = function(i, c){
      const base = { 'ete-es-ete__chk':'1', fevi:String(30+i*5), edad:String(50+i), sexo:'F' };
      Object.keys(c).forEach(function(k){ base[k] = c[k]; });
      return { id:700+i, estudioId:'t154-'+i, uuid:'u154-'+i, nombre:'E'+i, ci:'C'+i,
               fecha_estudio:'2026-03-0'+((i%9)+1), fecha_guardado:'2026-04-01T09:00:00',
               informe_texto:'', en_suma:'', campos: base };
    };
    const coh = [
      mk(1, { ete_tavi_gmedio:'12', ete_tavi_vmax:'2.4', ete_tavi_ava:'1.6', ete_tavi_pro_tipo:'balon',
              ete_tavi_ext_circ:'35', ete_tavi_jet_horas:'3,3,9' }),
      mk(2, { ete_tavi_gmedio:'8', ete_tavi_pro_tipo:'auto', ete_tavi_ext_circ:'15', ete_tavi_jet_horas:'6' }),
      mk(3, { wilkins_movilidad:'2', wilkins_engrosamiento:'2', wilkins_calcificacion:'1', wilkins_subvalvular:'2' }),
      mk(4, { wilkins_movilidad:'4', wilkins_engrosamiento:'4', wilkins_calcificacion:'3', wilkins_subvalvular:'4' }),
      /* Score PARCIAL: tres criterios. No se interpreta y se cuenta aparte. */
      mk(5, { wilkins_movilidad:'3', wilkins_engrosamiento:'3', wilkins_calcificacion:'3' }),
      mk(6, { oai_morfologia:'ala', oai_trombo:'si', oai_vel_vac:'25', oai_ostium_diam:'21' }),
      mk(7, { oai_morfologia:'cactus', oai_trombo:'no', oai_vel_vac:'45' }),
      /* Con alguna medida y el select SIN contestar: entra al n de orejuela y NO al denominador
         del trombo. Contarlo como negativo bajaria el porcentaje de positivos en silencio. */
      mk(8, { oai_ostium_diam:'19' }),
      mk(9, { teer_tipo_im:'primaria', teer_lva:'22', teer_area_mitral:'4.5', teer_ancho_flail:'12', teer_pasp:'55' }),
      mk(10,{ teer_tipo_im:'secundaria', teer_gap:'12', teer_prof_flail:'11', teer_pasp:'80', teer_fevi:'18', teer_dtsvi:'75' })
    ];
    const tavi = _labTaviResumen(coh.filter(_labUsaTavi));
    const wilk = _labWilkinsResumen(coh);
    const oai  = _labOaiResumen(coh.filter(_labUsaOai));
    const teer = _labTeerResumen(coh.filter(_labUsaTeer));

    /* EL RENDER TIENE QUE CONSUMIRLOS: se siembra la cohorte, se pinta la subtab y se compara
       contra lo que quedo en pantalla. Si labEteRender volviera a calcular por su cuenta, esta
       mitad se pone en rojo aunque los seams sigan bien. */
    await CeiboStore.setLocal(coh);
    const btn = [].slice.call(document.querySelectorAll('[onclick*="showTab"]'))
      .filter(function(b){ return (b.getAttribute('onclick') || '').indexOf("'lab'") > -1; })[0];
    if (btn) btn.click();
    await new Promise(function(r){ setTimeout(r, 400); });
    /* EL CASO FIJA SU PROPIO DENOMINADOR. Corriendo con --solo pasaba y dentro del suite los cinco
       bloques salian vacios: un caso anterior deja el selector de periodo en otra ventana y la
       cohorte sembrada queda fuera. Un contenedor vacio se lee igual que "este periodo no tiene
       TEER", asi que sin esto el caso mide sobre cero y acusa a la extraccion. Se pone "todo el
       tiempo", se limpia la cohorte de filtros, y se COMPRUEBA que el denominador quedo en 10
       antes de mirar una sola cifra. */
    const selP = document.getElementById('lab-periodo');
    if (selP) { selP.value = '0'; }
    if (typeof labCohorteLimpiar === 'function') { try { labCohorteLimpiar(true); } catch (e) {} }
    labInit();
    await new Promise(function(r){ setTimeout(r, 1500); });
    const denom = (typeof labGetInformes === 'function') ? labGetInformes().length : -1;
    const txt = function(id){ const e = document.getElementById(id); return e ? (e.textContent || '') : ''; };
    const pantTavi = txt('lab-tavi-stats'), pantWilk = txt('lab-ete-wilkins-stats'),
          pantOai = txt('lab-ete-oai-stats'), pantTeer = txt('lab-ete-teer-stats'),
          pantJet = txt('lab-ete-jet-bars');
    await CeiboStore.setLocal([]);

    return { extra: [
      // 1 - LOS CUATRO SEAMS SON ALCANZABLES
      ['los cuatro seams del ETE estan a nivel de modulo',
        typeof _labTaviResumen === 'function' && typeof _labWilkinsResumen === 'function' &&
        typeof _labOaiResumen === 'function' && typeof _labTeerResumen === 'function'],
      ['y tambien los predicados de pertenencia',
        typeof _labUsaOai === 'function' && typeof _labUsaWilkins === 'function' &&
        typeof _labUsaTeer === 'function' && Array.isArray(_LAB_TEER_CRIT)],

      /* Sin esta condicion, los cinco bloques de pantalla midiendo sobre cero pasarian como
         "no hay datos" en vez de como un caso que no probo nada. */
      ['el denominador del dashboard son los 10 estudios sembrados', denom === 10, String(denom)],

      // 2 - TAVI
      ['TAVI cuenta los dos estudios', tavi.n === 2, String(tavi.n)],
      /* _promPos devuelve {v, n}, no un numero: el promedio viene con su denominador para que
         ninguna superficie publique una media sin decir sobre cuantos esta. */
      ['y el gradiente medio viene con su n', tavi.gm !== null && Math.abs(tavi.gm.v - 10) < 0.01 && tavi.gm.n === 2,
        JSON.stringify(tavi.gm)],
      ['el tipo de protesis se cuenta por clave', tavi.pro.balon === 1 && tavi.pro.auto === 1, JSON.stringify(tavi.pro)],
      /* Un estudio con tres jets no vale por tres, y el "3,3" duplicado se deduplica. */
      ['el jet se deduplica por estudio', tavi.nJet === 2 && tavi.horas[3] === 1 && tavi.horas[9] === 1,
        'nJet=' + tavi.nJet + ' horas=' + JSON.stringify(tavi.horas)],
      ['y el dashboard publica ESE gradiente', pantTavi.indexOf('10.0 mmHg') > -1, pantTavi.slice(0, 160)],
      ['y ESAS horas de jet', pantJet.indexOf('3 h (n=1)') > -1 && pantJet.indexOf('9 h (n=1)') > -1, pantJet.slice(0, 120)],

      // 3 - WILKINS
      ['Wilkins interpreta solo los completos', wilk.n === 2, String(wilk.n)],
      ['y cuenta aparte el parcial', wilk.parciales === 1, String(wilk.parciales)],
      ['las bandas son las de calcWilkins, no las de la literatura',
        wilk.opt === 1 && wilk.bor === 0 && wilk.no === 1, wilk.opt + '/' + wilk.bor + '/' + wilk.no],
      ['el promedio de Wilkins tambien viene con su n',
        wilk.prom !== null && Math.abs(wilk.prom.v - 11) < 0.01 && wilk.prom.n === 2, JSON.stringify(wilk.prom)],
      ['y el dashboard publica ESE promedio y ESE excluido',
        pantWilk.indexOf('11.0 / 16') > -1 && pantWilk.indexOf('Excluidos por incompletos') > -1,
        pantWilk.slice(0, 200)],

      // 4 - OREJUELA
      ['la orejuela cuenta los tres con alguna medida', oai.n === 3, String(oai.n)],
      ['pero el denominador del trombo son los EVALUADOS', oai.evaluados === 2, String(oai.evaluados)],
      ['con un positivo', oai.positivos === 1 && oai.sospecha === 0, oai.positivos + '/' + oai.sospecha],
      ['y el dashboard publica ese denominador, no el otro',
        pantOai.indexOf('1 de 2') > -1, pantOai.slice(0, 220)],

      // 5 - TEER
      ['TEER cuenta los dos con criterios', teer.n === 2, String(teer.n)],
      ['el de dos fallos sale NO APTO', teer.noApto === 1, String(teer.noApto)],
      ['el tipo de IM se cuenta por clave', teer.im.primaria === 1 && teer.im.secundaria === 1, JSON.stringify(teer.im)],
      ['y el dashboard publica ESE veredicto',
        pantTeer.indexOf('Estudios con evaluaci') > -1 && pantTeer.indexOf('de 2') > -1, pantTeer.slice(0, 220)]
    ] };
  })();
`);

/* TC-153 - La casilla PPT de cada tarjeta del Laboratorio, y la tarjeta de SGL (2026-09-16).
   La clave vive en el atributo `data-ppt` de la tarjeta, no en una lista aparte ni derivada del
   rotulo: derivarla del texto del header ataria una clave funcional a una cadena que se renombra,
   y un renombre perderia la preferencia guardada EN SILENCIO.
   La condicion que vale NO es "hay 53 casillas" sino que NINGUNA tarjeta quede sin declarar: una
   tarjeta nueva sin data-ppt no da error, da una tarjeta MUDA que jamas puede entrar al mazo y se
   ve igual que una bien declarada. */
caso('TC-153', 'Laboratorio: casilla PPT en cada tarjeta, persistida, y SGL sin graduar', `
  const btnLab = [].slice.call(document.querySelectorAll('[onclick*="showTab"]'))
    .filter(function(b){ return (b.getAttribute('onclick') || '').indexOf("'lab'") > -1; })[0];
  if (btnLab) btnLab.click();
  /* La inyeccion cuelga de DOMContentLoaded, asi que con --solo el caso puede medir ANTES de que
     haya corrido: la primera corrida de una mutacion dio rojo en tres condiciones que no tenian
     nada que ver, y la segunda en una sola. Es la misma carrera que costo el sello de version.
     Llamarla aca es idempotente -tiene guarda por casilla ya presente- y de paso la ejercita. */
  _labPptChkInyectar();

  const cards = [].slice.call(document.querySelectorAll('#tab-lab .lab-card'));
  const conClave = cards.filter(function(c){ return c.getAttribute('data-ppt'); });
  const exceptuadas = cards.filter(function(c){ return !c.getAttribute('data-ppt') && c.getAttribute('data-ppt-no'); });
  const mudas = cards.filter(function(c){ return !c.getAttribute('data-ppt') && !c.getAttribute('data-ppt-no'); });
  const claves = conClave.map(function(c){ return c.getAttribute('data-ppt'); });
  const dup = claves.filter(function(k, i){ return claves.indexOf(k) !== i; });

  /* La casilla NO lleva id, y no es un descuido: guardarInforme barre input[id] de TODO el
     documento, asi que una casilla con id se persistiria en campos de CADA estudio como
     <id>__chk, viajaria al Excel y la contaria detectar_huerfanos. Es la misma regla que los
     paneles de referencia de Marfan/Fontan. */
  const inputs = [].slice.call(document.querySelectorAll('#tab-lab .lab-ppt-chk input'));
  const conId = inputs.filter(function(e){ return e.id; });

  /* PERSISTENCIA: se escribe por el camino real y se relee por el camino real. */
  try { localStorage.removeItem('ecosmart_lab_ppt_chk'); } catch (e) {}
  const limpio = _labPptChkMarcadas();
  labPptChkToggle('tavi', true);
  labPptChkToggle('sgl', true);
  const trasMarcar = _labPptChkMarcadas().slice().sort();
  const enDisco = localStorage.getItem('ecosmart_lab_ppt_chk') || '';
  labPptChkToggle('tavi', false);
  const trasDesmarcar = _labPptChkMarcadas().slice().sort();
  /* Una clave guardada que ya no tiene tarjeta NO revive: es el mismo filtro que
     _labExpLeerPref aplica a los modulos del Excel. Sin el, el generador la consulta con un if
     que ya no existe. */
  try { localStorage.setItem('ecosmart_lab_ppt_chk', JSON.stringify({ sgl:true, tarjeta_borrada:true })); } catch (e) {}
  const conFantasma = _labPptChkMarcadas().slice().sort();
  try { localStorage.removeItem('ecosmart_lab_ppt_chk'); } catch (e) {}

  /* SGL: el seam, con el cero y el vacio fuera y el alias adentro. */
  const est = function(i, c){ return { id:800+i, estudioId:'t153-'+i, campos:c }; };
  const coh = [est(1,{sgl:'-18.4'}), est(2,{sgl:'-12.1'}), est(3,{gls_global:'-21.0'}),
               est(4,{sgl:'-9.5'}), est(5,{sgl:'0'}), est(6,{sgl:''}),
               est(7,{sgl:'-15.0'}), est(8,{sgl:'-18.0'})];
  const r = _labSglResumen(coh);
  const vacio = _labSglResumen([]);
  const sumaBins = r.dist.reduce(function(a, b){ return a + b.n; }, 0);
  const tSgl = document.querySelector('#tab-lab .lab-card[data-ppt="sgl"]');
  const txtSgl = tSgl ? (tSgl.textContent || '') : '';

  return { extra: [
    // 1 - NINGUNA TARJETA MUDA
    ['ninguna tarjeta del Laboratorio queda sin declarar',
      mudas.length === 0, mudas.map(function(c){ var h=c.querySelector('.lab-card-hdr'); return h?(h.textContent||'').trim().slice(0,30):'?'; }).join(' // ')],
    ['y las claves no se repiten', dup.length === 0, dup.join(',')],
    ['las dos exceptuadas declaran su motivo',
      exceptuadas.length === 2 && exceptuadas.every(function(c){ return (c.getAttribute('data-ppt-no') || '').length > 10; }),
      exceptuadas.map(function(c){ return c.getAttribute('data-ppt-no'); }).join(' // ')],
    ['y son las de la subtab Informe, que son los exportadores',
      exceptuadas.every(function(c){ return c.closest('#lab-sub-informe') !== null; }),
      String(exceptuadas.length)],

    // 2 - LA CASILLA
    ['cada tarjeta con clave tiene su casilla',
      conClave.every(function(c){ return !!c.querySelector('.lab-ppt-chk'); }),
      conClave.filter(function(c){ return !c.querySelector('.lab-ppt-chk'); })
        .map(function(c){ return c.getAttribute('data-ppt'); }).join(',')],
    ['y las exceptuadas NO la tienen',
      exceptuadas.every(function(c){ return !c.querySelector('.lab-ppt-chk'); })],
    ['ninguna casilla lleva id, para no persistirse en campos de cada estudio',
      conId.length === 0, conId.map(function(e){ return e.id; }).join(',')],
    ['la casilla reacciona a change y no a click, que la inflaria a 44x44 por la regla tactil',
      inputs.length > 0 && inputs.every(function(e){ return !e.getAttribute('onclick'); })],

    // 3 - PERSISTENCIA
    ['arranca DESMARCADA, al reves que el patron de InfectSmart', limpio.length === 0, String(limpio.length)],
    ['marcar dos deja esas dos', trasMarcar.join(',') === 'sgl,tavi', trasMarcar.join(',')],
    ['y quedan en localStorage', enDisco.indexOf('tavi') > -1 && enDisco.indexOf('sgl') > -1, enDisco],
    ['desmarcar una deja la otra', trasDesmarcar.join(',') === 'sgl', trasDesmarcar.join(',')],
    ['una clave guardada sin tarjeta no revive',
      conFantasma.join(',') === 'sgl', conFantasma.join(',')],

    // 4 - SGL
    ['la tarjeta de SGL existe en Mediciones',
      !!tSgl && tSgl.closest('#lab-sub-mediciones') !== null],
    ['el seam ignora el cero y el vacio, y resuelve el alias gls_global',
      r.n === 6, String(r.n)],
    ['el promedio es el de |SGL|', Math.abs(r.prom - 15.6666667) < 0.001, String(r.prom)],
    ['la mediana promedia los dos centrales', r.mediana === 16.5, String(r.mediana)],
    ['el rango sale de los extremos', r.min === 9.5 && r.max === 21, r.min + ' - ' + r.max],
    /* Los bins tienen que sumar el n: si un valor cae fuera de todos, la distribucion publica
       menos casos que el promedio y nada lo dice. */
    ['los intervalos suman exactamente el n', sumaBins === r.n, sumaBins + ' vs ' + r.n],
    ['sin datos devuelve n=0 y ninguna barra, no un cero medido',
      vacio.n === 0 && vacio.prom === null && vacio.dist.length === 0, JSON.stringify(vacio)],

    // 5 - NO SE GRADUA, Y LA TARJETA LO DICE
    /* Esta es la condicion que importa: la app borro la graduacion del SGL a proposito y su
       unico corte vivo es el 16 % del HFA-ICOS. Cuatro bandas de severidad serian la CUARTA
       escala del mismo dato. */
    ['ninguna etiqueta de la distribucion nombra una severidad',
      r.dist.every(function(d){ return !/normal|leve|moderad|severo|severa/i.test(d.lbl); }),
      r.dist.map(function(d){ return d.lbl; }).join(' | ')],
    ['y la tarjeta declara que NO es una graduacion',
      txtSgl.indexOf('No es una graduaci') > -1, txtSgl.slice(0, 40)],
    ['nombrando el unico umbral que la app si aplica',
      txtSgl.indexOf('16') > -1 && txtSgl.indexOf('HFA-ICOS') > -1, String(txtSgl.indexOf('HFA-ICOS'))]
  ] };
`);






/* SOPORTE (nuevo) + LAS INVARIANTES DE IMAGENES (que ya estaban y no tenian NINGUN caso).
   La parte de IndexedDB del pedido ya estaba implementada entera —toggle, tres calidades, barra
   de storage, borrado—, pero sin una sola prueba: un modulo que guarda dato clinico en disco y
   cuyo unico resguardo es «falla cerrado» merece que eso este fijado. Lo nuevo de este commit es
   la seccion de soporte. */
caso('TC-145', 'Soporte: cuatro mailto con la version sellada, y las invariantes del guardado de imagenes', `
  showTab('config'); try { cfgOnShow(); } catch(e) {}
  const links = [].slice.call(document.querySelectorAll('#cfg-soporte a'));
  const parse = function(a){ const u = new URL(a.href), sp = new URLSearchParams(u.search);
    return { to:u.pathname, asunto:sp.get('subject'), cuerpo:sp.get('body'), raw:a.getAttribute('href') }; };
  const P = links.map(parse);
  const DEST = ['errores@ceibomed.com','sugerencias@ceibomed.com','soporte@ceibomed.com','ideas@ceibomed.com'];
  const ASU  = ['Reporte de error','Sugerencia','Consulta','Solicitud de funcionalidad'];
  const ver  = soporteVersion();
  const todoDecodificado = P.map(function(x){ return decodeURIComponent(x.raw); }).join(' ');

  return { extra: [
    // 1 · LOS CUATRO BOTONES.
    ['son cuatro enlaces', links.length === 4, String(links.length)],
    ['a las cuatro direcciones, en orden',
      P.map(function(x){ return x.to; }).join(',') === DEST.join(','),
      P.map(function(x){ return x.to; }).join(',')],
    ['todos son mailto:', P.every(function(x){ return x.raw.indexOf('mailto:') === 0; }),
      P.map(function(x){ return x.raw.slice(0,12); }).join(' ')],

    // 2 · EL ASUNTO LLEVA LA VERSION SELLADA.
    ['el asunto lleva la version y el rotulo de cada uno',
      P.every(function(x, i){ return x.asunto === '[EcoSmart ' + ver + '] ' + ASU[i]; }),
      P.map(function(x){ return x.asunto; }).join(' | ')],
    ['y la version sale de ECO_BUILD, no de un literal',
      ver === 'v' + ECO_BUILD && ver.length > 5, ver + ' vs ' + ECO_BUILD],

    // 3 · LA CODIFICACION. Sin esto el cuerpo llega cortado y sin ningun error visible.
    /* Los cuerpos llevan saltos de linea —que en una URL van como %0A— y el asunto corchetes.
       Un & o un # sin codificar corta el resto de la URL. */
    ['los saltos de linea viajan codificados',
      P.every(function(x){ return x.raw.indexOf('%0A') > -1; }),
      P.map(function(x){ return x.raw.indexOf('%0A') > -1; }).join(',')],
    ['y los corchetes del asunto tambien',
      P.every(function(x){ return x.raw.indexOf('%5BEcoSmart') > -1; })],
    ['el cuerpo se decodifica con sus saltos intactos',
      P[0].cuerpo.indexOf('Pasos para reproducir:') > -1 &&
      P[0].cuerpo.indexOf(String.fromCharCode(10)) > -1, JSON.stringify(P[0].cuerpo.slice(0, 60))],
    ['cada cuerpo pide lo suyo',
      P[1].cuerpo.indexOf('Contexto clínico:') > -1 &&
      P[2].cuerpo.indexOf('Consulta:') > -1 &&
      P[3].cuerpo.indexOf('Funcionalidad solicitada:') > -1],

    // 4 · NINGUN DATO DE PACIENTE VIAJA. Es el limite de privacidad de esta seccion.
    ['no se adjunta ningun dato del paciente ni del almacenamiento',
      !/paciente|localStorage|\\bci\\b|documento:/i.test(todoDecodificado),
      todoDecodificado.slice(0, 80)],

    // 5 · INVARIANTES DEL GUARDADO DE IMAGENES — ya estaban, no tenian caso.
    ['el toggle existe y arranca APAGADO',
      !!document.getElementById('cfg-guardar-imagenes') && imgGuardadoActivo() === false],
    ['hay tres calidades y su rango ORDENA (la calidad solo puede bajar)',
      IMG_CAL.mini.rank < IMG_CAL.media.rank && IMG_CAL.media.rank < IMG_CAL.orig.rank,
      Object.keys(IMG_CAL).map(function(k){ return k + '=' + IMG_CAL[k].rank; }).join(' ')],
    ['la barra de almacenamiento existe y mide contra la cuota del origen',
      !!document.getElementById('ig-img-storage') && typeof imgStorageRender === 'function' &&
      !!(navigator.storage && navigator.storage.estimate)],
    ['el borrado es un boton explicito y va por recolector',
      typeof cfgBorrarTodasImagenes === 'function' && typeof imgRecolectarHuerfanas === 'function'],
    /* Falla CERRADO: sin IndexedDB no hay imagenes persistidas y la app sigue andando. Sin esta
       guarda, un navegador en modo privado tiraba al abrir. */
    ['CeiboImg distingue «no pude leer» de «no tiene»: null vs array',
      typeof CeiboImg === 'object' && typeof CeiboImg.leer === 'function' &&
      String(CeiboImg.leer).indexOf('null') > -1]
  ] };
`);

/* ORDEN DE LAS TABS AVANZADAS (2026-09-16).
   TC-123 NO cubre esto: busca los botones por showTab('id'), asi que es independiente del orden
   y pasaba igual antes y despues. Lo unico que cambia acá es la POSICION, y tres superficies la
   derivan: la fila de botones, el desplegable de movil (ecoAdvBuild recorre el DOM) y las
   casillas de Config (cfgRenderModulos dibuja en el orden de EE_MODULES, que NO se deriva del
   DOM y hay que mantener a mano).
   Lo que este caso protege es que reordenar no rompa lo que cuelga de las CLAVES: ids, data-mod
   y las preferencias de localStorage, que son por clave y no por posicion. */
caso('TC-144', 'Tabs avanzadas: el orden nuevo en las tres superficies, y las claves intactas', `
  const leer = function(sel){ return [].slice.call(document.querySelectorAll(sel)).map(function(b){
    const m = (b.getAttribute('onclick') || '').match(/showTab\\('([^']+)'\\)/);
    return { txt:(b.textContent||'').trim(), id:m?m[1]:null, mod:b.getAttribute('data-mod') }; }); };
  const f1 = leer('.tabs-special .tab-btn'), f2 = leer('.tabs-tools .tab-btn');
  const ORDEN_IDS = ['hemodinamica','pulmonar','ete','cardioOnco','amiloidosis','congenitas','congenitas2'];
  const ORDEN_TOOLS = ['calculadoras','fono','refs'];
  /* Las claves que NO pueden cambiar: son las de ett_modules en localStorage y las de data-mod. */
  const MOD = { hemodinamica:'hemodinamica', pulmonar:'pulmonar', ete:'ete', cardioOnco:'cardioOnco',
    amiloidosis:'amiloidosis', congenitas:'congenitas', congenitas2:'congenitas',
    calculadoras:'calculadoras', fono:'fono', refs:'refs' };

  /* Cada boton abre SU panel — lo que el reorden podria haber cruzado. */
  const noAbren = [];
  f1.concat(f2).forEach(function(x){ showTab(x.id);
    const p = document.getElementById('tab-' + x.id);
    if (!p || getComputedStyle(p).display === 'none') noAbren.push(x.id); });
  showTab('datos');

  try { ecoAdvBuild(); } catch(e) {}
  const sel = document.getElementById('ecoAdvSelect');
  const opts = sel ? [].slice.call(sel.options).slice(1).map(function(o){ return o.value; }) : [];

  /* PREFERENCIAS POR CLAVE, no por posicion: apagar un modulo tiene que seguir ocultando SU
     boton despues de moverlo de lugar. */
  const prevLS = localStorage.getItem('ett_modules');
  localStorage.setItem('ett_modules', JSON.stringify({ pulmonar:false }));
  applyViewMode();
  const btnPul = [].slice.call(document.querySelectorAll('.tabs-special .tab-btn'))
    .filter(function(b){ return b.getAttribute('data-mod') === 'pulmonar'; })[0];
  const ocultoPul = btnPul ? getComputedStyle(btnPul).display === 'none' : null;
  const btnHemo = [].slice.call(document.querySelectorAll('.tabs-special .tab-btn'))
    .filter(function(b){ return b.getAttribute('data-mod') === 'hemodinamica'; })[0];
  const visibleHemo = btnHemo ? getComputedStyle(btnHemo).display !== 'none' : null;
  if (prevLS === null) { try { localStorage.removeItem('ett_modules'); } catch(e){} }
  else { try { localStorage.setItem('ett_modules', prevLS); } catch(e){} }
  applyViewMode();

  return { extra: [
    // 1 · EL ORDEN, en las tres superficies.
    ['la fila de patologias esta en el orden nuevo',
      f1.map(function(x){ return x.id; }).join(',') === ORDEN_IDS.join(','),
      f1.map(function(x){ return x.id; }).join(',')],
    ['y la de herramientas no se movio',
      f2.map(function(x){ return x.id; }).join(',') === ORDEN_TOOLS.join(','),
      f2.map(function(x){ return x.id; }).join(',')],
    ['son diez botones', f1.length + f2.length === 10, String(f1.length + f2.length)],
    /* El desplegable de movil DERIVA del DOM, asi que sigue solo — pero es la unica via a las
       avanzadas por debajo de 768px y si dejara de seguirlo nadie lo notaria en escritorio. */
    ['el desplegable de movil sigue el mismo orden',
      opts.join(',') === ORDEN_IDS.concat(ORDEN_TOOLS).join(','), opts.join(',')],
    /* EE_MODULES no se deriva del DOM: es la copia a mano que ordena las casillas de Config. */
    ['las casillas de Config siguen el orden de los botones',
      EE_MODULES.map(function(m){ return m.key; }).join(',') ===
        ['hemodinamica','pulmonar','ete','cardioOnco','amiloidosis','congenitas','calculadoras','fono','refs'].join(','),
      EE_MODULES.map(function(m){ return m.key; }).join(',')],

    // 2 · LAS CLAVES NO SE TOCARON. Es lo que cuelga de localStorage y de showTab.
    ['ningun data-mod cambio',
      f1.concat(f2).every(function(x){ return MOD[x.id] === x.mod; }),
      f1.concat(f2).map(function(x){ return x.id + '=' + x.mod; }).join(' ')],
    ['las dos CC comparten data-mod: son UN modulo partido en dos',
      f1.filter(function(x){ return x.id.indexOf('congenitas') === 0; })
        .every(function(x){ return x.mod === 'congenitas'; })],
    ['cada boton abre su propio panel', noAbren.length === 0, noAbren.join(',')],

    // 3 · LAS PREFERENCIAS SON POR CLAVE, no por posicion.
    ['apagar un modulo sigue ocultando SU boton tras el reorden', ocultoPul === true],
    ['y no toca a los demas', visibleHemo === true]
  ] };
`);

/* S3 y S4 — XSS ALMACENADO, CERRADOS DESDE ANTES Y SIN COBERTURA HASTA HOY (2026-09-16).
   S3: en_suma iba a innerHTML sin escapar en la vista de un estudio guardado.
   S4: nombre y documento se interpolaban dentro del onclick de «Evolución», asi que un
       apostrofe en el nombre rompia la llamada y abria la puerta a inyectar codigo.
   Los dos estaban corregidos —escHtml en el detalle, y data-* + verEvolucionEl(this) en el
   boton— pero NADA lo verificaba: la unica prueba era un procedimiento manual en
   tests/regresion.json. Un arreglo sin caso es un arreglo que se puede deshacer sin que nadie
   se entere, y este ya volvio a aparecer en un informe de auditoria.

   OJO CON EL DENOMINADOR: si la lista no renderizo filas, contar scripts inyectados da cero y
   parece seguro. Por eso la primera condicion cuenta las filas. */
caso('TC-143', 'XSS almacenado: el nombre con apostrofe y el EN SUMA envenenado no ejecutan nada', `
  return (async () => {
    const PAY = '<img src=x onerror="window.__xssHit=(window.__xssHit||0)+1">';
    const NOM = 'O' + String.fromCharCode(39) + 'Brien & <script>alert(1)</script>';
    const CI  = '12' + String.fromCharCode(39) + '345-6';
    const SUMA = 'Conclusion con ' + PAY + ' y & y > literales.';
    window.__xssHit = 0;
    const alertOrig = window.alert; window.alert = function(){ window.__xssHit++; };
    const prev = CeiboStore.getLocal();
    const mk = function(id, f, fevi){ return { id:id, uuid:'u'+id, nombre:NOM, ci:CI, doc_tipo:'CI',
      fecha_estudio:f, fecha_guardado:f + 'T10:00:00Z', informe_texto:'t', en_suma:SUMA,
      campos:{ nombre:NOM, ci:CI, fevi:fevi, en_suma:SUMA } }; };
    /* Entra por escritura directa al store: validarInformeImportado rechaza esto, y la
       escritura directa es justamente el vector que queda abierto. */
    CeiboStore.setLocal([mk(999000000000101,'2026-01-10','55'), mk(999000000000102,'2026-06-10','40')]);
    renderInformesGuardados();
    const filas = document.querySelectorAll('.ig-item');
    const btn = document.querySelector('.ig-item [data-nombre]');
    const nomVis = (document.querySelector('.ig-item-nombre') || {}).textContent || '';
    const scriptsLista = document.querySelectorAll('.ig-item script').length;

    /* S4 · el handler NO puede llevar datos del paciente. */
    const onclickBtn = btn ? (btn.getAttribute('onclick') || '') : '';
    const dsNom = btn ? btn.dataset.nombre : null;
    let rompio = null;
    try { verEvolucionEl(btn); } catch (e) { rompio = e.message; }
    const modal = document.getElementById('modal-evolucion');
    const titulo = (document.getElementById('evol-nombre-titulo') || {}).textContent || '';
    const scriptsModal = modal ? modal.querySelectorAll('script').length : -1;
    const imgsModal = modal ? modal.querySelectorAll('img[onerror]').length : -1;
    /* Los on* del modal son SUYOS (cerrar, y los checkbox de metricas): ninguno puede llevar
       el nombre ni el documento. */
    const onsConDato = modal ? [].slice.call(modal.querySelectorAll('*')).filter(function(n){
      return [].slice.call(n.attributes).some(function(a){
        return /^on/i.test(a.name) && (a.value.indexOf('Brien') > -1 || a.value.indexOf('345') > -1); }); }).length : -1;
    if (modal) modal.style.display = 'none';

    /* S3 · el EN SUMA guardado al DOM. */
    verDetalleInforme(999000000000101);
    const det = document.getElementById('ig-detalle-contenido');
    const scriptsDet = det.querySelectorAll('script').length;
    const imgsDet = det.querySelectorAll('img[onerror]').length;
    const txtDet = det.textContent || '';

    CeiboStore.setLocal(prev); renderInformesGuardados();
    window.alert = alertOrig;
    const hits = window.__xssHit;

    return { extra: [
      // 0 · EL DENOMINADOR. Sin filas, todo lo de abajo cuenta cero y parece seguro.
      ['la lista renderizo las dos filas', filas.length === 2, 'filas=' + filas.length],
      ['y el boton de evolucion existe', !!btn],

      // S4 · nada del paciente dentro del handler.
      ['el onclick NO lleva el nombre ni el documento',
        onclickBtn.indexOf('Brien') === -1 && onclickBtn.indexOf('345') === -1 &&
        onclickBtn.indexOf('verEvolucionEl(this)') > -1, onclickBtn],
      ['el nombre viaja por data-* y vuelve INTACTO por dataset', dsNom === NOM, JSON.stringify(dsNom)],
      ['un apostrofe en el nombre NO rompe verEvolucion',
        rompio === null, 'error: ' + rompio],
      ['la evolucion abre y titula con el nombre literal',
        !!modal && titulo.indexOf('Brien') > -1 && titulo.indexOf('2 estudios') > -1, titulo],
      ['ningun on* del modal lleva datos del paciente', onsConDato === 0, 'con dato: ' + onsConDato],

      // S3 · el EN SUMA al DOM.
      ['el nombre se ve como TEXTO en la lista, no como marcado',
        nomVis.indexOf('<script>') > -1 && scriptsLista === 0,
        JSON.stringify(nomVis) + ' scripts=' + scriptsLista],
      ['el EN SUMA envenenado no inyecta nada en el detalle',
        scriptsDet === 0 && imgsDet === 0, 'script=' + scriptsDet + ' img=' + imgsDet],
      ['y el payload se lee como texto literal',
        txtDet.indexOf('<img src=x onerror=') > -1, txtDet.slice(0, 120)],
      ['los & y > se muestran bien, sin doble escape',
        txtDet.indexOf(' y & y > literales') > -1 && txtDet.indexOf('&amp;') === -1,
        txtDet.slice(0, 160)],

      // EL VEREDICTO.
      ['CERO ejecuciones de XSS en todo el recorrido', hits === 0, 'hits=' + hits]
    ] };
  })();
`);

/* REORDENAMIENTO DEL LABORATORIO (2026-09-16).
   Doce subtabs pasaron a OCHO: Calidad, Por medico y Comparar periodos se plegaron dentro de
   General, y Hemodinamica dentro de Avanzado. Mas el orden interno de Mediciones y Avanzado, el
   renombre de «Informe PDF» a «Informe», y la tabla resumen de valvulopatias con sus OCHO filas
   —posible recien ahora: et_grado, ip_grado y ep_grado ganaron modelo de datos esta misma
   sesion—. Lo que vigila este caso y que contar <div> no ve: que ningun panel quede huerfano,
   que el orden sea el pedido, y que los init de los bloques plegados sigan corriendo. */
caso('TC-142', 'Laboratorio: ocho subtabs, orden nuevo y la tabla de valvulopatias con sus ocho filas', `
  const subtabs = [].slice.call(document.querySelectorAll('#tab-lab .lab-subtab'))
    .map(function(b){ return (b.textContent || '').trim(); });
  const paneles = [].slice.call(document.querySelectorAll('#tab-lab .lab-subpanel'))
    .map(function(p){ return p.id.replace('lab-sub',''); });
  const hdr = function(id){ const p = document.getElementById('lab-sub-' + id);
    return p ? [].slice.call(p.querySelectorAll('.lab-card-hdr')).map(function(h){ return (h.textContent||'').trim(); }) : null; };
  const tieneEnOrden = function(arr, claves){
    let k = 0;
    for (let i = 0; i < arr.length && k < claves.length; i++) if (arr[i].indexOf(claves[k]) > -1) k++;
    return k === claves.length; };

  /* LA TABLA: ocho filas por cuatro columnas, con el MISMO _labValvCounts que el grafico. */
  const mk = function(o){ const c = { im_grado:'0', em_grado:'sin', ia_grado:'0', ea_grado:'sin',
    it_grado:'0', et_grado:'Sin estenosis', ip_grado:'Sin insuficiencia', ep_grado:'sin' };
    Object.keys(o).forEach(function(k){ c[k] = o[k]; }); return { campos:c }; };
  const infs = [mk({}), mk({ im_grado:'2' }), mk({ ip_grado:'Severa' }),
                mk({ ep_grado:'Moderada' }), mk({ et_grado:'Severa' })];
  labRenderExtras(infs, infs.length);
  const tab = document.getElementById('lab-valv-tabla');
  const filas = tab ? [].slice.call(tab.querySelectorAll('tbody tr')).map(function(tr){
    return [].slice.call(tr.children).map(function(td){ return (td.textContent || '').trim(); }); }) : [];
  const sigla = filas.map(function(f){ return f[0].split(' ')[0]; });
  const celda = function(sig, col){ for (let i = 0; i < filas.length; i++)
    if (filas[i][0].indexOf(sig) === 0) return filas[i][col]; return null; };
  /* La tabla tiene que ir ANTES de los graficos: es el dato del que salen. */
  const card = tab ? tab.closest('.lab-card') : null;
  const barras = card ? card.querySelector('#lab-valv-im') : null;
  const antesQueBarras = !!(tab && barras &&
    (tab.compareDocumentPosition(barras) & Node.DOCUMENT_POSITION_FOLLOWING));

  return { extra: [
    // 1 · OCHO subtabs y ningun panel huerfano.
    ['quedan ocho subtabs', subtabs.length === 8, subtabs.join(' · ')],
    ['y ocho paneles', paneles.length === 8, paneles.join(' · ')],
    ['los cuatro plegados ya no tienen panel propio',
      ['hemo','calidad','medicos','comparar'].every(function(k){
        return document.getElementById('lab-sub-' + k) === null; }),
      ['hemo','calidad','medicos','comparar'].filter(function(k){
        return document.getElementById('lab-sub-' + k) !== null; }).join(',')],
    ['ni boton',
      ['hemo','calidad','medicos','comparar'].every(function(k){
        return String(labSubTab).indexOf('') > -1 &&
          !document.querySelector('[onclick*="labSubTab(' + String.fromCharCode(39) + k + String.fromCharCode(39) + '"]'); })],
    ['la subtab se llama «Informe», no «Informe PDF»',
      subtabs.indexOf('Informe') > -1 && subtabs.join('').indexOf('Informe PDF') === -1,
      subtabs.join(' · ')],
    ['y General arranca activa',
      (document.querySelector('#tab-lab .lab-subtab.active') || {}).textContent.trim() === 'General'],

    // 2 · ORDEN de las tabs.
    ['el orden de las subtabs es el pedido',
      tieneEnOrden(subtabs, ['General','Mediciones','Avanzado','ETE','CC','Filtros','Informe','Asociaciones']),
      subtabs.join(' · ')],

    // 3 · CONTENIDO plegado, accesible.
    ['General contiene comparar periodos, calidad y por medico',
      tieneEnOrden(hdr('general'), ['Comparar Períodos','Calidad','Análisis por Médico']),
      hdr('general').join(' | ')],
    ['y el resumen ejecutivo sigue primero',
      hdr('general')[0].indexOf('Actividad del Laboratorio') > -1, hdr('general')[0]],
    ['Avanzado contiene el perfil hemodinamico, y va primero',
      hdr('avanzado')[0].indexOf('Perfil hemodinámico') > -1, hdr('avanzado').join(' | ')],
    ['con TEP / VD segundo',
      hdr('avanzado')[1].indexOf('TEP') > -1, hdr('avanzado')[1]],
    ['los init de los bloques plegados cuelgan de General',
      String(labSubTab).indexOf('labMedicoInit') > -1 &&
      String(labSubTab).indexOf('labCompararInit') > -1 &&
      String(labSubTab).indexOf('medicos') === -1],

    // 4 · ORDEN interno de Mediciones.
    ['Mediciones sigue el orden pedido',
      tieneEnOrden(hdr('mediciones'), ['Función sistólica','Contractilidad','Geometría VI',
        'Volumen AI','Función VD','Hipertensión pulmonar','Valvulopatías','Estadística']),
      hdr('mediciones').join(' | ')],

    // 5 · LA TABLA DE VALVULOPATIAS.
    ['tiene las ocho filas, en orden', sigla.join(',') === 'IM,EM,IA,EA,IT,ET,IP,EP', sigla.join(',')],
    ['y va ANTES de los graficos', antesQueBarras],
    ['el denominador es el total del periodo: no marcar cuenta como «Sin»',
      celda('EM', 1) === '5' && celda('IA', 1) === '5', celda('EM',1) + ' / ' + celda('IA',1)],
    ['cada hallazgo cae en su fila y su columna',
      celda('IM', 3) === '1' && celda('ET', 4) === '1' &&
      celda('IP', 4) === '1' && celda('EP', 3) === '1',
      'IMmod=' + celda('IM',3) + ' ETsev=' + celda('ET',4) + ' IPsev=' + celda('IP',4) + ' EPmod=' + celda('EP',3)],
    ['y los que no tienen el hallazgo quedan en «Sin»',
      celda('IM', 1) === '4' && celda('ET', 1) === '4', celda('IM',1) + ' / ' + celda('ET',1)],
    ['el pie declara el denominador',
      (tab.querySelector('div') || {}).textContent.indexOf('total de estudios del período (n=5)') > -1,
      (tab.querySelector('div') || {}).textContent]
  ] };
`);

/* ESTENOSIS TRICUSPIDEA COMPLETA (2026-09-16).
   La guia NO gradua la ET: es binaria, y basta UNO de los tres criterios —gradiente medio >= 5
   mmHg, THP >= 190 ms, area <= 1 cm²—. El area sale por continuidad y su numerador vive en OTRA
   pestana (tsvd_diametro y vti_tsvd son de tab-vd), con el diametro en MILIMETROS. */
caso('TC-141', 'ET completa: gradiente, THP y area por continuidad, los tres con el mismo peso', `
  const set = function(id, v){ const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles:true }));
    e.dispatchEvent(new Event('change', { bubbles:true })); return 1; };
  const esc = function(o){ __t.limpiar(); set('vd_bas','38');
    const faltan = Object.keys(o).filter(function(k){ return set(k, o[k]) !== 1; });
    const r = __t.informe();
    const li = r.inf.split(String.fromCharCode(10))
      .filter(function(l){ return l.indexOf('ET signif') > -1 || l.indexOf('stenosis tricusp') > -1 ||
                                  l.indexOf('criterios de ET') > -1; }).join(' // ');
    return { li: li, suma: r.suma, avt: __t.val('et_avt'), faltan: faltan }; };

  /* AREA: TSVD 25 mm + VTI-TSVD 12 cm + VTI diast 60 cm -> pi*(25/20)^2 = 4.909 cm², x12/60 = 0.98 */
  const AREA = { tsvd_diametro:'25', vti_tsvd:'12', et_vti_diast:'60' };
  const con = function(extra){ const o = {}; Object.keys(extra).forEach(function(k){ o[k]=extra[k]; }); return o; };

  const soloGm  = esc({ et_gmedio:'6' });
  const soloThp = esc({ et_thp:'200' });
  const soloAvt = esc(AREA);
  const losTres = esc({ et_gmedio:'6', et_thp:'200', tsvd_diametro:'25', vti_tsvd:'12', et_vti_diast:'60' });
  const sinCrit = esc({ et_gmedio:'3', et_thp:'180' });
  const nada    = esc({});
  const fuera   = esc({ et_thp:'4000' });
  /* LOS DOS LADOS DE CADA CORTE. Los operadores son >=, >= y <=. */
  const gm49 = esc({ et_gmedio:'4.9' }), gm50 = esc({ et_gmedio:'5' });
  const th189 = esc({ et_thp:'189' }),  th190 = esc({ et_thp:'190' });
  /* area justo en 1.00 y justo por encima: con TSVD 25 y VTI-TSVD 12, VTI diast 58.9 -> 1.00 */
  const a100 = esc({ tsvd_diametro:'25', vti_tsvd:'12', et_vti_diast:'58.9' });
  const a102 = esc({ tsvd_diametro:'25', vti_tsvd:'12', et_vti_diast:'57' });

  /* EL AREA DESAPARECE al borrar cualquiera de sus tres insumos. */
  __t.limpiar(); set('tsvd_diametro','25'); set('vti_tsvd','12'); set('et_vti_diast','60');
  const avtCon = __t.val('et_avt');
  set('et_vti_diast','');
  const avtSin = __t.val('et_avt');
  const estSin = etEstado().avt;
  __t.limpiar();

  return { extra: [
    ['ningun id del caso esta inventado',
      losTres.faltan.length === 0 && soloAvt.faltan.length === 0,
      losTres.faltan.concat(soloAvt.faltan).join(',')],

    // 1 · CADA CRITERIO SOLO ALCANZA. Ninguno manda sobre los otros.
    ['el gradiente solo publica ET significativa',
      soloGm.li.indexOf('Estenosis tricuspídea significativa (gradiente medio 6 mmHg') > -1 &&
      soloGm.suma.indexOf('ET significativa.') > -1, soloGm.li],
    ['el THP solo tambien',
      soloThp.li.indexOf('Estenosis tricuspídea significativa (THP 200 ms') > -1 &&
      soloThp.suma.indexOf('ET significativa.') > -1, soloThp.li],
    ['y el area sola tambien',
      soloAvt.li.indexOf('Estenosis tricuspídea significativa (área valvular 0.98 cm²') > -1 &&
      soloAvt.suma.indexOf('ET significativa.') > -1, soloAvt.li],

    // 2 · CON LOS TRES, LOS TRES ENTRE PARENTESIS y una sola cita.
    ['con los tres cargados salen los tres',
      losTres.li.indexOf('(gradiente medio 6 mmHg, THP 200 ms, área valvular 0.98 cm² — EAE/ASE 2009)') > -1,
      losTres.li],
    ['y no quedan dos parentesis seguidos', losTres.li.indexOf(') (') === -1, losTres.li],

    // 3 · CON DATOS Y SIN CRITERIOS se DECLARA, pero NO sube al EN SUMA.
    ['con datos y sin criterios se dice que no alcanzan',
      sinCrit.li.indexOf('Sin criterios de ET significativa con los datos disponibles') > -1 &&
      sinCrit.li.indexOf('gradiente medio 3 mmHg, THP 180 ms') > -1, sinCrit.li],
    ['y NO sube al EN SUMA', sinCrit.suma.indexOf('ET signif') === -1, sinCrit.suma],
    ['sin ningun dato, silencio',
      nada.li === '' && nada.suma.indexOf('ET') === -1, nada.li + ' // ' + nada.suma],

    // 4 · FUERA DE BANDA se declara y no vota.
    /* Se busca la forma AFIRMATIVA completa: «significativa» a secas esta dentro de «Sin
       criterios de ET significativa», que es justo la frase que esta condicion espera ver.
       Segunda vez en la sesion que una palabra corta choca con la frase que viene a verificar. */
    ['un THP de 4000 ms no vota y se nombra',
      fuera.li.indexOf('fuera de rango en THP tricuspídeo') > -1 &&
      fuera.li.indexOf('Estenosis tricuspídea significativa') === -1 &&
      fuera.suma.indexOf('ET significativa') === -1, fuera.li],

    // 5 · LOS DOS LADOS DE CADA CORTE.
    ['gradiente 4.9 no y 5.0 si',
      gm49.suma.indexOf('ET significativa') === -1 && gm50.suma.indexOf('ET significativa.') > -1,
      gm49.suma + ' | ' + gm50.suma],
    ['THP 189 no y 190 si',
      th189.suma.indexOf('ET significativa') === -1 && th190.suma.indexOf('ET significativa.') > -1,
      th189.suma + ' | ' + th190.suma],
    ['area 1.00 SI cumple (el operador es <=) y 1.03 no',
      a100.suma.indexOf('ET significativa.') > -1 && a102.suma.indexOf('ET significativa') === -1,
      a100.avt + ' -> ' + a100.suma + '  ||  ' + a102.avt + ' -> ' + a102.suma],

    // 6 · EL AREA: continuidad con el diametro en MILIMETROS, y desaparece sin sus insumos.
    ['el area se calcula con el patron de la mitral', avtCon === '0.98 cm²', avtCon],
    ['y al borrar el VTI diastolico desaparece',
      avtSin === '' && estSin === null, JSON.stringify(avtSin) + ' / ' + estSin],

    // 7 · EXCEL.
    ['las cuatro columnas salen en el export', (function(){
      const cols = Object.keys(_labExcelRow({ id:0, campos:{} }));
      return ['ET grad medio (mmHg)','ET THP (ms)','ET VTI diast (cm)','ET área (cm²)']
        .every(function(c){ return cols.indexOf(c) > -1; });
    })()],
    ['el area del Excel se RECALCULA y no lee el campo de pantalla', (function(){
      /* El campo readonly no se repinta al reabrir: leerlo publicaria el area del paciente
         anterior. Se le pasa un estudio con los insumos y SIN et_avt. */
      const row = _labExcelRow({ id:0, campos:{ tsvd_diametro:'25', vti_tsvd:'12', et_vti_diast:'60' } });
      return row['ET área (cm²)'] === 0.98;
    })(), JSON.stringify(_labExcelRow({ id:0, campos:{ tsvd_diametro:'25', vti_tsvd:'12', et_vti_diast:'60' } })['ET área (cm²)'])],
    ['y no se importa: es derivada', LAB_XLS_SOLO_EXPORT.has('et_avt')],
    ['los asserts del Excel pasan',
      _labXlsAssertListas().length === 0 && _labXlsAssertVocab().length === 0 &&
      _labXlsAssertBloques().length === 0,
      _labXlsAssertListas().concat(_labXlsAssertVocab()).concat(_labXlsAssertBloques()).join(' | ')]
  ] };
`);

/* MUDANZA DE LA VALVULA PULMONAR (2026-09-16, commit 2b).
   Los siete campos de medicion vivian en el acordeon «Doppler Pulmonar» de tab-doppler y la
   morfologia con sus etiologias en tab-valvulas: la valvula estaba PARTIDA entre dos pestanas.
   Hoy todo vive en el acordeon de Valvula Pulmonar, en dos solapas.
   Lo que este caso vigila, y que contar <div> NO detecta:
   · que cada campo este en la pestana Y en el panel que le toca;
   · que no quede ningun huerfano de pulmonar en tab-doppler;
   · que los calculos, la limpieza y el barrido de guardado sigan alcanzandolos — cambio el
     HTML de lugar, no los ids, y getElementById no sabe de pestanas. */
caso('TC-140', 'Valvula pulmonar: los siete campos se mudaron a tab-valvulas y quedaron en dos solapas', `
  return (async () => {
    const SIETE = ['vp_vmax','vp_gmax','ip_vmax','ip_vtd','ip_papd','ip_pmad_display','ip_grado'];
    /* Devuelve el objeto SIEMPRE, con nulos adentro: las condiciones de un caso se evaluan
       todas al construir el array, asi que un return null hacia que la siguiente reventara con
       «cannot read properties of null» ANTES de que se reportara «falta este id». Un id perdido
       en la mudanza tiene que leerse como condicion roja, no como excepcion. */
    const donde = function(id){ const e = document.getElementById(id);
      if (!e) return { existe:false, tab:null, pane:null };
      const t = e.closest('.tab-section'), p = e.closest('[id^=vp-pane-]');
      return { existe:true, tab: t ? t.id : null, pane: p ? p.id : null }; };
    const ubic = {}; SIETE.forEach(function(id){ ubic[id] = donde(id); });
    /* Las dos superficies que calcIP pinta viajan con las mediciones. */
    const spanM = donde('ip-papm-row'), spanD = donde('ip-papd-row');

    const dop = document.getElementById('tab-doppler');
    const restos = [].slice.call(dop.querySelectorAll('[id]')).map(function(x){ return x.id; })
      .filter(function(i){ return i.indexOf('vp_') === 0 || i.indexOf('ip_') === 0 ||
                                  i.indexOf('ip-pap') === 0 || i.indexOf('dop-pulmonar') === 0; });

    /* SOLAPAS: el acordeon se abre a mano porque display:none no invalida getComputedStyle de los
       hijos para esta comprobacion —se mide el estilo del pane, no su visibilidad efectiva—. */
    const acc = document.getElementById('ete-seccion-valv-pulmonar');
    const accPrev = acc.style.display; acc.style.display = 'block';
    const dsp = function(id){ return getComputedStyle(document.getElementById(id)).display; };
    vpTab('morf');
    const m1 = dsp('vp-pane-morf'), m2 = dsp('vp-pane-med');
    const mAct = document.getElementById('vp-tab-morf').classList.contains('active');
    vpTab('med');
    const d1 = dsp('vp-pane-morf'), d2 = dsp('vp-pane-med');
    const dAct = document.getElementById('vp-tab-med').classList.contains('active');

    /* LOS DATOS PERSISTEN AL CAMBIAR DE SOLAPA: los dos paneles estan siempre en el DOM y solo
       cambia su display, asi que nada se pierde. */
    __t.limpiar();
    __t.set('vp_vmax','4.5'); __t.set('ip_vmax','2.1'); __t.set('ip_grado','Moderada');
    vpTab('morf'); vpTab('med'); vpTab('morf');
    const tras = SIETE.map(function(i){ return __t.val(i); });
    const gmaxTrasSolapa = __t.val('vp_gmax'), epTrasSolapa = __t.val('ep_grado');

    /* CALCULOS desde la ubicacion nueva. */
    __t.limpiar();
    __t.set('vci_diam','18'); __t.set('vci_col','>50');
    __t.set('vp_vmax','4.5');
    const gmax = __t.val('vp_gmax'), epG = __t.val('ep_grado');
    __t.set('ip_vmax','2.1'); __t.set('ip_vtd','1.5');
    const pmad = __t.val('ip_pmad_display'), papd = __t.val('ip_papd');
    const papm = __t.txt('ip-papm-row');

    /* GUARDAR Y REABRIR: los siete tienen que volver. ip_grado se carga ACA y no antes: el
       bloque de arriba termina con un limpiar, y la primera version del caso daba rojo porque
       guardaba el grado vacio y despues exigia que volviera «Moderada» — el caso midiendo su
       propio descuido. */
    __t.set('ip_grado','Moderada');
    __t.set('nombre','Mudanza VP'); __t.set('ci','99887766');
    /* __t.guardar() devuelve una PROMESA con {ok, estudioId}: sin el await, reabrir
       recibia la promesa, no abria nada y los campos volvian vacios — el caso media sobre un
       formulario en blanco y culpaba a la mudanza. */
    const g = await __t.guardar();
    __t.nuevoEstudio();
    const vacios = SIETE.map(function(i){ return __t.val(i); });
    __t.reabrir(g.estudioId);
    const vueltos = SIETE.map(function(i){ return __t.val(i); });
    const ubicTrasReabrir = donde('vp_vmax');
    await __t.borrar(g.estudioId);
    acc.style.display = accPrev;
    __t.limpiar();

    return { extra: [
      // 1 · UBICACION. No alcanza con que existan: tienen que estar donde corresponde.
      ['los siete existen', SIETE.every(function(i){ return ubic[i].existe; }),
        'faltan: ' + SIETE.filter(function(i){ return !ubic[i].existe; }).join(',')],
      ['y los siete estan en tab-valvulas',
        SIETE.every(function(i){ return ubic[i].tab === 'tab-valvulas'; }),
        SIETE.map(function(i){ return i + '=' + ubic[i].tab; }).join(' ')],
      ['las seis mediciones en la solapa de mediciones',
        ['vp_vmax','vp_gmax','ip_vmax','ip_vtd','ip_papd','ip_pmad_display']
          .every(function(i){ return ubic[i].pane === 'vp-pane-med'; }),
        SIETE.map(function(i){ return i + '=' + ubic[i].pane; }).join(' ')],
      ['y el GRADO de la IP en la de morfologia y etiologias: es evaluacion, no medicion',
        ubic['ip_grado'].pane === 'vp-pane-morf', ubic['ip_grado'].pane],
      ['las dos filas de PAP viajaron con las mediciones',
        spanM.pane === 'vp-pane-med' && spanD.pane === 'vp-pane-med',
        spanM.pane + ' / ' + spanD.pane],

      // 2 · NINGUN HUERFANO EN LA PESTANA DE ORIGEN.
      ['tab-doppler no conserva ningun id de pulmonar', restos.length === 0, restos.join(', ')],
      ['y el acordeon «Doppler Pulmonar» ya no existe',
        document.getElementById('dop-pulmonar') === null],

      // 3 · LAS SOLAPAS.
      ['la solapa de morfologia muestra su panel y oculta el otro',
        m1 !== 'none' && m2 === 'none' && mAct === true, m1 + '/' + m2],
      ['y la de mediciones al reves',
        d1 === 'none' && d2 !== 'none' && dAct === true, d1 + '/' + d2],
      ['cambiar de solapa NO pierde los datos',
        tras[0] === '4.5' && tras[2] === '2.1' && tras[6] === 'Moderada', JSON.stringify(tras)],
      ['y tampoco lo derivado', gmaxTrasSolapa === '81' && epTrasSolapa === 'Severa',
        gmaxTrasSolapa + ' / ' + epTrasSolapa],

      // 4 · LOS CALCULOS ALCANZAN LA UBICACION NUEVA.
      ['calcVP deriva el gradiente y el grado desde la solapa de mediciones',
        gmax === '81' && epG === 'Severa', gmax + ' / ' + epG],
      ['calcIP calcula PmAD y PAP diastolica',
        pmad.indexOf('3') > -1 && papd.indexOf('mmHg') > -1 && papm.indexOf('mmHg') > -1,
        pmad + ' | ' + papd + ' | ' + papm],

      // 5 · LIMPIAR Y GUARDAR siguen alcanzandolos.
      ['limpiarCampos deja los siete vacios',
        vacios.every(function(v, k){ return v === '' || (SIETE[k] === 'ip_grado' && v === 'Sin insuficiencia'); }),
        JSON.stringify(vacios)],
      ['el guardado se persistio de verdad', g.ok === true],
      ['guardar y reabrir devuelve los siete',
        vueltos[0] === '4.5' && vueltos[2] === '2.1' && vueltos[3] === '1.5' && vueltos[6] === 'Moderada',
        JSON.stringify(vueltos)],
      ['y siguen en su pestana despues de reabrir',
        ubicTrasReabrir.tab === 'tab-valvulas' && ubicTrasReabrir.pane === 'vp-pane-med',
        JSON.stringify(ubicTrasReabrir)]
    ] };
  })();

`);

/* VALVULA PULMONAR: EP E IP SEPARADAS (2026-09-16).
   vp_morf era UN SOLO select que mezclaba morfologia, estenosis e insuficiencia — elegir
   «Insuficiencia leve» borraba la posibilidad de consignar estenosis y viceversa, mutuamente
   excluyentes por construccion cuando clinicamente coexisten. Hoy: morfologia en vp_morf,
   estenosis en ep_grado (+ nivel y etiologia), insuficiencia en ip_grado (+ etiologia).
   Lo que este caso vigila y no es obvio:
   · la MIGRACION, sin la cual un estudio viejo reabre con el select en blanco;
   · que las opciones 0 de las dos etiologias NO se impriman (valor de fabrica);
   · que al EN SUMA suba desde moderada, no desde leve;
   · que el importador acepte las seis columnas nuevas. */
caso('TC-139', 'Valvula pulmonar: morfologia, EP con nivel y etiologia, IP con etiologia, y la migracion', `
  const set = function(id, v){ const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('change', { bubbles:true })); return 1; };
  const esc = function(o){ __t.limpiar(); set('vd_bas','38');
    const faltan = Object.keys(o).filter(function(k){ return set(k, o[k]) !== 1; });
    const r = __t.informe();
    const li = r.inf.split(String.fromCharCode(10)).filter(function(l){ return l.indexOf('ulmonar') > -1; }).join(' // ');
    return { li: li, suma: r.suma, faltan: faltan }; };
  const mig = function(o){ _migrarCamposLegacy(o); return o; };
  const ops = function(id){ const e = document.getElementById(id);
    return e ? [].slice.call(e.options).map(function(o){ return o.value; }) : []; };

  const vacio   = esc({});
  const completo = esc({ vp_morf:'Carcinoide', ep_grado:'Severa', ep_nivel:'Valvular', ep_etiologia:'Carcinoide' });
  const ipMod   = esc({ ip_grado:'Moderada', ip_etiologia:'HTP (dilatación anular)' });
  const epLeve  = esc({ ep_grado:'Leve' });
  const ipLeve  = esc({ ip_grado:'Leve', ip_etiologia:'Fisiológica (traza)' });
  const epModSev = esc({ ep_grado:'Moderada-severa' });
  const soloMorf = esc({ vp_morf:'Displásica (congénita)' });
  const noEspec  = esc({ vp_morf:'No especificada' });
  __t.limpiar();

  /* AUTO-GRADO: escribe ep_grado, respeta lo manual, y NUNCA produce Moderada-severa. */
  const g = document.getElementById('ep_grado');
  const auto = function(vmax){ g.value = 'sin'; delete g.dataset.sugerido;
    set('vp_vmax', vmax); calcVP(); return g.value; };
  const a25 = auto('2.5'), a45 = auto('4.5');
  g.value = 'Moderada-severa'; set('vp_vmax','4.5'); calcVP();
  const manual = g.value;
  const capsula = (document.getElementById('vp-sev-badge').textContent || '');
  g.value = 'sin'; delete g.dataset.sugerido; set('vp_vmax',''); calcVP();
  __t.limpiar();

  /* VISIBILIDAD: nivel y etiologia solo con el grado consignado. */
  set('ep_grado','sin'); set('ip_grado','Sin insuficiencia'); vpSync();
  const ocultoEP = getComputedStyle(document.getElementById('bloque-ep-detalle')).display;
  const ocultoIP = getComputedStyle(document.getElementById('bloque-ip-detalle')).display;
  set('ep_grado','Severa'); set('ip_grado','Moderada'); vpSync();
  const visibleEP = getComputedStyle(document.getElementById('bloque-ep-detalle')).display;
  const visibleIP = getComputedStyle(document.getElementById('bloque-ip-detalle')).display;
  __t.limpiar();

  const iEP = _LAB_VALV_LABELS.indexOf('Esten. Pulmonar');
  const mk = function(ep){ return { campos:{ im_grado:'0', em_grado:'sin', ia_grado:'0',
    ea_grado:'sin', it_grado:'0', et_grado:'Sin estenosis', ep_grado: ep } }; };
  const vc = _labValvCounts([mk('sin'), mk('Leve'), mk('Moderada'), mk('Severa')]);

  return { extra: [
    ['ningun id del caso esta inventado',
      completo.faltan.length === 0 && ipMod.faltan.length === 0,
      completo.faltan.concat(ipMod.faltan).join(',')],

    // 1 · SIN DATOS: la salida no cambia respecto de antes del rediseno.
    ['sin nada sigue diciendo «Válvula pulmonar normal.»',
      vacio.li.indexOf('Válvula pulmonar normal.') > -1, vacio.li],
    ['y no aparece ninguna estenosis ni etiologia',
      vacio.li.indexOf('stenosis') === -1 && vacio.li.indexOf('etiología') === -1, vacio.li],

    // 2 · EL CASO COMPLETO: morfologia + grado + nivel + etiologia en UNA frase.
    ['morfologia, grado, nivel y etiologia salen juntos y sin repetir «Válvula pulmonar»',
      completo.li.indexOf('Válvula pulmonar con afectación carcinoide y estenosis severa a nivel valvular, de etiología Carcinoide.') > -1 &&
      completo.li.split('Válvula pulmonar').length - 1 === 1, completo.li],
    ['y la severa sube al EN SUMA con su nivel',
      completo.suma.indexOf('Estenosis pulmonar severa a nivel valvular.') > -1, completo.suma],

    // 3 · EL DEFAULT CONSTANTE: la opcion 0 de cada etiologia NO puede imprimirse.
    /* ep_etiologia arrancaba en «Congénita valvular» e ip_etiologia en «Fisiológica (traza)»:
       consignar un grado y no tocar el select publicaba una etiologia que nadie eligio. */
    ['la opcion 0 de las dos etiologias es «No especificada»',
      ops('ep_etiologia')[0] === 'No especificada' && ops('ip_etiologia')[0] === 'No especificada',
      ops('ep_etiologia')[0] + ' | ' + ops('ip_etiologia')[0]],
    ['y con el grado puesto y la etiologia sin tocar NO se imprime etiologia',
      epLeve.li.indexOf('con estenosis leve.') > -1 && epLeve.li.indexOf('etiología') === -1, epLeve.li],

    // 4 · IP con etiologia, y el acronimo intacto.
    ['IP moderada con su etiologia, en minuscula el grado y sin destrozar la sigla',
      ipMod.li.indexOf('Insuficiencia pulmonar moderada, de etiología HTP (dilatación anular)') > -1,
      ipMod.li],
    ['y sube al EN SUMA', ipMod.suma.indexOf('Insuficiencia pulmonar moderada.') > -1, ipMod.suma],

    // 5 · QUE SUBE Y QUE NO. Moderada o mas; la leve se describe y se calla.
    ['EP leve NO sube', epLeve.suma.indexOf('stenosis pulmonar') === -1, epLeve.suma],
    ['IP leve NO sube', ipLeve.suma.indexOf('nsuficiencia pulmonar') === -1, ipLeve.suma],
    ['EP moderada-severa SI sube',
      epModSev.suma.indexOf('Estenosis pulmonar moderada-severa.') > -1, epModSev.suma],
    ['pero ninguna de las dos leves queda NEGADA por el fallback',
      epLeve.suma.indexOf('Estudio sin alteraciones') === -1 &&
      ipLeve.suma.indexOf('Estudio sin alteraciones') === -1, epLeve.suma],

    // 6 · MORFOLOGIA SOLA, y «No especificada» que no afirma nada.
    ['una morfologia sola se nombra',
      soloMorf.li.indexOf('Válvula pulmonar de morfología displásica (congénita).') > -1, soloMorf.li],
    ['«No especificada» NO se nombra ni afirma normalidad',
      noEspec.li.indexOf('No especificada') === -1 && noEspec.li.indexOf('no especificada') === -1 &&
      noEspec.li.indexOf('Válvula pulmonar normal') === -1, noEspec.li],

    // 7 · AUTO-GRADO sobre ep_grado.
    ['el auto-grado escribe ep_grado, no vp_morf', a25 === 'Leve' && a45 === 'Severa', a25 + ' / ' + a45],
    ['no pisa una eleccion manual', manual === 'Moderada-severa', manual],
    ['y la capsula declara que Moderada-severa es manual',
      capsula.indexOf('«Moderada-severa» es elección manual') > -1, capsula.slice(-90)],

    // 8 · VISIBILIDAD condicional.
    ['nivel y etiologia ocultos sin grado', ocultoEP === 'none' && ocultoIP === 'none',
      ocultoEP + ' / ' + ocultoIP],
    ['y visibles con el grado puesto', visibleEP !== 'none' && visibleIP !== 'none',
      visibleEP + ' / ' + visibleIP],

    // 9 · MIGRACION. Sin esto el select reabre en BLANCO y el hueco se persiste al guardar.
    ['las cuatro estenosis migran a «No especificada» + su grado', (function(){
      const M = { 'Estenosis leve':'Leve', 'Estenosis moderada':'Moderada',
                  'Estenosis moderada/severa':'Moderada-severa', 'Estenosis severa':'Severa' };
      return Object.keys(M).every(function(k){ const o = mig({ vp_morf:k });
        return o.vp_morf === 'No especificada' && o.ep_grado === M[k]; });
    })()],
    ['la IP fisiologica migra a Normal + grado + etiologia', (function(){
      const o = mig({ vp_morf:'Insuficiencia leve (fisiológica)' });
      return o.vp_morf === 'Normal' && o.ip_grado === 'Leve' && o.ip_etiologia === 'Fisiológica (traza)';
    })()],
    /* Estas TRES no estaban en el pedido y sin ellas el select de IP reabre vacio. */
    ['los tres tokens viejos de ip_grado tambien migran', (function(){
      const M = { 'IP leve (fisiológica)':'Leve', 'IP moderada':'Moderada', 'IP severa':'Severa' };
      return Object.keys(M).every(function(k){ return mig({ ip_grado:k }).ip_grado === M[k]; });
    })()],
    ['y la migracion NO pisa un valor ya corregido a mano', (function(){
      const o = mig({ vp_morf:'Estenosis severa', ep_grado:'Leve' });
      return o.ep_grado === 'Leve';
    })()],

    // 10 · LABORATORIO Y EXCEL.
    ['la estenosis pulmonar es la septima valvula del Lab', iEP > -1 && vc.bases[iEP] === 4,
      'idx ' + iEP + ' base ' + (vc.bases[iEP])],
    ['y cuenta cada banda donde corresponde',
      vc.counts.Leve[iEP] === 1 && vc.counts.Moderada[iEP] === 1 && vc.counts.Severa[iEP] === 1],
    ['los asserts del Excel pasan: listas, bloques y vocabularios',
      _labXlsAssertListas().length === 0 && _labXlsAssertBloques().length === 0 &&
      _labXlsAssertVocab().length === 0,
      _labXlsAssertListas().concat(_labXlsAssertBloques()).join(' | ')],
    /* Si una opcion no esta en LAB_XLS_LISTAS, el importador descarta la FILA ENTERA. */
    ['el importador acepta las opciones nuevas', (function(){
      const P = [['vp_morf','Displásica (congénita)'], ['ep_grado','Moderada-severa'],
                 ['ep_nivel','Subvalvular (infundibular)'], ['ep_etiologia','Displasia valvular (Noonan)'],
                 ['ip_grado','Moderada'], ['ip_etiologia','HTP (dilatación anular)']];
      return P.every(function(p){ return _labXlsLista(p[0], p[1]) === p[1]; });
    })()],
    ['y las seis columnas salen en el export', (function(){
      const cols = Object.keys(_labExcelRow({ id:0, campos:{} }));
      return ['Morfología pulmonar','EP grado','EP nivel','EP etiología','IP grado','IP etiología']
        .every(function(c){ return cols.indexOf(c) > -1; });
    })()]
  ] };
`);

/* ETIOLOGIAS EN VM / VA / VT (2026-09-16).
   Tres cosas que este caso fija y que no son obvias:
   1 LAB_XLS_LISTAS es una copia A MANO de los option del select y es la que decide que acepta
     el importador. Una opcion que este en el select y no ahi se EXPORTA bien y al reimportar
     descarta la FILA ENTERA. Lo vigila _labXlsAssertListas().
   2 Endocarditis, Isquemica, Carcinoide y Funcional son ETIOLOGIAS, no morfologias: metidas en
     la plantilla vieja salia «de morfologia endocarditis». Las redacta VALV_MORF_ETIOL, y para
     toda opcion que no este en ese mapa la salida es la de antes PALABRA POR PALABRA.
   3 vt_morf NO llegaba al narrativo — vivia solo en la tabla del PDF y en el Excel. */
caso('TC-138', 'Etiologias valvulares: el importador las acepta, el informe las redacta y vt_morf deja de ser huerfano', `
  const set = function(id, v){ const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('change', { bubbles:true })); return 1; };
  const linea = function(campo, val, filtro){ __t.limpiar(); set('vd_bas','38');
    const ok = set(campo, val); const r = __t.informe();
    const li = r.inf.split(String.fromCharCode(10)).filter(function(l){ return l.indexOf(filtro) > -1; }).join(' // ');
    return { ok: ok, li: li, suma: r.suma }; };
  const opciones = function(id){ const s = document.getElementById(id);
    return s ? [].slice.call(s.options).map(function(o){ return o.value; }) : []; };

  const NUEVAS = [
    ['vm_morf','Endocarditis'], ['vm_morf','Isquémica (disfunción/rotura músculo papilar)'],
    ['va_morf','Endocarditis'], ['va_morf','Carcinoide'],
    ['vt_morf','Carcinoide'], ['vt_morf','Endocarditis'], ['vt_morf','Funcional / dilatación VD']
  ];
  const vmEndo = linea('vm_morf','Endocarditis','mitral');
  const vmIsq  = linea('vm_morf','Isquémica (disfunción/rotura músculo papilar)','mitral');
  const vmNorm = linea('vm_morf','Normal','mitral');
  const vaCarc = linea('va_morf','Carcinoide','aórtica');
  const vaEndo = linea('va_morf','Endocarditis','aórtica');
  const vaTri  = linea('va_morf','Trivalva normal','aórtica');
  const vtCarc = linea('vt_morf','Carcinoide','tricúspide');
  const vtEndo = linea('vt_morf','Endocarditis','tricúspide');
  const vtFunc = linea('vt_morf','Funcional / dilatación VD','tricúspide');
  const vtNorm = linea('vt_morf','Normal','tricúspide');
  /* LA LINEA DE LA TRICUSPIDE TIENE DOS RAMAS y los casos de arriba solo ejercen la de SIN
     insuficiencia — no cargan IT. Sin este escenario, borrar vtFrag entero (la rama CON IT) no
     ponia nada en rojo: la mutacion sobrevivia. Es la misma trampa que la rama con PSAP de la
     diastolica del VD. */
  __t.limpiar(); set('vd_bas','38'); set('vt_morf','Carcinoide');
  __t.set('vmax_it','2.8'); __t.set('vci_diam','18'); __t.set('vci_col','>50');
  const rIT = __t.informe();
  const vtCarcIT = rIT.inf.split(String.fromCharCode(10))
    .filter(function(l){ return l.indexOf('tricúspide') > -1; }).join(' // ');
  __t.limpiar();

  return { extra: [
    // 1 · EL IMPORTADOR. Si esto falla, un estudio con la morfologia nueva no vuelve del Excel.
    ['el assert de listas no encuentra divergencias', _labXlsAssertListas().length === 0,
      _labXlsAssertListas().join(' | ')],
    ['las siete opciones nuevas existen en su select',
      NUEVAS.every(function(p){ return opciones(p[0]).indexOf(p[1]) > -1; }),
      NUEVAS.filter(function(p){ return opciones(p[0]).indexOf(p[1]) === -1; }).join(' | ')],
    ['y el importador las acepta tal cual (si no, descarta la FILA entera)',
      NUEVAS.every(function(p){ return _labXlsLista(p[0], p[1]) === p[1]; }),
      NUEVAS.map(function(p){ return p[1] + '->' + _labXlsLista(p[0], p[1]); }).join(' | ')],
    ['ningun id del caso esta inventado',
      [vmEndo, vaCarc, vtCarc].every(function(r){ return r.ok === 1; })],

    // 2 · REDACCION. Las etiologias no entran en «de morfologia X».
    ['VM endocarditis se redacta como etiologia, no como morfologia',
      vmEndo.li.indexOf('Válvula mitral con endocarditis') > -1 &&
      vmEndo.li.indexOf('de morfología endocarditis') === -1, vmEndo.li],
    ['VM isquemica nombra el mecanismo',
      vmIsq.li.indexOf('compromiso isquémico (disfunción o rotura de músculo papilar)') > -1, vmIsq.li],
    ['VA carcinoide', vaCarc.li.indexOf('Válvula aórtica con afectación carcinoide') > -1, vaCarc.li],
    ['VA endocarditis', vaEndo.li.indexOf('Válvula aórtica con endocarditis') > -1, vaEndo.li],

    // 3 · LAS QUE YA ESTABAN NO CAMBIAN UNA PALABRA.
    ['VM normal sigue diciendo «de morfología normal»',
      vmNorm.li.indexOf('Válvula mitral de morfología normal, sin estenosis ni insuficiencia.') > -1, vmNorm.li],
    ['VA trivalva sigue igual',
      vaTri.li.indexOf('Válvula aórtica trivalva normal, sin estenosis ni insuficiencia.') > -1, vaTri.li],
    ['y la tricuspide sin morfologia consignada tampoco cambia',
      vtNorm.li.indexOf('Válvula tricúspide sin insuficiencia valorable. No es posible estimar PSAP.') > -1 &&
      vtNorm.li.indexOf('Válvula tricúspide,') === -1, vtNorm.li],

    // 4 · vt_morf DEJA DE SER HUERFANO. Antes vivia solo en la tabla del PDF y el Excel.
    ['VT carcinoide APARECE en el informe',
      vtCarc.li.indexOf('con afectación carcinoide') > -1, vtCarc.li],
    ['VT endocarditis tambien', vtEndo.li.indexOf('con endocarditis') > -1, vtEndo.li],
    ['y tambien en la rama CON insuficiencia tricuspidea (la otra mitad de la linea)',
      vtCarcIT.indexOf('Válvula tricúspide con afectación carcinoide.') > -1 &&
      vtCarcIT.indexOf('PSAP') > -1, vtCarcIT],
    ['y la morfologia se pliega: «Válvula tricúspide» no abre dos oraciones seguidas',
      vtCarc.li.indexOf('Válvula tricúspide con afectación carcinoide, sin insuficiencia valorable') > -1 &&
      vtCarc.li.split('Válvula tricúspide').length - 1 === 1, vtCarc.li],

    // 5 · LA CONTRADICCION QUE LA OPCION FUNCIONAL PODIA PRODUCIR.
    /* «Funcional / dilatacion VD» es el MECANISMO de una insuficiencia: sin IT cargada, la
       version ingenua imprimia «con insuficiencia funcional ... sin insuficiencia valorable»
       en la misma oracion. Se declara la inconsistencia en vez de publicar las dos mitades. */
    ['VT funcional sin IT NO se contradice',
      !(vtFunc.li.indexOf('con insuficiencia funcional') > -1 &&
        vtFunc.li.indexOf('sin insuficiencia valorable') > -1), vtFunc.li],
    ['y declara que falta el grado',
      vtFunc.li.indexOf('sin grado de insuficiencia cargado') > -1, vtFunc.li],

    // 6 · La morfologia NO sube al EN SUMA, por simetria con mitral y aortica.
    /* NO se empuja una linea nueva al resumen: la morfologia no se repite ahi. Ojo con el
       substring — «funcional» esta dentro de «funcionales» del propio fallback, asi que la
       primera version de esta condicion daba rojo contra la frase que venia a verificar. */
    ['la morfologia no se repite en el EN SUMA',
      [vmEndo, vaCarc, vtCarc, vtFunc].every(function(r){
        return r.suma.indexOf('carcinoide') === -1 && r.suma.indexOf('endocarditis') === -1 &&
               r.suma.indexOf('isquémico') === -1 && r.suma.indexOf('insuficiencia funcional') === -1; }),
      vmEndo.suma + ' // ' + vtCarc.suma],
    /* PERO TAMPOCO PUEDE QUEDAR NEGADA. El fallback decia «Estudio sin alteraciones» sobre una
       endocarditis descrita en el cuerpo. */
    ['y el EN SUMA ya no NIEGA la etiologia descrita en el cuerpo',
      [vmEndo, vmIsq, vaCarc, vaEndo, vtCarc, vtEndo].every(function(r){
        return r.suma.indexOf('Estudio sin alteraciones') === -1; }),
      vmEndo.suma],
    ['y remite al cuerpo en vez de callar',
      vmEndo.suma.indexOf('ver los hallazgos descritos en el cuerpo') > -1, vmEndo.suma],
    ['con morfologia normal el fallback sigue siendo el de siempre',
      vmNorm.suma.indexOf('Estudio sin alteraciones estructurales ni funcionales significativas.') > -1,
      vmNorm.suma]
  ] };
`);

/* LAS TRES SUPERFICIES DE CARDIO-ONCO TIENEN QUE DECIR LO MISMO. La leyenda de #ref-cardiotox
   (pestaña Referencias), la tabla de farmacos y las tablas nuevas del marco HFA-ICOS viven en
   DOS pestañas distintas y describen al mismo paciente. Las tres estaban desincronizadas, cada
   una a su modo, y las tres se corrigieron el 2026-09-15:
   · El SGL apuntaba al REVES: «disfuncion subclinica: <-16%» leido literal es «mas negativo que
     -16», o sea -20, que es un strain NORMAL. Un signo invertido en un umbral se lee igual de
     bien que el correcto, y por eso sobrevivio.
   · Habia TRES calendarios de eco para antraciclinas: «basal → 3m → 6m → anual», «c/ciclo si
     alto riesgo» y «cada 2 ciclos». Ahora los tres dicen lo mismo: alto → cada 2 ciclos, muy
     alto → cada ciclo, los dos con basal + al finalizar + 12 meses.
   · «Riesgo muy alto HFA-ICOS: FEVI <50%» contradecia a la tabla del marco, donde FEVI <50% son
     2 puntos y 2-3 puntos es ALTO. Confundia «marcador de alto riesgo» con «banda de riesgo
     global», que es lo que decide la frecuencia de control.
   Este caso mira las DOS pestañas en la misma corrida. Nada mas las ata: son prosa HTML. */
caso('TC-100', 'Cardio-onco: las dos pestañas de referencia dicen lo mismo', `
  const legenda = (document.getElementById('ref-cardiotox') || {}).textContent || '';
  const onco    = (document.getElementById('co-referencia-seccion') || {}).textContent || '';
  return { extra: [
    // 1 · El signo del SGL.
    ['la leyenda dice que el SGL deteriorado es MENOS negativo',
      legenda.indexOf('deteriorado: >-16%') > -1 && legenda.indexOf('menos negativo es peor') > -1],
    ['y ya no dice «<-16%», que apuntaba al reves',
      legenda.indexOf('subclínica: <-16%') === -1],
    ['la tabla del marco HFA-ICOS usa el mismo signo',
      onco.indexOf('GLS basal deteriorado (>-16%)') > -1],

    // 2 · Un solo calendario de eco para antraciclinas, en las tres superficies.
    ['la leyenda trae las dos bandas del calendario',
      legenda.indexOf('cada 2 ciclos') > -1 && legenda.indexOf('cada ciclo') > -1],
    ['y ya no la tercera agenda que no coincidia con ninguna',
      legenda.indexOf('3m → 6m → anual') === -1],
    /* Cadena EXACTA de la fila de la tabla de farmacos, distinta de la de la tabla por clase
       (una lleva «y», la otra coma). Asi cada condicion fija SU fila: con un indexOf generico de
       «cada 2 ciclos» la condicion pasaba por el texto de la otra tabla y no probaba nada. */
    ['la tabla de farmacos dice lo mismo',
      onco.indexOf('cada 2 ciclos si riesgo alto y cada ciclo si muy alto') > -1],
    ['y ya no dice «c/ciclo si alto riesgo»', onco.indexOf('c/ciclo si alto riesgo') === -1],
    ['la tabla por clase tambien reparte las dos bandas',
      onco.indexOf('cada 2 ciclos si riesgo alto, cada ciclo si muy alto') > -1],
    ['las tres coinciden en el resto del calendario',
      (onco.match(/12 meses/g) || []).length >= 2 && legenda.indexOf('12 meses') > -1],

    // 3 · Marcador de alto riesgo distinto de banda de riesgo global.
    ['la leyenda ya no llama «muy alto» a la FEVI <50% sola',
      legenda.indexOf('Riesgo muy alto HFA-ICOS:') === -1],
    ['dice que cada marcador vale 2 puntos y deja al paciente en ALTO',
      legenda.indexOf('2 puntos cada uno') > -1 && legenda.indexOf('riesgo alto (2-3 puntos)') > -1],
    ['y que el muy alto empieza en 4, igual que la tabla',
      legenda.indexOf('muy alto empieza en 4 puntos') > -1 && onco.indexOf('>=4 puntos') > -1],
    ['los dos puntajes de FEVI basal siguen siendo los de la tabla',
      onco.indexOf('FEVI basal 50-54%') > -1 && onco.indexOf('FEVI basal <50%') > -1]
  ] };
`);

/* LAS DOS TABLAS NUEVAS DE REFERENCIA RAPIDA (HFA-ICOS y cardiotoxicidad por clase). Son HTML
   estatico, sin campos ni calculo — pero este archivo ya pago DOS VECES el mismo defecto hoy:
   una tabla estatica que contradice al clasificador de al lado. Aca la contradiccion existe y es
   REAL: la calculadora de «Riesgo CV basal estimado» vive en ESTA MISMA pestaña y puntua con
   otra escala —cuenta PUNTOS, con items que valen 2, y rotula <=1 bajo / <=3 MODERADO / <=5 alto—
   mientras la tabla cuenta FACTORES y rotula 1 medio / 2-3 ALTO / >=4 muy alto. Para tres
   factores una dice «Alto» y la otra «MODERADO».
   No se alineo el codigo porque cambiar la calculadora mueve la clasificacion de pacientes
   reales y es decision de Maicol. Lo que SI se hizo es DECLARAR la discrepancia en la tabla.
   Este caso fija las dos mitades: que el aviso este, y que la discrepancia que describe siga
   siendo cierta. Si algun dia la calculadora se alinea con HFA-ICOS, el caso se pone en rojo y
   obliga a borrar el aviso en vez de dejarlo mintiendo al reves. */
caso('TC-99', 'Cardio-onco: las tablas de referencia no contradicen al clasificador de al lado', `
  const ref = (document.getElementById('co-referencia-seccion') || {}).textContent || '';
  // Tres factores de riesgo: para la tabla es «Alto», para la calculadora «MODERADO».
  return { extra: [
    ['la tabla HFA-ICOS esta presente',
      ref.indexOf('marco HFA-ICOS, ESC 2022') > -1 && ref.indexOf('Factores de riesgo del paciente') > -1],
    ['con sus tres secciones',
      ref.indexOf('Riesgo por farmaco') > -1 && ref.indexOf('Clasificacion de riesgo global') > -1],
    ['dice que se hace ANTES del tratamiento',
      ref.indexOf('ANTES') > -1 && ref.indexOf('iniciar el tratamiento') > -1],
    ['la tabla por clase farmacologica esta presente, con las diez filas',
      ['Antraciclinas','Anti-HER2','Inhibidores VEGF/VEGFR','ICI','Fluoropirimidinas',
       'Agentes alquilantes','Inhibidores BCR-ABL','Inhibidores del proteasoma',
       'Radioterapia toracica','Hormonoterapia'].every(k => ref.indexOf(k) > -1)],
    ['con la columna de seguimiento eco, que es la que se consulta',
      ref.indexOf('Eco a los 5 anos post-RT') > -1 &&
      ref.indexOf('Eco cada 3 meses durante el tto') > -1],
    ['y las dosis limite de las tres clases que la tienen',
      ref.indexOf('400 mg/m2') > -1 && ref.indexOf('140 mg/kg') > -1 && ref.indexOf('30-35 Gy') > -1],
    /* NINGUNA fila puede mandar SUSPENDER por un umbral que la tabla de grados de esta misma
       seccion resuelve como «Continuar». Reintroducir eso es literalmente el defecto que se
       cerro hoy en 7357c29, movido de columna: con un basal de 62 que cae a 48 el clasificador
       dice MODERADA y la tabla de arriba dice «Continuar con cardioproteccion», mientras dos
       filas nuevas decian «suspender». Lo encontro el differential-review del propio agregado. */
    ['ninguna fila nueva manda suspender por su cuenta',
      ref.indexOf('suspender y eco en 2-4 sem') === -1 &&
      ref.indexOf('suspender y reevaluar en 3-6 sem') === -1],
    /* CUATRO y no dos: la subtab «Monitoreo eco» es una COPIA de la columna de seguimiento de la
       subtab «Cardiotoxicidad», asi que las dos filas que remiten a la graduacion aparecen dos
       veces cada una. La duplicacion es deliberada —se consulta el seguimiento sin leer las otras
       seis columnas— pero es duplicacion: si alguna vez se edita el texto en un solo lado, este
       numero deja de dar y avisa. */
    ['las filas remiten a la subtab de grados, que es la que define la conducta',
      (ref.match(/graduar la CTRCD con la subtab «CTRCD» de esta seccion/g) || []).length === 4],
    ['y esa tabla sigue reservando «Suspender» para la severa',
      ref.indexOf('Suspender, cardioproteccion, reevaluar en 2-4 sem') > -1 &&
      ref.indexOf('Continuar con cardioproteccion y control en 4 sem') > -1],
    // Las cuatro mitades del aviso de escalas.
    ['el aviso de que las dos escalas NO coinciden esta',
      ref.indexOf('NO usan la misma escala') > -1],
    ['y que tampoco puntuan igual los mismos items',
      ref.indexOf('ni puntuan') > -1 && ref.indexOf('edad desde 65 inclusive') > -1],
    ['y que la tabla resuelve tambien por farmaco, no solo por factores',
      ref.indexOf('factores <u>o</u> por el farmaco') === -1 && ref.indexOf('por el farmaco') > -1],
    /* Este aviso ya cambio tres veces en el dia, y cada version describia un estado distinto de
       la app: primero decia que la tabla «no se imprime» (cierto entonces), despues que al
       informe bajaban DOS bandas (cierto mientras convivieron las dos calculadoras), y ahora que
       hay UNA sola. Un aviso que quedo describiendo el estado anterior es peor que no tenerlo. */
    ['el aviso declara que hay UNA sola banda en el informe',
      ref.indexOf('Una sola banda en el informe firmado') > -1],
    ['y ya no habla de dos emisores',
      ref.indexOf('bajan DOS bandas') === -1 && ref.indexOf('y no se imprime') === -1],
    ['ya NO promete que la tabla manda para decidir', ref.indexOf('manda esta tabla') === -1],
    ['la tabla pone 2-3 puntos en Alto', ref.indexOf('2-3 puntos') > -1],
    // ECOS-07: no prestarle a un marco la autoridad de un score unico validado.
    ['la tabla se presenta como MARCO, no como score unico',
      ref.indexOf('Marco</b>, no score unico') > -1 || ref.indexOf('no score unico') > -1],
    ['y declara que la app no recoge ocho de los doce factores',
      ref.indexOf('no tienen campo en este modulo') > -1]
  ] };
`);

/* ═══════════════════════════════════════════════════════════════════════════════════════════
   GRUPO 26 — GUARDAR Y RESTAURAR. La brecha mas cara del suite: aca vivieron los bugs de datos
   del paciente anterior viajando al siguiente, los segmentos ETE que no volvian, la serie de
   cardio-onco que se perdia y la reimpresion que daba distinto que regenerar.

   Todos entran por las funciones REALES —guardarInforme con su card de severidades, y
   cargarEstudioPorId— y no por el store: lo que se prueba es el viaje completo. Cada caso BORRA
   lo que guardo (los casos tienen que ser independientes) y el guardado es asincrono, de ahi el
   patron `return (async () => { ... })()`.
   ═══════════════════════════════════════════════════════════════════════════════════════════ */

caso('TC-GR-01', 'Guardar y reabrir: los datos del paciente vuelven completos', `
  return (async () => {
    __t.limpiar();
    __t.set('nombre','Ana Maria Perez'); __t.set('ci','4.321.987-6');
    __t.set('edad','67'); __t.set('sexo','F');
    const g = await __t.guardar();
    __t.nuevoEstudio();
    const trasLimpiar = __t.val('nombre');
    __t.reabrir(g.estudioId);
    const leido = { nombre: __t.val('nombre'), ci: __t.val('ci'),
                    edad: __t.val('edad'), sexo: __t.val('sexo') };
    const ficha = getInformes().find(i => i.estudioId === g.estudioId) || {};
    await __t.borrar(g.estudioId);
    return { extra: [
      ['el guardado se persistio de verdad', g.ok === true && !!g.estudioId],
      ['«Nuevo estudio» dejo el formulario vacio', trasLimpiar === ''],
      ['el nombre vuelve',     leido.nombre === 'Ana Maria Perez'],
      ['el documento vuelve',  leido.ci === '4.321.987-6'],
      ['la edad vuelve',       leido.edad === '67'],
      ['el sexo vuelve',       leido.sexo === 'F'],
      ['la ficha del store trae nombre y documento como columnas propias',
        ficha.nombre === 'Ana Maria Perez' && ficha.ci === '4.321.987-6'],
      ['y el borrado dejo la lista sin el estudio',
        getInformes().every(i => i.estudioId !== g.estudioId)]
    ] };
  })();
`);

/* Lo que importa no es que los tres numeros vuelvan —eso lo hace el barrido generico— sino que
   el INFORME generado despues de reabrir sea identico al de antes de guardar. Un campo puede
   volver y aun asi el informe cambiar, si algo derivado no se recalculo al restaurar: es
   exactamente para lo que existe RECALC_MODULOS. */
caso('TC-GR-02', 'Guardar y reabrir: el informe generado despues es identico al de antes', `
  return (async () => {
    __t.limpiar();
    __t.set('nombre','Control Identidad'); __t.set('ci','111');
    __t.set('peso','80'); __t.set('talla','180'); __t.set('sexo','M');
    __t.set('fevi','42'); __t.set('siv','13'); __t.set('pp','11');
    __t.set('ddvi','58'); __t.set('tapse','16');
    const antes = __t.informe();
    const derivAntes = { masa: __t.txt('devereux-val'), geom: __t.txt('geom-val') };
    const g = await __t.guardar();
    __t.nuevoEstudio();
    __t.reabrir(g.estudioId);
    const despues = __t.informe();
    const derivDespues = { masa: __t.txt('devereux-val'), geom: __t.txt('geom-val') };
    await __t.borrar(g.estudioId);
    return { extra: [
      ['la FEVI vuelve',   __t.val('fevi') === '42'],
      ['el septum vuelve', __t.val('siv') === '13'],
      ['el TAPSE vuelve',  __t.val('tapse') === '16'],
      ['el informe narrativo es identico, palabra por palabra', antes.inf === despues.inf],
      ['el EN SUMA tambien',                                    antes.suma === despues.suma],
      ['y los DERIVADOS se recalcularon: la masa VI coincide y no quedo vacia',
        derivDespues.masa === derivAntes.masa && (derivDespues.masa || '').length > 0],
      ['idem la geometria',
        derivDespues.geom === derivAntes.geom && (derivDespues.geom || '').length > 0]
    ] };
  })();
`);

/* El ESCENARIO de la EAo («severa concordante») NO es un campo: lo recalcula eaEscenario() desde
   los datos. Si el grado volviera y el escenario no, el informe firmado cambiaria de frase al
   reabrir el mismo estudio. */
caso('TC-GR-03', 'Guardar y reabrir: la EAo severa concordante se restaura con su escenario', `
  return (async () => {
    __t.limpiar(); __t.set('nombre','EA Severa'); __t.set('ci','222');
    __t.set('peso','70'); __t.set('talla','170');
    __t.set('diam_tsvi','20'); __t.set('itv_tsvi','18'); __t.set('itv_ao','71');
    __t.set('vmax_ao','4.5'); __t.set('gmedio_ao','45'); __t.set('fevi','65');
    document.getElementById('ea_grado').value = 'severa';
    const antes = __t.informe();
    const g = await __t.guardar();
    __t.nuevoEstudio();
    __t.reabrir(g.estudioId);
    const despues = __t.informe();
    const esc = eaEscenario().clave;
    await __t.borrar(g.estudioId);
    return { extra: [
      ['ea_grado se restauro',                       __t.val('ea_grado') === 'severa'],
      ['el escenario se RECALCULO como concordante', esc === 'severa_concordante'],
      ['el informe dice estenosis severa',           despues.inf.indexOf('estenosis severa') > -1],
      ['con el AVA calculado, no en blanco',         despues.inf.indexOf('AVA 0.80') > -1],
      ['y no aparece el bajo flujo, que es otro escenario',
        despues.inf.indexOf('bajo flujo') === -1 && despues.inf.indexOf('paradojal') === -1],
      ['el informe es identico al de antes de guardar', antes.inf === despues.inf],
      ['y el EN SUMA tambien',                          antes.suma === despues.suma]
    ] };
  })();
`);

/* El paciente A se GUARDA antes de pasar a B: sin ese paso el caso probaria limpiarCampos a
   secas, que ya cubre TC-82. Lo que se quiere es la secuencia real —cargar, guardar, estudio
   nuevo, otro paciente— que es donde aparecio la fuga. */
caso('TC-GR-04', 'La FEVI reducida del paciente A no aparece en el informe de B', `
  return (async () => {
    __t.limpiar(); __t.set('nombre','Paciente A'); __t.set('ci','A1');
    __t.set('fevi','35'); __t.set('ddvi','62');
    const a = __t.informe();
    const g = await __t.guardar();
    __t.nuevoEstudio();
    __t.set('nombre','Paciente B'); __t.set('ci','B1');
    __t.set('tapse','22'); __t.set('vd_bas','35');     // B tiene datos, pero NINGUNA FEVI
    const b = __t.informe();
    await __t.borrar(g.estudioId);
    return { extra: [
      ['A si tenia la disfuncion',                  a.inf.indexOf('FEVI 35') > -1],
      ['el campo FEVI de B quedo vacio',            __t.val('fevi') === ''],
      ['el informe de B no nombra la FEVI del anterior', b.inf.indexOf('FEVI 35') === -1],
      ['ni habla de disfuncion sistolica',          !/disfunci[oó]n sist[oó]lica/i.test(b.inf)],
      ['ni arrastra el diametro del anterior',      b.inf.indexOf('62') === -1],
      ['y el EN SUMA de B no nombra la FEVI',       b.suma.indexOf('FEVI') === -1]
    ] };
  })();
`);

/* La coartacion es de las que mas duelen: el informe de A habla de indicacion de intervencion, y
   ese parrafo apareciendo en el estudio de otra persona es el caso que cargarEstudioPorId
   documenta haber cerrado. Se gatea por coart_incluir_chk, o sea que ademas de los campos tiene
   que limpiarse la CASILLA. */
caso('TC-GR-05', 'La coartacion del paciente A no aparece en el informe de B', `
  return (async () => {
    __t.limpiar(); __t.set('nombre','Paciente A CoAo'); __t.set('ci','A2');
    __t.set('coa_loc','yuxtaductal'); __t.set('coa_istmo','6');
    __t.set('coa_vmax','3.4'); __t.set('coa_gmedio','45');
    __t.set('coa_diast_anterogrado','si');
    __t.chk('coart_incluir_chk', true);
    const a = __t.informe();
    const g = await __t.guardar();
    __t.nuevoEstudio();
    __t.set('nombre','Paciente B'); __t.set('ci','B2'); __t.set('fevi','60');
    const b = __t.informe();
    const casilla = document.getElementById('coart_incluir_chk');
    await __t.borrar(g.estudioId);
    return { extra: [
      ['A si tenia la coartacion en su informe', /coartaci[oó]n/i.test(a.inf)],
      ['la casilla de inclusion quedo destildada', !!casilla && casilla.checked === false],
      ['los campos de la coartacion quedaron vacios',
        __t.val('coa_gmedio') === '' && __t.val('coa_istmo') === ''],
      ['el informe de B NO nombra la coartacion', !/coartaci[oó]n/i.test(b.inf)],
      ['ni el EN SUMA',                           !/coartaci[oó]n/i.test(b.suma)]
    ] };
  })();
`);

caso('TC-GR-06', 'HFA-PEFF integrado: el texto viaja con el estudio y vuelve igual', `
  return (async () => {
    __t.limpiar(); __t.set('nombre','HFpEF'); __t.set('ci','333');
    __t.set('peso','80'); __t.set('talla','180'); __t.set('edad','74'); __t.set('sexo','F');
    __t.set('fevi','60'); __t.set('siv','13'); __t.set('pp','12'); __t.set('ddvi','45');
    __t.set('ai_vol','80'); __t.set('vmax_it','3.2'); __t.set('hf_ntprobnp','900');
    __t.set('ee_prom','14');
    const score = hfapeffScore(false);
    amiloIntegrar('hfpeff');
    const original = (document.getElementById('am-txt-hfpeff') || {}).value || '';
    const g = await __t.guardar();
    __t.nuevoEstudio();
    const trasLimpiar = (document.getElementById('am-txt-hfpeff') || {}).value || '';
    __t.reabrir(g.estudioId);
    const vuelto = (document.getElementById('am-txt-hfpeff') || {}).value || '';
    const integrado = amiloIntegrado('hfpeff');
    await __t.borrar(g.estudioId);
    return { extra: [
      ['el score llego a la banda alta',    score.total >= 5],
      ['el texto se genero al integrar',    original.length > 50],
      ['«Nuevo estudio» lo borro',          trasLimpiar === ''],
      ['y volvio IDENTICO al reabrir',      vuelto === original],
      ['el modulo sigue marcado como integrado', integrado === true],
      ['el texto trae la conclusion, no solo el puntaje', vuelto.indexOf('HFpEF') > -1]
    ] };
  })();
`);

caso('TC-GR-07', 'TEER integrado: la hoja viaja con el estudio y vuelve igual', `
  return (async () => {
    __t.limpiar(); __t.set('nombre','TEER'); __t.set('ci','444');
    __t.set('teer_tipo_im','secundaria');
    __t.set('teer_lva','24'); __t.set('teer_lvp','9'); __t.set('teer_gap','6');
    __t.set('teer_prof_flail','8'); __t.set('teer_area_mitral','5.2'); __t.set('teer_pasp','40');
    __t.set('teer_fevi','35'); __t.set('teer_dtsvi','62');
    __t.set('teer_calcificacion','no'); __t.set('teer_clefts','no'); __t.set('teer_trombo','no');
    amiloIntegrar('teer');
    const original = (document.getElementById('am-txt-teer') || {}).value || '';
    const g = await __t.guardar();
    __t.nuevoEstudio();
    __t.reabrir(g.estudioId);
    const vuelto = (document.getElementById('am-txt-teer') || {}).value || '';
    const est = teerEstado();
    /* La CAPSULA de pantalla la repinta calcTEER, que entra por RECALC_MODULOS. teerEstado()
       recalcula sola cuando se la llama, asi que sin mirar la capsula el caso no distingue
       «se repinto» de «quedo con lo del paciente anterior». */
    const capsula = (__t.txt('teer-resultado') || '').trim();
    await __t.borrar(g.estudioId);
    return { extra: [
      ['la hoja se genero con la conclusion',
        original.indexOf('APTO para TEER - criterios cumplidos') > -1],
      ['vuelve IDENTICA al reabrir', vuelto === original],
      ['el modulo sigue integrado',  amiloIntegrado('teer') === true],
      ['y los campos del TEER se restauraron, no solo el texto',
        __t.val('teer_dtsvi') === '62' && __t.val('teer_tipo_im') === 'secundaria'],
      ['asi que el estado recalculado coincide con la hoja guardada', est.clave === 'apto'],
      ['y la CAPSULA de pantalla se repinto, no quedo en «—»',
        capsula.indexOf('APTO para TEER') > -1]
    ] };
  })();
`);

/* La serie de seguimiento de cardio-onco vive en co_seguimiento, una clave GLOBAL de
   localStorage indexada por nombre/documento: NO viaja en campos. Por eso coCongelarSerie la
   serializa al input oculto co_serie_json al integrar, que es lo que si viaja.
   El caso prueba las DOS mitades: que la serie congelada vuelva con el estudio, y que sea la
   CONGELADA y no la viva — un control que llega despues de firmar no puede cambiar un informe
   ya firmado. */
caso('TC-GR-08', 'Cardio-onco: la serie congelada viaja y no la pisa un control posterior', `
  return (async () => {
    __t.limpiar(); __t.set('nombre','Onco Serie'); __t.set('ci','555');
    __t.set('co_fevi_basal','60'); __t.set('co_fevi_actual','48');
    __t.set('co_gls_basal','-20'); __t.set('co_gls_actual','-15');
    const serie = [{ fecha:'2026-03-10', fevi:58, gls:-19, nota:'ciclo 2' },
                   { fecha:'2026-06-10', fevi:52, gls:-17, nota:'ciclo 4' }];
    /* La clave NO es la cedula pelada: _coPacienteKey la arma como 'D:' + documento en
       minusculas y sin puntos ni guiones. Escribirla mal no da error — coCongelarSerie
       encuentra cero puntos y deja el campo vacio, o sea que el caso pasaria a probar otra cosa. */
    localStorage.setItem('co_seguimiento', JSON.stringify({ 'D:555': serie }));
    coCongelarSerie();
    const congelado = __t.val('co_serie_json');
    const g = await __t.guardar();
    // Despues de firmar llega un control nuevo: la serie VIVA cambia.
    localStorage.setItem('co_seguimiento', JSON.stringify({
      'D:555': serie.concat([{ fecha:'2026-09-10', fevi:40, gls:-12, nota:'ciclo 6' }]) }));
    __t.nuevoEstudio();
    const trasLimpiar = __t.val('co_serie_json');
    __t.reabrir(g.estudioId);
    const vuelto = __t.val('co_serie_json');
    let pts = []; try { pts = JSON.parse(vuelto || '[]'); } catch (e) {}
    await __t.borrar(g.estudioId);
    try { localStorage.removeItem('co_seguimiento'); } catch (e) {}
    return { extra: [
      ['la serie se congelo en el campo del estudio', (congelado || '').indexOf('2026-03-10') > -1],
      ['«Nuevo estudio» la limpio',                   trasLimpiar === ''],
      ['y vuelve con el estudio al reabrir',          vuelto === congelado],
      ['con los DOS controles que tenia al firmar',   pts.length === 2],
      ['sin el control que llego DESPUES de firmar',  (vuelto || '').indexOf('2026-09-10') === -1],
      ['los datos del punto viajan completos, no solo la fecha',
        !!pts[0] && pts[0].fevi === 58 && pts[0].nota === 'ciclo 2']
    ] };
  })();
`);

/* Es la otra mitad de TC-92. Reimprimir CONGELA; abrir para EDITAR recalcula, que es lo que hace
   que corregir un dato despues de reabrir cambie el informe. Si al reabrir quedara el texto
   guardado, el medico corrige el gradiente y el informe sigue diciendo lo viejo. */
caso('TC-GR-09', 'Reabrir y corregir: el informe sigue al dato nuevo, no al guardado', `
  return (async () => {
    __t.limpiar(); __t.set('nombre','EA Progresa'); __t.set('ci','666');
    __t.set('peso','70'); __t.set('talla','170');
    __t.set('vmax_ao','3.2'); __t.set('gmedio_ao','25'); __t.set('fevi','60');
    document.getElementById('ea_grado').value = 'moderada';
    const moderada = __t.informe();
    const g = await __t.guardar();
    __t.nuevoEstudio();
    __t.reabrir(g.estudioId);
    const alReabrir = __t.informe();
    // El medico corrige: en realidad es severa.
    __t.set('diam_tsvi','20'); __t.set('itv_tsvi','18'); __t.set('itv_ao','71');
    __t.set('vmax_ao','4.5'); __t.set('gmedio_ao','45');
    document.getElementById('ea_grado').value = 'severa';
    const corregido = __t.informe();
    await __t.borrar(g.estudioId);
    return { extra: [
      ['al reabrir dice lo mismo que se guardo', alReabrir.inf === moderada.inf],
      ['y eso era moderada',                     moderada.inf.indexOf('estenosis moderada') > -1],
      ['tras corregir pasa a severa',            corregido.inf.indexOf('estenosis severa') > -1],
      ['y ya no dice moderada',                  corregido.inf.indexOf('estenosis moderada') === -1],
      ['el EN SUMA lo sigue',                    corregido.suma.indexOf('EAo severa.') > -1]
    ] };
  })();
`);

/* Los derivados que viven en inputs READONLY —psap_calc, pmad— viajan en `campos` como
   cualquier otro input, asi que vuelven solos; y el informe narrativo los lee A ELLOS, no a la
   capsula. Por eso el informe reabierto sale identico aunque la capsula quede vieja (ver
   TC-GR-13). El caso deja un paciente RUIDOSO en pantalla a proposito y reabre ENCIMA, que es
   el escenario real de la fuga: si algo no se repusiera, se veria lo de el. */
caso('TC-GR-10', 'Reabrir encima de otro paciente: los derivados del informe son los del estudio', `
  return (async () => {
    __t.limpiar(); __t.set('nombre','Ruido'); __t.set('ci','R1');
    __t.set('vmax_it','4.2'); __t.set('vci_diam','25'); __t.set('vci_col','<50');
    const ruido = { calc: __t.val('psap_calc'), pmad: __t.val('pmad'), inf: __t.informe().inf };
    __t.limpiar(); __t.set('nombre','HTP Leve'); __t.set('ci','777');
    __t.set('vmax_it','2.9'); __t.set('vci_diam','18'); __t.set('vci_col','>50');
    const antes = { calc: __t.val('psap_calc'), pmad: __t.val('pmad'), inf: __t.informe().inf };
    const g = await __t.guardar();
    // Se vuelve a poner el ruidoso EN PANTALLA y se reabre encima, sin pasar por «Nuevo estudio».
    __t.limpiar(); __t.set('nombre','Ruido'); __t.set('ci','R1');
    __t.set('vmax_it','4.2'); __t.set('vci_diam','25'); __t.set('vci_col','<50');
    __t.reabrir(g.estudioId);
    const desp = { calc: __t.val('psap_calc'), pmad: __t.val('pmad'), inf: __t.informe().inf };
    await __t.borrar(g.estudioId);
    return { extra: [
      ['los dos pacientes daban PSAP distinta', ruido.calc !== antes.calc],
      ['la velocidad de IT se restauro',        __t.val('vmax_it') === '2.9'],
      ['la VCI tambien, select incluido',
        __t.val('vci_diam') === '18' && __t.val('vci_col') === '>50'],
      ['la PSAP derivada es la del estudio',    desp.calc === antes.calc],
      ['y no la del paciente que estaba en pantalla', desp.calc !== ruido.calc],
      ['la PmAD tambien',                       desp.pmad === antes.pmad],
      ['y el informe firmado sale identico al original', desp.inf === antes.inf],
      ['que NO es el del ruidoso',              desp.inf !== ruido.inf]
    ] };
  })();
`);

/* LA LIMPIEZA QUE HACE `cargarEstudioPorId` POR DENTRO. Los casos de arriba pasan por «Nuevo
   estudio» antes de reabrir, asi que NO dependen de ella: al sacarla de index.html el suite
   seguia entero en verde. Lo descubrio la mutacion, no la lectura.
   El escenario que si la necesita es el que documenta la propia funcion: un estudio con `campos`
   RALO —los importados de Excel y de DICOM construyen el objeto desde cero y traen unas pocas
   decenas de claves— abierto ENCIMA de un paciente cargado. El bucle de restauracion solo pisa
   las claves que el estudio TRAE, asi que todo lo demas se queda con lo del anterior. Medido en
   su momento: la pantalla quedaba con el nombre del estudio nuevo y la coartacion, la valvula
   bicuspide y las notas del anterior, con la casilla «✓ Integrado al informe» tildada, y el PDF
   salia recomendando intervenir una coartacion que era de otra persona.
   El estudio ralo se escribe directo en el store, que es lo que hace un importador. */
caso('TC-GR-14', 'Abrir un estudio importado encima de otro paciente no hereda sus hallazgos', `
  return (async () => {
    // Paciente A EN PANTALLA, con hallazgos que gatean parrafos propios.
    __t.limpiar(); __t.set('nombre','Paciente Previo'); __t.set('ci','PREV');
    __t.set('coa_loc','yuxtaductal'); __t.set('coa_istmo','6');
    __t.set('coa_vmax','3.4'); __t.set('coa_gmedio','45');
    __t.chk('coart_incluir_chk', true);
    __t.set('vab_fenotipo','rl'); __t.chk('vab_incluir_chk', true);
    __t.set('fevi','35');
    const a = __t.informe();

    /* Estudio IMPORTADO: campos ralo, como lo arma el importador de Excel. No pasa por
       guardarInforme —que barreria los ~490 inputs— porque el punto es justamente que faltan. */
    const ralo = { id: 987654321, estudioId: 'test-ralo-001', uuid: '00000000-0000-4000-8000-000000000001',
                   nombre: 'Importado Excel', ci: 'IMP1', doc_tipo: 'CI',
                   fecha_estudio: '2026-09-15', fecha_guardado: '2026-09-15T00:00:00.000Z',
                   campos: { nombre:'Importado Excel', ci:'IMP1', fevi:'60', tapse:'22' } };
    await CeiboStore.setLocal(getInformes().concat([ralo]));

    __t.reabrir('test-ralo-001');
    const b = __t.informe();
    const casilla = document.getElementById('coart_incluir_chk');
    const vabChk  = document.getElementById('vab_incluir_chk');
    await __t.borrar('test-ralo-001');
    return { extra: [
      ['el paciente previo si tenia la coartacion', /coartaci[oó]n/i.test(a.inf)],
      ['y la valvula bicuspide',                    /bic[uú]spide/i.test(a.inf)],
      ['el estudio importado trae su nombre',       __t.val('nombre') === 'Importado Excel'],
      ['y su FEVI',                                 __t.val('fevi') === '60'],
      ['los campos de la coartacion, que el importado NO trae, quedaron VACIOS',
        __t.val('coa_gmedio') === '' && __t.val('coa_istmo') === '' && __t.val('coa_loc') === ''],
      ['la casilla de inclusion de la coartacion quedo destildada',
        !!casilla && casilla.checked === false],
      ['idem la de la valvula bicuspide',           !!vabChk && vabChk.checked === false],
      ['el informe del importado NO nombra la coartacion del anterior',
        !/coartaci[oó]n/i.test(b.inf)],
      ['ni la valvula bicuspide',                   !/bic[uú]spide/i.test(b.inf)],
      ['ni arrastra su FEVI reducida',              b.inf.indexOf('FEVI 35') === -1],
      ['y el EN SUMA tampoco',
        !/coartaci[oó]n/i.test(b.suma) && !/bic[uú]spide/i.test(b.suma)]
    ] };
  })();
`);

/* CONTRACTILIDAD Y STRAIN SEGMENTARIOS. Son los dos estados que NO viven en inputs: son objetos
   en memoria (contrEstado, strainEstado) que guardarInforme serializa a mano con JSON.stringify
   y que tres funciones propias reponen. Por eso el barrido generico no los cubre, y por eso el
   strain ya costo un bug: vivia SOLO en memoria, no se guardaba ni se respaldaba al reimprimir,
   asi que el bull's eye salia con los colores del paciente que estuviera abierto mientras el
   numero de GLS y las notas venian del guardado — la combinacion mas engañosa posible.
   El caso lo delato una mutacion: sacar _restaurarStrain de cargarEstudioPorId dejaba el suite
   entero en verde.
   SALVEDAD: los segmentos se pintan CLICKEANDO el diagrama, y eso no se automatiza acá. El caso
   escribe los objetos en memoria, o sea que prueba el VIAJE (serializar, guardar, reponer) y no
   la interaccion. Pintar el bull's eye a mano y verificar los colores tras reabrir REQUIERE
   VERIFICACION MANUAL. */
caso('TC-GR-15', 'Contractilidad y strain segmentarios viajan con el estudio', `
  return (async () => {
    __t.limpiar(); __t.set('nombre','Segmentos'); __t.set('ci','1313');
    // Segmentos marcados como los dejaria el diagrama: 1 = normal, 2 = hipoquinesia, etc.
    contrEstado['seg1'] = 2; contrEstado['seg7'] = 3; contrEstado['seg13'] = 1;
    strainEstado['seg1'] = -8; strainEstado['seg7'] = -12;
    const g = await __t.guardar();

    // Se deja OTRO juego de segmentos en pantalla: si no se repusieran, se verian estos.
    __t.limpiar(); __t.set('nombre','Ruido Segmentos'); __t.set('ci','RS');
    contrEstado['seg1'] = 4; contrEstado['seg2'] = 4;
    strainEstado['seg1'] = -20; strainEstado['seg3'] = -19;

    __t.reabrir(g.estudioId);
    const contr  = JSON.parse(JSON.stringify(contrEstado));
    const strain = JSON.parse(JSON.stringify(strainEstado));
    const ficha  = getInformes().find(i => i.estudioId === g.estudioId) || {};
    const guardado = {
      contr:  (ficha.campos || {}).contractilidad,
      strain: (ficha.campos || {}).strain_sgl
    };
    await __t.borrar(g.estudioId);
    return { extra: [
      ['la contractilidad se serializo al estudio, no quedo solo en memoria',
        (guardado.contr || '').indexOf('seg7') > -1],
      ['el strain tambien',  (guardado.strain || '').indexOf('seg7') > -1],
      ['los tres segmentos de contractilidad vuelven con su valor',
        contr.seg1 === 2 && contr.seg7 === 3 && contr.seg13 === 1],
      ['y el strain de los dos suyos',  strain.seg1 === -8 && strain.seg7 === -12],
      ['no quedo NINGUN segmento del paciente que estaba en pantalla',
        contr.seg2 === undefined && strain.seg3 === undefined],
      ['ni su valor pisado en el segmento que compartian',
        contr.seg1 !== 4 && strain.seg1 !== -20]
    ] };
  })();
`);

/* CERRADO el 2026-09-15. Lo encontro TC-GR-10 y quedo abierto una tanda. `cargarEstudioPorId`
   recalculaba CINCO funciones —calcVI, calcAI, calcAorta, calcVD, calcVEXUS— mas RECALC_MODULOS,
   mientras la reimpresion, que es la otra ruta de restauracion, recalcula CATORCE. Entre las que
   le faltaban estaban calcPSAP, calcSGL y calcBSA. Esas tres escriben capsulas que nadie mas repone, asi que al
   reabrir un estudio quedan en «—» con los datos de entrada correctamente restaurados al lado.
   Medido: psap-interp «37 mmHg (PmAD 3 mmHg)» -> «—», sgl-interp «SGL -14%» -> «—»,
   bsa-val «2.00 m²» -> «— m²». Las demas capsulas (masa VI, geometria, indice de AI, volumen
   sistolico, FAC, AD) vuelven bien, porque calcVI/calcAI/calcVD si estan en la lista.
   El INFORME NO se ve afectado: el narrativo lee los inputs readonly (psap_calc, pmad), que
   viajan en `campos` — por eso TC-GR-10 pasa. Lo que queda mal es la PANTALLA, que muestra «—»
   mientras el informe de ese mismo estudio dice «PSAP estimada de 37 mmHg». Es la contradiccion
   capsula/informe que este archivo se cuida de evitar (leccion 6 del 2026-09-14), en la ruta
   que usa el QR del PDF — o sea la que abre un colega.
   El arreglo fue agregar las tres a esa lista, con `calcBSA` PRIMERA porque varios derivados
   indexan por superficie corporal. */
caso('TC-GR-13', 'Reabrir un estudio refresca TODAS las capsulas, no solo cinco', `
  return (async () => {
    __t.limpiar(); __t.set('nombre','Capsulas'); __t.set('ci','1212');
    __t.set('peso','80'); __t.set('talla','180'); __t.set('sexo','M');
    __t.set('vmax_it','2.9'); __t.set('vci_diam','18'); __t.set('vci_col','>50');
    __t.set('sgl','-14');
    const antes = { psap: __t.txt('psap-interp'), sgl: __t.txt('sgl-interp'), bsa: __t.txt('bsa-val') };
    const g = await __t.guardar();
    __t.nuevoEstudio();
    __t.reabrir(g.estudioId);
    const desp = { psap: __t.txt('psap-interp'), sgl: __t.txt('sgl-interp'), bsa: __t.txt('bsa-val') };
    await __t.borrar(g.estudioId);
    return { extra: [
      ['la capsula de PSAP vuelve con su valor', desp.psap === antes.psap],
      ['la del SGL tambien',                     desp.sgl === antes.sgl],
      ['y la de la superficie corporal',         desp.bsa === antes.bsa],
      ['ninguna quedo en «—»',
        [desp.psap, desp.sgl, desp.bsa].every(t => (t || '').indexOf('—') === -1)],
      /* Y que traigan EL valor del estudio, no cualquiera: sin esto, una capsula que quedara con
         lo del paciente anterior pasaria las cuatro condiciones de arriba. */
      ['la PSAP es la del estudio, con su PmAD', (desp.psap || '').indexOf('37 mmHg (PmAD 3 mmHg)') > -1],
      ['el SGL es el del estudio',               (desp.sgl || '').indexOf('-14') > -1],
      ['y la superficie la del peso y la talla guardados',
        (desp.bsa || '').indexOf('2.00') > -1]
    ] };
  })();
`);

caso('TC-GR-11', 'Amiloidosis integrada: vuelve el texto con el score y los puntos del criterio', `
  return (async () => {
    __t.limpiar(); __t.set('nombre','Amiloidosis'); __t.set('ci','888');
    __t.set('peso','80'); __t.set('talla','180');
    // Los ett-* son PUNTOS, no mediciones: se cargan por la via real de la interfaz.
    /* Los CINCO criterios del score son estos, con estos puntajes: 3+3+1+1+2 = 10. No existe
       ningun crit-pw, y toggleCrit con un id que no existe no avisa —hace return en silencio—,
       asi que un criterio mal escrito baja el score sin que nada lo delate.
       El total se publica en ett-score-num, no en ett-total. */
    toggleCrit('crit-rwt','ett-rwt',3);      // 3
    toggleCrit('crit-sgl','ett-sgl',1);      // 1
    toggleCrit('crit-ee','ett-ee',1);        // 1
    toggleCrit('crit-tapse','ett-tapse',2);  // 2  -> 7
    toggleCrit('crit-apice','ett-apice',3);  // 3  -> 10
    const total = __t.txt('ett-score-num');
    amiloIntegrar('ett');
    const original = (document.getElementById('am-txt-ett') || {}).value || '';
    const g = await __t.guardar();
    __t.nuevoEstudio();
    const trasLimpiar = (document.getElementById('am-txt-ett') || {}).value || '';
    __t.reabrir(g.estudioId);
    const vuelto = (document.getElementById('am-txt-ett') || {}).value || '';
    await __t.borrar(g.estudioId);
    return { extra: [
      ['el score sumo los cinco criterios', (total || '').trim() === '10'],
      ['el texto se genero',            original.length > 50],
      ['«Nuevo estudio» lo borro',      trasLimpiar === ''],
      ['vuelve identico al reabrir',    vuelto === original],
      ['el modulo sigue integrado',     amiloIntegrado('ett') === true],
      ['los puntos del criterio tambien vuelven', __t.val('ett-rwt') === '3'],
      ['y el texto trae el puntaje',    vuelto.indexOf('10') > -1]
    ] };
  })();
`);

/* ete_morfo_incluir_chk es la casilla que ya costo un bug. Tiene DOS persistencias: el __chk que
   viaja con el estudio, y una clave GLOBAL de localStorage (ete_morfo_incluir) que escribe su
   propio onchange y que lee un script al arrancar la pagina. El caso prueba la que decide el
   informe —la del estudio— y ADEMAS mira la global, que es por donde una decision de un paciente
   puede aparecer en el siguiente. */
caso('TC-GR-12', 'La casilla de morfologia ETE viaja con el estudio y no se pega al siguiente', `
  return (async () => {
    __t.limpiar(); __t.set('nombre','ETE Morfo'); __t.set('ci','999');
    __t.chk('ete_morfo_incluir_chk', true);
    const g = await __t.guardar();
    __t.nuevoEstudio();
    const trasLimpiar = document.getElementById('ete_morfo_incluir_chk').checked;
    __t.reabrir(g.estudioId);
    const trasReabrir = document.getElementById('ete_morfo_incluir_chk').checked;
    /* El BOTON lo repinta eteInclSync, que entra por RECALC_MODULOS — no por
       _restaurarChkInclusion, que solo mueve el .checked del input oculto. Sin esta condicion,
       sacar RECALC_MODULOS de cargarEstudioPorId dejaba el suite entero en verde: el medico
       reabre el estudio, la casilla esta tildada por dentro y el boton sigue diciendo
       «Integrar al informe», o sea que la pantalla niega lo que el informe hace. Lo delato la
       mutacion, no la lectura. */
    const btn = document.querySelector('.btn-integrar[data-ete-chk=\"ete_morfo_incluir_chk\"]');
    const textoBoton = btn ? btn.textContent.trim() : null;
    /* Se captura el VALOR, no la referencia: mas abajo el caso abre un segundo estudio que NO
       tiene la casilla, eteInclSync vuelve a ocultar el badge, y para cuando se evaluan las
       condiciones un badge.hidden leido en vivo ya dice true. El texto del boton no tenia el
       problema porque .textContent devuelve una cadena. */
    const badgeVisible = (function(){ const b = document.getElementById('ete_morfo_badge');
      return !!b && b.hidden === false; })();
    // Y ahora un estudio SIN la casilla: no puede heredarla.
    __t.limpiar(); __t.set('nombre','Otro'); __t.set('ci','1000');
    const g2 = await __t.guardar();
    __t.nuevoEstudio(); __t.reabrir(g2.estudioId);
    const enElOtro = document.getElementById('ete_morfo_incluir_chk').checked;
    await __t.borrar(g.estudioId); await __t.borrar(g2.estudioId);
    try { localStorage.removeItem('ete_morfo_incluir'); } catch (e) {}
    return { extra: [
      ['«Nuevo estudio» destilda la casilla',               trasLimpiar === false],
      ['reabrir el estudio que la tenia la vuelve a tildar', trasReabrir === true],
      ['y el BOTON se repinta, no solo el input oculto',     textoBoton === '✓ Integrado al informe'],
      ['con su badge visible',                              badgeVisible === true],
      ['y un estudio que NO la tenia no la hereda',          enElOtro === false]
    ] };
  })();
`);


/* Los segmentos del ETE vivian en claves GLOBALES de localStorage (ete_seg_A1...P3) y el
   arranque las volcaba a los espejos en cada carga: abrir la app de cero dejaba el diagrama
   pintado con los hallazgos del paciente anterior. La tapa que existia —limpiarCampos llama a
   eteLimpiarSegmentos— solo corre en «Nuevo estudio», o sea que NO cubria el arranque.
   Este caso fija las dos mitades: que la clave global no se escriba mas, y que el estado
   SIGA viajando por los espejos, que es lo que no se puede romper al sacarla. */
caso('TC-158', 'Los segmentos del ETE no dejan rastro en localStorage y viajan con el estudio', `
  return (async () => {
    const SEGS = ['A1','A2','A3','P1','P2','P3'];
    const esp = () => SEGS.map(s => (document.getElementById('ete_seg_' + s) || {}).value).join(',');
    const enDisco = () => SEGS.filter(s => localStorage.getItem('ete_seg_' + s) !== null);
    const resumen = () => (document.getElementById('ete-seg-resumen') || {}).textContent || '';
    SEGS.forEach(s => { try { localStorage.removeItem('ete_seg_' + s); } catch (e) {} });
    __t.limpiar();

    /* 1) Una clave global envenenada NO puede repintar el diagrama. eteSegSync lee los
       ESPEJOS; si volviera a consultar localStorage, este bloque se pone en rojo. */
    localStorage.setItem('ete_seg_A1', '2');
    eteSegSync();
    const trasEnvenenar = esp();
    const resumenEnvenenado = resumen();
    SEGS.forEach(s => { try { localStorage.removeItem('ete_seg_' + s); } catch (e) {} });

    /* 2) Pintar de verdad: el espejo se llena y el disco queda limpio. */
    eteClick('A1'); eteClick('A1'); eteClick('A3');
    const espPintado = esp();
    const a1 = (document.getElementById('ete_seg_A1') || {}).value;
    const discoTrasPintar = enDisco();
    const resumenPintado = resumen();

    /* 3) El estado viaja con el estudio: guardar, «Nuevo estudio», reabrir. */
    __t.set('nombre', 'SEG ETE'); __t.set('ci', '9090909-0');
    const g = await __t.guardar();
    const campoGuardado = (function () {
      const e = getInformes().find(i => i.estudioId === g.estudioId);
      return e && e.campos ? e.campos.ete_seg_A1 : null;
    })();
    __t.nuevoEstudio();
    const espTrasLimpiar = esp();
    const discoTrasLimpiar = enDisco();
    __t.reabrir(g.estudioId);
    const espTrasReabrir = esp();
    const resumenTrasReabrir = resumen();
    await __t.borrar(g.estudioId);

    /* 4) Y el boton «Limpiar» del diagrama tampoco escribe en disco. */
    eteClick('P1');
    eteLimpiarSegmentos();
    const discoTrasLimpiarBoton = enDisco();
    const espTrasLimpiarBoton = esp();
    __t.limpiar();

    return { extra: [
      ['una clave global envenenada no pinta nada',        trasEnvenenar === '0,0,0,0,0,0', trasEnvenenar],
      ['  ni aparece en el resumen de hallazgos',          resumenEnvenenado.indexOf('Hallazgos') === -1, resumenEnvenenado.trim()],
      ['pintar un segmento llena su espejo',               a1 !== '0' && a1 !== '' && a1 != null, espPintado],
      ['  y el resumen lo publica',                        resumenPintado.indexOf('Hallazgos') > -1, resumenPintado.trim()],
      ['  SIN escribir una sola clave en localStorage',    discoTrasPintar.length === 0, discoTrasPintar.join(',')],
      ['el espejo viaja dentro de campos del estudio',     campoGuardado === a1, String(campoGuardado) + ' vs ' + String(a1)],
      ['«Nuevo estudio» deja el diagrama en cero',         espTrasLimpiar === '0,0,0,0,0,0', espTrasLimpiar],
      ['  y no deja rastro en disco',                      discoTrasLimpiar.length === 0, discoTrasLimpiar.join(',')],
      ['reabrir el estudio repone los segmentos',          espTrasReabrir === espPintado, espTrasReabrir + ' vs ' + espPintado],
      ['  con su resumen de hallazgos',                    resumenTrasReabrir.indexOf('Hallazgos') > -1, resumenTrasReabrir.trim()],
      ['el boton Limpiar deja el diagrama en cero',        espTrasLimpiarBoton === '0,0,0,0,0,0', espTrasLimpiarBoton],
      ['  sin escribir en localStorage',                   discoTrasLimpiarBoton.length === 0, discoTrasLimpiarBoton.join(',')]
    ] };
  })();
`);

/* La guarda «formulario vacio» de _autosaveRestore excluia los readonly, y eso dejaba afuera
   firma-esp y cfg-med-especialidad: son input[type=text] SIN readonly que la configuracion del
   medico llena al arrancar. Con especialidad cargada —o sea, todo medico configurado de
   verdad— la restauracion del borrador estaba MUERTA: cerrar la pestaña a mitad de un estudio
   perdia todo, con la app prometiendo lo contrario en cada tecla.
   La condicion correcta no es «no es readonly» sino «es un campo del estudio». */
caso('TC-159', 'El borrador sin guardar vuelve aunque haya configuracion del medico cargada', `
  return (async () => {
    __t.limpiar();
    /* Se poblan DESPUES de limpiar, que es el orden real: aplicarMedico corre al arrancar y
       limpiarCampos barre input[type=text] sin mirar a quien pertenece el campo. */
    const fe = document.getElementById('firma-esp');
    const ce = document.getElementById('cfg-med-especialidad');
    if (fe) fe.value = 'Cardiologia';
    if (ce) ce.value = 'Cardiologia';
    /* Los tres tienen que estar fuera de su valor por defecto para que el caso pruebe algo:
       sin denominador, «se restauro» no distingue el arreglo de un formulario que ya estaba
       limpio. lab-pdf-titulo trae texto en el HTML y limpiarCampos se lo lleva, asi que ya
       quedo distinto de su defaultValue. */
    const fueraDeDefault = ['firma-esp','cfg-med-especialidad','lab-pdf-titulo'].filter(id => {
      const e = document.getElementById(id);
      return e && !e.readOnly && !e.disabled && e.value !== e.defaultValue;
    });

    localStorage.setItem('ecosmart_autosave', JSON.stringify({
      nombre: 'BORRADOR Perez', ci: '4545454-5', fevi: '38', ddfvi: '62'
    }));
    _autosaveRestore();
    const nombre = __t.val('nombre');
    const fevi = __t.val('fevi');

    /* Y el contrapeso: un formulario YA EMPEZADO no se pisa. Sin esta mitad, el arreglo podria
       ser «ignorar todo» y el borrador del paciente anterior aterrizaria encima del actual. */
    __t.limpiar();
    __t.set('nombre', 'Paciente EN CURSO');
    _autosaveRestore();
    const noPisa = __t.val('nombre');

    try { localStorage.removeItem('ecosmart_autosave'); } catch (e) {}
    __t.limpiar();
    return { extra: [
      ['los tres campos de configuracion estan fuera de su default', fueraDeDefault.length === 3, fueraDeDefault.join(',')],
      ['y aun asi el borrador se restaura',                          nombre === 'BORRADOR Perez', nombre],
      ['  con sus mediciones',                                       fevi === '38', fevi],
      ['un formulario ya empezado NO se pisa',                       noPisa === 'Paciente EN CURSO', noPisa]
    ] };
  })();
`);


/* El color del header es la UNICA fuente de verdad del PDF. Moderno cableaba [198,40,40] y
   Elegante [212,160,23]/[160,118,10], en el encabezado Y en los estilos de tabla, mientras la
   parte 2 —las hojas de modulos avanzados— recibia el color elegido: el mismo documento salia
   con el encabezado rojo y las hojas siguientes del color del medico.
   Se lee el CONTENT STREAM del PDF real, que es el unico oraculo: los operadores "r g b rg" son
   lo que se imprime. Verificar que la funcion no lanza no prueba nada. */
caso('TC-160', 'El color del header manda en todo el PDF y las plantillas no lo pisan', `
  return (async () => {
    /* jsPDF llega por CDN. Sin esta espera el caso da rojo intermitente por la red, que es peor
       que no tenerlo: se deja de creerle al rojo. Mismo patron que TC-131 con SheetJS. */
    for (let i = 0; i < 80 && (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF); i++) {
      await new Promise(r => setTimeout(r, 100));
    }
    if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
      return { extra: [['la libreria jsPDF llego por CDN', false, 'no cargo en 8 s']] };
    }
    const TEMAS = { '1':[26,58,92], '4':[123,45,66] };
    /* Los cuatro literales que estaban cableados. Si alguno vuelve al PDF, vuelve el defecto. */
    const VIEJOS = { 'rojo Moderno':[198,40,40], 'oro Elegante':[212,160,23],
                     'oro oscuro Elegante':[160,118,10], 'crema Elegante':[255,253,245] };
    const op = c => c.map(v => (v/255).toFixed(3)).join(' ');

    const Orig = window.jspdf.jsPDF;
    let ultimo = null;
    function Envuelto() {
      const d = new Orig(...arguments);
      /* save() es propiedad de la INSTANCIA, no del prototipo: se anula aca o el caso deja una
         descarga por cada PDF que genera. */
      d.save = function () { return Promise.resolve(); };
      ultimo = d; return d;
    }
    Envuelto.prototype = Orig.prototype;
    window.jspdf.jsPDF = Envuelto;

    const plantillaPrev = localStorage.getItem('ett_pdf_plantilla');
    const colorPrev = localStorage.getItem('pdf_color');
    __t.limpiar();
    __t.set('nombre', 'COLOR Test'); __t.set('ci', '7777777-7');
    __t.set('fevi', '58'); __t.set('ddfvi', '48');
    generarInforme();

    const medir = async (pltz, colorIdx) => {
      localStorage.setItem('pdf_color', colorIdx);
      localStorage.setItem('ett_pdf_plantilla', pltz);
      ultimo = null;
      await generarPDFReal({});
      if (!ultimo) return null;
      const txt = atob(ultimo.output('datauristring').split(',')[1]);
      const ops = txt.match(/[0-9.]+ [0-9.]+ [0-9.]+ (?:rg|RG)/g) || [];
      const set = Object.create(null);
      ops.forEach(o => { const k = o.replace(/ (rg|RG)$/, ''); set[k] = (set[k] || 0) + 1; });
      return {
        tema: !!set[op(TEMAS[colorIdx])],
        temaN: set[op(TEMAS[colorIdx])] || 0,
        distintos: Object.keys(set).length,
        viejos: Object.keys(VIEJOS).filter(n => set[op(VIEJOS[n])])
      };
    };

    /* Se prueba con el color 4 (bordo) porque es el que mas se separa de los cuatro literales
       viejos: con el 1 (azul) una coincidencia parcial seria mas facil de confundir. */
    const mod  = await medir('moderno', '4');
    const ele  = await medir('elegante', '4');
    const mini = await medir('minimalista', '4');
    const bic  = await medir('bicolor', '4');
    // Y el mismo Moderno con OTRO color: el encabezado tiene que seguir al selector.
    const mod1 = await medir('moderno', '1');

    window.jspdf.jsPDF = Orig;
    if (plantillaPrev) localStorage.setItem('ett_pdf_plantilla', plantillaPrev);
    else localStorage.removeItem('ett_pdf_plantilla');
    if (colorPrev) localStorage.setItem('pdf_color', colorPrev); else localStorage.removeItem('pdf_color');
    __t.limpiar();

    const todos = [mod, ele, mini, bic, mod1];
    const viejosTotales = todos.filter(Boolean).reduce((a, r) => a.concat(r.viejos), []);
    return { extra: [
      ['los cinco PDF se generaron',                      todos.every(Boolean), todos.map(x => !!x).join(',')],
      /* Se cuenta, no se pregunta si ESTA. Con la presencia sola, revertir el encabezado de
         Moderno a su rojo cableado pasaba en verde: las TABLAS ya aportan el color del tema, y
         el caso no distinguia «el encabezado obedece» de «alguien en la hoja lo usa». Medido:
         Moderno emite 4 con las dos mitades obedeciendo y baja al revertir el encabezado. */
      ['Moderno usa el color elegido en toda la hoja',    !!mod && mod.temaN >= 4, mod && mod.temaN],
      ['Moderno sigue al selector con otro color (azul)', !!mod1 && mod1.temaN >= 4, mod1 && mod1.temaN],
      ['Elegante usa el color elegido',                   !!ele && ele.temaN >= 4, ele && ele.temaN],
      ['Bicolor sigue usandolo (no era el defecto)',      !!bic && bic.tema === true],
      /* La mitad que impide "arreglarlo" pintando todo: las tres sin color son un DISEÑO, y su
         descripcion lo promete. Minimalista dice «Sin color. Una linea fina y nada mas». */
      ['Minimalista sigue SIN el color del tema',         !!mini && mini.tema === false],
      ['  y sin ningun color: un solo tono en la hoja',   !!mini && mini.distintos <= 2, mini && mini.distintos],
      ['ninguna plantilla emite los colores cableados',   viejosTotales.length === 0, viejosTotales.join(', ')]
    ] };
  })();
`);


/* Config pasó a siete tarjetas temáticas. La regla del rediseño era «no eliminar ningun campo,
   opcion ni funcionalidad», y el modo de fallo de una reorganizacion de markup es MUDO: una
   seccion que se cae en un reemplazo por rango no rompe nada visible —la pagina sigue
   dibujando— y lo unico que pasa es que el medico ya no puede configurar algo. Este archivo ya
   se comio dos bloques asi al repartir Congenitas.
   Por eso el caso enumera los CONTROLES, no las tarjetas: contar siete no distingue una tarjeta
   completa de una vaciada que conserva su titulo. */
caso('TC-161', 'Config conserva sus siete secciones y todos sus controles', `
  return (async () => {
    const tab = document.getElementById('tab-config');
    const cards = Array.from(document.querySelectorAll('#tab-config .cfg-card'));
    const titulos = cards.map(c => ((c.querySelector('.cfg-sec-title') || {}).textContent || '').trim());
    const grid = document.querySelector('#tab-config .cfg-grid');
    /* Los treinta ids que el medico puede tocar, mas los contenedores que pinta el JS. Si uno
       desaparece, el control existe en la cabeza de quien edito y no en la pagina. */
    const IDS = ['cfg-med-especialidad-on','cfg-med-especialidad','cfg-med-lugar-on','cfg-med-lugar',
      'cfg-med-direccion-on','cfg-med-direccion','cfg-med-telefono-on','cfg-med-telefono',
      'cfg-modo-inst','cfg-logo-thumb','cfg-logo-vacio','cfg-logo-add','cfg-logo-chg','cfg-logo-del',
      'cfg-centro-nuevo','cfg-centros-lista','cfg-medico-nombre','cfg-medico-matricula',
      'cfg-medico-especialidad','cfg-medicos-lista','pltz-grid','pltz-nota','pdf-fmt-sel',
      'pltz-color2-row','pltz-color2-sw','cfg-guardar-imagenes','cfg-mode-basico','cfg-mode-avanzado',
      'cfg-modulos','cfg-soporte'];
    const faltan = IDS.filter(id => !document.getElementById(id));
    /* Y que sigan DENTRO de la tab: un id que quedo suelto en otra parte del documento existe
       para getElementById y es inalcanzable para el medico. */
    const fuera = IDS.filter(id => { const e = document.getElementById(id); return e && !tab.contains(e); });
    const vacias = cards.filter(c => c.querySelectorAll('input,select,textarea,button,[id]').length === 0).length;
    if (typeof initPdfPlantillas === 'function') { try { initPdfPlantillas(); } catch (e) {} }
    const pg = document.getElementById('pltz-grid');
    const opciones = pg ? pg.querySelectorAll('[data-pltz]').length : 0;
    const fmt = document.getElementById('pdf-fmt-sel');
    return { extra: [
      ['la grilla de Config existe',                    !!grid],
      ['hay siete tarjetas',                            cards.length === 7, cards.length],
      ['cada una tiene su titulo',                      titulos.every(t => t.length > 0), titulos.join(' | ')],
      ['ninguna quedo vacia',                           vacias === 0, vacias],
      ['Medicos sigue teniendo tarjeta propia',         titulos.some(t => t.indexOf('Médicos') > -1), titulos.join(' | ')],
      ['no falta ningun control',                       faltan.length === 0, faltan.join(', ')],
      ['y todos siguen dentro de la tab',               fuera.length === 0, fuera.join(', ')],
      ['las ocho plantillas de PDF siguen ofreciendose', opciones === 8, opciones],
      ['el formato de nombre de archivo conserva sus cinco opciones', !!fmt && fmt.options.length === 5, fmt && fmt.options.length]
    ] };
  })();
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
  /* EL TERCER ELEMENTO ES EL DIAGNOSTICO Y SE ESTABA TIRANDO. Decenas de casos lo escriben
     —`['la capsula dice X', cond, valorReal]`— y este forEach solo desestructuraba dos, asi que
     al fallar una condicion el runner imprimia el nombre y nada mas. El render de abajo YA sabe
     mostrarlo (`if (enc)`); lo que faltaba era pasarselo. Sin esto, cada rojo obligaba a montar
     un probe aparte para ver el valor que el caso ya tenia en la mano. */
  (r.extra || []).forEach(([desc, ok, diag]) => {
    if (!ok) fallos.push(['condicion', desc, diag === undefined || diag === null ? '' : String(diag)]);
  });
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
