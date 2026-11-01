#!/usr/bin/env node
/**
 * _probe_pa_c6.mjs - la disposicion de abajo y el DIBUJO IDENTICO a HEAD (POP-A-6).
 *
 * Compara el SVG del esquema contra el del arbol que se le pase con --head, nodo por nodo y
 * atributo por atributo, con la MISMA escena cargada. DENOMINADOR: el numero de nodos del SVG,
 * que con el modulo vacio es distinto de cero porque el dibujo se dibuja igual.
 *
 *   node scripts/_probe_pa_c6.mjs [--file <html>] [--head <html>] [--ancho 1440]
 *
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const HEAD = arg('--head') || null;
const ANCHOS = arg('--ancho') ? [Number(arg('--ancho'))] : [1440, 1000, 768, 390];

const ABRIR = `(async () => {
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
    b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const Q = String.fromCharCode(39);
  try { limpiarCampos(true) } catch (e) {}
  ['nombre','ci','peso','talla','sexo'].forEach((id, i) => { const e = EL(id);
    if (e) { e.value = ['Prueba POPA','777','70','170','M'][i];
      e.dispatchEvent(new Event('input', { bubbles: true }));
      e.dispatchEvent(new Event('change', { bubbles: true })) } });
  const b = bq('showTab(' + Q + 'hemodinamica'); if (b) b.click();
  await new Promise(r => setTimeout(r, 250));
  const c = bq('toggleCard(' + Q + 'pop-seccion'); if (c) c.click();
  await new Promise(r => setTimeout(r, 300));
  return getComputedStyle(EL('pop-seccion')).display;
})()`;

const MEDIR = `(async () => {
  const R = {};
  const EL = id => document.getElementById(id);
  const S = (id, v) => { const e = EL(id); if (!e) return 'NO ' + id; e.value = v;
    e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
  const M = (id, on) => { const c = EL(id); if (!c) return 'NO'; c.checked = !!on;
    c.dispatchEvent(new Event('change', { bubbles: true })); return c.checked };
  /* La ESCENA: la misma en los dos arboles, y con datos que el dibujo dibuja -gasto, presiones,
     derrames, soporte y una droga-. Sin esto el SVG sale gris en los dos y comparar dos dibujos
     vacios no prueba nada. */
  S('pop_monitor', 'swan'); S('pop_sw_gc', '3.2'); S('pop_sw_pam', '68');
  S('pop_sw_pad', '14'); S('pop_sw_pcp', '22'); S('pop_sw_paps', '48'); S('pop_sw_papd', '22');
  S('pop_sw_fc', '96'); S('pop_lactato', '3.4'); S('pop_cx_horas', '6');
  S('tapse', '14'); S('vd_vi', '1.1'); S('pop_pleura_der', 'moderado');
  S('pop_pleura_izq', 'leve'); S('pop_pulmon_lineasb', 'difusas');
  S('pop_asist_tipo', 'bcia'); S('pop_bcia_ratio', '1:1');
  M('pop_nor_activa', 1); S('pop_nor_dosis', '0.25');
  try { popSync() } catch (e) {}
  /* el dibujo ANIMA: se para antes de fotografiarlo, si no dos fotos del mismo arbol difieren */
  try { if (typeof popEsqParar === 'function') popEsqParar() } catch (e) {}
  await new Promise(r => setTimeout(r, 400));
  try { if (typeof popEsqParar === 'function') popEsqParar() } catch (e) {}
  await new Promise(r => setTimeout(r, 120));

  const svg = EL('pop-esq-svg');
  R.svgNodos = svg ? svg.querySelectorAll('*').length : 0;
  R.svgViewBox = svg ? svg.getAttribute('viewBox') : 'NO';
  R.svgAria = svg ? String(svg.getAttribute('aria-label') || '').slice(0, 60) : 'NO';
  /* la firma: cada nodo con su etiqueta y sus atributos ordenados. Las coordenadas son del
     espacio del viewBox, asi que no dependen del ancho del contenedor. */
  R.svgFirma = svg ? Array.prototype.map.call(svg.querySelectorAll('*'), n =>
    n.tagName + '{' + Array.prototype.map.call(n.attributes, a => a.name + '=' + a.value).sort().join(';') + '}'
    + (n.children.length ? '' : String(n.textContent || ''))).join(String.fromCharCode(10)) : '';
  R.esqTxt = String((EL('pop-esq-txt') || {}).textContent || '').replace(/\\s+/g, ' ').trim();
  R.conclTxt = String((EL('pop-concl-box') || {}).textContent || '').replace(/\\s+/g, ' ').trim().slice(0, 160);

  /* ── MAQUETA ── */
  const caja = k => { const e = document.querySelector('[data-pop="' + k + '"]');
    if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top) } };
  R.maqueta = { esq: caja('pop-esq'), carac: caja('pop-carac'), concl: caja('pop-concl') };
  const e1 = caja('pop-esq'), e2 = caja('pop-carac'), e3 = caja('pop-concl');
  R.ladoALado = (e1 && e2 && Math.abs(e1.y - e2.y) <= 2 && e2.x > e1.x) ? 'SI' : 'no (apilado)';
  R.conclDebajo = (e2 && e3 && e3.y > e2.y && Math.abs(e2.x - e3.x) <= 2) ? 'SI' : 'no';
  R.mitad = (e1 && e2) ? Math.round(e1.w * 100 / (e1.w + e2.w + 10)) + ' %' : 'NO';
  const wrap = document.querySelector('.pop-esq-wrap');
  R.dibujoCaja = wrap ? JSON.stringify({ w: Math.round(wrap.getBoundingClientRect().width),
                                         h: Math.round(wrap.getBoundingClientRect().height) }) : 'NO';
  R.integrarDebajo = (function () { const b = EL('pop_integrar'); if (!b || !e3) return 'NO';
    const r = b.getBoundingClientRect(); return r.top > e3.y + e3.h - 2 ? 'SI' : 'no' })();
  R.scrollX = document.documentElement.scrollWidth > document.documentElement.clientWidth ? 'SI (mal)' : 'no';
  R.orden = Array.prototype.map.call(document.querySelectorAll('#pop-seccion [data-pop]'),
    e => e.getAttribute('data-pop')).join(',');
  return R;
})()`;

const medirEn = async (b, file, W) => {
  const pg = await b.newPage({ viewport: { width: W, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONS ' + m.text()) });
  await pg.goto('file://' + file);
  await pg.waitForTimeout(1500);
  await pg.evaluate(ABRIR);
  let r;
  try { r = await pg.evaluate(MEDIR) } catch (e) { r = { FATAL: e.message } }
  await pg.close();
  return { r, errs };
};

const run = async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome' });
  for (const W of ANCHOS) {
    const a = await medirEn(b, FILE, W);
    console.log('\n===== ' + W + ' px =====');
    ['svgNodos','svgViewBox','ladoALado','conclDebajo','mitad','dibujoCaja','integrarDebajo','scrollX','orden']
      .forEach(k => console.log('  ' + k.padEnd(16) + ' ' + JSON.stringify(a.r[k])));
    console.log('  maqueta          ' + JSON.stringify(a.r.maqueta));
    console.log('  errores          ' + a.errs.length + (a.errs.length ? ' => ' + a.errs.slice(0, 3).join(' ;; ') : ''));
    if (HEAD) {
      const h = await medirEn(b, HEAD, W);
      const ig = (k) => a.r[k] === h.r[k];
      console.log('  --- contra HEAD ---');
      console.log('  nodos del SVG    HEAD ' + h.r.svgNodos + ' / NUEVO ' + a.r.svgNodos);
      console.log('  firma del SVG    ' + (ig('svgFirma') ? 'IDENTICA' : 'DISTINTA'));
      if (!ig('svgFirma')) {
        const A = String(h.r.svgFirma || '').split('\n'), B = String(a.r.svgFirma || '').split('\n');
        let i = 0; while (i < Math.max(A.length, B.length) && A[i] === B[i]) i++;
        console.log('    primera linea distinta #' + i);
        console.log('    HEAD : ' + String(A[i] || '(fin)').slice(0, 170));
        console.log('    NUEVO: ' + String(B[i] || '(fin)').slice(0, 170));
      }
      console.log('  viewBox          ' + (ig('svgViewBox') ? 'IDENTICO' : h.r.svgViewBox + ' -> ' + a.r.svgViewBox));
      console.log('  aria-label       ' + (ig('svgAria') ? 'IDENTICO' : 'DISTINTO'));
      console.log('  texto del esquema ' + (ig('esqTxt') ? 'IDENTICO' : 'DISTINTO'));
      console.log('  conclusion       ' + (ig('conclTxt') ? 'IDENTICA' : 'DISTINTA'));
      console.log('  errores HEAD     ' + h.errs.length);
    }
  }
  await b.close();
};
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1) });
