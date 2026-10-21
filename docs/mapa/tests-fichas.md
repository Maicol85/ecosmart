# Fichas de casos por tanda

> ⚠️ **TC-511 EN ADELANTE VIVE EN `docs/mapa/tests-fichas-511.md`.** Este archivo quedó en
> **33,3 KB** tras el trabajo B y la ficha del B2 lo cruzaba: se sacó a archivo propio ANTES de
> escribir, medido con `wc -c`.


Sale de `docs/mapa/tests.md`, que cruzó el techo de 35 KB el 2026-10-16 al agregarle TC-485.
**Lo que está acá es la ficha de cada tanda**: qué cubre su caso, cuántas condiciones tiene y
cuántas quedan en rojo contra HEAD. **Lo que está allá es el mecanismo**: cómo se agrega un caso,
cómo se corre la suite, los dos juegos de helpers, los arneses y las trampas.

> ⚠️ **ARCHIVO PARTIDO el 2026-10-17 (tanda VS):** las fichas de **TC-481 a TC-490** salieron a
> `docs/mapa/tests-fichas-481-490.md`. Estaba en 33,4 KB y la ficha de TC-494 lo cruzaba; se midio
> con `wc -c` ANTES de escribir, que es lo que `CLAUDE.md` pide y lo que las tres particiones
> anteriores tuvieron que hacer DESPUES de cruzar.

> ⚠️ **ARCHIVO PARTIDO OTRA VEZ el 2026-10-17 (tanda CORTOS):** las fichas de **TC-491 a TC-495**
> salieron a `docs/mapa/tests-fichas-491-495.md`. Estaba en **34,1 KB** —a 855 bytes del techo— y
> la ficha de TC-499 lo cruzaba; se midió con `wc -c` ANTES de escribir.

## → Fichas anteriores de este archivo

Las de **TC-496 (PRO), TC-497 (PRO-B) y TC-498 (PRO-C)** salieron a
**`docs/mapa/tests-fichas-496-498.md`** el 2026-10-18, porque este archivo estaba en 29,5 KB y la
ficha de TC-502 lo cruzaba. No se reescribió una línea.

> ⚠️ **ARCHIVO PARTIDO POR CUARTA VEZ el 2026-10-20 (tanda Y3e):** las fichas de **TC-499 a**
> **TC-501** salieron a `docs/mapa/tests-fichas-499-501.md`. Estaba en **28,9 KB** y la ficha de
> TC-505 lo cruzaba; se midió con `wc -c` ANTES de escribir, que es lo que `PENDIENTES.md` →
> **Y3d-7** dejaba anotado.

## TC-502 — la tanda «P»: Referencias con subpestañas, buscador y la tabla de cirugía (2026-10-18)

**Cubre:** las cinco subpestañas con su censo, el buscador con la coma y el punto equivalentes, el
botón «Ver referencia» de las tarjetas ⓘ con su «Volver», la subpestaña Aorta con sus tres
nomogramas y la tabla de cirugía verificada contra la ESC 2024 **y contra el dueño de la pestaña
VAB**, la entrada vieja del VD retirada, y los controles.

**52 condiciones**, contadas **instrumentando el propio caso** —poniendo su (I0) en rojo una vez— y
no a ojo sobre los `ex.push`, porque cuatro salen de un `forEach`. Ocho denominadores y seis
controles negativos.

| bloque | qué fija |
|---|---|
| **(A) subpestañas** | las cinco en orden · el censo da **30** entradas · ninguna quedó fuera de un panel · el reparto 5+2+12+3+8 · cada botón activa SOLO su panel con `aria-selected` y un único tab stop · la barra es un `tablist` con `nowrap` + `overflow-x` · **control negativo:** una subpestaña desconocida no activa ningún panel |
| **(B) buscador** | **denominador:** el índice tiene 28 (30 menos los dos agrupadores) · «RWT» trae la geometría del VI y dice su subpestaña · **«0,42» y «0.42» dan EXACTAMENTE lo mismo** · no distingue mayúsculas · sin resultados con mensaje claro · tocar una coincidencia abre y resalta · «Limpiar» vacía y esconde |
| **(C) «Ver referencia»** | **denominador:** 39 de las 44 claves tienen entrada · el assert no encuentra ninguna rota · **límite declarado:** las cinco sin botón, nombradas · las CUATRO tarjetas (aorta, AI/VI, válvula y CORTOS) abren su entrada en la subpestaña correcta, la resaltan, y «Volver» regresa |
| **(D) aorta** | los tres bloques rotulados en orden · las TRES gráficas con su ecuación · **39 mm no es dilatado y 40 exactos sí**, medido en la cápsula, y Referencias lo publica con el símbolo derivado · el ateroma con sus cinco grados · el renglón tipeado ya no está · **denominador:** la tabla con sus DOCE filas · las SEIS columnas · **cada fila con su tabla, folio y hoja** · cada fila con clase y nivel · **los cinco umbrales de la bicúspide separan en el dueño** · **control negativo:** el sondeo sabe decir que NO · las cuatro marcas en pantalla · el pie declara la guía, la traducción y la regla de folio · ningún texto lleva una nota interna |
| **(E) VD** | la entrada vieja ya no existe ni en el marcado ni en la tabla · **denominador:** las cuatro bandas de la onda S′ · **sale del dueño (9,5) y no del corte viejo (10)** · ninguna celda publica ya «S′ (cm/s)» · el área de la AD también sale del dueño (19 y no 18) |
| **(F) integración** | el texto del VAL al final de Válvulas, visible, en letra chica y con las mismas palabras |
| **(G) ciclo** | 20 vueltas por las cinco subpestañas y 20 aperturas de una entrada **no acumulan un solo nodo** —con su vuelta de calentamiento— y la entrada queda cerrada |
| **(H) nada se guarda** | ninguna clave del navegador la nombra · ningún control viaja con el estudio · **denominador:** el campo EXISTE y es el recolector el que lo excluye |
| **(I) controles** | informe y EN SUMA idénticos en los tres estilos tras navegar y buscar · Excel en **440** · el Laboratorio y la diastólica sin moverse · **denominador:** el caso declara al menos 50 condiciones |

**Sabe fallar: 35 de las 52 en rojo contra el inicio de la tanda** (worktree en `ea7f2c0`), y
**ninguna por excepción** — el caso corre entero y publica sus 35 fallos. Las 17 que pasan son lo
que esta tanda no mueve: el censo de 30 (que es el mismo en los dos árboles, y ése es el punto), el
criterio de los 40 mm del seno, el ateroma, la onda S′ del dueño y los nueve controles.

⚠️ **Cuatro condiciones salieron rojas en su primera corrida sobre un árbol perfecto**, y las
cuatro por el medidor: el índice esperaba 29 donde son 28; el selector del test de burbuja se
construía con la concatenación **dentro** de las comillas; `AO_SEGS` es un `const` de módulo y daba
`null`; y el pie dice «Folio» con mayúscula.

---

## TC-503 — tanda «Y3c» (2026-10-18)

**El dibujo estático de la mitral con giro, tres vistas y plano de corte; la tabla única de
festones; y los cuatro dibujos de medidas TEER.**

**67 condiciones**, contadas instrumentando el propio caso para que publicara su `ex.length` —no a
ojo sobre los `ex.push`, porque veinticinco salen de bucles—. **Cuatro denominadores** y **cinco
controles negativos**.

**Verificado que sabe fallar contra HEAD** (`d007921`, md5 `52cc2f1c…`) en un worktree aparte:
**55 de las 67 en rojo, y NINGUNA por excepción** —toda lectura del árbol nuevo va por un ayudante
con centinela—. Las doce que pasan son los controles del 3D, del Excel, del informe y de la
diastólica, más los denominadores que ya existían.

| bloque | qué fija |
|---|---|
| **(A)** | la tabla dueña con sus cinco filas, los extremos contra el epígrafe, el reparto esquema → fila, y los cuatro esquemas leídos **del marcado** contra su fila; el esquema de 60–90° con P2 y sin A3 |
| **(B)** | el lienzo cuadrado, el anillo de dos semiejes verticales distintos, la **sonrisa** de coaptación por su flecha, las cuatro marcas, AL del lado de la orejuela, `pointer-events` y que nada cae fuera del lienzo |
| **(C)** | el ciclo de lesiones sincronizado entre dibujo, esquemas, espejo y resumen; «Limpiar»; y que los festones **no** llevan `onclick` |
| **(D)** | la línea del plano en los cinco ángulos desde los botones del 3D, con los festones en negrita, subrayados y **sin color**; el toggle al repetir; el cierre del panel; y el control negativo del color |
| **(E)** | cero botones de girar, las flechas de 15°, las tres vistas con su marca, y el desmarcado al girar a mano |
| **(F)** | el papel con el dibujo, que **no depende de la pantalla**, que **sí** lee las lesiones, y que se dibuja en el lienzo cuadrado (leído de la cabecera IHDR del PNG) |
| **(G)** | los cuatro dibujos TEER con su valor, el borrado de un campo con su **control negativo**, el color fijo del marcador y la ausencia de colores de lesión ajenos |
| **(H)** | nada se guarda ni en el estudio ni en el navegador; y los **controles** de que el 3D no cambió (`M3D_VIS`, `M3D_ANGS` y los ocho botones con sus nombres) |
| **(I)** | los controles del Excel en 440, del informe y del EN SUMA, y de la diastólica |

⚠️ **TRES COSAS QUE EL PROPIO CASO DESTAPÓ, y que una lectura no habría dado:**
1. **un `.click()` sintético ya no cicla la lesión**, porque desde el commit del giro los polígonos
   no tienen `onclick`: hay que despachar `pointerdown` + `pointerup`. La primera versión informó
   «el ciclo no funciona» sobre un ciclo perfecto **y además dejó en falso al control del PDF**,
   que compara el papel con y sin lesión;
2. **el botón del 3D nace `hidden`** y hay que llamar a `m3dBotonSync()` antes de medirlo;
3. **el botón de la vista se desmarcaba recién AL CONVERGER** —durante todo el giro quedaba
   marcada una orientación que ya no era la del destino—. **Eso se corrigió en `index.html`**, en
   el mismo commit.

⚠️ **UNA CONDICIÓN SE REESCRIBIÓ PARA MEDIR COMPORTAMIENTO Y NO EXPRESIÓN:** la que comprobaba que
el canvas ya no usa los paths cableados miraba el **fuente** de la función. Hoy lee los cuatro
bytes de ancho y los cuatro de alto de la **cabecera IHDR del PNG** y exige 840 × 840 —el lienzo
cuadrado con supermuestreo 2×—, que es el único lugar donde eso se comprueba sin mirar el código.

---

## TC-504 — tanda «Y3d» (2026-10-19)

**Los rótulos de festón visibles siempre; los cuatro defectos de los criterios TEER; la FEVI y el
DSFVI completándose solos; y la sección VAB entera —disposición, casillas, dibujo, morfología,
informe, PDF y el recordatorio de la coartación—.**

**63 condiciones**, contadas **instrumentando el propio caso** para que publicara su `ex.length`
—no a ojo sobre los `ex.push`, porque ocho salen de bucles—. **Cuatro denominadores** y **cinco
controles negativos**.

**Verificado que sabe fallar contra el inicio de la tanda** (`a40ccc2`, md5 `9281f677…`) en un
worktree aparte: **51 de las 63 en rojo, y NINGUNA por excepción**. Las doce que pasan son lo que
esta tanda **no mueve**: los dos denominadores, la línea del plano (A4), los tres controles
negativos (B8, G3, H9), el fenotipo aortopático que ya existía (H7), el aviso que no llega al
informe porque allá no existe (G4), las 440 columnas (K2) y —esto importa— **C1 y C3**: la
**copia** de la FEVI y el DSFVI ya funcionaba llamándola a mano, lo que faltaba era el
**disparador**, que es C2 y sí está en rojo.

| bloque | qué fija |
|---|---|
| **(A)** | los seis rótulos de festón en las **tres vistas** y en los **ocho ángulos** de giro; que `ETE_QX_VISTAS` ya no declara ninguna bandera de letras; y que tocar **dos veces** el mismo ángulo sigue apagando la línea del plano |
| **(B)** | el **flail gap** con su fila y votando (9,9 / **10** / 10,1), el **ancho** del flail (14,9 / **15** / 15,1), la **longitud de coaptación** con su propio corte (1,9 / **2** / 2,1), que sin dato nunca dice «APTO» y sí «Datos incompletos — falta: …», y el **control** de que los otros criterios no se movieron |
| **(C)** | la FEVI y el DSFVI copiados desde AI/VI, el **disparador en el origen**, que al borrar vuelven a vacío, y el rótulo unificado a **DSFVI** en el campo **y** en el criterio |
| **(D)** | las seis tarjetas ⓘ registradas, los seis como `<button>` **sin `title`** y sin llevar al manual, abrir y cerrar con dos toques, el campo de morfología oculto y el dibujo con su host |
| **(E)** | las seis **casillas**, su dato en los mismos campos ocultos, el conteo 0 → 1 → 2 → 1, los valores que escribe, la fila que dice «marcados», la **migración** de los cuatro valores guardados, «Nuevo estudio» destildando, y que la conclusión nunca afirma «sin factores de riesgo» |
| **(F)** | el dibujo sin afirmar nada sin tipo, con cierre y letras con tipo, el rafe calcificado en el verde de la paleta, la **orientación verificada** (R arriba, L abajo-derecha, N abajo-izquierda), los tres puntos sensibles con 44 px de lado, el toque eligiendo el tipo, los **tres tipos que no se dibujan inventados** y el botón de PDF |
| **(G)** | la morfología pasando a «Bicúspide», el caso **inverso** conservando el tipo con su aviso, el **control** de que una morfología elegida a mano no se pisa, y que el aviso **no** llega al informe |
| **(H)** | **una sola** descripción con el fenotipo, el rafe y los senos en plural; todo en español; la **raíz una sola vez**; sin «resolver la discrepancia» y sin el recordatorio; el EN SUMA corto; los **tres estilos**; el fenotipo aortopático en la frase de la aorta; y el **control** con «Trivalva normal» |
| **(I)** | la tabla del PDF con las **mismas palabras** del informe, el dibujo rasterizado desde la **misma** geometría, y el **control**: con la sección vacía no hay tabla ni dibujo |
| **(J)** | el recordatorio de la coartación en pantalla, **sin porcentaje**, con un id que no termina en `-aviso` y que «Nuevo estudio» no lo vacía |
| **(K)** | las seis casillas **no** son campos del estudio, y el Excel sigue en **440** columnas sin ellas ni el botón de PDF |
| **(L0)** | el **denominador del propio caso**: al menos 63 condiciones, para que borrar medio cuerpo no quede en verde |

### Dos trampas que este caso pagó

1. **`VINFO`, `_noEsDelEstudio`, `_labExcelRow` y `toggleEteSeccion` son `const`/función de
   MÓDULO**: `window[n]` da `undefined` y el identificador **pelado** sí se ve. Puso cuatro
   condiciones en rojo sobre un árbol perfecto. Es la trampa de `ECO_AYUDA`, pagada otra vez.
2. **LA CÁMARA DEL DIBUJO SE ANIMA**, y las letras colgaban de la cámara **en pantalla**: contar
   justo después del clic las encuentra todavía en la vista del cirujano, así que la condición
   **pasaba también contra el árbol viejo** —un falso plausible que cazó correr el caso contra el
   inicio de la tanda, no la lectura—. Se lleva la cámara al **destino** y se repinta antes de
   contar, y la misma corrección entró en **TC-503**, cuyo (E4b) tenía el mismo agujero.
3. **Los seis rótulos los CREA `eteQxConstruir`** la primera vez que alguien dibuja: sin una
   llamada explícita a `eteQxDibujar()` no existen todavía y la lectura informa «no hay rótulos»
   sobre un dibujo perfecto. Pasó una vez, en una corrida que la anterior había dado en verde.

## TC-505 — tanda «Y3e» (2026-10-20)

Cubre los **tres** commits: el espejo de la FEVI y el DSFVI del TEER colgado del **dueño**, el
giro de 90° antihorario de la **vista transgástrica** y las tres categorías de simetría de las
**cúspides** de la VAB con su dibujo por ángulo.

**46 condiciones**, con **tres denominadores** y **ocho controles negativos**.
**Verificado que sabe fallar contra el inicio de la tanda (`13a6b23`) en un worktree aparte: 22
de las 46 en rojo, y NINGUNA por excepción.** Las 24 que pasan son lo que esta tanda **no**
mueve: los tres denominadores, A1 (tipear ya funcionaba desde el Y3d3), A7 (borrar el origen ya
vaciaba), A8 (el valor manual no se pisa), A9 (los cuatro bordes COAPT), A10 (el rótulo DSFVI,
que es del Y3d), B2 y B7 a B11 (la vista del cirujano, la ETT, las letras y el PDF), **C6** (sin
categoría el dibujo ya daba 120°, que es el punto de ese control), C8, C9, C15 y los seis de (D).

### Qué afirma, por bloque

| bloque | qué fija |
|---|---|
| **(A1-A10)** TEER | los **seis caminos** de la FEVI y el DSFVI: tipear, el valor escrito por programa más `calcVI`, el cambio de «FEVI método», `RECALC_MODULOS`, borrar el origen y el valor manual. Más: que la sincronía esté **en la lista** de `RECALC_MODULOS` y no de rebote, que el dueño sea `calcVI`, los **cuatro bordes** de los cortes COAPT y el rótulo «DSFVI» |
| **(B1-B11)** transgástrica | `rot: 270` sin espejo; las **cuatro afirmaciones de la guía** medidas sobre el lienzo renderizado (anterior a la izquierda por la marca Ao, PM arriba, AL abajo, los tres festones A a la izquierda y los tres P a la derecha); las seis letras visibles; el botón marcado; y los **tres controles**: la vista del cirujano, la ETT y el data URL del PDF, que es el mismo con la cámara girada |
| **(C1-C16)** VAB | el selector con **tres** categorías en orden; «cúspides» en el rótulo, en la tabla del informe y en la fila del PDF; los tres ángulos del pie de la Figura 9; el **ángulo medido en el `d` renderizado** de la V de cierre en los tres tipos de fusión; el informe en los **tres estilos**; el Excel en 440 con su encabezado intacto; la reimportación; los estudios guardados con las dos opciones viejas; y la tarjeta ⓘ |
| **(D1-D6)** controles | `vabConclusion` no lee la simetría; el veredicto no cambia con la categoría; 440 columnas con el formulario vacío; el informe y el EN SUMA sin una palabra del dibujo; **cero claves nuevas** en el navegador; y la línea del plano intacta |

### Los tres controles negativos que más valen

- **(C6)** sin categoría elegida el dibujo conserva los **120°** de la geometría aprobada. Es lo
  único que separa «el ángulo sigue a la categoría» de «el ángulo cambió para todos».
- **(C7)** la categoría **no toca** el dibujo del 2-sinus: las cuatro opciones dan el **mismo
  `d`**. Es de la fuente —el pie de la Figura 9 la acota a los tipos fusionados— y sin este
  control el caso no distinguiría «se aplicó donde corresponde» de «se aplicó en todos lados».
- **(A8)** un valor tipeado a mano en el TEER **no se pisa** al cargar el origen. Sin él, el
  bloque (A) pasaría igual con un espejo que copia siempre, que es lo que el médico no quiere.

### Trampas que este caso pagó

1. **LA CÁMARA DEL DIBUJO SE ANIMA Y EL CUERPO DE UN CASO CORRE SINCRÓNICO.** La primera versión
   llamaba a `eteQxVista('tg')` y leía las marcas: las cuatro salieron en la posición del
   **cirujano**, o sea el caso informaba «el giro no ocurre» sobre un giro perfecto. Se planta la
   cámara en el destino (`_qxRot` / `_qxFlip`) y se repinta, que es el patrón de TC-504 (E4b).
   ⚠️ **Y `qxGirarA` sola no alcanza**: fija el destino del ángulo y **no** el flip, así que la
   ETT se seguía midiendo sin espejo.
2. **`__t.reg` NO EXISTE en el runner.** TC-504 lo contempla con un ternario y por eso no se nota.
   Las tres condiciones del Excel informaron `SIN FN` —que se lee igual que «la columna no
   existe»— hasta armar el registro a mano (`{ id, fecha, campos }`), que es la forma que
   `_labExcelRow` consume.
3. **EL ACENTO GRAVE, tres veces en esta tanda.** Dos dentro del cuerpo de este caso y una en el
   de TC-504, las tres para nombrar una función en prosa. `scripts/check_backticks.py` dio la
   línea exacta las tres **antes** de commitear, que es para lo que está.

### Casos adaptados por esta tanda: CINCO

**TC-504** (C2) —medía el literal del `oninput` y hoy mide que los dos campos llamen al dueño y
que el dueño sincronice, que es más fuerte—, **TC-503** (E3) —`VST.tg.rot` de 180 a 270—,
**TC-115** y **TC-504** (H1, H6 e I1) —la palabra «senos»— y el **título** de TC-366.

---

## TC-506 — tanda «Y3f» (2026-10-20)

Cubre los **ocho** commits de código: la FEVI y el DSFVI como un solo valor **en los dos
sentidos**, el intercambio de las columnas 2 y 3 del **Doppler mitral**, la sección VAB **en
vivo** con la función valvular **derivada** de Válvulas, la conclusión **esquemática** con su
texto mudado a **Evidencia**, el informe sin el párrafo de la VAB con el derrame y las masas en
**una** oración, los nombres **en español** con el Excel intacto, los **seis** dibujos con el
látero-lateral corregido y el **arco** del ángulo, y la **animación** de la apertura.

**83 condiciones**, con **cinco denominadores** y **ocho controles negativos**.
**Verificado que sabe fallar contra el inicio de la tanda (`4c1bb58`) en un worktree aparte:
49 de las 83 en rojo, y NINGUNA por excepción.** Las 34 que pasan son lo que esta tanda **no**
mueve: los cinco denominadores, los cinco controles de **(I)**, la IDA de la FEVI y el DSFVI
—que el Y3e1 ya había dejado colgada del dueño—, los cuatro bordes COAPT, las ocho reglas de
posición del Doppler y el espejo del LARS, los dibujos de los tres tipos **fusionados** con su
ángulo, y `vabConclusion` con sus umbrales.

### Qué afirma, por bloque

| bloque | qué fija |
|---|---|
| **(A1-A9b)** FEVI y DSFVI | la **IDA** y la **VUELTA**, los dos criterios COAPT evaluándose con ese valor, el VSFVI automático siguiéndolo, el **borrado por los dos lados**, la pasada inversa de `imEspejosRestaurar` con su borrado posterior y los **cuatro bordes** de los cortes COAPT (20 / 50 / 70 / 71) |
| **(B1-B7)** Doppler mitral | el orden del **MARCADO** —que es el que recorre el Tab— columna por columna; cada campo en su casilla nueva; **cero `tabindex` positivos**; los 14 campos tipeables conservando su valor por su id; el cuadro de abajo calculando con ellos; el LARS espejado; y las **ocho** reglas de posición explícita todavía en la hoja |
| **(C1-C12)** VAB en vivo | los dos campos de la aorta y los dos grados refrescándose desde **otras pestañas**, el de IAo por el camino del **CÁLCULO** y no del gesto; el borrado devolviendo a vacío; `vab_funcion` como **oculto** y ni un `<select>` de función en la sección; la función **derivada** en sus cinco estados; y el Excel en **440** con la celda derivada del estudio archivado |
| **(D1-D7)** conclusión esquemática | las cuatro líneas y lo que cada una nombra; que el resumen **no** nombre una guía, un umbral ni una conducta; la tarjeta nueva del panel de Evidencia con su texto completo y su **corchete**; que esté registrada en `IND_SECS`; y el control de la sección vacía |
| **(E1-E6)** informe y EN SUMA | el párrafo de la VAB **retirado**; el EN SUMA sin el encabezado de congénitas; la línea corta y la coletilla «, normofuncionante» por sus dos lados; el derrame y las masas en **UNA** oración en los tres estilos; y que con hallazgo cada uno conserve su frase |
| **(F1-F8)** español y Excel | ninguna etiqueta visible con «fused type», ni en el selector ni en `VAB_TIPO_TXT`; la del **Excel conservada en inglés** en otra tabla; las siete celdas publicando el texto de antes; el importador entendiendo las **dos** formas; la hoja de CC retirada para la VAB; y el **control** de otra cardiopatía congénita que la sigue imprimiendo |
| **(G1-G10)** los dibujos | el látero-lateral cerrando **vertical** y el antero-posterior **horizontal**; la «Y» de la fusión parcial; «no clasificable» **sin** dibujo; los seis tipos en `VAB_DIB_FUSION`; el arco y su frase por los dos lados de la categoría y en un tipo sin fusión; el ángulo saliendo de `VAB_SIM_ANG`; y el `aria-label` nombrando tipo y categoría |
| **(H1-H9)** animación | apagada no se ve y su bloque tampoco; **en reposo el lumen es EL cierre estático, byte por byte**; al abrir deja de serlo; el rafe calcificado abre menos; el scrub **pausa**; el botón alterna; «Nuevo estudio» la apaga; **nada** en el navegador; y la tarjeta declarando que no es una medición |
| **(I1-I5)** controles | 440 columnas con el formulario vacío; el dibujo de la mitral en ETE y su tabla intactos; `vabConclusion` **sigue siendo el dueño** de los umbrales; esos umbrales **no se movieron** (una raíz de 56 mm sigue dando su Clase I); y la tabla de cirugía aórtica de Referencias intacta |

### Los controles negativos que más valen

- **(H2)** **en reposo el lumen de la animación es el `d` del cierre estático, comparado byte por
  byte.** Es lo único que separa «la animación arranca de donde está el dibujo» de «hay dos
  dibujos del mismo órgano que se van a separar en la primera edición» — el defecto que el
  `eteQxDataURL` del Y3c6 ya pagó con los seis paths escritos a mano.
- **(F8)** **otra cardiopatía congénita SIGUE imprimiendo su hoja del PDF.** Sin él, «la hoja se
  retiró para la VAB» pasaría igual si la hoja se hubiera retirado para **todas**, que es un
  informe firmado con información de menos.
- **(C9)** **la ESCLEROSIS aórtica no es estenosis y tampoco es «sin lesión»**: ahí la función no
  se afirma. Es el borde que distingue derivar de adivinar.
- **(I3) e (I4)** `vabConclusion` **no se tocó**: sigue siendo el dueño de los umbrales y una raíz
  de 56 mm sigue dando su Clase I. Son las dos condiciones que prueban que mudar un texto de
  lugar no movió la regla que lo produce.
- **(B3)** **cero `tabindex` positivos.** El orden del Tab tiene que salir del orden del
  documento, porque un `tabindex` es una segunda lista que se desincroniza con el marcado en la
  primera edición.

### Trampas que este caso pagó

1. **EL ACENTO GRAVE, TRES VECES** —``tabindex``, ``no_clasif`` y ``VAB_TIPO_TXT``/``vabConclusion``—,
   las tres para nombrar algo en prosa, que es como el resto del archivo lo escribe.
   `scripts/check_backticks.py` dio la línea exacta las tres mientras `node --check` apuntaba a la
   apertura del template, cientos de líneas antes. **Correr los dos.**
2. **LA FRASE DE LA ANIMACIÓN ESTABA EN EL BLOQUE `ojo` DE LA TARJETA Y NO EN `lee`**, así que
   (H9) salía roja sobre una tarjeta que sí la publica. Hoy lee el **objeto completo** de la
   entrada de `VINFO`, no uno de sus campos.
3. **`masa_presente` ES UN `<select>` Y NO UN CHECKBOX**, y sus valores son el **TEXTO** de la
   opción. Tratarlo como casilla dejaba la escena de las masas sin montar y (E5) y (E6) medían un
   informe que no tenía masas por ninguna vía.
4. **LA LÍNEA DE LA MASA NO MATCHEABA EL FILTRO**: dice «intracardíaca», con tilde, y el filtro
   buscaba otra palabra. Es el mismo falso que el `uricula` de TC-487: **el filtro era del lector**
   y el informe estaba perfecto.
5. **EL FOP NO SE MONTA CON `fop_presente`** —ese campo no existe—: la puerta es `fop_tunel` más
   `fopSync()` y `fopConclusion()`.

---

## TC-507 — la tanda «R»: ocho zonas, 81 condiciones

Cubre los ocho commits funcionales de la tanda R (2026-10-20). Diez bloques, uno por zona, con
**cinco denominadores** y **ocho controles negativos**.

| bloque | qué fija |
|---|---|
| **DENOM0** | las funciones y constantes nuevas EXISTEN: sin esto, lo de abajo mide `undefined` |
| **A1-A7** | R1 · la lesión presente sin grado por sus cinco compuertas, y las dos ramas del resumen |
| **B1-B5** | R1 · los dos rótulos en las seis superficies, con el **CONTROL del Excel**, que no cambia |
| **C1-C9** | R2 · los tres cortes del TEER por sus dos lados, y el pie con sus tres fuentes |
| **D1-D8** | R3 · `vdDisfGrado` por sus bandas, **los dos bordes que solapan** y el `null` del normal |
| **E1-E9** | R4 · los cuatro grados del área, el volumen que sigue mandando y el EN SUMA |
| **F1-F8** | R5 · los tres grados del derrame, las dos `<option hidden>` y la lista del importador |
| **G1-G8** | R6 · el módulo que no concluye, los signos listados y los cuatro consumidores |
| **H1-H6** | R7 · `TEP_VDVI_DILAT_MIN` y sus cuatro consumidores, por el borde `1,0` |
| **I1-I8** | R8 · el DOI, las tres citas, los tres chips y `QV_NOTA` como función |
| **J1-J5** | los controles transversales: Excel en 440, campos del estudio, almacenamiento |

**Verificado que sabe fallar contra el inicio de la tanda en un worktree aparte: 57 de las 81
en rojo, y NINGUNA por excepción.** Las 24 que pasan son los denominadores de lo que ya existía
y los controles negativos, o sea lo que esta tanda no mueve.

⚠️ **LA MARCA `EXC` QUE APARECE EN (E1) CONTRA HEAD ES EL CENTINELA, NO UNA EXCEPCIÓN**: `_aiG`
devuelve la cadena `'EXC …'` desde su `catch` cuando `aiAreaClasificar` no existe. Sin ese
centinela el caso moría entero y probaba que el árbol es distinto, no que sabe medir.

### Trampas de este caso

1. **UN `<b>` CON UN SALTO DE LÍNEA ADENTRO PARTE EL `textContent`**: la condición (I3) buscaba
   la frase entera de la cita y salía roja sobre un texto perfecto. Se buscan fragmentos.
2. **`_labExcelCols` NO EXISTE**: las columnas salen de
   `Object.keys(_labExcelRow({ id: 0, campos: {} }))`.
3. **EL `value` DEL SELECTOR DE PERICARDIO ES SU TEXTO COMPLETO**, paréntesis incluido:
   `'Derrame moderado'` deja el `<select>` en `selectedIndex -1` y la escena mide el selector
   vacío.

---

## TC-509 — el trabajo «B», la reorganización de pestañas (2026-10-21)

**36 condiciones**, con **cuatro denominadores** y **ocho controles negativos**. Es un trabajo que
sólo mueve pantallas, así que la mitad del caso son controles: lo que **no** se tiene que haber
movido.

**Verificado que sabe fallar contra el inicio de la tanda (`a37ddc5`) en un worktree aparte: 20 de
las 36 en rojo, y NINGUNA por excepción.** Las 16 que pasan son los controles y lo que esta tanda
no toca — que es exactamente el punto.

### Qué cubre, bloque por bloque

| bloque | qué afirma |
|---|---|
| **(A1)** | la columna izquierda tiene **12** botones, en el orden pedido |
| **(A1b)** | el **drawer móvil** ofrece los doce, y en Modo Básico esconde el pulmonar (11) y lo devuelve al volver |
| **(A2)** | la fila de arriba tiene **6**: Hemodinámica, ETE, Cardio-Oncología, Amiloidosis, C. Congénitas, Referencias |
| **(A3)** | CONTROL: **Amiloidosis** sigue en `.tabs-special`, con su `data-mod`, y abre `#tab-amiloidosis` |
| **(A4)** | el rail tiene `overflow-y:auto`, así que doce botones no tapan un campo |
| **(A5)** | cada botón del rail abre SU panel: ninguno cruzado |
| **(B1)** | los **once** campos de pericardio y masas, en `#tab-pericardio`, con caja |
| **(B2)** | CONTROL: el desplegable del pericardio conserva sus **cinco** opciones del R2 |
| **(C1)** | Otros con **dos** sub-pestañas, y el panel inactivo en 0×0 |
| **(C2)** | los **ocho** de variantes en su panel y el test de burbuja en el suyo |
| **(C3)** | el **ASIA** es un solo dato en los **dos** sentidos, con un clic y un `change` |
| **(C4)** | la frase «Estructuras normales prominentes…» se conserva |
| **(D1)** | **una sola puerta** al eco pulmonar, en el rail, y los ocho campos básicos ahí |
| **(D2)** | «Integrar al informe» **dentro** de la pestaña |
| **(D3)** | Otros ya no tiene nada pulmonar |
| **(D4)** | el texto del **básico** va justo **después** del pericardio y las masas |
| **(D5)** | nombra la **fórmula** de Balik y el apellido pelado ya no está |
| **(D6)** | y **conserva** el tamaño y el lado |
| **(D7)** | CONTROL NEGATIVO: un Balik implausible no estima volumen, lo dice, y no imprime «4000» |
| **(D8)** | el texto del **avanzado** va al **cuerpo** del informe, tras pericardio y masas, con su «Patrón global» |
| **(D9)** | y el módulo **sigue integrado** mientras su contenido vive en el informe — las dos mitades |
| **(E1)** | el Fonocardiograma no está: ni pestaña, ni botón, ni canvas, ni `data-mod`, ni `EE_MODULES` |
| **(E2)** | pero el prefijo `fcg-` **se conserva** en la exclusión de campos |
| **(F1)** | Calculadoras es el **primer** botón de Referencias, con su `data-mod`, y su contenido ahí |
| **(F2)** | y no quedó ninguno en la fila de arriba |
| **(F3)** | **seis** subpestañas y el censo de entradas de Referencias en **30**, sin moverse |
| **(G1)** | **un** botón «C. Congénitas» y las dos pestañas con su barra |
| **(G2)** | la barra navega y se marca bien, **también llegando por `showTab` directo** |
| **(G3)** | CONTROL: ninguna sección de congénitas se perdió (10 y 9) |
| **(H1)** | los campos movidos **viajan**, se **vacían** con «Nuevo estudio» y **vuelven** al restaurar |
| **(H2)** | el importador sigue aceptando las listas de la zona movida: ninguna fila se descarta |
| **(I1)** | sin scroll horizontal en las seis pantallas movidas, al ancho de la corrida |
| **(J1)** | CONTROL: el Excel en **440** columnas |
| **(J2)** | CONTROL: los ocho grados y la función diastólica, en una escena cargada |
| **(J3)** | CONTROL: el Laboratorio sigue respondiendo |
| **(J4)** | DENOMINADOR: hay algo que auditar en las tres superficies |

### Qué NO mide, y dónde se mide

- **El color** de los botones activos en los dos temas y la **maqueta a cinco anchos**: los mide
  `scripts/_probe_btabs.mjs`, que puede emular el viewport y esperar la transición. El cuerpo de
  un caso no puede cambiar el ancho de la ventana, y leer el color en el mismo turno del clic da
  un valor **intermedio** de la animación de `.tab-btn` (`transition: all .15s`).
- **El PDF generado de verdad** en sus seis plantillas: grupo `pdf` de esa misma sonda.
- **La geometría del rail**: la suite corre a **756 px** y ahí el rail está en `display:none` por
  una media query preexistente. El caso mide el **orden** —que no depende del ancho— y el
  **drawer**, que es la puerta real a ese ancho.

### Dos valores que escribí sin medir, y que el propio caso cazó

1. La condición (A1) exigía que los doce botones tuvieran **geometría**, y a 756 px no la tienen.
2. La cadena de grados de (J2) la escribí de memoria (`'4||||sin|sin||'`) y la medida es
   `'4|0|0|sin|sin|sin|Sin insuficiencia|sin'`. **Un valor esperado inventado es exactamente lo
   que una condición de control existe para cazar** — y lo cazó. La cadena que quedó es la medida,
   y es la misma que el inicio de la tanda publica sobre esa escena, verificado con el A/B.
