#!/usr/bin/env node
/**
 * _probe_w2b.mjs — sonda A/B de SOLO LECTURA para la tanda W2-B (2026-10-15), los CRITERIOS
 * PROPIOS DE LAS PROTESIS mitral y aortica que salieron del censo W1:
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-w2b-'));
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

  /* ══ W2-B: LA CAPSULA DE LA PROTESIS MITRAL Y EL CUADRO DE REFERENCIAS ═══════════════════
     Las seis filas de la capsula (las TRES nuevas de la Tabla 11 mas las tres que ya estaban) y
     las cuatro clases del cuadro. Las dos superficies en la MISMA foto: el defecto W1-3 era
     justamente que decian cosas distintas del mismo numero a dos centimetros. */
  fotoProtVM() {
    return {
      capVmax:  window.__P.txt('vm-prot-vmax'),
      capGmed:  window.__P.txt('vm-prot-gmed'),
      capEoa:   window.__P.txt('vm-prot-eoa'),
      capDvi:   window.__P.txt('vm-prot-dvi'),
      capThp:   window.__P.txt('vm-prot-thp'),
      capPpm:   window.__P.txt('vm-prot-ppm'),
      capVis:   window.__P.vis('bloque-prot-vm-res'),
      claseThp: window.__P.txt('em-clase-thp'),
      claseCont:window.__P.txt('em-clase-cont'),
      clasePlan:window.__P.txt('em-clase-plan'),
      claseGm:  window.__P.txt('em-clase-gm'),
      thpRow:   window.__P.txt('em-thp-row'),
      contRow:  window.__P.txt('em-cont-row'),
      planRow:  window.__P.txt('em-plan-row'),
      gmRow:    window.__P.txt('em-gmedio-row'),
      sevIntegr:window.__P.txt('em-sev-integrada'),
      em_grado: window.__P.val('em_grado'),
      P: (function(){ try { var p = vmProtEOA();
            return { esProt:p.esProt, eoa:p.eoa, dvi:p.dvi, eoaI:p.eoaI, obstr:p.obstr,
                     porEoa:p.porEoa, porDvi:p.porDvi, ppm:p.ppm,
                     vmax:p.vmax, gmed:p.gmed, thp:p.thp,
                     porVmax:p.porVmax, porGmed:p.porGmed, porThp:p.porThp,
                     vmaxFuera:p.vmaxFuera, gmedFuera:p.gmedFuera, thpFuera:p.thpFuera } }
          catch(e) { return 'EXC: ' + e.message } })()
    } },

  /* ══ W2-B: LA PROTESIS AORTICA ══════════════════════════════════════════════════════════ */
  fotoProtVA() {
    return {
      eaSev:    window.__P.txt('ea-sev'),
      eaSevLbl: window.__P.txt('ea-det-sev-lbl'),
      eaDetSev: window.__P.txt('ea-det-sev'),
      eaNota:   window.__P.txt('ea-det-sev-nota'),
      avaIdx:   window.__P.txt('ava-idx'),
      detAvai:  window.__P.txt('ea-det-avai'),
      ppmAo:    window.__P.txt('ea-prot-ppm'),
      ppmVis:   window.__P.vis('ea-prot-ppm-row'),
      ava_cont: window.__P.val('ava_cont'),
      ea_grado: window.__P.val('ea_grado'),
      V: (function(){ try { var p = eaProtVeredicto();
            return p === null ? null : { via:p.via, nivel:p.nivel, ppm:p.ppm, avai:p.avai,
                                         ppmCortes:p.ppmCortes, imc:p.imc } }
          catch(e) { return 'EXC: ' + e.message } })()
    } },

  /* Las filas de corte de las referencias de la IM: el jet/AI publica el regimen que le toca. */
  cortesIM() {
    var o = {};
    document.querySelectorAll('[data-corte]').forEach(function(el){
      o[el.getAttribute('data-corte')] = (el.textContent || '').trim() });
    o.imGrado = window.__P.val('im_grado');
    o.jetRatio = window.__P.txt('im-jet-ratio');
    return o },

  /* ══ W2-B: LAS TARJETAS «i» ══════════════════════════════════════════════════════════════
     Se mide el MECANISMO (abre, cierra por los cuatro caminos) y el TEXTO con sus acentos. */
  globos() {
    var bs = Array.from(document.querySelectorAll('[data-vinfo]'));
    return { n: bs.length,
      claves: bs.map(function(b){ return b.getAttribute('data-vinfo') }),
      tags:   Array.from(new Set(bs.map(function(b){ return b.tagName.toLowerCase() }))),
      conTitle: bs.filter(function(b){ return !!b.getAttribute('title') }).length,
      conAyuda: bs.filter(function(b){ return (b.getAttribute('onclick')||'').indexOf('abrirAyudaEco') >= 0 }).length,
      registro: (function(){ try { return Object.keys(VINFO) } catch(e) { return 'EXC' } })() } },
  tarjeta() {
    var c = document.getElementById('vinfo-card');
    if (!c) return { err: 'NO EXISTE vinfo-card' };
    var cs = getComputedStyle(c), r = c.getBoundingClientRect();
    var bloques = {};
    c.querySelectorAll('[data-vinfo-b]').forEach(function(d){
      bloques[d.getAttribute('data-vinfo-b')] = (d.textContent||'').trim() });
    return { abierta: cs.display !== 'none',
             tit: (c.querySelector('#vinfo-tit')||{}).textContent || '',
             bloques: bloques, nBloques: Object.keys(bloques).length,
             rect: { x:Math.round(r.left), y:Math.round(r.top),
                     w:Math.round(r.width), h:Math.round(r.height) },
             dentro: r.width > 0 && r.left >= 0 && r.top >= 0 &&
                     r.right <= innerWidth + 1 && r.bottom <= innerHeight + 1,
             texto: (c.textContent||'').trim() } },
  botonGlobo(clave) {
    var b = document.querySelector('[data-vinfo="' + clave + '"]');
    if (!b) return { err: 'NO EXISTE globo ' + clave };
    if (!b.id) b.id = '__g_' + clave;
    var r = b.getBoundingClientRect();
    return { id: b.id, tag: b.tagName.toLowerCase(), w: Math.round(r.width), h: Math.round(r.height),
             exp: b.getAttribute('aria-expanded'), title: b.getAttribute('title') } },

  /* La franja de hallazgos del PPT y el token del Laboratorio, para los controles. */
  ppt() { try { return (typeof _pptHallazgos === 'function') ? _pptHallazgos() : 'SIN FN' }
    catch(e) { return 'EXC' } },

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
   ARITMETICA CERRADA, la misma de TC-315: O TSVI 20 mm -> area pi*(20/20)^2 = 3,1416 cm2; con
   VTI TSVI 20 el volumen sistolico es 62,83 ml. AEO = 62,83 / VTI mitral. Peso 80 y talla 180
   dan BSA 2,00 EXACTA, asi que el indexado es el AEO sobre dos. Los numeros se eligen para que
   cada corte se pueda verificar a mano y para que cada escena caiga de un lado del borde. */
const ESC = {
  eoaSig:    { d:20, tsvi:20, prmv:70 },   // AEO 0,90 -> significativa ; DVI 3,50
  eoaPos:    { d:20, tsvi:20, prmv:40 },   // AEO 1,57 -> POSIBLE (banda nueva W1-6) ; DVI 2,00
  eoaNorm:   { d:30, tsvi:20, prmv:30 },   // AEO 4,71 -> normal ; DVI 1,50
  /* Los DOS bordes exactos, con el DVI deliberadamente NORMAL en los dos para que lo que se mida
     sea el tramo del AEO y no el peor de los dos votantes. Se puede elegir porque AEO = area/DVI:
     fijado el AEO, el DVI queda determinado por el area, o sea por el O del TSVI. */
  eoaBorde1: { d:16, tsvi:20, prmv:40.2 },  // AEO 1,00 exacto -> POSIBLE (significativa es `<1`)
  eoaBorde2: { d:20, tsvi:20, prmv:31.4 }   // AEO 2,00 exacto -> NORMAL (normal es `>=2`)
};

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

  /* Escena base. `morf` elige la morfologia MITRAL; peso 80 / talla 180 dan BSA 2,00 exacta. */
  async function base(morf) {
    await ev('window.__P.limpiar()');
    await J('window.__P.abrirTodo()');
    await J('window.__P.set("peso", 80)');
    await J('window.__P.set("talla", 180)');
    await J('window.__P.set("edad", 62)');
    await J('window.__P.set("vm_morf", ' + JSON.stringify(morf || 'Normal') + ')');
    await J('window.__P.abrirTodo()');
    return 1;
  }
  /* Los tres insumos de la continuidad, por sus campos ORIGINALES —los mismos que lee `calcEM`—
     y con TECLAS REALES, no con `set`: es el gesto del medico y el que la sonda tiene que medir. */
  /* ⚠️ `diam_tsvi` E `itv_tsvi` NO SON CAMPOS TIPEABLES ACA: viven en un `.fg` con
     `display:none` desde que la medicion se mudo a AI/VI, asi que la sonda ABORTA nombrandolos
     —lo hizo, y estuvo bien—. Las puertas VISIBLES del bloque de Estenosis Mitral son
     `em_dtsvi` y `em_vtitsvi`, que son ademas las que `calcEM` y `vmProtEOA` PREFIEREN
     (`v('em_dtsvi') || v('diam_tsvi')`). Es la leccion que este repo ya tiene escrita para
     `im_dtsvi`, `im_itv_tsvi` y la tanda de los cortes de la aortica. */
  async function cont(o) {
    if (o.d != null)    await tipear('em_dtsvi',   String(o.d));
    if (o.tsvi != null) await tipear('em_vtitsvi', String(o.tsvi));
    if (o.prmv != null) await tipear('em_vtimit',  String(o.prmv));
    return 1;
  }

  /* ══ GRUPO mitral — Tabla 11 en la CAPSULA y el cuadro que ya no gradua una protesis ══════ */
  if (corre('mitral')) {
    paso('mitral');
    const g = { t11: {}, eoa: {}, cuadro: {} };

    /* (a) LOS TRES PARAMETROS DIRECTOS, cada uno por sus TRES tramos y por sus DOS bordes.
       Se cargan de a UNO sobre la escena protesica, con los otros dos vacios, para que lo que
       se mide sea el corte de ESE parametro y no el peor de tres. */
    const TRAMOS = [
      ['vmax', 'em_vmax',   ['1.8', '1.9', '2.4', '2.5', '3.0']],
      ['gmed', 'em_gmedio', ['4', '5', '6', '10', '11']],
      ['thp',  'thp',       ['120', '129', '130', '200', '201']]
    ];
    for (const [k, campo, vals] of TRAMOS) {
      g.t11[k] = {};
      for (const vv of vals) {
        await base('Prótesis mecánica');
        await tipear(campo, vv);
        await pausa(120);
        const f = await J('window.__P.fotoProtVM()');
        g.t11[k][vv] = { por: f.P['por' + k.charAt(0).toUpperCase() + k.slice(1)],
                         fila: k === 'vmax' ? f.capVmax : (k === 'gmed' ? f.capGmed : f.capThp),
                         leido: f.P[k] };
      }
    }
    /* CONTROL NEGATIVO 1: con morfologia NATIVA la capsula no existe y los tres quedan mudos. */
    await base('Normal');
    await tipear('em_gmedio', '12');
    await tipear('thp', '250');
    await pausa(120);
    g.nativaConMismosDatos = await J('window.__P.fotoProtVM()');
    /* CONTROL NEGATIVO 2: fuera de banda NO clasifica —`thp` en segundos, `em_vmax` en cm/s—. */
    await base('Prótesis mecánica');
    await tipear('thp', '0.12');
    await tipear('em_vmax', '250');
    await pausa(120);
    g.fueraDeBanda = await J('window.__P.fotoProtVM()');

    /* (b) EL AEO Y SUS TRES TRAMOS (W1-6), con los dos bordes exactos. */
    for (const k of Object.keys(ESC)) {
      await base('Prótesis mecánica');
      await cont(ESC[k]);
      await pausa(150);
      const f = await J('window.__P.fotoProtVM()');
      g.eoa[k] = { eoa: f.P.eoa, porEoa: f.P.porEoa, dvi: f.P.dvi, porDvi: f.P.porDvi,
                   obstr: f.P.obstr, fila: f.capEoa, ppm: f.P.ppm, eoaI: f.P.eoaI };
    }

    /* (c) EL CUADRO DE REFERENCIAS (W1-3 y W1-8): el MISMO estudio en nativa y en las DOS
       protesis. Lo que se compara es que las cuatro clases dejen de rotular con el corte nativo
       y que los VALORES de las cuatro filas no se muevan —marcar sin borrar—. */
    for (const m of ['Normal', 'Prótesis biológica', 'Prótesis mecánica']) {
      await base(m);
      await tipear('thp', '160');
      await tipear('avm_plan', '1.2');
      await tipear('em_gmedio', '12');
      await cont({ d:20, tsvi:20, prmv:40 });
      await pausa(180);
      const f = await J('window.__P.fotoProtVM()');
      g.cuadro[m] = { claseThp: f.claseThp, claseCont: f.claseCont, clasePlan: f.clasePlan,
                      claseGm: f.claseGm, thpRow: f.thpRow, contRow: f.contRow,
                      planRow: f.planRow, gmRow: f.gmRow, sevIntegr: f.sevIntegr,
                      em_grado: f.em_grado, capThp: f.capThp, capGmed: f.capGmed,
                      capEoa: f.capEoa, inf: await J('window.__P.informe("estandar")') };
    }
    out.grupos.mitral = g;
  }

  out.dialogos = dialogos;
  out.avisoFin = await J('window.__P.despejar()');
  out.md5Fin = await md5(rutaViva);
  console.log(JSON.stringify(out, null, 1));
  try { cdp.close(); } catch (e) {}
  try { srv.close(); } catch (e) {}
  process.exit(0);
}

main().catch((e) => { console.error('[_probe_w2b] ' + (e && e.stack || e)); process.exit(1); });
