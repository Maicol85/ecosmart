# Fichas de los casos TC-705 a TC-713 — tanda PANT-14c (2026-11-05/06)

> Archivo propio porque `docs/mapa/tests-fichas.md` está en **34,2 KB**, a menos de 1 KB del techo.
> El puntero de la tanda, con la tabla de adaptados, está en
> `docs/mapa/tests-punteros-noviembre.md`.
> El mapa de la tanda es `docs/mapa/pant14c-pdf-colores.md`.

**Los nueve caen contra `741d0cc` —el cierre de PANT-14b— por 99 condiciones y NINGUNA por
excepción**, verificado en un worktree alternando sólo `index.html` con el mismo archivo de casos:
15, 2, 7, 14, 10, 18, 12, 14 y 7 condiciones rojas.

---

## TC-705 · el 3D del PDF recortado al contenido, y el texto que describe lo dibujado

**Commit 1.** Qué fija:

- **(A)** `CM_PDF_AR` existe y vale 1,25, y `CM_PDF_MARGEN` 0,04.
- **(B)** el recolector del PDF pasa el `ar` en su parte, que es lo que impide que `_pdfTile` la
  estampe **cuadrada** —`p.ar || 1` es su valor por omisión, y por eso un 4:3 salía estirado—.
- **(C)** `_cm3dCaptura` **recorta al contenido**: la relación ancho/alto de lo que devuelve es
  `CM_PDF_AR` y no la del lienzo.
- **(D)** `cmPapelTexto()` arma sus **cuatro** partes —el título con sus siglas, las lesiones
  dibujadas con su nombre completo, la línea del recorrido de la circulación de esa escena y la
  leyenda de colores de lo que está dibujado— y todas salen de textos que la app ya tiene:
  `cmTitulo`, `CM_SIG`, `TGA3D_CIRC` y `CM_LEY`.
- **(E)** **CONTROLES NEGATIVOS del papel**: el texto **no** contiene el nombre de ninguna guía, ni
  una clase, ni un nivel, ni un folio, ni una tabla, ni un verbo de conducta, ni una frase de dato
  faltante. Es la regla fija del proyecto, y el bloque la mide marcador por marcador.
- **(F)** la leyenda publica **sólo las entradas presentes** en la escena, no las once.
- **(G)** `cmPapelTexto` **guarda y restaura** el estado del módulo, así que leerlo no deja el
  dibujo en otra escena.

**DENOMINADORES**: que las constantes existan; que la escena tenga objetos; que el recolector
devuelva una parte. **Siete mutaciones.**

---

## TC-706 · el esquema se rasteriza al ABRIRLO, no sólo al tocar el botón

**Commit 1d.** Es el defecto «abrí el esquema ◫ y el PDF no lo trajo»: el botón «Incluir en el PDF»
rasteriza lo que hay **en ese momento**, así que tocarlo primero y abrir el esquema después dejaba
el esquema fuera. Hoy `cmSchSet` llama a `cmEsqPdfRaster(true)` al final.

- **(A)** sin el esquema abierto, `cmEsqPdfData()` no trae imagen.
- **(B)** **con el gesto real** —`cmSchSet(true)`, que es lo que el botón ◫ llama— la imagen queda
  preparada. **No se llama a `cmEsqPdfRaster` a mano**: hacerlo fabricaría el disparador que la app
  tendría que tener, que es el modo de falla que esta casa documenta una docena de veces.

**DENOMINADOR**: que las dos funciones existan. **Una mutación.**

---

## TC-707 · el esquema del posoperatorio deja de salir solo

**Commit 2.** Qué fija:

- **(A)** `pop_esq_pdf` es un **`input hidden`**, que es por lo que el barrido de `limpiarCampos`
  —que toma `text`, `number` y `textarea`— **no lo alcanzaba** y la casilla sobrevivía a «Nuevo
  estudio». Por eso tiene su línea propia, igual que `pac_id_print` y `vci_no_vis`.
- **(B)** con el formulario vacío, `popHayDatos()` da **falso**; con la casilla **encendida** y
  nada más, `popEsqPdfData()` **no entrega dato**: el PDF no emite un esquema vacío.
- **(C)** con un dato del posoperatorio cargado —`pop_cx_horas`— el predicado dice que **sí** hay.
- **(D)** **CONTROL**: el predicado **excluye su propio interruptor**, así que encender la casilla
  no se cuenta a sí mismo como dato. Sin esa exclusión el espejo se autorizaría solo, que es la
  forma que `_labUsaTavi` ya documenta.
- **(E)** «Nuevo estudio» la apaga.
- **(F)** **no se toca** el contenido ni el cálculo del esquema, y **un estudio viejo** guardado con
  la casilla encendida **y con datos** lo sigue incluyendo: no se migra nada.

⚠️ **El campo de la hora se llama `pop_cx_horas` y no `pop_hora`**, y la primera versión de este
caso sembraba el id que no existe: el control daba falso sobre un formulario que seguía vacío.
**Cuatro mutaciones.**

---

## TC-708 · los dos violetas, y cada túnel con el suyo

**Commits 3a y 3b.** Qué fija:

- **(A)** `TGA3D_C.violet` y `TGA3D_C.violetClaro` existen, y el violeta del esquema sale del
  **mismo número**.
- **(B)** el switch auricular lleva **un** tubo en el violeta oscuro y **uno** en el claro, los dos
  colores son **distintos**, y las partículas **conservan** su azul y su rojo.
- **(C)** el **Rastelli** lleva su túnel en oscuro y su conducto en claro; las otras **tres**
  variantes no tienen un solo tubo violeta.
- **(D)** la **separación medida**: el cociente de luminancia relativa entre los dos violetas es
  **2,64** —la orden pide 1,6— y cada uno contra el fondo da **2,70** y **7,14** —pide 1,5—.
- **(E)** la **distancia de tono al azul**: **55,9°** el oscuro y **53,9°** el claro, con el azul en
  216,1°.
- **(F)** el esquema declara el **tono por tramo**: `1:o|4:c`, no los dos iguales.
- **(G)** los rótulos **no se solapan**, con `CM_LBL_TOL` como su tolerancia.

**DENOMINADORES**: la paleta; la escena con sus dos tubos. **Siete mutaciones.**

---

## TC-709 · el anillo de la obstrucción acostado, y las suturas en malla

**Commits 3d y 3e.** Qué fija:

- **(A)** `CM_OBS_BAJO` existe y está entre 0,25 y 0,35, y las cinco variantes llevan su anillo con
  **normal propia**.
- **(B)** las cinco lo ubican por debajo del origen de la aorta **siguiendo su tangente**, con
  tolerancia **0,002**, y su radio sale del radio de la aorta en ese punto.
  ⚠️ **La separación entre el punto con tangente y el que baja en Y es de 0,033 a 0,061**, medido en
  las cinco: o sea que la condición **sí** distingue las dos formas de ubicarlo.
- **(C)** **CONTROL**: sin obstrucción no hay ningún anillo gris.
- **(D)** el motor gira el anillo con su normal, y **sólo** quien la pide la lleva: los otros
  anillos del módulo —el Fallot, el defecto AV, Ebstein, Fontan— **no** la llevan.
- **(E)** las dos suturas del Jatene **dejan de ser anillos** y pasan a **bandas de malla**, con su
  alto `CM_SUT_ALTO`, su normal y su textura generada por código. **Nunca se reusa el toro de un
  anillo para una sutura**, que es lo que las hacía confundibles con el anillo de la obstrucción.

**Siete mutaciones.**

---

## TC-710 · el celeste de la cava, el verde del parche y la leyenda por entradas

**Commits 3c, 3f y 3g.** Qué fija:

- **(A)** `CM_C.celeste` y `CM_C.green` existen, y la cava izquierda persistente se dibuja en
  **celeste**.
- **(B)** el parche de la CIV del Fallot **operado** va en **verde**, con la banda del tracto de
  salida también verde, y la **CIV residual se dibuja CRUZANDO el parche**: su anillo queda en el
  **borde** del disco y su corriente va a lo largo de la **normal** del parche.
- **(C)** **CONTROL**: el **Rastelli no lleva parche verde** —su CIV la cierra el túnel— y **no se
  dibuja ningún parche de CIA**, porque ningún dato de la app consigna uno.
- **(D)** la leyenda está partida en **once entradas** con id propio, en las **dos** copias
  —`cm3d-leg-*` y `cm3d-leg2-*`—, y cada una se enciende **sólo** si lo suyo está dibujado. El
  pintor es **uno** para las dos.
- **(E)** **CONTROL**: el corazón normal prende **sólo** las dos de la sangre.

⚠️ **Y el colector del color tiene que saber que `e.c` es un color SÓLO en un `tube`**: en un
`ring`, un `disc`, un `cone`, una `sph`, una `zone` o una `leaf` es el **centro**, un array. Leerlo
como color dejaba la entrada de comunicación apagada con la CIV residual dibujada — un defecto
real que destapó la medición del inventario, no la lectura. **Ocho mutaciones.**

---

## TC-711 · el título de lo que se dibuja, y los dos textos chicos que se fueron

**Commit 4.** Qué fija:

- **(A)** `cmTituloSync` escribe los **dos** nodos —`cm3d-tit` en el recuadro y `cm3d-schtit` en la
  cabecera del esquema— y sale del **mismo** `cmTitulo(S)` que el texto del papel, así que el
  título y el PDF no pueden discrepar.
- **(B)** con una CIA cargada el título la nombra por su sigla, y el de la cabecera lo sigue.
- **(C)** los dos textos chicos que **repetían** lo que el título y el dibujo ya muestran no están:
  «Todas las lesiones cargadas están dibujadas» y la descripción del modo «Explorar».
- **(D)** **lo que SE MANTIENE**: la línea de lo que **no** se dibuja, la que dice que no hay nada
  cargado, y el aviso de conexión —que lo escribe **`_cm3dAviso`** cuando de verdad falla, no un
  texto fijo—. Las dos aclaraciones —«esquemático, no a escala» y «se rota arrastrando»— bajaron al
  **ⓘ existente**, palabra por palabra.

⚠️ **Buscar «Necesita conexi» en TODO el documento es un falso positivo**: aparece en la caja de
aviso del exportador de PowerPoint. La condición se acota al recuadro del módulo.
**Cinco mutaciones.**

---

## TC-712 · la pestaña de la transposición en cuatro grupos

**Commit 5.** Qué fija:

- **(A)** el botón «Ver en 3D» **propio** de la sección ya no existe, y el **común** sí.
- **(B)** los **cuatro** grupos con su encabezado, los **once** campos repartidos y **ninguno**
  perdido ni duplicado.
- **(C)** el reparto exacto por grupo, leyendo el encabezado de cada columna.
- **(D)** `tgaGruposSync` mira el `display` **computado** de cada campo y no su atributo, y es el
  **mismo dueño** que muestra y esconde cada campo, así que no pueden discrepar.
- **(E)** un grupo **sin campos visibles no ocupa su columna**.
- **(F)** **ningún id cambió**, y **ningún `tabindex` POSITIVO** fuerza el orden: los dos
  `tabindex="-1"` que hay son los **preexistentes** de los dos espejos de solo lectura, que sacan
  el campo del recorrido —lo correcto para un `readonly`—.
- **(G)** los cortes de **1000** y **768 px** están declarados en la hoja de estilos con su valor.

⚠️ **El `tga_bav` pasa del lugar 6 al 10**, y es el único de los once que se mueve: los dos campos
clínicos estaban separados por el bloque de la obstrucción, así que agrupar por tema los junta.
Declarado en **P14c-f**, con la verificación de que el papel no se movió. **Cinco mutaciones.**

---

## TC-713 · las secciones de congénitas, cerradas al entrar

**Commit 6.** Qué fija:

- **(A)** `ccSeccionesCerrar` existe, alcanza **sólo** a las dos pestañas de congénitas
  (`CC_TABS_CERRAR`), y `secAutoOpen` y `cardAutoOpen` **no se eliminaron**.
- **(B)** el recorrido real: tres secciones abiertas a mano, irse a otra pestaña y volver deja
  **cero** abiertas. **Y (B2) mide el ORDEN**: con un dato cargado —que es lo que `secAutoOpen`
  abriría— tampoco queda ninguna, o sea que el cerrador corre **después** y no antes.
- **(C)** **CONTROL**: lo que se abre **mientras** se está en la pestaña se queda abierto.
- **(D)** la otra sub-pestaña también abre con todo cerrado.
- **(E)** **CONTROL**: en una pestaña que **no** es de congénitas, `secAutoOpen` **sigue** abriendo
  la sección con datos.
- **(F)** el cierre usa las **mismas piezas** que `secToggle` —la clase, el `aria-expanded` y el
  `max-height` en cero con su `overflow`—, y **no toca ningún campo** del estudio.

⚠️ **`showTab` está ENVUELTA DOS VECES** —el repintado de los botones flotantes y el cajón
lateral—, así que `String(showTab)` devuelve el envoltorio y **no contiene** ni `secAutoOpen` ni
`ccSeccionesCerrar`: las dos condiciones que miraban su texto daban falso sobre código correcto y
se reemplazaron por el comportamiento, que es más fuerte.
⚠️ **La clave de la anomalía de Ebstein es `cc-ebs` y no `cc-ebstein`**: con la que no existe sólo
se abrían dos secciones y el denominador no se cumplía. **Cuatro mutaciones.**
