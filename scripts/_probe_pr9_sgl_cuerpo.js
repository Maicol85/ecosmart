(async () => {
  /* TAREA 4 de PR9: el ingreso del SGL, el cartel de FEVI/SGL y el redondeo. Solo MIDE. */
  const R = { err: [] };
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const set = (id, v) => { const e = document.getElementById(id); if (!e) return false;
    e.value = String(v); try { e.dispatchEvent(new Event('input', { bubbles:true })) } catch (x) {}
    try { e.dispatchEvent(new Event('change', { bubbles:true })) } catch (x) {} return true; };
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
  const btns = Array.prototype.slice.call(document.querySelectorAll('.tab,[role=tab],button'));
  const t = btns.find(b => (b.getAttribute('onclick')||'').indexOf("'sgl'") >= 0);
  if (t) t.click();
  await esperar(500);

  /* ── 4.4 · EL REDONDEO ──────────────────────────────────────────────────────────────────── */
  try {
    R.red = {};
    [-15.75, 15.75, -11.25, 11.25, -0.125, 0.125, -2.45, 2.45].forEach(function (x) {
      R.red['1dec ' + x] = (typeof _scRed === 'function') ? String(_scRed(x, 1)) : 'NO HAY';
      R.red['2dec ' + x] = (typeof _scRed === 'function') ? String(_scRed(x, 2)) : 'NO HAY';
    });
    R.simetrico1 = (typeof _scRed === 'function')
      && _scRed(-15.75,1) === -_scRed(15.75,1) && _scRed(-11.25,1) === -_scRed(11.25,1);
    R.simetrico2 = (typeof _scRed === 'function')
      && _scRed(-0.125,2) === -_scRed(0.125,2) && _scRed(-2.45,2) === -_scRed(2.45,2);
    R.alejaDeCero = (typeof _scRed === 'function')
      && _scRed(-15.75,1) === -15.8 && _scRed(15.75,1) === 15.8;
  } catch (e) { R.err.push('red: ' + String(e && e.message || e).slice(0,160)); }

  /* ── 4.1 · EL INGRESO ───────────────────────────────────────────────────────────────────── */
  try {
    R.regla = {};
    ['-17','17','+18','12,5','-20','-1718','1718','100','-100','999','-12.55','', 'abc','1,5.5']
      .forEach(function (x) { R.regla[JSON.stringify(x)] =
        (typeof strainTxtValido === 'function') ? String(strainTxtValido(x)) : 'NO HAY'; });
    const seg = document.querySelector('#sgl-svg-bullseye [data-strainid]');
    const id = seg && seg.getAttribute('data-strainid');
    R.id = id;
    if (!strainNumModoOn()) { try { strainNumToggle() } catch (x) {} }
    /* (A) EL GESTO EXACTO DEL MEDICO: -17, confirmar, reabrir, caret al final, escribir 18. */
    strainCajaAbrir(id, seg);
    let c = document.querySelector('[data-strain-caja]');
    R.caja = { maxlength: c && c.getAttribute('maxlength'), inputmode: c && c.getAttribute('inputmode') };
    if (c) { c.value = '-17'; c.dispatchEvent(new Event('input', { bubbles:true })); strainCajaCerrar(true); }
    R.tras17 = String(strainNum[id]);
    strainCajaAbrir(id, seg);
    c = document.querySelector('[data-strain-caja]');
    if (c) {
      c.setSelectionRange(c.value.length, c.value.length);
      c.value = c.value + '1';  c.dispatchEvent(new Event('input', { bubbles:true }));
      R.trasPrimerDigito = c.value;
      c.value = c.value + '8';  c.dispatchEvent(new Event('input', { bubbles:true }));
      R.trasSegundoDigito = c.value;
      strainCajaCerrar(true);
    }
    R.tras1718 = String(strainNum[id]);
    /* (B) PEGAR un numero largo */
    strainCajaAbrir(id, seg);
    c = document.querySelector('[data-strain-caja]');
    if (c) { c.value = '-123456'; c.dispatchEvent(new Event('input', { bubbles:true }));
             R.trasPegarEnCaja = c.value; strainCajaCerrar(true); }
    R.trasPegar = String(strainNum[id]);
    /* (C) EL CAMINO DE ABAJO: strainEscribir directo con un valor imposible */
    R.escribir1718 = String(strainEscribir(id, '-1718'));
    R.trasEscribir1718 = String(strainNum[id]);
    /* (D) LOS NORMALES SIGUEN ENTRANDO */
    R.norm = {};
    [['-17',-17],['+5',5],['12,5',-12.5]].forEach(function (par) {
      strainEscribir(id, par[0]); R.norm[par[0]] = String(strainNum[id]);
    });
    /* (E) UN VALOR IMPOSIBLE YA GUARDADO EN DISCO */
    const campos = {};
    campos.strain_sgl_ver = STRAIN_VER;
    const est = {}, nums = {};
    const ids = (typeof LV3D_SEG_ID !== 'undefined') ? LV3D_SEG_ID.slice(1) : [];
    ids.forEach(function (k, i) { est[k] = strainTramoDe(-12); nums[k] = -12; });
    est[ids[14]] = 1; nums[ids[14]] = -1718;   /* el apical inferior, el del caso */
    campos.strain_sgl = JSON.stringify(est);
    campos.strain_sgl_num = JSON.stringify(nums);
    /* El aviso de que un valor guardado era imposible: se espia toast. */
    const _t = window.toast; let _avisos = [];
    window.toast = function (m) { _avisos.push(String(m)); };
    _restaurarStrain(campos);
    window.toast = _t;
    R.avisoViejo = _avisos.filter(function (m) { return m.indexOf('imposible') >= 0 }).length;
    R.avisosTotal = _avisos.length;
    R.restMalo = String(strainNum[ids[14]]);
    R.restMaloTramo = String(strainIdx(ids[14]));
    R.restOtro = String(strainNum[ids[0]]);
    R.restProm17 = String(scPromedio(SC_GRUPOS.g17));
  } catch (e) { R.err.push('ingreso: ' + String(e && e.message || e).slice(0,250)); }

  /* ── LA VERIFICACION DE LA ORDEN: los diecisiete numeros ────────────────────────────────── */
  try {
    sglReset();
    /* /!\ EL POSITIVO VA CON SU SIGNO MAS EXPLICITO. La convencion de esta casa es que un valor
       SIN signo se toma NEGATIVO -lo declara strainParseNum-, asi que escribir «5» guarda -5 y
       el promedio basal daba -10,3 en vez de -8,7. Es la sonda la que estaba mal, no la app. */
    const V = ['+5','-5','-12','-12','-12','-16', '-12','-12','-14','-10','-9','-9',
               '-16','-13','-17','-17', '-18'];
    const ids = LV3D_SEG_ID.slice(1);
    ids.forEach(function (k, i) { strainEscribir(k, V[i]); });
    R.cargados = ids.map(function (k) { return strainNum[k] }).join(',');
    if (typeof scRender === 'function') scRender();
    R.tabla = {};
    ['g17','g16','basal','medio','apical','DA','CD','CX','asr','fsgl'].forEach(function (k) {
      try { const c = _scCelPub ? _scCelPub(k) : null; } catch (e) {}
    });
    /* por los duenos publicos */
    R.tabla['17 seg.'] = _scN(scPromedio(SC_GRUPOS.g17), 1);
    R.tabla['16 seg.'] = _scN(scPromedio(SC_GRUPOS.g16), 1);
    R.tabla['Basal']   = _scN(scPromedio(SC_GRUPOS.basal), 1);
    R.tabla['Medio']   = _scN(scPromedio(SC_GRUPOS.medio), 1);
    R.tabla['Apical']  = _scN(scPromedio(SC_GRUPOS.apical), 1);
    R.tabla['DA']      = _scN(scPromedio(_scTerr('DA')), 1);
    R.tabla['CD']      = _scN(scPromedio(_scTerr('CD')), 1);
    R.tabla['CX']      = _scN(scPromedio(_scTerr('CX')), 1);
    R.tabla['A. sparing'] = _scN(scApicalSparing(), 2);
    /* y lo que la PANTALLA publica, calculando las diez celdas */
    SC_COLS.forEach(function (col) { (col.cel||[]).forEach(function (c) { if (c) { try { scCalcular(c.k) } catch (e) {} } }) });
    const raiz = document.getElementById('sgl-calc');
    R.pantalla = Array.prototype.map.call(raiz.querySelectorAll('tbody td'), function (td) {
      const n = td.querySelector('.sc-nom'), v = td.querySelector('.sc-val');
      return n ? (n.textContent + '=' + (v ? v.textContent : '?')) : '';
    }).filter(Boolean).join(' | ');
  } catch (e) { R.err.push('datos: ' + String(e && e.message || e).slice(0,250)); }

  /* ── 4.2 · EL CARTEL DE FEVI/SGL ────────────────────────────────────────────────────────── */
  try {
    const cFsgl = SC_COLS[3].cel[1];
    R.fsgl = {};
    set('fevi',''); set('sgl_gls',''); set('sgl','');
    await esperar(60);
    R.fsgl.sinNada = scMotivo(cFsgl);
    set('fevi','50');
    await esperar(60);
    R.fsgl.conFeviSinSgl = scMotivo(cFsgl);
    set('fevi',''); set('sgl_gls','-17');
    await esperar(60);
    R.fsgl.sinFevi = scMotivo(cFsgl);
    set('fevi','50');
    await esperar(60);
    R.fsgl.conAmbos = scMotivo(cFsgl);
    R.fsgl.valor = scValor(cFsgl);
    /* La FEVI sale del MISMO valor que usa el informe */
    R.fsgl.mismoQueInforme = (typeof v === 'function') && (_scFevi() === v('fevi'));
    /* Y si cambia la FEVI, el resultado ya calculado SE BORRA */
    scCalcular('fsgl');
    R.fsgl.calculado = (function(){ const r=document.getElementById('sgl-calc');
      const tds=Array.prototype.slice.call(r.querySelectorAll('tbody td'));
      const td=tds.find(x=>{const n=x.querySelector('.sc-nom');return n&&n.textContent==='FEVI/SGL'});
      return td ? td.querySelector('.sc-val').textContent : 'NO HAY'; })();
    set('fevi','60');
    await esperar(400);   /* el barrido de espejos corre con 220 ms de rebote */
    R.fsgl.trasCambiarFevi = (function(){ const r=document.getElementById('sgl-calc');
      const tds=Array.prototype.slice.call(r.querySelectorAll('tbody td'));
      const td=tds.find(x=>{const n=x.querySelector('.sc-nom');return n&&n.textContent==='FEVI/SGL'});
      return td ? td.querySelector('.sc-val').textContent : 'NO HAY'; })();
    /* A MANO tambien cuenta para la formula: se escribe el campo y se recalcula */
    set('sgl_gls','-20');
    await esperar(60);
    R.fsgl.aManoMotivo = scMotivo(cFsgl);
    R.fsgl.aManoValor = scValor(cFsgl);
  } catch (e) { R.err.push('fsgl: ' + String(e && e.message || e).slice(0,250)); }
  try { sglReset(); } catch (e) {}
  return R;
})()
