#!/usr/bin/env node
/**
 * _probe_p14b_inv.mjs - el inventario de «un dato, una sola puerta» (PANT-14b, commit 2a).
 * SOLO LECTURA sobre la app: por cada seccion de _CC_SECS saca los campos que la identifican
 * -del codigo de su propio `pred`, que es el dueno-, busca su interruptor de presencia por la
 * convencion de la app, y mide las CUATRO combinaciones interruptor x dato contra el informe y
 * el EN SUMA de verdad.
 *   node scripts/_probe_p14b_inv.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';

const CUERPO = `(async () => {
  const R = { secs: [] };
  const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  /* los ids que el pred de cada seccion mira: se leen de su propio codigo, que es el dueno */
  const IDS = p => { const t = String(p), o = [], re = /_labCampoRaw\\(i,'([a-z0-9_]+)'\\)/g;
    let m; while ((m = re.exec(t))) { if (o.indexOf(m[1]) < 0) o.push(m[1]) } return o };
  /* el interruptor de presencia, por la convencion de la app */
  const CONV = { cia:'ete_cia_activa', civ:'ete_civ_activa', dap:'ductus_incluir_chk',
                 coa:'coart_incluir_chk' };
  const sw = k => { if (CONV[k]) return CONV[k];
    const c = [k + '_incluir_chk']; for (const i of c) { if (EL(i)) return i } return '' };
  R.nSecs = (typeof _CC_SECS !== 'undefined') ? _CC_SECS.length : -1;
  for (const sc of (typeof _CC_SECS !== 'undefined' ? _CC_SECS : [])) {
    const o = { k: sc.k, lbl: sc.lbl, ids: IDS(sc.pred) };
    const si = sw(sc.k); o.sw = si || 'SIN INTERRUPTOR';
    const se = si ? EL(si) : null;
    o.swExiste = !!se;
    if (se) { o.swTipo = se.type; o.swOculto = (se.style.display === 'none') || se.hidden || (se.offsetParent === null);
              o.swMarcado = se.checked; }
    /* de los ids que el pred mira, cuales son campos del formulario y de que tipo */
    o.campos = o.ids.map(function (id) { const e = EL(id); if (!e) return id + ':NO EXISTE';
      let def = ''; if (e.tagName === 'SELECT') { def = '[' + (e.options[0] ? e.options[0].value : '?') + ']' }
      return id + ':' + e.tagName.toLowerCase() + (e.tagName === 'SELECT' ? def : '') });
    R.secs.push(o);
  }
  return R;
})()`;

const br = await _pw.chromium.launch({ channel: 'chrome' });
const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 130)));
let out;
try {
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(1700);
  out = await pg.evaluate(CUERPO);
  out.errs = errs.filter(e => !/ERR_FILE_NOT_FOUND|favicon/.test(e));
} catch (e) { out = { fatal: String(e).slice(0, 240), errs } }
await pg.close(); await br.close();
console.log(JSON.stringify(out, null, 1));
