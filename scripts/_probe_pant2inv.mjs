/*
 * _probe_pant2inv.mjs - EL INVENTARIO de las 19 secciones de C. Congenitas (tanda PANT-2,
 * commit 1a, 2026-11-02). SOLO LECTURA: no toca un campo ni una linea de la app.
 * Nombre propio: verificado con ls.
 *
 * POR QUE EN EL DOM Y NO POR CENSO ESTATICO. Un censo sobre el texto de index.html no acota las
 * secciones: el ULTIMO acordeon de cada sub-pestania no tiene un hermano despues, asi que se
 * lleva todo lo que sigue -medido: la de Fontan daba 526 KB, 213 campos y 536 textos-. En el DOM
 * cada acordeon tiene sus descendientes exactos.
 *
 * Por seccion: su titulo, sus campos con id y rotulo, los espejos que LEE de otras pestanias
 * -los *_ro y los data-espejo-, sus globos ⓘ, sus textos largos -los candidatos a explicacion de
 * guia, historia de la app o repeticion- y su alto y ancho a 1440, 1000, 768 y 390 px.
 *
 *   node scripts/_probe_pant2inv.mjs --out /tmp/pant2inv.json
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CAND })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/pant2inv.json';
const ANCHOS = (arg('--anchos') || '1440,1000,768,390').split(',').map(Number);

const INV = `(() => {
  const NOEST = /^(ig-|tga-3d|tga-esq|pop-esp-|oai-esq|indic-|crit-|ref-|ev-|mfs-fig)/;
  const out = { secs: [] };
  Array.prototype.forEach.call(document.querySelectorAll('[id^="sacc-cc-"]'), function (sec) {
    const o = { id: sec.id };
    const sp = sec.querySelector('.sacc-hdr span[style]');
    o.tit = sp ? String(sp.textContent || '').trim().slice(0, 52) : '(sin titulo)';
    o.abierto = sec.classList.contains('open');
    const r = sec.getBoundingClientRect();
    o.w = Math.round(r.width); o.h = Math.round(r.height);
    /* El cuerpo es lo que de verdad ocupa: el encabezado mide lo mismo cerrado o abierto. */
    const cu = sec.querySelector('.sacc-body');
    o.cuerpoH = cu ? Math.round(cu.scrollHeight) : 0;
    const campos = [], esp = [];
    Array.prototype.forEach.call(sec.querySelectorAll('input[id], select[id], textarea[id]'), function (e) {
      if (NOEST.test(e.id)) return;
      /* El rotulo: el label del .fg que lo contiene, o el label[for]. */
      let lbl = '';
      const fg = e.closest('.fg');
      const lb = (fg && fg.querySelector('label')) || document.querySelector('label[for="' + e.id + '"]');
      if (lb) lbl = String(lb.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 44);
      const ro = e.hasAttribute('readonly') || /_ro$/.test(e.id) || e.hasAttribute('data-espejo');
      campos.push({ id: e.id, lbl: lbl, tag: e.tagName.toLowerCase(), ro: ro ? 1 : 0 });
      if (ro) esp.push(e.id);
    });
    o.campos = campos; o.nCampos = campos.length; o.espejos = esp;
    o.globos = sec.querySelectorAll('.vinfo-btn, [onclick*="vInfoClic"]').length;
    /* Los textos largos de la seccion: candidatos a explicacion de guia, historia de la app o
       repeticion. Se excluyen los rotulos de campo y las opciones de los selectores. */
    const tx = [];
    Array.prototype.forEach.call(sec.querySelectorAll('p, .nota, .hint, .sub, small, div, span'), function (e) {
      /* ⚠️ SE PERMITEN HIJOS INLINE, y es una correccion medida: exigiendo cero hijos el censo
         daba SIETE textos en las 19 secciones, porque casi todos llevan un <b> o un <br>. Lo que
         se excluye son los contenedores -un nodo cuyo texto es el de sus bloques hijos- y los
         rotulos de campo y las opciones de los selectores. */
      if (e.querySelector('p, div, table, select, input, textarea, button, label')) return;
      if (e.closest('label') || e.closest('option') || e.closest('select')) return;
      if (e.closest('.sacc-hdr')) return;
      const t = String(e.textContent || '').replace(/\\s+/g, ' ').trim();
      if (t.length < 55 || t.length > 420) return;
      if (tx.indexOf(t) >= 0) return;
      tx.push(t);
    });
    o.textos = tx;
    out.secs.push(o);
  });
  return out;
})()`;

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE };
try {
  for (const W of ANCHOS) {
    const pg = await b.newPage({ viewport: { width: W, height: 900 } });
    pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([W + ': ' + e.message.slice(0, 140)]) });
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
    await pg.waitForTimeout(1400);
    /* Se abren las DOS sub-pestanias y TODOS los acordeones por su boton real: lo que esta en
       display:none no tiene geometria, asi que medir sobre la app cerrada da cero y parece
       impecable. Es la leccion que check_mobile.js ya documenta. */
    const ab = await pg.evaluate(`(() => {
      ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
      const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
        x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
      const Q = String.fromCharCode(39);
      const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click();
      let n = 0;
      ['congenitas', 'congenitas2'].forEach(function (sub) {
        const bs = bq('ccSubTab(' + Q + sub); if (bs) bs.click();
        Array.prototype.forEach.call(document.querySelectorAll('[id^="sacc-cc-"]'), function (sec) {
          if (sec.classList.contains('open')) { n++; return }
          const h = sec.querySelector('.sacc-hdr'); if (h) { h.click(); n++ }
        });
      });
      return n;
    })()`);
    await pg.waitForTimeout(1200);
    /* ⚠️ SE MIDE UNA SUB-PESTANIA POR VEZ, CON LA SUYA ACTIVA, y es una correccion medida: al
       terminar de abrir los acordeones queda activa la SEGUNDA, asi que la primera estaba en
       display:none y el scrollHeight de sus nueve secciones daba CERO. Es la leccion que
       check_mobile.js documenta: lo que no se ve no tiene geometria. */
    const inv = { secs: [] };
    for (const sub of ['congenitas', 'congenitas2']) {
      await pg.evaluate("(() => { const Q = String.fromCharCode(39);"
        + " const b = Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),"
        + "   x => String(x.getAttribute('onclick')).indexOf('ccSubTab(' + Q + " + JSON.stringify(sub) + ") >= 0)[0];"
        + " if (b) b.click(); return 1 })()");
      await pg.waitForTimeout(500);
      const parte = await pg.evaluate(INV);
      /* Solo las que de verdad tienen caja en esta sub-pestania. */
      parte.secs.forEach(function (x) { if (x.cuerpoH > 0 && !inv.secs.some(y => y.id === x.id)) inv.secs.push(x) });
    }
    /* Y las que no aparecieron en ninguna: se declaran con su alto en cero y su motivo. */
    const todas = await pg.evaluate("(() => Array.prototype.map.call("
      + "document.querySelectorAll('[id^=\"sacc-cc-\"]'), x => x.id))()");
    todas.forEach(function (id) { if (!inv.secs.some(y => y.id === id))
      inv.secs.push({ id: id, tit: '(sin caja en ninguna sub-pestania)', nCampos: 0, cuerpoH: 0,
        campos: [], espejos: [], globos: 0, textos: [] }) });
    OUT['w' + W] = inv;
    console.log('== ' + W + 'px | acordeones abiertos=' + ab + ' | secciones=' + inv.secs.length
      + ' | campos=' + inv.secs.reduce((a, s) => a + s.nCampos, 0)
      + ' textos=' + inv.secs.reduce((a, s) => a + s.textos.length, 0)
      + ' globos=' + inv.secs.reduce((a, s) => a + s.globos, 0));
    await pg.close();
  }
} catch (e) { OUT._err = String(e).slice(0, 250) }
await b.close();
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF);
process.exit(0);
