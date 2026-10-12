#!/usr/bin/env node
/**
 * _probe_emevid.mjs — sonda A/B de SOLO LECTURA para la SECCION DE ESTENOSIS MITRAL del panel
 * «Evidencia segun guias». Infraestructura calcada de _probe_emsignif.mjs (teclas reales, cierre
 * del arbol de Chrome por grupo, reloj sobre ev(), cierre del aviso legal y su denominador).
 * ORIGINAL:
 * «significativa» / «no significativa, con gradiente elevado» (ASE 2023, Tabla 1, p. 8).
 *
 * Mide (1) la tabla de BORDES —AVm 1,49 / 1,50 / 1,51 y gradiente 4,9 / 5,0 / 9,9 / 10,0—;
 * (2) las COMBINACIONES de fuentes marcadas y destildadas; (3) la IM significativa que retira el
 * criterio del gradiente completo; (4) el round-trip de un estudio guardado SIN las claves del
 * selector, que es la escena que protege el papel firmado; y (5) las cuatro superficies
 * —informe en los tres estilos, EN SUMA, Excel (434 al escribir esta sonda; 435 desde el 2026-10-12) y campos guardados— con el control negativo
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
  /* ⚠️ `abrirTodo` SOLO NO ALCANZA DESPUES DE `limpiarCampos`, Y LA PRIMERA CORRIDA ABORTO AHI.
     `limpiarCampos(true)` cierra el cajon de la estenosis mitral —le saca la clase
     `valv-datos-abierto` a `caja-esten-mitral`— y el `display:block` en linea de
     `bloque-em-detalle` no alcanza: el CSS del cajon cerrado gana. Es la MISMA trampa que
     CLAUDE.md documenta para la pasada de celular, y la salida es la misma: abrir con
     `valvDatosTog`, que es el gesto del medico, y VERIFICAR la geometria justo antes de medir.
     Se reporta en vez de abortar la corrida entera: un denominador roto es un dato, no un motivo
     para quedarse sin ninguna escena. */
  const base = async () => {
    await ev(`(function(){ window.__P.limpiar(); return 1 })()`);
    let d = JSON.parse(await ev(`JSON.stringify(window.__P.abrirTodo())`));
    if (!d.ok) d = JSON.parse(await ev(`JSON.stringify(window.__P.abrirMovil())`));
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
  /* ══ HELPERS DE ESTA SONDA — el panel de Evidencia, sección de estenosis mitral ════════════
     ⚠️ SE MIDE EL OBJETO **Y** EL HTML PINTADO. El objeto que devuelve `_indEM()` dice qué decidió
     la función; el HTML dice qué ve el médico. Medir sólo el objeto deja pasar un bloque que la
     sección arma y el renderizador no pinta —que es el defecto que `_indBloqueHTML` puede tener y
     el objeto no delata—, y medir sólo el HTML no distingue «no aplica» de «no se evaluó». */
  const secEM = async () => JSON.parse(await ev(`(function(){
    try {
      var pre = { grado:_indS('em_grado'), plan:_indLeer('avm_plan','avm_plan'),
                  US:_indUmb('AVM_SEVERA_MAX'), prot:(_indFn('vmEsProtesis')?vmEsProtesis():'SIN'),
                  catFn:!!_indFn('emCategoria'),
                  cat:(function(){ try { return emCategoria().clave } catch(e){ return 'EXC' } })() };
      var s = window._indEM();
      if (s === null) return JSON.stringify({ seccion: null, pre: pre });
      return JSON.stringify({
        filas: (s.filas||[]).map(function(f){ return { lbl:f.lbl, val:f.val, marca:f.marca,
                 nota:String(f.nota||'').slice(0,160), refs:f.refs||null, ctrl: f.ctrl ? f.ctrl.clave : null } }),
        aviso: s.aviso || '',
        bloques: (s.bloques||[]).map(function(b){ return { tit:b.tit, plegado:!!b.plegado, aviso:b.aviso||'',
                 lineas:(b.lineas||[]).map(function(l){ return typeof l==='string'?l:l.txt }),
                 grupos:(b.grupos||[]).map(function(g){ return { tit:g.tit,
                   filas:(g.filas||[]).map(function(f){ return { lbl:f.lbl, val:f.val, marca:f.marca,
                     nota:String(f.nota||'').slice(0,160), ctrl: f.ctrl ? f.ctrl.clave : null } }) } }),
                 nota:b.nota||'' } }),
        recom: s.recom ? { tipo:s.recom.tipo, tit:s.recom.tit, clase:s.recom.clase||null,
                 txt:String(s.recom.txt||'').slice(0,200), faltan:s.recom.faltan||null } : null,
        guia: s.guia ? s.guia.txt : null,
        notasN: (s.notas||[]).filter(Boolean).length
      });
    } catch (e) { return JSON.stringify({ EXC: e.message }) }
  })()`));
  /* El HTML de la sección, ya dentro del panel abierto, con el conteo de corchetes de SU sección. */
  const htmlEM = async () => JSON.parse(await ev(`(function(){
    try {
      if (typeof indicAbrir === 'function') indicAbrir();
      var ds = Array.from(document.querySelectorAll('#indic-cuerpo > details'));
      var d = ds.find(function(x){ var s = x.querySelector('summary');
        return s && /Estenosis mitral/.test(s.textContent||'') });
      if (!d) return JSON.stringify({ tarjeta: null, cuantas: ds.length,
        titulos: ds.map(function(x){ return (x.querySelector('summary')||{}).textContent }) });
      var subs = Array.from(d.querySelectorAll('details')).map(function(x){
        var s = x.querySelector('summary');
        return { sum: s ? (s.textContent||'').trim() : null, open: x.hasAttribute('open') } });
      return JSON.stringify({
        tarjeta: true, abierta: d.hasAttribute('open'),
        subdetalles: subs,
        tablas: d.querySelectorAll('table').length,
        corchetes: d.querySelectorAll('[data-ind-ref]').length,
        malos: (d.innerHTML.match(/\\[(referencia no registrada|cita fuera de sección|cita sin numerar|criterio no cargado|clave repetida)/g)||[]).length,
        botones: d.querySelectorAll('[data-ind-clin]').length,
        texto: (d.textContent||'').replace(/\\s+/g,' ').trim()
      });
    } catch (e) { return JSON.stringify({ EXC: e.message }) }
  })()`));
  /* Las OTRAS catorce secciones, byte por byte: el control negativo de que el cambio no se fue de
     la mitral. Se devuelve un hash por sección y no el HTML entero, que son cientos de KB. */
  const otrasSecs = async () => JSON.parse(await ev(`(function(){
    try {
      if (typeof indicAbrir === 'function') indicAbrir();
      var o = {};
      Array.from(document.querySelectorAll('#indic-cuerpo > details')).forEach(function(d){
        var s = d.querySelector('summary'); var t = s ? (s.textContent||'').trim() : '?';
        if (/Estenosis mitral/.test(t)) return;
        var h = 0, str = d.innerHTML;
        for (var i=0;i<str.length;i++) { h = ((h<<5)-h+str.charCodeAt(i))|0 }
        o[t] = { len: str.length, hash: h };
      });
      return JSON.stringify(o);
    } catch (e) { return JSON.stringify({ EXC: e.message }) }
  })()`));
  const resp = async (clave, val) => ev(`(function(){
    try { window._indClin[${JSON.stringify(clave)}] = ${JSON.stringify(val)}; return 1 }
    catch(e) { return 'EXC: ' + e.message } })()`);
  const morf = async (m) => ev(`window.__P.set('vm_morf', ${JSON.stringify(m)})`);

  /* ══ 1 — LAS CINCO ETIOLOGÍAS ═════════════════════════════════════════════════════════════
     Un AVm de 1,2 por planimetría en las cinco morfologías. El denominador es que la escena
     TENGA sección: sin ella, contar bloques da cero y parece que el gateo funciona. */
  const E1 = {};
  if (hacer('etio')) {
    for (const m of ['Normal', 'Reumática', 'Calcificada', 'Mixomatosa / Barlow', 'Prótesis mecánica']) {
      await base();
      await tipear('avm_plan', '1.2');
      await morf(m);
      await ev(`(function(){ try{ calcEM() }catch(e){} return 1 })()`);
      await pausa(150);
      E1[m] = { morfLeida: await ev(`window.__P.val('vm_morf')`),
                sec: await secEM(), html: await htmlEM(), cat: (await cat()).clave };
    }
    out.ETIOLOGIAS = E1;
  }

  /* ══ 2 — LA CATEGORÍA DEL BLOQUE 1 CONTRA EL INFORME ══════════════════════════════════════
     Las seis escenas del punto 2 de la verificación. Se comparan TRES cosas del mismo paciente:
     la clave de `emCategoria()`, la fila «Categoría» del panel y la frase de la mitral en el
     informe narrativo. Si las tres no cuentan la misma historia, el panel y el papel divergen —
     que es justo el defecto que esta tanda cierra. */
  const E2 = {};
  if (hacer('categoria')) {
    const escenas = [
      ['avm 1,2',                       { avm_plan:'1.2' },                 null, null],
      ['gradiente 7',                   { em_gmedio:'7' },                  null, null],
      ['gradiente 12 con area normal',  { avm_plan:'4.0', em_gmedio:'12' }, null, null],
      ['metodo destildado',             { avm_plan:'1.2' },                 null, 'em_pdf_plan'],
      ['IAo severa',                    { avm_plan:'1.2', thp:'180' },      { ia_grado:'4' }, null],
      ['IM significativa + gradiente 7',{ em_gmedio:'7' },                  { im_grado:'4' }, null],
    ];
    for (const [nombre, campos, grados, destildarId] of escenas) {
      await base();
      await morf('Reumática');
      for (const [id, val] of Object.entries(campos)) await tipear(id, val);
      const gr = {};
      for (const [id, g] of Object.entries(grados || {}))
        gr[id] = await ev(`window.__P.setGrado(${JSON.stringify(id)}, ${JSON.stringify(g)})`);
      await ev(`(function(){ try{ calcEM() }catch(e){} return 1 })()`);
      await pausa(140);
      const des = destildarId ? await destildar(destildarId) : null;
      if (destildarId) { await ev(`(function(){ try{ calcEM() }catch(e){} return 1 })()`); await pausa(140); }
      const c = await cat();
      const s = await secEM();
      const filaCat = (s.filas || []).find((f) => /^Categoría/.test(f.lbl)) || null;
      const t = await textos();
      E2[nombre] = { grados: gr, destildado: des, catClave: c.clave, catGm: c.gm,
        catFuentes: c.fuentes, catSev: c.sev,
        panelCategoria: filaCat ? { val: filaCat.val, marca: filaCat.marca } : 'NO HAY FILA',
        panelGradiente: ((s.filas || []).find((f) => /^Gradiente medio/.test(f.lbl)) || {}).val || null,
        /* ⚠️ LAS FILAS DEL ÁREA SE MIDEN AQUÍ, y es lo que destapó que un método destildado
           publicaba ✅ al lado de una categoría «Sin categoría». */
        panelAVm: (s.filas || []).filter((f) => /^AVm/.test(f.lbl))
          .map((f) => ({ lbl: f.lbl, val: f.val, marca: f.marca, nota: f.nota.slice(0, 80) })),
        informeVM: t.narrativo ? t.narrativo.vm : null, suma: t.suma,
        /* DENOMINADOR: sin sección no hay fila, y «NO HAY FILA» se leería como un defecto. */
        hubieraSeccion: s.seccion === null ? 'SECCION AUSENTE' : 'ok' };
    }
    out.CATEGORIA = E2;
  }

  /* ══ 3 — NINGUNA / UNA / VARIAS ═══════════════════════════════════════════════════════════
     Las tres respuestas del control clínico sobre el MISMO paciente reumático sintomático, con
     score favorable, y el estado de las cinco filas de la tabla en cada una. Más un control
     negativo: sin contestar los síntomas, ninguna fila puede decir «no aplica». */
  const E3 = {};
  if (hacer('clin')) {
    const prep = async () => {
      await base();
      await morf('Reumática');
      await tipear('avm_plan', '1.2');
      await ev(`(function(){ try{ calcEM() }catch(e){} return 1 })()`);
      await resp('em.trombo', 'no'); await resp('em.score', 'fav');
      await resp('em.cormier', 'no');
      for (const k of ['em.calcsev','em.fusion','em.aovt','em.cad']) await resp(k, 'no');
      await pausa(80);
    };
    const filasRec = (s) => {
      const b = (s.bloques || [])[0];
      const g = b ? (b.grupos || []).find((x) => /Filas de la tabla/.test(x.tit || '')) : null;
      return g ? g.filas.map((f) => ({ lbl: f.lbl.slice(0, 44), clase: f.val, marca: f.marca, nota: f.nota })) : 'NO HAY GRUPO';
    };
    for (const [nombre, clin, rq] of [['Ninguna','fav','no_alto'], ['Una','una','no_alto'],
                                      ['Varias','desfav','no_alto'], ['Varias + riesgo alto','desfav','alto']]) {
      await prep(); await resp('em.sintomas','si'); await resp('em.clin', clin); await resp('em.riesgo', rq);
      const s = await secEM();
      E3[nombre] = { filas: filasRec(s), ctrlOpciones: await ev(`(function(){
        try { if (typeof indicAbrir === 'function') indicAbrir();
          var bs = Array.from(document.querySelectorAll('[data-ind-clin="em.clin"]'));
          return bs.map(function(b){ return (b.textContent||'').trim() }).join(' | ') }
        catch(e) { return 'EXC' } })()`) };
    }
    /* CONTROL NEGATIVO: sin síntomas contestados, ninguna fila afirma ni niega. */
    await prep(); await resp('em.clin','fav'); await resp('em.riesgo','no_alto');
    E3['CONTROL NEGATIVO sin sintomas'] = { filas: filasRec(await secEM()) };
    out.CLINICA = E3;
  }

  /* ══ 3b — UNA CONTRAINDICACIÓN PRESENTE CORTA LAS CINCO FILAS ══════════════════════════════
     Con AVm 1,6 (la primera contraindicación de la Tabla 8) y el MISMO paciente que arriba
     publicaba «Aplica». CONTROL NEGATIVO al lado: AVm 1,2 con todo lo demás igual vuelve a
     aplicar — sin eso, «ninguna fila aplica» no distingue el corte de una sonda que dice no a
     todo. */
  const E3b = {};
  if (hacer('contra')) {
    /* ⚠️ LA CONTRAINDICACIÓN NO PUEDE SER UN AVm DE 1,6 SOLO, Y LA PRIMERA VERSIÓN DE ESTA ESCENA
       MIDIÓ LA NADA: con 1,6 como única medición la SECCIÓN NO SE PINTA —no hay área bajo el
       corte, ni grado, ni categoría— así que el bloque venía vacío y la sonda leyó «NO HAY» letra
       por letra como si fueran filas. Se usa un paciente que SÍ abre la sección (AVm 1,2) con una
       contraindicación medida al lado: la insuficiencia mitral moderada, que es «más que leve». */
    for (const [nombre, grado] of [['IM moderada — contraindicada', '2'], ['CONTROL NEGATIVO IM leve', '1']]) {
      await base(); await morf('Reumática');
      await tipear('avm_plan', '1.2');
      await ev('window.__P.setGrado("im_grado", ' + JSON.stringify(grado) + ')');
      await ev(`(function(){ try{ calcEM() }catch(e){} return 1 })()`);
      await resp('em.trombo','no'); await resp('em.score','fav'); await resp('em.cormier','no');
      for (const k of ['em.calcsev','em.fusion','em.aovt','em.cad']) await resp(k, 'no');
      await resp('em.sintomas','si'); await resp('em.clin','fav'); await resp('em.riesgo','no_alto');
      const s = await secEM();
      const b = (s.bloques || [])[0] || {};
      const gc = (b.grupos || []).find((g) => /Contraindicaciones/.test(g.tit || ''));
      const gr = (b.grupos || []).find((g) => /Filas de la tabla/.test(g.tit || ''));
      E3b[nombre] = { aviso: b.aviso || '',
        contras: gc ? gc.filas.map((f) => f.marca + ' ' + f.lbl.slice(0, 40)) : 'NO HAY',
        filas: gr ? gr.filas.map((f) => f.marca + ' ' + f.val + ' · ' + f.nota.slice(0, 20)) : 'NO HAY' };
    }
    out.CONTRA = E3b;
  }

  /* ══ 4 — EL ALCANCE: QUE NADA SE FUE DE LA MITRAL ═════════════════════════════════════════
     Las otras catorce secciones del panel con un paciente que las dispara, hash por hash. */
  const E4 = {};
  if (hacer('alcance')) {
    /* ⚠️ EL DENOMINADOR ERA DE **UNA** SECCIÓN Y NO PROBABA NADA. La primera versión sembraba
       sólo el área mitral y la aórtica, así que de las quince secciones se pintaban dos —la de la
       mitral, que es la que cambia, y una ajena— y la comparación de hashes decía «idénticas»
       sobre un conjunto de uno. Se siembra un paciente que dispara todo lo que se puede disparar
       por campo, y se CUENTA cuántas secciones ajenas quedaron: si son pocas, la conclusión vale
       poco y hay que verlo. */
    await base();
    await morf('Reumática');
    for (const [id, val] of [['avm_plan','1.2'], ['ava_cont','0.8'], ['vmax_ao','4.5'],
                             ['peso','80'], ['talla','175'], ['edad','68'],
                             ['fevi','55'], ['dsfvi','44'], ['ddfvi','58'],
                             ['ai_vol','70'], ['ai_diam','58'],
                             ['ia_vc','7'], ['ia_eroa','35'], ['ia_volr','65'],
                             ['psap_calc','60'], ['vmax_it','3.2'],
                             ['it_vc','8'], ['it_eroa','45'],
                             ['vmax_p','4.2'], ['grad_p','70'],
                             ['ao_asc','46'], ['ao_raiz','44'],
                             ['grad_medio_mch','55'], ['siv','18']]) {
      const r = await tipear(id, val); if (!r.ok) E4['NO ENTRO ' + id] = r;
    }
    for (const [id, g] of [['im_grado','4'], ['ia_grado','4'], ['it_grado','4'], ['ep_grado','severa']])
      E4['grado_' + id] = await ev(`window.__P.setGrado(${JSON.stringify(id)}, ${JSON.stringify(g)})`);
    await ev(`(function(){ ['calcEM','calcAo','calcIM_ESC','calcIA_ESC','calcIT_ESC','calcPSAP','calcEP']
      .forEach(function(f){ try { if (typeof window[f] === 'function') window[f]() } catch(e){} }); return 1 })()`);
    await pausa(300);
    E4.otras = await otrasSecs();
    E4.cuantasAjenas = Object.keys(E4.otras).length;
    E4.asserts = JSON.parse(await ev(`JSON.stringify({
      em: (function(){ try { return _emAssertUmbrales() } catch(e) { return ['EXC: '+e.message] } })(),
      origen: (function(){ try { return _indOrigenAssert() } catch(e) { return ['EXC: '+e.message] } })()
    })`));
    out.ALCANCE = E4;
  }

  /* ══ 5 — MAQUETACIÓN A 1200, 390 Y 360 px ═════════════════════════════════════════════════
     ⚠️ EL ANCHO SE EMULA Y LUEGO SE REPINTA EL PANEL, en ese orden: el HTML se arma una vez y la
     maquetación es CSS, pero `indicAbrir` mide al abrir. Y el denominador es el ancho de la
     tarjeta: una medición de desborde sobre una tarjeta de ancho 0 da «no desborda». */
  const E5 = {};
  if (hacer('movil')) {
    for (const [m, ancho] of [['Reumática', 1200], ['Reumática', 390], ['Reumática', 360],
                              ['Normal', 1200], ['Normal', 390], ['Normal', 360],
                              ['Calcificada', 1200], ['Calcificada', 390], ['Calcificada', 360],
                              ['Mixomatosa / Barlow', 390], ['Prótesis mecánica', 390]]) {
      await ev(`(function(){ try{ indicCerrar() }catch(e){} return 1 })()`);
      await cdp.send('Emulation.setDeviceMetricsOverride',
        { width: ancho, height: 900, deviceScaleFactor: 1, mobile: ancho < 700 }, sessionId);
      await base();
      await morf(m);
      await tipear('avm_plan', '1.2');
      await ev(`(function(){ try{ calcEM() }catch(e){} return 1 })()`);
      await pausa(180);
      await ev(`(function(){ try{ indicAbrir() }catch(e){} return 1 })()`);
      await pausa(300);
      E5[m + ' @ ' + ancho] = JSON.parse(await ev(`(function(){
        try {
          var ds = Array.from(document.querySelectorAll('#indic-cuerpo > details'));
          var d = ds.find(function(x){ var s=x.querySelector('summary');
            return s && /Estenosis mitral/.test(s.textContent||'') });
          if (!d) return JSON.stringify({ tarjeta:null, secciones:ds.length });
          var dr = d.getBoundingClientRect();
          var doc = document.documentElement;
          var peor = null;
          Array.from(d.querySelectorAll('tr,div,table')).forEach(function(n){
            var r = n.getBoundingClientRect();
            if (r.width === 0) return;
            var ex = Math.round(r.right - dr.right);
            if (peor === null || ex > peor.ex) peor = { ex: ex, w: Math.round(r.width),
              t: (n.textContent||'').replace(/\\s+/g,' ').trim().slice(0,50) };
          });
          return JSON.stringify({ tarjeta:true, cardW: Math.round(dr.width),
            docScroll: doc.scrollWidth, docClient: doc.clientWidth,
            barraH: doc.scrollWidth > doc.clientWidth + 1,
            peorDesborde: peor, bloques: d.querySelectorAll(':scope > div > div[style*="border:1px solid"], :scope > div > details[style*="border:1px solid"]').length });
        } catch (e) { return JSON.stringify({ EXC: e.message }) } })()`));
    }
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    out.MOVIL = E5;
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
