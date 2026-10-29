#!/usr/bin/env node
/**
 * _probe_popv2.mjs - MEDICION de la subpestana «POP Cirugia Cardiaca» (tanda POP-V2, 2026-10-29).
 *
 * SOLO LECTURA. Mide, a 1440 / 1000 / 768 / 390 px y en los dos temas:
 *   1. el ORDEN visual y de marcado de los bloques del modulo
 *   2. el recuadro del monitoreo: si scrollea por dentro y si cabe entero
 *   3. los selectores del POCUS: si su texto queda recortado
 *   4. desplazamiento horizontal del CUERPO
 *   5. textos recortados dentro de #pop-seccion
 *   6. controles tactiles por debajo de 44 px donde ya existe esa regla (globos ⓘ)
 *   7. el desplegable de farmacos y su contador
 *   8. el campo de PAM por linea arterial
 *   9. el dibujo: nodos de Impella, ECMO VV, balon y su rotulo de timing
 *
 * DENOMINADOR: cada cruce informa cuantos elementos miro.
 *
 *   node scripts/_probe_popv2.mjs                       > /tmp/popv2.NEW.json
 *   node scripts/_probe_popv2.mjs --file /tmp/head.html > /tmp/popv2.HEAD.json
 *   node scripts/_probe_popv2.mjs --ancho 1000 --tema light
 *
 * No muta index.html: comprueba su md5 al principio y al final.
 * Chrome va por el del sistema con channel:'chrome' (el chromium de Playwright no esta instalado).
 * SIN acentos graves en este archivo (scripts/check_backticks.py).
 */
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2); }
const { chromium, webkit } = _pw;

const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const ANCHOS = arg('--ancho') ? [Number(arg('--ancho'))] : [1440, 1000, 768, 390];
const TEMAS = arg('--tema') ? [arg('--tema')] : ['light', 'dark'];
const ESCENAS = arg('--escena') ? [arg('--escena')] : ['vacio', 'swan'];
const MOTOR = arg('--motor') || 'chrome';
const TIMEOUT = 60000;

const md5 = async p => createHash('md5').update(await readFile(p)).digest('hex');
const md5Antes = await md5(RAIZ + '/index.html');

/* Lo que se evalua DENTRO de la pagina. Devuelve siempre una forma completa: un ayudante que
   devuelve {ERROR} hace que la primera condicion que lea una propiedad mate el caso con un
   TypeError en vez de decir que invariante se rompio (leccion de TC-546). */
const SONDA = function () {
  const out = { err: [], denom: {} };
  const q = s => document.querySelector(s);
  const qa = s => Array.prototype.slice.call(document.querySelectorAll(s));
  const R = e => { try { const b = e.getBoundingClientRect(); return { x: +b.x.toFixed(1), y: +b.y.toFixed(1), w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; } catch (e2) { return null; } };

  /* 1 · ORDEN. De marcado, por el indice en el DOM; visual, ordenando por el borde superior. */
  const cards = qa('#pop-seccion [data-pop]');
  out.denom.cards = cards.length;
  out.ordenMarcado = cards.map(c => c.getAttribute('data-pop'));
  out.ordenVisual = cards.map(c => ({ k: c.getAttribute('data-pop'), r: R(c) }))
    .filter(x => x.r && x.r.h > 0)
    .sort((a, b) => (a.r.y - b.r.y) || (a.r.x - b.r.x)).map(x => x.k);
  /* El orden de TABULACION: los controles enfocables, en orden de documento, con la card que los
     contiene. Es el orden en que el medico carga los datos. */
  const foc = qa('#pop-seccion input, #pop-seccion select, #pop-seccion button, #pop-seccion summary');
  out.denom.focalizables = foc.length;
  const vistas = [];
  foc.forEach(function (e) {
    let p = e.closest ? e.closest('[data-pop]') : null;
    const k = p ? p.getAttribute('data-pop') : '(fuera)';
    if (!vistas.length || vistas[vistas.length - 1] !== k) vistas.push(k);
  });
  out.ordenTab = vistas;

  /* 2 · EL RECUADRO DEL MONITOREO. Scroll propio y si cabe entero. */
  const body = document.getElementById('pop_mon_body');
  const acc = document.getElementById('pop_mon_acc');
  out.monitoreo = body ? {
    existe: true,
    visible: !!(acc && acc.offsetHeight > 0),
    clientH: body.clientHeight, scrollH: body.scrollHeight,
    scrolleaPorDentro: body.scrollHeight > body.clientHeight + 1,
    overflowY: getComputedStyle(body).overflowY,
    maxHeight: getComputedStyle(body).maxHeight,
    rect: R(body)
  } : { existe: false };

  /* 3 · LOS SELECTORES DEL POCUS. Un select esta recortado cuando su contenido no entra: se
     compara el ancho del control con el ancho que su opcion elegida necesita, medido en un span
     fuera de pantalla con la MISMA tipografia. */
  const medirTexto = function (el, txt) {
    const s = document.createElement('span');
    const cs = getComputedStyle(el);
    s.style.cssText = 'position:absolute;left:-9999px;top:0;white-space:pre;visibility:hidden;' +
      'font-family:' + cs.fontFamily + ';font-size:' + cs.fontSize + ';font-weight:' + cs.fontWeight +
      ';letter-spacing:' + cs.letterSpacing;
    s.textContent = txt;
    document.body.appendChild(s);
    const w = s.getBoundingClientRect().width;
    s.remove();
    return +w.toFixed(1);
  };
  const SELS = ['pop_pleura_der', 'pop_pleura_izq', 'pop_pleura_caract',
                'pop_pulmon_lineasb', 'pop_pulmon_consol', 'pop_pulmon_neumo'];
  out.denom.selectoresPocus = 0;
  out.pocusSelects = SELS.map(function (id) {
    const e = document.getElementById(id);
    if (!e) return { id: id, existe: false };
    out.denom.selectoresPocus++;
    const cs = getComputedStyle(e);
    const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    /* La opcion MAS LARGA, no la elegida: el medico puede elegir cualquiera. */
    let peor = '', peorW = 0;
    Array.prototype.forEach.call(e.options, function (o) {
      const w = medirTexto(e, o.text);
      if (w > peorW) { peorW = w; peor = o.text; }
    });
    const util = e.clientWidth - pad - 18;  /* 18 px: la flecha del control */
    return { id: id, existe: true, clientW: e.clientWidth, util: +util.toFixed(1),
             peor: peor, peorW: peorW, recortado: peorW > util + 0.5, rect: R(e) };
  });
  out.pocusRecortados = out.pocusSelects.filter(x => x.recortado).map(x => x.id + ' (' + x.peor + ': ' + x.peorW + ' en ' + x.util + ')');

  /* 4 · DESPLAZAMIENTO HORIZONTAL DEL CUERPO. */
  const de = document.documentElement;
  out.scrollH = { body: document.body.scrollWidth, html: de.scrollWidth, client: de.clientWidth,
                  hay: de.scrollWidth > de.clientWidth + 1 };

  /* 5 · TEXTOS RECORTADOS dentro de #pop-seccion: hoja con scrollWidth > clientWidth y sin
     scroll propio ni elipsis. */
  const sec = document.getElementById('pop-seccion');
  out.denom.hojas = 0;
  out.recortados = [];
  if (sec) {
    qa('#pop-seccion *').forEach(function (e) {
      if (e.children.length) return;
      const t = (e.textContent || '').trim();
      if (!t) return;
      out.denom.hojas++;
      /* ⚠️ UN <text> DE SVG NO SE RECORTA POR SU scrollWidth, Y LA SONDA DABA CUATRO FALSOS
         POSITIVOS POR ESO. El SVG escala con su caja (width:100% sobre un viewBox), asi que su
         texto se hace mas chico y no se corta; lo unico que lo recorta es salirse del viewBox.
         Medido en HEAD a 1000 px: «Circuito pulmonar» sw 162 / cw 146, y en pantalla entra. */
      if (e.ownerSVGElement || e.namespaceURI === 'http://www.w3.org/2000/svg') {
        out.denom.svgTextos = (out.denom.svgTextos || 0) + 1;
        try {
          const bb = e.getBBox(), vb = (e.ownerSVGElement.getAttribute('viewBox') || '0 0 0 0').split(/\s+/).map(Number);
          if (bb.x < vb[0] - 0.5 || bb.y < vb[1] - 0.5 ||
              bb.x + bb.width > vb[0] + vb[2] + 0.5 || bb.y + bb.height > vb[1] + vb[3] + 0.5)
            out.recortados.push({ tag: 'svg:' + e.tagName, id: e.id || '', t: t.slice(0, 40),
                                  bbox: [+bb.x.toFixed(1), +bb.y.toFixed(1), +bb.width.toFixed(1), +bb.height.toFixed(1)],
                                  viewBox: vb });
        } catch (e2) {}
        return;
      }
      const cs = getComputedStyle(e);
      if (cs.overflowX === 'auto' || cs.overflowX === 'scroll') return;
      if (cs.textOverflow === 'ellipsis') return;
      if (e.scrollWidth > e.clientWidth + 1 && e.clientWidth > 0)
        out.recortados.push({ tag: e.tagName, id: e.id || '', t: t.slice(0, 40),
                              sw: e.scrollWidth, cw: e.clientWidth });
    });
  }

  /* 6 · CONTROLES TACTILES. Los globos ⓘ llevan la regla de 44 px: se mide el area REAL con
     elementFromPoint sobre las cuatro esquinas y el centro, porque el ::after absoluto que
     extiende el area no entra en getBoundingClientRect. */
  const globos = qa('#pop-seccion .vinfo-btn');
  out.denom.globos = globos.length;
  /* ⚠️ `elementFromPoint` TRABAJA EN COORDENADAS DE LA VENTANA, Y LA SONDA DABA 0 DE 5 PUNTOS
     SOBRE UN BOTON QUE SI SE VE: el modulo del POP arranca a y≈1500 en una sola columna, o sea
     fuera de la ventana, y ahi la funcion devuelve null. Hay que desplazarlo a la vista ANTES de
     preguntar. Medido: con el desplazamiento, 5 de 5. */
  out.globos = globos.map(function (b) {
    try { b.scrollIntoView({ block: 'center', inline: 'center' }); } catch (e) {}
    const r = R(b);
    if (!r || r.w === 0) return { id: b.getAttribute('data-vinfo') || '', rect: r, puntos: 0, nota: 'sin caja' };
    /* Area de 44 px centrada en el boton. */
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    const P = [[cx - 21, cy - 21], [cx + 21, cy - 21], [cx - 21, cy + 21], [cx + 21, cy + 21], [cx, cy]];
    let ok = 0;
    P.forEach(function (p) {
      const e = document.elementFromPoint(p[0], p[1]);
      if (e === b || (e && b.contains(e)) || (e && e.closest && e.closest('.vinfo-btn') === b)) ok++;
    });
    return { id: b.getAttribute('data-vinfo') || '', rect: r, puntos: ok,
             clase44: b.classList.contains('vinfo-btn-44') };
  });

  /* 7 · EL DESPLEGABLE DE FARMACOS Y SU CONTADOR. */
  const det = document.getElementById('pop_farmacos_det');
  const sum = document.getElementById('pop_farmacos_sum');
  out.desplegable = det ? { existe: true, abierto: !!det.open,
                            rotulo: sum ? (sum.textContent || '').trim() : null } : { existe: false };

  /* 8 · EL CAMPO DE PAM POR LINEA ARTERIAL. */
  const pai = document.getElementById('pop_pai_pam');
  const paiW = document.getElementById('pop_pai_wrap');
  out.lineaArterial = pai ? { existe: true, visible: !!(paiW && paiW.offsetHeight > 0),
                              valor: pai.value } : { existe: false };

  /* 9 · EL DIBUJO. Nodos que la tanda agrega y los que ya estaban. */
  const svg = document.getElementById('pop-esq-svg');
  out.dibujo = { existe: !!svg, nodos: svg ? svg.childElementCount : 0 };
  if (svg) {
    const ver = function (sel) { const e = svg.querySelector(sel); return e ? (e.getAttribute('display') || 'inline') : 'NO EXISTE'; };
    out.dibujo.impella = ver('[data-pop-esq="impella"]');
    out.dibujo.helice  = ver('[data-pop-esq="helice"]');
    out.dibujo.ecmoVV  = ver('[data-pop-esq="ecmovv"]');
    out.dibujo.ecmoVA  = ver('[data-pop-esq="ecmova"]');
    out.dibujo.balon   = ver('[data-pop-esq="balon"]');
    const tim = svg.querySelector('[data-pop-esq="timing"]');
    out.dibujo.timing = tim ? (tim.textContent || '') : 'NO EXISTE';
    const plR = svg.querySelector('[data-pop-esq="pleuraD"]'), plI = svg.querySelector('[data-pop-esq="pleuraI"]');
    out.dibujo.pleuraD = plR ? (plR.getAttribute('display') || 'inline') : 'NO EXISTE';
    out.dibujo.pleuraI = plI ? (plI.getAttribute('display') || 'inline') : 'NO EXISTE';
    const bl = svg.querySelectorAll('[data-pop-esq="lineaB"]');
    out.dibujo.lineasB = bl.length ? Array.prototype.slice.call(bl)
      .filter(e => (e.getAttribute('display') || 'inline') !== 'none').length : 'NO EXISTE';
  }

  /* 10 · EL ESQUEMA Y SU TEXTO: a la izquierda y a la derecha, o apilados. */
  const wrap = q('#pop-seccion .pop-esq-wrap'), txt = document.getElementById('pop-esq-txt');
  const rw = wrap ? R(wrap) : null, rt = txt ? R(txt) : null;
  out.esquemaTexto = { dibujo: rw, texto: rt,
    ladoALado: !!(rw && rt && rw.h > 0 && rt.h > 0 && rt.x >= rw.x + rw.w - 2),
    apilados: !!(rw && rt && rw.h > 0 && rt.h > 0 && rt.y >= rw.y + rw.h - 2) };

  /* 11 · LA NOTA DE LA VASOPLEJIA: en el cuerpo de la conclusion o en un globo. */
  const cb = document.getElementById('pop-concl-box');
  out.conclusion = { existe: !!cb, largo: cb ? (cb.textContent || '').length : 0,
    /* La nota LARGA se reconoce por sus FUENTES, que es lo que se mudo al globo. Buscar
       «definicion propuesta» da positivo sobre la linea CORTA que queda, que dice justo eso. */
    diceFuentesVaso: cb ? /Unic-Stojanovic|Busse|ivaf075|24 h de la circulaci/i.test(cb.textContent || '') : false,
    diceVasoCorta: cb ? /definici[oó]n propuesta/i.test(cb.textContent || '') : false,
    globoVaso: !!q('#pop-concl-box [data-vinfo="pop-vaso"], #pop-seccion [data-vinfo="pop-vaso"]') };

  return out;
};


/* ══ ESCENAS ══ Cada una carga datos con el MECANISMO de la app —asignar .value y disparar el
   evento que la app escucha—, nunca llamando a los calc* a mano: fabricar el disparador que la
   app no tiene es como un caso pasa en verde sobre el defecto (leccion de TC-519). */
const ESCENAS_DEF = {
  vacio: [],
  swan: [
    ['sel', 'pop_monitor', 'swan'],
    ['num', 'pop_sw_gc', '3.2'], ['num', 'pop_sw_fc', '88'], ['num', 'pop_sw_pam', '58'],
    ['num', 'pop_sw_paps', '42'], ['num', 'pop_sw_papd', '20'], ['num', 'pop_sw_pcp', '22'],
    ['num', 'pop_sw_pad', '14'],
    ['num', 'peso', '70'], ['num', 'talla', '170'],
    ['num', 'tapse', '12'], ['num', 'tep_vdvi', '1.1'],
    ['num', 'pop_lactato', '3.4'], ['num', 'pop_cx_horas', '6'],
    ['sel', 'pop_cx_tipo', 'cabg'],
    ['chk', 'pop_nor_activa', true],
    ['num', 'pop_nor_diluc_mg', '4'], ['num', 'pop_nor_diluc_ml', '100'], ['num', 'pop_nor_veloc', '21'],
    ['sel', 'pop_asist_tipo', 'bcia'],
    ['sel', 'pop_pleura_der', 'moderado'], ['sel', 'pop_pleura_izq', 'leve'],
    ['sel', 'pop_pulmon_lineasb', 'difusas']
  ],
  pai: [ ['sel', 'pop_monitor', 'pai'], ['num', 'peso', '70'], ['num', 'talla', '170'] ],
  impella: [
    ['sel', 'pop_monitor', 'swan'], ['num', 'pop_sw_gc', '3.2'], ['num', 'pop_sw_pam', '70'],
    ['num', 'peso', '70'], ['num', 'talla', '170'],
    ['sel', 'pop_asist_tipo', 'impella'], ['sel', 'pop_impella_nivel', 'P4']
  ],
  ecmovv: [
    ['sel', 'pop_monitor', 'swan'], ['num', 'pop_sw_gc', '3.2'], ['num', 'pop_sw_pam', '70'],
    ['num', 'peso', '70'], ['num', 'talla', '170'],
    ['sel', 'pop_asist_tipo', 'ecmo_vv'], ['num', 'pop_ecmo_flujo', '4.0']
  ],
  /* ⚠️ LAS DOS ESCENAS DE VASOPLEJIA EXISTEN PORQUE `swan` NO LLEGA A NINGUNA DE SUS RAMAS:
     su IC es bajo, asi que `icBajo` es verdadero y la nota —y su globo— no se emiten. Medir el
     globo nuevo sobre `swan` daba «no esta» sobre un denominador de cero. GC 6,0 con SC 1,8 da
     IC 3,3; RVS (PAM-PAD)/GC*80 queda por debajo de 800 en las dos. */
  vasoSi: [
    ['sel', 'pop_monitor', 'swan'], ['num', 'peso', '70'], ['num', 'talla', '170'],
    ['num', 'pop_sw_gc', '6.0'], ['num', 'pop_sw_pam', '58'], ['num', 'pop_sw_pad', '20'],
    ['num', 'pop_sw_pcp', '14']
  ],
  vasoNo: [
    ['sel', 'pop_monitor', 'swan'], ['num', 'peso', '70'], ['num', 'talla', '170'],
    ['num', 'pop_sw_gc', '6.0'], ['num', 'pop_sw_pam', '70'], ['num', 'pop_sw_pad', '20'],
    ['num', 'pop_sw_pcp', '14']
  ],
  ajeno: [ ['num', 'ddfvi', '52'], ['num', 'siv', '11'], ['num', 'peso', '70'], ['num', 'talla', '170'] ]
};
const CARGAR = function (pasos) {
  const ev = (e, t) => e.dispatchEvent(new Event(t, { bubbles: true }));
  pasos.forEach(function (p) {
    const e = document.getElementById(p[1]);
    if (!e) { return; }
    if (p[0] === 'chk') { e.checked = !!p[2]; ev(e, 'change'); return; }
    e.value = p[2];
    ev(e, 'input'); ev(e, 'change');
  });
  /* El embudo de restauracion: RECALC_MODULOS es una FUNCION, no un array (leccion de B-g). */
  try { if (typeof RECALC_MODULOS === 'function') RECALC_MODULOS(); } catch (e) {}
  try { if (typeof popSync === 'function') popSync(); } catch (e) {}
};

const reloj = (p, ms, etq) => Promise.race([p,
  new Promise((_, rej) => setTimeout(() => rej(new Error('TIMEOUT ' + etq)), ms))]);

const RES = { file: FILE, md5Antes, motor: MOTOR, cruces: [], errores: [] };
const motor = MOTOR === 'webkit' ? webkit : chromium;
const navegador = await motor.launch(MOTOR === 'webkit' ? {} : { channel: 'chrome' });

for (const tema of TEMAS) {
  for (const ancho of ANCHOS) {
   for (const escena of ESCENAS) {
    const etq = MOTOR + '/' + tema + '/' + ancho + '/' + escena;
    process.stderr.write('[' + etq + '] abriendo\n');
    let ctx = null;
    try {
      ctx = await navegador.newContext({ viewport: { width: ancho, height: 900 },
                                         colorScheme: tema === 'dark' ? 'dark' : 'light' });
      const pg = await ctx.newPage();
      const cons = [];
      pg.on('console', m => { if (m.type() === 'error') cons.push(m.text().slice(0, 200)); });
      pg.on('pageerror', e => cons.push('PAGEERROR ' + String(e.message).slice(0, 200)));
      await reloj(pg.goto('file://' + FILE, { waitUntil: 'load', timeout: TIMEOUT }), TIMEOUT, etq + ' goto');
      await pg.waitForTimeout(900);
      /* Abrir la pestana por su mecanismo y la seccion del POP por el suyo. */
      await reloj(pg.evaluate(function () {
        /* ⚠️ `#login-overlay` ES `position:fixed` Y TAPA LA PAGINA ENTERA. Sin descartarlo,
           `elementFromPoint` devuelve el overlay en los cinco puntos y el area tactil de CADA
           globo informa 0 de 5 — un cero que se lee igual que «el boton no se puede tocar».
           Medido en HEAD: `pul-balik` daba 0 de 5 y su area real es 44x44. */
        ['modalAvisoEco', 'login-overlay'].forEach(function (id) {
          const m = document.getElementById(id); if (m) m.style.display = 'none';
        });
        try { if (window.setViewMode) setViewMode('avanzado'); } catch (e) {}
        try { if (window.applyViewMode) applyViewMode(); } catch (e) {}
        try { if (typeof showTab === 'function') showTab('hemodinamica'); } catch (e) {}
        try {
          const s = document.getElementById('pop-seccion');
          if (s && s.style.display === 'none') {
            const h = document.querySelector('[onclick*="pop-seccion"]');
            if (h) h.click(); else s.style.display = 'block';
          }
        } catch (e) {}
        /* Las animaciones de apertura dan cajas de MITAD de transicion (leccion de TC-535). */
        try {
          const st = document.createElement('style');
          st.textContent = '*{transition:none !important;animation:none !important}';
          document.head.appendChild(st);
        } catch (e) {}
      }), TIMEOUT, etq + ' abrir');
      await pg.waitForTimeout(400);
      await reloj(pg.evaluate(CARGAR, ESCENAS_DEF[escena] || []), TIMEOUT, etq + ' cargar');
      await pg.waitForTimeout(500);
      const r = await reloj(pg.evaluate(SONDA), TIMEOUT, etq + ' sonda');
      r.consola = cons;
      RES.cruces.push({ motor: MOTOR, tema, ancho, escena, r });
      process.stderr.write('[' + etq + '] listo: cards=' + r.denom.cards +
        ' pocusRecortados=' + r.pocusRecortados.length + ' monScroll=' + (r.monitoreo.scrolleaPorDentro) + '\n');
    } catch (e) {
      RES.errores.push({ motor: MOTOR, tema, ancho, escena, e: String(e && e.message || e) });
      process.stderr.write('[' + etq + '] ERROR ' + String(e && e.message || e) + '\n');
    } finally { if (ctx) { try { await ctx.close(); } catch (e) {} } }
   }
  }
}
await navegador.close();
RES.md5Despues = await md5(RAIZ + '/index.html');
RES.md5Igual = RES.md5Antes === RES.md5Despues;
console.log(JSON.stringify(RES, null, 1));
process.stderr.write('== FIN SONDA POPV2 ==\n');
process.exit(0);
