#!/usr/bin/env node
/**
 * _probe_medir2.mjs - MEDIR-2: la tabla de cinco columnas, las filas calculadas, el contraste y
 * el AREA TACTIL del selector, y el SOLAPE de esas areas con la fila ENVUELTA, medido EN EL
 * NAVEGADOR en Chrome y en WebKit, a 1440x900 y a 1280x800, en los dos temas.
 *
 * ** LLEVA SU DETECTOR DE QUE SON DOS ARBOLES. La ruta por omision de una sonda es la del arbol
 * real, asi que correrla DESDE un worktree no alcanza: los numeros salen identicos, que es justo
 * lo que la prueba queria afirmar, y nadie lo nota. Es el defecto que PANT-37 pago con
 * _probe_ec2dos.mjs. El campo `tieneLoNuevo` dice si el arbol medido trae lo de esta tanda.
 *
 * ** EL TEMA SE PONE COMO LO PONE LA APP: la clase `light-mode` que escribe `loadTheme()` leyendo
 * `localStorage.ett_theme`. NO es `prefers-color-scheme` -- ese fue el hallazgo de metodo de
 * PANT-34. La sonda DEVUELVE que tema quedo puesto, para que el control no se pueda falsear solo.
 *
 * ** EL SOLAPE SE MIDE CON LA FILA ENVUELTA, Y ESA ES LA PARTE QUE CIERRA M2-a. Hoy ninguna fila
 * del selector envuelve en ningun ancho real -- tres botones chicos entran en los 310 px de la
 * columna --, asi que el `row-gap` de 16 px es una GUARDA y una mutacion que lo baje a 3 px
 * sobrevive a TC-208 por la ESCENA. Se mide poniendo la fila en la condicion para la que la
 * guarda existe: se acota el ancho del selector hasta que envuelva de verdad -- con su
 * denominador, que declara que envolvio -- y ahi se cuentan los pares de areas tactiles que se
 * encimarian.
 *
 *     node scripts/_probe_medir2.mjs <ruta/index.html>
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname } from 'node:path';
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
/* Los tres motores salen del MISMO default: `_pwk.webkit` era undefined y el motor no arrancaba. */
const FILE = process.argv[2];
if (!FILE) { console.error('falta la ruta del index.html'); process.exit(2); }
const raiz = dirname(FILE), nom = FILE.slice(raiz.length + 1);
const MIME = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json' };
const { srv, port } = await new Promise(res => {
  const s = createServer(async (req, rq) => {
    try { const rel = decodeURIComponent(req.url.split('?')[0]).replace(/^\/+/,'') || nom;
      const p = join(raiz, rel); if (!p.startsWith(raiz)) { rq.writeHead(403).end(); return; }
      rq.writeHead(200,{'Content-Type':MIME[extname(p)]||'application/octet-stream'}).end(await readFile(p));
    } catch { rq.writeHead(404).end('no'); }
  });
  s.listen(0,'127.0.0.1',()=>res({srv:s,port:s.address().port}));
});

const ANCHOS = [{ w:1440, h:900 }, { w:1280, h:800 }];
const TEMAS  = ['noche', 'dia'];
const MOTORES = [{ n:'chrome', lanzar: () => _pw.chromium.launch({ channel:'chrome' }) },
                 { n:'webkit', lanzar: () => _pw.webkit.launch() }];
const salida = [];

for (const M of MOTORES) {
  let nav = null;
  try { nav = await M.lanzar(); }
  catch (e) { salida.push({ motor:M.n, errMotor:String(e && e.message || e).slice(0,120) }); continue; }
  for (const V of ANCHOS) {
    for (const tema of TEMAS) {
      const ctx = await nav.newContext({ viewport:{ width:V.w, height:V.h } });
      const pg = await ctx.newPage();
      const errs = []; pg.on('pageerror', e => errs.push(String(e&&e.message||e).slice(0,140)));
      const cons = []; pg.on('console', m => { if (m.type()==='error') cons.push(m.text().slice(0,140)); });
      await pg.goto('http://127.0.0.1:'+port+'/'+nom, { waitUntil:'load', timeout:120000 });
      await pg.waitForTimeout(2600);
      await pg.evaluate(`(() => {
        try { sessionStorage.setItem('ett_auth','1'); } catch (e) {}
        try { if (typeof cerrarAvisoEco==='function') cerrarAvisoEco(); } catch (e) {}
        const lo = document.getElementById('login-overlay'); if (lo) lo.style.display='none';
        try { localStorage.setItem('ett_theme', ${JSON.stringify(tema === 'dia' ? 'light' : 'dark')}); } catch (e) {}
        try { if (typeof loadTheme === 'function') loadTheme(); } catch (e) {}
      })()`);
      await pg.waitForTimeout(260);

      const o = await pg.evaluate(`(async () => {
        const o = { errFn: [] };
        /* La clase va en el elemento html y NO en body: la primera version de la sonda de PANT-34
           la busco en body y los cuatro cruces dieron «noche» sobre un tema que SI se habia
           puesto. Medir mal el control negativo se lee igual que no tenerlo.
           (Sin acentos graves: este comentario vive DENTRO del template que se evalua en el
           navegador, y ahi un acento grave cierra la cadena.) */
        o.tema = document.documentElement.classList.contains('light-mode') ? 'dia' : 'noche';
        /* EL DETECTOR DE QUE SON DOS ARBOLES */
        o.tieneLoNuevo = (typeof window._medTablaHTML === 'function') &&
                         (typeof window.anahiActiva === 'function');

        const jpg = new Uint8Array([255,216,255,217]);
        const mk = n => ({ nombre:n, cuadros:1, d:{ frags:[jpg], cols:600, filas:500, msCuadro:0,
          regiones:[{ ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:600, y1:500, tipo:1 }] } });
        try { _cineAbrir([mk('A')]); } catch (e) { o.errFn.push('abrir: ' + e.message); return o; }
        await new Promise(r => setTimeout(r, 420));
        const $ = id => document.getElementById(id);
        try { if (!_vistaA.medOn) $('cine-medir').click(); } catch (e) { o.errFn.push('medir: ' + e.message); }
        await new Promise(r => setTimeout(r, 420));

        /* ── 1. LA TABLA DE CINCO COLUMNAS, en los DOS cajones ───────────────────────────── */
        const leer = id => { const c = $(id); if (!c) return null;
          const t = c.querySelector('table.med-tabla'); if (!t) return null;
          return {
            th: [...t.querySelectorAll('thead th')].map(e => (e.textContent||'').trim()),
            fs: [...t.querySelectorAll('tbody tr')].map(tr => { const td = [...tr.children];
              return { cols: td.length, med: (td[0].textContent||'').trim(),
                val: (td[1].textContent||'').trim(), uni: (td[2].textContent||'').trim(),
                nbot: td[3].querySelectorAll('button').length,
                acc: (td[3].textContent||'').trim(),
                italic: getComputedStyle(tr).fontStyle === 'italic',
                chk: td[4].querySelectorAll('input[type=checkbox]').length,
                dis: !!td[4].querySelector('input[disabled]') }; })
          }; };
        try { medHerramienta('dist'); if (_d2Estado().modo !== 'vi') d2Modo('vi');
              _d2Poner('vi.sivd', 10); _d2Poner('vi.sivs', 14); _d2Render(); }
        catch (e) { o.errFn.push('2d: ' + e.message); }
        await new Promise(r => setTimeout(r, 300));
        const A = leer('d2-cajon');
        o.d2Th = A ? A.th.join('|') : '(sin tabla)';
        o.d2Cinco = !!A && A.fs.length > 0 && A.fs.every(f => f.cols === 5);
        o.d2Filas = A ? A.fs.length : 0;
        const calc = A ? A.fs.filter(f => f.nbot === 0) : [];
        o.d2Calc = calc.length;
        o.d2CalcBien = calc.length > 0 && calc.every(f => f.italic === true && f.acc === 'calculada');
        o.d2Chk = !!A && A.fs.every(f => f.chk === 1 && f.dis === true);

        try { medHerramienta('vel'); if (_dopEstado().modo !== 'pul') dopModo('pul');
              _dopEstado().pul.vmaxEp = 2.5; _dopRender(); }
        catch (e) { o.errFn.push('dop: ' + e.message); }
        await new Promise(r => setTimeout(r, 300));
        const D = leer('dop-cajon');
        o.dopTh = D ? D.th.join('|') : '(sin tabla)';
        o.dopCinco = !!D && D.fs.length > 0 && D.fs.every(f => f.cols === 5);
        o.mismoEncabezado = !!A && !!D && A.th.join('|') === D.th.join('|');
        /* Los nombres del bloque C, leidos de la tabla que el medico ve */
        o.dopRot = D ? D.fs.map(f => f.med).join(' / ') : '';
        o.cUnaVmaxPulm = !!D && D.fs.filter(f => f.med.indexOf('Vmax pulmonar') === 0).length === 1;
        o.cSinVP = !!D && D.fs.filter(f => f.med === 'VP').length === 0;
        o.cDosIP = !!D && !!D.fs.filter(f => f.med.indexOf('Vmax proto-diast. IP') === 0)[0] &&
                          !!D.fs.filter(f => f.med.indexOf('Vmax telediast') === 0)[0];

        /* ── 2. EL CONTRASTE DEL SELECTOR, en el tema que esta puesto ────────────────────── */
        try { medHerramienta('dist'); } catch (e) {}
        await new Promise(r => setTimeout(r, 260));
        const lum = c => { const q = String(c); if (q.indexOf('(') < 0) return null;
          const n = q.slice(q.indexOf('(')+1, q.lastIndexOf(')')).split(',').slice(0,3).map(x => parseFloat(x));
          if (!isFinite(n[0])) return null;
          const f = v => { v/=255; return v<=0.03928 ? v/12.92 : Math.pow((v+0.055)/1.055, 2.4); };
          return 0.2126*f(n[0]) + 0.7152*f(n[1]) + 0.0722*f(n[2]); };
        const fondoDe = el => { let m = el;
          while (m && m !== document.documentElement) { const bg = getComputedStyle(m).backgroundColor;
            if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') return bg; m = m.parentElement; }
          return 'rgb(255, 255, 255)'; };
        const side = $('cine-side');
        const sel = () => [...side.querySelectorAll('.cine-selbtn')];
        const cs = sel().map(e => { const L1 = lum(getComputedStyle(e).color), L2 = lum(fondoDe(e));
          if (L1 == null || L2 == null) return null;
          return +(((Math.max(L1,L2)+0.05)/(Math.min(L1,L2)+0.05)).toFixed(2)); }).filter(x => x != null);
        o.nSel = sel().length;
        o.peorContraste = cs.length ? Math.min.apply(null, cs) : -1;
        o.contrasteOk = cs.length > 0 && o.peorContraste >= 4.5;

        /* ── 3. EL AREA TACTIL DE 44 px ──────────────────────────────────────────────────── */
        const areaDe = e => Math.round(parseFloat(getComputedStyle(e, '::after').height) || 0);
        const altos = sel().map(e => Math.round(e.getBoundingClientRect().height));
        o.altoBoton = altos.length ? Math.min.apply(null, altos) : -1;
        const as = sel().map(areaDe);
        o.areaMin = as.length ? Math.min.apply(null, as) : -1;
        o.tactilOk = as.length > 0 && o.areaMin >= 44;

        /* ── 4. EL SOLAPE, CON LA FILA ENVUELTA (cierra M2-a) ────────────────────────────── */
        const solapes = () => { const b = sel(); let n = 0;
          for (let i = 0; i < b.length; i++) for (let j = i + 1; j < b.length; j++) {
            const r1 = b[i].getBoundingClientRect(), r2 = b[j].getBoundingClientRect();
            if (!(r1.left < r2.right - 1 && r2.left < r1.right - 1)) continue;
            const d = Math.abs((r1.top + r1.height/2) - (r2.top + r2.height/2));
            if (d > 0.5 && d < 44) n++;
          }
          return n; };
        const lineas = () => { const t = {};
          sel().forEach(e => { const y = Math.round(e.getBoundingClientRect().top); t[y] = 1; });
          return Object.keys(t).length; };
        o.solapesNormal = solapes();
        o.lineasNormal = lineas();
        /* Se acota el selector hasta que una fila ENVUELVA de verdad. El denominador es que el
           numero de lineas CREZCA: sin eso, «cero solapes» se cumple sin que la guarda actue. */
        const anchoOrig = side.style.maxWidth;
        let env = false, anchoEnv = 0;
        for (const w of [160, 120, 96, 72, 56]) {
          side.style.maxWidth = w + 'px';
          await new Promise(r => setTimeout(r, 140));
          if (lineas() > o.lineasNormal) { env = true; anchoEnv = w; break; }
        }
        o.envolvio = env;
        o.anchoEnvuelto = anchoEnv;
        o.lineasEnvuelto = lineas();
        o.solapesEnvuelto = solapes();
        o.areaMinEnvuelto = (() => { const q = sel().map(areaDe); return q.length ? Math.min.apply(null, q) : -1; })();
        o.rowGap = (() => { const f = side.querySelector('.cine-selfila');
          return f ? getComputedStyle(f).rowGap : '(sin fila)'; })();
        side.style.maxWidth = anchoOrig;
        await new Promise(r => setTimeout(r, 160));
        o.solapesTrasRestituir = solapes();

        /* ── 5. SIMPSON INDEXADO y el boton «Volumen» apagado ────────────────────────────── */
        o.volHay = false; o.volApagado = false; o.volLeyenda = '';
        try { const vb = [...side.querySelectorAll('button')].filter(b => (b.textContent||'').trim() === 'Volumen')[0];
          o.volHay = !!vb; o.volApagado = !!vb && vb.disabled === true;
          o.volLeyenda = vb ? (vb.getAttribute('title')||'') : ''; } catch (e) {}
        o.volDicePronto = o.volLeyenda.indexOf('proximamente') >= 0 ||
                          o.volLeyenda.indexOf('próximamente') >= 0;

        /* ── 6. LAS DOS ESTRUCTURAS DEL AREA (bloque D) ──────────────────────────────────── */
        try { medHerramienta('area'); } catch (e) {}
        await new Promise(r => setTimeout(r, 300));
        o.areaAI = !!$('cine-est-area-ai');
        o.areaAD = !!$('cine-est-area-ad');
        o.areaSinLasDeDist = !$('cine-est-vi');

        /* ── 7. LA COMUNIDAD: el cartel con su texto exacto y cero escrituras ────────────── */
        o.anahiOn = (typeof anahiActiva === 'function') ? anahiActiva() : 'sin fn';
        const lsAntes = (() => { try { return Object.keys(localStorage).slice().sort().join('|'); }
                                catch (e) { return 'SIN LS'; } })();
        try { if (typeof _anahiCartelVisto !== 'undefined') _anahiCartelVisto = false; } catch (e) {}
        /* d2Modo ALTERNA: con el modo ya en «vi» -lo dejo el bloque 1- llamarlo lo APAGA y la
           tabla no se pinta, asi que la celda no existe y el cartel no se puede medir. Es la
           misma trampa del toggle que los tres casos de esta tanda tuvieron que cerrar. */
        try { medHerramienta('dist'); if (_d2Estado().modo !== 'vi') d2Modo('vi'); _d2Render(); } catch (e) {}
        await new Promise(r => setTimeout(r, 260));
        const cel = $('d2-cajon') ? $('d2-cajon').querySelector('.anahi-cel') : null;
        o.celdaHay = !!cel;
        if (cel) cel.click();
        await new Promise(r => setTimeout(r, 240));
        const ov = $('anahi-ov');
        o.cartel = !!ov;
        o.cartelRol = ov ? ov.getAttribute('role') : '';
        o.cartelTit = ov && ov.querySelector('h4') ? (ov.querySelector('h4').textContent||'').trim() : '';
        o.cartelCuerpoLargo = ov && ov.querySelector('p') ? (ov.querySelector('p').textContent||'').trim().length : -1;
        o.cartelBtn = ov && ov.querySelector('button') ? (ov.querySelector('button').textContent||'').trim() : '';
        o.cartelSinMarcado = ov && ov.querySelector('p') ? (ov.querySelector('p').children.length === 0) : null;
        o.cartelFoco = ov ? String(document.activeElement && document.activeElement.id) : '';
        if (ov && ov.querySelector('button')) ov.querySelector('button').click();
        await new Promise(r => setTimeout(r, 200));
        o.cartelCerro = !$('anahi-ov');
        o.lsIgual = ((() => { try { return Object.keys(localStorage).slice().sort().join('|'); }
                              catch (e) { return 'SIN LS'; } })() === lsAntes);
        o.cfgBloque = !!$('cfg-card-anahi');
        o.cfgSinBotones = !!$('cfg-card-anahi') && $('cfg-card-anahi').querySelectorAll('button').length === 0;
        o.cfgSinCampos = !!$('cfg-card-anahi') &&
          $('cfg-card-anahi').querySelectorAll('input, select, textarea').length === 0;
        o.btnMenu = !!$('igio-exp-anahi');

        /* ── 9. LAS TRES RUTAS AL INFORME, EJERCITADAS DE VERDAD ────────────────────────
           El diff ya dice que ninguna linea de las tres se movio, pero eso es una prueba sobre
           el texto del archivo y no sobre la conducta. Aca se siembra la entrada de cada una por
           donde la app la toma -- la ultima distancia medida, los dos VTI con su rol y la FEVI
           del biplano -- y se mira el CAMPO del informe. Con su denominador: los tres campos
           arrancan vacios, asi que un valor leido despues no puede venir de antes. */
        const vCampo = id => { const e = $(id); return e ? String(e.value || '') : '(sin campo)'; };
        o.r3Antes = [vCampo('diam_tsvi'), vCampo('itv_tsvi'), vCampo('vti_tsvd'), vCampo('fevi')].join('|');
        o.r3Vacios = o.r3Antes === '|||';
        const confReal = window.confirm; window.confirm = () => true;
        try {
          _medLineas.push({ a:{x:1,y:1}, b:{x:9,y:9}, mm:21.5 });
          medVtiDiametro('tsvi');
          _medVtis.push({ cm:22.4, rol:'tsvi' });
          _medVtis.push({ cm:18.6, rol:'tsvd' });
          medVtiCargar();
          _simpEscribirFEVI(58);
        } catch (e) { o.errFn.push('rutas: ' + e.message); }
        await new Promise(r => setTimeout(r, 300));
        window.confirm = confReal;
        o.r3Diam = vCampo('diam_tsvi');
        o.r3VtiTsvi = vCampo('itv_tsvi');
        o.r3VtiTsvd = vCampo('vti_tsvd');
        o.r3Fevi = vCampo('fevi');
        o.r3Ok = o.r3Diam === '21.5' && o.r3VtiTsvi === '22.4' &&
                 o.r3VtiTsvd === '18.6' && o.r3Fevi === '58';

        /* ── 8. NADA RECORTADO Y NADA QUE DESPLACE ──────────────────────────────────────── */
        o.scrollX = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
        o.recortados = (() => { let n = 0;
          document.querySelectorAll('#cine-ov .cine-selbtn, #cine-ov table.med-tabla td').forEach(e => {
            if (e.scrollWidth > e.clientWidth + 1) n++; });
          return n; })();
        return o;
      })()`);

      o.motor = M.n; o.ancho = V.w; o.alto = V.h; o.temaPedido = tema;
      o.errsPagina = errs.length; o.errsConsola = cons.length;
      o.errsDetalle = errs.concat(cons).slice(0, 3);
      salida.push(o);
      await ctx.close();
    }
  }
  await nav.close();
}
srv.close();

const C = ['motor','ancho','temaPedido','tema','tieneLoNuevo','r3Vacios','r3Diam','r3VtiTsvi','r3VtiTsvd','r3Fevi','r3Ok','d2Th','d2Cinco','d2Filas','d2Calc',
  'd2CalcBien','d2Chk','mismoEncabezado','cUnaVmaxPulm','cSinVP','cDosIP','nSel','peorContraste',
  'contrasteOk','altoBoton','areaMin','tactilOk','rowGap','lineasNormal','solapesNormal','envolvio',
  'anchoEnvuelto','lineasEnvuelto','solapesEnvuelto','areaMinEnvuelto','solapesTrasRestituir',
  'volHay','volApagado','volDicePronto','areaAI','areaAD','areaSinLasDeDist','anahiOn','celdaHay',
  'cartel','cartelRol','cartelTit','cartelCuerpoLargo','cartelBtn','cartelSinMarcado','cartelFoco',
  'cartelCerro','lsIgual','cfgBloque','cfgSinBotones','cfgSinCampos','btnMenu','scrollX',
  'recortados','errsPagina','errsConsola'];
console.log('== MEDIR-2 · dos motores · ' + salida.length + ' cruces ==');
salida.forEach(o => {
  if (o.errMotor) { console.log(o.motor + ': MOTOR NO ARRANCO -- ' + o.errMotor); return; }
  console.log('--- ' + o.motor + ' ' + o.ancho + 'x' + o.alto + ' tema=' + o.tema + ' ---');
  C.forEach(k => { if (k in o) console.log('   ' + k.padEnd(20) + ' ' + JSON.stringify(o[k])); });
  if (o.errFn && o.errFn.length) console.log('   errFn               ' + JSON.stringify(o.errFn));
  if (o.errsDetalle && o.errsDetalle.length) console.log('   errsDetalle         ' + JSON.stringify(o.errsDetalle));
});
/* UNA sola firma de valores en todos los cruces: si los cruces coinciden, esto imprime 1. */
const firma = o => C.filter(k => k !== 'motor' && k !== 'ancho' && k !== 'temaPedido' && k !== 'tema' &&
  k !== 'peorContraste' && k !== 'anchoEnvuelto' && k !== 'cartelFoco')
  .map(k => k + '=' + JSON.stringify(o[k])).join(';');
const firmas = {}; salida.filter(o => !o.errMotor).forEach(o => { firmas[firma(o)] = (firmas[firma(o)]||0) + 1; });
console.log('');
console.log('FIRMAS DISTINTAS (sin contraste ni ancho envuelto ni foco): ' + Object.keys(firmas).length);
console.log('CONTRASTE PEOR POR CRUCE: ' + salida.filter(o => !o.errMotor)
  .map(o => o.motor + '/' + o.ancho + '/' + o.tema + '=' + o.peorContraste).join('  '));
process.exit(0);
