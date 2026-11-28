/* El censo del estudio y del Excel, para medirlo en los DOS arboles con la misma sonda. */
(() => ({
  inputId: document.querySelectorAll('input[id]').length,
  selectId: document.querySelectorAll('select[id]').length,
  textareaId: document.querySelectorAll('textarea[id]').length,
  excel: (function () { try { return Object.keys(LAB_XLS_MAP).length } catch (e) { return -1 } })(),
  vinfo: (function () { try { return Object.keys(VINFO).length } catch (e) { return -1 } })(),
  /* El detector de que son dos arboles distintos. */
  tieneLote13: typeof window.cineFsToggle === 'function' && typeof window.medRetroIndice === 'function'
}))
()
