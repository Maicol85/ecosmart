# Inventario del formato de la Evidencia de congénitas (PANT-17b, commit 2)

Documento de **solo lectura**, escrito ANTES de tocar el panel y medido sobre el árbol `a2137a6`
(cierre del commit 1). El md5 de `index.html` es el mismo antes y después de escribirlo.

---

## 1. Cómo se arma hoy una sección de congénitas

Todas devuelven el MISMO objeto —`{ filas, clinica, bloques, compacta, preguntas, guia, notas }`—
y lo pinta **un emisor compartido**, `_indSecHTMLCuerpo`, con `_indSecPie` cerrando. Lo que NO
está compartido es lo que esta tanda viene a cambiar: **cada sección repite a mano** el conteo de
respuestas, el párrafo de balance y la lista de lo que aplica.

| pieza | dónde vive hoy | cuántas copias |
|---|---|---|
| la fila **«Respuestas»** (`N en Sí · N en No · N sin dato`) | `clinica.unshift(_indFila('Respuestas', …))` dentro de cada sección | **15** |
| el párrafo **«Condiciones presentes en este paciente: N de M (…)»** | la última línea del bloque de diferencias, armada en `_bal` | **14** |
| la lista **«Recomendaciones que aplican con lo contestado (N)»** | un bloque más, por `.concat(_siDet.length ? [{…}] : [])` | **12** |
| los **bloques fijos de guía** | `r.bloques`, visibles al pie, por `_indBloqueHTML` | una por sección |

Las secciones, con su registro de preguntas y cuántas tiene hoy:

| función | registro | preguntas | tiene el conteo | el balance | la lista |
|---|---|---|---|---|---|
| `_indCIA` | `CIA_PREG` | 14 | sí | sí | sí |
| `_indCIV` | `CIV_PREG` | 14 | sí | sí | sí |
| `_indDSAV` | `DSAV_PREG` | 13 | sí | sí | sí |
| `_indEBS` | `EBS_PREG` | 12 | sí | sí | sí |
| `_indFON` | `FON_PREG` | 14 | sí | sí | sí |
| `_indCVPA` | `CVPA_PREG` | 9 | sí | sí | sí |
| `_indEIS` | `EIS_PREG` | 14 | sí | sí | sí |
| `_indDAP` | `DAP_PREG` | 13 | sí | sí | sí |
| `_indCoAo` | `COA_PREG` | 13 | sí | sí | sí |
| `_indTGA` | (lista propia) | 19 | sí | sí | sí |
| `_indTdFVD` | `TDFVD_PREG` | 14 | sí | sí | sí |
| `_indVAP` | `VAP_PREG` | 6 | sí | sí | **no** |
| `_indESUB` | `ESUB_PREG` | 7 | sí (por `_indObsPreg`) | sí | sí (por `_indObsAplican`) |
| `_indEASV` | `EASV_PREG` | 8 | sí (por `_indObsPreg`) | sí | sí (por `_indObsAplican`) |
| `_indFOP` | lista propia | — | sí | no | no |
| `_indVABEsBicuspide` | `VABC_PREG` | 11 | sí | no | no |
| `_indMCHSCD` | `MCH_SCD_PREG` | 3 | no | sí | no |

⚠️ **PANT-17 ya había extraído un ayudante compartido para DOS de ellas**: `_indObsPreg(PREG)`
devuelve `{ clinica, siDet, balance }` y `_indObsAplican(siDet)` el bloque de la lista. Los usan
`_indESUB` y `_indEASV` y nadie más. Ése es el camino que esta tanda generaliza.

---

## 2. El mapa pregunta → oración de recomendación: YA EXISTE, Y POR CLAVE

Es el hallazgo del inventario y es lo que hace que el formato nuevo **no escriba un solo texto
clínico**. Cada entrada de un registro `*_PREG` trae:

| campo | qué es |
|---|---|
| `clave` | la clave de la respuesta (`dsav.ev.eisen`) — es lo que `_indOrigen` lee y escribe |
| `lbl` | el rótulo de la pregunta |
| `guia` | cuál de las dos rige esa pregunta (`acc` o `esc`) |
| **`rec`** | **la oración completa de la recomendación, con su clase, su nivel, su hoja y su folio** |
| `ref` | la línea de la OTRA guía, en su propia oración |
| `refLbl` | el rótulo de esa otra guía, cuando no es la ESC 2020 |
| `nota` | el matiz de su texto de apoyo |
| `tramo` | la nota de tramo, cuando las dos guías dan cifras distintas |

`_indPregBadge(p)` saca la clase y el nivel **del propio `rec`** con una expresión regular, y
`_indPregNota(p, sinDato)` ordena las cuatro piezas para el ⓘ de la fila. O sea: la oración, su
clase, su nivel y su folio ya están redactados y verificados por la tanda que leyó la hoja.
**El bloque «Con lo contestado» los LEE; no los escribe.**

---

## 3. El modelo: el recuadro de la estenosis aórtica

Lo pinta **`_indRecomHTML(r)`** y recibe `{ tipo, tit, txt, clase, fuente, ref, faltan, nota }`:

- el marco: `margin-top:12px; padding:9px 11px; border-left:3px solid <color>; background:var(--bg2); border-radius:0 8px 8px 0`;
- el título en **10,5 px, peso 700, mayúsculas, `letter-spacing:.5px`**, del color del borde;
- el cuerpo en 11,5 px, `line-height:1.55`, `color:var(--text)`;
- el pie con `<b>clase</b> · fuente` + el corchete de la cita, en 11 px `var(--text2)`;
- **`r.faltan`** → la línea «Falta contestar: …» en `#D97706`, que es justo la que el formato
  nuevo necesita cuando ninguna respuesta dispara nada;
- el color sale de `IND_RECOM_COL` = `{ ind:'#10B981', alarma:'#DC2626', falta:'#94A3B8', no:'#94A3B8' }`.

Los rótulos «TAMBIÉN APLICA» y «MODALIDAD» son el `tit` de un **segundo** y un **tercer** objeto
de recomendación de esa misma sección: el molde admite varios recuadros, uno por objeto.
La sección es de válvulas: **se lee como modelo y no se toca.**

El «▶ ⓘ Ver detalle» lo pinta **`_indDetalleHTML(items)`**, marcado con `data-ind-detalle="1"`, y
un bloque ya puede nacer plegado con `b.plegado`, que se marca con `data-ind-bloque="1"`.
⚠️ **Los dos marcadores existen porque TC-293 cuenta «un control de detalle por sección»**: un
plegable nuevo tiene que llevar `data-ind-bloque` y no `data-ind-detalle`, o ese caso se pone rojo.

---

## 4. Por qué la fila «Respuestas» parte el texto en siete líneas — la causa medida

No es el texto: es **la celda**. La fila la emite `_indFilaHTML` dentro de la tabla de datos
clínicos, cuya columna de valor queda angosta —el rótulo se lleva el ancho— y en modo compacto la
grilla reparte las preguntas en dos columnas (`IND_COLS_CORTE`, 900 px de PANEL). Con el panel en
820 px, la celda del valor mide ~60 px y `N en Sí · N en No · N sin dato` no entra en una línea:
el navegador la corta en cada espacio. Es el mismo mecanismo que PANT-2 documentó para la botonera
de tres estados, que se apilaba en una celda de 60 px.

Por eso el formato nuevo **la saca de la tabla**: una línea corta de texto en el encabezado de la
sección, al lado del botón «⇔ columnas», que ocupa todo el ancho de la sección y no se parte.

---

## 5. El tope de preguntas por sección

**No hay ninguna constante de tope en el código**, censado el archivo entero: ninguna variable con
`TOPE` gobierna el panel de Evidencia. El tope es una **convención de las órdenes** —PANT-10 dejó
tres recomendaciones del Fontan sin pregunta «porque superan el tope»— y el máximo que hoy existe
es **14** preguntas, en CIA, CIV, Eisenmenger, Fontan y Fallot reparada. La transposición publica
**19**, repartidas por situación quirúrgica, y muestra sólo las de la escena cargada.

---

## 6. Qué recomendaciones quedan sólo en «Ver detalle»

Una recomendación de los bloques fijos que ninguna pregunta dispara no se pierde: sigue entera en
el detalle. Medido sobre los registros, son las de **seguimiento y de imagen basal** —las que no
dependen de una condición del paciente sino del calendario— y los **tramos sin recomendación
propia**, como el de resistencia de 5 a 10 unidades Wood del defecto del septo auriculoventricular.
