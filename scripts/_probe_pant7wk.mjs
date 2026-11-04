/*
 * _probe_pant7wk.mjs - PANT-7 en DOS MOTORES: Chrome del sistema y WebKit de Playwright.
 * Nombre propio: verificado con ls y con git ls-tree contra HEAD, no existia.
 * 2 motores x 1440/1000/768/390 px x dos temas = 16 cruces por arbol.
 *   node scripts/_probe_pant7wk.mjs --file <index.html> --out <json>
 * WebKit de Playwright NO es Safari, y se declara. Chrome va por el del sistema.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p7wk.json';
const ANCHOS = [1440, 1000, 768, 390];

/* El cuerpo va en un template literal: CERO acentos graves adentro y CERO expresiones
   regulares, que son las dos trampas que esta casa documenta. */
const MEDIR = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  const o = {};
  const R = (sel) => { const e = (typeof sel === 'string') ? document.querySelector(sel) : sel;
    if (!e) return null; const r = e.getBoundingClientRect();
    return Math.round(r.width*10)/10 + 'x' + Math.round(r.height*10)/10 };
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO';
    e.value = v; e.dispatchEvent(new Event('input', { bubbles:true }));
    e.dispatchEvent(new Event('change', { bubbles:true })); return e.value };
  /* ⚠️ ABRIR LA PESTANIA NO ALCANZA: cada seccion vive dentro de un acordeon que nace cerrado, y
     lo que esta en display:none no tiene geometria -getBoundingClientRect da 0x0 y
     elementFromPoint da null-. La primera version de esta sonda media asi y daba «NO ABRE» y
     «un hijo» en los dieciseis cruces, en los DOS arboles: un cero en los dos lados se lee
     igual que «no cambio». Se abre por el boton real y se le saca la transicion, que es la otra
     trampa -el cuerpo abre con max-height y 0,3 s, y medir en el acto lee la mitad de la
     animacion-. */
  const abrirSec = (id) => { const e = document.getElementById(id); if (!e) return false;
    const vis = () => { const c = getComputedStyle(e);
      return c.display !== 'none' && parseFloat(c.maxHeight || '0') !== 0 };
    if (!vis()) { const h = document.querySelector('[onclick*="' + id + '"]'); if (h) h.click() }
    e.style.transition = 'none'; e.style.maxHeight = 'none';
    e.querySelectorAll('*').forEach(x => { x.style.transition = 'none'; x.style.animation = 'none' });
    return vis() };
  /* ⚠️ LAS SECCIONES DEL ETE NO TIENEN UN HANDLER onclick CON SU id: las abre
     toggleEteSeccion con el nombre de la seccion, que cambia el display en linea. Buscar
     un onclick que contenga ete-seccion-wilkins devuelve null -medido- y queda en display:none
     con sus dos hijos en 0x0, que es por lo que la primera version informaba «un hijo». */
  const abrirEte = (nom) => { try { if (typeof toggleEteSeccion === 'function') {
      const e = document.getElementById('ete-seccion-' + nom);
      if (e && e.style.display === 'none') toggleEteSeccion(nom);
      if (e) { e.style.transition = 'none';
        e.querySelectorAll('*').forEach(x => { x.style.transition = 'none'; x.style.animation = 'none' }) }
      return !!(e && getComputedStyle(e).display !== 'none') } } catch (e) {} return false };
  const irA = (tab, sec) => { try { showTab(tab) } catch (e) {}
    if (!sec) return true;
    if (sec.indexOf('ete-seccion-') === 0) return abrirEte(sec.slice(12));
    return abrirSec(sec) };
  const fsPx = (sel) => { const e = document.querySelector(sel); if (!e) return 'NO';
    return getComputedStyle(e).fontSize };

  /* ---- 1 · EL DIBUJO DEL VD, contra el esquema valvular ---- */
  try { showTab('hemodinamica') } catch (e) {}
  abrirSec('tep-seccion');
  S('tep_mcconnell','si'); S('tep_tabique_d','si'); S('tapse','12');
  S('it_grado','4'); S('vmax_it','4.2'); S('tvia','45');
  try { calcTEP() } catch (e) {} try { calcVD() } catch (e) {} try { vdscSync() } catch (e) {}
  o.vdscCaja = R('#vdsc-svg');
  o.vdscLbl  = fsPx('#vdsc-svg .vdsc-lbl');
  const fila = document.getElementById('vdsc-fila');
  if (fila) { const h = Array.prototype.slice.call(fila.children).map(c => Math.round(c.getBoundingClientRect().y));
    o.vdscLado = h.length > 1 ? ((Math.max.apply(null,h) - Math.min.apply(null,h)) < 20) : null }
  const spt = document.getElementById('vdsc-sptxt'), mct = document.getElementById('vdsc-mctxt');
  o.vdscRot = (spt ? spt.textContent.trim() : 'NO') + ' | ' + (mct ? mct.textContent.trim() : 'NO');
  o.vdscTspans = (spt ? spt.querySelectorAll('tspan').length : -1) + '/' + (mct ? mct.querySelectorAll('tspan').length : -1);

  /* ---- 2 · EL RESALTE DEL 60/60 ---- */
  const leeColor = () => { const a = document.getElementById('tep-6060-lbl'), b = document.getElementById('tep-6060-fila-lbl');
    return (a ? a.style.color : 'NO') + '|' + (b ? b.style.color : 'NO') };
  S('tvia','59'); try { calcVD() } catch (e) {} try { tep6060Resalte() } catch (e) {}
  o.r59 = leeColor();
  S('tvia','60'); try { calcVD() } catch (e) {} try { tep6060Resalte() } catch (e) {}
  o.r60 = leeColor();

  /* ---- 3 · LOS GLOBOS: los dos nuevos y el de Doppler que no abria ---- */
  /* Sube por los ANCESTROS del boton abriendo todo: la pestania por su id tab-*, los cuerpos de
     acordeon sin la clase open -clickeando su hermano anterior- y cualquier ancestro con
     display:none por su propio handler. Es el mismo abridor que la sonda del commit 3 uso, y
     hace falta: cada clave vive en una pestania y en un acordeon distintos, y lo que esta en
     display:none no tiene geometria -los cuatro globos daban 0x0 y NO ABRE-. */
  const abrirHasta = (bt) => {
    let tabId = '';
    { let n = bt; while (n) { if (n.id && n.id.indexOf('tab-') === 0) { tabId = n.id; break } n = n.parentElement } }
    if (tabId) { try { showTab(tabId.slice(4)) } catch (e) {} }
    let n = bt, g = 0;
    while (n && g++ < 40) {
      if (n.classList && n.classList.contains('sacc-body') && !n.classList.contains('open')) {
        const h = n.previousElementSibling; if (h) h.click() }
      if (n.id && getComputedStyle(n).display === 'none') {
        const h2 = document.querySelector('[onclick*="' + n.id + '"]'); if (h2) h2.click() }
      n = n.parentElement }
    document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' }) };
  const globo = (clave, cual) => {
    try { if (typeof vInfoCerrar === 'function') vInfoCerrar(true) } catch (e) {}
    const bs = document.querySelectorAll('[data-vinfo="' + clave + '"]');
    if (!bs.length) return 'SIN BOTON';
    const b = (cual === 'ultimo') ? bs[bs.length - 1] : bs[0];
    abrirHasta(b);
    b.scrollIntoView({ block: 'center' });
    b.click();
    const c = document.getElementById('vinfo-card');
    if (!c || getComputedStyle(c).display === 'none') return 'NO ABRE';
    const r = c.getBoundingClientRect();
    const dentro = (r.left >= -1 && r.top >= -1 && r.right <= window.innerWidth + 1 && r.bottom <= window.innerHeight + 1);
    /* ⚠️ LA LETRA SE MIDE SOBRE LOS NODOS CON TEXTO Y NO SOBRE #vinfo-body, y es por una
       medicion: el font-size que el cartel de la orejuela se fijaba a mano vivia en un
       contenedor INTERNO, asi que preguntarle al cuerpo daba 11px en los DOS arboles y la clave
       no distinguia nada. Lo que se publica es cuantos caracteres de cuerpo hay en cada tamanio,
       que es la misma cuenta que el barrido de las 122 claves. */
    const porTam = {};
    const mirar = (n) => { if (n.nodeType === 3) {
        const t = (n.nodeValue || '').trim(); if (!t) return;
        const pe = n.parentElement; if (!pe) return;
        if (pe.tagName === 'H4') return;
        const fs = getComputedStyle(pe).fontSize;
        porTam[fs] = (porTam[fs] || 0) + t.length; return }
      if (n.nodeType === 1) Array.prototype.forEach.call(n.childNodes, mirar) };
    mirar(c);
    const letras = Object.keys(porTam).sort().map(k => k + ':' + porTam[k]).join(' ');
    const out = Math.round(r.width) + 'x' + Math.round(r.height) + ' dentro:' + dentro
      + ' letra:' + letras + ' chars:' + (c.textContent || '').trim().length;
    try { vInfoCerrar(true) } catch (e) {}
    return out };
  const btn44 = (clave) => { const bs = document.querySelectorAll('[data-vinfo="' + clave + '"]');
    if (!bs.length) return 'SIN BOTON';
    return Array.prototype.slice.call(bs).map(b => { abrirHasta(b); b.scrollIntoView({ block:'center' });
      const r = b.getBoundingClientRect();
      return Math.round(r.width) + 'x' + Math.round(r.height) }).join(',') };
  irA('vd', 'sacc-vd');
  o.gTei  = globo('vd-tei');
  o.gTei44 = btn44('vd-tei');
  o.gTriv1 = globo('vd-triv', 'primero');
  irA('hemodinamica', 'tep-seccion');
  o.g6060 = globo('tep-6060');
  o.g606044 = btn44('tep-6060');
  irA('doppler', 'sacc-ad');
  o.gTriv2 = globo('vd-triv', 'ultimo');
  irA('pericardio', 'ete-seccion-pericardio-masas');
  o.gPleura1 = globo('pul-balik', 'primero');
  irA('hemodinamica', 'ete-seccion-constr-restr');
  o.gPleura2 = globo('pul-balik', 'ultimo');
  /* ⚠️ LAS CAJAS DE LOS DOS BOTONES DE CADA CLAVE SE PUBLICAN, Y HACEN FALTA PARA LEER EL
     RESULTADO. El PRIMER boton de vd-triv y de pul-balik mide 0x0 en los DOS arboles -medido con
     esta sonda y con la dedicada del commit 3 sobre HEAD y sobre el arbol nuevo-: su contenedor
     no lo abre ninguno de los dos abridores, asi que su «NO ABRE» es un DENOMINADOR VACIO y no un
     hallazgo -con caja cero, _vInfoColocar sale por su guarda en los dos lados-. Lo que la tanda
     arregla, y lo que si se ve, es el SEGUNDO: pasa de no abrir a abrir. Declarado en PENDIENTES. */
  o.gTrivBtns = btn44('vd-triv');
  o.gPleuraBtns = btn44('pul-balik');

  /* ---- 4 · LA FRANJA DEL TEER ---- */
  try { limpiarCampos() } catch (e) {}
  irA('ete', 'ete-seccion-teer');
  try { calcTEER() } catch (e) {}
  const av = document.getElementById('teer-tipo-aviso');
  if (av) { o.teerTxt = (av.textContent || '').trim().length;
    o.teerCol = getComputedStyle(av).color;
    o.teerDisp = getComputedStyle(av).display } else { o.teerTxt = 'NO' }

  /* ---- 5 · LAS CUATRO PANTALLAS ---- */
  const lado = (idFila) => { const f = document.getElementById(idFila);
    if (!f) return 'NO'; const hs = Array.prototype.slice.call(f.children).filter(c => c.getBoundingClientRect().width > 0);
    if (hs.length < 2) return 'un hijo';
    const ys = hs.map(c => Math.round(c.getBoundingClientRect().y));
    return ((Math.max.apply(null,ys) - Math.min.apply(null,ys)) < 20) ? 'lado a lado' : 'apilado' };
  const cols = (sel) => { const e = document.querySelector(sel); if (!e) return 'NO';
    const v = getComputedStyle(e).gridTemplateColumns;
    return (v === 'none') ? 'none' : String(v.split(' ').length) };
  irA('ete', 'ete-seccion-wilkins');
  o.wilkFila = lado('wilk-fila');   o.wilkCols = cols('#wilk-campos.grid-1');
  /* la orejuela se mide CARGADA: sin datos su dibujo esta oculto y la fila tiene un solo hijo
     con caja, que es el denominario vacio que la primera version informaba. */
  irA('ete', 'ete-seccion-oai');
  S('oai_ostium_diam','22'); S('oai_profundidad','28'); S('oai_morfologia','pollo');
  try { calcOAI() } catch (e) {}
  /* ⚠️ LA OREJUELA NO SE MIDE CON el comparador de y, y es por su maqueta: su fila es una GRILLA con el
     dibujo abarcando las DOS filas de la columna 2 y la conclusion en la celda (2,1), asi que
     los tres hijos NUNCA comparten la y y ese comparador informaba «apilado» a 1440 px. Lo que se mide
     es lo que la orden pide: el dibujo a la DERECHA de los campos y la conclusion DEBAJO. */
  o.oaiFila = (function () { const f = document.getElementById('oai-fila'); if (!f) return 'NO';
    const c = document.getElementById('oai-campos') || f.children[0];
    const d = document.getElementById('oai-esq-caja');
    const k = f.querySelector(':scope > .calc-box');
    if (!c || !d || !k) return 'incompleta';
    const rc = c.getBoundingClientRect(), rd = d.getBoundingClientRect(), rk = k.getBoundingClientRect();
    if (rd.width < 1) return 'dibujo oculto';
    const alLado = rd.x > rc.x + rc.width - 5 && Math.abs(rd.y - rc.y) < 20;
    const debajo = rk.y > rc.y + rc.height - 5 && rk.x < rd.x;
    return alLado ? (debajo ? 'dibujo a la derecha, conclusion debajo' : 'dibujo a la derecha')
                  : 'apilado' })();
  irA('ete', 'ete-seccion-aorta');
  o.eteaoFila = lado('eteao-fila'); o.eteaoCols = cols('#eteao-campos');
  irA('congenitas', 'sacc-cc-vab');
  const vf = document.getElementById('vab-fila');
  o.vabCols = vf ? vf.querySelectorAll(':scope > .vab-col').length : -1;
  o.vabResumen = !!(vf && vf.querySelector(':scope > .calc-box'));
  o.vabIds = document.querySelectorAll('#sacc-cc-vab input[id], #sacc-cc-vab select[id]').length;
  o.vabGlobos = document.querySelectorAll('#sacc-cc-vab [data-vinfo]').length;

  /* ---- 6 · EL CARTEL DE LA OREJUELA: su letra ---- */
  irA('ete', 'ete-seccion-oai');
  o.oaiGlobo = globo('oai-ref');

  /* ---- 7 · INVARIANTES DE PANTALLA ---- */
  o.scrollH = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  let rec = 0;
  document.querySelectorAll('label, .calc-lbl, .ev-cat, button, option').forEach(e => {
    if (e.id === 'tga-circ-sr') return;
    const r = e.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) return;
    if (e.scrollWidth > Math.ceil(r.width) + 2 && getComputedStyle(e).overflow !== 'auto') rec++ });
  o.recortados = rec;
  o.vinfoCardLetra = (function(){ const c = document.getElementById('vinfo-card');
    return c ? (c.style.fontSize || getComputedStyle(c).fontSize) : 'NO' })();
  return o;
})()`;

const res = { file: FILE, cruces: {} };
const MOTORES = [['chrome', () => _pw.chromium.launch({ channel: 'chrome' })],
                 ['webkit', () => _pw.webkit.launch()]];
for (const [nom, lanzar] of MOTORES) {
  let nav = null;
  try { nav = await lanzar() } catch (e) { res.cruces[nom] = { error: String(e).slice(0, 160) }; continue }
  for (const w of ANCHOS) for (const tema of ['oscuro', 'claro']) {
    const k = nom + '|' + w + '|' + tema;
    const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', e => errs.push('P:' + String(e).slice(0, 120)));
    pg.on('console', m => { if (m.type() === 'error') errs.push('C:' + m.text().slice(0, 120)) });
    try {
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 90000 });
      await pg.waitForTimeout(1300);
      if (tema === 'claro') {
        await pg.evaluate("document.documentElement.classList.add('light-mode');"
          + "document.documentElement.classList.remove('dark-mode');");
        await pg.waitForTimeout(250);
      }
      const r = await Promise.race([pg.evaluate(MEDIR),
        new Promise((_, rj) => setTimeout(() => rj(new Error('timeout ' + k)), 90000))]);
      r.errores = errs.length; r.err1 = errs[0] || '';
      res.cruces[k] = r;
    } catch (e) { res.cruces[k] = { error: String(e).slice(0, 220) } }
    await ctx.close();
  }
  await nav.close();
}
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
console.log('escrito ' + OUTF + '  cruces: ' + Object.keys(res.cruces).length);
