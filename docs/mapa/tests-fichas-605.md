# Fichas de TC-605 a TC-608 — tanda VAL-PPT (2026-11-02)

Archivo propio, porque `tests-fichas.md` está en 34,2 KB y agregarle una sección lo cruzaría.

---

## TC-605 · las cuatro opciones nuevas y sus tres listas paralelas

**Qué fija.** Que las dos opciones de la mitral y las dos de la tricúspide existen; que entran
en las **tres** listas paralelas (el `<select>`, `LAB_XLS_LISTAS` y `VALV_MORF_FRASE`); que
caen al ramal **nativo** de graduación; y que el selector del posoperatorio las ofrece **por
válvula** sin tocar a la pulmonar.

**Denominador.** `(A0)` exige los cuatro selects de morfología y `(B0)` que `LAB_XLS_LISTAS` sea
visible; `(C4)` exige que la cápsula de estenosis mitral diga algo con morfología nativa —sin
eso, «el TEER gradúa igual» compararía dos cadenas vacías—; `(D0)` exige los cuatro selectores
del posoperatorio.

**Controles negativos.** `(A5)` la aórtica **no** ofrece plastia; `(A6)` la pulmonar sigue con
sus siete opciones; `(A7)` la aórtica conserva TAVI; `(C3)` una prótesis **sí** es prótesis —o
el predicado estaría diciendo que no a todo—; `(C6)` la prótesis **no** gradúa con cortes
nativos; `(D4)` la pulmonar ofrece sólo el vacío y las dos prótesis; `(D5)` **ningún** selector
ofrece una morfología nativa, que es lo que POP-B-2 vino a cerrar.

**Lo que lo pone rojo.** Las mutaciones 01, 02, 03, 04, 05, 06 y 22.

---

## TC-606 · el papel describe, y el EN SUMA deja de negar

**Qué fija.** Que el cuerpo describe el tipo con las palabras de la app; que el **acrónimo no se
destruye**; que el EN SUMA **deja de negar** una mitral intervenida que es el único hallazgo; y
que ningún valor viejo cambia.

**Denominador.** `(A0)` el informe se emitió (más de 100 caracteres); `(E0)` el resumen ya habla
de la mitral por su estenosis; `(F0)` ídem por su insuficiencia.

**Controles negativos.** `(D1)` el estudio vacío sigue diciendo «sin alteraciones»; `(D2)` la
prótesis mecánica sigue subiendo con su redacción; `(D3)` la prótesis no dice plastia ni TEER;
`(D4)` su línea sale **una** sola vez.

**⚠️ DOS CONDICIONES NACIERON DEL BARRIDO.**
- `(E1)` medía `vecesVM <= 1` y **no podía fallar**: sin la guarda el resumen gana la línea
  larga del cuerpo **además** de la sigla, o sea UNA aparición contra CERO. Hoy exige **cero**.
- El bloque `(F)` entero nació de la mutación 08, que sobrevivió dos veces: la escena sin
  lesiones no puede mostrar el duplicado, porque `reusar` no vuelve a empujar una línea que ya
  está. Con una insuficiencia cargada el resumen dice «IM leve» —una sigla— y la línea del
  cuerpo es otra, así que ahí sí se duplicaría.

**Lo que lo pone rojo.** Las mutaciones 07, 08, 08b y 09.

---

## TC-607 · los símbolos del dibujo y las etiquetas del TEER

**Qué fija.** Que `popVTipoCorto` devuelve el tipo de cada opción; que el dibujo prende las
piezas de cada tipo y **apaga las de los demás**; y que las tres etiquetas del TEER salen del
papel **sin salir de la pantalla**.

**Denominador.** `(B0)` existe el grupo de la válvula mitral del dibujo; `(C0)` la **pantalla**
trae al menos tres etiquetas —sin eso, el cero del papel no prueba nada—; `(C1)` el bloque del
papel tiene más de 200 caracteres.

**Controles negativos.** `(A5)`, `(A6)` la mecánica y la biológica siguen dando lo suyo; `(A7)`,
`(A8)` una morfología nativa y el vacío **no** tienen tipo corto; `(B3)`, `(B4)`, `(B6)`, `(B8)`
cada tipo apaga las piezas de los otros; `(B7)` sin tipo el círculo queda **punteado**; `(C6)`
la pantalla conserva su título de aptitud.

**⚠️ `(B5b)` NACIÓ DE LA MUTACIÓN 12**, que sobrevivió: `(B5)` mira que el **aro** esté prendido,
y dibujar además el círculo entero lo deja prendido igual. Lo que distingue una plastia de una
prótesis es que el círculo esté **apagado**.

**Lo que lo pone rojo.** Las mutaciones 10, 11, 12, 13, 14, 15 y 16.

---

## TC-608 · la regla del PPT, el número opcional y el rótulo de 2024

**Qué fija.** Que `igPptDisposicion` elige la disposición de mayor área sin deformar; que la
casilla del número existe, nace encendida y no es campo del estudio; y que el rótulo de la
miocardiopatía hipertrófica dice **2024**.

**Denominador.** `(A0)` la función existe; `(B0)` existe la casilla «Armar PPT» —la columna sale
temprano con ella apagada, así que hay que encenderla antes de buscar la del número—; `(C0)`
existe la fila del conteo.

**Controles negativos.** `(A1)` dos apaisadas siguen lado a lado; `(A2)` cuatro de eco 4:3 siguen
en grilla; `(A5)` sin relación de aspecto no revienta; `(C3)` el **score no se movió**: sigue
publicando sus cinco factores y sus árbitros.

**⚠️ `(A6)` ES EL CONTROL QUE DECIDE SI LA REGLA DISTINGUE.** En una hoja 16:9 el apilado no gana
nunca, así que `2x1` en todos los casos de dos no distinguiría una regla que funciona de una que
devuelve siempre lo mismo. Sobre una hoja **vertical** la misma función elige `1x2`.

**⚠️ `(C3)` falló en su primera versión por mi culpa**: pedía `aha.pres` y `aha.pend`, que son
las **variables internas** de `mchAHA`; sus claves reales son `presentes`, `pendientes` y
`arbitros`. El control fallaba sobre un score intacto.

**Lo que lo pone rojo.** Las mutaciones 17, 18, 19, 20 y 21.

---

## Trampas que estos cuatro casos pagaron

1. **El cuerpo de un caso devuelve `{ extra: [...] }`, no el array pelado.** Con el array, el
   runner avisa «el caso no declara NINGUNA condición», que es justo para lo que ese guardián
   está. Los cuatro salieron así la primera vez.
2. **La barra escapada no sobrevive al template literal.** `/AHA\/ACC 2024/` llega al navegador
   como `/AHA/ACC 2024/`: la regex cierra en la segunda barra y «ACC 2024/» son flags inválidos
   —«Invalid regular expression flags»—. Se cerró **no usando ninguna expresión regular**.
3. **El acento grave dentro de mi propio comentario**, dos veces. `node --check` las cazó.
