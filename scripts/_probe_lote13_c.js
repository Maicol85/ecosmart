/* GRUPO C - el texto del NT-proBNP con su globo, y que AF-4 y AF-5 ya no esten. */
(() => {
  const out = {};
  try {
    /* La pestania es `cardioOnco`, y sin abrirla el globo no tiene geometria -0x0- que es como
       esta casa ya pago varias veces una medicion sobre un denominador vacio. Y el bloque puede
       vivir dentro de un acordeon: se abren todos los que lo contengan. */
    try { showTab('cardioOnco'); } catch (e) {}
    const chk0 = document.getElementById('hfaicos_bnp');
    if (chk0) { let n = chk0.parentElement;
      while (n && n !== document.body) {
        try { const cs = getComputedStyle(n);
          if (cs.display === 'none') n.style.display = '';
          if (n.tagName === 'DETAILS') n.open = true; } catch (e) {}
        n = n.parentElement; } }
    const chk = document.getElementById('hfaicos_bnp');
    out.hayCasilla = !!chk;
    const lab = chk ? chk.closest('label') : null;
    const txt = lab ? String(lab.textContent || '').replace(/\s+/g, ' ').trim() : '';
    out.texto = txt;
    out.sin375 = txt.indexOf('375') < 0 && txt.indexOf('600') < 0;
    out.conLimite = txt.indexOf('por encima del l') >= 0 && txt.indexOf('laboratorio local') >= 0;
    out.sinChipCriterio = txt.indexOf('CRITERIO DE ECOSMART') < 0;
    const g = lab ? lab.querySelector('[data-vinfo="hfaicos-bnp"]') : null;
    out.hayGlobo = !!g;
    out.globoSinTitle = g ? !g.hasAttribute('title') : null;
    const rg = g ? g.getBoundingClientRect() : null;
    out.globoCaja = rg ? Math.round(rg.width) + 'x' + Math.round(rg.height) : null;
    /* El globo NO tildea la casilla: es la trampa de un boton dentro de un label. */
    if (g && chk) {
      const antes = chk.checked;
      g.click();
      out.tildeoAlAbrir = (chk.checked !== antes);
      const card = document.getElementById('vinfo-card');
      const cuerpo = card ? String(card.textContent || '') : '';
      out.globoAbre = !!(card && card.style.display !== 'none' && cuerpo.length > 60);
      out.globoCitaLyon = cuerpo.indexOf('Lyon 2022') >= 0;
      out.globoSinNumero = cuerpo.indexOf('375') < 0 && cuerpo.indexOf('600') < 0;
      try { if (typeof vInfoCerrar === 'function') vInfoCerrar(); } catch (e) {}
      if (chk.checked !== antes) chk.checked = antes;
    }
    /* AF-4 y AF-5 en las notas del Simpson. */
    const N = (typeof _SIMP_NOTAS_METODO !== 'undefined') ? _SIMP_NOTAS_METODO : null;
    out.nNotas = N ? N.length : -1;
    const todo = N ? N.join(' | ') : '';
    out.af4a = todo.indexOf('depende de la geometr') < 0;
    out.af4b = todo.indexOf('por separado') < 0;
    out.af5  = todo.indexOf('valores normales con los que se clasifica') < 0;
    /* Y lo que la fuente SI dice se queda. */
    out.quedaProducto = todo.indexOf('producto cruzado') >= 0;
    out.quedaEjeLargo = todo.indexOf('el más largo de las dos ventanas (Lang 2015)') >= 0;
    out.quedaBiplano  = todo.indexOf('Lang 2015 recomienda el biplano.') >= 0;
    out.quedaNoInforme = todo.indexOf('no se integra al informe ni va al PDF') >= 0;
  } catch (e) { out.ERROR = String(e && e.message || e).slice(0, 300); }
  return out;
})
()
