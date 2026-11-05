#!/usr/bin/env node
/**
 * _probe_pant14tgaesq.mjs - el esquema del modulo contra el de la pestania TGA (PANT-14, c3c).
 * La condicion para retirar el dibujo viejo incluye el esquema de circulacion. Compara, para las
 * cinco variantes y con cada combinacion de comunicaciones, la GEOMETRIA del esquema que arma el
 * modulo contra la del que arma la pestania: cada rect, path, circle y text con su posicion y su
 * texto, SIN los colores ni los ids de marcador -que difieren a proposito-. Y los colores aparte.
 *   node scripts/_probe_pant14tgaesq.mjs [--file <html>]
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
  const R = { escenas: [], err: [] }; const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const svM = EL('cm3d-schsvg');
  if (!svM) return { ERR: 'NO HAY cm3d-schsvg' };
  if (typeof tgaEsqSVG !== 'function') return { ERR: 'NO HAY tgaEsqSVG' };
  /* la huella GEOMETRICA de un marcado svg: cada nodo con su forma y su texto, sin color */
  const huella = (txt) => {
    const d = document.createElement('div');
    d.innerHTML = '<svg>' + String(txt || '') + '</svg>';
    const out = [];
    Array.prototype.forEach.call(d.querySelectorAll('rect,path,circle,text,line'), function (n) {
      const t = n.tagName.toLowerCase();
      const g = ['x','y','width','height','d','cx','cy','r','rx','x1','y1','x2','y2','text-anchor','font-size']
        .map(a => n.getAttribute(a)).filter(v => v !== null).join(',');
      out.push(t + '[' + g + ']' + (t === 'text' ? '=' + n.textContent : ''));
    });
    return out;
  };
  /* los COLORES de un marcado, en el orden en que aparecen */
  const colores = (txt) => (String(txt || '').match(/(fill|stroke)="[^"]*"/g) || []).join(' ');
  const PARES = [['d','dtga',''],['jat','dtga','jatene'],['mus','dtga','auricular'],
                 ['ras','dtga','rastelli'],['cc','ltga','']];
  const COMS = [['coms0',{asd:false,vsd:false,pda:false}],['comsA',{asd:true,vsd:false,pda:false}],
                ['comsV',{asd:false,vsd:true,pda:false}],['comsP',{asd:false,vsd:false,pda:true}],
                ['comsT',{asd:true,vsd:true,pda:true}]];
  PARES.forEach(function (p) {
    COMS.forEach(function (c) {
      const nom = p[0] + '/' + c[0];
      /* (A) EL ESQUEMA DEL MODULO: su estado, y se le pide que dibuje forzando la guarda */
      let hM = ['ERR'], cM = '';
      try {
        _cm3d.S.base = 'tga'; _cm3d.S.bv.tga = p[0]; _cm3d.S.ck = {}; _cm3d.S.mods = {};
        if (c[1].asd) _cm3d.S.mods.cia = 'sec';
        if (c[1].vsd) _cm3d.S.mods.civ = 'pm';
        if (c[1].pda) _cm3d.S.mods.dap = 'std';
        /* las reglas del modulo pueden bloquear alguna: se aplican, que es lo que el dibujo hace */
        Object.keys(_cm3d.S.mods).slice().forEach(function (k) {
          if (cmBloqueado(k, _cm3d.S)) delete _cm3d.S.mods[k] });
        cmSchRender(true);
        hM = huella(svM.innerHTML); cM = colores(svM.innerHTML);
      } catch (e) { R.err.push(nom + ' modulo: ' + String(e).slice(0, 80)) }
      /* (B) EL ESQUEMA DE LA PESTANIA: su propia funcion, con la clave y las comunicaciones */
      let hT = ['ERR'], cT = '';
      try {
        const clave = (typeof _tga3dClave === 'function') ? _tga3dClave(p[1], p[2]) : p[1];
        const txt = tgaEsqSVG(clave, c[1]);
        hT = huella(txt); cT = colores(txt);
      } catch (e) { R.err.push(nom + ' tga: ' + String(e).slice(0, 80)) }
      /* comparacion */
      const sM = hM.join(' | '), sT = hT.join(' | ');
      let pos = -1;
      for (let i = 0; i < Math.max(sM.length, sT.length); i++) { if (sM[i] !== sT[i]) { pos = i; break } }
      R.escenas.push({ n: nom, igual: sM === sT, nM: hM.length, nT: hT.length,
        soloM: hM.filter(x => hT.indexOf(x) < 0).slice(0, 6).join(' ; '),
        soloT: hT.filter(x => hM.indexOf(x) < 0).slice(0, 6).join(' ; '),
        colorIgual: cM === cT, ctxM: pos >= 0 ? sM.slice(Math.max(0, pos - 50), pos + 80) : '',
        ctxT: pos >= 0 ? sT.slice(Math.max(0, pos - 50), pos + 80) : '' });
    });
  });
  R.iguales = R.escenas.filter(e => e.igual).length;
  R.distintas = R.escenas.filter(e => !e.igual).length;
  return R;
})()`);
await br.close();
if (r.ERR) { console.log(JSON.stringify(r)); process.exit(1) }
console.log('escenas ' + r.escenas.length + ' | IGUALES ' + r.iguales + ' | distintas ' + r.distintas);
r.escenas.filter(e => !e.igual).slice(0, 8).forEach(e => {
  console.log(' DISTINTA ' + e.n + ' (modulo ' + e.nM + ' nodos, tga ' + e.nT + ')');
  if (e.soloM) console.log('    solo en el modulo: ' + e.soloM);
  if (e.soloT) console.log('    solo en la tga   : ' + e.soloT);
});
console.log('color identico en:', r.escenas.filter(e => e.colorIgual).length, 'de', r.escenas.length);
console.log('errores:', JSON.stringify(r.err), '| pagina:', JSON.stringify(errs));
