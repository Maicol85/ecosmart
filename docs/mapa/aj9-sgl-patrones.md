# Mapa — EL SGL: cortes, signo y rótulo · los territorios · los patrones · el 2,9 del score

Tanda **«AJ9»** (2026-10-29). Por nombre de función y de constante, **no por número de línea**.

---

## 1 · Los dos cortes del SGL — AJ9-1

### Las constantes y su fuente

| Pieza | Qué es |
|---|---|
| `SGL_NORMAL_MAX` | **−18**. Normal es **más** negativo que esto. Borde `<`, ESTRICTO |
| `SGL_ANORMAL_MIN` | **−16**. Anormal es **menos** negativo que esto. Borde `>`, ESTRICTO |
| `SGL_CATS` | las tres bandas con su rótulo y su color |
| `sglClasificar(x)` | el **dueño único** de la pregunta. Trabaja sobre el valor con signo negativo |
| `sglNeg(x)` | −\|x\| |
| `sglNegTxt(s)` | la versión de TEXTO, que es la que viaja al papel |
| `sglRotuloPintar()` | el **dueño único** de los DOS nodos de pantalla |
| `sglCorteTxt(k)` / `sglCortesPintar()` | escriben los dos números en el marcado estático |

**Fuente:** ASE 2025, consenso clínico **1**, hoja 11, folio **995** (Thomas JD y cols.,
*J Am Soc Echocardiogr* 2025;38:985-1020), **leído en imagen**.

> «Normal LV myocardial GLS is more negative than −18%. Borderline GLS is −16% to −18%.
> Abnormal GLS is less negative than −16%.»

⚠️ **LEERLO EN IMAGEN NO ERA UN FORMALISMO.** El extractor de texto plano **se come los signos
menos** de ese párrafo y devuelve «18%» y «16%» en POSITIVO. Un `pdftotext` habría publicado los
dos cortes del lado equivocado del cero — que es el mismo defecto que este repo ya pagó una vez
en la ficha de cardio-oncología, donde el umbral estaba escrito al revés.

### Los siete bordes, medidos

| valor | banda |
|---|---|
| −20 | normal |
| −18,1 | normal |
| **−18** | **limítrofe** |
| −17,9 | limítrofe |
| −16,1 | limítrofe |
| **−16** | **limítrofe** |
| −15,9 | anormal |

**Los dos bordes se los lleva el tramo limítrofe**, y es lo que dice la guía: «more negative
than −18» deja el −18 exacto fuera de lo normal, y «less negative than −16» deja el −16 exacto
fuera de lo anormal.

### Quién lee las constantes

1. `sglRotuloPintar` → `#sgl-interp` (fila de cálculo de AI/VI) y `#sgl-interp-tab` (pestaña de
   Contractilidad y SGL).
2. `DCM_RANGO_CLIN.sgl` → el techo de la banda normal del cartel de plausibilidad.
3. La ficha de Referencias de cardio-oncología, por `sglCortesPintar` y `data-sgl-corte`.
4. El panel de cardio-oncología del Laboratorio («GLS anormal en control»).
5. El filtro de auditoría del Laboratorio («|GLS| < 16 % con FEVI ≥50 %»), por valor absoluto.

⚠️ **EL ATRIBUTO ES `data-sgl-corte` Y NO `data-corte`**, y la diferencia no es cosmética:
`imCortesPintar` barre `document.querySelectorAll('[data-corte]')` —el documento ENTERO, no su
cuadro— y le pasa la clave a `imCorteTxt`. Compartir el atributo le entregaría estos spans para
que los pise con el corte de otra válvula.

### Los cortes que NO leen de acá, y por qué

| Dónde | Valor | Por qué queda aparte |
|---|---|---|
| `BSE_GRIS_GLS_MIN` / `MAX` | 16 / 18 absolutos | zona gris de función **sistólica** de la BSE 2024 (pág. 35), dentro del algoritmo diastólico: coinciden en el número y **no** en el criterio |
| `hfaicos_gls_alt` | −16 | criterio **puntuado** del marco HFA-ICOS |
| `_hfC('GLS < 16 %')` | 16 absoluto | criterio **puntuado** del HFA-PEFF |
| `amCalcSGL` | −13 | criterio del **score de amiloidosis** (García-Pavía 2021, Tabla 2, folio 1558) |
| `eeEvalGLS` | −16 y −20, con «borderline» | vive en el bloque de **Eco Estrés** |
| `CO_UMBRAL_GLS_REL` | 15 % **relativo** | la caída relativa de cardio-oncología |

**Un score sólo vale con los cortes con los que se validó.** Mover `SGL_NORMAL_MAX` no mueve
ninguno de ellos, y es deliberado.

---

## 2 · El signo — AJ9-1c

**El campo acepta lo que el médico escriba.** `#sgl` no tiene `min` y nunca lo tuvo, así que la
base trae strain tipeado con los dos signos.

- **El campo NO se reescribe.** Ni `#sgl`, ni `#sgl_gls`, ni la columna `GLS (%)` del Excel.
  Verificado escena por escena contra HEAD: ni un valor cambia.
- **El papel publica el valor negativo**: informe narrativo (tres estilos), EN SUMA, tabla de
  mediciones del PDF, hoja de strain del PDF y PPT.
- `sglNegTxt` **conserva literal** lo que ya viene negativo. «-18.50» sigue saliendo «-18.50»;
  sólo al positivo se le antepone el signo. Normalizar también el número convertiría «18.50» en
  «-18.5» y cambiaría el papel de estudios que HOY salen bien.

⚠️ **EL EXCEL SIGUE EXPORTANDO EL CRUDO, Y SE DECLARA** → `docs/PENDIENTES.md` → **AJ9-f**.

---

## 3 · El rótulo de pantalla — AJ9-1d

`sglRotuloPintar` es el **dueño único** de los dos nodos. Publica `SGL −18% · limítrofe` con su
color, y **sólo en pantalla**: el informe, el EN SUMA, el PDF y el PPT siguen con el número solo.

- En la fila de cálculo, vacío se muestra **«—»**; en la pestaña, **vacío**: ahí el rótulo va
  pegado al campo y un guión al lado de un input vacío se lee como un valor por omisión.
- **El CERO se trata como vacío**, que es lo que HEAD hacía (`sgl ? … : '—'` leía el NÚMERO).

⚠️ **SE REPINTA EN `limpiarCampos`, Y LO CAZÓ TC-547.** El barrido de esa función alcanza a
`#sgl-interp` —un `span[id]` dentro de un `.calc-row` de un `.calc-box`— pero **NO** a
`#sgl-interp-tab`, que es un `<div>` al lado del campo «SGL global» en otra pestaña. Medido:
después de «Nuevo estudio» la fila volvía a «—» y la pestaña seguía anunciando
«SGL -18% · limítrofe», **o sea el strain del paciente ANTERIOR**.

---

## 4 · Los territorios coronarios — AJ9-2

**EL REPARTO NO SE TOCÓ**, y se verificó segmento por segmento antes de escribir: `CONTR_TERRITORIO`
coincide con la Figura 5 de Cerqueira.

| Arteria | Segmentos | Con qué reserva |
|---|---|---|
| DA | 1, 2, 7, 8, 13, 14, 17 | — |
| CD | 3, 4, 9, 10, 15 | **cuando es dominante** |
| CX | 5, 6, 11, 12, 16 | **en general** |

El **segmento 17**, el ápex, es el de mayor variabilidad: puede depender de cualquiera de las tres.

- El aviso **«La distribución varía entre pacientes»** va en la PANTALLA, debajo de las tres
  arterias. Las citas van en la tarjeta ⓘ `contr-territorio` (regla R2).
- **Fuente:** Cerqueira MD y cols., *J Nucl Cardiol* 2002;9:240-5, Figura 5 y texto del folio
  **244**, leído en imagen.

⚠️ **EL DOCUMENTO DE LA BIBLIOTECA ES LA VERSIÓN DEL *JOURNAL OF NUCLEAR CARDIOLOGY***, no la de
*Circulation* 105:539-542. El comité es el mismo —el grupo de redacción de la American Heart
Association sobre segmentación miocárdica, nombrado en su primera hoja— pero el folio que se cita
es el de la versión que se leyó.

⚠️ **LA DIFERENCIA DEL SEGMENTO 15 ENTRE LANG Y CERQUEIRA NO SE ESCRIBIÓ, Y NO ES UN OLVIDO.** La
Figura 5 de Lang 2015 (folio 13) es un dibujo anatómico con categorías de color —incluidas «RCA
o LAD» y «LAD o CX»— y **NO numera los segmentos**. No hay hoja de ese documento donde el 15
quede asignado a la descendente anterior. → **AJ9-a**.

⚠️ **LA APP NO ROTULA SU MODELO «AHA» EN ESTA PESTAÑA**, medido: cero apariciones de esa sigla en
las 700 líneas del bloque de contractilidad y SGL. No había etiqueta que convertir en cita.

**WMSI: no existe.** El único de la aplicación es `eeUpdateWMSI`, dentro del bloque muerto de Eco
Estrés. Cero nodos del DOM con «wmsi» en su id.

**La escala de motilidad conserva «aneurisma».** Lang 2015 (folio 12) publica **cuatro** grados
—normal o hiperquinético, hipoquinético, aquinético y disquinético— y no lo incluye. Es decisión
del médico y la ficha de Referencias lo declara con el chip.

---

## 5 · Los patrones del ojo de buey — AJ9-3

`PATRONES` tiene **quince** entradas (la orden decía dieciséis). Sus dos lectores son
`renderGrid` —la grilla de acordeones— y `selPatron` —el panel de detalle—.

- **`patronSglTxt(p)` es el dueño único del rótulo**, y existe porque son dos lectores: con el
  texto escrito dos veces, el día que el rótulo cambie una de las dos vistas se quedaría atrás
  sobre el MISMO patrón.
- Los quince rangos «SGL típico» llevan pegado **«Criterio de EcoSmart (ilustrativo)»**: ningún
  documento de la biblioteca publica rangos de SGL por patrón, censados uno por uno.
- **NINGÚN RANGO CLÍNICO SE MOVIÓ**, verificado uno por uno contra HEAD.

### La preservación apical

El patrón de amiloidosis decía «Relación ápice/base > 2.9», que es el corte del **SCORE** —otra
pregunta, otra fuente y otra forma de medirlo—. Hoy usa la definición de la ASE 2025:

> el promedio del ápex **más de 2 veces** el promedio del resto

Consenso clínico **2**, hoja 12, folio **996**, leído en imagen. El patrón de **sobrecarga de
presión**, que comparaba con el 2,9 al revés, se dice con la MISMA definición: con el 2,9 allá y
la preservación apical acá, los dos patrones hermanos se contradecían a dos tarjetas de distancia.

**El patrón de MCH ya NO tenía relación ápice/base**, medido en los dos árboles: ni `mch-obst` ni
`mch-apical` la nombran. No había nada que sacar.

⚠️ **LA PALABRA «PATOGNOMÓNICO» SE REPORTA Y NO SE TOCA** → **AJ9-d**.

La tarjeta ⓘ `patrones-sgl` lleva las citas: la ASE 2025 con su folio, **Phelan 2012** (*Heart*
2012;98:1442-1448, folio 1442) con su corte de 1,0, sus 93 % y 82 % y sus 55 pacientes, la
advertencia de que se midió **sólo con equipos General Electric** (Vivid 7 y 9 con EchoPAC), la de
la propia ASE sobre el fabricante y la versión del programa, y el aviso de que la insuficiencia
renal terminal puede dar un patrón que lo imita (panel E de la Figura 6).

---

## 6 · El 2,9 del score de amiloidosis — AJ9-4

**EL CORTE NO SE MOVIÓ**, y está medido: 2,89 → 0 puntos · **2,90 → 0 puntos** · 2,91 → 3 puntos.
El operador sigue siendo estricto.

| Dato | De dónde sale |
|---|---|
| SAB > 2,9 → 3 puntos | Boldrini, **Tabla 3**, hoja 29 |
| se define **septal** | hoja 8 |
| se mide en **cuatro cámaras**, con GE y Philips | hojas 17 y 18 |
| S 67 % · E 77 % en pared engrosada | hoja 27 |
| el score es diagnóstico desde **8 puntos** | García-Pavía, Tabla 2, folio **1558** |
| en la amiloidosis **AL** el corte que mejor rinde es **3,1** (S 51 %, E 88 %) | hoja 27 |

⚠️ **EL 3,1 DEL AL NO ESTÁ EN LA TABLA 3**: el score AL **no tiene fila SAB**. Está en la tabla de
rendimiento de la hoja 27. La orden decía lo contrario.

⚠️ **CÓMO CALCULA LA APP ESA RELACIÓN, QUE ES LA PREGUNTA DEL PUNTO 4.** `calcApice` divide el
valor absoluto del campo «Strain apical» por el del campo «Strain basal», los dos **genéricos**:
en ninguna parte de la pantalla dice de qué paredes ni de qué vista salen.

**Ejemplo medido, el mismo paciente de las dos formas:** con apical −18 % y basal −6 % (septal de
cuatro cámaras) publica **3,00** y marca el criterio, **+3 puntos**; con el mismo apical −18 % y
un basal GLOBAL de −7,5 % publica **2,40** y no lo marca, **0 puntos**. → **AJ9-e**.

Y hay un tercer mezclado: el texto del criterio dice «vs base y segmentos medios», que es el
denominador de **Phelan** —ápex sobre la suma de basal y medio, con corte de 1,0— y no el de este
corte. Tres cosas distintas en una tarjeta.

⚠️ **EL `stopPropagation` DEL BOTÓN NO ES OPCIONAL**: el contenedor `.criterio-item` lleva un
`onclick="toggleCrit(...)"`, así que sin él **abrir el globo marca el criterio y le suma tres
puntos al score**. Lo fija TC-547 (F4), clickeando de verdad y no llamando a `vInfoClic`.

---

## 7 · La ficha de Referencias — AJ9-5

`ref-strain`, «Contractilidad y strain longitudinal (SGL)», con **trece filas** y su columna de
fuente. Va en **Referencias** y no en Evidencia: Evidencia es para lo que la guía dice que se
HAGA, y acá no hay ninguna conducta.

- **Sin clase ni nivel**, y no es un olvido: ninguno de estos documentos publica la escala
  I / IIa / IIb / III para estos valores. Son cortes y rendimientos.
- Las **dos** filas sin fuente llevan el chip `CRITERIO DE ECOSMART`: los quince rangos de los
  patrones, y el quinto grado «aneurisma» de la escala de motilidad.
- **No cita a Biering-Sørensen ni a Jiang**, como la orden pide.

⚠️ **SE AGREGA A `REF_SUBTAB` EN EL MISMO COMMIT**, en `fun`. Es la lección que `constriccion`
dejó en la tanda J: una ficha fuera de ese reparto existe, se abre desde su encabezado y el
buscador la indexa, pero el médico que navegue por las solapas no la encuentra nunca.

Las tres tarjetas ⓘ de la tanda apuntan a esa ficha en `VINFO_REF`, que es el invariante de esa
tabla: una tarjeta con entrada de Referencias lleva botón.

---

## 8 · Trampas medidas en esta tanda

1. ⚠️ **EL ACENTO GRAVE DENTRO DE UN COMENTARIO DE UNA SONDA O DE UN CASO, CUATRO VECES.** El
   cuerpo es un template literal: un backtick —aunque esté en un comentario— cierra la cadena.
   `check_backticks.py` **no los cazó**: lo que sirve es `node --check` sobre el archivo.
2. ⚠️ **UNA BARRA INVERTIDA ESCRITA SIMPLE EN UN HEREDOC DE PYTHON LLEGA AL TEMPLATE COMO
   NINGUNA.** `/pice\/base/` salió «Invalid regular expression flags» y `/toggleRef\('…'/` salió
   «Unterminated group». Hay que escribirlas DOBLES en el heredoc.
3. ⚠️ **EL COMPARADOR DECÍA «CERO DIFERENCIAS» SOBRE DOS VOLCADOS QUE ERAN SÓLO UN MENSAJE DE
   ERROR.** Hoy aborta si un volcado trae `_err` o no trae ni una escena.
4. ⚠️ **EL GLOBO NO ABRE CON LA PESTAÑA CERRADA.** `_vInfoAbrir` llama a `_vInfoColocar`, que
   devuelve `null` cuando el botón no tiene caja: la tarjeta **ni se abre**, y su texto se mide
   VACÍO sobre una tarjeta que sí funciona.
5. ⚠️ **`.sacc-body` ABRE CON `max-height` Y UNA TRANSICIÓN DE 0,3 s.** Medir en el acto lee la
   caja de MITAD de la animación: los hijos informan un rect que **se superpone con el
   encabezado de la sección**, y `elementFromPoint` devuelve el encabezado en las cuatro
   esquinas. No había ningún solape real — a 1440 px el mismo botón daba los cinco puntos
   propios. Costó media docena de mediciones averiguarlo, y el arnés de TC-535 ahora le saca la
   animación antes de medir.
6. ⚠️ **LA PALABRA «limítrofe» APARECE 19 VECES EN EL ARCHIVO** y el generador del informe la usa
   para otros datos: buscarla entera en el informe no prueba nada. TC-547 mira el **fragmento**
   que sigue a «SGL ».
7. ⚠️ **EL EMISOR REAL DEL PDF ES `_pdfAjustarA4`, NO `generarPDF`.** Con el segundo solo, el
   espía no registra un texto y la condición sale roja con el diagnóstico VACÍO, que se lee igual
   que «el PDF no trae el dato».
8. ⚠️ **HAY QUE ESPERAR A jsPDF.** Leer `window.jspdf` sin esperarlo es la carrera que deja a
   TC-358 rojo de forma intermitente, con un diagnóstico que parece un problema de conexión.
