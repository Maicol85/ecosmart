#!/usr/bin/env node
/**
 * _probe_pant14inv.mjs - el inventario de las siete pestanias (PANT-14, commit 4a). SOLO LEE.
 * Para cada lesion: todos sus campos con su id, su rotulo, sus opciones y SU VALOR SIN TOCAR
 * -que es lo que la leccion (n) de la orden pide medir-, y el predicado propio de la seccion
 * con la forma vacia y con el campo que define la variante cargado.
 *   node scripts/_probe_pant14inv.mjs [--file <html>]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const br = await _pw.chromium.launch({ channel: 'chrome' });
const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 140)));
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
await pg.waitForTimeout(1600);
const r = await pg.evaluate(`(() => {
  const R = { lesiones: {}, predicados: {}, err: [] };
  const EL = id => document.getElementById(id);
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  const PRE = { fallot:'tdf_', coa:'coa_', ep:'ep_', esub:'esub_', easv:'easv_',
                dsav:'dsav_', ebs:'ebs_', fontan:'fontan_' };
  const rotulo = (e) => {
    try { if (e.id) { const l = document.querySelector('label[for="' + e.id + '"]'); if (l) return l.textContent.trim().slice(0, 70) } } catch (x) {}
    let p = e.parentElement, n = 0;
    while (p && n < 3) { const l = p.querySelector('label'); if (l) return l.textContent.trim().slice(0, 70); p = p.parentElement; n++ }
    return '';
  };
  Object.keys(PRE).forEach(function (nom) {
    const pre = PRE[nom], campos = [];
    Array.prototype.forEach.call(document.querySelectorAll('input[id],select[id],textarea[id]'), function (e) {
      if (e.id.indexOf(pre) !== 0) return;
      const o = { id: e.id, tag: e.tagName.toLowerCase(), tipo: e.type || '',
                  rotulo: rotulo(e), ro: !!(e.readOnly || e.disabled) };
      if (e.tagName === 'SELECT') {
        o.opciones = Array.prototype.map.call(e.options, x => (x.value === '' && x.textContent) ? '[texto]' + x.textContent.trim() : x.value);
        o.sinTocar = e.value;
        o.primera = e.options.length ? (e.options[0].value || e.options[0].textContent.trim()) : '';
      } else if (e.type === 'checkbox') { o.sinTocar = e.checked ? 'marcada' : 'sin marcar' }
      else { o.sinTocar = e.value }
      campos.push(o);
    });
    R.lesiones[nom] = campos;
  });
  /* el predicado propio de cada seccion, con la forma VACIA */
  const pred = () => {
    const o = {};
    const t = (nom, fn) => { try { o[nom] = fn() } catch (e) { o[nom] = 'EXC ' + String(e).slice(0, 60) } };
    t('esub', () => esubEstado().hayDatos);
    t('easv', () => easvEstado().hayDatos);
    t('dsav', () => dsavEstado().hayDatos);
    t('fontan', () => fontanEstado().hayDatos);
    t('ebs', () => { const c = ebsConclusion(); return Object.keys(c).indexOf('hayDato') >= 0 ? c.hayDato : ('claves: ' + Object.keys(c).join(',')) });
    t('tdf', () => { const c = tdfConclusion(); return Object.keys(c).indexOf('hayDato') >= 0 ? c.hayDato : ('claves: ' + Object.keys(c).join(',')) });
    t('coa', () => { const c = coaConclusion(); return Object.keys(c).indexOf('hayDato') >= 0 ? c.hayDato : ('claves: ' + Object.keys(c).join(',')) });
    return o;
  };
  R.predicados.vacio = pred();
  /* y con el campo que define la variante cargado, uno por uno */
  const DEF = [['tdf_civ_residual','si'],['coa_situacion','nativa'],['esub_tipo','membrana'],
               ['easv_tipo','reloj'],['dsav_tipo','parcial'],['ebs_desplazamiento','12'],
               ['fontan_tipo','extra'],['ep_vmax','3.5'],['ep_nivel','Valvular']];
  DEF.forEach(function (d) {
    const e = EL(d[0]); if (!e) { R.err.push('no existe ' + d[0]); return }
    const antes = (e.type === 'checkbox') ? e.checked : e.value;
    if (e.type === 'checkbox') e.checked = (d[1] === 'si'); else e.value = d[1];
    e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true }));
    R.predicados['con ' + d[0]] = pred();
    if (e.type === 'checkbox') e.checked = antes; else e.value = antes;
    e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true }));
  });
  R.predicados.restaurado = pred();
  return R;
})()`);
await br.close();
console.log(JSON.stringify(r, null, 1));
if (errs.length) console.error('pagina: ' + JSON.stringify(errs));
