/* Cuerpo de `_probe_pr4.mjs`. Se pasa como CADENA y se invoca con el tema, asi que vive en su
   propio archivo: los acentos graves de aca son codigo y no hay template literal que cerrar.
   Mide tres cosas del prompt 4 del 18/11:
     · punto 9 — el aviso de independencia en tres bloques, su boton alcanzable y su globo;
     · punto 5 — las cuatro tablas fijas de valores esperados de Referencias;
     · punto 7 — el resumen del posoperatorio con sus ocho lineas de fuente.
   ⚠️ EL TEMA SE PONE COMO LO PONE LA APLICACION: la clave `ett_theme` mas `loadTheme()`. El
   `colorScheme` del contexto de Playwright NO es el tema de esta app —la leccion de PANT-34—, y
   la sonda DEVUELVE el tema que quedo puesto para que no se pueda informar un cruce medido dos
   veces sobre el mismo tema. */
function (tema) {
  var R = { tema: null };
  var esp = new RegExp('[' + String.fromCharCode(32, 9, 10, 13, 160) + ']+', 'g');
  function plano(x) { return String(x == null ? '' : x).replace(esp, ' ').trim(); }
  function sinDesborde(e) { return e ? (e.scrollWidth - e.clientWidth) : -1; }
  try { localStorage.setItem('ett_theme', tema === 'dia' ? 'light' : 'dark'); } catch (e) {}
  try { if (typeof loadTheme === 'function') loadTheme(); } catch (e) {}
  R.tema = document.documentElement.classList.contains('light-mode')
        || document.body.classList.contains('light-mode') ? 'dia' : 'noche';

  /* ── PUNTO 9 · EL AVISO ───────────────────────────────────────────────────────────────── */
  var av = document.getElementById('modalAvisoEco');
  if (av) av.style.display = 'flex';
  var IDS = ['eco-indep-1', 'eco-indep-2', 'eco-indep-3'];
  var nodos = IDS.map(function (id) { return document.getElementById(id); });
  R.avBloques = nodos.filter(Boolean).length;
  R.avLargos = nodos.map(function (n) { return n ? plano(n.textContent).length : -1; });
  R.avDibujitos = nodos.map(function (n, i) {
    var t = n ? plano(n.textContent) : '';
    var d = [String.fromCharCode(9878), String.fromCharCode(55357, 56538), String.fromCharCode(9999)][i];
    return t.indexOf(d) === 0;
  }).filter(Boolean).length;
  var caja = nodos[0] ? nodos[0].parentElement : null;
  R.avCajaHijos = caja ? caja.children.length : -1;
  /* La tarjeta del aviso: entera dentro de la pantalla o desplazable. */
  var tarj = av ? av.firstElementChild : null;
  var bt = av ? av.querySelector('button') : null;
  var rb = bt ? bt.getBoundingClientRect() : null;
  R.avBoton = rb ? (Math.round(rb.width) + 'x' + Math.round(rb.height)) : 'SIN BOTON';
  R.avBotonDentro = rb ? (rb.bottom <= innerHeight + 1 && rb.top >= -1) : false;
  R.avDesplazable = (function () {
    var e = bt ? bt.parentElement : null;
    while (e && e !== document.body) {
      if (e.scrollHeight > e.clientHeight + 2) return true;
      e = e.parentElement;
    }
    return false;
  })();
  R.avAlcanzable = R.avBotonDentro || R.avDesplazable;
  R.avScrollX = av ? sinDesborde(av) : -1;
  /* Ningun texto del aviso recortado: se compara el ancho de desplazamiento del bloque. */
  R.avRecortados = nodos.filter(function (n) {
    return n && (n.scrollWidth - n.clientWidth) > 1;
  }).length;

  /* ── PUNTO 9 · EL GLOBO ──────────────────────────────────────────────────────────────── */
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  ['modalAvisoEco', 'login-overlay'].forEach(function (id) {
    var m = document.getElementById(id); if (m) m.style.display = 'none';
  });
  try { if (typeof indicAbrir === 'function') indicAbrir(); } catch (e) {}
  var b = document.querySelector('[data-vinfo="ev-indep"]');
  R.globoBoton = b ? (function () { var r = b.getBoundingClientRect();
    return Math.round(r.width) + 'x' + Math.round(r.height); })() : 'SIN BOTON';
  if (b) b.click();
  var card = document.getElementById('vinfo-card');
  var ps = card ? Array.prototype.slice.call(card.querySelectorAll('p')) : [];
  R.globoBloques = ps.length;
  R.globoLeeAviso = nodos.every(Boolean) && ps.length === 4
    && ps.slice(0, 3).map(function (x) { return plano(x.textContent); }).join(' | ')
       === nodos.map(function (n) { return plano(n.textContent); }).join(' | ');
  var rc = card ? card.getBoundingClientRect() : null;
  R.globoCaja = rc ? [Math.round(rc.left), Math.round(rc.top), Math.round(rc.width), Math.round(rc.height)].join(',') : 'SIN TARJETA';
  R.globoDentro = rc ? (rc.left >= -1 && rc.top >= -1 && rc.right <= innerWidth + 1 && rc.bottom <= innerHeight + 1) : false;
  R.globoAire = ps.slice(0, 3).every(function (x) { return parseFloat(getComputedStyle(x).marginBottom) >= 8; });
  R.globoCuartoSep = ps.length === 4
    && parseFloat(getComputedStyle(ps[3]).paddingTop) >= 6
    && getComputedStyle(ps[3]).borderTopStyle !== 'none';
  R.globoCuerpoPropio = ps.length ? ps.every(function (x) {
    return getComputedStyle(x).fontSize === getComputedStyle(card).fontSize; }) : false;
  if (b) b.click();
  try { if (typeof indicCerrar === 'function') indicCerrar(); } catch (e) {}

  /* ── PUNTO 5 · LAS CUATRO TABLAS DE REFERENCIAS ──────────────────────────────────────── */
  try { if (typeof showTab === 'function') showTab('refs'); } catch (e) {}
  /* `refSubInit` REUBICA las entradas en sus paneles y muestra uno: sin llamarlo, los paneles
     quedan ocultos y las tablas miden 0 x 0 aunque su propia ficha diga «display:block». Es el
     mismo orden que usa TC-947. */
  try { if (typeof refSubInit === 'function') refSubInit(); } catch (e) {}
  /* ⚠️ LA SUBPESTANIA ES «valv» Y NO «protesicas»: `protesicas` es una ENTRADA dentro de ella.
     Con la clave equivocada `refSubTab` avisa por consola y el panel queda OCULTO, asi que las
     tablas no tienen geometria y el desplazamiento horizontal da 0 — se lee igual que «no
     desborda», que es el denominador vacio que esta casa documenta. */
  try { if (typeof refSubTab === 'function') refSubTab('valv'); } catch (e) {}
  /* ⚠️ Y «protesicas» ES ADEMAS UNA ENTRADA PLEGABLE dentro del panel de Valvulas: hay que
     ABRIRLA antes de abrir cada ficha, o `ref-protesicas` queda en «display:none» y las tablas
     miden 0 x 0 aunque su propia ficha diga «block». Lo destapo el diagnostico de ancestros de
     esta misma sonda: `ref-protesicas:none:0`. */
  try { if (typeof toggleRef === 'function') toggleRef('protesicas', null); } catch (e) {}
  var cont = document.getElementById('ref-protesicas');
  R.protOrden = cont ? Array.prototype.slice.call(cont.querySelectorAll('[onclick]'))
    .map(function (h) { var m = String(h.getAttribute('onclick') || '');
      if (m.indexOf('toggleRef(') !== 0) return null;
      var a = m.indexOf("'"), z = m.indexOf("'", a + 1); return m.slice(a + 1, z); })
    .filter(Boolean).join(',') : 'SIN CONTENEDOR';
  ['pao', 'pm', 'ptric', 'ppulm'].forEach(function (id) {
    var h = cont ? cont.querySelector('[onclick*="toggleRef(\'' + id + '\'"]') : null;
    if (h) h.click();
  });
  R.protTablas = {}; R.protScrollX = {}; R.protFuentes = {}; R.protFilas = {};
  ['pao', 'pm', 'ptric', 'ppulm'].forEach(function (id) {
    var c = document.getElementById('ref-' + id + '-cat');
    var ts = c ? c.querySelectorAll('table') : [];
    R.protTablas[id] = ts.length;
    R.protFilas[id] = c ? c.querySelectorAll('tbody tr').length : -1;
    /* El envoltorio de cada tabla desplaza DENTRO de si mismo, que es el patron de celular de
       PANT-25: lo que no puede desplazar es el documento. */
    R.protScrollX[id] = c ? Array.prototype.slice.call(ts).map(function (t) {
      return sinDesborde(t.parentElement) > 1 ? 'si' : 'no'; }).join(',') : 'SIN';
    /* DENOMINADOR del desplazamiento: la ficha tiene que estar ABIERTA y la tabla tiene que ser
       mas ancha que su envoltorio. Sin estas dos cifras, un 'no' se lee igual venga de «entra» o
       de «no tiene geometria». */
    var fi = document.getElementById('ref-' + id);
    R.protVis = R.protVis || {}; R.protAnchos = R.protAnchos || {};
    R.protVis[id] = fi ? getComputedStyle(fi).display : 'SIN FICHA';
    R.protAnchos[id] = Array.prototype.slice.call(ts).map(function (t) {
      var w = t.parentElement;
      return (w ? w.clientWidth : -1) + '<' + t.scrollWidth; }).join(' · ');
    /* Quien esconde: el primer ancestro con display none o sin ancho, con su id. */
    R.protQuien = R.protQuien || {};
    R.protQuien[id] = (function () {
      var e = ts.length ? ts[0] : null, out = [];
      while (e && e !== document.documentElement) {
        var cs = getComputedStyle(e);
        out.push((e.id || e.tagName) + ':' + cs.display + ':' + e.clientWidth);
        if (out.length > 7) break;
        e = e.parentElement;
      }
      return out.join(' | ');
    })();
    R.protFuentes[id] = c ? Array.prototype.slice.call(c.querySelectorAll('div'))
      .filter(function (d) { return plano(d.textContent).indexOf('Fuente: ') === 0
                                    && d.children.length === 0; }).length : -1;
  });
  R.protAEO = (function () {
    var t = ['pao', 'pm', 'ptric', 'ppulm'].map(function (id) {
      var c = document.getElementById('ref-' + id + '-cat'); return c ? c.textContent : ''; }).join(' ');
    return { aeo: t.indexOf('AEO') > -1, eoa: t.indexOf('EOA') > -1 };
  })();

  /* ── PUNTO 7 · EL RESUMEN DEL POSOPERATORIO ──────────────────────────────────────────── */
  try { if (typeof refSubTab === 'function') refSubTab('hemo'); } catch (e) {}
  var fp = document.getElementById('ref-pop');
  if (fp && getComputedStyle(fp).display === 'none') {
    var hp = fp.previousElementSibling; if (hp) hp.click();
  }
  var res = document.getElementById('ref-pop-resumen');
  R.popResumen = !!res;
  R.popBloques = res ? Array.prototype.slice.call(res.querySelectorAll('div'))
    .filter(function (d) { return plano(d.textContent).indexOf('Fuente: ') === 0
                                  && d.children.length === 0; }).length : -1;
  R.popDiez = res ? Array.prototype.slice.call(res.querySelectorAll('div'))
    .filter(function (d) { return plano(d.textContent).indexOf('Fuente: ') === 0
      && d.children.length === 0 && getComputedStyle(d).fontSize === '10px'; }).length : -1;
  R.popAntesDeLaTabla = (function () {
    if (!fp || !res) return false;
    var t = fp.querySelector('table');
    return !!t && (res.compareDocumentPosition(t) & 4) === 4;
  })();
  R.popTr = fp ? fp.querySelectorAll('table tr').length : -1;
  R.popScrollX = res ? sinDesborde(res) : -1;

  /* ── EL DOCUMENTO NO DESPLAZA EN HORIZONTAL ─────────────────────────────────────────── */
  R.docScrollX = Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth);
  return R;
}
