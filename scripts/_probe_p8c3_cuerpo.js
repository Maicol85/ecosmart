(async () => {
  const R = {}; const EL = id => document.getElementById(id);
  try { EL('login-overlay').style.display = 'none'; } catch (e) {}
  try { if (typeof cerrarAvisoEco === 'function') cerrarAvisoEco(); } catch (e) {}
  /* los avisos de la app se interceptan para poder leerlos */
  const dichos = []; const oa = window.alert;
  window.alert = function (t) { dichos.push(String(t).slice(0, 200)); };
  function jpegFile(nom, color) {
    const c = document.createElement('canvas'); c.width = 64; c.height = 48;
    const x = c.getContext('2d'); x.fillStyle = color; x.fillRect(0, 0, 64, 48);
    const du = c.toDataURL('image/jpeg', 0.9);
    const b = atob(du.split(',')[1]); const u = new Uint8Array(b.length);
    for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    return new File([u], nom, { type: 'image/jpeg' });
  }
  try { if (typeof showTab === 'function') showTab('imagenes'); } catch (e) {}
  await new Promise(r => setTimeout(r, 150));

  /* ══ 1 · EL MISMO LOTE DOS VECES: 22 Y NO 44 ═══════════════════════════════════════════ */
  const lote = [jpegFile('a.jpg', '#c22'), jpegFile('b.jpg', '#2c2'), jpegFile('c.jpg', '#22c')];
  const r1 = await mediosImportar(lote, undefined, 'ceibolink');
  R.vez1 = { ok: r1.ok, slots: imgSlots.filter(s => s && s.dataURL).length };
  dichos.length = 0;
  const r2 = await mediosImportar(lote, undefined, 'ceibolink');
  R.vez2 = { ok: r2.ok, slots: imgSlots.filter(s => s && s.dataURL).length };
  R.noDuplico = (R.vez1.slots === R.vez2.slots);
  R.todasOk = (r2.ok === 3);
  R.motivos = (r2.res || []).map(x => x.motivo || '(entro)');
  R.aviso = dichos.join(' | ').slice(0, 200);
  R.avisoDiceYaEstaban = /ya estab/i.test(R.aviso) && /no se duplicaron/i.test(R.aviso);
  R.avisoDiceConfirma = /confirma/i.test(R.aviso);

  /* ══ 2 · CONTROL NEGATIVO: una imagen DISTINTA si entra ════════════════════════════════ */
  dichos.length = 0;
  const r3 = await mediosImportar([jpegFile('d.jpg', '#fa0')], undefined, 'ceibolink');
  R.distintaEntra = (imgSlots.filter(s => s && s.dataURL).length === R.vez2.slots + 1) && r3.ok === 1;
  R.distintaSinAviso = !/ya estab/i.test(dichos.join(' '));

  /* ══ 3 · UNA REPETIDA SIGUE FUERA DEL PDF Y NO ROMPE LA CUENTA ═════════════════════════ */
  R.enPdf = infMinCapturas().length;
  R.cuenta = (EL('img-cuenta') || {}).textContent || '(no)';

  /* ══ 4 · LA REPETIDA CUENTA COMO ENTRADA PARA CONFIRMAR ════════════════════════════════ */
  /* `dstAlActual` empuja el id a _clnkPorConfirmar cuando det.ok; una repetida es ok. */
  R.resOkCuenta = (r2.res || []).filter(x => x.ok).length;

  /* ══ 5 · SI SE LE BAJA LA CALIDAD, `_orig` SIGUE ATAJANDO LA REPETIDA ══════════════════ */
  try {
    const i0 = imgSlots.map((s, i) => (s && s.dataURL) ? i : -1).filter(i => i >= 0)[0];
    if (typeof imgSetCalidad === 'function') { imgSetCalidad(i0, 'mini'); await new Promise(r => setTimeout(r, 400)); }
    R.calBajada = imgSlots[i0] ? imgSlots[i0].calidad : '(no)';
    const antes = imgSlots.filter(s => s && s.dataURL).length;
    await mediosImportar([lote[0]], undefined, 'ceibolink');
    R.orig_atajo = (imgSlots.filter(s => s && s.dataURL).length === antes);
  } catch (e) { R.orig_err = String(e && e.message || e).slice(0, 140); }
  window.alert = oa;
  return R;
})()
