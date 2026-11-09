#!/usr/bin/env node
/**
 * _probe_pant28ref.mjs - tanda PANT-28. SOLO LECTURA.
 * Nombre propio: verificado con ls, no existia.
 * Mide, con el GESTO REAL -tocar la pestania Referencias, tocar la solapa principal y tocar el
 * encabezado plegable de cada ficha- lo que esta tanda agrega a Referencias:
 *   · que la ficha nueva existe DENTRO del panel que le toca y nace CERRADA,
 *   · el ORDEN de sus bloques numerados por su textContent,
 *   · que no aparece ninguna palabra prohibida ni ningun bloque vacio,
 *   · que las fichas que ya existian quedan IDENTICAS caracter por caracter,
 *   · que el buscador encuentra el contenido nuevo con su mecanismo,
 *   · desplazamiento horizontal del cuerpo a 390 px y errores de consola y de pagina.
 * DENOMINADOR: cada pieza declara si se encontro; una pieza ausente se DICE y no se cuenta
 * como cero.
 * CONTROL NEGATIVO: un termino que NO esta en ninguna ficha debe dar cero resultados.
 * No escribe nada en el proyecto.
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium } = _pw;
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');

const PROH = ['pendiente de revisi', 'sin fuente', 'próximamente', 'proximamente',
              'no se encontr', 'no coinciden', 'difieren', 'discrepan', 'se contradicen',
              'ninguna fuente publica'];
/* El orden exacto que la decision (2) pide para la ficha nueva. */
const ORDEN_RACONG = ['1 · Clasificaci', '2 · Clínica', '3 · Riesgo',
                      '4 · El ecocardiograma'];
const ORDEN_RACONG_B = ['5 · Otras exploraciones', '6 · Cirug', '7 · Seguimiento'];
const BUSCA_SI = ['fibroelastosis', 'Nyquist', 'intraconal', 'Takeuchi', 'unroofing', 'neo-ostium'];
const BUSCA_NO = ['zzqqxx'];
/* Las dos fichas nuevas de miocardiopatias y el orden que la decision pide para cada una. */
const ORDEN_ATLETA = ['1 \u00b7 Definici', '2 \u00b7 Cl\u00ednica', '3 \u00b7 El ecocardiograma',
                      '4 \u00b7 El ECG', '5 \u00b7 C\u00f3mo se diferencia',
                      '6 \u00b7 Qu\u00e9 hace cada fuente'];
const ORDEN_CHAGAS = ['1 \u00b7 Epidemiolog', '2 \u00b7 Cl\u00ednica y estadios',
                      '3 \u00b7 El ecocardiograma', '4 \u00b7 El ECG',
                      '5 \u00b7 Arritmias y riesgo', '6 \u00b7 Tratamiento',
                      '7 \u00b7 Seguimiento'];
/* ⚠️ «Rassi» NO sirve de control: el buscador tiene una forma COMPACTA que borra los
   separadores, asi que «rassi» empareja dentro de «…ras si…» y devuelve 1 aunque la palabra no
   exista en el archivo -verificado con grep: cero apariciones-. Es comportamiento preexistente
   del buscador, no un defecto de esta tanda. Los controles son terminos sin esa trampa. */
const BUSCA_MIO = ['desentrenamiento', 'Sokolow', 'benznidazol', 'Roma\u00f1a'];

const errs = [];
const navegador = await chromium.launch({ channel: 'chrome' });
const ctx = await navegador.newContext({ viewport: { width: 1440, height: 900 } });
const pg = await ctx.newPage();
pg.on('console', m => { if (m.type() === 'error') errs.push('consola: ' + m.text().slice(0, 120)) });
pg.on('pageerror', e => errs.push('pagina: ' + String(e).slice(0, 120)));
await pg.goto('file://' + FILE);
await pg.waitForTimeout(2500);
/* Las transiciones se apagan: una ficha a medio abrir mide otra cosa. */
await pg.addStyleTag({ content: '*{transition:none !important;animation:none !important}' });

const R = await pg.evaluate(({ PROH, ORDEN_RACONG, ORDEN_RACONG_B, BUSCA_SI, BUSCA_NO, ORDEN_ATLETA, ORDEN_CHAGAS, BUSCA_MIO }) => {
  const o = { pasos: [] };
  const clic = (el) => { if (!el) return false; el.click(); return true };
  /* ── 1 · el gesto real: la pestania Referencias ───────────────────────── */
  const botRefs = Array.prototype.slice.call(document.querySelectorAll('button,[onclick]'))
    .filter(b => ((b.getAttribute('onclick') || '').indexOf("'refs'") > -1))[0];
  o.pasos.push('boton Referencias: ' + (botRefs ? 'si' : 'NO'));
  if (botRefs) clic(botRefs); else if (window.showTab) showTab('refs');
  /* ── 2 · el gesto real: la solapa principal «Cardiopatia congenita» ────── */
  const sub = document.getElementById('ref-subtab-congenitas');
  o.pasos.push('solapa congenitas: ' + (sub ? 'si' : 'NO'));
  if (sub) clic(sub);
  const panel = document.getElementById('ref-sub-congenitas');
  o.panelExiste = !!panel;
  /* ── 3 · la ficha nueva esta DENTRO de ese panel y nace cerrada ─────────── */
  const cuerpo = document.getElementById('ref-racong');
  o.fichaExiste = !!cuerpo;
  o.fichaEnPanel = !!(panel && cuerpo && panel.contains(cuerpo));
  o.fichaCerrada = !!(cuerpo && getComputedStyle(cuerpo).display === 'none');
  /* el encabezado hermano, que es el gesto que la abre */
  const card = cuerpo ? cuerpo.closest('.card') : null;
  const cab = card ? card.querySelector('h2.card-head') : null;
  o.cabExiste = !!cab;
  o.cabTexto = cab ? cab.textContent.replace(/\s+/g, ' ').trim() : null;
  if (cab) clic(cab);
  o.fichaAbierta = !!(cuerpo && getComputedStyle(cuerpo).display !== 'none');
  /* ── 4 · DENOMINADOR y contenido ────────────────────────────────────────── */
  const t = cuerpo ? cuerpo.textContent.replace(/\s+/g, ' ') : '';
  o.largoRacong = t.length;
  o.orden = [];
  let prev = -1, ok = true;
  ORDEN_RACONG.forEach(r => { const i = t.indexOf(r); o.orden.push([r, i]); if (i < 0 || i < prev) ok = false; prev = i });
  o.ordenOk = ok;
  o.ordenB = ORDEN_RACONG_B.map(r => [r, t.indexOf(r)]);
  /* tablas y filas: un bloque vacio no existe */
  o.tablas = cuerpo ? cuerpo.querySelectorAll('table').length : 0;
  o.filas = cuerpo ? cuerpo.querySelectorAll('table tr').length : 0;
  o.celdasVacias = cuerpo ? Array.prototype.slice.call(cuerpo.querySelectorAll('table'))
    .filter(t => t.rows[0] && t.rows[0].cells.length < 5)
    .reduce((a, t) => a + Array.prototype.slice.call(t.querySelectorAll('td'))
      .filter(td => td.textContent.trim() === '').length, 0) : 0;
  /* La tabla de cirugia por guia: celdas en blanco donde esa guia no publica recomendacion para
     esa situacion. Una celda en blanco no dice nada de la guia; escribir ahi «no publica» si
     estaria prohibido por la regla del 04/11. */
  o.guiasVacias = cuerpo ? Array.prototype.slice.call(cuerpo.querySelectorAll('table'))
    .filter(t => t.rows[0] && t.rows[0].cells.length >= 5)
    .reduce((a, t) => a + Array.prototype.slice.call(t.querySelectorAll('td'))
      .filter(td => td.textContent.trim() === '').length, 0) : 0;
  o.guiasFilas = cuerpo ? Array.prototype.slice.call(cuerpo.querySelectorAll('table'))
    .filter(t => t.rows[0] && t.rows[0].cells.length >= 5)
    .reduce((a, t) => a + t.rows.length - 1, 0) : 0;
  /* Ninguna celda compara una guia con otra: ninguna nombra a OTRA guia dentro de su columna. */
  o.celdasQueComparan = (function () {
    if (!cuerpo) return -1;
    const NOM = ['ACC/AHA', 'ESC 20', 'AHA/ACC', 'ASE 20'];
    let n = 0;
    Array.prototype.slice.call(cuerpo.querySelectorAll('table'))
      .filter(t => t.rows[0] && t.rows[0].cells.length >= 5)
      .forEach(function (t) {
        const cab = Array.prototype.slice.call(t.rows[0].cells).map(c => c.textContent.trim());
        for (let r = 1; r < t.rows.length; r++) {
          for (let c = 1; c < t.rows[r].cells.length; c++) {
            const tx = t.rows[r].cells[c].textContent;
            NOM.forEach(function (nm) {
              if (tx.indexOf(nm) > -1 && cab[c].indexOf(nm) < 0) n++;
            });
          }
        }
      });
    return n;
  })();
  o.rotulosSinTabla = (function () {
    if (!cuerpo) return -1;
    let n = 0;
    Array.prototype.slice.call(cuerpo.children).forEach(function (el, i, arr) {
      if (el.tagName === 'DIV' && /^\d+ · /.test(el.textContent.trim())) {
        const sig = arr[i + 1];
        if (!sig || (sig.tagName !== 'TABLE' && sig.tagName !== 'DIV')) n++;
      }
    });
    return n;
  })();
  o.prohibidas = PROH.filter(p => t.toLowerCase().indexOf(p) > -1);
  /* ⚠️ NO alcanza con buscar la palabra: la Clase I de la ESC 2022 y el texto de riesgo de la
     ACC/AHA 2025 nombran el electrocardiograma de esfuerzo, y eso NO es un bloque de ECG. Lo que
     la decision (3) prohibe es un BLOQUE, asi que se mira el rotulo de cada bloque. */
  o.rotulos = cuerpo ? Array.prototype.slice.call(cuerpo.children)
    .filter(el => el.tagName === 'DIV' && el.style && el.style.fontWeight === '700')
    .map(el => el.textContent.trim()) : [];
  o.bloqueECG = o.rotulos.filter(r => /ECG|electrocardiogr/i.test(r)).length;
  o.bloqueDeporte = o.rotulos.filter(r => /deporte|restricci/i.test(r)).length;
  o.bloqueAneurismaCor = o.rotulos.filter(r => /aneurisma/i.test(r)).length;
  o.tieneEsquema = !!(cuerpo && cuerpo.querySelector('svg, canvas'));
  /* ── 5 · la ficha vieja, caracter por caracter ──────────────────────────── */
  const vieja = document.getElementById('ref-coronarias');
  o.viejaExiste = !!vieja;
  o.viejaTexto = vieja ? vieja.textContent.replace(/\s+/g, ' ').trim() : null;
  o.viejaLargo = o.viejaTexto ? o.viejaTexto.length : -1;
  const vcard = vieja ? vieja.closest('.card') : null;
  o.viejaEnPanel = !!(panel && vieja && panel.contains(vieja));
  o.viejaCab = vcard ? vcard.querySelector('h2.card-head').textContent.replace(/\s+/g, ' ').trim() : null;
  /* la ficha de miocardiopatias, que los commits 6 y 7 tocan */
  const mio = document.getElementById('ref-miocard');
  o.miocardLargo = mio ? mio.textContent.replace(/\s+/g, ' ').trim().length : -1;
  /* ── 6 · el reparto y el indice del buscador ────────────────────────────── */
  try {
    const T = window.REF_SUBTAB;
    o.reparto = T ? Object.keys(T).map(k => k + '=' + T[k].length).join(' ') : 'SIN REF_SUBTAB';
    o.total = T ? Object.keys(T).reduce((a, k) => a + T[k].length, 0) : -1;
  } catch (e) { o.reparto = 'EXC' }
  try { o.indice = window._refIndiceArmar ? window._refIndiceArmar(true).length : -1 } catch (e) { o.indice = 'EXC' }
  /* ── 7 · el buscador, con el gesto real y su control negativo ───────────── */
  const campo = document.getElementById('ref-busca');
  o.buscadorExiste = !!campo;
  /* ⚠️ EL HELPER SE VALIDA ANTES DE USARLO. La primera version despachaba un evento `input` y
     leia el contenedor enseguida: devolvia 1 para «Rassi», que NO aparece ni una vez en el
     archivo -verificado con grep, cero apariciones-, porque leia el render de la consulta
     ANTERIOR. Ahora llama a `refBuscar()`, que es sincronica y vacia el contenedor antes de
     pintar, y la sonda publica el triple de validacion: un termino presente, uno ausente y el
     campo vacio. */
  const buscar = (q) => {
    if (!campo) return -1;
    campo.value = q;
    if (typeof window.refBuscar === 'function') window.refBuscar();
    else campo.dispatchEvent(new Event('input', { bubbles: true }));
    const res = document.getElementById('ref-busca-res');
    if (!res) return -2;
    return res.querySelectorAll('[data-ref-id]').length;
  };
  /* control positivo, negativo y el cero en los dos sentidos */
  o.validaBuscador = { presente: buscar('Frommelt'), ausente: buscar('zzqqxx'),
                       vacio: buscar(''), devuelta: buscar('Frommelt') };
  o.buscaSi = BUSCA_SI.map(q => [q, buscar(q)]);
  o.buscaNo = BUSCA_NO.map(q => [q, buscar(q)]);
  if (campo) { campo.value = ''; campo.dispatchEvent(new Event('input', { bubbles: true })) }
  /* ── 8 · los enlaces del inventario ─────────────────────────────────────── */
  try {
    const M = window.VINFO_REF_MAPA || null;
    o.mapaOtrRac = M ? M['otr-rac'] : 'SIN MAPA';
  } catch (e) { o.mapaOtrRac = 'EXC' }
  o.globoClona = (function () {
    try {
      if (!window._otrRefClon) return 'SIN FUNCION';
      const n = window._otrRefClon('ref-coronarias');
      return n ? n.textContent.replace(/\s+/g, ' ').trim().length : -1;
    } catch (e) { return 'EXC' }
  })();
  /* ── 10 · las DOS fichas de miocardiopatias, en el panel «Otros hallazgos» ─────── */
  const sub2 = document.getElementById('ref-subtab-otros');
  o.solapaOtros = !!sub2;
  if (sub2) clic(sub2);
  const panel2 = document.getElementById('ref-sub-otros');
  o.mio = {};
  [['atleta', ORDEN_ATLETA], ['chagas', ORDEN_CHAGAS]].forEach(function (par) {
    const id = par[0], ORD = par[1];
    const c = document.getElementById('ref-' + id);
    const m = { existe: !!c };
    if (c) {
      m.enPanel = !!(panel2 && panel2.contains(c));
      m.cerrada = getComputedStyle(c).display === 'none';
      const cd = c.closest('.card'), cb = cd ? cd.querySelector('h2.card-head') : null;
      m.cab = cb ? cb.textContent.replace(/\s+/g, ' ').trim() : null;
      if (cb) clic(cb);
      m.abierta = getComputedStyle(c).display !== 'none';
      const tx = c.textContent.replace(/\s+/g, ' ');
      m.largo = tx.length;
      let pv = -1; m.ordenOk = true;
      m.orden = ORD.map(function (r) { const k = tx.indexOf(r);
        if (k < 0 || k < pv) m.ordenOk = false; pv = k; return [r, k] });
      m.tablas = c.querySelectorAll('table').length;
      m.filas = c.querySelectorAll('table tr').length;
      m.celdasVacias = Array.prototype.slice.call(c.querySelectorAll('td'))
        .filter(td => td.textContent.trim() === '').length;
      m.prohibidas = PROH.filter(x => tx.toLowerCase().indexOf(x) > -1);
      m.esquema = !!c.querySelector('svg, canvas');
      m.rotulos = Array.prototype.slice.call(c.children)
        .filter(el => el.tagName === 'DIV' && el.style && el.style.fontWeight === '700')
        .map(el => el.textContent.trim());
      /* ninguna frase transcribe los criterios de MCH ni de MCA que la app ya tiene */
      m.criteriosMCH = /grosor pared .15 ?mm|≥15mm|gradiente ≥30|HCM Risk-SCD/i.test(tx);
      m.criteriosMCA = /TSVD paraesternal|2 mayores|fracci.n de acortamiento de .rea/i.test(tx);
      /* ningun puntaje aplicado a un paciente: ni un campo ni un boton dentro de la ficha */
      m.controles = c.querySelectorAll('input, select, button').length;
    }
    o.mio[id] = m;
  });
  /* la ficha de miocardiopatias que ya existia, para compararla */
  const mio2 = document.getElementById('ref-miocard');
  o.miocardTexto = mio2 ? mio2.textContent.replace(/\s+/g, ' ').trim() : null;
  o.miocardLargo = o.miocardTexto ? o.miocardTexto.length : -1;
  o.buscaMio = BUSCA_MIO.map(q => [q, buscar(q)]);
  if (campo) { campo.value = ''; campo.dispatchEvent(new Event('input', { bubbles: true })) }
  return o;
}, { PROH, ORDEN_RACONG, ORDEN_RACONG_B, BUSCA_SI, BUSCA_NO, ORDEN_ATLETA, ORDEN_CHAGAS, BUSCA_MIO });

/* ── 9 · pantalla angosta: la PAGINA no desborda ─────────────────────────── */
await pg.setViewportSize({ width: 390, height: 840 });
await pg.waitForTimeout(400);
R.a390 = await pg.evaluate(() => {
  const o = { scrollH: document.documentElement.scrollWidth - document.documentElement.clientWidth,
              bodyScrollH: document.body.scrollWidth - document.body.clientWidth, fichas: {} };
  /* ⚠️ DENOMINADOR: cada ficha se mide con SU panel activo. Con el panel escondido el subarbol
     no tiene geometria y todo da cero, que se lee igual que «no desborda». */
  [['racong', 'congenitas'], ['atleta', 'otros'], ['chagas', 'otros']].forEach(function (par) {
    const id = par[0];
    const sb = document.getElementById('ref-subtab-' + par[1]);
    if (sb) sb.click();
    const c = document.getElementById('ref-' + id);
    if (!c) { o.fichas[id] = 'NO EXISTE'; return }
    /* DENOMINADOR: una ficha cerrada no tiene geometria y medir ahi da cero. */
    const abierta = getComputedStyle(c).display !== 'none';
    o.fichas[id] = { abierta: abierta, panelVisible: !!(c.offsetParent || c.getClientRects().length),
      anchas: Array.prototype.slice.call(c.querySelectorAll('table'))
        .filter(t => t.getBoundingClientRect().right > innerWidth + 1).length,
      conScrollPropio: Array.prototype.slice.call(c.querySelectorAll('div'))
        .filter(d => d.scrollWidth > d.clientWidth + 1).length };
  });
  return o;
});
/* tema noche: los colores son tokens, asi que no deberia cambiar nada estructural */
await pg.setViewportSize({ width: 1440, height: 900 });
await pg.evaluate(() => { try { document.documentElement.setAttribute('data-theme', 'dark') } catch (e) {} });
await pg.waitForTimeout(300);
R.noche = await pg.evaluate(() => {
  const c = document.getElementById('ref-racong');
  return c ? c.textContent.replace(/\s+/g, ' ').length : -1;
});
R.errores = errs;
await navegador.close();
console.log(JSON.stringify(R, null, 1));
