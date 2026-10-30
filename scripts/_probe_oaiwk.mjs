#!/usr/bin/env node
/**
 * _probe_oaiwk.mjs - la sonda de DOS MOTORES de la TANDA NOCTURNA, Parte A (2026-10-30).
 * Calcada de _probe_imgwk.mjs, con sus cuatro advertencias intactas.
 *
 * Dos motores x cuatro anchos (1440, 1000, 768 y 390 px) x dos temas = 16 cruces por motor,
 * sobre lo que los cuatro commits de esta parte tocan: el LUGAR del esquema -lado a lado desde
 * 900 px y apilado por debajo-, los TRES CONTROLES del movimiento con su area tactil, el GLOBO
 * nuevo de «Orejuela izquierda» con sus siete bloques y sin el de dispositivos, el GLOBO AMBAR
 * de «Medidas de la orejuela» como CONTROL de que no cambio, y la LEYENDA del guardado apagado.
 *
 * ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI, Y SE DECLARA.
 * ⚠️ EL BINARIO DE CHROMIUM DE PLAYWRIGHT NO ESTA EN ESTA MAQUINA, asi que Chrome va por el del
 *    sistema con channel:'chrome'. Sin eso la sonda devuelve los cruces VACIOS, que en un
 *    volcado se lee igual que «no hubo diferencias».
 * ⚠️ LA COPIA DE HEAD VA EN EL DIRECTORIO DEL PROYECTO Y NO EN /tmp (trampa 8a de la tanda G).
 * ⚠️ POR DEBAJO DE 768 px LAS PESTANIAS INFORMAN 0 CON CAJA Y ES EL DISENO.
 * ⚠️ `#login-overlay` ES position:fixed Y TAPA LA PAGINA ENTERA: sin descartarlo,
 *    elementFromPoint da 0 de 5 puntos sobre un boton que mide 44x44 de verdad.
 * ⚠️ UNA BARRA INVERTIDA SIMPLE NO SOBREVIVE AL TEMPLATE LITERAL: en el archivo van DOS.
 *
 *   node scripts/_probe_oaiwk.mjs --out /tmp/oaiwk.json
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const { chromium, webkit } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/oaiwk.json';
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['light', 'dark'];

const MEDIR = `(async () => {
  const o = {};
  const T = (id) => { const e = document.getElementById(id); return e ? (e.textContent||'').replace(/[ \\t\\n]+/g,' ').trim() : 'NO EXISTE' };
  const R = (id) => { const e = document.getElementById(id); if (!e) return null;
    const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height),
      x: Math.round(r.left), y: Math.round(r.top), der: Math.round(r.right), aba: Math.round(r.bottom) } };
  const D = (id) => { const e = document.getElementById(id); return e ? getComputedStyle(e).display : 'NO EXISTE' };
  const pon = (id,v) => { const e=document.getElementById(id); if(!e) return 'NO '+id;
    e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); return e.value };
  /* El overlay de login es position:fixed y tapa TODO: sin esto elementFromPoint da 0 de 5. */
  try { ['modalAvisoEco','login-overlay'].forEach(id => { const m=document.getElementById(id); if (m) m.style.display='none' }) } catch(e){}

  /* ── DENOMINADOR: la orejuela CARGADA, con SEC y trombo ──────────────────────────────── */
  try { showTab('ete') } catch(e) {}
  const sec = document.getElementById('ete-seccion-oai');
  if (sec && getComputedStyle(sec).display === 'none') sec.style.display = 'block';
  pon('oai_morfologia','ala'); pon('oai_ostium_diam','22'); pon('oai_profundidad','37');
  pon('oai_vel_vac','24'); pon('oai_sec','severo'); pon('oai_trombo','si');
  await new Promise(r => setTimeout(r, 600));
  o.esqCaja = D('oai-esq-caja');
  o.esqRect = R('oai-esq');
  o.esqSiluetas = document.querySelectorAll('#oai-esq svg path[stroke-linejoin]').length;
  o.esqTexto = (function(){ const s=document.querySelector('#oai-esq svg');
    return s ? (s.textContent||'').replace(/[ \\t\\n]+/g,' ').trim() : 'NO EXISTE' })();
  o.esqJuzga = /apta|no apta|elegib|Watchman|Amulet|contraindic/i.test(o.esqTexto);
  o.esqParticulas = document.querySelectorAll('#oai-sec circle').length;

  /* ── A1 · EL LUGAR ──────────────────────────────────────────────────────────────────── */
  const fila = document.getElementById('oai-fila');
  const grilla = fila ? fila.querySelector('.grid-3') : null;
  o.filaExiste = !!fila;
  const rg = grilla ? grilla.getBoundingClientRect() : null;
  const rc = document.getElementById('oai-esq-caja') ? document.getElementById('oai-esq-caja').getBoundingClientRect() : null;
  o.filaDenominador = { grilla: rg ? Math.round(rg.width) : null, caja: rc ? Math.round(rc.width) : null };
  o.disposicion = (!rg || !rc || !rg.width || !rc.width) ? 'SIN CAJA'
    : (rc.top < rg.bottom && rg.top < rc.bottom && rc.left >= rg.right - 4) ? 'LADO A LADO (derecha)'
    : (rc.top >= rg.bottom - 4) ? 'APILADO (debajo)' : 'MEZCLADO';

  /* ── A2 · LOS TRES CONTROLES y su area tactil ────────────────────────────────────────── */
  /* ⚠️ HAY QUE TRAER EL BOTON AL VIEWPORT ANTES DE MEDIR SUS CINCO PUNTOS.
     elementFromPoint devuelve null para coordenadas FUERA de la ventana, y los tres
     controles caen en y=986 con una ventana de 900 de alto: la primera version de esta sonda
     daba 0/5 sobre botones que miden 44x44 de verdad y no estan tapados por nada. Es la
     hermana de la trampa del #login-overlay: el 0/5 se lee igual en los dos casos. */
  const cinco = (id) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE';
    try { e.scrollIntoView({ block: 'center' }) } catch (x) {}
    const r = e.getBoundingClientRect(); if (!r.width) return 'SIN CAJA';
    if (r.top < 0 || r.bottom > window.innerHeight) return 'FUERA DEL VIEWPORT ' + Math.round(r.top) + '..' + Math.round(r.bottom);
    const pts = [[r.left+2,r.top+2],[r.right-2,r.top+2],[r.left+2,r.bottom-2],
                 [r.right-2,r.bottom-2],[(r.left+r.right)/2,(r.top+r.bottom)/2]];
    let n = 0; pts.forEach(p => { const t = document.elementFromPoint(p[0], p[1]);
      if (t && (t === e || e.contains(t))) n++ });
    return n + '/5' };
  o.ctrl = { pausar: R('oai-esq-pausar'), seguir: D('oai-esq-seguir'), pdf: R('oai-esq-pdf') };
  o.ctrlPuntos = { pausar: cinco('oai-esq-pausar'), pdf: cinco('oai-esq-pdf') };

  /* ── A3 · EL GLOBO NUEVO, y el AMBAR como control ────────────────────────────────────── */
  const btn = document.querySelector('[data-vinfo="oai-ref"]');
  if (btn && typeof vInfoClic === 'function') { try { vInfoClic(btn) } catch(e) {} }
  await new Promise(r => setTimeout(r, 350));
  const card = document.getElementById('vinfo-card');
  o.globoHay = !!card;
  if (card) {
    const r = card.getBoundingClientRect();
    o.globoRect = { w: Math.round(r.width), h: Math.round(r.height),
                    x: Math.round(r.left), y: Math.round(r.top) };
    o.globoEnPantalla = r.left >= -1 && r.top >= -1 &&
                        r.right <= window.innerWidth + 1 && r.bottom <= window.innerHeight + 1;
    o.globoScroll = { v: card.scrollHeight > card.clientHeight + 2,
                      h: card.scrollWidth > card.clientWidth + 2 };
    const t = (card.textContent||'').replace(/[ \\t\\n]+/g,' ').trim();
    o.globoChars = t.length;
    o.globoBloques = ['Por qué importa','Morfología','Velocidad de vaciamiento','Trombo',
                      'Contraste espontáneo','Medidas','Lo que no se pudo verificar','Fuentes']
                      .filter(x => t.indexOf(x) > -1).length;
    o.globoSinDispositivos = !/Dispositivos de cierre|Ninguna guía de la biblioteca|Ficha de la pestaña Referencias|Amulet|WATCHMAN/.test(t);
    o.globoFuentes = (t.match(/\\[[1-4]\\]/g) || []).length;
    o.globoChip = t.indexOf('CRITERIO DE ECOSMART') > -1;
  }
  try { if (typeof vInfoCerrar === 'function') vInfoCerrar(true) } catch(e) {}
  await new Promise(r => setTimeout(r, 200));
  /* El AMBAR: es un <details> dentro de #oai-notas que arma oaiTablasGlobo. CONTROL: su texto
     tiene que salir IDENTICO al de HEAD, porque esta parte no lo toca. */
  o.ambarTexto = (function(){ const n = document.getElementById('oai-notas');
    if (!n) return 'NO EXISTE'; const d = n.querySelector('details');
    return d ? (d.textContent||'').replace(/[ \\t\\n]+/g,' ').trim() : 'SIN DETAILS' })();
  o.ambarChars = (o.ambarTexto||'').length;

  /* ── A4 · LA LEYENDA del guardado apagado ────────────────────────────────────────────── */
  o.leyenda = (function(){ try {
    if (typeof esqGuardarComoImagen !== 'function') return 'NO EXISTE';
    localStorage.setItem('cfg-guardar-imagenes','0');
    return null } catch(e) { return 'ERR' } })();
  o.leyendaMotivo = await (async () => {
    try { const r = await esqGuardarComoImagen('x','x','<svg xmlns="http://www.w3.org/2000/svg"></svg>',10,10);
          return r && r.motivo ? r.motivo : '(sin motivo)' } catch(e) { return 'EXC' } })();
  o.recolectores = { img: (typeof CeiboImg !== 'undefined' && !!CeiboImg.recolectar),
                     cine: (typeof CeiboCine !== 'undefined' && !!CeiboCine.recolectar),
                     video: (typeof CeiboVideo !== 'undefined' && !!CeiboVideo.recolectar) };

  /* ── Geometria del cuerpo y texto recortado ──────────────────────────────────────────── */
  o.scrollH = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  o.pestanias = [].slice.call(document.querySelectorAll('.tab-btn, [data-tab]')).filter(b => {
    const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 }).length;
  const recortados = [];
  ['oai-esq-estado','oai-esq-pausar','oai-esq-pdf','oai-vel-interp','oai-elegibilidad']
    .forEach(id => { const e = document.getElementById(id); if (!e) return;
      if (e.scrollWidth > e.clientWidth + 1) recortados.push(id + ' ' + e.scrollWidth + '>' + e.clientWidth) });
  o.recortados = recortados;
  return o;
})()`;

const OUT = { archivo: FILE, cruces: {} };
for (const [nom, motor, opts] of [['chrome', chromium, { channel: 'chrome' }], ['webkit', webkit, {}]]) {
  let b = null;
  try { b = await motor.launch(opts) } catch (e) { OUT['err_' + nom] = String(e).slice(0, 180); continue }
  for (const w of ANCHOS) for (const tema of TEMAS) {
    const k = nom + '/' + w + '/' + tema;
    try {
      const pg = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: tema });
      const errs = [];
      pg.on('console', m => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)) });
      pg.on('pageerror', e => errs.push('PAGEERROR ' + e.message.slice(0, 120)));
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
      await pg.waitForTimeout(1200);
      const r = await Promise.race([pg.evaluate(MEDIR),
        new Promise((_, rj) => setTimeout(() => rj(new Error('timeout 60s en ' + k)), 60000))]);
      r.errores = errs;
      OUT.cruces[k] = r;
      await pg.close();
      process.stderr.write('  ' + k + ' ok\n');
    } catch (e) { OUT.cruces[k] = { EXC: String(e).slice(0, 180) }; process.stderr.write('  ' + k + ' EXC\n') }
  }
  try { await b.close() } catch (e) {}
}
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF);
process.exit(0);
