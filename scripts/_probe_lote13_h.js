/* GRUPO H - pantalla completa del visor. Se mide con el visor ABIERTO sobre un cineloop falso. */
(async () => {
  const out = { denom: {}, boton: {}, fs: {}, pausa: {}, teclado: {} };
  const el = id => document.getElementById(id);
  try {
    out.denom.hayFns = ['cineFsToggle', 'cineFsSync', 'cineFsActiva', 'cineFsPausaToggle',
                        '_cineFsDespertar'].every(n => typeof window[n] === 'function');
    /* Se abre el visor con un cineloop sintetico, por el camino real. */
    const cv = document.createElement('canvas'); cv.width = 64; cv.height = 48;
    const c = cv.getContext('2d'); c.fillStyle = '#345'; c.fillRect(0, 0, 64, 48);
    const url = cv.toDataURL('image/jpeg', 0.8);
    /* La forma de un loop es `{nombre, cuadros, d:{frags, cols, filas, msCuadro, regiones}}`,
       que es la que los casos de esta casa ya usan: con los fragmentos en la raiz, _cineAbrir
       revienta en `msCuadro` -denominador vacio-. */
    const loop = { nombre: 'prueba.dcm', cuadros: 6,
                   d: { frags: [url, url, url, url, url, url], cols: 64, filas: 48, msCuadro: 50,
                        regiones: [{ ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:64, y1:48, tipo:1 }] } };
    if (typeof window._cineAbrir === 'function') window._cineAbrir([loop]);
    const ov = el('cine-ov');
    out.denom.visorAbierto = !!(ov && ov.style.display !== 'none');
    /* 1 - EL BOTON existe, esta DEBAJO del de columna y mide lo que un boton de imagen. */
    const bfs = el('cine-fs'), bpan = el('cine-pan'), bmx = el('cine-maxi');
    out.boton.hay = !!bfs;
    out.boton.hayPan = !!bpan;
    if (bfs && bpan) {
      const rf = bfs.getBoundingClientRect(), rp = bpan.getBoundingClientRect();
      out.boton.debajoDeColumna = rf.top >= rp.top;
      out.boton.mismoRacimo = bfs.parentElement === bpan.parentElement;
      out.boton.orden = Array.from(bfs.parentElement.children).map(x => x.id).join(',');
      out.boton.caja = Math.round(rf.width) + 'x' + Math.round(rf.height);
      out.boton.titulo = bfs.getAttribute('title');
      out.boton.pressed = bfs.getAttribute('aria-pressed');
    }
    /* 2 - EL ESTADO LO DICE EL NAVEGADOR: sin pantalla completa, cineFsActiva es falso y la
       clase no esta. En un contexto sin gesto de usuario requestFullscreen se rechaza, asi que
       lo que se mide es el SINCRONIZADOR, que es el dueno del estado. */
    out.fs.activaAlAbrir = window.cineFsActiva();
    out.fs.claseAlAbrir = ov ? ov.classList.contains('cine-fs') : null;
    /* Se fuerza la clase a mano para medir el CSS, y despues se llama al sincronizador, que
       tiene que SACARLA porque el navegador dice que no estamos en pantalla completa. */
    if (ov) ov.classList.add('cine-fs');
    /* La barra de herramientas solo se emite con la medicion activa, asi que su NODO puede no
       existir: la regla se mide en la hoja de estilos, que es la receta de MEDIR-4b. */
    const barra = document.querySelector('#cine-ov [id$="cine-barra"]');
    out.fs.reglaBarra = (function () {
      try {
        for (const h of Array.from(document.styleSheets)) {
          let rs; try { rs = h.cssRules } catch (e) { continue }
          for (const r of Array.from(rs || [])) {
            const t = String(r.selectorText || '');
            if (t.indexOf('cine-fs') >= 0 && t.indexOf('cine-barra') >= 0) return t.slice(0, 120);
          }
        }
      } catch (e) {}
      return null;
    })();
    const ctrl = el('cine-ctrl');
    out.fs.hayCtrl = !!ctrl;
    out.fs.ctrlFlota = ctrl ? getComputedStyle(ctrl).position : null;
    out.fs.barraFlota = barra ? getComputedStyle(barra).position : null;
    /* El autoocultado: con la clase puesta, los controles bajan a opacidad 0 y no reciben toque,
       y el boton de salida NO se esconde. */
    if (ov) ov.classList.add('cine-fs-ocultos');
    /* /!\ LA OPACIDAD SE LEE DESPUES DE UN TURNO: estos controles traen una transicion de 0,22 s
       y un getComputedStyle inmediato devuelve el valor de ARRANQUE, no el de destino. Es la
       trampa que esta casa ya tiene escrita. Lo que no transiciona es pointer-events. */
    out.fs.ctrlOcultoInmediato = ctrl ? getComputedStyle(ctrl).opacity : null;
    await new Promise(r => setTimeout(r, 400));
    out.fs.ctrlOculto = ctrl ? getComputedStyle(ctrl).opacity : null;
    out.fs.ctrlSinToque = ctrl ? getComputedStyle(ctrl).pointerEvents : null;
    out.fs.botonSalidaVisible = bfs ? getComputedStyle(bfs).opacity : null;
    out.fs.tamanioVisible = bmx ? getComputedStyle(bmx).opacity : null;
    if (ov) ov.classList.remove('cine-fs-ocultos');
    out.fs.ms = (typeof CINE_FS_OCULTAR_MS !== 'undefined') ? CINE_FS_OCULTAR_MS : null;
    window.cineFsSync();
    out.fs.syncSacaLaClase = ov ? !ov.classList.contains('cine-fs') : null;
    /* 3 - LA PAUSA AL TOCAR, con sus tres guardas. */
    /* `_vistaA` existe pero su `datos` se alcanza por el accesor de la vista activa. */
    const V = window._vistaA || null;
    const D = window._cineDatos || (V ? V.datos : null);
    out.pausa.hayDatos = !!D;
    out.pausa.conColumnaVisible = window.cineFsPausaToggle(V);     // false: el pedido literal
    if (ov) ov.classList.add('cine-sinpanel');
    const corriaAntes = !!(D && D.timer);
    out.pausa.sinColumna = window.cineFsPausaToggle(V);            // true: ahora si
    out.pausa.cambioElTimer = (!!(D && D.timer)) !== corriaAntes;
    const sen = el('cine-fs-senial');
    out.pausa.haySenial = !!sen;
    out.pausa.glifo = sen ? String(sen.textContent) : null;
    out.pausa.senialSinToque = sen ? getComputedStyle(sen).pointerEvents : null;
    /* Y MIENTRAS SE MIDE no pausa: es la guarda que protege el clic de medicion. */
    /* `medOn` es un ACCESOR sobre la vista activa: se escribe por window, no sobre _vistaA
       -que puede no ser el objeto que _V apunta-. */
    window._medOn = true;
    out.pausa.midiendoLee = !!window._medOn;
    out.pausa.midiendo = window.cineFsPausaToggle(null);           // false
    window._medOn = false;
    if (ov) ov.classList.remove('cine-sinpanel');
    /* 4 - El teclado: se despacha un espacio REAL sobre el documento. */
    const antes = !!(D && D.timer);
    /* /!\ `document.body.focus()` NO MUEVE EL FOCO -el body no es enfocable sin tabindex-, asi
       que el foco se quedaba en el ultimo BOTON que la sonda clickeo y la guarda del espacio
       cortaba con razon: se lee igual que «el espacio no funciona». Se suelta con blur(). */
    try { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); } catch (e) {}
    out.teclado.focoAntes = (document.activeElement && document.activeElement.tagName) || null;
    const ev = new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true, cancelable: true });
    document.dispatchEvent(ev);
    out.teclado.espacioCambio = (!!(D && D.timer)) !== antes;
    out.teclado.loAtendio = ev.defaultPrevented;
    /* Y con el foco en un BOTON el espacio NO se roba. */
    const antes2 = !!(D && D.timer);
    if (bfs) bfs.focus();
    out.teclado.focoBoton = (document.activeElement && document.activeElement.tagName) || null;
    const ev2 = new KeyboardEvent('keydown', { key: ' ', code: 'Space', bubbles: true, cancelable: true });
    document.dispatchEvent(ev2);
    out.teclado.conBotonEnfocado = (!!(D && D.timer)) !== antes2;   // false
    document.body.focus();
    try { window._cineDetener(); } catch (e) {}
    try { window.cineCerrar(); } catch (e) {}
  } catch (e) { out.ERROR = String(e && e.message || e).slice(0, 300); }
  return out;
})
()
