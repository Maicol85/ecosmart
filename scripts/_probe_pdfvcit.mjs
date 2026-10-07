#!/usr/bin/env node
/**
 * _probe_pdfvcit.mjs — sonda A/B de SOLO LECTURA sobre el PDF FIRMADO, para el cambio de la
 * referencia de la vena contracta tricuspidea («(<3 / 3-7 / >7) mm» -> «(<3 / 3 a <7 / >=7) mm»).
 *
 * GENERA EL PDF DE VERDAD (intercepta el constructor de jsPDF, no descarga nada) y registra
 * TODAS las llamadas a doc.text con su posicion y pagina, mas el largo de los bytes. Asi el A/B
 * puede afirmar «identico salvo esa linea» sobre el documento entero y no sobre una aproximacion.
 *
 *   node scripts/_probe_pdfvcit.mjs --file /tmp/index.HEAD.html > /tmp/pdf.HEAD.json
 *   node scripts/_probe_pdfvcit.mjs                             > /tmp/pdf.NEW.json
 *
 * Infraestructura calcada de scripts/_probe_tsvi.mjs; la interceptacion, de _probe_vi3dpdf.mjs.
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-pdfvc-'));
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

/* ══ Sonda inyectada — NI UN ACENTO GRAVE adentro, tampoco en los comentarios ════════════════ */
const SONDA = `
window.__P = {
  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return 1 },

  limpiar() {
    try { limpiarCampos(true) } catch(e) {}
    window.esqSevManual = {}; window._sevCalcAlFijar = {};
    ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){
        try { localStorage.removeItem('valv-pill-' + t + '-' + v) } catch(e){}
        try { if (pillOn(v,t) === true) toggleValvPill(v,t) } catch(e){}
      });
    });
    return 1 },

  abrir() {
    try { showTab('valvulas') } catch(e) {}
    ['valv-mitral','valv-aortica','valv-tricuspide','valv-pulmonar'].forEach(function(tok){
      var s = document.getElementById('ete-seccion-' + tok);
      if (s && s.style.display === 'none') { try { toggleEteSeccion(tok) } catch(e) {} }
    });
    ['aortica','mitral','tricuspide','pulmonar'].forEach(function(v){
      ['esten','insuf'].forEach(function(t){
        var p = document.getElementById('pill-' + t + '-' + v);
        if (p && !p.classList.contains('btn-primary')) { try { toggleValvPill(v,t) } catch(e){} }
      })});
    ['caja-esten-aortica','caja-insuf-aortica','caja-esten-tricuspide','caja-insuf-tricuspide']
      .forEach(function(c){ var b = document.getElementById(c);
        if (b && !b.classList.contains('valv-datos-abierto')) { try { valvDatosTog(c) } catch(e){} } });
    return 1 },

  /* EL PDF, GENERADO DE VERDAD. Se envuelve el CONSTRUCTOR y no el prototipo: en jsPDF 2.x los
     metodos del nucleo son propiedades PROPIAS de cada documento (ver _probe_vi3dpdf.mjs). */
  pdf() {
    if (typeof window.jspdf === 'undefined') return 'SIN jsPDF';
    var orig = window.jspdf.jsPDF;
    var textos = [], bytes = null, err = null, nImg = 0;
    function Envuelto(){
      var d = new orig(arguments[0]);
      var oText = d.text, oImg = d.addImage;
      d.addImage = function(){ nImg++; return oImg.apply(d, arguments) };
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
    var i = bytes ? bytes.indexOf(',') : -1;
    return { err: err, guardo: !!bytes, nTextos: textos.length, nImg: nImg,
             largoB64: (i >= 0) ? bytes.length - i - 1 : -1,
             textos: textos } },

  /* El grado que la app calcula para una vena contracta dada: es lo que el texto de referencia
     tiene que estar describiendo. */
  gradoVC(mm) { try { return itGradoDe('vc', mm) } catch(e) { return 'EXC' } },

  listo() {
    var faltan = ['generarPDFReal','limpiarCampos','pillOn','toggleValvPill','toggleEteSeccion',
                  'showTab','itGradoDe','valvDatosTog']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (typeof window.jspdf === 'undefined') faltan.push('jspdf');
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
  const J = async (e) => JSON.parse(await ev(e));

  for (let i = 0; i < 90; i++) {
    try { await ev(SONDA); const l = await ev('JSON.stringify(window.__P.listo())');
      if (JSON.parse(l).listo) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  const listo = await J('JSON.stringify(window.__P.listo())');

  /* Los grados que la app calcula en los bordes de la vena contracta tricuspidea: es lo que el
     texto de referencia del PDF describe, y el motivo de que el viejo fuera falso. */
  const grados = await J(`JSON.stringify({
    '2.9': window.__P.gradoVC(2.9), '3': window.__P.gradoVC(3),
    '6.9': window.__P.gradoVC(6.9), '7': window.__P.gradoVC(7),
    '7.1': window.__P.gradoVC(7.1)
  })`);

  /* ── Las escenas. Nombre, documento y fecha son FIJOS: el PDF lleva la fecha de emision y sin
     fijarla el A/B diferiria en cada corrida por el reloj. ── */
  const ESCENAS = [
    { n: '1 formulario vacio', c: `` },
    { n: '2 IT leve (VC 2)',   c: `window.__P.set('it_vc', 2);` },
    { n: '3 IT moderada (VC 6.9)', c: `window.__P.set('it_vc', 6.9);` },
    { n: '4 IT severa en el borde (VC 7)', c: `window.__P.set('it_vc', 7);` },
    { n: '5 IT severa (VC 9) + PISA', c:
        `window.__P.set('it_vc', 9); window.__P.set('it_pisa_r', 9);
         window.__P.set('it_pisa_val', 40); window.__P.set('it_vmax_cw', 3);
         window.__P.set('it_vti', 90);` },
    { n: '6 las cuatro valvulas cargadas', c:
        `window.__P.set('it_vc', 6.9); window.__P.set('im_vc', 7);
         window.__P.set('ia_vc', 6);  window.__P.set('vmax_ao', 4.2);
         window.__P.set('gmedio_ao', 45); window.__P.set('diam_tsvi_ao', 22);
         window.__P.set('itv_tsvi', 20); window.__P.set('itv_ao', 24);
         window.__P.set('vmax_it', 3.2); window.__P.set('pmad', 5);
         window.__P.set('avm_plan', 1.2); window.__P.set('vp_vmax', 1.2);` },
    { n: '7 sin vena contracta tricuspidea', c: `window.__P.set('im_vc', 5);` },
    /* ESCENA DENSA: la columna tricuspidea con TODAS sus filas y la vena contracta con decimal,
       que es la combinacion donde el texto nuevo envuelve. Es la que puede empujar filas o
       desbordar la pagina, asi que es la que hay que mirar. */
    { n: '8 tricuspide densa con VC decimal', c:
        `window.__P.set('it_vc', 6.9); window.__P.set('it_pisa_r', 9);
         window.__P.set('it_pisa_val', 40); window.__P.set('it_vmax_cw', 3);
         window.__P.set('it_vti', 90); window.__P.set('it_densidad','denso');
         window.__P.set('vmax_it', 3.2); window.__P.set('pmad', 10);
         window.__P.set('et_gmedio', 6); window.__P.set('et_thp', 200);
         window.__P.set('im_vc', 6.9); window.__P.set('ia_vc', 5.5);
         window.__P.set('vmax_ao', 4.25); window.__P.set('gmedio_ao', 45.5);
         window.__P.set('diam_tsvi_ao', 21.5); window.__P.set('itv_tsvi', 20.5);
         window.__P.set('itv_ao', 24.5); window.__P.set('avm_plan', 1.25);
         window.__P.set('vp_vmax', 1.25); window.__P.set('onda_e', 85);
         window.__P.set('onda_a', 65); window.__P.set('e_sep', 6.5);
         window.__P.set('e_lat', 9.5); window.__P.set('tde', 185);` },
  ];
  const esc = {};
  for (const E of ESCENAS) {
    esc[E.n] = await J(`(function(){
      window.__P.limpiar(); window.__P.abrir();
      window.__P.set('nombre','PDF VC'); window.__P.set('ci','12345678');
      window.__P.set('fecha','2026-10-07'); window.__P.set('edad', 60);
      window.__P.set('sexo','M'); window.__P.set('peso', 70); window.__P.set('talla', 170);
      ${E.c}
      return JSON.stringify(window.__P.pdf());
    })()`);
  }

  const despues = await md5(join(RAIZ, 'index.html'));
  console.log(JSON.stringify({
    archivo: FARG, md5_index_antes: antes, md5_index_despues: despues,
    index_intacto: antes === despues, listo, grados, esc,
  }, null, 2));

  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}
main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
