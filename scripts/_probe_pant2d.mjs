/*
 * _probe_pant2d.mjs - LAS FRASES DEL INFORME DE LA TRANSPOSICION (tanda PANT-2, correccion D,
 * 2026-11-02). Nombre propio: verificado con ls.
 *
 * QUE MIDE. El pedido del medico: el texto se ADAPTA a lo cargado y escribe MENOS.
 *   D1  con disfuncion cargada una frase propia y corta; sin disfuncion, la de funcion normal;
 *       y la frase de CADA campo de la seccion revisada con la misma logica -el hallazgo se
 *       nombra directo y una sola vez-;
 *   D2  cuando un dato NO esta cargado, el texto NO lo menciona: ninguna frase de dato faltante
 *       llega al informe, al EN SUMA, al PDF ni al PPT;
 *   D3  la misma construccion en OTRAS secciones de congenitas se lista y NO se cambia.
 *
 * Recorre CADA opcion de CADA campo de la seccion y guarda las cuatro superficies de texto, asi
 * que la tabla de antes y despues sale de la medicion y no de una lectura.
 *
 *   node scripts/_probe_pant2d.mjs --file /tmp/x.html --out /tmp/pant2d.json
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CAND })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/pant2d.json';

/* Las escenas: CADA opcion de CADA campo de la seccion, sobre el switch auricular -que es la
   rama no descriptiva, la que el medico midio-. Mas la ccTGA y la d-TGA sin operar, que recorren
   la MISMA rama, y Jatene, que es el CONTROL NEGATIVO: su rama ya era descriptiva desde TGA-3 y
   no tiene frase de funcion, asi que no puede cambiar. */
const BASE = { tga_tipo: 'dtga', tga_cirugia: 'auricular' };
const ESC = {};
['', 'normal', 'leve', 'moderada', 'severa'].forEach(function (v) {
  ESC['fvd_' + (v || 'vacio')] = { sel: Object.assign({}, BASE, { tga_func_vd: v }) };
});
['', '1', '2', '3', '4'].forEach(function (v) {
  ESC['it_' + (v || 'vacio')] = { sel: Object.assign({}, BASE, { it_grado: v }) };
});
['', 'si', 'no'].forEach(function (v) {
  ESC['obstr_' + (v || 'vacio')] = { sel: Object.assign({}, BASE, { tga_obstr_subaortica: v }),
    campos: { tga_grad_subaortico: '60' } };
});
['', 'si', 'no'].forEach(function (v) {
  ESC['civ_' + (v || 'vacio')] = { sel: Object.assign({}, BASE, { tga_civ_residual: v }),
    campos: { tga_civ_grad: '20' } };
});
['', 'si', 'no'].forEach(function (v) {
  ESC['bav_' + (v || 'vacio')] = { sel: Object.assign({}, BASE, { tga_bav: v }) };
});
ESC['vdbas'] = { sel: BASE, campos: { vd_bas: '45' } };
ESC['cctga'] = { sel: { tga_tipo: 'cctga', tga_func_vd: 'moderada' } };
ESC['dtgaSinOp'] = { sel: { tga_tipo: 'dtga', tga_cirugia: 'ninguna', tga_func_vd: 'severa' } };
/* CONTROL NEGATIVO: rama descriptiva, sin frase de funcion. */
ESC['jatene'] = { sel: { tga_tipo: 'dtga', tga_cirugia: 'jatene', tga_func_vd: 'moderada' } };
/* CONTROL NEGATIVO 2: un estudio AJENO, sin nada de transposicion. */
ESC['ajeno'] = { sel: {}, campos: { vd_bas: '45', fevi: '55' } };
/* D3: la MISMA construccion en Ebstein, que se LISTA y NO se cambia. */
ESC['ebstein'] = { sel: { ebs_func_vd: 'moderada' }, campos: { ebs_desp: '25', peso: '70', talla: '170' } };

const LEE = `(() => {
  const o = {};
  const _s = function (x) { return String(x == null ? '' : x) };
  try { const c = (typeof tgaConclusion === 'function') ? tgaConclusion() : null;
    o.cl_txt = c ? _s(c.txt) : 'NULL'; o.cl_res = c ? _s(c.resumen) : 'NULL';
    o.cl_pap = c ? _s(c.papel) : 'NULL'; o.cl_clave = c ? _s(c.clave) : 'NULL';
  } catch (e) { o.cl_err = String(e).slice(0, 70) }
  try { o.suma = (typeof ccSumaLinea === 'function') ? _s(ccSumaLinea('tga')) : 'SIN ccSumaLinea' }
  catch (e) { o.suma = 'ERR ' + String(e).slice(0, 50) }
  try { const e2 = (typeof ebsConclusion === 'function') ? ebsConclusion() : null;
    o.ebs = e2 ? _s(e2.txt) : 'NULL' } catch (e) { o.ebs = 'ERR' }
  /* Las tres superficies firmadas de texto: el informe en los tres estilos y el EN SUMA. */
  ['narrativo', 'estructurado', 'telegrafico'].forEach(function (st) {
    try {
      const sel = document.getElementById('estilo_informe');
      if (sel) { sel.value = st; sel.dispatchEvent(new Event('change', { bubbles: true })) }
      if (typeof generarInforme === 'function') generarInforme();
      const t = document.getElementById('informe_texto');
      o['inf_' + st] = t ? _s(t.value) : 'SIN informe_texto';
    } catch (e) { o['inf_' + st] = 'ERR ' + String(e).slice(0, 40) }
  });
  return o;
})()`;

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE, escenas: Object.keys(ESC) };
try {
  const pg = await b.newPage({ viewport: { width: 1400, height: 900 } });
  pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([e.message.slice(0, 140)]) });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
  await pg.waitForTimeout(1500);
  for (const k of Object.keys(ESC)) {
    const E = ESC[k];
    await pg.evaluate(`((esc) => {
      ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
      try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
      const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'falta'; e.value = v;
        e.dispatchEvent(new Event('input', { bubbles: true }));
        e.dispatchEvent(new Event('change', { bubbles: true })); return 'ok' };
      S('nombre', 'Prueba PANT2 D'); S('ci', '623');
      const r = {};
      Object.keys(esc.campos || {}).forEach(x => { r[x] = S(x, esc.campos[x]) });
      Object.keys(esc.sel || {}).forEach(x => { r[x] = S(x, esc.sel[x]) });
      try { if (typeof eteInclToggle === 'function') eteInclToggle('tga_incluir_chk') } catch (e) {}
      try { if (typeof _recalcModulos === 'function') _recalcModulos('d') } catch (e) {}
      Object.keys(window).forEach(x => { if (/^calc[A-Z]/.test(x) && typeof window[x] === 'function') {
        try { window[x]() } catch (e) {} } });
      return r;
    })(${JSON.stringify(E)})`);
    await pg.waitForTimeout(400);
    OUT[k] = await pg.evaluate(LEE);
    console.log('-- ' + k + ' | clave=' + OUT[k].cl_clave);
  }
  await pg.close();
} catch (e) { OUT._err = String(e).slice(0, 250) }
await b.close();
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF);
process.exit(0);
