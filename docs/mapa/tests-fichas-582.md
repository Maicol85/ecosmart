# Fichas de los casos TC-582 a TC-585 — tanda POP-B (2026-11-01)

Archivo propio porque `tests-fichas.md` está en 34,2 KB. Los punteros tanda por tanda viven en
`tests-punteros-tandas.md`; el mapa de la tanda es `popb-dibujo-posoperatorio.md`.

Los cuatro **caen contra `f8ea371`** —el cierre de POP-A— por condiciones y **ninguno por
excepción**, verificado en un worktree con el mismo archivo de tests.

⚠️ **El suite corre Chrome SIN `--window-size`, o sea a 756 px de ancho.** Lo que vive por encima
del corte de 900 px NO se puede medir por geometría acá: esos contratos se fijan leyendo la
**regla** de la hoja de estilos (`reglaMedia`) y la **estructura** del DOM, igual que TC-577 y
TC-581.

---

## TC-582 · el botón que dice por qué, y el conteo de fármacos

**Qué fija.** Que `#pop_integrar` conserve, **después del barrido de 220 ms**, el `title` que dice
por qué no puede integrar; que integre con el estudio completo; y que el contador del desplegable
de fármacos coincida **siempre** con las filas visibles.

| bloque | condiciones |
|---|---|
| (A) | denominadores: la sección abre y el botón existe |
| (B) | sin datos: deshabilitado, y su `title` **empieza** con «Sin patrón que integrar» y nombra lo que falta |
| (C) | con el estudio completo: hay patrón, el botón se habilita, su `title` pasa a «Agrega la hoja PostCEC…», el **click real** integra y el texto llega al bloque |
| (D) | el contador: dos drogas + balón dicen **dos**; el azul sin dosis suma su fila; sin drogas y con balón, «ninguno marcado»; y la asistencia sigue consignada |

⚠️ **(B2) y (C3) esperan 900 ms a propósito**, que es más que el debounce: el defecto que este
caso cierra era que `_amiloAvisoPintar` le borraba el `title` **220 ms después**. Midiendo en el
acto, el caso pasaría sobre el defecto.

⚠️ **(D1) cuenta las filas por el `display` computado y no por la clase `.pop-droga-on`**, que es
lo que el contador usa: con la clase, el control compararía el conteo contra sí mismo.

**(D7) es el control negativo**: la asistencia circulatoria dejó de contarse, pero no se perdió.

---

## TC-583 · el tipo de una válvula operada

**Qué fija.** Que el selector ofrezca **sólo prótesis**; que con una morfología **nativa** quede en
«— elegir tipo —», lo **avise** nombrándola y **no toque** Válvulas; que al elegir una prótesis la
escriba; y que el **papel** nunca describa la cirugía con una morfología nativa.

| bloque | condiciones |
|---|---|
| (A) | denominadores: la sección abre y la fila de válvulas se ve con «Valvular» marcada |
| (B) | la primera opción es la vacía en las cuatro; **todas las demás son prótesis**; la aórtica no ofrece TAVI; el dueño SÍ tiene nativas (denominador del filtro); las cuatro ofrecen tres opciones |
| (C) | con `vt_morf` en «Mixomatosa»: selector vacío, sin etiqueta, la nota la nombra y dice que se reemplaza, el dueño intacto, y el papel dice «sin tipo consignado» |
| (D) | al elegir «Prótesis mecánica»: se escribe en `vt_morf`, la etiqueta pasa a «de Válvulas», la nota se va, el papel la dice, y el barrido no la repuebla ni la borra |
| (E) | control negativo: marcar dos válvulas más **no escribe** ninguna morfología, y el papel lo dice de las dos |

⚠️ **(B2) no transcribe la lista:** exige que **toda** opción que no sea la primera empiece con
«Prótesis». Así el caso sigue valiendo el día que Válvulas agregue otra.

⚠️ **(B4) es el denominador del filtro:** sin él, «no hay nativas en el selector» pasaría también
si el dueño no tuviera ninguna.

⚠️ **(E3) necesitó marcar LAS DOS válvulas sin tipo.** Con una sola el conteo daba 1 y no
distinguía «no escribe tipo» de «hay una válvula menos marcada». Lo destapó la primera corrida.

---

## TC-584 · la disposición

**Qué fija.** Que «Pleura y pulmón» sea una tarjeta de **ancho completo fuera** de las tres
columnas y **después** de ellas, en dos columnas desde 900 px; que la ecocardiografía y el
ventrículo derecho cuelguen del **mismo** contenedor de dos columnas y el pericardio no; y que
**ningún id** se mueva.

| bloque | condiciones |
|---|---|
| (B) | la tarjeta existe, lleva `pop-card-wide`, **no** vive dentro de `.pop-cols`, va después de ella, su grilla son dos columnas desde 900 px y **una** por debajo |
| (C) | los **seis** selectores y las **dos** cápsulas viven en la tarjeta nueva; el pericardio y el ventrículo derecho **se quedan** en «Eco y POCUS» |
| (D) | el eco y el VD cuelgan del mismo `.pop-eco-par`, que son dos columnas desde 900 px, y el pericardio **no** está en él |
| (E) | las dos cápsulas siguen publicando su texto; y el vocabulario de pleura y pulmón **no** se unificó —cinco opciones por lado, cuatro en líneas B—, que es lo que PA-e deja abierto |

⚠️ **(B6) mide la grilla a 756 px, que es el ancho del suite**: ahí tiene que ser **una** columna.
El reparto en dos se fija por la regla, en (B5).

---

## TC-585 · el dibujo

**Qué fija.** Que en la escena más cargada no haya **un solo** texto superpuesto ni fuera del
lienzo; que el derrame pleural sea un **nivel** que sube con el grado; que el puente, la malla y
los tres drenajes se dibujen **sólo** con su dato; y que las cuatro válvulas tengan su tipo y su
latido en la fase que les toca.

| bloque | condiciones |
|---|---|
| (B) | once fármacos, los dos derrames, líneas B difusas, balón con timing y derrame severo: **cero** superposiciones, **cero** textos fuera del lienzo, el rótulo del derrame pleural **no** está en el dibujo pero su grado **sí** en las características, y la franja publica el conteo |
| (C) | el nivel sube de leve a moderado y de moderado a severo, su borde de abajo **no se mueve** (y 268), y con «ausente» no se dibuja nada |
| (D) | las cinco capas apagadas sin cirugía; el puente solo con «Revascularización»; la malla sola con «Aorta con injerto»; el drenaje izquierdo solo; las cinco juntas sin superponer un texto; y las tres nombradas en las características |
| (E) | la aórtica y la mitral se dibujan y las otras dos no; mecánica con anillo oscuro, biológica clara con sus **tres** soportes, sin tipo punteada y **sin velos**; las dos laten; **nunca** las dos abiertas a la vez; y sin frecuencia, quietas y cerradas |

⚠️ **(B2) y (B3) cruzan las cajas de TODOS los textos del SVG entre sí**, con `getBBox`, y (B1)
es su denominador: sin textos que contar, «cero superposiciones» no prueba nada.

⚠️ **(E7) a (E10) traen el dibujo a la vista con `scrollIntoView` antes de muestrear.** El bucle
se apaga cuando el dibujo no se ve —lo apaga su `IntersectionObserver`— y en la ventana del suite
el esquema cae en y 2000: sin eso el hueco de los velos se lee **siempre en 0**, que es el cuadro
único de la fase 0 y se parece a «no late». Costó una medición entera.

⚠️ **(E9) es la condición que fija el reparto de fase**, y es pareada: cuenta las muestras en que
la aórtica y la mitral están abiertas **al mismo tiempo**, que tienen que ser cero. Las dos
máximas por separado no lo prueban.

**(C6), (D1), (D2), (D3), (D4) y (E1) son controles negativos**: lo que **no** se dibuja.
