#!/usr/bin/env node
/**
 * _probe_correvid_simb.mjs - INVENTARIO 2a: que simbolo dibuja el esquema del posoperatorio en
 * las TRES condiciones que el pedido enumera, con CLICK REAL en las cuatro valvulas y en los
 * dos sentidos; e INVENTARIO 3a: las apariciones VISIBLES de «2020» ligadas a la AHA/ACC en la
 * pantalla de la miocardiopatia hipertrofica.
 *
 * Denominadores declarados:
 *  - la seccion del posoperatorio ABIERTA y el esquema A LA VISTA (su IntersectionObserver apaga
 *    el bucle cuando no se ve, y entonces el latido se lee siempre en cero);
 *  - el grupo de la valvula tiene que EXISTIR en el SVG: sin eso «no hay simbolo» no distingue
 *    «el dato no llega» de «la sonda mira el nodo equivocado»;
 *  - para el 3a, la pestaña y el acordeon se abren por su BOTON REAL: con showTab programatico
 *    la tarjeta de adentro queda sin caja y todo lo que hay dentro informa 0x0.
 *
 *   node scripts/_probe_correvid_simb.mjs [--file <html>] [--solo 2a|3a]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || process.cwd() + '/index.html';
const SOLO = arg('--solo') || 'todo';

/* ── 2a ─────────────────────────────────────────────────────────────────────────────────── */
const C2A = `(async (e) => {
  const R = { errs: [] };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
                  x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const W = ms => new Promise(r => setTimeout(r, ms));
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (x) {}
  await W(250);
  /* CLICK REAL sobre el campo de morfologia de Valvulas: se elige la option y se despacha el
     mismo par de eventos que produce el gesto. */
  const elegir = (id, val) => { const el = EL(id); if (!el) { R.errs.push('NO EXISTE ' + id); return false }
    const op = Array.prototype.filter.call(el.options, o => (o.value || o.text) === val)[0];
    if (!op) { R.errs.push('NO HAY OPTION ' + val + ' en ' + id); return false }
    el.value = op.value || op.text;
    el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true})); return true };
  const bt = bq('showTab(' + Q + 'hemodinamica'); if (bt) bt.click(); await W(300);
  const sec = EL('pop-seccion');
  const abierta = () => !!(sec && sec.offsetParent && sec.getBoundingClientRect().height > 100);
  if (!abierta()) { const ba = bq('toggleCard(' + Q + 'pop-seccion'); if (ba) ba.click() }
  await W(400);
  R.denomSeccion = abierta();
  const S = (id, v) => { const el = EL(id); if (!el) { R.errs.push('NO EXISTE ' + id); return }
    el.value = v; el.dispatchEvent(new Event('input',{bubbles:true}));
    el.dispatchEvent(new Event('change',{bubbles:true})) };
  S('peso','70'); S('talla','170'); S('hemo_fc','80');
  /* (i) y (iii): el tipo se elige en VALVULAS. (ii): se elige en el selector del posoperatorio. */
  if (e.via === 'valvulas') R.puso = elegir(e.morf, e.val);
  /* La casilla de cirugia valvular y la de ESTA valvula. */
  const C = (id, o) => { const el = EL(id); if (!el) { R.errs.push('NO EXISTE ' + id); return }
    if (el.checked !== o) el.click(); };
  if (e.marcar) { C('pop_cx_valv', true); await W(200); C(e.chk, true); }
  await W(500);
  if (e.via === 'pop') { R.puso = elegir(e.sel, e.val); await W(400); }
  await W(600);
  /* El esquema A LA VISTA. */
  const cont = EL('pop-esq') || document.querySelector('[data-pop-esq-svg]');
  if (cont && cont.scrollIntoView) cont.scrollIntoView({ block: 'center' });
  await W(700);
  R.visible = (typeof _popEsq === 'object' && _popEsq) ? !!_popEsq.visible : 'no expuesto';
  /* Lo que la app DERIVA del dato, por sus dueños unicos. */
  const st = (typeof popVEstado === 'function') ? popVEstado(e.esp) : null;
  R.estado = st ? { prot: st.prot, val: st.val, nativa: st.nativa } : 'n/d';
  R.tipoCorto = (typeof popVTipoCorto === 'function' && st) ? popVTipoCorto(st.prot ? st.val : '') : 'n/d';
  R.vopDibujo = (typeof popEsquema === 'function') ? (function(){
    try { const q = popEsquema(); return q && q.vop ? q.vop[e.k] : 'sin vop' } catch (x) { return 'ERR ' + x } })() : 'n/d';
  R.valorDueno = String((EL(e.morf) || {}).value || '');
  R.valorSelPop = String((EL(e.sel) || {}).value || '');
  /* LAS PIEZAS del grupo de ESA valvula en el SVG renderizado. */
  const G = document.querySelector('[data-pop-esq="valv-' + e.k + '"]');
  if (!G) { R.sinGrupo = true; return R }
  R.grupoVisible = G.getAttribute('display') !== 'none';
  const vis = n => !!(n && n.getAttribute('display') !== 'none');
  const circ = G.querySelector('circle[r="10"]');
  const aro = Array.prototype.filter.call(G.querySelectorAll('path'),
              x => /^M-10 0A10/.test(x.getAttribute('d') || ''))[0];
  const stent = G.querySelector('rect[width="18"]');
  const clip = G.querySelector('rect[width="3.2"]');
  const ori = Array.prototype.slice.call(G.querySelectorAll('ellipse'));
  const velos = Array.prototype.filter.call(G.querySelectorAll('path'),
                x => /^M-?[78] 0/.test(x.getAttribute('d') || ''));
  R.piezas = { circulo: vis(circ), aro: vis(aro), stent: vis(stent), clip: vis(clip),
    orificios: ori.filter(vis).length, velos: velos.filter(vis).length,
    dash: circ ? (circ.getAttribute('stroke-dasharray') || '') : null };
  /* FIRMA del grupo: distingue un simbolo de otro sin depender de mi lista de piezas. */
  R.firma = Array.prototype.map.call(G.querySelectorAll('*'), n =>
    (n.getAttribute('display') === 'none' ? '' : n.tagName + ':' + (n.getAttribute('d') || n.getAttribute('r') || n.getAttribute('width') || ''))
  ).filter(Boolean).join('|');
  R.textoValv = (function(){ const t = String((EL('pop-esq-txt') || {}).textContent || '');
    const i = t.toLowerCase().indexOf('válvulas operadas');
    return i < 0 ? '(sin fila)' : t.slice(i, i + 140) })();
  return R;
})`;

/* ── 3a ─────────────────────────────────────────────────────────────────────────────────── */
const C3A = `(async () => {
  const R = { errs: [], hallazgos: [] };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const Q = String.fromCharCode(39);
  const W = ms => new Promise(r => setTimeout(r, ms));
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
                  x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
  try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (x) {}
  await W(250);
  /* La pestaña y el acordeon de la MCH, por su BOTON REAL. */
  const b1 = bq('showTab(' + Q + 'congenitas'); if (b1) b1.click(); await W(350);
  const b2 = Array.prototype.filter.call(document.querySelectorAll('[onclick]'),
             x => /mch/i.test(String(x.getAttribute('onclick'))) && /sec|toggle|card/i.test(String(x.getAttribute('onclick'))))[0];
  if (b2) b2.click(); await W(450);
  const zona = EL('sacc-cc-mch') || EL('mch-seccion') || EL('cc-mch');
  R.denomZona = zona ? { id: zona.id, w: Math.round(zona.getBoundingClientRect().width),
                         h: Math.round(zona.getBoundingClientRect().height) } : 'NO SE ENCONTRO';
  /* Barrido de TODO nodo de texto visible que contenga «2020» junto a AHA o ACC. */
  const raiz = zona || document.body;
  const vistos = new Set();
  const walk = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, null);
  let n;
  while ((n = walk.nextNode())) {
    const t = String(n.nodeValue || '');
    if (!/20(20|24)/.test(t)) continue;
    if (!/AHA|ACC/.test(t)) continue;
    const p = n.parentElement; if (!p) continue;
    const r = p.getBoundingClientRect();
    const key = t.trim().slice(0, 60);
    if (vistos.has(key)) continue; vistos.add(key);
    R.hallazgos.push({ texto: t.trim().slice(0, 150), tag: p.tagName,
      cls: String(p.className || '').slice(0, 40), id: p.id || '',
      visible: !!(p.offsetParent || r.width > 0), w: Math.round(r.width), h: Math.round(r.height) });
  }
  /* La FILA del conteo, por su id. */
  const fila = EL('mch-aha');
  R.filaConteo = fila ? { val: fila.textContent,
    rotulo: (function(){ const row = fila.closest('.calc-row'); if (!row) return 'sin .calc-row';
      const l = row.querySelector('.calc-lbl'); return l ? l.textContent.trim() : 'sin .calc-lbl' })(),
    visible: !!fila.offsetParent } : 'NO EXISTE #mch-aha';
  /* La TARJETA de criterios, que es otra superficie. */
  R.tarjeta = (function(){
    try { if (typeof critMCH !== 'function') return 'critMCH no expuesta';
      const h = critMCH(); const d = document.createElement('div'); d.innerHTML = h;
      const t = d.textContent;
      return { n2020: (t.split('AHA/ACC 2020').length - 1), n2024: (t.split('AHA/ACC 2024').length - 1),
               car: t.length } } catch (x) { return 'ERR ' + x } })();
  return R;
})`;

const ESC2A = {
  /* (i) tipo en Valvulas Y valvula operada MARCADA */
  i_mi_teer:  { via:'valvulas', morf:'vm_morf', val:'TEER mitral',               esp:'pop-esp-vmi', sel:'pop-esp-vmi', k:'mi', chk:'pop_cx_v_mi', marcar:true },
  i_mi_plas:  { via:'valvulas', morf:'vm_morf', val:'Plastia mitral',            esp:'pop-esp-vmi', sel:'pop-esp-vmi', k:'mi', chk:'pop_cx_v_mi', marcar:true },
  i_tr_teer:  { via:'valvulas', morf:'vt_morf', val:'TEER tricuspídeo (T-TEER)', esp:'pop-esp-vtr', sel:'pop-esp-vtr', k:'tr', chk:'pop_cx_v_tr', marcar:true },
  i_tr_plas:  { via:'valvulas', morf:'vt_morf', val:'Plastia tricuspídea',       esp:'pop-esp-vtr', sel:'pop-esp-vtr', k:'tr', chk:'pop_cx_v_tr', marcar:true },
  i_ao_tavi:  { via:'valvulas', morf:'va_morf', val:'TAVI',                      esp:'pop-esp-vao', sel:'pop-esp-vao', k:'ao', chk:'pop_cx_v_ao', marcar:true },
  i_mi_mec:   { via:'valvulas', morf:'vm_morf', val:'Prótesis mecánica',         esp:'pop-esp-vmi', sel:'pop-esp-vmi', k:'mi', chk:'pop_cx_v_mi', marcar:true },
  /* (ii) tipo elegido en el SELECTOR DEL POSOPERATORIO */
  ii_mi_teer: { via:'pop', morf:'vm_morf', val:'TEER mitral',                    esp:'pop-esp-vmi', sel:'pop-esp-vmi', k:'mi', chk:'pop_cx_v_mi', marcar:true },
  ii_tr_plas: { via:'pop', morf:'vt_morf', val:'Plastia tricuspídea',            esp:'pop-esp-vtr', sel:'pop-esp-vtr', k:'tr', chk:'pop_cx_v_tr', marcar:true },
  /* (iii) tipo en Valvulas y valvula operada SIN marcar */
  iii_mi_teer:{ via:'valvulas', morf:'vm_morf', val:'TEER mitral',               esp:'pop-esp-vmi', sel:'pop-esp-vmi', k:'mi', chk:'pop_cx_v_mi', marcar:false },
  iii_tr_plas:{ via:'valvulas', morf:'vt_morf', val:'Plastia tricuspídea',       esp:'pop-esp-vtr', sel:'pop-esp-vtr', k:'tr', chk:'pop_cx_v_tr', marcar:false },
  /* control negativo: morfologia NATIVA con la valvula marcada */
  cn_mi_nat:  { via:'valvulas', morf:'vm_morf', val:'Mixomatosa / Barlow',       esp:'pop-esp-vmi', sel:'pop-esp-vmi', k:'mi', chk:'pop_cx_v_mi', marcar:true }
};

(async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome', headless: true });
  const pg = await b.newPage({ viewport: { width: 1440, height: 1100 } });
  const errs = [];
  pg.on('pageerror', x => errs.push('PAGE ' + x.message));
  await pg.goto('file://' + FILE);
  await pg.waitForTimeout(2500);
  console.log('archivo:', FILE);
  if (SOLO === 'todo' || SOLO === '2a') {
    console.log('\n===== INVENTARIO 2a - LOS SIMBOLOS DEL DIBUJO DEL POSOPERATORIO =====');
    for (const k of Object.keys(ESC2A)) {
      let R;
      try { R = await Promise.race([ pg.evaluate(new Function('return ' + C2A)(), ESC2A[k]),
        new Promise((_, rj) => setTimeout(() => rj(new Error('TIMEOUT')), 60000)) ]) }
      catch (x) { console.log('\n== ' + k + ' == FALLO: ' + x.message); continue }
      const P = R.piezas || {};
      console.log('\n== ' + k + ' ==  seccion=' + R.denomSeccion + ' puso=' + R.puso + ' bucle=' + R.visible);
      console.log('   dueno(Valvulas)=' + JSON.stringify(R.valorDueno) + '  selector(pop)=' + JSON.stringify(R.valorSelPop));
      console.log('   popVEstado=' + JSON.stringify(R.estado) + '  popVTipoCorto=' + JSON.stringify(R.tipoCorto));
      console.log('   lo que llega al DIBUJO (vop): ' + JSON.stringify(R.vopDibujo));
      if (R.sinGrupo) { console.log('   SIN GRUPO en el SVG'); continue }
      console.log('   grupo visible=' + R.grupoVisible + '  piezas: circulo=' + P.circulo + ' aro=' + P.aro
        + ' stent=' + P.stent + ' clip=' + P.clip + ' orificios=' + P.orificios + ' velos=' + P.velos
        + ' dash=' + JSON.stringify(P.dash));
      console.log('   firma(' + String(R.firma || '').length + ' car): ' + String(R.firma || '').slice(0, 150));
      console.log('   texto: ' + R.textoValv);
      if (R.errs && R.errs.length) console.log('   errs: ' + R.errs.slice(0,3).join(' ; '));
    }
  }
  if (SOLO === 'todo' || SOLO === '3a') {
    console.log('\n===== INVENTARIO 3a - «2020» LIGADO A LA AHA/ACC EN LA PANTALLA DE MCH =====');
    let R;
    try { R = await pg.evaluate(new Function('return ' + C3A)()) }
    catch (x) { console.log('FALLO: ' + x.message); R = null }
    if (R) {
      console.log('denominador de la zona: ' + JSON.stringify(R.denomZona));
      console.log('fila del conteo: ' + JSON.stringify(R.filaConteo));
      console.log('tarjeta de criterios (critMCH): ' + JSON.stringify(R.tarjeta));
      console.log('hallazgos en la zona (' + R.hallazgos.length + '):');
      R.hallazgos.forEach(h => console.log('   [' + (h.visible ? 'VISIBLE' : 'oculto') + ' ' + h.w + 'x' + h.h
        + ' <' + h.tag + '> ' + (h.id || h.cls) + '] ' + h.texto));
    }
  }
  console.log('\nerrores de pagina: ' + (errs.length ? errs.join(' | ') : 'ninguno'));
  await b.close();
  process.exit(0);
})();
