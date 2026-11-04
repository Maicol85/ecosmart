/*
 * _probe_pant6wk.mjs - Chrome y WebKit sobre las zonas de la tanda PANT-6 (2026-11-03).
 * Nombre propio: verificado con ls contra HEAD, no existia -- la coleccion ya tiene cincuenta y
 * seis sondas de dos motores y dos tandas distintas llamadas AJ1 y AJ3 pagaron el sobrescribir
 * una ajena.
 *
 * Dos motores x 1440, 1000, 768 y 390 px x dos temas = DIECISEIS cruces por motor.
 * ⚠️ WebKit de Playwright NO es Safari, y se declara. Chrome va por el del sistema con
 *    channel chrome: sin eso la sonda devuelve los cruces vacios.
 *
 *   node scripts/_probe_pant6wk.mjs --file <index.html> --out <json>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p6wk.json';
const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['oscuro', 'claro'];

const MEDIR = (tema) => `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  if (${JSON.stringify(tema)} === 'claro') { try { document.documentElement.classList.add('light-mode') } catch (e) {} }
  /* Las transiciones se apagan ANTES de tocar: un acordeon que abre con max-height y 0,3 s
     informa, leido en el acto, la caja de MITAD de la animacion. Es la trampa que AJ9 pago. */
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  const o = {};
  const R = (sel) => { const e = typeof sel === 'string' ? document.querySelector(sel) : sel;
    if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10, x: Math.round(r.x*10)/10, y: Math.round(r.y*10)/10 } };
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return;
    if (e.options && v !== '' && !Array.prototype.some.call(e.options, x => x.value === String(v))) {
      const op = document.createElement('option'); op.value = String(v); op.textContent = String(v); e.appendChild(op) }
    e.value = v; e.dispatchEvent(new Event('input', { bubbles:true })); e.dispatchEvent(new Event('change', { bubbles:true })) };
  const lado = (a, b) => (a && b) ? (Math.abs(a.y - b.y) < 20 && a.x < b.x) : null;

  /* ══ COMMIT 1 · LA PANTALLA DE CIA Y CIV ═════════════════════════════════════════════════
     ⚠️ LA SECCION VIVE EN LA SUB-PESTANIA «CC complejas» Y NO EN LA PRIMERA: con solo showTab
     todo su arbol queda bajo display:none y los rect dan 0x0, que se lee como «no existe». */
  try { showTab('congenitas') } catch (e) {}
  try { if (typeof ccSubTab === 'function') ccSubTab('congenitas2') } catch (e) {}
  const sh = document.getElementById('sacc-cc-shunt');
  if (sh && !sh.classList.contains('open')) { const h = sh.querySelector('.sacc-hdr'); if (h) h.click() }
  const cuerpoSh = sh && sh.querySelector('.sacc-body'); if (cuerpoSh) cuerpoSh.style.maxHeight = 'none';
  /* NINGUN boton tocado: es la combinacion que la decision del medico cambia. */
  try { eteShuntSync() } catch (e) {}
  const pc = document.getElementById('ete-shunt-pane-cia'), pv = document.getElementById('ete-shunt-pane-civ');
  o.ciaVis = pc ? getComputedStyle(pc).display !== 'none' : null;
  o.civVis = pv ? getComputedStyle(pv).display !== 'none' : null;
  o.ccPc = R(pc); o.ccPv = R(pv);
  o.ccLado = lado(o.ccPc, o.ccPv);
  o.ccBordeCia = pc ? getComputedStyle(pc).borderTopWidth : null;
  o.ccBotonEnCuadro = (() => { const b = document.getElementById('ete-shunt-tab-cia');
    return !!(b && pc && pc.contains(b)) })();
  const com = document.getElementById('ete-shunt-comun');
  o.ccComun = R(com);
  o.ccComunFuera = (() => { const f = document.getElementById('ete-shunt-fila');
    return !!(com && f && !f.contains(com)) })();
  o.ccDeshab = (() => { if (!cuerpoSh) return -1;
    return Array.prototype.slice.call(cuerpoSh.querySelectorAll('input[id], select[id]'))
      .filter(e => e.type !== 'checkbox' && e.type !== 'hidden' && e.disabled).length })();
  o.ccPapsIt = document.querySelectorAll('[id$="-paps-it"]').length;
  o.donut = R('#cia-donut-svg');
  /* El recorte del cuerpo del acordeon, que era PREEXISTENTE. */
  o.ccRecorteCuerpo = cuerpoSh ? Math.max(0, cuerpoSh.scrollHeight - cuerpoSh.clientHeight) : -1;

  /* ══ COMMIT 2 · EL DIBUJO DE SOBRECARGA DEL VD ═══════════════════════════════════════════
     ⚠️ ESTA SECCION ES UN toggleCard Y NO UN ACORDEON .sacc: su encabezado hay que tocarlo o
     el SVG informa 0x0 en los dieciseis cruces. */
  try { showTab('hemodinamica') } catch (e) {}
  const tep = document.getElementById('tep-seccion');
  if (tep && getComputedStyle(tep).display === 'none') { const h = document.querySelector('[onclick*="tep-seccion"]'); if (h) h.click() }
  S('tep_vdvi','1.30'); S('tapse','10'); S('it_grado','4'); S('vmax_it','4.2');
  try { vdscSync(); vdscFase(0.40) } catch (e) {}
  const svg = document.getElementById('vdsc-svg');
  o.vdDib = R(svg);
  o.vdCampos = R('#vdsc-campos'); o.vdLista = R('#vdsc-lista');
  o.vdLado = lado(o.vdCampos, o.vdDib);
  /* EL TAMANIO REAL DEL ROTULO MAS CHICO, que es lo que el commit 2 viene a arreglar: el
     font-size del SVG escala con su ancho, asi que hay que multiplicar por ancho/viewBox. */
  o.vdLetraMin = (() => { if (!svg) return null;
    const vb = (svg.getAttribute('viewBox') || '').split(/[ ,]+/);
    const w = svg.getBoundingClientRect().width, vbw = parseFloat(vb[2] || 0);
    if (!w || !vbw) return null;
    const k = w / vbw; let mn = 1e9, n = 0;
    svg.querySelectorAll('text, tspan').forEach(t => {
      const txt = (t.textContent || '').trim(); if (!txt) return;
      const fs2 = parseFloat(getComputedStyle(t).fontSize) || parseFloat(t.getAttribute('font-size') || 0);
      if (!fs2) return; n++; const px = fs2 * (fs2 > 20 ? 1 : k);
      if (px < mn) mn = px });
    return n ? { px: Math.round(mn*100)/100, n: n } : null })();
  o.vdListaFilas = document.querySelectorAll('#vdsc-lista .calc-row').length;
  /* CONTROL NEGATIVO: el esquema valvular 2D no hereda el ancho del dibujo del VD. */
  o.v2dAncho = (() => { const e = document.getElementById('v2d-svg');
    return e ? Math.round(getComputedStyle(e).maxWidth === 'none' ? -1 : parseFloat(getComputedStyle(e).maxWidth)) : null })();

  /* ══ COMMIT 6a · EL FORRESTER SIN FRASE DE DATO FALTANTE EN EL PAPEL ═════════════════════ */
  try { if (typeof calcHemo === 'function') calcHemo() } catch (e) {}
  o.forrPantalla = (() => { const e = document.getElementById('hemo-forrester');
    return e ? (e.textContent || '').indexOf('falta') > -1 : null })();
  o.forrModulo = (() => { try { return String(amiloTextoHemo() || '').indexOf('faltan el índice') > -1 } catch (e) { return 'ERR' } })();

  /* ══ COMMIT 5 · LOS CRITERIOS TEER LADO A LADO ═══════════════════════════════════════════ */
  try { showTab('ete') } catch (e) {}
  try { toggleEteSeccion('criterios-teer') } catch (e) {}
  const bp = document.getElementById('teer-bloque-primaria'), bs = document.getElementById('teer-bloque-secundaria');
  o.teerDos = (bp && bs) ? (getComputedStyle(bp).display !== 'none' && getComputedStyle(bs).display !== 'none') : null;
  o.teerLado = lado(R(bp), R(bs));
  o.teerMedio = (() => { const e = document.getElementById('teer-medio');
    return e ? getComputedStyle(e).gridTemplateColumns.split(' ').length : -1 })();
  /* Los dos rotulos de la profundidad de coaptacion, que el commit 6b distingue. */
  const rot = (id) => { const e = document.getElementById(id); if (!e) return 'NO';
    const g = e.closest ? e.closest('.fg') : null; const l = g ? g.querySelector('label') : null;
    return l ? (l.textContent || '').trim() : 'SIN LABEL' };
  o.rotEte = rot('ete_prof_coapt'); o.rotTeer = rot('teer_prof_flail');
  o.rotDistintos = o.rotEte !== o.rotTeer;

  /* ══ COMMIT 4 · LA MITRAL DEL ETE EN UNA SECCION DE TRES COLUMNAS ════════════════════════ */
  try { toggleEteSeccion('morfo') } catch (e) {}
  const cols = document.getElementById('etem-cols');
  o.etemCols = cols ? getComputedStyle(cols).gridTemplateColumns.split(' ').length : -1;
  o.etemHijos = cols ? cols.children.length : -1;
  o.etemDesfavFuera = (() => { const d = document.getElementById('etem-desfav');
    return !!(d && cols && !cols.contains(d)) })();
  o.etemAlias = (() => { const e = document.getElementById('ete-seccion-morfo'); if (!e) return 'NO';
    const d0 = e.style.display || '';
    try { toggleEteSeccion('mediciones-mitral') } catch (err) { return 'ERR' }
    const d1 = e.style.display || '';
    try { toggleEteSeccion('mediciones-mitral') } catch (err) {}
    return d0 !== d1 })();

  /* ══ COMMITS 3 y 7 · EL MOLDE EN EL PANEL DE EVIDENCIA ═══════════════════════════════════ */
  try { limpiarCampos() } catch (e) {}
  S('peso','70'); S('talla','170'); S('avm_plan','1.2'); S('em_gmedio','12'); S('em_grado','severa');
  S('vm_morf','Calcificada');
  S('ia_grado','4'); S('fevi','48'); S('dsfvi','52');
  try { indicCerrar() } catch (e) {}
  try { indicAbrir() } catch (e) {}
  const cu = document.getElementById('indic-cuerpo');
  o.panel = R('#indic-card');
  o.moldeSecs = cu ? cu.querySelectorAll('[data-ind-molde]').length : -1;
  o.moldeFranjaCat = cu ? cu.querySelectorAll('.ind-franja-cat').length : -1;
  o.moldeFranjaEst = cu ? cu.querySelectorAll('.ind-franja-est').length : -1;
  o.moldeDatos = cu ? cu.querySelectorAll('.ind-datos .ind-dato-lbl').length : -1;
  o.moldePregcols = cu ? cu.querySelectorAll('.ind-pregcols').length : -1;
  /* ⚠️ ESTA LINEA ERA UN TERNARIO ANIDADO SIN CERRAR Y TIRABA LOS DIECISEIS CRUCES: Chrome decia
     «Unexpected token ;» y WebKit, mas claro, «Expected : in ternary operator». Escrita como
     funcion no hay forma de equivocarse. */
  o.moldeAncho = (() => { if (!cu) return '-';
    const e = cu.querySelector('[data-ind-molde]');
    return e ? (e.getAttribute('data-ind-ancho') || '-') : '-' })();
  /* LA PREGUNTA DE SINTOMAS CON LA ETIOLOGIA CALCIFICADA, que es el defecto del medico. */
  o.sxCalcif = cu ? cu.querySelectorAll('[data-ind-clin="em.sintomas"]').length : -1;
  /* Los globos de sintomas, con su area tactil de 44 px y sus cinco puntos propios. */
  o.globosSx = (() => { const bs2 = cu ? cu.querySelectorAll('[data-ind-term$="sintomas"]') : [];
    let ok = 0, mal = [];
    Array.prototype.slice.call(bs2).forEach(b => {
      b.scrollIntoView({ block:'center' });
      const r = b.getBoundingClientRect();
      if (r.width < 43 || r.height < 43) { mal.push('chico ' + Math.round(r.width) + 'x' + Math.round(r.height)); return }
      const pts = [[r.x+2,r.y+2],[r.x+r.width-2,r.y+2],[r.x+2,r.y+r.height-2],
                   [r.x+r.width-2,r.y+r.height-2],[r.x+r.width/2,r.y+r.height/2]];
      const propios = pts.filter(p => { const e2 = document.elementFromPoint(p[0], p[1]);
        return !!(e2 && (e2 === b || b.contains(e2))) }).length;
      if (propios === 5) ok++; else mal.push(propios + '/5') });
    return { n: bs2.length, ok: ok, mal: mal.join(',') } })();
  /* Las etiquetas de los globos tienen que ser TODAS distintas: es lo que TC-451 exige. */
  o.globosEtq = (() => { const bs2 = cu ? cu.querySelectorAll('[data-ind-term$="sintomas"]') : [];
    const et = Array.prototype.slice.call(bs2).map(b => b.getAttribute('aria-label') || '');
    return { n: et.length, distintas: (new Set(et)).size } })();
  try { indicCerrar() } catch (e) {}

  /* ══ EL PAPEL, QUE NO SE PUEDE MOVER ═════════════════════════════════════════════════════ */
  o.papel = (() => { try { generarInforme();
      const t = (document.getElementById('informe_texto') || {}).value || '';
      return { n: t.length, franja: t.indexOf('la que publica el informe') > -1,
               datos: t.indexOf('Datos del estudio') > -1 } } catch (e) { return { err: String(e).slice(0,60) } } })();

  /* ══ GEOMETRIA GLOBAL ════════════════════════════════════════════════════════════════════ */
  o.scrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  o.recortados = 0;
  document.querySelectorAll('label, .calc-lbl').forEach(e => {
    if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) o.recortados++ });
  return o;
})()`;

const res = { file: FILE, cruces: {} };
for (const motor of ['chromium', 'webkit']) {
  let nav;
  try { nav = motor === 'chromium' ? await _pw.chromium.launch({ channel: 'chrome' }) : await _pw.webkit.launch() }
  catch (e) { res.cruces[motor] = { error: String(e).slice(0, 120) }; continue }
  for (const w of ANCHOS) for (const t of TEMAS) {
    const k = motor + '@' + w + '@' + t;
    const ctx = await nav.newContext({ viewport: { width: w, height: 900 } });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', e => errs.push(String(e).slice(0, 110)));
    pg.on('console', m => { if (m.type() === 'error') errs.push('C:' + m.text().slice(0, 110)) });
    try {
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 90000 });
      await pg.waitForTimeout(1200);
      const r = await Promise.race([pg.evaluate(MEDIR(t)),
        new Promise((_, rj) => setTimeout(() => rj(new Error('timeout ' + k)), 120000))]);
      r.errores = errs.length; r.err1 = errs[0] || '';
      res.cruces[k] = r;
    } catch (e) { res.cruces[k] = { error: String(e).slice(0, 160) } }
    await ctx.close();
  }
  await nav.close();
}
fs.writeFileSync(OUTF, JSON.stringify(res, null, 1));
for (const k of Object.keys(res.cruces)) {
  const a = res.cruces[k];
  if (a.error) { console.log(k.padEnd(22) + ' ERROR ' + a.error); continue }
  console.log(k.padEnd(22) +
    ' | cc ' + (a.ccPc ? a.ccPc.w : '-') + '/' + (a.ccPv ? a.ccPv.w : '-') +
    ' vis=' + a.ciaVis + '/' + a.civVis + ' lado=' + a.ccLado + ' borde=' + a.ccBordeCia +
    ' btnEn=' + a.ccBotonEnCuadro + ' comunFuera=' + a.ccComunFuera + ' deshab=' + a.ccDeshab +
    ' papsIt=' + a.ccPapsIt + ' recorte=' + a.ccRecorteCuerpo +
    ' | vd ' + (a.vdDib ? a.vdDib.w + 'x' + a.vdDib.h : '-') + ' lado=' + a.vdLado +
    ' letra=' + (a.vdLetraMin ? a.vdLetraMin.px + 'px/' + a.vdLetraMin.n : '-') +
    ' lista=' + a.vdListaFilas + ' v2d=' + a.v2dAncho +
    ' | forr pant=' + a.forrPantalla + ' mod=' + a.forrModulo +
    ' | teer dos=' + a.teerDos + ' lado=' + a.teerLado + ' cols=' + a.teerMedio +
    ' rotDist=' + a.rotDistintos +
    ' | etem cols=' + a.etemCols + ' hijos=' + a.etemHijos + ' desfavFuera=' + a.etemDesfavFuera +
    ' alias=' + a.etemAlias +
    ' | molde secs=' + a.moldeSecs + ' cat=' + a.moldeFranjaCat + ' est=' + a.moldeFranjaEst +
    ' datos=' + a.moldeDatos + ' pregcols=' + a.moldePregcols + ' ancho=' + a.moldeAncho +
    ' sxCalc=' + a.sxCalcif +
    ' globos=' + (a.globosSx ? a.globosSx.ok + '/' + a.globosSx.n + (a.globosSx.mal ? '(' + a.globosSx.mal + ')' : '') : '-') +
    ' etq=' + (a.globosEtq ? a.globosEtq.distintas + '/' + a.globosEtq.n : '-') +
    ' | papel ' + (a.papel ? a.papel.n + ' franja=' + a.papel.franja + ' datos=' + a.papel.datos : '-') +
    ' | scrollX=' + a.scrollX + ' recort=' + a.recortados + ' err=' + a.errores + ' ' + (a.err1 || ''));
}
