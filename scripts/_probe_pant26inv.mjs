#!/usr/bin/env node
/**
 * _probe_pant26inv.mjs - tanda PANT-26, commit 1. SOLO LECTURA.
 * Nombre propio: verificado con ls, no existia ningun _probe_pant26*.
 * Mide, sobre el arbol que se le pase con --file:
 *   (c) el CENSO COMBINATORIO de los estados que producen la frase vieja de la aortica,
 *       con la banda de cada eje dependiente, para separar los que la decision D1 toca
 *       de los que no;
 *   (f) los textos de los globos i que la tanda va a tocar, leidos del registro Y del DOM;
 *   (h) si vModTrasElegir existe y quien la llama;
 *   (i) la Evidencia de la protesis aortica con un veredicto POSIBLE, para ver si ya razona
 *       las causas;
 *   (3D) los rotulos reales del control segmentado, si el modo del estudio puede ir al PDF,
 *       si tocar una estructura la vuelve transparente, y la linea de abajo en dos escenas;
 *   catalogo: cuantos modelos de PROT_CAT_TAVI y de PROT_CAT_A4 sirven para comparar el area.
 * DENOMINADOR: cada bloque declara si encontro lo que iba a medir; una cadena vacia se
 * reporta como tal y no como «el texto de la app».
 * NO escribe en el proyecto: solo su JSON de salida, en el temporal.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/pant26_inv.json';
const br = await chromium.launch({ channel: 'chrome', headless: true });
const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push('page: ' + String(e).slice(0, 180)));
pg.on('console', m => { if (m.type() === 'error') errs.push('con: ' + m.text().slice(0, 180)) });
await pg.goto('file://' + FILE);
await pg.waitForTimeout(1300);
await pg.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });

const R = await pg.evaluate(async () => {
  const esperar = (ms) => new Promise(r => setTimeout(r, ms));
  const S = (id, val) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = val;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return (String(e.value) === String(val)) ? 1 : 'quedo en ' + e.value; };
  const T = (id) => { const e = document.getElementById(id); return e ? String(e.textContent || '').trim() : null };
  const V = (id) => { const e = document.getElementById(id); return e ? String(e.value || '').trim() : null };
  const sinTags = (h) => String(h || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
  const out = { denom: {}, censo: [], globos: {}, cc3d: {}, catalogo: {}, evidencia: {} };

  /* ── la pestania de valvulas y las secciones abiertas: sin esto el componente no abre ── */
  const abrirValvulas = () => {
    const r = { tab: null, secciones: {} };
    try {
      const b = Array.from(document.querySelectorAll('.tabs-tools .tab-btn, .tab-btn'))
        .find(x => /Válvulas/.test(x.textContent || ''));
      if (b) { b.click(); r.tab = 'boton' } else if (typeof showTab === 'function') { showTab('valvulas'); r.tab = 'showTab' }
    } catch (e) { r.tab = 'ERR ' + e.message }
    ['aortica', 'mitral', 'tricuspide', 'pulmonar'].forEach(k => {
      const el = document.getElementById('ete-seccion-valv-' + k);
      if (!el) { r.secciones[k] = 'NO EXISTE'; return }
      try {
        if (getComputedStyle(el).display === 'none' && typeof toggleEteSeccion === 'function')
          toggleEteSeccion('valv-' + k);
        r.secciones[k] = (getComputedStyle(el).display !== 'none') ? 'abierta' : 'CERRADA';
      } catch (e) { r.secciones[k] = 'ERR' }
    });
    return r;
  };
  const base = async (sets) => {
    try { limpiarCampos(true) } catch (e) {}
    S('nombre', 'PANT26'); S('ci', '0026'); S('peso', '70'); S('talla', '170');
    const puestos = {};
    Object.keys(sets).forEach(k => { puestos[k] = S(k, sets[k]) });
    try { valvProtSync() } catch (e) {}
    abrirValvulas();
    await esperar(350);
    return puestos;
  };
  const estilo = (k) => {
    const b = Array.from(document.querySelectorAll('.estilo-pill')).find(x => x.getAttribute('data-estilo') === k);
    if (b) { b.click(); return 'boton' }
    if (typeof setEstiloInforme === 'function') { setEstiloInforme(k); return 'funcion' }
    return 'NO SE PUDO';
  };
  const informe = () => { generarInforme(); return { inf: V('informe_texto'), suma: V('en_suma') } };
  const lineaAo = (s) => String(s || '').split('\n').filter(l => /aórtic/i.test(l)).join(' | ');

  /* ══ (c) CENSO COMBINATORIO de la aortica ══════════════════════════════════════════════
     Los dos ejes dependientes en sus TRES bandas mas la ausencia, y el eje independiente
     presente o ausente. Los valores salen de EA_PROT_CRIT y no se teclean: lo que se quiere
     medir es la banda, no un numero. Para el DVI se usan los dos VTI, que es el gesto real.  */
  const VM = (typeof EA_PROT_CRIT !== 'undefined') ? EA_PROT_CRIT : null;
  out.denom.EA_PROT_CRIT = !!VM;
  if (VM) {
    const vmaxV = { ausente: null, normal: String(VM.vmax_normal_max - 1),
                    posible: String(VM.vmax_normal_max + 0.5), signif: String(VM.vmax_signif_min + 0.5) };
    const gmedV = { ausente: null, normal: String(VM.savr_gmed_normal_max - 5),
                    posible: String(VM.savr_gmed_normal_max + 5), signif: String(VM.savr_gmed_signif_min + 10) };
    /* VTI 50/100 da DVI 0,50, normal segun savr_dvi_normal_min = 0,35 */
    const indepOn = { diam_tsvi: '21', itv_tsvi: '50', itv_ao: '100' };
    const bandas = ['ausente', 'normal', 'posible', 'signif'];
    for (const morf of ['TAVI', 'Prótesis biológica']) {
      for (const bv of bandas) for (const bg of bandas) for (const ind of [false, true]) {
        const sets = { va_morf: morf };
        if (vmaxV[bv] != null) sets.vmax_ao = vmaxV[bv];
        if (gmedV[bg] != null) sets.gmedio_ao = gmedV[bg];
        if (ind) Object.assign(sets, indepOn);
        await base(sets);
        await esperar(130);
        let P = null; try { P = eaProtVeredicto() } catch (e) {}
        let N = null; try { N = eaProtNarrativa(P) } catch (e) {}
        estilo('estandar'); const r = informe();
        out.censo.push({ morf, bandaVmax: bv, bandaGmed: bg, indep: ind,
          nivel: P && P.nivel, pDep: P && P.pDep, pIndep: P && P.pIndep,
          niveles: P && P.niveles, frase: N && N.frase, resumen: N && N.resumen,
          normoTavi: N && N.normoTavi,
          infAo: lineaAo(r.inf), suma: r.suma,
          fraseVieja: /sin datos suficientes para graduar la estenosis protésica/.test(String(N && N.frase)) });
      }
    }
  }

  /* ══ (f) LOS GLOBOS i QUE LA TANDA TOCA ════════════════════════════════════════════════ */
  try {
    const claves = ['ea-prot-sev', 'ea-prot-ppm', 'cc-3d', 'tavi-calc', 'prot-eoa', 'prot-dvi',
                    'prot-obstr', 'prot-vmax', 'prot-gmed', 'prot-thp', 'prot-ppm'];
    const reg = {};
    claves.forEach(k => {
      const g = (typeof VINFO !== 'undefined') ? VINFO[k] : null;
      reg[k] = g ? { tit: g.tit, lee: g.lee, fuente: g.fuente, ojo: g.ojo, formula: g.formula,
                     ancho: g.ancho, tieneDyn: typeof g.dyn === 'function',
                     claves: Object.keys(g) } : 'SIN ENTRADA';
    });
    out.globos.registro = reg;
    out.globos.QV_NOTA = (typeof QV_NOTA !== 'undefined') ? JSON.parse(JSON.stringify(QV_NOTA)) : 'SIN QV_NOTA';
    out.globos.QV_NOTA_claves = (typeof QV_NOTA !== 'undefined') ? Object.keys(QV_NOTA) : null;
    out.globos.QV_FUENTE_claves = (typeof QV_FUENTE !== 'undefined') ? Object.keys(QV_FUENTE) : null;
    out.globos.QV_ECOSMART = (typeof QV_ECOSMART !== 'undefined') ? QV_ECOSMART : null;
    out.globos.VP_PROT_FUENTE = (typeof VP_PROT_FUENTE !== 'undefined') ? VP_PROT_FUENTE : null;
    out.globos.EA_PROT_SALV = (typeof EA_PROT_SALV !== 'undefined') ? JSON.parse(JSON.stringify(EA_PROT_SALV)) : null;
    /* el i de la capsula aortica abierto de verdad, por su boton, para saber si `lee` se
       renderiza como HTML o como texto: se busca una etiqueta <b> en el cuerpo */
    const btn = document.querySelector('[onclick*="ea-prot-sev"], [data-vinfo="ea-prot-sev"]');
    out.globos.botonEaProtSev = !!btn;
  } catch (e) { out.globos.error = String(e.message).slice(0, 160) }

  /* ══ (h) vModTrasElegir ════════════════════════════════════════════════════════════════ */
  out.denom.vModTrasElegir = (typeof vModTrasElegir === 'function');
  out.denom.vModTrasElegirEnWindow = (typeof window.vModTrasElegir === 'function');
  out.denom.calcEADetalle = (typeof calcEADetalle === 'function');
  out.denom.VMOD_POS = (typeof VMOD_POS !== 'undefined') ? Object.keys(VMOD_POS) : null;

  /* ══ CATALOGO: cuantos modelos sirven para comparar el area ════════════════════════════ */
  try {
    const cuenta = (cat, cols) => {
      const i = cols.indexOf('eoa') + 1;
      let sirven = 0, noSirven = 0, celdasArea = 0, celdasConSd = 0;
      const lista = [];
      cat.forEach(m => {
        let ok = false, nA = 0, nS = 0;
        m.s.forEach(f => { const c = f[i];
          if (c && c[0] != null) { nA++; if (c[1] != null && +c[1] > 0) { nS++; ok = true } } });
        celdasArea += nA; celdasConSd += nS;
        if (ok) sirven++; else { noSirven++; lista.push(m.n + ' [' + (m.d || '') + '] f.' + (m.f || '?')) }
      });
      return { modelos: cat.length, sirven, noSirven, celdasArea, celdasConSd, sinDesvio: lista };
    };
    out.catalogo.tavi = cuenta(PROT_CAT_TAVI, PROT_CAT_TAVI_COLS);
    out.catalogo.a4 = cuenta(PROT_CAT_A4, PROT_CAT_A4_COLS);
    out.catalogo.taviModelos = PROT_CAT_TAVI.map(m => m.n + ' (' + m.s.length + ' tam)');
  } catch (e) { out.catalogo.error = String(e.message).slice(0, 160) }

  /* ══ (i) LA EVIDENCIA DE LA PROTESIS AORTICA CON VEREDICTO «POSIBLE» ═══════════════════ */
  try {
    await base({ va_morf: 'TAVI', vmax_ao: '4.5', gmedio_ao: '45',
                 diam_tsvi: '21', itv_tsvi: '50', itv_ao: '100' });
    await esperar(350);
    let P = null; try { P = eaProtVeredicto() } catch (e) {}
    const sec = (typeof IND_SECS !== 'undefined')
      ? IND_SECS.find(x => String(x.tit || '').indexOf('Prótesis aórtica') === 0) : null;
    out.evidencia.seccionExiste = !!sec;
    out.evidencia.nivelDeLaEscena = P && P.nivel;
    if (sec) { const h = sec.fn();
      out.evidencia.textoPosible = h == null ? '(fn() devolvio null)' : sinTags(typeof h === 'string' ? h : (h.html || '')); }
    out.evidencia.indCausasExiste = (typeof _indCausas === 'function');
  } catch (e) { out.evidencia.error = String(e.message).slice(0, 160) }

  /* ══ EL 3D DE CONGENITAS ═══════════════════════════════════════════════════════════════ */
  try {
    try { limpiarCampos(true) } catch (e) {}
    S('nombre', 'PANT26'); S('ci', '0026');
    /* la pestania de cardiopatias congenitas por su boton real */
    const bt = Array.from(document.querySelectorAll('.tab-btn'))
      .find(x => /Cong[eé]nit/i.test(x.textContent || ''));
    out.cc3d.tabBoton = !!bt;
    if (bt) bt.click(); else if (typeof showTab === 'function') showTab('congenitas');
    await esperar(500);
    /* el recuadro del 3D y su control segmentado */
    const cont = document.getElementById('cc3d-faltan');
    out.cc3d.nodoLinea = !!cont;
    /* los botones del control segmentado: se buscan por su contenedor conocido y, si no,
       por cualquier boton cuyo texto nombre uno de los dos modos */
    const cands = Array.from(document.querySelectorAll('button, .seg-btn, .pill'))
      .filter(b => /Seg[úu]n el estudio|Explorar/i.test(b.textContent || ''));
    out.cc3d.botonesSegmentado = cands.map(b => ({ txt: String(b.textContent || '').trim(),
      id: b.id || null, clase: b.className || null, visible: !!(b.offsetWidth || b.offsetHeight) }));
    /* el boton de incluir en el PDF */
    const pdfB = Array.from(document.querySelectorAll('button, label, input'))
      .filter(b => /Incluir en el PDF/i.test(b.textContent || b.getAttribute('aria-label') || ''));
    out.cc3d.botonesPdf = pdfB.map(b => ({ txt: String(b.textContent || '').trim().slice(0, 60),
      id: b.id || null, tag: b.tagName, visible: !!(b.offsetWidth || b.offsetHeight) }));
    out.cc3d.cmHayCargado = (typeof cmHayCargado === 'function') ? (function(){ try { return cmHayCargado() } catch(e){ return 'ERR' } })() : 'NO EXISTE';
    out.cc3d.modoActual = (typeof _cm3d !== 'undefined' && _cm3d) ? _cm3d.modo : 'SIN _cm3d';
    /* la linea de abajo SIN nada cargado */
    try { if (typeof cc3dTextoSync === 'function') cc3dTextoSync() } catch (e) {}
    await esperar(200);
    out.cc3d.lineaSinNada = T('cc3d-faltan');
    /* la linea de abajo CON una lesion que el diagrama no representa: la VAB, que es uno de
       los cuatro rotulos que pueden caer en esa frase */
    const vab = document.getElementById('cc_vab_presente') || document.getElementById('vab_presente');
    out.cc3d.idVabProbado = vab ? vab.id : null;
    out.cc3d.transparenciaFn = ['cmTocar', 'cm3dTocar', 'cmPick', 'cm3dPick', 'cmTransparente']
      .filter(n => { try { return typeof window[n] === 'function' || typeof eval(n) === 'function' } catch (e) { return false } });
    out.cc3d.CC3D_DIBUJA = (typeof CC3D_DIBUJA !== 'undefined') ? CC3D_DIBUJA.slice() : null;
    out.cc3d.CC3D_PROPIO = (typeof CC3D_PROPIO !== 'undefined') ? CC3D_PROPIO.slice() : null;
    out.cc3d.secsNoDibujadas = (typeof _CC_SECS !== 'undefined' && typeof CC3D_DIBUJA !== 'undefined')
      ? _CC_SECS.filter(x => CC3D_DIBUJA.indexOf(x.k) < 0 && (CC3D_PROPIO || []).indexOf(x.k) < 0)
          .map(x => ({ k: x.k, lbl: x.lbl })) : null;
  } catch (e) { out.cc3d.error = String(e.message).slice(0, 200) }

  return out;
});
R.errores = errs;
fs.writeFileSync(OUTF, JSON.stringify(R, null, 1));
console.log('== DENOMINADOR ==');
console.log(JSON.stringify(R.denom, null, 1));
console.log('\n== CENSO: estados con la frase vieja ==');
const vj = R.censo.filter(c => c.fraseVieja);
console.log('total escenas censadas: ' + R.censo.length + ' · con la frase vieja: ' + vj.length);
vj.forEach(c => console.log('  ' + c.morf + ' vmax=' + c.bandaVmax + ' gmed=' + c.bandaGmed +
  ' indep=' + c.indep + ' -> nivel=' + c.nivel + ' pDep=' + c.pDep + ' normoTavi=' + c.normoTavi));
console.log('\n== CENSO: niveles sin la frase vieja ==');
R.censo.filter(c => !c.fraseVieja).forEach(c => console.log('  ' + c.morf + ' vmax=' + c.bandaVmax +
  ' gmed=' + c.bandaGmed + ' indep=' + c.indep + ' -> ' + c.nivel + ' | ' + String(c.frase).slice(0, 70)));
console.log('\n== CATALOGO ==');
console.log(JSON.stringify(R.catalogo, null, 1));
console.log('\n== 3D ==');
console.log(JSON.stringify(R.cc3d, null, 1));
console.log('\n== EVIDENCIA (posible) ==');
console.log(JSON.stringify(R.evidencia, null, 1).slice(0, 4000));
console.log('\n== ERRORES ==');
console.log(JSON.stringify(R.errores, null, 1));
console.log('\nJSON completo en ' + OUTF);
await br.close();
process.exit(0);
