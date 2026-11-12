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
 */

import { createServer } from 'node:http';

/* El codigo de vinculacion de fabrica. Es un valor de PRUEBA inventado para este archivo: no
   sale de ningun conector real, no se usa en ningun otro lado y no vale para nada fuera de este
   proceso. El de verdad lo genera el conector al azar en cada arranque. */
const CODIGO_DE_PRUEBA = '472913';

/* Un token de PRUEBA, fijo, para que los casos puedan comprobar que NO aparece en ningun texto
   de la pantalla. 64 hexadecimales como pide el contrato. Tampoco vale fuera de este proceso. */
const TOKEN_DE_PRUEBA = 'a'.repeat(8) + 'b'.repeat(8) + 'c'.repeat(8) + 'd'.repeat(8) +
                        'e'.repeat(8) + 'f'.repeat(8) + '1'.repeat(8) + '2'.repeat(8);

function escenarioDeFabrica() {
  return {
    /* 1.1.0 implementa el contrato 1.1. Poniendo '1.0.0' las dos rutas nuevas dan 404, que es
       lo que el contrato §7 dice que pasa contra un conector viejo. */
    version: '1.1.0',
    orthanc_vivo: true,
    imagenes_pendientes: 3,
    equipos_esperando: 1,
    bytes_usados: 48234112,
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

    conexion: {
      puerto_dicom: 4242,
      aet_puente: 'PUENTE',
      direcciones: [
        { direccion: '192.168.1.23', interfaz: 'en7', probable: true },
      ],
      aviso: null,
    },

    equipos: [
      { id: 'eq_3f8a1c', estado: 'autorizado', aet: 'GE_VIVID_01', ip: '192.168.1.44',
        apodo: 'GE del consultorio', imagenes: 12, ultimo_envio: '2026-11-10T21:44:52Z' },
      { id: 'eq_9b2e7d', estado: 'pendiente', aet: 'ECOFALSO', ip: '127.0.0.1',
        apodo: null, imagenes: 4, ultimo_envio: '2026-11-10T21:46:03Z' },
    ],

    ajustes: { horas_retencion: 24, aet_puente: 'PUENTE' },
  };
}

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
          Object.keys(b).forEach(k => { if (k !== 'reset') dest[k] = b[k]; });
          json(rq, 200, { ok: true, escenario: { version: E.v.version, vinculado: E.v.vinculado } });
          return;
        }

        /* ── 3.1 estado — SIN token ── */
        if (esM('GET', /^\/v1\/estado$/)) {
          json(rq, 200, {
            version: S.version, orthanc_vivo: S.orthanc_vivo,
            imagenes_pendientes: S.imagenes_pendientes, equipos_esperando: S.equipos_esperando,
            bytes_usados: S.bytes_usados, bytes_tope: S.bytes_tope, vinculado: S.vinculado,
          });
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
          json(rq, 200, S.conexion);
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
