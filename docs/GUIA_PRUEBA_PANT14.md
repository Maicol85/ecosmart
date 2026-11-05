# Guía de prueba manual — PANT-14 (2026-11-05)

Un dato por línea. Abrí `index.html` en Chrome y en Safari. El ancho de ventana se indica en cada
paso; donde no se indica, 1440 px.

---

## El esquema de circulación ya no sale negro (commit 1)

1. Pestaña **C. Congénitas** → sub-pestaña **CC frecuentes**. Al pie, apretá **🫀 Ver en 3D**.
2. En la barra del dibujo, apretá el botón **◫** (a la derecha del lienzo) para abrir el
   **esquema de circulación**. → Las seis cajas (**Pulmones, VD, AI, AD, VI, Cuerpo**) tienen el
   fondo de tarjeta, **no negro**, y el texto de cada una se lee.
3. Las dos **válvulas T y M** son dos circulitos con el fondo de tarjeta y su letra legible, **no
   negros**.
4. Apretá **🌙 Noche / ☀️ Día** arriba a la derecha. → El esquema **cambia de paleta en el acto**:
   las cajas pasan a blanco en Día y a gris oscuro en Noche, y el texto sigue legible en los dos.
5. Angostá la ventana a **390 px** y volvé a 1440. → Las cajas siguen con su color; nada queda
   negro.
6. En la sub-pestaña **CC complejas**, sección **Transposición de grandes arterias**, poné
   **Tipo = Mustard o Senning (switch auricular)**. Volvé a CC frecuentes y mirá el esquema.
   → **Dibuja**, y las cajas dicen **VD sistémico, Aurícula (venas pulm.), Túnel (cavas) y VI**.
   *(Antes de esta tanda el esquema no se dibujaba con esa variante y quedaba el de la anterior.)*
7. Sección **Anomalía de Ebstein**: poné **Desplazamiento = 14**. Mirá el esquema. → La válvula
   **T** es un círculo **dorado** y su letra se lee (antes era blanca sobre amarillo).

## El botón «Incluir en el PDF» (commit 2)

8. **🆕 Nuevo Estudio** → **🗑 Continuar sin guardar**. Cargá **Nombre** y **Documento**.
9. Sub-pestaña **CC complejas** → sección **CIA / CIV**: **Tipo de CIA = Ostium secundum**.
10. Volvé a **CC frecuentes** y apretá **🫀 Ver en 3D**. → El módulo abre en **«Según el estudio»**
    (el botón de ese modo queda marcado).
11. En la barra, el botón **«Incluir en el PDF»** está **activo**. Apretá **«Explorar»**.
    → El botón se **apaga** y debajo aparece el aviso de que está disponible sólo en «Según el
    estudio».
12. Volvé a **«Según el estudio»** y apretá **«Incluir en el PDF»**. → Dice **«✓ Incluido en el
    PDF»**, queda verde, y debajo dice que el PDF llevará este dibujo.
13. Apretá **⬇️ PDF** arriba a la derecha → **✓ Confirmar** en la tarjeta de severidades.
    → El PDF trae una hoja con el **dibujo del corazón** y el **esquema de circulación** al lado,
    con la etiqueta «Corazón en 3D de congénitas». **Los colores son los del dibujo, no negro.**
14. Borrá el **Tipo de CIA** (dejalo en «—») y volvé a CC frecuentes. → El botón se **apaga** y el
    aviso dice que no hay lesiones cargadas.

## La transposición (commit 3)

15. **Nuevo estudio**. En **CC complejas** → **Transposición**: **Tipo = d-TGA**.
16. En **CIA / CIV** cargá **Tipo de CIA = Ostium secundum** y **Tipo de CIV = Perimembranosa**.
17. Volvé a CC frecuentes, abrí el módulo. → El dibujo muestra la transposición **con las dos
    comunicaciones**. El botón «Incluir en el PDF» está **apagado** con su aviso: el dibujo de la
    transposición se incluye desde su propia sección.
18. Volvé a la Transposición y poné **Tipo = Mustard o Senning**. Mirá el módulo. → Ahora dibuja
    la **CIV** y **no** la CIA, que es lo que hace el 3D de la pestaña.
19. En la Transposición, poné **Obstrucción subaórtica = Sí**. → En el dibujo aparece un **anillo
    gris** por debajo del origen de la aorta, y en el esquema una **barra gris** rotulada
    «obstr. subaórtica».
20. La sección **Transposición** **conserva su propio recuadro 3D y su esquema**: no se retiró.

## Las siete lesiones conectadas (commits 4 a 6)

21. **Nuevo estudio**. En **CC complejas** → **Tetralogía de Fallot reparada**: **Función del VD =
    Normal**. En **Válvulas**, **IP — grado = Severa**. Volvé y abrí el módulo.
    → Dibuja la **Fallot operada** con el chorro de insuficiencia pulmonar.
22. **Guardá el estudio** (💾), hacé **Nuevo estudio** y **reabrilo** desde **📁 Guardados**.
    → El dibujo vuelve a mostrar la Fallot con su chorro, igual que antes de guardar.
23. **Nuevo estudio**. En **CC frecuentes** → **Coartación de aorta**: **Diámetro del istmo = 8**
    y **dejá la situación en «—»**. Abrí el módulo. → **No dibuja la coartación**, y la línea
    debajo del dibujo dice **«coartación (falta consignar si es nativa o reparada)»**.
24. Poné **Situación = Nativa**. → Ahora **sí** la dibuja y la línea deja de nombrarla.
25. **Nuevo estudio**. En **Válvulas**, poné la **velocidad pulmonar máxima = 1,0 m/s**. Abrí el
    módulo. → **No** dibuja ninguna estenosis pulmonar (una velocidad normal no es una estenosis).
    Subila a **3,5** y poné **Nivel = Valvular** → ahora la dibuja.
26. **Nuevo estudio**. Cargá a la vez **Transposición: Tipo = d-TGA** y **Fallot: Función del VD =
    Normal**. Abrí el módulo. → Dibuja la **transposición** (gana por prioridad) y la línea dice
    **«No se dibujan juntas — Fallot: no se dibuja junto con transposición de grandes arterias»**,
    **sin** afirmar que esté todo dibujado.
