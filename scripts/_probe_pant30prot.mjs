#!/usr/bin/env node
/**
 * _probe_pant30prot.mjs - verificacion de la Parte B de PANT-30 (2026-11-10): «Protesis
 * valvulares» en el Laboratorio.
 * Corre sobre UN arbol (--file) y se usa en SERIE sobre los dos lados de un A/B.
 *
 * Mide dos cosas distintas y no las confunde:
 *   (U) LA CUENTA, con una poblacion sintetica de 24 estudios inyectada en el store de verdad
 *       (guardarInformesSeguro) y leida por labGetInformes: las sumas, que las reparaciones NO
 *       se sumen a las protesis, los dos filtros de la tabla de modelos, el gris de los modelos
 *       con menos de 10 estudios, y los trastornos con su total.
 *   (P) LA PANTALLA, con el GESTO REAL: abrir el Laboratorio, abrir el acordeon, y medir que la
 *       seccion este DEBAJO de Valvulopatias, que no lleve data-ppt, el grafico apilado con sus
 *       dos pilas, y a 390 px una sola columna sin desplazamiento horizontal.
 *
 * ⚠️ DENOMINADOR EN LOS DOS: antes de contar se comprueba que labGetInformes devuelva los 24
 *    estudios y que el acordeon este ABIERTO. Un acordeon cerrado no tiene geometria: todo mide
 *    0x0 y se lee igual que «la seccion no esta».
 * ⚠️ CONTROL NEGATIVO: una poblacion sin una sola protesis tiene que dar el mensaje y CERO
 *    graficos, no un grafico vacio.
 * Nombre propio: verificado con ls, no existia.
 */
import { abrir } from './_p30cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3200 });
const R = { file: FILE };

/* La poblacion sintetica. Datos FICTICIOS: el repo es publico.
   24 estudios: 9 aorticas (4 mecanicas del mismo modelo -> menos de 10, 3 biologicas, 2 TAVI),
   6 mitrales (3 mecanicas, 1 biologica, 1 plastia, 1 TEER), 4 tricuspides (2 protesis, 2 rep),
   2 pulmonares, y 3 SIN protesis ni reparacion (el control del denominador). */
const POB = [];
let _id = 1;
function est(campos) { POB.push({ id: _id++, uuid: 'u' + _id, nombre: 'Ficticio ' + _id,
  fecha_estudio: '2026-11-0' + ((_id % 9) + 1), campos: campos }); }
const TXT = {
  signif: 'Válvula aórtica con prótesis mecánica, con criterios que sugieren estenosis protésica significativa (Vmax 4.5 m/s).',
  posible: 'Válvula aórtica con prótesis transcatéter tipo TAVI, con posible estenosis (Vmax 3.2 m/s).',
  faltan: 'Válvula aórtica con prótesis biológica, sin datos suficientes para graduar la estenosis protésica.',
  normo: 'Válvula aórtica con prótesis mecánica tipo normofuncionante (Vmax 2.0 m/s).',
  sinCrit: 'Válvula aórtica con prótesis biológica, sin criterios de estenosis protésica (Vmax 2.1 m/s).',
  sugest: 'Prótesis tricúspide con hallazgos sugestivos de estenosis (gradiente medio 9.0 mmHg, THP 250 ms).',
  aislado: 'Prótesis tricúspide con hallazgo aislado, sin veredicto (THP 250 ms).',
  desaj: 'Desajuste protésico-paciente aórtico severo (AEO indexada 0.44 cm2/m2).',
  nativa: 'Válvula aórtica con estenosis aórtica severa, con posible estenosis de la válvula nativa.'
};
// 4 aorticas mecanicas del mismo modelo (menos de 10): dos con estenosis significativa
for (let i = 0; i < 4; i++) est({ va_morf: 'Prótesis mecánica', va_prot_modelo: 'ATS',
  informe_texto: i < 2 ? TXT.signif : TXT.normo, en_suma: '' });
// 3 aorticas biologicas, modelos distintos
est({ va_morf: 'Prótesis biológica', va_prot_modelo: 'Abbott Epic', informe_texto: TXT.sinCrit });
est({ va_morf: 'Prótesis biológica', va_prot_modelo: 'Abbott Epic', informe_texto: TXT.faltan });
est({ va_morf: 'Prótesis biológica', va_prot_modelo: 'Biocor', informe_texto: TXT.sinCrit });
// 2 TAVI
est({ va_morf: 'TAVI', va_prot_modelo: 'SAPIEN 3', informe_texto: TXT.posible });
est({ va_morf: 'TAVI', va_prot_modelo: 'SAPIEN 3', informe_texto: TXT.desaj });
// mitrales
est({ vm_morf: 'Prótesis mecánica', vm_prot_modelo: 'Carbomedics', informe_texto: '' });
est({ vm_morf: 'Prótesis mecánica', vm_prot_modelo: 'Carbomedics', informe_texto: '' });
est({ vm_morf: 'Prótesis mecánica', vm_prot_modelo: 'Carbomedics', informe_texto: '' });
est({ vm_morf: 'Prótesis biológica', vm_prot_modelo: 'Hancock II', informe_texto: '' });
est({ vm_morf: 'Plastia mitral', informe_texto: 'Válvula mitral con plastia mitral, sin estenosis ni insuficiencia.' });
est({ vm_morf: 'TEER mitral', informe_texto: 'Válvula mitral con reparación transcatéter borde a borde (TEER), sin estenosis ni insuficiencia.' });
// tricuspides
est({ vt_morf: 'Prótesis mecánica', vt_prot_modelo: 'St Jude', informe_texto: TXT.sugest });
est({ vt_morf: 'Prótesis biológica', vt_prot_modelo: 'Hancock', informe_texto: TXT.aislado });
est({ vt_morf: 'Plastia tricuspídea', informe_texto: 'Válvula tricúspide con plastia tricuspídea.' });
est({ vt_morf: 'TEER tricuspídeo (T-TEER)', informe_texto: 'Válvula tricúspide con TEER.' });
// pulmonares
est({ vp_morf: 'Prótesis biológica', vp_prot_modelo: 'Hancock', informe_texto: '' });
est({ vp_morf: 'Prótesis mecánica', vp_prot_modelo: 'St Jude', informe_texto: '' });
// un estudio con DOS posiciones: aortica con estenosis y mitral sana
est({ va_morf: 'Prótesis mecánica', va_prot_modelo: 'ATS', vm_morf: 'Prótesis biológica',
      vm_prot_modelo: 'Hancock II', informe_texto: TXT.signif });
// 3 SIN protesis ni reparacion, uno de ellos con una estenosis NATIVA que no debe contarse
est({ va_morf: 'Calcificada', informe_texto: TXT.nativa });
est({ vm_morf: 'Reumática', informe_texto: '' });
est({ nombre: 'sin nada', informe_texto: '' });

R.pob = POB.length;

R.inyecta = await S.ev(async (pob) => {
  if (typeof guardarInformesSeguro !== 'function') return { fn: false };
  const ok = await guardarInformesSeguro(pob);
  /* ⚠️ LA PESTAÑA SE ABRE ANTES DE TOCAR EL PERIODO, y es por un defecto PREEXISTENTE de
     showTab que esta sonda destapo: su ultima linea es
     `if (typeof event !== 'undefined' && event && event.target) event.target.classList.add(...)`,
     que lee el `window.event` GLOBAL. Llamada por programa justo despues de despachar un evento,
     ese global todavia trae el evento anterior y la linea tira
     «Cannot read properties of undefined (reading 'add')» -- o sea showTab falla sin cambiar de
     pestaña, y la sonda mide la pestaña equivocada. No lo toca esta tanda: queda declarado en
     P30-d.
     ⚠️ Y EL EVENTO PENDIENTE LO DEJA INDEXEDDB, medido: despues de `guardarInformesSeguro`
     `window.event` es el `success` de la transaccion y su `target` es un **IDBTransaction**, que
     no tiene `classList`. Reordenar no alcanza -- hay que CEDER EL TURNO, que es lo que limpia el
     global: medido, con un setTimeout de 10 ms `typeof window.event` vuelve a 'undefined' y
     showTab funciona.
     El periodo de fabrica son 365 dias: con fechas de noviembre de 2026 entran todas. Igual se
     fuerza «todo» (la opcion '0', censada en el select) para que la medicion no dependa del
     reloj de la maquina. */
  await new Promise(r => setTimeout(r, 30));
  if (window.showTab) showTab('lab');
  await new Promise(r => setTimeout(r, 300));
  const p = document.getElementById('lab-periodo');
  if (p) { p.value = '0'; p.dispatchEvent(new Event('change', { bubbles: true })); }
  await new Promise(r => setTimeout(r, 400));
  if (typeof labInit === 'function') labInit();
  await new Promise(r => setTimeout(r, 900));
  return { fn: true, ok: !!ok,
           leidos: (typeof labGetInformes === 'function') ? labGetInformes().length : null,
           opcionesPeriodo: p ? Array.prototype.map.call(p.options, o => o.value) : null };
}, POB);

R.U = await S.ev(() => {
  const infs = labGetInformes();
  const S2 = window._labProtStats(infs);
  const mods = Object.keys(S2.modelos).map(k => S2.modelos[k])
    .sort((a, b) => (b.n - a.n) || a.modelo.localeCompare(b.modelo))
    .map(m => [m.modelo, m.posLbl, m.tipo, m.n, m.alt]);
  return {
    n: S2.n, conAlgo: S2.conAlgo, conProt: S2.conProt, conRep: S2.conRep,
    porPos: Object.keys(S2.porPos).reduce((o, k) => { o[k] = S2.porPos[k].tipos; return o; }, {}),
    totalPorPos: Object.keys(S2.porPos).reduce((o, k) => { o[k] = S2.porPos[k].total; return o; }, {}),
    trast: S2.trast, altTotal: S2.altTotal, conProtParaTrast: S2.conProtParaTrast,
    modelos: mods, nModelos: mods.length
  };
});

R.P = await S.ev(async () => {
  const o = {};
  /* ⚠️ PRIMERO LA SUBPESTAÑA «Mediciones» Y DESPUES EL ACORDEON. La subtab de fabrica es
     «General», asi que #lab-sub-mediciones nace oculto: el clic en el encabezado corre, el
     acordeon se abre, y TODO mide 0x0 porque el panel que lo contiene no tiene geometria. La
     primera corrida de esta sonda dio abierto=false y el canvas en 0x0 -- que se lee igual que
     «la seccion no se pinta»-- con el grafico ya creado y con datos. */
  const sub = Array.prototype.slice.call(document.querySelectorAll('.lab-subtab'))
    .filter(b => (b.getAttribute('onclick') || '').indexOf("'mediciones'") > -1)[0];
  o.subtab = !!sub;
  if (sub) sub.click();
  await new Promise(r => setTimeout(r, 400));
  o.panelMediciones = !!(document.getElementById('lab-sub-mediciones') || {}).offsetParent;
  /* Abre el acordeon. Sin esto todo mide 0x0. */
  const hdr = document.querySelector('[aria-controls="lab-acc-protesis"]');
  o.hdr = !!hdr;
  if (hdr) hdr.click();
  await new Promise(r => setTimeout(r, 700));
  const body = document.getElementById('lab-acc-protesis');
  o.abierto = !!(body && body.offsetParent);
  const card = body ? body.closest('.lab-card') : null;
  o.dataPpt = card ? card.getAttribute('data-ppt') : 'sin card';
  o.dataPptNo = card ? !!card.getAttribute('data-ppt-no') : null;
  /* Debajo de Valvulopatias y antes de Doppler tricuspideo: por orden en el DOM. */
  const cards = Array.prototype.slice.call(document.querySelectorAll('#lab-sub-mediciones > .lab-card'));
  o.orden = cards.map(c => (c.querySelector('.lab-card-hdr') || {}).textContent || '')
    .map(t => t.replace(/[▶▼]/g, '').trim());
  o.idx = cards.indexOf(card);
  o.idxValv = o.orden.findIndex(t => t.indexOf('Valvulopatías') > -1);
  o.idxDop = o.orden.findIndex(t => t.indexOf('Doppler tricuspídeo') > -1);
  o.resumen = (document.getElementById('lab-prot-resumen') || {}).children ?
    document.getElementById('lab-prot-resumen').children.length : 0;
  o.resumenTxt = (document.getElementById('lab-prot-resumen') || {}).innerText || '';
  o.vacioOculto = !!(document.getElementById('lab-prot-vacio') || {}).hidden;
  o.cuerpoVisible = !(document.getElementById('lab-prot-cuerpo') || {}).hidden;
  const cv = document.getElementById('lab-prot-chart');
  o.canvas = cv ? { w: Math.round(cv.getBoundingClientRect().width), h: Math.round(cv.getBoundingClientRect().height) } : null;
  const ch = (typeof Chart !== 'undefined' && cv) ? Chart.getChart(cv) : null;
  o.chart = ch ? {
    tipo: ch.config.type, eje: ch.options.indexAxis,
    apilado: !!(ch.options.scales && ch.options.scales.x && ch.options.scales.x.stacked),
    series: ch.data.datasets.map(d => [d.label, d.stack, d.data.join(',')]),
    pilas: Array.from(new Set(ch.data.datasets.map(d => d.stack)))
  } : null;
  o.filas = document.querySelectorAll('#lab-prot-mod-tabla tbody tr').length;
  o.pie = (document.getElementById('lab-prot-mod-tabla') || {}).innerText || '';
  o.trastBarras = document.querySelectorAll('#lab-prot-trast .lab-bar-row').length;
  o.trastTotal = (document.getElementById('lab-prot-trast-total') || {}).innerText || '';
  /* Los filtros */
  const fp = document.getElementById('lab-prot-mod-pos'), ft = document.getElementById('lab-prot-mod-tipo');
  fp.value = 'vm'; fp.dispatchEvent(new Event('change', { bubbles: true }));
  await new Promise(r => setTimeout(r, 200));
  o.filasMitral = document.querySelectorAll('#lab-prot-mod-tabla tbody tr').length;
  ft.value = 'mec'; ft.dispatchEvent(new Event('change', { bubbles: true }));
  await new Promise(r => setTimeout(r, 200));
  o.filasMitralMec = document.querySelectorAll('#lab-prot-mod-tabla tbody tr').length;
  fp.value = ''; ft.value = '';
  fp.dispatchEvent(new Event('change', { bubbles: true }));
  await new Promise(r => setTimeout(r, 200));
  o.filasVuelta = document.querySelectorAll('#lab-prot-mod-tabla tbody tr').length;
  return o;
});

/* ── CONTROL NEGATIVO: poblacion sin una sola protesis ── */
R.vacio = await S.ev(async () => {
  await guardarInformesSeguro([{ id: 901, uuid: 'z1', nombre: 'Ficticio sin protesis',
    fecha_estudio: '2026-11-05', campos: { va_morf: 'Calcificada', informe_texto: 'Estenosis aórtica severa.' } }]);
  await new Promise(r => setTimeout(r, 30));
  if (typeof labInit === 'function') labInit();
  await new Promise(r => setTimeout(r, 900));
  const cv = document.getElementById('lab-prot-chart');
  return {
    leidos: labGetInformes().length,
    vacioVisible: !(document.getElementById('lab-prot-vacio') || {}).hidden,
    mensaje: (document.getElementById('lab-prot-vacio') || {}).textContent,
    cuerpoOculto: !!(document.getElementById('lab-prot-cuerpo') || {}).hidden,
    chartDestruido: !(typeof Chart !== 'undefined' && cv && Chart.getChart(cv))
  };
});

/* ── Celular ── */
await S.viewport(390, 844);
await S.esperar(400);
R.celular = await S.ev(() => ({
  scrollH: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  grid: (function () { const g = document.getElementById('lab-prot-resumen');
    return g ? getComputedStyle(g).gridTemplateColumns : null })()
}));

R.errores = S.errs;
console.log(JSON.stringify(R, null, 1));
S.cerrar();
process.exit(0);
