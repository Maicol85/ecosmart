(async () => {
  const R = { err: [] };
  const T = (n, f) => { try { R[n] = f(); } catch (e) { R[n] = 'ERR ' + String(e && e.message || e).slice(0, 150); } };
  const TA = async (n, f) => { try { R[n] = await f(); } catch (e) { R[n] = 'ERR ' + String(e && e.message || e).slice(0, 150); } };
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const set = (id, v) => { const e = document.getElementById(id); if (!e) return false;
    e.value = String(v); try { e.dispatchEvent(new Event('input', { bubbles:true })) } catch (x) {}
    try { e.dispatchEvent(new Event('change', { bubbles:true })) } catch (x) {} return true; };
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}

  // ─────────── SIEMBRA ───────────
  const SEM = [['nombre','Zoraida Pruebas'],['fecha','2026-11-24'],['edad','64'],['sexo','M'],
    ['peso','78'],['talla','172'],
    ['ao_sin','41'],['ao_st','33'],['ao_tub','45'],['diam_cayado','30'],['diam_ao_toracica','26'],
    ['diam_tsvi_ao','21'],['ai_diam','42'],['ai_area','23'],['ai_vol','78'],
    ['ad_area','17'],['vci_diam','19'],['pmad','5'],
    ['siv','12'],['ddfvi','52'],['dsfvi','34'],['ppvi','11'],['vdfvi','140'],['vsfvi','58'],
    ['fevi','58'],['sgl','-17'],['vol_lat','82'],
    ['tvia','110'],['tapse','19'],['s_prime','11'],['vd_bas','38'],['vd_mid','31'],['vd_long','74'],
    ['vd_area_d','24'],['vd_area_s','14'],['fevd','48'],['vd_vi','0.8'],
    ['onda_e','88'],['onda_a','62'],['tde','198'],['triv','82'],['thp','95'],
    ['venp_dur_a','120'],['venp_dur_ar','155'],['venp_vel_ar','42'],['e_sep','7'],['e_lat','10'],
    ['vmax_it','2.8'],['pap_med','26'],['vp_vmax','1.1'],['ip_vmax','2.2'],['ip_vtd','1.4'],
    ['vmax_ao','4.2'],['gmedio_ao','46'],['itv_tsvi','18'],['itv_ao','95'],['diam_tsvi','21'],
    ['hemo_fc','72'],
    ['vm_morf','Prolapso / EVMS'],['im_grado','4'],['im_vc','7'],
    ['im_eroa_cont','26.1'],['vr_cont','22.7'],['im_fr_cont','26'],
    ['va_morf','Calcificada'],['ia_grado','4'],['ia_vc','4'],['ia_pht','220'],
    ['vt_morf','Normal'],['it_grado','2'],['it_vc','5'],
    ['informe_texto','Ventriculo izquierdo de dimensiones normales.\nFuncion sistolica conservada.'],
    ['en_suma','Insuficiencia mitral severa.\nEstenosis aortica moderada.']];
  SEM.forEach(p => set(p[0], p[1]));
  try { const c = document.getElementById('vci_col'); if (c) { c.value = '>50'; c.dispatchEvent(new Event('change',{bubbles:true})) } } catch (e) {}
  await esperar(500);

  // ═══════════════════ TAREA 1 ═══════════════════
  try { showTab('informe'); } catch (e) {}
  try { cuadReset(); cuadResumenValvToggle(false); cuadAbrir(); } catch (e) { R.err.push('abrir: '+e.message); }
  await esperar(120);
  const G = () => document.getElementById('cuad-grid');
  const ids = () => Array.prototype.map.call(
    document.querySelectorAll('#cuad-grid > [data-cuad-id]'), n => n.getAttribute('data-cuad-id')).join(',');
  const rvCajas = () => document.querySelectorAll('#cuad-grid > [data-cuad-rv-id]').length;
  const rvBtn = () => document.querySelector('[data-cuad-rv]');

  T('rvEtiqueta', () => { const b = rvBtn(); if (!b) return 'NO HAY';
    return b.tagName + '|inputs=' + b.querySelectorAll('input').length + '|id=' + (b.id || 'SIN')
      + '|txt=' + (b.textContent || '').trim() + '|w=' + Math.round(b.getBoundingClientRect().width)
      + 'x' + Math.round(b.getBoundingClientRect().height); });
  T('rvTitulo', () => { const b = rvBtn(); return b ? String(b.getAttribute('title') || '').slice(0, 60) : 'NO'; });
  T('rvPressed0', () => { const b = rvBtn(); return b ? b.getAttribute('aria-pressed') : 'NO'; });
  T('rvCajas0', rvCajas);
  T('ids0', ids);
  // prender el resumen
  try { rvBtn().click(); } catch (e) { R.err.push('clic rv: '+e.message); }
  await esperar(120);
  T('rvPressed1', () => { const b = rvBtn(); return b ? b.getAttribute('aria-pressed') : 'NO'; });
  T('rvCajas1', rvCajas);
  T('rvTitFila', () => { const t = document.querySelector('#cuad-grid > .cuad-rvtit');
    return t ? (t.textContent + '|span=' + t.getAttribute('data-cuad-span')) : 'NO HAY'; });
  T('rvIdsIntactos', ids);
  T('rvArrastrable', () => { const c = document.querySelector('#cuad-grid > [data-cuad-rv-id]');
    return c ? ('sin-data-cuad-id=' + String(c.getAttribute('data-cuad-id') === null)
      + '|cruces=' + c.querySelectorAll('.cuad-x').length) : 'NO HAY'; });
  // Restablecer apaga el resumen
  try { document.getElementById('cuad-rest').click(); } catch (e) {}
  await esperar(120);
  T('restRvPressed', () => { const b = rvBtn(); return b ? b.getAttribute('aria-pressed') : 'NO'; });
  T('restRvCajas', rvCajas);

  // ─── el arrastre ───
  const pev = (nodo, t, x, y) => { let e;
    try { e = new PointerEvent(t, { bubbles:true, cancelable:true, pointerId:7, pointerType:'mouse',
                                    button:0, buttons:1, clientX:x, clientY:y }); }
    catch (err) { e = new MouseEvent(t, { bubbles:true, cancelable:true, clientX:x, clientY:y }); }
    nodo.dispatchEvent(e); };
  const caja = i => document.querySelectorAll('#cuad-grid > [data-cuad-id]')[i];
  const arrastrar = (ia, ib, sobreCruz) => {
    const a = caja(ia), b = caja(ib);
    if (!a || !b) return { err:'FALTAN CAJAS' };
    const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    const x0 = ra.left + ra.width / 2, y0 = ra.top + Math.min(30, ra.height / 2);
    const x1 = rb.left + rb.width / 2, y1 = rb.top + Math.min(30, rb.height / 2);
    const desde = sobreCruz ? (a.querySelector('.cuad-x') || a) : a;
    pev(desde, 'pointerdown', x0, y0);
    pev(document, 'pointermove', x0 + 10, y0 + 10);
    const arrOn = a.classList.contains('cuad-arr');
    pev(document, 'pointermove', x1, y1);
    const dest = document.querySelectorAll('#cuad-grid .cuad-dest').length;
    const destId = (document.querySelector('#cuad-grid .cuad-dest') || {}).getAttribute
      ? document.querySelector('#cuad-grid .cuad-dest').getAttribute('data-cuad-id') : null;
    const diag = Math.abs(x1 - x0) > 4 && Math.abs(y1 - y0) > 4;
    pev(document, 'pointerup', x1, y1);
    return { arrOn, dest, destId, diag };
  };
  T('arrA', () => { const r = arrastrar(0, 3, false); return JSON.stringify(r) + '|ids=' + ids(); });
  T('arrGris', () => document.querySelectorAll('#cuad-grid .cuad-arr, #cuad-grid .cuad-dest').length);
  T('arrOpac', () => { const c = caja(0); return c ? getComputedStyle(c).opacity : 'NO'; });
  // el MISMO cuadro se vuelve a mover
  T('arrB', () => { const antes = ids(); const r = arrastrar(0, 1, false);
    return JSON.stringify(r) + '|antes=' + antes + '|ids=' + ids(); });
  // un clic sin movimiento NO reordena
  T('arrClic', () => { const antes = ids(); const a = caja(0);
    const ra = a.getBoundingClientRect(); const x = ra.left + 20, y = ra.top + 10;
    pev(a, 'pointerdown', x, y); pev(document, 'pointerup', x, y);
    return (ids() === antes) + '|' + ids(); });
  // la cruz NO arrastra
  T('arrCruz', () => { const antes = ids(); const r = arrastrar(0, 2, true);
    return 'arrOn=' + r.arrOn + '|igual=' + (ids() === antes); });
  try { cuadReset(); cuadPintar(); } catch (e) {}
  await esperar(80);
  T('idsTrasReset', ids);
  try { cuadCerrar(); } catch (e) {}

  // ═══════════════════ TAREA 2 ═══════════════════
  T('txt', () => { const t = cuadTexto(); return t.length + ' chars'; });
  T('txtVI', () => { const t = cuadTexto(); const i = t.indexOf('Ventrículo izquierdo:');
    return i < 0 ? 'NO HAY VI' : t.slice(i, i + 460); });
  T('txtMitral', () => { const t = cuadTexto(); const i = t.indexOf('Válvula mitral:');
    return i < 0 ? 'NO HAY' : t.slice(i, i + 420); });
  T('txtTri', () => { const t = cuadTexto(); const i = t.indexOf('Válvula tricúspide');
    return i < 0 ? 'NO HAY' : t.slice(i, i + 380); });
  T('txtMensajes', () => { const t = cuadTexto().toLowerCase();
    return ['no corresponde','no evaluable','no válid','no valid']
      .map(m => m + '=' + (t.indexOf(m) >= 0 ? 'SI' : 'no')).join(' '); });
  T('txtThp', () => { const t = cuadTexto();
    let n = 0, i = t.indexOf('THP'); while (i >= 0) { n++; i = t.indexOf('THP', i + 1); } return n; });
  T('txtMayus', () => { const t = cuadTexto(); const malas = [];
    t.split('\n').forEach(l => { if (l.indexOf('  ') !== 0) return; const c = l.slice(2, 3);
      if (c && c === c.toLowerCase() && c !== c.toUpperCase()) malas.push(l.slice(0, 26)); });
    return malas.length + (malas.length ? (' :: ' + malas.join(' | ')) : ''); });
  T('txtBlancos', () => { const t = cuadTexto();
    return 'lineasVacias=' + t.split('\n').filter(l => l === '').length
      + '|dobles=' + (t.indexOf('\n\n\n') >= 0 ? 'SI' : 'no'); });
  T('htmlDatos', () => { const h = cuadTextoHTML();
    return 'len=' + h.length + '|b=' + (h.match(/<b>/g)||[]).length
      + '|u=' + (h.match(/<u>/g)||[]).length + '|doppler=' + (h.indexOf('<b><u>DOPPLER</u></b>') >= 0)
      + '|nbsp=' + (h.match(/&nbsp;/g)||[]).length; });
  T('htmlInforme', () => { const h = cuadInformeHTML();
    return 'len=' + h.length + '|inf=' + (h.indexOf('<b><u>INFORME</u></b>') >= 0)
      + '|suma=' + (h.indexOf('<b><u>EN SUMA:</u></b>') >= 0)
      + '|li=' + (h.match(/<li/g)||[]).length + '|ul=' + (h.indexOf('<ul') >= 0); });
  T('sumaItems', () => JSON.stringify(cuadSumaItems(document.getElementById('en_suma').value)));

  // ─── el PDF Tipo Word, generado de verdad ───
  const pdf = (plant) => {
    let cap = null, imgs = 0, nAdd = 0;
    const J = window.jspdf && window.jspdf.jsPDF;
    if (!J) return { b:null, imgs:0 };
    try { setPdfPlantilla(plant); } catch (e) {}
    window.jspdf.jsPDF = function (o) {
      const d = new J(o);
      const ai = d.addImage; d.addImage = function () { imgs++; return ai.apply(this, arguments) };
      const ar = d.rect; d.rect = function () { nAdd++; return ar.apply(this, arguments) };
      d.save = function () { try { cap = this.output('datauristring') } catch (e) {} return this };
      return d;
    };
    try { _pdfAjustarA4(); } catch (e) {}
    window.jspdf.jsPDF = J;
    if (!cap) return { b:null, imgs:imgs, rects:nAdd };
    try { return { b: atob(String(cap).split(',')[1]), imgs: imgs, rects: nAdd } }
    catch (e) { return { b:null, imgs:imgs, rects:nAdd } }
  };
  const cont = (b, f) => { if (!b) return -1; const B = b.toLowerCase(), q = f.toLowerCase();
    let n = 0, i = B.indexOf(q); while (i >= 0) { n++; i = B.indexOf(q, i + 1) } return n; };
  await TA('pdfWord', async () => { const r = pdf('tipoword'); if (!r.b) return 'SIN PDF';
    return 'bytes=' + r.b.length + '|imgs=' + r.imgs + '|rects=' + r.rects
      + '|nombre=' + cont(r.b, 'Zoraida') + '|edad=' + cont(r.b, '64')
      + '|informe=' + cont(r.b, 'INFORME') + '|suma=' + cont(r.b, 'EN SUMA')
      + '|doppler=' + cont(r.b, 'DOPPLER') + '|vinieta=' + cont(r.b, '•')
      + '|aorta=' + cont(r.b, 'Aorta') + '|mitral=' + cont(r.b, 'mitral'); });
  await TA('pdfClasico', async () => { const r = pdf('clasico'); if (!r.b) return 'SIN PDF';
    return 'bytes=' + r.b.length + '|imgs=' + r.imgs + '|rects=' + r.rects
      + '|vinieta=' + cont(r.b, '•'); });
  try { setPdfPlantilla('clasico'); } catch (e) {}

  // ═══════════════════ TAREA 3 ═══════════════════
  try { showTab('sgl'); } catch (e) {}
  try { secToggle('sgl'); } catch (e) {}
  await esperar(150);
  try { if (document.getElementById('sacc-sgl').querySelector('.sacc-hdr').getAttribute('aria-expanded') !== 'true')
    secToggle('sgl'); } catch (e) {}
  try { sglOnShow(); } catch (e) { R.err.push('sglOnShow: ' + e.message); }
  await esperar(200);
  const sgSeg = id => document.querySelector('#sgl-svg-bullseye path[data-strainid="' + id + '"]')
                  || document.querySelector('#sgl-svg-bullseye circle[data-strainid="' + id + '"]');
  const sgTxt = id => document.querySelector('#sgl-svg-bullseye text[data-strainid="' + id + '"]');
  T('sglMigra', () => JSON.stringify(STRAIN_MIGRA) + '|def=' + STRAIN_DEF);
  T('sglIni', () => { const ids17 = LV3D_SEG_ID.slice(1);
    const cols = ids17.map(i => { const e = sgSeg(i); return e ? e.getAttribute('fill') : 'NO' });
    const tx = ids17.map(i => { const e = sgTxt(i); return e ? (e.textContent || '') : 'NO' });
    return 'n=' + ids17.length + '|unicos=' + Array.from(new Set(cols)).join(',')
      + '|violeta=' + STRAIN_PAL[1].color + '|textos=' + Array.from(new Set(tx)).join('~')
      + '|hayDatos=' + strainHayDatos(); });
  T('sglCiclo', () => { const id = 'basal_anterior'; const out = [];
    for (let k = 0; k < 10; k++) { strainTocar(id, sgSeg(id)); out.push(strainIdx(id)); }
    return out.join(','); });
  try { sglReset(); } catch (e) {}
  T('sglGuionOff', () => { const id = 'apex'; const e = sgTxt(id); return '[' + (e ? e.textContent : 'NO') + ']'; });
  T('sglGuionOn', () => { strainNumToggle();
    const e = sgTxt('apex'); const r = '[' + (e ? e.textContent : 'NO') + ']|modo=' + strainNumModoOn();
    return r; });
  T('sglMas', () => { strainEscribir('basal_anterior', '+8');
    const e = sgTxt('basal_anterior');
    return 'num=' + strainNum['basal_anterior'] + '|txt=' + (e ? e.textContent : 'NO')
      + '|tramo=' + strainIdx('basal_anterior'); });
  T('sglSinSigno', () => { strainEscribir('basal_anteroseptal', '8');
    return 'num=' + strainNum['basal_anteroseptal'] + '|tramo=' + strainIdx('basal_anteroseptal'); });
  T('sglBorrar', () => { strainEscribir('basal_anterior', '');
    const e = sgTxt('basal_anterior');
    return 'tramo=' + strainIdx('basal_anterior') + '|num=' + String(strainNum['basal_anterior'])
      + '|color=' + (sgSeg('basal_anterior') || {}).getAttribute('fill')
      + '|txt=[' + (e ? e.textContent : 'NO') + ']'; });
  T('sglAvisoApagado', () => { strainEscribir('mid_anterior', '-12');
    const antes = strainIdx('mid_anterior'); strainNumToggle();   /* apaga */
    strainTocar('mid_anterior', sgSeg('mid_anterior'));
    return 'antes=' + antes + '|despues=' + strainIdx('mid_anterior')
      + '|num=' + strainNum['mid_anterior'] + '|modo=' + strainNumModoOn()
      + '|aviso=' + String(typeof STRAIN_AVISO_NUM === 'string' && STRAIN_AVISO_NUM.indexOf('tiene un n') > 0); });
  T('sglCajaOculta', () => { strainNumToggle();   /* prende */
    strainCajaAbrir('mid_anterior', sgSeg('mid_anterior'));
    const e = sgTxt('mid_anterior'); const c = document.querySelector('[data-strain-caja]');
    const r = 'caja=' + (c ? c.value : 'NO') + '|vis=' + (e ? String(e.getAttribute('visibility')) : 'NO');
    strainCajaCerrar(false);
    return r + '|trasCerrar=' + (sgTxt('mid_anterior') ? String(sgTxt('mid_anterior').getAttribute('visibility')) : 'NO'); });
  try { if (strainNumModoOn()) strainNumToggle(); } catch (e) {}
  try { sglReset(); } catch (e) {}

  // ═══════════════════ TAREA 4 ═══════════════════
  T('scExiste', () => { const c = document.getElementById('sgl-calc');
    if (!c) return 'NO HAY';
    const t = c.querySelector('table.sc-tabla');
    const ths = t ? Array.prototype.map.call(t.querySelectorAll('thead th'), n => n.textContent) : [];
    const filas = t ? t.querySelectorAll('tbody tr').length : 0;
    return 'cols=' + ths.join('/') + '|filas=' + filas
      + '|alto=' + Math.round(c.getBoundingClientRect().height)
      + '|ancho=' + Math.round(c.getBoundingClientRect().width)
      + '|chk=' + c.querySelectorAll('input').length; });
  T('scOrden', () => { const c = document.getElementById('sgl-calc');
    const p = document.getElementById('sp-root'); const card = document.getElementById('sacc-sgl');
    if (!c || !p || !card) return 'FALTA ALGO';
    return 'trasTarjeta=' + String(!!(card.compareDocumentPosition(c) & 4))
      + '|antesPatrones=' + String(!!(c.compareDocumentPosition(p) & 4)); });
  T('scApagados', () => { const c = document.getElementById('sgl-calc');
    const bs = c.querySelectorAll('.sc-bot button');
    const dis = Array.prototype.filter.call(bs, b => b.disabled).length;
    const faltas = Array.prototype.map.call(c.querySelectorAll('.sc-falta'), n => n.textContent.slice(0, 40));
    return 'botones=' + bs.length + '|apagados=' + dis + '|faltas=' + faltas.length
      + '|ej=' + (faltas[0] || 'NINGUNA'); });
  T('scMotivoFsgl', () => scMotivo({ tipo:'fsgl' }));
  // llenar los 17 con numeros
  T('scLlenar', () => { const v = [-20,-18,-16,-14,-12,-10, -19,-17,-15,-13,-11,-9, -8,-7,-6,-5, -4];
    LV3D_SEG_ID.slice(1).forEach((id, k) => strainEscribir(id, String(v[k])));
    return 'num=' + Object.keys(strainNum).length; });
  T('scProm', () => 'g17=' + scPromedio(SC_GRUPOS.g17) + '|g16=' + scPromedio(SC_GRUPOS.g16)
    + '|basal=' + scPromedio(SC_GRUPOS.basal) + '|medio=' + scPromedio(SC_GRUPOS.medio)
    + '|apical=' + scPromedio(SC_GRUPOS.apical));
  T('scTerr', () => 'DA=' + JSON.stringify(_scTerr('DA')) + '|CD=' + JSON.stringify(_scTerr('CD'))
    + '|CX=' + JSON.stringify(_scTerr('CX'))); 
  T('scFormulas', () => 'asr=' + scApicalSparing() + '|fsgl=' + scFeviSobreSgl()
    + '|fevi=' + (document.getElementById('fevi')||{}).value + '|sgl=' + (document.getElementById('sgl_gls')||{}).value);
  T('scPrendidos', () => { scRender(); const c = document.getElementById('sgl-calc');
    const bs = c.querySelectorAll('.sc-bot button');
    return 'botones=' + bs.length + '|apagados=' + Array.prototype.filter.call(bs, b => b.disabled).length
      + '|faltas=' + c.querySelectorAll('.sc-falta').length; });
  T('scCalc', () => { scCalcular('g17'); scCalcular('basal'); scCalcular('asr');
    const c = document.getElementById('sgl-calc');
    return Array.prototype.map.call(c.querySelectorAll('.sc-val'), n => n.textContent).join(' / '); });
  T('scBorraAlCambiar', () => { strainEscribir('apex', '-3'); scRender();
    const c = document.getElementById('sgl-calc');
    return Array.prototype.map.call(c.querySelectorAll('.sc-val'), n => n.textContent).join(' / '); });
  // usar como SGL global con el campo cargado -> pregunta
  await TA('scUsar', async () => { scCalcular('g17');
    const el = document.getElementById('sgl_gls'); el.value = '-15';
    scUsarComoSGL('g17');
    await esperar(60);
    const ov = document.querySelector('[data-borr-conf]');
    const r0 = 'pregunta=' + !!ov + '|campoAntes=' + el.value;
    if (ov) { const bs = ov.querySelectorAll('button');
      let si = null; Array.prototype.forEach.call(bs, b => { if ((b.textContent||'').indexOf('Reemplaz') >= 0) si = b });
      if (si) si.click(); }
    await esperar(120);
    return r0 + '|campoDespues=' + el.value + '|espejo=' + (document.getElementById('sgl')||{}).value; });
  // nada de la tabla en el informe, el PDF ni los copiados
  T('scNoSale', () => { const t = cuadTexto() + ' ' + cuadInformeTexto() + ' ' + cuadTextoHTML();
    return ['Apical sparing','FEVI / SGL','Promedio 17','Cálculos de strain']
      .map(f => f + '=' + (t.indexOf(f) >= 0 ? 'SI' : 'no')).join(' '); });
  await TA('scNoPdf', async () => { const r = pdf('clasico'); if (!r.b) return 'SIN PDF';
    return ['Apical sparing','FEVI / SGL','Promedio 17','lculos de strain']
      .map(f => f + '=' + cont(r.b, f)).join(' '); });
  try { setPdfPlantilla('clasico'); } catch (e) {}
  T('censo', () => document.querySelectorAll('input[id]').length + '/'
    + document.querySelectorAll('select[id]').length + '/'
    + document.querySelectorAll('textarea[id]').length);
  T('vinfoN', () => Object.keys(VINFO).length + '|btn44=' + document.querySelectorAll('.vinfo-btn.vinfo-btn-44').length);

  // ═══════════════════ CONTROLES Y LO QUE FALTABA MEDIR ═══════════════════
  // (a) la tabla con TODO cargado: su altura minima
  T('scAlto', () => { scRender(); const c = document.getElementById('sgl-calc');
    const r = c.getBoundingClientRect();
    return 'alto=' + Math.round(r.height) + '|ancho=' + Math.round(r.width)
      + '|faltas=' + c.querySelectorAll('.sc-falta').length
      + '|botMin=' + Math.min.apply(null, Array.prototype.map.call(c.querySelectorAll('.sc-bot button'),
          b => Math.round(Math.min(b.getBoundingClientRect().width, b.getBoundingClientRect().height)))); });
  T('scAltoTarjeta', () => { const t = document.getElementById('sacc-sgl');
    return t ? Math.round(t.getBoundingClientRect().height) : 'NO'; });

  // (b) el arrastre DIAGONAL de verdad y el reintercambio
  try { showTab('informe'); cuadReset(); cuadAbrir(); } catch (e) {}
  await esperar(120);
  T('arrDiagonal', () => { const a = caja(0), b = caja(4);
    if (!a || !b) return 'FALTAN';
    const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    const x0 = ra.left + 30, y0 = ra.top + 20, x1 = rb.left + rb.width - 30, y1 = rb.top + rb.height - 20;
    const antes = ids();
    pev(a, 'pointerdown', x0, y0);
    pev(document, 'pointermove', x0 + 9, y0 + 9);
    pev(document, 'pointermove', x1, y1);
    const d = document.querySelector('#cuad-grid .cuad-dest');
    const destId = d ? d.getAttribute('data-cuad-id') : 'NINGUNO';
    pev(document, 'pointerup', x1, y1);
    return 'dx=' + Math.round(Math.abs(x1-x0)) + '|dy=' + Math.round(Math.abs(y1-y0))
      + '|dest=' + destId + '|antes=' + antes + '|ids=' + ids(); });
  T('arrVuelta', () => { const antes = ids();
    const r = arrastrar(0, 4, false);
    return 'ids=' + ids() + '|vuelveAlFabrica=' + String(ids() === 'ao,ai,advci,viest,visis,vd,vm,dti,trip,va,gc,otros'); });
  T('arrAnchos', () => { const c0 = caja(0), c1 = caja(11);
    if (!c0 || !c1) return 'FALTAN';
    return 'span0=' + c0.getAttribute('data-cuad-span') + '|span11=' + c1.getAttribute('data-cuad-span')
      + '|w0=' + Math.round(c0.getBoundingClientRect().width)
      + '|w11=' + Math.round(c1.getBoundingClientRect().width); });
  T('arrAnchoTrasCambio', () => { /* con ONCE cuadros la ultima fila va de a 2: anchos distintos */
    cuadQuitar('otros');
    const c9 = caja(9), c10 = caja(10);
    const a = 'span9=' + (c9?c9.getAttribute('data-cuad-span'):'?') + '|span10=' + (c10?c10.getAttribute('data-cuad-span'):'?');
    const r = arrastrar(0, 10, false);
    const n0 = caja(0), n10 = caja(10);
    const b = 'tras: span0=' + (n0?n0.getAttribute('data-cuad-span'):'?') + '|span10=' + (n10?n10.getAttribute('data-cuad-span'):'?');
    cuadRecuperar('otros');
    return a + ' || ' + b + ' || ids=' + ids(); });
  try { cuadReset(); cuadPintar(); cuadCerrar(); } catch (e) {}

  // (c) el CONTROL POSITIVO del filtro de mensajes: AVm por THP con «no corresponde»
  //     Con la insuficiencia aortica SEVERA el metodo del THP no corresponde; se fuerza el area
  //     por CONTINUIDAD para que la linea del area NO sea la del THP y el renglon del AVm por THP
  //     tenga que salir por su cuenta.
  T('msgControl', () => {
    const crudo = (typeof cuadAvmThpTxt === 'function') ? cuadAvmThpTxt() : 'NO HAY FUNCION';
    const ix = (typeof _cwIndice === 'function') ? _cwIndice() : {};
    return 'cuadAvmThpTxt=[' + crudo + ']|indice=[' + String(ix['vm|AVm THP']) + ']'
      + '|esMensaje=' + String(typeof _cwEsMensaje === 'function' ? _cwEsMensaje(crudo) : 'NO')
      + '|areaTxt=[' + String(typeof _cwAvmTxt === 'function' ? _cwAvmTxt() : 'NO') + ']'
      + '|enTexto=' + (cuadTexto().indexOf('AVm por THP') >= 0 ? 'SI' : 'no'); });
  // (d) el filtro de mensajes, con su CONTROL POSITIVO directo
  T('msgFiltro', () => {
    const casos = ['no corresponde', 'THP: no evaluable (THP fuera de rango)', 'no válido',
                   'Revisar los valores', '2.32 cm2', '95 ms'];
    return casos.map(c => '[' + c.slice(0,18) + ']=' + String(_cwEsMensaje(c))).join(' ')
      + ' || pz=' + String(_cwPz('AVm por THP', 'no corresponde'))
      + ' / ' + String(_cwPz('THP', '95 ms')); });
  // (d2) la linea mitral con el area adentro, y el CORTE cuando queda larga
  T('avmEnLinea', () => {
    const t = cuadTexto(); const i = t.indexOf('Válvula mitral:');
    const bl = t.slice(i, i + 200).split('\n');
    const lin = bl.filter(l => l.indexOf('THP:') >= 0)[0] || 'NO HAY';
    return 'linea=[' + lin.trim() + ']|largo=' + lin.trim().length + '|corte=' + CW_CORTE_LARGO; });
  T('avmCorte', () => {
    /* El corte se mide sobre el armador: una linea de mas de CW_CORTE_LARGO suelta su ultima
       pieza al renglon siguiente. Se fuerza con un THP largo de verdad. */
    const e = document.getElementById('thp'); const prev = e ? e.value : null;
    if (e) { e.value = '9999'; }
    const t = cuadTexto(); const i = t.indexOf('Válvula mitral:');
    const bl = t.slice(i, i + 260).split('\n').map(l => l.trim()).filter(l => l);
    if (e) e.value = prev;
    return JSON.stringify(bl.slice(1, 4)); });
  // (d3) _sanML y la vinieta de WinAnsi
  T('sanVinieta', () => { try { return '[' + _sanML('\u2022 hola') + ']' } catch (e) { return 'NO HAY _sanML (local de generarPDFReal)' } });
  // (e) la PAP media con la unidad cuando el campo trae un numero pelado
  T('papUnidad', () => {
    const e = document.getElementById('pap_med'); if (!e) return 'NO HAY CAMPO';
    const prev = e.value; e.value = '31';
    const t = cuadTexto(); const i = t.indexOf('PAP media');
    const r = i < 0 ? 'NO SALE' : t.slice(i, i + 24);
    e.value = prev;
    return r; });

  // (f) el PDF: la vinieta por su BYTE en WinAnsi, y el tamanio de los rectangulos
  const pdfRects = (plant) => {
    let cap = null; const rects = [];
    const J = window.jspdf && window.jspdf.jsPDF;
    if (!J) return { b:null, rects:[] };
    try { setPdfPlantilla(plant); } catch (e) {}
    window.jspdf.jsPDF = function (o) { const d = new J(o);
      const ar = d.rect; d.rect = function (x, y, w, h) { rects.push([Math.round(w), Math.round(h)]); return ar.apply(this, arguments) };
      d.save = function () { try { cap = this.output('datauristring') } catch (e) {} return this };
      return d; };
    try { _pdfAjustarA4(); } catch (e) {}
    window.jspdf.jsPDF = J;
    let b = null; try { b = atob(String(cap).split(',')[1]) } catch (e) {}
    return { b, rects };
  };
  await TA('pdfWordRects', async () => { const r = pdfRects('tipoword');
    const grandes = r.rects.filter(q => q[0] > 40 && q[1] > 6);
    return 'n=' + r.rects.length + '|grandes=' + grandes.length
      + '|lista=' + JSON.stringify(r.rects.slice(0, 16))
      + '|vinieta0x95=' + (r.b ? (r.b.split('\u0095').length - 1) : -1)
      + '|mitralSev=' + (r.b ? (r.b.indexOf('Insuficiencia mitral severa') >= 0) : 'NO'); });
  // (g) EL CONTROL MAS FUERTE: el PDF CLASICO no se movio
  /* ⚠️ EL CONTROL MAS FUERTE DE LA TANDA, Y VA POR LOS TEXTOS DIBUJADOS Y NO POR LOS BYTES: el
     PDF trae su fecha de creacion, asi que dos corridas del MISMO arbol dan bytes distintos -se
     midio: 34948 y 34950-. Lo que si es determinista es la lista de lo que doc.text estampa. */
  const pdfTextos = (plant) => {
    const out = []; let n = 0;
    const J = window.jspdf && window.jspdf.jsPDF;
    if (!J) return null;
    try { setPdfPlantilla(plant); } catch (e) {}
    window.jspdf.jsPDF = function (o) { const d = new J(o);
      const at = d.text; d.text = function (t) { n++; out.push(String(t)); return at.apply(this, arguments) };
      d.save = function () { return this };
      return d; };
    try { _pdfAjustarA4(); } catch (e) {}
    window.jspdf.jsPDF = J;
    return { n, txt: out.join('\u0001') };
  };
  await TA('pdfClasicoTextos', async () => { const r = pdfTextos('clasico');
    if (!r) return 'SIN jsPDF';
    let h = 0; for (let i = 0; i < r.txt.length; i++) { h = (h * 31 + r.txt.charCodeAt(i)) | 0; }
    return 'textos=' + r.n + '|chars=' + r.txt.length + '|hash=' + h; });
  await TA('pdfWordTextos', async () => { const r = pdfTextos('tipoword');
    if (!r) return 'SIN jsPDF';
    const items = r.txt.split('\u0001').filter(x => x.indexOf('Insuficiencia mitral') === 0
                                                  || x.indexOf('Estenosis aortica') === 0);
    return 'textos=' + r.n + '|itemsSuma=' + items.length + '|ej=' + (items[0] || 'NINGUNO').slice(0, 40); });
  /* LA VINIETA SE DIBUJA: se cuentan los circulos, que es lo unico que la prueba. */
  await TA('pdfWordVinietas', async () => {
    let circ = 0, cap = null;
    const J = window.jspdf && window.jspdf.jsPDF; if (!J) return 'SIN jsPDF';
    try { setPdfPlantilla('tipoword') } catch (e) {}
    window.jspdf.jsPDF = function (o) { const d = new J(o);
      const ac = d.circle; d.circle = function (x, y, r) { if (r <= 0.8) circ++; return ac.apply(this, arguments) };
      d.save = function () { try { cap = this.output('datauristring') } catch (e) {} return this };
      return d; };
    try { _pdfAjustarA4() } catch (e) {}
    window.jspdf.jsPDF = J;
    return 'circulitos=' + circ + '|items=' + cuadSumaItems(document.getElementById('en_suma').value).length; });
  await TA('pdfClasicoVinietas', async () => {
    let circ = 0;
    const J = window.jspdf && window.jspdf.jsPDF; if (!J) return 'SIN jsPDF';
    try { setPdfPlantilla('clasico') } catch (e) {}
    window.jspdf.jsPDF = function (o) { const d = new J(o);
      const ac = d.circle; d.circle = function (x, y, r) { if (r <= 0.8) circ++; return ac.apply(this, arguments) };
      d.save = function () { return this };
      return d; };
    try { _pdfAjustarA4() } catch (e) {}
    window.jspdf.jsPDF = J;
    return 'circulitos=' + circ; });
  T('scMotivoSinFevi', () => { const f = document.getElementById('fevi'); const prev = f.value;
    f.value = ''; const a = scMotivo({ tipo:'fsgl' });
    const g = document.getElementById('sgl_gls'); const pg = g.value; g.value = '';
    const b = scMotivo({ tipo:'fsgl' }); f.value = prev; g.value = pg;
    const c = scMotivo({ tipo:'fsgl' });
    return 'sinFevi=[' + a + ']|sinNada=[' + b + ']|conLosDos=[' + c + ']'; });
  try { setPdfPlantilla('clasico'); } catch (e) {}
  return R;
})()
