#!/usr/bin/env node
/**
 * _probe_pant14raster.mjs - el esquema que se rasteriza para el PDF, por PIXELES (PANT-14, c1).
 * Serializa el SVG del esquema, lo pasa por el duenio unico `esqRasterizar` y MUESTREA los
 * pixeles del centro de cada una de las seis cajas: ni negro ni blanco, y con el color de la
 * paleta del tema. Lleva su control POSITIVO: con el relleno forzado a `var(--card)` -la
 * variable que no existe- las muestras tienen que volver NEGRAS.
 *   node scripts/_probe_pant14raster.mjs [--file <html>] [--motor chrome|webkit]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const MOT = arg('--motor') || 'chrome';
const br = MOT === 'chrome' ? await _pw.chromium.launch({ channel: 'chrome' }) : await _pw.webkit.launch();
const salida = {};
for (const tema of ['noche', 'dia']) {
  const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 120)));
  await pg.addInitScript(`try { localStorage.setItem('ett_theme', '${tema === 'dia' ? 'light' : 'dark'}') } catch (e) {}`);
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(1600);
  const r = await pg.evaluate(`(async () => {
    const R = {}; const EL = id => document.getElementById(id);
    const esperar = ms => new Promise(z => setTimeout(z, ms));
    ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
    if (typeof showTab === 'function') { try { showTab('congenitas') } catch (e) {} }
    await esperar(220);
    if (typeof cc3dPieSync === 'function') { try { cc3dPieSync() } catch (e) {} }
    const ab = EL('cc3d-abrir'); if (ab && ab.getAttribute('aria-pressed') !== 'true') { ab.click(); await esperar(650) }
    const esb = EL('cm3d-esb'); if (esb && esb.getAttribute('aria-expanded') !== 'true') { esb.click(); await esperar(320) }
    if (typeof cmSetModo === 'function') cmSetModo('explorar');
    if (typeof cmSetBase === 'function') { try { cmSetBase('fal') } catch (e) {} }
    if (typeof cm3dBuild === 'function') cm3dBuild();
    if (typeof cmSchRender === 'function') cmSchRender(true);
    await esperar(320);
    const svg = EL('cm3d-schsvg');
    if (!svg) return { err: 'SIN SVG' };
    /* los centros de las seis cajas, en unidades del viewBox 0 0 300 290 */
    /* ⚠️ LOS PUNTOS NO VAN EN EL CENTRO DE LA CAJA: ahi esta el rotulo, y la muestra devolvia
       el pixel de la LETRA. Van en el borde izquierdo de cada caja, dentro del relleno. */
    const CAJAS = [['Pulmones',75,20],['Cuerpo',75,262],['TL',48,86],['TR',188,86],['BL',48,166],['BR',188,166]];
    const muestrear = async (txt, etiqueta) => {
      R.len = R.len || {}; R.len[etiqueta] = txt.length;
      const d = await esqRasterizar(txt, 600, 580);
      if (!d) return { err: 'SIN DATA' };
      return await new Promise(res => {
        const im = new Image();
        im.onload = () => {
          const cv = document.createElement('canvas'); cv.width = 600; cv.height = 580;
          const cx = cv.getContext('2d'); cx.drawImage(im, 0, 0, 600, 580);
          const out = {};
          CAJAS.forEach(c => {
            const px = Math.round(c[1] / 300 * 600), py = Math.round(c[2] / 290 * 580);
            const p = cx.getImageData(px, py, 1, 1).data;
            out[c[0]] = 'rgb(' + p[0] + ',' + p[1] + ',' + p[2] + ')';
          });
          res(out);
        };
        im.onerror = () => res({ err: 'NO DECODIFICA' });
        im.src = d;
      });
    };
    const serializar = () => {
      const fl = svg.querySelectorAll('.cm3d-fl'); const prev = [];
      Array.prototype.forEach.call(fl, p => { prev.push(p.getAttribute('stroke-dashoffset')); p.setAttribute('stroke-dashoffset','0') });
      const t = new XMLSerializer().serializeToString(svg);
      Array.prototype.forEach.call(fl, (p,i) => { if (prev[i]==null) p.removeAttribute('stroke-dashoffset'); else p.setAttribute('stroke-dashoffset',prev[i]) });
      return t;
    };
    const base = serializar();
    R.varsEnMarcado = (base.match(/var\\(--/g) || []).length;
    R.real = await muestrear(base, 'real');
    /* CONTROL POSITIVO: se repone la variable que no existe en los rellenos de las cajas */
    const ctrl = base.replace(/fill="(#[0-9a-fA-F]{3,8}|rgb\\([^"]*\\))" stroke="/g, 'fill="var(--card)" stroke="');
    R.ctrlCambios = (ctrl.match(/fill="var\\(--card\\)"/g) || []).length;
    R.control = await muestrear(ctrl, 'control');
    return R;
  })()`);
  r.errs = errs;
  salida[tema] = r;
  await pg.close();
}
await br.close();
console.log(JSON.stringify(salida, null, 1));
