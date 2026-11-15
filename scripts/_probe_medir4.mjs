#!/usr/bin/env node
/**
 * _probe_medir4.mjs - MEDIR-4: las dos vistas, sus barras, el Simpson biplano y la casilla
 * «A la app», medido EN EL NAVEGADOR en Chrome y en WebKit, a 1440x900, 1280x800 y 1180x800,
 * en los DOS temas reales.
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
 * `CeiboCine.listar`, que en una sonda no existen. Se monta con `_vNueva` + `_vMontarPanel` +
 * `_vCablear` y se le pone `datos` directo, que es el mismo camino por el que la app la deja.
 *
 * ** SE MIDE EL ESTILO COMPUTADO Y LA GEOMETRIA, no el marcado: en MEDIR-2 el `row-gap` de 16 px
 * paso todas las pruebas de marcado y NO APLICABA, porque el atajo `gap` en linea le ganaba.
 *
 *     node scripts/_probe_medir4.mjs <ruta/index.html>
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

const ANCHOS = [{ w:1440, h:900 }, { w:1280, h:800 }, { w:1180, h:800 }];
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
        /* EL DETECTOR DE QUE SON DOS ARBOLES: lo de MEDIR-4 y no lo de MEDIR-3. */
        o.tieneLoNuevo = (typeof window._medCampoDe === 'function') &&
                         (typeof window._vCerrarVista === 'function');

        const $ = id => document.getElementById(id);
        const esp = ms => new Promise(r => setTimeout(r, ms));
        const caja = el => { if (!el) return null; const r = el.getBoundingClientRect();
          return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top) }; };

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

        /* ── UNA SOLA VISTA ──────────────────────────────────────────────────────────────── */
        o.una = {
          lienzo: caja($('cine-lienzo')), canvas: caja($('cine-cv')),
          colDer: caja(document.querySelector('#cine-ov .cine-col-der')),
          modal: caja($('cine-modal')),
          modalScrollY: $('cine-modal') ? ($('cine-modal').scrollHeight - $('cine-modal').clientHeight) : -1,
          docScrollX: document.documentElement.scrollWidth - document.documentElement.clientWidth
        };

        /* ── SE MONTA LA VISTA B, como TC-199 ────────────────────────────────────────────── */
        try {
          const cont = $('cine-paneles');
          const VB = _vNueva('b-', 'B');
          _vMontarPanel(cont, 'b-');
          window._vistaB_probe = VB;
          /* _vistaB es un let de nivel de script: no se puede escribir por window, asi que lo
             que se hace es montar el panel y dejar que _vCablear lo conecte, que es exactamente
             lo que hace TC-199. _vAccionesSync cuenta los paneles del DOM, no lee _vistaB, asi
             que la clase de dos vistas se pone igual.
             ** SIN ACENTOS GRAVES EN ESTE COMENTARIO: esta dentro del template literal que se
             evalua en el navegador, y un acento grave lo cierra antes de tiempo. */
          _vCablear(VB);
          _vCon(VB, () => { VB.datos = { loops:[mk('B', [R2D, RDOP])], i:0, cuadro:0, timer:null }; _cineCargarLoop(); });
          _vAccionesSync();
        } catch (e) { o.errFn.push('montarB: ' + e.message); }
        await esp(520);

        o.dosPaneles = document.querySelectorAll('#cine-paneles [id$="cine-panel"]').length;
        o.clase2v = !!($('cine-paneles') && $('cine-paneles').classList.contains('cine-2v'));

        /* ── (a) LOS CONTENEDORES Y SUS ANCHOS ───────────────────────────────────────────── */
        const pA = $('cine-panel'), pB = $('b-cine-panel');
        o.panelA = caja(pA); o.panelB = caja(pB);
        o.lienzoA = caja($('cine-lienzo')); o.lienzoB = caja($('b-cine-lienzo'));
        o.canvasA = caja($('cine-cv'));     o.canvasB = caja($('b-cine-cv'));
        o.colDerA = caja(pA ? pA.querySelector('.cine-col-der') : null);
        o.colDerB = caja(pB ? pB.querySelector('.cine-col-der') : null);
        /* LAS DOS IMAGENES A LA MISMA ALTURA: su borde de arriba y su alto. */
        o.imgMismaY = (o.lienzoA && o.lienzoB) ? Math.abs(o.lienzoA.y - o.lienzoB.y) : -1;
        o.imgMismoAlto = (o.lienzoA && o.lienzoB) ? Math.abs(o.lienzoA.h - o.lienzoB.h) : -1;
        o.modalScrollY2 = $('cine-modal') ? ($('cine-modal').scrollHeight - $('cine-modal').clientHeight) : -1;
        o.docScrollX2 = document.documentElement.scrollWidth - document.documentElement.clientWidth;

        /* ── (b) LAS DOS BARRAS: ORDEN Y ALTO ────────────────────────────────────────────── */
        const barraDe = p => {
          const b = p ? p.querySelector('.cine-barra') : null;
          if (!b) return null;
          const bs = [...b.querySelectorAll('button')];
          const r = b.getBoundingClientRect();
          return { y: Math.round(r.top), h: Math.round(r.height),
            n: bs.length,
            ids: bs.map(x => (x.id || '(sin id)').replace(/^b-/, '')),
            altos: bs.map(x => Math.round(x.getBoundingClientRect().height)),
            ys: bs.map(x => Math.round(x.getBoundingClientRect().top)) };
        };
        o.barraA = barraDe(pA); o.barraB = barraDe(pB);
        o.barrasMismoOrden = !!(o.barraA && o.barraB &&
          o.barraA.ids.join('|') === o.barraB.ids.join('|'));
        o.barrasMismaY = (o.barraA && o.barraB) ? Math.abs(o.barraA.y - o.barraB.y) : -1;
        o.barrasMismoAlto = (o.barraA && o.barraB) ? Math.abs(o.barraA.h - o.barraB.h) : -1;
        const todosAltos = [].concat(o.barraA ? o.barraA.altos : [], o.barraB ? o.barraB.altos : []);
        o.botonAltoMin = todosAltos.length ? Math.min.apply(null, todosAltos) : -1;
        o.botonAltoMax = todosAltos.length ? Math.max.apply(null, todosAltos) : -1;

        /* LOS CONTROLES DE REPRODUCCION, alineados entre si. */
        const repDe = p => { if (!p) return null;
          const s = p.querySelector('[id$="cine-slider"]'); if (!s) return null;
          const r = s.getBoundingClientRect(); return { y: Math.round(r.top), h: Math.round(r.height) }; };
        o.repA = repDe(pA); o.repB = repDe(pB);
        o.repMismaY = (o.repA && o.repB) ? Math.abs(o.repA.y - o.repB.y) : -1;

        /* ── (a) QUE HACE CADA «CERRAR» ──────────────────────────────────────────────────── */
        /* Se lee el manejador CABLEADO, no se aprieta: apretarlo cierra el visor y se lleva la
           medicion de todo lo que sigue. El nombre de la funcion es lo que dice que hace. */
        const nomDe = el => { try { return el && el.onclick ? (el.onclick.name || '(anonima)') : '(sin onclick)'; }
                              catch (e) { return '(err)'; } };
        o.cerrarA = { existe: !!$('cine-cerrar'), rot: ($('cine-cerrar')||{}).textContent,
                      fn: nomDe($('cine-cerrar')) };
        o.cerrarB = { existe: !!$('b-cine-cerrar-v'), rot: ($('b-cine-cerrar-v')||{}).textContent,
                      fn: nomDe($('b-cine-cerrar-v')) };
        o.cerrarVistaEnA = !!$('cine-cerrar-v');
        o.cerrarTodo = { existe: !!$('cine-cerrar-todo'), fn: nomDe($('cine-cerrar-todo')) };
        o.syncExiste = !!$('cine-sync');

        /* ── (c) COMO ARMA «+ Vista» SU LISTA ────────────────────────────────────────────── */
        o.pickerSoloLoops = (function () {
          try { const s = String(window._vElegirLoop || '');
                return s.indexOf("'fija'") >= 0 || s.indexOf('"fija"') >= 0; } catch (e) { return null; }
        })();

        /* ── (d) EL ESTADO POR VISTA Y LO COMPARTIDO ─────────────────────────────────────── */
        o.estadoPorVista = (function () {
          try {
            const A = _vistaA, B = window._vistaB_probe;
            if (!A || !B) return null;
            return { tablasSeparadas: A.medPuntos !== B.medPuntos,
                     calibSeparada: A.medCalibVel !== B.medCalibVel || (A.medCalibVel === null && B.medCalibVel === null),
                     simpSeparado: A.simp !== B.simp || (A.simp === null && B.simp === null) };
          } catch (e) { return null; }
        })();

        /* ── (e) QUE ESCRIBE EL BOTON DEL BIPLANO ────────────────────────────────────────── */
        o.biplanoBoton = !!$('cine-biplano-integ');
        o.campos = {};
        ['fevi','fevi_met','vdfvi','vsfvi','diam_tsvi','itv_tsvi','vti_tsvd','vd_area_d',
         'vd_area_s','vd_fac'].forEach(id => {
          const el = $(id);
          o.campos[id] = el ? { existe:true, val:String(el.value||''), ro: !!el.readOnly,
                                tag: el.tagName.toLowerCase() } : { existe:false };
        });

        /* ── (f) «GUARDAR EN BIBLIOTECA» DEL SIMPSON ─────────────────────────────────────── */
        o.simpBib = !!$('cine-simp-bib-u');

        /* ── TEXTOS RECORTADOS Y SOLAPES DE AREA TACTIL ──────────────────────────────────── */
        const vis = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0; };
        const tactiles = [...document.querySelectorAll('#cine-ov button')].filter(vis);
        o.tactilN = tactiles.length;
        o.tactilBajo44 = tactiles.filter(b => {
          const r = b.getBoundingClientRect();
          let h = r.height;
          try { const a = getComputedStyle(b, '::after');
                const ah = parseFloat(a.height); if (isFinite(ah) && ah > h) h = ah; } catch (e) {}
          return h < 43.5;
        }).map(b => (b.id||'(sin id)') + ':' + Math.round(b.getBoundingClientRect().height));
        o.recortados = [...document.querySelectorAll('#cine-ov *')].filter(el => {
          if (!vis(el)) return false;
          if (el.children.length) return false;
          return el.scrollWidth > el.clientWidth + 1;
        }).length;

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
