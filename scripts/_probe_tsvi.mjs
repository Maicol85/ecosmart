#!/usr/bin/env node
/**
 * _probe_tsvi.mjs — sonda A/B de SOLO LECTURA para
 *   (A) el Diam. del TSVI coordinado entre AI/VI, Doppler (oculto) y Valvulas aortica, y
 *   (B) la Vmax IAo CW (unidad, EROA por PISA, Vol-R, FR, grado).
 *
 * No muta index.html: comprueba su md5 al principio y al final.
 *
 * Se corre DOS veces y se diffean los JSON:
 *   node scripts/_probe_tsvi.mjs --file /tmp/index.HEAD.html > /tmp/ts.HEAD.json
 *   node scripts/_probe_tsvi.mjs                             > /tmp/ts.NEW.json
 *
 * Como _probe_itvmax.mjs, la Vmax IAo se carga con el MISMO DATO FISICO en los dos lados: la
 * sonda lee la unidad que declara el placeholder del campo y teclea el numero que corresponde.
 *
 * Infraestructura (servidor + Chrome + CDP) calcada de scripts/_probe_itvmax.mjs.
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
  '/usr/bin/google-chrome', '/usr/bin/chromium',
];
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css',
               '.json':'application/json', '.png':'image/png', '.svg':'image/svg+xml' };

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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-ts-'));
  let bin = null;
  for (const c of CHROMES) { try { await readFile(c); bin = c; break; } catch {} }
  if (!bin) throw new Error('No encontre Chrome/Chromium.');
  const args = ['--remote-debugging-port=0', `--user-data-dir=${perfil}`, '--no-first-run',
                '--no-default-browser-check', '--disable-extensions',
                '--window-size=1400,1000', url];
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

/* ══ Sonda inyectada ══════════════════════════════════════════════════════════════════════════
   CUERPO DE TEMPLATE LITERAL: NI UN ACENTO GRAVE adentro, tampoco en los comentarios. */
const SONDA = `
window.__V = {
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  html(id){ var e = document.getElementById(id); return e ? (e.innerHTML || '').trim() : null },
  place(id){ var e = document.getElementById(id); return e ? e.placeholder : null },
  step(id){ var e = document.getElementById(id); return e ? e.getAttribute('step') : null },
  oninput(id){ var e = document.getElementById(id); return e ? (e.getAttribute('oninput')||'') : null },
  lbl(id) { var e = document.getElementById(id);
    var l = e && e.parentNode ? e.parentNode.querySelector('label') : null;
    return l ? l.textContent.trim().replace(/\\s+/g,' ') : null },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  pill(v, t) { try { return (typeof pillOn === 'function') ? pillOn(v, t) : 'SIN pillOn' }
    catch(e) { return 'EXC' } },

  /* UNIDAD DECLARADA POR EL PROPIO CAMPO: permite cargar el mismo PACIENTE en los dos lados. */
  unidadIaCW() { var e = document.getElementById('ia_vmax_cw');
    return e ? String(e.placeholder || '').trim() : null },
  iacw(ms) { return this.unidadIaCW() === 'cm/s' ? ms * 100 : ms },

  /* En CELULAR los cajones «Datos» arrancan plegados —el CSS esconde la flecha a mas de 768 px—
     asi que medir ahi sin abrirlos da ancho 0 y parece que nada desborda. */
  abrirCajones() {
    ['caja-esten-aortica','caja-insuf-aortica'].forEach(function(c){
      var b = document.getElementById(c);
      if (b && !b.classList.contains('valv-datos-abierto')) { try { valvDatosTog(c) } catch(e){} }
    });
    return { esten: this.vis('bloque-ea-detalle'), insuf: this.vis('bloque-insuf-aortica') } },

  abrirValvs() {
    try { showTab('valvulas') } catch(e) {}
    var toks = ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'];
    toks.forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && s.style.display === 'none') { try { toggleEteSeccion(tok) } catch(e) {} }
    });
    ['aortica','mitral'].forEach(function(v){ ['esten','insuf'].forEach(function(t){
      var p = document.getElementById('pill-' + t + '-' + v);
      if (p && !p.classList.contains('btn-primary')) { try { toggleValvPill(v,t) } catch(e){} }
    })});
    var vis = function(id){ var e = document.getElementById(id);
      return !!e && getComputedStyle(e).display !== 'none' };
    return { tab: vis('tab-valvulas'), secciones: toks.filter(function(t){
      return vis('ete-seccion-' + t) }).length,
      bloqueEA: vis('bloque-ea-detalle'), bloqueIA: vis('bloque-ia-detalle') } },

  limpiar() {
    try { limpiarCampos(true) } catch(e) {}
    window.esqSevManual = {}; window._sevCalcAlFijar = {};
    ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){
        try { localStorage.removeItem('valv-pill-' + t + '-' + v) } catch(e){}
        try { if (window.__V.pill(v,t) === true) toggleValvPill(v,t) } catch(e){}
      });
    });
    return 1 },

  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value } },

  /* FOTO DEL TSVI — los TRES lugares, los cinco calculos del Doppler aortico, los dos espejos
     mitrales, el bloque de Valvulas, Hemodinamica y el cuadro de referencias. */
  fotoTsvi() {
    return {
      /* los tres lugares */
      aivi: this.val('diam_tsvi_ao'), doppler: this.val('diam_tsvi'), valv: this.val('ea_dtsvi'),
      /* Doppler aortico */
      vs_val: this.txt('vs-val'), vs_calc: this.val('vs_calc'),
      ava_cont: this.val('ava_cont'), ava_idx: this.txt('ava-idx'),
      dvi: this.txt('dvi-val'), vli: this.val('vli_calc'), vli_int: this.txt('vli-interp'),
      /* cuadro de referencias del Doppler aortico */
      ref_vs: this.html('ao-ref-vs'), ref_ava: this.html('ao-ref-ava'),
      ref_vli: this.html('ao-ref-vli'), ref_gc: this.html('ao-ref-gc'),
      ref_ic: this.html('ao-ref-ic'),
      /* Valvulas aortica */
      ea_dvi: this.val('ea_dvi_display'), ea_ava: this.val('ea_ava_display'),
      ea_gmax: this.val('ea_gmax_display'), ea_badge: this.txt('ea-ava-badge'),
      ea_grado: this.val('ea_grado'),
      ea_vmax: this.val('ea_vmax'), ea_gmedio: this.val('ea_gmedio'),
      ea_vtitsvi: this.val('ea_vtitsvi'), ea_vtiao: this.val('ea_vtiao'),
      g_vmax: this.val('vmax_ao'), g_gmedio: this.val('gmedio_ao'),
      g_vtitsvi: this.val('itv_tsvi'), g_vtiao: this.val('itv_ao'),
      /* espejos mitrales */
      em_dtsvi: this.val('em_dtsvi'), im_dtsvi: this.val('im_dtsvi'),
      /* Hemodinamica */
      hemo_gc: this.txt('hemo-gc'), hemo_ic: this.txt('hemo-ic'),
      hemo_rvs: this.txt('hemo-rvs'), hemo_rvp: this.txt('hemo-rvp'),
      hemo_pcp: this.txt('hemo-pcp'), hemo_gtp: this.txt('hemo-gtp'),
      /* otros consumidores del dato */
      cx_gtp_dtsvi: this.val('cx_gtp_dtsvi'),
      cajon: this.txt('tsvi-estimado-box')
    } },

  /* FOTO DE LA IAo — las tres filas encadenadas del PISA, el grado y el campo. */
  fotoIa() {
    return {
      campo: this.val('ia_vmax_cw'),
      eroa: this.txt('ia-eroa'), volr: this.txt('ia-volr'), fr: this.txt('ia-fr'),
      sev: this.txt('ia-sev'), grado: this.val('ia_grado'),
      vc: this.txt('ia-vc-interp'), pill: this.pill('aortica','insuf')
    } },

  campos() {
    var c = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      c[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      c[el.id + '__chk'] = el.checked ? '1' : '0' });
    return c },

  excel() {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    var campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return } catch(e){}
      campos[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      campos[el.id + '__chk'] = el.checked ? '1' : '0' });
    try { return _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-07', campos: campos }) }
    catch(e) { return 'EXC: ' + e.message } },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  /* Oraciones del informe que hablan de la aortica (estenosis o insuficiencia). */
  frasesAo(texto) {
    var t = String(texto || '');
    return t.split(/\\n+/).map(function(s){ return s.trim() })
      .filter(function(s){ return s && /a[\\u00f3o]rtic|\\bEAo\\b|\\bIAo\\b|TSVI|AVA|DVI|DI /i.test(s) }) },

  listo() {
    var faltan = ['generarInforme','pillOn','toggleEteSeccion','showTab','limpiarCampos',
                  'calcAo','calcEADetalle','calcIA_ESC','calcHemo','syncTSVI',
                  'syncEADesdeValvulas','setEstiloInforme','_migrarCamposLegacy','editarInforme',
                  'mostrarTSVIEstimado','usarTSVIEstimado']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (faltan.length) return { listo:false, faltan:faltan };
    ['diam_tsvi_ao','diam_tsvi','ea_dtsvi','ia_vmax_cw'].forEach(function(id){
      if (!document.getElementById(id)) faltan.push('campo ' + id) });
    return faltan.length ? { listo:false, faltan:faltan } : { listo:true } }
};
'OK';
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

  const ev = async (expr) => {
    const r = await cdp.send('Runtime.evaluate',
      { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'exc');
    return r.result.value;
  };
  const J = async (expr) => JSON.parse(await ev(expr));

  for (let i = 0; i < 60; i++) {
    try { await ev(SONDA); const l = await ev('JSON.stringify(window.__V.listo())');
      if (JSON.parse(l).listo) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  const listo = await J('JSON.stringify(window.__V.listo())');

  /* ── Rotulos, unidades y cableado leidos del codigo VIVO ─────────────────────────────────── */
  const rotulos = await J(`JSON.stringify({
    aivi:    { lbl: window.__V.lbl('diam_tsvi_ao'), place: window.__V.place('diam_tsvi_ao'),
               oninput: window.__V.oninput('diam_tsvi_ao') },
    doppler: { lbl: window.__V.lbl('diam_tsvi'), place: window.__V.place('diam_tsvi'),
               oninput: window.__V.oninput('diam_tsvi'), vis: window.__V.vis('diam_tsvi') },
    valv:    { lbl: window.__V.lbl('ea_dtsvi'), place: window.__V.place('ea_dtsvi'),
               oninput: window.__V.oninput('ea_dtsvi') },
    iacw:    { lbl: window.__V.lbl('ia_vmax_cw'), place: window.__V.place('ia_vmax_cw'),
               step: window.__V.step('ia_vmax_cw'), oninput: window.__V.oninput('ia_vmax_cw') },
    iaval:   { lbl: window.__V.lbl('ia_pisa_val'), place: window.__V.place('ia_pisa_val') },
    banda_iacw: (function(){ try { return JSON.stringify(AO_BANDA_PLAUS.ia_vmax_cw) }
                             catch(e) { return 'EXC' } })(),
    banda_chm:  (function(){ try { return JSON.stringify(CHM_RANGO.ia_vmax_cw) }
                             catch(e) { return 'EXC' } })()
  })`);

  /* ── 1(c) · EL DEFECTO: cargar el O TSVI por cada puerta ──────────────────────────────────── */
  const esc = {};
  const escena = async (nombre, cuerpo) => {
    esc[nombre] = await J(`(function(){
      window.__V.limpiar();
      var ab = window.__V.abrirValvs();
      window.__V.set('nombre','TSVI'); window.__V.set('peso', 70); window.__V.set('talla', 170);
      window.__V.set('itv_tsvi', 20); window.__V.set('itv_ao', 24);
      window.__V.set('hemo_fc', 70); window.__V.set('hemo_pam', 90);
      ${cuerpo}
      var est = window.__V.informe('estandar');
      return JSON.stringify({ ab: ab, foto: window.__V.fotoTsvi(),
        frases: window.__V.frasesAo(est.inf), suma: est.suma });
    })()`);
  };

  await escena('A-por-Valvulas',  `window.__V.set('ea_dtsvi', 22);`);
  await escena('B-por-AIVI',      `window.__V.set('diam_tsvi_ao', 22);`);
  await escena('C-por-Doppler',   `window.__V.set('diam_tsvi', 22);`);
  await escena('D-borrar-Valv',   `window.__V.set('diam_tsvi_ao', 22); window.__V.set('ea_dtsvi', '');`);
  await escena('E-borrar-AIVI',   `window.__V.set('ea_dtsvi', 22); window.__V.set('diam_tsvi_ao', '');`);
  await escena('F-sin-diametro',  `/* CONTROL NEGATIVO: sin diametro, nada se calcula */`);
  await escena('G-cajon-estimado',`try { usarTSVIEstimado(20.6) } catch(e) {}`);

  /* Las dos pestanas VISIBLES a la vez no existen (son tabs), pero el DOM es uno: la escena H
     comprueba que el valor esta en los tres nodos sin importar que tab este al frente. */
  esc['H-tres-nodos-tras-Valvulas'] = await J(`(function(){
    window.__V.limpiar(); window.__V.abrirValvs();
    window.__V.set('itv_tsvi', 20); window.__V.set('itv_ao', 24);
    window.__V.set('ea_dtsvi', 22);
    try { showTab('ai-vi') } catch(e) {}
    var tras = window.__V.fotoTsvi();
    try { showTab('valvulas') } catch(e) {}
    return JSON.stringify({ trasCambiarTab: tras, vuelta: window.__V.fotoTsvi() });
  })()`);

  /* ── (d) · los campos de la mitral siguen al origen, por las TRES puertas ────────────────── */
  const mitral = await J(`(function(){
    var pru = function(id){
      window.__V.limpiar(); window.__V.abrirValvs();
      window.__V.set('itv_tsvi', 20); window.__V.set('itv_ao', 24);
      window.__V.set(id, 21);
      var a = { em: window.__V.val('em_dtsvi'), im: window.__V.val('im_dtsvi'),
                avm: window.__V.txt('em-avm-cont'), fr: window.__V.txt('im-fr') };
      /* corregir el ORIGEN tiene que refrescar el espejo, no congelarlo */
      window.__V.set(id, 25);
      var b = { em: window.__V.val('em_dtsvi'), im: window.__V.val('im_dtsvi') };
      /* el valor TIPEADO a mano en el espejo NO se pisa */
      window.__V.set('em_dtsvi', 30);
      window.__V.set(id, 27);
      var c = { em: window.__V.val('em_dtsvi'), origen: window.__V.val(id) };
      return { cargado: a, corregido: b, manual: c };
    };
    return JSON.stringify({ porAIVI: pru('diam_tsvi_ao'), porDoppler: pru('diam_tsvi'),
                            porValvulas: pru('ea_dtsvi') });
  })()`);

  /* ── (e) · la Vmax IAo CW: tres pacientes, MISMO dato fisico en los dos lados ─────────────── */
  const CASOS_IA = [
    { n: 'IA-1  r6 val38 Vmax4.5 vti120', r: 6, val: 38, ms: 4.5, vti: 120 },
    { n: 'IA-2  r4 val34 Vmax3.0 vti80',  r: 4, val: 34, ms: 3.0, vti: 80 },
    { n: 'IA-3  r9 val45 Vmax5.5 vti150', r: 9, val: 45, ms: 5.5, vti: 150 },
  ];
  const ia = {};
  for (const c of CASOS_IA) {
    ia[c.n] = await J(`(function(){
      window.__V.limpiar(); var ab = window.__V.abrirValvs();
      window.__V.set('nombre','IA'); window.__V.set('peso',70); window.__V.set('talla',170);
      window.__V.set('diam_tsvi_ao', 22); window.__V.set('itv_tsvi', 20); window.__V.set('itv_ao', 24);
      window.__V.set('ia_pisa_r', ${c.r}); window.__V.set('ia_pisa_val', ${c.val});
      window.__V.set('ia_vti', ${c.vti});
      window.__V.set('ia_vmax_cw', window.__V.iacw(${c.ms}));
      var est = window.__V.informe('estandar');
      return JSON.stringify({ unidad: window.__V.unidadIaCW(), bloqueIA: ab.bloqueIA,
        foto: window.__V.fotoIa(), frases: window.__V.frasesAo(est.inf), suma: est.suma,
        cols: (function(){ var r = window.__V.excel();
          return (typeof r === 'object') ? Object.keys(r).length : r })() });
    })()`);
  }

  /* Bordes de la banda de plausibilidad, en la unidad que declare el build. */
  const bordesIa = await J(`(function(){
    var out = {};
    [0.4, 0.5, 2.0, 8.0, 8.1].forEach(function(ms){
      window.__V.limpiar(); window.__V.abrirValvs();
      window.__V.set('ia_pisa_r', 6); window.__V.set('ia_pisa_val', 38); window.__V.set('ia_vti', 120);
      window.__V.set('ia_vmax_cw', window.__V.iacw(ms));
      out[String(ms) + ' m/s'] = { tecleado: window.__V.val('ia_vmax_cw'),
                                   eroa: window.__V.txt('ia-eroa'), sev: window.__V.txt('ia-sev'),
                                   grado: window.__V.val('ia_grado') };
    });
    return JSON.stringify(out);
  })()`);

  /* El normalizador de legado como FUNCION PURA. */
  const corteIa = await J(`(function(){
    var pr = function(v){ var o = { ia_vmax_cw: v };
      try { _migrarCamposLegacy(o) } catch(e) { return 'EXC ' + e.message }
      return o.ia_vmax_cw };
    return JSON.stringify({
      '0.5': pr('0.5'), '4.5': pr('4.5'), '8': pr('8'), '8.01': pr('8.01'),
      '50': pr('50'), '300': pr('300'), '450': pr('450'), '800': pr('800'),
      vacio: pr(''), basura: pr('abc'), coma: pr('450,5'), nulo: pr(null),
      sinClave: (function(){ var o = {}; try { _migrarCamposLegacy(o) } catch(e) {}
        return Object.prototype.hasOwnProperty.call(o, 'ia_vmax_cw') ? 'SE CREO' : 'no se creo' })()
    });
  })()`);

  /* ── Estudio guardado: con los tres lugares DISTINTOS y con la IAo en cm/s ────────────────── */
  const legado = await J(`(function(){
    window.__V.limpiar(); window.__V.abrirValvs();
    var campos = { nombre:'Legado', peso:'70', talla:'170',
      diam_tsvi_ao:'19', diam_tsvi:'21', ea_dtsvi:'23',
      itv_tsvi:'20', itv_ao:'24',
      ia_pisa_r:'6', ia_pisa_val:'38', ia_vti:'120', ia_vmax_cw:'450' };
    var inf = { id:'legado-tsvi', nombre:'Legado', ci:'9', fecha_estudio:'2026-09-01',
                campos: campos, informe_texto:'', en_suma:'' };
    var _orig = window.getInformes;
    window.getInformes = function(){ return [inf] };
    try {
      try { editarInforme('legado-tsvi') } catch(e) { return JSON.stringify({err:e.message}) }
      var ok = document.getElementById('edit-ok');
      if (!ok) return JSON.stringify({err:'sin overlay'});
      ok.click();
    } finally { window.getInformes = _orig; }
    window.__V.abrirValvs();
    try { calcAo() } catch(e) {}
    try { calcIA_ESC() } catch(e) {}
    var est = window.__V.informe('estandar');
    return JSON.stringify({ tsvi: window.__V.fotoTsvi(), ia: window.__V.fotoIa(),
      enDisco: { aivi: campos.diam_tsvi_ao, doppler: campos.diam_tsvi, valv: campos.ea_dtsvi,
                 iacw: campos.ia_vmax_cw },
      frases: window.__V.frasesAo(est.inf), suma: est.suma });
  })()`);

  /* ── Nuevo estudio limpia los tres lugares ───────────────────────────────────────────────── */
  const limpieza = await J(`(function(){
    window.__V.limpiar(); window.__V.abrirValvs();
    window.__V.set('itv_tsvi', 20); window.__V.set('itv_ao', 24);
    window.__V.set('diam_tsvi_ao', 22);
    window.__V.set('ia_vmax_cw', window.__V.iacw(4.5));
    var cargado = { tsvi: window.__V.fotoTsvi(), ia: window.__V.fotoIa() };
    try { limpiarCampos(true) } catch(e) {}
    return JSON.stringify({ cargado: cargado,
      limpio: { tsvi: window.__V.fotoTsvi(), ia: window.__V.fotoIa() } });
  })()`);

  /* ── Excel y campos guardados, con un paciente completo ──────────────────────────────────── */
  const xls = await J(`(function(){
    window.__V.limpiar(); window.__V.abrirValvs();
    window.__V.set('nombre','XLS'); window.__V.set('peso',70); window.__V.set('talla',170);
    window.__V.set('diam_tsvi_ao', 22); window.__V.set('itv_tsvi', 20); window.__V.set('itv_ao', 24);
    window.__V.set('vmax_ao', 4.2); window.__V.set('gmedio_ao', 45);
    window.__V.set('ia_pisa_r', 6); window.__V.set('ia_pisa_val', 38); window.__V.set('ia_vti', 120);
    window.__V.set('ia_vmax_cw', window.__V.iacw(4.5));
    window.__V.set('hemo_fc', 70); window.__V.set('hemo_pam', 90);
    var row = window.__V.excel();
    var e1 = window.__V.informe('estandar'), e2 = window.__V.informe('detallado');
    return JSON.stringify({ cols: (typeof row === 'object') ? Object.keys(row).length : row,
      row: row, campos: window.__V.campos(),
      estandar: { frases: window.__V.frasesAo(e1.inf), suma: e1.suma },
      detallado: { frases: window.__V.frasesAo(e2.inf), suma: e2.suma } });
  })()`);

  /* ── CAPTURA DE MAICOL: cargar 22 en AI/VI y DESPUES borrarlo en AI/VI ──────────────────── */
  const captura = await J(`(function(){
    window.__V.limpiar(); window.__V.abrirValvs(); window.__V.abrirCajones();
    window.__V.set('itv_tsvi', 20); window.__V.set('itv_ao', 24);
    window.__V.set('diam_tsvi_ao', 22);
    var cargado = window.__V.fotoTsvi();
    window.__V.set('diam_tsvi_ao', '');
    return JSON.stringify({ cargado: cargado, borrado: window.__V.fotoTsvi() });
  })()`);

  /* ── «Nuevo estudio» DE VERDAD (nuevoEstudio + su modal), no limpiarCampos pelado ────────── */
  const nuevo = await J(`(function(){
    window.__V.limpiar(); window.__V.abrirValvs(); window.__V.abrirCajones();
    window.__V.set('nombre','NE'); window.__V.set('itv_tsvi', 20); window.__V.set('itv_ao', 24);
    window.__V.set('diam_tsvi_ao', 22);
    var cargado = window.__V.fotoTsvi();
    var via = 'directo';
    try { nuevoEstudio() } catch(e) { return JSON.stringify({err:e.message}) }
    var m = document.getElementById('modal-nuevo-estudio');
    if (m && getComputedStyle(m).display !== 'none') {
      via = 'modal';
      try { neContinuarSinGuardar() } catch(e) { return JSON.stringify({err:'modal: '+e.message}) }
    }
    return JSON.stringify({ via: via, cargado: cargado, tras: window.__V.fotoTsvi() });
  })()`);

  /* ── (4, SOLO REPORTE) los otros CUATRO campos del bloque: tipear, borrar de un lado y del otro ── */
  const hermanos = await J(`(function(){
    var PARES = [ ['ea_vmax','vmax_ao', 4.2], ['ea_gmedio','gmedio_ao', 45],
                  ['ea_vtitsvi','itv_tsvi', 20], ['ea_vtiao','itv_ao', 24] ];
    var leer = function(a,b){ return { valv: window.__V.val(a), doppler: window.__V.val(b) } };
    var out = {};
    PARES.forEach(function(P){
      var a = P[0], b = P[1], val = P[2];
      var base = function(){
        window.__V.limpiar(); window.__V.abrirValvs(); window.__V.abrirCajones();
        window.__V.set('diam_tsvi_ao', 22);
        window.__V.set('itv_tsvi', 20); window.__V.set('itv_ao', 24);
      };
      /* 1 · tipear en VALVULAS */
      base(); window.__V.set(a, val);
      var tecleaValv = leer(a,b);
      /* 2 · y borrarlo DESDE VALVULAS */
      window.__V.set(a, '');
      var borraValv = leer(a,b);
      /* 3 · tipear en el DOPPLER */
      base(); window.__V.set(b, val);
      var tecleaDop = leer(a,b);
      /* 4 · y borrarlo DESDE EL DOPPLER */
      window.__V.set(b, '');
      var borraDop = leer(a,b);
      out[a + ' / ' + b] = { tecleaValv: tecleaValv, borraValv: borraValv,
                             tecleaDop: tecleaDop, borraDop: borraDop };
    });
    return JSON.stringify(out);
  })()`);

  /* ── Maquetacion: desborde a 1200, 390 y 360 px en AI/VI y en Valvulas aortica ───────────── */
  const movil = {};
  for (const w of [1200, 390, 360]) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: w, height: 900, deviceScaleFactor: 1, mobile: w <= 430 }, sessionId);
    await new Promise((r) => setTimeout(r, 300));
    movil[w] = await J(`(function(){
      window.__V.limpiar(); window.__V.abrirValvs();
      var caj = window.__V.abrirCajones();
      window.__V.set('diam_tsvi_ao', 22); window.__V.set('itv_tsvi', 20); window.__V.set('itv_ao', 24);
      window.__V.set('ia_vmax_cw', window.__V.iacw(4.5));
      var d = document.documentElement;
      var caja = function(id){ var e = document.getElementById(id); if (!e) return null;
        var r = e.getBoundingClientRect();
        /* DENOMINADOR: un nodo en display:none no tiene geometria, asi que mide 0 y
           parece que no desborda. Se reporta la visibilidad al lado del ancho. */
        return { w: Math.round(r.width), der: Math.round(r.right), vis: window.__V.vis(id),
                 desborda: r.right > d.clientWidth + 1 } };
      var r1 = { valvulas: { scrollW: d.scrollWidth, clientW: d.clientWidth,
                   hayBarra: d.scrollWidth > d.clientWidth + 1,
                   tabVis: window.__V.vis('tab-valvulas'),
                   secAo: window.__V.vis('ete-seccion-valv-aortica'),
                   bloqueEA: window.__V.vis('bloque-ea-detalle'),
                   bloqueIA: window.__V.vis('bloque-insuf-aortica'), cajones: caj,
                   pillEst: window.__V.pill('aortica','esten'),
                   pillIns: window.__V.pill('aortica','insuf') },
                 ea_dtsvi: caja('ea_dtsvi'), ia_vmax_cw: caja('ia_vmax_cw') };
      try { showTab('ai-vi') } catch(e) {}
      var r2 = { aivi: { scrollW: d.scrollWidth, clientW: d.clientWidth,
                   hayBarra: d.scrollWidth > d.clientWidth + 1 },
                 diam_tsvi_ao: caja('diam_tsvi_ao'), cajon: caja('tsvi-estimado-box') };
      return JSON.stringify(Object.assign(r1, r2));
    })()`);
  }
  await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);

  const despues = await md5(join(RAIZ, 'index.html'));
  console.log(JSON.stringify({
    archivo: FARG, md5_index_antes: antes, md5_index_despues: despues,
    index_intacto: antes === despues,
    listo, rotulos, esc, captura, nuevo, hermanos, mitral, ia, bordesIa, corteIa, legado, limpieza, xls, movil,
  }, null, 2));

  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
