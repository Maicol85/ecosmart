#!/usr/bin/env node
/**
 * _probe_pant26decl.mjs - PANT-26, commit 5 (D5, D4, D2, D6, D7).
 * Abre CADA lugar por su gesto real y lee el texto de pantalla:
 *  (1) la capsula mitral con sus cinco filas y su resumen;
 *  (2) el plegable «Ver detalle» de la aortica con TAVI, sin modelo y con modelo;
 *  (3) la tarjeta ⓘ de la protesis pulmonar;
 *  (4) la tarjeta ⓘ del desajuste aortico.
 * DENOMINADOR: declara si cada tarjeta ABRIO y cuantos caracteres trajo; una tarjeta cerrada
 * no prueba nada. CONTROL NEGATIVO: la protesis TRICUSPIDE, que esta tanda no toca.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const { chromium } = _pw;
const fs = await import('fs');
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const OUTF = arg('--out') || '/tmp/pant26_decl.json';
const br = await chromium.launch({ channel: 'chrome', headless: true });
const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push('page: ' + String(e).slice(0, 180)));
pg.on('console', m => { if (m.type() === 'error') errs.push('con: ' + m.text().slice(0, 180)) });
await pg.goto('file://' + FILE);
await pg.waitForTimeout(1300);
await pg.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });

const R = await pg.evaluate(async () => {
  const esperar = (ms) => new Promise(r => setTimeout(r, ms));
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return 1 };
  const T = (id) => { const e = document.getElementById(id); return e ? String(e.textContent || '').trim() : null };
  const V = (id) => { const e = document.getElementById(id); return e ? String(e.value || '').trim() : null };
  const out = { denom: {}, mitral: {}, aortica: {}, tarjetas: {}, control: {}, papel: {} };
  const abrirValvulas = () => {
    try { const b = Array.from(document.querySelectorAll('.tab-btn')).find(x => /Válvulas/.test(x.textContent || ''));
      if (b) b.click(); else showTab('valvulas') } catch (e) {}
    ['aortica', 'mitral', 'tricuspide', 'pulmonar'].forEach(k => {
      const el = document.getElementById('ete-seccion-valv-' + k);
      try { if (el && getComputedStyle(el).display === 'none') toggleEteSeccion('valv-' + k) } catch (e) {}
    });
  };
  const base = async (sets) => {
    try { limpiarCampos(true) } catch (e) {}
    S('nombre', 'P26DEC'); S('ci', '0026'); S('peso', '70'); S('talla', '170');
    Object.keys(sets).forEach(k => S(k, sets[k]));
    try { valvProtSync() } catch (e) {}
    abrirValvulas(); await esperar(420);
  };
  /* Abre una tarjeta de parametro de valvula por su clave de QV_NOTA / QV_FUENTE, que es el
     mismo camino que usa el boton ⓘ de la capsula, y devuelve su texto COMPLETO del DOM. */
  /* La tarjeta de un parametro de valvula la construye `qvTarjeta(tipo, valv)`, que es su dueño:
     devuelve el NODO ya armado, asi que se lee su textContent sin depender de que el overlay
     abra. El denominador lo da la cantidad de caracteres. */
  const tarjetaValv = async (clave) => {
    const r = { clave, chars: 0, texto: null };
    try {
      const [tipo, valv] = clave.split(':');
      if (typeof qvTarjeta !== 'function') { r.error = 'no existe qvTarjeta'; return r }
      const nodo = qvTarjeta(tipo, valv);
      r.texto = nodo ? String(nodo.textContent || '').trim() : null;
      r.chars = r.texto ? r.texto.length : 0;
      return r;
    } catch (e) { r.error = String(e.message).slice(0, 140); return r }
  };
  /* Un globo del registro VINFO lo abre `_vInfoAbrir(clave)`, y se lee del DOM de `#vinfo-card`,
     que es lo que el medico ve. Se declara si abrio y cuantos caracteres trajo. */
  const tarjetaVinfo = async (clave) => {
    const r = { clave, abrio: false, chars: 0, texto: null };
    try {
      if (typeof _vInfoAbrir !== 'function' && typeof window._vInfoAbrir !== 'function') {
        r.error = 'no existe _vInfoAbrir'; return r }
      (window._vInfoAbrir || _vInfoAbrir)(clave);
      await esperar(300);
      const card = document.getElementById('vinfo-card');
      r.abrio = !!(card && getComputedStyle(card).display !== 'none');
      r.texto = card ? String(card.textContent || '').trim() : null;
      r.chars = r.texto ? r.texto.length : 0;
      try { if (typeof vInfoCerrar === 'function') vInfoCerrar(true) } catch (e) {}
      await esperar(130);
      return r;
    } catch (e) { r.error = String(e.message).slice(0, 140); return r }
  };
  /* ── (1) LA MITRAL ── */
  await base({ vm_morf: 'Prótesis biológica', em_vmax: '2.6', em_gmedio: '14', thp: '240',
               em_dtsvi: '21', em_vtitsvi: '50', em_vtimit: '110' });
  out.mitral.conTodo = { vmax: T('vm-prot-vmax'), gmed: T('vm-prot-gmed'), thp: T('vm-prot-thp'),
    eoa: T('vm-prot-eoa'), dvi: T('vm-prot-dvi'), ppm: T('vm-prot-ppm'), obstr: T('vm-prot-obstr') };
  generarInforme();
  out.papel.mitral = String(V('informe_texto') || '').split('\n').filter(l => /mitral/i.test(l)).join(' | ');
  out.papel.mitralSuma = String(V('en_suma') || '').split('\n').filter(l => /mitral/i.test(l)).join(' | ');
  await base({ vm_morf: 'Prótesis biológica', em_vmax: '2.6', em_gmedio: '14' });
  out.mitral.unCriterio = { vmax: T('vm-prot-vmax'), gmed: T('vm-prot-gmed'), thp: T('vm-prot-thp'),
    eoa: T('vm-prot-eoa'), dvi: T('vm-prot-dvi'), obstr: T('vm-prot-obstr') };
  await base({ vm_morf: 'Prótesis biológica', em_vmax: '1.5', em_gmedio: '3', thp: '100' });
  out.mitral.todoNormal = { vmax: T('vm-prot-vmax'), gmed: T('vm-prot-gmed'), thp: T('vm-prot-thp'),
    obstr: T('vm-prot-obstr') };
  /* ── (2) EL PLEGABLE DE LA AORTICA ── */
  await base({ va_morf: 'TAVI', vmax_ao: '2.0', gmedio_ao: '12',
               diam_tsvi: '20', itv_tsvi: '27', itv_ao: '60' });
  out.aortica.taviSinModelo = { capsula: T('ea-det-sev'), nota: T('ea-det-sev-nota') };
  /* con modelo: se busca uno del catalogo de TAVI que deje el area dentro de 1 DE */
  const ava = Math.PI * Math.pow(20 / 20, 2) * 27 / 60;
  let M = null;
  try { const i = PROT_CAT_TAVI_COLS.indexOf('eoa') + 1;
    for (const m of PROT_CAT_TAVI) for (const f of m.s) { const c = f[i];
      if (!c || c[0] == null || c[1] == null || !(+c[1] > 0)) continue;
      const z = (ava - c[0]) / c[1]; if (z >= -0.9 && z <= 0.9) { M = { n: m.n, t: String(f[0]) }; break } }
  } catch (e) {}
  out.denom.modeloTavi = M;
  if (M) {
    try { abrirValvulas(); await esperar(300);
      const btn = document.getElementById('vmod-va-btn'); if (btn) btn.click(); await esperar(160);
      const inp = document.getElementById('vmod-inp');
      if (inp) { inp.value = M.n; inp.dispatchEvent(new Event('input', { bubbles: true })) }
      await esperar(190);
      const ul = document.getElementById('vmod-sug');
      const items = ul ? Array.from(ul.querySelectorAll('button')) : [];
      out.denom.sugerencias = items.length;
      const hit = items.find(x => String(x.textContent || '').indexOf(M.n) > -1) || items[0];
      if (hit) hit.click(); await esperar(160);
      const sel = document.getElementById('vmod-tam');
      if (sel) { sel.value = M.t; sel.dispatchEvent(new Event('change', { bubbles: true })) }
      await esperar(160);
      const el = document.getElementById('vmod-elegir'); if (el) el.click(); await esperar(340);
    } catch (e) { out.denom.cargaErr = String(e.message).slice(0, 110) }
    out.denom.modeloCargado = V('va_prot_modelo') + ' / ' + V('va_prot_tam');
    out.aortica.taviConModelo = { capsula: T('ea-det-sev'), nota: T('ea-det-sev-nota') };
  }
  /* la quirurgica con el mismo tipo de escena: su salvedad NO cambia */
  await base({ va_morf: 'Prótesis mecánica', vmax_ao: '2.0', gmedio_ao: '12',
               diam_tsvi: '20', itv_tsvi: '27', itv_ao: '60' });
  out.aortica.quirurgicaSinModelo = { capsula: T('ea-det-sev'), nota: T('ea-det-sev-nota') };
  /* ── (3) y (4) LAS TARJETAS ── */
  await base({ vp_morf: 'Prótesis biológica', vp_tipo_prot: 'bio', vp_vmax: '3.5', ep_gmedio: '25' });
  out.tarjetas.pulmonar = await tarjetaValv('prot:pulmonar');
  await base({ va_morf: 'TAVI', vmax_ao: '2.0', gmedio_ao: '12',
               diam_tsvi: '16', itv_tsvi: '27', itv_ao: '60' });
  out.tarjetas.desajuste = await tarjetaVinfo('ea-prot-ppm');
  out.tarjetas.sevAortica = await tarjetaVinfo('ea-prot-sev');
  /* ── CONTROL NEGATIVO: la tricuspide, que esta tanda no toca ── */
  await base({ vt_morf: 'Prótesis biológica', et_gmedio: '12', et_thp: '240', et_e_vmax: '220' });
  out.control.tricuspide = { obstr: T('vt-prot-obstr'), gmed: T('vt-prot-gmed'),
    thp: T('vt-prot-thp'), evmax: T('vt-prot-evmax') };
  out.control.tricuspideTarjeta = await tarjetaValv('prot:tricuspide');
  out.control.mitralTarjeta = await tarjetaValv('prot:mitral');
  out.denom.QV_NOTA = (typeof QV_NOTA !== 'undefined') ? Object.keys(QV_NOTA) : null;
  return out;
});
R.errores = errs;
fs.writeFileSync(OUTF, JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
await br.close(); process.exit(0);
