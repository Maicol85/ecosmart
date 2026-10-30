# Ficha del caso TC-555 — TANDA AORTA-2 (2026-10-30)

> Archivo propio porque `docs/mapa/tests-fichas.md` está en **34,2 KB**, a 800 bytes del techo de
> 35 KB. Mismo criterio que las fichas 550 a 554.

## Qué fija

Los tres commits de la tanda, en cinco bloques con denominador propio y controles negativos:

| Bloque | Qué fija |
|---|---|
| **A** (18 condiciones) | La unión sinotubular y la aorta ascendente por sexo con la Figura 5, la frase «por encima del límite superior de lo normal» en las tres superficies, la franja sin sexo por sus **dos** bordes, el chip de los dos segmentos propios y sus dos globos con los ocho tramos |
| **B** (9) | La coartación en el EN SUMA esté o no integrada, descriptiva, y sin «sin alteraciones» con bicúspide o coartación presentes |
| **C** (13) | Los cinco umbrales de la Tabla 68 una sola vez cada uno, las nueve filas de factores y sus tres estados sin inferir |
| **D** (3) | Las seis casillas fuera de la pantalla, los seis campos guardados vivos y «Nuevo estudio» vaciándolos |
| **E** (2) | Un estudio sin aorta no nombra la aorta en ningún estilo |

## Cae contra HEAD por 26 condiciones y NINGUNA por excepción

Verificado en un worktree sobre `ad0067f`, con el mismo archivo de tests.

⚠️ **La lista de ausentes no existe en el árbol anterior.** Leerla sin guarda mataba el caso con
un `TypeError` y el informe decía «EXCEPCION» en vez de decir qué invariante se rompió — que es
exactamente la lección que la tanda TEP pagó con TC-546. Las cuatro lecturas de `vabFactores()`
van con `|| {}` y `|| []`.

## Los cuatro defectos propios del caso, y los cuatro son trampas de método

1. **El EN SUMA se lee DESPUÉS de `generarInforme`**, porque es el mismo emisor el que lo
   escribe (`_infEscribir('en_suma', …)`). La primera versión leía antes, así que el bloque B
   medía el resumen del bloque anterior — y eso se lee igual que «la línea no se emite».
2. **El acento grave dentro del comentario del caso.** Costó dos corridas. El cuerpo es un
   template literal y un backtick lo cierra, con un `SyntaxError` que apunta decenas de líneas
   antes. `check_backticks.py` no lo caza; `node --check` sí.
3. **El sexo va antes que el diámetro**, y se espera al barrido: los dos segmentos nuevos cortan
   por sexo y leerlos en el mismo tick da el corte del varón.
4. **El estilo de informe es estado de sesión** y el caso lo fija antes de cada lectura (lo pagó
   TC-547).

## Las dos condiciones que nacieron del barrido de mutaciones

**(A10b)** y **(A10c)** son los dos bordes de la franja sin sexo —33,0 mm, normal en los dos
sexos, y 38,0 mm, normal en el varón y por encima del límite en la mujer—. Sin ellas, la mutación
**04**, que le devuelve a esa franja su comparación escrita con el `>=` de la raíz, **sobrevivía**:
las escenas que había (32 y 35 mm) dan lo mismo con las dos fórmulas.

## El barrido

`python3 scripts/_mut_ao2.py` — **14/14 muertas en el primer barrido**, en 3 min 19 s, en un
worktree y con guarda de md5 antes y después. **Cuatro de las catorce no revierten nada: la
aplican de más** (la 07 le pone el chip a todos los segmentos, la 09 mete la cita de la figura en
el papel firmado, la 11 publica la coartación también con la sección integrada y la 12 le agrega
la clase y el folio a la línea descriptiva), porque las condiciones que las matan son controles
negativos.

La **03** y la **04** son el mismo error por dos puertas y van separadas a propósito: cada una
sobrevive si la otra la tapa.
