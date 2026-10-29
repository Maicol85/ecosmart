#!/usr/bin/env node
/**
 * _probe_gpant.mjs - MEDICION SISTEMATICA DE PANTALLA de la tanda G (2026-10-29).
 *
 * Recorre TODAS las pestanas y subpestanas a 1000 / 768 / 390 px, en tema claro y oscuro, con un
 * estudio LLENO y con uno VACIO, y mide SOLO LECTURA:
 *   1. desplazamiento horizontal del CUERPO de la pagina
 *   2. texto recortado (hoja con scrollWidth > clientWidth, sin scroll propio ni elipsis)
 *   3. elementos superpuestos (hermanos de bloque que se pisan mas del 40 % del area)
 *   4. controles por debajo de 44 px donde ya existe esa regla (los globos ⓘ) y botones desnudos
 *   5. SVG que desborda su caja, o que queda demasiado chico
 *   6. tablas mas anchas que su contenedor y SIN scroll dentro de el
 *   7. lo que se sale del viewport por la derecha
 *
 * DENOMINADOR: se imprime en la salida (pestanas x anchos x temas x escenas, y cuantos elementos
 * se miraron en cada cruce). Sin el, un cero no se distingue de «la sonda no mira nada».
 *
 *   node scripts/_probe_gpant.mjs                       > /tmp/gpant.NEW.json
 *   node scripts/_probe_gpant.mjs --file /tmp/head.html > /tmp/gpant.HEAD.json
 *   node scripts/_probe_gpant.mjs --solo pericardio --ancho 1000
 *
 * ⚠️ NO MUTA index.html: comprueba su md5 al principio y al final.
 * ⚠️ El binario de chromium de Playwright NO esta en esta maquina (esta el 1234 y el paquete pide
 *    el 1248): Chrome va por el del sistema con channel:'chrome'. Sin eso los cruces salen VACIOS,
 *    que en un volcado se lee igual que «no hubo diferencias».
 * ⚠️ SIN acentos graves en este archivo (ver scripts/check_backticks.py).
 */
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const CAND = [process.env.HOME + '/.pwtmp/node_modules/playwright/index.js',
              '/tmp/pw/node_modules/playwright/index.js'];
let _pw = null;
for (const c of CAND) { try { _pw = (await import(c)).default; break } catch (e) {} }
if (!_pw) { console.log(JSON.stringify({ error: 'SIN PLAYWRIGHT' })); process.exit(2); }
const { chromium } = _pw;

const RAIZ = '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart';
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null };
const FILE = arg('--file') || (RAIZ + '/index.html');
const SOLO = arg('--solo');
const ANCHOS = arg('--ancho') ? [Number(arg('--ancho'))] : [1000, 768, 390];
const TEMAS = ['light', 'dark'];
const ESCENAS = ['lleno', 'vacio'];

/* Las 17 puertas de la barra, en el orden en que estan en pantalla, mas las subpestanas que
   tienen barra propia. La clave es lo que showTab recibe; el rotulo es el de la pantalla. */
const PESTANAS = [
  ['datos', 'Paciente'], ['ai-vi', 'AI / VI'], ['vd', 'VD / AD'], ['doppler', 'Doppler'],
  ['valvulas', 'Valvulas'], ['contractilidad', 'Contractilidad'], ['sgl', 'SGL'],
  ['pericardio', 'Pericardio y pulmon'], ['otros', 'Otros'], ['imagenes', 'Imagenes'],
  ['config', 'Config'], ['hemodinamica', 'Hemodinamica'], ['ete', 'ETE'],
  ['cardioOnco', 'Cardio-Oncologia'], ['amiloidosis', 'Amiloidosis'],
  ['congenitas', 'C. Congenitas'], ['refs', 'Referencias'],
];
/* Subpestanas con barra propia: [pestana, funcion, valor, rotulo] */
const SUBS = [
  ['refs', 'refSubTab', 'dim', 'Referencias/Dimensiones'],
  ['refs', 'refSubTab', 'fun', 'Referencias/Funcion'],
  ['refs', 'refSubTab', 'valv', 'Referencias/Valvulas'],
  ['refs', 'refSubTab', 'ao', 'Referencias/Aorta'],
  ['refs', 'refSubTab', 'otros', 'Referencias/Otros'],
  ['refs', 'refSubTab', 'calc', 'Referencias/Calculadoras'],
  ['ete', 'eteTaviTab', 'pre', 'ETE/Pre-TAVI'],
  ['ete', 'eteTaviTab', 'post', 'ETE/Post-TAVI'],
  ['ete', 'eteShuntTab', 'cia', 'ETE/CIA'],
  ['ete', 'eteShuntTab', 'civ', 'ETE/CIV'],
];

/* ───────── lo que corre DENTRO de la pagina ───────── */

function PREPARAR(escena) {
  ['modalAvisoEco', 'login-overlay'].forEach(id => {
    const m = document.getElementById(id); if (m) m.style.display = 'none';
  });
  /* Modo avanzado: sin el, cinco pestanas no tienen caja y la medicion no las ve. */
  try { if (window.setViewMode) setViewMode('avanzado'); } catch (e) {}
  try { if (window.applyViewMode) applyViewMode(); } catch (e) {}
  if (escena === 'vacio') return { campos: 0 };

  /* ── LLENADO GENERICO ──
     Un valor en la mayor cantidad posible de modulos. Para el <select> se elige la opcion con el
     ROTULO MAS LARGO, no la primera: lo que se busca es estresar el ancho, y la opcion larga es
     justo la que desborda. Config queda FUERA: destildar sus casillas apaga modulos y la
     medicion perderia pantallas. */
  let n = 0;
  const fuera = el => el.closest('#tab-config') || el.closest('#tab-guardados');
  document.querySelectorAll('input, select, textarea').forEach(el => {
    if (el.disabled || fuera(el)) return;
    const t = (el.type || '').toLowerCase();
    if (t === 'hidden' || t === 'file' || t === 'button' || t === 'submit') return;
    try {
      if (el.tagName === 'SELECT') {
        let mejor = null, largo = -1;
        Array.prototype.forEach.call(el.options, o => {
          if (o.value === '' || o.disabled) return;
          if ((o.textContent || '').length > largo) { largo = (o.textContent || '').length; mejor = o }
        });
        if (!mejor) return;
        el.value = mejor.value;
      } else if (t === 'checkbox') {
        el.checked = true;
      } else if (t === 'radio') {
        el.checked = true;
      } else if (t === 'date') {
        el.value = '2026-10-29';
      } else if (t === 'number' || el.classList.contains('numdec') ||
                 (el.getAttribute('inputmode') || '') === 'decimal') {
        const mn = parseFloat(el.min), mx = parseFloat(el.max);
        let v = 30;
        if (!isNaN(mn) && !isNaN(mx)) v = Math.round((mn + mx) / 2 * 10) / 10;
        else if (!isNaN(mn)) v = mn + 1;
        else if (!isNaN(mx)) v = Math.max(1, Math.round(mx / 2));
        el.value = String(v);
      } else {
        el.value = 'Prueba de pantalla G';
      }
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      n++;
    } catch (e) {}
  });
  /* El sexo y el cuerpo, a mano: son los que gobiernan los cortes y los textos derivados. */
  const set = (id, v) => {
    const e = document.getElementById(id); if (!e) return;
    e.value = v; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true }));
  };
  set('sexo', 'M'); set('edad', '62'); set('peso', '78'); set('talla', '172');
  set('nombre', 'Prueba Pantalla'); set('documento', '1234567');
  /* Los recalculos y los espejos, una vez. */
  try { if (window.RECALC_MODULOS) {
    const L = typeof RECALC_MODULOS === 'function' ? RECALC_MODULOS() : RECALC_MODULOS;
    (L || []).forEach(f => { try { (typeof f === 'function' ? f : window[f])() } catch (e) {} });
  } } catch (e) {}
  Object.keys(window).forEach(k => {
    if (/^calc[A-Z]/.test(k) && typeof window[k] === 'function') { try { window[k]() } catch (e) {} }
  });
  return { campos: n };
}

function MEDIR(cfg) {
  const R = { hallazgos: [], denom: {} };
  const push = (sev, tipo, el, medida, sug) => {
    let sel = '';
    if (el) {
      if (el.id) sel = '#' + el.id;
      else {
        const cls = (el.className && typeof el.className === 'string')
          ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '';
        sel = el.tagName.toLowerCase() + cls;
      }
    }
    const txt = el ? (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50) : '';
    R.hallazgos.push({ sev: sev, tipo: tipo, sel: sel, txt: txt, medida: medida, sug: sug });
  };

  /* ── abrir la pestana por su clave, y expandir lo colapsado ──
     ⚠️ showTab programatico deja la .card de adentro SIN CAJA en algunas pantallas (leccion de la
     tanda E): hay que forzar el display de las secciones, o todo lo de adentro informa 0x0 y la
     medicion sale impecable sobre una pantalla que nadie dibujo. */
  try { showTab(cfg.tab) } catch (e) { R.errTab = String(e).slice(0, 80) }
  if (cfg.subFn) { try { window[cfg.subFn](cfg.subVal) } catch (e) { R.errSub = String(e).slice(0, 80) } }

  /* ⚠️ LA MEDIDA DE «SE ABRIO» ES LA ALTURA, NO EL CONTEO DE VISIBLES.
     Contar elementos cuesta O(n) por cada click y Referencias tiene 35 abridores: el barrido
     pasaba de minutos por puerta. `scrollHeight` es una sola lectura y distingue igual. */
  const visibleEn = raiz => raiz.scrollHeight;
  const secAct = document.querySelector('.tab-section.active') || document.body;

  /* ⚠️ EXPANDIR CON EL GESTO REAL, Y SOLO LOS ABRIDORES ESTRUCTURALES.
     Forzar `display` a mano deja la .card de adentro sin caja (leccion de la tanda E) y ademas
     abre ramas que la app esconde a proposito, fabricando superposiciones falsas. Y la lista de
     abridores es CERRADA a proposito: `eteInclToggle` y `toggleValvPill` NO son estructurales
     —cambian lo que el informe dice—, asi que clickearlas mediria otra app. */
  const ABRIDORES = /^(toggleEteSeccion|secToggle|toggleCard|accToggle|igToggleAcc|labAccToggle|toggleRef)\(/;
  let abiertas = 0, reabiertas = 0;
  for (let pasada = 0; pasada < 2; pasada++) {
    const cabeceras = Array.prototype.slice.call(secAct.querySelectorAll('[onclick]'))
      .filter(el => ABRIDORES.test((el.getAttribute('onclick') || '').trim()));
    let cambio = false;
    for (const h of cabeceras) {
      const r = h.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      const antes = visibleEn(secAct);
      try { h.click() } catch (e) { continue }
      const despues = visibleEn(secAct);
      /* Si el click CERRO algo, se deshace: la medicion tiene que ver la pantalla abierta, y un
         abridor que ya estaba abierto se cierra con el mismo gesto. */
      if (despues < antes) { try { h.click(); reabiertas++ } catch (e) {} }
      else if (despues > antes) { abiertas++; cambio = true }
    }
    if (!cambio) break;
  }
  R.abiertas = abiertas; R.reabiertas = reabiertas;
  try { secAct.querySelectorAll('details').forEach(d => { d.open = true }) } catch (e) {}

  const sec = secAct;
  const VP = window.innerWidth;
  const visible = el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return false;
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && cs.opacity !== '0';
  };
  const enSVG = el => !!(el.ownerSVGElement || el.closest('svg'));
  const recorta = el => {
    const cs = getComputedStyle(el);
    return /auto|scroll|hidden/.test(cs.overflowX) || /auto|scroll|hidden/.test(cs.overflow);
  };
  const ancestroScrollea = el => {
    let n = el.parentElement, p = 0;
    while (n && n !== document.body && p < 8) { if (recorta(n)) return true; n = n.parentElement; p++ }
    return false;
  };

  /* 1 · desplazamiento horizontal del CUERPO */
  R.scrollH = document.documentElement.scrollWidth > document.documentElement.clientWidth + 2;
  R.scrollHpx = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  if (R.scrollH) push('ALTA', 'scroll-horizontal-del-cuerpo', null,
    document.documentElement.scrollWidth + ' px de contenido en ' + document.documentElement.clientWidth,
    'el contenido ancho tiene que scrollear DENTRO de su contenedor, no mover la pagina');

  const todos = Array.prototype.slice.call(sec.querySelectorAll('*')).filter(el => visible(el) && !enSVG(el));
  R.denom.elementos = todos.length;
  R.denom.pestanaConCaja = sec !== document.body && sec.getBoundingClientRect().width > 0;

  todos.forEach(el => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);

    /* 7 · fuera del viewport por la derecha */
    if (r.width > 0 && r.right > VP + 1 && !recorta(el) && !ancestroScrollea(el)) {
      push(cs.position === 'fixed' ? 'ALTA' : 'MEDIA', 'fuera-del-viewport', el,
        Math.round(r.left) + '-' + Math.round(r.right) + ' px contra un viewport de ' + VP,
        'limitar el ancho al viewport o envolver en overflow-x:auto');
    }
    /* 2 · texto recortado */
    const hoja = el.children.length === 0 && (el.textContent || '').trim().length > 0;
    if (hoja && el.scrollWidth > el.clientWidth + 2 && el.clientWidth > 0 &&
        !recorta(el) && cs.textOverflow !== 'ellipsis') {
      /* P1 pide CERO texto recortado, y un rotulo cortado CAMBIA LO QUE DICE («Estenosi»). */
      push('ALTA', 'texto-recortado', el,
        'contenido de ' + el.scrollWidth + ' px en una caja de ' + el.clientWidth,
        'permitir el salto de linea u ordenar el ancho de la columna');
    }
    /* 6 · tabla sin scroll dentro de su contenedor */
    if (el.tagName === 'TABLE' && r.width > 0) {
      const caja = el.parentElement ? el.parentElement.clientWidth : VP;
      if (el.scrollWidth > caja + 2 && !ancestroScrollea(el)) {
        push('ALTA', 'tabla-sin-scroll', el,
          'la tabla mide ' + el.scrollWidth + ' px en un contenedor de ' + caja,
          'envolverla en un div con overflow-x:auto');
      }
    }
  });

  /* 5 · SVG: desborda su caja, o queda demasiado chico */
  Array.prototype.slice.call(sec.querySelectorAll('svg')).filter(visible).forEach(sv => {
    const r = sv.getBoundingClientRect();
    const pa = sv.parentElement;
    const caja = pa ? pa.clientWidth : VP;
    if (r.width > caja + 2 && !ancestroScrollea(sv)) {
      push('ALTA', 'svg-desborda', sv, Math.round(r.width) + ' px en una caja de ' + caja,
        'darle width:100% y un viewBox que escale');
    }
    if (r.width > 0 && r.width < 150 && (sv.querySelectorAll('*').length > 6)) {
      push('BAJA', 'svg-chico', sv,
        Math.round(r.width) + 'x' + Math.round(r.height) + ' px con ' + sv.querySelectorAll('*').length + ' nodos',
        'un dibujo con detalle por debajo de 150 px de ancho no se lee');
    }
  });

  /* 4 · controles tactiles donde la regla ya existe: los globos ⓘ, y los botones desnudos */
  /* ⚠️ «DONDE YA EXISTE ESA REGLA» ES LA CLASE `vinfo-btn-44`, Y SOLO ESOS OCHO GLOBOS LA
     TIENEN. Los otros 55 globos son `vinfo-btn` a secas: miden 16x12 px POR DISENO y ya los
     cuenta `check_mobile.js` con su propia severidad. Marcarlos ALTA aca ponia 522 hallazgos
     encima de los veinte que importan — que es exactamente la leccion que `check_mobile.js`
     tiene escrita sobre los checkboxes etiquetados. ALTA queda para la REGRESION: un globo que
     LLEVA la clase de 44 y mide menos.
     ⚠️ Y los globos NO vuelven a contarse en el barrido de botones: son `<button>`, asi que
     cada uno salia dos veces con dos nombres distintos. */
  const areaTactil = el => {
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const alcanza = (x, y) => { const e = document.elementFromPoint(x, y); return e === el || (e && el.contains(e)) };
    if (!alcanza(cx, cy)) return { w: Math.round(r.width), h: Math.round(r.height), tapado: true };
    let iz = 0, de = 0, ar = 0, ab = 0;
    while (iz < 24 && alcanza(cx - iz - 1, cy)) iz++;
    while (de < 24 && alcanza(cx + de + 1, cy)) de++;
    while (ar < 24 && alcanza(cx, cy - ar - 1)) ar++;
    while (ab < 24 && alcanza(cx, cy + ab + 1)) ab++;
    return { w: iz + de, h: ar + ab, tapado: false };
  };
  const globos = Array.prototype.slice.call(sec.querySelectorAll('[data-vinfo]')).filter(visible);
  R.denom.globos = globos.length;
  let globosChicos = 0, globos44 = 0;
  globos.forEach(b => {
    const r = b.getBoundingClientRect();
    const tieneRegla = b.classList.contains('vinfo-btn-44');
    if (tieneRegla) globos44++;
    if (r.width < 44 || r.height < 44) {
      globosChicos++;
      const a = areaTactil(b);
      const med = Math.round(r.width) + 'x' + Math.round(r.height) + ' px de caja, ' +
                  a.w + 'x' + a.h + ' px de area tactil';
      if (tieneRegla) push('ALTA', 'globo-con-regla-44-incumplida', b, med,
        'lleva vinfo-btn-44 y mide menos: es una regresion de esa regla');
      else push('BAJA', 'globo-chico-sin-regla', b, med,
        'globo `vinfo-btn` comun: es el estado conocido que mide check_mobile.js');
    }
  });
  R.denom.globosChicos = globosChicos; R.denom.globosConRegla44 = globos44;
  const botones = Array.prototype.slice.call(
    sec.querySelectorAll('button, [role=button]')).filter(visible)
    .filter(el => !enSVG(el)).filter(el => !el.hasAttribute('data-vinfo'));
  R.denom.botones = botones.length;
  /* ⚠️ EL AREA TACTIL NO ES `getBoundingClientRect`, Y MEDIRLA ASI DA FALSOS POSITIVOS.
     Este archivo extiende el area de varios botones con un `::after` ABSOLUTO, que no ocupa
     lugar en el flujo y que el rect del boton no ve. Medido: `#pac-id-mk-ci` informa 7x11 px de
     caja y su area tactil real es **35x41** -las cuatro esquinas devuelven el propio boton-.
     Con el rect pelado, la sonda marcaba 24 ALTA sobre dos botones que se tocan sin problema.
     Se barre con `elementFromPoint`, que es como la tanda AJ7 midio los globos de 44x44. */
  botones.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0) return;
    if (r.width >= 44 && r.height >= 44) return;
    const a = areaTactil(el);
    const med = Math.round(r.width) + 'x' + Math.round(r.height) + ' px de caja, ' +
                a.w + 'x' + a.h + ' px de area tactil';
    if (a.w < 28 || a.h < 28) {
      push('ALTA', 'boton-desnudo-chico', el, med,
        'agrandar el area tactil con padding, min-width/min-height o un ::after absoluto');
    } else if (a.w < 44 || a.h < 44) {
      push('BAJA', 'boton-menor-de-44', el, med,
        'por debajo del minimo de WCAG 2.5.5, pero alcanzable');
    }
  });

  /* 4b · LAS TARJETAS ⓘ ABIERTAS.
     ⚠️ Un globo CERRADO siempre entra: lo que no entra es su TARJETA, y medir solo el boton
     da cero sobre el defecto que la orden describe (el `co-riesgo-basal` a 390 px). Cada globo
     se abre con su gesto real, se mide y se vuelve a cerrar. */
  R.tarjetas = [];
  globos.forEach(b => {
    const clave = b.getAttribute('data-vinfo') || '';
    let card = null;
    try { b.click() } catch (e) { return }
    /* ⚠️ LA TARJETA ES UNA SOLA Y SE IDENTIFICA POR SU `id`, NO POR UNA CLASE: `_vInfoAbrir`
       reusa `#vinfo-card` para todas las claves. Buscarla por `.vinfo-card` devolvia SIN_TARJETA
       en todas, que en un volcado se lee igual que «no hay tarjetas que medir». */
    const abiertas = Array.prototype.slice.call(document.querySelectorAll('#vinfo-card, .vinfo-card'))
      .filter(c => { const cs = getComputedStyle(c); return cs.display !== 'none' && c.getBoundingClientRect().width > 0 });
    card = abiertas.length ? abiertas[abiertas.length - 1] : null;
    if (card) {
      const r = card.getBoundingClientRect();
      const t = { clave: clave, w: Math.round(r.width), h: Math.round(r.height),
                  izq: Math.round(r.left), der: Math.round(r.right), vp: VP,
                  sw: card.scrollWidth, cw: card.clientWidth,
                  sh: card.scrollHeight, ch: card.clientHeight };
      /* Tres formas distintas de «no entra», y las tres importan. */
      t.saleDerecha = r.right > VP + 1;
      t.saleIzquierda = r.left < -1;
      t.recortaAncho = card.scrollWidth > card.clientWidth + 2;
      /* ⚠️ «RECORTA» Y «SCROLLEA» NO SON LO MISMO, Y SEPARARLOS ES LO QUE HACE VISIBLE EL 2c.
         La tarjeta lleva `overflow:auto`, asi que su contenido nunca se PIERDE: se alcanza
         scrolleando. Con una sola bandera, `co-riesgo-basal` a 390 px —950 px de contenido en
         una caja de 520— daba CERO hallazgos y se leia como «entra». */
      const _ovY = getComputedStyle(card).overflowY;
      const _sobra = card.scrollHeight > card.clientHeight + 2;
      t.recortaAlto = _sobra && !/auto|scroll/.test(_ovY);
      t.scrolleaAlto = _sobra && /auto|scroll/.test(_ovY);
      R.tarjetas.push(t);
      if (t.scrolleaAlto) {
        push('MEDIA', 'tarjeta-info-scrollea', card,
          clave + ': contenido de ' + t.sh + ' px en una caja de ' + t.ch +
          ' (ancho ' + t.w + ' px, viewport ' + VP + ')',
          'se alcanza scrolleando dentro de la tarjeta, pero se lee cortada');
      }
      if (t.saleDerecha || t.saleIzquierda || t.recortaAncho || t.recortaAlto) {
        push('ALTA', 'tarjeta-info-no-entra', card,
          clave + ': ' + t.w + 'x' + t.h + ' px en [' + t.izq + ',' + t.der + '] de un viewport de ' + VP +
          ' | contenido ' + t.sw + 'x' + t.sh + ' en caja ' + t.cw + 'x' + t.ch,
          'el mecanismo de ancho por clave ya existe: darle a esta clave un ancho que entre');
      }
    } else {
      R.tarjetas.push({ clave: clave, SIN_TARJETA: true });
    }
    try { b.click() } catch (e) {}
  });
  R.denom.tarjetas = R.tarjetas.length;

  /* 3 · hermanos de bloque superpuestos */
  const cajas = todos.filter(el => {
    const cs = getComputedStyle(el);
    if (cs.position === 'absolute' || cs.position === 'fixed') return false;
    if (el.children.length > 0) return false;
    if (/^inline/.test(cs.display)) return false;
    const r = el.getBoundingClientRect();
    return r.width > 24 && r.height > 12;
  });
  R.denom.cajas = cajas.length;
  const vistos = {};
  cajas.forEach(el => {
    const hs = el.parentElement
      ? Array.prototype.slice.call(el.parentElement.children).filter(x => x !== el && cajas.indexOf(x) > -1)
      : [];
    hs.forEach(o => {
      const a = el.getBoundingClientRect(), b = o.getBoundingClientRect();
      const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (w <= 0 || h <= 0) return;
      const area = w * h, menor = Math.min(a.width * a.height, b.width * b.height);
      if (menor <= 0 || area / menor < 0.4) return;
      const k = [el.id || el.tagName, o.id || o.tagName].sort().join('|');
      if (vistos[k]) return; vistos[k] = 1;
      push('MEDIA', 'superpuestos', el,
        'se pisan ' + Math.round(area / menor * 100) + ' % con ' + (o.id ? '#' + o.id : o.tagName),
        'revisar el flujo: dos cajas de bloque hermanas no deberian pisarse');
    });
  });
  return R;
}

/* ───────── orquestacion ───────── */
async function main() {
  const md5a = createHash('md5').update(await readFile(RAIZ + '/index.html')).digest('hex');
  const OUT = { archivo: FILE, md5Antes: md5a, cruces: {}, denom: {}, errores: {} };
  const puertas = [];
  PESTANAS.forEach(p => puertas.push({ tab: p[0], rot: p[1] }));
  SUBS.forEach(s => puertas.push({ tab: s[0], subFn: s[1], subVal: s[2], rot: s[3] }));
  const sel = SOLO ? puertas.filter(p => p.tab === SOLO || p.rot.toLowerCase().indexOf(SOLO.toLowerCase()) > -1) : puertas;
  OUT.denom.puertas = sel.length;
  OUT.denom.anchos = ANCHOS.length;
  OUT.denom.temas = TEMAS.length;
  OUT.denom.escenas = ESCENAS.length;
  OUT.denom.cruces = sel.length * ANCHOS.length * TEMAS.length * ESCENAS.length;

  const nav = await chromium.launch({ channel: 'chrome' });
  try {
    for (const w of ANCHOS) {
      for (const tema of TEMAS) {
        for (const escena of ESCENAS) {
          const ctx = await nav.newContext({ viewport: { width: w, height: 900 }, colorScheme: tema });
          const pg = await ctx.newPage();
          const errs = [];
          pg.on('pageerror', e => errs.push('PAGEERROR ' + String(e.message).slice(0, 140)));
          pg.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE ' + m.text().slice(0, 140)) });
          const clave = w + 'px/' + tema + '/' + escena;
          try {
            await pg.goto('file://' + FILE, { waitUntil: 'load', timeout: 120000 });
            const prep = await pg.evaluate(PREPARAR, escena, { timeout: 60000 });
            await pg.waitForTimeout(400);
            const porPuerta = {};
            for (const p of sel) {
              try {
                porPuerta[p.rot] = await pg.evaluate(MEDIR, p, { timeout: 60000 });
              } catch (e) { porPuerta[p.rot] = { ERROR: String(e).slice(0, 180) } }
            }
            OUT.cruces[clave] = { campos: prep.campos, puertas: porPuerta, errores: errs.length,
                                  erroresTxt: errs.slice(0, 3) };
          } catch (e) {
            OUT.cruces[clave] = { ERROR: String(e).slice(0, 200), errores: errs.length };
          }
          await ctx.close();
        }
      }
    }
  } finally { await nav.close() }
  OUT.md5Despues = createHash('md5').update(await readFile(RAIZ + '/index.html')).digest('hex');
  OUT.md5Igual = OUT.md5Antes === OUT.md5Despues;
  console.log(JSON.stringify(OUT));
  console.log('CIERRE_OK');
}
main().catch(e => { console.log(JSON.stringify({ error: String(e).slice(0, 300) })); console.log('CIERRE_OK'); process.exit(1) });
