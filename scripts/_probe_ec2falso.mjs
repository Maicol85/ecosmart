#!/usr/bin/env node
/**
 * _probe_ec2falso.mjs — ECO-CONECTOR-2, TAREA 1
 *
 * Prueba el CONECTOR FALSO contra el contrato v1.1, sin navegador: levanta el servidor y le
 * pide por la red (loopback) las rutas que esta tanda agrega. Es la prueba del arnes, no de
 * EcoSmart: lo que verifica es que el falso se porte como el contrato dice, porque todo lo que
 * los casos midan despues se apoya en eso.
 *
 * Informa CORRIDOS / SALTEADOS / FALLIDOS, que es el denominador que esta casa exige.
 *
 *     node scripts/_probe_ec2falso.mjs
 */
import { servirConectorFalso } from './_conector_falso.mjs';
const f = await servirConectorFalso();
const B = 'http://127.0.0.1:' + f.port;
const ORIG = 'http://127.0.0.1:9999';
const pedir = async (ruta, op = {}) => {
  const h = { Origin: ORIG };
  if (op.token) h.Authorization = 'Bearer ' + f.token;
  if (op.cuerpo) h['Content-Type'] = 'application/json';
  const r = await fetch(B + ruta, { method: op.m || 'GET', headers: h,
    body: op.cuerpo ? JSON.stringify(op.cuerpo) : undefined });
  const ct = r.headers.get('content-type') || '';
  return { s: r.status, ct, d: ct.indexOf('json') >= 0 ? await r.json() : (await r.arrayBuffer()).byteLength };
};
let n = 0, mal = 0;
const q = (t, ok, det) => { n++; if (!ok) mal++; console.log((ok ? '  ok  ' : '  MAL ') + t + (det !== undefined ? '  [' + det + ']' : '')); };

let r = await pedir('/v1/estado');
q('estado: 3 pendientes derivados de la lista', r.d.imagenes_pendientes === 3, r.d.imagenes_pendientes);
q('estado: 1 equipo esperando derivado', r.d.equipos_esperando === 1, r.d.equipos_esperando);
q('estado: bytes_usados NO se derivo', r.d.bytes_usados === 48234112, r.d.bytes_usados);

r = await pedir('/v1/imagenes');
q('imagenes sin token da 401', r.s === 401, r.s);
await pedir('/v1/vincular', { m: 'POST', cuerpo: { codigo: f.codigo } });
r = await pedir('/v1/imagenes', { token: 1 });
q('imagenes con token: tres', r.s === 200 && r.d.imagenes.length === 3, r.s + ' n=' + (r.d.imagenes || []).length);
q('la lista NO trae _buf ni datos de paciente',
  JSON.stringify(r.d).indexOf('_buf') < 0 && JSON.stringify(r.d).indexOf('PRUEBA') < 0);
q('cada una trae equipo, recibida, bytes, tipo y vista null',
  r.d.imagenes.every(i => i.equipo && i.recibida && i.bytes > 0 && i.tipo && i.vista === null));

r = await pedir('/v1/imagenes/img_a1/archivo', { token: 1 });
q('archivo: 200 application/dicom', r.s === 200 && r.ct.indexOf('dicom') >= 0, r.s + ' ' + r.ct);
q('archivo: trae bytes', r.d > 500, r.d);
r = await pedir('/v1/imagenes', { token: 1 });
q('descargar NO borro nada', r.d.imagenes.length === 3, r.d.imagenes.length);

r = await pedir('/v1/imagenes/img_a1/confirmar', { m: 'POST', token: 1 });
q('confirmar: borrada y verificada', r.d.borrada === true && r.d.verificada === true, JSON.stringify(r.d));
r = await pedir('/v1/imagenes', { token: 1 });
q('confirmar SI la saco de la lista', r.d.imagenes.length === 2, r.d.imagenes.length);
r = await pedir('/v1/imagenes/img_a1/confirmar', { m: 'POST', token: 1 });
q('confirmar dos veces da 404', r.s === 404, r.s);

r = await pedir('/_control', { m: 'POST', cuerpo: { reset: true, verificada: false } });
r = await pedir('/v1/imagenes/img_a1/confirmar', { m: 'POST', token: 1 });
q('verificada false se puede simular', r.d.verificada === false, JSON.stringify(r.d));

await pedir('/_control', { m: 'POST', cuerpo: { reset: true, escena: 'dosEquipos' } });
r = await pedir('/v1/imagenes', { token: 1 });
q('dosEquipos: solo las del AUTORIZADO salen (2 de 3)', r.d.imagenes.length === 2, r.d.imagenes.map(i=>i.id).join(','));

await pedir('/_control', { m: 'POST', cuerpo: { reset: true, escena: 'cuarentena' } });
r = await pedir('/v1/imagenes', { token: 1 });
q('cuarentena: la de cuarentena NO sale en la lista', r.d.imagenes.length === 1, r.d.imagenes.map(i=>i.id).join(','));
r = await pedir('/v1/imagenes/img_q1/archivo', { token: 1 });
q('su archivo da 409 en_cuarentena', r.s === 409 && r.d.error === 'en_cuarentena', r.s + ' ' + r.d.error);

await pedir('/_control', { m: 'POST', cuerpo: { reset: true, escena: 'dosEnvios' } });
r = await pedir('/v1/imagenes', { token: 1 });
const ts = r.d.imagenes.map(i => Date.parse(i.recibida)).sort();
q('dosEnvios: separadas por ~30 min', Math.abs((ts[1]-ts[0])/60000 - 30) < 1, ((ts[1]-ts[0])/60000).toFixed(1) + ' min');

await pedir('/_control', { m: 'POST', cuerpo: { reset: true, escena: 'grande' } });
r = await pedir('/v1/imagenes', { token: 1 });
q('grande: una imagen de ~16 MB', r.d.imagenes[0].bytes > 16e6, r.d.imagenes[0].bytes);
r = await pedir('/v1/imagenes/img_g1/archivo', { token: 1 });
q('y su archivo pesa lo mismo', r.d > 16e6, r.d);

await pedir('/_control', { m: 'POST', cuerpo: { reset: true, escena: 'vacio' } });
r = await pedir('/v1/estado');
q('vacio: cero pendientes', r.d.imagenes_pendientes === 0, r.d.imagenes_pendientes);

for (const k of [0, 1, 2]) {
  await pedir('/_control', { m: 'POST', cuerpo: { reset: true, equipos: k } });
  r = await pedir('/v1/equipos', { token: 1 });
  q('equipos: ' + k, r.d.equipos.length === k, r.d.equipos.length);
}
await pedir('/_control', { m: 'POST', cuerpo: { reset: true, equipos: 2 } });
r = await pedir('/v1/estado');
q('con 2 equipos, uno espera decision', r.d.equipos_esperando === 1, r.d.equipos_esperando);

await pedir('/_control', { m: 'POST', cuerpo: { reset: true, orthancCaido: true } });
r = await pedir('/v1/imagenes', { token: 1 });
q('503 simulable', r.s === 503, r.s);
await pedir('/_control', { m: 'POST', cuerpo: { reset: true, tokenInvalido: true } });
r = await pedir('/v1/imagenes', { token: 1 });
q('401 simulable', r.s === 401, r.s);
await pedir('/_control', { m: 'POST', cuerpo: { reset: true, cuarentena: true } });
r = await pedir('/v1/equipos/eq_9b2e7d/permitir', { m: 'POST', token: 1 });
q('409 simulable', r.s === 409, r.s);

console.log('\n  CORRIDOS: ' + n + '   SALTEADOS: 0   FALLIDOS: ' + mal);
f.srv.close();
process.exit(mal ? 1 : 0);
