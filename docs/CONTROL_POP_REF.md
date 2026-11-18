# CONTROL_POP_REF — el resumen de consulta del posoperatorio en Referencias

Lo genera `scripts/_gen_pop_ref.py`, que emite tambien el marcado que vive en
`index.html` dentro de `#ref-pop`. **Nada se retipea**: si una cifra cambia, cambia en el
generador y de ahi salen las dos cosas.

Fuente: `~/Desktop/EcoSmart_Estudio_Hemodinamica/Estudio_Hemodinamica_EcoSmart.docx`,
capitulos 8 (posoperatorio de cirugia cardiaca), 9 (riesgo quirurgico) y 10 (manejo de
sangre perioperatorio). Leido solo para esto; el archivo no se modifico.

## Bloques y trazabilidad

### 1. Bajo gasto posoperatorio: lo que la guía del posoperatorio complicado consigna

Linea de fuente al pie del bloque: **Llanos 2020, hoja 6 del PDF (la guía no trae folio impreso).**

| Afirmacion | Folio |
|---|---|
| Afectacion de organos (oliguria), necesidad de inotropicos o de soporte mecanico, sin hipovolemia relativa | Llanos 2020, hoja 6 |

### 2. Shock postcardiotomía

Linea de fuente al pie del bloque: **Llanos 2020, hoja 8 del PDF.**

| Afirmacion | Folio |
|---|---|
| Definicion del shock postcardiotomia | Llanos 2020, hoja 8 |

### 3. Síndrome vasopléjico: frecuencia y mecanismo

Linea de fuente al pie del bloque: **Llanos 2020, hoja 9 del PDF.**

| Afirmacion | Folio |
|---|---|
| Hasta cerca del 50 % de los pacientes | Llanos 2020, hoja 9 |
| Fisiopatologia: insulto quirurgico, isquemia-reperfusion y circulacion extracorporea | Llanos 2020, hoja 9 |

### 4. Sangrado excesivo

Linea de fuente al pie del bloque: **Llanos 2020, hoja 5 del PDF.**

| Afirmacion | Folio |
|---|---|
| Sangrado excesivo: mas de 1 litro en las primeras 24 h | Llanos 2020, hoja 5 |

### 5. Riesgo quirúrgico: EuroSCORE II

Linea de fuente al pie del bloque: **Nashef 2012, folios 734, 736 y 743.**

| Afirmacion | Folio |
|---|---|
| 22.381 pacientes, 154 centros, 43 paises; mortalidad global 3,9 % | Nashef 2012, f. 734 |
| Validacion: 5.553 pacientes, 4,18 % observada frente a 3,95 % predicha, AUC 0,8095 | Nashef 2012, f. 743 |
| Clearance de creatinina por Cockcroft-Gault | Nashef 2012, f. 736 |

### 6. Riesgo quirúrgico: los modelos de la STS de 2018

Linea de fuente al pie del bloque: **Shahian 2018, folios 1411 y 1412.**

| Afirmacion | Folio |
|---|---|
| Nueve desenlaces modelados | Shahian 2018, f. 1411-1412 |
| Cinco procedimientos | Shahian 2018, f. 1411-1412 |
| n de desarrollo y ventanas de desarrollo y validacion | Shahian 2018, f. 1411-1412 |

### 7. Resultados del puente coronario en el registro de la STS

Linea de fuente al pie del bloque: **Braunwald 10.ª ed., folios 1213 y 1215.**

| Afirmacion | Folio |
|---|---|
| Mortalidad del CABG 3,05 % (1997-99), cerca de 2 % (2008), menos de 2 % (2013) | Braunwald 10.a ed., f. 1215 |
| Morbilidad mayor 13,4 % sobre 503.478 pacientes | Braunwald 10.a ed., f. 1215 |
| Infeccion profunda de la herida esternal menor del 3 % | Braunwald 10.a ed., f. 1213 |

### 8. Manejo de sangre perioperatorio

Linea de fuente al pie del bloque: **Tibi 2021, folios 981 a 984.**

| Afirmacion | Folio |
|---|---|
| 23 recomendaciones nuevas o actualizadas; 1.227 resumenes y 87 articulos revisados | Tibi 2021, f. 981-982 |
| Las Tablas 1 y 2 reunen las recomendaciones con su clase y nivel | Tibi 2021, f. 982-984 |

## Lo que quedo AFUERA, con su motivo (17 items)

Nada de esto se escribe en la aplicacion, **ni para decir que falta**: la regla fija del
2026-11-04 prohibe que un texto de la app diga que dos fuentes no coinciden o que algo
no se encontro.

- **Los umbrales de lactato y de saturacion venosa del bajo gasto posoperatorio (lactato >2 y SvO2 <65 % frente a lactato >3 y ScvO2 <60 %)** — contradiccion entre fuentes que el capitulo 12 del Word muestra sin resolver, y la orden la excluye por su nombre.
- **El Swan-Ganz como patron de referencia del bajo gasto posoperatorio y el cateter de arteria pulmonar en general** — el capitulo 12 pone la postura de las dos fuentes como opuesta y no elige; la orden lo excluye por su nombre.
- **El corte de la presion de enclavada (18 frente a 15 mmHg)** — contradiccion interna declarada en el capitulo 12; la orden lo excluye por su nombre.
- **La resistencia vascular sistemica normal (1.100 frente a 1.170 dinas.s.cm-5)** — contradiccion entre fuentes del capitulo 12; la orden lo excluye por su nombre.
- **Los tres cortes de TAPSE/PSAP (0,23 del consenso argentino; <0,55 como signo y 0,19-0,32 por riesgo)** — usos distintos del mismo cociente que el capitulo 12 muestra sin resolver; la orden lo excluye por su nombre.
- **La secuencia terapeutica de la vasoplejia (Figura 4) y sus dosis impresas** — es conducta y son dosis de farmacos, y la figura lleva marca de «verificar a ojo» por extraccion parcial.
- **El momento de implantar el soporte mecanico y el ECMO venoarterial en SCAI D-E** — es conducta, y el Word declara que no hay consenso sobre los criterios de inicio.
- **El algoritmo de la fibrilacion auricular de novo** — es conducta, y el propio Word declara que no transcribio el detalle del algoritmo.
- **La prevencion del sangrado con acido tranexamico y la optimizacion de la hemostasia** — es conducta.
- **Los coeficientes del EuroSCORE II (Tabla 6, folio 739)** — la orden excluye los coeficientes de escalas de riesgo; y el de cirugia previa sale mal impreso, con marca de «verificar a ojo».
- **La edad media del EuroSCORE II (64,7 en el resumen y 64,6 en la Tabla 3)** — discrepancia interna del articulo con marca de «verificar a ojo».
- **Los coeficientes de los modelos STS de 2018** — la orden excluye los coeficientes de escalas de riesgo.
- **Las nueve recomendaciones seleccionadas de la guia de manejo de sangre, con su clase y su nivel** — son conducta; el resumen dice donde viven, que es lo que la regla de la casa pide — consultar la fuente original.
- **La fila de sangre leucorreducida de la guia de manejo de sangre** — el Word la marca «verificar a ojo»: la oracion sale desplazada en su Tabla 2.
- **El capitulo 11 (SDRA y ventriculo derecho) y el capitulo 13 (cuadro de formulas)** — no son los capitulos 8 a 10 que la orden nombra.
- **Las dos definiciones de la vasoplejia con sus cortes, las bandas de la RVS del posoperatorio, el indice cardiaco de 2,2, la precarga, el taponamiento, la falla del ventriculo derecho, la definicion de hipertension pulmonar y los grados del derrame pleural** — la tabla de criterios de ref-pop ya los publica, cada uno con su ⓘ y su fuente: el resumen no repite.
- **El orden de abordaje del gasto bajo de Llanos 2020** — la ficha de Hemodinamica ya lo publica (bloque 2 de docs/CONTROL_HEMO_REF.md).
