#!/usr/bin/env node
/**
 * _probe_medir4b0.mjs - MEDIR-4b, TAREA 0 (SOLO LECTURA). Mide las cinco hipotesis de la orden
 * sobre el Simpson del visor, en el navegador y por el camino real. NO toca index.html.
 *
 * ** EL CAMINO ES EL REAL. La vista B se abre con `vistaBAbrir()`, que es la puerta del medico;
 * lo unico que se sustituye es el ALMACEN (CeiboCine.listar / CeiboCine.leer) para que el
 * selector tenga algo que ofrecer, y el gesto de elegir es un clic sobre la miniatura. Los
 * trazados se hacen con el mismo triangulo isosceles de TC-190, con mousedown/mousemove/mouseup
 * sobre el canvas de medicion.
 *
 * ** QUE MIDE, hipotesis por hipotesis:
 *   H1  donde viven los trazados y si el biplano se guarda o se calcula al vuelo
 *   H2  si la ventana (A4C/A2C) se pide en cada trazado o es un control persistente
 *   H3  si el estado del Simpson es por vista, como la calibracion
 *   H4  de donde salen VFD, VFS, FEVI, los indexados y la clasificacion
 *   H5  que escribe el boton de integrar, y si medVtiDiametro/medVtiCargar tienen algo que ver
 *
 * ** Y DOS COSAS MAS, que la lectura encontro y hay que confirmar midiendo:
 *   X1  `_vBiplanoDatos` cruza `pares[0]` POR POSICION (A=4C, B=2C) e IGNORA `nombres`, asi que
 *       dos vistas que declaran la MISMA ventana igual producen un "biplano"
 *   X2  la linea base numerica, para que el bloque C pueda probar que no movio un numero
 *
 *     node scripts/_probe_medir4b0.mjs <ruta/index.html>
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const FILE = process.argv[2];
if (!FILE) { console.error('falta la ruta del index.html'); process.exit(2); }
const raiz = dirname(FILE), nom = FILE.slice(raiz.length + 1);
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css' };
const { srv, port } = await new Promise(res => {
  const s = createServer(async (req, rq) => {
    try { const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/,'') || nom;
      const p = join(raiz, rel); if (!p.startsWith(raiz)) { rq.writeHead(403).end(); return; }
      rq.writeHead(200,{'Content-Type':MIME[extname(p)]||'application/octet-stream'}).end(await readFile(p));
    } catch { rq.writeHead(404).end('no'); }
  });
  s.listen(0,'127.0.0.1',()=>res({srv:s,port:s.address().port}));
});

const nav = await _pw.chromium.launch({ channel:'chrome' });
const ctx = await nav.newContext({ viewport:{ width:1500, height:900 } });
const pg = await ctx.newPage();
const errs = []; pg.on('pageerror', e => errs.push(String(e&&e.message||e).slice(0,160)));
const cons = []; pg.on('console', m => { if (m.type()==='error') cons.push(m.text().slice(0,160)); });
const dialogos = []; pg.on('dialog', d => { dialogos.push(d.message().slice(0,200)); d.accept(); });
await pg.goto('http://127.0.0.1:'+port+'/'+nom, { waitUntil:'load', timeout:120000 });
await pg.waitForTimeout(2600);
await pg.evaluate(`(() => {
  try { sessionStorage.setItem('ett_auth','1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco==='function') cerrarAvisoEco(); } catch (e) {}
  const lo = document.getElementById('login-overlay'); if (lo) lo.style.display='none';
})()`);
await pg.waitForTimeout(200);

const out = await pg.evaluate(`(async () => {
  const o = { err:[] };
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const $ = id => document.getElementById(id);
  const txt = id => { const e = $(id); return e ? (e.textContent || '') : null; };

  /* ══ H4 (parte de codigo): QUIEN CALCULA Y QUIEN CLASIFICA ══════════════════════════════ */
  o.h4 = {
    simpVolumenML:   typeof _simpVolumenML,
    simpCalcular:    typeof _simpCalcular,
    simpMonoDeS:     typeof _simpMonoDeS,
    simpClasificar:  typeof _simpClasificar,
    feviClasificar:  typeof feviClasificar,
    getBSA:          typeof getBSA,
    vBiplanoDatos:   typeof _vBiplanoDatos,
    simpFilasTabla:  typeof _simpFilasTabla,
    /* Las categorias de FEVI que la app YA usa. El bloque C no inventa cortes: usa estas. */
    catsFEVI: (typeof FEVI_CATS !== 'undefined' && FEVI_CATS)
      ? FEVI_CATS.map(c => ({ adj:c.adj, col:c.col, min:c.min, max:c.max })) : null,
    /* La clasificacion en cuatro puntos, para fijarla en el inventario. */
    clas: (typeof _simpClasificar === 'function')
      ? [65,52,41,28].map(f => ({ fevi:f, r:_simpClasificar(f) })) : null
  };

  /* ══ H5 (parte de codigo): QUE ESCRIBE INTEGRAR, Y LAS DOS AJENAS ═══════════════════════ */
  o.h5 = {
    simpEscribirFEVI: typeof _simpEscribirFEVI,
    /* La orden las agrupa con el Simpson. Se mide si tienen algo que ver. */
    medVtiDiametro:   typeof medVtiDiametro,
    medVtiCargar:     typeof medVtiCargar,
    campoFevi:        !!$('fevi'),
    campoFeviMet:     !!$('fevi_met'),
    /* Las dos puertas que llegan a _simpEscribirFEVI, por su id. */
    fuentes: (function () {
      const s = (typeof _simpEscribirFEVI === 'function') ? String(_simpEscribirFEVI) : '';
      return { escribeFevi: s.indexOf("getElementById('fevi')") > -1,
               escribeMet:  s.indexOf("'fevi_met'") > -1,
               pregunta:    s.indexOf('confirm(') > -1 };
    })()
  };

  /* ══ H3: EL ESTADO DEL SIMPSON, ¿POR VISTA O DE MODULO? ═════════════════════════════════
     Se lee de la plantilla de vista, que es donde se declara, y se confirma que _simp es un
     accesor sobre la vista activa y no una variable propia. */
  o.h3 = (function () {
    try {
      const V = _vNueva('z-', 'Z');
      const claves = Object.keys(V);
      return {
        plantillaTieneSimp: claves.indexOf('simp') >= 0,
        plantillaTieneCalib: claves.indexOf('medCalib') >= 0,
        plantillaTieneCalibVel: claves.indexOf('medCalibVel') >= 0,
        /* Si es un accesor, el descriptor de window tiene get/set y no un value. */
        simpEsAccesor: (function () {
          const d = Object.getOwnPropertyDescriptor(window, '_simp');
          return d ? { get: typeof d.get, set: typeof d.set, tieneValue: 'value' in d } : null;
        })(),
        claves: claves
      };
    } catch (e) { o.err.push('h3: ' + e.message); return null; }
  })();

  /* ══ EL FIXTURE Y LA APERTURA, POR EL CAMINO REAL ═══════════════════════════════════════
     Dos regiones como un DICOM de verdad —2D y Doppler—, isotropicas: _simpAceptar rechaza
     los pixeles no cuadrados, asi que dx tiene que ser igual a dy o no se puede trazar nada. */
  const jpg = new Uint8Array([255,216,255,217]);
  const R2D  = { ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:600, y1:240, tipo:1 };
  const RDOP = { ux:4, uy:7, dx:0.004, dy:-0.5, ry0:420, rvy:0, x0:0, y0:250, x1:600, y1:500, tipo:2 };
  const mk = (n, c) => ({ nombre:n, cuadros:(c||1), d:{ frags:[jpg], cols:600, filas:500,
    msCuadro:40, regiones:[R2D, RDOP] } });

  try { __t && __t.limpiar && __t.limpiar(); } catch (e) {}
  try { imgVaciar(); } catch (e) {}
  try { localStorage.setItem('cfg-guardar-imagenes','0'); } catch (e) {}

  /* El peso y la talla, para que getBSA devuelva algo y los indexados se puedan medir. */
  try {
    const sv = (id, v) => { const e = $(id); if (e) { e.value = v;
      e.dispatchEvent(new Event('input', { bubbles:true })); e.dispatchEvent(new Event('change', { bubbles:true })); } };
    sv('peso', '70'); sv('talla', '170');
  } catch (e) { o.err.push('bsa: ' + e.message); }
  o.bsa = (typeof getBSA === 'function') ? getBSA() : null;

  try { _cineAbrir([mk('A4C-fix')]); } catch (e) { o.err.push('abrir: ' + e.message); return o; }
  await esp(460);
  try { if (!_vistaA.medOn) $('cine-medir').click(); } catch (e) { o.err.push('medir: ' + e.message); }
  await esp(360);

  /* ══ LAS CLAVES DE localStorage ANTES DE TRAZAR, para el control de "nada se guarda" ═════ */
  const lsAntes = (function () { const a = []; for (let i=0;i<localStorage.length;i++) a.push(localStorage.key(i)); return a.sort(); })();

  /* ── EL TRAZADOR, el mismo triangulo isosceles de TC-190 ──────────────────────────────── */
  const trazarEn = async (pfx, pts) => {
    const cv = document.getElementById(pfx + 'cine-med');
    if (!cv) { o.err.push('sin canvas ' + pfx); return false; }
    const ac = (x, y) => { const r = cv.getBoundingClientRect();
      return { clientX: r.left + x * (r.width / cv.width), clientY: r.top + y * (r.height / cv.height) }; };
    cv.dispatchEvent(new MouseEvent('mousedown', Object.assign({ bubbles:true }, ac(pts[0].x, pts[0].y))));
    for (let i = 1; i < pts.length; i++)
      cv.dispatchEvent(new MouseEvent('mousemove', Object.assign({ bubbles:true }, ac(pts[i].x, pts[i].y))));
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles:true }));
    const z = pts[pts.length-1];
    cv.dispatchEvent(new MouseEvent('click', Object.assign({ bubbles:true }, ac(z.x, z.y))));
    await esp(140);
    return true;
  };
  const tri = (cx, yb, W, H, paso) => {
    const p = []; paso = paso || 12;
    const x0 = cx - W/2, x1 = cx + W/2, ya = yb - H;
    const n1 = Math.ceil(Math.hypot(W/2, H) / paso);
    for (let i = 0; i <= n1; i++) p.push({ x: x0 + (cx-x0)*i/n1, y: yb + (ya-yb)*i/n1 });
    for (let i = 1; i <= n1; i++) p.push({ x: cx + (x1-cx)*i/n1, y: ya + (yb-ya)*i/n1 });
    return p.map(q => ({ x: Math.round(q.x), y: Math.round(q.y) }));
  };
  /* Dentro de la region 2D, que llega hasta y=240. La base abajo y el apice arriba. */
  const CX = 300, YB = 235, H = 200;
  const W4D = 200, W4S = 120, W2D = 180, W2S = 126;

  /* ══ H2: ¿SE PIDE LA VENTANA EN CADA TRAZADO? ══════════════════════════════════════════
     Se cuenta cuantos cuadros de dialogo salieron al elegir la herramienta y al trazar. Si la
     ventana se "pide", tiene que haber un prompt o un confirm en alguna de las dos puertas. */
  /* Los cuadros de dialogo los cuenta el lado de node, con el oyente de la pagina. */
  try { __t.herr('cine-med-simp'); } catch (e) {
    try { medHerramienta('simpson'); } catch (e2) { o.err.push('herr: ' + e2.message); }
  }
  await esp(260);
  o.h2 = {
    herrEsSimpson: (typeof _medHerr !== 'undefined') ? (_medHerr === 'simpson') : null,
    /* La sesion nace con la ventana SIN declarar: ninguna de las dos ranuras tiene nombre. */
    nombresAlNacer: (_simp && _simp.nombres) ? _simp.nombres.slice() : null,
    faseAlNacer: _simp ? _simp.fase : null,
    vistaAlNacer: _simp ? _simp.vista : null,
    /* El selector del panel unico: existe SIEMPRE y es persistente, no un prompt por trazado. */
    selectorEnPanel: (function () {
      const c = $('cine-simp-uni');
      if (!c) return null;
      const b = c.querySelectorAll('[data-simpuni-vista]');
      return { n: b.length, rotulos: Array.from(b).map(x => (x.textContent||'').trim()) };
    })(),
    /* El texto que el panel muestra cuando la ventana NO esta declarada. */
    diceSinDeclarar: ((txt('cine-simp-uni')||'').indexOf('sin declarar') > -1),
    /* ¿Hay algun prompt/confirm en el camino de aceptar o confirmar un trazado? */
    aceptarPregunta: (typeof _simpAceptar === 'function')
      && (String(_simpAceptar).indexOf('confirm(') > -1 || String(_simpAceptar).indexOf('prompt(') > -1),
    confirmarPregunta: (typeof medSimpsonConfirmar === 'function')
      && (String(medSimpsonConfirmar).indexOf('confirm(') > -1 || String(medSimpsonConfirmar).indexOf('prompt(') > -1),
    elegirVistaPregunta: (typeof medSimpsonElegirVista === 'function')
      && (String(medSimpsonElegirVista).indexOf('confirm(') > -1 || String(medSimpsonElegirVista).indexOf('prompt(') > -1)
  };

  /* ══ LOS DOS TRAZADOS DE LA VISTA A, y la barra de pasos de HOY ═════════════════════════ */
  o.pasos = { antes: (txt('cine-med-barra')||'').slice(0, 300) };
  await trazarEn('', tri(CX, YB, W4D, H));
  o.pasos.pendienteTrasTrazar = !!(_simp && _simp.pendiente);
  o.pasos.barraConPendiente = (txt('cine-med-barra')||'').slice(0, 300);
  try { medSimpsonConfirmar(); } catch (e) { o.err.push('conf1: ' + e.message); }
  await esp(140);
  o.pasos.faseTrasConfirmar = _simp ? _simp.fase : null;
  o.pasos.barraTrasConfirmar = (txt('cine-med-barra')||'').slice(0, 300);
  await trazarEn('', tri(CX, YB, W4S, H));
  try { medSimpsonConfirmar(); } catch (e) { o.err.push('conf2: ' + e.message); }
  await esp(200);
  o.pasos.resMono = (_simp && _simp.res) ? { vfd:_simp.res.vfd, vfs:_simp.res.vfs, fevi:_simp.res.fevi, bi:_simp.res.bi } : null;
  /* X2 — LA LINEA BASE NUMERICA del monoplanar: 1 - (W4S/W4D)^2. */
  o.x2 = { monoEsperado: (1 - (W4S*W4S)/(W4D*W4D)) * 100 };
  o.x2.monoMedido = o.pasos.resMono ? o.pasos.resMono.fevi : null;
  o.x2.monoCerca = (o.x2.monoMedido != null) ? (Math.abs(o.x2.monoMedido - o.x2.monoEsperado) < 1.5) : null;
  /* Los diametros y el eje YA en centimetros, que es lo que el bloque C no puede tocar. */
  o.x2.parA = (_simp && _simp.pares && _simp.pares[0] && _simp.pares[0].d) ? {
    Lcm: +_simp.pares[0].d.Lcm.toFixed(4),
    d0:  +_simp.pares[0].d.diamCm[0].toFixed(4),
    d10: +_simp.pares[0].d.diamCm[10].toFixed(4),
    cmPorPx: +_simp.pares[0].d.cmPorPx.toFixed(6),
    imagen: _simp.pares[0].d.imagen
  } : null;

  /* ══ LA VISTA B, POR LA PUERTA REAL: vistaBAbrir() con el almacen sustituido ════════════ */
  try {
    const u8 = new Uint8Array([255,216,255,217]);
    const b64 = btoa(String.fromCharCode.apply(null, u8));
    const UU = 'estudio-de-prueba-0001';
    const reg = { id:'c-probe-1', uuid:UU, nombre:'A2C-fix', cuadros:3, bytes:9000,
      tipo:'loop', poster:'data:image/jpeg;base64,'+b64 };
    if (typeof CeiboCine === 'object' && CeiboCine) {
      CeiboCine.listar = async () => [reg];
      CeiboCine.indice = async () => [reg];
    }
    /* Se sustituye el LECTOR DE DISCO y no CeiboCine.leer: aquel exige datos y offs, que es
       el formato comprimido del almacen, y lo que hace falta probar es el camino del selector y
       no el desempaquetado. Devuelve el mismo fixture de dos regiones que la vista A. */
    window._cineLoopDeDisco = async () => mk('A2C-fix', 3);
    /* El uuid del estudio: lo escribe imgRestaurar, que es la unica puerta —_imgUuidActual es
       un let de nivel de script y no se puede escribir por window—. Va DESPUES de imgVaciar,
       que lo pone en null: al reves lo borraria y _vElegirLoop saldria por su primera guarda.
       Es la leccion 3 de M4a-h, pagada en MEDIR-4a. */
    if (typeof CeiboImg === 'object' && CeiboImg) {
      CeiboImg.leer = async () => [];
      o.imgLeerSust = true;
    }
    /* ⚠️ imgRestaurar SALE TEMPRANO CON EL GUARDADO DE IMAGENES APAGADO —su propio comentario lo
       dice: «si no se guarda, tampoco se repone»—, asi que no deja el uuid y el selector no abre.
       Se prende por su puerta, que es la que escribe la clave. CeiboImg.leer esta sustituido a
       una lista vacia, asi que no se repone ninguna imagen. */
    try { cfgToggleGuardarImagenes(true); } catch (e) { o.err.push('toggle: ' + e.message); }
    await esp(160);
    o.guardadoActivo = (typeof imgGuardadoActivo === 'function') ? imgGuardadoActivo() : null;
    await imgRestaurar(UU);
    await esp(260);
    o.uuidPuesto = (typeof _imgUuidActual !== 'undefined') ? String(_imgUuidActual) : '(?)';
  } catch (e) { o.err.push('almacen: ' + e.message); }

  let abrioB = false;
  try {
    const pr = vistaBAbrir();
    await esp(700);
    /* El selector se abre de verdad: se elige con un clic sobre la miniatura. */
    const th = document.querySelector('[data-vpick-i], .v-pick-th, #cine-pick-lista button');
    o.pickAbierto = !!th;
    if (th) { th.click(); await esp(900); }
    try { await pr; } catch (e) {}
    await esp(500);
    abrioB = !!_vistaB;
  } catch (e) { o.err.push('vistaB: ' + e.message); }
  o.vistaBAbierta = abrioB;
  o.nPaneles = document.querySelectorAll('#cine-paneles [id$="cine-panel"]').length;

  if (abrioB) {
    const pfxB = _vistaB.pfx;
    o.pfxB = pfxB;
    /* ══ H3 (parte viva): los dos estados son INDEPENDIENTES ═════════════════════════════ */
    o.h3viva = {
      simpDeA: !!(_vistaA.simp), simpDeB: !!(_vistaB.simp),
      /* La A ya tiene su par; la B todavia no tiene sesion ni trazados. */
      paresA: _vistaA.simp ? _vistaA.simp.pares.map(p => ({ d:!!p.d, s:!!p.s })) : null,
      paresB: _vistaB.simp ? _vistaB.simp.pares.map(p => ({ d:!!p.d, s:!!p.s })) : null,
      calibA: _vistaA.medCalib, calibB: _vistaB.medCalib,
      calibVelA: _vistaA.medCalibVel, calibVelB: _vistaB.medCalibVel
    };

    /* La B lista para medir, y Simpson elegido en ELLA. */
    try { _vCon(_vistaB, () => { if (!_vistaB.medOn) medToggle(); }); } catch (e) { o.err.push('medirB: ' + e.message); }
    await esp(320);
    try { _vCon(_vistaB, () => medHerramienta('simpson')); } catch (e) { o.err.push('herrB: ' + e.message); }
    await esp(260);
    o.h3viva.herrA = _vistaA.medHerr; o.h3viva.herrB = _vistaB.medHerr;

    /* Los dos trazados de la B. Hay que confirmarlos EN SU VISTA. */
    await trazarEn(pfxB, tri(CX, YB, W2D, H));
    o.pendBtrasTrazar = !!(_vistaB.simp && _vistaB.simp.pendiente);
    try { _vCon(_vistaB, () => medSimpsonConfirmar()); } catch (e) { o.err.push('confB1: ' + e.message); }
    await esp(140);
    await trazarEn(pfxB, tri(CX, YB, W2S, H));
    try { _vCon(_vistaB, () => medSimpsonConfirmar()); } catch (e) { o.err.push('confB2: ' + e.message); }
    await esp(300);

    /* ══ H1: ¿DONDE VIVEN LOS TRAZADOS Y SE GUARDA EL BIPLANO? ═══════════════════════════ */
    o.h1 = {
      paresA: _vistaA.simp ? _vistaA.simp.pares.map(p => ({ d:!!p.d, s:!!p.s })) : null,
      paresB: _vistaB.simp ? _vistaB.simp.pares.map(p => ({ d:!!p.d, s:!!p.s })) : null,
      /* Los dos sobreviven a la vez: los trazados NO se pierden al pasar de vista. */
      losDosAlaVez: !!(_vistaA.simp && _vistaA.simp.pares[0].d && _vistaA.simp.pares[0].s &&
                       _vistaB.simp && _vistaB.simp.pares[0].d && _vistaB.simp.pares[0].s),
      /* El biplano: se calcula al vuelo y NO esta guardado en ningun campo del objeto. */
      biplano: (function () { const R = _vBiplanoDatos();
        return R ? { vfd:+R.vfd.toFixed(3), vfs:+R.vfs.toFixed(3), fevi:+R.fevi.toFixed(3),
                     Ld:+R.Ld.toFixed(3), Ls:+R.Ls.toFixed(3) } : null; })(),
      /* Dos llamadas seguidas dan lo mismo y no dejan rastro: es una funcion pura del estado. */
      biplanoEstable: (function () { const a = _vBiplanoDatos(), b = _vBiplanoDatos();
        return (a && b) ? Math.abs(a.fevi - b.fevi) < 1e-9 : null; })(),
      /* ¿Hay un campo "biplano" guardado en alguna de las dos sesiones? */
      campoBiplanoEnA: _vistaA.simp ? Object.keys(_vistaA.simp) : null,
      resDeA: (_vistaA.simp && _vistaA.simp.res) ? { bi:_vistaA.simp.res.bi, fevi:+_vistaA.simp.res.fevi.toFixed(3) } : null,
      resDeB: (_vistaB.simp && _vistaB.simp.res) ? { bi:_vistaB.simp.res.bi, fevi:+_vistaB.simp.res.fevi.toFixed(3) } : null
    };
    /* X2 — LA LINEA BASE NUMERICA del biplano: 1 - (W2S*W4S)/(W2D*W4D). */
    o.x2.biEsperado = (1 - (W2S*W4S)/(W2D*W4D)) * 100;
    o.x2.biMedido = o.h1.biplano ? o.h1.biplano.fevi : null;
    o.x2.biCerca = (o.x2.biMedido != null) ? (Math.abs(o.x2.biMedido - o.x2.biEsperado) < 1.5) : null;
    o.x2.biplanoCompleto = o.h1.biplano;

    /* ══ X1: ¿EL CRUCE MIRA nombres O CRUZA POR POSICION? ══════════════════════════════
       Se declara la MISMA ventana en las dos vistas. Si el cruce mirara los nombres, aca
       tendria que negarse a producir un biplano. */
    o.x1 = { antes: o.h1.biplano ? o.h1.biplano.fevi : null };
    try {
      _vCon(_vistaA, () => medSimpsonElegirVista('a4c'));
      _vCon(_vistaB, () => medSimpsonElegirVista('a4c'));
      await esp(260);
      o.x1.nombresA = _vistaA.simp.nombres.slice();
      o.x1.nombresB = _vistaB.simp.nombres.slice();
      const R = _vBiplanoDatos();
      o.x1.cruzaIgual = !!R;
      o.x1.feviConMismaVentana = R ? +R.fevi.toFixed(3) : null;
      /* La tabla de abajo: ¿cuantas filas y con que rotulos, con las dos diciendo A4C? */
      o.x1.filas = (typeof _simpFilasTabla === 'function')
        ? _simpFilasTabla().map(f => ({ rot:f.rot, mono:f.mono, fevi:+f.m.fevi.toFixed(1) })) : null;
      /* ¿El panel avisa de algo? */
      o.x1.textoPanel = (txt('cine-simp-uni')||'').slice(0, 400);
      o.x1.textoBiplano = (txt('cine-biplano')||'').slice(0, 400);
    } catch (e) { o.err.push('x1: ' + e.message); }
    /* Se devuelve a 4C/2C, que es el caso normal, para seguir midiendo. */
    try {
      _vCon(_vistaB, () => medSimpsonElegirVista('a2c'));
      await esp(200);
      o.x1.nombresBtrasVolver = _vistaB.simp.nombres.slice();
      const R2 = _vBiplanoDatos();
      o.x1.feviTrasVolver = R2 ? +R2.fevi.toFixed(3) : null;
    } catch (e) { o.err.push('x1b: ' + e.message); }

    /* ══ (g) LOS TEXTOS DEL PANEL DEL SIMPSON, para declarar cuantos se mueven al ⓘ ══════ */
    o.textos = {
      panelVistaA: (txt('cine-med-barra')||''),
      panelVistaB: (document.getElementById(pfxB+'cine-med-barra')
        ? (document.getElementById(pfxB+'cine-med-barra').textContent||'') : null),
      uni: (txt('cine-simp-uni')||''),
      biplano: (txt('cine-biplano')||'')
    };
    o.textosLargo = { panelA:o.textos.panelVistaA.length, panelB:(o.textos.panelVistaB||'').length,
      uni:o.textos.uni.length, biplano:o.textos.biplano.length };
    /* Las frases de metodo, una por una, buscadas por su comienzo. */
    const FRASES = [
      ['apexEscorzado', 'El método supone que el ápex'],
      ['noEsPromedio', 'No es el promedio de las dos'],
      ['productoCruzado', 'producto cruzado'],
      ['ejeMasLargo', 'eje más largo'],
      ['veyec', 'VEyec = VFD − VFS'],
      ['todaviaNo', 'Todavía NO está en el informe'],
      ['indexado', 'Indexado por la superficie corporal'],
      ['soloEnML', 'Sólo en mL'],
      ['monoplanarEs', 'Es monoplanar'],
      ['guiaRecomienda', 'La guía'],
      ['escalaSuImagen', 'escala de SU imagen'],
      ['aseEacvi', 'ASE/EACVI 2015'],
      ['clasifInforme', 'La clasificación es la misma que usa el informe'],
      ['cadaVentanaMono', 'Cada ventana muestra SU monoplanar'],
      ['anilloMitral', 'anillo mitral'],
      ['sinDeclarar', 'sin declarar'],
      ['contornosNoGuardan', 'Los contornos no se guardan']
    ];
    const todo = o.textos.panelVistaA + ' ' + (o.textos.panelVistaB||'') + ' ' + o.textos.uni + ' ' + o.textos.biplano;
    o.frases = {}; FRASES.forEach(f => { o.frases[f[0]] = todo.indexOf(f[1]) > -1; });
    o.frasesPresentes = Object.keys(o.frases).filter(k => o.frases[k]).length;
    o.frasesTotal = FRASES.length;
    /* ⚠️ «ASE/EACVI 2015» es un NOMBRE DE GUIA en una pantalla. La orden de esta tanda dice
       que los textos de la app no nombran guias: mudarlo al ⓘ lo resuelve. */

    /* ══ H5 (parte viva): EL BOTON DE INTEGRAR ══════════════════════════════════════════ */
    o.h5viva = {
      botonBiplano: !!$('cine-biplano-integ'),
      rotuloBiplano: txt('cine-biplano-integ'),
      botonUni: !!$('cine-simp-integ-u'),
      feviAntes: $('fevi') ? String($('fevi').value||'') : null,
      metAntes: $('fevi_met') ? String($('fevi_met').value||'') : null
    };
    try {
      const b = $('cine-biplano-integ');
      if (b) { b.click(); await esp(300); }
      o.h5viva.feviDespues = $('fevi') ? String($('fevi').value||'') : null;
      o.h5viva.metDespues = $('fevi_met') ? String($('fevi_met').value||'') : null;
      o.h5viva.escribioLoEsperado = (o.h5viva.feviDespues === String(Math.round(o.x2.biMedido)))
        || (o.h5viva.feviDespues === (o.x2.biMedido != null ? o.x2.biMedido.toFixed(0) : null));
    } catch (e) { o.err.push('integ: ' + e.message); }

    /* ══ (d) ¿QUE PASA AL CERRAR UNA VISTA? decision provisoria (a) ═════════════════════ */
    o.cierre = { antesBiplano: !!_vBiplanoDatos(), antesPaneles: o.nPaneles };
    try {
      const VB = _vistaB;
      vistaCerrarUna(VB);
      await esp(600);
      o.cierre.vistaBtrasCerrar = !!_vistaB;
      o.cierre.nPanelesTrasCerrar = document.querySelectorAll('#cine-paneles [id$="cine-panel"]').length;
      o.cierre.biplanoTrasCerrar = !!_vBiplanoDatos();
      o.cierre.simpDeLaCerrada = !!(VB.simp);
      o.cierre.quedaSimpEnLaViva = !!(_vistaA.simp && _vistaA.simp.pares[0].d);
      o.cierre.monoDeLaViva = (typeof _simpMonoDeS === 'function' && _vistaA.simp)
        ? (function () { const m = _simpMonoDeS(_vistaA.simp, 0); return m ? +m.fevi.toFixed(3) : null; })() : null;
      o.cierre.rotuloQueQueda = _vistaA.rot;
      o.cierre.pfxQueQueda = _vistaA.pfx;
      /* Ids duplicados tras cerrar: tiene que ser cero. */
      o.cierre.idsDuplicados = (function () {
        const vistos = Object.create(null), dup = [];
        document.querySelectorAll('[id]').forEach(e => {
          if (vistos[e.id]) { if (dup.indexOf(e.id) < 0) dup.push(e.id); } else vistos[e.id] = 1; });
        return dup;
      })();
    } catch (e) { o.err.push('cierre: ' + e.message); }
  }

  /* ══ NADA SE GUARDA: las claves de localStorage, antes y despues ════════════════════════ */
  const lsDespues = (function () { const a = []; for (let i=0;i<localStorage.length;i++) a.push(localStorage.key(i)); return a.sort(); })();
  o.ls = { antes:lsAntes.length, despues:lsDespues.length,
    nuevas: lsDespues.filter(k => lsAntes.indexOf(k) < 0) };
  /* El hidden simpson_manual SI guarda la tabla con el estudio: es lo que ya existia. */
  o.simpsonManual = $('simpson_manual') ? String($('simpson_manual').value||'').slice(0,200) : null;

  o.errs = o.err;
  return o;
})()`);

await nav.close(); srv.close();
console.log(JSON.stringify({ out, pageErrors: errs, consoleErrors: cons, dialogos }, null, 1));
