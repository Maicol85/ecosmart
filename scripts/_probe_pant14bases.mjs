#!/usr/bin/env node
/**
 * _probe_pant14bases.mjs - la UNICA base y su orden de prioridad (PANT-14, commit 6).
 * Carga DOS anatomias de base a la vez, en los DIEZ pares posibles, y mide cual se dibuja y que
 * dice la linea de abajo. El orden que el medico fijo es: transposicion, Fallot, defecto AV,
 * Ebstein, Fontan. Lleva su control: cada base SOLA se dibuja.
 *   node scripts/_probe_pant14bases.mjs [--file <html>]
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
const r = await pg.evaluate(`(async () => {
  const R = { solas: [], pares: [], err: [] };
  const EL = id => document.getElementById(id);
  const esperar = ms => new Promise(z => setTimeout(z, ms));
  ['modalAvisoEco','login-overlay'].forEach(i => { const m = EL(i); if (m) m.style.display = 'none' });
  /* los campos que cargan cada base, y la base que el modulo tiene que elegir */
  const BASES = [
    { n:'tga',  b:'tga',  campos:[['tga_tipo','dtga']] },
    { n:'fal',  b:'fal',  campos:[['tdf_func_vd','normal']] },
    { n:'dsav', b:'dsav', campos:[['dsav_tipo','parcial']] },
    { n:'ebs',  b:'ebs',  campos:[['ebs_desplazamiento','14']] },
    { n:'fon',  b:'fon',  campos:[['fontan_tipo','extra']] }
  ];
  const PRIO = ['tga','fal','dsav','ebs','fon'];
  const limpiar = () => { BASES.forEach(function (x) { x.campos.forEach(function (c) {
      const e = EL(c[0]); if (!e) return;
      if (e.type === 'checkbox') { e.checked = false } else { e.value = '' }
      e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) }) }) };
  const cargar = (lista) => { lista.forEach(function (x) { x.campos.forEach(function (c) {
      const e = EL(c[0]); if (!e) { R.err.push('no existe ' + c[0]); return }
      if (e.type === 'checkbox') { e.checked = (c[1] === 'si') } else { e.value = c[1] }
      e.dispatchEvent(new Event('input', { bubbles: true })); e.dispatchEvent(new Event('change', { bubbles: true })) }) }) };
  const leer = () => { cmDesdeEstudio();
    const linea = (function () { try { cc3dTextoSync(); const p = document.getElementById('cc3d-faltan');
      return p ? p.textContent.trim() : '' } catch (e) { return 'EXC' } })();
    return { base:_cm3d.S.base, chocan:(_cm3d.chocan||[]).slice(), omit:(_cm3d.omitidas||[]).slice(), linea:linea } };
  /* ── cada base SOLA: el control ── */
  for (const x of BASES) { limpiar(); cargar([x]); await esperar(360);
    const l = leer(); R.solas.push({ n:x.n, esperada:x.b, dibuja:l.base, ok:(l.base === x.b), chocan:l.chocan, linea:l.linea.slice(0, 150) }) }
  /* ── los DIEZ pares ── */
  for (let i = 0; i < BASES.length; i++) for (let j = i + 1; j < BASES.length; j++) {
    limpiar(); cargar([BASES[i], BASES[j]]); await esperar(360);
    const l = leer();
    const gana = PRIO.indexOf(BASES[i].n) < PRIO.indexOf(BASES[j].n) ? BASES[i] : BASES[j];
    const pierde = (gana === BASES[i]) ? BASES[j] : BASES[i];
    R.pares.push({ par:BASES[i].n + '+' + BASES[j].n, esperada:gana.b, dibuja:l.base,
                   ok:(l.base === gana.b), pierde:pierde.n, chocan:l.chocan, omit:l.omit,
                   lineaMenciona:(l.chocan.join(' ').length > 0), linea:l.linea.slice(0, 200) });
  }
  limpiar();
  return R;
})()`);
await br.close();
console.log('== CADA BASE SOLA ==');
r.solas.forEach(x => console.log(' ' + (x.ok ? 'ok  ' : 'MAL ') + x.n.padEnd(6) + ' esperada ' + x.esperada.padEnd(5) + ' dibuja ' + x.dibuja));
console.log('== LOS DIEZ PARES ==');
r.pares.forEach(x => console.log(' ' + (x.ok ? 'ok  ' : 'MAL ') + x.par.padEnd(12) + ' gana ' + x.esperada.padEnd(5) + ' dibuja ' + x.dibuja.padEnd(5)
  + ' | pierde ' + x.pierde.padEnd(5) + ' | chocan: ' + JSON.stringify(x.chocan)));
console.log('solas OK: ' + r.solas.filter(x => x.ok).length + '/' + r.solas.length
  + ' | pares OK: ' + r.pares.filter(x => x.ok).length + '/' + r.pares.length
  + ' | pares que lo DICEN: ' + r.pares.filter(x => x.lineaMenciona).length + '/' + r.pares.length);
console.log('errores: ' + JSON.stringify(r.err) + ' | pagina: ' + JSON.stringify(errs));
console.log('una linea de ejemplo: ' + JSON.stringify(r.pares[0] && r.pares[0].linea));
