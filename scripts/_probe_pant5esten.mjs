/*
 * _probe_pant5esten.mjs - la conclusion de pantalla de las dos estenosis aorticas y la frase de
 * la AHA/ACC 2020 (PANT-5, commit 3). Nombre propio: verificado con ls contra HEAD.
 *   node scripts/_probe_pant5esten.mjs --file <index.html>
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const FILE = arg('--file') || (RAIZ + '/index.html');

const JS = `(() => {
  ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
  document.querySelectorAll('*').forEach(e => { e.style.transition = 'none'; e.style.animation = 'none' });
  const o = {};
  const S = (id, v) => { const e = document.getElementById(id); if (!e) { o['falta_'+id]=1; return }
    e.value = v; e.dispatchEvent(new Event('input', { bubbles:true })); e.dispatchEvent(new Event('change', { bubbles:true })) };
  try { showTab('congenitas') } catch (e) {}
  ['sacc-cc-esub','sacc-cc-easv'].forEach(id => { const s = document.getElementById(id);
    if (s && !s.classList.contains('open')) { const h = s.querySelector('.sacc-hdr'); if (h) h.click() }
    const b = s && s.querySelector('.sacc-body'); if (b) b.style.transition = 'none' });
  /* EL CASO DEL MEDICO: subaortica, membrana, gradiente medio 45 mmHg, IA moderada. */
  S('esub_tipo','membrana'); S('esub_gradiente_medio','45'); S('esub_ia_asociada','moderada');
  /* La supravalvular, con la misma severidad y una estenosis pulmonar moderada. */
  S('easv_tipo','reloj'); S('easv_gradiente_medio','45'); S('easv_ep_asociada','moderada');
  S('easv_coronarias','comprometidos');
  try { esubSync(); easvSync() } catch (e) { o.syncErr = String(e) }
  const T = (id) => { const e = document.getElementById(id); return e ? (e.textContent || '').replace(/\\s+/g,' ').trim() : 'NO EXISTE' };
  o.esub = T('esub-resultado');
  o.easv = T('easv-resultado');
  o.esubChars = o.esub.length; o.easvChars = o.easv.length;
  /* EL PAPEL, que NO puede moverse: las dos salidas del evaluador. */
  try { const r = esubEstado(); o.esubPapel = r.papel.join('. ') + '.'; o.esubSuma = r.suma;
        o.esubAlertas = r.alertas.length; } catch (e) { o.papelErr = String(e) }
  try { const r = easvEstado(); o.easvPapel = r.papel.join('. ') + '.'; o.easvSuma = r.suma;
        o.easvAlertas = r.alertas.length; } catch (e) {}
  /* EL GLOBO: el criterio con su hoja y su folio tienen que seguir ahi. */
  const glo = (k) => { try { const v = (typeof VINFO !== 'undefined') ? VINFO[k] : null; if (!v) return 'NO EXISTE';
    return [v.tit, v.lee, v.fuente, (typeof v.ojo === 'function' ? v.ojo() : v.ojo)].filter(x => x).join(' ') } catch (e) { return 'ERR ' + e } };
  o.gEsub = glo('esub-grad'); o.gEasv = glo('easv-grad');
  const tiene = (t, xs) => xs.filter(x => String(t).indexOf(x) > -1);
  o.gEsubTiene = tiene(o.gEsub, ['40 mmHg', 'flujo normal', 'folio 603', 'folio 572', 'ESC 2020']);
  o.gEasvTiene = tiene(o.gEasv, ['40 mmHg', 'flujo normal', 'folio 572', 'ESC 2020']);
  /* CENSO en la conclusion de PANTALLA de las dos lesiones. */
  const MARC = ['ESC 2020', 'ESC 20', 'AHA/ACC', 'Clase I', 'folio', 'marcador de severidad',
                'criterio de la', 'flujo normal', 'frecuente en el s'];
  o.esubMarc = tiene(o.esub, MARC); o.easvMarc = tiene(o.easv, MARC);
  /* LA FRASE DE LA AHA/ACC 2020 de la miocardiopatia hipertrofica. */
  let hMch = '';
  try { if (typeof _critMchDif === 'function') hMch = _critMchDif();
        else { const fn = Object.keys(window).filter(k => /critMch|MchDif/.test(k)); o.fnMch = fn.join(','); } } catch (e) { o.mchErr = String(e) }
  if (!hMch) { try { hMch = (document.body.innerText || '') } catch (e) {} }
  o.aha2020 = (String(hMch).indexOf('retir') > -1 && String(hMch).indexOf('en 2020') > -1);
  o.ahaConserva = String(hMch).indexOf('no est') > -1 && String(hMch).indexOf('ninguno de los dos') > -1;
  o.mchChars = String(hMch).length;
  return o;
})()`;

const nav = await _pw.chromium.launch({ channel: 'chrome' });
const ctx = await nav.newContext({ viewport: { width: 1440, height: 900 } });
const pg = await ctx.newPage();
const errs = [];
pg.on('pageerror', e => errs.push(String(e).slice(0, 140)));
await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 60000 });
await pg.waitForTimeout(1200);
const r = await Promise.race([pg.evaluate(JS),
  new Promise((_, rj) => setTimeout(() => rj(new Error('timeout')), 60000))]);
await ctx.close(); await nav.close();
console.log('SUBAORTICA pantalla (' + r.esubChars + ' chars): ' + r.esub);
console.log('  marcadores: ' + JSON.stringify(r.esubMarc) + ' | alertas=' + r.esubAlertas);
console.log('  PAPEL: ' + r.esubPapel);
console.log('  SUMA : ' + r.esubSuma);
console.log('  GLOBO esub-grad tiene: ' + JSON.stringify(r.gEsubTiene) + ' (' + String(r.gEsub).length + ' chars)');
console.log('SUPRAVALVULAR pantalla (' + r.easvChars + ' chars): ' + r.easv);
console.log('  marcadores: ' + JSON.stringify(r.easvMarc) + ' | alertas=' + r.easvAlertas);
console.log('  PAPEL: ' + r.easvPapel);
console.log('  SUMA : ' + r.easvSuma);
console.log('  GLOBO easv-grad tiene: ' + JSON.stringify(r.gEasvTiene) + ' (' + String(r.gEasv).length + ' chars)');
console.log('MCH (' + r.mchChars + ' chars) | frase «retiro ... en 2020» presente=' + r.aha2020 +
  ' | conserva «no esta en ninguno de los dos»=' + r.ahaConserva);
console.log('errores de pagina: ' + errs.length + ' ' + (errs[0] || ''));
