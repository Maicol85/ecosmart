#!/usr/bin/env node
/**
 * _probe_pant31papel.mjs - R8 a R10 de PANT-31 (2026-11-10). Un arbol (--file), apto para A/B.
 * Mide el PAPEL DE VERDAD: el maquetador y el PDF generado con jsPDF, hoja por hoja.
 *  R8 cuerpo 10,2 pt / 13,4 pt en los TRES consentimientos; el salto donde la orden lo pide;
 *     DOS hojas cada uno mas la hoja comun; el aire de la declaracion y de las dos lineas de
 *     casillas; y la declaracion con la tabla de firmas SIEMPRE en la misma hoja.
 *  R9 las hojas comunes sin titulo, con sus dos subtitulos, en UNA hoja.
 *  R10 al menos 6 mm entre «Se firma el presente en...» y la tabla, y la fila «Firma» de 16 mm.
 * Nombre propio: verificado con ls, no existia.
 */
import { abrir } from './_p31cdp.mjs';
const FILE = (process.argv.find(a => a.startsWith('--file=')) || '').split('=')[1]
  || '/Users/maicoldossantos/Desktop/APLICACIONES/ecosmart/index.html';
const S = await abrir(FILE, { espera: 3400 });
const R = { file: FILE };
R.entrar = await S.entrar();
await S.viewport(1440, 900);
await S.ev(() => {
  const set = (id, v) => { const e = document.getElementById(id); if (e) { e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); } };
  try {
    localStorage.setItem('centro_tipo_activo', 'default');
    localStorage.setItem('centro_nombre_activo', 'Centro Ficticio de Cardiologia del Norte');
    localStorage.setItem('ett_medicos', JSON.stringify([{ nombre: 'Dra. Ficticia Perez', matricula: '12345', especialidad: 'Cardiologia' }]));
    localStorage.setItem('ett_medico_principal', '0');
  } catch (e) {}
  set('nombre', 'Prueba Ficticia, Ana'); set('ci', '1.234.567-8'); set('sexo', 'F');
  set('cfg-med-lugar', 'Artigas');
  if (window.showTab) showTab('informe');
});
await S.esperar(400);

R.docs = await S.ev(() => {
 try {
  const G = DOC_GEO, out = {};
  /* ⚠️ `String(...)`: el `s` de una operacion `box` es el LADO, un NUMERO, asi que sin esto
     `txtDe(o).indexOf` revienta sobre la primera casilla dibujada. */
  const txtDe = o => String(o.k === 'tw' ? o.ws.map(w => w.s).join(' ') : (o.s === undefined || o.s === null ? '' : o.s));
  Object.keys(DOC_DEFS).forEach(cl => {
    const def = DOC_DEFS[cl], D = docDatos();
    const bl = docBloquesNuevos(def, D);
    const maq = docMaquetar(def, D, bl);
    /* el PDF DE VERDAD */
    const pdf = docOpsAPdf(def, maq);
    const nPdf = pdf.getNumberOfPages();
    /* en que hoja cae cada hito */
    const hojaDe = frag => {
      for (let h = 0; h < maq.hojas.length; h++)
        if (maq.hojas[h].some(o => txtDe(o).indexOf(frag) === 0 || txtDe(o).indexOf(frag) > -1)) return h + 1;
      return null;
    };
    /* la tinta por hoja: nada por fuera de la caja */
    const fuera = [];
    maq.hojas.forEach((ops, h) => {
      ops.forEach(o => {
        const xs = o.k === 'tw' ? o.ws.map(w => w.x) : [o.x === undefined ? G.ML : o.x];
        const yy = (o.y === undefined) ? G.MT : o.y;
        if (yy > G.H - G.MB + 0.6 && yy < G.PIE - 0.6) fuera.push('h' + (h + 1) + ' y=' + yy);
        xs.forEach(x => { if (x < G.ML - 0.6 || x > G.W - G.MR + 0.6) fuera.push('h' + (h + 1) + ' x=' + x); });
      });
    });
    /* la declaracion y la tabla de firmas, en la misma hoja */
    const hDecl = hojaDe('Declaración y consentimiento');
    const hTabla = (function () {
      for (let h = 0; h < maq.hojas.length; h++)
        if (maq.hojas[h].some(o => o.k === 'c2' && o.s === 'Paciente')) return h + 1;
      return null;
    })();
    /* R10: la distancia entre «Se firma el presente» y el borde de arriba de la tabla */
    let yFirma = null, yTabla = null;
    maq.hojas.forEach(ops => {
      ops.forEach(o => { if (txtDe(o).indexOf('Se firma el presente') === 0) yFirma = o.y; });
      const cab = ops.filter(o => o.k === 'rect' && o.relleno)[0];
      if (cab) yTabla = cab.y;
    });
    /* la fila «Firma»: el alto del rectangulo que sigue a la cabecera */
    const filaFirma = (function () {
      for (const ops of maq.hojas) {
        const rs = ops.filter(o => o.k === 'rect');
        if (rs.length >= 2) return rs[1].h;
      }
      return null;
    })();
    /* las casillas DIBUJADAS de la linea de «capacitado» */
    const cajas = [];
    maq.hojas.forEach((ops, h) => ops.forEach(o => { if (o.k === 'box') cajas.push({ hoja: h + 1, y: Math.round(o.y * 10) / 10, lado: Math.round(o.s * 100) / 100 }); }));
    /* ⚠️ LAS CASILLAS DE LA LINEA DE «capacitado» SE CUENTAN POR GRUPO Y NO BUSCANDO SU TEXTO:
       `parrafoCasillas` emite una operacion POR PALABRA, asi que la primera dice «El» y no la
       oracion entera. El ultimo grupo de casillas del documento es el de esa linea -- la
       declaracion es lo ultimo que las usa-. */
    const gr = [];
    cajas.forEach(c => { const g = gr.find(x => x.hoja === c.hoja && Math.abs(x.y - c.y) < 0.05);
      if (g) g.n++; else gr.push({ hoja: c.hoja, y: c.y, n: 1 }); });
    const cajasEnEsaLinea = gr.length ? gr[gr.length - 1].n : 0;
    const gruposCasillas = gr.length;
    /* el aire entre vinietas de la declaracion: y de la 1ra y de la 2da vinieta */
    const vinietas = [];
    maq.hojas.forEach(ops => ops.forEach(o => { if (o.k === 't' && o.s === '•') vinietas.push(Math.round(o.y * 100) / 100); }));
    /* el titulo de las hojas comunes */
    const tieneTitComun = maq.hojas.some(ops => ops.some(o => txtDe(o).indexOf('HOJAS COMUNES') > -1));
    const hojaComun = hojaDe('Niño o paciente imposibilitado');
    const hojaRevoc = hojaDe('Derecho a no otorgar consentimiento');
    out[cl] = {
      sz: def.sz, lh: def.lh, defHojas: def.hojas,
      hojasMaq: maq.n, hojasPdf: nPdf, coinciden: maq.n === nPdf,
      tintaFuera: fuera.slice(0, 6), nFuera: fuera.length,
      hojaAntesDelEstudio: hojaDe('Antes del estudio'),
      hojaAlternativas: hojaDe('¿Hay otras alternativas?'),
      hojaDeclaracion: hDecl, hojaTablaFirmas: hTabla,
      declaracionYFirmasJuntas: (hDecl !== null && hDecl === hTabla),
      yFirma: yFirma, yTabla: yTabla,
      mmEntreFirmaYTabla: (yFirma !== null && yTabla !== null) ? Math.round((yTabla - yFirma) * 100) / 100 : null,
      altoFilaFirma: filaFirma,
      nCajasDibujadas: cajas.length, cajasEnLineaCapacitado: cajasEnEsaLinea,
      gruposCasillas: gruposCasillas,
      ladoCaja: cajas.length ? cajas[0].lado : null,
      aireVinietas: vinietas.length > 1 ? Math.round((vinietas[1] - vinietas[0]) * 100) / 100 : null,
      nVinietas: vinietas.length,
      tituloHojasComunes: tieneTitComun,
      hojaComunArranca: hojaComun, hojaComunRevocacion: hojaRevoc,
      comunEnUnaHoja: (hojaComun !== null && hojaComun === hojaRevoc && hojaComun === maq.n)
    };
  });
  return out;
 } catch (e) { return { ERROR: String(e && e.message || e) + ' | ' + String(e && e.stack || '').slice(0, 300) }; }
});

/* El aire de las dos lineas de casillas y de las vinietas de la declaracion.
   ⚠️ SE MIDE POR LAS CASILLAS DIBUJADAS Y NO BUSCANDO SU TEXTO, y se midio por que: la linea de
   «capacitado» la emite `parrafoCasillas` PALABRA POR PALABRA, asi que su primera operacion dice
   «El» y no la oracion entera -- buscar la frase devolvia null-; y en el ETE hay OCHO lineas de
   `chk2` que tambien empiezan con «Si», asi que buscar «Si» medía una de esas, 25 lineas antes. */
R.aire = await S.ev(() => {
  const out = {};
  ['cve', 'ete', 'burb'].forEach(cl => {
    const def = DOC_DEFS[cl], D = docDatos();
    const maq = docMaquetar(def, D, docBloquesNuevos(def, D));
    const LH = def.lh * DOC_GEO.PT;
    /* todas las lineas: la y de cada operacion de texto, y la de cada grupo de casillas */
    const lineas = [];
    const grupos = [];
    maq.hojas.forEach((ops, h) => ops.forEach(o => {
      if (o.k === 't' || o.k === 'tw' || o.k === 'c' || o.k === 'r' || o.k === 'c2')
        lineas.push({ h: h + 1, y: o.y });
      if (o.k === 'box') {
        const g = grupos.find(g2 => g2.h === h + 1 && Math.abs(g2.y - o.y) < 0.05);
        if (g) g.n++; else grupos.push({ h: h + 1, y: o.y, n: 1, lado: o.s });
      }
    }));
    grupos.forEach(g => lineas.push({ h: g.h, y: g.y + g.lado }));
    lineas.sort((a, b) => (a.h - b.h) || (a.y - b.y));
    const previa = (h, y) => {
      let mejor = null;
      lineas.forEach(l => { if (l.h === h && l.y < y - 0.05 && (mejor === null || l.y > mejor)) mejor = l.y; });
      return mejor;
    };
    /* los dos ultimos grupos de casillas son el de investigacion y el de «capacitado» */
    const ult = grupos.slice(-2);
    const medir = g => {
      if (!g) return null;
      const base = g.y + g.lado, p = previa(g.h, base);
      return p === null ? null : Math.round((base - p) * 100) / 100;
    };
    /* el aire entre vinietas de la DECLARACION: las ultimas del documento */
    const vin = [];
    maq.hojas.forEach((ops, h) => ops.forEach(o => { if (o.k === 't' && o.s === '\u2022') vin.push({ h: h + 1, y: o.y }); }));
    const decl = vin.slice(-4);
    const pasos = [];
    for (let q = 1; q < decl.length; q++)
      if (decl[q].h === decl[q - 1].h) pasos.push(Math.round((decl[q].y - decl[q - 1].y) * 100) / 100);
    out[cl] = {
      LH: Math.round(LH * 100) / 100,
      nGruposCasillas: grupos.length,
      investigacion: { n: ult[0] ? ult[0].n : null, aire: medir(ult[0]) },
      capacitado: { n: ult[1] ? ult[1].n : null, aire: medir(ult[1]) },
      /* una vinieta de una sola linea deberia dar LH + 5 pt = LH + 1,76 mm */
      pasosVinietasDeclaracion: pasos,
      esperadoConAire: Math.round((LH + 5 * DOC_GEO.PT) * 100) / 100,
      esperadoCon8pt: Math.round((LH + 8 * DOC_GEO.PT) * 100) / 100
    };
  });
  return out;
});

R.errores = S.errs.slice(0, 10);
console.log(JSON.stringify(R, null, 1));
S.cerrar();
process.exit(0);
