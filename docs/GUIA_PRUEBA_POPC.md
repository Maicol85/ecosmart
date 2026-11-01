# Guía de prueba manual — tanda POP-C (14 pasos)

Abrí `index.html` en Chrome con la ventana en **1440 px** de ancho, salvo donde se indique otra.

| # | qué hacer | qué tiene que verse |
|---|---|---|
| 1 | Pestaña **Hemodinámica** → abrí **PostCEC — Cirugía Cardíaca**. Cargá peso 70 y talla 170 en **Paciente**. Marcá **Válvulas operadas → Tricúspide**. | La fila de la tricúspide aparece con su selector de tipo vacío. |
| 2 | Pestaña **Válvulas** → tricúspide → morfología **Prótesis mecánica**. Volvé a **Hemodinámica**. | El selector del posoperatorio dice ahora **«Prótesis mecánica»**, sin tocarlo. |
| 3 | Volvé a **Válvulas** y poné la morfología tricuspídea en **Normal**. Volvé a **Hemodinámica**. | El selector del posoperatorio queda **vacío**. Antes seguía diciendo «Prótesis mecánica». |
| 4 | En el posoperatorio, elegí **Dispositivo de monitoreo → PiCCO** y escribí **IC 2.20**. | La conclusión dice **«IC 2.20 L/min/m² — normal»**. Con **2.19** dice «bajo». |
| 5 | Cambiá a **Swan-Ganz**, poné GC 4,5, PAM 78, PAD 10 y **PCP 22**. | La fila dice **«¿Presión capilar pulmonar?»** en **gris**, con «22 mmHg» y la salvedad. Ya no dice «adecuada», «en rango» ni «congestión». |
| 6 | Pestaña **Pericardio y masas** → derrame **severo**, colapso del VD **sí**, VCI 24 mm con colapso **<50 %**. Volvé al posoperatorio. | La fila **«¿Signos pericárdicos?»** enumera **«colapso diastólico del VD, plétora de VCI sin colapso»**, en amarillo. |
| 7 | Mirá la fila **«Patrón detectado»** y la de **«¿Falla del VD?»**. | La primera lleva la pastilla **«Criterio de EcoSmart»**; la segunda, **«cortes de la cápsula de TEP»**. |
| 8 | Borrá **peso** y **talla** en Paciente. Volvé al posoperatorio y mirá el botón **«Integrar al informe»**. | Queda **habilitado**. Al tocarlo, el EN SUMA gana su línea **«PostCEC…»** y el patrón dice «Datos insuficientes para clasificar». |
| 9 | Hacé **Nuevo estudio** y mirá el botón sin cargar nada. | Queda **deshabilitado**, y al pasar el mouse su globo dice **«Sin patrón que integrar: falta el gasto cardíaco…»**. |
| 10 | Cargá peso 70, talla 170, frecuencia 80, y en **Válvulas** poné insuficiencia **mitral severa** y **tricuspídea moderada**. Mirá el esquema del posoperatorio. | Dos **chorros** hacia las aurículas, el mitral más grande, que aparecen en **sístole** y desaparecen en diástole. Abajo, «Insuficiencias valvulares: mitral severa, tricúspide moderada». |
| 11 | Marcá **Válvulas operadas → Aórtica** con **Prótesis mecánica** y **Mitral** con **Prótesis biológica**. | Dos **círculos** con sus velos: la mecánica en el color del texto con trazos rectos, la biológica en **dorado** con dos curvas y dos puntos. Los velos **rotan** al latir. |
| 12 | Elegí **Swan-Ganz** y mirá el dibujo. | Una línea **violeta entrecortada** que entra por la cava, cruza la aurícula y el ventrículo derechos y sale por la pulmonar, con un **globo que se infla** cada pocos segundos y el rótulo «Swan-Ganz». |
| 13 | En la tarjeta del esquema, tocá **«📄 Incluir el esquema en el PDF»**, esperá dos segundos y exportá el PDF. | El PDF trae una hoja con el esquema y, debajo, **«Esquema ilustrativo: no es una imagen del estudio ni está a escala.»** Sin tocar el botón, el PDF sale igual que antes. |
| 14 | Pestaña **C. Congénitas → CC complejas → Aortopatía hereditaria**. Cargá edad 40, sexo masculino, peso 70, talla 170 y **Aorta sinusal 38 mm**. Abrí la tarjeta de criterios. | La fila **«Z calculado»** dice **+1.72**, con el método («edad, sexo y superficie corporal (DuBois)») y la salvedad de la técnica, y un botón **«Usar este valor»**. El informe **no** publica el Z. |
