<!-- Ficha del TC-540. Archivo propio porque `tests-fichas.md` ya estaba en 34,2 KB. -->

# TC-540 — la tanda D: calculadora de riesgo CV y score de amiloidosis

**Dónde**: `scripts/test_clinico.mjs`, justo después de TC-539.
**Qué fija**: 31 condiciones en diez grupos, con **tres denominadores declarados** y **cinco
controles negativos**.

## Los grupos

| Grupo | Qué fija |
|---|---|
| **DENOMINADOR CO** | las quince casillas existen y la cápsula responde — sin esto, todo lo demás mide sobre un módulo que no se montó |
| **C1 · C2** | hay **un solo** selector de fármaco y «Datos basales» lo refleja |
| **A1** | anti-HER2 sin factores = **BAJO** (en HEAD salía alto) |
| **A2** | antraciclina + anti-HER2 = **ALTO**, por la nota al pie g |
| **A3** | la **asimetría de la FA**: bajo con antraciclinas, moderado con anti-HER2 |
| **A4** | IC previa = muy alto · cardiopatía isquémica = alto |
| **A5** | los **dos bordes** de la regla: 4 puntos moderado, 5 alto, un solo M1 bajo |
| **A6** | las **dos filas de edad**: 72 moderado, 83 alto |
| **A7** | sexo femenino y GLS basal **no puntúan**, y la pantalla los nombra |
| **A8** | el antecedente CV **sin especificar** no suma y pide elegir cuál |
| **B1 · B2 · B3** | la derivación por categoría, y **B3 es control negativo**: en bajo no hay acción |
| **B4 · B5** | la última fila vale en cualquier categoría; **B5 es control negativo**: sin hallazgos no se afirma que no los haya |
| **B6** | clases y niveles **en el globo**, no en la línea visible (regla R2) |
| **D1 · D2** | el calendario es del fármaco: 3 meses en anti-HER2, dos ciclos en antraciclinas |
| **D3 · D4** | un fármaco sin columna no recibe calendario, con **dos textos distintos** |
| **E1** | vaciar la calculadora vacía «Datos basales» |
| **DENOMINADOR F** | el score se pobló solo, o sea que había algo que contar |
| **F1 · F2** | cuatro criterios se marcan solos; **F2 es control negativo**: el ápice nunca |
| **F3** | el puntaje llega solo al algoritmo y el botón retirado no está |
| **F4** | el destildado a mano sobrevive al barrido |
| **F5** | módulo → app escribe si está vacío y **no pisa** si difiere |
| **G1** | las **once filas** del rendimiento por corte contra la Tabla 4 |
| **G2 · G3 · G4** | sin «transtiretina», con los límites de la fuente, sin el apellido del autor |
| **DENOMINADOR H · H1** | las siete tablas y ninguna celda sin tilde |
| **I1 · I2** | **controles negativos**: un estudio ajeno no nombra ninguno de los dos módulos y su `alg-ett-score` sigue vacío |

## Lo que costó escribirlo

⚠️ **ACENTOS GRAVES EN EL CUERPO.** Dos veces: una en un comentario que citaba `co_edad` y otra en
uno que citaba `window`. El cuerpo es un template literal y uno solo lo cierra, con un
`SyntaxError` que apunta decenas de líneas antes del culpable. `check_backticks.py` sólo mira
`scripts/*.mjs` por patrón, así que **no los caza dentro de un `caso(...)`**: hay que contar los
backticks del fragmento antes de insertarlo.

⚠️ **EL GLOBO ⓘ NO SE LEE DESDE `VINFO`.** Esa constante **no está en `window`** —es un `const` de
módulo—, así que leerla daba cadena vacía y tres condiciones pasaban por el lado equivocado. Se
abre por su **botón real**, que además es el gesto del médico.

⚠️ **Y EL BOTÓN DEL GLOBO MIDE 0 × 0 CON LA TARJETA PLEGADA.** `_vInfoColocar` sale sin abrir nada
cuando el ancla no tiene caja, así que el caso abre la pestaña por su botón **y** despliega sus
tarjetas antes de medir. Es la lección **E-b** de este repo: `showTab` por código no le da caja a
la tarjeta de adentro.

⚠️ **E1 PASABA EN HEAD Y NO DEBÍA.** El helper `farmaco()` llama a `calcCardioOnco()`, que es
**justo** el disparador que la app no tiene cuando el médico destilda una casilla: con esa llamada
el defecto de limpieza no aparece. Hoy la condición hace **sólo el gesto**. Es el error de TC-519,
que fabricaba el disparador que faltaba y pasaba en verde sobre un defecto.

⚠️ **LA MARCA DE «LO DECIDIÓ UNA PERSONA» SOBREVIVE A `limpiar()`.** Vive en el input oculto
`hfaicos_manual`, que **viaja con el estudio**, así que una escena heredaba las casillas protegidas
de la anterior. `escenaCO()` lo vacía a mano, igual que TC-539 tuvo que borrar las pastillas de
válvulas.

⚠️ **CONTRA HEAD CAE ENTERO, NO ABORTA.** La primera versión reventaba en la condición A7
(`a7.fueraDeTabla.length` sobre un objeto que HEAD no devuelve) y las veinte condiciones de abajo
no llegaban a correr: una sola excepción ocultaba qué distinguía de verdad los dos árboles. Con
los accesos endurecidos, **31 de 31 condiciones caen contra HEAD** y los cinco controles negativos
pasan en los dos, que es como tiene que ser.
