# Ficha de TC-554 — la tanda AJUSTES-1 (2026-10-30)

Archivo propio porque `docs/mapa/tests-fichas.md` estaba en **34,2 KB**, medido antes de
escribir: a 800 bytes del techo de 35 KB que este repositorio se fijó.

---

## Qué fija

Las cinco zonas que los commits 1 a 5 tocan, cada bloque con su **denominador** —lo que impide
que «no aparece» y «no se midió» se lean igual— y con sus **controles negativos**.

| bloque | qué fija | su control negativo |
|---|---|---|
| **A** · la orejuela | el cactus sin riesgo y con su `value` intacto; los tres lóbulos sin la nota de complejidad en los TRES estilos y en el EN SUMA; la pastilla sin veredicto; el recuadro del Doppler ausente sin velocidad y el lienzo en 262 | (A2) el ala de pollo y la coliflor **conservan** su riesgo; (A6) con trombo y sin medidas la pastilla dice «Completar mediciones»; (A7) **con** velocidad el recuadro sí está y el lienzo mide 350 |
| **B** · el PDF | el dibujo junto a su tabla y sin repetirse; el resumen al lado cuando la sección no está integrada; la VAB a la izquierda con su tabla al costado y el bloque en menos de 70 mm | (B5) sin datos de orejuela el dibujo entra **sin** resumen; (B4) el resumen no lleva etiquetas de riesgo ni de aptitud |
| **C** · el EN SUMA | la bicúspide nombrada **una** vez, en línea propia o unida a la dilatación | (C3) sin bicúspide el EN SUMA sale como siempre y `vabSumaFrase()` devuelve `null` |
| **D** · la cita | el rótulo nuevo con los dos folios y el matiz de «falla significativa» | (D2) el **papel** no lleva el rótulo ni la cita; (D3) el **otro** criterio de esa zona sigue «sin fuente verificada» |
| **E** · la fila | visible sólo con inclusiones, con su contador, sus etiquetas, su título accesible, sus flechas enfocables, el quitar-sin-borrar y el reordenado que el PDF respeta | (E0) sin inclusiones no se ve; (E7) «Nuevo estudio» la vacía y la esconde |
| **F** · global | un estudio **ajeno** no menciona nada de esta tanda | (F1) su denominador: el informe sale |

---

## Cómo cae y cómo sobrevive

- **Contra HEAD (`ac5d1b4`) cae por 26 de sus condiciones y NINGUNA por excepción.** Las que
  pasan en los dos árboles son los denominadores y los controles negativos, que es lo que tienen
  que hacer.
- **Las 14 mutaciones dirigidas lo ponen rojo**, cada una por las condiciones que le tocan:
  `01→(A1)`, `02→(A4)`, `03→(A5)(A6)`, `04→(A8)+(A9)`, `05→(A8)(A9)`, `06→(A7)`, `07→(B2)`,
  `08→(B1)`, `09→(B5)`, `10→(B7)(B8)`, `11→(C0)(C1)(C2)`, `12→(C3)+`, `13→(D1)`, `14→(E5)(E6)`.

---

## Advertencias de método que el caso lleva escritas

1. **El estilo de informe es estado de SESIÓN** y el caso lo fija antes de cada lectura: un caso
   anterior puede dejarlo en narrativo, donde las frases dicen otra cosa. Lo pagó TC-547.
2. **No se llama a los calculadores a mano** para fabricar un disparador: los campos se ponen
   despachando `input`, que es el gesto real. Lo pagó TC-519.
3. **Incluir el esquema en el PDF es un interruptor** y `imgSlots` sobrevive entre bloques: se
   quita antes de incluir, siempre.
4. **Las miniaturas se operan clickeando sus botones**, no llamando a `infMinMover`.
5. **El espía del PDF guarda COORDENADAS**, no sólo textos: lo que el commit 2 mueve es la
   composición, y un espía de palabras le sale idéntico.
6. **Las dos capturas de prueba son distintas entre sí** y su firma se toma del MEDIO del
   dataURL: todos los PNG terminan en `BJRU5ErkJggg==`, así que una rebanada del final no
   distingue el orden.
7. **Sin acentos graves** ni en el comentario de cabecera ni en el cuerpo: los dos viven dentro
   de un template literal.

---

## Los casos viejos que esta tanda adaptó

| caso | qué afirmaba | qué afirma hoy, y por qué |
|---|---|---|
| **TC-78** | «sale la nota de complejidad» con tres lóbulos | **invertido**: se dicen los lóbulos y la conducta NO está, ni en el informe ni en el EN SUMA |
| **TC-553 (A7)(A8)** | que el gate del trombo frenara la nota, y que sin trombo apareciera | **invertidas**: no aparece en ninguno de los dos escenarios, con el mismo denominador |
| **TC-504 (H5)(H8)** | `VAB fenotipo R-L (rafe calcificado).` en el EN SUMA | la frase larga, con el conteo de apariciones como guarda de que se dice una vez |
| **TC-506 (E3)(E4)** | ídem, y `, normofuncionante` | la frase larga y «sin estenosis ni insuficiencia», que es la palabra que el resumen de pantalla ya usaba |
