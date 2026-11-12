/* Sonda de solo lectura: comprueba que el conector falso sirve las escenas nuevas de
   ECO-CONECTOR-3 y que la confirmacion que falla NO borra. Informa corridos/salteados/fallidos. */
import { servirConectorFalso } from './_conector_falso.mjs';

const f = await servirConectorFalso();
const base = 'http://127.0.0.1:' + f.port;
/* ** EL `Origin` VA EN TODO PEDIDO: este falso rechaza con 403 lo que no trae un origen de
   loopback, igual que el de verdad rechaza lo que no es el de produccion. Sin esta cabecera la
   sonda mide 403 en todo y se lee como «el conector no sirve ninguna escena». */
const ORIG = { Origin: 'http://127.0.0.1:65000' };
let ok = 0, mal = 0, salt = 0;
const R = [];
function chk(n, cond, det) { if (cond) { ok++; R.push('  OK   ' + n + (det ? ' — ' + det : '')); }
                             else { mal++; R.push('  FALLA ' + n + (det ? ' — ' + det : '')); } }
const ctrl = (o) => fetch(base + '/_control', { method:'POST', headers:Object.assign({'Content-Type':'application/json'}, ORIG),
                                                body: JSON.stringify(o) }).then(r => r.json());
let TOK = '';
async function vincular() {
  const c = await ctrl({ reset: true });
  const r = await fetch(base + '/v1/vincular', { method:'POST', headers:Object.assign({'Content-Type':'application/json'}, ORIG),
            body: JSON.stringify({ codigo: f.codigo, nombre: 'sonda' }) });
  const j = await r.json();
  TOK = j.token || '';
  return !!TOK;
}
const conTok = (u, m) => fetch(base + u, { method: m || 'GET', headers: Object.assign({ Authorization: 'Bearer ' + TOK }, ORIG) });

chk('vincula y da token', await vincular());

for (const [esc, idEsp, minBytes] of [['nativoFija','img_n1',600],['nativoImplicita','img_n2',600],
                                      ['nativoColor','img_n3',1700],['nativo16','img_n4',1100],
                                      ['nativoCineloop','img_n5',5000],['noSoportado','img_r1',200]]) {
  await ctrl({ escena: esc });
  const l = await (await conTok('/v1/imagenes')).json();
  const im = (l.imagenes || [])[0];
  chk('escena ' + esc + ' lista una imagen', !!im && im.id === idEsp, im ? im.id : 'sin imagen');
  if (!im) { salt++; continue; }
  const a = await conTok('/v1/imagenes/' + im.id + '/archivo');
  const buf = new Uint8Array(await a.arrayBuffer());
  const dicm = String.fromCharCode(buf[128], buf[129], buf[130], buf[131]);
  chk('escena ' + esc + ' baja un DICOM', a.status === 200 && dicm === 'DICM' && buf.length >= minBytes,
      buf.length + ' bytes, marca «' + dicm + '»');
}

/* El envio mixto: tres de un equipo, dentro de la ventana, con DOS tipos. */
await ctrl({ escena: 'mixto' });
{
  const l = await (await conTok('/v1/imagenes')).json();
  const im = l.imagenes || [];
  const fijas = im.filter(i => i.tipo === 'imagen').length, vids = im.filter(i => i.tipo === 'video').length;
  chk('mixto: 2 fijas y 1 cineloop', fijas === 2 && vids === 1, fijas + ' fijas, ' + vids + ' video');
}

/* La confirmacion que falla: 503 y la imagen SIGUE en la lista. */
await ctrl({ reset: true, escena: 'nativoFija', confirmarFalla: true });
{
  const r = await conTok('/v1/imagenes/img_n1/confirmar', 'POST');
  const l = await (await conTok('/v1/imagenes')).json();
  chk('confirmar falla da 503', r.status === 503, 'estado ' + r.status);
  chk('y la imagen NO se borro', (l.imagenes || []).some(i => i.id === 'img_n1'),
      (l.imagenes || []).length + ' en la lista');
}
/* Control negativo: sin el flag, confirmar SI borra. */
await ctrl({ reset: true, escena: 'nativoFija' });
{
  const r = await conTok('/v1/imagenes/img_n1/confirmar', 'POST');
  const l = await (await conTok('/v1/imagenes')).json();
  chk('CONTROL: sin el flag, confirmar borra', r.status === 200 && !(l.imagenes || []).some(i => i.id === 'img_n1'),
      'estado ' + r.status + ', quedan ' + (l.imagenes || []).length);
}
/* El grande sin comprimir: 512x512x60 = 15,7 MB de pixeles. */
await ctrl({ reset: true, escena: 'nativoGrande' });
{
  const a = await conTok('/v1/imagenes/img_ng/archivo');
  const buf = new Uint8Array(await a.arrayBuffer());
  chk('nativoGrande pesa lo esperado', buf.length > 15 * 1024 * 1024 && buf.length < 17 * 1024 * 1024,
      (buf.length / 1048576).toFixed(2) + ' MB');
}
/* Los tres estados de error que la orden pide. */
await ctrl({ reset: true, tokenInvalido: true });
chk('401 con token invalido', (await conTok('/v1/imagenes')).status === 401);
await ctrl({ reset: true, escena: 'cuarentena' });
chk('409 en cuarentena', (await conTok('/v1/imagenes/img_q1/archivo')).status === 409);
await ctrl({ reset: true, orthancCaido: true });
chk('503 con el almacen caido', (await conTok('/v1/imagenes')).status === 503);

console.log(R.join('\n'));
console.log('\nRESULTADO: corridos ' + (ok + mal) + ' · OK ' + ok + ' · fallidos ' + mal + ' · salteados ' + salt);
f.srv.close();
process.exit(mal ? 1 : 0);
