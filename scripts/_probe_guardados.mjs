#!/usr/bin/env node
/**
 * _probe_guardados.mjs — sonda A/B de SOLO LECTURA para la PANTALLA «GUARDADOS» (parte A,
 * 2026-10-06) y para el SELECTOR DE PROTOCOLO DIASTOLICO (parte B).
 *
 * Mide lo que TC-420 y TC-421 NO cubren: que las CUATRO superficies firmadas y el panel de
 * valvulas queden IDENTICOS a HEAD. Las dos partes de este trabajo son de pantalla —plegado de
 * los grupos por mes y un aviso junto a un desplegable— asi que la afirmacion que hay que poder
 * sostener es «no se movio nada del informe», y eso se sostiene comparando, no leyendo.
 *
 * No muta index.html: comprueba su md5 al principio y al final.
 *
 *   node scripts/_probe_guardados.mjs --file /tmp/index.HEAD.html > /tmp/g.HEAD.json
 *   node scripts/_probe_guardados.mjs                             > /tmp/g.NEW.json
 *   diff /tmp/g.HEAD.json /tmp/g.NEW.json
 *
 * Infraestructura (servidor + Chrome + CDP) calcada de scripts/_probe_etbin.mjs.
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
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-guard-'));
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

const md5 = async (p) => createHash('md5').update(await readFile(p)).digest('hex');

/* ══ Sonda inyectada ══════════════════════════════════════════════════════════════════════════
   ⚠️ CUERPO DE TEMPLATE LITERAL: ni un acento grave adentro, tampoco en los comentarios. */
const SONDA = `
window.__G = {
  val(id) { var e = document.getElementById(id); return e ? e.value : null },
  txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null },
  vis(id) { var e = document.getElementById(id); if (!e) return null;
    var n = e; while (n && n.nodeType === 1) {
      if (getComputedStyle(n).display === 'none') return false; n = n.parentNode; }
    return true },

  listo() {
    var faltan = ['generarInforme','limpiarCampos','calcDiastol','_labExcelRow','igPintar']
      .filter(function(f){ return typeof window[f] !== 'function' });
    if (faltan.length) return { listo:false, faltan:faltan };
    if (!document.getElementById('informe_texto')) return { listo:false, por:'sin informe_texto' };
    if (!document.getElementById('diast_algoritmo')) return { listo:false, por:'sin diast_algoritmo' };
    return { listo:true } },

  set(id, valor) {
    var e = document.getElementById(id);
    if (!e) return { err: 'NO EXISTE ' + id };
    e.value = String(valor);
    e.dispatchEvent(new Event('input',  { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return { id: id, leido: e.value } },

  /* Los campos que se PERSISTEN, por el MISMO barrido que usa guardarInforme. Si aparece o
     desaparece una clave del estudio, el diff la nombra. */
  campos() {
    var c = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      c[el.id] = el.value; });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      c[el.id + '__chk'] = el.checked ? '1' : '0' });
    return c },

  /* La fila del Excel por el emisor REAL. No genera el .xlsx —«Excel y reimportacion solo con
     orden expresa»—: se comparan las columnas que produce y su CANTIDAD, que es el 434 del
     protocolo de verificacion. */
  excel() {
    if (typeof _labExcelRow !== 'function') return 'SIN _labExcelRow';
    var campos = {};
    document.querySelectorAll('input[id], select[id], textarea[id]').forEach(function(el){
      try { if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(el.id)) return } catch(e){}
      campos[el.id] = el.value });
    document.querySelectorAll('input[type=checkbox][id]').forEach(function(el){
      campos[el.id + '__chk'] = el.checked ? '1' : '0' });
    try {
      var r = _labExcelRow({ nombre:'P', ci:'1', fecha_estudio:'2026-10-06', campos: campos });
      return { n: Object.keys(r).length, fila: r };
    } catch(e) { return 'EXC: ' + e.message }
  },

  informe(estilo) {
    if (estilo) { try { setEstiloInforme(estilo) } catch(e){} }
    try { generarInforme() } catch(e) { return { err: e.message } }
    return { inf: (document.getElementById('informe_texto')||{}).value || '',
             suma: (document.getElementById('en_suma')||{}).value || '' } },

  /* El PANEL DE VALVULAS entero: los grados, las morfologias y las ocho pastillas. Es el control
     negativo de las dos partes — ninguna toca valvulas, asi que un numero que se mueva aca dice
     que el cambio se fue de su zona. */
  valvulas() {
    var out = { grados: {}, pills: {} };
    ['im_sev_final','im_grado','em_grado','ia_sev_final','ia_grado','ea_grado',
     'it_grado','et_grado','ip_grado','ep_grado',
     'vm_morf','va_morf','vt_morf','vp_morf'].forEach(function(id){
      out.grados[id] = window.__G.val(id) });
    ['mitral','aortica','tricuspide','pulmonar'].forEach(function(v){
      ['insuf','esten'].forEach(function(t){
        try { out.pills[v + '/' + t] = (typeof pillOn === 'function') ? pillOn(v,t) : 'SIN pillOn' }
        catch(e) { out.pills[v + '/' + t] = 'EXC' } }) });
    return out },

  /* El bloque de funcion diastolica tal como lo ve el medico: el desplegable, el titulo del
     algoritmo, la capsula de interpretacion y el E/e prima. Mas el aviso NUEVO de la parte B,
     que en HEAD no existe: txt y vis devuelven null, y asi el diff muestra que aparecio en vez
     de un false silencioso. */
  diastolica() {
    return {
      algo:      window.__G.val('diast_algoritmo'),
      ritmo:     window.__G.val('diast_ritmo'),
      titulo:    window.__G.txt('diast-algo-titulo'),
      interp:    window.__G.txt('dd-interp'),
      ee:        window.__G.txt('ee-val'),
      avisoTxt:  window.__G.txt('diast-algo-aviso'),
      avisoVis:  window.__G.vis('diast-algo-aviso'),
      /* La variable de SESION de la parte B, leida por su nombre: si el dia de maniana alguien la
         mueve a localStorage, este renglon lo delata en el diff. */
      ses:       (function(){ try { return sessionStorage.getItem('ett_diast_algo') } catch(e){ return 'EXC' } })(),
      lsHuella:  (function(){ try { return Object.keys(localStorage).filter(function(k){
                   return /diast/i.test(k) }).sort().join(',') } catch(e){ return 'EXC' } })()
    } },

  /* MAQUETACION del bloque del selector, para las condiciones 1 y 2 del pedido de Maicol: que el
     aviso no desplace la grilla de al lado ni el campo Ritmo, y que a 360 y 390 px el texto no se
     corte ni desborde. Se mide el rectangulo de los dos campos y el scroll del aviso. */
  layout() {
    var g = function(id){ var e = document.getElementById(id); if (!e) return null;
      var r = e.getBoundingClientRect();
      return { w: Math.round(r.width), h: Math.round(r.height),
               x: Math.round(r.left), y: Math.round(r.top) } };
    var av = document.getElementById('diast-algo-aviso');
    return {
      algo:  g('diast_algoritmo'),
      ritmo: g('diast_ritmo'),
      aviso: av ? { w: Math.round(av.getBoundingClientRect().width),
                    h: Math.round(av.getBoundingClientRect().height),
                    scrollW: av.scrollWidth, clientW: av.clientWidth,
                    scrollH: av.scrollHeight, clientH: av.clientHeight,
                    cortadoH: av.scrollWidth > av.clientWidth + 1,
                    cortadoV: av.scrollHeight > av.clientHeight + 1,
                    derecha: Math.round(av.getBoundingClientRect().right) } : null,
      scrollW: document.documentElement.scrollWidth,
      clientW: document.documentElement.clientWidth,
      hayBarra: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    } },

  /* Un paciente con datos en las cuatro valvulas y en la diastolica, para que las superficies
     tengan contenido que comparar. Sin esto el A/B compara dos informes de normalidad y no
     distingue nada: es el denominador. */
  paciente() {
    limpiarCampos(true);
    var sets = [['nombre','Sonda G'],['ci','4200001'],['fecha','2026-10-06'],
      ['edad','68'],['talla','170'],['peso','75'],
      ['ddfvi','52'],['dsfvi','34'],['siv','11'],['pp','10'],['fevi','55'],
      ['onda_e','95'],['onda_a','60'],['e_sep','5'],['e_lat','7'],['tde','180'],
      ['ai_vol','72'],['vmax_it','3.0'],['lars','18'],
      ['im_vc','0.5'],['vmax_ao','3.2'],['et_gmedio','6'],['ip_vmax','2.4']];
    sets.forEach(function(p){ window.__G.set(p[0], p[1]) });
    try { calcBSA(); calcVI(); calcAI(); calcVD(); calcPSAP(); calcDiastol(); } catch(e) {}
    return { nombre: window.__G.val('nombre'), ee: window.__G.txt('ee-val') } }
};
`;

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

  /* Calentamiento explicito: la app define funciones tarde y una sonda apurada mide una app a
     medio armar — y los ceros de una app incompleta son plausibles. */
  for (let i = 0; i < 60; i++) {
    try { await ev(SONDA); const l = await ev('JSON.stringify(window.__G.listo())');
      if (JSON.parse(l).listo) break; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  const listo = JSON.parse(await ev('JSON.stringify(window.__G.listo())'));

  /* LAS CUATRO SUPERFICIES, una por una y por su nombre, sobre el MISMO paciente. Nunca «el
     informe y el Excel» en bloque: cada una tiene su propio emisor y se rompen por separado. */
  const superficies = JSON.parse(await ev(`(function(){
    var out = {};
    out.denominador = window.__G.paciente();
    out.narrativo_estandar = window.__G.informe('estandar');
    out.narrativo_conciso  = window.__G.informe('conciso');
    out.narrativo_libre    = window.__G.informe('narrativo');
    window.__G.informe('estandar');
    out.excel    = window.__G.excel();
    out.valvulas = window.__G.valvulas();
    out.campos   = window.__G.campos();
    return JSON.stringify(out);
  })()`));

  /* EL SELECTOR EN SUS TRES VALORES. La parte B no cambia el algoritmo ni sus cortes, asi que la
     capsula, el titulo y el E/e prima de cada protocolo tienen que salir identicos a HEAD. */
  const protocolos = JSON.parse(await ev(`(function(){
    var out = {};
    window.__G.paciente();
    ['ase2025','bse2024','ase2016'].forEach(function(a){
      window.__G.set('diast_algoritmo', a);
      out[a] = { diast: window.__G.diastolica(),
                 inf: window.__G.informe('estandar') };
    });
    /* Y la rama de FIBRILACION AURICULAR de BSE 2024, que es un cuarto camino de salida de
       calcDiastol y no se alcanza por el desplegable solo. */
    window.__G.set('diast_algoritmo','bse2024');
    window.__G.set('diast_ritmo','fa');
    out.bse2024_fa = { diast: window.__G.diastolica(), inf: window.__G.informe('estandar') };
    window.__G.set('diast_ritmo','sinusal');
    return JSON.stringify(out);
  })()`));

  /* MAQUETACION a 1200, 390 y 360 px. El aviso de la parte B tiene que caber sin cortarse y sin
     mover el campo «Ritmo» de al lado, que son las condiciones 1 y 2 de Maicol. Se mide con el
     protocolo NO recomendado puesto, que es el unico estado en el que el aviso existe. */
  const layout = {};
  for (const w of [1200, 390, 360]) {
    await cdp.send('Emulation.setDeviceMetricsOverride',
      { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 500 }, sessionId);
    await new Promise((r) => setTimeout(r, 400));
    layout['w' + w] = JSON.parse(await ev(`(function(){
      var out = {};
      window.__G.set('diast_algoritmo','ase2025');
      out.conRecomendado = { diast: window.__G.diastolica(), layout: window.__G.layout() };
      window.__G.set('diast_algoritmo','ase2016');
      out.conOtro = { diast: window.__G.diastolica(), layout: window.__G.layout() };
      window.__G.set('diast_algoritmo','ase2025');
      return JSON.stringify(out);
    })()`));
  }
  await cdp.send('Emulation.clearDeviceMetricsOverride', {}, sessionId);

  const despues = await md5(join(RAIZ, 'index.html'));

  console.log(JSON.stringify({
    archivo: FARG, md5_index_antes: antes, md5_index_despues: despues,
    index_intacto: antes === despues,
    listo, superficies, protocolos, layout,
  }, null, 2));

  /* ⚠️ Cerrar el servidor Y salir a mano: cdp.close() + proc.kill() no alcanzan —el servidor HTTP
     sigue escuchando y el event loop vivo—, se juntan zombies reteniendo su Chrome y un A/B
     encadenado nunca llega al segundo lado. Parece lentitud, es un cuelgue. */
  cdp.close(); proc.kill(); srv.close();
  try { await rm(perfil, { recursive: true, force: true }); } catch {}
  process.exit(0);
}

main().catch((e) => { console.error('FALLO:', e.message); process.exit(1); });
