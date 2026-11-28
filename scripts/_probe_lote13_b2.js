/* GRUPO B - vuelca el HTML de los DOS copiados, para pasarlo por textutil, que es el motor que
   Pages usa al pegar. */
(() => {
  const inf = document.getElementById('informe_texto');
  const suma = document.getElementById('en_suma');
  if (inf) inf.value = 'Ventriculo izquierdo de dimensiones normales.\nFEVI 58 %.';
  if (suma) suma.value = 'Estenosis aortica severa\nFuncion sistolica conservada';
  /* Siembra minima para que los cuadros tengan algo que publicar. */
  [['ddvi','48'],['dsvi','30'],['fevi','58'],['ai_ap','36'],['tapse','22'],['ao_fc','70']]
    .forEach(par => { const e = document.getElementById(par[0]);
      if (e) { e.value = par[1]; try { e.dispatchEvent(new Event('input', { bubbles:true })) } catch (x) {} } });
  return { informe: window.cuadInformeHTML(), datos: String(window.cuadTextoHTML() || '').slice(0, 4000) };
})
()
