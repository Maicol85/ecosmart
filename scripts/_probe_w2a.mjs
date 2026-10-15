#!/usr/bin/env node
/**
 * _probe_w2a.mjs — sonda A/B de SOLO LECTURA para la tanda W2-A (2026-10-15), las TRES
 * correcciones de la valvula MITRAL NATIVA que salieron del censo W1:
 *   (1) W1-1 — el borrado del THP dejaba CINCO nodos rancios (`em_grado`, `avm_idx`,
 *       `#em-sev-integrada`, `#em-clase-thp`, `#em-thp-badge`) y el informe FIRMADO conservaba
 *       «con estenosis significativa» sin el numero que la sostenia;
 *   (2) W1-7 — el aviso de FIBRILACION AURICULAR en la continuidad mitral (EAE/ASE 2009,
 *       folio 14): el aviso NO bloquea, NO cambia el voto ni el grado y NO va a ninguna
 *       superficie firmada;
 *   (3) W1-2 — el Laboratorio contaba «Sin estenosis» lo que el informe llama «Gradiente
 *       transmitral elevado».
 *
 * Grupos (--solo thp|fuentes|otros|fa|color|lab|controles):
 *   thp       — el THP como UNICA fuente de area, por sus DOS puertas, con el grado manual.
 *   fuentes   — el mismo patron de borrado para CONTINUIDAD y PLANIMETRIA.
 *   otros     — los ONCE campos derivados del censo y el control negativo del PESO.
 *   fa        — la tabla ritmo x continuidad calculada, y el aviso que se SUMA al de IM/IAo.
 *   color     — el color computado del aviso de FA en los DOS temas, con dos controles.
 *   lab       — las categorias del Laboratorio contra lo que el informe dice del mismo estudio.
 *   controles — las otras lesiones, la diastolica, el Excel, el informe y la protesis.
 *
 * No muta index.html: comprueba su md5 al principio y al final.
 *
 *   node scripts/_probe_w2a.mjs --file /tmp/index.HEAD.html > /tmp/w2a.HEAD.json
 *   node scripts/_probe_w2a.mjs                             > /tmp/w2a.NEW.json
 *
 * Infraestructura calcada de scripts/_probe_emsignif.mjs y scripts/_probe_labem.mjs (teclas y
 * clics reales, cierre del arbol de Chrome por GRUPO y por PID PROPIO, reloj sobre ev(), aviso
 * legal despejado con su denominador, md5 al principio y al final).
 *
 * ⚠️ Sin acentos graves dentro del template de la sonda, tampoco en sus comentarios.
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdtemp, rm } from 'node:fs/promises';
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
const SOLO = arg('--solo');
/* --dest <dir>: si esta, el grupo `color` guarda el PNG del renglon del aviso en los dos temas. */
const DEST = arg('--dest');

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
      if (m.method === 'Page.javascriptDialogOpening' && api && api.alDialogo) {
        try { api.alDialogo({ tipo: m.params?.type, mensaje: m.params?.message }); } catch (x) {}
      }
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
  chk(id) { var e = document.getElementById(id); return e ? !!e.checked : null },
  existe(id) { return !!document.getElementById(id) },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  geo(id) { var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    var r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), ok: r.width > 0 && r.height > 0 } },
  pill(v, t) { try { return (typeof pillOn === 'function') ? pillOn(v, t) : 'SIN pillOn' }
    catch(e) { return 'EXC' } },

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

  quienEsta(id, x, y) {
    var t = document.getElementById(id);
    var e = document.elementFromPoint(x, y);
    if (!e) return { enPunto: null, esElBlanco: false };
    return { enPunto: (e.id || ('<' + e.tagName.toLowerCase() + ' ' + String(e.className || '') + '>')),
             esElBlanco: !!(t && (e === t || t.contains(e) || e.contains(t))) } },

  /* ⚠️ DENOMINADOR. Abre Valvulas, las cuatro tarjetas y el cajon de datos de la estenosis
     mitral, y CONFIRMA que los campos que esta sonda tipea tienen caja. Un focus() sobre un nodo
     oculto falla EN SILENCIO y la escena mide un tecleo que nunca ocurrio. */
  abrirTodo() {
    try { showTab('valvulas') } catch(e) {}
    ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'].forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && getComputedStyle(s).display === 'none') { try { toggleEteSeccion(tok) } catch(e) {} }
    });
    ['mitral','aortica'].forEach(function(v){
      try { if (typeof valvDatosTog === 'function') {
        var caj = document.getElementById(v === 'mitral' ? 'bloque-em-detalle' : 'bloque-ea-detalle');
        if (!caj || getComputedStyle(caj).display === 'none') valvDatosTog(v);
      } } catch(e) {}
    });
    var det = document.getElementById('bloque-em-detalle');
    if (det && getComputedStyle(det).display === 'none') det.style.display = 'block';
    return { tab: window.__P.vis('tab-valvulas'),
             thpDisp: window.__P.geo('em_thp_display'), plan: window.__P.geo('avm_plan'),
             vtimit: window.__P.geo('em_vtimit'), gmedio: window.__P.geo('em_gmedio'),
             ok: window.__P.geo('em_thp_display').ok && window.__P.geo('avm_plan').ok } },

  /* Estado de partida limpio y SIN DUENO, calcado de _probe_emsignif: sin vaciar los dos Set, la
     escena siguiente arranca con la mitral ya «de la app». */
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
    try { if (window.VALV_INSUF_AUTO) window.VALV_INSUF_AUTO.clear() } catch(e) {}
    return 1 },

  /* Montaje de escena, NO el gesto medido: peso, talla y los ocultos de grado no se tipean. */
  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value } },

  /* ══ LOS CINCO NODOS RANCIOS DEL CENSO W1, mas el grado, la pastilla y los derivados ══════
     Es la foto que la tabla «antes / despues» compara. em_grado y avm_idx viajan al Excel;
     los tres span son pantalla; la pastilla y el informe son lo que el papel afirma. */
  fotoEM() {
    return {
      thp:        window.__P.val('thp'),
      thpDisp:    window.__P.val('em_thp_display'),
      avm_thp:    window.__P.val('avm_thp'),
      avmThpDisp: window.__P.val('em_avm_thp_display'),
      thpRow:     window.__P.txt('em-thp-row'),
      avm_idx:    window.__P.val('avm_idx'),
      claseThp:   window.__P.txt('em-clase-thp'),
      sevIntegr:  window.__P.txt('em-sev-integrada'),
      em_grado:   window.__P.val('em_grado'),
      badge:      window.__P.txt('em-thp-badge'),
      pill:       window.__P.pill('mitral','esten'),
      avm_cont:   window.__P.val('avm_cont'),
      contRow:    window.__P.txt('em-cont-row'),
      claseCont:  window.__P.txt('em-clase-cont'),
      avm_plan:   window.__P.val('avm_plan'),
      planRow:    window.__P.txt('em-plan-row'),
      clasePlan:  window.__P.txt('em-clase-plan'),
      gmRow:      window.__P.txt('em-gmedio-row'),
      claseGm:    window.__P.txt('em-clase-gm'),
      disc:       window.__P.txt('em-discordancia'),
      contAviso:  window.__P.txt('em-cont-aviso'),
      faAviso:    window.__P.txt('em-cont-fa-aviso'),
      manual:     !!(window.esqSevManual && window.esqSevManual.em),
      dueno:      (function(){ try { var s = window.VALV_ESTEN_AUTO;
                    return s ? s.has('mitral') : 'SIN SET' } catch(e) { return 'EXC' } })(),
      clave:      (function(){ try { return localStorage.getItem('valv-pill-esten-mitral') }
                    catch(e) { return 'EXC' } })(),
      catClave:   (function(){ try { return emCategoria().clave } catch(e) { return 'EXC' } })()
    } },

  /* Los OTROS once campos derivados del censo, aorticos incluidos: su foto para el control. */
  fotoOtros() {
    return {
      em_gmax:    window.__P.val('em_gmax'),
      gmaxRow:    window.__P.txt('em-gmax-row'),
      vauto_vsv:  window.__P.val('vauto-vsv-tsvi'),
      ava_cont:   window.__P.val('ava_cont'),
      ava_idx:    window.__P.txt('ava-idx'),
      dvi:        window.__P.val('dvi_ao'),
      eaSev:      window.__P.txt('ea-sev'),
      ea_grado:   window.__P.val('ea_grado'),
      eaGmax:     window.__P.txt('ea-gmax-row'),
      eaCatClave: (function(){ try { return (typeof eaGradoCalculado === 'function')
                    ? String(eaGradoCalculado()) : 'SIN FN' } catch(e) { return 'EXC' } })()
    } },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  /* POR LINEA Y NO POR ORACION: el informe se arma con inf.push(...) y se une por salto de
     linea, asi que UNA linea es el parrafo entero de una valvula. */
  lineaVM(texto) {
    var re = /mitral|AVm/i;
    return String(texto || '').split(/\\n/).map(function(s){ return s.trim() })
      .filter(function(s){ return s && re.test(s) }) },
  lineaOtras(texto) {
    var re = /a[\\u00f3o]rtic|tric[\\u00fau]sp|pulmonar|llenado|diast[\\u00f3o]lic/i;
    return String(texto || '').split(/\\n/).map(function(s){ return s.trim() })
      .filter(function(s){ return s && re.test(s) }) },

  campos() {
    var c = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return } catch(e){}
      c[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      c[el.id + '__chk'] = el.checked ? '1' : '0' });
    return c },
  /* ⚠️ EL HASH DE LOS CAMPOS SE ORDENA ANTES DE HASHEAR, y descuenta los dos textarea del
     informe: sin ordenar, mover un campo de columna cambia el string sin cambiar un valor. */
  camposHash() {
    var c = window.__P.campos();
    delete c['informe_texto']; delete c['en_suma'];
    var k = Object.keys(c).sort(), s = '';
    for (var i=0;i<k.length;i++) s += k[i] + '=' + String(c[k[i]]) + '|';
    var h = 0; for (var j=0;j<s.length;j++) { h = ((h<<5)-h) + s.charCodeAt(j); h |= 0 }
    return { n: k.length, hash: String(h) } },

  excel() {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    try { var r = _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-15',
            campos: window.__P.campos() });
      var k = Object.keys(r).sort(), s = '';
      for (var i=0;i<k.length;i++) s += k[i] + '=' + String(r[k[i]]) + '|';
      var h = 0; for (var j=0;j<s.length;j++) { h = ((h<<5)-h) + s.charCodeAt(j); h |= 0 }
      return { cols: k.length, hash: String(h), emGrado: r['EM grado'] };
    } catch(e) { return 'EXC: ' + e.message } },

  /* Los veredictos ajenos, que esta tanda no puede mover. */
  ajenos() {
    return {
      imGrado:   window.__P.val('im_grado'),
      imSevFinal:window.__P.val('im_sev_final'),
      iaGrado:   window.__P.val('ia_grado'),
      itGrado:   window.__P.val('it_grado'),
      etGrado:   window.__P.val('et_grado'),
      epGrado:   window.__P.val('ep_grado'),
      ipGrado:   window.__P.val('ip_grado'),
      eaGrado:   window.__P.val('ea_grado'),
      ddInterp:  window.__P.txt('dd-interp'),
      hfLinea:   window.__P.txt('hfapeff-eco-lbl'),
      pills: (function(){ var o = {};
        ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
          ['esten','insuf'].forEach(function(t){ o[t + '-' + v] = window.__P.pill(v,t) }) });
        return o })()
    } },

  /* ══ EL RITMO Y EL AVISO DE FIBRILACION AURICULAR ════════════════════════════════════════
     El ritmo se pone por el <select> de la diastolica —que es el dueno unico— con un gesto de
     cambio real, y se informa lo que hfRitmoEfectivo() devuelve: sin eso, «el aviso no sale» no
     distingue «no lo mira» de «el ritmo no quedo puesto». */
  ponerRitmo(tok) {
    var e = document.getElementById('diast_ritmo');
    if (!e) return { err: 'NO EXISTE diast_ritmo' };
    e.value = tok;
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { pedido: tok, quedo: e.value,
             efectivo: (function(){ try { return hfRitmoEfectivo() } catch(x) { return 'EXC' } })() } },
  ritmo() {
    return { select: window.__P.val('diast_ritmo'),
             efectivo: (function(){ try { return hfRitmoEfectivo() } catch(x) { return 'EXC' } })() } },

  /* ⚠️ EL COLOR SE LEE COMPUTADO Y TAMBIEN SE PREGUNTA POR LA VARIABLE: la tanda D2 encontro
     avisos «ambar» que se veian GRISES porque --amber solo existe dentro de .amilo-root, y
     getPropertyValue devolvia cadena vacia. Las dos lecturas juntas son las que lo distinguen. */
  color(id) {
    var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    var cs = getComputedStyle(e);
    return { color: cs.color, display: cs.display, fontSize: cs.fontSize,
             varOrange: cs.getPropertyValue('--orange').trim(),
             varAmber:  cs.getPropertyValue('--amber').trim(),
             varYellow: cs.getPropertyValue('--yellow').trim() } },
  /* ⚠️ EL TEMA DE ESTA APP ES LA CLASE light-mode SOBRE documentElement, y no un data-attribute:
     una sonda de este repo midio «los dos temas» escribiendo data-theme y los dos salieron
     identicos byte por byte. Se ABORTA si la clase no quedo puesta. */
  tema(claro) {
    var r = document.documentElement;
    if (claro) r.classList.add('light-mode'); else r.classList.remove('light-mode');
    return { claro: !!claro, tieneClase: r.classList.contains('light-mode') } },

  /* ══ EL LABORATORIO: la lectura unica sobre un estudio ARCHIVADO ══════════════════════════
     El Laboratorio no lee el formulario: lee inf.campos. Por eso estas escenas son REGISTROS. */
  reg(campos, nombre) {
    return { id: 'P' + (nombre || 'x'), nombre: 'P ' + (nombre || 'x'), ci: '1',
             fecha_estudio: '2026-10-15', campos: campos || {} } },
  lee(campos) {
    if (typeof _labEmLectura !== 'function') return 'SIN FN';
    try { var r = _labEmLectura(window.__P.reg(campos));
      return r === null ? null : { cat: r.cat, lbl: r.lbl, avm: r.avm, gm: r.gm,
                                   porArea: r.porArea, porGrad: r.porGrad, imSig: r.imSig };
    } catch (e) { return 'EXC: ' + e.message } },
  /* Las seis categorias contadas sobre una poblacion, para comprobar que son EXCLUYENTES y que
     suman el total de estudios CON dato de esta valvula. */
  censo(regs) {
    if (typeof _labEmLectura !== 'function') return 'SIN FN';
    var orden = (typeof LAB_EM_CAT_ORDEN !== 'undefined') ? LAB_EM_CAT_ORDEN : [];
    var cnt = {}; orden.forEach(function(k){ cnt[k] = 0 });
    var conDato = 0, fuera = 0, otras = 0;
    regs.forEach(function(c){
      var r = _labEmLectura(window.__P.reg(c));
      if (!r) { fuera++; return; }
      conDato++;
      if (cnt[r.cat] === undefined) { otras++; return; }
      cnt[r.cat]++;
    });
    var suma = 0; orden.forEach(function(k){ suma += cnt[k] });
    return { n: regs.length, conDato: conDato, fuera: fuera, otras: otras,
             cnt: cnt, suma: suma, cuadra: suma === conDato } },
  /* Las dos casillas superponibles, con la interseccion. */
  casillas(regs) {
    if (typeof _labEmCasillas !== 'function') return 'SIN FN';
    try { return _labEmCasillas(regs.map(function(c){ return window.__P.reg(c) })) }
    catch(e) { return 'EXC: ' + e.message } },
  /* El token viejo, que esta tanda NO toca: control negativo de la lectura por regex. */
  leeViejo(campos) {
    if (typeof _labEstenSev !== 'function') return 'SIN FN';
    try { return _labEstenSev(window.__P.reg(campos), 'em_grado') } catch(e) { return 'EXC' } },
  /* Las ocho filas de la tabla resumen de valvulopatias: ninguna se mueve con esta tanda. */
  valvCounts(regs) {
    if (typeof _labValvCounts !== 'function') return 'SIN FN';
    try { var vc = _labValvCounts(regs.map(function(c){ return window.__P.reg(c) }));
      return { bases: vc.bases, L: vc.counts.Leve, M: vc.counts.Moderada, S: vc.counts.Severa, N: vc.N };
    } catch(e) { return 'EXC: ' + e.message } },

  /* El rectangulo de la fila del aviso, en coordenadas de PAGINA. ⚠️ El clip de
     Page.captureScreenshot va en coordenadas de PAGINA y getBoundingClientRect da las del
     VIEWPORT: con la pagina scrolleada, la captura de la tanda del violeta salio EN NEGRO. Se
     suma el scroll, y antes se scrollea el nodo al centro. */
  recorte(id) {
    var e = document.getElementById(id); if (!e) return { err: 'NO EXISTE ' + id };
    e.scrollIntoView({ block: 'center', inline: 'center' });
    var fila = e.closest('.calc-row') || e;
    var r = fila.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return { err: 'sin geometria' };
    return { x: Math.max(0, Math.round(r.left + window.scrollX) - 6),
             y: Math.max(0, Math.round(r.top + window.scrollY) - 6),
             width: Math.round(r.width) + 12, height: Math.round(r.height) + 12 } },

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

/* ══ LAS ESCENAS ══════════════════════════════════════════════════════════════════════════════
   Registros del Laboratorio para el grupo `lab`: estudios ARCHIVADOS, no tecleos.
   ⚠️ LA IM SE PONE POR SU GRADO FINAL (`im_grado`), que es lo que `emImSignificativa` lee. */
const R = {
  gm12_sinIM:  { em_gmedio: '12' },
  gm12_imMod:  { em_gmedio: '12', im_grado: '2' },
  gm12_imSev:  { em_gmedio: '12', im_grado: '4' },
  gm7_sinIM:   { em_gmedio: '7' },
  gm7_imMod:   { em_gmedio: '7',  im_grado: '2' },
  gm7_imSev:   { em_gmedio: '7',  im_grado: '4' },
  gm49_imSev:  { em_gmedio: '4.9', im_grado: '4' },
  area12_imSev:{ avm_plan: '1.2', em_gmedio: '12', im_grado: '4' },
  area08:      { avm_plan: '0.8' },
  area20_gm7:  { avm_plan: '2.0', em_gmedio: '7' },
  nada:        {},
  protesis:    { vm_morf: 'Prótesis mecánica', em_gmedio: '12' },
  tokSig:      { em_grado: 'severa' }
};
const POBLACION = Object.keys(R).map((k) => R[k]);

async function main() {
  const rutaViva = EXTERNO ? FARG : join(RAIZ, FILE);
  const md5Ini = await md5(rutaViva);
  const { srv, port } = await servir();
  const { wsUrl } = await abrirChrome(`http://127.0.0.1:${port}/${FILE}`);
  const cdp = await conectar(wsUrl);
  const { targetInfos } = await cdp.send('Target.getTargets');
  const page = targetInfos.find((t) => t.type === 'page');
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: page.targetId, flatten: true });
  await cdp.send('Runtime.enable', {}, sessionId);
  await cdp.send('Page.enable', {}, sessionId);
  const dialogos = [];
  cdp.alDialogo = (d) => { dialogos.push(d);
    cdp.send('Page.handleJavaScriptDialog', { accept: true }, sessionId).catch(() => {}); };
  const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
  await pausa(2200);

  /* ⚠️ RELOJ SOBRE ev(): un despacho que NO RESUELVE deja el fallo apareciendo en la llamada
     SIGUIENTE, o sea en la linea equivocada. Con el reloj el error nombra su propio paso. */
  const RELOJ = 75000;
  let _paso = '(arranque)';
  const paso = (n) => { _paso = n; if (VER || process.env.W2A_TRAZA) console.error('  . ' + n); };
  async function ev(expr) {
    const r = await Promise.race([
      cdp.send('Runtime.evaluate',
        { expression: expr, returnByValue: true, awaitPromise: true }, sessionId),
      new Promise((_, no) => setTimeout(() => no(new Error(
        'CDP sin respuesta en ' + (RELOJ / 1000) + ' s - paso ' + _paso)), RELOJ)),
    ]);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' :: ' + (r.exceptionDetails.exception || {}).description);
    return r.result.value;
  }
  const J = async (expr) => JSON.parse(await ev('JSON.stringify(' + expr + ')'));

  const VK = { Backspace: 8, Delete: 46, Tab: 9, Enter: 13, End: 35, Home: 36, Space: 32 };
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
    const c = await J('window.__P.centro(' + JSON.stringify(id) + ')');
    if (!c || c.err) return { via: 'NO SE PUDO', por: c ? c.err : 'no existe' };
    const quien = await J('window.__P.quienEsta(' + JSON.stringify(id) + ', ' + c.x + ', ' + c.y + ')');
    if (quien.esElBlanco) {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await pausa(140);
      return { via: 'mouse', quien };
    }
    await ev('(function(){ var e=document.getElementById(' + JSON.stringify(id) + '); if(e) e.focus(); return 1 })()');
    await tecla('Enter', null);
    await pausa(140);
    return { via: 'tecla Enter', quien };
  }
  async function enfocar(id) {
    let rev = await J('window.__P.revelar(' + JSON.stringify(id) + ')');
    for (let i = 0; i < 4 && rev && rev.necesitaClic; i++) {
      await clicEn(rev.necesitaClic);
      rev = await J('window.__P.revelar(' + JSON.stringify(id) + ')');
    }
    const c = await J('window.__P.centro(' + JSON.stringify(id) + ')');
    if (c && !c.err) {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
    }
    await ev('(function(){ var e=document.getElementById(' + JSON.stringify(id) + '); if(e) e.focus(); return 1 })()');
    return c && c.err ? ('foco-dom (' + c.err + ')') : 'clic';
  }
  /* ⚠️ TIPEAR EN UN CAMPO SIN GEOMETRIA NO ES UNA MEDICION: se ABORTA nombrando el campo. */
  async function tipear(id, valor) {
    const hay = await ev('window.__P.existe(' + JSON.stringify(id) + ')');
    if (!hay) throw new Error('ABORTA: el campo ' + id + ' no existe en este arbol');
    let via = await enfocar(id);
    let geo = await J('window.__P.geo(' + JSON.stringify(id) + ')');
    if (!geo.ok) { await J('window.__P.abrirTodo()'); via = await enfocar(id);
                   geo = await J('window.__P.geo(' + JSON.stringify(id) + ')'); }
    if (!geo.ok) throw new Error('ABORTA: ' + id + ' sin geometria (' + JSON.stringify(geo) + ')');
    await ev('(function(){ var e=document.getElementById(' + JSON.stringify(id) + ');'
           + ' if(!e) return 0; e.focus(); try{ e.select() }catch(x){} return 1 })()');
    for (const ch of String(valor)) await tecla(ch, ch);
    await ev('(function(){ var e=document.getElementById(' + JSON.stringify(id) + ');'
           + ' if(e){ e.dispatchEvent(new Event("change",{bubbles:true})) } return 1 })()');
    await pausa(90);
    const quedo = await ev('window.__P.val(' + JSON.stringify(id) + ')');
    if (String(quedo) !== String(valor))
      throw new Error('ABORTA: el tecleo de ' + id + ' no quedo: pedido ' + valor + ', quedo ' + quedo);
    return { id, via, quedo: String(quedo) };
  }
  /* NUNCA Backspace sobre un campo de SOLO LECTURA: se comprueba antes y se declara. */
  async function borrar(id) {
    const ro = await ev('(function(){ var e=document.getElementById(' + JSON.stringify(id) + ');'
      + ' return e ? (!!e.readOnly || !!e.disabled) : "NO EXISTE" })()');
    if (ro !== false) return { id, via: 'NO SE BORRA', por: String(ro) };
    let via = await enfocar(id);
    let geo = await J('window.__P.geo(' + JSON.stringify(id) + ')');
    if (!geo.ok) { await J('window.__P.abrirTodo()'); via = await enfocar(id);
                   geo = await J('window.__P.geo(' + JSON.stringify(id) + ')'); }
    if (!geo.ok) throw new Error('ABORTA: no se puede borrar ' + id + ' sin geometria');
    await ev('(function(){ var e=document.getElementById(' + JSON.stringify(id) + '); if(e) e.focus(); return 1 })()');
    const foco = await ev('(function(){ return document.activeElement ? (document.activeElement.id || "") : "" })()');
    if (String(foco) !== String(id))
      throw new Error('ABORTA: el foco no llego a ' + id + ' (esta en ' + JSON.stringify(foco) + ')');
    await tecla('End', null);
    for (let i = 0; i < 12; i++) await tecla('Backspace', null);
    await ev('(function(){ var e=document.getElementById(' + JSON.stringify(id) + ');'
           + ' if(e){ e.dispatchEvent(new Event("change",{bubbles:true})); e.blur() } return 1 })()');
    await pausa(120);
    const quedo = await ev('window.__P.val(' + JSON.stringify(id) + ')');
    if (String(quedo) !== '')
      throw new Error('ABORTA: el borrado de ' + id + ' no quedo: sigue en ' + JSON.stringify(quedo));
    return { id, via: 'Backspace x12', quedo: '' };
  }

  /* ⚠️ HAY DOS GESTOS DE BORRADO Y DAN RESULTADOS DISTINTOS, Y ESO NO ES UN DETALLE DE LA SONDA.
     Borrando DIGITO POR DIGITO desde el final, el paso intermedio («1» de «160») vuelve a correr
     la cadena con un THP fuera de banda, asi que el grado se recalcula ahi y lo que queda rancio
     es el AVm INDEXADO del paso anterior. Seleccionando todo y borrando de UNA, la cadena no
     corre ningun paso intermedio: el THP pasa de «160» a vacio, `calcTHP` sale temprano y queda
     rancio TODO, el grado incluido. Es la escena del censo W1 y la que llega al papel firmado.
     El SELECT ALL va como COMANDO DE EDICION del propio evento de tecla (Meta+A con
     `commands:['selectAll']`), que es el mismo mecanismo por el que este repo manda Backspace por
     keycode: la tecla es real y Blink ejecuta el comando. */
  async function borrarSeleccion(id) {
    const ro = await ev('(function(){ var e=document.getElementById(' + JSON.stringify(id) + ');'
      + ' return e ? (!!e.readOnly || !!e.disabled) : "NO EXISTE" })()');
    if (ro !== false) return { id, via: 'NO SE BORRA', por: String(ro) };
    let via = await enfocar(id);
    let geo = await J('window.__P.geo(' + JSON.stringify(id) + ')');
    if (!geo.ok) { await J('window.__P.abrirTodo()'); via = await enfocar(id);
                   geo = await J('window.__P.geo(' + JSON.stringify(id) + ')'); }
    if (!geo.ok) throw new Error('ABORTA: no se puede borrar ' + id + ' sin geometria');
    await ev('(function(){ var e=document.getElementById(' + JSON.stringify(id) + '); if(e) e.focus(); return 1 })()');
    const foco = await ev('(function(){ return document.activeElement ? (document.activeElement.id || "") : "" })()');
    if (String(foco) !== String(id))
      throw new Error('ABORTA: el foco no llego a ' + id + ' (esta en ' + JSON.stringify(foco) + ')');
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'a', code: 'KeyA', modifiers: 4,
      commands: ['selectAll'], windowsVirtualKeyCode: 65, nativeVirtualKeyCode: 65 }, sessionId);
    await cdp.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'a', code: 'KeyA', modifiers: 4,
      windowsVirtualKeyCode: 65, nativeVirtualKeyCode: 65 }, sessionId);
    await pausa(60);
    await tecla('Backspace', null);
    await ev('(function(){ var e=document.getElementById(' + JSON.stringify(id) + ');'
           + ' if(e){ e.dispatchEvent(new Event("change",{bubbles:true})); e.blur() } return 1 })()');
    await pausa(140);
    const quedo = await ev('window.__P.val(' + JSON.stringify(id) + ')');
    if (String(quedo) !== '')
      throw new Error('ABORTA: el borrado de UNA VEZ de ' + id + ' no quedo: sigue en ' + JSON.stringify(quedo));
    return { id, via: 'selectAll + 1 Backspace', quedo: '' };
  }

  await ev('try{sessionStorage.setItem("ett_auth","1")}catch(e){}; location.reload(); 1');
  await pausa(2600);
  await ev(SONDA);
  const avisoIni = await J('window.__P.despejar()');
  const listo = await J('window.__P.abrirTodo()');
  if (!listo.ok) throw new Error('ABORTA: el cajon de la estenosis mitral no quedo abierto: ' + JSON.stringify(listo));

  const out = { file: FARG, md5Ini, avisoIni, listo, grupos: {} };
  const SOLOG = (arg('--solo') || '').split(',').map((s) => s.trim()).filter(Boolean);
  const corre = (g) => !SOLOG.length || SOLOG.indexOf(g) >= 0;

  /* Escena base: mitral NORMAL, sin protesis, con peso y talla para que el AVm indexado exista. */
  async function base() {
    await ev('window.__P.limpiar()');
    await J('window.__P.abrirTodo()');
    await J('window.__P.set("peso", 70)');
    await J('window.__P.set("talla", 170)');
    await J('window.__P.set("edad", 62)');
    await J('window.__P.ponerRitmo("sinusal")');
    await J('window.__P.abrirTodo()');
    return 1;
  }

  /* ══ GRUPO thp — W1-1: el THP como UNICA fuente de area, cargado y borrado con teclas ══════ */
  if (corre('thp')) {
    paso('thp');
    const g = {};
    /* (a) por la puerta de VALVULAS (`em_thp_display`), que es la pestania donde se mide. */
    await base();
    g.tipeo = await tipear('em_thp_display', '160');
    await pausa(150);
    g.antes = await J('window.__P.fotoEM()');
    g.infAntes = await J('window.__P.informe("estandar")');
    g.borrado = await borrar('em_thp_display');
    await pausa(150);
    g.despues = await J('window.__P.fotoEM()');
    g.infDespues = await J('window.__P.informe("estandar")');
    g.lineaAntes   = await J('window.__P.lineaVM(' + JSON.stringify(g.infAntes.inf) + ')');
    g.lineaDespues = await J('window.__P.lineaVM(' + JSON.stringify(g.infDespues.inf) + ')');
    g.sumaAntes    = g.infAntes.suma;
    g.sumaDespues  = g.infDespues.suma;
    g.excelDespues = await J('window.__P.excel()');

    /* (a2) EL MISMO CAMPO, BORRADO DE UNA VEZ: es la escena del censo W1. */
    await base();
    g.tipeo2 = await tipear('em_thp_display', '160');
    await pausa(150);
    g.antes2 = await J('window.__P.fotoEM()');
    g.inf2Antes = await J('window.__P.informe("estandar")');
    g.borrado2 = await borrarSeleccion('em_thp_display');
    await pausa(150);
    g.despues2 = await J('window.__P.fotoEM()');
    g.inf2Despues = await J('window.__P.informe("estandar")');
    g.linea2Antes   = await J('window.__P.lineaVM(' + JSON.stringify(g.inf2Antes.inf) + ')');
    g.linea2Despues = await J('window.__P.lineaVM(' + JSON.stringify(g.inf2Despues.inf) + ')');
    g.excel2Despues = await J('window.__P.excel()');

    /* (b) por la puerta del DOPPLER (`thp`), el camino que midio el censo. */
    await base();
    await ev('(function(){ try { showTab("doppler") } catch(e) {} return 1 })()');
    g.tipeoDop = await tipear('thp', '160');
    await pausa(150);
    g.antesDop = await J('window.__P.fotoEM()');
    g.borradoDop = await borrarSeleccion('thp');
    await pausa(150);
    g.despuesDop = await J('window.__P.fotoEM()');

    /* (c) EL GRADO FIJADO A MANO SE RESPETA: la regla del 13/10 por su otro lado. */
    await base();
    await tipear('em_thp_display', '160');
    await pausa(120);
    await J('window.__P.set("em_grado","severa")');
    await ev('(function(){ try { emGradoManual() } catch(e) {} return 1 })()');
    await pausa(120);
    g.manualAntes = await J('window.__P.fotoEM()');
    g.borradoManual = await borrarSeleccion('em_thp_display');
    await pausa(150);
    g.manualDespues = await J('window.__P.fotoEM()');
    g.manualInf = await J('window.__P.informe("estandar")');
    out.grupos.thp = g;
  }

  /* ══ GRUPO fuentes — el mismo patron para CONTINUIDAD y PLANIMETRIA ═══════════════════════ */
  if (corre('fuentes')) {
    paso('fuentes');
    const g = {};
    /* CONTINUIDAD: tres insumos. Se borra el ULTIMO que la produce (el VTI mitral). */
    await base();
    g.contTipeos = [];
    g.contTipeos.push(await tipear('em_dtsvi', '20'));
    g.contTipeos.push(await tipear('em_vtitsvi', '18'));
    g.contTipeos.push(await tipear('em_vtimit', '60.8'));
    await pausa(150);
    g.contAntes = await J('window.__P.fotoEM()');
    g.contInfAntes = await J('window.__P.informe("estandar")');
    g.contBorrado = await borrarSeleccion('em_vtimit');
    await pausa(150);
    g.contDespues = await J('window.__P.fotoEM()');
    g.contInfDespues = await J('window.__P.informe("estandar")');
    /* y borrando el OTRO insumo, el diametro del TSVI. */
    await base();
    await tipear('em_dtsvi', '20'); await tipear('em_vtitsvi', '18'); await tipear('em_vtimit', '60.8');
    await pausa(150);
    g.contDiamAntes = await J('window.__P.fotoEM()');
    g.contDiamBorrado = await borrarSeleccion('em_dtsvi');
    await pausa(150);
    g.contDiamDespues = await J('window.__P.fotoEM()');

    /* PLANIMETRIA: un solo campo. */
    await base();
    g.planTipeo = await tipear('avm_plan', '1.2');
    await pausa(150);
    g.planAntes = await J('window.__P.fotoEM()');
    g.planInfAntes = await J('window.__P.informe("estandar")');
    g.planBorrado = await borrarSeleccion('avm_plan');
    await pausa(150);
    g.planDespues = await J('window.__P.fotoEM()');
    g.planInfDespues = await J('window.__P.informe("estandar")');
    out.grupos.fuentes = g;
  }

  /* ══ GRUPO otros — los ONCE campos derivados del censo, uno por uno ═══════════════════════
     ⚠️ CONTROL NEGATIVO del censo: borrar el PESO limpia SOLO `avm_idx` y deja el resto, que es
     el comportamiento deliberado de `_emAvmiSinBSA`. */
  if (corre('otros')) {
    paso('otros');
    const g = { campos: [] };
    const MITRAL = [['avm_plan','1.2'], ['em_vtimit','60.8'], ['em_dtsvi','20'],
                    ['em_vtitsvi','18'], ['em_gmedio','12'], ['em_vmax','1.6']];
    for (const [id, val] of MITRAL) {
      await base();
      /* La continuidad necesita sus tres insumos para producir un area: se cargan los tres y se
         borra el que toca, asi la escena tiene denominador. */
      if (id === 'em_vtimit' || id === 'em_dtsvi' || id === 'em_vtitsvi') {
        await tipear('em_dtsvi', '20'); await tipear('em_vtitsvi', '18'); await tipear('em_vtimit', '60.8');
      } else {
        await tipear(id, val);
      }
      if (id !== 'em_vtimit' && id !== 'em_dtsvi' && id !== 'em_vtitsvi') { /* ya cargado */ }
      await pausa(120);
      const antes = await J('window.__P.fotoEM()');
      const bor = await borrarSeleccion(id);
      await pausa(120);
      const despues = await J('window.__P.fotoEM()');
      g.campos.push({ id, bor: bor.via, antes, despues });
    }
    const AORTA = [['vmax_ao','4.5'], ['gmedio_ao','45'], ['itv_ao','110'],
                   ['ea_dtsvi','20'], ['ea_vtitsvi','18'], ['ava_plan','0.8']];
    g.aorta = [];
    for (const [id, val] of AORTA) {
      await base();
      await tipear(id, val);
      await pausa(120);
      const antes = await J('window.__P.fotoOtros()');
      const bor = await borrarSeleccion(id);
      await pausa(120);
      const despues = await J('window.__P.fotoOtros()');
      g.aorta.push({ id, bor: bor.via, antes, despues });
    }
    /* CONTROL NEGATIVO: el peso. */
    await base();
    await tipear('em_thp_display', '160');
    await pausa(120);
    g.pesoAntes = await J('window.__P.fotoEM()');
    g.pesoBorrado = await borrarSeleccion('peso');
    await pausa(120);
    g.pesoDespues = await J('window.__P.fotoEM()');
    out.grupos.otros = g;
  }

  /* ══ GRUPO fa — W1-7: el aviso de fibrilacion auricular en la continuidad ═════════════════ */
  if (corre('fa')) {
    paso('fa');
    const g = { tabla: [] };
    for (const ritmo of ['sinusal', 'fa']) {
      for (const conCont of [true, false]) {
        await base();
        if (conCont) {
          await tipear('em_dtsvi', '20'); await tipear('em_vtitsvi', '18'); await tipear('em_vtimit', '60.8');
        } else {
          await tipear('em_gmedio', '12');
        }
        const r = await J('window.__P.ponerRitmo(' + JSON.stringify(ritmo) + ')');
        await pausa(200);
        const foto = await J('window.__P.fotoEM()');
        const inf = await J('window.__P.informe("estandar")');
        g.tabla.push({ ritmo, conCont, ritmoReal: r,
                       avm_cont: foto.avm_cont, contAviso: foto.contAviso, faAviso: foto.faAviso,
                       catClave: foto.catClave, em_grado: foto.em_grado, pill: foto.pill,
                       lineaVM: await J('window.__P.lineaVM(' + JSON.stringify(inf.inf) + ')'),
                       suma: inf.suma,
                       excel: await J('window.__P.excel()') });
      }
    }
    /* EL AVISO SE SUMA SIN PISAR el motivo de IM/IAo: con IM moderada y FA tienen que estar LOS
       DOS textos. Es la condicion que la orden pide explicitamente. */
    await base();
    await tipear('em_dtsvi', '20'); await tipear('em_vtitsvi', '18'); await tipear('em_vtimit', '60.8');
    await J('window.__P.set("im_grado","2")');
    await J('window.__P.ponerRitmo("fa")');
    await pausa(200);
    g.conMotivoIM = await J('window.__P.fotoEM()');
    /* y el mismo escenario en sinusal, para que el motivo de IM se lea solo. */
    await J('window.__P.ponerRitmo("sinusal")');
    await pausa(200);
    g.conMotivoIMsinusal = await J('window.__P.fotoEM()');
    out.grupos.fa = g;
  }

  /* ══ GRUPO color — el color REAL del aviso de FA en los DOS temas ═════════════════════════ */
  if (corre('color')) {
    paso('color');
    const g = {};
    await base();
    await tipear('em_dtsvi', '20'); await tipear('em_vtitsvi', '18'); await tipear('em_vtimit', '60.8');
    await J('window.__P.ponerRitmo("fa")');
    await pausa(200);
    for (const claro of [false, true]) {
      const t = await J('window.__P.tema(' + (claro ? 'true' : 'false') + ')');
      if (t.tieneClase !== claro) throw new Error('ABORTA: la clase light-mode no quedo en ' + claro);
      await pausa(150);
      g[claro ? 'claro' : 'oscuro'] = {
        tema: t,
        fa: await J('window.__P.color("em-cont-fa-aviso")'),
        /* CONTROL NEGATIVO: el aviso de motivo de al lado, que esta tanda no toca. */
        motivo: await J('window.__P.color("em-cont-aviso")'),
        /* y el aviso de exclusiones de la diastolica, que la tanda D2 paso a --orange. */
        exclu: await J('window.__P.color("diast-excl-aviso")'),
        txt: await J('window.__P.fotoEM()')
      };
    }
    await J('window.__P.tema(false)');
    /* ⚠️ Y LA CAPTURA, PORQUE getComputedStyle LEE EL ESTILO Y NO EL PIXEL. La tanda del violeta
       informo `rgb(237,233,254)` sobre un PNG gris: el aviso legal vuelve a mitad de corrida y
       OSCURECE la imagen entera. Se despeja DENTRO del medidor y se informa su estado al lado. */
    if (DEST) {
      g.captura = [];
      for (const claro of [false, true]) {
        const t = await J('window.__P.tema(' + (claro ? 'true' : 'false') + ')');
        if (t.tieneClase !== claro) throw new Error('ABORTA: la clase light-mode no quedo en ' + claro);
        const desp = await J('window.__P.despejar()');
        const rec = await J('window.__P.recorte("em-cont-fa-aviso")');
        if (rec.err) { g.captura.push({ claro, err: rec.err }); continue; }
        const png = await cdp.send('Page.captureScreenshot',
          { format: 'png', clip: { x: rec.x, y: rec.y, width: rec.width, height: rec.height, scale: 2 } },
          sessionId);
        const f = join(DEST, 'w2a-fa-' + (claro ? 'claro' : 'oscuro') + '.png');
        const buf = Buffer.from(png.data, 'base64');
        await writeFile(f, buf);
        g.captura.push({ claro, archivo: f, bytes: buf.length, recorte: rec, despejado: desp,
                         md5: createHash('md5').update(buf).digest('hex') });
      }
      await J('window.__P.tema(false)');
    }
    out.grupos.color = g;
  }

  /* ══ GRUPO lab — W1-2: el Laboratorio clasifica igual que el informe ══════════════════════ */
  if (corre('lab')) {
    paso('lab');
    const g = { lecturas: {}, viejo: {} };
    for (const k of Object.keys(R)) {
      g.lecturas[k] = await J('window.__P.lee(' + JSON.stringify(R[k]) + ')');
      g.viejo[k]    = await ev('window.__P.leeViejo(' + JSON.stringify(R[k]) + ')');
    }
    g.censo    = await J('window.__P.censo(' + JSON.stringify(POBLACION) + ')');
    g.casillas = await J('window.__P.casillas(' + JSON.stringify(POBLACION) + ')');
    g.valvCounts = await J('window.__P.valvCounts(' + JSON.stringify(POBLACION) + ')');
    g.catOrden = await J('(typeof LAB_EM_CAT_ORDEN !== "undefined") ? LAB_EM_CAT_ORDEN : "SIN"');
    g.catTxt   = await J('(typeof LAB_EM_CAT !== "undefined") ? LAB_EM_CAT : "SIN"');
    /* ⚠️ LO QUE EL INFORME DICE DE ESOS MISMOS ESTUDIOS, para poder comparar las dos superficies:
       se monta la escena en el formulario y se genera el informe de verdad. */
    g.informes = [];
    for (const esc of [['gm12_imSev', '12', '4'], ['gm7_imSev', '7', '4'],
                       ['gm12_sinIM', '12', ''], ['gm7_sinIM', '7', '']]) {
      await base();
      await tipear('em_gmedio', esc[1]);
      if (esc[2]) await J('window.__P.set("im_grado",' + JSON.stringify(esc[2]) + ')');
      await pausa(150);
      const inf = await J('window.__P.informe("estandar")');
      const foto = await J('window.__P.fotoEM()');
      g.informes.push({ esc: esc[0], catClave: foto.catClave, em_grado: foto.em_grado,
                        lineaVM: await J('window.__P.lineaVM(' + JSON.stringify(inf.inf) + ')'),
                        suma: inf.suma,
                        /* y la lectura del Laboratorio sobre el MISMO estudio recolectado. */
                        lab: await J('(function(){ if (typeof _labEmLectura !== "function") return "SIN FN";'
                          + ' var r = _labEmLectura({ id:"T", nombre:"T", ci:"1", fecha_estudio:"2026-10-15",'
                          + ' campos: window.__P.campos() });'
                          + ' return r === null ? null : { cat: r.cat, lbl: r.lbl, gm: r.gm, porArea: r.porArea, porGrad: r.porGrad, imSig: r.imSig } })()') });
    }
    out.grupos.lab = g;
  }

  /* ══ GRUPO controles — lo que esta tanda NO puede mover ═══════════════════════════════════ */
  if (corre('controles')) {
    paso('controles');
    const g = {};
    /* Escenario CARGADO en las otras lesiones, para que el control tenga denominador. */
    await base();
    await J('window.__P.set("im_grado","4")');
    await J('window.__P.set("ia_grado","2")');
    await J('window.__P.set("it_grado","2")');
    await tipear('vmax_ao', '4.5');
    await tipear('ea_dtsvi', '20');
    await tipear('ea_vtitsvi', '18');
    await tipear('itv_ao', '110');
    await J('window.__P.set("onda_e", 100)');
    await J('window.__P.set("onda_a", 50)');
    await J('window.__P.set("e_prima_septal", 6)');
    await J('window.__P.set("e_prima_lateral", 8)');
    await J('window.__P.set("ai_vol", 40)');
    await J('window.__P.set("fevi", 60)');
    await pausa(250);
    g.ajenos = await J('window.__P.ajenos()');
    g.otros  = await J('window.__P.fotoOtros()');
    g.excel  = await J('window.__P.excel()');
    g.campos = await J('window.__P.camposHash()');
    g.inf = {};
    for (const est of ['estandar', 'narrativo', 'conciso']) {
      const i = await J('window.__P.informe(' + JSON.stringify(est) + ')');
      g.inf[est] = { inf: i.inf, suma: i.suma,
                     otras: await J('window.__P.lineaOtras(' + JSON.stringify(i.inf) + ')') };
    }
    /* PROTESIS: la mitral protesica no se gradua, y esta tanda no la toca. */
    await base();
    await J('window.__P.set("vm_morf","Pr\\u00f3tesis mec\\u00e1nica")');
    await tipear('em_gmedio', '12');
    await J('window.__P.ponerRitmo("fa")');
    await pausa(200);
    g.protesis = await J('window.__P.fotoEM()');
    g.protesisInf = await J('window.__P.informe("estandar")');
    out.grupos.controles = g;
  }

  out.dialogos = dialogos;
  out.avisoFin = await J('window.__P.despejar()');
  out.md5Fin = await md5(rutaViva);
  console.log(JSON.stringify(out, null, 1));
  try { cdp.close(); } catch (e) {}
  try { srv.close(); } catch (e) {}
  process.exit(0);
}

main().catch((e) => { console.error('[_probe_w2a] ' + (e && e.stack || e)); process.exit(1); });
