#!/usr/bin/env node
/**
 * _probe_emsignif.mjs — sonda A/B de SOLO LECTURA para la REGLA NUEVA DE LA ESTENOSIS MITRAL:
 * «significativa» / «no significativa, con gradiente elevado» (ASE 2023, Tabla 1, p. 8).
 *
 * Mide (1) la tabla de BORDES —AVm 1,49 / 1,50 / 1,51 y gradiente 4,9 / 5,0 / 9,9 / 10,0—;
 * (2) las COMBINACIONES de fuentes marcadas y destildadas; (3) la IM significativa que retira el
 * criterio del gradiente completo; (4) el round-trip de un estudio guardado SIN las claves del
 * selector, que es la escena que protege el papel firmado; y (5) las cuatro superficies
 * —informe en los tres estilos, EN SUMA, Excel 434 y campos guardados— con el control negativo
 * de las otras tres válvulas.
 *
 * No muta index.html: comprueba su md5 al principio y al final.
 *
 *   node scripts/_probe_emsignif.mjs --file /tmp/index.HEAD.html > /tmp/em.HEAD.json
 *   node scripts/_probe_emsignif.mjs                             > /tmp/em.NEW.json
 *
 * Infraestructura y SONDA calcadas de scripts/_probe_emauto.mjs (teclas reales, cierre del árbol
 * de Chrome por grupo, reloj sobre `ev()`, cierre del aviso legal y su denominador).
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

  /* DENOMINADOR. Abre la pestana de Valvulas, las cuatro tarjetas y el cajon de estenosis de la
     mitral, y CONFIRMA que los campos que esta tanda tipea tienen geometria. Una sonda sobre un
     arbol cerrado tipea en la nada, el campo queda vacio y todo sale «sin cambios». */
  abrirTodo() {
    try { showTab('valvulas') } catch(e) {}
    ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'].forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && s.style.display === 'none') { try { toggleEteSeccion(tok) } catch(e) {} }
    });
    var det = document.getElementById('bloque-em-detalle');
    if (det) det.style.display = 'block';
    return { tab: window.__P.vis('tab-valvulas'), avm_plan: window.__P.vis('avm_plan'),
             em_gmedio: window.__P.vis('em_gmedio'), em_grado: window.__P.vis('em_grado'),
             pill: window.__P.vis('pill-esten-mitral'),
             ok: window.__P.vis('avm_plan') === true && window.__P.vis('em_gmedio') === true } },

  /* Estado de partida limpio y SIN DUENO: borra las seis claves, apaga lo prendido, vacia las dos
     marcas y el Set. Sin vaciar el Set, la escena siguiente arranca con la mitral ya «de la app». */
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

  /* Solo para el escenario BASE de las otras valvulas (control negativo): no es un gesto medido. */
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
    try { return _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-08', campos: campos }) }
    catch(e) { return 'EXC: ' + e.message } },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  /* POR LINEA Y NO POR ORACION: el informe se arma con inf.push(...) y se une por salto de linea,
     asi que UNA linea es el parrafo entero de una valvula. Partido por oracion se pierden las que
     no nombran la valvula. */
  frasesVM(texto) {
    var re = /mitral|\\bVM\\b|\\bEM\\b|\\bIM\\b|AVm/i;
    return String(texto || '').split(/\\n/).map(function(s){ return s.trim() })
      .filter(function(s){ return s && re.test(s) }) },
  /* CONTROL NEGATIVO: las lineas de las OTRAS TRES valvulas y del Doppler mitral. Si una de estas
     se mueve, el cambio se fue de la mitral. */
  frasesOtras(texto) {
    var re = /a[\\u00f3o]rtic|tric[\\u00fau]sp|pulmonar|llenado|diast[\\u00f3o]lic|\\bE\\/A\\b/i;
    return String(texto || '').split(/\\n/).map(function(s){ return s.trim() })
      .filter(function(s){ return s && re.test(s) }) },
  sumaVM(suma) {
    return String(suma || '').split(/\\n+/).map(function(s){ return s.trim() })
      .filter(function(s){ return s && /\\bEM\\b|\\bIM\\b|\\bVM\\b|mitral/i.test(s) }) },

  /* LA FOTO DE LA ESTENOSIS MITRAL: boton, DUENO, clave de localStorage, grado, marca y foto. */
  fotoEM() {
    return {
      pill:   window.__P.pill('mitral','esten'),
      dueno:  (function(){ try { var s = window.VALV_ESTEN_AUTO;
                 return s ? s.has('mitral') : 'SIN SET' } catch(e) { return 'EXC' } })(),
      clave:  (function(){ try { return localStorage.getItem('valv-pill-esten-mitral') }
                 catch(e) { return 'EXC' } })(),
      em_grado: window.__P.val('em_grado'),
      manual: !!(window.esqSevManual && window.esqSevManual.em),
      fotoCalc: (function(){ try { return window._sevCalcAlFijar
                   ? (window._sevCalcAlFijar.em === undefined ? null : window._sevCalcAlFijar.em)
                   : null } catch(e) { return 'EXC' } })(),
      avm_plan: window.__P.val('avm_plan'),
      em_gmedio: window.__P.val('em_gmedio'),
      vm_morf: window.__P.val('vm_morf'),
      catClave: (function(){ try { return emCategoria().clave } catch(e) { return 'EXC' } })(),
      sevIntegrada: window.__P.txt('em-sev-integrada'),
      badge: window.__P.txt('em-thp-badge'),
      emAviso: window.__P.txt('em-manual-aviso'),
      emFundVis: window.__P.vis('em-fund'),
      sevManualEspejo: window.__P.val('sev_manual')
    } },

  /* QUIEN RECIBE EL CLIC EN ESE PUNTO. Sin esto, un clic dispachado sobre coordenadas tapadas por
     otro nodo se informa como «clic ok» y la escena mide un gesto que no ocurrio — que es
     exactamente lo que paso en la primera corrida con la pastilla de la mitral. */
  quienEsta(id, x, y) {
    var t = document.getElementById(id);
    var e = document.elementFromPoint(x, y);
    if (!e) return { enPunto: null, esElBlanco: false };
    return { enPunto: (e.id || ('<' + e.tagName.toLowerCase() + ' ' + String(e.className || '') + '>')),
             esElBlanco: !!(t && (e === t || t.contains(e) || e.contains(t))) } },

  /* Las opciones del menu ▼ de la estenosis mitral, ya pintadas, con su id para el clic real. */
  menuOpts() {
    var m = document.getElementById('sevmenu-esten-mitral'); if (!m) return null;
    return Array.from(m.querySelectorAll('button')).map(function(b, i){
      if (!b.id) b.id = '__opt_em_' + i;
      return { id: b.id, txt: (b.textContent || '').trim() } }) },

  guardados() { try { return getInformes().map(function(i){
      return { id: i.id, nombre: i.nombre } }) } catch(e) { return 'EXC: ' + e.message } },

  desborde() {
    var d = document.documentElement;
    return { scrollW: d.scrollWidth, clientW: d.clientWidth, hayBarra: d.scrollWidth > d.clientWidth + 1 } },
  desbordeDe(id) {
    var e = document.getElementById(id); if (!e) return null;
    var r = e.getBoundingClientRect(), d = document.documentElement;
    return { der: Math.round(r.right), clientW: d.clientWidth, desborda: r.right > d.clientWidth + 1,
             w: Math.round(r.width) } },

  /* Las tres casillas de «Incluir en el informe» con TODO su estado: el tilde, el 'disabled' y
     las dos banderas de «ya decidió», que son las que gobiernan la compuerta nueva del voto. */
  chks() {
    var o = {};
    ['em_pdf_thp','em_pdf_cont','em_pdf_plan'].forEach(function(id){
      var c = document.getElementById(id);
      o[id] = c ? { chk: !!c.checked, dis: !!c.disabled,
                    tocado: c.dataset.tocado || null, desdeEstudio: c.dataset.desdeEstudio || null }
                : 'NO EXISTE';
    });
    return o },
  /* La categoría COMPLETA, no sólo la clave: de 'sev'/'noSev' sale el detalle del informe y la
     marca «peor» del cuadro, y de 'noIncl' la fila «no incluido». */
  cat() {
    try { var c = emCategoria();
      return { clave: c.clave, gm: c.gm,
        fuentes: (c.fuentes||[]).map(function(f){ return f.fuente + ' ' + f.avm }),
        sev:     (c.sev||[]).map(function(f){ return f.fuente + ' ' + f.avm }),
        noSev:   (c.noSev||[]).map(function(f){ return f.fuente + ' ' + f.avm }),
        revisar: (c.revisar||[]).map(function(f){ return f.fuente + ' ' + f.avm }),
        noIncl:  (c.noIncl||[]).map(function(f){ return f.fuente + ' ' + f.avm }),
        /* Los tres áreas crudas y las DOS compuertas que esta tanda NO toca. Sin esto, una fuente
           que no aparece en ninguna lista es indistinguible de «no se midió»: la continuidad de
           la primera corrida no estaba ni en 'fuentes' ni en 'noIncl' y pareció un defecto de la
           compuerta nueva cuando la frenaba 'emContValido', que es la de siempre. */
        crudo: { avm_plan: window.__P.val('avm_plan'), avm_thp: window.__P.val('avm_thp'),
                 avm_cont: window.__P.val('avm_cont'), em_gmedio: window.__P.val('em_gmedio') },
        puertas: { thpValido: (function(){ try { return emThpValido() } catch(e){ return 'EXC' } })(),
                   contValido: (function(){ try { return emContValido() } catch(e){ return 'EXC' } })(),
                   imSignif: (function(){ try { return emImSignificativa() } catch(e){ return 'EXC' } })(),
                   contAviso: window.__P.txt('em-cont-aviso') } } }
    catch(e) { return 'EXC: ' + e.message } },
  /* Grado de IM/IAo: son 'input[type=hidden]', así que NO se pueden tipear con teclas reales
     —enfocar un campo oculto falla en silencio—. Es montaje de escena y no el gesto medido. */
  setGrado(id, g) {
    var e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = String(g);
    e.dispatchEvent(new Event('change', { bubbles: true }));
    try { calcEM() } catch(x) {}
    return e.value },
  /* ══ EL VIAJE DEL DATO DE UN ESTUDIO GUARDADO, SIN PASAR POR EL STORE ══════════════════
     Se arma el blob con el MISMO barrido que usa 'guardarInforme' y se repone por las MISMAS
     funciones que usa cada camino de vuelta. Es el método de scripts/_probe_guardados.mjs y no
     una comodidad: 'guardarInforme' toma un callback, el store va troceado
     ('getInformesChunked'/'guardarInformesSeguro') y mi primera versión peleando con eso tiró
     'Cannot read properties of undefined' y midió CUATRO escenas sobre un estudio que no existía
     —las cuatro dieron 'nada' y parecía el defecto que vine a buscar—. Lo que importa medir es
     si la compuerta del voto se abre con el estado que cada camino deja en las casillas.
     'sin': el blob de un estudio anterior al selector —sin las tres claves—.
     'no':  el blob de un estudio donde el médico DIJO QUE NO (clave en '0' y '__tocado' en '1').  */
  blob(quitarClaves) {
    var campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return } catch(e){}
      if (el.type === 'checkbox' || el.type === 'radio') return;
      campos[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      campos[el.id + '__chk'] = el.checked ? '1' : '0';
      if (el.dataset.tocado) campos[el.id + '__tocado'] = '1' });
    if (quitarClaves) ['em_pdf_thp','em_pdf_cont','em_pdf_plan'].forEach(function(k){
      delete campos[k + '__chk']; delete campos[k + '__tocado'] });
    return campos },
  /* Camino ABRIR / EDITAR: escribe los valores y llama a '_restaurarChkInclusion', que es LA
     función real de ese camino —la que hace 'cb.checked = false' cuando la clave falta—. */
  reponerAbriendo(campos) {
    try {
      limpiarCampos(true);
      if (typeof _migrarCamposLegacy === 'function') _migrarCamposLegacy(campos);
      Object.keys(campos).forEach(function(k){
        if (/__chk$|__tocado$/.test(k)) return;
        var el = document.getElementById(k); if (el) el.value = campos[k] });
      if (typeof _restaurarChkInclusion === 'function') _restaurarChkInclusion(campos);
      try { calcEM() } catch(e) {}
      return 'ok' }
    catch(e) { return 'EXC: ' + e.message } },
  /* Camino REIMPRIMIR: las DOS cosas que esa ventana le hace a estas casillas, copiadas de
     '_pdfDeInformeGuardadoArmar' — 'el.checked = (c[id+"__chk"] === "1")' para todo checkbox con
     id, y el borrado de las dos banderas— y SIN llamar a calcEM, que es lo que esa ventana
     tampoco hace. No se dispara jsPDF: depende del CDN y no cambia quién vota. */
  reponerReimprimiendo(campos) {
    try {
      limpiarCampos(true);
      var c = (typeof _migrarCamposLegacy === 'function') ? _migrarCamposLegacy(campos) : campos;
      document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
        if (el.type === 'checkbox' || el.type === 'radio') {
          el.checked = (c[el.id + '__chk'] === '1'); return }
        if (el.tagName === 'SELECT') { if (c[el.id] !== undefined) el.value = c[el.id];
          else el.selectedIndex = 0; return }
        el.value = (c[el.id] !== undefined ? c[el.id] : '') });
      ['em_pdf_thp','em_pdf_cont','em_pdf_plan'].forEach(function(k){
        var cb = document.getElementById(k); if (!cb) return;
        if (c[k + '__tocado'] === '1') cb.dataset.tocado = '1'; else delete cb.dataset.tocado;
        delete cb.dataset.desdeEstudio });
      return 'ok' }
    catch(e) { return 'EXC: ' + e.message } },
  /* Lo que el PPT y el PDF escriben del grado. El PPT lee el TEXTO de la opcion via _pptSel, asi
     que cambiar la etiqueta de la opcion le cambia la franja de hallazgos; se MIDE, no se deduce. */
  grado3() {
    var sel = document.getElementById('em_grado');
    return {
      valorGuardado: sel ? sel.value : 'NO EXISTE',
      textoOpcion: (sel && sel.selectedIndex >= 0) ? sel.options[sel.selectedIndex].text : '(selectedIndex -1)',
      pptSel: (function(){ try { return (typeof _pptSel === 'function') ? _pptSel('em_grado') : 'SIN _pptSel' }
                 catch(e){ return 'EXC' } })(),
      pdfFila: (function(){ try { var g = (typeof sv === 'function') ? sv('em_grado') : null;
                 if (!g || g === 'sin') return null;
                 return (typeof emGradoVis === 'function') ? emGradoVis(g)
                      : (g.charAt(0).toUpperCase() + g.slice(1)) } catch(e){ return 'EXC' } })(),
      pastilla: window.__P.txt('pill-esten-mitral'),
      avisoManual: window.__P.txt('em-manual-aviso')
    } },
  /* El cuadro de referencias: las cuatro clasificaciones, su clase CSS, y el desborde de cada
     fila contra el ancho del viewport. El desborde se MIDE y no se deduce: «significativa
     (<=1,5 cm2) . peor» es largo y la fila es un flex con space-between. */
  /* ⚠️ EN EL CELULAR EL BLOQUE NO SE ABRE CON UN display INLINE. A menos de 768 px el CSS usa
     '.valv-datos-abierto > #bloque-em-detalle' con !important, y un estilo en linea pierde contra
     el !important de la hoja: 'abrirTodo' dejaba 'avm_plan' y 'em_gmedio' SIN geometria, el
     denominador abortaba, y antes de tener ese denominador la pasada de maquetacion habria medido
     desborde CERO sobre un cajon cerrado y parecido impecable. Se abre con 'valvDatosTog', que es
     el mismo gesto que el boton 'Datos ▾' del medico. */
  /* Rect crudo de una cadena de nodos, para no especular sobre quien no tiene geometria. */
  rects(ids) {
    var o = {};
    ids.forEach(function(id){
      var e = document.getElementById(id);
      if (!e) { o[id] = 'NO EXISTE'; return }
      var r = e.getBoundingClientRect(), cs = getComputedStyle(e);
      o[id] = { w: Math.round(r.width), h: Math.round(r.height), top: Math.round(r.top),
                disp: cs.display, vis: cs.visibility, ov: cs.overflow,
                inline: e.style.display || '' };
    });
    var cb = document.querySelector('#bloque-em-detalle .calc-box');
    if (cb) { var r2 = cb.getBoundingClientRect();
      o['.calc-box'] = { w: Math.round(r2.width), h: Math.round(r2.height),
                         disp: getComputedStyle(cb).display } }
    return o },
  abrirMovil() {
    try { showTab('valvulas') } catch(e) {}
    var sec = document.getElementById('ete-seccion-valv-mitral');
    if (sec && sec.style.display === 'none') { try { toggleEteSeccion('valv-mitral') } catch(e){} }
    for (var i = 0; i < 2; i++) {
      if (window.__P.vis('avm_plan') === true && window.__P.vis('em_gmedio') === true) break;
      try { valvDatosTog('caja-esten-mitral') } catch(e) {}
      var det = document.getElementById('bloque-em-detalle');
      if (det) det.style.display = 'block';
    }
    return { avm_plan: window.__P.vis('avm_plan'), em_gmedio: window.__P.vis('em_gmedio'),
             caja: (document.getElementById('caja-esten-mitral')||{}).className || '',
             ok: window.__P.vis('avm_plan') === true && window.__P.vis('em_gmedio') === true } },
  cuadro() {
    var ids = ['em-clase-gm','em-clase-thp','em-clase-cont','em-clase-plan'];
    var o = { filas: {}, valores: {}, desborde: {} };
    ids.forEach(function(id){
      var e = document.getElementById(id);
      o.filas[id] = e ? { txt: (e.textContent||'').trim(), cls: e.className } : 'NO EXISTE';
      if (e) { var r = e.getBoundingClientRect(), d = document.documentElement;
        o.desborde[id] = { der: Math.round(r.right), clientW: d.clientWidth,
                           desborda: r.right > d.clientWidth + 1, w: Math.round(r.width) }; }
    });
    ['em-gmedio-row','em-thp-row','em-cont-row','em-plan-row'].forEach(function(id){
      o.valores[id] = window.__P.txt(id) });
    o.encabezado = (function(){
      var sp = document.getElementById('em-sev-integrada');
      if (!sp) return 'NO EXISTE';
      var fila = sp.closest('.calc-row');
      var lbl = fila ? fila.querySelector('.calc-lbl') : null;
      return lbl ? (lbl.textContent||'').trim() : 'SIN label' })();
    o.categoria = window.__P.txt('em-sev-integrada');
    o.cajaDesborda = window.__P.desbordeDe('bloque-em-detalle');
    return o },
  listo() {
    var faltan = ['generarInforme','pillOn','toggleValvPill','showTab','limpiarCampos','calcEM',
                  'emCategoria','emGradoAuto','setEstiloInforme','valvMorfDe','valvAutoPrenderEsten',
                  'nuevoEstudio','guardarInforme','editarInforme','getInformes','_labExcelRow']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (faltan.length) return { listo:false, faltan:faltan };
    if (!document.getElementById('informe_texto')) return { listo:false, por:'sin informe_texto' };
    if (!document.getElementById('avm_plan')) return { listo:false, por:'sin avm_plan' };
    return { listo:true, tieneApagarAuto: typeof window._emApagarAuto === 'function' } }
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
  /* ⚠️ UN `alert`/`confirm` NATIVO BLOQUEA `Runtime.evaluate` Y LA SONDA PARECE COLGADA. Con el
     dominio Page habilitado, CDP avisa del dialogo y hay que CONTESTARLO; sin habilitarlo, Chrome
     lo muestra y el renderer se detiene. Se descartan y se CUENTAN, porque un dialogo inesperado
     en medio de una escena es un hallazgo, no ruido. */
  await cdp.send('Page.enable', {}, sessionId);
  const dialogos = [];
  cdp.alDialogo = (d) => { dialogos.push(d);
    cdp.send('Page.handleJavaScriptDialog', { accept: true }, sessionId).catch(() => {}); };
  const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
  await pausa(2200);

  /* ⚠️ `ev()` SIN RELOJ CUELGA PARA SIEMPRE, Y ESTA SONDA LO HIZO DOS VECES (2026-10-08). Si la
     pagina navega, el target muere o Chrome se va, la promesa de `cdp.send` no se resuelve NUNCA:
     ni error ni salida, el proceso vivo y el archivo de salida vacio a los diez minutos. Es la
     trampa de los `cdp.mjs` que no salen que CLAUDE.md documenta, con otra cara. Con reloj, un
     cuelgue se convierte en un fallo que DICE en que paso ocurrio. */
  const RELOJ = 75000;
  let _paso = '(arranque)';
  const paso = (n) => { _paso = n; if (VER || process.env.EMAUTO_TRAZA) console.error('  · ' + n); };
  async function ev(expr) {
    const r = await Promise.race([
      cdp.send('Runtime.evaluate',
        { expression: expr, returnByValue: true, awaitPromise: true }, sessionId),
      new Promise((_, no) => setTimeout(() => no(new Error(
        'CDP sin respuesta en ' + (RELOJ / 1000) + ' s — paso «' + _paso + '»')), RELOJ)),
    ]);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + ' :: ' + (r.exceptionDetails.exception || {}).description);
    return r.result.value;
  }
  /* ⚠️ UN CLIC DISPACHADO NO ES UN CLIC RECIBIDO, Y LA PRIMERA CORRIDA LO INFORMO COMO OK. Las
     coordenadas del centro de la pastilla caian sobre OTRO nodo —el `.valv-lesion` que la envuelve
     y la tapa— asi que los eventos llegaban, el boton no se movia, y las escenas 4, 5 y 8 median
     «no se apaga» sobre un gesto que nunca ocurrio: el defecto correcto por la razon equivocada,
     indistinguible de un hallazgo falso. Por eso se pregunta `elementFromPoint` ANTES y, si el
     punto esta tapado, se activa con TECLA REAL (foco + Enter), que en un <button> es una
     activacion nativa y no un `.click()` sintetico. */
  /* ⚠️ SIN `revelar` RECURSIVO ACA, Y ES POR MEDICION: la version con el bucle de `revelar` se
     llamaba a si misma sobre el control que hay que abrir, y ese control podia volver a pedir otro
     —o volver a cerrar el mismo, porque es un TOGGLE— asi que la recursion no tenia tope real y la
     corrida se colgo (dos procesos a los 10 minutos, sin una sola escena escrita). Los nodos que
     esta sonda clickea ya estan a la vista: `abrirTodo` lo confirma y ABORTA si no. Si uno no tiene
     geometria, se informa y no se inventa un camino. */
  async function clicEn(id) {
    const c = await ev(`window.__P.centro(${JSON.stringify(id)})`);
    if (!c || c.err) return { via: 'NO SE PUDO', por: c ? c.err : 'no existe' };
    const q = await ev(`JSON.stringify(window.__P.quienEsta(${JSON.stringify(id)}, ${c.x}, ${c.y}))`);
    const quien = JSON.parse(q);
    if (quien.esElBlanco) {
      await cdp.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await cdp.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: c.x, y: c.y, button: 'left', clickCount: 1 }, sessionId);
      await pausa(140);
      return { via: 'mouse', punto: c, quien };
    }
    await ev(`(function(){ var e = document.getElementById(${JSON.stringify(id)}); if (e) e.focus(); return 1 })()`);
    const foco = await ev(`(document.activeElement && document.activeElement.id) || '<' + (document.activeElement ? document.activeElement.tagName.toLowerCase() : '?') + '>'`);
    await tecla('Enter', null);
    await pausa(140);
    return { via: 'tecla Enter', punto: c, quien, foco };
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
  /* ⚠️ `Space: 32` SE AGREGÓ PORQUE **ENTER NO ACTIVA UN CHECKBOX**, y eso dio un falso de los
     dos signos en la primera corrida de esta sonda: el respaldo por tecla de `clicEn` manda Enter,
     así que la escena del método destildado informó «clic: tecla Enter» y la casilla seguía
     tildada — la sonda midió «sigue votando» sobre un gesto que nunca ocurrió. En un `<button>`
     Enter es una activación nativa; en un `<input type=checkbox>` la tecla es ESPACIO. */
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

  /* ⚠️ EL AVISO LEGAL TAPA LA PAGINA ENTERA Y SE COME TODOS LOS CLICS, Y ASI LAS ESCENAS 4, 5 Y 8
     DE LA PRIMERA CORRIDA NO PROBARON NADA. `#modalAvisoEco` es un `position:fixed;inset:0` con
     `z-index:9999`: `elementFromPoint` sobre el centro de la pastilla devolvia `modalAvisoEco` y no
     la pastilla, asi que el clic de mouse llegaba al overlay —y el respaldo por tecla tampoco
     cambiaba el boton—. La sonda informaba «clic ok» y las escenas decian «NO se apaga» sobre un
     gesto que nunca ocurrio: el defecto correcto por la razon equivocada. Se cierra con su propio
     boton, como lo cierra el medico, y se COMPRUEBA que se fue antes de medir nada. */
  const avisoBtn = await ev(`(function(){
    var m = document.getElementById('modalAvisoEco');
    if (!m) return 'NO EXISTE';
    if (getComputedStyle(m).display === 'none') return 'ya cerrado';
    var b = Array.from(m.querySelectorAll('button')).find(function(x){
      return /cerrarAvisoEco/.test(x.getAttribute('onclick') || '') });
    if (!b) return 'SIN BOTON';
    if (!b.id) b.id = '__avisoOk';
    return b.id })()`);
  const avisoClic = (avisoBtn && avisoBtn.indexOf('__aviso') === 0) ? await clicEn(avisoBtn) : avisoBtn;
  await pausa(300);
  const avisoCerrado = await ev(`(function(){ var m = document.getElementById('modalAvisoEco');
    return m ? getComputedStyle(m).display : 'NO EXISTE' })()`);
  /* DENOMINADOR DURO: con el overlay puesto, ninguna escena de clic significa nada. */
  /* ⚠️ `centro()` DEVUELVE `{err}` CUANDO EL NODO NO TIENE GEOMETRÍA, y `.x` de eso es `undefined`:
     `elementFromPoint(undefined, …)` TIRA, y la sonda moría acá con un «non-finite double» antes
     de medir una sola escena. La versión de `_probe_emauto.mjs` no lo guardaba porque allá la
     pastilla ya estaba a la vista. El denominador se conserva —saber quién tapa la pastilla es lo
     que distingue «no se apaga» de «el clic no llegó»— pero ahora informa en vez de abortar. */
  const tapa = JSON.parse(await ev(`(function(){
    var c = window.__P.centro('pill-esten-mitral');
    if (!c || c.err || !isFinite(c.x) || !isFinite(c.y))
      return JSON.stringify({ sinGeometria: c || null });
    return JSON.stringify(window.__P.quienEsta('pill-esten-mitral', c.x, c.y)) })()`));
  if (avisoCerrado !== 'none' && avisoCerrado !== 'NO EXISTE') {
    throw new Error('EL AVISO LEGAL SIGUE PUESTO (' + avisoCerrado + ') — ningun clic llegaria al arbol');
  }

  const out = { archivo: FARG, listo: JSON.parse(listo), aviso: { boton: avisoBtn, clic: avisoClic,
    display: avisoCerrado, quienTapaLaPastilla: tapa } };
  const hacer = (k) => !SOLO || SOLO === k;

  /* ══ HELPERS DE ESCENA ════════════════════════════════════════════════════════════════════ */
  const foto = async () => JSON.parse(await ev(`JSON.stringify(window.__P.fotoEM())`));
  const base = async () => {
    await ev(`(function(){ window.__P.limpiar(); return 1 })()`);
    const d = JSON.parse(await ev(`JSON.stringify(window.__P.abrirTodo())`));
    if (!d.ok) throw new Error('DENOMINADOR: los campos de la mitral no tienen geometria: ' + JSON.stringify(d));
    return d;
  };
  /* El informe en los TRES estilos mas el EN SUMA, acotado a la mitral, con el control negativo
     de las otras tres valvulas y del Doppler mitral al lado. */
  const textos = async () => {
    const o = {};
    for (const est of ['conciso', 'estandar', 'narrativo']) {
      const r = JSON.parse(await ev(`JSON.stringify(window.__P.informe(${JSON.stringify(est)}))`));
      o[est] = {
        vm:    JSON.parse(await ev(`JSON.stringify(window.__P.frasesVM(${JSON.stringify(r.inf)}))`)),
        otras: JSON.parse(await ev(`JSON.stringify(window.__P.frasesOtras(${JSON.stringify(r.inf)}))`)),
      };
      if (est === 'estandar') o.suma = JSON.parse(await ev(`JSON.stringify(window.__P.sumaVM(${JSON.stringify(r.suma)}))`));
      if (est === 'estandar') o.sumaEntero = r.suma;
    }
    return o;
  };

  /* ══ HELPERS PROPIOS ══════════════════════════════════════════════════════════════════════ */
  const cat   = async () => JSON.parse(await ev(`JSON.stringify(window.__P.cat())`));
  const chks  = async () => JSON.parse(await ev(`JSON.stringify(window.__P.chks())`));
  /* Destilda con un GESTO REAL, que es el único que escribe `dataset.tocado`. Asignar `.checked`
     por código no dispara `onchange`, así que la casilla quedaría SIN resolver y la compuerta
     seguiría abierta: la escena mediría «sigue votando» sobre un gesto que no ocurrió.
     ⚠️ TRES COSAS QUE LA PRIMERA VERSIÓN NO HACÍA, Y CADA UNA PRODUJO UN FALSO:
       1. REVELAR antes de medir. El panel «Incluir en el informe» vive al final de
          `bloque-em-detalle`, y si quedó cerrado el `centro()` devuelve «nodo sin geometria»:
          `clicEn` informaba «NO SE PUDO» y la escena seguía como si nada;
       2. ESPACIO y no Enter en el respaldo por tecla (ver `VK`);
       3. EXIGIR el estado de partida. Si la casilla ya estaba destildada, el clic la TILDA y la
          escena mide lo contrario de lo que dice medir — que es lo que pasó con la continuidad.
          Ahora se informa `partidaOk` y el llamador no puede confundir los dos casos. */
  const teclaEspacio = async (id) => {
    await ev(`(function(){ var e=document.getElementById(${JSON.stringify(id)}); if(e) e.focus(); return 1 })()`);
    const foco = await ev(`(document.activeElement && document.activeElement.id) || '?'`);
    if (foco !== id) return { via: 'SIN FOCO', foco };
    await tecla('Space', null);
    await pausa(120);
    return { via: 'tecla Espacio', foco };
  };
  const destildar = async (id) => {
    await ev(`(function(){ window.__P.abrirTodo();
      var e = document.getElementById(${JSON.stringify(id)});
      if (e) e.scrollIntoView({ block:'center', inline:'center' }); return 1 })()`);
    await pausa(120);
    const antes = (await chks())[id];
    const c = await ev(`window.__P.centro(${JSON.stringify(id)})`);
    let clic;
    if (c && !c.err) {
      const q = JSON.parse(await ev(`JSON.stringify(window.__P.quienEsta(${JSON.stringify(id)}, ${c.x}, ${c.y}))`));
      if (q.esElBlanco) {
        await cdp.send('Input.dispatchMouseEvent', { type:'mousePressed',  x:c.x, y:c.y, button:'left', clickCount:1 }, sessionId);
        await cdp.send('Input.dispatchMouseEvent', { type:'mouseReleased', x:c.x, y:c.y, button:'left', clickCount:1 }, sessionId);
        await pausa(140);
        clic = { via:'mouse', punto:c, quien:q };
      } else {
        clic = { ...(await teclaEspacio(id)), tapadoPor: q.enPunto };
      }
    } else {
      clic = { ...(await teclaEspacio(id)), sinGeometria: c };
    }
    const desp = (await chks())[id];
    return { antes, clic, despues: desp,
             partidaOk: antes && antes.chk === true,
             ok: !!(antes && antes.chk === true && desp.chk === false && desp.tocado === '1') };
  };
  /* Una escena: limpia, tipea los campos con TECLAS REALES y devuelve la categoría y las casillas.
     Los grados de IM/IAo van por código (son hidden) y se declara en la salida. */
  const escena = async (campos, grados) => {
    await base();
    const tecleo = {};
    for (const [id, val] of Object.entries(campos || {})) tecleo[id] = await tipear(id, val);
    const gr = {};
    for (const [id, g] of Object.entries(grados || {}))
      gr[id] = await ev(`window.__P.setGrado(${JSON.stringify(id)}, ${JSON.stringify(g)})`);
    await ev(`(function(){ try{ calcEM() }catch(e){} return 1 })()`);
    await pausa(120);
    /* Los TRES estilos y el EN SUMA en cada escena: es la tabla del punto 3e, y sin ella el A/B
       compara claves de categoria y no el papel, que es lo que se firma. */
    return { tecleo, grados: gr, chks: await chks(), cat: await cat(), foto: await foto(),
             textos: await textos() };
  };

  /* ══ 1 — LA TABLA DE BORDES ═══════════════════════════════════════════════════════════════
     Cada borde por LOS DOS LADOS. Sin el lado que NO cruza, un corte movido de lugar pasa
     inadvertido: 1,50 y 1,49 dan los dos «significativa», y lo que prueba el borde es el 1,51. */
  if (hacer('1')) {
    const B = { avm: {}, grad: {} };
    for (const a of ['1.49', '1.5', '1.51']) {
      const r = await escena({ avm_plan: a });
      B.avm[a] = { clave: r.cat.clave, sev: r.cat.sev, noSev: r.cat.noSev,
                   em_grado: r.foto.em_grado, pill: r.foto.pill, capsula: r.foto.sevIntegrada,
                   tecleoOk: r.tecleo.avm_plan.ok };
    }
    /* El gradiente SOLO, sin ninguna fuente de área: es la única forma de ver su corte aislado. */
    for (const g of ['4.9', '5', '9.9', '10']) {
      const r = await escena({ em_gmedio: g });
      B.grad[g] = { clave: r.cat.clave, gm: r.cat.gm, em_grado: r.foto.em_grado,
                    pill: r.foto.pill, capsula: r.foto.sevIntegrada, tecleoOk: r.tecleo.em_gmedio.ok };
    }
    out.BORDES = B;
  }

  /* ══ 2 — LAS COMBINACIONES ════════════════════════════════════════════════════════════════ */
  if (hacer('2')) {
    const C = {};
    /* a · planimetría sola */
    paso('2a planSola');
    C.planSola = await escena({ avm_plan: '1.2' });
    /* b · las TRES discrepantes y las tres marcadas. THP 200 ms → 220/200 = 1,10 cm² (el peor);
       planimetría 1,8; continuidad por sus insumos. */
    const tres = async () => escena({ avm_plan: '1.8', thp: '200', em_vtimit: '150',
                                      em_dtsvi: '20', em_vtitsvi: '22' });
    paso('2b tresMarcadas');
    C.tresMarcadas = await tres();
    paso('2c soloTHP');
    /* c · sólo UNA marcada: se destildan planimetría y continuidad con clic real */
    {
      const r = await tres();
      const dP = await destildar('em_pdf_plan');
      const dC = await destildar('em_pdf_cont');
      await ev(`(function(){ try{ calcEM() }catch(e){} return 1 })()`);
      C.soloTHP = { destildar: { plan: dP, cont: dC }, chks: await chks(),
                    cat: await cat(), foto: await foto(), partida: r.cat,
                    textos: await textos() };
    }
    paso('2d sinPlan');
    /* d · NINGUNA de las destildables, y el THP no se puede destildar: queda votando él solo.
       Es la escena que prueba que la casilla del THP es la que la interfaz promete. */
    {
      const r = await escena({ avm_plan: '1.2', thp: '400' });   // 220/400 = 0,55
      const dP = await destildar('em_pdf_plan');
      await ev(`(function(){ try{ calcEM() }catch(e){} return 1 })()`);
      C.sinPlan = { destildar: dP, chks: await chks(), cat: await cat(), foto: await foto(),
                    partida: r.cat, textos: await textos() };
    }
    paso('2e unicoDestildado');
    /* e · un método CON valor y DESTILDADO, siendo el único: la categoría tiene que caerse */
    {
      await escena({ avm_plan: '1.2' });
      const d = await destildar('em_pdf_plan');
      await ev(`(function(){ try{ calcEM() }catch(e){} return 1 })()`);
      C.unicoDestildado = { destildar: d, chks: await chks(), cat: await cat(),
                            foto: await foto(), textos: await textos() };
    }
    /* f · IAo severa retira el THP (emThpValido). CONTROL: la planimetría sigue votando. */
    paso('2f iaoSevera');
    C.iaoSevera = await escena({ thp: '200', avm_plan: '1.8' }, { ia_grado: '4' });
    /* g · IM significativa con gradiente 7 → «gradiente con IM», sin área */
    paso('2g imSignifG7');
    C.imSignifG7 = await escena({ em_gmedio: '7' }, { im_grado: '2' });
    /* h · IM significativa con gradiente 12: la decisión de Maicol es que el criterio del
       gradiente se retira COMPLETO, así que NO es significativa */
    paso('2h imSignifG12');
    C.imSignifG12 = await escena({ em_gmedio: '12' }, { im_grado: '2' });
    /* i · y el ÁREA sigue votando con IM significativa: 1,2 cm² + IM moderada → significativa */
    paso('2i imSignifArea');
    C.imSignifArea = await escena({ avm_plan: '1.2', em_gmedio: '12' }, { im_grado: '2' });
    /* j · gradiente 10 con área NORMAL (4,0 cm²): significativa por gradiente, sin fuente «sev» */
    paso('2j g10AreaNormal');
    C.g10AreaNormal = await escena({ avm_plan: '4.0', em_gmedio: '10' });
    /* k, l, m · EL DATO ÚNICO Y LA BANDA MEDIA CON ÁREA. Las tres escenas que prueban el rótulo
       «por {criterio}: » por sus dos lados: con un solo dato se omite, con dos se conserva. */
    paso('2k g12SinArea');
    C.g12SinArea = await escena({ em_gmedio: '12' });
    paso('2l g7SinArea');
    C.g7SinArea  = await escena({ em_gmedio: '7' });
    paso('2m g7ConArea');
    C.g7ConArea  = await escena({ avm_plan: '2.0', em_gmedio: '7' });
    /* n · DOS ÁREAS MARCADAS BAJO EL CORTE, sin gradiente: el rótulo «por AVm» con dos datos. */
    paso('2n dosAreasBajas');
    C.dosAreasBajas = await escena({ avm_plan: '1.4', thp: '160' });

    out.COMB = C;
  }

  /* ══ 3 — EL ESTUDIO GUARDADO SIN LAS CLAVES DEL SELECTOR ══════════════════════════════════
     La escena que protege el papel firmado. Un guardado con AVm 1,2 por planimetría y SIN
     `em_pdf_plan__chk` tiene que reabrir y reimprimir con la MISMA categoría de hoy. */
  if (hacer('3')) {
    const G = {};
    await base();
    G.tecleo = await tipear('avm_plan', '1.2');
    await ev(`(function(){ try{ calcEM() }catch(e){} return 1 })()`);
    G.firmado = { cat: await cat(), chks: await chks(), textos: await textos() };
    /* DENOMINADOR DURO: si la escena de partida no afirma la estenosis, las tres de abajo dan
       «nada» por falta de dato y el A/B parecería limpio sin haber probado nada. */
    if (G.firmado.cat.clave !== 'severa')
      throw new Error('DENOMINADOR: la escena firmada no da «severa», da «'
        + G.firmado.cat.clave + '» — las reposiciones no probarían nada');

    paso('3 blobs');
    G.blobSin = JSON.parse(await ev(`JSON.stringify(window.__P.blob(true))`));
    G.blobNo  = JSON.parse(await ev(`JSON.stringify((function(){
      var c = window.__P.blob(false);
      c['em_pdf_plan__chk'] = '0'; c['em_pdf_plan__tocado'] = '1';
      return c })())`));
    G.denominador = {
      sinClave:   !('em_pdf_plan__chk' in G.blobSin),
      conArea:    G.blobSin.avm_plan,
      noDijoQueNo: G.blobNo['em_pdf_plan__chk'] + '/' + G.blobNo['em_pdf_plan__tocado'],
    };
    if (!G.denominador.sinClave || !G.denominador.conArea)
      throw new Error('DENOMINADOR: el blob legado no quedó como se pidió: '
        + JSON.stringify(G.denominador));

    /* a · ANTERIOR AL SELECTOR, camino de ABRIR */
    paso('3a abrir legado');
    const reponer = async (etiqueta, fn, blob) => {
      const r = await ev(`window.__P.${fn}(${JSON.stringify(blob)})`);
      await pausa(250);
      await ev(`(function(){ window.__P.abrirTodo(); return 1 })()`);
      G[etiqueta] = { reponer: r, avm_plan: await ev(`window.__P.val('avm_plan')`),
                      chks: await chks(), cat: await cat(), textos: await textos() };
    };
    await reponer('legadoAbriendo',      'reponerAbriendo',      G.blobSin);
    paso('3b reimprimir legado');
    await reponer('legadoReimprimiendo', 'reponerReimprimiendo', G.blobSin);
    /* b · CONTROL NEGATIVO: el mismo estudio pero con el «no» del médico persistido. Tiene que
       dejar de votar — si no, la compuerta nueva no estaría haciendo nada y los dos resultados
       de arriba saldrían iguales por la razón equivocada. */
    paso('3c el «no» del médico');
    await reponer('dijoQueNoAbriendo',      'reponerAbriendo',      G.blobNo);
    await reponer('dijoQueNoReimprimiendo', 'reponerReimprimiendo', G.blobNo);
    out.GUARDADO = G;
  }

  /* ══ 4 — LAS CUATRO SUPERFICIES Y EL CONTROL NEGATIVO ═════════════════════════════════════
     Escenas que NO cambian de categoría con la regla nueva, para el A/B contra HEAD. */
  if (hacer('4')) {
    const S = {};
    const sup = async (nombre, campos, grados) => {
      const r = await escena(campos, grados);
      S[nombre] = { cat: r.cat.clave, textos: await textos(),
                    excel: JSON.parse(await ev(`JSON.stringify((function(){ var e = window.__P.excel();
                      return (typeof e === 'string') ? { err: e }
                        : { n: Object.keys(e).length, em: e['EM grado'],
                            avm: e['AVm (cm²)'], gm: e['G. medio mitral (mmHg)'] } })())`)),
                    foto: r.foto };
    };
    await sup('planimetria12',  { avm_plan: '1.2' });
    await sup('areaNormal',     { avm_plan: '4.0' });
    await sup('vacio',          {});
    await sup('protesisMecanica', { avm_plan: '1.2' }, { });
    /* Prótesis: se elige la morfología por código (es un <select> de la tarjeta) y se confirma. */
    S.protesisMecanica.morf = await ev(`(function(){ var e=document.getElementById('vm_morf');
      if(!e) return 'NO EXISTE'; e.value='Prótesis mecánica';
      e.dispatchEvent(new Event('change',{bubbles:true})); try{calcEM()}catch(x){}
      return e.value })()`);
    await pausa(150);
    S.protesisMecanica.trasProtesis = { cat: await cat(), textos: await textos() };
    out.SUP = S;
  }

  /* ══ 5 — LA PALABRA DEL GRADO EN SUS CUATRO SUPERFICIES ═══════════════════════════════════ */
  if (hacer('5')) {
    const T = {};
    for (const [nombre, campos] of [['significativa', { avm_plan: '1.2' }],
                                    ['moderadaAMano', { avm_plan: '1.2' }]]) {
      await escena(campos);
      if (nombre === 'moderadaAMano') {
        /* El grado a mano, por el desplegable, que es lo que pone la marca `esqSevManual.em`. */
        await ev(`(function(){ var e=document.getElementById('em_grado');
          if(!e) return 0; e.value='moderada';
          e.dispatchEvent(new Event('change',{bubbles:true})); return 1 })()`);
        await pausa(200);
      }
      T[nombre] = JSON.parse(await ev(`JSON.stringify(window.__P.grado3())`));
    }
    out.GRADO = T;
  }

  /* ══ 6 — EL CUADRO DE REFERENCIAS, EN LOS TRES ANCHOS ═════════════════════════════════════ */
  if (hacer('6')) {
    const C6 = {};
    /* Escena rica: las TRES fuentes con valor, una destildada, el gradiente en la banda media.
       THP 200 -> 1,10 (el peor) · planimetría 1,8 · gradiente 7. */
    const montar = async () => {
      await base();
      for (const [id, val] of [['avm_plan', '1.8'], ['thp', '200'], ['em_gmedio', '7']])
        await tipear(id, val);
      await ev(`(function(){ try{ calcEM() }catch(e){} return 1 })()`);
      await pausa(150);
    };
    paso('6a rica');
    await montar();
    C6.rica = JSON.parse(await ev(`JSON.stringify(window.__P.cuadro())`));
    /* Con la planimetría DESTILDADA: tiene que decir «no incluido» y el «peor» moverse al THP. */
    paso('6b destildada');
    const d6 = await destildar('em_pdf_plan');
    await ev(`(function(){ try{ calcEM() }catch(e){} return 1 })()`);
    await pausa(150);
    C6.destildada = { destildar: d6.ok, cuadro: JSON.parse(await ev(`JSON.stringify(window.__P.cuadro())`)) };
    /* Gradiente en la banda ALTA, y el AVm por encima del corte. */
    paso('6c gm alto');
    await base();
    for (const [id, val] of [['avm_plan', '2.4'], ['em_gmedio', '12']]) await tipear(id, val);
    await ev(`(function(){ try{ calcEM() }catch(e){} return 1 })()`);
    await pausa(150);
    C6.gmAlto = JSON.parse(await ev(`JSON.stringify(window.__P.cuadro())`));
    /* VACÍO: los cuatro span tienen que quedar en cadena vacía y sin la clase de «peor». */
    paso('6d vacio');
    await ev(`(function(){ window.__P.limpiar(); window.__P.abrirTodo(); return 1 })()`);
    await pausa(200);
    C6.vacio = JSON.parse(await ev(`JSON.stringify(window.__P.cuadro())`));
    /* Y el borrado con TECLAS REALES, que es el gesto del punto 4e. */
    paso('6e borrado con backspace');
    await montar();
    const br = await borrarConBackspace('em_gmedio', null);
    await ev(`(function(){ try{ calcEM() }catch(e){} return 1 })()`);
    await pausa(150);
    C6.trasBorrarGm = { pasos: br.pasos.length,
                        cuadro: JSON.parse(await ev(`JSON.stringify(window.__P.cuadro())`)) };
    /* ── LOS TRES ANCHOS ── */
    paso('6f maquetacion');
    C6.anchos = {};
    for (const w of [1200, 390, 360]) {
      await cdp.send('Emulation.setDeviceMetricsOverride',
        { width: w, height: 900, deviceScaleFactor: 1, mobile: w <= 430 }, sessionId);
      await pausa(350);
      /* ⚠️ NO SE USA `base()` ACÁ: su `abrirTodo` aborta a 390 y 360 px porque el cajón de la
         estenosis lo gobierna el CSS del celular. Se limpia, se abre con el gesto del médico
         (`valvDatosTog`) y SÓLO entonces se tipea; si la geometría no aparece, se informa y no se
         mide, porque un desborde medido sobre un cajón cerrado da cero y parece impecable. */
      await ev(`(function(){ window.__P.limpiar(); return 1 })()`);
      let ab = JSON.parse(await ev(`JSON.stringify(window.__P.abrirMovil())`));
      if (!ab.ok) { C6.anchos[w] = { ABORTA: 'sin geometria al abrir', abrir: ab }; continue; }
      /* ⚠️ `thp` NO SE TIPEA ACÁ, Y ESO ERA LO QUE ROMPÍA LA PASADA DE CELULAR. Vive en la pestaña
         DOPPLER, así que `enfocar('thp')` dispara `showTab('doppler')` y al volver a Válvulas el
         `display:block` en línea de `bloque-em-detalle` y el estado del cajón se pierden: a 360 px
         el bloque quedaba en `display:none` computado, `em_gmedio` nunca recibía el tecleo y las
         cuatro filas medían `w=0`. O sea «ninguna fila desborda» sobre un cuadro que no estaba
         dibujado — el denominador vacío que este repo documenta. El AVm por THP se consigue
         escribiendo en la pestaña Doppler ANTES de emular el ancho; acá alcanza con los dos campos
         que viven en el propio bloque, que son los que llenan tres de las cuatro filas. */
      for (const [id, val] of [['avm_plan', '1.8'], ['em_gmedio', '7']]) await tipear(id, val);
      /* Se REABRE y se verifica la geometría JUSTO ANTES de medir, no al abrir: entre una cosa y
         la otra hubo tecleo, y el tecleo mueve pestañas. */
      ab = JSON.parse(await ev(`JSON.stringify(window.__P.abrirMovil())`));
      await ev(`(function(){ try{ calcEM() }catch(e){} return 1 })()`);
      await pausa(250);
      const cajaW = await ev(`(function(){ var c = document.querySelector('#bloque-em-detalle .calc-box');
        return c ? Math.round(c.getBoundingClientRect().width) : -1 })()`);
      if (!(cajaW > 0)) {
        C6.anchos[w] = { ABORTA: 'el cuadro no tiene ancho al medir', abrir: ab, cajaW,
          rects: JSON.parse(await ev(`JSON.stringify(window.__P.rects(['bloque-em-detalle','caja-esten-mitral','em_gmedio']))`)) };
        continue;
      }
      C6.anchos[w] = Object.assign({ abrir: ab, cajaW,
        rects: JSON.parse(await ev(`JSON.stringify(window.__P.rects(['bloque-em-detalle','caja-esten-mitral','vm-lesiones','em_gmedio','avm_plan','em-clase-gm','em-gmedio-row']))`)) },
        JSON.parse(await ev(`JSON.stringify(window.__P.cuadro())`)));
    }
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    out.CUADRO = C6;
  }

  out.consola = cdp.errores ? cdp.errores.slice(0, 20) : 'sin listener';
  const despues = await md5(join(RAIZ, 'index.html'));
  out.md5_antes = antes; out.md5_despues = despues; out.index_intacto = antes === despues;
  out.dialogos = dialogos;
  console.log(JSON.stringify(out, null, 2));
  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
