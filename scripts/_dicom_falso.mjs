/**
 * _dicom_falso.mjs — CeiboMed / EcoSmart
 *
 * Arma archivos DICOM Parte 10 SINTETICOS, en memoria, para el conector falso.
 *
 * ⚠️ NO HAY NINGUN ARCHIVO DE PACIENTE ACA, y es la regla del repositorio: este repositorio es
 *    PUBLICO. Lo que sale de aca son bytes generados: un JPEG de 1x1 y un nombre inventado que
 *    se lee como inventado (`PRUEBA^SINTETICA`). Ningun dato de ninguna persona.
 *
 * ⚠️ EL CONSTRUCTOR ES EL MISMO QUE YA USA LA BATERIA EN TC-179, portado a Node sin cambiarle
 *    la forma: Explicit VR Little Endian, meta-grupo con su sintaxis de transferencia, y el
 *    pixel data ENCAPSULADO con su tabla de offsets y un fragmento por cuadro. Con otro
 *    constructor, una prueba podria pasar contra archivos que el lector de la app no acepta.
 */

/* JPEG Baseline de 1x1, el mismo literal que usa TC-179. Decodifica en cualquier navegador. */
export const JPEG_1x1 = new Uint8Array([
  255,216,255,224,0,16,74,70,73,70,0,1,1,1,0,96,0,96,0,0,255,219,0,67,0,8,6,6,7,6,5,8,7,7,7,9,
  9,8,10,12,20,13,12,11,11,12,25,18,19,15,20,29,26,31,30,29,26,28,28,32,36,46,39,32,34,44,35,28,
  28,40,55,41,44,48,49,52,52,52,31,39,57,61,56,50,60,46,51,52,50,255,192,0,11,8,0,1,0,1,1,1,17,
  0,255,196,0,20,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,9,255,196,0,20,16,1,0,0,0,0,0,0,0,0,0,0,0,0,
  0,0,0,0,255,218,0,8,1,1,0,0,63,0,42,159,255,217]);

/* ⚠️ UN JPEG GRANDE SE HACE CON SEGMENTOS DE COMENTARIO, no con bytes pegados al final.
   El relleno va en marcadores COM (0xFFFE) entre el SOI y el resto, asi que el archivo pesa lo
   que se pida Y SIGUE SIENDO UN JPEG VALIDO que el navegador decodifica — a 1x1, pero decodifica.
   Con basura pegada al final el navegador lo abre igual por tolerancia, y eso es una tolerancia
   del motor y no una garantia: la prueba de memoria tiene que medir el camino completo, compresion
   incluida, y no el rechazo.
   Cada COM topa en 65533 bytes de carga porque su longitud son 16 bits y se incluye a si misma. */
export function jpegDeTamano(bytesPedidos) {
  const CARGA = 65533 - 2;                 // 65531 bytes de comentario por segmento
  const base = JPEG_1x1;
  const falta = Math.max(0, bytesPedidos - base.length);
  const n = Math.ceil(falta / (CARGA + 4));
  const partes = [base.subarray(0, 2)];    // SOI
  for (let i = 0; i < n; i++) {
    const seg = new Uint8Array(CARGA + 4);
    seg[0] = 0xFF; seg[1] = 0xFE;          // COM
    seg[2] = ((CARGA + 2) >> 8) & 255; seg[3] = (CARGA + 2) & 255;
    seg.fill(0x20, 4);                     // espacios: un comentario legal
    partes.push(seg);
  }
  partes.push(base.subarray(2));
  const total = partes.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(total);
  let p = 0;
  partes.forEach(x => { out.set(x, p); p += x.length; });
  return out;
}

const u16 = n => [n & 255, (n >> 8) & 255];
const u32 = n => [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >> 24) & 255];
const txt = s => { const a = []; for (let i = 0; i < s.length; i++) a.push(s.charCodeAt(i));
                   if (a.length % 2) a.push(0); return a; };
const VR4 = ['OB', 'OW', 'SQ', 'UN', 'UT'];

function el(g, e, vr, val) {
  const largo = VR4.indexOf(vr) > -1;
  return [].concat(u16(g), u16(e), txt(vr).slice(0, 2),
                   largo ? [0, 0].concat(u32(val.length)) : u16(val.length), val);
}

/**
 * Arma un DICOM Parte 10 con pixel data JPEG Baseline encapsulado.
 *
 * op.paciente  — { nombre, nacimiento, sexo, fechaEstudio }, todo opcional y todo INVENTADO.
 * op.frags     — lista de Uint8Array, un fragmento por cuadro (por omision, un JPEG de 1x1).
 * op.cuadros   — cuantos cuadros declara. Mas de uno lo convierte en cineloop.
 */
export function dicomSintetico(op) {
  const o = op || {};
  const frags = o.frags || [JPEG_1x1];
  const cuadros = o.cuadros || frags.length;
  const pac = o.paciente || {};
  let b = new Array(128).fill(0);
  b = b.concat(txt('DICM'));
  /* (0002,0002) Media Storage SOP Class: Ultrasound Multi-frame si hay varios cuadros, y
     Ultrasound Image si hay uno. Lo lee `_dcmImgLeer` como `sop` y lo usa `_clnkEsSR` para
     distinguir un informe estructurado de una imagen. */
  b = b.concat(el(0x0002, 0x0002, 'UI',
    txt(cuadros > 1 ? '1.2.840.10008.5.1.4.1.1.3.1' : '1.2.840.10008.5.1.4.1.1.6.1')));
  b = b.concat(el(0x0002, 0x0010, 'UI', txt('1.2.840.10008.1.2.4.50')));   // JPEG Baseline
  if (pac.fechaEstudio) b = b.concat(el(0x0008, 0x0020, 'DA', txt(pac.fechaEstudio)));
  b = b.concat(el(0x0008, 0x0060, 'CS', txt('US')));
  b = b.concat(el(0x0008, 0x0070, 'LO', txt(o.fabricante || 'ECOFALSO')));
  b = b.concat(el(0x0008, 0x1090, 'LO', txt(o.modelo || 'Modelo de prueba')));
  /* Los cuatro del paciente. Van en el orden del estandar, que es por numero de grupo. */
  if (pac.nombre)     b = b.concat(el(0x0010, 0x0010, 'PN', txt(pac.nombre)));
  if (pac.id)         b = b.concat(el(0x0010, 0x0020, 'LO', txt(pac.id)));
  if (pac.nacimiento) b = b.concat(el(0x0010, 0x0030, 'DA', txt(pac.nacimiento)));
  if (pac.sexo)       b = b.concat(el(0x0010, 0x0040, 'CS', txt(pac.sexo)));
  b = b.concat(el(0x0028, 0x0004, 'CS', txt('YBR_FULL_422')));
  if (cuadros > 1) b = b.concat(el(0x0028, 0x0008, 'IS', txt(String(cuadros))));
  b = b.concat(el(0x0028, 0x0010, 'US', u16(o.filas || 1)));
  b = b.concat(el(0x0028, 0x0011, 'US', u16(o.cols || 1)));
  /* Pixel data encapsulado: tabla de offsets primero —con una entrada por cuadro, que es lo
     que el lector de la app cuenta— y despues un fragmento por cuadro. */
  b = b.concat([].concat(u16(0x7FE0), u16(0x0010), txt('OB'), [0, 0], u32(0xFFFFFFFF)));
  const tabla = [].concat(...new Array(cuadros).fill(0).map(() => u32(0)));
  b = b.concat([].concat(u16(0xFFFE), u16(0xE000), u32(tabla.length), tabla));
  const cabezas = [];
  frags.forEach(fr => {
    const impar = fr.length % 2;
    cabezas.push({ cab: [].concat(u16(0xFFFE), u16(0xE000), u32(fr.length + impar)),
                   fr: fr, relleno: impar });
  });
  /* Se arma el buffer de una vez y no con `concat` de los fragmentos: un JPEG de 16 MB pasado
     por un array de numeros de JavaScript son cientos de MB de objetos. */
  const colaLargo = cabezas.reduce((a, x) => a + x.cab.length + x.fr.length + x.relleno, 0);
  const fin = [].concat(u16(0xFFFE), u16(0xE0DD), u32(0));
  const out = new Uint8Array(b.length + colaLargo + fin.length);
  out.set(b, 0);
  let p = b.length;
  cabezas.forEach(x => {
    out.set(x.cab, p); p += x.cab.length;
    out.set(x.fr, p);  p += x.fr.length;
    if (x.relleno) { out[p] = 0; p++; }
  });
  out.set(fin, p);
  return out;
}

/* ══════════════════════════════════════════════════════════════════════════════════════════
   DICOM SIN COMPRIMIR (ECO-CONECTOR-3)
   ══════════════════════════════════════════════════════════════════════════════════════════

   ⚠️ EL PIXEL DATA NO VA ENCAPSULADO, Y ESA ES TODA LA DIFERENCIA DE FORMA con `dicomSintetico`.
   En las sintaxis nativas —Explicit VR LE (1.2.840.10008.1.2.1) e Implicit VR LE
   (1.2.840.10008.1.2)— el elemento (7FE0,0010) trae su LONGITUD REAL y adentro estan los
   pixeles crudos, uno detras de otro: filas x columnas x muestras x bytes-por-muestra x cuadros.
   No hay tabla de offsets ni fragmentos, asi que un lector que de por sentado el encapsulado
   —como el de la app hasta esta tanda— tira «el pixel data no viene encapsulado» y se planta.

   ⚠️ EL META-GRUPO SIEMPRE ES EXPLICITO, sea cual sea la sintaxis del dataset. Es lo que dice la
   norma y lo que el lector de la app ya asume al recorrer el grupo 0002: si el meta tambien
   cambiara de forma, no habria manera de leer la sintaxis que dice como leer el resto.

   ⚠️ EN IMPLICITO NO HAY CAMPO VR: cada elemento es etiqueta (4 bytes) + longitud (4 bytes) +
   valor. El VR se deduce de un diccionario, que esta funcion no necesita porque ESCRIBE: lo que
   le hace falta al lector de la app es saber de antemano que ahi no hay dos letras.

   Nada de lo que sale de aca es de ninguna persona: los pixeles son una rampa calculada y el
   nombre, cuando se pide, es el mismo inventado de arriba. */

const TS_EXPL_LE = '1.2.840.10008.1.2.1';
const TS_IMPL_LE = '1.2.840.10008.1.2';

/* Un elemento del dataset, en la forma que corresponda a la sintaxis. */
function elDS(g, e, vr, val, implicito) {
  if (implicito) return [].concat(u16(g), u16(e), u32(val.length), val);
  return el(g, e, vr, val);
}

/* Los pixeles: una rampa determinista, distinta por cuadro, para que dos cuadros no salgan
   iguales y una prueba de cineloop pueda ver que avanza. Se arma sobre un Uint8Array y no sobre
   un array de numeros: un multicuadro de 16 bits son decenas de MB y en un array de JavaScript
   serian cientos. */
function pixelesRampa(filas, cols, cuadros, muestras, bytesPorMuestra) {
  const porCuadro = filas * cols * muestras * bytesPorMuestra;
  const out = new Uint8Array(porCuadro * cuadros);
  let p = 0;
  for (let f = 0; f < cuadros; f++) {
    for (let y = 0; y < filas; y++) {
      for (let x = 0; x < cols; x++) {
        for (let m = 0; m < muestras; m++) {
          const v = (x * 3 + y * 5 + f * 17 + m * 41) & 0xFFFF;
          if (bytesPorMuestra === 2) { out[p++] = v & 255; out[p++] = (v >> 8) & 255; }
          else out[p++] = v & 255;
        }
      }
    }
  }
  return out;
}

/**
 * Arma un DICOM Parte 10 con pixel data SIN COMPRIMIR.
 *
 * op.implicito  — true para Implicit VR LE; por omision, Explicit VR LE.
 * op.filas      — alto en pixeles (16 por omision).
 * op.cols       — ancho en pixeles (16 por omision).
 * op.cuadros    — cuantos cuadros. Mas de uno lo convierte en cineloop.
 * op.bits       — 8 o 16 bits por muestra (8 por omision).
 * op.color      — true para RGB (tres muestras por pixel); por omision, monocromo.
 * op.paciente   — igual que en `dicomSintetico`, todo inventado y todo opcional.
 */
export function dicomNativo(op) {
  const o = op || {};
  const imp = !!o.implicito;
  const filas = o.filas || 16, cols = o.cols || 16;
  const cuadros = o.cuadros || 1;
  const bits = (o.bits === 16) ? 16 : 8;
  const muestras = o.color ? 3 : 1;
  const bpm = bits / 8;
  const pac = o.paciente || {};

  let b = new Array(128).fill(0);
  b = b.concat(txt('DICM'));
  /* El meta-grupo, SIEMPRE explicito. */
  b = b.concat(el(0x0002, 0x0002, 'UI',
    txt(cuadros > 1 ? '1.2.840.10008.5.1.4.1.1.3.1' : '1.2.840.10008.5.1.4.1.1.6.1')));
  b = b.concat(el(0x0002, 0x0010, 'UI', txt(imp ? TS_IMPL_LE : TS_EXPL_LE)));

  if (pac.fechaEstudio) b = b.concat(elDS(0x0008, 0x0020, 'DA', txt(pac.fechaEstudio), imp));
  b = b.concat(elDS(0x0008, 0x0060, 'CS', txt('US'), imp));
  b = b.concat(elDS(0x0008, 0x0070, 'LO', txt(o.fabricante || 'ECOFALSO'), imp));
  b = b.concat(elDS(0x0008, 0x1090, 'LO', txt(o.modelo || 'Modelo sin comprimir'), imp));
  if (pac.nombre)     b = b.concat(elDS(0x0010, 0x0010, 'PN', txt(pac.nombre), imp));
  if (pac.id)         b = b.concat(elDS(0x0010, 0x0020, 'LO', txt(pac.id), imp));
  if (pac.nacimiento) b = b.concat(elDS(0x0010, 0x0030, 'DA', txt(pac.nacimiento), imp));
  if (pac.sexo)       b = b.concat(elDS(0x0010, 0x0040, 'CS', txt(pac.sexo), imp));

  /* El grupo 0028 ENTERO, que es lo que hace falta para interpretar pixeles crudos. Con el
     encapsulado alcanzaba con filas y columnas porque el JPEG se describe a si mismo. */
  b = b.concat(elDS(0x0028, 0x0002, 'US', u16(muestras), imp));
  b = b.concat(elDS(0x0028, 0x0004, 'CS', txt(o.color ? 'RGB' : 'MONOCHROME2'), imp));
  if (o.color) b = b.concat(elDS(0x0028, 0x0006, 'US', u16(0), imp));   // interleaved
  if (cuadros > 1) b = b.concat(elDS(0x0028, 0x0008, 'IS', txt(String(cuadros)), imp));
  b = b.concat(elDS(0x0028, 0x0010, 'US', u16(filas), imp));
  b = b.concat(elDS(0x0028, 0x0011, 'US', u16(cols), imp));
  b = b.concat(elDS(0x0028, 0x0100, 'US', u16(bits), imp));
  b = b.concat(elDS(0x0028, 0x0101, 'US', u16(bits), imp));
  b = b.concat(elDS(0x0028, 0x0102, 'US', u16(bits - 1), imp));
  b = b.concat(elDS(0x0028, 0x0103, 'US', u16(0), imp));                // sin signo

  const px = pixelesRampa(filas, cols, cuadros, muestras, bpm);
  /* La cabecera del pixel data a mano: el valor son megas y pasarlo por `elDS` lo volcaria a un
     array de numeros. El VR es OW para 16 bits y OB para 8, los dos de longitud larga. */
  const cab = imp
    ? [].concat(u16(0x7FE0), u16(0x0010), u32(px.length))
    : [].concat(u16(0x7FE0), u16(0x0010), txt(bits === 16 ? 'OW' : 'OB'), [0, 0], u32(px.length));

  const out = new Uint8Array(b.length + cab.length + px.length);
  out.set(b, 0);
  out.set(cab, b.length);
  out.set(px, b.length + cab.length);
  return out;
}

/**
 * Un DICOM que DECLARA una sintaxis comprimida que EcoSmart no abre. Sirve para comprobar que el
 * mensaje de rechazo NOMBRA el formato y que la imagen sigue esperando en el conector.
 * El pixel data va encapsulado con un fragmento de relleno: lo que se prueba es el rechazo por
 * sintaxis, que ocurre ANTES de mirar un solo pixel.
 */
export function dicomNoSoportado(tsUid) {
  const ts = tsUid || '1.2.840.10008.1.2.5';     // RLE Lossless
  let b = new Array(128).fill(0);
  b = b.concat(txt('DICM'));
  b = b.concat(el(0x0002, 0x0002, 'UI', txt('1.2.840.10008.5.1.4.1.1.6.1')));
  b = b.concat(el(0x0002, 0x0010, 'UI', txt(ts)));
  b = b.concat(el(0x0008, 0x0070, 'LO', txt('ECOFALSO')));
  b = b.concat(el(0x0028, 0x0010, 'US', u16(16)));
  b = b.concat(el(0x0028, 0x0011, 'US', u16(16)));
  b = b.concat([].concat(u16(0x7FE0), u16(0x0010), txt('OB'), [0, 0], u32(0xFFFFFFFF)));
  b = b.concat([].concat(u16(0xFFFE), u16(0xE000), u32(0)));                  // tabla vacia
  b = b.concat([].concat(u16(0xFFFE), u16(0xE000), u32(8), [1, 2, 3, 4, 5, 6, 7, 8]));
  b = b.concat([].concat(u16(0xFFFE), u16(0xE0DD), u32(0)));
  return new Uint8Array(b);
}
