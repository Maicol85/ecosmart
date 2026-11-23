/* Cuerpo de la sonda de PR5. Sin acentos graves a proposito. */
(() => {
  const out = {};
  const g = (id) => document.getElementById(id);
  const set = (id, val) => { const e = g(id); if (!e) return false;
    e.value = val; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return true; };
  const linea = () => { const e = g('ao-esp');
    return !e ? 'SIN NODO' : (getComputedStyle(e).display === 'none' ? '(escondida)' : e.textContent); };
  const censo = () => Array.prototype.map.call(
    document.querySelectorAll('input[id], select[id], textarea[id]'),
    (e) => e.id + '=' + (e.type === 'checkbox' ? (e.checked ? 1 : 0) : e.value)).join('|');

  /* (A) LA ECUACION PURA, con la superficie corporal EXACTA de la orden. */
  out.ecu = {
    varon50_19: typeof aorPredSenosCm === 'function' ? +(aorPredSenosCm(50, 1.9, 'M') * 10).toFixed(4) : 'NO',
    mujer50_16: typeof aorPredSenosCm === 'function' ? +(aorPredSenosCm(50, 1.6, 'F') * 10).toFixed(4) : 'NO',
    seeMm: typeof AOR_DEV_SEE !== 'undefined' ? +(AOR_DEV_Z * AOR_DEV_SEE * 10).toFixed(4) : 'NO',
    limVaron: typeof aorPredSenosCm === 'function'
      ? +((aorPredSenosCm(50, 1.9, 'M') + AOR_DEV_Z * AOR_DEV_SEE) * 10).toFixed(4) : 'NO',
    limMujer: typeof aorPredSenosCm === 'function'
      ? +((aorPredSenosCm(50, 1.6, 'F') + AOR_DEV_Z * AOR_DEV_SEE) * 10).toFixed(4) : 'NO',
    duboisIgual: (typeof aorBsaDuBois === 'function' && typeof mfsZBsaDuBois === 'function')
      ? (aorBsaDuBois(70, 170) === mfsZBsaDuBois(70, 170)) : 'NO',
    seeMarfanIgual: (typeof MFS_Z_SEE !== 'undefined' && typeof AOR_DEV_SEE !== 'undefined')
      ? (MFS_Z_SEE === AOR_DEV_SEE && MFS_Z_EDAD_MIN === AOR_DEV_EDAD_MIN) : 'NO'
  };

  /* (B) DENOMINADOR: la linea arranca escondida con el formulario vacio. */
  out.vacio = linea();
  const censoAntes = censo();

  /* (C) Escena que aplica: varon de 50 anos, 80 kg, 175 cm, senos 42 mm. */
  set('sexo', 'M'); set('edad', '50'); set('peso', '80'); set('talla', '175');
  set('ao_sin', '42');
  if (typeof calcAorta === 'function') calcAorta();
  const r = (typeof aorEspSenos === 'function') ? aorEspSenos(null) : null;
  out.aplica = {
    linea: linea(),
    bsaDuBois: r ? +r.bsa.toFixed(4) : 'NO',
    espMm: r ? +r.espMm.toFixed(4) : 'NO',
    limMm: r ? +r.limMm.toFixed(4) : 'NO',
    z: r ? +r.z.toFixed(4) : 'NO',
    difMm: r ? +r.difMm.toFixed(4) : 'NO',
    porEncima: r ? r.porEncima : 'NO',
    /* El Z de la tarjeta de Marfan sobre el MISMO paciente. */
    zMarfan: (typeof mfsZCalc === 'function' && mfsZCalc(null)) ? +(mfsZCalc(null).z || 0).toFixed(4) : 'NO'
  };
  out.aplica.zCoincideConMarfan = (out.aplica.z !== 'NO' && out.aplica.zMarfan !== 'NO')
    && Math.abs(out.aplica.z - out.aplica.zMarfan) < 1e-9;

  /* (D) NO ESCRIBE NINGUN CAMPO: el censo cambia solo en los cinco que sembramos. */
  const censoDespues = censo();
  const difs = [];
  { const a = censoAntes.split('|'), b = censoDespues.split('|');
    for (let i = 0; i < Math.max(a.length, b.length); i++) if (a[i] !== b[i]) difs.push(b[i]); }
  out.camposQueCambiaron = difs;

  /* (E) Mujer de 50 anos: el esperado de la orden. */
  set('sexo', 'F'); set('peso', '60'); set('talla', '160'); set('ao_sin', '');
  if (typeof calcAorta === 'function') calcAorta();
  { const q = aorEspSenos(null);
    out.mujer = { bsa: q ? +q.bsa.toFixed(4) : 'NO', espMm: q ? +q.espMm.toFixed(4) : 'NO',
                  linea: linea() }; }

  /* (F) LOS TRES CASOS EN QUE NO APARECE NADA. */
  out.noAplica = {};
  set('sexo', 'M'); set('edad', '14'); set('peso', '80'); set('talla', '175'); set('ao_sin', '42');
  if (typeof calcAorta === 'function') calcAorta();
  out.noAplica.edad14 = { obj: aorEspSenos(null), linea: linea() };
  set('edad', '50'); set('sexo', '');
  if (typeof calcAorta === 'function') calcAorta();
  out.noAplica.sinSexo = { obj: aorEspSenos(null), linea: linea() };
  set('sexo', 'M'); set('peso', ''); set('talla', '');
  if (typeof calcAorta === 'function') calcAorta();
  out.noAplica.sinSC = { obj: aorEspSenos(null), linea: linea() };

  /* (G) La capsula del seno NO se movio: con 42 mm en un varon sigue diciendo dilatada. */
  set('peso', '80'); set('talla', '175');
  if (typeof calcAorta === 'function') calcAorta();
  { const c = g('ao-interp'); out.capsula = c ? c.textContent.trim() : 'SIN NODO'; }

  /* (H) El informe y el EN SUMA. */
  if (typeof generarInforme === 'function') { try { generarInforme(); } catch (e) { out.errInf = String(e).slice(0, 200); } }
  const inf = (g('informe_texto') || {}).value || '';
  const suma = (g('en_suma') || {}).value || '';
  const fr = inf.split('\n').filter((l) => l.indexOf('esperado') >= 0);
  out.informe = { frases: fr, nFrases: fr.length,
                  enSuma: suma.indexOf('esperado') >= 0 ? 'APARECE (MAL)' : 'ausente' };
  /* Control negativo: sin sexo la frase no sale. */
  set('sexo', ''); if (typeof generarInforme === 'function') generarInforme();
  out.informeSinSexo = (((g('informe_texto') || {}).value || '').indexOf('esperado') >= 0)
    ? 'APARECE (MAL)' : 'ausente';

  /* (I) EL GLOBO del campo de senos y la entrada de Referencias. */
  set('sexo','M'); set('edad','50'); set('peso','80'); set('talla','175'); set('ao_sin','42');
  if (typeof calcAorta === 'function') calcAorta();
  out.globo = { err: null, txt: '' };
  try {
    /* La pestana primero: el campo de senos vive en AI/VI, y un nodo en display:none no tiene
       geometria, asi que _vInfoColocar devuelve null y la tarjeta no se dibuja. */
    /* showTab lee el window.event GLOBAL y revienta con «reading classList» cuando ese global
       es el success de una transaccion de IndexedDB: es P30-d, preexistente y declarada. Va en
       su propio try para que no se lleve el bloque entero. */
    /* SE CLICKEA EL BOTON DE LA PESTANA Y NO SE LLAMA showTab, y es por P30-d: esa funcion lee
       el window.event GLOBAL y revienta con «reading classList» cuando ese global es el success
       de una transaccion de IndexedDB. Un click real trae su propio evento. */
    { const tb = document.querySelector('[onclick*="showTab(\'ai-vi\'"]');
      if (tb) tb.click(); else { try { showTab('ai-vi'); } catch (e) {} }
      out.globo.pestana = tb ? 'por click' : 'sin boton'; }
    /* secToggle es un TOGGLE: llamarlo a secas CIERRA la seccion si ya estaba abierta. Se
       ASEGURA el estado mirando aria-expanded, que es el denominador del gesto. */
    const hdr = document.querySelector('[onclick*="secToggle(\'aorta\'"]');
    if (hdr && hdr.getAttribute('aria-expanded') !== 'true') hdr.click();
    out.globo.secAbierta = hdr ? hdr.getAttribute('aria-expanded') : 'SIN HDR';
    const b = document.querySelector('[data-vinfo="ao-card"]');
    out.globo.btnCaja = b ? (b.getBoundingClientRect().width + 'x' + b.getBoundingClientRect().height) : 'SIN BOTON';
    if (!b) out.globo.err = 'SIN BOTON';
    else { b.click();
      const c = document.getElementById('vinfo-card');
      out.globo.txt = c ? c.textContent : 'SIN TARJETA';
      out.globo.rots = c ? Array.prototype.map.call(c.querySelectorAll('.ev-rot'), e=>e.textContent) : [];
      if (b) b.click(); }
  } catch (e) { out.globo.err = String(e).slice(0,200); }
  out.refs = { err: null, txt: '' };
  try {
    if (typeof showTab === 'function') showTab('refs');
    if (typeof refSubTab === 'function') refSubTab('ao');
    if (typeof toggleRef === 'function') { const h = document.querySelector('[onclick*="toggleRef(\'ao2\'"]'); if (h) h.click(); }
    if (typeof evRefPintar === 'function') evRefPintar('ao2');
    const h2 = document.getElementById('ref-ao2-cuerpo');
    out.refs.txt = h2 ? h2.textContent : 'SIN HOST';
  } catch (e) { out.refs.err = String(e).slice(0,200); }
  /* Los cinco rotulos y los diez folios/cifras que la orden exige TAL CUAL. */
  const EXIG = ['1.207', '15 a', 'borde anterior a borde anterior', '1,96', '0,261 cm',
    'folio 3562', 'folio 3566', 'folio 3565', 'folio 3603', 'Clase I', 'Nivel C',
    'Clase IIa', 'Nivel B', 'e344', 'e345', 'folio e350', 'Clase 2a', 'C-LD',
    'no se usa t', 'Criterio de EcoSmart', 'no incluy'];
  const chk = (t) => EXIG.filter(x => t.indexOf(x) < 0);
  out.faltanEnGlobo = chk(out.globo.txt || '');
  out.faltanEnRefs  = chk(out.refs.txt || '');
  /* Control: ninguna de esas cifras llega al informe ni al EN SUMA. */
  out.folioEnPapel = ['folio', '3562', 'e350', 'Clase', 'Devereux', 'ESC 2024', 'ACC/AHA']
    .filter(x => (inf.indexOf(x) >= 0 || suma.indexOf(x) >= 0));
  return out;
})()
