#!/usr/bin/env node
/**
 * _probe_oaitecla.mjs - el tiempo de escritura de la orejuela, y NADA MAS (Parte A, 30/10/2026).
 *
 * ⚠️ EXISTE PORQUE LA MEDICION DERIVA CON LA POSICION DENTRO DE LA CORRIDA. En la sonda grande,
 * la misma funcion de teclas daba 1,42 ms corrida temprano y 2,90 ms corrida tarde, sobre el
 * MISMO arbol: lo que cambia es cuanto trabajo acumulo la pagina antes -guardados diferidos,
 * escrituras en IndexedDB, tarjetas abiertas-. Comparar HEAD contra el arbol nuevo con la tecla
 * en posiciones distintas es comparar dos cosas que no son la misma.
 * Aca la pagina se abre, se monta la escena y se teclea: nada mas pasa antes.
 *
 * CINCO RONDAS de trece teclas, y se informan las cinco: la primera siempre es la mas cara
 * -JIT frio- y promediarla con las otras esconde justamente el numero que importa.
 *
 *   node scripts/_probe_oaitecla.mjs --file /ruta/HEAD.html
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const { chromium } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const CON_SEC = process.argv.indexOf('--sin-sec') < 0;

const MEDIR = `(async () => {
  const o = { conSec: ${CON_SEC} };
  const pon = (id,v) => { const e=document.getElementById(id); if(!e) return 'NO '+id;
    e.value=String(v); e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true})); return e.value };
  try { ['modalAvisoEco','login-overlay'].forEach(id => { const m=document.getElementById(id); if (m) m.style.display='none' }) } catch(e){}
  try { showTab('ete') } catch(e) {}
  const sec = document.getElementById('ete-seccion-oai');
  if (sec && getComputedStyle(sec).display === 'none') sec.style.display = 'block';
  pon('oai_morfologia','ala'); pon('oai_profundidad','37'); pon('oai_vel_vac','24');
  if (${CON_SEC}) { pon('oai_sec','severo'); pon('oai_trombo','si'); pon('im_grado','4'); }
  await new Promise(r => setTimeout(r, 900));
  /* DENOMINADOR: que haya dibujo, y con cuantas particulas. */
  o.denominador = { svg: !!document.querySelector('#oai-esq svg'),
                    particulas: document.querySelectorAll('#oai-sec circle').length,
                    largoSVG: (typeof oaiEsqSVG === 'function') ? oaiEsqSVG(0.3, 1.5).length : 0,
                    anim: (typeof _oaiAnimRAF !== 'undefined') ? (_oaiAnimRAF !== null) : 'NO EXISTE' };
  const e = document.getElementById('oai_ostium_diam');
  if (!e) return Object.assign(o, { err: 'sin campo' });
  e.focus();
  o.rondas = [];
  for (let r = 0; r < 5; r++) {
    const ms = [];
    for (let i = 0; i < 13; i++) {
      const t0 = performance.now();
      e.value = (10 + (i % 7) * 3) + (i % 2 ? '.5' : '');
      e.dispatchEvent(new Event('input', { bubbles: true }));
      ms.push(performance.now() - t0);
    }
    const suma = ms.reduce((a,b) => a+b, 0);
    o.rondas.push({ media: Math.round(suma/ms.length*100)/100,
                    max: Math.round(Math.max.apply(null, ms)*100)/100 });
    await new Promise(x => setTimeout(x, 900));   /* deja correr el diferido de 700 ms */
  }
  return o;
})()`;

const b = await chromium.launch({ channel: 'chrome' });
const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push(e.message.slice(0, 120)));
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
await pg.waitForTimeout(1500);
const r = await Promise.race([pg.evaluate(MEDIR),
  new Promise((_, rj) => setTimeout(() => rj(new Error('timeout 90s')), 90000))]);
r.errores = errs;
r.archivo = FILE;
console.log(JSON.stringify(r));
await b.close();
process.exit(0);
