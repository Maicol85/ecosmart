/**
 * _probe_p38b3_cuerpo.js — el panel de CeiboLink de Configuracion (PANT-38, commit 4).
 * Mide el enlace de descarga, el «?» con su guia, el bloque resumido y que nada del texto viejo
 * se haya perdido: cada via de red tiene que seguir estando, en el panel o en el globo.
 */
(async (TEMA) => {
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const o = { w: innerWidth, temaPedido: TEMA };
  const caja = (e) => { if (!e) return null; const r = e.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height), t: Math.round(r.top), l: Math.round(r.left) }; };
  const g = (id) => document.getElementById(id);
  const lim = (s) => String(s == null ? '' : s).replace(/[\s ]+/g, ' ').trim();

  try { localStorage.setItem('ett_theme', TEMA === 'dia' ? 'light' : 'dark'); } catch (e) {}
  try { if (typeof loadTheme === 'function') loadTheme(); } catch (e) {}
  o.temaPuesto = document.documentElement.classList.contains('light-mode') ? 'dia' : 'noche';
  try { sessionStorage.setItem('ett_auth', '1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  const lo = g('login-overlay');
  if (lo) lo.style.display = 'none';
  try { if (typeof showTab === 'function') showTab('config'); } catch (e) {}
  await esp(380);

  /* ══ (1) EL ENLACE DE DESCARGA ═════════════════════════════════════════════════════════ */
  const d = g('cfg-clnk-descargar');
  o.hayDescargar = !!d;
  o.descargar = d ? {
    tag: d.tagName,
    href: d.getAttribute('href') || '',
    target: d.getAttribute('target') || '',
    rel: d.getAttribute('rel') || '',
    disabled: d.hasAttribute('disabled') || d.getAttribute('aria-disabled') === 'true',
    txt: lim(d.textContent),
    caja: caja(d)
  } : null;
  /* El «proximamente» no puede quedar en NINGUNA parte del panel. */
  const panel = g('cfg-card-clnk') || (d ? d.closest('.cfg-card') : null);
  o.hayPanel = !!panel;
  o.proximamente = panel ? (lim(panel.textContent).indexOf('próximamente') >= 0) : 'SIN PANEL';

  /* ══ (2) EL «?» Y SU GLOBO ═════════════════════════════════════════════════════════════ */
  const btn = document.querySelector('[data-vinfo="clnk-guia"]');
  o.hayBoton = !!btn;
  o.boton = btn ? { txt: lim(btn.textContent), caja: caja(btn),
                    clases: btn.className,
                    aria: btn.getAttribute('aria-label') || '' } : null;
  /* Pegado a «Actualizar»: su hermano anterior. */
  const act = btn && btn.previousElementSibling ? btn.previousElementSibling : null;
  o.vecino = act ? lim(act.textContent).slice(0, 20) : 'SIN VECINO';
  /* ⚠️ EL AREA TACTIL NO SE PUEDE SUPERPONER CON LA DEL VECINO, y es la leccion de AJ9-6: un
     boton de 44x44 metido en un renglon apretado daba un vecino en sus cuatro esquinas y solo el
     propio boton en el centro. Se preguntan los CINCO puntos. */
  if (btn) {
    /* ⚠️ HAY QUE TRAERLO AL VIEWPORT ANTES DE PREGUNTAR. `elementFromPoint` solo responde dentro
       de la ventana visible, y el panel de CeiboLink cae muy abajo en Configuracion: la primera
       version de esta sonda media el boton en `top` 1497 con una ventana de 940 de alto y
       devolvia «FUERA» en los dieciseis cruces, que se lee igual que «el boton no se puede
       tocar». Es la trampa que este archivo ya documenta para los menus bajo el pliegue. */
    btn.scrollIntoView({ block: 'center' });
    await esp(220);
    const r = btn.getBoundingClientRect();
    const pts = [[r.left + r.width / 2, r.top + r.height / 2], [r.left + 2, r.top + 2],
                 [r.right - 2, r.top + 2], [r.left + 2, r.bottom - 2], [r.right - 2, r.bottom - 2]];
    o.tactilBoton = pts.map(p => {
      if (p[0] < 0 || p[1] < 0 || p[0] > innerWidth || p[1] > innerHeight) return 'FUERA';
      const el = document.elementFromPoint(p[0], p[1]);
      return (el === btn || (el && btn.contains(el))) ? 'SI' : 'NO';
    });
    o.tactilOk = o.tactilBoton.every(x => x === 'SI');
  }

  /* ⚠️ EL GLOBO SE ABRE CON EL CLIC REAL. Si la tarjeta se arma al vuelo, leer el registro no
     prueba que el boton la abra. */
  let txtGlobo = '';
  if (btn) {
    btn.click();
    await esp(420);
    const card = g('vinfo-card');
    o.globoAbre = !!(card && card.getBoundingClientRect().height > 0);
    o.globoCaja = caja(card);
    txtGlobo = card ? lim(card.textContent) : '';
    o.globoLargo = txtGlobo.length;
    o.globoTit = card && card.querySelector('h4') ? lim(card.querySelector('h4').textContent) : '';
    /* El cuerpo de todo cartel ⓘ va en el tamanio que declara la tarjeta: regla fija de la casa. */
    o.globoTam = card ? getComputedStyle(card).fontSize : '?';
    try { btn.click(); } catch (e) {}
    await esp(220);
  }
  o.textoGlobo = txtGlobo.slice(0, 60);

  /* ══ (3) EL BLOQUE RESUMIDO ════════════════════════════════════════════════════════════ */
  const cu = g('cfg-clnk-ayuda-cuerpo');
  const det = g('cfg-clnk-ayuda');
  const sum = g('cfg-clnk-ayuda-btn');
  o.idsConservados = { cuerpo: !!cu, details: !!det, summary: !!sum,
                       marcador: det ? det.getAttribute('data-clnk-provisorio') : null };
  const txtCu = cu ? lim(cu.textContent) : '';
  o.resumenLargo = txtCu.length;
  o.resumenParrafos = cu ? cu.querySelectorAll('p').length : 0;

  /* ⚠️ NADA SE PERDIO: cada pieza del texto viejo tiene que estar en el panel O en el globo.
     Es lo que distingue «resumir» de «borrar». */
  /* ⚠️ LA MARCA DE PROVISORIEDAD SE BUSCA POR SU IDEA Y NO POR SU FRASE VIEJA, y es a proposito.
     El texto anterior decia «A confirmar con el ecografo real», y esa forma cae bajo la regla
     fija de la casa de que ningun texto de la app dice que algo esta «a confirmar» o «pendiente
     de revision». La informacion que el medico necesita —que las tres vias estan escritas por
     adelantado y se corrigen al probarlas— se conserva reescrita, que es lo que esa misma regla
     manda cuando la frase sostiene algo util. */
  const PIEZAS = ['cable', 'consultorio', 'pendrive', 'Importar DICOM', '169.254',
                  '192.168.50.10', '255.255.255.0', 'DHCP', 'dirección fija',
                  'se corrigen'];
  const junto = (txtCu + ' ' + txtGlobo).toLowerCase();
  o.piezasFaltantes = PIEZAS.filter(p => junto.indexOf(p.toLowerCase()) < 0);
  o.piezasEnGlobo = PIEZAS.filter(p => txtGlobo.toLowerCase().indexOf(p.toLowerCase()) >= 0).length;

  /* ⚠️ SIN CODIGO DE SEIS DIGITOS A LA VISTA en el globo: decision pendiente del medico. */
  o.globoSinCodigo = txtGlobo.indexOf('6 dígitos') < 0 && txtGlobo.indexOf('seis dígitos') < 0 &&
                     txtGlobo.toLowerCase().indexOf('código de vinculación') < 0;
  /* ⚠️ SIN PASOS DEL INSTALADOR DE WINDOWS, que no esta probado. */
  o.globoSinWindows = txtGlobo.toLowerCase().indexOf('windows') < 0 &&
                      txtGlobo.toLowerCase().indexOf('.exe') < 0 &&
                      txtGlobo.toLowerCase().indexOf('nsis') < 0;

  /* ══ (4) LA CAPA DE COMUNICACION Y LOS ESTADOS, INTACTOS ══════════════════════════════ */
  o.clnkPedir = (typeof clnkPedir === 'function');
  o.clnkRender = (typeof clnkRender === 'function');
  o.clnkLeerEstado = (typeof clnkLeerEstado === 'function');
  o.clnkAyudaToggle = (typeof clnkAyudaToggle === 'function');
  /* El censo de controles del panel: que no haya aparecido ni desaparecido ninguno. */
  o.nControles = panel ? panel.querySelectorAll('input,select,textarea').length : 0;
  o.nConId = panel ? panel.querySelectorAll('input[id],select[id],textarea[id]').length : 0;

  o.scrollDoc = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  return o;
})
