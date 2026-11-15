/**
 * _probe_p38b2_cuerpo.js — el menu de Documentos y la lista de Configuracion (PANT-38, commit 3).
 *
 * ⚠️ EL RECORTE SE MIDE POR HIT-TESTING Y NO POR GEOMETRIA, y es la leccion que este archivo ya
 * dejo escrita para el menu de severidad valvular: «sobresale N px» es geometria y NO cambia con
 * el arreglo —el menu ocupaba el mismo rectangulo antes y despues—; lo que cambia es si se
 * PINTA. `document.elementFromPoint` si respeta el `overflow:hidden` del ancestro, asi que
 * preguntar que hay en el centro de cada opcion dice cuantas son alcanzables de verdad.
 */
(async (TEMA) => {
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const o = { w: innerWidth, temaPedido: TEMA };
  const caja = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), t: Math.round(r.top), l: Math.round(r.left) }; };
  const g = (id) => document.getElementById(id);

  try { localStorage.setItem('ett_theme', TEMA === 'dia' ? 'light' : 'dark'); } catch (e) {}
  try { if (typeof loadTheme === 'function') loadTheme(); } catch (e) {}
  o.temaPuesto = document.documentElement.classList.contains('light-mode') ? 'dia' : 'noche';
  try { sessionStorage.setItem('ett_auth', '1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  /* ⚠️ EL OVERLAY DE LOGIN INTERCEPTA `elementFromPoint` Y DA «nada alcanzable» EN TODOS LOS
     ESCENARIOS. Es la trampa que el comentario del menu de severidad ya documenta. */
  const lo = g('login-overlay');
  if (lo) lo.style.display = 'none';

  /* ══ PARTE A · EL MENU DE DOCUMENTOS ════════════════════════════════════════════════════ */
  try { if (typeof showTab === 'function') showTab('informe'); } catch (e) {}
  await esp(320);
  o.hayBoton = !!g('doc-btn');
  o.botonCaja = caja(g('doc-btn'));
  try { if (typeof docMenuToggle === 'function') docMenuToggle(); } catch (e) {}
  await esp(320);

  const menu = g('doc-menu');
  o.hayMenu = !!menu;
  o.menuAbierto = !!(menu && !menu.hasAttribute('hidden'));
  o.menuCaja = caja(menu);
  o.menuOverflowY = menu ? getComputedStyle(menu).overflowY : '?';
  o.menuMaxH = menu ? getComputedStyle(menu).maxHeight : '?';
  o.menuZ = menu ? getComputedStyle(menu).zIndex : '?';

  /* La tarjeta que lo contiene y su overflow computado, con el menu ABIERTO. */
  const card = menu ? menu.closest('.card') : null;
  o.cardCaja = caja(card);
  o.cardOverflow = card ? getComputedStyle(card).overflow : '?';

  /* DENOMINADOR: cuantas opciones tiene el menu. Sin esto, «0 perdidas» sobre un menu vacio se
     lee igual que un arreglo que anda. */
  const ops = menu ? Array.prototype.slice.call(menu.querySelectorAll('button')) : [];
  o.nOpciones = ops.length;

  /* ALCANZABLES: el centro de cada opcion, por hit-testing. Y ademas los dos bordes verticales,
     porque una opcion cortada a la mitad sigue teniendo su centro alcanzable. */
  const alc = [];
  const perdidas = [];
  ops.forEach(b => {
    const r = b.getBoundingClientRect();
    const txt = (b.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 34);
    const pts = [[r.left + r.width / 2, r.top + r.height / 2],
                 [r.left + r.width / 2, r.top + 2],
                 [r.left + r.width / 2, r.bottom - 2]];
    const ok = pts.map(p => {
      if (p[0] < 0 || p[1] < 0 || p[0] > innerWidth || p[1] > innerHeight) return 'FUERA';
      const el = document.elementFromPoint(p[0], p[1]);
      return (el === b || (el && b.contains(el)) || (el && el.contains(b))) ? 'SI' : 'NO';
    });
    if (ok.every(x => x === 'SI')) alc.push(txt); else perdidas.push({ txt: txt, pts: ok, caja: caja(b) });
  });
  o.alcanzables = alc.length;
  o.perdidas = perdidas;

  /* Cuanto del menu queda tapado por el borde superior de su tarjeta: la geometria, que se
     informa pero NO es el criterio. */
  if (o.menuCaja && o.cardCaja) {
    o.sobresaleArriba = Math.max(0, o.cardCaja.t - o.menuCaja.t);
    o.menuDentroPantalla = o.menuCaja.t >= 0 && o.menuCaja.l >= 0 &&
      (o.menuCaja.l + o.menuCaja.w) <= innerWidth + 1;
  }
  try { if (typeof docMenuToggle === 'function') docMenuToggle(); } catch (e) {}
  await esp(180);
  /* Cerrado, la tarjeta tiene que volver a recortar: la regla solo vive con el menu abierto. */
  o.cardOverflowCerrado = card ? getComputedStyle(card).overflow : '?';

  /* ══ PARTE B · LA LISTA DE CONFIGURACION ═══════════════════════════════════════════════ */
  try { if (typeof showTab === 'function') showTab('config'); } catch (e) {}
  await esp(320);
  try { if (typeof cfgDocsRender === 'function') cfgDocsRender(); } catch (e) {}
  await esp(240);
  const cont = g('cfg-docs-lista');
  o.hayLista = !!cont;
  const filas = cont ? Array.prototype.slice.call(cont.querySelectorAll('.cfgdoc-fila')) : [];
  o.nFilas = filas.length;
  o.filas = filas.map(f => {
    const nom = f.querySelector('.cfgdoc-nom');
    const acc = f.querySelector('.cfgdoc-acc');
    const rf = f.getBoundingClientRect();
    const rn = nom ? nom.getBoundingClientRect() : null;
    const ra = acc ? acc.getBoundingClientRect() : null;
    return {
      txt: nom ? (nom.textContent || '').trim().slice(0, 30) : '?',
      title: nom ? (nom.getAttribute('title') || '') : '',
      h: Math.round(rf.height),
      /* UNA LINEA: el nombre y las acciones comparten renglon, o sea que sus centros
         verticales caen a menos de 4 px. */
      unaLinea: !!(rn && ra && Math.abs((rn.top + rn.bottom) / 2 - (ra.top + ra.bottom) / 2) < 4),
      /* LAS ACCIONES A LA DERECHA: su borde derecho pegado al de la fila. */
      aDerecha: !!(ra && rf && (rf.right - ra.right) < 16),
      nomW: rn ? Math.round(rn.width) : 0,
      wrap: f.children.length
    };
  });
  o.todasUnaLinea = o.filas.length > 0 && o.filas.every(f => f.unaLinea);
  o.todasADerecha = o.filas.length > 0 && o.filas.every(f => f.aDerecha);
  o.altoMax = o.filas.length ? Math.max.apply(null, o.filas.map(f => f.h)) : 0;
  /* Las acciones y sus conductas: que sigan siendo las mismas. */
  o.nChk = cont ? cont.querySelectorAll('input[data-cd-vis]').length : 0;
  o.nEditar = cont ? cont.querySelectorAll('button[data-cd-ed]').length : 0;
  o.tactil = cont ? Array.prototype.map.call(cont.querySelectorAll('.cfgdoc-vis,.cfgdoc-acc .btn'),
    e => Math.round(e.getBoundingClientRect().height)) : [];
  o.bajoTactil = o.tactil.filter(h => h > 0 && h < 44).length;
  o.scrollDoc = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  return o;
})
