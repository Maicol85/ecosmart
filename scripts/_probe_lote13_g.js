/* GRUPO G - la flecha de la tabla de calculos del SGL. Solo VERIFICA: el diseno acordado ya
   estaba hecho desde PR9. */
(() => {
  const out = { denom: {}, iconos: [], flecha: {} };
  try {
    try { showTab('contractilidad'); } catch (e) {}
    try { showTab('sgl'); } catch (e) {}
    /* La tabla la pinta scRender; se la llama y se abren los ancestros escondidos. */
    const caja = document.getElementById('sgl-calc');
    out.denom.hayCaja = !!caja;
    if (typeof window.scRender === 'function') { try { window.scRender() } catch (e) {} }
    if (caja) { let n = caja;
      while (n && n !== document.body) {
        try { if (getComputedStyle(n).display === 'none') n.style.display = ''; } catch (e) {}
        n = n.parentElement; } }
    /* Se siembran los diecisiete segmentos para que la flecha este encendida. */
    /* La clave de un segmento es su NOMBRE y no su numero: LV3D_SEG_ID es el dueno, y sembrar
       con el indice deja los diecisiete sin dato -el title lo dijo: «Falta: Anterior basal (1)»-,
       que se lee igual que «la flecha no escribe». */
    out.denom.sembro = 0;
    if (typeof window.strainSet === 'function' && typeof LV3D_SEG_ID !== 'undefined') {
      for (let i = 1; i <= 17; i++) {
        try { window.strainSet(LV3D_SEG_ID[i], 2, -16); out.denom.sembro++; } catch (e) {}
      }
    }
    if (typeof window.scRender === 'function') { try { window.scRender() } catch (e) {} }
    const bs = caja ? Array.from(caja.querySelectorAll('button.sc-ico')) : [];
    out.denom.nBotones = bs.length;
    out.iconos = bs.slice(0, 6).map(b => {
      const r = b.getBoundingClientRect();
      const cs = getComputedStyle(b), ca = getComputedStyle(b, '::after');
      const sv = b.querySelector('svg');
      const rs = sv ? sv.getBoundingClientRect() : null;
      return { visible: Math.round(r.width) + 'x' + Math.round(r.height),
               glifo: rs ? Math.round(rs.width) + 'x' + Math.round(rs.height) : (b.textContent || '').trim(),
               toque: ca.width + 'x' + ca.height,
               apagado: b.getAttribute('aria-disabled') === 'true',
               sinDisabled: !b.hasAttribute('disabled'),
               title: (b.getAttribute('title') || '').slice(0, 60) };
    });
    /* La flecha copia el promedio al campo de SGL global. */
    const campo = document.getElementById('sgl_gls') || document.getElementById('sgl');
    out.flecha.hayCampo = !!campo;
    out.flecha.idCampo = campo ? campo.id : null;
    if (campo) campo.value = '';
    const flechas = bs.filter(b => /SGL global/i.test(b.getAttribute('title') || ''));
    out.flecha.nFlechas = flechas.length;
    out.flecha.titulo = flechas.length ? flechas[0].getAttribute('title') : null;
    /* El flujo son DOS pasos y en ese orden: primero la calculadora de la celda, despues la
       flecha. Con la flecha sola el title dice «primero hay que calcularlo», que es el propio
       boton apagado explicando por que no puede -la receta de PR9-1.2-. */
    const calc = bs.filter(b => /^Calcular/.test(b.getAttribute('title') || ''));
    out.flecha.nCalc = calc.length;
    if (calc.length) { calc[0].click(); }
    const bs2 = caja ? Array.from(caja.querySelectorAll('button.sc-ico')) : [];
    const fl2 = bs2.filter(b => /SGL global/i.test(b.getAttribute('title') || ''));
    out.flecha.tituloTrasCalcular = fl2.length ? fl2[0].getAttribute('title') : null;
    out.flecha.apagadaTrasCalcular = fl2.length ? fl2[0].getAttribute('aria-disabled') === 'true' : null;
    if (fl2.length && campo) {
      fl2[0].click();
      out.flecha.escribio = String(campo.value || '');
    }
    /* Y el flujo de FEVI/SGL sigue existiendo. */
    out.flecha.hayFeviSgl = (caja ? String(caja.textContent || '') : '').indexOf('FEVI') >= 0
                          || typeof window.scCalcular === 'function';
  } catch (e) { out.ERROR = String(e && e.message || e).slice(0, 300); }
  return out;
})
()
