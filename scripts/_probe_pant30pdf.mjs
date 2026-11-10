#!/usr/bin/env node
/**
 * _probe_pant30pdf.mjs - la seccion «Protesis valvulares» en el PDF de auditoria del
 * Laboratorio (PANT-30, commit 5).
 * ⚠️ GENERA EL PDF DE VERDAD y lee su TEXTO, no el DOM: lo que esta tanda agrega es papel, y
 *    una medicion sobre la pantalla no prueba nada sobre el papel. Se intercepta doc.save para
 *    quedarse con el documento sin escribir un archivo, y se extrae el texto hoja por hoja.
 * Mide: que la seccion exista; que este DESPUES de Valvulopatias y ANTES de «Funcion VD»; el
 * resumen; la grafica apilada como imagen; la tabla de trastornos con sus ocho filas y las dos
 * marcadas «(aparte)»; la tabla de modelos con TOPE de 15 y la linea «y N modelos mas.»; y la
 * nota de pocos casos.
 * ⚠️ CONTROL NEGATIVO: con una poblacion sin protesis la seccion dice su frase y NO dibuja
 *    ninguna tabla ni ninguna imagen.
 * Nombre propio: verificado con ls, no existia.
 */
import { abrir } from './_p30cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3200 });
const R = { file: FILE };

/* 40 estudios: 18 con una protesis aortica mecanica del MISMO modelo (para que pase de 10 y no
   salga en gris) y 22 repartidos en 17 modelos distintos, para que el tope de 15 se active.
   Datos FICTICIOS: el repo es publico. */
const POB = [];
let id = 1;
const MODS = ['ATS','Abbott Epic','Biocor','Bioflo','Bjork-Shiley','Carbomedics Standard',
  'Cryolife','Edwards Duromedics','Edwards Intuity','Hancock II','Medtronic Hall','Mosaic',
  'On-X','Omnicarbon','Sorin Bicarbon','St Jude Standard','Starr-Edwards'];
for (let i = 0; i < 18; i++) POB.push({ id: id++, uuid: 'u' + id, nombre: 'F' + id,
  fecha_estudio: '2026-11-05', campos: { va_morf: 'Prótesis mecánica', va_prot_modelo: 'Sorin Mitroflow',
    informe_texto: i < 5 ? 'Válvula aórtica con prótesis mecánica, con criterios que sugieren estenosis protésica significativa (Vmax 4.5 m/s).' : 'Válvula aórtica con prótesis mecánica tipo normofuncionante (Vmax 2.0 m/s).' } });
MODS.forEach((m, i) => POB.push({ id: id++, uuid: 'u' + id, nombre: 'F' + id,
  fecha_estudio: '2026-11-06', campos: { va_morf: 'Prótesis biológica', va_prot_modelo: m,
    informe_texto: 'Válvula aórtica con prótesis biológica, sin criterios de estenosis protésica (Vmax 2.1 m/s).' } }));
POB.push({ id: id++, uuid: 'u' + id, nombre: 'Fp', fecha_estudio: '2026-11-07',
  campos: { vm_morf: 'Plastia mitral', informe_texto: 'Válvula mitral con plastia mitral.' } });
POB.push({ id: id++, uuid: 'u' + id, nombre: 'Ft', fecha_estudio: '2026-11-07',
  campos: { vt_morf: 'Prótesis mecánica', vt_prot_modelo: 'St Jude',
            informe_texto: 'Prótesis tricúspide con hallazgo aislado, sin veredicto (THP 250 ms).' } });
R.pob = POB.length;

/* ⚠️ LA FUNCION DE MEDICION ES UNA FUNCION DE VERDAD Y NO UNA CADENA: escrita como cadena hay
   que escapar las barras invertidas de cada expresion regular para que sobrevivan al literal, y
   la primera version de esta sonda ni siquiera llego a correr. Se pasa la MISMA funcion dos
   veces -- la poblacion con protesis y el control negativo-- asi que el reuso no necesita una
   cadena. */
const medir = async function (pob) {
  await guardarInformesSeguro(pob);
  await new Promise(r => setTimeout(r, 40));
  if (window.showTab) showTab('lab');
  await new Promise(r => setTimeout(r, 300));
  const p = document.getElementById('lab-periodo');
  if (p) { p.value = '0'; p.dispatchEvent(new Event('change', { bubbles: true })); }
  if (typeof labInit === 'function') labInit();
  await new Promise(r => setTimeout(r, 800));
  /* Se intercepta jsPDF.save para quedarse con el documento sin escribir un archivo. */
  const { jsPDF } = window.jspdf;
  let capt = null;
  const orig = jsPDF.API.save;
  jsPDF.API.save = function () { capt = this; return this; };
  const _t = window.toast; window.toast = function () {};
  /* ⚠️ LAS IMAGENES SE CUENTAN ENVOLVIENDO addImage Y NO BUSCANDO «/I<n> Do» EN EL FLUJO: ese
     patron devolvia 12 en los DOS lados -- con la grafica y sin ella-- o sea un numero que no
     distingue nada y se lee como «la imagen no entro». Envuelta, cada colocacion se cuenta. */
  const origImg = jsPDF.API.addImage;
  const colocadas = [];
  jsPDF.API.addImage = function (d, f, x2, y2, w2, h2) {
    colocadas.push({ w: Math.round(w2 || 0), h: Math.round(h2 || 0) });
    return origImg.apply(this, arguments);
  };
  try { await labGenerarPDF(); }
  catch (e) { jsPDF.API.save = orig; window.toast = _t; jsPDF.API.addImage = origImg;
              return { error: String(e).slice(0, 200) }; }
  jsPDF.API.save = orig; window.toast = _t; jsPDF.API.addImage = origImg;
  if (!capt) return { error: 'no se capturo el PDF' };
  const n = capt.getNumberOfPages();
  const hojas = [];
  for (let i = 1; i <= n; i++) {
    const raw = (capt.internal.pages[i] || []).join('\n');
    /* El texto sale del propio flujo del PDF: se juntan los operadores Tj. */
    const txt = (raw.match(/\((?:[^()\\]|\\.)*\)\s*Tj/g) || [])
      .map(x => x.replace(/\)\s*Tj$/, '').replace(/^\(/, '').replace(/\\([()\\])/g, '$1'))
      .join(' ');
    hojas.push(txt);
  }
  const todo = hojas.join(' @@HOJA@@ ');
  const pos = x => todo.indexOf(x);
  const imgs = colocadas.length;
  /* La grafica de esta seccion se coloca con 150 mm de ancho; ninguna otra del documento usa
     ese ancho (la de valvulopatias va con 170). */
  const imgProt = colocadas.filter(function (c) { return c.w === 150; }).length;
  return {
    hojas: n, chars: todo.length,
    iProt: pos('Protesis valvulares'),
    iValv: pos('Valvulopatias'),
    iVD: pos('Funcion VD (TAPSE)'),
    tieneNotaDenominador: pos('Se cuentan estudios, no pacientes') > -1,
    tieneResumen: pos('Estudios con protesis o reparacion') > -1,
    tieneConProt: pos('Con protesis') > -1,
    tieneRep: pos('Con plastica o TEER') > -1,
    tieneLeyenda: pos('reparaciones (no son protesis)') > -1,
    tieneTrast: pos('Trastornos de las protesis') > -1,
    aparte: (todo.match(/\(aparte\)/g) || []).length,
    tieneAlgunaAlt: pos('Con alguna alteracion:') > -1,
    tieneModelos: pos('Modelos mas usados') > -1,
    modelosMas: (todo.match(/y \d+ modelos mas\./g) || [])[0] || null,
    pocosCasos: pos('Pocos casos: no alcanza') > -1,
    sinProtesis: pos('Sin estudios con protesis en este periodo.') > -1,
    imagenes: imgs, imagenesDe150: imgProt, anchos: colocadas.map(function (c) { return c.w; }),
    filasModelo: (todo.match(/Sorin Mitroflow|Abbott Epic|Biocor|Bioflo|Bjork-Shiley/g) || []).length
  };
};

R.conProtesis = await S.ev(medir, POB);

/* Control negativo */
R.sinProtesis = await S.ev(medir, [
  { id: 900, uuid: 'z', nombre: 'Ficticio', fecha_estudio: '2026-11-05',
    campos: { va_morf: 'Calcificada', informe_texto: 'Estenosis aórtica severa.' } }]);

R.errores = S.errs;
console.log(JSON.stringify(R, null, 1));
S.cerrar();
process.exit(0);
