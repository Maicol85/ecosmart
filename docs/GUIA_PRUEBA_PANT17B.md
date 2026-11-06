# Guía de prueba manual — tanda PANT-17b

Un dato por línea. Ventana de escritorio a **1440 px** salvo donde diga otra cosa.

| # | Qué hacer | Qué tiene que verse |
|---|---|---|
| 1 | Abrir `index.html` en Chrome y mirar el pie de la página | El sello dice **v20261106-0912** |
| 2 | Pestaña **🧬 C. Congénitas**, botón **«Ver el corazón en 3D»** | El recuadro dibuja el corazón y la línea de abajo lo describe |
| 3 | En el recuadro, elegir el modo **«Explorar»** y la base **«Transposición de grandes arterias»** | El dibujo cambia a la transposición |
| 4 | Tocar (clic corto, sin arrastrar) una **cavidad grande** del dibujo | La cavidad pierde el color y queda **sólo su contorno fino**: se ve lo que hay detrás, sin rejilla |
| 5 | Tocar la **misma** cavidad otra vez | Recupera su color |
| 6 | Tocar una cavidad y después un **vaso**, y arrastrar para girar | Las dos quedan sin color, el dibujo gira y el arrastre **no apaga** nada |
| 7 | Cambiar la anatomía de base | Lo apagado se borra: todo vuelve con su color |
| 8 | Pasar el tema a **claro** (el conmutador de la cabecera) y repetir el paso 4 | El contorno se ve igual de fino; el centro sigue dejando ver lo de atrás |
| 9 | Pestaña **Paciente**, cargar un **ductus**: tipo «No restrictivo» y diámetro 4 mm | — |
| 10 | Abrir el panel **Evidencia** | La sección «Ductus arterioso permeable» abre |
| 11 | Mirar el **encabezado** de esa sección, a la derecha | Una línea corta: **«0 Sí · 0 No · 13 sin dato»**, en **UNA** sola línea, junto al botón «⇔ columnas» |
| 12 | Mirar **arriba** de las preguntas | Un recuadro **«Con lo contestado»** que dice que ninguna respuesta lo sostiene todavía y lista **«Falta contestar: …»** |
| 13 | Contestar **Sí** a la primera pregunta | La oración de su recomendación aparece en el recuadro, con su **clase**, su **nivel** y su **folio** |
| 14 | Cambiar esa respuesta a **No** | La oración desaparece del recuadro |
| 15 | Cambiar esa respuesta a **?** | El recuadro vuelve a decir que ninguna respuesta lo sostiene |
| 16 | Buscar al pie de la sección **«ⓘ Ver detalle de la guía»** y abrirlo | Adentro están los bloques de siempre: Diagnóstico, Indicación, Seguimiento y las diferencias entre guías, **palabra por palabra** |
| 17 | Buscar en toda la sección el párrafo «Condiciones presentes en este paciente» | **No está** |
| 18 | Buscar la lista «Recomendaciones que aplican con lo contestado» | **No está**: su contenido es ahora el recuadro de arriba |
| 19 | Cargar una **CIA** (tipo ostium secundum, 18 mm) y abrir su sección de Evidencia, con el «Ver detalle de la guía» abierto | Entre las recomendaciones está la **2**: evaluación del riesgo con **especialistas en hipertensión pulmonar**, Clase 1 · Nivel B-NR, folio **e149** |
| 20 | Cargar una **CIV** perimembranosa y mirar su «Ver detalle de la guía» | Está la **3**: seguimiento por especialistas en congénitas del adulto y en hipertensión pulmonar, Clase 1 · Nivel C-LD, folio **e153** |
| 21 | Cargar un **defecto del septo auriculoventricular** completo y contar sus preguntas | **Catorce**, y una es «Hipertensión arterial pulmonar, reparado o no» |
| 22 | Cargar una **conexión venosa pulmonar anómala parcial** (1 vena) y contar sus preguntas | **Diez**, y la última es «Ventrículo derecho normal o apenas agrandado, con Qp:Qs por debajo de 1,5» |
| 23 | Contestar **Sí** a esa última | Entra al recuadro rotulada **«No recomendado»**, con su Clase 3 y su folio **e159** |
| 24 | Cargar un **Fontan** (conexión cavopulmonar total extracardíaca) y abrir su «Ver detalle de la guía» | Están las recomendaciones **3, 7, 14 y 16**, con folio **e201** |
| 25 | Achicar la ventana a **1000**, **768** y **390 px** y repetir los pasos 11 y 12 | La línea del conteo sigue en **una** línea y el recuadro sigue arriba |
| 26 | Generar el **informe** y el **PDF** con todo esto cargado | Ni una palabra de la Evidencia: el papel sale **igual que antes** |
