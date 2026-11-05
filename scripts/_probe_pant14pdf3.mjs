#!/usr/bin/env node
/**
 * _probe_pant14pdf3.mjs - el A/B del PDF de los cuatro estudios (PANT-14, commit 7).
 * Para cada estudio: genera el PDF de verdad SIN tocar el boton -que es el estado de HEAD- y
 * despues CON el boton encendido, y publica los dos. Corriendolo con --file sobre HEAD y sobre
 * el arbol nuevo se compara el papel apagado, que tiene que ser IDENTICO.
 *   node scripts/_probe_pant14pdf3.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const CASOS = [
  { n:'fallot', sub:'congenitas2', campos:[['tdf_func_vd','normal'],['ip_grado','Severa'],['tdf_civ_residual','si'],['tdf_ep_stent','si']] },
  { n:'coaEa',  sub:'congenitas',  campos:[['coa_istmo','8'],['coa_situacion','nativa'],['esub_tipo','membrana']] },
  { n:'dsav',   sub:'congenitas2', campos:[['dsav_tipo','completo'],['dsav_regurg_av_izq','severa']] },
  { n:'fontan', sub:'congenitas2', campos:[['fontan_tipo','extra'],['fontan_fenestracion','presente']] },
];
const br = await _pw.chromium.launch({ channel: 'chrome' });
const out = {};
for (const caso of CASOS) {
  const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 120)));
  pg.on('dialog', d => { try { d.accept() } catch (e) {} });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(1700);
  out[caso.n] = await pg.evaluate(`(async () => {
    const R = {}; const EL = id => document.getElementById(id);
    const esperar = ms => new Promise(z => setTimeout(z, ms));
    const Q = String.fromCharCode(39);
    ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
    const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
      b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
    const gesto = (id, v) => { const e = EL(id); if (!e) return 'NO ' + id;
      if (e.type === 'checkbox') { e.checked = (v === 'si') } else { e.value = v }
      e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })); return 'ok' };
    const pdf = async () => {
      if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) return { ERR: 'NO HAY jsPDF' };
      const Orig = window.jspdf.jsPDF; const reg = { txt: [], figs: 0, imgs: [] };
      window.jspdf.jsPDF = function () { const d = new Orig(...arguments);
        const ot = d.text.bind(d); d.text = function (t) { reg.txt.push(String(t)); return ot.apply(null, arguments) };
        const oi = d.addImage ? d.addImage.bind(d) : null;
        if (oi) d.addImage = function (dd, f, x, y, w, h) { reg.imgs.push(Math.round(w) + 'x' + Math.round(h)); reg.figs++; return oi.apply(null, arguments) };
        ['circle','line','rect','triangle'].forEach(m => { if (typeof d[m] === 'function') { const o = d[m].bind(d); d[m] = function () { reg.figs++; return o.apply(null, arguments) } } });
        d.save = function () { return true }; d.output = function () { return '' }; return d };
      Object.keys(Orig).forEach(k => { try { window.jspdf.jsPDF[k] = Orig[k] } catch (e) {} });
      try { const b = EL('hdr-pdf-quick'); if (b) b.click() } catch (e) {}
      await esperar(700);
      try { const cf = EL('rev-confirm'); if (cf) cf.click() } catch (e) {}
      await esperar(5200);
      window.jspdf.jsPDF = Orig;
      const todo = reg.txt.join(' | ');
      return { nTxt: reg.txt.length, chars: todo.length, figs: reg.figs, nImg: reg.imgs.length,
               medidas: reg.imgs.join(' '), etiqueta: todo.indexOf('Corazón en 3D de congénitas') >= 0,
               texto: todo };
    };
    const CASO = ${JSON.stringify(caso)};
    const nm = EL('nombre'); if (nm) { nm.value = 'A B PANT14'; nm.dispatchEvent(new Event('input', { bubbles: true })) }
    const ci = EL('ci'); if (ci) { ci.value = '1112223'; ci.dispatchEvent(new Event('input', { bubbles: true })) }
    try { const b1 = bq('showTab(' + Q + CASO.sub + Q); if (b1) b1.click() } catch (e) {}
    await esperar(420);
    CASO.campos.forEach(c => gesto(c[0], c[1]));
    await esperar(520);
    try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
    await esperar(500);
    /* (A) SIN TOCAR EL BOTON: es el estado de HEAD */
    R.apagado = await pdf();
    /* (B) abrir el modulo y encender el boton */
    const ab = EL('cc3d-abrir'); if (ab && ab.getAttribute('aria-pressed') !== 'true') { ab.click(); await esperar(3200) }
    const b = EL('cm3d-pdfb');
    R.boton = b ? { apagado: b.disabled, txt: b.textContent.trim() } : 'NO HAY';
    if (b && !b.disabled) { b.click(); await esperar(2600) }
    R.incluido = (typeof esqEstaIncluido === 'function') ? esqEstaIncluido('cm3d') : 'SIN FN';
    R.encendido = await pdf();
    return R;
  })()`);
  out[caso.n].errs = errs.filter(e => !/ERR_FILE_NOT_FOUND|favicon/.test(e));
  await pg.close();
}
await br.close();
console.log(JSON.stringify(out));
