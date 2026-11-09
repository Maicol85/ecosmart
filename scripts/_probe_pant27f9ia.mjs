#!/usr/bin/env node
/**
 * _probe_pant27f9ia.mjs - tanda PANT-27, commit 3. SOLO LECTURA.
 * Nombre propio: verificado con ls, no existia.
 * Lee el TEXTO DE PANTALLA de las tres piezas del commit 3, con el GESTO REAL y en los DOS
 * arboles:
 *   (A) FONTAN: carga un Fontan por sus campos con sus eventos, abre el panel de Evidencia por
 *       indicAbrir, encuentra la seccion por su summary, ubica la FILA de la pregunta de
 *       sangrado por su rotulo y lee su nota de pantalla; despues la CONTESTA en los dos
 *       sentidos por sus propios botones y vuelve a leer.
 *   (B) GLOBO tavi-calc: lo abre por el boton inf real del campo ete_tavi_calc y lee el cuerpo
 *       de la tarjeta #vinfo-card.
 *   (C) FICHA ref-ia: abre la pestania Referencias, su subpestania de nativas y la ficha de la
 *       insuficiencia aortica, y lee el textContent del bloque del reverso diastolico.
 * DENOMINADOR: cada pieza declara si se encontro y cuanto texto trajo; un globo cerrado o una
 * ficha sin pintar devuelven cero y lo DICEN.
 * CONTROL NEGATIVO: la nota de Evidencia del reverso (que esta tanda NO toca) se lee tambien,
 * para probar que la sonda distingue las dos superficies.
 * PAPEL: informe en los estilos que la app ofrezca y EN SUMA.
 * No escribe nada en el proyecto.
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
const OUTF = arg('--out') || '/tmp/p27f9ia.json';
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
  const norm = (t) => String(t || '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
  const V = (id) => { const e = document.getElementById(id); return e ? String(e.value || '') : null };
  const S = (id, val) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = val;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
    return (String(e.value) === String(val)) ? 1 : 'quedo en ' + e.value; };
  const O = { errs: [] };

  /* ══ (A) FONTAN ══════════════════════════════════════════════════════════════ */
  const secDelPanel = (titulo) => {
    const ov = document.getElementById('indic-overlay');
    if (!ov || ov.style.display !== 'block') return { err: 'el panel no esta abierto' };
    const dets = Array.from(ov.querySelectorAll('details'));
    const sec = dets.find(d => { const su = d.querySelector('summary');
                                 return su && norm(su.textContent).indexOf(titulo) === 0 });
    if (!sec) return { err: 'sin seccion que empiece con ' + titulo,
                       titulos: dets.map(d => { const su = d.querySelector('summary');
                                                return su ? norm(su.textContent).slice(0, 40) : '(sin summary)' }) };
    if (!sec.open) sec.querySelector('summary').click();
    return { nodo: sec, texto: norm(sec.textContent) };
  };
  /* La FILA de una pregunta por su rotulo: se sube desde el nodo que lo contiene hasta el
     ancestro que tambien tiene los botones de respuesta, que es la fila. */
  const filaPregunta = (sec, rotulo) => {
    if (!sec || !sec.nodo) return { err: 'sin seccion' };
    /* el elemento MAS CHICO -de cualquier etiqueta- que contiene el rotulo, y de ahi para
       arriba hasta que el nodo tenga los TRES botones de respuesta: esa es la fila. Sin esto
       se elige un contenedor con varias preguntas y la sonda mide la fila de al lado. */
    const todos = Array.from(sec.nodo.querySelectorAll('*'))
      .filter(d => norm(d.textContent).indexOf(rotulo) > -1);
    if (!todos.length) return { err: 'sin elemento con el rotulo', largo: norm(sec.nodo.textContent).length };
    let hoja = todos[0];
    todos.forEach(d => { if (d.textContent.length < hoja.textContent.length) hoja = d });
    let mejor = hoja;
    while (mejor && mejor.querySelectorAll('button').length < 3 && mejor !== sec.nodo) {
      mejor = mejor.parentElement;
    }
    if (!mejor) return { err: 'la fila no llego a tener tres botones' };
    /* si al subir se llevo mas de una pregunta, se declara en vez de medirla */
    const otras = (norm(mejor.textContent).match(/S\u00ed\s*No/g) || []).length;
    return { texto: norm(mejor.textContent), preguntasEnLaFila: otras,
             botones: Array.from(mejor.querySelectorAll('button')).map(b => norm(b.textContent)),
             nodo: mejor };
  };
  const ROT_FON = 'Contraindicacion de sangrado para la anticoagulacion';
  const ROT_SIG = 'Taquicardia supraventricular recurrente';
  /* La fila por REBANADA del texto de la seccion, entre su rotulo y el de la pregunta
     siguiente. El camino por el DOM servia sin contestar y elegia un contenedor con varias
     preguntas despues de contestar, asi que la rebanada es la que mide siempre lo mismo.
     DENOMINADOR: declara los dos indices; si alguno falta, lo DICE. */
  const filaRebanada = (sec) => {
    if (!sec || !sec.texto) return { err: 'sin seccion' };
    const i = sec.texto.indexOf(ROT_FON), j = sec.texto.indexOf(ROT_SIG);
    if (i < 0) return { err: 'el rotulo de la pregunta no esta en la seccion', largo: sec.texto.length };
    if (j <= i) return { err: 'el rotulo de la pregunta siguiente no esta despues', i: i, j: j };
    return { texto: sec.texto.slice(i, j), desde: i, hasta: j };
  };
  const fonEscena = () => {
    try { if (typeof limpiarCampos === 'function') limpiarCampos(); } catch (e) {}
    const puesto = {};
    puesto.tipo = S('fontan_tipo', 'extracardiaco');
    if (puesto.tipo !== 1) {
      const sel = document.getElementById('fontan_tipo');
      if (sel && sel.options.length > 1) { puesto.tipo = S('fontan_tipo', sel.options[1].value) }
    }
    puesto.fen = S('fontan_fenestracion', 'no');
    return puesto;
  };
  O.A_puesto = fonEscena();
  await esperar(420);
  try { indicAbrir() } catch (e) { O.errs.push('indicAbrir Fontan: ' + e.message) }
  await esperar(260);
  const sf = secDelPanel('Circulaci\u00f3n de Fontan');
  O.A_sec = sf.err ? sf : { largo: sf.texto.length };
  if (sf.err) O.A_sec_titulos = sf.titulos;
  const f0 = filaPregunta(sf, ROT_FON);
  const r0 = filaRebanada(sf);
  O.A_fila_sinContestar = f0.err ? f0
    : { texto: f0.texto, botones: f0.botones, preguntasEnLaFila: f0.preguntasEnLaFila };
  O.A_rebanada_sinContestar = r0;
  /* contestarla en los DOS sentidos, por sus propios botones */
  O.A_respuestas = {};
  if (!f0.err) {
    /* ADVERTENCIA: EL NODO DE LA FILA SE DESTRUYE AL CONTESTAR. El panel se repinta, asi que
       los botones se vuelven a buscar EN VIVO en cada vuelta. Con el nodo guardado los dos
       clics caian en un arbol desprendido y las dos respuestas salian identicas, que se lee
       igual que "contesta igual en los dos sentidos". */
    const QUIERO = ['S\u00ed', 'No'];
    for (const quiero of QUIERO) {
      const sv = secDelPanel('Circulaci\u00f3n de Fontan');
      const fv = filaPregunta(sv, ROT_FON);
      if (fv.err) { O.A_respuestas[quiero] = { err: 'no se encontro la fila en vivo: ' + fv.err }; continue }
      const b = Array.from(fv.nodo.querySelectorAll('button'))
        .find(x => norm(x.textContent) === quiero || norm(x.textContent) === '\u2713 ' + quiero);
      if (!b) { O.A_respuestas[quiero] = { err: 'sin boton ' + quiero,
                 hay: Array.from(fv.nodo.querySelectorAll('button')).map(x => norm(x.textContent)) }; continue }
      b.click();
      await esperar(320);
      const s2 = secDelPanel('Circulaci\u00f3n de Fontan');
      const r2 = filaRebanada(s2);
      const f3 = filaPregunta(s2, ROT_FON);
      r2.marcado = f3.err ? 'NO SE PUDO LEER'
        : Array.from(f3.nodo.querySelectorAll('button')).map(x => norm(x.textContent)).join('|');
      O.A_respuestas[quiero] = r2;
    }
  }
  try { indicCerrar() } catch (e) {}

  /* ══ (B) EL GLOBO tavi-calc, por su boton inf real ═════════════════════════════ */
  O.B = (function () {
    /* showTab NO le da caja a la tarjeta: el campo vive en una seccion del ETE que nace
       cerrada, y un boton sin caja no abre el globo. Se abren las dos cosas. */
    try { if (typeof showTab === 'function') showTab('ete') } catch (e) {}
    try { if (typeof toggleEteSeccion === 'function') toggleEteSeccion('ete-seccion-tavi') } catch (e) {}
    const sc = document.getElementById('ete-seccion-tavi');
    if (sc && getComputedStyle(sc).display === 'none') sc.style.display = '';
    const bs = Array.from(document.querySelectorAll('[data-vinfo="tavi-calc"]'));
    if (!bs.length) {
      /* sin boton alcanzable se declara y se lee el registro, que es el denominador honesto */
      let reg = null;
      try { reg = (typeof VINFO !== 'undefined' && VINFO['tavi-calc']) ? VINFO['tavi-calc'].lee : null } catch (e) {}
      return { via: 'SIN BOTON', registro: reg ? norm(reg) : 'SIN REGISTRO',
               registroLargo: reg ? String(reg).length : 0 };
    }
    const rb = bs[0].getBoundingClientRect();
    bs[0].click();
    const card = document.getElementById('vinfo-card');
    const vis = card ? (getComputedStyle(card).display !== 'none') : false;
    let reg = null;
    try { reg = (typeof VINFO !== 'undefined' && VINFO['tavi-calc']) ? VINFO['tavi-calc'].lee : null } catch (e) {}
    return { via: 'boton', abierto: vis, cajaBoton: Math.round(rb.width) + 'x' + Math.round(rb.height),
             pantalla: card ? norm(card.textContent) : 'SIN #vinfo-card',
             pantallaLargo: card ? norm(card.textContent).length : 0,
             registro: reg ? norm(reg) : 'SIN REGISTRO' };
  })();

  /* ══ (C) LA FICHA ref-ia ══════════════════════════════════════════════════════ */
  O.C = (function () {
    try { if (typeof showTab === 'function') showTab('refs') } catch (e) {}
    try { if (typeof evRefPintar === 'function') evRefPintar('ia') } catch (e) {}
    const e = document.getElementById('ref-ia');
    if (!e) return { err: 'NO EXISTE ref-ia' };
    e.style.display = '';
    const t = norm(e.textContent);
    /* el bloque del reverso: desde la primera oracion hasta el fin del parrafo */
    const i = t.indexOf('El reverso diast');
    return { largo: t.length, bloque: i > -1 ? t.slice(i, i + 760) : '(no se encontro el bloque)',
             fichaCompleta: t };
  })();

  /* ══ CONTROL NEGATIVO: la nota de Evidencia del reverso, que esta tanda NO toca ══
     Se CARGA una insuficiencia aortica con reverso diastolico antes de leerla: sin la escena
     la seccion no se publica y la lectura sale vacia, que no prueba nada. */
  O.CN_escena = (function () {
    try { if (typeof limpiarCampos === 'function') limpiarCampos() } catch (e) {}
    const puesto = { dur: S('ia_rev_dur', 'holodiastolico'), vti: S('ia_vti_desc', '18'),
                     vtd: S('ia_vmax_td', '25'), grado: S('ia_grado', 'Severa') };
    const sel = document.getElementById('ia_rev_dur');
    if (puesto.dur !== 1 && sel) {
      const op = Array.from(sel.options).find(o => /holo/i.test(o.value) || /holo/i.test(o.textContent));
      if (op) puesto.dur = S('ia_rev_dur', op.value);
      puesto.opciones = Array.from(sel.options).map(o => o.value);
    }
    try { if (typeof calcIA_ESC === 'function') calcIA_ESC() } catch (e) {}
    return puesto;
  })();
  await esperar(420);
  O.CN_notaEvidencia = (function () {
    try {
      if (typeof IND_SECS === 'undefined') return 'SIN IND_SECS';
      const sx = IND_SECS.find(x => String(x.tit || '').indexOf('Insuficiencia a') === 0);
      if (!sx) return 'SIN SECCION DE IAo';
      const r = sx.fn();
      if (!r) return '(la seccion no se publica con esta escena)';
      const ns = (r.notas || []).filter(Boolean)
        .map(x => (typeof x === 'string') ? x : x.txt)
        .filter(x => x.indexOf('El reverso diast') > -1);
      return ns.length ? norm(ns[0]) : '(sin nota del reverso con esta escena)';
    } catch (e) { return 'ERR ' + String(e.message).slice(0, 90) }
  })();

  /* ══ PAPEL ════════════════════════════════════════════════════════════════════ */
  O.papel = (function () {
    const out = {};
    const pills = Array.from(document.querySelectorAll('[data-estilo]'));
    out._estilos = pills.map(x => x.getAttribute('data-estilo'));
    pills.forEach(b => { const k = b.getAttribute('data-estilo'); b.click();
      try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
      out[k] = norm(V('informe_texto')) });
    out._suma = norm(V('en_suma'));
    return out;
  })();

  return O;
});
R.consola = errs;
fs.writeFileSync(OUTF, JSON.stringify(R, null, 1));
console.log('escrito ' + OUTF);
await br.close();
process.exit(0);
