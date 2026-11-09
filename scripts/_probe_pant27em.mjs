#!/usr/bin/env node
/**
 * _probe_pant27em.mjs - tanda PANT-27, commit 2. SOLO LECTURA.
 * Nombre propio: verificado con ls, no existia ningun _probe_pant27*.
 * Lee el TEXTO DE PANTALLA de las SIETE notas de la estenosis mitral con el GESTO REAL:
 * carga una estenosis mitral nativa por sus campos con sus eventos, abre el panel de Evidencia
 * por indicAbrir -que es la unica puerta del panel-, abre el details de la seccion por su
 * summary y abre el "Ver detalle" plegado por su propio summary, y recoge textContent.
 * DENOMINADOR: declara si la seccion se encontro, si el detalle se abrio y cuantas notas hay.
 * CONTROL NEGATIVO: la misma escena con etiologia REUMATICA, donde T2 no debe existir, y una
 * tercera SIN etiologia, donde tampoco.
 * DOS VALORES DE u: llama a EM_NOTAS con tres umbrales distintos y mira si el valor los sigue.
 * PAPEL: informe en los estilos que la app ofrezca y EN SUMA, para el A/B.
 * No escribe nada en el proyecto.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p27em.json';
const br = await chromium.launch({ channel: 'chrome', headless: true });
const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push('page: ' + String(e).slice(0, 160)));
pg.on('console', m => { if (m.type() === 'error') errs.push('con: ' + m.text().slice(0, 160)) });
await pg.goto('file://' + FILE);
await pg.waitForTimeout(1200);
await pg.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });

const R = await pg.evaluate(async () => {
  const esperar = (ms) => new Promise(r => setTimeout(r, ms));
  const S = (id, val) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = val;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return (String(e.value) === String(val)) ? 1 : 'quedo en ' + e.value; };
  const V = (id) => { const e = document.getElementById(id); return e ? String(e.value || '') : null };
  const norm = (t) => String(t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();

  /* La seccion del panel por su SUMMARY, que es como el medico la encuentra, y su detalle
     plegado abierto por su propio summary. Devuelve el texto de pantalla del detalle. */
  const secPantalla = (titulo) => {
    const ov = document.getElementById('indic-overlay');
    if (!ov || ov.style.display !== 'block') return { err: 'el panel no esta abierto' };
    const dets = Array.from(ov.querySelectorAll('details'));
    const sec = dets.find(d => {
      const su = d.querySelector('summary');
      return su && norm(su.textContent) === titulo;
    });
    if (!sec) return { err: 'no se encontro la seccion ' + titulo,
                       titulos: dets.map(d => { const s = d.querySelector('summary');
                                                return s ? norm(s.textContent).slice(0, 44) : '(sin summary)' }) };
    if (!sec.open) sec.querySelector('summary').click();
    const det = sec.querySelector('details[data-ind-detalle]');
    if (!det) return { err: 'la seccion no tiene detalle plegado', sec: norm(sec.textContent).slice(0, 300) };
    if (!det.open) det.querySelector('summary').click();
    const cuerpo = det.querySelector('div');
    return { abierto: !!det.open,
             detalle: norm(det.textContent),
             notas: Array.from(cuerpo ? cuerpo.children : []).map(x => norm(x.textContent)),
             seccion: norm(sec.textContent) };
  };

  const escena = (morf, avm) => {
    try { if (typeof limpiarCampos === 'function') limpiarCampos(); } catch (e) {}
    const puesto = { morf: S('vm_morf', morf), avm: S('avm_plan', avm) };
    try { if (typeof calcEM === 'function') calcEM(); } catch (e) {}
    return puesto;
  };

  const leerObj = () => {
    try { const r = window._indEM ? _indEM() : null;
      if (!r) return { err: '_indEM devolvio null' };
      return { notasN: (r.notas || []).filter(Boolean).length,
               notas: (r.notas || []).filter(Boolean).map(n => (typeof n === 'string')
                 ? { txt: n, refs: [] } : { txt: n.txt, refs: n.refs || [] }) };
    } catch (e) { return { err: 'ERR ' + String(e.message).slice(0, 90) } }
  };

  const papel = () => {
    const out = {};
    const pills = Array.from(document.querySelectorAll('[data-estilo]'));
    out._estilos = pills.map(x => x.getAttribute('data-estilo'));
    pills.forEach(b => {
      const k = b.getAttribute('data-estilo');
      b.click();
      try { if (typeof generarInforme === 'function') generarInforme(); } catch (e) {}
      out[k] = norm(V('informe_texto'));
    });
    out._suma = norm(V('en_suma'));
    return out;
  };

  const O = { errs: [] };

  O.A_puesto = escena('Calcificada', '1.2');
  await esperar(420);
  O.A_papel = papel();
  O.A_obj = leerObj();
  try { indicAbrir() } catch (e) { O.errs.push('indicAbrir A: ' + e.message) }
  await esperar(260);
  O.A_pant = secPantalla('Estenosis mitral');
  try { indicCerrar() } catch (e) {}

  O.B_puesto = escena('Reumática', '1.2');
  await esperar(420);
  O.B_papel = papel();
  O.B_obj = leerObj();
  try { indicAbrir() } catch (e) { O.errs.push('indicAbrir B: ' + e.message) }
  await esperar(260);
  O.B_pant = secPantalla('Estenosis mitral');
  try { indicCerrar() } catch (e) {}

  O.C_puesto = escena('', '1.2');
  await esperar(420);
  O.C_obj = leerObj();

  O.u = {};
  try {
    const uvs = [1.5, 1.8, 2.25];
    uvs.forEach(uv => {
      const ns = EM_NOTAS(uv, 'otra', {});
      O.u['u' + uv] = ns.filter(Boolean).map(n => (typeof n === 'string') ? n : n.txt);
    });
    O.u.score = (typeof EM_CRIT_2025 !== 'undefined') ? EM_CRIT_2025.score_desfav : 'SIN EM_CRIT_2025';
    O.u.umbralVivo = (typeof _indUmb === 'function') ? _indUmb('AVM_SEVERA_MAX') : 'SIN _indUmb';
  } catch (e) { O.u.err = 'ERR ' + String(e.message).slice(0, 110) }

  return O;
});
R.consola = errs;
fs.writeFileSync(OUTF, JSON.stringify(R, null, 1));
console.log('escrito ' + OUTF);
await br.close();
process.exit(0);
