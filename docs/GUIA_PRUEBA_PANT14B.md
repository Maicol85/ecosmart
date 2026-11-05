# Guía de prueba manual — PANT-14b (2026-11-05)

Un dato por línea, con el nombre exacto de cada pestaña, sección y botón, el ancho de ventana y qué
tiene que verse. **Veintidós pasos.**

Antes de empezar: ventana a **1440 px** de ancho, tema **oscuro**, Modo **Avanzado** en Config.

| # | qué hacer | qué tiene que verse |
|---|---|---|
| 1 | Abrir la app. Ir a **C. Congénitas** → sub-pestaña **CC complejas** → sección **Anomalía de Ebstein**. Poner «Desplazamiento de la valva septal» en **16**. | nada en particular todavía |
| 2 | Ir a **C. Congénitas** → sub-pestaña **CC frecuentes** y bajar al pie. Tocar **🫀 Ver en 3D**. | el panel abre con el **Ebstein** dibujado, y la línea de abajo dice «Todas las lesiones cargadas están dibujadas» |
| 3 | Tocar **Cerrar** del panel. Tocar **Nuevo estudio** (arriba) y después **Continuar sin guardar**. | la app va a la pantalla **Paciente**, y **el botón «Ver en 3D» NO está ahí** — ni el panel |
| 4 | Ir a **C. Congénitas** → **CC complejas** → sección **CIA / CIV**. Elegir «Tipo de CIA» = **Ostium secundum**. | el **botón CIA** de esa sección se pinta **verde entero**, solo. Eso es «un dato, una sola puerta» |
| 5 | Bajar a **Informe** y mirar el cuerpo. | el informe dice **«CIA tipo ostium secundum.»** sin que hayas tocado el botón |
| 6 | Volver a **CIA / CIV** y tocar el **botón CIA** para apagarlo. Volver al **Informe**. | la CIA **sale** del informe: el apagado a mano se respeta |
| 7 | Volver a **CIA / CIV** y tocar el **botón CIA** otra vez. | vuelve a entrar al informe |
| 8 | Ir a **CC frecuentes**, pie, **🫀 Ver en 3D**. | el dibujo muestra la **CIA** y **no** el Ebstein del paso 1 |
| 9 | Con el panel abierto, ir a **CC complejas** → sección **Transposición de grandes arterias**. | **no hay un recuadro «Diagrama 3D»** en esa sección: en su lugar hay un botón **🫀 Ver en 3D** |
| 10 | Elegir «Tipo» = **Switch auricular (Mustard o Senning)**. Tocar **🫀 Ver en 3D**. | el panel del corazón maestro abre con la **transposición** dibujada |
| 11 | Mirar el dibujo 3D. | los **dos caminos del túnel** se ven en **violeta**, con los rótulos **«Túnel cavas»** y **«Túnel venas pulm.»**; las bolitas de sangre que corren por dentro siguen **azules y rojas** |
| 12 | Mirar la leyenda debajo del dibujo. | aparece la entrada **«túnel quirúrgico»** en violeta |
| 13 | En la misma sección, poner «Obstrucción subaórtica» = **Sí**. Volver al panel y **destildar «Ver por dentro»**. | se ve un **anillo gris** justo por debajo del nacimiento de la aorta, con su rótulo |
| 14 | Volver a **tildar «Ver por dentro»**. | el anillo se ve **menos** en la d-TGA y en el Jatene: está declarado en `docs/PENDIENTES.md` → P14b-i |
| 15 | En el panel, mirar el botón **«Incluir en el PDF»**. | está **activo** (no gris), **con una transposición cargada**. Ese era el «no me deja incluir» |
| 16 | Tocarlo. | dice **«✓ Incluido en el PDF»** y el aviso de abajo dice que el PDF llevará el dibujo, y que con el esquema abierto llevará también el esquema |
| 17 | Generar el **PDF** con el botón **PDF** del encabezado, y **Confirmar** la tarjeta de severidades. Buscar la hoja **«Diagramas del estudio»**. | **UN solo dibujo** del corazón, de unos 7 cm. **No** hay un segundo dibujo igual debajo de «Imágenes del estudio» |
| 18 | Volver al panel y tocar el botón del **esquema de circulación** (el **◫** al lado del dibujo). Volver a generar el PDF. | ahora la hoja lleva **dos** imágenes: el corazón y **el esquema al lado**, con sus colores |
| 19 | Mirar el esquema en pantalla. | las cajas se **distinguen del fondo** (no son del mismo color que la página), la caja del **Túnel** tiene borde **violeta** y los dos tramos del túnel llevan un trazo violeta debajo de la flecha |
| 20 | Tocar el **ⓘ** al lado del título «Esquema de circulación». | abre la tarjeta que explica el esquema y dice que es ilustrativo y que no es una imagen del estudio |
| 21 | Ir a **Válvulas**. | **el botón «Ver en 3D» no se ve** en esa pestaña |
| 22 | Ir a **Config**, destildar el módulo **C. Congénitas** y volver a **Válvulas**. | ni el botón ni el panel se ven en ninguna pestaña, y el módulo 3D **no se carga** |

**Lo que NO tiene que pasar en ningún paso:** que el dibujo muestre una lesión que no cargaste; que
la línea de abajo diga «Sin lesiones cargadas» con algo dibujado; que el PDF traiga el mismo dibujo
dos veces; ni que el botón «Ver en 3D» aparezca fuera de C. Congénitas.

---

**Nota al cierre (barrido de mutaciones).** El paso que mide «Nuevo estudio» con el panel abierto
es el que más cuesta a mano y el que más valió: el panel **se cierra por dos puertas** —la de
`limpiarCampos`, que ya existía, y la del pintor del pie al salir de congénitas— y lo que **sólo**
esta tanda repone es el **modo**. Si al volver a abrir el módulo aparece «Explorar» en vez de
«Según el estudio», eso es el defecto, aunque el panel se haya cerrado bien.
