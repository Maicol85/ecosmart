#!/usr/bin/env node
/**
 * _probe_popc_amber.mjs - los tres usos GLOBALES de var(--amber) que no resuelven (POP-C, 4b).
 *
 * POPB-h los encontro leyendo el diff y NO los midio. Esta sonda los RENDERIZA en los dos temas:
 * crea un nodo con cada clase FUERA de `.amilo-root` y de `#sp-root` -que es donde viven de
 * verdad- y lee el color computado. Un `var()` que no resuelve deja la propiedad en su valor
 * INICIAL: `color` cae en negro y `background-color` en transparente.
 *
 *   node scripts/_probe_popc_amber.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const CUERPO = `((tema) => {
  const R = { tema: tema, filas: [], vars: {} };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  document.documentElement.setAttribute('data-theme', tema);
  const cs = getComputedStyle(document.documentElement);
  ['--amber','--amber-pale','--orange','--sev-naranja','--yellow'].forEach(v => {
    R.vars[v] = String(cs.getPropertyValue(v) || '').trim() || '(no definida en :root)';
  });

  /* Un contenedor FUERA de .amilo-root y de #sp-root, que es donde estas reglas aplican mal. */
  const host = document.createElement('div');
  host.id = '_ambtest';
  document.body.appendChild(host);

  const mide = (nombre, html, props) => {
    host.innerHTML = '';
    const d = document.createElement('div');
    d.className = html.cls;
    if (html.wrap) { const w = document.createElement('div'); w.className = html.wrap;
      w.appendChild(d); host.appendChild(w); } else host.appendChild(d);
    d.textContent = 'aviso de prueba';
    const c = getComputedStyle(d);
    const o = { nombre: nombre };
    props.forEach(p => { o[p] = String(c[p] || '').trim(); });
    R.filas.push(o);
  };
  /* 1-3 · .am-stale, con sus tres declaraciones. Se mide FUERA de .amilo-root. */
  mide('.am-stale (fuera de .amilo-root)', { cls:'am-stale', wrap:'am-wrap desfasado' },
       ['color','backgroundColor','borderLeftColor']);
  /* 4 · el boton del modulo, que vive en la pestana y NO en la tarjeta. */
  host.innerHTML = '';
  { const b = document.createElement('button');
    b.className = 'btn btn-integrar revisar'; b.textContent = 'Integrar';
    host.appendChild(b);
    const c = getComputedStyle(b);
    R.filas.push({ nombre: '.btn-integrar.revisar (fuera de .amilo-root)',
                   boxShadow: String(c.boxShadow || '').trim() }); }
  /* CONTROL POSITIVO: la MISMA clase DENTRO de .amilo-root tiene que resolver. */
  host.innerHTML = '';
  { const root = document.createElement('div'); root.className = 'amilo-root';
    const w = document.createElement('div'); w.className = 'am-wrap desfasado';
    const d = document.createElement('div'); d.className = 'am-stale'; d.textContent = 'x';
    w.appendChild(d); root.appendChild(w); host.appendChild(root);
    const c = getComputedStyle(d);
    R.filas.push({ nombre: 'CONTROL + .am-stale DENTRO de .amilo-root',
                   color: String(c.color).trim(), backgroundColor: String(c.backgroundColor).trim(),
                   borderLeftColor: String(c.borderLeftColor).trim() }); }
  host.remove();
  return R;
})`;

const TEMAS = ['dark', 'light'];

(async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome', headless: true });
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(2200);
  console.log('===== LOS USOS GLOBALES DE var(--amber) (POP-C 4b) =====');
  console.log('archivo:', FILE);
  for (const t of TEMAS) {
    const R = await pg.evaluate(new Function('return ' + CUERPO)(), t);
    console.log('\n--- tema ' + t.toUpperCase() + ' ---');
    console.log('  variables en :root -> ' + Object.keys(R.vars).map(k => k + '=' + R.vars[k]).join('  '));
    for (const f of R.filas) {
      const partes = Object.keys(f).filter(k => k !== 'nombre').map(k => k + ': ' + f[k]);
      console.log('  ' + f.nombre);
      partes.forEach(p => console.log('      ' + p));
    }
  }
  console.log('\nerrores de pagina: ' + errs.length + (errs.length ? ' -> ' + errs.slice(0,3).join(' ; ') : ''));
  await b.close();
  process.exit(0);
})();
