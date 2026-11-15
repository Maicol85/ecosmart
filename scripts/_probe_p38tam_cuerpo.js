/**
 * _probe_p38tam_cuerpo.js — cuanto del recuadro ocupa el corazon del 3D (PANT-38, commit 2).
 *
 * Recorre `_lv3d.polis` —los poligonos CON SUS COORDENADAS DE PANTALLA, que es lo que
 * `lv3dPintar` devuelve y `lv3dDibujar` guarda— y saca el rectangulo que los contiene, en las
 * cuatro vistas que el medico nombra y en varias fases, con la DIASTOLE FANTASMA prendida.
 *
 * ⚠️ SE MIDE CON EL PEOR CASO DE TAMANIO, NO CON UNO CUALQUIERA. `lv3dEscalaPorDD` topa en 1,6
 * (`dd/48` acotado), asi que con un DDVI de 95 mm —dentro de la banda [20,100] que la app
 * acepta— el corazon sale lo mas grande que puede salir. Medir con un DDVI normal daria margen
 * de sobra y el factor que se elija recortaria el ventriculo dilatado, que es justo el que el
 * medico necesita ver entero.
 *
 * ⚠️ `_lv3d` NO ESTA EN `window`: es un `const` de nivel de script, asi que se lo alcanza por su
 * nombre pelado. Con `window._lv3d` el guardia corta y la medicion sale sobre un denominador
 * vacio, que se lee igual que «todo bien».
 */
(async (DD) => {
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const o = { dd: DD };
  try { sessionStorage.setItem('ett_auth', '1'); } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  const lo = document.getElementById('login-overlay');
  if (lo) lo.style.display = 'none';
  try { if (typeof showTab === 'function') showTab('contractilidad'); } catch (e) {}
  await esp(120);
  try {
    const hdr = document.querySelector('#sacc-contr .sacc-hdr');
    if (hdr && hdr.getAttribute('aria-expanded') !== 'true') hdr.click();
  } catch (e) {}
  await esp(240);

  /* El DDVI, por su campo y disparando el evento que la app escucha. */
  const campo = document.getElementById('ddfvi');
  o.hayCampo = !!campo;
  if (campo) {
    campo.value = String(DD);
    campo.dispatchEvent(new Event('input', { bubbles: true }));
    campo.dispatchEvent(new Event('change', { bubbles: true }));
  }
  await esp(420);
  try { if (typeof lv3dAbrir === 'function') lv3dAbrir(); } catch (e) {}
  await esp(600);

  /* DENOMINADOR: que el 3D tenga tamanio y poligonos. Sin esto el bbox da ceros y se lee igual
     que «el corazon entra comodo». */
  o.hayTamano = (typeof _lv3d !== 'undefined') ? !!_lv3d.hayTamano : 'SIN _lv3d';
  o.escala = (typeof lv3dEscalaPorDD === 'function') ? lv3dEscalaPorDD(DD) : 'ERR';
  o.ESC = (typeof LV3D_ESC !== 'undefined') ? LV3D_ESC : 'ERR';
  o.W = (typeof LV3D_W !== 'undefined') ? LV3D_W : 'ERR';
  o.H = (typeof LV3D_H !== 'undefined') ? LV3D_H : 'ERR';

  /* La diastole fantasma PRENDIDA, que es lo que el pedido fija. */
  const fant = document.querySelector('#lv3d-panel .lv3d-fantasma');
  o.hayFantasma = !!fant;
  if (fant && !fant.checked) { fant.checked = true; fant.dispatchEvent(new Event('change', { bubbles: true })); }
  await esp(260);

  /* El rectangulo que contiene TODO lo dibujado del corazon, en coordenadas logicas del canvas. */
  const bbox = () => {
    if (typeof _lv3d === 'undefined' || !_lv3d.polis || !_lv3d.polis.length) return null;
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, n = 0;
    _lv3d.polis.forEach(p => {
      const s = p && p.s;
      if (!s || !s.length) return;
      s.forEach(q => {
        if (!q || q.length < 2) return;
        n++;
        if (q[0] < x0) x0 = q[0]; if (q[0] > x1) x1 = q[0];
        if (q[1] < y0) y0 = q[1]; if (q[1] > y1) y1 = q[1];
      });
    });
    if (!n) return null;
    return { x0: Math.round(x0 * 10) / 10, y0: Math.round(y0 * 10) / 10,
             x1: Math.round(x1 * 10) / 10, y1: Math.round(y1 * 10) / 10,
             w: Math.round((x1 - x0) * 10) / 10, h: Math.round((y1 - y0) * 10) / 10,
             nPuntos: n, nPolis: _lv3d.polis.length };
  };

  /* Una fase concreta, sin depender del bucle: se fija la fase y se repinta. */
  const enFase = async (f) => {
    try { _lv3d.fase = f; if (typeof lv3dDibujar === 'function') lv3dDibujar(); } catch (e) {}
    await esp(60);
    return bbox();
  };

  const vista = async (q) => {
    try {
      const b = document.querySelector('#lv3d-panel .lv3d-vista[data-lv3d-vista="' + q + '"]');
      if (b) b.click();
    } catch (e) {}
    await esp(220);
    const fs = [0, 0.25, 0.5, 0.75, 1];
    const cajas = [];
    for (let i = 0; i < fs.length; i++) cajas.push(await enFase(fs[i]));
    const ok = cajas.filter(Boolean);
    if (!ok.length) return { error: 'SIN POLIGONOS' };
    return {
      fases: cajas,
      /* El peor caso de las cinco fases: lo que decide si algo se sale del recuadro. */
      peor: { x0: Math.min.apply(null, ok.map(c => c.x0)), y0: Math.min.apply(null, ok.map(c => c.y0)),
              x1: Math.max.apply(null, ok.map(c => c.x1)), y1: Math.max.apply(null, ok.map(c => c.y1)) }
    };
  };

  o.vistas = {};
  o.vistas.frente = await vista('frente');
  o.vistas.der = await vista('der');
  o.vistas.izq = await vista('izq');

  /* Coronarias: el boton prende el modo y con el las arterias entran al bbox. */
  try {
    const bc = document.getElementById('lv3d-coro-btn') ||
               Array.prototype.find.call(document.querySelectorAll('#lv3d-panel button'),
                 b => (b.textContent || '').indexOf('Coronarias') >= 0);
    o.hayCoro = !!bc;
    if (bc) bc.click();
  } catch (e) { o.hayCoro = 'ERR'; }
  await esp(420);
  o.vistas.coronarias = await vista('frente');

  /* El giro libre: se rota a mano por varios angulos y se toma el peor. Un giro cualquiera puede
     sacar mas del recuadro que las tres vistas fijas. */
  const giros = [];
  for (let a = 0; a < 360; a += 30) {
    try {
      const r = a * Math.PI / 180;
      const c = Math.cos(r), s = Math.sin(r);
      _lv3d.R = [[c, 0, s], [0, 1, 0], [-s, 0, c]];
      if (typeof lv3dDibujar === 'function') lv3dDibujar();
    } catch (e) {}
    await esp(40);
    const b = bbox();
    if (b) giros.push({ a: a, x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1 });
  }
  o.giros = giros;
  if (giros.length) {
    o.giroPeor = { x0: Math.min.apply(null, giros.map(g => g.x0)),
                   y0: Math.min.apply(null, giros.map(g => g.y0)),
                   x1: Math.max.apply(null, giros.map(g => g.x1)),
                   y1: Math.max.apply(null, giros.map(g => g.y1)) };
  }

  /* El margen que sobra del lado mas justo, en px logicos, y el factor que lo consumiria. */
  const todos = [];
  Object.keys(o.vistas).forEach(k => { const v = o.vistas[k]; if (v && v.peor) todos.push(v.peor); });
  if (o.giroPeor) todos.push(o.giroPeor);
  if (todos.length) {
    const W = o.W, H = o.H, cx = W / 2, cy = H / 2 - 8;
    const X0 = Math.min.apply(null, todos.map(t => t.x0)), X1 = Math.max.apply(null, todos.map(t => t.x1));
    const Y0 = Math.min.apply(null, todos.map(t => t.y0)), Y1 = Math.max.apply(null, todos.map(t => t.y1));
    o.global = { x0: Math.round(X0 * 10) / 10, y0: Math.round(Y0 * 10) / 10,
                 x1: Math.round(X1 * 10) / 10, y1: Math.round(Y1 * 10) / 10,
                 w: Math.round((X1 - X0) * 10) / 10, h: Math.round((Y1 - Y0) * 10) / 10 };
    o.fraccion = { ancho: Math.round((X1 - X0) / W * 1000) / 10, alto: Math.round((Y1 - Y0) / H * 1000) / 10 };
    /* ⚠️ EL FACTOR SE SACA DEL CENTRO DE PROYECCION Y NO DEL BORDE DEL BBOX. El dibujo escala
       alrededor de (cx, cy), asi que lo que limita es la distancia del centro al borde mas
       lejano del corazon contra la distancia del centro al borde del recuadro. */
    const dIzq = cx - X0, dDer = X1 - cx, dArr = cy - Y0, dAba = Y1 - cy;
    o.margen = { izq: Math.round((cx - 0 - dIzq) * 10) / 10, der: Math.round((W - cx - dDer) * 10) / 10,
                 arr: Math.round((cy - 0 - dArr) * 10) / 10, aba: Math.round((H - cy - dAba) * 10) / 10 };
    o.factorMax = Math.round(Math.min(
      dIzq > 0 ? cx / dIzq : 99, dDer > 0 ? (W - cx) / dDer : 99,
      dArr > 0 ? cy / dArr : 99, dAba > 0 ? (H - cy) / dAba : 99) * 1000) / 1000;
  }
  /* ══ LOS ROTULOS DE EJES, MEDIDOS DE VERDAD ═══════════════════════════════════════════════
     Se envuelve `fillText` para anotar que se escribio, donde, con que anclaje y con que ancho
     medido por el propio motor. Medirlo asi —y no calculando a mano— es lo unico que distingue
     «se lee entero» de «yo creo que entra»: el ancho de «Punta» depende de la fuente del motor.
     ⚠️ SE RESTITUYE SIEMPRE, en un `finally`: dejar `fillText` envuelto deja el canvas de la app
     escribiendo en un registro para el resto de la pagina. */
  o.rotulos = {};
  const CRC = CanvasRenderingContext2D.prototype;
  const orig = CRC.fillText;
  const medirRot = async (q) => {
    const reg = [];
    CRC.fillText = function (t, x, y) {
      try {
        const s = String(t);
        if (s === 'Sep' || s === 'Lat' || s === 'Ant' || s === 'Inf' || s === 'Punta') {
          const w = this.measureText(s).width;
          const al = this.textAlign;
          const x0 = al === 'center' ? x - w / 2 : (al === 'right' || al === 'end') ? x - w : x;
          reg.push({ t: s, x0: Math.round(x0 * 10) / 10, x1: Math.round((x0 + w) * 10) / 10,
                     y: Math.round(y * 10) / 10, al: al, w: Math.round(w * 10) / 10 });
        }
      } catch (e) {}
      return orig.apply(this, arguments);
    };
    try {
      const b = document.querySelector('#lv3d-panel .lv3d-vista[data-lv3d-vista="' + q + '"]');
      if (b) b.click();
      await esp(220);
      if (typeof lv3dDibujar === 'function') lv3dDibujar();
      await esp(80);
    } finally { CRC.fillText = orig; }
    /* ⚠️ SE QUEDA CON EL ULTIMO CUADRO Y NO CON TODO LO ANOTADO. El bucle de animacion repinta
       mientras la sonda mide, asi que el registro trae los cinco rotulos una vez POR CUADRO —19
       cuadros dan 95 anotaciones— y un detector de solapes ingenuo empareja cada rotulo con sus
       propias copias de los otros cuadros: daba 180 pares «Lat/Lat» sobre un dibujo impecable.
       Se toma la ULTIMA aparicion de cada uno de los cinco, que es el cuadro que quedo pintado. */
    const ult = {};
    reg.forEach(r => { ult[r.t] = r; });
    const fin = Object.keys(ult).map(k => ult[k]);
    const W = o.W, H = o.H;
    const fuera = fin.filter(r => r.x0 < 0 || r.x1 > W || r.y < 8 || r.y > H - 2)
                     .map(r => r.t + ' x[' + r.x0 + ',' + r.x1 + '] y' + r.y);
    const pisan = [];
    for (let i = 0; i < fin.length; i++) for (let j = i + 1; j < fin.length; j++) {
      const a = fin[i], c = fin[j];
      if (Math.abs(a.y - c.y) < 12 && a.x0 < c.x1 - 1 && c.x0 < a.x1 - 1)
        pisan.push(a.t + '/' + c.t);
    }
    return { n: reg.length, nUnicos: fin.length, reg: fin, fuera: fuera, pisan: pisan };
  };
  try {
    o.rotulos.frente = await medirRot('frente');
    o.rotulos.der = await medirRot('der');
    o.rotulos.izq = await medirRot('izq');
  } catch (e) { o.rotulos.error = String(e).slice(0, 120); }
  finally { CRC.fillText = orig; }

  /* ¿El corazon se sale del recuadro en algun lado? Es la condicion del commit 2. */
  if (o.global) {
    o.seSale = { izq: o.global.x0 < 0, der: o.global.x1 > o.W,
                 arr: o.global.y0 < 0, aba: o.global.y1 > o.H };
    o.aire = { izq: o.global.x0, der: Math.round((o.W - o.global.x1) * 10) / 10,
               arr: o.global.y0, aba: Math.round((o.H - o.global.y1) * 10) / 10 };
    /* La brujula vive en un circulo de radio 32 alrededor de (ox, H-48). Que el corazon no se le
       monte encima se mide por el borde IZQUIERDO del corazon contra el derecho de la brujula. */
    o.brujulaLibre = o.global.x0 > 110;
  }
  return o;
})
