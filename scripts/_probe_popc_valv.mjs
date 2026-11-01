#!/usr/bin/env node
/**
 * _probe_popc_valv.mjs - INVENTARIO 1a de POP-C: el selector del tipo de valvula operada.
 *
 * Mide, con gestos reales y en Chrome del sistema, las CUATRO valvulas en los DOS sentidos:
 *   A) cambiar la morfologia en Valvulas  -> mirar el selector del posoperatorio
 *   B) cambiar el selector del posoperatorio -> mirar Valvulas
 * con el acordeon del posoperatorio ABIERTO y CERRADO, y declara que dato lee cada superficie
 * (el selector, el dibujo, el informe, el EN SUMA y el PDF).
 *
 *   node scripts/_probe_popc_valv.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

/* Las cuatro, con su dueno en Valvulas, su casilla y su selector del posoperatorio. */
const V = [
  { n: 'aortica',    sel: 'pop-esp-vao', due: 'va_morf', chk: 'pop_cx_v_ao' },
  { n: 'mitral',     sel: 'pop-esp-vmi', due: 'vm_morf', chk: 'pop_cx_v_mi' },
  { n: 'tricuspide', sel: 'pop-esp-vtr', due: 'vt_morf', chk: 'pop_cx_v_tr' },
  { n: 'pulmonar',   sel: 'pop-esp-vpu', due: 'vp_morf', chk: 'pop_cx_v_pu' }
];

const CUERPO = `(async (V) => {
  const R = { errs: [], filas: [], lect: {}, meta: {} };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
                  x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const W = ms => new Promise(r => setTimeout(r, ms));
  const S = (id, v2) => { const el = EL(id); if (!el) { R.errs.push('NO EXISTE ' + id); return }
    el.value = v2; el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true})) };
  const C = (id, o) => { const el = EL(id); if (!el) { R.errs.push('NO EXISTE ' + id); return }
    el.checked = o; el.dispatchEvent(new Event('change',{bubbles:true})) };
  const val = id => { const e = EL(id); return e ? String(e.value) : 'NO EXISTE' };

  /* ── montaje: datos minimos para que el posoperatorio concluya y el papel salga ── */
  const abrirPop = async () => {
    const bt = bq('showTab(' + Q + 'hemodinamica'); if (bt) bt.click(); await W(250);
    const ba = bq('toggleCard(' + Q + 'pop-seccion'); if (ba) ba.click(); await W(300);
  };
  await abrirPop();
  S('peso','70'); S('talla','170');
  S('pop_monitor','swan'); await W(200);
  S('pop_sw_fc','80'); S('pop_sw_gc','4'); S('pop_sw_pam','78'); S('pop_sw_pad','50');
  C('pop_cx_valv', true);
  V.forEach(v => C(v.chk, true));
  await W(600);
  R.meta.popAbierto = !!(EL('pop-seccion') && EL('pop-seccion').offsetParent);
  R.meta.opcionesPorSelector = V.map(v => { const e = EL(v.sel);
    return v.n + '=' + (e ? e.options.length : 'NO EXISTE') });

  /* ── SENTIDO A: cambiar en Valvulas, mirar el selector del posoperatorio ── */
  for (const v of V) {
    for (const paso of [
        { q: 'Prótesis mecánica',  d: 'pone mecanica en Valvulas' },
        { q: 'Prótesis biológica', d: 'cambia a biologica en Valvulas' },
        { q: '',                   d: 'la SACA en Valvulas (primera opcion)' }]) {
      const d = EL(v.due); if (!d) { R.errs.push('sin dueno ' + v.due); continue }
      let destino = paso.q;
      if (destino === '') destino = d.options[0].value || d.options[0].text;
      S(v.due, destino);
      await W(500);               /* mas que el debounce de 220 ms */
      R.filas.push({ sent: 'A', valv: v.n, gesto: paso.d, dueno: val(v.due),
                     selector: val(v.sel), ok: val(v.sel) === (paso.q === '' ? '' : destino) });
    }
  }

  /* ── SENTIDO B: cambiar el selector del posoperatorio, mirar Valvulas ── */
  for (const v of V) {
    const e = EL(v.sel); if (!e) continue;
    for (const q of ['Prótesis biológica', 'Prótesis mecánica']) {
      const tiene = Array.prototype.some.call(e.options, o => o.value === q);
      if (!tiene) { R.filas.push({ sent:'B', valv:v.n, gesto:'elige ' + q,
                                   dueno:'(sin esa opcion)', selector:val(v.sel), ok:null }); continue }
      S(v.sel, q);
      if (typeof popCxVGesto === 'function') popCxVGesto(v.sel);
      await W(500);
      R.filas.push({ sent: 'B', valv: v.n, gesto: 'elige ' + q, dueno: val(v.due),
                     selector: val(v.sel), ok: val(v.due) === q });
    }
  }

  /* ── QUE LEE CADA SUPERFICIE: se deja Valvulas en biologica y se mira todo ── */
  V.forEach(v => S(v.due, 'Prótesis biológica'));
  await W(600);
  R.lect.tras_biologica = {
    dueno:    V.map(v => v.n + '=' + val(v.due)).join(' | '),
    selector: V.map(v => v.n + '=' + val(v.sel)).join(' | '),
    popCxValvTxt: (typeof popCxValvTxt === 'function') ? popCxValvTxt() : 'NO EXISTE',
    popVEstado:   V.map(v => { const s = (typeof popVEstado === 'function') ? popVEstado(v.sel) : null;
                   return v.n + '=' + (s ? (s.prot ? s.val : ('NATIVA:' + s.nativa)) : 'null') }).join(' | ')
  };
  /* Ahora se SACA en Valvulas y se vuelve a mirar: este es el caso del medico. */
  V.forEach(v => { const d = EL(v.due); if (d) S(v.due, d.options[0].value || d.options[0].text) });
  await W(600);
  R.lect.tras_sacarla = {
    dueno:    V.map(v => v.n + '=' + val(v.due)).join(' | '),
    selector: V.map(v => v.n + '=' + val(v.sel)).join(' | '),
    popCxValvTxt: (typeof popCxValvTxt === 'function') ? popCxValvTxt() : 'NO EXISTE',
    popVEstado:   V.map(v => { const s = (typeof popVEstado === 'function') ? popVEstado(v.sel) : null;
                   return v.n + '=' + (s ? (s.prot ? s.val : ('NATIVA:' + s.nativa)) : 'null') }).join(' | ')
  };
  /* El dibujo: el texto del esquema, que es lo que el medico ve moverse. */
  const esq = EL('pop-esq-txt') || EL('pop_esq_txt');
  R.lect.dibujoTxt = esq ? String(esq.textContent).slice(0, 300) : 'NO HAY NODO';
  const svg = document.querySelector('#pop-esq svg') || document.querySelector('[id*=pop-esq] svg');
  R.lect.dibujoValvNodos = svg
    ? Array.prototype.map.call(svg.querySelectorAll('[data-pop-esq*=valv],[data-pop-v]'),
        n => n.getAttribute('data-pop-esq') || n.getAttribute('data-pop-v')).join(',')
    : 'SIN SVG';

  /* ── el acordeon CERRADO: se cierra y se repite el sentido A una vez ── */
  const ba2 = bq('toggleCard(' + Q + 'pop-seccion'); if (ba2) ba2.click(); await W(300);
  R.meta.popCerrado = !(EL('pop-seccion') && EL('pop-seccion').offsetParent);
  S('va_morf', 'Prótesis mecánica'); await W(600);
  R.filas.push({ sent: 'A-cerrado', valv: 'aortica', gesto: 'mecanica con el acordeon CERRADO',
                 dueno: val('va_morf'), selector: val('pop-esp-vao'),
                 ok: val('pop-esp-vao') === 'Prótesis mecánica' });
  if (ba2) { const b3 = bq('toggleCard(' + Q + 'pop-seccion'); if (b3) b3.click(); await W(400) }
  R.filas.push({ sent: 'A-reabierto', valv: 'aortica', gesto: 'se reabre el acordeon',
                 dueno: val('va_morf'), selector: val('pop-esp-vao'),
                 ok: val('pop-esp-vao') === 'Prótesis mecánica' });

  /* ── el PAPEL: informe y EN SUMA con la aortica mecanica ── */
  C('pop_integrar', true);
  try { if (typeof popIntegrar === 'function') popIntegrar() } catch (err) {}
  const bi = bq('popIntegrar'); if (bi && !bi.disabled) bi.click();
  await W(700);
  try { if (typeof generarInforme === 'function') generarInforme() } catch (err) { R.errs.push('informe: ' + err.message) }
  await W(900);
  const it = EL('informe_texto'); const ies = EL('informe_ensuma') || EL('en_suma');
  const txt = it ? String(it.value || it.textContent || '') : '';
  R.lect.papel = {
    largo: txt.length,
    menciona_mecanica: (txt.match(/mecánica/gi) || []).length,
    menciona_sintipo: (txt.match(/sin tipo consignado/gi) || []).length,
    frag: (() => { const i = txt.toLowerCase().indexOf('aórtica'); return i < 0 ? '' : txt.slice(Math.max(0,i-90), i+140) })()
  };
  return R;
})`;

const esc = s => String(s == null ? '' : s);

(async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome', headless: true });
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message));
  pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text()) });
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(2500);
  let R;
  try {
    R = await Promise.race([
      pg.evaluate(new Function('return ' + CUERPO)(), V),
      new Promise((_, rj) => setTimeout(() => rj(new Error('TIMEOUT 120s')), 120000))
    ]);
  } catch (e) { console.log('FALLO:', e.message); await b.close(); process.exit(1) }

  console.log('===== INVENTARIO 1a - EL SELECTOR DEL TIPO DE VALVULA =====');
  console.log('archivo:', FILE);
  console.log('meta:', JSON.stringify(R.meta, null, 1));
  console.log('');
  console.log('sentido | valvula    | gesto                                 | dueno(Valvulas)     | selector(POP)       | sigue');
  console.log('--------|------------|---------------------------------------|---------------------|---------------------|------');
  for (const f of R.filas) {
    console.log([esc(f.sent).padEnd(11), esc(f.valv).padEnd(10), esc(f.gesto).padEnd(37),
                 esc(f.dueno).padEnd(19), esc(f.selector).padEnd(19),
                 f.ok === null ? 'n/a' : (f.ok ? 'SI' : '** NO **')].join(' | '));
  }
  console.log('');
  console.log('===== QUE LEE CADA SUPERFICIE =====');
  console.log(JSON.stringify(R.lect, null, 1));
  if (R.errs.length) console.log('\nERRS SONDA:', R.errs.join(' ; '));
  if (errs.length) console.log('\nERRORES DE PAGINA:', errs.slice(0, 8).join(' ; '));
  else console.log('\nerrores de pagina: 0');
  await b.close();
  process.exit(0);
})();
