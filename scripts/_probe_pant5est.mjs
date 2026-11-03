/*
 * _probe_pant5est.mjs - los estadios de la AHA/ACC 2020 de las cuatro valvulas que faltaban
 * (PANT-5, commit 9). Nombre propio: verificado con ls contra HEAD, no existia.
 * Recorre los grados x los tres estados de la pregunta de sintomas y lee la fila del panel.
 *   node scripts/_probe_pant5est.mjs --file <index.html>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const FILE = arg('--file') || (RAIZ + '/index.html');

const JS = `(() => {
  const o = { casos: [], err: [] };
  const F = (fn) => { try { return (typeof window[fn] === 'function') ? window[fn]() : 'NO EXISTE ' + fn }
    catch (e) { o.err.push(fn + ': ' + e); return null } };
  /* El estado clinico se escribe donde el panel lo lee. */
  const SET = (k, v) => { try { if (typeof _indClinSet === 'function') _indClinSet(k, v);
    else if (typeof _indClin !== 'undefined') { if (v === null) delete _indClin[k]; else _indClin[k] = v } }
    catch (e) { o.err.push('set ' + k + ': ' + e) } };
  /* ⚠️ UN VALOR QUE EL SELECTOR NO TIENE COMO OPCION NO SE PUEDE ASIGNAR: queda en cadena vacia
     y la sonda mide la rama de «sin dato» creyendo que mide otra. Es la trampa que esta misma
     tanda pago en el commit 6. El grado «moderada-severa» (valor 3) ya no es opcion de los
     selectores de la app -se fue con el select viejo- pero SI puede venir de un estudio
     guardado, asi que para probar esa rama la opcion se inyecta al vuelo. */
  const CAMPO = (id, v) => { const e = document.getElementById(id); if (!e) { o.err.push('falta ' + id); return }
    if (e.options && v !== '' && !Array.prototype.some.call(e.options, x => x.value === String(v))) {
      const op = document.createElement('option'); op.value = String(v); op.textContent = String(v); e.appendChild(op);
    }
    e.value = v;
    if (String(e.value) !== String(v)) o.err.push('no tomo ' + id + '=' + v); };
  const COMB = [
    { v:'EM',  fn:'_indEstEM',  campo:'em_grado', sint:'em.sintomas',
      grados:['severa','leve','sin'] },
    { v:'IMP', fn:'_indEstIMP', campo:'im_grado', sint:'im.sintomas',
      grados:['4','3','2','0'], extra:{ fevi:'65', dsfvi:'34' } },
    { v:'IMS', fn:'_indEstIMS', campo:'im_grado', sint:'ims.sintomas',
      grados:['4','3','1','0'] },
    { v:'IT',  fn:'_indEstIT',  campo:'it_grado', sint:'vt.sintomas',
      grados:['4','3','2','0'] }
  ];
  COMB.forEach(C => {
    (C.grados).forEach(g => {
      ['si','no',null].forEach(sx => {
        CAMPO(C.campo, g);
        if (C.extra) Object.keys(C.extra).forEach(k => CAMPO(k, C.extra[k]));
        SET(C.sint, sx);
        const r = F(C.fn);
        o.casos.push({ v:C.v, g:g, sx:sx === null ? 'sin' : sx,
          txt: r && r.txt ? r.txt : String(r), marca: r && r.marca ? r.marca : '',
          folio: r && r.nota ? (String(r.nota).match(/folio e\\d+/) || [''])[0] : '',
          tabla: r && r.nota ? (String(r.nota).match(/Tabla \\d+/) || [''])[0] : '',
          notaLen: r && r.nota ? String(r.nota).length : 0 });
      });
    });
  });
  /* C1 / C2 de la insuficiencia mitral primaria: los dos lados del corte. */
  const C12 = [];
  [['65','34','C1'],['58','34','C2'],['65','42','C2'],['60','34','C2']].forEach(t => {
    CAMPO('im_grado','4'); CAMPO('fevi', t[0]); CAMPO('dsfvi', t[1]); SET('im.sintomas','no');
    const r = F('_indEstIMP');
    C12.push('FEVI ' + t[0] + ' DSVI ' + t[1] + ' -> ' + (r && r.txt) + ' (esperado ' + t[2] + ')');
  });
  o.c12 = C12;
  /* El aviso de las dos lesiones sin estadio. */
  const nh = F('_indEstNoHay');
  o.noHay = nh && nh.txt ? nh.txt : String(nh);
  o.itNota = (typeof _indEstITNota === 'function') ? _indEstITNota() : 'NO EXISTE';
  /* NADA LLEGA AL PAPEL: el estadio no puede aparecer en el informe ni en el EN SUMA. */
  try { if (typeof generarInforme === 'function') generarInforme() } catch (e) {}
  const inf = (document.getElementById('informe_texto') || {}).value || '';
  const suma = (document.getElementById('en_suma') || {}).value || '';
  o.papel = { infChars: inf.length, sumaChars: suma.length,
    estadio: (inf + ' ' + suma).indexOf('Estadio') > -1,
    aha: (inf + ' ' + suma).indexOf('AHA/ACC') > -1 };
  return o;
})()`;

const nav = await _pw.chromium.launch({ channel: 'chrome' });
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const pg = await ctx.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(String(e).slice(0, 140)));
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
await pg.waitForTimeout(1200);
const r = await Promise.race([pg.evaluate(JS),
  new Promise((_, rj) => setTimeout(() => rj(new Error('timeout')), 60000))]);
await ctx.close(); await nav.close();
let v = '';
for (const c of r.casos) {
  if (c.v !== v) { v = c.v; console.log('--- ' + v + ' ---') }
  console.log('  grado=' + String(c.g).padEnd(7) + ' sint=' + c.sx.padEnd(4) +
    ' -> ' + String(c.txt).padEnd(56) + ' [' + c.marca + '] ' + c.tabla + ' ' + c.folio + ' nota=' + c.notaLen);
}
console.log('--- C1/C2 de la IM primaria ---');
r.c12.forEach(x => console.log('  ' + x));
console.log('sin estadio: "' + r.noHay + '"');
console.log('nota de la estenosis tricuspidea: "' + String(r.itNota).trim() + '"');
console.log('PAPEL: informe ' + r.papel.infChars + ' chars, EN SUMA ' + r.papel.sumaChars +
  ' | contiene «Estadio»=' + r.papel.estadio + ' | contiene «AHA/ACC»=' + r.papel.aha);
console.log('errores internos: ' + JSON.stringify(r.err.slice(0, 4)) + ' | de pagina: ' + errs.length + ' ' + (errs[0] || ''));
