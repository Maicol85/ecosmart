#!/usr/bin/env node
/**
 * _probe_p37b.mjs - sonda de la PARTE B de PANT-37 (2026-11-11): el panel, el calculo, la
 * tabla, las graficas y el dibujo 2D.
 * Mide: que el panel abra DEBAJO de la tarjeta y sin tapar el dibujo; la primera linea exacta
 * por situacion; los valores iniciales = lo medido; el TOPE del volumen sistolico; la ley del
 * cuadrado (al duplicar el flujo el gradiente se cuadruplica y la Vmax se duplica); la tabla y
 * el pie exactos; la linea de lectura; las graficas sin negros; el dibujo con su chip, su
 * amplitud y su duracion; y que cerrar, «Volver a lo medido» y «Nuevo estudio» lo restituyan.
 * Control negativo: con el panel abierto NINGUNA tarjeta, NINGUN campo y NINGUN grado cambian.
 *
 * ⚠️ Sin acentos graves dentro del template, tampoco en sus comentarios.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';

const CAND = [process.env.PW, process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'].filter(Boolean);
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default || (await import(c)); break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }

const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml' };
const raiz = dirname(FILE), nom = FILE.slice(raiz.length + 1);
const { srv, port } = await new Promise(res => {
  const s = createServer(async (req, rq) => {
    try {
      const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || nom;
      const p = join(raiz, rel);
      if (!p.startsWith(raiz)) { rq.writeHead(403).end(); return; }
      rq.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }).end(await readFile(p));
    } catch { rq.writeHead(404).end('no'); }
  });
  s.listen(0, '127.0.0.1', () => res({ srv: s, port: s.address().port }));
});
const URL0 = 'http://127.0.0.1:' + port + '/' + nom;

const MEDIR = `(async () => {
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const o = {};
  const N = s => String(s == null ? '' : s).replace(/[\\s\\u00a0]+/g, ' ').trim();
  const EL = id => document.getElementById(id);
  try { localStorage.setItem('ett_theme', 'dark'); if (typeof loadTheme === 'function') loadTheme(); } catch (e) {}
  try { sessionStorage.setItem('ett_auth', '1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  const lo = EL('login-overlay'); if (lo) lo.style.display = 'none';
  const poner = (id, val) => { const e = EL(id); if (!e) return false; e.value = String(val);
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return true; };
  const rgb = s => (String(s).match(/\\d+/g) || []).map(Number);
  const esNegro = s => { const c = rgb(s); return c.length >= 3 && c[0] === 0 && c[1] === 0 && c[2] === 0; };

  try { showTab('paciente'); } catch (e) {}
  poner('peso', 70); poner('talla', 170); poner('edad', 72);
  { const e = EL('sexo'); e.value = 'M'; e.dispatchEvent(new Event('change', { bubbles: true })); }
  try { showTab('valvulas'); } catch (e) {}
  await esp(300);
  try { if (typeof pillOn === 'function' && pillOn('aortica', 'esten') !== true) toggleValvPill('aortica', 'esten'); } catch (e) {}
  const DISC = { diam_tsvi: 20, itv_tsvi: 20, itv_ao: 78.5, vmax_ao: 3.2, gmedio_ao: 25,
                 vdfvi: 120, fevi: 45, ao_fc: 65, tango_te: 300 };
  for (const id in DISC) poner(id, DISC[id]);
  await esp(450);
  try { if (!v2dVisible()) v2dAbrir(); } catch (e) {}
  await esp(350);

  /* ── el dibujo REAL, antes de abrir el panel: el denominador del control ── */
  const dib = () => { const g = EL('v2d-cr'); const ou = EL('v2d-out');
    return { cr: g ? String(g.getAttribute('d') || '').slice(0, 90) : null,
             out: ou ? String(ou.getAttribute('d') || '').slice(0, 90) : null }; };
  const fijar = () => { try { v2dFase(0.25) } catch (e) {} };
  fijar(); const dib0 = dib();
  const tarj0 = N(EL('v2d-esten') ? EL('v2d-esten').textContent : '');
  const cav0 = N(EL('v2d-cav-tabla') ? EL('v2d-cav-tabla').textContent : '');
  const campos0 = ['vmax_ao','gmedio_ao','ava_cont','vdfvi','fevi','ao_fc','tango_te','ea_grado']
    .map(id => (EL(id) ? EL(id).value : '?')).join('|');
  const grado0 = (function(){ try { const R = eaGradoCalculado(); return [R.grado, R.gVel, R.gGrad, R.gAva].join('/') } catch (e) { return 'ERR' } })();

  /* ── abrir ── */
  const bt = EL('wi-btn'); bt.click(); await esp(420);
  const pan = EL('wi-panel'), lid = bt.closest('li'), dibEl = EL('v2d-dibujo');
  const rp = pan.getBoundingClientRect(), rl = lid.getBoundingClientRect(), rd = dibEl.getBoundingClientRect();
  const inter = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
                        * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
  o.abierto = {
    visible: !pan.classList.contains('wi-oculto'),
    ancho: Math.round(rp.width), alto: Math.round(rp.height),
    debajoDeLaTarjeta: Math.round(rp.top - rl.bottom),
    /* La posicion SIN acotar: el transform que _wiAcotar escribe es lo unico que la mueve. */
    desplazadoPorElAcote: pan.style.transform || '(ninguno)',
    debajoSinAcotar: (function(){ const t = pan.style.transform; pan.style.transform = '';
      const r = pan.getBoundingClientRect(); const d = Math.round(r.top - rl.bottom);
      const tapa = Math.round(inter(r, rd)); pan.style.transform = t; return d + ' px, tapa ' + tapa; })(),
    tapaElDibujo: Math.round(inter(rp, rd)),
    dentroDePantalla: rp.left >= -1 && rp.top >= -1 && rp.right <= innerWidth + 1 && rp.bottom <= innerHeight + 1,
    ariaBoton: bt.getAttribute('aria-expanded'),
    chip: !!EL('wi-chip') && !EL('wi-chip').classList.contains('wi-oculto'),
    chipTxt: N(EL('wi-chip').textContent),
    scrollPagina: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth)
  };
  const lea = () => ({
    sit: N(EL('wi-sit').textContent),
    l1: N(EL('wi-l1').textContent), o1: N(EL('wi-o1').textContent), o2: N(EL('wi-o2').textContent),
    r1: EL('wi-r1') ? [EL('wi-r1').min, EL('wi-r1').value, EL('wi-r1').max].join('/') : null,
    r2: EL('wi-r2') ? [EL('wi-r2').min, EL('wi-r2').value, EL('wi-r2').max].join('/') : null,
    modo: EL('wi-mv-vs').classList.contains('btn-primary') ? 'vs'
        : (EL('wi-mv-fe').classList.contains('btn-primary') ? 'fe' : '?'),
    tabla: Array.prototype.slice.call(EL('wi-tb').children).map(tr =>
      Array.prototype.slice.call(tr.children).map(td => N(td.textContent)).join(' = ')),
    lee: N(EL('wi-lee').textContent), fn: N(EL('wi-fn').textContent), cap: N(EL('wi-cap').textContent),
    gt1: N(EL('wi-gt1').textContent), gt2: N(EL('wi-gt2').textContent),
    sup: !EL('wi-fila-sup').classList.contains('wi-oculto'),
    C: (function(){ try { const c = wiCuenta(); return { q0: Math.round(c.q0), q1: Math.round(c.q1),
        g0: c.g0, g1: Math.round(c.g1 * 100) / 100, v0: c.v0, v1: Math.round(c.v1 * 1000) / 1000,
        a0: c.a0, a1: c.a1, vsMax: c.vsMax, vs0: Math.round(c.vs0), vs1: Math.round(c.vs1),
        fevi0: Math.round(c.fevi0), fevi1: Math.round(c.fevi1), fc1: c.fc1 } } catch (e) { return 'ERR ' + e.message } })()
  });
  o.inicial = lea();

  /* ── la ley del cuadrado: duplicar el flujo ──
     OJO: el modo por omision aca es FEVI -la capsula dice que esta reducida-, asi que el
     deslizador esta en PORCIENTO. Para duplicar el VOLUMEN hay que pasar al modo de volumen
     sistolico primero: puesto en 108 sobre un deslizador de FEVI, el valor se acota a 98 y el
     flujo NO se duplica -- la primera corrida midio eso y la ley daba 4,74 en vez de 4. */
  EL('wi-mv-vs').click(); await esp(200);
  o.modoVS = { modo: EL('wi-mv-vs').classList.contains('btn-primary') ? 'vs' : '?',
               r1: [EL('wi-r1').min, EL('wi-r1').value, EL('wi-r1').max].join('/'),
               l1: N(EL('wi-l1').textContent) };
  const r1 = EL('wi-r1');
  r1.value = String(Math.round(Number(o.inicial.C.vs0) * 2));
  r1.dispatchEvent(new Event('input', { bubbles: true }));
  await esp(260);
  o.doble = lea();
  o.ley = { gxCuatro: Math.round(o.doble.C.g1 / o.inicial.C.g0 * 1000) / 1000,
            vxDos: Math.round(o.doble.C.v1 / o.inicial.C.v0 * 1000) / 1000,
            qxDos: Math.round(o.doble.C.q1 / o.inicial.C.q0 * 1000) / 1000,
            avaIgual: o.doble.C.a1 === o.inicial.C.a0 };

  /* ── el TOPE ── */
  r1.value = '9999'; r1.dispatchEvent(new Event('input', { bubbles: true })); await esp(240);
  o.tope = { valor: Number(r1.value), max: Number(r1.max), vdf: 120,
             vs1: lea().C.vs1, nuncaPasaElVdf: lea().C.vs1 <= 120 };

  /* ── el dibujo simulado ── */
  fijar(); const dib1 = dib();
  o.dibujo = { cambio: dib1.cr !== dib0.cr || dib1.out !== dib0.out,
               puesto: (typeof v2dWhatIfPuesto === 'function') ? v2dWhatIfPuesto() : null,
               vmaxLbl: N(EL('wi-dib-vmax').textContent),
               vmaxVis: !EL('wi-dib-vmax').classList.contains('wi-oculto') };
  /* la frecuencia mueve la duracion del ciclo */
  const r2 = EL('wi-r2'); const dur0 = (function(){ try { return null } catch (e) { return null } })();
  r2.value = '110'; r2.dispatchEvent(new Event('input', { bubbles: true })); await esp(200);
  o.fc110 = { o2: N(EL('wi-o2').textContent), lee: N(EL('wi-lee').textContent) };

  /* ── las graficas ── */
  const gr = ['wi-ch1', 'wi-ch2'].map(id => { const sv = EL(id);
    const ns = Array.prototype.slice.call(sv.querySelectorAll('*'));
    return { nodos: ns.length, polilineas: sv.querySelectorAll('polyline').length,
             circulos: sv.querySelectorAll('circle').length,
             negros: ns.filter(e => { const a = e.getAttribute('stroke') || e.getAttribute('fill') || '';
               return /^#000|^black$|rgb\\(0, *0, *0\\)/.test(a) }).length,
             conVar: ns.filter(e => /var\\(/.test(String(e.getAttribute('fill') || '') + String(e.getAttribute('stroke') || ''))).length,
             ancho: Math.round(sv.getBoundingClientRect().width) }; });
  o.graficas = gr;

  /* ── control: nada cambio mientras el panel estuvo abierto ── */
  o.control = {
    tarjetasIguales: N(EL('v2d-esten').textContent) === tarj0,
    cavIguales: N(EL('v2d-cav-tabla').textContent) === cav0,
    camposIguales: ['vmax_ao','gmedio_ao','ava_cont','vdfvi','fevi','ao_fc','tango_te','ea_grado']
      .map(id => (EL(id) ? EL(id).value : '?')).join('|') === campos0,
    gradoIgual: (function(){ try { const R = eaGradoCalculado(); return [R.grado, R.gVel, R.gGrad, R.gAva].join('/') === grado0 } catch (e) { return 'ERR' } })()
  };

  /* ── volver a lo medido ── */
  EL('wi-reset').click(); await esp(260);
  o.reset = { r1: EL('wi-r1').value, r2: EL('wi-r2').value, vs1: lea().C.vs1 };
  fijar(); const dibR = dib();
  o.reset.dibujoIgualAlReal = dibR.cr === dib0.cr && dibR.out === dib0.out;

  /* ── arrastre, con raton y con toque ── */
  const hd = EL('wi-hd');
  const arrastrar = (tipo, dx, dy) => {
    const r = hd.getBoundingClientRect();
    const x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
    const ev = (t, x, y) => hd.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true,
      clientX: x, clientY: y, pointerId: 1, pointerType: tipo, isPrimary: true, buttons: 1 }));
    ev('pointerdown', x0, y0); ev('pointermove', x0 + dx, y0 + dy); ev('pointerup', x0 + dx, y0 + dy);
  };
  const antes = EL('wi-panel').getBoundingClientRect();
  arrastrar('mouse', 60, 40); await esp(120);
  const trasRaton = EL('wi-panel').getBoundingClientRect();
  arrastrar('touch', -40, -30); await esp(120);
  const trasToque = EL('wi-panel').getBoundingClientRect();
  arrastrar('mouse', 4000, 4000); await esp(160);
  const trasFuera = EL('wi-panel').getBoundingClientRect();
  o.arrastre = {
    raton: Math.round(trasRaton.left - antes.left) + ',' + Math.round(trasRaton.top - antes.top),
    toque: Math.round(trasToque.left - trasRaton.left) + ',' + Math.round(trasToque.top - trasRaton.top),
    seSaleTrasTirarAfuera: !(trasFuera.left >= -1 && trasFuera.top >= -1
      && trasFuera.right <= innerWidth + 1 && trasFuera.bottom <= innerHeight + 1),
    transform: EL('wi-panel').style.transform
  };

  /* ── cerrar ── */
  EL('wi-cerrar').click(); await esp(260);
  fijar(); const dibC = dib();
  o.cerrado = { oculto: EL('wi-panel').classList.contains('wi-oculto'),
                chipOculto: EL('wi-chip').classList.contains('wi-oculto'),
                vmaxOculto: EL('wi-dib-vmax').classList.contains('wi-oculto'),
                puesto: (typeof v2dWhatIfPuesto === 'function') ? v2dWhatIfPuesto() : null,
                dibujoIgualAlReal: dibC.cr === dib0.cr && dibC.out === dib0.out,
                transform: EL('wi-panel').style.transform,
                aria: EL('wi-btn') ? EL('wi-btn').getAttribute('aria-expanded') : null };

  /* ── «Nuevo estudio» con el panel abierto ── */
  EL('wi-btn').click(); await esp(300);
  const abierto2 = !EL('wi-panel').classList.contains('wi-oculto');
  try { limpiarCampos(true); } catch (e) {}
  await esp(500);
  o.nuevoEstudio = { estabaAbierto: abierto2,
                     cerrado: EL('wi-panel').classList.contains('wi-oculto'),
                     puesto: (typeof v2dWhatIfPuesto === 'function') ? v2dWhatIfPuesto() : null,
                     etSup: EL('wi-et') ? EL('wi-et').value : null,
                     fcSup: EL('wi-fc') ? EL('wi-fc').value : null };
  /* ── los dos SUPUESTOS: aparecen solo si el estudio no los trae, y NO se guardan ── */
  for (const id in DISC) poner(id, DISC[id]);
  poner('tango_te', ''); poner('ao_fc', '');
  await esp(450);
  try { if (typeof pillOn === 'function' && pillOn('aortica', 'esten') !== true) toggleValvPill('aortica', 'esten'); } catch (e) {}
  try { if (!v2dVisible()) v2dAbrir(); } catch (e) {}
  await esp(350);
  EL('wi-btn').click(); await esp(400);
  const et = EL('wi-et'), fc = EL('wi-fc');
  o.supuestos = {
    filaVisible: !EL('wi-fila-sup').classList.contains('wi-oculto'),
    etVis: !et.parentNode.classList.contains('wi-oculto'), etVal: et.value,
    fcVis: !fc.parentNode.classList.contains('wi-oculto'), fcVal: fc.value,
    marcas: Array.prototype.slice.call(document.querySelectorAll('#wi-fila-sup .wi-sup-m')).map(x => N(x.textContent)),
    flujo: (function(){ try { return Math.round(wiCuenta().q0) } catch (e) { return 'ERR' } })()
  };
  /* editar el supuesto mueve el flujo y NO toca ningun campo del estudio */
  et.value = '400'; et.dispatchEvent(new Event('input', { bubbles: true })); await esp(240);
  o.supuestos.tras400 = (function(){ try { return Math.round(wiCuenta().q0) } catch (e) { return 'ERR' } })();
  o.supuestos.campoTangoSigueVacio = EL('tango_te').value === '';
  o.supuestos.campoFcSigueVacio = EL('ao_fc').value === '';
  /* fuera del censo del estudio y del Excel, por las DOS listas */
  o.supuestos.fueraDelCenso = ['wi-et', 'wi-fc', 'wi-r1', 'wi-r2'].map(id => {
    let a = null, b = null;
    try { a = (typeof _noEsDelEstudio === 'function') ? _noEsDelEstudio(id) : 'SIN FN' } catch (e) { a = 'ERR' }
    try { b = (typeof _CAMPOS_FUERA_DEL_ESTUDIO !== 'undefined') ? _CAMPOS_FUERA_DEL_ESTUDIO.test(id) : 'SIN RE' } catch (e) { b = 'ERR' }
    return id + ':' + a + '/' + b; }).join(' ');
  return o;
})()`;

const nav = await _pw.chromium.launch({ channel: 'chrome' });
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const pg = await ctx.newPage();
const errs = [];
pg.on('console', x => { if (x.type() === 'error') errs.push('consola: ' + x.text().slice(0, 140)) });
pg.on('pageerror', e => errs.push('pagina: ' + String(e.message).slice(0, 140)));
let out;
try {
  await pg.goto(URL0, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(2600);
  out = await pg.evaluate(MEDIR);
} catch (e) { out = { error: String(e).slice(0, 400) }; }
out.errores = errs;
console.log(JSON.stringify(out, null, 1));
await ctx.close(); await nav.close(); srv.close();
