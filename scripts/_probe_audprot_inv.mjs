#!/usr/bin/env node
/**
 * _probe_audprot_inv.mjs - tanda AUD-PROT, commit 1. SOLO LECTURA.
 * Nombre propio: verificado con ls, no existia.
 * Mide, sobre index.html sin tocarlo: los SEIS catalogos de modelos (modelos, filas de tamanio,
 * celdas con dato, celdas CON desvio y SIN desvio, por columna), la lista de modelos sin desvio
 * en la columna de area, las constantes de cortes de las cuatro valvulas, y VMOD_POS.
 * DENOMINADOR: si un catalogo o una constante no se alcanza por su nombre pelado, lo DICE
 * ('ERR' / null) en vez de contar cero.
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
const OUTF = arg('--out') || '/tmp/audprot_inv.json';
const br = await chromium.launch({ channel: 'chrome', headless: true });
const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push('page: ' + String(e).slice(0, 160)));
pg.on('console', m => { if (m.type() === 'error') errs.push('con: ' + m.text().slice(0, 160)) });
await pg.goto('file://' + FILE);
await pg.waitForTimeout(1200);
const R = await pg.evaluate(() => {
  const O = { cats: {}, cortes: {}, vmod: null, notas: [] };
  const pelado = (nombre) => {
    try { return eval(nombre); } catch (e) { return 'ERR:' + String(e.message).slice(0, 60); }
  };
  /* Los SEIS catalogos y el orden de columnas que cada uno declara. */
  const CATS = [['PROT_CAT_A4', 'PROT_CAT_A4_COLS', 'aortica quirurgica'],
                ['PROT_CAT_TAVI', 'PROT_CAT_TAVI_COLS', 'aortica transcateter'],
                ['PROT_CAT_A5', 'PROT_CAT_A5_COLS', 'mitral'],
                ['PROT_CAT_A9', 'PROT_CAT_A9_COLS', 'tricuspide'],
                ['PROT_CAT_A7', 'PROT_CAT_A7_COLS', 'pulmonar'],
                ['PROT_CAT_A8', 'PROT_CAT_A8_COLS', 'tricuspide ViV/ViR']];
  CATS.forEach(function (par) {
    const nom = par[0], nomCols = par[1], etiqueta = par[2];
    const cat = pelado(nom), cols = pelado(nomCols);
    const D = { nombre: nom, etiqueta: etiqueta, cols: cols, ok: Array.isArray(cat) };
    if (typeof cat === 'string') { D.error = cat; O.cats[nom] = D; return; }
    if (!Array.isArray(cat)) { D.error = 'no es un arreglo: ' + (typeof cat); D.forma = cat && Object.keys(cat); O.cats[nom] = D; return; }
    D.modelos = cat.length;
    D.filas = 0; D.celdas = 0; D.conDesvio = 0; D.sinDesvio = 0; D.conTexto = 0; D.vacias = 0;
    D.porCol = {}; D.sinDesvioEnArea = []; D.sinNingunDesvio = [];
    const COLS = Array.isArray(cols) ? cols : [];
    COLS.forEach(function (c) { D.porCol[c] = { celdas: 0, conDesvio: 0, sinDesvio: 0, conTexto: 0, vacias: 0, modelosConDesvio: 0 }; });
    /* la columna de AREA de cada tabla: la que el comparador contra el modelo necesita */
    const AREA = COLS.indexOf('eoa') > -1 ? 'eoa'
               : (COLS.indexOf('area') > -1 ? 'area' : (COLS.indexOf('avm') > -1 ? 'avm' : null));
    D.colArea = AREA;
    cat.forEach(function (m) {
      const s = Array.isArray(m.s) ? m.s : [];
      D.filas += s.length;
      let algunDesvio = false, areaConDesvio = 0, areaCeldas = 0;
      s.forEach(function (fila) {
        /* fila[0] es el TAMANIO (texto); los valores arrancan en 1 */
        for (let i = 0; i < COLS.length; i++) {
          const c = COLS[i], val = fila[i + 1];
          const P = D.porCol[c]; if (!P) continue;
          if (val == null) { D.vacias++; P.vacias++; continue; }
          D.celdas++; P.celdas++;
          if (c === AREA) areaCeldas++;
          if (val.length > 2 && val[2] != null) { D.conTexto++; P.conTexto++; }
          if (val[1] != null && +val[1] > 0) {
            D.conDesvio++; P.conDesvio++; algunDesvio = true;
            if (c === AREA) areaConDesvio++;
          } else { D.sinDesvio++; P.sinDesvio++; }
        }
      });
      /* El detalle POR MODELO: lo que la auditoria necesita para decir cuales sirven para
         comparar el area contra la del modelo en desviaciones estandar. */
      D.porModelo = D.porModelo || [];
      const _iArea = AREA ? (COLS.indexOf(AREA) + 1) : -1;
      let _ac = 0, _asd = 0;
      if (_iArea > 0) s.forEach(function (fila) {
        const v = fila[_iArea];
        if (v == null) return;
        _ac++;
        if (v[1] != null && +v[1] > 0) _asd++;
      });
      D.porModelo.push({ n: m.n, d: m.d || '', t: m.t || '', f: m.f, tam: s.length,
                         areaCeldas: _ac, areaConDesvio: _asd, uno: !!m.uno, viv: !!m.viv });
      if (!algunDesvio) D.sinNingunDesvio.push(m.n + (m.d ? ' [' + m.d + ']' : '') + ' f.' + m.f);
      if (AREA && areaConDesvio === 0) D.sinDesvioEnArea.push({ n: m.n, d: m.d || '', t: m.t || '', f: m.f,
        celdasArea: areaCeldas, tamanios: s.length });
      COLS.forEach(function (c) {
        const hay = s.some(function (fila) { const v = fila[COLS.indexOf(c) + 1]; return v && v[1] != null && +v[1] > 0; });
        if (hay) D.porCol[c].modelosConDesvio++;
      });
    });
    O.cats[nom] = D;
  });
  /* Las constantes de cortes, literales */
  ['EA_PROT_CRIT', 'EA_PROT_EOA_Z', 'EA_PROT_PPM_CORTES', 'AT_PROT_NORMAL_MAX', 'AT_PROT_POSIBLE_MAX',
   'EA_PROT_VS_MIN', 'EA_PROT_VS_MAX', 'VM_PROT_T11', 'VM_PROT_DVI_NORMAL_MAX', 'VM_PROT_DVI_SIGNIF_MIN',
   'VM_PROT_EOA_OBSTR_MAX', 'VM_PROT_EOA_NORMAL_MIN', 'VM_PROT_PPM_CORTES', 'VM_PROT_IMC_OBESIDAD',
   'VM_PROT_OBSTR_MIN', 'VM_PROT_OBSTR_VOTAN', 'VT_PROT_T19', 'VT_PROT_ORDEN', 'VT_PROT_OBSTR_MIN',
   'VT_PROT_BANDA', 'VP_PROT_T15', 'VP_PROT_ORDEN', 'VP_PROT_BANDA', 'VP_PROT_SIN_COL',
   'PROT_SIN_GRADO_VALVS', 'PROT_SIN_GRADO_TXT', 'VALV_PROT_OPCIONES', 'EM_CONT_REGURG_MIN',
   'EA_PROT_TXT', 'EA_PROT_NORMO', 'VT_PROT_OBSTR_TXT', 'VT_PROT_AISLADO_TXT', 'VP_PROT_OBSTR_TXT',
   'PPM_VALV', 'VMOD_TABLA'].forEach(function (k) { O.cortes[k] = pelado(k); });
  /* VMOD_POS: que cambia por posicion */
  const VP = pelado('VMOD_POS');
  if (VP && typeof VP === 'object') {
    O.vmod = {};
    Object.keys(VP).forEach(function (p) {
      const E = VP[p];
      O.vmod[p] = { morf: E.morf, campos: E.campos, medidos: (E.medidos || []).map(function (m) {
        return { k: m.k, campo: m.campo, lbl: m.lbl || m.lblMed || '', uni: m.uni, fac: m.fac || 1 }; }),
        ppm: E.ppm ? String(E.ppm).slice(0, 40) : null, cortes: E.cortes || null,
        claves: Object.keys(E) };
    });
  }
  /* las opciones reales de cada select de morfologia */
  ['va_morf', 'vm_morf', 'vt_morf', 'vp_morf', 'vp_tipo_prot'].forEach(function (id) {
    const el = document.getElementById(id);
    O.notas.push(id + ' -> ' + (el ? Array.from(el.options).map(function (o) { return o.value }).join(' | ') : 'NO EXISTE'));
  });
  return O;
});
R.errores = errs;
fs.writeFileSync(OUTF, JSON.stringify(R, null, 1));
console.log('=== CATALOGOS ===');
Object.keys(R.cats).forEach(function (k) {
  const D = R.cats[k];
  if (D.error) { console.log(k + '  ERROR: ' + D.error + (D.forma ? ' claves=' + D.forma : '')); return }
  console.log(k + ' (' + D.etiqueta + ')  modelos=' + D.modelos + ' filas=' + D.filas +
    ' celdas=' + D.celdas + ' conDesvio=' + D.conDesvio + ' sinDesvio=' + D.sinDesvio +
    ' conTexto=' + D.conTexto + ' vacias=' + D.vacias + '  cols=' + JSON.stringify(D.cols));
  Object.keys(D.porCol || {}).forEach(function (c) {
    const P = D.porCol[c];
    console.log('    col ' + c + ': celdas=' + P.celdas + ' conDesvio=' + P.conDesvio +
      ' sinDesvio=' + P.sinDesvio + ' conTexto=' + P.conTexto + ' modelosConDesvio=' + P.modelosConDesvio);
  });
  console.log('    colArea=' + D.colArea + '  modelos SIN desvio en el area: ' + (D.sinDesvioEnArea || []).length);
  (D.sinDesvioEnArea || []).forEach(function (m) { console.log('      - ' + m.n + ' [' + m.d + '] t=' + m.t + ' f.' + m.f + ' tam=' + m.tamanios); });
  console.log('    modelos SIN NINGUN desvio: ' + (D.sinNingunDesvio || []).length);
  (D.sinNingunDesvio || []).forEach(function (s) { console.log('      * ' + s); });
});
console.log('=== VMOD_POS ===');
console.log(JSON.stringify(R.vmod, null, 1));
console.log('=== NOTAS ===');
R.notas.forEach(function (n) { console.log(n) });
console.log('=== ERRORES ' + errs.length + ' ===');
errs.slice(0, 6).forEach(function (e) { console.log(e) });
await pg.close(); await br.close();
process.exit(0);
