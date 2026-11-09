#!/usr/bin/env node
/**
 * _probe_pant26esc.mjs - tanda PANT-26. Copia de _probe_audprot_escenas.mjs (AUD-PROT), con escenas nuevas. SOLO LECTURA sobre el proyecto.
 * Nombre propio: verificado con ls, no existia.
 * Carga cada escena con el GESTO REAL -el select de morfologia, los campos tipeados con sus
 * eventos input y change, el boton de estilo del informe- y registra el texto EXACTO de cada
 * superficie: la capsula de pantalla, la seccion de Evidencia de esa protesis, el informe en los
 * TRES estilos, el EN SUMA, y para una escena el viaje de Guardados y la tabla del PDF.
 * DENOMINADOR: cada escena declara si la morfologia quedo puesta y si el evaluador devolvio algo;
 * si no, lo DICE en vez de registrar una cadena vacia como si fuera el texto de la app.
 * NO escribe nada en el proyecto ni toca index.html.
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
const OUTF = arg('--out') || '/tmp/pant26_escenas.json';
const br = await chromium.launch({ channel: 'chrome', headless: true });
const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push('page: ' + String(e).slice(0, 160)));
pg.on('console', m => { if (m.type() === 'error') errs.push('con: ' + m.text().slice(0, 160)) });
await pg.goto('file://' + FILE);
await pg.waitForTimeout(1200);
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
  /* El estilo del informe por su BOTON, que es el gesto del medico; si el boton no esta, por la
     funcion, y la escena lo declara. */
  const estilo = (k) => {
    const b = Array.from(document.querySelectorAll('.estilo-pill'))
      .find(x => x.getAttribute('data-estilo') === k);
    if (b) { b.click(); return 'boton' }
    if (typeof setEstiloInforme === 'function') { setEstiloInforme(k); return 'funcion' }
    return 'NO SE PUDO';
  };
  const informe = () => { generarInforme();
    return { inf: V('informe_texto'), suma: V('en_suma') } };
  /* La seccion de Evidencia de una protesis, por el PREFIJO de su titulo en IND_SECS, que es como
     el propio panel la encuentra. Se llama su fn() directo: lo que se quiere es el texto que esa
     seccion PUBLICA con esta escena, no la geometria del panel. */
  const evid = (pref) => {
    try {
      if (typeof IND_SECS === 'undefined') return 'SIN IND_SECS';
      const S2 = IND_SECS.find(x => String(x.tit || '').indexOf(pref) === 0);
      if (!S2) return 'SIN SECCION ' + pref;
      const h = S2.fn();
      if (h == null) return '(la seccion no se publica: fn() devolvio null)';
      return sinTags(typeof h === 'string' ? h : (h.html || JSON.stringify(h)));
    } catch (e) { return 'ERR ' + String(e.message).slice(0, 80) }
  };
  /* Las filas de pantalla de cada valvula */
  const PANT = {
    va: () => ({ veredicto: T('ea-det-sev'), rotulo: T('ea-det-sev-lbl'),
                 nota: T('ea-det-sev-nota'),
                 gmedio: T('ea-det-gmedio'), dvi: T('ea-det-dvi'),
                 atet: T('ea-det-atet'), atNota: T('ea-det-at-nota'),
                 ppm: T('ea-prot-ppm'), botonModelo: T('vmod-va-btn'), medidoModelo: T('vmod-va-med'),
                 avaCont: V('ava_cont'), avaIdx: T('ava-idx'), dviVal: T('dvi-val') }),
    vm: () => ({ obstr: T('vm-prot-obstr'), vmax: T('vm-prot-vmax'), gmed: T('vm-prot-gmed'),
                 thp: T('vm-prot-thp'), eoa: T('vm-prot-eoa'), dvi: T('vm-prot-dvi'),
                 ppm: T('vm-prot-ppm'), sev: T('em-sev-integrada') }),
    vt: () => ({ obstr: T('vt-prot-obstr'), evmax: T('vt-prot-evmax'), gmed: T('vt-prot-gmed'),
                 thp: T('vt-prot-thp'), aeo: T('vt-prot-aeo'), dvi: T('vt-prot-dvi'),
                 dviCampo: V('vt_dvi') }),
    vp: () => ({ obstr: T('vp-prot-obstr'), vmax: T('vp-prot-vmax'), gmed: T('vp-prot-gmed') })
  };
  const EVAL = {
    va: () => { try { const P = eaProtVeredicto(); if (!P) return null;
                  return { via: P.via, nivel: P.nivel, falta: P.falta, pDep: P.pDep, pIndep: P.pIndep,
                           niveles: P.niveles, ppm: P.ppm, avai: P.avai, eoaEvaluable: P.eoaEvaluable,
                           eoaZ: P.eoaZ, vmax: P.vmax, gmed: P.gmed, dvi: P.dvi, at: P.at, atet: P.atet };
                } catch (e) { return 'ERR ' + e.message } },
    vm: () => { try { const r = vmProtEOA(); return { esProt: r.esProt, obstr: r.obstr, eoa: r.eoa,
                  dvi: r.dvi, gmed: r.gmed, thp: r.thp, vmax: r.vmax, obstrPos: r.obstrPos,
                  ppm: r.ppm, eoaI: r.eoaI, motivo: r.motivo }; } catch (e) { return 'ERR ' + e.message } },
    vt: () => { try { const r = vtProtObstr(); return { esProt: r.esProt, tipo: r.tipo, obstr: r.obstr,
                  pos: r.pos, med: r.med, fuera: r.fuera, vals: r.vals, niv: r.niv,
                  dviMotivo: r.dviMotivo }; } catch (e) { return 'ERR ' + e.message } },
    vp: () => { try { const r = vpProtObstr(); return { esProt: r.esProt, tipo: r.tipo, obstr: r.obstr,
                  motivo: r.motivo, pos: r.pos, med: r.med, vals: r.vals,
                  niv: r.niv }; } catch (e) { return 'ERR ' + e.message } }
  };
  const PREF = { va: 'Prótesis aórtica', vm: 'Prótesis mitral', vt: 'Prótesis tricúspide',
                 vp: 'Prótesis pulmonar' };
  const MORF = { va: 'va_morf', vm: 'vm_morf', vt: 'vt_morf', vp: 'vp_morf' };

  /* Busca, DENTRO del catalogo real, un modelo y tamanio cuya EOA de referencia deje el area
     medida en el tramo pedido. Es el patron de «buscar la escena en vez de adivinarla»: los
     valores del catalogo son datos leidos de la guia y no se pueden elegir de memoria. */
  const buscarModelo = (ava, zMin, zMax, cual) => {
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
    } catch (e) { return 'ERR ' + e.message }
  };
  /* Carga el modelo por la VIA REAL del componente, paso por paso, igual que el medico:
     el boton abre la tarjeta, se escribe el nombre en el buscador, se clickea la sugerencia,
     se elige el tamanio en el select y se aprieta «Elegir». Cada paso se declara en el
     resultado: si uno falla, la escena no miente diciendo que el modelo quedo cargado. */
  const cargarModelo = async (pos, nombre, tam) => {
    const P = { pedido: nombre + ' / ' + tam };
    try {
      const btn = document.getElementById('vmod-' + pos + '-btn');
      P.boton = !!btn;
      if (btn) btn.click(); else if (typeof vModAbrir === 'function') vModAbrir(pos);
      await esperar(120);
      const card = document.getElementById('vmod-card');
      P.cardAbierta = !!card && card.style.display !== 'none';
      const inp = document.getElementById('vmod-inp');
      P.buscador = !!inp;
      if (inp) { inp.value = nombre;
        inp.dispatchEvent(new Event('input', { bubbles: true })); }
      await esperar(150);
      const ul = document.getElementById('vmod-sug');
      const items = ul ? Array.from(ul.querySelectorAll('button')) : [];
      P.sugerencias = items.length;
      const hit = items.find(x => String(x.textContent || '').indexOf(nombre) > -1) || items[0];
      P.sugerenciaElegida = hit ? String(hit.textContent || '').trim().slice(0, 60) : null;
      if (hit) hit.click();
      await esperar(120);
      const sel = document.getElementById('vmod-tam');
      P.opcionesTam = sel ? Array.from(sel.options).map(o => o.value).join('|') : null;
      if (sel) { sel.value = tam;
        sel.dispatchEvent(new Event('change', { bubbles: true })); }
      await esperar(120);
      const el = document.getElementById('vmod-elegir');
      P.botonElegirHabilitado = !!el && !el.disabled;
      if (el) el.click();
      await esperar(200);
      const E = (typeof vModEsperados === 'function') ? vModEsperados(pos) : null;
      P.modeloCampo = V(pos + '_prot_modelo'); P.tamCampo = V(pos + '_prot_tam');
      P.esperados = E ? { manual: !!E.manual, nombre: E.nombre, tam: E.tam, vals: E.vals,
                          folio: E.folio } : null;
      P.quedoCargado = !!(P.modeloCampo && P.tamCampo);
      return P;
    } catch (e) { P.error = String(e.message).slice(0, 100); return P }
  };

  const out = { escenas: [], extras: {} };
  /* ⚠️ LAS SECCIONES DE VALVULAS NACEN CERRADAS, Y SIN ABRIRLAS EL COMPONENTE NO ABRE.
     `vModAbrir` llama a `_vModColocar(btn)`, que se rinde cuando el boton no tiene caja, y
     entonces la tarjeta se cierra sola: la primera corrida de esta sonda midio «sugerencias=0»
     en las cuatro escenas de modelo. Es la leccion que PANT-20 dejo escrita.
     Tambien hay que estar en la pestania Valvulas: `limpiarCampos` vuelve a Paciente. */
  const abrirValvulas = () => {
    const r = { tab: null, secciones: {} };
    try {
      const b = Array.from(document.querySelectorAll('.tabs-tools .tab-btn, .tab-btn'))
        .find(x => /Válvulas/.test(x.textContent || ''));
      if (b) { b.click(); r.tab = 'boton' } else if (typeof showTab === 'function') { showTab('valvulas'); r.tab = 'showTab' }
    } catch (e) { r.tab = 'ERR ' + e.message }
    ['aortica', 'mitral', 'tricuspide', 'pulmonar'].forEach(k => {
      const id = 'ete-seccion-valv-' + k;
      const el = document.getElementById(id);
      if (!el) { r.secciones[k] = 'NO EXISTE'; return }
      try {
        if (el.style.display === 'none' || getComputedStyle(el).display === 'none') {
          /* ⚠️ `toggleEteSeccion` PREFIJA 'ete-seccion-' al id que recibe, asi que hay que
             pasarle la CLAVE corta: con el id completo busca
             'ete-seccion-ete-seccion-valv-aortica' y se va sin abrir nada. */
          if (typeof toggleEteSeccion === 'function') toggleEteSeccion('valv-' + k);
        }
        r.secciones[k] = (getComputedStyle(el).display !== 'none') ? 'abierta' : 'CERRADA';
      } catch (e) { r.secciones[k] = 'ERR ' + String(e.message).slice(0, 40) }
    });
    return r;
  };
  const base = async (sets) => {
    try { limpiarCampos(true) } catch (e) {}
    S('nombre', 'AUDPROT'); S('ci', '0001'); S('peso', '70'); S('talla', '170');
    const puestos = {};
    Object.keys(sets).forEach(k => { puestos[k] = S(k, sets[k]) });
    try { valvProtSync() } catch (e) {}
    puestos.__pantalla = abrirValvulas();
    await esperar(400);
    return puestos;
  };
  const correr = async (nombre, valv, sets, hip, antes) => {
    const puestos = await base(sets);
    let pre = null;
    if (antes) { try { pre = await antes() } catch (e) { pre = 'ERR ' + e.message } }
    await esperar(300);
    const ev = EVAL[valv]();
    const pant = PANT[valv]();
    const e1 = estilo('conciso'); const c = informe();
    estilo('estandar'); const s = informe();
    estilo('narrativo'); const n = informe();
    estilo('estandar');
    const morfPuesta = V(MORF[valv]);
    out.escenas.push({ nombre, valv, sets, puestos, pre, modoEstilo: e1,
      denom: { morfPuesta, evaluadorRespondio: ev !== null && typeof ev !== 'string',
               esProt: ev && ev.esProt !== undefined ? ev.esProt : (ev && ev.via ? true : null) },
      eval: ev, pantalla: pant,
      informe: { conciso: c.inf, estandar: s.inf, narrativo: n.inf },
      suma: { conciso: c.suma, estandar: s.suma, narrativo: n.suma },
      evidencia: evid(PREF[valv]),
      hipotesis: hip,
      hipSeReproduce: /sin datos suficientes/i.test(String(s.inf || '')) });
  };

  /* ══ LAS ESCENAS ════════════════════════════════════════════════════════════════════════ */
  const TAVI = 'TAVI', BIO = 'Prótesis biológica', MEC = 'Prótesis mecánica';
  const HIP = 'el medico espera que el papel diga «sin datos suficientes»';

  /* (1) TAVI sin ningun dato */
  await correr('1 TAVI sin ningun dato', 'va', { va_morf: TAVI }, HIP);
  /* (2) TAVI solo velocidad 4,5 y gradiente medio 45 - EL CASO DEL MEDICO */
  await correr('2 TAVI vmax 4,5 + gmedio 45 (CASO DEL MEDICO)', 'va',
    { va_morf: TAVI, vmax_ao: '4.5', gmedio_ao: '45' }, HIP);
  /* (3) la misma con DVI normal: VTI TSVI 50 / VTI aortico 100 = 0,50 */
  await correr('3 TAVI vmax 4,5 + gmedio 45 + DVI normal 0,50', 'va',
    { va_morf: TAVI, vmax_ao: '4.5', gmedio_ao: '45', diam_tsvi: '21', itv_tsvi: '50', itv_ao: '100' }, HIP);
  /* (4) la misma con DVI bajo: 20/100 = 0,20 */
  await correr('4 TAVI vmax 4,5 + gmedio 45 + DVI bajo 0,20', 'va',
    { va_morf: TAVI, vmax_ao: '4.5', gmedio_ao: '45', diam_tsvi: '21', itv_tsvi: '20', itv_ao: '100' }, HIP);
  /* (5) y (6) TAVI con modelo cargado. El area se busca en el catalogo. */
  const mNorm = buscarModelo(1.80, -0.9, 0.9), mBajo = buscarModelo(0.80, -99, -2.0);
  /* ⚠️ CON TAVI EL CATALOGO ES OTRO: `vModCatalogo` elige `PROT_CAT_TAVI` por la morfologia, asi
     que un modelo de la A4 no aparece en el buscador. La primera corrida lo midio —«sugerencias:
     0»— en vez de registrar una escena sin modelo como si lo tuviera. */
  const tNorm = buscarModelo(1.80, -0.9, 0.9, 'tavi'), tBajo = buscarModelo(0.80, -99, -2.0, 'tavi');
  out.extras.modeloBuscado = { normal: mNorm, bajo: mBajo, taviNormal: tNorm, taviBajo: tBajo };
  await correr('5 TAVI con modelo cargado y area efectiva NORMAL', 'va',
    { va_morf: TAVI, vmax_ao: '4.5', gmedio_ao: '45', diam_tsvi: '21', itv_tsvi: '52', itv_ao: '100' }, HIP,
    async () => cargarModelo('va', tNorm ? tNorm.modelo : 'SAPIEN 3', tNorm ? tNorm.tam : '23'));
  await correr('6 TAVI con modelo cargado y area efectiva MUY POR DEBAJO', 'va',
    { va_morf: TAVI, vmax_ao: '4.5', gmedio_ao: '45', diam_tsvi: '16', itv_tsvi: '40', itv_ao: '100' }, HIP,
    async () => cargarModelo('va', tBajo ? tBajo.modelo : 'SAPIEN 3', tBajo ? tBajo.tam : '23'));
  /* (7) TAVI con desajuste paciente-protesis: AVA 0,80 cm2 con BSA ~1,81 da indexada ~0,44 */
  await correr('7 TAVI con desajuste paciente-protesis (AEO indexada baja)', 'va',
    { va_morf: TAVI, vmax_ao: '2.0', gmedio_ao: '12', diam_tsvi: '16', itv_tsvi: '40', itv_ao: '100' }, HIP);
  /* (8) TAVI con regurgitacion paravalvular por el modulo TAVI */
  await correr('8 TAVI con regurgitacion paravalvular (modulo TAVI)', 'va',
    { va_morf: TAVI, ete_tavi_ext_circ: '20', ete_tavi_vc_ancho: '4' }, HIP);
  /* (9) y (10) aortica quirurgica, solo velocidad y gradiente */
  await correr('9 aortica quirurgica BIOLOGICA solo vmax 4,5 + gmedio 45', 'va',
    { va_morf: BIO, vmax_ao: '4.5', gmedio_ao: '45' }, HIP);
  await correr('10 aortica quirurgica MECANICA solo vmax 4,5 + gmedio 45', 'va',
    { va_morf: MEC, vmax_ao: '4.5', gmedio_ao: '45' }, HIP);
  /* (11) la misma con DVI */
  await correr('11 aortica quirurgica BIOLOGICA con vmax, gmedio y DVI 0,20', 'va',
    { va_morf: BIO, vmax_ao: '4.5', gmedio_ao: '45', diam_tsvi: '21', itv_tsvi: '20', itv_ao: '100' }, HIP);
  /* (12) con modelo y area efectiva por debajo, SIN que el DVI vote significativa */
  await correr('12 aortica quirurgica con MODELO y area efectiva 2 DE por debajo', 'va',
    { va_morf: MEC, vmax_ao: '4.5', gmedio_ao: '45', diam_tsvi: '16', itv_tsvi: '40', itv_ao: '100' }, HIP,
    async () => cargarModelo('va', mBajo ? mBajo.modelo : 'St. Jude Medical Standard', mBajo ? mBajo.tam : '23'));
  /* (13) a (15) MITRAL */
  await correr('13 mitral BIOLOGICA solo velocidad pico de E y gradiente medio', 'vm',
    { vm_morf: BIO, em_vmax: '2.6', em_gmedio: '14' }, HIP);
  await correr('14 mitral BIOLOGICA con velocidad, gradiente y THP', 'vm',
    { vm_morf: BIO, em_vmax: '2.6', em_gmedio: '14', thp: '240' }, HIP);
  await correr('15 mitral BIOLOGICA con MODELO cargado', 'vm',
    { vm_morf: BIO, em_vmax: '2.6', em_gmedio: '14', thp: '240' }, HIP,
    async () => cargarModelo('vm', 'Medtronic Mosaic', '27'));
  /* (16) y (17) TRICUSPIDE */
  await correr('16 tricuspide BIOLOGICA solo gradiente medio 12', 'vt',
    { vt_morf: BIO, et_gmedio: '12' }, HIP);
  await correr('17 tricuspide BIOLOGICA con gradiente y THP 240', 'vt',
    { vt_morf: BIO, et_gmedio: '12', et_thp: '240' }, HIP);
  /* (18) PULMONAR */
  await correr('18 pulmonar BIOPROTESIS con velocidad 3,5 y gradiente medio 25', 'vp',
    { vp_morf: BIO, vp_tipo_prot: 'bio', vp_vmax: '3.5', ep_gmedio: '25' }, HIP);
  /* (19) a (22) TODOS LOS DATOS NORMALES, una por valvula */
  await correr('19 aortica TAVI con TODOS los datos normales', 'va',
    { va_morf: TAVI, vmax_ao: '2.0', gmedio_ao: '12', diam_tsvi: '21', itv_tsvi: '50', itv_ao: '100',
      va_at: '60', tango_te: '300' }, HIP);
  await correr('19b aortica quirurgica BIOLOGICA con TODOS los datos normales', 'va',
    { va_morf: BIO, vmax_ao: '2.0', gmedio_ao: '12', diam_tsvi: '21', itv_tsvi: '50', itv_ao: '100',
      va_at: '60', tango_te: '300' }, HIP);
  await correr('20 mitral BIOLOGICA con TODOS los datos normales', 'vm',
    { vm_morf: BIO, em_vmax: '1.5', em_gmedio: '3', thp: '100',
      em_dtsvi: '21', em_vtitsvi: '50', em_vtimit: '55' }, HIP);
  await correr('21 tricuspide BIOLOGICA con TODOS los datos normales', 'vt',
    { vt_morf: BIO, et_gmedio: '3', et_thp: '120', et_e_vmax: '90', et_vti_diast: '30',
      itv_tsvi: '50', tsvd_diametro: '25', vti_tsvd: '18' }, HIP);
  await correr('22 pulmonar BIOPROTESIS con TODOS los datos normales', 'vp',
    { vp_morf: BIO, vp_tipo_prot: 'bio', vp_vmax: '2.0', ep_gmedio: '8' }, HIP);
  /* (23) los TRES estados pulmonares que no graduan */
  await correr('23a pulmonar MECANICA (no gradua)', 'vp',
    { vp_morf: MEC, vp_vmax: '3.5', ep_gmedio: '25' }, HIP);
  await correr('23b pulmonar PERCUTANEA (no gradua)', 'vp',
    { vp_morf: BIO, vp_tipo_prot: 'perc', vp_vmax: '3.5', ep_gmedio: '25' }, HIP);
  await correr('23c pulmonar SIN TIPO elegido (no gradua)', 'vp',
    { vp_morf: BIO, vp_vmax: '3.5', ep_gmedio: '25' }, HIP);

  /* ══ EXTRAS ═══════════════════════════════════════════════════════════════════════════════ */
  /* (X1) LA TAVI CON DESAJUSTE Y SIN NINGUN DATO DE ESTENOSIS: el camino de normofuncionante */
  await base({ va_morf: TAVI, diam_tsvi: '16', itv_tsvi: '40', itv_ao: '100' });
  await esperar(300);
  {
    const P = (function(){ try { return eaProtVeredicto() } catch (e) { return null } })();
    const N = (function(){ try { return eaProtNarrativa(P) } catch (e) { return null } })();
    estilo('narrativo'); const r = informe(); estilo('estandar');
    out.extras.taviDesajusteNormo = { nivel: P && P.nivel, niveles: P && P.niveles, ppm: P && P.ppm,
      avai: P && P.avai, normoTavi: N && N.normoTavi, normoFrase: N && N.normoFrase,
      inf: r.inf, suma: r.suma };
  }
  /* (X4) LA CAPSULA DE PANTALLA DESPUES DE CARGAR EL MODELO. La escena 12 midio el informe
     diciendo «significativa» con la capsula diciendo «Posible» y su salvedad diciendo que no hay
     modelo cargado. Se mide aparte, con su control: si al tocar DESPUES un campo la capsula se
     pone de acuerdo, lo que falta es un repintado y no un criterio. */
  try {
    await base({ va_morf: MEC, vmax_ao: '4.5', gmedio_ao: '45', diam_tsvi: '16',
                 itv_tsvi: '40', itv_ao: '100' });
    await esperar(300);
    const antesModelo = { capsula: T('ea-det-sev'), nota: T('ea-det-sev-nota'),
      nivel: (function(){ try { return eaProtVeredicto().nivel } catch (e) { return 'ERR' } })() };
    const carga = await cargarModelo('va', mBajo ? mBajo.modelo : 'Abbott Epic', mBajo ? mBajo.tam : '27');
    await esperar(400);
    const trasModelo = { capsula: T('ea-det-sev'), nota: T('ea-det-sev-nota'),
      nivel: (function(){ try { return eaProtVeredicto().nivel } catch (e) { return 'ERR' } })() };
    estilo('estandar'); const r1 = informe();
    /* el gesto que REPINTA: el medico vuelve a tocar un campo */
    S('vmax_ao', '4.5'); await esperar(400);
    const trasTocar = { capsula: T('ea-det-sev'), nota: T('ea-det-sev-nota'),
      nivel: (function(){ try { return eaProtVeredicto().nivel } catch (e) { return 'ERR' } })() };
    const r2 = informe();
    /* ¿el painter no se llama, o se llama y sale temprano? Se distingue llamandolo a mano. */
    const caja = document.getElementById('caja-esten-aortica');
    const cajaVis = caja ? (getComputedStyle(caja).display !== 'none') : null;
    try { if (typeof calcEADetalle === 'function') calcEADetalle() } catch (e) {}
    await esperar(200);
    const trasLlamarPintor = { capsula: T('ea-det-sev'),
      nivel: (function(){ try { return eaProtVeredicto().nivel } catch (e) { return 'ERR' } })() };
    out.extras.capsulaTrasModelo = { cajaVisible: cajaVis, trasLlamarPintor,
      antesModelo, carga: { quedoCargado: carga.quedoCargado,
      modelo: carga.modeloCampo, tam: carga.tamCampo }, trasModelo, trasTocar,
      infTrasModelo: r1.inf.split('\n').filter(l => /aórtic/i.test(l)).join(' | '),
      infTrasTocar: r2.inf.split('\n').filter(l => /aórtic/i.test(l)).join(' | '),
      existeVModTrasElegir: (typeof vModTrasElegir === 'function') };
  } catch (e) { out.extras.capsulaTrasModelo = 'ERR ' + String(e.message).slice(0, 120) }
  /* (X5) EL SEGUNDO CAMINO al «normofuncionante» con desajuste: el area efectiva TIPEADA.
     `ava_cont` es un campo de texto, asi que puede traer un valor sin que existan los dos VTI;
     entonces hay AEO indexada -y PPM- sin DVI, el eje independiente queda vacio y el nivel
     vuelve a ser «faltan» con los dos ejes dependientes NORMALES. Se mide, no se deduce. */
  try {
    await base({ va_morf: TAVI, vmax_ao: '2.0', gmedio_ao: '12', ava_cont: '0.80' });
    await esperar(400);
    const P = (function(){ try { return eaProtVeredicto() } catch (e) { return null } })();
    const N = (function(){ try { return eaProtNarrativa(P) } catch (e) { return null } })();
    estilo('narrativo'); const r = informe(); estilo('estandar');
    out.extras.taviAreaTipeada = { avaCont: V('ava_cont'), avaIdx: T('ava-idx'), dviVal: T('dvi-val'),
      nivel: P && P.nivel, niveles: P && P.niveles, ppm: P && P.ppm, avai: P && P.avai,
      normoTavi: N && N.normoTavi,
      inf: r.inf.split('\n').filter(l => /aórtic/i.test(l)).join(' | '), suma: r.suma };
  } catch (e) { out.extras.taviAreaTipeada = 'ERR ' + String(e.message).slice(0, 120) }
  /* (X6) CENSO de lo que la linea de debajo del dibujo 3D de congenitas puede escribir. */
  try {
    const secs = (typeof _CC_SECS !== 'undefined') ? _CC_SECS.map(x => ({ k: x.k, lbl: x.lbl })) : null;
    const dib = (typeof CC3D_DIBUJA !== 'undefined') ? CC3D_DIBUJA.slice() : null;
    const prop = (typeof CC3D_PROPIO !== 'undefined') ? CC3D_PROPIO.slice() : null;
    const posiblesFalta = (secs && dib && prop)
      ? secs.filter(x => dib.indexOf(x.k) < 0 && prop.indexOf(x.k) < 0).map(x => x.lbl) : null;
    out.extras.cc3d = { secs, dib, prop, posiblesFalta,
      nSecs: secs ? secs.length : -1,
      globo: (typeof VINFO !== 'undefined' && VINFO['cc-3d']) ? VINFO['cc-3d'] : 'SIN ENTRADA cc-3d' };
  } catch (e) { out.extras.cc3d = 'ERR ' + String(e.message).slice(0, 120) }
  /* (X2) CONTROL NEGATIVO: valvula aortica NATIVA con los mismos numeros */
  await base({ va_morf: 'Trivalva normal', vmax_ao: '4.5', gmedio_ao: '45' });
  await esperar(300);
  { const r = informe();
    out.extras.controlNegativoNativa = { veredictoProt: (function(){ try { return eaProtVeredicto() } catch (e) { return 'ERR' } })(),
      inf: r.inf, suma: r.suma }; }
  /* (X3) GUARDADOS: el viaje completo de la escena del medico */
  try {
    await base({ va_morf: TAVI, vmax_ao: '4.5', gmedio_ao: '45' });
    await esperar(300);
    window._ettEditandoId = null;
    const antes = new Set(getInformes().map(i => i.estudioId));
    const g = await new Promise((res) => {
      try { guardarInforme(function (ok) {
        const nuevo = getInformes().find(i => !antes.has(i.estudioId));
        res({ ok: ok === true, estudioId: nuevo ? nuevo.estudioId : null });
      }) } catch (e) { res({ ok: false, error: String(e.message) }); return }
      const cf = document.getElementById('rev-confirm'); if (cf) cf.click();
    });
    let reab = null;
    if (g.estudioId) {
      limpiarCampos(true); await esperar(200);
      cargarEstudioPorId(g.estudioId); await esperar(600);
      estilo('estandar'); const r = informe();
      reab = { morf: V('va_morf'), vmax: V('vmax_ao'), gmedio: V('gmedio_ao'),
               nivel: (function(){ try { return eaProtVeredicto().nivel } catch (e) { return 'ERR' } })(),
               inf: r.inf, suma: r.suma };
      await CeiboStore.setLocal(getInformes().filter(i => i.estudioId !== g.estudioId));
    }
    out.extras.guardados = { guardado: g, reabierto: reab };
  } catch (e) { out.extras.guardados = 'ERR ' + String(e.message).slice(0, 120) }
  return out;
});
R.errores = errs;
fs.writeFileSync(OUTF, JSON.stringify(R, null, 1));
const corta = (s, n) => s == null ? '(null)' : String(s).replace(/\s+/g, ' ').slice(0, n || 400);
R.escenas.forEach(function (E) {
  console.log('\n######## ' + E.nombre + '  [' + E.valv + ']');
  console.log('  DENOM morf=«' + E.denom.morfPuesta + '» evaluadorRespondio=' + E.denom.evaluadorRespondio +
    '  sets=' + JSON.stringify(E.sets));
  if (E.pre) console.log('  PRE ' + JSON.stringify(E.pre));
  console.log('  EVAL ' + corta(JSON.stringify(E.eval), 700));
  console.log('  PANTALLA ' + corta(JSON.stringify(E.pantalla), 700));
  console.log('  INF-conciso   ' + corta(E.informe.conciso, 500));
  console.log('  INF-estandar  ' + corta(E.informe.estandar, 500));
  console.log('  INF-narrativo ' + corta(E.informe.narrativo, 500));
  console.log('  EN SUMA       ' + corta(E.suma.estandar, 400));
  console.log('  HIPOTESIS «sin datos suficientes» en el informe: ' + (E.hipSeReproduce ? 'SI' : 'NO'));
});
console.log('\n######## EXTRAS');
console.log('modeloBuscado ' + JSON.stringify(R.extras.modeloBuscado));
console.log('taviDesajusteNormo ' + corta(JSON.stringify(R.extras.taviDesajusteNormo), 1400));
console.log('controlNegativoNativa inf=' + corta(R.extras.controlNegativoNativa && R.extras.controlNegativoNativa.inf, 400));
console.log('guardados ' + corta(JSON.stringify(R.extras.guardados), 1000));
console.log('\nERRORES ' + errs.length);
errs.slice(0, 8).forEach(e => console.log('  ' + e));
await pg.close(); await br.close();
process.exit(0);
