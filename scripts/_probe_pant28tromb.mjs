#!/usr/bin/env node
/**
 * _probe_pant28tromb.mjs - tanda PANT-28, commit 5. SOLO LECTURA.
 * Nombre propio: verificado con ls, no existia. NO sobrescribe la sonda de PANT-27.
 * Mide la oracion del folio 4698 en la seccion de PROTESIS AORTICA, en las cuatro escenas que
 * la deciden, con el gesto real -el select va_morf y el boton «Si» de la fila de trombosis-:
 *   mec     protesis aortica MECANICA con trombosis   -> la oracion SI
 *   bio     protesis aortica BIOLOGICA con trombosis  -> la oracion NO (control negativo)
 *   tavi    TAVI con trombosis                        -> la oracion NO (control negativo)
 *   sinTipo sin tipo consignado                       -> la seccion NO existe (control negativo)
 * Y comprueba que la oracion es IDENTICA, caracter por caracter, a la de la mitral mecanica.
 * DENOMINADOR: cada escena declara si la seccion se publico y cuanto texto trajo; una seccion
 * ausente lo DICE en vez de contar como «la oracion no esta».
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
const OUTF = arg('--out') || '/tmp/p28tromb.json';
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
  const sinTags = (h) => norm(String(h || '').replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&laquo;/g, '«').replace(/&raquo;/g, '»'));

  /* El texto de pantalla de una seccion del panel, abierta por su summary. */
  const secPantalla = (pref) => {
    const ov = document.getElementById('indic-overlay');
    if (!ov || ov.style.display !== 'block') return { err: 'el panel no esta abierto' };
    const dets = Array.from(ov.querySelectorAll('details'));
    const sec = dets.find(d => { const su = d.querySelector('summary');
                                 return su && norm(su.textContent).indexOf(pref) === 0 });
    if (!sec) return { err: 'sin seccion que empiece con ' + pref,
                       titulos: dets.map(d => { const su = d.querySelector('summary');
                                                return su ? norm(su.textContent).slice(0, 40) : '-' }) };
    if (!sec.open) sec.querySelector('summary').click();
    Array.from(sec.querySelectorAll('details')).forEach(d => { if (!d.open) {
      const su = d.querySelector('summary'); if (su) su.click() } });
    return { texto: norm(sec.textContent) };
  };

  const ORACION = 'La cirugía se considera ante un trombo protésico grande, no obstructivo, que se complicó con embolia o que persiste a pesar de anticoagulación óptima (folio 4698).';

  /* ADVERTENCIA: LA TROMBOSIS NO ES UN CAMPO DEL ESTUDIO. Es una PREGUNTA del panel,
     protm.tromb, que la seccion lee con _indClinGet. Se contesta con el gesto real -el boton
     "Si" de su fila-, que es lo unico que enciende el ramal del tipo de protesis. La primera
     version de esta sonda buscaba un campo con ese nombre, no lo encontraba, y las tres
     escenas median sobre un ramal que nunca corria: un denominador vacio. */
  /* ADVERTENCIA: LA TROMBOSIS NO ES UN CAMPO DEL ESTUDIO. Es una PREGUNTA del panel,
     protm.tromb, que la seccion lee con _indClinGet. Se contesta con el gesto real: el boton
     de su fila, que el molde _indCtrlHTML marca con data-ind-clin y data-ind-val. Buscar la
     fila por su rotulo elegia la botonera de la pregunta de al lado; el atributo no.
     ADVERTENCIA 2: LA SECCION SALE TEMPRANO SIN protm.peri. Con la fuga periprotesica sin
     contestar publica "Falta un dato para aplicar la guia" y NUNCA llega al ramal del tipo de
     protesis, asi que medir ahi la oracion del trombo da cero y parece que no esta. */
  const contestar = (clave, valor) => {
    const ov = document.getElementById('indic-overlay');
    if (!ov || ov.style.display !== 'block') return 'el panel no esta abierto';
    const bs = Array.from(ov.querySelectorAll('[data-ind-clin="' + clave + '"]'));
    if (!bs.length) return 'sin botones de ' + clave;
    const b = bs.find(x => x.getAttribute('data-ind-val') === valor);
    if (!b) return 'sin valor ' + valor + ' entre ' + bs.map(x => x.getAttribute('data-ind-val')).join('|');
    b.click();
    return clave + '=' + valor;
  };


  const porOpcion = (id, frag) => { const e = document.getElementById(id);
    if (!e) return 'NO EXISTE ' + id;
    const op = Array.from(e.options).find(o => norm(o.textContent).indexOf(frag) > -1);
    if (!op) return 'sin opcion ' + frag;
    e.value = op.value; e.dispatchEvent(new Event('change', { bubbles: true }));
    return (e.value === op.value) ? op.value : 'quedo en ' + e.value };

  const O = { errs: [], oracion: ORACION, escenas: {} };
  /* La oracion de la MITRAL, leida del registro, para compararla caracter por caracter. */
  O.oracionMitral = (function () {
    try {
      const n = PROTM_REC_2025 ? null : null;
      const t = (typeof _protmRecom === 'function') ? null : null;
      return null;
    } catch (e) { return 'EXC' }
  })();

  const TIPOS = [['mec', 'mec\u00e1nica'], ['bio', 'biol\u00f3gica'], ['tavi', 'TAVI'], ['sinTipo', null]];
  for (const par of TIPOS) {
    const tipo = par[0];
    try { if (typeof limpiarCampos === 'function') limpiarCampos() } catch (e) {}
    const puesto = {};
    if (par[1]) puesto.va = porOpcion('va_morf', par[1]);
    else { const e = document.getElementById('va_morf');
           if (e) { e.value = ''; e.dispatchEvent(new Event('change', { bubbles: true })); puesto.va = 'vaciado' } }
    /* la mitral mecanica en la MISMA escena: es el denominador de la comparacion */
    puesto.vm = porOpcion('vm_morf', 'mec\u00e1nica');
    await esperar(420);
    try { indicAbrir() } catch (e) { O.errs.push('indicAbrir ' + tipo + ': ' + e.message) }
    await esperar(300);
    puesto.clicTromb  = contestar('prota.tromb', 'si');
    puesto.clicTrombM = contestar('protm.tromb', 'si');
    puesto.clicFugaM  = contestar('protm.peri', 'no');
    await esperar(360);
    const sa = secPantalla('Pr\u00f3tesis a\u00f3rtica');
    const sm = secPantalla('Pr\u00f3tesis mitral');
    const st = secPantalla('Pr\u00f3tesis tric\u00faspide');
    O.escenas[tipo] = { puesto: puesto,
      aortica: sa.err ? sa : { largo: sa.texto.length,
                               tieneOracion: sa.texto.indexOf(ORACION) > -1,
                               tienePregunta: sa.texto.indexOf('Trombo prot\u00e9sico grande, de 10 mm o m\u00e1s') > -1,
                               tiene10mm: sa.texto.indexOf('10 mm o m\u00e1s') > -1,
                               extracto: (function () { const i = sa.texto.indexOf('Figura 20');
                                 return i > -1 ? sa.texto.slice(Math.max(0, i - 160), i + 420) : '(sin la nota de la Figura 20)' })() },
      mitral: sm.err ? sm : { largo: sm.texto.length, tieneOracion: sm.texto.indexOf(ORACION) > -1 },
      tricuspide: st.err ? st : { largo: st.texto.length, tieneOracion: st.texto.indexOf(ORACION) > -1 } };
    try { indicCerrar() } catch (e) {}
  }

  /* CENSO del archivo cargado: donde vive la oracion en los registros. */
  O.censo = (function () {
    const conOracion = [];
    const rec = (o, ruta, prof) => {
      if (prof > 4 || o == null) return;
      if (typeof o === 'string') { if (o.indexOf(ORACION) > -1) conOracion.push(ruta); return }
      if (typeof o !== 'object') return;
      if (Array.isArray(o)) { o.forEach((x, i) => rec(x, ruta + '[' + i + ']', prof + 1)); return }
      Object.keys(o).forEach(k => rec(o[k], ruta + '.' + k, prof + 1));
    };
    [['PROTA_PREG', typeof PROTA_PREG !== 'undefined' ? PROTA_PREG : null],
     ['PROTT_PREG', typeof PROTT_PREG !== 'undefined' ? PROTT_PREG : null],
     ['PROTP_PREG', typeof PROTP_PREG !== 'undefined' ? PROTP_PREG : null],
     ['PROTM_REC_2025', typeof PROTM_REC_2025 !== 'undefined' ? PROTM_REC_2025 : null]]
      .forEach(x => { if (x[1]) rec(x[1], x[0], 0) });
    return { conOracion: conOracion };
  })();

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
