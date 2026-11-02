# Fichas de los casos TC-609 a TC-612 — tanda CORR-EVID (2026-11-02)

Archivo propio porque `docs/mapa/tests-fichas.md` está en 34,2 KB, a un paso del techo.

---

## TC-609 · el EN SUMA de la válvula reparada

**Qué fija.** Que el resumen nombre **siempre** la válvula intervenida en estilo corto, que la
insuficiencia vaya **en la misma línea**, que **no se repita aparte**, y que la estenosis conserve
su línea con el texto de siempre.

**Denominadores.** `valvRepSuma` expuesta; la tabla reparte las dos válvulas; el EN SUMA no está
vacío en cada escena; y el grado quedó efectivamente puesto —(B3) lo lee del campo—.

⚠️ **Los grados se fijan DESPUÉS del debounce.** `calcETE` deja agendado un repintado que pisa
`im_grado`: fijarlos antes los pierde y la escena mide otra cosa. Lo documenta la tanda E.

⚠️ **Y `esqSevManual` se vacía a mano entre escenas**: `limpiarCampos` no la borra, así que la
pastilla de severidad de la escena anterior sobrevive.

**Controles negativos.** (A4) una morfología nativa devuelve cadena vacía; (A5) una prótesis
tampoco entra por acá —tiene su propia línea—; (E1) con morfología nativa la línea suelta de la
insuficiencia **sigue saliendo**, y (E2) no aparece ninguna línea «VM con …».

---

## TC-610 · una pregunta, una guía

**Qué fija.** La regla **E-1** sobre las **tres** tablas: cada pregunta declara una sola `guia`,
su `rec` no nombra la otra, y la línea de referencia cuelga siempre de una pregunta regida por la
guía más nueva (**E-2**). Más el molde: el rótulo primero, la referencia rotulada «(anterior)» y
la frase de **E-4**.

⚠️ **LAS TABLAS SE LEEN DE `window` Y SE EXIGE QUE ESTÉN.** Sin esa guarda, el filtro corre sobre
un array **vacío** y devuelve cero mezclas: un denominador de cero que se lee igual que «no hay
mezclas». **Es el defecto que la sonda de esta tanda tuvo**, y por eso las tres tablas pasaron a
nivel de script.

**Controles negativos.** (E4) con la pregunta contestada, la frase de «sin dato» **no** aparece;
(E5) sin guía declarada, el molde **no inventa** un rótulo.

---

## TC-611 · nada de la Evidencia llega al papel

**Qué fija.** Que el informe, el EN SUMA y la cápsula de pantalla de la transposición no lleven
clase, nivel, folio ni el nombre de la guía.

⚠️ **EL CONTROL POSITIVO ES LA MITAD DEL CASO.** (A3) y (A4) exigen que el **panel** SÍ publique
«Clase 1 » y «folio e191». Sin ellos, el cero de abajo no distingue «el papel está limpio» de «no
hay nada escrito en ninguna parte». La mutación 15 los rompe.

**Denominadores.** El panel se arma, tiene más de diez preguntas y al menos dos bloques; y el
informe no está vacío.

---

## TC-612 · los símbolos del dibujo y el rótulo de la miocardiopatía

**Qué fija.** Que `popVTipoCorto` devuelva su clave para cada opción y **cadena vacía** para lo
que no tiene símbolo; que los velos del TEER, de la TAVI, de la biológica y de la mecánica sean
**distintos entre sí**; que los dos orificios del TEER se abran con la apertura; y que el rótulo
de la fila del conteo de factores mayores diga **2024** y ya no 2020 —medido sobre el **DOM**, que
es lo que el médico ve, y no sobre una constante—.

⚠️ **ESTE CASO PASA TAMBIÉN CONTRA HEAD, Y ES A PROPÓSITO.** Es un **guardián**: lo que mide ya
estaba bien —VAL-PPT-4 dibujó los símbolos y VAL-PPT-6 cambió el rótulo— y esta tanda lo midió
para contestar el inventario. El día que alguien los vuelva a mezclar, se pone rojo. Es el mismo
patrón que TC-563 bloque C de la tanda TGA.

**Controles negativos.** (A6) una morfología nativa no tiene símbolo; (B6) con la válvula cerrada
los velos de la mecánica no dependen del tipo; (C3) el rótulo ya no dice 2020.
