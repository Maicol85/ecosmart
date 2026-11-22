#!/usr/bin/env node
/**
 * _probe_p11a.mjs - TAREA 1 de la tanda P11. Chrome del sistema y WebKit, los TRES tamanios que
 * la orden pide con su alto real (1440x900, 1920x1080 y 2560x1440) y los DOS temas REALES,
 * puestos con ett_theme + loadTheme() y DEVUELTOS por la sonda.
 *
 * Esc y la segunda vista se manejan desde aca: Esc necesita teclado de verdad, y la vista B
 * necesita un estudio guardado con imagenes.
 *
 *     node scripts/_probe_p11a.mjs <ruta-absoluta/index.html>
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const FILE = process.argv[2];
if (!FILE) { console.error('falta la ruta ABSOLUTA del index.html'); process.exit(2); }
const raiz = dirname(FILE), nom = FILE.slice(raiz.length + 1);
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css' };
const { srv, port } = await new Promise(res => {
  const s = createServer(async (req, rq) => {
    try { const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/,'') || nom;
      const p = join(raiz, rel); if (!p.startsWith(raiz)) { rq.writeHead(403).end(); return; }
      /* ⚠️ SE LEE ANTES DE MANDAR LA CABECERA: al reves, un archivo que no esta tira DESPUES de
         `writeHead(200)` y el `catch` revienta con ERR_HTTP_HEADERS_SENT, que mata la sonda
         entera. Lo pago medir contra un arbol de comparacion que solo tiene el index.html. */
      const cuerpo = await readFile(p);
      rq.writeHead(200,{'Content-Type':MIME[extname(p)]||'application/octet-stream'}).end(cuerpo);
    } catch { rq.writeHead(404).end('no'); }
  });
  s.listen(0,'127.0.0.1',()=>res({srv:s,port:s.address().port}));
});

const TAM = (process.env.P11_TAM || '1440x900,1920x1080,2560x1440').split(',')
  .map(t => { const [w,h] = t.split('x').map(x => parseInt(x,10)); return { w, h }; });
const TEMAS = (process.env.P11_TEMAS || 'noche,dia').split(',');
const _MOT = { chrome: () => _pw.chromium.launch({ channel:'chrome' }), webkit: () => _pw.webkit.launch() };
const MOTORES = (process.env.P11_MOTORES || 'chrome,webkit').split(',').map(n => ({ n, lanzar:_MOT[n] }));
const CUERPO = await readFile(new URL('./_probe_p11a_cuerpo.js', import.meta.url), 'utf8');
const salida = [];

for (const M of MOTORES) {
  let nav = null;
  try { nav = await M.lanzar(); } catch (e) { salida.push({ motor:M.n, errMotor:String(e&&e.message||e).slice(0,140) }); continue; }
  for (const T of TAM) {
    for (const TM of TEMAS) {
      const ctx = await nav.newContext({ viewport:{ width:T.w, height:T.h } });
      const pg = await ctx.newPage();
      const errs = []; pg.on('pageerror', e => errs.push(String(e&&e.message||e).slice(0,160)));
      const cons = []; pg.on('console', m => { if (m.type()==='error') cons.push(m.text().slice(0,160)); });
      await pg.addInitScript(t => { try { localStorage.setItem('ett_theme', t === 'dia' ? 'light' : 'dark'); } catch (e) {} }, TM);
      await pg.goto('http://127.0.0.1:' + port + '/' + nom, { waitUntil:'load' });
      await pg.waitForTimeout(1400);
      await pg.evaluate(() => { try { if (typeof loadTheme === 'function') loadTheme(); } catch (e) {}
        try { const o = document.getElementById('login-overlay'); if (o) o.style.display = 'none'; } catch (e) {} });
      await pg.waitForTimeout(250);
      let r;
      try { r = await pg.evaluate(CUERPO); }
      catch (e) { r = { err:['evaluate: ' + String(e&&e.message||e).slice(0,200)] }; }

      /* ── 1.6 — Esc con teclado de verdad: sale del tamanio y NO cierra el visor ── */
      let esc = null;
      try {
        const antes = await pg.evaluate(() => { const o = document.getElementById('cine-ov');
          return { max: o.classList.contains('cine-max'), vis: getComputedStyle(o).display,
                   nLineas: _vistaA.medLineas.length }; });
        await pg.keyboard.press('Escape');
        await pg.waitForTimeout(420);
        const uno = await pg.evaluate(() => { const o = document.getElementById('cine-ov');
          return o ? { max: o.classList.contains('cine-max'), vis: getComputedStyle(o).display,
                       nLineas: _vistaA.medLineas.length,
                       mm: (function(){ const l=_vistaA.medLineas.filter(x=>!x.calibracion); return l.length?l[l.length-1].mm:null; })() } : { ido:true }; });
        await pg.keyboard.press('Escape');
        await pg.waitForTimeout(420);
        const dos = await pg.evaluate(() => { const o = document.getElementById('cine-ov');
          return o ? { max: o.classList.contains('cine-max'), vis: getComputedStyle(o).display } : { ido:true }; });
        esc = { antes, trasUno: uno, trasDos: dos };
      } catch (e) { esc = { err:String(e&&e.message||e).slice(0,160) }; }

      /* ── 1.3 — DOS VISTAS EN PANTALLA COMPLETA: UNA sola columna ── */
      let dos = null;
      try {
        dos = await pg.evaluate(async () => {
          const esp = ms => new Promise(r => setTimeout(r, ms));
          const out = {};
          const jpg = new Uint8Array([255,216,255,217]);
          const R2D = { ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:1016, y1:708, tipo:1 };
          const mk = n => ({ nombre:n, cuadros:4, d:{ frags:[jpg,jpg,jpg,jpg], cols:1016, filas:708, msCuadro:40, regiones:[R2D] } });
          try { if (!document.getElementById('cine-ov') || getComputedStyle(document.getElementById('cine-ov')).display === 'none') _cineAbrir([mk('A')]); } catch (e) {}
          await esp(400);
          const UU = 'p11-uuid';
          /* El selector de la vista B lista por `CeiboCine.listar(uuid)` y abre por
             `_cineLoopDeDisco(rec.id)`: se sustituyen esos dos y nada mas. */
          try { if (typeof CeiboCine === 'object' && CeiboCine) {
              CeiboCine.listar = async () => [{ id:'k1', uuid:UU, nombre:'B-fix', cuadros:4, bytes:400, tipo:'loop' }]; } } catch (e) { out.e1 = String(e.message); }
          try { window._cineLoopDeDisco = async () => mk('B-fix'); } catch (e) { out.e1b = String(e.message); }
          try { if (typeof CeiboImg === 'object' && CeiboImg) CeiboImg.leer = async () => []; } catch (e) {}
          try { cfgToggleGuardarImagenes(true); } catch (e) {}
          await esp(160);
          try { await imgRestaurar(UU); } catch (e) { out.e2 = String(e.message); }
          await esp(220);
          try { const pr = vistaBAbrir(); await esp(700);
            const th = document.querySelector('[data-vpick-i]');
            out.pick = !!th;
            if (th) { th.click(); await esp(900); }
            try { await pr; } catch (e) {} } catch (e) { out.e3 = String(e.message); }
          await esp(500);
          out.hayB = !!_vistaB;
          out.pfxB = _vistaB ? _vistaB.pfx : null;
          const ov = document.getElementById('cine-ov');
          /* Normal con dos vistas: las DOS columnas */
          const cols = () => Array.from(document.querySelectorAll('#cine-paneles .cine-col-der'))
            .map(c => ({ id:c.id, display:getComputedStyle(c).display, w:Math.round(c.getBoundingClientRect().width) }));
          out.normalCols = cols();
          if (!ov.classList.contains('cine-max')) { try { document.getElementById('cine-maxi').click(); } catch (e) {} }
          await esp(500);
          out.maxCols = cols();
          out.maxVisibles = out.maxCols.filter(c => c.display !== 'none').length;
          /* El foco: tocar el panel de la B tiene que pasarle la columna */
          const pb = document.getElementById((_vistaB ? _vistaB.pfx : 'b-') + 'cine-panel');
          if (pb) pb.dispatchEvent(new PointerEvent('pointerdown', { bubbles:true }));
          await esp(420);
          out.trasFocoB = cols();
          out.focoEsB = (typeof _vFocoVista === 'function') ? (_vFocoVista() === _vistaB) : null;
          out.maxiEnB = !!(document.getElementById('cine-maxi') &&
            document.getElementById(((_vistaB&&_vistaB.pfx)||'') + 'cine-imgtr') &&
            document.getElementById(((_vistaB&&_vistaB.pfx)||'') + 'cine-imgtr').contains(document.getElementById('cine-maxi')));
          /* Y cerrar la B devuelve la columna de la A */
          try { vistaCerrarUna(_vistaB); } catch (e) { out.e4 = String(e.message); }
          await esp(420);
          out.trasCerrarB = cols();
          out.idsDup = (function(){ const v=Object.create(null), d=[]; const o2=document.getElementById('cine-ov');
            if (!o2) return null; o2.querySelectorAll('[id]').forEach(e => { if (v[e.id]) { if (d.indexOf(e.id)<0) d.push(e.id); } else v[e.id]=1; }); return d; })();
          return out;
        });
      } catch (e) { dos = { err:String(e&&e.message||e).slice(0,200) }; }

      salida.push({ motor:M.n, tam:T.w+'x'+T.h, tema:TM, errsPagina:errs, errsConsola:cons, ...r, esc, dos });
      await ctx.close();
    }
  }
  await nav.close();
}
srv.close();
console.log(JSON.stringify(salida, null, 1));
process.exit(0);
