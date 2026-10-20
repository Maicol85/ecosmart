/* Pasada de la tanda Y3e en los DOS motores. Resuelve Playwright POR RUTA y, si no esta, lo
   DICE y sale con codigo 2 en vez de reventar. Sin acentos graves en los comentarios. */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
const req = createRequire(import.meta.url);
let pw = null;
for (const c of ['/tmp/node_modules/playwright/index.js', '/tmp/pw/node_modules/playwright/index.js']) {
  try { pw = req(c); break; } catch (e) {}
}
if (!pw) { console.log(JSON.stringify({ err: 'SIN PLAYWRIGHT' })); process.exit(2); }

const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const srv = createServer(async (q, r) => {
  const f = q.url.split('?')[0] === '/' ? '/index.html' : q.url.split('?')[0];
  try { const b = await readFile(RAIZ + decodeURIComponent(f));
    r.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' });
    r.end(b); } catch (e) { r.writeHead(404); r.end(); }
});
await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
const PORT = srv.address().port;

const MEDIR = `(function(){
  var o = {};
  try { sessionStorage.setItem('ett_auth','1') } catch(e){}
  ['modalAvisoEco','login-overlay'].forEach(function(id){ var m = document.getElementById(id);
    if (m) { m.style.display = 'none'; m.remove() } });
  /* La transgastrica */
  try { showTab('ete');
    var s = document.getElementById('ete-seccion-mitral');
    if (s && getComputedStyle(s).display === 'none') toggleEteSeccion('mitral');
    eteQxVista('tg'); window._qxRot = ETE_QX_VISTAS.tg.rot; window._qxFlip = ETE_QX_VISTAS.tg.flip;
    eteQxDibujar();
    var mk = function(id){ var e = document.getElementById(id);
      return e ? [Math.round(parseFloat(e.getAttribute('x'))), Math.round(parseFloat(e.getAttribute('y')))] : null };
    o.tg = { rot: ETE_QX_VISTAS.tg.rot, Ao: mk('ete-qx-mAo'), AL: mk('ete-qx-mAL'), PM: mk('ete-qx-mPM') };
    o.letras = ['A1','A2','A3','P1','P2','P3'].filter(function(n){
      var e = document.getElementById('ete-qx-lbl-' + n); if (!e) return false;
      var cs = getComputedStyle(e), r = e.getBoundingClientRect();
      return cs.display !== 'none' && r.width > 0 }).length;
    o.lx = { A: ['A1','A2','A3'].map(function(n){ var e = document.getElementById('ete-qx-lbl-' + n);
               return e ? Math.round(parseFloat(e.getAttribute('x'))) : null }),
             P: ['P1','P2','P3'].map(function(n){ var e = document.getElementById('ete-qx-lbl-' + n);
               return e ? Math.round(parseFloat(e.getAttribute('x'))) : null }) };
  } catch (e) { o.tgErr = String(e.message) }
  /* La VAB */
  try { showTab('congenitas');
    var c = document.getElementById('sacc-cc-vab');
    var b = c ? c.querySelector('.sacc-body') : null;
    if (b && getComputedStyle(b).display === 'none') secToggle('cc-vab');
    var pon = function(id, v){ var e = document.getElementById(id); if (!e) return;
      e.value = v; e.dispatchEvent(new Event('change', { bubbles: true })) };
    pon('va_morf','Bicúspide'); pon('vab_rafe','si'); pon('vab_tipo','fused_rl');
    var ang = function(){ var e = document.getElementById('vab-cierre'); if (!e) return null;
      var n = (String(e.getAttribute('d')||'').match(/-?[0-9]+(?:\\.[0-9]+)?/g)||[]).map(Number);
      if (n.length < 6) return null;
      var a0 = Math.atan2(n[1]-n[3], n[0]-n[2]) * 180 / Math.PI;
      var a1 = Math.atan2(n[5]-n[3], n[4]-n[2]) * 180 / Math.PI;
      var t = Math.abs(a0-a1) % 360; if (t > 180) t = 360 - t; return Math.round(t) };
    o.vab = {};
    ['', 'simetrica', 'asimetrica', 'muy_asimetrica'].forEach(function(k){
      pon('vab_simetria', k); o.vab[k || 'vacia'] = ang() });
    var sel = document.getElementById('vab_simetria');
    o.opts = sel ? Array.prototype.slice.call(sel.options).map(function(x){ return x.value }) : null;
    var fg = sel && sel.closest ? sel.closest('.fg') : null;
    var lb = fg ? fg.querySelector('label') : null;
    o.rotulo = lb ? lb.textContent.replace(/\\s+/g,' ').trim() : null;
    var sv = document.getElementById('vab-svg');
    var rs = sv ? sv.getBoundingClientRect() : null;
    o.svg = rs ? [Math.round(rs.width), Math.round(rs.height)] : null;
    o.color = (function(){ var r = document.getElementById('vab-rafe'), l = document.getElementById('vab-lR');
      return { rafe: r ? getComputedStyle(r).stroke : null, letra: l ? getComputedStyle(l).fill : null } })();
  } catch (e) { o.vabErr = String(e.message) }
  var d = document.documentElement;
  o.scrollH = { sw: d.scrollWidth, cw: d.clientWidth, hay: d.scrollWidth > d.clientWidth + 1 };
  return o })()`;

const OUT = { motores: {} };
for (const m of ['chromium', 'webkit']) {
  const lanzar = m === 'chromium' ? { channel: 'chrome' } : {};
  let b = null;
  try { b = await pw[m].launch(lanzar); } catch (e) {
    OUT.motores[m] = { err: 'NO ARRANCA: ' + String(e.message).slice(0, 90) }; continue; }
  OUT.motores[m] = { version: b.version(), celdas: {} };
  for (const [w, h] of [[1200, 700], [768, 1024], [390, 844], [360, 740]]) {
    for (const claro of [false, true]) {
      const ctx = await b.newContext({ viewport: { width: w, height: h } });
      const pg = await ctx.newPage();
      await pg.goto('http://127.0.0.1:' + PORT + '/index.html', { waitUntil: 'load', timeout: 120000 });
      await pg.waitForTimeout(2500);
      await pg.evaluate((c) => { document.documentElement.classList.toggle('light-mode', c); }, claro);
      await pg.waitForTimeout(250);
      const temaOk = await pg.evaluate(() => document.documentElement.classList.contains('light-mode'));
      if (temaOk !== claro) { OUT.motores[m].celdas[w + 'x' + h + (claro ? '_dia' : '_noche')] =
        { err: 'EL TEMA NO QUEDO' }; await ctx.close(); continue; }
      const r = await pg.evaluate(MEDIR);
      r.temaOk = temaOk;
      OUT.motores[m].celdas[w + 'x' + h + (claro ? '_dia' : '_noche')] = r;
      await ctx.close();
    }
  }
  await b.close();
}
console.log(JSON.stringify(OUT, null, 1));
srv.close(); process.exit(0);
