#!/usr/bin/env node
/**
 * _probe_corimg.mjs - la sonda DEDICADA del commit 5 de la tanda de correcciones (2026-10-30).
 *
 * Contesta el inventario 5a y mide (a), (b) y (c) GENERANDO EL PDF DE VERDAD, que es lo que la
 * orden pide: espia el constructor de jsPDF y cuenta las llamadas a `addImage`, asi que no se
 * cree lo que diga una funcion de la app sobre si el dibujo entro.
 *
 * ⚠️ EL MARCADOR DEL PARAMETRO ES __CFG__ Y NO CFG: un replace de la cadena «CFG» pega
 * primero en IMG_CFG_KEY, que esta en el cuerpo, y deja el parametro sin definir.
 *
 * ⚠️ EL ARNES DEL A/B GENERAL NO PUEDE MEDIR ESTO. Sus escenas montan campos y nunca aprietan
 * «Incluir en el PDF», que es un GESTO; y el estado de inclusion vive en `imgSlots`, en memoria.
 *
 * ⚠️ LA COPIA DE HEAD VA EN EL DIRECTORIO DEL PROYECTO Y NO EN /tmp: el archivo carga su
 * tipografia por ruta RELATIVA.
 *
 *   node scripts/_probe_corimg.mjs --file <ruta> --out <json>
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
const OUTF = arg('--out') || '/tmp/cor/img.json';

/* Monta la orejuela con datos. NO guarda el estudio: ese es justo el escenario (b). */
const MONTAR = `(async (cfg) => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  try { if (typeof imgVaciar === 'function') imgVaciar() } catch (e) {}
  /* El interruptor de Config, por su clave de localStorage: es lo que lee imgGuardadoActivo. */
  try { localStorage.setItem(IMG_CFG_KEY, cfg ? '1' : '0') } catch (e) {}
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  S('oai_morfologia', 'cactus'); S('oai_ostium_diam', '26');
  S('oai_profundidad', '37'); S('oai_vel_vac', '18');
  await new Promise(r => setTimeout(r, 400));
  return { cfg: (typeof imgGuardadoActivo === 'function') ? imgGuardadoActivo() : 'SIN FN',
           uuid: (typeof _imgUuidActual !== 'undefined') ? String(_imgUuidActual) : 'SIN VAR',
           slots: (typeof imgSlots !== 'undefined') ? imgSlots.filter(s => s && s.dataURL).length : -1 };
})(__CFG__)`;

/* Aprieta el boton de verdad y devuelve lo que se ve. */
const CLIC = `(async () => {
  const b = document.getElementById('oai-esq-pdf');
  if (!b) return { err: 'NO HAY BOTON' };
  b.click();
  await new Promise(r => setTimeout(r, 900));
  const est = document.getElementById('oai-esq-estado');
  return { txt: String(b.textContent || '').trim(),
           primary: b.classList.contains('btn-primary'),
           pressed: b.getAttribute('aria-pressed'),
           estado: String((est || {}).textContent || '').trim(),
           slots: (typeof imgSlots !== 'undefined') ? imgSlots.filter(s => s && s.dataURL).length : -1,
           esquemas: (typeof imgSlots !== 'undefined') ? imgSlots.filter(s => s && s.esquema).length : -1,
           incluido: (typeof esqEstaIncluido === 'function') ? esqEstaIncluido('orejuela') : 'SIN FN' };
})()`;

/* (c) · GUARDAR EL ESTUDIO Y LEER EL DISCO. Es la unica forma de probar que la imagen
   «pendiente» se guarda sola: se le pregunta a CeiboImg, no a la app.
   ⚠️ guardarInforme SALE TEMPRANO SIN NOMBRE NI DOCUMENTO del paciente y no llama al callback,
   asi que la promesa no resuelve nunca: es el cuelgue de 27 minutos que el D-11 pago. Los ids
   son nombre / ci / fecha -no pac_nombre ni pac_id, que no existen: la primera version los uso
   y el reloj salto a los 20 s-. Por eso
   el nombre se pone aca y la espera va con reloj. */
const GUARDAR = `(async () => {
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); return e.value };
  S('nombre', 'Prueba Cor Cinco'); S('ci', '9999999'); S('fecha', '2026-10-30');
  try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
  /* ⚠️ NO SE PASA POR guardarInforme, Y SE DECLARA. Su cascada tiene una segunda compuerta
     -el gate de severidades valvulares, que abre un modal- y la promesa no resolvia ni con
     nombre, documento y fecha puestos: el reloj saltaba a los 20 s en las dos corridas. Lo que
     (c) necesita probar es que la imagen PENDIENTE llega al disco cuando el estudio se guarda, y
     el unico eslabon que hace eso es imgPersistir(uuid), que es lo que guardarInforme llama. Se
     lo llama directo, con un uuid sintetico, y despues se le pregunta AL DISCO. */
  const uuid = 'cor5cor5cor5cor5cor5cor5cor5cor5';
  const ok = await Promise.race([
    (typeof imgPersistir === 'function') ? imgPersistir(uuid) : Promise.resolve('SIN FN'),
    new Promise(r => setTimeout(() => r('RELOJ 20 s'), 20000))
  ]);
  await new Promise(r => setTimeout(r, 600));
  let enDisco = 'sin uuid', esqs = 'sin uuid';
  if (uuid && typeof CeiboImg !== 'undefined') {
    const im = await CeiboImg.leer(uuid);
    enDisco = im ? im.length : 'null';
    const es = CeiboImg.esquemas ? await CeiboImg.esquemas(uuid) : [];
    esqs = es ? es.length : 'null';
  }
  return { guardado: ok, uuid: String(uuid), imgsEnDisco: enDisco, esqsEnDisco: esqs,
           slots: (typeof imgSlots !== 'undefined') ? imgSlots.filter(s => s && s.dataURL).length : -1 };
})()`;

/* EL PDF GENERADO DE VERDAD, espiando addImage. */
const PDF = `(async () => {
  if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) return { err: 'SIN JSPDF' };
  const Orig = window.jspdf.jsPDF;
  const reg = { imgs: 0, paginas: [], txt: '' };
  try {
    window.jspdf.jsPDF = function (...a) {
      const d = new Orig(...a);
      const oa = d.addImage.bind(d);
      d.addImage = function (...x) { reg.imgs++; try { return oa(...x) } catch (e) { return null } };
      const ot = d.text.bind(d);
      d.text = function (t, ...x) { reg.txt += ' | ' + String(t); return ot(t, ...x) };
      const os = d.save.bind(d);
      d.save = function () { return true };
      return d;
    };
    Object.keys(Orig).forEach(k => { try { window.jspdf.jsPDF[k] = Orig[k] } catch (e) {} });
    /* ⚠️ generarPDF A SECAS NO EMITE NADA EN ESTE ARNES, Y EL DENOMINADOR LO DELATO: el
       espia devolvia CERO llamadas a text —ni una—, o sea que el PDF no se generaba y «0
       imagenes» no probaba nada. El que emite de verdad es _pdfAjustarA4, que es lo que el
       arnes general de esta casa usa desde la tanda A. */
    try { if (typeof _pdfAjustarA4 === 'function') await _pdfAjustarA4();
          else if (typeof generarPDF === 'function') await generarPDF() } catch (e) { reg.err = String(e).slice(0, 140) }
    await new Promise(r => setTimeout(r, 1200));
  } finally { window.jspdf.jsPDF = Orig; }
  reg.hojaImgs = reg.txt.indexOf('Imágenes del estudio') > -1;
  reg.txt = reg.txt.slice(0, 400);
  return reg;
})()`;

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE };
try {
  for (const cfg of [false, true]) {
    const pg = await b.newPage({ viewport: { width: 1400, height: 900 } });
    pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([e.message.slice(0, 150)]) });
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
    await pg.waitForTimeout(1500);
    const k = cfg ? 'cfgON' : 'cfgOFF';
    OUT[k] = {};
    OUT[k].montaje = await pg.evaluate(MONTAR.replace('__CFG__', JSON.stringify(cfg)));
    OUT[k].pdfAntes = await pg.evaluate(PDF);
    OUT[k].clic1 = await pg.evaluate(CLIC);
    OUT[k].pdfDespues = await pg.evaluate(PDF);
    OUT[k].guardar = await pg.evaluate(GUARDAR);    /* (c) · la imagen pendiente */
    OUT[k].clic2 = await pg.evaluate(CLIC);          /* el interruptor, de vuelta */
    OUT[k].pdfQuitado = await pg.evaluate(PDF);
    console.log('-- ' + k + ' -- antes=' + OUT[k].pdfAntes.imgs + ' despues=' + OUT[k].pdfDespues.imgs
      + ' quitado=' + OUT[k].pdfQuitado.imgs + ' | boton1=' + JSON.stringify(OUT[k].clic1.txt)
      + ' primary=' + OUT[k].clic1.primary + ' | boton2=' + JSON.stringify(OUT[k].clic2.txt)
      + ' | (c) guardado=' + OUT[k].guardar.guardado + ' imgsEnDisco=' + OUT[k].guardar.imgsEnDisco
      + ' esqsEnDisco=' + OUT[k].guardar.esqsEnDisco);
    await pg.close();
  }
} catch (e) { OUT._err = String(e).slice(0, 250) }
try { await b.close() } catch (e) {}
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF);
