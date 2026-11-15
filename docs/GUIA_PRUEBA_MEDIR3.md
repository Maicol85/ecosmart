# Guía de prueba a mano — MEDIR-3 (2026-11-14)

Catorce pasos. Abrí la app en Chrome, entrá a **Imágenes**, importá un cineloop DICOM del pendrive
y abrí el visor. Donde dice «medido», al lado está el número que la sonda de dos motores dio en los
ocho cruces (Chrome y WebKit × 1440×900 y 1280×800 × los dos temas).

> **Nada de esta tanda llega al papel.** No escribe un campo del informe, no toca el EN SUMA, el
> PDF, el PPT ni el Excel. Si al probar ves que algo de esto aparece en un informe, **frená y
> avisá**: es un defecto.

---

## 1 · El negro a los costados de la imagen (A1)

Abrí el visor con un cineloop. Mirá los **costados de la imagen**.

**Tiene que verse**: el negro pegado al borde de la imagen y nada más. Antes había una banda negra
de **228 px** —más de dos centímetros en pantalla— entre la imagen y el borde del panel.

**Medido**: 228 → **0 px** en los ocho cruces.

## 2 · La ventana es más ancha (A1)

Con la ventana del navegador maximizada en un monitor de 1440 px o más, mirá el ancho del cuadro
del visor.

**Tiene que verse**: el visor ocupando casi todo el ancho de la ventana. Antes se quedaba en
1180 px aunque la pantalla midiera 1440.

**Medido**: el tope pasó de 1180 a **1500 px**; a 1440 de ventana el visor mide **1412**.

⚠️ **Lo que NO cambió**: una imagen más chica que la caja **no se amplía**. Si abrís un cineloop de
600 px de ancho se sigue dibujando en 600, con el negro pegado. Es a propósito: ampliarla sería
inventar píxeles que el ecógrafo no midió. Si lo querés distinto, decilo —está anotado en
`docs/PENDIENTES.md` → **M3-c**.

## 3 · El selector queda quieto (A2)

Apretá **📏 Medir**. Elegí **2D → Distancia → VI** y cargá los seis valores del VI (con ✏️ si no
querés medir). Ahora **desplazá la columna de la derecha** con la rueda del mouse.

**Tiene que pasar**: la **tabla** se desplaza y el selector —las tres filas de «Modo», «Qué medir» y
«Estructura»— **se queda arriba, quieto**. El botón «2D / Doppler / M» tiene que estar siempre a la
vista.

## 4 · Una medida por fila (A3)

Andá a **Doppler / M → Velocidad → Aórtica** y cargá cuatro o cinco valores.

**Tiene que verse**: **una sola** tabla, con **una medida por fila**. Antes eran **dos tablas lado a
lado** y por eso los títulos y las filas se pisaban en Safari.

**Tiene que NO pasar**: que la tabla se desplace a lo ancho. Si tenés que arrastrar para ver la
columna de la derecha, **avisá**.

**Medido**: el desborde horizontal pasó de **179 px** (Chrome) y **181** (WebKit) a **cero**.

## 5 · El número grande y la unidad chica (A4)

Mirá una fila con valor.

**Tiene que verse**: el número **grande** y la unidad **chica, al lado del número** —no en una
columna aparte—. Las columnas son cuatro: Medida, Valor, Acciones y la de la comunidad.

**Medido**: valor en **17 px**, unidad en **9,5**, nombre en **10,5**.

## 6 · Los textos pasaron al globo ⓘ (A4)

Al pie de la tabla, al lado de «🗑️ Limpiar», hay un botón **ⓘ** chico. Apretalo.

**Tiene que verse**: un cartel con todas las advertencias y notas de método que antes estaban
impresas debajo de la tabla —qué le falta al Vol Eyectivo VD, qué incluye «Guardar tabla», la nota
del ✏️, los descargos y la leyenda de · A / · B—.

**Tiene que pasar**: que **Escape** cierre el cartel y **no** el visor. Probalo.

**Tiene que NO pasar**: que alguno de esos textos **falte**. Son nueve y ninguno se borró, sólo se
movieron. Si echás de menos alguno, **avisá**.

## 7 · El orden del VI (A5)

**2D → Distancia → VI**.

**Tiene que verse**, en este orden: **SIVd, DDVI, PPd, SIVs, DSVI, PPs** — o sea la diástole
completa y después la sístole.

## 8 · El Diam TSVI se mudó a Aorta (A5)

**2D → Distancia → Aorta**.

**Tiene que verse**: el **Diam TSVI** como última fila de la tabla de Aorta, y **ya no** en la del
VI.

**Y lo importante**: medilo o cargalo acá con ✏️, y después andá a **Doppler / M → Aórtica**. El
Diam TSVI tiene que aparecer **con el mismo valor** y la **AVA por continuidad** tiene que salir.
Es el mismo campo, sólo cambió en qué tabla se dibuja. Si el valor no cruza, **frená y avisá**.

## 9 · Los botones de la barra (B)

Mirá la barra de arriba del visor.

**Tiene que verse**: los **ocho** botones del **mismo tamaño**, a la **misma altura** y en la
**misma fila** (si la ventana es ancha). Antes «💾 Guardar» y «📸 Capturar + medición» eran más
altos y azules.

**Tiene que verse azul SÓLO «✕ Salir de medición»** —que es el modo prendido—. Apretalo: al pasar a
«📏 Medir» **no tiene que quedar ningún botón azul**.

**Medido**: los ocho en **44 px** de alto y **118** de ancho; un azul prendido y **cero** apagado.

## 10 · La calibración de velocidad, con dos valores (C)

Abrí un cineloop Doppler **que no traiga escala** (o apretá **«Calibrar vel.»** / **«Recalibrar
vel.»** con la herramienta Velocidad elegida).

**Tiene que decir**: «Calibrando la velocidad: marcá dos puntos del eje y escribí su valor.»

Hacé esto: marcá un punto a la altura de **0,5 m/s** del eje y escribí `0.5`; después marcá el de
**1,0 m/s** y escribí `1.0`.

**Tiene que pasar**:
- aparece una **línea punteada rotulada «0»** a la altura del cero, **aunque no la hayas marcado**;
- un clic a la altura de **1,0 m/s** da **1,0 m/s**.

**Antes** tenías que acertarle a la línea de base con el mouse y sólo se te pedía **un** valor.

**Probá también los dos rechazos**: dos marcas con el **mismo** valor, y dos marcas **casi a la
misma altura**. Las dos tienen que dar un mensaje de una línea y no calibrar.

## 11 · El modo M apaga la herramienta Velocidad (C)

Abrí un **modo M** (el eje vertical en centímetros).

**Tiene que verse**: el botón **Velocidad** **apagado**, y al pasarle el mouse por encima, el motivo
—«el eje vertical está en centímetros»—. El globo ⓘ lo explica con más palabras.

**Tiene que NO pasar**: que Velocidad se apague sobre una imagen **2D** normal. Ahí sigue
disponible, con el mensaje de siempre al intentar medir.

## 12 · El FAC del VD (D)

**2D → Área**. Mirá la tercera fila del selector.

**Tiene que verse**: cuatro opciones — **AI**, **AD**, **VD diást.** y **VD sist.**

Elegí **VD diást.** y trazá el contorno del VD en telediástole. Después **VD sist.** y trazá el de
telesístole.

**Tiene que verse**, en el panel de la derecha, una tabla de **tres filas**:
- **Área VD telediastólica** — en cm²
- **Área VD telesistólica** — en cm²
- **FAC VD (%)** — calculada, en cursiva y sin botones

**Tiene que NO pasar**:
- que el FAC aparezca con **una sola** área medida;
- que se escriba **nada** en la pestaña VD. Andá a **VD/AD** y comprobá que «Área VD
  telediastólica», «Área VD telesistólica» y «FAC VD» siguen **vacíos**. Si alguno se llenó,
  **frená y avisá**.

Probá además trazar la **sístole más grande** que la diástole: tiene que salir un aviso de una línea
sobre las fases invertidas.

⚠️ **El rótulo dice «FAC VD (%)» y no «FAC del VD (%)»**, que es como la app lo llama en su
formulario. Si lo preferís con «del», decilo: hay que cambiarlo en los dos lugares a la vez
(`docs/PENDIENTES.md` → **M3-a**).

## 13 · «Volumen» ya no está (A6)

**2D**. Mirá la fila de herramientas.

**Tiene que verse**: Distancia, Área y Simpson. El botón **«Volumen»** —el que estaba apagado con la
leyenda «próximamente»— **ya no está**.

## 14 · La banda de «Vmax pulmonar» (E)

**Doppler / M → Velocidad → Pulmonar**. Apretá el **✏️** de «Vmax pulmonar» y escribí **`90`**.

**Tiene que pasar**: que **no se guarde** y que el aviso diga el rango —**0,2 a 8 m/s**—. Es un
filtro contra errores de tipeo, **no** un corte diagnóstico: cualquier estenosis pulmonar real cae
muy por debajo de 8.

Escribí ahora **`3.2`**: tiene que entrar normalmente.

⚠️ **Las dos velocidades de la insuficiencia pulmonar siguen SIN banda**, a propósito: la app no
acota esas dos magnitudes en ninguna parte y elegirle los extremos es una decisión clínica tuya.
Está anotado en `docs/PENDIENTES.md` → **M3-b**.
