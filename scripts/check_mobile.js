#!/usr/bin/env node
/**
 * check_mobile.js — usabilidad en celular, MIDIENDO la página, no leyéndola.
 *
 * Corre la app en el Chrome del sistema por CDP, igual que test_clinico.mjs y sin ninguna
 * dependencia externa. La diferencia con el chequeo estático que ya existe en la skill
 * (`check_mobile.py`, regex sobre el fuente) es la que importa: «este texto desborda su
 * contenedor» o «estos dos elementos se superponen» NO se pueden deducir del HTML. Dependen del
 * ancho real, de la fuente, del contenido del paciente y del layout resuelto. Hay que medirlos.
 * Los dos se complementan: el estático encuentra anchos fijos y `px` chicos en el fuente aunque
 * el elemento nunca se renderice; éste encuentra lo que sólo aparece con la página armada.
 *
 * Qué mide, en 360 y 390 px:
 *   1. Textos que desbordan su contenedor        (scrollWidth > clientWidth, sin scroll propio)
 *   2. Objetivos táctiles chicos                 (<44×44 CSS px, el mínimo de WCAG 2.5.5 / HIG)
 *   3. Tablas anchas que NO scrollean            (tabla más ancha que su caja y sin overflow-x)
 *   4. Badges cortados                           (el texto no entra en la píldora)
 *   5. Inputs chicos                             (alto <36 px: se tocan al escribir, no una vez)
 *   6. Lo que se sale del viewport               (derecha/izquierda, incluidos los modales)
 *   7. Elementos superpuestos                    (hermanos visibles que se pisan >40 % del área)
 *
 * Reporta el SELECTOR CSS de cada elemento —id si tiene, si no ruta con nth-of-type— para poder
 * ir directo. Nada de esto modifica la app: es sólo lectura.
 *
 *   node scripts/check_mobile.js               # 360 y 390 px, resumen
 *   node scripts/check_mobile.js --ancho 320   # otro ancho
 *   node scripts/check_mobile.js --todo        # incluye severidad BAJA
 *   node scripts/check_mobile.js --ver         # con el navegador a la vista
 *
 * Salida 0 si no hay hallazgos ALTA; 1 si los hay.
 */

import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = dirname(dirname(fileURLToPath(import.meta.url)));
const VER  = process.argv.includes('--ver');
const TODO = process.argv.includes('--todo');
const ANCHOS = (() => {
  const i = process.argv.indexOf('--ancho');
  if (i > -1 && process.argv[i + 1]) return [parseInt(process.argv[i + 1], 10)];
  return [360, 390];   // el iPhone SE/mini y el 14/15 base: los dos que más se usan
})();

const CHROMES = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
];

const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css',
               '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.svg':'image/svg+xml' };
function servir() {
  return new Promise((res) => {
    const srv = createServer(async (req, rq) => {
      try {
        const p = join(RAIZ, decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/, '') || 'index.html');
        if (!p.startsWith(RAIZ)) { rq.writeHead(403).end(); return; }
        const buf = await readFile(p);
        rq.writeHead(200, { 'Content-Type': MIME[extname(p)] || 'application/octet-stream' }).end(buf);
      } catch { rq.writeHead(404).end('no'); }
    });
    srv.listen(0, '127.0.0.1', () => res({ srv, port: srv.address().port }));
  });
}

async function abrirChrome(url) {
  const perfil = await mkdtemp(join(tmpdir(), 'ecosmart-mob-'));
  let bin = null;
  for (const c of CHROMES) { try { await readFile(c); bin = c; break; } catch {} }
  if (!bin) throw new Error('No encontre Chrome/Chromium/Edge.');
  const args = ['--remote-debugging-port=0', `--user-data-dir=${perfil}`, '--no-first-run',
                '--no-default-browser-check', '--disable-extensions', url];
  if (!VER) args.unshift('--headless=new');
  const proc = spawn(bin, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  const wsUrl = await new Promise((res, rej) => {
    const t = setTimeout(() => rej(new Error('Chrome no respondio en 20 s')), 20000);
    let acc = '';
    proc.stderr.on('data', (d) => {
      acc += d.toString();
      const m = acc.match(/ws:\/\/[^\s]+/);
      if (m) { clearTimeout(t); res(m[0]); }
    });
  });
  return { proc, perfil, wsUrl };
}

function conectar(wsUrl) {
  return new Promise((res, rej) => {
    const ws = new WebSocket(wsUrl);
    let id = 0; const pend = new Map();
    ws.addEventListener('open', () => res({
      /* `sessionId` NO es opcional: sin el, los comandos van al target del NAVEGADOR y no a la
         pagina, y Emulation/Page/Runtime ni siquiera existen ahi («wasn't found»). */
      send: (method, params = {}, sessionId) => new Promise((ok, no) => {
        const msg = { id: ++id, method, params };
        if (sessionId) msg.sessionId = sessionId;
        pend.set(msg.id, { ok, no });
        ws.send(JSON.stringify(msg));
      }),
      close: () => ws.close(),
    }));
    ws.addEventListener('error', rej);
    ws.addEventListener('message', (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pend.has(m.id)) {
        const { ok, no } = pend.get(m.id); pend.delete(m.id);
        m.error ? no(new Error(m.error.message)) : ok(m.result);
      }
    });
  });
}

/* ⚠ LA SONDA ES UN TEMPLATE LITERAL: sin acentos graves adentro, ni en los comentarios. Uno
   solo cierra la cadena y el archivo deja de parsear con un error que apunta lejos del
   culpable. Misma trampa que el cuerpo de los casos en test_clinico.mjs.
 * ── La sonda, que corre DENTRO de la página ────────────────────────────────────────────────
   Va como cadena porque se inyecta con Runtime.evaluate. Se abren todas las pestañas y todas
   las secciones plegables antes de medir: lo que está en `display:none` no tiene geometría, así
   que un barrido sobre la app cerrada encuentra CERO problemas y parece una app impecable. Es el
   mismo denominador engañoso que este repo ya pagó al contar filas de una tabla colapsada. */
const SONDA = `(() => {
  const TOQUE_MIN = 44;     // WCAG 2.5.5 AAA / Apple HIG
  const INPUT_MIN = 36;
  const hall = [];
  const push = (sev, tipo, el, detalle, fix) => hall.push({ sev, tipo, sel: selector(el), detalle, fix });

  function selector(el) {
    if (!el || el === document.body) return 'body';
    if (el.id) return '#' + el.id;
    const partes = [];
    let n = el, prof = 0;
    while (n && n !== document.body && prof < 4) {
      let p = n.tagName.toLowerCase();
      if (n.id) { partes.unshift('#' + n.id); break; }
      /* className en un elemento SVG es un SVGAnimatedString, no una cadena: sin
         getAttribute el selector salia como «svg.[object». */
      const cls = String(n.getAttribute && n.getAttribute('class') || '').split(/\\s+/).filter(Boolean)[0];
      if (cls) p += '.' + cls;
      const hs = n.parentElement ? Array.from(n.parentElement.children).filter(x => x.tagName === n.tagName) : [];
      if (hs.length > 1) p += ':nth-of-type(' + (hs.indexOf(n) + 1) + ')';
      partes.unshift(p); n = n.parentElement; prof++;
    }
    return partes.join(' > ');
  }
  /* DENTRO DE UN SVG NO SE MIDE NADA. Los <path> de un mismo dibujo se superponen por
     definicion —el bull's eye daba 132 «superpuestos»— y sus cajas no son objetivos tactiles ni
     contenedores de texto. Un reporte con 132 falsos positivos no se lee, y una herramienta que
     no se lee no encuentra nada. */
  const enSVG = el => !!(el.closest && el.closest('svg'));
  const visible = el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false;
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
  };
  const recorta = el => {
    const cs = getComputedStyle(el);
    return /auto|scroll/.test(cs.overflowX) || /auto|scroll/.test(cs.overflow);
  };
  // ¿Algún ancestro le da scroll horizontal? Una tabla ancha dentro de un div con overflow-x
  // NO es un problema: es la solución.
  const ancestroScrollea = el => {
    let n = el.parentElement, prof = 0;
    while (n && n !== document.body && prof < 6) { if (recorta(n)) return true; n = n.parentElement; prof++; }
    return false;
  };

  // ── ABRIR TODO antes de medir ──
  try { document.querySelectorAll('.tab-section').forEach(s => s.classList.add('active')); } catch (e) {}
  try {
    document.querySelectorAll('[id$="-seccion"], .card-body, .sacc-body').forEach(s => {
      if (getComputedStyle(s).display === 'none') s.style.display = '';
    });
  } catch (e) {}

  const VP = window.innerWidth;
  const todos = Array.from(document.querySelectorAll('body *')).filter(el => visible(el) && !enSVG(el));

  todos.forEach(el => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);

    // 6 · fuera del viewport
    if (r.width > 0 && (r.right > VP + 1 || r.left < -1)) {
      const propio = recorta(el) || ancestroScrollea(el);
      if (!propio) {
        const fijo = cs.position === 'fixed';
        push(fijo ? 'ALTA' : 'MEDIA', 'fuera-del-viewport', el,
          Math.round(r.left) + '–' + Math.round(r.right) + ' px contra un viewport de ' + VP,
          fijo ? 'un elemento fijo fuera de pantalla no se alcanza nunca: limitar su ancho al viewport'
               : 'envolver en un contenedor con overflow-x:auto, o permitir que el contenido se parta');
      }
    }

    // 1 · texto que desborda su caja
    const soloTexto = el.children.length === 0 && (el.textContent || '').trim().length > 0;
    if (soloTexto && el.scrollWidth > el.clientWidth + 1 && !recorta(el) && cs.textOverflow !== 'ellipsis') {
      push('MEDIA', 'texto-desborda', el,
        'contenido de ' + el.scrollWidth + ' px en una caja de ' + el.clientWidth,
        'permitir el salto de linea (white-space:normal / overflow-wrap:anywhere) o achicar la caja');
    }

    // 3 · tabla ancha sin scroll
    if (el.tagName === 'TABLE' && r.width > 0) {
      const caja = el.parentElement ? el.parentElement.clientWidth : VP;
      if (el.scrollWidth > caja + 2 && !ancestroScrollea(el)) {
        push('ALTA', 'tabla-sin-scroll', el,
          'la tabla mide ' + el.scrollWidth + ' px en un contenedor de ' + caja,
          'envolverla en <div style="overflow-x:auto"> — en un telefono la alternativa es que las celdas se partan en una letra por renglon');
      }
    }

    // 4 · badge cortado
    if (/(^|\\s)badge(\\s|$)/.test(el.className || '') && el.scrollWidth > el.clientWidth + 1) {
      push('MEDIA', 'badge-cortado', el,
        'el texto mide ' + el.scrollWidth + ' px y la pildora ' + el.clientWidth,
        'dejar que el badge crezca o acortar su texto: un badge cortado cambia lo que dice');
    }
  });

  // 2 · objetivos tactiles chicos, y 5 · inputs chicos
  Array.from(document.querySelectorAll('button, a[href], [onclick], select, input, textarea, [role=button]'))
    .filter(visible).forEach(el => {
      const r = el.getBoundingClientRect();
      const t = (el.type || '').toLowerCase();
      if (t === 'hidden' || r.width === 0) return;
      if (enSVG(el)) return;
      /* Para un checkbox o un radio, el objetivo tactil es la ETIQUETA que lo envuelve, no la
         cajita de 16 px: tocar el texto lo marca igual. Medir el input daba 81 «toque-chico» que
         en el telefono se tocan sin problema. Si NO tiene label envolvente, ahi si es el input. */
      let conLabel = false;
      if ((t === 'checkbox' || t === 'radio') && el.closest('label')) {
        const lr = el.closest('label').getBoundingClientRect();
        if (lr.height >= 28 && lr.width >= 28) return;   // el label ya es objetivo suficiente
        conLabel = true;   // label chico: sigue siendo incomodo, pero no es una cajita suelta
      }
      const esCampo = /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && t !== 'checkbox' && t !== 'radio';
      if (esCampo) {
        if (r.height < INPUT_MIN) {
          push('BAJA', 'input-chico', el, Math.round(r.height) + ' px de alto (min ' + INPUT_MIN + ')',
            'subir min-height: un campo bajo se erra al tocar y se vuelve a errar al corregir');
        }
        return;
      }
      if (r.width < TOQUE_MIN || r.height < TOQUE_MIN) {
        // Un enlace dentro de un párrafo no es un objetivo táctil suelto.
        const enTexto = el.tagName === 'A' && el.parentElement &&
          (el.parentElement.textContent || '').trim().length > (el.textContent || '').trim().length + 12;
        if (!enTexto) {
          /* Con label envolvente el tope es MEDIA aunque el input mida 15 px: tocar el texto
             tambien marca. ALTA queda para el control DESNUDO, que es el que de verdad no se
             puede acertar en un telefono. Sin esta distincion el reporte salia con 56 ALTA de
             checkboxes etiquetados y lo importante quedaba sepultado. */
          const sev = conLabel ? 'MEDIA' : ((r.width < 28 || r.height < 28) ? 'ALTA' : 'MEDIA');
          push(sev, 'toque-chico', el,
            Math.round(r.width) + '×' + Math.round(r.height) + ' px (min ' + TOQUE_MIN + '×' + TOQUE_MIN + ')',
            'agrandar el area tactil con padding o min-width/min-height');
        }
      }
    });

  // 7 · hermanos superpuestos
  const cajas = todos.filter(el => {
    const cs = getComputedStyle(el);
    if (cs.position === 'absolute' || cs.position === 'fixed') return false;  // se superponen a proposito
    if (el.children.length > 0) return false;   // una caja que CONTIENE a otra no se «pisa» con ella
    /* Nada INLINE: el rect de un <b> o un <span> que envuelve a dos renglones abarca las dos
       lineas completas, asi que dos inline consecutivos de un mismo parrafo se «pisan» al 100 %
       sin que haya ningun problema visual. Solo se miran cajas de bloque. */
    if (/^inline/.test(cs.display)) return false;
    const r = el.getBoundingClientRect();
    return r.width > 24 && r.height > 12;
  });
  const vistos = new Set();
  cajas.forEach(el => {
    const hs = el.parentElement ? Array.from(el.parentElement.children).filter(x => x !== el && cajas.indexOf(x) > -1) : [];
    hs.forEach(o => {
      const k = selector(el) + '|' + selector(o);
      const k2 = selector(o) + '|' + selector(el);
      if (vistos.has(k) || vistos.has(k2)) return;
      const a = el.getBoundingClientRect(), b = o.getBoundingClientRect();
      const ix = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const iy = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      const area = ix * iy, menor = Math.min(a.width * a.height, b.width * b.height);
      if (area > 0 && menor > 0 && area / menor > 0.4) {
        vistos.add(k);
        push('MEDIA', 'superpuestos', el,
          'se pisa un ' + Math.round(area / menor * 100) + ' % con ' + selector(o),
          'revisar el flex/grid: en pantalla angosta lo que en escritorio va en fila tiene que apilarse');
      }
    });
  });

  return hall;
})()`;

// ── Reporte ─────────────────────────────────────────────────────────────────────────────────
const ICONO = { ALTA: '🔴', MEDIA: '🟠', BAJA: '🟡' };
const ORDEN = { ALTA: 0, MEDIA: 1, BAJA: 2 };

(async () => {
  const { srv, port } = await servir();
  let chrome = null;
  try {
    chrome = await abrirChrome(`http://127.0.0.1:${port}/index.html`);
    const cdp = await conectar(chrome.wsUrl);
    const { targetInfos } = await cdp.send('Target.getTargets');
    const t = targetInfos.find(x => x.type === 'page');
    const { sessionId } = await cdp.send('Target.attachToTarget', { targetId: t.targetId, flatten: true });
    // Todo va con la sesion de la pagina.
    const sendS = (method, params = {}) => cdp.send(method, params, sessionId);
    const evalS = (expression) => sendS('Runtime.evaluate',
      { expression, returnByValue: true, awaitPromise: true });

    console.log('══════════════════════════════════════════════════════════════');
    console.log('  check_mobile — EcoSmart · geometria real, via CDP');
    console.log('══════════════════════════════════════════════════════════════');

    let totalAlta = 0;
    for (const ancho of ANCHOS) {
      await sendS('Emulation.setDeviceMetricsOverride',
        { width: ancho, height: 800, deviceScaleFactor: 2, mobile: true });
      await sendS('Page.enable');
      await sendS('Page.reload', { ignoreCache: false });
      // Espera a que la app termine de armarse (la app arranca en la pantalla de login).
      await new Promise(r => setTimeout(r, 1800));
      await evalS(`sessionStorage.setItem('ett_auth','1'); location.reload();`);
      await new Promise(r => setTimeout(r, 2200));
      await evalS(`try{cerrarAvisoEco()}catch(e){}`);

      const r = await evalS(SONDA);
      if (r.exceptionDetails) throw new Error('la sonda fallo: ' + r.exceptionDetails.text);
      let hall = r.result.value || [];
      if (!TODO) hall = hall.filter(h => h.sev !== 'BAJA');
      hall.sort((a, b) => ORDEN[a.sev] - ORDEN[b.sev] || a.tipo.localeCompare(b.tipo));

      const alta = hall.filter(h => h.sev === 'ALTA').length;
      totalAlta += alta;
      console.log(`\n▶ ${ancho} px  —  ${hall.length} hallazgo/s (${alta} ALTA)`);
      if (!hall.length) { console.log('   ✅ sin hallazgos.'); continue; }
      /* Se agrupa por SEVERIDAD + tipo, no sólo por tipo. Agrupando sólo por tipo, el icono
         salía del PRIMER elemento del grupo y un hallazgo MEDIA aparecía bajo un 🔴 —o al revés—:
         el reporte decía «ALTA» sobre cosas que no lo eran, y con eso se pierde la única señal
         que hace accionable la lista. Se detectó leyendo el propio reporte contra los números. */
      const porTipo = {};
      hall.forEach(h => { const k = h.sev + '\u0000' + h.tipo; (porTipo[k] = porTipo[k] || []).push(h); });
      Object.keys(porTipo).forEach(k => {
        const g = porTipo[k];
        const [sev, tipo] = k.split('\u0000');
        console.log(`\n   ${ICONO[sev]} ${tipo} — ${g.length} (${sev})`);
        g.slice(0, 8).forEach(h => {
          console.log(`      ${h.sel}`);
          console.log(`         ${h.detalle}`);
        });
        if (g.length > 8) console.log(`      … y ${g.length - 8} mas (mismo tipo)`);
        console.log(`      fix: ${g[0].fix}`);
      });
    }

    console.log('\n══════════════════════════════════════════════════════════════');
    console.log(totalAlta ? `  RESULTADO: ${totalAlta} hallazgo/s de severidad ALTA`
                          : '  RESULTADO: ✅ sin hallazgos de severidad ALTA');
    console.log('══════════════════════════════════════════════════════════════');
    if (!TODO) console.log('  (se ocultaron los de severidad BAJA — correr con --todo para verlos)');
    cdp.close();
    process.exitCode = totalAlta ? 1 : 0;
  } finally {
    if (chrome) { try { chrome.proc.kill(); } catch {} try { await rm(chrome.perfil, { recursive: true, force: true }); } catch {} }
    srv.close();
  }
})();
