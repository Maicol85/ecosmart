/*
 * _probe_tga4concl.mjs - la CONCLUSION DE PANTALLA de la transposicion, estado por estado
 * (tanda TGA-4, commit 4b). Nombre propio: verificado con ls que no existia.
 *
 * Monta una escena por cada rama de la cascada de `tgaConclusion` y vuelca, para cada una:
 * la clave de la rama, lo que la CAPSULA de pantalla publica (`txt`), lo que va al PAPEL
 * (`papel`) y el `resumen`. Corrido contra los dos arboles da la tabla de ANTES y DESPUES que
 * la orden pide, con el texto literal y no una redaccion reconstruida.
 *
 * ⚠️ LA CAPSULA SE LEE DEL DOM Y NO SOLO DEL OBJETO. `tga-concl` es lo que el medico ve; si
 * algun dia el pintor recortara el texto, medir solo el objeto no lo veria.
 *
 *   node scripts/_probe_tga4concl.mjs --file /tmp/x.html --out /tmp/concl.json
 */
const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2) }
const { chromium } = _pw;
const fs = await import('fs');
const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const OUTF = arg('--out') || '/tmp/concl_tga4.json';

/* Una escena por rama de la cascada, en el orden en que la cascada las decide. */
const ESCENAS = {
  cirugia_it:  { sel:{ tga_tipo:'dtga', tga_sintomas:'si' }, campos:{ vd_bas:'45', it_grado:'4' } },
  disfuncion:  { sel:{ tga_tipo:'dtga', tga_func_vd:'moderada', tga_sintomas:'no' }, campos:{ vd_bas:'45' } },
  disf_obstr:  { sel:{ tga_tipo:'dtga', tga_func_vd:'severa', tga_obstr_subaortica:'si', tga_sintomas:'no' },
                 campos:{ vd_bas:'45', tga_grad_subaortico:'60' } },
  obstr_sub:   { sel:{ tga_tipo:'dtga', tga_func_vd:'normal', tga_obstr_subaortica:'si', tga_sintomas:'no' },
                 campos:{ vd_bas:'45', tga_grad_subaortico:'60' } },
  /* CONTROL DEL CORTE: el MISMO escenario con el gradiente por DEBAJO de 50. La rama cambia. */
  obstr_bajo:  { sel:{ tga_tipo:'dtga', tga_func_vd:'normal', tga_obstr_subaortica:'si', tga_sintomas:'no' },
                 campos:{ vd_bas:'45', tga_grad_subaortico:'40' } },
  it_severa:   { sel:{ tga_tipo:'dtga', tga_sintomas:'no' }, campos:{ vd_bas:'45', it_grado:'4' } },
  sin_contexto:{ sel:{ tga_tipo:'dtga', tga_sintomas:'no_eval' }, campos:{ vd_bas:'45' } },
  seguimiento: { sel:{ tga_tipo:'dtga', tga_func_vd:'normal', tga_sintomas:'no' }, campos:{ vd_bas:'45' } },
  sin_fun_leve:{ sel:{ tga_tipo:'dtga', tga_func_vd:'leve', tga_sintomas:'no' }, campos:{ vd_bas:'45' } },
  sin_fun_nd:  { sel:{ tga_tipo:'dtga', tga_sintomas:'no' }, campos:{ vd_bas:'45' } },
  /* Las dos ramas que YA eran descriptivas: controles negativos del commit 4. */
  desc_jatene: { sel:{ tga_tipo:'dtga', tga_cirugia:'jatene', tga_sintomas:'no' }, campos:{ vd_bas:'45' } },
  desc_rast:   { sel:{ tga_tipo:'dtga', tga_cirugia:'rastelli', tga_civ_residual:'si', tga_sintomas:'no' },
                 campos:{ vd_bas:'45' } },
  /* Y una ccTGA con bloqueo, que es la escena del medico. */
  cc_bav:      { sel:{ tga_tipo:'cctga', tga_func_vd:'normal', tga_sintomas:'no', tga_bav:'si' },
                 campos:{ vd_bas:'45', it_grado:'2' } }
};
const SOLO = (arg('--solo') || Object.keys(ESCENAS).join(',')).split(',').map(s => s.trim());

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE };
try {
  const pg = await b.newPage({ viewport: { width: 1440, height: 900 } });
  pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([e.message.slice(0, 140)]) });
  await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
  await pg.waitForTimeout(1200);
  for (const k of SOLO) {
    const E = ESCENAS[k]; if (!E) continue;
    await pg.evaluate(`((esc) => {
      ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
      try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
      const S = (id, v) => { const e = document.getElementById(id); if (!e) return 'NO EXISTE ' + id; e.value = v;
        e.dispatchEvent(new Event('input', { bubbles: true }));
        e.dispatchEvent(new Event('change', { bubbles: true })); return e.value };
      S('nombre', 'Prueba TGA4'); S('ci', '617');
      Object.keys(esc.campos || {}).forEach(x => S(x, esc.campos[x]));
      Object.keys(esc.sel || {}).forEach(x => S(x, esc.sel[x]));
      Object.keys(window).forEach(x => { if (/^calc[A-Z]/.test(x) && typeof window[x] === 'function') {
        try { window[x]() } catch (e) {} } });
      try { if (typeof _recalcModulos === 'function') _recalcModulos('cc') } catch (e) {}
      return true;
    })(${JSON.stringify(E)})`);
    await pg.waitForTimeout(350);
    OUT[k] = await pg.evaluate(`(() => {
      const c = (typeof tgaConclusion === 'function') ? tgaConclusion() : null;
      const cap = document.getElementById('tga-concl');
      return { clave: c ? c.clave : 'NULL',
               txt: c ? String(c.txt || '') : 'NULL',
               papel: c ? String(c.papel || '') : 'NULL',
               resumen: c ? String(c.resumen || '') : 'NULL',
               capsula: cap ? String(cap.textContent || '') : 'NO EXISTE' };
    })()`);
    const o = OUT[k];
    console.log('-- ' + k.padEnd(13) + ' clave=' + String(o.clave).padEnd(14)
      + ' capsula==txt: ' + (o.capsula === o.txt ? 'si' : 'NO'));
  }
  await pg.close();
} catch (e) { OUT._err = String(e).slice(0, 250) }
await b.close();
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF);
process.exit(0);
