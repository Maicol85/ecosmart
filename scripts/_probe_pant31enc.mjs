#!/usr/bin/env node
/**
 * _probe_pant31enc.mjs - R5 a R7 de PANT-31 (2026-11-10). Un arbol (--file), apto para A/B.
 *  R5 la constancia: tres oraciones, cada una en su renglon, con el espacio entre las dos ultimas.
 *  R6 el logo: a la IZQUIERDA, con su proporcion, en pantalla, en el PDF y en la imagen guardada,
 *     probado con un logo ANCHO, uno CUADRADO y sin logo.
 *  R7 el nombre de la institucion CENTRADO en el ancho de la hoja y a la altura del logo, en las
 *     tres superficies.
 * Los logos de prueba se generan con un canvas en la propia pagina: son data:image/png validos
 * y no hay un solo archivo de la institucion en el repo.
 * Nombre propio: verificado con ls, no existia.
 */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3400 });
const R = { file: FILE };
R.entrar = await S.entrar();
await S.viewport(1440, 900);
await S.ev(() => {
  const set = (id, v) => { const e = document.getElementById(id); if (e) { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); } };
  try {
    localStorage.setItem('centro_tipo_activo', 'default');
    localStorage.setItem('centro_nombre_activo', 'Centro Ficticio de Cardiologia del Norte');
    /* ⚠️ LAS CLAVES SON `ett_medicos` Y `ett_medico_principal`, medidas en el archivo. La
       primera version sembraba `eco_medicos` y la firma salia «____»: una siembra que no entra
       se lee como un dato que la app no publica. */
    localStorage.setItem('ett_medicos', JSON.stringify([{ nombre: 'Dra. Ficticia Perez', matricula: '12345', especialidad: 'Cardiologia' }]));
    localStorage.setItem('ett_medico_principal', '0');
  } catch (e) {}
  set('nombre', 'Prueba Ficticia, Ana'); set('ci', '1.234.567-8'); set('sexo', 'F');
  set('cfg-med-lugar', 'Artigas');
  if (window.showTab) showTab('informe');
});
await S.esperar(400);

/* ── R5 ── */
R.R5 = await S.ev(() => {
  const def = DOC_DEFS.constancia, D = docDatos();
  const bl = def.bloques();
  const maq = docMaquetar(def, D, docBloquesNuevos(def, D));
  const ops = maq.hojas[0].filter(o => o.k === 't' || o.k === 'tw' || o.k === 'c' || o.k === 'r')
    .map(o => ({ k: o.k, y: Math.round(o.y * 100) / 100, s: o.k === 'tw' ? o.ws.map(w => w.s).join(' ') : o.s }));
  const iExt = ops.findIndex(o => o.s.indexOf('Se extiende la presente') === 0);
  const iSin = ops.findIndex(o => o.s.indexOf('Sin más, saluda') === 0);
  if (typeof docCerrar === 'function') docCerrar();
  docAbrir('constancia');
  const h = document.getElementById('doc-hoja');
  const ps = Array.prototype.slice.call(h.querySelectorAll('p.doc-p')).map(p => p.innerText.trim());
  return {
    bloques: bl.map(b => b.t),
    ops: ops,
    extiendeArrancaRenglon: iExt >= 0, sinMasArrancaRenglon: iSin >= 0,
    separacionMm: (iExt >= 0 && iSin >= 0) ? Math.round((ops[iSin].y - ops[iExt].y) * 100) / 100 : null,
    hojas: maq.n,
    parrafosPantalla: ps,
    espPantalla: h.querySelectorAll('.doc-p + div[style*="mm"]').length
  };
});

/* ── R6 + R7, con los tres logos ── */
const CASOS = ['sinLogo', 'ancho', 'cuadrado'];
R.R6 = {};
for (const caso of CASOS) {
  R.R6[caso] = await S.ev(async (c) => {
    /* El logo de prueba se dibuja en un canvas: data:image/png valido, sin archivos en el repo. */
    const hacer = (w, hh, col) => {
      const cv = document.createElement('canvas'); cv.width = w; cv.height = hh;
      const x = cv.getContext('2d'); x.fillStyle = col; x.fillRect(0, 0, w, hh);
      x.fillStyle = '#fff'; x.fillRect(2, 2, Math.max(1, w - 4), Math.max(1, hh - 4));
      return cv.toDataURL('image/png');
    };
    try {
      if (c === 'sinLogo') localStorage.removeItem('logo_centro_default');
      if (c === 'ancho') localStorage.setItem('logo_centro_default', hacer(300, 50, '#1f3a5f'));
      if (c === 'cuadrado') localStorage.setItem('logo_centro_default', hacer(120, 120, '#1f3a5f'));
    } catch (e) { return { err: String(e).slice(0, 80) }; }
    const D = docDatos();
    const def = DOC_DEFS.constancia;
    const maq = docMaquetar(def, D, docBloquesNuevos(def, D));
    const ops = maq.hojas[0];
    const img = ops.filter(o => o.k === 'img')[0] || null;
    const cir = ops.filter(o => o.k === 'circ')[0] || null;
    const nom = ops.filter(o => o.k === 'c' && o.col && o.col[0] === 31);
    /* la imagen guardada: el SVG que rasteriza docGuardarImagen */
    const svg = docOpsASvg(maq);
    const mImg = svg.match(/<image x="([0-9.]+)" y="([0-9.]+)" width="([0-9.]+)" height="([0-9.]+)"[^>]*preserveAspectRatio="([^"]+)"/);
    const mTxt = svg.match(/<text x="([0-9.]+)"[^>]*text-anchor="middle"[^>]*fill="rgb\(31,58,95\)"/);
    /* pantalla.
       ⚠️ SE ESPERA A QUE EL `<img>` CARGUE. Un data URL tambien carga en otro cuadro: medido
       antes de esperarlo, el logo informaba 0x0 con naturalWidth 0, o sea «el logo no esta»
       sobre un logo que si estaba. */
    if (typeof docCerrar === 'function') docCerrar();
    docAbrir('constancia');
    const h = document.getElementById('doc-hoja');
    const im0 = h.querySelector('.doc-enc-logo');
    if (im0) { try { await im0.decode(); } catch (e) { await new Promise(r => setTimeout(r, 300)); } }
    const enc = h.querySelector('.doc-enc');
    const rh = h.getBoundingClientRect(), re = enc.getBoundingClientRect();
    const logo = enc.querySelector('.doc-enc-logo'), ini = enc.querySelector('.doc-enc-ini');
    const nm = enc.querySelector('.doc-enc-nom');
    const rl = (logo || ini).getBoundingClientRect(), rn = nm.getBoundingClientRect();
    return {
      papel: {
        logo: img ? { x: img.x, y: img.y, w: img.w, h: img.h } : null,
        circ: cir ? { x: cir.x, y: cir.y, r: cir.r, s: cir.s } : null,
        nombreCentrado: nom.length > 0, nLineas: nom.length,
        nombreY: nom.length ? Math.round(nom[0].y * 100) / 100 : null,
        centroHoja: DOC_GEO.W / 2,
        logoALaIzquierda: img ? (img.x === DOC_GEO.ML) : (cir ? (cir.x === DOC_GEO.ML + 7) : null)
      },
      imagen: { tieneImage: !!mImg, x: mImg ? +mImg[1] : null, w: mImg ? +mImg[3] : null,
                h: mImg ? +mImg[4] : null, proporcion: mImg ? mImg[5] : null,
                nombreAnchoMedio: !!mTxt, nombreX: mTxt ? +mTxt[1] : null, centroPx: (DOC_GEO.W / 2 * 3.7795275591).toFixed(2) },
      pantalla: {
        cols: getComputedStyle(enc).gridTemplateColumns,
        logoEs: logo ? 'img' : (ini ? 'circulo' : null),
        logoX: Math.round(rl.x - rh.x), logoW: Math.round(rl.width), logoH: Math.round(rl.height),
        natural: logo ? (logo.naturalWidth + 'x' + logo.naturalHeight) : null,
        proporcionOk: logo ? (Math.abs((rl.width / rl.height) - (logo.naturalWidth / logo.naturalHeight)) < 0.06) : null,
        fit: logo ? getComputedStyle(logo).objectFit : null,
        nombreCentroDesv: Math.round(((rn.x + rn.width / 2) - (rh.x + rh.width / 2)) * 10) / 10,
        nombreCentroVertDesv: Math.round(((rn.y + rn.height / 2) - (rl.y + rl.height / 2)) * 10) / 10,
        cuerpoNombre: getComputedStyle(nm).fontSize,
        cuerpoHoja: getComputedStyle(h).fontSize,
        titulo: (function () { const t = h.querySelector('.doc-tit'); return t ? getComputedStyle(t).fontSize : null; })()
      }
    };
  }, caso);
}
/* se deja el almacenamiento como estaba */
await S.ev(() => { try { localStorage.removeItem('logo_centro_default'); } catch (e) {} });
R.errores = S.errs.slice(0, 10);
console.log(JSON.stringify(R, null, 1));
S.cerrar();
process.exit(0);
