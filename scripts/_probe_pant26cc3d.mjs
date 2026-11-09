#!/usr/bin/env node
/**
 * _probe_pant26cc3d.mjs - PANT-26, commit 6. Lee, con el gesto real:
 *  (1) el texto del globo ⓘ `cc-3d` tal como lo ve el medico (abierto, del DOM);
 *  (2) la linea de abajo del dibujo con una lesion que el diagrama NO representa, y sin ninguna;
 *  (3) los rotulos de los dos botones del control segmentado;
 *  (4) si el boton «Incluir en el PDF» se habilita en el modo del estudio y se apaga en Explorar;
 *  (5) que tocar una estructura la pone «sin color».
 * DENOMINADOR: declara si el globo abrio, cuantos caracteres trajo, y si la lista de lesiones
 * no representadas tiene al menos un nombre; sin eso la medicion no prueba nada.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const { chromium } = _pw;
const fs = await import('fs');
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const OUTF = arg('--out') || '/tmp/pant26_cc3d.json';
const br = await chromium.launch({ channel: 'chrome', headless: true });
const pg = await br.newPage({ viewport: { width: 1440, height: 900 } });
const errs = [];
pg.on('pageerror', e => errs.push('page: ' + String(e).slice(0, 180)));
pg.on('console', m => { if (m.type() === 'error') errs.push('con: ' + m.text().slice(0, 180)) });
await pg.goto('file://' + FILE);
await pg.waitForTimeout(1400);
await pg.addStyleTag({ content: '*,*::before,*::after{transition:none!important;animation:none!important}' });

const R = await pg.evaluate(async () => {
  const esperar = (ms) => new Promise(r => setTimeout(r, ms));
  const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO ' + id;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return 1 };
  const T = (id) => { const e = document.getElementById(id); return e ? String(e.textContent || '').trim() : null };
  const out = { denom: {}, globo: {}, linea: {}, botones: {}, pdf: {}, toque: {} };
  const irCong = async () => {
    const b = Array.from(document.querySelectorAll('.tab-btn')).find(x => /Cong[eé]nit/i.test(x.textContent || ''));
    out.denom.tabBoton = !!b;
    if (b) b.click(); else if (typeof showTab === 'function') showTab('congenitas');
    await esperar(600);
  };
  try { limpiarCampos(true) } catch (e) {}
  S('nombre', 'P26CC'); S('ci', '0026');
  await irCong();
  /* ⚠️ DENOMINADOR: el panel del 3D vive en `#cc3d-wrap` + `#cc3d-panel`, los DOS con
     `display:none` al entrar, asi que el boton ⓘ no tiene caja y `_vInfoColocar` se rinde -la
     primera corrida midio «chars: 0»-. Se carga primero una CIA, que es lo que hace aparecer el
     recuadro, y se abre el panel por su boton real «Ver en 3D». */
  S('ete_cia_tipo', 'secundum');
  await esperar(420);
  out.denom.cciaPuesta = (document.getElementById('ete_cia_tipo') || {}).value;
  const wrap = document.getElementById('cc3d-wrap');
  out.denom.wrapVisible = !!(wrap && getComputedStyle(wrap).display !== 'none');
  const bAbrir = document.getElementById('cc3d-abrir');
  out.denom.botonVerEn3D = !!bAbrir;
  if (bAbrir) { try { bAbrir.scrollIntoView({ block: 'center' }) } catch (e) {} await esperar(200); bAbrir.click(); }
  await esperar(900);
  const panel = document.getElementById('cc3d-panel');
  out.denom.panelVisible = !!(panel && getComputedStyle(panel).display !== 'none');
  /* (1) el globo */
  try {
    /* ⚠️ DENOMINADOR: `_vInfoAbrir` llama a `_vInfoColocar(clave, desde)`, que se RINDE cuando el
       boton no tiene caja, y entonces la tarjeta no abre -la primera corrida de esta sonda midio
       «chars: 0» en los dos arboles-. Se abre por el BOTON real, que es el gesto del medico, y
       se lo trae a la vista antes. */
    const bi = document.querySelector('[data-vinfo="cc-3d"]');
    out.denom.botonGlobo = !!bi;
    out.denom.botonGloboConCaja = !!(bi && (bi.offsetWidth || bi.offsetHeight));
    if (bi) { try { bi.scrollIntoView({ block: 'center' }) } catch (e) {} await esperar(200); bi.click(); }
    await esperar(360);
    const card = document.getElementById('vinfo-card');
    out.globo.abrio = !!(card && getComputedStyle(card).display !== 'none');
    out.globo.texto = card ? String(card.textContent || '').trim() : null;
    out.globo.chars = out.globo.texto ? out.globo.texto.length : 0;
    out.globo.diceTodavia = /todav[ií]a/i.test(out.globo.texto || '');
    out.globo.diceNoEntraAlPdf = /no entra al informe ni al PDF/i.test(out.globo.texto || '');
    out.globo.html = card ? String(card.innerHTML || '').slice(0, 1600) : null;
    try { vInfoCerrar(true) } catch (e) {}
    await esperar(150);
  } catch (e) { out.globo.error = String(e.message).slice(0, 160) }
  /* (3) los rotulos del control segmentado */
  const segs = Array.from(document.querySelectorAll('.cm3d-md'));
  out.botones.cm3dMd = segs.map(b => ({ txt: String(b.textContent || '').trim(), m: b.getAttribute('data-m') }));
  /* (2) la linea de abajo, SIN nada cargado */
  try { if (typeof cc3dTextoSync === 'function') cc3dTextoSync() } catch (e) {}
  await esperar(220);
  out.linea.sinNada = T('cc3d-faltan');
  /* (2b) con una lesion que el diagrama NO representa: la miocardiopatia hipertrofica */
  S('mch_espesor', '20');
  await esperar(300);
  try { if (typeof cc3dDesdeEstudio === 'function') cc3dDesdeEstudio();
        else if (typeof cmDesdeEstudio === 'function') cmDesdeEstudio() } catch (e) {}
  try { if (typeof cc3dTextoSync === 'function') cc3dTextoSync() } catch (e) {}
  await esperar(320);
  out.linea.conMch = T('cc3d-faltan');
  try { const r = cc3dNoDibujadas(); out.denom.faltaLista = r.falta; out.denom.hay = r.hay } catch (e) { out.denom.faltaErr = String(e.message).slice(0,90) }
  out.linea.diceTodavia = /todav[ií]a/i.test(String(out.linea.conMch || ''));
  /* (2c) con la VAB, el otro rotulo posible */
  S('vab_tipo', 'Tipo 1');
  await esperar(260);
  try { if (typeof cc3dTextoSync === 'function') cc3dTextoSync() } catch (e) {}
  await esperar(260);
  out.linea.conMchYVab = T('cc3d-faltan');
  /* (4) el boton del PDF en los dos modos. Se carga antes una CIA, que el diagrama SI dibuja:
     con solo la MCH, `cmHayCargado()` es falso y el boton queda apagado por «no hay nada para
     incluir», que es otra causa y no la que se quiere medir. */
  try {
    try { if (typeof cc3dTextoSync === 'function') cc3dTextoSync() } catch (e) {}
    await esperar(240);
    out.denom.cmHayCargado = (typeof cmHayCargado === 'function') ? cmHayCargado() : 'NO EXISTE';
    out.linea.conCiaYMch = T('cc3d-faltan');
    if (typeof cmSetModo === 'function') cmSetModo('estudio');
    await esperar(260);
    const b = document.getElementById('cm3d-pdfb');
    out.pdf.enEstudio = b ? { existe: true, disabled: b.disabled, txt: String(b.textContent || '').trim(),
      aviso: T('cm3d-pdfn') } : { existe: false };
    if (typeof cmSetModo === 'function') cmSetModo('explorar');
    await esperar(260);
    out.pdf.enExplorar = b ? { disabled: b.disabled, txt: String(b.textContent || '').trim(),
      aviso: T('cm3d-pdfn') } : null;
    out.linea.enExplorar = T('cc3d-faltan');
    if (typeof cmSetModo === 'function') cmSetModo('estudio');
    await esperar(220);
  } catch (e) { out.pdf.error = String(e.message).slice(0, 150) }
  /* (5) tocar una estructura la pone «sin color» */
  try {
    const antes = (typeof _cm3d !== 'undefined' && _cm3d) ? Object.keys(_cm3d.sinColor || {}).length : -1;
    out.toque.antes = antes;
    out.toque.hayCmTocar = /cmTocar/.test(String((typeof cm3dCablear === 'function') ? cm3dCablear.toString() : ''));
    if (typeof _cm3d !== 'undefined' && _cm3d && _cm3d.sinColor) {
      _cm3d.sinColor['x1'] = 1;
      if (typeof cmSinColorAplicar === 'function') cmSinColorAplicar();
      out.toque.despues = Object.keys(_cm3d.sinColor).length;
      delete _cm3d.sinColor['x1'];
      if (typeof cmSinColorAplicar === 'function') cmSinColorAplicar();
    }
    out.toque.hayAplicador = (typeof cmSinColorAplicar === 'function');
  } catch (e) { out.toque.error = String(e.message).slice(0, 150) }
  return out;
});
R.errores = errs;
fs.writeFileSync(OUTF, JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
await br.close(); process.exit(0);
