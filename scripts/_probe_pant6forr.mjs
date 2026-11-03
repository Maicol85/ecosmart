/*
 * _probe_pant6forr.mjs - la frase de dato faltante del Forrester en el papel (PANT-6, c6a).
 * Nombre propio: verificado con ls contra HEAD, no existia.
 *   node scripts/_probe_pant6forr.mjs --file <index.html>
 * CUENTA CARACTERES de cada superficie: un denominador vacio no es un cero.
 * Tres escenas: sin ningun dato, con solo el indice cardiaco, y con los dos (control negativo,
 * donde la frase no existe porque hay perfil).
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const FILE = arg('--file') || (RAIZ + '/index.html');
/* Las tres frases que `forrFaltaTxt` puede producir. */
const FRASES = ['faltan el índice cardíaco y la presión capilar pulmonar estimada',
                'falta la presión capilar pulmonar estimada', 'falta el índice cardíaco'];
const ESCENAS = [
  ['sin-nada',   {}],
  ['solo-ic',    { gasto_cardiaco:'3.2', peso:'70', talla:'170' }],
  ['los-dos',    { gasto_cardiaco:'3.2', peso:'70', talla:'170', onda_e:'90', e_sep:'6', e_lat:'8' }]
];

const JS = (campos) => `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  const o = {};
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles:true }));
    e.dispatchEvent(new Event('change', { bubbles:true })); return e.value };
  const C = ${JSON.stringify(campos)};
  Object.keys(C).forEach(k => S(k, C[k]));
  Object.keys(window).forEach(k => { if (/^calc[A-Z]/.test(k) && typeof window[k] === 'function') {
    try { window[k]() } catch (e) {} } });
  /* EL MODULO SE INTEGRA: sin eso ni el informe ni la hoja del PDF traen una palabra de
     hemodinamica y el cero no prueba nada. */
  try { if (typeof amiloIntegrar === 'function') amiloIntegrar('hemo') } catch (e) { o.intErr = String(e) }
  /* ⚠️ amiloEnInforme() DEVUELVE UN ARRAY DE OBJETOS {k, tit, txt, grupo}, NO un objeto
     indexado por clave ni un array de claves. La primera version de esta sonda preguntaba por
     r.hemo y por indexOf('hemo') y daba integrado=false sobre un modulo que SI estaba
     integrado: un denominador falso que se lee como «el camino no existe». */
  o.integrado = (function(){ try { const r = (typeof amiloEnInforme === 'function') ? amiloEnInforme() : null;
    return Array.isArray(r) ? r.some(function(x){ return x && x.k === 'hemo' }) : 'sin amiloEnInforme' } catch (e) { return 'EXC' } })();
  /* La PANTALLA: el span. */
  o.pantalla = ((document.getElementById('hemo-forrester')||{}).textContent||'').trim();
  o.pantallaN = o.pantalla.length;
  /* El mensaje de ABAJO del grafico, que es el que se queda. */
  o.pantallaGraf = (function(){ const g = document.getElementById('hemo-forr-graf');
    return g ? (g.textContent||'').replace(/\\s+/g,' ').trim() : '' })();
  /* CAMINO 1: el texto del modulo, que va al informe y a la hoja del PDF. */
  o.modulo = (function(){ try { return String(amiloTextoHemo() || '') } catch (e) { return 'EXC ' + e } })();
  o.moduloN = o.modulo.length;
  /* CAMINO 2: el informe emitido MAS el texto del bloque integrado tal como lo publica el
     registro, que es lo que la hoja del PDF imprime. Las dos cosas juntas: el textarea no lleva
     los bloques integrados -eso lo hace la hoja- y medir solo uno de los dos deja un camino sin
     denominador. */
  o.informe = (function(){ try { if (typeof generarInforme === 'function') generarInforme();
    const t = document.getElementById('informe_texto');
    const reg = (typeof amiloEnInforme === 'function') ? (amiloEnInforme() || []) : [];
    const NL = String.fromCharCode(10);
    const blo = reg.map(function(x){ return String((x && x.txt) || '') }).join(NL);
    return (t ? String(t.value || '') : '') + NL + blo } catch (e) { return 'EXC ' + e } })();
  o.informeN = o.informe.length;
  /* CAMINO 3: la diapositiva del PPT, espiando PptxGenJS. */
  o.ppt = (function(){
    if (typeof PptxGenJS !== 'function') return 'SIN PptxGenJS';
    const cap = [];
    const P = PptxGenJS; const orig = P.prototype.addSlide;
    const guarda = function(){ const s = orig.apply(this, arguments);
      ['addText','addTable'].forEach(function(m){ const o2 = s[m];
        if (typeof o2 === 'function') s[m] = function(a){ try { cap.push(JSON.stringify(a)) } catch (e) {} return o2.apply(s, arguments) } });
      return s };
    P.prototype.addSlide = guarda;
    const wr = P.prototype.writeFile; P.prototype.writeFile = function(){ return Promise.resolve('') };
    try { if (typeof generarPPT === 'function') generarPPT() } catch (e) { cap.push('EXC ' + e) }
    P.prototype.addSlide = orig; P.prototype.writeFile = wr;
    return cap.join(' | ') })();
  o.pptN = String(o.ppt).length;
  /* El censo: cuantas veces aparece CADA frase en cada superficie. */
  const F = ${JSON.stringify(FRASES)};
  const cuenta = (txt) => F.map(function(f){ return String(txt).split(f).length - 1 }).reduce(function(a,b){ return a+b }, 0);
  o.cFrase = { pantalla:cuenta(o.pantalla), modulo:cuenta(o.modulo),
               informe:cuenta(o.informe), ppt:cuenta(o.ppt) };
  /* La linea del Forrester de cada camino, para el ejemplo antes/despues. */
  o.lineaMod = (o.modulo.split('\\n').filter(function(l){ return l.indexOf('Forrester') > -1 })[0] || '');
  o.lineaInf = (o.informe.split('\\n').filter(function(l){ return l.indexOf('Forrester') > -1 })[0] || '');
  o.lineaPpt = (String(o.ppt).split('|').filter(function(l){ return l.indexOf('Forrester') > -1 })[0] || '').slice(0,150);
  return o;
})()`;

const nav = await _pw.chromium.launch({ channel: 'chrome' });
for (const [nom, campos] of ESCENAS) {
  const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
  const pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', e => errs.push(String(e).slice(0, 110)));
  try {
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
    await pg.waitForTimeout(1200);
    const a = await Promise.race([pg.evaluate(JS(campos)),
      new Promise((_, rj) => setTimeout(() => rj(new Error('timeout')), 90000))]);
    console.log(nom.padEnd(10) + ' | integrado=' + a.integrado +
      ' | DENOM chars pantalla/modulo/informe/ppt = ' + a.pantallaN + '/' + a.moduloN + '/' + a.informeN + '/' + a.pptN +
      ' | FRASE pantalla=' + a.cFrase.pantalla + ' modulo=' + a.cFrase.modulo +
      ' informe=' + a.cFrase.informe + ' ppt=' + a.cFrase.ppt + ' | err ' + errs.length + ' ' + (errs[0]||''));
    console.log('           pantalla="' + a.pantalla + '"');
    console.log('           grafico="' + a.pantallaGraf.slice(0,90) + '"');
    console.log('           modulo:  ' + a.lineaMod);
    console.log('           informe: ' + a.lineaInf);
    console.log('           ppt:     ' + a.lineaPpt);
  } catch (e) { console.log(nom + ' ERROR ' + String(e).slice(0, 180)) }
  await ctx.close();
}
await nav.close();
