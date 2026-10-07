#!/usr/bin/env node
/**
 * _probe_ettsvd.mjs — sonda A/B de SOLO LECTURA para la TARJETA DE LA TRICUSPIDE (tanda 2026-10-07).
 *
 * Mide el espejo bidireccional del Diam. y el VTI del TSVD, el area valvular desde las dos
 * puertas, los cuatro textos sobrantes, el Tab de la estenosis y la maquetacion.
 * No muta index.html: comprueba su md5 al principio y al final.
 *
 *   node scripts/_probe_ettsvd.mjs --file /tmp/index.HEAD.html > /tmp/ts.HEAD.json
 *   node scripts/_probe_ettsvd.mjs                             > /tmp/ts.NEW.json
 *
 * Infraestructura (servidor + Chrome + CDP + SONDA) calcada de scripts/_probe_tricusp.mjs.
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
/* Un `--file` absoluto (la copia de HEAD en /tmp) se sirve por un alias y el resto de los
   recursos sigue saliendo del repo: así la copia vieja ve los mismos scripts que la viva y la
   única variable del A/B es el HTML. */
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-ettsvd-'));
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
   ⚠️ CUERPO DE TEMPLATE LITERAL: ni un acento grave adentro, tampoco en los comentarios.
   Tampoco un dolar-llave, que el template literal interpolaria. */
const SONDA = `
window.__errs = window.__errs || [];
window.addEventListener('error', function(e){ window.__errs.push(String(e.message)) });

window.__P = {
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  tag(id) { var e = document.getElementById(id); return e ? e.tagName : null },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  pill(valv, tipo) { try { return (typeof pillOn === 'function') ? pillOn(valv, tipo) : 'SIN pillOn' }
    catch(e) { return 'EXC' } },
  listo() {
    return { listo: typeof calcET === 'function' && typeof generarInforme === 'function' &&
                    typeof _labExcelRow === 'function' && typeof RECALC_MODULOS === 'function',
             etTsvdSync: typeof etTsvdSync === 'function',
             pares: (typeof ET_TSVD_PARES !== 'undefined') ? JSON.stringify(ET_TSVD_PARES) : null } },

  /* DENOMINADOR. Lo que esta en display:none no tiene geometria: una sonda sobre la app cerrada
     da cero y parece impecable. Se abre la pestania Valvulas, los cuatro acordeones, y ADEMAS se
     prende la pastilla de la estenosis tricuspidea, porque los campos de la lesion viven dentro
     de su caja y en el celular arrancan plegados. */
  denominador() {
    try { showTab('valvulas'); } catch(e) {}
    var toks = ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'];
    toks.forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && s.style.display === 'none') { try { toggleEteSeccion(tok); } catch(e) {} }
    });
    var vis = function(id){ var e = document.getElementById(id);
      return !!e && getComputedStyle(e).display !== 'none' };
    /* Los SEIS campos de la estenosis tienen que tener geometria de verdad. */
    var seis = ['et_gmedio','et_thp','et_avt','et_vti_diast','et_tsvd_diam','et_vti_tsvd'];
    var conGeo = seis.filter(function(id){ var e = document.getElementById(id);
      if (!e) return false; var r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 });
    return { tab: vis('tab-valvulas'),
             secciones: toks.filter(function(t){ return vis('ete-seccion-' + t) }).length,
             camposConGeometria: conGeo.length, cuales: conGeo,
             ok: vis('tab-valvulas') && conGeo.length === 6 } },

  /* El denominador de VD/AD: los dos DUENOS tienen que tener geometria cuando se mide esa puerta. */
  denominadorVD() {
    try { showTab('vd'); } catch(e) {}
    var dos = ['tsvd_diametro','vti_tsvd'];
    var conGeo = dos.filter(function(id){ var e = document.getElementById(id);
      if (!e) return false; var r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 });
    return { camposConGeometria: conGeo.length, cuales: conGeo, ok: conGeo.length === 2 } },

  limpiar() {
    try { limpiarCampos(true); } catch(e) {}
    window.esqSevManual = {}; window._sevCalcAlFijar = {};
    window._itGradoCalc = null; window._imGradoCalc = null; window._iaGradoCalc = null;
    ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){
        try { localStorage.removeItem('valv-pill-' + t + '-' + v); } catch(e){}
        try { if (window.__P.pill(v,t) === true) toggleValvPill(v,t); } catch(e){}
      });
    });
    return 1 },

  /* Tipear DE VERDAD: valor + los dos eventos, que es lo que hace un teclado. */
  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value } },

  /* Poner el valor SIN eventos, que es como repueblan las cinco rutas de restauracion. */
  poner(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    return { id: id, leido: e.value } },

  campos() {
    var c = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      c[el.id] = el.value; });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      c[el.id + '__chk'] = el.checked ? '1' : '0'; });
    return c },

  excel() {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    var campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return; } catch(e){}
      campos[el.id] = el.value; });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      campos[el.id + '__chk'] = el.checked ? '1' : '0'; });
    try { return _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-07', campos: campos }); }
    catch(e) { return 'EXC: ' + e.message; } },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  /* LOS CUATRO CAMPOS DEL ESPEJO Y EL AREA, que es lo que esta tanda toca. Mas los lectores que
     el prompt pide que NO cambien: RVP de Abbas, Qp/Qs del ETE y los espejos read-only. */
  foto() {
    return {
      duenoDiam:   window.__P.val('tsvd_diametro'),
      duenoVti:    window.__P.val('vti_tsvd'),
      espejoDiam:  window.__P.val('et_tsvd_diam'),
      espejoVti:   window.__P.val('et_vti_tsvd'),
      etVtiDiast:  window.__P.val('et_vti_diast'),
      area:        window.__P.val('et_avt'),
      areaVis:     window.__P.vis('et_avt'),
      etSev:       window.__P.txt('et-sev'),
      etGrado:     window.__P.val('et_grado'),
      pillEsten:   window.__P.pill('tricuspide','esten'),
      /* Los lectores de los dos duenos, que tienen que dar lo mismo por las dos puertas. */
      rvp:         window.__P.txt('hemo-rvp'),
      qpqs:        window.__P.txt('ete-shunt-qpqs'),
      qpqsInterp:  window.__P.txt('ete-shunt-qpqs-interp'),
      roTsvd:      window.__P.val('ete_shunt_tsvd_ro'),
      roVtiTsvd:   window.__P.val('ete_shunt_vtitsvd_ro') } },

  /* LOS CUATRO TEXTOS SOBRANTES, buscados por su literal en el HTML de la tarjeta entera. Se
     mide la PRESENCIA, no la ausencia de un id: los cuatro eran spans sin id. */
  textos() {
    /* ⚠️ SE LEE textContent Y NO innerHTML, Y ESTO FUE UN FALSO POSITIVO MEDIDO. innerHTML incluye
       los COMENTARIOS del codigo, y el commit que borra un texto suele citarlo en el comentario que
       explica que se borro: la primera version de esta sonda daba «el texto sigue ahi» leyendo el
       comentario que documenta su borrado. textContent ve lo que ve el medico. */
    var caja = document.getElementById('ete-seccion-valv-tricuspide');
    var h = caja ? (caja.textContent || '') : '';
    var morf = document.getElementById('vt_morf');
    var hMorf = morf && morf.parentNode ? (morf.parentNode.textContent || '') : '';
    return {
      thp190:      h.indexOf('190 ms sugiere') > -1,
      continuidad: h.indexOf('Continuidad: area del TSVD') > -1 || h.indexOf('Continuidad: área del TSVD') > -1,
      flujoLargo:  h.indexOf('Flujo anter') > -1,
      flujoCorto:  h.indexOf('No es el VTI IT.') > -1,
      funcional:   hMorf.indexOf('causa m') > -1 && hMorf.indexOf('frecuente de insuficiencia') > -1,
      /* El rotulo del area y los dos rotulos nuevos. */
      rotuloArea:  (function(){ var e = document.getElementById('et_avt');
        var l = e && e.parentNode ? e.parentNode.querySelector('label') : null;
        return l ? l.textContent.trim() : null })(),
      rotuloDiam:  (function(){ var e = document.getElementById('et_tsvd_diam');
        var l = e && e.parentNode ? e.parentNode.querySelector('label') : null;
        return l ? l.textContent.trim().replace(/\\s+/g,' ') : null })(),
      rotuloVti:   (function(){ var e = document.getElementById('et_vti_tsvd');
        var l = e && e.parentNode ? e.parentNode.querySelector('label') : null;
        return l ? l.textContent.trim().replace(/\\s+/g,' ') : null })(),
      rotuloDuenoDiam: (function(){ var e = document.getElementById('tsvd_diametro');
        var l = e && e.parentNode ? e.parentNode.querySelector('label') : null;
        return l ? l.textContent.trim().replace(/\\s+/g,' ') : null })(),
      rotuloDuenoVti: (function(){ var e = document.getElementById('vti_tsvd');
        var l = e && e.parentNode ? e.parentNode.querySelector('label') : null;
        return l ? l.textContent.trim().replace(/\\s+/g,' ') : null })() } },

  /* EL TAB DE LA ESTENOSIS, en el orden REAL del documento y filtrando lo que no recibe foco.
     Un readonly con tabindex -1 no entra; un readonly sin esa marca SI entra en Chrome. */
  tabEsten() {
    var caja = document.getElementById('campos-esten-tricuspide');
    if (!caja) return null;
    var foco = caja.querySelectorAll('input, select, textarea, button, [tabindex]');
    var out = [];
    Array.prototype.forEach.call(foco, function(el){
      if (el.disabled) return;
      if (el.tabIndex < 0) return;
      if (el.type === 'hidden') return;
      var r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return;
      out.push(el.id || ('(' + el.tagName.toLowerCase() + ')'));
    });
    return out },

  /* Desborde horizontal real, medido sobre la tarjeta y sobre el documento. */
  desborde() {
    var d = document.documentElement;
    var caja = document.getElementById('caja-esten-tricuspide');
    var r = caja ? caja.getBoundingClientRect() : null;
    return { docScroll: d.scrollWidth, docClient: d.clientWidth,
             barra: d.scrollWidth > d.clientWidth + 1,
             cajaAncho: r ? Math.round(r.width) : null,
             cajaDerecha: r ? Math.round(r.right) : null,
             cajaDesborda: r ? (r.right > d.clientWidth + 1) : null } }
};
1`;

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

  // Calentamiento explícito: la app define funciones tarde y una sonda apurada mide una app a medio armar.
  for (let i = 0; i < 60; i++) {
    try { await ev(SONDA); const l = await ev('JSON.stringify(window.__P.listo())');
      if (JSON.parse(l).listo) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  const listo = await J('JSON.stringify(window.__P.listo())');
  const consola = await ev(`(function(){ return (window.__errs || []).slice(0,20) })()`);

  /* ══ EL MISMO PACIENTE POR LAS DOS PUERTAS ══════════════════════════════════════════════════
     Diam. TSVD 26 mm · VTI TSVD 14 cm · VTI diastolico 90 cm.
     Area = PI*(26/20)^2*14/90 = 0,83 cm2, o sea <= 1: significativa por el tercer criterio.
     Las dos escenas describen el MISMO paciente y tienen que dar una foto identica; lo unico que
     cambia es en que pestania se tipeo. */
  const puerta = async (nombre, cuales) => {
    const r = await J(`(function(){
      window.__P.limpiar();
      var den = window.__P.denominador();
      var denVD = window.__P.denominadorVD();
      window.__P.denominador();
      var sets = [];
      sets.push(window.__P.set('et_vti_diast', 90));
      ${cuales}
      var f = window.__P.foto();
      /* ⚠️ EL TAB Y LOS TEXTOS SE MIDEN ANTES DE generarInforme, Y EL ORDEN IMPORTA: generar el
         informe cambia de pestania, asi que tab-valvulas queda oculto, los campos pierden
         geometria y tabEsten devolvia [] — un «el Tab esta vacio» que era de la sonda y no de la
         app. Se mide con la tarjeta a la vista, que es cuando el Tab existe. */
      var tab = window.__P.tabEsten();
      var textos = window.__P.textos();
      var est = window.__P.informe('estandar');
      return JSON.stringify({ den: den, denVD: denVD, sets: sets, foto: f,
        campos: window.__P.campos(), xls: window.__P.excel(),
        inf: est.inf, suma: est.suma, textos: textos, tab: tab });
    })()`);
    r.nombre = nombre;
    return r;
  };

  const porTarjeta = await puerta('tipeado en la TARJETA de Valvulas', `
    sets.push(window.__P.set('et_tsvd_diam', 26));
    sets.push(window.__P.set('et_vti_tsvd', 14));`);

  const porVDAD = await puerta('tipeado en VD / AD', `
    window.__P.denominadorVD();
    sets.push(window.__P.set('tsvd_diametro', 26));
    sets.push(window.__P.set('vti_tsvd', 14));
    window.__P.denominador();`);

  /* ══ BORRADO EN LOS DOS SENTIDOS ════════════════════════════════════════════════════════════ */
  const borrados = await J(`(function(){
    var out = {};
    /* Borrar desde la TARJETA borra el dueno de VD/AD. */
    window.__P.limpiar(); window.__P.denominador();
    window.__P.set('et_vti_diast', 90);
    window.__P.set('et_tsvd_diam', 26); window.__P.set('et_vti_tsvd', 14);
    out.cargado_desde_tarjeta = window.__P.foto();
    window.__P.set('et_tsvd_diam', '');
    out.tras_borrar_diam_en_tarjeta = window.__P.foto();
    window.__P.set('et_vti_tsvd', '');
    out.tras_borrar_vti_en_tarjeta = window.__P.foto();

    /* Borrar desde VD/AD borra el espejo de la tarjeta. */
    window.__P.limpiar(); window.__P.denominador();
    window.__P.set('et_vti_diast', 90);
    window.__P.set('tsvd_diametro', 26); window.__P.set('vti_tsvd', 14);
    out.cargado_desde_vdad = window.__P.foto();
    window.__P.set('tsvd_diametro', '');
    out.tras_borrar_diam_en_vdad = window.__P.foto();
    window.__P.set('vti_tsvd', '');
    out.tras_borrar_vti_en_vdad = window.__P.foto();
    return JSON.stringify(out);
  })()`);

  /* ══ EL AREA SE ACTUALIZA AL TIPEAR, NO SOLO AL CARGAR ══════════════════════════════════════
     Se corrige el diametro desde CADA puerta y se mira si el area se mueve en el acto. */
  const actualiza = await J(`(function(){
    var out = { desdeTarjeta: [], desdeVDAD: [] };
    window.__P.limpiar(); window.__P.denominador();
    window.__P.set('et_vti_diast', 90); window.__P.set('et_vti_tsvd', 14);
    [20, 26, 30, 34].forEach(function(d){
      window.__P.set('et_tsvd_diam', d);
      out.desdeTarjeta.push({ diam: d, dueno: window.__P.val('tsvd_diametro'),
        area: window.__P.val('et_avt'), sev: window.__P.txt('et-sev') }); });

    window.__P.limpiar(); window.__P.denominador();
    window.__P.set('et_vti_diast', 90); window.__P.set('vti_tsvd', 14);
    [20, 26, 30, 34].forEach(function(d){
      window.__P.denominadorVD();
      window.__P.set('tsvd_diametro', d);
      window.__P.denominador();
      out.desdeVDAD.push({ diam: d, espejo: window.__P.val('et_tsvd_diam'),
        area: window.__P.val('et_avt'), sev: window.__P.txt('et-sev') }); });
    return JSON.stringify(out);
  })()`);

  /* ══ RESTAURACION MUDA: los duenos poblados SIN eventos, como hacen las cinco rutas ═════════
     Es lo que cubre la entrada en RECALC_MODULOS. Sin ella la tarjeta abre con los dos campos
     vacios sobre un area ya calculada. */
  const restaura = await J(`(function(){
    var out = {};
    window.__P.limpiar(); window.__P.denominador();
    window.__P.poner('et_vti_diast', 90);
    window.__P.poner('tsvd_diametro', 26);
    window.__P.poner('vti_tsvd', 14);
    out.antes = window.__P.foto();
    /* ⚠️ EL INVOCADOR ES _recalcModulos, NO RECALC_MODULOS. La segunda solo DEVUELVE la lista de
       nombres; llamarla no corre nada, y la primera version de esta sonda reporto «la
       restauracion no repuebla los espejos» sobre un no-op propio. _recalcModulos hace el
       window[fn]() sin argumentos, que es justo como etTsvdSync espera ser llamada. */
    out.invocador = (typeof _recalcModulos === 'function') ? 'ok' : 'FALTA _recalcModulos';
    try { _recalcModulos('probe'); } catch(e) { out.err = e.message; }
    out.despues = window.__P.foto();
    return JSON.stringify(out);
  })()`);

  /* ══ NUEVO ESTUDIO limpia los cuatro ════════════════════════════════════════════════════════ */
  const nuevo = await J(`(function(){
    var out = {};
    window.__P.limpiar(); window.__P.denominador();
    window.__P.set('et_vti_diast', 90);
    window.__P.set('et_tsvd_diam', 26); window.__P.set('et_vti_tsvd', 14);
    out.antes = window.__P.foto();
    try { limpiarCampos(true); } catch(e) { out.err = e.message; }
    out.despues = window.__P.foto();
    return JSON.stringify(out);
  })()`);

  /* ══ SIN BUCLE: un evento despachado a mano sobre los cuatro campos ═════════════════════════
     Asignar .value por codigo no dispara oninput, asi que el espejo no se re-dispara solo; la
     guarda esta para esto, que es lo que hacen los arneses. Si hubiera bucle, esto cuelga. */
  const bucle = await J(`(function(){
    var out = { pasos: [] };
    window.__P.limpiar(); window.__P.denominador();
    var t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0;
    /* ⚠️ GUARDA DE NODO AUSENTE, y no es defensiva de adorno: en HEAD los dos campos nuevos NO
       existen, y sin esto la sonda tiraba y el A/B se quedaba con un solo lado. Una sonda que no
       corre en los dos arboles no mide nada. El id ausente se DECLARA, no se saltea en silencio. */
    ['et_tsvd_diam','tsvd_diametro','et_vti_tsvd','vti_tsvd'].forEach(function(id){
      var e = document.getElementById(id);
      if (!e) { out.pasos.push({ id: id, valor: null, nota: 'NO EXISTE en este arbol' }); return; }
      for (var i = 0; i < 25; i++) { e.dispatchEvent(new Event('input', { bubbles: true })); }
      out.pasos.push({ id: id, valor: window.__P.val(id) });
    });
    window.__P.set('et_tsvd_diam', 26);
    var dn = document.getElementById('tsvd_diametro');
    if (dn) { for (var k = 0; k < 25; k++) { dn.dispatchEvent(new Event('input', { bubbles: true })); } }
    out.trasRebote = window.__P.foto();
    var t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : 0;
    out.ms = Math.round(t1 - t0);
    return JSON.stringify(out);
  })()`);

  /* ══ CONTROL NEGATIVO ═══════════════════════════════════════════════════════════════════════
     (1) Un campo que NO es del par no espeja nada: el VTI diastolico vive solo en la tarjeta.
     (2) Tipear en los dos campos nuevos no mueve un solo campo de las otras tres valvulas. */
  const negativo = await J(`(function(){
    var out = {};
    window.__P.limpiar(); window.__P.denominador();
    window.__P.set('et_vti_diast', 77);
    out.vtiDiastNoEspeja = { etVtiDiast: window.__P.val('et_vti_diast'),
      duenoDiam: window.__P.val('tsvd_duenoDiam'),
      tsvd: window.__P.val('tsvd_diametro'), vti: window.__P.val('vti_tsvd'),
      espejoDiam: window.__P.val('et_tsvd_diam'), espejoVti: window.__P.val('et_vti_tsvd') };

    window.__P.limpiar(); window.__P.denominador();
    var base = window.__P.campos();
    window.__P.set('et_tsvd_diam', 26); window.__P.set('et_vti_tsvd', 14);
    var tras = window.__P.campos();
    var movidos = Object.keys(tras).filter(function(k){ return String(base[k]) !== String(tras[k]) });
    out.camposMovidos = movidos.sort();
    /* Los que NO son de la tricuspide: si aparece uno, el espejo se desbordo de su valvula. */
    out.ajenos = movidos.filter(function(k){
      return !/^et_|^tsvd_diametro$|^vti_tsvd$|^it_/.test(k) });
    return JSON.stringify(out);
  })()`);

  /* ══ MAQUETACION a 360 / 390 / 1200 px ══════════════════════════════════════════════════════ */
  const layout = {};
  for (const w of [360, 390, 1200]) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 768 }, sessionId);
    await new Promise((r) => setTimeout(r, 350));
    layout[w] = await J(`(function(){
      window.__P.limpiar(); window.__P.denominador();
      window.__P.set('et_vti_diast', 90);
      window.__P.set('et_tsvd_diam', 26); window.__P.set('et_vti_tsvd', 14);
      /* En el celular los campos arrancan plegados: los abre su flecha, no la pastilla. */
      var caja = document.getElementById('caja-esten-tricuspide');
      if (caja && !caja.classList.contains('valv-datos-abierto')) {
        try { valvDatosTog('caja-esten-tricuspide') } catch(e) {} }
      return JSON.stringify({ desborde: window.__P.desborde(), tab: window.__P.tabEsten(),
        den: window.__P.denominador(), area: window.__P.val('et_avt') });
    })()`);
  }
  await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);

  const despues = await md5(join(RAIZ, 'index.html'));

  console.log(JSON.stringify({
    archivo: FARG, md5_index_antes: antes, md5_index_despues: despues,
    index_intacto: antes === despues,
    listo, consola, porTarjeta, porVDAD, borrados, actualiza, restaura, nuevo, bucle, negativo, layout,
  }, null, 2));

  /* ⚠️ Cerrar el servidor Y salir a mano: `cdp.close()` + `proc.kill()` no alcanzan —el servidor
     HTTP sigue escuchando y el event loop vivo—, se juntan zombies reteniendo su Chrome y un A/B
     encadenado nunca llega al segundo lado. Parece lentitud, es un cuelgue. */
  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
