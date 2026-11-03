/*
 * _probe_pant3rev.mjs - el CENSO de las frases de «revision pendiente» (tanda PANT-3, commit 3a).
 * Nombre propio: verificado con ls contra HEAD, no existia. SOLO LECTURA de la app.
 *
 * ⚠️ POR QUE EN EL NAVEGADOR Y NO POR CENSO ESTATICO, MEDIDO. Un censo sobre el texto de
 * index.html tiene que separar la nota interna del codigo del texto que el medico lee, y
 * enmascarar los comentarios con una expresion regular NO FUNCIONA en este archivo: el
 * `/*` ... `*` + `/` no graduado empareja cada apertura con el cierre siguiente, y un `/*`
 * dentro de una cadena o de una expresion regular desincroniza el emparejamiento. Medido:
 * enmascaraba el 74 % del archivo y se comia el control positivo -la unica frase que la primera
 * pasada si habia encontrado-. Un censo que pierde lo que busca es peor que no hacerlo.
 *
 * Aca se junta lo que el medico puede LEER, y nada mas: el texto del DOM de las veinte
 * pestanias con todas sus secciones abiertas -sin los `<script>`, que es la trampa que la tanda
 * C2 documenta: `body.textContent` trae el codigo fuente-, las ochenta y dos tarjetas ⓘ abiertas
 * una por una, las fichas de Referencias, el panel de Evidencia y las cuatro superficies del
 * papel.
 *
 *   node scripts/_probe_pant3rev.mjs --file <index.html> --out /tmp/p3rev.json
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CAND })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p3rev.json';

/* Las frases que la regla del medico persigue. Cada una con su nombre, para poder decir por que
   entro. El CONTROL POSITIVO va al final: una frase que HEAD si tiene, para que un cero no se
   pueda leer como «no hay nada» cuando lo que hay es una sonda que no mira. */
const PATS = [
  ['pendiente de revision',   'pendientes? de (revisi|validaci|que (lo|la|los|las) revis)'],
  ['sin revision',            'sin revisi[oó]n'],
  ['sin validar / no validado', 'sin validar|no validad[oa]s?'],
  ['a confirmar por alguien', '(a|por) confirmar[^.;]{0,60}(cardi[oó]logo|especialista|experto)'],
  ['a revisar por alguien',   '(a|por) revisar[^.;]{0,60}(cardi[oó]logo|especialista|experto)'],
  ['especialista revisa',     '(cardi[oó]logo|especialista|experto)[^.;]{0,70}(revis|valid)'],
  ['revision no hecha',       'revisi[oó]n no se (hizo|realiz)'],
  ['borrador / otra herramienta', '(borrador|propuesta)[^.;]{0,90}(otra herramienta|sin revisi[oó]n cl)'],
  ['hecho por otra herramienta',  'otra herramienta[^.;]{0,70}(sin revisi|sin valid)']
];
/* Los avisos GENERALES que se MANTIENEN. Se miden aparte para poder afirmar que no se perdieron. */
const GEN = [
  /* ⚠️ LA PRIMERA VERSION DE ESTOS TRES PATRONES DABA CERO SOBRE AVISOS QUE SI ESTAN, y son dos
     errores mios: el de apoyo clinico llevaba `[^.]{0,80}` entre las dos mitades y el texto real
     tiene un PUNTO en medio -«de apoyo clinico. No reemplaza»-, y el de la recomendacion pedia
     «no constituye» cuando el texto dice «NI constituye». Un contador de avisos generales que da
     cero se lee como «se perdieron», que es justo lo contrario de lo que pasaba. */
  ['apoyo clinico',      'de apoyo cl[ií]nic[oa]'],
  ['no reemplaza juicio','no reemplaza el juicio m[eé]dic'],
  ['no recomendacion',   '(no|ni) constituye una recomendaci'],
  ['esquema ilustrativo','[Ee]squema ilustrativo']
];

const JUNTAR = `(() => {
  const out = { partes: {}, nGlobos: 0, nFichas: 0, err: [] };
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  /* El texto del DOM SIN los script ni los style: body.textContent trae el codigo fuente de los
     diecinueve bloques inline, y entonces el censo se mide a si mismo -los comentarios que
     explican por que una frase se retiro la contienen-. */
  const textoDe = (raiz) => {
    let t = '';
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        let p = n.parentElement;
        while (p) { const g = p.tagName;
          if (g === 'SCRIPT' || g === 'STYLE' || g === 'TEMPLATE') return NodeFilter.FILTER_REJECT;
          p = p.parentElement; }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    while (w.nextNode()) t += ' ' + w.currentNode.nodeValue;
    return t;
  };
  const TABS = ['datos','doppler','vd','valvulas','contractilidad','sgl','pericardio','otros',
                'hemodinamica','pulmonar','ete','cardioOnco','amiloidosis','congenitas',
                'congenitas2','lab','calculadoras','refs','imagenes','informe','guardados'];
  TABS.forEach(function (t) {
    try { if (typeof showTab === 'function') showTab(t) } catch (e) { out.err.push('tab ' + t) }
    try { if (typeof ccSubTab === 'function' && (t === 'congenitas' || t === 'congenitas2')) ccSubTab(t) } catch (e) {}
    /* Todas las secciones y todas las tarjetas, abiertas: lo que esta en display:none igual
       aporta su textContent, pero lo que se RENDERIZA al abrir no existe hasta que se abre. */
    const sec = document.getElementById('tab-' + t);
    if (!sec) { out.err.push('sin tab-' + t); return }
    Array.prototype.forEach.call(sec.querySelectorAll('.sacc-hdr, .lab-acc-hdr, .card-head'), function (h) {
      try { h.click() } catch (e) {}
    });
    out.partes['tab:' + t] = textoDe(sec);
    /* ⚠️ LOS GLOBOS SE ABREN ACA, CON SU PESTANIA DELANTE, Y NO EN UN BARRIDO APARTE AL FINAL.
       Lo destapo el CONTROL POSITIVO: con todos los globos clickeados despues del bucle, el censo
       daba CERO sobre el arbol que SI tiene la frase, y el denominador salia identico en los dos
       arboles -misma cantidad de caracteres tras retirar 679-, que es la firma de una parte
       vacia. La causa esta documentada en _vInfoColocar: un boton sin geometria no se ancla, se
       informa y NO se abre; con la pestania oculta los ochenta botones miden 0 x 0. */
    let tgT = '', nAb = 0;
    const fallaron = [];
    Array.prototype.forEach.call(sec.querySelectorAll('[data-vinfo]'), function (bb, i) {
      try {
        /* Abrir lo que lo contenga y traerlo a la vista: un boton dentro de una tarjeta cerrada o
           de un DETAILS plegado mide 0 x 0 y su globo no abre. Medido: 56 de 72 abrian. */
        let a = bb.parentElement;
        while (a && a !== sec) {
          if (a.tagName === 'DETAILS') a.open = true;
          if (a.classList && a.classList.contains('card') && !a.classList.contains('open')) {
            const h = a.querySelector('.card-head, .sacc-hdr'); if (h) { try { h.click() } catch (e) {} }
          }
          a = a.parentElement;
        }
        try { bb.scrollIntoView({ block: 'center' }) } catch (e) {}
        bb.click();
        const c = document.getElementById('vinfo-card');
        const abierta = c && getComputedStyle(c).display !== 'none' && String(c.textContent || '').length > 20;
        if (abierta) { nAb++; tgT += ' ||' + (bb.getAttribute('data-vinfo') || ('#' + i)) + ': ' + String(c.textContent || '') }
        else fallaron.push(bb.getAttribute('data-vinfo') || ('#' + i));
        bb.click();
      } catch (e) { out.err.push('globo ' + t + '/' + i) }
    });
    out.partes['globos:' + t] = tgT;
    out.globosPorTab = out.globosPorTab || {};
    out.globosPorTab[t] = { botones: sec.querySelectorAll('[data-vinfo]').length, abiertos: nAb,
                            fallaron: fallaron };
  });
  /* Las fichas de Referencias, abiertas por su encabezado. */
  try { if (typeof showTab === 'function') showTab('refs') } catch (e) {}
  const refs = document.getElementById('tab-refs');
  if (refs) {
    Array.prototype.forEach.call(refs.querySelectorAll('[onclick*="toggleRef"]'), function (h) {
      try { h.click() } catch (e) {} });
    out.nFichas = refs.querySelectorAll('[id^="ref-"]').length;
    out.partes['refs:abiertas'] = textoDe(refs);
  }
  out.nGlobos = document.querySelectorAll('[data-vinfo]').length;
  return out;
})()`;

const PAPEL = `(() => {
  const o = {};
  const T = (id) => { const e = document.getElementById(id); return e ? String(e.value || '') : '' };
  ['estandar','narrativo','conciso'].forEach(function (st) {
    try { if (typeof setEstiloInforme === 'function') setEstiloInforme(st) } catch (e) {}
    try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
    o['informe_' + st] = T('informe_texto'); o['suma_' + st] = T('en_suma');
  });
  /* ⚠️ EL PANEL DE EVIDENCIA ES UN HUECO QUE HAY QUE CERRAR, Y LO DESTAPO EL CENSO ESTATICO:
     una de las frases candidatas vive en la seccion de la miocardiopatia arritmogenica del panel
     -«Padua 2020 y el consenso europeo de 2023, todavia no validados»- y el censo del navegador
     no la veia, porque el panel es un modal que solo existe cuando se renderiza. Se renderiza
     para la escena montada, asi que cada escena aporta las secciones que despierta. */
  try { if (typeof indicRender === 'function') indicRender() } catch (e) {}
  const pan = document.getElementById('indic-cuerpo');
  o.evidencia = pan ? String(pan.textContent || '') : 'SIN PANEL';
  /* La hoja aparte de congenitas y los bloques integrados, que son textarea ocultos. */
  let x = '';
  document.querySelectorAll('textarea[id^="cc-txt-"], textarea[id^="am-txt-"]').forEach(function (t) {
    x += ' ||' + t.id + ': ' + String(t.value || '');
  });
  o.hojas = x;
  return o;
})()`;

const ESCENA = `((esc) => {
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return; e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) };
  Object.keys(esc.c || {}).forEach(k => S(k, esc.c[k]));
  (esc.chk || []).forEach(id => { const e = document.getElementById(id);
    if (e) { e.checked = true; e.dispatchEvent(new Event('change', { bubbles: true })) } });
  Object.keys(window).forEach(k => { if (/^calc[A-Z]/.test(k) && typeof window[k] === 'function') {
    try { window[k]() } catch (e) {} } });
  try { if (typeof _recalcModulos === 'function') _recalcModulos('rev') } catch (e) {}
  return true;
})(ESC)`;

/* Escenas que despiertan lo que el papel puede decir: cada congenita integrada. */
const ESCENAS = {
  tga:   { c: { peso:'70', talla:'170', tga_tipo:'dtga', tga_cirugia:'auricular' }, chk: ['tga_incluir_chk'] },
  mca:   { c: { peso:'70', talla:'170', mca_tad:'34', fevd:'40' }, chk: ['mca_incluir_chk'] },
  mch:   { c: { peso:'70', talla:'170', siv:'18', ppvi:'10', mch_grad_reposo:'40' }, chk: ['mch_incluir_chk'] },
  amilo: { c: { peso:'70', talla:'170', siv:'16', ppvi:'15', sgl:'-12' } }
};

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE, textos: {} };
try {
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([e.message.slice(0, 140)]) });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
  await pg.waitForTimeout(1600);
  const j = await pg.evaluate(JUNTAR);
  OUT.nGlobos = j.nGlobos; OUT.nFichas = j.nFichas; OUT.errMontaje = j.err;
  OUT.globosPorTab = j.globosPorTab || {};
  Object.assign(OUT.textos, j.partes);
  for (const k of Object.keys(ESCENAS)) {
    await pg.evaluate(ESCENA.replace('ESC', JSON.stringify(ESCENAS[k])));
    await pg.waitForTimeout(450);
    const p = await pg.evaluate(PAPEL);
    Object.keys(p).forEach(kk => { OUT.textos['papel:' + k + ':' + kk] = p[kk] });
  }
  await pg.close();
} catch (e) { OUT._err = String(e).slice(0, 300) }
try { await b.close() } catch (e) {}

/* El censo, en node: sobre cada parte, con su ubicacion. */
const res = { hallazgos: [], generales: {}, denom: {} };
for (const [loc, txt] of Object.entries(OUT.textos)) {
  const t = String(txt || '').replace(/\s+/g, ' ');
  res.denom[loc] = t.length;
  for (const [nom, pat] of PATS) {
    const re = new RegExp(pat, 'gi');
    let mo;
    while ((mo = re.exec(t)) !== null) {
      const ini = Math.max(0, mo.index - 90), fin = Math.min(t.length, mo.index + mo[0].length + 90);
      res.hallazgos.push({ patron: nom, donde: loc, frase: t.slice(ini, fin) });
      if (res.hallazgos.length > 400) break;
    }
  }
}
for (const [nom, pat] of GEN) {
  let n = 0;
  for (const txt of Object.values(OUT.textos)) {
    const m = String(txt || '').match(new RegExp(pat, 'gi')); if (m) n += m.length;
  }
  res.generales[nom] = n;
}
OUT.censo = res;
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
const totalTexto = Object.values(res.denom).reduce((a, b2) => a + b2, 0);
console.log('DENOMINADOR: ' + Object.keys(OUT.textos).length + ' partes · ' + totalTexto +
            ' caracteres de texto legible · ' + OUT.nGlobos + ' globos · ' + OUT.nFichas + ' fichas');
let gb = 0, ga = 0;
Object.values(OUT.globosPorTab || {}).forEach(o => { gb += o.botones; ga += o.abiertos });
console.log('GLOBOS: ' + gb + ' botones, ' + ga + ' tarjetas ABIERTAS y leidas');
const fall = [];
Object.entries(OUT.globosPorTab || {}).forEach(([t, o]) => (o.fallaron || []).forEach(k => fall.push(t + '/' + k)));
if (fall.length) console.log('  globos que NO abrieron (quedan fuera del censo): ' + fall.join(', '));
const vacias = Object.entries(res.denom).filter(([k, v]) => v < 30).map(([k]) => k);
if (vacias.length) console.log('⚠️ partes con menos de 30 caracteres (denominador vacio): ' + vacias.join(', '));
console.log('HALLAZGOS: ' + res.hallazgos.length);
const porLoc = {};
res.hallazgos.forEach(h => { const k = h.patron + ' @ ' + h.donde; porLoc[k] = (porLoc[k] || 0) + 1 });
Object.entries(porLoc).sort((a, b2) => b2[1] - a[1]).forEach(([k, v]) => console.log('  ' + String(v).padStart(3) + 'x  ' + k));
console.log('AVISOS GENERALES (tienen que seguir): ' + JSON.stringify(res.generales));
if (OUT.errMontaje && OUT.errMontaje.length) console.log('errores de montaje: ' + OUT.errMontaje.join(', '));
console.log('escrito: ' + OUTF);
