#!/usr/bin/env node
/**
 * _probe_medir3.mjs - MEDIR-3: el panel del visor, los botones de la barra, la calibracion de
 * velocidad y el FAC del VD, medido EN EL NAVEGADOR en Chrome y en WebKit, a 1440x900 y a
 * 1280x800, en los DOS temas reales.
 *
 * ** LLEVA SU DETECTOR DE QUE SON DOS ARBOLES (`tieneLoNuevo`). La ruta por omision de una sonda
 * es la del arbol real, asi que correrla DESDE un worktree no alcanza: los numeros salen
 * identicos -- que es justo lo que la prueba queria afirmar -- y nadie lo nota. Es el defecto
 * que PANT-37 pago con _probe_ec2dos.mjs.
 *
 * ** EL TEMA SE PONE COMO LO PONE LA APP: la clase `light-mode` que escribe `loadTheme()`
 * leyendo `localStorage.ett_theme`. NO es `prefers-color-scheme` (hallazgo de metodo de PANT-34).
 * La sonda DEVUELVE que tema quedo puesto, para que el control no se pueda falsear solo.
 *
 * ** LOS MODOS SE ASEGURAN, NO SE ALTERNAN. `d2Modo` y `dopModo` son toggles: llamarlos a secas
 * hereda el modo que dejo el bloque anterior y, si ya era el pedido, lo APAGAN y no se pinta
 * ninguna tabla. Es lo que MEDIR-2 pago con TC-882, TC-883 y TC-886 y con esta misma sonda.
 *
 * ** SE MIDE EL ESTILO COMPUTADO Y LA GEOMETRIA, no el marcado: en MEDIR-2 el `row-gap` de 16 px
 * paso todas las pruebas de marcado y NO APLICABA, porque el atajo `gap` en linea le ganaba.
 *
 *     node scripts/_probe_medir3.mjs <ruta/index.html>
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const FILE = process.argv[2];
if (!FILE) { console.error('falta la ruta del index.html'); process.exit(2); }
const raiz = dirname(FILE), nom = FILE.slice(raiz.length + 1);
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json' };
const { srv, port } = await new Promise(res => {
  const s = createServer(async (req, rq) => {
    try { const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/,'') || nom;
      const p = join(raiz, rel); if (!p.startsWith(raiz)) { rq.writeHead(403).end(); return; }
      rq.writeHead(200,{'Content-Type':MIME[extname(p)]||'application/octet-stream'}).end(await readFile(p));
    } catch { rq.writeHead(404).end('no'); }
  });
  s.listen(0,'127.0.0.1',()=>res({srv:s,port:s.address().port}));
});

const ANCHOS = [{ w:1440, h:900 }, { w:1280, h:800 }];
const TEMAS  = ['noche', 'dia'];
const MOTORES = [{ n:'chrome', lanzar: () => _pw.chromium.launch({ channel:'chrome' }) },
                 { n:'webkit', lanzar: () => _pw.webkit.launch() }];
const salida = [];

for (const M of MOTORES) {
  let nav = null;
  try { nav = await M.lanzar(); }
  catch (e) { salida.push({ motor:M.n, errMotor:String(e && e.message || e).slice(0,120) }); continue; }
  for (const V of ANCHOS) {
    for (const tema of TEMAS) {
      const ctx = await nav.newContext({ viewport:{ width:V.w, height:V.h } });
      const pg = await ctx.newPage();
      const errs = []; pg.on('pageerror', e => errs.push(String(e&&e.message||e).slice(0,140)));
      const cons = []; pg.on('console', m => { if (m.type()==='error') cons.push(m.text().slice(0,140)); });
      await pg.goto('http://127.0.0.1:'+port+'/'+nom, { waitUntil:'load', timeout:120000 });
      await pg.waitForTimeout(2600);
      await pg.evaluate(`(() => {
        try { sessionStorage.setItem('ett_auth','1'); } catch (e) {}
        try { if (typeof cerrarAvisoEco==='function') cerrarAvisoEco(); } catch (e) {}
        const lo = document.getElementById('login-overlay'); if (lo) lo.style.display='none';
        try { localStorage.setItem('ett_theme', ${JSON.stringify(tema === 'dia' ? 'light' : 'dark')}); } catch (e) {}
        try { if (typeof loadTheme === 'function') loadTheme(); } catch (e) {}
      })()`);
      await pg.waitForTimeout(260);

      const o = await pg.evaluate(`(async () => {
        const o = { errFn: [] };
        o.tema = document.documentElement.classList.contains('light-mode') ? 'dia' : 'noche';
        /* EL DETECTOR DE QUE SON DOS ARBOLES: lo de MEDIR-3 y no lo de MEDIR-2. */
        o.tieneLoNuevo = (typeof window._medPanelInfo === 'function') &&
                         (typeof window._medCalVelDos === 'function');

        const $ = id => document.getElementById(id);
        const esp = ms => new Promise(r => setTimeout(r, ms));
        /* El modo se ASEGURA en vez de alternarse: los dos son toggles. */
        const verD2 = m => { try { if (!_d2Estado() || _d2Estado().modo !== m) d2Modo(m); } catch (e) { o.errFn.push('verD2: ' + e.message); } };
        const verDop = m => { try { if (!_dopEstado() || _dopEstado().modo !== m) dopModo(m); } catch (e) { o.errFn.push('verDop: ' + e.message); } };

        /* Una imagen Doppler sintetica: region con los DOS ejes declarados (uy=3 es cm/s en la
           tabla de unidades del lector), 600x500 px de imagen. */
        const jpg = new Uint8Array([255,216,255,217]);
        const mk = n => ({ nombre:n, cuadros:1, d:{ frags:[jpg], cols:600, filas:500, msCuadro:0,
          regiones:[{ ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:600, y1:500, tipo:1 }] } });
        try { _cineAbrir([mk('A')]); } catch (e) { o.errFn.push('abrir: ' + e.message); return o; }
        await esp(420);
        try { if (!_vistaA.medOn) $('cine-medir').click(); } catch (e) { o.errFn.push('medir: ' + e.message); }
        await esp(420);

        /* ── 1. LA GEOMETRIA DEL PANEL (bloque 0a / A1 / A2) ─────────────────────────────── */
        const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
          return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top) }; };
        o.modal   = caja($('cine-modal'));
        o.paneles = caja($('cine-paneles'));
        o.lienzo  = caja($('cine-lienzo'));
        o.canvas  = caja($('cine-cv'));
        const cd = document.querySelector('#cine-ov .cine-col-der');
        o.colDer  = caja(cd);
        o.side    = caja($('cine-side'));
        /* EL NEGRO A LOS COSTADOS: lo que sobra del lienzo a cada lado del canvas. */
        o.negroLados = (o.lienzo && o.canvas) ? Math.max(0, o.lienzo.w - o.canvas.w) : -1;
        o.negroArriba = (o.lienzo && o.canvas) ? Math.max(0, o.lienzo.h - o.canvas.h) : -1;
        /* EL DESPLAZAMIENTO: de quien es. */
        o.colDerScrollY = cd ? (cd.scrollHeight - cd.clientHeight) : -1;
        o.colDerScrollX = cd ? (cd.scrollWidth - cd.clientWidth) : -1;
        o.modalScrollY  = $('cine-modal') ? ($('cine-modal').scrollHeight - $('cine-modal').clientHeight) : -1;
        o.docScrollX    = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        /* A2: el selector FIJO y el 2D/Doppler-M a la vista. */
        const b2d = $('cine-g-2d');
        o.btn2dVisible = !!(b2d && b2d.getBoundingClientRect().height > 0);
        o.sidePos = $('cine-side') ? getComputedStyle($('cine-side')).position : '(no)';
        o.sideFlex = $('cine-side') ? getComputedStyle($('cine-side')).flexShrink : '(no)';

        /* ── 2. LOS BOTONES DE LA BARRA (bloque 0d / B) ──────────────────────────────────── */
        const barra = $('cine-grp-med');
        const bs = barra ? [...barra.querySelectorAll('button')] : [];
        o.barraN = bs.length;
        o.barraBotones = bs.map(b => { const r = b.getBoundingClientRect(), s = getComputedStyle(b);
          return { id: b.id || '(sin id)', rot: (b.textContent||'').trim().slice(0,26),
            w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.top),
            bg: s.backgroundColor, col: s.color };
        });
        const ws = o.barraBotones.map(b => b.w), hs = o.barraBotones.map(b => b.h);
        const ys = o.barraBotones.map(b => b.y);
        o.barraMismoAncho = ws.length > 0 && Math.max.apply(null, ws) - Math.min.apply(null, ws) <= 1;
        o.barraMismoAlto  = hs.length > 0 && Math.max.apply(null, hs) - Math.min.apply(null, hs) <= 1;
        o.barraMismaFila  = ys.length > 0 && Math.max.apply(null, ys) - Math.min.apply(null, ys) <= 1;
        o.barraAltoMin    = hs.length ? Math.min.apply(null, hs) : -1;
        o.barraAltoMax    = hs.length ? Math.max.apply(null, hs) : -1;
        /* Cuantos llevan el color de acento de fondo (o sea «azul»). */
        const esAcento = bg => { const q = String(bg); if (q.indexOf('(') < 0) return false;
          const n = q.slice(q.indexOf('(')+1, q.lastIndexOf(')')).split(',').map(x => parseFloat(x));
          if (n.length < 3 || !isFinite(n[0])) return false;
          if (n.length > 3 && n[3] === 0) return false;
          /* azul: el canal azul manda sobre los otros dos por un margen claro */
          return n[2] > 120 && n[2] - n[0] > 40 && n[2] - n[1] > 30; };
        o.barraAzules = o.barraBotones.filter(b => esAcento(b.bg)).map(b => b.id);

        /* ── 3. LA TABLA: UNA MEDIDA POR FILA (A3) ───────────────────────────────────────── */
        try { medHerramienta('vel'); } catch (e) { o.errFn.push('herr vel: ' + e.message); }
        verDop('ao');
        try { const P = _dopEstado().ao; P.vmax = 4.2; P.vtiVao = 90; P.diam = 21; P.vtiTsvi = 22; _dopRender(); }
        catch (e) { o.errFn.push('sembrar dop: ' + e.message); }
        await esp(320);
        const dc = $('dop-cajon');
        o.dopTablas = dc ? dc.querySelectorAll('table.med-tabla').length : -1;
        /* DOS TABLAS LADO A LADO = dos medidas en la misma linea. Se mide por GEOMETRIA: pares de
           celdas de nombre que comparten banda horizontal. */
        const nombres = dc ? [...dc.querySelectorAll('table.med-tabla tbody tr')].map(tr => {
          const r = tr.getBoundingClientRect();
          return { t: (tr.children[0] ? tr.children[0].textContent : '').trim().slice(0,22),
                   y: Math.round(r.top + r.height/2), x: Math.round(r.left) }; }) : [];
        o.dopFilasN = nombres.length;
        let lado = 0;
        for (let i = 0; i < nombres.length; i++) for (let j = i+1; j < nombres.length; j++) {
          if (Math.abs(nombres[i].y - nombres[j].y) < 6 && Math.abs(nombres[i].x - nombres[j].x) > 20) lado++;
        }
        o.dopParesLadoALado = lado;
        o.dopScrollX = dc ? (dc.scrollWidth - dc.clientWidth) : -1;
        /* Y con UNA sola columna poblada: la mitral solo con la onda E deja el reparto de dos
           columnas cayendo a UNA tabla sola, asi que esto dice si el desborde es del REPARTO o de
           las cinco columnas por si mismas. Sin esta mitad, «desborda 179 px» no dice de que.
           (Sin acentos graves: este comentario vive DENTRO del template que se evalua en el
           navegador, y ahi un acento grave cierra la cadena. Lo pague otra vez.) */
        verDop('mit');
        try { const P = _dopEstado().mit; P.e = 0.8; _dopRender(); } catch (e) { o.errFn.push('mit: ' + e.message); }
        await esp(300);
        o.dopTablas1 = dc ? dc.querySelectorAll('table.med-tabla').length : -1;
        o.dopScrollX1 = dc ? (dc.scrollWidth - dc.clientWidth) : -1;
        /* El valor GRANDE y la unidad CHICA (A4). */
        const prim = dc ? dc.querySelector('table.med-tabla tbody tr') : null;
        if (prim && prim.children.length >= 3) {
          o.valorPx = parseFloat(getComputedStyle(prim.children[1]).fontSize);
          o.uniPx   = parseFloat(getComputedStyle(prim.children[2]).fontSize);
          o.nomPx   = parseFloat(getComputedStyle(prim.children[0]).fontSize);
        } else { o.valorPx = -1; o.uniPx = -1; o.nomPx = -1; }
        /* Las zonas tactiles de los botones de la fila. */
        const bf = prim ? [...prim.querySelectorAll('button')] : [];
        o.filaBotAltos = bf.map(b => { const r = b.getBoundingClientRect();
          const a = parseFloat(getComputedStyle(b, '::after').height) || 0;
          return Math.round(Math.max(r.height, a)); });
        o.filaBotMin = o.filaBotAltos.length ? Math.min.apply(null, o.filaBotAltos) : -1;

        /* ── 4. EL ORDEN DEL VI Y EL DIAM TSVI (A5) ──────────────────────────────────────── */
        try { medHerramienta('dist'); } catch (e) {}
        verD2('vi');
        try { _d2Render(); } catch (e) {}
        await esp(300);
        const leerRot = id => { const c = $(id); if (!c) return [];
          return [...c.querySelectorAll('table.med-tabla tbody tr')]
            .map(tr => (tr.children[0] ? tr.children[0].textContent : '').trim()); };
        o.viRot = leerRot('d2-cajon').join(' / ');
        verD2('ao');
        try { _d2Render(); } catch (e) {}
        await esp(300);
        o.aoRot = leerRot('d2-cajon').join(' / ');
        o.tsviEnVI = o.viRot.indexOf('Diam TSVI') >= 0;
        o.tsviEnAo = o.aoRot.indexOf('Diam TSVI') >= 0;

        /* ── 5. UNA TABLA POR ESTRUCTURA, Y SE RESTAURA (A7) ─────────────────────────────── */
        verD2('vi');
        try { _d2Poner('vi.ddvi', 52); _d2Render(); } catch (e) { o.errFn.push('a7 sembrar: ' + e.message); }
        await esp(260);
        o.a7Tablas1 = $('d2-cajon') ? $('d2-cajon').querySelectorAll('table.med-tabla').length : -1;
        o.a7Rot1 = leerRot('d2-cajon').join(' / ');
        verD2('vci');
        try { _d2Render(); } catch (e) {}
        await esp(260);
        o.a7Rot2 = leerRot('d2-cajon').join(' / ');
        o.a7NoApila = o.a7Rot2.indexOf('DDVI') < 0;   // la del VI desaparecio
        verD2('vi');
        try { _d2Render(); } catch (e) {}
        await esp(260);
        const vuelta = $('d2-cajon') ? [...$('d2-cajon').querySelectorAll('table.med-tabla tbody tr')]
          .map(tr => ({ t:(tr.children[0]||{}).textContent||'', v:(tr.children[1]||{}).textContent||'' })) : [];
        const fDd = vuelta.filter(f => f.t.indexOf('DDVI') === 0)[0];
        o.a7Restaura = !!fDd && fDd.v.indexOf('52') >= 0;
        /* El desborde del cajon 2D con UNA tabla de cinco columnas, para separar el defecto del
           reparto en dos del de las columnas. */
        o.d2ScrollX = $('d2-cajon') ? ($('d2-cajon').scrollWidth - $('d2-cajon').clientWidth) : -1;
        o.d2Tablas = $('d2-cajon') ? $('d2-cajon').querySelectorAll('table.med-tabla').length : -1;
        /* 2D -> Doppler -> 2D: la tabla del 2D desaparece y al volver se restaura con su valor. */
        try { medHerramienta('vel'); } catch (e) {}
        await esp(300);
        o.a7D2OcultoEnDop = !!$('d2-cajon') && getComputedStyle($('d2-cajon')).display === 'none';
        try { medHerramienta('dist'); } catch (e) {}
        await esp(300);
        const v2 = $('d2-cajon') ? [...$('d2-cajon').querySelectorAll('table.med-tabla tbody tr')]
          .map(tr => ({ t:(tr.children[0]||{}).textContent||'', v:(tr.children[1]||{}).textContent||'' })) : [];
        const f2 = v2.filter(f => f.t.indexOf('DDVI') === 0)[0];
        o.a7D2VuelveConValor = !!f2 && f2.v.indexOf('52') >= 0;

        /* ── 6. LA HERRAMIENTA AREA Y SUS ESTRUCTURAS (D) ────────────────────────────────── */
        try { medHerramienta('area'); } catch (e) { o.errFn.push('herr area: ' + e.message); }
        await esp(320);
        const sideBtns = $('cine-side') ? [...$('cine-side').querySelectorAll('.cine-selbtn')] : [];
        o.areaEstRot = sideBtns.map(b => (b.textContent||'').trim()).join(' | ');
        o.areaTieneVD = o.areaEstRot.indexOf('VD') >= 0;
        o.volumenPresente = o.areaEstRot.indexOf('Volumen') >= 0;

        /* ── 7. LA CALIBRACION DE VELOCIDAD (C) ─────────────────────────────────────────── */
        o.calDosValores = typeof window._medCalVelDos === 'function';
        o.calRecalPresente = !!$('cine-med-recal');
        try { o.calTieneLinea = typeof window._medCalVelLinea === 'function'; } catch (e) { o.calTieneLinea = false; }

        /* ── 8. EL GLOBO DE TEXTOS (A4) ─────────────────────────────────────────────────── */
        const info = document.querySelectorAll('#cine-ov [data-med-info]');
        o.infoN = info.length;
        o.infoAltos = [...info].map(b => { const r = b.getBoundingClientRect();
          const a = parseFloat(getComputedStyle(b, '::after').height) || 0;
          return Math.round(Math.max(r.height, a)); });
        o.infoMin = o.infoAltos.length ? Math.min.apply(null, o.infoAltos) : -1;

        /* ── 9. TEXTOS RECORTADOS, en todo el overlay ───────────────────────────────────── */
        const ov = $('cine-ov');
        let rec = 0;
        if (ov) [...ov.querySelectorAll('*')].forEach(e => {
          if (e.children.length) return;
          if (e.scrollWidth - e.clientWidth > 1 && getComputedStyle(e).overflowX !== 'auto') rec++;
        });
        o.recortados = rec;
        return o;
      })()`).catch(e => ({ errEval: String(e && e.message || e).slice(0, 300) }));

      salida.push(Object.assign({ motor:M.n, w:V.w, h:V.h, temaPedido:tema }, o,
        { errsPagina: errs.slice(0,4), errsConsola: cons.slice(0,4) }));
      await ctx.close();
    }
  }
  await nav.close();
}
srv.close();
console.log(JSON.stringify(salida, null, 1));
