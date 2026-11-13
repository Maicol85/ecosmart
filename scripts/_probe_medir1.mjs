#!/usr/bin/env node
/**
 * _probe_medir1.mjs - MEDIR-1: la ventana, la barra unica y las dos columnas del visor,
 * medidas EN EL NAVEGADOR a 1440x900 y a 1280x800.
 *
 * ** LLEVA SU DETECTOR DE QUE SON DOS ARBOLES. La ruta por omision de una sonda es la del arbol
 * real, asi que correrla DESDE un worktree no alcanza: los numeros salen identicos, que es justo
 * lo que la prueba queria afirmar, y nadie lo nota. Es el defecto que PANT-37 pago con
 * _probe_ec2dos.mjs. El campo `tieneLoNuevo` dice si el arbol medido trae lo de esta tanda; en
 * el arbol base tiene que decir NO.
 *
 * ** LO QUE SE MIDE ES SI LA IMAGEN, LA REPRODUCCION Y LA TABLA ENTRAN JUNTAS SIN MOVER LA
 * VENTANA. El numero que lo dice es `scrollY`: cuanto desplazamiento VERTICAL tiene el modal con
 * la medicion encendida y una estructura elegida. Cero es lo pedido. La tabla puede llevar el
 * suyo propio (`tablaScroll`), que es lo que la orden autoriza expresamente.
 *
 *     node scripts/_probe_medir1.mjs <ruta/index.html>
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
const nav = await _pw.chromium.launch({ channel: 'chrome' });
const salida = [];

for (const V of ANCHOS) {
  for (const tema of TEMAS) {
    const ctx = await nav.newContext({ viewport:{ width:V.w, height:V.h } });
    const pg = await ctx.newPage();
    const errs = []; pg.on('pageerror', e => errs.push(String(e&&e.message||e).slice(0,140)));
    const cons = []; pg.on('console', m => { if (m.type()==='error') cons.push(m.text().slice(0,140)); });
    await pg.goto('http://127.0.0.1:'+port+'/'+nom, { waitUntil:'load', timeout:120000 });
    await pg.waitForTimeout(2600);

    /* EL TEMA SE PONE COMO LO PONE LA APP: la clase `light-mode` que escribe `loadTheme()`
       leyendo `localStorage.ett_theme`. NO es `prefers-color-scheme` -- ese fue el hallazgo de
       metodo de PANT-34, y dos sondas midieron dos veces el tema oscuro antes de cazarlo. La
       sonda DEVUELVE que tema quedo puesto, para que el control no se pueda falsear solo. */
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
      /* ⚠️ LA CLASE VA EN EL ELEMENTO html Y NO EN BODY, y la primera version de esta sonda la
         busco en body: los cuatro cruces dieron «noche» sobre un tema que SI se habia puesto.
         Medir mal el control negativo se lee igual que no tenerlo.
         (Sin acentos graves: este comentario vive DENTRO del template literal que se evalua en
         el navegador, y ahi un acento grave cierra la cadena — la trampa que CLAUDE.md
         documenta hace veintidos tandas y que esta sonda pago igual.) */
      o.tema = document.documentElement.classList.contains('light-mode') ? 'dia' : 'noche';

      /* EL DETECTOR DE QUE SON DOS ARBOLES */
      o.tieneLoNuevo = (typeof window.cineMaxToggle === 'function');

      /* Cineloop SINTETICO -- esta sonda no necesita el pendrive y no toca un dato de paciente. */
      const jpg = new Uint8Array([255,216,255,217]);
      /* ⚠️ EL FIXTURE ES GRANDE A PROPOSITO: 1200x900. Con una imagen de 400x300 el lienzo mide
         300 px y «todo entra sin mover la ventana» es cierto por el tamaño del fixture y no por
         el layout — un denominador que da verde sobre nada. A 1200x900 el canvas pide mas alto
         del que hay y lo que se mide es la acotacion. */
      const mk = n => ({ nombre:n, cuadros:1, d:{ frags:[jpg], cols:1200, filas:900, msCuadro:0,
        regiones:[{ ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:1200, y1:900, tipo:1 }] } });
      try { _cineAbrir([mk('A')]); } catch (e) { o.errFn.push('abrir: ' + e.message); return o; }
      await new Promise(r => setTimeout(r, 420));

      const $ = id => document.getElementById(id);
      const caja = id => { const e = $(id); if (!e) return null;
        const r = e.getBoundingClientRect();
        return { x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height) }; };

      o.overlay = !!$('cine-ov');
      o.modal   = !!$('cine-modal');

      /* ── 1. VENTANA ──────────────────────────────────────────────────────────────────── */
      o.btnMaxi   = !!$('cine-maxi');
      o.btnCerrar = !!$('cine-cerrar-todo');
      const cm = caja('cine-maxi'), cc = caja('cine-cerrar-todo');
      o.maxiCaja = cm; o.cerrarCaja = cc;
      /* «Arriba a la derecha»: los dos en la primera franja del modal y pegados al borde. */
      const mo = caja('cine-modal');
      /* «Arriba a la derecha» es del PAR, no del boton de maximizar solo: el de cerrar es el que
         queda pegado al borde y el de maximizar va a su izquierda. La primera version medía la
         distancia del MAXI al borde y daba 71 px — un falso rojo sobre un layout correcto. */
      o.maxiArribaDerecha = !!(cm && cc && mo && cm.y < mo.y + 70 && cc.y < mo.y + 70 &&
        (mo.x + mo.w - (cc.x + cc.w)) < 40 && (cc.x - (cm.x + cm.w)) < 24);
      o.cerrarDerechaDeMaxi = !!(cm && cc && cc.x > cm.x);
      o.btnMin = !!document.querySelector('#cine-ov [id*="minim"]');  // NO debe existir

      /* maximizada ocupa toda la pantalla */
      o.maxAntes = cineMaxActivo();
      cineMaxToggle();
      await new Promise(r => setTimeout(r, 300));
      o.maxDespues = cineMaxActivo();
      const mx = caja('cine-modal');
      o.modalMax = mx;
      o.ocupaPantalla = !!(mx && mx.w >= innerWidth - 1 && mx.h >= innerHeight - 1 && mx.x <= 1 && mx.y <= 1);
      o.maxiTitulo = ($('cine-maxi')||{}).title || '';
      o.maxiPressed = ($('cine-maxi')||{}).getAttribute ? $('cine-maxi').getAttribute('aria-pressed') : '';
      cineMaxToggle();  // restaurar
      await new Promise(r => setTimeout(r, 300));
      o.restaurado = !cineMaxActivo();
      const mr = caja('cine-modal');
      o.modalRestaurado = mr;
      o.restauraAncho = !!(mr && mr.w <= 1182);

      /* ── 2. LA BARRA UNICA ───────────────────────────────────────────────────────────── */
      /* La medicion ENCENDIDA: el visor siempre abre en modo minimo y ahi la barra esta
         podada a proposito. Sin esto se mide sobre tres botones y parece que faltan cinco. */
      try { if (!_vistaA.medOn) $('cine-medir').click(); } catch (e) { o.errFn.push('medir: ' + e.message); }
      await new Promise(r => setTimeout(r, 420));
      o.medOn = !!_vistaA.medOn;
      o.modoMinimo = $('cine-ov').classList.contains('cine-min');

      const barra = document.querySelector('#cine-ov .cine-barra');
      o.hayBarra = !!barra;
      o.barras = document.querySelectorAll('#cine-ov .cine-barra').length;
      const btns = barra ? [...barra.querySelectorAll('button')] : [];
      o.botones = btns.map(b => {
        const r = b.getBoundingClientRect(), cs = getComputedStyle(b);
        return { id:b.id||'', txt:(b.textContent||'').trim().slice(0,30),
                 w:Math.round(r.width), h:Math.round(r.height),
                 y:Math.round(r.y), radio:cs.borderTopLeftRadius,
                 alto:b.classList.contains('cine-b-alto') };
      });
      /* esquinas RECTAS, MISMO ancho, UNA fila */
      o.todosRectos = o.botones.length > 0 && o.botones.every(b => parseFloat(b.radio) === 0);
      const anchos = [...new Set(o.botones.map(b => b.w))];
      o.anchosDistintos = anchos;
      o.mismoAncho = anchos.length === 1;
      const ys = [...new Set(o.botones.map(b => b.y))];
      o.filasDeBotones = ys.length;
      /* los dos destacados */
      o.destacados = o.botones.filter(b => b.alto).map(b => b.id);
      const norm = o.botones.filter(b => !b.alto), dest = o.botones.filter(b => b.alto);
      o.altoNormal = [...new Set(norm.map(b => b.h))];
      o.altoDestacado = [...new Set(dest.map(b => b.h))];
      o.destacadosMasAltos = dest.length > 0 && norm.length > 0 &&
        Math.min(...dest.map(b => b.h)) > Math.max(...norm.map(b => b.h));
      /* el color de acento, resuelto */
      const acento = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
      o.acentoVar = acento;
      const db = dest[0] ? $(dest[0].id) : null;
      o.destacadoFondo = db ? getComputedStyle(db).backgroundColor : '';
      o.destacadoEsAcento = !!(db && getComputedStyle(db).backgroundColor !== 'rgba(0, 0, 0, 0)');
      /* piso tactil */
      o.bajoDe44 = o.botones.filter(b => b.h < 44).map(b => b.id || b.txt);
      /* las funciones de antes siguen: los ocho ids */
      const IDS = ['cine-medir','cine-med-recal','cine-med-borrar','cine-guardar','cine-cap',
                   'cine-med-cap','cine-add-b','cine-cerrar'];
      o.idsFaltantes = IDS.filter(i => !$(i));
      o.etiqueta = !!$('cine-cap-etiq');
      o.separadores = document.querySelectorAll('#cine-ov .cine-barra .cine-sep').length;

      /* ── 3. DOS COLUMNAS ─────────────────────────────────────────────────────────────── */
      const lienzo = caja('cine-lienzo'), der = (() => {
        const e = document.querySelector('#cine-ov .cine-col-der'); if (!e) return null;
        const r = e.getBoundingClientRect();
        return { x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height) };
      })();
      o.lienzo = lienzo; o.colDer = der;
      o.imagenIzquierdaPanelDerecha = !!(lienzo && der && der.x >= lienzo.x + lienzo.w - 2);
      o.ladoALado = !!(lienzo && der && Math.abs(der.y - lienzo.y) < 60);

      /* elegir una estructura para que la tabla tenga filas */
      try {
        for (let i=0;i<3 && _vistaA.medGrupo!=='2d';i++) $('cine-g-2d').click();
        await new Promise(r => setTimeout(r, 120));
        if ($('cine-med-dist')) $('cine-med-dist').click();
        await new Promise(r => setTimeout(r, 200));
        const bt = document.querySelector('#d2-cajon [data-d2-modo="vi"]');
        if (bt) bt.click();
        await new Promise(r => setTimeout(r, 260));
      } catch (e) { o.errFn.push('estructura: ' + e.message); }
      o.d2Visible = (() => { const c = $('d2-cajon'); return !!(c && c.style.display !== 'none'); })();
      o.d2Filas = document.querySelectorAll('#d2-cajon table tr').length;
      o.cajonesEnColumna = (() => {
        const s = $('cine-der-slot'); if (!s) return false;
        return ['cine-biplano','cine-simp-uni','cine-dop-slot','d2-cajon']
          .every(id => { const n = $(id); return !!(n && s.contains(n)); });
      })();

      /* ── EL NUMERO QUE IMPORTA: ¿hay que subir y bajar la ventana? ───────────────────── */
      const md = $('cine-modal');
      o.scrollY = md ? Math.max(0, md.scrollHeight - md.clientHeight) : -1;
      o.scrollX = md ? Math.max(0, md.scrollWidth - md.clientWidth) : -1;
      o.docScrollY = Math.max(0, document.documentElement.scrollHeight - innerHeight);
      const dd = document.querySelector('#cine-ov .cine-col-der');
      o.tablaScroll = dd ? Math.max(0, dd.scrollHeight - dd.clientHeight) : -1;
      /* denominador: que haya algo que contar */
      o.alturaModal = md ? Math.round(md.getBoundingClientRect().height) : -1;

      /* texto recortado */
      o.recortados = [...document.querySelectorAll('#cine-ov button, #cine-ov label')]
        .filter(e => e.scrollWidth > e.clientWidth + 1).map(e => (e.id || e.textContent.trim()).slice(0,24));
      return o;
    })()`);

    o.anchoVentana = V.w; o.altoVentana = V.h; o.temaPedido = tema;
    o.errores = errs; o.consola = cons;
    salida.push(o);
    await ctx.close();
  }
}
await nav.close(); srv.close();
console.log(JSON.stringify(salida, null, 1));
