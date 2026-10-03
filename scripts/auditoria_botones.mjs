#!/usr/bin/env node
/**
 * auditoria_botones.mjs — sonda REUTILIZABLE de SOLO LECTURA para el reglamento de botones,
 * pastillas y grado final de las válvulas (docs/decisiones/valvulas-botones.md).
 *
 * NO es la suite clínica y no la toca. No muta index.html. Lo único que escribe es su JSON.
 *
 * Qué la distingue de scripts/_probe_sinapaga.mjs (de donde sale la infraestructura):
 *   · _probe_sinapaga llama a `valvSev.aplicar(...)` y a `toggleValvPill(...)` por código. Son las
 *     funciones que los botones invocan, pero NO son el gesto: saltean el menú, el stopPropagation,
 *     el cierre de otros menús y el repintado.
 *   · ésta entra por el dominio `Input` de CDP: clic de mouse real sobre el centro del nodo, y en
 *     el menú ▼ un segundo clic real sobre el <button role=menuitem> buscado POR SU TEXTO.
 *     Si el menú no ofrece la opción, la escena sale `gestoError` — que es justamente lo que hay
 *     que medir en la tricúspide, donde «Sin» no está en el menú.
 *
 * Límite declarado: la lista desplegada de un <select> nativo la dibuja el SO y no es DOM, así que
 * no se puede clickear. Ese gesto se emite como `change` real sobre el <select> enfocado — el mismo
 * evento que produce el navegador al elegir una opción. Es el único que no es un clic.
 *
 * Uso:
 *   node scripts/auditoria_botones.mjs                 > /tmp/aud.json
 *   node scripts/auditoria_botones.mjs --solo R7       # una regla
 *   node scripts/auditoria_botones.mjs --valv aortica  # una válvula
 *   node scripts/auditoria_botones.mjs --ver           # con el navegador a la vista
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const VER  = process.argv.includes('--ver');
const arg  = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const SOLO = arg('--solo');
const VALV = arg('--valv');

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
        const p = join(RAIZ, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
        if (!p.startsWith(RAIZ)) { rq.writeHead(403).end(); return; }
        const buf = await readFile(p);
        rq.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }).end(buf);
      } catch { rq.writeHead(404).end('no'); }
    });
    srv.listen(0, '127.0.0.1', () => res({ srv, port: srv.address().port }));
  });
}
async function abrirChrome(url) {
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-aud-'));
  let bin = null;
  for (const c of CHROMES) { try { await readFile(c); bin = c; break; } catch {} }
  if (!bin) throw new Error('No encontre Chrome/Chromium/Edge.');
  const args = ['--remote-debugging-port=0', `--user-data-dir=${perfil}`, '--no-first-run',
                '--no-default-browser-check', '--disable-extensions',
                '--window-size=1280,1000', url];
  if (!VER) args.unshift('--headless=new');
  const proc = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
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
   ⚠️ EL CUERPO ES UN TEMPLATE LITERAL: ni un acento grave adentro, tampoco en los comentarios.
   Un backtick cierra la cadena y el SyntaxError apunta decenas de lineas antes del culpable. */
const SONDA = `
/* Las OCHO lesiones, incluidas las cuatro que NO estan en SEV_SINC. El registro tiene solo
   ea/ia/em/im; la tricuspide y la pulmonar se describen aca a mano porque hay que poder
   fotografiarlas igual — medir «no existe» exige preguntar por el nodo. */
window.__A = {
  LES: {
    ea: { tipo:'esten', valv:'aortica',    select:'ea_grado',     aviso:'ea-manual-aviso', fund:'ea-fund', nota:'ea_fund_nota', sigla:'EAo', reg:1 },
    ia: { tipo:'insuf', valv:'aortica',    select:'ia_sev_final', aviso:'ia-manual-aviso', fund:'ia-fund', nota:'ia_fund_nota', sigla:'IAo', reg:1, oculto:'ia_grado' },
    em: { tipo:'esten', valv:'mitral',     select:'em_grado',     aviso:'em-manual-aviso', fund:'em-fund', nota:'em_fund_nota', sigla:'EM',  reg:1 },
    im: { tipo:'insuf', valv:'mitral',     select:'im_sev_final', aviso:'im-manual-aviso', fund:'im-fund', nota:'im_fund_nota', sigla:'IM',  reg:1, oculto:'im_grado' },
    et: { tipo:'esten', valv:'tricuspide', select:'et_grado',     aviso:null, fund:null, nota:null, sigla:'ET', reg:0 },
    it: { tipo:'insuf', valv:'tricuspide', select:'it_grado',     aviso:null, fund:null, nota:null, sigla:'IT', reg:0 },
    ep: { tipo:'esten', valv:'pulmonar',   select:'ep_grado',     aviso:null, fund:null, nota:null, sigla:'EP', reg:0 },
    ip: { tipo:'insuf', valv:'pulmonar',   select:'ip_grado',     aviso:null, fund:null, nota:null, sigla:'IP', reg:0 }
  },

  /* ── Lectores ───────────────────────────────────────────────────────────────────────────── */
  val(id) { const e = document.getElementById(id); return e ? e.value : null },
  txt(id) { const e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  existe(id) { return !!document.getElementById(id) },
  /* Visible de VERDAD: se sube por los ancestros. Un hijo con display normal dentro de un padre
     en display:none no tiene geometria, y mirar solo su propio style miente. */
  vis(id) { const e = document.getElementById(id); if (!e) return null;
    let n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  /* QUIEN oculta, no solo «esta oculto»: distingue «el boton lo cerro» de «la pestaña estaba
     cerrada», que es el denominador. */
  culpable(id) { const e = document.getElementById(id); if (!e) return null;
    let n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none')
        return (n.id ? ('#' + n.id) : ('.' + String(n.className || '?').split(' ').join('.'))) +
               (n === e ? ' (EL PROPIO NODO)' : '');
      n = n.parentNode; }
    return null },
  caja(id) { const e = document.getElementById(id); if (!e) return null;
    const r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) } },
  pill(valv, tipo) { try { return (typeof pillOn === 'function') ? pillOn(valv, tipo) : 'SIN pillOn' }
    catch(e) { return 'EXC' } },

  /* ── Revelar un campo que no tiene geometria ───────────────────────────────────────────────
     ⚠️ ESTO FALTABA Y ERA LA CAUSA DE UN HALLAZGO FALSO ENTERO. Los insumos de cada lesion NO
     viven junto al boton: unos estan en la pestaña DOPPLER (vmax_ao, gmedio_ao) y otros dentro
     del cajon de cuantificacion que el boton abre (avm_plan, im_vc, it_vc). Un campo en
     display:none no tiene geometria, el clic de foco cae en nada y el tipeo no entra — y la
     primera corrida informo «la pastilla no sigue al calculo» en seis de las ocho lesiones
     cuando lo que pasaba es que los campos estaban vacios.
     Sube por los ancestros ocultos y abre lo que corresponda con la funcion REAL de la app:
     showTab para las pestañas, toggleEteSeccion para los acordeones de valvula. Devuelve que
     tuvo que abrir, para que la escena lo declare en vez de disimularlo. */
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
        try { showTab(oid.slice(4)); abrio.push(oid); } catch(x) { return { err: 'showTab fallo en ' + oid, abrio: abrio } }
      } else if (oid.indexOf('ete-seccion-') === 0) {
        try { toggleEteSeccion(oid.replace('ete-seccion-','')); abrio.push(oid); } catch(x) { return { err: 'toggleEteSeccion fallo en ' + oid, abrio: abrio } }
      } else {
        /* Un bloque que no es pestaña ni acordeon: puede ser una tarjeta plegable (toggleCard)
           o una solapa interna (vpTab). Se busca el CONTROL REAL que lo abre y se devuelve su
           id para que Node le pegue un clic de mouse de verdad — no se fuerza el style, que
           seria armar el estado por codigo.
           Primero por el atributo onclick que nombre al bloque (cubre todos los toggleCard), y
           si no, por el mapa explicito de los casos que no se nombran. */
        var ctrl = null;
        if (oid) {
          var cand = Array.from(document.querySelectorAll('[onclick]')).find(function(b){
            return (b.getAttribute('onclick')||'').indexOf("'" + oid + "'") >= 0 });
          if (cand) { if (!cand.id) cand.id = '__aud_rev_' + oid; ctrl = cand.id; }
        }
        if (!ctrl) {
          /* Solapas internas cuyo handler NO nombra el pane. Declaradas una por una: adivinarlas
             es como se inventa un gesto que el medico no hace. */
          var MAPA = { 'vp-pane-med': 'vp-tab-med', 'vp-pane-morf': 'vp-tab-morf' };
          if (MAPA[oid] && document.getElementById(MAPA[oid])) ctrl = MAPA[oid];
        }
        if (!ctrl) return { err: 'oculto por ' + (oid ? ('#' + oid) : ('.' + String(oculto.className||'?'))) +
                                 ' — no se cual es el control que lo abre', abrio: abrio };
        return { necesitaClic: ctrl, abrio: abrio };
      }
    }
    return { abrio: abrio, ok: window.__A.vis(id) === true } },

  /* Centro del nodo en coordenadas de viewport, para el clic REAL. Lo scrollea primero: un nodo
     fuera de pantalla da coordenadas negativas y el clic cae en otra parte (o en nada). */
  centro(id) { const e = document.getElementById(id); if (!e) return null;
    e.scrollIntoView({ block:'center', inline:'center' });
    const r = e.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return { err: 'nodo sin geometria', w:0, h:0 };
    return { x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2),
             w: Math.round(r.width), h: Math.round(r.height) } },

  /* Centro del ITEM del menu ▼ cuyo texto matchea. Devuelve tambien el censo de lo ofrecido:
     medir que «Sin» NO esta en el menu de la tricuspide necesita la lista, no un null. */
  centroItem(tipo, valv, re) {
    const m = document.getElementById('sevmenu-' + tipo + '-' + valv);
    if (!m) return { err: 'no existe sevmenu-' + tipo + '-' + valv };
    const abierto = m.classList.contains('open');
    const items = Array.from(m.querySelectorAll('button'));
    const ofrece = items.map(function(b){ return (b.textContent||'').trim() });
    if (!abierto) return { err: 'el menu no esta abierto', ofrece: ofrece };
    const rx = new RegExp(re, 'i');
    const b = items.find(function(x){ return rx.test((x.textContent||'').trim()) });
    if (!b) return { err: 'el menu no ofrece ' + re, ofrece: ofrece };
    b.scrollIntoView({ block:'center' });
    const r = b.getBoundingClientRect();
    return { x: Math.round(r.left + r.width/2), y: Math.round(r.top + r.height/2),
             ofrece: ofrece, elegido: (b.textContent||'').trim() } },

  /* ── Denominador, UNA VEZ POR ESCENA ───────────────────────────────────────────────────────
     La pestaña Valvulas y los cuatro acordeones arrancan cerrados y limpiarCampos los vuelve a
     cerrar. Armarlo al inicio da geometria cero en todas las escenas siguientes y la app parece
     impecable. Devuelve el censo para que la escena pueda salir NO MEDIBLE. */
  denominador() {
    try { showTab('valvulas'); } catch(e) {}
    var toks = ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'];
    toks.forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && s.style.display === 'none') { try { toggleEteSeccion(tok); } catch(e) {} }
    });
    /* La pulmonar tiene un pane ANIDADO: vp_vmax e ip_vmax viven en #vp-pane-med, que arranca
       cerrado y que toggleEteSeccion NO abre. Sin esto el tipeo pulmonar no agarra —"nodo sin
       geometria"— y las escenas ep/ip miden sobre un denominador CERO: salen "sin alteraciones"
       y la app parece impecable. Se abren los DOS panes a la vez (son divs independientes) para
       no perder la geometria de vp_morf, que vive en el otro. */
    try { vpTab('med'); } catch(e) {}
    var pm = document.getElementById('vp-pane-morf');
    if (pm) pm.style.display = '';
    var vis = function(id){ var e = document.getElementById(id);
      return !!e && getComputedStyle(e).display !== 'none' };
    /* Censo GRANULAR, y queda REGISTRADO EN CADA ESCENA. Antes el denominador devolvia un conteo
       (secciones) y un solo booleano (panesVP), y un pane cerrado se perdia en el agregado. Ahora
       cada escena deja el estado de la pestaña, de cada acordeon y de cada pane anidado por
       separado: vp-pane-med y vp-pane-morf (donde viven vp_vmax e ip_vmax) y los panes del Doppler
       (dop-aortico y hermanos), donde viven vmax_ao y los recuadros de severidad. */
    var acordeones = {};
    toks.forEach(function(tok){ acordeones[tok.replace('valv-','')] = vis('ete-seccion-' + tok); });
    var ab = Object.keys(acordeones).filter(function(k){ return acordeones[k] }).length;
    var panes = { 'vp-pane-med': vis('vp-pane-med'), 'vp-pane-morf': vis('vp-pane-morf'),
                  'dop-aortico': vis('dop-aortico'), 'dop-mitral': vis('dop-mitral'),
                  'dop-tricusp': vis('dop-tricusp') };
    var panesVP = panes['vp-pane-med'] && panes['vp-pane-morf'];
    var tab = vis('tab-valvulas');
    return { tab: tab, secciones: ab, acordeones: acordeones, panes: panes, panesVP: panesVP,
             ok: tab && ab === 4 && panesVP } },

  /* «Nuevo estudio» de verdad, mas el reseteo de la memoria de proceso y de las claves de
     localStorage de las pastillas — que NO viajan con el estudio y contaminan la escena siguiente. */
  limpiar() {
    try { limpiarCampos(true); } catch(e) {}
    window.esqSevManual = {}; window._sevCalcAlFijar = {}; window._iaGradoCalc = null;
    ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){
        try { localStorage.removeItem('valv-pill-' + t + '-' + v); } catch(e){}
        try { if (window.__A.pill(v,t) === true) toggleValvPill(v,t); } catch(e){}
      });
    });
    return 1 },

  /* ── Las cuatro superficies de salida, UNA POR UNA ─────────────────────────────────────────
     Nunca «el informe y el Excel» en bloque: cada una tiene su propio emisor y se rompen por
     separado. El informe se pide en los TRES estilos. */
  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },
  tresEstilos() {
    var out = {};
    ['conciso','estandar','narrativo'].forEach(function(e){ out[e] = window.__A.informe(e) });
    try { setEstiloInforme('estandar') } catch(e){}
    return out },

  /* La foto completa de UNA lesion. Funciona igual para las cuatro que NO estan en el registro:
     ahi reg:0 y los nodos de aviso/cajon se preguntan y contestan null.
     SIN ACENTOS GRAVES EN ESTE BLOQUE, NI EN LOS COMENTARIOS: es el cuerpo de un template
     literal y un backtick lo cierra. Me costo una corrida en esta tanda. */
  foto(clave) {
    var L = window.__A.LES[clave]; if (!L) return { err: 'clave desconocida ' + clave };
    var wrap = L.tipo === 'insuf' ? ('gf-insuf-' + L.valv) : ('bloque-esten-' + L.valv);
    var C = (window.SEV_SINC || {})[clave] || null;
    return {
      enRegistro: !!C,
      /* El boton y su sub-boton ▼: medir que NO EXISTEN es el hallazgo de la pulmonar. */
      botonExiste: window.__A.existe('pill-' + L.tipo + '-' + L.valv),
      sevbtnExiste: window.__A.existe('sevbtn-' + L.tipo + '-' + L.valv),
      pill: window.__A.pill(L.valv, L.tipo),
      /* R2: el texto literal de la pastilla. «🟡 Severidad ▼» es el neutro. */
      pastilla: window.__A.txt('sevbtn-' + L.tipo + '-' + L.valv),
      /* R3/R10: lo que el informe usa. */
      sel: window.__A.val(L.select),
      selTxt: (function(){ var s = document.getElementById(L.select);
        return (s && s.selectedIndex >= 0) ? (s.options[s.selectedIndex].textContent||'').trim() : null })(),
      oculto: L.oculto ? window.__A.val(L.oculto) : null,
      manual: !!(window.esqSevManual && window.esqSevManual[clave]),
      calc: (function(){ try { return window.sevCalcPublicable ? window.sevCalcPublicable(clave) : 'SIN FUNCION' }
        catch(e){ return 'EXC' } })(),
      /* R6: la discrepancia, su aviso y su cajon. */
      discrepa: (function(){ try { return window.sevDiscrepa ? window.sevDiscrepa(clave) : 'SIN FUNCION' }
        catch(e){ return 'EXC' } })(),
      avisoExiste: L.aviso ? window.__A.existe(L.aviso) : false,
      aviso: L.aviso ? window.__A.txt(L.aviso) : null,
      avisoVis: L.aviso ? window.__A.vis(L.aviso) : null,
      fundExiste: L.fund ? window.__A.existe(L.fund) : false,
      fundVis: L.fund ? window.__A.vis(L.fund) : null,
      fundCulpa: L.fund ? window.__A.culpable(L.fund) : null,
      nota: L.nota ? window.__A.val(L.nota) : null,
      /* El bloque de grado final y QUIEN lo oculta. */
      wrapVis: window.__A.vis(wrap),
      wrapCaja: window.__A.caja(wrap),
      wrapCulpa: window.__A.culpable(wrap),
      /* Los tres estados de la clave de localStorage que gobierna valvAutoAbrirCajones:
         null = nadie la toco · '0' = el medico la cerro, no reabrir · '1' = abierta. */
      ls: (function(){ try { return localStorage.getItem('valv-pill-' + L.tipo + '-' + L.valv) }
        catch(e){ return 'EXC' } })()
    } },

  /* ── Excel: la fila de la lesion, sin DOM de por medio ─────────────────────────────────────
     No se exporta el archivo (eso abriria un download y el round-trip esta prohibido tocarlo):
     se le pregunta al MISMO emisor que arma la hoja. Si no se puede, se dice NO MEDIBLE en vez
     de inventar un PASA. */
  excel() {
    var out = { via: null, hallado: {} };
    try {
      if (typeof construirFilasLab === 'function') { out.via = 'construirFilasLab'; out.filas = construirFilasLab(); }
      else if (typeof labFilas === 'function') { out.via = 'labFilas'; out.filas = labFilas(); }
      else out.via = 'NO MEDIBLE: no encontre el emisor de filas';
    } catch(e) { out.via = 'EXC: ' + e.message }
    /* Los ocho campos que el Excel deberia llevar, preguntados por vPdf, que es el lector comun
       de las superficies de papel. */
    ['ea_grado','ia_grado','em_grado','im_grado','et_grado','it_grado','ep_grado','ip_grado']
      .forEach(function(id){ out.hallado[id] = window.__A.val(id) });
    return out },

  /* ── PDF: el texto que la tarjeta pre-PDF y el emisor van a imprimir ──────────────────────
     Tampoco se genera el PDF (jsPDF por CDN y un download). Se mide la TARJETA, que es la que
     el medico confirma, y los valores que el emisor leeria. */
  tarjeta() {
    var out = {};
    try { window.mostrarCardSeveridadValvular(function(){}) } catch(e) { return { err: e.message } }
    var ov = document.getElementById('pdf-review-overlay');
    if (!ov) return { err: 'no abrio la tarjeta' };
    out.texto = (ov.textContent || '').replace(/\\s+/g, ' ').trim();
    out.controles = Array.from(ov.querySelectorAll('select,input')).map(function(e){
      return { id: e.id || e.getAttribute('data-target') || '?', val: e.value } });
    try { ov.querySelector('#rev-confirm').click() } catch(e) {}
    out.cerro = !document.getElementById('pdf-review-overlay');
    return out }
};
`;

/* ══ Catálogo de escenas: regla × válvula ═════════════════════════════════════════════════════
   Cada escena declara el GESTO (clics y tipeos reales) y de qué lesiones saca la foto.
   `neg: 1` la marca como control negativo de su regla. */
const ESCENAS = [];
const push = (o) => ESCENAS.push(o);

/* Mediciones que producen un grado calculado de cada lesión. Son los insumos que el médico
   tipearía; se cargan por tipeo real en el campo. */
const MED = {
  ea: [['vmax_ao', '4.2'], ['gmedio_ao', '45']],   // → EAo severa
  ia: [['ia_vc', '7']],                            // → IAo severa
  em: [['avm_plan', '1.2']],                       // → EM severa
  im: [['im_vc', '8']],                            // → IM severa
  et: [['et_gmedio', '7']],                        // → ET significativa
  it: [['it_vc', '8']],                            // → IT severa
  ep: [['vp_vmax', '4.5']],                        // → EP severa
  ip: [['ip_vmax', '3.0']],                        // → IP (no gradúa sola)
};
/* El grado «real» (no «Sin») que cada menú ▼ ofrece, por su texto. */
const SEVERA = { ea: 'severa', ia: 'Severa', em: 'severa', im: 'Severa',
                 et: 'severa', it: 'Severa', ep: 'severa', ip: 'Severa' };
const SIN    = { ea: 'Sin estenosis', ia: 'Sin insuficiencia', em: 'Sin estenosis',
                 im: 'Sin insuficiencia', et: 'Sin estenosis', it: 'Sin insuficiencia',
                 ep: 'Sin estenosis', ip: 'Sin insuficiencia' };
/* El valor que el <select> de grado final toma para «Sin» y para un grado bajo. */
const SIN_VAL  = { ea: 'sin', ia: '0', em: 'sin', im: '0', et: 'sin', it: '0', ep: 'sin', ip: '' };
const LEVE_VAL = { ea: 'leve', ia: '1', em: 'leve', im: '1', et: 'leve', it: '1', ep: 'leve', ip: '1' };

const LESIONES = ['ea', 'ia', 'em', 'im', 'et', 'it', 'ep', 'ip'];
const VALV_DE  = { ea:'aortica', ia:'aortica', em:'mitral', im:'mitral',
                   et:'tricuspide', it:'tricuspide', ep:'pulmonar', ip:'pulmonar' };

LESIONES.forEach((k) => {
  const v = VALV_DE[k];
  const base = { lesion: k, valv: v, fotos: [k] };

  /* R1 — botón prendido = «hay valvulopatía». Se prende con clic real y se mira si el informe
     afirma la valvulopatía. Control negativo: sin tocar el botón, el informe no debe afirmarla. */
  push({ ...base, id: `R1-${k}`, regla: 'R1', desc: `R1 — clic en el botón y el informe afirma (${k})`,
         clic: [[v, k]], informe3: 1 });
  push({ ...base, id: `R1-${k}-neg`, regla: 'R1', neg: 1,
         desc: `R1 CONTROL NEGATIVO — sin tocar el botón el informe no afirma (${k})`,
         informe3: 1 });

  /* R2 — la pastilla muestra el grado y sigue sola al cálculo; sin cálculo dice «Severidad».
     Se tipean los insumos DESPUÉS de prender el botón: lo que se mide es si la pastilla se
     mueve sola. Control negativo: botón prendido y sin insumos → el neutro. */
  push({ ...base, id: `R2-${k}`, regla: 'R2', desc: `R2 — la pastilla sigue al cálculo (${k})`,
         clic: [[v, k]], tipear: MED[k] });
  push({ ...base, id: `R2-${k}-neg`, regla: 'R2', neg: 1,
         desc: `R2 CONTROL NEGATIVO — sin cálculo la pastilla dice «Severidad» (${k})`,
         clic: [[v, k]] });

  /* R3 — botón prendido y sin grado: el select muestra el sustantivo sin grado. */
  push({ ...base, id: `R3-${k}`, regla: 'R3', desc: `R3 — botón prendido sin grado (${k})`,
         clic: [[v, k]], informe3: 1 });

  /* R4 — el cálculo usa el criterio de la válvula. En la EA, el PEOR de los disponibles: se
     tipea una Vmax que gradúa leve y un gradiente medio que gradúa severa. Control negativo:
     los dos leves → leve. */
  if (k === 'ea') {
    push({ ...base, id: 'R4-ea-peor', regla: 'R4',
           desc: 'R4 — EA: Vmax leve (2,6) + G.medio severo (48) → debe mandar el PEOR',
           clic: [[v, k]], tipear: [['vmax_ao', '2.6'], ['gmedio_ao', '48']] });
    push({ ...base, id: 'R4-ea-neg', regla: 'R4', neg: 1,
           desc: 'R4 CONTROL NEGATIVO — los dos leves (Vmax 2,6 · G.medio 18) → leve',
           clic: [[v, k]], tipear: [['vmax_ao', '2.6'], ['gmedio_ao', '18']] });
  } else {
    push({ ...base, id: `R4-${k}`, regla: 'R4', desc: `R4 — el cálculo de la válvula corre (${k})`,
           clic: [[v, k]], tipear: MED[k] });
  }

  /* R5 — el grado a mano se mantiene mientras el calculado no cambie; si cambia, vuelve a
     automático. Dos escenas: (a) se fija a mano y se re-tipea el MISMO valor → se mantiene;
     (b) se fija a mano y se cambia el insumo a otro grado → vuelve a automático.
     El control negativo es (a): si las dos soltaran, la sonda no distingue el gesto. */
  push({ ...base, id: `R5-${k}-mantiene`, regla: 'R5', neg: 1,
         desc: `R5 CONTROL NEGATIVO — calculado sin cambiar: el manual se MANTIENE (${k})`,
         tipear: MED[k], clic: [[v, k]], menu: [[k, LEVE_VAL[k] === '1' ? 'Leve' : 'leve']],
         luego: MED[k] });
  push({ ...base, id: `R5-${k}-suelta`, regla: 'R5',
         desc: `R5 — el calculado CAMBIA: vuelve a automático (${k})`,
         tipear: MED[k], clic: [[v, k]], menu: [[k, LEVE_VAL[k] === '1' ? 'Leve' : 'leve']],
         luego: (k === 'ea' ? [['vmax_ao', '2.6'], ['gmedio_ao', '18']]
               : k === 'ia' ? [['ia_vc', '2']]
               : k === 'em' ? [['avm_plan', '2.8']]
               : k === 'im' ? [['im_vc', '2']]
               : k === 'et' ? [['et_gmedio', '2']]
               : k === 'it' ? [['it_vc', '2']]
               : k === 'ep' ? [['vp_vmax', '1.2']]
               : [['ip_vmax', '1.2']]) });

  /* R6 — lo elegido difiere del cálculo: aviso rojo + cajón, y el motivo al informe.
     Se tipea el motivo en el cajón por tipeo real y se piden los tres estilos.
     Control negativo: lo elegido COINCIDE con el cálculo → ni aviso ni cajón. */
  push({ ...base, id: `R6-${k}`, regla: 'R6',
         desc: `R6 — grado a mano DISTINTO del calculado: aviso y cajón (${k})`,
         tipear: MED[k], clic: [[v, k]], menu: [[k, LEVE_VAL[k] === '1' ? 'Leve' : 'leve']],
         notaTipear: 'jet excentrico', informe3: 1 });
  push({ ...base, id: `R6-${k}-neg`, regla: 'R6', neg: 1,
         desc: `R6 CONTROL NEGATIVO — coincide con el calculado: sin aviso ni cajón (${k})`,
         tipear: MED[k], clic: [[v, k]], menu: [[k, SEVERA[k]]], informe3: 1 });

  /* R7 — «Sin» apaga el botón; con un cálculo distinto, aviso y cajón visibles AUNQUE el botón
     esté apagado. Por los DOS gestos: el menú ▼ y el desplegable de grado final.
     Control negativo: un grado real por el mismo menú NO debe apagar el botón. */
  push({ ...base, id: `R7-${k}-menu`, regla: 'R7',
         desc: `R7 — «Sin» por el menú ▼ apaga el botón, con cálculo severo (${k})`,
         tipear: MED[k], clic: [[v, k]], menu: [[k, SIN[k]]], informe3: 1 });
  push({ ...base, id: `R7-${k}-select`, regla: 'R7',
         desc: `R7 — «Sin» por el desplegable de grado final (${k})`,
         tipear: MED[k], clic: [[v, k]], sel: [[k, SIN_VAL[k]]], informe3: 1 });
  push({ ...base, id: `R7-${k}-neg`, regla: 'R7', neg: 1,
         desc: `R7 CONTROL NEGATIVO — un grado REAL por el menú no apaga el botón (${k})`,
         tipear: MED[k], clic: [[v, k]], menu: [[k, SEVERA[k]]] });

  /* R8 — apagar el botón a mano apaga el grado: vuelve a «Severidad», y se borran grado y
     fundamento. Control negativo: apagar un botón que no tenía grado no borra nada. */
  push({ ...base, id: `R8-${k}`, regla: 'R8',
         desc: `R8 — se apaga el botón a mano con grado y motivo puestos (${k})`,
         tipear: MED[k], clic: [[v, k]], menu: [[k, LEVE_VAL[k] === '1' ? 'Leve' : 'leve']],
         notaTipear: 'ajuste clinico', cerrar: [[v, k]], informe3: 1 });
  push({ ...base, id: `R8-${k}-neg`, regla: 'R8', neg: 1,
         desc: `R8 CONTROL NEGATIVO — se apaga un botón sin grado: nada que borrar (${k})`,
         clic: [[v, k]], cerrar: [[v, k]] });

  /* R9 — botón prendido sin grado: el informe dice «con estenosis»/«con insuficiencia» y el
     EN SUMA la sigla más «presente». Es la misma escena que R3, con la lectura puesta en el
     texto de las dos superficies. */
  push({ ...base, id: `R9-${k}`, regla: 'R9',
         desc: `R9 — botón prendido sin grado: informe «con …» y EN SUMA «${k} presente»`,
         clic: [[v, k]], informe3: 1 });

  /* R10 — el informe usa el grado final y NO el estado del botón: se fija un grado y se APAGA
     el botón; el grado tiene que seguir saliendo (salvo lo que la R8 borre).
     Control negativo: botón prendido con grado → el mismo grado sale. */
  push({ ...base, id: `R10-${k}`, regla: 'R10',
         desc: `R10 — grado fijado y botón apagado: el informe usa el grado (${k})`,
         tipear: MED[k], clic: [[v, k]], menu: [[k, SEVERA[k]]], cerrar: [[v, k]], informe3: 1 });

  /* R11 — EN SUMA: sigla + grado, las leves incluidas, las frases cortas del fundamento.
     Se fija un grado LEVE a propósito: la regla dice que las leves van. */
  push({ ...base, id: `R11-${k}-leve`, regla: 'R11',
         desc: `R11 — EN SUMA con grado LEVE: sigla + grado (${k})`,
         tipear: MED[k], clic: [[v, k]], menu: [[k, LEVE_VAL[k] === '1' ? 'Leve' : 'leve']],
         notaTipear: 'jet excentrico', informe3: 1 });

  /* R12 — borrar un dato no retira el grado. Se tipea, se gradúa solo, y se BORRA el insumo. */
  push({ ...base, id: `R12-${k}`, regla: 'R12',
         desc: `R12 — se borra el insumo y el grado no se retira (${k})`,
         clic: [[v, k]], tipear: MED[k], borrar: MED[k].map((p) => p[0]), informe3: 1 });

  /* R15 — el modelo completo existe para esta lesión: botón, sub-botón ▼, pastilla, select,
     aviso y cajón. Es censo de nodos, no comportamiento; va sin gesto más que abrir. */
  push({ ...base, id: `R15-${k}`, regla: 'R15', desc: `R15 — censo del modelo (${k})`,
         clic: [[v, k]] });
});

/* R13 — «Mixta» nunca sola: se listan las dos lesiones. Se prenden los DOS botones de una
   válvula con grado en cada uno. Control negativo: una sola lesión → no debe decir «mixta». */
['aortica', 'mitral', 'tricuspide'].forEach((v) => {
  const par = v === 'aortica' ? ['ea', 'ia'] : v === 'mitral' ? ['em', 'im'] : ['et', 'it'];
  push({ id: `R13-${v}`, regla: 'R13', valv: v, lesion: par[0], fotos: par,
         desc: `R13 — las dos lesiones graduadas en la ${v}: «mixta» no puede ir sola`,
         tipear: [...MED[par[0]], ...MED[par[1]]],
         clic: [[v, par[0]], [v, par[1]]],
         menu: [[par[0], SEVERA[par[0]]], [par[1], SEVERA[par[1]]]], informe3: 1 });
  push({ id: `R13-${v}-neg`, regla: 'R13', neg: 1, valv: v, lesion: par[0], fotos: [par[0]],
         desc: `R13 CONTROL NEGATIVO — una sola lesión en la ${v}: no dice «mixta»`,
         tipear: MED[par[0]], clic: [[v, par[0]]], menu: [[par[0], SEVERA[par[0]]]], informe3: 1 });
});

/* R14 — las tres excepciones, una escena cada una. */
push({ id: 'R14-esclerosis', regla: 'R14', valv: 'aortica', lesion: 'ea', fotos: ['ea'],
       desc: 'R14 — «Esclerosis» NO abre cajón',
       tipear: MED.ea, clic: [['aortica', 'ea']], sel: [['ea', 'esclerosis']], informe3: 1 });
push({ id: 'R14-esclerosis-neg', regla: 'R14', neg: 1, valv: 'aortica', lesion: 'ea', fotos: ['ea'],
       desc: 'R14 CONTROL NEGATIVO — «Leve» en la misma escena SÍ abre cajón',
       tipear: MED.ea, clic: [['aortica', 'ea']], sel: [['ea', 'leve']] });
push({ id: 'R14-em-sinclasif', regla: 'R14', valv: 'mitral', lesion: 'em', fotos: ['em'],
       desc: 'R14 — EM sin clasificar no discrepa',
       clic: [['mitral', 'em']], sel: [['em', 'sin']], informe3: 1 });
push({ id: 'R14-prot-mitral', regla: 'R14', valv: 'mitral', lesion: 'em', fotos: ['em', 'im'],
       desc: 'R14 — prótesis mitral en silencio',
       morf: [['vm_morf', 'Prótesis mecánica']], tipear: MED.em,
       clic: [['mitral', 'em']], informe3: 1 });
push({ id: 'R14-prot-mitral-neg', regla: 'R14', neg: 1, valv: 'mitral', lesion: 'em', fotos: ['em'],
       desc: 'R14 CONTROL NEGATIVO — la MISMA escena con mitral nativa sí gradúa',
       tipear: MED.em, clic: [['mitral', 'em']], informe3: 1 });

/* ── Durabilidad: guardar y reabrir, y «Nuevo estudio» ──────────────────────────────────────
   La pastilla es estado del navegador, no del estudio (PENDIENTES). Lo que se mide es si el
   mismo estudio firma lo mismo al reabrirlo. Control: la IM, que ya tiene `recalcular`. */
['ea', 'ia', 'em', 'im', 'et'].forEach((k) => {
  push({ id: `DUR-${k}`, regla: 'DUR', valv: VALV_DE[k], lesion: k, fotos: [k],
         desc: `Durabilidad — guardar y reabrir con grado a mano y motivo (${k})`,
         tipear: MED[k], clic: [[VALV_DE[k], k]],
         menu: [[k, LEVE_VAL[k] === '1' ? 'Leve' : 'leve']],
         notaTipear: 'jet excentrico', guardarReabrir: 1, informe3: 1 });
});
/* El gesto «Sin» por el desplegable y DESPUÉS reabrir el botón: el hueco declarado de la
   aórtica («Sin» no es durable). La mitral al lado como control, que sí lo conserva. */
['ea', 'em'].forEach((k) => {
  push({ id: `VUELTA-${k}`, regla: 'DUR', valv: VALV_DE[k], lesion: k, fotos: [k],
         desc: `Durabilidad — «Sin» por el desplegable y se REABRE el botón (${k})`,
         tipear: MED[k], clic: [[VALV_DE[k], k]], sel: [[k, SIN_VAL[k]]],
         reabrir: [[VALV_DE[k], k]], informe3: 1 });
});
/* «Nuevo estudio»: que no quede nada del anterior. */
push({ id: 'NUEVO-ea', regla: 'DUR', valv: 'aortica', lesion: 'ea', fotos: ['ea'],
       desc: 'Durabilidad — «Nuevo estudio» después de graduar a mano: no queda rastro',
       tipear: MED.ea, clic: [['aortica', 'ea']], menu: [['ea', 'leve']],
       notaTipear: 'jet excentrico', nuevoEstudio: 1, informe3: 1 });

/* ── Tarjeta pre-PDF y Excel, en una escena con grado a mano por válvula ────────────────── */
['ea', 'im', 'et'].forEach((k) => {
  push({ id: `PDF-${k}`, regla: 'SUP', valv: VALV_DE[k], lesion: k, fotos: [k],
         desc: `Superficies — tarjeta pre-PDF y filas de Excel con grado a mano (${k})`,
         tipear: MED[k], clic: [[VALV_DE[k], k]],
         menu: [[k, LEVE_VAL[k] === '1' ? 'Leve' : 'leve']],
         tarjeta: 1, excel: 1, informe3: 1 });
});

/* ── Medición adicional, solo lectura: los recuadros de severidad del Doppler ───────────────
   El caso observado por Maicol: con Vmax 2,2 m/s el recuadro aórtico dice «Leve — por velocidad
   (Vmáx ≥4,0 m/s · G. medio ≥40 mmHg)», o sea el grado de UN escalón con los umbrales de OTRO.
   Se barre una escala de Vmax para ver dónde el texto aclaratorio deja de corresponder. */
const DOPPLER = [
  { id: 'DOP-ao-1.8', campo: 'vmax_ao', val: '1.8' },
  { id: 'DOP-ao-2.2', campo: 'vmax_ao', val: '2.2' },
  { id: 'DOP-ao-3.2', campo: 'vmax_ao', val: '3.2' },
  { id: 'DOP-ao-4.5', campo: 'vmax_ao', val: '4.5' },
  { id: 'DOP-em-1.2', campo: 'avm_plan', val: '1.2' },
  { id: 'DOP-em-1.8', campo: 'avm_plan', val: '1.8' },
  { id: 'DOP-em-2.8', campo: 'avm_plan', val: '2.8' },
];

/* ══ Clasificación de errores de gesto: AUSENCIA (hallazgo) vs INSTRUMENTACIÓN (invalida) ══════
   Un gesto puede fallar por dos motivos opuestos, y confundirlos es el defecto que esta tanda
   endurece:
   · AUSENCIA ESTRUCTURAL = el hallazgo, dato legítimo. La pulmonar no tiene botón ni sub-botón
     (regla 15); la tricúspide no ofrece «Sin» en el menú ▼ ni su <select> tiene el token «sin»;
     ni la tricúspide ni la pulmonar tienen cajón de fundamento. Son los 56 errores de gesto que la
     auditoría declara como MEDICIÓN de ausencia, no como falla de la sonda.
   · INSTRUMENTACIÓN = la sonda no pudo ejecutar un gesto donde el afordance SÍ existe: nodo sin
     geometría, el tipeo no quedó, el menú no abrió, showTab/toggleEteSeccion tiraron, una
     excepción. Eso INVALIDA la escena y jamás puede salir «ok» — es justo lo que pasaba en la
     primera escena antes de la espera explícita.
   La lista blanca de abajo es cerrada: lo que no matchee cuenta como instrumentación. Los patrones
   están atados a la válvula concreta (pulmonar/tricúspide) para que un typo en un id de válvula con
   registro —p. ej. #pill-esten-aortica— caiga como instrumentación y no se disfrace de ausencia. */
const AUSENCIA_ESPERADA = [
  /no existe #(pill|sevbtn)-(esten|insuf)-pulmonar/,          // la pulmonar no tiene botón ni ▼
  /no existe sevmenu-(esten|insuf)-pulmonar/,
  /abriendo el menú: no existe #sevbtn-(esten|insuf)-pulmonar/,
  /el menu no ofrece (Sin estenosis|Sin insuficiencia)/,      // la tricúspide no ofrece «Sin» en el ▼
  /EL SELECT RECHAZO (sin|0) \(opciones: Sin /,               // et_grado/it_grado: sus value son texto
  /NO EXISTE cajón de fundamento para (et|it|ep|ip)/,         // tri/pulmonar sin cajón
];
const esAusenciaEsperada = (s) => AUSENCIA_ESPERADA.some((re) => re.test(s));
/* Junta TODOS los strings de error de una escena: el .err de cada gesto (clic/tipear/menú/select) y
   el aviso de «NO EXISTE cajón» que viaja en .nota sin campo .err. */
function erroresDeEscena(out) {
  const errs = [];
  for (const g of (out.gestos || [])) {
    if (g.err) errs.push(typeof g.err === 'string' ? g.err : JSON.stringify(g.err));
    if (typeof g.nota === 'string' && /NO EXISTE cajón/.test(g.nota)) errs.push(g.nota);
  }
  return errs;
}

// ══════════════════════════════════════════════════════════════════════════════════════════════
let servidor = null, chrome = null;
try {
  /* md5 de index.html ANTES de arrancar. La sonda es de solo lectura; si al final no coincide,
     algo escribió el archivo y ninguna medición de la corrida vale. */
  const fuente = await readFile(join(RAIZ, 'index.html'));
  const MD5_ANTES = createHash('md5').update(fuente).digest('hex');
  process.stderr.write(`  md5 index.html antes — ${MD5_ANTES}\n`);

  const s = await servir(); servidor = s.srv;
  chrome = await abrirChrome(`http://127.0.0.1:${s.port}/index.html`);
  const cdp = await conectar(chrome.wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const page = targetInfos.find((t) => t.type === 'page');
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: page.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send("Page.enable", {}, sessionId);
  await cdp.send("Page.bringToFront", {}, sessionId).catch(() => {});
  await cdp.send('Input.setIgnoreInputEvents', { ignore: false }, sessionId).catch(() => {});

  const ev = async (expr) => {
    const r = await cdp.send('Runtime.evaluate', {
      expression: `(function(){ ${expr} })()`, returnByValue: true, awaitPromise: true,
    }, sessionId);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || 'error en la pagina');
    return r.result.value;
  };
  const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ── Los gestos reales, del lado de Node ──────────────────────────────────────────────────
     Un clic de verdad: mousePressed + mouseReleased en el centro del nodo, con el nodo ya
     scrolleado a la vista. Si el nodo no existe o no tiene geometría, devuelve el motivo —
     que es un hallazgo, no un error de la sonda. */
  async function clicEn(id) {
    const c = await ev(`return window.__A.centro(${JSON.stringify(id)});`);
    if (!c) return `no existe #${id}`;
    if (c.err) return `#${id}: ${c.err}`;
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: c.x, y: c.y }, sessionId);
    await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
    await pausa(90);
    return null;
  }
  /* Elegir en el menú ▼: clic en el sub-botón y clic en el item, buscado por su texto. */
  async function elegirEnMenu(lesion, textoRe) {
    const L = { ea:['esten','aortica'], ia:['insuf','aortica'], em:['esten','mitral'],
                im:['insuf','mitral'], et:['esten','tricuspide'], it:['insuf','tricuspide'],
                ep:['esten','pulmonar'], ip:['insuf','pulmonar'] }[lesion];
    const e1 = await clicEn(`sevbtn-${L[0]}-${L[1]}`);
    if (e1) return { err: `abriendo el menú: ${e1}` };
    const it = await ev(`return window.__A.centroItem(${JSON.stringify(L[0])}, ${JSON.stringify(L[1])}, ${JSON.stringify(textoRe)});`);
    if (!it || it.err) return { err: it ? it.err : 'sin respuesta', ofrece: it ? it.ofrece : null };
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: it.x, y: it.y }, sessionId);
    await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: it.x, y: it.y, button: 'left', clickCount: 1 }, sessionId);
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: it.x, y: it.y, button: 'left', clickCount: 1 }, sessionId);
    await pausa(120);
    return { ofrece: it.ofrece, elegido: it.elegido };
  }
  /* Tipeo real: clic de foco y una TECLA POR CARÁCTER (`dispatchKeyEvent type:'char'`), que es
     lo que produce un teclado de verdad.
     ⚠️ ANTES ESTO USABA `Input.insertText` Y NO ESCRIBÍA NADA. Los gestos no devolvían error, los
     campos quedaban vacíos, y la sonda informó «la pastilla no sigue al cálculo» en seis de las
     ocho lesiones — un hallazgo falso entero, porque nadie preguntaba si el número había quedado.
     Ahora hay LECTURA DE VUELTA OBLIGATORIA: si el campo no termina con el valor pedido, esto
     devuelve el motivo y la escena sale marcada. Una sonda que no puede escribir tiene que
     decirlo, no contestar que la app no calcula. */
  async function tipear(id, valor) {
    /* Revelar primero: el campo puede estar en otra pestaña, en un acordeón cerrado, en una
       tarjeta plegada o en una solapa interna, y sin geometría el clic de foco cae en nada.
       `revelar` abre lo que sabe abrir solo y devuelve el id del control cuando hace falta un
       clic de mouse — que se lo da esta función, no la página. */
    let rev = await ev(`return window.__A.revelar(${JSON.stringify(id)});`);
    for (let i = 0; i < 4 && rev && rev.necesitaClic; i++) {
      await clicEn(rev.necesitaClic);
      rev = await ev(`return window.__A.revelar(${JSON.stringify(id)});`);
    }
    let c = await ev(`return window.__A.centro(${JSON.stringify(id)});`);
    let via = 'clic';
    if (!c) return `no existe #${id}`;
    if (c.err) {
      /* Sigue sin geometría: lo oculta el botón de la válvula, no una pestaña. Se enfoca por DOM
         y se tipea igual, pero queda DECLARADO que ese gesto no fue un clic. */
      via = `foco-dom (${rev && rev.err ? rev.err : c.err})`;
    } else {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
    }
    /* Vaciar y enfocar. `select()` deja el contenido marcado para que la primera tecla lo pise,
       que es el gesto del médico corrigiendo un valor. */
    const hay = await ev(`var e=document.getElementById(${JSON.stringify(id)});
      if(!e) return 'NO EXISTE'; e.focus(); e.value=''; try{ e.select() }catch(x){} return 1;`);
    if (hay === 'NO EXISTE') return `no existe #${id}`;
    /* ⚠️ EL `text` VA SÓLO EN EL `char`. Mandarlo también en el `keyDown` inserta el carácter DOS
       veces: la primera corrida con teclas dejó «1.2» como «11..22» y «7» como «77», y el
       veredicto de la escena salió de un número que el médico nunca tipeó. */
    for (const ch of String(valor)) {
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: ch }, sessionId);
      await cdp.send('Input.dispatchKeyEvent', { type: 'char', text: ch, unmodifiedText: ch, key: ch }, sessionId);
      await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: ch }, sessionId);
    }
    /* `change` y `blur`, que es lo que el navegador manda al salir del campo. El `input` ya lo
       produjo cada tecla. */
    await ev(`var e=document.getElementById(${JSON.stringify(id)}); if(e){
      e.dispatchEvent(new Event('change',{bubbles:true})); e.blur(); } return 1;`);
    await pausa(80);
    /* LECTURA DE VUELTA. Es la línea que faltaba. */
    const quedo = await ev(`var e=document.getElementById(${JSON.stringify(id)}); return e ? e.value : null;`);
    if (String(quedo) !== String(valor))
      return `EL TIPEO NO QUEDÓ en #${id}: pedí ${JSON.stringify(String(valor))} y quedó ${JSON.stringify(String(quedo))} (via ${via})`;
    return null;
  }
  /* El <select> de grado final. Único gesto que no es un clic: la lista nativa no es DOM. */
  async function elegirEnSelect(id, valor) {
    const c = await ev(`return window.__A.centro(${JSON.stringify(id)});`);
    if (c && !c.err) {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
    }
    const r = await ev(`var e=document.getElementById(${JSON.stringify(id)}); if(!e) return 'NO EXISTE';
      e.focus(); e.value=${JSON.stringify(String(valor))};
      /* DENOMINADOR: un <select> rechaza en silencio un value que no es una de sus opciones y
         queda vacío. Si no quedó, la escena no probó nada y hay que decirlo. */
      if (String(e.value) !== ${JSON.stringify(String(valor))})
        return 'EL SELECT RECHAZO ' + ${JSON.stringify(String(valor))} + ' (opciones: ' +
          Array.from(e.options).map(function(o){return o.value}).join('|') + ')';
      e.dispatchEvent(new Event('change',{bubbles:true})); e.blur(); return null;`);
    await pausa(120);
    return r;
  }

  /* Arranque: la app pide una clave en sessionStorage. */
  await ev(`try{sessionStorage.setItem('ett_auth','1');}catch(e){} location.reload(); return 1;`);
  /* ── Espera EXPLÍCITA de inicialización — NO un tick ───────────────────────────────────────────
     Primero el DOM: readyState 'complete' (que window.load disparó, o sea que los ~20 handlers de
     DOMContentLoaded ya corrieron) + todas las funciones y globales que usa la sonda. Esperar sólo
     a `generarInforme` —como hacía antes— no alcanzaba: se define temprano, con la página a medio
     inicializar. Esto es condición necesaria; el calentamiento de gesto de más abajo es la que
     cierra la carrera de verdad. */
  const LISTO = `
    if (document.readyState !== 'complete') return { listo:false, por:'readyState=' + document.readyState };
    var faltan = ['generarInforme','pillOn','toggleEteSeccion','vpTab','showTab','limpiarCampos',
                  'sevCalcPublicable','toggleCard','toggleValvPill']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (faltan.length) return { listo:false, por:'faltan funciones: ' + faltan.join(',') };
    if (!window.SEV_SINC) return { listo:false, por:'SEV_SINC sin definir' };
    if (!document.getElementById('informe_texto')) return { listo:false, por:'sin informe_texto' };
    if (!document.getElementById('vmax_ao')) return { listo:false, por:'sin vmax_ao' };
    return { listo:true };
  `;
  let est = null;
  for (let i = 0; i < 160; i++) {
    await pausa(100);
    est = await ev(LISTO).catch((e) => ({ listo:false, por:'exc ' + e.message }));
    if (est && est.listo) break;
  }
  if (!est || !est.listo) throw new Error('la app no termino de inicializar: ' + (est ? est.por : 'sin respuesta'));
  await ev(SONDA + ' return 1;');
  await ev(`try{ if (typeof cerrarAvisoEco==='function') cerrarAvisoEco(); }catch(e){} return 1;`);

  /* ── CALENTAMIENTO EXPLÍCITO DE GESTO — acá se cierra la carrera de arranque ───────────────────
     ⚠️ CAUSA MEDIDA. Correr `--solo R11` dos veces desde cero daba escenas[0] DISTINTAS, y la
     primera fallaba en las dos corridas: la pastilla a veces no prendía (`quedo:false`), el menú
     ▼ no abría («el menu no esta abierto») y el tipeo de `vmax_ao` salía «nodo sin geometria».
     Pero NO es layout ni funciones: medido con una sonda aparte, a los 0 ms el DOM ya está armado
     (pill 415×44, vmax_ao 256×27 apenas se abre #dop-aortico) y el PRIMER clic CDP sí registra.
     Lo que falla es el PRIMER round-trip de gesto completo tras `location.reload()`: la primera
     secuencia clic→revelar→tipear es flaky, y a partir de la segunda es estable —por eso en el
     barrido completo R11-ea (que nunca es la primera escena) PASA y en `--solo R11` (donde sí lo
     es) fallaba—. No se arregla con un `pausa` mayor (el tiempo no lo cambia: a los 5 s seguía
     igual); se arregla ESPERANDO AL GESTO REAL: se repite clic en el pill + tipeo en `vmax_ao`
     con lectura de vuelta hasta que un round-trip entra limpio, y recién ahí arranca el barrido.
     Es el gesto que fallaba, verificado directo, no un retardo a ciegas. */
  let calentado = null;
  for (let i = 0; i < 25; i++) {
    await ev(`window.__A.limpiar(); return 1;`);
    await ev(`return window.__A.denominador();`);
    const ec = await clicEn('pill-esten-aortica');
    const et = await tipear('vmax_ao', '3.1');
    const quedo = await ev(`return window.__A.val('vmax_ao');`);
    const prendio = await ev(`return window.__A.pill('aortica','esten');`);
    if (!ec && !et && String(quedo) === '3.1' && prendio === true) { calentado = i; break; }
    await pausa(150);
  }
  await ev(`window.__A.limpiar(); return 1;`);
  if (calentado === null) throw new Error('no se pudo calentar la sonda: el gesto clic+tipeo no round-trippea');
  process.stderr.write(`  sonda calentada — round-trip de gesto limpio en el intento ${calentado + 1}\n`);

  const den0 = await ev(`return window.__A.denominador();`);
  process.stderr.write(`  denominador inicial — ${JSON.stringify(den0)}\n`);
  if (!den0.ok) process.stderr.write('  ⚠️ el denominador NO se puede armar: ninguna geometría de esta corrida vale\n');

  /* `EA_ESCALON_SIN_GRADO` es un const LOCAL del emisor: no se lee desde la página, se lee de
     la fuente, que es donde vive. */
  const txtFuente = fuente.toString('utf8');
  const mEsc = txtFuente.match(/const EA_ESCALON_SIN_GRADO = (\w+);/);

  const salida = {
    md5Antes: MD5_ANTES,
    escalonAortico: mEsc ? mEsc[1] : 'NO ENCONTRADO',
    denominadorInicial: den0,
    /* Censo de nodos del modelo, por lesión. Es el hallazgo estructural y se mide una vez. */
    censo: await ev(`var o={}; Object.keys(window.__A.LES).forEach(function(k){
      var L=window.__A.LES[k];
      o[k]={ enRegistro: !!(window.SEV_SINC||{})[k],
             boton: window.__A.existe('pill-'+L.tipo+'-'+L.valv),
             sevbtn: window.__A.existe('sevbtn-'+L.tipo+'-'+L.valv),
             menu: window.__A.existe('sevmenu-'+L.tipo+'-'+L.valv),
             select: window.__A.existe(L.select),
             aviso: L.aviso ? window.__A.existe(L.aviso) : false,
             cajon: L.fund ? window.__A.existe(L.fund) : false,
             nota: L.nota ? window.__A.existe(L.nota) : false };
      }); return o;`),
    escenas: [], doppler: [],
  };

  const filtradas = ESCENAS.filter((e) =>
    (!SOLO || e.regla === SOLO || e.id.startsWith(SOLO)) && (!VALV || e.valv === VALV));
  process.stderr.write(`  ${filtradas.length} escenas (de ${ESCENAS.length})\n`);

  for (const e of filtradas) {
    const out = { id: e.id, regla: e.regla, valv: e.valv, lesion: e.lesion, desc: e.desc,
                  neg: !!e.neg, gestos: [] };
    try {
      /* Denominador por escena, DESPUÉS de limpiar y antes de cualquier medición. */
      await ev(`window.__A.limpiar(); return 1;`);
      out.den = await ev(`return window.__A.denominador();`);
      /* El nombre es obligatorio para guardar: sin esto guardarInforme hace toast y vuelve false,
         y la escena fallaría por un motivo que no es el que mide. */
      await ev(`var n=document.getElementById('nombre'); if(n){n.value='Auditoria Botones';
        n.dispatchEvent(new Event('input',{bubbles:true}));}
        var d=document.getElementById('documento'); if(d){d.value='9999';
        d.dispatchEvent(new Event('input',{bubbles:true}));} return 1;`);

      /* Morfología primero: decide si la válvula se gradúa. */
      for (const [id, v] of (e.morf || [])) {
        const r = await elegirEnSelect(id, v);
        out.gestos.push({ morf: id, val: v, err: r });
      }
      /* Clic REAL en el botón de la válvula.
         ⚠️ VA ANTES DEL TIPEO, Y AL REVÉS NO MEDÍA NADA. Los insumos de cada lesión viven DENTRO
         del cajón de cuantificación que este botón abre (avm_plan, im_vc, it_vc) o en la pestaña
         Doppler; con el cajón cerrado el campo no tiene geometría y el tipeo no entraba. Además
         es el orden del médico: primero dice que hay valvulopatía, después carga las medidas. */
      for (const [valv, les] of (e.clic || [])) {
        const tipo = les.startsWith('i') ? 'insuf' : 'esten';
        const yaOn = await ev(`return window.__A.pill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)});`);
        if (yaOn !== true) {
          const r = await clicEn(`pill-${tipo}-${valv}`);
          out.gestos.push({ clic: `pill-${tipo}-${valv}`, err: r,
            quedo: await ev(`return window.__A.pill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)});`) });
        } else out.gestos.push({ clic: `pill-${tipo}-${valv}`, nota: 'ya estaba prendido' });
      }
      /* Los insumos, tipeados de verdad, con el cajón ya abierto por el botón. */
      for (const [id, v] of (e.tipear || [])) {
        const r = await tipear(id, v);
        out.gestos.push({ tipear: id, val: v, err: r });
      }
      /* ⚠️ VUELTA A VÁLVULAS. Tipear en la pestaña Doppler (vmax_ao, gmedio_ao) deja la app en
         Doppler, y entonces la foto mediría la pastilla y el bloque de grado sobre una pestaña
         oculta — geometría cero, que es la trampa del denominador justo al revés. */
      if ((e.tipear || []).length) out.denTrasTipeo = await ev(`return window.__A.denominador();`);
      /* Elección en el menú ▼, con clics reales. */
      for (const [les, texto] of (e.menu || [])) {
        const r = await elegirEnMenu(les, texto);
        out.gestos.push({ menu: les, busca: texto, ...r });
      }
      /* Elección en el desplegable de grado final. */
      for (const [les, valor] of (e.sel || [])) {
        const id = await ev(`return window.__A.LES[${JSON.stringify(les)}].select;`);
        const r = await elegirEnSelect(id, valor);
        out.gestos.push({ select: id, val: valor, err: r });
      }
      /* El motivo del ajuste, tipeado de verdad en el cajón. */
      if (e.notaTipear) {
        const nid = await ev(`return window.__A.LES[${JSON.stringify(e.lesion)}].nota;`);
        if (!nid) out.gestos.push({ nota: 'NO EXISTE cajón de fundamento para ' + e.lesion });
        else out.gestos.push({ nota: nid, val: e.notaTipear, err: await tipear(nid, e.notaTipear) });
      }
      /* Apagar el botón a mano. */
      for (const [valv, les] of (e.cerrar || [])) {
        const tipo = les.startsWith('i') ? 'insuf' : 'esten';
        const on = await ev(`return window.__A.pill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)});`);
        if (on === true) out.gestos.push({ cerrar: `pill-${tipo}-${valv}`, err: await clicEn(`pill-${tipo}-${valv}`) });
        else out.gestos.push({ cerrar: `pill-${tipo}-${valv}`, nota: `ya estaba apagado (pill=${on})` });
      }
      /* Datos que se cargan DESPUÉS del gesto: es lo que necesitan los caminos automáticos
         (corregir una Vmax dispara R6), que no son gestos sobre la pastilla. */
      for (const [id, v] of (e.luego || [])) {
        out.gestos.push({ luego: id, val: v, err: await tipear(id, v) });
      }
      /* Borrar un insumo (R12). */
      for (const id of (e.borrar || [])) {
        out.gestos.push({ borrar: id, err: await tipear(id, '') });
      }
      /* ⚠️ Y OTRA VEZ LA VUELTA A VÁLVULAS, ACÁ POR `luego` Y POR `borrar`. La primera corrida
         con el tipeo arreglado informó «el aviso de la EA no se ve» en las escenas de R5 y R12,
         y era la sonda: esos dos gestos re-tipean en la pestaña DOPPLER (vmax_ao, gmedio_ao) y
         dejaban la app ahí, así que la foto medía la visibilidad del aviso con la pestaña
         Válvulas oculta — geometría cero leída como «la app no lo muestra». El valor del aviso
         salía bien y sólo mentía su visibilidad, que es exactamente lo que R5/R12 miran. */
      if ((e.luego || []).length || (e.borrar || []).length)
        out.denTrasLuego = await ev(`return window.__A.denominador();`);
      /* Reabrir el botón: el camino «me equivoqué y quiero corregir». */
      for (const [valv, les] of (e.reabrir || [])) {
        const tipo = les.startsWith('i') ? 'insuf' : 'esten';
        const on = await ev(`return window.__A.pill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)});`);
        if (on !== true) out.gestos.push({ reabrir: `pill-${tipo}-${valv}`, err: await clicEn(`pill-${tipo}-${valv}`) });
        else out.gestos.push({ reabrir: `pill-${tipo}-${valv}`, nota: 'ya estaba prendido' });
      }

      /* La foto ANTES del viaje de guardado: sin denominador, que el aviso desaparezca no prueba
         nada porque podía estar vacío. */
      if (e.guardarReabrir || e.nuevoEstudio) {
        out.fotoAntes = {};
        for (const k of (e.fotos || [])) out.fotoAntes[k] = await ev(`return window.__A.foto(${JSON.stringify(k)});`);
        out.infAntes = await ev(`return window.__A.informe('estandar');`);
      }
      if (e.guardarReabrir) {
        out.guardado = await ev(`return (async () => {
          window._ettEditandoId = null;
          var ids0 = new Set((getInformes() || []).map(function(x){ return x.estudioId }));
          var ok = false;
          try { ok = await new Promise(function(res){
            guardarInforme(function(){ res(true) });
            var t = setInterval(function(){
              var ov = document.getElementById('pdf-review-overlay');
              if (ov) { clearInterval(t); ov.querySelector('#rev-confirm').click(); } }, 50);
            setTimeout(function(){ clearInterval(t); res(false) }, 8000); }); } catch(e) {}
          var desp = getInformes() || [];
          var nuevo = desp.find(function(x){ return !ids0.has(x.estudioId) });
          return { ok: ok, id: nuevo ? nuevo.estudioId : null, n: desp.length };
        })();`);
        if (out.guardado && out.guardado.id) {
          await ev(`window.__A.limpiar(); return 1;`);
          await ev(`return cargarEstudioPorId(${JSON.stringify(out.guardado.id)});`).catch((x) => { out.cargaError = x.message; });
          await pausa(500);
          /* Reabrir mueve la pestaña: el denominador se repone DESPUÉS de cargar. */
          out.denReabierto = await ev(`return window.__A.denominador();`);
        }
      }
      if (e.nuevoEstudio) { await ev(`window.__A.limpiar(); return 1;`); out.denNuevo = await ev(`return window.__A.denominador();`); }

      if (e.tarjeta) out.tarjeta = await ev(`return window.__A.tarjeta();`);
      if (e.excel)   out.excel   = await ev(`return window.__A.excel();`);

      /* ⚠️ DENOMINADOR DEL INSUMO, Y SIN ESTO LA SONDA MENTÍA. La primera corrida informó
         «la pastilla no sigue al cálculo» en la aórtica con `calc=null`, y el gesto de tipeo no
         había devuelto ningún error — pero nadie había preguntado si el 4,2 QUEDÓ en el campo.
         «El cálculo no gradúa» y «el insumo no entró» se ven idénticos desde afuera, y el
         segundo es un defecto de la sonda que se reporta como defecto de la app.
         Se leen de vuelta todos los campos que la escena tocó, más los grados de la válvula. */
      out.insumos = await ev(`var ids = ${JSON.stringify([
        ...(e.tipear || []).map((p) => p[0]), ...(e.luego || []).map((p) => p[0]),
        ...(e.borrar || []), ...(e.morf || []).map((p) => p[0])])};
        var o = {}; ids.forEach(function(i){ var el = document.getElementById(i);
          o[i] = el ? el.value : 'NO EXISTE'; });
        /* Los derivados que prueban que el cálculo CORRIÓ, no sólo que el campo tiene texto. */
        /* Los badges propios de la tricúspide y la pulmonar: son las DOS que no están en
           SEV_SINC, así que su veredicto no sale de la pastilla sino de un badge aparte, y sin
           leerlo se concluiría que no calculan nada. */
        ['gmax_calc','ava_cont','dvi-val','avm_thp','em_gmax','ia-eroa','it-eroa','vp_gmax',
         'et-sev','et_avt','vp-sev-badge','et-gmedio-badge']
          .forEach(function(i){ var el = document.getElementById(i);
            if (el) o['=' + i] = (el.value !== undefined ? el.value : (el.textContent||'').trim()); });
        return o;`);

      for (const k of (e.fotos || [])) out[`foto_${k}`] = await ev(`return window.__A.foto(${JSON.stringify(k)});`);
      if (e.informe3) out.informe3 = await ev(`return window.__A.tresEstilos();`);

      /* Cada escena borra lo que guardó: un estudio que sobrevive cambia el denominador de las
         que vienen después. */
      if (out.guardado && out.guardado.id) {
        await ev(`try { await CeiboStore.setLocal((getInformes()||[]).filter(function(x){
          return x.estudioId !== ${JSON.stringify(out.guardado.id)} })); } catch(e){} return 1;`).catch(() => {});
      }
    } catch (err) { out.error = err.message; }
    /* ── VEREDICTO DE VALIDEZ, separado del hallazgo ───────────────────────────────────────────
       Cualquier error de tipeo, menú o clic que NO sea una ausencia esperada invalida la escena:
       nunca sale «ok». El denominador de cada punto medido (inicial, tras tipeo, tras luego/borrar,
       al reabrir, en nuevo estudio) tiene que estar ok — si alguno midió sobre geometría cero, la
       escena tampoco vale. */
    const _errs = erroresDeEscena(out);
    out.hallazgosAusencia = _errs.filter(esAusenciaEsperada);
    out.erroresInstrumentacion = _errs.filter((s) => !esAusenciaEsperada(s));
    const _dens = [out.den, out.denTrasTipeo, out.denTrasLuego, out.denReabierto, out.denNuevo].filter(Boolean);
    out.denOk = _dens.length > 0 && _dens.every((d) => d && d.ok === true);
    out.valido = !out.error && out.denOk && out.erroresInstrumentacion.length === 0;
    salida.escenas.push(out);
    process.stderr.write(`  ${out.id.padEnd(22)}${
      out.error ? 'ERROR ' + out.error
      : !out.denOk ? 'DEN INCOMPLETO ' + JSON.stringify((out.den && out.den.panes) || out.den || null)
      : out.erroresInstrumentacion.length
        ? 'INVÁLIDA — ' + out.erroresInstrumentacion.length + ' err instrumentación: ' + out.erroresInstrumentacion[0]
      : 'ok' + (out.hallazgosAusencia.length ? ' (' + out.hallazgosAusencia.length + ' ausencias esperadas)' : '')}\n`);
  }

  /* ── Doppler: los recuadros de severidad, solo lectura ──────────────────────────────────── */
  if (!SOLO || SOLO === 'DOP') {
    for (const d of DOPPLER) {
      try {
        await ev(`window.__A.limpiar(); return 1;`);
        const den = await ev(`return window.__A.denominador();`);
        const tipeoErr = await tipear(d.campo, d.val);
        /* Los recuadros viven en la pestaña Doppler, no en Válvulas: hay que ir. */
        const rec = await ev(`try{ showTab('doppler') }catch(e){}
          var out = { den: 1, cajas: {} };
          /* Se barre TODO lo que parezca un recuadro de severidad y se guarda su texto literal.
             Preguntar por ids adivinados daría null y parecería que no existen. */
          var ids = ['ea-det-sev','ea-sev-box','ea-sev','ea_sev_box','em-sev','em-sev-box',
                     'em-severidad','ea-severidad','ea-crit-box','em-crit-box',
                     'ea-det-gmax','ea-det-gmedio','em-gmax-row','em_thp_display'];
          ids.forEach(function(i){ var e=document.getElementById(i);
            if (e) out.cajas[i] = (e.textContent||'').replace(/\\s+/g,' ').trim(); });
          /* Y el barrido abierto: cualquier nodo cuyo texto tenga un grado Y un umbral con ≥. */
          out.sospechosos = Array.from(document.querySelectorAll('#tab-doppler *'))
            .filter(function(n){ return n.children.length === 0; })
            .map(function(n){ return (n.textContent||'').replace(/\\s+/g,' ').trim() })
            .filter(function(t){ return t && t.length < 220 &&
              /leve|moderad|severa|normal|esclerosis/i.test(t) && /[≥>=]/.test(t) })
            .slice(0, 14);
          return out;`);
        const dv = { ...d, den, tipeoErr, ...rec,
          grados: await ev(`return { ea_grado: window.__A.val('ea_grado'),
            em_grado: window.__A.val('em_grado'), ava_cont: window.__A.val('ava_cont'),
            gmax_calc: window.__A.val('gmax_calc') };`) };
        dv.erroresInstrumentacion = (tipeoErr && !esAusenciaEsperada(tipeoErr)) ? [tipeoErr] : [];
        dv.valido = !!(den && den.ok) && dv.erroresInstrumentacion.length === 0;
        salida.doppler.push(dv);
        process.stderr.write(`  ${d.id.padEnd(22)}${dv.valido ? 'ok' : 'INVÁLIDA — ' + (tipeoErr || 'den incompleto')}\n`);
      } catch (err) { salida.doppler.push({ ...d, error: err.message, valido: false }); }
    }
  }

  /* md5 DESPUÉS. La sonda es de solo lectura: si cambió, la corrida no vale. */
  const despues = createHash('md5').update(await readFile(join(RAIZ, 'index.html'))).digest('hex');
  salida.md5Despues = despues;
  salida.md5Igual = despues === MD5_ANTES;
  process.stderr.write(`  md5 index.html despues — ${despues} ${salida.md5Igual ? '(IGUAL ✓)' : '(⚠️ CAMBIO)'}\n`);

  /* ── VEREDICTO GLOBAL: una sola escena inválida tumba la corrida ────────────────────────────
     El barrido sale con código ≠ 0 si quedó alguna escena con error de instrumentación, con
     denominador incompleto, con excepción de arnés, o si el md5 cambió. Nunca «ok» global tapando
     una escena rota — que era el modo en que la sonda mentía antes de esta tanda. */
  salida.invalidas = salida.escenas.filter((e) => e.valido === false)
    .map((e) => ({ id: e.id, error: e.error || null,
                   erroresInstrumentacion: e.erroresInstrumentacion || [], denOk: e.denOk }));
  const dopInval = salida.doppler.filter((d) => d.valido === false)
    .map((d) => ({ id: d.id, error: d.error || null, tipeoErr: d.tipeoErr || null }));
  if (dopInval.length) salida.invalidasDoppler = dopInval;
  salida.totalInvalidas = salida.invalidas.length + dopInval.length;
  if (!salida.md5Igual) process.exitCode = 4;
  else if (salida.totalInvalidas > 0) process.exitCode = 3;
  process.stderr.write(`  VEREDICTO — ${salida.escenas.length} escenas (${salida.invalidas.length} inválidas), ` +
    `${salida.doppler.length} doppler (${dopInval.length} inválidas), exitCode ${process.exitCode || 0}\n`);

  console.log(JSON.stringify(salida, null, 1));
  cdp.close();
} catch (e) {
  console.error('HARNESS: ' + e.message);
  process.exitCode = 2;
} finally {
  /* ⚠️ Cerrar el servidor Y salir: cdp.close() + proc.kill() no alcanzan, el event loop queda
     vivo y se juntan zombies reteniendo su Chrome. Un A/B encadenado nunca llega al segundo lado
     y parece lentitud cuando es un cuelgue. */
  if (servidor) servidor.close();
  if (chrome) { try { chrome.proc.kill(); } catch {} try { await rm(chrome.perfil, { recursive: true, force: true }); } catch {} }
  process.exit(process.exitCode || 0);
}
