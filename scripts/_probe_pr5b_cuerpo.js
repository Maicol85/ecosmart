/* Cuerpo de la sonda de PR5, TAREAS 2 y 3. Sin acentos graves a proposito. */
(() => {
  const out = {};
  const g = (id) => document.getElementById(id);
  const set = (id, val) => { const e = g(id); if (!e) return 'SIN ' + id;
    e.value = val; e.dispatchEvent(new Event('input', { bubbles: true }));
    e.dispatchEvent(new Event('change', { bubbles: true })); return 'ok'; };

  /* == TAREA 2: las tres colas del bloque BF/BG == */
  /* El area sale de diam_tsvi + itv_tsvi + itv_ao, porque ava_cont es readonly. */
  /* EL VOLUMEN LATIDO SE RECALCULA DEL TSVI Y PISA LO QUE SE ESCRIBA EN vol_lat: es el
     volumen latido automatico. Asi que el flujo se mueve con el area del TSVI y su integral,
     y el area valvular se mantiene severa ajustando la integral aortica. Medido:
       bajo flujo  -> d 20 mm, VTI TSVI 15 cm -> VL 47,1 ml, VLI 24 ml/m2
       flujo normal-> d 24 mm, VTI TSVI 16 cm -> VL 72,4 ml, VLI 37 ml/m2
     y en los dos el AVA sale 0,80 cm2 eligiendo la integral aortica (59 y 90 cm). */
  const base = (flujoBajo) => {
    set('sexo','M'); set('edad','70'); set('peso','80'); set('talla','175');
    set('diam_tsvi', flujoBajo ? '20' : '24');
    set('itv_tsvi',  flujoBajo ? '15' : '16');
    set('itv_ao',    flujoBajo ? '59' : '90');
    set('gmedio_ao','28'); set('vmax_ao','3.4'); set('ea_grado','severa');
  };
  const COLAS = {
    calcio:     'score de calcio',
    tsvi:       'Considerar medici',          /* «Considerar medicion incorrecta del TSVI» */
    integrales: 'integrales velocidad-tiempo'
  };
  const ESCENAS = [
    { sub: 'bfbg_paradojal',            fevi: '60', bajo: true  },
    { sub: 'bg_flujo_normal',           fevi: '60', bajo: false },
    { sub: 'bfbg_clasica_flujo_normal', fevi: '40', bajo: false },
    { sub: 'bfbg_clasica',              fevi: '40', bajo: true  }   /* control: la de PR4 */
  ];
  out.t2 = [];
  ESCENAS.forEach((E) => {
    base(E.bajo); set('fevi', E.fevi);
    if (typeof calcVI === 'function') { try { calcVI(); } catch(e){} }
    const R = (typeof eaEscenario === 'function') ? eaEscenario() : null;
    if (typeof generarInforme === 'function') { try { generarInforme(); } catch (e) {} }
    const inf = (g('informe_texto') || {}).value || '';
    const suma = (g('en_suma') || {}).value || '';
    const linea = inf.split('\n').filter(l => l.indexOf('bajo gradiente') >= 0
      || l.indexOf('Estenosis a') === 0).join(' || ');
    out.t2.push({
      pedido: E.sub,
      subReal: R ? R.sub : 'SIN EVALUADOR',
      ava: (g('ava_cont') || {}).value,
      /* El DENOMINADOR: la oracion de la rama tiene que estar en el informe. */
      hayOracion: linea.length > 0,
      oracion: linea.slice(0, 320),
      /* Las tres colas: ninguna puede quedar, ni en el informe ni en el EN SUMA. */
      colasEnInforme: Object.keys(COLAS).filter(k => inf.indexOf(COLAS[k]) >= 0),
      colasEnSuma: Object.keys(COLAS).filter(k => suma.indexOf(COLAS[k]) >= 0),
      /* Ningun numero medido desaparece: los seis del parentesis siguen. */
      /* Los CINCO numeros que el parentesis publica. Los VTI no van en el parentesis. */
      numeros: ['3.4', '28', '0.80', E.fevi + '%'].filter(n => linea.indexOf(n) < 0),
      vli: (() => { const m = linea.match(/VLI ([0-9.]+)/); return m ? m[1] : 'SIN VLI'; })(),
      /* Lo que SE CONSERVA: la descripcion y el aviso del borde. */
      diceNoClasica: linea.indexOf('No configura la forma cl') >= 0,
      diceParadojal: linea.indexOf('paradojal') >= 0,
      diceFlujoNormal: linea.indexOf('flujo normal') >= 0
    });
  });
  /* La linea de discordancia de grado NO es del bloque BF/BG y NO se toca: su escena es
     pastilla severa con mediciones que no la acompanan y SIN escenario discordante. */
  /* Pastilla MODERADA con mediciones de severa CONCORDANTE: asi discordanciaGrado es true y
     _eaDiscordante es false, que es la unica puerta de esa linea. */
  base(true); set('gmedio_ao','55'); set('vmax_ao','4.6'); set('fevi','60');
  set('ea_grado','moderada');
  if (typeof generarInforme === 'function') { try { generarInforme(); } catch (e) {} }
  { const inf = (g('informe_texto') || {}).value || '';
    out.t2discordanciaGrado = {
      ava: (g('ava_cont') || {}).value,
      sigueEnPie: inf.indexOf('Revisar el di') >= 0,
      linea: (inf.split('\n').filter(l => l.indexOf('no coincide con las mediciones') >= 0)[0] || '').slice(0,240) }; }

  /* == TAREA 3: el cor triatriatum == */
  out.t3 = { err: null };
  try {
    const REG = (typeof VINFO !== 'undefined') ? VINFO : null;
    const f = REG ? REG['otr-cortri'] : null;
    if (!f) { out.t3.err = 'SIN FICHA'; }
    else {
      const todo = (f.tit || '') + ' ' + (f.lee || '') + ' ' + (f.fuente || '') + ' ' + (f.ojo || '');
      out.t3.e165 = todo.indexOf('e165') >= 0;
      out.t3.e164 = todo.indexOf('e164') >= 0;
      out.t3.folios163a165 = todo.indexOf('e163 a e165') >= 0;
      out.t3.autorAnio = (f.fuente || '').indexOf('ACC/AHA 2025') >= 0 ? 'ACC/AHA 2025' : 'OTRO';
      /* NINGUNA CLASE PEGADA AL 15: se mide la ventana de 160 caracteres alrededor de «15 mmHg». */
      /* SE MIDE LA ORACION QUE CONTIENE EL 15 mmHg Y NO UNA VENTANA DE CARACTERES: con 80 a
         cada lado se captura el «clase 2a, nivel B-NR» de la oracion ANTERIOR, que es la de la
         recomendacion diagnostica del transesofagico y tiene que quedar. */
      const i = todo.indexOf('15 mmHg');
      let vent = '';
      if (i >= 0) { const ini = todo.lastIndexOf('. ', i), fin = todo.indexOf('. ', i);
        vent = todo.slice(ini < 0 ? 0 : ini + 2, fin < 0 ? todo.length : fin + 1); }
      out.t3.ventana15 = vent;
      /* SE BUSCAN LAS CLASES AFIRMADAS Y NO LA PALABRA «nivel» A SECAS: la oracion de hoy
         dice «no lleva clase ni nivel propios», o sea que NIEGA tener una, y un detector que
         empareje «nivel» marca en rojo justo la frase que viene a arreglar el defecto. */
      out.t3.claseJuntoAl15 = ['clase 1', 'clase 2a', 'clase 2b', 'Clase 1', 'Clase 2a',
        'Clase 2b', 'B-NR', 'C-LD', 'B-R', 'nivel B', 'nivel C', 'Nivel B', 'Nivel C']
        .filter(x => vent.indexOf(x) >= 0);
      out.t3.diceSinClasePropia = vent.indexOf('no lleva clase ni nivel propios') >= 0;
      out.t3.diceUmbralPropuesto = todo.indexOf('UMBRAL PROPUESTO PREVIAMENTE') >= 0;
      out.t3.diceTextoDeApoyo = todo.indexOf('texto de apoyo') >= 0;
      /* La clase 2a B-NR del transesofagico SIGUE, que es de la recomendacion diagnostica. */
      out.t3.clase2aDelEte = (f.ojo || '').indexOf('clase 2a, nivel B-NR') >= 0;
    }
  } catch (e) { out.t3.err = String(e).slice(0, 200); }
  return out;
})()
