# Fichas de los casos TC-714 a TC-719 (tanda PANT-17, 2026-11-06)

Los seis caen contra `040d89e` —el cierre de PANT-14c— por **56 condiciones y CERO excepciones**,
verificado en un worktree alternando sólo `index.html` con el **mismo** archivo de casos.

⚠️ **La primera versión caía por EXCEPCIÓN los seis, y eso no es caer:** un caso que revienta con
un `ReferenceError` no dice **qué** invariante se rompió. Es la lección de TC-546. Se cerró con
accesores con guarda: **`_g`** para los registros —devuelve un valor por omisión— y **`_gx`**
para las funciones —sólo atrapa la excepción—.
⚠️ **Y `_g` no sirve donde el `null` ES el dato:** en `(B0)` de TC-716 el `null` es justamente lo
que se mide —que sin datos la sección no abre—, así que ahí va `_gx`. Costó una corrida.

⚠️ **Se cuenta por ROTULO y no por botonera.** Una pregunta pre-respondida desde el estudio sale
como fila **sin** botonera: contar botoneras mide «cuántas quedan por contestar» y no «cuántas
publica la sección». Cuatro condiciones de tres casos distintos lo pagaron. Y el **valor** se
busca por **clave** del registro y no por una expresión regular sobre el rótulo: un rótulo es
texto de pantalla y se reescribe; la clave es el contrato.

## TC-714 — el cuestionario del ductus (commit 3a)

Trece preguntas de tres estados, claves únicas, y todas con clave, rótulo, guía y recomendación.
La **única** pre-respondida desde el estudio es la dirección del cortocircuito: `id` → Sí, `di` →
No, y **`bi` queda sin contestar**, que es el control negativo `(C3)`. El papel no lleva clase,
nivel ni folio. Lo matan **M01, M02, M03 y M20**.

## TC-715 — el cuestionario de la coartación (commit 3b)

Trece preguntas, la guía que rige es la **ESC 2024 de aorta**. Con los cuatro campos sembrados
hay **cuatro** pre-respuestas y quedan **nueve** contestables: la quinta es la cola diastólica,
que necesita su propio campo — y eso es el control de que la pre-respuesta sale del **dato**.
`(D1)` a `(D4)` miden los dos cortes por sus dos lados: 28 contra 12 mmHg y 60 contra 30 %.
Lo matan **M04, M05 y M06**.

## TC-716 — la Fallot reparada del VD y la estenosis pulmonar (commit 4)

`(A1)` y `(A2)` recorren **`IND_SECS` entera**: ningún título se repite y **ninguno es prefijo de
otro** —el panel busca la sección por el prefijo de su título, así que un título que sea prefijo
de otro deja una de las dos sin probar—. `(B2)` es la condición que importa: la sección nueva
trae **tarjeta de datos**, que no es opcional. Lo matan **M07, M08 y M09**.

## TC-717 — la bicúspide y la miocardiopatía, con sus dos controles (commit 5)

La conclusión de la bicúspide y la MCH obstructiva ganan preguntas; `(B4)` y `(C4)` son
**controles negativos**: la sección de **aorta ascendente** de la bicúspide y la de **muerte
súbita** siguen **sin ninguna**. Lo matan **M10 y M11**.

## TC-718 — la ventana aortopulmonar (commit 6)

Seis preguntas, claves únicas, y `(A2b)` —nacida de una mutación que sobrevivió— exige que las
seis traigan clave, rótulo, **guía** y lo que la serie muestra. `(C1)` y `(C2)` son el corazón
del caso: **cero clases y cero niveles** en toda la sección. `(C3)`, `(C4)` y `(C5)` piden el
folio del artículo, el de la única guía que la toca y el denominador de la serie. `(D3)` es el
control negativo del bidireccional. `(E2)` exige que el papel no nombre al artículo.
Lo matan **M12, M13, M14, M15 y M16**.

## TC-719 — el color al tocar (commit 7)

Abre el corazón maestro por el camino real —el botón de la pestaña y después `cc3d-abrir`— y
espera 4,2 s: la librería se baja de un CDN. `(B1)` es el control negativo —un arrastre de 40 px
no apaga nada—; `(B2)` y `(B3)`, el toque y su vuelta; `(C1)`, que la escena nueva borra lo
apagado; `(C3)` y `(C4)`, que el repintado del MISMO dibujo lo conserva **con la misma clave**;
`(D1)`, que el recuadro no ganó un solo botón. Lo matan **M17, M18 y M19**.
⚠️ `(C4)` compara contra la clave de **antes del repintado** y no contra la del primer toque:
entre medio la escena cambió, y justamente por eso el conjunto se vació.
