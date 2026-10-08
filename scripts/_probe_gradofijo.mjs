#!/usr/bin/env node
/**
 * _probe_gradofijo.mjs — sonda A/B de SOLO LECTURA para «la pastilla es la unica fuente del grado»
 * en las CUATRO lesiones de AORTICA y MITRAL (insuficiencia y estenosis de cada una).
 *
 * Mide las nueve escenas del pedido —calculo automatico, cambio manual, vuelta al calculado,
 * grado con el boton apagado, apagado del boton, «Nuevo estudio», reabrir un guardado, un guardado
 * con «Moderada-severa», y el barrido de TODOS los gestos que podrian desincronizar la pastilla del
 * texto fijo— mas la MAQUETACION a 1200/756/300 px y el control negativo de tricuspide y pulmonar.
 *
 * No muta index.html: comprueba su md5 al principio y al final.
 *
 *   node scripts/_probe_gradofijo.mjs --file /tmp/index.HEAD.html > /tmp/gf.HEAD.json
 *   node scripts/_probe_gradofijo.mjs                             > /tmp/gf.NEW.json
 *
 * Infraestructura (servidor + Chrome + CDP) calcada de scripts/_probe_etbin.mjs.
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-gradofijo-'));
  let bin = null;
  for (const c of CHROMES) { try { await readFile(c); bin = c; break; } catch {} }
  if (!bin) throw new Error('No encontre Chrome/Chromium/Edge.');
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
   ⚠️ CUERPO DE TEMPLATE LITERAL: ni un acento grave adentro, tampoco en los comentarios. */
const SONDA = `
window.__P = {
  /* ══ LAS CUATRO LESIONES, Y EL SLOT DEL «GRADO FINAL» RESUELTO POR LOS DOS NOMBRES ═══════════
     El A/B compara HEAD contra el arbol nuevo, y en HEAD el grado final de las INSUFICIENCIAS es
     el desplegable im_sev_final / ia_sev_final mientras en el nuevo es el texto fijo
     gftxt-insuf-*. Si la sonda preguntara por un solo nombre, un lado devolveria null en todo y el
     diff mostraria «todo cambio» sin distinguir la maquetacion del mecanismo. Se resuelve por el
     SLOT —«el nodo que ocupa el lugar del grado final de esta lesion»— y por eso la geometria de
     los dos lados es comparable. El campo que lee el informe se pregunta aparte (campoGrado). */
  LES: [
    { k:'im', tipo:'insuf', valv:'mitral',  campo:'im_grado', slot:['gftxt-insuf-mitral','im_sev_final'],
      aviso:'im-manual-aviso', fund:'im-fund', nota:'im_fund_nota' },
    { k:'em', tipo:'esten', valv:'mitral',  campo:'em_grado', slot:['gftxt-esten-mitral','em_grado'],
      aviso:'em-manual-aviso', fund:'em-fund', nota:'em_fund_nota' },
    { k:'ia', tipo:'insuf', valv:'aortica', campo:'ia_grado', slot:['gftxt-insuf-aortica','ia_sev_final'],
      aviso:'ia-manual-aviso', fund:'ia-fund', nota:'ia_fund_nota' },
    { k:'ea', tipo:'esten', valv:'aortica', campo:'ea_grado', slot:['gftxt-esten-aortica','ea_grado'],
      aviso:'ea-manual-aviso', fund:'ea-fund', nota:'ea_fund_nota' }
  ],

  el(id) { return document.getElementById(id) },
  val(id) { var e = this.el(id); return e ? e.value : null },
  txt(id) { var e = this.el(id); return e ? (e.textContent || '').trim() : null },
  tag(id) { var e = this.el(id); return e ? e.tagName : null },
  vis(id) { var e = this.el(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  pill(valv, tipo) { try { return (typeof pillOn === 'function') ? pillOn(valv, tipo) : 'SIN pillOn' }
    catch(e) { return 'EXC' } },

  /* El nodo del slot que EXISTE en este arbol, con su nombre, para que el diff diga cual se uso. */
  slotDe(L) { for (var i=0;i<L.slot.length;i++){ var e=this.el(L.slot[i]); if (e) return {id:L.slot[i], e:e}; }
    return { id:null, e:null } },

  /* Lo que el MEDICO ve como grado final: el textContent si es texto fijo, el rotulo de la opcion
     seleccionada si es un desplegable. Es la unica forma de que «lo que se ve» sea comparable
     entre los dos arboles. */
  slotTexto(L) { var s = this.slotDe(L); if (!s.e) return null;
    if (s.e.tagName === 'SELECT') { var o = s.e.options[s.e.selectedIndex];
      return o ? o.textContent.trim() : '(selectedIndex -1)'; }
    return (s.e.textContent || '').trim() },

  denominador() {
    try { showTab('valvulas'); } catch(e) {}
    var toks = ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'];
    toks.forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && s.style.display === 'none') { try { toggleEteSeccion(tok); } catch(e) {} }
    });
    var vis = function(id){ var e = document.getElementById(id);
      return !!e && getComputedStyle(e).display !== 'none' };
    var acord = {};
    toks.forEach(function(tok){ acord[tok.replace('valv-','')] = vis('ete-seccion-' + tok); });
    var ab = Object.keys(acord).filter(function(k){ return acord[k] }).length;
    return { tab: vis('tab-valvulas'), secciones: ab, ok: vis('tab-valvulas') && ab === 4 } },

  limpiar() {
    try { limpiarCampos(true); } catch(e) {}
    window.esqSevManual = {}; window._sevCalcAlFijar = {};
    window._imGradoCalc = null; window._iaGradoCalc = null;
    ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){
        try { localStorage.removeItem('valv-pill-' + t + '-' + v); } catch(e){}
        try { if (window.__P.pill(v,t) === true) toggleValvPill(v,t); } catch(e){}
      });
    });
    return 1 },

  set(id, valor) {
    var e = this.el(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value } },

  /* ══ ASIGNAR SIN DESPACHAR — Y LA PRIMERA VERSION DE ESTA SONDA DIO UN FALSO POSITIVO POR NO
     TENERLO ═══════════════════════════════════════════════════════════════════════════════════
     Para SEMBRAR un grado hay que escribir el campo como lo escriben los repositores REALES de la
     app, que asignan .value y NO despachan nada: editarInforme al reabrir, calcIM_ESC /
     calcIA_ESC al autocompletar, el setGrade de la tarjeta previa al PDF y limpiarCampos.
     Con el set de arriba —que despacha change— la sonda alcanzaba un estado que NINGUN camino
     de la app alcanza, y el A/B reportaba 12 diferencias de informe y EN SUMA en los dos combos
     del CENTINELA: en HEAD el oculto no tenia handler y el boton quedaba prendido, en el arbol
     nuevo el handler nuevo lo apagaba. Medido: la diferencia era del INSTRUMENTO, no de la app.
     El unico camino vivo que escribe estos campos despachando change es el else de setLevel
     (esqPills), y en HEAD ese mismo gesto entraba por el <select> y apagaba el boton igual.
     Se conservan los DOS metodos a proposito: set para los INSUMOS —donde el evento es el gesto
     del medico tipeando— y setQuieto para los GRADOS. */
  setQuieto(id, valor) {
    var e = this.el(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    return { id: id, leido: e.value } },

  abrir(valv, tipo) { if (this.pill(valv,tipo) !== true) { try { toggleValvPill(valv,tipo) } catch(e){} }
    return this.pill(valv,tipo) },
  cerrar(valv, tipo) { if (this.pill(valv,tipo) === true) { try { toggleValvPill(valv,tipo) } catch(e){} }
    return this.pill(valv,tipo) },

  /* ══ LA FOTO DE UNA LESION ════════════════════════════════════════════════════════════════════
     Incluye a la vez el CAMPO que firma el informe, el TEXTO que ve el medico en el grado final y
     el TEXTO de la pastilla. Los tres juntos en la misma foto es lo que permite preguntar por la
     desincronizacion sin re-derivarla: si pastilla y texto fijo difieren, se ve en el mismo objeto. */
  foto(L) {
    var s = this.slotDe(L);
    return {
      slotId:   s.id,
      slotTag:  s.e ? s.e.tagName : null,
      campo:    this.val(L.campo),
      verGrado: this.slotTexto(L),
      pastilla: this.txt('sevbtn-' + L.tipo + '-' + L.valv),
      pill:     this.pill(L.valv, L.tipo),
      aviso:    this.txt(L.aviso),
      fundVis:  this.vis(L.fund),
      nota:     this.val(L.nota),
      sug:      s.e ? (s.e.dataset.sugerido || null) : null,
      campoSug: (function(){ var e = document.getElementById(L.campo);
                  return e ? (e.dataset.sugerido || null) : null })(),
      manual:   !!(window.esqSevManual || {})[L.k],
      discrepa: (function(){ try { return (typeof sevDiscrepa === 'function') ? sevDiscrepa(L.k) : 'SIN' }
                  catch(e) { return 'EXC' } })(),
      calc:     (function(){ try { return (typeof sevCalcPublicable === 'function') ? sevCalcPublicable(L.k) : 'SIN' }
                  catch(e) { return 'EXC' } })(),
      bloqGrado: this.vis(L.tipo === 'insuf' ? ('gf-insuf-' + L.valv) : ('bloque-esten-' + L.valv))
    } },

  fotoTodas() { var o = {}; var self = this;
    this.LES.forEach(function(L){ o[L.k] = self.foto(L) }); return o },

  /* ══ EL CONTROL NEGATIVO: TRICUSPIDE Y PULMONAR TIENEN QUE QUEDAR IDENTICAS ══════════════════
     El pedido las excluye explicitamente y refrescar() gobierna las OCHO pastillas, asi que esta
     foto es la que distingue «toque solo la aortica y la mitral» de «toque la funcion compartida».
     Se mira el tagName de sus grados finales: si alguno dejara de ser un SELECT visible, el cambio
     se les habria colado. */
  otras() {
    var o = {};
    [['it','insuf','tricuspide','it_grado'],['et','esten','tricuspide','et_grado'],
     ['ip','insuf','pulmonar','ip_grado'],  ['ep','esten','pulmonar','ep_grado']].forEach(function(t){
      var id = t[3], e = document.getElementById(id);
      o[t[0]] = { campo: window.__P.val(id), tag: window.__P.tag(id), vis: window.__P.vis(id),
        opts: (e && e.options) ? Array.prototype.map.call(e.options, function(x){
          return x.value + '|' + x.textContent.trim() }).join(' / ') : null,
        pastilla: window.__P.txt('sevbtn-' + t[1] + '-' + t[2]),
        pill: window.__P.pill(t[2], t[1]),
        aviso: window.__P.txt(t[0] + '-manual-aviso'),
        fundVis: window.__P.vis(t[0] + '-fund'),
        /* El texto fijo NO debe existir para estas cuatro. null en los dos arboles es el aserto. */
        gftxt: window.__P.txt('gftxt-' + t[1] + '-' + t[2]) };
    });
    return o },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  excel() {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    var campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return; } catch(e){}
      campos[el.id] = el.value; });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      campos[el.id + '__chk'] = el.checked ? '1' : '0'; });
    try { return _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-06', campos: campos }); }
    catch(e) { return 'EXC: ' + e.message; } },

  /* Los campos que se PERSISTEN, por el mismo barrido que usa guardarInforme. Si una clave
     aparece o desaparece del estudio guardado, el diff la nombra. */
  campos() {
    var c = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return; } catch(e){}
      c[el.id] = el.value; });
    return c },

  /* El panel de Evidencia, que es el que leia el nodo VISIBLE mientras el informe leia el oculto. */
  evidencia() {
    try {
      if (typeof _indSyncAhora === 'function') _indSyncAhora();
      else if (typeof indicacionesSync === 'function') indicacionesSync();
    } catch(e) {}
    var cont = document.getElementById('ind-panel') || document.getElementById('indicaciones-panel');
    if (!cont) {
      var secs = document.querySelectorAll('[id^="ind-sec-"]');
      return { via:'conteo', secciones: secs.length };
    }
    return { via:'panel', secciones: cont.querySelectorAll('.ind-sec, [id^="ind-sec-"]').length,
             filas: cont.querySelectorAll('.ind-fila, tr').length,
             largo: (cont.textContent || '').trim().length } },

  /* ══ MAQUETACION: EL SLOT DEL GRADO FINAL EN LAS CUATRO LESIONES ══════════════════════════════
     Se mide la caja del slot y la del cajon del fundamento. El 0x0 se rechaza con nombre propio:
     lo que esta en display:none no tiene geometria, y un top de 0 contra otro top de 0 es el
     falso verde que CLAUDE.md documenta. */
  geo(id) {
    var e = this.el(id); if (!e) return 'falta ' + id;
    var r = e.getBoundingClientRect();
    if (!r.width && !r.height) return 'sin geometria';
    return { top: Math.round(r.top), left: Math.round(r.left),
             w: Math.round(r.width), h: Math.round(r.height) } },

  layout(px) {
    var tab = document.getElementById('tab-valvulas');
    if (px) tab.style.setProperty('width', px + 'px', 'important');
    else tab.style.removeProperty('width');
    var out = { ancho: px, slots: {}, cajones: {}, desborde: [] };
    var self = this;
    this.LES.forEach(function(L){
      var s = self.slotDe(L);
      out.slots[L.k] = s.id ? self.geo(s.id) : 'sin slot';
      out.cajones[L.k] = self.geo(L.fund);
      /* Desborde: la caja del slot mas ancha que su fila contenedora. */
      if (s.e) {
        var fila = s.e.closest ? s.e.closest('.valv-fund-row') : null;
        if (fila) {
          var a = s.e.getBoundingClientRect(), b = fila.getBoundingClientRect();
          if (a.width && Math.round(a.right) > Math.round(b.right) + 1)
            out.desborde.push(L.k + ' slot ' + Math.round(a.right) + ' > fila ' + Math.round(b.right));
        }
        /* El grado se corta: scrollWidth mayor que clientWidth. Es lo que TC-396 vigilaba sobre
           «Moderada-severa», el rotulo mas largo que existia. */
        if (s.e.tagName !== 'SELECT' && s.e.scrollWidth > s.e.clientWidth + 1)
          out.desborde.push(L.k + ' grado CORTADO ' + s.e.scrollWidth + ' > ' + s.e.clientWidth);
      }
    });
    /* ══ TOQUE CHICO EN LA REGION TOCADA, PARA EL A/B DE CELULAR ══════════════════════════════
       check_mobile.js no acepta --file, asi que no se puede correr contra HEAD sin sobrescribir
       index.html —que es la maquina de deshacer ediciones en silencio que CLAUDE.md documenta—.
       Esto mide lo MISMO que su regla «toque-chico» (menos de 44x44) pero SOLO dentro de las cuatro
       filas de grado final, que es la region que esta tanda toca, y por el lado que si se puede
       comparar. El denominador va incluido: cuantos controles interactivos ve en la region. */
    out.toque = { controles: 0, chicos: [] };
    this.LES.forEach(function(L){
      var s = self.slotDe(L);
      var fila = (s.e && s.e.closest) ? s.e.closest('.valv-fund-row') : null;
      if (!fila) return;
      fila.querySelectorAll('input, select, textarea, button, a[href]').forEach(function(c){
        if (getComputedStyle(c).display === 'none') return;
        var r = c.getBoundingClientRect();
        if (!r.width && !r.height) return;
        out.toque.controles++;
        if (r.width < 44 || r.height < 44)
          out.toque.chicos.push((c.id || c.tagName) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
      });
    });
    if (px) tab.style.removeProperty('width');
    out.devuelto = tab.style.width === '';
    return out },

  /* Los rotulos de los cuatro bloques, que el pedido prohibe tocar. */
  rotulos() {
    var o = {};
    [['im','gf-insuf-mitral'],['em','bloque-esten-mitral'],
     ['ia','gf-insuf-aortica'],['ea','bloque-esten-aortica']].forEach(function(t){
      var c = document.getElementById(t[1]);
      o[t[0]] = c ? (c.querySelector('label') ? c.querySelector('label').textContent.trim() : null) : null;
    });
    o.ayudaIM = window.__P.txt('im-auto-ayuda');
    o.ayudaIA = window.__P.txt('ia-auto-ayuda');
    return o }
};
1`;

const md5 = async (p) => createHash('md5').update(await readFile(p)).digest('hex');

async function main() {
  const antes = await md5(join(RAIZ, 'index.html'));
  const { srv, port } = await servir();
  const url = `http://127.0.0.1:${port}/${FILE}`;
  const { proc, perfil, wsUrl } = await abrirChrome(url);
  const cdp = await conectar(wsUrl);

  const { targetInfos } = await cdp.send('Target.getTargets');
  const page = targetInfos.find((t) => t.type === 'page');
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: page.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);

  const consola = [];
  const ev = async (expr) => {
    const r = await cdp.send('Runtime.evaluate',
      { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' :: ' +
      (r.exceptionDetails.exception && r.exceptionDetails.exception.description || ''));
    return r.result.value;
  };

  /* Esperar a que la app este viva de verdad, no a un timeout. */
  for (let i = 0; i < 120; i++) {
    const listo = await ev(`!!(window.valvSev && window.SEV_SINC && typeof generarInforme === 'function')`);
    if (listo) break;
    await new Promise((r) => setTimeout(r, 250));
  }
  const listo = await ev(`!!(window.valvSev && window.SEV_SINC && typeof generarInforme === 'function')`);
  if (!listo) throw new Error('La app no arranco: valvSev / SEV_SINC / generarInforme ausentes');

  await ev(SONDA);

  /* ══ (A) El inventario: que nodos existen, de que tipo, y que dice el registro ═════════════════ */
  const inventario = JSON.parse(await ev(`(function(){
    window.__P.limpiar(); window.__P.denominador();
    var o = { nodos: {}, registro: {}, menu: {} };
    ['im_grado','ia_grado','em_grado','ea_grado','im_sev_final','ia_sev_final',
     'gftxt-insuf-mitral','gftxt-esten-mitral','gftxt-insuf-aortica','gftxt-esten-aortica'
    ].forEach(function(id){
      var e = document.getElementById(id);
      o.nodos[id] = e ? { tag: e.tagName, type: e.type || null, vis: window.__P.vis(id),
        opts: (e.options ? Array.prototype.map.call(e.options, function(x){ return x.value }).join(',') : null) } : null;
    });
    ['im','ia','em','ea','it','et','ep'].forEach(function(k){
      var C = window.SEV_SINC[k];
      o.registro[k] = C ? { select: C.select, calculables: C.calculables.join(','),
        comparables: C.comparables ? C.comparables.join(',') : null } : null; });
    /* El menu de la pastilla: lo que el medico puede ELEGIR. Es donde «Moderada-severa» tenia que
       no estar ya en HEAD, y donde las dos estenosis siguen sacando sus opciones del select. */
    ['insuf','esten'].forEach(function(t){ ['mitral','aortica','tricuspide','pulmonar'].forEach(function(v){
      try { window.valvSev.menu(t, v, null);
        var m = document.getElementById('sevmenu-' + t + '-' + v);
        o.menu[t + '-' + v] = m ? Array.prototype.map.call(m.querySelectorAll('button'),
          function(b){ return b.textContent.trim() }).join(' / ') : null;
      } catch(e) { o.menu[t + '-' + v] = 'EXC ' + e.message; }
    }); });
    return JSON.stringify(o);
  })()`));

  /* ══ (B) Las escenas de comportamiento, lesion por lesion ══════════════════════════════════════
     Los insumos que producen un calculo automatico en cada lesion, con el grado que la app saca:
       IM  — vena contracta 8 mm  -> severa (4)
       IAo — vena contracta 7 mm  -> severa (4)
       EM  — AVm por planimetria 1.0 -> severa
       EAo — Vmax 4.5 m/s         -> severa                                                      */
  const ESC = JSON.stringify([
    { k:'im', tipo:'insuf', valv:'mitral',  insumos:{ im_vc:'8' },    manual:'2', vuelta:'4' },
    { k:'em', tipo:'esten', valv:'mitral',  insumos:{ avm_plan:'1.0' }, manual:'moderada', vuelta:'severa' },
    { k:'ia', tipo:'insuf', valv:'aortica', insumos:{ ia_vc:'7' },    manual:'2', vuelta:'4' },
    { k:'ea', tipo:'esten', valv:'aortica', insumos:{ vmax_ao:'4.5' }, manual:'moderada', vuelta:'severa' }
  ]);

  const escenas = JSON.parse(await ev(`(function(){
    var ESC = ${ESC};
    var out = {};
    ESC.forEach(function(E){
      var L = window.__P.LES.filter(function(x){ return x.k === E.k })[0];
      var r = {};
      /* (a) CALCULO AUTOMATICO: la pastilla y el texto fijo dicen lo mismo, sin aviso. */
      window.__P.limpiar(); window.__P.denominador();
      window.__P.abrir(E.valv, E.tipo);
      Object.keys(E.insumos).forEach(function(id){ window.__P.set(id, E.insumos[id]) });
      r.a_auto = window.__P.foto(L);

      /* (b) CAMBIO MANUAL POR LA PASTILLA: el texto fijo la sigue; aviso y cajon aparecen. */
      try { window.valvSev.aplicar(E.tipo, E.valv, E.manual) } catch(e) { r.b_err = e.message }
      r.b_manual = window.__P.foto(L);
      window.__P.set(L.nota, 'motivo de prueba');
      r.b_nota = window.__P.val(L.nota);

      /* (c) VOLVER AL CALCULADO: el aviso y el cajon se van. */
      try { window.valvSev.aplicar(E.tipo, E.valv, E.vuelta) } catch(e) {}
      r.c_vuelta = window.__P.foto(L);

      /* (d) ELEGIR GRADO CON EL BOTON APAGADO: el boton se prende. */
      window.__P.limpiar(); window.__P.denominador();
      r.d_antes = { pill: window.__P.pill(E.valv, E.tipo) };
      try { window.valvSev.aplicar(E.tipo, E.valv, E.manual) } catch(e) {}
      r.d_tras = window.__P.foto(L);

      /* (e) APAGAR EL BOTON: borra el grado y el aviso. */
      window.__P.limpiar(); window.__P.denominador();
      window.__P.abrir(E.valv, E.tipo);
      Object.keys(E.insumos).forEach(function(id){ window.__P.set(id, E.insumos[id]) });
      try { window.valvSev.aplicar(E.tipo, E.valv, E.manual) } catch(e) {}
      window.__P.set(L.nota, 'motivo que debe borrarse');
      r.e_antes = window.__P.foto(L);
      window.__P.cerrar(E.valv, E.tipo);
      r.e_tras = window.__P.foto(L);

      /* (f) NUEVO ESTUDIO. */
      window.__P.limpiar(); window.__P.denominador();
      r.f_nuevo = window.__P.foto(L);

      /* (i) TODOS LOS GESTOS QUE PODRIAN DESINCRONIZAR pastilla y texto fijo.
         Para cada gesto se guarda el par (pastilla, texto fijo) y el campo. El veredicto NO se
         calcula aca: se compara en el reporte, para que el dato crudo quede a la vista. */
      var gestos = [];
      var anotar = function(nombre){ var f = window.__P.foto(L);
        gestos.push({ gesto: nombre, pastilla: f.pastilla, verGrado: f.verGrado, campo: f.campo }); };
      window.__P.limpiar(); window.__P.denominador();
      anotar('tras limpiar');
      window.__P.abrir(E.valv, E.tipo);                      anotar('abrir boton');
      Object.keys(E.insumos).forEach(function(id){ window.__P.set(id, E.insumos[id]) });
      anotar('insumo -> calculo auto');
      try { window.valvSev.aplicar(E.tipo, E.valv, E.manual) } catch(e) {}
      anotar('pastilla a manual');
      /* Escribir el CAMPO y despachar change. ⚠️ ES UN GESTO DE ARNES, NO DE LA APP —ningun
         repositor real despacha (ver setQuieto)— y se conserva A PROPOSITO: es el camino por el que
         entraria cualquier codigo nuevo, y lo que se afirma sobre el es el invariante que importa,
         que pastilla y texto fijo no puedan discrepar. El unico camino vivo parecido es el else de
         setLevel (esqPills), que en HEAD entraba por el <select> y hacia lo mismo. */
      window.__P.set(L.campo, E.vuelta);                     anotar('campo por codigo + change');
      /* Y el camino REAL de reposicion: asignar sin despachar, y que repinte quien repinta. */
      window.__P.setQuieto(L.campo, E.vuelta);
      try { window.valvSev.refrescar(E.tipo, E.valv) } catch(e) {}
      anotar('campo por reposicion (sin evento) + refrescar');
      /* El calculo corriendo de nuevo sobre el grado ya puesto. */
      Object.keys(E.insumos).forEach(function(id){ window.__P.set(id, E.insumos[id]) });
      anotar('recalculo');
      /* R6: mover el insumo para que el calculado CAMBIE y suelte el manual. */
      try { window.valvSev.aplicar(E.tipo, E.valv, E.manual) } catch(e) {}
      if (E.k === 'im') window.__P.set('im_vc', '2');
      if (E.k === 'ia') window.__P.set('ia_vc', '2');
      if (E.k === 'em') window.__P.set('avm_plan', '2.5');
      if (E.k === 'ea') window.__P.set('vmax_ao', '1.8');
      anotar('R6 suelta el manual');
      window.__P.cerrar(E.valv, E.tipo);                     anotar('apagar boton');
      window.__P.abrir(E.valv, E.tipo);                      anotar('reabrir boton');
      try { window.valvSev.refrescarTodo() } catch(e) {}     anotar('refrescarTodo');
      r.i_gestos = gestos;

      out[E.k] = r;
    });
    return JSON.stringify(out);
  })()`));

  /* ══ (C) Superficies firmadas con los MISMOS grados, para el A/B contra HEAD ═══════════════════
     Se fijan los cuatro grados por el CAMPO (que es lo que las dos versiones comparten) y se
     emiten informe, EN SUMA y Excel. Es la comparacion que el pedido exige: identicas. */
  const superficies = JSON.parse(await ev(`(function(){
    var out = {};
    var combos = [
      { n:'severas',  c:{ im_grado:'4', ia_grado:'4', em_grado:'severa',   ea_grado:'severa' } },
      { n:'moderadas',c:{ im_grado:'2', ia_grado:'2', em_grado:'moderada', ea_grado:'moderada' } },
      { n:'leves',    c:{ im_grado:'1', ia_grado:'1', em_grado:'leve',     ea_grado:'leve' } },
      { n:'modsev',   c:{ im_grado:'3', ia_grado:'3', em_grado:'moderada', ea_grado:'moderada' } },
      { n:'sin',      c:{ im_grado:'0', ia_grado:'0', em_grado:'sin',      ea_grado:'sin' } },
      { n:'esclerosis',c:{ im_grado:'0', ia_grado:'0', em_grado:'sin',     ea_grado:'esclerosis' } }
    ];
    combos.forEach(function(C){
      window.__P.limpiar(); window.__P.denominador();
      ['mitral','aortica'].forEach(function(v){ ['insuf','esten'].forEach(function(t){
        window.__P.abrir(v,t) }) });
      /* setQuieto: los grados se siembran como los siembran los repositores de la app. Ver su
         comentario — con el evento, este bloque daba 12 diferencias que eran del instrumento. */
      Object.keys(C.c).forEach(function(id){ window.__P.setQuieto(id, C.c[id]) });
      try { window.valvSev.refrescarTodo() } catch(e) {}
      var r = { grados: {}, ver: {} };
      window.__P.LES.forEach(function(L){ r.grados[L.k] = window.__P.val(L.campo);
        r.ver[L.k] = window.__P.slotTexto(L); });
      r.estandar = window.__P.informe('estandar');
      r.detallado = window.__P.informe('detallado');
      r.breve = window.__P.informe('breve');
      var x = window.__P.excel();
      r.excelN = (x && typeof x === 'object') ? Object.keys(x).length : x;
      r.excelGrados = (x && typeof x === 'object')
        ? { im: x['IM grado'], ia: x['IAo grado'], em: x['EM grado'], ea: x['EAo grado'] } : null;
      r.evidencia = window.__P.evidencia();
      out[C.n] = r;
    });
    return JSON.stringify(out);
  })()`));

  /* ══ (D) Reabrir un guardado, incluido uno con «Moderada-severa» ═══════════════════════════════
     No se guarda en disco: se reproduce el camino de reposicion que usa editarInforme —limpiar,
     escribir los campos, reponer las marcas y recalcular— que es lo que decide que ve el medico. */
  const guardados = JSON.parse(await ev(`(function(){
    var out = {};
    var casos = [
      /* ⚠️ ESTE CASO LLEVA LAS DOS CLAVES, Y LA PRIMERA VERSION LLEVABA UNA — EL A/B ERA INJUSTO.
         Un estudio guardado por el PROPIO HEAD contiene las dos: el barrido de guardarInforme toma
         todo select[id], asi que im_sev_final viaja junto con im_grado. Simulando solo el oculto, el
         lado HEAD reponia im_grado=2 y dejaba im_sev_final en 0, y su aviso rojo decia «Sin
         insuficiencia (ajuste manual)» sobre un informe que publicaba «moderada»: una diferencia
         que era de la sonda, no del arbol. Las dos claves estan, y en el arbol nuevo las de
         *_sev_final se saltean solas porque el nodo no existe. El caso de UNA sola clave —que SI es
         real, es la forma de una fila de Excel reimportada— va aparte, abajo. */
      { n:'manual_discrepa', campos:{ im_grado:'2', im_sev_final:'2', im_vc:'8', im_fund_nota:'jet excentrico',
          ia_grado:'2', ia_sev_final:'2', ia_vc:'7', ia_fund_nota:'vena contracta no medible',
          em_grado:'moderada', avm_plan:'1.0', em_fund_nota:'AVm no planimetrable',
          ea_grado:'moderada', vmax_ao:'4.5', ea_fund_nota:'bajo flujo',
          sev_manual:'im,ia,em,ea' } },
      /* ══ LA FORMA DE UNA FILA DE EXCEL REIMPORTADA: el oculto SIN su espejo ════════════════════
         LAB_XLS_MAP tiene la columna «IM grado» -> im_grado y NO tiene ninguna para im_sev_final,
         asi que una fila reimportada trae el oculto solo. Es el estado en que HEAD nombraba el grado
         EQUIVOCADO en el aviso rojo, y donde el arbol nuevo no puede equivocarse porque hay un solo
         nodo. El A/B sobre este caso es la MEDICION de ese defecto, no una regresion. */
      { n:'solo_oculto_excel', campos:{ im_grado:'2', im_vc:'8', ia_grado:'2', ia_vc:'7',
          sev_manual:'im,ia' } },
      { n:'modsev_legado', campos:{ im_grado:'3', ia_grado:'3', sev_manual:'im,ia' } },
      { n:'sin_marca', campos:{ im_grado:'4', ia_grado:'4', em_grado:'severa', ea_grado:'severa' } }
    ];
    casos.forEach(function(C){
      window.__P.limpiar(); window.__P.denominador();
      var campos = JSON.parse(JSON.stringify(C.campos));
      try { if (typeof _migrarCamposLegacy === 'function') campos = _migrarCamposLegacy(campos); } catch(e){}
      Object.keys(campos).forEach(function(k){
        var el = document.getElementById(k); if (el) el.value = campos[k]; });
      try { if (typeof _sevManualDesdeCampos === 'function') {
        window.esqSevManual = _sevManualDesdeCampos(campos);
        if (typeof _sevManualSync === 'function') _sevManualSync(); } } catch(e){}
      ['mitral','aortica'].forEach(function(v){ ['insuf','esten'].forEach(function(t){
        window.__P.abrir(v,t) }) });
      try { if (typeof RECALC_MODULOS === 'object' && RECALC_MODULOS)
        Object.keys(RECALC_MODULOS).forEach(function(k){ try { RECALC_MODULOS[k]() } catch(e){} }); } catch(e){}
      try { calcIM_ESC() } catch(e){}
      try { calcIA_ESC() } catch(e){}
      try { calcEM() } catch(e){}
      try { calcAo() } catch(e){}
      try { if (typeof sevFundRestaurar === 'function') sevFundRestaurar(campos) } catch(e){}
      out[C.n] = { fotos: window.__P.fotoTodas(), informe: window.__P.informe('estandar'),
                   campoModSevIM: window.__P.val('im_grado'), campoModSevIA: window.__P.val('ia_grado') };
    });
    return JSON.stringify(out);
  })()`));

  /* ══ (E) Maquetacion en los tres anchos + los rotulos que el pedido prohibe tocar ══════════════ */
  const layout = JSON.parse(await ev(`(function(){
    window.__P.limpiar(); window.__P.denominador();
    ['mitral','aortica'].forEach(function(v){ ['insuf','esten'].forEach(function(t){
      window.__P.abrir(v,t) }) });
    /* Con grados puestos, que es cuando el texto fijo tiene algo que mostrar y puede desbordar.
       Se eligen a proposito los rotulos MAS LARGOS de cada vocabulario: «Moderada-severa» (que en
       HEAD era el criterio que ataba el ancho, segun el CSS) y «Esclerosis». */
    window.__P.setQuieto('im_grado','3'); window.__P.setQuieto('ia_grado','3');
    window.__P.setQuieto('em_grado','moderada'); window.__P.setQuieto('ea_grado','esclerosis');
    try { window.valvSev.refrescarTodo() } catch(e) {}
    var o = { conGrado: {}, rotulos: window.__P.rotulos() };
    [1200, 756, 390, 360, 300].forEach(function(px){ o.conGrado[px] = window.__P.layout(px) });
    return JSON.stringify(o);
  })()`));

  /* ══ (F) El control negativo: tricuspide y pulmonar ════════════════════════════════════════════ */
  const otras = JSON.parse(await ev(`(function(){
    window.__P.limpiar(); window.__P.denominador();
    ['tricuspide','pulmonar'].forEach(function(v){ ['insuf','esten'].forEach(function(t){
      window.__P.abrir(v,t) }) });
    window.__P.set('it_grado','2'); window.__P.set('et_grado','Significativa');
    window.__P.set('ep_grado','Moderada');
    var conGrado = window.__P.otras();
    var inf = window.__P.informe('estandar');
    window.__P.limpiar(); window.__P.denominador();
    var vacio = window.__P.otras();
    return JSON.stringify({ conGrado: conGrado, informe: inf, vacio: vacio });
  })()`));

  const despues = await md5(join(RAIZ, 'index.html'));

  console.log(JSON.stringify({
    archivo: FARG, md5_index_antes: antes, md5_index_despues: despues,
    index_intacto: antes === despues,
    listo, consola, inventario, escenas, superficies, guardados, layout, otras,
  }, null, 2));

  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
