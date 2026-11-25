(async () => {
  /* EL RECUADRO DE amiloDibujarSecciones: donde empieza lo que viene DESPUES de una nota.
     Se mide con la funcion REAL y un jsPDF espiado, con texto corto, largo y muy largo y con
     dos anchos, que es lo que la orden pide probar. Y aparte, la tarjeta del Wilkins de verdad. */
  const R = { err: [] };
  const esperar = ms => new Promise(r => setTimeout(r, ms));
  const set = (id, v) => { const e = document.getElementById(id); if (!e) return false;
    e.value = String(v); try { e.dispatchEvent(new Event('input', { bubbles:true })) } catch (x) {}
    try { e.dispatchEvent(new Event('change', { bubbles:true })) } catch (x) {} return true; };
  try { document.getElementById('login-overlay').style.display = 'none'; } catch (e) {}
  const J = window.jspdf && window.jspdf.jsPDF;
  if (!J) { R.err.push('SIN jsPDF'); return R; }

  /* Un doc espiado: guarda cada rect y cada texto con su y. */
  const espiar = () => {
    const d = new J({ orientation:'portrait', unit:'mm', format:'a4' });
    const ops = [];
    let fsz = 0, fnt = '';
    const asf = d.setFontSize; d.setFontSize = function (s) { fsz = s; return asf.apply(this, arguments) };
    const af = d.setFont; d.setFont = function (n, s) { fnt = n + '/' + (s||''); return af.apply(this, arguments) };
    const at = d.text; d.text = function (t, x, y) {
      ops.push({ k:'t', t:String(t).slice(0,54), x:Math.round(x*100)/100, y:Math.round(y*100)/100,
                 fs:Math.round(fsz*100)/100, f:fnt });
      return at.apply(this, arguments) };
    const ar = d.rect; d.rect = function (x, y, w, h) {
      ops.push({ k:'r', x:Math.round(x*100)/100, y:Math.round(y*100)/100,
                 w:Math.round(w*100)/100, h:Math.round(h*100)/100 });
      return ar.apply(this, arguments) };
    d.save = function () { return this };
    return { d, ops };
  };

  const CORTO = 'Salvedad corta.';
  const LARGO = 'Salvedad. El score de Wilkins evalua la anatomia valvular: no puntua la calcificacion comisural ni el grado de insuficiencia mitral. Segun la guia EAE/ASE 2009 de estenosis valvular (apartado B.2.1, folio 14), ningun score ha demostrado ser superior a otro y todos tienen un valor predictivo limitado del resultado de la comisurotomia mitral con balon, que depende de otros hallazgos clinicos y ecocardiograficos.';
  const MUYLARGO = LARGO + ' ' + LARGO + ' ' + LARGO;

  const medir = (txtNota, pgW) => {
    const { d, ops } = espiar();
    const secs = [{ tit: 'SCORE DE PRUEBA', txt:
      'Puntaje total | 7 de 16\n'
      + '!! ' + txtNota + '\n'
      + '## Desglose por criterio\n'
      + 'Movilidad valvular | 2 de 4\n'
      + 'Engrosamiento valvular | 2 de 4' }];
    const y = amiloDibujarSecciones(d, secs, { mL:9, pgW: pgW, tema:[26,61,122], yIni:30, yFin:281 });
    /* El rect de la nota: el unico con w grande que NO es la barra de 7 mm de alto ni el filete. */
    const rects = ops.filter(o => o.k === 'r');
    const nota = rects.find(o => o.h > 7.5 && o.w > 50);
    const filete = rects.find(o => o.w < 2 && o.h > 7.5);
    const barra = rects.find(o => Math.abs(o.h - 7) < 0.01);
    /* El primer texto DESPUES de la ultima linea de la nota: tiene que arrancar por debajo del
       borde de abajo del recuadro, contando que doc.text pone la LINEA DE BASE en y y las
       mayusculas suben por encima. */
    const ts = ops.filter(o => o.k === 't');
    const iDesg = ts.findIndex(o => /Desglose/.test(o.t));
    const lineasNota = ts.filter(o => /Salvedad|valvular: no|EAE|ningun score|comisurotomia/.test(o.t)
                                      && o.f.indexOf('italic') >= 0);
    const ultima = lineasNota.length ? lineasNota[lineasNota.length - 1] : null;
    const desg = iDesg >= 0 ? ts[iDesg] : null;
    /* El alto de una mayuscula a ese cuerpo, en mm: jsPDF mide en pt y 1 pt = 0.3528 mm. Para
       helvetica bold el alto de mayuscula es ~0.717 del cuerpo. */
    const capMM = desg ? (desg.fs * 0.3528 * 0.717) : 0;
    const puntajeT = ts.find(o => /Puntaje total/.test(o.t));
    const barraT = ts.find(o => /SCORE DE PRUEBA/.test(o.t));
    return {
      yFinal: Math.round(y*100)/100,
      nLineasNota: lineasNota.length,
      notaRect: nota || null,
      filete: filete ? { h: filete.h } : null,
      notaBorde: nota ? Math.round((nota.y + nota.h)*100)/100 : null,
      ultimaBase: ultima ? ultima.y : null,
      desgBase: desg ? desg.y : null,
      desgFs: desg ? desg.fs : null,
      capMM: Math.round(capMM*100)/100,
      desgTope: desg ? Math.round((desg.y - capMM)*100)/100 : null,
      /* POSITIVO = el titulo que sigue PISA el recuadro */
      pisa: (nota && desg) ? Math.round(((nota.y + nota.h) - (desg.y - capMM))*100)/100 : null,
      /* La franja de titulo y su primer subtitulo / primera fila */
      barraAbajo: barra ? Math.round((barra.y + barra.h)*100)/100 : null,
      primeraFilaBase: puntajeT ? puntajeT.y : null,
      primeraFilaTope: puntajeT ? Math.round((puntajeT.y - puntajeT.fs*0.3528*0.717)*100)/100 : null,
      aireBarra: (barra && puntajeT)
        ? Math.round(((puntajeT.y - puntajeT.fs*0.3528*0.717) - (barra.y + barra.h))*100)/100 : null
    };
  };

  try {
    R.corto    = medir(CORTO, 192);
    R.largo    = medir(LARGO, 192);
    R.muylargo = medir(MUYLARGO, 192);
    R.angosto  = medir(LARGO, 90);
    R.angosto2 = medir(LARGO, 60);
  } catch (e) { R.err.push('medir: ' + String(e && e.message || e).slice(0,300)); }

  /* ── LA TARJETA DEL WILKINS DE VERDAD, integrada al informe ──────────────────────────────── */
  try {
    [['nombre','Wilkins Pruebas'],['fecha','2026-11-24'],['edad','71'],['sexo','F'],
     ['peso','64'],['talla','158'],['vm_morf','Reumatica'],['em_area_thp','1.1']]
      .forEach(p => set(p[0], p[1]));
    [['wilkins_movilidad','2'],['wilkins_engrosamiento','2'],['wilkins_calcificacion','1'],
     ['wilkins_subvalvular','2']].forEach(p => set(p[0], p[1]));
    try { calcWilkins(); } catch (x) {}
    await esperar(400);
    R.wTotal = (document.getElementById('wilkins-total')||{}).textContent;
    R.wBanda = ((document.getElementById('wilkins-interp')||{}).dataset||{}).banda;
    R.wTexto = (typeof amiloTextoWilkins === 'function') ? amiloTextoWilkins() : 'sin fn';
    R.wTieneNota = /(^|\n)!!/.test(String(R.wTexto));
    R.wTextoCorto = String(R.wTexto).split('\n').slice(0,10);
  } catch (e) { R.err.push('wilk: ' + String(e && e.message || e).slice(0,300)); }
  return R;
})()
