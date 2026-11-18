/* Cuerpo de la sonda de la TAREA 2 (18/11/2026) — la ficha de consulta de Hemodinamica, el
   traslado de pericardio y pulmon, y los globos y enlaces que apuntan a esas fichas.
   Vive aparte para que los acentos graves sean codigo normal (leccion de MEDIR-4b). */
async function (opt) {
  const R = {};
  const esperar = (ms) => new Promise(r => setTimeout(r, ms));
  const plano = (t) => String(t == null ? '' : t).replace(/\s+/g, ' ').trim();

  try { localStorage.setItem('ett_theme', opt.tema === 'claro' ? 'light' : 'dark'); } catch (e) {}
  try { if (typeof loadTheme === 'function') loadTheme(); } catch (e) {}
  R.tema = document.documentElement.classList.contains('light-mode') ||
           document.body.classList.contains('light-mode') ? 'claro' : 'oscuro';
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  ['modalAvisoEco', 'login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none'; });

  /* ── A · EL REPARTO ────────────────────────────────────────────────────────────────────── */
  try { if (typeof showTab === 'function') showTab('refs'); } catch (e) {}
  try { if (typeof refSubInit === 'function') refSubInit(); } catch (e) {}
  await esperar(200);
  const pan = (k) => document.getElementById('ref-sub-' + k);
  const entradasDe = (k) => { const q = pan(k);
    return q ? Array.prototype.map.call(q.querySelectorAll('.card-body[id^="ref-"]'),
      e => e.id.replace(/^ref-/, '')).join(',') : 'SIN PANEL'; };
  R.hemo = entradasDe('hemo');
  R.otros = entradasDe('otros');
  /* Ninguna entrada en DOS paneles: una clave repetida haria que refSubInit moviera la misma
     tarjeta dos veces y el medico la viera en una sola solapa. */
  const todas = {}; const dobles = [];
  ['calc','dim','fun','valv','ao','congenitas','cardiotox','hemo','otros'].forEach(k => {
    const q = pan(k); if (!q) return;
    Array.prototype.forEach.call(q.querySelectorAll('.card-body[id^="ref-"]'), e => {
      const id = e.id.replace(/^ref-/, '');
      if (todas[id]) dobles.push(id); todas[id] = (todas[id] || 0) + 1; }); });
  R.entradasTotal = Object.keys(todas).length;
  R.dobles = dobles.join(',');
  R.sueltas = Array.prototype.map.call(document.querySelectorAll('.card-body[id^="ref-"]'),
    e => e.id.replace(/^ref-/, '')).filter(id => !todas[id]).join(',');

  /* ── B · LA FICHA NUEVA ───────────────────────────────────────────────────────────────── */
  try { if (typeof refSubTab === 'function') refSubTab('hemo', document.getElementById('ref-subtab-hemo')); } catch (e) {}
  await esperar(150);
  const f = document.getElementById('ref-hemo');
  R.fichaExiste = !!f;
  if (f) {
    const h = f.previousElementSibling;
    R.cabeza = h ? plano(h.textContent) : 'SIN CABEZA';
    R.abreConToggle = h ? (String(h.getAttribute('onclick') || '').indexOf("toggleRef('hemo'") > -1) : false;
    if (f.style.display === 'none' && h) h.click();
    await esperar(200);
    R.abierta = getComputedStyle(f).display;
    R.titulos = f.querySelectorAll('div[style*="font-weight:700"][style*="accent2"]').length;
    /* Los pies de fuente: uno por bloque, en 10 px, empezando por «Fuente:». */
    const pies = Array.prototype.filter.call(f.querySelectorAll('div'),
      e => plano(e.textContent).indexOf('Fuente:') === 0 && !e.querySelector('div'));
    R.pies = pies.length;
    R.piesEn10 = pies.filter(e => getComputedStyle(e).fontSize === '10px').length;
    R.piesConFolio = pies.filter(e => /folio|hoja|Tabla|Ec\./.test(plano(e.textContent))).length;
    R.tablas = f.querySelectorAll('table').length;
    R.filas = f.querySelectorAll('table tr').length;
    R.chips = (f.textContent.match(/CRITERIO DE ECOSMART/g) || []).length;
    R.largo = plano(f.textContent).length;
    const t = plano(f.textContent);
    /* NINGUN texto compara dos fuentes ni dice que algo no se encontro ni que algo esta pendiente. */
    R.prohibidas = ['no coincide','difieren','discrepan','se contradicen','sin resolver',
      'no se encontr','ninguna fuente publica','pendiente de revisi','sin validar','a confirmar',
      'verificar a ojo','folio no comprobado','sin fuente vista']
      .filter(k => t.toLowerCase().indexOf(k.toLowerCase()) > -1).join(' | ');
    /* CERO dosis de farmacos. */
    R.dosis = ['µg/kg','mcg/kg','ug/kg','mg/kg/min','dobutamina','noradrenalina','milrinona']
      .filter(k => t.toLowerCase().indexOf(k.toLowerCase()) > -1).join(' | ');
    /* Lo que la orden manda que entre, una por una. */
    R.entra = {
      determinantes: t.indexOf('Contractilidad:') > -1 && t.indexOf('Ley de Starling') > -1,
      formulas: t.indexOf('La constante 80') > -1 && t.indexOf('Distensibilidad arterial pulmonar') > -1,
      normales: t.indexOf('2,5 a 4,0 l/min/m') > -1 && t.indexOf('0,3 a 2,0 unidades Wood') > -1,
      cuatroShocks: t.indexOf('Hipovol') > -1 && t.indexOf('Distributivo tard') > -1
        && t.indexOf('Obstructivo por taponamiento') > -1 && t.indexOf('lactato suele estar por encima de 2 mmol/l') > -1,
      monitoreo: t.indexOf('Swan-Ganz') > -1 && t.indexOf('PiCCO') > -1
        && t.indexOf('contrapulsaci') > -1 && t.indexOf('percut') > -1 && t.indexOf('ECMO venoarterial') > -1,
      fluidos: t.indexOf('elevaci') > -1 && t.indexOf('500 ml') > -1 && t.indexOf('10 a 15 %') > -1,
      htpVd: t.indexOf('Poscapilar y precapilar combinada') > -1 && t.indexOf('Falla del ventr') > -1,
      taponamiento: t.indexOf('Tr') > -1 && t.indexOf('ada de Beck') > -1 && t.indexOf('200 a 300 ml') > -1,
      shockCardio: t.indexOf('Estadios:') > -1 && t.indexOf('Stevenson') > -1
    };
    /* Lo que la orden manda que NO entre, una por una. */
    R.noEntra = {
      rvs1170: t.indexOf('1.170') > -1,
      braunwald1100: t.indexOf('1.100 (700') > -1 || t.indexOf('700 a 1.600') > -1,
      tapsePsap: t.indexOf('TAPSE') > -1 || t.indexOf('0,19') > -1,
      enclavada18: t.indexOf('Hipotensi') > -1 && t.indexOf('30 min') > -1,
      caudales: t.indexOf('Impella') > -1 || t.indexOf('TandemHeart') > -1 || t.indexOf('7 l/min') > -1,
      vasoplejia: t.indexOf('vasopl') > -1 || t.indexOf('de 800') > -1 || t.indexOf('< 800') > -1,
      euroscore: t.indexOf('EuroSCORE') > -1 || t.indexOf('STS') > -1,
      sdra: t.indexOf('SDRA') > -1,
      bandas: t.indexOf('1.400') > -1 && t.indexOf('miocardiopat') < 0
    };
    /* Geometria: nada recortado, y las tablas anchas desplazan DENTRO de su envoltorio. */
    let rec = 0, desbTabla = 0, scrollers = 0, scrollMax = 0;
    Array.prototype.forEach.call(f.querySelectorAll('div,td,th,b'), e => {
      if (e.children.length) return;
      if (e.scrollWidth - e.clientWidth > 1) rec++;
    });
    Array.prototype.forEach.call(f.querySelectorAll('div[style*="overflow-x"]'), e => {
      scrollers++; const d = e.scrollWidth - e.clientWidth; if (d > scrollMax) scrollMax = d; });
    Array.prototype.forEach.call(f.querySelectorAll('table'), e => {
      const cont = e.parentElement;
      if (cont && getComputedStyle(cont).overflowX === 'auto') return;
      if (e.getBoundingClientRect().width - cont.clientWidth > 1) desbTabla++;
    });
    R.recortados = rec; R.tablaDesborda = desbTabla; R.scrollers = scrollers; R.scrollerMax = scrollMax;
    R.fichaScrollX = f.scrollWidth - f.clientWidth;
  }

  /* ── C · LOS GLOBOS Y ENLACES QUE APUNTAN A LAS FICHAS MUDADAS ─────────────────────────── */
  R.refAssert = (typeof _vinfoRefAssert === 'function') ? _vinfoRefAssert().join(' | ') : 'SIN FN';
  const irA = (clave) => {
    try {
      const ok = refVerReferencia(clave);
      const destino = VINFO_REF[clave];
      const cuerpo = document.getElementById('ref-' + destino);
      const card = cuerpo ? cuerpo.closest('.card') : null;
      const p = card ? card.closest('.ref-subpanel') : null;
      return [ok ? 'ok' : 'NO', destino, p ? p.id.replace(/^ref-sub-/, '') : 'SIN PANEL',
              cuerpo ? getComputedStyle(cuerpo).display : 'SIN CUERPO'].join('/');
    } catch (e) { return 'EXC ' + String(e.message).slice(0, 60); }
  };
  R.pulBalik = irA('pul-balik');
  R.popVaso = irA('pop-vaso');
  R.popSenales = irA('pop-senales');
  /* El buscador: su indice se arma recorriendo los encabezados, asi que la ficha nueva entra sola. */
  try { if (typeof _refIndiceArmar === 'function') _refIndiceArmar(); } catch (e) {}
  const IDX = (typeof _refIndiceArmar === 'function') ? _refIndiceArmar(true) : null;
  R.indice = IDX ? IDX.length : 'SIN INDICE';
  R.indiceTieneHemo = IDX ? IDX.some(x => String(x.ficha || x.id || '') === 'hemo') : 'SIN INDICE';
  R.indiceSec = IDX ? (IDX.filter(x => String(x.ficha || x.id || '') === 'hemo')
    .map(x => String(x.sec || x.seccion || '')).join(',')) : 'SIN INDICE';
  /* La fila duplicada del derrame pleural salio de la ficha del posoperatorio. */
  const fp = document.getElementById('ref-pop'), fu = document.getElementById('ref-pulmon');
  R.popFilas = fp ? fp.querySelectorAll('table tr').length : 'NO';
  R.popChips = fp ? (fp.textContent.match(/CRITERIO DE ECOSMART/g) || []).length : 'NO';
  R.popD6 = fp ? (plano(fp.textContent).indexOf('D6_11') > -1) : 'NO';
  R.popVolumen = fp ? (plano(fp.textContent).indexOf('Volumen aproximado del derrame pleural') > -1) : 'NO';
  R.popGrados = fp ? (plano(fp.textContent).indexOf('Grados del derrame pleural') > -1) : 'NO';
  R.pulD6 = fu ? (plano(fu.textContent).indexOf('D6_11') > -1) : 'NO';
  R.pulVolumen = fu ? (plano(fu.textContent).indexOf('Volumen aproximado del derrame pleural') > -1) : 'NO';
  R.docScrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  return R;
}
