# Fichas de los casos TC-572 a TC-576 — tanda CONG-2A

Archivo propio porque `docs/mapa/tests-fichas.md` está en **34,2 KB**, a 800 bytes del techo.

---

## TC-572 · lo que se desmarca, y la matriz de congénitas

**Qué fija.** Que desmarcar el tipo de fusión de la válvula bicúspide deja el resumen de la
sección **siguiendo a la morfología de Válvulas**, y que las otras secciones de congénitas no
retienen nada al vaciar un campo.

**Sus denominadores.** (A0) los dos campos del cruce existen · (A1) limpio, la morfología está en
su valor de fábrica · (A2) limpio, el resumen no nombra la válvula · (B1) al elegir el tipo la
morfología pasa a «Bicúspide» · (B2) y el resumen la nombra con su fenotipo · (H0) los cuatro
campos ajenos **mueven** alguna superficie al ponerse.

**Sus controles negativos.** (F1) y (F2) la morfología puesta **a mano**, con el tipo nunca
tocado, publica lo mismo que tras desmarcar — es lo que prueba que (C) no es un residuo del tipo.
(G1) y (G2) una morfología que el médico sí eligió —TAVI— no se pisa, y el aviso lo dice.

⚠️ **(H) MEDÍA SOBRE UN DENOMINADOR VACÍO Y HUBO QUE REESCRIBIRLO.** La primera versión barría
cuatro campos sobre un formulario **en blanco**, y los tres que existían salían **MUDOS**: sus
secciones tienen compuertas. Un campo que no mueve nada al ponerse no puede probar nada al
vaciarse. Hoy el basal de cada campo es **su sección sembrada sin ese campo**, que es lo que la
matriz completa de la tanda hace. Y `coa_tipo`, que la primera versión usaba, **no existe**.

---

## TC-573 · la pantalla de la TGA

**Qué fija.** Los once campos en el orden que el médico pidió, las **seis** filas con la cirugía
visible, las **cinco llenas sin hueco** cuando se esconde, el párrafo corto en pantalla con sus
palabras textuales en el ⓘ, y que «Conclusión» quedó fuera de la fila de dos columnas.

**Sus denominadores.** (A0) el acordeón abierto · (A1) la fila y la grilla existen · (A2) la
grilla tiene caja · (E3) el globo de la sección tiene texto.

**Sus controles negativos.** (B2) ningún campo lleva `tabindex` para forzar el orden —el orden del
marcado es el visual— · (D5) el valor de la cirugía **no se borra** al esconderse el campo.

⚠️ **Las tres trampas de denominador que la TGA-1 documenta y este caso respeta:** la sección vive
en la sub-pestaña «CC complejas» y hay que abrir las **dos** pestañas por su botón real; el
acordeón se abre y se registra **después**; y las transiciones de `.sacc-body` dan un rect de
mitad de la animación, así que se quitan antes de medir.

---

## TC-574 · el 3D de la TGA

**Qué fija.** Que el dibujo queda dentro de su tarjeta **también al vaciar el tipo** —que es como
se reproduce el defecto—, que sin tipo se dibuja el corazón normal y no se puede incluir en el
PDF, y que la CIA entra por su pestaña y la CIV por cualquiera de las dos.

**Sus denominadores.** (A0) el acordeón abierto · (A1) la librería entró al abrir la sección ·
(B1) sin tipo **ya hay** un canvas dibujado · (E0) con el formulario vacío no hay ninguna
comunicación en las tres anatomías.

**Sus controles negativos.** (E3) con el switch auricular la CIA **no** se dibuja · (E6) con el
Rastelli la CIV **no** se dibuja · (E7) y el Rastelli conserva su propio túnel · (E9) «CIV
residual» en «No» no dibuja nada · (F1) y (F2) la vista de referencia lo declara y no va al PDF.

⚠️ **(B7) Y (B8) NACIERON DE UNA MUTACIÓN QUE SOBREVIVIÓ.** La 10 revierte el corazón normal por
omisión y el caso seguía en verde: (B1) ve el canvas —que existe porque lo crea `tga3dInit`,
dibuje o no— y (B2) lee el **texto**, que sale de la bandera y no de la anatomía. Lo que discrimina
es el **contenido**: la escena del corazón normal rotula VD, VI, Ao y AP, y una escena sin anatomía
se queda con los dos rótulos auriculares que se empujan antes de las ramas.

⚠️ **Y la mutación 07 obligó a romper las DOS mitades.** El corazón normal por omisión **tapa** al
blindaje del recuadro: con la librería cargada, la rama «todavía no hay dibujo» no corre nunca.
Ver `C2A-b`.

---

## TC-575 · los cuatro dibujos de los criterios TEER

**Qué fija.** Que los cuatro dibujos están acotados, a la derecha de su campo cuando la ventana lo
permite, que los catorce campos entran en el alto de su maqueta sin scroll interno, que los cuatro
números siguen a sus campos y quedan legibles, y que **ni una etiqueta, ni un corte, ni un
veredicto se movió**.

**Sus denominadores.** (A0) la sección abierta · (B0) los cuatro dibujos con caja · (C0) los
catorce campos con caja.

**Sus controles negativos.** (E1) las tres etiquetas que el médico conserva siguen presentes ·
(E2) los cortes de exclusión de los dibujos siguen · (E3) los cuatro rótulos de campo no cambiaron.

⚠️ **(B2b) NACIÓ DE UNA MUTACIÓN QUE SOBREVIVIÓ.** La 13 devuelve la fila a `display:block` y el
caso seguía en verde, porque el suite corre por debajo de 900 px y ahí lo que acota el dibujo es el
`max-width` del apilado, no la maqueta. Lo observable en **cualquier** ancho es el `display`
computado de la fila.

⚠️ **Y DOS EXPECTATIVAS ERAN DEL ESCENARIO Y NO DEL INVARIANTE.** (B1) exigía 150 px fijos, que es
el valor del lado a lado; hoy se mide la **regla** con `matchMedia`. Y (E1) fijaba el conteo
1/3/2, que es el de la sección **vacía**; con los criterios cargados cambia, así que lo que se
exige es que las tres sigan **presentes**, que es la decisión expresa del médico.

⚠️ **(D2): la caja de un `<text>` de SVG fuera de la pantalla da 0 con `getBoundingClientRect`**,
así que la legibilidad se mide con el glifo escalado — `font-size` del SVG por el ancho renderizado
sobre el ancho del `viewBox` —, que es lo que decide si se lee.

---

## TC-576 · el papel de la miocardiopatía hipertrófica

**Qué fija.** Que el informe en los tres estilos, el EN SUMA en los tres y la hoja del PDF no
nombran guía, sociedad, clase ni desfibrilador; que **ningún número medido desaparece**; y que la
recomendación sigue en la Evidencia con sus folios.

**Sus denominadores.** (A0) la conclusión se emite · (A1) el score está **calculado**, no
incompleto · (A2) la casilla de integrar está marcada · (A3) el informe publica el bloque · (E0)
la sección de muerte súbita del panel publica líneas.

**Sus controles negativos.** (F1) y (F2) un estudio **sin** miocardiopatía no nombra factores
mayores y su conclusión no se emite.

⚠️ **TRES DENOMINADORES COSTARON UNA CORRIDA CADA UNO.**
1. **`amiloIntegrar` es un TOGGLE** y sobre un módulo ya integrado **retira**: llamarlo a ciegas
   sacaba la miocardiopatía del informe, que salía en 483 caracteres sin una palabra de ella.
   La miocardiopatía llega al papel por su casilla `mch_incluir_chk`, no por el registro.
2. **El score pide `edad` y `ai_diam`**, no `mch_edad` ni `mch_ai`, que no existen.
3. **La TVNS del score NO sale de `mch_tvns`**, que es un espejo, sino del **bloque compartido de
   arritmia ventricular** —`tvEstado` lee `tv_documentada`, `tv_tipo` y `tv_morfologia`—. Sin eso
   el score salía «incompleto» con un único faltante, y el comentario de `mchScoreESC` lo dice.
4. **Y (C5) pedía algo que su escenario no dice**: con el familiar con miocardiopatía establecida,
   esa rama **no publica la edad** —dice que el criterio se cumple con independencia de ella—.
   Hoy mide que la oración siga entera y que nombre el score por lo que es.
