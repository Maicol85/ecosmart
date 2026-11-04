# Fichas de los casos TC-644 a TC-649 — la tanda PANT-6

Archivo propio porque `docs/mapa/tests-fichas.md` está en 34,2 KB, a menos de 1 KB del techo.
El cuerpo de cada caso vive en `scripts/test_clinico.mjs`; acá está **qué fija cada uno, con qué
denominador y con qué control negativo**.

**Los seis caen contra HEAD (`c42d9e3`) por 69 condiciones y NINGUNA por excepción**, verificado en
un worktree con el mismo archivo de casos, alternando sólo `index.html`.

---

## TC-644 · la CIA y la CIV siempre visibles, cada botón en su cuadro y el papel sin moverse

**Commit 1.** Fija la decisión del médico: el botón de cada lesión decide **sólo** si esa lesión
entra al informe, y no la maqueta.

| bloque | qué fija |
|---|---|
| (A0)(A1) | **DENOMINADOR**: la sección existe y hay al menos dos `.ete-shunt-cuadro`. Sin esto todo lo de abajo cuenta cero |
| (B1)-(B4) | **las CUATRO combinaciones** de lesiones marcadas dejan los **dos** cuadros a la vista |
| (C1) | ningún campo editable queda deshabilitado en la combinación más peligrosa, la de ninguna marcada |
| (C2) | los quince campos editables de las dos lesiones siguen existiendo, nombrados uno por uno |
| (D1)(D2) | cada botón **dentro** de su cuadro |
| (D3) | y los dos siguen dentro de un `.subtabs-wrap.cc-lesbar`, que es de donde cuelga su pintado |
| (E1)(E2) | el cuadro común **fuera** de la fila, con sus seis insumos |
| (E3) | la PSAP por IT **ya no** se repite en la CIA |
| (E3b) | **CONTROL**: la de la CIV sigue |
| (F1)-(F3) | el diagrama de bordes conserva sus segmentos, sus textos y su tarjeta de detalle |
| (G1)-(G3) | el papel: sin marcar, la CIA **no** se emite; marcada, **sí** |

⚠️ **DOS DEFECTOS PROPIOS, cerrados al escribirlo y anotados en el caso.**
1. Usaba la casilla a pelo (`__t.chk`) en vez del **gesto real**: el toggle `eteShuntLesionTog`
   despacha el `change` que las cinco rutas necesitan, y es como la marca el médico.
2. Buscaba la palabra «interauricular» en el informe, **que el emisor no escribe** —escribe «CIA
   tipo ostium secundum»—: las dos condiciones daban `false` en los dos lados, o sea un denominador
   vacío que se lee igual que «la compuerta funciona».

---

## TC-645 · el dibujo del VD con su ancho mínimo para 12 px, y la lista en la columna izquierda

**Commit 2.**

| bloque | qué fija |
|---|---|
| (A1)(A2) | `#vdsc-svg` toma el ancho de su columna con tope de **520 px**, por encima del mínimo medido de 509 |
| (B1)(B2) | desde **900 px** la fila es una grilla, y el corte va sobre la **VENTANA** |
| (B3) | el reparto **55/45** |
| (B4)(B5) | la lista en la columna 1 fila 2, y el dibujo abarcando las dos filas de la columna 2 |
| (C1)(C2) | la fila tiene **tres** hijos, en el orden campos → dibujo → lista |
| (D1)(D3) | la lista conserva sus filas y su advertencia |
| (E) | el dibujo sigue siendo de **solo lectura**: cero campos del estudio movidos |
| (F2) | **CONTROL NEGATIVO**: el esquema valvular 2D **no** hereda ese ancho — son dos reglas distintas |

⚠️ **LA GEOMETRÍA SE MIDE POR LA REGLA DE LA HOJA DE ESTILOS Y NO POR `getBoundingClientRect`:**
la suite corre Chrome sin `--window-size`, o sea a ~756 px, por debajo del corte. El caso recorre
`document.styleSheets` y lee la regla dentro de su media query; la geometría real la miden las
sondas en los cuatro anchos y en los dos motores.

---

## TC-646 · el molde, y los síntomas de la estenosis mitral con CUALQUIER etiología

**Commits 3 y 7.** El bloque (C) es **el defecto que el médico reportó**.

| bloque | qué fija |
|---|---|
| (A0)-(A4) | **DENOMINADOR**: la sección abre, trae `molde`, con franja de categoría, de estadio y tarjetas de datos |
| (B1)(B2) | el estadio **ya no** está en la lista de filas ni en la clínica: subió a la franja |
| (C1)-(C3) | **UNA** pregunta de síntomas con las **tres** etiologías: sin consignar, reumática y **calcificada** |
| (C4) | y el estadio sale también con la calcificada |
| (D0)(D0b) | **DENOMINADOR**: los **dos** botones de la pregunta, y **sin** centinela explícito |
| (D1)-(D3) | los tres estados por el **gesto real**: sin contestar `ask`, «No» `none`, «Sí» `ok` |
| (E1)-(E4) | los **seis** términos del glosario, cada uno con su hoja, su folio, las dos guías y una etiqueta distinta |
| (F1) | **CONTROL NEGATIVO**: ninguna sección de congénitas trae molde |
| (G1)-(G3) | el papel y el EN SUMA no llevan nada de la franja |

⚠️ **TRES TRAMPAS PAGADAS, cada una con su nota en el caso.**
1. **`_indClin` es un `var` de módulo y NO está en `window`.** El setter que inventé no escribía
   nada y las tres condiciones de los tres estados leían la misma marca en los dos lados: un
   denominador que no se mueve. Lo que escribe la respuesta es el **clic** sobre el botón del panel.
2. **La botonera declara DOS opciones, no tres, y eso es lo correcto.** El centinela explícito
   `__sd` lo llevan las secciones del molde de congénitas que PANT-2 pasó a tres estados por su
   número de preguntas. Acá el tercer estado es «sin contestar», como en el resto del panel.
   (D0b) lo fija por el otro lado.
3. **Cinco acentos graves dentro de mis propios comentarios**, que `node --check` cazó.

---

## TC-647 · la morfología y las mediciones de la mitral en una sola sección de tres columnas

**Commit 4.**

| bloque | qué fija |
|---|---|
| (A1)-(A3) | la sección única existe, la de mediciones ya no tiene contenedor propio, y el encabezado nombra las dos cosas |
| (B1)(B2) | **el alias** `mediciones-mitral` → `morfo` mueve la sección y la devuelve. Sin él, tres casos y cuatro sondas serían un **no-op silencioso** |
| (C1)-(C4) | las **tres** columnas por la regla, con el corte sobre la ventana en 900 px, y la grilla con tres hijos |
| (D1)-(D3) | el reparto de los **once** campos, columna por columna |
| (E1)-(E3) | las dos casillas al pie de **su** zona, y que siguen siendo **dos mecanismos distintos** |
| (F1)-(F3) | el cuadro de desfavorables **fuera** de las columnas, con sus seis filas |
| (G1)(G2) | el dibujo **NO** se funde: sigue en su fila propia, fuera de las columnas |
| (H1)(H2) | la sincronía de los velos de PANT-5, en los **dos** sentidos |

---

## TC-648 · el TEER lado a lado, el Forrester sin frase de dato faltante y los dos rótulos

**Commits 5 y 6.**

| bloque | qué fija |
|---|---|
| (A0)(A1) | los **dos** bloques visibles con los **tres** valores del selector de tipo de IM |
| (A2) | y ningún campo de los dos deshabilitado |
| (A3)-(A6) | la maqueta: franja de arriba con sus tres campos comunes, dos cuadros en el medio, criterios y conclusión abajo |
| (B1)(B2) | el **veredicto no cambia por la maqueta**: con los mismos datos, APTO con los dos tipos |
| (B3) | **CONTROL NEGATIVO**: con la IM **primaria**, un flail gap de 12 mm deja de ser APTO |
| (C0)-(C2) | `forrEsFalta` reconoce las **tres** frases que `forrFaltaTxt` produce |
| (C3)(C4) | **CONTROLES**: no reconoce un perfil de verdad ni la cadena vacía |
| (C5a)-(C5b) | el texto del módulo —el que la hoja del PDF imprime— **no** lleva la frase |
| (C5c) | **CONTROL**: la de **pantalla** se queda |
| (D1)-(D4) | los dos rótulos distinguidos, distintos entre sí, con los dos ids intactos |
| (D5) | **CONTROL NEGATIVO**: los dos campos **siguen sin espejarse** — unirlos cambiaría el criterio c4 |

⚠️ **EL FLAIL GAP ES UN CRITERIO DE LA IM PRIMARIA.** La primera versión de (B3) lo tecleaba con la
escena de la **secundaria** todavía cargada, donde ese criterio no se evalúa: el control pasaba en
verde sobre un veredicto que nada podía mover.

---

## TC-649 · el molde en las otras cinco válvulas, cada una con su pregunta de síntomas

**Commit 7.** Cinco escenas, cada una con los campos que **abren** su sección.

| bloque | qué fija |
|---|---|
| (A0) | **DENOMINADOR**: las cinco secciones abren sin excepción, y nombra la que no |
| (B1)-(B5) | las cinco con molde, franja de categoría, franja de estadio, tarjetas de datos y grupos de preguntas |
| (C1) | **UNA** pregunta de síntomas en cada una: ni cero ni dos |
| (D1) | el estadio no quedó también en las filas, en ninguna de las cinco |
| (E1)(E2) | ninguna reparte en más de **dos** columnas, y una de **seis preguntas o menos** usa **una** |
| (F1) | **CONTROL NEGATIVO**: la válvula pulmonar y la prótesis mitral siguen **SIN** molde — parado y reportado en P6-a |
| (G0)-(G3) | el papel y el EN SUMA con las cinco lesiones cargadas a la vez |

⚠️ **DOS COMPUERTAS MAL MONTADAS, cerradas al escribirlo.**
1. **La insuficiencia aórtica compara contra el token `'4'`, no contra `'severa'`**: con «severa» la
   sección devolvía `null`.
2. **La secundaria se abre SÓLO con el mecanismo consignado** (`teer_tipo_im`), que es lo que la
   separa de la primaria.
Las dos escenas devolvían `null`, o sea un denominador vacío que se lee como «el molde no entró».

⚠️ **Y `leer()` DEVUELVE UNA FORMA COMPLETA EN LOS DOS CAMINOS.** La primera versión devolvía
`{err}` a secas y la primera condición que leía `.filas` mataba el caso por **excepción**, que no
dice qué invariante se rompió. Es la lección de TC-546.

---

## Los tres casos viejos que la corrida completa destapó, y por qué ninguno es de esta tanda

- **TC-99 y TC-100** (cardio-oncología) salieron rojos en el lote 4 y **pasan corridos aislados**
  y **con su lote entero repetido** —vuelve a dar **56/56**—, en los dos órdenes posibles entre
  ellos. Intermitentes, no reproducibles, **no se tocaron**.
- **TC-490** (el 3D de la mitral y contractilidad) es un intermitente **PREEXISTENTE**, medido
  cuatro veces de cada lado: **2 rojas de 4 contra HEAD** con su caso original, **3 de 4** en el
  árbol nuevo **sin adaptar** y **3 de 4** **adaptado**. Siempre la misma condición y la misma
  firma: sus propios denominadores del chorro —«con chorro:» vacío y «SIN ORIGEN» en las ocho
  cámaras—.
  ⚠️ **MI PRIMERA MEDICIÓN DIJO QUE ERA MÍO, Y ERA UNA SOLA CORRIDA DE CADA LADO:** verde en HEAD y
  rojo en mi árbol. Con cuatro de cada lado se ve que los dos árboles fallan. **Un intermitente no
  se caracteriza con una corrida.**
  **Se adaptó igual, y por un motivo que no es el intermitente:** su helper `ETE()` comprobaba el
  **elemento** `ete-seccion-mediciones-mitral` antes de llamar al toggle, y ese contenedor ya no
  existe, así que sin la adaptación la segunda sección **nunca se abre**. El alias del commit 4
  cubre la **llamada** con el nombre viejo, pero no una guarda que busque el **id** viejo.
