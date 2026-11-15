#!/usr/bin/env node
/**
 * _probe_medir4cierre.mjs - MEDIR-4a: el CIERRE POR VISTA y la tabla que no se mezcla, medido
 * con el gesto real (clics sobre los botones) en Chrome y en WebKit.
 *
 * Los escenarios que la orden pide ejercitar, cada uno en su propia pagina:
 *   S1. cerrar la vista A con la B abierta -> la B queda como unica vista, el visor sigue abierto,
 *       y la tabla conserva los valores de las DOS con su marca de origen
 *   S2. cerrar la vista B con la A abierta -> la A queda como unica vista y el visor sigue abierto
 *   S3. cerrar con una sola vista abierta  -> se cierra el visor
 *   S4. tras cerrar la A, abrir otra vista -> toma el prefijo LIBRE y no duplica ni un id
 *
 * ** CADA ESCENARIO EN SU PAGINA. `cineCerrar` NO destruye la vista B a proposito —esta
 * declarado en su propio comentario, es la otra mitad de «lo medido se conserva»— asi que
 * reutilizar la pagina deja el panel montado y el escenario siguiente mide sobre tres paneles.
 *
 * ** LO UNICO QUE SE SUSTITUYE ES EL SELECTOR DE CINELOOP. `vistaBAbrir` es el unico camino que
 * escribe la variable _vistaB —es un let de nivel de script y no se puede escribir desde la
 * sonda—, y depende de _imgUuidActual y de CeiboCine, que en una sonda no existen. Se sustituye
 * _vElegirLoop, que es una declaracion de funcion y por lo tanto una propiedad de window, y asi
 * TODO el resto del camino real corre: montar, cablear, activar la medicion, el boton de
 * sincronizar y el biplano.
 *
 * ** EL MODO DEL CAJON SE ASEGURA, NO SE ALTERNA. d2Modo es un TOGGLE: llamarlo dos veces con el
 * mismo grupo lo APAGA y la tabla sale vacia, que se lee igual que «la tabla se perdio». Es la
 * trampa que este repositorio ya documenta y que la primera version de esta sonda pago.
 *
 *     node scripts/_probe_medir4cierre.mjs <ruta/index.html>
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

/* El preludio: todo lo que las cuatro escenas comparten. Va como cadena porque se evalua en el
   navegador; sin acentos graves adentro. */
const PRELUDIO = `
  const o = { errFn: [], pasos: {} };
  o.tieneLoNuevo = (typeof window._vSlotSync === 'function') &&
                   (typeof window.vistaCerrarUna === 'function');
  const $ = id => document.getElementById(id);
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const jpg = new Uint8Array([255,216,255,217]);
  const R2D = { ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:600, y1:240, tipo:1 };
  const RDOP = { ux:4, uy:7, dx:0.004, dy:-0.5, ry0:420, rvy:0, x0:0, y0:250, x1:600, y1:500, tipo:2 };
  const mk = n => ({ nombre:n, cuadros:1, d:{ frags:[jpg], cols:600, filas:500, msCuadro:0,
    regiones:[R2D, RDOP] } });
  /* Asegura el grupo del cajon 2D sin alternarlo. */
  const grupo2D = g => { try { const E = _d2Estado(); if (E.modo !== g) d2Modo(g); } catch (e) {} };
  const dupIds = () => {
    const ov = $('cine-ov'); if (!ov) return ['(sin overlay)'];
    const vis = {}, dup = [];
    ov.querySelectorAll('[id]').forEach(e => { if (vis[e.id]) { if (dup.indexOf(e.id)<0) dup.push(e.id); } else vis[e.id]=true; });
    return dup;
  };
  const tabla = () => {
    const n = $('d2-cajon'); if (!n) return { existe:false };
    const p = n.closest('[id$="cine-panel"]');
    const filas = [...n.querySelectorAll('.med-tabla tbody tr')]
      .map(tr => (tr.textContent||'').replace(/\\s+/g,' ').trim())
      .filter(t => t && t.indexOf('\\u2014') < 0);
    return { existe:true, panel: p ? (p.id || '(sin id)') : '(fuera de panel)',
             visible: getComputedStyle(n).display !== 'none', conValor: filas };
  };
  const estado = () => ({
    visorAbierto: !!($('cine-ov') && getComputedStyle($('cine-ov')).display !== 'none'),
    paneles: [...document.querySelectorAll('#cine-paneles [id$="cine-panel"]')].map(p => p.id || '(sin id)'),
    clase2v: !!($('cine-paneles') && $('cine-paneles').classList.contains('cine-2v')),
    pfxActiva: _vistaA ? _vistaA.pfx : '(?)', rotActiva: _vistaA ? _vistaA.rot : '(?)',
    hayB: !!_vistaB,
    dup: dupIds(), tabla: tabla(),
    sync: $('cine-sync') ? getComputedStyle($('cine-sync')).display : '(no existe)'
  });
  /* Abre el visor con la vista A y le mide el TAPSE en 18 mm. */
  const abrirA = async nombre => {
    _cineAbrir([mk(nombre)]); await esp(430);
    if (!_vistaA.medOn) $('cine-medir').click(); await esp(380);
  };
  const medirEn = (V, campo, val) => {
    _vCon(V, () => { grupo2D('vd'); _d2Poner(campo, val); _d2MarcarOrigen(campo); _d2Render(); });
  };
  /* Abre la segunda vista por el camino REAL, con el selector sustituido. */
  const abrirSegunda = async nombre => {
    window._vElegirLoop = async function (V) {
      _vCon(V, () => { V.datos = { loops:[mk(nombre)], i:0, cuadro:0, timer:null }; _cineCargarLoop(); });
      return true;
    };
    await vistaBAbrir(); await esp(560);
  };
`;

const ESCENAS = {
  /* ── S1 ── cerrar la A con la B abierta, y despues cerrar la que queda ────────────────── */
  s1: `
    try {
      await abrirA('A');
      medirEn(_vistaA, 'vd.tapse', 18); await esp(240);
      o.pasos.soloA = estado();
      await abrirSegunda('B');
      medirEn(_vistaB, 'vd.basal', 52); await esp(240);
      o.pasos.dosVistas = estado();
      /* La tabla, pedida desde cada vista: tiene que mudarse de columna y volver. */
      _vCon(_vistaA, () => _d2Render()); await esp(200);
      o.pasos.dosVistas_tablaDesdeA = tabla();
      _vCon(_vistaB, () => _d2Render()); await esp(200);
      o.pasos.dosVistas_tablaDesdeB = tabla();
      /* Y se cierra la A con el gesto real. */
      const b = $('cine-cerrar-v'); o.pasos.botonAExiste = !!b;
      if (b) { b.click(); await esp(460); }
      o.pasos.trasCerrarA = estado();
      /* Lo que queda cierra el visor. */
      const b2 = $(_vistaA.pfx + 'cine-cerrar-v'); o.pasos.botonUnicaExiste = !!b2;
      if (b2) { b2.click(); await esp(460); }
      o.pasos.trasCerrarLaUnica = { visorAbierto: !!($('cine-ov') && getComputedStyle($('cine-ov')).display !== 'none') };
    } catch (e) { o.errFn.push('s1: ' + e.message); }
  `,
  /* ── S2 ── cerrar la B con la A abierta ───────────────────────────────────────────────── */
  s2: `
    try {
      await abrirA('A');
      medirEn(_vistaA, 'vd.tapse', 18); await esp(240);
      await abrirSegunda('B');
      medirEn(_vistaB, 'vd.basal', 52); await esp(240);
      o.pasos.dosVistas = estado();
      const b = $('b-cine-cerrar-v'); o.pasos.botonBExiste = !!b;
      if (b) { b.click(); await esp(460); }
      o.pasos.trasCerrarB = estado();
      const b2 = $(_vistaA.pfx + 'cine-cerrar-v');
      if (b2) { b2.click(); await esp(460); }
      o.pasos.trasCerrarLaUnica = { visorAbierto: !!($('cine-ov') && getComputedStyle($('cine-ov')).display !== 'none') };
    } catch (e) { o.errFn.push('s2: ' + e.message); }
  `,
  /* ── S3 ── una sola vista: su «Cerrar vista» cierra el visor ──────────────────────────── */
  s3: `
    try {
      await abrirA('A');
      medirEn(_vistaA, 'vd.tapse', 18); await esp(240);
      o.pasos.antes = estado();
      const b = $('cine-cerrar-v'); o.pasos.botonExiste = !!b;
      if (b) { b.click(); await esp(460); }
      o.pasos.despues = { visorAbierto: !!($('cine-ov') && getComputedStyle($('cine-ov')).display !== 'none'),
                          hayB: !!_vistaB, pfx: _vistaA ? _vistaA.pfx : '(?)' };
      /* Y lo medido se conserva: reabriendo, el TAPSE sigue en la tabla. */
      await abrirA('A2'); await esp(200);
      _vCon(_vistaA, () => { grupo2D('vd'); _d2Render(); }); await esp(240);
      o.pasos.reabierto = estado();
    } catch (e) { o.errFn.push('s3: ' + e.message); }
  `,
  /* ── S4 ── tras cerrar la A, abrir otra vista toma el prefijo LIBRE ───────────────────── */
  s4: `
    try {
      await abrirA('A');
      await abrirSegunda('B');
      const b = $('cine-cerrar-v');
      if (b) { b.click(); await esp(460); }
      o.pasos.trasCerrarA = { pfx: _vistaA.pfx, paneles: estado().paneles, dup: dupIds() };
      await abrirSegunda('C'); await esp(200);
      o.pasos.trasAbrirOtra = estado();
      o.pasos.trasAbrirOtra_pfxNueva = _vistaB ? _vistaB.pfx : '(sin B)';
      o.pasos.trasAbrirOtra_rotNueva = _vistaB ? _vistaB.rot : '(sin B)';
    } catch (e) { o.errFn.push('s4: ' + e.message); }
  `
};

const MOTORES = [{ n:'chrome', lanzar: () => _pw.chromium.launch({ channel:'chrome' }) },
                 { n:'webkit', lanzar: () => _pw.webkit.launch() }];
const salida = [];

for (const M of MOTORES) {
  let nav = null;
  try { nav = await M.lanzar(); }
  catch (e) { salida.push({ motor:M.n, errMotor:String(e && e.message || e).slice(0,120) }); continue; }
  for (const nombre of Object.keys(ESCENAS)) {
    const ctx = await nav.newContext({ viewport:{ width:1500, height:900 } });
    const pg = await ctx.newPage();
    const errs = []; pg.on('pageerror', e => errs.push(String(e&&e.message||e).slice(0,140)));
    const cons = []; pg.on('console', m => { if (m.type()==='error') cons.push(m.text().slice(0,140)); });
    const dialogos = [];
    pg.on('dialog', d => { dialogos.push(d.message().slice(0,120)); d.accept(); });
    await pg.goto('http://127.0.0.1:'+port+'/'+nom, { waitUntil:'load', timeout:120000 });
    await pg.waitForTimeout(2600);
    await pg.evaluate(`(() => {
      try { sessionStorage.setItem('ett_auth','1'); } catch (e) {}
      try { if (typeof cerrarAvisoEco==='function') cerrarAvisoEco(); } catch (e) {}
      const lo = document.getElementById('login-overlay'); if (lo) lo.style.display='none';
    })()`);
    await pg.waitForTimeout(200);
    const o = await pg.evaluate('(async () => {' + PRELUDIO + ESCENAS[nombre] + ' return o; })()')
      .catch(e => ({ errEval: String(e && e.message || e).slice(0, 400) }));
    salida.push({ motor:M.n, escena:nombre, errs, cons, dialogos, ...o });
    await ctx.close();
  }
  await nav.close();
}
srv.close();
console.log(JSON.stringify(salida, null, 1));
