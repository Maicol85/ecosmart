#!/usr/bin/env node
/**
 * _probe_pant26modelo.mjs - PANT-26, commit 3 (D2 y D7).
 * (A) El area contra el modelo en la TAVI, en los CUATRO tramos: dentro de +/-1 DE, entre 1 y 2
 *     DE por debajo, a mas de 2 DE por debajo, y con un modelo SIN desvio (el modo MANUAL, que
 *     es el unico camino sin desvio que hay en PROT_CAT_TAVI: sus 9 modelos y sus 26 celdas de
 *     area traen desvio, medido en el commit 1).
 * (B) La condicion del desajuste: la misma escena con el area DENTRO y FUERA de 1 DE.
 * (C) La aortica QUIRURGICA con el mismo modelo, para confirmar que no cambia salvo esa condicion.
 * (D) Controles: la mitral, la tricuspide y la pulmonar no se mueven; y una TAVI SIN modelo.
 * DENOMINADOR: cada escena declara si el modelo quedo cargado y si el evaluador respondio; las
 * escenas se BUSCAN en el catalogo, no se adivinan de memoria.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const { chromium } = _pw;
const fs = await import('fs');
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const OUTF = arg('--out') || '/tmp/pant26_modelo.json';
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
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return 1 };
  const T = (id) => { const e = document.getElementById(id); return e ? String(e.textContent || '').trim() : null };
  const V = (id) => { const e = document.getElementById(id); return e ? String(e.value || '').trim() : null };
  const out = { denom: {}, tramos: [], desajuste: [], control: {} };
  const abrirValvulas = () => {
    try { const b = Array.from(document.querySelectorAll('.tab-btn')).find(x => /Válvulas/.test(x.textContent || ''));
      if (b) b.click(); else showTab('valvulas') } catch (e) {}
    ['aortica', 'mitral', 'tricuspide', 'pulmonar'].forEach(k => {
      const el = document.getElementById('ete-seccion-valv-' + k);
      try { if (el && getComputedStyle(el).display === 'none') toggleEteSeccion('valv-' + k) } catch (e) {}
    });
  };
  const base = async (sets, peso, talla) => {
    try { limpiarCampos(true) } catch (e) {}
    S('nombre', 'P26MOD'); S('ci', '0026'); S('peso', peso || '70'); S('talla', talla || '170');
    Object.keys(sets).forEach(k => S(k, sets[k]));
    try { valvProtSync() } catch (e) {}
    abrirValvulas(); await esperar(420);
  };
  const cargarModelo = async (pos, nombre, tam) => {
    const P = { pedido: nombre + ' / ' + tam };
    try {
      abrirValvulas(); await esperar(320);
      const btn = document.getElementById('vmod-' + pos + '-btn');
      P.botonConCaja = !!(btn && (btn.offsetWidth || btn.offsetHeight));
      if (btn) btn.click(); else vModAbrir(pos);
      await esperar(150);
      const inp = document.getElementById('vmod-inp');
      if (inp) { inp.value = nombre; inp.dispatchEvent(new Event('input', { bubbles: true })) }
      await esperar(180);
      const ul = document.getElementById('vmod-sug');
      const items = ul ? Array.from(ul.querySelectorAll('button')) : [];
      P.sugerencias = items.length;
      const hit = items.find(x => String(x.textContent || '').indexOf(nombre) > -1) || items[0];
      if (hit) hit.click();
      await esperar(150);
      const sel = document.getElementById('vmod-tam');
      if (sel) { sel.value = tam; sel.dispatchEvent(new Event('change', { bubbles: true })) }
      await esperar(150);
      const el = document.getElementById('vmod-elegir');
      if (el) el.click();
      await esperar(320);
      P.modelo = V(pos + '_prot_modelo'); P.tam = V(pos + '_prot_tam');
      P.quedoCargado = !!(P.modelo && P.tam);
      return P;
    } catch (e) { P.error = String(e.message).slice(0, 120); return P }
  };
  /* el area que la app calcula con un Ø TSVI y dos VTI, para buscar la escena */
  const avaDe = (d, vtiT, vtiA) => Math.PI * Math.pow(d / 20, 2) * vtiT / vtiA;
  const buscar = (ava, zMin, zMax, cual) => {
    try {
      const cat = (cual === 'tavi') ? PROT_CAT_TAVI : PROT_CAT_A4;
      const cols = (cual === 'tavi') ? PROT_CAT_TAVI_COLS : PROT_CAT_A4_COLS;
      const i = cols.indexOf('eoa') + 1;
      for (const m of cat) for (const f of m.s) {
        const c = f[i];
        if (!c || c[0] == null || c[1] == null || !(+c[1] > 0)) continue;
        const z = (ava - c[0]) / c[1];
        if (z >= zMin && z <= zMax) return { modelo: m.n, tam: String(f[0]), ref: c[0], sd: c[1], z: +z.toFixed(2) };
      }
      return null;
    } catch (e) { return null }
  };
  const infAo = () => { generarInforme();
    return { inf: String(V('informe_texto') || '').split('\n').filter(l => /aórtic/i.test(l)).join(' | '),
             suma: String(V('en_suma') || '').split('\n').filter(l => /aórtic|TAVI|PPM/i.test(l)).join(' | ') } };
  const estado = () => { let P = null; try { P = eaProtVeredicto() } catch (e) {}
    return { nivel: P && P.nivel, pIndep: P && P.pIndep, pDep: P && P.pDep,
      eoaEvaluable: P && P.eoaEvaluable, eoaZ: P && P.eoaZ, ppm: P && P.ppm, avai: P && P.avai,
      ppmDentro1DE: P ? P.ppmDentro1DE : null,
      capsula: T('ea-det-sev'), avaCont: V('ava_cont'), avaIdx: T('ava-idx'), dvi: T('dvi-val') } };

  /* ══ (A) LOS TRAMOS DEL AREA, en TAVI ═══════════════════════════════════════════════
     ⚠️ LOS INSUMOS VAN DENTRO DE SU BANDA DE PLAUSIBILIDAD, y la primera corrida de esta sonda
     lo pago: con VTI TSVI 80 cm la app marcaba «revisar la unidad» y el DVI y la AEO indexada
     salian vacios, asi que las escenas del desajuste median sobre un denominador vacio -ppm
     null- y se leian igual que «el desajuste no se publica».
     Los dos juegos: DVI 0,45 (normal) con VTI 27/60, y el Ø del TSVI decide el area.
       d = 20 mm -> AVA 1,41 cm2   ·  d = 16 mm -> AVA 0,90 cm2
     Con 70 kg y 1,70 m (BSA ~1,81, IMC 24) la indexada de 1,41 cae en desajuste MODERADO. */
  const SETS_N = { va_morf: 'TAVI', vmax_ao: '2.0', gmedio_ao: '12',
                   diam_tsvi: '20', itv_tsvi: '27', itv_ao: '60' };
  const SETS_CH = { va_morf: 'TAVI', vmax_ao: '2.0', gmedio_ao: '12',
                    diam_tsvi: '16', itv_tsvi: '27', itv_ao: '60' };
  const AVA_N = avaDe(20, 27, 60), AVA_CH = avaDe(16, 27, 60);
  out.denom.avaGrande = +AVA_N.toFixed(3); out.denom.avaChica = +AVA_CH.toFixed(3);
  const tN = buscar(AVA_N, -0.9, 0.9, 'tavi');
  const tP = buscar(AVA_N, -1.9, -1.05, 'tavi');
  const tS = buscar(AVA_CH, -99, -2.05, 'tavi');
  out.denom.modelos = { dentro: tN, entre1y2: tP, masDe2: tS };
  const correrTramo = async (nom, M, sets, morf) => {
    if (!M) { out.tramos.push({ nombre: nom, SIN_ESCENA: 'el catalogo no tiene un modelo en ese tramo' }); return }
    await base(Object.assign({}, sets, morf ? { va_morf: morf } : {}));
    const carga = await cargarModelo('va', M.modelo, M.tam);
    await esperar(260);
    out.tramos.push({ nombre: nom, modelo: M,
      carga: { quedoCargado: carga.quedoCargado, sug: carga.sugerencias },
      estado: estado(), papel: infAo() });
  };
  await correrTramo('A1 TAVI area dentro de +/-1 DE', tN, SETS_N);
  await correrTramo('A2 TAVI area entre 1 y 2 DE por debajo', tP, SETS_N);
  await correrTramo('A3 TAVI area a mas de 2 DE por debajo', tS, SETS_CH);
  /* A5: la escena AUTORIZADA (c) — los dos ejes dependientes en significativa Y el area a mas
     de 2 DE, que es la unica combinacion que lleva el veredicto a «signif» por el area. */
  await correrTramo('A5 TAVI dep SIGNIF + area a mas de 2 DE',
    tS, { va_morf: 'TAVI', vmax_ao: '4.5', gmedio_ao: '45', diam_tsvi: '16', itv_tsvi: '27', itv_ao: '60' });
  /* A4: el modo MANUAL, que construye sus valores con desvio null */
  await base(SETS_N);
  try { abrirValvulas(); await esperar(300);
    const b = document.getElementById('vmod-va-btn'); if (b) b.click(); await esperar(170);
    const bman = document.getElementById('vmod-bmanual');
    out.denom.hayEnlaceManual = !!bman;
    if (bman) bman.click();
    await esperar(180);
    const dM = document.getElementById('vmod-manual');
    out.denom.manualAbierto = !!(dM && !dM.hidden);
    const pon = (id, v) => { const e = document.getElementById(id); if (!e) return false;
      e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
      e.dispatchEvent(new Event('change', { bubbles: true })); return true };
    out.denom.manualCampos = [pon('vmod-mnom', 'Modelo a mano'), pon('vmod-mtam', '23'),
                              pon('vmod-mgm', '12'), pon('vmod-meoa', '1.6')];
    await esperar(210);
    const el = document.getElementById('vmod-elegir');
    out.denom.manualElegirHabilitado = !!el && !el.disabled;
    if (el) el.click(); await esperar(350);
  } catch (e) { out.denom.manualErr = String(e.message).slice(0, 100) }
  out.tramos.push({ nombre: 'A4 TAVI con modelo MANUAL (sin desvio)',
    campos: { modelo: V('va_prot_modelo'), tam: V('va_prot_tam'),
              gmref: V('va_prot_gmref'), eoaref: V('va_prot_eoaref') },
    estado: estado(), papel: infAo() });

  /* ══ (B) LA CONDICION DEL DESAJUSTE ══════════════════════════════════════════════════ */
  for (const [nom, M] of [['B1 TAVI con desajuste y area DENTRO de 1 DE', tN],
                          ['B2 TAVI con desajuste y area FUERA de 1 DE', tP]]) {
    if (!M) { out.desajuste.push({ nombre: nom, SIN_ESCENA: true }); continue }
    await base(SETS_N);
    const carga = await cargarModelo('va', M.modelo, M.tam);
    await esperar(260);
    const E = estado();
    out.desajuste.push({ nombre: nom, modelo: M, cargaQuedo: carga.quedoCargado,
      avai: E.avai, ppm: E.ppm, nivel: E.nivel, ppmDentro1DE: E.ppmDentro1DE,
      z: E.eoaZ && E.eoaZ.z, filaPantallaPPM: T('ea-prot-ppm'), papel: infAo() });
  }
  /* B3: SIN modelo, el desajuste se publica como siempre */
  await base(SETS_N);
  { const E = estado();
    out.desajuste.push({ nombre: 'B3 TAVI con desajuste y SIN modelo', avai: E.avai, ppm: E.ppm,
      nivel: E.nivel, ppmDentro1DE: E.ppmDentro1DE, eoaEvaluable: E.eoaEvaluable,
      filaPantallaPPM: T('ea-prot-ppm'), papel: infAo() }); }
  /* B4: la QUIRURGICA con desajuste y area FUERA de 1 DE — el mismo cambio, otra via */
  { const qF = buscar(AVA_N, -1.9, -1.05);
    out.denom.modeloQuirFuera = qF;
    if (qF) { await base(Object.assign({}, SETS_N, { va_morf: 'Prótesis mecánica' }));
      const carga = await cargarModelo('va', qF.modelo, qF.tam); await esperar(260);
      const E = estado();
      out.desajuste.push({ nombre: 'B4 quirurgica con desajuste y area FUERA de 1 DE', modelo: qF,
        cargaQuedo: carga.quedoCargado, avai: E.avai, ppm: E.ppm, nivel: E.nivel,
        ppmDentro1DE: E.ppmDentro1DE, z: E.eoaZ && E.eoaZ.z,
        filaPantallaPPM: T('ea-prot-ppm'), papel: infAo() });
    } else out.desajuste.push({ nombre: 'B4 quirurgica con desajuste y area FUERA de 1 DE', SIN_ESCENA: true }); }

  /* ══ (C) LA QUIRURGICA con un modelo de su propio catalogo ═══════════════════════════ */
  const qN = buscar(AVA_N, -0.9, 0.9), qP = buscar(AVA_N, -1.9, -1.05), qS = buscar(AVA_CH, -99, -2.05);
  out.denom.modelosQuirurgicos = { dentro: qN, entre1y2: qP, masDe2: qS };
  for (const [nom, M] of [['C1 quirurgica MEC area dentro de +/-1 DE', qN],
                          ['C2 quirurgica MEC area entre 1 y 2 DE', qP],
                          ['C3 quirurgica MEC area a mas de 2 DE', qS]]) {
    if (!M) { out.tramos.push({ nombre: nom, SIN_ESCENA: true }); continue }
    await base(Object.assign({}, (nom.indexOf('C3') === 0 ? SETS_CH : SETS_N), { va_morf: 'Prótesis mecánica' }));
    const carga = await cargarModelo('va', M.modelo, M.tam);
    await esperar(250);
    out.tramos.push({ nombre: nom, modelo: M, carga: { quedoCargado: carga.quedoCargado },
      estado: estado(), papel: infAo() });
  }

  /* ══ (D) CONTROLES: las otras tres valvulas no se mueven ═════════════════════════════ */
  await base({ vm_morf: 'Prótesis biológica', em_vmax: '2.6', em_gmedio: '14', thp: '240' });
  out.control.mitral = { obstr: T('vm-prot-obstr'), vmax: T('vm-prot-vmax'), gmed: T('vm-prot-gmed'),
    thp: T('vm-prot-thp'), papel: (generarInforme(), String(V('informe_texto') || '').split('\n').filter(l => /mitral/i.test(l)).join(' | ')) };
  await base({ vt_morf: 'Prótesis biológica', et_gmedio: '12', et_thp: '240' });
  out.control.tricuspide = { obstr: T('vt-prot-obstr'), gmed: T('vt-prot-gmed'), thp: T('vt-prot-thp'),
    papel: (generarInforme(), String(V('informe_texto') || '').split('\n').filter(l => /tricúspide|tricuspide/i.test(l)).join(' | ')) };
  await base({ vp_morf: 'Prótesis biológica', vp_tipo_prot: 'bio', vp_vmax: '3.5', ep_gmedio: '25' });
  out.control.pulmonar = { obstr: T('vp-prot-obstr'), vmax: T('vp-prot-vmax'), gmed: T('vp-prot-gmed'),
    papel: (generarInforme(), String(V('informe_texto') || '').split('\n').filter(l => /pulmonar/i.test(l)).join(' | ')) };
  /* control negativo duro: una TAVI SIN modelo no puede tener eoaZ */
  await base({ va_morf: 'TAVI', vmax_ao: '4.5', gmedio_ao: '45', diam_tsvi: '21', itv_tsvi: '50', itv_ao: '100' });
  out.control.taviSinModelo = Object.assign(estado(), { papel: infAo() });
  return out;
});
R.errores = errs;
fs.writeFileSync(OUTF, JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
await br.close(); process.exit(0);
