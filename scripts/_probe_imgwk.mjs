#!/usr/bin/env node
/**
 * _probe_imgwk.mjs - la sonda de DOS MOTORES de la tanda IMAGENES (2026-10-29).
 *
 * Dos motores x cuatro anchos (1440, 1000, 768 y 390 px) x dos temas = 16 cruces por motor,
 * sobre las zonas que esta tanda toca: la cabecera de Guardados con sus dos botones y la barra
 * de memoria, la pagina de imagenes con sus meses y su columna derecha, el visor, y el esquema
 * de la orejuela en la pestania ETE.
 *
 * ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI, Y SE DECLARA.
 * ⚠️ EL BINARIO DE CHROMIUM DE PLAYWRIGHT NO ESTA EN ESTA MAQUINA, asi que Chrome va por el del
 *    sistema con channel:'chrome'. Sin eso la sonda devuelve los cruces VACIOS, que en un
 *    volcado se lee igual que «no hubo diferencias».
 * ⚠️ LA COPIA DE HEAD VA EN EL DIRECTORIO DEL PROYECTO Y NO EN /tmp: el archivo carga su
 *    tipografia por ruta RELATIVA, asi que una copia en /tmp fabrica un ERR_FILE_NOT_FOUND que
 *    se lee como un error de consola del lado viejo (trampa 8a del mapa de la tanda G).
 * ⚠️ POR DEBAJO DE 768 px LAS PESTANIAS INFORMAN 0 CON CAJA Y ES EL DISENO: la barra lateral se
 *    reemplaza por el desplegable movil.
 * ⚠️ LA PAGINA DE IMAGENES SE MIDE CON IMAGENES SEMBRADAS. Sin estudios con imagenes, la grilla
 *    sale vacia y «cero texto recortado» no prueba nada: es el denominador. La siembra entra por
 *    CeiboStore y CeiboImg, o sea por el camino real, y vive solo en el perfil de esta corrida.
 *
 * ⚠️ UNA BARRA INVERTIDA SIMPLE NO SOBREVIVE AL TEMPLATE LITERAL. El cuerpo de MEDIR va entre
 *    acentos graves, asi que un /[ \t\n]+/ escrito con UNA barra llega al navegador con el
 *    tabulador y el salto de linea LITERALES adentro de la clase, y los dieciseis cruces salen
 *    con «Unterminated regular expression literal» — que en un volcado se lee como que la app
 *    tiene un error de consola. En el archivo van DOS barras.
 *
 *   node scripts/_probe_imgwk.mjs --out /tmp/imgwk.json
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const { chromium, webkit } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/imgwk.json';
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['light', 'dark'];

const MEDIR = `(async () => {
  const o = {};
  const T = (id) => { const e = document.getElementById(id); return e ? (e.textContent||'').replace(/[ \\t\\n]+/g,' ').trim() : 'NO EXISTE' };
  const R = (id) => { const e = document.getElementById(id); if (!e) return null;
    const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height) } };
  const D = (id) => { const e = document.getElementById(id); return e ? getComputedStyle(e).display : 'NO EXISTE' };
  const pon = (id,v) => { const e=document.getElementById(id); if(!e) return 'NO '+id;
    e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); return e.value };
  try { ['modalAvisoEco','login-overlay'].forEach(id => { const m=document.getElementById(id); if (m) m.style.display='none' }) } catch(e){}
  try { localStorage.setItem('cfg-guardar-imagenes','1') } catch(e){}

  /* ── DENOMINADOR: sembrar dos estudios con imagenes ──────────────────────────────────── */
  const jpeg = (t) => { const cv=document.createElement('canvas'); cv.width=120; cv.height=90;
    const cx=cv.getContext('2d'); cx.fillStyle='#123'; cx.fillRect(0,0,120,90);
    cx.fillStyle='#fff'; cx.font='16px sans-serif'; cx.fillText(String(t),8,50);
    return cv.toDataURL('image/jpeg',0.7) };
  if (typeof CeiboStore !== 'undefined' && typeof CeiboImg !== 'undefined') {
    const mk = (id,u,n,f,fe) => ({ id:id, uuid:u, nombre:n, ci:String(id), doc_tipo:'CI',
      fecha_estudio:f, fecha_guardado:f+'T10:00:00Z',
      campos:{ nombre:n, fevi:fe, caso_interes:'', informe_texto:'t' } });
    await CeiboStore.setLocal([ mk(997000001,'wk-uno-001','Sonda WK Uno','2026-03-10','58'),
                                mk(997000002,'wk-dos-002','Sonda WK Dos','2026-04-12','32') ]);
    await CeiboImg.guardar('wk-uno-001', [1,2,3,4,5,6].map(k => ({ dataURL: jpeg('U'+k), calidad:'media', origen:'estudio' })));
    await CeiboImg.guardar('wk-dos-002', [1,2,3,4,5].map(k => ({ dataURL: jpeg('D'+k), calidad:'media', origen:'estudio' })));
    if (typeof igImgInvalidar === 'function') igImgInvalidar();
  }
  try { showTab('guardados') } catch(e) {}
  try { if (typeof igImgCablear === 'function') igImgCablear() } catch(e){}
  try { renderInformesGuardados() } catch(e) {}
  await new Promise(r => setTimeout(r, 700));

  /* ── La cabecera y los dos botones ─────────────────────────────────────────────────────── */
  o.btnInf = R('ig-vista-inf'); o.btnImg = R('ig-vista-img');
  o.pressedInf = (document.getElementById('ig-vista-inf')||{}).getAttribute
    ? document.getElementById('ig-vista-inf').getAttribute('aria-pressed') : 'NO EXISTE';
  o.barraMismaFila = (function(){ const a=document.getElementById('ig-vista-img'),
    b=document.getElementById('ig-img-storage'); if(!a||!b) return 'NO EXISTE';
    const ra=a.getBoundingClientRect(), rb=b.getBoundingClientRect();
    return Math.abs(ra.top-rb.top) < 30 })();

  /* ── La pagina de imagenes ─────────────────────────────────────────────────────────────── */
  const bg = document.getElementById('ig-vista-img');
  if (bg) bg.click();
  await new Promise(r => setTimeout(r, 700));
  o.dispImgView = D('ig-img-view'); o.dispLista = D('ig-lista');
  o.dispBorrar = D('ig-btn-borrar-todos'); o.dispIO = D('ig-io-acciones');
  o.grupos = document.querySelectorAll('#ig-img-lista .ig-mes-grupo').length;
  o.pie = T('ig-img-contador');
  o.sideRect = R('ig-img-side');
  o.filtrosCol = [].map.call(document.querySelectorAll('[data-ig-imgf]'), b => {
    const r = b.getBoundingClientRect();
    return b.dataset.igImgf + ':' + Math.round(r.width) + 'x' + Math.round(r.height) });
  /* Un mes abierto: la grilla con sus miniaturas. */
  const h0 = document.querySelector('#ig-img-lista .ig-mes');
  if (h0) h0.click();
  await new Promise(r => setTimeout(r, 900));
  o.minis = document.querySelectorAll('#ig-img-lista .ig-img-th').length;
  o.minisConImagen = document.querySelectorAll('#ig-img-lista .ig-img-th img').length;
  o.miniRect = (function(){ const t=document.querySelector('#ig-img-lista .ig-img-th');
    if(!t) return null; const r=t.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) } })();
  /* La estrella: 44x44 y sus CINCO puntos dando el propio boton. */
  o.estrella = (function(){ const s=document.querySelector('#ig-img-lista .ig-img-st');
    if(!s) return 'NO EXISTE'; const r=s.getBoundingClientRect();
    const pts=[[r.left+2,r.top+2],[r.right-2,r.top+2],[r.left+2,r.bottom-2],
               [r.right-2,r.bottom-2],[r.left+r.width/2,r.top+r.height/2]];
    const propios = pts.filter(p => { const e=document.elementFromPoint(p[0],p[1]);
      return e === s || (e && e.closest && e.closest('.ig-img-st') === s) }).length;
    return { w: Math.round(r.width), h: Math.round(r.height), puntosPropios: propios,
             color: getComputedStyle(s).color } })();
  /* El visor. */
  const t0 = document.querySelector('#ig-img-lista .ig-img-th');
  if (t0) t0.click();
  await new Promise(r => setTimeout(r, 800));
  o.visorAbierto = D('ig-imgv-ov') !== 'none';
  o.visorInfo = T('ig-imgv-info');
  o.visorBotones = [].map.call(document.querySelectorAll('#ig-imgv-ov button'), b => {
    const r=b.getBoundingClientRect();
    return (b.textContent||'').trim().slice(0,10) + ':' + Math.round(r.width) + 'x' + Math.round(r.height) });
  o.visorRect = R('ig-imgv-vw');
  const cerrar = document.getElementById('ig-imgv-cerrar');
  if (cerrar) cerrar.click();
  await new Promise(r => setTimeout(r, 400));

  /* ── El esquema de la orejuela ─────────────────────────────────────────────────────────── */
  try { showTab('ete') } catch(e) {}
  const sec = document.getElementById('ete-seccion-oai');
  if (sec && getComputedStyle(sec).display === 'none') sec.style.display = 'block';
  pon('oai_morfologia','cactus'); pon('oai_ostium_diam','22'); pon('oai_profundidad','28');
  pon('oai_vel_vac','45');
  await new Promise(r => setTimeout(r, 500));
  o.esqCaja = D('oai-esq-caja');
  o.esqRect = R('oai-esq');
  o.esqSiluetas = document.querySelectorAll('#oai-esq svg path[stroke-linejoin]').length;
  o.esqTexto = (function(){ const s=document.querySelector('#oai-esq svg');
    return s ? (s.textContent||'').trim() : 'NO EXISTE' })();
  o.esqJuzga = /apta|no apta|elegib|Watchman|Amulet|contraindic/i.test(o.esqTexto);

  /* ── Geometria del cuerpo y texto recortado ────────────────────────────────────────────── */
  o.scrollH = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  o.pestanias = [].slice.call(document.querySelectorAll('.tab-btn, [data-tab]')).filter(b => {
    const r = b.getBoundingClientRect(); return r.width > 0 && r.height > 0 }).length;
  const recortados = [];
  ['ig-vista-inf','ig-vista-img','ig-img-contador','ig-imgv-tit','oai-esq-estado']
    .forEach(id => { const e = document.getElementById(id); if (!e) return;
      if (e.scrollWidth > e.clientWidth + 1) recortados.push(id + ' ' + e.scrollWidth + '>' + e.clientWidth) });
  [].forEach.call(document.querySelectorAll('#ig-img-lista .ig-mes-txt, #ig-img-side h4, #ig-img-side-ppt'),
    e => { if (e.scrollWidth > e.clientWidth + 1)
      recortados.push((e.className||'?') + ' ' + e.scrollWidth + '>' + e.clientWidth) });
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
