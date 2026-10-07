#!/usr/bin/env node
/**
 * _probe_eaauto.mjs — sonda A/B de SOLO LECTURA para
 *   (A) los calculos automaticos de la estenosis aortica (DVI, G. max, AVA, AVA indexada) y si
 *       quedan RANCIOS cuando el bloque de Valvulas no tiene su display INLINE abierto, y
 *   (B) los cuatro campos del bloque coordinados entre Valvulas y Doppler (Vmax, G. medio,
 *       VTI TSVI, VTI Ao): tipear de cada lado, borrar de cada lado.
 *   (C) la insuficiencia TRICUSPIDEA byte por byte — 96 combinaciones, control de la
 *       constante CMS_POR_MS del punto 4b.
 *
 * No muta index.html: comprueba su md5 al principio y al final.
 *
 *   node scripts/_probe_eaauto.mjs --file /tmp/index.HEAD.html > /tmp/ea.HEAD.json
 *   node scripts/_probe_eaauto.mjs                            > /tmp/ea.NEW.json
 *
 * Infraestructura (servidor + Chrome + CDP) calcada de scripts/_probe_tsvi.mjs; la
 * interceptacion de jsPDF, de scripts/_probe_pdfvcit.mjs.
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-eaa-'));
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

/* ══ Sonda inyectada ══════════════════════════════════════════════════════════════════════════
   CUERPO DE TEMPLATE LITERAL: NI UN ACENTO GRAVE adentro, tampoco en los comentarios. */
const SONDA = `
window.__E = {
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  place(id){ var e = document.getElementById(id); return e ? e.placeholder : null },
  oninput(id){ var e = document.getElementById(id); return e ? (e.getAttribute('oninput')||'') : null },
  lbl(id) { var e = document.getElementById(id);
    var l = e && e.parentNode ? e.parentNode.querySelector('label') : null;
    return l ? l.textContent.trim().replace(/\\s+/g,' ') : null },
  inline(id){ var e = document.getElementById(id); return e ? (e.style.display || '(vacio)') : null },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },
  pill(v, t) { try { return (typeof pillOn === 'function') ? pillOn(v, t) : 'SIN pillOn' }
    catch(e) { return 'EXC' } },

  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value } },

  /* Deja el estudio en blanco y las OCHO pastillas apagadas, sin memoria en localStorage. */
  limpiar() {
    try { limpiarCampos(true) } catch(e) {}
    window.esqSevManual = {}; window._sevCalcAlFijar = {};
    ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){
        try { localStorage.removeItem('valv-pill-' + t + '-' + v) } catch(e){}
        try { if (window.__E.pill(v,t) === true) toggleValvPill(v,t) } catch(e){}
      });
    });
    return 1 },

  /* Entra a Valvulas y abre la seccion de la aortica, SIN tocar la pastilla de estenosis: el
     display INLINE de bloque-ea-detalle queda en 'none', que es la compuerta de calcAo. */
  valvSinPastilla() {
    try { showTab('valvulas') } catch(e) {}
    var s = document.getElementById('ete-seccion-valv-aortica');
    if (s && s.style.display === 'none') { try { toggleEteSeccion('valv-aortica') } catch(e) {} }
    return { inline: this.inline('bloque-ea-detalle'), vis: this.vis('bloque-ea-detalle'),
             pill: this.pill('aortica','esten') } },

  /* Y la variante con la pastilla PRENDIDA, que es la que abre el display inline. */
  valvConPastilla() {
    this.valvSinPastilla();
    var p = document.getElementById('pill-esten-aortica');
    if (p && !p.classList.contains('btn-primary')) { try { toggleValvPill('aortica','esten') } catch(e){} }
    return { inline: this.inline('bloque-ea-detalle'), vis: this.vis('bloque-ea-detalle'),
             pill: this.pill('aortica','esten') } },

  /* LAS CUATRO SALIDAS AUTOMATICAS del bloque mas el grado y la pastilla. Es la tabla de 1(a). */
  salidas() {
    return {
      ea_gmax_display: this.val('ea_gmax_display'),
      ea_dvi_display:  this.val('ea_dvi_display'),
      ea_ava_display:  this.val('ea_ava_display'),
      span_gmax:  this.txt('ea-det-gmax'),  span_gmedio: this.txt('ea-det-gmedio'),
      span_ava:   this.txt('ea-det-ava'),   span_avai:   this.txt('ea-det-avai'),
      span_dvi:   this.txt('ea-det-dvi'),   span_sev:    this.txt('ea-det-sev'),
      ea_grado:   this.val('ea_grado'),     pill: this.pill('aortica','esten'),
      badge:      this.txt('ea-ava-badge'),
      /* el Doppler, que corre siempre: es el control de que el insumo SI llego */
      ava_cont: this.val('ava_cont'), dvi_val: this.txt('dvi-val'),
      ava_idx:  this.txt('ava-idx'),  vs_calc: this.val('vs_calc'),
      /* los dos lados de cada uno de los cuatro campos */
      g_vmax: this.val('vmax_ao'),   v_vmax: this.val('ea_vmax'),
      g_gmed: this.val('gmedio_ao'), v_gmed: this.val('ea_gmedio'),
      g_vtit: this.val('itv_tsvi'),  v_vtit: this.val('ea_vtitsvi'),
      g_vtia: this.val('itv_ao'),    v_vtia: this.val('ea_vtiao'),
      g_dtsvi: this.val('diam_tsvi'), v_dtsvi: this.val('ea_dtsvi'),
      aivi_dtsvi: this.val('diam_tsvi_ao')
    } },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  frasesAo(texto) {
    var t = String(texto || '');
    return t.split(/\\n+/).map(function(s){ return s.trim() })
      .filter(function(s){ return s && /a[\\u00f3o]rtic|\\bEAo\\b|\\bIAo\\b|TSVI|AVA|DVI|DI /i.test(s) }) },

  frasesIt(texto) {
    var t = String(texto || '');
    return t.split(/\\n+/).map(function(s){ return s.trim() })
      .filter(function(s){ return s && /tricusp|\\bIT\\b|\\bET\\b|PSAP|VD-AD/i.test(s) }) },

  ppt(ids) { if (typeof _pptSel !== 'function') return 'SIN _pptSel';
    var o = {}; ids.forEach(function(id){ try { o[id] = _pptSel(id) } catch(e) { o[id] = 'EXC' } });
    return o },

  /* EL PDF, GENERADO DE VERDAD. Constructor envuelto (jsPDF 2.x: metodos propios del documento). */
  pdf() {
    if (typeof window.jspdf === 'undefined') return 'SIN jsPDF';
    var orig = window.jspdf.jsPDF;
    var textos = [], bytes = null, err = null;
    function Envuelto(){
      var d = new orig(arguments[0]);
      var oText = d.text;
      d.text = function(t, x, y){
        var s = (typeof t === 'string') ? t : (Array.isArray(t) ? t.join('\\u0001') : String(t));
        var pg = 0;
        try { pg = d.internal.getCurrentPageInfo().pageNumber } catch(e) {}
        textos.push(pg + '|' + (+x).toFixed(2) + '|' + (+y).toFixed(2) + '|' + s);
        return oText.apply(d, arguments) };
      d.save = function(){ try { bytes = d.output('datauristring') } catch(e) {} return d };
      return d; }
    Envuelto.API = orig.API; Envuelto.version = orig.version;
    window.jspdf.jsPDF = Envuelto;
    try { generarPDFReal() } catch(e) { err = String(e && e.message || e) }
    finally { window.jspdf.jsPDF = orig }
    return { err: err, guardo: !!bytes, nTextos: textos.length, textos: textos } },

  /* Las lineas del PDF que hablan de la aortica o de la tricuspide. */
  pdfFiltrado(re) {
    var p = this.pdf();
    if (typeof p === 'string') return p;
    return { err: p.err, nTextos: p.nTextos,
             lineas: p.textos.filter(function(s){ return re.test(s) }) } },

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

  /* UNIDAD DECLARADA POR EL PROPIO CAMPO, para cargar el mismo PACIENTE en los dos builds. */
  unidadItCW() { var e = document.getElementById('it_vmax_cw');
    return e ? String(e.placeholder || '').trim() : null },
  cwIT(ms) { return this.unidadItCW() === 'cm/s' ? ms * 100 : ms },

  fotoIt() {
    return {
      campo_cw: this.val('it_vmax_cw'), campo_dop: this.val('vmax_it'),
      eroa: this.txt('it-eroa'), volr: this.txt('it-volr'),
      sev: this.txt('it-sev'), grado: this.val('it_grado'),
      vc: this.txt('it-vc-interp'), psap: this.val('psap_calc'),
      incong: this.txt('it-incongruencia'), pill: this.pill('tricuspide','insuf') } },

  listo() {
    var faltan = ['generarInforme','generarPDFReal','pillOn','toggleEteSeccion','showTab',
                  'limpiarCampos','calcAo','calcEADetalle','calcIT_ESC','calcHemo',
                  'syncEADesdeValvulas','sincronizarEADesdeGlobal','setEstiloInforme',
                  'toggleValvPill','valvDatosTog','editarInforme','_labExcelRow','nuevoEstudio']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (typeof window.jspdf === 'undefined') faltan.push('jspdf');
    ['ea_vmax','ea_gmedio','ea_vtitsvi','ea_vtiao','ea_dtsvi','vmax_ao','gmedio_ao',
     'itv_tsvi','itv_ao','diam_tsvi','ea_gmax_display','ea_dvi_display','ea_ava_display']
      .forEach(function(id){ if (!document.getElementById(id)) faltan.push('campo ' + id) });
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
    try { await ev(SONDA); const l = await ev('JSON.stringify(window.__E.listo())');
      if (JSON.parse(l).listo) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  const listo = await J('JSON.stringify(window.__E.listo())');
  const hacer = (n) => !SOLO || SOLO === n;
  const OUT = { archivo: FARG, listo };

  /* ── (g) Rotulos y cableado, leidos del codigo VIVO ──────────────────────────────────────── */
  if (hacer('rotulos')) OUT.rotulos = await J(`JSON.stringify((function(){
    var o = {};
    ['ea_vmax','ea_gmedio','ea_dtsvi','ea_vtitsvi','ea_vtiao','ava_plan'].forEach(function(id){
      o['VALV ' + id] = { lbl: window.__E.lbl(id), oninput: window.__E.oninput(id) } });
    ['vmax_ao','gmedio_ao','diam_tsvi','itv_tsvi','itv_ao','diam_tsvi_ao'].forEach(function(id){
      o['DOP  ' + id] = { lbl: window.__E.lbl(id), oninput: window.__E.oninput(id) } });
    o['__cms_por_ms'] = (function(){ try { return CMS_POR_MS } catch(e){ return 'EXC' } })();
    return o;
  })())`);

  /* ── 1(a) · LA TABLA DEL DEFECTO ─────────────────────────────────────────────────────────────
     Base cargada por el DOPPLER, bloque sin abrir (display inline 'none'). Despues se corrige
     UN insumo desde el Doppler y se vuelve a fotografiar: lo que no se mueve, quedo rancio.
     La variante CON pastilla es el control: ahi la compuerta de calcAo pasa y todo se refresca. */
  if (hacer('rancio')) {
    const rancio = {};
    const BASE = `
      window.__E.set('nombre','EA'); window.__E.set('peso',70); window.__E.set('talla',170);
      window.__E.set('diam_tsvi_ao', 20);
      window.__E.set('itv_tsvi', 16); window.__E.set('itv_ao', 50);
      window.__E.set('vmax_ao', 4.2); window.__E.set('gmedio_ao', 45);`;
    const CAMBIOS = [
      ['vmax_ao',   '3.0'],
      ['gmedio_ao', '28'],
      ['itv_tsvi',  '22'],
      ['itv_ao',    '60'],
      ['diam_tsvi_ao', '24'],
    ];
    for (const modo of ['SIN-pastilla', 'CON-pastilla']) {
      for (const [id, nuevo] of CAMBIOS) {
        rancio[modo + ' · ' + id + '→' + nuevo] = await J(`(function(){
          window.__E.limpiar();
          var ab = window.__E.${modo === 'SIN-pastilla' ? 'valvSinPastilla' : 'valvConPastilla'}();
          ${BASE}
          var antes = window.__E.salidas();
          window.__E.set('${id}', '${nuevo}');
          var despues = window.__E.salidas();
          var e1 = window.__E.informe('estandar');
          return JSON.stringify({ ab: ab, antes: antes, despues: despues,
            frases: window.__E.frasesAo(e1.inf), suma: e1.suma });
        })()`);
      }
    }
    OUT.rancio = rancio;
  }

  /* ── 1(a bis) · LOS TRES ESCENARIOS EN QUE LA PASTILLA QUEDA APAGADA ──────────────────────
     La primera tanda midio que con un grado graduable `valvAutoPrenderEsten` PRENDE la pastilla
     al final de calcAo, y prenderla escribe el display INLINE: la compuerta pasa y nada queda
     rancio. Los escenarios que importan son los que dejan el inline en 'none':
       (1) AVA SOLA, sin Vmax ni gradiente — la pastilla no se auto-prende (es TC-376);
       (2) el medico la APAGA a mano — el apagado es durable;
       (3) el CELULAR, donde ademas la sincronia de entrada a la pestania no corre.
     Cada escena fotografia el inline ANTES y DESPUES del tecleo: sin eso la medicion no sabe
     si el camino que midio es el que creia. */
  if (hacer('rancio2')) {
    const rancio2 = {};
    /* Cada valor nuevo es DISTINTO del de la base: un cambio que no cambia nada no puede mostrar
       si la salida se refresco (la primera version puso la Vmax en 4,2, que ya era la de la base,
       y la fila salia «quieta» sin que eso probara nada). */
    const CAMBIOS2 = [['itv_ao','60'], ['itv_tsvi','22'], ['diam_tsvi_ao','24'],
                      ['vmax_ao','3.0'], ['gmedio_ao','28']];
    const ESCENAS = [
      ['1-AVA-sola', `
        window.__E.set('diam_tsvi_ao', 20);
        window.__E.set('itv_tsvi', 16); window.__E.set('itv_ao', 50);`],
      ['2-apagada-a-mano', `
        window.__E.set('diam_tsvi_ao', 20);
        window.__E.set('itv_tsvi', 16); window.__E.set('itv_ao', 50);
        window.__E.set('vmax_ao', 4.2); window.__E.set('gmedio_ao', 45);
        if (window.__E.pill('aortica','esten') === true) { toggleValvPill('aortica','esten') }`],
    ];
    for (const [nombre, carga] of ESCENAS) {
      for (const [id, nuevo] of CAMBIOS2) {
        rancio2[nombre + ' · ' + id + '→' + nuevo] = await J(`(function(){
          window.__E.limpiar();
          window.__E.valvSinPastilla();
          window.__E.set('nombre','EA'); window.__E.set('peso',70); window.__E.set('talla',170);
          ${carga}
          var antes = window.__E.salidas();
          var inlineAntes = window.__E.inline('bloque-ea-detalle');
          var pillAntes = window.__E.pill('aortica','esten');
          window.__E.set('${id}', '${nuevo}');
          var e1 = window.__E.informe('estandar');
          return JSON.stringify({ inlineAntes: inlineAntes, pillAntes: pillAntes,
            inlineDespues: window.__E.inline('bloque-ea-detalle'),
            pillDespues: window.__E.pill('aortica','esten'),
            visBloque: window.__E.vis('bloque-ea-detalle'),
            antes: antes, despues: window.__E.salidas(),
            frases: window.__E.frasesAo(e1.inf), suma: e1.suma,
            cols: (function(){ var r = window.__E.excel();
              return (typeof r === 'object') ? Object.keys(r).length : r })(),
            xlsAva: (function(){ var r = window.__E.excel();
              return (typeof r === 'object') ? { dvi: r['DVI Ao'], ava: r['AVA (cm2)'] } : r })() });
        })()`);
      }
    }
    /* (3) el CELULAR: la sincronia de entrada a la pestania NO corre por debajo de 769 px. */
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: 390, height: 900, deviceScaleFactor: 1, mobile: true }, sessionId);
    await new Promise((r) => setTimeout(r, 300));
    rancio2['3-celular-390-cargado-en-Doppler'] = await J(`(function(){
      window.__E.limpiar();
      try { showTab('doppler') } catch(e) {}
      window.__E.set('nombre','EA'); window.__E.set('peso',70); window.__E.set('talla',170);
      window.__E.set('diam_tsvi_ao', 20);
      window.__E.set('itv_tsvi', 16); window.__E.set('itv_ao', 50);
      window.__E.set('vmax_ao', 4.2); window.__E.set('gmedio_ao', 45);
      var enDoppler = window.__E.salidas();
      var inline1 = window.__E.inline('bloque-ea-detalle');
      window.__E.valvSinPastilla();
      var e1 = window.__E.informe('estandar');
      return JSON.stringify({ inlineEnDoppler: inline1,
        inlineEnValvulas: window.__E.inline('bloque-ea-detalle'),
        pill: window.__E.pill('aortica','esten'),
        visBloque: window.__E.vis('bloque-ea-detalle'),
        enDoppler: enDoppler, trasEntrar: window.__E.salidas(),
        frases: window.__E.frasesAo(e1.inf), suma: e1.suma });
    })()`);
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    OUT.rancio2 = rancio2;
  }

  /* ── 1(a ter) · lo mismo con el cajon «Datos» PLEGADO y DESPLEGADO en celular ────────────── */
  if (hacer('plegado')) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: 390, height: 900, deviceScaleFactor: 1, mobile: true }, sessionId);
    await new Promise((r) => setTimeout(r, 300));
    OUT.plegado = await J(`(function(){
      var pru = function(abrirCajon){
        window.__E.limpiar();
        var ab = window.__E.valvConPastilla();
        if (abrirCajon) { try { valvDatosTog('caja-esten-aortica') } catch(e){} }
        window.__E.set('nombre','EA'); window.__E.set('peso',70); window.__E.set('talla',170);
        window.__E.set('diam_tsvi_ao', 20);
        window.__E.set('itv_tsvi', 16); window.__E.set('itv_ao', 50);
        window.__E.set('vmax_ao', 4.2); window.__E.set('gmedio_ao', 45);
        var antes = window.__E.salidas();
        window.__E.set('itv_ao', 60);
        return { ab: ab, visBloque: window.__E.vis('bloque-ea-detalle'),
                 inline: window.__E.inline('bloque-ea-detalle'),
                 antes: antes, despues: window.__E.salidas() };
      };
      return JSON.stringify({ cajonPlegado: pru(false), cajonAbierto: pru(true) });
    })()`);
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
  }

  /* ── 2 · LOS CUATRO CAMPOS × LOS CUATRO GESTOS ──────────────────────────────────────────── */
  if (hacer('gestos')) OUT.gestos = await J(`(function(){
    var PARES = [ ['ea_vmax','vmax_ao', 4.2], ['ea_gmedio','gmedio_ao', 45],
                  ['ea_vtitsvi','itv_tsvi', 16], ['ea_vtiao','itv_ao', 50] ];
    var out = {};
    PARES.forEach(function(P){
      var a = P[0], b = P[1], val = P[2];
      var leer = function(){ return { valv: window.__E.val(a), doppler: window.__E.val(b),
        ava: window.__E.val('ea_ava_display'), dvi: window.__E.val('ea_dvi_display'),
        gmax: window.__E.val('ea_gmax_display'), avai: window.__E.txt('ea-det-avai'),
        ava_cont: window.__E.val('ava_cont') } };
      var base = function(){
        window.__E.limpiar(); window.__E.valvConPastilla();
        window.__E.set('nombre','G'); window.__E.set('peso',70); window.__E.set('talla',170);
        window.__E.set('diam_tsvi_ao', 20);
        window.__E.set('itv_tsvi', 16); window.__E.set('itv_ao', 50);
        window.__E.set('vmax_ao', 4.2); window.__E.set('gmedio_ao', 45);
        /* se BORRA el campo en estudio para arrancar de cero en los dos lados */
        window.__E.set(b, '');
      };
      base(); window.__E.set(a, val);           var g1 = leer();
      window.__E.set(a, '');                    var g2 = leer();
      base(); window.__E.set(b, val);           var g3 = leer();
      window.__E.set(b, '');                    var g4 = leer();
      out[a + ' / ' + b] = { '1-tecleaValvulas': g1, '2-borraValvulas': g2,
                             '3-tecleaDoppler': g3, '4-borraDoppler': g4 };
    });
    return JSON.stringify(out);
  })()`);

  /* ── 2bis · los espejos MITRALES y de la IAo que cuelgan del VTI TSVI, por las DOS puertas ── */
  if (hacer('mitral')) OUT.mitral = await J(`(function(){
    var pru = function(id){
      window.__E.limpiar(); window.__E.valvConPastilla();
      /* DENOMINADOR: los espejos de la mitral y de la IAo se gatean por la visibilidad de SU
         bloque, asi que sin abrir esas pastillas quedan en blanco y la medicion no cuenta nada. */
      var s = document.getElementById('ete-seccion-valv-mitral');
      if (s && s.style.display === 'none') { try { toggleEteSeccion('valv-mitral') } catch(e){} }
      ['pill-esten-mitral','pill-insuf-mitral','pill-insuf-aortica'].forEach(function(pid){
        var p = document.getElementById(pid);
        if (p && !p.classList.contains('btn-primary')) {
          var m = pid.replace('pill-','').split('-');
          try { toggleValvPill(m[1], m[0]) } catch(e){} } });
      window.__E.set('nombre','M'); window.__E.set('peso',70); window.__E.set('talla',170);
      window.__E.set('diam_tsvi_ao', 20); window.__E.set('itv_ao', 50);
      window.__E.set('avm_thp', 1.2); window.__E.set('im_vti', 100);
      window.__E.set('ia_vti', 120); window.__E.set('ia_jet', 10);
      window.__E.set(id, 16);
      var foto = function(){ return { em_vti: window.__E.val('em_vtitsvi'),
        im_vti: window.__E.val('im_itv_tsvi'), em_dtsvi: window.__E.val('em_dtsvi'),
        im_dtsvi: window.__E.val('im_dtsvi'), ia_fr: window.__E.txt('ia-fr'),
        ia_sev: window.__E.txt('ia-sev'), vs: window.__E.val('vs_calc') } };
      var a = foto();
      window.__E.set(id, 22);
      var b = foto();
      return { cargado: a, corregido: b, par: { valv: window.__E.val('ea_vtitsvi'),
               doppler: window.__E.val('itv_tsvi') } };
    };
    return JSON.stringify({ porDoppler: pru('itv_tsvi'), porValvulas: pru('ea_vtitsvi') });
  })()`);

  /* ── 3 · A/B de la AORTICA: barrida de bordes del grado, pastilla, informe, EN SUMA, PDF,
     PPT y Excel. Cada escena se carga por el DOPPLER y con la pastilla prendida, que es el
     camino de HEAD donde todo corre. */
  if (hacer('bordes')) {
    const BORDES = [
      ['sin-datos',      ''],
      ['vmax-2.4',       `window.__E.set('vmax_ao', 2.4);`],
      ['vmax-2.5',       `window.__E.set('vmax_ao', 2.5);`],
      ['vmax-2.9',       `window.__E.set('vmax_ao', 2.9);`],
      ['vmax-3.0',       `window.__E.set('vmax_ao', 3.0);`],
      ['vmax-3.9',       `window.__E.set('vmax_ao', 3.9);`],
      ['vmax-4.0',       `window.__E.set('vmax_ao', 4.0);`],
      ['gmed-19',        `window.__E.set('gmedio_ao', 19);`],
      ['gmed-20',        `window.__E.set('gmedio_ao', 20);`],
      ['gmed-39',        `window.__E.set('gmedio_ao', 39);`],
      ['gmed-40',        `window.__E.set('gmedio_ao', 40);`],
      ['ava-0.99', `window.__E.set('diam_tsvi_ao',20);window.__E.set('itv_tsvi',16);window.__E.set('itv_ao',50.8);`],
      ['ava-1.00', `window.__E.set('diam_tsvi_ao',20);window.__E.set('itv_tsvi',16);window.__E.set('itv_ao',50.2);`],
      ['ava-1.50', `window.__E.set('diam_tsvi_ao',20);window.__E.set('itv_tsvi',24);window.__E.set('itv_ao',50.2);`],
      ['completo-severa', `window.__E.set('diam_tsvi_ao',20);window.__E.set('itv_tsvi',16);window.__E.set('itv_ao',50);
                           window.__E.set('vmax_ao',4.5);window.__E.set('gmedio_ao',48);`],
      ['completo-moderada', `window.__E.set('diam_tsvi_ao',22);window.__E.set('itv_tsvi',20);window.__E.set('itv_ao',40);
                             window.__E.set('vmax_ao',3.4);window.__E.set('gmedio_ao',28);`],
      ['ia-con-insuf', `window.__E.set('diam_tsvi_ao',22);window.__E.set('itv_tsvi',20);window.__E.set('itv_ao',40);
                        window.__E.set('ia_pisa_r',6);window.__E.set('ia_pisa_val',38);window.__E.set('ia_vti',120);
                        window.__E.set('ia_vc',6);`],
      ['protesis-tavi', `window.__E.set('va_morf','TAVI');window.__E.set('vmax_ao',3.2);
                         window.__E.set('gmedio_ao',25);window.__E.set('diam_tsvi_ao',20);
                         window.__E.set('itv_tsvi',16);window.__E.set('itv_ao',50);
                         window.__E.set('va_at',95);window.__E.set('tango_te',300);`],
    ];
    const bordes = {};
    for (const [n, cuerpo] of BORDES) {
      bordes[n] = await J(`(function(){
        window.__E.limpiar(); var ab = window.__E.valvConPastilla();
        window.__E.set('nombre','B'); window.__E.set('peso',70); window.__E.set('talla',170);
        window.__E.set('hemo_fc',70); window.__E.set('hemo_pam',90);
        ${cuerpo}
        var e1 = window.__E.informe('estandar'), e2 = window.__E.informe('detallado');
        var row = window.__E.excel();
        return JSON.stringify({ ab: ab, salidas: window.__E.salidas(),
          estandar: { frases: window.__E.frasesAo(e1.inf), suma: e1.suma },
          detallado: { frases: window.__E.frasesAo(e2.inf), suma: e2.suma },
          ppt: window.__E.ppt(['vmax_ao','gmedio_ao','ava_cont','vs_calc','ea_grado','diam_tsvi',
                               'ea_vmax','ea_gmedio','ea_vtitsvi','ea_vtiao','ea_dtsvi']),
          cols: (typeof row === 'object') ? Object.keys(row).length : row,
          row: row, campos: window.__E.campos(),
          pdf: window.__E.pdfFiltrado(/a[oó]rt|Ao|AVA|DVI|TSVI|VTI|EAo|IAo/i) });
      })()`);
    }
    OUT.bordes = bordes;
  }

  /* ── 3bis · TC-358: el aviso de GRADO RETIRADO con el O TSVI en centimetros ─────────────── */
  if (hacer('retiro')) OUT.retiro = await J(`(function(){
    var pru = function(conPastilla){
      window.__E.limpiar();
      var ab = conPastilla ? window.__E.valvConPastilla() : window.__E.valvSinPastilla();
      window.__E.set('nombre','R'); window.__E.set('peso',70); window.__E.set('talla',170);
      window.__E.set('vmax_ao', 4.5); window.__E.set('gmedio_ao', 48);
      window.__E.set('itv_tsvi', 16); window.__E.set('itv_ao', 50);
      window.__E.set('diam_tsvi_ao', 20);
      var bien = { grado: window.__E.val('ea_grado'), badge: window.__E.txt('ea-ava-badge'),
                   sug: (function(){ var s=document.getElementById('ea_grado');
                     return s ? (s.dataset.sugerido||'(sin)') : null })(),
                   salidas: window.__E.salidas() };
      /* el O TSVI en CENTIMETROS: 2 mm. Es el escenario exacto de TC-358. */
      window.__E.set('diam_tsvi_ao', 2);
      var e1 = window.__E.informe('estandar');
      return { ab: ab, bien: bien,
        tras: { grado: window.__E.val('ea_grado'), badge: window.__E.txt('ea-ava-badge'),
                sug: (function(){ var s=document.getElementById('ea_grado');
                  return s ? (s.dataset.sugerido||'(sin)') : null })(),
                salidas: window.__E.salidas() },
        frases: window.__E.frasesAo(e1.inf), suma: e1.suma };
    };
    return JSON.stringify({ conPastilla: pru(true), sinPastilla: pru(false) });
  })()`);

  /* ── 3ter · el Tango se borra al TIPEAR la Vmax, por las DOS puertas (control negativo: el
     G. medio y los dos VTI NO lo borran) ─────────────────────────────────────────────────── */
  if (hacer('tango')) OUT.tango = await J(`(function(){
    var pru = function(id, val){
      window.__E.limpiar(); window.__E.valvConPastilla();
      window.__E.set('diam_tsvi_ao', 20); window.__E.set('itv_tsvi', 16); window.__E.set('itv_ao', 50);
      window.__E.set('vmax_ao', 4.2);
      window.__E.set('tango_te', 300); window.__E.set('tango_tac', 95);
      var antes = { te: window.__E.val('tango_te'), tac: window.__E.val('tango_tac'),
                    ava: window.__E.val('tango_ava_val') };
      window.__E.set(id, val);
      return { antes: antes, tras: { te: window.__E.val('tango_te'),
        tac: window.__E.val('tango_tac'), ava: window.__E.val('tango_ava_val'),
        nodo: window.__E.txt('tango-ava') } };
    };
    return JSON.stringify({
      'Vmax por DOPPLER':   pru('vmax_ao', 3.6),
      'Vmax por VALVULAS':  pru('ea_vmax', 3.6),
      'NEG G.medio Doppler':  pru('gmedio_ao', 30),
      'NEG G.medio Valvulas': pru('ea_gmedio', 30),
      'NEG VTI TSVI Valvulas':pru('ea_vtitsvi', 22),
      'NEG VTI Ao Valvulas':  pru('ea_vtiao', 60)
    });
  })()`);

  /* ── 4 · Nuevo estudio y estudio guardado ───────────────────────────────────────────────── */
  if (hacer('nuevo')) OUT.nuevo = await J(`(function(){
    window.__E.limpiar(); window.__E.valvConPastilla();
    window.__E.set('nombre','NE'); window.__E.set('peso',70); window.__E.set('talla',170);
    window.__E.set('diam_tsvi_ao',20); window.__E.set('itv_tsvi',16); window.__E.set('itv_ao',50);
    window.__E.set('vmax_ao',4.2); window.__E.set('gmedio_ao',45);
    var cargado = window.__E.salidas();
    var via = 'directo';
    try { nuevoEstudio() } catch(e) { return JSON.stringify({err:e.message}) }
    var m = document.getElementById('modal-nuevo-estudio');
    if (m && getComputedStyle(m).display !== 'none') {
      via = 'modal';
      try { neContinuarSinGuardar() } catch(e) { return JSON.stringify({err:'modal: '+e.message}) }
    }
    return JSON.stringify({ via: via, cargado: cargado, tras: window.__E.salidas() });
  })()`);

  /* ── 5(a) · ESTUDIO GUARDADO con los TRES lugares del O TSVI distintos (19 / 21 / 23) ───── */
  if (hacer('guardado')) OUT.guardado = await J(`(function(){
    var pru = function(entrarAValvulas){
      window.__E.limpiar();
      var campos = { nombre:'Legado', peso:'70', talla:'170',
        diam_tsvi_ao:'19', diam_tsvi:'21', ea_dtsvi:'23',
        itv_tsvi:'16', itv_ao:'50', vmax_ao:'4.2', gmedio_ao:'45' };
      var inf = { id:'leg-eaauto', nombre:'Legado', ci:'9', fecha_estudio:'2026-09-01',
                  campos: campos, informe_texto:'', en_suma:'' };
      var _orig = window.getInformes;
      window.getInformes = function(){ return [inf] };
      try {
        try { editarInforme('leg-eaauto') } catch(e) { return {err:e.message} }
        var ok = document.getElementById('edit-ok');
        if (!ok) return {err:'sin overlay'};
        ok.click();
      } finally { window.getInformes = _orig; }
      var reciencargado = { aivi: window.__E.val('diam_tsvi_ao'),
        doppler: window.__E.val('diam_tsvi'), valv: window.__E.val('ea_dtsvi') };
      if (entrarAValvulas) { window.__E.valvConPastilla(); }
      var e1 = window.__E.informe('estandar');
      return { enDisco: { aivi: campos.diam_tsvi_ao, doppler: campos.diam_tsvi, valv: campos.ea_dtsvi },
        alAbrir: reciencargado, trasValvulas: { aivi: window.__E.val('diam_tsvi_ao'),
          doppler: window.__E.val('diam_tsvi'), valv: window.__E.val('ea_dtsvi') },
        salidas: window.__E.salidas(), frases: window.__E.frasesAo(e1.inf), suma: e1.suma };
    };
    return JSON.stringify({ sinEntrarAValvulas: pru(false), entrandoAValvulas: pru(true) });
  })()`);

  /* ── 5(b) · IMPORTADOR XML DEL ECOGRAFO, con una muestra SINTETICA del GE ────────────────
     Se arma el <measurements> como lo manda el Vivid, se parsea con el MISMO DOMParser y se
     recorre con el MISMO bucle que `_chmLeerEstudio` (parameter -> measpar -> _chmMapearMedicion),
     que es donde viven el factor de unidad y el control de rango. Despues el valor se mete en un
     estudio por la misma puerta que usa `dcmImpEjecutar` —`campos[campo] = _dcmRed(valor)`— y se
     reabre con `editarInforme`, asi que lo que se lee al final es el CAMPO del formulario. */
  if (hacer('importador')) OUT.importador = await J(`(function(){
    var XML = function(unidad, valor){
      return '<?xml version="1.0" encoding="UTF-8"?>' +
        '<measurements>' +
          '<patient><last_name>Sintetico</last_name><first_name>GE</first_name>' +
            '<patient_id>9999</patient_id><birthdate>1960-01-01</birthdate>' +
            '<exam_date>2026-10-07</exam_date></patient>' +
          '<parameter NAME="AR Vmax"><measpar>' +
            '<name>AR Vmax</name><unit>' + unidad + '</unit><aver>' + valor + '</aver>' +
          '</measpar></parameter>' +
          '<parameter NAME="AV Vmax P"><measpar>' +
            '<name>AV Vmax P</name><unit>m/s</unit><aver>4.2</aver>' +
          '</measpar></parameter>' +
        '</measurements>';
    };
    var leer = function(unidad, valor){
      var doc = new DOMParser().parseFromString(XML(unidad, valor), 'text/xml');
      var err = doc.getElementsByTagName('parsererror')[0];
      if (err) return { err: String(err.textContent||'').slice(0,120) };
      if (!doc.documentElement || doc.documentElement.nodeName !== 'measurements')
        return { err: 'raiz ' + (doc.documentElement ? doc.documentElement.nodeName : '?') };
      var ok = [], no = [];
      var params = doc.getElementsByTagName('parameter');
      for (var i = 0; i < params.length; i++) {
        var nombre = String(params[i].getAttribute('NAME')||'').trim();
        var mps = params[i].getElementsByTagName('measpar');
        for (var k = 0; k < mps.length; k++) {
          var mp = mps[k];
          var r = _chmMapearMedicion(nombre, _chmTexto(mp,'name'), _chmTexto(mp,'unit'),
                                     _chmTexto(mp,'aver') || _chmTexto(mp,'value'));
          if (r.ok) ok.push({ campo:r.campo, unidadOrig:r.unidadOrig, valorOrig:r.valorOrig,
                              valor:r.valor, red:_dcmRed(r.valor) });
          else no.push({ param:nombre, motivo:r.motivo });
        }
      }
      return { mapeadas: ok, descartes: no };
    };
    /* Y de la fila al CAMPO, por la puerta de dcmImpEjecutar: campos[campo] = _dcmRed(valor). */
    var alCampo = function(res){
      var cs = {};
      (res.mapeadas||[]).forEach(function(r){ cs[r.campo] = _dcmRed(r.valor) });
      cs.nombre = 'GE Sintetico'; cs.peso = '70'; cs.talla = '170';
      window.__E.limpiar();
      var inf = { id:'ge-sint', nombre:'GE Sintetico', ci:'9999',
                  fecha_estudio:'2026-10-07', campos: cs, informe_texto:'', en_suma:'' };
      var _orig = window.getInformes;
      window.getInformes = function(){ return [inf] };
      try {
        try { editarInforme('ge-sint') } catch(e) { return { err: e.message } }
        var okb = document.getElementById('edit-ok');
        if (!okb) return { err:'sin overlay' };
        okb.click();
      } finally { window.getInformes = _orig; }
      return { enCampos: cs.ia_vmax_cw, campo: window.__E.val('ia_vmax_cw'),
               placeholder: window.__E.place('ia_vmax_cw'),
               vmax_ao: window.__E.val('vmax_ao'), ea_vmax: window.__E.val('ea_vmax') };
    };
    var casos = {};
    [['cm/s','450'], ['m/s','4.5'], ['cm/s','4.5'], ['m/s','450'], ['cm/s','45'], ['cm/s','800']]
      .forEach(function(c){
        var res = leer(c[0], c[1]);
        casos[c[1] + ' ' + c[0]] = { leido: res, aplicado: res.mapeadas ? alCampo(res) : null };
      });
    return JSON.stringify({ casos: casos,
      tabla_AR_Vmax: (function(){ try { return JSON.stringify(CHM_MAPA['AR Vmax']) } catch(e){ return 'EXC' } })(),
      rango: (function(){ try { return JSON.stringify(CHM_RANGO['ia_vmax_cw']) } catch(e){ return 'EXC' } })(),
      cms_por_ms: (function(){ try { return CMS_POR_MS } catch(e){ return 'EXC' } })() });
  })()`);

  /* ── 4(b) · LA INSUFICIENCIA TRICUSPIDEA, 96 COMBINACIONES ──────────────────────────────── */
  if (hacer('it96')) {
    /* 4 x 3 x 2 x 4 = 96. La vena contracta cruza los dos cortes de la ASE (<3 / 3 a <7 / >=7). */
    const VC   = [2, 4, 6, 8];
    const RAD  = [4, 6, 9];
    const VAL  = [30, 38];
    const CW   = [2.0, 3.0, 4.5, 5.5];
    const it96 = {};
    for (const vc of VC) for (const r of RAD) for (const val of VAL) for (const cw of CW) {
      const k = `vc${vc} r${r} val${val} cw${cw}`;
      it96[k] = await J(`(function(){
        window.__E.limpiar();
        try { showTab('valvulas') } catch(e) {}
        var s = document.getElementById('ete-seccion-valv-tricuspide');
        if (s && s.style.display === 'none') { try { toggleEteSeccion('valv-tricuspide') } catch(e){} }
        var p = document.getElementById('pill-insuf-tricuspide');
        if (p && !p.classList.contains('btn-primary')) { try { toggleValvPill('tricuspide','insuf') } catch(e){} }
        window.__E.set('nombre','IT'); window.__E.set('peso',70); window.__E.set('talla',170);
        window.__E.set('it_vc', ${vc});
        window.__E.set('it_pisa_r', ${r}); window.__E.set('it_pisa_val', ${val});
        window.__E.set('it_vti', 120);
        window.__E.set('it_vmax_cw', window.__E.cwIT(${cw}));
        try { calcIT_ESC() } catch(e) {}
        var e1 = window.__E.informe('estandar');
        var row = window.__E.excel();
        var cols = {};
        if (typeof row === 'object') { Object.keys(row).forEach(function(c){
          if (/tricusp|IT |VD-AD|PSAP|Esten\\. Tric/i.test(c)) cols[c] = row[c]; }); }
        return JSON.stringify({ unidad: window.__E.unidadItCW(), foto: window.__E.fotoIt(),
          frases: window.__E.frasesIt(e1.inf), suma: e1.suma, cols: cols,
          nCols: (typeof row === 'object') ? Object.keys(row).length : row });
      })()`);
    }
    OUT.it96 = it96;
  }

  /* ── Maquetacion a 1200, 390 y 360 px, con el bloque PLEGADO y DESPLEGADO ───────────────── */
  if (hacer('movil')) {
    const movil = {};
    for (const w of [1200, 390, 360]) {
      await cdp.send('Emulation.setDeviceMetricsOverride',
        { width: w, height: 900, deviceScaleFactor: 1, mobile: w <= 430 }, sessionId);
      await new Promise((r) => setTimeout(r, 300));
      movil[w] = await J(`(function(){
        var caja = function(id){ var e = document.getElementById(id); if (!e) return null;
          var r = e.getBoundingClientRect(); var d = document.documentElement;
          /* DENOMINADOR: un nodo en display:none no tiene geometria y mide 0. */
          return { w: Math.round(r.width), der: Math.round(r.right), vis: window.__E.vis(id),
                   desborda: r.right > d.clientWidth + 1 } };
        var pru = function(abrirCajon){
          window.__E.limpiar(); window.__E.valvConPastilla();
          if (abrirCajon) { var c = document.getElementById('caja-esten-aortica');
            if (c && !c.classList.contains('valv-datos-abierto')) {
              try { valvDatosTog('caja-esten-aortica') } catch(e){} } }
          window.__E.set('diam_tsvi_ao',20); window.__E.set('itv_tsvi',16);
          window.__E.set('itv_ao',50); window.__E.set('vmax_ao',4.2);
          window.__E.set('gmedio_ao',45);
          var d = document.documentElement;
          return { scrollW: d.scrollWidth, clientW: d.clientWidth,
            hayBarra: d.scrollWidth > d.clientWidth + 1,
            visBloque: window.__E.vis('bloque-ea-detalle'),
            ea_vmax: caja('ea_vmax'), ea_gmedio: caja('ea_gmedio'),
            ea_vtitsvi: caja('ea_vtitsvi'), ea_vtiao: caja('ea_vtiao'),
            ea_dtsvi: caja('ea_dtsvi'), ea_dvi: caja('ea_dvi_display'),
            ea_ava: caja('ea_ava_display'), ea_gmax: caja('ea_gmax_display'),
            lbl_vmax: window.__E.lbl('ea_vmax'), lbl_dtsvi: window.__E.lbl('ea_dtsvi') };
        };
        return JSON.stringify({ plegado: pru(false), desplegado: pru(true) });
      })()`);
    }
    await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);
    OUT.movil = movil;
  }

  const despues = await md5(join(RAIZ, 'index.html'));
  OUT.md5_index_antes = antes; OUT.md5_index_despues = despues;
  OUT.index_intacto = antes === despues;
  console.log(JSON.stringify(OUT, null, 2));

  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
