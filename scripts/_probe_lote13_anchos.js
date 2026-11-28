/* Los tres anchos de lo que cambio visualmente: el racimo apilado del visor (H), el boton de la
   tabla de calculos (G) y el globo del NT-proBNP (C). El mapa (A) y «Cambiar vista» (E) se miden
   en sus propias sondas, que no dependen del ancho. */
(() => {
  const out = {};
  try {
    /* ── H: el racimo del visor ── */
    const cvj = document.createElement('canvas'); cvj.width = 64; cvj.height = 48;
    const cj = cvj.getContext('2d'); cj.fillStyle = '#345'; cj.fillRect(0, 0, 64, 48);
    const url = cvj.toDataURL('image/jpeg', 0.8);
    window._cineAbrir([{ nombre: 'p.dcm', cuadros: 6,
      d: { frags: [url, url, url, url, url, url], cols: 64, filas: 48, msCuadro: 50,
           regiones: [{ ux:3, uy:3, dx:0.05, dy:0.05, x0:0, y0:0, x1:64, y1:48, tipo:1 }] } }]);
    const bfs = document.getElementById('cine-fs'), bpan = document.getElementById('cine-pan'),
          bmx = document.getElementById('cine-maxi');
    const rac = bfs ? bfs.parentElement : null;
    const rr = rac ? rac.getBoundingClientRect() : null;
    const rf = bfs ? bfs.getBoundingClientRect() : null;
    const rp = bpan ? bpan.getBoundingClientRect() : null;
    const img = document.getElementById('cine-recorte');
    const ri = img ? img.getBoundingClientRect() : null;
    out.visor = {
      dir: rac ? getComputedStyle(rac).flexDirection : null,
      orden: rac ? Array.from(rac.children).map(x => x.id).join(',') : null,
      fs: rf ? Math.round(rf.width) + 'x' + Math.round(rf.height) : null,
      debajo: !!(rf && rp && rf.top >= rp.bottom - 1),
      racimo: rr ? Math.round(rr.width) + 'x' + Math.round(rr.height) : null,
      /* El racimo no puede taparle mas de su propio ancho a la imagen ni salirse de ella. */
      dentroDeLaImagen: !!(rr && ri && rr.right <= ri.right + 1 && rr.top >= ri.top - 1
                            && rr.bottom <= ri.bottom + 1),
      imagen: ri ? Math.round(ri.width) + 'x' + Math.round(ri.height) : null,
      /* Y los tres se tocan en 44 px. */
      tactiles: [bmx, bpan, bfs].filter(Boolean).map(b => {
        const r = b.getBoundingClientRect(); return Math.round(r.width) + 'x' + Math.round(r.height);
      }).join(' ')
    };
    try { window._cineDetener(); } catch (e) {}
    try { window.cineCerrar(); } catch (e) {}
    /* ── G: la tabla de calculos ── */
    try { showTab('contractilidad'); } catch (e) {}
    const caja = document.getElementById('sgl-calc');
    if (caja && typeof window.scRender === 'function') {
      try { window.scRender(); } catch (e) {}
      let n0 = caja;
      while (n0 && n0 !== document.body) {
        try { if (getComputedStyle(n0).display === 'none') n0.style.display = ''; } catch (e) {}
        n0 = n0.parentElement;
      }
      const rc = caja.getBoundingClientRect();
      out.tabla = { caja: Math.round(rc.width) + 'x' + Math.round(rc.height),
                    desborda: Math.round(caja.scrollWidth - caja.clientWidth) };
    }
    /* ── C: el globo del NT-proBNP ── */
    try { showTab('cardioOnco'); } catch (e) {}
    const chk = document.getElementById('hfaicos_bnp');
    if (chk) {
      let n1 = chk.parentElement;
      while (n1 && n1 !== document.body) {
        try { if (getComputedStyle(n1).display === 'none') n1.style.display = ''; } catch (e) {}
        try { if (n1.tagName === 'DETAILS') n1.open = true; } catch (e) {}
        n1 = n1.parentElement;
      }
      const g = chk.closest('label').querySelector('[data-vinfo="hfaicos-bnp"]');
      const rgg = g ? g.getBoundingClientRect() : null;
      out.bnp = { globo: rgg ? Math.round(rgg.width) + 'x' + Math.round(rgg.height) : null,
                  dentro: !!(rgg && rgg.right <= window.innerWidth + 1 && rgg.left >= -1) };
    }
    out.doc = { scrollX: Math.round(document.documentElement.scrollWidth - document.documentElement.clientWidth) };
  } catch (e) { out.ERROR = String(e && e.message || e).slice(0, 250); }
  return out;
})
()
