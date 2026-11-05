#!/usr/bin/env node
/**
 * _probe_pant14tgareglas.mjs - QUE COMUNICACIONES DIBUJA EL 3D VIEJO (PANT-14, commit 3a).
 * No lee el codigo: llama a tga3dEscena con cada par anatomia-cirugia y con cada combinacion
 * de comunicaciones, y cuenta los objetos que aparecen. De ahi salen las reglas que el modulo
 * tiene que aplicar, en vez de las de la demo v13, que son mas estrictas.
 *   node scripts/_probe_pant14tgareglas.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const br = await _pw.chromium.launch({ channel: 'chrome' });
const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 140)));
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
await pg.waitForTimeout(1600);
const r = await pg.evaluate(`(() => {
  const R = { pares: {}, err: [] };
  if (typeof tga3dEscena !== 'function') return { ERR: 'NO HAY tga3dEscena' };
  const PARES = [['dtga',''],['dtga','jatene'],['dtga','auricular'],['dtga','rastelli'],['ltga','']];
  const COMBOS = [
    ['nada',  { asd:false, vsd:false, pda:false }],
    ['asd',   { asd:true,  vsd:false, pda:false }],
    ['vsd',   { asd:false, vsd:true,  pda:false }],
    ['pda',   { asd:false, vsd:false, pda:true  }],
    ['todas', { asd:true,  vsd:true,  pda:true  }],
  ];
  /* la huella de una escena: cuantos objetos de cada tipo, y sus rotulos */
  const huella = s => {
    if (!s) return { ERR: 'NULA' };
    const ex = (s.ex || []).map(o => o.t + '@' + JSON.stringify(o.p && o.p.length ? (o.p[0] || o.p) : o.p));
    return { nEx: (s.ex || []).length, nFl: (s.fl || []).length, nLb: (s.lb || []).length,
             tipos: (s.ex || []).map(o => o.t).join(','),
             rotulos: (s.lb || []).map(l => l[0]).join(' | '),
             firma: JSON.stringify(s).length, ex: ex.join(' ') };
  };
  PARES.forEach(function (p) {
    const nom = p[0] + '/' + (p[1] || 'sin');
    R.pares[nom] = {};
    const base = huella(tga3dEscena(p[0], p[1], { asd:false, vsd:false, pda:false }));
    COMBOS.forEach(function (c) {
      let s = null;
      try { s = tga3dEscena(p[0], p[1], c[1]) } catch (e) { R.err.push(nom + '/' + c[0] + ': ' + String(e).slice(0, 80)) }
      const h = huella(s);
      /* DIBUJA esa comunicacion si la escena cambia respecto de la escena sin ninguna */
      h.cambia = (c[0] === 'nada') ? null : (h.firma !== base.firma || h.nEx !== base.nEx || h.nFl !== base.nFl || h.rotulos !== base.rotulos);
      h.dEx = h.nEx - base.nEx; h.dFl = h.nFl - base.nFl; h.dLb = h.nLb - base.nLb;
      R.pares[nom][c[0]] = h;
    });
  });
  return R;
})()`);
await br.close();
if (r.ERR) { console.log(JSON.stringify(r)); process.exit(1) }
console.log('== QUE DIBUJA EL 3D VIEJO, por par anatomia/cirugia ==');
for (const par of Object.keys(r.pares)) {
  const p = r.pares[par];
  const dib = ['asd', 'vsd', 'pda'].filter(k => p[k] && p[k].cambia);
  const no = ['asd', 'vsd', 'pda'].filter(k => p[k] && !p[k].cambia);
  console.log(' ' + par.padEnd(18) + ' DIBUJA: ' + (dib.join(', ') || 'ninguna') + '   | NO dibuja: ' + (no.join(', ') || 'ninguna'));
  ['nada', 'asd', 'vsd', 'pda', 'todas'].forEach(k => {
    const h = p[k]; if (!h) return;
    console.log('    ' + k.padEnd(6) + ' ex=' + h.nEx + ' fl=' + h.nFl + ' lb=' + h.nLb + ' (d ' + h.dEx + '/' + h.dFl + '/' + h.dLb + ') firma=' + h.firma);
  });
}
console.log('errores:', JSON.stringify(r.err), 'pagina:', JSON.stringify(errs));
