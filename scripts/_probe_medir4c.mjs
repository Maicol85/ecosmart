#!/usr/bin/env node
/**
 * _probe_medir4c.mjs - MEDIR-4a bloque C: «+ Vista» ofrece cineloops Y imagenes fijas, con la
 * marca de la miniatura, sin rotulos repetidos sin distinguirse, y con el Simpson bloqueado en
 * una vista de imagen fija. Chrome y WebKit, 1500x900.
 *
 * ** EL CAMINO ES EL REAL, DE PUNTA A PUNTA. Lo unico que se sustituye es el ALMACEN:
 * CeiboCine.listar y CeiboCine.leer, mas CeiboImg.leer para que imgRestaurar pueda dejar el
 * uuid del estudio en pie -- _imgUuidActual es un let de nivel de script y no se puede escribir,
 * asi que se pasa por la puerta que lo escribe. El selector se abre de verdad y se elige con un
 * clic sobre la miniatura.
 *
 * ** LA LISTA DE PRUEBA TIENE LAS CUATRO SITUACIONES QUE EL PEDIDO NOMBRA:
 *   - dos cineloops normales, con nombres distintos
 *   - DOS registros que son EL MISMO ARCHIVO listado dos veces (mismo nombre, mismos cuadros,
 *     mismos bytes): tienen que verse UNA sola vez
 *   - DOS con el MISMO nombre y distinto peso: son dos archivos y hay que distinguirlos
 *   - una imagen fija y un 'doc' (una tabla de resultados), que NO tiene que aparecer
 *
 *     node scripts/_probe_medir4c.mjs <ruta/index.html>
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

const MOTORES = [{ n:'chrome', lanzar: () => _pw.chromium.launch({ channel:'chrome' }) },
                 { n:'webkit', lanzar: () => _pw.webkit.launch() }];
const salida = [];

for (const M of MOTORES) {
  let nav = null;
  try { nav = await M.lanzar(); }
  catch (e) { salida.push({ motor:M.n, errMotor:String(e && e.message || e).slice(0,120) }); continue; }
  const ctx = await nav.newContext({ viewport:{ width:1500, height:900 } });
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(String(e&&e.message||e).slice(0,160)));
  const cons = []; pg.on('console', m => { if (m.type()==='error') cons.push(m.text().slice(0,160)); });
  const dialogos = []; pg.on('dialog', d => { dialogos.push(d.message().slice(0,160)); d.accept(); });
  await pg.goto('http://127.0.0.1:'+port+'/'+nom, { waitUntil:'load', timeout:120000 });
  await pg.waitForTimeout(2600);
  await pg.evaluate(`(() => {
    try { sessionStorage.setItem('ett_auth','1'); } catch (e) {}
    try { if (typeof cerrarAvisoEco==='function') cerrarAvisoEco(); } catch (e) {}
    const lo = document.getElementById('login-overlay'); if (lo) lo.style.display='none';
  })()`);
  await pg.waitForTimeout(200);

  const o = await pg.evaluate(`(async () => {
    const o = { errFn: [], toasts: [] };
    o.tieneLoNuevo = (typeof window._vEsFija === 'function') &&
                     (typeof window._medSimpsonBloqueadoFija === 'function');
    const $ = id => document.getElementById(id);
    const esp = ms => new Promise(r => setTimeout(r, ms));
    const toastReal = window.toast;
    window.toast = m => { o.toasts.push(String(m)); };

    /* ── EL FIXTURE ──────────────────────────────────────────────────────────────────────── */
    const jpgBytes = new Uint8Array([255,216,255,217]);
    const mkDatos = n => {
      const frags = []; for (let i = 0; i < n; i++) frags.push(jpgBytes);
      return frags;
    };
    /* Un registro del almacen, como lo guarda la app: datos + offs, mas la metadata. */
    const rec = (id, nombre, cuadros, bytes, tipo) => ({
      id, uuid:'estudio-de-prueba-0001', nombre, cuadros, bytes, tipo,
      ms:40, cols:600, filas:500, poster:'', ts:'2026-11-15T00:00:00.000Z',
      datos: new Uint8Array(4 * cuadros), offs: cuadros,
      regiones:[{ ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:600, y1:500, tipo:1 }]
    });
    const LISTA = [
      rec('id1', 'Q9JG9U01', 40, 1200000, 'loop'),
      rec('id2', 'Q9JG9U02', 60, 2400000, 'loop'),
      /* EL MISMO ARCHIVO, LISTADO DOS VECES: misma terna nombre/cuadros/bytes. */
      rec('id3', 'Q9JG9U03', 30, 900000, 'loop'),
      rec('id4', 'Q9JG9U03', 30, 900000, 'loop'),
      /* DOS DISTINTOS CON IGUAL CODIGO: mismo nombre, distinto peso. */
      rec('id5', 'Q9JG9U04', 50, 1500000, 'loop'),
      rec('id6', 'Q9JG9U04', 50, 1900000, 'loop'),
      /* UNA IMAGEN FIJA y UN DOCUMENTO. */
      rec('id7', 'FIJA0001', 1, 80000, 'fija'),
      rec('id8', 'TABLA-SIMPSON', 1, 50000, 'doc')
    ];
    o.fixtureN = LISTA.length;

    /* ── LOS ALMACENES, SUSTITUIDOS ──────────────────────────────────────────────────────── */
    try {
      window.CeiboCine = window.CeiboCine || {};
      window.CeiboCine.listar = async () => LISTA.map(r => r);
      window.CeiboCine.leer = async id => LISTA.filter(r => r.id === id)[0] || null;
      window.CeiboImg = window.CeiboImg || {};
      window.CeiboImg.leer = async () => [];
      /* El loop que sale del registro: se sustituye el convertidor, que es lo unico que sabe
         leer los bytes de verdad. Conserva el nombre y los cuadros del registro. */
      window._cineDesdeRegistro = r => ({ nombre: r.nombre, cuadros: r.cuadros,
        d:{ frags: mkDatos(r.cuadros), cols:600, filas:500, msCuadro:40, regiones: r.regiones } });
    } catch (e) { o.errFn.push('stubs: ' + e.message); }

    /* ── EL UUID DEL ESTUDIO, POR LA PUERTA QUE LO ESCRIBE ───────────────────────────────── */
    try {
      localStorage.setItem('cfg-guardar-imagenes', '1');
      await imgRestaurar('estudio-de-prueba-0001');
      await esp(220);
      o.uuidPuesto = (typeof _imgUuidActual !== 'undefined') ? String(_imgUuidActual) : '(?)';
    } catch (e) { o.errFn.push('uuid: ' + e.message); }

    /* ── EL VISOR CON UN CINELOOP EN LA VISTA A ──────────────────────────────────────────── */
    try {
      _cineAbrir([{ nombre:'A', cuadros:40, d:{ frags: mkDatos(40), cols:600, filas:500,
        msCuadro:40, regiones:[{ ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:600, y1:500, tipo:1 }] } }]);
      await esp(430);
      if (!_vistaA.medOn) $('cine-medir').click();
      await esp(360);
      o.aEsFija = !!_vistaA.esFija;
    } catch (e) { o.errFn.push('abrirA: ' + e.message); return o; }

    /* ── «+ VISTA»: EL SELECTOR DE VERDAD ───────────────────────────────────────────────── */
    let promesa = null;
    try {
      promesa = vistaBAbrir();
      /* Se espera a que el dialogo exista; no se asume un tiempo. */
      for (let i = 0; i < 60 && !document.querySelector('[data-vpicker]'); i++) await esp(60);
      const ov = document.querySelector('[data-vpicker]');
      o.pickerAbrio = !!ov;
      if (ov) {
        const cards = [...ov.querySelectorAll('[data-vpick-i]')];
        o.nTarjetas = cards.length;
        o.tarjetas = cards.map(c => ({
          i: c.getAttribute('data-vpick-i'),
          fija: c.getAttribute('data-vpick-fija'),
          chip: !!c.querySelector('.vpick-chip'),
          chipTxt: c.querySelector('.vpick-chip') ? (c.querySelector('.vpick-chip').textContent||'').trim() : '',
          pie: ((c.lastElementChild && c.lastElementChild.textContent) || '').replace(/\\s+/g,' ').trim()
        }));
        o.titulo = (ov.querySelector('div > div') ? ov.querySelector('div > div').textContent : '').trim();
        o.sub = (() => { const ds = [...ov.querySelectorAll('div')];
          for (const d of ds) { const t = (d.textContent||''); if (t.indexOf('Tocá la miniatura') === 0) return t.replace(/\\s+/g,' ').trim(); }
          return ''; })();
        /* NINGUN pie repetido: es la invariante del punto 2. */
        const pies = o.tarjetas.map(t => t.pie);
        o.piesUnicos = pies.length === new Set(pies).size;
        o.pies = pies;
        /* Se elige LA IMAGEN FIJA, que es el caso nuevo. */
        const idxFija = o.tarjetas.map(t => t.fija).indexOf('1');
        o.idxFija = idxFija;
        if (idxFija >= 0) cards[idxFija].click();
        else cards[0].click();
      }
      await promesa;
      await esp(520);
    } catch (e) { o.errFn.push('picker: ' + e.message); }

    /* ── LA VISTA B QUEDO MARCADA COMO FIJA ─────────────────────────────────────────────── */
    o.bMontada = document.querySelectorAll('#cine-paneles [id$="cine-panel"]').length;
    o.bEsFija = (typeof _vistaB !== 'undefined' && _vistaB) ? !!_vistaB.esFija : null;
    o.bNombre = (typeof _vistaB !== 'undefined' && _vistaB && _vistaB.datos &&
                 _vistaB.datos.loops && _vistaB.datos.loops[0])
                ? String(_vistaB.datos.loops[0].nombre || '') : '(?)';
    o.aSigueNoFija = !!_vistaA && _vistaA.esFija === false;

    /* ── EL SIMPSON, BLOQUEADO EN LA VISTA FIJA Y NO EN LA OTRA ─────────────────────────── */
    try {
      o.toasts = [];
      /* En la vista B (fija): el boton apagado y la herramienta cae al defecto. */
      _vCon(_vistaB, () => { medHerramienta('simpson'); });
      await esp(260);
      o.bHerrTrasSimpson = (typeof _vistaB !== 'undefined' && _vistaB) ? String(_vistaB.medHerr) : '(?)';
      o.bToast = o.toasts.slice();
      o.bBloqueado = _vCon(_vistaB, () => _medSimpsonBloqueadoFija());
      /* El boton, apagado: se mide su color de texto contra el de uno disponible. */
      _vCon(_vistaB, () => { _medGrupo = '2d'; _medSideRender(); });
      await esp(220);
      const bs = $('b-cine-med-simp');
      o.bBotonExiste = !!bs;
      o.bBotonTitulo = bs ? String(bs.getAttribute('title') || '') : '';
      o.bBotonApagado = !!bs && String(bs.getAttribute('title')||'').indexOf('imagen fija') >= 0;
      /* CONTROL: en la vista A, que es un cineloop, el Simpson SI entra. */
      o.toasts = [];
      _vCon(_vistaA, () => { medHerramienta('simpson'); });
      await esp(260);
      o.aHerrTrasSimpson = String(_vistaA.medHerr);
      o.aToast = o.toasts.slice();
      o.aBloqueado = _vCon(_vistaA, () => _medSimpsonBloqueadoFija());
      _vCon(_vistaA, () => { _medGrupo = '2d'; _medSideRender(); });
      await esp(200);
      const as = $('cine-med-simp');
      o.aBotonTitulo = as ? String(as.getAttribute('title') || '') : '';
      o.aBotonApagado = !!as && String(as.getAttribute('title')||'').indexOf('imagen fija') >= 0;
    } catch (e) { o.errFn.push('simpson: ' + e.message); }

    /* ── EL BIPLANO DE DOS CINELOOPS NO SE ROMPE ─────────────────────────────────────────
       Se cierra la vista fija y se abre otra con un CINELOOP; lo que se mide es que el cruce
       A x B siga siendo posible, o sea que la compuerta nueva no lo toque. */
    try {
      o.toasts = [];
      $('b-cine-cerrar-v').click();
      await esp(460);
      o.trasCerrarFija = document.querySelectorAll('#cine-paneles [id$="cine-panel"]').length;
      promesa = vistaBAbrir();
      for (let i = 0; i < 60 && !document.querySelector('[data-vpicker]'); i++) await esp(60);
      const ov2 = document.querySelector('[data-vpicker]');
      if (ov2) {
        const cards = [...ov2.querySelectorAll('[data-vpick-i]')];
        const idxLoop = [...cards].map(c => c.getAttribute('data-vpick-fija')).indexOf('0');
        if (idxLoop >= 0) cards[idxLoop].click(); else cards[0].click();
      }
      await promesa;
      await esp(520);
      o.bEsFija2 = (typeof _vistaB !== 'undefined' && _vistaB) ? !!_vistaB.esFija : null;
      o.toasts = [];
      _vCon(_vistaB, () => { medHerramienta('simpson'); });
      await esp(240);
      o.b2HerrTrasSimpson = (typeof _vistaB !== 'undefined' && _vistaB) ? String(_vistaB.medHerr) : '(?)';
      o.b2Toast = o.toasts.slice();
      /* Y el biplano puede existir: sus dos sesiones de Simpson nacen, que es la puerta. */
      o.b2SimpSesion = !!(_vistaB && _vistaB.simp);
      o.aSimpSesion = !!(_vistaA && _vistaA.simp);
      o.hayBiplanoFn = typeof _vBiplanoDatos === 'function';
    } catch (e) { o.errFn.push('biplano: ' + e.message); }

    try { window.toast = toastReal; } catch (e) {}
    return o;
  })()`).catch(e => ({ errEval: String(e && e.message || e).slice(0, 400) }));

  salida.push({ motor:M.n, errs, cons, dialogos, ...o });
  await ctx.close();
  await nav.close();
}
srv.close();
console.log(JSON.stringify(salida, null, 1));
