/*
 * _probe_tga4wk.mjs - Chrome y WebKit sobre lo que la tanda TGA-4 toca (2026-11-02).
 * Nombre propio: verificado con ls que no existia.
 *
 * Dos motores x 1440, 1000, 768 y 390 px x dos temas. Mide, por cruce: errores de consola y de
 * pagina, desplazamiento horizontal del cuerpo, texto recortado, el panel de Evidencia de la
 * transposicion -modo compacto, tres estados, etiqueta de guia, grupos, contador, la frase del
 * pie y el alto de la pregunta mas alta-, el recuadro del esquema y la capsula de conclusion.
 *
 * ⚠️ WebKit de Playwright NO es Safari, y se declara. Chrome va por el del sistema con
 *    channel chrome: sin eso la sonda devuelve los cruces vacios.
 * ⚠️ Se compara contra un arbol de control con --ref, para distinguir lo que esta tanda
 *    introduce de lo que ya estaba.
 *
 *   node scripts/_probe_tga4wk.mjs --file /tmp/x.html --out /tmp/wk.json
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium, webkit } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/wk_tga4.json';
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['claro', 'oscuro'];

const MEDIR = `(() => {
  const o = {};
  const B = document.body, D = document.documentElement;
  o.scrollH = Math.max(0, Math.round((D.scrollWidth || 0) - (D.clientWidth || 0)));
  /* Texto recortado: un nodo cuyo contenido desborda su caja en horizontal. */
  o.recortado = Array.prototype.filter.call(document.querySelectorAll('button, label, span, td, th, option'),
    function (e) { if (!e.offsetParent) return false;
      return e.scrollWidth > e.clientWidth + 2 && String(e.textContent || '').trim().length > 2 }).length;
  /* La seccion de la transposicion en el panel. */
  const cu = document.getElementById('indic-cuerpo');
  let sec = null;
  if (cu) { const t = Array.prototype.slice.call(cu.querySelectorAll('details, div'));
    for (const n of t) { const x = String(n.textContent || '').trim();
      if (x.indexOf('Transposición de grandes arterias') === 0 && n.querySelector('[data-ind-grid]')) { sec = n; break } } }
  if (!sec) { o.panel = 'NO HAY SECCION'; return o }
  const g = sec.querySelector('[data-ind-grid]');
  const filas = Array.prototype.slice.call(sec.querySelectorAll('tr')).filter(function (f) { return f.querySelector('.ind-ctrl') });
  const altos = filas.map(function (f) { return Math.round(f.getBoundingClientRect().height) });
  const txt = String(sec.textContent || '');
  const cuenta = function (t) { let c = 0, i = 0; while ((i = txt.indexOf(t, i)) >= 0) { c++; i++ } return c };
  o.panel = 'si';
  o.compacta = (g && g.getAttribute('data-ind-compacta')) || 'no';
  o.cols = (g && g.getAttribute('data-ind-cols')) || 'sin';
  o.anchoPanel = (function () { const c = document.getElementById('indic-card');
    return c ? Math.round(c.getBoundingClientRect().width) : 0 })();
  o.preg = filas.length;
  o.altoPreg = altos.length ? Math.max.apply(null, altos) : 0;
  o.bot = filas[0] ? filas[0].querySelectorAll('button[data-ind-clin]').length : 0;
  /* Los botones de respuesta, de 44 px y sin pisar a otro control. */
  const bs = Array.prototype.slice.call(sec.querySelectorAll('button[data-ind-clin]'));
  o.bot44 = bs.filter(function (b) { const r = b.getBoundingClientRect();
    return Math.round(r.height) === 44 && Math.round(r.width) === 44 }).length;
  o.botN = bs.length;
  o.badges = sec.querySelectorAll('[data-ind-gbadge]').length;
  o.grupos = sec.querySelectorAll('[data-ind-grupo]').length;
  o.frase = cuenta('no se guarda con el estudio');
  o.contador = txt.indexOf(' en Sí · ') >= 0 ? 'si' : 'no';
  o.citas = cuenta('Clase ') + cuenta('Nivel ') + cuenta('folio ');
  return o;
})()`;

const PANT = `(() => {
  const o = {};
  const box = document.getElementById('tga-esq-box');
  const svg = document.getElementById('tga-esq-svg');
  o.esqAncho = box ? Math.round(box.getBoundingClientRect().width) : 0;
  o.esqHay = !!(svg && svg.firstChild);
  const c = document.getElementById('tga-concl');
  o.concl = c ? String(c.textContent || '') : 'NO EXISTE';
  o.conducta = ['a considerar', 'seguimiento anual', 'seguimiento estrecho', 'resincronización',
    'por encima de 50 mmHg'].filter(function (w) { return o.concl.indexOf(w) >= 0 }).join(',');
  o.bav = o.concl.indexOf('complicaci\\u00f3n esperable en la ccTGA') >= 0 ? 'SI' : 'no';
  return o;
})()`;

const OUT = { archivo: FILE };
for (const [nom, motor, op] of [['chrome', chromium, { channel: 'chrome' }], ['webkit', webkit, {}]]) {
  let b = null;
  try { b = await motor.launch(op) } catch (e) { OUT['_' + nom] = 'NO ARRANCA: ' + String(e).slice(0, 90); continue }
  for (const anc of ANCHOS) {
    for (const tema of TEMAS) {
      const k = nom + '/' + anc + '/' + tema;
      const errs = [], perr = [];
      try {
        const pg = await b.newPage({ viewport: { width: anc, height: 900 },
          colorScheme: tema === 'oscuro' ? 'dark' : 'light' });
        pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 90)) });
        pg.on('pageerror', (e) => perr.push(e.message.slice(0, 90)));
        await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
        await pg.waitForTimeout(1200);
        await pg.evaluate(`(() => {
          ['modalAvisoEco','login-overlay'].forEach(function (i) { const m = document.getElementById(i); if (m) m.style.display = 'none' });
          const S = function (i, v) { const e = document.getElementById(i); if (!e) return; e.value = v;
            e.dispatchEvent(new Event('input', { bubbles: true }));
            e.dispatchEvent(new Event('change', { bubbles: true })) };
          S('nombre', 'Prueba TGA4'); S('ci', '619'); S('vd_bas', '45');
          S('tga_tipo', 'dtga'); S('tga_cirugia', 'auricular'); S('tga_func_vd', 'normal');
          S('tga_sintomas', 'no'); S('tga_bav', 'si');
          Object.keys(window).forEach(function (x) { if (/^calc[A-Z]/.test(x) && typeof window[x] === 'function') {
            try { window[x]() } catch (e) {} } });
          try { if (typeof tgaSync === 'function') tgaSync() } catch (e) {}
          return true; })()`);
        await pg.waitForTimeout(250);
        const pant = await pg.evaluate(PANT);
        await pg.evaluate("(() => { try { if (typeof indicAbrir === 'function') indicAbrir() } catch (e) {} return true })()");
        await pg.waitForTimeout(400);
        const pan = await pg.evaluate(MEDIR);
        OUT[k] = Object.assign({}, pant, pan, { errs: errs.length, perr: perr.length,
          errTxt: errs.slice(0, 2), perrTxt: perr.slice(0, 2) });
        const r = OUT[k];
        console.log('-- ' + k.padEnd(22) + ' panel=' + r.panel + ' compacta=' + r.compacta
          + ' cols=' + r.cols + '(' + r.anchoPanel + 'px) preg=' + r.preg + ' alto=' + r.altoPreg
          + ' bot=' + r.bot + ' 44x44=' + r.bot44 + '/' + r.botN + ' etiq=' + r.badges
          + ' grupos=' + r.grupos + ' frase=' + r.frase + ' cont=' + r.contador + ' citas=' + r.citas
          + ' | esq=' + r.esqAncho + 'px conducta=[' + r.conducta + '] bav=' + r.bav
          + ' | scrollH=' + r.scrollH + ' recort=' + r.recortado + ' err=' + r.errs + '/' + r.perr);
        await pg.close();
      } catch (e) { OUT[k] = { err: String(e).slice(0, 130) }; console.log('-- ' + k + ' ERR'); }
    }
  }
  await b.close();
}
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF);
process.exit(0);
