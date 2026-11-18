/* _probe_3a_cuerpo.js — el cuerpo de la sonda de la tanda 3A (2026-11-17).
 * Vive en su propio archivo a proposito: asi los acentos graves son codigo y no hay que contarlos
 * antes de insertar nada. Es la leccion que MEDIR-4b dejo escrita.
 * Recibe el tema para poder DEVOLVERLO: el tema de esta app no es `prefers-color-scheme`, es la
 * clase `light-mode` que pone `loadTheme()` leyendo `localStorage.ett_theme`. */
function (tema) {
  var O = { tema_pedido: tema };
  try { localStorage.setItem('ett_theme', tema === 'dia' ? 'light' : 'dark'); } catch (e) {}
  try { if (typeof loadTheme === 'function') loadTheme(); } catch (e) {}
  O.tema_real = document.documentElement.classList.contains('light-mode') ||
                document.body.classList.contains('light-mode') ? 'dia' : 'noche';

  function set(id, val) {
    var el = document.getElementById(id);
    if (!el) return false;
    el.value = String(val);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  }
  function txt(id) { var e = document.getElementById(id); return e ? (e.textContent || '').trim() : null; }
  function alto(id) { var e = document.getElementById(id); if (!e) return null;
    var r = e.getBoundingClientRect(); return Math.round(r.height); }

  /* ── 1 · EL STRAIN DEL VD: LOS CUATRO TRAMOS ──────────────────────────────────── */
  O.strain = { cortes: {}, pantalla: {}, duenos: {} };
  try {
    O.strain.duenos = { normal: VD_STRAIN_PL_NORMAL, leve: VD_STRAIN_PL_LEVE, mod: VD_STRAIN_PL_MOD,
                        deformacion: VD_STRAIN_NORMAL };
  } catch (e) { O.strain.duenos = { error: String(e) }; }
  [-25, -20.5, -20, -18, -15, -14.9, -11, -10.9, -9, 25, 9].forEach(function (x) {
    try { O.strain.cortes[String(x)] = vdStrainPlCat(x); } catch (e) { O.strain.cortes[String(x)] = 'ERR'; }
  });
  /* El texto de la fila del cuadro de referencias, por tramo, tal como lo ve el medico. */
  [-25, -18, -13, -9].forEach(function (x) {
    set('vd_strain_pl', x);
    try { vdStrainPlSync(); } catch (e) {}
    O.strain.pantalla[String(x)] = txt('vd-strain-interp');
  });
  /* ⚠️ EL CASO QUE LA ORDEN VIENE A CERRAR: TAPSE normal y strain severo. Antes de 3A el informe
     decia «disfuncion sistolica» a secas. */
  O.strain.informe = {};
  set('tapse', 22); set('s_prime', 13);
  [-18, -13, -9].forEach(function (x) {
    set('vd_strain_pl', x);
    try { if (typeof calcVD === 'function') calcVD(); } catch (e) {}
    var r = null;
    try { r = (typeof generarInforme === 'function') ? null : null; } catch (e) {}
    O.strain.informe[String(x)] = { grado_pantalla: txt('vd-strain-interp') };
  });
  /* El grado que el informe publicaria: se le pregunta al dueno, que es lo que el emisor usa. */
  O.strain.grado_por_tramo = {};
  [-18, -13, -9].forEach(function (x) {
    try { O.strain.grado_por_tramo[String(x)] = VD_STRAIN_PL_TXT[vdStrainPlCat(x)] || null; }
    catch (e) { O.strain.grado_por_tramo[String(x)] = 'ERR'; }
  });
  try { O.strain.vota = { m18: vdStrainPlCat(-18) !== 'normal', m9: vdStrainPlCat(-9) !== 'normal',
                          m25: vdStrainPlCat(-25) !== 'normal' }; } catch (e) {}
  set('vd_strain_pl', '');

  /* ── 2 · LOS CUATRO GLOBOS NUEVOS ─────────────────────────────────────────────── */
  O.globos = {};
  try {
    O.globos.n_total = Object.keys(VINFO).length;
    ['prot-gmed', 'tavi-pvl-ext', 'otr-cortri', 'diast-valsalva', 'vd-strain-pl'].forEach(function (k) {
      var g = VINFO[k];
      if (!g) { O.globos[k] = 'FALTA'; return; }
      var cuerpo = [g.tit, g.lee, g.fuente, g.ojo].filter(Boolean).join(' | ');
      O.globos[k] = { chars: cuerpo.length, tit: g.tit || null };
      O.globos[k].marcas = {
        sens90: cuerpo.indexOf('90 %') >= 0, esp70: cuerpo.indexOf('70 %') >= 0,
        tabla12: cuerpo.indexOf('Tabla 12') >= 0, varc: cuerpo.indexOf('VARC-3') >= 0,
        cinco: cuerpo.indexOf('CINCO') >= 0, mukherjee: cuerpo.indexOf('Mukherjee') >= 0,
        nagueh: cuerpo.indexOf('Nagueh') >= 0, robinson: cuerpo.indexOf('Robinson') >= 0,
        gurvitz: cuerpo.indexOf('Gurvitz') >= 0, puchalski: cuerpo.indexOf('Puchalski') >= 0,
        umbral_propuesto: cuerpo.indexOf('PROPUESTO PREVIAMENTE') >= 0,
        sin_tipos: cuerpo.indexOf('por tipos') >= 0,
        sexo: cuerpo.indexOf('no separa por sexo') >= 0
      };
    });
    /* Los nombres que la orden prohibe citar, en TODO el registro de globos. */
    var todo = JSON.stringify(VINFO);
    O.globos.prohibidos = ['Lucas', 'Loeffler', 'Marín-García', 'Marin-Garcia', 'Niwayama', 'Thilenius']
      .filter(function (n) { return todo.indexOf(n) >= 0; });
  } catch (e) { O.globos.error = String(e); }
  /* Los botones en el marcado, con su area tactil. */
  O.botones = {};
  ['vd-strain-pl', 'tavi-pvl-ext', 'otr-cortri', 'diast-valsalva'].forEach(function (k) {
    var b = document.querySelector('[data-vinfo="' + k + '"]');
    if (!b) { O.botones[k] = 'FALTA'; return; }
    var r = b.getBoundingClientRect();
    O.botones[k] = { w: Math.round(r.width), h: Math.round(r.height), visible: r.width > 0 && r.height > 0 };
  });
  /* ⚠️ EL GLOBO DEL COR TRIATRIATUM NO PUEDE MARCAR SU PROPIA CASILLA: el boton va FUERA del
     label. Se prueba apretandolo y mirando la casilla. */
  try {
    var ck = document.getElementById('otr_var_cortri');
    var b2 = document.querySelector('[data-vinfo="otr-cortri"]');
    if (ck && b2) {
      ck.checked = false;
      b2.click();
      O.botones.cortri_no_marca = (ck.checked === false);
      var ov = document.getElementById('vinfo-card') || document.getElementById('vinfo-ov');
      O.botones.cortri_abre = !!ov;
    }
  } catch (e) { O.botones.cortri_err = String(e); }

  /* ── 3 · EL HCM: LAS DOS CASILLAS Y LA SALVEDAD ───────────────────────────────── */
  O.hcm = {};
  try {
    O.hcm.hay_miectomia = !!document.getElementById('mch_ex_reduccion');
    O.hcm.hay_alcohol   = !!document.getElementById('mch_ex_alcohol');
    var lbl = function (id) { var e = document.getElementById(id);
      var p = e && e.closest('.fg'); var l = p && p.querySelector('label');
      return l ? (l.textContent || '').trim() : null; };
    O.hcm.rotulos = { miectomia: lbl('mch_ex_reduccion'), alcohol: lbl('mch_ex_alcohol') };
    /* La alcoholizacion NO apaga el score y NO entra en las listas de exclusion. */
    set('mch_ex_alcohol', 'si'); set('mch_ex_reduccion', 'no');
    var ex1 = mchExclusiones();
    O.hcm.con_alcohol = { activas: ex1.activas.slice(), pendientes: ex1.pendientes.slice(),
                          nota: _mchAlcoholNota() };
    /* La miectomia SI la apaga. */
    set('mch_ex_reduccion', 'si');
    var ex2 = mchExclusiones();
    O.hcm.con_miectomia = { activas: ex2.activas.slice(), nota: _mchAlcoholNota() };
    set('mch_ex_reduccion', 'no'); set('mch_ex_alcohol', '');
    O.hcm.sin_alcohol_nota = _mchAlcoholNota();
  } catch (e) { O.hcm.error = String(e); }

  /* ── 4 · LA MATRIZ DE LA DIASTOLICA ───────────────────────────────────────────── */
  O.diast = {};
  function escena(n) {
    /* Los insumos de los tres algoritmos, en una sola funcion. */
    set('peso', 70); set('talla', 170);
    if (n === 'g3')     { set('e_sep', 5);  set('e_lat', 7);  set('onda_e', 100); set('onda_a', 40);
                          set('vmax_it', 3.0); set('ai_vol', 80); }
    if (n === 'g2')     { set('e_sep', 5);  set('e_lat', 7);  set('onda_e', 100); set('onda_a', 80);
                          set('vmax_it', 3.0); set('ai_vol', 80); }
    if (n === 'g1')     { set('e_sep', 5);  set('e_lat', 7);  set('onda_e', 50);  set('onda_a', 80);
                          set('vmax_it', 2.0); set('ai_vol', 40); }
    if (n === 'normal') { set('e_sep', 10); set('e_lat', 14); set('onda_e', 80);  set('onda_a', 60);
                          set('vmax_it', 2.0); set('ai_vol', 40); }
  }
  function medir(algo, ritmo, esc, vals, fevi) {
    set('diast_algoritmo', algo);
    set('diast_ritmo', ritmo);
    if (fevi !== undefined) set('fevi', fevi);
    escena(esc);
    try { calcDiastol(); } catch (e) { return { error: String(e) }; }
    /* El valor del selector se pone DESPUES del calculo, que es lo que hace el medico, y se
       recalcula para que la frase lo tome. */
    if (vals) {
      var sel = document.getElementById('diast_valsalva');
      if (sel) { sel.disabled = false; sel.value = vals;
                 sel.dispatchEvent(new Event('change', { bubbles: true })); }
      try { calcDiastol(); } catch (e) {}
    }
    var r = window._diastResult || {};
    var sel2 = document.getElementById('diast_valsalva');
    return { clave: r.clave || null, algoritmo: r.algoritmo || null, ritmo: r.ritmo || null,
             texto: r.texto || null, suma: r.textoSuma || null,
             sel_deshabilitado: sel2 ? !!sel2.disabled : null,
             sel_valor: sel2 ? sel2.value : null,
             sugerencia: txt('diast-valsalva-sug'),
             badge: txt('dd-interp') };
  }
  var casos = [
    ['ase2025/sinusal/g3/-',   'ase2025', 'sinusal', 'g3',     '',   60],
    ['ase2025/sinusal/g3/si',  'ase2025', 'sinusal', 'g3',     'si', 60],
    ['ase2025/sinusal/g3/no',  'ase2025', 'sinusal', 'g3',     'no', 60],
    ['ase2025/sinusal/g2',     'ase2025', 'sinusal', 'g2',     '',   60],
    ['ase2025/sinusal/g1',     'ase2025', 'sinusal', 'g1',     '',   60],
    ['ase2025/sinusal/normal', 'ase2025', 'sinusal', 'normal', '',   60],
    ['ase2025/fa/g3',          'ase2025', 'fa',      'g3',     '',   60],
    ['ase2016/sinusal/g3/-',   'ase2016', 'sinusal', 'g3',     '',   35],
    ['ase2016/sinusal/g3/si',  'ase2016', 'sinusal', 'g3',     'si', 35],
    ['ase2016/sinusal/g3/no',  'ase2016', 'sinusal', 'g3',     'no', 35],
    ['ase2016/sinusal/g2',     'ase2016', 'sinusal', 'g2',     '',   35],
    ['ase2016/fa/g3',          'ase2016', 'fa',      'g3',     '',   35],
    ['bse2024/sinusal/g3',     'bse2024', 'sinusal', 'g3',     '',   60],
    ['bse2024/fa/g3',          'bse2024', 'fa',      'g3',     '',   60]
  ];
  casos.forEach(function (c) { O.diast[c[0]] = medir(c[1], c[2], c[3], c[4], c[5]); });

  /* ⚠️ LA LIMPIEZA: con el valor puesto en un grado III, se pasa a grado II y tiene que BORRARSE */
  try {
    var m = medir('ase2025', 'sinusal', 'g3', 'no', 60);
    var antes = m.sel_valor;
    var m2 = medir('ase2025', 'sinusal', 'g2', '', 60);
    O.diast_limpieza = { antes: antes, despues: m2.sel_valor, deshabilitado: m2.sel_deshabilitado,
                         suma_g2: m2.suma };
  } catch (e) { O.diast_limpieza = { error: String(e) }; }

  /* ── 5 · LOS DOS ESQUEMAS ─────────────────────────────────────────────────────── */
  O.esquemas = {};
  try {
    [['a25f3', A25_PLANO_F3, 'a25.vals'], ['a16b8b', A16B_PLANO, 'a16b.vals'],
     ['a16a8a', A16A_PLANO, 'a16a.vals']].forEach(function (p) {
      var plano = p[1];
      var n = plano.nodos.filter(function (x) { return x.id === p[2]; })[0];
      O.esquemas[p[0]] = { tiene_nota: !!n, punteada: n ? !!n.app : null,
                           tit: n ? n.tit.join(' ') : null,
                           arista: plano.aristas.filter(function (a) { return a.a === p[2]; }).length,
                           pie_plural: (plano.pie || '').indexOf('Las cajas punteadas') >= 0,
                           n_app: plano.nodos.filter(function (x) { return x.app; }).length };
    });
  } catch (e) { O.esquemas.error = String(e); }

  /* ── 6 · EL CENSO: campos del estudio y columnas del Excel ────────────────────── */
  O.censo = {};
  try {
    var ctrl = document.querySelectorAll('input[id], select[id], textarea[id]');
    O.censo.controles_con_id = ctrl.length;
    O.censo.hay_diast_valsalva = !!document.getElementById('diast_valsalva');
    O.censo.hay_mch_ex_alcohol = !!document.getElementById('mch_ex_alcohol');
  } catch (e) { O.censo.error = String(e); }

  /* ── 7 · LA GEOMETRIA: HAY QUE ABRIR LA PESTANIA PRIMERO ──────────────────────────
     ⚠️ `showTab` NO LE DA CAJA A UNA TARJETA QUE ESTA EN OTRA PESTANIA: medido en esta misma
     sonda, la primera version dio 0x0 en los cuatro botones y en los dos selectores, y un 0x0
     se lee igual que «el control no esta». Las cinco rutas se midieron una por una: los dos
     selectores viven en `tab-doppler`, el strain en `tab-vd`, la extension de la TAVI en
     `tab-ete` + `ete-seccion-tavi` + el panel `post`, y el cor triatriatum en `tab-otros` +
     `ete-seccion-variantes`. Se abren con los MISMOS abridores de la app. */
  function abrir(tab, secciones, pane) {
    try { if (typeof showTab === 'function') showTab(tab); } catch (e) {}
    (secciones || []).forEach(function (sid) {
      try { if (typeof toggleEteSeccion === 'function') {
        var cont = document.getElementById('ete-seccion-' + sid);
        if (cont && getComputedStyle(cont).display === 'none') toggleEteSeccion(sid);
      } } catch (e) {}
    });
    if (pane) { try { if (typeof eteTaviTab === 'function') eteTaviTab(pane); } catch (e) {} }
  }
  O.geo = {};
  var RUTAS = [
    ['vd-strain-pl',   'vd',      [],             null],
    ['tavi-pvl-ext',   'ete',     ['tavi'],       'post'],
    ['otr-cortri',     'otros',   ['variantes'],  null],
    ['diast-valsalva', 'doppler', [],             null]
  ];
  RUTAS.forEach(function (ru) {
    abrir(ru[1], ru[2], ru[3]);
    var b = document.querySelector('[data-vinfo="' + ru[0] + '"]');
    if (!b) { O.geo[ru[0]] = 'FALTA'; return; }
    var r = b.getBoundingClientRect();
    /* El area tactil incluye el `::after` de la regla global, asi que se mide tambien el alto
       efectivo del renglon que lo contiene. */
    O.geo[ru[0]] = { w: Math.round(r.width), h: Math.round(r.height),
                     visible: r.width > 0 && r.height > 0,
                     dentro: r.top >= 0 && r.left >= 0 && r.right <= window.innerWidth + 1 };
  });
  /* La casilla del cor triatriatum no se marca al tocar su globo, AHORA CON CAJA de verdad. */
  try {
    abrir('otros', ['variantes'], null);
    var ck2 = document.getElementById('otr_var_cortri');
    var bb = document.querySelector('[data-vinfo="otr-cortri"]');
    if (ck2 && bb) { ck2.checked = false; bb.click(); O.geo.cortri_no_marca = (ck2.checked === false); }
  } catch (e) { O.geo.cortri_err = String(e); }

  /* ── 8 · LA PANTALLA ANGOSTA: los dos selectores ──────────────────────────────── */
  O.pantalla = {};
  abrir('doppler', [], null);
  try {
    var a = document.getElementById('diast_ritmo'), b = document.getElementById('diast_valsalva');
    if (a && b) {
      var ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      O.pantalla.ritmo = { x: Math.round(ra.left), w: Math.round(ra.width), h: Math.round(ra.height) };
      O.pantalla.vals  = { x: Math.round(rb.left), w: Math.round(rb.width), h: Math.round(rb.height) };
      O.pantalla.al_lado = Math.abs(ra.top - rb.top) < 6;
      O.pantalla.apilados = rb.top - ra.top > 20;
      /* Ningun titulo cortado: se compara el ancho de desplazamiento del label con el visible. */
      var labs = [];
      [a, b].forEach(function (el) {
        var p = el.parentElement, l = p && p.querySelector('label');
        if (l) labs.push({ t: (l.textContent || '').trim().slice(0, 28),
                           cortado: l.scrollWidth > l.clientWidth + 1 });
      });
      O.pantalla.labels = labs;
      O.pantalla.scrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    } else { O.pantalla.error = 'falta un selector'; }
  } catch (e) { O.pantalla.error = String(e); }

  return O;
}
