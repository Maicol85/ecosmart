#!/usr/bin/env node
/**
 * _probe_valvmanual.mjs — sonda A/B de SOLO LECTURA para la tanda del MODO MANUAL de las
 * pastillas, el selector binario de la ESTENOSIS MITRAL, el VIOLETA de «Significativa» y el
 * criterio «VTI de entrada >60 cm» de la ESTENOSIS TRICUSPIDEA (2026-10-13).
 *
 * Mide con TECLAS Y CLICS REALES, por cada una de las OCHO lesiones con pastilla:
 *   estado inicial -> cargar un dato -> APAGAR la pastilla a mano -> BORRAR el dato ->
 *   cargar un dato NUEVO, mirando la marca de manual, su foto, el aviso rojo y el cajon.
 *
 * Infraestructura calcada de scripts/_probe_valvborra.mjs (teclas y clics reales, cierre del
 * arbol de Chrome por GRUPO y por PID PROPIO, md5 al principio y al final). NO muta index.html.
 *
 *   node scripts/_probe_valvmanual.mjs --file /tmp/index.HEAD.html > /tmp/vm.HEAD.json
 *   node scripts/_probe_valvmanual.mjs                            > /tmp/vm.NEW.json
 *
 * Grupos (--solo repro|respeta|emsel|color|vti|controles):
 *   repro     — el defecto del medico, lesion por lesion: apagar, borrar y volver a cargar.
 *   respeta   — pastilla apagada CON dato cargado: la marca y el aviso se conservan (regla b).
 *   emsel     — las opciones del menu de severidad de la estenosis mitral y sus dos ayudas.
 *   color     — el violeta de «Significativa» en los dos selectores y en los DOS temas.
 *   vti       — el VTI de entrada tricuspideo en el borde 59,9 / 60 / 60,1 y su borrado.
 *   controles — insuficiencias, estenosis aortica, pulmonar, diastolica, HFA-PEFF y Excel.
 *
 * ⚠️ Sin acentos graves dentro del template de la sonda, tampoco en los comentarios de adentro.
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, writeFile } from 'node:fs/promises';
import { rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, extname, isAbsolute, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

/* ⚠️ SOLO PIDs PROPIOS, NUNCA POR NOMBRE. Mismo barrido que las otras sondas del repo: Chrome
   arranca hijos que no son hijos nuestros, asi que se mata el GRUPO (`-pid`) y se borra el perfil
   en `exit` —que es la unica senial que disparan tanto el camino feliz como el de fallo—. */
const _ARNES_VIVOS = new Set();
let _arnesLimpiezaArmada = false;
function _arnesCerrarAlSalir(proc, perfil) {
  if (!proc || !proc.pid) return;
  _ARNES_VIVOS.add({ pid: proc.pid, perfil: perfil });
  if (_arnesLimpiezaArmada) return;
  _arnesLimpiezaArmada = true;
  const barrer = () => {
    for (const v of _ARNES_VIVOS) {
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
const SOLO = arg('--solo');
const CAPTURA = process.argv.includes('--captura');
const DEST = arg('--dest') || tmpdir();
const hacer = (g) => !SOLO || SOLO.split(',').indexOf(g) > -1;

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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-vm-'));
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
    let id = 0; const pend = new Map(); let api = null;
    ws.addEventListener('open', () => { api = {
      send: (method, params = {}, sessionId) => new Promise((ok, no) => {
        const msg = { id: ++id, method, params };
        if (sessionId) msg.sessionId = sessionId;
        pend.set(msg.id, { ok, no });
        ws.send(JSON.stringify(msg));
      }),
      close: () => ws.close(),
    }; res(api); });
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
async function md5(p) { return createHash('md5').update(await readFile(p)).digest('hex'); }

/* ══ Sonda inyectada ══════════════════════════════════════════════════════════════════════════
   ⚠️ CUERPO DE TEMPLATE LITERAL: ni un acento grave adentro, tampoco en los comentarios. */
const SONDA = `
window.__P = {
  existe(id) { return !!document.getElementById(id) },
  /* ⚠️ GEOMETRIA Y FOCO, QUE ES EL DENOMINADOR DE CADA TECLEO. Un nodo en display:none no tiene
     caja y focus() sobre el falla EN SILENCIO: las teclas se van al documento y el campo conserva
     su valor. La sonda ABORTA en vez de informar el resultado de un gesto que no paso. */
  geo(id) { var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    var r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), ok: r.width > 0 && r.height > 0 } },
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  sug(id) { var e = document.getElementById(id); return e ? (e.dataset.sugerido || null) : null },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  pill(valv, tipo) { try { return (typeof pillOn === 'function') ? pillOn(valv, tipo) : 'SIN pillOn' }
    catch(e) { return 'EXC' } },
  ls(k) { try { return localStorage.getItem(k) } catch(e) { return 'EXC' } },

  revelar(id) {
    var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    var abrio = [];
    for (var pase = 0; pase < 6; pase++) {
      var oculto = null, n = e;
      while (n && n.nodeType === 1) {
        if (getComputedStyle(n).display === 'none') { oculto = n; }
        n = n.parentNode;
      }
      if (!oculto) break;
      var oid = oculto.id || '';
      if (oid.indexOf('tab-') === 0) {
        try { showTab(oid.slice(4)); abrio.push(oid) } catch(x) { return { err: 'showTab ' + oid, abrio: abrio } }
      } else {
        var ctrl = null;
        if (oid) {
          var cand = Array.from(document.querySelectorAll('[onclick]')).find(function(b){
            return (b.getAttribute('onclick')||'').indexOf("'" + oid + "'") >= 0 });
          if (cand) { if (!cand.id) cand.id = '__prv_' + oid; ctrl = cand.id }
        }
        if (!ctrl) return { err: 'oculto por ' + (oid ? ('#' + oid) : ('.' + String(oculto.className||'?'))), abrio: abrio };
        return { necesitaClic: ctrl, abrio: abrio };
      }
    }
    return { abrio: abrio, ok: window.__P.vis(id) === true } },

  centro(id) { var e = document.getElementById(id); if (!e) return null;
    e.scrollIntoView({ block:'center', inline:'center' });
    var r = e.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return { err: 'nodo sin geometria' };
    return { x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2) } },

  quienEsta(id, x, y) {
    var t = document.getElementById(id);
    var e = document.elementFromPoint(x, y);
    if (!e) return { enPunto: null, esElBlanco: false };
    return { enPunto: (e.id || ('<' + e.tagName.toLowerCase() + '>')),
             esElBlanco: !!(t && (e === t || t.contains(e) || e.contains(t))) } },

  /* ⚠️ DENOMINADOR. Pestania Valvulas con sus cuatro acordeones ABIERTOS y los cajones de datos
     desplegados: lo que esta en display:none no tiene geometria, asi que una sonda sobre la app
     cerrada no puede clickear ni tipear y devuelve cero, que es indistinguible de «esta bien». */
  abrirTodo() {
    try { showTab('valvulas'); } catch(e) {}
    var toks = ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'];
    toks.forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && getComputedStyle(s).display === 'none') { try { toggleEteSeccion(tok); } catch(e) {} }
    });
    var vis = function(id){ var e = document.getElementById(id);
      return !!e && getComputedStyle(e).display !== 'none' };
    var acord = {};
    toks.forEach(function(tok){ acord[tok.replace('valv-','')] = vis('ete-seccion-' + tok); });
    var ab = Object.keys(acord).filter(function(k){ return acord[k] }).length;
    ['dop-aortico','dop-mitral','dop-tricusp','dop-pulmonar','cx-pisa','cx-cont'].forEach(function(cid){
      var c = document.getElementById(cid);
      if (c && getComputedStyle(c).display === 'none') c.style.display = 'block'; });
    return { tab: vis('tab-valvulas'), secciones: ab, acordeones: acord,
             ok: vis('tab-valvulas') && ab === 4 } },

  /* ⚠️ LAS PASTILLAS SE APAGAN A MANO Y LAS CLAVES SE BORRAN. limpiarCampos borra las claves pero
     el estado VIVO de la pastilla sobrevive entre escenas de una misma pagina, asi que un display
     inline del paciente anterior se lee como un resultado de esta escena. */
  limpiar() {
    try { limpiarCampos(true); } catch(e) {}
    window.esqSevManual = {}; window._sevCalcAlFijar = {};
    window._imGradoCalc = null; window._iaGradoCalc = null; window._itGradoCalc = null;
    ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){
        try { if (window.__P.pill(v,t) === true) toggleValvPill(v,t); } catch(e){}
        try { localStorage.removeItem('valv-pill-' + t + '-' + v); } catch(e){}
      });
    });
    try { if (window.VALV_ESTEN_AUTO) window.VALV_ESTEN_AUTO.clear(); } catch(e){}
    try { if (window.VALV_INSUF_AUTO) window.VALV_INSUF_AUTO.clear(); } catch(e){}
    ['im_grado','ia_grado','it_grado','ea_grado','em_grado','et_grado','ep_grado','ip_grado'].forEach(function(id){
      var e = document.getElementById(id); if (e) delete e.dataset.sugerido; });
    try { if (typeof _sevManualSync === 'function') _sevManualSync(); } catch(e){}
    var pills = ['insuf-mitral','esten-mitral','insuf-aortica','esten-aortica',
                 'insuf-tricuspide','esten-tricuspide','insuf-pulmonar','esten-pulmonar'];
    var quedan = pills.filter(function(p){
      var v = p.split('-')[1], t = p.split('-')[0];
      return window.__P.pill(v,t) === true });
    return { pillsEncendidas: quedan, ok: quedan.length === 0 } },

  /* Corre los calculadores de las ocho lesiones sobre lo que haya en pantalla. NO es un gesto:
     fija el denominador del «volvio al estado inicial». */
  pintarVacio() {
    var r = {};
    ['calcAo','calcEM','calcIM_ESC','calcIA_ESC','calcIT_ESC','calcET','calcVP','calcIP','calcContIM'].forEach(function(f){
      try { if (typeof window[f] === 'function') { window[f](); r[f] = 1 } else r[f] = 'NO EXISTE' }
      catch(e) { r[f] = 'EXC: ' + e.message }
    });
    return r },

  /* NO ES UN GESTO MEDIDO: solo para los <select> de escenario. Los numericos van con teclas. */
  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value, ok: String(e.value) === String(valor) } },

  /* ══ LA FOTO DE UNA LESION REGISTRADA. Lleva lo que el medico ve y lo que decide: el campo de
     GRADO que firma las cuatro superficies, la PASTILLA con su clave y su sub-boton, la MARCA de
     manual con su FOTO del calculado, el AVISO rojo y el CAJON de fundamento con su nota. */
  foto(clave) {
    var C = (window.SEV_SINC || {})[clave];
    if (!C) return { err: 'clave no registrada: ' + clave };
    var sel = document.getElementById(C.select);
    var tieneFoto = false;
    try { tieneFoto = !!(window._sevCalcAlFijar &&
      Object.prototype.hasOwnProperty.call(window._sevCalcAlFijar, clave)) } catch(e) { tieneFoto = 'EXC' }
    var cajon = C.fundamento ? document.getElementById(C.fundamento) : null;
    var calc = null;
    try { calc = (typeof sevCalcPublicable === 'function') ? sevCalcPublicable(clave) : 'SIN FN' }
    catch(e) { calc = 'EXC' }
    return {
      clave: clave, tipo: C.tipo, valv: C.valv,
      grado: sel ? sel.value : 'NO EXISTE',
      sug: window.__P.sug(C.select),
      calc: calc,
      manual: !!(window.esqSevManual && window.esqSevManual[clave]),
      fotoCalc: tieneFoto,
      pill: window.__P.pill(C.valv, C.tipo),
      ls: window.__P.ls('valv-pill-' + C.tipo + '-' + C.valv),
      auto: (function(){ try {
        var s = (C.tipo === 'esten') ? window.VALV_ESTEN_AUTO : window.VALV_INSUF_AUTO;
        return !!(s && s.has(C.valv)) } catch(e){ return 'EXC' } })(),
      sevbtn: window.__P.txt('sevbtn-' + C.tipo + '-' + C.valv),
      gftxt: window.__P.txt('gftxt-' + C.tipo + '-' + C.valv),
      aviso: window.__P.txt(C.aviso),
      cajon: cajon ? (getComputedStyle(cajon).display !== 'none') : 'NO EXISTE',
      nota: C.nota ? window.__P.val(C.nota) : null,
      bloqueGrado: window.__P.vis((C.tipo === 'insuf') ? ('gf-insuf-' + C.valv) : ('bloque-esten-' + C.valv))
    } },

  /* El resultado de sevSincronizar, que es el GESTO y no un textContent. */
  sinc(clave) { try { return sevSincronizar(clave) } catch(e) { return { err: e.message } } },

  /* ⚠️ EL COLOR SE LEE COMPUTADO Y NO DEL ATRIBUTO. Una regla que no gana se lee como un arreglo
     aplicado: este repo ya lo pago cuatro veces con un style en linea ganandole a la hoja. */
  colorBtn(tipo, valv) {
    var e = document.getElementById('sevbtn-' + tipo + '-' + valv);
    if (!e) return { err: 'NO EXISTE' };
    var s = getComputedStyle(e);
    return { txt: (e.textContent || '').trim(), cls: String(e.className || ''),
             bg: s.backgroundColor, fg: s.color, borde: s.borderTopColor } },

  /* ⚠️ EL TEMA DE ESTA APP ES LA CLASE light-mode SOBRE documentElement, NO data-theme. Una sonda
     de este repo saco dos capturas IDENTICAS byte por byte creyendo que medía dos temas. ABORTA
     si la clase no quedo puesta. */
  tema(cual) {
    var r = document.documentElement;
    if (cual === 'claro') r.classList.add('light-mode'); else r.classList.remove('light-mode');
    var puesta = r.classList.contains('light-mode');
    if ((cual === 'claro') !== puesta) return { err: 'el tema no quedo: pedido ' + cual };
    return { tema: cual, light: puesta, bodyBg: getComputedStyle(document.body).backgroundColor } },

  /* Las opciones del menu ▼ tal como el medico las ve: se arman al abrirlo leyendo las <option>
     del <select> oculto. Se lee el menu ABIERTO, no el <select>. */
  menuItems(tipo, valv) {
    var m = document.getElementById('sevmenu-' + tipo + '-' + valv);
    if (!m) return { err: 'NO EXISTE el menu' };
    return { abierto: m.classList.contains('open'),
             items: Array.from(m.querySelectorAll('button')).map(function(b){ return (b.textContent||'').trim() }) } },

  /* Las <option> crudas del <select> oculto, con su value, su texto y si estan ocultas: es lo que
     un estudio guardado necesita para reabrir sin quedar en selectedIndex -1. */
  options(id) {
    var e = document.getElementById(id);
    if (!e || !e.options) return { err: 'NO EXISTE ' + id };
    return Array.from(e.options).map(function(o){
      return { v: o.value, t: (o.textContent||'').trim(), h: !!o.hidden,
               d: getComputedStyle(o).display } }) },

  /* El cuadro de referencias de la estenosis tricuspidea, fila por fila. */
  etRef() { return { gmedio: window.__P.txt('et-ref-gmedio'), thp: window.__P.txt('et-ref-thp'),
                     vti: window.__P.txt('et-ref-vti'), avt: window.__P.txt('et-ref-avt'),
                     sev: window.__P.txt('et-sev'), avtCampo: window.__P.val('et_avt'),
                     fuente: window.__P.txt('et-ref-fuente') } },
  etEstado() { try { return etEstado() } catch(e) { return { err: e.message } } },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme({ silencioso: true }) } catch(e) { return { err: e.message } }
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
    try { var r = _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-13', campos: campos });
          return { n: Object.keys(r).length, hash: JSON.stringify(r).length }; }
    catch(e) { return 'EXC: ' + e.message; } },

  /* Los controles que esta tanda NO puede mover. */
  ajenos() { return {
    diast: window.__P.txt('dd-interp'),
    hfapeff: window.__P.txt('hfapeff-eco'),
    eaSev: window.__P.txt('ea-sev'),
    imSev: window.__P.txt('im-sev'), iaSev: window.__P.txt('ia-sev'), itSev: window.__P.txt('it-sev'),
    emBadge: window.__P.txt('em-sev-integrada'), vpBadge: window.__P.txt('vp-sev-badge'),
    ipPht: window.__P.txt('ip-ref-pht'), emDisc: window.__P.txt('em-discordancia') } },

  /* Los dos textos de ayuda que nombran los grados de la estenosis mitral. */
  ayudasEM() {
    var out = {};
    var b = document.getElementById('em-metodo-badge');
    out.badge = b ? (b.textContent || '').trim() : 'NO EXISTE';
    var cuerpo = document.body.innerText || '';
    out.refClinica = (cuerpo.indexOf('Leve y moderada las elige') >= 0) ? 'ESTA LA FRASE VIEJA' : 'no esta';
    var fuente = document.documentElement.innerHTML;
    out.fuenteLeveModerada = (fuente.indexOf('Leve y moderada las elige el m') >= 0);
    return out },

  /* El aviso legal vuelve a mitad de corrida y tapa la pagina entera con z-index 9999. */
  despejar() {
    var o = {};
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (!m) { o[id] = 'NO EXISTE'; return; }
      o[id] = getComputedStyle(m).display;
      if (o[id] !== 'none') { m.style.display = 'none'; o[id] += ' -> none'; }
    });
    return o }
};
1`;

/* ══ LAS OCHO LESIONES CON PASTILLA ══════════════════════════════════════════════════════════
   Un campo votante por lesion, con el valor que la hace graduar y un SEGUNDO valor distinto para
   el «dato nuevo» del final. Los dos tienen que graduar: si el segundo no votara, la escena no
   llegaria a la compuerta y mediria «no hay aviso» sobre un calculo que no existe. */
const LESIONES = [
  { clave:'im', tipo:'insuf', valv:'mitral',     campo:'im_vc',     v1:'7',   v2:'6'  },
  { clave:'ia', tipo:'insuf', valv:'aortica',    campo:'ia_vc',     v1:'8',   v2:'7'  },
  { clave:'it', tipo:'insuf', valv:'tricuspide', campo:'it_vc',     v1:'8',   v2:'9'  },
  { clave:'ip', tipo:'insuf', valv:'pulmonar',   campo:'ip_pht',    v1:'80',  v2:'70' },
  { clave:'em', tipo:'esten', valv:'mitral',     campo:'em_gmedio', v1:'12',  v2:'14' },
  { clave:'ea', tipo:'esten', valv:'aortica',    campo:'vmax_ao',   v1:'4.5', v2:'4.2'},
  { clave:'et', tipo:'esten', valv:'tricuspide', campo:'et_gmedio', v1:'8',   v2:'9'  },
  { clave:'ep', tipo:'esten', valv:'pulmonar',   campo:'vp_vmax',   v1:'4.5', v2:'4.2'}
];
const GRUPOS = ['repro','respeta','emsel','color','vti','controles'];

async function main() {
  const md5Ini = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  const { srv, port } = await servir();
  const { wsUrl } = await abrirChrome(`http://127.0.0.1:${port}/${FILE}`);
  const cdp = await conectar(wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const page = targetInfos.find((t) => t.type === 'page');
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: page.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);
  const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
  /* ⚠️ RELOJ SOBRE ev(): un despacho que NO RESUELVE deja el fallo apareciendo en la llamada
     SIGUIENTE, o sea en la linea equivocada. Con el reloj el error nombra su propia expresion. */
  async function ev(expr, ms) {
    const r = await Promise.race([
      cdp.send('Runtime.evaluate', { expression: `(function(){ ${expr.indexOf('return') === 0 ? expr : 'return (' + expr + ')'} })()`,
                                     returnByValue: true, awaitPromise: true }, sessionId),
      pausa(ms || 15000).then(() => ({ __reloj: true }))
    ]);
    if (r.__reloj) throw new Error('ev() no resolvio en ' + (ms || 15000) + ' ms: ' + expr.slice(0, 90));
    if (r.exceptionDetails) throw new Error('EXC en ev(): ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text) + ' | ' + expr.slice(0, 90));
    return r.result.value;
  }
  async function evCrudo(expr) {
    const r = await cdp.send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error('EXC en evCrudo(): ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
    return r.result.value;
  }
  const VK = { Backspace: 8, Delete: 46, Tab: 9, Enter: 13, End: 35, Home: 36, Space: 32 };
  /* ⚠️ LAS TECLAS DE EDICION (Backspace, Tab) VAN POR KEYCODE Y CON rawKeyDown; Enter y Espacio al
     reves, con type keyDown y su `text`, porque Blink activa un <button> desde el KEYPRESS y un
     rawKeyDown pelado no lo genera. Las dos cosas son ciertas a la vez. */
  async function tecla(k, text) {
    if (text) {
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: k }, sessionId);
      await cdp.send('Input.dispatchKeyEvent', { type: 'char', text, unmodifiedText: text, key: k }, sessionId);
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k }, sessionId);
      return;
    }
    const vk = VK[k] || 0;
    await cdp.send('Input.dispatchKeyEvent', { type: 'rawKeyDown', key: k, code: k,
      windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk }, sessionId);
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k,
      windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk }, sessionId);
  }
  async function clicEn(id) {
    let rev = await ev(`window.__P.revelar(${JSON.stringify(id)})`);
    for (let i = 0; i < 4 && rev && rev.necesitaClic; i++) {
      await clicEn(rev.necesitaClic);
      rev = await ev(`window.__P.revelar(${JSON.stringify(id)})`);
    }
    const c = await ev(`window.__P.centro(${JSON.stringify(id)})`);
    if (!c || c.err) return { via: 'NO SE PUDO', por: c ? c.err : 'no existe' };
    const quien = await ev(`window.__P.quienEsta(${JSON.stringify(id)}, ${c.x}, ${c.y})`);
    if (quien.esElBlanco) {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await pausa(130);
      return { via: 'mouse', quien };
    }
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)}); if(e) e.focus(); return 1 })()`);
    await tecla('Enter', null);
    await pausa(130);
    return { via: 'tecla Enter', quien };
  }
  /* ⚠️ TIPEAR EN UN CAMPO QUE NO EXISTE NO ES UNA MEDICION, Y UNA SONDA DE ESTE REPO YA LO HIZO:
     el foco quedaba en el campo anterior y los caracteres se le concatenaban. Aca se ABORTA. */
  async function tipear(id, valor) {
    const hay = await ev(`window.__P.existe(${JSON.stringify(id)})`);
    if (!hay) throw new Error('ABORTA: el campo ' + id + ' no existe en este arbol');
    let via = await clicEn(id);
    let geo = await ev(`window.__P.geo(${JSON.stringify(id)})`);
    if (!geo.ok) { await ev(`window.__P.abrirTodo()`); via = await clicEn(id);
                   geo = await ev(`window.__P.geo(${JSON.stringify(id)})`); }
    if (!geo.ok) throw new Error('ABORTA: ' + id + ' sin geometria (' + JSON.stringify(geo) + ')');
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(!e) return 0; e.focus(); try{ e.select() }catch(x){} return 1 })()`);
    for (const ch of String(valor)) await tecla(ch, ch);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
    await pausa(60);
    const quedo = await ev(`window.__P.val(${JSON.stringify(id)})`);
    if (String(quedo) !== String(valor))
      throw new Error('ABORTA: el tecleo de ' + id + ' no quedo: pedido ' + valor + ', quedo ' + quedo +
                      ' (' + JSON.stringify(geo) + ', clic ' + via.via + ')');
    return { via: via.via, pedido: String(valor), quedo: String(quedo), ok: true };
  }
  /* NUNCA Backspace sobre un campo de SOLO LECTURA: se comprueba antes y se declara. */
  async function borrar(id) {
    const soloLectura = await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      return e ? (!!e.readOnly || !!e.disabled) : 'NO EXISTE' })()`);
    if (soloLectura !== false) return { id, via: 'NO SE BORRA', por: String(soloLectura) };
    let via = await clicEn(id);
    let geo = await ev(`window.__P.geo(${JSON.stringify(id)})`);
    if (!geo.ok) { await ev(`window.__P.abrirTodo()`); via = await clicEn(id);
                   geo = await ev(`window.__P.geo(${JSON.stringify(id)})`); }
    if (!geo.ok) throw new Error('ABORTA: no se puede borrar ' + id + ' sin geometria (' + JSON.stringify(geo) + ')');
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(!e) return 0; e.focus(); try{ e.select() }catch(x){} return 1 })()`);
    const foco = await ev(`(function(){ return document.activeElement ? (document.activeElement.id || '') : '' })()`);
    if (String(foco) !== String(id))
      throw new Error('ABORTA: el foco no llego a ' + id + ' (esta en ' + JSON.stringify(foco) + ')');
    for (let i = 0; i < 12; i++) await tecla('Backspace', null);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
    await pausa(60);
    const quedo = await ev(`window.__P.val(${JSON.stringify(id)})`);
    if (String(quedo) !== '')
      throw new Error('ABORTA: el borrado de ' + id + ' no quedo: sigue en ' + JSON.stringify(quedo) + ')');
    return { id, via: 'Backspace x12', quedo: String(quedo), clic: via.via };
  }
  /* El mismo cuidado para una PASTILLA: se exige el estado que la escena pide. */
  async function pastilla(valv, tipo, deseado) {
    await ev(`window.__P.abrirTodo()`);
    const id = 'pill-' + tipo + '-' + valv;
    const geo = await ev(`window.__P.geo(${JSON.stringify(id)})`);
    if (!geo.ok) throw new Error('ABORTA: ' + id + ' sin geometria (' + JSON.stringify(geo) + ')');
    const antes = await ev(`window.__P.pill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)})`);
    if (antes === deseado) return { id, yaEstaba: true, pill: antes };
    const via = await clicEn(id);
    const pill = await ev(`window.__P.pill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)})`);
    if (pill !== deseado)
      throw new Error('ABORTA: el clic en ' + id + ' no dejo la pastilla en ' + deseado +
                      ' (quedo ' + pill + ', via ' + via.via + ')');
    return { id, via: via.via, pill };
  }
  async function reset() {
    await ev(`window.__P.despejar()`);
    await ev(`window.__P.limpiar()`);
    await ev(`window.__P.abrirTodo()`);
    await ev(`window.__P.pintarVacio()`);
    await pausa(80);
  }

  await evCrudo(`try{sessionStorage.setItem('ett_auth','1')}catch(e){}; location.reload(); 1`);
  await pausa(2600);
  await evCrudo(SONDA);
  await ev(`window.__P.despejar()`);
  const arranque = await ev(`window.__P.abrirTodo()`);
  if (!arranque.ok) throw new Error('ABORTA: la pestania Valvulas no abrio sus cuatro acordeones: ' + JSON.stringify(arranque));

  const OUT = { archivo: FARG, md5Ini, arranque, grupos: {} };

  /* ══ GRUPO repro — EL DEFECTO DEL MEDICO, LESION POR LESION ═══════════════════════════════ */
  if (hacer('repro')) {
    const filas = [];
    for (const L of LESIONES) {
      const f = { lesion: L.clave, campo: L.campo };
      try {
        await reset();
        f.inicial = await ev(`window.__P.foto(${JSON.stringify(L.clave)})`);
        f.tecleo1 = await tipear(L.campo, L.v1);
        await pausa(120);
        f.conDato = await ev(`window.__P.foto(${JSON.stringify(L.clave)})`);
        /* DENOMINADOR: si el dato no produjo grado, la escena no llega a la compuerta y todo lo
           de abajo mide otra cosa. Se declara al lado del resultado. */
        f.graduo = !!(f.conDato.grado && f.conDato.grado !== f.inicial.grado);
        f.apagado = await pastilla(L.valv, L.tipo, false);
        await pausa(120);
        f.apagada = await ev(`window.__P.foto(${JSON.stringify(L.clave)})`);
        f.borrado = await borrar(L.campo);
        await pausa(150);
        f.sinDato = await ev(`window.__P.foto(${JSON.stringify(L.clave)})`);
        f.tecleo2 = await tipear(L.campo, L.v2);
        await pausa(150);
        f.datoNuevo = await ev(`window.__P.foto(${JSON.stringify(L.clave)})`);
        /* Las tres preguntas de la regla, contestadas sobre la foto y no sobre un textContent. */
        f.R = {
          marcaTrasBorrar: f.sinDato.manual,
          avisoTrasBorrar: f.sinDato.aviso,
          marcaConDatoNuevo: f.datoNuevo.manual,
          avisoConDatoNuevo: f.datoNuevo.aviso,
          cajonConDatoNuevo: f.datoNuevo.cajon,
          gradoConDatoNuevo: f.datoNuevo.grado,
          pillConDatoNuevo: f.datoNuevo.pill
        };
      } catch (e) { f.err = String(e.message || e); }
      filas.push(f);
    }
    OUT.grupos.repro = { n: filas.length, filas };
  }

  /* ══ GRUPO respeta — REGLA (b): PASTILLA APAGADA **CON** DATO CARGADO ═════════════════════ */
  if (hacer('respeta')) {
    const filas = [];
    for (const L of LESIONES) {
      const f = { lesion: L.clave, campo: L.campo };
      try {
        await reset();
        f.tecleo = await tipear(L.campo, L.v1);
        await pausa(120);
        f.conDato = await ev(`window.__P.foto(${JSON.stringify(L.clave)})`);
        f.apagado = await pastilla(L.valv, L.tipo, false);
        await pausa(150);
        const d = await ev(`window.__P.foto(${JSON.stringify(L.clave)})`);
        f.apagada = d;
        f.R = { marca: d.manual, aviso: d.aviso, cajon: d.cajon, grado: d.grado, pill: d.pill,
                calc: d.calc, bloqueGrado: d.bloqueGrado };
        /* CONTROL NEGATIVO del mismo gesto: volver a prenderla a mano (B-3). */
        f.reabierto = await pastilla(L.valv, L.tipo, true);
        await pausa(150);
        f.reabierta = await ev(`window.__P.foto(${JSON.stringify(L.clave)})`);
      } catch (e) { f.err = String(e.message || e); }
      filas.push(f);
    }
    OUT.grupos.respeta = { n: filas.length, filas };
  }

  /* ══ GRUPO emsel — EL SELECTOR BINARIO DE LA ESTENOSIS MITRAL ═════════════════════════════ */
  if (hacer('emsel')) {
    const g = {};
    try {
      await reset();
      g.options = await ev(`window.__P.options('em_grado')`);
      /* El menu ▼ se abre con un CLIC real sobre la pastilla de severidad. */
      await clicEn('sevbtn-esten-mitral');
      await pausa(150);
      g.menu = await ev(`window.__P.menuItems('esten','mitral')`);
      await clicEn('sevbtn-esten-mitral');
      await pausa(100);
      /* Control: el menu de la AORTICA no cambia. */
      await clicEn('sevbtn-esten-aortica');
      await pausa(150);
      g.menuAo = await ev(`window.__P.menuItems('esten','aortica')`);
      await clicEn('sevbtn-esten-aortica');
      await pausa(100);
      g.ayudas = await ev(`window.__P.ayudasEM()`);
      /* Como se MUESTRA cada token: el sub-boton, el texto fijo y la fila del cuadro. */
      g.porToken = {};
      /* ⚠️ CON LA MARCA MANUAL PUESTA, que es el unico estado en el que el informe imprime el
         grado ELEGIDO: sin la marca, `_emAppSevera` manda y el papel publica la frase de la
         CATEGORIA, asi que la tabla mediria otra cosa. El dato cargado le da denominador. */
      for (const tok of ['sin', 'leve', 'moderada', 'severa']) {
        await ev(`window.__P.limpiar()`);
        await ev(`window.__P.abrirTodo()`);
        await tipear('em_gmedio', '12');
        await ev(`window.__P.set('em_grado', ${JSON.stringify(tok)})`);
        await ev(`(function(){ window.esqSevManual = window.esqSevManual || {};
          window.esqSevManual.em = true; if (typeof _sevManualSync === 'function') _sevManualSync();
          if (typeof calcEM === 'function') calcEM(); return 1 })()`);
        await pausa(140);
        const f = await ev(`window.__P.foto('em')`);
        f.informe = {};
        for (const est of ['estandar', 'detallado', 'conciso']) {
          f.informe[est] = await ev(`window.__P.informe(${JSON.stringify(est)})`);
        }
        f.excel = await ev(`window.__P.excel()`);
        f.excelEM = await ev(`(function(){
          var campos = {}; document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
            try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return } catch(e){}
            campos[el.id] = el.value });
          try { var r = _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-13', campos: campos });
            return { emGrado: r['EM grado'],
                     lab: (typeof _labEstenSev === 'function')
                        ? _labEstenSev({ campos: campos }, 'em_grado') : 'SIN FN' } }
          catch(e) { return 'EXC: ' + e.message } })()`);
        g.porToken[tok] = f;
      }
      /* Un estudio con los valores VIEJOS tiene que abrir sin dejar el select en -1. */
      g.legado = {};
      for (const tok of ['leve', 'moderada']) {
        const r = await ev(`(function(){ var e=document.getElementById('em_grado');
          e.value = ${JSON.stringify(tok)};
          return { pedido: ${JSON.stringify(tok)}, idx: e.selectedIndex, leido: e.value } })()`);
        g.legado[tok] = r;
      }
      await reset();
    } catch (e) { g.err = String(e.message || e); }
    OUT.grupos.emsel = g;
  }

  /* ══ GRUPO color — EL VIOLETA DE «Significativa», EN LOS DOS TEMAS ════════════════════════ */
  if (hacer('color')) {
    const g = { temas: {} };
    try {
      for (const tema of ['oscuro', 'claro']) {
        const t = await ev(`window.__P.tema(${JSON.stringify(tema)})`);
        if (t.err) throw new Error('ABORTA: ' + t.err);
        const bloque = { tema: t, em: {}, et: {}, control: {} };
        await reset();
        /* Estenosis MITRAL por cada token. */
        for (const tok of ['sin', 'leve', 'moderada', 'severa']) {
          await ev(`window.__P.set('em_grado', ${JSON.stringify(tok)})`);
          await pausa(90);
          bloque.em[tok] = await ev(`window.__P.colorBtn('esten','mitral')`);
        }
        /* Estenosis TRICUSPIDEA por cada token. */
        for (const tok of ['sin', 'No significativa', 'Significativa']) {
          await ev(`window.__P.set('et_grado', ${JSON.stringify(tok)})`);
          await pausa(90);
          bloque.et[tok] = await ev(`window.__P.colorBtn('esten','tricuspide')`);
        }
        /* CONTROL NEGATIVO: las otras lesiones NO cambian de color con su grado mas grave. */
        await ev(`window.__P.set('ea_grado','severa')`);
        await ev(`window.__P.set('ep_grado','Severa')`);
        await ev(`window.__P.set('im_grado','4')`);
        await ev(`window.__P.set('it_grado','4')`);
        await pausa(120);
        bloque.control.ea = await ev(`window.__P.colorBtn('esten','aortica')`);
        bloque.control.ep = await ev(`window.__P.colorBtn('esten','pulmonar')`);
        bloque.control.im = await ev(`window.__P.colorBtn('insuf','mitral')`);
        bloque.control.it = await ev(`window.__P.colorBtn('insuf','tricuspide')`);
        g.temas[tema] = bloque;
      }
      /* ⚠️ LA CAPTURA ES REAL Y SE RECORTA SOBRE EL RECT VIVO. Un clip mas alto que el viewport
         sale en NEGRO —la pagina scrollea y lo que no esta renderizado no se dibuja—, asi que se
         pide el rect DESPUES de scrollIntoView y se declara al lado del archivo. */
      if (CAPTURA) {
        g.capturas = [];
        for (const tema of ['oscuro', 'claro']) {
          const t = await ev(`window.__P.tema(${JSON.stringify(tema)})`);
          if (t.err) throw new Error('ABORTA: ' + t.err);
          /* ⚠️ EL AVISO LEGAL VUELVE A MITAD DE CORRIDA Y OSCURECE LA CAPTURA ENTERA. La primera
             version de este bloque saco los cuatro PNG con el boton bajo el scrim de
             #modalAvisoEco: el violeta salia gris oscuro y getComputedStyle —que lee el estilo y
             no el pixel— decia rgb(237,233,254) al lado. Se despeja ANTES de cada captura y el
             estado del despeje viaja con ella. */
          g.despeje = await ev(`window.__P.despejar()`);
          await ev(`window.__P.set('em_grado','severa')`);
          await ev(`window.__P.set('et_grado','Significativa')`);
          await pausa(160);
          for (const [par, id] of [['em','sevbtn-esten-mitral'], ['et','sevbtn-esten-tricuspide']]) {
            const c = await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
              if(!e) return null; e.scrollIntoView({block:'center'});
              var r=e.getBoundingClientRect();
              /* ⚠️ EL CLIP DE Page.captureScreenshot VA EN COORDENADAS DE PAGINA Y getBoundingClientRect
                 DA LAS DEL VIEWPORT: en cuanto scrollIntoView scrollea, difieren en scrollY y el
                 recorte sale de otra parte de la pagina —la primera version saco el PNG de la
                 tricuspide en NEGRO, y el de la mitral salio bien solo porque ahi scrollY era 0—.
                 Se suma el scroll y se declara al lado. */
              return { x: Math.max(0, Math.round(r.left + window.scrollX)-150),
                       y: Math.max(0, Math.round(r.top + window.scrollY)-10),
                       w: Math.round(r.width)+300, h: Math.round(r.height)+20,
                       scroll: [Math.round(window.scrollX), Math.round(window.scrollY)],
                       dentro: r.width > 0 && r.height > 0 && r.top >= 0 && r.bottom <= window.innerHeight } })()`);
            if (!c) { g.capturas.push({ par, tema, err: 'sin nodo' }); continue; }
            if (!c.dentro) { g.capturas.push({ par, tema, err: 'fuera del viewport', c }); continue; }
            const shot = await cdp.send('Page.captureScreenshot',
              { format: 'png', clip: { x: c.x, y: c.y, width: c.w, height: c.h, scale: 2 } }, sessionId);
            const out = join(DEST, 'sevbtn-' + par + '-' + tema + '.png');
            await writeFile(out, Buffer.from(shot.data, 'base64'));
            g.capturas.push({ par, tema, archivo: out, rect: c });
          }
        }
      }
      await ev(`window.__P.tema('oscuro')`);
      await reset();
    } catch (e) { g.err = String(e.message || e); }
    OUT.grupos.color = g;
  }

  /* ══ GRUPO vti — EL VTI DE ENTRADA TRICUSPIDEO EN SU BORDE ════════════════════════════════ */
  if (hacer('vti')) {
    const g = { bordes: [], area: {}, borrado: {}, banda: [] };
    try {
      /* (1) EL BORDE, SOLO: sin ningun otro criterio cargado, para que lo que decida sea ESTE.
         Con el gradiente o el THP cargados por encima de su corte el veredicto seria el mismo por
         otra razon y la tabla no probaria nada. */
      for (const v of ['59.9', '60', '60.1']) {
        await reset();
        const t = await tipear('et_vti_diast', v);
        await pausa(140);
        g.bordes.push({ vti: v, tecleo: t,
          estado: await ev(`window.__P.etEstado()`),
          ref: await ev(`window.__P.etRef()`),
          foto: await ev(`window.__P.foto('et')`),
          informe: await ev(`window.__P.informe('estandar')`) });
      }
      /* (2) EL AREA POR CONTINUIDAD CON LOS MISMOS DATOS: tiene que ser IDENTICA a HEAD. El VTI de
         entrada es su DENOMINADOR, asi que agregarle un voto no puede moverla. */
      await reset();
      await tipear('tsvd_diametro', '25');
      await tipear('vti_tsvd', '14');
      const t70 = await tipear('et_vti_diast', '70');
      await pausa(160);
      g.area.con70 = { tecleo: t70, estado: await ev(`window.__P.etEstado()`),
                       ref: await ev(`window.__P.etRef()`), foto: await ev(`window.__P.foto('et')`) };
      /* (3) EL BORRADO: el grado se retira y la pastilla se apaga si la prendio la app. */
      await reset();
      const tv = await tipear('et_vti_diast', '75');
      await pausa(160);
      g.borrado.conDato = { tecleo: tv, foto: await ev(`window.__P.foto('et')`),
                            ref: await ev(`window.__P.etRef()`) };
      const bv = await borrar('et_vti_diast');
      await pausa(160);
      g.borrado.sinDato = { borrado: bv, foto: await ev(`window.__P.foto('et')`),
                            ref: await ev(`window.__P.etRef()`) };
      /* (4) LA BANDA DE PLAUSIBILIDAD por sus dos lados: dentro vota, fuera no gradua. */
      for (const v of ['99', '101']) {
        await reset();
        const t = await tipear('et_vti_diast', v);
        await pausa(140);
        g.banda.push({ vti: v, tecleo: t, estado: await ev(`window.__P.etEstado()`),
                       ref: await ev(`window.__P.etRef()`), foto: await ev(`window.__P.foto('et')`) });
      }
      /* (5) CONTROL NEGATIVO: un VTI por DEBAJO del corte con el gradiente SI cumpliendo: el
         veredicto sigue siendo significativa y lo sostiene el gradiente, no el VTI. */
      await reset();
      await tipear('et_gmedio', '8');
      await tipear('et_vti_diast', '30');
      await pausa(160);
      g.control = { estado: await ev(`window.__P.etEstado()`), ref: await ev(`window.__P.etRef()`),
                    foto: await ev(`window.__P.foto('et')`),
                    informe: await ev(`window.__P.informe('estandar')`) };
      await reset();
    } catch (e) { g.err = String(e.message || e); }
    OUT.grupos.vti = g;
  }

  /* ══ GRUPO controles — LO QUE ESTA TANDA NO PUEDE MOVER ═══════════════════════════════════ */
  if (hacer('controles')) {
    const g = {};
    try {
      await reset();
      /* Un escenario CARGADO, para que el control tenga denominador: un formulario vacio sale
         idéntico por construccion y no prueba nada. */
      const sembrado = [
        ['im_vc','6'], ['ia_vc','5'], ['it_vc','6'], ['ea_dtsvi','20'],
        ['vmax_ao','4.2'], ['gmedio_ao','45'], ['em_gmedio','12'],
        ['et_gmedio','8'], ['et_thp','200'], ['vp_vmax','3.5'], ['ip_pht','80'],
        ['onda_e','90'], ['onda_a','60'], ['tde','180'], ['eprima_sep','6'], ['eprima_lat','8'],
        ['ai_vol','40'], ['peso','70'], ['talla','170'], ['edad','60']
      ];
      g.sembrado = [];
      for (const [id, v] of sembrado) {
        try { g.sembrado.push(await tipear(id, v)); }
        catch (e) { g.sembrado.push({ id, err: String(e.message || e) }); }
      }
      await pausa(300);
      await ev(`window.__P.pintarVacio()`);
      await pausa(200);
      g.ajenos = await ev(`window.__P.ajenos()`);
      g.excel  = await ev(`window.__P.excel()`);
      g.informe = {};
      for (const est of ['estandar', 'detallado', 'conciso']) {
        g.informe[est] = await ev(`window.__P.informe(${JSON.stringify(est)})`);
      }
      g.fotos = {};
      for (const L of LESIONES) g.fotos[L.clave] = await ev(`window.__P.foto(${JSON.stringify(L.clave)})`);
      await reset();
    } catch (e) { g.err = String(e.message || e); }
    OUT.grupos.controles = g;
  }

  OUT.md5Fin = await md5(EXTERNO ? FARG : join(RAIZ, FILE));
  OUT.md5Igual = OUT.md5Ini === OUT.md5Fin;
  console.log(JSON.stringify(OUT, null, 1));
  try { cdp.close(); } catch (e) {}
  try { srv.close(); } catch (e) {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO: ' + (e && e.stack || e)); process.exit(1); });
