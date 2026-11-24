# Guía de prueba manual — tanda PR6 (2026-11-23)

Para Maicol, en Chrome, con `index.html` abierto como archivo local. **18 pasos.** Lo que cada paso
espera está medido y cubierto por TC-1035 a TC-1041; esto es para verlo con los ojos.

---

## El texto «tipo Word» y los dos botones (TAREA 3)

1. Cargá un estudio con datos: nombre, edad, sexo, **peso y talla** —sin los dos no hay superficie
   corporal y los indexados no salen—, los diámetros de la aorta, la aurícula izquierda, el
   ventrículo izquierdo, el derecho, el Doppler mitral y el aórtico.
2. Andá al **Informe** y apretá el botón de los **cuatro cuadraditos** (a la derecha de
   «Evidencia»). Se abre la tarjeta **«Cuadros del informe»**.
3. Abajo, en el **pie** de la tarjeta, mirá los **dos botones chicos**: **🔢** y **📋**. Pasale el
   mouse por encima: cada uno explica lo que copia.
4. Apretá **🔢**. Tiene que salir un aviso **«✅ Copiado»**. Pegalo en el Bloc de notas o en el
   sistema del sanatorio: tiene que ser **un título por sección** y debajo **una línea** con los
   datos separados por « - », cada uno como «Etiqueta: valor unidad».
   **Comprobá que NO haya**: el nombre del paciente, su edad, ni ningún hallazgo de válvula («IM
   moderada», «Calcificada», el pericardio, las masas). Sí tiene que estar la **Geometría**.
5. El orden de las secciones tiene que ser exactamente: **Aorta · Aurícula izquierda · Ventrículo
   izquierdo · Ventrículo derecho · Aurícula derecha y VCI · DOPPLER · Válvula mitral · Válvula
   aórtica · Válvula tricúspide y pulmonar**.
6. Generá el informe (**«Regenerar Informe»**), escribí algo en el **EN SUMA**, y apretá **📋**.
   Pegalo: tiene que venir el informe, una línea en blanco, **«EN SUMA:»** y el EN SUMA.
   Con el EN SUMA vacío tiene que venir **sólo el informe**, sin el rótulo.
7. ⚠️ **La prueba que importa:** quitá **tres** cuadros con su ✕ y volvé a apretar **🔢**. El texto
   copiado tiene que ser **exactamente el mismo**: la copia **no depende** de los cuadros quitados
   ni de cómo los hayas ordenado.
8. Cargá un estudio **casi vacío** —sólo el DDVI— y apretá **🔢**: tiene que salir **una** sección
   con **una** línea. Una sección sin datos no sale, y una etiqueta sin valor no se imprime.

## El interruptor «Incluir resumen de válvulas» (TAREA 2)

9. En el mismo pie de la tarjeta está el interruptor **«Incluir resumen de válvulas»**. Tiene que
   venir **apagado**.
10. Con él **apagado**, exportá el PDF. Tiene que salir **exactamente como hoy**: los doce cuadros y
    **ninguna** fila de válvula aparte.
11. Prendelo, cerrá la tarjeta y exportá el PDF otra vez. Ahora, **después** de los doce cuadros,
    tiene que salir una fila con **Válvula Mitral · Válvula Aórtica · Válvula Tricúspide**, con sus
    morfologías, grados, velocidades, gradientes y la cuantificación de la insuficiencia.
    ⚠️ **Esa fila repite números que los cuadros ya publican en sus líneas de válvula** — es la
    consecuencia aceptada de la orden, y por eso viene apagado.
12. Apretá **«Restablecer»**: el interruptor **sigue prendido**. Ese botón restablece el **orden** y
    los **cuadros quitados**, no esto.
13. Apretá **«Nuevo estudio»**: **sigue prendido**. Vale para todos los estudios.
14. **Recargá la página** (⌘R): vuelve a **apagado**. No se guarda en ningún lado.

## El noveno estilo de PDF (TAREA 4)

15. Andá a **Configuración → Diseño del informe PDF**. Ahora hay **nueve** miniaturas; la novena es
    **«Tipo Word»**, con su silueta de renglones de texto. Elegila.
16. Exportá el PDF. En lugar de los doce cuadros tiene que salir **el mismo texto del paso 4**, con
    los **títulos de sección en negrita y subrayados** y **cada renglón en su propia línea**.
    Después van el informe y el EN SUMA, con el **mismo encabezado, pie y firma** que los otros.
    ⚠️ **Probá a seleccionar el texto con el mouse dentro del PDF y copiarlo**: es texto de verdad,
    no una imagen, y las líneas tienen que quedar **separadas** al pegarlas.
17. Con el estilo «Tipo Word» puesto, **prendé el interruptor del paso 9** y exportá otra vez: el
    PDF tiene que salir **idéntico**. Ese estilo **ignora** el resumen de válvulas, por orden
    expresa.

## La Evidencia y la frase que salió del papel (TAREA 5)

18. Cargá una estenosis aórtica **severa por área** y abrí la **Evidencia** → **«Estenosis
    aórtica»**. Abajo, en «Ver detalle», tienen que estar las **cuatro notas nuevas**: el **score de
    calcio por TAC en la rama paradojal** (con su clase y sus folios), la **medición incorrecta del
    tracto de salida**, el **repaso de las integrales velocidad-tiempo** y la **discordancia de
    grado**. Cada una nombra su guía con su hoja y su folio.
    Después, montá una **discordancia de grado** —poné el grado en «moderada» con mediciones
    severas, por ejemplo Vmax 4,6 y gradiente medio 55— y regenerá el informe: la oración tiene que
    decir que el grado consignado no coincide con las mediciones, **con todos sus números y el grado
    que correspondería**, y **ya NO** tiene que decir «Revisar el diámetro del tracto de salida y el
    trazado de las integrales velocidad-tiempo.». Lo mismo en el **EN SUMA** y en el **PDF**.
    ⚠️ **El aviso de la pantalla no se tocó**: la cápsula sigue avisando.
