# Guía de prueba manual — tanda PANT-13

Un dato por línea, **26 pasos**. Abrí `index.html` en Chrome y seguilos en orden.

## El corazón maestro y «Explorar» (commits 1 y 2)

1. Pestaña **C. Congénitas** → botón **«Corazón en 3D»**: el módulo abre y el dibujo late.
2. Tocá **«Explorar»**: a 1440 px hay **tres zonas** —«Base» a la izquierda, el dibujo en el medio,
   «Se suma» a la derecha—; a ~1000 px pasa a **dos** columnas con el dibujo arriba; a ~500 px todo
   **apilado** y sin barra horizontal.
3. La **barra de herramientas** del medio va en **una sola fila**: los dos modos, la vista de
   frente, la pausa, «Por dentro», «Nombres», **FC**, el botón del PDF y el globo ⓘ.
4. El campo **FC** es corto —78 px— y ya no se lleva una fila para él solo.
5. Debajo del dibujo, **«Combinaciones frecuentes»**: cada botón trae su **sigla**, y el **nombre
   completo** al pasar el mouse.
6. Tocá el botón de la esquina del dibujo: el **esquema de circulación** abre **al lado** y no
   debajo.
7. Marcá **Eisenmenger** en «Se suma»: en el esquema la corriente **se invierte** y la arteria
   pulmonar se dilata.
8. Los rótulos del dibujo **no se despegan** al abrir y cerrar el esquema ni al cambiar de modo.
   (Era el defecto del punto 1.)
9. Todos los textos del módulo llevan **tilde**: «Corazón normal», «Anomalía de Ebstein»,
   «Transposición de grandes arterias».

## La transposición dentro del módulo (commit 4)

10. En «Base», elegí **«Transposición de grandes arterias»**: aparecen **cinco** variantes —d-TGA
    sin cirugía, Jatene, Mustard o Senning, Rastelli, ccTGA—.
11. Con **d-TGA** podés marcar CIA, CIV y ductus en «Se suma».
12. Con **Mustard o Senning** la **CIA queda apagada**, y la fila dice por qué.
13. Con **Rastelli** la **CIV queda apagada**: ahí la CIV ya **es** el túnel.
14. La línea de abajo ya **no** dice que la transposición «tiene su propio diagrama».
15. En **«Según el estudio»**, la sección de la transposición conserva su **recuadro propio**, con
    su esquema y su botón de PDF. (No se retiró: ver `P13-c`.)

## El botón del PDF del módulo (commit 3)

16. En **«Explorar»** el botón **«Incluir en el PDF»** está **apagado**, y el aviso dice que lo
    explorado es didáctico.
17. En **«Según el estudio»** con el formulario **vacío**, sigue apagado y lo dice.
18. Cargá una **CIA** en «CIA / CIV» y volvé al módulo: el botón se **habilita**; tocalo y generá
    el PDF —el dibujo aparece **con sus rótulos**—.
19. Cargá además una **transposición**: el botón del módulo vuelve a **apagarse**, porque ese
    dibujo entra por la sección de la transposición.

## Masas (commit 5)

20. Pestaña **Otros** → **Masas**: la tabla **«Cómo distinguirlas (referencia)»** está **cerrada**,
    con la flecha ▶; al tocar su título abre con ▼ y sus **siete** filas.
21. Tocá el globo ⓘ de al lado: la ayuda abre y la tabla **sigue abierta**.
22. En toda la sección **no** queda ninguna frase del tipo «no coinciden», «difieren» o «sin
    resolver»: cada fuente dice lo suyo en su propia oración.

## El pulmón (commit 6)

23. Pestaña del **eco pulmonar** → consolidación **Sí**, lado **Derecho**, **Con broncograma
    aéreo**: el broncograma se dibuja en **puntitos** dentro de la mancha, y los del bronquio
    principal son **más grandes** que los de las ramas. Con **Sin broncograma** no queda ninguno.
24. Tocá **«Incluir el diagrama en el PDF»** y generá el PDF: el diagrama aparece. Con **«Nuevo
    estudio»** el botón vuelve a **apagarse**.

## Las variantes anatómicas (commit 7)

25. Pestaña **Otros** → **Variantes anatómicas**: las **siete** van en **tres** columnas a 1440 px,
    **dos** a ~800 px y **una** en el teléfono, y ninguna muestra su «Detalle (opcional)». Marcá
    **«Hipertrofia lipomatosa»**: aparece **sólo su** caja; escribí algo y **desmarcá** la casilla
    —la caja **no se esconde** y el texto sigue ahí—; borrá el texto y se esconde.
26. La **«Vena cava superior izquierda persistente»** no tiene caja de detalle (ver `P13-b`), y las
    notas del **aneurisma del septum** y de la **circunfleja retroaórtica** se ven **siempre**.
