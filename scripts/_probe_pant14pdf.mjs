#!/usr/bin/env node
/**
 * _probe_pant14pdf.mjs - «Incluir en el PDF» DE PUNTA A PUNTA, con el gesto real (PANT-14, c2).
 * Recorre el camino del medico paso por paso y mide EN CADA PASO: el estado del boton, lo que
 * el registro de inclusion guarda, lo que el recolector emite y la imagen que llega al PDF
 * -tamanio, pixeles muestreados, ni negra ni blanca-.
 * Los valores se ponen con un gesto -los selectores con su evento change, los botones con un
 * click real-; nunca escribiendo en el estado del dibujo.
 *   node scripts/_probe_pant14pdf.mjs [--file <html>] [--caso <nombre>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const SOLO = arg('--caso');
const br = await _pw.chromium.launch({ channel: 'chrome' });

/* LOS ESCENARIOS. Cada uno dice que campos carga el medico y en que sub-pestania viven. */
/* ⚠️ LAS ESCENAS SON LAS QUE EL MODULO LEE HOY, y eso se midio primero sobre `cmDesdeEstudio`:
   las lesiones que llegan al dibujo desde el estudio son la transposicion, las cinco de
   `CM_MAPA` -CIA, CIV, ductus, ventana aortopulmonar y conexion venosa anomala-, la cava
   izquierda y Eisenmenger. Fallot y la coartacion TODAVIA NO SE LEEN -son los commits 4 a 6-,
   asi que un caso con Fallot mediria el boton apagado y no diria nada del boton. `vacio` es el
   control negativo: sin nada cargado el boton queda apagado con su aviso.
   Las opciones de cada selector se verificaron una por una contra su marcado. */
const CASOS = [
  { n:'ciaCiv',  sub:'congenitas2', campos:[['ete_cia_tipo','secundum'],['ete_civ_tipo','perimembranosa']] },
  { n:'dap',     sub:'congenitas',  campos:[['dap_tipo','restrictivo']] },
  { n:'tga',     sub:'congenitas2', campos:[['tga_tipo','dtga']] },
  { n:'vacio',   sub:'congenitas',  campos:[] },
  /* los CUATRO estudios del commit 7: las lesiones que esta tanda conecta */
  { n:'p14fallot', sub:'congenitas2', campos:[['tdf_func_vd','normal'],['ip_grado','Severa'],['tdf_civ_residual','si'],['tdf_ep_stent','si']] },
  { n:'p14coaEa',  sub:'congenitas',  campos:[['coa_istmo','8'],['coa_situacion','nativa'],['esub_tipo','membrana']] },
  { n:'p14dsav',   sub:'congenitas2', campos:[['dsav_tipo','completo'],['dsav_regurg_av_izq','severa']] },
  { n:'p14fontan', sub:'congenitas2', campos:[['fontan_tipo','extra'],['fontan_fenestracion','presente']] },
];

const CUERPO = (caso) => `(async () => {
  const R = { pasos: [] }; const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  const Q = String.fromCharCode(39);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  /* GESTO sobre un control: se escribe el valor y se despachan los MISMOS eventos que el
     navegador despacha cuando el medico elige una opcion. */
  const gesto = (id, v) => { const e = EL(id); if (!e) return 'NO EXISTE ' + id;
    if (e.tagName === 'SELECT') { const ok = Array.prototype.some.call(e.options, o => o.value === v);
      if (!ok) return 'SIN OPCION ' + v + ' en ' + id + ' [' + Array.prototype.map.call(e.options, o => o.value).join(',') + ']' }
    if (e.type === 'checkbox') { e.checked = (v === 'si' || v === true) } else { e.value = v }
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return 'ok=' + (e.type === 'checkbox' ? e.checked : e.value);
  };
  const estadoBoton = () => { const b = EL('cm3d-pdfb'), n = EL('cm3d-pdfn');
    const cj = b ? b.getBoundingClientRect() : null;
    return { existe: !!b, apagado: b ? !!b.disabled : null, texto: b ? b.textContent.trim() : null,
             pres: b ? b.getAttribute('aria-pressed') : null,
             clase: b ? (b.className.indexOf('btn-primary') >= 0 ? 'primary' : 'ghost') : null,
             aviso: n ? n.textContent.trim() : null, avisoLargo: n ? n.textContent.trim().length : 0,
             alto: cj ? Math.round(cj.height) : null, visible: cj ? (cj.width > 0 && cj.height > 0) : null };
  };
  const registro = () => { let inc = null, idx = null, url = 0;
    try { inc = (typeof esqEstaIncluido === 'function') ? esqEstaIncluido('cm3d') : 'SIN FN' } catch (e) { inc = 'EXC' }
    try { idx = (typeof esqSlotIdx === 'function') ? esqSlotIdx('cm3d') : 'SIN FN' } catch (e) { idx = 'EXC' }
    try { const s = (typeof imgSlots !== 'undefined') ? imgSlots : (window.imgSlots || null);
          if (s && idx !== null && idx >= 0 && s[idx]) url = String(s[idx].dataURL || s[idx].url || '').length } catch (e) { url = -1 }
    let esq = 0; try { const d = (typeof cmEsqPdfData === 'function') ? cmEsqPdfData() : null; esq = d && d.data ? String(d.data).length : 0 } catch (e) { esq = -1 }
    return { incluido: inc, slot: idx, largoImagen: url, largoEsquema: esq };
  };
  /* EL PDF GENERADO DE VERDAD, por el boton REAL del encabezado. Se espia el CONSTRUCTOR de
     jsPDF -por el prototipo el espia mide 0, que es un denominador vacio y no un cero-. */
  const pdf = async () => {
    if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) return { ERR: 'NO HAY jsPDF' };
    const Orig = window.jspdf.jsPDF;
    const reg = { txt: [], figs: 0, imgs: [] };
    window.jspdf.jsPDF = function () {
      const d = new Orig(...arguments);
      const ot = d.text.bind(d);
      d.text = function (t) { reg.txt.push(String(t)); return ot.apply(null, arguments) };
      const oi = d.addImage ? d.addImage.bind(d) : null;
      if (oi) d.addImage = function (dd, f, x, y, w, h) {
        reg.imgs.push({ w: Math.round(w), h: Math.round(h), x: Math.round(x), y: Math.round(y),
                        largo: String(dd || '').length, dato: String(dd || '').slice(0, 2000000) });
        reg.figs++; return oi.apply(null, arguments) };
      ['circle','line','rect','triangle'].forEach(m => { if (typeof d[m] === 'function') { const o = d[m].bind(d); d[m] = function () { reg.figs++; return o.apply(null, arguments) } } });
      d.save = function () { return true };
      d.output = function () { return '' };
      return d;
    };
    Object.keys(Orig).forEach(k => { try { window.jspdf.jsPDF[k] = Orig[k] } catch (e) {} });
    let err = '';
    const bot = EL('hdr-pdf-quick');
    try { if (bot) { bot.click() } else if (typeof generarPDF === 'function') { generarPDF() } } catch (e) { err = String(e).slice(0, 130) }
    /* ⚠️ EL BOTON DEL ENCABEZADO ABRE PRIMERO LA TARJETA «Revision de severidades», y recien su
       «Confirmar» genera el documento: ese es el gesto del medico. Sin este clic el espia medía
       CERO textos y CERO imagenes, que es un DENOMINADOR VACIO y no un cero. Y no alcanza con
       poner valvSevConfirmada desde afuera: es una variable de MODULO y no esta en window
       -la trampa que PANT-7 ya documenta-. */
    await esperar(700);
    R.tarjetaSeveridades = (R.tarjetaSeveridades || []); R.tarjetaSeveridades.push(!!EL('pdf-review-overlay'));
    try { const cf = EL('rev-confirm'); if (cf) cf.click() } catch (e) { err = err || ('confirmar: ' + String(e).slice(0, 80)) }
    await esperar(5200);
    window.jspdf.jsPDF = Orig;
    const todo = reg.txt.join(' | ');
    /* la imagen del corazon maestro: la que lleva su etiqueta al lado */
    const out = { nTxt: reg.txt.length, chars: todo.length, figs: reg.figs, nImg: reg.imgs.length,
                  err: err, etiqueta: (todo.indexOf('Corazón en 3D de congénitas') >= 0),
                  medidas: reg.imgs.map(i => i.w + 'x' + i.h).join(' ') };
    /* MUESTREO DE PIXELES de la imagen mas grande: ni negra ni blanca */
    const gr = reg.imgs.slice().sort((a, b) => (b.w * b.h) - (a.w * a.h))[0];
    if (gr && gr.dato && gr.dato.indexOf('data:image') === 0) {
      out.mayor = { w: gr.w, h: gr.h, largo: gr.largo };
      out.muestras = await new Promise(res => {
        const im = new Image();
        im.onload = () => { try {
          const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height;
          const cx = cv.getContext('2d'); cx.drawImage(im, 0, 0);
          const pts = [[0.5,0.5],[0.3,0.3],[0.7,0.3],[0.3,0.7],[0.7,0.7]];
          let neg = 0, bla = 0, col = [];
          pts.forEach(p => { const d2 = cx.getImageData(Math.round(im.width*p[0]), Math.round(im.height*p[1]), 1, 1).data;
            if (d2[0] < 26 && d2[1] < 26 && d2[2] < 26) neg++;
            if (d2[0] > 246 && d2[1] > 246 && d2[2] > 246) bla++;
            col.push(d2[0] + ',' + d2[1] + ',' + d2[2]) });
          res({ ancho: im.width, alto: im.height, negras: neg, blancas: bla, colores: col.join(' | ') });
        } catch (e) { res({ ERR: String(e).slice(0, 90) }) } };
        im.onerror = () => res({ ERR: 'NO DECODIFICA' });
        im.src = gr.dato;
      });
    } else { out.mayor = null }
    return out;
  };
  const paso = (nom, extra) => { R.pasos.push(Object.assign({ paso: nom, boton: estadoBoton(), reg: registro() }, extra || {})) };

  /* ───────── 1. el estudio: nombre y los datos del caso, con el gesto ───────── */
  const CASO = ${JSON.stringify(caso)};
  R.caso = CASO.n;
  const nm = EL('nombre'); if (nm) { nm.value = 'Prueba PANT14'; nm.dispatchEvent(new Event('input', { bubbles: true })) }
  const ci = EL('ci'); if (ci) { ci.value = '9876543'; ci.dispatchEvent(new Event('input', { bubbles: true })) }
  try { const b1 = bq('showTab(' + Q + CASO.sub + Q); if (b1) b1.click() } catch (e) {}
  await esperar(420);
  R.siembra = {};
  for (const c of CASO.campos) { R.siembra[c[0]] = gesto(c[0], c[1]); await esperar(130) }
  await esperar(420);
  /* ───────── 2. abrir el modulo con su boton real ───────── */
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
  await esperar(420);
  const ab = EL('cc3d-abrir');
  R.abrir = ab ? 'click' : 'NO HAY BOTON';
  if (ab) ab.click();
  await esperar(3400);
  const modoAhora = () => { const e = document.querySelector('.cm3d-md[aria-pressed="true"]');
    return e ? e.getAttribute('data-m') : 'NINGUNO' };
  R.modoAlAbrir = modoAhora();
  paso('2-modulo abierto');
  /* ───────── 3. «Explorar» y volver, con los botones reales ───────── */
  const mdExp = document.querySelector('.cm3d-md[data-m="explorar"]');
  if (mdExp) { mdExp.click(); await esperar(700) }
  paso('3-en Explorar');
  const mdEst = document.querySelector('.cm3d-md[data-m="estudio"]');
  if (mdEst) { mdEst.click(); await esperar(900) }
  paso('4-en Segun el estudio');
  /* ───────── 5. tocar el boton ───────── */
  const b = EL('cm3d-pdfb');
  R.tocable = b ? !b.disabled : null;
  if (b && !b.disabled) { b.click(); await esperar(2600) }
  paso('5-tocado');
  /* ───────── 6. el PDF generado de verdad ───────── */
  R.pdfConCasilla = await pdf();
  paso('6-tras el PDF');
  /* ───────── 7. cambiar un dato con la casilla encendida ───────── */
  if (CASO.campos.length) {
    try { const b1 = bq('showTab(' + Q + CASO.sub + Q); if (b1) b1.click() } catch (e) {}
    await esperar(360);
    R.cambio = gesto(CASO.campos[0][0], '');
    await esperar(360);
    try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
    await esperar(900);
    paso('7-dato borrado');
    try { const b1 = bq('showTab(' + Q + CASO.sub + Q); if (b1) b1.click() } catch (e) {}
    await esperar(300);
    gesto(CASO.campos[0][0], CASO.campos[0][1]);
    await esperar(300);
    try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
    await esperar(900);
    /* ⚠️ AL VOLVER A LA PESTANIA EL PANEL ESTA CERRADO -cc3dPieSync lo cierra al salir-: se
       REABRE con su boton real y se anota CON QUE MODO abre. Es lo que el punto 2c pide medir. */
    R.panelTrasVolver = (() => { const pn = EL('cc3d-panel'); return pn ? getComputedStyle(pn).display : 'NO HAY' })();
    const ab2 = EL('cc3d-abrir');
    if (ab2 && ab2.getAttribute('aria-pressed') !== 'true') { ab2.click(); await esperar(2600) }
    R.modoAlReabrir = modoAhora();
    paso('8-dato repuesto');
  }
  /* ───────── 8. apagar la casilla y volver a generar ───────── */
  const b2 = EL('cm3d-pdfb');
  if (b2 && !b2.disabled && b2.getAttribute('aria-pressed') === 'true') { b2.click(); await esperar(1400) }
  paso('9-apagada');
  R.pdfSinCasilla = await pdf();
  /* ───────── 9. «Nuevo estudio» ───────── */
  try { const bn = bq('limpiarCampos'); if (bn) { window.confirm = () => true; bn.click(); await esperar(1800) } } catch (e) {}
  paso('10-nuevo estudio');
  return R;
})()`;

const salida = {};
for (const caso of CASOS) {
  if (SOLO && caso.n !== SOLO) continue;
  const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 140)));
  pg.on('console', c => { if (c.type() === 'error') errs.push('CONS ' + c.text().slice(0, 140)) });
  pg.on('dialog', d => { try { d.accept() } catch (e) {} });
  try {
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
    await pg.waitForTimeout(1700);
    const r = await pg.evaluate(CUERPO(caso));
    r.errs = errs.filter(e => !/ERR_FILE_NOT_FOUND|favicon/.test(e));
    salida[caso.n] = r;
  } catch (e) { salida[caso.n] = { fatal: String(e).slice(0, 220), errs } }
  await pg.close();
}
await br.close();
console.log(JSON.stringify(salida, null, 1));
