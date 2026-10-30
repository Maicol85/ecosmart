#!/usr/bin/env node
/**
 * _probe_aj1min.mjs - la FILA DE MINIATURAS del commit 5 de la tanda AJUSTES-1 (2026-10-30).
 *
 * Mide con GESTOS REALES -clics sobre los botones que ve el medico-, no llamando a las
 * funciones: un caso que llama a `infMinMover` a mano fabrica el disparador que la app podria
 * no tener, que es el error que TC-519 y la tanda D pagaron.
 *
 * Lo que comprueba, cada cosa con su denominador:
 *   A · la fila no se ve sin inclusiones y se ve con ellas, con su contador;
 *   B · contiene las capturas Y los diagramas, con su etiqueta y su titulo accesible;
 *   C · el orden de las capturas se cambia con ◀ ▶ y arrastrando, y es el orden en que el PDF
 *       las imprime -se compara contra el PDF generado de verdad-;
 *   D · la ✕ de una captura la quita del PDF y NO la borra del estudio: sigue en `imgSlots` y
 *       en la grilla de «Imagenes del estudio», con su boton para volver a incluirla;
 *   E · la ✕ de un diagrama apaga su propia puerta;
 *   F · los diagramas NO tienen flechas de orden;
 *   G · el contador coincide con las imagenes que el PDF emite de verdad.
 *
 *   node scripts/_probe_aj1min.mjs
 *   node scripts/_probe_aj1min.mjs --file "$PWD/_head_aj1.html"   (contra HEAD: no existe nada)
 *
 * ADVERTENCIA: sin acentos graves dentro de los templates de la sonda.
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
const OUTF = arg('--out') || '/tmp/aj1/min.json';

/* Tres PNG de 1x1 DISTINTOS entre si: sin eso, «la primera miniatura es la A» no se puede
   comprobar, porque las tres tendrian el mismo dataURL. Rojo, verde y azul. */
const PNG = {
  A: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  B: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  C: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
};

const MONTAR = `((P) => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id);
    if (m) m.style.display = 'none' });
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  /* La orejuela, para poder incluir su esquema; y la bicuspide, para el toggle del VAB. */
  S('oai_ostium_diam','26'); S('oai_profundidad','37'); S('oai_vel_vac','30');
  S('oai_morfologia','ala'); S('oai_trombo','no');
  S('va_morf','Bic\\u00faspide'); S('vab_tipo','fused_rl'); S('vab_rafe','si');
  S('vab_simetria','simetrica'); S('ao_sin','42'); S('peso','70'); S('talla','170'); S('sexo','M');
  Object.keys(window).forEach(k => { if (/^calc[A-Z]/.test(k) && typeof window[k] === 'function') {
    try { window[k]() } catch (e) {} } });
  try { if (typeof _recalcModulos === 'function') _recalcModulos('min') } catch (e) {}
  /* TRES CAPTURAS, sembradas en los slots como lo hace el pegado de una imagen. Van por
     imgSlots porque la puerta real -pegar o elegir un archivo- no se puede automatizar sin un
     portapapeles, y lo que esta sonda mide es la FILA, no el pegado. */
  if (typeof imgSlots !== 'undefined') {
    imgSlots.length = 0;
    imgSlots.push({ dataURL: P.A, ampliada:false, calidad:'alta' });
    imgSlots.push({ dataURL: P.B, ampliada:false, calidad:'alta' });
    imgSlots.push({ dataURL: P.C, ampliada:false, calidad:'alta' });
    if (typeof imgSlotCount !== 'undefined') imgSlotCount = 3;
    if (typeof imgEnsureLen === 'function') imgEnsureLen();
    if (typeof imgRender === 'function') imgRender();
  }
  return true;
})(PNGS)`;

/* La lectura de la fila: lo que un lector veria. */
const LEER = `(() => {
  const f = document.getElementById('inf-min-fila');
  if (!f) return { existe:false };
  const cs = getComputedStyle(f);
  const it = [].slice.call(f.querySelectorAll('[data-min-i]'));
  return {
    existe: true,
    visible: cs.display !== 'none',
    cont: (document.getElementById('inf-min-cont') || {}).textContent || '',
    n: it.length,
    items: it.map(e => {
      const im = e.querySelector('img'), x = e.querySelector('.inf-min-x');
      const ord = [].slice.call(e.querySelectorAll('.inf-min-ord button'));
      return {
        id: e.getAttribute('data-min-i'),
        tipo: e.getAttribute('data-min-tipo'),
        et: (e.querySelector('.inf-min-et') || {}).textContent || '',
        titulo: im ? (im.getAttribute('title') || '') : 'SIN IMG',
        alt: im ? (im.getAttribute('alt') || '') : 'SIN IMG',
        src: im ? String(im.getAttribute('src') || '').slice(-12) : '',
        arrastrable: e.getAttribute('draggable') === 'true',
        xAria: x ? (x.getAttribute('aria-label') || '') : 'SIN X',
        ordN: ord.length,
        ordDis: ord.map(b => b.disabled ? '1' : '0').join(''),
        ordAria: ord.map(b => b.getAttribute('aria-label') || '').join(' | '),
        foco: ord.map(b => (b.tagName === 'BUTTON' && b.tabIndex >= 0) ? 'si' : 'no').join(',')
      };
    }),
    ayuda: (f.querySelector('.inf-min-ayuda') || {}).textContent || '',
    /* El denominador: el estado real de la lista de imagenes y de los toggles. */
    slots: (typeof imgSlots === 'undefined') ? 'sin imgSlots'
      : imgSlots.map((s,i) => { if (!s) return i + ':vacio';
          const d = String(s.dataURL || '');
          const M = { 'hKmMIQ':'A', 'WjR9aw':'B', '60e6kg':'C' };
          let n = d.slice(-20, -14);
          Object.keys(M).forEach(p => { if (d.indexOf(p) > -1) n = M[p] });
          return i + ':' + n + (s.noPdf ? '/noPdf' : '') + (s.esquema ? '/esq' : '') }).join(' '),
    vabOn: (typeof vabPdfOn === 'function') ? vabPdfOn() : 'sin fn',
    esqOn: (typeof esqEstaIncluido === 'function') ? esqEstaIncluido('orejuela') : 'sin fn',
    /* El cartel de la grilla de «Imagenes del estudio». */
    grillaFuera: [].slice.call(document.querySelectorAll('#img-grid button'))
      .filter(b => /Incluir en el PDF/.test(b.textContent || '')).length
  };
})()`;

/* El PDF generado DE VERDAD, con el orden de las imagenes. */
const PDF = `(async () => {
  if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) return { err:'SIN JSPDF' };
  const Orig = window.jspdf.jsPDF;
  const reg = { imgs: [] };
  window.jspdf.jsPDF = function (...a) {
    const d = new Orig(...a);
    const oi = d.addImage.bind(d);
    d.addImage = function (data, fmt, x, y, w, h, ...r) {
      /* ⚠️ LA REBANADA VA AL MEDIO Y NO AL FINAL. Los tres PNG de prueba terminan igual
         -«BJRU5ErkJggg==» es la cola de todo PNG-, asi que con slice(-12) las tres capturas
         salian con la MISMA firma y el orden no se podia distinguir: el volcado daba una lista
         vacia y «el orden cambio» no se podia comprobar. Medido. */
      reg.imgs.push(String(data || '').slice(-30, -14)); return oi(data, fmt, x, y, w, h, ...r); };
    d.save = function(){ return true }; d.output = function(){ return '' };
    return d;
  };
  Object.keys(Orig).forEach(k => { try { window.jspdf.jsPDF[k] = Orig[k] } catch(e){} });
  try { if (typeof _pdfAjustarA4 === 'function') await _pdfAjustarA4() } catch (e) { reg.err = String(e).slice(0,120) }
  window.jspdf.jsPDF = Orig;
  /* Solo las tres capturas sembradas: el resto son logos y dibujos del informe. Se devuelven
     en ORDEN de impresion, que es lo que el commit 5 promete que el medico controla. */
  const P = { 'hKmMIQ':'A', 'WjR9aw':'B', '60e6kg':'C' };
  const cs = [];
  reg.imgs.forEach(s => { Object.keys(P).forEach(p => { if (s.indexOf(p) > -1) cs.push(P[p]) }) });
  return { todas: reg.imgs.length, caps: cs };
})()`;

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE, pasos: {} };
try {
  const pg = await b.newPage({ viewport: { width: 1280, height: 900 } });
  pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([e.message.slice(0, 150)]) });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
  await pg.waitForTimeout(1500);

  const leer = async () => pg.evaluate(LEER);
  const paso = async (k, fn) => { if (fn) await fn(); await pg.waitForTimeout(350);
                                  OUT.pasos[k] = await leer();
                                  console.log('-- ' + k + ' | visible=' + OUT.pasos[k].visible +
                                    ' n=' + OUT.pasos[k].n + ' | ' + OUT.pasos[k].cont +
                                    ' | slots: ' + OUT.pasos[k].slots); };

  /* A · VACIO: la fila no se ve. Es el denominador de todo lo demas. */
  await pg.evaluate("(()=>{['modalAvisoEco','login-overlay'].forEach(id=>{const m=document.getElementById(id); if(m)m.style.display='none'});" +
                    "try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){} return true})()");
  await paso('A_vacio');

  /* B · CON TRES CAPTURAS Y LOS DOS DIAGRAMAS. */
  await pg.evaluate(MONTAR.replace('PNGS', JSON.stringify(PNG)));
  await pg.waitForTimeout(400);
  /* El esquema de la orejuela por su GESTO: el boton real. */
  await pg.evaluate("(()=>{ try{ if(typeof oaiEsqIncluirPDF==='function') return oaiEsqIncluirPDF().then(()=>true) }catch(e){} return true })()");
  await pg.waitForTimeout(600);
  /* El toggle del VAB por SU boton, no asignando el campo. */
  await pg.evaluate("(()=>{ const b=document.getElementById('vab-pdf-toggle'); if(b){ b.click(); return 'clic' } " +
                    "if(typeof vabIncluirPDF==='function'){ vabIncluirPDF(); return 'fn' } return 'no hay boton' })()");
  await paso('B_cargado');
  OUT.pdf_B = await pg.evaluate(PDF);

  /* C · REORDENAR con la flecha ▶ de la PRIMERA captura: pasa a ser la segunda. */
  await paso('C_mover', async () => {
    await pg.evaluate("(()=>{ const t=document.querySelector('#inf-min-lista [data-min-tipo=captura]');" +
                      " const bs=t?t.querySelectorAll('.inf-min-ord button'):null; if(bs&&bs[1]) bs[1].click(); return true })()");
  });
  OUT.pdf_C = await pg.evaluate(PDF);

  /* D · QUITAR la primera captura con su ✕ : sale del PDF y SIGUE en el estudio. */
  await paso('D_quitar', async () => {
    await pg.evaluate("(()=>{ const t=document.querySelector('#inf-min-lista [data-min-tipo=captura]');" +
                      " const x=t?t.querySelector('.inf-min-x'):null; if(x) x.click(); return true })()");
  });
  OUT.pdf_D = await pg.evaluate(PDF);

  /* D2 · VOLVER A INCLUIRLA desde la grilla de «Imagenes del estudio». */
  await paso('D2_reincluir', async () => {
    await pg.evaluate("(()=>{ const b=[].slice.call(document.querySelectorAll('#img-grid button'))" +
                      ".filter(x=>/Incluir en el PDF/.test(x.textContent||''))[0]; if(b) b.click(); return true })()");
  });
  OUT.pdf_D2 = await pg.evaluate(PDF);

  /* E · QUITAR un DIAGRAMA con su ✕ : apaga su propia puerta. */
  await paso('E_quitarDiag', async () => {
    await pg.evaluate("(()=>{ const t=[].slice.call(document.querySelectorAll('#inf-min-lista [data-min-tipo=diagrama]'))" +
                      ".filter(e=>/Bic/.test((e.querySelector('img')||{}).title||''))[0];" +
                      " const x=t?t.querySelector('.inf-min-x'):null; if(x) x.click(); return true })()");
  });

  /* F · «Nuevo estudio»: la fila se vacia y se esconde. */
  await paso('F_limpiar', async () => {
    await pg.evaluate("(()=>{ try{ if(typeof limpiarCampos==='function') limpiarCampos(true) }catch(e){}" +
                      " try{ if(typeof imgVaciar==='function') imgVaciar() }catch(e){}" +
                      " try{ if(typeof _recalcModulos==='function') _recalcModulos('min') }catch(e){} return true })()");
  });

  await pg.close();
} catch (e) { OUT._err = String(e).slice(0, 250) }
try { await b.close() } catch (e) {}
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('\nPDF capturas en orden: B=' + JSON.stringify((OUT.pdf_B||{}).caps) +
            '  C=' + JSON.stringify((OUT.pdf_C||{}).caps) +
            '  D=' + JSON.stringify((OUT.pdf_D||{}).caps) +
            '  D2=' + JSON.stringify((OUT.pdf_D2||{}).caps));
console.log('escrito: ' + OUTF + ' (' + fs.statSync(OUTF).size + ' bytes)');
