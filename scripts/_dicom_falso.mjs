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
