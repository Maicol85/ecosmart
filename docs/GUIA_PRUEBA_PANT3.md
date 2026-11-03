# Guía de prueba manual — tanda PANT-3

Un dato por línea. Abrí `index.html` en Chrome con la ventana en **1440 px de ancho**, salvo
donde diga otra cosa.

1. Pestaña **🧬 C. Congénitas → CC complejas**, sección **«CIA / CIV — Comunicación
   interauricular e interventricular»**: los botones **CIA** y **CIV** tienen que verse **sin
   relleno**, con el borde del tema.
2. En esa sección cargá **Tipo de CIA = Ostium secundum** y **Tamaño máximo = 18**; andá a
   **📄 Informe** y comprobá que el informe **NO menciona la CIA**.
3. Volvé y tocá el botón **CIA**: tiene que quedar **pintado entero de verde** y aparecer la
   pastilla **«📎 en el informe»** en el encabezado de la sección.
4. Mirá el informe otra vez: ahora tiene que decir **«CIA tipo ostium secundum. Tamaño máximo 18
   mm.»** y el EN SUMA **«CIA ostium secundum 18 mm.»**, **sin** haber tocado «Integrar al
   informe».
5. Cambiá a la pestaña **〰️ Doppler** y volvé a **CC complejas**: el botón **CIA** tiene que
   seguir **pintado**. (Antes se desmarcaba solo: ése era el defecto.)
6. Tocá **«📎 Integrar al informe»** al pie de la sección: el PDF suma su hoja aparte de
   congénitas. El informe **no cambia**.
7. Tocá el botón **CIA** otra vez: se **desmarca**, los campos **siguen cargados** y el
   formulario **sigue a la vista**. El informe deja de mencionar la CIA.
8. Guardá el estudio y volvé a abrirlo desde **Guardados → Editar**: el botón **CIA** tiene que
   volver con su estado.
9. Achicá la ventana a **390 px**: los botones **CIA** y **CIV** tienen que **seguir visibles** y
   medir al menos 44 px de alto. (Antes desaparecían por debajo de 768 px.)
10. Sección **«TGA — Transposición de grandes arterias»**: cargá **Tipo = TGA completa (d-TGA)**,
    **Cirugía = Switch arterial (Jatene)**, y en «CIA / CIV» y «DAP» dejá cargadas la CIA, la CIV
    y el ductus. En el esquema de circulación, **ningún rótulo** —«venas pulm.», «AP», «Ao»,
    «cavas», «CIA», «CIV», «DAP»— tiene que quedar **tapado por una línea punteada**.
11. En esa misma tarjeta, abrí el **ⓘ** del esquema de circulación: **no** tiene que aparecer el
    bloque **«A tener en cuenta»** ni ninguna frase sobre una revisión pendiente. El resto del
    globo —los colores, las comunicaciones, las dos exclusiones— sigue.
12. Encendé **«Incluido en el PDF»** del diagrama y generá el PDF: el esquema de circulación
    entra, con sus rótulos legibles y sus colores.
13. Al pie del bloque de congénitas, en **cualquiera de las dos sub-pestañas**, tiene que haber
    **un solo** botón **«🫀 Ver en 3D»**.
14. Tocalo: se abre un panel con el **mismo** diagrama de la transposición. Debajo, la línea tiene
    que nombrar las lesiones cargadas que todavía no dibuja (por ejemplo **«Cargadas y no
    dibujadas todavía: CoAo, MCH.»**). Con el estudio vacío dice **«Sin lesiones cargadas que
    dibujar»**.
15. Cambiá de pestaña y volvé a la sección **TGA**: el diagrama tiene que estar **de vuelta en su
    lugar** y el panel cerrado.
16. Generá el informe con el panel abierto: **nada** del panel tiene que aparecer en el informe,
    el EN SUMA ni el PDF.
17. Sección **«MCH — Miocardiopatía hipertrófica»**: tiene que verse en **tres columnas**
    —hipertrofia, obstrucción y factores de riesgo de muerte súbita— y, debajo, **dos cuadros
    lado a lado**. Los textos largos ya no están: en su lugar hay **seis ⓘ**.
18. Abrí el ⓘ de **«Factores de riesgo de muerte súbita»**: tiene que decir que el realce tardío
    **no** es uno de los cinco factores mayores y que interviene **cuando no hay ninguno**. Y en
    la tarjeta **«📋 Ver criterios»**, la tabla «Dónde no coinciden» tiene que rotular su columna
    americana **«AHA/ACC 2024»**.

---

## Segunda mitad de la tanda — commits 6 a 10

**MCA — miocardiopatía arritmogénica** (CC frecuentes)

19. Abrí la sección: los **criterios ecocardiográficos** tienen que verse en **dos columnas** y
    la **conclusión a la derecha**, en una columna propia. Los **criterios no ecocardiográficos**
    van **debajo, a todo el ancho**, con sus cinco categorías **tres arriba y dos abajo**.
20. La pantalla **no** tiene que decir «Prevalencia 1/2000», «El Task Force exige» ni los
    umbrales repetidos. Tocá el **ⓘ** que está junto al botón «📋 Ver criterios»: ahí está lo
    que decía.
21. Tocá el **ⓘ** del título «Criterios estructurales ecocardiográficos»: tiene que traer los
    umbrales **una sola vez**, con «te Riele … hoja 3 de 15», y decir que la tabla publica
    además cortes **indexados por superficie corporal** que la app **no aplica**.

**TdF — tetralogía de Fallot reparada**

22. La pantalla **no** tiene que decir «Acá no hay campos de volumen»: la sección **tiene** dos
    campos de volumen, y los dos siguen ahí con su «Criterio ESC 2020: ≥160 ml/m²».
23. El **ⓘ** del grupo de volúmenes trae «hoja 51, folio 613» y la frase de que ese corte
    **puede no correlacionar con beneficio clínico**.
24. La **conclusión** está a la derecha, en su columna.

**Estenosis subaórtica y supravalvular**

25. En la **subaórtica**, tocá el **ⓘ** que está junto a «Gradiente medio (mmHg)». Tiene que
    decir, con todas las letras: **el 40 es MEDIO** y es criterio de intervención (ESC 2020,
    hoja 41, folio 603, **Clase I · Nivel C**, y la guía lo bajó de 50 a 40); **el 50 es PICO**
    y **no tiene clase ni nivel** (ACC/AHA 2025, hojas 43 y 53, folios e157 y e167), y que
    **ningún dato identifica un umbral de gradiente**.
26. En la **supravalvular**, su **ⓘ** tiene que decir que la guía **no publica un recuadro de
    recomendaciones propio** para esa lesión.
27. Cargá **Gradiente medio = 40** en la subaórtica: la conclusión tiene que decir **severa**,
    igual que antes. **Ningún corte se movió.**

**⚡ Arritmia ventricular** (es la **primera** sección de CC frecuentes)

28. Comprobá que está **arriba de todo**, con su botón **«⌫ Limpiar»** y su tarjeta de tres
    filas «qué aporta a cada sección».
29. El primer campo se llama ahora **«Parada cardíaca o TV documentada»**.
30. Poné **Sí** y, en **Tipo**, elegí **«Parada cardíaca recuperada»** (es el valor nuevo).
    Elegí también **Morfología = BCRI con eje superior**.
31. Andá a **MCH**: el campo **«Parada cardíaca o TV sostenida previa»** tiene que mostrar
    **«Sí»** y estar **bloqueado**, con su explicación al pasar el mouse.
32. Andá a **MCA**: el criterio **mayor** de arritmias tiene que estar **sin marcar**, y la
    línea de resumen dice **«La parada no aporta criterio»**.
33. Volvé al módulo y cambiá el Tipo a **«Sostenida»**: ahora el criterio mayor de MCA **sí** se
    marca. Ése es el control que separa una cosa de la otra.
34. Cambiá a **«No sostenida»**: el **«Sí»** de MCH se retira solo y el campo vuelve a ser
    editable. Contestá **«Sí»** vos mismo, volvé a **«Ambas»** y después a **«No sostenida»**:
    **tu «Sí» tiene que seguir ahí**.
35. Con el tipo en **«Parada cardíaca recuperada»**, mirá el **informe**: tiene que decir
    **«Parada cardíaca recuperada, morfología de …»**, y **no** nombrar ninguna guía ni
    recomendar nada.
36. Tocá **«Limpiar»**: los cuatro campos del módulo quedan vacíos.
37. En cualquiera de las tres secciones, tocá **«Editar»** en la línea «⚡ Arritmia ventricular»:
    tiene que llevarte al módulo, abierto.

**Rótulos de las presiones pulmonares**

38. En **Doppler tricuspídeo / pulmonar**, el campo de la presión media se llama **«PmAP
    estimada (mmHg)»** y el de la diastólica **«PDAP — auto (mmHg)»**.
39. En **CIA/CIV**, **ductus** y **ventana aortopulmonar**, donde decía «PAPs» ahora dice
    **«PSAP»**.
40. En **Referencias**, la tabla de definición hemodinámica tiene la columna **«PmAP»** y la
    ficha dice **«Cociente TAPSE/PSAP»**.
41. **Control:** abrí el **Excel** del Laboratorio. La columna tiene que seguir llamándose
    **«PAP media (mmHg)»** — los encabezados del Excel **no cambian**.
42. **Control:** en la CIV, «PA sistémica (mmHg)» sigue igual: es presión **sistémica**, no
    pulmonar.
