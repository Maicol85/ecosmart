/* GRUPO F5 - cada trazo del LARS se dibuja SOLO en su cuadro. Se mide contando los contornos que
   el overlay dibuja de verdad, con un canvas propio: no se afirma que el codigo contenga el
   predicado -eso seria tautologico, la leccion de MEDIR-5-, se cuenta lo dibujado. */
(() => {
  const out = { denom: {}, porCuadro: [] };
  try {
    /* Un contenedor con los dos canvas que _medPintar busca por id. */
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:-4000px;top:0;width:400px;height:300px;';
    const base = document.createElement('canvas');
    base.id = 'cine-cv'; base.width = 400; base.height = 300;
    base.style.cssText = 'width:400px;height:300px;display:block;';
    const ov = document.createElement('canvas');
    ov.id = 'cine-med'; ov.width = 400; ov.height = 300;
    host.appendChild(base); host.appendChild(ov);
    document.body.appendChild(host);
    out.denom.nodos = !!(document.getElementById('cine-med') && document.getElementById('cine-cv'));

    /* Se cuentan los beginPath del overlay: uno por contorno dibujado. */
    const ctx = ov.getContext('2d');
    let contornos = 0, rotulos = [];
    const bp = ctx.beginPath.bind(ctx), ft = ctx.fillText.bind(ctx);
    ctx.beginPath = function () { contornos++; return bp(); };
    ctx.fillText = function (t, x, y) { rotulos.push(String(t)); return ft(t, x, y); };

    window._medOn = true;
    window._medHerr = 'lars';
    if (typeof _larsIniciar === 'function') _larsIniciar();
    const L = window._lars;
    const mk = (cm, cuadro) => ({ bordeCm: cm, imagen: 'loop1', cmPorPx: 0.02, loop: 0,
                                  cuadro: cuadro,
                                  pts: [{x:10,y:10},{x:60,y:20},{x:40,y:70},{x:10,y:10}] });
    L.trazos.min = mk(8.0, 3); L.trazos.max = mk(11.0, 9); L.trazos.preA = mk(9.5, 14);
    window._cineDatos = { loops: [{ nombre: 'loop1', cuadros: 20 }], i: 0, cuadro: 3, timer: null };
    out.denom.sembrado = !!(window._cineDatos && window._lars && window._lars.trazos.min);

    [3, 9, 14, 7].forEach(c => {
      window._cineDatos.cuadro = c;
      contornos = 0; rotulos = [];
      try { window._medPintar(); } catch (e) { out.ERRPINTAR = String(e && e.message || e).slice(0,140); }
      out.porCuadro.push({ cuadro: c, contornos: contornos,
                           rot: rotulos.filter(t => /AI m|pre-A/.test(t)) });
    });

    /* Y el CONTROL: un trazo SIN cuadro -de antes de este lote- se sigue dibujando. */
    L.trazos.min.cuadro = null; L.trazos.min.loop = null;
    window._cineDatos.cuadro = 7;
    contornos = 0; rotulos = [];
    try { window._medPintar(); } catch (e) {}
    out.viejoSinCuadro = { contornos: contornos, rot: rotulos.filter(t => /AI m|pre-A/.test(t)) };

    /* Y que _contornoLargo GUARDE el cuadro, que es de donde sale todo. */
    window._cineDatos.cuadro = 11;
    const r = (typeof window._contornoLargo === 'function')
      ? window._contornoLargo([{x:10,y:10},{x:60,y:20},{x:40,y:70}], 'la aurícula') : null;
    out.guardaCuadro = r ? { ok: r.ok, cuadro: r.ok ? r.dato.cuadro : null,
                             loop: r.ok ? r.dato.loop : null,
                             motivo: r.ok ? null : String(r.motivo).slice(0, 90) } : 'sin funcion';
    document.body.removeChild(host);
  } catch (e) { out.ERROR = String(e && e.message || e).slice(0, 300); }
  return out;
})
()
