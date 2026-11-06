# Guía de prueba manual — PANT-14c (2026-11-05/06)

Un dato por línea, con el nombre exacto de cada pestaña, sección y botón, el ancho de ventana y qué
tiene que verse. **Veintidós pasos.**

Antes de empezar: ventana a **1440 px** de ancho, tema **oscuro**, Modo **Avanzado** en Config.

| # | qué hacer | qué tiene que verse |
|---|---|---|
| 1 | Abrir la app. Ir a **C. Congénitas** → **CC complejas** → sección **Transposición de grandes arterias**. | **no hay** un botón «🫀 Ver en 3D» dentro de esa sección, y los campos están en **columnas con encabezados en azul**: «Tipo y cirugía», «Ventrículo sistémico», «Obstrucción y CIV residual» y «Clínica» |
| 2 | Elegir «Tipo» = **TGA completa (d-TGA)** y «Cirugía realizada» = **Mustard o Senning (switch auricular)**. | la fila de la cirugía aparece dentro de su grupo, y **no queda ningún hueco** entre los grupos |
| 3 | Elegir «Tipo» = **ccTGA — congénitamente corregida**. | el grupo «Tipo y cirugía» **se queda con un solo campo** y ningún grupo vacío ocupa una columna |
| 4 | Volver a **d-TGA** + **Mustard o Senning**. Mirar el pie de la sección. | la **Conclusión** va **debajo** de los grupos y **a todo el ancho** |
| 5 | Ir a **CC frecuentes** y bajar al pie. Tocar **🫀 Ver en 3D**. | el panel del corazón maestro abre con la **transposición** dibujada |
| 6 | Mirar la **esquina superior izquierda** del dibujo. | un título corto: **«TGA Mus/Sen»**. No tapa el corazón y no gira al arrastrar |
| 7 | Mirar el dibujo. | los **dos caminos del túnel** se ven en **dos violetas distintos** —uno más oscuro que el otro—, con los rótulos **«Túnel cavas»** y **«Túnel venas pulm.» SIN superponerse** |
| 8 | Mirar la leyenda debajo del dibujo. | hay **dos** entradas de túnel: «túnel quirúrgico» (oscuro) y «segundo túnel o conducto» (claro). **No** está la entrada vieja «CIV, parches y suturas» |
| 9 | Volver a **CC complejas** → **Transposición** y elegir «Cirugía realizada» = **Rastelli**. Volver al panel. | el **túnel** y el **conducto** se ven en los mismos **dos violetas**, con sus rótulos «Túnel VI-aorta» y «Conducto VD-AP» |
| 10 | En la misma sección poner «Obstrucción subaórtica» = **Sí**. Volver al panel y **destildar «Ver por dentro»**. | el anillo gris se ve **acostado**, transversal al eje de la aorta, **por debajo** del anillo aórtico |
| 11 | Elegir «Cirugía realizada» = **Jatene (switch arterial)**. Volver al panel. | las dos líneas de sutura **ya no son anillos**: son **bandas con trama de malla** alrededor de los vasos, y no se confunden con el anillo gris de la obstrucción |
| 12 | Mirar la leyenda. | aparecen **«sutura»** (naranja con trama) y **«coronarias reimplantadas»** (un punto naranja), y **no** «parche» |
| 13 | Tocar **Explorar** en el panel. Elegir base **Tetralogía de Fallot**, variante **Operado**, y tildar **CIV residual**. | el **parche** de la CIV y la ampliación del tracto de salida se ven en **verde**, y la **CIV residual pasa por el borde del parche** —no como un anillo separado debajo— |
| 14 | Mirar el título del dibujo y la leyenda. | el título dice **«Fallot Operado»** y la leyenda tiene **«parche»** en verde |
| 15 | En **Explorar**, base **Corazón normal**, y en «Se suma» tildar **Cava superior izquierda persistente**. | la vena y el seno coronario dilatado se ven en **celeste**, claramente más claros que el azul de la sangre, y la leyenda trae **«cava izquierda persistente»** |
| 16 | Volver a **Según el estudio**. Mirar debajo del dibujo. | **no** está la frase «Todas las lesiones cargadas están dibujadas» ni la descripción del modo, y **tampoco** el texto fijo «Modelo en 3D esquemático…» |
| 17 | Tocar el **ⓘ** de la barra del panel. | la tarjeta trae **«Modelo en 3D esquemático, no a escala. Se rota arrastrando.»** |
| 18 | Con una **CIA** cargada en **CIA / CIV** y el panel abierto, tocar **«Incluir en el PDF»**. Generar el **PDF** con el botón **PDF** del encabezado y **Confirmar** la tarjeta de severidades. Buscar la hoja **«Diagramas del estudio»**. | el corazón sale **grande y sin achatarse** —ocupa el ancho de su bloque, no es un corazón chico en un lienzo blanco— y **debajo** hay un texto de **cuatro líneas**: el título, la lesión con su nombre completo, la circulación y la leyenda |
| 19 | Volver al panel y tocar el botón del **esquema de circulación** (el **◫** al lado del dibujo), **sin volver a tocar** «Incluir en el PDF». Generar el PDF otra vez. | la hoja lleva **dos** imágenes: el corazón y **el esquema al lado**. Ése era el «abrí el esquema y el PDF no lo trajo» |
| 20 | Ir a **Cirugía cardíaca (POP)** sin cargar ningún dato ahí. Tocar **«📄 Incluir el esquema en el PDF»**. Generar el PDF. | **no** aparece la hoja «Esquema del posoperatorio»: con la casilla encendida y sin datos no se emite |
| 21 | Cargar «Hora post-CEC» = **6** en el posoperatorio y generar el PDF otra vez. | ahora **sí** aparece la hoja del esquema. Después tocar **Nuevo estudio** → **Continuar sin guardar** y volver al posoperatorio: el botón está **apagado** |
| 22 | Ir a **C. Congénitas** → **CC complejas**, abrir tres secciones, ir a **Válvulas** y volver a **CC complejas**. | las tres secciones están **cerradas**. Lo que se abra sin cambiar de pestaña se queda abierto |

**Lo que NO tiene que pasar en ningún paso:** que el corazón del PDF salga achatado o chico; que el
PDF traiga el esquema del posoperatorio vacío; que dos rótulos del dibujo se pisen; que los dos
túneles se vean del mismo color; que una entrada de la leyenda aparezca sin que su cosa esté
dibujada; ni que la pestaña de transposición muestre un grupo vacío ocupando una columna.
