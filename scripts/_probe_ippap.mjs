#!/usr/bin/env node
/**
 * _probe_ippap.mjs — sonda A/B de SOLO LECTURA para dos mediciones del 2026-10-08:
 *
 *   A · LAS DOS FILAS DE PRESIONES PULMONARES EN LA REIMPRESION. `ip-papm-row` e `ip-papd-row`
 *       las escribe SOLO `calcIP`. La reimpresion tiene DOS fases y cada una corre su propia
 *       lista: la de CARGA llama `calcPSAP` —que llama `calcIP` en su cola— y la de
 *       RESTAURACION no. Se mide el camino real del medico: cargar las dos velocidades de la IP
 *       y la VCI, guardar, «Nuevo estudio», y reimprimir pasando un `accion` propio, que es el
 *       MISMO contrato que usa el boton de PPT (index.html:64791) y evita generar el PDF.
 *       Se leen los CUATRO textos —las dos filas y los dos campos— en cuatro momentos, mas el
 *       informe, el EN SUMA y el Excel, comparados contra el camino DIRECTO.
 *
 *   C · EL REGISTRO DE «QUIEN PRENDIO EL BOTON». VALV_INSUF_AUTO y VALV_ESTEN_AUTO guardan que
 *       pastillas prendio la APP. Se mide si «Nuevo estudio» los deja sucios y si esa suciedad
 *       es ALCANZABLE, o sea si la app puede llegar a apagar una pastilla que el medico prendio.
 *       Con control negativo: las otras valvulas no se tocan.
 *
 * No muta index.html: comprueba su md5 al principio y al final.
 *
 *   node scripts/_probe_ippap.mjs --file /tmp/index.HEAD.html > /tmp/ippap.HEAD.json
 *   node scripts/_probe_ippap.mjs                             > /tmp/ippap.NEW.json
 *
 * Infraestructura (servidor + Chrome + CDP) calcada de scripts/_probe_pulmoauto.mjs.
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, extname, isAbsolute, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

/* ⚠️ EL ARBOL DE CHROME NO SE CIERRA CON `proc.kill()`, Y ASI SE JUNTARON 70 PROCESOS (2026-10-08).
   `proc.kill()` manda SIGTERM al proceso que lanzamos; Chrome arranca media docena de hijos
   (zygote, gpu, renderers) que NO son hijos nuestros, asi que sobreviven al padre y quedan
   HUERFANOS (ppid = 1) reteniendo su perfil. El camino de FALLO era peor: el
   `main().catch(... process.exit(1))` de las sondas no mataba nada, y el timeout de 20 s de
   `abrirChrome` tampoco. Medido antes de este arreglo: 10 Chrome huerfanos con 60 hijos y 1075
   perfiles temporales sin borrar, 2,9 GB en $TMPDIR.
   Tres piezas, ninguna decorativa:
     1. `detached: true` en el spawn, que hace a Chrome LIDER DE SU PROPIO GRUPO de procesos. Sin
        eso, matar un grupo se llevaria al script mismo;
     2. un barrido que mata el GRUPO (`process.kill(-pid)`) y no solo al padre, asi que alcanza a
        los hijos que Chrome creo por su cuenta;
     3. el barrido colgado de `exit` ADEMAS de las senales, porque el `process.exit(1)` del camino
        de fallo y el `process.exit(0)` del camino feliz NO disparan SIGINT ni SIGTERM — pero si
        disparan `exit`. De ahi que el borrado del perfil use `rmSync`: en `exit` ya no corre nada
        asincrono, y un `await rm(...)` ahi se descarta en silencio.
   ⚠️ SOLO PIDs PROPIOS, NUNCA POR NOMBRE. El registro guarda unicamente lo que lanzo ESTE
   proceso. Un `pkill`/`killall` por patron se lleva el Chrome del usuario y la corrida del de al
   lado — en este repo ya hay una leccion escrita sobre un `pkill` que mato la corrida en curso. */
const _ARNES_VIVOS = new Set();
let _arnesLimpiezaArmada = false;
function _arnesCerrarAlSalir(proc, perfil) {
  if (!proc || !proc.pid) return;
  _ARNES_VIVOS.add({ pid: proc.pid, perfil: perfil });
  if (_arnesLimpiezaArmada) return;
  _arnesLimpiezaArmada = true;
  const barrer = () => {
    for (const v of _ARNES_VIVOS) {
      /* El grupo primero. Si ya no existe, `kill` tira ESRCH y se ignora — el barrido es
         idempotente a proposito, porque los cierres del camino feliz ya llamaron a `proc.kill()`
         antes de llegar aca. El fallback al pid pelado cubre que `detached` no haya podido crear
         el grupo. */
      try { process.kill(-v.pid, 'SIGKILL'); }
      catch (e) { try { process.kill(v.pid, 'SIGKILL'); } catch (e2) {} }
      if (v.perfil) { try { rmSync(v.perfil, { recursive: true, force: true }); } catch (e) {} }
    }
    _ARNES_VIVOS.clear();
  };
  process.on('exit', barrer);
  for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
    process.on(sig, () => { barrer(); process.exit(130); });
  }
}


const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const VER  = process.argv.includes('--ver');
const arg  = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const FARG = arg('--file') || 'index.html';
const EXTERNO = isAbsolute(FARG);
const FILE = EXTERNO ? '__ab__' + basename(FARG) : FARG;

const CHROMES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
];
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css',
               '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml' };

function servir() {
  return new Promise((res) => {
    const srv = createServer(async (req, rq) => {
      try {
        const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || FILE;
        const p = (EXTERNO && rel === FILE) ? FARG : join(RAIZ, rel);
        if (!EXTERNO && !p.startsWith(RAIZ)) { rq.writeHead(403).end(); return; }
        const buf = await readFile(p);
        rq.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }).end(buf);
      } catch { rq.writeHead(404).end('no'); }
    });
    srv.listen(0, '127.0.0.1', () => res({ srv, port: srv.address().port }));
  });
}
async function abrirChrome(url) {
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-ippap-'));
  let bin = null;
  for (const c of CHROMES) { try { await readFile(c); bin = c; break; } catch {} }
  if (!bin) throw new Error('No encontre Chrome/Chromium/Edge.');
  const args = ['--remote-debugging-port=0', `--user-data-dir=${perfil}`, '--no-first-run',
                '--no-default-browser-check', '--disable-extensions',
                '--window-size=1280,1000', url];
  if (!VER) args.unshift('--headless=new');
  const proc = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'], detached: true });
  _arnesCerrarAlSalir(proc, perfil);
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
    const errores = [];
    ws.addEventListener('open', () => res({
      send: (method, params = {}, sessionId) => new Promise((ok, no) => {
        const msg = { id: ++id, method, params };
        if (sessionId) msg.sessionId = sessionId;
        pend.set(msg.id, { ok, no });
        ws.send(JSON.stringify(msg));
      }),
      errores,
      close: () => ws.close(),
    }));
    ws.addEventListener('error', rej);
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.method === 'Runtime.exceptionThrown') {
        const d = m.params?.exceptionDetails;
        errores.push({ tipo: 'exception', texto: d?.exception?.description || d?.text || '?' });
      } else if (m.method === 'Runtime.consoleAPICalled' && m.params?.type === 'error') {
        errores.push({ tipo: 'console.error',
          texto: (m.params.args || []).map((a) => a.description ?? a.value ?? '?').join(' ') });
      }
      if (m.id && pend.has(m.id)) {
        const { ok, no } = pend.get(m.id); pend.delete(m.id);
        m.error ? no(new Error(m.error.message)) : ok(m.result);
      }
    });
  });
}

/* ══ Sonda inyectada ══════════════════════════════════════════════════════════════════════════
   CUIDADO: CUERPO DE TEMPLATE LITERAL. Ni un acento grave adentro, tampoco en los comentarios. */
const SONDA = `
window.__P = {
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value } },
  pill(valv, tipo) { try { return (typeof pillOn === 'function') ? pillOn(valv, tipo) : 'SIN pillOn' }
    catch(e) { return 'EXC' } },
  listo() { return { listo: typeof calcIP === 'function' && typeof guardarInforme === 'function'
                            && typeof pdfDeInformeGuardado === 'function' } },

  /* LOS CUATRO TEXTOS DE LA MEDICION A, en un solo lugar: las dos FILAS (span, las escribe solo
     calcIP) y los dos CAMPOS (input, los barre guardarInforme). */
  cuatro() {
    return {
      papm_row:  window.__P.txt('ip-papm-row'),
      papd_row:  window.__P.txt('ip-papd-row'),
      ip_papd:   window.__P.val('ip_papd'),
      pmad_disp: window.__P.val('ip_pmad_display')
    } },

  /* La fila del Excel por el emisor REAL. No genera el .xlsx. */
  excel() {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    var campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return } catch(e){}
      campos[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      campos[el.id + '__chk'] = el.checked ? '1' : '0' });
    try {
      var r = _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-08', campos: campos });
      return { n: Object.keys(r).length, papm: r['Grad VD-AD (mmHg)'] === undefined ? null : r['Grad VD-AD (mmHg)'],
               ipClaves: Object.keys(r).filter(function(k){ return /PAP|IP /i.test(k) })
                 .reduce(function(o,k){ o[k] = r[k]; return o }, {}) };
    } catch(e) { return 'EXC: ' + e.message }
  },

  /* PPT, LABORATORIO y EVIDENCIA: las tres superficies que faltaban en la condicion 3 de Maicol.
     El PPT por su propio selector (_pptSel devuelve el TEXTO cuando el nodo es un select); el
     Laboratorio por su contador real sobre los informes GUARDADOS, que es donde vive; el panel
     contando secciones y filas por IND_SECS, el mismo metodo que usa _probe_etbin. */
  ppt() {
    if (typeof _pptSel !== 'function') return 'SIN _pptSel';
    var o = {};
    ['ip_grado','ep_grado','ip_etiologia','it_grado','et_grado','em_grado','ea_grado'].forEach(function(id){
      try { o[id] = _pptSel(id) } catch(e) { o[id] = 'EXC' } });
    return o },

  lab() {
    if (typeof _labValvCounts !== 'function') return 'SIN _labValvCounts';
    try {
      var infs = (typeof getInformes === 'function') ? getInformes() : [];
      var c = _labValvCounts(infs);
      return { n: infs.length, counts: JSON.parse(JSON.stringify(c)) };
    } catch(e) { return 'EXC: ' + e.message }
  },

  evidencia() {
    if (typeof IND_SECS === 'undefined') return 'SIN IND_SECS';
    var secs = 0, filas = 0, titulos = [];
    IND_SECS.forEach(function(sec){
      var r = null;
      try { r = sec.fn() } catch(e) { r = { err: e.message } }
      if (!r) return;
      if (r.err) { titulos.push(sec.titulo + ':ERR'); return }
      var fs = r.filas || r.rows || [];
      if (fs.length || r.txt || r.nota) { secs++; filas += fs.length; titulos.push(sec.titulo) }
    });
    return { secciones: secs, filas: filas, titulos: titulos } },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  /* Las OCHO pastillas + los grados: control negativo de las dos partes. */
  valvulas() {
    var out = { grados: {}, pills: {} };
    ['im_sev_final','im_grado','em_grado','ia_sev_final','ia_grado','ea_grado',
     'it_grado','et_grado','ip_grado','ep_grado',
     'vm_morf','va_morf','vt_morf','vp_morf'].forEach(function(id){
      out.grados[id] = window.__P.val(id) });
    ['mitral','aortica','tricuspide','pulmonar'].forEach(function(v){
      ['insuf','esten'].forEach(function(t){ out.pills[v + '/' + t] = window.__P.pill(v,t) }) });
    return out },

  /* LOS DOS SETS, por window —el const esta en zona muerta desde fuera— mas las claves de
     localStorage que los acompanian. Es la foto de la medicion C. */
  sets() {
    var s = function(n){ try { var x = window[n]; return x ? Array.from(x).sort() : 'UNDEF' }
                         catch(e) { return 'EXC' } };
    var ls = {};
    ['mitral','aortica','tricuspide','pulmonar'].forEach(function(v){
      ['insuf','esten'].forEach(function(t){
        try { ls[t + '-' + v] = localStorage.getItem('valv-pill-' + t + '-' + v) }
        catch(e) { ls[t + '-' + v] = 'EXC' } }) });
    return { insufAuto: s('VALV_INSUF_AUTO'), estenAuto: s('VALV_ESTEN_AUTO'), ls: ls,
             manual: (function(){ try { return Object.keys(window.esqSevManual||{}).sort() }
                                  catch(e) { return 'EXC' } })() } },

  paciente(n, ci) {
    window.__P.set('nombre', n || 'Paciente Sonda');
    window.__P.set('ci', ci || '11111111');
    window.__P.set('fecha', '2026-10-08');
    return true },

  /* EL ESCENARIO DE IP del camino del medico: las dos velocidades mas la VCI que da la PmAD. */
  cargarIP() {
    /* La PmAD necesita DIAMETRO Y COLAPSO: con solo el diametro, calcPmAD sale por su guarda y
       las dos filas salen con el sufijo «(sin PmAD)», que es otra rama de calcIP. 18 mm con
       colapso mayor al 50 % da 3 mmHg, que es la escena del comentario de la app. */
    window.__P.set('vci_diam', 18);
    window.__P.set('vci_col', '>50');
    window.__P.set('ip_vmax', 2.5);
    window.__P.set('ip_vtd', 1.8);
    return { pmad: window.__P.val('pmad'), vmax: window.__P.val('ip_vmax'),
             vtd: window.__P.val('ip_vtd') } },

  limpiar() { try { limpiarCampos(true) } catch(e) { return 'EXC: ' + e.message } return true }
};
'ok'
`;

const md5 = async (p) => createHash('md5').update(await readFile(p)).digest('hex');

async function main() {
  const antes = await md5(join(RAIZ, 'index.html'));
  const { srv, port } = await servir();
  const { proc, perfil, wsUrl } = await abrirChrome(`http://127.0.0.1:${port}/${FILE}`);
  const cdp = await conectar(wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const t = targetInfos.find((x) => x.type === 'page' && x.url.includes('127.0.0.1'));
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  /* Ninguna escena descarga nada —el `accion` propio reemplaza al generador de PDF—, pero si
     alguna ruta igual intentara, se deniega en vez de escribir en el disco del usuario. */
  try { await cdp.send('Page.setDownloadBehavior', { behavior: 'deny' }, sessionId); } catch {}

  for (let i = 0; i < 60; i++) {
    try { await ev0(SONDA); const l = await ev0('JSON.stringify(window.__P.listo())');
      if (JSON.parse(l).listo) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  async function ev0(expr) {
    const r = await cdp.send('Runtime.evaluate',
      { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'exc');
    return r.result.value;
  }
  const ev = ev0;
  const listo = JSON.parse(await ev('JSON.stringify(window.__P.listo())'));
  const consolaAlCargar = cdp.errores.slice();

  /* ══ A · CAMINO DIRECTO ═══════════════════════════════════════════════════════════════════
     El patron de referencia: el medico carga la IP y mira la pantalla, sin guardar ni reabrir. */
  const A_directo = JSON.parse(await ev(`(function(){
    window.__P.limpiar();
    window.__P.paciente('Directo','20000001');
    var carga = window.__P.cargarIP();
    return JSON.stringify({ carga: carga, cuatro: window.__P.cuatro(),
      informe: window.__P.informe('estandar'),
      informeAmpliado: window.__P.informe('ampliado'),
      excel: window.__P.excel(), valvulas: window.__P.valvulas(),
      ppt: window.__P.ppt(), lab: window.__P.lab(), evidencia: window.__P.evidencia(),
      sets: window.__P.sets() });
  })()`));

  /* ══ A · LAS DOS FASES DE LA REIMPRESION ══════════════════════════════════════════════════
     Se guarda el estudio por el emisor real, se hace «Nuevo estudio», y se reimprime pasando un
     `accion` propio —mismo contrato que el boton de PPT—. El `accion` corre DENTRO de la ventana
     de reimpresion, o sea en la fase de CARGA: ahi se mide lo que el PDF y el Excel leerian.
     Despues se espera el cierre (setTimeout de 600 ms en la app) y se mide la PANTALLA, que es
     la fase de RESTAURACION. */
  const A_reimpresion = JSON.parse(await ev(`(async function(){
    var out = {};
    window.__P.limpiar();
    window.__P.paciente('ConIP','20000002');
    window.__P.cargarIP();
    out.antesDeGuardar = { cuatro: window.__P.cuatro(), informe: window.__P.informe('estandar'),
                           excel: window.__P.excel() };

    /* Guardado por el emisor REAL. El modal de severidades valvulares lo confirma el MEDICO con
       un clic; aca se reemplaza el que lo muestra por uno que llama al callback en el acto, que
       es ese mismo clic sin la espera. valvSevConfirmada es un let de modulo y no se puede tocar
       desde fuera, asi que asignarle a window no hacia nada: el primer intento se colgo en el
       timeout de 8 s y guardo CERO estudios, con el ABORTA de la sonda diciendolo. */
    var _cardOrig = window.mostrarCardSeveridadValvular;
    window.mostrarCardSeveridadValvular = function(cb){ if (cb) cb() };
    var guardado = await new Promise(function(ok){
      var t = setTimeout(function(){ ok({ to: true }) }, 8000);
      try { guardarInforme(function(){ clearTimeout(t); ok({ ok: true }) }) }
      catch(e) { clearTimeout(t); ok({ err: e.message }) }
    });
    window.mostrarCardSeveridadValvular = _cardOrig;
    var infs = (typeof getInformes === 'function') ? getInformes() : [];
    out.guardado = { res: guardado, n: infs.length,
                     id: infs.length ? infs[infs.length-1].id : null };
    if (!infs.length) { out.ABORTA = 'no se guardo ningun estudio'; return JSON.stringify(out) }
    var id = infs[infs.length-1].id;

    /* «Nuevo estudio»: el medico pasa al paciente siguiente, que en esta escena esta VACIO. */
    window.__P.limpiar();
    out.trasNuevoEstudio = { cuatro: window.__P.cuatro(), informe: window.__P.informe('estandar'),
                             pills: window.__P.valvulas().pills, sets: window.__P.sets(),
                             ip_grado: window.__P.val('ip_grado') };

    /* FASE DE CARGA. El callback accion se ejecuta con el formulario poblado con el guardado. */
    var dentro = null;
    var listoRestaurar = new Promise(function(ok){
      pdfDeInformeGuardado(id, function(){
        dentro = { cuatro: window.__P.cuatro(), informe: window.__P.informe('estandar'),
                   excel: window.__P.excel(), campos: {
                     ip_vmax: window.__P.val('ip_vmax'), ip_vtd: window.__P.val('ip_vtd'),
                     pmad: window.__P.val('pmad'), nombre: window.__P.val('nombre') } };
      }, 'PDF');
      /* El cierre corre en un setTimeout de 600 ms; se le da margen y despues se mide. */
      setTimeout(ok, 2500);
    });
    await listoRestaurar;
    out.faseCarga = dentro;

    /* FASE DE RESTAURACION: el medico volvio a su paciente —vacio— y mira la pantalla. */
    out.trasRestaurar = { cuatro: window.__P.cuatro(), informe: window.__P.informe('estandar'),
                          excel: window.__P.excel(), campos: {
                            ip_vmax: window.__P.val('ip_vmax'), ip_vtd: window.__P.val('ip_vtd'),
                            pmad: window.__P.val('pmad'), nombre: window.__P.val('nombre') },
                          pills: window.__P.valvulas().pills, sets: window.__P.sets(),
                          ip_grado: window.__P.val('ip_grado') };
    return JSON.stringify(out);
  })()`));

  /* Lo mismo pero con un paciente B que SI tiene datos propios y NINGUNA IP: es la escena en la
     que una fila heredada del estudio reimpreso se lee como un dato del paciente en pantalla. */
  const A_reimpresion_conB = JSON.parse(await ev(`(async function(){
    var out = {};
    var infs = (typeof getInformes === 'function') ? getInformes() : [];
    if (!infs.length) { out.ABORTA = 'sin estudios guardados'; return JSON.stringify(out) }
    var id = infs[infs.length-1].id;
    window.__P.limpiar();
    window.__P.paciente('SinIP','20000003');
    window.__P.set('vci_diam', 14);
    out.antes = { cuatro: window.__P.cuatro(), informe: window.__P.informe('estandar'),
                  pills: window.__P.valvulas().pills, sets: window.__P.sets(),
                  ip_grado: window.__P.val('ip_grado') };
    await new Promise(function(ok){
      pdfDeInformeGuardado(id, function(){}, 'PDF');
      setTimeout(ok, 2500);
    });
    out.despues = { cuatro: window.__P.cuatro(), informe: window.__P.informe('estandar'),
                    excel: window.__P.excel(), campos: {
                      ip_vmax: window.__P.val('ip_vmax'), ip_vtd: window.__P.val('ip_vtd'),
                      pmad: window.__P.val('pmad'), nombre: window.__P.val('nombre') },
                    pills: window.__P.valvulas().pills, sets: window.__P.sets(),
                    ip_grado: window.__P.val('ip_grado') };
    return JSON.stringify(out);
  })()`));

  /* ══ A · CONTROL NEGATIVO ═════════════════════════════════════════════════════════════════
     Un estudio guardado SIN IP, reimpreso sobre un paciente que tampoco la tiene: nada tiene que
     moverse. Sin esto, la sonda podria estar diciendo que si a todo —cualquier reimpresion
     «ensucia»— en vez de distinguir el escenario en el que el dato ajeno viaja. */
  const A_controlNegativo = JSON.parse(await ev(`(async function(){
    var out = {};
    window.__P.limpiar();
    window.__P.paciente('SinIPguardado','20000004');
    window.__P.set('vi_dd', 48);            // un dato cualquiera que NO es de la pulmonar
    var _cardOrig = window.mostrarCardSeveridadValvular;
    window.mostrarCardSeveridadValvular = function(cb){ if (cb) cb() };
    var g = await new Promise(function(ok){
      var t = setTimeout(function(){ ok({ to: true }) }, 8000);
      try { guardarInforme(function(){ clearTimeout(t); ok({ ok: true }) }) }
      catch(e) { clearTimeout(t); ok({ err: e.message }) }
    });
    window.mostrarCardSeveridadValvular = _cardOrig;
    var infs = (typeof getInformes === 'function') ? getInformes() : [];
    var mio = infs.filter(function(i){ return i.nombre === 'SinIPguardado' });
    out.guardado = { res: g, n: infs.length, mios: mio.length };
    if (!mio.length) { out.ABORTA = 'no se guardo el estudio sin IP'; return JSON.stringify(out) }

    window.__P.limpiar();
    window.__P.paciente('OtroSinIP','20000005');
    window.__P.set('vci_diam', 14);
    out.antes = { cuatro: window.__P.cuatro(), informe: window.__P.informe('estandar'),
                  pills: window.__P.valvulas().pills, sets: window.__P.sets(),
                  excel: window.__P.excel() };
    await new Promise(function(ok){
      pdfDeInformeGuardado(mio[0].id, function(){}, 'PDF');
      setTimeout(ok, 2500);
    });
    out.despues = { cuatro: window.__P.cuatro(), informe: window.__P.informe('estandar'),
                    pills: window.__P.valvulas().pills, sets: window.__P.sets(),
                    excel: window.__P.excel() };
    out.identico = JSON.stringify(out.antes) === JSON.stringify(out.despues);
    return JSON.stringify(out);
  })()`));

  /* ══ A · LAS CUATRO ESCENAS QUE PIDIO MAICOL AL AUTORIZAR LA LINEA (2026-10-08) ═══════════
     E1 es la que importa mas: el riesgo del arreglo no es que apague de mas una IP ajena, es que
     apague la IP PROPIA del paciente que esta en pantalla. Las otras tres son sus controles. */
  const A_escenas = JSON.parse(await ev(`(async function(){
    var out = {};
    var cardOff = function(){ var o = window.mostrarCardSeveridadValvular;
      window.mostrarCardSeveridadValvular = function(cb){ if (cb) cb() }; return o };
    var guardar = async function(nom, ci, pasos){
      window.__P.limpiar();
      window.__P.paciente(nom, ci);
      pasos();
      var o = cardOff();
      var g = await new Promise(function(ok){
        var t = setTimeout(function(){ ok({ to: true }) }, 8000);
        try { guardarInforme(function(){ clearTimeout(t); ok({ ok: true }) }) }
        catch(e) { clearTimeout(t); ok({ err: e.message }) }
      });
      window.mostrarCardSeveridadValvular = o;
      var infs = (typeof getInformes === 'function') ? getInformes() : [];
      var mio = infs.filter(function(i){ return i.nombre === nom });
      return { g: g, id: mio.length ? mio[mio.length-1].id : null };
    };
    var foto = function(){
      return { cuatro: window.__P.cuatro(), informe: window.__P.informe('estandar'),
               pill: window.__P.pill('pulmonar','insuf'), ip_grado: window.__P.val('ip_grado'),
               sets: window.__P.sets(), excel: window.__P.excel().n,
               campos: { ip_vmax: window.__P.val('ip_vmax'), ip_vtd: window.__P.val('ip_vtd'),
                         pmad: window.__P.val('pmad'), nombre: window.__P.val('nombre') } };
    };
    var reimprimir = async function(id){
      await new Promise(function(ok){ pdfDeInformeGuardado(id, function(){}, 'PDF');
                                      setTimeout(ok, 2500) });
    };

    /* Un estudio SIN nada de pulmonar, para reimprimirlo encima de un paciente que SI tiene IP. */
    var sinIP = await guardar('E_sinIP', '40000001', function(){ window.__P.set('vi_dd', 48) });
    out.sinIP_guardado = sinIP.g; out.sinIP_id = sinIP.id;
    /* Y uno CON las dos velocidades, para los controles (a) y (c). */
    var conIP = await guardar('E_conIP', '40000002', function(){ window.__P.cargarIP() });
    out.conIP_guardado = conIP.g; out.conIP_id = conIP.id;
    if (!sinIP.id || !conIP.id) { out.ABORTA = 'falto guardar un estudio'; return JSON.stringify(out) }

    /* ── E1 · paciente anterior CON IP, reimpresion de un estudio SIN IP ──────────────────── */
    window.__P.limpiar();
    window.__P.paciente('E1_tieneIP', '40000011');
    window.__P.cargarIP();
    out.e1_antes = foto();
    await reimprimir(sinIP.id);
    out.e1_despues = foto();

    /* ── E2 · control (a): el estudio reimpreso SI tiene IP. La fase de CARGA es lo que ve el
       PDF, y se captura desde el callback accion, que corre ahi adentro. ────────────────────── */
    window.__P.limpiar();
    window.__P.paciente('E2_vacio', '40000012');
    out.e2_antes = foto();
    var dentro = null;
    await new Promise(function(ok){
      pdfDeInformeGuardado(conIP.id, function(){ dentro = foto() }, 'PDF');
      setTimeout(ok, 2500);
    });
    out.e2_faseCarga = dentro;
    out.e2_despues = foto();

    /* ── E3 · control (b): el paciente EN PANTALLA tiene la pastilla prendida por el MEDICO y un
       grado elegido a mano. Reimprimir otro estudio no puede llevarselos. ──────────────────── */
    window.__P.limpiar();
    window.__P.paciente('E3_manual', '40000013');
    try { toggleValvPill('pulmonar','insuf') } catch(e) { out.e3_err = e.message }
    window.__P.set('ip_grado', 'Moderada');
    out.e3_antes = foto();
    await reimprimir(sinIP.id);
    out.e3_despues = foto();
    /* Y la segunda mitad del mismo control: reimprimir el que SI tiene IP tampoco se los lleva. */
    await reimprimir(conIP.id);
    out.e3_despues2 = foto();

    /* ── E4 · control (c): la pastilla la APAGO el medico (clave en 0). Reimprimir un estudio con
       IP no puede reprenderla. ─────────────────────────────────────────────────────────────── */
    window.__P.limpiar();
    window.__P.paciente('E4_apagada', '40000014');
    try { toggleValvPill('pulmonar','insuf') } catch(e){}   // prende
    try { toggleValvPill('pulmonar','insuf') } catch(e){}   // apaga: deja la clave en 0
    out.e4_antes = foto();
    await reimprimir(conIP.id);
    out.e4_despues = foto();
    return JSON.stringify(out);
  })()`));

  /* ══ C · EL REGISTRO DE «QUIEN PRENDIO EL BOTON» ═══════════════════════════════════════════
     Cinco escenas. Las tres primeras son la secuencia del pedido para la INSUFICIENCIA pulmonar;
     las dos ultimas repiten con la ESTENOSIS (tricuspide y mitral). */
  const C = JSON.parse(await ev(`(function(){
    var out = {};

    /* C1 · la app prende la IP y el Set la nombra. */
    window.__P.limpiar();
    window.__P.paciente('C1','30000001');
    window.__P.set('ip_vmax', 2.5);
    out.c1_appPrende = { sets: window.__P.sets(), pill: window.__P.pill('pulmonar','insuf') };

    /* C2 · «Nuevo estudio»: la pastilla se apaga y las claves se borran. Queda el Set sucio? */
    window.__P.limpiar();
    out.c2_trasNuevo = { sets: window.__P.sets(), pill: window.__P.pill('pulmonar','insuf') };

    /* C3 · el MEDICO prende la pastilla a mano sobre el estudio nuevo, y despues se borra la
       causa que hubiera. Si el Set sucio sobrevive al gesto manual, la app apaga lo del medico. */
    try { toggleValvPill('pulmonar','insuf') } catch(e) { out.c3_err = e.message }
    out.c3_medicoPrende = { sets: window.__P.sets(), pill: window.__P.pill('pulmonar','insuf') };
    /* La causa: se carga y se borra una velocidad, que es lo que llama a _ipApagarAuto. */
    window.__P.set('ip_vmax', 2.5);
    out.c3_conCausa = { sets: window.__P.sets(), pill: window.__P.pill('pulmonar','insuf') };
    window.__P.set('ip_vmax', '');
    out.c3_sinCausa = { sets: window.__P.sets(), pill: window.__P.pill('pulmonar','insuf'),
                        informe: window.__P.informe('estandar') };

    /* C4 · LA ESCENA QUE PIDE LA ORDEN: Set sucio por la app y pastilla prendida SIN pasar por
       toggleValvPill. Se fuerza a mano para ver si el agujero EXISTE aunque la app no lo alcance:
       es la diferencia entre «no es alcanzable» y «no existe». */
    window.__P.limpiar();
    window.__P.paciente('C4','30000004');
    window.__P.set('ip_vmax', 2.5);               // la app prende: Set = {pulmonar}
    window.__P.limpiar();                          // Nuevo estudio: Set queda sucio
    out.c4_setSucio = window.__P.sets();
    /* El medico prende a mano. En la app esto pasa SIEMPRE por toggleValvPill (cargarValvPills
       y valvSev lo usan), y la cola de toggleValvPill vacia el Set. Se mide si es asi. */
    try { toggleValvPill('pulmonar','insuf') } catch(e){}
    out.c4_trasToggle = { sets: window.__P.sets(), pill: window.__P.pill('pulmonar','insuf') };

    /* C5 · ESTENOSIS: tricuspide y mitral, el mismo vaiven. */
    window.__P.limpiar();
    window.__P.paciente('C5','30000005');
    window.__P.set('et_gmedio', 7);                // prende la ET por el gradiente
    out.c5_etPrende = { sets: window.__P.sets(), pill: window.__P.pill('tricuspide','esten'),
                        et_grado: window.__P.val('et_grado') };
    window.__P.limpiar();
    out.c5_trasNuevo = { sets: window.__P.sets(), pill: window.__P.pill('tricuspide','esten') };
    try { toggleValvPill('tricuspide','esten') } catch(e){}
    out.c5_medicoPrende = { sets: window.__P.sets(), pill: window.__P.pill('tricuspide','esten') };
    window.__P.set('et_gmedio', 7);
    window.__P.set('et_gmedio', '');
    out.c5_sinCausa = { sets: window.__P.sets(), pill: window.__P.pill('tricuspide','esten'),
                        et_grado: window.__P.val('et_grado') };

    /* CONTROL NEGATIVO: ninguna escena toca mitral ni aortica. */
    window.__P.limpiar();
    out.controlNegativo = window.__P.valvulas();
    return JSON.stringify(out);
  })()`));

  /* ══ CONDICION 3 CON DENOMINADOR DE VERDAD ════════════════════════════════════════════════
     La primera version de esta medicion comparo el Laboratorio y el panel de Evidencia sobre el
     camino directo y los dio «identicos» — pero el store estaba VACIO (n=0) y el panel en cero
     secciones, asi que ese identico no probaba nada: es el denominador que este repo documenta
     como trampa. Aca se mide con estudios YA guardados por las escenas de arriba y con un
     escenario que el panel SI ve (el gradiente medio de la ET llena su seccion). */
  const A_denominador = JSON.parse(await ev(`(function(){
    var out = {};
    /* LABORATORIO: cuenta sobre los informes guardados, que a esta altura son varios. */
    var infs = (typeof getInformes === 'function') ? getInformes() : [];
    out.lab = window.__P.lab();
    out.labDenominador = { estudios: infs.length,
                           nombres: infs.map(function(i){ return i.nombre }).sort() };

    /* EVIDENCIA con denominador: el gradiente medio de la ET llena su seccion del panel. */
    window.__P.limpiar();
    window.__P.paciente('Panel','50000001');
    window.__P.set('et_gmedio', 8);
    out.evidenciaConET = window.__P.evidencia();
    /* Y con la IP cargada encima, para ver si el panel la mira. */
    window.__P.cargarIP();
    out.evidenciaConETyIP = window.__P.evidencia();
    /* Control: el formulario vacio. Si da lo mismo que arriba, el panel no vio nada y el
       denominador sigue siendo falso. */
    window.__P.limpiar();
    out.evidenciaVacio = window.__P.evidencia();

    /* PPT y Excel del camino directo, repetidos aca con la IP cargada. */
    window.__P.limpiar();
    window.__P.paciente('Directo2','50000002');
    window.__P.cargarIP();
    out.pptConIP = window.__P.ppt();
    out.excelConIP = window.__P.excel();
    out.informeConIP = window.__P.informe('estandar');
    return JSON.stringify(out);
  })()`));

  /* ══ Maquetacion a 1200 / 390 / 360 px: las dos filas tienen que caber sin desborde. ══ */
  const layout = {};
  for (const w of [1200, 390, 360]) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 500 }, sessionId);
    await new Promise((r) => setTimeout(r, 400));
    layout[w] = JSON.parse(await ev(`(function(){
      window.__P.limpiar(); window.__P.cargarIP();
      var r = ['ip-papm-row','ip-papd-row'].map(function(id){
        var e = document.getElementById(id);
        if (!e) return { id: id, falta: true };
        var b = e.getBoundingClientRect();
        return { id: id, txt: (e.textContent||'').trim(),
                 desborda: Math.round(b.right) > ${w},
                 scrollX: e.scrollWidth > e.clientWidth + 1 };
      });
      return JSON.stringify({ filas: r,
        barraHorizontal: document.documentElement.scrollWidth > ${w} + 1,
        scrollWidth: document.documentElement.scrollWidth });
    })()`));
  }
  try { await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId); } catch {}

  const despues = await md5(join(RAIZ, 'index.html'));
  console.log(JSON.stringify({
    archivo: FARG, md5_index_antes: antes, md5_index_despues: despues,
    index_intacto: antes === despues, listo, consolaAlCargar,
    consolaTotal: cdp.errores.slice(), sinErroresDeConsola: cdp.errores.length === 0,
    A_directo, A_reimpresion, A_reimpresion_conB, A_controlNegativo, A_escenas, A_denominador, C, layout,
  }, null, 2));

  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
