/* GRUPO B - el copiado del informe. Mide el HTML que llega AL PORTAPAPELES, no el que arma la
   app: son dos cosas distintas y es justamente ahi donde el tamanio se puede perder. */
(async () => {
  const out = { denom: {}, armado: {}, via1: {}, via2: {} };
  const tam = h => {
    const d = document.createElement('div');
    d.innerHTML = String(h || '');
    const todos = Array.from(d.querySelectorAll('*'));
    const conTexto = todos.filter(e => String(e.textContent || '').trim() !== '');
    const sinTam = conTexto.filter(e => !/font-size/i.test(e.getAttribute('style') || ''));
    const tams = {};
    conTexto.forEach(e => {
      const m = /font-size\s*:\s*([^;"]+)/i.exec(e.getAttribute('style') || '');
      const k = m ? m[1].trim() : '(sin)';
      tams[k] = (tams[k] || 0) + 1;
    });
    return { elementos: todos.length, conTexto: conTexto.length,
             sinTamanio: sinTam.map(e => e.tagName + ':' + String(e.textContent).slice(0, 18)).slice(0, 6),
             tamanios: tams };
  };
  try {
    const inf = document.getElementById('informe_texto');
    const suma = document.getElementById('en_suma');
    out.denom.hayCampos = !!(inf && suma);
    if (inf) inf.value = 'Ventriculo izquierdo de dimensiones normales.\nFEVI 58 %.';
    if (suma) suma.value = 'Estenosis aortica severa\nFuncion sistolica conservada';
    const html = window.cuadInformeHTML();
    out.denom.largoHTML = html.length;
    out.armado = tam(html);

    /* VIA 1 - ClipboardItem: el HTML viaja LITERAL. */
    try {
      const it = new window.ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob(['x'], { type: 'text/plain' })
      });
      await navigator.clipboard.write([it]);
      const leido = await navigator.clipboard.read();
      for (const el of leido) {
        if (el.types.indexOf('text/html') >= 0) {
          const b = await el.getType('text/html');
          const t = await b.text();
          out.via1 = tam(t); out.via1.largo = t.length;
          out.via1.muestra = t.slice(0, 180);
        }
      }
    } catch (e) { out.via1.ERROR = String(e && e.message || e).slice(0, 150); }

    /* VIA 2 - el nodo editable con execCommand, que es la que corre cuando la 1 no esta.
       Es la que el navegador REESCRIBE al serializar la seleccion. */
    try {
      const d = document.createElement('div');
      d.setAttribute('contenteditable', 'true');
      d.style.cssText = 'position:fixed;top:-3000px;left:-3000px;opacity:0;white-space:pre-wrap;';
      d.innerHTML = html;
      document.body.appendChild(d);
      const sel = window.getSelection(); const rg = document.createRange();
      rg.selectNodeContents(d); sel.removeAllRanges(); sel.addRange(rg);
      const bien = document.execCommand && document.execCommand('copy');
      sel.removeAllRanges(); document.body.removeChild(d);
      out.via2.execCommand = !!bien;
      const leido2 = await navigator.clipboard.read();
      for (const el of leido2) {
        if (el.types.indexOf('text/html') >= 0) {
          const b = await el.getType('text/html');
          const t = await b.text();
          out.via2 = Object.assign(out.via2, tam(t));
          out.via2.largo = t.length;
          out.via2.muestra = t.slice(0, 400);
        }
      }
    } catch (e) { out.via2.ERROR = String(e && e.message || e).slice(0, 150); }
  } catch (e) { out.ERROR = String(e && e.message || e).slice(0, 300); }
  return out;
})
()
