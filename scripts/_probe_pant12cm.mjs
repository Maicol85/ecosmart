#!/usr/bin/env node
/**
 * _probe_pant12cm.mjs — el modulo del corazon maestro en el navegador (PANT-12, commit 4).
 * Mide: que el modulo abra por el boton real con su lienzo propio; cero errores de consola en
 * las DIECISEIS vistas y en las combinaciones; que la TGA conserve su recuadro; el alto y el
 * ancho a los cuatro anchos; que lo didactico NO escriba ningun campo; y la caida sin libreria.
 *   node scripts/_probe_pant12cm.mjs [--file <html>] [--anchos 1440,1000,768,390]
 * ADVERTENCIA: sin acentos graves ni barras invertidas dentro de los templates.
 */
const _pw = (await import(process.env.HOME + '/.pwtmp/node_modules/playwright/index.js')).default;
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null };
const FILE = arg('--file') || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const ANCHOS = (arg('--anchos') || '1440,1000,768,390').split(',').map(Number);
const SINLIB = process.argv.indexOf('--sinlib') > 0;
const br = await _pw.chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE, sinLibreria: SINLIB };
for (const w of ANCHOS) {
  const pg = await br.newPage({ viewport: { width: w, height: 900 } });
  const errs = [];
  pg.on('pageerror', e => errs.push('PAGE ' + e.message.slice(0, 130)));
  pg.on('console', c => { if (c.type() === 'error') errs.push('CONS ' + c.text().slice(0, 130)) });
  if (SINLIB) await pg.route('**/three.min.js', r => r.abort());
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
  await pg.waitForTimeout(1400);
  const r = await pg.evaluate(`(async () => {
    const R = {}; const EL = id => document.getElementById(id);
    const esperar = ms => new Promise(z => setTimeout(z, ms));
    const caja = el => { if (!el) return null; const q = el.getBoundingClientRect();
      return { w: Math.round(q.width), h: Math.round(q.height) } };
    const FN = n => (typeof window[n] === 'function') ? window[n] : null;
    ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
    try { limpiarCampos(true) } catch (e) {}
    const censo = () => { const o = {};
      document.querySelectorAll('input[id], select[id], textarea[id]').forEach(e => {
        if (FN('_noEsDelEstudio') && window._noEsDelEstudio(e.id)) return;
        o[e.id] = (e.type === 'checkbox') ? (e.checked ? '1' : '') : String(e.value || '');
      }); return o };
    R.censoAntes = Object.keys(censo()).length;
    const c0 = JSON.stringify(censo());
    const bq = t => Array.prototype.filter.call(document.querySelectorAll('button[onclick]'),
      b => String(b.getAttribute('onclick')).indexOf(t) >= 0)[0];
    const Q = String.fromCharCode(39);
    try { const b1 = bq('showTab(' + Q + 'congenitas' + Q); if (b1) b1.click() } catch (e) {}
    await esperar(380);
    /* ── el boton real abre el modulo PROPIO ─────────────────────────────────────────────── */
    const bot = EL('cc3d-abrir');
    R.botonCaja = caja(bot);
    if (bot) bot.click();
    await esperar(2900);
    try { document.querySelectorAll('.sacc-body').forEach(b => { b.style.transition = 'none' }) } catch (e) {}
    R.three = (typeof window.THREE === 'undefined') ? 'no' : (window.THREE.REVISION || 'si');
    R.panel = caja(EL('cc3d-panel'));
    R.lienzo = caja(EL('cm3d-cv'));
    R.canvas = caja(document.querySelector('#cm3d-cv canvas'));
    R.hostPrestamo = EL('cc3d-host') ? (EL('cc3d-host').children.length + ' hijos') : 'NO';
    R.tgaEnSuSitio = (function(){ const b = EL('tga-3d-box'); if (!b) return 'NO EXISTE';
      return EL('cc3d-host') && EL('cc3d-host').contains(b) ? 'PRESTADO (mal)' : 'en su sitio' })();
    /* ⚠️ EL AVISO SE LEE DEL NODO DE TEXTO DIRECTO DEL LIENZO, no de su textContent: los
       rotulos de las piezas son HIJOS del lienzo, asi que textContent devuelve «VDVIAoAP» y eso
       se lee como si el aviso estuviera puesto cuando el dibujo esta bien. */
    R.avisoSinLib = (function(){ const h2 = EL('cm3d-cv'); if (!h2) return 'NO';
      let t = ''; Array.prototype.forEach.call(h2.childNodes, n => { if (n.nodeType === 3) t += n.nodeValue });
      return t.trim().slice(0, 60) || '(sin aviso)' })();
    /* ⚠️ EL ALTO TACTIL DE UNA CASILLA LO DA SU <label> Y NO EL <input>: medir el input
       devuelve 18 px sobre un control que se toca en 44, que es el mismo patron de .pac-id-mk
       y lo que el barrido de celular no ve. Se mide el area que recibe el toque. */
    R.controles = ['cm3d-ins','cm3d-nom','cm3d-fc','cm3d-pausar','cm3d-frente']
      .map(i => { const e = EL(i); if (!e) return i + '=NO';
        const t = (e.type === 'checkbox') ? (e.closest('label') || e) : e;
        return i + '=' + Math.round(t.getBoundingClientRect().height) }).join(' ');
    /* los cinco puntos del area tactil de cada control.
       ADVERTENCIA: elementFromPoint FUERA DEL VIEWPORT devuelve null, no «tapado». Los controles
       caen muy abajo de la pagina, asi que hay que traerlos a la vista antes de medir: sin esto
       daban 0 de 5 sobre botones que miden 44 x 44 y no estan tapados por nada. Es la trampa que
       la tanda TGA ya documento. */
    R.puntos = [];
    for (const i of ['cm3d-ins','cm3d-nom','cm3d-pausar','cm3d-frente']) {
      const e = EL(i); if (!e) { R.puntos.push(i + '=NO'); continue }
      const t = (e.type === 'checkbox') ? (e.closest('label') || e) : e;
      try { t.scrollIntoView({ block: 'center' }) } catch (z) {}
      await esperar(140);
      const q = t.getBoundingClientRect(); if (!q.width) { R.puntos.push(i + '=caja cero'); continue }
      const pts = [[q.left+3,q.top+3],[q.right-3,q.top+3],[q.left+3,q.bottom-3],[q.right-3,q.bottom-3],
                   [(q.left+q.right)/2,(q.top+q.bottom)/2]];
      R.puntos.push(i + '=' + pts.map(pp => { const el = document.elementFromPoint(pp[0], pp[1]);
        return (el === e || el === t || t.contains(el)) ? 1 : 0 }).join(''));
    }
    R.puntos = R.puntos.join(' ');
    R.ipOculto = EL('cm3d-ip') ? (EL('cm3d-ip').hidden ? 'oculto' : 'visible') : 'NO';
    /* ── LAS DIECISEIS VISTAS Y LAS COMBINACIONES, con el motor real ─────────────────────── */
    const st = FN('_cm3dEstado') ? window._cm3dEstado() : null;
    R.hayEstado = st ? 'si' : 'NO';
    const VISTAS = [
      ['norm', {}], ['fal:sin', {}], ['fal:op', {}], ['dsav:par', {}], ['dsav:tra', {}],
      ['dsav:com', {}], ['ebs:std', {}], ['fon:ext', {}], ['fon:tun', {}], ['fon:atr', {}],
      ['mod:cia', { cia:'sec' }], ['mod:civ', { civ:'pm' }], ['mod:dap', { dap:'std' }],
      ['mod:vap', { vap:'prox' }], ['mod:cvpa', { cvpa:'cs' }], ['mod:coa', { coa:'nat' }],
      ['mod:ep', { ep:'valv' }], ['mod:ea', { ea:'sub' }], ['mod:vcs', { vcs:'std' }],
      ['mod:eis', { civ:'pm', eis:'std' }]
    ];
    const COMBI = [
      ['c1', 'norm', { cia:'sec', civ:'pm', dap:'std' }, {}],
      ['c2', 'norm', { cia:'sv', cvpa:'cs', vcs:'std' }, { svs:true }],
      ['c3', 'norm', { cia:'sec', ep:'valv' }, {}],
      ['c4', 'norm', { coa:'nat', ea:'sub' }, {}],
      ['c5', 'ebs', { cia:'sec' }, { eit:true }],
      ['c6', 'norm', { civ:'pm', dap:'std', eis:'std' }, {}]
    ];
    R.vistas = [];
    const pintar = (base, bv, mods, ck) => {
      if (!st) return 'SIN ESTADO';
      st.S.base = base; if (bv) st.S.bv[base] = bv;
      st.S.mods = Object.assign({}, mods || {}); st.S.ck = Object.assign({}, ck || {});
      try { if (FN('cm3dSync')) window.cm3dSync() } catch (e) { return 'EXC ' + String(e).slice(0,60) }
      return 'ok';
    };
    for (const v of VISTAS) {
      const p = v[0].split(':');
      const base = (p[0] === 'mod') ? 'norm' : p[0];
      const bv = (p[0] === 'mod') ? null : p[1];
      const res = pintar(base, bv, v[1], {});
      await esperar(140);
      const nodos = document.querySelectorAll('#cm3d-cv canvas').length;
      const rot = document.querySelectorAll('#cm3d-cv .cm3d-lbl').length;
      const esc = FN('cmEscena') ? (function(){ try { const s = window.cmEscena(st.S);
        return s.ar.length + '/' + s.fl.length + '/' + s.ex.length + '/' + s.lb.length } catch (e) { return 'EXC' } })() : 'SIN FN';
      R.vistas.push({ v: v[0], res: res, canvas: nodos, rotulos: rot, esc: esc });
    }
    R.combis = [];
    for (const c of COMBI) {
      const res = pintar(c[1], null, c[2], c[3]);
      await esperar(160);
      const esc = FN('cmEscena') ? (function(){ try { const s = window.cmEscena(st.S);
        return s.ar.length + '/' + s.fl.length + '/' + s.ex.length + '/' + s.lb.length } catch (e) { return 'EXC' } })() : 'SIN FN';
      R.combis.push({ c: c[0], res: res, rotulos: document.querySelectorAll('#cm3d-cv .cm3d-lbl').length, esc: esc });
    }
    /* las reglas de compatibilidad */
    if (FN('cmBloqueado')) {
      const pr = (base, mods, k) => { const S = { base: base, bv: st.S.bv, mods: mods, ck: {} };
        return k + '=' + String(window.cmBloqueado(k, S)) };
      R.reglas = [ pr('fal', {}, 'civ'), pr('fal', {}, 'ep'), pr('fal', {}, 'eis'), pr('fal', {}, 'ea'),
                   pr('dsav', {}, 'cia'), pr('dsav', {}, 'civ'), pr('ebs', {}, 'eis'),
                   pr('fon', {}, 'cia'), pr('norm', { ep:'valv' }, 'eis'), pr('norm', { eis:'std' }, 'ep'),
                   pr('norm', {}, 'cia') ].join(' | ');
    } else { R.reglas = 'SIN FN' }
    /* ── lo didactico NO escribe un campo ────────────────────────────────────────────────── */
    const c1o = censo(), c0o = JSON.parse(c0);
    R.censoDespues = Object.keys(c1o).length;
    /* ADVERTENCIA: ecoAdvSelect es el SELECTOR DE PESTANIA y lo mueve la navegacion, no el
       modulo: el barrido del censo lo incluye porque no esta en _noEsDelEstudio -solo en la
       segunda lista-. Se declara aparte para que el cero de «lo didactico no escribe» no se lo
       coma, y se mide contra HEAD con la MISMA navegacion como control. */
    const movidos = Object.keys(c1o).filter(k => String(c1o[k]) !== String(c0o[k]))
      .concat(Object.keys(c0o).filter(k => !(k in c1o)));
    R.movNav = movidos.filter(k => k === 'ecoAdvSelect').length;
    R.movModulo = movidos.filter(k => k !== 'ecoAdvSelect');
    R.censoIgual = R.movModulo.length === 0 ? 'si' : 'NO';
    R.censoMovidos = movidos.slice(0, 10).map(k => k + ': ' + JSON.stringify(c0o[k]) + ' -> ' + JSON.stringify(c1o[k])).join(' | ');
    /* la pausa y el movimiento reducido */
    const bp = EL('cm3d-pausar'); if (bp) bp.click();
    await esperar(200);
    R.pausado = st ? String(st.pausado) : 'NO';
    if (bp) bp.click();
    return R;
  })()`).catch(e => ({ ERR: String(e).slice(0, 220) }));
  OUT['w' + w] = { r, errores: errs.slice(0, 6) };
  await pg.close();
}
await br.close();
console.log(JSON.stringify(OUT, null, 1));
