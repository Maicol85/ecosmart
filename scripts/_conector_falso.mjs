#!/usr/bin/env node
/**
 * _conector_falso.mjs — CeiboMed / EcoSmart
 *
 * Conector FALSO para las pruebas del panel de CeiboLink. Implementa las rutas del contrato
 * v1.1 que usa el panel de Configuracion, con las cabeceras CORS que ese contrato pide.
 *
 * NO es el conector de verdad y no pretende serlo: no recibe DICOM, no tiene Orthanc adentro y
 * no guarda nada en disco. Todo vive en memoria y se va con el proceso.
 *
 * ⚠️ POR QUE UN SERVIDOR DE VERDAD Y NO UN `fetch` SUSTITUIDO. Los casos de Orthanc que esta
 *    tanda retira sustituian `window.fetch`, que es mas barato. Pero un `fetch` sustituido NO
 *    puede probar CORS, ni el `Authorization` que viaja de verdad, ni que el navegador trate un
 *    404 distinto de un 503: lo unico que prueba es que la app llama a la funcion que le
 *    pusimos. Con un servidor real el pedido sale por la red (loopback) y el motor aplica sus
 *    propias reglas, que es justo la mitad del contrato que mas facil se rompe.
 *
 * ⚠️ EL ORIGEN DE LAS PRUEBAS NO ES EL DE PRODUCCION, Y NO ES UN DESCUIDO. El conector de
 *    verdad solo acepta `https://ecosmart.ceibomed.com`; la bateria sirve la app desde
 *    `http://127.0.0.1:<puerto al azar>`, asi que el origen cambia en cada corrida. Este falso
 *    acepta ADEMAS cualquier origen de loopback, y nunca responde `*`. Que el de verdad sea
 *    estricto es una propiedad SUYA, no de EcoSmart.
 *
 * Uso suelto:
 *     node scripts/_conector_falso.mjs            # puerto al azar, lo imprime
 *     CLNK_PORT=8043 node scripts/_conector_falso.mjs
 *     CLNK_ORIGENES=https://ejemplo.test node scripts/_conector_falso.mjs
 *
 * Uso desde el arnes:
 *     import { servirConectorFalso } from './_conector_falso.mjs';
 *     const f = await servirConectorFalso();   // { srv, port, puertoCerrado, escenario }
 *
 * Control del escenario desde la pagina (ruta FUERA del contrato, solo de pruebas):
 *     POST /_control   { "version": "1.0.0" }   → el falso se hace pasar por un conector 1.0
 *     POST /_control   { "reset": true }        → vuelve al escenario de fabrica
 *     POST /_control   { "escena": "dosEnvios" } → cambia el juego de imagenes (ver ESCENAS)
 *
 * ⚠️ LOS ARCHIVOS DICOM SON SINTETICOS Y SE GENERAN EN MEMORIA (`_dicom_falso.mjs`). No hay
 *    ningun archivo de ningun paciente en este repositorio, que es PUBLICO: lo que entrega la
 *    ruta del archivo es un JPEG de 1x1 dentro de un DICOM Parte 10 armado con el MISMO
 *    constructor que ya usa TC-179, y el nombre que trae adentro se lee como inventado.
 */

import { createServer } from 'node:http';
import { randomBytes, randomInt } from 'node:crypto';
import { dicomSintetico, dicomNativo, dicomNoSoportado, jpegDeTamano, JPEG_1x1 } from './_dicom_falso.mjs';

/* ⚠️ EL CODIGO Y EL TOKEN SE GENERAN AL AZAR EN CADA ARRANQUE, Y NO ESTAN ESCRITOS ACA.
   La primera version de este archivo los traia como dos constantes literales, y aunque eran
   valores inventados que no sirven fuera de este proceso, este repositorio es PUBLICO y su regla
   es que no entra ningun token ni ningun codigo de vinculacion al codigo ni a las pruebas. Con
   `randomBytes` no hay nada que leer en el archivo, y de paso el falso se parece mas al de
   verdad, que tambien los genera en cada arranque.
   El arnes publica el CODIGO a la pagina, porque un caso tiene que poder escribirlo; el TOKEN no
   viaja por ahi — los casos que comprueban que no aparece en la pantalla lo leen de
   `localStorage`, que es donde el modulo lo pone de verdad. */
const CODIGO_DE_PRUEBA = String(randomInt(0, 1000000)).padStart(6, '0');
const TOKEN_DE_PRUEBA = randomBytes(32).toString('hex');   // 64 hexadecimales, como el contrato

/* ══ LAS IMAGENES ════════════════════════════════════════════════════════════════════════════
   ⚠️ LA LISTA DEL CONTRATO NO DICE A QUE ESTUDIO DEL ECOGRAFO PERTENECE CADA IMAGEN: §3.8 deja
   `vista` en `null` a proposito y no hay ningun campo de estudio. Lo unico que EcoSmart tiene
   para agrupar es `equipo` + `recibida`, asi que las escenas de aca estan armadas para ejercitar
   justamente eso: un envio junto, dos envios de equipos distintos, y dos envios del MISMO equipo
   separados en el tiempo.

   Cada imagen lleva su `_buf` —los bytes del DICOM— que NO sale en la lista: la lista del
   contrato no tiene ese campo, y mandarlo seria inventar contrato. */
const MIN = 60 * 1000;

function img(id, equipo, recibida, tipo, buf, cuarentena, extra) {
  const o = { id: id, equipo: equipo, recibida: recibida, bytes: buf.length, tipo: tipo,
           modalidad: 'US', vista: null,
           vence: new Date(Date.parse(recibida) + 24 * 60 * MIN).toISOString().replace(/\.\d+Z$/, 'Z'),
           /* ══ CONTRATO 1.3 (§P2) ══ Los tres campos de cada imagen. Por omision es un DICOM que
              entro por el receptor, que es lo que todas las escenas anteriores eran. */
           origen: 'dicom', formato: 'dicom', se_puede_ver: true,
           _buf: buf, _cuarentena: !!cuarentena };
  if (extra) Object.keys(extra).forEach(k => { o[k] = extra[k]; });
  return o;
}

/* ══ LOS BYTES DEL BUZON (CONTRATO 1.3 §P2) ═══════════════════════════════════════════════════
   NINGUNO TRAE UN DATO DE NADIE: son cabeceras armadas a mano, del largo minimo que hace falta
   para que la firma se mida. El JPG y el PNG son dibujos del programa; los que no se pueden ver
   son su cabecera y nada mas, porque lo que prueban es que EcoSmart NO los abra.
   ⚠️ EL `formato` DEL PUENTE SE MIDE POR EL CONTENIDO, asi que estos bytes tienen que tener la
   firma de verdad: un TIF cuya firma no sea 49 49 2A 00 lo clasificaria como `desconocido` y la
   prueba mediria otra cosa. */
const _P = (...n) => Uint8Array.from(n);
function _ascii(t) { return Uint8Array.from(t.split('').map(c => c.charCodeAt(0))); }
function _junta(...partes) {
  let n = 0; partes.forEach(x => { n += x.length; });
  const u = new Uint8Array(n); let k = 0;
  partes.forEach(x => { u.set(x, k); k += x.length; });
  return u;
}
/* Un ISO-BMFF minimo: la caja `ftyp` con la marca que mide `_firmaArchivo`. */
function _ftyp(marca) {
  return _junta(_P(0, 0, 0, 24), _ascii('ftyp'), _ascii(marca), _P(0, 0, 2, 0),
                _ascii('isomiso2'), new Uint8Array(4));
}
/* ══ UN MP4 DE VERDAD, DE 1.491 BYTES ═════════════════════════════════════════════════════════
   Un color plano de 32x32 por dos decimas, H.264 en yuv420p, generado UNA vez con ffmpeg y
   embutido como texto -- igual que `JPEG_1x1`, que este repositorio ya trae como arreglo de
   bytes--. NO TIENE UN DATO DE NADIE: es un color.

   ⚠️ HACE FALTA QUE SEA DECODIFICABLE DE VERDAD, y eso lo destapo un caso. La primera version
   del falso mandaba una caja `ftyp` de 32 bytes: `_firmaArchivo` la reconocia como video -- lo
   unico que esa funcion mide son los cuatro bytes de la marca-- asi que la clasificacion, el
   ruteo del visor y la tira pasaban; pero `_videoPoster` no puede sacar un cuadro de algo que no
   trae ni un fotograma, y el camino de adjuntar un video a un estudio guardado salia por su rama
   de «este navegador no lo pudo decodificar». Una cabecera alcanza para probar la FORMA; para
   probar que un video se ve hace falta un video. */
const MP4_MINI_B64 =
  'AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAMpbW9vdgAAAGxtdmhkAAAAAAAAAAAA' +
  'AAAAAAAD6AAAAMgAAQAAAQAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAA' +
  'AABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgAAAlR0cmFrAAAAXHRraGQAAAADAAAA' +
  'AAAAAAAAAAABAAAAAAAAAMgAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAABAAAAAAAA' +
  'AAAAAAAAAABAAAAAACAAAAAgAAAAAAAkZWR0cwAAABxlbHN0AAAAAAAAAAEAAADIAAAAAAABAAAA' +
  'AAHMbWRpYQAAACBtZGhkAAAAAAAAAAAAAAAAAAAoAAAACABVxAAAAAAALWhkbHIAAAAAAAAAAHZp' +
  'ZGUAAAAAAAAAAAAAAABWaWRlb0hhbmRsZXIAAAABd21pbmYAAAAUdm1oZAAAAAEAAAAAAAAAAAAA' +
  'ACRkaW5mAAAAHGRyZWYAAAAAAAAAAQAAAAx1cmwgAAAAAQAAATdzdGJsAAAAt3N0c2QAAAAAAAAA' +
  'AQAAAKdhdmMxAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAACAAIABIAAAASAAAAAAAAAABFExhdmM2' +
  'My4xLjEwMiBsaWJ4MjY0AAAAAAAAAAAAAAAAGP//AAAALWF2Y0MBQsAK/+EAFmdCwAraJbARAAAD' +
  'AAEAAAMAFA8SJqABAARozg/IAAAAEHBhc3AAAAABAAAAAQAAABRidHJ0AAAAAAAAYxAAAAAAAAAA' +
  'GHN0dHMAAAAAAAAAAQAAAAIAAAQAAAAAFHN0c3MAAAAAAAAAAQAAAAEAAAAcc3RzYwAAAAAAAAAB' +
  'AAAAAQAAAAIAAAABAAAAHHN0c3oAAAAAAAAAAAAAAAIAAAJxAAAACQAAABRzdGNvAAAAAAAAAAEA' +
  'AANZAAAAYXVkdGEAAABZbWV0YQAAAAAAAAAhaGRscgAAAAAAAAAAbWRpcmFwcGwAAAAAAAAAAAAA' +
  'AAAsaWxzdAAAACSpdG9vAAAAHGRhdGEAAAABAAAAAExhdmY2My4xLjEwMgAAAAhmcmVlAAACgm1k' +
  'YXQAAAJUBgX//1DcRem95tlIt5Ys2CDZI+7veDI2NCAtIGNvcmUgMTY1IHIzMjIyIGIzNTYwNWEg' +
  'LSBILjI2NC9NUEVHLTQgQVZDIGNvZGVjIC0gQ29weWxlZnQgMjAwMy0yMDI1IC0gaHR0cDovL3d3' +
  'dy52aWRlb2xhbi5vcmcveDI2NC5odG1sIC0gb3B0aW9uczogY2FiYWM9MCByZWY9MSBkZWJsb2Nr' +
  'PTA6MDowIGFuYWx5c2U9MDowIG1lPWRpYSBzdWJtZT0wIHBzeT0xIHBzeV9yZD0xLjAwOjAuMDAg' +
  'bWl4ZWRfcmVmPTAgbWVfcmFuZ2U9MTYgY2hyb21hX21lPTEgdHJlbGxpcz0wIDh4OGRjdD0wIGNx' +
  'bT0wIGRlYWR6b25lPTIxLDExIGZhc3RfcHNraXA9MSBjaHJvbWFfcXBfb2Zmc2V0PTAgdGhyZWFk' +
  'cz0xIGxvb2thaGVhZF90aHJlYWRzPTEgc2xpY2VkX3RocmVhZHM9MCBucj0wIGRlY2ltYXRlPTEg' +
  'aW50ZXJsYWNlZD0wIGJsdXJheV9jb21wYXQ9MCBjb25zdHJhaW5lZF9pbnRyYT0wIGJmcmFtZXM9' +
  'MCB3ZWlnaHRwPTAga2V5aW50PTI1MCBrZXlpbnRfbWluPTEwIHNjZW5lY3V0PTAgaW50cmFfcmVm' +
  'cmVzaD0wIHJjPWNyZiBtYnRyZWU9MCBjcmY9MjMuMCBxY29tcD0wLjYwIHFwbWluPTAgcXBtYXg9' +
  'NjkgcXBzdGVwPTQgaXBfcmF0aW89MS40MCBhcT0wAIAAAAAVZYiEOhGKAAIO8cAAQOI4AAgQydde' +
  'AAAABUGaIDKL';
function _deB64(b) {
  return Uint8Array.from(Buffer.from(b, 'base64'));
}

const BUZON_BYTES = {
  jpg: _junta(JPEG_1x1, new Uint8Array(64)),
  png: _junta(_P(0x89), _ascii('PNG'), _P(0x0D, 0x0A, 0x1A, 0x0A),
              _P(0, 0, 0, 13), _ascii('IHDR'), _P(0, 0, 0, 8, 0, 0, 0, 8, 8, 2, 0, 0, 0),
              new Uint8Array(40)),
  /* BM + el tamanio de cabecera DIB en el byte 14, que es lo que el detector cruza. */
  bmp: _junta(_ascii('BM'), _P(0x80, 0, 0, 0), new Uint8Array(8), _P(40, 0, 0, 0),
              new Uint8Array(100)),
  mp4: _deB64(MP4_MINI_B64),
  /* El MOV se arma con la MISMA pista y la marca `qt  `, que es lo unico que lo distingue para
     `_firmaArchivo`: un segundo fichero de prueba no agregaria informacion. */
  mov: (function () { const u = _deB64(MP4_MINI_B64); u.set(_ascii('qt  '), 8); return u; })(),
  tif: _junta(_P(0x49, 0x49, 0x2A, 0x00), _P(8, 0, 0, 0), new Uint8Array(120)),
  avi: _junta(_ascii('RIFF'), _P(0x80, 0, 0, 0), _ascii('AVI '), _ascii('LIST'),
              new Uint8Array(100)),
  /* ASF/WMV: su GUID de cabecera, los 16 bytes que lo identifican. */
  wmv: _junta(_P(0x30, 0x26, 0xB2, 0x75, 0x8E, 0x66, 0xCF, 0x11,
                 0xA6, 0xD9, 0x00, 0xAA, 0x00, 0x62, 0xCE, 0x6C), new Uint8Array(96)),
  pdf: _junta(_ascii('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n'), new Uint8Array(48)),
  txt: _ascii('INFORME\nSin un dato de nadie: esto es una cabecera de prueba.\n'),
  html: _ascii('<!doctype html><html><body><p>informe de prueba</p></body></html>'),
  desconocido: _junta(_P(0x5A, 0x5A, 0x5A, 0x5A), new Uint8Array(60)),
};
/* `tipo` y `se_puede_ver` tal como los fija §P2: los seis que no se ven y los cuatro que si. */
const BUZON_TIPO = { jpg: 'imagen', png: 'imagen', bmp: 'imagen', mp4: 'video', mov: 'video',
                     tif: 'imagen', avi: 'video', wmv: 'video',
                     pdf: 'informe', txt: 'informe', html: 'informe', desconocido: 'archivo' };
const BUZON_VE = { jpg: true, png: true, bmp: true, mp4: true, mov: true,
                   tif: false, avi: false, wmv: false,
                   pdf: false, txt: false, html: false, desconocido: false };
/* Una imagen del BUZON. El `origen` es lo que la distingue de una que entro por el receptor. */
function buz(id, equipo, recibida, formato, cuarentena) {
  return img(id, equipo, recibida, BUZON_TIPO[formato], BUZON_BYTES[formato], cuarentena,
             { origen: 'buzon', formato: formato, se_puede_ver: BUZON_VE[formato],
               modalidad: null });
}

/* El instante base de las escenas es AHORA y no una fecha escrita: la hora del aviso que ve el
   medico sale de `recibida`, y con una fecha fija el aviso diria siempre la misma hora de 2026
   — que es una prueba que pasa sin mirar el reloj. */
function escenas() {
  /* ⚠️ CINCO MINUTOS Y NO TRES, Y ES POR EL CONTRATO 1.4. Desde que el falso publica la tanda,
     `abierta` se deriva de la ULTIMA llegada mas dos minutos: con t0 a tres minutos, las escenas
     cuyo ultimo desplazamiento llega a 100 s quedaban con la tanda ABIERTA, y una tanda abierta
     deja los botones del cartel apagados. O sea que mover este numero es lo que deja a las
     escenas de antes del prompt 6 portandose como antes. Las que necesitan una tanda ABIERTA la
     piden por su cuenta, con su propio instante. */
  const t0 = Date.now() - 5 * MIN;
  const iso = (ms) => new Date(ms).toISOString().replace(/\.\d+Z$/, 'Z');
  /* Los bytes se generan UNA vez por escena y se comparten: el DICOM de un cuadro son 570
     bytes, pero el grande son 16 MB y armarlo tres veces es medio giga por pedido. */
  const uno  = dicomSintetico({ paciente: { nombre: 'PRUEBA^SINTETICA', nacimiento: '19800515',
                                            sexo: 'F', fechaEstudio: '20261111', id: 'HC-0001' } });
  const loop = dicomSintetico({ frags: [JPEG_1x1, JPEG_1x1, JPEG_1x1], cuadros: 3 });
  return {
    /* UN ENVIO: tres imagenes del equipo autorizado, dentro de un minuto. Es el caso normal. */
    unEnvio: () => [
      img('img_a1', 'eq_3f8a1c', iso(t0),            'imagen', uno),
      img('img_a2', 'eq_3f8a1c', iso(t0 + 12000),    'imagen', uno),
      img('img_a3', 'eq_3f8a1c', iso(t0 + 31000),    'video',  loop),
    ],
    /* DOS EQUIPOS: dos envios a la vez, de equipos distintos. Son DOS avisos, no uno. */
    dosEquipos: () => [
      img('img_a1', 'eq_3f8a1c', iso(t0),         'imagen', uno),
      img('img_a2', 'eq_3f8a1c', iso(t0 + 9000),  'imagen', uno),
      img('img_b1', 'eq_7c4d2e', iso(t0 + 15000), 'imagen', uno),
    ],
    /* DOS ENVIOS DEL MISMO EQUIPO, separados por media hora: dos avisos tambien. Es el control
       negativo de la agrupacion — si agrupara por equipo y nada mas, saldria uno solo. */
    dosEnvios: () => [
      img('img_a1', 'eq_3f8a1c', iso(t0 - 30 * MIN), 'imagen', uno),
      img('img_a2', 'eq_3f8a1c', iso(t0),            'imagen', uno),
    ],
    /* OTRAS DOS DEL MISMO EQUIPO AUTORIZADO, con ids que NO aparecen en ninguna otra escena.
       Hace falta para probar «si llegan NUEVAS, vuelve a avisar»: el aviso no vuelve por las
       mismas imagenes en la misma sesion, asi que una escena que reuse img_a1 da un rojo sobre
       una app que se porta bien -- lo pago TC-847 con la escena dosEnvios. */
    masNuevas: () => [
      img('img_c1', 'eq_3f8a1c', iso(t0 + 60000), 'imagen', uno),
      img('img_c2', 'eq_3f8a1c', iso(t0 + 72000), 'imagen', uno),
    ],
    /* UNA SOLA, de 16 MB, para la prueba de memoria. */
    grande: () => [
      img('img_g1', 'eq_3f8a1c', iso(t0), 'video',
          dicomSintetico({ frags: [jpegDeTamano(16 * 1024 * 1024)] })),
    ],
    /* UNA MAS, con un id que no aparece en ninguna otra escena. Hace falta porque el aviso no
       vuelve por las mismas imagenes EN LA MISMA SESION, y la suite corre todos los casos en UNA
       pagina: un bloque que reusa una escena ya avisada recibe «no hay nada que avisar» y mide
       otra cosa. Lo pago TC-847 dos veces, con dosEnvios y despues con masNuevas. */
    unaSuelta: () => [ img('img_z1', 'eq_3f8a1c', iso(t0 + 90000), 'imagen', uno) ],
    /* UNA TERCERA, con su propio id. Por la MISMA razon que la de arriba, pagada por tercera
       vez: TC-847 (G) ya usa `unaSuelta`, asi que TC-853 (H) -- que necesita «al cerrar se
       olvida el grupo y VUELVE a avisar»-- recibia «no hay nada que avisar» y daba rojo sobre
       una app que se porta bien. Un id por escena que necesite un aviso NUEVO. */
    unaSuelta2: () => [ img('img_z2', 'eq_3f8a1c', iso(t0 + 100000), 'imagen', uno) ],
    /* UNA CUARTA, con su propio id. Por la MISMA razon, pagada por cuarta vez: el bloque G de
       TC-963 usa `unaSuelta2`, asi que el bloque E de TC-964 --que necesita «hay un aviso NUEVO
       en pantalla» como denominador para despues probar un borrado que falla-- recibia «no hay
       nada que avisar» y el caso daba rojo en su denominador. UN ID POR ESCENA QUE NECESITE UN
       AVISO NUEVO. */
    unaSuelta3: () => [ img('img_z3', 'eq_3f8a1c', iso(t0 + 104000), 'imagen', uno) ],
    /* DOS de 16 MB del mismo envio, para saber si el pico de memoria se ACUMULA o si el camino
       de a una suelta el buffer de la anterior. Es la pregunta que la orden hace. */
    dosGrandes: () => {
      const g = dicomSintetico({ frags: [jpegDeTamano(16 * 1024 * 1024)] });
      return [img('img_g1', 'eq_3f8a1c', iso(t0), 'imagen', g),
              img('img_g2', 'eq_3f8a1c', iso(t0 + 20000), 'imagen', g)];
    },
    /* UNA EN CUARENTENA: su archivo y su confirmacion dan 409, y NO sale en la lista (§3.8). */
    cuarentena: () => [
      img('img_a1', 'eq_3f8a1c', iso(t0), 'imagen', uno),
      img('img_q1', 'eq_9b2e7d', iso(t0), 'imagen', uno, true),
    ],
    /* ══ LAS SIN COMPRIMIR (ECO-CONECTOR-3) ═══════════════════════════════════════════
       Cuatro formas que un ecografo manda por red y que hasta esta tanda EcoSmart rechazaba:
       una fija explicita, una fija IMPLICITA -que no trae campo VR y es el otro recorrido del
       dataset-, una de 16 bits -que necesita ventana para verse- y un MULTICUADRO, que es el
       caso que decide si el camino del cineloop sirve tambien sin comprimir.
       Son chicas a proposito: lo que prueban es la FORMA, y un fixture de megas haria lenta a
       toda la bateria. El peso se mide aparte, con `nativoGrande`. */
    nativoFija: () => [
      img('img_n1', 'eq_3f8a1c', iso(t0), 'imagen',
          dicomNativo({ filas: 32, cols: 32,
                        paciente: { nombre: 'PRUEBA^SINTETICA', sexo: 'F',
                                    nacimiento: '19800515', fechaEstudio: '20261112' } })),
    ],
    nativoImplicita: () => [
      img('img_n2', 'eq_3f8a1c', iso(t0), 'imagen',
          dicomNativo({ implicito: true, filas: 32, cols: 32 })),
    ],
    nativoColor: () => [
      img('img_n3', 'eq_3f8a1c', iso(t0), 'imagen',
          dicomNativo({ color: true, filas: 24, cols: 24 })),
    ],
    nativo16: () => [
      img('img_n4', 'eq_3f8a1c', iso(t0), 'imagen',
          dicomNativo({ bits: 16, filas: 24, cols: 24 })),
    ],
    nativoCineloop: () => [
      img('img_n5', 'eq_3f8a1c', iso(t0), 'video',
          dicomNativo({ filas: 32, cols: 32, cuadros: 5 })),
    ],
    /* UN ENVIO MIXTO: dos fijas y un cineloop del mismo equipo, dentro de la ventana. Es la
       escena de la decision 11 -- un solo aviso con la cuenta POR TIPO. */
    mixto: () => [
      img('img_m1', 'eq_3f8a1c', iso(t0),         'imagen', uno),
      img('img_m2', 'eq_3f8a1c', iso(t0 + 8000),  'imagen', uno),
      img('img_m3', 'eq_3f8a1c', iso(t0 + 19000), 'video',  loop),
    ],
    /* OTRO ENVIO MIXTO, con ids propios. Cuarta vez que esta casa paga lo mismo: el aviso no
       vuelve por las MISMAS imagenes en la sesion, asi que un bloque que necesita un grupo
       NUEVO -y que ese grupo pueda CRECER- no lo consigue reusando `mixto`, que ya usaron dos
       bloques antes. */
    mixto2: () => [
      img('img_w1', 'eq_3f8a1c', iso(t0 + 110000), 'imagen', uno),
      img('img_w2', 'eq_3f8a1c', iso(t0 + 118000), 'imagen', uno),
      img('img_w3', 'eq_3f8a1c', iso(t0 + 129000), 'video',  loop),
    ],
    /* DOS CINELOOPS del mismo envio, para la tira y para el peso. */
    dosLoops: () => [
      img('img_l1', 'eq_3f8a1c', iso(t0),         'video', loop),
      img('img_l2', 'eq_3f8a1c', iso(t0 + 11000), 'video', loop),
    ],
    /* UN FORMATO QUE NO SE ABRE: declara RLE. El mensaje tiene que NOMBRARLO y la imagen tiene
       que SEGUIR en el conector, que es lo que distingue un rechazo de una perdida. */
    noSoportado: () => [
      img('img_r1', 'eq_3f8a1c', iso(t0), 'imagen', dicomNoSoportado()),
    ],
    /* UN MULTICUADRO SIN COMPRIMIR GRANDE, para medir el pico de memoria y el tope: 512x512,
       monocromo de 8 bits, 60 cuadros = 15,7 MB de pixeles crudos. */
    nativoGrande: () => [
      img('img_ng', 'eq_3f8a1c', iso(t0), 'video',
          dicomNativo({ filas: 512, cols: 512, cuadros: 60 })),
    ],

    /* ══ LAS PESADAS (ECO-CONECTOR-4) ═══════════════════════════════════════════════════
       ⚠️ SON DE MEGAS Y NO DE CIENTOS DE MEGAS, Y ESO ES UNA DECISION MEDIDA. El archivo que
       el medico recibio declaraba 1016x708 por 171 cuadros = 351,9 MB de pixeles crudos, y un
       fixture de ese tamano en la bateria significaria 351,9 MB por loopback en CADA caso que
       lo use. Lo que las pruebas de la bateria necesitan es la LOGICA del umbral, no su valor,
       asi que el umbral se baja desde la pagina con `window.__dcmCrudoMaxTest` -- el mismo
       recurso y la misma justificacion que `window.__clnkBaseTest`: no lo escribe ningun
       control de la app, no se persiste, y lo unico que cambia es un numero.
       EL TAMANO DE VERDAD SE MIDE APARTE, con `nativoEnorme`, que NO entra en la bateria.
       Cada escena lleva ids propios: el aviso no vuelve por las mismas imagenes en la misma
       sesion, y la bateria corre los 869 casos en UNA pagina. */

    /* EL GRUPO MIXTO DEL HALLAZGO (a): dos fijas que entran y una sin comprimir que no.
       512x512 por 5 cuadros = 1,31 MB de pixeles, por encima del tope de prueba de 1 MB. */
    mixtoPesado: () => [
      img('img_p1', 'eq_3f8a1c', iso(t0),         'imagen', uno),
      img('img_p2', 'eq_3f8a1c', iso(t0 + 9000),  'imagen', uno),
      img('img_p3', 'eq_3f8a1c', iso(t0 + 18000), 'video',
          dicomNativo({ filas: 512, cols: 512, cuadros: 5 })),
    ],
    /* EL MISMO ENVIO CON IDS PROPIOS, para el sumidero del estudio guardado. */
    mixtoPesado2: () => [
      img('img_p6', 'eq_3f8a1c', iso(t0 + 140000), 'imagen', uno),
      img('img_p7', 'eq_3f8a1c', iso(t0 + 148000), 'video',
          dicomNativo({ filas: 512, cols: 512, cuadros: 5 })),
    ],
    /* Y OTRO, para el sumidero de la bandeja. */
    mixtoPesado3: () => [
      img('img_p8', 'eq_3f8a1c', iso(t0 + 160000), 'imagen', uno),
      img('img_p9', 'eq_3f8a1c', iso(t0 + 168000), 'video',
          dicomNativo({ filas: 512, cols: 512, cuadros: 5 })),
    ],
    /* UNA SOLA PESADA: el grupo donde NO entra nada, que es el control de «no confirma nada». */
    pesadoSolo: () => [
      img('img_p4', 'eq_3f8a1c', iso(t0 + 26000), 'video',
          dicomNativo({ filas: 512, cols: 512, cuadros: 5 })),
    ],
    /* OTRA SOLA, con id propio, para el bloque que elige «Dejarlo esperando». */
    pesadoSolo2: () => [
      img('img_p5', 'eq_3f8a1c', iso(t0 + 34000), 'video',
          dicomNativo({ filas: 512, cols: 512, cuadros: 5 })),
    ],
    /* UNA TERCERA, para el bloque del fallo por memoria. */
    pesadoSolo3: () => [
      img('img_pm', 'eq_3f8a1c', iso(t0 + 42000), 'video',
          dicomNativo({ filas: 512, cols: 512, cuadros: 5 })),
    ],
    /* POR ENCIMA DEL TOPE DURO: 512x512 por 20 cuadros = 5,24 MB, mas que los 4 MB del tope
       duro de prueba. Aca la pregunta NO ofrece «Abrir igual». */
    pesadoDuro: () => [
      img('img_pd', 'eq_3f8a1c', iso(t0 + 50000), 'video',
          dicomNativo({ filas: 512, cols: 512, cuadros: 20 })),
    ],
    /* ⚠️ EL DEL MEDICO, AL TAMANO DE VERDAD: 1016x708 en COLOR por 171 cuadros = 351,9 MB de
       pixeles. ** VA EN COLOR, Y NO ES UN DETALLE: la primera version era monocroma y daba
       117,3 MB, un TERCIO de lo que el medico recibio. Tres muestras por pixel es la unica
       forma de que 1016x708x171 pese 351,9 MB, asi que el archivo de verdad era color.
       NO ENTRA EN LA BATERIA -- la usa solamente la sonda de memoria, que corre una vez. */
    nativoEnorme: () => [
      img('img_pe', 'eq_3f8a1c', iso(t0), 'video',
          dicomNativo({ filas: 708, cols: 1016, cuadros: 171, color: true })),
    ],

    /* ══ ECO-CONECTOR-5 ══════════════════════════════════════════════════════════════════
       ⚠️ TODAS LAS DE ESTA TANDA LLEVAN IDS PROPIOS, por quinta vez: el aviso no vuelve por las
       MISMAS imagenes en la misma sesion y la bateria corre los 879 casos en UNA pagina, asi que
       una escena reusada recibe «no hay nada que avisar» y mide otra cosa. */

    /* DE OTRO DIA: dos de AYER a las 23:43 y una de hace cinco dias. Es lo que la decision 3
       necesita -- el aviso tiene que decir la fecha cuando lo que llego NO es de hoy -- y con
       una fecha escrita a mano la prueba pasaria sin mirar el reloj, asi que se derivan de AHORA.
       ⚠️ «AYER A LAS 23:43» SE CONSTRUYE SOBRE LA FECHA LOCAL Y NO RESTANDO 24 HORAS: corrido
       un dia despues de un cambio de hora, restar 86.400.000 ms cae en el mismo dia o en el
       anteayer, y la prueba de «dice ayer» saldria roja sobre una app que se porta bien. */
    deAyer: () => {
      const h = new Date(); h.setDate(h.getDate() - 1); h.setHours(23, 43, 0, 0);
      const v = new Date(); v.setDate(v.getDate() - 5); v.setHours(9, 12, 0, 0);
      return [img('img_y1', 'eq_3f8a1c', iso(h.getTime()),         'imagen', uno),
              img('img_y2', 'eq_3f8a1c', iso(h.getTime() + 11000), 'imagen', uno),
              img('img_y3', 'eq_3f8a1c', iso(v.getTime()),         'imagen', uno)];
    },
    /* LO MISMO PERO DE HOY, con ids propios: es el control negativo de la fecha. El aviso tiene
       que decir SOLO la hora. */
    deHoy: () => [
      img('img_h1', 'eq_3f8a1c', iso(t0),        'imagen', uno),
      img('img_h2', 'eq_3f8a1c', iso(t0 + 9000), 'imagen', uno),
    ],

    /* LA LISTA MIXTA DE LA VISTA PREVIA: tres fijas, dos videos y UNA pesada, del mismo equipo
       autorizado y dentro de la ventana, o sea UN grupo. La pesada tiene 512x512 por 5 cuadros
       = 1,31 MB de pixeles, por encima del tope de prueba de 1 MB, asi que la vista previa NO la
       baja sola: muestra su peso y el boton «Mirar igual». */
    previa: () => [
      img('img_v1', 'eq_3f8a1c', iso(t0),         'imagen', uno),
      img('img_v2', 'eq_3f8a1c', iso(t0 + 7000),  'imagen', uno),
      img('img_v3', 'eq_3f8a1c', iso(t0 + 14000), 'video',  loop),
      img('img_v4', 'eq_3f8a1c', iso(t0 + 21000), 'imagen', uno),
      img('img_v5', 'eq_3f8a1c', iso(t0 + 28000), 'video',  loop),
      img('img_v6', 'eq_3f8a1c', iso(t0 + 35000), 'video',
          dicomNativo({ filas: 512, cols: 512, cuadros: 5 })),
    ],
    /* OCHO del mismo envio: lo que la decision 6b pide es «lugar para 6 a la vista y
       desplazamiento lateral si hay mas», y con seis no se puede distinguir «entran todas» de
       «desborda». */
    previaOcho: () => {
      const l = [];
      for (let k = 0; k < 8; k++) {
        l.push(img('img_o' + (k + 1), 'eq_3f8a1c', iso(t0 + k * 6000),
                   k % 3 === 2 ? 'video' : 'imagen', k % 3 === 2 ? loop : uno));
      }
      return l;
    },
    /* TRES, DE LAS CUALES UNA NO SE PUEDE BAJAR. La del medio se declara en `bajarFalla`, asi
       que su archivo da 503: la decision 6g pide que esa miniatura muestre el motivo y que las
       otras dos se dibujen igual. */
    previaConFallo: () => [
      img('img_f1', 'eq_3f8a1c', iso(t0),         'imagen', uno),
      img('img_f2', 'eq_3f8a1c', iso(t0 + 8000),  'imagen', uno),
      img('img_f3', 'eq_3f8a1c', iso(t0 + 16000), 'imagen', uno),
    ],

    /* SOLO CUARENTENA: la unica imagen que hay es de un equipo que espera decision, asi que la
       lista del contrato §3.8 sale VACIA. Es el denominador de la decision 6f -- sin esto, «no
       hay vista previa para un equipo en cuarentena» se mide sobre una lista que ademas trae
       imagenes de un equipo autorizado, y pasaria igual si el filtro no existiera. */
    soloCuarentena: () => [
      img('img_qq', 'eq_9b2e7d', iso(t0), 'imagen', uno, true),
    ],

    /* DOS FIJAS Y UN CINELOOP PARA LA GALERIA: lo que los casos de la decision 7 adjuntan a un
       estudio y despues eligen, eliminan y copian. Ids propios. */
    paraGaleria: () => [
      img('img_g1b', 'eq_3f8a1c', iso(t0),         'imagen', uno),
      img('img_g2b', 'eq_3f8a1c', iso(t0 + 9000),  'imagen', uno),
      img('img_g3b', 'eq_3f8a1c', iso(t0 + 18000), 'video',  loop),
    ],
    /* OTRAS DOS, para el segundo estudio de la prueba de «borra solo lo elegido»: dos estudios
       con imagenes PARECIDAS es lo que la Tarea 5 pide, y con los mismos bytes en los dos no se
       puede distinguir «borro la del estudio A» de «borro la del B». */
    paraGaleria2: () => [
      img('img_g4b', 'eq_3f8a1c', iso(t0 + 26000), 'imagen', uno),
      img('img_g5b', 'eq_3f8a1c', iso(t0 + 34000), 'imagen', uno),
    ],
    /* Y UNAS TERCERAS, para el tercer estudio de «va al elegido y a ningun otro». */
    paraGaleria3: () => [
      img('img_g6b', 'eq_3f8a1c', iso(t0 + 42000), 'imagen', uno),
    ],
    /* ══ EL BUZON (CONTRATO 1.3 §P2, PROMPT 6) ═══════════════════════════════════════════
       LOS NUEVE QUE EL ECOGRAFO FALSO SUELTA, mas los dos videos que si se ven. Seis de los
       once NO se pueden ver, que es justo lo que los bloques E y F tienen que probar. */
    buzonMixto: () => [
      buz('img_bz_jpg', 'eq_buzon', iso(t0),          'jpg'),
      buz('img_bz_png', 'eq_buzon', iso(t0 + 4000),   'png'),
      buz('img_bz_mp4', 'eq_buzon', iso(t0 + 8000),   'mp4'),
      buz('img_bz_tif', 'eq_buzon', iso(t0 + 12000),  'tif'),
      buz('img_bz_avi', 'eq_buzon', iso(t0 + 16000),  'avi'),
      buz('img_bz_pdf', 'eq_buzon', iso(t0 + 20000),  'pdf'),
      buz('img_bz_txt', 'eq_buzon', iso(t0 + 24000),  'txt'),
      buz('img_bz_des', 'eq_buzon', iso(t0 + 28000),  'desconocido'),
    ],
    /* SOLO LAS QUE SE VEN: una por cada camino de vista previa y de visor. */
    buzonVisibles: () => [
      buz('img_bv_jpg', 'eq_buzon', iso(t0),         'jpg'),
      buz('img_bv_png', 'eq_buzon', iso(t0 + 5000),  'png'),
      buz('img_bv_bmp', 'eq_buzon', iso(t0 + 10000), 'bmp'),
      buz('img_bv_mp4', 'eq_buzon', iso(t0 + 15000), 'mp4'),
      buz('img_bv_mov', 'eq_buzon', iso(t0 + 20000), 'mov'),
    ],
    /* SOLO LOS QUE NO SE VEN: los seis del bloque F, cada uno con su sigla. */
    buzonNoVisibles: () => [
      buz('img_bn_tif', 'eq_buzon', iso(t0),         'tif'),
      buz('img_bn_avi', 'eq_buzon', iso(t0 + 4000),  'avi'),
      buz('img_bn_wmv', 'eq_buzon', iso(t0 + 8000),  'wmv'),
      buz('img_bn_pdf', 'eq_buzon', iso(t0 + 12000), 'pdf'),
      buz('img_bn_txt', 'eq_buzon', iso(t0 + 16000), 'txt'),
      buz('img_bn_des', 'eq_buzon', iso(t0 + 20000), 'desconocido'),
    ],
    /* UNA SOLA FOTO del buzon, con su id propio: la prueba del visor de una fija. */
    buzonUnaFoto: () => [ buz('img_bu_jpg', 'eq_buzon', iso(t0), 'jpg') ],
    /* UN SOLO VIDEO del buzon, con su id propio. */
    buzonUnVideo: () => [ buz('img_bu_mp4', 'eq_buzon', iso(t0), 'mp4') ],
    /* UNO QUE NO SE VE, solo: la tarjeta del bloque F con un solo archivo. */
    buzonUnTif: () => [ buz('img_bu_tif', 'eq_buzon', iso(t0), 'tif') ],
    /* EL EQUIPO DE LA CARPETA COMPARTIDA, que es otro equipo aunque la subcarpeta se llame
       igual: es lo que el bloque I tiene que poder distinguir. */
    porRed: () => [ buz('img_er_jpg', 'eq_entrada', iso(t0), 'jpg') ],

    /* ══ LA TANDA ABIERTA (CONTRATO 1.4 §3.1) ════════════════════════════════════════════
       ⚠️ EL INSTANTE ES **AHORA** Y NO `t0`, y de eso depende todo el bloque A: `abierta` se
       deriva de la ultima llegada mas dos minutos, asi que una escena con fechas viejas tiene
       la tanda CERRADA por definicion y el cartel inmediato no se puede medir sobre ella. */
    tandaUna: () => [ img('img_t1', 'eq_3f8a1c', iso(Date.now() - 2000), 'imagen', uno) ],
    tandaDos: () => [
      img('img_t1', 'eq_3f8a1c', iso(Date.now() - 9000), 'imagen', uno),
      img('img_t2', 'eq_3f8a1c', iso(Date.now() - 2000), 'imagen', uno),
    ],
    tandaTres: () => [
      img('img_t1', 'eq_3f8a1c', iso(Date.now() - 16000), 'imagen', uno),
      img('img_t2', 'eq_3f8a1c', iso(Date.now() - 9000),  'imagen', uno),
      img('img_t3', 'eq_3f8a1c', iso(Date.now() - 2000),  'video',  loop),
    ],
    /* LAS MISMAS TRES, pero con la tanda ya CERRADA: es el «Listo» del bloque A. */
    tandaCerrada: () => [
      img('img_t1', 'eq_3f8a1c', iso(t0),           'imagen', uno),
      img('img_t2', 'eq_3f8a1c', iso(t0 + 7000),    'imagen', uno),
      img('img_t3', 'eq_3f8a1c', iso(t0 + 14000),   'video',  loop),
    ],
    /* UNA TANDA ABIERTA CON SUS IMAGENES EN CUARENTENA: el aviso tiene que decir que hay que
       autorizar el equipo, o el medico toca el cartel y llega a una lista vacia (§P8). */
    tandaCuarentena: () => [
      img('img_tq1', 'eq_9b2e7d', iso(Date.now() - 4000), 'imagen', uno, true),
      img('img_tq2', 'eq_9b2e7d', iso(Date.now() - 1000), 'imagen', uno, true),
    ],
    /* UNA TANDA ABIERTA DEL BUZON, con las cuatro clases a la vez: es el texto del bloque C. */
    tandaBuzon: () => [
      buz('img_tb1', 'eq_buzon', iso(Date.now() - 12000), 'jpg'),
      buz('img_tb2', 'eq_buzon', iso(Date.now() - 9000),  'mp4'),
      buz('img_tb3', 'eq_buzon', iso(Date.now() - 6000),  'pdf'),
      buz('img_tb4', 'eq_buzon', iso(Date.now() - 2000),  'tif'),
    ],
    vacio: () => [],
  };
}

/* Los tres juegos de equipos que la orden pide: 0, 1 y 2, con uno esperando decision. */
function equiposDe(cuantos) {
  const A = { id: 'eq_3f8a1c', estado: 'autorizado', aet: 'GE_VIVID_01', ip: '192.168.1.44',
              apodo: 'GE del consultorio', imagenes: 12, ultimo_envio: '2026-11-10T21:44:52Z' };
  const B = { id: 'eq_9b2e7d', estado: 'pendiente', aet: 'ECOFALSO', ip: '127.0.0.1',
              apodo: null, imagenes: 4, ultimo_envio: '2026-11-10T21:46:03Z' };
  /* ** UN TERCERO, PENDIENTE Y CON UN id PROPIO. El aviso de equipo nuevo no vuelve por el
     MISMO equipo en la misma sesion, asi que un bloque que necesita «hay uno esperando y no se
     aviso todavia» no lo puede conseguir reusando B -- lo pago TC-847 (G2), cuya mutacion
     sobrevivia porque el bloque anterior ya habia avisado de B. */
  const C = { id: 'eq_tercero', estado: 'pendiente', aet: 'ECOTERCERO', ip: '127.0.0.2',
              apodo: null, imagenes: 2, ultimo_envio: '2026-11-10T21:50:00Z' };
  /* ══ LOS DOS EQUIPOS DE CARPETA (CONTRATO 1.3 §P5) ══════════════════════════════════════
     Los dos puntos no son un caracter valido en un AET de DICOM, asi que un equipo de carpeta
     nunca se confunde con un ecografo. Y los DOS prefijos son equipos DISTINTOS aunque la
     subcarpeta se llame igual: en el buzon escribe la cuenta del medico, en la carpeta de
     entrada escribe cualquiera que tenga las credenciales del recurso compartido.
     ⚠️ EL APODO DEL DE ENTRADA TRAE UN NOMBRE DE SUBCARPETA CON MARCADO ADENTRO, a proposito:
     el contrato avisa que el puente valida que no haya controles ni invisibles y NADA MAS, asi
     que quien lo dibuja tiene que usar `textContent`. Si alguna vez se dibuja con `innerHTML`,
     esto lo pone en evidencia en vez de dejarlo pasar. */
  const Z = { id: 'eq_buzon', estado: 'autorizado', aet: 'BUZON:', ip: '127.0.0.1',
              apodo: null, imagenes: 8, ultimo_envio: '2026-11-19T20:44:52Z' };
  const Y = { id: 'eq_entrada', estado: 'autorizado', aet: 'ENTRADA:sonoscape<img src=x>',
              ip: '127.0.0.1', apodo: null, imagenes: 1,
              ultimo_envio: '2026-11-19T20:45:10Z' };
  /* UN EQUIPO DE CARPETA ESPERANDO DECISION: es la fila donde el medico aprieta PERMITIR, que
     es justo donde el bloque I pide que se vea de donde vino. */
  const W = { id: 'eq_entrada_pend', estado: 'pendiente', aet: 'ENTRADA:', ip: '127.0.0.1',
              apodo: null, imagenes: 2, ultimo_envio: '2026-11-19T20:46:00Z' };
  if (cuantos === 0) return [];
  if (cuantos === 1) return [A];
  if (cuantos === 4) return [A, Z, Y];
  if (cuantos === 5) return [A, Z, Y, W];
  if (cuantos >= 3) return [A, B, C];
  return [A, B];
}

/* ══ `nombre_para_mostrar` (CONTRATO 1.4 §3.4) ════════════════════════════════════════════════
   El `aet` traducido a algo que una persona pueda leer. Las cinco filas de la tabla del §3.4,
   al pie de la letra, y NUNCA viene vacio: con un AET sin ninguno de los dos prefijos devuelve
   el AET. NO incluye el apodo, a proposito: el apodo viaja en su propio campo. */
function nombreParaMostrar(aet) {
  const a = String(aet || '');
  if (a.indexOf('BUZON:') === 0) {
    const sub = a.slice(6);
    return sub ? ('Buz\u00f3n de esta computadora, carpeta \u00ab' + sub + '\u00bb')
               : 'Buz\u00f3n de esta computadora';
  }
  if (a.indexOf('ENTRADA:') === 0) {
    const sub = a.slice(8);
    return sub ? ('Carpeta de entrada, carpeta \u00ab' + sub + '\u00bb') : 'Carpeta de entrada';
  }
  return a;
}

function escenarioDeFabrica() {
  return {
    /* ⚠️ DE FABRICA ES **1.4.0**, QUE ES EL PUENTE EN VIGENCIA, y de eso depende el bloque J.
       El falso publica cada campo detras de la version que lo trajo: con '1.3.0' desaparecen
       los cuatro de la tanda, `bytes_aviso`, la lista `tandas` y `nombre_para_mostrar`; con
       '1.1.0' desaparecen ademas `origen`, `formato`, `se_puede_ver`, `lote`, el `tipo`/`enlace`
       de cada direccion y `carpeta_compartida`; y con '1.0.0' las dos rutas nuevas dan 404, que
       es lo que el contrato §7 dice que pasa contra un conector viejo. Asi una sola sonda mide
       las tres compatibilidades sin tres falsos. */
    version: '1.4.0',
    orthanc_vivo: true,
    imagenes_pendientes: 3,
    equipos_esperando: 1,
    bytes_usados: 48234112,
    /* ⚠️ DESDE LA 1.4.0 EL TOPE **NO ES FIJO**: se deriva del disco. Se deja el valor viejo de
       fabrica para que el aviso de espacio se pueda probar con los mismos numeros de antes, y
       `bytes_aviso` se DERIVA abajo —el 80 % del tope, que es lo que §3.1 dice— en vez de
       escribirse: con los dos sueltos, una prueba podria medir un aviso que no corresponde. */
    bytes_tope: 2147483648,

    codigo: CODIGO_DE_PRUEBA,
    token: TOKEN_DE_PRUEBA,
    vinculado: false,
    fallosDeVinculacion: 0,
    /* Flags de escenario, todos apagados de fabrica. */
    codigoVencido: false,       // la vinculacion responde 410
    tokenInvalido: false,       // toda ruta con token responde 401
    orthancCaido: false,        // toda ruta con token responde 503
    cuarentena: false,          // las rutas de equipo responden 409
    errorDePedido: null,        // texto: toda ruta con token responde 400 con ese mensaje
    confirmarFalla: false,      // la confirmacion responde 503 SIN borrar: la imagen se queda
    /* ⚠️ LA DESCARGA QUE FALLA A PROPOSITO (ECO-CONECTOR-5, Tarea 1). Es una LISTA DE IDS y no
       un booleano: lo que la decision 6g pide es que una miniatura que falla no frene a las
       demas, y con un booleano global fallan las tres y no se puede distinguir «siguio con las
       otras» de «se cayo todo». El archivo da 503 y la imagen SIGUE en la lista. */
    bajarFalla: [],

    /* ══ CONEXION (CONTRATO 1.3 §P7) ══════════════════════════════════════════════════════
       UNA SOLA direccion de fabrica y marcada como la probable, que es el caso bueno: el
       bloque G se mide con `conexionVarias`, que pone las cinco que la pantalla tiene que saber
       dibujar. `tipo` y `enlace` van en cada una desde la 1.3. */
    conexion: {
      puerto_dicom: 4242,
      aet_puente: 'PUENTE',
      direcciones: [
        { direccion: '192.168.1.23', interfaz: 'en7', probable: true,
          tipo: 'cable', enlace: true },
      ],
      aviso: null,
      /* ⚠️ LA RUTA Y EL USUARIO SALEN DE UN ARCHIVO QUE ESCRIBE UNA PERSONA, y el contrato dice
         que el puente garantiza que la ruta es absoluta y NADA sobre su contenido. La ruta de
         fabrica trae marcado adentro a proposito, por el mismo motivo que el apodo del equipo
         de entrada: si alguna vez se dibuja con `innerHTML`, se ve. */
      carpeta_compartida: {
        ruta: 'C:\\CeiboLink-Entrada<img src=x onerror=1>',
        usuario: 'ecografo',
        existe: true,
        aviso: null,
      },
    },

    equipos: equiposDe(2),

    /* ⚠️ `imagenes_pendientes` SE DERIVA de la lista y no se escribe a mano: con los dos numeros
       sueltos, el estado podia decir «3 esperando» con la lista vacia, y una prueba del sondeo
       que mire el estado para decidir si pedir la lista pasaria sobre nada. Lo pone `sincronizar`. */
    imagenes: escenas().unEnvio(),
    verificada: true,          // la confirmacion responde `verificada: false` si se pone en false
    confirmadas: [],           // los ids que EcoSmart confirmo, en orden: lo mira el caso
    borradas: [],              // los ids que EcoSmart descarto

    ajustes: { horas_retencion: 24, aet_puente: 'PUENTE' },
  };
}

/* El estado que `GET /v1/estado` publica se CALCULA de la lista. Las imagenes en cuarentena no
   cuentan como pendientes: §3.8 dice que no salen en la lista, asi que EcoSmart no las puede
   levantar y contarlas seria prometer trabajo que no hay. */
/* La ventana del puente: DOS MINUTOS desde la ultima imagen del lote. Es fija del lado del
   puente —§P8 lo dice con todas las letras— y por eso vive aca y no en un ajuste. */
const VENTANA_LOTE_MS = 2 * MIN;

/* ══ EL LOTE Y LA TANDA, DERIVADOS (CONTRATO 1.3 §P8 y 1.4) ═══════════════════════════════════
   El lote es POR EQUIPO: una imagen entra al lote abierto de SU equipo si todavia no cerro, y
   si no abre uno nuevo.
   ⚠️ EL CIERRE **NO SE GUARDA, SE CALCULA**: es la fecha de la imagen mas nueva del lote mas la
   ventana, asi que si entra una imagen mas el cierre se corre solo. Un cierre guardado al crear
   el lote quedaria viejo en cuanto llegue la segunda imagen.
   ⚠️ Y LAS TANDAS VIENEN **TODAS**, abiertas y cerradas, y tambien las que tienen TODAS sus
   imagenes en cuarentena: `imagenes` no trae las de un equipo sin autorizar, asi que una tanda
   que solo tuviera esas no apareceria en ninguna parte y el aviso no podria decir «autoriza el
   equipo para verlas». */
function derivarLotes(S) {
  const ahora = Date.now();
  const iso = ms => new Date(ms).toISOString().replace(/\.\d+Z$/, 'Z');
  const ms = i => { const t = Date.parse(String(i.recibida || '')); return isFinite(t) ? t : ahora; };
  const orden = S.imagenes.slice().sort((a, b) => {
    const ea = String(a.equipo || ''), eb = String(b.equipo || '');
    if (ea !== eb) return ea < eb ? -1 : 1;
    return ms(a) - ms(b);
  });
  const lotes = [];
  let g = null;
  orden.forEach(i => {
    const t = ms(i);
    if (g && g.equipo === String(i.equipo || '') && (t - g.ultimoMs) <= VENTANA_LOTE_MS) {
      g.ultimoMs = t; g.imagenes++;
      if (i._cuarentena) g.en_cuarentena++;
    } else {
      g = { lote: 'lt_' + i.id.replace(/^img_/, ''), equipo: String(i.equipo || ''),
            imagenes: 1, en_cuarentena: i._cuarentena ? 1 : 0,
            primeraMs: t, ultimoMs: t };
      lotes.push(g);
    }
    i._lote = g;
  });
  S.imagenes.forEach(i => {
    const L = i._lote;
    if (!L) return;
    i.lote = L.lote;
    i.lote_cierra = iso(L.ultimoMs + VENTANA_LOTE_MS);
  });
  S.tandas = lotes.map(L => ({
    lote: L.lote, equipo: L.equipo, imagenes: L.imagenes, en_cuarentena: L.en_cuarentena,
    primera: iso(L.primeraMs), ultima: iso(L.ultimoMs),
    cierra: iso(L.ultimoMs + VENTANA_LOTE_MS),
    /* `abierta` lo decide el puente con UN SOLO RELOJ para toda la respuesta (§P8). */
    abierta: (L.ultimoMs + VENTANA_LOTE_MS) > ahora,
  }));
  /* Los cuatro campos de `GET /v1/estado` son de la tanda abierta MAS NUEVA POR ULTIMA LLEGADA,
     que es la que el medico acaba de provocar (§3.1). Las otras estan en la lista de §P8. */
  const abiertas = S.tandas.filter(t => t.abierta)
                           .sort((a, b) => Date.parse(b.ultima) - Date.parse(a.ultima));
  const T = abiertas[0] || null;
  S.tanda_abierta = !!T;
  S.tanda_imagenes = T ? T.imagenes : 0;
  S.tanda_ultima = T ? T.ultima : '';
  S.tanda_cierra = T ? T.cierra : '';
  return S;
}

function sincronizar(S) {
  const auto = S.equipos.filter(e => e.estado === 'autorizado').map(e => e.id);
  /* ⚠️ PENDIENTES SON LAS QUE SALEN EN LA LISTA, o sea las de un equipo AUTORIZADO y sin marca
     de cuarentena. La version anterior miraba solo la marca, asi que una imagen de un equipo
     PENDIENTE contaba como pendiente y no aparecia en la lista: el estado decia «hay 2» y
     `/v1/imagenes` devolvia cero, que es un escenario que el puente de verdad no produce. */
  const vis = S.imagenes.filter(i => !i._cuarentena && auto.indexOf(i.equipo) >= 0);
  S.imagenes_pendientes = vis.length;
  S.equipos_esperando = S.equipos.filter(e => e.estado === 'pendiente').length;
  /* `bytes_aviso` es el 80 % del tope, DERIVADO (§3.1). */
  S.bytes_aviso = Math.round(Number(S.bytes_tope || 0) * 0.8);
  derivarLotes(S);
  /* ⚠️ `bytes_usados` NO se deriva, y es a proposito: el aviso de espacio de EcoSmart se prueba
     fijando ese numero cerca del tope, y una derivada de tres DICOM sinteticos de 570 bytes no
     llega nunca. Se escribe por `/_control`, que es para lo que esa ruta esta. */
  return S;
}

/* ══ LA COMPUERTA DE VERSION ══════════════════════════════════════════════════════════════════
   Cada campo se publica detras de la version que lo trajo, que es lo que deja medir el bloque J
   —la compatibilidad contra un puente viejo— con UN solo falso. Se compara el numero MENOR y no
   la cadena: '1.4.0' y '1.4.3' implementan los dos el contrato 1.4 (§7). */
function menor(S) {
  const m = String(S.version || '').split('.');
  return (Number(m[0]) || 0) * 100 + (Number(m[1]) || 0);
}
const es14 = S => menor(S) >= 104;
const es13 = S => menor(S) >= 103;

/* El `Content-Type` por formato medido (CONTRATO 1.3 §P3). Todo lo que no es DICOM, imagen ni
   video sale como `application/octet-stream`, que es lo que hace que el navegador lo BAJE en vez
   de interpretarlo: NUNCA se manda `text/html` ni `application/pdf`. */
const TIPO_MIME = { dicom: 'application/dicom', jpg: 'image/jpeg', png: 'image/png',
                    bmp: 'image/bmp', mp4: 'video/mp4', mov: 'video/quicktime' };

/* Los origenes que este falso acepta. El de verdad solo acepta el de produccion; este acepta
   ademas loopback porque la bateria sirve la app desde un puerto al azar. NUNCA `*`. */
function origenPermitido(origen, extras) {
  if (!origen) return null;
  if (extras.indexOf(origen) >= 0) return origen;
  if (/^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?$/.test(origen)) return origen;
  return null;
}

function cors(rq, origen, privada) {
  if (origen) {
    rq.setHeader('Access-Control-Allow-Origin', origen);
    rq.setHeader('Vary', 'Origin');
  }
  if (privada) rq.setHeader('Access-Control-Allow-Private-Network', 'true');
}

function json(rq, codigo, cuerpo) {
  const t = Buffer.from(JSON.stringify(cuerpo), 'utf8');
  rq.writeHead(codigo, { 'Content-Type': 'application/json; charset=utf-8',
                         'Content-Length': t.length, 'Cache-Control': 'no-store' });
  rq.end(t);
}

function err(rq, codigo, clave, mensaje, extra) {
  json(rq, codigo, Object.assign({ error: clave, mensaje: mensaje }, extra || {}));
}

async function cuerpoJSON(req) {
  const trozos = [];
  let n = 0;
  for await (const t of req) {
    n += t.length;
    if (n > 65536) throw new Error('grande');   // el contrato §5 topa en 64 KB
    trozos.push(t);
  }
  if (!trozos.length) return {};
  return JSON.parse(Buffer.concat(trozos).toString('utf8'));
}

/* Un puerto que quedo CERRADO a proposito: se escucha y se cierra enseguida, y el numero se
   publica. Los casos que necesitan «el conector esta apagado» apuntan ahi y reciben el fallo de
   red de verdad del navegador, que es el mismo `TypeError` que da un conector que no esta. */
function puertoCerrado() {
  return new Promise((res) => {
    const s = createServer();
    s.listen(0, '127.0.0.1', () => {
      const p = s.address().port;
      s.close(() => res(p));
    });
  });
}

export function servirConectorFalso(opciones) {
  const op = opciones || {};
  const pedido = op.port !== undefined ? op.port
               : (process.env.CLNK_PORT ? +process.env.CLNK_PORT : 0);
  const extras = String(op.origenes || process.env.CLNK_ORIGENES ||
                        'https://ecosmart.ceibomed.com').split(',').map(s => s.trim()).filter(Boolean);
  const E = { v: escenarioDeFabrica() };

  return new Promise((res, rej) => {
    const srv = createServer(async (req, rq) => {
      const origen = origenPermitido(req.headers.origin, extras);
      const privada = String(req.headers['access-control-request-private-network'] || '') === 'true';
      const url = String(req.url || '').split('?')[0];
      const metodo = String(req.method || 'GET').toUpperCase();

      /* ── Pedido previo ── */
      if (metodo === 'OPTIONS') {
        cors(rq, origen, privada);
        if (origen) {
          rq.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
          rq.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
          rq.setHeader('Access-Control-Max-Age', '600');
        }
        rq.writeHead(origen ? 204 : 403).end();
        return;
      }

      cors(rq, origen, privada);
      if (!origen) { err(rq, 403, 'origen_no_permitido', 'Origen no permitido.'); return; }

      /* El contrato §5.1 exige el `Host` de loopback. El navegador lo pone solo; se comprueba
         igual, porque es lo que frena el DNS rebinding y una prueba que no lo mire dejaria pasar
         un panel que apunte a un nombre de dominio. */
      const host = String(req.headers.host || '');
      if (!/^(127\.0\.0\.1|localhost|\[::1\]):\d+$/.test(host)) {
        err(rq, 403, 'host_no_permitido', 'Host no permitido.'); return;
      }

      const S = E.v;
      const autoriza = String(req.headers.authorization || '');
      const conToken = autoriza === 'Bearer ' + S.token;
      const esM = (m, patron) => metodo === m && patron.test(url);
      const idDe = () => decodeURIComponent((url.match(/^\/v1\/equipos\/([^/]+)/) || [])[1] || '');
      const idImg = () => decodeURIComponent((url.match(/^\/v1\/imagenes\/([^/]+)/) || [])[1] || '');

      try {
        /* ── Control del escenario: FUERA del contrato, solo de pruebas ── */
        if (url === '/_control' && metodo === 'POST') {
          const b = await cuerpoJSON(req);
          /* `reset` se aplica PRIMERO y no en una rama `else`: un pedido como
             { reset: true, cuarentena: true } tiene que dejar el escenario de fabrica CON la
             cuarentena puesta. Con el `else`, la segunda clave se ignoraba en silencio y el
             caso medía un escenario que creía haber armado -- lo pagó TC-836, cuyo control
             negativo del 409 recibía un 200. */
          const dest = b.reset ? (E.v = escenarioDeFabrica()) : S;
          Object.keys(b).forEach(k => {
            if (k === 'reset') return;
            /* `escena` y `equipos` son ATAJOS y no campos del escenario: nombran un juego
               armado, para que un caso no tenga que mandar la lista entera por la red —y para
               que los bytes de 16 MB del escenario grande no viajen dos veces—. */
            if (k === 'escena') {
              const ess = escenas();
              if (typeof ess[b[k]] === 'function') dest.imagenes = ess[b[k]]();
              return;
            }
            if (k === 'equipos' && typeof b[k] === 'number') { dest.equipos = equiposDe(b[k]); return; }
            dest[k] = b[k];
          });
          sincronizar(E.v);
          json(rq, 200, { ok: true, escenario: {
            version: E.v.version, vinculado: E.v.vinculado,
            imagenes: E.v.imagenes.map(i => i.id),
            imagenes_pendientes: E.v.imagenes_pendientes,
            equipos: E.v.equipos.map(e => e.id + ':' + e.estado),
            tanda_abierta: E.v.tanda_abierta, tanda_imagenes: E.v.tanda_imagenes,
            tandas: (E.v.tandas || []).map(t => t.lote + ':' + t.imagenes + ':' +
                                                (t.abierta ? 'abierta' : 'cerrada')),
            confirmadas: E.v.confirmadas, borradas: E.v.borradas } });
          return;
        }

        /* ── 3.1 estado — SIN token ── */
        if (esM('GET', /^\/v1\/estado$/)) {
          sincronizar(S);
          const cu = {
            version: S.version, orthanc_vivo: S.orthanc_vivo,
            imagenes_pendientes: S.imagenes_pendientes, equipos_esperando: S.equipos_esperando,
            bytes_usados: S.bytes_usados, bytes_tope: S.bytes_tope, vinculado: S.vinculado,
          };
          /* Los CINCO campos de la 1.4. Contra un puente mas viejo no vienen, y EcoSmart tiene
             que volver a la regla de la 1.3: agrupar por `lote` y avisar al cerrar (§P8). */
          if (es14(S)) {
            cu.bytes_aviso = S.bytes_aviso;
            cu.tanda_abierta = S.tanda_abierta;
            cu.tanda_imagenes = S.tanda_imagenes;
            cu.tanda_ultima = S.tanda_ultima;
            cu.tanda_cierra = S.tanda_cierra;
          }
          json(rq, 200, cu);
          return;
        }

        /* ── 3.2 vincular — SIN token, con codigo ── */
        if (esM('POST', /^\/v1\/vincular$/)) {
          const b = await cuerpoJSON(req);
          if (S.fallosDeVinculacion >= 5) {
            err(rq, 429, 'demasiados_intentos',
                'Demasiados intentos. Espera un momento y proba de nuevo.',
                { reintentar_en_segundos: 60 });
            return;
          }
          if (S.codigoVencido) {
            err(rq, 410, 'codigo_vencido', 'El codigo de vinculacion vencio. Pedi uno nuevo.');
            return;
          }
          if (String(b && b.codigo) !== String(S.codigo)) {
            S.fallosDeVinculacion++;
            err(rq, 400, 'codigo_invalido', 'El codigo no es correcto.');
            return;
          }
          S.fallosDeVinculacion = 0;
          S.vinculado = true;
          json(rq, 200, { token: S.token, vence: null });
          return;
        }

        /* ── Desde aca, todo exige token ── */
        const pideToken = /^\/v1\/(desvincular|equipos|ajustes|conexion|imagenes)/.test(url);
        if (pideToken) {
          if (S.tokenInvalido || !conToken) {
            err(rq, 401, 'no_autorizado', 'No autorizado.'); return;
          }
          if (S.orthancCaido) {
            err(rq, 503, 'orthanc_caido', 'El receptor no responde; se esta reencendiendo.');
            return;
          }
          if (S.errorDePedido) {
            err(rq, 400, 'pedido_invalido', String(S.errorDePedido)); return;
          }
        }

        /* ── 3.3 desvincular ── */
        if (esM('POST', /^\/v1\/desvincular$/)) {
          S.vinculado = false;
          rq.writeHead(204).end();
          return;
        }

        /* ── 3.13 conexion — NO existe en un conector 1.0 ── */
        if (esM('GET', /^\/v1\/conexion$/)) {
          if (S.version.indexOf('1.0.') === 0) {
            err(rq, 404, 'no_encontrado', 'No encontrado.'); return;
          }
          /* El `tipo`, el `enlace` de cada direccion y `carpeta_compartida` son de la 1.3
             (§P7): contra un puente 1.1 la pantalla tiene que poder dibujar igual sin ellos. */
          if (es13(S)) { json(rq, 200, S.conexion); return; }
          const cx = Object.assign({}, S.conexion);
          delete cx.carpeta_compartida;
          cx.direcciones = (S.conexion.direcciones || []).map(x => {
            const c = Object.assign({}, x); delete c.tipo; delete c.enlace; return c;
          });
          json(rq, 200, cx);
          return;
        }

        /* ── 3.12 ajustes ── */
        if (esM('GET', /^\/v1\/ajustes$/)) { json(rq, 200, S.ajustes); return; }
        if (esM('PUT', /^\/v1\/ajustes$/)) {
          const b = await cuerpoJSON(req);
          if (b.horas_retencion !== undefined) {
            const h = Number(b.horas_retencion);
            if (!Number.isInteger(h) || h < 1 || h > 72) {
              err(rq, 400, 'pedido_invalido', 'Las horas tienen que ser un numero entero de 1 a 72.');
              return;
            }
            S.ajustes.horas_retencion = h;
          }
          let reinicio = false;
          if (b.aet_puente !== undefined) {
            const a = String(b.aet_puente);
            if (!/^[A-Z0-9_-]{1,16}$/.test(a)) {
              err(rq, 400, 'pedido_invalido',
                  'El nombre admite hasta 16 caracteres, solo letras sin tilde, numeros, guion y raya baja.');
              return;
            }
            reinicio = a !== S.ajustes.aet_puente;
            S.ajustes.aet_puente = a;
            S.conexion.aet_puente = a;
          }
          json(rq, 200, Object.assign({}, S.ajustes, { reinicio_necesario: reinicio }));
          return;
        }

        /* ── 3.4 equipos ── */
        if (esM('GET', /^\/v1\/equipos$/)) {
          /* Contra un conector 1.0 el campo `apodo` NO viene. El contrato §7 dice que EcoSmart
             lo trate como `null`, asi que el falso tiene que poder no mandarlo. */
          const viejo = S.version.indexOf('1.0.') === 0;
          json(rq, 200, { equipos: S.equipos.map(e => {
            const c = Object.assign({}, e);
            if (viejo) delete c.apodo;
            /* `nombre_para_mostrar` es de la 1.4 (§3.4) y NUNCA viene vacio: con un AET sin
               ninguno de los dos prefijos devuelve el AET. */
            if (es14(S)) c.nombre_para_mostrar = nombreParaMostrar(e.aet);
            return c;
          }) });
          return;
        }

        /* ── 3.14 PUT equipos/{id} — NO existe en un conector 1.0 ── */
        if (esM('PUT', /^\/v1\/equipos\/[^/]+$/)) {
          if (S.version.indexOf('1.0.') === 0) {
            err(rq, 404, 'no_encontrado', 'No encontrado.'); return;
          }
          const id = idDe();
          const eq = S.equipos.find(e => e.id === id);
          /* El 404 MANDA SOBRE EL 400, que es lo que el contrato §3.14 fija: un id que no existe
             con un apodo invalido da 404, para que EcoSmart no se ponga a arreglar el apodo sin
             notar que el id esta mal. */
          if (!eq) { err(rq, 404, 'no_encontrado', 'No hay ningun equipo con ese identificador.'); return; }
          const b = await cuerpoJSON(req);
          const bruto = String(b && b.apodo !== undefined ? b.apodo : '');
          const limpio = bruto.trim();
          if (limpio.length > 40) {
            err(rq, 400, 'pedido_invalido', 'El apodo admite hasta 40 caracteres.'); return;
          }
          if (/[\u0000-\u001f\u007f]/.test(limpio)) {
            err(rq, 400, 'pedido_invalido', 'El apodo no admite saltos de linea ni tabulaciones.'); return;
          }
          eq.apodo = limpio === '' ? null : limpio;
          json(rq, 200, { id: eq.id, apodo: eq.apodo });
          return;
        }

        /* ── 3.5 permitir / 3.6 bloquear ── */
        if (esM('POST', /^\/v1\/equipos\/[^/]+\/permitir$/) ||
            esM('POST', /^\/v1\/equipos\/[^/]+\/bloquear$/)) {
          const permitir = /\/permitir$/.test(url);
          const eq = S.equipos.find(e => e.id === idDe());
          if (!eq) { err(rq, 404, 'no_encontrado', 'Ese equipo no existe.'); return; }
          if (S.cuarentena) { err(rq, 409, 'en_cuarentena', 'El equipo esta en cuarentena.'); return; }
          if (permitir) {
            const n = eq.imagenes;
            eq.estado = 'autorizado';
            json(rq, 200, { id: eq.id, estado: 'autorizado', imagenes_liberadas: n });
          } else {
            const n = eq.imagenes;
            eq.estado = 'bloqueado';
            eq.imagenes = 0;
            json(rq, 200, { id: eq.id, estado: 'bloqueado', imagenes_borradas: n });
          }
          return;
        }

        /* ── 3.7 DELETE equipos/{id} ── */
        if (esM('DELETE', /^\/v1\/equipos\/[^/]+$/)) {
          const i = S.equipos.findIndex(e => e.id === idDe());
          if (i < 0) { err(rq, 404, 'no_encontrado', 'Ese equipo no existe.'); return; }
          S.equipos.splice(i, 1);
          rq.writeHead(204).end();
          return;
        }

        /* ══ 3.8 GET /v1/imagenes ══════════════════════════════════════════════════════════
           SOLO las de equipos AUTORIZADOS, que es lo que §3.8 fija: lo que esta en cuarentena
           no aparece. Y el `_buf` no sale: la lista del contrato no tiene ese campo. */
        if (esM('GET', /^\/v1\/imagenes$/)) {
          sincronizar(S);
          const auto = S.equipos.filter(e => e.estado === 'autorizado').map(e => e.id);
          const vis = S.imagenes.filter(i => !i._cuarentena && auto.indexOf(i.equipo) >= 0);
          const cuerpo = { imagenes: vis.map(i => {
            const c = Object.assign({}, i);
            delete c._buf; delete c._cuarentena; delete c._lote;
            /* §P2 y §P8 llegaron en la 1.3: contra un puente anterior la imagen no los trae. */
            if (!es13(S)) {
              delete c.origen; delete c.formato; delete c.se_puede_ver;
              delete c.lote; delete c.lote_cierra;
            }
            return c;
          }) };
          /* La lista `tandas` es de la 1.4 y VIENE COMPLETA: todas, abiertas y cerradas. */
          if (es14(S)) cuerpo.tandas = S.tandas.slice();
          json(rq, 200, cuerpo);
          return;
        }

        /* ══ 3.9 GET /v1/imagenes/{id}/archivo ═════════════════════════════════════════════
           Los bytes del DICOM tal cual, con su `Content-Type` y su `Content-Disposition`.
           ⚠️ DESCARGAR NO BORRA NADA: la imagen sigue en la lista hasta que EcoSmart confirme.
           Es la mitad del contrato que esta tanda tiene que respetar, asi que el falso no la
           saca ni «por prolijidad». */
        if (esM('GET', /^\/v1\/imagenes\/[^/]+\/archivo$/)) {
          const im = S.imagenes.find(i => i.id === idImg());
          if (!im) { err(rq, 404, 'no_encontrado', 'Esa imagen no existe.'); return; }
          if (im._cuarentena) {
            err(rq, 409, 'en_cuarentena', 'Esa imagen es de un equipo que espera tu decision.');
            return;
          }
          /* ** LA DESCARGA QUE FALLA, Y QUE NO SACA LA IMAGEN DE LA LISTA. Es la mitad que
             importa: si el falso la borrara, un caso que mire la lista no podria distinguir
             «no se pudo bajar» de «se bajo y se confirmo». */
          if (Array.isArray(S.bajarFalla) && S.bajarFalla.indexOf(im.id) >= 0) {
            err(rq, 503, 'no_disponible', 'El almacen no responde. Volve a intentar.');
            return;
          }
          /* ══ EL `Content-Type` SALE DEL FORMATO MEDIDO (CONTRATO 1.3 §P3) ═════════════
             Antes era siempre `application/dicom`. Y lleva SIEMPRE `nosniff` y `attachment`:
             todo lo que no es DICOM, imagen ni video sale como `application/octet-stream`, que
             es lo que hace que el navegador lo baje en vez de interpretarlo. */
          const fmt = String(im.formato || 'dicom');
          const ext = fmt === 'dicom' ? 'dcm' : fmt;
          rq.writeHead(200, { 'Content-Type': es13(S) ? (TIPO_MIME[fmt] || 'application/octet-stream')
                                                      : 'application/dicom',
                              'Content-Length': im._buf.length,
                              'X-Content-Type-Options': 'nosniff',
                              'Content-Disposition': 'attachment; filename="' + im.id + '.' + ext + '"',
                              'Cache-Control': 'no-store' });
          rq.end(Buffer.from(im._buf));
          return;
        }

        /* ══ 3.10 POST /v1/imagenes/{id}/confirmar ═════════════════════════════════════════
           «Ya la guarde»: el conector la borra de verdad. `verificada` en false es el caso que
           EcoSmart tiene que CONTARLE al medico —la imagen se guardo pero quedo una copia—, asi
           que el falso tiene que poder responderlo. */
        if (esM('POST', /^\/v1\/imagenes\/[^/]+\/confirmar$/)) {
          const id = idImg();
          const k = S.imagenes.findIndex(i => i.id === id);
          if (k < 0) { err(rq, 404, 'no_encontrado', 'Esa imagen no existe.'); return; }
          if (S.imagenes[k]._cuarentena) {
            err(rq, 409, 'en_cuarentena', 'Esa imagen es de un equipo que espera tu decision.');
            return;
          }
          /* ** LA CONFIRMACION QUE FALLA, Y NO BORRA. Es la mitad que importa de este escenario:
             EcoSmart tiene que dejar el id anotado para reintentar, y la imagen tiene que SEGUIR
             en la lista -- si el falso la sacara igual, un caso que mire la lista no podria
             distinguir «no se dio por borrada» de «se borro». */
          if (S.confirmarFalla) {
            err(rq, 503, 'no_disponible', 'El almacen no responde. Volve a intentar.');
            return;
          }
          S.imagenes.splice(k, 1);
          S.confirmadas.push(id);
          sincronizar(S);
          json(rq, 200, { id: id, borrada: true, verificada: S.verificada !== false });
          return;
        }

        /* ══ 3.11 DELETE /v1/imagenes/{id} ═════════════════════════════════════════════════ */
        if (esM('DELETE', /^\/v1\/imagenes\/[^/]+$/)) {
          const id = idImg();
          const k = S.imagenes.findIndex(i => i.id === id);
          if (k < 0) { err(rq, 404, 'no_encontrado', 'Esa imagen no existe.'); return; }
          S.imagenes.splice(k, 1);
          S.borradas.push(id);
          sincronizar(S);
          json(rq, 200, { id: id, borrada: true, verificada: S.verificada !== false });
          return;
        }

        err(rq, 404, 'no_encontrado', 'No encontrado.');
      } catch (e) {
        if (String(e && e.message) === 'grande') {
          err(rq, 413, 'pedido_demasiado_grande', 'El pedido es demasiado grande.');
        } else {
          err(rq, 400, 'pedido_invalido', 'El pedido no se entiende.');
        }
      }
    });
    srv.on('error', rej);
    srv.listen(pedido, '127.0.0.1', async () => {
      const cerrado = await puertoCerrado();
      res({ srv, port: srv.address().port, puertoCerrado: cerrado,
            codigo: CODIGO_DE_PRUEBA, token: TOKEN_DE_PRUEBA, escenario: E });
    });
  });
}

/* Corrido suelto imprime su puerto y se queda escuchando. */
if (import.meta.url === `file://${process.argv[1]}`) {
  const f = await servirConectorFalso();
  console.log('conector falso escuchando en http://127.0.0.1:' + f.port);
  console.log('puerto CERRADO a proposito (para probar «no responde»): ' + f.puertoCerrado);
  console.log('codigo de vinculacion de prueba: ' + f.codigo);
}
