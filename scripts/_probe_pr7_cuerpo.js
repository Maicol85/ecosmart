(() => {
  const R = { err: [] };
  const T = (n, f) => { try { R[n] = f(); } catch (e) { R[n] = 'ERR ' + String(e && e.message || e).slice(0, 120); } };
  const seg = id => document.querySelector('#sgl-svg-bullseye path[data-strainid="' + id + '"]')
                 || document.querySelector('#sgl-svg-bullseye circle[data-strainid="' + id + '"]');
  const txt = id => document.querySelector('#sgl-svg-bullseye text[data-strainid="' + id + '"]');
  const caja = () => document.querySelector('[data-strain-caja]');

  /* La pestania SGL: se abre por su boton, y el dibujo lo arma sglOnShow. */
  T('abrir', () => {
    const b = Array.from(document.querySelectorAll('.tab-btn'))
      .find(x => (x.textContent || '').indexOf('SGL') >= 0);
    if (b) b.click();
    if (typeof window.secToggle === 'function') {
      const h = document.querySelector('#sacc-sgl .sacc-hdr');
      if (h && h.getAttribute('aria-expanded') !== 'true') h.click();
    }
    if (typeof window.sglOnShow === 'function') window.sglOnShow();
    return !!document.getElementById('sgl-svg-bullseye');
  });

  // ── 1) LA PALETA y los TRAMOS ──
  T('pal', () => window.STRAIN_PAL.map(p => p.color).join(','));
  T('palTxt', () => window.STRAIN_PAL.map(p => p.txt).join(','));
  T('marcas', () => window.STRAIN_MARCAS.join(','));
  T('migra', () => window.STRAIN_MIGRA.join(','));
  T('ver', () => window.STRAIN_VER);
  T('tramos', () => [-30, -20, -19.9, -15, -10.1, -10, -5, -0.1, 0, 4.9, 5, 10, 15, 19.9, 20, 25]
    .map(v => v + '=' + window.strainTramoDe(v)).join(' '));
  T('colorDeTramo', () => [-20, -15, -0.1, 0, 4.9, 5, 20, -30, 25]
    .map(v => v + '>' + window.STRAIN_PAL[window.strainTramoDe(v)].color).join(' '));

  // ── 2) ARRANQUE SIN DATO y CICLO de nueve estados ──
  T('arranque', () => {
    window.sglReset();
    const ps = Array.from(document.querySelectorAll('#sgl-svg-bullseye .strain-seg'));
    const ts = Array.from(document.querySelectorAll('#sgl-svg-bullseye text[data-strainid]'));
    const gris = window.STRAIN_PAL[0].color;
    return { segs: ps.length, textos: ts.length,
      todosGrises: ps.every(p => String(p.getAttribute('fill')).toUpperCase() === gris.toUpperCase()),
      todosGuion: ts.every(t => t.textContent === '–'),
      distintos: Array.from(new Set(ps.map(p => p.getAttribute('fill')))).length };
  });
  T('ciclo', () => {
    window.sglReset();
    const p = seg('basal_anterior'); const out = [];
    for (let i = 0; i < 10; i++) { out.push(p.getAttribute('fill')); p.dispatchEvent(new MouseEvent('click', { bubbles: true })); }
    return { visto: out.join(','), nueve: Array.from(new Set(out.slice(0, 9))).length,
      vuelve: out[9] === out[0], esperado: window.STRAIN_PAL.map(x => x.color).join(',') };
  });
  T('cicloBorraNum', () => {
    window.sglReset();
    window.strainEscribir('mid_anterior', '-12');
    const antes = { fill: seg('mid_anterior').getAttribute('fill'), t: txt('mid_anterior').textContent };
    seg('mid_anterior').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return { antes, despues: { fill: seg('mid_anterior').getAttribute('fill'), t: txt('mid_anterior').textContent } };
  });

  // ── 3) EL MODO NUMERICO ──
  T('btn', () => {
    const b = document.getElementById('sgl-num-toggle');
    const r = b ? b.getBoundingClientRect() : null;
    return { hay: !!b, rot: b ? (b.textContent || '').trim() : '',
      pressed: b ? b.getAttribute('aria-pressed') : '', on: window.strainNumModoOn(),
      w: r ? Math.round(r.width) : 0, h: r ? Math.round(r.height) : 0,
      info: !!document.querySelector('[data-vinfo="sgl-num"]') };
  });
  T('infoTxt', () => {
    const b = document.querySelector('[data-vinfo="sgl-num"]');
    if (!b) return 'SIN BOTON';
    b.click();
    const c = document.getElementById('vinfo-card');
    const t = c ? (c.innerText || c.textContent || '') : 'SIN TARJETA';
    const bb = b.getBoundingClientRect();
    try { if (typeof window.vInfoCerrar === 'function') window.vInfoCerrar(); } catch (e) {}
    return { txt: String(t).replace(/\s+/g, ' ').trim(), w: Math.round(bb.width), h: Math.round(bb.height) };
  });
  T('modoApagadoCicla', () => {
    window.sglReset();
    if (window.strainNumModoOn()) window.strainNumToggle();
    seg('apex').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    return { caja: !!caja(), fill: seg('apex').getAttribute('fill') };
  });
  T('modoEncendidoAbreCaja', () => {
    window.sglReset();
    if (!window.strainNumModoOn()) window.strainNumToggle();
    const b = document.getElementById('sgl-num-toggle');
    seg('basal_inferior').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const c = caja();
    const r = c ? c.getBoundingClientRect() : null;
    const out = { pressed: b.getAttribute('aria-pressed'), hay: !!c, conId: c ? !!c.id : null,
      w: r ? Math.round(r.width) : 0, h: r ? Math.round(r.height) : 0,
      aria: c ? c.getAttribute('aria-label') : '' };
    if (c) { c.value = '-12,4'; c.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); }
    out.trasEnter = { caja: !!caja(), fill: seg('basal_inferior').getAttribute('fill'),
      t: txt('basal_inferior').textContent, num: window.strainNumDe('basal_inferior') };
    return out;
  });
  T('parse', () => ['18', '-18', '+18', '−18', '18,5', '18.5', '+2,5', '0', '', 'abc', '-30', '+25', ' -7 ']
    .map(v => JSON.stringify(v) + '=' + window.strainParseNum(v)).join(' '));
  T('escribirVarios', () => {
    window.sglReset();
    const casos = { 'basal_anterior': '18', 'mid_anterior': '+8', 'apical_anterior': '−3,5',
                    'basal_inferior': '-30', 'mid_inferior': '+25', 'apex': '0' };
    const out = {};
    Object.keys(casos).forEach(k => {
      window.strainEscribir(k, casos[k]);
      out[k] = casos[k] + ' -> ' + seg(k).getAttribute('fill') + ' / ' + txt(k).textContent
             + ' / txt=' + txt(k).getAttribute('fill');
    });
    return out;
  });
  T('borrarVuelveSinDato', () => {
    window.strainEscribir('basal_anterior', '-18');
    const a = { fill: seg('basal_anterior').getAttribute('fill'), t: txt('basal_anterior').textContent };
    window.strainEscribir('basal_anterior', '');
    return { antes: a, despues: { fill: seg('basal_anterior').getAttribute('fill'), t: txt('basal_anterior').textContent } };
  });
  T('escapeCancela', () => {
    window.sglReset();
    if (!window.strainNumModoOn()) window.strainNumToggle();
    window.strainEscribir('mid_inferolateral', '-14');
    const antes = seg('mid_inferolateral').getAttribute('fill');
    seg('mid_inferolateral').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const c = caja();
    if (c) { c.value = '+19'; c.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); }
    return { abrio: !!c, cerro: !caja(), antes, despues: seg('mid_inferolateral').getAttribute('fill'),
      t: txt('mid_inferolateral').textContent };
  });
  T('apagarCierraCaja', () => {
    if (!window.strainNumModoOn()) window.strainNumToggle();
    seg('mid_inferoseptal').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const abrio = !!caja();
    window.strainNumToggle();
    return { abrio, cerro: !caja(), on: window.strainNumModoOn() };
  });

  // ── 4) GUARDADO y RESTAURACION, con un estudio viejo de cinco estados ──
  T('guardaRestaura', () => {
    window.sglReset();
    if (window.strainNumModoOn()) window.strainNumToggle();
    window.strainEscribir('basal_anterior', '-18');
    window.strainEscribir('mid_inferolateral', '+7');
    window.strainSet('apex', 4, null);
    const _sn = window.strainSnapshot();
    const guard = { strain_sgl: _sn.est, strain_sgl_num: _sn.num, strain_sgl_ver: window.STRAIN_VER };
    window.sglReset();
    const vacio = seg('basal_anterior').getAttribute('fill');
    window._restaurarStrain(guard);
    return { guardado: guard, vacio,
      ba: seg('basal_anterior').getAttribute('fill') + '/' + txt('basal_anterior').textContent,
      ml: seg('mid_inferolateral').getAttribute('fill') + '/' + txt('mid_inferolateral').textContent,
      ap: seg('apex').getAttribute('fill') + '/' + txt('apex').textContent };
  });
  T('estudioViejo', () => {
    window.sglReset();
    /* El modelo de CINCO estados, sin marca de version: 0 Normal, 1 Hipoq leve, 2 Hipoq,
       3 Acinesia, 4 Discinesia. */
    window._restaurarStrain({ strain_sgl: JSON.stringify({
      basal_anterior: 0, mid_anterior: 1, apical_anterior: 2, basal_inferior: 3, apex: 4 }) });
    const d = {};
    ['basal_anterior', 'mid_anterior', 'apical_anterior', 'basal_inferior', 'apex'].forEach(k => {
      d[k] = window.strainEstadoDe(k) + ' ' + seg(k).getAttribute('fill') + ' t=' + JSON.stringify(txt(k).textContent);
    });
    d._numeros = window.strainSnapshot().num;
    d._hayDatos = window.strainHayDatos();
    return d;
  });
  T('viejoTodoCero', () => {
    window.sglReset();
    window._restaurarStrain({ strain_sgl: JSON.stringify({ basal_anterior: 0, apex: 0 }) });
    return { hayDatos: window.strainHayDatos(), fill: seg('basal_anterior').getAttribute('fill') };
  });
  T('parDesparejo', () => {
    /* Un numero que NO deriva el tramo guardado: gana el COLOR. */
    window.sglReset();
    window._restaurarStrain({ strain_sgl: JSON.stringify({ basal_anterior: 8 }),
      strain_sgl_num: JSON.stringify({ basal_anterior: -18 }), strain_sgl_ver: window.STRAIN_VER });
    return { estado: window.strainEstadoDe('basal_anterior'), num: window.strainNumDe('basal_anterior'),
      fill: seg('basal_anterior').getAttribute('fill'), t: txt('basal_anterior').textContent };
  });

  // ── 5) LIMPIAR ──
  T('limpiar', () => {
    const g = document.getElementById('sgl_gls'), n = document.getElementById('sgl_notas');
    if (g) g.value = '-17.5';
    if (n) n.value = 'Nota uno\nNota dos';
    window.strainEscribir('basal_anterior', '-18');
    window.strainEscribir('mid_inferolateral', '+7');
    window.sglReset();
    const ps = Array.from(document.querySelectorAll('#sgl-svg-bullseye .strain-seg'));
    const ts = Array.from(document.querySelectorAll('#sgl-svg-bullseye text[data-strainid]'));
    return { gris: ps.every(p => String(p.getAttribute('fill')).toUpperCase() === window.STRAIN_PAL[0].color.toUpperCase()),
      guiones: ts.every(t => t.textContent === '–'),
      nums: window.strainSnapshot().num,
      gls: g ? g.value : 'n/d', notas: n ? n.value : 'n/d' };
  });

  // ── 6) NINGUNA MENCION DE LA MARCA en los textos de SGL ──
  T('sinMarca', () => {
    const z = document.getElementById('tab-sgl');
    const t = z ? (z.innerText || z.textContent || '') : '';
    const pal = ['General Electric', 'escala GE', '(GE)'];
    const hits = pal.filter(x => t.indexOf(x) >= 0);
    const vi = window.VINFO || {};
    const infoHits = Object.keys(vi).filter(k => (k === 'sgl-num' || k === 'patrones-sgl'))
      .filter(k => pal.some(x => JSON.stringify(vi[k]).indexOf(x) >= 0));
    return { largo: t.length, hits: hits.join('|'), infoHits: infoHits.join('|'),
      frase: (document.querySelector('#tab-sgl .sacc-body p') || {}).textContent || '' };
  });

  // ── 7) LA LEYENDA ──
  T('leyenda', () => {
    const z = document.querySelector('[data-strain-leyenda="sgl"]');
    if (!z) return 'SIN LEYENDA';
    const cuad = Array.from(z.querySelectorAll('div')).map(d => (d.style.background || '').trim()).filter(Boolean);
    const spans = Array.from(z.querySelectorAll('span')).map(d => (d.style.background || '').trim()).filter(Boolean);
    return { texto: (z.innerText || z.textContent || '').replace(/\s+/g, ' ').trim(),
      cuadritos: cuad.length, gris: spans.length,
      titulo: (z.parentNode.querySelector('div') || {}).textContent || '',
      pintados: cuad.length + spans.length };
  });
  T('leyendaPatrones', () => {
    const z = document.querySelector('[data-strain-leyenda="patrones"]');
    return z ? (z.innerText || z.textContent || '').replace(/\s+/g, ' ').trim() : 'SIN LEYENDA';
  });

  // ── 8) LOS PATRONES DE EJEMPLO ──
  T('patrones', () => {
    const C = window._pr7C || null;
    const svgs = Array.from(document.querySelectorAll('#patron-grid svg, #detalle-svg'));
    const fills = new Set();
    svgs.forEach(s => s.querySelectorAll('path,circle').forEach(p => {
      const f = p.getAttribute('fill'); if (f) fills.add(String(f).toUpperCase());
    }));
    const pal = window.STRAIN_PAL.map(x => x.color.toUpperCase());
    const viejos = ['#DC2626', '#F87171', '#FECACA', '#93C5FD', '#1D4ED8', '#9E9E9E'];
    return { svgs: svgs.length, fills: Array.from(fills).sort().join(','),
      fueraDePaleta: Array.from(fills).filter(f => pal.indexOf(f) < 0).join(','),
      viejosPresentes: Array.from(fills).filter(f => viejos.indexOf(f) >= 0).join(',') };
  });

  // ── 9) nada se escribe en los campos del estudio ──
  T('censo', () => {
    const n = document.querySelectorAll('input[id]').length;
    const m = document.querySelectorAll('select[id]').length;
    const t = document.querySelectorAll('textarea[id]').length;
    return n + '/' + m + '/' + t;
  });
  return R;
})()
