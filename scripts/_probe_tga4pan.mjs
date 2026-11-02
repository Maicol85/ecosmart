/*
 * _probe_tga4pan.mjs - el PANEL de Evidencia de congenitas, antes y despues (tanda TGA-4,
 * commits 3 y 5). Nombre propio: verificado con ls que no existia.
 *
 * QUE MIDE
 *   P1  el ALTO de la seccion en el panel, a 1440, 1000, 768 y 390 px;
 *   P2  el numero de FILAS de pregunta y si cada una entra en UNA linea;
 *   P3  el CONTEO DE CITAS -clase, nivel, hoja y folio- de la seccion, que tiene que ser el
 *       MISMO antes y despues: el commit cambia donde se muestra, no que se dice;
 *   P4  los tres estados del control y que «sin dato» no cuenta como «no»;
 *   P5  si la seccion esta en modo compacto y si pinta sus dos columnas;
 *   P6  el contador, la lista de lo contestado que si, y la frase del pie UNA sola vez.
 *
 * La seccion se identifica por el PREFIJO de su titulo, que es como `IND_SECS` la busca.
 *
 *   node scripts/_probe_tga4pan.mjs --file /tmp/x.html --out /tmp/pan.json
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
const OUTF = arg('--out') || '/tmp/pan_tga4.json';
const ANCHOS = [1440, 1000, 768, 390];

/* Las escenas: una por panel, cada una con lo justo para que su seccion despierte. */
const ESCENAS = {
  tgaAur:  { tit: 'Transposición de grandes arterias',
             sel: { tga_tipo: 'dtga', tga_cirugia: 'auricular' }, campos: { vd_bas: '45' } },
  tgaJat:  { tit: 'Transposición de grandes arterias',
             sel: { tga_tipo: 'dtga', tga_cirugia: 'jatene' }, campos: { vd_bas: '45' } },
  tgaRas:  { tit: 'Transposición de grandes arterias',
             sel: { tga_tipo: 'dtga', tga_cirugia: 'rastelli' }, campos: { vd_bas: '45' } },
  tgaCc:   { tit: 'Transposición de grandes arterias', sel: { tga_tipo: 'cctga' }, campos: { vd_bas: '45' } },
  tgaSinC: { tit: 'Transposición de grandes arterias',
             sel: { tga_tipo: 'dtga', tga_cirugia: 'ninguna' }, campos: { vd_bas: '45' } },
  /* ⚠️ EL VALOR DEL SELECTOR ES `secundum` Y NO `os`: copiado del marcado. Un valor que no es
     ninguna de sus opciones deja el select VACIO y la seccion no despierta -la compuerta de
     `_indCIA` exige tipo Y (Qp/Qs o tamano)-, o sea una escena que no llega a la zona. */
  cia:     { tit: 'Comunicación interauricular',
             sel: { ete_cia_tipo: 'secundum' }, campos: { ete_cia_tam_max: '12' } },
  civ:     { tit: 'Comunicación interventricular',
             sel: { ete_civ_tipo: 'perimembranosa' }, campos: { ete_civ_tam: '6' } },
  /* ⚠️ MAXIMIZADO: es el unico estado en que el panel pasa de 900 px, que es el corte de las
     dos columnas. Sin esta escena, «cols=1» en los cuatro anchos se lee como que la regla no
     funciona, cuando lo que pasa es que el panel mide 820. */
  tgaMax:  { tit: 'Transposición de grandes arterias', max: true,
             sel: { tga_tipo: 'dtga', tga_cirugia: 'auricular' }, campos: { vd_bas: '45' } },
  /* ⚠️ CON RESPUESTAS: la lista «Recomendaciones que aplican con lo contestado» sale SOLO si
     hay alguna en «Si», y el contador solo distingue si hay de los tres tipos. Sin esta escena
     las dos piezas del commit 3b-3 y 3b-4 se miden sobre un panel vacio. */
  tgaResp: { tit: 'Transposición de grandes arterias',
             sel: { tga_tipo: 'dtga', tga_cirugia: 'auricular' }, campos: { vd_bas: '45' },
             resp: { 'tga.ev.icprog':'si', 'tga.ev.baffuga':'si', 'tga.ev.hepcong':'no' } },
  /* ⚠️ CONTROL NEGATIVO DE LOS TRES ESTADOS: se contesta «Si» y despues «?». Si el tercer
     estado contara como «No», el contador diria «0 en Si · 1 en No · 17 sin dato» en vez de
     «0 en Si · 0 en No · 18 sin dato», y la lista de recomendaciones que aplican seguiria
     mostrando la pregunta. Es la condicion que la orden pide con todas las letras. */
  tgaSd:   { tit: 'Transposición de grandes arterias',
             sel: { tga_tipo: 'dtga', tga_cirugia: 'auricular' }, campos: { vd_bas: '45' },
             resp: { 'tga.ev.icprog':'si' }, resp2: { 'tga.ev.icprog':'__sd' } },
  /* CONTROL: la bicuspide comparte el molde de pregunta (`_indFilaOrigen`) pero esta tanda no
     la pasa a compacta. Si su alto o su conteo de citas cambia, es una regresion. */
  /* El campo de la aorta ascendente es `ao_tub`, que es el que lee la compuerta de la seccion. */
  vab:     { tit: 'Válvula aórtica bicúspide — aorta ascendente',
             sel: { vab_tipo: 'fused_rl', sexo: 'M' }, campos: { ao_tub: '45', peso: '80', talla: '180' } }
};
const SOLO = (arg('--solo') || Object.keys(ESCENAS).join(',')).split(',').map(s => s.trim());

const MEDIR = `((tit) => {
  const out = { tit: tit };
  const card = document.getElementById('indic-card');
  const cuerpo = document.getElementById('indic-cuerpo');
  if (!cuerpo) return { err: 'NO EXISTE indic-cuerpo' };
  out.anchoPanel = card ? Math.round(card.getBoundingClientRect().width) : 0;
  /* La seccion: el <details> (o bloque) cuyo titulo EMPIEZA con el prefijo, que es como
     IND_SECS la busca. Se toma el contenedor con data-ind-grid mas cercano. */
  const todos = Array.prototype.slice.call(cuerpo.querySelectorAll('details, section, div'));
  let sec = null;
  for (const n of todos) {
    const h = n.querySelector(':scope > summary, :scope > h3, :scope > h4, :scope > div');
    const t = h ? String(h.textContent || '') : '';
    if (t.indexOf(tit) === 0 || t.trim().indexOf(tit) === 0) { sec = n; break }
  }
  if (!sec) {
    /* Segundo intento: cualquier nodo cuyo texto empiece con el titulo. */
    for (const n of todos) { const t = String(n.textContent || '').trim();
      if (t.indexOf(tit) === 0 && n.querySelector('[data-ind-grid]')) { sec = n; break } }
  }
  if (!sec) return { err: 'SECCION NO ENCONTRADA', tit: tit,
    titulos: todos.slice(0, 40).map(n => String(n.textContent || '').trim().slice(0, 48)) };
  /* Se abre si es un details plegado: medir un plegado da el alto del encabezado. */
  if (sec.tagName === 'DETAILS' && !sec.open) sec.open = true;
  const r = sec.getBoundingClientRect();
  out.alto = Math.round(r.height); out.ancho = Math.round(r.width);
  const grid = sec.querySelector('[data-ind-grid]');
  out.compacta = grid ? (grid.getAttribute('data-ind-compacta') === '1' ? 'si' : 'no') : 'SIN GRID';
  out.dos = grid ? (grid.getAttribute('data-ind-dos') === '1' ? 'si' : 'no') : 'SIN GRID';
  out.cols = grid ? String(getComputedStyle(grid).gridTemplateColumns || '').split(' ').filter(Boolean).length : 0;
  /* Las filas de pregunta: las que tienen botonera. Su alto dice si entran en una linea. */
  const filas = Array.prototype.slice.call(sec.querySelectorAll('tr'));
  const conCtrl = filas.filter(f => f.querySelector('.ind-ctrl'));
  out.filas = filas.length; out.preguntas = conCtrl.length;
  const altos = conCtrl.map(f => Math.round(f.getBoundingClientRect().height));
  out.altoPregMax = altos.length ? Math.max.apply(null, altos) : 0;
  out.altoPregMed = altos.length ? Math.round(altos.reduce((a, b) => a + b, 0) / altos.length) : 0;
  /* ⚠️ EL CONTEO DE CITAS SE HACE SOBRE EL TEXTO DE LA SECCION ENTERA, plegado o no: en modo
     compacto la prosa vive dentro de un <details> cerrado y textContent la trae igual. Si se
     midiera lo VISIBLE, pasar a compacto bajaria el conteo sin que se hubiera perdido nada. */
  const txt = String(sec.textContent || '');
  const cuenta = (re) => (txt.match(re) || []).length;
  out.citas = { clase: cuenta(/Clase\\s/g), nivel: cuenta(/Nivel\\s/g),
                hoja: cuenta(/hoja\\s\\d/g), folio: cuenta(/folio\\s/g),
                acc: cuenta(/ACC\\/AHA 2025/g), esc: cuenta(/ESC 2020/g) };
  out.citasTotal = out.citas.clase + out.citas.nivel + out.citas.hoja + out.citas.folio;
  /* La frase del pie, que el commit 3 pide decir UNA sola vez. */
  out.fraseNoGuarda = cuenta(/no se guarda con el estudio/g);
  out.globos = sec.querySelectorAll('[data-ind-info]').length;
  /* Las piezas que el commit 3 agrega. Antes del commit valen 0 y eso es su denominador. */
  /* ⚠️ SIN EXPRESION REGULAR, Y NO ES UN CAPRICHO: este cuerpo vive dentro de un template
     literal, donde una barra invertida simple NO sobrevive -la clase \d llega como la letra d-
     y el patron deja de encontrar lo que si esta. Es la trampa que este repositorio documenta
     varias veces y que esta sonda pago: el contador salia «no» sobre un panel que lo tiene. */
  out.cuenta = (function () {
    const a = txt.indexOf(' en Sí · '), b2 = txt.indexOf(' en No · ', a), c2 = txt.indexOf(' sin dato', b2);
    if (a < 0 || b2 < 0 || c2 < 0) return '';
    const num = (hasta) => { let i = hasta, d = ''; while (i > 0 && txt.charAt(i - 1) >= '0' && txt.charAt(i - 1) <= '9') { d = txt.charAt(i - 1) + d; i--; } return d; };
    const s1 = num(a), s2 = num(b2), s3 = num(c2);
    return (s1 && s2 && s3) ? (s1 + '/' + s2 + '/' + s3) : '';
  })();
  out.contador = out.cuenta ? 'si' : 'no';
  out.listaSi  = /Recomendaciones que aplican con lo contestado/.test(txt) ? 'si' : 'no';
  out.etiqGuia = sec.querySelectorAll('[data-ind-gbadge]').length;
  out.btnCols  = sec.querySelectorAll('[data-ind-cols]').length;
  out.grupos   = sec.querySelectorAll('[data-ind-grupo]').length;
  return out;
})(TIT)`;

const b = await chromium.launch({ channel: 'chrome' });
const OUT = { archivo: FILE };
try {
  for (const anc of ANCHOS) {
    const pg = await b.newPage({ viewport: { width: anc, height: 900 } });
    pg.on('pageerror', e => { OUT._pageErr = (OUT._pageErr || []).concat([anc + ': ' + e.message.slice(0, 140)]) });
    await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 180000 });
    await pg.waitForTimeout(1200);
    for (const k of SOLO) {
      const E = ESCENAS[k]; if (!E) continue;
      await pg.evaluate(`((esc) => {
        ['modalAvisoEco','login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none' });
        try { if (typeof limpiarCampos === 'function') limpiarCampos(true) } catch (e) {}
        try { if (typeof indicCerrar === 'function') indicCerrar() } catch (e) {}
        const S = (id, v) => { const e = document.getElementById(id); if (!e) return; e.value = v;
          e.dispatchEvent(new Event('input', { bubbles: true }));
          e.dispatchEvent(new Event('change', { bubbles: true })) };
        S('nombre', 'Prueba TGA4'); S('ci', '615');
        Object.keys(esc.campos || {}).forEach(x => S(x, esc.campos[x]));
        Object.keys(esc.sel || {}).forEach(x => S(x, esc.sel[x]));
        Object.keys(window).forEach(x => { if (/^calc[A-Z]/.test(x) && typeof window[x] === 'function') {
          try { window[x]() } catch (e) {} } });
        try { if (typeof _recalcModulos === 'function') _recalcModulos('pan') } catch (e) {}
        try { if (typeof indicAbrir === 'function') indicAbrir() } catch (e) {}
        /* Las respuestas van por su GESTO REAL -el clic en el boton-, no escribiendo el
           objeto: el manejador es quien traduce el centinela del tercer estado a null, y
           saltearlo mediria una traduccion que el medico nunca ejecuta. */
        Object.keys(esc.resp || {}).forEach(function (k) {
          const b = document.querySelector('[data-ind-clin="' + k + '"][data-ind-val="' + esc.resp[k] + '"]');
          if (b) b.click();
        });
        /* El segundo gesto: va DESPUES del repintado del primero, por eso se vuelve a buscar
           el boton -el nodo anterior ya no esta en el documento-. */
        Object.keys(esc.resp2 || {}).forEach(function (k) {
          const b = document.querySelector('[data-ind-clin="' + k + '"][data-ind-val="' + esc.resp2[k] + '"]');
          if (b) b.click();
        });
        if (esc.max && typeof indicMaxPoner === 'function') indicMaxPoner(true);
        return true;
      })(${JSON.stringify(E)})`);
      await pg.waitForTimeout(700);
      OUT[anc + '/' + k] = await pg.evaluate(MEDIR.replace('TIT', JSON.stringify(E.tit)));
      const o = OUT[anc + '/' + k];
      console.log('-- ' + anc + 'px ' + k.padEnd(8) + ' | ' + (o.err ? ('ERR ' + o.err) :
        ('alto=' + o.alto + ' panel=' + o.anchoPanel + ' preg=' + o.preguntas + ' altoPregMax=' + o.altoPregMax
         + ' compacta=' + o.compacta + ' cols=' + o.cols + ' citas=' + o.citasTotal
         + ' (C' + o.citas.clase + '/N' + o.citas.nivel + '/h' + o.citas.hoja + '/f' + o.citas.folio + ')'
         + ' frasePie=' + o.fraseNoGuarda + ' globos=' + o.globos
         + ' cont=' + o.contador + ' lista=' + o.listaSi + ' etiq=' + o.etiqGuia + ' grupos=' + o.grupos)));
    }
    await pg.close();
  }
} catch (e) { OUT._err = String(e).slice(0, 250) }
await b.close();
fs.writeFileSync(OUTF, JSON.stringify(OUT, null, 1));
console.log('escrito: ' + OUTF);
process.exit(0);
