#!/usr/bin/env node
/**
 * _probe_aopulmo.mjs — sonda A/B de SOLO LECTURA para esta tanda: las tres correcciones de la
 * ESTENOSIS AORTICA (G. max del Doppler, AVA indexada, rotulo DVI) y la tarjeta de la PULMONAR.
 *
 * NO muta index.html: comprueba su md5 al principio y al final.
 *
 *   node scripts/_probe_aopulmo.mjs --file /tmp/index.HEAD.html > /tmp/ap.HEAD.json
 *   node scripts/_probe_aopulmo.mjs                             > /tmp/ap.NEW.json
 *
 * ⚠️ TECLAS REALES. El borrado de la Vmax se hace con BACKSPACE, digito por digito, por el dominio
 * `Input` de CDP — no asignando `.value`. El defecto que esta tanda persigue vive en una rama que
 * sólo se alcanza con el campo QUEDANDO vacio, y una asignacion por codigo no dispara `oninput`.
 *
 * Infraestructura (servidor + Chrome + CDP) calcada de scripts/_probe_itvmax.mjs; el tipeo real y
 * `revelar` salen de scripts/auditoria_botones.mjs.
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, extname, isAbsolute, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const VER  = process.argv.includes('--ver');
const arg  = (n) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const FARG = arg('--file') || 'index.html';
const EXTERNO = isAbsolute(FARG);
const FILE = EXTERNO ? '__ab__' + basename(FARG) : FARG;
const SOLO = arg('--solo');

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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-ap-'));
  let bin = null;
  for (const c of CHROMES) { try { await readFile(c); bin = c; break; } catch {} }
  if (!bin) throw new Error('No encontre Chrome/Chromium.');
  const args = ['--remote-debugging-port=0', `--user-data-dir=${perfil}`, '--no-first-run',
                '--no-default-browser-check', '--disable-extensions',
                '--window-size=1400,1000', url];
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
async function md5(p) { return createHash('md5').update(await readFile(p)).digest('hex'); }

/* ══ Sonda inyectada ══════════════════════════════════════════════════════════════════════════
   ⚠️ CUERPO DE TEMPLATE LITERAL: NI UN ACENTO GRAVE adentro, tampoco en los comentarios. */
const SONDA = `
window.__P = {
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  pill(v, t) { try { return (typeof pillOn === 'function') ? pillOn(v, t) : 'SIN pillOn' }
    catch(e) { return 'EXC' } },
  existe(id) { return !!document.getElementById(id) },

  /* Abre lo que haga falta para que el campo tenga geometria. Calcado de auditoria_botones.mjs. */
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
      } else if (oid.indexOf('ete-seccion-') === 0) {
        try { toggleEteSeccion(oid.replace('ete-seccion-','')); abrio.push(oid) } catch(x) { return { err: 'toggleEteSeccion ' + oid, abrio: abrio } }
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

  /* Abre las cuatro tarjetas de Valvulas y las dos del Doppler que esta tanda mira, y confirma
     que hay geometria. DENOMINADOR: una sonda sobre un arbol cerrado devuelve cero y parece sana. */
  abrirTodo() {
    try { showTab('valvulas') } catch(e) {}
    ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'].forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && s.style.display === 'none') { try { toggleEteSeccion(tok) } catch(e) {} }
    });
    try { showTab('doppler') } catch(e) {}
    ['dop-aortico','dop-pulmonar'].forEach(function(c){
      var s = document.getElementById(c);
      if (s && s.style.display === 'none') { try { toggleCard(c) } catch(e) {} }
    });
    return { vmax_ao: window.__P.vis('vmax_ao'), ea_vmax: window.__P.vis('ea_vmax'),
             vp_vmax: window.__P.vis('vp_vmax'), ip_vmax: window.__P.vis('ip_vmax'),
             ep_grado: window.__P.vis('ep_grado'), ip_grado: window.__P.vis('ip_grado') } },

  limpiar() {
    try { limpiarCampos(true) } catch(e) {}
    window.esqSevManual = {}; window._sevCalcAlFijar = {};
    ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){
        try { localStorage.removeItem('valv-pill-' + t + '-' + v) } catch(e){}
        try { if (window.__P.pill(v,t) === true) toggleValvPill(v,t) } catch(e){}
      });
    });
    try { if (window.VALV_ESTEN_AUTO) window.VALV_ESTEN_AUTO.clear() } catch(e) {}
    return 1 },

  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value } },

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

  /* Oraciones de la pulmonar, para no diffear el informe entero. */
  frasesVP(texto) {
    var t = String(texto || '');
    var ors = t.split(/(?<=\\.)\\s+/);
    var re = /pulmonar|\\bIP\\b|\\bEP\\b|\\bVP\\b|PAPm|PAPd/i;
    return ors.map(function(s){ return s.trim() }).filter(function(s){ return s && re.test(s) }) },
  frasesAo(texto) {
    var t = String(texto || '');
    var ors = t.split(/(?<=\\.)\\s+/);
    var re = /a[oó]rtic|\\bEAo\\b|\\bIAo\\b|\\bAVA\\b|\\bDVI\\b|\\bDI\\b|gradiente/i;
    return ors.map(function(s){ return s.trim() }).filter(function(s){ return s && re.test(s) }) },

  /* P1 — las cuatro superficies de pantalla del G. maximo aortico. */
  fotoGmax() {
    return { gmax_calc: window.__P.val('gmax_calc'),
             ea_gmax_display: window.__P.val('ea_gmax_display'),
             ea_det_gmax: window.__P.txt('ea-det-gmax'),
             vmax_ao: window.__P.val('vmax_ao'), ea_vmax: window.__P.val('ea_vmax'),
             ea_grado: window.__P.val('ea_grado'),
             pill: window.__P.pill('aortica','esten'),
             badge: window.__P.txt('ea-ava-badge'),
             recuadro: window.__P.txt('ea-dop-sev') } },

  /* P2 — la AVA indexada en sus lugares de pantalla. */
  fotoAvai() {
    return { ava_idx: window.__P.txt('ava-idx'), ea_det_avai: window.__P.txt('ea-det-avai'),
             bsa: window.__P.txt('bsa-val'), imc: window.__P.txt('imc-val'),
             peso: window.__P.val('peso'),
             talla: window.__P.val('talla'), ava_cont: window.__P.val('ava_cont'),
             ea_ava_display: window.__P.val('ea_ava_display'),
             tavi_avai: window.__P.val('ete_tavi_avai') } },

  /* P3 — el rotulo de la celda del DVI. */
  fotoDvi() {
    var box = null;
    var el = document.getElementById('dvi-val');
    if (el && el.parentNode) box = (el.parentNode.textContent || '').trim();
    var lbl = null, fg = el; 
    while (fg && fg.nodeType === 1 && !(fg.className && String(fg.className).indexOf('fg') >= 0)) fg = fg.parentNode;
    if (fg && fg.querySelector) { var l = fg.querySelector('label'); if (l) lbl = l.textContent.trim() }
    return { filaCompleta: box, rotuloArriba: lbl, valor: window.__P.txt('dvi-val') } },

  /* Pulmonar — censo de lo que hay. */
  fotoVP() {
    var g = function(id){ var e = document.getElementById(id);
      return e ? Array.from(e.options || []).map(function(o){ return o.value + (o.hidden ? ' [hidden]' : '') }) : null };
    return { ep_grado: window.__P.val('ep_grado'), ip_grado: window.__P.val('ip_grado'),
             ep_opts: g('ep_grado'), ip_opts: g('ip_grado'),
             ep_vis: window.__P.vis('ep_grado'), ip_vis: window.__P.vis('ip_grado'),
             gftxt_esten: window.__P.txt('gftxt-esten-pulmonar'),
             gftxt_insuf: window.__P.txt('gftxt-insuf-pulmonar'),
             badge: window.__P.txt('vp-sev-badge'),
             epAviso: window.__P.txt('ep-manual-aviso'),
             epFund: window.__P.vis('ep-fund'),
             ipAviso: window.__P.txt('ip-manual-aviso'),
             ipFund: window.__P.vis('ip-fund'),
             nivelVis: window.__P.vis('bloque-ep-detalle'), etioVis: window.__P.vis('bloque-ip-detalle'),
             pillE: window.__P.pill('pulmonar','esten'), pillI: window.__P.pill('pulmonar','insuf'),
             vp_vmax: window.__P.val('vp_vmax'), vp_gmax: window.__P.val('vp_gmax'),
             ep_vmax_esp: window.__P.val('ep_vmax'), ep_gmax_esp: window.__P.val('ep_gmax'),
             ip_vmax: window.__P.val('ip_vmax'), ip_vtd: window.__P.val('ip_vtd'),
             refVmax: window.__P.txt('ep-ref-vmax'), refGmax: window.__P.txt('ep-ref-gmax'),
             refSev: window.__P.txt('ep-sev'), refFuente: window.__P.txt('ep-ref-fuente'),
             ipRefPht: window.__P.txt('ip-ref-pht'), ipRefAncho: window.__P.txt('ip-ref-ancho'),
             ipRefSenal: window.__P.txt('ip-ref-senal'), ipRefRev: window.__P.txt('ip-ref-rev'),
             ipRefSev: window.__P.txt('ip-sev'), ipRefDisc: window.__P.txt('ip-discordancia'),
             ipRefFuente: window.__P.txt('ip-ref-fuente'),
             ip_pht: window.__P.val('ip_pht'), ip_ancho: window.__P.val('ip_ancho'),
             ip_senal: window.__P.val('ip_senal'),
             ip_rev: (function(){ var e = document.getElementById('ip_reversion'); return e ? (e.checked ? '1' : '0') : null })() } },

  /* Tab order real de la tarjeta pulmonar, por orden de documento. */
  tabOrden(contId) {
    var c = document.getElementById(contId); if (!c) return null;
    var sel = 'input:not([type=hidden]), select, textarea, button, [tabindex]';
    return Array.from(c.querySelectorAll(sel)).filter(function(el){
      if (el.disabled) return false;
      if (el.getAttribute('tabindex') === '-1') return false;
      var n = el; while (n && n.nodeType === 1) { if (getComputedStyle(n).display === 'none') return false; n = n.parentNode }
      return true;
    }).map(function(el){ return el.id || ('<' + el.tagName.toLowerCase() + '>') }) },

  desborde() {
    var d = document.documentElement;
    return { scrollW: d.scrollWidth, clientW: d.clientWidth, hayBarra: d.scrollWidth > d.clientWidth + 1 } },
  desbordeDe(id) {
    var e = document.getElementById(id); if (!e) return null;
    var r = e.getBoundingClientRect(), d = document.documentElement;
    return { der: Math.round(r.right), clientW: d.clientWidth, desborda: r.right > d.clientWidth + 1,
             w: Math.round(r.width) } }
};
1;
`;

async function main() {
  const antes = await md5(join(RAIZ, 'index.html'));
  const { srv, port } = await servir();
  const { proc, perfil, wsUrl } = await abrirChrome(`http://127.0.0.1:${port}/${FILE}`);
  const cdp = await conectar(wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const t = targetInfos.find((x) => x.type === 'page');
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
  await pausa(2200);

  async function ev(expr) {
    const r = await cdp.send('Runtime.evaluate',
      { expression: expr, returnByValue: true, awaitPromise: true }, sessionId);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' :: ' + (r.exceptionDetails.exception || {}).description);
    return r.result.value;
  }
  async function clicEn(id) {
    const c = await ev(`window.__P.centro(${JSON.stringify(id)})`);
    if (!c || c.err) return c ? c.err : 'no existe';
    await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
    await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
    await pausa(110);
    return null;
  }
  /* ══ TECLAS REALES ══ una por caracter, con el `text` SOLO en el `char`. */
  async function enfocar(id) {
    let rev = await ev(`window.__P.revelar(${JSON.stringify(id)})`);
    for (let i = 0; i < 4 && rev && rev.necesitaClic; i++) {
      await clicEn(rev.necesitaClic);
      rev = await ev(`window.__P.revelar(${JSON.stringify(id)})`);
    }
    const c = await ev(`window.__P.centro(${JSON.stringify(id)})`);
    if (c && !c.err) {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
    }
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)}); if(e) e.focus(); return 1 })()`);
    return c && c.err ? ('foco-dom (' + c.err + ')') : 'clic';
  }
  /* ⚠️ UNA TECLA DE EDICION NO ES UN CARACTER, Y SIN `windowsVirtualKeyCode` NO BORRA NADA.
     La primera corrida mando `{type:'keyDown', key:'Backspace'}` pelado: los eventos llegaban, el
     campo NO cambiaba, y la sonda informo «borrar la Vmax deja el G. max en 64» sobre un campo que
     seguia diciendo 4 — o sea el defecto correcto por la razon equivocada, que es indistinguible de
     un hallazgo falso. Blink ejecuta el comando de edicion por el keycode, no por `key`, y hace
     falta `rawKeyDown` (un `keyDown` sin `char` detras no dispara el comando). */
  const VK = { Backspace: 8, Delete: 46, Tab: 9, Enter: 13, End: 35, Home: 36 };
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
  /* Tipea DESDE VACIO (select() para que la primera tecla pise lo que hubiera). */
  async function tipear(id, valor) {
    const via = await enfocar(id);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(!e) return 0; e.focus(); try{ e.select() }catch(x){} return 1 })()`);
    for (const ch of String(valor)) await tecla(ch, ch);
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('change',{bubbles:true})) } return 1 })()`);
    await pausa(90);
    const quedo = await ev(`window.__P.val(${JSON.stringify(id)})`);
    return { via, pedido: String(valor), quedo: String(quedo),
             ok: String(quedo) === String(valor) };
  }
  /* BORRA CON BACKSPACE, digito por digito, leyendo despues de cada tecla. */
  async function borrarConBackspace(id, foto) {
    const via = await enfocar(id);
    /* ⚠️ `setSelectionRange` LANZA en un `input[type=number]` —no soporta seleccion— y el `try`
       la tragaba, asi que el caret quedaba donde estuviera. Al enfocar por clic el caret cae donde
       se clickeo; para que el Backspace muerda desde el final se enfoca y se manda `End`. */
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)}); if(e) e.focus(); return 1 })()`);
    await tecla('End', null);
    const pasos = [];
    for (let i = 0; i < 12; i++) {
      const v0 = await ev(`window.__P.val(${JSON.stringify(id)})`);
      if (v0 === '' || v0 === null) break;
      await tecla('Backspace', null);
      await pausa(70);
      pasos.push({ tras: i + 1, campo: await ev(`window.__P.val(${JSON.stringify(id)})`),
                   ...(foto ? JSON.parse(await ev(`JSON.stringify(window.__P.${foto}())`)) : {}) });
    }
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)});
      if(e){ e.dispatchEvent(new Event('change',{bubbles:true})); e.blur() } return 1 })()`);
    await pausa(120);
    return { via, pasos };
  }

  await ev(`try{sessionStorage.setItem('ett_auth','1')}catch(e){}; location.reload(); 1`);
  await pausa(2600);
  await ev(SONDA);
  const listo = await ev(`JSON.stringify(window.__P.abrirTodo())`);

  const out = { archivo: FARG, listo: JSON.parse(listo) };
  const hacer = (k) => !SOLO || SOLO === k;

  /* ══ P1 — EL G. MAXIMO DEL DOPPLER, CON TECLAS REALES ═════════════════════════════════════ */
  if (hacer('P1')) {
    const p1 = {};
    for (const pill of ['prendida', 'apagada']) {
      for (const puerta of ['vmax_ao', 'ea_vmax']) {
        const k = `${puerta} / pastilla ${pill}`;
        await ev(`(function(){ window.__P.limpiar(); window.__P.abrirTodo(); return 1 })()`);
        const esc = {};
        esc.inicio = JSON.parse(await ev(`JSON.stringify(window.__P.fotoGmax())`));
        esc.tipeo = await tipear(puerta, '4');
        /* ⚠️ EL APAGADO VA DESPUES DEL TIPEO. Tipear la Vmax llama a `valvAutoPrenderEsten`, que
           RE-PRENDE la pastilla: apagandola antes, la escena «pastilla apagada» llegaba al borrado
           con la pastilla PRENDIDA y las dos columnas median lo mismo. Apagada despues, la clave de
           localStorage queda en '0' y el auto-prendido ya no la reabre. */
        if (pill === 'apagada') {
          await ev(`(function(){ if (window.__P.pill('aortica','esten') === true) toggleValvPill('aortica','esten'); return 1 })()`);
        }
        esc.conVmax = JSON.parse(await ev(`JSON.stringify(window.__P.fotoGmax())`));
        const b = await borrarConBackspace(puerta, 'fotoGmax');
        esc.borrado = b;
        esc.traseBorrar = JSON.parse(await ev(`JSON.stringify(window.__P.fotoGmax())`));
        esc.pillTrasBorrar = await ev(`window.__P.pill('aortica','esten')`);
        /* Y vuelve a haber Vmax: se tiene que recalcular. */
        esc.retipeo = await tipear(puerta, '3');
        esc.conVmax2 = JSON.parse(await ev(`JSON.stringify(window.__P.fotoGmax())`));
        esc.pdf = JSON.parse(await ev(`(function(){
          var o = {}; try { o.gmaxEnCampos = window.__P.campos()['gmax_calc'] } catch(e) { o.err = e.message }
          return JSON.stringify(o) })()`));
        p1[k] = esc;
      }
    }
    out.P1 = p1;
  }

  /* ══ P2 — LA AVA INDEXADA SIN SUPERFICIE CORPORAL ════════════════════════════════════════ */
  if (hacer('P2')) {
    const p2 = {};
    await ev(`(function(){ window.__P.limpiar(); window.__P.abrirTodo();
      if (window.__P.pill('aortica','esten') !== true) toggleValvPill('aortica','esten'); return 1 })()`);
    p2.tipeos = [];
    /* ⚠️ EL Ø TSVI SE CARGA POR `ea_dtsvi` Y NO POR `diam_tsvi`: el del Doppler esta OCULTO (su
       `.fg` lleva `display:none` desde que el campo se unifico), asi que no tiene geometria y el
       tipeo real no entra. La primera corrida lo intento, el campo quedo vacio, `ava_cont` tambien,
       y la AVA indexada salia «—» en los CINCO estados — o sea la sonda media un denominador cero y
       el resultado parecia correcto. */
    for (const [id, val] of [['peso', '80'], ['talla', '175'], ['ea_dtsvi', '20'],
                             ['itv_tsvi', '19'], ['itv_ao', '53'], ['vmax_ao', '4']]) {
      p2.tipeos.push(await tipear(id, val));
    }
    /* DENOMINADOR: sin AVA no hay AVA indexada que pueda quedar rancia. */
    p2.denominador = JSON.parse(await ev(`JSON.stringify({ ava_cont: window.__P.val('ava_cont'),
      ava_idx: window.__P.txt('ava-idx'), ea_det_avai: window.__P.txt('ea-det-avai'),
      hay: !!window.__P.val('ava_cont') && window.__P.txt('ava-idx') !== '—' })`));
    p2.conBSA = JSON.parse(await ev(`JSON.stringify(window.__P.fotoAvai())`));
    p2.borrarPeso = await borrarConBackspace('peso', 'fotoAvai');
    p2.sinPeso = JSON.parse(await ev(`JSON.stringify(window.__P.fotoAvai())`));
    p2.cambiarPeso = await tipear('peso', '60');
    p2.pesoNuevo = JSON.parse(await ev(`JSON.stringify(window.__P.fotoAvai())`));
    p2.borrarTalla = await borrarConBackspace('talla', 'fotoAvai');
    p2.sinTalla = JSON.parse(await ev(`JSON.stringify(window.__P.fotoAvai())`));
    p2.cambiarTalla = await tipear('talla', '160');
    p2.tallaNueva = JSON.parse(await ev(`JSON.stringify(window.__P.fotoAvai())`));
    out.P2 = p2;
  }

  /* ══ P3 — EL ROTULO DEL DVI ══════════════════════════════════════════════════════════════ */
  if (hacer('P3')) {
    await ev(`(function(){ window.__P.limpiar(); window.__P.abrirTodo(); return 1 })()`);
    const p3 = { vacio: JSON.parse(await ev(`JSON.stringify(window.__P.fotoDvi())`)) };
    await tipear('itv_tsvi', '19'); await tipear('itv_ao', '53');
    p3.conDatos = JSON.parse(await ev(`JSON.stringify(window.__P.fotoDvi())`));
    await ev(`(function(){ try { limpiarCampos(true) } catch(e) {} return 1 })()`);
    await pausa(150);
    p3.trasNuevoEstudio = JSON.parse(await ev(`JSON.stringify(window.__P.fotoDvi())`));
    out.P3 = p3;
  }

  /* ══ PULMONAR — CENSO Y BORDES DEL GRADO ═════════════════════════════════════════════════ */
  if (hacer('VP')) {
    const vp = {};
    vp.censo = JSON.parse(await ev(`(function(){ window.__P.limpiar(); window.__P.abrirTodo();
      return JSON.stringify(window.__P.fotoVP()) })()`));
    /* A/B del grado por los bordes: 2,9 / 3,0 / 3,1 / 3,9 / 4,0 / 4,1 m/s */
    vp.bordes = {};
    for (const v of ['2.9', '3.0', '3.1', '3.9', '4.0', '4.1', '1.0', '1.4', '1.5']) {
      vp.bordes[v] = JSON.parse(await ev(`(function(){
        window.__P.limpiar(); window.__P.abrirTodo();
        window.__P.set('vp_vmax', '${v}');
        var f = window.__P.fotoVP();
        f.epGradoPorGmax = (typeof epGradoPorGmax === 'function') ? epGradoPorGmax(v('vp_gmax')) : 'SIN';
        return JSON.stringify(f) })()`));
    }
    /* Constantes de corte tal como las declara la app. */
    vp.cortes = JSON.parse(await ev(`JSON.stringify({
      normalMax: (typeof EP_GMAX_NORMAL_MAX !== 'undefined') ? EP_GMAX_NORMAL_MAX : null,
      leveMax: (typeof EP_GMAX_LEVE_MAX !== 'undefined') ? EP_GMAX_LEVE_MAX : null,
      modMax: (typeof window.EP_GMAX_MOD_MAX !== 'undefined') ? window.EP_GMAX_MOD_MAX : null })`));
    /* Espejo de la Vmax pulmonar en los DOS sentidos, con teclas reales en el borrado. */
    const esp = {};
    await ev(`(function(){ window.__P.limpiar(); window.__P.abrirTodo(); return 1 })()`);
    esp.tipeoDoppler = await tipear('vp_vmax', '3.5');
    esp.trasDoppler = JSON.parse(await ev(`JSON.stringify(window.__P.fotoVP())`));
    if (await ev(`window.__P.existe('ep_vmax')`)) {
      esp.borradoDesdeDoppler = await borrarConBackspace('vp_vmax', 'fotoVP');
      await ev(`(function(){ window.__P.limpiar(); window.__P.abrirTodo(); return 1 })()`);
      esp.tipeoValvulas = await tipear('ep_vmax', '3.5');
      esp.trasValvulas = JSON.parse(await ev(`JSON.stringify(window.__P.fotoVP())`));
      esp.borradoDesdeValvulas = await borrarConBackspace('ep_vmax', 'fotoVP');
      esp.trasBorrarValvulas = JSON.parse(await ev(`JSON.stringify(window.__P.fotoVP())`));
    } else { esp.ep_vmax = 'NO EXISTE en este build'; }
    vp.espejo = esp;
    /* El informe y el EN SUMA en los tres estilos, en los cuatro estados que la orden nombra. */
    const ESC = {
      'EP moderada (Vmax 3.5)':            { vp_vmax: '3.5' },
      'IP con grado (Moderada)':           { ip_grado: 'Moderada' },
      'IP presente por velocidad proto':   { ip_vmax: '2.5' },
      'IP presente por velocidad tele':    { ip_vtd: '1.8' },
      'IP presente por velocidad + pmad':  { ip_vmax: '2.5', vci_diam: '18', vci_col: '>50' },
      'nada':                              {},
    };
    vp.informe = {};
    for (const [n, campos] of Object.entries(ESC)) {
      vp.informe[n] = JSON.parse(await ev(`(function(){
        window.__P.limpiar(); window.__P.abrirTodo();
        var c = ${JSON.stringify(campos)};
        Object.keys(c).forEach(function(k){ window.__P.set(k, c[k]) });
        var o = {};
        ['estandar','conciso','narrativo'].forEach(function(e){
          var r = window.__P.informe(e);
          o[e] = { vp: window.__P.frasesVP(r.inf), suma: r.suma.split('\\n').filter(function(s){
            return /pulmonar|\\bIP\\b|\\bEP\\b|\\bVP\\b/i.test(s) }) };
        });
        window.__P.informe('estandar');
        o.foto = window.__P.fotoVP();
        o.xlsCols = (function(){ var x = window.__P.excel();
          return (x && typeof x === 'object') ? Object.keys(x).length : x })();
        return JSON.stringify(o) })()`));
    }
    out.VP = vp;
  }

  /* ══ LAS OTRAS VALVULAS, IDENTICAS ═══════════════════════════════════════════════════════
     Registrar `ip` en SEV_SINC toca codigo COMPARTIDO (el alias del centinela y el token que
     escribe valvApagarGrado), asi que lo que hay que demostrar no es que la IP funcione: es que las
     otras SIETE lesiones no se movieron. Cada escena fija un grado A MANO por el camino real sobre
     un calculo que DISCREPA, que es el estado donde el aviso, el cajon y la marca estan todos
     encendidos a la vez — o sea el mas sensible a un cambio en el mecanismo comun. */
  if (hacer('OTRAS')) {
    const ESC = [
      /* [nombre, tipo, valv, grado a mano, campos que producen el calculo discrepante] */
      ['aortica/esten  EAo severa->leve',   'esten', 'aortica',    'leve',     { vmax_ao: '4.5' }],
      ['aortica/insuf  IAo severa->leve',   'insuf', 'aortica',    '1',        { ia_vc: '7', ia_pht: '180' }],
      ['mitral/esten   EM severa->leve',    'esten', 'mitral',     'leve',     { em_gmedio: '12', em_thp: '250' }],
      ['mitral/insuf   IM severa->leve',    'insuf', 'mitral',     '1',        { im_vc: '8' }],
      ['tricusp/insuf  IT severa->leve',    'insuf', 'tricuspide', '1',        { it_vc: '9' }],
      ['tricusp/esten  ET signif->no',      'esten', 'tricuspide', 'No significativa', { et_gmedio: '8' }],
      ['pulmonar/esten EP severa->leve',    'esten', 'pulmonar',   'Leve',     { vp_vmax: '4.5' }],
    ];
    const otras = {};
    for (const [n, tipo, valv, grado, campos] of ESC) {
      otras[n] = JSON.parse(await ev(`(function(){
        window.__P.limpiar(); window.__P.abrirTodo();
        try { showTab('valvulas') } catch(e) {}
        var c = ${JSON.stringify(campos)};
        Object.keys(c).forEach(function(k){ window.__P.set(k, c[k]) });
        try { valvSev.aplicar(${JSON.stringify(tipo)}, ${JSON.stringify(valv)}, ${JSON.stringify(grado)}) } catch(e) {}
        var clave = (typeof sevClaveDe === 'function') ? sevClaveDe(${JSON.stringify(tipo)}, ${JSON.stringify(valv)}) : null;
        var C = clave && window.SEV_SINC ? window.SEV_SINC[clave] : null;
        var sel = C ? document.getElementById(C.select) : null;
        var past = document.getElementById('sevbtn-' + ${JSON.stringify(tipo)} + '-' + ${JSON.stringify(valv)});
        var est = window.__P.informe('estandar');
        var con = window.__P.informe('conciso');
        var nar = window.__P.informe('narrativo');
        window.__P.informe('estandar');
        return JSON.stringify({
          clave: clave,
          sel: sel ? sel.value : null,
          past: past ? (past.textContent || '').trim() : null,
          pill: window.__P.pill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)}),
          manual: !!(window.esqSevManual || {})[clave],
          calc: (typeof sevCalcPublicable === 'function') ? sevCalcPublicable(clave) : 'SIN',
          discrepa: (typeof sevDiscrepa === 'function') ? !!sevDiscrepa(clave) : 'SIN',
          aviso: C ? window.__P.txt(C.aviso) : null,
          fundVis: C && C.fundamento ? window.__P.vis(C.fundamento) : null,
          bloqueVis: window.__P.vis('bloque-' + ${JSON.stringify(tipo)} + '-' + ${JSON.stringify(valv)}),
          estandar: est, conciso: con, narrativo: nar,
          xls: (function(){ var x = window.__P.excel();
            return (x && typeof x === 'object') ? { cols: Object.keys(x).length, row: x } : x })()
        }) })()`));
    }
    /* Y el APAGADO de cada lesion, que es el camino que pasa por valvApagarGrado — el que escribe el
       centinela y el unico sitio donde el token nuevo se usa. */
    const apagados = {};
    for (const [n, tipo, valv, grado, campos] of ESC) {
      apagados[n] = JSON.parse(await ev(`(function(){
        window.__P.limpiar(); window.__P.abrirTodo();
        try { showTab('valvulas') } catch(e) {}
        var c = ${JSON.stringify(campos)};
        Object.keys(c).forEach(function(k){ window.__P.set(k, c[k]) });
        try { valvSev.aplicar(${JSON.stringify(tipo)}, ${JSON.stringify(valv)}, ${JSON.stringify(grado)}) } catch(e) {}
        if (window.__P.pill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)}) === true)
          toggleValvPill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)});
        var clave = (typeof sevClaveDe === 'function') ? sevClaveDe(${JSON.stringify(tipo)}, ${JSON.stringify(valv)}) : null;
        var C = clave && window.SEV_SINC ? window.SEV_SINC[clave] : null;
        var sel = C ? document.getElementById(C.select) : null;
        var est = window.__P.informe('estandar');
        return JSON.stringify({ sel: sel ? sel.value : null,
          idx: sel ? sel.selectedIndex : null,
          pill: window.__P.pill(${JSON.stringify(valv)}, ${JSON.stringify(tipo)}),
          manual: !!(window.esqSevManual || {})[clave],
          aviso: C ? window.__P.txt(C.aviso) : null,
          inf: est.inf, suma: est.suma }) })()`));
    }
    out.OTRAS = { fijado: otras, apagado: apagados };
  }

  /* ══ MAQUETACION — 1200 / 390 / 360 px ═══════════════════════════════════════════════════ */
  if (hacer('MOV')) {
    const mov = {};
    for (const w of [1200, 390, 360]) {
      await cdp.send('Emulation.setDeviceMetricsOverride',
        { width: w, height: 900, deviceScaleFactor: 1, mobile: w <= 430 }, sessionId);
      await pausa(300);
      mov[w] = JSON.parse(await ev(`(function(){
        window.__P.limpiar(); window.__P.abrirTodo();
        window.__P.set('vp_vmax', '3.5'); window.__P.set('ip_vmax', '2.5');
        /* ⚠️ VOLVER A LA PESTAÑA DE VALVULAS. abrirTodo termina en la de Doppler para dejar las dos
           tarjetas del Doppler Pulmonar abiertas, y el #tab-valvulas oculto NO TIENE GEOMETRIA: la
           primera corrida de esta escena midio ancho 0 y «sin desborde» en los tres anchos, que es el
           error de denominador de siempre con otra cara. Tambien se reabre la tarjeta, porque
           limpiarCampos la cierra. */
        try { showTab('valvulas') } catch(e) {}
        var _sec = document.getElementById('ete-seccion-valv-pulmonar');
        if (_sec && _sec.style.display === 'none') { try { toggleEteSeccion('valv-pulmonar') } catch(e) {} }
        var o = { global: window.__P.desborde(),
          caja: window.__P.desbordeDe('vp-lesiones'),
          camposE: window.__P.vis('campos-esten-pulmonar'),
          camposI: window.__P.vis('campos-insuf-pulmonar'),
          togE: window.__P.vis('datos-tog-esten-pulmonar'),
          togI: window.__P.vis('datos-tog-insuf-pulmonar'),
          tabE: window.__P.tabOrden('caja-esten-pulmonar'),
          tabI: window.__P.tabOrden('caja-insuf-pulmonar'),
          tabTarjeta: window.__P.tabOrden('ete-seccion-valv-pulmonar') };
        return JSON.stringify(o) })()`));
    }
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    out.MOV = mov;
  }

  const despues = await md5(join(RAIZ, 'index.html'));
  out.md5_antes = antes; out.md5_despues = despues; out.index_intacto = antes === despues;
  console.log(JSON.stringify(out, null, 2));
  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
