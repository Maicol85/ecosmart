/*
 * _probe_pant3esq.mjs - los rotulos del esquema de circulacion de la TGA (tanda PANT-3,
 * commit 2a). Nombre propio: verificado con ls contra HEAD, no existia.
 *
 * QUE MIDE Y COMO. Para cada uno de los seis escenarios y para cada juego de comunicaciones:
 * la caja de cada <text> del SVG y, de cada trazado, una MUESTRA DE PUNTOS por
 * getPointAtLength. Un rotulo "cruza" una linea si algun punto de la linea cae dentro de su
 * caja; dos rotulos se pisan si sus cajas se intersecan en los DOS ejes.
 *
 * ⚠️ POR QUE NO SE COMPARAN DOS CAJAS. La caja de un trazado DIAGONAL es un rectangulo enorme
 * que contiene casi todo el dibujo: comparar caja contra caja informa cruces que no existen. La
 * caja del texto contra los PUNTOS de la linea es lo que se ve en la pantalla.
 *
 * El SVG se inyecta en un contenedor propio y visible, con el mismo viewBox y el mismo ancho
 * que la tarjeta: asi se mide el GENERADOR y se puede recorrer los seis escenarios sin depender
 * de que el 3D se haya bajado de internet.
 *
 *   node scripts/_probe_pant3esq.mjs --file <index.html> --out /tmp/p3esq.json
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT', buscado: CAND })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/p3esq.json';
const ANCHO = Number(arg('--ancho') || 605);

const MEDIR = `((W) => {
  const out = { esc: {} };
  if (typeof tgaEsqSVG !== 'function') return { err: 'SIN tgaEsqSVG' };
  /* El contenedor de medicion: visible, con el ancho real de la tarjeta. */
  let host = document.getElementById('p3esq-host');
  if (!host) { host = document.createElement('div'); host.id = 'p3esq-host';
    host.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;background:#fff;width:' + W + 'px';
    document.body.appendChild(host); }
  const ESC = ['norm','dtga','mus','jat','ras','ltga'];
  const COMS = [ { n:'sin', sh:{asd:false,vsd:false,pda:false} },
                 { n:'asd', sh:{asd:true,vsd:false,pda:false} },
                 { n:'vsd', sh:{asd:false,vsd:true,pda:false} },
                 { n:'pda', sh:{asd:false,vsd:false,pda:true} },
                 { n:'todas', sh:{asd:true,vsd:true,pda:true} } ];
  const inter = (a, b) => !(a.x + a.width <= b.x || b.x + b.width <= a.x ||
                            a.y + a.height <= b.y || b.y + b.height <= a.y);
  const dentro = (p, r) => p.x >= r.x && p.x <= r.x + r.width && p.y >= r.y && p.y <= r.y + r.height;
  ESC.forEach(function (k) {
    COMS.forEach(function (c) {
      const key = k + '/' + c.n;
      let svg = '';
      try { svg = tgaEsqSVG(k, c.sh) } catch (e) { out.esc[key] = { err: String(e).slice(0, 90) }; return }
      if (!svg) { out.esc[key] = { err: 'vacio' }; return }
      host.innerHTML = svg;
      const s = host.querySelector('svg');
      if (!s) { out.esc[key] = { err: 'sin svg' }; return }
      s.setAttribute('width', String(W));
      const txs = Array.prototype.slice.call(s.querySelectorAll('text'));
      const pts = Array.prototype.slice.call(s.querySelectorAll('path'));
      const T = txs.map(function (t) {
        let bb = null; try { bb = t.getBBox() } catch (e) {}
        return { t: String(t.textContent || '').slice(0, 16), nodo: t,
                 r: bb ? { x: bb.x, y: bb.y, width: bb.width, height: bb.height } : null };
      }).filter(function (o) { return o.r && o.r.width > 0 });
      /* Los trazados que son RECORRIDO o COMUNICACION: los que tienen dasharray. El marco de
         los organos y las valvulas son rect y circle, no entran. */
      const L = [];
      pts.forEach(function (p) {
        const da = p.getAttribute('stroke-dasharray');
        if (!da) return;
        let largo = 0; try { largo = p.getTotalLength() } catch (e) { return }
        if (!(largo > 0)) return;
        const mu = [];
        const N = Math.max(12, Math.min(140, Math.round(largo / 2)));
        for (let i = 0; i <= N; i++) {
          try { const q = p.getPointAtLength(largo * i / N); mu.push({ x: q.x, y: q.y }) } catch (e) {}
        }
        L.push({ d: String(p.getAttribute('d') || '').slice(0, 40), cls: p.getAttribute('class') || '',
                 mu: mu, i: Array.prototype.indexOf.call(s.querySelectorAll('*'), p) });
      });
      /* ══ LA CLASIFICACION, Y SIN ELLA EL NUMERO NO DICE NADA ════════════════════════════
         Un cruce solo se ve si la linea se dibuja ENCIMA del texto. Hay tres formas de que no:
           · el texto lleva HALO -paint-order con el trazo del fondo-;
           · el texto esta DENTRO de un rect o un circulo relleno que se dibuja DESPUES de la
             linea, que es el caso de las dos letras de las valvulas, dentro de su circulo, y de
             los rotulos de las cavidades, dentro de su recuadro;
           · el texto se dibuja despues de la linea Y lleva halo.
         Lo que hay que llevar a CERO son los cruces DESNUDOS: texto sin halo con la linea
         pintada encima. Sin esta separacion, exigir cero cruces obligaria a sacar las letras de
         las valvulas de su circulo, que es cambiar el esquema. */
      const nodos = Array.prototype.slice.call(s.querySelectorAll('*'));
      const ordenDe = (e) => nodos.indexOf(e);
      const tapas = Array.prototype.slice.call(s.querySelectorAll('rect, circle')).map(function (m) {
        const f = m.getAttribute('fill') || '';
        if (!f || f === 'none') return null;
        let bb = null; try { bb = m.getBBox() } catch (e) {}
        return bb ? { r: { x: bb.x, y: bb.y, width: bb.width, height: bb.height }, i: ordenDe(m) } : null;
      }).filter(Boolean);
      const contiene = (a, b) => b.x >= a.x - 1 && b.y >= a.y - 1 &&
                                 b.x + b.width <= a.x + a.width + 1 && b.y + b.height <= a.y + a.height + 1;
      const cruces = [], pisa = [];
      txs.forEach(function (nodoT, iT) {
        const t = T.filter(function (o) { return o.nodo === nodoT })[0];
        if (!t) return;
      });
      T.forEach(function (t) {
        const tieneHalo = !!(t.nodo && t.nodo.getAttribute('stroke') &&
                             parseFloat(t.nodo.getAttribute('stroke-width') || '0') > 0);
        L.forEach(function (l) {
          const n = l.mu.filter(function (q) { return dentro(q, t.r) }).length;
          if (!n) return;
          const tapado = tapas.some(function (m) { return m.i > l.i && contiene(m.r, t.r) });
          const desnudo = !tieneHalo && !tapado;
          cruces.push({ rot: t.t, linea: l.d, pts: n, halo: tieneHalo ? 1 : 0,
                        tapa: tapado ? 1 : 0, desnudo: desnudo ? 1 : 0 });
        });
      });
      for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++)
        if (inter(T[i].r, T[j].r)) pisa.push({ a: T[i].t, b: T[j].t });
      out.esc[key] = { nTextos: T.length, nLineas: L.length, cruces: cruces, pisa: pisa,
                       desnudos: cruces.filter(function (c) { return c.desnudo }).length,
                       rotulos: T.map(function (t) { return t.t + '@' + Math.round(t.r.x) + ',' + Math.round(t.r.y) }) };
    });
  });
  host.innerHTML = '';
  return out;
})(ANCHOW)`;

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE, ancho: ANCHO };
try {
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([e.message.slice(0, 150)]) });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
  await pg.waitForTimeout(1500);
  const r = await pg.evaluate(MEDIR.replace('ANCHOW', String(ANCHO)));
  Object.assign(OUT, r);
  await pg.close();
} catch (e) { OUT._err = String(e).slice(0, 300) }
try { await b.close() } catch (e) {}
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
let tc = 0, tp = 0, n = 0, td = 0;
Object.keys(OUT.esc || {}).forEach(k => { const o = OUT.esc[k];
  if (o.cruces) { tc += o.cruces.length; tp += o.pisa.length; td += (o.desnudos || 0); n++ } });
OUT._resumen = { escenarios: n, cruces: tc, desnudos: td, pisa: tp };
console.log('escenarios medidos: ' + n + '  cruces: ' + tc + '  DE ELLOS DESNUDOS: ' + td +
            '  rotulos que se pisan: ' + tp);
console.log('escrito: ' + OUTF);
