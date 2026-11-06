#!/usr/bin/env node
/**
 * _probe_pant14c_color.mjs - los colores, el anillo, las suturas, los parches y la leyenda
 * (PANT-14c, commit 3). Mide, por escena y en los dos temas:
 *   - el RECUENTO DE PIXELES de cada color en el lienzo del 3D (violeta oscuro, violeta claro,
 *     celeste, verde, gris, naranja), con el dibujo QUIETO -frecuencia en cero, que es lo que
 *     PANT-14b documenta: pausar deja el cuadro ANTERIOR-;
 *   - el MATIZ y la LUMINANCIA de cada constante y los pares que la orden pide;
 *   - el INVENTARIO de objetos de la escena -tipo, color, posicion- antes y despues;
 *   - el SOLAPE de cajas de rotulo, en todas las escenas con rotulos;
 *   - la ORIENTACION y la POSICION del anillo de la obstruccion por variante;
 *   - las entradas de la leyenda prendidas, en el 3D y en el esquema.
 *   node scripts/_probe_pant14c_color.mjs [--file <html>] [--tema claro|oscuro]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

/* Las escenas afectadas: base, variante y casillas, puestas por «Explorar» -que es donde el
   estado se puede fijar sin inventar un estudio-. */
const ESC = [
  { n:'mus',      base:'tga', bv:'mus' },
  { n:'ras',      base:'tga', bv:'ras' },
  { n:'jat',      base:'tga', bv:'jat' },
  { n:'cc',       base:'tga', bv:'cc' },
  { n:'dtga',     base:'tga', bv:'d' },
  { n:'dtgaObs',  base:'tga', bv:'d',   ck:{ tobs:true } },
  { n:'jatObs',   base:'tga', bv:'jat', ck:{ tobs:true } },
  { n:'musObs',   base:'tga', bv:'mus', ck:{ tobs:true } },
  { n:'rasObs',   base:'tga', bv:'ras', ck:{ tobs:true } },
  { n:'ccObs',    base:'tga', bv:'cc',  ck:{ tobs:true } },
  { n:'falOp',    base:'fal', bv:'op' },
  { n:'falOpCiv', base:'fal', bv:'op',  ck:{ rciv:true } },
  { n:'vcsi',     base:'norm', mods:{ vcs:'std' } },
  { n:'vcsiCia',  base:'norm', mods:{ vcs:'std', cia:'sec' } },
  { n:'norm',     base:'norm' },
  /* Las mismas con «Por dentro» APAGADO: es el estado en que `P14b-i` midio el anillo. */
  { n:'dtgaObsOff', base:'tga', bv:'d',   ck:{ tobs:true }, ins:false },
  { n:'jatObsOff',  base:'tga', bv:'jat', ck:{ tobs:true }, ins:false },
  { n:'musObsOff',  base:'tga', bv:'mus', ck:{ tobs:true }, ins:false },
  { n:'rasObsOff',  base:'tga', bv:'ras', ck:{ tobs:true }, ins:false },
  { n:'ccObsOff',   base:'tga', bv:'cc',  ck:{ tobs:true }, ins:false },
  { n:'dtgaOff',    base:'tga', bv:'d',   ins:false },
  { n:'jatOff',     base:'tga', bv:'jat', ins:false },
  { n:'musOff',     base:'tga', bv:'mus', ins:false },
  { n:'rasOff',     base:'tga', bv:'ras', ins:false },
  { n:'ccOff',      base:'tga', bv:'cc',  ins:false }
];

const CUERPO = (e, tema) => `(async () => {
  const R = { esc: ${JSON.stringify(e.n)}, tema: ${JSON.stringify(tema)} };
  const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  const E = ${JSON.stringify(e)}; const Q = String.fromCharCode(39);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  try { document.documentElement.setAttribute('data-theme', ${JSON.stringify(tema)}) } catch (x) {}
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  /* abrir el modulo */
  try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (x) {}
  await esperar(420);
  const ab = EL('cc3d-abrir'); if (ab) ab.click();
  await esperar(3500);
  R.hayCanvas = !!(EL('cm3d-cv') && EL('cm3d-cv').querySelector('canvas'));
  if (!R.hayCanvas) { R.ERR = 'SIN LIENZO'; return R }
  /* «Explorar» y el estado, por los duenios del modulo */
  try { if (typeof cmSetModo === 'function') cmSetModo('explorar') } catch (x) {}
  await esperar(500);
  try {
    const S = _cm3dEstado().S;
    S.base = E.base; if (E.bv) S.bv[E.base] = E.bv;
    S.mods = {}; if (E.mods) Object.keys(E.mods).forEach(k => { S.mods[k] = E.mods[k] });
    S.ck = {}; if (E.ck) Object.keys(E.ck).forEach(k => { S.ck[k] = E.ck[k] });
    if (typeof cm3dBuild === 'function') cm3dBuild();
  } catch (x) { R.ERR2 = String(x).slice(0, 110) }
  /* ⚠️ EL DIBUJO SE QUIETA CON LA FRECUENCIA EN CERO Y NO CON LA PAUSA: con el bucle pausado el
     lienzo conserva el cuadro ANTERIOR y la cuenta sale la de la escena de antes -PANT-14b-. */
  try { _cm3dEstado().fc = 0 } catch (x) {}
  /* ⚠️ «POR DENTRO» ES UN DATO DE LA ESCENA Y SU VALOR POR OMISION ES EL DE LA APP -encendido-.
     Forzarlo APAGADO dejaba los dos tuneles sin dibujar -son in:true- y el recuento de violeta
     daba CERO en los dos arboles: un denominador vacio que se lee igual que «el color no se
     aplico». Medido. */
  try { const _in = (E.ins === false) ? false : true;
        _cm3dEstado().ins = _in; const _c = EL('cm3d-ins'); if (_c) _c.checked = _in;
        if (typeof _cm3dInsSet === 'function') _cm3dInsSet() } catch (x) {}
  await esperar(1400);
  /* ══ EL INVENTARIO DE LA ESCENA ══ */
  R.inv = (function () {
    try {
      const s = cmEscena(_cm3dEstado().S);
      const hx = c => (c == null) ? '-' : ('0x' + Number(c).toString(16).padStart(6,'0'));
      return {
        ex: (s.ex || []).map(o => o.t + ':' + hx(o.col != null ? o.col : o.c) +
              (o.nrm ? ':nrm' : '') + (o.pri ? ':pri' : '') +
              '@' + (o.c && o.c.length === 3 ? o.c.map(n => Number(n).toFixed(2)).join(',') : '-') +
              (o.r != null ? ':r' + Number(o.r).toFixed(2) : '')),
        fl: (s.fl || []).map(f => hx(f.c)),
        ar: (s.ar || []).map(a => hx(a.c)),
        lb: (s.lb || []).map(l => l[0]),
        nEx: (s.ex || []).length, nFl: (s.fl || []).length, nAr: (s.ar || []).length,
        ley: (typeof cmLeyendaPresente === 'function') ? cmLeyendaPresente(s).map(x => x.id) : 'SIN FN'
      };
    } catch (x) { return { ERR: String(x).slice(0, 110) } }
  })();
  /* ══ LOS PIXELES POR COLOR ══ */
  R.px = (function () {
    try {
      const cv = EL('cm3d-cv').querySelector('canvas');
      const o = document.createElement('canvas'); o.width = cv.width; o.height = cv.height;
      const x = o.getContext('2d'); x.drawImage(cv, 0, 0);
      const d = x.getImageData(0, 0, o.width, o.height).data;
      const OBJ = { violOsc:[0x7e,0x22,0xce], violCla:[0xc0,0x84,0xfc], celeste:[0x38,0xbd,0xf8],
                    verde:[0x2f,0x9e,0x44], gris:[0x9a,0x9a,0x95], naranja:[0xe0,0x8a,0x1e],
                    azul:[0x2f,0x6f,0xd0], rojo:[0xd8,0x43,0x3b] };
      const out = { opacos:0 };
      Object.keys(OBJ).forEach(k => { out[k] = 0 });
      for (let i = 0; i < d.length; i += 4) {
        if (d[i+3] < 40) continue;
        out.opacos++;
        Object.keys(OBJ).forEach(k => { const c = OBJ[k];
          /* ⚠️ LA TOLERANCIA ES ESTRICTA Y SE MIDIO POR QUE: con 46 por canal, los brillos de
             los vasos azules caian dentro del celeste y daban unos 500 pixeles de base en TODAS
             las escenas, tambien en las que no dibujan ninguna cava izquierda. Con 24 la base
             baja y lo que queda es la senial. El control sigue siendo la escena sin la lesion. */
          if (Math.abs(d[i]-c[0]) < 24 && Math.abs(d[i+1]-c[1]) < 24 && Math.abs(d[i+2]-c[2]) < 24) out[k]++ });
      }
      return out;
    } catch (x) { return { ERR: String(x).slice(0, 110) } }
  })();
  /* ══ EL VIOLETA POR BANDA DE TONO, Y POR QUE HACE FALTA ══════════════════════════════════
     Los dos tuneles se dibujan SEMITRANSPARENTES -opacidad 0,5 y 0,65-, asi que el pixel que
     sale del lienzo es el violeta MEZCLADO con lo que tiene detras: comparar contra el valor
     exacto de la constante da CERO aunque el color este aplicado, que es un denominador vacio.
     Medido: con tolerancia estricta el tunel oscuro del switch auricular daba 1 pixel.
     Lo que SI sobrevive a la mezcla sobre un fondo neutro es el TONO. Se cuentan los pixeles
     cuyo tono cae en la banda del violeta y se los parte en dos grupos por CLARIDAD, que es
     exactamente lo que la orden pide demostrar: que con dos tuneles se distingan entre si por
     luminancia. En HEAD los dos llevan el MISMO violeta, asi que tiene que salir UN grupo. */
  R.viol = (function () {
    try {
      const cv = EL('cm3d-cv').querySelector('canvas');
      const o = document.createElement('canvas'); o.width = cv.width; o.height = cv.height;
      const x = o.getContext('2d'); x.drawImage(cv, 0, 0);
      const d = x.getImageData(0, 0, o.width, o.height).data;
      const Ls = [];
      for (let i = 0; i < d.length; i += 4) {
        if (d[i+3] < 40) continue;
        const r = d[i]/255, g = d[i+1]/255, b = d[i+2]/255;
        const mx = Math.max(r,g,b), mn = Math.min(r,g,b), dl = mx-mn;
        if (dl < 0.12) continue;
        let h = (mx===r) ? (60*(((g-b)/dl)%6)) : ((mx===g) ? (60*(((b-r)/dl)+2)) : (60*(((r-g)/dl)+4)));
        if (h < 0) h += 360;
        if (h < 250 || h > 300) continue;
        Ls.push((mx+mn)/2);
      }
      if (!Ls.length) return { n: 0 };
      Ls.sort(function (a,b2) { return a-b2 });
      const med = (Math.min.apply(null, Ls) + Math.max.apply(null, Ls)) / 2;
      const bajo = Ls.filter(function (v) { return v <= med }), alto = Ls.filter(function (v) { return v > med });
      const prom = function (a) { return a.length ? +(a.reduce(function (p,c) { return p+c }, 0)/a.length).toFixed(3) : 0 };
      return { n: Ls.length, nBajo: bajo.length, nAlto: alto.length,
               lumBajo: prom(bajo), lumAlto: prom(alto),
               rango: +(Math.max.apply(null, Ls) - Math.min.apply(null, Ls)).toFixed(3),
               dosGrupos: (bajo.length > 20 && alto.length > 20) };
    } catch (x) { return { ERR: String(x).slice(0, 110) } }
  })();
  /* ══ EL SOLAPE DE CAJAS DE ROTULO ══ */
  R.rot = (function () {
    try {
      const host = EL('cm3d-cv');
      const ns = Array.prototype.slice.call(host.querySelectorAll('.cm3d-lbl'))
        .filter(n => getComputedStyle(n).display !== 'none');
      const rs = ns.map(n => { const r = n.getBoundingClientRect();
        return { t:(n.textContent||'').trim(), x:r.left, y:r.top, w:r.width, h:r.height } });
      const hr = host.getBoundingClientRect();
      let sol = 0, fuera = 0; const pares = [];
      for (let i = 0; i < rs.length; i++) {
        if (rs[i].y < hr.top - 2 || rs[i].y + rs[i].h > hr.bottom + 2) fuera++;
        for (let j = i + 1; j < rs.length; j++) {
          const ox = Math.min(rs[i].x+rs[i].w, rs[j].x+rs[j].w) - Math.max(rs[i].x, rs[j].x);
          const oy = Math.min(rs[i].y+rs[i].h, rs[j].y+rs[j].h) - Math.max(rs[i].y, rs[j].y);
          if (ox > 3 && oy > 3) { sol++; pares.push(rs[i].t + ' x ' + rs[j].t + ' = ' + Math.round(ox) + 'x' + Math.round(oy)) }
        }
      }
      return { n: rs.length, solapes: sol, pares: pares, fuera: fuera, textos: rs.map(r => r.t) };
    } catch (x) { return { ERR: String(x).slice(0, 110) } }
  })();
  /* ══ LAS DOS LEYENDAS DEL DOCUMENTO ══ */
  R.leg = (function () {
    const vis = p => CM_LEY.filter(e => { const n = EL(p + e.id); return n && !n.hidden }).map(e => e.id);
    try { return { d3: vis('cm3d-leg-'), esq: vis('cm3d-leg2-') } } catch (x) { return { ERR:String(x).slice(0,90) } }
  })();
  return R;
})()`;

/* Las constantes, medidas una sola vez: matiz y luminancia relativa. */
const MEDIRCOL = `(() => {
  const lin = v => { v /= 255; return (v <= 0.03928) ? (v/12.92) : Math.pow((v+0.055)/1.055, 2.4) };
  const L = c => 0.2126*lin((c>>16)&255) + 0.7152*lin((c>>8)&255) + 0.0722*lin(c&255);
  const H = c => { const r=((c>>16)&255)/255, g=((c>>8)&255)/255, b=(c&255)/255;
    const mx=Math.max(r,g,b), mn=Math.min(r,g,b), d=mx-mn;
    if (d < 1e-9) return 0;
    let h = (mx===r) ? (60*(((g-b)/d)%6)) : ((mx===g) ? (60*(((b-r)/d)+2)) : (60*(((r-g)/d)+4)));
    return (h < 0) ? h+360 : h };
  const C = { violOsc: TGA3D_C.violet, violCla: TGA3D_C.violetClaro, celeste: CM_C.celeste,
              verde: CM_C.green, azul: CM_C.blue, rojo: CM_C.red, gris: CM_C.grey, naranja: CM_C.orange };
  const o = { val:{}, lum:{}, mat:{} };
  Object.keys(C).forEach(k => { o.val[k] = '0x' + C[k].toString(16).padStart(6,'0');
    o.lum[k] = +L(C[k]).toFixed(4); o.mat[k] = +H(C[k]).toFixed(1) });
  const cr = (a,b) => { const x=L(a), y=L(b); return +(((Math.max(x,y)+0.05)/(Math.min(x,y)+0.05))).toFixed(2) };
  const dh = (a,b) => { let d = Math.abs(H(a)-H(b)); if (d > 180) d = 360-d; return +d.toFixed(1) };
  o.pares = {
    'violOsc/violCla  luminancia': cr(C.violOsc, C.violCla),
    'violOsc/azul     matiz': dh(C.violOsc, C.azul),
    'violCla/azul     matiz': dh(C.violCla, C.azul),
    'violOsc/rojo     matiz': dh(C.violOsc, C.rojo),
    'violCla/rojo     matiz': dh(C.violCla, C.rojo),
    'celeste/azul     luminancia': cr(C.celeste, C.azul),
    'celeste/azul     matiz': dh(C.celeste, C.azul),
    'celeste/violOsc  matiz': dh(C.celeste, C.violOsc),
    'celeste/violCla  matiz': dh(C.celeste, C.violCla),
    'verde/azul       matiz': dh(C.verde, C.azul),
    'verde/rojo       matiz': dh(C.verde, C.rojo),
    'verde/naranja    matiz': dh(C.verde, C.naranja)
  };
  /* El fondo efectivo del lienzo en cada tema, y el contraste de cada violeta contra el. */
  try {
    const host = document.getElementById('cm3d-cv');
    const bg = host ? getComputedStyle(host).backgroundColor : '';
    const m = String(bg).match(/[0-9.]+/g) || [];
    const hex = (m.length >= 3) ? ((+m[0] << 16) | (+m[1] << 8) | (+m[2])) : null;
    o.fondo = bg; o.fondoHex = (hex == null) ? '-' : ('0x' + hex.toString(16).padStart(6,'0'));
    if (hex != null) { o.pares['violOsc/fondo  luminancia'] = cr(C.violOsc, hex);
                       o.pares['violCla/fondo  luminancia'] = cr(C.violCla, hex);
                       o.pares['celeste/fondo  luminancia'] = cr(C.celeste, hex);
                       o.pares['verde/fondo    luminancia'] = cr(C.verde, hex) }
  } catch (x) {}
  return o;
})()`;

const br = await _pw.chromium.launch({ channel: 'chrome' });
const salida = {};
const TEMAS = arg('--tema') ? [arg('--tema')] : ['dark', 'light'];
const SOLOE = arg('--solo') ? arg('--solo').split(',') : null;
for (const tema of TEMAS) {
  for (const e of ESC) {
    if (SOLOE && SOLOE.indexOf(e.n) < 0) continue;
    const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
    const errs = [];
    pg.on('pageerror', x => errs.push('PAGE ' + x.message.slice(0, 130)));
    try {
      await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
      await pg.waitForTimeout(1700);
      const r = await pg.evaluate(CUERPO(e, tema));
      r.errs = errs.filter(x => !/ERR_FILE_NOT_FOUND|favicon/.test(x));
      if (!salida._col) { try { salida._col = await pg.evaluate(MEDIRCOL) } catch (x) {} }
      salida[tema + ':' + e.n] = r;
    } catch (x) { salida[tema + ':' + e.n] = { fatal: String(x).slice(0, 200), errs } }
    await pg.close();
  }
}
await br.close();
console.log(JSON.stringify(salida, null, 1));
