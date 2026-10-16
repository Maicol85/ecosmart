#!/usr/bin/env node
/**
 * _probe_k.mjs - sonda A/B de SOLO LECTURA para la tanda «K» (2026-10-16).
 *
 * Mide: (K0a) el ARTEFACTO DEL CHORRO del 3D de la mitral de ETE; (K0b) la leyenda, el aviso
 * verde y los botones junto a la vista del cirujano; (K0c) la BRUJULA del 3D de la mitral;
 * (K1) el boton «Incluir bull's eye en PDF»; (K2) la fila de tres bloques de Contractilidad;
 * (K3) el interior del 3D del ventriculo.
 *
 * ⚠️ USA PLAYWRIGHT, como las sondas del Y1c y del Y3b: hay que medir en DOS motores —Chrome y
 * WebKit, el de Safari, que es el navegador del medico— y cdp.mjs solo habla con Chrome.
 * ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI: es el motor, con otra capa de integracion.
 * ⚠️ UNA SOLA INSTANCIA DE CADA MOTOR A LA VEZ, cerrada con browser.close(). Nada por nombre.
 * ⚠️ SALIDA PARCIAL POR GRUPO (leccion del J): cada grupo escribe su propio archivo en cuanto
 * termina, asi que una corrida larga no queda a ciegas.
 *
 *   node scripts/_probe_k.mjs --solo repro --file /tmp/index.KHEAD.html --parc /tmp/k.HEAD
 *   node scripts/_probe_k.mjs --solo barrido --motor chromium --parc /tmp/k.NEW
 *
 * Grupos (--solo a,b,c):
 *   repro    - el chorro SIN girar, en las tres vistas y los cinco angulos, por severidad.
 *   barrido  - barrido de giros: yaw -180..180, pitch -90..90, por tandas.
 *   arrastre - control: el arrastre REAL de un paso da el mismo lienzo que fijar la matriz.
 *   maqueta  - K0b: donde estan la leyenda, el aviso y los botones, abierto y cerrado.
 *   brujula  - K0c: la brujula del 3D mitral en las tres vistas, y la del ventriculo intacta.
 *   be       - K1: el boton de inclusion y el bull's eye en el PDF generado de verdad.
 *   tres     - K2: la fila de tres bloques y la tabla de colores.
 *   lv3d     - K3: el interior del 3D del ventriculo.
 *   controles- A/B: informe, EN SUMA, grados, pastillas, diastolica, HFA-PEFF, Excel.
 *   captura  - PNG por motor, tema, ancho y escena.
 *
 * ⚠️ Sin acentos graves dentro del template de la sonda, tampoco en sus comentarios.
 */
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { createHash } from 'node:crypto';

const CANDIDATAS = ['/tmp/node_modules/playwright/index.js',
                    '/usr/local/lib/node_modules/playwright/index.js',
                    process.env.HOME + '/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CANDIDATAS) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) {
  console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CANDIDATAS }, null, 1));
  process.exit(2);
}
const { chromium, webkit } = _pw;

const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const ARCH = arg('--file');
const DEST = arg('--dest');
const PARC = arg('--parc');
const MOTORES = (arg('--motor') || 'chromium').split(',').map(s => s.trim()).filter(Boolean);
const SOLO = (arg('--solo') || '').split(',').map(s => s.trim()).filter(Boolean);
const corre = (g) => !SOLO.length || SOLO.indexOf(g) > -1;

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

const out = { arbol: ARCH || 'VIVO', md5: null, grupos: {}, abortos: [] };
out.md5 = createHash('md5').update(await readFile(ARCH || join(RAIZ, 'index.html'))).digest('hex');

/* Salida parcial: en cuanto un grupo termina se escribe su archivo. */
async function parcial(nom, dato) {
  if (!PARC) return;
  try { await writeFile(PARC + '.' + nom + '.json', JSON.stringify(dato, null, 1)) } catch (e) {}
  process.stderr.write('[parcial] ' + nom + '\n');
}

const SONDA = `window.__P = {
  despejar() { var n = 0;
    ['modalAvisoEco','login-overlay'].forEach(function(id){
      var m = document.getElementById(id);
      if (m && getComputedStyle(m).display !== 'none') { m.style.display = 'none'; n++; }
    });
    return n },
  fn(n) { return typeof window[n] === 'function' },
  rect(sel) { var e = document.querySelector(sel); if (!e) return null;
    var r = e.getBoundingClientRect();
    return { w:+r.width.toFixed(2), h:+r.height.toFixed(2), x:+r.left.toFixed(2), y:+r.top.toFixed(2) } },
  txt(sel) { var e = document.querySelector(sel); return e ? String(e.textContent||'').replace(/[ ]+/g,' ').trim() : 'NO EXISTE' },
  val(id) { var e = document.getElementById(id); return e ? String(e.value == null ? '' : e.value) : 'NO EXISTE' },
  atr(id, a) { var e = document.getElementById(id); return e ? String(e.getAttribute(a)) : 'NO EXISTE' },
  css(sel, p) { var e = document.querySelector(sel); if (!e) return 'NO EXISTE';
    return getComputedStyle(e).getPropertyValue(p) },
  tema(claro) { document.documentElement.classList.toggle('light-mode', !!claro);
    return document.documentElement.classList.contains('light-mode') === !!claro },

  ete() {
    try { if (this.fn('showTab')) showTab('ete') } catch (e) {}
    var abiertas = [];
    ['mitral','mediciones-mitral'].forEach(function(k){
      try { var s = document.getElementById('ete-seccion-' + k);
        if (s && getComputedStyle(s).display === 'none' && typeof toggleEteSeccion === 'function')
          toggleEteSeccion(k, null);
        s = document.getElementById('ete-seccion-' + k);
        if (s && getComputedStyle(s).display !== 'none') abiertas.push(k);
      } catch (e) {} });
    return abiertas },
  abrir3d() { var b = document.getElementById('m3d-btn'); if (!b) return 'SIN BOTON';
    if (!this.visible3d()) b.click();
    return this.visible3d() },
  cerrar3d() { try { if (this.fn('m3dCerrar')) m3dCerrar() } catch (e) {} return this.visible3d() },
  visible3d() { try { return this.fn('m3dVisible') ? m3dVisible() : 'SIN FN' } catch (e) { return 'EXC' } },
  camara() { try { return this.fn('m3dEstadoCamara') ? m3dEstadoCamara() : 'SIN FN' } catch (e) { return 'EXC' } },
  congelar(fase) {
    try { var c = this.camara();
      if (c && c.play === true && this.fn('m3dPlay')) m3dPlay();
      if (this.fn('m3dFaseFijar')) m3dFaseFijar(fase == null ? 0 : fase);
    } catch (e) { return 'EXC' }
    var c2 = this.camara();
    return c2 && c2.play === false },
  marcados() {
    var ids = ['m3d-v-cirujano','m3d-v-ventriculo','m3d-v-lateral',
               'm3d-a-0','m3d-a-45','m3d-a-60','m3d-a-90','m3d-a-120'];
    return ids.filter(function(i){ var e = document.getElementById(i);
      return e && e.getAttribute('aria-pressed') === 'true' }) },

  /* ══ LA CAMARA, FIJADA CON LA MISMA FORMULA DEL ARRASTRE ══════════════════════════════
     Un arrastre de UN solo movimiento (dx, dy) desde la camara R produce
     R' = Mry(dx*0.01) * Mrx(dy*0.01) * R, que es exactamente lo que hace m3dGirar. Fijar la
     camara llamando a m3dGirar con los dx/dy equivalentes recorre el MISMO camino de codigo
     que el pointermove, y el grupo «arrastre» comprueba que el lienzo sale identico. */
  girar(gradYaw, gradPitch) {
    if (!this.fn('m3dGirar')) return 'SIN FN';
    var k = (typeof M3D_GIRO_K === 'number') ? M3D_GIRO_K : 0.01;
    m3dGirar(gradYaw * Math.PI / 180 / k, gradPitch * Math.PI / 180 / k);
    return true },
  /* Repone la camara de la vista/angulo elegido SIN animacion: el barrido mide orientaciones,
     no transiciones, y una animacion a medio camino da una matriz que no es la pedida. */
  camaraPoner(vista, ang) {
    try {
      if (ang !== null && ang !== undefined) { if (this.fn('m3dAngulo')) m3dAngulo(ang); }
      else if (this.fn('m3dVista')) m3dVista(vista || 'cirujano');
    } catch (e) { return 'EXC' }
    return this.camara() },

  /* ══ EL CHORRO: componentes conexas de pixel ROJO y bordes rectos ══════════════════════
     Un pixel es «del chorro» si el rojo domina con holgura: el chorro se dibuja en
     rgba(226,75,74,a) y el cuello en rgba(120,20,20,a), y NINGUN otro elemento del dibujo es
     rojizo —las valvas van en tonos crema, naranja, azul, violeta y verde, los papilares en
     #a4635c (r=164,g=99,b=92: su cociente r/g es 1,66) y la auricula en gris—. El umbral se
     fija en r > 1.75*g y r > 1.75*b para quedar por ENCIMA del papilar, y se informa cuantos
     pixeles del papilar caerian dentro (cero por construccion). */
  chorro(umbral) {
    var cv = document.getElementById('m3d-cv');
    if (!cv || !cv.getContext) return null;
    var ctx = null; try { ctx = cv.getContext('2d') } catch (e) { return null }
    if (!ctx) return null;
    var d = null; try { d = ctx.getImageData(0, 0, cv.width, cv.height) } catch (e) { return null }
    var a = d.data, W = cv.width, H = cv.height, U = umbral || 1.75;
    var marca = new Uint8Array(W * H), n = 0, i, j, p, r, g, b, al;
    for (j = 0; j < H; j++) for (i = 0; i < W; i++) {
      p = (j * W + i) * 4; al = a[p + 3];
      if (al < 40) continue;
      r = a[p]; g = a[p + 1]; b = a[p + 2];
      if (r > 70 && r > U * (g + 1) && r > U * (b + 1)) { marca[j * W + i] = 1; n++; }
    }
    if (!n) return { W:W, H:H, pix:0, comps:[], tocaArriba:0, tocaAbajo:0, tocaIzq:0, tocaDer:0 };
    /* Componentes conexas 8-vecinos, con pila propia: una recursion de 60k pixeles revienta. */
    var vis = new Uint8Array(W * H), comps = [], pila = new Int32Array(W * H), sp, c, idx, x, y, dx2, dy2, nx, ny;
    for (j = 0; j < H; j++) for (i = 0; i < W; i++) {
      idx = j * W + i;
      if (!marca[idx] || vis[idx]) continue;
      sp = 0; pila[sp++] = idx; vis[idx] = 1;
      c = { pix:0, x0:1e9, y0:1e9, x1:-1, y1:-1, filas:{} };
      while (sp > 0) {
        idx = pila[--sp]; x = idx % W; y = (idx - x) / W;
        c.pix++;
        if (x < c.x0) c.x0 = x; if (x > c.x1) c.x1 = x;
        if (y < c.y0) c.y0 = y; if (y > c.y1) c.y1 = y;
        c.filas[y] = (c.filas[y] || 0) + 1;
        for (dy2 = -1; dy2 <= 1; dy2++) for (dx2 = -1; dx2 <= 1; dx2++) {
          nx = x + dx2; ny = y + dy2;
          if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
          var ni = ny * W + nx;
          if (marca[ni] && !vis[ni]) { vis[ni] = 1; pila[sp++] = ni; } } }
      comps.push(c);
    }
    comps.sort(function(p1, p2){ return p2.pix - p1.pix });
    /* Para cada componente: la corrida horizontal mas larga en su PRIMERA fila y en su ULTIMA,
       y si toca un borde del lienzo. Una corrida larga en el borde de la caja ES el borde recto
       horizontal que el medico describe. */
    var res = comps.slice(0, 6).map(function(c2){
      function corrida(fy) { var run = 0, mx = 0, ii;
        for (ii = 0; ii < W; ii++) { if (marca[fy * W + ii]) { run++; if (run > mx) mx = run } else run = 0 }
        return mx }
      return { pix:c2.pix, x0:c2.x0, y0:c2.y0, x1:c2.x1, y1:c2.y1,
               nFilaArr:c2.filas[c2.y0] || 0, nFilaAba:c2.filas[c2.y1] || 0,
               corridaArr: corrida(c2.y0), corridaAba: corrida(c2.y1),
               tocaBordeArr: c2.y0 === 0, tocaBordeAba: c2.y1 === H - 1,
               tocaBordeIzq: c2.x0 === 0, tocaBordeDer: c2.x1 === W - 1 } });
    var ta = 0, tb = 0, ti = 0, td = 0;
    for (i = 0; i < W; i++) { if (marca[i]) ta++; if (marca[(H - 1) * W + i]) tb++ }
    for (j = 0; j < H; j++) { if (marca[j * W]) ti++; if (marca[j * W + W - 1]) td++ }
    return { W:W, H:H, pix:n, nComps:comps.length, comps:res,
             tocaArriba:ta, tocaAbajo:tb, tocaIzq:ti, tocaDer:td };
  },
  /* Version LIVIANA: solo cuenta pixeles del chorro en los cuatro bordes del lienzo y el total.
     Sin componentes conexas, para que un barrido de miles de orientaciones sea medible. */
  chorroBordes(umbral) {
    var cv = document.getElementById('m3d-cv');
    if (!cv || !cv.getContext) return null;
    var ctx = null; try { ctx = cv.getContext('2d') } catch (e) { return null }
    if (!ctx) return null;
    var d = null; try { d = ctx.getImageData(0, 0, cv.width, cv.height) } catch (e) { return null }
    var a = d.data, W = cv.width, H = cv.height, U = umbral || 1.75;
    function es(i2, j2) { var p = (j2 * W + i2) * 4;
      if (a[p + 3] < 40) return false;
      return a[p] > 70 && a[p] > U * (a[p + 1] + 1) && a[p] > U * (a[p + 2] + 1) }
    var i, j, n = 0, ar = 0, ab = 0, iz = 0, de = 0;
    for (j = 0; j < H; j++) for (i = 0; i < W; i++) if (es(i, j)) {
      n++;
      if (j === 0) ar++; if (j === H - 1) ab++; if (i === 0) iz++; if (i === W - 1) de++ }
    return { pix:n, arr:ar, aba:ab, izq:iz, der:de, W:W, H:H } },
  /* ¿El chorro sigue PEGADO a la valvula? Se mide contra el origen que la app publica: hay al
     menos un pixel de chorro dentro de un radio de r pixeles de ese punto. Sin el hook habria
     que reconstruir la proyeccion desde afuera, o sea medir la propia reconstruccion. */
  conectado(r) {
    var o = this.origen(); if (!o || typeof o !== 'object') return { hay:false, motivo:String(o) };
    var cv = document.getElementById('m3d-cv'); if (!cv) return { hay:false, motivo:'SIN LIENZO' };
    var ctx = cv.getContext('2d'), R = r || 8;
    var x0 = Math.max(0, Math.round(o.x - R)), y0 = Math.max(0, Math.round(o.y - R));
    var w = Math.min(cv.width - x0, 2 * R + 1), h = Math.min(cv.height - y0, 2 * R + 1);
    if (w <= 0 || h <= 0) return { hay:false, motivo:'ORIGEN FUERA DEL LIENZO', x:o.x, y:o.y };
    var d = ctx.getImageData(x0, y0, w, h).data, i, n = 0;
    for (i = 0; i < d.length; i += 4) {
      if (d[i + 3] >= 40 && d[i] > 70 && d[i] > 1.75 * (d[i + 1] + 1) && d[i] > 1.75 * (d[i + 2] + 1)) n++ }
    return { hay: n > 0, n: n, x: +o.x.toFixed(1), y: +o.y.toFixed(1), len: o.len } },
  tope(v) { if (v !== null && v !== undefined) window.M3D_JET_LEN_MAX = v;
    try { if (this.fn('m3dPintar')) m3dPintar() } catch (e) {}
    return window.M3D_JET_LEN_MAX },
  origen() { try { return this.fn('m3dChorroOrigen') ? m3dChorroOrigen() : 'SIN FN' } catch (e) { return 'EXC' } },

  /* La caja de TODO lo pintado y el hash completo del lienzo. */
  pix() { var cv = document.getElementById('m3d-cv');
    if (!cv || !cv.getContext) return null;
    var ctx = null; try { ctx = cv.getContext('2d') } catch (e) { return null }
    if (!ctx) return null;
    var d = null; try { d = ctx.getImageData(0, 0, cv.width, cv.height) } catch (e) { return null }
    var a = d.data, n = a.length, h = 2166136261, i, pint = 0;
    var x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1, px, py;
    for (i = 0; i < n; i++) { h ^= a[i]; h = (h * 16777619) >>> 0; }
    for (i = 3; i < n; i += 4) {
      if (a[i] > 8) { pint++; px = ((i - 3) / 4) % cv.width; py = Math.floor(((i - 3) / 4) / cv.width);
        if (px < x0) x0 = px; if (px > x1) x1 = px; if (py < y0) y0 = py; if (py > y1) y1 = py; } }
    return { w: cv.width, h: cv.height, hash: h, pintados: pint,
             caja: pint ? { x0:x0, y0:y0, x1:x1, y1:y1,
                            margenArr:y0, margenAba:cv.height - 1 - y1 } : null } },
  scrollY() { return window.scrollY },
  docH() { return document.documentElement.scrollHeight }
};`;

const BSA = { peso: '80', talla: '180' };
/* Los datos del medico: IM severa, vena contracta 9 mm, EROA 59,4 mm2, volumen regurgitante
   53,5 ml y anillo 30 mm. La EROA y el volumen regurgitante son FILAS calculadas por PISA, asi
   que se cargan sus insumos; lo que el dibujo lee es la vena contracta y el GRADO publicado. */
const ESC = {
  medico: { campos: Object.assign({}, BSA, { im_vc: '9', ete_diam_anular: '30', ai_vol: '120',
    ai_area: '28', eroa: '59.4', volr: '53.5' }), sev: [['insuf', 'mitral', '4']] },
  severa: { campos: Object.assign({}, BSA, { im_vc: '9', ete_diam_anular: '30', ai_vol: '120',
    ai_area: '28' }), sev: [['insuf', 'mitral', '4']] },
  moderada: { campos: Object.assign({}, BSA, { im_vc: '5', ai_vol: '95' }),
    sev: [['insuf', 'mitral', '2']] },
  leve: { campos: Object.assign({}, BSA, { im_vc: '2', ai_vol: '70' }),
    sev: [['insuf', 'mitral', '1']] },
  estenosis: { campos: Object.assign({}, BSA, { avm_plan: '1.0', em_gmedio: '12', ai_vol: '110' }),
    sev: [['esten', 'mitral', 'severa']] },
  vacio: { campos: {} }
};

async function montarEscena(pg, e) {
  await pg.evaluate((e) => {
    window.__P.despejar();
    try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (x) {}
    window.__P.despejar();
    (e.selects || []).forEach(([id, v]) => { const n = document.getElementById(id); if (!n) return;
      const o = Array.prototype.slice.call(n.options || []).filter(o => o.value === v || o.text === v)[0];
      if (o) { n.value = o.value; n.dispatchEvent(new Event('change', { bubbles: true })); } });
    Object.keys(e.campos || {}).forEach(id => { const n = document.getElementById(id); if (!n) return;
      n.value = e.campos[id];
      n.dispatchEvent(new Event('input', { bubbles: true }));
      n.dispatchEvent(new Event('change', { bubbles: true })); });
    ['calcVI','calcVD','calcAI','calcIM_ESC','calcEM','calcETE','calcDiastol']
      .forEach(f => { try { window[f]() } catch (x) {} });
    (e.sev || []).forEach(([t, v, g]) => { try { valvSev.aplicar(t, v, g) } catch (x) {} });
  }, e);
  await pg.evaluate(() => window.__P.ete());
}

/* `rm` emula `prefers-reduced-motion: reduce`, y NO es cosmetico: con eso `m3dCalmo()` es true,
   `_m3dGoTo` fija la camara de una vez en vez de interpolarla 600 ms, y `m3dGirar` repinta
   sincronicamente. Es lo que hace medible un barrido de cientos de orientaciones: sin eso cada
   punto exigiria esperar la animacion y la matriz leida a medio camino no es la pedida. */
async function nuevaPagina(b, W, H, touch, rm) {
  const ctx = await b.newContext({ viewport: { width: W, height: H },
                                   hasTouch: !!touch, isMobile: false,
                                   reducedMotion: rm ? 'reduce' : 'no-preference' });
  const pg = await ctx.newPage();
  await pg.goto('http://127.0.0.1:' + PORT + '/index.html');
  await pg.evaluate(() => { try { sessionStorage.setItem('ett_auth', '1') } catch (e) {} });
  await pg.reload();
  await pg.waitForTimeout(2600);
  await pg.evaluate(SONDA);
  await pg.evaluate(() => window.__P.despejar());
  return pg;
}

async function centrar(pg, sel) {
  try { await pg.locator(sel).scrollIntoViewIfNeeded(); } catch (e) {}
  try { await pg.evaluate((s) => { const e = document.querySelector(s);
    if (e) e.scrollIntoView({ block: 'center', inline: 'center' }) }, sel) } catch (e) {}
}

const VISTAS = [['cirujano', null], ['ventriculo', null], ['lateral', null],
                ['cirujano', 0], ['cirujano', 45], ['cirujano', 60], ['cirujano', 90], ['cirujano', 120]];

for (const motor of MOTORES) {
  const b = await (motor === 'webkit' ? webkit : chromium).launch({ channel: motor === 'webkit' ? undefined : 'chrome' });
  const G = out.grupos[motor] = {};

  /* ── repro ── el chorro SIN girar, por escena y por camara ───────────────────────────── */
  if (corre('repro')) {
    const g = {};
    for (const [en, e] of Object.entries(ESC)) {
      if (en === 'vacio') continue;
      const pg = await nuevaPagina(b, 1440, 900, false, true);
      await montarEscena(pg, e);
      await pg.evaluate(() => window.__P.abrir3d());
      await pg.evaluate(() => window.__P.congelar(0));
      await pg.waitForTimeout(350);
      const sub = {};
      for (const [v, a] of VISTAS) {
        await pg.evaluate(([v, a]) => window.__P.camaraPoner(v, a), [v, a]);
        sub[a === null ? v : ('ang' + a)] = {
          ch: await pg.evaluate(() => window.__P.chorro()),
          pix: await pg.evaluate(() => window.__P.pix()),
          conex: await pg.evaluate(() => window.__P.conectado(8))
        };
      }
      g[en] = sub;
      await pg.close();
      await parcial('repro.' + motor + '.' + en, sub);
    }
    G.repro = g;
    await parcial('repro.' + motor, g);
  }

  /* ── arrastre ── control: el arrastre REAL de un paso contra la matriz fijada ─────────── */
  if (corre('arrastre')) {
    const g = {};
    const pg = await nuevaPagina(b, 1440, 900);
    await montarEscena(pg, ESC.severa);
    await pg.evaluate(() => window.__P.abrir3d());
    await pg.evaluate(() => window.__P.congelar(0));
    await centrar(pg, '#m3d-cv');
    const caja = await pg.evaluate(() => window.__P.rect('#m3d-cv'));
    for (const [gy, gp] of [[30, 15], [-45, -30], [90, 60]]) {
      /* (a) por la matriz */
      await pg.evaluate(() => window.__P.camaraPoner('cirujano', null));
      await pg.waitForTimeout(220);
      await pg.evaluate(([y, p]) => window.__P.girar(y, p), [gy, gp]);
      await pg.waitForTimeout(220);
      const A = await pg.evaluate(() => window.__P.pix());
      /* (b) por arrastre REAL de un movimiento, con la misma cantidad en pixeles */
      await pg.evaluate(() => window.__P.camaraPoner('cirujano', null));
      await pg.waitForTimeout(220);
      const cx = caja.x + caja.w / 2, cy = caja.y + caja.h / 2;
      const dx = gy * Math.PI / 180 / 0.01, dy = gp * Math.PI / 180 / 0.01;
      await pg.mouse.move(cx, cy);
      await pg.mouse.down();
      await pg.mouse.move(cx + dx, cy + dy);
      await pg.mouse.up();
      await pg.waitForTimeout(220);
      const Bb = await pg.evaluate(() => window.__P.pix());
      g[gy + '/' + gp] = { matriz: A && A.hash, arrastre: Bb && Bb.hash,
                           iguales: !!(A && Bb && A.hash === Bb.hash),
                           cajaA: A && A.caja, cajaB: Bb && Bb.caja };
    }
    await pg.close();
    G.arrastre = g;
    await parcial('arrastre.' + motor, g);
  }

  /* ── barrido ── yaw x pitch, por tandas ─────────────────────────────────────────────── */
  if (corre('barrido')) {
    const TANDAS = [
      { nom: 'severa-3vistas', esc: 'severa', cams: [['cirujano', null], ['ventriculo', null], ['lateral', null]], paso: 15 },
      { nom: 'severa-5angs',   esc: 'severa', cams: [['cirujano', 0], ['cirujano', 45], ['cirujano', 60], ['cirujano', 90], ['cirujano', 120]], paso: 30 },
      { nom: 'otras',          esc: null,     cams: [['cirujano', null]], paso: 30 }
    ];
    const g = {};
    for (const T of TANDAS) {
      const escenas = T.esc ? [T.esc] : ['medico', 'moderada', 'leve', 'estenosis'];
      for (const en of escenas) {
        const pg = await nuevaPagina(b, 1440, 900, false, true);
        await montarEscena(pg, ESC[en]);
        await pg.evaluate(() => window.__P.abrir3d());
        await pg.evaluate(() => window.__P.congelar(0));
        await pg.waitForTimeout(300);
        for (const [v, a] of T.cams) {
          const key = T.nom + '|' + en + '|' + (a === null ? v : 'ang' + a);
          const arriba = [], otros = [], sueltos = []; let n = 0, conMedidos = 0;
          for (let yy = -180; yy <= 180; yy += T.paso) {
            for (let pp = -90; pp <= 90; pp += T.paso) {
              await pg.evaluate(([v2, a2]) => window.__P.camaraPoner(v2, a2), [v, a]);
              await pg.evaluate(([y2, p2]) => window.__P.girar(y2, p2), [yy, pp]);
              const ch = await pg.evaluate(() => window.__P.chorroBordes());
              n++;
              if (!ch) continue;
              if (ch.pix > 0) { conMedidos++;
                const cx = await pg.evaluate(() => window.__P.conectado(8));
                if (!cx || !cx.hay) sueltos.push({ yaw: yy, pitch: pp, cx: cx }); }
              if (ch.arr > 0) arriba.push({ yaw: yy, pitch: pp, arr: ch.arr });
              if (ch.aba + ch.izq + ch.der > 0) otros.push({ yaw: yy, pitch: pp,
                aba: ch.aba, izq: ch.izq, der: ch.der });
            }
          }
          g[key] = { n: n, conChorro: conMedidos,
                     nBordeArriba: arriba.length, bordeArriba: arriba.slice(0, 12),
                     nOtrosBordes: otros.length, otrosBordes: otros.slice(0, 12),
                     nDesconectado: sueltos.length, desconectado: sueltos.slice(0, 6) };
          await parcial('barrido.' + motor + '.' + key.replace(/[|]/g, '_'), g[key]);
        }
        await pg.close();
      }
    }
    G.barrido = g;
    await parcial('barrido.' + motor, g);
  }


  /* ── cap0 ── PNG del LIENZO en las camaras con el defecto, para mirarlo. ─────────────── */
  if (corre('cap0') && DEST) {
    const g = {};
    for (const en of ['severa','moderada','leve']) {
      const pg = await nuevaPagina(b, 1440, 900, false, true);
      await montarEscena(pg, ESC[en]);
      await pg.evaluate(() => window.__P.abrir3d());
      await pg.evaluate(() => window.__P.congelar(0));
      for (const [v, a] of VISTAS) {
        await pg.evaluate(([v2, a2]) => window.__P.camaraPoner(v2, a2), [v, a]);
        const nom = motor + '-' + en + '-' + (a === null ? v : 'ang' + a) + '.png';
        try { await pg.locator('#m3d-cv').screenshot({ path: join(DEST, nom) }); g[nom] = 'ok' }
        catch (e) { g[nom] = String(e && e.message).slice(0, 70) }
      }
      await pg.close();
    }
    G.cap0 = g;
    await parcial('cap0.' + motor, g);
  }


  /* ── tope ── elige M3D_JET_LEN_MAX midiendo: por valor, cuantas orientaciones recortan. ── */
  if (corre('tope')) {
    const g = {};
    const pg = await nuevaPagina(b, 1440, 900, false, true);
    await montarEscena(pg, ESC.severa);
    await pg.evaluate(() => window.__P.abrir3d());
    await pg.evaluate(() => window.__P.congelar(0));
    for (const v of [4.2, 3.6, 3.2, 2.8, 2.4]) {
      let malos = 0, total = 0, peorArr = 0, peorPix = 0;
      const detalle = [];
      for (const [vi, an] of VISTAS) {
        for (let yy = -180; yy <= 180; yy += 45) {
          for (let pp = -90; pp <= 90; pp += 45) {
            await pg.evaluate(([v2, a2]) => window.__P.camaraPoner(v2, a2), [vi, an]);
            await pg.evaluate(([y2, p2]) => window.__P.girar(y2, p2), [yy, pp]);
            await pg.evaluate((x) => window.__P.tope(x), v);
            const r = await pg.evaluate(() => window.__P.chorroBordes());
            total++;
            if (!r) continue;
            if (r.pix > peorPix) peorPix = r.pix;
            const t = r.arr + r.aba + r.izq + r.der;
            if (t > 0) { malos++; if (r.arr > peorArr) peorArr = r.arr;
              if (detalle.length < 12) detalle.push({ cam: an === null ? vi : 'ang' + an, yaw: yy, pitch: pp,
                arr: r.arr, aba: r.aba, izq: r.izq, der: r.der }); }
          }
        }
      }
      g['len' + v] = { total: total, orientacionesQueRecortan: malos, peorFila0: peorArr,
                       maxPixChorro: peorPix, ejemplos: detalle };
      await parcial('tope.' + motor + '.' + v, g['len' + v]);
    }
    await pg.close();
    G.tope = g;
    await parcial('tope.' + motor, g);
  }

  await b.close();
}

await new Promise(r => srv.close(r));
console.log(JSON.stringify(out, null, 1));
process.exit(0);
