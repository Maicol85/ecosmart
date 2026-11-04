/*
 * _probe_pant7pant.mjs - PANT-7, commits 5 a 9: el inventario y la geometria de las cinco
 * pantallas, antes y despues, a 1440, 1000, 768 y 390 px.
 * Nombre propio: verificado con ls, no existia.
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda.
 *   node scripts/_probe_pant7pant.mjs --file <index.html> --out <json>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p7pant.json';
const ANCHOS = [1440, 1360, 1200, 1000, 768, 390];

/* Las cinco zonas: su contenedor, su pestania y el acordeon que hay que abrir. */
/* ⚠️ CADA ZONA DECLARA COMO SE ABRE, y no se adivina. Las tres del ETE abren con
   `toggleEteSeccion(clave)` —su encabezado NO lleva el id de la seccion en el `onclick`, asi
   que buscar `[onclick*="<id>"]` no encuentra nada y la seccion se queda en display:none: la
   primera version de esta sonda midio 0x0 en cuatro de las cinco zonas, que es un denominador
   vacio—. Las dos de tarjeta abren con `secToggle(clave)` sobre su `.sacc`. */
const ZONAS = [
  { k: 'wilkins',  tab: 'ete',        sec: 'ete-seccion-wilkins', fila: 'wilk-fila',  ete: 'wilkins' },
  { k: 'orejuela', tab: 'ete',        sec: 'ete-seccion-oai',     fila: 'oai-fila',   ete: 'oai' },
  { k: 'aortaETE', tab: 'ete',        sec: 'ete-seccion-aorta',   fila: 'eteao-fila', ete: 'aorta' },
  { k: 'vab',      tab: 'congenitas', sec: 'sacc-cc-vab',         fila: 'vab-fila',   sacc: 'cc-vab' },
  { k: 'marfan',   tab: 'congenitas', sec: 'sacc-cc-marfan',     fila: 'mfs-fila',   sacc: 'cc-marfan' }
];

const MEDIR = `((Z) => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m=document.getElementById(id); if(m) m.style.display='none' });
  const o = { k: Z.k };
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10,
             x: Math.round(r.x*10)/10, y: Math.round(r.y*10)/10 } };
  try { showTab(Z.tab) } catch (e) { o.tabErr = String(e).slice(0,60) }
  /* Abrir por el camino que la zona declara, que es el que usa el medico. */
  if (Z.ete) { try { toggleEteSeccion(Z.ete) } catch (e) { o.abrirErr = String(e).slice(0,60) } }
  if (Z.sacc) { try { secToggle(Z.sacc) } catch (e) { o.abrirErr = String(e).slice(0,60) } }
  let sec = document.getElementById(Z.sec);
  o.secExiste = !!sec;
  if (sec && getComputedStyle(sec).display === 'none' && Z.ete) {
    try { toggleEteSeccion(Z.ete) } catch (e) {}
  }
  if (sec) {
    /* abrir el acordeon y todos los contenedores cerrados que lo tengan */
    let n = sec, g = 0;
    while (n && g++ < 40) {
      if (n.classList && n.classList.contains('sacc-body') && !n.classList.contains('open')) {
        const h = n.previousElementSibling; if (h) h.click();
      }
      if (n.id && getComputedStyle(n).display === 'none') {
        const h2 = document.querySelector('[onclick*="' + n.id + '"]'); if (h2) h2.click();
      }
      n = n.parentElement;
    }
    if (getComputedStyle(sec).display === 'none') {
      const h3 = document.querySelector('[onclick*="' + Z.sec + '"]'); if (h3) h3.click();
    }
    document.querySelectorAll('*').forEach(e => { e.style.transition='none'; e.style.animation='none' });
    o.abierta = getComputedStyle(sec).display !== 'none';
    o.sec = R(sec);
    /* los campos con id de la seccion, en orden del DOM */
    const ids = Array.prototype.slice.call(sec.querySelectorAll('input[id], select[id], textarea[id]'))
      .filter(e => e.type !== 'hidden').map(e => e.id);
    o.ids = ids; o.nIds = ids.length;
    o.idsOcultos = Array.prototype.slice.call(sec.querySelectorAll('input[type=hidden][id]')).map(e => e.id);
    /* las FILAS: campos que comparten su y */
    const campos = Array.prototype.slice.call(sec.querySelectorAll('.fg'))
      .filter(e => e.getBoundingClientRect().width > 0);
    const porY = {};
    campos.forEach(e => { const y = Math.round(e.getBoundingClientRect().y);
      (porY[y] = porY[y] || []).push(e); });
    const filas = Object.keys(porY).sort((a,b)=>a-b).map(y => porY[y].length);
    o.filas = filas; o.maxPorFila = filas.length ? Math.max.apply(null, filas) : 0;
    o.nCampos = campos.length;
    /* la conclusion: la primera .calc-box de la seccion */
    const cb = sec.querySelector('.calc-box');
    o.concl = R(cb);
    o.conclTxt = cb ? (cb.textContent||'').replace(/\\s+/g,' ').trim().slice(0,120) : null;
    /* el hueco vertical entre el ultimo campo y la conclusion */
    if (cb && campos.length) {
      const fin = Math.max.apply(null, campos.map(e => { const r = e.getBoundingClientRect(); return r.y + r.height }));
      o.hueco = Math.round((cb.getBoundingClientRect().y - fin)*10)/10;
    }
    /* la fila de maqueta, si existe */
    const f = Z.fila ? document.getElementById(Z.fila) : null;
    o.filaExiste = !!f;
    if (f) { o.filaDisplay = getComputedStyle(f).display;
             o.filaCols = getComputedStyle(f).gridTemplateColumns;
             const hijos = Array.prototype.slice.call(f.children).filter(c => c.getBoundingClientRect().width > 0);
             o.filaHijos = hijos.length;
             const ys = hijos.map(c => Math.round(c.getBoundingClientRect().y));
             o.ladoALado = ys.length > 1 ? (Math.max.apply(null,ys) - Math.min.apply(null,ys) < 20) : null; }
    /* los cuadros de NOTAS: .calc-box grises que no son la conclusion, y los mBox */
    const notas = Array.prototype.slice.call(sec.querySelectorAll('.mBox, .nota-gris, .cuadro-notas'));
    o.notasN = notas.length;
    o.notas = notas.map(e => (e.textContent||'').replace(/\\s+/g,' ').trim().slice(0,160));
    /* citas de guia visibles en la seccion */
    const t = (sec.textContent||'');
    o.citas = (t.match(/folio\\s*\\d|Tabla\\s*\\d|Clase\\s*I|ESC\\s*20|ASE\\s*20|AHA/g)||[]).length;
    o.chars = t.replace(/\\s+/g,' ').trim().length;
    /* globos */
    o.globos = sec.querySelectorAll('[data-vinfo]').length;
  }
  return o;
})(__ZONA__)`;

/* Wilkins: los DOS juegos pueden diferir? */
const WILK = `(() => {
  const S=(id,v)=>{const e=document.getElementById(id); if(!e) return 0; e.value=v;
    e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true})); return 1};
  const o = {};
  o.camposEte = (typeof WILK_CAMPOS !== 'undefined') ? JSON.stringify(WILK_CAMPOS) : 'sin WILK_CAMPOS';
  /* juego del ETE en 1/1/1/1 y el de cirugia en 4/4/4/4 */
  ['wilkins_movilidad','wilkins_engrosamiento','wilkins_calcificacion','wilkins_subvalvular'].forEach(id => S(id,'1'));
  ['cx_wilk_mov','cx_wilk_eng','cx_wilk_cal','cx_wilk_sub'].forEach(id => S(id,'4'));
  try { if (typeof calcWilkins === 'function') calcWilkins() } catch(e){}
  try { if (typeof cxWilkins === 'function') cxWilkins() } catch(e){}
  o.ete = { total: ((document.getElementById('wilkins-total')||{}).textContent||'').trim(),
            interp: ((document.getElementById('wilkins-interp')||{}).textContent||'').trim() };
  o.cx  = { total: ((document.getElementById('cx-wilkins-total')||{}).textContent||'').trim() };
  try { o.scoreEte = (typeof wilkinsScore==='function') ? JSON.stringify(wilkinsScore('ete')) : 'sin fn';
        o.scoreCx  = (typeof wilkinsScore==='function') ? JSON.stringify(wilkinsScore('cx'))  : 'sin fn' } catch(e){ o.err=String(e).slice(0,80) }
  o.difieren = o.ete.total !== o.cx.total;
  return o;
})()`;

const res = { file: FILE, anchos: {} };
const nav = await _pw.chromium.launch({ channel: 'chrome' });
for (const w of ANCHOS) {
  const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', e => errs.push(String(e).slice(0, 150)));
  const r = { zonas: {} };
  try {
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(1200);
    for (const Z of ZONAS) {
      /* Marcador inequivoco: `Z)` aparece tambien en la cabecera de la funcion, asi que un
         replace sobre el sustituia la cabecera y dejaba la llamada sin argumento. */
      r.zonas[Z.k] = await pg.evaluate(MEDIR.replace('__ZONA__', JSON.stringify(Z)));
    }
    if (w === 1440) r.wilk = await pg.evaluate(WILK);
  } catch (e) { r.error = String(e).slice(0, 200) }
  r.errores = errs.length; r.err1 = errs[0] || '';
  res.anchos[w] = r;
  await ctx.close();
}
await nav.close();
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log('escrito ' + OUTF);
