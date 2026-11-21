(async () => {
  const R = {}; const EL = id => document.getElementById(id);
  try { EL('login-overlay').style.display = 'none'; } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  const esp = ms => new Promise(r => setTimeout(r, ms));
  const jpg = (color, nom) => {
    const c = document.createElement('canvas'); c.width = 40; c.height = 30;
    const x = c.getContext('2d'); x.fillStyle = color; x.fillRect(0, 0, 40, 30);
    const du = c.toDataURL('image/jpeg', 0.9);
    const u = Uint8Array.from(atob(du.split(',')[1]), ch => ch.charCodeAt(0));
    return new File([u], nom, { type: 'image/jpeg' });
  };
  try { imgVaciar(); } catch (e) {}
  showTab('imagenes'); await esp(120);
  await mediosImportar([jpg('#c02020', 'uno.jpg')], undefined, 'ceibolink');
  await esp(200);
  const slot = imgSlots.find(s => s && s.dataURL);
  R.slotNoPdf = slot ? !!slot.noPdf : 'NO HAY SLOT';
  R.enPdfLista = infMinCapturas().length;
  const url = slot ? slot.dataURL : '';
  try { __t && __t.set && __t.set('nombre', 'PRUEBA P8'); } catch (e) {}
  const n1 = EL('nombre'); if (n1) { n1.value = 'PRUEBA P8'; n1.dispatchEvent(new Event('input', {bubbles:true})); }
  const c1 = EL('ci'); if (c1) { c1.value = '1111111-1'; c1.dispatchEvent(new Event('input', {bubbles:true})); }
  const e1 = EL('edad'); if (e1) { e1.value = '50'; e1.dispatchEvent(new Event('input', {bubbles:true})); }
  try { generarInforme(); } catch (e) { R.errInf = String(e && e.message).slice(0,120); }
  await esp(300);
  for (let i = 0; i < 80 && (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF); i++) await esp(100);
  const Orig = window.jspdf.jsPDF; const vistas = [];
  const W = function () { const d = new Orig(...arguments);
    const ai = d.addImage.bind(d);
    d.addImage = function (data) { try { vistas.push(String(data)); } catch (e) {} return ai.apply(d, arguments); };
    d.save = function () { return Promise.resolve(); }; return d; };
  W.prototype = Orig.prototype; window.jspdf.jsPDF = W;
  try { await generarPDFReal(); } catch (e) { R.errPdf = String(e && e.message).slice(0, 160); }
  window.jspdf.jsPDF = Orig;
  R.addImageTotal = vistas.length;
  R.slotEnPdf = !!url && vistas.indexOf(url) > -1;
  R.vistasPrefijos = vistas.map(v => String(v).slice(0, 24));
  /* y ahora mandandola al PDF */
  imgPdfTodas(true); await esp(150);
  R.enPdfLista2 = infMinCapturas().length;
  const vistas2 = [];
  const W2 = function () { const d = new Orig(...arguments);
    const ai = d.addImage.bind(d);
    d.addImage = function (data) { try { vistas2.push(String(data)); } catch (e) {} return ai.apply(d, arguments); };
    d.save = function () { return Promise.resolve(); }; return d; };
  W2.prototype = Orig.prototype; window.jspdf.jsPDF = W2;
  try { await generarPDFReal(); } catch (e) {}
  window.jspdf.jsPDF = Orig;
  R.slotEnPdf2 = !!url && vistas2.indexOf(url) > -1;
  R.addImageTotal2 = vistas2.length;
  return R;
})()
