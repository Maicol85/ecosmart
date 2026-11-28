/* GRUPO F - LARS y strain del VD: los textos, el doble signo, el cuadro propio de cada trazo y
   la pre-contraccion. */
(() => {
  const out = { vd: {}, lars: {}, signo: {}, cuadro: {} };
  const T = h => String(h || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  try {
    window._medHerr = 'vd';
    if (typeof _vdIniciar === 'function') _vdIniciar();
    const hv = T(window._vdPanel());
    out.vd.texto = hv.slice(0, 260);
    out.vd.sinAnilloSeptal = hv.indexOf('anillo septal') < 0;
    out.vd.hastaApex = hv.indexOf('hasta el ápex del VD') >= 0;
    out.vd.sigueSinSepto = hv.indexOf('No incluyas el septo') >= 0;
    out.vd.sinNombreGuia = hv.indexOf('ASE 2025') < 0 && hv.indexOf('folio 145') < 0
                            && hv.indexOf('Tabla 1') < 0;
    /* El globo del VD, con la cita. */
    out.vd.hayGlobo = String(window._vdPanel()).indexOf('data-med-info="vd-metodo"') >= 0;
    const NV = (typeof _VD_NOTAS !== 'undefined') ? _VD_NOTAS.join(' | ') : '';
    out.vd.globoCita = NV.indexOf('Mukherjee 2025') >= 0 && NV.indexOf('folio 145') >= 0;
    out.vd.globoSepto = NV.indexOf('El septo no entra') >= 0;
    out.vd.corte = (typeof VD_STRAIN_NORMAL !== 'undefined') ? VD_STRAIN_NORMAL : null;
    /* La ayuda de la herramienta tambien. */
    out.vd.ayuda = String(_MED_COMO.vd).indexOf('hasta el ápex') >= 0
                && String(_MED_COMO.vd).indexOf('al septal') < 0;

    /* ── LARS ── */
    window._medHerr = 'lars';
    if (typeof _larsIniciar === 'function') _larsIniciar();
    const L = window._lars;
    const mk = (cm, loop, cuadro) => ({ bordeCm: cm, imagen: 'loop1', pts: [{x:10,y:10},{x:20,y:20}],
                                        cmPorPx: 0.02, loop: loop, cuadro: cuadro });
    L.trazos.min  = mk(8.0, 0, 3);
    L.trazos.max  = mk(11.0, 0, 9);
    L.trazos.preA = mk(9.5, 0, 14);
    const hl = T(window._larsPanel());
    out.lars.sinNombreGuia = hl.indexOf('ASE 2025') < 0;
    out.lars.describeNormal = hl.indexOf('normal 18 % o más') >= 0;
    out.lars.hayGlobo = String(window._larsPanel()).indexOf('data-med-info="lars-metodo"') >= 0;
    const NL = (typeof _LARS_NOTAS !== 'undefined') ? _LARS_NOTAS.join(' | ') : '';
    out.lars.globoCita = NL.indexOf('Thomas 2025') >= 0 && NL.indexOf('folio 1007') >= 0
                       && NL.indexOf('folio 995') >= 0;
    out.lars.globoCuerda = NL.indexOf('no se suma al per') >= 0;
    out.lars.globoPreA = NL.indexOf('empieza la onda P') >= 0;
    out.lars.globoFA = NL.indexOf('fibrilación auricular') >= 0;
    out.lars.corte = (typeof LARS_RESERVORIO_NORMAL !== 'undefined') ? LARS_RESERVORIO_NORMAL : null;
    /* F7 - cuantos trazados se piden HOY: solo reportar. */
    out.lars.nPasos = (typeof _LARS_PASOS !== 'undefined') ? _LARS_PASOS.length : -1;
    /* El paso solo se dibuja mientras FALTA un trazado: con los tres puestos el panel muestra el
       resultado y no la guia. Es el denominador, y la primera corrida de esta sonda lo midio con
       los tres puestos y dio falso sobre un panel que se porta bien. */
    out.lars.preAEnPanel = (function () {
      L.trazos.preA = null; L.paso = 2;
      const h = T(window._larsPanel());
      const r = { faltaUno: !(L.trazos.min && L.trazos.max && L.trazos.preA),
                  onda: h.indexOf('empieza la onda P') >= 0, fa: h.indexOf('fibrilaci') >= 0 };
      L.trazos.preA = mk(9.5, 0, 14);
      return r;
    })();

    /* ── F2 · el doble signo. Orden INVERTIDO a proposito: L3 por encima de L2. */
    L.trazos.min = mk(8.0, 0, 3); L.trazos.max = mk(9.0, 0, 9); L.trazos.preA = mk(12.5, 0, 14);
    const R = window._larsCalcular();
    out.signo.cond = R ? +R.cond.toFixed(2) : null;
    out.signo.ordenOk = R ? R.ordenOk : null;
    const h2 = T(window._larsPanel());
    out.signo.dobleMenos = h2.indexOf('−−') >= 0 || h2.indexOf('--') >= 0;
    const i = h2.indexOf('otras publicaciones');
    out.signo.frase = i >= 0 ? h2.slice(i, i + 120) : null;
    out.signo.avisaOrden = h2.indexOf('no están en el orden esperado') >= 0;

    /* ── F5 · cada trazo solo en su cuadro: se mide por los fillText del overlay. */
    out.cuadro.nota = 'se mide con la sonda de dibujo aparte';
  } catch (e) { out.ERROR = String(e && e.message || e).slice(0, 300); }
  return out;
})
()
