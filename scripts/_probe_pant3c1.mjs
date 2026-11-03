/*
 * _probe_pant3c1.mjs - los botones CIA y CIV de la seccion «CIA / CIV» (tanda PANT-3, commit 1).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * Mide con GESTOS REALES lo que el A/B no puede medir: el pintado (relleno y no solo borde), la
 * persistencia al cambiar de pestania -que es el defecto que el medico reporto- y el ida y vuelta
 * de guardar y reabrir. Y el alto de la seccion a los cuatro anchos, antes y despues.
 *
 * DENOMINADORES: cada bloque publica lo que midio ANTES de juzgarlo. En el arbol de HEAD los dos
 * checkbox no existen, asi que varios bloques salen 'NO EXISTE' a proposito: eso es la linea base,
 * no un fallo.
 *
 *   node scripts/_probe_pant3c1.mjs --file <index.html> --out /tmp/p3c1.json
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
const OUTF = arg('--out') || '/tmp/p3c1.json';
const ANCHOS = (arg('--anchos') || '1440,1000,768,390').split(',').map(Number);

/* ══ ABRIR LA PESTANIA Y EL ACORDEON POR SU BOTON REAL ══════════════════════════════════════
   Es la regla de esta tanda, y hace falta: con la pestania cerrada todo getBoundingClientRect da
   0x0 y la sonda informa «todo bien» sobre cajas de cero. La seccion vive en «CC frecuentes»
   (#tab-congenitas) y su acordeon es #sacc-cc-shunt, que NACE CERRADO. */
const ABRIR = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  const out = {};
  /* ⚠️ «CIA / CIV» VIVE EN «CC complejas» (#tab-congenitas2), NO en frecuentes, y es la misma
     trampa que la tanda TGA documento: abriendo la otra sub-pestania el arbol de la seccion queda
     bajo un display:none, offsetParent da null y TODO getBoundingClientRect da 0x0 — la sonda
     informa «todo bien» sobre cajas de cero. Medido: la primera version daba cuerpoH 0 en los
     cuatro anchos. */
  try { if (typeof showTab === 'function') showTab('congenitas2') } catch (e) {}
  try { if (typeof ccSubTab === 'function') ccSubTab('congenitas2') } catch (e) {}
  const ts = document.getElementById('tab-congenitas2');
  out.tabVisible = ts ? (getComputedStyle(ts).display === 'none' ? 'oculta' : 'visible') : 'NO EXISTE';
  const sec = document.getElementById('sacc-cc-shunt');
  out.secExiste = !!sec;
  if (sec && !sec.classList.contains('open')) {
    const h = sec.querySelector('.sacc-hdr'); if (h) h.click();
  }
  out.abierto = !!(sec && sec.classList.contains('open'));
  const cu = sec && sec.querySelector('.sacc-body');
  out.cuerpoH = cu ? Math.round(cu.scrollHeight) : 0;
  return out;
})()`;

/* Lo que se lee de los dos botones: su caja, sus clases, el color de fondo COMPUTADO -que es lo
   que distingue «pintado entero» de «solo el borde»- y el estado del checkbox. */
const LEER = `(() => {
  const out = {};
  const bt = (id) => {
    const b = document.getElementById(id);
    if (!b) return { existe: 0 };
    const r = b.getBoundingClientRect(), cs = getComputedStyle(b);
    return { existe: 1, w: Math.round(r.width), h: Math.round(r.height),
             cls: b.className, pressed: b.getAttribute('aria-pressed'),
             bg: cs.backgroundColor, bd: cs.borderColor, col: cs.color, ring: cs.boxShadow,
             relleno: /rgba?\\(0, 0, 0, 0\\)|transparent/.test(cs.backgroundColor) ? 0 : 1,
             title: String(b.title || '').slice(0, 40) };
  };
  out.cia = bt('ete-shunt-tab-cia'); out.civ = bt('ete-shunt-tab-civ');
  const ck = (id) => { const e = document.getElementById(id); return e ? (e.checked ? 1 : 0) : 'NO EXISTE' };
  out.ciaChk = ck('ete_cia_activa'); out.civChk = ck('ete_civ_activa');
  out.abajoChk = ck('ete_shunt_incluir_chk');
  const pane = (id) => { const e = document.getElementById(id);
    return e ? (getComputedStyle(e).display === 'none' ? 'oculto' : 'visible') : 'NO EXISTE' };
  out.paneCia = pane('ete-shunt-pane-cia'); out.paneCiv = pane('ete-shunt-pane-civ');
  const bdg = document.getElementById('ete_shunt_badge');
  out.badge = bdg ? (bdg.hidden ? 'oculta' : 'visible') : 'NO EXISTE';
  /* Que hay en los campos: el denominador de «los datos no se pierden al desmarcar». */
  out.ciaTipo = String((document.getElementById('ete_cia_tipo') || {}).value || '');
  out.ciaMax  = String((document.getElementById('ete_cia_tam_max') || {}).value || '');
  out.civTipo = String((document.getElementById('ete_civ_tipo') || {}).value || '');
  return out;
})()`;

const CLIC = (cual) => `(() => {
  const b = document.getElementById('ete-shunt-tab-' + ${JSON.stringify(cual)});
  if (!b) return 'NO EXISTE';
  b.click();
  return 'ok';
})()`;

const PONER_CIA = `(() => {
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  const r = {};
  r.tipo = S('ete_cia_tipo', 'secundum'); r.max = S('ete_cia_tam_max', '18');
  r.min = S('ete_cia_tam_min', '14');
  /* ⚠️ LOS IDS SON "nombre" y "ci", y hace falta el NOMBRE: guardarInforme tiene una salida
     temprana sin nombre -avisa por toast y hace return sin llamar al callback-, asi que la
     promesa del guardado no resuelve nunca. Es la trampa que el D-11 pago con 27 minutos. */
  r.nom = S('nombre', 'Prueba PANT3'); r.ci = S('ci', '12345678');
  return r;
})()`;

/* El informe y el EN SUMA, para decir si la lesion llego al papel en cada estado. */
const PAPEL = `(() => {
  const out = {};
  try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
  const T = (id) => { const e = document.getElementById(id); return e ? String(e.value || '') : 'NO EXISTE' };
  const inf = T('informe_texto'), suma = T('en_suma');
  out.infLargo = inf.length; out.sumaLargo = suma.length;
  out.infCIA = inf.indexOf('CIA') > -1 ? 1 : 0; out.infCIV = inf.indexOf('CIV') > -1 ? 1 : 0;
  out.sumaCIA = suma.indexOf('CIA') > -1 ? 1 : 0; out.sumaCIV = suma.indexOf('CIV') > -1 ? 1 : 0;
  /* La hoja APARTE de congenitas: los textarea ocultos que el PDF consume. */
  const ta = (k) => { const e = document.getElementById('cc-txt-' + k); return e ? String(e.value || '').length : 'NO EXISTE' };
  out.hojaCIA = ta('cia'); out.hojaCIV = ta('civ');
  /* El parrafo entero de la CIA, para el ejemplo del reporte. */
  const li = inf.split('\\n').filter(l => l.indexOf('CIA') === 0 || l.indexOf('CIV') === 0);
  out.lineas = li.map(l => l.slice(0, 150));
  const ls = suma.split('\\n').filter(l => l.indexOf('CIA') > -1 || l.indexOf('CIV') > -1);
  out.sumaLineas = ls.map(l => l.slice(0, 150));
  return out;
})()`;

/* El censo de campos guardados, con el MISMO criterio que guardarInforme. */
const CENSO = `(() => {
  const campos = {};
  document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
    if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
    campos[e.id] = 1;
  });
  const chk = [];
  document.querySelectorAll('input[type=checkbox][id]').forEach(e => {
    if (typeof _noEsDelEstudio === 'function' && _noEsDelEstudio(e.id)) return;
    chk.push(e.id);
  });
  return { n: Object.keys(campos).length, claves: Object.keys(campos).sort().join(','),
           nuevosCand: chk.filter(id => id === 'ete_cia_activa' || id === 'ete_civ_activa') };
})()`;

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE };
try {
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([e.message.slice(0, 150)]) });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
  await pg.waitForTimeout(1500);

  OUT.censo = await pg.evaluate(CENSO);
  OUT.abrir = await pg.evaluate(ABRIR);
  await pg.waitForTimeout(300);

  /* ── A · el estado al nacer ── */
  OUT.A_nace = await pg.evaluate(LEER);

  /* ── B · cargar la CIA y mirar el papel SIN marcar nada (regla v) ── */
  OUT.B_poner = await pg.evaluate(PONER_CIA);
  await pg.waitForTimeout(500);
  OUT.B_papel = await pg.evaluate(PAPEL);
  OUT.B_bot = await pg.evaluate(LEER);

  /* ── C · un clic en CIA: pintado entero y la lesion al papel, SIN la casilla de abajo ── */
  OUT.C_clic = await pg.evaluate(CLIC('cia'));
  await pg.waitForTimeout(400);
  OUT.C_bot = await pg.evaluate(LEER);
  OUT.C_papel = await pg.evaluate(PAPEL);

  /* ── D · cambiar de pestania y volver: la marca NO se pierde (el defecto reportado) ── */
  await pg.evaluate(`(() => { try { showTab('doppler') } catch (e) {} return 1 })()`);
  await pg.waitForTimeout(300);
  await pg.evaluate(ABRIR);
  await pg.waitForTimeout(400);
  OUT.D_vuelta = await pg.evaluate(LEER);

  /* ── E · segundo clic en CIA: se desmarca, los datos NO se pierden y el panel se queda ── */
  OUT.E_clic = await pg.evaluate(CLIC('cia'));
  await pg.waitForTimeout(400);
  OUT.E_bot = await pg.evaluate(LEER);
  OUT.E_papel = await pg.evaluate(PAPEL);

  /* ── F · guardar y reabrir: la marca viaja con el estudio ── */
  OUT.F_clic = await pg.evaluate(CLIC('cia'));
  await pg.waitForTimeout(300);
  OUT.F_guardar = await pg.evaluate(`(async () => {
    const r = { marcaAntes: (document.getElementById('ete_cia_activa') || {}).checked ? 1 : 0 };
    /* ⚠️ GUARDAR TIENE UNA SEGUNDA PUERTA, Y SIN ELLA EL CALLBACK NO LLEGA NUNCA:
       guardarInforme abre la tarjeta de confirmacion de severidades valvulares y hace
       return false; el guardado real ocurre al confirmarla. Sin esto la promesa se consumia
       entera y nGuardados salia 0 sobre un arbol que si guarda. Es la hermana de la salida
       temprana por el nombre. */
    try { window.valvSevConfirmada = true } catch (e) { r.err0 = String(e).slice(0, 80) }
    try {
      await new Promise((res) => { let listo = 0;
        const t = setTimeout(() => { if (!listo) res() }, 6000);
        /* ⚠️ GUARDAR TIENE UNA SEGUNDA PUERTA, Y SIN ELLA EL CALLBACK NO LLEGA NUNCA:
           guardarInforme abre la tarjeta de confirmacion de severidades valvulares y hace
           return false; el guardado real ocurre al CONFIRMARLA. Medido: nGuardados salia 0
           sobre un arbol que si guarda, y el valor de retorno era false.
           ⚠️ Y LA BANDERA NO SE PUEDE PONER DESDE AFUERA: es un "let" de modulo, asi que
           asignarla en window crea otra cosa y la puerta sigue cerrada. Lo que funciona es
           clickear el boton real de la tarjeta, que es ademas el gesto del medico. */
        try { r.ret = guardarInforme(() => { listo = 1; clearTimeout(t); res() });
          setTimeout(() => { const c = document.getElementById('rev-confirm');
            r.tarjeta = c ? 'presente' : 'ausente'; if (c) c.click() }, 350); }
        catch (e) { r.err = String(e).slice(0, 120); clearTimeout(t); res() } });
    } catch (e) { r.err2 = String(e).slice(0, 120) }
    try {
      const l = (typeof getInformes === 'function') ? getInformes() : [];
      r.nGuardados = l.length;
      const u = l[l.length - 1];
      r.claveCia = u && u.campos ? u.campos['ete_cia_activa__chk'] : 'SIN CLAVE';
      r.claveCiv = u && u.campos ? u.campos['ete_civ_activa__chk'] : 'SIN CLAVE';
      r.id = u ? u.id : null;
    } catch (e) { r.err3 = String(e).slice(0, 120) }
    return r;
  })()`);
  await pg.waitForTimeout(400);
  OUT.F_reabrir = await pg.evaluate(`(() => {
    try { if (OUTID !== null && typeof editarInforme === 'function') editarInforme(OUTID) } catch (e) {}
    return 1;
  })()`.replace('OUTID', JSON.stringify(OUT.F_guardar && OUT.F_guardar.id)));
  await pg.waitForTimeout(900);
  await pg.evaluate(ABRIR);
  await pg.waitForTimeout(400);
  OUT.F_bot = await pg.evaluate(LEER);
  OUT.F_papel = await pg.evaluate(PAPEL);

  /* ── G · la casilla de abajo SUMA la hoja aparte ── */
  OUT.G_abajo = await pg.evaluate(`(() => {
    try { eteInclToggle('ete_shunt_incluir_chk') } catch (e) { return String(e).slice(0,80) }
    return 'ok';
  })()`);
  await pg.waitForTimeout(400);
  OUT.G_bot = await pg.evaluate(LEER);
  OUT.G_papel = await pg.evaluate(PAPEL);

  /* ── H · la CIV: las dos marcadas a la vez ── */
  OUT.H_clic = await pg.evaluate(CLIC('civ'));
  await pg.waitForTimeout(400);
  OUT.H_bot = await pg.evaluate(LEER);

  /* ── I · el alto de la seccion a los cuatro anchos ── */
  OUT.altos = {};
  for (const w of ANCHOS) {
    await pg.setViewportSize({ width: w, height: 900 });
    await pg.waitForTimeout(250);
    /* La pestania y el acordeon se reabren en CADA ancho: los pasos de arriba reabren un estudio
       guardado, que vuelve a la pestania del paciente y cierra los acordeones. Sin esto los
       cuatro anchos daban 0x0 — denominador vacio. */
    await pg.evaluate(ABRIR);
    await pg.waitForTimeout(350);
    OUT.altos[w] = await pg.evaluate(`(() => {
      const s = document.getElementById('sacc-cc-shunt');
      if (!s) return { err: 'NO EXISTE' };
      const r = s.getBoundingClientRect();
      const cu = s.querySelector('.sacc-body');
      const b1 = document.getElementById('ete-shunt-tab-cia');
      const r1 = b1 ? b1.getBoundingClientRect() : null;
      return { h: Math.round(r.height), w: Math.round(r.width),
               cuerpoH: cu ? Math.round(cu.scrollHeight) : 0,
               botW: r1 ? Math.round(r1.width) : 0, botH: r1 ? Math.round(r1.height) : 0,
               scrollX: document.documentElement.scrollWidth > document.documentElement.clientWidth ? 1 : 0 };
    })()`);
  }
  await pg.close();
} catch (e) { OUT._err = String(e).slice(0, 300) }
try { await b.close() } catch (e) {}
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF + ' (' + fs.statSync(OUTF).size + ' bytes)');
