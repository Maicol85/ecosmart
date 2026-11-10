# Guía de prueba manual — PANT-32, el cajón de Documentos en Configuración

**De a uno, en este orden.** Abrí `ecosmart/index.html` en Chrome, entrá a la app y cargá un
paciente de prueba (nombre, documento, sexo y fecha) antes de empezar: varios pasos miran lo que
la app pone en el papel.

> ⚠️ **Antes del paso 1, si querés arrancar de cero**: Config → 📄 Documentos → «⬇ Exportar
> modelos» para guardar lo que tengas. Esta guía cambia modelos y agrega documentos propios.

---

## A · La regla de oro: nada cambió en los cuatro que ya estaban

1. **Informe → 📄 Documentos ▾.** Tiene que ofrecer las cuatro opciones de siempre, en el mismo
   orden: Constancia, cardioversión eléctrica, ETE con sedación, test de burbujas.
2. Abrí la **constancia** e «Imprimir». **Una hoja**, igual que antes.
3. Abrí el **ETE** e «Imprimir». **Tres hojas**, con «Antes del estudio» arrancando la hoja 2 y la
   declaración y las firmas juntas. Si algo de esto cambió, **pará y avisá**.

## B · La sección nueva

4. **Config.** Entre «🖼️ Imágenes del estudio» y «🖥️ Modo de visualización» tiene que haber una
   tarjeta **«📄 Documentos»**, con el mismo borde y el mismo título en mayúsculas que las demás.
5. Al pie de la tarjeta: «El texto de cada documento es responsabilidad de la institución que lo
   usa.»
6. La lista trae **cuatro filas**. Cada una con su nombre, las etiquetas «Constancia» o
   «Consentimiento» y «Viene incluido», el interruptor «Mostrar en el menú» y «Editar». **Ninguna
   tiene «Borrar».**
7. Arriba de la lista: «4 de 6 documentos».

## C · El interruptor del botón

8. **Apagá** «Mostrar el botón Documentos en el Informe». Andá al **Informe**: el botón «📄
   Documentos ▾» **no está**.
9. **Recargá la app** (F5) y volvé al Informe: sigue sin estar.
10. Volvé a Config, **prendelo**, y andá al Informe: está otra vez, con sus 44 px de alto.
11. Volvé a Config y comprobá que la lista **sigue con sus cuatro documentos**: apagar el botón no
    borra nada.

## D · Ocultar y mostrar

12. **Destildá** «Mostrar en el menú» en la cardioversión. La fila gana una etiqueta ámbar
    **«Oculto en el menú»** y el cupo sigue diciendo «4 de 6 documentos».
13. Andá al Informe → 📄 Documentos ▾ **sin recargar**: hay **tres** opciones y la cardioversión
    no está.
14. Volvé a Config y **tildala** otra vez. En el Informe vuelven a ser cuatro.
15. Destildá **las cuatro**. En el Informe, el menú dice **«No hay documentos visibles.»**.
16. Volvé a tildarlas.

## E · Editar un documento incluido

17. **Config → Editar** en la cardioversión. El editor abre **en la misma pantalla**, con
    «← Volver a Documentos» arriba, el editor a la izquierda y **«Así se ve con un paciente de
    ejemplo»** a la derecha, que dice **«3 hojas»**.
18. La vista previa muestra un paciente **inventado** («Paciente de Ejemplo»), **no** el tuyo.
19. Las cinco preguntas están con su texto. Cambiá algo en «¿Qué es?» y mirá la vista previa: se
    actualiza en menos de un segundo.
20. **Escribí a propósito** `<b>prueba</b>` en una pregunta. En la vista previa tiene que verse
    **con los signos de menor y mayor, como letras**: si se ve en negrita, **pará y avisá**.
21. **Cancelá.** Pregunta «¿Salir sin guardar?». Decí **que no**: el editor queda abierto. Decí
    **que sí**: cierra y vuelve la lista.
22. Volvé a **Editar** la cardioversión, cambiá el primer párrafo por algo reconocible —por
    ejemplo «Esto lo escribió la institución.»— y tocá **Guardar**.
23. **Informe → 📄 Documentos ▾ → cardioversión.** La hoja tiene que traer tu texto. «Imprimir»:
    el PDF también.
24. Volvé a Config → Editar la cardioversión → **↩ Volver al texto original**. Pregunta; aceptá.
    El texto original aparece en el editor **pero todavía no está guardado**: tocá **Cancelar** y
    volvé a abrir el documento desde el Informe — tu texto sigue ahí.
25. Repetí el paso 24 pero tocando **Guardar**. Ahora sí: el documento volvió al original.
26. Comprobá los otros tres documentos: la constancia **una hoja**, el ETE y las burbujas **tres**.

## F · Las convenciones de escritura

27. **Editar** el test de burbujas. En «¿Qué es?» pegá estas líneas, tal cual:

```
Un párrafo normal.

• una viñeta
• **Importante:** otra viñeta

☐ Sí ☐ No  primera casilla
☐ Sí ☐ No  segunda casilla

Otros datos a completar:
________

Un párrafo con **una palabra** en negrita.
```

28. En la vista previa tienen que verse: dos viñetas con su punto (la segunda con «Importante:» en
    **negrita**), **dos casillas en dos columnas** con sus cuadrados dibujados, una **raya** debajo
    del rótulo, y «una palabra» en negrita.
29. **Guardá** e «Imprimí» ese documento desde el Informe: el papel tiene que verse igual, con los
    cuadrados **dibujados** y **sin asteriscos**.
30. Volvé a **↩ Volver al texto original** y **Guardá**, para dejarlo como estaba.

## G · Las piezas

31. **Editar** el ETE. Abajo, «Piezas que agrega la app» con sus tres casillas tildadas y el aviso
    «Si tu texto ya trae declaración, firmas u hojas comunes, destildá esas piezas…».
32. **Destildá «Tabla de firmas»** y mirá la vista previa: la tabla de tres columnas desaparece y
    queda **la firma del médico** con su matrícula.
33. **Destildá «Hojas comunes»**: la hoja de «Niño o paciente imposibilitado» y la de «Negativa /
    revocación» desaparecen, y el documento baja de hojas.
34. **Destildá «Declaración del paciente»**: el bloque «Declaro que:» desaparece.
35. **Cancelá** (no guardes) y comprobá que el ETE sigue con sus tres hojas.

## H · Un consentimiento propio

36. **Config → ＋ Agregar documento.** Aparece «¿Qué querés agregar?» con **Constancia**,
    **Consentimiento** y **Cancelar**, los tres con 44 px.
37. **Consentimiento.** El editor abre con el título «Consentimiento para » y **cinco preguntas
    vacías**, cada una diciendo «Vacía: esta pregunta no se imprime.».
38. Completá el título («Consentimiento para una prueba») y **sólo la primera** pregunta, con dos o
    tres párrafos. Dejá las otras cuatro vacías.
39. En la vista previa tiene que salir **sólo** esa pregunta, numerada **1**, y ninguna sección
    vacía.
40. Tocá **＋ Agregar pregunta**: aparece una fila más al final. Tocá su **✕**: se va. (Tocá
    **una** vez cada botón; si una sola vez agrega dos, **pará y avisá**.)
41. **Guardar.** Pregunta el nombre. Dejalo **en blanco** y aceptá: avisa «El nombre no puede
    quedar vacío.» y no guarda.
42. **Guardar** otra vez y poné «Prueba propia». La lista pasa a **cinco filas**, la nueva con la
    etiqueta **«Propio»** y con **«Borrar»**. El cupo dice «5 de 6 documentos».
43. **Informe → 📄 Documentos ▾.** «Prueba propia» aparece **última**, después de las cuatro.
44. Abrila. La hoja trae el encabezado con la institución centrada, la **línea del paciente**, tu
    pregunta, la declaración —que dice «**el procedimiento**» y no el nombre del estudio—, la tabla
    de firmas y las hojas comunes.
45. **Corregí algo a mano** en la hoja y «Imprimir»: el PDF trae tu corrección. Volvé a Config: el
    **modelo** no cambió (la corrección vale sólo para ese paciente).
46. **Guardar en Imágenes.** Si el estudio todavía no está guardado, tiene que **decir el motivo**.
    Guardá el estudio y probá otra vez: en **Guardados → Imágenes guardadas** la miniatura se llama
    **«Prueba propia»**.

## I · El tope de dos propios

47. **＋ Agregar documento → Constancia.** Completá el texto, **Guardar**, nombre «Constancia
    propia».
48. El cupo dice **«6 de 6 documentos · Para agregar otro, borrá uno propio.»** y
    **＋ Agregar documento** queda **apagado**.
49. **Borrá** «Prueba propia». Pregunta nombrándola y diciendo que no se puede deshacer. Aceptá: el
    cupo vuelve a «5 de 6» y el botón se vuelve a activar. En el Informe ya no está en el menú.

## J · Una constancia propia en el papel

50. Abrí «Constancia propia» desde el Informe e «Imprimir». **Una hoja**, con el encabezado, la
    frase con los datos del paciente (si dejaste su casilla tildada), tu texto y la firma del
    médico **bien separada** abajo.
51. Volvé a Config → Editar esa constancia y **destildá** «Frase con los datos del paciente». En la
    vista previa la frase desaparece y queda sólo tu texto. **Cancelá**.

## K · Un documento largo

52. **Editar** la «Constancia propia»… no: **Editar** un propio de tipo consentimiento (si lo
    borraste, creá otro) y pegá **mucho** texto en una pregunta —diez o quince párrafos—.
53. En la vista previa, el texto tiene que **correr de una hoja a la siguiente sin cortes
    forzados**, y la **declaración junto con la tabla de firmas** tienen que quedar **en la misma
    hoja**: si no entran donde terminó el texto, pasan **completas** a la siguiente. Si quedan
    separadas, **pará y avisá**.
54. Las **hojas comunes** siempre arrancan en una hoja nueva.

## L · Exportar e importar

55. **Config → ⬇ Exportar modelos.** Baja `ecosmart_modelos_documentos_<fecha>.json`.
56. **Abrí el archivo con un editor de texto.** Tiene que traer tus textos y **ningún dato de
    paciente**, ningún nombre de institución, ningún médico y ninguna imagen. Si ves algo de eso,
    **pará y avisá**.
57. **Borrá** tus documentos propios y volvé un incluido editado a su original.
58. **⬆ Importar modelos** y elegí el archivo. Pregunta «Esto reemplaza los documentos que tenés
    ahora…». Aceptá: **todo vuelve** — los propios con su nombre, el incluido con su texto, y los
    ocultos ocultos.
59. Probá importar **cualquier otro .json** (por ejemplo un backup de informes). Tiene que decir
    «Este archivo no es de EcoSmart o está dañado. No se cargó nada.» y **no cambiar nada**.
60. Abrí el archivo exportado con un editor, **borrale la última llave** `}` y guardalo. Importalo:
    el mismo mensaje, y nada cambia.
61. Abrí el archivo exportado, **duplicá** la lista de propios hasta tener **tres**, guardalo e
    importalo: tiene que decir «Este archivo trae más de 2 documentos propios y EcoSmart permite
    hasta 2. No se cargó nada.».
62. Abrí el archivo, poné en el nombre de un documento `<b>Nombre</b>` y en un texto
    `<script>alert(1)</script>`, guardalo e importalo. Aceptá. En la lista, en el menú del Informe
    y en la hoja, eso tiene que verse **como letras**. Si aparece un cartel o algo en negrita,
    **pará y avisá**.

## M · El celular

63. Angostá la ventana a unos **390 px** (o abrilo en el teléfono). En Config → Documentos: todo en
    **una columna**, los botones **grandes** (se tocan sin apuntar), y **sin barra de desplazamiento
    horizontal**.
64. Abrí el editor en ese ancho: la vista previa queda **debajo** del editor, no al costado.

## N · Que nada más se movió

65. **Nuevo estudio.** Config → Documentos: la lista y el interruptor **siguen igual** — los
    modelos no son del estudio.
66. Generá un informe completo y exportá su **PDF** y su **Excel**: tienen que salir como siempre.
67. **Laboratorio → PDF de auditoría** y **PPT**: igual que antes.
