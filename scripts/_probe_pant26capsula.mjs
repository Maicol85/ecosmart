#!/usr/bin/env node
/**
 * _probe_pant26capsula.mjs - PANT-26, commit 2 (D8). Mide la capsula en los CUATRO momentos de
 * la escena X4 con el gesto real: cargar los datos, elegir el modelo por el componente,
 * volver a tocar un campo, y llamar al pintor a mano.
 * DENOMINADOR: declara que el recuadro esta visible y que el modelo quedo cargado; sin eso la
 * medicion no prueba nada. CONTROL NEGATIVO: (1) la misma escena SIN elegir modelo, donde la
 * capsula no tiene por que cambiar; (2) elegir un modelo en la MITRAL, cuyo veredicto no lee el
 * catalogo, para confirmar que su capsula no se mueve; (3) quitar el modelo aortico, que tiene
 * que devolver la capsula al veredicto sin area.
 * Se corre con --file contra HEAD y contra el arbol nuevo.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const { chromium } = _pw;
const fs = await import('fs');
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const OUTF = arg('--out') || '/tmp/pant26_capsula.json';
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
  const out = { denom: {}, momentos: {}, control: {} };
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
    S('nombre', 'P26CAP'); S('ci', '0026'); S('peso', '70'); S('talla', '170');
    Object.keys(sets).forEach(k => S(k, sets[k]));
    try { valvProtSync() } catch (e) {}
    abrirValvulas(); await esperar(400);
  };
  const cargarModelo = async (pos, nombre, tam) => {
    const P = { pedido: nombre + ' / ' + tam };
    try {
      /* DENOMINADOR: `generarInforme()` cambia de pestania, y con el boton sin caja
         `_vModColocar` se rinde y la tarjeta se cierra sola -la primera corrida de esta sonda
         midio «sugerencias: 0» con el modelo sin cargar-. Se vuelve a Valvulas ANTES de abrir. */
      abrirValvulas(); await esperar(350);
      const btn = document.getElementById('vmod-' + pos + '-btn');
      P.botonConCaja = !!(btn && (btn.offsetWidth || btn.offsetHeight));
      if (btn) btn.click(); else vModAbrir(pos);
      await esperar(140);
      const inp = document.getElementById('vmod-inp');
      if (inp) { inp.value = nombre; inp.dispatchEvent(new Event('input', { bubbles: true })) }
      await esperar(170);
      const ul = document.getElementById('vmod-sug');
      const items = ul ? Array.from(ul.querySelectorAll('button')) : [];
      P.sugerencias = items.length;
      const hit = items.find(x => String(x.textContent || '').indexOf(nombre) > -1) || items[0];
      if (hit) hit.click();
      await esperar(140);
      const sel = document.getElementById('vmod-tam');
      if (sel) { sel.value = tam; sel.dispatchEvent(new Event('change', { bubbles: true })) }
      await esperar(140);
      const el = document.getElementById('vmod-elegir');
      P.botonElegirHabilitado = !!el && !el.disabled;
      if (el) el.click();
      await esperar(300);
      P.modelo = V(pos + '_prot_modelo'); P.tam = V(pos + '_prot_tam');
      P.quedoCargado = !!(P.modelo && P.tam);
      return P;
    } catch (e) { P.error = String(e.message).slice(0, 120); return P }
  };
  /* busca, DENTRO del catalogo, un modelo cuya EOA de referencia deje el area medida a 2 DE o
     mas por debajo: los valores de la tabla son datos leidos de la guia, no se eligen de memoria */
  const buscarModelo = (ava, zMin, zMax, cual) => {
    try {
      const cat = (cual === 'tavi') ? PROT_CAT_TAVI : PROT_CAT_A4;
      const cols = (cual === 'tavi') ? PROT_CAT_TAVI_COLS : PROT_CAT_A4_COLS;
      const i = cols.indexOf('eoa') + 1;
      for (const m of cat) for (const f of m.s) {
        const c = f[i];
        if (!c || c[0] == null || c[1] == null || !(+c[1] > 0)) continue;
        const z = (ava - c[0]) / c[1];
        if (z >= zMin && z <= zMax) return { modelo: m.n, tam: String(f[0]), ref: c[0], sd: c[1], z: +z.toFixed(2) };
      }
      return null;
    } catch (e) { return null }
  };
  const foto = () => ({ capsula: T('ea-det-sev'), nota: T('ea-det-sev-nota'),
    nivel: (function(){ try { const P = eaProtVeredicto(); return P ? P.nivel : null } catch (e) { return 'ERR' } })(),
    eoaEvaluable: (function(){ try { const P = eaProtVeredicto(); return P ? P.eoaEvaluable : null } catch (e) { return 'ERR' } })(),
    plegableDiceSinModelo: /no hay un modelo del catálogo cargado/.test(String(T('ea-det-sev-nota') || '')) });
  const infAo = () => { generarInforme();
    return String(V('informe_texto') || '').split('\n').filter(l => /aórtic/i.test(l)).join(' | ') };

  out.denom.vModTrasElegirExiste = (typeof vModTrasElegir === 'function');
  const mBajo = buscarModelo(0.80, -99, -2.0);
  out.denom.modeloBuscado = mBajo;

  /* ══ LOS CUATRO MOMENTOS ══ */
  await base({ va_morf: 'Prótesis mecánica', vmax_ao: '4.5', gmedio_ao: '45',
               diam_tsvi: '16', itv_tsvi: '40', itv_ao: '100' });
  const caja = document.getElementById('caja-esten-aortica');
  out.denom.cajaVisible = caja ? (getComputedStyle(caja).display !== 'none') : null;
  out.momentos.m1_antesDelModelo = Object.assign(foto(), { infAo: infAo() });
  const carga = await cargarModelo('va', mBajo ? mBajo.modelo : 'Abbott Epic', mBajo ? mBajo.tam : '27');
  out.denom.carga = carga;
  out.momentos.m2_trasElegir = Object.assign(foto(), { infAo: infAo() });
  S('vmax_ao', '4.5'); await esperar(450);
  out.momentos.m3_trasTocarUnCampo = Object.assign(foto(), { infAo: infAo() });
  try { calcEADetalle() } catch (e) {}
  await esperar(200);
  out.momentos.m4_llamandoAlPintorAMano = Object.assign(foto(), { infAo: infAo() });

  /* ══ CONTROL 1: la misma escena SIN elegir modelo — la capsula no tiene por que moverse ══ */
  await base({ va_morf: 'Prótesis mecánica', vmax_ao: '4.5', gmedio_ao: '45',
               diam_tsvi: '16', itv_tsvi: '40', itv_ao: '100' });
  const c1a = foto();
  S('vmax_ao', '4.5'); await esperar(400);
  const c1b = foto();
  out.control.sinModelo = { antes: c1a, despues: c1b,
    iguales: c1a.capsula === c1b.capsula && c1a.nivel === c1b.nivel };

  /* ══ CONTROL 2: elegir modelo en la MITRAL, cuyo veredicto no lee el catalogo ══ */
  await base({ vm_morf: 'Prótesis biológica', em_vmax: '2.6', em_gmedio: '14', thp: '240' });
  const c2a = { obstr: T('vm-prot-obstr'), vmax: T('vm-prot-vmax'), gmed: T('vm-prot-gmed') };
  const cargaVm = await cargarModelo('vm', 'Medtronic Mosaic', '27');
  const c2b = { obstr: T('vm-prot-obstr'), vmax: T('vm-prot-vmax'), gmed: T('vm-prot-gmed') };
  out.control.mitral = { cargaQuedo: cargaVm.quedoCargado, antes: c2a, despues: c2b,
    iguales: JSON.stringify(c2a) === JSON.stringify(c2b) };

  /* ══ CONTROL 3: QUITAR el modelo aortico vuelve la capsula al veredicto sin area ══ */
  await base({ va_morf: 'Prótesis mecánica', vmax_ao: '4.5', gmedio_ao: '45',
               diam_tsvi: '16', itv_tsvi: '40', itv_ao: '100' });
  await cargarModelo('va', mBajo ? mBajo.modelo : 'Abbott Epic', mBajo ? mBajo.tam : '27');
  const c3a = foto();
  try { vModQuitar('va') } catch (e) {}
  await esperar(400);
  const c3b = foto();
  out.control.quitarModelo = { conModelo: c3a, sinModelo: c3b,
    volvio: c3b.nivel === 'posible' && /Posible estenosis protésica/.test(String(c3b.capsula || '')) };
  return out;
});
R.errores = errs;
fs.writeFileSync(OUTF, JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
await br.close(); process.exit(0);
