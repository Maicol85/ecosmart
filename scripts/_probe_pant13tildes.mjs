#!/usr/bin/env node
/**
 * _probe_pant13tildes.mjs - censo de texto visible sin tilde (PANT-13, commit 1b).
 * Recorre, en el navegador, TODO el texto visible del modulo del corazon maestro y del
 * diagrama del pulmon -nodos de texto, title, aria-label, placeholder, alt- y lista las
 * palabras que deberian llevar tilde y no la llevan.
 *   node scripts/_probe_pant13tildes.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const br = await _pw.chromium.launch({ channel: 'chrome' });
const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 130)));
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
await pg.waitForTimeout(1400);
const r = await pg.evaluate(`(async () => {
  const R = {}; const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  const Q = String.fromCharCode(39);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  /* las palabras que SI llevan tilde, con su correccion */
  const PAL = { 'corazon':'corazon', 'Corazon':'Corazon', 'linea':'linea', 'lineas':'lineas',
    'Linea':'Linea', 'Lineas':'Lineas', 'consolidacion':'consolidacion', 'Consolidacion':'Consolidacion',
    'aereo':'aereo', 'Aereo':'Aereo', 'traves':'traves', 'Tetralogia':'Tetralogia',
    'anomalia':'anomalia', 'Anomalia':'Anomalia', 'circulacion':'circulacion',
    'comunicacion':'comunicacion', 'Comunicacion':'Comunicacion', 'seccion':'seccion',
    'opcion':'opcion', 'direccion':'direccion', 'Direccion':'Direccion', 'conexion':'conexion',
    'Conexion':'Conexion', 'anomala':'anomala', 'region':'region', 'patron':'patron',
    'informacion':'informacion', 'descripcion':'descripcion', 'diagnostico':'diagnostico',
    'hemitorax':'hemitorax', 'torax':'torax', 'apice':'apice', 'ecografico':'ecografico',
    'ecografia':'ecografia', 'pulmon':'pulmon', 'Pulmon':'Pulmon', 'coartacion':'coartacion',
    'Coartacion':'Coartacion', 'subaortica':'subaortica', 'aortica':'aortica', 'valvula':'valvula',
    'Valvula':'Valvula', 'valvulas':'valvulas', 'funcion':'funcion', 'Funcion':'Funcion',
    'presion':'presion', 'obstruccion':'obstruccion', 'transposicion':'transposicion',
    'Transposicion':'Transposicion', 'reparacion':'reparacion', 'dilatacion':'dilatacion',
    'fenestracion':'fenestracion', 'tunel':'tunel', 'Tunel':'Tunel', 'tambien':'tambien',
    'Tambien':'Tambien', 'segun':'segun', 'Segun':'Segun', 'asi':'asi', 'aqui':'aqui',
    'grafico':'grafico', 'version':'version', 'omision':'omision', 'pestania':'pestania',
    'pestanias':'pestanias', 'Que':'Que', 'sistolica':'sistolica', 'diastolica':'diastolica',
    'ultimo':'ultimo', 'unico':'unico', 'Unico':'Unico', 'proximo':'proximo', 'numero':'numero',
    'Numero':'Numero', 'minimo':'minimo', 'maximo':'maximo', 'practica':'practica',
    'ilustracion':'ilustracion', 'Mas':'Mas', 'despues':'despues', 'ademas':'ademas',
    'esquematico':'esquematico', 'anatomia':'anatomia', 'Anatomia':'Anatomia', 'ninguna':'ninguna',
    'cardiaca':'cardiaca', 'Cardiaca':'Cardiaca', 'cardiacas':'cardiacas', 'Frecuencia':'Frecuencia' };
  delete PAL['ninguna']; delete PAL['Frecuencia'];
  const CL = Object.keys(PAL);
  /* recoge el texto visible de un subarbol: nodos de texto + los cuatro atributos */
  const censar = (raiz, nombre) => {
    const out = [];
    if (!raiz) return [{ err: 'NO ' + nombre }];
    const push = (txt, de) => {
      const t = String(txt || ''); if (!t.trim()) return;
      CL.forEach(p => { const re = new RegExp('(^|[^A-Za-zÀ-ÿ])' + p + '($|[^A-Za-zÀ-ÿ])');
        if (re.test(t)) out.push({ pal: p, de: de, txt: t.trim().slice(0, 110) }) });
    };
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, null);
    let n; while ((n = w.nextNode())) { if (n.parentElement && n.parentElement.tagName !== 'SCRIPT' && n.parentElement.tagName !== 'STYLE') push(n.nodeValue, 'texto') }
    raiz.querySelectorAll('[title],[aria-label],[placeholder],[alt]').forEach(e => {
      ['title','aria-label','placeholder','alt'].forEach(a => { if (e.hasAttribute(a)) push(e.getAttribute(a), a + ' de ' + (e.id || e.tagName)) });
    });
    ['title','aria-label'].forEach(a => { if (raiz.hasAttribute && raiz.hasAttribute(a)) push(raiz.getAttribute(a), a + ' de la raiz') });
    return out;
  };
  /* ===== (A) EL MODULO DEL CORAZON MAESTRO ===== */
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
  await esperar(400);
  const bot = EL('cc3d-abrir'); if (bot) bot.click();
  await esperar(3000);
  R.cmAbierto = EL('cc3d-panel') ? getComputedStyle(EL('cc3d-panel')).display : 'NO';
  /* el globo abierto, para censar sus textos */
  const ib = EL('cm3d-ib'); if (ib) ib.click();
  await esperar(400);
  /* y el modo Explorar, que es el que pinta los controles y la tabla */
  const bExp = Array.prototype.filter.call(document.querySelectorAll('.cm3d-md'), b => b.getAttribute('data-m') === 'explorar')[0];
  if (bExp) bExp.click();
  await esperar(700);
  R.cmWrap = censar(EL('cc3d-wrap'), 'cc3d-wrap');
  R.cmPanel = censar(EL('cc3d-panel'), 'cc3d-panel');
  /* ===== (B) EL DIAGRAMA DEL PULMON ===== */
  try { const b2 = bq('showTab(' + Q + 'pericardio' + Q); if (b2) b2.click() } catch (e) {}
  await esperar(500);
  /* sembrar hallazgos para que la descripcion tenga texto (denominador) */
  const set = (id, v) => { const e = EL(id); if (!e) return 'NO'; if (e.type === 'checkbox') { e.checked = !!v } else { e.value = v }
    e.dispatchEvent(new Event('change', { bubbles: true })); e.dispatchEvent(new Event('input', { bubbles: true })); return 'ok' };
  R.sembrado = {};
  /* los ids reales salen de pulDibEstado: llevan prefijo pua_ y no pul_ */
  R.sembrado.pua_derrame = set('pua_derrame', 'si');
  R.sembrado.pua_derrame_der = set('pua_derrame_der', 'moderado');
  R.sembrado.pua_derrame_izq = set('pua_derrame_izq', 'severo');
  R.sembrado.pua_lineasb = set('pua_lineasb', 'presentes');
  R.sembrado.pua_z_ant_d = set('pua_z_ant_d', true);
  R.sembrado.pua_z_lat_d = set('pua_z_lat_d', true);
  R.sembrado.pua_consol = set('pua_consol', 'si');
  R.sembrado.pua_consol_lado = set('pua_consol_lado', 'der');
  R.sembrado.pua_consol_bronco = set('pua_consol_bronco', 'con');
  R.sembrado.pua_punto = set('pua_punto', 'si');
  R.sembrado.pua_desliz_lado = set('pua_desliz_lado', 'derecho');
  R.camposPul = Array.prototype.map.call(document.querySelectorAll('[id^=pua_]'), e => e.id).slice(0, 40).join(' ');
  if (typeof window.pulDibSync === 'function') { try { window.pulDibSync() } catch (e) {} }
  await esperar(600);
  R.pulDesc = (EL('pul-dib-desc') || {}).textContent;
  R.pulCaja = censar(EL('pul-dib-caja'), 'pul-dib-caja');
  const sec = EL('pul-dib-caja') ? EL('pul-dib-caja').closest('.card, section, .sacc') : null;
  R.pulSec = censar(sec, 'seccion del pulmon');
  return R;
})()`).catch(e => ({ EXC: String(e).slice(0, 260) }));
r.errores = errs.slice(0, 5);
console.log(JSON.stringify(r, null, 1));
await pg.close(); await br.close();
