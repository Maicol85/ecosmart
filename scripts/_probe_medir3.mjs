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
                         (typeof window._medCalVelDos === 'function') &&
                         (typeof window._medFacVD === 'function');

        const $ = id => document.getElementById(id);
        const esp = ms => new Promise(r => setTimeout(r, ms));
        /* El modo se ASEGURA en vez de alternarse: los dos son toggles y llamarlos a secas
           hereda el modo del bloque anterior y lo APAGA si ya era el pedido. */
        const verD2 = m => { try { if (!_d2Estado() || _d2Estado().modo !== m) d2Modo(m); } catch (e) { o.errFn.push('verD2: ' + e.message); } };
        const verDop = m => { try { if (!_dopEstado() || _dopEstado().modo !== m) dopModo(m); } catch (e) { o.errFn.push('verDop: ' + e.message); } };
        const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
          return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top) }; };

        /* ⚠️ EL FIXTURE TRAE LAS DOS REGIONES, 2D Y DOPPLER, como un DICOM de verdad: la primera
           con los dos ejes en cm (unidad 3) y la segunda con el X en segundos (4) y el Y en cm/s
           (7) mas su linea de base. Con una sola region 2D, la herramienta Velocidad queda fuera
           de juego y el cajon Doppler no se dibuja — que es como la primera corrida de esta sonda
           midio CERO tablas sobre un cajon que funciona. */
        const jpg = new Uint8Array([255,216,255,217]);
        const R2D = { ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:600, y1:240, tipo:1 };
        const RDOP = { ux:4, uy:7, dx:0.004, dy:-0.5, ry0:420, rvy:0, x0:0, y0:250, x1:600, y1:500, tipo:2 };
        const mk = (n, regs) => ({ nombre:n, cuadros:1, d:{ frags:[jpg], cols:600, filas:500,
          msCuadro:0, regiones: regs } });
        try { _cineAbrir([mk('A', [R2D, RDOP])]); } catch (e) { o.errFn.push('abrir: ' + e.message); return o; }
        await esp(420);
        try { if (!_vistaA.medOn) $('cine-medir').click(); } catch (e) { o.errFn.push('medir: ' + e.message); }
        await esp(420);

        /* ── 1. LA GEOMETRIA DEL PANEL (A1 / A2) ─────────────────────────────────────────── */
        o.modal   = caja($('cine-modal'));
        o.lienzo  = caja($('cine-lienzo'));
        o.recorte = caja($('cine-recorte'));
        o.canvas  = caja($('cine-cv'));
        const cd = document.querySelector('#cine-ov .cine-col-der');
        o.colDer  = caja(cd);
        /* EL NEGRO A LOS COSTADOS DE LA IMAGEN: se mide contra el envoltorio que LLEVA el negro,
           no contra el lienzo. El lienzo es el que ocupa la columna; si el negro vive en el, lo
           que sobra se pinta. Las dos mitades: cuanto sobra, y de quien es el fondo. */
        o.negroLados = (o.recorte && o.canvas) ? Math.max(0, o.recorte.w - o.canvas.w) : -1;
        o.fondoLienzo  = $('cine-lienzo') ? getComputedStyle($('cine-lienzo')).backgroundColor : '(no)';
        o.fondoRecorte = $('cine-recorte') ? getComputedStyle($('cine-recorte')).backgroundColor : '(no)';
        const transp = c => c === 'rgba(0, 0, 0, 0)' || c === 'transparent';
        o.lienzoSinNegro = transp(o.fondoLienzo);
        /* SIN EXPRESION REGULAR: la barra invertida de /rgb\\(/ NO sobrevive al template
           literal que se evalua en el navegador —llega como un GRUPO y no como un parentesis
           literal—, asi que la prueba daria false sobre un fondo que SI es negro. Es la trampa
           que esta casa ya documenta para las sondas. */
        const soloNums = c => String(c).replace(/[^0-9,]/g, '');
        o.recorteConNegro = soloNums(o.fondoRecorte).indexOf('0,0,0') === 0;
        o.anchoColIzq = (o.lienzo ? o.lienzo.w : -1);
        /* A2: el selector FIJO fuera del scroller, y el scroller es el que desplaza. */
        const sc = document.querySelector('#cine-ov .cine-der-scroll');
        o.haySroller = !!sc;
        o.sideFueraDelScroller = !!(sc && $('cine-side') && !sc.contains($('cine-side')));
        o.scrollerTieneCajones = !!(sc && $('cine-der-slot') && sc.contains($('cine-der-slot')));
        o.colDerOverflowY = cd ? getComputedStyle(cd).overflowY : '(no)';
        o.scrollerOverflowY = sc ? getComputedStyle(sc).overflowY : '(no)';
        o.sideFlexShrink = $('cine-side') ? getComputedStyle($('cine-side')).flexShrink : '(no)';
        o.colDerScrollY = cd ? (cd.scrollHeight - cd.clientHeight) : -1;
        o.modalScrollY  = $('cine-modal') ? ($('cine-modal').scrollHeight - $('cine-modal').clientHeight) : -1;
        o.docScrollX    = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        const b2d = $('cine-g-2d');
        o.btn2dVisible = !!(b2d && b2d.getBoundingClientRect().height > 0);

        /* ── 2. LOS BOTONES DE LA BARRA (B) ──────────────────────────────────────────────── */
        const barra = $('cine-grp-med');
        const bs = barra ? [...barra.querySelectorAll('button')] : [];
        o.barraN = bs.length;
        const lum = c => { const q = String(c); if (q.indexOf('(') < 0) return null;
          const n = q.slice(q.indexOf('(')+1, q.lastIndexOf(')')).split(',').slice(0,3).map(x => parseFloat(x));
          if (!isFinite(n[0])) return null;
          const f = v => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
          return 0.2126*f(n[0]) + 0.7152*f(n[1]) + 0.0722*f(n[2]); };
        const fondoDe = el => { let m = el;
          while (m && m !== document.documentElement) { const bg = getComputedStyle(m).backgroundColor;
            if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg; m = m.parentElement; }
          return 'rgb(255, 255, 255)'; };
        const contrasteDe = el => { const s = getComputedStyle(el);
          const L1 = lum(s.color);
          const L2 = lum(transp(s.backgroundColor) ? fondoDe(el.parentElement) : s.backgroundColor);
          if (L1 == null || L2 == null) return null;
          return +(((Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05)).toFixed(2)); };
        o.barraBotones = bs.map(b => { const r = b.getBoundingClientRect(), s = getComputedStyle(b);
          return { id: b.id || '(sin id)', rot: (b.textContent||'').trim().slice(0,26),
            w: Math.round(r.width), h: Math.round(r.height), y: Math.round(r.top),
            bg: s.backgroundColor, cont: contrasteDe(b) };
        });
        const ws = o.barraBotones.map(b => b.w), hs = o.barraBotones.map(b => b.h);
        const ys = o.barraBotones.map(b => b.y);
        o.barraMismoAncho = ws.length > 0 && Math.max.apply(null, ws) - Math.min.apply(null, ws) <= 1;
        o.barraMismoAlto  = hs.length > 0 && Math.max.apply(null, hs) - Math.min.apply(null, hs) <= 1;
        o.barraMismaFila  = ys.length > 0 && Math.max.apply(null, ys) - Math.min.apply(null, ys) <= 1;
        o.barraAltoMin    = hs.length ? Math.min.apply(null, hs) : -1;
        o.barraAltoMax    = hs.length ? Math.max.apply(null, hs) : -1;
        o.barraAnchoMin   = ws.length ? Math.min.apply(null, ws) : -1;
        const cts = o.barraBotones.map(b => b.cont).filter(x => x != null);
        o.barraPeorContraste = cts.length ? Math.min.apply(null, cts) : -1;
        /* «Azul» = el canal azul manda sobre los otros dos por un margen claro. */
        const esAzul = bg => { const q = String(bg); if (q.indexOf('(') < 0) return false;
          const n = q.slice(q.indexOf('(')+1, q.lastIndexOf(')')).split(',').map(x => parseFloat(x));
          if (n.length < 3 || !isFinite(n[0])) return false;
          if (n.length > 3 && n[3] === 0) return false;
          return n[2] > 120 && n[2] - n[0] > 40 && n[2] - n[1] > 30; };
        o.barraAzules = o.barraBotones.filter(b => esAzul(b.bg)).map(b => b.id);
        /* El modo APAGADO: el mismo boton tiene que dejar de ser azul. */
        try { $('cine-medir').click(); } catch (e) { o.errFn.push('apagar: ' + e.message); }
        await esp(300);
        o.azulesApagado = (barra ? [...barra.querySelectorAll('button')] : [])
          .filter(b => esAzul(getComputedStyle(b).backgroundColor)).map(b => b.id || '(sin id)');
        try { $('cine-medir').click(); } catch (e) {}
        await esp(380);

        /* ── 3. LA TABLA: UNA MEDIDA POR FILA (A3 / A4) ──────────────────────────────────── */
        try { medHerramienta('vel'); } catch (e) { o.errFn.push('herr vel: ' + e.message); }
        o.herrTrasVel = (typeof _medHerr !== 'undefined') ? _medHerr : '(no)';
        verDop('ao');
        try { const P = _dopEstado().ao; P.vmax = 4.2; P.vtiVao = 90; P.diam = 21; P.vtiTsvi = 22; _dopRender(); }
        catch (e) { o.errFn.push('sembrar dop: ' + e.message); }
        await esp(340);
        const dc = $('dop-cajon');
        o.dopTablas = dc ? dc.querySelectorAll('table.med-tabla').length : -1;
        const filasDe = cont => cont ? [...cont.querySelectorAll('table.med-tabla tbody tr')]
          .filter(tr => tr.children.length >= 4)
          .map(tr => { const r = tr.getBoundingClientRect();
            return { t: (tr.children[0].textContent||'').trim(),
                     v: (tr.children[1].textContent||'').trim(),
                     cols: tr.children.length,
                     y: Math.round(r.top + r.height/2), x: Math.round(r.left),
                     h: Math.round(r.height) }; }) : [];
        const nf = filasDe(dc);
        o.dopFilasN = nf.length;
        o.dopCuatroCols = nf.length > 0 && nf.every(f => f.cols === 4);
        let lado = 0;
        for (let i = 0; i < nf.length; i++) for (let j = i+1; j < nf.length; j++) {
          if (Math.abs(nf[i].y - nf[j].y) < 6 && Math.abs(nf[i].x - nf[j].x) > 20) lado++;
        }
        o.dopParesLadoALado = lado;
        o.dopScrollX = dc ? (dc.scrollWidth - dc.clientWidth) : -1;
        o.dopTh = dc && dc.querySelector('table.med-tabla thead')
          ? [...dc.querySelectorAll('table.med-tabla thead th')].map(e => (e.textContent||'').trim()).join('|')
          : '(sin tabla)';
        /* El valor GRANDE y la unidad CHICA, por estilo COMPUTADO del nodo de cada uno. */
        const prim = dc ? dc.querySelector('table.med-tabla tbody tr') : null;
        if (prim && prim.children.length >= 2) {
          const sp = [...prim.children[1].querySelectorAll('span')];
          o.valorPx = sp[0] ? parseFloat(getComputedStyle(sp[0]).fontSize) : -1;
          o.uniPx   = sp[1] ? parseFloat(getComputedStyle(sp[1]).fontSize) : -1;
          o.nomPx   = parseFloat(getComputedStyle(prim.children[0]).fontSize);
          o.valorPeso = sp[0] ? getComputedStyle(sp[0]).fontWeight : '(no)';
        } else { o.valorPx = -1; o.uniPx = -1; o.nomPx = -1; o.valorPeso = '(no)'; }
        /* Las zonas tactiles de los botones de la fila, y sus SOLAPES. */
        const fbs = dc ? [...dc.querySelectorAll('.med-fbot')] : [];
        o.filaBotN = fbs.length;
        o.filaBotAreas = fbs.map(b => Math.round(parseFloat(getComputedStyle(b, '::after').height) || 0));
        o.filaBotAreaMin = o.filaBotAreas.length ? Math.min.apply(null, o.filaBotAreas) : -1;
        o.filaBotVisMin = fbs.length ? Math.min.apply(null, fbs.map(b => Math.round(b.getBoundingClientRect().height))) : -1;
        const solapes = els => { let n = 0;
          for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
            const r1 = els[i].getBoundingClientRect(), r2 = els[j].getBoundingClientRect();
            if (!(r1.left < r2.right - 1 && r2.left < r1.right - 1)) continue;
            const d = Math.abs((r1.top + r1.height/2) - (r2.top + r2.height/2));
            if (d > 0.5 && d < 44) n++;
          }
          return n; };
        o.filaBotSolapes = solapes(fbs);

        /* ── 4. EL GLOBO ⓘ Y LOS TEXTOS MOVIDOS (A4) ─────────────────────────────────────── */
        const infos = [...document.querySelectorAll('#cine-ov [data-med-info]')];
        o.infoN = infos.length;
        o.infoClaves = infos.map(b => b.getAttribute('data-med-info')).join(',');
        o.infoAreas = infos.map(b => Math.round(parseFloat(getComputedStyle(b, '::after').height) || 0));
        o.infoAreaMin = o.infoAreas.length ? Math.min.apply(null, o.infoAreas) : -1;
        o.infoEsBoton = infos.every(b => b.tagName === 'BUTTON');
        try { o.infoDop = (window._medPanelInfo('dop') || {}).txts || []; } catch (e) { o.infoDop = []; }
        try { o.infoVel = (window._medPanelInfo('vel') || {}).txts || []; } catch (e) { o.infoVel = []; }
        o.infoDopN = o.infoDop.length; o.infoVelN = o.infoVel.length;
        /* Los textos NO estan a la vista en el panel: eso es «se movio» y no «se duplico». */
        const txtCajon = dc ? (dc.textContent || '') : '';
        o.dopTxtVisibleTieneDescargo = txtCajon.indexOf('Los derivados se recalculan solos') >= 0;
        /* Y el globo ABRE de verdad, con su dialogo y su foco. */
        try { infos.filter(b => b.getAttribute('data-med-info') === 'dop')[0].click(); } catch (e) { o.errFn.push('abrir globo: ' + e.message); }
        await esp(240);
        const gov = $('med-info-ov');
        o.globoAbre = !!gov;
        o.globoRol = gov ? gov.getAttribute('role') : '(no)';
        o.globoModal = gov ? gov.getAttribute('aria-modal') : '(no)';
        o.globoFoco = document.activeElement ? (document.activeElement.id || document.activeElement.tagName) : '(no)';
        o.globoParrafos = gov ? gov.querySelectorAll('p').length : -1;
        /* Escape cierra el globo y NO el visor. */
        try { document.dispatchEvent(new KeyboardEvent('keydown', { key:'Escape', bubbles:true })); } catch (e) {}
        await esp(220);
        o.globoCierraConEsc = !$('med-info-ov');
        o.visorSigueAbierto = !!$('cine-ov');

        /* ── 5. EL ORDEN DEL VI Y EL DIAM TSVI (A5) ──────────────────────────────────────── */
        try { medHerramienta('dist'); } catch (e) {}
        verD2('vi');
        try { _d2Render(); } catch (e) {}
        await esp(300);
        o.viRot = filasDe($('d2-cajon')).map(f => f.t).join(' / ');
        o.d2ScrollX = $('d2-cajon') ? ($('d2-cajon').scrollWidth - $('d2-cajon').clientWidth) : -1;
        o.d2Tablas = $('d2-cajon') ? $('d2-cajon').querySelectorAll('table.med-tabla').length : -1;
        /* El Diam TSVI cargado DESDE la tabla de Aorta tiene que llegar al cajon Doppler y a la
           ruta del informe: es el valor compartido que H2 declara. */
        verD2('ao');
        try { _d2Render(); } catch (e) {}
        await esp(300);
        o.aoRot = filasDe($('d2-cajon')).map(f => f.t).join(' / ');
        o.tsviEnVI = o.viRot.indexOf('Diam TSVI') >= 0;
        o.tsviEnAo = o.aoRot.indexOf('Diam TSVI') >= 0;
        try { _d2Poner('vi.tsvi', 21.5); } catch (e) { o.errFn.push('poner tsvi: ' + e.message); }
        try { o.tsviEnDop = _dopEstado().ao.diam; } catch (e) { o.tsviEnDop = '(err)'; }
        /* El punto de «esta estructura ya tiene mediciones» tiene que salir en AORTA y no en VI. */
        try { o.conDatosAo = _d2GrupoConDatos('ao'); o.conDatosVi = _d2GrupoConDatos('vi'); }
        catch (e) { o.conDatosAo = '(err)'; o.conDatosVi = '(err)'; }

        /* ── 6. UNA TABLA POR ESTRUCTURA, Y SE RESTAURA (A7) ─────────────────────────────── */
        verD2('vi');
        try { _d2Poner('vi.ddvi', 52); _d2Render(); } catch (e) { o.errFn.push('a7 sembrar: ' + e.message); }
        await esp(260);
        o.a7Tablas1 = $('d2-cajon') ? $('d2-cajon').querySelectorAll('table.med-tabla').length : -1;
        verD2('vci');
        try { _d2Render(); } catch (e) {}
        await esp(260);
        o.a7NoApila = filasDe($('d2-cajon')).map(f => f.t).join('/').indexOf('DDVI') < 0;
        verD2('vi');
        try { _d2Render(); } catch (e) {}
        await esp(260);
        const fDd = filasDe($('d2-cajon')).filter(f => f.t.indexOf('DDVI') === 0)[0];
        o.a7Restaura = !!fDd && fDd.v.indexOf('52') >= 0;
        try { medHerramienta('vel'); } catch (e) {}
        await esp(300);
        o.a7D2OcultoEnDop = !!$('d2-cajon') && getComputedStyle($('d2-cajon')).display === 'none';
        try { medHerramienta('dist'); } catch (e) {}
        await esp(300);
        const f2 = filasDe($('d2-cajon')).filter(f => f.t.indexOf('DDVI') === 0)[0];
        o.a7D2VuelveConValor = !!f2 && f2.v.indexOf('52') >= 0;

        /* ── 7. LA CALIBRACION DE VELOCIDAD CON DOS VALORES (C) ──────────────────────────── */
        o.calDosValores = typeof window._medCalVelDos === 'function';
        o.calRecalPresente = !!$('cine-med-recal');
        /* El caso del pedido, con valores conocidos: marcas en 0,5 y 1,0 m/s. */
        try {
          const cal = window._medCalVelDos(400, 50, 300, 100);   // cm/s
          o.calK = cal ? +cal.cmsPorPx.toFixed(4) : null;
          o.calY0 = cal ? Math.round(cal.y0) : null;
          /* La lectura va por el MISMO camino que usa la app. */
          o.calLee100 = cal ? Math.round((cal.y0 - 300) * cal.cmsPorPx) : null;
          o.calLee50  = cal ? Math.round((cal.y0 - 400) * cal.cmsPorPx) : null;
          o.calMismoValor = window._medCalVelDos(400, 100, 300, 100) === null;
          o.calMuyJuntas  = window._medCalVelDos(400, 50, 403, 100) === null;
        } catch (e) { o.errFn.push('cal: ' + e.message); }
        /* La linea del cero se DIBUJA: se mide por pixeles del canvas de medicion. */
        try {
          medHerramienta('vel');
          _medCalibVel = { y0: 420, cmsPorPx: 0.5 };
          _medPintar();
        } catch (e) { o.errFn.push('pintar cero: ' + e.message); }
        await esp(260);
        try {
          const cvm = $('cine-med');
          const ctx = cvm.getContext('2d');
          const fr = ctx.getImageData(0, Math.max(0, 420 - 2), cvm.width, 5);
          let tinta = 0;
          for (let i = 3; i < fr.data.length; i += 4) if (fr.data[i] > 20) tinta++;
          o.ceroTinta = tinta;
          const fr2 = ctx.getImageData(0, 100, cvm.width, 5);
          let t2 = 0;
          for (let i = 3; i < fr2.data.length; i += 4) if (fr2.data[i] > 20) t2++;
          o.ceroTintaFuera = t2;
        } catch (e) { o.errFn.push('leer cero: ' + e.message); o.ceroTinta = -1; }

        /* ── 8. EL FAC DEL VD (D) ───────────────────────────────────────────────────────── */
        o.facFn = typeof window._medFacVD === 'function';
        try {
          const F = window._medFacVD(20, 12);
          o.facCuenta = F ? +F.fac.toFixed(1) : null;      // (20-12)/20*100 = 40
          o.facInvertido = (window._medFacVD(12, 20) || {}).invertido === true;
          o.facSinUna = window._medFacVD(20, null) === null;
        } catch (e) { o.errFn.push('fac: ' + e.message); }
        try { medHerramienta('area'); } catch (e) { o.errFn.push('herr area: ' + e.message); }
        await esp(320);
        const sideBtns = $('cine-side') ? [...$('cine-side').querySelectorAll('.cine-selbtn')] : [];
        o.areaEstRot = sideBtns.map(b => (b.textContent||'').trim()).join(' | ');
        o.areaTieneVD = o.areaEstRot.indexOf('VD diást.') >= 0 && o.areaEstRot.indexOf('VD sist.') >= 0;
        o.volumenPresente = o.areaEstRot.indexOf('Volumen') >= 0;
        /* EL CENSO DEL FORMULARIO, antes y despues de poner las dos areas del VD: ni un control
           del documento puede cambiar de valor. Es la condicion de «no escribe nada». */
        const censo = () => [...document.querySelectorAll('input[id],select[id],textarea[id]')]
          .filter(e => !e.closest('#cine-ov'))
          .map(e => e.id + '=' + (e.type === 'checkbox' ? (e.checked ? 1 : 0) : (e.value || ''))).join('|');
        const antes = censo();
        try {
          _medAreas.push({ pts:[], cm2:20, est:'vdd' });
          _medAreas.push({ pts:[], cm2:12, est:'vds' });
          _medEstado();
        } catch (e) { o.errFn.push('areas vd: ' + e.message); }
        await esp(300);
        o.censoIgual = (censo() === antes);
        o.vdFacCampo = ($('vd_fac') || {}).value || '';
        o.vdAreaDCampo = ($('vd_area_d') || {}).value || '';
        const guia = $('cine-med-barra');
        const gf = filasDe(guia);
        o.facFilas = gf.map(f => f.t + '=' + f.v).join(' / ');
        o.facTieneTres = gf.length === 3;
        o.facRotuloApp = o.facFilas.indexOf('Área VD telediastólica') >= 0 &&
                         o.facFilas.indexOf('Área VD telesistólica') >= 0;
        o.facValor = (gf.filter(f => f.t.indexOf('FAC') === 0)[0] || {}).v || '(no)';

        /* ── 9. LA BANDA DE «Vmax pulmonar» (E) ─────────────────────────────────────────── */
        try { o.bandaVmaxPul = JSON.stringify(window._dopBanda ? _dopBanda('pul.vmaxEp') : 'sin fn'); }
        catch (e) { o.bandaVmaxPul = '(err)'; }
        try { o.bandaIp = JSON.stringify([_dopBanda('pul.vmaxIp'), _dopBanda('pul.vmaxIpTd')]); }
        catch (e) { o.bandaIp = '(err)'; }

        /* ── 10. TEXTOS RECORTADOS Y DESBORDE, en todo el overlay ───────────────────────── */
        const ov = $('cine-ov');
        let rec = 0;
        if (ov) [...ov.querySelectorAll('*')].forEach(e => {
          if (e.children.length) return;
          if (e.scrollWidth - e.clientWidth > 1 && getComputedStyle(e).overflowX !== 'auto') rec++;
        });
        o.recortados = rec;

        /* ── 11. EL MODO M APAGA VELOCIDAD (C) ──────────────────────────────────────────── */
        try {
          const RM = { ux:4, uy:3, dx:0.004, dy:0.05, x0:0, y0:0, x1:600, y1:500, tipo:3 };
          _cineAbrir([mk('M', [RM])]);
        } catch (e) { o.errFn.push('abrir M: ' + e.message); }
        await esp(420);
        try { if (!_vistaA.medOn) $('cine-medir').click(); } catch (e) {}
        await esp(380);
        try { o.mBloquea = window._medVelBloqueadaM(); } catch (e) { o.mBloquea = '(err)'; }
        try { medHerramienta('dop'); } catch (e) {}
        try { _medGrupo = 'dop'; _medEstado(); } catch (e) {}
        await esp(320);
        const bv = $('cine-med-vel');
        o.mBtnVelPresente = !!bv;
        o.mBtnVelApagado = !!(bv && (bv.disabled || bv.getAttribute('aria-disabled') === 'true'));
        try { medHerramienta('vel'); o.mHerrTras = _medHerr; } catch (e) { o.mHerrTras = '(err)'; }
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
