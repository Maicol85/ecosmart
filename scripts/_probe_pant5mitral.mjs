/*
 * _probe_pant5mitral.mjs - la mitral del ETE: inventario de duplicados y su sincronia
 * (PANT-5, commit 6). Nombre propio: verificado con ls contra HEAD, no existia.
 * Mide las CUATRO premisas de la orden antes de tocar nada, en los DOS sentidos.
 *   node scripts/_probe_pant5mitral.mjs --file <index.html>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const FILE = arg('--file') || (RAIZ + '/index.html');

const JS = `(async () => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  const o = {};
  const esperar = (ms) => new Promise(r => setTimeout(r, ms));
  try { showTab('ete') } catch (e) { o.tabErr = String(e) }
  /* Las tres secciones se abren por su encabezado real. */
  ['mediciones-mitral','teer','morfologia-vm'].forEach(k => {
    const h = document.querySelector('[onclick*="' + k + '"]'); if (h) h.click();
  });
  Array.prototype.slice.call(document.querySelectorAll('h2.card-head')).forEach(h => {
    const t = h.textContent || '';
    if (/Mediciones ETE|Criterios TEER|Morfolog.a y clasificaci/.test(t)) {
      const m = (h.getAttribute('onclick') || '').match(/'([a-z0-9-]+)'/);
      if (m) { const s = document.getElementById('ete-seccion-' + m[1]);
        if (s && getComputedStyle(s).display === 'none') h.click() }
    }
  });
  const V = (id) => { const e = document.getElementById(id); return e ? String(e.value) : 'NO EXISTE' };
  const S = async (id, v) => { const e = document.getElementById(id); if (!e) { o['falta_' + id] = 1; return }
    e.focus(); e.value = v;
    e.dispatchEvent(new Event('input', { bubbles:true }));
    e.dispatchEvent(new Event('change', { bubbles:true }));
    await esperar(420);   /* el debounce de los espejos es de 220 ms */
  };
  /* ---- PREMISA (i): la longitud de los velos de Mediciones ETE -> Criterios TEER ---- */
  await S('ete_lva', '24'); await S('ete_lvp', '12');
  o.i_lva = { origen: V('ete_lva'), destino: V('teer_lva') };
  o.i_lvp = { origen: V('ete_lvp'), destino: V('teer_lvp') };
  /* y el sentido INVERSO, sobre campos limpios */
  await S('ete_lva', ''); await S('ete_lvp', '');
  await S('teer_lva', '26'); await S('teer_lvp', '9');
  o.i_inv_lva = { origen: V('teer_lva'), destino: V('ete_lva') };
  o.i_inv_lvp = { origen: V('teer_lvp'), destino: V('ete_lvp') };
  /* ---- PREMISA (ii): la profundidad de coaptacion ---- */
  await S('teer_prof_flail', '14');
  o.ii = { teer: V('teer_prof_flail'), ete: V('ete_prof_coapt') };
  await S('ete_prof_coapt', '8');
  o.ii_inv = { ete: V('ete_prof_coapt'), teer: V('teer_prof_flail') };
  /* el area: TRES campos */
  await S('avm_plan', '3.2');
  o.area = { avm_plan: V('avm_plan'), teer: V('teer_area_mitral'), ete: V('ete_area_mitral') };
  /* ---- PREMISA (iii): etiologia, Carpentier y mecanismo contra Valvulas ---- */
  const sel = async (id, v) => { const e = document.getElementById(id); if (!e) { o['falta_' + id] = 1; return }
    e.value = v; e.dispatchEvent(new Event('change', { bubbles:true })); await esperar(420) };
  /* ⚠️ LA ETIOLOGIA DEL ETE SE EMPAREJA CON vm_morf DE VALVULAS -«Morfologia»-, que es lo que
     eteVmPropagar sincroniza; im_etiologia y vm_etiologia NO EXISTEN. Y el valor se toma
     de las propias opciones del selector: 'degenerativa' no es una de ellas, asi que la primera
     version dejaba el campo en cadena vacia y medía dos vacios. */
  const opt1 = (id) => { const e = document.getElementById(id);
    if (!e || !e.options) return ''; for (let i = 1; i < e.options.length; i++) {
      if (e.options[i].value) return e.options[i].value } return '' };
  o.optsEtio = Array.prototype.slice.call((document.getElementById('ete_etiologia')||{options:[]}).options).map(x => x.value).join('|');
  o.optsMorf = Array.prototype.slice.call((document.getElementById('vm_morf')||{options:[]}).options).map(x => x.value).join('|').slice(0, 160);
  await sel('ete_etiologia', opt1('ete_etiologia'));
  o.iii_etio = { ete: V('ete_etiologia'), valv: V('vm_morf') };
  /* y el sentido inverso, con la bandera de ETE encendida -que es la guarda deliberada- */
  const fl = document.getElementById('ete-es-ete'); if (fl && !fl.checked) { fl.checked = true;
    try { fl.dispatchEvent(new Event('change', { bubbles:true })) } catch (e) {} }
  await sel('vm_morf', opt1('vm_morf'));
  o.iii_etio_inv = { valv: V('vm_morf'), ete: V('ete_etiologia') };
  await sel('ete_carpentier', 'II');
  o.iii_carp = { ete: V('ete_carpentier'), valv: V('vm_carp'), ro: V('vm_carpentier') };
  await sel('ete_mecanismo', (document.getElementById('ete_mecanismo') || { options: [] }).options.length > 1
    ? document.getElementById('ete_mecanismo').options[1].value : '');
  o.iii_mec = { ete: V('ete_mecanismo'), valv: V('vm_mecanismo') };
  /* el sentido inverso del Carpentier */
  await sel('vm_carp', 'III');
  o.iii_carp_inv = { valv: V('vm_carp'), ete: V('ete_carpentier') };
  /* ---- PREMISA (iv): la tabla «Datos usados en el dibujo» ---- */
  /* ⚠️ LA TABLA «Datos usados en el dibujo» LA PUEBLA m3dTabla Y SOLO CON EL PANEL ABIERTO:
     sin tocar su boton la tabla existe y esta VACIA -medido: 0 caracteres-, que es un
     denominador vacio y no «el texto no se corta». */
  try { const b3 = document.getElementById('m3d-btn'); if (b3) b3.click() } catch (e) { o.m3dErr = String(e) }
  await esperar(900);
  try { if (typeof m3dTabla === 'function') m3dTabla() } catch (e) {}
  await esperar(300);
  const tab = document.querySelector('#m3d-tabla, [id*="m3d-tabla"]');
  o.iv_tabla = !!tab;
  const cortados = [];
  Array.prototype.slice.call(document.querySelectorAll('#ete-seccion-mediciones-mitral table td, #ete-seccion-mediciones-mitral table th, [id*="m3d"] td, [id*="m3d"] th')).forEach(c => {
    if (c.scrollWidth > c.clientWidth + 2 && c.clientWidth > 0) cortados.push((c.textContent || '').trim().slice(0, 36));
    const cs = getComputedStyle(c);
    if (cs.textOverflow === 'ellipsis' || cs.whiteSpace === 'nowrap') cortados.push('[nowrap] ' + (c.textContent || '').trim().slice(0, 30));
  });
  o.iv_cortados = cortados.slice(0, 10);
  /* el texto de la tabla, para ver si llega truncado con puntos suspensivos */
  const txtTab = tab ? (tab.textContent || '') : '';
  o.iv_chars = txtTab.length;
  o.iv_puntos = (txtTab.match(/\\u2026|\\.\\.\\./g) || []).length;
  o.iv_muestra = txtTab.replace(/\\s+/g, ' ').trim().slice(0, 240);
  /* ---- LA DISPOSICION: existe la fila nueva? ---- */
  const R = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width*10)/10, h: Math.round(r.height*10)/10, x: Math.round(r.x*10)/10, y: Math.round(r.y*10)/10 } };
  o.fila = R(document.getElementById('etem-fila'));
  o.secMed = R(document.getElementById('ete-seccion-mediciones-mitral'));
  return o;
})()`;

const nav = await _pw.chromium.launch({ channel: 'chrome' });
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const pg = await ctx.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(String(e).slice(0, 130)));
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
await pg.waitForTimeout(1200);
const r = await Promise.race([pg.evaluate(JS),
  new Promise((_, rj) => setTimeout(() => rj(new Error('timeout')), 120000))]);
await ctx.close(); await nav.close();
console.log('(i)   velos ETE -> TEER   : lva ' + JSON.stringify(r.i_lva) + ' | lvp ' + JSON.stringify(r.i_lvp));
console.log('(i)   velos TEER -> ETE   : lva ' + JSON.stringify(r.i_inv_lva) + ' | lvp ' + JSON.stringify(r.i_inv_lvp));
console.log('(ii)  coapt TEER -> ETE   : ' + JSON.stringify(r.ii) + ' | ETE -> TEER: ' + JSON.stringify(r.ii_inv));
console.log('      area (tres campos)  : ' + JSON.stringify(r.area));
console.log('(iii) etiologia           : ' + JSON.stringify(r.iii_etio) + ' | inverso ' + JSON.stringify(r.iii_etio_inv) + '\n      opciones ETE: ' + r.optsEtio + '\n      opciones vm_morf: ' + r.optsMorf);
console.log('(iii) Carpentier          : ' + JSON.stringify(r.iii_carp) + ' | inverso ' + JSON.stringify(r.iii_carp_inv));
console.log('(iii) mecanismo           : ' + JSON.stringify(r.iii_mec));
console.log('(iv)  tabla del dibujo    : existe=' + r.iv_tabla + ' chars=' + r.iv_chars + ' puntos=' + r.iv_puntos +
  ' cortados=' + JSON.stringify(r.iv_cortados));
console.log('      muestra: ' + r.iv_muestra);
console.log('fila nueva: ' + JSON.stringify(r.fila) + ' | secMed ' + JSON.stringify(r.secMed));
console.log('faltan ids: ' + JSON.stringify(Object.keys(r).filter(k => k.startsWith('falta_'))));
console.log('errores de pagina: ' + errs.length + ' ' + (errs[0] || ''));
