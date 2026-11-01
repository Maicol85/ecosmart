#!/usr/bin/env node
/**
 * _probe_popb_esq.mjs - el dibujo del posoperatorio: censo, textos que se superponen y derrames.
 *
 * Mide con `getBBox` TODOS los textos del SVG y cruza cada par: una superposicion es un par con
 * area de interseccion mayor que cero. Tambien censa los nodos por su marca `data-pop-esq`, el
 * grosor del anillo pericardico por TAMAÑO del derrame, y el nivel de liquido pleural.
 *
 *   node scripts/_probe_popb_esq.mjs [--file <html>]
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const ESC = {
  completa: { peri: 'Derrame leve (<10mm)', pleD: 'moderado', pleI: 'severo', lb: 'difusas',
              asist: 'bcia', timing: 'verificado', drogas: ['nor','dop'], sw: true },
  periLeve: { peri: 'Derrame leve (<10mm)', sw: true },
  periMod:  { peri: 'Derrame moderado (10-20mm)', sw: true },
  periSev:  { peri: 'Derrame severo (>20mm)', sw: true },
  pleLeve:  { pleD: 'leve', pleI: 'leve', sw: true },
  pleMod:   { pleD: 'moderado', pleI: 'moderado', sw: true },
  pleSev:   { pleD: 'severo', pleI: 'severo', sw: true },
  pleNada:  { sw: true },
  pleAus:   { pleD: 'ausente', pleI: 'ausente', sw: true },
  onceDrog: { pleD: 'severo', pleI: 'severo', lb: 'difusas', asist: 'ecmo_va', sw: true,
              drogas: ['nor','adr','dob','mil','vaso','levo','dop','ter','ntg','ntp','azul'] },
  cxNada:   { sw: true },
  cxPuente: { sw: true, chk: ['pop_cx_cabg'] },
  cxMalla:  { sw: true, chk: ['pop_cx_aorta'] },
  cxDrenD:  { sw: true, chk: ['pop_dren_pd'] },
  cxDrenI:  { sw: true, chk: ['pop_dren_pi'] },
  cxDrenM:  { sw: true, chk: ['pop_dren_med'] },
  cxTodo:   { sw: true, chk: ['pop_cx_cabg','pop_cx_aorta','pop_dren_pd','pop_dren_pi','pop_dren_med'],
              pleD: 'severo', pleI: 'moderado', lb: 'difusas', asist: 'bcia', timing: 'verificado',
              peri: 'Derrame severo (>20mm)', drogas: ['nor','dop'] },
  cxLegCabg:{ sw: true, cxTipo: 'cabg' },
  cxLegComb:{ sw: true, cxTipo: 'combinada' },
  cxValvSola:{ sw: true, chk: ['pop_cx_valv'] },
  vAoMec:   { sw: true, chk: ['pop_cx_valv','pop_cx_v_ao'], morf: { va_morf: 'Prótesis mecánica' } },
  vAoBio:   { sw: true, chk: ['pop_cx_valv','pop_cx_v_ao'], morf: { va_morf: 'Prótesis biológica' } },
  vAoSinT:  { sw: true, chk: ['pop_cx_valv','pop_cx_v_ao'] },
  vAoNativa:{ sw: true, chk: ['pop_cx_valv','pop_cx_v_ao'], morf: { va_morf: 'Calcificada' } },
  vCuatro:  { sw: true, chk: ['pop_cx_valv','pop_cx_v_ao','pop_cx_v_mi','pop_cx_v_tr','pop_cx_v_pu'],
              morf: { va_morf: 'Prótesis mecánica', vm_morf: 'Prótesis biológica',
                      vt_morf: 'Prótesis mecánica' } },
  vSinFc:   { chk: ['pop_cx_valv','pop_cx_v_ao','pop_cx_v_mi'],
              morf: { va_morf: 'Prótesis mecánica', vm_morf: 'Prótesis biológica' } },
  vFcHemo:  { chk: ['pop_cx_valv','pop_cx_v_ao'], morf: { va_morf: 'Prótesis mecánica' },
              hemoFc: '90' },
  vFcAbsurda:{ chk: ['pop_cx_valv','pop_cx_v_ao'], morf: { va_morf: 'Prótesis mecánica' },
               hemoFc: '900' }
};

const CUERPO = `(async (e) => {
  const R = { errs: [] };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const Q = String.fromCharCode(39);
  const bq = t => Array.prototype.filter.call(document.querySelectorAll('[onclick]'), x => String(x.getAttribute('onclick')).indexOf(t) >= 0)[0];
  const S = (id, v2) => { const el = EL(id); if (!el) { R.errs.push('NO EXISTE ' + id); return } el.value = v2;
    el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})) };
  const C = (id, o) => { const el = EL(id); if (!el) { R.errs.push('NO EXISTE ' + id); return } el.checked = o;
    el.dispatchEvent(new Event('change',{bubbles:true})) };
  const W = ms => new Promise(r => setTimeout(r, ms));
  const bt = bq('showTab(' + Q + 'hemodinamica'); if (bt) bt.click(); await W(250);
  const ba = bq('toggleCard(' + Q + 'pop-seccion'); if (ba) ba.click(); await W(300);
  S('peso','70'); S('talla','170');
  if (e.sw) { S('pop_monitor','swan'); await W(200);
    S('pop_sw_fc','80'); S('pop_sw_gc','4'); S('pop_sw_pam','78'); S('pop_sw_pad','50');
    S('pop_sw_pcp','16'); S('pop_sw_paps','100'); S('pop_sw_papd','50') }
  (e.chk || []).forEach(function (k) { C(k, true) });
  if (e.cxTipo) S('pop_cx_tipo', e.cxTipo);
  Object.keys(e.morf || {}).forEach(function (k) { S(k, e.morf[k]) });
  if (e.hemoFc) S('hemo_fc', e.hemoFc);
  if (e.peri) S('pericardio', e.peri);
  if (e.pleD) S('pop_pleura_der', e.pleD);
  if (e.pleI) S('pop_pleura_izq', e.pleI);
  if (e.lb) S('pop_pulmon_lineasb', e.lb);
  if (e.asist) { S('pop_asist_tipo', e.asist); await W(200); if (e.timing) S('pop-bcia-timing', e.timing) }
  (e.drogas || []).forEach(k => C('pop_' + k + '_activa', true));
  try { popSync() } catch (x) { R.errs.push('popSync:' + x.message) }
  await W(900);

  const svg = EL('pop-esq-svg');
  if (!svg) { R.sinSvg = true; return R }
  R.nHijos = svg.childNodes.length;
  R.viewBox = svg.getAttribute('viewBox');
  R.marcas = Array.prototype.map.call(svg.querySelectorAll('[data-pop-esq]'), function (n) {
    return n.getAttribute('data-pop-esq') + '/' + n.tagName + '/' + (getComputedStyle(n).display === 'none' ? 'off' : 'on');
  });
  // TEXTOS: caja y superposiciones
  const txts = [];
  Array.prototype.forEach.call(svg.querySelectorAll('text'), function (t) {
    if (getComputedStyle(t).display === 'none') return;
    const s = String(t.textContent || '').trim();
    if (!s) return;
    let b; try { b = t.getBBox() } catch (x) { return }
    if (b.width <= 0) return;
    txts.push({ t: s, x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height),
                sz: getComputedStyle(t).fontSize });
  });
  R.textos = txts;
  const sup = [];
  for (let i = 0; i < txts.length; i++) for (let j = i + 1; j < txts.length; j++) {
    const a = txts[i], b = txts[j];
    const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
    const oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
    if (ox > 0 && oy > 0) sup.push({ a: a.t, b: b.t, ox: Math.round(ox), oy: Math.round(oy) });
  }
  R.superpuestos = sup;
  R.fuera = txts.filter(function (t) { return t.x < 0 || (t.x + t.w) > 600 || t.y < 0 || (t.y + t.h) > 496 })
                .map(function (t) { return t.t + ' [' + t.x + '..' + (t.x + t.w) + ']' });
  // el recuadro «Circuito pulmonar» contra los textos
  const pbox = Array.prototype.filter.call(svg.querySelectorAll('rect'), function (r2) {
    return r2.getAttribute('x') === '10' && r2.getAttribute('y') === '292' })[0];
  if (pbox) {
    const b = pbox.getBBox();
    R.pbox = { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
    R.pboxTapa = txts.filter(function (t) {
      const ox = Math.min(t.x + t.w, b.x + b.width) - Math.max(t.x, b.x);
      const oy = Math.min(t.y + t.h, b.y + b.height) - Math.max(t.y, b.y);
      return ox > 0 && oy > 0 && t.y < b.y;
    }).map(function (t) { return t.t });
  }
  // el anillo pericardico y el nivel pleural
  const eff = Array.prototype.filter.call(svg.querySelectorAll('rect'), function (r2) {
    return r2.getAttribute('x') === '248' && r2.getAttribute('y') === '92' })[0];
  R.anilloGrosor = eff ? eff.getAttribute('stroke-width') : 'NO';
  try { R.dptClave = (typeof dptTamano === 'function') ? dptTamano().clave : 'NO FN' } catch (x) { R.dptClave = 'ERR' }
  const niv = {};
  ['pleuraD','pleuraI','nivelD','nivelI'].forEach(function (k) {
    const n = svg.querySelector('[data-pop-esq="' + k + '"]');
    if (!n) { niv[k] = 'NO EXISTE'; return }
    const off = getComputedStyle(n).display === 'none';
    let b = null; try { b = n.getBBox() } catch (x) {}
    niv[k] = (off ? 'off ' : 'on ') + (b ? Math.round(b.width) + 'x' + Math.round(b.height) + ' @y' + Math.round(b.y) : '-');
  });
  R.pleura = niv;
  R.caracTxt = (EL('pop-esq-txt') || {}).innerText || '';
  // LA FIRMA DEL DIBUJO: cada descendiente con su etiqueta y sus atributos ordenados. Es lo que
  // permite afirmar «identico a HEAD» sin mirar pixeles.
  const fir = [], firB = [];
  const NUEVOS = ['puente','malla','drenD','drenI','drenM'];
  Array.prototype.forEach.call(svg.querySelectorAll('*'), function (n) {
    const at = Array.prototype.map.call(n.attributes, function (a) { return a.name + '=' + a.value })
                .sort().join(' ');
    const linea = n.tagName + '{' + at + '}';
    fir.push(linea);
    // La firma BASE excluye las capas que POP-B-6 agrega y el patron de la malla: es lo que
    // permite afirmar «el resto del dibujo es identico» contra el arbol anterior.
    const mk = n.getAttribute && n.getAttribute('data-pop-esq');
    if (NUEVOS.indexOf(mk) >= 0) return;
    if (n.tagName === 'pattern' || (n.parentNode && n.parentNode.tagName === 'pattern')) return;
    firB.push(linea);
  });
  R.firma = fir.join(String.fromCharCode(10));
  R.firmaN = fir.length;
  let h = 0; for (let i = 0; i < R.firma.length; i++) { h = (h * 31 + R.firma.charCodeAt(i)) | 0 }
  R.firmaHash = h;
  const fb = firB.join(String.fromCharCode(10));
  let h2 = 0; for (let i = 0; i < fb.length; i++) { h2 = (h2 * 31 + fb.charCodeAt(i)) | 0 }
  R.firmaBaseHash = h2; R.firmaBaseN = firB.length;
  R.valv = {};
  ['ao','pu','mi','tr'].forEach(function (k) {
    const G = svg.querySelector('[data-pop-esq="valv-' + k + '"]');
    if (!G) { R.valv[k] = 'NO EXISTE'; return }
    const off = getComputedStyle(G).display === 'none';
    const an = G.querySelector('ellipse'), ls = G.querySelectorAll('line');
    const sop = Array.prototype.filter.call(ls, function (l) { return l.getAttribute('y1') === '-4' });
    const vel = Array.prototype.filter.call(ls, function (l) { return l.getAttribute('y1') === '0' });
    /* OJO: getBBox() sobre un grupo devuelve coordenadas LOCALES, o sea ANTES de su transform:
       las cuatro valvulas daban la MISMA caja [-11,-5,22,10] y el cruce entre ellas reportaba
       seis superposiciones que no existen. La caja que sirve es la de pantalla. */
    const b = off ? null : G.getBoundingClientRect();
    R.valv[k] = { on: !off, dash: an ? (an.getAttribute('stroke-dasharray') || '') : '-',
      fillOp: an ? an.getAttribute('fill-opacity') : '-', stroke: an ? an.getAttribute('fill') : '-',
      velos: vel.length ? getComputedStyle(vel[0]).display : '-',
      sop: sop.length ? getComputedStyle(sop[0]).display : '-',
      caja: b ? [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)] : null };
  });
  try { R.fc = popEsquema().fc } catch (x) { R.fc = 'ERR' }
  /* OJO: EL BUCLE SE APAGA CUANDO EL DIBUJO NO SE VE -lo apaga su IntersectionObserver-, y en
     una ventana de 1000 px de alto el esquema cae en y 2000. Sin traerlo a la vista el hueco se
     lee SIEMPRE en 0, que es el cuadro unico de la fase 0, y se parece a -no late-. */
  svg.scrollIntoView({ block: 'center' });
  await W(500);
  /* EL LATIDO: se muestrea el hueco entre los dos velos a lo largo de 1,6 s. Una sola lectura no
     distingue -no late- de -la lei con la valvula cerrada-. */
  const mues = {};
  ['ao','pu','mi','tr'].forEach(function (k) { mues[k] = [] });
  for (let t = 0; t < 32; t++) {
    ['ao','pu','mi','tr'].forEach(function (k) {
      const G = svg.querySelector('[data-pop-esq="valv-' + k + '"]');
      if (!G || getComputedStyle(G).display === 'none') return;
      const vel = Array.prototype.filter.call(G.querySelectorAll('line'), function (l) { return l.getAttribute('y1') === '0' });
      if (vel.length > 1) mues[k].push(Number(vel[1].getAttribute('x1')));
    });
    await new Promise(function (r) { setTimeout(r, 50) });
  }
  /* LA FASE: la aortica y la pulmonar abren en SISTOLE y la mitral y la tricuspide en DIASTOLE,
     asi que NUNCA pueden estar las dos abiertas en el mismo instante. Se cuenta sobre las
     muestras pareadas: si alguna vez coinciden, el reparto de fase esta mal. */
  if (mues.ao.length && mues.mi.length) {
    let juntas = 0, aoAb = 0, miAb = 0;
    for (let i = 0; i < Math.min(mues.ao.length, mues.mi.length); i++) {
      if (mues.ao[i] > 4) aoAb++;
      if (mues.mi[i] > 4) miAb++;
      if (mues.ao[i] > 4 && mues.mi[i] > 4) juntas++;
    }
    R.fase = { aoAbierta: aoAb, miAbierta: miAb, lasDosALaVez: juntas, n: mues.ao.length };
  }
  R.hueco = {};
  Object.keys(mues).forEach(function (k) {
    if (!mues[k].length) return;
    R.hueco[k] = { min: Math.min.apply(null, mues[k]).toFixed(1),
                   max: Math.max.apply(null, mues[k]).toFixed(1), n: mues[k].length };
  });
  // las cajas de las cuatro valvulas, cruzadas entre si
  const cjs = Object.keys(R.valv).filter(function (k) { return R.valv[k].on && R.valv[k].caja })
    .map(function (k) { return { k: k, c: R.valv[k].caja } });
  R.valvSup = [];
  for (let i = 0; i < cjs.length; i++) for (let j = i + 1; j < cjs.length; j++) {
    const a = cjs[i].c, b2 = cjs[j].c;
    const ox = Math.min(a[0]+a[2], b2[0]+b2[2]) - Math.max(a[0], b2[0]);
    const oy = Math.min(a[1]+a[3], b2[1]+b2[3]) - Math.max(a[1], b2[1]);
    if (ox > 0 && oy > 0) R.valvSup.push(cjs[i].k + ' x ' + cjs[j].k + ' ' + ox + 'x' + oy);
  }
  R.capas = {};
  ['puente','malla','drenD','drenI','drenM'].forEach(function (k) {
    const n = svg.querySelector('[data-pop-esq="' + k + '"]');
    R.capas[k] = !n ? 'NO EXISTE' : (getComputedStyle(n).display === 'none' ? 'off' : 'on');
  });
  return R;
})`;

const run = async () => {
  const b = await _pw.chromium.launch({ channel: 'chrome' });
  for (const Wd of [1440, 1000]) {
    for (const [nom, e] of Object.entries(ESC)) {
      if (Wd === 1000 && nom !== 'completa') continue;
      const pg = await b.newPage({ viewport: { width: Wd, height: 1000 } });
      await pg.goto('file://' + FILE); await pg.waitForTimeout(1400);
      let r;
      try { r = await pg.evaluate(CUERPO + '(' + JSON.stringify(e) + ')') } catch (x) { r = { fatal: x.message } }
      console.log('\n===== ' + nom + ' @ ' + Wd + ' px =====');
      console.log('hijos=' + r.nHijos + ' viewBox=' + r.viewBox + ' anilloGrosor=' + r.anilloGrosor
        + ' dptTamano=' + r.dptClave);
      console.log('pleura: ' + JSON.stringify(r.pleura));
      console.log('capas:  ' + JSON.stringify(r.capas) + ' | firma ' + r.firmaN + ' nodos, hash ' + r.firmaHash
        + ' | base ' + r.firmaBaseN + ' nodos, hash ' + r.firmaBaseHash);
      console.log('fc=' + r.fc + ' valvSup=' + JSON.stringify(r.valvSup)
        + ' hueco=' + JSON.stringify(r.hueco)
        + (r.fase ? ' fase=' + JSON.stringify(r.fase) : ''));
      ['ao','pu','mi','tr'].forEach(function (k) { const x = (r.valv || {})[k];
        if (x && x.on) console.log('  valv ' + k + ': dash="' + x.dash + '" fill=' + x.stroke
          + ' op=' + x.fillOp + ' velos=' + x.velos + ' sop=' + x.sop
          + ' caja=' + JSON.stringify(x.caja)) });
      if (process.env.POPB_CARAC === '1') console.log('--- caracteristicas ---\n' + r.caracTxt);
      console.log('SUPERPUESTOS: ' + (r.superpuestos || []).length
        + ' | FUERA DEL viewBox: ' + ((r.fuera || []).length ? JSON.stringify(r.fuera) : '0'));
      (r.superpuestos || []).forEach(s => console.log('   «' + s.a + '» x «' + s.b + '» -> ' + s.ox + ' x ' + s.oy + ' px'));
      if (r.pboxTapa && r.pboxTapa.length) console.log('el recuadro tapa: ' + JSON.stringify(r.pboxTapa));
      if (nom === 'completa') {
        console.log('--- textos (' + (r.textos || []).length + ') ---');
        (r.textos || []).forEach(t => console.log('   ' + String(t.sz).padStart(5) + '  ['
          + String(t.x).padStart(4) + ',' + String(t.y).padStart(4) + ' ' + String(t.w).padStart(4) + 'x' + String(t.h).padStart(3) + ']  ' + t.t));
        console.log('--- marcas ---\n   ' + (r.marcas || []).join('\n   '));
      }
      if (r.errs && r.errs.length) console.log('errs: ' + r.errs.join(' ; '));
      await pg.close();
    }
  }
  await b.close(); process.exit(0);
};
run().catch(e => { console.error('FATAL', e); process.exit(1) });
