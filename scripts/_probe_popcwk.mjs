#!/usr/bin/env node
/**
 * _probe_popcwk.mjs - Chrome y WebKit sobre lo que la tanda POP-C toca.
 *
 * Dos motores x 1440, 1000, 768 y 390 px x dos temas = dieciseis cruces por motor. Mide lo que
 * cada commit cambio, y SIEMPRE: errores de consola y de pagina, desplazamiento horizontal del
 * cuerpo y textos recortados.
 *
 * ⚠️ WEBKIT DE PLAYWRIGHT NO ES SAFARI, y se declara. Chrome va por el del sistema con
 *    channel chrome: sin eso la sonda devuelve los cruces VACIOS.
 *
 *   node scripts/_probe_popcwk.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const CUERPO = `(async (tema) => {
  const R = { errs: [] };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  if (tema) document.documentElement.setAttribute('data-theme', tema);
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
                  x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const W = ms => new Promise(r => setTimeout(r, ms));
  const S = (id, v) => { const e = EL(id); if (!e) { R.errs.push('NO EXISTE ' + id); return }
    e.value = v; e.dispatchEvent(new Event('input',{bubbles:true}));
    e.dispatchEvent(new Event('change',{bubbles:true})) };
  const C = (id, o) => { const e = EL(id); if (!e) return; e.checked = o;
    e.dispatchEvent(new Event('change',{bubbles:true})) };

  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
  const bt = bq('showTab(' + Q + 'hemodinamica'); if (bt) bt.click(); await W(350);
  const sec = EL('pop-seccion');
  const abierta = () => !!(sec && sec.offsetParent && sec.getBoundingClientRect().height > 100);
  if (!abierta()) { const ba = bq('toggleCard(' + Q + 'pop-seccion'); if (ba) ba.click(); }
  await W(450);
  R.denomAbierta = abierta();

  /* Una escena que toca TODO lo de esta tanda. */
  S('peso','70'); S('talla','170'); S('hemo_fc','80'); S('edad','40'); S('sexo','M');
  S('pop_monitor','swan'); await W(250);
  S('pop_sw_gc','4'); S('pop_sw_pam','78'); S('pop_sw_pad','10'); S('pop_sw_pcp','14');
  S('pop_cx_horas','6'); S('pop_cx_tipo','cabg');
  C('pop_cx_valv', true); C('pop_cx_v_ao', true); C('pop_cx_v_mi', true);
  S('va_morf','Prótesis mecánica'); S('vm_morf','Prótesis biológica');
  S('im_grado','4'); S('it_grado','2');
  S('tapse','12'); S('vd_vi','1.2'); S('fevi','30');
  S('pericardio','Derrame moderado (10-20mm)');
  S('onda_e','90'); S('onda_a','60');
  S('ao_sin','38'); S('marfan_sindrome','marfan');
  await W(900);
  const sv = EL('pop-esq-svg'); if (sv) sv.scrollIntoView({ block:'center' });
  await W(800);

  /* ── 1 · el selector de valvulas sigue al dueno ── */
  R.sel = ['pop-esp-vao','pop-esp-vmi'].map(i => String((EL(i)||{}).value || '-')).join('|');

  /* ── 3 · la conclusion: los dos rotulos, y sin «Precarga adecuada» ── */
  try { if (typeof popConclSync === 'function') popConclSync() } catch (e) {}
  await W(350);
  { const cj = EL('pop-concl-box');
    const t = cj ? String(cj.textContent || '').replace(/\\s+/g,' ') : '';
    R.concl = { largo: t.length,
      criterio: /Criterio de EcoSmart/.test(t),
      rotuloVD: /cortes de la c.psula de TEP/.test(t),
      sinAdecuada: !/Precarga adecuada/.test(t),
      capilar: /Presi.n capilar pulmonar/.test(t) }; }

  /* ── 4 · el boton de integrar, y los tres avisos ── */
  { const b = EL('pop_integrar');
    R.btn = b ? { hab: !b.disabled, title: String(b.title||'').slice(0,40) } : null; }
  { const host = document.createElement('div'); document.body.appendChild(host);
    const w = document.createElement('div'); w.className = 'am-wrap desfasado';
    const d = document.createElement('div'); d.className = 'am-stale'; d.textContent = 'x';
    w.appendChild(d); host.appendChild(w);
    const cs = getComputedStyle(d);
    R.aviso = { color: String(cs.color), fondo: String(cs.backgroundColor) };
    host.innerHTML = '';
    const b2 = document.createElement('button'); b2.className = 'btn btn-integrar revisar';
    host.appendChild(b2);
    R.aviso.anillo = String(getComputedStyle(b2).boxShadow).slice(0, 40);
    host.remove(); }

  /* ── 5 a 9 · el dibujo ── */
  { const m = k => { const n = sv ? sv.querySelector('[data-pop-esq="' + k + '"]') : null;
      return n ? !!n.getClientRects().length : 'NO EXISTE' };
    R.dib = { valvAo: m('valv-ao'), valvMi: m('valv-mi'), catSwan: m('cat-swan'),
              catPicco: m('cat-picco'), trzTap: m('trz-tapse'), trzEA: m('trz-ea') };
    /* los chorros son pulsatiles: se muestrea */
    const j = { im:0, it:0 };
    for (let i = 0; i < 25; i++) {
      ['im','it'].forEach(k => { const n = sv ? sv.querySelector('[data-pop-esq="jet-' + k + '"]') : null;
        if (n && n.getClientRects().length) j[k]++; });
      await W(40);
    }
    R.dib.jetIm = j.im + '/25'; R.dib.jetIt = j.it + '/25';
    /* superposiciones de texto del SVG y elementos fuera del lienzo */
    const ts = sv ? Array.prototype.filter.call(sv.querySelectorAll('text'),
      t => t.getClientRects().length && String(t.textContent||'').trim()) : [];
    R.dib.nTextos = ts.length;
    const rc = ts.map(t => t.getBoundingClientRect());
    let sup = 0;
    for (let i = 0; i < rc.length; i++) for (let k = i+1; k < rc.length; k++) {
      const ix = Math.max(0, Math.min(rc[i].right, rc[k].right) - Math.max(rc[i].left, rc[k].left));
      const iy = Math.max(0, Math.min(rc[i].bottom, rc[k].bottom) - Math.max(rc[i].top, rc[k].top));
      if (ix > 0.5 && iy > 0.5) sup++;
    }
    R.dib.supTexto = sup; }

  /* ── 2 · el Z de la raiz ── */
  { const bca = bq('showTab(' + Q + 'congenitas'); if (bca) bca.click(); await W(300);
    const bc2 = bq('showTab(' + Q + 'congenitas2'); if (bc2) bc2.click(); await W(300);
    const bm = bq('toggleCard(' + Q + 'marfan'); if (bm) bm.click(); await W(450);
    const v = EL('mfs-zcalc-val'), b3 = EL('mfs-zcalc-btn'), n3 = EL('mfs-zcalc-nota');
    const rb = b3 ? b3.getBoundingClientRect() : null;
    R.z = { valor: v ? String(v.textContent||'').slice(0,24) : 'NO EXISTE',
            boton: rb ? Math.round(rb.width) + 'x' + Math.round(rb.height) : 'oculto',
            nota: n3 ? String(n3.textContent||'').length : 0,
            notaDuBois: n3 ? /DuBois/.test(String(n3.textContent||'')) : false }; }

  /* ── SIEMPRE: scroll horizontal y textos recortados ── */
  R.scrollH = document.documentElement.scrollWidth > document.documentElement.clientWidth + 1;
  let cort = 0;
  document.querySelectorAll('label,span,button,div,td,th,option').forEach(e => {
    if (!e.getClientRects().length) return;
    if (e.children.length) return;
    if (e.scrollWidth > e.clientWidth + 2 && e.clientWidth > 0) {
      const cs = getComputedStyle(e);
      if (cs.overflow === 'hidden' || cs.textOverflow === 'ellipsis' || cs.whiteSpace === 'nowrap') cort++;
    }
  });
  R.recortados = cort;
  return R;
})`;

const ANCHOS = [1440, 1000, 768, 390];
const TEMAS = ['dark', 'light'];

(async () => {
  const out = [];
  for (const motor of ['chromium', 'webkit']) {
    const opts = motor === 'chromium' ? { channel: 'chrome', headless: true } : { headless: true };
    let b;
    try { b = await _pw[motor].launch(opts); }
    catch (e) { console.log('NO SE PUDO ABRIR ' + motor + ': ' + String(e.message).slice(0,80)); continue }
    for (const w of ANCHOS) for (const t of TEMAS) {
      const pg = await b.newPage({ viewport: { width: w, height: 1000 } });
      const errs = [];
      pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 70)));
      pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 70)) });
      await pg.goto('file://' + FILE);
      await pg.waitForTimeout(2600);
      let R;
      try {
        R = await Promise.race([ pg.evaluate(new Function('return ' + CUERPO)(), t),
          new Promise((_, rj) => setTimeout(() => rj(new Error('TIMEOUT')), 90000)) ]);
      } catch (e) { R = { fallo: String(e.message).slice(0, 60) } }
      R._motor = motor; R._w = w; R._t = t; R._err = errs.length;
      R._errTxt = errs.slice(0, 2).join(' ; ');
      out.push(R);
      await pg.close();
    }
    await b.close();
  }
  console.log('===== CHROME Y WEBKIT — TANDA POP-C =====');
  console.log('archivo:', FILE);
  console.log('⚠️ WebKit de Playwright NO es Safari, y se declara. Chrome va por el del sistema.');
  console.log('');
  const cab = ['motor', 'px', 'tema', 'abierta', 'selector', 'concl', 'btn', 'aviso', 'dibujo', 'Z', 'scrollH', 'recort', 'errs'];
  console.log(cab.join(' | '));
  for (const R of out) {
    if (R.fallo) { console.log([R._motor, R._w, R._t, 'FALLO: ' + R.fallo].join(' | ')); continue }
    console.log([
      R._motor.padEnd(8), String(R._w).padEnd(4), R._t.padEnd(5),
      String(R.denomAbierta).padEnd(5),
      String(R.sel).slice(0, 36).padEnd(36),
      (R.concl.criterio ? 'C' : '-') + (R.concl.rotuloVD ? 'V' : '-') +
        (R.concl.sinAdecuada ? 'A' : '-') + (R.concl.capilar ? 'P' : '-'),
      R.btn ? (R.btn.hab ? 'hab' : 'DES') : '-',
      (/245, 158, 66/.test(R.aviso.color) ? 'c' : '-') + (/245, 158, 66/.test(R.aviso.fondo) ? 'f' : '-') +
        (/245, 158, 66/.test(R.aviso.anillo) ? 'a' : '-'),
      'v' + (R.dib.valvAo ? 1 : 0) + (R.dib.valvMi ? 1 : 0) + ' s' + (R.dib.catSwan ? 1 : 0) +
        (R.dib.catPicco ? 1 : 0) + ' t' + (R.dib.trzTap ? 1 : 0) + (R.dib.trzEA ? 1 : 0) +
        ' j' + R.dib.jetIm.split('/')[0] + '/' + R.dib.jetIt.split('/')[0] + ' sup' + R.dib.supTexto,
      String(R.z.valor).slice(0, 10).padEnd(10) + ' ' + R.z.boton + (R.z.notaDuBois ? ' DuB' : ' ---'),
      R.scrollH ? '** SI **' : 'no',
      String(R.recortados).padStart(3),
      String(R._err) + (R._err ? ' -> ' + R._errTxt : '')
    ].join(' | '));
  }
  const err = out.reduce((a, r) => a + (r._err || 0), 0);
  const sh = out.filter(r => r.scrollH).length;
  const sup = out.reduce((a, r) => a + ((r.dib && r.dib.supTexto) || 0), 0);
  console.log('');
  console.log('TOTAL: ' + out.length + ' cruces · errores de pagina y consola: ' + err
    + ' · con scroll horizontal: ' + sh + ' · superposiciones de texto del SVG: ' + sup);
  console.log('leyenda concl: C=«Criterio de EcoSmart» V=rotulo del VD A=sin «Precarga adecuada» P=«Presion capilar»');
  console.log('leyenda aviso: c=color f=fondo a=anillo   ·   dibujo: v=valvulas s=cateteres t=trazados j=chorros/25');
  process.exit(0);
})();
