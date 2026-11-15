#!/usr/bin/env node
/**
 * _probe_medir4a.mjs - MEDIR-4a: la alineacion de las dos vistas, el cierre por vista, la
 * columna de 340 px, el resultado abajo y centrado, y la tabla en la columna de la vista activa.
 * Medido EN EL NAVEGADOR en Chrome y en WebKit, a 1500x900, 1440x900, 1280x800 y 1180x800, en
 * los DOS temas reales.
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
 * ** LA VISTA B SE MONTA A MANO, como lo hace TC-199: `vistaBAbrir` exige un estudio guardado y
 * `CeiboCine.listar`, que en una sonda no existen.
 *
 * ** SE MIDE EL ESTILO COMPUTADO Y LA GEOMETRIA, no el marcado: en MEDIR-2 el `row-gap` de 16 px
 * paso todas las pruebas de marcado y NO APLICABA, porque el atajo `gap` en linea le ganaba.
 *
 *     node scripts/_probe_medir4a.mjs <ruta/index.html>
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

const ANCHOS = [{ w:1500, h:900 }, { w:1440, h:900 }, { w:1280, h:800 }, { w:1180, h:800 }];
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
      pg.on('dialog', d => d.accept());
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
        /* EL DETECTOR DE QUE SON DOS ARBOLES: lo de MEDIR-4a y no lo de MEDIR-3. */
        o.tieneLoNuevo = (typeof window._vSlotSync === 'function') &&
                         (typeof window.vistaCerrarUna === 'function');

        const $ = id => document.getElementById(id);
        const esp = ms => new Promise(r => setTimeout(r, ms));
        const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
          return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top) }; };

        /* ── CONTRASTE: color del texto contra el fondo EFECTIVO ──────────────────────────
           El fondo se busca subiendo por los antecesores hasta el primero que no sea
           transparente, porque los botones del visor son de fondo transparente a proposito. */
        const rgb = s => { const m = String(s||'').match(/-?[\\d.]+/g); if (!m) return null;
          const a = m.length > 3 ? parseFloat(m[3]) : 1;
          return { r:+m[0], g:+m[1], b:+m[2], a: isFinite(a) ? a : 1 }; };
        const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
          return 0.2126*f(c.r) + 0.7152*f(c.g) + 0.0722*f(c.b); };
        const mezcla = (fg, bg) => ({ r: fg.r*fg.a + bg.r*(1-fg.a),
                                      g: fg.g*fg.a + bg.g*(1-fg.a),
                                      b: fg.b*fg.a + bg.b*(1-fg.a), a:1 });
        const fondoDe = el => {
          let n = el;
          while (n && n.nodeType === 1) {
            const c = rgb(getComputedStyle(n).backgroundColor);
            if (c && c.a > 0.05) return c;
            n = n.parentElement;
          }
          return { r:255, g:255, b:255, a:1 };
        };
        const contraste = el => {
          try {
            const fg0 = rgb(getComputedStyle(el).color); if (!fg0) return null;
            const bg = fondoDe(el);
            const fg = fg0.a < 1 ? mezcla(fg0, bg) : fg0;
            const L1 = lum(fg), L2 = lum(bg);
            return Math.round(((Math.max(L1,L2)+0.05) / (Math.min(L1,L2)+0.05)) * 100) / 100;
          } catch (e) { return null; }
        };

        /* El fixture trae las dos regiones, 2D y Doppler, como un DICOM de verdad: con una sola
           region 2D la herramienta Velocidad queda fuera de juego y el cajon Doppler no se
           dibuja -- la trampa que la sonda de MEDIR-3 ya pago. */
        const jpg = new Uint8Array([255,216,255,217]);
        const R2D = { ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:600, y1:240, tipo:1 };
        const RDOP = { ux:4, uy:7, dx:0.004, dy:-0.5, ry0:420, rvy:0, x0:0, y0:250, x1:600, y1:500, tipo:2 };
        const mk = (n, regs) => ({ nombre:n, cuadros:1, d:{ frags:[jpg], cols:600, filas:500,
          msCuadro:0, regiones: regs } });
        try { _cineAbrir([mk('A', [R2D, RDOP])]); } catch (e) { o.errFn.push('abrir: ' + e.message); return o; }
        await esp(420);
        try { if (!_vistaA.medOn) $('cine-medir').click(); } catch (e) { o.errFn.push('medir: ' + e.message); }
        await esp(380);

        /* ── BLOQUE B: UNA SOLA VISTA ─────────────────────────────────────────────────────
           Imagen a la izquierda, panel a la derecha, resultado en una franja debajo de las dos. */
        const pA0 = $('cine-panel');
        o.una = {
          nPaneles: document.querySelectorAll('#cine-paneles [id$="cine-panel"]').length,
          clase2v: !!($('cine-paneles') && $('cine-paneles').classList.contains('cine-2v')),
          lienzo: caja($('cine-lienzo')), canvas: caja($('cine-cv')),
          colDer: caja(document.querySelector('#cine-ov .cine-col-der')),
          modal: caja($('cine-modal')),
          /* Lado a lado: la columna arranca a la derecha del lienzo y a su misma altura. */
          ladoALado: (function () { const l = caja($('cine-lienzo')),
            c = caja(document.querySelector('#cine-ov .cine-col-der'));
            return (l && c) ? (c.x >= l.x + l.w - 2) : null; })(),
          modalScrollY: $('cine-modal') ? ($('cine-modal').scrollHeight - $('cine-modal').clientHeight) : -1,
          docScrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          /* El resultado: DEBAJO de los paneles y FUERA de la columna de medidas. */
          bipEnColumna: !!($('cine-biplano') && $('cine-biplano').closest('.cine-col-der')),
          uniEnColumna: !!($('cine-simp-uni') && $('cine-simp-uni').closest('.cine-col-der')),
          bipDespuesDePaneles: (function () {
            const p = $('cine-paneles'), b = $('cine-biplano');
            if (!p || !b) return null;
            return !!(p.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
          })(),
          /* La franja de abajo no empuja ni tapa el panel: la columna sigue a la derecha de la
             imagen y con el mismo ancho con el resultado VISIBLE. Se fuerza visible a mano. */
          cajonEnColumnaA: !!($('d2-cajon') && $('d2-cajon').closest('.cine-col-der')),
          cajonDopEnColumnaA: !!($('cine-dop-slot') && $('cine-dop-slot').closest('.cine-col-der'))
        };
        /* El resultado, VISIBLE, para medir que no empuje nada. */
        (function () { try {
          const b = $('cine-biplano'); if (!b) return;
          b.style.display = 'block'; b.textContent = 'Resultado de prueba';
          o.una.bipCaja = caja(b);
          o.una.colDerConRes = caja(document.querySelector('#cine-ov .cine-col-der'));
          o.una.lienzoConRes = caja($('cine-lienzo'));
          const m = caja($('cine-modal'));
          o.una.bipCentrado = (b && m) ? Math.round(((o.una.bipCaja.x - m.x) -
            ((m.x + m.w) - (o.una.bipCaja.x + o.una.bipCaja.w))) ) : null;
          b.style.display = 'none'; b.textContent = '';
        } catch (e) { o.errFn.push('bipUna: ' + e.message); } })();

        /* ── SE MONTA LA VISTA B, como TC-199 ────────────────────────────────────────────── */
        try {
          const cont = $('cine-paneles');
          const VB = _vNueva('b-', 'B');
          _vMontarPanel(cont, 'b-');
          window._vistaB_probe = VB;
          /* _vistaB es un let de nivel de script: no se puede escribir por window, asi que lo
             que se hace es montar el panel y dejar que _vCablear lo conecte, que es exactamente
             lo que hace TC-199.
             ** SIN ACENTOS GRAVES EN ESTE COMENTARIO: esta dentro del template literal que se
             evalua en el navegador, y un acento grave lo cierra antes de tiempo. */
          _vCablear(VB);
          _vCon(VB, () => { VB.datos = { loops:[mk('B', [R2D, RDOP])], i:0, cuadro:0, timer:null }; _cineCargarLoop(); });
          _vAccionesSync();
        } catch (e) { o.errFn.push('montarB: ' + e.message); }
        await esp(520);

        o.dosPaneles = document.querySelectorAll('#cine-paneles [id$="cine-panel"]').length;
        o.clase2v = !!($('cine-paneles') && $('cine-paneles').classList.contains('cine-2v'));

        /* ── (A1) LOS CONTENEDORES Y SUS ANCHOS ──────────────────────────────────────────── */
        const pA = $('cine-panel'), pB = $('b-cine-panel');
        o.panelA = caja(pA); o.panelB = caja(pB);
        o.lienzoA = caja($('cine-lienzo')); o.lienzoB = caja($('b-cine-lienzo'));
        o.canvasA = caja($('cine-cv'));     o.canvasB = caja($('b-cine-cv'));
        o.colDerA = caja(pA ? pA.querySelector('.cine-col-der') : null);
        o.colDerB = caja(pB ? pB.querySelector('.cine-col-der') : null);
        /* CUATRO COLUMNAS EN UNA FILA: imagen A, medidas A, imagen B, medidas B, en ese orden
           de izquierda a derecha y todas a la misma altura. */
        o.cuatroEnFila = (function () {
          const a = o.lienzoA, ca = o.colDerA, b = o.lienzoB, cb = o.colDerB;
          if (!a || !ca || !b || !cb) return null;
          return (a.x < ca.x) && (ca.x < b.x) && (b.x < cb.x) &&
                 (ca.x >= a.x + a.w - 2) && (cb.x >= b.x + b.w - 2);
        })();
        o.apiladas = (function () {
          const a = o.lienzoA, ca = o.colDerA;
          if (!a || !ca) return null;
          return ca.y >= a.y + a.h - 2;
        })();
        o.imgMismaY = (o.lienzoA && o.lienzoB) ? Math.abs(o.lienzoA.y - o.lienzoB.y) : -1;
        o.imgMismoAlto = (o.lienzoA && o.lienzoB) ? Math.abs(o.lienzoA.h - o.lienzoB.h) : -1;
        o.modalScrollY2 = $('cine-modal') ? ($('cine-modal').scrollHeight - $('cine-modal').clientHeight) : -1;
        o.docScrollX2 = document.documentElement.scrollWidth - document.documentElement.clientWidth;

        /* ── (A2) LAS DOS BARRAS: ORDEN, ALTO Y ALTURA EN PANTALLA ───────────────────────── */
        const barraDe = p => {
          const b = p ? p.querySelector('.cine-barra') : null;
          if (!b) return null;
          const bs = [...b.querySelectorAll('button')];
          const r = b.getBoundingClientRect();
          return { y: Math.round(r.top), h: Math.round(r.height),
            n: bs.length,
            ids: bs.map(x => (x.id || '(sin id)').replace(/^b-/, '')),
            altos: bs.map(x => Math.round(x.getBoundingClientRect().height)),
            anchos: bs.map(x => Math.round(x.getBoundingClientRect().width)),
            /* LINEAS QUE OCUPA: cuantos bordes de arriba distintos tienen sus botones. Es el
               denominador de «mismo alto de barra»: dos barras del mismo alto porque las dos
               envuelven igual, no porque ninguna envuelva. */
            lineas: [...new Set(bs.map(x => Math.round(x.getBoundingClientRect().top)))].length };
        };
        o.barraA = barraDe(pA); o.barraB = barraDe(pB);
        o.barrasMismoOrden = !!(o.barraA && o.barraB &&
          o.barraA.ids.join('|') === o.barraB.ids.join('|'));
        o.barrasMismaY = (o.barraA && o.barraB) ? Math.abs(o.barraA.y - o.barraB.y) : -1;
        o.barrasMismoAlto = (o.barraA && o.barraB) ? Math.abs(o.barraA.h - o.barraB.h) : -1;
        const todosAltos = [].concat(o.barraA ? o.barraA.altos : [], o.barraB ? o.barraB.altos : []);
        o.botonAltoMin = todosAltos.length ? Math.min.apply(null, todosAltos) : -1;
        o.botonAltoMax = todosAltos.length ? Math.max.apply(null, todosAltos) : -1;
        const todosAnchos = [].concat(o.barraA ? o.barraA.anchos : [], o.barraB ? o.barraB.anchos : []);
        o.botonAnchoMin = todosAnchos.length ? Math.min.apply(null, todosAnchos) : -1;
        o.botonAnchoMax = todosAnchos.length ? Math.max.apply(null, todosAnchos) : -1;

        /* LOS CONTROLES DE REPRODUCCION, alineados entre si. */
        const repDe = p => { if (!p) return null;
          const s = p.querySelector('[id$="cine-slider"]'); if (!s) return null;
          const r = s.getBoundingClientRect(); return { y: Math.round(r.top), h: Math.round(r.height) }; };
        o.repA = repDe(pA); o.repB = repDe(pB);
        o.repMismaY = (o.repA && o.repB) ? Math.abs(o.repA.y - o.repB.y) : -1;

        /* LOS DOS ENCABEZADOS, que es de donde salian los 30 px. */
        const encDe = p => { if (!p) return null;
          const e = p.firstElementChild; if (!e) return null;
          const r = e.getBoundingClientRect(); return { h: Math.round(r.height), y: Math.round(r.top),
            nBot: e.querySelectorAll('button').length }; };
        o.encA = encDe(pA); o.encB = encDe(pB);

        /* ── (A3) COLORES: AZUL SOLO PARA LO PRENDIDO, Y EL CONTRASTE ────────────────────── */
        o.azules = (function () {
          const pres = [];
          document.querySelectorAll('#cine-ov .cine-barra .btn').forEach(b => {
            const cs = getComputedStyle(b), bg = rgb(cs.backgroundColor);
            if (bg && bg.a > 0.05) pres.push((b.id||'(sin id)') + ':' + cs.backgroundColor);
          });
          return pres;
        })();
        o.contrasteBarraMin = (function () {
          const vs = [...document.querySelectorAll('#cine-ov .cine-barra .btn')]
            .map(contraste).filter(v => v != null);
          return vs.length ? Math.min.apply(null, vs) : null;
        })();
        o.contrasteBarraPeor = (function () {
          let peor = null, quien = null;
          document.querySelectorAll('#cine-ov .cine-barra .btn').forEach(b => {
            const c = contraste(b);
            if (c != null && (peor === null || c < peor)) { peor = c; quien = (b.id||'(sin id)'); }
          });
          return { v: peor, id: quien };
        })();

        /* ── (A4) EL CIERRE POR VISTA ────────────────────────────────────────────────────── */
        const nomDe = el => { try { return el && el.onclick ? (el.onclick.name || '(anonima)') : '(sin onclick)'; }
                              catch (e) { return '(err)'; } };
        const cvA = $('cine-cerrar-v'), cvB = $('b-cine-cerrar-v');
        o.cerrarVistaA = cvA ? { rot: (cvA.textContent||'').trim(), fn: nomDe(cvA),
          enBarra: !!cvA.closest('.cine-barra'), idx: [...cvA.parentElement.querySelectorAll('button')].indexOf(cvA) } : null;
        o.cerrarVistaB = cvB ? { rot: (cvB.textContent||'').trim(), fn: nomDe(cvB),
          enBarra: !!cvB.closest('.cine-barra'), idx: [...cvB.parentElement.querySelectorAll('button')].indexOf(cvB) } : null;
        o.cerrarVistaMismoRot = !!(cvA && cvB && (cvA.textContent||'').trim() === (cvB.textContent||'').trim());
        o.cerrarVistaMismoIdx = !!(o.cerrarVistaA && o.cerrarVistaB &&
          o.cerrarVistaA.idx === o.cerrarVistaB.idx);
        /* «➕ Vista» y «Cerrar» ya NO estan en ninguna barra: son del modal. */
        o.addBEnBarra = !!($('cine-add-b') && $('cine-add-b').closest('.cine-barra'));
        o.cerrarEnBarra = !!($('cine-cerrar') && $('cine-cerrar').closest('.cine-barra'));
        o.addBExiste = !!$('cine-add-b');
        o.cerrarExiste = !!$('cine-cerrar');
        o.cerrarTodoFn = nomDe($('cine-cerrar-todo'));
        o.syncExiste = !!$('cine-sync');
        o.nAddB = document.querySelectorAll('#cine-ov [id="cine-add-b"]').length;
        o.nCerrar = document.querySelectorAll('#cine-ov [id="cine-cerrar"]').length;

        /* ── LA TABLA VA EN LA COLUMNA DE LA VISTA ACTIVA ─────────────────────────────────
           Se mide con el gesto real: se pide el repintado DESDE cada vista y se mira en que
           columna quedo el nodo. Un repintado desde la B tiene que dejarlo en la columna de la
           B, y volver a A tiene que devolverlo. */
        o.cajon = { a0: null, b1: null, a2: null, dop0: null, dopB: null };
        try {
          const dondeD2 = () => { const n = $('d2-cajon'); if (!n) return 'no-existe';
            const c = n.closest('[id$="cine-panel"]'); return c ? (c.id || '(sin id)') : '(fuera)'; };
          const dondeDop = () => { const n = $('cine-dop-slot'); if (!n) return 'no-existe';
            const c = n.closest('[id$="cine-panel"]'); return c ? (c.id || '(sin id)') : '(fuera)'; };
          _vCon(_vistaA, () => { _d2Render(); _dopRender(); });
          o.cajon.a0 = dondeD2(); o.cajon.dop0 = dondeDop();
          _vCon(window._vistaB_probe, () => { _d2Render(); _dopRender(); });
          o.cajon.b1 = dondeD2(); o.cajon.dopB = dondeDop();
          _vCon(_vistaA, () => { _d2Render(); _dopRender(); });
          o.cajon.a2 = dondeD2();
          o.cajon.slotA = !!$('cine-der-slot');
          o.cajon.slotB = !!$('b-cine-der-slot');
        } catch (e) { o.errFn.push('cajon: ' + e.message); }

        /* ── EL RESULTADO, CON DOS VISTAS: ABAJO Y CENTRADO ──────────────────────────────── */
        o.res = { bipEnColumna: !!($('cine-biplano') && $('cine-biplano').closest('.cine-col-der')),
                  uniEnColumna: !!($('cine-simp-uni') && $('cine-simp-uni').closest('.cine-col-der')) };
        try {
          const b = $('cine-biplano'); const m = $('cine-modal');
          if (b && m) {
            b.style.display = 'block'; b.textContent = 'Resultado de prueba';
            const rb = b.getBoundingClientRect(), rm = m.getBoundingClientRect();
            const pa = $('cine-panel') ? $('cine-panel').getBoundingClientRect() : null;
            const pbb = $('b-cine-panel') ? $('b-cine-panel').getBoundingClientRect() : null;
            o.res.caja = { w: Math.round(rb.width), x: Math.round(rb.left), y: Math.round(rb.top) };
            /* Centrado: la distancia al borde izquierdo del modal menos la del derecho. */
            o.res.desbalance = Math.round((rb.left - rm.left) - ((rm.right) - (rb.right)));
            /* Centrado ENTRE LAS DOS MITADES: su centro contra el punto medio entre los dos paneles. */
            o.res.vsMedioPaneles = (pa && pbb)
              ? Math.round((rb.left + rb.right)/2 - (pa.left + pbb.right)/2) : null;
            o.res.debajoDeLosDos = !!(pa && pbb && rb.top >= pa.bottom - 2 && rb.top >= pbb.bottom - 2);
            b.style.display = 'none'; b.textContent = '';
          }
        } catch (e) { o.errFn.push('res2v: ' + e.message); }

        /* ── SOLAPES DE AREA TACTIL, POR PARES ──────────────────────────────────────────── */
        const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
        const tactiles = [...document.querySelectorAll('#cine-ov button')].filter(vis);
        o.tactilN = tactiles.length;
        const rectT = b => {
          const r = b.getBoundingClientRect();
          let top = r.top, bot = r.bottom;
          try { const a = getComputedStyle(b, '::after'); const ah = parseFloat(a.height);
            if (isFinite(ah) && ah > r.height) { const d = (ah - r.height)/2; top -= d; bot += d; }
          } catch (e) {}
          return { l:r.left, r:r.right, t:top, b:bot };
        };
        o.tactilBajo44 = tactiles.filter(b => {
          const t = rectT(b); return (t.b - t.t) < 43.5;
        }).map(b => (b.id||'(sin id)') + ':' + Math.round(rectT(b).b - rectT(b).t));
        o.solapes = (function () {
          const rs = tactiles.map(b => ({ id: b.id || '(sin id)', ...rectT(b) }));
          const pares = [];
          for (let i = 0; i < rs.length; i++) for (let j = i+1; j < rs.length; j++) {
            const A = rs[i], B = rs[j];
            const ox = Math.min(A.r, B.r) - Math.max(A.l, B.l);
            const oy = Math.min(A.b, B.b) - Math.max(A.t, B.t);
            if (ox > 1 && oy > 1) pares.push(A.id + '/' + B.id);
          }
          return pares;
        })();
        o.recortados = [...document.querySelectorAll('#cine-ov *')].filter(el => {
          if (!vis(el)) return false;
          if (el.children.length) return false;
          return el.scrollWidth > el.clientWidth + 1;
        }).length;
        /* El valor grande de la tabla, sin cortarse: su scrollWidth contra su clientWidth. */
        o.valoresCortados = [...document.querySelectorAll('#cine-ov .med-tabla td')]
          .filter(td => vis(td) && td.scrollWidth > td.clientWidth + 1).length;
        o.colScrollX = (function () {
          const s = [...document.querySelectorAll('#cine-ov .cine-der-scroll')];
          return s.map(e => e.scrollWidth - e.clientWidth);
        })();

        return o;
      })()`).catch(e => ({ errEval: String(e && e.message || e).slice(0, 300) }));

      salida.push({ motor:M.n, ancho:V.w, alto:V.h, temaPedido:tema, errs, cons, ...o });
      await ctx.close();
    }
  }
  await nav.close();
}
srv.close();
console.log(JSON.stringify(salida, null, 1));
