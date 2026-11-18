#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Genera el RESUMEN DE CONSULTA de la ficha de posoperatorio de Referencias (ref-pop).

Punto 7 de la tarea del 18/11. La especificacion de cada bloque y la fuente de cada
afirmacion viven UNA sola vez, aca: de este archivo salen el MARCADO que se pega en
`index.html` y `docs/CONTROL_POP_REF.md`, que es la trazabilidad. Nada se retipea.

FUENTE: ~/Desktop/EcoSmart_Estudio_Hemodinamica/Estudio_Hemodinamica_EcoSmart.docx,
capitulos 8, 9 y 10 (solo lectura).

REGLAS QUE ESTE GENERADOR APLICA, y por las que hay cosas que NO salen:
  · Solo lo que el Word respalda con fuente y folio.
  · NADA de lo que el Word marca «verificar a ojo».
  · NADA de las contradicciones que su capitulo 12 muestra sin resolver.
  · NINGUN coeficiente de escala de riesgo.
  · Descriptivo: ni una conducta, ni una dosis, ni una secuencia terapeutica.
  · Ningun texto dice que dos fuentes no coinciden ni que algo no se encontro
    (regla fija del 2026-11-04).
  · No se repite lo que `ref-pop` ya publica en su tabla ni lo que las fichas de
    Hemodinamica ya publican (ver docs/CONTROL_HEMO_REF.md).

Uso:  python3 scripts/_gen_pop_ref.py        -> escribe el .md y imprime el marcado
"""
import io, os, sys

# (titulo, [parrafos], fuente, [(afirmacion, folio) para la trazabilidad])
BLOQUES = [
 ("Bajo gasto posoperatorio: lo que la guía del posoperatorio complicado consigna",
  ["La guía española del posoperatorio complicado consigna, junto al índice cardíaco, "
   "la afectación de órganos —oliguria— y la necesidad de inotrópicos o de soporte "
   "mecánico circulatorio, siempre en ausencia de hipovolemia relativa."],
  "Llanos 2020, hoja 6 del PDF (la guía no trae folio impreso).",
  [("Afectacion de organos (oliguria), necesidad de inotropicos o de soporte mecanico, "
    "sin hipovolemia relativa", "Llanos 2020, hoja 6")]),

 ("Shock postcardiotomía",
  ["Es la forma más grave del bajo gasto: la imposibilidad de separar al paciente de la "
   "circulación extracorpórea, o un shock que persiste después de la cirugía a pesar de "
   "los fármacos vasoactivos y del balón de contrapulsación."],
  "Llanos 2020, hoja 8 del PDF.",
  [("Definicion del shock postcardiotomia", "Llanos 2020, hoja 8")]),

 ("Síndrome vasopléjico: frecuencia y mecanismo",
  ["Afecta hasta cerca de la mitad de los pacientes, en mayor o menor grado.",
   "Su fisiopatología se parece a la del shock séptico sin agente infeccioso: el insulto "
   "quirúrgico, la isquemia-reperfusión y la propia circulación extracorpórea. Los cortes "
   "con que esta aplicación la evalúa están en la tabla de criterios de más abajo."],
  "Llanos 2020, hoja 9 del PDF.",
  [("Hasta cerca del 50 % de los pacientes", "Llanos 2020, hoja 9"),
   ("Fisiopatologia: insulto quirurgico, isquemia-reperfusion y circulacion extracorporea",
    "Llanos 2020, hoja 9")]),

 ("Sangrado excesivo",
  ["Se considera sangrado excesivo un volumen mayor de un litro en las primeras "
   "veinticuatro horas."],
  "Llanos 2020, hoja 5 del PDF.",
  [("Sangrado excesivo: mas de 1 litro en las primeras 24 h", "Llanos 2020, hoja 5")]),

 ("Riesgo quirúrgico: EuroSCORE II",
  ["Es un modelo de regresión logística construido con 22.381 pacientes de 154 centros de "
   "43 países, reclutados entre mayo y julio de 2010, con una mortalidad global del 3,9 %.",
   "En su validación, sobre 5.553 pacientes, la mortalidad observada fue del 4,18 % frente "
   "al 3,95 % predicho, con un área bajo la curva de 0,8095. El clearance de creatinina que "
   "el modelo usa se calcula por Cockcroft-Gault."],
  "Nashef 2012, folios 734, 736 y 743.",
  [("22.381 pacientes, 154 centros, 43 paises; mortalidad global 3,9 %", "Nashef 2012, f. 734"),
   ("Validacion: 5.553 pacientes, 4,18 % observada frente a 3,95 % predicha, AUC 0,8095",
    "Nashef 2012, f. 743"),
   ("Clearance de creatinina por Cockcroft-Gault", "Nashef 2012, f. 736")]),

 ("Riesgo quirúrgico: los modelos de la STS de 2018",
  ["Modelan nueve desenlaces: mortalidad operatoria, accidente cerebrovascular, falla renal, "
   "ventilación prolongada, reoperación, infección profunda de la herida esternal o "
   "mediastinitis, una variable compuesta de morbimortalidad, y la estadía posoperatoria "
   "prolongada y la corta.",
   "Cubren cinco procedimientos: puente coronario aislado, recambio aórtico aislado, mitral "
   "aislado, aórtico con puente coronario y mitral con puente coronario. Se desarrollaron con "
   "439.092 pacientes de puente coronario, 150.150 valvulares y 81.588 valvulares con puente, "
   "entre julio de 2011 y junio de 2014, y se validaron entre julio de 2014 y diciembre de 2016."],
  "Shahian 2018, folios 1411 y 1412.",
  [("Nueve desenlaces modelados", "Shahian 2018, f. 1411-1412"),
   ("Cinco procedimientos", "Shahian 2018, f. 1411-1412"),
   ("n de desarrollo y ventanas de desarrollo y validacion", "Shahian 2018, f. 1411-1412")]),

 ("Resultados del puente coronario en el registro de la STS",
  ["La mortalidad del puente coronario pasó del 3,05 % entre 1997 y 1999 a cerca del 2 % en "
   "2008 y a menos del 2 % en 2013. La morbilidad mayor fue del 13,4 % sobre 503.478 "
   "pacientes, y la infección profunda de la herida esternal, menor del 3 %."],
  "Braunwald 10.ª ed., folios 1213 y 1215.",
  [("Mortalidad del CABG 3,05 % (1997-99), cerca de 2 % (2008), menos de 2 % (2013)",
    "Braunwald 10.a ed., f. 1215"),
   ("Morbilidad mayor 13,4 % sobre 503.478 pacientes", "Braunwald 10.a ed., f. 1215"),
   ("Infeccion profunda de la herida esternal menor del 3 %", "Braunwald 10.a ed., f. 1213")]),

 ("Manejo de sangre perioperatorio",
  ["La guía conjunta de la Sociedad de Cirujanos Torácicos, la Sociedad Americana de "
   "Circulación Extracorpórea y la Sociedad de Anestesiólogos Cardiovasculares reúne "
   "veintitrés recomendaciones nuevas o actualizadas tras revisar 1.227 resúmenes y 87 "
   "artículos. Sus Tablas 1 y 2 las listan con su clase y su nivel."],
  "Tibi 2021, folios 981 a 984.",
  [("23 recomendaciones nuevas o actualizadas; 1.227 resumenes y 87 articulos revisados",
    "Tibi 2021, f. 981-982"),
   ("Las Tablas 1 y 2 reunen las recomendaciones con su clase y nivel", "Tibi 2021, f. 982-984")]),
]

# Lo que queda AFUERA, con su motivo. No se escribe en la aplicacion ni para decir que falta.
AFUERA = [
 ("Los umbrales de lactato y de saturacion venosa del bajo gasto posoperatorio "
  "(lactato >2 y SvO2 <65 % frente a lactato >3 y ScvO2 <60 %)",
  "contradiccion entre fuentes que el capitulo 12 del Word muestra sin resolver, y la orden la excluye por su nombre"),
 ("El Swan-Ganz como patron de referencia del bajo gasto posoperatorio y el cateter de arteria "
  "pulmonar en general",
  "el capitulo 12 pone la postura de las dos fuentes como opuesta y no elige; la orden lo excluye por su nombre"),
 ("El corte de la presion de enclavada (18 frente a 15 mmHg)",
  "contradiccion interna declarada en el capitulo 12; la orden lo excluye por su nombre"),
 ("La resistencia vascular sistemica normal (1.100 frente a 1.170 dinas.s.cm-5)",
  "contradiccion entre fuentes del capitulo 12; la orden lo excluye por su nombre"),
 ("Los tres cortes de TAPSE/PSAP (0,23 del consenso argentino; <0,55 como signo y 0,19-0,32 por riesgo)",
  "usos distintos del mismo cociente que el capitulo 12 muestra sin resolver; la orden lo excluye por su nombre"),
 ("La secuencia terapeutica de la vasoplejia (Figura 4) y sus dosis impresas",
  "es conducta y son dosis de farmacos, y la figura lleva marca de «verificar a ojo» por extraccion parcial"),
 ("El momento de implantar el soporte mecanico y el ECMO venoarterial en SCAI D-E",
  "es conducta, y el Word declara que no hay consenso sobre los criterios de inicio"),
 ("El algoritmo de la fibrilacion auricular de novo",
  "es conducta, y el propio Word declara que no transcribio el detalle del algoritmo"),
 ("La prevencion del sangrado con acido tranexamico y la optimizacion de la hemostasia",
  "es conducta"),
 ("Los coeficientes del EuroSCORE II (Tabla 6, folio 739)",
  "la orden excluye los coeficientes de escalas de riesgo; y el de cirugia previa sale mal impreso, con marca de «verificar a ojo»"),
 ("La edad media del EuroSCORE II (64,7 en el resumen y 64,6 en la Tabla 3)",
  "discrepancia interna del articulo con marca de «verificar a ojo»"),
 ("Los coeficientes de los modelos STS de 2018",
  "la orden excluye los coeficientes de escalas de riesgo"),
 ("Las nueve recomendaciones seleccionadas de la guia de manejo de sangre, con su clase y su nivel",
  "son conducta; el resumen dice donde viven, que es lo que la regla de la casa pide — consultar la fuente original"),
 ("La fila de sangre leucorreducida de la guia de manejo de sangre",
  "el Word la marca «verificar a ojo»: la oracion sale desplazada en su Tabla 2"),
 ("El capitulo 11 (SDRA y ventriculo derecho) y el capitulo 13 (cuadro de formulas)",
  "no son los capitulos 8 a 10 que la orden nombra"),
 ("Las dos definiciones de la vasoplejia con sus cortes, las bandas de la RVS del posoperatorio, "
  "el indice cardiaco de 2,2, la precarga, el taponamiento, la falla del ventriculo derecho, la "
  "definicion de hipertension pulmonar y los grados del derrame pleural",
  "la tabla de criterios de ref-pop ya los publica, cada uno con su ⓘ y su fuente: el resumen no repite"),
 ("El orden de abordaje del gasto bajo de Llanos 2020",
  "la ficha de Hemodinamica ya lo publica (bloque 2 de docs/CONTROL_HEMO_REF.md)"),
]


def esc(t):
    return (t.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;'))


def marcado():
    L = []
    L.append('      <!-- ══ RESUMEN DE CONSULTA DEL POSOPERATORIO (18/11, punto 7) ════════════════════')
    L.append('           ⚠️ ESTE BLOQUE NO SE RETIPEA: sale de `scripts/_gen_pop_ref.py`, que emite el')
    L.append('           marcado Y `docs/CONTROL_POP_REF.md` con la trazabilidad de cada afirmacion y la')
    L.append('           lista de lo que quedo afuera con su motivo. La fuente son los capitulos 8 a 10')
    L.append('           del Word de Cowork, leido solo para esto.')
    L.append('           ⚠️ NO AGREGA NI CAMBIA UNA FILA DE LA TABLA DE CRITERIOS de abajo, y no lleva')
    L.append('           ningun globo ⓘ nuevo: es material de consulta, con su linea de fuente al pie de')
    L.append('           cada bloque en 10 px, el molde de las fichas de Hemodinamica.')
    L.append('           ⚠️ NADA DE LO QUE EL WORD MARCA «verificar a ojo», NINGUNA de las cinco')
    L.append('           contradicciones que su capitulo 12 muestra sin resolver, NINGUN coeficiente de')
    L.append('           escala de riesgo y NINGUNA conducta ni dosis. Y ningun texto dice que dos')
    L.append('           fuentes no coinciden ni que algo no se encontro: eso vive en el .md. -->')
    L.append('      <div id="ref-pop-resumen">')
    L.append('      <div style="font-weight:700;color:var(--accent2);margin:0 0 2px;">Resumen de consulta</div>')
    L.append('      <div style="font-size:11px;color:var(--text2);margin:0 0 10px;">Material de lectura. '
             'Para el contenido completo y vigente de cada publicaci&oacute;n, consulte la fuente original.</div>')
    for tit, parrafos, fuente, _ in BLOQUES:
        L.append('      <div style="font-weight:700;margin:10px 0 3px;">%s</div>' % esc(tit))
        for p in parrafos:
            L.append('      <div style="font-size:12px;line-height:1.7;margin:0 0 4px;">%s</div>' % esc(p))
        L.append('      <div style="font-size:10px;color:var(--text2);margin:4px 0 14px;">Fuente: %s</div>'
                 % esc(fuente))
    L.append('      </div><!-- /ref-pop-resumen -->')
    return '\n'.join(L)


def control():
    L = ['# CONTROL_POP_REF — el resumen de consulta del posoperatorio en Referencias', '',
         'Lo genera `scripts/_gen_pop_ref.py`, que emite tambien el marcado que vive en',
         '`index.html` dentro de `#ref-pop`. **Nada se retipea**: si una cifra cambia, cambia en el',
         'generador y de ahi salen las dos cosas.', '',
         'Fuente: `~/Desktop/EcoSmart_Estudio_Hemodinamica/Estudio_Hemodinamica_EcoSmart.docx`,',
         'capitulos 8 (posoperatorio de cirugia cardiaca), 9 (riesgo quirurgico) y 10 (manejo de',
         'sangre perioperatorio). Leido solo para esto; el archivo no se modifico.', '',
         '## Bloques y trazabilidad', '']
    for i, (tit, parrafos, fuente, traza) in enumerate(BLOQUES, 1):
        L.append('### %d. %s' % (i, tit))
        L.append('')
        L.append('Linea de fuente al pie del bloque: **%s**' % fuente)
        L.append('')
        L.append('| Afirmacion | Folio |')
        L.append('|---|---|')
        for a, f in traza:
            L.append('| %s | %s |' % (a, f))
        L.append('')
    L.append('## Lo que quedo AFUERA, con su motivo (%d items)' % len(AFUERA))
    L.append('')
    L.append('Nada de esto se escribe en la aplicacion, **ni para decir que falta**: la regla fija del')
    L.append('2026-11-04 prohibe que un texto de la app diga que dos fuentes no coinciden o que algo')
    L.append('no se encontro.')
    L.append('')
    for a, m in AFUERA:
        L.append('- **%s** — %s.' % (a, m))
    L.append('')
    return '\n'.join(L)


if __name__ == '__main__':
    raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    io.open(os.path.join(raiz, 'docs', 'CONTROL_POP_REF.md'), 'w', encoding='utf-8').write(control())
    sys.stdout.write(marcado() + '\n')
