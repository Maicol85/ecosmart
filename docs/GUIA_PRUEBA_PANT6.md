# Guía de prueba manual — tanda PANT-6 (2026-11-03)

Un dato por línea. Cada paso dice **qué tocar** y **qué tiene que verse**. Nada acá reemplaza la
suite ni las sondas: esto es para que el médico vea con sus ojos lo que la tanda cambió.

Abrir `index.html` en Chrome, con la ventana en **1440 px de ancho** salvo donde diga otra cosa.

---

## La pantalla de «CIA / CIV» (commit 1)

1. Pestaña **C. Congénitas** → sub-pestaña **CC complejas** → sección **CIA / CIV**.
   Se ven **dos cuadros con borde**, la CIA a la izquierda y la CIV a la derecha.
2. **Sin tocar ningún botón**, los dos cuadros están a la vista y **todos** sus campos se pueden
   escribir.
3. Tocar el botón **CIA**. Se enciende, y **ningún cuadro desaparece**.
4. Tocar el botón **CIV**. Se enciende, y **ningún cuadro desaparece**.
5. Apagar el botón **CIV**. Se apaga, y **los dos cuadros siguen a la vista** con sus campos.
   (Antes de esta tanda, apagar la CIV dejaba los dos paneles y apagar la CIA escondía los campos
   de la CIV: eso es lo que se arregló.)
6. Debajo de los dos cuadros hay un **tercer cuadro de borde fino**: «Cuantificación del shunt —
   común a CIA y CIV», con el Qp/Qs y el DDVI indexado.
7. **La PSAP por insuficiencia tricuspídea aparece UNA sola vez**, en el cuadro de la CIV.
8. Bajar la ventana a **768 px**: los dos cuadros se **apilan**, la CIA arriba.
9. Volver a 1440. Escribir el tamaño de una CIA **sin tocar ningún botón** y generar el informe:
   **la CIA no aparece**. Tocar el botón CIA y volver a generar: **ahora sí**.

## El dibujo de sobrecarga del VD (commit 2)

10. Pestaña **Hemodinámica** → sección del **TEP / sobrecarga del VD**. Cargar TAPSE y VD/VI.
11. El dibujo está **a la derecha**, y es **mucho más grande** que antes: ocupa unos 520 px.
12. **Los rótulos del dibujo se leen**. (Antes salían en 2,6 px.)
13. Los campos están **a la izquierda, en dos columnas angostas**, y **la lista de criterios quedó
    debajo de ellos**, en la misma columna.
14. Bajar a **768 px**: el dibujo se **apila** debajo de los campos.
15. ⚠️ **A 1000 px el dibujo es más chico y su letra queda por debajo de 12 px.** Está declarado en
    `docs/PENDIENTES.md` → **P6-b**, y no se tocó.

## La Evidencia de la estenosis mitral, con el molde nuevo (commit 3)

16. Cargar un área valvular mitral por planimetría de **1,2 cm²** y un gradiente medio de **12**.
17. Abrir el **panel de Evidencia**. La sección de estenosis mitral arranca con una **franja
    ámbar**: a la izquierda la **categoría que publica el informe**, a la derecha el **estadio**.
18. Debajo, una fila de **tarjetas con los datos del estudio**.
19. Debajo, las **preguntas agrupadas por tema**, en **dos columnas**; y al pie, la **tabla de
    recomendaciones** con el estado de cada fila.
20. **El estadio NO aparece dos veces**: está sólo en la franja.
21. En **Válvulas**, poner la morfología mitral en **«Calcificada»** y volver al panel.
    **La pregunta de síntomas sigue estando.** (Antes desaparecía: vivía dentro del bloque de la
    comisurotomía, que sólo se pinta con etiología reumática.)
22. Tocar el **ⓘ** al lado de «Síntomas»: dice **cuáles** síntomas cuentan según la AHA/ACC 2020,
    con su tabla y su folio, y que la ESC/EACTS 2025 **no los enumera**.
23. Sin contestar la pregunta, el estado **no** es «No»: se ve como pendiente.
24. Estrechar el panel por debajo de 900 px: las preguntas pasan a **una** columna.

## La mitral del ETE, en una sola sección (commit 4)

25. Pestaña **ETE** → la sección se llama ahora **«Morfología y mediciones — Válvula Mitral»** y es
    **una**: la de «Mediciones ETE — Válvula Mitral» ya no existe aparte.
26. Adentro, **tres columnas iguales**: etiología/Carpentier/mecanismo · los velos y las áreas ·
    el tenting, la coaptación y el anillo.
27. El cuadro **«características desfavorables para la reparación»** va **a todo el ancho**, debajo.
28. **El dibujo de la mitral sigue en su propia sección**, no se fundió.
29. Escribir **24** en la longitud del velo anterior y abrir **Criterios TEER**: el mismo valor
    está ahí. Cambiarlo en el TEER y volver: **el ETE lo tiene**.

## Los criterios TEER (commit 5)

30. Pestaña **Criterios TEER**. **Los dos cuadros se ven**: IM primaria a la izquierda, IM
    secundaria a la derecha.
31. Cambiar el **tipo de IM** entre vacío, primaria y secundaria: **los dos cuadros siguen a la
    vista** y todos sus campos se pueden escribir.
32. Arriba hay una **franja común** (tipo de IM, área mitral, PSAP); abajo, los **criterios
    comunes** a la izquierda y la **conclusión** a la derecha.
33. Con el tipo **primaria** y un flail gap de **12 mm**, la conclusión **deja de decir APTO**:
    el veredicto no cambió por la maqueta.

## El Forrester y los dos rótulos (commit 6)

34. Pestaña **Hemodinámica**, **sin** cargar el índice cardíaco ni la presión capilar.
    En pantalla, el perfil hemodinámico **dice qué falta**.
35. Integrar el bloque al informe y generarlo: **esa frase NO aparece** en el informe, ni en la
    hoja del PDF, ni en la diapositiva. (En la pantalla **sí se queda**, que es donde sirve.)
36. En el ETE, el campo dice **«Profundidad coaptación — reparación (mm)»**; en Criterios TEER,
    **«Profundidad coaptación — TEER (mm)»**.
37. Escribir **14** en el del TEER: **el del ETE queda vacío**. Son dos datos distintos con dos
    cortes distintos —10 y 11 mm— y **no** se sincronizan a propósito (**P6-f**).

## Las otras cinco válvulas (commit 7)

38. Cargar una **insuficiencia aórtica severa** con FEVI 48 y abrir el panel: su sección tiene la
    **misma** franja ámbar, las tarjetas de datos, las preguntas por tema y la tabla al pie.
39. Repetirlo con la **estenosis aórtica**, la **insuficiencia mitral primaria**, la **secundaria**
    y la **tricuspídea**: las cinco con el molde y **cada una con su pregunta de síntomas y su ⓘ**.
40. ⚠️ **La válvula pulmonar y la prótesis mitral siguen con la disposición anterior.** Está
    declarado en `docs/PENDIENTES.md` → **P6-a**, con el motivo de cada una.

## Lo que no tiene que haber cambiado

41. Generar el **informe en los tres estilos**, el **EN SUMA**, el **PDF** y el **PPT** de un
    estudio cargado: **nada de la Evidencia aparece en ninguno** —ni la franja, ni el estadio, ni
    las citas—. El papel describe.
42. Exportar el **Excel del Laboratorio**: **441 columnas**, las mismas de siempre.
43. Tocar **«Nuevo estudio»**: la pantalla vuelve limpia y **ninguna respuesta del panel sobrevive**.
