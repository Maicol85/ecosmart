# Ficha del caso TC-535 — la tanda AJ7 (2026-10-24)

> En archivo propio porque `tests-fichas.md` estaba en **34,2 KB** al abrir esta tanda, a
> 800 bytes del techo de 35 KB. Es la misma razón por la que TC-532 tiene el suyo.

## Qué cubre

Los **seis commits de código** de la AJ7 y el **G-a** del agregado, en doce grupos:

| Grupo | Qué fija |
|---|---|
| **A** | Fallot: el EN SUMA sin la IP, el `resumen` descriptivo, el PDF sin conducta, y el **control negativo** de que la línea sigue nombrando la cardiopatía con la IP como único hallazgo |
| **B** | HF-PEFF: la línea de presión de llenado normal dice «NO descarta», cita los dos folios, y **se reescribió** en vez de agregarse una segunda |
| **C** | Ateroma: la fila «Clasificación — descripción» escondida, las otras dos a la vista, el grosor completando el grado y la hoja del ETE sin la línea `Descripción \| …` |
| **D** | Bloques: el POP se retira solo al quedar sin datos; **editado a mano sobrevive**; el PDF pregunta una vez nombrándolo; un «no» detiene; un «sí» sigue sin cambiar nada; y **sin bloque editado no se pregunta** |
| **E** | El strain del VD vota: −18 → leve, −12 → «leve como mínimo», −25 → no vota, los bordes 15 y 20, y el **control** de que no puede bajar un grado que TAPSE y S′ ya dieron |
| **F** | La banda leve en el cuadro del VD de Referencias, **sin corchete**, con la de normalidad **con** corchete y el chip abajo |
| **G** | Mitral: con prótesis bloqueados y atenuados conservando el valor, con nativa no; y el rótulo que entra achicando la letra |
| **H** | Constricción: las dos frases fuera del informe y del PDF generado de verdad; la Evidencia que no despierta con solo taponamiento y sí con un dato propio |
| **I** | VExUS: los tres avisos **byte por byte** y la población del estudio en la Evidencia |
| **J** | Cardio-oncología: cero apariciones de «3-6 sem», con la remisión a la subtab intacta |
| **K** | Los dos globos de 44×44 que **no tapan a ningún vecino**, y los otros quince sin tocar |
| **L** | `HP_PAPM_MIN` único, con los cortes sin mover en las **dos** superficies |

## Cómo sabe fallar

- **Contra el HEAD de la tanda** (`65a552f`, en un worktree aparte): **33 condiciones en rojo** y
  **ninguna por excepción** — hay al menos una roja en cada uno de los doce grupos.
- **Por mutación dirigida**: `scripts/_mut_aj7.py`, **33 mutaciones**, una por cada cosa que la
  tanda cambió más los controles que podrían aflojarse.

## Las ocho trampas de instrumentación que este caso pagó

1. **`valvSevConfirmada` es un `let` de nivel superior y NO está en `window`.** Ponerlo ahí no
   hace nada: `guardarInforme` devuelve `false` **sin un solo toast**. Lo que sí se puede
   interceptar es `mostrarCardSeveridadValvular`, que sí es `window.*`.
2. **`generarPPT(id)` compara con `===` contra `inf.id`, que es un NÚMERO.** Pasarle la cadena da
   «No se encontró ese estudio guardado» y **cero diapositivas**, que se lee como «el módulo no
   sale en el PPT».
3. **El panel de Evidencia se abre UNA sola vez por escena.** `indicAbrir()` **borra** las
   respuestas, al abrir **y** al cerrar: abrirlo antes de cada respuesta deja viva sólo la última.
4. **Y hay que contestar las DOS preguntas.** La línea de la presión de llenado cuelga de la rama
   del **paso 3**: contestar sólo la presión deja el bloque sin ella.
5. **El panel queda ABIERTO y es un overlay `fixed` que tapa el documento entero.** Sin cerrarlo,
   `elementFromPoint` devuelve `DIV#indic-cuerpo` sobre **cualquier** punto, y el grupo de los
   globos informaría «el globo tapa a un vecino» sobre un defecto que no existe.
6. **La sección del panel emite CADA línea DOS veces** —una con sus corchetes y otra en la copia
   sin acentos que alimenta el papel—. Exigir una sola aparición da un rojo que no describe
   ningún defecto: el denominador es una línea **preexistente** del mismo bloque.
7. **`vmMorfFitSync` sale temprano con ancho 0**, a propósito. Sin abrir el `<select>` la sonda
   lee un **ancho útil negativo** y un cuerpo sin achicar: un rojo que nace en la sonda.
8. **El arnés corre en una ventana angosta y la columna queda MÁS ancha que la fila de tres
   campos del escritorio**, así que ahí el rótulo ya entra a 12,48 px y no hay nada que achicar.
   Se fija el ancho a los **149 px** que la AJ5 midió sobre la fila real, y recién ahí se exige.

Y una novena, del lado del producto y no de la sonda: **el cuerpo del informe no publica una sola
línea de pericardio sin el bloque `cvr` INTEGRADO** (`if (amiloIntegrado('cvr'))`). Sin
integrarlo, el grupo H mediría «cero frases» sobre un denominador vacío.

## Los vocabularios que la sonda tuvo que aprender

| Campo | Lo que la sonda suponía | Lo que el `<select>` tiene |
|---|---|---|
| `ip_grado` | `IP severa` | `Sin insuficiencia` · `Leve` · `Moderada` · `Severa` |
| `vexus_sh` / `vexus_pv` / `vexus_ir` | `severo` | `0` · `1` · `2` |
| El Carpentier de Válvulas | `vm_carpentier` | **`vm_carp`** — `vm_carpentier` es el nodo de LEGADO |
| El patrón y la rama del POP | `popPatron()` | **`popEsquema()`** publica `vdRama` y `cCajaPulm` |
