#!/usr/bin/env node
/**
 * _probe_cong2a_3d.mjs — el 3D de la TGA (CONG-2A, commit 3).
 * Mide: (3b) el dibujo dentro de su tarjeta en los cuatro anchos y con el acordeon abierto o
 * cerrado, incluido el camino que destapo el defecto -cargar un tipo y VACIARLO-; (3c) el
 * corazon normal por omision con su texto y el gate del PDF; (3d) la CIA de su pestania, la CIV
 * de cualquiera de las dos, y la actualizacion al cambiar el dato.
 *   node scripts/_probe_cong2a_3d.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
import fs from 'fs';
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const br = await _pw.chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE };
for (const w of [1440, 1000, 768, 390]) {
  const pg = await br.newPage({ viewport: { width: w, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 100)));
  pg.on('console', c => { if (c.type() === 'error') errs.push('CONS ' + c.text().slice(0, 100)) });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(1400);
  const r = await pg.evaluate(`(async () => {
    const R = {};
    const EL = id => document.getElementById(id);
    const S = (id, v) => { const e = EL(id); if (!e) return 'NO ' + id; e.value = v;
      e.dispatchEvent(new Event('input', { bubbles: true }));
      e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
    const caja = el => { if (!el) return null; const q = el.getBoundingClientRect();
      return { w: Math.round(q.width), h: Math.round(q.height), x: Math.round(q.left), y: Math.round(q.top) } };
    const T = id => { const e = EL(id); return e ? String(e.textContent || '').split(' ').filter(Boolean).join(' ').trim() : 'NO' };
    ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
    try { limpiarCampos(true) } catch (e) {}
    const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
      b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
    const Q = String.fromCharCode(39);
    try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click();
          const b2 = bq('ccSubTab(' + Q + 'congenitas2'); if (b2) b2.click() } catch (e) {}
    await new Promise(z => setTimeout(z, 320));
    const acc = EL('sacc-cc-tga');
    if (acc && !acc.classList.contains('open')) { const h = document.querySelector('#sacc-cc-tga .sacc-hdr'); if (h) h.click() }
    await new Promise(z => setTimeout(z, 2200));
    try { document.querySelectorAll('.sacc-body').forEach(b => { b.style.transition = 'none' }) } catch (e) {}
    R.accAbierto = acc ? (acc.classList.contains('open') ? 'si' : 'NO') : 'NO EXISTE';
    R.three = (typeof window.THREE === 'undefined') ? 'no' : (window.THREE.REVISION || 'si');

    /* ── 3b · el recuadro, en cinco estados, incluido el que destapo el defecto ──────────── */
    const foto = et => { const box = caja(EL('tga-3d-box')), host = caja(EL('tga-3d-cv')),
      cv = caja(document.querySelector('#tga-3d-cv canvas')), cl = caja(EL('tga-concl'));
      const pdfB = EL('tga-3d-pdf');
      return { et: et, box: box, host: host, canvas: cv,
        desbHost: (box && host) ? Math.max(0, (host.y + host.h) - (box.y + box.h)) : 'NO',
        desbCv: (box && cv) ? Math.max(0, (cv.y + cv.h) - (box.y + box.h)) : 'sin canvas',
        pisaConcl: (host && cl) ? Math.max(0, (host.y + host.h) - cl.y) : 'NO',
        pisaCv: (cv && cl) ? Math.max(0, (cv.y + cv.h) - cl.y) : 'sin canvas',
        pdfOff: pdfB ? !!pdfB.disabled : 'NO',
        estado: T('tga-3d-estado').slice(0, 95), aviso: T('tga-3d-aviso').slice(0, 40) } };
    R.estados = [];
    R.estados.push(foto('1-sin tipo'));
    S('tga_tipo', 'dtga'); await new Promise(z => setTimeout(z, 900)); R.estados.push(foto('2-dtga'));
    S('tga_tipo', ''); await new Promise(z => setTimeout(z, 900)); R.estados.push(foto('3-vaciado'));
    S('tga_tipo', 'cctga'); await new Promise(z => setTimeout(z, 900)); R.estados.push(foto('4-cctga'));
    S('tga_tipo', ''); await new Promise(z => setTimeout(z, 900)); R.estados.push(foto('5-vaciado2'));
    /* El acordeon CERRADO: ninguna caja puede quedar fuera de la tarjeta. */
    const h2 = document.querySelector('#sacc-cc-tga .sacc-hdr'); if (h2) h2.click();
    await new Promise(z => setTimeout(z, 420));
    R.cerrado = foto('6-acordeon cerrado');
    if (h2) h2.click(); await new Promise(z => setTimeout(z, 420));

    /* ── 3d · las comunicaciones, preguntando al DUENO y a la ESCENA ─────────────────────── */
    const esc = (a, c) => { try { const e = tga3dEscena(a, c, tga3dComs());
      const rings = (e.ex || []).filter(x => x.t === 'ring');
      return { rings: rings.length, centros: rings.map(x => x.c.join(',')).join(' ; ') } }
      catch (q) { return { err: String(q.message).slice(0, 70) } } };
    const comsAhora = () => { try { return tga3dComs() } catch (q) { return 'EXC' } };
    R.com = {};
    try { limpiarCampos(true) } catch (e) {}
    await new Promise(z => setTimeout(z, 300));
    R.com.vacio = { duenio: comsAhora(), norm: esc('norm', ''), dtga: esc('dtga', ''), ltga: esc('ltga', '') };
    /* CIA desde la pestania «CIA / CIV» */
    S('ete_cia_tipo', 'secundum'); await new Promise(z => setTimeout(z, 420));
    R.com.ciaDeSuPestania = { duenio: comsAhora(), norm: esc('norm', ''), dtga: esc('dtga', ''),
      ltga: esc('ltga', ''), mus: esc('dtga', 'auricular'), jat: esc('dtga', 'jatene'), ras: esc('dtga', 'rastelli') };
    /* CIV desde la pestania «CIA / CIV» */
    S('ete_cia_tipo', ''); S('ete_civ_tipo', 'perimembranosa'); await new Promise(z => setTimeout(z, 420));
    R.com.civDeSuPestania = { duenio: comsAhora(), norm: esc('norm', ''), dtga: esc('dtga', ''),
      ltga: esc('ltga', ''), mus: esc('dtga', 'auricular'), ras: esc('dtga', 'rastelli') };
    /* CIV desde «CIV residual» de la propia TGA */
    S('ete_civ_tipo', ''); S('tga_civ_residual', 'si'); await new Promise(z => setTimeout(z, 420));
    R.com.civResidual = { duenio: comsAhora(), norm: esc('norm', ''), dtga: esc('dtga', '') };
    /* CONTROL NEGATIVO: «CIV residual» en NO no dibuja nada. */
    S('tga_civ_residual', 'no'); await new Promise(z => setTimeout(z, 420));
    R.com.civResidualNo = { duenio: comsAhora(), norm: esc('norm', '') };
    /* La vista de REFERENCIA sigue sin comunicaciones. */
    S('ete_cia_tipo', 'secundum'); S('tga_tipo', 'dtga'); await new Promise(z => setTimeout(z, 700));
    try { tga3dNormToggle() } catch (e) {}
    await new Promise(z => setTimeout(z, 700));
    R.refSinComs = { ref: !!(window._tga3d ? window._tga3d.ref : null),
                     estado: T('tga-3d-estado').slice(0, 70),
                     pdfOff: EL('tga-3d-pdf') ? !!EL('tga-3d-pdf').disabled : 'NO' };
    try { tga3dNormToggle() } catch (e) {}
    /* Se ACTUALIZA solo al cambiar el dato en otra pestania: se cuenta el ring de la escena viva. */
    const vivos = () => { try { const ej = tgaEjes();
      const e = tga3dEscena(_tga3d.ref ? 'norm' : (ej.anat || 'norm'), _tga3d.ref ? '' : ej.cir, tga3dComs());
      return (e.ex || []).filter(x => x.t === 'ring').length } catch (q) { return 'EXC' } };
    try { limpiarCampos(true) } catch (e) {}
    await new Promise(z => setTimeout(z, 300));
    R.vivo = { a_vacio: vivos() };
    S('ete_cia_tipo', 'secundum'); await new Promise(z => setTimeout(z, 420)); R.vivo.b_conCia = vivos();
    S('ete_civ_tipo', 'perimembranosa'); await new Promise(z => setTimeout(z, 420)); R.vivo.c_masCiv = vivos();
    S('ete_cia_tipo', ''); S('ete_civ_tipo', ''); await new Promise(z => setTimeout(z, 420)); R.vivo.d_borrados = vivos();
    return R;
  })()`, { timeout: 120000 });
  r.errs = errs;
  OUT['w' + w] = r;
  console.log('== ancho ' + w + ' == three=' + r.three + ' acc=' + r.accAbierto + ' errs=' + errs.length);
  r.estados.forEach(f => console.log('   ' + f.et.padEnd(20) + ' desbCv=' + f.desbCv + ' pisaCv=' + f.pisaCv
    + ' pdfOff=' + f.pdfOff + ' | ' + (f.estado || f.aviso).slice(0, 62)));
  console.log('   ' + R0(r.cerrado));
  await pg.close();
}
function R0(f) { return f ? (f.et + ' desbCv=' + f.desbCv + ' pisaCv=' + f.pisaCv) : 'sin dato' }
await br.close();
const OUTF = arg('--out') || '/tmp/cong2a_3d.json';
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF);
process.exit(0);
