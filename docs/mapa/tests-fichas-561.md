# Fichas de TC-561, TC-562 y TC-563 — tanda TGA (2026-10-31)

Archivo propio porque `tests-fichas.md` está en **34,2 KB**, a 800 bytes del techo.

---

## TC-561 — los campos nuevos

**Qué fija.** Que `tga_cirugia` es **un** campo guardado nuevo y `tga_tipo = dtga` **un valor**
nuevo de un campo que ya existía; que la fila de cirugía se muestra sólo con d-TGA y que esconderla
**no borra** el valor; que el Excel pasa a **441** columnas con la nueva **última de su bloque**; y
que el round-trip entra en los dos sentidos.

**Denominadores.** `(A0)` el campo, el valor nuevo y el dueño de los dos ejes **existen** —sin eso,
«la fila se esconde» y «el Excel tiene una columna más» pasan sobre la nada—. `(D0)` el Excel base
tiene 441 columnas y la nueva está entre ellas.

**Controles negativos.** `(B4)` con «Post-Mustard» la fila **no** se muestra, porque el tipo ya dice
la cirugía. `(C5)` un valor que no está en el vocabulario **no se cuela** por el dueño. `(E4)` una
etiqueta ajena al vocabulario se **rechaza** en la importación. `(F3)` el valor **no** se borra al
esconderse la fila, y `(F4)` un recálculo completo tampoco lo toca.

**La condición que nació de una mutación que sobrevivió.** `(D7)`: sacar el rótulo del valor nuevo
del mapa `TIPO` del informe deja a `TIPO[tipo]` o-bien `tipo` publicando el token crudo «dtga» en el
papel **firmado**, y el caso —que se llama «d-TGA un valor nuevo»— no lo veía: miraba el Excel y no
el informe. **El Excel tiene su propio mapa**, así que una condición sobre él no cubre al otro.

**Cae contra HEAD por 24 condiciones**, ninguna por excepción.

---

## TC-562 — el diagrama 3D

**Qué fija.** Que la geometría coincide con la demo en los **cuatro escenarios alcanzables** y en
las **tres comunicaciones**; que las comunicaciones se leen de sus propias pestañas; que la librería
**no se baja** sin tipo cargado; y que el diagrama entra al motor de tercios como congénito.

**Denominadores.** `(A0)` las seis funciones del diagrama existen. `(B0)` la caja, el lienzo y los
seis controles están en el documento.

**Controles negativos.** `(C5)` con L-TGA la cirugía **no** cambia la escena, que es la regla de la
demo. `(C10)` con el switch auricular las comunicaciones **no** se dibujan. `(D5)` la vista de
referencia **no** escribe ningún campo. `(E4)` sin dato de cirugía la línea del papel **no** dice
«sin cirugía». `(F3)` sin tipo cargado **no hay** línea.

⚠️ **Lo que este caso NO mide: no baja la librería 3D.** Mide la **geometría** —que es pura y no
necesita three.js—, la compuerta de la carga diferida y el registro del PDF. El dibujo real en el
navegador lo miden `scripts/_probe_tga2.mjs` y la sonda de dos motores. Un caso de la suite que
dependiera de la red sería el intermitente que `TC-358` ya es.

**Cae contra HEAD por 29 condiciones**, ninguna por excepción.

---

## TC-563 — la cirugía en el papel, y la parada de la Parte B

**Qué fija (bloque B).** Que la cirugía se dice **una** vez en el cuerpo y **una** en el EN SUMA;
nunca con `mustard`/`senning` —que ya la nombran—, nunca con `cctga`, y nunca sin dato.

**Qué fija (bloque C) — y esto es una PARADA, no un cambio.** Que la recomendación de desfibrilador
de la miocardiopatía hipertrófica **no vive** en la Evidencia de su sección, ni en ninguno de los
**74** globos ⓘ, ni en ninguna de las **62** fichas de Referencias. Mientras eso sea así, la poda
de esa sección del PPT de congénitas **no se puede hacer**: retirarla del papel la perdería de la
aplicación entera.

⚠️ **El bloque C pasa en los DOS árboles, y es a propósito.** No es cobertura de un cambio: es el
**guardián de la parada**. Si alguna vez la recomendación entra en la Evidencia o en un ⓘ con su
fuente, `(C2)`, `(C4)` o `(C5)` se ponen **rojos** y recién entonces la poda se puede hacer.

**Controles.** `(C0)` la conclusión de la MCH se emite de verdad en la escena montada —sin eso, «el
PPT no la poda» pasa sobre un texto vacío—. `(C1)` la Evidencia de la MCH y el registro de globos
no están vacíos. `(C3)` es el **control positivo del censo**: el papel **sí** dice la recomendación,
dos veces, que es lo que hace creíble el cero de `(C2)`. `(C6)` el podador la deja **entera**, sin
perder el recuento.

**Cae contra HEAD por 5 condiciones** —las del bloque B—, ninguna por excepción. Las del bloque C
pasan en los dos árboles, por lo dicho arriba.
