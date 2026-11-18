/* Cuerpo de la sonda de la TAREA 1 (18/11/2026) — el aviso legal y el globo del titulo de
   Evidencia. Vive aparte para que los acentos graves sean codigo normal (leccion de MEDIR-4b). */
async function (opt) {
  const R = { tema: null };
  const esperar = (ms) => new Promise(r => setTimeout(r, ms));
  const plano = (t) => String(t == null ? '' : t).replace(/\s+/g, ' ').trim();
  const txt = (id) => { const e = document.getElementById(id); return e ? plano(e.textContent) : null; };

  /* El tema de esta app NO es prefers-color-scheme: es la clase light-mode que pone loadTheme()
     leyendo localStorage.ett_theme. La sonda lo SIEMBRA y DEVUELVE el que quedo puesto, que es
     lo que impide informar «dos temas» habiendo medido dos veces el mismo (leccion de PANT-34). */
  try { localStorage.setItem('ett_theme', opt.tema === 'claro' ? 'light' : 'dark'); } catch (e) {}
  try { if (typeof loadTheme === 'function') loadTheme(); } catch (e) {}
  R.tema = document.documentElement.classList.contains('light-mode') ||
           document.body.classList.contains('light-mode') ? 'claro' : 'oscuro';

  /* ── A · EL AVISO LEGAL ─────────────────────────────────────────────────────────────────── */
  const av = document.getElementById('modalAvisoEco');
  R.avisoExiste = !!av;
  const tAv = av ? plano(av.textContent) : '';
  R.avisoLargo = tAv.length;
  R.a1nuevo = tAv.indexOf('Herramienta para el registro y la descripción de estudios ecocardiográficos.') > -1;
  R.a1viejo = /apoyo cl[ií]nico para el registro/.test(tAv);
  R.a1juicio = tAv.indexOf('No reemplaza el juicio clínico del médico.') > -1;
  R.a2nuevo = tAv.indexOf('Los cálculos son automáticos. La interpretación clínica final corresponde al médico tratante.') > -1;
  R.a2viejo = /c[áa]lculos autom[áa]ticos son orientativos/.test(tAv);
  R.indepTxt = txt('eco-indep-txt');
  R.indepFin = txt('eco-indep-fin');
  R.a3completo = R.indepTxt && R.indepFin
    ? (R.indepTxt + ' ' + R.indepFin) === 'EcoSmart es un software independiente: no tiene aval, patrocinio ni vínculo con ninguna sociedad científica ni editorial. Las guías, consensos y artículos que se citan (autor y año) son publicaciones de terceros, mencionadas solo como origen de los criterios y puntos de corte que usa la aplicación. Los textos de la aplicación son de redacción propia. Para el contenido completo y vigente de cada publicación, consulte la fuente original.'
    : false;
  /* El aviso inicial OMITE a proposito la oracion del globo. */
  R.a3sinOracionExtra = (R.indepTxt + ' ' + R.indepFin).indexOf('La aplicación describe hallazgos') < 0;
  /* Los tres renglones que la orden manda NO tocar. */
  R.datosIntacto = tAv.indexOf('Los datos se guardan localmente en el navegador (IndexedDB). No se transmiten a servidores externos. Exportá backups regularmente.') > -1;
  R.devIntacto = tAv.indexOf('Los desarrolladores no asumen responsabilidad por decisiones médicas basadas en este software.') > -1;
  const bt = av ? av.querySelector('button') : null;
  R.botonTxt = bt ? plano(bt.textContent) : null;
  R.botonOnclick = bt ? String(bt.getAttribute('onclick') || '') : null;
  /* Cuantos puntos tiene la caja gris: 3 -> 4. */
  const caja = R.indepTxt ? document.getElementById('eco-indep-txt').parentElement.parentElement : null;
  R.puntos = caja ? caja.children.length : null;
  /* Geometria del aviso: nada recortado y sin scroll horizontal propio. */
  if (av) {
    const vis = av.style.display;
    av.style.display = 'flex';
    await esperar(80);
    const tarj = av.firstElementChild;
    R.avisoScrollX = tarj ? (tarj.scrollWidth - tarj.clientWidth) : null;
    R.avisoRect = tarj ? Math.round(tarj.getBoundingClientRect().width) : null;
    R.avisoRecortados = 0;
    Array.prototype.forEach.call(av.querySelectorAll('div,p,span,strong,button'), (e) => {
      if (e.children.length) return;
      if (e.scrollWidth - e.clientWidth > 1) R.avisoRecortados++;
    });
    av.style.display = vis || 'none';
  }
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  ['modalAvisoEco', 'login-overlay'].forEach(id => { const m = document.getElementById(id); if (m) m.style.display = 'none'; });

  /* ── B · EL GLOBO DEL TITULO DE EVIDENCIA ───────────────────────────────────────────────── */
  R.regN = (typeof VINFO === 'object' && VINFO) ? Object.keys(VINFO).length : null;
  R.regTiene = !!(typeof VINFO === 'object' && VINFO && VINFO['ev-indep']);
  R.refTiene = !!(typeof VINFO_REF === 'object' && VINFO_REF && VINFO_REF['ev-indep']);
  try { if (typeof indicAbrir === 'function') indicAbrir(); } catch (e) {}
  await esperar(300);
  const ov = document.getElementById('indic-overlay');
  R.panelAbierto = ov ? ov.style.display : 'sin overlay';
  const tit = document.getElementById('indic-titulo');
  R.titulo = tit ? plano(tit.textContent) : null;
  R.tituloFlex = tit ? getComputedStyle(tit).flexGrow : null;
  const b = document.querySelector('[data-vinfo="ev-indep"]');
  R.btnExiste = !!b;
  if (b) {
    R.btnTag = b.tagName;
    R.btnTieneTitle = b.hasAttribute('title');
    R.btnAria = b.getAttribute('aria-expanded');
    R.btnLabel = b.getAttribute('aria-label');
    const r = b.getBoundingClientRect();
    R.btnW = Math.round(r.width); R.btnH = Math.round(r.height);
    /* HERMANO del titulo e INMEDIATAMENTE despues: «al lado del titulo». */
    R.btnHermanoDelTitulo = !!tit && b.parentElement === tit.parentElement &&
                            tit.nextElementSibling === b;
    /* Y el toque cae en el, no en otro control. */
    const e2 = document.elementFromPoint(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
    R.btnToque = e2 ? (e2.closest('[data-vinfo="ev-indep"]') ? 'propio' : (e2.tagName + '#' + (e2.id || '-'))) : 'nada';
    /* ABRIR con el clic real. */
    b.click();
    await esperar(260);
    const card = document.getElementById('vinfo-card');
    R.cardVis = card ? getComputedStyle(card).display : 'sin card';
    R.cardTit = card ? plano((card.querySelector('h4') || {}).textContent) : null;
    R.cardTxt = card ? plano(card.textContent) : null;
    R.cardCuerpo = card && card.querySelector('p') ? plano(card.querySelector('p').textContent) : null;
    R.cardEsperado = R.cardCuerpo === 'EcoSmart es un software independiente: no tiene aval, patrocinio ni vínculo con ninguna sociedad científica ni editorial. Las guías, consensos y artículos que se citan (autor y año) son publicaciones de terceros, mencionadas solo como origen de los criterios y puntos de corte que usa la aplicación. Los textos de la aplicación son de redacción propia. La aplicación describe hallazgos y no reemplaza el juicio clínico del médico. Para el contenido completo y vigente de cada publicación, consulte la fuente original.';
    /* Ningun bloque declara su propio tamanio de cuerpo: regla fija del 2026-11-04. */
    R.cardFont = card ? getComputedStyle(card).fontSize : null;
    R.cardPFont = card && card.querySelector('p') ? getComputedStyle(card.querySelector('p')).fontSize : null;
    R.cardH4Font = card && card.querySelector('h4') ? getComputedStyle(card.querySelector('h4')).fontSize : null;
    R.btnAriaAbierto = b.getAttribute('aria-expanded');
    /* Dentro de la pantalla. */
    if (card && R.cardVis !== 'none') {
      const rc = card.getBoundingClientRect();
      R.cardDentro = rc.left >= -1 && rc.top >= -1 &&
        rc.right <= innerWidth + 1 && rc.bottom <= innerHeight + 1;
      R.cardCaja = Math.round(rc.width) + 'x' + Math.round(rc.height);
    }
    /* El SEGUNDO toque cierra. */
    b.click(); await esperar(220);
    const c2 = document.getElementById('vinfo-card');
    R.cardCerrada = c2 ? getComputedStyle(c2).display === 'none' : true;
  }
  /* El pie del panel NO se toco. */
  const card2 = document.getElementById('indic-card');
  const pie = card2 ? card2.lastElementChild : null;
  R.pie = pie ? plano(pie.textContent) : null;
  /* Nada recortado en la cabecera y sin scroll horizontal del panel. */
  if (card2) {
    const cab = card2.firstElementChild;
    R.cabRecortados = 0;
    Array.prototype.forEach.call(cab.querySelectorAll('span,button'), (e) => {
      if (e.children.length) return;
      if (e.scrollWidth - e.clientWidth > 1) R.cabRecortados++;
    });
    R.cabAlto = Math.round(cab.getBoundingClientRect().height);
    R.panelScrollX = card2.scrollWidth - card2.clientWidth;
  }
  try { if (typeof indicCerrar === 'function') indicCerrar(); } catch (e) {}
  await esperar(120);
  R.docScrollX = document.documentElement.scrollWidth - document.documentElement.clientWidth;
  return R;
}
