# Guía de prueba manual — tanda TGA-4 (2026-11-02)

Catorce pasos. Un dato por línea, con el nombre exacto de cada pestaña, panel y botón, el ancho
de ventana y qué tiene que verse. **Abrir `index.html` en Chrome y recargar con Ctrl+Shift+R.**

| # | ancho | dónde | qué hacer | qué tiene que verse |
|---|---|---|---|---|
| 1 | 1440 px | pestaña **C. Congénitas** → sub-pestaña **CC complejas** → sección **Transposición de grandes arterias** | elegir **Tipo: Transposición completa (d-TGA)** y **Cirugía: Switch auricular (Mustard o Senning)**; cargar **Diámetro basal del VD 45 mm** y **Función del VD sistémico: Normal** | la fila **Conclusión**, bajo los campos, dice el tipo, la cirugía, la función y el diámetro — y **NO** dice «seguimiento anual» ni ninguna otra conducta |
| 2 | 1440 px | la misma sección | poner **Bloqueo auriculoventricular completo: Sí** | la conclusión agrega **«Bloqueo auriculoventricular completo»** y **NO** «complicación esperable en la ccTGA…» |
| 3 | 1440 px | la misma sección | poner **Obstrucción subaórtica: Sí** y **Gradiente subaórtico 60 mmHg** | la conclusión dice **«Obstrucción subaórtica con gradiente de 60 mmHg»** y **NO** «por encima de 50 mmHg — intervención a considerar» |
| 4 | 1440 px | la misma sección, recuadro del dibujo | el **modelo 3D** y el **Esquema ilustrativo** se ven uno al lado del otro; tocar **📄 Incluir en el PDF** | el botón pasa a **✓ Incluido en el PDF** y debajo aparece «Este cuadro se incluye en el PDF…» |
| 5 | 1440 px | botón **📎 Integrar al informe** de esa sección, y después **Generar PDF** | abrir el PDF generado | en la hoja **«Cardiopatias congenitas»**, bajo el texto, los **DOS dibujos lado a lado**; debajo, una línea con el escenario, las comunicaciones y **«Esquema ilustrativo: no es una imagen del estudio ni está a escala.»** |
| 6 | 1440 px | la misma sección | tocar otra vez **✓ Incluido en el PDF** y volver a generar el PDF | **no entra ninguno de los dos dibujos**: el botón es uno solo para los dos |
| 7 | 1440 px | la misma sección | tocar **🫀 Corazón normal (referencia)** | el botón **📄 Incluir en el PDF** queda **deshabilitado**, con el aviso «La vista de referencia no se incluye en el informe» |
| 8 | 1440 px | la hoja del PDF de congénitas | mirar el **recuadro de la conclusión** | empieza directamente por la conclusión: **ya no dice «Segun la guia:»** |
| 9 | 1440 px | pestaña **Válvulas** | poner **Morfología de la válvula pulmonar: Prótesis biológica** y generar el PDF | en la **primera hoja**, la caja de la derecha del bloque de tres se titula **«Tricúspide / PSAP / Válv. pulmonar»** |
| 10 | 1440 px | la misma caja, sin ningún dato de válvula pulmonar | borrar `Morf. VP`, `V. máx VP` y `G. máx VP`, y generar el PDF | el título vuelve a ser **«Tricúspide / PSAP»** a secas |
| 11 | 1440 px | botón **📋 Evidencia** (arriba a la derecha) → sección **Transposición de grandes arterias — indicaciones y seguimiento** | mirar la lista de preguntas | **una línea por pregunta**, con **tres botones «Sí · No · ?»**, una **etiqueta de guía** al lado del texto, y **cuatro rótulos de grupo** —Síntomas y función, Túnel y vías venosas, Ventrículo sistémico y hemodinamia, Ritmo y dispositivos— |
| 12 | 1440 px | el mismo panel | tocar **Sí** en la primera pregunta, y después **?** | el contador de arriba pasa de **«0 en Sí · 0 en No · 18 sin dato»** a **«1 en Sí · …»** y vuelve a **«0 en Sí · 0 en No · 18 sin dato»**; la lista **«Recomendaciones que aplican con lo contestado»** aparece y desaparece |
| 13 | 1440 px | el mismo panel | tocar el **ⓘ** de una pregunta, y después **⤢ Maximizar** y **⇔ columnas** | el ⓘ abre la guía, la clase, el nivel, la hoja y el folio **debajo de esa fila**; maximizado el panel se parte en **dos columnas**, y el botón las alterna. La frase «no se guarda con el estudio» se dice **una sola vez**, al pie |
| 14 | 390 px | el mismo panel, y las secciones **Comunicación interauricular** y **Comunicación interventricular** | recorrerlas | las tres se ven compactas y **sin barra horizontal**; a este ancho los botones caen en su propia línea y el panel es más largo que a 1440 — está declarado en `docs/PENDIENTES.md` → T4-h |

## Lo que NO tiene que haber cambiado

- El **informe narrativo**, el **EN SUMA**, el **Excel** y el **PPT**: idénticos, salvo las dos
  frases del commit 1 (el prefijo del recuadro y la cláusula de la ccTGA).
- El panel de la **válvula aórtica bicúspide**: sigue con dos botones por pregunta y con su
  aviso en cada una. Comparte el molde y **no se tocó**.
- El **Laboratorio**: clasifica la transposición por la misma rama que antes.
