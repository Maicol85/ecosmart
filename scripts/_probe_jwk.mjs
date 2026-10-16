#!/usr/bin/env node
/**
 * _probe_jwk.mjs — sonda A/B de SOLO LECTURA del PANEL DE FRASES (tanda «J», commit 4).
 *
 * Mide la DISPOSICION en los DOS motores, que es lo que la orden pide:
 *   frases — con el panel cerrado y abierto, a 1200x700, 1440x800, 1920x1080, 768x1024,
 *            390x844 y 360x800, con POCAS y con MUCHAS frases, en los dos temas:
 *            el ancho del informe y del EN SUMA, la caja de la columna, si su alto va del
 *            borde superior del informe al inferior del EN SUMA, el desplazamiento propio,
 *            el alto de la pagina, el cursor al insertar y 20 ciclos de apertura.
 *
 *   node scripts/_probe_jwk.mjs --file /tmp/index.HEAD.html > /tmp/jwk.HEAD.json
 *   node scripts/_probe_jwk.mjs                             > /tmp/jwk.NEW.json
 *
 * Infraestructura (servidor, resolucion de Playwright por ruta) calcada de _probe_y1c.mjs:
 * hay que medir en dos motores y cdp.mjs solo habla con Chrome. WebKit de Playwright NO es
 * Safari, y se declara.
 *
 * ⚠️ Sin acentos graves dentro del template de la sonda, tampoco en sus comentarios.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { createHash } from 'node:crypto';

const CANDIDATAS = ['/tmp/node_modules/playwright/index.js',
                    '/usr/local/lib/node_modules/playwright/index.js',
                    process.env.HOME + '/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CANDIDATAS) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) {
  console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CANDIDATAS,
    comoInstalar: 'mkdir -p /tmp/pw && cd /tmp/pw && npm i playwright && npx playwright install webkit' }, null, 1));
  process.exit(2);
}
const { chromium, webkit } = _pw;

const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const ARCH = arg('--file');
const MOTOR = arg('--motor');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const srv = createServer(async (req, rq) => {
  try {
    const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html';
    const p = (rel === 'index.html' && ARCH) ? ARCH : join(RAIZ, rel);
    rq.writeHead(200, { 'Content-Type': MIME[extname(rel)] || 'application/octet-stream' }).end(await readFile(p));
  } catch { rq.writeHead(404).end('no'); }
});
await new Promise(r => srv.listen(0, '127.0.0.1', r));
const PORT = srv.address().port;

const out = { arbol: ARCH || 'VIVO', md5: null, motores: {}, abortos: [] };
out.md5 = createHash('md5').update(await readFile(ARCH || join(RAIZ, 'index.html'))).digest('hex');

const SONDA = `window.__F = {
  despejar() { var n = 0;
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (m && getComputedStyle(m).display !== 'none') { m.style.display = 'none'; n++ } });
    return n },

  R(sel) { var e = sel.charAt(0) === '#' ? document.getElementById(sel.slice(1)) : document.querySelector(sel);
    if (!e) return 'NO EXISTE ' + sel;
    var r = e.getBoundingClientRect(), c = getComputedStyle(e);
    return { x:Math.round(r.left), w:Math.round(r.width), h:Math.round(r.height),
             top:Math.round(r.top), bottom:Math.round(r.bottom),
             pos:c.position, disp:c.display, ov:c.overflowY,
             sh:e.scrollHeight, ch:e.clientHeight, bg:c.backgroundColor } },

  cards() {
    var ta = document.getElementById('informe_texto'), su = document.getElementById('en_suma');
    var ci = (ta && ta.closest) ? ta.closest('.card') : null;
    var cs = (su && su.closest) ? su.closest('.card') : null;
    var rc = function(e){ if (!e) return 'NO EXISTE';
      var r = e.getBoundingClientRect();
      return { x:Math.round(r.left), w:Math.round(r.width),
               top:Math.round(r.top), bottom:Math.round(r.bottom) } };
    return { informe: rc(ci), suma: rc(cs) } },

  geo() {
    var c = window.__F.cards(), p = window.__F.R('#frases-panel');
    /* La condicion de la orden: el alto de la columna va del borde SUPERIOR del informe al
       INFERIOR del EN SUMA. Se mide la diferencia, con un pixel de tolerancia. */
    var cuadra = 'N/A';
    if (p && p.top !== undefined && c.informe !== 'NO EXISTE' && c.suma !== 'NO EXISTE')
      cuadra = { dTop: p.top - c.informe.top, dBottom: p.bottom - c.suma.bottom };
    return { informe: window.__F.R('#informe_texto'), suma: window.__F.R('#en_suma'),
             panel: p, slot: window.__F.R('#frases-slot'), cols: window.__F.R('#inf-cols'),
             izq: window.__F.R('#inf-cols-izq'), cards: c, cuadra: cuadra,
             btn: (function(){ var b = document.getElementById('frases-btn');
               return b ? { exp:b.getAttribute('aria-expanded'), ctrl:b.getAttribute('aria-controls'),
                            bg:getComputedStyle(b).backgroundColor } : 'NO EXISTE' })(),
             aside: (function(){ var a = document.getElementById('frases-panel');
               return a ? { tag:a.tagName, nombre:a.getAttribute('aria-label') } : 'NO EXISTE' })(),
             pagina: { sh: document.documentElement.scrollHeight, ch: document.documentElement.clientHeight },
             nodos: document.getElementsByTagName('*').length,
             claro: document.documentElement.classList.contains('light-mode') } },

  sembrar(n) { try {
    var a = [];
    for (var i = 0; i < n; i++) a.push('Frase de prueba numero ' + (i + 1) + ' con texto suficiente para ocupar dos renglones del panel de frases.');
    localStorage.setItem('ecosmart_frases', JSON.stringify(a));
    if (typeof frasesRender === 'function') frasesRender();
    var l = document.getElementById('frases-lista');
    return { pedidas: n, enLista: l ? l.childElementCount : 'NO EXISTE' } } catch (e) { return { err:String(e && e.message) } } },
  limpiarFrases() { try { localStorage.removeItem('ecosmart_frases');
    if (typeof frasesRender === 'function') frasesRender(); return 1 } catch (e) { return 'EXC' } },

  abrir() { try { if (typeof frasesToggle === 'function') frasesToggle(); return 1 } catch (e) { return 'EXC ' + e.message } },
  cerrar() { try { if (typeof frasesCerrar === 'function') frasesCerrar(); return 1 } catch (e) { return 'EXC ' + e.message } },
  tema(claro) { document.documentElement.classList.toggle('light-mode', !!claro);
    return document.documentElement.classList.contains('light-mode') === !!claro },
  verInforme() { try { if (typeof showTab === 'function') showTab('informe'); return 1 } catch (e) { return 'EXC' } },

  /* El cursor y el texto escrito: lo unico de la insercion que la orden congela. */
  insertar(taId, pos, previo) {
    var ta = document.getElementById(taId);
    if (!ta) return { err:'NO EXISTE ' + taId };
    ta.value = previo; ta.focus(); ta.setSelectionRange(pos, pos);
    ta.dispatchEvent(new Event('select', { bubbles:true }));
    var b = document.querySelector('.frases-lista .frase-txt');
    if (!b) return { err:'NO HAY FRASE EN LA LISTA' };
    var antes = ta.value;
    b.click();
    /* ⚠️ EL TEXTO PREVIO QUEDA PARTIDO EN EL PUNTO DEL CURSOR, que es exactamente lo que tiene
       que pasar: insertar en el cursor mete la frase ENTRE las dos mitades. Buscar el previo
       entero da falso —la primera version informo «se perdio el texto del medico» sobre una
       insercion perfecta— asi que se comprueban LAS DOS MITADES por separado. */
    var izq = previo.slice(0, pos), der = previo.slice(pos);
    return { valor: ta.value.slice(0, 70), sel: ta.selectionStart,
             conservaIzq: ta.value.indexOf(izq) === 0,
             conservaDer: der.length ? ta.value.indexOf(der) > pos : true,
             conservaTodo: ta.value.indexOf(izq) === 0 && (!der.length || ta.value.indexOf(der) > pos),
             crecio: ta.value.length > antes.length,
             entroDondeEstaba: ta.value.indexOf('Frase de prueba') === pos } },

  ciclos(n) { var n0 = document.getElementsByTagName('*').length;
    for (var i = 0; i < n; i++) { window.__F.abrir(); window.__F.cerrar() }
    var p = document.getElementById('frases-panel'), s = document.getElementById('frases-slot');
    return { nodos0:n0, nodos1:document.getElementsByTagName('*').length,
             panelCerrado: p ? p.hidden === true : 'NO EXISTE',
             slotCerrado: s ? s.hidden === true : 'NO EXISTE',
             exp: (document.getElementById('frases-btn') || {}).getAttribute
                    ? document.getElementById('frases-btn').getAttribute('aria-expanded') : '?' } },

  /* ⚠️ UNA PAGINA NUEVA ES UNA RECARGA, y asi se mide que la eleccion de identificacion NO se
     persiste. Por CDP, Page.reload sobre un target atachado no devolvia el contexto en 60 s
     —medido—, y Playwright abre un contexto nuevo por escena, que es el mismo hecho medido por
     el camino limpio: si al abrir la app la eleccion no es el DOCUMENTO, se persistio en algun
     lado. Se informan ademas las claves de almacenamiento que la nombren. */
  identInicial() {
    var e = 'SIN FN';
    try { if (typeof pacIdElegido === 'function') e = pacIdElegido() } catch (x) { e = 'EXC' }
    var h = document.getElementById('pac_id_print');
    var ks = [];
    try { for (var i = 0; i < localStorage.length; i++) ks.push(localStorage.key(i)) } catch (x) {}
    var ss = [];
    try { for (var j = 0; j < sessionStorage.length; j++) ss.push(sessionStorage.key(j)) } catch (x) {}
    return { elegido: e, oculto: h ? h.value : 'NO EXISTE',
             mkCi: (document.getElementById('pac-id-mk-ci') || {}).getAttribute
                     ? document.getElementById('pac-id-mk-ci').getAttribute('aria-pressed') : 'NO EXISTE',
             clavesQueLaNombran: ks.concat(ss).filter(function(k){ return /pac_id|pacid/i.test(k) }) } },

  listo() { var faltan = ['frasesToggle','frasesCerrar','showTab','limpiarCampos']
      .filter(function(f){ return typeof window[f] !== 'function' });
    return faltan.length ? { listo:false, faltan:faltan } : { listo:true } }
};
'OK';
`;

const ANCHOS = [[1200, 700], [1440, 800], [1920, 1080], [768, 1024], [390, 844], [360, 800]];

/* ⚠️ CHROMIUM VA POR EL CANAL DEL SISTEMA (`channel:chrome`) y no por el binario que trae
   Playwright: la copia instalada en /tmp espera chromium_headless_shell-1248 y en el cache hay
   el -1234, asi que su propio chromium no arranca. El Chrome del sistema es ademas el que usa
   el resto de la verificacion de este repo (155.0). WebKit si usa el binario de Playwright
   (27.2), y hay que decir que WebKit de Playwright NO ES SAFARI. */
async function medir(nombre, lanzador) {
  const nav = await lanzador.launch(nombre === 'chromium'
    ? { headless: true, channel: 'chrome' } : { headless: true });
  const g = {};
  try {
    for (const [w, h] of ANCHOS) {
      const ctx = await nav.newContext({ viewport: { width: w, height: h } });
      const pg = await ctx.newPage();
      await pg.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: 'load', timeout: 120000 });
      await pg.waitForFunction('typeof frasesToggle === "function"', { timeout: 120000 });
      await pg.evaluate(SONDA);
      const l = await pg.evaluate('JSON.stringify(window.__F.listo())');
      if (!JSON.parse(l).listo) { g[`${w}x${h}`] = { ABORTO: 'NO CARGO ' + l }; await ctx.close(); continue; }
      await pg.evaluate('window.__F.despejar()');
      /* ANTES de tocar nada: el estado de arranque de la identificacion en una pagina nueva. */
      const ini = JSON.parse(await pg.evaluate('JSON.stringify(window.__F.identInicial())'));
      await pg.evaluate('window.__F.verInforme()');
      await pg.waitForTimeout(220);
      const esc = {};
      for (const claro of [false, true]) {
        await pg.evaluate(`window.__F.tema(${claro})`);
        const t = claro ? 'claro' : 'oscuro';
        await pg.evaluate('window.__F.limpiarFrases()');
        await pg.evaluate('window.__F.cerrar()');
        await pg.waitForTimeout(160);
        esc[t + ' / cerrado'] = JSON.parse(await pg.evaluate('JSON.stringify(window.__F.geo())'));
        esc[t + ' / sembrar3'] = JSON.parse(await pg.evaluate('JSON.stringify(window.__F.sembrar(3))'));
        await pg.evaluate('window.__F.abrir()');
        await pg.waitForTimeout(200);
        esc[t + ' / abierto pocas'] = JSON.parse(await pg.evaluate('JSON.stringify(window.__F.geo())'));
        esc[t + ' / sembrar40'] = JSON.parse(await pg.evaluate('JSON.stringify(window.__F.sembrar(40))'));
        await pg.waitForTimeout(200);
        esc[t + ' / abierto muchas'] = JSON.parse(await pg.evaluate('JSON.stringify(window.__F.geo())'));
        await pg.evaluate('window.__F.cerrar()');
        await pg.waitForTimeout(140);
        esc[t + ' / cerrado otra vez'] = JSON.parse(await pg.evaluate('JSON.stringify(window.__F.geo())'));
      }
      /* El cursor y los 20 ciclos se miden UNA vez por ancho, en oscuro. */
      await pg.evaluate('window.__F.tema(false)');
      await pg.evaluate('JSON.stringify(window.__F.sembrar(3))');
      await pg.evaluate('window.__F.abrir()');
      await pg.waitForTimeout(180);
      esc['cursor informe'] = JSON.parse(await pg.evaluate(
        `JSON.stringify(window.__F.insertar('informe_texto', 5, 'ABCDEFGHIJ texto del medico'))`));
      esc['cursor en_suma'] = JSON.parse(await pg.evaluate(
        `JSON.stringify(window.__F.insertar('en_suma', 3, 'ZYXWVU conclusion del medico'))`));
      esc['20 ciclos'] = JSON.parse(await pg.evaluate('JSON.stringify(window.__F.ciclos(20))'));
      esc['identificacion al arrancar'] = ini;
      await ctx.close();
      g[`${w}x${h}`] = esc;
    }
  } catch (e) { out.abortos.push(nombre + ': ' + e.message); g.ABORTO = e.message; }
  await nav.close();
  out.motores[nombre] = g;
}

if (!MOTOR || MOTOR === 'chromium') await medir('chromium', chromium);
if (!MOTOR || MOTOR === 'webkit')   await medir('webkit', webkit);

console.log(JSON.stringify(out, null, 1));
srv.close();
process.exit(0);
